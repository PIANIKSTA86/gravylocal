const http = require('http');

async function getToken() {
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

async function testReport(token, urlStr) {
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
  const urls = [
    '/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-14&includeThird=true&branch_id=8d30v195m0j3q3d',
    '/api/gravy/report-balances?startDate=2026-01-01&endDate=2026-08-31&branch_id=8d30v195m0j3q3d',
    '/api/gravy/report-journal?fromDate=2026-08-01&toDate=2026-08-31&branch_id=8d30v195m0j3q3d',
    '/api/gravy/report-auxiliary?fromDate=2026-07-29&toDate=2026-08-14&branch_id=8d30v195m0j3q3d'
  ];

  console.log("Fetching test token...");
  const tokRes = await getToken();
  console.log("Token endpoint status:", tokRes.status);
  let token = "";
  if (tokRes.status === 200) {
    const data = JSON.parse(tokRes.body);
    token = data.token;
    console.log("Token obtained for user:", data.email);
  } else {
    console.log("Token response body:", tokRes.body);
  }

  for (const urlStr of urls) {
    const res = await testReport(token, urlStr);
    console.log(`URL: ${urlStr}`);
    console.log(`  -> Status: ${res.status}`);
    console.log(`  -> Body length: ${res.body.length}`);
    if (res.status !== 200) {
      console.log(`  -> Body: ${res.body}`);
    }
  }
}

run();
