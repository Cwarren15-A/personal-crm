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
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get a single task
      const task = await prisma.task.findFirst({ 
        where: { id, userId: user.id } 
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.status(200).json({ 
        success: true, 
        task 
      });
    }

    if (req.method === 'PUT') {
      // Update a task
      const { title, description, dueDate, priority, status, contactId, completedAt } = req.body;
      
      // Only update if the task belongs to the user
      const existing = await prisma.task.findFirst({ 
        where: { id, userId: user.id } 
      });
      
      if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority,
          status,
          contactId: contactId || undefined,
          completedAt: completedAt ? new Date(completedAt) : undefined,
        },
      });

      return res.status(200).json({ 
        success: true, 
        task: updatedTask 
      });
    }

    if (req.method === 'DELETE') {
      // Delete a task
      // Only delete if the task belongs to the user
      const existing = await prisma.task.findFirst({ 
        where: { id, userId: user.id } 
      });
      
      if (!existing) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await prisma.task.delete({ where: { id } });

      return res.status(200).json({ 
        success: true 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in task endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 