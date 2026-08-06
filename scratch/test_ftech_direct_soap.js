const https = require('https');

async function testDirectSoap() {
  const username = "901428834";
  const password = "8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb";
  const dummyXmlBase64 = Buffer.from("<Invoice><ID>FV-00003785</ID></Invoice>").toString('base64');

  // Test 1: Standard v2 pro envelope with xsi:type
  const env1 = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.uploadInvoiceFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password xsi:type="xsd:string">${password}</password>
         <xmlBase64 xsi:type="xsd:string">${dummyXmlBase64}</xmlBase64>
      </urn:FtechAction.uploadInvoiceFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  // Test 2: Standard v2 pro envelope without FtechAction prefix in method tag
  const env2 = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:uploadInvoiceFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password xsi:type="xsd:string">${password}</password>
         <xmlBase64 xsi:type="xsd:string">${dummyXmlBase64}</xmlBase64>
      </urn:uploadInvoiceFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  const sendSoap = async (url, action, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': action
      },
      body: body
    });
    console.log(`URL: ${url} | Action: ${action}`);
    console.log(`HTTP Status: ${res.status}`);
    console.log(`SOAP Response:\n${await res.text()}\n---------------------------------------------`);
  };

  console.log("=== TEST 1: FtechAction.uploadInvoiceFile with xsi:type ===");
  await sendSoap('https://ws.facturatech.co/v2/pro/index.php', 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.uploadInvoiceFile', env1);

  console.log("=== TEST 2: uploadInvoiceFile ===");
  await sendSoap('https://ws.facturatech.co/v2/pro/index.php', 'urn:https://ws.facturatech.co/v2/pro/#uploadInvoiceFile', env2);
}

testDirectSoap();
