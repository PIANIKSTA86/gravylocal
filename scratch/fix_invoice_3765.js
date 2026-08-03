const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./pb_data/data.db');

console.log('--- EXECUTING RENUMBERING SCRIPT TO SYNC INVOICE 3765 ---');

db.serialize(() => {
  // 1. Cambiar invoices.number a FV-00003765 (ID: ol3jkzm97rgppfi)
  db.run("UPDATE invoices SET number = 'FV-00003765' WHERE id = 'ol3jkzm97rgppfi' OR number = 'FV-00003766'", function(err) {
    if (err) console.error('Error 1:', err);
    else console.log('1. Invoices actualizados a FV-00003765. Filas:', this.changes);
  });

  // 2. Asegurar que la transacción contable (ID: v369f0kinpaxha7) tenga number = 'FV-00003765'
  db.run("UPDATE transactions SET number = 'FV-00003765', description = REPLACE(description, 'FV-00003766', 'FV-00003765') WHERE id = 'v369f0kinpaxha7' OR number = 'FV-00003766'", function(err) {
    if (err) console.error('Error 2:', err);
    else console.log('2. Transactions actualizadas a FV-00003765. Filas:', this.changes);
  });

  // 3. Asegurar que el movimiento de inventario (ID: w5rj4sp39vv2viz) tenga notes = 'Venta FV-00003765'
  db.run("UPDATE inventory_movements SET notes = REPLACE(notes, 'FV-00003766', 'FV-00003765') WHERE id = 'w5rj4sp39vv2viz' OR notes LIKE '%FV-00003766%'", function(err) {
    if (err) console.error('Error 3:', err);
    else console.log('3. Inventory_movements actualizados. Filas:', this.changes);
  });

  // 4. Si existe einvoice_docs para esta transacción, actualizar number a FV-00003765
  db.run("UPDATE einvoice_docs SET number = 'FV-00003765' WHERE tx_id = 'v369f0kinpaxha7' OR number = 'FV-00003766'", function(err) {
    if (err) console.error('Error 4:', err);
    else console.log('4. Einvoice_docs actualizados a FV-00003765. Filas:', this.changes);
  });

  // 5. Ajustar resolución DIAN (prefix FV) current_number a 3765
  db.run("UPDATE dian_resolutions SET current_number = 3765 WHERE prefix = 'FV' OR document_type = 'FV'", function(err) {
    if (err) console.error('Error 5:', err);
    else console.log('5. Dian_resolutions current_number actualizado a 3765. Filas:', this.changes);
  });

  // 6. Ajustar tipo de transacción (prefix FV) consecutive a 3765
  db.run("UPDATE transaction_types SET consecutive = 3765 WHERE prefix = 'FV' OR code = 'FV'", function(err) {
    if (err) console.error('Error 6:', err);
    else console.log('6. Transaction_types consecutive actualizado a 3765. Filas:', this.changes);
  });
});
