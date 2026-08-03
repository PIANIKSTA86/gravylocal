const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./pb_data/data.db');

const collectionsToUpdate = [
  'invoices',
  'invoice_lines',
  'transactions',
  'tx_lines',
  'inventory_movements',
  'inventory_movement_lines',
  'inventory_stock',
  'sales_orders',
  'sales_order_lines',
  'dian_resolutions',
  'transaction_types'
];

console.log('--- UPDATING API RULES FOR ALL INVOICING COLLECTIONS ---');

db.serialize(() => {
  for (const name of collectionsToUpdate) {
    db.run(
      "UPDATE _collections SET createRule = \"@request.auth.id != ''\", updateRule = \"@request.auth.id != ''\" WHERE name = ?",
      [name],
      function(err) {
        if (err) console.error('Error updating ' + name + ':', err);
        else console.log('✅ Updated create/update rules for ' + name + ' to allow any authenticated user. Rows:', this.changes);
      }
    );
  }
});
