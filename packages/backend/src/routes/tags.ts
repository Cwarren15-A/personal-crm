import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Tags endpoint - coming soon' });
});

export default router; 