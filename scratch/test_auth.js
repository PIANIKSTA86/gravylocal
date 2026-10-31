const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8092/pb_data/data.db', { readOnly: true });
console.log(db.prepare("SELECT id, email FROM users LIMIT 3").all());
try {
  console.log(db.prepare("SELECT id, email FROM _admins LIMIT 3").all());
} catch (e) {
  console.log(e.message);
}
db.close();

