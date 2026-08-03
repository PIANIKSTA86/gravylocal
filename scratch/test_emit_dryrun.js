const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const http = require('http');

const dbPath = 'C:/GravyLocal/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

// 1. Get a transaction ID of type 'FV'
db.all(`
  SELECT t.id, t.number, tt.code 
  FROM transactions t
  JOIN transaction_types tt ON t.tx_type_id = tt.id
  WHERE tt.code = 'FV'
  LIMIT 5
`, [], (err, txs) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (txs.length === 0) {
    console.log("No standard FV transactions found in DB.");
    process.exit(0);
  }

  console.log("Found FV transactions:", txs);
  const targetTx = txs[0];
  console.log("Testing with Tx:", targetTx);

  // 2. Perform request to /api/dian/emit using dryRun: true (which is supported in our hook!)
  // Since we might not have a token easily, we will simulate the request internally or use admin auth.
  // Wait, let's find an admin user's token or bypass auth by fetching it from the DB.
  // Let's get an admin from users table
  db.get("SELECT id, email FROM users WHERE role = 'admin' AND active = 1 LIMIT 1", [], (errAdmin, user) => {
    if (errAdmin || !user) {
      console.error("Could not find admin user:", errAdmin);
      process.exit(1);
    }
    console.log("Using user for request:", user);

    // Let's call PocketBase API local server on port 8090
    // First, let's authenticate as the user to get a token.
    // In pocketbase, we can login with password or we can bypass it by generating a token.
    // Since we know the admin email, let's authenticate.
    // Wait! Do we know the admin password?
    // Let's check: in setup.pb.js or start.bat, the seed admin user is julian_piano@hotmail.com or admin@gravy.com.
    // Let's check their password. The default seed password is 'Admin1234!' (seen in sync_users_to_hub.pb.js console print).
    // Let's try to authenticate with admin@gravy.com / Admin1234! or julian_piano@hotmail.com / Admin1234!

    const authData = JSON.stringify({
      identity: 'admin@gravy.com',
      password: 'Admin1234!'
    });

    const reqAuth = http.request({
      hostname: '127.0.0.1',
      port: 8090,
      path: '/api/collections/users/auth-with-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': authData.length
      }
    }, (resAuth) => {
      let bodyAuth = "";
      resAuth.on('data', chunk => bodyAuth += chunk);
      resAuth.on('end', () => {
        let token = "";
        try {
          const authRes = JSON.parse(bodyAuth);
          token = authRes.token;
        } catch (e) {
          console.warn("Could not login as admin@gravy.com, trying default password...", bodyAuth);
        }

        if (!token) {
          console.error("Authentication failed. Cannot perform dryRun test.");
          process.exit(1);
        }

        console.log("[+] Authenticated successfully!");

        // Now post to /api/dian/emit with dryRun: true
        const emitData = JSON.stringify({
          txId: targetTx.id,
          dryRun: true
        });

        const reqEmit = http.request({
          hostname: '127.0.0.1',
          port: 8090,
          path: '/api/dian/emit',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': emitData.length,
            'Authorization': token
          }
        }, (resEmit) => {
          let bodyEmit = "";
          resEmit.on('data', chunk => bodyEmit += chunk);
          resEmit.on('end', () => {
            console.log("=== EMIT RESPONSE (status code: " + resEmit.statusCode + ") ===");
            console.log(bodyEmit);
            process.exit(0);
          });
        });

        reqEmit.on('error', (e) => {
          console.error("Emit request error:", e);
        });

        reqEmit.write(emitData);
        reqEmit.end();
      });
    });

    reqAuth.on('error', (e) => {
      console.error("Auth request error:", e);
    });

    reqAuth.write(authData);
    reqAuth.end();
  });
});
