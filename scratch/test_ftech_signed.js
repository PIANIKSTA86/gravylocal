const crypto = require('node:crypto');
const sqlite3 = require('node:sqlite');
const path = require('node:path');

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
  const prefix = 'FV';
  const folio = '3879';

  console.log('Testing CUFE download for FV-3879...');
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

  const endpointUrl = 'https://ws.facturatech.co/v2/pro/index.php';
  const cufeAction = 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.getCUFEFile';

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'SOAPAction': cufeAction
    },
    body: cufeEnvelope
  });
  console.log('CUFE HTTP Status:', res.status);
  const cufeText = await res.text();
  console.log('CUFE Raw Response:', cufeText);
})();
