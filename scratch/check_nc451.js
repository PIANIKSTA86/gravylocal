const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const authData = await login.json();
    const headers = { 'Authorization': authData.token };

    // Search transaction NC-00000451 or 451
    const resTx = await fetch(`${pbUrl}/api/collections/transactions/records?filter=number%20~%20'451'`, { headers });
    const txData = await resTx.json();
    console.log("=== TRANSACTIONS matching 451 ===");
    console.log(JSON.stringify(txData.items, null, 2));

    if (txData.items && txData.items.length > 0) {
      for (const tx of txData.items) {
        const resInv = await fetch(`${pbUrl}/api/collections/invoices/records?filter=tx_id%3D'${tx.id}'`, { headers });
        const invData = await resInv.json();
        console.log(`=== INVOICES for tx ${tx.id} (${tx.number}) ===`);
        console.log(JSON.stringify(invData.items, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
