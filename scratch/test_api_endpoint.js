// Test /api/gravy/agenda/real-cashflow endpoint
const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 8088, // check active port
  path: '/api/gravy/agenda/real-cashflow?startDate=2026-10-01&endDate=2026-10-31',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.slice(0, 300));
  });
});

req.on('error', (e) => console.log('Port 8088 error, checking 8090...'));
req.end();
