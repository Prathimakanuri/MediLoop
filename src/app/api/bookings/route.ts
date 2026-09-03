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
    const view = searchParams.get('view');

    let bookings;
    if (user.role === 'PROVIDER') {
      if (!user.facilityId) {
        return NextResponse.json({ error: 'Provider is not linked to a facility' }, { status: 403 });
      }
      bookings = await prisma.booking.findMany({
        where: { providerId: user.facilityId },
        include: {
          equipment: { include: { category: true } },
          requester: { include: { facility: true } },
          provider: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (view === 'provider') {
      return NextResponse.json({ error: 'Provider access required' }, { status: 403 });
    } else {
      bookings = await prisma.booking.findMany({
        where: { requesterId: user.id },
        include: {
          equipment: { include: { category: true, provider: true } },
          provider: true,
          requester: { include: { facility: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ bookings });
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
