import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hospitalName,
      doctorName,
      facilityType,
      tier,
      city,
      address,
      email,
      phone,
      password,
      role,
    } = body;

    if (!hospitalName || !email || !password) {
      return NextResponse.json(
        { error: 'Hospital name, official email, and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in instead.' },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      const facility = await transaction.healthcareFacility.create({
        data: {
          name: hospitalName.trim(),
          type: facilityType || 'Community Hospital',
          tier: tier || 'Tier-3',
          location: city ? `${city.trim()}, Maharashtra` : 'District Center, Maharashtra',
          address: address ? address.trim() : `${hospitalName.trim()}, Medical Square, ${city ? city.trim() : 'District Zone'}`,
          verified: true,
          contactPhone: phone ? phone.trim() : '+91 98000 00000',
          contactEmail: cleanEmail,
          rating: 5.0,
          bedCapacity: 50,
        },
      });

      await transaction.user.create({
        data: {
          name: doctorName ? doctorName.trim() : hospitalName.trim(),
          email: cleanEmail,
          password,
          role: role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER',
          phone: phone ? phone.trim() : null,
          facilityId: facility.id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please log in to continue.',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: err?.message || 'Registration service is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
