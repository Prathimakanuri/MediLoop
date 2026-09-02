import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (err: any) {
    console.error('Error fetching single booking:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
