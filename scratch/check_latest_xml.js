const url = 'http://127.0.0.1:8090/api/collections';

async function check() {
  try {
    const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    }).then(r => r.json());
    
    if (!login.token) {
      console.log("No token", login);
      return;
    }
    const token = login.token;
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    // Fetch invoices
    const invRes = await fetch(`${url}/invoices/records?perPage=50`, { headers }).then(r => r.json());
    if (!invRes.items || invRes.items.length === 0) {
      console.log("No invoices found at all");
      return;
    }

    console.log("All invoices:");
    for (const inv of invRes.items) {
      console.log(`- ID: ${inv.id}, Number: ${inv.number}, Tx ID: ${inv.tx_id}`);
    }

  } catch(e) {
    console.error("Error:", e);
  }
}

check();
