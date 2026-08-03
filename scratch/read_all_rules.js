async function run() {
  let token = null;
  let authUrl = 'http://127.0.0.1:8090/api/admins/auth-with-password';
  
  let res = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  
  if (res.status === 404 || res.status === 400) {
    authUrl = 'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password';
    res = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
  }

  const authData = await res.json();
  if (!authData.token) {
    console.error("Auth failed: ", authData);
    return;
  }
  token = authData.token;

  for (const name of ['invoices', 'purchase_invoices']) {
    const colRes = await fetch('http://127.0.0.1:8090/api/collections/' + name, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const collection = await colRes.json();
    console.log(`\nCollection: ${collection.name}`);
    console.log("Create Rule:", collection.createRule);
    console.log("Update Rule:", collection.updateRule);
    console.log("Delete Rule:", collection.deleteRule);
  }
}
run();
