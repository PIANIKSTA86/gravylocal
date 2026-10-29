const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key IN ('matias_api_token', 'matias_client_uuid', 'matias_environment')", async (err, rows) => {
  if (err) return console.error(err);
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;
  const env = map.matias_environment;

  const baseUrl = env === 'production' 
    ? 'https://api-v2.matias-api.com/api/ubl2.1' 
    : 'https://sandbox-api.matias-api.com/api/ubl2.1';

  const url = `${baseUrl}/resolutions/9238?client_uuid=${encodeURIComponent(clientUuid)}`;
  console.log("PUT:", url);

  const payload = {
    records: JSON.stringify({
      prefix: "NC",
      resolution_number: "18760000001",
      invoice_name: "NOTA CREDITO DE FACTURA DE VENTA"
    })
  };

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error updating MATIAS resolution:", e);
  }
});
