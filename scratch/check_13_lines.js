const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const dbs = ['pb_data/data.db'];
if (fs.existsSync('empresas/empresa_8094/pb_data/data.db')) dbs.push('empresas/empresa_8094/pb_data/data.db');

for (const p of dbs) {
  console.log('=== DB:', p);
  const db = new DatabaseSync(p, { open: true, readOnly: true });
  const q = db.prepare(`
    SELECT a.code, a.name, a.maneja_cruce, a.requires_third_party, count(*) as cnt, sum(l.debit) as deb, sum(l.credit) as cred
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active' AND a.code LIKE '13%' AND NOT (a.code LIKE '1305%')
    GROUP BY a.code
  `).all();
  console.log('Active lines in 13% outside 1305%:');
  q.forEach(r => console.log(r.code, '| 3rd:', r.requires_third_party, '| cruce:', r.maneja_cruce, '| cnt:', r.cnt, '| deb:', r.deb, '| cred:', r.cred, '|', r.name));

  // Also check which third parties are appearing in these non-1305 accounts
  const thirds = db.prepare(`
    SELECT DISTINCT a.code, COALESCE(tp.name, 'Sin tercero') as tp_name, tp.doc_number
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active' AND a.code LIKE '13%' AND NOT (a.code LIKE '1305%')
    LIMIT 20
  `).all();
  console.log('Sample third parties in 13% outside 1305%:');
  thirds.forEach(t => console.log(t.code, '|', t.doc_number, '|', t.tp_name));

  db.close();
}

