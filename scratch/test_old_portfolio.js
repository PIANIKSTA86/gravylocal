const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbs = ['pb_data/data.db'];
if (fs.existsSync('empresas/empresa_8094/pb_data/data.db')) {
  dbs.push('empresas/empresa_8094/pb_data/data.db');
}

for (const p of dbs) {
  console.log('=== DB:', p);
  const db = new DatabaseSync(p, { open: true, readOnly: true });

  const sql = `
    SELECT
      a.code AS account_code,
      a.name AS account_name,
      a.maneja_cruce AS account_maneja_cruce,
      a.requires_third_party,
      l.cross_doc_ref,
      COALESCE(tp.name, 'Sin tercero') AS third_party_name
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND a.code LIKE '13%'
  `;

  const rows = db.prepare(sql).all();
  console.log('Total tx_lines in 13%:', rows.length);

  let oldIncluded = 0;
  const oldByAcc = {};
  for (const r of rows) {
    const manejaCruce = r.account_maneja_cruce === 1 || r.account_maneja_cruce === true || r.account_maneja_cruce === '1';
    const refRaw = String(r.cross_doc_ref || '').trim();
    if (!manejaCruce && !refRaw) continue;
    oldIncluded++;
    oldByAcc[r.account_code] = (oldByAcc[r.account_code] || 0) + 1;
  }

  console.log('Old logic included lines:', oldIncluded);
  for (const [code, count] of Object.entries(oldByAcc).sort()) {
    console.log(`  ${code.padEnd(12)}: ${count} lines`);
  }

  db.close();
}
