import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== AC-202610-000003 FULL DETAILS ===');
const acTx = db.prepare("SELECT * FROM transactions WHERE number = 'AC-202610-000003'").get();
console.log(acTx);

const acLines = db.prepare(`
  SELECT tl.*, a.code as acc_code, a.name as acc_name
  FROM tx_lines tl
  LEFT JOIN accounts a ON a.id = tl.account_id
  WHERE tl.tx_id = ?
`).all(acTx.id);
console.table(acLines);
