/**
 * Diagnostico con token de usuario normal (no admin)
 * Simula exactamente lo que hace el frontend
 */
async function run() {
  // 1. Auth como usuario normal (igual que el frontend)
  const res = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  const authData = await res.json();
  if (!authData.token) {
    console.error('User auth failed:', authData);
    return;
  }
  const token = authData.token;
  const h = { 'Authorization': 'Bearer ' + token };
  console.log('Auth OK, user:', authData.record?.email, 'role:', authData.record?.role);

  // 2. Test exacto del módulo facturacion-dian.ts:
  console.log('\n=== Simulando llamadas del módulo DIAN ===');

  // Call 1: einvoice_docs con expand=tx_id
  const r1 = await fetch('http://127.0.0.1:8090/api/collections/einvoice_docs/records?perPage=200&sort=-created&expand=tx_id', { headers: h });
  console.log('\n[1] einvoice_docs (sort=-created, expand=tx_id):', r1.status);
  if (!r1.ok) {
    console.log('    ERROR:', await r1.text());
  } else {
    const d = await r1.json();
    console.log('    OK, items:', d.totalItems);
  }

  // Call 2: transactions con expand y filter status=active
  const params2 = new URLSearchParams({ perPage: '200', sort: '-date,-created', filter: 'status="active"', expand: 'tx_type_id,third_party_id' });
  const r2 = await fetch('http://127.0.0.1:8090/api/collections/transactions/records?' + params2, { headers: h });
  console.log('\n[2] transactions (filter status=active, expand tx_type_id,third_party_id):', r2.status);
  if (!r2.ok) {
    console.log('    ERROR:', await r2.text());
  } else {
    const d = await r2.json();
    console.log('    OK, items:', d.totalItems);
    // Muestra primeras 3
    d.items.slice(0, 3).forEach(t => {
      console.log('    tx:', t.number, '| type prefix:', t.expand?.tx_type_id?.prefix, '| code:', t.expand?.tx_type_id?.code);
    });
  }

  // Call 3: invoices
  const r3 = await fetch('http://127.0.0.1:8090/api/collections/invoices/records?perPage=200&fields=id,tx_id,total', { headers: h });
  console.log('\n[3] invoices (fields=id,tx_id,total):', r3.status);
  if (!r3.ok) console.log('    ERROR:', await r3.text());
  else console.log('    OK, items:', (await r3.json()).totalItems);

  // Call 4: dian_resolutions
  const r4 = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions/records?perPage=200&filter=active%3Dtrue', { headers: h });
  console.log('\n[4] dian_resolutions (filter active=true):', r4.status);
  if (!r4.ok) console.log('    ERROR:', await r4.text());
  else {
    const d = await r4.json();
    console.log('    OK, items:', d.totalItems);
    d.items.forEach(r => console.log('    resolution:', r.prefix, r.document_type, r.active));
  }

  console.log('\n=== FIN ===');
}
run();
