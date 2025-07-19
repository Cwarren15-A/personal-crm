import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface Note {
  id: string;
  title: string;
  content: string;
  contactId?: string;
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
  title: '',
  content: '',
  contactId: '',
};

const NotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContact, setFilterContact] = useState<string>('ALL');

  // Fetch contacts for dropdown
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await apiService.getContacts() as any;
      return res.contacts || [];
    }
  });

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await apiService.getNotes() as any;
      return res.notes || [];
    }
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (newNote: typeof defaultForm) => apiService.createNote(newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      console.error('Error creating note:', error);
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (updatedNote: Note) => apiService.updateNote(updatedNote.id, updatedNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowForm(false);
      setEditingNote(null);
      setForm(defaultForm);
    },
    onError: (error) => {
      console.error('Error updating note:', error);
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => apiService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
    }
  });

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesContact = filterContact === 'ALL' || note.contactId === filterContact;
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesContact && matchesSearch;
    });
  }, [notes, filterContact, searchTerm]);

  // Event handlers
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    if (editingNote) {
      updateNoteMutation.mutate({ ...editingNote, ...form });
    } else {
      createNoteMutation.mutate(form);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content,
      contactId: note.contactId || '',
    });
    setShowForm(true);
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(null);
    setForm(defaultForm);
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName || ''}`.trim() : null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading notes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        
        <select
          value={filterContact}
          onChange={(e) => setFilterContact(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="ALL">All Contacts</option>
          <option value="">No Contact</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
            </option>
          ))}
        </select>
      </div>

      {/* Note Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <select
                  value={form.contactId}
                  onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">No contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {editingNote ? 'Update' : 'Create'}
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

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {notes.length === 0 ? 'No notes yet. Create your first note!' : 'No notes match your filters.'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{note.title}</h3>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-purple-600 hover:text-purple-800 px-2 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                    disabled={deleteNoteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="text-gray-600 mb-4 line-clamp-4 text-sm">
                {note.content}
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                {getContactName(note.contactId) && (
                  <div>Contact: <span className="text-purple-600">{getContactName(note.contactId)}</span></div>
                )}
                <div>Created: {new Date(note.createdAt).toLocaleDateString()}</div>
                {note.updatedAt !== note.createdAt && (
                  <div>Updated: {new Date(note.updatedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPage; 