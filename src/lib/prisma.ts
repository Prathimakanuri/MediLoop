import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { DEFAULT_SQLITE_BASE64 } from './db-seed-fallback';

function initDatabase(): string {
  const envUrl = process.env.DATABASE_URL;
  let targetPath: string;

  if (envUrl && envUrl.startsWith('file:')) {
    const rawPath = envUrl.replace(/^file:/, '');
    if (path.isAbsolute(rawPath)) {
      targetPath = rawPath;
    } else if (rawPath.startsWith('./dev.db') || rawPath === 'dev.db') {
      targetPath = path.join(process.cwd(), 'prisma', 'dev.db');
    } else {
      targetPath = path.resolve(process.cwd(), rawPath);
    }
  } else if (envUrl && !envUrl.startsWith('file:')) {
    // Non-sqlite database URL (PostgreSQL, MySQL, etc.)
    return envUrl;
  } else {
    targetPath = path.join(process.cwd(), 'prisma', 'dev.db');
  }

  // Ensure target directory exists
  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If target file doesn't exist or is 0 bytes, populate it with seed database
    const fileExists = fs.existsSync(targetPath);
    const isEmpty = fileExists && fs.statSync(targetPath).size === 0;

    if (!fileExists || isEmpty) {
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb) && fs.statSync(sourceDb).size > 0 && sourceDb !== targetPath) {
        fs.copyFileSync(sourceDb, targetPath);
        console.log(`[MediLoop DB] Copied pre-seeded database to ${targetPath}`);
      } else if (DEFAULT_SQLITE_BASE64) {
        fs.writeFileSync(targetPath, Buffer.from(DEFAULT_SQLITE_BASE64, 'base64'));
        console.log(`[MediLoop DB] Initialized fresh SQLite database at ${targetPath}`);
      }
    }
  } catch (err) {
    console.error('[MediLoop DB] Auto-initialization notice:', err);
  }

  return `file:${targetPath}`;
}

const resolvedDbUrl = initDatabase();

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
