const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const targets = [
  path.join(__dirname, '..', 'empresas', 'empresa_8091', 'pb_data', 'data.db'),
  path.join(__dirname, '..', 'pb_data', 'data.db')
];

targets.forEach(dbPath => {
  try {
    const db = new DatabaseSync(dbPath);
    const rows = db.prepare("SELECT id, name FROM _collections WHERE name IN ('merchandise_returns', 'merchandise_return_lines')").all();
    console.log(path.basename(path.dirname(dbPath)), 'collections:', rows);
  } catch (err) {
    console.log(dbPath, 'error:', err.message);
  }
});
