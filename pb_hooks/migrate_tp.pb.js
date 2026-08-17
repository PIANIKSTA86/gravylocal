/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_tp.pb.js
 * Migración: agrega campos nuevos a third_parties y actualiza valores de tipo.
 * Se ejecuta en cada arranque pero es idempotente (sólo actúa si falta algo).
 */

onBootstrap((e) => {
  e.next();

  try {
    const col = $app.findCollectionByNameOrId('third_parties');
    const existing = new Set(col.fields.fieldNames());
    let changed = false;

    // ── Nuevos campos de texto ─────────────────────────────
    const textFields = [
      'person_type', 'first_name', 'last_name', 'business_name',
      'city_code', 'dept_code', 'advisor', 'phone2',
      'ciiu', 'rf'
    ];
    for (const name of textFields) {
      if (!existing.has(name)) {
        col.fields.add(new Field({ name, type: 'text', required: false }));
        changed = true;
      }
    }

    // ── Email 2 ────────────────────────────────────────────
    if (!existing.has('email2')) {
      col.fields.add(new Field({ name: 'email2', type: 'email', required: false }));
      changed = true;
    }

    // ── Campos numéricos ───────────────────────────────────
    if (!existing.has('credit_limit')) {
      col.fields.add(new Field({ name: 'credit_limit', type: 'number', required: false, min: 0 }));
      changed = true;
    }
    if (!existing.has('max_invoices')) {
      col.fields.add(new Field({ name: 'max_invoices', type: 'number', required: false, min: 0 }));
      changed = true;
    }
    const numFields = ['prf', 'pi', 'piv'];
    for (const name of numFields) {
      if (!existing.has(name)) {
        col.fields.add(new Field({ name, type: 'number', required: false, min: 0 }));
        changed = true;
      }
    }

    // ── Campos booleanos ───────────────────────────────────
    const boolFields = ['gc', 'ar', 'ei'];
    for (const name of boolFields) {
      if (!existing.has(name)) {
        col.fields.add(new Field({ name, type: 'bool', required: false }));
        changed = true;
      }
    }

    // ── Campos JSON ────────────────────────────────────────
    if (!existing.has('resp')) {
      col.fields.add(new Field({ name: 'resp', type: 'json', required: false }));
      changed = true;
    }

    // ── Actualizar valores del campo 'type' ────────────────
    const typeField = col.fields.getByName('type');
    if (typeField) {
      // Migrate old data
      try {
        $app.nonconcurrentDB().newQuery("UPDATE third_parties SET type = 'PROVEEDOR' WHERE type IN ('ACREEDOR', 'TRANSPORTISTA')").execute();
        $app.nonconcurrentDB().newQuery("UPDATE third_parties SET type = 'EMPLEADO' WHERE type = 'VENDEDOR'").execute();
      } catch (sqlErr) {
        console.error('[GRAVY] Error running SQL migration for third parties:', String(sqlErr));
      }

      const vals = typeField.values || [];
      const hasOldVals = vals.includes('ACREEDOR') || vals.includes('TRANSPORTISTA') || vals.includes('VENDEDOR');
      const hasAllNewVals = vals.includes('CLIENTE') && vals.includes('PROVEEDOR') && vals.includes('EMPLEADO') && vals.includes('PROPIETARIO') && vals.includes('OTRO');
      if (hasOldVals || !hasAllNewVals) {
        typeField.values = ['CLIENTE', 'PROVEEDOR', 'EMPLEADO', 'PROPIETARIO', 'OTRO'];
        col.fields.add(typeField); // add() reemplaza si mismo nombre/id
        changed = true;
      }
    }

    // ── Actualizar valores del campo 'doc_type' ────────────
    const docTypeField = col.fields.getByName('doc_type');
    if (docTypeField) {
      const allowedDocTypes = [
        '11', '12', '13', '21', '22', '31', '41', '42', '47', '48', '50', '91',
        'NIT', 'NITPE', 'CC', 'CE', 'TI', 'PAS', 'RC'
      ];
      docTypeField.values = allowedDocTypes;
      col.fields.add(docTypeField);
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log('[GRAVY] Migración third_parties completada: campos nuevos agregados.');
    }
  } catch (err) {
    console.error('[GRAVY] Error en migración third_parties:', String(err));
  }

  // ── Migración transaction_types: índice único (code) → (code, prefix) ─────
  // Permite múltiples series/prefijos por el mismo código de tipo (ej: varias
  // resoluciones de facturación con distintos prefijos DIAN en el mismo tipo FV).
  try {
    $app.nonconcurrentDB()
      .newQuery("DROP INDEX IF EXISTS idx_tt_code")
      .execute();
    $app.nonconcurrentDB()
      .newQuery("CREATE UNIQUE INDEX IF NOT EXISTS idx_tt_code_prefix ON transaction_types (code, prefix)")
      .execute();
    console.log('[GRAVY] Migración transaction_types: índice actualizado a UNIQUE(code, prefix).');
  } catch (err) {
    console.error('[GRAVY] Error migrando índice transaction_types:', String(err));
  }

  // ── Migración tx_lines: tercero por línea (third_party_id) ─────────────────
  try {
    const txLines = $app.findCollectionByNameOrId('tx_lines');
    const thirdParties = $app.findCollectionByNameOrId('third_parties');
    const hasLineThird = txLines.fields.fieldNames().includes('third_party_id');
    if (!hasLineThird) {
      txLines.fields.add(new Field({
        name: 'third_party_id',
        type: 'relation',
        required: false,
        collectionId: thirdParties.id,
        cascadeDelete: false,
      }));
      $app.save(txLines);
      console.log('[GRAVY] Migración tx_lines: campo third_party_id agregado.');
    }
  } catch (err) {
    console.error('[GRAVY] Error migrando tx_lines.third_party_id:', String(err));
  }
});
