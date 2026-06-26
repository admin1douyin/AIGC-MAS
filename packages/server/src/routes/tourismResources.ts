import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const createTourismResourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['scenic', 'hotel', 'restaurant', 'activity', 'shopping']),
  location: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  bestTime: z.string().optional(),
  entranceFee: z.string().optional(),
  duration: z.number().optional(),
  images: z.array(z.string()).optional(),
});

const updateTourismResourceSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['scenic', 'hotel', 'restaurant', 'activity', 'shopping']).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  bestTime: z.string().optional(),
  entranceFee: z.string().optional(),
  duration: z.number().optional(),
  images: z.array(z.string()).optional(),
});

router.get('/', async (req: Request, res: Response) => {
  const type = req.query.type as string;

  const where: any = {};
  if (type) where.type = type;

  const resources = await prisma.tourismResource.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: resources });
});

router.get('/:id', async (req: Request, res: Response) => {
  const resource = await prisma.tourismResource.findUnique({
    where: { id: req.params.id },
  });

  if (!resource) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tourism resource not found' } });
  }

  res.json({ success: true, data: resource });
});

router.post('/', validate(createTourismResourceSchema), async (req: Request, res: Response) => {
  const resource = await prisma.tourismResource.create({
    data: req.body,
  });

  res.status(201).json({ success: true, data: resource });
});

router.put('/:id', validate(updateTourismResourceSchema), async (req: Request, res: Response) => {
  const resource = await prisma.tourismResource.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.json({ success: true, data: resource });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.tourismResource.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;