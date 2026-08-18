const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath);

console.log("=== INSPECCIÓN DE TODOS LOS MOVIMIENTOS Y SUS LÍNEAS ===");

db.serialize(() => {
  db.all("SELECT id, number, date, mov_type, notes, status, total_qty, total_cost, tx_id FROM inventory_movements WHERE notes LIKE '%3786%' OR number LIKE '%3786%' OR number = 'SAL-202608-0003'", (err, rows) => {
    if (err) console.error("Error:", err);
    else console.log("MOVEMENTS:", JSON.stringify(rows, null, 2));

    if (rows && rows.length > 0) {
      const ids = rows.map(r => r.id);
      db.all(`SELECT * FROM inventory_movement_lines WHERE movement_id IN ('${ids.join("','")}')`, (err2, lines) => {
        if (err2) console.error("Error lines:", err2);
        else console.log("LINES:", JSON.stringify(lines, null, 2));
      });
    }
  });

  // Ver productos
  db.all("SELECT id, code, name, cost_price, inventory_account_id, cost_account_id FROM products WHERE id IN ('2ixc0ekphgehnab', 'vqqc8iezkrfbuvd')", (err, prods) => {
    if (err) console.error("Error prods:", err);
    else console.log("PRODUCTS:", JSON.stringify(prods, null, 2));
  });
});
