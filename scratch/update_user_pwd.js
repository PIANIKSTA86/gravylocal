const fetch = require('node-fetch');

async function updatePassword() {
  // 1. Auth as superuser
  const loginRes = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  });
  const authData = await loginRes.json();
  const token = authData.token;
  console.log('Superuser token:', token ? 'OK' : 'FAIL');

  // 2. Find user admin@contaco.com
  const userRes = await fetch('http://127.0.0.1:8090/api/collections/users/records?filter=email="admin@contaco.com"', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const userData = await userRes.json();
  const userRec = userData.items[0];
  console.log('User rec:', userRec.id, userRec.email, userRec.role);

  // 3. Update password to admin123456
  const patchRes = await fetch(`http://127.0.0.1:8090/api/collections/users/records/${userRec.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      password: 'admin123456',
      passwordConfirm: 'admin123456'
    })
  });
  console.log('Patch status:', patchRes.status);
  const patchData = await patchRes.json();
  console.log('Patch result:', patchData);
}

updatePassword();
