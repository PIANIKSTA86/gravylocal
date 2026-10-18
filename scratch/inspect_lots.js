const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

function getColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
}

console.log('inventory_pallets cols:', getColumns('inventory_pallets'));
console.log('inventory_lots cols:', getColumns('inventory_lots'));

const prodId = '9ii514n3dut4hlx';

const lots = db.prepare('SELECT * FROM inventory_lots WHERE product_id = ?').all(prodId);
console.log('LOTS:', JSON.stringify(lots, null, 2));

const pallets = db.prepare('SELECT * FROM inventory_pallets WHERE product_id = ?').all(prodId);
console.log('PALLETS:', JSON.stringify(pallets, null, 2));

const movs = db.prepare(`
  SELECT m.id, m.number, m.mov_type, m.date, m.status, l.qty, l.unit_cost, l.lot_id, l.lot_number, l.pallet_id, l.pallet_code, l.boxes_qty 
  FROM inventory_movement_lines l
  JOIN inventory_movements m ON l.movement_id = m.id
  WHERE l.product_id = ?
  ORDER BY m.date, m.number
`).all(prodId);
console.log('MOVEMENTS:', JSON.stringify(movs, null, 2));

const invs = db.prepare(`
  SELECT i.id, i.number, i.date, i.status, il.qty, il.lot_id, il.lot_number, il.pallet_id, il.pallet_code, il.boxes_qty
  FROM invoice_lines il
  JOIN invoices i ON il.invoice_id = i.id
  WHERE il.product_id = ?
  ORDER BY i.date, i.number
`).all(prodId);
console.log('INVOICES:', JSON.stringify(invs, null, 2));

// Check import lines for this product
const impLines = db.prepare(`
  SELECT * FROM import_lines WHERE product_id = ?
`).all(prodId);
console.log('IMPORT LINES:', JSON.stringify(impLines, null, 2));
