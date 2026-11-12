const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT xml_content FROM einvoice_docs WHERE cufe = 'f591d196d43db0dceb2eaa641ed1b2fd651e29f16c64de001a91037e21473dfedfa6201e5c0230bced56394bed1321af'", (err, row) => {
  if (err || !row) return;
  const xml = row.xml_content;
  // Extract all Description and Status tags
  const regex = /<b:[^>]*>([\s\S]*?)<\/b:[^>]*>|<cbc:Description>([\s\S]*?)<\/cbc:Description>/g;
  let m;
  console.log("=== XML Content ===");
  console.log(xml);
  db.close();
});

