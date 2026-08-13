const https = require('https');

async function sendSoap(action, params) {
  const username = "901428834";
  const password = "8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb";

  let body = `<urn:${action} soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">`;
  body += `<username xsi:type="xsd:string">${username}</username>`;
  body += `<password xsi:type="xsd:string">${password}</password>`;
  for (let k in params) {
    const t = typeof params[k] === 'number' ? 'xsd:integer' : 'xsd:string';
    body += `<${k} xsi:type="${t}">${params[k]}</${k}>`;
  }
  body += `</urn:${action}>`;

  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-nomina.facturatech.co/v1/pro/">
  <soapenv:Header/>
  <soapenv:Body>
    ${body}
  </soapenv:Body>
</soapenv:Envelope>`;

  return new Promise((resolve, reject) => {
    const req = https.request('https://ws-nomina.facturatech.co/v1/pro/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'urn:https://ws-nomina.facturatech.co/v1/pro/#' + action,
        'Content-Length': Buffer.byteLength(envelope)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(envelope);
    req.end();
  });
}

async function run() {
  console.log("--- PROBANDO FtechAction.documentStatus para transactionID 5c3cde757ad729c7824f810eca45a4fce6609b3bd0fdaa5d1b11d7587bde9f2f ---");
  const r1 = await sendSoap('FtechAction.documentStatus', { transaccionID: "5c3cde757ad729c7824f810eca45a4fce6609b3bd0fdaa5d1b11d7587bde9f2f" });
  console.log("Status:", r1.status);
  console.log("Raw response:", r1.data);
}

run().catch(console.error);
