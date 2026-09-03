import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        provider: true,
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json({ equipment });
  } catch (err: any) {
    console.error('Error fetching equipment item:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'PROVIDER' || !user.facilityId) {
      return NextResponse.json({ error: 'Provider access required' }, { status: 403 });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: params.id } });
    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }
    if (equipment.providerId !== user.facilityId) {
      return NextResponse.json({ error: 'You do not own this equipment' }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = [
      'name', 'model', 'categoryId', 'description', 'pricePerDay', 'depositAmount',
      'condition', 'yearOfManufacture', 'usageType', 'accessories', 'deliveryAvailable',
      'powerRequirements', 'imageUrl', 'availability',
    ];
    const data = Object.fromEntries(
      Object.entries(body).filter(([field]) => allowedFields.includes(field))
    );
    const updated = await prisma.equipment.update({
      where: { id: params.id },
      data,
      include: {
        category: true,
        provider: true,
      },
    });

    return NextResponse.json({ success: true, equipment: updated });
  } catch (err: any) {
    console.error('Error updating equipment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
