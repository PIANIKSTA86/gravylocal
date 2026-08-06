const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));
db.prepare("UPDATE settings SET value = 'mock' WHERE key = 'ftech_password'").run();
console.log('Successfully updated ftech_password to mock');
