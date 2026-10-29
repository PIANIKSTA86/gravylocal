const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
  'empresas/pb_data/data.db'
];

for (const p of dbs) {
  if (!fs.existsSync(p)) continue;
  try {
    const db = new DatabaseSync(p);
    let comp = 'N/A';
    try {
      const s = db.prepare("SELECT value FROM settings WHERE key='company_name' OR key='company' LIMIT 1").get();
      comp = s?.value || 'N/A';
    } catch(_) {}
    const count = db.prepare("SELECT count(*) as c FROM payroll_periods WHERE date_from >= '2026-07-01'").get();
    const epCount = db.prepare("SELECT count(*) as c FROM electronic_payrolls WHERE ano=2026 AND mes >= 7").get();
    console.log(`${p.padEnd(45)} | Comp: ${comp.slice(0, 30).padEnd(30)} | Periods Jul+: ${count.c} | EP Jul+: ${epCount.c}`);
  } catch (e) {
    console.log(`${p.padEnd(45)} | Error: ${e.message}`);
  }
}
