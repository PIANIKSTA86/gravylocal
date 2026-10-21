const { DatabaseSync } = require('node:sqlite');
const d = new DatabaseSync('pb_data/data.db');
console.log('IMP-93 status:', d.prepare("SELECT id, number, status, capitalization_mov_id, capitalization_tx_id FROM imports WHERE number LIKE '%93%'").all());
console.log('import_lot_configs:', d.prepare("SELECT count(*) as c FROM import_lot_configs WHERE import_id = 'zva62hh26xjxn50'").get());
console.log('import_pallet_configs:', d.prepare("SELECT count(*) as c FROM import_pallet_configs WHERE import_id = 'zva62hh26xjxn50'").get());
console.log('stock Buenaventura:', d.prepare("SELECT p.code, s.qty_on_hand FROM inventory_stock s JOIN products p ON s.product_id=p.id WHERE s.warehouse_id='fclyvwpcomhq4gu'").all());
