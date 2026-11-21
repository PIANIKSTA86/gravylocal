const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key IN ('matias_api_token', 'matias_environment')", [], (err, rows) => {
  if (err) {
    console.error("DB Error:", err);
    return;
  }
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);

  const token = settings.matias_api_token;
  const env = settings.matias_environment || 'sandbox';
  const host = env === 'production' ? 'api-v2.matias-api.com' : 'sandbox-api.matias-api.com';

  console.log(`Probando conexión con MATIAS API [${env}] (${host})...`);

  const req = https.request({
    hostname: host,
    path: '/api/ubl2.1/status',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Response: ${data.slice(0, 300)}`);
    });
  });

  req.on('error', (e) => {
    console.error('Request Error:', e.message);
  });
  req.end();
});
