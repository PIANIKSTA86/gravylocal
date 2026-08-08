const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  try {
    const txTypes = await query("SELECT id, code, name, prefix FROM transaction_types");
    console.log("=== Transaction Types ===");
    txTypes.forEach(t => console.log(`  - ${t.code} [ID: ${t.id}]: ${t.name} (Prefix: ${t.prefix})`));
    
    const branches = await query("SELECT id, code, name FROM branches");
    console.log("\n=== Branches ===");
    branches.forEach(b => console.log(`  - ${b.code} [ID: ${b.id}]: ${b.name}`));
    
    const users = await query("SELECT id, email, name FROM users");
    console.log("\n=== Users ===");
    users.forEach(u => console.log(`  - ${u.email} [ID: ${u.id}]: ${u.name}`));
    
    const warehouses = await query("SELECT id, name, branch_id FROM warehouses");
    console.log("\n=== Warehouses ===");
    warehouses.forEach(w => console.log(`  - ${w.name} [ID: ${w.id}] branch_id: ${w.branch_id}`));
    
    const products = await query("SELECT id, name, code, active FROM products");
    console.log("\n=== Products ===");
    products.forEach(p => console.log(`  - ${p.code} [ID: ${p.id}]: ${p.name} (active: ${p.active})`));
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
}

main();
