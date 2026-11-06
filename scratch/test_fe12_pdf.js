const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", async (err, rows) => {
  const map = {};
  rows.forEach(r => map[r.key] = r.value);
  const token = map.matias_api_token;
  const clientUuid = map.matias_client_uuid;
  const baseUrl = map.matias_environment === 'production' ? 'api-v2.matias-api.com' : 'sandbox-api.matias-api.com';

  // Let's get the document details for FE12 (uuid: 462c1345-d96a-11f1-a807-d843ae899220)
  const uuid = '462c1345-d96a-11f1-a807-d843ae899220';
  const fullPath = `/api/ubl2.1/download-pdf/${uuid}${clientUuid ? `?client_uuid=${encodeURIComponent(clientUuid)}` : ''}`;

  console.log("Downloading PDF from MATIAS API:", fullPath);
  const req = https.request({
    hostname: baseUrl,
    path: fullPath,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    console.log("PDF download status:", res.statusCode, res.headers['content-type']);
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      console.log("Buffer length:", buffer.length);
      fs.writeFileSync('scratch/fe12_matias.pdf', buffer);
      
      // Let's search inside the buffer or convert to text
      const str = buffer.toString('utf-8');
      if (str.includes('porcelanato') || str.includes('CADENA') || str.includes('774')) {
        console.log("MATCH! The text IS inside the PDF returned by MATIAS API!");
      } else {
        console.log("The text was NOT found as plain text in the PDF buffer (could be compressed streams).");
      }
      db.close();
    });
  });
  req.end();
});

