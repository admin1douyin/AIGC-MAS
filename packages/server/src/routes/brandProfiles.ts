import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const createBrandProfileSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
  keyMessages: z.array(z.string()).optional(),
  styleGuide: z.object({
    colors: z.array(z.string()).optional(),
    fonts: z.array(z.string()).optional(),
    logoUrl: z.string().url().optional(),
  }).optional(),
  preferredTone: z.string().optional(),
});

const updateBrandProfileSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
  keyMessages: z.array(z.string()).optional(),
  styleGuide: z.object({
    colors: z.array(z.string()).optional(),
    fonts: z.array(z.string()).optional(),
    logoUrl: z.string().url().optional(),
  }).optional(),
  preferredTone: z.string().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  const profiles = await prisma.brandProfile.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: profiles });
});

router.get('/:id', async (req: Request, res: Response) => {
  const profile = await prisma.brandProfile.findUnique({
    where: { id: req.params.id },
  });

  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand profile not found' } });
  }

  res.json({ success: true, data: profile });
});

router.post('/', validate(createBrandProfileSchema), async (req: Request, res: Response) => {
  const profile = await prisma.brandProfile.create({
    data: req.body,
  });

  res.status(201).json({ success: true, data: profile });
});

router.put('/:id', validate(updateBrandProfileSchema), async (req: Request, res: Response) => {
  const profile = await prisma.brandProfile.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: profile });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.brandProfile.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;