const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8092/pb_data/data.db', { readOnly: true });
const logo = db.prepare("SELECT key, length(value) as len, substr(value, 1, 50) as preview FROM settings WHERE key LIKE '%logo%'").all();
console.log(logo);
db.close();

