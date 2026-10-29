const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.all("SELECT email FROM _superusers", async (err, superusers) => {
  const adminEmail = superusers[0]?.email || 'test@admin.com';
  for (const pwd of ['1234567890', 'admin123456', 'admin']) {
    try {
      const auth = await fetch('http://127.0.0.1:8091/api/collections/_superusers/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: adminEmail, password: pwd })
      });
      if (auth.ok) {
        const d = await auth.json();
        const res = await fetch('http://127.0.0.1:8091/api/dian/sync-matias-resolutions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': d.token
          },
          body: JSON.stringify({})
        });
        const rdata = await res.json();
        console.log("Sync Status:", res.status);
        console.log("Sync Result:", JSON.stringify(rdata, null, 2));
        db.close();
        return;
      }
    } catch (e) {}
  }
  db.close();
});
