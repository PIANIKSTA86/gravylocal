/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY HUB v2.0 — hub_migrate_session.pb.js
 * Asegura los campos de sesión única y auditoría en la colección 'hub_users'.
 */

onBootstrap((e) => {
  e.next();

  try {
    const hubUsersCol = $app.findCollectionByNameOrId('hub_users');
    const existing = new Set(hubUsersCol.fields.fieldNames());
    let changed = false;

    if (!existing.has('active_session_id')) {
      hubUsersCol.fields.add(new Field({
        name: 'active_session_id',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY HUB] Migracion hub_users.active_session_id aplicada.');
    }

    if (!existing.has('last_login_ip')) {
      hubUsersCol.fields.add(new Field({
        name: 'last_login_ip',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY HUB] Migracion hub_users.last_login_ip aplicada.');
    }

    if (!existing.has('last_login_at')) {
      hubUsersCol.fields.add(new Field({
        name: 'last_login_at',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY HUB] Migracion hub_users.last_login_at aplicada.');
    }

    if (!existing.has('last_activity_at')) {
      hubUsersCol.fields.add(new Field({
        name: 'last_activity_at',
        type: 'text',
        required: false,
      }));
      changed = true;
      console.log('[GRAVY HUB] Migracion hub_users.last_activity_at aplicada.');
    }

    if (changed) {
      $app.save(hubUsersCol);
      console.log('[GRAVY HUB] Colección hub_users actualizada con campos de control de sesión.');
    }
  } catch (err) {
    console.error('[GRAVY HUB] Error al migrar campos de sesión en hub_users:', String(err));
  }
});
