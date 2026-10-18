const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const allLots = db.prepare(`
  SELECT l.id, l.lot_number, p.code, p.name, p.track_lots, p.track_pallets, l.warehouse_id, l.initial_qty, l.qty_on_hand, l.status, l.created, l.updated 
  FROM inventory_lots l
  LEFT JOIN products p ON l.product_id = p.id
`).all();
console.log('ALL LOTS (count = ' + allLots.length + '):');
for (const l of allLots) {
  console.log(`${l.code} | Lot: ${l.lot_number} | Init: ${l.initial_qty} | QtyOnHand: ${l.qty_on_hand} | TrackLots: ${l.track_lots} | TrackPallets: ${l.track_pallets} | Status: ${l.status} | Created: ${l.created} | Updated: ${l.updated}`);
}
