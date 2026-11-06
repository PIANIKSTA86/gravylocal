const http = require('http');

function postJson(port, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (_) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testSuper() {
  const passwords = ['123456789', '12345678', 'admin', 'admin123', 'admin1234', 'superadmin'];
  for (const pw of passwords) {
    const res = await postJson(8092, '/api/collections/_superusers/auth-with-password', {
      identity: 'superadmin@contaco.com',
      password: pw
    });
    console.log('superadmin@contaco.com with', pw, ':', res.status);
    if (res.status === 200) {
      console.log('Success! Token:', res.data.token.slice(0, 20) + '...');
      return res.data.token;
    }
  }
}

testSuper().catch(console.error);

