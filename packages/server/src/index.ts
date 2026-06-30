import { createServer } from 'http';
import app, { ensureInitialized } from './app';
import { validateEnv } from './lib/env-validator';

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    // Validate environment variables before starting (required for production)
    validateEnv();
    
    await ensureInitialized();
    const server = createServer(app);
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
  const { prisma } = await import('./lib/prisma');
  await prisma.$disconnect();
  process.exit(0);
});
