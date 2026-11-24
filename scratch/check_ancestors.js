const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const codesToCheck = ['62', '6205', '620535', '6225', '622535', '51', '5195', '519521', '23', '2367', '236701', '42', '4235', '423580', '47'];
const results = db.prepare(`SELECT code, name, level, parent_code, account_type_id, nature FROM accounts WHERE code IN (${codesToCheck.map(c => `'${c}'`).join(',')})`).all();
console.log('Ancestros existentes:', results);
