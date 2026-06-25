import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const createAssetSchema = z.object({
  projectId: z.string(),
  type: z.enum(['clip', 'image', 'audio', 'music', 'voiceover', 'subtitle']),
  name: z.string(),
  url: z.string(),
  duration: z.number().optional(),
  metadata: z.any().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;
  const type = req.query.type as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (type) where.type = type;

  const assets = await prisma.videoAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: assets });
});

router.get('/:id', async (req: Request, res: Response) => {
  const asset = await prisma.videoAsset.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!asset) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
  }

  res.json({ success: true, data: asset });
});

router.post('/', validate(createAssetSchema), async (req: Request, res: Response) => {
  const asset = await prisma.videoAsset.create({ data: req.body });
  res.status(201).json({ success: true, data: asset });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.videoAsset.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
