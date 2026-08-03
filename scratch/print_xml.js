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

    // Fetch the specific doc record
    const res = await fetch(`${pbUrl}/api/collections/einvoice_docs/records/yx3kykzl1jpzliz`, { headers });
    const doc = await res.json();
    console.log("=== XML CONTENT ===");
    console.log(doc.xml_content);
  } catch (err) {
    console.error(err);
  }
}
run();
