/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_employee_bank_fields.pb.js
 * Migración: asegura la existencia de campos bancarios y método de pago en third_parties
 * para la nómina electrónica DIAN y gestión general de pagos a empleados/proveedores.
 */

onBootstrap((e) => {
  e.next();

  try {
    const col = $app.findCollectionByNameOrId('third_parties');
    const existing = new Set(col.fields.fieldNames());
    let changed = false;

    if (!existing.has('bank_name')) {
      col.fields.add(new Field({ name: 'bank_name', type: 'text', required: false }));
      changed = true;
    }

    if (!existing.has('bank_account')) {
      col.fields.add(new Field({ name: 'bank_account', type: 'text', required: false }));
      changed = true;
    }

    if (!existing.has('bank_account_type')) {
      col.fields.add(new Field({
        name: 'bank_account_type',
        type: 'select',
        required: false,
        values: ['Ahorros', 'Corriente']
      }));
      changed = true;
    }

    if (!existing.has('payment_method')) {
      col.fields.add(new Field({
        name: 'payment_method',
        type: 'select',
        required: false,
        values: ['10', '30', '47', '42']
      }));
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log('[GRAVY] Migración third_parties: campos de banco, cuenta, tipo de cuenta y método de pago asegurados.');
    }
  } catch (err) {
    console.error('[GRAVY] Error al migrar campos bancarios en third_parties:', String(err));
  }
});
