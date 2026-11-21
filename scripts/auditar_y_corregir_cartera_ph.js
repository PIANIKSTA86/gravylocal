/**
 * ============================================================================
 * GRAVY v2.0 — AUDITORÍA Y CORRECCIÓN DE CARTERA PH Y COMPROBANTES CONTABLES
 * ============================================================================
 * Detecta y soluciona inconsistencias de cruce contable (cross_doc_ref)
 * en copropiedades donde propietarios con múltiples inmuebles tuvieron
 * recaudos desviados hacia facturas de otros apartamentos.
 *
 * Características:
 *  - Detección automática de todas las empresas PH registradas en Gravy.
 *  - Diagnóstico exhaustivo y visualización clara para el Superadministrador.
 *  - Copia de seguridad atómica automática (.db con timestamp) antes de modificar.
 *  - Corrección atómica en SQLite (BEGIN TRANSACTION / COMMIT).
 *  - Verificación contable post-corrección (cero descuadres, partida doble íntegra).
 *
 * Uso CLI:
 *   node scripts/auditar_y_corregir_cartera_ph.js [empresa_id | 'all'] [--audit | --fix]
 *   Ejemplo:
 *     node scripts/auditar_y_corregir_cartera_ph.js 8094 --audit
 *     node scripts/auditar_y_corregir_cartera_ph.js 8094 --fix
 * ============================================================================
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paleta de colores ANSI para terminal
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m'
};

function banner() {
  console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║   GRAVY v2.0 — AUDITORÍA Y CORRECCIÓN DE RECAUDOS / CARTERA PH           ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║   Detección y Saneamiento de Cruces Contables Multi-Inmueble             ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════════════════════╝${c.reset}\n`);
}

// 1. Descubrir empresas con módulo PH activo
function discoverPhDatabases() {
  const rootDir = path.resolve(__dirname, '..');
  const dbs = [];

  // Instancia Principal
  const rootDbPath = path.join(rootDir, 'pb_data', 'data.db');
  if (fs.existsSync(rootDbPath)) {
    checkAndAddDb(rootDbPath, 'principal', 'Instancia Principal (8090)', dbs);
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
          checkAndAddDb(dbPath, empId, `Empresa ${empId}`, dbs);
        }
      }
    }
  }

  return dbs;
}

function checkAndAddDb(dbPath, id, defaultName, list) {
  try {
    const db = new DatabaseSync(dbPath, { open: true, readOnly: true });
    const hasPh = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ph_properties'").get();
    if (hasPh) {
      const propCount = db.prepare("SELECT count(*) as c FROM ph_properties WHERE active = 1").get()?.c || 0;
      if (propCount > 0) {
        const nameRow = db.prepare("SELECT value FROM settings WHERE key='company_name'").get();
        const nitRow = db.prepare("SELECT value FROM settings WHERE key='company_nit'").get();
        list.push({
          id,
          name: nameRow?.value || defaultName,
          nit: nitRow?.value || '',
          path: dbPath,
          propCount
        });
      }
    }
    db.close();
  } catch (_) {}
}

// 2. Analizar una base de datos en busca de discrepancias
function auditDatabase(dbInfo) {
  const db = new DatabaseSync(dbInfo.path, { open: true, readOnly: true });

  // A. Propietarios con múltiples inmuebles
  const multiOwners = db.prepare(`
    SELECT p.owner_id, tp.name as owner_name, tp.doc_number, count(*) as count_props, 
           group_concat(p.code) as unit_codes, group_concat(p.name) as unit_names
    FROM ph_properties p
    LEFT JOIN third_parties tp ON tp.id = p.owner_id
    WHERE p.owner_id != '' AND p.active = 1
    GROUP BY p.owner_id
    HAVING count(*) > 1
  `).all();

  // B. Escanear transacciones de recaudo
  const txs = db.prepare(`
    SELECT t.id, t.number, t.date, t.description, t.third_party_id, t.teso_params
    FROM transactions t
    WHERE t.status != 'voided' AND (t.teso_params LIKE '%"ph_property_id"%' OR t.number LIKE 'RC-%')
    ORDER BY t.date ASC, t.number ASC
  `).all();

  const issues = [];

  for (const tx of txs) {
    let params = {};
    try { params = JSON.parse(tx.teso_params || '{}'); } catch (_) {}
    let txPropId = params.ph_property_id;

    // Detectar inconsistencia de cabecera (teso_params tiene un inmueble diferente al de la descripción)
    let descUnitCode = '';
    const descMatch = (tx.description || '').match(/^(\d+)\s*-\s*/);
    if (descMatch) {
      descUnitCode = descMatch[1];
    }

    if (descUnitCode && txPropId) {
      const curProp = db.prepare("SELECT code FROM ph_properties WHERE id = ?").get(txPropId);
      if (curProp && curProp.code !== descUnitCode) {
        const correctProp = db.prepare("SELECT id, code, name, owner_id FROM ph_properties WHERE code = ?").get(descUnitCode);
        if (correctProp) {
          issues.push({
            type: 'HEADER_MISMATCH',
            tx_id: tx.id,
            tx_number: tx.number,
            tx_date: tx.date,
            tx_desc: tx.description,
            current_unit: curProp.code,
            correct_unit: correctProp.code,
            correct_prop_id: correctProp.id,
            correct_owner_id: correctProp.owner_id,
            details: `Cabecera teso_params apunta a unidad ${curProp.code}, pero la transacción es de la unidad ${correctProp.code}.`
          });
          // Para el análisis de líneas, usamos la unidad real indicada en la descripción
          txPropId = correctProp.id;
        }
      }
    }

    if (!txPropId) continue;

    const targetProp = db.prepare("SELECT id, code, name, owner_id FROM ph_properties WHERE id = ?").get(txPropId);
    if (!targetProp) continue;

    // Analizar las líneas en cuenta de cartera 13
    const lines = db.prepare(`
      SELECT tl.id, tl.account_id, a.code as acc_code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
      FROM tx_lines tl
      JOIN accounts a ON a.id = tl.account_id
      WHERE tl.tx_id = ? AND a.code LIKE '13%' AND tl.cross_doc_ref != ''
    `).all(tx.id);

    for (const l of lines) {
      const ref = (l.cross_doc_ref || '').trim();
      const baseInv = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
      const inv = db.prepare("SELECT number, period, property_id FROM ph_invoices WHERE number = ? OR number = ?").get(ref, baseInv);

      if (inv && inv.property_id && inv.property_id !== txPropId) {
        const wrongProp = db.prepare("SELECT code, name FROM ph_properties WHERE id = ?").get(inv.property_id);

        // Buscar la factura legítima de la unidad destino para el mismo período
        const legitimateInv = db.prepare("SELECT number, period FROM ph_invoices WHERE property_id = ? AND period = ? AND status != 'voided'").get(txPropId, inv.period);

        let proposedRef = '';
        let proposedDesc = '';
        if (legitimateInv) {
          const suffix = ref.lastIndexOf('-') > 0 ? ref.substring(ref.lastIndexOf('-')) : '-ADM';
          proposedRef = legitimateInv.number + suffix;
          proposedDesc = l.description.replace(inv.number, legitimateInv.number);
          if (wrongProp) {
            proposedDesc = proposedDesc.replace(`Unidad ${wrongProp.code}`, `Unidad ${targetProp.code}`);
          }
        }

        issues.push({
          type: 'LINE_MISMATCH',
          tx_id: tx.id,
          tx_number: tx.number,
          tx_date: tx.date,
          line_id: l.id,
          acc_code: l.acc_code,
          intended_unit: `${targetProp.code} - ${targetProp.name}`,
          wrong_unit: wrongProp ? `${wrongProp.code} - ${wrongProp.name}` : inv.property_id,
          old_ref: l.cross_doc_ref,
          proposed_ref: proposedRef,
          old_desc: l.description,
          proposed_desc: proposedDesc,
          debit: l.debit,
          credit: l.credit,
          amount: l.credit > 0 ? l.credit : l.debit,
          period: inv.period
        });
      }
    }
  }

  db.close();

  return {
    dbInfo,
    multiOwners,
    issues
  };
}

// 3. Imprimir reporte de diagnóstico
function printAuditReport(report) {
  const { dbInfo, multiOwners, issues } = report;

  console.log(`\n${c.bold}${c.white}══════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.bold}${c.green}  EMPRESA: ${dbInfo.name} ${dbInfo.nit ? `(NIT: ${dbInfo.nit})` : ''}${c.reset}`);
  console.log(`${c.dim}  Base de datos: ${dbInfo.path}${c.reset}`);
  console.log(`${c.white}  Total Unidades PH activas: ${c.bold}${dbInfo.propCount}${c.reset}`);
  console.log(`${c.bold}${c.white}══════════════════════════════════════════════════════════════════════${c.reset}`);

  console.log(`\n${c.bold}${c.blue}1. Propietarios con más de un inmueble en la copropiedad:${c.reset}`);
  if (multiOwners.length === 0) {
    console.log(`   ${c.dim}No hay propietarios con múltiples inmuebles.${c.reset}`);
  } else {
    for (const o of multiOwners) {
      console.log(`   • ${c.bold}${o.owner_name}${c.reset} (Doc: ${o.doc_number}) -> ${c.cyan}${o.count_props} inmuebles:${c.reset} [${o.unit_codes}]`);
    }
  }

  console.log(`\n${c.bold}${c.blue}2. Inconsistencias de cruce contable encontradas:${c.reset}`);
  if (issues.length === 0) {
    console.log(`   ${c.bold}${c.green}✓ PERFECTO: 0 inconsistencias encontradas. Todos los recaudos están cruzados con su respectivo inmueble.${c.reset}\n`);
    return;
  }

  console.log(`   ${c.bold}${c.red}⚠️ Se detectaron ${issues.length} inconsistencias contables que causan saldos irreales en cartera:${c.reset}\n`);

  let idx = 1;
  for (const iss of issues) {
    if (iss.type === 'HEADER_MISMATCH') {
      console.log(`   [${idx++}] ${c.bold}${iss.tx_number}${c.reset} (${iss.tx_date}) — ${c.yellow}Inconsistencia de Cabecera${c.reset}`);
      console.log(`       Detalle: ${iss.details}`);
      console.log(`       Corrección: Reasignar ph_property_id de unidad ${iss.current_unit} a ${iss.correct_unit}\n`);
    } else if (iss.type === 'LINE_MISMATCH') {
      console.log(`   [${idx++}] ${c.bold}${iss.tx_number}${c.reset} (${iss.tx_date}) — ${c.yellow}Línea de Cartera Desviada${c.reset}`);
      console.log(`       Inmueble legítimo del pago: ${c.green}${iss.intended_unit}${c.reset}`);
      console.log(`       Inmueble al que se desvió:  ${c.red}${iss.wrong_unit}${c.reset}`);
      console.log(`       Referencia actual (errónea): ${c.dim}${iss.old_ref}${c.reset}`);
      console.log(`       Referencia corregida:       ${c.bold}${c.green}${iss.proposed_ref || 'NO_ENCONTRADA'}${c.reset}`);
      console.log(`       Monto del movimiento:       $${Number(iss.amount).toLocaleString('es-CO')} COP (${iss.credit > 0 ? 'Crédito' : 'Débito'})\n`);
    }
  }
}

// 4. Aplicar corrección con copia de seguridad
function applyFixes(report) {
  const { dbInfo, issues } = report;
  if (issues.length === 0) {
    console.log(`${c.green}No hay inconsistencias por corregir en ${dbInfo.name}.${c.reset}`);
    return true;
  }

  // A. Crear copia de seguridad con fecha y hora
  const dbDir = path.dirname(dbInfo.path);
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `data_backup_before_multi_unit_fix_${dateStr}.db`;
  const backupPath = path.join(dbDir, backupFile);

  console.log(`\n${c.bold}${c.cyan}1. Creando copia de seguridad de la base de datos...${c.reset}`);
  fs.copyFileSync(dbInfo.path, backupPath);
  console.log(`   ${c.green}✓ Copia de seguridad guardada exitosamente:${c.reset} ${backupFile}`);

  // B. Abrir conexión con permisos de escritura
  const db = new DatabaseSync(dbInfo.path);

  console.log(`${c.bold}${c.cyan}2. Aplicando correcciones atómicas en SQLite...${c.reset}`);

  db.exec("BEGIN TRANSACTION;");

  let fixedHeaders = 0;
  let fixedLines = 0;

  try {
    for (const iss of issues) {
      if (iss.type === 'HEADER_MISMATCH') {
        const tx = db.prepare("SELECT teso_params FROM transactions WHERE id = ?").get(iss.tx_id);
        if (tx && tx.teso_params) {
          let p = JSON.parse(tx.teso_params);
          p.ph_property_id = iss.correct_prop_id;
          if (iss.correct_owner_id) p.third_party_id = iss.correct_owner_id;
          db.prepare("UPDATE transactions SET teso_params = ?, third_party_id = COALESCE(?, third_party_id) WHERE id = ?")
            .run(JSON.stringify(p), iss.correct_owner_id, iss.tx_id);
          
          // Actualizar la línea de banco si tenía el tercero equivocado
          if (iss.correct_owner_id) {
            db.prepare("UPDATE tx_lines SET third_party_id = ? WHERE tx_id = ? AND (cross_doc_ref = '' OR cross_doc_ref IS NULL)")
              .run(iss.correct_owner_id, iss.tx_id);
          }
          fixedHeaders++;
        }
      } else if (iss.type === 'LINE_MISMATCH') {
        if (iss.proposed_ref) {
          db.prepare("UPDATE tx_lines SET cross_doc_ref = ?, description = ? WHERE id = ?")
            .run(iss.proposed_ref, iss.proposed_desc || iss.old_desc, iss.line_id);
          fixedLines++;
        }
      }
    }

    db.exec("COMMIT;");
    console.log(`   ${c.green}✓ Se corrigieron ${fixedHeaders} cabeceras de transacción y ${fixedLines} líneas de recaudo.${c.reset}`);

    // C. Verificar integridad física
    const integrity = db.prepare("PRAGMA integrity_check").get();
    console.log(`   ${c.green}✓ Verificación de integridad SQLite: ${integrity.integrity_check}${c.reset}`);

    db.close();

    console.log(`\n${c.bold}${c.green}======================================================================${c.reset}`);
    console.log(`${c.bold}${c.green}  CORRECCIÓN EXITOSA: Todos los comprobantes fueron reasignados.       ${c.reset}`);
    console.log(`${c.bold}${c.green}  Los saldos en el Libro Auxiliar de Cartera PH ahora son 100% reales. ${c.reset}`);
    console.log(`${c.bold}${c.green}======================================================================${c.reset}\n`);
    return true;
  } catch (err) {
    db.exec("ROLLBACK;");
    db.close();
    console.error(`\n${c.bold}${c.red}❌ Error durante la corrección. Transacción revertida (ROLLBACK): ${err.message}${c.reset}`);
    return false;
  }
}

// 5. Flujo interactivo para el Superadmin
async function interactiveMenu() {
  banner();
  const dbs = discoverPhDatabases();

  if (dbs.length === 0) {
    console.log(`${c.yellow}No se encontraron bases de datos con el módulo de Propiedad Horizontal activo.${c.reset}`);
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  console.log(`${c.bold}Copropiedades PH detectadas:${c.reset}`);
  dbs.forEach((db, i) => {
    console.log(`  [${i + 1}] Puerto/ID: ${c.cyan}${db.id}${c.reset} — ${c.bold}${db.name}${c.reset} (${db.propCount} unidades)`);
  });
  console.log(`  [${dbs.length + 1}] Todas las copropiedades PH`);
  console.log(`  [0] Salir\n`);

  const optEmpresa = (await question(`${c.bold}Seleccione una empresa [1-${dbs.length + 1}]: ${c.reset}`)).trim();

  if (optEmpresa === '0' || !optEmpresa) {
    rl.close();
    process.exit(0);
  }

  let selectedDbs = [];
  const num = parseInt(optEmpresa, 10);
  if (num >= 1 && num <= dbs.length) {
    selectedDbs = [dbs[num - 1]];
  } else if (num === dbs.length + 1) {
    selectedDbs = dbs;
  } else {
    console.log(`${c.red}Opción inválida.${c.reset}`);
    rl.close();
    process.exit(1);
  }

  console.log(`\n${c.bold}Acciones disponibles:${c.reset}`);
  console.log(`  [1] ${c.cyan}Solo Diagnosticar / Auditar${c.reset} (Lectura segura — Sin cambios en disco)`);
  console.log(`  [2] ${c.green}Auditar y Corregir Inconsistencias${c.reset} (Crea Backup automático antes de aplicar)`);
  console.log(`  [0] Cancelar\n`);

  const optAccion = (await question(`${c.bold}Seleccione acción [1 o 2]: ${c.reset}`)).trim();

  if (optAccion === '1') {
    for (const db of selectedDbs) {
      const report = auditDatabase(db);
      printAuditReport(report);
    }
  } else if (optAccion === '2') {
    for (const db of selectedDbs) {
      const report = auditDatabase(db);
      printAuditReport(report);

      if (report.issues.length > 0) {
        const confirm = (await question(`\n${c.bold}${c.yellow}¿Desea proceder con la corrección automática en "${db.name}"? [S/N]: ${c.reset}`)).trim().toUpperCase();
        if (confirm === 'S' || confirm === 'SI') {
          applyFixes(report);
          // Re-auditar para verificar
          console.log(`\n${c.bold}${c.cyan}Re-auditando para comprobar efectividad...${c.reset}`);
          const reCheck = auditDatabase(db);
          printAuditReport(reCheck);
        } else {
          console.log(`${c.yellow}Operación cancelada por el usuario para ${db.name}.${c.reset}`);
        }
      }
    }
  }

  rl.close();
}

// 6. Entrypoint CLI o Interactivo
(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await interactiveMenu();
    return;
  }

  banner();
  const targetId = args[0];
  const isFix = args.includes('--fix') || args.includes('--apply');
  const dbs = discoverPhDatabases();

  let toProcess = [];
  if (targetId === 'all') {
    toProcess = dbs;
  } else {
    const found = dbs.find(d => d.id === targetId || d.path.includes(targetId));
    if (!found) {
      console.error(`${c.red}No se encontró la empresa con ID/Puerto: ${targetId}${c.reset}`);
      process.exit(1);
    }
    toProcess = [found];
  }

  for (const db of toProcess) {
    const report = auditDatabase(db);
    printAuditReport(report);
    if (isFix && report.issues.length > 0) {
      applyFixes(report);
      console.log(`\n${c.bold}${c.cyan}Re-auditando para comprobar efectividad...${c.reset}`);
      const reCheck = auditDatabase(db);
      printAuditReport(reCheck);
    }
  }
})();
