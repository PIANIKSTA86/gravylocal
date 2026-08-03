/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_comisiones.pb.js
 * Módulo de Comisiones: Vendedores, reglas de comisión y relaciones en facturas.
 */

onBootstrap((e) => {
  e.next();

  let tpCol;
  try {
    tpCol = $app.findCollectionByNameOrId("third_parties");
  } catch (err) {
    console.log("[GRAVY-COMISIONES] Error: no se pudo obtener la colección third_parties: " + err);
    return;
  }



  // 2. Agregar campos seller_id, commission_rate y commission_amount a invoices
  try {
    const invoices = $app.findCollectionByNameOrId("invoices");
    let needsSaveInv = false;

    if (!invoices.fields.getByName("seller_id")) {
      invoices.fields.add(new Field({
        name: "seller_id",
        type: "relation",
        required: false,
        collectionId: tpCol.id,
        cascadeDelete: false
      }));
      needsSaveInv = true;
    }

    if (!invoices.fields.getByName("commission_rate")) {
      invoices.fields.add(new Field({
        name: "commission_rate",
        type: "number",
        required: false,
        min: 0
      }));
      needsSaveInv = true;
    }

    if (!invoices.fields.getByName("commission_amount")) {
      invoices.fields.add(new Field({
        name: "commission_amount",
        type: "number",
        required: false,
        min: 0
      }));
      needsSaveInv = true;
    }

    if (needsSaveInv) {
      $app.save(invoices);
      console.log("[GRAVY-COMISIONES] Campos de vendedor y comisión agregados a invoices.");
    }
  } catch (err) {
    console.error("[GRAVY-COMISIONES] Error al modificar la colección invoices:", err);
  }

  // 3. Crear colección commission_rules si no existe
  try {
    $app.findCollectionByNameOrId("commission_rules");
    // Ya existe
  } catch (_) {
    try {
      const productsId = $app.findCollectionByNameOrId("products").id;
      
      const commissionRules = new Collection({
        name: "commission_rules",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')",
        updateRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')",
        deleteRule: "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')",
        fields: [
          { name: "name", type: "text", required: true },
          { name: "type", type: "select", required: true, values: ["total_sale", "per_product"] },
          { name: "rate", type: "number", required: true, min: 0 },
          { name: "product_id", type: "relation", required: false, collectionId: productsId, cascadeDelete: false },
          { name: "seller_id", type: "relation", required: false, collectionId: tpCol.id, cascadeDelete: false },
          { name: "active", type: "bool", required: false }
        ]
      });
      $app.save(commissionRules);
      console.log("[GRAVY-COMISIONES] Colección commission_rules creada con éxito.");
    } catch (err) {
      console.error("[GRAVY-COMISIONES] Error al crear la colección commission_rules:", err);
    }
  }
});
