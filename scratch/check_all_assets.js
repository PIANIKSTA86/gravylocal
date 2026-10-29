const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT code, name, cost, useful_life_niif, initial_depreciation_niif, accumulated_depreciation_niif, initial_depreciation_fiscal, accumulated_depreciation_fiscal, last_depreciation_period, purchase_date, is_depreciable, is_immediate_depreciation FROM niif_assets ORDER BY code", (err, rows) => {
  if (err) console.error(err);
  else {
    console.table(rows);
    let totalCost = 0;
    let totalInit = 0;
    let totalAccum = 0;
    for (const r of rows) {
      totalCost += Number(r.cost) || 0;
      totalInit += Number(r.initial_depreciation_niif) || 0;
      totalAccum += Number(r.accumulated_depreciation_niif) || 0;
    }
    console.log(`TOTALS: Cost=${totalCost}, InitNIIF=${totalInit}, AccumNIIF=${totalAccum}, Diff=${totalAccum - totalInit}`);
  }
  db.close();
});

