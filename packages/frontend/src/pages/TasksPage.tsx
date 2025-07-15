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

  const fetchTasks = async (contactId?: string) => {
    try {
      setLoading(true);
      const params = contactId && contactId !== 'ALL' ? { contactId } : {};
      const res = await apiService.getTasks(params);
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
      fetchTasks(filterContact);
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
      fetchTasks(filterContact);
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
      fetchTasks(filterContact);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterContact(e.target.value);
    fetchTasks(e.target.value);
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return '';
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName || ''}` : '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Contact</label>
          <select
            value={filterContact}
            onChange={handleFilterChange}
            className="w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Contacts</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName || ''} {contact.company ? `(${contact.company})` : ''}
              </option>
            ))}
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative border-l-4 ${
                task.status === 'COMPLETED'
                  ? 'border-green-400 bg-green-50'
                  : task.status === 'IN_PROGRESS'
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2 line-clamp-2">{task.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2 space-x-4">
                <span>
                  <strong>Status:</strong> {task.status.replace('_', ' ')}
                </span>
                <span>
                  <strong>Priority:</strong> {task.priority}
                </span>
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
              <button
                onClick={() => handleStatusToggle(task)}
                className={`mt-2 px-3 py-1 rounded text-xs font-medium ${
                  task.status === 'COMPLETED'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {task.status === 'COMPLETED' ? 'Mark as Pending' : 'Mark as Completed'}
              </button>
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
    </div>
  );
};

export default TasksPage; 