const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const props = db.prepare("SELECT id, code, name FROM ph_properties ORDER BY code ASC").all();
console.log(`Total properties: ${props.length}`);

let differences = 0;
for (const p of props) {
  const invs = db.prepare("SELECT period, number FROM ph_invoices WHERE property_id = ? AND number LIKE 'CF-%' ORDER BY period ASC").all(p.id);
  if (invs.length > 1) {
    const seqs = invs.map(i => i.number.slice(10)); // e.g. '000078'
    const firstSeq = seqs[0];
    const allSame = seqs.every(s => s === firstSeq);
    if (!allSame) {
      differences++;
      console.log(`Property ${p.code} has varying sequences:`, invs.map(i => `${i.period}:${i.number}`));
    }
  }
}
console.log(`Properties with varying sequence numbers: ${differences}`);

