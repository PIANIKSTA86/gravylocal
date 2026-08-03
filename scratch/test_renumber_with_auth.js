async function runTest() {
  try {
    const credentials = [
      { identity: 'admin@contaco.com', password: 'admin123456' },
      { identity: 'admin@gravy.com', password: 'admin123456' },
      { identity: 'cmartinez@gravy.com', password: 'admin123456' },
      { identity: 'admin@contaco.com', password: 'admin' },
      { identity: 'admin@gravy.com', password: 'admin' }
    ];

    let token = null;
    let userEmail = '';

    for (const cred of credentials) {
      try {
        const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cred)
        });
        const authData = await authRes.json();
        if (authRes.ok && authData.token) {
          token = authData.token;
          userEmail = cred.identity;
          console.log(`Successfully authenticated as ${userEmail}`);
          break;
        }
      } catch (_) {}
    }

    if (!token) {
      console.error("Could not authenticate with any user credential");
      return;
    }

    // Get FV transaction_types record
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

    db.get("SELECT id, code, name FROM transaction_types WHERE active = 1 AND code = 'FV'", async (err, typeRow) => {
      if (err || !typeRow) {
        console.error("Type not found:", err);
        return;
      }
      console.log("Found transaction type:", typeRow);

      const renumRes = await fetch('http://127.0.0.1:8090/api/gravy/renumber-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          txTypeId: typeRow.id,
          newStartConsecutive: 1001,
          padDigits: 8
        })
      });

      const renumData = await renumRes.json();
      console.log(`HTTP Status: ${renumRes.status}`);
      console.log("Renumber Response:", JSON.stringify(renumData, null, 2));
      db.close();
    });

  } catch (e) {
    console.error("Test Exception:", e);
  }
}

runTest();
