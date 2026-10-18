const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", async (err, row) => {
  const token = row?.value;
  const baseUrl = 'https://sandbox-api.matias-api.com/api/ubl2.1';

  async function get(path) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      console.log(`\n=== GET ${path} (${res.status}) ===`);
      console.log(JSON.stringify(data).slice(0, 1000));
    } catch (e) {
      console.log(`Error in ${path}:`, e.message);
    }
  }

  await get('/company');
  await get('/company/resolutions');
  await get('/tables/operation-types');
  await get('/tables/type-documents');
  db.close();
});
