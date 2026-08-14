const http = require('http');

async function testUrl(pathStr) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: pathStr,
      method: 'GET'
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.end();
  });
}

async function run() {
  const urls = [
    '/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-14&includeThird=true',
    '/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-14&includeThird=true&branch_id=8d30v195m0j3q3d',
    '/api/gravy/report-balances?startDate=2026-01-01&endDate=2026-08-31',
    '/api/gravy/report-balances?startDate=2026-01-01&endDate=2026-08-31&branch_id=8d30v195m0j3q3d'
  ];

  for (const u of urls) {
    const r = await testUrl(u);
    console.log(`URL: ${u} => Status: ${r.status}`);
    if (r.status !== 401 && r.status !== 200) {
      console.log('   Body:', r.body);
    }
  }
}

run();
