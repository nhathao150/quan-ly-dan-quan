async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('Login token:', loginData.access_token);

    const res = await fetch('http://localhost:3000/api/militia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.access_token}`
      },
      body: JSON.stringify({
        fullName: 'Test User',
        nationalId: '123456789',
        dateOfBirth: '2000-01-01T00:00:00Z',
        address: '123 Test St',
        classification: 'NONG_COT',
        joinedDate: '2020-01-01T00:00:00Z',
        status: 'ACTIVE',
        attachments: []
      })
    });

    const data = await res.json();
    console.log('Response:', res.status, data);
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
