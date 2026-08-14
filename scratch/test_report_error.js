const http = require('http');

async function testWithUser() {
  // First, get a token by posting to /api/collections/users/auth-with-password
  // Let's test with password 'admin123456' or 'admin' or '12345678'
  const passwords = ['admin123456', 'admin', '12345678', 'admin123', 'Gravy2026!'];
  let token = '';

  for (const pwd of passwords) {
    const postData = JSON.stringify({ identity: 'admin@contaco.com', password: pwd });
    const authRes = await new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 8090,
        path: '/api/collections/users/auth-with-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
      }, res => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      });
      req.write(postData);
      req.end();
    });

    if (authRes.status === 200) {
      const data = JSON.parse(authRes.body);
      token = data.token;
      console.log('Successfully authenticated as admin@contaco.com with password:', pwd);
      break;
    }
  }

  if (!token) {
    console.error('Could not authenticate user with tried passwords');
    return;
  }

  const url = '/api/gravy/report-trial-balance?fromDate=2026-08-01&toDate=2026-08-14&includeThird=true&branch_id=8d30v195m0j3q3d';
  console.log('Testing GET request with auth token to:', url);

  const res = await new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: url,
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

  console.log('RESPONSE STATUS:', res.status);
  console.log('RESPONSE BODY:', res.body);
}

testWithUser();
