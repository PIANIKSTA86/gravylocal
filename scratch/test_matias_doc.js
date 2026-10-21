const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", [], (err, rows) => {
  db.close();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  const token = settings.matias_api_token;
  console.log('Token exists:', !!token);

  function get(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.matias-api.com',
        path: '/api/ubl2.1' + path,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        },
        rejectUnauthorized: false
      };
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  async function run() {
    const docRes = await get('/documents/f39747e5-cbcf-11f1-a6db-d843ae899220');
    console.log('Doc Status:', docRes.status);
    try {
      const parsed = JSON.parse(docRes.body);
      console.log('Keys:', Object.keys(parsed));
      if (parsed.dataRecord) {
        console.log('dataRecord keys:', Object.keys(parsed.dataRecord));
        console.log('dataRecord fields:', {
          id: parsed.dataRecord.id,
          identification_number: parsed.dataRecord.identification_number,
          number: parsed.dataRecord.number,
          prefix: parsed.dataRecord.prefix,
          cufe: parsed.dataRecord.cufe,
          xml_url: parsed.dataRecord.xml_url,
          pdf_url: parsed.dataRecord.pdf_url,
          attached_document: parsed.dataRecord.attached_document ? 'yes' : 'no'
        });
      }
    } catch(e) {
      console.log('Body snippet:', docRes.body.slice(0, 300));
    }
  }
  run();
});
