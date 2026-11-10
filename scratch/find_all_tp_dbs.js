const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

function findDbs(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.git') continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res = res.concat(findDbs(full));
    } else if (f.endsWith('.db') && stat.size > 0 && !f.includes('corrupt')) {
      res.push(full);
    }
  }
  return res;
}

const allDbs = findDbs('.');
console.log('Found DBs:', allDbs);

allDbs.forEach(dbp => {
  try {
    const db = new DatabaseSync(dbp);
    const tp = db.prepare("SELECT id, name, doc_number FROM third_parties WHERE name LIKE '%CATALINA%' OR id = '5996dibwttdpjg2'").all();
    if (tp.length > 0) {
      console.log(`In ${dbp}:`, tp);
    }
  } catch(e) {}
});

