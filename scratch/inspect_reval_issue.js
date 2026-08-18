const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath);

console.log("=== INSPECCIÓN DE BD PARA FV-00003786 ===");

db.serialize(() => {
  // 1. Factura
  db.all("SELECT id, number, date, status, tx_id, inv_movement_id, cost_corrected, cost_corrected_at FROM invoices WHERE number LIKE '%3786%'", (err, invs) => {
    if (err) console.error("Error invoices:", err);
    else console.log("INVOICES:", JSON.stringify(invs, null, 2));

    if (invs && invs.length > 0) {
      const inv = invs[0];
      
      // 2. Líneas de factura
      db.all("SELECT * FROM invoice_lines WHERE invoice_id = ?", [inv.id], (err2, invLines) => {
        if (err2) console.error("Error invoice_lines:", err2);
        else console.log("INVOICE_LINES:", JSON.stringify(invLines, null, 2));
      });

      // 3. Movimiento de inventario
      if (inv.inv_movement_id) {
        db.all("SELECT * FROM inventory_movements WHERE id = ?", [inv.inv_movement_id], (err3, movs) => {
          if (err3) console.error("Error inventory_movements:", err3);
          else console.log("INVENTORY_MOVEMENTS:", JSON.stringify(movs, null, 2));
        });

        db.all("SELECT * FROM inventory_movement_lines WHERE movement_id = ?", [inv.inv_movement_id], (err4, movLines) => {
          if (err4) console.error("Error inventory_movement_lines:", err4);
          else console.log("INVENTORY_MOVEMENT_LINES:", JSON.stringify(movLines, null, 2));
        });
      }

      // 4. Asiento contable (tx_lines)
      if (inv.tx_id) {
        db.all("SELECT tl.id, tl.account_id, a.code as acc_code, a.name as acc_name, tl.debit, tl.credit, tl.description, tl.cross_doc_ref FROM tx_lines tl LEFT JOIN accounts a ON a.id = tl.account_id WHERE tl.tx_id = ?", [inv.tx_id], (err5, txLines) => {
          if (err5) console.error("Error tx_lines:", err5);
          else console.log("TX_LINES:", JSON.stringify(txLines, null, 2));
        });
      }
    }
  });
});
