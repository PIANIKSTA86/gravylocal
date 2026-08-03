const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());
  
  if (!login.token) { console.log("No token"); return; }
  const token = login.token;
  
  // Find the ftech_environment setting record
  const settingsRes = await fetch(`${url}/settings/records?filter=key='ftech_environment'`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  
  const rec = settingsRes.items[0];
  console.log("Current ftech_environment:", rec?.value, "(id:", rec?.id + ")");
  
  if (!rec) { console.log("Record not found!"); return; }
  
  // Switch to BETA (2)
  const update = await fetch(`${url}/settings/records/${rec.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({ value: '2' })
  }).then(r => r.json());
  console.log("Updated to:", update.value);
}
run();
