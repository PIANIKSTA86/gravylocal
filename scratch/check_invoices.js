const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token };

    // Fetch invoices
    const res = await fetch(`${pbUrl}/api/collections/invoices/records?perPage=10&sort=-created`, { headers });
    const invData = await res.json();
    
    console.log("=== INVOICES ===");
    for (const inv of invData.items || []) {
      console.log(`Inv ID: ${inv.id} | Number: ${inv.number} | Status: ${inv.status} | Tx ID: ${inv.tx_id}`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
