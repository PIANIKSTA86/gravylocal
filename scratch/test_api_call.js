async function test() {
  const loginRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  const { token, record } = await loginRes.json();
  console.log('User logged in:', record.email);

  // Let's test the exact query pb.listAll('tx_lines', ...) from api.ts
  const importId = 'zva62hh26xjxn50';
  const filterStr = `import_id="${importId}"`;
  
  // What headers does pb.headers() send?
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const params = new URLSearchParams({ page: '1', perPage: '200' });
  params.set('filter', filterStr);
  params.set('sort', 'created');
  params.set('expand', 'tx_id,account_id,third_party_id,cost_center_id');

  const res = await fetch(`http://127.0.0.1:8090/api/collections/tx_lines/records?${params}`, { headers });
  const data = await res.json();
  console.log('tx_lines response status:', res.status, 'totalItems:', data.totalItems);
  if (!res.ok) {
    console.log('Error data:', data);
  }
}
test();
