const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM _collections WHERE name = 'products'", (err, row) => {
  if (row) {
    const fields = row.fields ? JSON.parse(row.fields) : JSON.parse(row.schema);
    console.log("Products consignment fields:");
    console.log(" - is_consigned:", fields.find(f => f.name === 'is_consigned') ? "OK" : "MISSING");
    console.log(" - consignment_supplier_id:", fields.find(f => f.name === 'consignment_supplier_id') ? "OK" : "MISSING");
    console.log(" - consignment_cost:", fields.find(f => f.name === 'consignment_cost') ? "OK" : "MISSING");
  }
  
  db.get("SELECT * FROM _collections WHERE name = 'warehouses'", (err, row) => {
    if (row) {
      const fields = row.fields ? JSON.parse(row.fields) : JSON.parse(row.schema);
      console.log("\nWarehouses consignment fields:");
      console.log(" - is_consignment:", fields.find(f => f.name === 'is_consignment') ? "OK" : "MISSING");
      console.log(" - consignment_type:", fields.find(f => f.name === 'consignment_type') ? "OK" : "MISSING");
      console.log(" - linked_third_party_id:", fields.find(f => f.name === 'linked_third_party_id') ? "OK" : "MISSING");
    }
    db.close();
  });
});
