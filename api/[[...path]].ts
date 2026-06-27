import type { IncomingMessage, ServerResponse } from 'http';
// Static import so Vercel's builder traces & bundles the full server dependency
// tree (express, prisma, routes, etc.) into the serverless function.
import app, { ensureInitialized } from '../packages/server/dist/app';

/**
 * Vercel Serverless Function - Catch-all API handler
 *
 * Routes ALL /api/* requests (except /api/health) to the Express application.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureInitialized();
  } catch (initError) {
    console.error('[API] Initialization failed:', initError);
  }
  return app(req, res);
}
