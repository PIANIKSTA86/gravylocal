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

    // Get the invoice
    const inv = await fetch(`${url}/invoices/records/z6fy8gxto1rt9gt?expand=tx_type_id`, { headers: { 'Authorization': token } }).then(r => r.json());
    console.log("=== INVOICE ===");
    console.log(inv);

    // Get the transaction
    const tx = await fetch(`${url}/transactions/records/5hokx5ygbexf8fw?expand=tx_type_id`, { headers: { 'Authorization': token } }).then(r => r.json());
    console.log("=== TRANSACTION ===");
    console.log(tx);

  } catch(e) {
    console.error("Fetch error:", e);
  }
}

check();
