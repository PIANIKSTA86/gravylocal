const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", [], (err, row) => {
  db.close();
  const token = row.value;

  const options = {
    hostname: 'api-v2.matias-api.com',
    path: '/api/ubl2.1/documents?search=FE5',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  };
  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const parsed = JSON.parse(body);
        console.log('Doc FE5:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw body:', body);
      }
    });
  });
  req.end();
});
