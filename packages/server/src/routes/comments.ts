import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

const createCommentSchema = z.object({
  projectId: z.string(),
  content: z.string().min(1),
  parentId: z.string().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;

  if (!projectId) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'projectId is required' } });
  }

  const comments = await prisma.projectComment.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  res.json({ success: true, data: comments });
});

router.post('/', requireAuth, validate(createCommentSchema), async (req: Request, res: Response) => {
  const { projectId, content, parentId } = req.body;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const comment = await prisma.projectComment.create({
    data: {
      projectId,
      authorId: req.profile!.id,
      content,
      parentId,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  res.status(201).json({ success: true, data: comment });
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const comment = await prisma.projectComment.findUnique({ where: { id: req.params.id } });
  if (!comment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } });
  }

  if (comment.authorId !== req.profile!.id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to delete this comment' } });
  }

  await prisma.projectComment.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;