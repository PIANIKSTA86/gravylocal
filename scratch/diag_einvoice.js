/**
 * Diagnóstico específico de einvoice_docs
 */
const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  // Auth superuser
  let res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  const token = (await res.json()).token;
  const h = { 'Authorization': 'Bearer ' + token };

  // Ver colección completa
  const colRes = await fetch(`${pbUrl}/api/collections/einvoice_docs`, { headers: h });
  const col = await colRes.json();
  console.log('=== einvoice_docs colección completa ===');
  console.log('listRule:', col.listRule);
  console.log('viewRule:', col.viewRule);
  console.log('createRule:', col.createRule);
  console.log('updateRule:', col.updateRule);
  console.log('deleteRule:', col.deleteRule);
  console.log('\nTodos los campos:');
  (col.fields || col.schema || []).forEach(f => {
    console.log(`  ${f.name}: type=${f.type}${f.type === 'relation' ? ` -> ${f.collectionId}` : ''}`);
  });

  // Probar con admin token de superuser (que en PB puede bypassar reglas)
  // Pero el token de _superusers SI tiene reglas aplicadas en /api/collections/...
  // Intentar con token de admin legacy
  let adminToken = null;
  const adminRes = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  if (adminRes.ok) {
    adminToken = (await adminRes.json()).token;
    console.log('\n=== Probando con token /api/admins (legacy) ===');
    const r = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=5`, {
      headers: { 'Authorization': 'Bearer ' + adminToken }
    });
    console.log('Status:', r.status);
    if (r.ok) {
      const d = await r.json();
      console.log('Items:', d.totalItems);
      d.items.forEach(i => console.log(`  id=${i.id} tx_id=${i.tx_id} status=${i.status}`));
    } else {
      console.log('Error:', await r.text());
    }
  }

  // Intentar query directamente en la BD con el token de admin usando ruta /api/collections/...
  console.log('\n=== Probando si es la listRule la que falla ===');
  // Temporalmente parchamos la listRule para verificar
  // NOTA: No modificamos, solo verificamos el comportamiento
  
  // ¿Qué pasa si hacemos la query SIN ningún sort?
  const r2 = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=5`, { headers: h });
  console.log('\nSIN sort:', r2.status, r2.ok ? 'OK' : await r2.text());
  
  // ¿Con sort=-created?
  const r3 = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=5&sort=-created`, { headers: h });
  console.log('CON sort=-created:', r3.status, r3.ok ? 'OK' : await r3.text());
  
  // ¿Hay algún índice en einvoice_docs que esté roto?
  // Verificar si el problema es la relación tx_id apuntando a colección que no existe
  const relatedCol = col.fields?.find(f => f.name === 'tx_id')?.collectionId;
  if (relatedCol) {
    const rcRes = await fetch(`${pbUrl}/api/collections/${relatedCol}`, { headers: h });
    if (rcRes.ok) {
      const rc = await rcRes.json();
      console.log(`\nColección referenciada por tx_id: ${rc.name} (existe OK)`);
    } else {
      console.log(`\nERROR: Colección referenciada por tx_id (${relatedCol}) NO EXISTE o no es accesible: ${rcRes.status}`);
    }
  }

  // Probar query sin expand y con filtro vacío (solo ver si hay error de DB)
  console.log('\n=== Pruebas adicionales ===');
  for (const query of [
    '?perPage=1',
    '?perPage=1&filter=status%3D%22pendiente%22',
    '?perPage=1&sort=-id',
    '?perPage=1&sort=id',
  ]) {
    const r = await fetch(`${pbUrl}/api/collections/einvoice_docs/records${query}`, { headers: h });
    console.log(`Query "${query}": ${r.status}`, r.ok ? `OK (${(await r.json()).totalItems})` : await r.text());
  }
}
run();
