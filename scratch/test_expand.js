async function test() {
  const loginRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  const { token } = await loginRes.json();
  const filterStr = 'import_id="zva62hh26xjxn50"';
  const url = `http://127.0.0.1:8090/api/collections/tx_lines/records?filter=${encodeURIComponent(filterStr)}&expand=tx_id,account_id,third_party_id&perPage=200`;
  const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
  const data = await res.json();
  console.log('Total items:', data.totalItems);
  data.items.forEach(l => {
    console.log('Line id:', l.id, 'concept:', l.import_concept, 'expand.tx_id:', l.expand?.tx_id ? { id: l.expand.tx_id.id, number: l.expand.tx_id.number, status: l.expand.tx_id.status } : 'NULL/UNDEFINED');
  });
}
test();
