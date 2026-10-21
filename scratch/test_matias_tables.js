const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", (err1, rTok) => {
  const token = rTok.value;
  db.get("SELECT value FROM settings WHERE key = 'matias_client_uuid'", (err2, rUuid) => {
    const clientUuid = rUuid.value;

    const endpoints = [
      '/api/ubl2.1/tables/municipalities',
      '/api/ubl2.1/municipalities',
      '/api/ubl2.1/tables/cities',
      '/api/ubl2.1/tables/municipalities?search=Cali'
    ];

    endpoints.forEach(ep => {
      const options = {
        hostname: 'api-v2.matias-api.com',
        path: ep,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Matias-Client': clientUuid,
          'Accept': 'application/json'
        }
      };
      https.get(options, (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => console.log(ep, res.statusCode, b.slice(0, 300)));
      });
    });
  });
});
