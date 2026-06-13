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
      console.log("No token:", loginData);
      return;
    }

    console.log("Logged in successfully. Fetching invoices...");
    const res = await fetch(`${url}/invoices/records?perPage=20`, {
      headers: { 'Authorization': token }
    });
    if (res.ok) {
      const data = await res.json();
      console.log("=== INVOICES ===");
      data.items.forEach(inv => {
        console.log(`ID: ${inv.id} | Number: ${inv.number} | Total: ${inv.total} | TxId: ${inv.tx_id}`);
      });
    } else {
      console.log(await res.json());
    }
  } catch (err) {
    console.error("Error executing script:", err);
  }
}
run();
