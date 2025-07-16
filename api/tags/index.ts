import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_utils/auth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      success: true, 
      tags: [],
      message: 'Tags endpoint - coming soon' 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 