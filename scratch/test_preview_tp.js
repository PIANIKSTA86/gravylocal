async function test() {
  try {
    const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const authData = await authRes.json();
    console.log('Login OK');

    const tpRes = await fetch('http://127.0.0.1:8090/api/collections/third_parties/records?perPage=2', {
      headers: { 'Authorization': authData.token }
    });
    const tps = await tpRes.json();
    const tp1 = tps.items[0];
    const tp2 = tps.items[1];

    console.log('Tercero 1:', tp1.name, 'ID:', tp1.id);
    console.log('Tercero 2:', tp2.name, 'ID:', tp2.id);

    const url = 'http://127.0.0.1:8090/api/gravy/bulk-replace-third-party/preview?oldThirdPartyId=' + tp1.id + '&startDate=2026-01-01&endDate=2026-10-31';
    const previewRes = await fetch(url, {
      headers: { 'Authorization': authData.token }
    });

    console.log('Preview Status:', previewRes.status);
    const prevData = await previewRes.json();
    console.log('Preview Summary:', JSON.stringify(prevData.summary || prevData, null, 2));

  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();