import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all tasks (with optional filters)
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { status, priority, contactId } = req.query;
    const where: any = { userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (contactId) where.contactId = contactId;
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a single task
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { title, description, dueDate, priority, status, contactId } = req.body;
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        userId,
        contactId: contactId || undefined,
      },
    });
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, description, dueDate, priority, status, contactId, completedAt } = req.body;
    // Only update if the task belongs to the user
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
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
    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    // Only delete if the task belongs to the user
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router; 