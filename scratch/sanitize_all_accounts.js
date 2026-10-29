const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
  'empresas/pb_data/data.db'
];

async function sanitizeAccountsInDb(dbPath) {
  if (!fs.existsSync(dbPath)) return;
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath);
    console.log(`\n==================================================`);
    console.log(`SANEAMIENTO INTEGRAL DE CUENTAS EN: ${dbPath}`);

    db.serialize(() => {
      // 1. Corregir jerarquía de niveles contables (PUC Colombia)
      // 1 dígito -> level 1 (Clase)
      // 2 dígitos -> level 2 (Grupo)
      // 4 dígitos -> level 3 (Cuenta)
      // 6 dígitos -> level 4 (Subcuenta)
      // >= 8 dígitos -> level 5 (Auxiliar)
      db.run("UPDATE accounts SET level = 1 WHERE LENGTH(code) = 1 AND level != 1", function() {
        if (this.changes > 0) console.log(`- Cuentas corregidas a Nivel 1 (Clase): ${this.changes}`);
      });

      db.run("UPDATE accounts SET level = 2 WHERE LENGTH(code) = 2 AND level != 2", function() {
        if (this.changes > 0) console.log(`- Cuentas corregidas a Nivel 2 (Grupo): ${this.changes}`);
      });

      db.run("UPDATE accounts SET level = 3 WHERE LENGTH(code) = 4 AND level != 3", function() {
        if (this.changes > 0) console.log(`- Cuentas corregidas a Nivel 3 (Cuenta): ${this.changes}`);
      });

      db.run("UPDATE accounts SET level = 4 WHERE LENGTH(code) = 6 AND level != 4", function() {
        if (this.changes > 0) console.log(`- Cuentas corregidas a Nivel 4 (Subcuenta): ${this.changes}`);
      });

      db.run("UPDATE accounts SET level = 5 WHERE LENGTH(code) >= 8 AND level < 5", function() {
        if (this.changes > 0) console.log(`- Cuentas auxiliares corregidas a Nivel 5 (>=8 dígitos): ${this.changes}`);
      });

      // 2. Saneamiento de la propiedad maneja_cruce en cuentas que NO son de balance/cartera
      // Caja (1105) y Bancos (1110, 1120), Inventarios (14), Activos fijos (15), Ingresos (4), Gastos (5), Costos (6, 7), Patrimonio (3)
      db.run(`
        UPDATE accounts 
        SET maneja_cruce = 0 
        WHERE (code LIKE '11%' OR code LIKE '12%' OR code LIKE '14%' OR code LIKE '15%' OR code LIKE '16%' 
            OR code LIKE '17%' OR code LIKE '18%' OR code LIKE '19%' OR code LIKE '3%' OR code LIKE '4%' 
            OR code LIKE '5%' OR code LIKE '6%' OR code LIKE '7%' OR code LIKE '8%' OR code LIKE '9%')
          AND maneja_cruce = 1
      `, function() {
        if (this.changes > 0) console.log(`- Cuentas indebidas de balance/resultado con maneja_cruce corregidas a 0: ${this.changes}`);
      });

      // 3. Saneamiento de cuentas de proveedores y anticipos que SÍ manejan cruce
      db.run("UPDATE accounts SET maneja_cruce = 1 WHERE code = '22050501'", function() {
        if (this.changes > 0) console.log(`- Cuenta 22050501 confirmada con maneja_cruce = 1`);
      });
      db.run("UPDATE accounts SET maneja_cruce = 1 WHERE code = '13050501'", function() {
        if (this.changes > 0) console.log(`- Cuenta 13050501 confirmada con maneja_cruce = 1`);
      });
      db.run("UPDATE accounts SET maneja_cruce = 1 WHERE code = '13300503'", function() {
        if (this.changes > 0) console.log(`- Cuenta 13300503 (Anticipos Nacionales) configurada con maneja_cruce = 1`);
      });

      // 4. Limpieza estricta de tx_lines para cualquier cuenta donde maneja_cruce = 0
      db.run(`
        UPDATE tx_lines 
        SET cross_doc_ref = '', cross_doc_date = '', due_date = ''
        WHERE id IN (
          SELECT l.id 
          FROM tx_lines l 
          JOIN accounts a ON a.id = l.account_id 
          WHERE (l.cross_doc_ref IS NOT NULL AND l.cross_doc_ref != '') 
            AND (a.maneja_cruce = 0 OR a.maneja_cruce IS NULL)
        )
      `, function() {
        if (this.changes > 0) console.log(`- Líneas contables históricas en tx_lines saneadas (cruce en cuenta sin cruce): ${this.changes}`);
      });

      // 5. Sanear configuraciones en la tabla settings (asegurar cuentas a nivel 5 auxiliar)
      db.all("SELECT id, key, value FROM settings WHERE key IN ('doc_soporte_config_v1', 'purchase_config_v1')", (sErr, sRows) => {
        if (!sErr && sRows && sRows.length) {
          sRows.forEach(sr => {
            try {
              let parsed = JSON.parse(sr.value);
              let changed = false;

              // En doc_soporte_config_v1
              if (sr.key === 'doc_soporte_config_v1') {
                if (parsed.accounting?.accounts?.expense_fallback_code === '5135') {
                  parsed.accounting.accounts.expense_fallback_code = '51350501';
                  changed = true;
                }
                if (parsed.accounting?.accounts?.payable_code === '220505') {
                  parsed.accounting.accounts.payable_code = '22050501';
                  changed = true;
                }
                if (parsed.accounting?.accounts?.cash_account_code === '110505') {
                  parsed.accounting.accounts.cash_account_code = '11050501';
                  changed = true;
                }
                if (parsed.accounting?.accounts?.bank_account_code === '111005') {
                  parsed.accounting.accounts.bank_account_code = '11100501';
                  changed = true;
                }
              }

              // En purchase_config_v1
              if (sr.key === 'purchase_config_v1') {
                if (parsed.accounting?.accounts?.expense_fallback_code === '5135') {
                  parsed.accounting.accounts.expense_fallback_code = '51350501';
                  changed = true;
                }
                if (parsed.accounting?.withholding_rules) {
                  parsed.accounting.withholding_rules.forEach(r => {
                    if (r.account_code === '2368') {
                      r.account_code = '23680101';
                      changed = true;
                    }
                  });
                }
              }

              if (changed) {
                db.run("UPDATE settings SET value = ? WHERE id = ?", [JSON.stringify(parsed), sr.id], () => {
                  console.log(`- Configuración ${sr.key} saneada con cuentas auxiliares Nivel 5.`);
                });
              }
            } catch (_) {}
          });
        }

        db.close(() => resolve());
      });
    });
  });
}

async function run() {
  for (const d of dbs) {
    await sanitizeAccountsInDb(d);
  }
  console.log('\nSaneamiento integral de cuentas finalizado en todas las bases de datos.');
}

run();

