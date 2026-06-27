import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import projectRoutes from './routes/projects';
import agentRoutes from './routes/agents';
import taskRoutes from './routes/tasks';
import scriptRoutes from './routes/scripts';
import assetRoutes from './routes/assets';
import shortDramaRoutes from './routes/shortDrama';
import corporateRoutes from './routes/corporate';
import tourismRoutes from './routes/tourism';
import statsRoutes from './routes/stats';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';
import episodeRoutes from './routes/episodes';
import brandProfileRoutes from './routes/brandProfiles';
import tourismResourceRoutes from './routes/tourismResources';
import organizationRoutes from './routes/organizations';
import { agentEngine } from './agents/AgentEngine';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

app.use('/api/projects', projectRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/short-drama', shortDramaRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/tourism', tourismRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/brand-profiles', brandProfileRoutes);
app.use('/api/tourism-resources', tourismResourceRoutes);
app.use('/api/organizations', organizationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Lazy initialization flag - runs once per serverless instance (cold start)
let initialized = false;

export async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await prisma.$connect();
    await agentEngine.initialize();
    console.log('[Server] Initialized (DB connected + AgentEngine ready)');
  } catch (error) {
    console.error('[Server] Initialization error:', error);
    // Reset flag so it can retry on next request
    initialized = false;
  }
}

export default app;
