const fs = require('fs');
const ts = Date.now();
if (fs.existsSync('pb_data/auxiliary.db')) {
  fs.renameSync('pb_data/auxiliary.db', 'pb_data/auxiliary_corrupt_' + ts + '.db');
}
if (fs.existsSync('pb_data/auxiliary.db-shm')) fs.unlinkSync('pb_data/auxiliary.db-shm');
if (fs.existsSync('pb_data/auxiliary.db-wal')) fs.unlinkSync('pb_data/auxiliary.db-wal');
console.log('auxiliary.db moved successfully.');
