import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all contacts for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user!.id },
      include: {
        contactTags: {
          include: { tag: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create new contact
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      address,
      city,
      state,
      zipCode,
      country,
      website,
      linkedInUrl,
      notes
    } = req.body;

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        address,
        city,
        state,
        zipCode,
        country,
        website,
        linkedInUrl,
        notes,
        userId: req.user!.id
      }
    });

    res.status(201).json({ contact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Get single contact
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        contactTags: {
          include: { tag: true }
        },
        interactions: {
          orderBy: { date: 'desc' },
          take: 10
        },
        notes: {
          orderBy: { updatedAt: 'desc' },
          take: 5
        },
        tasks: {
          where: { status: 'PENDING' },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ contact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const contact = await prisma.contact.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: req.body
    });

    res.json({ contact });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.contact.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router; 