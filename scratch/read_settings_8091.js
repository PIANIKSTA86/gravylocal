const pbUrl = 'http://127.0.0.1:8091';

async function test() {
  try {
    const authRes = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    const authData = await authRes.json();
    if (!authData.token) {
      console.error("Auth failed:", authData);
      return;
    }
    const token = authData.token;
    
    const settingsRes = await fetch(`${pbUrl}/api/collections/settings/records?limit=200`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const settingsData = await settingsRes.json();
    
    console.log("All setting keys:");
    console.log(settingsData.items.map(item => item.key));
  } catch(e) {
    console.error(e);
  }
}
test();
