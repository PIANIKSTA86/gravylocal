const pbUrl = 'http://127.0.0.1:8090';

async function tryAuth() {
  try {
    const res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const data = await res.json();
    return data.token;
  } catch (e) {
    console.error("Auth error", e);
  }
  return null;
}

async function run() {
  const token = await tryAuth();
  if (!token) {
    console.error("Failed to authenticate");
    return;
  }

  // Get the latest invoice that has a tx_id
  const invRes = await fetch(`${pbUrl}/api/collections/invoices/records?limit=1&filter=tx_id!=""`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const invData = await invRes.json();
  if (!invData.items || !invData.items.length) {
    console.error("No invoices with tx_id found");
    return;
  }
  const invoice = invData.items[0];
  const txId = invoice.tx_id;
  console.log(`Testing with Invoice ID: ${invoice.id}, Number: ${invoice.number}, Tx ID: ${txId}`);

  // Now post to /api/dian/emit
  const emitRes = await fetch(`${pbUrl}/api/dian/emit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ txId })
  });

  console.log(`Emit Response Status: ${emitRes.status}`);
  try {
    const emitData = await emitRes.json();
    console.log("Response JSON:");
    console.log(JSON.stringify(emitData, null, 2));
  } catch (e) {
    console.log("Response text (not JSON):", await emitRes.text());
  }
}

run();
