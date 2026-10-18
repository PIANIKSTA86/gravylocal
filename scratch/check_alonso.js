const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db', { readOnly: true });
const rows = db.prepare("SELECT * FROM third_parties WHERE doc_number LIKE '%6102698%' OR name LIKE '%ALONSO LOPEZ%'").all();

const t = rows[0];
console.log('Third party:', t.id, t.name, t.doc_number);

const allLines = db.prepare(`
  SELECT l.id, l.cross_doc_ref, l.debit, l.credit, l.description, l.account_id,
         a.code as account_code, a.name as account_name, a.maneja_cruce,
         t.number as tx_number, t.date as tx_date, t.status as tx_status
  FROM tx_lines l
  LEFT JOIN accounts a ON l.account_id = a.id
  LEFT JOIN transactions t ON l.tx_id = t.id
  WHERE l.third_party_id = ?
`).all(t.id);

// Simulate _loadOpenItemsForModal(thirdPartyId, false)
const isRecaudo = false;
const docs = new Map();
const anticipoRef = `ANT-${t.id}`;

for (const l of allLines) {
  if (l.tx_status === 'voided') continue;
  let ref = (l.cross_doc_ref || '').trim();
  const code = (l.account_code || '').trim();
  let esCuentaCruce = false;
  let esCuentaAnticipo = false;

  if (isRecaudo) {
    esCuentaCruce = code.startsWith('13') && !code.startsWith('1330');
    esCuentaAnticipo = code.startsWith('28') || ref === anticipoRef;
  } else {
    esCuentaCruce = code.startsWith('21') || code.startsWith('22') || code.startsWith('23') || code.startsWith('25');
    esCuentaAnticipo = code.startsWith('1330') || ref === anticipoRef;
  }

  if (esCuentaAnticipo && !ref) {
    ref = anticipoRef;
  }

  if (!ref) {
    // Note: line without ref is skipped!
    continue;
  }
  if (!esCuentaCruce && !esCuentaAnticipo && !l.maneja_cruce) continue;

  const docRefKey = esCuentaAnticipo ? anticipoRef : ref;
  const key = `${docRefKey}|${l.account_id}`;
  if (!docs.has(key)) {
    docs.set(key, {
      key,
      ref: docRefKey,
      accountId: l.account_id,
      accountName: l.account_name,
      accountCode: code,
      firstDate: l.tx_date || '',
      description: l.description || '',
      isAnticipo: esCuentaAnticipo,
      debit: 0,
      credit: 0
    });
  }
  const d = docs.get(key);
  d.debit += Number(l.debit || 0);
  d.credit += Number(l.credit || 0);
}

const allDocs = [...docs.values()].map(d => {
  const isAnticipo = d.isAnticipo;
  let netOpen = 0;
  let saldo = 0;
  if (isAnticipo) {
    netOpen = isRecaudo ? (d.credit - d.debit) : (d.debit - d.credit);
    saldo = Math.max(0, netOpen);
  } else {
    netOpen = isRecaudo ? (d.debit - d.credit) : (d.credit - d.debit);
    saldo = netOpen;
  }
  return { ...d, saldo, netOpen, isAnticipo };
});

const openItems = allDocs.filter(d => !d.isAnticipo && Math.abs(d.saldo) > 0.01);
const anticipos = allDocs.filter(d => d.isAnticipo && d.saldo > 0.01);

console.log('Open items count:', openItems.length);
console.table(openItems.map(i => ({ ref: i.ref, date: i.firstDate, account: `${i.accountCode} - ${i.accountName}`, debit: i.debit, credit: i.credit, saldo: i.saldo })));
console.log('Anticipos count:', anticipos.length);
console.table(anticipos.map(i => ({ ref: i.ref, account: `${i.accountCode} - ${i.accountName}`, saldo: i.saldo })));

const sumSaldo = openItems.reduce((s, i) => s + i.saldo, 0);
console.log('Total saldo facturas vivas:', sumSaldo);
