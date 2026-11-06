async function testExecution() {
  try {
    const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const authData = await authRes.json();

    // Probamos validación: origen y destino iguales
    const badRes = await fetch('http://127.0.0.1:8090/api/gravy/bulk-replace-third-party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authData.token
      },
      body: JSON.stringify({
        oldThirdPartyId: 'test1234',
        newThirdPartyId: 'test1234',
        startDate: '2026-01-01',
        endDate: '2026-10-31'
      })
    });
    console.log('Same TP validation status (esperado 400):', badRes.status);
    console.log('Body:', await badRes.json());
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testExecution();