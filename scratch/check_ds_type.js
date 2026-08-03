const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());
  
  if (!login.token) {
    console.log("No token");
    return;
  }
  const token = login.token;
  
  const dsType = await fetch(`${url}/transaction_types/records/b8ek09o3xxaju8z`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  console.log("DS Type Record:", JSON.stringify(dsType, null, 2));
}
run();
