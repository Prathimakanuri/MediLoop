import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionUser } from '@/lib/auth';

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

    // 1. Create a brand new HealthcareFacility isolated ONLY for this user
    const facility = await prisma.healthcareFacility.create({
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

    // 2. Create the User linked to this facility with ZERO demo data copied
    const user = await prisma.user.create({
      data: {
        name: doctorName ? doctorName.trim() : hospitalName.trim(),
        email: cleanEmail,
        password: password, // In production this would be bcrypt hashed
        role: role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER',
        phone: phone ? phone.trim() : null,
        facilityId: facility.id,
      },
      include: {
        facility: true,
      },
    });

    // 3. Set authenticated session cookie
    await setSessionUser(user.email);

    return NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully with a fresh, isolated hospital profile.',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete hospital registration.' },
      { status: 500 }
    );
  }
}
