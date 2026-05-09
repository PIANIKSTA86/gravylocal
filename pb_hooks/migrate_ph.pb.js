/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_ph.pb.js
 * F8: Copropiedades — Propiedad Horizontal
 * Crea colecciones PH si no existen (idempotente).
 * Siembra tipo de transacción CF (Cuota Fondo / Facturación PH).
 */

onBootstrap((e) => {
  e.next();

  // ── Obtener IDs de colecciones base ya existentes ──────────
  let accountsId     = '';
  let thirdPartiesId = '';
  let transactionsId = '';
  let txTypesId      = '';

  try {
    accountsId     = $app.findCollectionByNameOrId('accounts').id;
    thirdPartiesId = $app.findCollectionByNameOrId('third_parties').id;
    transactionsId = $app.findCollectionByNameOrId('transactions').id;
    txTypesId      = $app.findCollectionByNameOrId('transaction_types').id;
  } catch (err) {
    console.log('[GRAVY-PH] Aviso: no se pudo obtener IDs de colecciones base: ' + err);
    return;
  }

  // Normalizar permisos de settings para roles con canWrite.
  try {
    const settingsCol = $app.findCollectionByNameOrId('settings');
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
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
      console.log('[GRAVY-PH] Reglas de settings sincronizadas con canWrite.');
    }
  } catch (err) {
    console.log('[GRAVY-PH] Aviso al normalizar settings: ' + err);
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_properties — Unidades habitacionales
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('ph_properties');
    // ya existe
  } catch (_) {
    const phProperties = new Collection({
      name: 'ph_properties',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: 'code',               type: 'text',     required: true  },
        { name: 'name',               type: 'text',     required: true  },
        { name: 'unit_type',          type: 'select',   required: true,
          values: ['APARTAMENTO', 'PARQUEADERO', 'DEPOSITO', 'LOCAL', 'CASA', 'OFICINA', 'OTRO'] },
        { name: 'floor',              type: 'text',     required: false },
        { name: 'tower',              type: 'text',     required: false },
        { name: 'area_m2',            type: 'number',   required: false, min: 0 },
        { name: 'coef_participacion', type: 'number',   required: false, min: 0, max: 100 },
        { name: 'owner_id',           type: 'relation', required: false,
          collectionId: thirdPartiesId, cascadeDelete: false },
        { name: 'occupant_id',        type: 'relation', required: false,
          collectionId: thirdPartiesId, cascadeDelete: false },
        { name: 'notes',              type: 'text',     required: false },
        { name: 'active',             type: 'bool',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_ph_prop_code ON ph_properties (code)'],
    });
    $app.save(phProperties);
    console.log('[GRAVY-PH] Colección ph_properties creada.');
  }

  // Normalizar ph_properties si ya existía: reglas y campos nuevos.
  try {
    const phProperties = $app.findCollectionByNameOrId('ph_properties');
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
    const existing = new Set(phProperties.fields.fieldNames());
    let changed = false;

    if (phProperties.createRule !== writeRule) {
      phProperties.createRule = writeRule;
      changed = true;
    }
    if (phProperties.updateRule !== writeRule) {
      phProperties.updateRule = writeRule;
      changed = true;
    }

    if (!existing.has('tower')) {
      phProperties.fields.add(new TextField({ name: 'tower', required: false }));
      changed = true;
    }
    if (!existing.has('apartment')) {
      phProperties.fields.add(new TextField({ name: 'apartment', required: false }));
      changed = true;
    }
    if (!existing.has('admin_fee')) {
      phProperties.fields.add(new NumberField({ name: 'admin_fee', required: false, min: 0 }));
      changed = true;
    }

    if (changed) {
      $app.save(phProperties);
      console.log('[GRAVY-PH] Colección ph_properties actualizada: reglas/campos sincronizados.');
    }
  } catch (err) {
    console.log('[GRAVY-PH] Aviso al normalizar ph_properties: ' + err);
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_common_areas — Zonas comunes
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('ph_common_areas');
  } catch (_) {
    const phCommonAreas = new Collection({
      name: 'ph_common_areas',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: 'code',        type: 'text',   required: true  },
        { name: 'name',        type: 'text',   required: true  },
        { name: 'description', type: 'text',   required: false },
        { name: 'capacity',    type: 'number', required: false, min: 0 },
        { name: 'min_hours',   type: 'number', required: false, min: 0 },
        { name: 'max_hours',   type: 'number', required: false, min: 0 },
        { name: 'rules',       type: 'text',   required: false },
        { name: 'active',      type: 'bool',   required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_ph_area_code ON ph_common_areas (code)'],
    });
    $app.save(phCommonAreas);
    console.log('[GRAVY-PH] Colección ph_common_areas creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_billing_concepts — Conceptos de facturación
  // ──────────────────────────────────────────────────────────
  let phBillingConceptsId = '';
  try {
    phBillingConceptsId = $app.findCollectionByNameOrId('ph_billing_concepts').id;
  } catch (_) {
    const phBillingConcepts = new Collection({
      name: 'ph_billing_concepts',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: 'code',            type: 'text',     required: true  },
        { name: 'name',            type: 'text',     required: true  },
        { name: 'description',     type: 'text',     required: false },
        { name: 'amount',          type: 'number',   required: true,  min: 0 },
        { name: 'is_variable',     type: 'bool',     required: false },
        { name: 'applies_coef',    type: 'bool',     required: false },
        { name: 'account_id',      type: 'relation', required: false,
          collectionId: accountsId, cascadeDelete: false },
        { name: 'active',          type: 'bool',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_ph_concept_code ON ph_billing_concepts (code)'],
    });
    $app.save(phBillingConcepts);
    phBillingConceptsId = phBillingConcepts.id;
    console.log('[GRAVY-PH] Colección ph_billing_concepts creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_invoices — Facturas de copropiedad
  // ──────────────────────────────────────────────────────────
  let phInvoicesId = '';
  try {
    phInvoicesId = $app.findCollectionByNameOrId('ph_invoices').id;
  } catch (_) {
    const phPropertiesId2 = $app.findCollectionByNameOrId('ph_properties').id;
    const phInvoices = new Collection({
      name: 'ph_invoices',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: 'number',       type: 'text',     required: true  },
        { name: 'period',       type: 'text',     required: true  },
        { name: 'property_id',  type: 'relation', required: true,
          collectionId: phPropertiesId2, cascadeDelete: false },
        { name: 'date',         type: 'text',     required: true  },
        { name: 'due_date',     type: 'text',     required: false },
        { name: 'subtotal',     type: 'number',   required: false, min: 0 },
        { name: 'total',        type: 'number',   required: false, min: 0 },
        { name: 'status',       type: 'select',   required: false,
          values: ['draft', 'posted', 'paid', 'voided'] },
        { name: 'tx_id',        type: 'relation', required: false,
          collectionId: transactionsId, cascadeDelete: false },
        { name: 'notes',        type: 'text',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_ph_inv_number ON ph_invoices (number)'],
    });
    $app.save(phInvoices);
    phInvoicesId = phInvoices.id;
    console.log('[GRAVY-PH] Colección ph_invoices creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_invoice_lines — Líneas de factura PH
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('ph_invoice_lines');
  } catch (_) {
    if (!phInvoicesId) {
      try { phInvoicesId = $app.findCollectionByNameOrId('ph_invoices').id; } catch (_2) {}
    }
    if (!phBillingConceptsId) {
      try { phBillingConceptsId = $app.findCollectionByNameOrId('ph_billing_concepts').id; } catch (_2) {}
    }
    const phInvoiceLines = new Collection({
      name: 'ph_invoice_lines',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: 'invoice_id',  type: 'relation', required: true,
          collectionId: phInvoicesId, cascadeDelete: true },
        { name: 'concept_id',  type: 'relation', required: false,
          collectionId: phBillingConceptsId, cascadeDelete: false },
        { name: 'description', type: 'text',     required: true  },
        { name: 'amount',      type: 'number',   required: true,  min: 0 },
        { name: 'line_order',  type: 'number',   required: false },
      ],
    });
    $app.save(phInvoiceLines);
    console.log('[GRAVY-PH] Colección ph_invoice_lines creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_reservations — Reservas de zonas comunes

    // Normalizar ph_invoice_lines: campo account_code para override contable.
    try {
      const phIL = $app.findCollectionByNameOrId('ph_invoice_lines');
      if (!new Set(phIL.fields.fieldNames()).has('account_code')) {
        phIL.fields.add(new TextField({ name: 'account_code', required: false }));
        $app.save(phIL);
        console.log('[GRAVY-PH] ph_invoice_lines: campo account_code agregado.');
      }
    } catch (err) {
      console.log('[GRAVY-PH] Aviso al normalizar ph_invoice_lines: ' + err);
    }

  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('ph_reservations');
  } catch (_) {
    let phPropertiesId3 = '';
    let phCommonAreasId = '';
    try { phPropertiesId3  = $app.findCollectionByNameOrId('ph_properties').id;   } catch (_2) {}
    try { phCommonAreasId  = $app.findCollectionByNameOrId('ph_common_areas').id; } catch (_2) {}

    const phReservations = new Collection({
      name: 'ph_reservations',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      fields: [
        { name: 'area_id',      type: 'relation', required: true,
          collectionId: phCommonAreasId, cascadeDelete: false },
        { name: 'property_id',  type: 'relation', required: true,
          collectionId: phPropertiesId3, cascadeDelete: false },
        { name: 'date',         type: 'text',     required: true  },
        { name: 'time_from',    type: 'text',     required: true  },
        { name: 'time_to',      type: 'text',     required: true  },
        { name: 'status',       type: 'select',   required: false,
          values: ['pending', 'confirmed', 'cancelled'] },
        { name: 'attendees',    type: 'number',   required: false, min: 0 },
        { name: 'notes',        type: 'text',     required: false },
      ],
    });
    $app.save(phReservations);
    console.log('[GRAVY-PH] Colección ph_reservations creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_pqrs — Peticiones, Quejas, Reclamos, Sugerencias
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('ph_pqrs');
  } catch (_) {
    let phPropertiesId4 = '';
    try { phPropertiesId4 = $app.findCollectionByNameOrId('ph_properties').id; } catch (_2) {}

    const phPqrs = new Collection({
      name: 'ph_pqrs',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role != 'auditor' && @request.auth.role != 'viewer')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && @request.auth.role = 'admin'",
      fields: [
        { name: 'number',      type: 'text',     required: true  },
        { name: 'property_id', type: 'relation', required: false,
          collectionId: phPropertiesId4, cascadeDelete: false },
        { name: 'pqrs_type',   type: 'select',   required: true,
          values: ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA', 'FELICITACION'] },
        { name: 'priority',    type: 'select',   required: false,
          values: ['baja', 'media', 'alta'] },
        { name: 'subject',     type: 'text',     required: true  },
        { name: 'description', type: 'text',     required: true  },
        { name: 'status',      type: 'select',   required: false,
          values: ['open', 'in_process', 'resolved', 'closed'] },
        { name: 'response',    type: 'text',     required: false },
        { name: 'opened_at',   type: 'text',     required: false },
        { name: 'closed_at',   type: 'text',     required: false },
        { name: 'assigned_to', type: 'text',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_ph_pqrs_number ON ph_pqrs (number)'],
    });
    $app.save(phPqrs);
    console.log('[GRAVY-PH] Colección ph_pqrs creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: ph_individual_charges — Cobros individuales
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('ph_individual_charges');
  } catch (_) {
    let phPropertiesId2 = '';
    try { phPropertiesId2 = $app.findCollectionByNameOrId('ph_properties').id; } catch (_2) {}
    const phIndividualCharges = new Collection({
      name: 'ph_individual_charges',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')",
      fields: [
        { name: 'property_id',   type: 'relation', required: true,
          collectionId: phPropertiesId2, cascadeDelete: false },
        { name: 'description',   type: 'text',     required: true  },
        { name: 'amount',        type: 'number',   required: true, min: 0 },
        { name: 'period',        type: 'text',     required: true  },
        { name: 'notes',         type: 'text',     required: false },
      ],
    });
    $app.save(phIndividualCharges);
    console.log('[GRAVY-PH] Colección ph_individual_charges creada.');
  }

  // Normalizar permisos de colecciones de configuración PH con canWrite.

    // Normalizar esquema de ph_individual_charges: conceptos individuales manuales.
    try {
      const phIC = $app.findCollectionByNameOrId('ph_individual_charges');
      const icFields = new Set(phIC.fields.fieldNames());
      let icChanged = false;
      if (!icFields.has('name')) {
        phIC.fields.add(new TextField({ name: 'name', required: false }));
        icChanged = true;
      }
      if (!icFields.has('account_code')) {
        phIC.fields.add(new TextField({ name: 'account_code', required: false }));
        icChanged = true;
      }
      if (!icFields.has('active')) {
        phIC.fields.add(new BoolField({ name: 'active', required: false }));
        icChanged = true;
      }
      // Hacer property_id opcional (ya no es necesario para conceptos globales)
      try {
        const propIdField = phIC.fields.getByName('property_id');
        if (propIdField && propIdField.required) {
          propIdField.required = false;
          icChanged = true;
        }
      } catch (_f) {}
      // Hacer period opcional
      try {
        const periodField = phIC.fields.getByName('period');
        if (periodField && periodField.required) {
          periodField.required = false;
          icChanged = true;
        }
      } catch (_f) {}
      // Hacer description opcional (ahora usamos name como principal)
      try {
        const descField = phIC.fields.getByName('description');
        if (descField && descField.required) {
          descField.required = false;
          icChanged = true;
        }
      } catch (_f) {}
      // Hacer amount opcional (valor de referencia)
      try {
        const amountField = phIC.fields.getByName('amount');
        if (amountField && amountField.required) {
          amountField.required = false;
          icChanged = true;
        }
      } catch (_f) {}
      if (icChanged) {
        $app.save(phIC);
        console.log('[GRAVY-PH] ph_individual_charges: esquema actualizado a conceptos individuales.');
      }
    } catch (err) {
      console.log('[GRAVY-PH] Aviso al normalizar ph_individual_charges: ' + err);
    }

  try {
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
    const writableCollections = ['ph_common_areas', 'ph_billing_concepts', 'ph_individual_charges'];
    let adjusted = 0;
    for (const cname of writableCollections) {
      try {
        const col = $app.findCollectionByNameOrId(cname);
        let changed = false;
        if (col.createRule !== writeRule) {
          col.createRule = writeRule;
          changed = true;
        }
        if (col.updateRule !== writeRule) {
          col.updateRule = writeRule;
          changed = true;
        }
        if (changed) {
          $app.save(col);
          adjusted++;
        }
      } catch (_inner) {}
    }
    if (adjusted > 0) {
      console.log('[GRAVY-PH] Reglas sincronizadas (canWrite) en colecciones de configuración PH: ' + adjusted);
    }
  } catch (err) {
    console.log('[GRAVY-PH] Aviso al normalizar permisos de configuración PH: ' + err);
  }

  // Normalizar permisos de facturación PH para roles con canWrite.
  try {
    const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
    const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')";
    const billingCollections = ['ph_invoices', 'ph_invoice_lines'];
    let adjustedBilling = 0;
    for (const cname of billingCollections) {
      try {
        const col = $app.findCollectionByNameOrId(cname);
        let changed = false;
        if (col.createRule !== writeRule) {
          col.createRule = writeRule;
          changed = true;
        }
        if (col.updateRule !== writeRule) {
          col.updateRule = writeRule;
          changed = true;
        }
        if (col.deleteRule !== deleteRule) {
          col.deleteRule = deleteRule;
          changed = true;
        }
        if (changed) {
          $app.save(col);
          adjustedBilling++;
        }
      } catch (_inner) {}
    }
    if (adjustedBilling > 0) {
      console.log('[GRAVY-PH] Reglas sincronizadas (canWrite) en colecciones de facturación PH: ' + adjustedBilling);
    }
  } catch (err) {
    console.log('[GRAVY-PH] Aviso al normalizar permisos de facturación PH: ' + err);
  }

  // Normalizar permisos de reservas para app móvil de propietarios.
  try {
    const reservationsCol = $app.findCollectionByNameOrId('ph_reservations');
    const reservationsCreateRule = "@request.auth.collectionName = 'users' && @request.auth.id != ''";
    const reservationsUpdateRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')";
    const reservationsDeleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')";

    let changedReservations = false;
    if (reservationsCol.createRule !== reservationsCreateRule) {
      reservationsCol.createRule = reservationsCreateRule;
      changedReservations = true;
    }
    if (reservationsCol.updateRule !== reservationsUpdateRule) {
      reservationsCol.updateRule = reservationsUpdateRule;
      changedReservations = true;
    }
    if (reservationsCol.deleteRule !== reservationsDeleteRule) {
      reservationsCol.deleteRule = reservationsDeleteRule;
      changedReservations = true;
    }

    if (changedReservations) {
      $app.save(reservationsCol);
      console.log('[GRAVY-PH] Reglas sincronizadas para ph_reservations (create habilitado para usuarios autenticados).');
    }
  } catch (err) {
    console.log('[GRAVY-PH] Aviso al normalizar permisos de reservas PH: ' + err);
  }

  // ──────────────────────────────────────────────────────────
  // TIPO DE TRANSACCIÓN: CF — Cuota Facturación PH
  // ──────────────────────────────────────────────────────────
  try {
    const existing = $app.findFirstRecordByFilter(
      'transaction_types',
      'code="CF" && prefix="CF"'
    );
    // ya existe
    existing; // silence unused var
  } catch (_) {
    try {
      const ttCol = $app.findCollectionByNameOrId('transaction_types');
      const cfType = new Record(ttCol, {
        code:        'CF',
        prefix:      'CF',
        name:        'Cuota Facturación PH',
        description: 'Facturas mensuales de propiedad horizontal (cuota de administración y conceptos)',
        consecutive:  0,
        active:       true,
      });
      $app.save(cfType);
      console.log('[GRAVY-PH] Tipo de transacción CF creado.');
    } catch (err2) {
      console.log('[GRAVY-PH] Aviso al crear tipo CF: ' + err2);
    }
  }

  // ──────────────────────────────────────────────────────────
  // CONSECUTIVO ph_invoices y ph_pqrs
  // ──────────────────────────────────────────────────────────
  try {
    $app.nonconcurrentDB()
      .newQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_ph_inv_number ON ph_invoices (number)')
      .execute();
    $app.nonconcurrentDB()
      .newQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_ph_pqrs_number ON ph_pqrs (number)')
      .execute();
  } catch (err) {
    console.log('[GRAVY-PH] Aviso al crear índices únicos PH: ' + err);
  }

  console.log('[GRAVY-PH] Migración Copropiedades completada.');
});
