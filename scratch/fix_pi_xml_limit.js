const pbUrl = 'http://127.0.0.1:8099';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

async function run() {
  try {
    const login = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test@admin.com', password: '1234567890' })
    });
    const { token } = await login.json();
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 1. Fetch current collection schema
    const res = await fetch(`${pbUrl}/api/collections/purchase_invoices`, { headers });
    const collection = await res.json();
    
    // 2. Modify max limit for xml_content, dian_response, cuds, status_dian
    const xmlField = collection.fields?.find(f => f.name === 'xml_content');
    if (xmlField) xmlField.max = 1000000;

    const dianRespField = collection.fields?.find(f => f.name === 'dian_response');
    if (dianRespField) dianRespField.max = 100000;

    const cudsField = collection.fields?.find(f => f.name === 'cuds');
    if (cudsField) cudsField.max = 500;

    const statusField = collection.fields?.find(f => f.name === 'status_dian');
    if (statusField) statusField.max = 50;

    // 3. Update the collection schema
    const updateRes = await fetch(`${pbUrl}/api/collections/purchase_invoices`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(collection)
    });

    if (updateRes.ok) {
      console.log("Collection purchase_invoices updated successfully via API! xml_content max is now 1,000,000.");
    } else {
      console.error("Failed to update schema via API:", await updateRes.json());
      // Fallback: update in SQLite directly
      db.get("SELECT fields FROM _collections WHERE name='purchase_invoices'", (err, row) => {
        if (!err && row) {
          const fields = JSON.parse(row.fields);
          const xf = fields.find(f => f.name === 'xml_content');
          if (xf) xf.max = 1000000;
          const df = fields.find(f => f.name === 'dian_response');
          if (df) df.max = 100000;
          db.run("UPDATE _collections SET fields = ? WHERE name = 'purchase_invoices'", [JSON.stringify(fields)], () => {
            console.log("Updated via SQLite fallback.");
            db.close();
          });
        }
      });
      return;
    }
    db.close();
  } catch (err) {
    console.error(err);
    db.close();
  }
}

run();
