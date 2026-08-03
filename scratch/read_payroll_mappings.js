const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  // Buscar todas las keys del config de nómina
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1%'").all();
  
  // Reconstruir mappings
  const coreRow = rows.find(r => r.key === 'payroll_accounting_config_v1_core');
  const core = coreRow ? JSON.parse(coreRow.value) : {};
  
  // Mappings
  const mappingRows = rows.filter(r => r.key.startsWith('payroll_accounting_config_v1_mappings_part_')).sort((a,b) => a.key.localeCompare(b.key));
  let mappingsStr = mappingRows.map(r => r.value).join('');
  const mappings = mappingsStr ? JSON.parse(mappingsStr) : [];
  
  console.log("Core Config:", core);
  console.log("Número de Mappings:", mappings.length);
  
  // Filtrar mappings de EPS y Pensión para ver a qué cuentas y lados están mapeados
  const pps = mappings.filter(m => m.concept.includes('health') || m.concept.includes('pension'));
  console.log("\nMappings de Salud y Pensión:");
  console.log(JSON.stringify(pps, null, 2));
}

run();
