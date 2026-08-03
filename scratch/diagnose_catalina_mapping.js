const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  // Buscar transacción de nómina de Catalina
  const txs = db.prepare("SELECT id, number, date, description FROM transactions WHERE description LIKE '%CATALINA%' AND number LIKE 'NM-%'").all();
  
  console.log("Transacciones NM de Catalina encontradas:", txs.length);
  txs.forEach(tx => {
    console.log("Transacción:", tx);
    const lines = db.prepare('SELECT id, account_id, third_party_id, debit, credit, description FROM tx_lines WHERE tx_id = ?').all(tx.id);
    lines.forEach(l => {
      const acc = db.prepare('SELECT code, name FROM accounts WHERE id = ?').get(l.account_id);
      const accStr = acc ? `${acc.code} - ${acc.name}` : l.account_id;
      console.log(`  [${l.debit > 0 ? 'DB' : 'CR'}] Cuenta: ${accStr} | Débito: ${l.debit} | Crédito: ${l.credit} | Desc: ${l.description}`);
    });
  });

  // Leer mappings de nómina en la colección 'settings'
  const settings = db.prepare("SELECT value FROM settings WHERE key LIKE 'nomina_config%' LIMIT 1").get();
  if (settings) {
    console.log("\nConfiguración contable de nómina (mappings):");
    const val = JSON.parse(settings.value);
    console.log(JSON.stringify(val.mappings, null, 2));
  }
}

run();
