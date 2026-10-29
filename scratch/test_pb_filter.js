async function run() {
  const loginRes = await fetch('http://127.0.0.1:8091/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  const { token } = await loginRes.json();

  const filter = '(number ~ "NC" || tx_type_id.code = "NC") && date >= "2026-08-01" && date <= "2026-10-26 23:59:59"';
  const qExp = await fetch('http://127.0.0.1:8091/api/collections/invoices/records?filter=' + encodeURIComponent(filter) + '&expand=customer_id,warehouse_id,tx_type_id,parent_invoice_id', {
    headers: { 'Authorization': token }
  });
  console.log('qExp status:', qExp.status);
  const resExp = await qExp.json();
  if (qExp.status !== 200) {
    console.log('Error details:', resExp);
  } else {
    console.log('Success with date filter, items returned:', resExp.items.length);
  }
}
run();
