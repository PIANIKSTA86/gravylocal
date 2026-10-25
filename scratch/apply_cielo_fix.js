const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// 1. Fix user name typo
db.prepare("UPDATE users SET name = 'CIELO DEL PILAR ALDANA VILLAMIZAR', full_name = 'CIELO DEL PILAR ALDANA VILLAMIZAR' WHERE id = 'mifjwap7fh3h0yk'").run();

// 2. Fix third_parties email and advisor link
db.prepare("UPDATE third_parties SET email = 'caldana@gravy.com', email2 = 'aldanacielo7845@gmail.com', advisor = 'mifjwap7fh3h0yk' WHERE id = 'v21xfu4abpcba2f'").run();

// 3. Fix seller_live_locations
// Remove any bad records or update sll_0zbb63nz7p6
db.prepare("DELETE FROM seller_live_locations WHERE seller_id = '0zbb63nz7p6tzwc'").run();

// Check if Cielo has a seller_live_locations record, if not insert it with the latest GPS coords from today
const latestLog = db.prepare("SELECT * FROM seller_tracking_logs ORDER BY created DESC LIMIT 1").get();
if (latestLog) {
  const nowStr = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  db.prepare(`
    INSERT INTO seller_live_locations (id, seller_id, user_id, seller_name, lat, lng, speed, accuracy, battery_level, is_charging, status, last_ping, created, updated)
    VALUES ('sll_cielo_aldana', 'v21xfu4abpcba2f', 'mifjwap7fh3h0yk', 'CIELO DEL PILAR ALDANA VILLAMIZAR', ?, ?, ?, 10, 80, 0, 'EN_TRANSITO', ?, datetime('now'), datetime('now'))
    ON CONFLICT(seller_id) DO UPDATE SET
      user_id = 'mifjwap7fh3h0yk',
      seller_name = 'CIELO DEL PILAR ALDANA VILLAMIZAR',
      lat = excluded.lat,
      lng = excluded.lng,
      last_ping = excluded.last_ping,
      updated = datetime('now')
  `).run(latestLog.lat, latestLog.lng, latestLog.speed || 0, nowStr);
}

// 4. Update today's tracking logs to Cielo's seller_id
db.prepare("UPDATE seller_tracking_logs SET seller_id = 'v21xfu4abpcba2f' WHERE seller_id = '0zbb63nz7p6tzwc' AND visit_date = '2026-10-23'").run();

// 5. Update Cielo's last_activity_at in users to right now!
const nowColombia = new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
db.prepare("UPDATE users SET last_activity_at = ?, last_login_at = ? WHERE id = 'mifjwap7fh3h0yk'").run(nowColombia, nowColombia);

console.log('Update complete!');

const user = db.prepare("SELECT id, email, name, last_activity_at FROM users WHERE id = 'mifjwap7fh3h0yk'").get();
console.log('Updated user:', user);

const live = db.prepare("SELECT * FROM seller_live_locations").all();
console.log('Updated seller_live_locations:', live);

const logCount = db.prepare("SELECT COUNT(*) as count FROM seller_tracking_logs WHERE seller_id = 'v21xfu4abpcba2f'").get();
console.log('Cielo tracking logs count:', logCount);
