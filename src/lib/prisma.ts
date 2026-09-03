import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { DEFAULT_SQLITE_BASE64 } from './db-seed-fallback';

function getDatabaseUrl(): string {
  // If user provided a remote network database (PostgreSQL, Supabase, Neon, etc.), use it directly
  const envUrl = process.env.DATABASE_URL;
  if (
    envUrl &&
    !envUrl.startsWith('file:./') &&
    !envUrl.startsWith('file:../') &&
    (envUrl.startsWith('postgres://') ||
      envUrl.startsWith('postgresql://') ||
      envUrl.startsWith('mysql://') ||
      envUrl.startsWith('libsql://'))
  ) {
    return envUrl;
  }

  // On local development (Windows / non-serverless), use normal local file
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    (process.env.NODE_ENV === 'production' && !process.platform.startsWith('win'))
  );

  if (!isServerless) {
    const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    return `file:${localDbPath}`;
  }

  // On Vercel / AWS Lambda serverless production:
  // /var/task is strictly READ-ONLY. SQLite cannot open, lock, or write there.
  // /tmp is a writable temporary filesystem. We ensure /tmp/dev.db exists.
  const tmpDbPath = path.join('/tmp', 'dev.db');

  try {
    if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
      const possibleSources = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join('/var/task', 'prisma', 'dev.db'),
        path.join('/var/task', 'dev.db'),
        path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      ];

      let copied = false;
      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            copied = true;
            console.log(`[Prisma Vercel] Successfully initialized /tmp/dev.db from ${src}`);
            break;
          } catch (e) {
            console.warn(`[Prisma Vercel] Failed to copy from ${src}:`, e);
          }
        }
      }

      // If source file was not found in filesystem, use the embedded base64 database
      if (!copied && DEFAULT_SQLITE_BASE64) {
        fs.writeFileSync(tmpDbPath, Buffer.from(DEFAULT_SQLITE_BASE64, 'base64'));
        console.log('[Prisma Vercel] Successfully initialized /tmp/dev.db from embedded base64 store');
      }
    }
  } catch (err) {
    console.error('[Prisma Vercel] Error setting up /tmp/dev.db:', err);
  }

  return `file:${tmpDbPath}`;
}

const resolvedDbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
