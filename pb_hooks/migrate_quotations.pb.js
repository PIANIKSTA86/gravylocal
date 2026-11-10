/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_quotations.pb.js
 * Crea y asegura las colecciones dedicadas para Cotizaciones (quotations y quotation_lines).
 * Permite separar físicamente las cotizaciones de los pedidos para preservar correlativos,
 * estados formales de vigencia (draft, sent, accepted, rejected, expired, converted) y vinculación de seguimiento.
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let salesOrdersId = "";
  let invoicesId = "";
  let productsId = "";
  let usersId = "";
  let crmDealsId = "";

  try { thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id; } catch (_) {}
  try { salesOrdersId = $app.findCollectionByNameOrId("sales_orders").id; } catch (_) {}
  try { invoicesId = $app.findCollectionByNameOrId("invoices").id; } catch (_) {}
  try { productsId = $app.findCollectionByNameOrId("products").id; } catch (_) {}
  try { usersId = $app.findCollectionByNameOrId("users").id; } catch (_) {}
  try { crmDealsId = $app.findCollectionByNameOrId("crm_deals").id; } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'vendedor')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // 1. Colección quotations
  let quotationsId = "";
  try {
    quotationsId = $app.findCollectionByNameOrId("quotations").id;
  } catch (_) {
    try {
      const fields = [
        { name: "number", type: "text", required: true },
        { name: "customer_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
        { name: "date", type: "text", required: true },
        { name: "due_date", type: "text", required: false },
        { name: "validity_days", type: "number", required: false },
        { name: "status", type: "select", required: true, values: ["draft", "sent", "accepted", "rejected", "expired", "converted_order", "converted_invoice", "cancelled"] },
        { name: "notes", type: "text", required: false },
        { name: "subtotal", type: "number", required: false },
        { name: "iva_total", type: "number", required: false },
        { name: "discount_amount", type: "number", required: false },
        { name: "total", type: "number", required: false }
      ];

      if (salesOrdersId) {
        fields.push({ name: "sales_order_id", type: "relation", required: false, collectionId: salesOrdersId, cascadeDelete: false, maxSelect: 1 });
      }
      if (invoicesId) {
        fields.push({ name: "invoice_id", type: "relation", required: false, collectionId: invoicesId, cascadeDelete: false, maxSelect: 1 });
      }
      if (crmDealsId) {
        fields.push({ name: "deal_id", type: "relation", required: false, collectionId: crmDealsId, cascadeDelete: false, maxSelect: 1 });
      }
      if (usersId) {
        fields.push({ name: "user_id", type: "relation", required: false, collectionId: usersId, cascadeDelete: false, maxSelect: 1 });
      }
      if (thirdPartiesId) {
        fields.push({ name: "seller_id", type: "relation", required: false, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 });
      }

      fields.push({ name: "created", type: "autodate", onCreate: true, onUpdate: false });
      fields.push({ name: "updated", type: "autodate", onCreate: true, onUpdate: true });

      const quotationsCol = new Collection({
        name: "quotations",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: fields
      });
      $app.save(quotationsCol);
      quotationsId = quotationsCol.id;
      console.log("[GRAVY-QUOTATIONS] Colección 'quotations' creada con éxito.");
    } catch (err) {
      console.log("[GRAVY-QUOTATIONS] Error al crear colección quotations: " + err);
    }
  }

  // 2. Colección quotation_lines
  if (quotationsId) {
    try {
      $app.findCollectionByNameOrId("quotation_lines");
    } catch (_) {
      try {
        const lineFields = [
          { name: "quotation_id", type: "relation", required: true, collectionId: quotationsId, cascadeDelete: true, maxSelect: 1 },
          { name: "product_id", type: "relation", required: true, collectionId: productsId, cascadeDelete: false, maxSelect: 1 },
          { name: "description", type: "text", required: false },
          { name: "qty", type: "number", required: true },
          { name: "unit_price", type: "number", required: true },
          { name: "iva_rate", type: "number", required: false },
          { name: "iva_amount", type: "number", required: false },
          { name: "discount_pct", type: "number", required: false },
          { name: "subtotal", type: "number", required: false },
          { name: "total", type: "number", required: false },
          { name: "line_order", type: "number", required: false },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true }
        ];

        const quotationLinesCol = new Collection({
          name: "quotation_lines",
          type: "base",
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: writeRule,
          updateRule: writeRule,
          deleteRule: deleteRule,
          fields: lineFields
        });
        $app.save(quotationLinesCol);
        console.log("[GRAVY-QUOTATIONS] Colección 'quotation_lines' creada con éxito.");
      } catch (err) {
        console.log("[GRAVY-QUOTATIONS] Error al crear colección quotation_lines: " + err);
      }
    }
  }

  // 3. Asegurar campo quotation_id en sales_orders y crm_deals para trazabilidad de seguimiento
  if (quotationsId) {
    try {
      const soCol = $app.findCollectionByNameOrId("sales_orders");
      let hasQField = false;
      for (let i = 0; i < soCol.fields.length; i++) {
        if (soCol.fields[i].name === "quotation_id") {
          hasQField = true;
          break;
        }
      }
      if (!hasQField) {
        soCol.fields.push({
          name: "quotation_id",
          type: "relation",
          required: false,
          collectionId: quotationsId,
          cascadeDelete: false,
          maxSelect: 1
        });
        $app.save(soCol);
        console.log("[GRAVY-QUOTATIONS] Campo 'quotation_id' añadido a sales_orders.");
      }
    } catch (_) {}

    try {
      const dealsCol = $app.findCollectionByNameOrId("crm_deals");
      let hasQDeal = false;
      for (let i = 0; i < dealsCol.fields.length; i++) {
        if (dealsCol.fields[i].name === "quotation_id") {
          hasQDeal = true;
          break;
        }
      }
      if (!hasQDeal) {
        dealsCol.fields.push({
          name: "quotation_id",
          type: "relation",
          required: false,
          collectionId: quotationsId,
          cascadeDelete: false,
          maxSelect: 1
        });
        $app.save(dealsCol);
        console.log("[GRAVY-QUOTATIONS] Campo 'quotation_id' añadido a crm_deals.");
      }
    } catch (_) {}
  }
});

