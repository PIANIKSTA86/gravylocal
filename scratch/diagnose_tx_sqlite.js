const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  console.log("Abriendo base de datos SQLite en:", dbPath);
  const db = new DatabaseSync(dbPath);

  // Buscar transacción de nómina
  const txQuery = db.prepare('SELECT id, number, date, description FROM transactions WHERE description LIKE ? OR description LIKE ?');
  const txs = txQuery.all('%Julio 2026%', '%CATALINA%');
  
  console.log("Transacciones de nómina encontradas:");
  txs.forEach(tx => {
    console.log(JSON.stringify(tx, null, 2));
    
    // Buscar líneas de esta transacción
    const linesQuery = db.prepare('SELECT id, account_id, third_party_id, debit, credit, description FROM tx_lines WHERE tx_id = ?');
    const lines = linesQuery.all(tx.id);
    console.log(`Líneas de la transacción ${tx.number}:`);
    lines.forEach(l => {
      // Buscar código de la cuenta
      const acc = db.prepare('SELECT code, name FROM accounts WHERE id = ?').get(l.account_id);
      const accStr = acc ? `${acc.code} - ${acc.name}` : l.account_id;
      // Buscar nombre del tercero
      const third = l.third_party_id ? db.prepare('SELECT name FROM third_parties WHERE id = ?').get(l.third_party_id) : null;
      const thirdStr = third ? third.name : '—';
      console.log(`  Cuenta: ${accStr} | Tercero: ${thirdStr} | Débito: ${l.debit} | Crédito: ${l.credit} | Desc: ${l.description}`);
    });
  });
}

run();
