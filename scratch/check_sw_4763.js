const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function testSoftware4763() {
  const getSetting = (k) => new Promise((res) => db.get("SELECT value FROM settings WHERE key = ?", [k], (_, r) => res(r ? r.value : null)));
  const token = await getSetting('matias_api_token');
  const clientUuid = await getSetting('matias_client_uuid');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  let url = `${baseUrl}/software/4763?client_uuid=${encodeURIComponent(clientUuid)}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const json = await resp.json();
  console.log('Software 4763 (Facturación):', json?.dataRecords?.data);
  db.close();
}

testSoftware4763();
