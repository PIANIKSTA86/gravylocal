/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — Migración: Tratamiento de IVA Mayor Valor del Costo vs Descontable
 *
 * Asegura los campos requeridos en PocketBase para discriminar el IVA como mayor valor del costo:
 * - purchase_invoices: `iva_treatment` ("DESCONTABLE" | "MAYOR_COSTO" | "POR_LINEA"), `iva_cost_total` (number)
 * - purchase_invoice_lines: `iva_as_cost` (bool)
 * - tx_lines: `is_iva_cost` (bool)
 */

onBootstrap((e) => {
  e.next();

  // 1. purchase_invoices
  try {
    const col = $app.findCollectionByNameOrId('purchase_invoices');
    let changed = false;

    let hasIvaTreatment = false;
    try { hasIvaTreatment = !!col.fields.getByName('iva_treatment'); } catch (_) { hasIvaTreatment = String(col.fields || '').includes('iva_treatment'); }
    if (!hasIvaTreatment) {
      col.fields.add(new SelectField({
        name: 'iva_treatment',
        required: false,
        values: ['DESCONTABLE', 'MAYOR_COSTO', 'POR_LINEA']
      }));
      changed = true;
    }

    let hasIvaCostTotal = false;
    try { hasIvaCostTotal = !!col.fields.getByName('iva_cost_total'); } catch (_) { hasIvaCostTotal = String(col.fields || '').includes('iva_cost_total'); }
    if (!hasIvaCostTotal) {
      col.fields.add(new NumberField({ name: 'iva_cost_total', required: false, min: 0 }));
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log('[GRAVY] Campos iva_treatment y iva_cost_total agregados a purchase_invoices.');
    }
  } catch (err) {
    console.log('[GRAVY] Aviso al migrar purchase_invoices para tratamiento de IVA: ' + err);
  }

  // 2. purchase_invoice_lines
  try {
    const col = $app.findCollectionByNameOrId('purchase_invoice_lines');
    let changed = false;

    let hasIvaAsCost = false;
    try { hasIvaAsCost = !!col.fields.getByName('iva_as_cost'); } catch (_) { hasIvaAsCost = String(col.fields || '').includes('iva_as_cost'); }
    if (!hasIvaAsCost) {
      col.fields.add(new BoolField({ name: 'iva_as_cost', required: false }));
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log('[GRAVY] Campo iva_as_cost agregado a purchase_invoice_lines.');
    }
  } catch (err) {
    console.log('[GRAVY] Aviso al migrar purchase_invoice_lines para tratamiento de IVA: ' + err);
  }

  // 3. tx_lines
  try {
    const col = $app.findCollectionByNameOrId('tx_lines');
    let changed = false;

    let hasIsIvaCost = false;
    try { hasIsIvaCost = !!col.fields.getByName('is_iva_cost'); } catch (_) { hasIsIvaCost = String(col.fields || '').includes('is_iva_cost'); }
    if (!hasIsIvaCost) {
      col.fields.add(new BoolField({ name: 'is_iva_cost', required: false }));
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log('[GRAVY] Campo is_iva_cost agregado a tx_lines.');
    }
  } catch (err) {
    console.log('[GRAVY] Aviso al migrar tx_lines para tratamiento de IVA: ' + err);
  }
});
