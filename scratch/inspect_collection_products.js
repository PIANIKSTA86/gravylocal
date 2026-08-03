const pbUrl = 'http://127.0.0.1:8090';

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    }).then(r => r.json());
    
    if (!login.token) {
      console.log("No superuser token:", login);
      return;
    }
    const token = login.token;

    const res = await fetch(`${pbUrl}/api/collections/products`, {
      headers: { 'Authorization': token }
    }).then(r => r.json());

    console.log("Products Collection definition:");
    if (res.fields) {
      res.fields.forEach(f => {
        if (f.name.includes('peso') || f.name.includes('largo') || f.name.includes('ancho') || f.name.includes('alto')) {
          console.log(`  Field: ${f.name} | Type: ${f.type} | Required: ${f.required}`);
        }
      });
    } else {
      console.log(res);
    }
  } catch(e) {
    console.error("Error fetching collection:", e);
  }
}
run();
