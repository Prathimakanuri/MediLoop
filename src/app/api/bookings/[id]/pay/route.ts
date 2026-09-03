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

    const { paymentMethod, transactionId, simulateFailure } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
        provider: { include: { users: true } },
        requester: { include: { facility: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking record not found.' }, { status: 404 });
    }

    if (user.role !== 'CUSTOMER' || booking.requesterId !== user.id) {
      return NextResponse.json({ error: 'Only the requesting customer can pay for this booking.' }, { status: 403 });
    }

    if (!['PAYMENT_REQUIRED', 'FAILED'].includes(booking.paymentStatus) || booking.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json({ error: 'This booking is not awaiting online payment.' }, { status: 400 });
    }

    // SIMULATED PAYMENT FAILURE FLOW
    if (simulateFailure) {
      const failedBooking = await prisma.booking.update({
        where: { id: params.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'AWAITING_PAYMENT', // Booking remains AWAITING_PAYMENT on failure
        },
        include: {
          equipment: { include: { category: true, provider: true } },
          provider: true,
          requester: { include: { facility: true } },
        },
      });

      // Notification to Customer on Failure
      await prisma.notification.create({
        data: {
          userId: booking.requesterId,
          title: `Payment Failed: Booking #${booking.bookingNumber}`,
          message: `Payment could not be completed for ${booking.equipment.name}. Please retry payment to confirm your booking.`,
          type: 'PAYMENT_FAILED',
          linkUrl: `/bookings/${booking.id}`,
        },
      });

      return NextResponse.json({
        success: false,
        paymentStatus: 'FAILED',
        booking: failedBooking,
        error: 'We could not complete your online payment. Please retry or choose another payment method.',
      });
    }

    // SUCCESSFUL PAYMENT FLOW
    // Format: MLTX-2026-XXXXXX as specified in user requirement #13
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const txnId = transactionId || `MLTX-2026-${randomSuffix}`;
    const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const paidAt = new Date().toISOString();

    // 1. Create/Update Payment Record in Database
    const paymentRecord = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: booking.totalAmount,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'UPI',
        transactionId: txnId,
        paymentDate: new Date(),
      },
      create: {
        paymentId,
        bookingId: booking.id,
        customerId: booking.requesterId,
        providerId: booking.providerId,
        amount: booking.totalAmount,
        currency: 'INR',
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'UPI',
        transactionId: txnId,
      },
    });

    // 2. Update Booking Status to CONFIRMED & Payment Status to PAID
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED', // Booking becomes CONFIRMED ONLY after successful payment
        paymentMethod: paymentMethod || 'UPI',
        transactionId: txnId,
        paidAt: paidAt,
      },
      include: {
        equipment: { include: { category: true, provider: true } },
        provider: true,
        requester: { include: { facility: true } },
        payment: true,
      },
    });

    // 3. Notify Customer of Success
    await prisma.notification.create({
      data: {
        userId: booking.requesterId,
        title: `Payment Successful — Booking Confirmed!`,
        message: `Payment of ₹${booking.totalAmount.toLocaleString('en-IN')} completed successfully via ${paymentMethod || 'UPI'}. Booking #${booking.bookingNumber} for ${booking.equipment.name} is now confirmed.`,
        type: 'PAYMENT_CONFIRMED',
        linkUrl: `/bookings/${booking.id}`,
      },
    });

    // 4. Notify Provider User(s) of Payment Receipt
    let providerUsers = booking.provider?.users || [];
    if (providerUsers.length === 0 && booking.providerId) {
      providerUsers = await prisma.user.findMany({
        where: {
          OR: [
            { facilityId: booking.providerId },
            { id: booking.providerId },
          ],
        },
      });
    }

    for (const pUser of providerUsers) {
      await prisma.notification.create({
        data: {
          userId: pUser.id,
          title: `Payment Received: ${booking.equipment.name}`,
          message: `Payment of ₹${booking.totalAmount.toLocaleString('en-IN')} received from ${booking.requester.name} (${booking.requester.facility?.name || 'Customer'}). Booking #${booking.bookingNumber} is confirmed.`,
          type: 'BOOKING_CONFIRMED',
          linkUrl: `/bookings`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      payment: paymentRecord,
      message: 'Payment completed successfully. Booking is now confirmed.',
    });
  } catch (err: any) {
    console.error('Payment processing error:', err);
    return NextResponse.json({ error: err.message || 'Payment processing failed.' }, { status: 500 });
  }
}
