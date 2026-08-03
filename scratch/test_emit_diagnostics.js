const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

async function testEmitDiagnostics() {
  let token = '';
  const loginRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'admin123456' })
  });

  if (loginRes.ok) {
    const data = await loginRes.json();
    token = data.token;
  } else {
    console.log('Login failed');
    db.close();
    return;
  }

  // Get invoice FV-00003773
  db.get("SELECT * FROM invoices WHERE number = 'FV-00003773'", async (err, inv) => {
    if (err || !inv) {
      console.log("Invoice FV-00003773 not found:", err);
      db.close();
      return;
    }
    console.log("Invoice FV-00003773:", { id: inv.id, number: inv.number, status: inv.status, tx_id: inv.tx_id, customer_id: inv.customer_id });

    // Find transaction for FV-00003773 or tx_id
    db.all("SELECT * FROM transactions WHERE cross_number = 'FV-00003773' OR id = ?", [inv.tx_id || 'x'], async (err, txs) => {
      console.log("Transactions found for FV-00003773:", txs);

      const targetTxId = inv.tx_id || (txs.length ? txs[0].id : null);
      if (!targetTxId) {
        console.log("No transaction ID available for emit test");
        db.close();
        return;
      }

      console.log(`\nTesting POST /api/dian/emit with txId: ${targetTxId}...`);
      const emitRes = await fetch('http://127.0.0.1:8090/api/dian/emit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ txId: targetTxId })
      });

      console.log("Status:", emitRes.status);
      const resText = await emitRes.text();
      console.log("Response Body:", resText);

      db.close();
    });
  });
}

testEmitDiagnostics();
