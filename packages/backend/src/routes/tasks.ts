import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Tasks endpoint - coming soon' });
});

export default router; 