const fetch = require('node-fetch');

async function run() {
  const login = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password' })
  });
  const { access_token } = await login.json();
  
  const res = await fetch('http://localhost:3000/api/militia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
    body: JSON.stringify({
      fullName: "Test", 
      nationalId: "123123555999", 
      dateOfBirth: "1990-01-01", 
      joinedDate: "2020-01-01", 
      address: "abc", 
      classification: "NONG_COT", 
      status: "ACTIVE", 
      attachments: { "donXin": ["/uploads/1.png"] }
    })
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
run();
