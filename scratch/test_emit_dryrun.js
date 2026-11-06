const http = require('http');

const payload = JSON.stringify({
  txId: "cni9njlt5wvhoqb",
  dryRun: true
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 8092,
  path: '/api/dian/emit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Response (parsed):', JSON.stringify(parsed, null, 2));
    } catch (_) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(payload);
req.end();

