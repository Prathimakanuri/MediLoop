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

    const { action } = await req.json(); // 'ACCEPT' | 'REJECT' | 'CANCEL'

    const request = await prisma.equipmentRequest.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
        provider: true,
        requester: { include: { facility: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'REJECT') {
      const updatedRequest = await prisma.equipmentRequest.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      });

      // Notify Customer of Rejection
      await prisma.notification.create({
        data: {
          userId: request.requesterId,
          title: `Request Declined: ${request.equipment.name}`,
          message: `Your equipment request for ${request.equipment.name} was declined by ${request.provider.name}.`,
          type: 'REQUEST_REJECTED',
          linkUrl: `/requests`,
        },
      });

      return NextResponse.json({
        success: true,
        request: updatedRequest,
        message: 'Request declined. Requester has been notified.',
      });
    }

    if (action === 'ACCEPT') {
      const updatedRequest = await prisma.equipmentRequest.update({
        where: { id: params.id },
        data: { status: 'ACCEPTED' },
      });

      // Check if booking already exists or create new AWAITING_PAYMENT booking
      let booking = await prisma.booking.findUnique({
        where: { requestId: request.id },
      });

      if (!booking) {
        const bookingNum = `ML-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        booking = await prisma.booking.create({
          data: {
            bookingNumber: bookingNum,
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
            status: 'AWAITING_PAYMENT',
            paymentStatus: 'PAYMENT_REQUIRED',
          },
        });
      } else {
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'AWAITING_PAYMENT',
            paymentStatus: 'PAYMENT_REQUIRED',
          },
        });
      }

      // Notify Customer: Request accepted & Payment Required
      await prisma.notification.create({
        data: {
          userId: request.requesterId,
          title: `Request Accepted — Payment Required`,
          message: `Your request for ${request.equipment.name} has been accepted by ${request.provider.name}. Payment of ₹${request.estimatedCost.toLocaleString('en-IN')} is required to confirm your booking.`,
          type: 'PAYMENT_REQUIRED',
          linkUrl: `/bookings/${booking.id}`,
        },
      });

      return NextResponse.json({
        success: true,
        request: updatedRequest,
        booking,
        message: 'Request accepted! Booking is now awaiting customer payment.',
      });
    }

    if (action === 'CANCEL') {
      const updatedRequest = await prisma.equipmentRequest.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json({ success: true, request: updatedRequest });
    }

    return NextResponse.json({ error: 'Invalid status action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating request status:', err);
    return NextResponse.json({ error: err.message || 'Failed to update request status' }, { status: 500 });
  }
}
