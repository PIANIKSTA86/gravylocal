const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
console.log('Tables matching audit/lot/import:', tables.filter(t => t.includes('audit') || t.includes('lot') || t.includes('import') || t.includes('pallet')));

console.log('--- ALL LOTS IN DB ---');
const allLots = db.prepare('SELECT id, lot_number, product_id, warehouse_id, initial_qty, qty_on_hand, status, import_id, created, updated FROM inventory_lots').all();
console.log('ALL LOTS:', JSON.stringify(allLots, null, 2));

console.log('--- IMPORT LINES FOR IMP-93 ---');
const imp93Lines = db.prepare(`
  SELECT id, import_id, product_id, qty, lot_number, manufacturing_date, unit_cost_cop, total_cop
  FROM import_lines
  WHERE import_id = 'zva62hh26xjxn50'
`).all();
console.log('IMP-93 LINES:', JSON.stringify(imp93Lines, null, 2));

console.log('--- IMPORT LOT CONFIGS FOR IMP-93 ---');
if (tables.includes('import_lot_configs')) {
  const lotCfgs = db.prepare(`
    SELECT * FROM import_lot_configs WHERE import_id = 'zva62hh26xjxn50'
  `).all();
  console.log('IMP-93 LOT CONFIGS:', JSON.stringify(lotCfgs, null, 2));
}

console.log('--- IMPORT PALLET CONFIGS FOR IMP-93 ---');
if (tables.includes('import_pallet_configs')) {
  const pltCfgs = db.prepare(`
    SELECT * FROM import_pallet_configs WHERE import_id = 'zva62hh26xjxn50'
  `).all();
  console.log('IMP-93 PALLET CONFIGS:', JSON.stringify(pltCfgs, null, 2));
}
