const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));
const { simpleParser } = require(path.join(hubModules, 'mailparser'));
const AdmZip = require(path.join(hubModules, 'adm-zip'));

async function inspectFirstXml() {
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
    for await (const message of client.fetch('1:1', { source: true })) {
      const parsed = await simpleParser(message.source);
      for (const att of parsed.attachments) {
        if (att.filename.toLowerCase().endsWith('.zip')) {
          const zip = new AdmZip(att.content);
          for (const entry of zip.getEntries()) {
            if (entry.entryName.toLowerCase().endsWith('.xml')) {
              const xml = entry.getData().toString('utf-8');
              console.log('XML snippet (first 1000 chars):');
              console.log(xml.slice(0, 1000));
              console.log('--- Search for cbc:ID ---');
              const idMatches = [...xml.matchAll(/<cbc:ID[^>]*>([^<]+)<\/cbc:ID>/g)];
              idMatches.forEach(m => console.log('Found cbc:ID:', m[1]));
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

inspectFirstXml().catch(console.error);
