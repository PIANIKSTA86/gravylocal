const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// List of docs for employees
const docs = [
  '29700430', // Amparo
  '1112475477', // Angela
  '29682675', // Angelica
  '94551654', // Bladimir
  '1075538190', // Cielo
  '1007173844', // Cristian
  '94488015', // Juan Andres
  '1113642135', // Catalina
  '29544232' // Yolanda
];

// Check all text in all tables for dates like YYYY-MM-DD associated with these cédulas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name).filter(t => !t.startsWith('_'));

tables.forEach(t => {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
  docs.forEach(doc => {
    try {
      const match = db.prepare(`SELECT * FROM ${t} WHERE ` + cols.map(c => `${c} LIKE '%${doc}%'`).join(' OR ') + ` LIMIT 5`).all();
      if (match.length > 0 && t !== 'third_parties' && t !== 'electronic_payrolls' && t !== 'audit_log') {
        console.log(`Doc ${doc} found in table ${t}:`, match);
      }
    } catch(e) {}
  });
});

