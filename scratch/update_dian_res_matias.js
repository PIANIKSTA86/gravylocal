const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.serialize(() => {
  db.run("UPDATE dian_resolutions SET prefix = 'DS', resolution_number = '18760000001', number_from = 1, number_to = 1000 WHERE document_type = 'DS'", function(err) {
    if (err) console.error('Error updating DS resolution:', err);
    else console.log(`Updated DS resolution. Rows affected: ${this.changes}`);
  });

  db.run("UPDATE dian_resolutions SET prefix = 'NADS', resolution_number = '18760000001', number_from = 1, number_to = 1000 WHERE document_type = 'NDS'", function(err) {
    if (err) console.error('Error updating NDS resolution:', err);
    else console.log(`Updated NDS resolution. Rows affected: ${this.changes}`);
  });
});

db.close();
