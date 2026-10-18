const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT value FROM settings WHERE key = 'matias_api_token'", async (err, row) => {
  if (err || !row) {
    console.error('Error fetching token:', err);
    return;
  }
  const token = row.value;
  console.log('Token length:', token.length);

  const envRow = await new Promise(res => db.get("SELECT value FROM settings WHERE key = 'matias_environment'", (_, r) => res(r)));
  const env = envRow?.value || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';
  console.log('Environment:', env, 'BaseUrl:', baseUrl);

  try {
    const res = await fetch(`${baseUrl}/company/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    console.log('MATIAS API status:', res.status, res.statusText);
    const data = await res.json();
    console.log('MATIAS API data sample:', JSON.stringify(data).slice(0, 300));
  } catch (e) {
    console.error('Fetch error:', e);
  }
  db.close();
});
