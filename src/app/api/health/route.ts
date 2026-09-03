import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    console.error('Health check database failure:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { status: 'error', database: 'unavailable' },
      { status: 503 }
    );
  }
}