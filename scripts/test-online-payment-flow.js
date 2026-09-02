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

async function runOnlinePaymentFlowTest() {
  console.log('🧪 Starting Online Payment Flow & State Machine Verification...\n');

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

  // 1. Provider Login
  const provLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'provider@test.com', password: 'password123' });

  assert(provLogin.statusCode === 200, 'Provider logged in');
  const provCookie = provLogin.headers['set-cookie'][0].split(';')[0];
  const provUser = provLogin.data.user;

  // 2. Customer Login
  const custLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@test.com', password: 'password123' });

  assert(custLogin.statusCode === 200, 'Customer logged in');
  const custCookie = custLogin.headers['set-cookie'][0].split(';')[0];

  // 3. Customer requests equipment
  const eqList = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/equipment?providerId=${provUser.facilityId}`,
    method: 'GET',
    headers: { Cookie: custCookie },
  });

  const equipment = eqList.data.equipment?.[0];
  assert(equipment !== undefined, `Equipment found: ${equipment?.name}`);

  const reqRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
  }, {
    equipmentId: equipment.id,
    startDate: '2026-11-01',
    endDate: '2026-11-04',
    totalDays: 3,
    estimatedCost: 2400,
    purpose: 'Cardiac Diagnostics',
    urgency: 'STANDARD',
  });

  assert(reqRes.statusCode === 200, 'Equipment request created with status PENDING');
  const createdReq = reqRes.data.request;
  assert(createdReq.status === 'PENDING', 'Request status is PENDING');

  // 4. Provider Accepts the request
  const acceptRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/requests/${createdReq.id}/status`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: provCookie },
  }, { action: 'ACCEPT' });

  assert(acceptRes.statusCode === 200, 'Provider accepted request');
  const initialBooking = acceptRes.data.booking;
  const bookingId = initialBooking.id;

  // 5. Verify Booking is strictly in AWAITING_PAYMENT & PAYMENT_REQUIRED
  assert(initialBooking.status === 'AWAITING_PAYMENT', 'Booking status is AWAITING_PAYMENT (NOT Confirmed)');
  assert(initialBooking.paymentStatus === 'PAYMENT_REQUIRED', 'Payment status is PAYMENT_REQUIRED (NOT Paid)');

  // 6. Test Simulated Gateway Failure Flow
  console.log('\n--- Testing Simulated Online Payment Failure Flow ---');
  const failRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/bookings/${bookingId}/pay`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
  }, {
    paymentMethod: 'UPI',
    simulateFailure: true,
  });

  assert(failRes.statusCode === 200, 'Payment failure route returned response');
  assert(failRes.data.success === false, 'Payment failure returned success: false');
  assert(failRes.data.paymentStatus === 'FAILED', 'Payment status updated to FAILED');
  assert(failRes.data.booking.status === 'AWAITING_PAYMENT', 'Booking remains AWAITING_PAYMENT after failed payment (NOT Confirmed)');

  // 7. Test Successful Online Payment Flow
  console.log('\n--- Testing Successful Online Payment Flow ---');
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const testTxnId = `MLTX-2026-${randomHex}`;

  const successRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/bookings/${bookingId}/pay`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
  }, {
    paymentMethod: 'UPI',
    transactionId: testTxnId,
    simulateFailure: false,
  });

  assert(successRes.statusCode === 200, 'Payment success route returned 200 OK');
  assert(successRes.data.success === true, 'Payment success returned success: true');
  assert(successRes.data.booking.paymentStatus === 'PAID', 'Payment status is now PAID');
  assert(successRes.data.booking.status === 'CONFIRMED', 'Booking status is now CONFIRMED');
  assert(successRes.data.booking.transactionId === testTxnId, `Transaction ID matches MLTX format: ${testTxnId}`);
  assert(successRes.data.payment.paymentId !== undefined, `DB Payment Record created: ${successRes.data.payment.paymentId}`);

  // 8. Provider sees Payment Notification
  const provNotifs = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/notifications',
    method: 'GET',
    headers: { Cookie: provCookie },
  });

  const payNotif = provNotifs.data.notifications?.find(n => n.title.includes('Payment Received'));
  assert(payNotif !== undefined, 'Provider received real-time payment confirmation notification');

  console.log(`\n==============================================`);
  console.log(`🎯 Online Payment Flow Test: ${passed} / ${total} checks passed (${Math.round((passed/total)*100)}%)`);
  console.log(`==============================================\n`);
}

runOnlinePaymentFlowTest().catch(console.error);
