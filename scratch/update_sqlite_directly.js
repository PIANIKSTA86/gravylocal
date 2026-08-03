const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./pb_data/data.db');

db.serialize(() => {
  db.run("PRAGMA wal_checkpoint(FULL)", (err) => {
    if (err) console.error("Checkpoint error:", err);
    else console.log("WAL Checkpoint completed.");
  });

  db.run("UPDATE invoices SET number = 'FV-00003765' WHERE id = 'ol3jkzm97rgppfi'", function(err) {
    if (err) console.error('Invoices update error:', err);
    else console.log('✅ 1. Invoices updated to FV-00003765! Rows modified:', this.changes);
  });

  db.run("UPDATE transactions SET number = 'FV-00003765', description = REPLACE(description, 'FV-00003766', 'FV-00003765') WHERE id = 'v369f0kinpaxha7' OR number = 'FV-00003766'", function(err) {
    if (err) console.error('Transactions update error:', err);
    else console.log('✅ 2. Transactions updated to FV-00003765! Rows modified:', this.changes);
  });

  db.run("UPDATE inventory_movements SET notes = REPLACE(notes, 'FV-00003766', 'FV-00003765') WHERE id = 'w5rj4sp39vv2viz' OR notes LIKE '%FV-00003766%'", function(err) {
    if (err) console.error('Inventory_movements update error:', err);
    else console.log('✅ 3. Inventory movements updated! Rows modified:', this.changes);
  });

  db.run("UPDATE dian_resolutions SET current_number = 3765 WHERE prefix = 'FV' OR document_type = 'FV'", function(err) {
    if (err) console.error('Dian_resolutions update error:', err);
    else console.log('✅ 5. Dian_resolutions current_number set to 3765! Rows modified:', this.changes);
  });

  db.run("UPDATE transaction_types SET consecutive = 3765 WHERE prefix = 'FV' OR code = 'FV'", function(err) {
    if (err) console.error('Transaction_types update error:', err);
    else console.log('✅ 6. Transaction_types consecutive set to 3765! Rows modified:', this.changes);
  });
});
