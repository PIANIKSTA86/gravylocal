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

    const res = await fetch(`${pbUrl}/api/collections/dian_resolutions/records?filter=active=true`, { headers });
    const data = await res.json();
    console.log("=== ACTIVE RESOLUTIONS IN DATABASE ===");
    data.items.forEach(r => {
      console.log(`- ID: ${r.id}`);
      console.log(`  Document Type: ${r.document_type}`);
      console.log(`  Prefix: "${r.prefix}"`);
      console.log(`  Resolution Number: "${r.resolution_number}"`);
      console.log(`  From Number: ${r.number_from}`);
      console.log(`  To Number: ${r.number_to}`);
      console.log(`  Current Number: ${r.current_number}`);
      console.log(`  Expiration Date: ${r.expiration_date}`);
      console.log(`  Resolution Date: ${r.resolution_date}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
