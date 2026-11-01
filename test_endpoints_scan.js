const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const rTok = db.prepare("SELECT value FROM settings WHERE key = 'matias_api_token'").get().value;
const rCli = db.prepare("SELECT value FROM settings WHERE key = 'matias_client_uuid'").get().value;

const endpoints = [
  '/api/ubl2.1/reception-people',
  '/api/ubl2.1/events/reception-people',
  '/api/ubl2.1/reception-persons',
  '/api/ubl2.1/events/reception-persons',
  '/api/ubl2.1/events/reception_people',
  '/api/ubl2.1/events/reception-person',
  '/api/ubl2.1/events/people',
  '/api/ubl2.1/crud?tbPrefix=T005',
  '/api/ubl2.1/crud/T005',
  '/api/ubl2.1/company',
  '/api/ubl2.1/config'
];

async function run() {
  for (const ep of endpoints) {
    const sep = ep.includes('?') ? '&' : '?';
    const url = 'https://api-v2.matias-api.com' + ep + sep + 'client_uuid=' + encodeURIComponent(rCli);
    try {
      const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + rTok, 'Accept': 'application/json' } });
      console.log(ep, res.status);
      if (res.status !== 404) {
        const txt = await res.text();
        console.log('->', txt.slice(0, 300));
      }
    } catch(e) {
      console.error(ep, e.message);
    }
  }
}
run();

