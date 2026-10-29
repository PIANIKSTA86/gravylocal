const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT id, code, name, cost, useful_life_niif, initial_depreciation_niif, accumulated_depreciation_niif, initial_depreciation_fiscal, accumulated_depreciation_fiscal, last_depreciation_period, purchase_date, is_depreciable FROM niif_assets ORDER BY code", (err, rows) => {
  if (err) console.error(err);
  else {
    for (const r of rows) {
      const deprDiff = r.accumulated_depreciation_niif - r.initial_depreciation_niif;
      const expectedMonthly = Math.round(r.cost / (r.useful_life_niif || 1));
      console.log(`${r.code} | ${r.name.slice(0, 22)} | Cost: ${r.cost} | Init: ${r.initial_depreciation_niif} | Accum: ${r.accumulated_depreciation_niif} | Diff: ${deprDiff} | MoQuota: ${expectedMonthly} | PurchDate: ${r.purchase_date} | LastPeriod: ${r.last_depreciation_period}`);
    }
  }
  db.close();
});

