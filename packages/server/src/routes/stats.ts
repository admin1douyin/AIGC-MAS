import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/overview', async (_req: Request, res: Response) => {
  const [totalProjects, totalAgents, totalTasks, totalScripts] = await Promise.all([
    prisma.project.count(),
    prisma.agent.count(),
    prisma.agentTask.count(),
    prisma.videoScript.count(),
  ]);

  const inProgressProjects = await prisma.project.count({ where: { status: 'in_production' } });
  const completedProjects = await prisma.project.count({ where: { status: 'completed' } });

  const byType = {
    short_drama: await prisma.project.count({ where: { type: 'short_drama' } }),
    corporate_video: await prisma.project.count({ where: { type: 'corporate_video' } }),
    tourism_promo: await prisma.project.count({ where: { type: 'tourism_promo' } }),
  };

  const recentProjects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, type: true, status: true, progress: true, createdAt: true },
  });

  res.json({
    success: true,
    data: {
      totalProjects,
      totalAgents,
      totalTasks,
      totalScripts,
      inProgressProjects,
      completedProjects,
      byType,
      recentProjects,
    },
  });
});

router.get('/projects/trend', async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true, type: true },
  });

  res.json({ success: true, data: projects });
});

export default router;
