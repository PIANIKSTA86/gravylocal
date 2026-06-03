/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — patch_settings_logo_limit.pb.js
 * Parche puntual: amplía el límite de caracteres (max) del campo 'value'
 * en la colección 'settings' a 1000000 para soportar logos codificados en Base64.
 */
onBootstrap((e) => {
  e.next();

  try {
    const settingsCol = $app.findCollectionByNameOrId('settings');
    const valueField = settingsCol.fields.getByName('value');
    if (valueField && (valueField.max === null || valueField.max < 1000000)) {
      valueField.max = 1000000;
      $app.save(settingsCol);
      console.log('[GRAVY] patch_settings_logo_limit: Límite de caracteres en settings.value actualizado a 1000000.');
    }
  } catch (err) {
    console.error('[GRAVY] patch_settings_logo_limit: Error al aplicar parche de límite: ' + err);
  }
});
