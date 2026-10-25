const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const col = db.prepare("SELECT * FROM _collections WHERE name = 'seller_live_locations'").get();
const fields = JSON.parse(col.fields);
const statusField = fields.find(f => f.name === 'status');
if (statusField) {
  const set = new Set(statusField.values);
  set.add('EN_RUTA');
  set.add('pending');
  statusField.values = Array.from(set);
}

// Make seller_id required = false so that if mobile posts without it, our before-create hook can populate it without a 400 rejection
const sellerIdField = fields.find(f => f.name === 'seller_id');
if (sellerIdField) {
  sellerIdField.required = false;
}

db.prepare("UPDATE _collections SET fields = ? WHERE name = 'seller_live_locations'").run(JSON.stringify(fields));
console.log('seller_live_locations schema updated successfully!');
console.log('Status values:', statusField?.values);
console.log('Seller_id required:', sellerIdField?.required);
