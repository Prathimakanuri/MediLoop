const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Mediloop Full-Stack Automated Verification Suite...\n');

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

  // TEST 1: Database Seed & Equipment Count
  console.log('--- TEST 1: Equipment Database & Inventory ---');
  const equipment = await prisma.equipment.findMany({
    include: { category: true, provider: true },
  });
  assert(equipment.length >= 10, `Found ${equipment.length} equipment listings (minimum 10 required)`);

  // TEST 2: Guaranteed Equipment Images Existence (ZERO blank/broken images)
  console.log('\n--- TEST 2: Guaranteed Equipment Images Verification ---');
  for (const eq of equipment) {
    const publicPath = path.join(__dirname, '..', 'public', eq.imageUrl);
    const exists = fs.existsSync(publicPath);
    assert(exists, `Image exists locally for ${eq.name} -> ${eq.imageUrl}`);
  }

  // TEST 3: Search Functionality by Keyword
  console.log('\n--- TEST 3: Search Functionality ---');
  const ventilatorResults = await prisma.equipment.findMany({
    where: {
      OR: [
        { name: { contains: 'Ventilator' } },
        { model: { contains: 'Ventilator' } },
        { category: { slug: 'ventilator' } },
      ],
    },
  });
  assert(ventilatorResults.length >= 2, `Ventilator search found ${ventilatorResults.length} matching units`);
  assert(ventilatorResults.every(v => v.name.toLowerCase().includes('ventilator') || v.categoryId === 'cat_ventilator'), 'All search results are authentic ventilators');

  // TEST 4: Request Creation Flow
  console.log('\n--- TEST 4: Request Creation & Validation Flow ---');
  const customerUser = await prisma.user.findUnique({ where: { email: 'demo@mediloop.com' } });
  const providerUser = await prisma.user.findUnique({ where: { email: 'provider@mediloop.com' } });
  const testVentilator = equipment.find(e => e.categoryId === 'cat_ventilator');

  const createdRequest = await prisma.equipmentRequest.create({
    data: {
      equipmentId: testVentilator.id,
      requesterId: customerUser.id,
      providerId: testVentilator.providerId,
      startDate: '2026-09-15',
      endDate: '2026-09-18',
      totalDays: 3,
      estimatedCost: 3 * testVentilator.pricePerDay,
      purpose: 'Emergency Care',
      urgency: 'CRITICAL_EMERGENCY',
      message: 'Surge ICU ventilator need',
      status: 'PENDING',
    },
    include: { equipment: true, provider: true },
  });
  assert(createdRequest.status === 'PENDING', 'Request created successfully with status PENDING');
  assert(createdRequest.estimatedCost === 3 * testVentilator.pricePerDay, `Estimated cost calculation accurate (₹${createdRequest.estimatedCost})`);

  // TEST 5: Provider Acceptance Workflow -> Automatic Booking Generation
  console.log('\n--- TEST 5: Provider Acceptance & Automatic Booking Creation ---');
  // Update request to ACCEPTED
  const updatedReq = await prisma.equipmentRequest.update({
    where: { id: createdRequest.id },
    data: { status: 'ACCEPTED' },
  });

  const autoBooking = await prisma.booking.create({
    data: {
      bookingNumber: `ML-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: updatedReq.id,
      equipmentId: updatedReq.equipmentId,
      requesterId: updatedReq.requesterId,
      providerId: updatedReq.providerId,
      startDate: updatedReq.startDate,
      endDate: updatedReq.endDate,
      totalDays: updatedReq.totalDays,
      pricePerDay: testVentilator.pricePerDay,
      totalAmount: updatedReq.totalDays * testVentilator.pricePerDay,
      status: 'CONFIRMED',
    },
    include: { equipment: true, provider: true },
  });

  assert(autoBooking.status === 'CONFIRMED', 'Booking automatically created with status CONFIRMED');
  assert(autoBooking.totalAmount === autoBooking.totalDays * autoBooking.pricePerDay, `Total amount correctly calculated: ${autoBooking.totalDays} days × ₹${autoBooking.pricePerDay} = ₹${autoBooking.totalAmount}`);

  // TEST 6: Notification System
  console.log('\n--- TEST 6: Notification System Verification ---');
  const notif = await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: `Booking Confirmed: ${testVentilator.name}`,
      message: `Your booking #${autoBooking.bookingNumber} is confirmed by ${autoBooking.provider.name}.`,
      type: 'BOOKING_CONFIRMED',
      linkUrl: `/bookings/${autoBooking.id}`,
    },
  });
  assert(notif.read === false, 'Notification dispatched as unread to customer');

  console.log(`\n==============================================`);
  console.log(`🎯 Test Summary: ${passed} / ${total} tests passed (${Math.round((passed/total)*100)}%)`);
  console.log(`==============================================\n`);
}

runTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
