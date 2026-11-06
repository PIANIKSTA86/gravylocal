const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;
  const req = https.request({
    hostname: 'api-v2.matias-api.com',
    path: '/api/ubl2.1/company?client_uuid=' + clientUuid,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
  }, (res) => {
    let b = '';
    res.on('data', d => b += d);
    res.on('end', () => {
      console.log('Company:', JSON.parse(b));
      db.close();
    });
  });
  req.end();
});

