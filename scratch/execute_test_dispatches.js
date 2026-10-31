(async () => {
  const targetEmail = 'julian_piano@hotmail.com';
  console.log('Authenticating against port 8092...');
  const loginRes = await fetch('http://localhost:8092/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: targetEmail, password: 'Admin1234!' })
  });
  const authData = await loginRes.json();
  const token = authData.token;
  if (!token) {
    console.error('Failed to obtain auth token:', authData);
    process.exit(1);
  }
  console.log('Token obtained successfully.\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const tests = [
    {
      name: '1. Documento Soporte Electrónico (DS-00000001)',
      endpoint: 'http://localhost:8092/api/dian/resend-email',
      payload: { txId: 'txdskofr7fhrdbg', email: targetEmail }
    },
    {
      name: '2. Nota de Ajuste a Documento Soporte (NDS-00000001)',
      endpoint: 'http://localhost:8092/api/dian/resend-email',
      payload: { txId: 'txnds9q2uluvjkg', email: targetEmail }
    },
    {
      name: '3. Nómina Electrónica (NOM-00000001)',
      endpoint: 'http://localhost:8092/api/dian/nomina/resend-email',
      payload: { id: 'nomrabjp97dbv', email: targetEmail }
    },
    {
      name: '4. Nota de Ajuste a Nómina Electrónica (NAN-00000001)',
      endpoint: 'http://localhost:8092/api/dian/nomina/resend-email',
      payload: { id: 'nandka9htlf88b', email: targetEmail }
    }
  ];

  for (const t of tests) {
    console.log(`>>> Enviando prueba: ${t.name}...`);
    try {
      const res = await fetch(t.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(t.payload)
      });
      const data = await res.json();
      console.log(`    Status: ${res.status}`);
      console.log(`    Response:`, data);
      if (res.status === 200) {
        console.log(`    [OK] Despacho exitoso para ${t.name}\n`);
      } else {
        console.error(`    [FAIL] Error en ${t.name}\n`);
      }
    } catch (err) {
      console.error(`    [ERROR] Excepción de red en ${t.name}:`, err.message, '\n');
    }
  }

  console.log('Todos los envíos de prueba han sido procesados.');
})();

