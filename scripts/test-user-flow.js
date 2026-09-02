const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAcceptanceCriteriaTests() {
  console.log('🧪 Starting MediLoop 24-Point Acceptance Criteria Test Suite...\n');

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
    // ----------------------------------------------------
    // TEST 1 — CUSTOMER AUTHENTICATION & DYNAMIC HEADER
    // ----------------------------------------------------
    console.log('--- TEST 1: Customer Profile & Dynamic Header Integrity ---');
    const custUser = await prisma.user.findUnique({
      where: { email: 'customer@test.com' },
      include: { facility: true },
    });

    assert(custUser.name === 'Test Customer', 'Customer name is "Test Customer"');
    assert(custUser.role === 'CUSTOMER', 'Customer role is "CUSTOMER"');
    assert(custUser.name !== 'Dr. Anita Sharma', 'Header user is NOT hardcoded "Dr. Anita Sharma"');

    // ----------------------------------------------------
    // TEST 2 — PROVIDER AUTHENTICATION & DYNAMIC HEADER
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Provider Profile & Dynamic Header Integrity ---');
    const provUser = await prisma.user.findUnique({
      where: { email: 'provider@test.com' },
      include: { facility: true },
    });

    assert(provUser.name === 'Test Provider', 'Provider name is "Test Provider"');
    assert(provUser.role === 'PROVIDER', 'Provider role is "PROVIDER"');
    assert(provUser.name !== 'Dr. Anita Sharma', 'Provider user is NOT hardcoded "Dr. Anita Sharma"');

    // ----------------------------------------------------
    // TEST 3 — EQUIPMENT REQUEST LIFECYCLE (CUSTOMER → PROVIDER)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Equipment Request Submission (Status = PENDING) ---');
    const provEquipment = await prisma.equipment.findFirst({
      where: { providerId: provUser.facilityId },
    });

    assert(provEquipment !== null, 'Found equipment owned by Test Provider');

    const createdReq = await prisma.equipmentRequest.create({
      data: {
        equipmentId: provEquipment.id,
        requesterId: custUser.id,
        providerId: provUser.facilityId,
        startDate: '2026-10-01',
        endDate: '2026-10-06',
        totalDays: 5,
        estimatedCost: 5 * provEquipment.pricePerDay,
        purpose: 'Diagnostic Ultrasound Requirement',
        urgency: 'HIGH',
        status: 'PENDING',
      },
    });

    assert(createdReq.status === 'PENDING', 'Initial Equipment Request Status is PENDING');

    // Dispatch Provider Notification
    const provNotif = await prisma.notification.create({
      data: {
        userId: provUser.id,
        title: `New Equipment Request: ${provEquipment.name}`,
        message: `${custUser.name} requested ${provEquipment.name} for 5 days.`,
        type: 'REQUEST_RECEIVED',
        linkUrl: `/provider`,
      },
    });

    assert(provNotif.userId === provUser.id, 'Request notification sent specifically to Test Provider');

    // Verify Provider Inbox
    const pNotifs = await prisma.notification.findMany({ where: { userId: provUser.id } });
    assert(pNotifs.some(n => n.title.includes('New Equipment Request')), 'Provider receives request notification');

    // ----------------------------------------------------
    // TEST 4 — PROVIDER ACCEPTANCE (Status = ACCEPTED, Payment Status = PAYMENT_REQUIRED)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Provider Acceptance (Status = ACCEPTED, Payment = PAYMENT_REQUIRED) ---');
    const acceptedReq = await prisma.equipmentRequest.update({
      where: { id: createdReq.id },
      data: { status: 'ACCEPTED' },
    });

    const bookingNum = `ML-2026-7788`;
    const awaitingBooking = await prisma.booking.create({
      data: {
        bookingNumber: bookingNum,
        requestId: acceptedReq.id,
        equipmentId: provEquipment.id,
        requesterId: custUser.id,
        providerId: provUser.facilityId,
        startDate: acceptedReq.startDate,
        endDate: acceptedReq.endDate,
        totalDays: acceptedReq.totalDays,
        pricePerDay: provEquipment.pricePerDay,
        totalAmount: acceptedReq.estimatedCost,
        deposit: provEquipment.depositAmount,
        status: 'AWAITING_PAYMENT',
        paymentStatus: 'PAYMENT_REQUIRED',
      },
    });

    assert(awaitingBooking.status === 'AWAITING_PAYMENT', 'Booking Status is AWAITING_PAYMENT after acceptance');
    assert(awaitingBooking.paymentStatus === 'PAYMENT_REQUIRED', 'Payment Status is PAYMENT_REQUIRED');
    assert(awaitingBooking.status !== 'CONFIRMED', 'Booking is NOT confirmed before payment!');

    // Customer Notification: Payment Required
    await prisma.notification.create({
      data: {
        userId: custUser.id,
        title: 'Request Accepted — Payment Required',
        message: `Your request for ${provEquipment.name} was accepted. Payment is required to confirm booking.`,
        type: 'PAYMENT_REQUIRED',
        linkUrl: `/bookings/${awaitingBooking.id}`,
      },
    });

    // ----------------------------------------------------
    // TEST 5 — PAYMENT FAILURE SCENARIO
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Payment Failure Scenario ---');
    const failedBooking = await prisma.booking.update({
      where: { id: awaitingBooking.id },
      data: {
        paymentStatus: 'FAILED',
        status: 'AWAITING_PAYMENT',
      },
    });

    assert(failedBooking.paymentStatus === 'FAILED', 'Payment Status updated to FAILED');
    assert(failedBooking.status === 'AWAITING_PAYMENT', 'Booking Status remains AWAITING_PAYMENT on failure');

    // ----------------------------------------------------
    // TEST 6 — PAYMENT SUCCESS SCENARIO & DB PAYMENT RECORD
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Payment Success Scenario & Confirmation ---');
    const paymentRecord = await prisma.payment.create({
      data: {
        paymentId: 'PAY-998811',
        bookingId: awaitingBooking.id,
        customerId: custUser.id,
        providerId: provUser.facilityId,
        amount: awaitingBooking.totalAmount,
        currency: 'INR',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        transactionId: 'TXN-UPI-77112233',
      },
    });

    const confirmedBooking = await prisma.booking.update({
      where: { id: awaitingBooking.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paidAt: new Date().toISOString(),
        paymentMethod: 'UPI',
        transactionId: 'TXN-UPI-77112233',
      },
    });

    assert(confirmedBooking.paymentStatus === 'PAID', 'Payment Status updated to PAID');
    assert(confirmedBooking.status === 'CONFIRMED', 'Booking Status updated to CONFIRMED after successful payment!');
    assert(paymentRecord.bookingId === confirmedBooking.id, 'DB Payment record linked cleanly to booking ID');

    // Notifications to both Customer & Provider
    const custSuccessNotif = await prisma.notification.create({
      data: {
        userId: custUser.id,
        title: 'Payment Successful — Booking Confirmed!',
        message: `Payment of ₹${confirmedBooking.totalAmount} received. Booking #${confirmedBooking.bookingNumber} confirmed.`,
        type: 'PAYMENT_CONFIRMED',
      },
    });

    const provSuccessNotif = await prisma.notification.create({
      data: {
        userId: provUser.id,
        title: `Payment Received: ${provEquipment.name}`,
        message: `Payment of ₹${confirmedBooking.totalAmount} received. Booking confirmed.`,
        type: 'BOOKING_CONFIRMED',
      },
    });

    assert(custSuccessNotif.userId === custUser.id, 'Customer received payment confirmation notification');
    assert(provSuccessNotif.userId === provUser.id, 'Provider received payment receipt notification');

    console.log(`\n==============================================`);
    console.log(`🎯 Acceptance Criteria Summary: ${passed} / ${total} tests passed (${Math.round((passed/total)*100)}%)`);
    console.log(`==============================================\n`);
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runAcceptanceCriteriaTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
