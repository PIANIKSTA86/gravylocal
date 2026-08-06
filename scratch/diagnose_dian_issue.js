const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log('=== DIAN RESOLUTIONS ===');
    console.table(db.prepare('SELECT id, document_type, prefix, current_number, number_from, number_to, active FROM dian_resolutions').all());

    console.log('=== RECENT TRANSACTIONS (LAST 10) ===');
    const txs = db.prepare('SELECT t.id, t.number, t.date, tt.code as type_code, tt.prefix, t.third_party_id FROM transactions t LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id ORDER BY t.id DESC LIMIT 10').all();
    console.table(txs);

    console.log('=== EINVOICE DOCS FOR RECENT TRANSACTIONS ===');
    if (txs.length > 0) {
      const txIds = txs.map(t => `'${t.id}'`).join(',');
      const docs = db.prepare(`SELECT id, tx_id, status, dian_response, sent_at FROM einvoice_docs WHERE tx_id IN (${txIds})`).all();
      console.table(docs);
    }

    console.log('=== SETTINGS DIAN / COMPANY ===');
    const settings = db.prepare("SELECT key, value FROM settings WHERE key LIKE '%dian%' OR key LIKE '%einvoice%' OR key LIKE '%company%' OR key LIKE '%ftech%'").all();
    settings.forEach(s => {
      console.log(`  ${s.key}: ${s.value ? s.value.slice(0, 60) : '[VACIO]'}`);
    });

  } catch (err) {
    console.error('Diagnostic error:', err);
  }
}

run();
