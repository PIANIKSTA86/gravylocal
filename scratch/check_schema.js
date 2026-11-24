const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cols = db.prepare("PRAGMA table_info(accounts)").all();
console.log('Columnas de accounts:', cols.map(c => c.name));

// Revisar si existen las cuentas 620535, 622535, 519521 o similares ahora:
const checkAccounts = db.prepare(`
  SELECT id, code, name, parent_code, level 
  FROM accounts 
  WHERE code IN ('620535', '622535', '519521', '236701', '423580', '47')
     OR code LIKE '620535%'
     OR code LIKE '519521%'
`).all();
console.log('\nCuentas consultadas:', checkAccounts);

// Total de cuentas actual
const totalAcc = db.prepare("SELECT COUNT(*) as cnt FROM accounts").get();
console.log('Total de cuentas:', totalAcc.cnt);

// Total de transacciones actual
const totalTx = db.prepare("SELECT COUNT(*) as cnt FROM transactions").get();
console.log('Total de transacciones:', totalTx.cnt);

// Total de líneas actuales
const totalLines = db.prepare("SELECT COUNT(*) as cnt FROM tx_lines").get();
console.log('Total de líneas:', totalLines.cnt);
