/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — Migración: Notas a los Estados Financieros (Revelaciones)
 *
 * Crea la colección `financial_notes` que almacena el texto de cada nota
 * vinculada a los estados financieros (ESF y ER). Las notas se identifican
 * por (periodo, nota_num, tipo_informe) y pueden editarse en cualquier momento.
 *
 * Ejecutada una sola vez al arranque; si la colección ya existe, no hace nada.
 */

onBootstrap((e) => {
  e.next();

  // Evitar re-ejecución
  try {
    $app.findCollectionByNameOrId('financial_notes');
    return; // Ya existe
  } catch (_) {
    // Primera vez — continuar
  }

  // Obtener ID de colección de users para la relación updated_by
  let usersColId = '';
  try {
    usersColId = $app.findCollectionByNameOrId('users').id;
  } catch (_) {
    try { usersColId = $app.findCollectionByNameOrId('_pb_users_auth_').id; } catch (_2) {}
  }

  console.log('[GRAVY] Creando colección financial_notes (Notas a los EF)...');

  const authRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'superadmin')";

  const fields = [
    // Periodo: YYYY-MM  (ej: "2025-12")
    { name: 'periodo',       type: 'text',   required: true  },
    // Número de nota según el informe (1, 2, 3...)
    { name: 'nota_num',      type: 'number', required: true, min: 1 },
    // Tipo de informe al que pertenece la nota
    { name: 'tipo_informe',  type: 'select', required: true, values: ['ESF', 'ER'] },
    // Título del rubro (ej: "Disponible", "Deudores", "Ingresos operacionales")
    { name: 'titulo',        type: 'text',   required: true  },
    // Código de cuenta PUC raíz del rubro (ej: "11", "13", "41")
    // Permite regenerar sugerencias sin reprocesar el informe
    { name: 'cuenta_codigo', type: 'text',   required: false },
    // Texto completo de la revelación / nota redactada por el contador
    { name: 'contenido',     type: 'text',   required: false },
    // Texto sugerido automáticamente por el motor de reglas (snapshot)
    // Se guarda para que el contador vea de dónde vino la sugerencia
    { name: 'sugerido',      type: 'text',   required: false },
    // Flag: true si el contador aceptó o modificó la sugerencia
    { name: 'revisado',      type: 'bool',   required: false },
    // Quién hizo la última edición
  ];

  if (usersColId) {
    fields.push({
      name: 'updated_by',
      type: 'relation',
      required: false,
      collectionId: usersColId,
      cascadeDelete: false,
    });
  } else {
    fields.push({ name: 'updated_by', type: 'text', required: false });
  }

  const financialNotes = new Collection({
    name: 'financial_notes',
    type: 'base',
    listRule:   "@request.auth.id != ''",
    viewRule:   "@request.auth.id != ''",
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
    fields,
    // Clave única: un solo registro por (periodo, nota, tipo_informe)
    indexes: [
      'CREATE UNIQUE INDEX idx_fn_periodo_nota ON financial_notes (periodo, nota_num, tipo_informe)',
    ],
  });

  $app.save(financialNotes);
  console.log('[GRAVY] Colección financial_notes creada correctamente. ID: ' + financialNotes.id);
});
