const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const seb = db.prepare("SELECT id, name, active FROM third_parties WHERE name LIKE '%SEBASTIAN%DIAZ%'").get();
console.log('Sebastian:', seb);
if (seb) {
  const novs = db.prepare('SELECT * FROM payroll_novelties WHERE employee_id = ?').all(seb.id);
  console.log('Novelties:', novs);
  const txs = db.prepare('SELECT id, number, date, description, status FROM transactions WHERE third_party_id = ? OR description LIKE ?').all(seb.id, `%${seb.name}%`);
  console.log('Transactions:', txs);
}
