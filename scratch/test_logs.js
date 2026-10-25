const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const fromDate = '2026-10-01';
const toDate = '2026-10-31 23:59:59';
const bookType = 'local';

let sql = `
  SELECT
    t.date AS fecha,
    t.number AS comprobante,
    t.description AS descripcion,
    COALESCE(tp.name, 'Sin tercero') AS tercero,
    COALESCE(tp.doc_number, '') AS terceroDoc,
    a.code AS accountCode,
    a.name AS accountName,
    COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), NULLIF(TRIM(t.cross_number), ''), '') AS doc_cruce,
    l.debit AS debito,
    l.credit AS credito,
    t.tx_type_id AS typeId,
    COALESCE(tt.code, 'OTROS') AS typeCode,
    COALESCE(tt.name, 'Otros Comprobantes') AS typeName,
    COALESCE(b.name, 'Principal') AS sucursal
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  LEFT JOIN branches b ON b.id = COALESCE(l.branch_id, t.branch_id)
  WHERE t.status = 'active'
    AND t.date >= ?
    AND t.date <= ?
`;

if (bookType === 'niif') {
  sql += " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";
} else if (bookType === 'local') {
  sql += " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";
}

try {
  const stmt = db.prepare(sql);
  const rows = stmt.all(fromDate, toDate);
  console.log('SUCCESS! Rows found:', rows.length);
  if (rows.length > 0) console.log('Sample row:', rows[0]);
} catch (e) {
  console.error('SQL ERROR:', e);
}
