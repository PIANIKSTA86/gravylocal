/**
 * GRAVY v2.0 — imap-service.js
 * Servicio de lectura e ingestión automática de facturas electrónicas desde el Buzón IMAP.
 * Se conecta a la bandeja de entrada del correo corporativo registrado en el RUT,
 * extrae archivos adjuntos (.xml / .zip con UBL 2.1), identifica el CUFE y metadatos,
 * y los entrega listos para encolar en MATIAS API y registrar en electronic_documents.
 */

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const AdmZip = require('adm-zip');

/**
 * Valida la conexión con el servidor IMAP.
 */
async function testImapConnection({ host, port, user, pass, tls = true }) {
  const client = new ImapFlow({
    host: String(host).trim(),
    port: parseInt(port, 10) || 993,
    secure: tls === true || tls === '1' || tls === 1,
    auth: {
      user: String(user).trim(),
      pass: String(pass).trim()
    },
    logger: false
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    let messagesCount = 0;
    try {
      messagesCount = client.mailbox.exists;
    } finally {
      lock.release();
    }
    await client.logout();
    return { success: true, messagesCount };
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    throw new Error(err.message || 'Fallo de autenticación o conexión IMAP');
  }
}

/**
 * Extrae texto o etiqueta de un XML.
 */
function extractXmlTag(xml, tag) {
  const reg = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tag}>`, 'i');
  const m = xml.match(reg);
  return m ? m[1].trim() : '';
}

/**
 * Parsea un contenido XML UBL 2.1 de factura, nota o attached document.
 */
function parseInvoiceXml(xmlContent) {
  if (!xmlContent || typeof xmlContent !== 'string') return null;

  // Buscar CUFE / CUDE
  let cufe = '';
  const uuidMatch = xmlContent.match(/<(?:[a-zA-Z0-9_]+:)?UUID[^>]*>([a-fA-F0-9]{64,96})<\//i);
  if (uuidMatch) {
    cufe = uuidMatch[1].trim();
  }

  if (!cufe) {
    // Si es AttachedDocument, buscar dentro del cdata o nodo anidado
    const cdataMatch = xmlContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    if (cdataMatch) {
      const nestedUuid = cdataMatch[1].match(/<(?:[a-zA-Z0-9_]+:)?UUID[^>]*>([a-fA-F0-9]{64,96})<\//i);
      if (nestedUuid) cufe = nestedUuid[1].trim();
    }
  }

  // Si no se encontró ningún CUFE válido de 64 o 96 caracteres hex, no es un documento fiscal DIAN válido
  if (!cufe) return null;

  // Determinar número del documento
  let number = extractXmlTag(xmlContent, 'ID');
  if (!number && xmlContent.includes('cbc:ID')) {
    const idMatch = xmlContent.match(/<cbc:ID[^>]*>([A-Za-z0-9\-]+)<\/cbc:ID>/i);
    if (idMatch) number = idMatch[1].trim();
  }

  // Datos del Emisor (Proveedor)
  let supplierNit = '';
  let supplierName = '';
  const supplierMatch = xmlContent.match(/<cac:AccountingSupplierParty>([\s\S]*?)<\/cac:AccountingSupplierParty>/i);
  if (supplierMatch) {
    const sBlock = supplierMatch[1];
    supplierNit = extractXmlTag(sBlock, 'CompanyID');
    supplierName = extractXmlTag(sBlock, 'RegistrationName') || extractXmlTag(sBlock, 'Name');
  }

  // Datos del Receptor (Cliente / Nuestra Empresa)
  let customerNit = '';
  let customerName = '';
  const customerMatch = xmlContent.match(/<cac:AccountingCustomerParty>([\s\S]*?)<\/cac:AccountingCustomerParty>/i);
  if (customerMatch) {
    const cBlock = customerMatch[1];
    customerNit = extractXmlTag(cBlock, 'CompanyID');
    customerName = extractXmlTag(cBlock, 'RegistrationName') || extractXmlTag(cBlock, 'Name');
  }

  // Fecha y total
  const issueDate = extractXmlTag(xmlContent, 'IssueDate') || new Date().toISOString().slice(0, 10);
  const totalPayable = parseFloat(extractXmlTag(xmlContent, 'PayableAmount') || '0') || 0;
  const lineExtension = parseFloat(extractXmlTag(xmlContent, 'LineExtensionAmount') || '0') || totalPayable;
  const taxAmount = parseFloat(extractXmlTag(xmlContent, 'TaxAmount') || '0') || 0;

  // Determinar tipo de documento
  let docType = 'invoice_purchase';
  if (xmlContent.includes('<CreditNote') || xmlContent.includes('InvoiceTypeCode>91')) {
    docType = 'credit_note';
  } else if (xmlContent.includes('<DebitNote') || xmlContent.includes('InvoiceTypeCode>92')) {
    docType = 'debit_note';
  } else if (xmlContent.includes('InvoiceTypeCode>05') || xmlContent.includes('documento soporte')) {
    docType = 'support_document';
  }

  return {
    cufe,
    number: number || 'SIN-NUMERO',
    supplierNit: supplierNit.replace(/[^0-9]/g, ''),
    supplierName: supplierName || 'PROVEEDOR DIAN',
    customerNit: customerNit.replace(/[^0-9]/g, ''),
    customerName: customerName || '',
    issueDate,
    subtotal: lineExtension,
    taxAmount,
    total: totalPayable || (lineExtension + taxAmount),
    documentType: docType,
    xmlContent
  };
}

/**
 * Escanea la bandeja de entrada buscando correos con facturas electrónicas y extrayendo sus XMLs.
 */
async function syncImapInvoices({ host, port, user, pass, tls = true, maxEmails = 50 }) {
  const client = new ImapFlow({
    host: String(host).trim(),
    port: parseInt(port, 10) || 993,
    secure: tls === true || tls === '1' || tls === 1,
    auth: {
      user: String(user).trim(),
      pass: String(pass).trim()
    },
    logger: false
  });

  const parsedInvoices = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      // Buscar correos no leídos o los últimos N correos
      const messages = client.fetch({ seen: false }, { source: true, uid: true });
      let count = 0;

      for await (const message of messages) {
        if (count >= maxEmails) break;
        count++;

        try {
          const parsed = await simpleParser(message.source);

          // Revisar adjuntos
          if (parsed.attachments && parsed.attachments.length > 0) {
            for (const att of parsed.attachments) {
              const filename = (att.filename || '').toLowerCase();

              // Caso 1: Archivo XML directo
              if (filename.endsWith('.xml') || att.contentType === 'text/xml' || att.contentType === 'application/xml') {
                const xmlStr = att.content.toString('utf-8');
                const invData = parseInvoiceXml(xmlStr);
                if (invData && !parsedInvoices.some(i => i.cufe === invData.cufe)) {
                  parsedInvoices.push(invData);
                }
              }

              // Caso 2: Archivo ZIP contenedor (estándar AttachedDocument DIAN)
              else if (filename.endsWith('.zip') || att.contentType.includes('zip')) {
                try {
                  const zip = new AdmZip(att.content);
                  const zipEntries = zip.getEntries();
                  for (const entry of zipEntries) {
                    if (entry.entryName.toLowerCase().endsWith('.xml')) {
                      const xmlStr = entry.getData().toString('utf-8');
                      const invData = parseInvoiceXml(xmlStr);
                      if (invData && !parsedInvoices.some(i => i.cufe === invData.cufe)) {
                        parsedInvoices.push(invData);
                      }
                    }
                  }
                } catch (zipErr) {
                  console.warn(`[IMAP] No se pudo descomprimir adjunto ${filename}:`, zipErr.message);
                }
              }
            }
          }

          // Marcar como leído
          await client.messageFlagsAdd({ uid: message.uid }, ['\\Seen']);
        } catch (msgErr) {
          console.warn('[IMAP] Error procesando correo UID ' + message.uid + ':', msgErr.message);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    return {
      success: true,
      foundCount: parsedInvoices.length,
      invoices: parsedInvoices
    };
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    throw new Error(err.message || 'Error durante la sincronización IMAP');
  }
}

/**
 * Registra rutas en la app Express de hub/orchestrator.js
 */
function registerRoutes(app) {
  // Probar conexión IMAP
  app.post('/api/imap/test', async (req, res) => {
    try {
      const result = await testImapConnection(req.body || {});
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  });

  // Sincronizar correos de facturación
  app.post('/api/imap/sync', async (req, res) => {
    try {
      const result = await syncImapInvoices(req.body || {});
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}

module.exports = {
  testImapConnection,
  syncImapInvoices,
  parseInvoiceXml,
  registerRoutes
};
