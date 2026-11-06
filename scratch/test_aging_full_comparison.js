const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db', { open: true, readOnly: true });

const asOfDate = '2026-11-02';

// 1. Simulación exacta del reporte de Cartera por Edades (reports_optimized.pb.js)
// Con filtro de cuenta '13050501' (tal como lo ejecutó el usuario en la Imagen 2)
function getAgingReport(accountFilter = '13050501') {
  const binds = { asOfDateLimit: asOfDate + " 23:59:59" };
  let filterClause = "";
  if (accountFilter) {
    binds.acc_code_0 = accountFilter;
    binds.acc_id_0 = accountFilter;
    filterClause = "(a.code IN ($acc_code_0) OR a.id IN ($acc_id_0))";
  } else {
    filterClause = "(a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))";
  }

  const sql = `
    SELECT
      l.id,
      l.debit,
      l.credit,
      l.cross_doc_ref,
      COALESCE(l.cross_doc_date, '') AS line_cross_doc_date,
      COALESCE(l.due_date, '') AS line_due_date,
      l.account_id,
      a.code AS account_code,
      a.name AS account_name,
      a.nature AS account_nature,
      COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_party_id,
      COALESCE(tp.name, 'Sin tercero') AS third_party_name,
      COALESCE(tp.doc_number, '') AS third_party_doc,
      t.date AS tx_date,
      COALESCE(t.payment_days, tp.payment_days, 0) AS tx_payment_days
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND t.date <= $asOfDateLimit
      AND (${filterClause})
  `;

  const rows = db.prepare(sql).all(binds);
  const docs = {};

  for (const r of rows) {
    const refRaw = String(r.cross_doc_ref || '').trim();
    const ref = refRaw || 'SIN_DOC';
    const key = `${r.account_id}|${r.third_party_id}|${ref}`;
    const effectiveDocDate = String(r.line_cross_doc_date || '').trim() || r.tx_date;
    const lineDueDate = String(r.line_due_date || '').trim();

    if (!docs[key]) {
      docs[key] = {
        account_code: r.account_code,
        third_name: r.third_party_name,
        doc_ref: ref,
        doc_date: effectiveDocDate,
        explicit_due_date: lineDueDate,
        payment_days: Number(r.tx_payment_days || 0),
        debit: 0,
        credit: 0
      };
    }
    const doc = docs[key];
    if (effectiveDocDate < String(doc.doc_date)) {
      doc.doc_date = effectiveDocDate;
      doc.payment_days = Number(r.tx_payment_days || 0);
      if (lineDueDate) doc.explicit_due_date = lineDueDate;
    }
    doc.debit += Number(r.debit || 0);
    doc.credit += Number(r.credit || 0);
  }

  function addDays(dStr, n) {
    const d = new Date(dStr + "T00:00:00");
    d.setDate(d.getDate() + Number(n || 0));
    return d.toISOString().slice(0, 10);
  }

  const res = {
    saldo_a_favor: 0,
    por_vencer: 0,
    b0_30: 0,
    b31_60: 0,
    b61_90: 0,
    b90p: 0,
    total: 0,
    count: 0
  };

  for (const k of Object.keys(docs)) {
    const d = docs[k];
    const open = d.debit - d.credit;
    if (Math.abs(open) <= 0.0001) continue;

    res.count++;
    res.total += open;

    if (open < -0.0001) {
      res.saldo_a_favor += Math.abs(open);
      continue;
    }

    const dateOnly = String(d.doc_date).split(' ')[0];
    const due_date = d.explicit_due_date ? String(d.explicit_due_date).split(' ')[0] : addDays(dateOnly, d.payment_days);
    const expiredDays = Math.floor((new Date(asOfDate + "T00:00:00") - new Date(due_date + "T00:00:00")) / 86400000);

    if (expiredDays < 0) res.por_vencer += open;
    else if (expiredDays <= 30) res.b0_30 += open;
    else if (expiredDays <= 60) res.b31_60 += open;
    else if (expiredDays <= 90) res.b61_90 += open;
    else res.b90p += open;
  }
  return res;
}

console.log('REPORTE CARTERA POR EDADES (Filtro 13050501 - Imagen 1 y 2):');
console.log(getAgingReport('13050501'));

console.log('\nREPORTE CARTERA POR EDADES (Sin filtro de cuenta - Todas):');
console.log(getAgingReport(''));

db.close();

