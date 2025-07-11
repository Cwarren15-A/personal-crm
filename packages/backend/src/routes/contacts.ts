import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all contacts (demo data)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Demo data for now
    const contacts = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        company: 'Tech Corp',
        position: 'Software Engineer',
        tags: ['work', 'tech'],
        notes: 'Met at conference last month',
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
        position: 'UX Designer',
        tags: ['work', 'design'],
        notes: 'Great collaborator on previous project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0789',
        company: 'Startup Inc',
        position: 'CEO',
        tags: ['work', 'startup'],
        notes: 'Potential investor for new project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      contacts,
      total: contacts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get single contact
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Demo data lookup
    const contacts = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        company: 'Tech Corp',
        position: 'Software Engineer',
        tags: ['work', 'tech'],
        notes: 'Met at conference last month',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const contact = contacts.find(c => c.id === id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create new contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const contactData = req.body;
    
    // In demo mode, just return success with mock data
    const newContact = {
      id: Date.now().toString(),
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      contact: newContact,
      message: 'Contact created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // In demo mode, just return success
    const updatedContact = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      contact: updatedContact,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: `Contact ${id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router; 