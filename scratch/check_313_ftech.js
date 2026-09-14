const http = require('https');

const ftechUsername = '901428834';
const ftechPasswordHash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb';

const dseNamespace = 'urn:https://ws-dse.facturatech.co/v1/pro/';
const endpointUrl = 'https://ws-dse.facturatech.co/v1/pro/';

// Let's test downloadCUDS with prefix DSE and number 313
const cudsEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${dseNamespace}">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadCUDS soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${ftechPasswordHash}</password>
         <prefix xsi:type="xsd:string">DSE</prefix>
         <number xsi:type="xsd:integer">313</number>
      </urn:downloadCUDS>
   </soapenv:Body>
</soapenv:Envelope>`;

const req = http.request(endpointUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': `${dseNamespace}downloadCUDS`
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("FacturaTech downloadCUDS for 313:\n", data);
  });
});

req.on('error', e => console.error("Error:", e));
req.write(cudsEnvelope);
req.end();
