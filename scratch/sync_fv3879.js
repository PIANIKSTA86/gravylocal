const sqlite3 = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// We have the downloaded XML and CUFE from scratch/test_fixed_orchestrator.js
// Let's run the exact fetch and update the SQLite db directly
const crypto = require('node:crypto');

(async () => {
  const db = new sqlite3.DatabaseSync(path.resolve('pb_data/data.db'));
  const getSetting = (k) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
    return row ? row.value : '';
  };
  
  const ftechUsername = getSetting('ftech_username');
  const ftechPassword = getSetting('ftech_password');
  const isAlreadyHashed = /^[0-9a-f]{64}$/i.test(String(ftechPassword || ''));
  const hashedPassword = isAlreadyHashed ? ftechPassword : crypto.createHash('sha256').update(ftechPassword).digest('hex');
  const endpointUrl = 'https://ws.facturatech.co/v2/pro/index.php';
  const prefix = 'FV';
  const folio = '3879';

  function extractSoapTag(xml, tagName) {
    if (!xml) return '';
    const regex = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  // 1. Download CUFE
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
    headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.getCUFEFile' },
    body: cufeEnvelope
  });
  const cufeXml = await cufeRes.text();
  let cufe = extractSoapTag(cufeXml, 'resourceData');

  // 2. Download XML
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
    headers: { 'Content-Type': 'text/xml;charset=UTF-8', 'SOAPAction': 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.downloadXMLFile' },
    body: xmlEnvelope
  });
  const xmlResData = await xmlRes.text();
  const xmlB64 = extractSoapTag(xmlResData, 'resourceData') || extractSoapTag(xmlResData, 'documentBase64');
  let xmlContent = '';
  if (xmlB64) {
    xmlContent = Buffer.from(xmlB64, 'base64').toString('utf8');
  }
  if (!cufe && xmlContent) {
    const cufeMatch = xmlContent.match(/<[^>]*UUID[^>]*>([a-fA-F0-9]+)<\/[^>]*UUID>/i);
    if (cufeMatch) cufe = cufeMatch[1];
  }

  console.log('Ready to update DB with:');
  console.log('  cufe:', cufe);
  console.log('  xmlContent length:', xmlContent.length);

  // Update einvoice_docs in SQLite
  const stmt = db.prepare(`
    UPDATE einvoice_docs 
    SET status = 'aceptada',
        cufe = ?,
        xml_content = ?,
        dian_response = 'Documento firmado y aceptado por la DIAN.',
        zip_filename = 'FV-00003879'
    WHERE id = 'dorw11wig9x80gz'
  `);
  stmt.run(cufe, xmlContent);
  console.log('DB Updated successfully for dorw11wig9x80gz!');

  // Verify
  const updatedDoc = db.prepare("SELECT id, status, cufe, dian_response FROM einvoice_docs WHERE id = 'dorw11wig9x80gz'").get();
  console.log('Updated doc:', updatedDoc);
})();
