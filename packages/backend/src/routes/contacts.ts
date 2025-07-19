
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';
import { validate } from '../middleware/validationMiddleware';
import contactSchema from '../validation/contactValidation';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all contacts
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const contacts = await prisma.contact.findMany({
    where: { userId },
    include: {
      contactTags: {
        include: {
          tag: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Transform tags for frontend
  const contactsWithTags = contacts.map((contact: any) => ({
    ...contact,
    tags: contact.contactTags.map((ct: any) => ct.tag.name)
  }));

  res.json({
    success: true,
    contacts: contactsWithTags,
    total: contacts.length
  });
}));

// Get single contact
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  const contact = await prisma.contact.findFirst({
    where: { 
      id,
      userId 
    },
    include: {
      contactTags: {
        include: {
          tag: true
        }
      }
    }
  });
  
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  // Transform tags for frontend
  const contactWithTags = {
    ...contact,
    tags: contact.contactTags.map((ct: any) => ct.tag.name)
  };

  res.json({
    success: true,
    contact: contactWithTags
  });
}));

// Create new contact
router.post('/', validate(contactSchema.create), asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { tags, ...contactData } = req.body;
  
  // Create the contact
  const newContact = await prisma.contact.create({
    data: {
    ...contactData,
      userId
    }
  });

  // Handle tags if provided
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tagName of tags) {
      // Find or create tag
      let tag = await prisma.tag.findFirst({
        where: { name: tagName, userId }
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName, userId }
        });
      }
      
      // Create contact-tag relationship
      await prisma.contactTag.create({
        data: {
          contactId: newContact.id,
          tagId: tag.id
        }
      });
    }
  }

  res.status(201).json({
    success: true,
    contact: newContact,
    message: 'Contact created successfully'
  });
}));

// Update contact
router.put('/:id', validate(contactSchema.update), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { tags, ...updateData } = req.body;

  // Update the contact
  const updatedContact = await prisma.contact.update({
    where: { 
      id,
      userId 
    },
    data: updateData
  });

  // Handle tags if provided
  if (tags && Array.isArray(tags)) {
    // Remove existing tags
    await prisma.contactTag.deleteMany({
      where: { contactId: id }
    });
    
    // Add new tags
    for (const tagName of tags) {
      // Find or create tag
      let tag = await prisma.tag.findFirst({
        where: { name: tagName, userId }
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName, userId }
        });
      }
      
      // Create contact-tag relationship
      await prisma.contactTag.create({
        data: {
          contactId: id,
          tagId: tag.id
        }
      });
    }
  }

  res.json({
    success: true,
    contact: updatedContact,
    message: 'Contact updated successfully'
  });
}));

// Delete contact
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Delete contact (cascade will handle related records)
  await prisma.contact.delete({
    where: { 
      id,
      userId 
    }
  });

  res.json({
    success: true,
    message: 'Contact deleted successfully'
  });
}));

export default router;
 