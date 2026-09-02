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

async function verifyRequestCreation() {
  console.log('🧪 Verifying Equipment Request Submission with dates and costs...\n');

  // 1. Log in as Test Customer
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'customer@test.com', password: 'password123' });

  const cookie = loginRes.headers['set-cookie'][0].split(';')[0];
  console.log('  Customer Logged In:', loginRes.data.user.name);

  // 2. Submit Equipment Request for eq_vent_01 (exactly the equipment from user error)
  const reqPayload = {
    equipmentId: 'eq_vent_01',
    startDate: '2026-09-03',
    endDate: '2026-09-06',
    purpose: 'ICU Support',
    urgency: 'STANDARD',
    message: 'Testing request submission without NaN',
  };

  const createRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/requests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  }, reqPayload);

  console.log('  Response Status Code:', createRes.statusCode);
  console.log('  Response Data:', createRes.data);

  if (createRes.statusCode === 200 && createRes.data.success) {
    console.log('\n  ✅ PASS: Request created successfully without any Prisma error!');
    console.log('  Request ID:', createRes.data.request.id);
    console.log('  Total Days:', createRes.data.request.totalDays);
    console.log('  Estimated Cost: ₹' + createRes.data.request.estimatedCost);
    console.log('  Status:', createRes.data.request.status);
  } else {
    console.error('\n  ❌ FAIL:', createRes.data);
  }
}

verifyRequestCreation().catch(console.error);
