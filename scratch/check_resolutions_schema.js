/**
 * Verifica el schema de dian_resolutions y datos reales
 */
async function run() {
  let res = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  const { token } = await res.json();
  const h = { 'Authorization': 'Bearer ' + token };

  // Schema de la colección
  const colRes = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions', { headers: h });
  const col = await colRes.json();
  console.log('=== dian_resolutions CAMPOS ===');
  (col.fields || col.schema || []).forEach(f => console.log(`  ${f.name}: ${f.type}`));

  // Registros reales
  const recRes = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions/records?perPage=10', { headers: h });
  const recData = await recRes.json();
  console.log('\n=== REGISTROS REALES ===');
  recData.items?.forEach(r => {
    console.log('\nResolución:');
    Object.keys(r).forEach(k => {
      if (!['id','created','updated','collectionId','collectionName'].includes(k))
        console.log(`  ${k}: ${JSON.stringify(r[k])}`);
    });
  });

  // También ver los settings relevantes
  const setRes = await fetch('http://127.0.0.1:8090/api/collections/settings/records?perPage=200', { headers: h });
  const setData = await setRes.json();
  const relevant = setData.items?.filter(s => 
    s.key.includes('company') || s.key.includes('dian') || s.key.includes('ftech') || 
    s.key.includes('economic') || s.key.includes('ciiu') || s.key.includes('postal')
  );
  console.log('\n=== SETTINGS RELEVANTES ===');
  relevant?.forEach(s => console.log(`  ${s.key}: ${s.value?.slice(0,80) || '[vacío]'}`));

  // Verificar campos del tercero de empresa
  const thirdId = setData.items?.find(s => s.key === 'company_third_party_id')?.value;
  if (thirdId) {
    const tpRes = await fetch(`http://127.0.0.1:8090/api/collections/third_parties/records/${thirdId}`, { headers: h });
    if (tpRes.ok) {
      const tp = await tpRes.json();
      console.log('\n=== TERCERO DE EMPRESA ===');
      Object.keys(tp).forEach(k => {
        if (!['id','created','updated','collectionId','collectionName'].includes(k))
          console.log(`  ${k}: ${JSON.stringify(tp[k])?.slice(0,80) || '[vacío]'}`);
      });
    }
  }

  // Schema de third_parties  
  const tpColRes = await fetch('http://127.0.0.1:8090/api/collections/third_parties', { headers: h });
  const tpCol = await tpColRes.json();
  console.log('\n=== third_parties CAMPOS ===');
  (tpCol.fields || tpCol.schema || []).forEach(f => console.log(`  ${f.name}: ${f.type}`));
}
run();
