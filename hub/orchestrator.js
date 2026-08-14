const express = require('express');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const forge = require('node-forge');
const AdmZip = require('adm-zip');
const https = require('https');
const http = require('http');
const PDFDocument = require('pdfkit');
const backupService = require('./backup-service');
const crypto = require('crypto');

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

/**
 * writeCrashLog: Persists fatal errors (uncaught exceptions / unhandled promise
 * rejections) to logs/dian/orchestrator_crash.log so we can diagnose crashes
 * that happen unattended on a server (no visible console).
 */
function writeCrashLog(kind, err) {
  try {
    const logDir = path.resolve(__dirname, '..', 'logs', 'dian');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'orchestrator_crash.log');
    const timestamp = new Date().toISOString();
    const message = err && err.stack ? err.stack : String(err);
    const entry = `\n==================================================\nTIMESTAMP: ${timestamp}\nKIND: ${kind}\n${message}\n`;
    fs.appendFileSync(logFilePath, entry, 'utf8');
  } catch (logErr) {
    console.error('[GRAVY ORCHESTRATOR] No se pudo escribir el log de crash:', logErr);
  }
  console.error(`[GRAVY ORCHESTRATOR] ${kind}:`, err);
}

// IMPORTANT: Without these handlers, ANY unhandled promise rejection or
// synchronous throw outside a try/catch (e.g. inside a callback, timer, or
// stream event) terminates the entire Node.js process by default on Node
// >=15. That takes down the whole orchestrator (port 8088) on a single
// failed SOAP/firma request, even though the same code may only log a
// warning on an older local Node install. Keep the process alive whenever
// it's safe to do so, and always leave a trace of what happened.
process.on('unhandledRejection', (reason) => {
  writeCrashLog('UNHANDLED_REJECTION', reason);
});

process.on('uncaughtException', (err) => {
  writeCrashLog('UNCAUGHT_EXCEPTION', err);
  // Do not exit: keep the HTTP server alive so other tenants/requests are
  // unaffected. If the error left internal state corrupted, prefer a
  // supervised restart (PM2/NSSM) over an abrupt process.exit() here.
});

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
const PB_MIGRATIONS_DIR = path.join(BASE_DIR, 'pb_migrations');

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

    // Copy base database schema (data.db) from the main instance if it exists
    const baseDbPath = path.join(BASE_DIR, 'pb_data', 'data.db');
    if (fs.existsSync(baseDbPath)) {
      console.log(`[ORCHESTRATOR] Copying template database schema from ${baseDbPath} to ${path.join(companyPbData, 'data.db')}`);
      fs.copyFileSync(baseDbPath, path.join(companyPbData, 'data.db'));
    }
    const baseAuxDbPath = path.join(BASE_DIR, 'pb_data', 'auxiliary.db');
    if (fs.existsSync(baseAuxDbPath)) {
      fs.copyFileSync(baseAuxDbPath, path.join(companyPbData, 'auxiliary.db'));
    }
    
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

    // Add clean on first run script
    const cleanScript = `
onBootstrap((e) => {
  e.next();
  try {
    let initialized = false;
    try {
      const rec = $app.findFirstRecordByData("settings", "key", "tenant_initialized");
      if (rec && rec.getString("value") === "1") {
        initialized = true;
      }
    } catch (_) {}

    if (initialized) {
      return;
    }

    console.log("[GRAVY TENANT INIT] First run detected. Cleaning template data and setting company details...");

    const COLLECTIONS_TO_CLEAR = [
      'import_lines',
      'imports',
      'logistica_delivery_lines',
      'logistica_deliveries',
      'crm_interactions',
      'crm_deals',
      'inmo_property_history',
      'inmo_invoice_lines',
      'inmo_invoices',
      'inmo_contracts',
      'inmo_properties',
      'ph_individual_charges',
      'ph_pqrs',
      'ph_reservations',
      'ph_invoice_lines',
      'ph_invoices',
      'appointments',
      'sales_reservation_lines',
      'sales_reservations',
      'sales_order_lines',
      'sales_orders',
      'einvoice_docs',
      'invoice_lines',
      'invoices',
      'purchase_invoice_lines',
      'purchase_invoices',
      'inventory_stock',
      'inventory_movement_lines',
      'inventory_movements',
      'payroll_lines',
      'bank_movements',
      'tx_lines',
      'transactions',
      'pos_shifts',
      'product_components',
      'products',
      'pets',
      'third_parties',
      'audit_log',
      'licenses',
      'niif_assets',
      'niif_asset_categories',
      'niif_asset_events',
      'niif_asset_inventories'
    ];

    $app.runInTransaction((txApp) => {
      // 1. Limpiar colecciones operacionales
      for (let cIdx = 0; cIdx < COLLECTIONS_TO_CLEAR.length; cIdx++) {
        const colName = COLLECTIONS_TO_CLEAR[cIdx];
        try {
          const existing = txApp.findRecordsByFilter(colName, "1=1", "", 150000);
          if (existing && existing.length > 0) {
            console.log("[GRAVY TENANT INIT] Limpiando " + existing.length + " registros de " + colName);
            for (let rIdx = 0; rIdx < existing.length; rIdx++) {
              txApp.delete(existing[rIdx]);
            }
          }
        } catch (err) {
          console.warn("[GRAVY TENANT INIT] Error al limpiar " + colName + ": " + err.message);
        }
      }

      // 2. Limpiar usuarios heredados
      try {
        const users = txApp.findRecordsByFilter("users", "1=1", "", 1000);
        for (let rIdx = 0; rIdx < users.length; rIdx++) {
          txApp.delete(users[rIdx]);
        }
        console.log("[GRAVY TENANT INIT] Usuarios heredados eliminados.");
      } catch (err) {
        console.warn("[GRAVY TENANT INIT] Error al limpiar usuarios: " + err.message);
      }

      // 3. Actualizar datos de configuración de la empresa en la colección 'settings'
      const companyName = "${name.replace(/"/g, '\\"')}";
      const companyNit = "${nit.replace(/"/g, '\\"')}";

      const setVal = (key, val) => {
        try {
          const rec = txApp.findFirstRecordByData("settings", "key", key);
          rec.set("value", val);
          txApp.save(rec);
        } catch (_) {
          try {
            const col = txApp.findCollectionByNameOrId("settings");
            const rec = new Record(col, { key: key, value: val });
            txApp.save(rec);
          } catch (err) {
            console.warn("[GRAVY TENANT INIT] Error al guardar setting " + key + ": " + err.message);
          }
        }
      };

      setVal("company_name", companyName);
      setVal("company_nit", companyNit);
      setVal("tenant_initialized", "1");

      console.log("[GRAVY TENANT INIT] Configuración básica establecida.");
    });

  } catch (err) {
    console.error("[GRAVY TENANT INIT] Error crítico en inicialización del tenant:", err);
  }
});
    `;
    fs.writeFileSync(path.join(companyPbHooks, 'zz_clean_on_first_run.pb.js'), cleanScript);

    // Update settings in setup.pb.js to use the new company name
    const setupScriptPath = path.join(companyPbHooks, 'setup.pb.js');
    if (fs.existsSync(setupScriptPath)) {
      let setupContent = fs.readFileSync(setupScriptPath, 'utf8');
      setupContent = setupContent.replace(/const seedSettings = \[([\s\S]*?)\];/, () => {
        return `const seedSettings = [
    ["company_name",    "${name}"],
    ["company_nit",     "${nit}"],
    ["company_address", "Por definir"],
    ["company_phone",   ""],
    ["company_email",   "${email}"],
    ["smv_year",        String(new Date().getFullYear())],
    ["dian_environment", "2"],
    ["dian_nit",        ""],
    ["dian_cltec",      ""],
    ["dian_software_id", ""],
    ["dian_software_pin", ""],
    ["dian_certificate_base64", ""],
    ["dian_certificate_password", ""],
  ];`;
      });
      fs.writeFileSync(setupScriptPath, setupContent);
    }

    // Spawn PocketBase
    const pbExe = path.join(BASE_DIR, 'pocketbase.exe');
    console.log(`Starting PocketBase for ${name} on port ${port}...`);
    
    const bindIp = process.env.GRAVY_BIND_IP || '127.0.0.1';
    const pbProcess = spawn(pbExe, [
      'serve',
      `--http=${bindIp}:${port}`,
      `--dir=${companyPbData}`,
      `--hooksDir=${companyPbHooks}`,
      `--publicDir=${PB_PUBLIC_DIR}`,
      `--migrationsDir=${PB_MIGRATIONS_DIR}`
    ], {
      cwd: companyDir,
      detached: true, // run independent of orchestrator
      stdio: 'ignore'
    });
    
    pbProcess.unref();

    // Register active process
    activeProcesses[port] = { port, pid: pbProcess.pid };
    
    // Add to start.bat if it exists (so it survives reboots in manual dev modes)
    const startBatPath = path.join(BASE_DIR, 'start.bat');
    if (fs.existsSync(startBatPath)) {
      try {
        let startBat = fs.readFileSync(startBatPath, 'utf8');
        const startCmd = `echo  Iniciando Empresa: ${name} (localhost:${port})...\r\nstart "Gravy Empresa ${port}" cmd /k "cd /d "%ROOT%" && pocketbase.exe serve --http=127.0.0.1:${port} --dir="%ROOT%empresas\\empresa_${port}\\pb_data" --publicDir="%ROOT%pb_public" --hooksDir="%ROOT%empresas\\empresa_${port}\\pb_hooks" --migrationsDir="%ROOT%pb_migrations""`;
        
        if (!startBat.includes(`empresa_${port}`)) {
          startBat = startBat.replace('echo.\r\necho  URLs locales:', `${startCmd}\r\n\r\necho.\r\necho  URLs locales:`);
          fs.writeFileSync(startBatPath, startBat);
        }
      } catch (err) {
        console.warn('[GRAVY ORCHESTRATOR] Warning updating start.bat:', err.message);
      }
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

app.post('/api/orchestrate/delete', async (req, res) => {
  try {
    const { port } = req.body;
    if (!port || isNaN(port)) {
      return res.status(400).json({ error: 'Puerto inválido o no suministrado' });
    }

    console.log(`[ORCHESTRATOR] Solicitando eliminación completa de la empresa en el puerto ${port}...`);

    // 1. Detener el proceso que escucha en ese puerto en Windows
    await new Promise((resolve) => {
      const killCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($p) { Stop-Process -Id $p -Force; write-host 'Proceso detenido.' } else { write-host 'No hay procesos en ese puerto.' }"`;
      exec(killCmd, (err, stdout) => {
        console.log(`[ORCHESTRATOR] Detener proceso resultado: ${stdout.trim()}`);
        resolve();
      });
    });

    // Remover del registro de procesos internos si existe
    if (activeProcesses[port]) {
      delete activeProcesses[port];
    }

    // 2. Esperar a que se liberen los archivos de base de datos
    await new Promise(r => setTimeout(r, 1500));

    // 3. Borrar físicamente el directorio empresas/empresa_<port>
    const companyDir = path.join(EMPRESAS_DIR, `empresa_${port}`);
    if (fs.existsSync(companyDir)) {
      console.log(`[ORCHESTRATOR] Eliminando carpeta física: ${companyDir}`);
      fs.rmSync(companyDir, { recursive: true, force: true });
    }

    // 4. Remover la empresa del archivo start.bat si existe
    const startBatPath = path.join(BASE_DIR, 'start.bat');
    if (fs.existsSync(startBatPath)) {
      try {
        let startBat = fs.readFileSync(startBatPath, 'utf8');
        const lines = startBat.split('\r\n');
        const filteredLines = lines.filter(line => !line.includes(`empresa_${port}`));
        fs.writeFileSync(startBatPath, filteredLines.join('\r\n'));
        console.log(`[ORCHESTRATOR] start.bat actualizado.`);
      } catch (err) {
        console.warn(`[ORCHESTRATOR] Error actualizando start.bat: ${err.message}`);
      }
    }

    res.json({ success: true, message: `Empresa del puerto ${port} eliminada por completo.` });

  } catch (err) {
    console.error('[ORCHESTRATOR] Error en eliminación:', err);
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
    
    let serialHex = cert.serialNumber || '0';
    let isNegative = false;
    if (serialHex.startsWith('-')) {
      isNegative = true;
      serialHex = serialHex.substring(1);
    }
    serialHex = serialHex.replace(/[^0-9a-fA-F]/g, '');
    let serialDec = BigInt("0x" + serialHex).toString(10);
    if (isNegative) {
      serialDec = "-" + serialDec;
    }

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

function postSoapRequest(endpointUrl, soapAction, soapEnvelope, customContentType) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(endpointUrl);
    const contentType = customContentType || 'text/xml;charset=UTF-8';

    const headers = {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(soapEnvelope)
    };

    if (soapAction) {
      let formattedSoapAction = soapAction;
      if (formattedSoapAction && !formattedSoapAction.startsWith('"')) {
        formattedSoapAction = `"${formattedSoapAction}"`;
      }
      headers['SOAPAction'] = formattedSoapAction;
    }

    const options = {
      method: 'POST',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: headers
    };

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      res.on('error', (err) => {
        reject(err);
      });
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
      dianZipBasename,
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
    const docName = dianZipBasename || `doc${String(dianNit).padStart(10, '0')}${documentType}${documentNumber}`;
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
      isPOS,
      isDS,
      isNDS
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

    const isSupportDoc = isDS || isNDS || documentType === 'SupportDocument' || documentType === 'SupportDocumentAdjust';

    let soapContentType = 'text/xml;charset=UTF-8';

    if (isSupportDoc) {
      const dseNamespace = ftechEnvironment === '1' ? 'urn:https://ws-dse.facturatech.co/v1/pro/' : 'urn:https://ws-dse.facturatech.co/v1/demo/';
      endpointUrl = ftechEnvironment === '1'
        ? 'https://ws-dse.facturatech.co/v1/pro/'
        : 'https://ws-dse.facturatech.co/v1/demo/';

      soapEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${dseNamespace}">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:uploadDocument soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <xmlBase64 xsi:type="xsd:string">${xmlBase64}</xmlBase64>
      </urn:uploadDocument>
   </soapenv:Body>
</soapenv:Envelope>`;

      soapAction = `${dseNamespace}uploadDocument`;
      soapContentType = 'text/xml;charset=UTF-8';
    } else if (isPOS) {
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
         <password>${hashedPassword}</password>
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
    const response = await postSoapRequest(endpointUrl, soapAction, soapEnvelope, soapContentType);

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
    let transaccionID = extractSoapTag(xmlRes, 'transaccionID') || extractSoapTag(xmlRes, 'transId') || extractSoapTag(xmlRes, 'transactionID');
    const message = extractSoapTag(xmlRes, 'message') || extractSoapTag(xmlRes, 'error');

    // Extraer transaccionID del mensaje si viene dentro del texto (ej. "TrasactionID b65db717...")
    if (!transaccionID && message) {
      const matchTx = message.match(/Tr[a|a-z]*sactionID\s*[:=]?\s*([a-fA-F0-9]+)/i);
      if (matchTx) {
        transaccionID = matchTx[1];
        console.log(`[GRAVY FTECH] Extraído transaccionID del mensaje: ${transaccionID}`);
      }
    }

    const isAlreadySignedOrProcessing = message && (
      message.toLowerCase().includes('firmado previamente') ||
      message.toLowerCase().includes('ya ha sido firmado') ||
      message.toLowerCase().includes('ya existe un documento') ||
      message.toLowerCase().includes('status de procesamiento')
    );

    console.log(`[GRAVY FTECH] Respuesta Facturatech: success=${success}, code=${code}, transId=${transaccionID}, isAlreadySigned=${isAlreadySignedOrProcessing}`);

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

    if (code === '200' || code === '201' || code === '100' || success || isAlreadySignedOrProcessing) {
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
  const {
    transId,
    ftechUsername,
    ftechPassword,
    ftechEnvironment,
    documentType,
    documentNumber,
    prefix,
    folio,
    isPOS,
    isDS,
    isNDS
  } = req.body || {};

  const docNumber = documentNumber || (prefix ? `${prefix}${folio}` : folio) || 'unknown';

  try {

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

    const isSupportDoc = isDS || isNDS || documentType === 'SupportDocument' || documentType === 'SupportDocumentAdjust';

    let statusContentType = 'text/xml;charset=UTF-8';

    if (isSupportDoc) {
      const dseNamespace = ftechEnvironment === '1' ? 'urn:https://ws-dse.facturatech.co/v1/pro/' : 'urn:https://ws-dse.facturatech.co/v1/demo/';
      endpointUrl = ftechEnvironment === '1'
        ? 'https://ws-dse.facturatech.co/v1/pro/'
        : 'https://ws-dse.facturatech.co/v1/demo/';

      statusEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${dseNamespace}">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:documentStatus soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <transaccionID xsi:type="xsd:string">${transId}</transaccionID>
      </urn:documentStatus>
   </soapenv:Body>
</soapenv:Envelope>`;

      statusAction = `${dseNamespace}documentStatus`;
      statusContentType = 'text/xml;charset=UTF-8';
    } else if (isPOS) {
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
    const statusResponse = await postSoapRequest(endpointUrl, statusAction, statusEnvelope, statusContentType);

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
    const statusMsg = extractSoapTag(statusXml, 'message') || extractSoapTag(statusXml, 'error') || extractSoapTag(statusXml, 'messageError');
    const documentBase64 = extractSoapTag(statusXml, 'documentBase64') || extractSoapTag(statusXml, 'resourceData');

    console.log(`[GRAVY FTECH] Resultado estado: code=${statusCode}, status=${statusVal}, msg=${statusMsg}, hasDocBase64=${!!documentBase64}`);

    const isSigned = (statusVal && statusVal.toUpperCase() === 'SIGNED_XML') || 
                     (statusMsg && statusMsg.toLowerCase().includes('signed_xml')) || 
                     (statusMsg && statusMsg.toLowerCase().includes('firmado')) || 
                     statusCode === '201' || 
                     (statusCode === '200' && !!documentBase64) || 
                     (!!documentBase64 && (!statusVal || !statusVal.toUpperCase().includes('ERROR')));

    // If still processing, return enviada status
    if (!isSigned && (statusVal === 'PROCESSING' || (statusCode === '200' && !documentBase64) || statusCode === '100')) {
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
    if (!isSigned && (statusVal === 'ERROR' || statusCode === '404' || statusCode === '409')) {
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
    if (isSigned) {
      // 3. Download CUFE
      let cufeEnvelope = '';
      let cufeAction = '';
      let cufeContentType = 'text/xml;charset=UTF-8';

      if (isDS || isNDS) {
        const dseNamespace = ftechEnvironment === '1' ? 'urn:https://ws-dse.facturatech.co/v1/pro/' : 'urn:https://ws-dse.facturatech.co/v1/demo/';
        endpointUrl = ftechEnvironment === '1'
          ? 'https://ws-dse.facturatech.co/v1/pro/'
          : 'https://ws-dse.facturatech.co/v1/demo/';

        cufeEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${dseNamespace}">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadCUDS soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <prefix xsi:type="xsd:string">${prefix}</prefix>
         <number xsi:type="xsd:integer">${folio}</number>
      </urn:downloadCUDS>
   </soapenv:Body>
</soapenv:Envelope>`;
        cufeAction = `${dseNamespace}downloadCUDSResponse`;
        cufeContentType = 'text/xml;charset=UTF-8';
      } else if (isPOS) {
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
        const cufeResponse = await postSoapRequest(endpointUrl, cufeAction, cufeEnvelope, cufeContentType);
        if (cufeResponse.statusCode === 200) {
          cufe = extractSoapTag(cufeResponse.data, 'resourceData') || extractSoapTag(cufeResponse.data, 'downloadCUDSResult') || extractSoapTag(cufeResponse.data, 'code');
        }
      } catch (err) {
        console.warn(`[GRAVY FTECH] Error al descargar CUFE por SOAP (se intentará fallback regex):`, err.message);
      }

      // 4. Download signed XML
      let xmlEnvelope = '';
      let xmlAction = '';
      let xmlContentType = 'text/xml;charset=UTF-8';

      if (isDS || isNDS) {
        const dseNamespace = ftechEnvironment === '1' ? 'urn:https://ws-dse.facturatech.co/v1/pro/' : 'urn:https://ws-dse.facturatech.co/v1/demo/';
        endpointUrl = ftechEnvironment === '1'
          ? 'https://ws-dse.facturatech.co/v1/pro/'
          : 'https://ws-dse.facturatech.co/v1/demo/';

        xmlEnvelope = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${dseNamespace}">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:downloadXML soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
         <username xsi:type="xsd:string">${ftechUsername}</username>
         <password xsi:type="xsd:string">${hashedPassword}</password>
         <prefix xsi:type="xsd:string">${prefix}</prefix>
         <number xsi:type="xsd:integer">${folio}</number>
      </urn:downloadXML>
   </soapenv:Body>
</soapenv:Envelope>`;
        xmlAction = `${dseNamespace}downloadXML`;
        xmlContentType = 'text/xml;charset=UTF-8';
      } else if (isPOS) {
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
        const xmlResponse = await postSoapRequest(endpointUrl, xmlAction, xmlEnvelope, xmlContentType);
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
        res.on('error', () => {
          resolve(null);
        });
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
          const lineTotal = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i) || [])[1] || '0'));
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
        // --- High-fidelity minimalist black & white layout matching FE4.pdf ---
        // Generates the comprehensive legal Colombian invoice format
        const W     = doc.page.width - 60; // 552pt usable width for Letter size (612x792)
        const L     = 30; // left margin
        let y       = 30; // top margin

        // DV calculation helper
        const calcularDV = (nit) => {
          const cleanNit = String(nit || '').replace(/[^0-9]/g, '');
          if (!cleanNit) return '';
          const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
          let suma = 0;
          const len = cleanNit.length;
          for (let i = 0; i < len; i++) {
            const digito = parseInt(cleanNit.charAt(len - 1 - i), 10);
            suma += digito * pesos[i];
          }
          const residuo = suma % 11;
          return String(residuo > 1 ? 11 - residuo : residuo);
        };

        // Address parser helper to separate main address from city/department
        const parseAddress = (addr) => {
          const parts = String(addr || '').split(',');
          if (parts.length >= 3) {
            const mainAddr = parts.slice(0, parts.length - 2).join(',').trim();
            const city = parts[parts.length - 2].trim();
            const dept = parts[parts.length - 1].trim();
            return { mainAddr, cityDept: `${city}, ${dept}` };
          }
          return { mainAddr: addr, cityDept: '' };
        };

        const loadProductSpecs = (codes) => {
          return new Promise((res) => {
            if (!codes || !codes.length) return res({});
            try {
              const sqlite3 = require('sqlite3').verbose();
              const db = new sqlite3.Database(path.join(BASE_DIR, 'pb_data', 'data.db'), sqlite3.OPEN_READONLY);
              const placeholders = codes.map(() => '?').join(',');
              db.all(`SELECT code, unit, largo_cm, ancho_cm, und_empaque, peso_bruto FROM products WHERE code IN (${placeholders})`, codes, (err, rows) => {
                db.close();
                if (err || !rows) return res({});
                const specs = {};
                rows.forEach(r => {
                  specs[r.code] = {
                    unit: r.unit || 'ZZ',
                    largoCm: r.largo_cm || 0,
                    anchoCm: r.ancho_cm || 0,
                    undEmpaque: r.und_empaque || 0,
                    pesoBruto: r.peso_bruto || 0
                  };
                });
                res(specs);
              });
            } catch (_) {
              res({});
            }
          });
        };

        const getLineEquivalences = (qty, spec) => {
          if (!spec) {
            return { m2: 0, cajas: 0, unidades: qty, pesoKg: 0 };
          }
          const largoCm = spec.largoCm || 0;
          const anchoCm = spec.anchoCm || 0;
          const undEmpaque = spec.undEmpaque || 0;
          const pesoBruto = spec.pesoBruto || 0;
          const unit = spec.unit || 'ZZ';
          
          const areaPorFicha = (largoCm * anchoCm) / 10000;
          const areaPorCaja = areaPorFicha * undEmpaque;
          
          let qtyInM2 = 0;
          if (unit === 'MTK' || unit === 'M2') {
            qtyInM2 = qty;
          } else if (unit === 'CJ') {
            qtyInM2 = qty * areaPorCaja;
          } else {
            qtyInM2 = qty * areaPorFicha;
          }
          
          const m2 = qtyInM2;
          const cajas = areaPorCaja > 0 ? (qtyInM2 / areaPorCaja) : 0;
          const unidades = areaPorFicha > 0 ? (qtyInM2 / areaPorFicha) : qty;
          const pesoKg = cajas * pesoBruto;
          
          return { m2, cajas, unidades, pesoKg };
        };

        // SQLite settings loader
        const getSettingFromDb = (key) => {
          return new Promise((res) => {
            try {
              const sqlite3 = require('sqlite3').verbose();
              const db = new sqlite3.Database(path.join(BASE_DIR, 'pb_data', 'data.db'), sqlite3.OPEN_READONLY);
              db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
                db.close();
                if (err || !row) res('');
                else res(row.value);
              });
            } catch (_) {
              res('');
            }
          });
        };

        // Fetch configurable texts from settings
        let configHeader = invoiceData && invoiceData.headerText;
        if (!configHeader) {
          configHeader = await getSettingFromDb('invoice_header_text');
        }
        if (!configHeader) {
          configHeader = 'Actividad Económica Principal 6201\nNo somos Gran Contribuyente\nNo somos Agente Retenedor del Impuesto sobre las Ventas - IVA\nNo somos Autorretenedor del Impuesto sobre la Renta y Complementarios';
        }

        let configFooter = invoiceData && invoiceData.footerText;
        if (!configFooter) {
          configFooter = await getSettingFromDb('invoice_footer_text');
        }
        if (!configFooter) {
          configFooter = 'Este documento es la representación gráfica de una Factura Electrónica de Venta generada conforme al Decreto 358 de 2020 y la Resolución 000042 de 2020 de la DIAN. La validez fiscal recae exclusivamente sobre el archivo XML firmado digitalmente.';
        }

        // --- 1. PARSE UBL XML CONTENT ---
        docId       = getTag('ID') || (invoiceData && invoiceData.docId) || filename;
        issueDate   = getTag('IssueDate') || (invoiceData && invoiceData.issueDate) || '';
        issueTime   = getTag('IssueTime') || (invoiceData && invoiceData.issueTime) || '';
        cufe        = getTag('UUID') || (invoiceData && invoiceData.cufe) || 'No disponible';
        
        const xmlDueDate = getTag('DueDate') || getTag('PaymentDueDate') || extractField('PaymentMeans', 'DueDate') || extractField('PaymentTerms', 'PaymentDueDate') || getTag('ENC_16');
        const dueDate = xmlDueDate || (invoiceData && (invoiceData.dueDate || invoiceData.due_date)) || issueDate;
        
        const docTypeRaw  = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceTypeCode(?:\s[^>]*)?>(.*?)<\/(?:[a-zA-Z0-9_-]+:)?InvoiceTypeCode>/i);
        const docTypeCode = docTypeRaw ? stripTags(docTypeRaw[1].trim()) : '';

        const isDS = filename.toUpperCase().includes('DS') || 
                     filename.toUpperCase().includes('DSE') || 
                     cleanXml.includes('DOCUMENTO_SOPORTE') || 
                     cleanXml.includes('DocumentoSoporte') || 
                     (invoiceData && (invoiceData.isDS || invoiceData.docType === 'DS' || invoiceData.docType === 'DSE'));
        const isNDS = filename.toUpperCase().includes('NDS') || 
                      cleanXml.includes('NotaAjusteDocumentoSoporte') || 
                      (invoiceData && (invoiceData.isNDS || invoiceData.docType === 'NDS'));
        const isNC = !isDS && !isNDS && (filename.toUpperCase().includes('NC') || docTypeCode === '91');
        const isND = !isDS && !isNDS && (filename.toUpperCase().includes('ND') || docTypeCode === '92');

        if (isDS) {
          docTypeLabel = 'DOCUMENTO SOPORTE EN ADQUISICIONES EFECTUADAS A NO OBLIGADOS A FACTURAR';
        } else if (isNDS) {
          docTypeLabel = 'NOTA DE AJUSTE AL DOCUMENTO SOPORTE EN ADQUISICIONES EFECTUADAS A NO OBLIGADOS A FACTURAR';
        } else if (isNC) {
          docTypeLabel = 'Nota Crédito';
        } else if (isND) {
          docTypeLabel = 'Nota Débito';
        } else {
          docTypeLabel = 'Factura Electrónica de Venta';
        }

        supplierName = extractField('AccountingSupplierParty', 'RegistrationName') || extractField('AccountingSupplierParty', 'Name') || (invoiceData && invoiceData.supplierName);
        supplierNit = extractField('AccountingSupplierParty', 'CompanyID') || (invoiceData && invoiceData.supplierNit);
        supplierEmail = extractField('AccountingSupplierParty', 'ElectronicMail') || (invoiceData && invoiceData.supplierEmail);
        supplierPhone = extractField('AccountingSupplierParty', 'Telephone') || (invoiceData && invoiceData.supplierPhone);
        supplierAddress = extractField('AccountingSupplierParty', 'Line') || extractField('AccountingSupplierParty', 'AddressLine') || (invoiceData && invoiceData.supplierAddress);
        supplierCity = extractField('AccountingSupplierParty', 'CityName') || extractField('AccountingSupplierParty', 'DFE_6') || extractField('AccountingSupplierParty', 'EMI_19') || (invoiceData && (invoiceData.supplierCity || invoiceData.companyCity)) || '';
        supplierDept = extractField('AccountingSupplierParty', 'CountrySubentity') || extractField('AccountingSupplierParty', 'DFE_7') || extractField('AccountingSupplierParty', 'EMI_13') || (invoiceData && (invoiceData.supplierDept || invoiceData.companyDept)) || '';
        supplierCityCode = extractField('AccountingSupplierParty', 'CityCode') || extractField('AccountingSupplierParty', 'DFE_4') || extractField('AccountingSupplierParty', 'DFE_1') || extractField('AccountingSupplierParty', 'EMI_14') || (invoiceData && (invoiceData.supplierCityCode || invoiceData.companyCityCode || invoiceData.companyDane)) || '';
        supplierDeptCode = extractField('AccountingSupplierParty', 'CountrySubentityCode') || extractField('AccountingSupplierParty', 'DFE_2') || extractField('AccountingSupplierParty', 'EMI_11') || (invoiceData && (invoiceData.supplierDeptCode || invoiceData.companyDeptCode)) || '';

        customerName = extractField('AccountingCustomerParty', 'RegistrationName') || extractField('AccountingCustomerParty', 'Name') || (invoiceData && invoiceData.customerName);
        customerNit = extractField('AccountingCustomerParty', 'CompanyID') || (invoiceData && invoiceData.customerNit);
        customerEmail = extractField('AccountingCustomerParty', 'ElectronicMail') || (invoiceData && invoiceData.customerEmail);
        customerPhone = extractField('AccountingCustomerParty', 'Telephone') || (invoiceData && invoiceData.customerPhone);
        customerAddress = extractField('AccountingCustomerParty', 'Line') || extractField('AccountingCustomerParty', 'AddressLine') || (invoiceData && invoiceData.customerAddress);
        customerCity = extractField('AccountingCustomerParty', 'CityName') || extractField('AccountingCustomerParty', 'ADQ_13') || (invoiceData && invoiceData.customerCity) || '';
        customerDept = extractField('AccountingCustomerParty', 'CountrySubentity') || extractField('AccountingCustomerParty', 'ADQ_12') || (invoiceData && invoiceData.customerDept) || '';
        customerCityCode = extractField('AccountingCustomerParty', 'CityCode') || extractField('AccountingCustomerParty', 'ADQ_14') || extractField('AccountingCustomerParty', 'ADQ_23') || (invoiceData && invoiceData.customerCityCode) || '';
        customerDeptCode = extractField('AccountingCustomerParty', 'CountrySubentityCode') || extractField('AccountingCustomerParty', 'ADQ_11') || (invoiceData && invoiceData.customerDeptCode) || '';

        const xmlPayableAmount = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?PayableAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?PayableAmount>/i);
        payableAmount = xmlPayableAmount ? parseFloat(stripTags(xmlPayableAmount[1])) : (invoiceData && invoiceData.payableAmount) || 0;
        
        const xmlTaxAmount = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?TaxTotal>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?TaxAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?TaxAmount>/i);
        taxAmount = xmlTaxAmount ? parseFloat(stripTags(xmlTaxAmount[1])) : 0;
        
        const xmlLineExtension = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?LegalMonetaryTotal>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i);
        lineExtension = xmlLineExtension ? parseFloat(stripTags(xmlLineExtension[1])) : 0;

        const authMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceAuthorization[^>]*(?:Auto-habilitacion)?>([0-9]+)<\/(?:[a-zA-Z0-9_-]+:)?InvoiceAuthorization>/i);
        resolutionNumber = authMatch ? authMatch[1] : (invoiceData && invoiceData.resolutionNumber) || '';
        const startMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?StartDate[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?StartDate>/i);
        resolutionDate = startMatch ? stripTags(startMatch[1]) : (invoiceData && invoiceData.resolutionDate) || '';
        const endMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?EndDate[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?EndDate>/i);
        resolutionExpiry = endMatch ? stripTags(endMatch[1]) : (invoiceData && invoiceData.resolutionExpiry) || '';
        const fromMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?From[^>]*>([0-9]+)<\/(?:[a-zA-Z0-9_-]+:)?From>/i);
        resolutionRangeFrom = fromMatch ? fromMatch[1] : (invoiceData && invoiceData.resolutionRangeFrom) || '';
        const toMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?To[^>]*>([0-9]+)<\/(?:[a-zA-Z0-9_-]+:)?To>/i);
        resolutionRangeTo = toMatch ? toMatch[1] : (invoiceData && invoiceData.resolutionRangeTo) || '';
        const prefixMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?Prefix[^>]*>([^<]*)<\/(?:[a-zA-Z0-9_-]+:)?Prefix>/i);
        resolutionPrefix = prefixMatch ? stripTags(prefixMatch[1]) : (invoiceData && invoiceData.resolutionPrefix) || '';

        // Clean lines array
        lines = [];
        const linePattern = /<(?:[a-zA-Z0-9_-]+:)?(?:Invoice|CreditNote|DebitNote)Line>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?(?:Invoice|CreditNote|DebitNote)Line>/gi;
        let lineMatch;
        while ((lineMatch = linePattern.exec(cleanXml)) !== null) {
          const lineXml = lineMatch[1];
          const desc = stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?Description>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?Description>/i) || [])[1] || '');
          const qty = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity>/i) || [])[1] || '0'));
          const unitPrice = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?PriceAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?PriceAmount>/i) || [])[1] || '0'));
          const lineTotal = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\s[^>]*)?>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i) || [])[1] || '0'));
          
          const qtyMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity(?:\s+[^>]*?unitCode="([^"]+)"[^>]*?)?>/i);
          const um = qtyMatch && qtyMatch[1] ? qtyMatch[1] : 'EA';

          const sellerIdMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?SellersItemIdentification>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?ID[^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?ID>/i);
          const sellerId = sellerIdMatch ? stripTags(sellerIdMatch[1]) : '—';

          const standardIdMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?StandardItemIdentification>[\s\S]*?<(?:[a-zA-Z0-9_-]+:)?ID[^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?ID>/i);
          const standardId = standardIdMatch ? stripTags(standardIdMatch[1]) : '—';

          const allowanceMatch = lineXml.match(/<cac:AllowanceCharge>[\s\S]*?<cbc:ChargeIndicator[^>]*>false<\/cbc:ChargeIndicator>[\s\S]*?<cbc:Amount[^>]*>([\s\S]*?)<\/cbc:Amount>/i);
          let discountRate = 0;
          let discountVal = allowanceMatch ? parseFloat(stripTags(allowanceMatch[1])) : 0;
          
          const allowanceBlockMatch = lineXml.match(/<cac:AllowanceCharge>([\s\S]*?)<\/cac:AllowanceCharge>/i);
          if (allowanceBlockMatch) {
            const inner = allowanceBlockMatch[1];
            const rateM = inner.match(/<cbc:MultiplierFactorNumeric[^>]*>([\s\S]*?)<\/cbc:MultiplierFactorNumeric>/i);
            discountRate = rateM ? parseFloat(stripTags(rateM[1])) : 0;
            if (discountRate > 0 && discountRate < 1) discountRate *= 100;
          }

          const taxSubtotalMatch = lineXml.match(/<cac:TaxSubtotal>([\s\S]*?)<\/cac:TaxSubtotal>/i);
          let taxName = 'IVA';
          let taxPercent = 0;
          let taxVal = 0;
          if (taxSubtotalMatch) {
            const taxSubxml = taxSubtotalMatch[1];
            taxPercent = parseFloat(stripTags((taxSubxml.match(/<cbc:Percent[^>]*>([\s\S]*?)<\/cbc:Percent>/i) || [])[1] || '0'));
            taxVal = parseFloat(stripTags((taxSubxml.match(/<cbc:TaxAmount[^>]*>([\s\S]*?)<\/cbc:TaxAmount>/i) || [])[1] || '0'));
            taxName = stripTags((taxSubxml.match(/<cac:TaxScheme>[\s\S]*?<cbc:Name[^>]*>([\s\S]*?)<\/cbc:Name>/i) || [])[1] || 'IVA');
          }

          if (desc) {
            const hasSellerId = sellerId && sellerId !== '—';
            const hasStandardId = standardId && standardId !== '—';

            lines.push({
              desc,
              code: hasSellerId ? sellerId : (hasStandardId ? standardId : '—'),
              standardId: hasSellerId ? standardId : '—',
              qty,
              unitPrice,
              lineTotal,
              ivaRate: taxPercent,
              taxName,
              taxVal,
              discountRate,
              discountVal,
              um
            });
          }
        }

        // Retrieve specs and calculate equivalences
        const uniqueCodes = Array.from(new Set(lines.map(line => line.code).filter(c => c && c !== '—')));
        const productSpecs = await loadProductSpecs(uniqueCodes);

        let totalCajas = 0;
        let totalUnidades = 0;
        let totalM2 = 0;
        let totalPesoKg = 0;

        lines.forEach(line => {
          const spec = productSpecs[line.code];
          if (spec) {
            const equiv = getLineEquivalences(line.qty, spec);
            totalCajas += equiv.cajas;
            totalUnidades += equiv.unidades;
            totalM2 += equiv.m2;
            totalPesoKg += equiv.pesoKg;
          } else {
            totalUnidades += line.qty;
          }
        });

        // Parse Document-level Taxes
        const docOnlyXml = cleanXml.replace(/<cac:(?:Invoice|CreditNote|DebitNote)Line>[\s\S]*?<\/cac:(?:Invoice|CreditNote|DebitNote)Line>/gi, '');

        const taxTotals = [];
        const taxTotalPattern = /<cac:TaxTotal>([\s\S]*?)<\/cac:TaxTotal>/gi;
        let taxTotalMatch;
        while ((taxTotalMatch = taxTotalPattern.exec(docOnlyXml)) !== null) {
          const block = taxTotalMatch[1];
          const subPattern = /<cac:TaxSubtotal>([\s\S]*?)<\/cac:TaxSubtotal>/gi;
          let subMatch;
          while ((subMatch = subPattern.exec(block)) !== null) {
            const subXml = subMatch[1];
            const base = parseFloat(stripTags((subXml.match(/<cbc:TaxableAmount[^>]*>([\s\S]*?)<\/cbc:TaxableAmount>/i) || [])[1] || '0'));
            const amount = parseFloat(stripTags((subXml.match(/<cbc:TaxAmount[^>]*>([\s\S]*?)<\/cbc:TaxAmount>/i) || [])[1] || '0'));
            const rate = parseFloat(stripTags((subXml.match(/<cbc:Percent[^>]*>([\s\S]*?)<\/cbc:Percent>/i) || [])[1] || '0'));
            const name = stripTags((subXml.match(/<cac:TaxScheme>[\s\S]*?<cbc:Name[^>]*>([\s\S]*?)<\/cbc:Name>/i) || [])[1] || 'IVA');
            if (amount > 0) {
              taxTotals.push({ name, rate, base, amount });
            }
          }
        }

        // Parse Document-level Withholdings
        const withholdingTotals = [];
        const wTotalPattern = /<cac:WithholdingTaxTotal>([\s\S]*?)<\/cac:WithholdingTaxTotal>/gi;
        let wTotalMatch;
        while ((wTotalMatch = wTotalPattern.exec(docOnlyXml)) !== null) {
          const block = wTotalMatch[1];
          const subPattern = /<cac:TaxSubtotal>([\s\S]*?)<\/cac:TaxSubtotal>/gi;
          let subMatch;
          while ((subMatch = subPattern.exec(block)) !== null) {
            const subXml = subMatch[1];
            const base = parseFloat(stripTags((subXml.match(/<cbc:TaxableAmount[^>]*>([\s\S]*?)<\/cbc:TaxableAmount>/i) || [])[1] || '0'));
            const amount = parseFloat(stripTags((subXml.match(/<cbc:TaxAmount[^>]*>([\s\S]*?)<\/cbc:TaxAmount>/i) || [])[1] || '0'));
            const rate = parseFloat(stripTags((subXml.match(/<cbc:Percent[^>]*>([\s\S]*?)<\/cbc:Percent>/i) || [])[1] || '0'));
            const name = stripTags((subXml.match(/<cac:TaxScheme>[\s\S]*?<cbc:Name[^>]*>([\s\S]*?)<\/cbc:Name>/i) || [])[1] || 'Retención');
            if (amount > 0) {
              withholdingTotals.push({ name, rate, base, amount });
            }
          }
        }

        // --- 2. HEADER SECTION ---
        // Left Column: Large Company Logo at top left
        let logoHeight = 0;
        if (!companyLogo) {
          companyLogo = await getSettingFromDb('company_logo');
        }
        if (companyLogo) {
          try {
            const base64Data = companyLogo.replace(/^data:image\/\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            doc.image(logoBuffer, L, y, { width: 110, height: 55, fit: [110, 55] });
            logoHeight = 55;
          } catch (logoErr) {
            console.warn("[ORCHESTRATOR] Error rendering company logo:", logoErr.message);
          }
        }

        let taxY = y + Math.max(logoHeight, 45) + 10;

        // Draw configurable header block (Company/Emitter name + paragraph layout)
        const emitterHeaderName = (isDS || isNDS) ? customerName : supplierName;
        doc.font('Helvetica').fontSize(7.5).fillColor('#1F2937');
        const headerParagraph = emitterHeaderName 
          ? `${emitterHeaderName}. ${configHeader.replace(/\\n/g, ' ')}`
          : configHeader.replace(/\\n/g, ' ');
          
        doc.text(headerParagraph, L, taxY, { width: 230, align: 'justify' });
        const headerTextHeight = doc.heightOfString(headerParagraph, { width: 230, align: 'justify' });
        taxY += headerTextHeight + 4;

        // Right Column: Document metadata
        const rx = 280;
        const rw = W - (rx - L);
        let ry = 30;

        // Determine document prefix for title (FE / NC / ND / DS / NDS)
        const docPrefix = isDS ? (resolutionPrefix || 'DS') : isNDS ? 'NDS' : isNC ? 'NC' : isND ? 'ND' : 'FE';

        // Extract referenced billing document for NC and ND
        let referencedDocId = '';
        if (isNC || isND || isNDS) {
          const billingRefMatch = cleanXml.match(/<cac:BillingReference>[\s\S]*?<cbc:ID[^>]*>([\s\S]*?)<\/cbc:ID>/i);
          if (billingRefMatch) referencedDocId = stripTags(billingRefMatch[1]);
          if (!referencedDocId) {
            const discRefMatch = cleanXml.match(/<cac:DiscrepancyResponse>[\s\S]*?<cbc:ReferenceID[^>]*>([\s\S]*?)<\/cbc:ReferenceID>/i);
            if (discRefMatch) referencedDocId = stripTags(discRefMatch[1]);
          }
        }

        // Document Type Title + PREFIX - Number
        const docNumOnly = docId.replace(/^[A-Za-z\-]+/g, '');
        if (isDS || isNDS) {
          doc.fillColor('#991B1B').font('Helvetica-Bold').fontSize(8.5);
          doc.text(docTypeLabel, rx, ry, { width: rw });
          const titleH = doc.heightOfString(docTypeLabel, { width: rw });
          ry += titleH + 3;
          doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12);
          doc.text(`${docPrefix}${docNumOnly}`, rx, ry, { width: rw });
          ry += 14;
        } else {
          doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11.5);
          const docTitleStr = `${docTypeLabel.toUpperCase()}  ${docPrefix} - ${docNumOnly}`;
          doc.text(docTitleStr, rx, ry, { width: rw });
          const docTypeHeight = doc.heightOfString(docTitleStr, { width: rw });
          ry += docTypeHeight + 2;
        }
        
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563');

        // Authorization label and text — adapted per document type
        if (isDS) {
          doc.text('Autorización Documento Soporte Electrónico', rx, ry);
          ry += 9;
          const resText = resolutionNumber 
            ? `No. ${resolutionNumber} de ${resolutionDate} - ${resolutionExpiry} autoriza DS - ${resolutionRangeFrom} a ${resolutionPrefix ? resolutionPrefix + '-' : ''}${resolutionRangeTo}`
            : 'Autorización de documento soporte en proceso';
          doc.text(resText, rx, ry, { width: rw });
          const resHeight = doc.heightOfString(resText, { width: rw });
          ry += Math.max(resHeight + 6, 18);
        } else if (isNC || isND || isNDS) {
          const docTypeName = isNDS ? 'Nota de Ajuste DSE' : isNC ? 'Nota Crédito' : 'Nota Débito';
          doc.text(`Autorización ${docTypeName} Electrónica`, rx, ry);
          ry += 9;
          const resText = referencedDocId
            ? `Nota referenciada al Documento: ${referencedDocId}`
            : 'Nota emitida bajo resolución del documento original';
          doc.text(resText, rx, ry, { width: rw });
          const resHeight = doc.heightOfString(resText, { width: rw });
          ry += Math.max(resHeight + 6, 18);
        } else {
          doc.text('Autorización Numeración de Facturación Electrónica', rx, ry);
          ry += 9;
          const resText = resolutionNumber 
            ? `No. ${resolutionNumber} de ${resolutionDate} - ${resolutionExpiry} autoriza FE - ${resolutionRangeFrom} a ${resolutionPrefix ? resolutionPrefix + '-' : ''}${resolutionRangeTo}`
            : 'Autorización de facturación en proceso';
          doc.text(resText, rx, ry, { width: rw });
          const resHeight = doc.heightOfString(resText, { width: rw });
          ry += Math.max(resHeight + 6, 18);
        }

        // Metadata grid (Using full width since no logo/QR is present on the right side)
        const drawMetaLine = (label, val, yPos) => {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1F2937').text(label, 280, yPos, { width: 100 });
          doc.font('Helvetica').fontSize(7.5).fillColor('#1F2937').text(val, 385, yPos, { width: 197, align: 'right' });
        };
        
        const fmtDate = (d) => {
          if (!d) return '';
          return d.slice(0, 10) + ' ' + (d.split(' ')[1] || '00:00').slice(0, 5);
        };

        const genDateStr = fmtDate(issueDate) || new Date().toISOString().slice(0, 10);
        const dueDateStr = fmtDate(dueDate) || genDateStr;
        const paymentModeStr = paymentMethod === 'CREDITO' ? 'Crédito' : 'Contado';
        const paymentDetailStr = paymentMethod === 'CREDITO' ? 'Acuerdo mutuo' : (paymentMethod || 'Consignación bancaria');

        // Build metadata rows — add referenced doc row for NC/ND
        const metaRows = [
          ['Tipo de Operación', isNC ? 'Nota Crédito' : isND ? 'Nota Débito' : 'Estandar'],
          ['Fecha de Generación', genDateStr],
          ['Fecha de Vencimiento', dueDateStr],
          ['Fecha de Validación', genDateStr],
        ];
        if ((isNC || isND) && referencedDocId) {
          metaRows.push(['Doc. Referenciado', referencedDocId]);
        }
        metaRows.push(['Forma de Pago', paymentModeStr]);
        metaRows.push(['Medio de Pago', paymentDetailStr]);
        metaRows.push(['Moneda', 'COP']);

        metaRows.forEach(([label, val], i) => drawMetaLine(label, val, ry + (i * 10)));

        // Fetch bottom QR Code buffer
        let qrBuffer = null;
        if (cufe && cufe !== 'No disponible') {
          const qrUrlText = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe}`;
          qrBuffer = await fetchQrCode(qrUrlText).catch(() => null);
        }

        // --- 3. DIVIDER ---
        y = Math.max(taxY + 10, ry + (metaRows.length * 10) + 8);
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 8;

        // --- 4. EMITTER & CUSTOMER DETAILS SECTION ---
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000');
        if (isDS || isNDS) {
          doc.text('PROVEEDOR (VENDEDOR NO OBLIGADO)', L, y, { width: 260, align: 'center' });
          doc.text('ADQUIRENTE (COMPRADOR)', L + 280, y, { width: 260, align: 'center' });
        } else {
          doc.text('DATOS DEL EMISOR', L, y, { width: 260, align: 'center' });
          doc.text('DATOS DEL CLIENTE', L + 280, y, { width: 260, align: 'center' });
        }
        
        y += 12;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        
        const detailsStartY = y + 6;

        const DANE_DEPTS = {
          '05': 'ANTIOQUIA', '08': 'ATLÁNTICO', '11': 'BOGOTÁ, D.C.', '13': 'BOLÍVAR',
          '15': 'BOYACÁ', '17': 'CALDAS', '18': 'CAQUETÁ', '19': 'CAUCA', '20': 'CESAR',
          '23': 'CÓRDOBA', '25': 'CUNDINAMARCA', '27': 'CHOCÓ', '41': 'HUILA', '44': 'LA GUAJIRA',
          '47': 'MAGDALENA', '50': 'META', '52': 'NARIÑO', '54': 'NORTE DE SANTANDER',
          '63': 'QUINDÍO', '66': 'RISARALDA', '68': 'SANTANDER', '70': 'SUCRE', '73': 'TOLIMA',
          '76': 'VALLE DEL CAUCA', '81': 'ARAUCA', '85': 'CASANARE', '86': 'PUTUMAYO',
          '88': 'SAN ANDRÉS Y PROVIDENCIA', '91': 'AMAZONAS', '94': 'GUAINÍA', '95': 'GUAVIARE',
          '97': 'VAUPÉS', '99': 'VICHADA'
        };

        const DANE_MUNIS = {
          '05001': { city: 'MEDELLÍN', dept: 'ANTIOQUIA' },
          '08001': { city: 'BARRANQUILLA', dept: 'ATLÁNTICO' },
          '11001': { city: 'BOGOTÁ, D.C.', dept: 'BOGOTÁ, D.C.' },
          '13001': { city: 'CARTAGENA', dept: 'BOLÍVAR' },
          '15001': { city: 'TUNJA', dept: 'BOYACÁ' },
          '17001': { city: 'MANIZALES', dept: 'CALDAS' },
          '18001': { city: 'FLORENCIA', dept: 'CAQUETÁ' },
          '19001': { city: 'POPAYÁN', dept: 'CAUCA' },
          '20001': { city: 'VALLEDUPAR', dept: 'CESAR' },
          '23001': { city: 'MONTERÍA', dept: 'CÓRDOBA' },
          '27001': { city: 'QUIBDÓ', dept: 'CHOCÓ' },
          '41001': { city: 'NEIVA', dept: 'HUILA' },
          '44001': { city: 'RIOHACHA', dept: 'LA GUAJIRA' },
          '47001': { city: 'SANTA MARTA', dept: 'MAGDALENA' },
          '50001': { city: 'VILLAVICENCIO', dept: 'META' },
          '52001': { city: 'PASTO', dept: 'NARIÑO' },
          '54001': { city: 'CÚCUTA', dept: 'NORTE DE SANTANDER' },
          '63001': { city: 'ARMENIA', dept: 'QUINDÍO' },
          '66001': { city: 'PEREIRA', dept: 'RISARALDA' },
          '68001': { city: 'BUCARAMANGA', dept: 'SANTANDER' },
          '70001': { city: 'SINCELEJO', dept: 'SUCRE' },
          '73001': { city: 'IBAGUÉ', dept: 'TOLIMA' },
          '76001': { city: 'CALI', dept: 'VALLE DEL CAUCA' },
          '76109': { city: 'BUENAVENTURA', dept: 'VALLE DEL CAUCA' },
          '76111': { city: 'BUGA', dept: 'VALLE DEL CAUCA' },
          '76520': { city: 'PALMIRA', dept: 'VALLE DEL CAUCA' },
          '76892': { city: 'YUMBO', dept: 'VALLE DEL CAUCA' },
          '76364': { city: 'JAMUNDÍ', dept: 'VALLE DEL CAUCA' },
          '76147': { city: 'CARTAGO', dept: 'VALLE DEL CAUCA' },
          '76834': { city: 'TULUÁ', dept: 'VALLE DEL CAUCA' },
          '81001': { city: 'ARAUCA', dept: 'ARAUCA' },
          '85001': { city: 'YOPAL', dept: 'CASANARE' },
          '86001': { city: 'MOCOA', dept: 'PUTUMAYO' },
          '88001': { city: 'SAN ANDRÉS', dept: 'SAN ANDRÉS Y PROVIDENCIA' },
          '91001': { city: 'LETICIA', dept: 'AMAZONAS' },
          '94001': { city: 'INÍRIDA', dept: 'GUAINÍA' },
          '95001': { city: 'SAN JOSÉ DEL GUAVIARE', dept: 'GUAVIARE' },
          '97001': { city: 'MITÚ', dept: 'VAUPÉS' },
          '99001': { city: 'PUERTO CARREÑO', dept: 'VICHADA' }
        };

        const formatCityDeptStr = (cityVal, deptVal, cityCodeVal, deptCodeVal, fallbackAddrInfo) => {
          let code = (cityCodeVal || '').trim();
          let city = (cityVal || '').trim();
          let dept = (deptVal || '').trim();

          if (!code && /^\d{5}$/.test(city)) {
            code = city;
            city = '';
          }

          if (code && DANE_MUNIS[code]) {
            if (!city) city = DANE_MUNIS[code].city;
            if (!dept) dept = DANE_MUNIS[code].dept;
          }

          if (!dept) {
            let dCode = (deptCodeVal || '').trim();
            if (!dCode && code && code.length >= 2) {
              dCode = code.slice(0, 2);
            }
            if (dCode && DANE_DEPTS[dCode]) {
              dept = DANE_DEPTS[dCode];
            }
          }

          if ((!city || !dept) && fallbackAddrInfo?.cityDept) {
            const parts = fallbackAddrInfo.cityDept.split(',');
            if (!city && parts[0]) city = parts[0].trim();
            if (!dept && parts[1]) dept = parts[1].trim();
          }

          let locationText = '';
          if (city && dept) {
            locationText = city.toLowerCase() === dept.toLowerCase() ? city : `${city}, ${dept}`;
          } else {
            locationText = city || dept || '';
          }

          if (code) {
            return locationText ? `${code} - ${locationText}` : code;
          }
          return locationText;
        };

        // Helper to draw a list of info key-value pairs dynamically without text collision
        const drawInfoBlock = (items, xOffset, startY) => {
          let currY = startY;
          items.forEach(({ label, val }) => {
            const labelWidth = 85;
            const valWidth = 170;
            const textVal = String(val || '').trim();
            
            doc.font('Helvetica').fontSize(8);
            const labelHeight = doc.heightOfString(label, { width: labelWidth });
            const valHeight = textVal ? doc.heightOfString(textVal, { width: valWidth }) : 10;
            const rowHeight = Math.max(labelHeight, valHeight, 10);

            doc.font('Helvetica').fontSize(8).fillColor('#000000').text(label, xOffset, currY, { width: labelWidth });
            doc.font('Helvetica').fontSize(8).fillColor('#1F2937').text(textVal, xOffset + 90, currY, { width: valWidth });

            currY += rowHeight + 1.5;
          });
          return currY;
        };

        // Supplier clean NIT (strip existing DV)
        const rawSupplierNit = String(supplierNit || '').split('-')[0];
        const supplierDv = calcularDV(rawSupplierNit);

        // Extract real obligations from XML (TaxLevelCode)
        const supplierTaxLevel = extractField('AccountingSupplierParty', 'TaxLevelCode') || 'NO APLICA';
        const customerTaxLevel = extractField('AccountingCustomerParty', 'TaxLevelCode') || 'NO APLICA';

        // Emitter values
        const suppAddrInfo = parseAddress(supplierAddress);
        const suppCityDeptStr = formatCityDeptStr(supplierCity, supplierDept, supplierCityCode, supplierDeptCode, suppAddrInfo);
        const emitterItems = [
          { label: 'Razón Social', val: supplierName },
          { label: 'NIT', val: rawSupplierNit + (supplierDv ? ` - ${supplierDv}` : '') },
          { label: 'Obligación', val: supplierTaxLevel },
          { label: 'Email', val: supplierEmail || '' },
          { label: 'Teléfono', val: supplierPhone || '' },
          { label: 'Dirección Fiscal', val: suppAddrInfo.mainAddr || supplierAddress || '' },
          { label: 'Ciudad, Depart.', val: suppCityDeptStr || '' }
        ];

        // Customer clean NIT
        const rawCustomerNit = String(customerNit || '').split('-')[0];
        const custDv = calcularDV(rawCustomerNit);

        // Customer values
        const custAddrInfo = parseAddress(customerAddress);
        const custCityDeptStr = formatCityDeptStr(customerCity, customerDept, customerCityCode, customerDeptCode, custAddrInfo);
        const customerItems = [
          { label: 'Razón Social', val: customerName },
          { label: 'NIT', val: rawCustomerNit + (custDv ? ` - ${custDv}` : '') },
          { label: 'Obligación', val: customerTaxLevel },
          { label: 'Email', val: customerEmail || '' },
          { label: 'Teléfono', val: customerPhone || '' },
          { label: 'Dirección', val: custAddrInfo.mainAddr || customerAddress || '' },
          { label: 'Ciudad, Depart.', val: custCityDeptStr || '' }
        ];

        const emitterEndY = drawInfoBlock(emitterItems, L, detailsStartY);
        const customerEndY = drawInfoBlock(customerItems, L + 280, detailsStartY);

        const detailsBoxHeight = Math.max(emitterEndY, customerEndY) - detailsStartY;

        // Vertical Divider line between Emitter and Customer details
        doc.moveTo(L + 270, y).lineTo(L + 270, detailsStartY + detailsBoxHeight).strokeColor('#E5E7EB').lineWidth(0.5).stroke();

        y = detailsStartY + detailsBoxHeight + 8;

        // --- 5. ITEMS TABLE HEADER ---
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 2.5;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 5;

        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#000000');
        const cols = {
          no: L,
          ref: L + 18,
          ean: L + 63,
          desc: L + 118,
          um: L + 215,
          qty: L + 240,
          price: L + 265,
          dcto: L + 310,
          taxName: L + 340,
          taxPercent: L + 370,
          taxVal: L + 395,
          total: L + 440
        };

        doc.text('No', cols.no, y)
           .text('CÓDIGO', cols.ref, y)
           .text('REF / BARRAS', cols.ean, y)
           .text('DESCRIPCIÓN', cols.desc, y)
           .text('U/M', cols.um, y, { width: 22, align: 'right' })
           .text('CANT', cols.qty, y, { width: 22, align: 'right' })
           .text('PRECIO', cols.price, y, { width: 42, align: 'right' })
           .text('DCTO%', cols.dcto, y, { width: 27, align: 'right' })
           .text('IMP', cols.taxName, y, { width: 27, align: 'right' })
           .text('IMP%', cols.taxPercent, y, { width: 22, align: 'right' })
           .text('VAL IMP', cols.taxVal, y, { width: 42, align: 'right' })
           .text('TOTAL ITEM', cols.total, y, { width: 112, align: 'right' });
        
        y += 10;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- 6. ITEMS ROWS ---
        doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
        
        lines.forEach((line, idx) => {
          if (y > doc.page.height - 130) {
            doc.addPage();
            y = 40;
            
            // Repeat Header on new page
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
            y += 2.5;
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
            y += 5;
            doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#000000');
            doc.text('No', cols.no, y).text('CÓDIGO', cols.ref, y).text('REF / BARRAS', cols.ean, y).text('DESCRIPCIÓN', cols.desc, y)
               .text('U/M', cols.um, y, { width: 22, align: 'right' }).text('CANT', cols.qty, y, { width: 22, align: 'right' })
               .text('PRECIO', cols.price, y, { width: 42, align: 'right' }).text('DCTO%', cols.dcto, y, { width: 27, align: 'right' })
               .text('IMP', cols.taxName, y, { width: 27, align: 'right' }).text('IMP%', cols.taxPercent, y, { width: 22, align: 'right' })
               .text('VAL IMP', cols.taxVal, y, { width: 42, align: 'right' }).text('TOTAL ITEM', cols.total, y, { width: 112, align: 'right' });
            y += 10;
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
            y += 6;
            doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          }

          const descHeight = doc.heightOfString(line.desc, { width: 95 });
          
          doc.text(String(idx + 1), cols.no, y)
             .text(line.code || '—', cols.ref, y, { width: 42 })
             .text(line.standardId || '—', cols.ean, y, { width: 52 })
             .text(line.desc, cols.desc, y, { width: 95 })
             .text(line.um || 'EA', cols.um, y, { width: 22, align: 'right' })
             .text(String(line.qty), cols.qty, y, { width: 22, align: 'right' })
             .text(fmt(line.unitPrice), cols.price, y, { width: 42, align: 'right' })
             .text(line.discountRate ? `${line.discountRate}%` : '0%', cols.dcto, y, { width: 27, align: 'right' })
             .text(line.taxName || 'IVA', cols.taxName, y, { width: 27, align: 'right' })
             .text(line.ivaRate ? `${line.ivaRate}%` : '0%', cols.taxPercent, y, { width: 22, align: 'right' })
             .text(fmt(line.taxVal), cols.taxVal, y, { width: 42, align: 'right' })
             .text(fmt(line.lineTotal), cols.total, y, { width: 112, align: 'right' });

          y += Math.max(descHeight + 4, 13);
        });

        // Table Bottom line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 8;

        // --- 7. TAXES, WITHHOLDINGS, AND TOTALS LAYOUT ---
        const rightColW = 220;
        const rightColX = L + W - rightColW;
        const leftColW = rightColX - L - 15;
        const leftColX = L;
        
        let leftY = y;
        let rightY = y;

        // Draw QR Code inside bottom left section
        let txX = leftColX;
        let txW = leftColW;
        if (qrBuffer) {
          try {
            doc.image(qrBuffer, leftColX, leftY, { width: 70, height: 70 });
            txX = leftColX + 80;
            txW = leftColW - 80;
          } catch (e) {
            console.warn("[ORCHESTRATOR] Error adding QR image at bottom:", e.message);
          }
        }

        // Draw Taxes Breakdown
        if (taxTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('DISCRIMINACIÓN DE IMPUESTOS', txX, leftY);
          leftY += 10;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 3;
          
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('IMPUESTO', txX, leftY)
             .text('TARIFA', txX + 50, leftY, { width: 35, align: 'right' })
             .text('BASE', txX + 90, leftY, { width: 50, align: 'right' })
             .text('VALOR IMPUESTO', txX + 145, leftY, { width: 70, align: 'right' });
          leftY += 11;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          taxTotals.forEach(t => {
            doc.text(t.name, txX, leftY)
               .text(`${t.rate}%`, txX + 50, leftY, { width: 35, align: 'right' })
               .text(fmt(t.base), txX + 90, leftY, { width: 50, align: 'right' })
               .text(fmt(t.amount), txX + 145, leftY, { width: 70, align: 'right' });
            leftY += 11;
          });
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }

        // Draw Withholdings Breakdown
        if (withholdingTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('DISCRIMINACIÓN DE RETENCIONES', txX, leftY);
          leftY += 10;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 3;
          
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('RETENCION', txX, leftY)
             .text('TARIFA', txX + 50, leftY, { width: 35, align: 'right' })
             .text('BASE', txX + 90, leftY, { width: 50, align: 'right' })
             .text('VALOR RETENCION', txX + 145, leftY, { width: 70, align: 'right' });
          leftY += 11;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          withholdingTotals.forEach(w => {
            doc.text(w.name, txX, leftY)
               .text(`${w.rate}%`, txX + 50, leftY, { width: 35, align: 'right' })
               .text(fmt(w.base), txX + 90, leftY, { width: 50, align: 'right' })
               .text(fmt(w.amount), txX + 145, leftY, { width: 70, align: 'right' });
            leftY += 11;
          });
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }

        // Draw Equivalences Summary
        if (totalCajas > 0 || totalM2 > 0 || totalPesoKg > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('RESUMEN DE EQUIVALENCIAS Y TOTALES', txX, leftY);
          leftY += 10;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(7).fillColor('#1F2937');
          let equivLines = [];
          if (totalCajas > 0) equivLines.push(`Total Cajas: ${Number(totalCajas.toFixed(2))} CJ`);
          if (totalM2 > 0) equivLines.push(`Total Metros Cuadrados: ${Number(totalM2.toFixed(2))} M²`);
          if (totalUnidades > 0) equivLines.push(`Total Unidades: ${Number(totalUnidades.toFixed(2))} UND`);
          if (totalPesoKg > 0) equivLines.push(`Total Peso Estimado: ${Number(totalPesoKg.toFixed(2))} Kg`);
          
          equivLines.forEach(lineText => {
            doc.text(lineText, txX, leftY);
            leftY += 10;
          });
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }
        
        if (qrBuffer) {
          leftY = Math.max(leftY, y + 75);
        }

        // Draw Totals Box
        doc.moveTo(rightColX, rightY).lineTo(L + W, rightY).strokeColor('#000000').lineWidth(0.75).stroke();
        rightY += 6;

        doc.font('Helvetica').fontSize(8.5).fillColor('#000000');
        doc.text('Subtotal', rightColX, rightY)
           .text(fmt(lineExtension), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
        rightY += 13;
        
        if (taxAmount > 0) {
          doc.text('IVA', rightColX, rightY)
             .text(fmt(taxAmount), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
          rightY += 13;
        }

        const totalWithholdingVal = withholdingTotals.reduce((sum, w) => sum + w.amount, 0);
        if (totalWithholdingVal > 0) {
          doc.font('Helvetica').fontSize(8.5);
          doc.text('Total Retenciones', rightColX, rightY)
             .text(fmt(-totalWithholdingVal), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
          rightY += 13;
        }

        doc.moveTo(rightColX, rightY).lineTo(L + W, rightY).strokeColor('#000000').lineWidth(0.5).stroke();
        rightY += 6;

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
        doc.text('Total a Pagar', rightColX, rightY)
           .text(fmt(payableAmount - totalWithholdingVal), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
        rightY += 16;
        
        y = Math.max(leftY, rightY) + 20;

        // --- 8. SIGNATURES SECTION ---
        if (y > doc.page.height - 90) {
          doc.addPage();
          y = 50;
        }
        
        const sigLineW = 160;
        const sigL = L + 30;
        const sigR = L + W - sigLineW - 30;

        doc.moveTo(sigL, y).lineTo(sigL + sigLineW, y).strokeColor('#000000').lineWidth(0.5).stroke();
        doc.moveTo(sigR, y).lineTo(sigR + sigLineW, y).stroke();
        
        y += 6;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
        doc.text('FIRMA EMISOR', sigL, y, { width: sigLineW, align: 'center' });
        doc.text('FIRMA CLIENTE', sigR, y, { width: sigLineW, align: 'center' });

        // --- 9. FOOTER SECTION ---
        const pageH = doc.page.height;
        doc.page.margins.bottom = 10;
        
        const codeLabel = (isDS || isNDS) ? 'CUDS: ' : 'CUFE: ';
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000')
           .text(codeLabel, L, pageH - 62, { continued: true })
           .font('Helvetica').fontSize(6.5).fillColor('#1F2937')
           .text(cufe, { width: W });
        
        const defaultFooter = (isDS || isNDS)
          ? 'Representación impresa de Documento soporte en adquisiciones efectuadas a no obligados a facturar generada conforme a la Resolución 000167 de 2021 de la DIAN. Software: GRAVY.'
          : 'Este documento es la representación gráfica de una Factura Electrónica de Venta generada conforme al Decreto 358 de 2020 y la Resolución 000042 de 2020 de la DIAN. La validez fiscal recae exclusivamente sobre el archivo XML firmado digitalmente.';

        doc.font('Helvetica').fontSize(7).fillColor('#4B5563')
           .text(configFooter || defaultFooter, L, pageH - 45, { width: W, align: 'center' });

        doc.font('Helvetica').fontSize(7.5).fillColor('#000000')
           .text('PÁGINA 1 / 1', L + W - 60, pageH - 35, { width: 60, align: 'right' });

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

app.post('/api/dian/generate-pdf', async (req, res) => {
  try {
    const { xmlContent, filename = 'document', invoiceData } = req.body;
    const pdfBuffer = await generateInvoicePdf(xmlContent || '', filename, invoiceData || null);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `inline; filename="${filename}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[GRAVY ORCHESTRATOR] Error al generar PDF DIAN:', err);
    res.status(500).json({ error: err.message });
  }
});

const ORCHESTRATOR_PORT = 8088;

function startExistingCompanies() {
  try {
    if (!fs.existsSync(EMPRESAS_DIR)) {
      console.log(`[GRAVY ORCHESTRATOR] Directorio de empresas no encontrado: ${EMPRESAS_DIR}`);
      return;
    }
    
    const bindIp = process.env.GRAVY_BIND_IP || '127.0.0.1';
    const files = fs.readdirSync(EMPRESAS_DIR);
    const pbExe = path.join(BASE_DIR, 'pocketbase.exe');
    
    if (!fs.existsSync(pbExe)) {
      console.error(`[GRAVY ORCHESTRATOR] pocketbase.exe no encontrado en ${pbExe}`);
      return;
    }
    
    for (const file of files) {
      const dirPath = path.join(EMPRESAS_DIR, file);
      if (!fs.statSync(dirPath).isDirectory()) continue;
      
      const match = file.match(/^empresa_(\d+)$/);
      if (!match) continue;
      
      const port = parseInt(match[1], 10);
      const companyPbData = path.join(dirPath, 'pb_data');
      const companyPbHooks = path.join(dirPath, 'pb_hooks');
      
      // Sincronizar hooks genéricos desde la raíz a la empresa
      if (fs.existsSync(PB_HOOKS_DIR) && fs.existsSync(companyPbHooks)) {
        try {
          const hookFiles = fs.readdirSync(PB_HOOKS_DIR);
          for (const hFile of hookFiles) {
            if (hFile === 'setup.pb.js' || hFile === 'zz_seed_user.pb.js') continue;
            const srcPath = path.join(PB_HOOKS_DIR, hFile);
            const destPath = path.join(companyPbHooks, hFile);
            if (fs.statSync(srcPath).isFile()) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
          console.log(`[GRAVY ORCHESTRATOR] Hooks genéricos sincronizados para empresa ${port}.`);
        } catch (syncErr) {
          console.warn(`[GRAVY ORCHESTRATOR] Advertencia al sincronizar hooks para empresa ${port}:`, syncErr.message);
        }
      }

      console.log(`[GRAVY ORCHESTRATOR] Auto-arrancando empresa existente en puerto ${port} (bind: ${bindIp})...`);
      
      const pbProcess = spawn(pbExe, [
        'serve',
        `--http=${bindIp}:${port}`,
        `--dir=${companyPbData}`,
        `--hooksDir=${companyPbHooks}`,
        `--publicDir=${PB_PUBLIC_DIR}`,
        `--migrationsDir=${PB_MIGRATIONS_DIR}`
      ], {
        cwd: dirPath,
        detached: true,
        stdio: 'ignore'
      });
      
      pbProcess.unref();
      activeProcesses[port] = { port, pid: pbProcess.pid };
    }
  } catch (err) {
    console.error('[GRAVY ORCHESTRATOR] Error auto-arrancando empresas existentes:', err);
  }
}

// Registrar rutas y programador de respaldos desatendidos
backupService.registerRoutes(app);
backupService.setupScheduler(2); // Ejecutar respaldo automático diario a las 2:00 AM

// Iniciar inquilinos registrados antes de escuchar
startExistingCompanies();

app.listen(ORCHESTRATOR_PORT, () => {
  console.log(`GRAVY Orchestrator running on port ${ORCHESTRATOR_PORT}`);
}).on('error', (err) => {
  writeCrashLog('LISTEN_ERROR', err);
});

