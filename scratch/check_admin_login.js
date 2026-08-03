const fetch = globalThis.fetch || require('node-fetch');

async function testAuth() {
  const ports = [8090];
  const users = ['admin@contaco.com', 'cmartinez@gravy.com', 'bortega@gravy.com', 'amoncada@gravy.com', 'areyes@gravy.com'];
  const passwords = ['1234567890', 'admin123456', '12345678', 'admin', 'admin123', 'Admin123!', '123456', 'gravy123', 'gravy2026', 'Gravy2026!', '123456789', 'password', 'password123'];

  for (const port of ports) {
    for (const email of users) {
      for (const pass of passwords) {
        try {
          const res = await fetch(`http://localhost:${port}/api/collections/users/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password: pass })
          });
          if (res.ok) {
            const data = await res.json();
            console.log(`[SUCCESS] Port ${port} | User: ${email} (pass: ${pass}) | Role: ${data.record.role}`);
            console.log(`Token: ${data.token}`);
            return data.token;
          }
        } catch (err) {
          // quiet
        }
      }
    }
  }
  console.log("No valid password matched.");
}

testAuth();
