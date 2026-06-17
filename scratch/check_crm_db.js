const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function checkDb(dbPath) {
  try {
    const db = new DatabaseSync(dbPath);
    const col = db.prepare("SELECT name, fields FROM _collections WHERE name = 'licenses'").get();
    if (col) {
      console.log(`================ Hub: ${col.name} ================`);
      console.log(JSON.stringify(JSON.parse(col.fields), null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

const rootDir = path.resolve(__dirname, '..');
checkDb(path.join(rootDir, 'hub', 'pb_data', 'data.db'));
