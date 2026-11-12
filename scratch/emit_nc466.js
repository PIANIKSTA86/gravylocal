const http = require('http');

const postData = JSON.stringify({
  tx_id: 'mub35nz2gysbzuf'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 8090,
  path: '/api/dian/emit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    try {
      console.log('RESPONSE:', JSON.stringify(JSON.parse(data), null, 2));
    } catch(e) {
      console.log('RAW RESPONSE:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();

