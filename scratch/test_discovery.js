const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));

async function testFolderDiscovery() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: 'ventas.gravy@gmail.com', pass: 'wlok jiad elst juir' },
    logger: false
  });
  await client.connect();
  const list = await client.list();
  const foldersToScan = ['INBOX'];
  for (const item of list) {
    if (item.flags.has('\\Junk') || item.path.toLowerCase().includes('spam')) {
      foldersToScan.push(item.path);
    }
  }
  console.log('Folders to scan:', foldersToScan);
  await client.logout();
}

testFolderDiscovery().catch(console.error);
