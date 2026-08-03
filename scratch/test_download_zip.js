const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const txId = 'cymzvzu7se9yaw6';

async function run() {
  db.get("SELECT xml_content, cufe FROM einvoice_docs WHERE tx_id = ?", [txId], async (err, docRow) => {
    if (err || !docRow) {
      console.error("No einvoice_docs record found:", err || "Not found");
      return;
    }

    db.get("SELECT * FROM transactions WHERE id = ?", [txId], async (err, txRow) => {
      if (err || !txRow) {
        console.error("No transaction record found:", err || "Not found");
        return;
      }

      // Query customer info
      db.get("SELECT * FROM third_parties WHERE id = ?", [txRow.third_party_id], async (err, customerRow) => {
        if (err) console.error("Error loading customer:", err);
        
        // Let's get company info (which is standard)
        db.all("SELECT key, value FROM settings", [], async (err, settingsRows) => {
          const settings = {};
          if (settingsRows) {
            settingsRows.forEach(r => settings[r.key] = r.value);
          }

          // Construct lines
          // We can query transaction_details or make a test set based on what was in the invoice
          // For simplicity we query transaction_details
          db.all("SELECT * FROM transaction_details WHERE tx_id = ?", [txId], async (err, detailRows) => {
            const lines = (detailRows || []).map(d => ({
              desc: d.description || 'Producto',
              code: d.product_id || 'PROD',
              qty: d.qty || 1,
              unitPrice: d.price || 0,
              lineTotal: (d.qty || 1) * (d.price || 0),
              ivaRate: 19 // Default test rate
            }));

            const invoiceData = {
              docId: txRow.number,
              issueDate: txRow.date,
              issueTime: '12:00:00',
              cufe: docRow.cufe,
              payableAmount: lines.reduce((sum, l) => sum + l.lineTotal, 0),
              supplierName: settings.company_name || 'DOMESTIKO SAS',
              supplierNit: settings.company_nit || '901428834',
              supplierAddress: settings.company_address || 'CALI',
              supplierPhone: settings.company_phone || '3004205403',
              supplierEmail: settings.company_email || 'info@gravy.com',
              customerName: customerRow ? customerRow.name : 'Consumidor Final',
              customerNit: customerRow ? customerRow.doc_number : '22222222',
              customerAddress: customerRow ? customerRow.address : '',
              customerPhone: customerRow ? customerRow.phone : '',
              customerEmail: customerRow ? customerRow.email : '',
              lines: lines,
              companyLogo: settings.company_logo || '',
              cajero: 'Admin',
              paymentMethod: 'EFECTIVO',
              resolutionName: 'Resolución Facturación Electrónica',
              resolutionNumber: '18764110175297',
              resolutionDate: '2026-05-25',
              resolutionExpiry: '2028-05-25',
              resolutionRangeFrom: '3661',
              resolutionRangeTo: '5000',
              resolutionPrefix: 'FV'
            };

            const payload = {
              xmlContent: docRow.xml_content,
              filename: txRow.number,
              invoiceData: invoiceData
            };

            console.log("Calling orchestrator to generate ZIP/PDF...");
            try {
              const res = await fetch('http://127.0.0.1:8088/api/dian/download-zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              if (res.status !== 200) {
                console.error("HTTP error:", res.status, await res.text());
                return;
              }

              // Since it returns a ZIP buffer, let's read the ZIP file
              const arrayBuffer = await res.arrayBuffer();
              const zipBuffer = Buffer.from(arrayBuffer);
              
              // Let's save the zip file first
              const zipPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/scratch/invoice_test.zip';
              fs.writeFileSync(zipPath, zipBuffer);
              console.log("ZIP saved to " + zipPath);

              // We don't have a built-in unzipper easily, but since we are on node,
              // we can try using standard adm-zip if installed, or just know that the ZIP was generated!
              // But wait! We can also query the other endpoint if there is one that returns PDF directly?
              // Is there an endpoint that returns PDF directly?
              // No, but we can look at hub/orchestrator.js to see if there is a PDF endpoint!
              
            } catch (e) {
              console.error("Error fetching download-zip:", e);
            }
          });
        });
      });
    });
  });
}

run();
