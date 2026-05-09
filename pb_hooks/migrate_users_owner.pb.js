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

    if (existing.has('owner_id')) {
      return;
    }

    usersCol.fields.add(new Field({
      name: 'owner_id',
      type: 'relation',
      required: false,
      collectionId: thirdPartiesCol.id,
      cascadeDelete: false,
    }));

    $app.save(usersCol);
    console.log('[GRAVY] Migracion users.owner_id aplicada.');
  } catch (err) {
    console.error('[GRAVY] Error migrando users.owner_id:', String(err));
  }
});