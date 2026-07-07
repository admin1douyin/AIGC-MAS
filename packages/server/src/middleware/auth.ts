import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { supabaseAdmin } from '../lib/supabase';

// Extend Express Request to include profile
declare global {
  namespace Express {
    interface Request {
      profile?: {
        id: string;
        userId: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

// Verify Supabase JWT token and attach profile to request
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authorization header required' }
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
      });
    }
    
    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          email: user.email || 'unknown@example.com',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '用户',
          role: 'creator',
        },
      });
    }
    
    req.profile = profile;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' }
    });
  }
}

// Require admin role (must be used after requireAuth)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const ADMIN_ROLES = ['super_admin', 'admin'];
  if (!req.profile || !ADMIN_ROLES.includes(req.profile.role)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: '需要管理员权限' },
    });
  }
  next();
}

// Optional auth - attaches profile if token provided, but doesn't require it
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
      if (profile) {
        req.profile = profile;
      }
    }
  } catch (err) {
    console.error('Optional auth error:', err);
  }
  
  next();
}
