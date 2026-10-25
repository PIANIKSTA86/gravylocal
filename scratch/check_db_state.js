const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

console.log('--- USERS ---');
const users = db.prepare("SELECT id, email, name, role, last_activity_at, last_login_at, active_session_id FROM users WHERE name LIKE '%CIELO%' OR name LIKE '%ALISON%'").all();
console.log(users);

console.log('\n--- ALL ACTIVE USERS (ordered by last_activity_at desc) ---');
const activeUsers = db.prepare("SELECT id, email, name, role, last_activity_at, last_login_at, active_session_id FROM users ORDER BY last_activity_at DESC LIMIT 10").all();
console.log(activeUsers);

console.log('\n--- SELLER LIVE LOCATIONS ---');
const live = db.prepare('SELECT * FROM seller_live_locations').all();
console.log(live);

console.log('\n--- SELLER TRACKING LOGS (Last 10) ---');
const logs = db.prepare('SELECT id, user, seller, latitude, longitude, status, created, updated FROM seller_tracking_logs ORDER BY created DESC LIMIT 10').all();
console.log(logs);
