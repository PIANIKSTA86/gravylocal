const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db', { open: true, readOnly: true });

// Test 1: Selected account = '11050502'
const selectedAccountCodes = ['11050502'];
const placeholders = selectedAccountCodes.map((_, i) => `$acc_${i}`).join(',');
const sql = `
  SELECT
    l.id,
    l.debit,
    l.credit,
    l.cross_doc_ref,
    a.code as account_code,
    a.name as account_name,
    COALESCE(tp.name, 'Sin tercero') as third_party_name
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  WHERE t.status = 'active'
    AND (a.code IN (${placeholders}) OR a.id IN (${placeholders}))
`;

const stmt = db.prepare(sql);
const params = {};
selectedAccountCodes.forEach((val, i) => {
  params[`acc_${i}`] = val;
});
const rows = stmt.all(params);
console.log(`Querying account '11050502': found ${rows.length} rows`);
console.log('Sample rows:', rows.slice(0, 5));

// Test 2: Selected account = '11050502' and '13050501'
const multipleCodes = ['11050502', '13050501'];
const placeholders2 = multipleCodes.map((_, i) => `$acc_${i}`).join(',');
const sql2 = `
  SELECT
    a.code as account_code,
    count(*) as count,
    sum(l.debit) as deb,
    sum(l.credit) as cred
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active'
    AND (a.code IN (${placeholders2}) OR a.id IN (${placeholders2}))
  GROUP BY a.code
`;
const stmt2 = db.prepare(sql2);
const params2 = {};
multipleCodes.forEach((val, i) => {
  params2[`acc_${i}`] = val;
});
console.log('Querying multiple accounts:', stmt2.all(params2));

db.close();

