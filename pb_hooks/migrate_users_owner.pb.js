/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_users_owner.pb.js
 * Asegura el campo owner_id en users para vincular propietarios móviles.
 * Se ejecuta en cada arranque pero solo modifica si falta el campo.
 */

onBootstrap((e) => {
  e.next();

  try {
    const usersCol = $app.findCollectionByNameOrId('users');
    const thirdPartiesCol = $app.findCollectionByNameOrId('third_parties');
    const existing = new Set(usersCol.fields.fieldNames());
    let changed = false;

    if (!existing.has('owner_id')) {
      usersCol.fields.add(new Field({
        name: 'owner_id',
        type: 'relation',
        required: false,
        collectionId: thirdPartiesCol.id,
        cascadeDelete: false,
      }));
      changed = true;
      console.log('[GRAVY] Migracion users.owner_id aplicada.');
    }

    if (!existing.has('topbar_color')) {
      usersCol.fields.add(new Field({
        name: 'topbar_color',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY] Migracion users.topbar_color aplicada.');
    }

    const roleField = usersCol.fields.getByName('role');
    if (roleField && roleField.values) {
      const allowedRoles = ["superadmin", "admin", "contador", "auxiliar", "auditor", "viewer", "propietario", "vendedor", "cajero"];
      const currentRoles = roleField.values;
      const missingRoles = allowedRoles.filter(r => currentRoles.indexOf(r) === -1);
      if (missingRoles.length > 0) {
        roleField.values = Array.from(new Set([...currentRoles, ...allowedRoles]));
        changed = true;
        console.log('[GRAVY] users.role: Añadidos roles faltantes: ' + missingRoles.join(', '));
      }
    }

    if (changed) {
      $app.save(usersCol);
      console.log('[GRAVY] Colección users guardada con nuevos campos.');
    }
  } catch (err) {
    console.error('[GRAVY] Error migrando users fields:', String(err));
  }

  // ── Crear la colección licenses local si no existe ──────────
  try {
    $app.findCollectionByNameOrId('licenses');
  } catch (_) {
    try {
      const licenses = new Collection({
        name: "licenses",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'admin')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'admin')",
        deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'admin')",
        fields: [
          { name: "module_key", type: "select", required: true, values: ['core', 'contabilidad', 'comercial', 'nomina', 'copropiedades', 'full', 'inmobiliarias', 'logistica', 'inventarios', 'tesoreria', 'tienda-virtual', 'spa', 'conciliacion', 'crm', 'niif', 'activos_fijos'] },
          { name: "enabled", type: "bool", required: false },
          { name: "expires_at", type: "text", required: false },
          { name: "plan", type: "select", required: false, values: ['trial', 'mensual', 'anual', 'perpetua'] },
          { name: "notes", type: "text", required: false }
        ],
        indexes: ["CREATE UNIQUE INDEX idx_lic_mod_local ON licenses (module_key)"]
      });
      $app.save(licenses);
      console.log('[GRAVY] Colección licenses creada localmente.');
    } catch (errLic) {
      console.error('[GRAVY] Error creando colección licenses:', String(errLic));
    }
  }

  // ── Asegurar campo appointments.stylist_id ──────────
  try {
    const apptsCol = $app.findCollectionByNameOrId('appointments');
    const apptsFields = new Set(apptsCol.fields.fieldNames());
    if (!apptsFields.has('stylist_id')) {
      const usersCol = $app.findCollectionByNameOrId('users');
      apptsCol.fields.add(new Field({
        name: 'stylist_id',
        type: 'relation',
        required: true,
        collectionId: usersCol.id,
        cascadeDelete: false,
      }));
      $app.save(apptsCol);
      console.log('[GRAVY] Migración appointments.stylist_id aplicada.');
    }
  } catch (apptErr) {
    console.log('[GRAVY] Aviso al normalizar appointments fields (puede no existir aún): ' + apptErr);
  }
});