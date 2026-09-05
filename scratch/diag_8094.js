const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

console.log('--- DIAGNOSTIC IN EMPRESA 8094 ---');

db.all(`SELECT id, code, name, tower, apartment FROM ph_properties WHERE code LIKE '%1103%' OR name LIKE '%A-103%'`, (err, props) => {
  console.log('ph_properties 1103 / A-103:', props);

  db.all(`
    SELECT count(*) as totalLines
    FROM tx_lines l
    JOIN accounts a ON a.id = l.account_id
    WHERE a.code LIKE '134595%'
  `, (err, res) => {
    console.log('Total tx_lines for 134595:', res);

    db.all(`
      SELECT count(*) as cnt
      FROM ph_invoices
    `, (err, resInv) => {
      console.log('Total ph_invoices:', resInv);

      // Now test the exact query from reports_optimized.pb.js
      const sql = `
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
        LEFT JOIN ph_invoices phi_direct ON phi_direct.tx_id = t.id
        LEFT JOIN ph_invoices phi_cross ON (
          (t.cross_type = 'ph_invoices' AND phi_cross.number = t.cross_number)
          OR (l.cross_doc_ref != '' AND (
            l.cross_doc_ref = phi_cross.number
            OR l.cross_doc_ref LIKE phi_cross.number || '-%'
          ))
        )
        LEFT JOIN ph_properties prop ON prop.id = COALESCE(
          phi_direct.property_id,
          phi_cross.property_id,
          CASE WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) ELSE NULL END
        )
        WHERE t.status = 'active'
          AND a.code LIKE '134595%'
        GROUP BY
          l.account_id,
          COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
          COALESCE(prop.id, '')
        LIMIT 10
      `;

      db.all(sql, (err, testRows) => {
        if (err) console.error('SQL Error:', err);
        else console.log('Test Rows sample:', testRows);

        // Check if phi_cross is multiplying rows!
        const checkCrossSql = `
          SELECT count(phi_cross.id) as matchCount, t.id, t.cross_type, t.cross_number, l.cross_doc_ref
          FROM tx_lines l
          INNER JOIN transactions t ON t.id = l.tx_id
          INNER JOIN accounts a ON a.id = l.account_id
          LEFT JOIN ph_invoices phi_cross ON (
            (t.cross_type = 'ph_invoices' AND phi_cross.number = t.cross_number)
            OR (l.cross_doc_ref != '' AND (
              l.cross_doc_ref = phi_cross.number
              OR l.cross_doc_ref LIKE phi_cross.number || '-%'
            ))
          )
          WHERE a.code LIKE '134595%'
          GROUP BY l.id
          HAVING matchCount > 1
          LIMIT 5
        `;
        db.all(checkCrossSql, (err, multRows) => {
          if (err) console.error('CheckCross error:', err);
          else console.log('Lines matching MULTIPLE ph_invoices:', multRows);
          db.close();
        });
      });
    });
  });
});
