const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

const moraInvs = [
  'CF-202606-000160', 'CF-202607-000015', 'CF-202607-000025', 'CF-202607-000051',
  'CF-202607-000084', 'CF-202607-000129', 'CF-202608-000025', 'CF-202608-000051',
  'CF-202608-000084', 'CF-202608-000129', 'CF-202609-000025', 'CF-202609-000032',
  'CF-202609-000038', 'CF-202609-000051', 'CF-202609-000074', 'CF-202609-000084',
  'CF-202609-000129'
];

for (const num of moraInvs) {
  const rcs = db.prepare(`
    SELECT t.number, t.date, l.credit, l.cross_doc_ref
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE l.cross_doc_ref LIKE ? AND t.status = 'active'
  `).all(`${num}%`);
  if (rcs.length) {
    console.log(`Pagos recibidos para ${num}:`, rcs);
  }
}

db.close();

