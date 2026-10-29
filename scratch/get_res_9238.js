const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key IN ('matias_api_token', 'matias_client_uuid', 'matias_environment')", async (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;

  const url = `https://api-v2.matias-api.com/api/ubl2.1/resolutions/9238?client_uuid=${encodeURIComponent(clientUuid)}`;
  console.log("GET:", url);
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Data:", JSON.stringify(data, null, 2));
});
