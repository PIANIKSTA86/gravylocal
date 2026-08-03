/**
 * Busca usuarios registrados en la colección 'users' de PocketBase
 * y luego simula exactamente lo que hace el frontend de DIAN
 */
const pbUrl = 'http://127.0.0.1:8090';

async function getAdminToken() {
  // Intenta superuser primero (PocketBase 0.23+)
  let res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  if (res.ok) return (await res.json()).token;
  // Fallback admin legacy
  res = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  if (res.ok) return (await res.json()).token;
  return null;
}

async function run() {
  const adminToken = await getAdminToken();
  if (!adminToken) { console.error('Admin auth failed'); return; }
  const adminH = { 'Authorization': 'Bearer ' + adminToken };
  
  // Listar usuarios de la colección users
  const usersRes = await fetch(`${pbUrl}/api/collections/users/records?perPage=5`, { headers: adminH });
  const usersData = await usersRes.json();
  console.log('=== Usuarios disponibles ===');
  usersData.items?.forEach(u => console.log(`  email: ${u.email} | role: ${u.role} | active: ${u.active ?? u.verified}`));
  
  if (!usersData.items?.length) {
    console.log('No hay usuarios. Diagnóstico con token de admin directamente.');
    await runDianDiag(adminToken, 'ADMIN');
    return;
  }
  
  // Intentar auth como el primer usuario disponible
  const firstUser = usersData.items[0];
  console.log(`\nIntentando login como: ${firstUser.email}`);
  
  // No podemos hacer login sin saber la contraseña, pero sí podemos
  // crear un token impersonado desde admin en PB 0.23+
  // En su lugar, haremos el diagnóstico con token de admin para entender
  // si el problema es de reglas o de expand
  
  await runDianDiag(adminToken, 'ADMIN');
}

async function runDianDiag(token, label) {
  const h = { 'Authorization': 'Bearer ' + token };
  console.log(`\n=== Diagnóstico con token ${label} ===`);

  // Test 1: einvoice_docs CON expand=tx_id (como lo hace el módulo)
  const u1 = `${pbUrl}/api/collections/einvoice_docs/records?perPage=200&sort=-created&expand=tx_id`;
  const r1 = await fetch(u1, { headers: h });
  if (r1.ok) {
    const d = await r1.json();
    console.log(`[OK] einvoice_docs: ${d.totalItems} registros`);
  } else {
    console.log(`[ERROR] einvoice_docs: ${r1.status}`, await r1.text());
  }

  // Test 2: transactions CON expand y filter (EXACTAMENTE como el módulo)
  const params = `perPage=200&sort=-date,-created&filter=status%3D%22active%22&expand=tx_type_id%2Cthird_party_id`;
  const u2 = `${pbUrl}/api/collections/transactions/records?${params}`;
  const r2 = await fetch(u2, { headers: h });
  if (r2.ok) {
    const d = await r2.json();
    console.log(`[OK] transactions: ${d.totalItems} registros`);
    // Muestra tipos de transacción únicos
    const codes = [...new Set(d.items.map(t => t.expand?.tx_type_id?.code).filter(Boolean))];
    console.log(`     Tipos de tx: ${codes.join(', ')}`);
  } else {
    const err = await r2.text();
    console.log(`[ERROR] transactions: ${r2.status}`, err);
    
    // Si falla con ese filter, probamos sin filter
    console.log('  >> Reintentando SIN filter...');
    const r2b = await fetch(`${pbUrl}/api/collections/transactions/records?perPage=5&expand=tx_type_id,third_party_id`, { headers: h });
    if (r2b.ok) {
      console.log('  >> SIN filter funciona. El problema es el filter status="active"');
    } else {
      console.log('  >> SIN filter también falla:', r2b.status, await r2b.text());
    }
  }

  // Test 3: Verificar que 'invoices' y 'purchase_invoices' responden
  const r3 = await fetch(`${pbUrl}/api/collections/invoices/records?perPage=1&fields=id,tx_id,total`, { headers: h });
  console.log(`[${r3.ok ? 'OK' : 'ERROR'}] invoices: ${r3.status}`, r3.ok ? `${(await r3.json()).totalItems} registros` : await r3.text());

  const r4 = await fetch(`${pbUrl}/api/collections/purchase_invoices/records?perPage=1&fields=id,tx_id,total`, { headers: h });
  console.log(`[${r4.ok ? 'OK' : 'ERROR'}] purchase_invoices: ${r4.status}`, r4.ok ? `${(await r4.json()).totalItems} registros` : await r4.text());

  // Test 4: dian_resolutions
  const r5 = await fetch(`${pbUrl}/api/collections/dian_resolutions/records?perPage=200&filter=active%3Dtrue`, { headers: h });
  if (r5.ok) {
    const d = await r5.json();
    console.log(`[OK] dian_resolutions: ${d.totalItems} activas`);
    d.items.forEach(r => console.log(`  -> prefix="${r.prefix}" doc_type="${r.document_type}"`));
  } else {
    console.log(`[ERROR] dian_resolutions: ${r5.status}`, await r5.text());
  }

  // Test 5: ¿Cuántas transacciones tienen prefix que coincide con resoluciones?
  console.log('\n=== Verificando coincidencias TX ↔ Resoluciones ===');
  const allTx = await fetch(`${pbUrl}/api/collections/transactions/records?perPage=200&filter=status%3D%22active%22&expand=tx_type_id`, { headers: h });
  if (allTx.ok) {
    const txData = await allTx.json();
    const allRes = await fetch(`${pbUrl}/api/collections/dian_resolutions/records?perPage=200`, { headers: h });
    const resData = await allRes.json();
    const prefixes = new Set(resData.items?.map(r => String(r.prefix || '').toUpperCase()) || []);
    const codes = new Set(resData.items?.map(r => String(r.document_type || '').toUpperCase()) || []);
    console.log('Prefijos en resoluciones:', [...prefixes].join(', ') || '(ninguno)');
    console.log('Tipos doc en resoluciones:', [...codes].join(', ') || '(ninguno)');
    const matching = txData.items?.filter(t => {
      const p = String(t.expand?.tx_type_id?.prefix || '').toUpperCase();
      const c = String(t.expand?.tx_type_id?.code || '').toUpperCase();
      return prefixes.has(p) || codes.has(c);
    });
    console.log(`Transacciones que coinciden con resoluciones DIAN: ${matching?.length || 0}`);
    matching?.slice(0, 5).forEach(t => console.log(`  -> ${t.number} | prefix=${t.expand?.tx_type_id?.prefix} code=${t.expand?.tx_type_id?.code}`));
  }

  console.log('\n=== FIN ===');
}

run();
