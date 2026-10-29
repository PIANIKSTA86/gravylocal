/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — migrate_merchandise_returns.pb.js
 * Módulo Centralizado de Devoluciones de Mercancías (Ventas & Compras)
 * Crea y actualiza las colecciones:
 *  - merchandise_returns (Encabezado del caso RMA / Devolución)
 *  - merchandise_return_lines (Líneas de productos e inspección de estado físico)
 */

onBootstrap((e) => {
  e.next();

  let thirdPartiesId = "";
  let warehousesId = "";
  let productsId = "";
  let accountsId = "";
  let transactionsId = "";
  let invMovementsId = "";
  let invoicesId = "";
  let purchaseInvoicesId = "";
  let branchesId = "";
  let usersId = "";

  try {
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    warehousesId = $app.findCollectionByNameOrId("warehouses").id;
    productsId = $app.findCollectionByNameOrId("products").id;
    accountsId = $app.findCollectionByNameOrId("accounts").id;
    transactionsId = $app.findCollectionByNameOrId("transactions").id;
    invMovementsId = $app.findCollectionByNameOrId("inventory_movements").id;
    usersId = $app.findCollectionByNameOrId("users").id;
  } catch (err) {
    console.log("[GRAVY-RETURNS] Error: no se pudieron obtener colecciones base: " + err);
    return;
  }

  try { invoicesId = $app.findCollectionByNameOrId("invoices").id; } catch (_) {}
  try { purchaseInvoicesId = $app.findCollectionByNameOrId("purchase_invoices").id; } catch (_) {}
  try { branchesId = $app.findCollectionByNameOrId("branches").id; } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar' || @request.auth.role = 'cajero' || @request.auth.role = 'bodeguero' || @request.auth.role = 'vendedor')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: merchandise_returns
  // ──────────────────────────────────────────────────────────
  let returnsColId = "";
  try {
    const col = $app.findCollectionByNameOrId("merchandise_returns");
    returnsColId = col.id;
    console.log("[GRAVY-RETURNS] Colección merchandise_returns ya existe.");
  } catch (_) {
    try {
      const colFields = [
        { name: "number", type: "text", required: true },
        { name: "return_type", type: "select", required: true, values: ["VENTA", "COMPRA"] },
        { name: "date", type: "text", required: true },
        { name: "status", type: "select", required: true, values: ["draft", "inspected", "posted", "voided"] },
        { name: "third_party_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false },
        { name: "warehouse_id", type: "relation", required: true, collectionId: warehousesId, cascadeDelete: false },
        { name: "loss_warehouse_id", type: "relation", required: false, collectionId: warehousesId, cascadeDelete: false },
        { name: "reason_code", type: "select", required: true, values: [
          "CALIDAD_DEFECTO",
          "AVERIA_TRANSPORTE",
          "ERROR_DESPACHO",
          "FECHA_VENCIMIENTO",
          "DISCONFORMIDAD_PRECIO",
          "GARANTIA",
          "OTRO"
        ]},
        { name: "reason_notes", type: "text", required: false },
        { name: "subtotal", type: "number", required: false, min: 0 },
        { name: "iva_total", type: "number", required: false, min: 0 },
        { name: "ret_total", type: "number", required: false, min: 0 },
        { name: "total", type: "number", required: false, min: 0 },
        { name: "settlement_mode", type: "select", required: true, values: [
          "CRUCE_DOC_ORIGINAL",
          "NUEVO_DOC_NC",
          "SALDO_A_FAVOR",
          "REEMBOLSO_INMEDIATO"
        ]},
        { name: "tx_id", type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false },
        { name: "inv_movement_id", type: "relation", required: false, collectionId: invMovementsId, cascadeDelete: false },
        { name: "dian_sync_status", type: "select", required: false, values: ["NONE", "PENDING", "APPROVED", "REJECTED"] },
        { name: "dian_response", type: "text", required: false },
        { name: "user_id", type: "relation", required: false, collectionId: usersId, cascadeDelete: false }
      ];

      if (invoicesId) {
        colFields.push({ name: "invoice_id", type: "relation", required: false, collectionId: invoicesId, cascadeDelete: false });
      }
      if (purchaseInvoicesId) {
        colFields.push({ name: "purchase_invoice_id", type: "relation", required: false, collectionId: purchaseInvoicesId, cascadeDelete: false });
      }
      if (branchesId) {
        colFields.push({ name: "branch_id", type: "relation", required: false, collectionId: branchesId, cascadeDelete: false });
      }

      const col = new Collection({
        name: "merchandise_returns",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: colFields,
        indexes: ["CREATE UNIQUE INDEX idx_merchandise_returns_num ON merchandise_returns (number)"]
      });
      $app.save(col);
      returnsColId = col.id;
      console.log("[GRAVY-RETURNS] Colección merchandise_returns creada con éxito.");
    } catch (err) {
      console.log("[GRAVY-RETURNS] Error creando merchandise_returns: " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: merchandise_return_lines
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("merchandise_return_lines");
    console.log("[GRAVY-RETURNS] Colección merchandise_return_lines ya existe.");
  } catch (_) {
    try {
      if (!returnsColId) {
        returnsColId = $app.findCollectionByNameOrId("merchandise_returns").id;
      }
      const lineFields = [
        { name: "return_id", type: "relation", required: true, collectionId: returnsColId, cascadeDelete: true },
        { name: "line_order", type: "number", required: false },
        { name: "product_id", type: "relation", required: true, collectionId: productsId, cascadeDelete: false },
        { name: "account_id", type: "relation", required: false, collectionId: accountsId, cascadeDelete: false },
        { name: "qty_invoiced", type: "number", required: true, min: 0 },
        { name: "qty_previously_returned", type: "number", required: false, min: 0 },
        { name: "qty_returned", type: "number", required: true, min: 0 },
        { name: "unit_price", type: "number", required: true, min: 0 },
        { name: "unit_cost", type: "number", required: false, min: 0 },
        { name: "iva_rate", type: "number", required: false, min: 0 },
        { name: "iva_amount", type: "number", required: false, min: 0 },
        { name: "subtotal", type: "number", required: false, min: 0 },
        { name: "total", type: "number", required: false, min: 0 },
        { name: "physical_condition", type: "select", required: true, values: [
          "BUENO_REINGRESABLE",
          "AVERIA_PERDIDA",
          "REPARACION_GARANTIA"
        ]},
        { name: "target_warehouse_id", type: "relation", required: false, collectionId: warehousesId, cascadeDelete: false },
        { name: "notes", type: "text", required: false }
      ];

      const linesCol = new Collection({
        name: "merchandise_return_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: lineFields
      });
      $app.save(linesCol);
      console.log("[GRAVY-RETURNS] Colección merchandise_return_lines creada con éxito.");
    } catch (err) {
      console.log("[GRAVY-RETURNS] Error creando merchandise_return_lines: " + err);
    }
  }
});
