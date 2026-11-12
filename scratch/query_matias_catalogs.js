const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%' OR key LIKE '%dian%'", async (err, rows) => {
  if (err || !rows) {
    console.error("No settings found", err);
    return;
  }
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  console.log("Found keys:", Object.keys(config));
  const token = config.matias_api_token;
  const baseUrl = config.matias_api_url || "https://api-v2.matias-api.com";
  console.log("Base URL:", baseUrl);

  function getApi(path) {
    return new Promise((resolve) => {
      const url = new URL(path, baseUrl);
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

  // 1. Check operation types
  const opRes = await getApi('/api/ubl2.1/operation-type');
  console.log("GET /api/ubl2.1/operation-type status:", opRes.status);
  if (opRes.data) {
    console.log("Operation types:", JSON.stringify(opRes.data, null, 2));
  }

  // 2. Check type documents
  const typeDocRes = await getApi('/api/ubl2.1/type-document');
  console.log("GET /api/ubl2.1/type-document status:", typeDocRes.status);
  if (typeDocRes.data) {
    console.log("Type docs:", JSON.stringify(typeDocRes.data, null, 2));
  }

  // 3. Check discrepancy response types
  const discRes = await getApi('/api/ubl2.1/discrepancy-response');
  console.log("GET /api/ubl2.1/discrepancy-response status:", discRes.status);
  if (discRes.data) {
    console.log("Discrepancies:", JSON.stringify(discRes.data, null, 2));
  }

  db.close();
});
