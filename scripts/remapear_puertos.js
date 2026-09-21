/**
 * GRAVY v2.0 — remapear_puertos.js
 * Remapeador inteligente de puertos y URLs para la suite GRAVY.
 * 
 * Uso:
 *   node scripts/remapear_puertos.js --base-port 9090 [--hub-port 9089] [--orchestrator-port 9088]
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Argument parsing
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultVal;
}

const ROOT = path.resolve(getArg('--root', path.join(__dirname, '..')));
const BASE_PORT = parseInt(getArg('--base-port', '8090'), 10);
const HUB_PORT = parseInt(getArg('--hub-port', String(BASE_PORT - 1)), 10);
const ORCHESTRATOR_PORT = parseInt(getArg('--orchestrator-port', String(BASE_PORT - 2)), 10);

if (isNaN(BASE_PORT) || BASE_PORT < 1024 || BASE_PORT > 65535) {
  console.error(`[ERROR] Puerto base inválido: ${BASE_PORT}. Debe estar entre 1024 y 65535.`);
  process.exit(1);
}

console.log('====================================================');
console.log('  GRAVY v2.0 — REMAPEADOR DINÁMICO DE PUERTOS       ');
console.log('====================================================');
console.log(`Directorio raíz:       ${ROOT}`);
console.log(`Nuevo Puerto Principal:${BASE_PORT}`);
console.log(`Nuevo Puerto HUB:      ${HUB_PORT}`);
console.log(`Nuevo Orquestador:     ${ORCHESTRATOR_PORT}`);
console.log('----------------------------------------------------');

const hubDbPath = path.join(ROOT, 'hub', 'pb_data', 'data.db');
const empresasDir = path.join(ROOT, 'empresas');
const configDir = path.join(ROOT, 'config');
const pbPublicDir = path.join(ROOT, 'pb_public');

async function reassignPorts() {
  if (!fs.existsSync(hubDbPath)) {
    console.error(`[ERROR] No se encontró la base de datos del HUB en: ${hubDbPath}`);
    process.exit(1);
  }

  // 1. Abrir base de datos del HUB
  const db = new sqlite3.Database(hubDbPath);

  const getCompanies = () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, nit, port, url, active FROM companies ORDER BY port ASC', (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  };

  const updateCompany = (id, newPort, newUrl) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE companies SET port = ?, url = ? WHERE id = ?', [newPort, newUrl, id], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  };

  try {
    const companies = await getCompanies();
    console.log(`[1/5] Encontradas ${companies.length} empresas en la base de datos del HUB.`);

    // Determinar el puerto base original (generalmente el de la empresa principal, o 8090)
    let originalBasePort = 8090;
    const mainCo = companies.find(c => c.port === 8090) || companies[0];
    if (mainCo && mainCo.port) {
      originalBasePort = mainCo.port;
    }

    const portOffset = BASE_PORT - originalBasePort;
    console.log(`      Desfase de remapeo (Offset): ${portOffset >= 0 ? '+' : ''}${portOffset} puertos.`);

    // 2. Mapear nuevos puertos para cada empresa
    const updates = [];
    const dirRenames = [];

    for (const comp of companies) {
      const oldPort = comp.port;
      let newPort = oldPort + portOffset;
      
      // Si la empresa es la principal (era originalBasePort), asignar BASE_PORT
      if (oldPort === originalBasePort) {
        newPort = BASE_PORT;
      }

      const parsedUrl = new URL(comp.url || `http://localhost:${oldPort}`);
      const newUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}:${newPort}`;

      updates.push({
        id: comp.id,
        name: comp.name,
        nit: comp.nit,
        oldPort,
        newPort,
        oldUrl: comp.url,
        newUrl
      });

      if (oldPort !== newPort) {
        dirRenames.push({
          oldDir: path.join(empresasDir, `empresa_${oldPort}`),
          newDir: path.join(empresasDir, `empresa_${newPort}`),
          oldPort,
          newPort
        });
      }
    }

    // 3. Aplicar actualizaciones en la tabla companies
    console.log('\n[2/5] Actualizando registros en hub/pb_data/data.db...');
    for (const u of updates) {
      await updateCompany(u.id, u.newPort, u.newUrl);
      console.log(`  [OK] ${u.name.padEnd(30)}: ${u.oldPort} -> ${u.newPort} (${u.newUrl})`);
    }

    // 4. Renombrar carpetas de inquilinos en 'empresas/'
    console.log('\n[3/5] Sincronizando nombres de directorios en empresas/...');
    if (fs.existsSync(empresasDir)) {
      // Paso a: renombrar con prefijo temporal si hay solapamientos
      for (const r of dirRenames) {
        if (fs.existsSync(r.oldDir) && r.oldDir !== r.newDir) {
          const tempDir = `${r.oldDir}_tmp_remapping_${Date.now()}`;
          fs.renameSync(r.oldDir, tempDir);
          r.tempDir = tempDir;
        }
      }
      // Paso b: renombrar al destino definitivo
      for (const r of dirRenames) {
        if (r.tempDir && fs.existsSync(r.tempDir)) {
          fs.renameSync(r.tempDir, r.newDir);
          console.log(`  [OK] Carpeta renombrada: empresa_${r.oldPort} -> empresa_${r.newPort}`);
        }
      }

      // También revisar si existen carpetas huérfanas en empresas/ que no estuvieran en companies
      const existingItems = fs.readdirSync(empresasDir);
      for (const item of existingItems) {
        const m = item.match(/^empresa_(\d+)$/);
        if (m) {
          const folderPort = parseInt(m[1], 10);
          const alreadyHandled = updates.some(u => u.newPort === folderPort || u.oldPort === folderPort);
          if (!alreadyHandled && portOffset !== 0) {
            const orphanOldDir = path.join(empresasDir, item);
            const orphanNewPort = folderPort + portOffset;
            const orphanNewDir = path.join(empresasDir, `empresa_${orphanNewPort}`);
            if (fs.statSync(orphanOldDir).isDirectory() && !fs.existsSync(orphanNewDir)) {
              fs.renameSync(orphanOldDir, orphanNewDir);
              console.log(`  [OK] Inquilino no registrado renombrado: empresa_${folderPort} -> empresa_${orphanNewPort}`);
            }
          }
        }
      }
    }

    // 5. Generar config/ports.env
    console.log('\n[4/5] Escribiendo archivo de entorno config/ports.env...');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const portsEnvContent = [
      '# GRAVY v2.0 — Configuración Dinámica de Puertos de Red',
      `# Generado automáticamente el ${new Date().toISOString()}`,
      `GRAVY_MAIN_PORT=${BASE_PORT}`,
      `GRAVY_HUB_PORT=${HUB_PORT}`,
      `GRAVY_ORCHESTRATOR_PORT=${ORCHESTRATOR_PORT}`,
      ''
    ].join('\n');

    fs.writeFileSync(path.join(configDir, 'ports.env'), portsEnvContent, 'utf8');
    console.log(`  [OK] Guardado en config/ports.env`);

    // 6. Generar pb_public/gravy-runtime-config.js para inyectar en el frontend
    console.log('\n[5/5] Generando configuración en caliente para el Frontend web...');
    if (fs.existsSync(pbPublicDir)) {
      const runtimeJsContent = [
        '/**',
        ' * GRAVY v2.0 — Configuración en caliente inyectada al frontend',
        ` * Generado automáticamente el ${new Date().toISOString()}`,
        ' */',
        'window.GRAVY_CONFIG = {',
        `  mainPort: ${BASE_PORT},`,
        `  hubPort: ${HUB_PORT},`,
        `  orchestratorPort: ${ORCHESTRATOR_PORT}`,
        '};',
        '',
        '// Sobrescribir HUB_URL dinámicamente si no está en modo Nube (Tunnel)',
        'try {',
        '  const { protocol, hostname } = window.location;',
        `  window.HUB_URL = protocol + '//' + hostname + ':${HUB_PORT}';`,
        '} catch (_) {}',
        ''
      ].join('\n');

      fs.writeFileSync(path.join(pbPublicDir, 'gravy-runtime-config.js'), runtimeJsContent, 'utf8');
      console.log(`  [OK] Guardado en pb_public/gravy-runtime-config.js`);
    }

    console.log('\n====================================================');
    console.log('  ¡REMAPEO DE PUERTOS COMPLETADO CON ÉXITO!        ');
    console.log('====================================================');
    console.log(`URL Empresa Principal : http://localhost:${BASE_PORT}`);
    console.log(`URL GRAVY HUB        : http://localhost:${HUB_PORT}`);
    console.log(`URL Orquestador      : http://localhost:${ORCHESTRATOR_PORT}`);
    console.log('----------------------------------------------------');

    db.close();
    process.exit(0);

  } catch (err) {
    db.close();
    console.error('[ERROR] Falló el remapeo de puertos:', err);
    process.exit(1);
  }
}

reassignPorts();
