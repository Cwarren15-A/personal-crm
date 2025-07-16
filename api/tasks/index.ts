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
      // Get all tasks (with optional filters)
      const { status, priority, contactId } = req.query;
      const where: any = { userId: user.id };
      
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (contactId) where.contactId = contactId;
      
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { dueDate: 'asc' },
      });

      return res.status(200).json({ 
        success: true, 
        tasks 
      });
    }

    if (req.method === 'POST') {
      // Create a new task
      const { title, description, dueDate, priority, status, contactId } = req.body;
      
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority: priority || 'MEDIUM',
          status: status || 'PENDING',
          userId: user.id,
          contactId: contactId || undefined,
        },
      });

      return res.status(201).json({ 
        success: true, 
        task: newTask 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in tasks endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 