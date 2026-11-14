/**
 * RECONCILIADOR DE DOCUMENTOS DE CRUCE EN CARTERA PH Y CONTABILIDAD
 * -----------------------------------------------------------------
 * Este script analiza y reconcilia las referencias de cruce (cross_doc_ref)
 * en los recaudos (RC-) donde el número consecutivo de la factura (CF-)
 * fue estimado/adivinado previamente por el sistema de recaudo automático
 * y difiere del consecutivo real asignado al causar el mes.
 *
 * Características:
 *  - Compatible con cualquier empresa / base de datos PocketBase (SQLite).
 *  - Detección automática de todas las empresas en GravyLocalTABS.
 *  - Creación de copia de seguridad automática antes de cualquier cambio.
 *  - Modo Simulación (--dry-run) y Modo Aplicación directa.
 *  - Garantía absoluta de Partida Doble (no altera débitos ni créditos).
 *  - Verificación contable global post-ejecución (0 descuadres).
 *
 * Uso:
 *   node scripts/reconcile_cruce_cartera.js [empresa_id | ruta_db] [--dry-run] [--apply]
 * Ejemplos:
 *   node scripts/reconcile_cruce_cartera.js 8094
 *   node scripts/reconcile_cruce_cartera.js 8094 --dry-run
 *   node scripts/reconcile_cruce_cartera.js ./empresas/empresa_8091/pb_data/data.db
 *   node scripts/reconcile_cruce_cartera.js all
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paleta de colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

function logHeader(text) {
  console.log(`\n${colors.bright}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}======================================================================${colors.reset}`);
}

function logSub(text) {
  console.log(`\n${colors.bright}${colors.blue}--- ${text} ---${colors.reset}`);
}

// 1. Descubrimiento de bases de datos disponibles
function discoverDatabases() {
  const rootDir = path.resolve(__dirname, '..');
  const dbs = [];

  // Instancia Principal (Root)
  const rootDbPath = path.join(rootDir, 'pb_data', 'data.db');
  if (fs.existsSync(rootDbPath)) {
    dbs.push({
      id: 'principal',
      folder: 'pb_data',
      path: rootDbPath,
      name: 'Instancia Principal (8090)',
      nit: ''
    });
  }

  // Empresas en ./empresas/
  const empresasDir = path.join(rootDir, 'empresas');
  if (fs.existsSync(empresasDir)) {
    const entries = fs.readdirSync(empresasDir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory() && ent.name.startsWith('empresa_')) {
        const dbPath = path.join(empresasDir, ent.name, 'pb_data', 'data.db');
        if (fs.existsSync(dbPath)) {
          const empId = ent.name.replace('empresa_', '');
          dbs.push({
            id: empId,
            folder: ent.name,
            path: dbPath,
            name: `Empresa ${empId}`,
            nit: ''
          });
        }
      }
    }
  }

  // Consultar nombres reales desde la tabla settings
  for (const item of dbs) {
    try {
      const db = new DatabaseSync(item.path, { open: true, readOnly: true });
      const nameRow = db.prepare("SELECT value FROM settings WHERE key='company_name'").get();
      const nitRow = db.prepare("SELECT value FROM settings WHERE key='company_nit'").get();
      if (nameRow && nameRow.value) item.name = nameRow.value;
      if (nitRow && nitRow.value) item.nit = nitRow.value;
    } catch (e) {
      // Ignorar si la BD no abre en modo lectura
    }
  }

  return dbs;
}

// 2. Procesamiento de una base de datos específica
function processDatabase(dbInfo, isDryRun = false) {
  logHeader(`PROCESANDO: ${dbInfo.name} ${dbInfo.nit ? `(NIT: ${dbInfo.nit})` : ''}`);
  console.log(`${colors.dim}Ruta: ${dbInfo.path}${colors.reset}`);
  console.log(`Modo: ${isDryRun ? `${colors.yellow}[SIMULACIÓN / DRY-RUN] (Sin cambios en disco)${colors.reset}` : `${colors.green}[APLICACIÓN REAL]${colors.reset}`}`);

  if (!fs.existsSync(dbInfo.path)) {
    console.error(`${colors.red}Error: No se encontró la base de datos en ${dbInfo.path}${colors.reset}`);
    return { success: false, updatedCount: 0 };
  }

  // Copia de seguridad si se va a modificar
  if (!isDryRun) {
    const dir = path.dirname(dbInfo.path);
    const nowStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `data_backup_before_cruce_fix_${nowStr}.db`;
    const backupPath = path.join(dir, backupName);
    fs.copyFileSync(dbInfo.path, backupPath);
    console.log(`${colors.green}✓ Copia de seguridad creada:${colors.reset} ${backupName}`);
  }

  const db = new DatabaseSync(dbInfo.path);

  // A. Obtener facturas de causación (CF- con débito > 0)
  logSub('1. Indexando Facturas de Causación (CF-)');
  const invoices = db.prepare(`
    SELECT t.number as tx_number, t.date, tl.third_party_id, tl.cross_doc_ref, tl.debit, tl.credit
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    WHERE tl.cross_doc_ref LIKE 'CF-%' AND tl.debit > 0
  `).all();

  console.log(`Facturas de causación encontradas: ${colors.bright}${invoices.length}${colors.reset}`);

  // Mapa: third_party_id + '_' + YYYYMM + '_' + CONCEPTO -> cross_doc_ref real
  const actualInvoiceMap = new Map();
  for (const inv of invoices) {
    const parts = inv.cross_doc_ref.split('-');
    if (parts.length >= 4) {
      const ym = parts[1]; // ej: 202611
      const concept = parts.slice(3).join('-'); // ej: ADM o MORA
      const key = `${inv.third_party_id}_${ym}_${concept}`;
      actualInvoiceMap.set(key, inv.cross_doc_ref);
    }
  }

  // B. Obtener líneas de pagos/recaudos con referencias a CF-
  logSub('2. Analizando Documentos de Recaudo y Cruces');
  const paymentLines = db.prepare(`
    SELECT tl.id as line_id, tl.tx_id, t.number as tx_number, t.date, tl.third_party_id, 
           tl.cross_doc_ref, tl.description, tl.debit, tl.credit, tp.name as third_name
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    LEFT JOIN third_parties tp ON tl.third_party_id = tp.id
    WHERE tl.cross_doc_ref LIKE 'CF-%' AND t.number NOT LIKE 'CF-%'
  `).all();

  console.log(`Líneas de recaudo con referencia CF- analizadas: ${colors.bright}${paymentLines.length}${colors.reset}`);

  const toUpdate = [];
  for (const p of paymentLines) {
    const parts = p.cross_doc_ref.split('-');
    if (parts.length >= 4) {
      const ym = parts[1];
      const concept = parts.slice(3).join('-');
      const key = `${p.third_party_id}_${ym}_${concept}`;
      const realRef = actualInvoiceMap.get(key);

      // Si existe una factura real para ese periodo y concepto, pero el número no coincide:
      if (realRef && realRef !== p.cross_doc_ref) {
        toUpdate.push({
          line_id: p.line_id,
          tx_id: p.tx_id,
          tx_number: p.tx_number,
          date: p.date,
          third_name: p.third_name || 'Tercero Desconocido',
          old_ref: p.cross_doc_ref,
          new_ref: realRef,
          old_desc: p.description || '',
          debit: p.debit,
          credit: p.credit,
          amount: p.credit > 0 ? p.credit : p.debit
        });
      }
    }
  }

  if (toUpdate.length === 0) {
    console.log(`\n${colors.green}✓ Excelente: No se detectaron desfases en documentos de cruce. Todas las facturas coinciden con sus recaudos.${colors.reset}`);
    return { success: true, updatedCount: 0 };
  }

  console.log(`\n${colors.yellow}Se encontraron ${toUpdate.length} líneas con diferencias en el número de factura:${colors.reset}\n`);

  toUpdate.forEach((item, idx) => {
    const formattedAmount = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.amount);
    console.log(`  ${colors.dim}${String(idx + 1).padStart(2, ' ')}.${colors.reset} [${colors.bright}${item.tx_number}${colors.reset}] ${item.date} | ${item.third_name}`);
    console.log(`      Ref. Almacenada: ${colors.red}${item.old_ref}${colors.reset}  -->  Ref. Real: ${colors.green}${item.new_ref}${colors.reset}  (${formattedAmount})`);
  });

  if (isDryRun) {
    console.log(`\n${colors.yellow}[MODO SIMULACIÓN] No se realizaron cambios físicos en la base de datos.${colors.reset}`);
    return { success: true, updatedCount: toUpdate.length };
  }

  // C. Aplicar actualización en transacción SQLite
  logSub('3. Aplicando Correcciones en Base de Datos');
  const updateStmt = db.prepare(`
    UPDATE tx_lines 
    SET cross_doc_ref = ?, description = ?
    WHERE id = ?
  `);

  db.exec('BEGIN TRANSACTION;');
  try {
    let count = 0;
    for (const item of toUpdate) {
      let newDesc = item.old_desc;
      if (newDesc && newDesc.includes(item.old_ref)) {
        newDesc = newDesc.replaceAll(item.old_ref, item.new_ref);
      }
      updateStmt.run(item.new_ref, newDesc, item.line_id);
      count++;
    }
    db.exec('COMMIT;');
    console.log(`${colors.green}✓ ${count} líneas actualizadas con éxito.${colors.reset}`);
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error(`${colors.red}Error durante la actualización. Transacción revertida:${colors.reset}`, err);
    return { success: false, updatedCount: 0 };
  }

  // D. Auditoría post-ejecución de partida doble
  logSub('4. Auditoría de Integridad Contable');
  const unbalanced = db.prepare(`
    SELECT t.number, t.date, SUM(tl.debit) as total_debit, SUM(tl.credit) as total_credit,
           ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as diff
    FROM transactions t
    JOIN tx_lines tl ON tl.tx_id = t.id
    GROUP BY t.id
    HAVING diff != 0
  `).all();

  if (unbalanced.length === 0) {
    console.log(`${colors.green}✓ Balance 100% Cuadrado: CERO transacciones descuadradas en la contabilidad.${colors.reset}`);
  } else {
    console.error(`${colors.red}ALERTA: Se detectaron ${unbalanced.length} transacciones descuadradas:${colors.reset}`, unbalanced);
  }

  return { success: true, updatedCount: toUpdate.length };
}

// 3. Flujo interactivo / CLI principal
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('--simular');
  const isApply = args.includes('--apply') || args.includes('--force');
  const cleanArgs = args.filter(a => !a.startsWith('--'));

  const availableDbs = discoverDatabases();

  if (availableDbs.length === 0) {
    console.error(`${colors.red}No se encontraron bases de datos en el workspace.${colors.reset}`);
    process.exit(1);
  }

  // Si se pasó un argumento de empresa o ruta directa
  let targetArg = cleanArgs[0];

  if (targetArg) {
    if (targetArg.toLowerCase() === 'all' || targetArg.toLowerCase() === 'todas') {
      logHeader('PROCESANDO TODAS LAS EMPRESAS DETECTADAS');
      for (const d of availableDbs) {
        processDatabase(d, isDryRun);
      }
      return;
    }

    // Buscar por ID de empresa (ej: 8094) o por nombre de carpeta
    let matched = availableDbs.find(d => d.id === targetArg || d.folder === targetArg || d.folder === `empresa_${targetArg}`);
    
    // Si no coincide con ID, verificar si es una ruta directa al archivo .db
    if (!matched && fs.existsSync(targetArg)) {
      matched = {
        id: 'custom',
        folder: path.basename(path.dirname(targetArg)),
        path: path.resolve(targetArg),
        name: 'Base de Datos Personalizada',
        nit: ''
      };
    }

    if (matched) {
      processDatabase(matched, isDryRun);
      return;
    } else {
      console.log(`${colors.red}No se encontró la empresa o ruta '${targetArg}'.${colors.reset}`);
    }
  }

  // Si no se proporcionaron argumentos, mostrar menú interactivo
  logHeader('UTILIDAD DE CONCILIACIÓN DE DOCUMENTOS DE CRUCE (CARTERA PH)');
  console.log(`Selecciona la base de datos que deseas conciliar:\n`);

  availableDbs.forEach((d, i) => {
    console.log(`  ${colors.bright}${colors.cyan}[${i + 1}]${colors.reset} ${d.name} ${d.nit ? `(NIT: ${d.nit})` : ''}`);
    console.log(`      ${colors.dim}ID: ${d.id} | Carpeta: ${d.folder}${colors.reset}`);
  });
  console.log(`  ${colors.bright}${colors.cyan}[A]${colors.reset} Procesar TODAS las empresas`);
  console.log(`  ${colors.bright}${colors.cyan}[Q]${colors.reset} Salir\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (q) => new Promise(res => rl.question(q, res));

  const choice = (await question(`${colors.bright}Ingresa una opción [1-${availableDbs.length}, A, Q]: ${colors.reset}`)).trim();

  if (choice.toLowerCase() === 'q') {
    console.log('Operación cancelada.');
    rl.close();
    return;
  }

  let selectedDbs = [];
  if (choice.toLowerCase() === 'a') {
    selectedDbs = availableDbs;
  } else {
    const idx = parseInt(choice, 10) - 1;
    if (idx >= 0 && idx < availableDbs.length) {
      selectedDbs = [availableDbs[idx]];
    } else {
      console.log(`${colors.red}Opción inválida.${colors.reset}`);
      rl.close();
      return;
    }
  }

  // Preguntar si desea simular o aplicar
  let runMode = isDryRun;
  if (!isDryRun && !isApply) {
    const modeAns = (await question(`\n${colors.bright}¿Deseas ejecutar primero una SIMULACIÓN (solo lectura)? [S/n]: ${colors.reset}`)).trim().toLowerCase();
    runMode = (modeAns === '' || modeAns === 's' || modeAns === 'si');
  }

  rl.close();

  for (const d of selectedDbs) {
    processDatabase(d, runMode);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error inesperado:${colors.reset}`, err);
  process.exit(1);
});

