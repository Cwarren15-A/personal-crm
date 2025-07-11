import express from 'express';

const router = express.Router();

router.get('/contacts', (req, res) => {
  res.json({ message: 'Microsoft contacts endpoint - coming soon' });
});

export default router; 