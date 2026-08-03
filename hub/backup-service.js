/**
 * GRAVY v2.0 — backup-service.js
 * Módulo centralizado para el respaldo automático y desatendido de todas las instancias de PocketBase.
 * Utiliza SQL 'VACUUM INTO' para hot-backups consistentes y empaqueta base de datos + archivos en un zip.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const AdmZip = require('adm-zip');

// Rutas de directorios principales
const BASE_DIR = path.resolve(__dirname, '..');
const BACKUPS_DEST = path.join(BASE_DIR, 'respaldos');
const EMPRESAS_DIR = path.join(BASE_DIR, 'empresas');
const DEFAULT_RETENTION_DAYS = 7;

// Asegurar que exista la carpeta de destino de respaldos
if (!fs.existsSync(BACKUPS_DEST)) {
  fs.mkdirSync(BACKUPS_DEST, { recursive: true });
}

let schedulerTimeout = null;

/**
 * Realiza un hot backup de SQLite de forma segura y consistente sin bloquear lecturas/escrituras.
 * @param {string} sourceDbPath Ruta de la base de datos de origen
 * @param {string} destDbPath Ruta de la base de datos temporal de destino (no debe existir previamente)
 * @returns {Promise<boolean>} Retorna true si se respaldó correctamente
 */
function backupDatabase(sourceDbPath, destDbPath) {
  return new Promise((resolve, reject) => {
    // Si la base de datos de origen no existe, simplemente retornar false
    if (!fs.existsSync(sourceDbPath)) {
      return resolve(false);
    }

    // SQLite exige que el archivo destino de VACUUM INTO no exista previamente
    if (fs.existsSync(destDbPath)) {
      try {
        fs.unlinkSync(destDbPath);
      } catch (err) {
        return reject(new Error(`No se pudo limpiar el archivo temporal existente: ${err.message}`));
      }
    }

    // Abrir la base de datos en modo READONLY para evitar interferencias
    const db = new sqlite3.Database(sourceDbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });

    // Formatear la ruta de destino usando barras diagonales (/) para SQLite en Windows
    const safeDestPath = destDbPath.replace(/\\/g, '/');
    const sql = `VACUUM INTO '${safeDestPath.replace(/'/g, "''")}'`;

    db.run(sql, function(err) {
      db.close();
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
}

/**
 * Respalda y empaqueta una instancia de PocketBase (Base de datos SQLite + carpeta storage)
 * @param {string} instanceName Nombre descriptivo de la instancia
 * @param {string} pbDataPath Ruta de la carpeta pb_data de la instancia
 * @returns {Promise<string|null>} Retorna la ruta del archivo zip generado o null si falla
 */
async function backupInstance(instanceName, pbDataPath) {
  if (!fs.existsSync(pbDataPath)) {
    console.warn(`[BACKUP WARNING] No se encontró el directorio de datos para ${instanceName}: ${pbDataPath}`);
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const zipFilename = `backup_${instanceName}_${timestamp}.zip`;
  const zipPath = path.join(BACKUPS_DEST, zipFilename);
  
  // Archivos temporales para los hot-backups de bases de datos
  const dbFilesToBackup = ['data.db', 'auxiliary.db', 'logs.db'];
  const tempFiles = [];
  const zip = new AdmZip();

  try {
    let hasDbData = false;

    // 1. Respaldar bases de datos consistentemente usando VACUUM INTO
    for (const dbName of dbFilesToBackup) {
      const sourceDb = path.join(pbDataPath, dbName);
      if (fs.existsSync(sourceDb)) {
        const tempDest = path.join(BACKUPS_DEST, `temp_${instanceName}_${dbName}`);
        const success = await backupDatabase(sourceDb, tempDest);
        if (success && fs.existsSync(tempDest)) {
          zip.addLocalFile(tempDest, '', dbName);
          tempFiles.push(tempDest);
          hasDbData = true;
        }
      }
    }

    if (!hasDbData) {
      console.warn(`[BACKUP WARNING] No se encontraron bases de datos válidas para respaldar en ${instanceName}`);
      return null;
    }

    // 2. Empaquetar la carpeta de almacenamiento físico (uploads)
    const storageDir = path.join(pbDataPath, 'storage');
    if (fs.existsSync(storageDir)) {
      try {
        const files = fs.readdirSync(storageDir);
        if (files.length > 0) {
          zip.addLocalFolder(storageDir, 'storage');
        }
      } catch (storageErr) {
        console.warn(`[BACKUP WARNING] No se pudo leer la carpeta storage de ${instanceName}: ${storageErr.message}`);
      }
    }

    // 3. Escribir el archivo zip final
    zip.writeZip(zipPath);
    console.log(`[BACKUP SUCCESS] Respaldo creado con éxito para ${instanceName}: ${zipFilename}`);
    return zipFilename;
  } catch (err) {
    console.error(`[BACKUP ERROR] Error al realizar el respaldo para la instancia ${instanceName}:`, err);
    throw err;
  } finally {
    // Limpieza de todos los archivos de bases de datos temporales
    for (const tempFile of tempFiles) {
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (delErr) {
          console.warn(`[BACKUP WARNING] No se pudo eliminar el archivo temporal ${tempFile}: ${delErr.message}`);
        }
      }
    }
  }
}

/**
 * Escanea el sistema y ejecuta respaldos para todas las instancias detectadas
 * @returns {Promise<Array<object>>} Resultados de las operaciones de respaldo
 */
async function runAllBackups() {
  const results = [];
  console.log('[BACKUP] Iniciando proceso de respaldos desatendidos...');

  // 1. Respaldar GRAVY HUB
  try {
    const hubPbData = path.join(BASE_DIR, 'hub', 'pb_data');
    const zipName = await backupInstance('hub', hubPbData);
    if (zipName) results.push({ instance: 'hub', success: true, file: zipName });
  } catch (err) {
    results.push({ instance: 'hub', success: false, error: err.message });
  }

  // 2. Respaldar Empresa Demo (principal pb_data)
  try {
    const demoPbData = path.join(BASE_DIR, 'pb_data');
    const zipName = await backupInstance('demo', demoPbData);
    if (zipName) results.push({ instance: 'demo', success: true, file: zipName });
  } catch (err) {
    results.push({ instance: 'demo', success: false, error: err.message });
  }

  // 3. Descubrir y respaldar empresas (inquilinos) dinámicos de forma automática
  if (fs.existsSync(EMPRESAS_DIR)) {
    try {
      const items = fs.readdirSync(EMPRESAS_DIR);
      for (const item of items) {
        const itemPath = path.join(EMPRESAS_DIR, item);
        // Validar que sea un directorio y tenga el patrón empresa_XXXX
        if (fs.statSync(itemPath).isDirectory() && /^empresa_\d+$/.test(item)) {
          const tenantPbData = path.join(itemPath, 'pb_data');
          try {
            const zipName = await backupInstance(item, tenantPbData);
            if (zipName) results.push({ instance: item, success: true, file: zipName });
          } catch (tenantErr) {
            results.push({ instance: item, success: false, error: tenantErr.message });
          }
        }
      }
    } catch (scanErr) {
      console.error('[BACKUP ERROR] Error al escanear el directorio de empresas:', scanErr);
      results.push({ instance: 'system_discovery', success: false, error: scanErr.message });
    }
  }

  // 4. Aplicar política de retención automática
  try {
    const deletedCount = applyRetentionPolicy();
    console.log(`[BACKUP RETENTION] Limpieza completada. Se eliminaron ${deletedCount} respaldos antiguos.`);
  } catch (retentionErr) {
    console.error('[BACKUP ERROR] Falló la política de retención de respaldos:', retentionErr);
  }

  console.log('[BACKUP] Proceso de respaldos finalizado.');
  return results;
}

/**
 * Elimina respaldos locales antiguos según los días de retención definidos
 * @param {number} retentionDays Cantidad de días a conservar (por defecto 7)
 * @returns {number} Cantidad de archivos eliminados
 */
function applyRetentionPolicy(retentionDays = DEFAULT_RETENTION_DAYS) {
  if (!fs.existsSync(BACKUPS_DEST)) return 0;

  const files = fs.readdirSync(BACKUPS_DEST);
  const now = Date.now();
  const limitMs = retentionDays * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    if (file.startsWith('backup_') && file.endsWith('.zip')) {
      const filePath = path.join(BACKUPS_DEST, file);
      try {
        const stats = fs.statSync(filePath);
        const ageMs = now - stats.mtimeMs;
        if (ageMs > limitMs) {
          fs.unlinkSync(filePath);
          console.log(`[BACKUP RETENTION] Eliminado respaldo obsoleto: ${file}`);
          deletedCount++;
        }
      } catch (err) {
        console.warn(`[BACKUP RETENTION WARNING] No se pudo procesar archivo ${file} para retención:`, err.message);
      }
    }
  }

  return deletedCount;
}

/**
 * Configura la ejecución automática periódica (diaria)
 * @param {number} targetHour Hora de ejecución (formato 0-23, por defecto 2 = 2:00 AM)
 */
function setupScheduler(targetHour = 2) {
  if (schedulerTimeout) {
    clearTimeout(schedulerTimeout);
  }

  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(targetHour, 0, 0, 0);

  // Si ya pasó la hora hoy, programar para mañana
  if (now.getTime() >= nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const delayMs = nextRun.getTime() - now.getTime();
  const delayMinutes = Math.round(delayMs / 1000 / 60);
  
  console.log(`[BACKUP SCHEDULER] Programado el próximo respaldo automático diario para: ${nextRun.toLocaleString()} (en ${delayMinutes} minutos).`);

  schedulerTimeout = setTimeout(async () => {
    try {
      await runAllBackups();
    } catch (err) {
      console.error('[BACKUP SCHEDULER ERROR] Error ejecutando el respaldo programado:', err);
    }
    // Reprogramar para el día siguiente
    setupScheduler(targetHour);
  }, delayMs);
}

/**
 * Registra los endpoints REST de administración de respaldos en Express
 * @param {object} app Instancia del servidor Express
 */
function registerRoutes(app) {
  // POST /api/orchestrate/backup -> Disparar respaldo de todos los inquilinos bajo demanda
  app.post('/api/orchestrate/backup', async (req, res) => {
    try {
      const results = await runAllBackups();
      res.json({
        success: true,
        message: 'Proceso de respaldos finalizado.',
        backups: results
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'Ocurrió un error al procesar los respaldos: ' + err.message
      });
    }
  });

  // GET /api/orchestrate/backups -> Listar todos los respaldos generados
  app.get('/api/orchestrate/backups', (req, res) => {
    try {
      if (!fs.existsSync(BACKUPS_DEST)) {
        return res.json({ success: true, backups: [] });
      }

      const files = fs.readdirSync(BACKUPS_DEST);
      const backups = files
        .filter(file => file.startsWith('backup_') && file.endsWith('.zip'))
        .map(file => {
          const filePath = path.join(BACKUPS_DEST, file);
          const stats = fs.statSync(filePath);
          
          // Nombre de la instancia y fecha a partir del nombre del archivo
          const parts = file.replace('.zip', '').split('_');
          let instanceName = 'unknown';
          
          if (parts.length >= 3) {
            instanceName = parts.slice(1, parts.length - 1).join('_');
          } else if (parts.length === 2) {
            instanceName = parts[1];
          }

          return {
            filename: file,
            instance: instanceName,
            sizeBytes: stats.size,
            sizeMb: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
            createdAt: stats.birthtime || stats.mtime,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Más reciente primero

      res.json({ success: true, backups });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /api/orchestrate/backups/:filename -> Eliminar un respaldo específico
  app.delete('/api/orchestrate/backups/:filename', (req, res) => {
    try {
      const filename = req.params.filename;

      // Sanitizar el nombre del archivo para prevenir ataques de Path Traversal
      if (
        filename.includes('/') || 
        filename.includes('\\') || 
        !filename.startsWith('backup_') || 
        !filename.endsWith('.zip')
      ) {
        return res.status(400).json({ success: false, message: 'Nombre de archivo de respaldo inválido.' });
      }

      const filePath = path.join(BACKUPS_DEST, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'El archivo de respaldo especificado no existe.' });
      }

      fs.unlinkSync(filePath);
      console.log(`[BACKUP API] Archivo de respaldo eliminado por solicitud: ${filename}`);
      res.json({ success: true, message: `El respaldo ${filename} fue eliminado exitosamente.` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}

module.exports = {
  runAllBackups,
  applyRetentionPolicy,
  setupScheduler,
  registerRoutes
};
