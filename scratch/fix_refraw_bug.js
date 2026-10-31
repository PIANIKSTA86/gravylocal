const fs = require('fs');
const path = require('path');

const targets = [
  'pb_hooks/reports_optimized.pb.js',
  'empresas/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8091/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8092/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8093/pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
];

for (const f of targets) {
  if (!fs.existsSync(f)) continue;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/\r\n/g, '\n');

  // 1. Fix distinct placeholders in filterClause when selectedAccountCodes are present
  const oldPlaceholders = `    if (selectedAccountCodes.length > 0) {
      const accPlaceholders = selectedAccountCodes.map((_, idx) => \`{:acc_\${idx}}\`).join(',');
      selectedAccountCodes.forEach((val, idx) => {
        binds[\`acc_\${idx}\`] = val;
      });
      filterClause = \`(a.code IN (\${accPlaceholders}) OR a.id IN (\${accPlaceholders}))\`;
    }`;

  const newPlaceholders = `    if (selectedAccountCodes.length > 0) {
      const codePlaceholders = selectedAccountCodes.map((_, idx) => \`{:acc_code_\${idx}}\`).join(',');
      const idPlaceholders = selectedAccountCodes.map((_, idx) => \`{:acc_id_\${idx}}\`).join(',');
      selectedAccountCodes.forEach((val, idx) => {
        binds[\`acc_code_\${idx}\`] = val;
        binds[\`acc_id_\${idx}\`] = val;
      });
      filterClause = \`(a.code IN (\${codePlaceholders}) OR a.id IN (\${idPlaceholders}))\`;
    }`;

  if (code.includes(oldPlaceholders)) {
    code = code.replace(oldPlaceholders, newPlaceholders);
  }

  // 2. Add multilibro book_type filter if not present
  if (!code.includes('let bookType = String((queryParams && (queryParams.book_type')) {
    // Add right after asOfDate
    code = code.replace(
      'let accountCodesParam = String(queryParams.accountCodes || queryParams.account_codes || queryParams.accountIds || queryParams.account_ids || queryParams.accountId || "").trim();',
      `let accountCodesParam = String(queryParams.accountCodes || queryParams.account_codes || queryParams.accountIds || queryParams.account_ids || queryParams.accountId || "").trim();\n  let bookType = String((queryParams && (queryParams.book_type || queryParams.bookType)) || '').toLowerCase().trim();`
    );
    // Add bookCond to sqlAging
    code = code.replace(
      'if (costCenterId) {\n      sqlAging += " AND l.cost_center_id = {:costCenterId}";\n      binds.costCenterId = costCenterId;\n    }',
      `if (costCenterId) {\n      sqlAging += " AND l.cost_center_id = {:costCenterId}";\n      binds.costCenterId = costCenterId;\n    }\n    if (bookType === 'niif') {\n      sqlAging += " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";\n    } else if (bookType === 'local') {\n      sqlAging += " AND (t.book_type != 'niif' OR t.book_type IS NULL OR t.book_type = '') ";\n    }`
    );
  }

  // 3. Fix missing refRaw in loop
  const oldRef = `      const accNature = String(row.account_nature || '').toLowerCase() || defaultNature;
      const ref = refRaw || 'SIN_DOC';`;

  const newRef = `      const refRaw = String(row.cross_doc_ref || '').trim();
      const accNature = String(row.account_nature || '').toLowerCase() || defaultNature;
      const ref = refRaw || 'SIN_DOC';`;

  if (code.includes(oldRef)) {
    code = code.replace(oldRef, newRef);
    console.log('Fixed refRaw in:', f);
  } else {
    console.log('oldRef already fixed or not matched in:', f);
  }

  fs.writeFileSync(f, code, 'utf8');
}
console.log('All files updated successfully.');

