const { DatabaseSync } = require('node:sqlite');
try {
  const d = new DatabaseSync('pb_data/auxiliary.db');
  const tables = d.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  console.log('auxiliary tables:', tables);
  if (tables.includes('inventory_lots')) {
    const l = d.prepare('SELECT * FROM inventory_lots').all();
    console.log('auxiliary inventory_lots count =', l.length);
  }
} catch(e) {
  console.log('Error opening auxiliary.db:', e.message);
}
