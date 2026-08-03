const fetch = require('node-fetch'); // wait, node-fetch might not be installed. Let's use standard http/https or dynamic import.
// Actually, since we're running in Node 18+, global fetch is available!
async function run() {
  const baseUrl = 'http://127.0.0.1:8090';
  
  // Let's login as admin to get auth token
  const authRes = await fetch(`${baseUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@contaco.com', password: 'admin' }) // wait, let's verify admin credentials if they fail
  }).catch(() => null);
  
  if (!authRes || !authRes.ok) {
    console.log('Failed to authenticate as admin. Let\'s check user auth.');
    // Let's check users auth
    const userAuthRes = await fetch(`${baseUrl}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'admin' }) // wait, the user's email was in logs: admin@contaco.com
    }).catch(() => null);
    if (userAuthRes && userAuthRes.ok) {
      const data = await userAuthRes.json();
      console.log('Logged in as user. Token:', data.token);
      await deleteTxs(data.token);
    } else {
      console.log('Failed user login too.');
    }
  } else {
    const data = await authRes.json();
    console.log('Logged in as admin. Token:', data.token);
    await deleteTxs(data.token);
  }
}

async function deleteTxs(token) {
  const baseUrl = 'http://127.0.0.1:8090';
  // Let's try to delete transaction 'b5kjdcz1t257gou' (NM-00000100)
  const id = 'b5kjdcz1t257gou';
  const res = await fetch(`${baseUrl}/api/collections/transactions/records/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Delete response for ${id}:`, res.status);
  if (!res.ok) {
    console.log(await res.text());
  }
}

run();
