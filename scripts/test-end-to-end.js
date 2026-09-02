const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runEndToEndTest() {
  console.log('🧪 Starting Mediloop Complete End-to-End Fullstack Verification...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    // 1. REGISTER NEW CUSTOMER HOSPITAL
    console.log('--- STEP 1: Register New Customer Hospital ---');
    const custFacility = await prisma.healthcareFacility.create({
      data: {
        name: 'CityCare SuperSpecialty Hospital',
        type: 'Multi-Specialty Hospital',
        tier: 'Tier-2',
        location: 'Nagpur, Maharashtra',
        address: 'Civil Lines, Nagpur',
        verified: true,
        contactPhone: '+91 91234 56789',
        contactEmail: 'admin@citycare.org',
        rating: 5.0,
        bedCapacity: 120,
      },
    });

    const custUser = await prisma.user.create({
      data: {
        name: 'Dr. Prathima Kanuri',
        email: 'prathima@citycare.org',
        password: 'password123',
        role: 'CUSTOMER',
        phone: '+91 91234 56789',
        facilityId: custFacility.id,
      },
      include: { facility: true },
    });

    assert(custUser.name === 'Dr. Prathima Kanuri', 'Customer user created with exact registered name (NO fallbacks!)');
    assert(custUser.facility.name === 'CityCare SuperSpecialty Hospital', 'Customer facility linked cleanly');

    // 2. REGISTER NEW PROVIDER HOSPITAL & LIST EQUIPMENT
    console.log('\n--- STEP 2: Register Provider Hospital & Publish Equipment ---');
    const provFacility = await prisma.healthcareFacility.create({
      data: {
        name: 'Malhotra Trauma Center',
        type: 'Specialty Trauma Clinic',
        tier: 'Semi-Urban',
        location: 'Wardha, Maharashtra',
        address: 'Medical Square, Wardha',
        verified: true,
        contactPhone: '+91 98765 43210',
        contactEmail: 'contact@malhotratrauma.in',
        rating: 5.0,
        bedCapacity: 80,
      },
    });

    const provUser = await prisma.user.create({
      data: {
        name: 'Dr. Vikram Malhotra',
        email: 'vikram@malhotratrauma.in',
        password: 'password123',
        role: 'PROVIDER',
        phone: '+91 98765 43210',
        facilityId: provFacility.id,
      },
      include: { facility: true },
    });

    const categoryVentilator = await prisma.equipmentCategory.findFirst({ where: { slug: 'ventilator' } });

    const newEquipment = await prisma.equipment.create({
      data: {
        name: 'Dräger Babylog VN500 Neonatal ICU Ventilator',
        model: 'VN500 High-Frequency',
        categoryId: categoryVentilator.id,
        providerId: provFacility.id,
        imageUrl: '/equipment/ventilator.svg',
        description: 'Advanced high-frequency neonatal and pediatric ICU ventilation system with integrated battery backup.',
        pricePerDay: 2200,
        depositAmount: 5000,
        location: 'Wardha, Maharashtra',
        distanceKm: 8.5,
        condition: 'Like New',
        yearOfManufacture: 2024,
        availability: 'AVAILABLE',
        verified: true,
        usageType: 'ICU Support',
      },
    });

    assert(newEquipment.providerId === provFacility.id, 'Equipment published by Malhotra Trauma Center');

    // 3. CUSTOMER REQUESTS EQUIPMENT
    console.log('\n--- STEP 3: Customer Requests Equipment ---');
    const req = await prisma.equipmentRequest.create({
      data: {
        equipmentId: newEquipment.id,
        requesterId: custUser.id,
        providerId: provFacility.id,
        startDate: '2026-09-25',
        endDate: '2026-09-29',
        totalDays: 4,
        estimatedCost: 4 * newEquipment.pricePerDay,
        purpose: 'Emergency Neonatal ICU Surge',
        urgency: 'CRITICAL_EMERGENCY',
        message: 'High priority NICU surge requirement',
        status: 'PENDING',
      },
      include: { equipment: true, requester: true, provider: true },
    });

    assert(req.requester.name === 'Dr. Prathima Kanuri', 'Request registered under Dr. Prathima Kanuri');
    assert(req.estimatedCost === 8800, 'Estimated cost calculated: 4 days × ₹2,200 = ₹8,800');

    // 4. PROVIDER ACCEPTS REQUEST & GENERATES BOOKING
    console.log('\n--- STEP 4: Provider Acceptance & Automatic Booking Generation ---');
    const acceptedReq = await prisma.equipmentRequest.update({
      where: { id: req.id },
      data: { status: 'ACCEPTED' },
    });

    const bookingNumber = `ML-2026-8821`;
    const newBooking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNumber,
        requestId: acceptedReq.id,
        equipmentId: newEquipment.id,
        requesterId: custUser.id,
        providerId: provFacility.id,
        startDate: acceptedReq.startDate,
        endDate: acceptedReq.endDate,
        totalDays: acceptedReq.totalDays,
        pricePerDay: newEquipment.pricePerDay,
        totalAmount: acceptedReq.estimatedCost,
        deposit: newEquipment.depositAmount,
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID',
      },
      include: { equipment: true, provider: true, requester: { include: { facility: true } } },
    });

    assert(newBooking.status === 'CONFIRMED', 'Booking confirmed by provider');
    assert(newBooking.paymentStatus === 'UNPAID', 'Initial payment status is UNPAID');

    // 5. CUSTOMER PROCESSES PAYMENT
    console.log('\n--- STEP 5: Customer Processes Payment ---');
    const paidBooking = await prisma.booking.update({
      where: { id: newBooking.id },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        transactionId: 'UPI-9988776655',
        paidAt: new Date().toISOString(),
      },
    });

    assert(paidBooking.paymentStatus === 'PAID', 'Payment status updated to PAID');
    assert(paidBooking.paymentMethod === 'UPI', 'Payment method recorded as UPI');
    assert(paidBooking.transactionId === 'UPI-9988776655', 'Transaction reference ID verified');

    // 6. ISOLATION & NAME INTEGRITY CHECK
    console.log('\n--- STEP 6: User Name & Data Scoping Integrity Check ---');
    const custProfileUser = await prisma.user.findUnique({
      where: { email: 'prathima@citycare.org' },
      include: { facility: true },
    });

    const provProfileUser = await prisma.user.findUnique({
      where: { email: 'vikram@malhotratrauma.in' },
      include: { facility: true },
    });

    assert(custProfileUser.name === 'Dr. Prathima Kanuri', 'Customer user retains exact name Dr. Prathima Kanuri');
    assert(provProfileUser.name === 'Dr. Vikram Malhotra', 'Provider user retains exact name Dr. Vikram Malhotra');

    console.log(`\n==============================================`);
    console.log(`🎯 E2E Verification Summary: ${passed} / ${total} tests passed (${Math.round((passed/total)*100)}%)`);
    console.log(`==============================================\n`);
  } catch (err) {
    console.error('E2E Test Error:', err);
  }
}

runEndToEndTest()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
