import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // In production, get user ID from auth header
    const authHeader = req.headers.authorization;
    let userId = 'system-user-id'; // Default for demo

    // Try to get user from Supabase auth
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // In production, verify token with Supabase
      // For now, we'll use a simpler approach
    }

    // Find or create default profile
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: 'demo-user-id',
          email: 'demo@example.com',
          name: '演示用户',
          role: 'creator',
        },
      });
    }

    res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Update profile
router.put('/profile', validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const { name, phone, bio, avatarUrl } = req.body;
    
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: 'demo-user-id',
          email: 'demo@example.com',
          name: name || '用户',
          role: 'creator',
          phone,
          bio,
          avatarUrl,
        },
      });
    } else {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          name: name || profile.name,
          phone: phone !== undefined ? phone : profile.phone,
          bio: bio !== undefined ? bio : profile.bio,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : profile.avatarUrl,
        },
      });
    }

    res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Get subscription info
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    let profile = await prisma.profile.findFirst({
      include: { subscription: true }
    });

    if (!profile) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          credits: 3,
          usedCredits: 0,
        }
      });
    }

    const subscription = profile.subscription || {
      plan: 'free',
      status: 'active',
      credits: 3,
      usedCredits: 0,
    };

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Update subscription
router.post('/subscription', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Profile not found' }
      });
    }

    const subscription = await prisma.subscription.upsert({
      where: { profileId: profile.id },
      update: { plan: plan as any },
      create: {
        profileId: profile.id,
        plan: plan as any,
        status: 'active',
        credits: plan === 'pro' ? 999 : 3,
      },
    });

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
