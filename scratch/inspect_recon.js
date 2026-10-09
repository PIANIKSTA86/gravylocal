const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

try {
  const tx = db.prepare("SELECT * FROM transactions WHERE number LIKE '%NB-00000064%'").all();
  console.log("Transaction:", JSON.stringify(tx, null, 2));

  if (tx.length > 0) {
    const lines = db.prepare("SELECT * FROM tx_lines WHERE tx_id = ?").all(tx[0].id);
    console.log("Lines:", JSON.stringify(lines, null, 2));
  }

  const users = db.prepare("SELECT id, username, email, name, role, permissions FROM users").all();
  console.log("Users:", JSON.stringify(users, null, 2));

  const branches = db.prepare("SELECT id, name, code FROM branches").all();
  console.log("Branches:", JSON.stringify(branches, null, 2));
} catch (e) {
  console.error(e);
}
