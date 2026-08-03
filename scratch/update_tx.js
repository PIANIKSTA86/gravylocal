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
  
  // Update transaction record resolution_id to DS resolution
  const res = await fetch(`${url}/transactions/records/h5lfrv1vcrabwiw`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({
      resolution_id: '8mx96akqj78zx6l'
    })
  }).then(r => r.json());
  
  console.log("Update Transaction Result:", JSON.stringify(res, null, 2));
}
run();
