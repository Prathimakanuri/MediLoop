import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCategoryFallback } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const maxDistance = searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : null;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null;
    const sortBy = searchParams.get('sortBy') || 'distance';
    const providerId = searchParams.get('providerId') || '';

    const where: any = {};

    // Text search in name, model, description, location
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { model: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    // Category filter
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Availability filter
    if (availability && availability !== 'ALL') {
      where.availability = availability;
    }

    // Provider filter
    if (providerId) {
      where.providerId = providerId;
    }

    // Distance filter
    if (maxDistance !== null) {
      where.distanceKm = { lte: maxDistance };
    }

    // Price filter
    if (maxPrice !== null) {
      where.pricePerDay = { lte: maxPrice };
    }

    // Sorting
    let orderBy: any = { distanceKm: 'asc' };
    if (sortBy === 'price_low') {
      orderBy = { pricePerDay: 'asc' };
    } else if (sortBy === 'price_high') {
      orderBy = { pricePerDay: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'distance') {
      orderBy = { distanceKm: 'asc' };
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy,
      include: {
        category: true,
        provider: true,
      },
    });

    return NextResponse.json({ equipment, count: equipment.length });
  } catch (err: any) {
    console.error('Error querying equipment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'PROVIDER' || !user.facilityId) {
      return NextResponse.json({ error: 'Unauthorized or no facility linked' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      model,
      categoryId,
      description,
      pricePerDay,
      depositAmount,
      condition,
      yearOfManufacture,
      usageType,
      accessories,
      deliveryAvailable,
      powerRequirements,
      imageUrl,
    } = body;

    if (!name || !categoryId || !pricePerDay) {
      return NextResponse.json({ error: 'Name, Category, and Price/Day are required' }, { status: 400 });
    }

    const category = await prisma.equipmentCategory.findUnique({
      where: { id: categoryId },
    });

    const fallbackImg = category ? getCategoryFallback(category.slug) : '/equipment/ventilator.svg';

    const newEquipment = await prisma.equipment.create({
      data: {
        name,
        model: model || 'Standard Clinical Unit',
        categoryId,
        providerId: user.facilityId,
        imageUrl: imageUrl || fallbackImg,
        gallery: JSON.stringify([imageUrl || fallbackImg]),
        description: description || `Verified ${name} available for immediate clinical rental.`,
        pricePerDay: parseInt(pricePerDay),
        depositAmount: depositAmount ? parseInt(depositAmount) : Math.round(parseInt(pricePerDay) * 3),
        location: user.facility?.location || 'Nagpur, Maharashtra',
        distanceKm: 2.0,
        condition: condition || 'Excellent',
        yearOfManufacture: yearOfManufacture ? parseInt(yearOfManufacture) : 2023,
        availability: 'AVAILABLE',
        verified: true,
        usageType: usageType || 'ICU Support',
        accessories: typeof accessories === 'string' ? accessories : JSON.stringify(accessories || []),
        deliveryAvailable: deliveryAvailable !== undefined ? deliveryAvailable : true,
        powerRequirements: powerRequirements || '220V AC, Internal Battery Backup',
      },
      include: {
        category: true,
        provider: true,
      },
    });

    return NextResponse.json({ success: true, equipment: newEquipment });
  } catch (err: any) {
    console.error('Error adding equipment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
