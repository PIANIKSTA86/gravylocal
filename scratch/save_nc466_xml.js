const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  const token = config.matias_api_token;
  const cufe = 'f591d196d43db0dceb2eaa641ed1b2fd651e29f16c64de001a91037e21473dfedfa6201e5c0230bced56394bed1321af';

  const url = new URL(`/api/ubl2.1/documents/xml/${cufe}`, "https://api-v2.matias-api.com");
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
      const parsed = JSON.parse(data);
      console.log("parsed.content type:", typeof parsed.content);
      if (typeof parsed.content === 'object') {
        console.log("content keys:", Object.keys(parsed.content));
        fs.writeFileSync('scratch/nc466_content.json', JSON.stringify(parsed.content, null, 2));
      } else {
        console.log("content preview:", String(parsed.content).substring(0, 200));
      }
    });
  });
  req.end();
  db.close();
});
