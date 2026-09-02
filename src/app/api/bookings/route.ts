import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const view = searchParams.get('view'); // 'provider' or 'requester'

    const where: any = {};

    if (view === 'provider' && user.facilityId) {
      where.providerId = user.facilityId;
    } else {
      where.requesterId = user.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: {
          include: { category: true, provider: true },
        },
        requester: {
          include: { facility: true },
        },
        provider: true,
        request: true,
      },
    });

    return NextResponse.json({ bookings, count: bookings.length });
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
