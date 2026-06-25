import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { agentEngine } from '../agents/AgentEngine';

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['short_drama', 'corporate_video', 'tourism_promo']),
  description: z.string().optional(),
  brief: z.any().optional(),
  tags: z.array(z.string()).optional(),
  estimatedDuration: z.number().optional(),
  budget: z.number().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  brief: z.any().optional(),
  progress: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  estimatedDuration: z.number().optional(),
  budget: z.number().optional(),
});

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const type = req.query.type as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const where: any = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) where.name = { contains: search };

  // If user is authenticated, filter by their projects
  if (req.profile) {
    where.ownerId = req.profile.id;
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      items: projects,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      agents: true,
      tasks: { orderBy: { createdAt: 'asc' } },
      scripts: { orderBy: { createdAt: 'desc' } },
      assets: { orderBy: { createdAt: 'desc' } },
      finalVideos: { orderBy: { createdAt: 'desc' } },
      shortDrama: true,
      corporateVideo: true,
      tourismPromo: true,
    },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Project not found' },
    });
  }

  res.json({ success: true, data: project });
});

router.post('/', requireAuth, validate(createProjectSchema), async (req: Request, res: Response) => {
  const data = req.body;

  const project = await prisma.project.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description || '',
      brief: data.brief || {},
      tags: data.tags || [],
      estimatedDuration: data.estimatedDuration,
      budget: data.budget,
      ownerId: req.profile!.id,
      status: 'draft',
      progress: 0,
    } as any,
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (data.type === 'short_drama') {
    await prisma.shortDramaProject.create({ data: { projectId: project.id } });
  } else if (data.type === 'corporate_video') {
    await prisma.corporateVideoProject.create({ data: { projectId: project.id, keySellingPoints: [] } as any });
  } else if (data.type === 'tourism_promo') {
    await prisma.tourismPromoProject.create({ data: { projectId: project.id, attractions: [], culturalHighlights: [] } as any });
  }

  res.status(201).json({ success: true, data: project });
});

router.put('/:id', validate(updateProjectSchema), async (req: Request, res: Response) => {
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  res.json({ success: true, data: project });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.post('/:id/start', async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const result = await agentEngine.startProject(project.id);

  res.json({ success: true, data: result });
});

router.post('/:id/pause', async (req: Request, res: Response) => {
  const result = await agentEngine.pauseProject(req.params.id);
  res.json({ success: true, data: result });
});

router.post('/:id/resume', async (req: Request, res: Response) => {
  const result = await agentEngine.resumeProject(req.params.id);
  res.json({ success: true, data: result });
});

export default router;
