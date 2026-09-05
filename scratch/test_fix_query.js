const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

// Let's test joining ph_invoices strictly via cross_doc_ref or direct tx when exactly 1 invoice
const correctSql = `
  SELECT
    l.account_id AS accountId,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdPartyId,
    COALESCE(tp.name, 'Sin tercero') AS thirdPartyName,
    COALESCE(tp.doc_number, '') AS thirdPartyDoc,
    COALESCE(prop.id, '') AS propertyId,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    SUM(l.debit) as debSum,
    SUM(l.credit) as credSum
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  LEFT JOIN ph_invoices phi ON (
    -- 1. Si la línea tiene documento de cruce que coincide con la factura
    (l.cross_doc_ref != '' AND (
      l.cross_doc_ref = phi.number
      OR l.cross_doc_ref LIKE phi.number || '-%'
    ))
    -- 2. O si la transacción tiene referencia directa a la factura
    OR (t.cross_type = 'ph_invoices' AND phi.number = t.cross_number)
    -- 3. O si la transacción pertenece a una sola factura (1 a 1) y la línea no tiene cross_doc_ref
    OR (l.cross_doc_ref = '' AND phi.tx_id = t.id AND (SELECT count(*) FROM ph_invoices WHERE tx_id = t.id) = 1)
  )
  LEFT JOIN properties prop ON prop.id = COALESCE(
    phi.property_id,
    CASE WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) ELSE NULL END
  )
  WHERE t.status = 'active'
    AND a.code LIKE '134595%'
  GROUP BY
    l.account_id,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
    COALESCE(prop.id, '')
`;

// Wait, let's check table name: is it `ph_properties` in empresa_8094?
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('properties', 'ph_properties')", (err, tbls) => {
  console.log('Property tables:', tbls);
  const propTable = tbls.some(t => t.name === 'ph_properties') ? 'ph_properties' : 'properties';
  console.log('Using prop table:', propTable);

  const querySql = correctSql.replace('LEFT JOIN properties prop', `LEFT JOIN ${propTable} prop`);

  db.all(querySql, (err2, rows) => {
    if (err2) console.error('Query error:', err2);
    else {
      console.log('Result count:', rows.length);
      const totalDeb = rows.reduce((s, r) => s + (r.debSum || 0), 0);
      console.log('Total Debits:', totalDeb);
      console.log('First 5 rows:');
      rows.slice(0, 5).forEach(r => {
        console.log(`- [${r.propertyCode} - ${r.propertyName}] ${r.thirdPartyName} (NIT: ${r.thirdPartyDoc}) => Deb: ${r.debSum}`);
      });
    }
    db.close();
  });
});
