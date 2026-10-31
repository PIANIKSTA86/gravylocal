const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// 1. Load properties
const props = db.prepare(`
  SELECT p.id, p.code, p.name, p.owner_id, tp.name as owner_name, tp.doc_number as owner_doc
  FROM ph_properties p
  LEFT JOIN third_parties tp ON tp.id = p.owner_id
  ORDER BY p.code
`).all();

const propById = new Map(props.map(p => [p.id, p]));
const propByCode = new Map(props.map(p => [p.code, p]));

// 2. Load all active invoices and map invoice number -> property
const invoices = db.prepare(`
  SELECT id, number, period, date, due_date, total, status, property_id, tx_id
  FROM ph_invoices
  WHERE status != 'voided' AND tx_id != ''
  ORDER BY date ASC, number ASC
`).all();

const invByNum = new Map();
const invsByProp = new Map();
for (const inv of invoices) {
  const numKey = String(inv.number || '').trim().toUpperCase();
  invByNum.set(numKey, inv);
  if (!invsByProp.has(inv.property_id)) invsByProp.set(inv.property_id, []);
  invsByProp.get(inv.property_id).push(inv);
}

// 3. Attribute EVERY line in account 13459501 to a property
// (The true per-unit accounting ledger)
const all13Lines = db.prepare(`
  SELECT l.id, l.tx_id, l.account_id, l.debit, l.credit, l.description, l.cross_doc_ref, l.third_party_id,
         t.number as tx_number, t.date, tt.code as tx_type
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

// Unit Ledger: propertyId -> { debits, credits, balance, lines }
const unitLedger = new Map();
for (const p of props) {
  unitLedger.set(p.id, { prop: p, debits: 0, credits: 0, balance: 0, lines: [] });
}

const unassignedLines = [];

for (const l of all13Lines) {
  let matchedPropId = null;
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  
  if (ref.startsWith('ANT-')) {
    matchedPropId = ref.substring(4).toLowerCase();
  } else if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) {
      matchedPropId = parts.slice(2).join('-').toLowerCase();
    }
  } else if (ref) {
    // Check if ref matches an invoice (e.g. CF-202608-000001 or CF-202608-000001-ADM)
    const baseInvNum = ref.split('-').slice(0, 3).join('-');
    const inv = invByNum.get(baseInvNum) || invByNum.get(ref);
    if (inv) {
      matchedPropId = inv.property_id;
    }
  }

  // Fallback to description (e.g. "Unidad 1402" or "Apartamento. A-402")
  if (!matchedPropId && l.description) {
    for (const p of props) {
      if (l.description.includes(`Unidad ${p.code}`) || l.description.includes(p.name)) {
        matchedPropId = p.id;
        break;
      }
    }
  }

  // Fallback if property owner owns only 1 property
  if (!matchedPropId && l.third_party_id) {
    const ownerProps = props.filter(p => p.owner_id === l.third_party_id);
    if (ownerProps.length === 1) {
      matchedPropId = ownerProps[0].id;
    }
  }

  if (matchedPropId && unitLedger.has(matchedPropId)) {
    const entry = unitLedger.get(matchedPropId);
    entry.debits += Number(l.debit || 0);
    entry.credits += Number(l.credit || 0);
    entry.balance += (Number(l.debit || 0) - Number(l.credit || 0));
    entry.lines.push(l);
  } else {
    unassignedLines.push(l);
  }
}

console.log(`Líneas contables 13459501 procesadas: ${all13Lines.length}`);
console.log(`Líneas asignadas a unidades: ${all13Lines.length - unassignedLines.length}`);
console.log(`Líneas NO asignadas a ninguna unidad: ${unassignedLines.length}`);
for (const u of unassignedLines) {
  console.log(`  No asignada: ${u.tx_type} #${u.tx_number} Deb=${u.debit} Cred=${u.credit} Ref='${u.cross_doc_ref}' Desc='${u.description}'`);
}

// 4. Now simulate Cartera PH by unit using the exact same invoice lines + abonos + advances
let diffCount = 0;
let totalCarteraAll = 0;
let totalLedgerAll = 0;
const diffUnits = [];

for (const p of props) {
  const ledger = unitLedger.get(p.id);
  totalLedgerAll += ledger.balance;

  // Compute Cartera PH:
  // Total facturado por unidad
  const pInvs = invsByProp.get(p.id) || [];
  let carteraInvoiced = 0;
  for (const inv of pInvs) carteraInvoiced += Number(inv.total || 0);
  
  // Total recaudado / abonado por unidad (créditos en contabilidad para esta unidad)
  const carteraPaid = ledger.credits;
  
  // Saldo real de cartera = Facturado - Recaudado
  const carteraBalance = carteraInvoiced - carteraPaid;
  totalCarteraAll += carteraBalance;

  const diff = Math.round((carteraBalance - ledger.balance) * 100) / 100;
  if (Math.abs(diff) > 0.01) {
    diffCount++;
    diffUnits.push({
      code: p.code,
      name: p.name,
      carteraBalance,
      ledgerBalance: ledger.balance,
      carteraInvoiced,
      ledgerDebits: ledger.debits,
      carteraPaid,
      ledgerCredits: ledger.credits,
      diff
    });
  }
}

console.log(`\n=== RESULTADO FINAL DE CUADRE POR UNIDAD HABITACIONAL ===`);
console.log(`Total Unidades: ${props.length}`);
console.log(`Total Saldo Cartera PH: ${totalCarteraAll}`);
console.log(`Total Saldo Libro Contable (13459501): ${totalLedgerAll}`);
console.log(`Unidades con Descuadre: ${diffCount}`);
if (diffUnits.length) {
  console.log('Unidades descuadradas:', diffUnits);
} else {
  console.log('¡¡¡CUADRE PERFECTO: 0 DESCUADRES EN TODAS LAS 192 UNIDADES HABITACIONALES!!!');
}

db.close();

