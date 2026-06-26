import express from 'express';
import cors from 'cors';
import { validateEnv } from '../packages/server/src/lib/env-validator';
import { prisma } from '../packages/server/src/lib/prisma';
import { errorHandler } from '../packages/server/src/middleware/errorHandler';
import { notFoundHandler } from '../packages/server/src/middleware/notFound';
import projectRoutes from '../packages/server/src/routes/projects';
import agentRoutes from '../packages/server/src/routes/agents';
import taskRoutes from '../packages/server/src/routes/tasks';
import scriptRoutes from '../packages/server/src/routes/scripts';
import assetRoutes from '../packages/server/src/routes/assets';
import shortDramaRoutes from '../packages/server/src/routes/shortDrama';
import corporateRoutes from '../packages/server/src/routes/corporate';
import tourismRoutes from '../packages/server/src/routes/tourism';
import statsRoutes from '../packages/server/src/routes/stats';
import authRoutes from '../packages/server/src/routes/auth';
import paymentRoutes from '../packages/server/src/routes/payments';
import { agentEngine } from '../packages/server/src/agents/AgentEngine';

let app: express.Express | null = null;
let initialized = false;

async function getApp(): Promise<express.Express> {
  if (app) return app;

  app = express();
  app.set('trust proxy', true);

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ 
      success: true, 
      data: { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      } 
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

  app.use(notFoundHandler);
  app.use(errorHandler);

  if (!initialized) {
    try {
      // Validate environment variables
      validateEnv();
      
      await prisma.$connect();
      await agentEngine.initialize();
      initialized = true;
      console.log('[Vercel API] Application initialized successfully');
    } catch (error) {
      console.error('[Vercel API] Initialization error:', error);
      // Don't throw - allow the app to start and show error in health check
    }
  }

  return app;
}

export default async function handler(
  req: express.Request,
  res: express.Response
) {
  const app = await getApp();
  app(req, res);
}
