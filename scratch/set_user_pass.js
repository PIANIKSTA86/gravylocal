const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

// Copy superuser bcrypt hash to admin@contaco.com in users table
const su = db.prepare("SELECT password FROM _superusers WHERE id = 'b2mvaizhmmvq00w'").get();
console.log("Found superuser password hash:", su.password);

db.prepare("UPDATE users SET password = ? WHERE email = 'admin@contaco.com'").run(su.password);
console.log("Updated users table for admin@contaco.com!");
