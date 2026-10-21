const path = require('path');
const hubModules = path.join(__dirname, '..', 'hub', 'node_modules');
// Check if sqlite3 or any db driver exists in hub
try {
  const fs = require('fs');
  const dirs = fs.readdirSync(hubModules);
  console.log('Hub modules available:', dirs.filter(d => d.includes('sql') || d.includes('db')));
} catch (e) {
  console.error(e.message);
}
