const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", [], async (err, row) => {
  db.close();
  const token = row.value;

  const uuid = 'f39747e5-cbcf-11f1-a6db-d843ae899220';
  const cufe = 'a6b5422deca4981aaaa7ba17d7fa645046958822835b215192056cecb272df285488c92afae42089a587e048ba52811c';
  const xmlName = 'fv11306363930002600000004.xml';

  const testPaths = [
    `/documents/${uuid}`,
    `/download-pdf/${uuid}`,
    `/download-xml/${uuid}`,
    `/download-zip/${uuid}`,
    `/download/pdf/${uuid}`,
    `/download/xml/${uuid}`,
    `/download/zip/${uuid}`,
    `/documents/download-pdf/${uuid}`,
    `/documents/download-xml/${uuid}`,
    `/documents/download-zip/${uuid}`,
    `/pdf/${uuid}`,
    `/xml/${uuid}`,
    `/zip/${uuid}`,
    `/ubl/download-xml/${uuid}`,
    `/ubl/download-xml/${cufe}`,
    `/status/zip/${uuid}`,
    `/status/document/${uuid}`,
    `/status/document/${cufe}`,
    `/files/${xmlName}`,
    `/download-file/${xmlName}`
  ];

  for (const p of testPaths) {
    try {
      const res = await new Promise((resolve) => {
        const req = https.request({
          hostname: 'api-v2.matias-api.com',
          path: '/api/ubl2.1' + p,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        }, (res) => {
          let d = '';
          res.on('data', chunk => d += chunk);
          res.on('end', () => resolve({ path: p, status: res.statusCode, len: d.length, preview: d.slice(0, 100) }));
        });
        req.on('error', (e) => resolve({ path: p, status: 'ERR', error: e.message }));
        req.end();
      });
      if (res.status !== 404) {
        console.log(`FOUND! [${res.status}] ${res.path} (len: ${res.len}) -> ${res.preview}`);
      } else {
        // console.log(`404: ${res.path}`);
      }
    } catch (_) {}
  }
});
