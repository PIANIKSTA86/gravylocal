const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const rcNumbers = ['RC-00000049', 'RC-00000051', 'RC-00000117', 'RC-00000196', 'RC-00000347', 'RC-00000569'];
const txs = db.prepare(`SELECT id, number, date, description, teso_mode, teso_params FROM transactions WHERE number IN (${rcNumbers.map(() => '?').join(',')}) ORDER BY date`).all(...rcNumbers);

for (const t of txs) {
  console.log(`\n=== ${t.number} === (date: ${t.date})`);
  console.log(`Desc: ${t.description}`);
  console.log(`Mode: ${t.teso_mode}`);
  console.log(`Params: ${t.teso_params}`);
}
