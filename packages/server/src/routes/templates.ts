import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['short_drama', 'corporate_video', 'tourism_promo']),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  config: z.any().optional(),
  isPublic: z.boolean().optional(),
});

const createFromTemplateSchema = z.object({
  templateId: z.string(),
  projectName: z.string().min(1),
  customizations: z.any().optional(),
});

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const type = req.query.type as string;
  const search = req.query.search as string;
  const isPublic = req.query.isPublic !== 'false';

  const where: any = {};
  if (type) where.type = type;
  if (isPublic) where.isPublic = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const templates = await prisma.projectTemplate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: templates });
});

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const template = await prisma.projectTemplate.findUnique({
    where: { id: req.params.id },
  });

  if (!template) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Template not found' }
    });
  }

  res.json({ success: true, data: template });
});

router.post('/', requireAuth, validate(createTemplateSchema), async (req: Request, res: Response) => {
  const template = await prisma.projectTemplate.create({
    data: {
      ...req.body,
      createdBy: req.profile!.id,
      config: req.body.config || {},
    },
  });

  res.status(201).json({ success: true, data: template });
});

router.post('/use-template', requireAuth, validate(createFromTemplateSchema), async (req: Request, res: Response) => {
  try {
    const { templateId, projectName, customizations } = req.body;

    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' }
      });
    }

    const templateConfig = (template.config as any) || {};
    const mergedConfig = { ...templateConfig, ...(customizations || {}) };

    const project = await prisma.project.create({
      data: {
        name: projectName,
        type: template.type,
        description: mergedConfig.description || template.description || '',
        brief: mergedConfig.brief || {},
        tags: mergedConfig.tags || [],
        ownerId: req.profile!.id,
        status: 'draft',
        progress: 0,
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (template.type === 'short_drama') {
      await prisma.shortDramaProject.create({
        data: {
          projectId: project.id,
          genre: mergedConfig.genre,
          episodeCount: mergedConfig.episodeCount || 1,
          episodeDuration: mergedConfig.episodeDuration,
          tone: mergedConfig.tone,
          plotSummary: mergedConfig.plotSummary,
          targetPlatform: mergedConfig.targetPlatform,
        },
      });
    } else if (template.type === 'corporate_video') {
      await prisma.corporateVideoProject.create({
        data: {
          projectId: project.id,
          companyName: mergedConfig.companyName,
          industry: mergedConfig.industry,
          videoType: mergedConfig.videoType,
          keySellingPoints: mergedConfig.keySellingPoints || [],
          callToAction: mergedConfig.callToAction,
        } as any,
      });
    } else if (template.type === 'tourism_promo') {
      await prisma.tourismPromoProject.create({
        data: {
          projectId: project.id,
          location: mergedConfig.location,
          attractions: mergedConfig.attractions || [],
          culturalHighlights: mergedConfig.culturalHighlights || [],
          targetTravelers: mergedConfig.targetTravelers,
          season: mergedConfig.season,
          durationDays: mergedConfig.durationDays,
          theme: mergedConfig.theme,
        } as any,
      });
    }

    if (mergedConfig.script && mergedConfig.script.scenes) {
      await prisma.videoScript.create({
        data: {
          projectId: project.id,
          title: mergedConfig.script.title || `${projectName} - 脚本`,
          scenes: mergedConfig.script.scenes,
          totalDuration: mergedConfig.script.totalDuration || 0,
          version: 1,
          isActive: true,
        },
      });
    }

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    console.error('Use template error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const template = await prisma.projectTemplate.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: template });
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.projectTemplate.delete({
    where: { id: req.params.id },
  });

  res.json({ success: true });
});

export default router;
