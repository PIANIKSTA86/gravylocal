const sqlite3 = require('sqlite3').verbose();
const https = require('https');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  const token = config.matias_api_token;
  const cufe = 'f591d196d43db0dceb2eaa641ed1b2fd651e29f16c64de001a91037e21473dfedfa6201e5c0230bced56394bed1321af';

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

  const statusRes = await getApi(`/api/ubl2.1/status/document/${cufe}`);
  console.log("Status response:", JSON.stringify(statusRes, null, 2));

  const xmlRes = await getApi(`/api/ubl2.1/documents/xml/${cufe}`);
  console.log("XML response status:", xmlRes.status);
  if (xmlRes.data) {
    console.log("XML data keys:", Object.keys(xmlRes.data));
    if (xmlRes.data.xml) {
      console.log("XML preview (first 1000):", xmlRes.data.xml.substring(0, 1000));
      // Save XML to scratch
      require('fs').writeFileSync('scratch/nc466_matias_generated.xml', xmlRes.data.xml);
      console.log("Saved scratch/nc466_matias_generated.xml");
    }
  }

  db.close();
});

