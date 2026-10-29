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

async function sanitizeDb(dbPath) {
  if (!fs.existsSync(dbPath)) return;
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath);
    console.log(`\n========================================`);
    console.log(`Procesando base de datos: ${dbPath}`);
    
    // Contar antes
    const countSql = `
      SELECT COUNT(*) as count 
      FROM tx_lines l 
      JOIN accounts a ON a.id = l.account_id 
      WHERE (l.cross_doc_ref IS NOT NULL AND l.cross_doc_ref != '') 
        AND (a.maneja_cruce = 0 OR a.maneja_cruce IS NULL)
    `;
    
    db.get(countSql, (err, row) => {
      if (err) {
        console.error(`Error consultando ${dbPath}:`, err.message);
        db.close();
        return resolve();
      }
      
      const beforeCount = row ? row.count : 0;
      console.log(`Líneas con cruce indebido antes del saneamiento: ${beforeCount}`);
      
      if (beforeCount === 0) {
        console.log(`No requiere corrección.`);
        db.close();
        return resolve();
      }

      // Actualizar
      const updateSql = `
        UPDATE tx_lines 
        SET cross_doc_ref = '', cross_doc_date = '', due_date = ''
        WHERE id IN (
          SELECT l.id 
          FROM tx_lines l 
          JOIN accounts a ON a.id = l.account_id 
          WHERE (l.cross_doc_ref IS NOT NULL AND l.cross_doc_ref != '') 
            AND (a.maneja_cruce = 0 OR a.maneja_cruce IS NULL)
        )
      `;

      db.run(updateSql, function(updateErr) {
        if (updateErr) {
          console.error(`Error actualizando ${dbPath}:`, updateErr.message);
        } else {
          console.log(`Filas saneadas exitosamente: ${this.changes}`);
        }

        // Verificar después
        db.get(countSql, (vErr, vRow) => {
          console.log(`Líneas con cruce indebido después del saneamiento: ${vRow ? vRow.count : 0}`);
          db.close();
          resolve();
        });
      });
    });
  });
}

async function runAll() {
  for (const d of dbs) {
    await sanitizeDb(d);
  }
  console.log('\nSaneamiento completado en todas las bases de datos.');
}

runAll();
