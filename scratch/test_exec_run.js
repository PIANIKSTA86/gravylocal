async function testDryRun() {
  try {
    const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const authData = await authRes.json();

    const tpRes = await fetch('http://127.0.0.1:8090/api/collections/third_parties/records?perPage=2', {
      headers: { 'Authorization': authData.token }
    });
    const tps = await tpRes.json();

    // Rango futuro donde no hay asientos
    const res = await fetch('http://127.0.0.1:8090/api/gravy/bulk-replace-third-party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authData.token
      },
      body: JSON.stringify({
        oldThirdPartyId: tps.items[0].id,
        newThirdPartyId: tps.items[1].id,
        startDate: '2029-01-01',
        endDate: '2029-12-31'
      })
    });
    console.log('Execution Status:', res.status);
    console.log('Body:', await res.json());
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testDryRun();