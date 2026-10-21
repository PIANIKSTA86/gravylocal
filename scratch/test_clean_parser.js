function extractXmlTag(xml, tag) {
  const reg = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tag}>`, 'i');
  const m = xml.match(reg);
  return m ? m[1].trim() : '';
}

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

  if (!cufe) return null;

  // Determinar número del documento (buscar cbc:ID en el documento principal)
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
    documentType: docType
  };
}

// Probar con inspect_spam_invoices
const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));
const { simpleParser } = require(path.join(hubModules, 'mailparser'));
const AdmZip = require(path.join(hubModules, 'adm-zip'));

async function testParseSpam() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: 'ventas.gravy@gmail.com', pass: 'wlok jiad elst juir' },
    logger: false
  });
  await client.connect();
  const lock = await client.getMailboxLock('[Gmail]/Spam');
  try {
    for await (const msg of client.fetch('1:*', { source: true })) {
      const parsed = await simpleParser(msg.source);
      for (const att of (parsed.attachments || [])) {
        if (att.filename.toLowerCase().endsWith('.zip')) {
          const zip = new AdmZip(att.content);
          for (const e of zip.getEntries()) {
            if (e.entryName.toLowerCase().endsWith('.xml')) {
              const res = parseInvoiceXml(e.getData().toString('utf-8'));
              console.log('Factura limpia:', res);
            }
          }
        }
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }
}

testParseSpam().catch(console.error);
