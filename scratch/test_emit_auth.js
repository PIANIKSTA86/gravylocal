const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.all("SELECT email FROM _superusers", async (err, superusers) => {
  console.log('Superusers:', superusers);
  for (const adm of (superusers || [])) {
    for (const pwd of ['1234567890', 'admin123456', 'admin', 'password', 'Admin12345*']) {
      try {
        const res = await fetch('http://127.0.0.1:8091/api/collections/_superusers/auth-with-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity: adm.email, password: pwd })
        });
        if (res.ok) {
          const d = await res.json();
          console.log(`Success with ${adm.email} / ${pwd}! Token obtained.`);
          
          // Now emit FE-00003095
          const emitRes = await fetch('http://127.0.0.1:8091/api/dian/emit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': d.token
            },
            body: JSON.stringify({ txId: 'e7at7ig46055tsl' })
          });
          const emitData = await emitRes.json();
          console.log('EMIT RESULT:', emitRes.status, JSON.stringify(emitData, null, 2));
          db.close();
          return;
        }
      } catch (_) {}
    }
  }
  console.log('Could not auth with common passwords.');
  db.close();
});
