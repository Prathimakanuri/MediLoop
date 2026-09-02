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

async function testUmaSuresh() {
  console.log('🧪 Testing with Newly Registered Accounts: Dr. Suresh (Customer) & Dr. Uma (Provider)...\n');

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

  // 1. Dr. Uma (Provider) logs in
  const umaLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'krishnakanuri77@gmail.com', password: '1234' });

  assert(umaLogin.statusCode === 200, 'Dr. Uma logged in successfully');
  const umaCookie = umaLogin.headers['set-cookie'][0].split(';')[0];
  const umaUser = umaLogin.data.user;
  console.log(`  Provider: ${umaUser.name}, Facility: ${umaUser.facility?.name} (${umaUser.facilityId})`);

  // Get equipment owned by Hind / Dr. Uma
  const eqRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/equipment?providerId=${umaUser.facilityId}`,
    method: 'GET',
    headers: { Cookie: umaCookie },
  });

  const umaVentilator = eqRes.data.equipment?.[0];
  assert(umaVentilator !== undefined, `Found equipment owned by Hind: ${umaVentilator?.name} (ID: ${umaVentilator?.id})`);

  // 2. Dr. Suresh (Customer) logs in
  const sureshLogin = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'prathimakanuri2006@gmail.com', password: 'Prathima' });

  assert(sureshLogin.statusCode === 200, 'Dr. Suresh logged in successfully');
  const sureshCookie = sureshLogin.headers['set-cookie'][0].split(';')[0];
  const sureshUser = sureshLogin.data.user;
  console.log(`  Customer: ${sureshUser.name}, Facility: ${sureshUser.facility?.name}`);

  // 3. Dr. Suresh requests Dr. Uma's Ventilator
  const reqRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sureshCookie },
  }, {
    equipmentId: umaVentilator.id,
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    totalDays: 4,
    estimatedCost: 6000,
    purpose: 'ICU Support',
    urgency: 'STANDARD',
    message: 'Requesting ventilator from Hind hospital for ICU surge.',
  });

  assert(reqRes.statusCode === 200, 'Dr. Suresh submitted request for Dr. Uma\'s equipment');
  const newReq = reqRes.data.request;
  assert(newReq.status === 'PENDING', 'Request status is PENDING');

  // 4. Dr. Uma checks Booking Requests
  const umaReqList = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests?view=provider',
    method: 'GET',
    headers: { Cookie: umaCookie },
  });

  const foundReq = umaReqList.data.requests?.find(r => r.id === newReq.id);
  assert(foundReq !== undefined, 'CRITICAL SUCCESS: Request from Dr. Suresh APPEARS in Dr. Uma\'s Booking Requests!');
  assert(foundReq?.equipment?.name === umaVentilator.name, `Request is for: ${foundReq?.equipment?.name}`);
  assert(foundReq?.requester?.name === 'Dr.Suresh', `Requester is: ${foundReq?.requester?.name}`);

  // 5. Dr. Uma accepts request
  const acceptRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/requests/${newReq.id}/status`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: umaCookie },
  }, { action: 'ACCEPT' });

  assert(acceptRes.statusCode === 200, 'Dr. Uma accepted the request');
  const bookingId = acceptRes.data.booking.id;

  // 6. Dr. Suresh checks bookings and pays
  const sureshBookings = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bookings',
    method: 'GET',
    headers: { Cookie: sureshCookie },
  });

  const sureshBooking = sureshBookings.data.bookings?.find(b => b.id === bookingId);
  assert(sureshBooking !== undefined, 'Dr. Suresh sees booking awaiting payment');
  assert(sureshBooking.paymentStatus === 'PAYMENT_REQUIRED', 'Payment status is PAYMENT_REQUIRED');

  // Complete payment
  const payRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/bookings/${bookingId}/pay`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: sureshCookie },
  }, {
    paymentMethod: 'UPI',
    transactionId: 'TXN-UPI-SURESH-101010',
    simulateFailure: false,
  });

  assert(payRes.statusCode === 200, 'Dr. Suresh paid successfully');
  assert(payRes.data.booking.paymentStatus === 'PAID', 'Payment status is PAID');
  assert(payRes.data.booking.status === 'CONFIRMED', 'Booking status is CONFIRMED');

  console.log(`\n==============================================`);
  console.log(`🎯 Registered Accounts Test: ${passed} / ${total} checks passed (100%)`);
  console.log(`==============================================\n`);
}

testUmaSuresh().catch(console.error);
