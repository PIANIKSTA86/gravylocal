const http = require('http');
const fs = require('fs');

function testDownloadPdf(id, label) {
  return new Promise((resolve, reject) => {
    const req = http.request('http://127.0.0.1:8090/api/dian/nomina/download-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.pdfBase64) {
            const buf = Buffer.from(json.pdfBase64, 'base64');
            console.log(`[OK] ${label} (${id}): Generated PDF ${json.filename}, size: ${buf.length} bytes`);
            resolve(buf);
          } else {
            console.error(`[FAIL] ${label}:`, json);
            resolve(null);
          }
        } catch (e) {
          console.error(`[ERROR] ${label}:`, e.message, data.slice(0, 300));
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ id }));
    req.end();
  });
}

async function run() {
  console.log("Testing PDF generation via 8090 API...");
  await testDownloadPdf('swpcwm9ph97o8ob', 'NANE-7 (Cielo Aldana)');
  await testDownloadPdf('szm0pckx4c3o1n0', 'NOM-374 (Angelica Moncada)');
  await testDownloadPdf('yeob3vrnydg5ecz', 'NANE-4 (Angelica Eliminacion)');
  await testDownloadPdf('xg4mflrlkzkr697', 'NANE-6 (Angelica Reemplazo)');
}

run();

