import { PrismaClient } from '@prisma/client';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  const isProductionRuntime = process.env.NODE_ENV === 'production';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );

  const isPersistentFileDatabase = Boolean(envUrl && envUrl.startsWith('file:/'));

  if (isPersistentFileDatabase && (process.env.MEDILOOP_PERSISTENT_DISK === 'true' || !isProductionRuntime)) {
    return envUrl!;
  }

  if ((!isProductionRuntime && !isServerless) || isBuildPhase) {
    const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    return `file:${localDbPath}`;
  }

  throw new Error(
    'Production requires a persistent SQLite DATABASE_URL on a mounted disk. ' +
    'Ephemeral serverless filesystems are not supported by this application.'
  );
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
