const fs = require('fs');
const path = require('path');

const targetFile = 'pb_hooks/reports_optimized.pb.js';
let content = fs.readFileSync(targetFile, 'utf8');

// Check target region
const oldBlock = `  let mode = String(queryParams.mode || "cxc").trim();
  let thirdType = String(queryParams.thirdType || "").trim().toUpperCase();
  let sellerId = String(queryParams.sellerId || "").trim();
  let asOfDate = String(queryParams.asOfDate || "").trim();

  if (!asOfDate) {
    asOfDate = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
  } else {
    asOfDate = asOfDate.slice(0, 10);
  }

  try {
    const isCxC = mode === 'cxc';
    // Cartera CxC: cuenta 1305 (Clientes) o cuentas del grupo 13 con requiere tercero y maneja cruce
    // Cartera CxP: cuenta 2205 (Proveedores) o cuentas del grupo 22/23/25 con requiere tercero y maneja cruce
    const filterClause = isCxC
      ? "(a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))"
      : "(a.code LIKE '2205%' OR ((a.code LIKE '22%' OR a.code LIKE '23%' OR a.code LIKE '25%') AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))";`;

const newBlock = `  let mode = String(queryParams.mode || "cxc").trim();
  let thirdType = String(queryParams.thirdType || "").trim().toUpperCase();
  let sellerId = String(queryParams.sellerId || "").trim();
  let asOfDate = String(queryParams.asOfDate || "").trim();
  let accountCodesParam = String(queryParams.accountCodes || queryParams.account_codes || queryParams.accountIds || queryParams.account_ids || queryParams.accountId || "").trim();

  if (!asOfDate) {
    asOfDate = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
  } else {
    asOfDate = asOfDate.slice(0, 10);
  }

  try {
    const isCxC = mode === 'cxc';
    const binds = { asOfDateLimit: asOfDate + " 23:59:59" };

    const selectedAccountCodes = accountCodesParam
      ? accountCodesParam.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    let filterClause = "";
    if (selectedAccountCodes.length > 0) {
      const accPlaceholders = selectedAccountCodes.map((_, idx) => \`{:acc_\${idx}}\`).join(',');
      selectedAccountCodes.forEach((val, idx) => {
        binds[\`acc_\${idx}\`] = val;
      });
      filterClause = \`(a.code IN (\${accPlaceholders}) OR a.id IN (\${accPlaceholders}))\`;
    } else {
      // Cartera CxC: cuenta 1305 (Clientes) o cuentas del grupo 13 con requiere tercero y maneja cruce
      // Cartera CxP: cuenta 2205 (Proveedores) o cuentas del grupo 22/23/25 con requiere tercero y maneja cruce
      filterClause = isCxC
        ? "(a.code LIKE '1305%' OR (a.code LIKE '13%' AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))"
        : "(a.code LIKE '2205%' OR ((a.code LIKE '22%' OR a.code LIKE '23%' OR a.code LIKE '25%') AND (a.requires_third_party = 1 OR a.requires_third_party = 'true') AND (a.maneja_cruce = 1 OR a.maneja_cruce = 'true')))";
    }`;

// Replace query bind section
const oldBind = `    const binds = { asOfDateLimit: asOfDate + " 23:59:59" };
    if (branchId) {`;
const newBind = `    if (branchId) {`;

// Replace loop check
const oldLoop = `      const isEligible = isCxC
        ? (accCode.startsWith('1305') || (accCode.startsWith('13') && reqThird && manejaCruce))
        : (accCode.startsWith('2205') || ((accCode.startsWith('22') || accCode.startsWith('23') || accCode.startsWith('25')) && reqThird && manejaCruce));

      if (!isEligible) continue;`;

const newLoop = `      if (selectedAccountCodes.length > 0) {
        if (!selectedAccountCodes.includes(accCode) && !selectedAccountCodes.includes(row.account_id)) {
          continue;
        }
      } else {
        const isEligible = isCxC
          ? (accCode.startsWith('1305') || (accCode.startsWith('13') && reqThird && manejaCruce))
          : (accCode.startsWith('2205') || ((accCode.startsWith('22') || accCode.startsWith('23') || accCode.startsWith('25')) && reqThird && manejaCruce));

        if (!isEligible) continue;
      }`;

// Normalize line endings for replacement
const normalize = s => s.replace(/\r\n/g, '\n');
content = normalize(content);

if (content.includes(normalize(oldBlock))) {
  content = content.replace(normalize(oldBlock), normalize(newBlock));
  content = content.replace(normalize(oldBind), normalize(newBind));
  content = content.replace(normalize(oldLoop), normalize(newLoop));
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Successfully updated', targetFile);

  // Sync to all empresas
  const repTargets = [
    'empresas/pb_hooks/reports_optimized.pb.js',
    'empresas/empresa_8091/pb_hooks/reports_optimized.pb.js',
    'empresas/empresa_8092/pb_hooks/reports_optimized.pb.js',
    'empresas/empresa_8093/pb_hooks/reports_optimized.pb.js',
    'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
  ];
  for (const t of repTargets) {
    if (fs.existsSync(path.dirname(t))) {
      fs.writeFileSync(t, content, 'utf8');
      console.log('Synchronized to', t);
    }
  }
} else {
  console.error('Could not find oldBlock in', targetFile);
}

