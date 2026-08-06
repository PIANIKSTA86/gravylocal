const { DatabaseSync } = require('node:sqlite');
const path = require('path');

async function testEmit() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log('=== PENDING DIAN INVOICES / TRANSACTIONS ===');
    const pendingInvoices = db.prepare(`
      SELECT i.id as inv_id, i.number, i.tx_id, t.number as tx_number, tt.code as type_code
      FROM invoices i
      JOIN transactions t ON i.tx_id = t.id
      JOIN transaction_types tt ON t.tx_type_id = tt.id
      LEFT JOIN einvoice_docs ed ON ed.tx_id = t.id
      WHERE ed.id IS NULL OR ed.status != 'aceptada'
      ORDER BY i.created DESC LIMIT 5
    `).all();

    console.table(pendingInvoices);

    if (pendingInvoices.length === 0) {
      console.log('No pending invoices found.');
      return;
    }

    const target = pendingInvoices[0];
    console.log(`Testing emit for tx_id: ${target.tx_id} (${target.number})...`);

    // Try superusers auth or users auth
    let token = '';
    let authRes = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@admin.com', password: 'admin' })
    });
    
    if (authRes.ok) {
      const data = await authRes.json();
      token = data.token;
    } else {
      // Try users collection
      authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@contaco.com', password: '1234567890' })
      });
      if (authRes.ok) {
        const data = await authRes.json();
        token = data.token;
      }
    }

    if (!token) {
      console.error('Auth failed on both endpoints. Response status:', authRes.status, await authRes.text());
      return;
    }

    console.log('Got Auth Token successfully!');

    // Send POST /api/dian/emit
    const emitRes = await fetch('http://127.0.0.1:8090/api/dian/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ txId: target.tx_id })
    });

    console.log(`HTTP Status: ${emitRes.status}`);
    const emitText = await emitRes.text();
    console.log(`HTTP Response Body:\n${emitText}`);

  } catch (err) {
    console.error('Test error:', err);
  }
}

testEmit();
