const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());
  
  if (!login.token) {
    console.log("No token", login);
    return;
  }
  const token = login.token;
  
  const res = await fetch(`${url}/dian_resolutions/records?perPage=100`, { headers: { 'Authorization': token } }).then(r => r.json());
  console.log("ALL DIAN RESOLUTIONS:");
  for (const item of res.items) {
    console.log(JSON.stringify({
      id: item.id,
      name: item.name,
      document_type: item.document_type,
      prefix: item.prefix,
      resolution_number: item.resolution_number,
      number_from: item.number_from,
      number_to: item.number_to,
      active: item.active
    }, null, 2));
  }
}
run();
