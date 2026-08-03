const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const sql = `
  SELECT l.*, a.code as account_code, a.name as account_name
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id IN ('00ias4iuuk7skr9', 'vuls64lnn3u3owk')
`;

db.all(sql, (err, rows) => {
  console.log("Lines for July 2026 RC transactions:", rows);
});
