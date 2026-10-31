const fs = require('fs');

const files = [
  'pb_hooks/reports_optimized.pb.js',
  'empresas/empresa_8094/pb_hooks/reports_optimized.pb.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Ensure report-auxiliary has fallbacks for queryParam and is fully wrapped in try/catch
  const searchAux = `routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {`;
  const idx = code.indexOf(searchAux);
  if (idx !== -1) {
    const endIdx = code.indexOf(`// ─────`, idx);
    let auxBlock = code.slice(idx, endIdx);

    // If it starts with routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {\n  let authRecord
    // let's wrap the whole block cleanly
    auxBlock = auxBlock.replace(
      `routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {\n  let authRecord`,
      `routerAdd("GET", "/api/gravy/report-auxiliary", (c) => {\n  try {\n    let authRecord`
    );

    // And make sure queryParam fallbacks exist
    auxBlock = auxBlock.replace(
      `let fromDate = String(queryParams.fromDate || '').trim();`,
      `let fromDate = String(queryParams.fromDate || (c.queryParam ? c.queryParam("fromDate") : '') || '').trim();`
    );
    auxBlock = auxBlock.replace(
      `let toDate = String(queryParams.toDate || '').trim();`,
      `let toDate = String(queryParams.toDate || (c.queryParam ? c.queryParam("toDate") : '') || '').trim();`
    );
    auxBlock = auxBlock.replace(
      `let accountIdsStr = String(queryParams.accountIds || '').trim();`,
      `let accountIdsStr = String(queryParams.accountIds || (c.queryParam ? c.queryParam("accountIds") : '') || '').trim();`
    );
    auxBlock = auxBlock.replace(
      `let thirdId = String(queryParams.thirdId || '').trim();`,
      `let thirdId = String(queryParams.thirdId || (c.queryParam ? c.queryParam("thirdId") : '') || '').trim();`
    );
    auxBlock = auxBlock.replace(
      `let auxPropertyId = String(queryParams.propertyId || queryParams.property_id || '').trim();`,
      `let auxPropertyId = String(queryParams.propertyId || queryParams.property_id || (c.queryParam ? (c.queryParam("propertyId") || c.queryParam("property_id")) : '') || '').trim();`
    );

    code = code.slice(0, idx) + auxBlock + code.slice(endIdx);
    fs.writeFileSync(file, code, 'utf8');
    console.log(`Updated auxiliary route in ${file}`);
  }
}

if (fs.existsSync('empresas/empresa_8094/pb_hooks/test_echo.pb.js')) {
  fs.unlinkSync('empresas/empresa_8094/pb_hooks/test_echo.pb.js');
  console.log('Removed test_echo.pb.js');
}

