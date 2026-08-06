const { DatabaseSync } = require('node:sqlite');
const path = require('path');

async function testEmitNow() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    // Get recent transactions that might be emitted
    const recentTxs = db.prepare(`
      SELECT t.id, t.number, tt.code as type_code
      FROM transactions t
      JOIN transaction_types tt ON t.tx_type_id = tt.id
      WHERE tt.code IN ('FV', 'POS', 'NC', 'ND', 'DS', 'NDS')
      ORDER BY t.id DESC LIMIT 5
    `).all();

    console.log('Recent transactions candidate for emission:');
    console.table(recentTxs);

    // Authenticate superuser to test
    const authRes = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@admin.com', password: '1234567890' })
    });
    
    const { token } = await authRes.json();

    // Authenticate a user token as well
    const userAuthRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: '1234567890' })
    });

    let userToken = '';
    if (userAuthRes.ok) {
      const uData = await userAuthRes.json();
      userToken = uData.token;
    } else {
      console.log('User auth error:', userAuthRes.status, await userAuthRes.text());
    }

    const testToken = userToken || token;

    for (const tx of recentTxs) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Testing /api/dian/emit for tx ${tx.id} (${tx.number})...`);

      const emitRes = await fetch('http://127.0.0.1:8090/api/dian/emit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': testToken
        },
        body: JSON.stringify({ txId: tx.id })
      });

      console.log(`HTTP Status: ${emitRes.status}`);
      const text = await emitRes.text();
      console.log(`Response: ${text}`);
    }

  } catch (err) {
    console.error('Error testing emit:', err);
  }
}

testEmitNow();
