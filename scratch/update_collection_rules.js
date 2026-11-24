const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const authRuleWrite = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
const authRuleDelete = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";

const targetCollections = [
  'niif_assets',
  'niif_asset_categories',
  'niif_asset_events',
  'niif_asset_inventories',
  'niif_settings',
  'niif_policies',
  'niif_leases'
];

function findDbs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'Landing' && file !== '.agents') {
        results = results.concat(findDbs(full));
      }
    } else if (file === 'data.db') {
      results.push(full);
    }
  }
  return results;
}

const dbs = findDbs('.');
console.log('Found data.db files:', dbs);

for (const dbPath of dbs) {
  try {
    const db = new DatabaseSync(dbPath);
    const tblExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_collections'").get();
    if (!tblExists) {
      db.close();
      continue;
    }

    for (const colName of targetCollections) {
      const row = db.prepare('SELECT id, name, createRule, updateRule, deleteRule FROM _collections WHERE name = ?').get(colName);
      if (row) {
        db.prepare('UPDATE _collections SET createRule = ?, updateRule = ?, deleteRule = ? WHERE name = ?')
          .run(authRuleWrite, authRuleWrite, authRuleDelete, colName);
        console.log(`[${dbPath}] Updated ${colName}`);
      }
    }
    db.close();
  } catch (err) {
    console.error(`Error processing ${dbPath}:`, err.message);
  }
}
console.log('Finished updating collections rules.');
