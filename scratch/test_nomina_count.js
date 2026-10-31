const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const dirs = ['pb_data', 'empresas/empresa_8091/pb_data', 'empresas/empresa_8093/pb_data', 'empresas/empresa_8094/pb_data'];
dirs.forEach(d => {
  const p = d + '/data.db';
  if (fs.existsSync(p)) {
    try {
      const db = new DatabaseSync(p, { readOnly: true });
      const c = db.prepare("SELECT count(*) as total FROM electronic_payrolls").get();
      console.log(d, c);
      db.close();
    } catch (_) {}
  }
});
