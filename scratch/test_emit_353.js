const http = require('http');

const data = JSON.stringify({ id: 'wamiehgm0btjfa8' });

const req = http.request({
  hostname: 'localhost',
  port: 8090,
  path: '/api/dian/nomina/emit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE BODY:');
    console.log(body);
  });
});

req.on('error', console.error);
req.write(data);
req.end();
