const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function checkSoftwareDetail() {
  const getSetting = (k) => new Promise((res) => db.get("SELECT value FROM settings WHERE key = ?", [k], (_, r) => res(r ? r.value : null)));
  const token = await getSetting('matias_api_token');
  const clientUuid = await getSetting('matias_client_uuid');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  let url = `${baseUrl}/software?client_uuid=${encodeURIComponent(clientUuid)}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const json = await resp.json();
  const list = json?.dataRecords?.data || [];
  list.forEach(s => {
    console.log(`\nSoftware [ID ${s.id}] -> ${s.typeDescription}:`);
    console.log(`  Environment: ${s.environment?.environment_name} (ID: ${s.environment_id})`);
    console.log(`  TestSetId: ${s.testsetid}`);
    console.log(`  Test Status: ${s.test_process_status}`);
    console.log(`  URL: ${s.url}`);
    console.log(`  Tech Key: ${s.technical_key ? s.technical_key.slice(0, 15) + '...' : 'none'}`);
  });
  db.close();
}

checkSoftwareDetail();
