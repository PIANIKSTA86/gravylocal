const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));
const { simpleParser } = require(path.join(hubModules, 'mailparser'));
const AdmZip = require(path.join(hubModules, 'adm-zip'));
const { parseInvoiceXml } = require('../hub/imap-service');

async function inspectSpamInvoices() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: 'ventas.gravy@gmail.com',
      pass: 'wlok jiad elst juir'
    },
    logger: false
  });

  await client.connect();

  const lock = await client.getMailboxLock('[Gmail]/Spam');
  try {
    for await (const message of client.fetch('1:*', { envelope: true, source: true })) {
      console.log('====================================');
      console.log(`Subj: ${message.envelope.subject}`);
      console.log(`From: ${message.envelope.from?.[0]?.address}`);
      const parsed = await simpleParser(message.source);
      console.log(`Attachments count: ${parsed.attachments ? parsed.attachments.length : 0}`);
      if (parsed.attachments) {
        for (const att of parsed.attachments) {
          console.log(`  -> ${att.filename} (${att.contentType}, ${att.size} bytes)`);
          if (att.filename.toLowerCase().endsWith('.xml')) {
            const inv = parseInvoiceXml(att.content.toString('utf-8'));
            console.log('     XML Invoice Parsed:', inv ? { cufe: inv.cufe, num: inv.number, supplier: inv.supplierName, customerNit: inv.customerNit, customerName: inv.customerName, total: inv.total } : 'No CUFE found');
          } else if (att.filename.toLowerCase().endsWith('.zip')) {
            try {
              const zip = new AdmZip(att.content);
              for (const entry of zip.getEntries()) {
                console.log(`     ZIP Entry: ${entry.entryName}`);
                if (entry.entryName.toLowerCase().endsWith('.xml')) {
                  const inv = parseInvoiceXml(entry.getData().toString('utf-8'));
                  console.log('       Parsed from ZIP:', inv ? { cufe: inv.cufe, num: inv.number, supplier: inv.supplierName, customerNit: inv.customerNit, customerName: inv.customerName, total: inv.total } : 'No CUFE');
                }
              }
            } catch (ze) {
              console.log('     Error unzip:', ze.message);
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

inspectSpamInvoices().catch(console.error);
