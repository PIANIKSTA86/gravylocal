const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token };

    const res = await fetch(`${pbUrl}/api/collections/transactions/records/l4sy5boeq0gdq6h`, { headers });
    const tx = await res.json();
    console.log(JSON.stringify(tx, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
