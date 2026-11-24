const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const codeSet = new Set(accounts.map(a => a.code));

const orphans = [];
for (const a of accounts) {
  if (a.level > 1 || a.code.length > 1) {
    if (!a.parent_code || !codeSet.has(a.parent_code)) {
      orphans.push(a);
    }
  }
}

console.log(`Total cuentas: ${accounts.length}`);
console.log(`Cuentas con nivel > 1 sin padre válido: ${orphans.length}`);
console.log('\nPrimeras 25 cuentas huérfanas:');
for (const o of orphans.slice(0, 25)) {
  console.log(`Code: ${o.code} | Name: ${o.name} | Level: ${o.level} | parent_code: "${o.parent_code}"`);
}

// Veamos si esas cuentas huérfanas tienen movimientos en tx_lines:
console.log('\n--- Movimientos en tx_lines de cuentas huérfanas ---');
const orphanIds = new Set(orphans.map(o => o.id));
const txLinesWithOrphan = db.prepare(`
  SELECT a.code, a.name, a.parent_code, COUNT(l.id) as num_lines, SUM(l.debit) as deb, SUM(l.credit) as cred
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE a.id IN (${orphans.map(o => `'${o.id}'`).join(',') || "''"})
  GROUP BY a.code
`).all();
console.log(txLinesWithOrphan);
