import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('pb_data/data.db');
const xml = fs.readFileSync('scratch/doc_373_dian.xml', 'utf8');

const res = db.prepare('UPDATE electronic_payrolls SET xml_generado = ?, updated = ? WHERE id = ?').run(
  xml,
  new Date().toISOString().replace('T', ' ').slice(0, 19),
  '4yq4uhrngoyvkkw'
);

console.log('Updated payroll 4yq4uhrngoyvkkw with signed XML:', res.changes);

