const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const propId = 'sl1ks88emuyod8d'; // 4104
const refDate = '2026-10-31';

db.all(`
  SELECT id, number, period, date, total, status
  FROM ph_invoices
  WHERE property_id = ? AND date <= ? AND status != 'voided' AND tx_id != ''
  ORDER BY date ASC
`, [propId, refDate], (err, invoices) => {
  console.log(`Invoices up to ${refDate}: ${invoices.length}`);
  console.table(invoices);
  let totInvs = 0;
  invoices.forEach(i => totInvs += Number(i.total));
  console.log(`Total facturado al corte: ${totInvs}`);

  // Now let's see how api.ts loads abonos
  const invNumbers = invoices.map(i => String(i.number || "").toUpperCase()).filter(Boolean);

  db.all(`
    SELECT l.id, t.number as tx_num, t.date as tx_date, l.debit, l.credit, l.description, l.cross_doc_ref
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    JOIN accounts a ON a.id = l.account_id
    WHERE a.code LIKE '13%' AND t.date <= ? AND (t.status = 'posted' OR t.status = 'active')
  `, [refDate], (err, txLines) => {

    const abonosMap = new Map();
    const advancesByPropMap = new Map();

    for (const tl of txLines) {
      const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
      if (valAbono <= 0) continue;

      const ref = String(tl.cross_doc_ref || "").trim().toUpperCase();
      const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + "-"));

      if (matchedInv) {
        abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
        console.log(`Matched direct abono: ${ref} -> ${valAbono} (from ${tl.tx_num})`);
      } else if (ref.startsWith("ANTICIPO-")) {
        // ...
      } else if (ref.startsWith("ANT-")) {
        // ...
      } else if (tl.description) {
        if (tl.description.includes('Unidad 4104') || tl.description.includes('D-104') || tl.description.includes('- 4104')) {
          advancesByPropMap.set(propId, (advancesByPropMap.get(propId) || 0) + valAbono);
          console.log(`Matched advance by description: ${tl.description} -> ${valAbono} (from ${tl.tx_num})`);
        }
      }
    }

    console.log('Abonos Map:', Object.fromEntries(abonosMap));
    console.log('Advances for 4104:', advancesByPropMap.get(propId));
  });
});

