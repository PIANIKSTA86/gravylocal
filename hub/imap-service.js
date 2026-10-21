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
  client.on('error', (err) => console.warn('[IMAP] Advertencia conexión test:', err.message));

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
 * Extrae texto o etiqueta de un XML con límites de palabra exactos.
 */
function extractXmlTag(xml, tag) {
  const reg = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tag}>`, 'i');
  const m = xml.match(reg);
  return m ? m[1].trim() : '';
}

/**
 * Parsea un contenido XML UBL 2.1 de factura, nota o attached document.
 */
function parseInvoiceXml(xmlContent) {
  if (!xmlContent || typeof xmlContent !== 'string') return null;

  // 1. Si es un AttachedDocument contenedor, extraer el XML de la factura dentro de CDATA o Attachment
  let mainXml = xmlContent;
  const cdataMatch = xmlContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch && (cdataMatch[1].includes('<Invoice') || cdataMatch[1].includes('<CreditNote') || cdataMatch[1].includes('<DebitNote'))) {
    mainXml = cdataMatch[1];
  }

  // Buscar CUFE / CUDE
  let cufe = '';
  const uuidMatch = mainXml.match(/<(?:[a-zA-Z0-9_]+:)?UUID\b[^>]*>([a-fA-F0-9]{64,96})<\//i);
  if (uuidMatch) {
    cufe = uuidMatch[1].trim();
  }

  if (!cufe) {
    const rawUuid = xmlContent.match(/<(?:[a-zA-Z0-9_]+:)?UUID\b[^>]*>([a-fA-F0-9]{64,96})<\//i);
    if (rawUuid) cufe = rawUuid[1].trim();
  }

  // Si no se encontró ningún CUFE válido de 64 o 96 caracteres hex, no es un documento fiscal DIAN válido
  if (!cufe) return null;

  // Determinar número del documento (cbc:ID limpio)
  let number = '';
  const idMatch = mainXml.match(/<cbc:ID\b[^>]*>([^<]+)<\/cbc:ID>/i);
  if (idMatch) {
    number = idMatch[1].trim();
  }
  if (!number) {
    number = extractXmlTag(mainXml, 'ID');
  }

  // Datos del Emisor (Proveedor)
  let supplierNit = '';
  let supplierName = '';
  const supplierMatch = mainXml.match(/<cac:AccountingSupplierParty\b[^>]*>([\s\S]*?)<\/cac:AccountingSupplierParty>/i);
  if (supplierMatch) {
    const sBlock = supplierMatch[1];
    supplierNit = extractXmlTag(sBlock, 'CompanyID');
    supplierName = extractXmlTag(sBlock, 'RegistrationName') || extractXmlTag(sBlock, 'Name');
  }

  // Datos del Receptor (Cliente / Nuestra Empresa)
  let customerNit = '';
  let customerName = '';
  const customerMatch = mainXml.match(/<cac:AccountingCustomerParty\b[^>]*>([\s\S]*?)<\/cac:AccountingCustomerParty>/i);
  if (customerMatch) {
    const cBlock = customerMatch[1];
    customerNit = extractXmlTag(cBlock, 'CompanyID');
    customerName = extractXmlTag(cBlock, 'RegistrationName') || extractXmlTag(cBlock, 'Name');
  }

  // Fecha y total
  const issueDate = extractXmlTag(mainXml, 'IssueDate') || new Date().toISOString().slice(0, 10);
  const totalPayable = parseFloat(extractXmlTag(mainXml, 'PayableAmount') || '0') || 0;
  const lineExtension = parseFloat(extractXmlTag(mainXml, 'LineExtensionAmount') || '0') || totalPayable;
  const taxAmount = parseFloat(extractXmlTag(mainXml, 'TaxAmount') || '0') || 0;

  // Extraer líneas (InvoiceLine, CreditNoteLine, DebitNoteLine)
  const lines = [];
  const lineRegex = /<(?:[a-zA-Z0-9_]+:)?(?:InvoiceLine|CreditNoteLine|DebitNoteLine)\b[^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9_]+:)?(?:InvoiceLine|CreditNoteLine|DebitNoteLine)>/gi;
  let lineMatch;
  while ((lineMatch = lineRegex.exec(mainXml)) !== null) {
    const lXml = lineMatch[1];
    const lineId = extractXmlTag(lXml, 'ID');
    const description = extractXmlTag(lXml, 'Description') || 'Producto / Servicio';
    
    let code = '';
    const sellersMatch = lXml.match(/<cac:SellersItemIdentification\b[^>]*>([\s\S]*?)<\/cac:SellersItemIdentification>/i);
    if (sellersMatch) code = extractXmlTag(sellersMatch[1], 'ID');
    if (!code) {
      const stdMatch = lXml.match(/<cac:StandardItemIdentification\b[^>]*>([\s\S]*?)<\/cac:StandardItemIdentification>/i);
      if (stdMatch) code = extractXmlTag(stdMatch[1], 'ID');
    }
    if (!code) code = lineId;

    const qtyMatch = lXml.match(/<(?:[a-zA-Z0-9_]+:)?(?:InvoicedQuantity|CreditedQuantity|DebitedQuantity|Quantity)\b[^>]*>([^<]+)<\//i);
    const qty = parseFloat(qtyMatch ? qtyMatch[1] : '1') || 1;
    const subtotal = parseFloat(extractXmlTag(lXml, 'LineExtensionAmount') || '0') || 0;

    let price = 0;
    const priceMatch = lXml.match(/<cac:Price\b[^>]*>([\s\S]*?)<\/cac:Price>/i);
    if (priceMatch) {
      price = parseFloat(extractXmlTag(priceMatch[1], 'PriceAmount') || '0') || 0;
    }
    if (!price && qty > 0) price = subtotal / qty;

    lines.push({ code, description, qty, price, subtotal });
  }

  // Extraer impuestos (TaxSubtotal)
  const taxes = [];
  const taxSubRegex = /<cac:TaxSubtotal\b[^>]*>([\s\S]*?)<\/cac:TaxSubtotal>/gi;
  let taxMatch;
  while ((taxMatch = taxSubRegex.exec(mainXml)) !== null) {
    const tXml = taxMatch[1];
    const amount = parseFloat(extractXmlTag(tXml, 'TaxAmount') || '0') || 0;
    const base = parseFloat(extractXmlTag(tXml, 'TaxableAmount') || '0') || 0;
    const percent = parseFloat(extractXmlTag(tXml, 'Percent') || '0') || 0;
    
    let taxType = 'iva';
    const schemeMatch = tXml.match(/<cac:TaxScheme\b[^>]*>([\s\S]*?)<\/cac:TaxScheme>/i);
    if (schemeMatch) {
      const schemeId = extractXmlTag(schemeMatch[1], 'ID');
      if (schemeId === '02') taxType = 'ica';
      else if (schemeId === '03' || schemeId === '04') taxType = 'inc';
      else if (schemeId === '01') taxType = 'iva';
    }

    taxes.push({ taxType, rate: percent, base, amount });
  }

  // Determinar tipo de documento
  let docType = 'invoice_purchase';
  if (mainXml.includes('<CreditNote') || mainXml.includes('InvoiceTypeCode>91')) {
    docType = 'credit_note';
  } else if (mainXml.includes('<DebitNote') || mainXml.includes('InvoiceTypeCode>92')) {
    docType = 'debit_note';
  } else if (mainXml.includes('InvoiceTypeCode>05') || mainXml.includes('documento soporte')) {
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
    lines,
    taxes,
    xmlContent
  };
}

/**
 * Escanea la bandeja de entrada (y carpetas de Spam/Junk en caso de correos reenviados o filtrados)
 * buscando correos con facturas electrónicas y extrayendo sus XMLs.
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
  client.on('error', (err) => console.warn('[IMAP] Advertencia conexión sync:', err.message));

  const rawMessages = [];
  const parsedInvoices = [];

  try {
    await client.connect();

    // Descubrir carpetas para escanear (INBOX + Spam/Junk para no perder facturas reenviadas o clasificadas como spam)
    const mailboxList = await client.list();
    const foldersToScan = ['INBOX'];
    for (const item of mailboxList) {
      if (item.flags && (item.flags.has('\\Junk') || item.path.toLowerCase().includes('spam'))) {
        foldersToScan.push(item.path);
      }
    }

    for (const folder of foldersToScan) {
      try {
        const lock = await client.getMailboxLock(folder);
        try {
          const total = client.mailbox.exists || 0;
          if (total > 0) {
            let targetSeq = await client.search({ seen: false });
            if (!Array.isArray(targetSeq) || targetSeq.length === 0) {
              const from = Math.max(1, total - maxEmails + 1);
              targetSeq = `${from}:${total}`;
            } else if (targetSeq.length > maxEmails) {
              targetSeq = targetSeq.slice(-maxEmails);
            }

            if (targetSeq && (Array.isArray(targetSeq) ? targetSeq.length > 0 : true)) {
              for await (const message of client.fetch(targetSeq, { source: true, uid: true })) {
                if (message.source) {
                  rawMessages.push({
                    folder,
                    seq: message.seq,
                    uid: message.uid,
                    source: message.source
                  });
                }
              }

              // Marcar mensajes leídos
              const seqs = (await client.search({ seen: false })) || [];
              if (Array.isArray(seqs) && seqs.length > 0) {
                try {
                  await client.messageFlagsAdd(seqs, ['\\Seen']);
                } catch (_) {}
              }
            }
          }
        } finally {
          lock.release();
        }
      } catch (fErr) {
        console.warn(`[IMAP] No se pudo escanear carpeta ${folder}:`, fErr.message);
      }
    }

    await client.logout();
  } catch (err) {
    try { await client.logout(); } catch (_) {}
    throw new Error(err.message || 'Error durante la conexión IMAP');
  }

  // Analizar los adjuntos (.xml / .zip) en memoria
  for (const raw of rawMessages) {
    try {
      const parsed = await simpleParser(raw.source);

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
    } catch (msgErr) {
      console.warn('[IMAP] Error parseando correo UID ' + raw.uid + ':', msgErr.message);
    }
  }

  return {
    success: true,
    foundCount: parsedInvoices.length,
    invoices: parsedInvoices
  };
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
