const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all("SELECT count(*) as count, sum(total) as tot FROM ph_invoices WHERE number LIKE 'SI-%' AND status != 'voided'", (e, r) => {
  console.log('Active SI invoices in ph_invoices:', r);
});
db.all("SELECT count(*) as count, sum(total) as tot FROM ph_invoices WHERE number LIKE 'SI-%' AND status = 'voided'", (e, r) => {
  console.log('Voided SI invoices in ph_invoices:', r);
});

// Check if any invoice has tx_id = 'asomshl38rr0fx3'
db.all("SELECT id, number, property_id, total, status FROM ph_invoices WHERE tx_id = 'asomshl38rr0fx3'", (e, r) => {
  console.log('Invoices linked to tx_id asomshl38rr0fx3:', r.length);
  if (r.length > 0) console.log('Sample:', r.slice(0, 5));
});

