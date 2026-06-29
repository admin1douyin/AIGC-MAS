import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;
    
    const memberships = await prisma.orgMember.findMany({
      where: { profileId },
      include: {
        organization: true,
      },
    });

    const organizations = memberships.map((m) => ({
      ...m.organization,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json({ success: true, data: organizations });
  } catch (error: any) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Name and slug are required' },
      });
    }

    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'SLUG_EXISTS', message: 'Organization slug already exists' },
      });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        members: {
          create: {
            profileId,
            role: 'admin',
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.json({ success: true, data: organization });
  } catch (error: any) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;
    const { id } = req.params;

    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_profileId: {
          organizationId: id,
          profileId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this organization' },
      });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
            teams: true,
          },
        },
      },
    });

    res.json({ success: true, data: organization });
  } catch (error: any) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;
    const { id } = req.params;
    const { name, description, logoUrl } = req.body;

    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_profileId: {
          organizationId: id,
          profileId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
        logoUrl,
      },
    });

    res.json({ success: true, data: organization });
  } catch (error: any) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.post('/:id/members', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;
    const { id } = req.params;
    const { email, role } = req.body;

    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_profileId: {
          organizationId: id,
          profileId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User with this email does not exist' },
      });
    }

    const existingMember = await prisma.orgMember.findUnique({
      where: {
        organizationId_profileId: {
          organizationId: id,
          profileId: profile.id,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_MEMBER', message: 'User is already a member' },
      });
    }

    const newMember = await prisma.orgMember.create({
      data: {
        organizationId: id,
        profileId: profile.id,
        role: role || 'viewer',
      },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({ success: true, data: newMember });
  } catch (error: any) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.delete('/:id/members/:memberId', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;
    const { id, memberId } = req.params;

    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_profileId: {
          organizationId: id,
          profileId,
        },
      },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    await prisma.orgMember.delete({
      where: { id: memberId },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

export default router;
