const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const res = db.prepare("SELECT * FROM dian_resolutions").all();
console.log('Resoluciones DIAN existentes:');
console.table(res.map(r => ({
  id: r.id,
  type: r.document_type,
  prefix: r.prefix,
  current: r.current_number,
  from: r.number_from,
  to: r.number_to,
  resolution: r.resolution_number,
  active: r.active
})));

