const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key IN ('matias_api_token', 'matias_client_uuid', 'matias_environment')", async (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;
  const env = map.matias_environment;

  const baseUrl = env === 'production' 
    ? 'https://api-v2.matias-api.com/api/ubl2.1' 
    : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  let url = `${baseUrl}/resolutions`;
  if (clientUuid) url += `?client_uuid=${encodeURIComponent(clientUuid)}`;

  console.log("Querying:", url);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await res.json();
    console.log("Keys:", Object.keys(data));
    const items = data.dataRecords?.data || data.dataRecords || [];
    console.log("Count:", items.length);
    console.log("Items:", items.map(r => ({
      id: r.id,
      type_doc_id: r.type_document_id,
      prefix: r.prefix,
      resolution_number: r.resolution_number,
      invoice_name: r.invoice_name
    })));
  } catch (e) {
    console.error("Error:", e);
  }
});
