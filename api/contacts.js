// Simple contacts API for Vercel
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Demo data for now (we'll add database later)
  const demoContacts = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      company: 'Tech Corp',
      jobTitle: 'Software Engineer',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      website: 'https://techcorp.com',
      linkedInUrl: 'https://linkedin.com/in/johndoe',
      tags: ['work', 'tech'],
      notes: 'Met at conference last month. Very interested in our new product line.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      company: 'Design Studio',
      jobTitle: 'UX Designer',
      address: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      website: 'https://designstudio.com',
      linkedInUrl: 'https://linkedin.com/in/janesmith',
      tags: ['work', 'design'],
      notes: 'Great collaborator on previous project. Excellent design skills.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    switch (req.method) {
      case 'GET':
        // Check if it's a single contact request
        if (req.query.id) {
          const contact = demoContacts.find(c => c.id === req.query.id);
          if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
          }
          res.json({
            success: true,
            contact
          });
        } else {
          // Return all contacts
          res.json({
            success: true,
            contacts: demoContacts,
            total: demoContacts.length
          });
        }
        break;

      case 'POST':
        const newContact = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        res.status(201).json({
          success: true,
          contact: newContact,
          message: 'Contact created successfully'
        });
        break;

      case 'PUT':
        const { id } = req.query;
        const updatedContact = {
          id,
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        res.json({
          success: true,
          contact: updatedContact,
          message: 'Contact updated successfully'
        });
        break;

      case 'DELETE':
        res.json({
          success: true,
          message: 'Contact deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 