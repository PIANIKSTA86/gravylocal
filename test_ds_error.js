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
  
  const tpResp = await fetch(`${url}/third_parties/records`, { headers: { 'Authorization': token } }).then(r => r.json());
  const txResp = await fetch(`${url}/transaction_types/records`, { headers: { 'Authorization': token } }).then(r => r.json());
  
  const dsType = txResp.items.find(t => t.code === 'DS');
  if (!dsType) {
    console.log("DS transaction type not found");
    return;
  }
  
  console.log("Found DS type", dsType.id);
  
  const res = await fetch(`${url}/purchase_invoices/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      number: 'TEMP-' + Date.now(),
      date: '2026-06-08',
      supplier_id: tpResp.items[0]?.id || '',
      tx_type_id: dsType.id,
      tx_number: 'AUTO',
      status: 'draft',
      subtotal: 100,
      total: 100
    })
  });
  
  const body = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(body, null, 2));
}
run();
