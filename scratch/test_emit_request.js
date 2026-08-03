async function run() {
  try {
    console.log("Logging in...");
    const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    }).then(r => r.json());
    
    if (!login.token) {
      console.log("Login failed:", login);
      return;
    }
    console.log("Logged in! Token obtained.");
    
    const txId = 'd6magnhc4r16oo2'; // 4P1C-00000028 (pendiente)
    console.log(`Sending emit request for txId: ${txId}...`);
    
    const res = await fetch('http://127.0.0.1:8090/api/dian/emit', {
      method: 'POST',
      headers: { 
        'Authorization': login.token,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ txId: txId })
    });
    
    console.log("Response Status:", res.status);
    const body = await res.text();
    console.log("Response Body:", body);
    
  } catch (err) {
    console.error("Error executing request:", err);
  }
}
run();
