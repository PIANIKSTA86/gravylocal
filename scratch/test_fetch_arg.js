const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
const { ImapFlow } = require(path.join(hubModules, 'imapflow'));

async function testFetchParam() {
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
    const searchRes = await client.search({ seen: false });
    console.log('searchRes:', searchRes); // array of numbers?

    console.log('Testing fetch with searchRes directly:');
    let count1 = 0;
    for await (const m of client.fetch(searchRes, { uid: true })) {
      count1++;
    }
    console.log('Count with array:', count1);

    const seqString = Array.isArray(searchRes) ? searchRes.join(',') : searchRes;
    console.log('Testing fetch with comma string:', seqString);
    let count2 = 0;
    for await (const m of client.fetch(seqString, { uid: true })) {
      count2++;
    }
    console.log('Count with string:', count2);
  } finally {
    lock.release();
    await client.logout();
  }
}
testFetchParam().catch(console.error);
