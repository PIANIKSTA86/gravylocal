const http = require('http');

const payload = JSON.stringify({
  xmlContent: '<?xml version="1.0" encoding="UTF-8"?><Invoice><ID>FV-12345</ID><UUID>123456789abcdef</UUID><AccountingSupplierParty><PartyTaxScheme><CompanyID>10239086381</CompanyID></PartyTaxScheme></AccountingSupplierParty></Invoice>',
  filename: 'FV-00003745',
  invoiceData: {
    docId: 'FV-00003745',
    issueDate: '2026-07-17',
    issueTime: '12:00:00',
    cufe: 'da716fc0fbba1285668f5c5a7407461e',
    payableAmount: 100000,
    supplierName: 'Empresa Test',
    supplierNit: '10239086381' // This matches the NIT of empresa_8091 in cache!
  }
});

const options = {
  hostname: '127.0.0.1',
  port: 8088,
  path: '/api/dian/generate-zip-file',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err.message);
});

req.write(payload);
req.end();
