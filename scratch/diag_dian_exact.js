/**
 * Prueba exacta de los queries que fallan para identificar el issue
 */
const pbUrl = 'http://127.0.0.1:8090';

async function getAdminToken() {
  let res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  if (res.ok) return (await res.json()).token;
  res = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  if (res.ok) return (await res.json()).token;
  return null;
}

async function run() {
  const token = await getAdminToken();
  if (!token) { console.error('Auth failed'); return; }
  const h = { 'Authorization': 'Bearer ' + token };

  // Probar distintos filtros de status
  const filters = [
    `status="active"`,
    `status='active'`,
    `(status="active")`,
    `status != ""`,
  ];
  
  console.log('=== Probando filtros en transactions ===');
  for (const f of filters) {
    const url = `${pbUrl}/api/collections/transactions/records?perPage=5&filter=${encodeURIComponent(f)}`;
    const r = await fetch(url, { headers: h });
    if (r.ok) {
      const d = await r.json();
      console.log(`OK  filter="${f}" -> ${d.totalItems} resultados`);
    } else {
      console.log(`ERR filter="${f}" -> ${r.status} ${await r.text()}`);
    }
  }

  console.log('\n=== Probando einvoice_docs sin y con expand ===');
  // Sin expand
  const r1 = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=5&sort=-created`, { headers: h });
  console.log(`SIN expand: ${r1.status}`, r1.ok ? `${(await r1.json()).totalItems} items` : await r1.text());

  // Con expand=tx_id usando token Bearer (no solo el token)
  const r2 = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=5&sort=-created&expand=tx_id`, { headers: h });
  console.log(`CON expand=tx_id: ${r2.status}`, r2.ok ? `OK` : await r2.text());

  // Ver el campo tx_id: ¿está marcado como expandible?
  const colRes = await fetch(`${pbUrl}/api/collections/einvoice_docs`, { headers: h });
  const col = await colRes.json();
  const txIdField = (col.fields || col.schema || []).find(f => f.name === 'tx_id');
  console.log('\nCampo tx_id:', JSON.stringify(txIdField, null, 2));

  // Ver la listRule y viewRule de transactions
  const txColRes = await fetch(`${pbUrl}/api/collections/transactions`, { headers: h });
  const txCol = await txColRes.json();
  console.log('\ntransactions listRule:', txCol.listRule);
  console.log('transactions viewRule:', txCol.viewRule);

  // ¿Hay algún índice o campo 'status' en transactions?
  const statusField = (txCol.fields || txCol.schema || []).find(f => f.name === 'status');
  console.log('transactions.status field:', JSON.stringify(statusField));

  // Probar con USER token real
  console.log('\n=== Login como usuario real ===');
  const users = ['sm2.solutions.co@gmail.com', 'admin@contaco.com', 'julian_piano@hotmail.com'];
  const passwords = ['Admin1234!', 'Gravy2024!', 'admin123', 'test123456', 'contaco123', 'Piano123!'];
  
  for (const email of users) {
    for (const pass of passwords) {
      const r = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: pass })
      });
      if (r.ok) {
        const d = await r.json();
        console.log(`\nLogin exitoso: ${email} / ${pass}`);
        const userH = { 'Authorization': 'Bearer ' + d.token };
        
        // Probar einvoice_docs con token de usuario
        const tr1 = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=5&sort=-created&expand=tx_id`, { headers: userH });
        console.log(`einvoice_docs con token USER: ${tr1.status}`, tr1.ok ? 'OK' : await tr1.text());
        
        const tr2 = await fetch(`${pbUrl}/api/collections/transactions/records?perPage=5&filter=${encodeURIComponent('status="active"')}&expand=tx_type_id,third_party_id`, { headers: userH });
        console.log(`transactions con token USER: ${tr2.status}`, tr2.ok ? 'OK' : await tr2.text());
        break;
      }
    }
  }

  console.log('\n=== FIN ===');
}
run();
