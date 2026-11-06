async function testDecimal() {
  try {
    const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const authData = await authRes.json();

    const url = 'http://127.0.0.1:8090/api/gravy/bulk-replace-third-party/preview?oldThirdPartyId=io40ta9wsswde7h&startDate=2026-01-01&endDate=2026-11-04';
    const previewRes = await fetch(url, {
      headers: { 'Authorization': authData.token }
    });

    console.log('Preview Status:', previewRes.status);
    const data = await previewRes.json();
    console.log('Result:', JSON.stringify(data.summary || data, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testDecimal();