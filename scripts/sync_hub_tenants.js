/**
 * GRAVY v2.0 — Sincronizador Automático HUB <-> Empresas Contables
 * 
 * Escanea la base de datos contable principal (pb_data) y las sub-empresas (empresas/empresa_*)
 * y alinea el HUB (hub/pb_data/data.db) para que los nombres, NITs y puertos coincidan exactamente.
 * Evita el error "Empresa no encontrada en el HUB" (HTTP 404).
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const hubDbPath = path.join(ROOT, 'hub', 'pb_data', 'data.db');

console.log('===========================================================');
console.log('  GRAVY v2.0 — SINCRONIZADOR DE EMPRESAS Y HUB             ');
console.log('===========================================================');
console.log(`Directorio raíz: ${ROOT}`);

if (!fs.existsSync(hubDbPath)) {
  console.error(`[ERROR] No se encontró la base de datos del HUB en:\n  ${hubDbPath}`);
  process.exit(1);
}

// 1. Cargar puerto principal configurado (por defecto 8090)
let mainPort = 8090;
const portsEnvPath = path.join(ROOT, 'config', 'ports.env');
if (fs.existsSync(portsEnvPath)) {
  try {
    const content = fs.readFileSync(portsEnvPath, 'utf8');
    const match = content.match(/GRAVY_MAIN_PORT\s*=\s*(\d+)/i);
    if (match) mainPort = parseInt(match[1], 10);
  } catch (_) {}
}

function getTenantSettings(dbPath) {
  try {
    if (!fs.existsSync(dbPath)) return null;
    const db = new DatabaseSync(dbPath);
    const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('company_name', 'company_nit')").all();
    db.close();

    let name = '';
    let nit = '';
    for (const r of rows) {
      if (r.key === 'company_name') name = String(r.value || '').trim();
      if (r.key === 'company_nit') nit = String(r.value || '').trim();
    }
    return { name, nit };
  } catch (err) {
    return null;
  }
}

function generatePbId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// 2. Descubrir todos los tenants
const detectedTenants = [];

// A. Tenant Principal (pb_data)
const mainDbPath = path.join(ROOT, 'pb_data', 'data.db');
if (fs.existsSync(mainDbPath)) {
  const settings = getTenantSettings(mainDbPath);
  if (settings && (settings.name || settings.nit)) {
    detectedTenants.push({
      port: mainPort,
      name: settings.name || `EMPRESA PUERTO ${mainPort}`,
      nit: settings.nit || '000000000',
      type: 'Principal'
    });
  }
}

// B. Sub-empresas (empresas/empresa_*)
const empresasDir = path.join(ROOT, 'empresas');
if (fs.existsSync(empresasDir)) {
  const entries = fs.readdirSync(empresasDir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory() && ent.name.startsWith('empresa_')) {
      const portPart = ent.name.replace('empresa_', '');
      const portNum = parseInt(portPart, 10);
      if (!isNaN(portNum) && portNum > 0) {
        const subDbPath = path.join(empresasDir, ent.name, 'pb_data', 'data.db');
        const settings = getTenantSettings(subDbPath);
        if (settings && (settings.name || settings.nit)) {
          detectedTenants.push({
            port: portNum,
            name: settings.name || `EMPRESA ${portNum}`,
            nit: settings.nit || '000000000',
            type: `Sub-empresa (${ent.name})`
          });
        }
      }
    }
  }
}

console.log(`\n[1/3] Empresas contables detectadas en el sistema: ${detectedTenants.length}`);
for (const t of detectedTenants) {
  console.log(`  - [Puerto ${t.port}] ${t.name} (NIT: ${t.nit}) — ${t.type}`);
}

if (detectedTenants.length === 0) {
  console.log('No se encontraron bases de datos contables activas para sincronizar.');
  process.exit(0);
}

// 3. Sincronizar con el HUB
console.log('\n[2/3] Sincronizando catálogo en HUB (hub/pb_data/data.db)...');
const hubDb = new DatabaseSync(hubDbPath);

// Obtener superadmins
let superadmins = [];
try {
  superadmins = hubDb.prepare("SELECT id, email FROM hub_users WHERE is_superadmin = 1").all();
} catch (_) {}

let updatedCount = 0;
let insertedCount = 0;

for (const t of detectedTenants) {
  const existing = hubDb.prepare("SELECT id, name, nit, port FROM companies WHERE port = ?").get(t.port);

  let companyId = '';
  if (existing) {
    companyId = existing.id;
    hubDb.prepare(`
      UPDATE companies 
      SET name = ?, nit = ?, url = ?, active = 1
      WHERE id = ?
    `).run(t.name, t.nit, `http://localhost:${t.port}`, companyId);
    updatedCount++;
    console.log(`  ✓ Actualizada empresa existente: [${t.port}] ${t.name} (NIT ${t.nit})`);
  } else {
    companyId = generatePbId();
    hubDb.prepare(`
      INSERT INTO companies (id, name, nit, port, url, active, color_theme)
      VALUES (?, ?, ?, ?, ?, 1, '#2446B8')
    `).run(companyId, t.name, t.nit, t.port, `http://localhost:${t.port}`);
    insertedCount++;
    console.log(`  + Registrada nueva empresa en HUB: [${t.port}] ${t.name} (NIT ${t.nit})`);
  }

  // Asegurar accesos de Superadmins a esta empresa
  for (const sa of superadmins) {
    const acc = hubDb.prepare("SELECT id FROM user_company_access WHERE hub_user_id = ? AND company_id = ?").get(sa.id, companyId);
    if (!acc) {
      const accId = generatePbId();
      hubDb.prepare(`
        INSERT INTO user_company_access (id, hub_user_id, company_id, role, company_email, company_pass, active)
        VALUES (?, ?, ?, 'admin', ?, 'Admin1234!', 1)
      `).run(accId, sa.id, companyId, sa.email);
    } else {
      hubDb.prepare(`
        UPDATE user_company_access 
        SET active = 1,
            role = CASE WHEN role = 'superadmin' THEN 'admin' ELSE role END,
            company_pass = CASE WHEN company_pass IS NULL OR company_pass = '' THEN 'Admin1234!' ELSE company_pass END
        WHERE id = ?
      `).run(acc.id);
    }
  }
}

hubDb.close();

console.log('\n[3/3] Resumen de la sincronización:');
console.log(`  - Empresas actualizadas: ${updatedCount}`);
console.log(`  - Empresas creadas:      ${insertedCount}`);
console.log('===========================================================');
console.log('  ¡Sincronización completada con éxito!');
console.log('  Ya puedes ingresar desde el HUB a cualquiera de las empresas.');
console.log('===========================================================');
