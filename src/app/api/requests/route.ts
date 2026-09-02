import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateDays } from '@/lib/utils';

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

    const requests = await prisma.equipmentRequest.findMany({
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
        booking: true,
      },
    });

    return NextResponse.json({ requests, count: requests.length });
  } catch (err: any) {
    console.error('Error querying requests:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to submit a request' }, { status: 401 });
    }

    const body = await req.json();
    const { equipmentId, startDate, endDate, purpose, urgency, message } = body;

    if (!equipmentId || !startDate || !endDate || !purpose) {
      return NextResponse.json(
        { error: 'Equipment, start date, end date, and purpose are required.' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json(
        { error: 'Rental start date cannot be in the past.' },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: 'End date cannot be before the start date.' },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { provider: { include: { users: true } } },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    const totalDays = calculateDays(startDate, endDate);
    const estimatedCost = totalDays * equipment.pricePerDay;

    // Create the EquipmentRequest record in database
    const newRequest = await prisma.equipmentRequest.create({
      data: {
        equipmentId,
        requesterId: user.id,
        providerId: equipment.providerId,
        startDate,
        endDate,
        totalDays,
        estimatedCost,
        purpose,
        urgency: urgency || 'STANDARD',
        message: message || null,
        status: 'PENDING',
      },
      include: {
        equipment: true,
        provider: true,
        requester: { include: { facility: true } },
      },
    });

    // Create notification for Requester
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Request Sent: ${equipment.name}`,
        message: `Your rental request for ${equipment.name} has been submitted to ${equipment.provider.name}.`,
        type: 'REQUEST_RECEIVED',
        linkUrl: '/requests',
      },
    });

    // Create notification for Provider Facility Owner(s)
    if (equipment.provider.users && equipment.provider.users.length > 0) {
      for (const pUser of equipment.provider.users) {
        await prisma.notification.create({
          data: {
            userId: pUser.id,
            title: `New Request: ${equipment.name}`,
            message: `${user.facility?.name || user.name} requested ${equipment.name} for ${totalDays} days (${purpose}).`,
            type: 'REQUEST_RECEIVED',
            linkUrl: '/provider',
          },
        });
      }
    }

    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    console.error('Error creating request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
