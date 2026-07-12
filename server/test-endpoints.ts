const API_URL = 'http://localhost:5000/api';
let token = '';

async function testEndpoint(name: string, url: string, method: string = 'GET', body?: any) {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.text();
    if (!res.ok) {
      console.log(`❌ ${name} failed: ${res.status} ${data}`);
      return null;
    }
    console.log(`✅ ${name} succeeded`);
    try { return JSON.parse(data); } catch { return data; }
  } catch (err: any) {
    console.log(`❌ ${name} crashed: ${err.message}`);
    return null;
  }
}

async function runTests() {
  console.log('--- Starting API Tests ---');
  
  // 1. Test Login
  const loginRes = await testEndpoint('Login', '/auth/login', 'POST', { email: 'admin@assetflow.io', password: 'admin123' });
  if (!loginRes || !loginRes.token) {
    console.log('Aborting tests: could not log in.');
    return;
  }
  token = loginRes.token;

  // 2. Test fetching assets
  const assets = await testEndpoint('Get Assets', '/assets');
  
  // 3. Test allocations
  await testEndpoint('Get Allocations', '/allocations');
  
  // 4. Test transfers
  await testEndpoint('Get Transfers', '/transfers');
  
  // 5. Test bookings
  await testEndpoint('Get Bookings', '/bookings');
  
  // 6. Test maintenance
  await testEndpoint('Get Maintenance', '/maintenance');

  console.log('--- API Tests Complete ---');
}

runTests();
