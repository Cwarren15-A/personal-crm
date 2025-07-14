import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ContactForm from '../components/ContactForm';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  linkedInUrl?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks' | 'pipeline'>('overview');
  
  // Form states
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    priority: 'MEDIUM' as const 
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContactDetails();
    }
  }, [id]);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContact(id!);
      setContact(response.contact);
      
      // TODO: Fetch notes and tasks when API endpoints are ready
      // For now, using demo data
      setNotes([
        {
          id: '1',
          title: 'Initial Meeting',
          content: 'Met at the conference. Discussed potential collaboration opportunities.',
          createdAt: new Date().toISOString()
        }
      ]);
      
      setTasks([
        {
          id: '1',
          title: 'Follow up on proposal',
          description: 'Send the proposal we discussed',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: 'HIGH',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError('Failed to fetch contact details');
      console.error('Error fetching contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString()
    };

    setNotes([note, ...notes]);
    setNewNote({ title: '', content: '' });
    
    // TODO: Save note to API
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', dueDate: '', priority: 'MEDIUM' });
    
    // TODO: Save task to API
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    // TODO: Delete note from API
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    // TODO: Delete task from API
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    // TODO: Update task in API
  };

  const handleEditContact = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    fetchContactDetails(); // Refresh the contact data
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading contact details...</div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error: {error || 'Contact not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/contacts')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Contacts
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {contact.firstName} {contact.lastName}
          </h1>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleEditContact}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Contact
          </button>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center">
                  <span className="text-gray-500 w-20">Email:</span>
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center">
                  <span className="text-gray-500 w-20">Phone:</span>
                  <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center">
                  <span className="text-gray-500 w-20">Company:</span>
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.jobTitle && (
                <div className="flex items-center">
                  <span className="text-gray-500 w-20">Title:</span>
                  <span>{contact.jobTitle}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Address</h3>
            <div className="space-y-1">
              {contact.address && <div>{contact.address}</div>}
              <div>
                {contact.city && contact.city}
                {contact.city && contact.state && ', '}
                {contact.state && contact.state}
                {contact.zipCode && ` ${contact.zipCode}`}
              </div>
              {contact.country && <div>{contact.country}</div>}
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'notes', label: 'Notes' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'pipeline', label: 'Pipeline' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Recent Notes</h3>
                  <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
                  <p className="text-sm text-blue-700">Total notes</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Active Tasks</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length}
                  </p>
                  <p className="text-sm text-green-700">Pending/In Progress</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Pipeline Stage</h3>
                  <p className="text-2xl font-bold text-purple-600">Lead</p>
                  <p className="text-sm text-purple-700">Current stage</p>
                </div>
              </div>
              
              {contact.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notes</h3>
                <button className="text-blue-600 hover:text-blue-800">
                  View All Notes
                </button>
              </div>
              
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Add New Note</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Note content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{note.title}</h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-700 mb-2">{note.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <button className="text-blue-600 hover:text-blue-800">
                  View All Tasks
                </button>
              </div>
              
              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Add New Task</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Task
                  </button>
                </div>
                <textarea
                  placeholder="Task description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                  className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value as any)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline Tab */}
          {activeTab === 'pipeline' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-4">Pipeline Management</h3>
              <p className="text-gray-600 mb-6">
                Pipeline functionality coming soon! This will include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Lead Stages</h4>
                  <p className="text-sm text-blue-700">Track prospects through your sales funnel</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Deal Tracking</h4>
                  <p className="text-sm text-green-700">Monitor deal progress and values</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">Analytics</h4>
                  <p className="text-sm text-purple-700">View conversion rates and performance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Contact Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ContactForm
              contact={contact}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetailPage; 