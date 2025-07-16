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

  try {
    if (req.method === 'GET') {
      // Get all contacts
      const contacts = await prisma.contact.findMany({
        where: { userId: user.id },
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

      return res.status(200).json({
        success: true,
        contacts: contactsWithTags,
        total: contacts.length
      });
    }

    if (req.method === 'POST') {
      // Create new contact
      const { tags, ...contactData } = req.body;
      
      // Create the contact
      const newContact = await prisma.contact.create({
        data: {
          ...contactData,
          userId: user.id
        }
      });

      // Handle tags if provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
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
              contactId: newContact.id,
              tagId: tag.id
            }
          });
        }
      }

      return res.status(201).json({
        success: true,
        contact: newContact,
        message: 'Contact created successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in contacts endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 