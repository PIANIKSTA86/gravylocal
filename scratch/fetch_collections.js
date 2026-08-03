const pbUrl = 'http://127.0.0.1:8090';

async function tryAuth(url, identity, password) {
  try {
    const res = await fetch(`${pbUrl}/api/${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity, password })
    });
    if (res.ok) {
      const data = await res.ok ? await res.json() : null;
      if (data && data.token) return data.token;
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

async function run() {
  const credentials = [
    { url: 'admins/auth-with-password', id: 'test2@admin.com', pass: 'test123456' },
    { url: 'admins/auth-with-password', id: 'admin@gravy.com', pass: 'admin123456' },
    { url: 'admins/auth-with-password', id: 'admin@gravy.com', pass: 'admin' },
    { url: 'collections/_superusers/auth-with-password', id: 'test2@admin.com', pass: 'test123456' },
    { url: 'collections/_superusers/auth-with-password', id: 'admin@gravy.com', pass: 'admin123456' },
    { url: 'collections/_superusers/auth-with-password', id: 'admin@gravy.com', pass: 'admin' }
  ];

  let token = null;
  for (const cred of credentials) {
    token = await tryAuth(cred.url, cred.id, cred.pass);
    if (token) {
      console.log(`Authenticated successfully!`);
      break;
    }
  }

  if (!token) return;

  const targetCols = ['invoices'];
  for (const colName of targetCols) {
    const res = await fetch(`${pbUrl}/api/collections/${colName}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const col = await res.json();
      console.log(`Collection: ${col.name}`);
      console.log(JSON.stringify(col, null, 2));
      console.log("-----------------------------------------");
    }
  }
}

run();
