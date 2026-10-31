const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// 1. Load properties and owners
const props = db.prepare(`
  SELECT p.id, p.code, p.name, p.owner_id, tp.name as owner_name, tp.doc_number as owner_doc
  FROM ph_properties p
  LEFT JOIN third_parties tp ON tp.id = p.owner_id
  ORDER BY p.code
`).all();

console.log(`Cargadas ${props.length} propiedades.`);

// 2. Compute Libro Auxiliar per owner/property
// In contabilidad: debits and credits on account 13459501 by third_party_id
const c13Lines = db.prepare(`
  SELECT l.third_party_id, l.cross_doc_ref, l.debit, l.credit, t.number as tx_number, t.date, tt.code as tx_type
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const bookByThird = {};
for (const l of c13Lines) {
  const tid = l.third_party_id || 'SIN_TERCERO';
  if (!bookByThird[tid]) bookByThird[tid] = { debits: 0, credits: 0, balance: 0, lines: [] };
  bookByThird[tid].debits += Number(l.debit || 0);
  bookByThird[tid].credits += Number(l.credit || 0);
  bookByThird[tid].balance += (Number(l.debit || 0) - Number(l.credit || 0));
  bookByThird[tid].lines.push(l);
}

// Check lines without third party
if (bookByThird['SIN_TERCERO']) {
  console.log('ADVERTENCIA: Líneas en 13459501 sin third_party_id:', bookByThird['SIN_TERCERO'].lines.length);
}

// 3. Compute Cartera PH as the frontend does:
// Frontend logic:
// invoices where status != 'voided' and tx_id != ''
const invoices = db.prepare(`
  SELECT id, number, period, date, due_date, total, status, property_id, tx_id
  FROM ph_invoices
  WHERE status != 'voided' AND tx_id != ''
  ORDER BY date, number
`).all();

// Abonos map from tx_lines where cross_doc_ref matches invoice number or starts with invoice number
// BUT excluding the causation tx itself!
const causalTxIds = new Set(invoices.map(i => i.tx_id));
const invNumbers = invoices.map(i => String(i.number || '').toUpperCase().trim()).filter(Boolean);

const payments13 = db.prepare(`
  SELECT l.cross_doc_ref, l.credit, l.debit, l.tx_id, t.number as tx_num
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code LIKE '13%' AND t.status = 'active' AND l.cross_doc_ref != ''
`).all();

const abonosMap = {};
for (const p of payments13) {
  if (causalTxIds.has(p.tx_id)) continue;
  const ref = String(p.cross_doc_ref || '').trim().toUpperCase();
  const val = Number(p.credit || 0) - Number(p.debit || 0);
  if (val === 0) continue;

  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
  if (matchedInv) {
    abonosMap[ref] = (abonosMap[ref] || 0) + val;
  }
}

// Aggregate Cartera PH by property
const carteraByProp = {};
for (const inv of invoices) {
  const pid = inv.property_id;
  if (!carteraByProp[pid]) carteraByProp[pid] = { totalInvoiced: 0, totalPaid: 0, balance: 0, invoices: [] };
  
  const num = String(inv.number || '').trim().toUpperCase();
  // Get invoice lines to compute per-concept or total abono
  const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(inv.id);
  
  let generalAbono = abonosMap[num] || 0;
  let invPaid = 0;
  
  for (const ln of lines) {
    const origAmt = Number(ln.amount || 0);
    // Specific concept ref
    let cCode = 'GEN';
    const desc = String(ln.description || '').toLowerCase();
    if (desc.includes('mora') || desc.includes('interes')) cCode = 'MORA';
    else if (desc.includes('admin')) cCode = 'ADM';
    else if (desc.includes('extra')) cCode = 'EXT';
    
    const specRef = `${num}-${cCode}`;
    let lineAbono = abonosMap[specRef] || 0;
    if (generalAbono > 0) {
      const applyGen = Math.min(generalAbono, Math.max(0, origAmt - lineAbono));
      lineAbono += applyGen;
      generalAbono -= applyGen;
    }
    invPaid += lineAbono;
  }
  
  const invBalance = Number(inv.total || 0) - invPaid;
  carteraByProp[pid].totalInvoiced += Number(inv.total || 0);
  carteraByProp[pid].totalPaid += invPaid;
  carteraByProp[pid].balance += invBalance;
  carteraByProp[pid].invoices.push({ number: inv.number, period: inv.period, total: inv.total, paid: invPaid, balance: invBalance });
}

// 4. Compare property by property
console.log('\n=== COMPARACIÓN SALDOS: CARTERA PH vs LIBRO AUXILIAR (13459501) ===\n');

let totalDiffUnits = 0;
let sumCartera = 0;
let sumBook = 0;

const diffs = [];

for (const p of props) {
  const cData = carteraByProp[p.id] || { totalInvoiced: 0, totalPaid: 0, balance: 0, invoices: [] };
  const bData = p.owner_id ? (bookByThird[p.owner_id] || { debits: 0, credits: 0, balance: 0, lines: [] }) : { debits: 0, credits: 0, balance: 0, lines: [] };
  
  sumCartera += cData.balance;
  sumBook += bData.balance;
  
  const diff = cData.balance - bData.balance;
  if (Math.abs(diff) > 0.01) {
    totalDiffUnits++;
    diffs.push({
      prop: p,
      carteraBalance: cData.balance,
      carteraInvoiced: cData.totalInvoiced,
      carteraPaid: cData.totalPaid,
      bookBalance: bData.balance,
      bookDebits: bData.debits,
      bookCredits: bData.credits,
      diff: diff,
      invoices: cData.invoices,
      bookLines: bData.lines
    });
  }
}

console.log(`Total Unidades evaluadas: ${props.length}`);
console.log(`Unidades con DESCUADRE: ${totalDiffUnits}`);
console.log(`Total Cartera PH: ${sumCartera}`);
console.log(`Total Libro Auxiliar (13459501 por propietario): ${sumBook}`);
console.log(`Diferencia Neta Global: ${sumCartera - sumBook}\n`);

// Print details of the first 15 diffs
console.log('--- Top 15 diferencias ---');
for (const d of diffs.slice(0, 15)) {
  console.log(`\nUnidad ${d.prop.code} (${d.prop.name}) - Propietario: ${d.prop.owner_name} (${d.prop.owner_doc}):`);
  console.log(`  Cartera PH: Saldo=${d.carteraBalance} (Facturado=${d.carteraInvoiced}, Pagado=${d.carteraPaid})`);
  console.log(`  Libro Aux:  Saldo=${d.bookBalance} (Debitos=${d.bookDebits}, Créditos=${d.bookCredits})`);
  console.log(`  DIFERENCIA: ${d.diff}`);
  console.log(`  Facturas PH (${d.invoices.length}):`, d.invoices.map(i => `${i.number}(${i.period}): Tot=${i.total} Pag=${i.paid} Saldo=${i.balance}`).join(', '));
  console.log(`  Líneas Libro Aux (${d.bookLines.length}):`, d.bookLines.map(l => `${l.tx_type} #${l.tx_number} (${l.date}): Deb=${l.debit} Cred=${l.credit} Ref='${l.cross_doc_ref}'`).join(' | '));
}

db.close();

