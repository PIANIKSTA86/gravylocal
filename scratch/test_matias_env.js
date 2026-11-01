const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const tokenRow = db.prepare("SELECT value FROM settings WHERE key='matias_api_token'").get();
const clientUuidRow = db.prepare("SELECT value FROM settings WHERE key='matias_client_uuid'").get();
const envRow = db.prepare("SELECT value FROM settings WHERE key='matias_environment'").get();

console.log('Token exists:', !!tokenRow?.value, 'len:', tokenRow?.value?.length);
console.log('Client UUID:', clientUuidRow?.value);
console.log('Environment:', envRow?.value);

const docs = db.prepare("SELECT id, uuid, number, supplier_name FROM electronic_documents").all();
console.log('Docs in pb_data/data.db:');
docs.forEach(d => console.log('  id=' + d.id + ', num=' + d.number + ', uuid=' + d.uuid));

