const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  try {
    const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    
    let loginData = await login.json();
    let token = loginData.token;
    
    if (!token) {
      // Try /api/admins/auth-with-password
      const adminLogin = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
      });
      loginData = await adminLogin.json();
      token = loginData.token;
    }
    
    if (!token) {
      console.log("No token:", loginData);
      return;
    }

    console.log("Logged in successfully. Fetching settings...");
    const settingsRes = await fetch(`http://127.0.0.1:8090/api/collections/settings/records?perPage=100`, { headers: { 'Authorization': token } });
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      data.items.forEach(s => {
        console.log(`Key: ${s.key} | Value: ${s.value}`);
      });
    } else {
      console.log(await settingsRes.json());
    }

    console.log("\nFetching transaction types...");
    const ttRes = await fetch(`${url}/transaction_types/records`, { headers: { 'Authorization': token } }).then(r => r.json());
    console.log("\n--- TRANSACTION TYPES ---");
    if (ttRes.items) {
      ttRes.items.forEach(t => {
        console.log(`ID: ${t.id} | Code: ${t.code} | Prefix: ${t.prefix} | Name: ${t.name} | Consecutive: ${t.consecutive} | Active: ${t.active}`);
      });
    } else {
      console.log("No transaction types found", ttRes);
    }
  } catch (err) {
    console.error("Error executing script:", err);
  }
}
run();
