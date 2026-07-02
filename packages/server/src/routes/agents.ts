import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { agentEngine } from '../agents/AgentEngine';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (role) where.role = role;
    if (status) where.status = status;

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: agents });
  } catch (error: any) {
    console.error('Get agents error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
        sentMessages: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!agent) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    }

    res.json({ success: true, data: agent });
  } catch (error: any) {
    console.error('Get agent error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const agentId = req.params.id;
    const projectId = req.query.projectId as string;

    const where: any = {
      OR: [{ fromAgentId: agentId }, { toAgentId: agentId }],
    };
    if (projectId) where.projectId = projectId;

    const messages = await prisma.agentMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        fromAgent: { select: { id: true, name: true, role: true } },
        toAgent: { select: { id: true, name: true, role: true } },
      },
    });

    res.json({ success: true, data: messages.reverse() });
  } catch (error: any) {
    console.error('Get agent messages error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/registry/list', requireAuth, async (_req: Request, res: Response) => {
  try {
    const registry = agentEngine.getAgentRegistry();
    res.json({ success: true, data: registry });
  } catch (error: any) {
    console.error('Get agent registry error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
