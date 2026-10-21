const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", [], async (err, row) => {
  db.close();
  const token = row.value;
  const uuid = 'f39747e5-cbcf-11f1-a6db-d843ae899220';
  const cufe = 'a6b5422deca4981aaaa7ba17d7fa645046958822835b215192056cecb272df285488c92afae42089a587e048ba52811c';

  function callPost(path, bodyObj) {
    return new Promise((resolve) => {
      const data = JSON.stringify(bodyObj || {});
      const req = https.request({
        hostname: 'api-v2.matias-api.com',
        path: '/api/ubl2.1' + path,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Accept': 'application/json'
        }
      }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: d }));
      });
      req.write(data);
      req.end();
    });
  }

  const r1 = await callPost(`/status/zip/${uuid}`);
  console.log('status/zip/uuid:', r1.status, r1.body.slice(0, 300));

  const r2 = await callPost(`/status/document/${uuid}`);
  console.log('status/document/uuid:', r2.status, r2.body.slice(0, 300));

  const r3 = await callPost(`/status/zip/${cufe}`);
  console.log('status/zip/cufe:', r3.status, r3.body.slice(0, 300));

  const r4 = await callPost(`/status/document/${cufe}`);
  console.log('status/document/cufe:', r4.status, r4.body.slice(0, 300));
});
