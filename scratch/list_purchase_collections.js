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

  const colsRes = await fetch('http://127.0.0.1:8090/api/collections?perPage=200', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const colsData = await colsRes.json();
  console.log("All collections and rules:");
  colsData.items.forEach(c => {
    if (c.name.includes('purchase') || c.name.includes('invoice') || c.name.includes('line')) {
      console.log(`\nCollection: ${c.name} (id: ${c.id})`);
      console.log("  List Rule:  ", c.listRule);
      console.log("  View Rule:  ", c.viewRule);
      console.log("  Create Rule:", c.createRule);
      console.log("  Update Rule:", c.updateRule);
      console.log("  Delete Rule:", c.deleteRule);
    }
  });
}
run();
