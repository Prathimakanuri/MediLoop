const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runIsolationTests() {
  console.log('🧪 Starting Mediloop Data Isolation & Fresh Registration Test Suite...\n');

  let total = 0;
  let passed = 0;

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
    // 1. REGISTER NEW HOSPITAL A (CUSTOMER)
    console.log('--- TEST 1: Register New Hospital A (Customer) ---');
    const hospitalAFacility = await prisma.healthcareFacility.create({
      data: {
        name: 'St. Jude Rural Clinic',
        type: 'Primary Health Center',
        tier: 'Rural',
        location: 'Chandrapur, Maharashtra',
        address: 'Main Road, Chandrapur - 442401',
        verified: true,
        contactPhone: '+91 97654 32100',
        contactEmail: 'admin@stjuderural.org',
        rating: 5.0,
        bedCapacity: 40,
      },
    });

    const hospitalAUser = await prisma.user.create({
      data: {
        name: 'Dr. Ramesh Kulkarni',
        email: 'ramesh@stjuderural.org',
        password: 'password123',
        role: 'CUSTOMER',
        phone: '+91 97654 32100',
        facilityId: hospitalAFacility.id,
      },
      include: { facility: true },
    });

    assert(hospitalAUser.facility.name === 'St. Jude Rural Clinic', 'Hospital A created with dedicated facility');

    // Query Hospital A requests, bookings, notifications
    const reqA = await prisma.equipmentRequest.findMany({ where: { requesterId: hospitalAUser.id } });
    const bookA = await prisma.booking.findMany({ where: { requesterId: hospitalAUser.id } });
    const notifA = await prisma.notification.findMany({ where: { userId: hospitalAUser.id } });

    assert(reqA.length === 0, 'New Customer Hospital A has 0 requests (completely fresh start)');
    assert(bookA.length === 0, 'New Customer Hospital A has 0 bookings (completely fresh start)');
    assert(notifA.length === 0, 'New Customer Hospital A has 0 notifications (completely fresh start)');

    // 2. REGISTER NEW HOSPITAL B (PROVIDER)
    console.log('\n--- TEST 2: Register New Hospital B (Provider) ---');
    const hospitalBFacility = await prisma.healthcareFacility.create({
      data: {
        name: 'Apex Diagnostic Hub',
        type: 'Diagnostic Imaging Hub',
        tier: 'Tier-2',
        location: 'Nagpur, Maharashtra',
        address: 'Ring Road, Nagpur - 440015',
        verified: true,
        contactPhone: '+91 98111 22233',
        contactEmail: 'contact@apexdiag.in',
        rating: 5.0,
        bedCapacity: 20,
      },
    });

    const hospitalBUser = await prisma.user.create({
      data: {
        name: 'Dr. Sunita Rao',
        email: 'sunita@apexdiag.in',
        password: 'password123',
        role: 'PROVIDER',
        phone: '+91 98111 22233',
        facilityId: hospitalBFacility.id,
      },
      include: { facility: true },
    });

    const eqB = await prisma.equipment.findMany({ where: { providerId: hospitalBFacility.id } });
    const reqB = await prisma.equipmentRequest.findMany({ where: { providerId: hospitalBFacility.id } });
    const bookB = await prisma.booking.findMany({ where: { providerId: hospitalBFacility.id } });

    assert(eqB.length === 0, 'New Provider Hospital B has 0 listed equipment (completely fresh start)');
    assert(reqB.length === 0, 'New Provider Hospital B has 0 incoming requests (completely fresh start)');
    assert(bookB.length === 0, 'New Provider Hospital B has 0 bookings (completely fresh start)');

    // 3. MARKETPLACE INTERACTION: HOSPITAL A REQUESTS EQUIPMENT FROM SEEDED DEMO PROVIDER
    console.log('\n--- TEST 3: Marketplace Request & Isolation Verification ---');
    const cityHospitalVentilator = await prisma.equipment.findFirst({
      where: { categoryId: 'cat_ventilator' },
    });

    const newRequestA = await prisma.equipmentRequest.create({
      data: {
        equipmentId: cityHospitalVentilator.id,
        requesterId: hospitalAUser.id,
        providerId: cityHospitalVentilator.providerId,
        startDate: '2026-09-20',
        endDate: '2026-09-23',
        totalDays: 3,
        estimatedCost: 3 * cityHospitalVentilator.pricePerDay,
        purpose: 'ICU Support',
        urgency: 'HIGH',
        message: 'Urgent ICU surge request from St. Jude',
        status: 'PENDING',
      },
    });

    assert(newRequestA.requesterId === hospitalAUser.id, 'Request created specifically under Hospital A user ID');

    // 4. PROVIDER ACCEPTS REQUEST & CREATES BOOKING
    console.log('\n--- TEST 4: Request Acceptance & Data Scoping ---');
    const acceptedReqA = await prisma.equipmentRequest.update({
      where: { id: newRequestA.id },
      data: { status: 'ACCEPTED' },
    });

    const bookingA = await prisma.booking.create({
      data: {
        bookingNumber: `ML-2026-9901`,
        requestId: acceptedReqA.id,
        equipmentId: cityHospitalVentilator.id,
        requesterId: hospitalAUser.id,
        providerId: cityHospitalVentilator.providerId,
        startDate: acceptedReqA.startDate,
        endDate: acceptedReqA.endDate,
        totalDays: acceptedReqA.totalDays,
        pricePerDay: cityHospitalVentilator.pricePerDay,
        totalAmount: acceptedReqA.estimatedCost,
        status: 'CONFIRMED',
      },
    });

    // Verify Hospital A now has 1 request and 1 booking
    const reqAUpdated = await prisma.equipmentRequest.findMany({ where: { requesterId: hospitalAUser.id } });
    const bookAUpdated = await prisma.booking.findMany({ where: { requesterId: hospitalAUser.id } });
    assert(reqAUpdated.length === 1, 'Hospital A sees exactly its 1 created request');
    assert(bookAUpdated.length === 1, 'Hospital A sees exactly its 1 confirmed booking');

    // Verify Hospital B still has ZERO requests and ZERO bookings
    const reqBCheck = await prisma.equipmentRequest.findMany({ where: { providerId: hospitalBFacility.id } });
    const bookBCheck = await prisma.booking.findMany({ where: { providerId: hospitalBFacility.id } });
    assert(reqBCheck.length === 0, 'Hospital B sees 0 requests (Data isolation intact)');
    assert(bookBCheck.length === 0, 'Hospital B sees 0 bookings (Data isolation intact)');

    // 5. REGISTER NEW HOSPITAL C (VERIFY INDEPENDENT FRESH START)
    console.log('\n--- TEST 5: Register New Hospital C & Confirm Fresh Start ---');
    const hospitalCFacility = await prisma.healthcareFacility.create({
      data: {
        name: 'Green Valley Hospital',
        type: 'Community Hospital',
        tier: 'Semi-Urban',
        location: 'Akola, Maharashtra',
        address: 'Station Road, Akola - 444001',
        verified: true,
        contactPhone: '+91 94555 66677',
        contactEmail: 'info@greenvalley.org',
        rating: 5.0,
        bedCapacity: 60,
      },
    });

    const hospitalCUser = await prisma.user.create({
      data: {
        name: 'Dr. Anand Joshi',
        email: 'anand@greenvalley.org',
        password: 'password123',
        role: 'CUSTOMER',
        phone: '+91 94555 66677',
        facilityId: hospitalCFacility.id,
      },
    });

    const reqC = await prisma.equipmentRequest.findMany({ where: { requesterId: hospitalCUser.id } });
    const bookC = await prisma.booking.findMany({ where: { requesterId: hospitalCUser.id } });
    const notifC = await prisma.notification.findMany({ where: { userId: hospitalCUser.id } });

    assert(reqC.length === 0, 'Hospital C has 0 requests (does not inherit Hospital A or Demo data)');
    assert(bookC.length === 0, 'Hospital C has 0 bookings (does not inherit Hospital A or Demo data)');
    assert(notifC.length === 0, 'Hospital C has 0 notifications (does not inherit Hospital A or Demo data)');

    console.log(`\n==============================================`);
    console.log(`🎯 Isolation Test Summary: ${passed} / ${total} tests passed (${Math.round((passed/total)*100)}%)`);
    console.log(`==============================================\n`);
  } catch (err) {
    console.error('Isolation test error:', err);
  }
}

runIsolationTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
