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

// 2. Compute Libro Auxiliar per owner (account 13459501)
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
  if (!bookByThird[tid]) bookByThird[tid] = { debits: 0, credits: 0, balance: 0 };
  bookByThird[tid].debits += Number(l.debit || 0);
  bookByThird[tid].credits += Number(l.credit || 0);
  bookByThird[tid].balance += (Number(l.debit || 0) - Number(l.credit || 0));
}

// 3. Load all active invoices
const invoices = db.prepare(`
  SELECT id, number, period, date, due_date, total, status, property_id, tx_id
  FROM ph_invoices
  WHERE status != 'voided' AND tx_id != ''
  ORDER BY date ASC, number ASC
`).all();

const causalTxIds = new Set(invoices.map(i => i.tx_id));
const invNumbers = invoices.map(i => String(i.number || '').toUpperCase().trim()).filter(Boolean);

// 4. Load all payments/credits from contabilidad affecting cartera
const payments13 = db.prepare(`
  SELECT l.cross_doc_ref, l.credit, l.debit, l.tx_id, l.third_party_id, t.number as tx_num
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code LIKE '13%' AND t.status = 'active' AND l.cross_doc_ref != ''
`).all();

const directAbonosMap = {}; // Key: invoice number or invoice-concept
const advancesByProp = {}; // Key: propertyId -> unassigned advances pool

for (const p of payments13) {
  if (causalTxIds.has(p.tx_id)) continue;
  const ref = String(p.cross_doc_ref || '').trim().toUpperCase();
  const val = Number(p.credit || 0) - Number(p.debit || 0);
  if (val === 0) continue;

  if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) {
      const pCode = parts[1]; // e.g. 202610
      const pId = parts.slice(2).join('-');
      // Check if target invoice exists
      const targetInv = invoices.find(inv => {
        const invPCode = String(inv.period || '').replace('-', '');
        return invPCode === pCode && String(inv.property_id).toUpperCase() === pId.toUpperCase();
      });
      if (targetInv && targetInv.number) {
        const invNum = String(targetInv.number).trim().toUpperCase();
        directAbonosMap[invNum] = (directAbonosMap[invNum] || 0) + val;
      } else {
        // Pool as general advance for this property
        const cleanPid = pId.toLowerCase();
        advancesByProp[cleanPid] = (advancesByProp[cleanPid] || 0) + val;
      }
    }
  } else if (ref.startsWith('ANT-')) {
    const pId = ref.substring(4).toLowerCase();
    advancesByProp[pId] = (advancesByProp[pId] || 0) + val;
  } else {
    // Normal invoice reference
    const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
    if (matchedInv) {
      directAbonosMap[ref] = (directAbonosMap[ref] || 0) + val;
    }
  }
}

// 5. Aggregate Cartera by property with FIFO application of unassigned advances
const carteraByProp = {};

// Group invoices by property (ordered by date ASC)
const invsByProp = {};
for (const inv of invoices) {
  if (!invsByProp[inv.property_id]) invsByProp[inv.property_id] = [];
  invsByProp[inv.property_id].push(inv);
}

for (const p of props) {
  const pInvs = invsByProp[p.id] || [];
  let pool = advancesByProp[p.id.toLowerCase()] || 0;
  
  let propInvoiced = 0;
  let propPaid = 0;
  let propBalance = 0;
  
  for (const inv of pInvs) {
    const num = String(inv.number || '').trim().toUpperCase();
    const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(inv.id);
    
    let generalAbono = directAbonosMap[num] || 0;
    let invPaid = 0;
    
    for (const ln of lines) {
      const origAmt = Number(ln.amount || 0);
      let cCode = 'GEN';
      const desc = String(ln.description || '').toLowerCase();
      if (desc.includes('mora') || desc.includes('interes')) cCode = 'MORA';
      else if (desc.includes('admin')) cCode = 'ADM';
      else if (desc.includes('extra')) cCode = 'EXT';
      
      const specRef = `${num}-${cCode}`;
      let lineAbono = directAbonosMap[specRef] || 0;
      if (generalAbono > 0) {
        const applyGen = Math.min(generalAbono, Math.max(0, origAmt - lineAbono));
        lineAbono += applyGen;
        generalAbono -= applyGen;
      }
      invPaid += lineAbono;
    }
    
    let invPending = Number(inv.total || 0) - invPaid;
    
    // Apply advance pool (FIFO)
    if (pool > 0 && invPending > 0) {
      const applyAdvance = Math.min(pool, invPending);
      invPaid += applyAdvance;
      invPending -= applyAdvance;
      pool -= applyAdvance;
    }
    
    propInvoiced += Number(inv.total || 0);
    propPaid += invPaid;
    propBalance += invPending;
  }
  
  // If there's still advance pool remaining, it means the property has a negative balance (saldo a favor)
  if (pool > 0) {
    propBalance -= pool;
  }
  
  carteraByProp[p.id] = {
    totalInvoiced: propInvoiced,
    totalPaid: propPaid,
    balance: propBalance
  };
}

// 6. Compare with Libro Auxiliar
let diffCount = 0;
let totalDiffSum = 0;
const diffList = [];

for (const p of props) {
  const cData = carteraByProp[p.id] || { balance: 0 };
  const bData = p.owner_id ? (bookByThird[p.owner_id] || { balance: 0 }) : { balance: 0 };
  
  const diff = Math.round((cData.balance - bData.balance) * 100) / 100;
  if (Math.abs(diff) > 0.01) {
    diffCount++;
    totalDiffSum += diff;
    diffList.push({
      prop: p,
      carteraBal: cData.balance,
      bookBal: bData.balance,
      diff
    });
  }
}

console.log(`\n=== RESULTADO COMPARACIÓN CON TRATAMIENTO FIFO DE ANTICIPOS ===`);
console.log(`Total Unidades: ${props.length}`);
console.log(`Unidades con Descuadre: ${diffCount}`);
console.log(`Diferencia total: ${totalDiffSum}`);

if (diffList.length) {
  console.log('Detalle de las unidades que aún difieren:');
  for (const d of diffList) {
    console.log(`  Unidad ${d.prop.code} (${d.prop.name}): Cartera=${d.carteraBal}, Libro=${d.bookBal}, Diff=${d.diff}`);
  }
}

db.close();

