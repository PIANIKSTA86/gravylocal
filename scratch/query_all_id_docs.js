const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;
  const baseUrl = map.matias_environment === 'production' ? 'api-v2.matias-api.com' : 'sandbox-api.matias-api.com';

  const fullPath = `/api/ubl2.1/identity-documents${clientUuid ? `?client_uuid=${encodeURIComponent(clientUuid)}` : ''}`;
  const req = https.request({
    hostname: baseUrl,
    path: fullPath,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const parsed = JSON.parse(body);
      console.log("Full Identity Documents List from MATIAS API:");
      console.log(JSON.stringify(parsed.dataRecords?.data || parsed, null, 2));
      db.close();
    });
  });
  req.end();
});

