const http = require('http');
const sqlite3 = require('sqlite3');
const fs = require('fs');

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.get("SELECT xml_content FROM einvoice_docs WHERE tx_id = 'l4dpgvdy6skbfp9'", (err, row) => {
  const xml = row ? row.xml_content : '';

  // Case 1: with invoiceData
  const payload1 = JSON.stringify({
    xmlContent: xml,
    filename: 'FE-00000005',
    invoiceData: {
      docId: 'FE-00000005',
      payableAmount: 1500,
      lines: [
        { desc: 'Producto de prueba', code: 'P01', qty: 10, unitPrice: 150, lineTotal: 1500 }
      ]
    }
  });

  // Case 2: WITHOUT invoiceData (only xmlContent)
  const payload2 = JSON.stringify({
    xmlContent: xml,
    filename: 'FE-00000005'
  });

  function callOrch(p, name) {
    return new Promise(resolve => {
      const req = http.request({
        hostname: 'localhost',
        port: 8088,
        path: '/api/dian/generate-pdf',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(p)
        }
      }, (res) => {
        let chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          fs.writeFileSync(`scratch/${name}.pdf`, buf);
          console.log(`[${name}] PDF saved, size:`, buf.length);
          resolve();
        });
      });
      req.write(p);
      req.end();
    });
  }

  async function run() {
    await callOrch(payload1, 'with_invoice_data');
    await callOrch(payload2, 'without_invoice_data');
    db.close();
  }
  run();
});
