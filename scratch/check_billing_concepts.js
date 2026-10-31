const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db'));
const concepts = db.prepare("SELECT id, code, name, account_id, default_amount, active FROM ph_billing_concepts").all();
console.table(concepts);

