import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

const createScriptSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  scenes: z.array(z.any()).default([]),
});

const updateScriptSchema = z.object({
  title: z.string().optional(),
  scenes: z.array(z.any()).optional(),
});

router.get('/', optionalAuth, async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;

  const scripts = await prisma.videoScript.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: scripts });
});

router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const script = await prisma.videoScript.findUnique({
    where: { id: req.params.id },
    include: {
      storyboards: { orderBy: { createdAt: 'desc' } },
      project: { select: { id: true, name: true, type: true } },
    },
  });

  if (!script) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Script not found' } });
  }

  res.json({ success: true, data: script });
});

router.post('/', requireAuth, validate(createScriptSchema), async (req: Request, res: Response) => {
  const data = req.body;
  const totalDuration = data.scenes?.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) || 0;

  const script = await prisma.videoScript.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      scenes: data.scenes || [],
      totalDuration,
      version: 1,
    },
  });

  res.status(201).json({ success: true, data: script });
});

router.put('/:id', requireAuth, validate(updateScriptSchema), async (req: Request, res: Response) => {
  const data = req.body;
  const existing = await prisma.videoScript.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Script not found' } });
  }

  const scenes = data.scenes || existing.scenes;
  const totalDuration = scenes.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);

  const script = await prisma.videoScript.update({
    where: { id: req.params.id },
    data: {
      title: data.title || existing.title,
      scenes,
      totalDuration,
      version: existing.version + 1,
    },
  });

  res.json({ success: true, data: script });
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.videoScript.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
