const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();

async function run() {
  const baseUrl = 'http://127.0.0.1:8090';
  const periodId = 'cbl3bx0qwi6fxio';
  const txIds = ["b5kjdcz1t257gou", "nbw2stn5ypsvd7b"];

  // Perform PATCH request anonymously
  const patchRes = await fetch(`${baseUrl}/api/collections/payroll_periods/records/${periodId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tx_id: txIds
    })
  });

  console.log('PATCH response status:', patchRes.status);
  const patchData = await patchRes.json();
  console.log('PATCH response body tx_id:', patchData.tx_id);
  console.log('Is array in response body?', Array.isArray(patchData.tx_id));

  // Inspect direct SQLite value
  const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db');
  db.get("SELECT tx_id FROM payroll_periods WHERE id='cbl3bx0qwi6fxio'", (err, row) => {
    if (err) {
      console.error(err);
    } else {
      console.log('SQLite value stored in tx_id:', row.tx_id);
    }
    
    // Reset back to empty
    db.run("UPDATE payroll_periods SET tx_id='' WHERE id='cbl3bx0qwi6fxio'", () => {
      db.close();
    });
  });
}

run();
