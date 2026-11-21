const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== ALL TX_LINES FOR CF-202606-000018 ===');
const lines0018 = db.prepare(`SELECT tl.*, t.number as tx_num, t.date as tx_date, a.code as acc_code FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id JOIN accounts a ON a.id = tl.account_id WHERE tl.cross_doc_ref LIKE '%000018%' OR tl.description LIKE '%000018%'`).all();
console.table(lines0018);

console.log('=== ALL TX_LINES FOR CF-202607-000021 ===');
const lines0021_07 = db.prepare(`SELECT tl.*, t.number as tx_num, t.date as tx_date, a.code as acc_code FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id JOIN accounts a ON a.id = tl.account_id WHERE tl.cross_doc_ref LIKE '%CF-202607-000021%' OR tl.description LIKE '%CF-202607-000021%'`).all();
console.table(lines0021_07);

console.log('=== ALL TX_LINES FOR CF-202608-000021 ===');
const lines0021_08 = db.prepare(`SELECT tl.*, t.number as tx_num, t.date as tx_date, a.code as acc_code FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id JOIN accounts a ON a.id = tl.account_id WHERE tl.cross_doc_ref LIKE '%CF-202608-000021%' OR tl.description LIKE '%CF-202608-000021%'`).all();
console.table(lines0021_08);
