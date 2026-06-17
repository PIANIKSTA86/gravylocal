async function test() {
  try {
    const loginRes = await fetch('http://localhost:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const url = 'http://localhost:8090/api/gravy/my-licenses';
    console.log(`Fetching from: ${url}`);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Status:", res.status);
    console.log("Response:", await res.json());
    
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
