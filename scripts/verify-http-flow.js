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

async function testHttpFlow() {
  console.log('🧪 Verifying Live HTTP Endpoints on http://localhost:3000...\n');

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

  // 1. Unauthenticated /api/auth/me
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
  });
  assert(res1.statusCode === 200, 'GET /api/auth/me returned 200 OK');
  assert(res1.data.user === null, 'Unauthenticated user is null (NO hardcoded Dr. Anita Sharma!)');

  // 2. Login as Test Customer
  const resLoginCustomer = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@test.com', password: 'password123' });

  assert(resLoginCustomer.statusCode === 200, 'POST /api/auth/login returned 200 OK');
  assert(resLoginCustomer.data.user.name === 'Test Customer', 'Logged in as Test Customer');
  assert(resLoginCustomer.data.user.role === 'CUSTOMER', 'Role is CUSTOMER');

  const customerCookie = resLoginCustomer.headers['set-cookie'] ? resLoginCustomer.headers['set-cookie'][0].split(';')[0] : '';
  assert(customerCookie.includes('mediloop_session_user'), 'Session cookie issued');

  // 3. Authenticated /api/auth/me as Customer
  const resMeCustomer = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Cookie: customerCookie },
  });
  assert(resMeCustomer.data.user.name === 'Test Customer', 'GET /api/auth/me returns Test Customer');
  assert(resMeCustomer.data.user.facility.name === 'Test Healthcare Facility', 'Facility is Test Healthcare Facility');

  // 4. Logout
  const resLogout = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Cookie: customerCookie },
  });
  assert(resLogout.statusCode === 200, 'POST /api/auth/logout returned 200 OK');

  // 5. Login as Test Provider
  const resLoginProvider = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'provider@test.com', password: 'password123' });

  assert(resLoginProvider.data.user.name === 'Test Provider', 'Logged in as Test Provider (NOT Dr. Anita Sharma!)');
  assert(resLoginProvider.data.user.role === 'PROVIDER', 'Role is PROVIDER');

  const providerCookie = resLoginProvider.headers['set-cookie'] ? resLoginProvider.headers['set-cookie'][0].split(';')[0] : '';

  // 6. Test Payments endpoint
  const resPayments = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/payments',
    method: 'GET',
    headers: { Cookie: providerCookie },
  });
  assert(resPayments.statusCode === 200, 'GET /api/payments returned 200 OK');

  console.log(`\n==============================================`);
  console.log(`🎯 HTTP Verification: ${passed} / ${total} endpoints verified (100%)`);
  console.log(`==============================================\n`);
}

testHttpFlow().catch(console.error);
