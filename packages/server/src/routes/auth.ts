import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// Middleware to verify Supabase JWT token
async function verifyAuth(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth verification failed:', error);
      return null;
    }
    
    return user.id;
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}

// Get current user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    // Create profile if not exists (first time login)
    if (!profile) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(userId);
      profile = await prisma.profile.create({
        data: {
          userId: userId,
          email: user?.email || 'unknown@example.com',
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || '用户',
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
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const { name, phone, bio, avatarUrl } = req.body;
    
    let profile = await prisma.profile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      // Create profile if not exists
      profile = await prisma.profile.create({
        data: {
          userId,
          email: 'unknown@example.com',
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
          name: name !== undefined ? name : profile.name,
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
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
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
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const { plan } = req.body;
    
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

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
