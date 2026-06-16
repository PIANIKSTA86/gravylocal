const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const forge = require('node-forge');
const AdmZip = require('adm-zip');
const https = require('https');
const http = require('http');
const PDFDocument = require('pdfkit');

/**
 * hashFtechPassword: Returns SHA-256 hex of the password.
 * If the password is ALREADY a 64-char hex string (pre-hashed), use it as-is.
 * This prevents double-hashing when the password was saved already hashed.
 */
function hashFtechPassword(ftechPassword) {
  const isAlreadyHashed = /^[0-9a-f]{64}$/i.test(String(ftechPassword || ''));
  if (isAlreadyHashed) return String(ftechPassword);
  return crypto.createHash('sha256').update(ftechPassword).digest('hex');
}

/**
 * writeDocumentLog: Appends details of a transaction to a log file dedicated to the document number.
 */
function writeDocumentLog(documentNumber, action, details) {
  try {
    const logDir = path.resolve(__dirname, '..', 'logs', 'dian');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const sanitized = String(documentNumber || 'unknown').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const logFilePath = path.join(logDir, `${sanitized}_log.txt`);
    
    const timestamp = new Date().toISOString();
    let logContent = `\n==================================================\n`;
    logContent += `TIMESTAMP: ${timestamp}\n`;
    logContent += `ACTION: ${action}\n`;
    logContent += `==================================================\n`;
    
    for (const [key, val] of Object.entries(details)) {
      if (typeof val === 'object') {
        logContent += `${key}:\n${JSON.stringify(val, null, 2)}\n`;
      } else {
        logContent += `${key}: ${val}\n`;
      }
    }
    logContent += `\n`;
    
    fs.appendFileSync(logFilePath, logContent, 'utf8');
    console.log(`[GRAVY LOG] Log written to ${logFilePath}`);
  } catch (err) {
    console.error('[GRAVY LOG] Error writing document log:', err);
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const BASE_DIR = path.resolve(__dirname, '..');
const EMPRESAS_DIR = path.join(BASE_DIR, 'empresas');
const PB_HOOKS_DIR = path.join(BASE_DIR, 'pb_hooks');
const PB_PUBLIC_DIR = path.join(BASE_DIR, 'pb_public');

if (!fs.existsSync(EMPRESAS_DIR)) {
  fs.mkdirSync(EMPRESAS_DIR);
}

// Store active processes
const activeProcesses = {};

app.post('/api/orchestrate/create', async (req, res) => {
  try {
    const { name, nit, color, modules, email, password } = req.body;
    
    // Find next available port starting from 8091
    let port = 8091;
    while (true) {
      const isTaken = Object.values(activeProcesses).some(p => p.port === port);
      if (!isTaken) {
        // Double check if directory exists
        if (!fs.existsSync(path.join(EMPRESAS_DIR, `empresa_${port}`))) {
          break;
        }
      }
      port++;
    }

    const companyDir = path.join(EMPRESAS_DIR, `empresa_${port}`);
    const companyPbData = path.join(companyDir, 'pb_data');
    const companyPbHooks = path.join(companyDir, 'pb_hooks');
    
    fs.mkdirSync(companyDir, { recursive: true });
    fs.mkdirSync(companyPbData, { recursive: true });
    
    // Create isolated pb_hooks for this tenant
    // We copy standard pb_hooks to the new company's pb_hooks dir
    fs.cpSync(PB_HOOKS_DIR, companyPbHooks, { recursive: true });
    
    // Add seed script for the initial user
    const seedScript = `
onBootstrap((e) => {
  e.next();
  try {
    const users = $app.findCollectionByNameOrId("users");
    let existing;
    try { existing = $app.findFirstRecordByData("users", "email", "${email}"); } catch(_) {}
    if (!existing) {
      const rec = new Record(users, {
        email: "${email}",
        role: "admin",
        full_name: "Super Admin",
        active: true
      });
      rec.setPassword("${password}");
      $app.save(rec);
      console.log("[GRAVY ORCHESTRATOR] Seeded initial user ${email} in tenant ${port}");
    }
  } catch(err) {
    console.error("[GRAVY ORCHESTRATOR] Error seeding user:", err);
  }
});
    `;
    fs.writeFileSync(path.join(companyPbHooks, 'zz_seed_user.pb.js'), seedScript);

    // Update settings in setup.pb.js to use the new company name
    const setupScriptPath = path.join(companyPbHooks, 'setup.pb.js');
    if (fs.existsSync(setupScriptPath)) {
      let setupContent = fs.readFileSync(setupScriptPath, 'utf8');
      setupContent = setupContent.replace(/const settingsData = \[([\s\S]*?)\];/, () => {
        return `const settingsData = [
          { key: "company_name", value: "${name}" },
          { key: "company_nit", value: "${nit}" },
          { key: "company_address", value: "Por definir" },
          { key: "company_phone", value: "" },
          { key: "company_email", value: "${email}" },
          { key: "currency", value: "COP" },
          { key: "fiscal_year", value: "2026" },
          { key: "closing_month", value: "12" },
        ];`;
      });
      fs.writeFileSync(setupScriptPath, setupContent);
    }

    // Spawn PocketBase
    const pbExe = path.join(BASE_DIR, 'pocketbase.exe');
    console.log(`Starting PocketBase for ${name} on port ${port}...`);
    
    const pbProcess = spawn(pbExe, [
      'serve',
      `--http=127.0.0.1:${port}`,
      `--dir=${companyPbData}`,
      `--hooksDir=${companyPbHooks}`,
      `--publicDir=${PB_PUBLIC_DIR}`
    ], {
      cwd: companyDir,
      detached: true, // run independent of orchestrator
      stdio: 'ignore'
    });
    
    pbProcess.unref();

    // Register active process
    activeProcesses[port] = { port, pid: pbProcess.pid };
    
    // Add to start.bat so it survives reboots
    const startBatPath = path.join(BASE_DIR, 'start.bat');
    let startBat = fs.readFileSync(startBatPath, 'utf8');
    
    const startCmd = `echo  Iniciando Empresa: ${name} (localhost:${port})...\r\nstart "Gravy Empresa ${port}" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:${port} --dir="%ROOT%empresas\\empresa_${port}\\pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%empresas\\empresa_${port}\\pb_hooks""`;
    
    if (!startBat.includes(`empresa_${port}`)) {
      startBat = startBat.replace('echo.\r\necho  URLs locales:', `${startCmd}\r\n\r\necho.\r\necho  URLs locales:`);
      fs.writeFileSync(startBatPath, startBat);
    }

    res.json({
      success: true,
      port: port,
      url: `http://localhost:${port}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// --- DIAN CRYPTO & SOAP INTEGRATION ---

function formatDn(attributes) {
  return attributes.map(attr => {
    const name = attr.shortName || attr.name || attr.type;
    return `${String(name).toUpperCase()}=${attr.value}`;
  }).reverse().join(', ');
}

function signXmlXades(xmlContent, certBase64, certPassword) {
  try {
    const p12Der = forge.util.decode64(certBase64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certPassword);
    
    let keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
    let certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    if (!Object.keys(keyBags).length) {
      keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    }
    
    const privateKey = Object.values(keyBags)[0][0].key;
    const cert = Object.values(certBags)[0][0].cert;
    
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const certBase64Data = forge.util.encode64(certDer);
    
    const certHashMd = forge.md.sha256.create();
    certHashMd.update(certDer);
    const certHashBase64 = forge.util.encode64(certHashMd.digest().getBytes());
    
    const serialDec = BigInt("0x" + cert.serialNumber).toString(10);
    const issuerAttributes = formatDn(cert.issuer.attributes);
    
    const signingTime = new Date().toISOString();
    const rand = () => Math.random().toString(36).substring(2, 9);
    const sigId = "Signature-" + rand();
    const signedPropertiesId = "SignedProperties-" + rand();
    const keyInfoId = "KeyInfo-" + rand();
    
    const cleanXml = xmlContent.replace(/<ds:Signature[\s\S]*?<\/ds:Signature>/g, "").trim();
    const cleanXmlMd = forge.md.sha256.create();
    cleanXmlMd.update(forge.util.encodeUtf8(cleanXml));
    const docHashBase64 = forge.util.encode64(cleanXmlMd.digest().getBytes());
    
    const keyInfoBlock = `<ds:KeyInfo Id="${keyInfoId}"><ds:X509Data><ds:X509Certificate>${certBase64Data}</ds:X509Certificate></ds:X509Data></ds:KeyInfo>`;
    const keyInfoMd = forge.md.sha256.create();
    keyInfoMd.update(forge.util.encodeUtf8(keyInfoBlock));
    const keyInfoHashBase64 = forge.util.encode64(keyInfoMd.digest().getBytes());
    
    const signedPropertiesBlock = `<xades:SignedProperties Id="${signedPropertiesId}" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"><xades:SignedSignatureProperties><xades:SigningTime>${signingTime}</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${certHashBase64}</ds:DigestValue></xades:CertDigest><xades:IssuerSerial><ds:X509IssuerName>${issuerAttributes}</ds:X509IssuerName><ds:X509SerialNumber>${serialDec}</ds:X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate><xades:SignaturePolicyIdentifier><xades:SignaturePolicyId><xades:SigPolicyId><xades:Identifier>https://facturaelectronica.dian.gov.co/politicadefirma/v2/politicadefirmav2.pdf</xades:Identifier><xades:Description>Política de firma para facturas electrónicas de la República de Colombia</xades:Description></xades:SigPolicyId><xades:SigPolicyHash><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>dMo4g5Yqgmqw67gxJ12k2ZupcoU=</ds:DigestValue></xades:SigPolicyHash></xades:SignaturePolicyId></xades:SignaturePolicyIdentifier></xades:SignedSignatureProperties></xades:SignedProperties>`;
    const signedPropsMd = forge.md.sha256.create();
    signedPropsMd.update(forge.util.encodeUtf8(signedPropertiesBlock));
    const signedPropsHashBase64 = forge.util.encode64(signedPropsMd.digest().getBytes());
    
    const signedInfoBlock = `<ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI=""><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${docHashBase64}</ds:DigestValue></ds:Reference><ds:Reference URI="#${keyInfoId}"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${keyInfoHashBase64}</ds:DigestValue></ds:Reference><ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#${signedPropertiesId}"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${signedPropsHashBase64}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
    
    const signedInfoMd = forge.md.sha256.create();
    signedInfoMd.update(forge.util.encodeUtf8(signedInfoBlock));
    const signatureBytes = privateKey.sign(signedInfoMd);
    const signatureBase64 = forge.util.encode64(signatureBytes);
    
    const signatureBlock = `<ds:Signature Id="${sigId}" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${signedInfoBlock}<ds:SignatureValue>${signatureBase64}</ds:SignatureValue>${keyInfoBlock}<ds:Object><xades:QualifyingProperties Target="#${sigId}" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">${signedPropertiesBlock}</xades:QualifyingProperties></ds:Object></ds:Signature>`;
    
    let signedXml = xmlContent;
    if (xmlContent.includes('<!-- SIGNATURE_PLACEHOLDER -->')) {
      signedXml = xmlContent.replace('<!-- SIGNATURE_PLACEHOLDER -->', signatureBlock);
    } else {
      signedXml = xmlContent.replace('<ext:ExtensionContent/>', `<ext:ExtensionContent>${signatureBlock}</ext:ExtensionContent>`);
      if (signedXml === xmlContent) {
        signedXml = xmlContent.replace('<ext:ExtensionContent>', `<ext:ExtensionContent>${signatureBlock}`);
      }
    }
    return signedXml;
  } catch (err) {
    throw new Error('Error al firmar XML: ' + err.message);
  }
}

function extractSoapTag(xml, tagName) {
  const match = xml.match(new RegExp(`<[^:>]*:?${tagName}[^>]*>([\\s\\S]*?)<\/[^:>]*:?${tagName}>`));
  return match ? match[1].trim() : '';
}

function postSoapRequest(endpointUrl, soapAction, soapEnvelope) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(endpointUrl);
    const options = {
      method: 'POST',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': soapAction,
        'Content-Length': Buffer.byteLength(soapEnvelope)
      }
    };
    
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(soapEnvelope);
    req.end();
  });
}

const crypto = require('crypto');

function computeCufeOrCude({
  documentType,
  documentNumber,
  issueDate,
  issueTime,
  valFac,
  ivaTotal = 0,
  incTotal = 0,
  icaTotal = 0,
  valTot,
  emitterNit,
  adquirerNit,
  clTec = '',
  softwarePin = '',
  dianEnvironment
}) {
  const formatDec = (val) => Number(val || 0).toFixed(2);
  
  const numDoc = documentNumber;
  const fecDoc = issueDate;
  // If time has timezone (like 15:30:00-05:00), we format or use it as is
  let horDoc = issueTime || '00:00:00-05:00';
  
  const valFacStr = formatDec(valFac);
  const valTotStr = formatDec(valTot);
  const ivaStr = formatDec(ivaTotal);
  const incStr = formatDec(incTotal);
  const icaStr = formatDec(icaTotal);
  
  let concatStr = '';
  
  if (documentType === 'Invoice') {
    // CUFE = SHA-384(NumFac + FecFac + HorFac + ValFac + CodImp1 + ValImp1 + CodImp2 + ValImp2 + CodImp3 + ValImp3 + ValTot + NitOFE + NumAdq + ClTec + TipoAmbie)
    concatStr = 
      numDoc + 
      fecDoc + 
      horDoc + 
      valFacStr + 
      '01' + ivaStr + 
      '04' + incStr + 
      '03' + icaStr + 
      valTotStr + 
      emitterNit + 
      adquirerNit + 
      clTec + 
      dianEnvironment;
  } else {
    // CUDE = SHA-384(NumDoc + FecDoc + HorDoc + ValDoc + CodImp1 + ValImp1 + CodImp2 + ValImp2 + CodImp3 + ValImp3 + ValTot + NitOFE + NumAdq + Pin + TipoAmbie)
    concatStr = 
      numDoc + 
      fecDoc + 
      horDoc + 
      valFacStr + 
      '01' + ivaStr + 
      '04' + incStr + 
      '03' + icaStr + 
      valTotStr + 
      emitterNit + 
      adquirerNit + 
      softwarePin + 
      dianEnvironment;
  }
  
  console.log(`[GRAVY DIAN] Concatenación para ${documentType === 'Invoice' ? 'CUFE' : 'CUDE'}: ${concatStr}`);
  
  const sha384 = crypto.createHash('sha384');
  sha384.update(concatStr);
  return sha384.digest('hex');
}

app.post('/api/dian/sign-and-send', async (req, res) => {
  try {
    const {
      xmlContent,
      certBase64,
      certPassword,
      dianEnvironment, // "1" = Prod, "2" = Test
      documentType,    // "Invoice", "CreditNote", "DebitNote", "Nomina", etc.
      documentNumber,
      dianNit,
      soapMethod = 'SendBillSync',
      soapAction = 'http://wcf.dian.colombia/wcf/IDianCustomerServices/SendBillSync',
      // CUFE/CUDE params
      issueDate,
      issueTime,
      valFac,
      ivaTotal = 0,
      incTotal = 0,
      icaTotal = 0,
      valTot,
      adquirerNit,
      clTec = '',
      softwarePin = ''
    } = req.body;

    if (!xmlContent || !documentType || !documentNumber || !dianNit) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (xmlContent, documentType, documentNumber, dianNit).' });
    }

    // Compute CUFE / CUDE
    const key = computeCufeOrCude({
      documentType,
      documentNumber,
      issueDate,
      issueTime,
      valFac,
      ivaTotal,
      incTotal,
      icaTotal,
      valTot,
      emitterNit: dianNit,
      adquirerNit,
      clTec,
      softwarePin,
      dianEnvironment
    });

    // Replace CUFE/CUDE placeholder in XML
    let preparedXml = xmlContent
      .replace('<!-- CUFE_PLACEHOLDER -->', key)
      .replace('<!-- CUDE_PLACEHOLDER -->', key);

    // Determine filenames
    const nitPad = String(dianNit).padStart(10, '0');
    const docName = `doc${nitPad}${documentType}${documentNumber}`;
    const xmlFileName = `${docName}.xml`;
    const zipFileName = `${docName}.zip`;

    // 1. Check if Certificate is provided (Simulated Mode fallback)
    if (!certBase64) {
      console.log(`[GRAVY DIAN] Operando en MODO SIMULADO para ${documentType} ${documentNumber}`);
      
      // Simulate simple signature in XML by replacing placeholder
      const mockSigBlock = `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignatureValue>MOCK_SIGNATURE_VALUE_FOR_TESTING</ds:SignatureValue></ds:Signature>`;
      let signedXml = preparedXml;
      if (preparedXml.includes('<!-- SIGNATURE_PLACEHOLDER -->')) {
        signedXml = preparedXml.replace('<!-- SIGNATURE_PLACEHOLDER -->', mockSigBlock);
      } else {
        signedXml = preparedXml.replace('<ext:ExtensionContent/>', `<ext:ExtensionContent>${mockSigBlock}</ext:ExtensionContent>`);
      }

      // Write document log for simulated direct DIAN
      writeDocumentLog(documentNumber, 'DIAN SIGN-AND-SEND (SIMULATED)', {
        emitterNit: dianNit,
        adquirerNit,
        documentType,
        dianEnvironment,
        simulated: true,
        xmlDocumentKey: key,
        isValid: true,
        statusCode: '0',
        statusMessage: 'Procesado Correctamente. (Modo Simulado Activo)',
        xmlContent: signedXml
      });

      // Return mocked DIAN response
      return res.json({
        success: true,
        simulated: true,
        isValid: true,
        statusCode: '0',
        statusMessage: 'Procesado Correctamente. (Modo Simulado Activo)',
        xmlDocumentKey: key,
        xmlContent: signedXml
      });
    }

    // 2. Real Mode: XML Signature (XAdES-EPES)
    const signedXml = signXmlXades(preparedXml, certBase64, certPassword);

    // 3. Compress UBL XML to ZIP
    const zip = new AdmZip();
    zip.addFile(xmlFileName, Buffer.from(signedXml, 'utf8'));
    const zipBuffer = zip.toBuffer();
    const zipBase64 = zipBuffer.toString('base64');

    // 4. Construct WS-Security & SOAP Envelope
    const rand = () => Math.random().toString(36).substring(2, 9);
    const tsId = rand();
    const certId = rand();
    const bodyId = rand();
    
    const created = new Date().toISOString();
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiration
    
    // Parse cert to get base64 bytes for BinarySecurityToken
    const p12Der = forge.util.decode64(certBase64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certPassword);
    let certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const cert = Object.values(certBags)[0][0].cert;
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const certBase64Data = forge.util.encode64(certDer);
    
    // Prepare blocks to sign
    const timestampBlock = `<wsu:Timestamp wsu:Id="TS-${tsId}" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"><wsu:Created>${created}</wsu:Created><wsu:Expires>${expires}</wsu:Expires></wsu:Timestamp>`;
    
    const bodyBlock = `<soapenv:Body wsu:Id="Body-${bodyId}" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"><wcf:${soapMethod} xmlns:wcf="http://wcf.dian.colombia/wcf"><wcf:fileName>${zipFileName}</wcf:fileName><wcf:contentFile>${zipBase64}</wcf:contentFile></wcf:${soapMethod}></soapenv:Body>`;
    
    // Calculate Digests
    const tsMd = forge.md.sha256.create();
    tsMd.update(forge.util.encodeUtf8(timestampBlock));
    const tsHash = forge.util.encode64(tsMd.digest().getBytes());
    
    const bodyMd = forge.md.sha256.create();
    bodyMd.update(forge.util.encodeUtf8(bodyBlock));
    const bodyHash = forge.util.encode64(bodyMd.digest().getBytes());
    
    // Construct SignedInfo for SOAP
    const soapSignedInfo = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wcf="http://wcf.dian.colombia/wcf"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#TS-${tsId}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${tsHash}</ds:DigestValue></ds:Reference><ds:Reference URI="#Body-${bodyId}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${bodyHash}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
    
    // Sign SOAP SignedInfo
    let keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag });
    if (!Object.keys(keyBags).length) {
      keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    }
    const privateKey = Object.values(keyBags)[0][0].key;
    
    const soapSignedInfoMd = forge.md.sha256.create();
    soapSignedInfoMd.update(forge.util.encodeUtf8(soapSignedInfo));
    const soapSignatureBytes = privateKey.sign(soapSignedInfoMd);
    const soapSignatureValue = forge.util.encode64(soapSignatureBytes);
    
    // Assemble SOAP Signature
    const soapSignatureBlock = `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${soapSignedInfo}<ds:SignatureValue>${soapSignatureValue}</ds:SignatureValue><ds:KeyInfo><wsse:SecurityTokenReference xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><wsse:Reference URI="#Cert-${certId}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"/></wsse:SecurityTokenReference></ds:KeyInfo></ds:Signature>`;
    
    const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wcf="http://wcf.dian.colombia/wcf"><soapenv:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">${timestampBlock}<wsse:BinarySecurityToken wsu:Id="Cert-${certId}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${certBase64Data}</wsse:BinarySecurityToken>${soapSignatureBlock}</wsse:Security></soapenv:Header>${bodyBlock}</soapenv:Envelope>`;

    // 5. Post to DIAN Web Services
    const endpointUrl = dianEnvironment === '1'
      ? 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc'
      : 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc';

    console.log(`[GRAVY DIAN] Enviando SOAP ${soapMethod} a ${endpointUrl}...`);
    const response = await postSoapRequest(endpointUrl, soapAction, soapEnvelope);

    if (response.statusCode !== 200) {
      console.error('[GRAVY DIAN] Error SOAP HTTP Status:', response.statusCode, response.data);
      writeDocumentLog(documentNumber, 'DIAN SIGN-AND-SEND (HTTP ERROR)', {
        emitterNit: dianNit,
        adquirerNit,
        documentType,
        dianEnvironment,
        soapMethod,
        endpointUrl,
        soapAction,
        soapEnvelope,
        httpStatusCode: response.statusCode,
        rawResponse: response.data
      });
      return res.status(500).json({
        success: false,
        statusCode: String(response.statusCode),
        statusMessage: 'Error de comunicación HTTP con la DIAN: ' + response.statusCode,
        rawResponse: response.data
      });
    }

    // 6. Parse DIAN response XML
    const xmlRes = response.data;
    const isValid = extractSoapTag(xmlRes, 'IsValid').toLowerCase() === 'true';
    const statusCode = extractSoapTag(xmlRes, 'StatusCode');
    const statusMessage = extractSoapTag(xmlRes, 'StatusMessage');
    const xmlDocumentKey = extractSoapTag(xmlRes, 'XmlDocumentKey');

    console.log(`[GRAVY DIAN] Respuesta DIAN: isValid=${isValid}, code=${statusCode}, msg=${statusMessage}`);

    writeDocumentLog(documentNumber, 'DIAN SIGN-AND-SEND', {
      emitterNit: dianNit,
      adquirerNit,
      documentType,
      dianEnvironment,
      soapMethod,
      endpointUrl,
      soapAction,
      soapEnvelope,
      httpStatusCode: response.statusCode,
      rawResponse: xmlRes,
      isValid,
      statusCode,
      statusMessage,
      xmlDocumentKey
    });

    res.json({
      success: true,
      isValid,
      statusCode,
      statusMessage,
      xmlDocumentKey,
      xmlContent: signedXml
    });
  } catch (err) {
    console.error('[GRAVY DIAN] Excepción:', err);
    writeDocumentLog(req.body.documentNumber || 'unknown', 'DIAN SIGN-AND-SEND (EXCEPTION)', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: err.message });
  }
});


// --- FACTURATECH SOAP INTEGRATION ---

app.post('/api/facturatech/upload-and-send', async (req, res) => {
  try {
    const {
      xmlContent,
      ftechUsername,
      ftechPassword,
      ftechEnvironment,
      documentType,
      documentNumber,
      prefix,
      folio,
      isPOS
    } = req.body;

    if (!xmlContent || !ftechUsername) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (xmlContent, ftechUsername).' });
    }

    // 1. Simulation Mode if password is empty or starts with "mock"
    if (!ftechPassword || ftechPassword.toLowerCase().startsWith('mock')) {
      console.log(`[GRAVY FTECH] Operando en MODO SIMULADO para ${documentType} ${documentNumber}`);
      const mockTxId = `FTECH_MOCK_TX_${Date.now()}`;
      writeDocumentLog(documentNumber, 'FACTURATECH UPLOAD-AND-SEND (SIMULATED)', {
        provider: 'Facturatech',
        documentType,
        isPOS,
        simulated: true,
        transaccionID: mockTxId,
        status: 'enviada',
        message: 'Documento subido con éxito (Modo Simulado Activo)',
        xmlContent: xmlContent
      });
      return res.json({
        success: true,
        simulated: true,
        transaccionID: mockTxId,
        status: 'enviada',
        message: 'Documento subido con éxito (Modo Simulado Activo)',
        xmlContent: xmlContent
      });
    }

    // 2. Real Mode: Use password — detect if already SHA-256 hashed (64 hex chars)
    const hashedPassword = hashFtechPassword(ftechPassword);
    console.log(`[GRAVY FTECH] Usando password hash (${hashedPassword.length} chars): ${hashedPassword.slice(0,8)}...`);
    const xmlBase64 = Buffer.from(xmlContent, 'utf8').toString('base64');

    // 3. Construct SOAP Envelope & determine Endpoint
    let soapEnvelope = '';
    let endpointUrl = '';
    let soapAction = '';

    if (isPOS) {
      soapEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-pos.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:uploadDocument soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <xmlBase64 xsi:type="xsd:string">${xmlBase64}</xmlBase64>
      </urn:uploadDocument>
   </soapenv:Body>
</soapenv:Envelope>`;

      endpointUrl = 'https://ws-pos.facturatech.co/v1/pro/';
      soapAction = 'urn:https://ws-pos.facturatech.co/v1/pro/#uploadDocument';
    } else {
      soapEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.uploadInvoiceFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <xmlBase64 xsi:type="xsd:string">${xmlBase64}</xmlBase64>
      </urn:FtechAction.uploadInvoiceFile>
   </soapenv:Body>
</soapenv:Envelope>`;

      endpointUrl = ftechEnvironment === '1'
        ? 'https://ws.facturatech.co/v2/pro/index.php'
        : 'https://ws.facturatech.co/21/index.php';

      soapAction = 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.uploadInvoiceFile';
    }

    console.log(`[GRAVY FTECH] Subiendo factura a Facturatech (${endpointUrl})...`);
    const response = await postSoapRequest(endpointUrl, soapAction, soapEnvelope);

    if (response.statusCode !== 200) {
      console.error('[GRAVY FTECH] Error SOAP HTTP Status:', response.statusCode, response.data);
      writeDocumentLog(documentNumber, 'FACTURATECH UPLOAD-AND-SEND (HTTP ERROR)', {
        provider: 'Facturatech',
        documentType,
        isPOS,
        endpointUrl,
        soapAction,
        soapEnvelope,
        httpStatusCode: response.statusCode,
        rawResponse: response.data
      });
      return res.status(500).json({
        success: false,
        message: 'Error de comunicación con Facturatech: ' + response.statusCode,
        error: response.data
      });
    }

    const xmlRes = response.data;
    const code = extractSoapTag(xmlRes, 'code');
    const success = extractSoapTag(xmlRes, 'success').toLowerCase() === 'true';
    const transaccionID = extractSoapTag(xmlRes, 'transaccionID') || extractSoapTag(xmlRes, 'transId') || extractSoapTag(xmlRes, 'transactionID');
    const message = extractSoapTag(xmlRes, 'message') || extractSoapTag(xmlRes, 'error');

    console.log(`[GRAVY FTECH] Respuesta Facturatech: success=${success}, code=${code}, transId=${transaccionID}`);

    writeDocumentLog(documentNumber, 'FACTURATECH UPLOAD-AND-SEND', {
      provider: 'Facturatech',
      documentType,
      isPOS,
      endpointUrl,
      soapAction,
      soapEnvelope,
      httpStatusCode: response.statusCode,
      rawResponse: xmlRes,
      parsedSuccess: success,
      parsedCode: code,
      parsedTransactionID: transaccionID,
      parsedMessage: message
    });

    if (code === '200' || code === '201' || success) {
      res.json({
        success: true,
        transaccionID,
        status: 'enviada',
        message: message || 'Enviado y en procesamiento.'
      });
    } else {
      res.json({
        success: false,
        error: message || `Código de error de Facturatech: ${code}`
      });
    }

  } catch (err) {
    console.error('[GRAVY FTECH] Excepción al subir factura:', err);
    writeDocumentLog(req.body.documentNumber || 'unknown', 'FACTURATECH UPLOAD-AND-SEND (EXCEPTION)', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/facturatech/check-status', async (req, res) => {
  try {
    const {
      transId,
      ftechUsername,
      ftechPassword,
      ftechEnvironment,
      prefix,
      folio,
      isPOS,
      documentNumber
    } = req.body;

    const docNumber = documentNumber || (prefix ? `${prefix}${folio}` : folio);

    if (!transId || !ftechUsername) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (transId, ftechUsername).' });
    }

    // 1. Simulation Mode check
    if (!ftechPassword || ftechPassword.toLowerCase().startsWith('mock')) {
      console.log(`[GRAVY FTECH] Consulta de estado SIMULADA para transId: ${transId}`);
      const mockCufe = 'FTECHMOCKCUFE' + crypto.createHash('sha256').update(prefix + folio).digest('hex').substring(0, 52).toUpperCase();
      const mockSignedXml = `<Invoice><Note>MOCK SIGNED XML VIA FACTURATECH</Note><CUFE>${mockCufe}</CUFE></Invoice>`;
      
      writeDocumentLog(docNumber, 'FACTURATECH CHECK-STATUS (SIMULATED)', {
        provider: 'Facturatech',
        transId,
        prefix,
        folio,
        simulated: true,
        status: 'aceptada',
        cufe: mockCufe,
        xmlContent: mockSignedXml
      });

      return res.json({
        success: true,
        simulated: true,
        status: 'aceptada',
        cufe: mockCufe,
        xmlContent: mockSignedXml,
        message: 'Procesado correctamente por la DIAN (Modo Simulado Activo)'
      });
    }

    // Use password — detect if already SHA-256 hashed
    const hashedPassword = hashFtechPassword(ftechPassword);
    console.log(`[GRAVY FTECH] check-status hash (${hashedPassword.length} chars): ${hashedPassword.slice(0,8)}...`);

    let endpointUrl = '';
    let statusEnvelope = '';
    let statusAction = '';

    if (isPOS) {
      endpointUrl = 'https://ws-pos.facturatech.co/v1/pro/';
      statusEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-pos.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:documentStatus soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <transaccionID xsi:type="xsd:string">${transId}</transaccionID>
      </urn:documentStatus>
   </soapenv:Body>
</soapenv:Envelope>`;
      statusAction = 'urn:https://ws-pos.facturatech.co/v1/pro/#documentStatus';
    } else {
      endpointUrl = ftechEnvironment === '1'
        ? 'https://ws.facturatech.co/v2/pro/index.php'
        : 'https://ws.facturatech.co/21/index.php';
      statusEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:FtechAction.documentStatusFile soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <transaccionID xsi:type="xsd:string">${transId}</transaccionID>
      </urn:FtechAction.documentStatusFile>
   </soapenv:Body>
</soapenv:Envelope>`;
      statusAction = 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.documentStatusFile';
    }

    console.log(`[GRAVY FTECH] Consultando estado de transId ${transId}...`);
    const statusResponse = await postSoapRequest(endpointUrl, statusAction, statusEnvelope);

    if (statusResponse.statusCode !== 200) {
      writeDocumentLog(docNumber, 'FACTURATECH CHECK-STATUS (HTTP ERROR)', {
        provider: 'Facturatech',
        transId,
        prefix,
        folio,
        endpointUrl,
        statusAction,
        statusEnvelope,
        httpStatusCode: statusResponse.statusCode,
        rawResponse: statusResponse.data
      });
      return res.status(500).json({
        success: false,
        message: 'Error al consultar estado HTTP: ' + statusResponse.statusCode,
        error: statusResponse.data
      });
    }

    const statusXml = statusResponse.data;
    const statusCode = extractSoapTag(statusXml, 'code');
    const statusVal = extractSoapTag(statusXml, 'status');
    const statusMsg = extractSoapTag(statusXml, 'message') || extractSoapTag(statusXml, 'error');
    const documentBase64 = extractSoapTag(statusXml, 'documentBase64') || extractSoapTag(statusXml, 'resourceData');

    console.log(`[GRAVY FTECH] Resultado estado: code=${statusCode}, status=${statusVal}, msg=${statusMsg}, hasDocBase64=${!!documentBase64}`);

    // If still processing, return enviada status
    if (statusVal === 'PROCESSING' || (statusCode === '200' && !documentBase64)) {
      writeDocumentLog(docNumber, 'FACTURATECH CHECK-STATUS (PROCESSING)', {
        provider: 'Facturatech',
        transId,
        prefix,
        folio,
        endpointUrl,
        statusEnvelope,
        rawResponse: statusXml,
        parsedCode: statusCode,
        parsedStatus: statusVal,
        parsedMessage: statusMsg
      });
      return res.json({
        success: true,
        status: 'enviada',
        message: statusMsg || 'El documento se encuentra en proceso de firma.'
      });
    }

    // If rejected, return rechazada
    if (statusVal === 'ERROR' || statusCode === '404' || statusCode === '409') {
      writeDocumentLog(docNumber, 'FACTURATECH CHECK-STATUS (REJECTED)', {
        provider: 'Facturatech',
        transId,
        prefix,
        folio,
        endpointUrl,
        statusEnvelope,
        rawResponse: statusXml,
        parsedCode: statusCode,
        parsedStatus: statusVal,
        parsedMessage: statusMsg
      });
      return res.json({
        success: true,
        status: 'rechazada',
        message: statusMsg || 'Documento rechazado por validaciones de Facturatech/DIAN.'
      });
    }

    // If signed/accepted, we proceed to download CUFE & XML
    if (statusVal === 'SIGNED_XML' || statusCode === '201' || (statusCode === '200' && documentBase64)) {
      // 3. Download CUFE
      let cufeEnvelope = '';
      let cufeAction = '';

      if (isPOS) {
        cufeEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-pos.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadCUFE soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <prefix xsi:type="xsd:string">${prefix}</prefix>
         <number xsi:type="xsd:string">${folio}</number>
      </urn:downloadCUFE>
   </soapenv:Body>
</soapenv:Envelope>`;
        cufeAction = 'urn:https://ws-pos.facturatech.co/v1/pro/#downloadCUFE';
      } else {
        cufeEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
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
        cufeAction = 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.getCUFEFile';
      }

      console.log(`[GRAVY FTECH] Descargando CUFE para prefijo=${prefix}, folio=${folio}...`);
      let cufe = '';
      try {
        const cufeResponse = await postSoapRequest(endpointUrl, cufeAction, cufeEnvelope);
        if (cufeResponse.statusCode === 200) {
          cufe = extractSoapTag(cufeResponse.data, 'resourceData');
        }
      } catch (err) {
        console.warn(`[GRAVY FTECH] Error al descargar CUFE por SOAP (se intentará fallback regex):`, err.message);
      }

      // 4. Download signed XML
      let xmlEnvelope = '';
      let xmlAction = '';

      if (isPOS) {
        xmlEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws-pos.facturatech.co/v1/pro/">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <prefix xsi:type="xsd:string">${prefix}</prefix>
         <number xsi:type="xsd:string">${folio}</number>
      </urn:downloadXML>
   </soapenv:Body>
</soapenv:Envelope>`;
        xmlAction = 'urn:https://ws-pos.facturatech.co/v1/pro/#downloadXML';
      } else {
        xmlEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:https://ws.facturatech.co/v2/pro/">
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
        xmlAction = 'urn:https://ws.facturatech.co/v2/pro/#FtechAction.downloadXMLFile';
      }

      console.log(`[GRAVY FTECH] Descargando XML firmado...`);
      let xmlContent = '';
      try {
        const xmlResponse = await postSoapRequest(endpointUrl, xmlAction, xmlEnvelope);
        if (xmlResponse.statusCode === 200) {
          const base64Xml = extractSoapTag(xmlResponse.data, 'documentBase64') || extractSoapTag(xmlResponse.data, 'resourceData');
          if (base64Xml) {
            xmlContent = Buffer.from(base64Xml, 'base64').toString('utf8');
          }
        }
      } catch (err) {
        console.warn(`[GRAVY FTECH] Error al descargar XML por SOAP (se intentará fallback documentBase64):`, err.message);
      }

      // Fallbacks if SOAP download calls returned empty but we already had documentBase64
      if (!xmlContent && documentBase64) {
        console.log(`[GRAVY FTECH] Usando documentBase64 de la respuesta de estado como xmlContent.`);
        xmlContent = Buffer.from(documentBase64, 'base64').toString('utf8');
      }
      if (!cufe && xmlContent) {
        const cufeMatch = xmlContent.match(/<[^>]*UUID[^>]*>([a-fA-F0-9]+)<\/[^>]*UUID>/i);
        if (cufeMatch) {
          cufe = cufeMatch[1];
          console.log(`[GRAVY FTECH] CUFE extraído del XML firmado mediante regex: ${cufe}`);
        }
      }

      writeDocumentLog(docNumber, 'FACTURATECH CHECK-STATUS (ACCEPTED & DOWNLOADED)', {
        provider: 'Facturatech',
        transId,
        prefix,
        folio,
        endpointUrl,
        statusAction,
        statusEnvelope,
        statusResponseXml: statusXml,
        parsedCode: statusCode,
        parsedStatus: statusVal,
        parsedMessage: statusMsg,
        cufeAction,
        cufeEnvelope,
        extractedCufe: cufe,
        xmlAction,
        xmlEnvelope,
        extractedXmlLength: xmlContent ? xmlContent.length : 0
      });

      return res.json({
        success: true,
        status: 'aceptada',
        cufe,
        xmlContent,
        message: statusMsg || 'Documento firmado y aceptado por la DIAN.'
      });
    }

    // Catch all status
    return res.json({
      success: true,
      status: 'enviada',
      message: statusMsg || `Estado desconocido de Facturatech: ${statusVal}`
    });

  } catch (err) {
    console.error('[GRAVY FTECH] Excepción al consultar estado:', err);
    writeDocumentLog(docNumber, 'FACTURATECH CHECK-STATUS (EXCEPTION)', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * fetchQrCode: Fetches QR code image bytes from QR server API.
 * Falls back to null if request fails or times out.
 */
function fetchQrCode(text) {
  return new Promise((resolve) => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
      const req = https.get(url, { timeout: 3000 }, (res) => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    } catch (_) {
      resolve(null);
    }
  });
}

/**
 * generateInvoicePdf: Generates a PDF representation (Representación Gráfica)
 * of an electronic invoice from its UBL XML content.
 * Returns a Promise<Buffer> with the PDF bytes.
 */
function generateInvoicePdf(xmlContent, filename, invoiceData) {
  return new Promise(async (resolve, reject) => {
    try {
      const stripTags = (str) => {
        return String(str || '').replace(/<[^>]*>/g, '').trim();
      };

      // Clean XML of extensions and signatures to avoid false matches on metadata tags
      const cleanXml = String(xmlContent || '')
        .replace(/<(?:[a-zA-Z0-9_-]+:)?UBLExtensions>[\s\S]*?<\/(?:[a-zA-Z0-9_-]+:)?UBLExtensions>/gi, '')
        .replace(/<(?:[a-zA-Z0-9_-]+:)?Signature>[\s\S]*?<\/(?:[a-zA-Z0-9_-]+:)?Signature>/gi, '');

      const getTag = (tag) => {
        const regex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>`, 'i');
        const m = cleanXml.match(regex);
        return m ? stripTags(m[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')) : '';
      };

      const extractField = (party, tag) => {
        const regex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${party}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${party}>`, 'i');
        const partyMatch = cleanXml.match(regex);
        if (!partyMatch) return '';
        const innerXml = partyMatch[1];
        const fieldRegex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>`, 'i');
        const fieldMatch = innerXml.match(fieldRegex);
        return fieldMatch ? stripTags(fieldMatch[1]) : '';
      };

      let docId, issueDate, issueTime, cufe, docTypeLabel;
      let supplierName, supplierNit, supplierAddress, supplierPhone, supplierEmail;
      let customerName, customerNit, customerAddress, customerPhone, customerEmail;
      let payableAmount, taxAmount, lineExtension;
      let lines = [];

      let cajero = 'Admin';
      let paymentMethod = 'EFECTIVO';
      let received = 0;
      let change = 0;
      let companyLogo = '';
      let resolutionName = 'DOCUMENTO EQUIVALENTE DE VENTA';
      let resolutionDesc = '';
      let resolutionNumber = '';
      let resolutionDate = '';
      let resolutionExpiry = '';
      let resolutionRangeFrom = '';
      let resolutionRangeTo = '';
      let resolutionPrefix = '';

      if (invoiceData) {
        docId = invoiceData.docId || filename;
        issueDate = invoiceData.issueDate || '';
        issueTime = invoiceData.issueTime || '';
        cufe = invoiceData.cufe || 'No disponible';
        supplierName = invoiceData.supplierName || '';
        supplierNit = invoiceData.supplierNit || '';
        supplierAddress = invoiceData.supplierAddress || '';
        supplierPhone = invoiceData.supplierPhone || '';
        supplierEmail = invoiceData.supplierEmail || '';
        customerName = invoiceData.customerName || '';
        customerNit = invoiceData.customerNit || '';
        customerAddress = invoiceData.customerAddress || '';
        customerPhone = invoiceData.customerPhone || '';
        customerEmail = invoiceData.customerEmail || '';
        payableAmount = invoiceData.payableAmount || 0;
        
        cajero = invoiceData.cajero || 'Admin';
        paymentMethod = invoiceData.paymentMethod || 'EFECTIVO';
        received = invoiceData.received || 0;
        change = invoiceData.change || 0;
        companyLogo = invoiceData.companyLogo || '';
        resolutionName = invoiceData.resolutionName || 'Factura de Venta POS';
        resolutionDesc = invoiceData.resolutionDesc || '';
        resolutionNumber = invoiceData.resolutionNumber || '';
        resolutionDate = invoiceData.resolutionDate || '';
        resolutionExpiry = invoiceData.resolutionExpiry || '';
        resolutionRangeFrom = invoiceData.resolutionRangeFrom || '';
        resolutionRangeTo = invoiceData.resolutionRangeTo || '';
        resolutionPrefix = invoiceData.resolutionPrefix || '';

        lineExtension = 0;
        taxAmount = 0;
        lines = (invoiceData.lines || []).map(l => {
          const lineSubtotal = (l.qty || 0) * (l.unitPrice || 0);
          lineExtension += lineSubtotal;
          taxAmount += (l.lineTotal || 0) - lineSubtotal;
          return {
            desc: l.desc || '',
            code: l.code || '—',
            qty: l.qty || 0,
            unitPrice: l.unitPrice || 0,
            lineTotal: l.lineTotal || 0,
            ivaRate: l.ivaRate || 0
          };
        });
        
        const isNC = filename.toUpperCase().includes('NC');
        const isND = filename.toUpperCase().includes('ND');
        docTypeLabel = isNC ? 'Nota Crédito' : isND ? 'Nota Débito' : 'Factura Electrónica de Venta';
      } else {
        docId       = getTag('ID') || filename;
        if (docId.includes('://') || docId.length > 50) {
          docId = filename;
        }
        issueDate   = getTag('IssueDate') || '';
        issueTime   = getTag('IssueTime') || '';
        cufe        = getTag('UUID') || 'No disponible';
        
        const docTypeRaw  = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceTypeCode(?:\s[^>]*)?>(.*?)<\/(?:[a-zA-Z0-9_-]+:)?InvoiceTypeCode>/i);
        const docTypeCode = docTypeRaw ? stripTags(docTypeRaw[1].trim()) : '';
        docTypeLabel = docTypeCode === '01' ? 'Factura Electrónica de Venta' : docTypeCode === '91' ? 'Nota Crédito' : docTypeCode === '92' ? 'Nota Débito' : 'Documento Electrónico';

        supplierName = extractField('AccountingSupplierParty', 'RegistrationName') || extractField('AccountingSupplierParty', 'Name');
        supplierNit = extractField('AccountingSupplierParty', 'CompanyID');
        supplierEmail = extractField('AccountingSupplierParty', 'ElectronicMail');
        supplierPhone = extractField('AccountingSupplierParty', 'Telephone');
        supplierAddress = extractField('AccountingSupplierParty', 'Line') || extractField('AccountingSupplierParty', 'AddressLine');

        customerName = extractField('AccountingCustomerParty', 'RegistrationName') || extractField('AccountingCustomerParty', 'Name');
        customerNit = extractField('AccountingCustomerParty', 'CompanyID');
        customerEmail = extractField('AccountingCustomerParty', 'ElectronicMail');
        customerPhone = extractField('AccountingCustomerParty', 'Telephone');
        customerAddress = extractField('AccountingCustomerParty', 'Line') || extractField('AccountingCustomerParty', 'AddressLine');

        const xmlPayableAmount = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?PayableAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?PayableAmount>/i);
        payableAmount = xmlPayableAmount ? parseFloat(stripTags(xmlPayableAmount[1])) : 0;
        
        const xmlTaxAmount = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?TaxTotal>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?TaxAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?TaxAmount>/i);
        taxAmount = xmlTaxAmount ? parseFloat(stripTags(xmlTaxAmount[1])) : 0;
        
        const xmlLineExtension = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?LegalMonetaryTotal>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i);
        lineExtension = xmlLineExtension ? parseFloat(stripTags(xmlLineExtension[1])) : 0;

        const authMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceAuthorization[^>]*(?:Auto-habilitacion)?>([0-9]+)<\/(?:[a-zA-Z0-9_-]+:)?InvoiceAuthorization>/i);
        resolutionNumber = authMatch ? authMatch[1] : '';
        const startMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?StartDate[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?StartDate>/i);
        resolutionDate = startMatch ? stripTags(startMatch[1]) : '';
        const endMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?EndDate[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?EndDate>/i);
        resolutionExpiry = endMatch ? stripTags(endMatch[1]) : '';
        const fromMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?From[^>]*>([0-9]+)<\/(?:[a-zA-Z0-9_-]+:)?From>/i);
        resolutionRangeFrom = fromMatch ? fromMatch[1] : '';
        const toMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?To[^>]*>([0-9]+)<\/(?:[a-zA-Z0-9_-]+:)?To>/i);
        resolutionRangeTo = toMatch ? toMatch[1] : '';
        const prefixMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?Prefix[^>]*>([^<]*)<\/(?:[a-zA-Z0-9_-]+:)?Prefix>/i);
        resolutionPrefix = prefixMatch ? stripTags(prefixMatch[1]) : '';

        const linePattern = /<(?:[a-zA-Z0-9_-]+:)?(?:Invoice|CreditNote|DebitNote)Line>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?(?:Invoice|CreditNote|DebitNote)Line>/gi;
        let lineMatch;
        while ((lineMatch = linePattern.exec(cleanXml)) !== null) {
          const lineXml = lineMatch[1];
          const desc = stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?Description>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?Description>/i) || [])[1] || '');
          const qty = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity>/i) || [])[1] || '0'));
          const unitPrice = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?PriceAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?PriceAmount>/i) || [])[1] || '0'));
          const lineTotal = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\s[^>]?>)?([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i) || [])[1] || '0'));
          const ivaRate = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?Percent>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?Percent>/i) || [])[1] || '0'));
          
          const codeMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?(?:SellersItemIdentification|StandardItemIdentification|ModelName)>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?ID[^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?ID>/i);
          const code = codeMatch ? stripTags(codeMatch[1]) : '—';
          
          if (desc) lines.push({ desc, code, qty, unitPrice, lineTotal, ivaRate });
        }
      }

      const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n || 0);

      // --- Build PDF ---
      const isPosReceipt = xmlContent.includes('PuntoVenta') || filename.toUpperCase().includes('POS') || xmlContent.includes('languageLocaleID="PuntoVenta"');
      
      let doc;
      if (isPosReceipt) {
        // Group taxes by rate to compute base and tax totals
        const taxGroups = {};
        lines.forEach(line => {
          const rate = line.ivaRate || 0;
          if (!taxGroups[rate]) {
            taxGroups[rate] = { base: 0, tax: 0 };
          }
          const lineSubtotal = (line.qty || 0) * (line.unitPrice || 0);
          taxGroups[rate].base += lineSubtotal;
          taxGroups[rate].tax += (line.lineTotal || 0) - lineSubtotal;
        });

        // Compute page height dynamically
        const itemHeight = 35;
        const taxGroupsCount = Object.keys(taxGroups).length;
        const baseHeight = 520 + (taxGroupsCount * 10) + (companyLogo ? 55 : 0);
        const pageHeight = baseHeight + (lines.length * itemHeight);
        
        doc = new PDFDocument({ margin: 10, size: [226, pageHeight] });
      } else {
        doc = new PDFDocument({ margin: 40, size: 'LETTER' });
      }

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      if (isPosReceipt) {
        const W = 206; // 226 - 20 (margins)
        const L = 10;
        let y = 10;

        // --- Logo ---
        if (companyLogo) {
          try {
            const base64Data = companyLogo.replace(/^data:image\/\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            doc.image(logoBuffer, L + (W - 50) / 2, y, { width: 50 });
            y += 55;
          } catch (logoErr) {
            console.warn("[ORCHESTRATOR] Error rendering company logo:", logoErr.message);
          }
        }

        // --- Company info (Supplier) ---
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10)
           .text(supplierName || 'Razón Social Emisor', L, y, { width: W, align: 'center' });
        y += 14;
        
        doc.font('Helvetica').fontSize(8.5)
           .text(`NIT: ${supplierNit}`, L, y, { width: W, align: 'center' });
        y += 11;
        if (supplierAddress) {
          doc.text(supplierAddress, L, y, { width: W, align: 'center' });
          y += 11;
        }
        if (supplierPhone) {
          doc.text(`Teléfono: ${supplierPhone}`, L, y, { width: W, align: 'center' });
          y += 12;
        }

        // Solid Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // Document Info
        doc.font('Helvetica-Bold').fontSize(9)
           .text(docTypeLabel.toUpperCase(), L, y, { width: W, align: 'center' });
        y += 11;
        doc.text(docId, L, y, { width: W, align: 'center' });
        y += 12;

        // Solid Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- Transaction Info ---
        doc.font('Helvetica').fontSize(8.5)
           .text(`Fecha: ${issueDate} ${issueTime.slice(0, 5)}`, L, y)
           .text(`Cajero: ${cajero}`, L, y + 11)
           .text(`Cliente: ${customerName}`, L, y + 22)
           .text(`NIT/C.C: ${customerNit}`, L, y + 33);
        y += 46;

        // Solid Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- Items Table Header ---
        doc.font('Helvetica-Bold').fontSize(8.5);
        doc.text('DETALLE', L, y)
           .text('TOTAL', L, y, { width: W, align: 'right' });
        y += 11;

        // Dashed Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).dash(2, { space: 2 }).stroke().undash();
        y += 6;

        // --- Items Table Rows ---
        lines.forEach(line => {
          // Description line
          doc.font('Helvetica-Bold').fontSize(8.5)
             .text(line.desc, L, y, { width: W });
          y += 11;
          
          // Code & IVA line
          const codeVal = line.code || '—';
          doc.font('Helvetica').fontSize(7.5).fillColor('#4B5563')
             .text(`Cód: ${codeVal} | IVA: ${line.ivaRate}%`, L, y);
          y += 10;

          // Qty x Price and Line Total
          const qtyText = `${line.qty} UND x ${fmt(line.unitPrice)}`;
          doc.font('Helvetica').fontSize(8.5).fillColor('#000000')
             .text(qtyText, L, y);
          doc.font('Helvetica-Bold')
             .text(fmt(line.lineTotal), L, y, { width: W, align: 'right' });
          y += 14;
        });

        // Dashed Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).dash(2, { space: 2 }).stroke().undash();
        y += 6;

        // --- Totals ---
        const drawTotalLine = (label, value, isBold = false) => {
          doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(isBold ? 9.5 : 8.5)
             .text(label, L, y)
             .text(value, L, y, { width: W, align: 'right' });
          y += isBold ? 12 : 11;
        };
        drawTotalLine('Subtotal:', fmt(lineExtension));
        drawTotalLine('IVA:', fmt(taxAmount));
        drawTotalLine('TOTAL:', fmt(payableAmount), true);
        
        // Dashed Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).dash(2, { space: 2 }).stroke().undash();
        y += 6;

        // --- Tax Breakdown ---
        const taxGroups = {};
        lines.forEach(line => {
          const rate = line.ivaRate || 0;
          if (!taxGroups[rate]) {
            taxGroups[rate] = { base: 0, tax: 0 };
          }
          const lineSubtotal = (line.qty || 0) * (line.unitPrice || 0);
          taxGroups[rate].base += lineSubtotal;
          taxGroups[rate].tax += (line.lineTotal || 0) - lineSubtotal;
        });

        doc.font('Helvetica-Bold').fontSize(8)
           .text('DESGLOSE DE IMPUESTOS (IVA)', L, y, { width: W, align: 'center' });
        y += 11;
        doc.font('Helvetica-Bold').fontSize(7.5)
           .text('Tarifa', L, y)
           .text('Base', L + W * 0.35, y, { width: W * 0.3, align: 'right' })
           .text('Impuesto', L + W * 0.65, y, { width: W * 0.35, align: 'right' });
        y += 10;
        doc.font('Helvetica').fontSize(7.5);
        for (const rate of Object.keys(taxGroups).map(Number).sort((a,b)=>a-b)) {
          const group = taxGroups[rate];
          doc.text(`IVA ${rate}%`, L, y)
             .text(fmt(group.base), L + W * 0.35, y, { width: W * 0.3, align: 'right' })
             .text(fmt(group.tax), L + W * 0.65, y, { width: W * 0.35, align: 'right' });
          y += 10;
        }

        // Solid Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- Payment Details ---
        doc.font('Helvetica').fontSize(8.5)
           .text('Método Pago:', L, y)
           .text(paymentMethod, L, y, { width: W, align: 'right' });
        y += 11;
        doc.text('Recibido:', L, y)
           .text(fmt(received), L, y, { width: W, align: 'right' });
        y += 11;
        doc.font('Helvetica-Bold')
           .text('Vueltas:', L, y)
           .text(fmt(change), L, y, { width: W, align: 'right' });
        y += 14;

        // Solid Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- Resolution and legal info ---
        doc.font('Helvetica-Bold').fontSize(8)
           .text(resolutionName, L, y, { width: W, align: 'center' });
        y += 11;
        if (resolutionNumber) {
          doc.font('Helvetica').fontSize(7).fillColor('#4B5563')
             .text(`Autorización Facturación POS No. ${resolutionNumber}`, L, y, { width: W, align: 'center' });
          y += 10;
          doc.text(`Fecha Res: ${resolutionDate} | Vigencia hasta: ${resolutionExpiry}`, L, y, { width: W, align: 'center' });
          y += 10;
          const rPrefix = resolutionPrefix ? resolutionPrefix + ' ' : '';
          doc.text(`Rango: ${rPrefix}${resolutionRangeFrom} al ${rPrefix}${resolutionRangeTo}`, L, y, { width: W, align: 'center' });
          y += 10;
        }
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563')
           .text('Software: GRAVY POS | Fabricante: JULIAN ESPINOSA ARRUBLA,', L, y, { width: W, align: 'center' });
        y += 10;
        doc.text('NIT. 1130636393-2', L, y, { width: W, align: 'center' });
        y += 12;

        // Solid Line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- QR Code ---
        let qrBuffer = null;
        if (cufe && cufe !== 'No disponible') {
          const qrUrlText = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe}`;
          qrBuffer = await fetchQrCode(qrUrlText);
        } else {
          const qrUrlText = `Num: ${docId} | Nit: ${supplierNit} | Cliente: ${customerNit} | Total: ${payableAmount} | CUFE: Temporal`;
          qrBuffer = await fetchQrCode(qrUrlText);
        }

        if (qrBuffer) {
          try {
            doc.image(qrBuffer, L + (W - 100) / 2, y, { width: 100, height: 100 });
            y += 105;
          } catch (qrErr) {
            console.warn("[ORCHESTRATOR] Error rendering QR code image:", qrErr.message);
          }
        }

        // --- CUFE Text ---
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7.5)
           .text('CUFE:', L, y, { width: W, align: 'center' });
        y += 10;
        doc.font('Helvetica').fontSize(6)
            .text(cufe, L, y, { width: W, align: 'center' });

        doc.end();
      } else {
        const BLUE  = '#1A4B8C';
        const ORANGE = '#E87D1E';
        const GRAY  = '#6B7280';
        const LGRAY = '#F3F4F6';
        const TEXT  = '#111827';
        const W     = doc.page.width - 80; // usable width
        const L     = 40; // left margin

        // ── HEADER BAR ──────────────────────────────────────────────
        doc.rect(L, 40, W, 70).fill(BLUE);
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16)
           .text(docTypeLabel.toUpperCase(), L + 12, 52, { width: W - 120 });
        doc.font('Helvetica').fontSize(10)
           .text(`No. ${docId}`, L + 12, 72, { width: W - 120 });

        // Date top-right
        doc.font('Helvetica-Bold').fontSize(9)
           .text('FECHA', L + W - 110, 50, { width: 100, align: 'right' })
           .font('Helvetica').text(`${issueDate}`, L + W - 110, 62, { width: 100, align: 'right' })
           .text(`${issueTime.slice(0,8)}`, L + W - 110, 74, { width: 100, align: 'right' });

        // ── SUPPLIER ────────────────────────────────────────────────
        let y = 120;
        doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(9)
           .text('EMISOR', L, y);
        y += 14;
        doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(10)
           .text(supplierName || 'Razón Social del Emisor', L, y, { width: W * 0.55 });
        y += 13;
        doc.font('Helvetica').fontSize(8).fillColor(GRAY)
           .text(`NIT: ${supplierNit}`, L, y)
           .text(`Tel: ${supplierPhone}  |  Email: ${supplierEmail}`, L, y + 10)
           .text(`Dirección: ${supplierAddress}`, L, y + 20);

        // ── CUSTOMER ────────────────────────────────────────────────
        const cx = L + W * 0.58;
        y = 120;
        doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(9)
           .text('RECEPTOR / CLIENTE', cx, y);
        y += 14;
        doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(10)
           .text(customerName || 'Consumidor Final', cx, y, { width: W * 0.42 });
        y += 13;
        doc.font('Helvetica').fontSize(8).fillColor(GRAY)
           .text(`NIT / CC: ${customerNit}`, cx, y)
           .text(`Email: ${customerEmail}`, cx, y + 10)
           .text(`Dirección: ${customerAddress}`, cx, y + 20);

        // ── DIVIDER ─────────────────────────────────────────────────
        y = 190;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor(ORANGE).lineWidth(1.5).stroke();
        y += 10;

        // ── LINES TABLE HEADER ───────────────────────────────────────
        doc.rect(L, y, W, 18).fill(LGRAY);
        doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(8);
        const cols = { desc: L + 4, qty: L + W * 0.52, price: L + W * 0.63, iva: L + W * 0.76, total: L + W * 0.87 };
        doc.text('DESCRIPCIÓN', cols.desc, y + 5, { width: W * 0.50 })
           .text('CANT.', cols.qty, y + 5, { width: 50, align: 'right' })
           .text('V. UNIT.', cols.price, y + 5, { width: 60, align: 'right' })
           .text('IVA%', cols.iva, y + 5, { width: 40, align: 'right' })
           .text('SUBTOTAL', cols.total, y + 5, { width: 60, align: 'right' });
        y += 20;

        // ── LINES ────────────────────────────────────────────────────
        doc.font('Helvetica').fontSize(8).fillColor(TEXT);
        lines.forEach((line, idx) => {
          if (y > doc.page.height - 120) { doc.addPage(); y = 40; }
          if (idx % 2 === 1) doc.rect(L, y - 2, W, 15).fill('#F9FAFB');
          doc.fillColor(TEXT)
             .text(line.desc, cols.desc, y, { width: W * 0.50 })
             .text(String(line.qty), cols.qty, y, { width: 50, align: 'right' })
             .text(fmt(line.unitPrice), cols.price, y, { width: 60, align: 'right' })
             .text(`${line.ivaRate}%`, cols.iva, y, { width: 40, align: 'right' })
             .text(fmt(line.lineTotal), cols.total, y, { width: 60, align: 'right' });
          y += 15;
        });

        // ── TOTALS ───────────────────────────────────────────────────
        y += 6;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        y += 8;
        const tw = 200;
        const tx = L + W - tw;
        const addTotal = (label, value, bold = false, highlight = false) => {
          if (highlight) {
            doc.rect(tx - 8, y - 3, tw + 8, 18).fill(BLUE);
            doc.fillColor('#FFFFFF').font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 8);
          } else {
            doc.fillColor(GRAY).font('Helvetica').fontSize(8);
          }
          doc.text(label, tx, y, { width: tw * 0.55 });
          doc.fillColor(highlight ? '#FFFFFF' : TEXT)
             .font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 8)
             .text(value, tx + tw * 0.55, y, { width: tw * 0.45, align: 'right' });
          y += bold ? 20 : 14;
        };
        addTotal('Subtotal (sin IVA):', fmt(lineExtension));
        addTotal('IVA:', fmt(taxAmount));
        addTotal('TOTAL A PAGAR:', fmt(payableAmount), true, true);

        // ── CUFE BOX ─────────────────────────────────────────────────
        y += 10;
        doc.rect(L, y, W, 42).fill('#F0F4FF');
        doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(8)
           .text('CUFE / CUDE (Código Único de Factura Electrónica):', L + 6, y + 6);
        doc.fillColor(TEXT).font('Helvetica').fontSize(6.5)
           .text(cufe, L + 6, y + 18, { width: W - 12 });
        y += 50;

        // ── LEGAL FOOTER ─────────────────────────────────────────────
        doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
           .text(
             `Este documento es la representación gráfica de una Factura Electrónica de Venta generada conforme al Decreto 358 de 2020 y la Resolución 000042 de 2020 de la DIAN. La validez fiscal recae exclusivamente sobre el archivo XML firmado digitalmente. Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}.`,
             L, y, { width: W, align: 'justify' }
           );

        // ── ORANGE BOTTOM BAR ────────────────────────────────────────
        const pageH = doc.page.height;
        doc.rect(L, pageH - 28, W, 6).fill(ORANGE);
        doc.fillColor(GRAY).font('Helvetica').fontSize(6)
           .text('Documento generado por GRAVY ERP | Facturación Electrónica DIAN', L, pageH - 18, { width: W, align: 'center' });

        doc.end();
      }
    } catch (err) {
      reject(err);
    }
  });
}

app.post('/api/dian/download-zip', async (req, res) => {
  try {
    const { xmlContent, filename, invoiceData } = req.body;
    if (!xmlContent || !filename) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (xmlContent, filename).' });
    }

    // Generate PDF representation
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePdf(xmlContent, filename, invoiceData);
      console.log(`[GRAVY ORCHESTRATOR] PDF generado: ${pdfBuffer.length} bytes para ${filename}`);
    } catch (pdfErr) {
      console.warn(`[GRAVY ORCHESTRATOR] No se pudo generar PDF (se incluirá solo XML): ${pdfErr.message}`);
    }

    const zip = new AdmZip();
    zip.addFile(`${filename}.xml`, Buffer.from(xmlContent, 'utf-8'));
    if (pdfBuffer) {
      zip.addFile(`${filename}.pdf`, pdfBuffer);
    }

    const zipBuffer = zip.toBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.zip"`);
    res.send(zipBuffer);
  } catch (err) {
    console.error('[GRAVY ORCHESTRATOR] Error al generar ZIP:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dian/generate-zip-file', async (req, res) => {
  try {
    const { xmlContent, filename, invoiceData } = req.body;
    if (!xmlContent || !filename) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (xmlContent, filename).' });
    }

    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePdf(xmlContent, filename, invoiceData);
      console.log(`[GRAVY ORCHESTRATOR] PDF generado para ZIP de correo: ${pdfBuffer.length} bytes para ${filename}`);
    } catch (pdfErr) {
      console.warn(`[GRAVY ORCHESTRATOR] No se pudo generar PDF para ZIP de correo (se incluirá solo XML): ${pdfErr.message}`);
    }

    const zip = new AdmZip();
    zip.addFile(`${filename}.xml`, Buffer.from(xmlContent, 'utf-8'));
    if (pdfBuffer) {
      zip.addFile(`${filename}.pdf`, pdfBuffer);
    }

    const zipBuffer = zip.toBuffer();
    const tempDir = path.resolve(__dirname, '..', 'temp_zips');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const absoluteZipPath = path.join(tempDir, `${filename}.zip`);
    fs.writeFileSync(absoluteZipPath, zipBuffer);
    
    console.log(`[GRAVY ORCHESTRATOR] ZIP temporal de correo guardado en: ${absoluteZipPath}`);
    res.json({ success: true, zipPath: absoluteZipPath });
  } catch (err) {
    console.error('[GRAVY ORCHESTRATOR] Error al generar archivo ZIP de correo:', err);
    res.status(500).json({ error: err.message });
  }
});

const ORCHESTRATOR_PORT = 8088;
app.listen(ORCHESTRATOR_PORT, () => {
  console.log(`GRAVY Orchestrator running on port ${ORCHESTRATOR_PORT}`);
});

