const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.all("SELECT id, number, customer, customer_name, customer_document, total FROM invoices WHERE number LIKE '%9%'", (err, invoices) => {
  if (err) console.error("Invoices error:", err);
  console.log("Invoices:", invoices);

  db.all("SELECT id, document_number, request_payload, response_payload FROM dian_logs WHERE document_number LIKE '%9%' OR document_number LIKE '%FE9%' ORDER BY created DESC LIMIT 5", (err2, logs) => {
    if (err2) console.error("Logs error:", err2);
    logs?.forEach(l => {
      console.log("\n=== LOG FOR:", l.document_number);
      try {
        const req = JSON.parse(l.request_payload);
        console.log("Customer in payload:", JSON.stringify(req.customer || req.customer_party || req.acquired || req, null, 2).slice(0, 500));
      } catch (e) {
        console.log("Raw req:", l.request_payload?.slice(0, 300));
      }
    });

    db.all("SELECT * FROM customers WHERE identification_number LIKE '%901428834%' OR name LIKE '%DOMESTIKO%'", (err3, custs) => {
      if (err3) console.error("Cust error:", err3);
      console.log("\nCustomer in DB:", custs);
      db.close();
    });
  });
});

