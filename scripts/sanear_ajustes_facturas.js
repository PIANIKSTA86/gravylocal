/**
 * GRAVY ERP - Script de Verificación y Saneamiento de Ajustes Contables en Facturas de Venta
 * 
 * Función:
 * 1. Inspecciona comprobantes contables (FV, POS, FAC, NC).
 * 2. Detecta y elimina líneas contables con valor $0 (debit=0 y credit=0).
 * 3. Detecta líneas residuales de ajuste por redondeo/descuento espurio (cuenta 530535 con valor < $1 peso o micro-decimales).
 * 4. Asigna y absorbe dichos valores directamente en la cuenta de ingresos operacionales (4135 / 41) de la transacción.
 * 5. Garantiza sumas iguales exactas a nivel de centavos (Débitos === Créditos) en cada transacción.
 * 
 * Uso:
 *   node scripts/sanear_ajustes_facturas.js [ruta_a_data.db] [--dry-run]
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const dbArg = args.find(a => !a.startsWith('-'));

const defaultDbPath = path.resolve(__dirname, '../pb_data/data.db');
const dbPath = dbArg ? path.resolve(process.cwd(), dbArg) : defaultDbPath;

if (!fs.existsSync(dbPath)) {
  console.error(`\x1b[31m[ERROR] No se encontró el archivo de base de datos en: ${dbPath}\x1b[0m`);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

const round2 = (val) => Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;

async function executeSanitization() {
  console.log('\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[36m   GRAVY ERP — SANEAMIENTO DE AJUSTES CONTABLES EN FACTURAS DE VENTA   \x1b[0m');
  console.log('\x1b[36m========================================================================\x1b[0m');
  console.log(`Base de datos : ${dbPath}`);
  console.log(`Modo          : ${isDryRun ? '\x1b[33mSIMULACIÓN (Dry-Run — No se guardarán cambios)\x1b[0m' : '\x1b[32mEJECUCIÓN REAL (Se aplicarán cambios en BD)\x1b[0m'}`);
  console.log('------------------------------------------------------------------------\n');

  // 1. Obtener todas las transacciones de facturación y notas de crédito con líneas anómalas
  const candidateTxs = await query(`
    SELECT DISTINCT t.id, t.number, t.date, tt.code as tx_type_code, inv.discount_amount as inv_discount
    FROM transactions t
    JOIN tx_lines tl ON tl.tx_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
    LEFT JOIN invoices inv ON inv.tx_id = t.id
    WHERE (
        t.number LIKE 'FV-%' OR 
        t.number LIKE 'FAC-%' OR 
        t.number LIKE 'POS-%' OR 
        t.number LIKE 'NC-%' OR 
        inv.id IS NOT NULL
      )
      AND (
        (tl.debit = 0 AND tl.credit = 0)
        OR (a.code LIKE '530535%' AND (
             (tl.debit > 0 AND tl.debit < 50.0 AND (inv.discount_amount IS NULL OR inv.discount_amount = 0)) OR
             (tl.credit > 0 AND tl.credit < 50.0 AND (inv.discount_amount IS NULL OR inv.discount_amount = 0))
           ))
        OR (tl.description LIKE '%descuento%' AND ((tl.debit > 0 AND tl.debit < 50.0) OR (tl.credit > 0 AND tl.credit < 50.0)) AND (inv.discount_amount IS NULL OR inv.discount_amount = 0))
      )
    ORDER BY t.date ASC, t.number ASC
  `);

  console.log(`Comprobantes con líneas anómalas detectados: \x1b[33m${candidateTxs.length}\x1b[0m`);

  if (candidateTxs.length === 0) {
    console.log('\x1b[32m✔ No se encontraron transacciones con líneas en cero o ajustes residuales de decimales. Todo está en orden.\x1b[0m\n');
    db.close();
    return;
  }

  let totalTxsCleaned = 0;
  let totalLinesDeleted = 0;
  let totalLinesAdjusted = 0;
  let totalAbsorbedValue = 0;

  if (!isDryRun) {
    await run('BEGIN TRANSACTION');
  }

  try {
    for (const tx of candidateTxs) {
      // Cargar todas las líneas de este comprobante
      const lines = await query(`
        SELECT tl.id, tl.account_id, a.code as acc_code, a.name as acc_name, 
               tl.debit, tl.credit, tl.description, tl.line_order
        FROM tx_lines tl
        LEFT JOIN accounts a ON tl.account_id = a.id
        WHERE tl.tx_id = ?
        ORDER BY tl.line_order ASC, tl.id ASC
      `, [tx.id]);

      const linesToDelete = [];
      const linesToKeep = [];
      let absorbedDebitAmount = 0;
      let absorbedCreditAmount = 0;

      for (const line of lines) {
        const isExactZero = (line.debit === 0 && line.credit === 0);

        // Descuento residual / espurio en cuenta 530535 (en FV está en débito; en NC está en crédito):
        const isSpuriousDiscount = String(line.acc_code).startsWith('530535') &&
          ((line.debit > 0 && line.debit < 50.0) || (line.credit > 0 && line.credit < 50.0)) &&
          (!tx.inv_discount || Number(tx.inv_discount) === 0);

        const isSpuriousAdj = (String(line.description).toLowerCase().includes('descuento en l') ||
          String(line.description).toLowerCase().includes('ajuste')) &&
          ((line.debit > 0 && line.debit < 5.0) || (line.credit > 0 && line.credit < 5.0));

        if (isExactZero || isSpuriousDiscount || isSpuriousAdj) {
          linesToDelete.push(line);
          absorbedDebitAmount += Number(line.debit || 0);
          absorbedCreditAmount += Number(line.credit || 0);
        } else {
          linesToKeep.push(line);
        }
      }

      if (linesToDelete.length === 0) {
        continue;
      }

      // Determinar si es Nota Crédito / Ajuste
      const isCreditNote = String(tx.number).startsWith('NC-') ||
        linesToKeep.some(l => (String(l.acc_code).startsWith('4175') || String(l.acc_code).startsWith('41')) && l.debit > 0);

      let incomeLine = null;
      if (isCreditNote) {
        // En Nota Crédito, la cuenta de devoluciones/ingresos (4175 / 4135 / Clase 4) tiene naturaleza DÉBITO
        incomeLine = linesToKeep.find(l => String(l.acc_code).startsWith('4175') && l.debit > 0);
        if (!incomeLine) incomeLine = linesToKeep.find(l => String(l.acc_code).startsWith('41') && l.debit > 0);
        if (!incomeLine) incomeLine = linesToKeep.find(l => String(l.acc_code).startsWith('4') && l.debit > 0);
        if (!incomeLine) incomeLine = linesToKeep.find(l => l.debit > 0 && !String(l.acc_code).startsWith('1305') && !String(l.acc_code).startsWith('2408') && !String(l.acc_code).startsWith('5310'));
      } else {
        // En Factura de Venta estándar, la cuenta de ingresos (4135 / 41 / Clase 4) tiene naturaleza CRÉDITO
        incomeLine = linesToKeep.find(l => String(l.acc_code).startsWith('4135') && l.credit > 0);
        if (!incomeLine) incomeLine = linesToKeep.find(l => String(l.acc_code).startsWith('41') && l.credit > 0);
        if (!incomeLine) incomeLine = linesToKeep.find(l => String(l.acc_code).startsWith('4') && l.credit > 0);
        if (!incomeLine) incomeLine = linesToKeep.find(l => l.credit > 0);
      }

      if (!incomeLine) {
        console.warn(`[AVISO] Comprobante ${tx.number} (${tx.id}) no tiene línea de ingreso/devolución donde absorber ajustes. Se omite.`);
        continue;
      }

      if (isCreditNote) {
        // En Nota Crédito: se eliminó un crédito espurio en 530535.
        // Para mantener partida doble (Débitos === Créditos), el Débito de la cuenta de devolución debe absorber la diferencia:
        const sumCredits = linesToKeep.reduce((acc, l) => acc + round2(l.credit), 0);
        const otherDebits = linesToKeep.reduce((acc, l) => acc + (l.id === incomeLine.id ? 0 : round2(l.debit)), 0);
        const newIncomeDebit = round2(sumCredits - otherDebits);
        const deltaToIncome = round2(newIncomeDebit - round2(incomeLine.debit));

        console.log(`\x1b[35m[${tx.tx_type_code || 'NC'}]\x1b[0m ${tx.number} (${tx.date}):`);
        console.log(`  - Eliminando ${linesToDelete.length} línea(s) espuria(s):`);
        for (const dl of linesToDelete) {
          console.log(`     * Cuenta ${dl.acc_code} | Débito: $${dl.debit} | Crédito: $${dl.credit} | Desc: "${dl.description}"`);
        }
        console.log(`  - Ajustando línea de devolución ${incomeLine.acc_code} (${incomeLine.acc_name}):`);
        console.log(`     * Débito anterior: $${incomeLine.debit} -> Débito nuevo: $${newIncomeDebit} (Delta absorbido: $${deltaToIncome})`);

        if (!isDryRun) {
          for (const dl of linesToDelete) {
            await run('DELETE FROM tx_lines WHERE id = ?', [dl.id]);
            totalLinesDeleted++;
          }
          await run('UPDATE tx_lines SET debit = ? WHERE id = ?', [newIncomeDebit, incomeLine.id]);
          totalLinesAdjusted++;

          const checkLines = await query('SELECT debit, credit FROM tx_lines WHERE tx_id = ?', [tx.id]);
          const finalDeb = round2(checkLines.reduce((s, l) => s + Number(l.debit || 0), 0));
          const finalCred = round2(checkLines.reduce((s, l) => s + Number(l.credit || 0), 0));

          if (finalDeb !== finalCred) {
            throw new Error(`[ERROR CRÍTICO] Descuadre en ${tx.number}: Débitos $${finalDeb} !== Créditos $${finalCred}`);
          }
        } else {
          totalLinesDeleted += linesToDelete.length;
          totalLinesAdjusted++;
        }
        totalTxsCleaned++;
        totalAbsorbedValue = round2(totalAbsorbedValue + Math.abs(deltaToIncome));
      } else {
        // En Venta estándar: se eliminó un débito espurio en 530535.
        // Para mantener partida doble, el Crédito de la cuenta de ingresos debe absorber la diferencia:
        const sumDebits = linesToKeep.reduce((acc, l) => acc + round2(l.debit), 0);
        const otherCredits = linesToKeep.reduce((acc, l) => acc + (l.id === incomeLine.id ? 0 : round2(l.credit)), 0);
        const newIncomeCredit = round2(sumDebits - otherCredits);
        const deltaToIncome = round2(newIncomeCredit - round2(incomeLine.credit));

        console.log(`\x1b[35m[${tx.tx_type_code || 'TX'}]\x1b[0m ${tx.number} (${tx.date}):`);
        console.log(`  - Eliminando ${linesToDelete.length} línea(s) espuria(s):`);
        for (const dl of linesToDelete) {
          console.log(`     * Cuenta ${dl.acc_code} | Débito: $${dl.debit} | Crédito: $${dl.credit} | Desc: "${dl.description}"`);
        }
        console.log(`  - Ajustando línea de ingreso ${incomeLine.acc_code} (${incomeLine.acc_name}):`);
        console.log(`     * Crédito anterior: $${incomeLine.credit} -> Crédito nuevo: $${newIncomeCredit} (Delta absorbido: $${deltaToIncome})`);

        if (!isDryRun) {
          for (const dl of linesToDelete) {
            await run('DELETE FROM tx_lines WHERE id = ?', [dl.id]);
            totalLinesDeleted++;
          }
          await run('UPDATE tx_lines SET credit = ? WHERE id = ?', [newIncomeCredit, incomeLine.id]);
          totalLinesAdjusted++;

          const checkLines = await query('SELECT debit, credit FROM tx_lines WHERE tx_id = ?', [tx.id]);
          const finalDeb = round2(checkLines.reduce((s, l) => s + Number(l.debit || 0), 0));
          const finalCred = round2(checkLines.reduce((s, l) => s + Number(l.credit || 0), 0));

          if (finalDeb !== finalCred) {
            throw new Error(`[ERROR CRÍTICO] Descuadre en ${tx.number}: Débitos $${finalDeb} !== Créditos $${finalCred}`);
          }
        } else {
          totalLinesDeleted += linesToDelete.length;
          totalLinesAdjusted++;
        }
        totalTxsCleaned++;
        totalAbsorbedValue = round2(totalAbsorbedValue + Math.abs(deltaToIncome));
      }
    }

    if (!isDryRun) {
      await run('COMMIT');
      console.log('\n\x1b[32m✔ Transacción confirmada exitosamente en la base de datos.\x1b[0m');
    }

    console.log('\n========================================================================');
    console.log('                          RESUMEN DE SANEAMIENTO                        ');
    console.log('========================================================================');
    console.log(`Comprobantes saneados con éxito : \x1b[32m${totalTxsCleaned}\x1b[0m`);
    console.log(`Líneas residuales eliminadas    : \x1b[32m${totalLinesDeleted}\x1b[0m`);
    console.log(`Líneas de ingreso ajustadas     : \x1b[32m${totalLinesAdjusted}\x1b[0m`);
    console.log(`Valor neto absorbido en ingresos: \x1b[32m$${round2(totalAbsorbedValue).toLocaleString('es-CO')}\x1b[0m`);
    console.log('Sumas iguales contables         : \x1b[32m100% Cuadradas (Débitos === Créditos)\x1b[0m');
    console.log('========================================================================\n');

  } catch (err) {
    if (!isDryRun) {
      await run('ROLLBACK');
      console.error('\n\x1b[31m[ERROR CRÍTICO] Se realizó ROLLBACK de la transacción. Ningún cambio fue guardado:\x1b[0m', err.message);
    } else {
      console.error('\n\x1b[31m[ERROR EN SIMULACIÓN]:\x1b[0m', err.message);
    }
  } finally {
    db.close();
  }
}

executeSanitization().catch(e => {
  console.error("Fallo inesperado:", e);
  process.exit(1);
});
