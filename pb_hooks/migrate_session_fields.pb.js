/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_session_fields.pb.js
 * Añade campos para el control de sesión única y auditoría de conexión en la colección 'users'.
 */

onBootstrap((e) => {
  e.next();

  try {
    const usersCol = $app.findCollectionByNameOrId('users');
    const existing = new Set(usersCol.fields.fieldNames());
    let changed = false;

    if (!existing.has('active_session_id')) {
      usersCol.fields.add(new Field({
        name: 'active_session_id',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY] Migracion users.active_session_id aplicada.');
    }

    if (!existing.has('last_login_ip')) {
      usersCol.fields.add(new Field({
        name: 'last_login_ip',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY] Migracion users.last_login_ip aplicada.');
    }

    if (!existing.has('last_login_at')) {
      usersCol.fields.add(new Field({
        name: 'last_login_at',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY] Migracion users.last_login_at aplicada.');
    }

    if (!existing.has('last_activity_at')) {
      usersCol.fields.add(new Field({
        name: 'last_activity_at',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY] Migracion users.last_activity_at aplicada.');
    }

    if (changed) {
      $app.save(usersCol);
      console.log('[GRAVY] Colección users actualizada con campos de control de sesión.');
    }
  } catch (err) {
    console.error('[GRAVY] Error al migrar campos de sesión en users:', String(err));
  }
});
