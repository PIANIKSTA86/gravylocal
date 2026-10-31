const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbs = [
  { name: 'Principal (pb_data)', path: 'pb_data/data.db' },
  { name: 'Empresa 8094', path: 'empresas/empresa_8094/pb_data/data.db' }
];

for (const dbInfo of dbs) {
  if (!fs.existsSync(dbInfo.path)) continue;
  console.log(`\n==================================================`);
  console.log(`QA VERIFICACIÓN: ${dbInfo.name}`);
  console.log(`==================================================`);

  const db = new DatabaseSync(dbInfo.path, { open: true, readOnly: true });

  // 1. Simulación endpoint CxC con la nueva lógica
  const isCxC = true;
  const filterClause = isCxC
    ? "(a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))"
    : "(a.code LIKE '2205%' OR ((a.code LIKE '22%' OR a.code LIKE '23%' OR a.code LIKE '25%') AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))";

  const sqlAging = `
    SELECT
      l.id,
      l.debit,
      l.credit,
      l.cross_doc_ref,
      l.account_id,
      a.code AS account_code,
      a.name AS account_name,
      a.nature AS account_nature,
      a.maneja_cruce AS account_maneja_cruce,
      a.requires_third_party AS account_requires_third_party,
      COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id, 'NO_TERCERO') AS third_party_id,
      COALESCE(tp.name, 'Sin tercero') AS third_party_name,
      COALESCE(tp.doc_number, '') AS third_party_doc,
      COALESCE(tp.type, 'OTRO') AS third_party_type
    FROM tx_lines l
    INNER JOIN accounts a ON a.id = l.account_id
    INNER JOIN transactions t ON t.id = l.tx_id
    LEFT JOIN third_parties tp ON tp.id = COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id)
    WHERE t.status = 'active'
      AND (${filterClause})
  `;

  const rows = db.prepare(sqlAging).all();
  console.log(`Líneas obtenidas en CxC: ${rows.length}`);

  // Verificar en JS
  const byAcc = {};
  const byThird = {};
  let invalidAccountCount = 0;

  for (const r of rows) {
    const accCode = String(r.account_code || '').trim();
    const manejaCruce = r.account_maneja_cruce === 1 || r.account_maneja_cruce === true || r.account_maneja_cruce === "1" || r.account_maneja_cruce === "true";
    const reqThird = r.account_requires_third_party === 1 || r.account_requires_third_party === true || r.account_requires_third_party === "1" || r.account_requires_third_party === "true";

    const isEligible = accCode.startsWith('1305') || (accCode.startsWith('13') && reqThird && manejaCruce);
    if (!isEligible) {
      invalidAccountCount++;
      console.error(`¡ERROR! Cuenta no elegible presente: ${accCode}`);
    }

    byAcc[accCode] = (byAcc[accCode] || 0) + 1;
    byThird[r.third_party_name] = (byThird[r.third_party_name] || 0) + 1;
  }

  console.log(`Cuentas no elegibles encontradas: ${invalidAccountCount}`);
  console.log(`Distribución de cuentas incluidas en Cartera CxC:`);
  for (const [code, count] of Object.entries(byAcc).sort()) {
    console.log(`  - ${code}: ${count} líneas`);
  }

  // Verificar que NO haya cuentas 1355 (retenciones), 1365 (trabajadores), etc.
  const has1355 = Object.keys(byAcc).some(c => c.startsWith('1355'));
  const has1365 = Object.keys(byAcc).some(c => c.startsWith('1365'));
  const has1325 = Object.keys(byAcc).some(c => c.startsWith('1325'));
  console.log(`Verificación de exclusión:`);
  console.log(`  - Excluye 1355 (Impuestos / DIAN): ${!has1355 ? 'PASS (Correcto)' : 'FAIL'}`);
  console.log(`  - Excluye 1365 (Préstamos Trabajadores): ${!has1365 ? 'PASS (Correcto)' : 'FAIL'}`);
  console.log(`  - Excluye 1325 (Cuentas Socios): ${!has1325 ? 'PASS (Correcto)' : 'FAIL'}`);

  db.close();
}

