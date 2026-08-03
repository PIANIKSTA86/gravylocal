/**
 * Revisa la configuración de Facturatech en settings
 */
async function run() {
  let res = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  const { token } = await res.json();
  const h = { 'Authorization': 'Bearer ' + token };

  const r = await fetch('http://127.0.0.1:8090/api/collections/settings/records?perPage=200', { headers: h });
  const data = await r.json();
  
  const dianKeys = [
    'einvoice_method', 'ftech_username', 'ftech_password', 'ftech_environment',
    'dian_nit', 'dian_environment', 'dian_certificate_base64', 'dian_certificate_password',
    'dian_software_id', 'dian_cltec', 'dian_software_pin'
  ];
  
  console.log('=== Configuración DIAN / Facturatech ===');
  data.items?.forEach(s => {
    if (dianKeys.includes(s.key)) {
      const val = s.key.includes('password') || s.key.includes('base64') || s.key.includes('pin') || s.key.includes('cltec')
        ? (s.value ? `[SET - ${s.value.length} chars]` : '[VACÍO]')
        : s.value || '[VACÍO]';
      console.log(`  ${s.key}: ${val}`);
    }
  });
  
  // Ver todas las keys DIAN no listadas
  const otherDian = data.items?.filter(s => s.key.includes('dian') || s.key.includes('ftech') || s.key.includes('einvoice'));
  console.log('\n=== Todas las keys relacionadas DIAN/Ftech ===');
  otherDian?.forEach(s => console.log(`  ${s.key}: ${s.value?.slice(0,50) || '[VACÍO]'}`));
}
run();
