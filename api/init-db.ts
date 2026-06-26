/**
 * Database Initialization Script for Vercel Serverless Deployment
 * 
 * This script runs during the Vercel build process to:
 * 1. Generate Prisma Client
 * 2. Apply database migrations
 * 3. Seed initial data (optional)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('[DB-INIT] Starting database initialization...');

const projectRoot = path.join(process.cwd(), 'packages/server');
const prismaDir = path.join(projectRoot, 'prisma');

// Check if Prisma schema exists
const schemaPath = path.join(prismaDir, 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('[DB-INIT] ERROR: Prisma schema not found at', schemaPath);
  process.exit(1);
}

console.log('[DB-INIT] Prisma schema found:', schemaPath);

// Generate Prisma Client
console.log('[DB-INIT] Generating Prisma Client...');
try {
  execSync('npx prisma generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('[DB-INIT] Prisma Client generated successfully');
} catch (error) {
  console.error('[DB-INIT] ERROR: Failed to generate Prisma Client');
  console.error(error);
  process.exit(1);
}

// In production, apply migrations
if (process.env.NODE_ENV === 'production') {
  console.log('[DB-INIT] Applying database migrations...');
  try {
    // Check if migrations folder exists
    const migrationsDir = path.join(prismaDir, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      execSync('npx prisma migrate deploy', {
        cwd: projectRoot,
        stdio: 'inherit',
        env: process.env,
      });
      console.log('[DB-INIT] Migrations applied successfully');
    } else {
      console.log('[DB-INIT] No migrations folder found, using db push...');
      execSync('npx prisma db push --accept-data-loss', {
        cwd: projectRoot,
        stdio: 'inherit',
        env: process.env,
      });
      console.log('[DB-INIT] Database schema pushed successfully');
    }
  } catch (error) {
    console.error('[DB-INIT] ERROR: Failed to apply migrations');
    console.error(error);
    // Don't exit, allow deployment to continue with existing schema
  }
}

console.log('[DB-INIT] Database initialization completed');