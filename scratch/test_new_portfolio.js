const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbs = ['pb_data/data.db'];
if (fs.existsSync('empresas/empresa_8094/pb_data/data.db')) {
  dbs.push('empresas/empresa_8094/pb_data/data.db');
}

for (const p of dbs) {
  console.log('=== DB:', p);
  const db = new DatabaseSync(p, { open: true, readOnly: true });

  // Test CxC query with new rule:
  // Account must be 1305% OR (code LIKE 13% AND requires_third_party = 1 AND maneja_cruce = 1)
  const sqlNew = `
    SELECT
      a.code AS account_code,
      a.name AS account_name,
      a.maneja_cruce AS account_maneja_cruce,
      a.requires_third_party,
      count(*) as line_count,
      sum(l.debit) as total_debit,
      sum(l.credit) as total_credit
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND (
        a.code LIKE '1305%'
        OR (
          a.code LIKE '13%'
          AND (a.requires_third_party = 1 OR a.requires_third_party = 'true')
          AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')
        )
      )
    GROUP BY a.code
    ORDER BY a.code
  `;

  const rows = db.prepare(sqlNew).all();
  console.log('Included accounts under NEW rule:');
  for (const r of rows) {
    console.log(`  ${r.account_code.padEnd(12)}: ${r.line_count} lines | Deb: ${r.total_debit} | Cred: ${r.total_credit} | ${r.account_name}`);
  }

  // Also check what was EXCLUDED that used to be included
  const sqlExcluded = `
    SELECT
      a.code AS account_code,
      a.name AS account_name,
      count(*) as line_count,
      sum(l.debit) as total_debit,
      sum(l.credit) as total_credit
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND a.code LIKE '13%'
      AND NOT (
        a.code LIKE '1305%'
        OR (
          a.code LIKE '13%'
          AND (a.requires_third_party = 1 OR a.requires_third_party = 'true')
          AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')
        )
      )
    GROUP BY a.code
    ORDER BY a.code
  `;
  const excluded = db.prepare(sqlExcluded).all();
  console.log('Excluded accounts under NEW rule:');
  for (const r of excluded) {
    console.log(`  ${r.account_code.padEnd(12)}: ${r.line_count} lines | Deb: ${r.total_debit} | Cred: ${r.total_credit} | ${r.account_name}`);
  }

  db.close();
}

