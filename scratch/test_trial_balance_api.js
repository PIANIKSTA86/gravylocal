const http = require('http');

async function testUrl(pathStr) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: pathStr,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
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
  console.log('Testing Trial Balance endpoints...');
  const resStandard = await testUrl('/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-31&includeThird=true');
  console.log('Standard includeThird=true Status:', resStandard.status);

  const resProperty = await testUrl('/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-31&includeThird=true&includeProperty=true');
  console.log('With includeProperty=true Status:', resProperty.status);
  
  if (resProperty.status === 200) {
    try {
      const data = JSON.parse(resProperty.body);
      console.log('Rows count:', data.length);
      if (data.length) {
        console.log('Sample row with property fields:', {
          accountId: data[0].accountId,
          thirdPartyName: data[0].thirdPartyName,
          propertyId: data[0].propertyId,
          propertyCode: data[0].propertyCode,
          propertyName: data[0].propertyName,
          debitSum: data[0].debitSum,
          creditSum: data[0].creditSum
        });
      }
    } catch (e) {
      console.error('Parse error:', e);
    }
  } else if (resProperty.status === 401) {
    console.log('Endpoint is protected (401 Unauthorized as expected without auth token).');
  } else {
    console.log('Unexpected status or error body:', resProperty.body);
  }
}

run();
