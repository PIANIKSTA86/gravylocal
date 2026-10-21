const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));

async function checkFlags() {
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
    for await (const m of client.fetch('1:*', { envelope: true, flags: true })) {
      console.log(`[#${m.seq}] ${m.envelope.subject} -> Flags:`, Array.from(m.flags));
    }
  } finally {
    lock.release();
    await client.logout();
  }
}
checkFlags().catch(console.error);
