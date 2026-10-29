const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  const tables = await query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('Tables:', tables.map(t => t.name).join(', '));
  
  // Check if there are any transactions with depr in any field
  const deprSearch = await query("SELECT id, number, date, description, cross_type, cross_number, status, book_type FROM transactions WHERE LOWER(description) LIKE '%depre%' OR LOWER(cross_type) LIKE '%depre%'");
  console.log('Depr search across all transactions:', deprSearch);

  // Check niif_asset_categories
  const cats = await query("SELECT * FROM niif_asset_categories");
  console.log('\nCategories:');
  console.table(cats.map(c => ({ id: c.id, code: c.code, name: c.name, expense: c.account_depr_expense_id, accum: c.account_depr_accum_id })));

  db.close();
}

main().catch(console.error);

