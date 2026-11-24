const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Revisemos las tablas existentes
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tablas:', tables.map(t => t.name).join(', '));

// Revisemos si hay transacciones el día 01 de cualquier mes
const day1Tx = db.prepare("SELECT date, COUNT(*) as cnt FROM transactions WHERE date LIKE '%-01' GROUP BY date").all();
console.log('\nTransacciones registradas en el día 01:', day1Tx);

// Probemos la comparación lexicográfica de SQLite:
const testLex1 = db.prepare("SELECT '2026-10-01' >= '2026-10-01 00:00:00' as result").get();
console.log('\n¿Es "2026-10-01" >= "2026-10-01 00:00:00" en SQLite?', testLex1.result);

const testLex2 = db.prepare("SELECT '2026-10-31' <= '2026-10-31' as result").get();
console.log('¿Es "2026-10-31" <= "2026-10-31" en SQLite?', testLex2.result);
