const http = require('http');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTwoPartyTest() {
  console.log('🧪 Starting Provider-Customer Flow Test...\n');

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

  // STEP 1: Login as Test Provider (provider@test.com)
  console.log('--- STEP 1: Provider Login & Equipment Verification ---');
  const provLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'provider@test.com', password: 'password123' });

  assert(provLogin.statusCode === 200, 'Provider logged in successfully');
  const provCookie = provLogin.headers['set-cookie'][0].split(';')[0];
  const provUser = provLogin.data.user;
  console.log(`  Provider Name: ${provUser.name}, Facility: ${provUser.facility?.name} (ID: ${provUser.facilityId})`);

  // Provider adds or verifies Test ECG Machine
  const ecgRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/equipment?providerId=${provUser.facilityId}`,
    method: 'GET',
    headers: { Cookie: provCookie },
  });

  let ecg = ecgRes.data.equipment?.find(e => e.name.includes('ECG'));
  if (!ecg) {
    // Add Test ECG Machine
    const addRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/equipment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: provCookie },
    }, {
      name: 'Test ECG Machine',
      model: 'BPL Cardiart 9108D 12-Channel',
      categoryId: 'cat_ecg',
      pricePerDay: '800',
      depositAmount: '2000',
      condition: 'Excellent',
      yearOfManufacture: 2024,
      usageType: 'Diagnostic',
    });
    ecg = addRes.data.equipment;
  }

  assert(ecg !== undefined && ecg !== null, `Provider owns equipment: ${ecg?.name} (ID: ${ecg?.id})`);
  assert(ecg?.providerId === provUser.facilityId, `Equipment providerId (${ecg?.providerId}) matches Provider facilityId (${provUser.facilityId})`);

  // STEP 2: Provider Logout
  console.log('\n--- STEP 2: Provider Logout ---');
  await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Cookie: provCookie },
  });
  console.log('  Provider logged out.');

  // STEP 3: Login as Test Customer (customer@test.com)
  console.log('\n--- STEP 3: Customer Login & Request Submission ---');
  const custLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@test.com', password: 'password123' });

  assert(custLogin.statusCode === 200, 'Customer logged in successfully');
  const custCookie = custLogin.headers['set-cookie'][0].split(';')[0];
  const custUser = custLogin.data.user;
  console.log(`  Customer Name: ${custUser.name}, Facility: ${custUser.facility?.name}`);

  // Customer requests Test ECG Machine
  const reqRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
  }, {
    equipmentId: ecg.id,
    startDate: '2026-10-01',
    endDate: '2026-10-05',
    totalDays: 4,
    estimatedCost: 3200,
    purpose: 'Diagnostic Emergency Procedure',
    urgency: 'HIGH',
    message: 'Urgent requirement for cardiac ICU telemetry.',
  });

  assert(reqRes.statusCode === 200, 'Customer request submitted successfully');
  const createdRequest = reqRes.data.request;
  assert(createdRequest.status === 'PENDING', 'Request Status is PENDING');
  console.log(`  Created Request ID: ${createdRequest.id}, for Equipment: ${createdRequest.equipment?.name}`);

  // STEP 4: Customer checks My Requests
  console.log('\n--- STEP 4: Customer Views My Requests ---');
  const custReqList = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests',
    method: 'GET',
    headers: { Cookie: custCookie },
  });

  const foundCustReq = custReqList.data.requests?.find(r => r.id === createdRequest.id);
  assert(foundCustReq !== undefined, 'Request appears in Customer Requests');
  assert(foundCustReq.status === 'PENDING', 'Customer sees Request Status = PENDING');

  // STEP 5: Customer Logout
  console.log('\n--- STEP 5: Customer Logout ---');
  await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Cookie: custCookie },
  });
  console.log('  Customer logged out.');

  // STEP 6: Login as Test Provider
  console.log('\n--- STEP 6: Provider Logins & Checks Booking Requests ---');
  const provReLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'provider@test.com', password: 'password123' });

  const provNewCookie = provReLogin.headers['set-cookie'][0].split(';')[0];

  // Provider calls /api/requests?view=provider
  const provReqList = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests?view=provider',
    method: 'GET',
    headers: { Cookie: provNewCookie },
  });

  const foundProvReq = provReqList.data.requests?.find(r => r.id === createdRequest.id);
  assert(foundProvReq !== undefined, 'CRITICAL FIX VERIFIED: Customer Request APPEARS in Provider Booking Requests!');
  assert(foundProvReq?.equipment?.name.includes('ECG'), `Provider sees correct Equipment: ${foundProvReq?.equipment?.name}`);
  assert(foundProvReq?.requester?.name === 'Test Customer', `Provider sees correct Customer Requester: ${foundProvReq?.requester?.name}`);
  assert(foundProvReq?.status === 'PENDING', 'Provider sees Status = PENDING');

  // Provider checks Notifications
  const provNotifs = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/notifications',
    method: 'GET',
    headers: { Cookie: provNewCookie },
  });
  const reqNotif = provNotifs.data.notifications?.find(n => n.title.includes('New Equipment Request'));
  assert(reqNotif !== undefined, 'Provider received real-time notification for equipment request');

  // STEP 7: Provider Accepts Request
  console.log('\n--- STEP 7: Provider Clicks ACCEPT ---');
  const acceptRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/requests/${createdRequest.id}/status`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: provNewCookie },
  }, { action: 'ACCEPT' });

  assert(acceptRes.statusCode === 200, 'Provider accepted request successfully');
  assert(acceptRes.data.request.status === 'ACCEPTED', 'Request Status updated to ACCEPTED');
  assert(acceptRes.data.booking.status === 'AWAITING_PAYMENT', 'Booking Status is AWAITING_PAYMENT');
  assert(acceptRes.data.booking.paymentStatus === 'PAYMENT_REQUIRED', 'Payment Status is PAYMENT_REQUIRED');
  const bookingId = acceptRes.data.booking.id;

  // STEP 8: Customer Logins & Sees Payment Required
  console.log('\n--- STEP 8: Customer Re-login & Verify Payment Required ---');
  const custReLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@test.com', password: 'password123' });

  const custNewCookie = custReLogin.headers['set-cookie'][0].split(';')[0];

  const custBookings = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bookings',
    method: 'GET',
    headers: { Cookie: custNewCookie },
  });

  const targetBooking = custBookings.data.bookings?.find(b => b.id === bookingId);
  assert(targetBooking !== undefined, 'Customer sees booking in My Bookings');
  assert(targetBooking?.paymentStatus === 'PAYMENT_REQUIRED', 'Customer sees Payment Status = PAYMENT_REQUIRED');
  assert(targetBooking?.status === 'AWAITING_PAYMENT', 'Customer sees Booking Status = AWAITING_PAYMENT');

  // STEP 9: Customer Completes Payment
  console.log('\n--- STEP 9: Customer Completes Payment (PAID & CONFIRMED) ---');
  const payRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/bookings/${bookingId}/pay`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custNewCookie },
  }, {
    paymentMethod: 'UPI',
    transactionId: 'TXN-UPI-TEST-123456',
    simulateFailure: false,
  });

  assert(payRes.statusCode === 200, 'Payment submitted successfully');
  assert(payRes.data.booking.paymentStatus === 'PAID', 'Payment Status updated to PAID');
  assert(payRes.data.booking.status === 'CONFIRMED', 'Booking Status updated to CONFIRMED');
  assert(payRes.data.payment.paymentId !== undefined, `DB Payment Record created: ${payRes.data.payment.paymentId}`);

  console.log(`\n==============================================`);
  console.log(`🎯 Two-Party Acceptance Test: ${passed} / ${total} checks passed (${Math.round((passed/total)*100)}%)`);
  console.log(`==============================================\n`);
}

runTwoPartyTest().catch(console.error);
