import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const createEpisodeSchema = z.object({
  shortDramaId: z.string(),
  episodeNumber: z.number().int().min(1),
  title: z.string().min(1),
  synopsis: z.string().optional(),
  duration: z.number().optional(),
});

const updateEpisodeSchema = z.object({
  title: z.string().min(1).optional(),
  synopsis: z.string().optional(),
  duration: z.number().optional(),
  status: z.string().optional(),
  scriptUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  const shortDramaId = req.query.shortDramaId as string;

  if (!shortDramaId) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'shortDramaId is required' } });
  }

  const episodes = await prisma.dramaEpisode.findMany({
    where: { shortDramaId },
    orderBy: { episodeNumber: 'asc' },
  });

  res.json({ success: true, data: episodes });
});

router.get('/:id', async (req: Request, res: Response) => {
  const episode = await prisma.dramaEpisode.findUnique({
    where: { id: req.params.id },
    include: {
      shortDrama: {
        include: { project: { select: { id: true, name: true } } },
      },
    },
  });

  if (!episode) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Episode not found' } });
  }

  res.json({ success: true, data: episode });
});

router.post('/', validate(createEpisodeSchema), async (req: Request, res: Response) => {
  const { shortDramaId, episodeNumber, title, synopsis, duration } = req.body;

  const existing = await prisma.dramaEpisode.findFirst({
    where: { shortDramaId, episodeNumber },
  });
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'Episode number already exists' } });
  }

  const episode = await prisma.dramaEpisode.create({
    data: { shortDramaId, episodeNumber, title, synopsis, duration },
  });

  res.status(201).json({ success: true, data: episode });
});

router.put('/:id', validate(updateEpisodeSchema), async (req: Request, res: Response) => {
  const episode = await prisma.dramaEpisode.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: episode });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.dramaEpisode.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;