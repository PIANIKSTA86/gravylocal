/**
 * Diagnostico de colecciones DIAN
 * Verifica reglas, campos y compatibilidad de expand
 */
async function run() {
  // 1. Auth como admin
  let token = null;
  let res = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  if (!res.ok) {
    res = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
  }
  const authData = await res.json();
  if (!authData.token) { console.error('Auth failed:', authData); return; }
  token = authData.token;
  const h = { 'Authorization': 'Bearer ' + token };

  // 2. Verificar reglas de las colecciones problemáticas
  const cols = ['einvoice_docs', 'transactions'];
  for (const name of cols) {
    const r = await fetch('http://127.0.0.1:8090/api/collections/' + name, { headers: h });
    const col = await r.json();
    console.log(`\n=== ${name} ===`);
    console.log('  listRule :', col.listRule ?? 'NULL (bloqueada)');
    console.log('  viewRule :', col.viewRule ?? 'NULL (bloqueada)');
    // Mostrar campos de tipo relation
    const relFields = (col.fields || col.schema || []).filter(f => f.type === 'relation');
    relFields.forEach(f => console.log(`  RELATION: ${f.name} -> colección: ${f.collectionId || f.options?.collectionId}`));
  }

  // 3. Intentar query SIN expand (para aislar si el problema es el expand)
  console.log('\n=== TEST SIN EXPAND ===');
  const t1 = await fetch('http://127.0.0.1:8090/api/collections/einvoice_docs/records?perPage=3', { headers: h });
  console.log('einvoice_docs SIN expand:', t1.status, t1.status === 200 ? 'OK' : await t1.text());

  const t2 = await fetch('http://127.0.0.1:8090/api/collections/transactions/records?perPage=3', { headers: h });
  console.log('transactions SIN expand:', t2.status, t2.status === 200 ? 'OK' : await t2.text());

  // 4. Intentar CON expand
  console.log('\n=== TEST CON EXPAND ===');
  const t3 = await fetch('http://127.0.0.1:8090/api/collections/einvoice_docs/records?perPage=3&expand=tx_id', { headers: h });
  console.log('einvoice_docs CON expand=tx_id:', t3.status, t3.status === 200 ? 'OK' : await t3.text());

  const t4 = await fetch('http://127.0.0.1:8090/api/collections/transactions/records?perPage=3&expand=tx_type_id,third_party_id&filter=status%3D%22active%22', { headers: h });
  console.log('transactions CON expand (filter status=active):', t4.status, t4.status === 200 ? 'OK' : await t4.text());

  // 5. Contar registros
  console.log('\n=== CONTEO ===');
  const c1 = await fetch('http://127.0.0.1:8090/api/collections/einvoice_docs/records?perPage=1', { headers: h });
  const d1 = await c1.json();
  console.log('einvoice_docs total:', d1.totalItems ?? 'error');

  const c2 = await fetch('http://127.0.0.1:8090/api/collections/transactions/records?perPage=1&filter=status%3D%22active%22', { headers: h });
  const d2 = await c2.json();
  console.log('transactions activas total:', d2.totalItems ?? 'error');

  // 6. Verificar si el campo 'tx_id' en einvoice_docs es tipo relation
  const colDoc = await (await fetch('http://127.0.0.1:8090/api/collections/einvoice_docs', { headers: h })).json();
  const txIdField = (colDoc.fields || colDoc.schema || []).find(f => f.name === 'tx_id');
  console.log('\nCampo tx_id en einvoice_docs:', txIdField ? `tipo=${txIdField.type}` : 'NO EXISTE');

  console.log('\n=== FIN DIAGNOSTICO ===');
}
run();
