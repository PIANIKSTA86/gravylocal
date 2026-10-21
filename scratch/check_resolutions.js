const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function checkResolutions() {
  const getSetting = (k) => new Promise((res) => db.get("SELECT value FROM settings WHERE key = ?", [k], (_, r) => res(r ? r.value : null)));
  const token = await getSetting('matias_api_token');
  const clientUuid = await getSetting('matias_client_uuid');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  let url = `${baseUrl}/resolutions?client_uuid=${encodeURIComponent(clientUuid)}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const json = await resp.json();
  console.log('dataRecords type:', typeof json.dataRecords);
  if (json.dataRecords) {
    console.log('dataRecords keys:', Object.keys(json.dataRecords));
    console.log('dataRecords data length:', json.dataRecords.data ? json.dataRecords.data.length : 'no data key');
    (json.dataRecords.data || []).forEach(r => {
      console.log(`Tipo: ${r.type_document_id} (${r.type_document?.voucher_name}) | Prefijo: "${r.prefix}" | Res: "${r.resolution_number}" | Rango: ${r.range_from} - ${r.range_up}`);
    });
  }
  db.close();
}

checkResolutions();
