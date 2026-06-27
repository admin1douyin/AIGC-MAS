import type { IncomingMessage, ServerResponse } from 'http';

type AppHandler = (req: IncomingMessage, res: ServerResponse) => void;
type EnsureInitialized = () => Promise<void>;

let _app: AppHandler | null = null;
let _ensureInitialized: EnsureInitialized | null = null;
let _loadError: Error | null = null;

/**
 * Lazy-load the Express app so module loading errors can be caught
 * and reported, instead of causing FUNCTION_INVOCATION_FAILED.
 * @vercel/nft traces the dynamic import to bundle all server deps.
 */
async function loadServer(): Promise<{ app: AppHandler; ensureInitialized: EnsureInitialized }> {
  if (_loadError) throw _loadError;
  if (_app && _ensureInitialized) return { app: _app, ensureInitialized: _ensureInitialized };

  try {
    const mod = await import('../packages/server/dist/app');
    _app = mod.default;
    _ensureInitialized = mod.ensureInitialized;
    return { app: _app!, ensureInitialized: _ensureInitialized! };
  } catch (error: any) {
    _loadError = error;
    throw error;
  }
}

/**
 * Vercel Serverless Function - Single API handler for ALL /api/* routes.
 *
 * Routed via vercel.json `rewrites` (not file-based catch-all) because
 * Vercel's [...path] catch-all does not reliably match multi-segment paths.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  console.log(`[API] ${req.method} ${req.url}`);

  try {
    const { app, ensureInitialized } = await loadServer();

    // Recover original URL if Vercel rewrote it to /api/main
    const forwardedUri = req.headers['x-forwarded-uri'] as string | undefined;
    if (forwardedUri && req.url !== forwardedUri) {
      console.log(`[API] Recovering original URL: ${forwardedUri} (was ${req.url})`);
      req.url = forwardedUri;
    }

    try {
      await ensureInitialized();
    } catch (initError) {
      console.error('[API] Initialization failed:', initError);
    }

    return app(req, res);
  } catch (error: any) {
    console.error('[API] Handler error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error?.message || 'Internal server error',
          stack: error?.stack?.split('\n').slice(0, 5),
        },
      }));
    }
  }
}
