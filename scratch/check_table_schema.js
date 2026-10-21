const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8092', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("PRAGMA table_info('electronic_document_items')", (err, cols) => {
  console.log('Columns of electronic_document_items:', cols);
});

db.all("PRAGMA table_info('electronic_document_taxes')", (err, cols) => {
  console.log('Columns of electronic_document_taxes:', cols);
});

setTimeout(() => db.close(), 1000);
