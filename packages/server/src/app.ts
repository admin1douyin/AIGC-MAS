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
import videoGenerationRoutes from './routes/videoGeneration';
import templateRoutes from './routes/templates';
import agentChatRoutes from './routes/agentChat';
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
      runtime: 'vercel-serverless',
    },
  });
});

// Diagnostic endpoint - checks DB connection without hanging
app.get('/api/debug/db', async (_req: Request, res: Response) => {
  const dbUrlSet = !!process.env.DATABASE_URL;
  const directUrlSet = !!process.env.DIRECT_URL;
  const supabaseUrl = process.env.SUPABASE_URL || 'NOT SET';
  const region = process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown';

  // Mask the DB URL for safe display
  let dbUrlMasked = 'NOT SET';
  if (dbUrlSet) {
    const url = process.env.DATABASE_URL!;
    dbUrlMasked = url.replace(/:[^:@]+@/, ':***@');
  }

  // Try a quick DB query with 8s timeout
  let dbStatus = 'unknown';
  let dbError = '';
  const startTime = Date.now();

  try {
    const queryPromise = prisma.$queryRaw`SELECT 1 as test`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB query timeout after 8s')), 8000)
    );
    await Promise.race([queryPromise, timeoutPromise]);
    dbStatus = 'connected';
  } catch (error: any) {
    dbStatus = 'error';
    dbError = error?.message || String(error);
  }

  // Check Supabase keys
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKeyParts = anonKey ? anonKey.split('.').length : 0;
  const serviceKeyParts = serviceKey ? serviceKey.split('.').length : 0;

  // Test Supabase REST API with anon key
  let supabaseApiStatus = 'unknown';
  let supabaseApiError = '';
  try {
    const testUrl = `${supabaseUrl}/rest/v1/`;
    const fetchPromise = fetch(testUrl, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const apiTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase API timeout after 8s')), 8000)
    );
    const apiResponse = await Promise.race([fetchPromise, apiTimeout]) as globalThis.Response;
    const statusCode = apiResponse.status;
    if (statusCode === 200) {
      supabaseApiStatus = 'ok';
    } else if (statusCode === 401) {
      supabaseApiStatus = 'invalid_key';
      supabaseApiError = '401 Unauthorized - API key is invalid';
    } else {
      supabaseApiStatus = `http_${statusCode}`;
    }
  } catch (error: any) {
    supabaseApiStatus = 'error';
    supabaseApiError = error?.message || String(error);
  }

  res.json({
    success: true,
    data: {
      region,
      database: {
        urlSet: dbUrlSet,
        directUrlSet,
        urlMasked: dbUrlMasked,
        status: dbStatus,
        error: dbError || undefined,
        queryTimeMs: Date.now() - startTime,
      },
      supabaseUrl,
      supabaseKeys: {
        anonKeySet: !!anonKey,
        anonKeyLength: anonKey.length,
        anonKeyParts, // Should be 3 for a valid JWT
        serviceKeySet: !!serviceKey,
        serviceKeyLength: serviceKey.length,
        serviceKeyParts, // Should be 3 for a valid JWT
      },
      supabaseApi: {
        status: supabaseApiStatus,
        error: supabaseApiError || undefined,
      },
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
app.use('/api/video-generation', videoGenerationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/agent-chat', agentChatRoutes);

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
