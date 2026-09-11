/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — Migración: Conciliación Bancaria Avanzada, Cierres y Certificados
 *
 * Crea la colección `bank_reconciliations` para registrar y auditar los cierres formales
 * de conciliación bancaria y permitir la emisión de actas/certificados no transaccionales.
 * Además, enriquece `bank_accounts` y `bank_movements`.
 */

onBootstrap((e) => {
  e.next();

  let bankAccountsColId = '';
  let usersColId = '';
  let thirdPartiesColId = '';
  let txTypesColId = '';

  try { bankAccountsColId = $app.findCollectionByNameOrId('bank_accounts').id; } catch (_) {}
  try { usersColId = $app.findCollectionByNameOrId('users').id; } catch (_) {
    try { usersColId = $app.findCollectionByNameOrId('_pb_users_auth_').id; } catch (_2) {}
  }
  try { thirdPartiesColId = $app.findCollectionByNameOrId('third_parties').id; } catch (_) {}
  try { txTypesColId = $app.findCollectionByNameOrId('transaction_types').id; } catch (_) {}

  // 1. Colección bank_reconciliations
  let reconCol = null;
  try {
    reconCol = $app.findCollectionByNameOrId('bank_reconciliations');
  } catch (_) {
    try {
      console.log('[GRAVY] Creando colección bank_reconciliations...');
      const authRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'superadmin')";

      const fields = [
        { name: 'period_start',        type: 'text',   required: true },
        { name: 'period_end',          type: 'text',   required: true },
        { name: 'book_balance',        type: 'number', required: false },
        { name: 'bank_balance',        type: 'number', required: false },
        { name: 'difference',          type: 'number', required: false },
        { name: 'status',              type: 'select', required: true, values: ['draft', 'closed', 'reopened'] },
        { name: 'reconciled_count',    type: 'number', required: false },
        { name: 'pending_bank_count',  type: 'number', required: false },
        { name: 'pending_book_count',  type: 'number', required: false },
        { name: 'closed_at',           type: 'text',   required: false },
        { name: 'reopened_at',         type: 'text',   required: false },
        { name: 'notes',               type: 'text',   required: false },
        { name: 'snapshot_data',       type: 'json',   required: false },
      ];

      if (bankAccountsColId) {
        fields.unshift({
          name: 'bank_account_id',
          type: 'relation',
          required: true,
          collectionId: bankAccountsColId,
          cascadeDelete: false
        });
      }

      if (usersColId) {
        fields.push({
          name: 'closed_by',
          type: 'relation',
          required: false,
          collectionId: usersColId,
          cascadeDelete: false
        });
        fields.push({
          name: 'reopened_by',
          type: 'relation',
          required: false,
          collectionId: usersColId,
          cascadeDelete: false
        });
      }

      reconCol = new Collection({
        name: 'bank_reconciliations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: authRule,
        updateRule: authRule,
        deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'admin' || @request.auth.role = 'superadmin')",
        fields: fields,
      });

      $app.save(reconCol);
      console.log('[GRAVY] Colección bank_reconciliations creada exitosamente.');
    } catch (errRecon) {
      console.error('[GRAVY] Error creando colección bank_reconciliations:', errRecon);
    }
  }

  // 2. Enriquecer bank_accounts con third_party_id y default_tx_type_id
  try {
    const bankAccounts = $app.findCollectionByNameOrId('bank_accounts');
    let needsSaveBa = false;

    if (!bankAccounts.fields.getByName('third_party_id') && thirdPartiesColId) {
      bankAccounts.fields.add(new Field({
        name: 'third_party_id',
        type: 'relation',
        required: false,
        collectionId: thirdPartiesColId,
        cascadeDelete: false
      }));
      needsSaveBa = true;
    }

    if (!bankAccounts.fields.getByName('default_tx_type_id') && txTypesColId) {
      bankAccounts.fields.add(new Field({
        name: 'default_tx_type_id',
        type: 'relation',
        required: false,
        collectionId: txTypesColId,
        cascadeDelete: false
      }));
      needsSaveBa = true;
    }

    if (needsSaveBa) {
      $app.save(bankAccounts);
      console.log('[GRAVY] Campos third_party_id y default_tx_type_id añadidos a bank_accounts.');
    }
  } catch (errBa) {
    console.error('[GRAVY] Error actualizando campos de bank_accounts:', errBa);
  }

  // 3. Enriquecer bank_movements con reconciliation_id
  try {
    const bankMovements = $app.findCollectionByNameOrId('bank_movements');
    const reconColId = reconCol ? reconCol.id : (function() {
      try { return $app.findCollectionByNameOrId('bank_reconciliations').id; } catch(_) { return null; }
    })();

    if (!bankMovements.fields.getByName('reconciliation_id') && reconColId) {
      bankMovements.fields.add(new Field({
        name: 'reconciliation_id',
        type: 'relation',
        required: false,
        collectionId: reconColId,
        cascadeDelete: false
      }));
      $app.save(bankMovements);
      console.log('[GRAVY] Campo reconciliation_id añadido a bank_movements.');
    }
  } catch (errBmMov) {
    console.error('[GRAVY] Error actualizando campo reconciliation_id en bank_movements:', errBmMov);
  }
});
