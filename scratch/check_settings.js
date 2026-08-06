const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const rows = db.prepare("SELECT key, value FROM settings").all();

rows.forEach(r => {
  if (r.key.includes('ftech') || r.key.includes('email') || r.key.includes('dian') || r.key.includes('einvoice') || r.key.includes('company') || r.key.includes('pass')) {
    console.log(`${r.key} = "${r.value}"`);
  }
});
