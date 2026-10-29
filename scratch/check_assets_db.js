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
  console.log('=== NIIF ASSETS ===');
  const assets = await query('SELECT id, code, name, cost, useful_life_niif, useful_life_fiscal, residual_value, initial_depreciation_niif, accumulated_depreciation_niif, initial_depreciation_fiscal, accumulated_depreciation_fiscal, last_depreciation_period, purchase_date, start_service_date, is_immediate_depreciation, is_depreciable, status FROM niif_assets');
  console.log('Total assets:', assets.length);
  console.table(assets.map(a => ({
    code: a.code,
    name: a.name.slice(0, 22),
    cost: a.cost,
    accumNIIF: a.accumulated_depreciation_niif,
    initNIIF: a.initial_depreciation_niif,
    lastPeriod: a.last_depreciation_period,
    purchDate: a.purchase_date,
    lifeNIIF: a.useful_life_niif,
    isDepr: a.is_depreciable,
    isImm: a.is_immediate_depreciation
  })));

  console.log('\n=== NIIF ASSET EVENTS ===');
  const events = await query('SELECT * FROM niif_asset_events');
  console.log('Total events:', events.length);
  if (events.length > 0) console.table(events);

  console.log('\n=== DEPRECIATION TRANSACTIONS ===');
  const txs = await query("SELECT id, number, date, description, cross_type, cross_number, status, book_type FROM transactions WHERE cross_type LIKE '%DEPRE%' OR description LIKE '%depreciaci%' OR description LIKE '%Depreciaci%'");
  console.log('Total depr txs:', txs.length);
  if (txs.length > 0) console.table(txs);

  console.log('\n=== ALL TRANSACTIONS COUNT ===');
  const allTxs = await query('SELECT count(*) as c FROM transactions');
  console.log('Total transactions in DB:', allTxs[0].c);

  db.close();
}

main().catch(console.error);
