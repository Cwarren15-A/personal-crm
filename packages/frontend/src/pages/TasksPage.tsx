import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

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

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];
const priorityOptions = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];
const sortOptions = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'createdAt', label: 'Created' },
];

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [filterContact, setFilterContact] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchContacts();
    fetchTasks();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await apiService.getContacts();
      setContacts(res.contacts || []);
    } catch (err) {
      setContacts([]);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      priority: task.priority,
      status: task.status,
      contactId: task.contactId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiService.deleteTask(id);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTask) {
        await apiService.updateTask(editingTask.id, form);
      } else {
        await apiService.createTask(form);
      }
      setShowForm(false);
      setEditingTask(null);
      setForm(defaultForm);
      fetchTasks();
    } catch (err) {
      alert('Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await apiService.updateTask(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return '';
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName || ''}` : '';
  };

  // Filtering, searching, and sorting
  const filteredTasks = tasks
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

  // Badge helpers
  const getStatusBadge = (status: Task['status']) => {
    const map: any = {
      PENDING: 'bg-gray-200 text-gray-800',
      IN_PROGRESS: 'bg-yellow-200 text-yellow-900',
      COMPLETED: 'bg-green-200 text-green-900',
      CANCELLED: 'bg-red-200 text-red-900',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };
  const getPriorityBadge = (priority: Task['priority']) => {
    const map: any = {
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-gray-200 text-gray-800',
      HIGH: 'bg-orange-200 text-orange-900',
      URGENT: 'bg-red-200 text-red-900',
    };
    return map[priority] || 'bg-gray-100 text-gray-800';
  };

  // Task detail modal
  const openDetailModal = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };
  const closeDetailModal = () => {
    setSelectedTask(null);
    setShowDetailModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* Filters, Search, Sort */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
          <select
            value={filterContact}
            onChange={e => setFilterContact(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Contacts</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName || ''} {contact.company ? `(${contact.company})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading tasks...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">Error: {error}</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative border-l-4 cursor-pointer ${
                task.status === 'COMPLETED'
                  ? 'border-green-400 bg-green-50'
                  : task.status === 'IN_PROGRESS'
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200'
              }`}
              onClick={() => openDetailModal(task)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-2 line-clamp-2">{task.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2 space-x-4">
                {task.dueDate && (
                  <span>
                    <strong>Due:</strong> {task.dueDate.slice(0, 10)}
                  </span>
                )}
                {task.contactId && (
                  <span>
                    <strong>Contact:</strong> {getContactName(task.contactId)}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={e => { e.stopPropagation(); handleEditClick(task); }}
                  className="text-gray-400 hover:text-blue-600"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(task.id); }}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  🗑️
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleStatusToggle(task); }}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    task.status === 'COMPLETED'
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {task.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Task['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Optional)</label>
                <select
                  value={form.contactId}
                  onChange={e => setForm(f => ({ ...f, contactId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName || ''} {contact.company ? `(${contact.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={submitting}
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={closeDetailModal}
              title="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Task Details</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Title:</span> {selectedTask.title}
              </div>
              <div>
                <span className="font-semibold">Description:</span> {selectedTask.description || <span className="text-gray-400">(none)</span>}
              </div>
              <div>
                <span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedTask.status)}`}>{selectedTask.status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-semibold">Priority:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(selectedTask.priority)}`}>{selectedTask.priority}</span>
              </div>
              <div>
                <span className="font-semibold">Due Date:</span> {selectedTask.dueDate ? selectedTask.dueDate.slice(0, 10) : <span className="text-gray-400">(none)</span>}
              </div>
              <div>
                <span className="font-semibold">Contact:</span> {getContactName(selectedTask.contactId) || <span className="text-gray-400">(none)</span>}
              </div>
              <div>
                <span className="font-semibold">Created:</span> {selectedTask.createdAt.slice(0, 10)}
              </div>
              <div>
                <span className="font-semibold">Updated:</span> {selectedTask.updatedAt.slice(0, 10)}
              </div>
              {selectedTask.completedAt && (
                <div>
                  <span className="font-semibold">Completed:</span> {selectedTask.completedAt.slice(0, 10)}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => { closeDetailModal(); handleEditClick(selectedTask); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => { closeDetailModal(); handleDelete(selectedTask.id); }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => { closeDetailModal(); handleStatusToggle(selectedTask); }}
                className={`px-4 py-2 rounded-md font-medium text-sm ${
                  selectedTask.status === 'COMPLETED'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedTask.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 