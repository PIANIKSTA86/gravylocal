const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const bcCols = db.prepare("PRAGMA table_info(ph_billing_concepts)").all();
console.log('ph_billing_concepts columns:', bcCols.map(c => c.name));

const concepts = db.prepare("SELECT * FROM ph_billing_concepts").all();
console.log('ph_billing_concepts records:', concepts);
