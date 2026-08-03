async function run() {
  const login = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@gravy.com', password: 'admin' })
  }).then(r => r.json());
  
  let token = login.token;
  if (!token) {
    const login2 = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@gravy.com', password: 'admin123456' })
    }).then(r => r.json());
    token = login2.token;
  }
  
  if (!token) {
    console.log("Could not authenticate");
    return;
  }
  
  const tpResp = await fetch('http://127.0.0.1:8090/api/collections/third_parties/records', {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  
  const txResp = await fetch('http://127.0.0.1:8090/api/collections/transaction_types/records', {
    headers: { 'Authorization': token }
  }).then(r => r.json());
  
  const fc = txResp.items.find(t => t.code === 'FC');
  
  const res = await fetch('http://127.0.0.1:8090/api/collections/purchase_invoices/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({
      number: 'TEMP-' + Date.now(),
      date: '2026-06-08',
      supplier_id: tpResp.items[0].id,
      tx_type_id: fc.id,
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
