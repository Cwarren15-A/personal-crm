import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface Interaction {
  id: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'SOCIAL_MEDIA' | 'LINKEDIN' | 'OTHER';
  subject: string;
  description: string;
  contactId: string;
  contactName: string;
  date: string;
  duration?: number; // in minutes
  outcome: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'FOLLOW_UP_REQUIRED';
  followUpDate?: string;
  notes?: string;
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

const InteractionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'contact' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state for adding/editing interactions
  const [formData, setFormData] = useState({
    type: 'EMAIL' as Interaction['type'],
    subject: '',
    description: '',
    contactId: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    outcome: 'NEUTRAL' as Interaction['outcome'],
    followUpDate: '',
    notes: ''
  });

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

      // Demo interactions data (replace with real API call later)
      const demoInteractions: Interaction[] = [
        {
          id: '1',
          type: 'EMAIL',
          subject: 'Follow-up on proposal',
          description: 'Sent follow-up email regarding the proposal we discussed last week.',
          contactId: '1',
          contactName: 'John Doe',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          outcome: 'POSITIVE',
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: 'Client responded positively. Will schedule a call next week.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'PHONE',
          subject: 'Initial consultation call',
          description: 'Had a 30-minute call to discuss project requirements.',
          contactId: '2',
          contactName: 'Jane Smith',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          duration: 30,
          outcome: 'NEUTRAL',
          notes: 'Good conversation. Need to send proposal.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'MEETING',
          subject: 'Project kickoff meeting',
          description: 'In-person meeting to discuss project timeline and deliverables.',
          contactId: '1',
          contactName: 'John Doe',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          duration: 60,
          outcome: 'POSITIVE',
          notes: 'Meeting went well. Project approved to move forward.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setInteractions(demoInteractions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'EMAIL':
        return '📧';
      case 'PHONE':
        return '📞';
      case 'MEETING':
        return '🤝';
      case 'SOCIAL_MEDIA':
        return '📱';
      case 'LINKEDIN':
        return '💼';
      case 'OTHER':
        return '📋';
      default:
        return '📋';
    }
  };

  const getOutcomeColor = (outcome: Interaction['outcome']) => {
    switch (outcome) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800';
      case 'NEUTRAL':
        return 'bg-gray-100 text-gray-800';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800';
      case 'FOLLOW_UP_REQUIRED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInteractions = interactions
    .filter(interaction => {
      const matchesSearch = 
        interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'ALL' || interaction.type === filterType;
      const matchesOutcome = filterOutcome === 'ALL' || interaction.outcome === filterOutcome;
      
      return matchesSearch && matchesType && matchesOutcome;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'contact':
          comparison = a.contactName.localeCompare(b.contactName);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleAddInteraction = () => {
    setFormData({
      type: 'EMAIL',
      subject: '',
      description: '',
      contactId: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      outcome: 'NEUTRAL',
      followUpDate: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditInteraction = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setFormData({
      type: interaction.type,
      subject: interaction.subject,
      description: interaction.description,
      contactId: interaction.contactId,
      date: interaction.date,
      duration: interaction.duration?.toString() || '',
      outcome: interaction.outcome,
      followUpDate: interaction.followUpDate || '',
      notes: interaction.notes || ''
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contact = contacts.find(c => c.id === formData.contactId);
    const newInteraction: Interaction = {
      id: selectedInteraction?.id || Date.now().toString(),
      type: formData.type,
      subject: formData.subject,
      description: formData.description,
      contactId: formData.contactId,
      contactName: contact ? `${contact.firstName} ${contact.lastName || ''}`.trim() : 'Unknown Contact',
      date: formData.date,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      outcome: formData.outcome,
      followUpDate: formData.followUpDate || undefined,
      notes: formData.notes,
      createdAt: selectedInteraction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedInteraction) {
      // Update existing interaction
      setInteractions(prev => prev.map(i => i.id === selectedInteraction.id ? newInteraction : i));
    } else {
      // Add new interaction
      setInteractions(prev => [newInteraction, ...prev]);
    }

    // TODO: Save to API
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedInteraction(null);
  };

  const handleDeleteInteraction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      setInteractions(prev => prev.filter(i => i.id !== id));
      // TODO: Delete from API
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'EMAIL',
      subject: '',
      description: '',
      contactId: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      outcome: 'NEUTRAL',
      followUpDate: '',
      notes: ''
    });
    setSelectedInteraction(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading interactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Interactions</h1>
        <button
          onClick={handleAddInteraction}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Interaction
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search interactions..."
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
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="MEETING">Meeting</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
              <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
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
              <option value="contact">Contact</option>
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

      {/* Interactions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Interactions ({filteredInteractions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredInteractions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No interactions found. {searchTerm || filterType !== 'ALL' || filterOutcome !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first interaction!'}
            </div>
          ) : (
                         filteredInteractions.map((interaction) => (
               <div 
                 key={interaction.id} 
                 className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                 onClick={() => navigate(`/interactions/${interaction.id}`)}
               >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getTypeIcon(interaction.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{interaction.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(interaction.outcome)}`}>
                          {interaction.outcome.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{interaction.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {new Date(interaction.date).toLocaleDateString()}</span>
                        <span>👤 {interaction.contactName}</span>
                        {interaction.duration && (
                          <span>⏱️ {interaction.duration} min</span>
                        )}
                        {interaction.followUpDate && (
                          <span className="text-yellow-600">🔔 Follow-up: {new Date(interaction.followUpDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {interaction.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Notes:</strong> {interaction.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditInteraction(interaction);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInteraction(interaction.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {showEditModal ? 'Edit Interaction' : 'Add New Interaction'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Interaction['type'] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone</option>
                    <option value="MEETING">Meeting</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                  <select
                    value={formData.contactId}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName || ''} {contact.company ? `(${contact.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome *</label>
                  <select
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value as Interaction['outcome'] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="POSITIVE">Positive</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="NEGATIVE">Negative</option>
                    <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showEditModal ? 'Update Interaction' : 'Add Interaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionsPage; 