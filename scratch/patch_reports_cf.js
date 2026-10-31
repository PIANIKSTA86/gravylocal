const fs = require('fs');

const files = [
  'pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Ensure SQL abonos query includes CF-%
  const oldSqlAbonos = `          UPPER(TRIM(l.cross_doc_ref)) IN (\${numPlaceholders})
          OR l.cross_doc_ref LIKE 'ANTICIPO-%'
          OR l.cross_doc_ref LIKE 'ANT-%'`;

  const newSqlAbonos = `          UPPER(TRIM(l.cross_doc_ref)) IN (\${numPlaceholders})
          OR l.cross_doc_ref LIKE 'ANTICIPO-%'
          OR l.cross_doc_ref LIKE 'ANT-%'
          OR l.cross_doc_ref LIKE 'CF-%'`;

  const oldParseAdv = `      } else if (ref.startsWith('ANT-')) {
        const pKey = ref.substring(4).toUpperCase();
        advancesByProp[pKey] = (advancesByProp[pKey] || 0) + val;
      } else {`;

  const newParseAdv = `      } else if (ref.startsWith('ANT-')) {
        const pKey = ref.substring(4).toUpperCase();
        advancesByProp[pKey] = (advancesByProp[pKey] || 0) + val;
      } else if (ref.startsWith('CF-')) {
        // Cuota anticipada futura (ej: CF-202611-000090-ADM)
        const parts = ref.split('-');
        let pKey = '';
        if (parts.length >= 3) {
          const seq = parts[2];
          const matchInv = invoices.find(inv => String(inv.invoice_number || '').includes('-' + seq));
          if (matchInv && matchInv.property_id) {
            pKey = String(matchInv.property_id).toUpperCase();
          }
        }
        if (pKey) {
          advancesByProp[pKey] = (advancesByProp[pKey] || 0) + val;
        } else {
          abonosMap[ref] = (abonosMap[ref] || 0) + val;
        }
      } else {`;

  let replaced = code.replace(oldSqlAbonos, newSqlAbonos);
  replaced = replaced.replace(oldParseAdv, newParseAdv);
  fs.writeFileSync(file, replaced, 'utf8');
  console.log(`Updated ${file}`);
}

