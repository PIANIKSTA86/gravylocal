const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const nom368 = db.prepare("SELECT * FROM electronic_payrolls WHERE id = 'u4mpu73bpvpb6qu'").get();
console.log('=== NOM-368 RAW XML / JSON ===');
console.log(nom368.xml_generado);

