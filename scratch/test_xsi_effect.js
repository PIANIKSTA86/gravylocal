async function testPasswordXsiType() {
  const username = "901428834";
  const password = "8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb";
  const dummyXmlBase64 = Buffer.from("<Invoice><ID>FV-00003785</ID></Invoice>").toString('base64');

  // WITH xsi:type="xsd:string"
  const envWithXsi = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.uploadInvoiceFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password xsi:type="xsd:string">${password}</password>
         <xmlBase64 xsi:type="xsd:string">${dummyXmlBase64}</xmlBase64>
      </urn:FtechAction.uploadInvoiceFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  // WITHOUT xsi:type="xsd:string" (the way hub/orchestrator.js line 996 currently has it)
  const envWithoutXsi = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.uploadInvoiceFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password>${password}</password>
         <xmlBase64 xsi:type="xsd:string">${dummyXmlBase64}</xmlBase64>
      </urn:FtechAction.uploadInvoiceFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  const sendSoap = async (name, body) => {
    const res = await fetch('https://ws.facturatech.co/v2/pro/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.uploadInvoiceFile'
      },
      body: body
    });
    console.log(`=== ${name} ===`);
    const txt = await res.text();
    const errMatch = txt.match(/<error xsi:type="xsd:string">(.*?)<\/error>/);
    console.log("Error returned by Facturatech:", errMatch ? errMatch[1] : txt);
    console.log("---------------------------------------------");
  };

  await sendSoap("1. WITH xsi:type='xsd:string' on password", envWithXsi);
  await sendSoap("2. WITHOUT xsi:type on password", envWithoutXsi);
}

testPasswordXsiType();
