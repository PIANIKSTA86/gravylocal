const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const mainDb = 'pb_data/data.db';
const db = new sqlite3.Database(mainDb, sqlite3.OPEN_READONLY);

// Get settings
db.all("SELECT key, value FROM settings WHERE key IN ('company_third_party_id', 'dian_nit', 'company_name', 'einvoice_method')", [], (err, rows) => {
  if (err) { console.error(err); db.close(); return; }
  console.log('Settings:');
  rows.forEach(r => console.log(`  ${r.key}: ${r.value}`));
  
  const companyTPId = rows.find(r => r.key === 'company_third_party_id');
  if (companyTPId && companyTPId.value) {
    db.all("SELECT id, name, doc_number, doc_type, person_type, resp, tax_regime FROM third_parties WHERE id = ?", [companyTPId.value], (err, tpRows) => {
      if (err) { console.error(err); }
      else {
        console.log('\nCompany Third Party:');
        tpRows.forEach(r => console.log(JSON.stringify(r, null, 2)));
      }
      db.close();
    });
  } else {
    db.close();
  }
});
