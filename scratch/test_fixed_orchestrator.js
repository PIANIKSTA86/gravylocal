const crypto = require('node:crypto');
const sqlite3 = require('node:sqlite');
const path = require('node:path');

function extractSoapTag(xml, tagName) {
  if (!xml) return '';
  const regex = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

async function testFixedOrchestratorLogic() {
  const db = new sqlite3.DatabaseSync(path.resolve('pb_data/data.db'));
  const getSetting = (k) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
    return row ? row.value : '';
  };
  
  const ftechUsername = getSetting('ftech_username');
  const ftechPassword = getSetting('ftech_password');
  const isAlreadyHashed = /^[0-9a-f]{64}$/i.test(String(ftechPassword || ''));
  const hashedPassword = isAlreadyHashed ? ftechPassword : crypto.createHash('sha256').update(ftechPassword).digest('hex');
  const transId = '2288a4d993a4cf799116ef8ded4cce59';
  const prefix = 'FV';
  const folio = '3879';

  console.log('1. Checking status via SOAP...');
  const statusEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.documentStatusFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <transaccionID xsi:type="xsd:string">${transId}</transaccionID>
      </urn:FtechAction.documentStatusFile>
   </soapenv:Body>
</soapenv:Envelope>`;

  const endpointUrl = 'https://ws.facturatech.co/v2/pro/index.php';
  const statusAction = 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.documentStatusFile';

  const statusResponse = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': statusAction
    },
    body: statusEnvelope
  });

  const statusXml = await statusResponse.text();
  const statusCode = extractSoapTag(statusXml, 'code');
  const statusVal = extractSoapTag(statusXml, 'status');
  const statusSuccess = extractSoapTag(statusXml, 'success');
  const statusMsg = extractSoapTag(statusXml, 'message') || extractSoapTag(statusXml, 'error') || extractSoapTag(statusXml, 'messageError') || statusSuccess;
  const documentBase64 = extractSoapTag(statusXml, 'documentBase64') || extractSoapTag(statusXml, 'resourceData');

  console.log(`Parsed: code=${statusCode}, status=${statusVal}, msg=${statusMsg}, success=${statusSuccess}`);

  const isSigned = (statusVal && (statusVal.toUpperCase() === 'SIGNED_XML' || statusVal.toUpperCase() === 'AUTHORIZED' || statusVal.toUpperCase() === 'ACCEPTED')) || 
                   (statusMsg && (statusMsg.toLowerCase().includes('signed_xml') || statusMsg.toLowerCase().includes('firmado') || statusMsg.toLowerCase().includes('autorizado'))) || 
                   (statusSuccess && (statusSuccess.toLowerCase().includes('firmado') || statusSuccess.toLowerCase().includes('autorizado') || statusSuccess.toLowerCase().includes('aceptado'))) ||
                   (statusCode === '200' && !!documentBase64) || 
                   (!!documentBase64 && (!statusVal || !statusVal.toUpperCase().includes('ERROR')));

  console.log('isSigned evaluation:', isSigned);

  if (isSigned) {
    console.log('2. Downloading CUFE...');
    const cufeEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.getCUFEFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <prefijo xsi:type="xsd:string">${prefix}</prefijo>
         <folio xsi:type="xsd:string">${folio}</folio>
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
    const cufeXml = await cufeRes.text();
    let cufe = extractSoapTag(cufeXml, 'resourceData');
    console.log('Downloaded CUFE:', cufe);

    console.log('3. Downloading Signed XML...');
    const xmlEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.downloadXMLFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <prefijo xsi:type="xsd:string">${prefix}</prefijo>
         <folio xsi:type="xsd:string">${folio}</folio>
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
    const xmlResData = await xmlRes.text();
    const xmlB64 = extractSoapTag(xmlResData, 'resourceData') || extractSoapTag(xmlResData, 'documentBase64');
    let xmlContent = '';
    if (xmlB64) {
      xmlContent = Buffer.from(xmlB64, 'base64').toString('utf8');
      console.log('Decoded XML Length:', xmlContent.length);
    }

    if (!cufe && xmlContent) {
      const cufeMatch = xmlContent.match(/<[^>]*UUID[^>]*>([a-fA-F0-9]+)<\/[^>]*UUID>/i);
      if (cufeMatch) cufe = cufeMatch[1];
      console.log('CUFE extracted from XML:', cufe);
    }

    console.log('\nFINAL RESULT:');
    console.log({
      status: 'aceptada',
      cufe: cufe,
      dianResponse: 'Documento firmado y aceptado por la DIAN.',
      xmlLength: xmlContent.length
    });
  }
}

testFixedOrchestratorLogic();
