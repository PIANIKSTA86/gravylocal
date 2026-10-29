const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

async function testAuth() {
  const users = [
    { col: '_superusers', email: 'julian.mm.piano@gmail.com' },
    { col: '_superusers', email: 'superadmin@contaco.com' },
    { col: '_superusers', email: 'test2@admin.com' },
    { col: 'users', email: 'admin@contaco.com' }
  ];

  const pwds = ['1234567890', '12345678', 'admin123456', 'admin123', 'admin', 'password', 'Julian123*', 'Contaco2026*'];

  for (const u of users) {
    for (const p of pwds) {
      try {
        const res = await fetch(`http://127.0.0.1:8091/api/collections/${u.col}/auth-with-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: u.email, password: p })
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`AUTHENTICATED: ${u.col} -> ${u.email} with password "${p}"`);
          return data.token;
        }
      } catch (e) {}
    }
  }
  console.log("None of the passwords matched.");
}

testAuth();
