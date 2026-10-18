async function test() {
  const loginRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  const { token } = await loginRes.json();
  const filterStr = 'import_id="zva62hh26xjxn50"';
  
  // Test with cost_center_id in expand
  const urlWithCC = `http://127.0.0.1:8090/api/collections/tx_lines/records?filter=${encodeURIComponent(filterStr)}&expand=tx_id,account_id,third_party_id,cost_center_id&perPage=200`;
  const resWithCC = await fetch(urlWithCC, { headers: { 'Authorization': 'Bearer ' + token } });
  const dataWithCC = await resWithCC.json();
  console.log('With cost_center_id expand - Status:', resWithCC.status, 'TotalItems:', dataWithCC.totalItems, 'Error message:', dataWithCC.message);

  // Test without cost_center_id in expand
  const urlWithoutCC = `http://127.0.0.1:8090/api/collections/tx_lines/records?filter=${encodeURIComponent(filterStr)}&expand=tx_id,account_id,third_party_id&perPage=200`;
  const resWithoutCC = await fetch(urlWithoutCC, { headers: { 'Authorization': 'Bearer ' + token } });
  const dataWithoutCC = await resWithoutCC.json();
  console.log('Without cost_center_id expand - Status:', resWithoutCC.status, 'TotalItems:', dataWithoutCC.totalItems);
}
test();
