import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

// (Keep the interfaces and defaultForm as they are)
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  contactId?: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  company?: string;
}

const defaultForm: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'> = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  contactId: '',
};

const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State for filters, search, and sorting
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [filterContact, setFilterContact] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetching contacts and tasks with React Query
  const { data: contacts = [] } = useQuery<Contact[]>({ 
    queryKey: ['contacts'], 
    queryFn: async () => {
      const res = await apiService.getContacts();
      return res.contacts || [];
    }
  });

  const { data: tasks = [], isLoading, isError, error } = useQuery<Task[]>({ 
    queryKey: ['tasks'], 
    queryFn: async () => {
      const res = await apiService.getTasks();
      return res.tasks || [];
    }
  });

  const createTaskMutation = useMutation(
    (newTask: typeof defaultForm) => apiService.createTask(newTask),
    {
      onMutate: async (newTask) => {
        await queryClient.cancelQueries(['tasks']);
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];
        const optimisticTask = { ...newTask, id: 'temp-id', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        queryClient.setQueryData<Task[]>(['tasks'], [...previousTasks, optimisticTask]);
        return { previousTasks };
      },
      onError: (err, newTask, context) => {
        if (context?.previousTasks) {
          queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  const updateTaskMutation = useMutation(
    (updatedTask: Task) => apiService.updateTask(updatedTask.id, updatedTask),
    {
      onMutate: async (updatedTask) => {
        await queryClient.cancelQueries(['tasks']);
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];
        queryClient.setQueryData<Task[]>(['tasks'], previousTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
        return { previousTasks };
      },
      onError: (err, updatedTask, context) => {
        if (context?.previousTasks) {
          queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  const deleteTaskMutation = useMutation(
    (taskId: string) => apiService.deleteTask(taskId),
    {
      onMutate: async (taskId) => {
        await queryClient.cancelQueries(['tasks']);
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) || [];
        queryClient.setQueryData<Task[]>(['tasks'], previousTasks.filter(task => task.id !== taskId));
        return { previousTasks };
      },
      onError: (err, taskId, context) => {
        if (context?.previousTasks) {
          queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['tasks']);
      },
    }
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTaskMutation.mutate({ ...editingTask, ...form });
    } else {
      createTaskMutation.mutate(form);
    }
    setShowForm(false);
    setEditingTask(null);
    setForm(defaultForm);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    deleteTaskMutation.mutate(id);
  };

  // (The rest of the component remains largely the same, but uses the data from useQuery)
  // (The filtering, searching, and sorting logic will be updated to use the memoized tasks)

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesContact = filterContact === 'ALL' || task.contactId === filterContact;
        const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesContact && matchesStatus && matchesPriority && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'dueDate') {
          comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
        } else if (sortBy === 'priority') {
          const order = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
          comparison = order.indexOf(a.priority) - order.indexOf(b.priority);
        } else if (sortBy === 'status') {
          const order = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
          comparison = order.indexOf(a.status) - order.indexOf(b.status);
        } else if (sortBy === 'createdAt') {
          comparison = a.createdAt.localeCompare(b.createdAt);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [tasks, filterContact, filterStatus, filterPriority, searchTerm, sortBy, sortOrder]);

  // (The JSX part of the component remains the same)
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... same JSX as before ... */}
    </div>
  );
};

export default TasksPage;