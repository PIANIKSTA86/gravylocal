const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const users = db.prepare("SELECT id, email, name, role, last_activity_at, last_login_at, active_session_id FROM users").all();

const nowUtcMs = Date.now();
const nowColMs = nowUtcMs - 5 * 3600 * 1000;
const nowStr = new Date(nowColMs).toISOString().replace("T", " ").slice(0, 19);

console.log('Current Colombia Time:', nowStr);
console.log('--- USER SESSIONS EVALUATION ---');

users.forEach(u => {
  const lastAct = u.last_activity_at || "";
  const activeSession = u.active_session_id || "";
  let status = "offline";
  let secondsAgo = null;

  const isRevoked = activeSession.startsWith("revoked_");
  if (lastAct && !isRevoked) {
    try {
      const actDateMs = Date.parse(lastAct.replace(" ", "T") + "Z");
      const colNowForAct = Date.parse(nowStr.replace(" ", "T") + "Z");
      secondsAgo = Math.max(0, Math.round((colNowForAct - actDateMs) / 1000));
      if (secondsAgo <= 180) {
        status = "online";
      } else if (secondsAgo <= 900) {
        status = "idle";
      } else {
        status = "offline";
      }
    } catch (_) {
      status = "offline";
    }
  }

  if (u.name.includes("CIELO") || u.email.includes("caldana") || u.role === "superadmin") {
    console.log(`User: ${u.name} (${u.email}) | Role: ${u.role}`);
    console.log(`   Last Activity: ${lastAct} (${secondsAgo}s ago) -> Status: ${status}`);
    console.log(`   Session ID: ${activeSession}`);
  }
});

console.log('\n--- SELLER LIVE LOCATIONS ---');
const live = db.prepare("SELECT id, seller_id, seller_name, user_id, status, last_ping FROM seller_live_locations").all();
console.log(live);
