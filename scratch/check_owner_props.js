const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const ownerProps = db.prepare(`SELECT id, code, name, apartment, tower, owner_id FROM ph_properties WHERE owner_id = 's2al2xdlkno843k'`).all();
console.log('=== PROPERTIES OWNED BY DILSA MATILDE GALEANO LOPEZ ===');
console.table(ownerProps);
