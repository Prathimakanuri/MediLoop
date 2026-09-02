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
    const view = searchParams.get('view'); // 'provider' or 'customer'

    let requests;
    if (view === 'provider' || user.role === 'PROVIDER') {
      // Find all requests for equipment owned by this provider / facility
      requests = await prisma.equipmentRequest.findMany({
        where: {
          OR: [
            { providerId: user.facilityId || '' },
            { providerId: user.id },
            { equipment: { providerId: user.facilityId || '' } },
            { equipment: { provider: { users: { some: { id: user.id } } } } },
          ],
        },
        include: {
          equipment: { include: { category: true, provider: true } },
          requester: { include: { facility: true } },
          provider: true,
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Customer view: only their own requests
      requests = await prisma.equipmentRequest.findMany({
        where: { requesterId: user.id },
        include: {
          equipment: { include: { category: true, provider: true } },
          provider: true,
          requester: { include: { facility: true } },
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error('Error fetching requests:', err);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { equipmentId, startDate, endDate, totalDays, estimatedCost, purpose, urgency, message } = body;

    if (!equipmentId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required request parameters' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { provider: { include: { users: true } } },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Safely calculate total rental days and ensure it's a valid positive integer (never NaN)
    let days = Number(totalDays);
    if (isNaN(days) || days <= 0) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      days = diffDays > 0 ? diffDays : 1;
    }

    // Safely calculate estimated cost (never NaN)
    let cost = Number(estimatedCost);
    if (isNaN(cost) || cost <= 0) {
      cost = days * (equipment.pricePerDay || 1000);
    }

    // 1. Create the EquipmentRequest with PENDING status (DOES NOT create confirmed booking)
    const request = await prisma.equipmentRequest.create({
      data: {
        equipment: { connect: { id: equipment.id } },
        requester: { connect: { id: user.id } },
        provider: { connect: { id: equipment.providerId } },
        startDate,
        endDate,
        totalDays: Math.round(days),
        estimatedCost: Math.round(cost),
        purpose: purpose || 'ICU Support',
        urgency: urgency || 'STANDARD',
        message: message || '',
        status: 'PENDING',
      },
      include: {
        equipment: true,
        provider: true,
        requester: { include: { facility: true } },
      },
    });

    // 2. Dispatch Notification strictly to the equipment provider user(s)
    const providerUsers = await prisma.user.findMany({
      where: {
        OR: [
          { facilityId: equipment.providerId },
          { id: equipment.providerId },
          { facility: { equipment: { some: { id: equipment.id } } } },
        ],
      },
    });

    for (const pUser of providerUsers) {
      await prisma.notification.create({
        data: {
          userId: pUser.id,
          title: `New Equipment Request: ${equipment.name}`,
          message: `${user.name} (${user.facility?.name || 'Customer'}) requested ${equipment.name} for ${request.totalDays} days (${startDate} to ${endDate}).`,
          type: 'REQUEST_RECEIVED',
          linkUrl: `/requests`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      request,
      message: 'Request submitted successfully! The provider has been notified and will review your request.',
    });
  } catch (err: any) {
    console.error('Error creating request:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit request' }, { status: 500 });
  }
}
