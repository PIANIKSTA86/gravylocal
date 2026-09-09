const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db', sqlite3.OPEN_READONLY);

console.log('=== MAX TRANSACTIONS FOR CE, CG, EF, RC, FV, NC ===');

const prefixes = ['CE', 'CG', 'EF', 'RC', 'FV', 'FE', 'NC', 'ND', 'DS', 'DSE', 'FC'];

prefixes.forEach(p => {
  db.get(`SELECT number FROM transactions WHERE number LIKE '${p}-%' ORDER BY length(number) DESC, number DESC LIMIT 1`, (err, row) => {
    if (err) console.error(p, err);
    console.log(`Prefix ${p} in transactions:`, row ? row.number : 'NONE');
  });
});

setTimeout(() => {
  db.close();
}, 2000);
