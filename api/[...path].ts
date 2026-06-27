import type { IncomingMessage, ServerResponse } from 'http';
// Static import so Vercel's builder traces & bundles the full server dependency
// tree (express, prisma, routes, etc.) into the serverless function.
import app, { ensureInitialized } from '../packages/server/dist/app';

/**
 * Vercel Serverless Function - Catch-all API handler
 *
 * Routes ALL /api/* requests (except /api/health which has a dedicated file)
 * to the Express application.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Log the incoming path for debugging route matching
  console.log(`[API] ${req.method} ${req.url}`);

  try {
    await ensureInitialized();
  } catch (initError) {
    console.error('[API] Initialization failed:', initError);
    // Continue anyway - some routes (like /api/health) don't need DB
  }

  try {
    return app(req, res);
  } catch (error) {
    console.error('[API] Handler error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      }));
    }
  }
}
