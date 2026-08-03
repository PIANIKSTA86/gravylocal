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
  
  // 1. Update Resolution record
  const resUpdate = await fetch(`${url}/dian_resolutions/records/8mx96akqj78zx6l`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      resolution_number: '18764104737556',
      prefix: 'DS',
      number_from: 2001,
      number_to: 4000,
      resolution_date: '2026-01-19',
      expiration_date: '2028-01-19'
    })
  }).then(r => r.json());
  console.log("Resolution Update Result:", resUpdate.resolution_number, resUpdate.prefix);
  
  // 2. Update Transaction Type "DS" record prefix
  // First, find the transaction type record for DS
  const txTypes = await fetch(`${url}/transaction_types/records?filter=code='DS'`, {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  const dsType = txTypes.items[0];
  if (dsType) {
    const dsTypeUpdate = await fetch(`${url}/transaction_types/records/${dsType.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({
        prefix: 'DS'
      })
    }).then(r => r.json());
    console.log("Tx Type DS Update Result:", dsTypeUpdate.prefix);
  }
  
  // 3. Update Transaction record number to DS2121
  const txUpdate = await fetch(`${url}/transactions/records/h5lfrv1vcrabwiw`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      number: 'DS2121'
    })
  }).then(r => r.json());
  console.log("Transaction Update Result:", txUpdate.number);
}
run();
