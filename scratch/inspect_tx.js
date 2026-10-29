const sqlite3 = require('./scratch/node_modules/sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.get("SELECT id, number, date, status, cross_type, cross_number, cross_enabled FROM transactions WHERE number = 'FV-00003905'", (err, tx) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('TX:', JSON.stringify(tx, null, 2));
  if (tx) {
    db.all("SELECT id, tx_id, account_id, debit, credit, cross_doc_ref, cross_doc_date, due_date FROM tx_lines WHERE tx_id = ?", [tx.id], (err2, lines) => {
      console.log('Lines count:', lines ? lines.length : 0);
      if (lines) {
        lines.forEach(l => {
          console.log('Line:', JSON.stringify(l));
          db.get("SELECT code, name, maneja_cruce FROM accounts WHERE id = ?", [l.account_id], (err3, acc) => {
            console.log('  Account for', l.account_id, ':', JSON.stringify(acc));
          });
        });
      }
    });
    db.all("SELECT id, action, details, event_at FROM audit_log WHERE entity_id = ? ORDER BY event_at DESC LIMIT 5", [tx.id], (err4, logs) => {
      console.log('AUDIT LOGS:', JSON.stringify(logs, null, 2));
    });
  }
});

