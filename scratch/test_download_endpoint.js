const http = require('http');

const data = JSON.stringify({ id: 'a2kdcr7qzlf2vau' });

const req = http.request({
  hostname: 'localhost',
  port: 8090,
  path: '/api/dian/nomina/download-xml',
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
    const json = JSON.parse(body);
    console.log('Success:', json.success);
    console.log('Is Signed DIAN:', json.isSigned);
    console.log('Filename:', json.filename);
    if (json.xml) {
      console.log('Signed XML / AttachedDocument DIAN snippet (first 400 chars):');
      console.log(json.xml.slice(0, 400));
    }
  });
});

req.on('error', console.error);
req.write(data);
req.end();
