const pbUrl = 'http://127.0.0.1:8090';
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

async function tryAuth() {
  try {
    const res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const data = await res.json();
    return data.token;
  } catch (e) {
    console.error("Auth error", e);
  }
  return null;
}

async function run() {
  const token = await tryAuth();
  if (!token) {
    console.error("Failed to authenticate");
    return;
  }

  const txId = 'wid30ti2e2irdtp'; // 4P1C-00000008
  console.log(`Triggering check-status for Tx ID: ${txId}`);

  const statusRes = await fetch(`${pbUrl}/api/dian/check-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ txId })
  });

  console.log(`Check-Status Response Status: ${statusRes.status}`);
  try {
    const statusData = await statusRes.json();
    console.log("Response JSON:");
    console.log(JSON.stringify(statusData, null, 2));
  } catch (e) {
    console.log("Response text (not JSON):", await statusRes.text());
  }

  // Now query the DB to verify updates
  try {
    const dbPath = path.resolve('pb_data/data.db');
    const db = new DatabaseSync(dbPath);
    const docs = db.prepare("SELECT * FROM einvoice_docs WHERE tx_id = 'wid30ti2e2irdtp'").all();
    console.log('\n--- SQLite record after check-status ---');
    console.log(JSON.stringify(docs.map(d => ({
      id: d.id,
      tx_id: d.tx_id,
      status: d.status,
      cufe: d.cufe,
      dian_response: d.dian_response,
      xml_length: d.xml_content ? d.xml_content.length : 0
    })), null, 2));
  } catch (dbErr) {
    console.error("Error reading DB:", dbErr);
  }
}

run();
