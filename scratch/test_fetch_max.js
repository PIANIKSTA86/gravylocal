const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db', sqlite3.OPEN_READONLY);

function testMaxConsecutive(tableName, prefix, cb) {
  let sql = "";
  if (prefix) {
    sql = "SELECT number FROM " + tableName + " WHERE number LIKE '" + prefix + "-%' AND number NOT LIKE 'BORR-%'";
  } else {
    sql = "SELECT number FROM " + tableName + " WHERE number NOT LIKE 'BORR-%' AND number != ''";
  }
  db.all(sql, (err, rows) => {
    if (err) return cb(err, 0);
    let maxVal = 0;
    for (let i = 0; i < rows.length; i++) {
      const nStr = String(rows[i].number || "");
      const matches = nStr.match(/\d+/g);
      if (matches && matches.length > 0) {
        const val = parseInt(matches[matches.length - 1], 10);
        if (!isNaN(val) && val > maxVal) {
          maxVal = val;
        }
      }
    }
    cb(null, maxVal);
  });
}

console.log('=== TEST fetchMaxConsecutive ===');
const testCases = [
  { table: 'invoices', prefix: 'NC' },
  { table: 'transactions', prefix: 'NC' },
  { table: 'invoices', prefix: 'FV' },
  { table: 'transactions', prefix: 'FV' },
  { table: 'purchase_invoices', prefix: 'DSE' },
  { table: 'transactions', prefix: 'DSE' },
  { table: 'purchase_invoices', prefix: 'DS' },
  { table: 'transactions', prefix: 'DS' },
  { table: 'purchase_invoices', prefix: 'FC' },
  { table: 'transactions', prefix: 'FC' },
  { table: 'transactions', prefix: 'CG' },
  { table: 'transactions', prefix: 'RC' }
];

let pending = testCases.length;
testCases.forEach(tc => {
  testMaxConsecutive(tc.table, tc.prefix, (err, max) => {
    console.log(`${tc.table} (${tc.prefix}): max = ${max}`);
    pending--;
    if (pending === 0) db.close();
  });
});
