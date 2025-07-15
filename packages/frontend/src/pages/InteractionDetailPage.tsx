import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface Interaction {
  id: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'SOCIAL_MEDIA' | 'LINKEDIN' | 'OTHER';
  subject: string;
  description: string;
  contactId: string;
  contactName: string;
  date: string;
  duration?: number;
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

const InteractionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EMAIL' as Interaction['type'],
    subject: '',
    description: '',
    contactId: '',
    date: '',
    duration: '',
    outcome: 'NEUTRAL' as Interaction['outcome'],
    followUpDate: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchInteractionDetails();
    }
  }, [id]);

  const fetchInteractionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts for the dropdown
      const contactsResponse = await apiService.getContacts();
      const contactsData = contactsResponse.contacts || [];
      setContacts(contactsData);

      // Demo interaction data (replace with real API call later)
      const demoInteraction: Interaction = {
        id: id!,
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
      };

      setInteraction(demoInteraction);
      setFormData({
        type: demoInteraction.type,
        subject: demoInteraction.subject,
        description: demoInteraction.description,
        contactId: demoInteraction.contactId,
        date: demoInteraction.date,
        duration: demoInteraction.duration?.toString() || '',
        outcome: demoInteraction.outcome,
        followUpDate: demoInteraction.followUpDate || '',
        notes: demoInteraction.notes || ''
      });
    } catch (err) {
      setError('Failed to fetch interaction details');
      console.error('Error fetching interaction:', err);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!interaction) return;

    const contact = contacts.find(c => c.id === formData.contactId);
    const updatedInteraction: Interaction = {
      ...interaction,
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
      updatedAt: new Date().toISOString()
    };

    setInteraction(updatedInteraction);
    setIsEditing(false);
    
    // TODO: Save to API
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      // TODO: Delete from API
      navigate('/interactions');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading interaction details...</div>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error: {error || 'Interaction not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/interactions')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Interactions
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getTypeIcon(interaction.type)}</span>
            <h1 className="text-3xl font-bold text-gray-900">{interaction.subject}</h1>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Interaction
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Interaction Details */}
      <div className="bg-white rounded-lg shadow-md">
        {isEditing ? (
          /* Edit Form */
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Interaction</h2>
            <form onSubmit={handleSave} className="space-y-6">
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
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Mode */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Interaction Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Type:</span>
                    <span className="flex items-center">
                      <span className="mr-2">{getTypeIcon(interaction.type)}</span>
                      {interaction.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Subject:</span>
                    <span className="font-medium">{interaction.subject}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Contact:</span>
                    <span className="text-blue-600">{interaction.contactName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Date:</span>
                    <span>{new Date(interaction.date).toLocaleDateString()}</span>
                  </div>
                  {interaction.duration && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Duration:</span>
                      <span>{interaction.duration} minutes</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="text-gray-500 w-24">Outcome:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(interaction.outcome)}`}>
                      {interaction.outcome.replace('_', ' ')}
                    </span>
                  </div>
                  {interaction.followUpDate && (
                    <div className="flex items-center">
                      <span className="text-gray-500 w-24">Follow-up:</span>
                      <span className="text-yellow-600">{new Date(interaction.followUpDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-gray-700 mb-4">{interaction.description}</p>
                
                {interaction.notes && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{interaction.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created: {new Date(interaction.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(interaction.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionDetailPage; 