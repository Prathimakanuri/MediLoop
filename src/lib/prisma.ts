import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { DEFAULT_SQLITE_BASE64 } from './db-seed-fallback';

function tryInitializeLocation(candidatePath: string): boolean {
  try {
    const dir = path.dirname(candidatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileExists = fs.existsSync(candidatePath);
    const isEmpty = fileExists && fs.statSync(candidatePath).size === 0;

    if (!fileExists || isEmpty) {
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb) && fs.statSync(sourceDb).size > 0 && path.resolve(sourceDb) !== path.resolve(candidatePath)) {
        fs.copyFileSync(sourceDb, candidatePath);
      } else if (DEFAULT_SQLITE_BASE64) {
        fs.writeFileSync(candidatePath, Buffer.from(DEFAULT_SQLITE_BASE64, 'base64'));
      }
    }

    // Verify read and write access
    fs.accessSync(candidatePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function initDatabase(): string {
  const envUrl = process.env.DATABASE_URL;

  // If using external hosted database (PostgreSQL, MySQL, etc.)
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  const candidates: string[] = [];

  // Candidate 1: User-configured DATABASE_URL
  if (envUrl && envUrl.startsWith('file:')) {
    const rawPath = envUrl.replace(/^file:/, '');
    if (path.isAbsolute(rawPath)) {
      candidates.push(rawPath);
    } else if (rawPath.startsWith('./dev.db') || rawPath === 'dev.db') {
      candidates.push(path.join(process.cwd(), 'prisma', 'dev.db'));
    } else {
      candidates.push(path.resolve(process.cwd(), rawPath));
    }
  }

  // Candidate 2: Project prisma directory
  candidates.push(path.join(process.cwd(), 'prisma', 'dev.db'));

  // Candidate 3: Project root directory
  candidates.push(path.join(process.cwd(), 'dev.db'));

  // Candidate 4: Operating system temp directory (always writable on Linux/Render)
  candidates.push(path.join(os.tmpdir(), 'mediloop.db'));

  for (const candidate of candidates) {
    if (tryInitializeLocation(candidate)) {
      console.log(`[MediLoop DB] Connected to verified writable database: ${candidate}`);
      return `file:${candidate}`;
    }
  }

  const fallback = path.join(os.tmpdir(), 'mediloop.db');
  return `file:${fallback}`;
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
