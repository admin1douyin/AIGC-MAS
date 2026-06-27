import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Minimal health check endpoint - no external dependencies.
 * Used to verify the Vercel serverless function itself works.
 */
export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      runtime: 'vercel-serverless',
    },
  }));
}
