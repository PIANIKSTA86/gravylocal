const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key IN ('matias_api_token', 'matias_client_uuid')", async (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;

  const url = `https://api-v2.matias-api.com/api/ubl2.1/resolutions?client_uuid=${encodeURIComponent(clientUuid)}`;
  console.log("POST:", url);

  const payload = {
    records: JSON.stringify({
      type_document_id: 5,
      resolution_number: "18760000001",
      prefix: "NC",
      invoice_name: "NOTA CREDITO DE FACTURA DE VENTA",
      range_from: 1,
      range_up: 5000,
      date_from: "2024-01-01",
      date_up: "2030-12-31",
      initial_number: 1,
      active: 1
    })
  };

  const res = await fetch(url, {
    method: 'POST',
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
});
