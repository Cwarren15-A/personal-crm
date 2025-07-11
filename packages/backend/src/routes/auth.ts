import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Google token required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email! }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email!,
          name: name || undefined,
          avatarUrl: picture || undefined
        }
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router; 