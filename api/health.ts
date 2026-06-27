// Standalone health check endpoint - no external dependencies
// Used to test if Vercel serverless functions work at all

export default function handler(_req: any, res: any) {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      message: 'Health check from standalone endpoint',
    },
  });
}
