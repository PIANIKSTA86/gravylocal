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

  // Let's create a new purchase_invoice with tx_type_id = 'b8ek09o3xxaju8z' (Documento Soporte)
  // Let's use any supplier (e.g. xroujo21twpcygo)
  const body = {
    tx_type_id: 'b8ek09o3xxaju8z',
    supplier_id: 'xroujo21twpcygo',
    date: '2026-07-15 00:00:00.000Z',
    subtotal: 100000,
    total: 100000,
    status: 'draft',
    due_date: '2026-07-15 00:00:00.000Z'
  };

  const res = await fetch(`${url}/purchase_invoices/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(body)
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Created purchase invoice details:", JSON.stringify(data, null, 2));
}
run();
