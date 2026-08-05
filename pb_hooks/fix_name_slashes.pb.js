// fix_name_slashes.pb.js
// MIGRACION: Limpiar slashes iniciales y finales en third_parties.name
// =====================================================================
// Corrige el bug donde el campo name de terceros contiene un slash (/)
// al inicio o al final, por ejemplo: "/JULIAN ESPINO ARRUBL" ->
// "JULIAN ESPINO ARRUBL". Ejecutar una sola vez via:
//   curl -X POST http://localhost:8090/api/admin/fix-name-slashes
//   (o desde el navegador con Postman/fetch autenticado)

routerAdd('POST', '/api/admin/fix-name-slashes', function(e) {
  try {
    var records = $app.findRecordsByFilter(
      'third_parties',
      '1=1',
      '',
      10000,
      0
    );

    var fixed = 0;
    var skipped = 0;
    var fixedNames = [];

    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      var changed = false;

      // Limpiar campo name
      var originalName = rec.getString('name');
      var cleanName = String(originalName || '').replace(/^[\/\s]+|[\/\s]+$/g, '').trim();
      if (cleanName !== originalName && cleanName.length > 0) {
        rec.set('name', cleanName);
        changed = true;
        fixedNames.push({ id: rec.id, field: 'name', before: originalName, after: cleanName });
        console.log('[FIX-NAMES] name: "' + originalName + '" -> "' + cleanName + '" (ID: ' + rec.id + ')');
      }

      // Limpiar campo business_name
      var origBizName = rec.getString('business_name');
      if (origBizName) {
        var cleanBizName = String(origBizName).replace(/^[\/\s]+|[\/\s]+$/g, '').trim();
        if (cleanBizName !== origBizName && cleanBizName.length > 0) {
          rec.set('business_name', cleanBizName);
          changed = true;
          fixedNames.push({ id: rec.id, field: 'business_name', before: origBizName, after: cleanBizName });
        }
      }

      // Limpiar campo first_name
      var origFirstName = rec.getString('first_name');
      if (origFirstName) {
        var cleanFirst = String(origFirstName).replace(/^[\/\s]+|[\/\s]+$/g, '').trim();
        if (cleanFirst !== origFirstName && cleanFirst.length > 0) {
          rec.set('first_name', cleanFirst);
          changed = true;
          fixedNames.push({ id: rec.id, field: 'first_name', before: origFirstName, after: cleanFirst });
        }
      }

      // Limpiar campo last_name
      var origLastName = rec.getString('last_name');
      if (origLastName) {
        var cleanLast = String(origLastName).replace(/^[\/\s]+|[\/\s]+$/g, '').trim();
        if (cleanLast !== origLastName && cleanLast.length > 0) {
          rec.set('last_name', cleanLast);
          changed = true;
          fixedNames.push({ id: rec.id, field: 'last_name', before: origLastName, after: cleanLast });
        }
      }

      if (changed) {
        try {
          $app.save(rec);
          fixed++;
        } catch (saveErr) {
          console.error('[FIX-NAMES] Error al guardar ' + rec.id + ': ' + saveErr);
        }
      } else {
        skipped++;
      }
    }

    e.json(200, {
      ok: true,
      message: 'Correccion completada: ' + fixed + ' registros corregidos, ' + skipped + ' sin cambios.',
      fixed: fixed,
      skipped: skipped,
      fixedNames: fixedNames
    });
  } catch (err) {
    console.error('[FIX-NAMES] Error:', err);
    e.json(500, { ok: false, message: String(err) });
  }
});
