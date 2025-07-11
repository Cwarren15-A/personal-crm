import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

// Demo mode - bypass authentication entirely
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In demo mode, we'll use a default user ID
  req.user = {
    id: 'demo-user-123',
    email: 'demo@example.com',
    name: 'Demo User'
  };
  next();
};

// Optional: Keep the original middleware for future use
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}; 