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

    const res = await fetch(`${pbUrl}/api/collections/tx_lines/records?filter=tx_id="l4sy5boeq0gdq6h"`, { headers });
    const data = await res.json();
    console.log("=== TX LINES ===");
    data.items.forEach(line => {
      console.log(`ID: ${line.id} | Account: ${line.account_id} | Debit: ${line.debit} | Credit: ${line.credit} | cross_doc_ref: "${line.cross_doc_ref}"`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
