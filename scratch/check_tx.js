const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all('SELECT l.debit, l.credit, l.cross_doc_ref, l.description, a.code FROM tx_lines l JOIN accounts a ON a.id = l.account_id WHERE l.tx_id = "b7n2p8yyxqocnqb"', (e, r) => console.log('b7n2p8yyxqocnqb:', r));
db.all('SELECT l.debit, l.credit, l.cross_doc_ref, l.description, a.code FROM tx_lines l JOIN accounts a ON a.id = l.account_id WHERE l.tx_id = "zsjz6u7ri4o4ukp"', (e, r) => console.log('zsjz6u7ri4o4ukp:', r));
