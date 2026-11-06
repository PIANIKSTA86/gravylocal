const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;
  const baseUrl = map.matias_environment === 'production' ? 'api-v2.matias-api.com' : 'sandbox-api.matias-api.com';

  const paths = [
    '/api/ubl2.1/company',
    '/api/ubl2.1/company/templates',
    '/api/ubl2.1/documents?search=FE9'
  ];

  for (const p of paths) {
    await new Promise(resolve => {
      const fullPath = p + (clientUuid ? (p.includes('?') ? `&client_uuid=${encodeURIComponent(clientUuid)}` : `?client_uuid=${encodeURIComponent(clientUuid)}`) : '');
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
          console.log(`\n=== GET ${p} Status: ${res.statusCode} ===`);
          try {
            const parsed = JSON.parse(body);
            console.log(JSON.stringify(parsed, null, 2).slice(0, 1500));
          } catch(e) {
            console.log(body.slice(0, 300));
          }
          resolve();
        });
      });
      req.end();
    });
  }
  db.close();
});

