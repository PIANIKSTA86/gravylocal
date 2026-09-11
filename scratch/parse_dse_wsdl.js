const https = require('https');

https.get('https://ws-dse.facturatech.co/v1/pro/?wsdl', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log(d);
  });
});
