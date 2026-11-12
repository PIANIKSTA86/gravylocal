const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  const token = config.matias_api_token;
  const cufe = '164854b2b9933ef950d79112d22f70359ef4f324965f3766b44f7234c880374cf1b6dc8bfab4aa830bfdcaad1434a7f3';

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
      if (parsed.content && parsed.content.XmlBytesBase64) {
        const xml = Buffer.from(parsed.content.XmlBytesBase64, 'base64').toString('utf8');
        fs.writeFileSync('scratch/nc466_attempt3.xml', xml);
        console.log("Saved scratch/nc466_attempt3.xml, length:", xml.length);

        // Print header up to AccountingSupplierParty
        const headerEnd = xml.indexOf('<cac:AccountingSupplierParty>');
        console.log("\n--- XML HEADER ATTEMPT 3 ---");
        console.log(xml.substring(xml.indexOf('<cbc:UBLVersionID>'), headerEnd));
      }
    });
  });
  req.end();
  db.close();
});

