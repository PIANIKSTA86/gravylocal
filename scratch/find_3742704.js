const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db', { open: true, readOnly: true });

const sql = `
  SELECT
    l.cross_doc_ref,
    l.third_party_id,
    tp.name as tp_name,
    sum(l.debit) as deb,
    sum(l.credit) as cred,
    sum(l.debit - l.credit) as net
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  WHERE t.status = 'active'
    AND a.code = '13050501'
  GROUP BY l.account_id, l.third_party_id, l.cross_doc_ref
  HAVING abs(net - 3742704) < 1
`;
console.log('Document matching 3742704:', db.prepare(sql).all());

// Check all lines of this cross_doc_ref
const docRef = db.prepare(sql).all()[0]?.cross_doc_ref;
if (docRef) {
  const lines = db.prepare(`
    SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.cross_doc_date, l.due_date, t.date, t.payment_days
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE l.cross_doc_ref = $docRef
  `).all({ docRef });
  console.log('Lines of docRef:', lines);
}

db.close();

