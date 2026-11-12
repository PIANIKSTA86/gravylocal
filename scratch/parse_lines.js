const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT xml_content FROM einvoice_docs WHERE cufe = 'f591d196d43db0dceb2eaa641ed1b2fd651e29f16c64de001a91037e21473dfedfa6201e5c0230bced56394bed1321af'", (err, row) => {
  if (err || !row) return;
  const xml = row.xml_content;
  const matches = [...xml.matchAll(/<cac:LineResponse>[\s\S]*?<cbc:LineID>(.*?)<\/cbc:LineID>[\s\S]*?<cbc:ResponseCode>(.*?)<\/cbc:ResponseCode>[\s\S]*?<cbc:Description>(.*?)<\/cbc:Description>[\s\S]*?<\/cac:LineResponse>/g)];
  matches.forEach(m => {
    console.log(`Line ${m[1]}: [${m[2]}] ${m[3]}`);
  });
  db.close();
});

