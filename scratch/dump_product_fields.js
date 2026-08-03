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
    console.error("Auth failed");
    return;
  }
  token = authData.token;

  const productsResp = await fetch('http://127.0.0.1:8090/api/collections/products/records?perPage=1', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());
  
  if (productsResp.items && productsResp.items.length > 0) {
    console.log("Product keys:", Object.keys(productsResp.items[0]));
    console.log("Full product object:", JSON.stringify(productsResp.items[0], null, 2));
  } else {
    console.log("No products found");
  }
}
run();
