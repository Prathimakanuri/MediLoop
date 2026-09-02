import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json(); // 'ACCEPT' or 'REJECT' or 'CANCEL'

    if (!action || !['ACCEPT', 'REJECT', 'CANCEL'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const request = await prisma.equipmentRequest.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
        requester: { include: { facility: true } },
        provider: true,
        booking: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'CANCEL') {
      const updated = await prisma.equipmentRequest.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'REJECT') {
      const updated = await prisma.equipmentRequest.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      });

      // Send rejection notification to requester
      await prisma.notification.create({
        data: {
          userId: request.requesterId,
          title: `Request Declined: ${request.equipment.name}`,
          message: `${request.provider.name} was unable to fulfill your rental request for ${request.equipment.name}.`,
          type: 'REQUEST_REJECTED',
          linkUrl: '/requests',
        },
      });

      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'ACCEPT') {
      // 1. Update request status
      const updatedRequest = await prisma.equipmentRequest.update({
        where: { id: params.id },
        data: { status: 'ACCEPTED' },
      });

      // 2. Generate unique booking number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const bookingNumber = `ML-2026-${randomSuffix}`;

      // 3. Create or find confirmed booking
      let booking = request.booking;
      if (!booking) {
        booking = await prisma.booking.create({
          data: {
            bookingNumber,
            requestId: request.id,
            equipmentId: request.equipmentId,
            requesterId: request.requesterId,
            providerId: request.providerId,
            startDate: request.startDate,
            endDate: request.endDate,
            totalDays: request.totalDays,
            pricePerDay: request.equipment.pricePerDay,
            totalAmount: request.estimatedCost,
            deposit: request.equipment.depositAmount,
            status: 'CONFIRMED',
            deliveryAddress: request.requester.facility?.address || 'Civil Lines, Near Hospital Square',
            trackingNotes: 'Dispatched via Mediloop Verified Healthcare Logistics. Expected handover in 2-4 hours.',
            handoverDate: request.startDate,
          },
        });
      }

      // 4. Create Notification for Requester
      await prisma.notification.create({
        data: {
          userId: request.requesterId,
          title: `Booking Confirmed: ${request.equipment.name}`,
          message: `Great news! ${request.provider.name} accepted your request. Booking #${booking.bookingNumber} is confirmed.`,
          type: 'BOOKING_CONFIRMED',
          linkUrl: `/bookings/${booking.id}`,
        },
      });

      // 5. Create Notification for Provider
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Rental Request Accepted`,
          message: `You confirmed booking #${booking.bookingNumber} for ${request.equipment.name}.`,
          type: 'BOOKING_CONFIRMED',
          linkUrl: `/provider`,
        },
      });

      return NextResponse.json({
        success: true,
        request: updatedRequest,
        booking,
      });
    }

    return NextResponse.json({ error: 'Unhandled action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating request status:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
