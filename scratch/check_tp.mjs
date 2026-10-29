import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });
const r = db.prepare("SELECT sum(tl.debit) as debits, sum(tl.credit) as credits FROM tx_lines tl JOIN accounts a ON a.id = tl.account_id WHERE a.code = '13459501' AND tl.third_party_id = 'ym1tlg8onrs0mp6'").get();
console.log('Debits:', r.debits, 'Credits:', r.credits, 'Saldo:', r.debits - r.credits);
