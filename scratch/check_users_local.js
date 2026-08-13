const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));
const user = db.prepare("SELECT id, email, tokenKey FROM users LIMIT 1").all();
console.log("User token key sample:", user);
