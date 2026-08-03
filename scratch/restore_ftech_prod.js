const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());
  
  if (!login.token) { console.log("No token"); return; }
  const token = login.token;
  
  const settingsRes = await fetch(`${url}/settings/records?filter=key='ftech_environment'`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  
  const rec = settingsRes.items[0];
  const update = await fetch(`${url}/settings/records/${rec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({ value: '1' })
  }).then(r => r.json());
  console.log("Restored ftech_environment to:", update.value, "(Producción)");
}
run();
