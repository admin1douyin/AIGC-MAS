import type { IncomingMessage, ServerResponse } from 'http';
// Static import so Vercel's builder traces & bundles the full server dependency
// tree (express, prisma, routes, etc.) into the serverless function.
import app, { ensureInitialized } from '../packages/server/dist/app';

/**
 * Vercel Serverless Function - Single API handler for ALL /api/* routes.
 *
 * Why a single file instead of catch-all `[...path].ts`?
 * Vercel's file-based catch-all `[...path]` does not reliably match
 * multi-segment paths (e.g. /api/agents/registry/list). This file is
 * routed via vercel.json `rewrites` instead, which correctly handles
 * all /api/* paths regardless of segment count.
 *
 * URL preservation:
 * Vercel rewrites preserve the original URL in req.url, so Express
 * sees the correct path (e.g. /api/agents/registry/list) and routes
 * accordingly. The destination /api/main only determines which
 * function to invoke.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log(`[API] ${req.method} ${req.url}`);

  // Fallback: if Vercel set req.url to the destination path, recover
  // the original URL from the x-forwarded-uri header.
  const forwardedUri = req.headers['x-forwarded-uri'] as string | undefined;
  if (forwardedUri && req.url !== forwardedUri) {
    console.log(`[API] Recovering original URL: ${forwardedUri} (was ${req.url})`);
    req.url = forwardedUri;
  }

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
