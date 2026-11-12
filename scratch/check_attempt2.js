const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const config = {};
  rows.forEach(r => config[r.key] = r.value);
  const token = config.matias_api_token;
  const cufe = '019ba22c83276c9f80dd6e17b448543538b36ad4aa8b182755762801ab06d43bdd54eb27cd804e396c9599d87c331a59';

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
      console.log("Success:", parsed.success);
      if (parsed.content && parsed.content.XmlBytesBase64) {
        const xml = Buffer.from(parsed.content.XmlBytesBase64, 'base64').toString('utf8');
        fs.writeFileSync('scratch/nc466_attempt2.xml', xml);
        console.log("Saved scratch/nc466_attempt2.xml, length:", xml.length);

        // Print header, CustomizationID, ProfileID, DiscrepancyResponse, BillingReference
        const headerEnd = xml.indexOf('<cac:AccountingSupplierParty>');
        console.log("\n--- XML HEADER ---");
        console.log(xml.substring(xml.indexOf('<cbc:UBLVersionID>'), headerEnd));
      } else {
        console.log("Content:", parsed);
      }
    });
  });
  req.end();
  db.close();
});

