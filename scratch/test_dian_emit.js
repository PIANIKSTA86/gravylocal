const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

async function testEmit() {
  try {
    let loginRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'admin123456' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed');
      db.close();
      return;
    }
    const data = await loginRes.json();
    const token = data.token;

    // Find the latest draft invoice
    db.get("SELECT * FROM invoices WHERE status = 'draft' ORDER BY created DESC LIMIT 1", async (err, inv) => {
      if (err || !inv) {
        console.error('No draft invoice found:', err);
        db.close();
        return;
      }
      console.log('Testing emit for invoice:', inv.number, 'ID:', inv.id, 'tx_id:', inv.tx_id);

      // First ensure it is posted locally to have tx_id if needed
      let txId = inv.tx_id;
      if (!txId) {
        // Find transaction with this number if any
        db.get("SELECT id FROM transactions WHERE number = ?", [inv.number], async (errTx, txRow) => {
          if (txRow) {
            txId = txRow.id;
          }
          await runEmitCall(txId, token);
        });
      } else {
        await runEmitCall(txId, token);
      }
    });

  } catch (err) {
    console.error('Error:', err);
    db.close();
  }
}

async function runEmitCall(txId, token) {
  console.log('Calling POST /api/dian/emit with txId:', txId);
  const res = await fetch('http://127.0.0.1:8090/api/dian/emit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ txId: txId })
  });

  console.log('\n=======================================');
  console.log('HTTP STATUS:', res.status);
  const resText = await res.text();
  console.log('RESPONSE TEXT:', resText);
  console.log('=======================================\n');
  db.close();
}

testEmit();
