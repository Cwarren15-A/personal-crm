import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContacts();
      setContacts(response.contacts || []);
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading contacts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No contacts found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <p className="text-gray-600">{contact.position}</p>
                  <p className="text-gray-500 text-sm">{contact.company}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-16">Email:</span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-16">Phone:</span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {contact.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {contact.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Edit
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsPage; 