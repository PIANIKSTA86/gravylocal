const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));

async function checkOtherFolders() {
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

  const folders = ['[Gmail]/Spam', '[Gmail]/Todos', '[Gmail]/Papelera'];

  for (const f of folders) {
    try {
      const lock = await client.getMailboxLock(f);
      try {
        const total = client.mailbox.exists || 0;
        console.log(`Folder: ${f} -> Total: ${total}`);
        if (total > 0) {
          const from = Math.max(1, total - 10);
          for await (const message of client.fetch(`${from}:${total}`, { envelope: true })) {
            console.log(`   [${f} #${message.seq}] Date: ${message.envelope.date?.toISOString().slice(0, 10)} | From: ${message.envelope.from?.[0]?.address} | Subj: ${message.envelope.subject}`);
          }
        }
      } finally {
        lock.release();
      }
    } catch (e) {
      console.log(`Error checking ${f}:`, e.message);
    }
  }

  await client.logout();
}

checkOtherFolders().catch(console.error);
