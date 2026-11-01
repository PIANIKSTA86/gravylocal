const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

function checkDb(p) {
  if (!fs.existsSync(p)) return;
  try {
    const db = new DatabaseSync(p);
    console.log('=== ' + p + ' ===');
    try {
      const settings = db.prepare("SELECT key, substr(value, 1, 40) as val FROM settings WHERE key LIKE '%matias%' OR key LIKE '%dian%'").all();
      settings.forEach(s => console.log('  setting: ' + s.key + ' = ' + s.val));
    } catch (_) {}

    try {
      const docs = db.prepare("SELECT id, uuid, number, supplier_name FROM electronic_documents LIMIT 5").all();
      console.log('  electronic_documents count: ' + docs.length);
      docs.forEach(d => console.log('    doc: id=' + d.id + ', num=' + d.number + ', uuid=' + d.uuid?.slice(0, 20)));
    } catch (_) {}
  } catch (err) {
    console.log('  error opening ' + p + ': ' + err.message);
  }
}

['pb_data/data.db', 'empresas/empresa_8091/pb_data/data.db', 'empresas/empresa_8092/pb_data/data.db', 'empresas/empresa_8093/pb_data/data.db', 'empresas/empresa_8094/pb_data/data.db'].forEach(checkDb);

