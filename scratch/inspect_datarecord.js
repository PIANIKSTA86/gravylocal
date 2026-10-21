const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", [], (err, row) => {
  db.close();
  const token = row.value;

  const req = https.request({
    hostname: 'api-v2.matias-api.com',
    path: '/api/ubl2.1/documents/f39747e5-cbcf-11f1-a6db-d843ae899220',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  }, (res) => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(d);
      console.log('Record top keys:', Object.keys(parsed.dataRecord));
      console.log('Record summary:', {
        id: parsed.dataRecord.id,
        uuid: parsed.dataRecord.uuid,
        document_number: parsed.dataRecord.document_number,
        payable_amount: parsed.dataRecord.payable_amount,
        XmlDocumentKey: parsed.dataRecord.XmlDocumentKey,
        XmlDocumentName: parsed.dataRecord.XmlDocumentName
      });
      // Check if there are any attached_document, xml, or pdf fields
      for (let k in parsed.dataRecord) {
        if (typeof parsed.dataRecord[k] === 'string' && (parsed.dataRecord[k].includes('<') || parsed.dataRecord[k].includes('http') || parsed.dataRecord[k].length > 100)) {
          console.log(`Key ${k}: (len ${parsed.dataRecord[k].length}) -> ${parsed.dataRecord[k].slice(0, 80)}`);
        }
      }
    });
  });
  req.end();
});
