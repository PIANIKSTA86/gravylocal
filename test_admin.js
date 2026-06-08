async function test() {
  try {
    const authRes = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@admin.com', password: 'admin' })
    });
    const authData = await authRes.json();
    console.log(authData);
  } catch(e) {
    console.error(e);
  }
}
test();
