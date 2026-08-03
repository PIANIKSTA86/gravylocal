const http = require('http');

const data = JSON.stringify({
  txTypeId: 'dummy_invalid_id',
  newStartConsecutive: 1
});

const req = http.request({
  hostname: 'localhost',
  port: 8090,
  path: '/api/gravy/renumber-transactions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.on('error', (err) => {
  console.error("HTTP Request Error:", err.message);
});

req.write(data);
req.end();
