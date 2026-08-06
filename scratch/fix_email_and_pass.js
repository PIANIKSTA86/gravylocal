const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));

// Update company_email in settings
db.prepare("UPDATE settings SET value = 'facturacion@domestiko.com' WHERE key = 'company_email'").run();

// Also update ftech_password in settings with user's valid key
db.prepare("UPDATE settings SET value = '8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb' WHERE key = 'ftech_password'").run();

console.log("Updated company_email and ftech_password in settings.");
