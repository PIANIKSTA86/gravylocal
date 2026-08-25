/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_workflow_fields.pb.js
 * Asegura los campos de enlace entre Pedidos, Despachos, Facturas y Agenda.
 */

onBootstrap((e) => {
  e.next();

  // 1. Colección logistica_deliveries
  try {
    const col = $app.findCollectionByNameOrId("logistica_deliveries");
    let changed = false;

    // billing_status
    let billingStatusField = null;
    try { billingStatusField = col.fields.getByName("billing_status"); } catch (_) {}
    if (!billingStatusField) {
      col.fields.add(new SelectField({
        name: "billing_status",
        required: false,
        values: ["PENDIENTE_FACTURAR", "FACTURADO", "NO_APLICA"]
      }));
      changed = true;
    }

    // delivery_type
    let deliveryTypeField = null;
    try { deliveryTypeField = col.fields.getByName("delivery_type"); } catch (_) {}
    if (!deliveryTypeField) {
      col.fields.add(new SelectField({
        name: "delivery_type",
        required: false,
        values: ["DIRECTO", "DESDE_PEDIDO", "DESDE_IMPORTACION"]
      }));
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log("[GRAVY-WORKFLOW] Colección logistica_deliveries actualizada con billing_status y delivery_type.");
    }
  } catch (err) {
    console.log("[GRAVY-WORKFLOW] Info logistica_deliveries: " + err);
  }

  // 2. Colección sales_orders
  try {
    const col = $app.findCollectionByNameOrId("sales_orders");
    let changed = false;

    // delivery_id
    let deliveriesColId = "";
    try { deliveriesColId = $app.findCollectionByNameOrId("logistica_deliveries").id; } catch (_) {}

    let deliveryIdField = null;
    try { deliveryIdField = col.fields.getByName("delivery_id"); } catch (_) {}
    if (!deliveryIdField && deliveriesColId) {
      col.fields.add(new RelationField({
        name: "delivery_id",
        collectionId: deliveriesColId,
        required: false,
        cascadeDelete: false,
        maxSelect: 1
      }));
      changed = true;
    }

    // fulfillment_status
    let fulfillmentStatusField = null;
    try { fulfillmentStatusField = col.fields.getByName("fulfillment_status"); } catch (_) {}
    if (fulfillmentStatusField && fulfillmentStatusField.values) {
      const needed = ["SIN_GESTION", "RESERVADO_IMPORTACION", "PENDIENTE_ENTREGA", "EN_DESPACHO", "PARCIAL_ENTREGADO", "ENTREGADO", "FACTURADO"];
      const currentValues = Array.from(fulfillmentStatusField.values);
      for (const val of needed) {
        if (!currentValues.includes(val)) {
          currentValues.push(val);
          changed = true;
        }
      }
      fulfillmentStatusField.values = currentValues;
    }

    if (changed) {
      $app.save(col);
      console.log("[GRAVY-WORKFLOW] Colección sales_orders actualizada con delivery_id y fulfillment_status.");
    }
  } catch (err) {
    console.log("[GRAVY-WORKFLOW] Info sales_orders: " + err);
  }

  // 3. Colección invoices
  try {
    const col = $app.findCollectionByNameOrId("invoices");
    let changed = false;

    let deliveriesColId = "";
    try { deliveriesColId = $app.findCollectionByNameOrId("logistica_deliveries").id; } catch (_) {}

    let deliveryIdField = null;
    try { deliveryIdField = col.fields.getByName("delivery_id"); } catch (_) {}
    if (!deliveryIdField && deliveriesColId) {
      col.fields.add(new RelationField({
        name: "delivery_id",
        collectionId: deliveriesColId,
        required: false,
        cascadeDelete: false,
        maxSelect: 1
      }));
      changed = true;
    }

    if (changed) {
      $app.save(col);
      console.log("[GRAVY-WORKFLOW] Colección invoices actualizada con delivery_id.");
    }
  } catch (err) {
    console.log("[GRAVY-WORKFLOW] Info invoices: " + err);
  }
});
