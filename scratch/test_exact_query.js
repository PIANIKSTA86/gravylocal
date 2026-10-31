const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db', { open: true, readOnly: true });

// Simulate exact endpoint call from user:
// mode=cxc&asOfDate=2026-10-30&thirdType=&sellerId=sin_vendedor&accountCodes=11050502&book_type=local
const queryParams = {
  mode: 'cxc',
  asOfDate: '2026-10-30',
  thirdType: '',
  sellerId: 'sin_vendedor',
  accountCodes: '11050502',
  book_type: 'local'
};

let mode = String(queryParams.mode || "cxc").trim();
let thirdType = String(queryParams.thirdType || "").trim().toUpperCase();
let sellerId = String(queryParams.sellerId || "").trim();
let asOfDate = String(queryParams.asOfDate || "").trim();
let accountCodesParam = String(queryParams.accountCodes || "").trim();
let bookType = String(queryParams.book_type || '').toLowerCase().trim();

const isCxC = mode === 'cxc';
const binds = { asOfDateLimit: asOfDate + " 23:59:59" };

const selectedAccountCodes = accountCodesParam
  ? accountCodesParam.split(',').map(s => s.trim()).filter(Boolean)
  : [];

let filterClause = "";
if (selectedAccountCodes.length > 0) {
  const codePlaceholders = selectedAccountCodes.map((_, idx) => `$acc_code_${idx}`).join(',');
  const idPlaceholders = selectedAccountCodes.map((_, idx) => `$acc_id_${idx}`).join(',');
  selectedAccountCodes.forEach((val, idx) => {
    binds[`acc_code_${idx}`] = val;
    binds[`acc_id_${idx}`] = val;
  });
  filterClause = `(a.code IN (${codePlaceholders}) OR a.id IN (${idPlaceholders}))`;
}

let sqlAging = `
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
    a.maneja_cruce AS account_maneja_cruce,
    a.requires_third_party AS account_requires_third_party,
    COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_party_id,
    COALESCE(tp.name, 'Sin tercero') AS third_party_name,
    COALESCE(tp.doc_number, '') AS third_party_doc,
    COALESCE(tp.type, 'OTRO') AS third_party_type,
    COALESCE(tp.advisor, '') AS tp_advisor,
    COALESCE(seller_tp.name, 'Sin Vendedor') AS seller_name,
    COALESCE(seller_tp.doc_number, '') AS seller_doc,
    t.date AS tx_date,
    COALESCE(t.payment_days, tp.payment_days, 0) AS tx_payment_days
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
  LEFT JOIN third_parties seller_tp ON seller_tp.id = tp.advisor
  WHERE t.status = 'active'
    AND t.date <= $asOfDateLimit
    AND (${filterClause})
`;

if (bookType === 'niif') {
  sqlAging += " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";
} else if (bookType === 'local') {
  sqlAging += " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";
}

const data = db.prepare(sqlAging).all(binds);
console.log('Query returned rows:', data.length);

const docs = {};
const defaultNature = isCxC ? 'debit' : 'credit';

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const accCode = String(row.account_code || '').trim();
  const manejaCruce = row.account_maneja_cruce === 1 || row.account_maneja_cruce === true || row.account_maneja_cruce === "1" || row.account_maneja_cruce === "true";
  const reqThird = row.account_requires_third_party === 1 || row.account_requires_third_party === true || row.account_requires_third_party === "1" || row.account_requires_third_party === "true";

  if (selectedAccountCodes.length > 0) {
    if (!selectedAccountCodes.includes(accCode) && !selectedAccountCodes.includes(row.account_id)) {
      continue;
    }
  } else {
    const isEligible = isCxC
      ? (accCode.startsWith('1305') || (accCode.startsWith('13') && reqThird && manejaCruce))
      : (accCode.startsWith('2205') || ((accCode.startsWith('22') || accCode.startsWith('23') || accCode.startsWith('25')) && reqThird && manejaCruce));

    if (!isEligible) continue;
  }

  const tpType = String(row.third_party_type || '').toUpperCase();
  if (thirdType && tpType !== thirdType) continue;

  const currentSellerId = String(row.tp_advisor || '').trim();
  if (sellerId) {
    if (sellerId === 'sin_vendedor') {
      if (currentSellerId) continue;
    } else if (currentSellerId !== sellerId) {
      continue;
    }
  }

  const refRaw = String(row.cross_doc_ref || '').trim();
  const accNature = String(row.account_nature || '').toLowerCase() || defaultNature;
  const ref = refRaw || 'SIN_DOC';
  const key = `${row.account_id}|${row.third_party_id}|${ref}`;
  const lineCrossDate = String(row.line_cross_doc_date || '').trim();
  const lineDueDate = String(row.line_due_date || '').trim();
  const effectiveDocDate = lineCrossDate || row.tx_date;

  if (!docs[key]) {
    docs[key] = {
      account_id: row.account_id,
      account_code: row.account_code,
      account_name: row.account_name,
      nature: accNature,
      third_id: row.third_party_id,
      third_name: row.third_party_name,
      third_doc: row.third_party_doc,
      third_type: tpType || 'OTRO',
      seller_id: currentSellerId,
      seller_name: row.seller_name || 'Sin Vendedor',
      seller_doc: row.seller_doc || '',
      doc_ref: ref,
      doc_date: effectiveDocDate,
      explicit_due_date: lineDueDate,
      payment_days: Number(row.tx_payment_days || 0),
      debit: 0,
      credit: 0
    };
  }

  const doc = docs[key];
  if (effectiveDocDate < String(doc.doc_date)) {
    doc.doc_date = effectiveDocDate;
    doc.payment_days = Number(row.tx_payment_days || 0);
    if (lineDueDate) {
      doc.explicit_due_date = lineDueDate;
    }
  }
  doc.debit += Number(row.debit || 0);
  doc.credit += Number(row.credit || 0);
}

const keys = Object.keys(docs);
console.log('Processed distinct docs:', keys.length);
if (keys.length > 0) {
  console.log('Sample doc:', docs[keys[0]]);
}
console.log('SIMULATION SUCCESSFUL!');
db.close();

