import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Demo login - always succeeds
router.post('/login', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'demo-user-123',
      email: 'demo@example.com',
      name: 'Demo User'
    },
    message: 'Demo login successful'
  });
});

// Demo logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Demo logout successful'
  });
});

// Get current user (demo)
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router; 