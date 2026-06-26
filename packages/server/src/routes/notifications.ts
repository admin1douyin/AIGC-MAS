import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const read = req.query.read as string;

  const where: any = { profileId: req.profile!.id };
  if (read !== undefined) where.read = read === 'true';

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true, type: true } },
      },
    }),
    prisma.notification.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      items: notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

router.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
  const count = await prisma.notification.count({
    where: { profileId: req.profile!.id, read: false },
  });
  res.json({ success: true, data: { count } });
});

router.put('/:id/read', requireAuth, async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
  }

  if (notification.profileId !== req.profile!.id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
  }

  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });

  res.json({ success: true });
});

router.put('/read-all', requireAuth, async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { profileId: req.profile!.id, read: false },
    data: { read: true },
  });

  res.json({ success: true });
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
  }

  if (notification.profileId !== req.profile!.id) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
  }

  await prisma.notification.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;