import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { validateEnv } from './lib/env-validator';
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
import { agentEngine } from './agents/AgentEngine';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
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

app.use(notFoundHandler);
app.use(errorHandler);

const server = createServer(app);

async function bootstrap() {
  try {
    // Validate environment variables before starting
    validateEnv();
    
    await prisma.$connect();
    console.log('[Database] Connected successfully');

    await agentEngine.initialize();
    console.log('[AgentEngine] Initialized successfully');

    server.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Bootstrap] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGINT', async () => {
  console.log('[Server] Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
