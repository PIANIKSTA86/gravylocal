const http = require('http');

const req = http.request('http://127.0.0.1:8092/api/radian/sync-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Response body:', data);
  });
});

req.on('error', err => {
  console.error('Request error:', err);
});

req.write(JSON.stringify({ limit: 10 }));
req.end();
