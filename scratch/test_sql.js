const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const fromDate = '2026-05-01';
const toDate = '2026-09-30 23:59:59';
const auxPropertyId = 'irn3n29wsptj0n6';
const accountIds = '6jq2hqa9p6ehpx3,mdlzmvpx3077h4h,7kvgh9g2rmatt82,suiz77atxhehuib,7117muhfrnegy9n,gu62sr88gfneldz,teugquz7ao9m4gg,vtey9ozng2bj4ei,ftxa8x1tlkfb159,8vstrammmbbvdlz,phtqcf8ktz3wi41,i2s7x9wtorgmgxl,gudbne5xsc8y043,p3djx3ltbfjstzw,n6ftd8x02gxgpew,dt9pdrjz4ohm53n,57plfjgxc8kevuq,1mo0g4574sjhkq2,fhkd7lzzol9i0vt,u77dkr5shhwg87z'.split(',');

const inList = accountIds.map(id => `'${id}'`).join(',');

const sqlOpening = `
  SELECT
    l.account_id AS accountId,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
    (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END) AS docCruce,
    SUM(l.debit - l.credit) AS balance
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  LEFT JOIN ph_invoices phi_o ON (
    (l.cross_doc_ref != '' AND (l.cross_doc_ref = phi_o.number OR l.cross_doc_ref LIKE phi_o.number || '-%'))
    OR (t.cross_type = 'ph_invoices' AND t.cross_number != '' AND phi_o.number = t.cross_number)
    OR (l.cross_doc_ref = '' AND phi_o.tx_id = t.id AND (SELECT count(*) FROM ph_invoices WHERE tx_id = t.id) = 1)
  )
  LEFT JOIN ph_properties prop_o ON prop_o.id = COALESCE(
    phi_o.property_id,
    json_extract(t.teso_params, '$.ph_property_id'),
    CASE 
      WHEN l.cross_doc_ref LIKE 'ANTICIPO-%' THEN SUBSTR(l.cross_doc_ref, -15)
      WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) 
      ELSE NULL 
    END
  )
  WHERE t.status = 'active'
    AND t.date < '${fromDate}'
    AND l.account_id IN (${inList})
    AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '')
    AND prop_o.id = '${auxPropertyId}'
  GROUP BY
    l.account_id,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO'),
    (CASE WHEN a.maneja_cruce = 1 OR a.maneja_cruce = 'true' THEN COALESCE(NULLIF(TRIM(l.cross_doc_ref), ''), 'SIN_DOC') ELSE 'NO_CRUCE' END)
`;

const openRows = db.prepare(sqlOpening).all();
console.log('Opening rows found:', openRows.length, openRows);

const sqlPeriod = `
  SELECT
    t.date AS fecha,
    t.number AS comprobante,
    t.id AS txId,
    l.account_id AS accountId,
    a.code AS accountCode,
    a.name AS accountName,
    a.nature AS accountNature,
    a.maneja_cruce AS accountManejaCruce,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS thirdId,
    COALESCE(tp.name, 'Sin tercero') AS thirdName,
    COALESCE(tp.doc_number, '') AS thirdDoc,
    COALESCE(prop.code, '') AS propertyCode,
    COALESCE(prop.name, '') AS propertyName,
    COALESCE(TRIM(l.cross_doc_ref), '') AS doc_cruce,
    COALESCE(NULLIF(TRIM(l.description), ''), NULLIF(TRIM(t.description), ''), '') AS descripcion,
    l.debit AS debito,
    l.credit AS credito
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  LEFT JOIN ph_invoices phi ON (
    (l.cross_doc_ref != '' AND (
      l.cross_doc_ref = phi.number
      OR l.cross_doc_ref LIKE phi.number || '-%'
    ))
    OR (t.cross_type = 'ph_invoices' AND t.cross_number != '' AND phi.number = t.cross_number)
    OR (l.cross_doc_ref = '' AND phi.tx_id = t.id AND (SELECT count(*) FROM ph_invoices WHERE tx_id = t.id) = 1)
  )
  LEFT JOIN ph_properties prop ON prop.id = COALESCE(
    phi.property_id,
    json_extract(t.teso_params, '$.ph_property_id'),
    CASE 
      WHEN l.cross_doc_ref LIKE 'ANTICIPO-%' THEN SUBSTR(l.cross_doc_ref, -15)
      WHEN l.cross_doc_ref LIKE 'ANT-%' THEN SUBSTR(l.cross_doc_ref, 5) 
      ELSE NULL 
    END
  )
  WHERE t.status = 'active'
    AND t.date >= '${fromDate}'
    AND t.date <= '${toDate}'
    AND l.account_id IN (${inList})
    AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '')
    AND prop.id = '${auxPropertyId}'
  ORDER BY t.date ASC, t.number ASC, COALESCE(l.line_order, 0) ASC, l.id ASC
`;

const periodRows = db.prepare(sqlPeriod).all();
console.log('Period rows found:', periodRows.length, periodRows.slice(0, 3));

