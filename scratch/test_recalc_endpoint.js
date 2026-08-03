async function test() {
  try {
    console.log("Logging in as admin...");
    const loginRes = await fetch('http://localhost:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error("Login failed:", loginData);
      return;
    }
    const token = loginData.token;
    console.log("Login successful! Token acquired.");

    const url = 'http://localhost:8090/api/gravy/recalculate-stock';
    console.log(`Triggering recalculation at: ${url}`);
    const res = await fetch(url, { 
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
    
  } catch (err) {
    console.error("Error during test:", err);
  }
}

test();
