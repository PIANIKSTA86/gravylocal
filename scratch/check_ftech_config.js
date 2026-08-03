const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());
  
  if (!login.token) { console.log("No token"); return; }
  const token = login.token;
  
  // Check ftech_environment setting
  const settingsRes = await fetch(`${url}/settings/records?filter=key~'ftech'`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  
  console.log("Facturatech settings:");
  for (const s of settingsRes.items) {
    // Mask password
    const val = s.key.includes('pass') ? '***' : s.value;
    console.log(`  ${s.key} = ${val}`);
  }
  
  // Also check resolution
  const res = await fetch(`${url}/dian_resolutions/records?filter=active=true&&document_type='DS'`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  console.log("\nResolution DS:");
  for (const r of res.items) {
    console.log(`  prefix=${r.prefix}, number=${r.resolution_number}, from=${r.number_from}, to=${r.number_to}`);
  }
}
run();
