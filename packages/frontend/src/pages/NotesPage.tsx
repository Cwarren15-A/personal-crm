import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'CONTACT' | 'MEETING' | 'FOLLOW_UP' | 'IDEA' | 'TASK' | 'OTHER';
  contactId?: string;
  contactName?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  company?: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterContact, setFilterContact] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state for adding/editing notes
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL' as Note['type'],
    contactId: '',
    tags: [] as string[],
    isPinned: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts for the dropdown
      const contactsResponse = await apiService.getContacts();
      const contactsData = contactsResponse.contacts || [];
      setContacts(contactsData);

      // Demo notes data (replace with real API call later)
      const demoNotes: Note[] = [
        {
          id: '1',
          title: 'Project Ideas for Q1',
          content: '1. Mobile app for contact management\n2. Integration with calendar systems\n3. Automated follow-up reminders\n4. Analytics dashboard for relationship insights',
          type: 'IDEA',
          tags: ['ideas', 'projects', 'q1'],
          isPinned: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Meeting with John Doe',
          content: 'Discussed the new project proposal. Key points:\n- Timeline: 3 months\n- Budget: $50k\n- Team size: 4 people\n- Next steps: Send detailed proposal by Friday',
          type: 'MEETING',
          contactId: '1',
          contactName: 'John Doe',
          tags: ['meeting', 'proposal', 'project'],
          isPinned: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Follow-up Tasks',
          content: '1. Call Jane Smith about the design project\n2. Send proposal to Mike Johnson\n3. Schedule team meeting for next week\n4. Review budget for Q2',
          type: 'TASK',
          tags: ['follow-up', 'tasks', 'urgent'],
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          title: 'General Thoughts',
          content: 'Need to improve the customer onboarding process. Current process takes too long and has too many steps. Should streamline it to 3-4 steps maximum.',
          type: 'GENERAL',
          tags: ['process', 'improvement', 'onboarding'],
          isPinned: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setNotes(demoNotes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'GENERAL':
        return '📝';
      case 'CONTACT':
        return '👤';
      case 'MEETING':
        return '🤝';
      case 'FOLLOW_UP':
        return '🔔';
      case 'IDEA':
        return '💡';
      case 'TASK':
        return '✅';
      case 'OTHER':
        return '📋';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: Note['type']) => {
    switch (type) {
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800';
      case 'CONTACT':
        return 'bg-blue-100 text-blue-800';
      case 'MEETING':
        return 'bg-green-100 text-green-800';
      case 'FOLLOW_UP':
        return 'bg-yellow-100 text-yellow-800';
      case 'IDEA':
        return 'bg-purple-100 text-purple-800';
      case 'TASK':
        return 'bg-orange-100 text-orange-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'ALL' || note.type === filterType;
      const matchesContact = filterContact === 'ALL' || note.contactId === filterContact;
      
      return matchesSearch && matchesType && matchesContact;
    })
    .sort((a, b) => {
      // Pinned notes always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddNote = () => {
    setFormData({
      title: '',
      content: '',
      type: 'GENERAL',
      contactId: '',
      tags: [],
      isPinned: false
    });
    setTagInput('');
    setShowAddModal(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      type: note.type,
      contactId: note.contactId || '',
      tags: note.tags,
      isPinned: note.isPinned
    });
    setTagInput('');
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contact = contacts.find(c => c.id === formData.contactId);
    const newNote: Note = {
      id: selectedNote?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      type: formData.type,
      contactId: formData.contactId || undefined,
      contactName: contact ? `${contact.firstName} ${contact.lastName || ''}`.trim() : undefined,
      tags: formData.tags,
      isPinned: formData.isPinned,
      createdAt: selectedNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedNote) {
      // Update existing note
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? newNote : n));
    } else {
      // Add new note
      setNotes(prev => [newNote, ...prev]);
    }

    // TODO: Save to API
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      // TODO: Delete from API
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
    // TODO: Update in API
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {viewMode === 'grid' ? '📋 List' : '🔲 Grid'}
          </button>
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="GENERAL">General</option>
              <option value="CONTACT">Contact</option>
              <option value="MEETING">Meeting</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="IDEA">Idea</option>
              <option value="TASK">Task</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <select
              value={filterContact}
              onChange={(e) => setFilterContact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Contacts</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName || ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List/Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Notes ({filteredNotes.length})
          </h2>
        </div>
        
        {filteredNotes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No notes found. {searchTerm || filterType !== 'ALL' || filterContact !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first note!'}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div 
                key={note.id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  note.isPinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                }`}
                onClick={() => handleEditNote(note)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getTypeIcon(note.type)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                      {note.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note.id);
                      }}
                      className={note.isPinned ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}
                    >
                      📌
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{note.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{note.content}</p>
                
                {note.contactName && (
                  <p className="text-blue-600 text-sm mb-2">👤 {note.contactName}</p>
                )}
                
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">+{note.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">{formatTimeAgo(note.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-gray-200">
            {filteredNotes.map((note) => (
              <div 
                key={note.id} 
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  note.isPinned ? 'bg-yellow-50' : ''
                }`}
                onClick={() => handleEditNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getTypeIcon(note.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                          {note.type.replace('_', ' ')}
                        </span>
                        {note.isPinned && <span className="text-yellow-500">📌</span>}
                      </div>
                      
                      <p className="text-gray-600 mb-2 line-clamp-2">{note.content}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {note.contactName && (
                          <span>👤 {note.contactName}</span>
                        )}
                        <span>📅 {formatTimeAgo(note.createdAt)}</span>
                      </div>
                      
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note.id);
                      }}
                      className={note.isPinned ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}
                    >
                      📌
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {showEditModal ? 'Edit Note' : 'Add New Note'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Note['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="CONTACT">Contact</option>
                    <option value="MEETING">Meeting</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="IDEA">Idea</option>
                    <option value="TASK">Task</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Optional)</label>
                  <select
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your note here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-900">
                  Pin this note (show at top)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedNote(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showEditModal ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage; 