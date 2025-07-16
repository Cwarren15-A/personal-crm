import { VercelRequest } from '@vercel/node';

export interface User {
  id: string;
  email: string;
  name?: string;
}

// Demo mode auth - always returns the demo user
export function getUser(req: VercelRequest): User {
  // In demo mode, we'll use a default user ID
  return {
    id: 'demo-user-123',
    email: 'demo@example.com',
    name: 'Demo User'
  };
}

// Helper to set CORS headers
export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
} 