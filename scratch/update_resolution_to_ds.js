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

  const resUpdate = await fetch(`${url}/dian_resolutions/records/8mx96akqj78zx6l`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      prefix: 'DS',
      number_from: 2001,
      number_to: 4000,
      current_number: 2000
    })
  }).then(r => r.json());
  console.log("Resolution Update Result:", resUpdate.id, resUpdate.prefix, resUpdate.current_number);
}
run();
