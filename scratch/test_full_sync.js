const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));
const { simpleParser } = require(path.join(hubModules, 'mailparser'));
const AdmZip = require(path.join(hubModules, 'adm-zip'));

function extractXmlTag(xml, tag) {
  const reg = new RegExp(`<(?:[a-zA-Z0-9_]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_]+:)?${tag}>`, 'i');
  const m = xml.match(reg);
  return m ? m[1].trim() : '';
}

function parseInvoiceXml(xmlContent) {
  if (!xmlContent || typeof xmlContent !== 'string') return null;

  let mainXml = xmlContent;
  const cdataMatch = xmlContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch && (cdataMatch[1].includes('<Invoice') || cdataMatch[1].includes('<CreditNote') || cdataMatch[1].includes('<DebitNote'))) {
    mainXml = cdataMatch[1];
  }

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

  let number = '';
  const idMatch = mainXml.match(/<cbc:ID\b[^>]*>([^<]+)<\/cbc:ID>/i);
  if (idMatch) {
    number = idMatch[1].trim();
  }
  if (!number) {
    number = extractXmlTag(mainXml, 'ID');
  }

  let supplierNit = '';
  let supplierName = '';
  const supplierMatch = mainXml.match(/<cac:AccountingSupplierParty\b[^>]*>([\s\S]*?)<\/cac:AccountingSupplierParty>/i);
  if (supplierMatch) {
    const sBlock = supplierMatch[1];
    supplierNit = extractXmlTag(sBlock, 'CompanyID');
    supplierName = extractXmlTag(sBlock, 'RegistrationName') || extractXmlTag(sBlock, 'Name');
  }

  let customerNit = '';
  let customerName = '';
  const customerMatch = mainXml.match(/<cac:AccountingCustomerParty\b[^>]*>([\s\S]*?)<\/cac:AccountingCustomerParty>/i);
  if (customerMatch) {
    const cBlock = customerMatch[1];
    customerNit = extractXmlTag(cBlock, 'CompanyID');
    customerName = extractXmlTag(cBlock, 'RegistrationName') || extractXmlTag(cBlock, 'Name');
  }

  const issueDate = extractXmlTag(mainXml, 'IssueDate') || new Date().toISOString().slice(0, 10);
  const totalPayable = parseFloat(extractXmlTag(mainXml, 'PayableAmount') || '0') || 0;
  const lineExtension = parseFloat(extractXmlTag(mainXml, 'LineExtensionAmount') || '0') || totalPayable;
  const taxAmount = parseFloat(extractXmlTag(mainXml, 'TaxAmount') || '0') || 0;

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

async function runTestSync() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: 'ventas.gravy@gmail.com', pass: 'wlok jiad elst juir' },
    logger: false
  });

  const rawMessages = [];
  const parsedInvoices = [];

  await client.connect();

  try {
    const mailboxList = await client.list();
    const foldersToScan = ['INBOX'];
    for (const item of mailboxList) {
      if (item.flags.has('\\Junk') || item.path.toLowerCase().includes('spam')) {
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
              const from = Math.max(1, total - 20 + 1);
              targetSeq = `${from}:${total}`;
            } else if (targetSeq.length > 20) {
              targetSeq = targetSeq.slice(-20);
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
            }
          }
        } finally {
          lock.release();
        }
      } catch (fErr) {
        console.warn(`Error scanning folder ${folder}:`, fErr.message);
      }
    }
  } finally {
    await client.logout();
  }

  console.log(`Downloaded ${rawMessages.length} raw messages from all folders.`);

  for (const raw of rawMessages) {
    try {
      const parsed = await simpleParser(raw.source);
      if (parsed.attachments && parsed.attachments.length > 0) {
        for (const att of parsed.attachments) {
          const fn = (att.filename || '').toLowerCase();
          if (fn.endsWith('.xml') || att.contentType === 'text/xml' || att.contentType === 'application/xml') {
            const inv = parseInvoiceXml(att.content.toString('utf-8'));
            if (inv && !parsedInvoices.some(i => i.cufe === inv.cufe)) {
              parsedInvoices.push(inv);
            }
          } else if (fn.endsWith('.zip') || att.contentType.includes('zip')) {
            try {
              const zip = new AdmZip(att.content);
              for (const entry of zip.getEntries()) {
                if (entry.entryName.toLowerCase().endsWith('.xml')) {
                  const inv = parseInvoiceXml(entry.getData().toString('utf-8'));
                  if (inv && !parsedInvoices.some(i => i.cufe === inv.cufe)) {
                    parsedInvoices.push(inv);
                  }
                }
              }
            } catch (ze) {}
          }
        }
      }
    } catch (pe) {}
  }

  console.log(`Parsed ${parsedInvoices.length} valid electronic invoices:`);
  parsedInvoices.forEach(i => console.log(` - [${i.number}] ${i.supplierName} ($${i.total}) -> CUFE: ${i.cufe.slice(0, 16)}...`));
}

runTestSync().catch(console.error);
