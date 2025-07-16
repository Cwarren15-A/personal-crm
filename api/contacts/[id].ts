import { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_utils/prisma';
import { getUser, setCorsHeaders } from '../_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUser(req);
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid contact ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single contact
      const contact = await prisma.contact.findFirst({
        where: { 
          id,
          userId: user.id 
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

      return res.status(200).json({
        success: true,
        contact: contactWithTags
      });
    }

    if (req.method === 'PUT') {
      // Update contact
      const { tags, ...updateData } = req.body;

      // Update the contact
      const updatedContact = await prisma.contact.update({
        where: { 
          id,
          userId: user.id 
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
            where: { name: tagName, userId: user.id }
          });
          
          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName, userId: user.id }
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

      return res.status(200).json({
        success: true,
        contact: updatedContact,
        message: 'Contact updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete contact
      await prisma.contact.delete({
        where: { 
          id,
          userId: user.id 
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Contact deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in contact endpoint:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
} 