const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const prodIds = db.prepare(`
  SELECT DISTINCT product_id FROM import_lines WHERE import_id = 'zva62hh26xjxn50'
  UNION
  SELECT DISTINCT product_id FROM import_lot_configs WHERE import_id = 'zva62hh26xjxn50'
  UNION
  SELECT DISTINCT product_id FROM import_pallet_configs WHERE import_id = 'zva62hh26xjxn50'
`).all().map(r => r.product_id);

console.log('Actualizando flags track_lots y track_pallets en productos de IMP-93:', prodIds);
const upd = db.prepare('UPDATE products SET track_lots = 1, track_pallets = 1 WHERE id = ?');
for (const pid of prodIds) {
  upd.run(pid);
  const p = db.prepare('SELECT code, name, track_lots, track_pallets FROM products WHERE id = ?').get(pid);
  console.log(`  - [${p.code}] ${p.name}: track_lots=${p.track_lots}, track_pallets=${p.track_pallets}`);
}
