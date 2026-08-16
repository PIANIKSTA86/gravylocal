/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_cost_revaluation.pb.js
 * Agrega campos de trazabilidad para la revalorización de costos de inventario:
 * - invoices.cost_corrected / cost_corrected_at: marca facturas cuyo asiento de
 *   costo/inventario fue corregido retroactivamente por la herramienta de
 *   Recálculo y Revalorización de Costos.
 * - inventory_movement_lines.original_unit_cost: preserva el costo con el que
 *   se posteó originalmente una SALIDA, antes de ser corregido.
 */

onBootstrap((e) => {
  e.next();

  try {
    const invoices = $app.findCollectionByNameOrId("invoices");
    let needsSaveInv = false;

    if (!invoices.fields.getByName("cost_corrected")) {
      invoices.fields.add(new Field({
        name: "cost_corrected",
        type: "bool",
        required: false,
      }));
      needsSaveInv = true;
    }

    if (!invoices.fields.getByName("cost_corrected_at")) {
      invoices.fields.add(new Field({
        name: "cost_corrected_at",
        type: "text",
        required: false,
      }));
      needsSaveInv = true;
    }

    if (needsSaveInv) {
      $app.save(invoices);
      console.log("[GRAVY-COST-REVAL] Campos cost_corrected/cost_corrected_at agregados a invoices.");
    }
  } catch (err) {
    console.error("[GRAVY-COST-REVAL] Error al modificar la colección invoices:", err);
  }

  try {
    const movLines = $app.findCollectionByNameOrId("inventory_movement_lines");
    let needsSaveLines = false;

    if (!movLines.fields.getByName("original_unit_cost")) {
      movLines.fields.add(new Field({
        name: "original_unit_cost",
        type: "number",
        required: false,
        min: 0,
      }));
      needsSaveLines = true;
    }

    if (needsSaveLines) {
      $app.save(movLines);
      console.log("[GRAVY-COST-REVAL] Campo original_unit_cost agregado a inventory_movement_lines.");
    }
  } catch (err) {
    console.error("[GRAVY-COST-REVAL] Error al modificar la colección inventory_movement_lines:", err);
  }
});
