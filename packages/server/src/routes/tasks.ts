import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { agentEngine } from '../agents/AgentEngine';

const router = Router();

const createTaskSchema = z.object({
  projectId: z.string(),
  agentRole: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  inputData: z.any().optional(),
  dependsOn: z.array(z.string()).optional(),
});

router.get('/', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;
  const agentId = req.query.agentId as string;
  const status = req.query.status as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (agentId) where.agentId = agentId;
  if (status) where.status = status;

  const tasks = await prisma.agentTask.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, data: tasks });
});

router.get('/:id', async (req: Request, res: Response) => {
  const task = await prisma.agentTask.findUnique({
    where: { id: req.params.id },
    include: {
      agent: true,
      project: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!task) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
  }

  res.json({ success: true, data: task });
});

router.post('/', validate(createTaskSchema), async (req: Request, res: Response) => {
  const data = req.body;

  const task = await prisma.agentTask.create({
    data: {
      projectId: data.projectId,
      agentRole: data.agentRole,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      inputData: data.inputData || {},
      dependsOn: data.dependsOn || [],
      status: 'pending',
    },
  });

  res.status(201).json({ success: true, data: task });
});

router.post('/:id/execute', async (req: Request, res: Response) => {
  const task = await prisma.agentTask.findUnique({ where: { id: req.params.id } });
  if (!task) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
  }

  agentEngine.executeTask(task.id).catch(console.error);

  res.json({ success: true, message: 'Task execution started' });
});

export default router;
