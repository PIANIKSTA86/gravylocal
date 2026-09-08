const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

async function run() {
  const getCollection = (name) => new Promise((resolve, reject) => {
    db.get("SELECT * FROM _collections WHERE name = ?", [name], (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });

  const updateCollection = (id, fieldsJson) => new Promise((resolve, reject) => {
    db.run("UPDATE _collections SET fields = ? WHERE id = ?", [fieldsJson, id], (err) => {
      if (err) reject(err); else resolve();
    });
  });

  const runSql = (sql) => new Promise((resolve) => {
    db.run(sql, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.warn('SQL Warning:', err.message);
      }
      resolve();
    });
  });

  const lotsCol = await getCollection('inventory_lots');
  const palletsCol = await getCollection('inventory_pallets');
  const lotsId = lotsCol ? lotsCol.id : '';
  const palletsId = palletsCol ? palletsCol.id : '';

  console.log('Lots Collection ID:', lotsId);
  console.log('Pallets Collection ID:', palletsId);

  // 1. PRODUCTS
  const prodCol = await getCollection('products');
  if (prodCol) {
    const fields = JSON.parse(prodCol.fields);
    let changed = false;
    if (!fields.find(f => f.name === 'track_lots')) {
      fields.push({ name: 'track_lots', type: 'bool', required: false, system: false });
      await runSql("ALTER TABLE products ADD COLUMN track_lots BOOLEAN DEFAULT 0");
      changed = true;
    }
    if (!fields.find(f => f.name === 'track_pallets')) {
      fields.push({ name: 'track_pallets', type: 'bool', required: false, system: false });
      await runSql("ALTER TABLE products ADD COLUMN track_pallets BOOLEAN DEFAULT 0");
      changed = true;
    }
    if (changed) {
      await updateCollection(prodCol.id, JSON.stringify(fields));
      console.log('PRODUCTS: track_lots and track_pallets added successfully');
    }
  }

  // 2. INVOICE_LINES
  const invLinesCol = await getCollection('invoice_lines');
  if (invLinesCol) {
    const fields = JSON.parse(invLinesCol.fields);
    let changed = false;
    if (!fields.find(f => f.name === 'lot_id')) {
      fields.push({ name: 'lot_id', type: 'relation', required: false, system: false, maxSelect: 1, collectionId: lotsId, cascadeDelete: false });
      await runSql("ALTER TABLE invoice_lines ADD COLUMN lot_id TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'lot_number')) {
      fields.push({ name: 'lot_number', type: 'text', required: false, system: false });
      await runSql("ALTER TABLE invoice_lines ADD COLUMN lot_number TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'pallet_id')) {
      fields.push({ name: 'pallet_id', type: 'relation', required: false, system: false, maxSelect: 1, collectionId: palletsId, cascadeDelete: false });
      await runSql("ALTER TABLE invoice_lines ADD COLUMN pallet_id TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'pallet_code')) {
      fields.push({ name: 'pallet_code', type: 'text', required: false, system: false });
      await runSql("ALTER TABLE invoice_lines ADD COLUMN pallet_code TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'boxes_qty')) {
      fields.push({ name: 'boxes_qty', type: 'number', required: false, system: false, min: 0 });
      await runSql("ALTER TABLE invoice_lines ADD COLUMN boxes_qty REAL DEFAULT 0");
      changed = true;
    }
    if (changed) {
      await updateCollection(invLinesCol.id, JSON.stringify(fields));
      console.log('INVOICE_LINES: lot and pallet fields added successfully');
    }
  }

  // 3. INVENTORY_MOVEMENT_LINES
  const movLinesCol = await getCollection('inventory_movement_lines');
  if (movLinesCol) {
    const fields = JSON.parse(movLinesCol.fields);
    let changed = false;
    if (!fields.find(f => f.name === 'lot_id')) {
      fields.push({ name: 'lot_id', type: 'relation', required: false, system: false, maxSelect: 1, collectionId: lotsId, cascadeDelete: false });
      await runSql("ALTER TABLE inventory_movement_lines ADD COLUMN lot_id TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'lot_number')) {
      fields.push({ name: 'lot_number', type: 'text', required: false, system: false });
      await runSql("ALTER TABLE inventory_movement_lines ADD COLUMN lot_number TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'pallet_id')) {
      fields.push({ name: 'pallet_id', type: 'relation', required: false, system: false, maxSelect: 1, collectionId: palletsId, cascadeDelete: false });
      await runSql("ALTER TABLE inventory_movement_lines ADD COLUMN pallet_id TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'pallet_code')) {
      fields.push({ name: 'pallet_code', type: 'text', required: false, system: false });
      await runSql("ALTER TABLE inventory_movement_lines ADD COLUMN pallet_code TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'boxes_qty')) {
      fields.push({ name: 'boxes_qty', type: 'number', required: false, system: false, min: 0 });
      await runSql("ALTER TABLE inventory_movement_lines ADD COLUMN boxes_qty REAL DEFAULT 0");
      changed = true;
    }
    if (changed) {
      await updateCollection(movLinesCol.id, JSON.stringify(fields));
      console.log('INVENTORY_MOVEMENT_LINES: lot and pallet fields added successfully');
    }
  }

  // 4. LOGISTICA_DELIVERY_LINES
  const delLinesCol = await getCollection('logistica_delivery_lines');
  if (delLinesCol) {
    const fields = JSON.parse(delLinesCol.fields);
    let changed = false;
    if (!fields.find(f => f.name === 'lot_id')) {
      fields.push({ name: 'lot_id', type: 'relation', required: false, system: false, maxSelect: 1, collectionId: lotsId, cascadeDelete: false });
      await runSql("ALTER TABLE logistica_delivery_lines ADD COLUMN lot_id TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'pallet_id')) {
      fields.push({ name: 'pallet_id', type: 'relation', required: false, system: false, maxSelect: 1, collectionId: palletsId, cascadeDelete: false });
      await runSql("ALTER TABLE logistica_delivery_lines ADD COLUMN pallet_id TEXT DEFAULT ''");
      changed = true;
    }
    if (!fields.find(f => f.name === 'boxes_qty')) {
      fields.push({ name: 'boxes_qty', type: 'number', required: false, system: false, min: 0 });
      await runSql("ALTER TABLE logistica_delivery_lines ADD COLUMN boxes_qty REAL DEFAULT 0");
      changed = true;
    }
    if (changed) {
      await updateCollection(delLinesCol.id, JSON.stringify(fields));
      console.log('LOGISTICA_DELIVERY_LINES: lot and pallet fields added successfully');
    }
  }

  db.close();
  console.log('Done!');
}

run().catch(console.error);
