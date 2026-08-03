const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

function getMetrics(mode, callback) {
  const isRecaudo = mode === 'recaudos' || mode === 'cxc' || mode === 'rc';
  const asOfDate = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const startDate = `${y}-${m}-01`;
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

  const accountPrefixes = isRecaudo ? ['13'] : ['22', '23', '25'];
  const filterClause = accountPrefixes.map(p => `a.code LIKE '${p}%'`).join(' OR ');

  const sqlAging = `
    SELECT
      l.account_id,
      a.code AS account_code,
      a.maneja_cruce AS account_maneja_cruce,
      COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS third_party_id,
      l.cross_doc_ref,
      l.debit,
      l.credit
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND t.date <= ?
      AND (${filterClause})
  `;

  db.all(sqlAging, [asOfDate + " 23:59:59"], (err, agingData) => {
    if (err) return callback(err);

    const docs = {};
    for (const r of agingData) {
      const manejaCruce = r.account_maneja_cruce === 1 || r.account_maneja_cruce === true || r.account_maneja_cruce === "1" || r.account_maneja_cruce === "true";
      const refRaw = String(r.cross_doc_ref || '').trim();
      if (!manejaCruce && !refRaw) continue;

      const ref = refRaw || 'SIN_DOC';
      const key = `${r.account_id}|${r.third_party_id}|${ref}`;
      if (!docs[key]) {
        docs[key] = { debit: 0, credit: 0 };
      }
      docs[key].debit += Number(r.debit || 0);
      docs[key].credit += Number(r.credit || 0);
    }

    let portfolioTotal = 0;
    let portfolioCount = 0;
    const EPS = 0.001;

    for (const k in docs) {
      const open = isRecaudo ? (docs[k].debit - docs[k].credit) : (docs[k].credit - docs[k].debit);
      if (open > EPS) {
        portfolioTotal += open;
        portfolioCount++;
      }
    }

    const sqlMonth = isRecaudo ? `
      SELECT SUM(l.debit) as total_11
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN transaction_types tt ON tt.id = t.tx_type_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date >= ? AND t.date <= ?
        AND (tt.code = 'RC' OR tt.code LIKE 'RC%')
        AND a.code LIKE '11%'
    ` : `
      SELECT SUM(l.credit) as total_11
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN transaction_types tt ON tt.id = t.tx_type_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date >= ? AND t.date <= ?
        AND (tt.code = 'CE' OR tt.code LIKE 'CE%')
        AND a.code LIKE '11%'
    `;

    db.get(sqlMonth, [startDate + " 00:00:00", endDate + " 23:59:59"], (err, monthData) => {
      if (err) return callback(err);
      let monthTotal = Number(monthData?.total_11 || 0);

      callback(null, {
        mode: isRecaudo ? 'recaudos' : 'egresos',
        portfolioTotal,
        portfolioCount,
        monthTotal,
        startDate,
        endDate,
        asOfDate
      });
    });
  });
}

getMetrics('recaudos', (err, resR) => {
  console.log("Recaudos Metrics:", resR);
  getMetrics('egresos', (err, resE) => {
    console.log("Egresos Metrics:", resE);
  });
});
