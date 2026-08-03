const loginAndEmit = async () => {
  const identities = [
    { identity: 'admin@gravy.com', password: 'admin' },
    { identity: 'admin@gravy.com', password: 'admin123456' },
    { identity: 'admin@admin.com', password: 'admin' }
  ];

  let token = '';
  for (const cred of identities) {
    try {
      const loginRes = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred)
      });
      console.log(`Creds ${cred.identity}: status = ${loginRes.status}`);
      const text = await loginRes.text();
      console.log(`Response text: ${text.substring(0, 200)}`);
      if (loginRes.status === 200) {
        const data = JSON.parse(text);
        token = data.token;
        console.log(`Logged in successfully with ${cred.identity}`);
        break;
      }
    } catch (e) {
      console.error(`Error with ${cred.identity}:`, e.message);
    }
  }
};

loginAndEmit();
