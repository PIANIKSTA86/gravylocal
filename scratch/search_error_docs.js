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

    const res = await fetch(`${pbUrl}/api/collections/einvoice_docs/records?perPage=100`, { headers });
    const data = await res.json();
    console.log("=== SEARCHING FOR ERROR DOCS ===");
    let found = false;
    data.items.forEach(doc => {
      if (doc.dian_response && (doc.dian_response.includes("autorización") || doc.dian_response.includes("plataforma") || doc.dian_response.includes("coinciden"))) {
        found = true;
        console.log(`\nDocument ID: ${doc.id}`);
        console.log(`  Status: ${doc.status}`);
        console.log(`  Response: ${doc.dian_response}`);
        console.log(`  Sent At: ${doc.sent_at}`);
        console.log(`  XML Content:`);
        console.log(doc.xml_content);
      }
    });
    if (!found) {
      console.log("No document with that error message found in einvoice_docs table.");
    }
  } catch (err) {
    console.error(err);
  }
}
run();
