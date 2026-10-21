const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8092', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) return console.error('DB error:', err);
});

db.serialize(() => {
  db.all('SELECT id, number, supplier_name, total FROM electronic_documents', (err, docs) => {
    if (err) return console.error('Docs error:', err);
    console.log(`Electronic Documents (${docs.length}):`);
    docs.forEach(d => {
      db.all('SELECT COUNT(*) as count FROM electronic_document_items WHERE document_id = ?', [d.id], (err2, items) => {
        db.all('SELECT COUNT(*) as count FROM electronic_document_taxes WHERE document_id = ?', [d.id], (err3, taxes) => {
          console.log(` - [${d.number}] ${d.supplier_name} ($${d.total}) -> Items: ${items?.[0]?.count || 0}, Taxes: ${taxes?.[0]?.count || 0}`);
        });
      });
    });
  });
});

setTimeout(() => db.close(), 3000);
