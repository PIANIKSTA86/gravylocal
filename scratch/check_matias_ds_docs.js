const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function checkMatiasDocuments() {
  const getSetting = (k) => new Promise((res) => db.get("SELECT value FROM settings WHERE key = ?", [k], (_, r) => res(r ? r.value : null)));
  const token = await getSetting('matias_api_token');
  const clientUuid = await getSetting('matias_client_uuid');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  let url = `${baseUrl}/documents?client_uuid=${encodeURIComponent(clientUuid)}&type_document_id=11`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const json = await resp.json();
  if (json.dataRecords && json.dataRecords.data) {
    console.log('Doc 0 keys:', Object.keys(json.dataRecords.data[0]));
    console.log('Doc 0 sample:', json.dataRecords.data[0]);
  } else {
    console.log('Documentos tipo 11 (DS):', json);
  }
  db.close();
}

checkMatiasDocuments();
