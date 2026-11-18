/**
 * GRAVY v2.0 — Asistente de Actualización Segura de SuperAdministrador
 * 
 * Permite cambiar la identificación (correo) y la contraseña del SuperAdmin
 * en el HUB central y sincronizarlo en las empresas satélites sin riesgo.
 * Compatible con cualquier equipo local o servidor con GRAVY.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const hubDbPath = path.join(ROOT, 'hub', 'pb_data', 'data.db');
const mainDbPath = path.join(ROOT, 'pb_data', 'data.db');

// Buscar bcryptjs en hub/node_modules o global
let bcrypt;
try {
  bcrypt = require(path.join(ROOT, 'hub', 'node_modules', 'bcryptjs'));
} catch (_) {
  try {
    bcrypt = require('bcryptjs');
  } catch (err) {
    console.error('\n[ERROR] No se encontró el módulo bcryptjs en hub/node_modules.');
    console.error('Ejecute: npm --prefix hub install bcryptjs\n');
    process.exit(1);
  }
}

if (!fs.existsSync(hubDbPath)) {
  console.error(`\n[ERROR] No se encontró la base de datos del HUB en:\n  ${hubDbPath}\n`);
  process.exit(1);
}

function generatePbId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generateTokenKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let k = '';
  for (let i = 0; i < 50; i++) {
    k += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return k;
}

function ask(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  console.log('\n=============================================================');
  console.log('   GRAVY v2.0 — ACTUALIZACIÓN SEGURA DE SUPERADMINISTRADOR   ');
  console.log('=============================================================');
  console.log(`Directorio del sistema: ${ROOT}\n`);

  const hubDb = new DatabaseSync(hubDbPath);

  // Consultar superadmins actuales
  let currentSuperadmins = [];
  try {
    currentSuperadmins = hubDb.prepare("SELECT id, email, full_name FROM hub_users WHERE is_superadmin = 1").all();
  } catch (e) {
    console.error('[ERROR] Leyendo hub_users:', e.message);
  }

  console.log('SuperAdministrador(es) registrado(s) actualmente:');
  if (currentSuperadmins.length === 0) {
    console.log('  [!] Ninguno detectado (se creará uno nuevo).');
  } else {
    for (const sa of currentSuperadmins) {
      console.log(`  - Correo: ${sa.email} (${sa.full_name || 'Sin nombre'}) [ID: ${sa.id}]`);
    }
  }
  console.log('-------------------------------------------------------------');

  // Procesar argumentos si vienen por CLI
  const args = process.argv.slice(2);
  let newEmail = '';
  let newPass = '';
  let newName = '';
  let keepOld = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) newEmail = args[i + 1].trim();
    if (args[i] === '--password' && args[i + 1]) newPass = args[i + 1].trim();
    if (args[i] === '--name' && args[i + 1]) newName = args[i + 1].trim();
    if (args[i] === '--replace') keepOld = false;
  }

  // Si no se pasaron por CLI, preguntar interactivamente
  if (!newEmail || !newPass) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (!newEmail) {
      newEmail = await ask(rl, '\n[1/4] Ingrese el nuevo correo del SuperAdmin [Por defecto: superadmin@gravy-ms.com]: ', 'superadmin@gravy-ms.com');
    }
    newEmail = newEmail.toLowerCase().trim();

    if (!newName) {
      newName = await ask(rl, '[2/4] Nombre completo o cargo [Por defecto: Super Administrador]: ', 'Super Administrador');
    }

    while (!newPass) {
      const p1 = await ask(rl, '[3/4] Ingrese la NUEVA contraseña (mínimo 8 caracteres): ');
      if (p1.length < 8) {
        console.log('  [!] La contraseña debe tener al menos 8 caracteres. Intente nuevamente.');
        continue;
      }
      const p2 = await ask(rl, '     Confirme la NUEVA contraseña: ');
      if (p1 !== p2) {
        console.log('  [!] Las contraseñas no coinciden. Intente nuevamente.\n');
        continue;
      }
      newPass = p1;
    }

    const respKeep = await ask(rl, '[4/4] ¿Desea mantener las cuentas anteriores como respaldo? (S/N) [Por defecto: S]: ', 'S');
    keepOld = respKeep.toUpperCase() !== 'N';

    rl.close();
  }

  console.log('\n-------------------------------------------------------------');
  console.log('Aplicando cambios de seguridad en el HUB...');

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPass, salt);
  const tokenKey = generateTokenKey();

  // 1. Verificar si el usuario ya existe en hub_users
  const existingUser = hubDb.prepare("SELECT id, email FROM hub_users WHERE email = ?").get(newEmail);

  let targetId = '';
  if (existingUser) {
    targetId = existingUser.id;
    hubDb.prepare(`
      UPDATE hub_users 
      SET password = ?, tokenKey = ?, full_name = ?, is_superadmin = 1, verified = 1, emailVisibility = 1
      WHERE id = ?
    `).run(passwordHash, tokenKey, newName, targetId);
    console.log(`✓ Actualizada cuenta existente en HUB: ${newEmail}`);
  } else {
    // Si no se quieren mantener las anteriores y hay una sola cuenta superadmin previa, renombrar
    if (!keepOld && currentSuperadmins.length === 1) {
      targetId = currentSuperadmins[0].id;
      hubDb.prepare(`
        UPDATE hub_users 
        SET email = ?, password = ?, tokenKey = ?, full_name = ?, is_superadmin = 1, verified = 1, emailVisibility = 1
        WHERE id = ?
      `).run(newEmail, passwordHash, tokenKey, newName, targetId);
      console.log(`✓ Cuenta anterior reemplazada por: ${newEmail}`);
    } else {
      targetId = generatePbId();
      hubDb.prepare(`
        INSERT INTO hub_users (id, email, password, tokenKey, full_name, is_superadmin, verified, emailVisibility)
        VALUES (?, ?, ?, ?, ?, 1, 1, 1)
      `).run(targetId, newEmail, passwordHash, tokenKey, newName);
      console.log(`✓ Creada nueva cuenta SuperAdmin en HUB: ${newEmail}`);
    }
  }

  // 2. Asignar acceso a todas las empresas en user_company_access
  const companies = hubDb.prepare("SELECT id, name, port FROM companies WHERE active = 1").all();
  console.log(`\nAsignando permisos a ${companies.length} empresas registradas...`);

  for (const c of companies) {
    const acc = hubDb.prepare("SELECT id FROM user_company_access WHERE hub_user_id = ? AND company_id = ?").get(targetId, c.id);
    if (!acc) {
      const accId = generatePbId();
      hubDb.prepare(`
        INSERT INTO user_company_access (id, hub_user_id, company_id, role, company_email, company_pass, active)
        VALUES (?, ?, ?, 'admin', ?, 'SSO_ACTIVE', 1)
      `).run(accId, targetId, c.id, newEmail);
      console.log(`  + Permiso concedido en: [${c.port}] ${c.name}`);
    } else {
      hubDb.prepare(`
        UPDATE user_company_access 
        SET active = 1, company_email = ?
        WHERE id = ?
      `).run(newEmail, acc.id);
      console.log(`  ✓ Permiso reafirmado en: [${c.port}] ${c.name}`);
    }
  }

  // 3. Sincronizar en la empresa principal local (pb_data) y sub-empresas (empresas/empresa_*)
  const allDbPaths = [];
  if (fs.existsSync(mainDbPath)) allDbPaths.push({ name: 'Principal (8090)', path: mainDbPath });

  const empresasDir = path.join(ROOT, 'empresas');
  if (fs.existsSync(empresasDir)) {
    const entries = fs.readdirSync(empresasDir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory() && ent.name.startsWith('empresa_')) {
        const subDb = path.join(empresasDir, ent.name, 'pb_data', 'data.db');
        if (fs.existsSync(subDb)) {
          allDbPaths.push({ name: ent.name, path: subDb });
        }
      }
    }
  }

  console.log(`\nSincronizando identidad en ${allDbPaths.length} bases de datos contables locales...`);
  for (const t of allDbPaths) {
    try {
      const tDb = new DatabaseSync(t.path);
      const tUser = tDb.prepare("SELECT id FROM users WHERE email = ?").get(newEmail);
      if (!tUser) {
        const uId = generatePbId();
        const tToken = generateTokenKey();
        tDb.prepare(`
          INSERT INTO users (id, email, password, tokenKey, name, full_name, role, active, verified, emailVisibility)
          VALUES (?, ?, ?, ?, ?, ?, 'superadmin', 1, 1, 1)
        `).run(uId, newEmail, passwordHash, tToken, newName, newName);
        console.log(`  ✓ Usuario creado en [${t.name}].`);
      } else {
        tDb.prepare(`
          UPDATE users SET password = ?, name = ?, full_name = ?, role = 'superadmin', active = 1
          WHERE id = ?
        `).run(passwordHash, newName, newName, tUser.id);
        console.log(`  ✓ Usuario actualizado en [${t.name}].`);
      }
      tDb.close();
    } catch (e) {
      console.warn(`  [!] Nota al actualizar ${t.name}: ${e.message}`);
    }
  }

  hubDb.close();

  // 4. Probar verificación en vivo si el HUB está activo
  console.log('\nVerificando autenticación con el HUB...');
  try {
    const res = await fetch('http://localhost:8089/api/collections/hub_users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: newEmail, password: newPass })
    });
    if (res.ok) {
      console.log('✓ [TEST EN VIVO OK] ¡El HUB autenticó exitosamente la nueva cuenta!');
    } else {
      console.log('ℹ El servidor HUB responderá con la nueva clave una vez que reinicie los servicios.');
    }
  } catch (_) {
    console.log('ℹ Servidor HUB en reposo. Los cambios están guardados físicamente en base de datos.');
  }

  console.log('\n=============================================================');
  console.log('             ¡ACTUALIZACIÓN COMPLETADA CON ÉXITO!            ');
  console.log('=============================================================');
  console.log(`  Nuevo Usuario SuperAdmin:  ${newEmail}`);
  console.log(`  Nueva Contraseña:         [Guardada con cifrado Bcrypt]`);
  console.log(`  Empresas Vinculadas:      ${companies.length} empresas autorizadas`);
  console.log('=============================================================\n');
}

main().catch(err => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
