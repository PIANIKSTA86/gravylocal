/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — patch_settings_rules.pb.js
 * Parche puntual: amplía las reglas de escritura de la colección `settings`
 * para incluir los roles superadmin, administrador, admin, contador y auxiliar.
 * Este archivo puede eliminarse luego de reiniciar PocketBase una vez.
 */
onBootstrap((e) => {
  e.next();

  try {
    const settingsCol = $app.findCollectionByNameOrId('settings');
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";

    let changed = false;

    if (settingsCol.createRule !== writeRule) {
      settingsCol.createRule = writeRule;
      changed = true;
    }
    if (settingsCol.updateRule !== writeRule) {
      settingsCol.updateRule = writeRule;
      changed = true;
    }

    if (changed) {
      $app.save(settingsCol);
      console.log('[GRAVY] patch_settings_rules: Reglas de settings actualizadas correctamente.');
    } else {
      console.log('[GRAVY] patch_settings_rules: Reglas de settings ya estaban correctas.');
    }
  } catch (err) {
    console.error('[GRAVY] patch_settings_rules: Error al aplicar parche: ' + err);
  }
});
