const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const testIds = ['5996dibwttdpjg2', '4yi78j1v008eogt', 'wtfcr6m7wmw49qi', 't1hbrdpojdhv980', 'giyd2rz4d0gv7ik', 'bnfw0wuy9usg65y'];

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
tables.forEach(t => {
  try {
    const res = db.prepare(`SELECT * FROM ${t} WHERE id IN ('${testIds.join("','")}')`).all();
    if (res.length > 0) {
      console.log(`FOUND in table ${t}:`, res);
    }
  } catch(e) {}
});

