const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const { token } = await login.json();
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    const res = await fetch(`${pbUrl}/api/collections/invoices/records/es7iwn4est73qch`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ cross_doc_ref: 'FE-00000012' })
    });
    
    if (res.ok) {
      console.log("FENC-00000002 updated successfully with cross_doc_ref='FE-00000012'.");
    } else {
      console.error(await res.json());
    }
  } catch (err) {
    console.error(err);
  }
}
run();
