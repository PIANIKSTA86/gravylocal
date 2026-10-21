const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));
const { simpleParser } = require(path.join(hubModules, 'mailparser'));

async function findInvoicesAcrossMailbox() {
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

  try {
    const mailboxes = await client.list();
    console.log('Available mailboxes (folders):');
    mailboxes.forEach(m => console.log(` - ${m.path} (delimiter: ${m.delimiter}, flags: ${Array.from(m.flags).join(',')})`));

    // First scan INBOX for any attachments or subjects with factura / fwd / rv / xml
    const lock = await client.getMailboxLock('INBOX');
    try {
      console.log('\nScanning all messages in INBOX:');
      for await (const message of client.fetch('1:*', { envelope: true, flags: true, bodyStructure: true })) {
        const subj = message.envelope.subject || '';
        const from = message.envelope.from ? message.envelope.from.map(f => f.address).join(', ') : '';
        const date = message.envelope.date;
        // Check if has attachments or interesting subject
        console.log(`[#${message.seq}] Date: ${date ? date.toISOString().slice(0, 10) : '?'} | From: ${from} | Subj: ${subj}`);
      }
    } finally {
      lock.release();
    }

  } finally {
    await client.logout();
  }
}

findInvoicesAcrossMailbox().catch(console.error);
