import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';

const router = Router();

// Demo login - always succeeds
router.post('/login', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'demo-user-123',
      email: 'demo@example.com',
      name: 'Demo User'
    },
    message: 'Demo login successful'
  });
}));

// Demo logout
router.post('/logout', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Demo logout successful'
  });
}));

// Get current user (demo)
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
}));

export default router; 