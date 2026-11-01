const { DatabaseSync } = require('node:sqlite');
const https = require('https');

const db = new DatabaseSync('pb_data/data.db');
const token = db.prepare("SELECT value FROM settings WHERE key='matias_api_token'").get()?.value;
const clientUuid = db.prepare("SELECT value FROM settings WHERE key='matias_client_uuid'").get()?.value;
const env = db.prepare("SELECT value FROM settings WHERE key='matias_environment'").get()?.value;

console.log('Token length:', token ? token.length : 0);
console.log('Client UUID:', clientUuid);
console.log('Env:', env);

const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';

const doc = db.prepare("SELECT id, uuid, number, supplier_name FROM electronic_documents WHERE uuid != '' LIMIT 1").get();
console.log('Testing with doc:', doc.number, 'CUFE:', doc.uuid);

const fullUrl = `${baseUrl}/events/status/${encodeURIComponent(doc.uuid)}?client_uuid=${encodeURIComponent(clientUuid)}`;

https.get(fullUrl, {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Matias status check response code:', res.statusCode);
    console.log('Body:', body.slice(0, 500));
  });
}).on('error', err => console.error('Error:', err.message));

