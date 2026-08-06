const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function extractSoapTag(xml, tagName) {
  if (!xml) return '';
  const regex = new RegExp(`<\\s*(?:[a-zA-Z0-9_]+:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\s*\\/(?:[a-zA-Z0-9_]+:)?${tagName}\\s*>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

async function testDownloadFtech() {
  const transaccionID = '7baf32a6e68d0d20fd189957beb3f004';
  const username = '901428834';
  const password = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb';

  const endpointUrl = 'https://ws.facturatech.co/v2/pro/index.php';

  console.log(`Downloading CUFE and Signed XML for transaction ${transaccionID}...`);

  // 1. Get CUFE
  const cufeEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.getCUFEFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password>${password}</password>
         <transaccionID xsi:type="xsd:string">${transaccionID}</transaccionID>
      </urn:FtechAction.getCUFEFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  const cufeRes = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.getCUFEFile'
    },
    body: cufeEnvelope
  });

  const cufeXmlText = await cufeRes.text();
  console.log("CUFE SOAP Response:", cufeXmlText);

  const cufeVal = extractSoapTag(cufeXmlText, 'resourceData') || extractSoapTag(cufeXmlText, 'cufe') || extractSoapTag(cufeXmlText, 'return');
  console.log("\nEXTRACTED CUFE:", cufeVal);

  // 2. Download XML
  const xmlEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXMLFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${username}</username>
         <password>${password}</password>
         <transaccionID xsi:type="xsd:string">${transaccionID}</transaccionID>
      </urn:FtechAction.downloadXMLFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  const xmlRes = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.downloadXMLFile'
    },
    body: xmlEnvelope
  });

  const xmlResText = await xmlRes.text();
  const xmlBase64 = extractSoapTag(xmlResText, 'resourceData') || extractSoapTag(xmlResText, 'return');

  console.log("\nXML Base64 Length:", xmlBase64.length);

  let signedXml = '';
  try {
    signedXml = Buffer.from(xmlBase64, 'base64').toString('utf8');
    console.log("Decoded Signed XML Preview:\n", signedXml.slice(0, 500) + '...');
  } catch (err) {
    console.error("Base64 decode error:", err);
  }

  // Update DB if found
  if (cufeVal || signedXml) {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);
    db.prepare(`
      UPDATE einvoice_docs
      SET cufe = ?,
          xml_content = ?
      WHERE tx_id = 'qx1d9gsts97jp4q'
    `).run(cufeVal, signedXml || '');
    console.log("\nDATABASE SUCCESSFULLY UPDATED WITH SIGNED XML & CUFE FOR FV-00003785!");
  }
}

testDownloadFtech();
