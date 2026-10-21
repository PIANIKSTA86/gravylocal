const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));
const { simpleParser } = require(path.join(hubModules, 'mailparser'));

async function inspectInbox() {
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
  const lock = await client.getMailboxLock('INBOX');

  try {
    const total = client.mailbox.exists || 0;
    console.log('Total messages in INBOX:', total);
    
    // Fetch last 10 messages
    const from = Math.max(1, total - 9);
    const range = `${from}:${total}`;
    console.log('Fetching range:', range);

    for await (const message of client.fetch(range, { envelope: true, flags: true, source: true })) {
      const parsed = await simpleParser(message.source);
      console.log('------------------------------------');
      console.log(`Seq: ${message.seq}, UID: ${message.uid}`);
      console.log(`Date: ${message.envelope.date}`);
      console.log(`Subject: ${message.envelope.subject}`);
      console.log(`From: ${message.envelope.from ? message.envelope.from.map(f => f.address).join(', ') : 'N/A'}`);
      console.log(`Flags:`, Array.from(message.flags));
      console.log(`Attachments count: ${parsed.attachments ? parsed.attachments.length : 0}`);
      if (parsed.attachments && parsed.attachments.length > 0) {
        parsed.attachments.forEach(att => {
          console.log(`  -> Attachment: ${att.filename} (${att.contentType}, ${att.size} bytes)`);
        });
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }
}

inspectInbox().catch(console.error);
