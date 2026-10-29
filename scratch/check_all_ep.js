const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare(`
  SELECT ano, mes, count(*) as count, min(consecutivo) as min_c, max(consecutivo) as max_c, prefijo 
  FROM electronic_payrolls 
  GROUP BY ano, mes, prefijo 
  ORDER BY ano ASC, mes ASC
`).all();
console.log('All electronic payroll records in pb_data/data.db:');
console.table(rows);
