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

  const usersRes = await fetch('http://127.0.0.1:8090/api/collections/users/records', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const usersData = await usersRes.json();
  console.log("Users and their roles:");
  if (usersData.items) {
    usersData.items.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Username: ${u.username}, Role: ${u.role}`);
    });
  } else {
    console.log(usersData);
  }
}
run();
