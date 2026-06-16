/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_inmobiliarias.pb.js
 * F9: Inmobiliarias — Gestión de Inmuebles, Contratos y Arriendos.
 * Crea colecciones de inmobiliaria si no existen de forma idempotente.
 * Siembra tipo de transacción IA (Factura Arriendo Inmobiliaria).
 */

onBootstrap((e) => {
  e.next();

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
    console.log('[GRAVY-INMO] Aviso: no se pudo obtener IDs de colecciones base: ' + err);
    return;
  }

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador')";

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: inmo_properties — Inmuebles
  // ──────────────────────────────────────────────────────────
  let inmoPropertiesId = '';
  try {
    inmoPropertiesId = $app.findCollectionByNameOrId('inmo_properties').id;
  } catch (_) {
    const inmoProperties = new Collection({
      name: 'inmo_properties',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: writeRule,
      updateRule: writeRule,
      deleteRule: deleteRule,
      fields: [
        { name: 'code',            type: 'text',     required: true  },
        { name: 'title',           type: 'text',     required: true  },
        { name: 'type',            type: 'select',   required: true,
          values: ['CASA', 'APARTAMENTO', 'LOCAL', 'BODEGA', 'OFICINA', 'LOTE', 'OTRO'] },
        { name: 'address',         type: 'text',     required: false },
        { name: 'city',            type: 'text',     required: false },
        { name: 'owner_id',        type: 'relation', required: true,
          collectionId: thirdPartiesId, cascadeDelete: false },
        { name: 'rental_price',    type: 'number',   required: false, min: 0 },
        { name: 'sale_price',      type: 'number',   required: false, min: 0 },
        { name: 'commission_rate', type: 'number',   required: false, min: 0, max: 100 },
        { name: 'status',          type: 'select',   required: true,
          values: ['DISPONIBLE', 'ARRENDADO', 'VENDIDO', 'MANTENIMIENTO'] },
        { name: 'notes',           type: 'text',     required: false },
        { name: 'active',          type: 'bool',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_inmo_prop_code ON inmo_properties (code)'],
    });
    $app.save(inmoProperties);
    inmoPropertiesId = inmoProperties.id;
    console.log('[GRAVY-INMO] Colección inmo_properties creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: inmo_contracts — Contratos
  // ──────────────────────────────────────────────────────────
  let inmoContractsId = '';
  try {
    inmoContractsId = $app.findCollectionByNameOrId('inmo_contracts').id;
  } catch (_) {
    const inmoContracts = new Collection({
      name: 'inmo_contracts',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: writeRule,
      updateRule: writeRule,
      deleteRule: deleteRule,
      fields: [
        { name: 'number',               type: 'text',     required: true  },
        { name: 'property_id',          type: 'relation', required: true,
          collectionId: inmoPropertiesId, cascadeDelete: false },
        { name: 'tenant_id',            type: 'relation', required: true,
          collectionId: thirdPartiesId, cascadeDelete: false },
        { name: 'start_date',           type: 'text',     required: true  },
        { name: 'end_date',             type: 'text',     required: true  },
        { name: 'monthly_rent',         type: 'number',   required: true, min: 0 },
        { name: 'increment_percentage', type: 'number',   required: false, min: 0, max: 100 },
        { name: 'status',               type: 'select',   required: true,
          values: ['VIGENTE', 'FINALIZADO', 'SUSPENDIDO'] },
        { name: 'notes',                type: 'text',     required: false },
        { name: 'active',               type: 'bool',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_inmo_contract_num ON inmo_contracts (number)'],
    });
    $app.save(inmoContracts);
    inmoContractsId = inmoContracts.id;
    console.log('[GRAVY-INMO] Colección inmo_contracts creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: inmo_invoices — Facturas de Arriendo
  // ──────────────────────────────────────────────────────────
  let inmoInvoicesId = '';
  try {
    inmoInvoicesId = $app.findCollectionByNameOrId('inmo_invoices').id;
  } catch (_) {
    const inmoInvoices = new Collection({
      name: 'inmo_invoices',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: writeRule,
      updateRule: writeRule,
      deleteRule: deleteRule,
      fields: [
        { name: 'number',            type: 'text',     required: true  },
        { name: 'period',            type: 'text',     required: true  },
        { name: 'contract_id',       type: 'relation', required: true,
          collectionId: inmoContractsId, cascadeDelete: false },
        { name: 'date',              type: 'text',     required: true  },
        { name: 'due_date',          type: 'text',     required: false },
        { name: 'rent_amount',       type: 'number',   required: true, min: 0 },
        { name: 'other_amount',      type: 'number',   required: false, min: 0 },
        { name: 'commission_amount', type: 'number',   required: false, min: 0 },
        { name: 'net_to_owner',      type: 'number',   required: false, min: 0 },
        { name: 'total',             type: 'number',   required: true, min: 0 },
        { name: 'status',            type: 'select',   required: true,
          values: ['draft', 'posted', 'paid', 'voided'] },
        { name: 'tx_id',             type: 'relation', required: false,
          collectionId: transactionsId, cascadeDelete: false },
        { name: 'payout_tx_id',      type: 'relation', required: false,
          collectionId: transactionsId, cascadeDelete: false },
        { name: 'notes',             type: 'text',     required: false },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_inmo_inv_num ON inmo_invoices (number)'],
    });
    $app.save(inmoInvoices);
    inmoInvoicesId = inmoInvoices.id;
    console.log('[GRAVY-INMO] Colección inmo_invoices creada.');
  }

  // ──────────────────────────────────────────────────────────
  // COLECCIÓN: inmo_invoice_lines — Líneas de Factura Arriendo
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId('inmo_invoice_lines');
  } catch (_) {
    const inmoInvoiceLines = new Collection({
      name: 'inmo_invoice_lines',
      type: 'base',
      listRule:   "@request.auth.id != ''",
      viewRule:   "@request.auth.id != ''",
      createRule: writeRule,
      updateRule: writeRule,
      deleteRule: deleteRule,
      fields: [
        { name: 'invoice_id',   type: 'relation', required: true,
          collectionId: inmoInvoicesId, cascadeDelete: true },
        { name: 'description',  type: 'text',     required: true },
        { name: 'amount',       type: 'number',   required: true, min: 0 },
        { name: 'account_code', type: 'text',     required: false },
        { name: 'line_order',   type: 'number',   required: false },
      ],
    });
    $app.save(inmoInvoiceLines);
    console.log('[GRAVY-INMO] Colección inmo_invoice_lines creada.');
  }

  // ──────────────────────────────────────────────────────────
  // TIPO DE TRANSACCIÓN: IA — Factura Arriendo Inmobiliaria
  // ──────────────────────────────────────────────────────────
  try {
    const existing = $app.findFirstRecordByFilter(
      'transaction_types',
      'code="IA" && prefix="IA"'
    );
    existing; // silence warning
  } catch (_) {
    try {
      const ttCol = $app.findCollectionByNameOrId('transaction_types');
      const iaType = new Record(ttCol, {
        code:        'IA',
        prefix:      'IA',
        name:        'Factura Arriendo Inmobiliaria',
        description: 'Facturación mensual de arriendos e intermediación inmobiliaria',
        consecutive:  0,
        active:       true,
      });
      $app.save(iaType);
      console.log('[GRAVY-INMO] Tipo de transacción IA creado.');
    } catch (err2) {
      console.log('[GRAVY-INMO] Aviso al crear tipo IA: ' + err2);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Índices adicionales y consecutivo
  // ──────────────────────────────────────────────────────────
  try {
    $app.nonconcurrentDB()
      .newQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_inmo_prop_code ON inmo_properties (code)')
      .execute();
    $app.nonconcurrentDB()
      .newQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_inmo_contract_num ON inmo_contracts (number)')
      .execute();
    $app.nonconcurrentDB()
      .newQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_inmo_inv_num ON inmo_invoices (number)')
      .execute();
  } catch (err) {
    console.log('[GRAVY-INMO] Aviso al crear índices únicos Inmobiliaria: ' + err);
  }

  console.log('[GRAVY-INMO] Migración Inmobiliaria completada.');
});
