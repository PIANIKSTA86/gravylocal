/**
 * Verifica el fix: queries exactos que ahora usa el módulo DIAN corregido
 */
const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  // Auth como usuario real
  const res = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'sm2.solutions.co@gmail.com', password: 'Admin1234!' })
  });
  const { token, record } = await res.json();
  console.log('Auth como:', record.email, '| role:', record.role);
  const h = { 'Authorization': 'Bearer ' + token };

  console.log('\n=== Queries CORREGIDOS del módulo DIAN ===');

  // 1. einvoice_docs CON sort=-id (FIX)
  const r1 = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=200&sort=-id`, { headers: h });
  if (r1.ok) {
    const d = await r1.json();
    console.log(`[OK] einvoice_docs (sort=-id): ${d.totalItems} registros`);
    d.items.forEach(i => console.log(`  -> tx_id=${i.tx_id} status=${i.status} cufe=${i.cufe?.slice(0,20) || '—'}`));
  } else {
    console.log('[ERR] einvoice_docs:', r1.status, await r1.text());
  }

  // 2. transactions CON sort=-date,-id (FIX)
  const params2 = `perPage=200&sort=-date%2C-id&filter=status%3D%22active%22&expand=tx_type_id%2Cthird_party_id`;
  const r2 = await fetch(`${pbUrl}/api/collections/transactions/records?${params2}`, { headers: h });
  if (r2.ok) {
    const d = await r2.json();
    console.log(`[OK] transactions (sort=-date,-id, filter active): ${d.totalItems} registros`);
    const codes = [...new Set(d.items.map(t => t.expand?.tx_type_id?.code).filter(Boolean))];
    const prefixes = [...new Set(d.items.map(t => t.expand?.tx_type_id?.prefix).filter(Boolean))];
    console.log(`  Códigos de tipo: ${codes.join(', ')}`);
    console.log(`  Prefijos: ${prefixes.join(', ')}`);
  } else {
    console.log('[ERR] transactions:', r2.status, await r2.text());
  }

  // 3. dian_resolutions
  const r3 = await fetch(`${pbUrl}/api/collections/dian_resolutions/records?perPage=200&filter=active%3Dtrue`, { headers: h });
  if (r3.ok) {
    const d = await r3.json();
    console.log(`[OK] dian_resolutions: ${d.totalItems} activas`);
    const activePrefixes = d.items.map(r => r.prefix || r.document_type).join(', ');
    console.log(`  Prefijos DIAN: ${activePrefixes}`);
  } else {
    console.log('[ERR] dian_resolutions:', r3.status);
  }

  // 4. Cuántos docs aparecerán en el grid
  const resData = r3.ok ? await (await fetch(`${pbUrl}/api/collections/dian_resolutions/records?perPage=200&filter=active%3Dtrue`, { headers: h })).json() : { items: [] };
  const txData = r2.ok ? await (await fetch(`${pbUrl}/api/collections/transactions/records?${params2}`, { headers: h })).json() : { items: [] };
  
  const activePrefixes = new Set(resData.items?.map(r => String(r.prefix || '').toUpperCase()) || []);
  const activeDocTypes = new Set(resData.items?.map(r => String(r.document_type || '').toUpperCase()) || []);
  
  const signableTxs = txData.items?.filter(t => {
    const prefix = String(t.expand?.tx_type_id?.prefix || '').toUpperCase();
    const code = String(t.expand?.tx_type_id?.code || '').toUpperCase();
    return activePrefixes.has(prefix) || activeDocTypes.has(code);
  }) || [];

  console.log(`\n=== RESULTADO FINAL ===`);
  console.log(`Transacciones que aparecerán en el grid DIAN: ${signableTxs.length}`);
  signableTxs.slice(0, 5).forEach(t => console.log(`  -> ${t.number} | prefix=${t.expand?.tx_type_id?.prefix} | code=${t.expand?.tx_type_id?.code}`));

  console.log('\n=== FIN - Si ves OK arriba, el fix funciona ===');
}
run();
