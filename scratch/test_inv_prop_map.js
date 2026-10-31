const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const allInvs = db.prepare("SELECT number, property_id FROM ph_invoices WHERE status != 'voided'").all();
const invPropMap = new Map();
allInvs.forEach(i => {
  if (i.number) invPropMap.set(i.number.toUpperCase().trim(), i.property_id.toLowerCase());
});
console.log('CF-202606-000078 ->', invPropMap.get('CF-202606-000078'));
console.log('CF-202607-000078 ->', invPropMap.get('CF-202607-000078'));
console.log('CF-202608-000078 ->', invPropMap.get('CF-202608-000078'));
console.log('CF-202609-000078 ->', invPropMap.get('CF-202609-000078'));

const prop2603 = db.prepare("SELECT id, code FROM ph_properties WHERE code = '2603'").get();
const prop2702 = db.prepare("SELECT id, code FROM ph_properties WHERE code = '2702'").get();
console.log('Unit 2603 id:', prop2603.id.toLowerCase());
console.log('Unit 2702 id:', prop2702.id.toLowerCase());

