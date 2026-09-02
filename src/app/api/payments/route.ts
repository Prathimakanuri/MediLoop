import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payments;
    if (user.role === 'PROVIDER') {
      payments = await prisma.payment.findMany({
        where: {
          OR: [
            { providerId: user.facilityId || '' },
            { providerId: user.id },
            { booking: { providerId: user.facilityId || '' } },
            { booking: { provider: { users: { some: { id: user.id } } } } },
          ],
        },
        include: {
          booking: { include: { equipment: true, requester: { include: { facility: true } } } },
          customer: { include: { facility: true } },
          provider: true,
        },
        orderBy: { paymentDate: 'desc' },
      });
    } else {
      payments = await prisma.payment.findMany({
        where: { customerId: user.id },
        include: {
          booking: { include: { equipment: true, provider: true } },
          provider: true,
          customer: { include: { facility: true } },
        },
        orderBy: { paymentDate: 'desc' },
      });
    }

    return NextResponse.json({ payments });
  } catch (err: any) {
    console.error('Error fetching payments:', err);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
