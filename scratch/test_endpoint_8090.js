const http = require('http');

// Authenticate as admin or user
const authData = JSON.stringify({ identity: 'admin@gravy.com', password: 'password123' }); // or read token

const req = http.request({
  hostname: '127.0.0.1',
  port: 8090,
  path: '/api/gravy/agenda/real-cashflow?startDate=2026-10-01&endDate=2026-10-31',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Response:', data);
  });
});
req.on('error', (e) => console.error('Req error:', e));
req.end();
