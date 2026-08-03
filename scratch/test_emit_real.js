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
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  const txId = 'cymzvzu7se9yaw6';
  console.log(`Testing with Invoice Transaction ID: ${txId}`);

  // Delete existing einvoice_docs for this txId to allow fresh emission
  const docRes = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?filter=tx_id="${txId}"`, { headers });
  const docs = await docRes.json();
  if (docs.items && docs.items.length) {
    const doc = docs.items[0];
    console.log(`Deleting existing doc record ${doc.id} for transaction ${txId}...`);
    await fetch(`${pbUrl}/api/collections/einvoice_docs/records/${doc.id}`, {
      method: 'DELETE',
      headers
    });
  }

  // Now post to /api/dian/emit
  console.log("Posting to /api/dian/emit...");
  const emitRes = await fetch(`${pbUrl}/api/dian/emit`, {
    method: 'POST',
    headers,
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
