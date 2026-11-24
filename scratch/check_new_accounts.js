const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Busquemos cuentas creadas con ids o códigos altos o comparemos con las que teníamos
const accs = db.prepare("SELECT id, code, name, parent_code, level FROM accounts WHERE code IN ('236701', '23670101', '620535', '519521') OR code LIKE '999%'").all();
console.log('Cuentas testigo:', accs);

// Veamos si hay cuentas con IDs más recientes o códigos específicos
const maxLen = db.prepare("SELECT code, name, level, parent_code FROM accounts ORDER BY rowid DESC LIMIT 10").all();
console.log('Últimas cuentas en la tabla accounts:', maxLen);
