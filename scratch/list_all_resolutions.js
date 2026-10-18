const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", async (err, row) => {
  const token = row?.value;
  const baseUrl = 'https://sandbox-api.matias-api.com/api/ubl2.1';

  const res = await fetch(`${baseUrl}/resolutions`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  const data = await res.json();
  console.log('Total resolutions in Sandbox:', data.dataRecords.total);
  data.dataRecords.data.forEach(r => {
    console.log(`- Prefix: [${r.prefix}] | ResNum: [${r.resolution_number}] | TypeDocId: ${r.type_document_id} | Name: ${r.invoice_name} (${r.type_document?.voucher_name})`);
  });
  db.close();
});
