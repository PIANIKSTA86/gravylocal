/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — migrate_support_documents.pb.js
 * Desacoplamiento definitivo de Documentos Soporte Electrónicos (DS) y Notas de Ajuste (NDS)
 * de las colecciones de compras comerciales (purchase_invoices) y facturación de venta.
 * Crea:
 *   1. support_documents
 *   2. support_document_lines
 * y realiza migración histórica transparente e idempotente.
 */

onBootstrap((e) => {
  e.next();

  let usersId = "";
  let thirdPartiesId = "";
  let transactionsId = "";
  let txTypesId = "";
  let accountsId = "";
  let productsId = "";
  let costCentersId = "";
  let bankAccountsId = "";
  let dianResolutionsId = "";
  let branchesId = "";

  try {
    usersId = $app.findCollectionByNameOrId("users").id;
    thirdPartiesId = $app.findCollectionByNameOrId("third_parties").id;
    transactionsId = $app.findCollectionByNameOrId("transactions").id;
    txTypesId = $app.findCollectionByNameOrId("transaction_types").id;
    accountsId = $app.findCollectionByNameOrId("accounts").id;
  } catch (err) {
    console.log("[GRAVY-DS-MIGRATE] Error obteniendo colecciones base:", err);
    return;
  }

  try { productsId = $app.findCollectionByNameOrId("products").id; } catch (_) {}
  try { costCentersId = $app.findCollectionByNameOrId("cost_centers").id; } catch (_) {}
  try { bankAccountsId = $app.findCollectionByNameOrId("bank_accounts").id; } catch (_) {}
  try { dianResolutionsId = $app.findCollectionByNameOrId("dian_resolutions").id; } catch (_) {}
  try { branchesId = $app.findCollectionByNameOrId("branches").id; } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // ──────────────────────────────────────────────────────────
  // 1. COLECCIÓN: support_documents
  // ──────────────────────────────────────────────────────────
  let supportDocsId = "";
  try {
    const col = $app.findCollectionByNameOrId("support_documents");
    supportDocsId = col.id;
  } catch (_) {
    try {
      const col = new Collection({
        name: "support_documents",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "number", type: "text", required: true },
          { name: "doc_type", type: "select", required: true, values: ["DS", "NDS"] },
          { name: "supplier_id", type: "relation", required: true, collectionId: thirdPartiesId, cascadeDelete: false, maxSelect: 1 },
          { name: "date", type: "text", required: true },
          { name: "due_date", type: "text", required: false },
          { name: "subtotal", type: "number", required: true, min: 0 },
          { name: "total", type: "number", required: true, min: 0 },
          { name: "ret_total", type: "number", required: false, min: 0 },
          { name: "payable_total", type: "number", required: false, min: 0 },
          { name: "ret_rule_renta_id", type: "text", required: false },
          { name: "ret_rule_ica_id", type: "text", required: false },
          { name: "dian_resolution_id", type: "relation", required: false, collectionId: dianResolutionsId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "status", type: "select", required: true, values: ["draft", "posted", "voided"] },
          { name: "status_dian", type: "select", required: false, values: ["borrador", "pendiente", "enviada", "aceptada", "rechazada"] },
          { name: "cuds", type: "text", required: false, max: 500 },
          { name: "xml_content", type: "text", required: false, max: 2000000 },
          { name: "dian_response", type: "text", required: false, max: 500000 },
          { name: "tx_id", type: "relation", required: false, collectionId: transactionsId, cascadeDelete: false, maxSelect: 1 },
          { name: "tx_number", type: "text", required: false },
          { name: "tx_type_id", type: "relation", required: false, collectionId: txTypesId, cascadeDelete: false, maxSelect: 1 },
          { name: "cost_center_id", type: "relation", required: false, collectionId: costCentersId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "payment_form", type: "text", required: false },
          { name: "payment_method", type: "text", required: false },
          { name: "payment_dian_code", type: "text", required: false },
          { name: "bank_account_id", type: "relation", required: false, collectionId: bankAccountsId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "supplier_ref", type: "text", required: false },
          { name: "notes", type: "text", required: false },
          { name: "branch_id", type: "relation", required: false, collectionId: branchesId || undefined, cascadeDelete: false, maxSelect: 1 }
        ],
        indexes: [
          "CREATE INDEX idx_supp_docs_number ON support_documents (number)",
          "CREATE INDEX idx_supp_docs_status ON support_documents (status)",
          "CREATE INDEX idx_supp_docs_date ON support_documents (date)"
        ]
      });
      $app.save(col);
      supportDocsId = col.id;
      console.log("[GRAVY-DS-MIGRATE] Colección support_documents creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-DS-MIGRATE] Error al crear support_documents:", err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. COLECCIÓN: support_document_lines
  // ──────────────────────────────────────────────────────────
  try {
    $app.findCollectionByNameOrId("support_document_lines");
  } catch (_) {
    try {
      if (!supportDocsId) {
        supportDocsId = $app.findCollectionByNameOrId("support_documents").id;
      }
      const col = new Collection({
        name: "support_document_lines",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "document_id", type: "relation", required: true, collectionId: supportDocsId, cascadeDelete: true, maxSelect: 1 },
          { name: "line_order", type: "number", required: false },
          { name: "account_id", type: "relation", required: false, collectionId: accountsId, cascadeDelete: false, maxSelect: 1 },
          { name: "product_id", type: "relation", required: false, collectionId: productsId || undefined, cascadeDelete: false, maxSelect: 1 },
          { name: "description", type: "text", required: true },
          { name: "qty", type: "number", required: true, min: 0.00001 },
          { name: "unit_price", type: "number", required: true, min: 0 },
          { name: "subtotal", type: "number", required: true, min: 0 },
          { name: "total", type: "number", required: true, min: 0 },
          { name: "ret_renta_rate", type: "number", required: false, min: 0 },
          { name: "ret_renta_amount", type: "number", required: false, min: 0 },
          { name: "ret_ica_rate", type: "number", required: false, min: 0 },
          { name: "ret_ica_amount", type: "number", required: false, min: 0 }
        ],
        indexes: [
          "CREATE INDEX idx_supp_lines_doc ON support_document_lines (document_id)"
        ]
      });
      $app.save(col);
      console.log("[GRAVY-DS-MIGRATE] Colección support_document_lines creada exitosamente.");
    } catch (err) {
      console.log("[GRAVY-DS-MIGRATE] Error al crear support_document_lines:", err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. MIGRACIÓN HISTÓRICA IDEMPOTENTE
  // ──────────────────────────────────────────────────────────
  try {
    const suppDocsCol = $app.findCollectionByNameOrId("support_documents");
    const suppLinesCol = $app.findCollectionByNameOrId("support_document_lines");
    const purInvoicesCol = $app.findCollectionByNameOrId("purchase_invoices");
    const purLinesCol = $app.findCollectionByNameOrId("purchase_invoice_lines");

    // Buscar resoluciones DS para identificar prefijos autorizados
    let dsPrefixes = ["DS", "NDS", "DSE", "NDSE"];
    try {
      const resRecords = $app.findRecordsByFilter("dian_resolutions", "document_type = 'DS' || document_type = 'NDS'");
      for (let i = 0; i < resRecords.length; i++) {
        const p = String(resRecords[i].getString("prefix") || "").toUpperCase();
        if (p && !dsPrefixes.includes(p)) dsPrefixes.push(p);
      }
    } catch (_) {}

    // Buscar tipos de transacción DS
    let dsTxTypeIds = [];
    try {
      const txTypeRecords = $app.findRecordsByFilter("transaction_types", "code = 'DS' || code = 'NDS'");
      for (let i = 0; i < txTypeRecords.length; i++) {
        dsTxTypeIds.push(txTypeRecords[i].id);
      }
    } catch (_) {}

    const allPurchases = $app.findRecordsByFilter("purchase_invoices", "id != ''", "-date", 5000);
    let migratedCount = 0;
    let purgedCount = 0;

    for (let i = 0; i < allPurchases.length; i++) {
      const pur = allPurchases[i];
      const pNum = String(pur.getString("number") || "").toUpperCase();
      const pTxNum = String(pur.getString("tx_number") || "").toUpperCase();
      const pTxTypeId = pur.getString("tx_type_id");
      const hasDsPrefix = dsPrefixes.some((pref) => pNum.startsWith(pref) || pTxNum.startsWith(pref));
      const hasDsTxType = dsTxTypeIds.includes(pTxTypeId);

      if (hasDsPrefix || hasDsTxType) {
        // Verificar si ya existe en support_documents por number o tx_id
        let targetDocId = "";
        try {
          const existing = $app.findFirstRecordByFilter(
            "support_documents",
            `number = '${pur.getString("number").replace(/'/g, "''")}'`
          );
          if (existing) targetDocId = existing.id;
        } catch (_) {}

        if (!targetDocId && pur.getString("tx_id")) {
          try {
            const existingTx = $app.findFirstRecordByFilter(
              "support_documents",
              `tx_id = '${pur.getString("tx_id")}'`
            );
            if (existingTx) targetDocId = existingTx.id;
          } catch (_) {}
        }

        if (!targetDocId) {
          const docType = (pNum.startsWith("NDS") || pTxNum.startsWith("NDS")) ? "NDS" : "DS";
          
          let cudsVal = pur.getString("cuds");
          let xmlVal = pur.getString("xml_content");
          let respVal = pur.getString("dian_response");
          let statusDianVal = pur.getString("status_dian");

          // Recuperar datos de emisión fiscal desde einvoice_docs si no estaban en purchase_invoices
          if (pur.getString("tx_id")) {
            try {
              const eDoc = $app.findFirstRecordByFilter("einvoice_docs", `tx_id = '${pur.getString("tx_id")}'`);
              if (eDoc) {
                if (!cudsVal) cudsVal = eDoc.getString("cufe");
                if (!xmlVal) xmlVal = eDoc.getString("xml_content");
                if (!respVal) respVal = eDoc.getString("dian_response");
                if (!statusDianVal || statusDianVal === 'borrador' || statusDianVal === 'pendiente') {
                  const eStatus = eDoc.getString("status");
                  if (eStatus) statusDianVal = eStatus;
                }
              }
            } catch (_) {}
          }

          if (!statusDianVal) {
            statusDianVal = pur.getString("status") === "draft" ? "borrador" : "pendiente";
          }

          const newDoc = new Record(suppDocsCol, {
            number: pur.getString("number"),
            doc_type: docType,
            supplier_id: pur.getString("supplier_id"),
            date: pur.getString("date"),
            due_date: pur.getString("due_date"),
            subtotal: pur.getFloat("subtotal") || pur.getFloat("total") || 0,
            total: pur.getFloat("total") || 0,
            ret_total: pur.getFloat("ret_total") || 0,
            payable_total: pur.getFloat("payable_total") || pur.getFloat("total") || 0,
            ret_rule_renta_id: pur.getString("ret_rule_renta_id"),
            ret_rule_ica_id: pur.getString("ret_rule_ica_id"),
            dian_resolution_id: pur.getString("dian_resolution_id"),
            status: pur.getString("status") || "draft",
            status_dian: statusDianVal,
            cuds: cudsVal,
            xml_content: xmlVal,
            dian_response: respVal,
            tx_id: pur.getString("tx_id"),
            tx_number: pur.getString("tx_number") || pur.getString("number"),
            tx_type_id: pur.getString("tx_type_id"),
            cost_center_id: pur.getString("cost_center_id"),
            payment_form: pur.getString("payment_form"),
            payment_method: pur.getString("payment_method"),
            payment_dian_code: pur.getString("payment_dian_code"),
            bank_account_id: pur.getString("bank_account_id"),
            supplier_ref: pur.getString("supplier_ref") || pur.getString("number"),
            notes: pur.getString("notes"),
            branch_id: pur.getString("branch_id")
          });
          $app.save(newDoc);
          targetDocId = newDoc.id;

          // Migrar líneas
          try {
            const oldLines = $app.findRecordsByFilter("purchase_invoice_lines", `invoice_id = '${pur.id}'`, "line_order");
            for (let l = 0; l < oldLines.length; l++) {
              const ol = oldLines[l];
              const newLine = new Record(suppLinesCol, {
                document_id: newDoc.id,
                line_order: ol.getInt("line_order") || (l + 1),
                account_id: ol.getString("account_id"),
                product_id: ol.getString("product_id"),
                description: ol.getString("description") || "Servicio / Gasto",
                qty: ol.getFloat("qty") || 1,
                unit_price: ol.getFloat("unit_price") || ol.getFloat("subtotal") || 0,
                subtotal: ol.getFloat("subtotal") || 0,
                total: ol.getFloat("total") || ol.getFloat("subtotal") || 0,
                ret_renta_rate: ol.getFloat("ret_renta_rate") || 0,
                ret_renta_amount: ol.getFloat("ret_renta_amount") || 0,
                ret_ica_rate: ol.getFloat("ret_ica_rate") || 0,
                ret_ica_amount: ol.getFloat("ret_ica_amount") || 0
              });
              $app.save(newLine);
            }
          } catch (lineErr) {
            console.warn(`[GRAVY-DS-MIGRATE] Error migrando líneas para ${pur.getString("number")}:`, lineErr);
          }

          // Actualizar transacción contable asociada (cross_type)
          if (pur.getString("tx_id")) {
            try {
              const txRecord = $app.findRecordById("transactions", pur.getString("tx_id"));
              if (txRecord) {
                txRecord.set("cross_type", "support_documents");
                $app.save(txRecord);
              }
            } catch (_) {}
          }

          migratedCount++;
        }

        // ────────────────────────────────────────────────────────
        // DEPURACIÓN AUTOMÁTICA INMEDIATA DE purchase_invoices
        // Una vez que el documento existe verificado en support_documents,
        // eliminamos el registro duplicado de purchase_invoices y sus líneas.
        // ────────────────────────────────────────────────────────
        if (targetDocId) {
          try {
            const linesToDelete = $app.findRecordsByFilter("purchase_invoice_lines", `invoice_id = '${pur.id}'`);
            for (let dl = 0; dl < linesToDelete.length; dl++) {
              $app.delete(linesToDelete[dl]);
            }
            $app.delete(pur);
            purgedCount++;
          } catch (delErr) {
            console.warn(`[GRAVY-DS-MIGRATE] Error al depurar purchase_invoices id ${pur.id}:`, delErr);
          }
        }
      }
    }

    if (migratedCount > 0 || purgedCount > 0) {
      console.log(`[GRAVY-DS-MIGRATE] Proceso completado: ${migratedCount} trasladados, ${purgedCount} depurados exitosamente de purchase_invoices.`);
    }
  } catch (migErr) {
    console.warn("[GRAVY-DS-MIGRATE] Nota en proceso de migración histórica:", migErr);
  }
});
