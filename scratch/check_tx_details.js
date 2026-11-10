const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const tx = db.prepare("SELECT * FROM transactions WHERE id = 'ory5sv2andpyl3d'").get();
console.log('Transaction:', tx);

const allLines = db.prepare("SELECT * FROM tx_lines WHERE tx_id = 'ory5sv2andpyl3d'").all();
console.log('All lines:', allLines);

