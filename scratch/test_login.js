const http = require('http');

async function testAuth(email, password) {
  const payload = JSON.stringify({ identity: email, password: password });
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8092,
      path: '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

(async () => {
  const passwords = ['12345678', 'admin123456', '123456789', 'admin123', 'admin', 'Gravy2026*', 'Gravy2024*'];
  for (const p of passwords) {
    const res = await testAuth('julian_piano@hotmail.com', p);
    if (res.status === 200) {
      console.log('Success with password:', p);
      const json = JSON.parse(res.data);
      console.log('Token:', json.token.slice(0, 20) + '...');
      return;
    }
  }
  console.log('None worked, testing admin@gravy.com...');
  for (const p of passwords) {
    const res = await testAuth('admin@gravy.com', p);
    if (res.status === 200) {
      console.log('Success for admin@gravy.com with password:', p);
      return;
    }
  }
})();

