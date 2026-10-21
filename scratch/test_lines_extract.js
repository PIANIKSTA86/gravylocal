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

function parseFullInvoiceXml(xmlContent) {
  let mainXml = xmlContent;
  const cdataMatch = xmlContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch && (cdataMatch[1].includes('<Invoice') || cdataMatch[1].includes('<CreditNote') || cdataMatch[1].includes('<DebitNote'))) {
    mainXml = cdataMatch[1];
  }

  const numberMatch = mainXml.match(/<cbc:ID\b[^>]*>([^<]+)<\/cbc:ID>/i);
  const number = numberMatch ? numberMatch[1].trim() : extractXmlTag(mainXml, 'ID');

  // Extraer líneas (InvoiceLine, CreditNoteLine, DebitNoteLine)
  const lines = [];
  const lineRegex = /<(?:[a-zA-Z0-9_]+:)?(?:InvoiceLine|CreditNoteLine|DebitNoteLine)\b[^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9_]+:)?(?:InvoiceLine|CreditNoteLine|DebitNoteLine)>/gi;
  let lineMatch;
  while ((lineMatch = lineRegex.exec(mainXml)) !== null) {
    const lXml = lineMatch[1];
    const lineId = extractXmlTag(lXml, 'ID');
    const description = extractXmlTag(lXml, 'Description') || 'Producto / Servicio';
    
    // Code
    let code = '';
    const sellersMatch = lXml.match(/<cac:SellersItemIdentification\b[^>]*>([\s\S]*?)<\/cac:SellersItemIdentification>/i);
    if (sellersMatch) code = extractXmlTag(sellersMatch[1], 'ID');
    if (!code) {
      const stdMatch = lXml.match(/<cac:StandardItemIdentification\b[^>]*>([\s\S]*?)<\/cac:StandardItemIdentification>/i);
      if (stdMatch) code = extractXmlTag(stdMatch[1], 'ID');
    }
    if (!code) code = lineId;

    // Quantity
    const qtyMatch = lXml.match(/<(?:[a-zA-Z0-9_]+:)?(?:InvoicedQuantity|CreditedQuantity|DebitedQuantity|Quantity)\b[^>]*>([^<]+)<\//i);
    const qty = parseFloat(qtyMatch ? qtyMatch[1] : '1') || 1;

    // Subtotal
    const subtotal = parseFloat(extractXmlTag(lXml, 'LineExtensionAmount') || '0') || 0;

    // Price
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

  return { number, linesCount: lines.length, lines, taxesCount: taxes.length, taxes };
}

async function testExtractAllLines() {
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
              const res = parseFullInvoiceXml(e.getData().toString('utf-8'));
              console.log(`Doc ${res.number}: ${res.linesCount} items, ${res.taxesCount} taxes.`);
              if (res.lines.length > 0) {
                console.log(`   Ejemplo item 1: ${res.lines[0].description} | Cant: ${res.lines[0].qty} | $${res.lines[0].price} | Sub: $${res.lines[0].subtotal}`);
              }
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

testExtractAllLines().catch(console.error);
