const { DatabaseSync } = require('node:sqlite');
const path = require('path');

async function testEmitFv3785() {
  try {
    // Authenticate user
    const userAuthRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: '1234567890' })
    });

    if (!userAuthRes.ok) {
      console.error('User auth failed status:', userAuthRes.status);
      return;
    }

    const uData = await userAuthRes.json();
    const token = uData.token;

    console.log('Testing /api/dian/emit for tx qx1d9gsts97jp4q (FV-00003785)...');

    const res = await fetch('http://127.0.0.1:8090/api/dian/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ txId: 'qx1d9gsts97jp4q' })
    });

    console.log('Emit HTTP Status Code:', res.status);
    console.log('Emit Response JSON:', await res.json());

  } catch (err) {
    console.error('Error:', err);
  }
}

testEmitFv3785();
