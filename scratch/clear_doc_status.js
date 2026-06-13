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

  // Find the doc record for tx_id lp44qya1uuw6ts5
  const txId = 'lp44qya1uuw6ts5';
  const res = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?filter=tx_id="${txId}"`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  if (data.items && data.items.length) {
    const doc = data.items[0];
    console.log(`Found doc record: id=${doc.id}, status=${doc.status}. Deleting...`);
    
    // Delete it
    const delRes = await fetch(`${pbUrl}/api/collections/einvoice_docs/records/${doc.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (delRes.status === 204) {
      console.log("einvoice_docs record deleted successfully.");
    } else {
      console.error("Failed to delete record", delRes.status);
    }
  } else {
    console.log("No einvoice_docs record found for this transaction. Ready to send fresh!");
  }
}

run();
