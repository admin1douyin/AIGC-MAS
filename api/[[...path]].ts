import type { IncomingMessage, ServerResponse } from 'http';
import app, { ensureInitialized } from '../packages/server/dist/app';

/**
 * Vercel Serverless Function - Catch-all API handler
 *
 * Routes ALL /api/* requests to the Express application.
 * This deploys the entire Express backend as a single serverless function.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureInitialized();
  } catch (error) {
    console.error('[API] Initialization failed:', error);
  }
  return app(req, res);
}
