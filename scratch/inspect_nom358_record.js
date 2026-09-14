const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
const db = new Database(dbPath, { readonly: true });

const row = db.prepare("SELECT id, consecutivo, prefijo, estado_dian, dian_response, ftech_transaction_id, cufe FROM electronic_payrolls WHERE consecutivo = 358 OR consecutivo = '358'").get();
console.log("NOM-358 Record:", row);
