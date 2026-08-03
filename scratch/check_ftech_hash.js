/**
 * Verifica el hash de la contraseña de Facturatech
 * y diagnóstica si hay doble-hash
 */
const crypto = require('crypto');

async function run() {
  let res = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  const { token } = await res.json();
  const h = { 'Authorization': 'Bearer ' + token };

  const r = await fetch('http://127.0.0.1:8090/api/collections/settings/records?perPage=200', { headers: h });
  const data = await r.json();
  
  const pwSetting = data.items?.find(s => s.key === 'ftech_password');
  const storedPw = pwSetting?.value || '';
  
  console.log('=== ftech_password analysis ===');
  console.log('Stored value:', storedPw);
  console.log('Length:', storedPw.length);
  console.log('Is 64-char hex?', /^[0-9a-f]{64}$/i.test(storedPw));
  console.log('Is 50-char hex?', /^[0-9a-f]{50}$/i.test(storedPw));
  
  // El valor actual tiene 50 chars - parece truncado o incorrecto
  // Facturatech SHA256 del password debería ser 64 chars hex
  // Si el valor actual es b11ea3f0848abfd2dfa75dd0172a366a14038266e4ee90a190 (50 chars)
  // entonces es un SHA-256 truncado o una contraseña diferente
  
  if (storedPw.length === 64) {
    console.log('\n✅ Password ya está en SHA-256 (64 chars) - hashFtechPassword lo usará directamente');
  } else if (storedPw.length === 50) {
    console.log('\n⚠️  Password tiene 50 chars - parece SHA-256 TRUNCADO o contraseña en texto corto');
    console.log('   SHA-256 de este valor:', crypto.createHash('sha256').update(storedPw).digest('hex'));
    console.log('   => El orquestador lo hasheará (no es ya un SHA-256 completo)');
  } else {
    console.log('\n⚠️  Password tiene', storedPw.length, 'chars - será hasheado por el orquestador');
    console.log('   SHA-256 resultante:', crypto.createHash('sha256').update(storedPw).digest('hex'));
  }
  
  // Verificar ftech_username también
  const userSetting = data.items?.find(s => s.key === 'ftech_username');
  console.log('\nftech_username:', userSetting?.value || '[VACÍO]');
  console.log('ftech_environment:', data.items?.find(s => s.key === 'ftech_environment')?.value || '[VACÍO]');
}
run();
