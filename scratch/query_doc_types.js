const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  const token = config.matias_api_token;

  function getApi(path) {
    return new Promise((resolve) => {
      const url = new URL(path, "https://api-v2.matias-api.com");
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch(e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.end();
    });
  }

  const dtRes = await getApi('/api/ubl2.1/document-type');
  console.log("Document Types:", JSON.stringify(dtRes, null, 2));

  db.close();
});

