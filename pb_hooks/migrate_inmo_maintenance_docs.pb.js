/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_inmo_maintenance_docs.pb.js
 * Módulo Inmobiliario: Colecciones para Mantenimientos (inmo_maintenance)
 * y Gestión Documental / Expedientes (inmo_documents).
 */

onBootstrap((e) => {
  e.next();

  let inmoPropertiesId = '';
  let inmoContractsId  = '';
  let thirdPartiesId   = '';

  try {
    inmoPropertiesId = $app.findCollectionByNameOrId('inmo_properties').id;
    inmoContractsId  = $app.findCollectionByNameOrId('inmo_contracts').id;
    thirdPartiesId   = $app.findCollectionByNameOrId('third_parties').id;
  } catch (err) {
    console.log('[GRAVY-INMO-MNT-DOC] Aviso: colecciones base no encontradas: ' + err);
    return;
  }

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador')";

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: inmo_maintenance — Órdenes de Mantenimiento
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('inmo_maintenance');
  } catch (_) {
    try {
      const inmoMaintenance = new Collection({
        name: 'inmo_maintenance',
        type: 'base',
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: 'code',           type: 'text',     required: true  },
          { name: 'property_id',    type: 'relation', required: true,
            collectionId: inmoPropertiesId, cascadeDelete: false },
          { name: 'contract_id',    type: 'relation', required: false,
            collectionId: inmoContractsId, cascadeDelete: false },
          { name: 'provider_id',    type: 'relation', required: false,
            collectionId: thirdPartiesId, cascadeDelete: false },
          { name: 'title',          type: 'text',     required: true  },
          { name: 'type',           type: 'select',   required: true,
            values: ['PREVENTIVO', 'CORRECTIVO', 'LOCATIVO', 'ENTREGA_DESALOJO'] },
          { name: 'status',         type: 'select',   required: true,
            values: ['PROGRAMADO', 'EN_COTIZACION', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO'] },
          { name: 'scheduled_date', type: 'text',     required: false },
          { name: 'completed_date', type: 'text',     required: false },
          { name: 'estimated_cost', type: 'number',   required: false, min: 0 },
          { name: 'actual_cost',    type: 'number',   required: false, min: 0 },
          { name: 'charged_to',     type: 'select',   required: true,
            values: ['PROPIETARIO', 'INQUILINO', 'INMOBILIARIA'] },
          { name: 'is_deducted',    type: 'bool',     required: false },
          { name: 'description',    type: 'text',     required: false },
          { name: 'attachments',    type: 'file',     required: false,
            maxSelect: 5, maxSize: 52428800 },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_inmo_mnt_code ON inmo_maintenance (code)'],
      });
      $app.save(inmoMaintenance);
      console.log('[GRAVY-INMO-MNT-DOC] Colección inmo_maintenance creada exitosamente.');
    } catch (err) {
      console.error('[GRAVY-INMO-MNT-DOC] Error al crear inmo_maintenance:', err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: inmo_documents — Expedientes y Documentación
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('inmo_documents');
  } catch (_) {
    try {
      const inmoDocuments = new Collection({
        name: 'inmo_documents',
        type: 'base',
        listRule:   "@request.auth.id != ''",
        viewRule:   "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: 'title',           type: 'text',     required: true  },
          { name: 'category',        type: 'select',   required: true,
            values: ['CERT_TRADICION', 'ESCRITURA', 'CONTRATO_FIRMADO', 'POLIZA_SEGURO', 'PAZ_Y_SALVO', 'RUT_CEDULA', 'ACTA_ENTREGA', 'RECIBO_SERVICIO', 'OTRO'] },
          { name: 'property_id',     type: 'relation', required: false,
            collectionId: inmoPropertiesId, cascadeDelete: false },
          { name: 'contract_id',     type: 'relation', required: false,
            collectionId: inmoContractsId, cascadeDelete: false },
          { name: 'file',            type: 'file',     required: true,
            maxSelect: 1, maxSize: 52428800 },
          { name: 'expiration_date', type: 'text',     required: false },
          { name: 'notes',           type: 'text',     required: false },
          { name: 'created',         type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated',         type: 'autodate', onCreate: true, onUpdate: true },
        ],
      });
      $app.save(inmoDocuments);
      console.log('[GRAVY-INMO-MNT-DOC] Colección inmo_documents creada exitosamente.');
    } catch (err) {
      console.error('[GRAVY-INMO-MNT-DOC] Error al crear inmo_documents:', err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Garantizar campos created y updated si ya existían
  // ──────────────────────────────────────────────────────────
  try {
    const docCol = $app.findCollectionByNameOrId('inmo_documents');
    let modDoc = false;
    if (!docCol.fields.getByName('created')) {
      docCol.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
      modDoc = true;
    }
    if (!docCol.fields.getByName('updated')) {
      docCol.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
      modDoc = true;
    }
    if (modDoc) {
      $app.save(docCol);
      console.log('[GRAVY-INMO-MNT-DOC] Campos autodate agregados a inmo_documents.');
    }
  } catch (err) {
    console.log('[GRAVY-INMO-MNT-DOC] Aviso al verificar autodate inmo_documents: ' + err);
  }

  try {
    const mntCol = $app.findCollectionByNameOrId('inmo_maintenance');
    let modMnt = false;
    if (!mntCol.fields.getByName('created')) {
      mntCol.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
      modMnt = true;
    }
    if (!mntCol.fields.getByName('updated')) {
      mntCol.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
      modMnt = true;
    }
    if (modMnt) {
      $app.save(mntCol);
      console.log('[GRAVY-INMO-MNT-DOC] Campos autodate agregados a inmo_maintenance.');
    }
  } catch (err) {
    console.log('[GRAVY-INMO-MNT-DOC] Aviso al verificar autodate inmo_maintenance: ' + err);
  }
});
