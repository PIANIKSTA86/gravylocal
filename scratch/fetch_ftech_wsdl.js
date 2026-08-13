const https = require('https');

https.get('https://ws-nomina.facturatech.co/v1/pro/index.php?wsdl', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(data));
}).on('error', console.error);
