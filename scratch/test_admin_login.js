const http = require('http');

async function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ identity: email, password });
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  const passwords = ['admin123456', '12345678', 'admin123', 'admin', 'password', 'Gravy2026*', 'Gravy2025*'];
  for (const pw of passwords) {
    const res = await testLogin('admin@contaco.com', pw);
    if (res.status === 200) {
      console.log('SUCCESS with password:', pw);
      console.log('Token:', res.data.token.substring(0, 30) + '...');
      return res.data.token;
    }
  }
  console.log('None of the default passwords worked.');
}

run();

