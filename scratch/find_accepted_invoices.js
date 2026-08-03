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

    // Fetch all einvoice_docs
    const res = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=100`, { headers });
    const docsData = await res.json();
    
    console.log("=== EINVOICE DOCS ===");
    for (const doc of docsData.items || []) {
      console.log(`Doc ID: ${doc.id} | Status: ${doc.status} | CUFE: ${doc.cufe || '(empty)'} | Tx ID: ${doc.tx_id}`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
