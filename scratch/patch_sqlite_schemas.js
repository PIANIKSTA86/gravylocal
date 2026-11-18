const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbs = [
  './pb_data/data.db',
  './empresas/empresa_8091/pb_data/data.db',
  './empresas/empresa_8092/pb_data/data.db',
  './empresas/empresa_8093/pb_data/data.db',
  './empresas/empresa_8094/pb_data/data.db',
  './empresas/empresa_8095/pb_data/data.db'
];

dbs.forEach(p => {
  if (fs.existsSync(p)) {
    const db = new sqlite3.Database(p);
    db.serialize(() => {
      db.all("PRAGMA table_info(einvoice_docs)", [], (err, cols) => {
        if (!err && cols && cols.length > 0) {
          const names = cols.map(c => c.name);
          const toAdd = [
            { name: 'email_sent', type: 'BOOLEAN DEFAULT 0' },
            { name: 'email_sent_to', type: 'TEXT DEFAULT ""' },
            { name: 'email_sent_at', type: 'TEXT DEFAULT ""' },
            { name: 'email_status', type: 'TEXT DEFAULT ""' },
            { name: 'email_last_error', type: 'TEXT DEFAULT ""' }
          ];

          toAdd.forEach(col => {
            if (!names.includes(col.name)) {
              db.run(`ALTER TABLE einvoice_docs ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
                if (alterErr) console.warn(`Error adding ${col.name} to ${p}:`, alterErr.message);
                else console.log(`Added column ${col.name} to ${p}`);
              });
            }
          });
        }
      });

      // Also update _collections JSON schema for einvoice_docs
      db.get("SELECT id, fields FROM _collections WHERE name='einvoice_docs'", [], (err, colRow) => {
        if (!err && colRow && colRow.fields) {
          try {
            let fieldsArr = JSON.parse(colRow.fields);
            let fieldNames = fieldsArr.map(f => f.name);
            let updated = false;

            const newFields = [
              { autogeneratePattern: "", hidden: false, id: "bool_esnt", name: "email_sent", presentable: false, system: false, type: "bool" },
              { autogeneratePattern: "", hidden: false, id: "text_esto", max: 0, min: 0, name: "email_sent_to", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
              { autogeneratePattern: "", hidden: false, id: "text_esat", max: 0, min: 0, name: "email_sent_at", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
              { autogeneratePattern: "", hidden: false, id: "text_ests", max: 0, min: 0, name: "email_status", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
              { autogeneratePattern: "", hidden: false, id: "text_eler", max: 0, min: 0, name: "email_last_error", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" }
            ];

            newFields.forEach(nf => {
              if (!fieldNames.includes(nf.name)) {
                fieldsArr.push(nf);
                updated = true;
              }
            });

            if (updated) {
              db.run("UPDATE _collections SET fields=? WHERE id=?", [JSON.stringify(fieldsArr), colRow.id], (upErr) => {
                if (!upErr) console.log(`Updated _collections einvoice_docs schema in ${p}`);
              });
            }
          } catch (eJson) {
            console.warn("Error parsing _collections fields in", p, eJson);
          }
        }
      });
    });
  }
});
