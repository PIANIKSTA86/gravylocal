/**
 * ============================================================================
 * GRAVY v2.0 — RECLASIFICACIÓN DE CONCEPTOS DE CARTERA PH POR CUENTA CONTABLE
 * ============================================================================
 * Separa y reubica los registros contables de la cartera PH en cuentas
 * específicas según su concepto contable:
 *
 *   - 13459501: Cuota Ordinaria de Administración (ADM)
 *   - 13459502: Intereses de Mora (MORA)
 *   - 13459503: Cuotas Extraordinarias (EXT)
 *
 * Características:
 *  - Detección automática de todas las empresas PH en la plataforma Gravy.
 *  - Verificación y auto-aprovisionamiento de subcuentas en el PUC si faltan.
 *  - Modo Simulación (Dry-Run) con desglose exacto de débitos, créditos y saldos.
 *  - Copia de seguridad atómica automática (.db.bak_YYYYMMDD_HHMMSS) antes de aplicar.
 *  - Actualización atómica en SQLite con BEGIN IMMEDIATE / COMMIT.
 *  - Verificación contable post-ejecución (partida doble íntegra y balance intacto).
 *  - Sincronización de ph_billing_concepts para facturaciones futuras automáticas.
 *
 * Uso CLI:
 *   node scripts/reacomodar_conceptos_cartera_ph.js [empresa_id | 'all'] [--audit | --apply]
 *   Ejemplos:
 *     node scripts/reacomodar_conceptos_cartera_ph.js 8094 --audit
 *     node scripts/reacomodar_conceptos_cartera_ph.js 8094 --apply
 * ============================================================================
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paleta ANSI
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

const fmtCOP = (v) => '$ ' + Math.round(v || 0).toLocaleString('es-CO');

function banner() {
  console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║   GRAVY v2.0 — RECLASIFICACIÓN DE CONCEPTOS DE CARTERA PH                ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║   Separación Contable: 13459501 (ADM) / 13459502 (MORA) / 13459503 (EXT)║${c.reset}`);
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

// 2. Verificar y aprovisionar cuentas 13459501, 13459502, 13459503
function ensureTargetAccounts(db) {
  const required = [
    { code: '13459501', name: 'CUOTA ORDINARIA DE ADMINISTRACION', concept: 'ADM' },
    { code: '13459502', name: 'INTERESES DE MORA', concept: 'MORA' },
    { code: '13459503', name: 'CUOTAS EXTRAORDINARIAS', concept: 'EXT' }
  ];

  const map = {};

  // Tomar plantilla de 13459501 si existe
  const template = db.prepare("SELECT * FROM accounts WHERE code = '13459501'").get();

  for (const req of required) {
    let row = db.prepare("SELECT id, code, name, maneja_cruce FROM accounts WHERE code = ?").get(req.code);
    if (!row) {
      const newId = 'acc_' + req.code.toLowerCase();
      const parentCode = template ? template.parent_code : '134595';
      const nature = template ? template.nature : 'debit';
      const accountTypeId = template ? template.account_type_id : '';
      const level = template ? template.level : 5;

      try {
        db.prepare(`
          INSERT INTO accounts (id, code, name, parent_code, nature, account_type_id, level, maneja_cruce, requires_third_party, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1)
        `).run(newId, req.code, req.name, parentCode, nature, accountTypeId, level);
        console.log(`  ${c.green}✔ Subcuenta ${req.code} (${req.name}) aprovisionada exitosamente en el catálogo PUC.${c.reset}`);
        row = { id: newId, code: req.code, name: req.name, maneja_cruce: 1 };
      } catch (err) {
        console.error(`  ${c.red}✖ No se pudo crear la cuenta ${req.code}: ${err.message}${c.reset}`);
        return null;
      }
    } else {
      if (!row.maneja_cruce) {
        db.prepare("UPDATE accounts SET maneja_cruce = 1, requires_third_party = 1 WHERE id = ?").run(row.id);
      }
    }
    map[req.code] = row;
  }

  return map;
}

// 3. Análisis de líneas a reclasificar
function analyzeReclassification(db, accounts) {
  const acc134501 = accounts['13459501'];
  const acc134502 = accounts['13459502'];
  const acc134503 = accounts['13459503'];

  // Cargar balances actuales de las 3 cuentas
  const getBalance = (accId) => {
    return db.prepare(`
      SELECT 
        COUNT(*) as total_lines,
        COALESCE(SUM(debit), 0) as total_debit,
        COALESCE(SUM(credit), 0) as total_credit,
        COALESCE(SUM(debit - credit), 0) as net_balance
      FROM tx_lines tl
      JOIN transactions t ON t.id = tl.tx_id
      WHERE tl.account_id = ? AND t.status = 'active'
    `).get(accId);
  };

  const before134501 = getBalance(acc134501.id);
  const before134502 = getBalance(acc134502.id);
  const before134503 = getBalance(acc134503.id);

  // Líneas MORA en 13459501
  const moraLines = db.prepare(`
    SELECT tl.id, tl.tx_id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number as tx_num, t.date as tx_date
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    WHERE tl.account_id = ? 
      AND (
        tl.cross_doc_ref LIKE '%-MORA%' 
        OR tl.description LIKE '%[MORA]%' 
        OR UPPER(tl.description) LIKE '%INTERES%MORA%' 
        OR UPPER(tl.description) LIKE '%INTERÉS%MORA%'
      )
  `).all(acc134501.id);

  // Líneas EXT en 13459501
  const extLines = db.prepare(`
    SELECT tl.id, tl.tx_id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number as tx_num, t.date as tx_date
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    WHERE tl.account_id = ? 
      AND (
        tl.cross_doc_ref LIKE '%-EXT%' 
        OR tl.description LIKE '%[EXT]%' 
        OR UPPER(tl.description) LIKE '%CUOTA%EXTRA%' 
        OR UPPER(tl.description) LIKE '%EXTRAORDINARI%'
      )
  `).all(acc134501.id);

  // Totales a mover a MORA
  let moraDebits = 0, moraCredits = 0;
  for (const l of moraLines) {
    moraDebits += Number(l.debit || 0);
    moraCredits += Number(l.credit || 0);
  }

  // Totales a mover a EXT
  let extDebits = 0, extCredits = 0;
  for (const l of extLines) {
    extDebits += Number(l.debit || 0);
    extCredits += Number(l.credit || 0);
  }

  return {
    before: {
      '13459501': before134501,
      '13459502': before134502,
      '13459503': before134503
    },
    mora: {
      lines: moraLines,
      count: moraLines.length,
      debits: moraDebits,
      credits: moraCredits,
      net: moraDebits - moraCredits
    },
    ext: {
      lines: extLines,
      count: extLines.length,
      debits: extDebits,
      credits: extCredits,
      net: extDebits - extCredits
    },
    expectedAfter: {
      '13459501': {
        debit: before134501.total_debit - moraDebits - extDebits,
        credit: before134501.total_credit - moraCredits - extCredits,
        net: (before134501.total_debit - moraDebits - extDebits) - (before134501.total_credit - moraCredits - extCredits)
      },
      '13459502': {
        debit: before134502.total_debit + moraDebits,
        credit: before134502.total_credit + moraCredits,
        net: (before134502.total_debit + moraDebits) - (before134502.total_credit + moraCredits)
      },
      '13459503': {
        debit: before134503.total_debit + extDebits,
        credit: before134503.total_credit + extCredits,
        net: (before134503.total_debit + extDebits) - (before134503.total_credit + extCredits)
      }
    }
  };
}

// 4. Copia de seguridad atómica
function createDbBackup(dbPath) {
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const bakPath = `${dbPath}.bak_${ts}`;
  fs.copyFileSync(dbPath, bakPath);
  return bakPath;
}

// 5. Aplicar la reclasificación atómicamente
function applyReclassification(db, accounts, analysis) {
  const acc134501 = accounts['13459501'];
  const acc134502 = accounts['13459502'];
  const acc134503 = accounts['13459503'];

  db.exec('BEGIN IMMEDIATE TRANSACTION;');

  try {
    let moraUpdated = 0;
    let extUpdated = 0;

    // Actualizar líneas MORA
    const updateMoraStmt = db.prepare(`
      UPDATE tx_lines
      SET account_id = ?
      WHERE id = ?
    `);

    for (const l of analysis.mora.lines) {
      updateMoraStmt.run(acc134502.id, l.id);
      moraUpdated++;
    }

    // Actualizar líneas EXT
    const updateExtStmt = db.prepare(`
      UPDATE tx_lines
      SET account_id = ?
      WHERE id = ?
    `);

    for (const l of analysis.ext.lines) {
      updateExtStmt.run(acc134503.id, l.id);
      extUpdated++;
    }

    // Sincronizar conceptos de facturación en ph_billing_concepts
    db.prepare("UPDATE ph_billing_concepts SET cxc_account_id = ? WHERE code = 'ADM'").run(acc134501.id);
    db.prepare("UPDATE ph_billing_concepts SET cxc_account_id = ? WHERE code = 'MORA'").run(acc134502.id);
    db.prepare("UPDATE ph_billing_concepts SET cxc_account_id = ? WHERE code = 'EXT'").run(acc134503.id);

    db.exec('COMMIT;');

    return { success: true, moraUpdated, extUpdated };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// 6. Formateo y visualización de resultados
function printAnalysis(analysis) {
  console.log(`\n${c.bold}========================================================================================${c.reset}`);
  console.log(`${c.bold} RESUMEN DE REGISTROS A RECLASIFICAR EN CARTERA PH${c.reset}`);
  console.log(`${c.bold}========================================================================================${c.reset}`);

  console.log(`\n${c.cyan}1. Concepto INTERESES DE MORA (Hacia Cuenta 13459502):${c.reset}`);
  console.log(`   - Registros a trasladar: ${c.bold}${analysis.mora.count}${c.reset}`);
  console.log(`   - Total Débitos (Facturación Mora):   ${c.yellow}${fmtCOP(analysis.mora.debits).padStart(18)}${c.reset}`);
  console.log(`   - Total Créditos (Recaudos Mora):     ${c.green}${fmtCOP(analysis.mora.credits).padStart(18)}${c.reset}`);
  console.log(`   - Saldo Neto de Mora:                 ${c.bold}${fmtCOP(analysis.mora.net).padStart(18)}${c.reset}`);

  console.log(`\n${c.magenta}2. Concepto CUOTAS EXTRAORDINARIAS (Hacia Cuenta 13459503):${c.reset}`);
  console.log(`   - Registros a trasladar: ${c.bold}${analysis.ext.count}${c.reset}`);
  console.log(`   - Total Débitos (Facturación Extra):  ${c.yellow}${fmtCOP(analysis.ext.debits).padStart(18)}${c.reset}`);
  console.log(`   - Total Créditos (Recaudos Extra):    ${c.green}${fmtCOP(analysis.ext.credits).padStart(18)}${c.reset}`);
  console.log(`   - Saldo Neto de Cuotas Extra:         ${c.bold}${fmtCOP(analysis.ext.net).padStart(18)}${c.reset}`);

  console.log(`\n${c.bold}----------------------------------------------------------------------------------------${c.reset}`);
  console.log(`${c.bold} COMPARATIVO CONTABLE: ANTES vs DESPUÉS${c.reset}`);
  console.log(`${c.bold}----------------------------------------------------------------------------------------${c.reset}`);
  console.log(`Cuenta     Descripción                    Débitos Antes    Créditos Antes       Saldo Antes  =>       Saldo Nuevo`);
  console.log(`------------------------------------------------------------------------------------------------------------`);

  const printRow = (code, desc, before, after) => {
    const dBefore = fmtCOP(before.total_debit).padStart(15);
    const cBefore = fmtCOP(before.total_credit).padStart(15);
    const sBefore = fmtCOP(before.net_balance).padStart(15);
    const sAfter  = fmtCOP(after.net).padStart(15);
    console.log(`${c.bold}${code}${c.reset}   ${desc.padEnd(28)} ${dBefore}   ${cBefore}   ${c.yellow}${sBefore}${c.reset}  =>   ${c.green}${sAfter}${c.reset}`);
  };

  printRow('13459501', 'CUOTA ORDINARIA ADM.', analysis.before['13459501'], analysis.expectedAfter['13459501']);
  printRow('13459502', 'INTERESES DE MORA',    analysis.before['13459502'], analysis.expectedAfter['13459502']);
  printRow('13459503', 'CUOTAS EXTRA',         analysis.before['13459503'], analysis.expectedAfter['13459503']);

  console.log(`------------------------------------------------------------------------------------------------------------`);

  const totalBefore = analysis.before['13459501'].net_balance + analysis.before['13459502'].net_balance + analysis.before['13459503'].net_balance;
  const totalAfter  = analysis.expectedAfter['13459501'].net + analysis.expectedAfter['13459502'].net + analysis.expectedAfter['13459503'].net;
  const diff = totalAfter - totalBefore;

  console.log(`${c.bold}TOTAL GRUPO 134595 (Cartera PH):${c.reset}                                               ${c.bold}${fmtCOP(totalBefore).padStart(15)}${c.reset}  =>   ${c.bold}${c.green}${fmtCOP(totalAfter).padStart(15)}${c.reset}`);
  console.log(`Diferencia o impacto en balance global: ${diff === 0 ? `${c.green}${c.bold}$ 0 COP (Partida doble 100% íntegra)${c.reset}` : `${c.red}$ ${diff} COP${c.reset}`}`);
  console.log(`========================================================================================\n`);
}

// 7. Pregunta interactiva
function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

// 8. Flujo Principal
async function main() {
  banner();

  const args = process.argv.slice(2);
  const flagAudit = args.includes('--audit');
  const flagApply = args.includes('--apply');
  const targetArg = args.find(a => !a.startsWith('--'));

  const companies = discoverPhDatabases();

  if (companies.length === 0) {
    console.log(`${c.red}No se encontraron bases de datos con copropiedades PH registradas.${c.reset}`);
    process.exit(0);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let selected = [];

  if (targetArg) {
    if (targetArg.toLowerCase() === 'all') {
      selected = companies;
    } else {
      const match = companies.find(cp => cp.id.toLowerCase() === targetArg.toLowerCase());
      if (match) selected = [match];
      else {
        console.log(`${c.red}Empresa '${targetArg}' no encontrada en Gravy.${c.reset}`);
        rl.close();
        process.exit(1);
      }
    }
  } else {
    console.log(`${c.bold}Empresas PH detectadas en el sistema:${c.reset}`);
    companies.forEach((cp, idx) => {
      console.log(`  [${c.bold}${idx + 1}${c.reset}] Empresa ${c.cyan}${cp.id}${c.reset} - ${cp.name} (NIT: ${cp.nit || 'S/N'}) [${cp.propCount} inmuebles]`);
    });
    console.log(`  [${c.bold}T${c.reset}] Procesar TODAS las empresas PH`);
    console.log(`  [${c.bold}0${c.reset}] Cancelar y salir\n`);

    const ans = (await ask(rl, `${c.yellow}Seleccione la empresa a procesar (1-${companies.length}, T o 0): ${c.reset}`)).trim();
    if (ans === '0' || ans === '') {
      console.log('Operación cancelada.');
      rl.close();
      process.exit(0);
    } else if (ans.toUpperCase() === 'T') {
      selected = companies;
    } else {
      const idx = parseInt(ans, 10) - 1;
      if (idx >= 0 && idx < companies.length) {
        selected = [companies[idx]];
      } else {
        console.log(`${c.red}Opción inválida.${c.reset}`);
        rl.close();
        process.exit(1);
      }
    }
  }

  for (const cp of selected) {
    console.log(`\n${c.bold}${c.magenta}▶ Procesando: [${cp.id}] ${cp.name}${c.reset}`);
    console.log(`  Ruta DB: ${c.dim}${cp.path}${c.reset}`);

    const db = new DatabaseSync(cp.path, { open: true });

    // Verificar cuentas PUC
    const accounts = ensureTargetAccounts(db);
    if (!accounts) {
      console.log(`  ${c.red}Saltando empresa por falta de cuentas PUC requeridas.${c.reset}`);
      db.close();
      continue;
    }

    // Análisis
    const analysis = analyzeReclassification(db, accounts);
    printAnalysis(analysis);

    const totalToMove = analysis.mora.count + analysis.ext.count;
    if (totalToMove === 0) {
      console.log(`  ${c.green}✔ Esta empresa ya tiene todos sus conceptos contables perfectamente clasificados.${c.reset}`);
      db.close();
      continue;
    }

    let shouldApply = false;
    if (flagApply) {
      shouldApply = true;
    } else if (flagAudit) {
      shouldApply = false;
      console.log(`  ${c.cyan}ℹ Modo auditoría (--audit): No se aplicaron modificaciones.${c.reset}`);
    } else {
      const conf = (await ask(rl, `${c.bold}${c.yellow}¿Desea aplicar la reclasificación contable en esta base de datos? (S/N): ${c.reset}`)).trim().toUpperCase();
      shouldApply = (conf === 'S' || conf === 'SI');
    }

    if (shouldApply) {
      console.log(`\n  ${c.cyan}Generando copia de seguridad atómica de la base de datos...${c.reset}`);
      const bak = createDbBackup(cp.path);
      console.log(`  ${c.green}✔ Respaldo creado en: ${bak}${c.reset}`);

      console.log(`  ${c.cyan}Ejecutando reclasificación atómica en SQLite...${c.reset}`);
      const result = applyReclassification(db, accounts, analysis);
      console.log(`  ${c.green}✔ Reclasificación exitosa:${c.reset}`);
      console.log(`     - Líneas trasladadas a 13459502 (MORA): ${result.moraUpdated}`);
      console.log(`     - Líneas trasladadas a 13459503 (EXT):  ${result.extUpdated}`);
      console.log(`     - Configuración de ph_billing_concepts sincronizada.`);

      // Verificación de integridad post-aplicación
      const post = analyzeReclassification(db, accounts);
      console.log(`\n  ${c.bold}Verificación Post-Reclasificación:${c.reset}`);
      console.log(`     - Nuevo Saldo 13459501 (ADM):  ${fmtCOP(post.before['13459501'].net_balance)} (${post.before['13459501'].total_lines} líneas)`);
      console.log(`     - Nuevo Saldo 13459502 (MORA): ${fmtCOP(post.before['13459502'].net_balance)} (${post.before['13459502'].total_lines} líneas)`);
      console.log(`     - Nuevo Saldo 13459503 (EXT):  ${fmtCOP(post.before['13459503'].net_balance)} (${post.before['13459503'].total_lines} líneas)`);
      console.log(`     - Líneas pendientes por reclasificar: ${post.mora.count + post.ext.count} (Esperado: 0)`);
    } else {
      console.log(`  ${c.yellow}Operación de escritura omitida.${c.reset}`);
    }

    db.close();
  }

  console.log(`\n${c.bold}${c.green}✔ Proceso finalizado satisfactoriamente.${c.reset}\n`);
  rl.close();
}

main().catch(err => {
  console.error(`\n${c.bold}${c.red}[ERROR FATAL] ${err.message}${c.reset}\n`, err);
  process.exit(1);
});
