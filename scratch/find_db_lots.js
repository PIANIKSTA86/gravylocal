const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function findDbs(dir) {
  let results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !full.includes('node_modules') && !full.includes('.git')) {
      results = results.concat(findDbs(full));
    } else if (item.isFile() && item.name.endsWith('.db')) {
      results.push(full);
    }
  }
  return results;
}

const dbs = findDbs('.');
for (const dbPath of dbs) {
  try {
    const d = new DatabaseSync(dbPath);
    const tables = d.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    if (tables.includes('products')) {
      const p = d.prepare("SELECT code, name FROM products WHERE code LIKE '%1C1251A2%'").all();
      if (p.length) {
        console.log(`FOUND PRODUCT in ${dbPath}:`, p);
        if (tables.includes('inventory_lots')) {
          const l = d.prepare("SELECT * FROM inventory_lots").all();
          console.log(`  inventory_lots in ${dbPath}: count =`, l.length);
        }
      }
    }
  } catch (e) {
    // console.log('Err in', dbPath, e.message);
  }
}
