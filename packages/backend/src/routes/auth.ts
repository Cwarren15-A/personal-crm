import express from 'express';

const router = express.Router();

// Placeholder routes - will be implemented later
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - coming soon' });
});

router.get('/profile', (req, res) => {
  res.json({ message: 'Profile endpoint - coming soon' });
});

export default router; 