const http = require('http');

async function fetchToken() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: '/api/test/get-token',
      method: 'GET'
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.end();
  });
}

async function testEndpoint(token, urlStr) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: urlStr,
      method: 'GET',
      headers: {
        'Authorization': token
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.end();
  });
}

async function run() {
  const branchId = '8d30v195m0j3q3d';
  const urls = [
    `/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-14&includeThird=true&branch_id=${branchId}`,
    `/api/gravy/report-balances?startDate=2026-01-01&endDate=2026-08-31&branch_id=${branchId}`,
    `/api/gravy/report-journal?fromDate=2026-08-01&toDate=2026-08-31&branch_id=${branchId}`,
    `/api/gravy/report-auxiliary?fromDate=2026-07-29&toDate=2026-08-14&branch_id=${branchId}`,
    `/api/gravy/report-cash-flow?fromDate=2026-01-01&toDate=2026-08-31&branch_id=${branchId}`,
    `/api/gravy/report-sales-by-seller?startDate=2026-01-01&endDate=2026-08-31&branch_id=${branchId}`,
    `/api/gravy/report-portfolio-aging?mode=cxc&asOfDate=2026-08-14&branch_id=${branchId}`,
    `/api/gravy/treasury-metrics?mode=recaudos&asOfDate=2026-08-14&branch_id=${branchId}`,
    `/api/gravy/report-inventory-as-of?asOfDate=2026-08-14&branch_id=${branchId}`,
    `/api/gravy/report-cost-centers?fromDate=2026-01-01&toDate=2026-08-31&branch_id=${branchId}`
  ];

  console.log("Obteniendo token JWT de prueba...");
  const tokRes = await fetchToken();
  let token = "";
  if (tokRes.status === 200) {
    token = JSON.parse(tokRes.body).token;
    console.log("Token obtenido exitosamente!");
  } else {
    console.log("Falla en token:", tokRes.body);
    return;
  }

  let passCount = 0;
  let failCount = 0;

  for (const urlStr of urls) {
    const res = await testEndpoint(token, urlStr);
    const ok = res.status === 200;
    if (ok) passCount++; else failCount++;
    console.log(`[${ok ? 'PASS 200' : 'FAIL ' + res.status}] ${urlStr} (Length: ${res.body.length} B)`);
    if (!ok) {
      console.log(`   Response: ${res.body}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`RESUMEN FINAL: ${passCount} PASARON, ${failCount} FALLARON.`);
  console.log(`========================================`);
}

run();
