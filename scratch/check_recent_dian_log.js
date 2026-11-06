const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.all("SELECT id, number, cufe, xml_url, pdf_url FROM electronic_documents WHERE number LIKE '%12%' OR number LIKE '%9%'", (err, elDocs) => {
  console.log("Electronic Documents:", elDocs);

  db.all("SELECT id, tx_id, document_number, request_payload, response_payload FROM dian_logs ORDER BY created DESC LIMIT 3", (err2, logs) => {
    if (err2) {
      console.log("No dian_logs or error:", err2.message);
    } else {
      console.log("Recent dian_logs count:", logs?.length);
      logs?.forEach(l => {
        console.log(`\n=== DIAN LOG [${l.document_number}] ===`);
        try {
          const req = JSON.parse(l.request_payload);
          console.log("Notes in payload:", req.notes);
          console.log("Full request keys:", Object.keys(req));
          if (req.customer) console.log("Customer keys:", Object.keys(req.customer));
          const res = JSON.parse(l.response_payload);
          console.log("Response keys:", Object.keys(res));
          if (res.pdf) console.log("PDF in response:", res.pdf);
          if (res.url_pdf) console.log("url_pdf:", res.url_pdf);
          if (res.qr) console.log("qr:", res.qr);
        } catch (_) {
          console.log("Payload slice:", l.request_payload?.slice(0, 200));
        }
      });
    }
    db.close();
  });
});

