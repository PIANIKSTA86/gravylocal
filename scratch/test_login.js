async function run() {
  const email = 'admin@contaco.com';
  const passwords = ['Admin1234!', 'admin', 'admin123456', 'admin123'];
  
  for (const password of passwords) {
    try {
      const res = await fetch('http://127.0.0.1:8089/api/collections/hub_users/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password })
      });
      if (res.ok) {
        const body = await res.json();
        console.log(`Success! Logged into HUB with password: ${password}`);
        console.log("User details:", body.record.email, body.record.full_name);
        return;
      } else {
        console.log(`Failed for password ${password}:`, res.status, await res.text());
      }
    } catch (e) {
      console.log(`Error testing password ${password}:`, e.message);
    }
  }
}
run();
