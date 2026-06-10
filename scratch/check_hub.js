async function run() {
  try {
    // Try admin login on HUB (port 8089)
    let token = '';
    const identities = ['admin@admin.com', 'admin@gravy.com', 'admin@gravy.local'];
    const passwords = ['admin', 'admin123456'];
    
    for (const identity of identities) {
      for (const password of passwords) {
        try {
          const loginRes = await fetch('http://127.0.0.1:8089/api/admins/auth-with-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity, password })
          });
          if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
            console.log(`Authenticated on HUB as admin using ${identity}`);
            break;
          }
        } catch (_) {}
      }
      if (token) break;
    }
    
    if (!token) {
      console.log("Failed to authenticate as admin on HUB. Let's try _superusers on HUB if it exists.");
      // Try regular auth on HUB
      for (const identity of ['test2@admin.com', 'admin@gravy.com', 'admin@gravy.local']) {
        for (const password of ['test123456', 'admin', 'admin123456']) {
          try {
            const loginRes = await fetch('http://127.0.0.1:8089/api/collections/_superusers/auth-with-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ identity, password })
            });
            if (loginRes.ok) {
              const data = await loginRes.json();
              token = data.token;
              console.log(`Authenticated on HUB as superuser using ${identity}`);
              break;
            }
          } catch (_) {}
        }
        if (token) break;
      }
    }
    
    if (!token) {
      console.log("Could not authenticate on HUB at all.");
      return;
    }
    
    // Now get all users from hub_users
    const usersRes = await fetch('http://127.0.0.1:8089/api/collections/hub_users/records', {
      headers: { 'Authorization': token }
    });
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      console.log("HUB Users:", JSON.stringify(usersData.items.map(u => ({ id: u.id, email: u.email })), null, 2));
    } else {
      console.log("Failed to fetch hub_users. Status:", usersRes.status);
      const errText = await usersRes.text();
      console.log("Error:", errText);
    }
    
    // Also get all companies and access mapping from HUB
    const companiesRes = await fetch('http://127.0.0.1:8089/api/collections/hub_companies/records', {
      headers: { 'Authorization': token }
    });
    if (companiesRes.ok) {
      const compData = await companiesRes.json();
      console.log("HUB Companies:", JSON.stringify(compData.items.map(c => ({ id: c.id, name: c.name, url: c.url })), null, 2));
    }
    
    const accessRes = await fetch('http://127.0.0.1:8089/api/collections/hub_access/records', {
      headers: { 'Authorization': token }
    });
    if (accessRes.ok) {
      const accData = await accessRes.json();
      console.log("HUB Access entries:", JSON.stringify(accData.items, null, 2));
    }
    
  } catch (err) {
    console.error("Error in script:", err);
  }
}
run();
