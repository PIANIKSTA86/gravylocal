const https = require('https');

const username = '901428834';
const passwordHash = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb'; // Already SHA-256 hashed
const endpointUrl = 'https://ws.facturatech.co/v2/pro/index.php';

function postSoapRequest(url, action, envelope) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': action,
        'Content-Length': Buffer.byteLength(envelope)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(envelope);
    req.end();
  });
}

function makeCufeEnvelope(prefijo, folio) {
  return `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.getCUFEFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password xsi:type="xsd:string">${passwordHash}</password>
         <prefijo xsi:type="xsd:string">${prefijo}</prefijo>
         <folio xsi:type="xsd:string">${folio}</folio>
      </urn:FtechAction.getCUFEFile>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function makeXmlEnvelope(prefijo, folio) {
  return `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXMLFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password xsi:type="xsd:string">${passwordHash}</password>
         <prefijo xsi:type="xsd:string">${prefijo}</prefijo>
         <folio xsi:type="xsd:string">${folio}</folio>
      </urn:FtechAction.downloadXMLFile>
   </soapenv:Body>
</soapenv:Envelope>`;
}

async function run() {
  const folios = ['00003734', '3734'];
  for (const folio of folios) {
    console.log(`\n===================================`);
    console.log(`TESTING FOLIO: "${folio}"`);
    console.log(`===================================`);

    // 1. Test getCUFEFile
    console.log("Calling FtechAction.getCUFEFile...");
    const cufeEnvelope = makeCufeEnvelope('FV', folio);
    const cufeRes = await postSoapRequest(endpointUrl, 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.getCUFEFile', cufeEnvelope);
    console.log("CUFE SOAP Status:", cufeRes.statusCode);
    console.log("CUFE SOAP Data length:", cufeRes.data.length);
    console.log("CUFE SOAP Snippet:", cufeRes.data.substring(0, 500));

    // 2. Test downloadXMLFile
    console.log("Calling FtechAction.downloadXMLFile...");
    const xmlEnvelope = makeXmlEnvelope('FV', folio);
    const xmlRes = await postSoapRequest(endpointUrl, 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.downloadXMLFile', xmlEnvelope);
    console.log("XML SOAP Status:", xmlRes.statusCode);
    console.log("XML SOAP Data length:", xmlRes.data.length);
    console.log("XML SOAP Snippet:", xmlRes.data.substring(0, 500));
  }
}

run();
