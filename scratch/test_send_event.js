const http = require('http');

const payload = JSON.stringify({
  docId: 'eazp133iwyoe0pv',
  code: '030',
  notes: 'Acuse de recibo de prueba',
  notifySupplier: false
});

const req = http.request('http://127.0.0.1:8090/api/radian/send-event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', err => console.error('Error:', err.message));
req.write(payload);
req.end();

