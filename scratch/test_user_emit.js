const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));

// PocketBase password hash for '1234567890' (bcrypt)
// We can use PocketBase API or set password hash directly
async function testUserEmit() {
  try {
    // Authenticate with user
    const resAuth = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: '1234567890' })
    });

    let token = '';
    if (resAuth.ok) {
      const data = await resAuth.json();
      token = data.token;
    } else {
      console.log('User auth status:', resAuth.status, await resAuth.text());
      return;
    }

    console.log('User authenticated successfully!');

    const res = await fetch('http://127.0.0.1:8090/api/dian/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ txId: 'qx1d9gsts97jp4q' })
    });

    console.log('Emit Status Code:', res.status);
    console.log('Emit Response JSON:', await res.json());

  } catch (e) {
    console.error(e);
  }
}

testUserEmit();
