const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function checkAllInvoices() {
  const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  console.log('=== LATEST 10 INVOICES AND THEIR ELECTRONIC STATUS ===');
  const rows = db.prepare(`
    SELECT 
      i.id as inv_id, 
      i.number as inv_number, 
      i.status as inv_status, 
      i.tx_id, 
      t.number as tx_number, 
      tt.code as type_code,
      ed.id as doc_id,
      ed.status as doc_status,
      ed.dian_response,
      ed.sent_at
    FROM invoices i
    LEFT JOIN transactions t ON i.tx_id = t.id
    LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
    LEFT JOIN einvoice_docs ed ON ed.tx_id = t.id
    ORDER BY i.created DESC LIMIT 10
  `).all();

  console.table(rows);
}

checkAllInvoices();
