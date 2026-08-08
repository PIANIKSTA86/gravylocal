const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function inspectDb(companyDir) {
  const dbPath = path.resolve(__dirname, '..', 'empresas', companyDir, 'pb_data', 'data.db');
  if (!require('fs').existsSync(dbPath)) {
    console.log(`\n=== Company database for ${companyDir} does not exist at ${dbPath} ===`);
    return;
  }
  console.log(`\n==================================================`);
  console.log(`INSPECTING COMPANY: ${companyDir}`);
  console.log(`==================================================`);
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  
  const query = (sql) => new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables.map(t => t.name);

    if (tableNames.includes('settings')) {
      const settingsData = await query("SELECT * FROM settings WHERE key IN ('company_name', 'company_nit', 'company_email')");
      console.log("Settings keys found:");
      settingsData.forEach(r => console.log(`  - ${r.key}: ${r.value}`));
    }

    const collectionsToCheck = [
      'branches',
      'transactions',
      'tx_lines',
      'invoices',
      'purchase_invoices',
      'pos_shifts',
      'pos_registers',
      'inmo_properties',
      'inmo_contracts',
      'inmo_invoices',
      'third_parties',
      'users'
    ];

    console.log("\nCounts:");
    for (const col of collectionsToCheck) {
      if (tableNames.includes(col)) {
        const countRes = await query(`SELECT COUNT(*) as count FROM ${col}`);
        console.log(`  - ${col}: ${countRes[0].count}`);
      } else {
        console.log(`  - ${col}: (N/A)`);
      }
    }
  } catch (err) {
    console.error(`Error inspecting ${companyDir}:`, err);
  } finally {
    db.close();
  }
}

async function main() {
  const dbPath = path.resolve(__dirname, '..', 'empresas', 'empresa_8093', 'pb_data', 'data.db');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  const query = (sql) => new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const settings = await query("SELECT * FROM settings");
    console.log("=== SETTINGS ===");
    console.log(settings);

    const users = await query("SELECT * FROM users");
    console.log("=== USERS ===");
    console.log(users);

    const branches = await query("SELECT * FROM branches");
    console.log("=== BRANCHES ===");
    console.log(branches);

  } catch(err) {
    console.error(err);
  } finally {
    db.close();
  }
}


main();
