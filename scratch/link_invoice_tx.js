const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Error opening DB for write:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  console.log("=== VINCULANDO FACTURA wh6k9yrppx2la88 CON TRANSACCIÓN fmyzflvzcg3jqso ===");

  db.run(`
    UPDATE invoices
    SET 
      tx_id = 'fmyzflvzcg3jqso',
      tx_number = 'FE-00003176',
      status = 'posted',
      is_electronic = 1,
      updated = datetime('now')
    WHERE id = 'wh6k9yrppx2la88'
  `, function(err) {
    if (err) {
      console.error("Error updating invoice:", err);
      return;
    }
    console.log(`Factura actualizada. Filas modificadas: ${this.changes}`);
  });

  // Verificar el estado post-actualización
  db.get("SELECT id, number, status, is_electronic, tx_id, tx_number, total, payable_total FROM invoices WHERE id = 'wh6k9yrppx2la88'", (err, row) => {
    if (err) console.error("Error verifying:", err);
    else console.log("Factura verificada post-update:\n", JSON.stringify(row, null, 2));
  });
});
