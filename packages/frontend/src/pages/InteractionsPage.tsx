import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface Interaction {
  id: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'TASK' | 'NOTE' | 'OTHER';
  subject: string;
  description: string;
  contactId: string;
  date: string;
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

const defaultForm = {
  type: 'EMAIL' as Interaction['type'],
  subject: '',
  description: '',
  contactId: '',
  date: new Date().toISOString().split('T')[0],
};

const InteractionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterContact, setFilterContact] = useState<string>('ALL');

  // Fetch contacts for dropdown
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await apiService.getContacts() as any;
      return res.contacts || [];
    }
  });

  // Fetch interactions
  const { data: interactions = [], isLoading } = useQuery<Interaction[]>({
    queryKey: ['interactions'],
    queryFn: async () => {
      const res = await apiService.getInteractions() as any;
      return res.interactions || [];
    }
  });

  // Create interaction mutation
  const createInteractionMutation = useMutation({
    mutationFn: (newInteraction: typeof defaultForm) => apiService.createInteraction(newInteraction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      console.error('Error creating interaction:', error);
    }
  });

  // Update interaction mutation
  const updateInteractionMutation = useMutation({
    mutationFn: (updatedInteraction: Interaction) => apiService.updateInteraction(updatedInteraction.id, updatedInteraction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setShowForm(false);
      setEditingInteraction(null);
      setForm(defaultForm);
    },
    onError: (error) => {
      console.error('Error updating interaction:', error);
    }
  });

  // Delete interaction mutation
  const deleteInteractionMutation = useMutation({
    mutationFn: (interactionId: string) => apiService.deleteInteraction(interactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
    onError: (error) => {
      console.error('Error deleting interaction:', error);
    }
  });

  // Filtered interactions
  const filteredInteractions = useMemo(() => {
    return interactions.filter(interaction => {
      const matchesType = filterType === 'ALL' || interaction.type === filterType;
      const matchesContact = filterContact === 'ALL' || interaction.contactId === filterContact;
      const matchesSearch = 
        interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesContact && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interactions, filterType, filterContact, searchTerm]);

  // Event handlers
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.contactId) return;

    if (editingInteraction) {
      updateInteractionMutation.mutate({ ...editingInteraction, ...form });
    } else {
      createInteractionMutation.mutate(form);
    }
  };

  const handleEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setForm({
      type: interaction.type,
      subject: interaction.subject,
      description: interaction.description,
      contactId: interaction.contactId,
      date: interaction.date,
    });
    setShowForm(true);
  };

  const handleDelete = (interactionId: string) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      deleteInteractionMutation.mutate(interactionId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInteraction(null);
    setForm(defaultForm);
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName || ''}`.trim() : 'Unknown Contact';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return '📧';
      case 'PHONE': return '📞';
      case 'MEETING': return '🤝';
      case 'TASK': return '✅';
      case 'NOTE': return '📝';
      case 'OTHER': return '💬';
      default: return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EMAIL': return 'bg-blue-100 text-blue-800';
      case 'PHONE': return 'bg-green-100 text-green-800';
      case 'MEETING': return 'bg-purple-100 text-purple-800';
      case 'TASK': return 'bg-orange-100 text-orange-800';
      case 'NOTE': return 'bg-yellow-100 text-yellow-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading interactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interactions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Interaction
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search interactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="MEETING">Meeting</option>
          <option value="TASK">Task</option>
          <option value="NOTE">Note</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={filterContact}
          onChange={(e) => setFilterContact(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Contacts</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
            </option>
          ))}
        </select>
      </div>

      {/* Interaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingInteraction ? 'Edit Interaction' : 'Create New Interaction'}
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Interaction['type'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone</option>
                    <option value="MEETING">Meeting</option>
                    <option value="TASK">Task</option>
                    <option value="NOTE">Note</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact *</label>
                <select
                  value={form.contactId}
                  onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={createInteractionMutation.isPending || updateInteractionMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {editingInteraction ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactions List */}
      <div className="space-y-4">
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {interactions.length === 0 ? 'No interactions yet. Create your first interaction!' : 'No interactions match your filters.'}
          </div>
        ) : (
          filteredInteractions.map((interaction) => (
            <div key={interaction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-2xl">{getTypeIcon(interaction.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{interaction.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(interaction.type)}`}>
                        {interaction.type}
                      </span>
                    </div>
                    
                    <p className="text-blue-600 text-sm mb-2">
                      {getContactName(interaction.contactId)}
                    </p>
                    
                    {interaction.description && (
                      <p className="text-gray-600 mb-2">{interaction.description}</p>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(interaction)}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(interaction.id)}
                    className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                    disabled={deleteInteractionMutation.isPending}
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
  );
};

export default InteractionsPage; 