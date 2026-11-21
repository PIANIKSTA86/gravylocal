const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const rcNumbers = ['RC-00000049', 'RC-00000117', 'RC-00000196', 'RC-00000347', 'RC-00000569'];
const rcs = db.prepare(`SELECT number, date, description, teso_params, cross_number, cross_type, third_party_id FROM transactions WHERE number IN (${rcNumbers.map(() => '?').join(',')})`).all(...rcNumbers);

for (const r of rcs) {
  console.log('=== ' + r.number + ' ===');
  console.log('Date:', r.date);
  console.log('Description:', r.description);
  console.log('Cross Number:', r.cross_number, 'Cross Type:', r.cross_type);
  console.log('teso_params:', r.teso_params);
}
