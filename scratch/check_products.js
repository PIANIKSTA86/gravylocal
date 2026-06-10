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
  console.log("Authed successfully!");

  const productsResp = await fetch('http://127.0.0.1:8090/api/collections/products/records?filter=(active=true)', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());
  
  console.log("Active products count:", productsResp.items?.length);
  if (productsResp.items && productsResp.items.length > 0) {
    console.log("First 10 active products:");
    productsResp.items.slice(0, 10).forEach(p => {
      console.log(`- ID: ${p.id}, Code: ${p.code}, Name: ${p.name}, Price: ${p.sales_price || p.base_price}, Cost: ${p.cost_price}`);
    });
  } else {
    console.log("No active products found!");
  }
}
run();
