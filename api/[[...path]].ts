import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Vercel Serverless Function - Catch-all API handler
 *
 * Routes ALL /api/* requests (except /api/health) to the Express application.
 * Uses dynamic import to gracefully handle module loading errors.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { default: app, ensureInitialized } = await import('../packages/server/dist/app');
    try {
      await ensureInitialized();
    } catch (initError) {
      console.error('[API] Initialization failed:', initError);
    }
    return app(req, res);
  } catch (error) {
    console.error('[API] Module load failed:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: {
        code: 'MODULE_LOAD_ERROR',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 10) : undefined,
      },
    }));
  }
}
