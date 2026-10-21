const http = require('http');

const req = http.request('http://127.0.0.1:8088/api/imap/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Invoices found from 8088:', json.invoices?.length);
      if (json.invoices?.length) {
        console.log('Invoice 1 lines:', json.invoices[0].lines?.length);
        console.log('Invoice 1 taxes:', json.invoices[0].taxes?.length);
      }
    } catch (e) {
      console.error(e.message, data);
    }
  });
});

req.write(JSON.stringify({
  host: 'imap.gmail.com',
  port: 993,
  user: 'ventas.gravy@gmail.com',
  pass: 'wlok jiad elst juir',
  tls: true
}));
req.end();
