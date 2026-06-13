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

    const res = await fetch(`${pbUrl}/api/collections/invoices/records?filter=number%20~%20'FENC'`, { headers });
    const data = await res.json();
    console.log("=== CREDIT NOTES ===");
    data.items.forEach(inv => {
      console.log(`Number: ${inv.number} | cross_doc_ref: "${inv.cross_doc_ref}" | tx_id: ${inv.tx_id}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
