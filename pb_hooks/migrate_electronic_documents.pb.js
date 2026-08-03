/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next();

  let usersId = "";
  let transactionsId = "";
  let branchesId = "";

  try {
    usersId = $app.findCollectionByNameOrId("users").id;
    transactionsId = $app.findCollectionByNameOrId("transactions").id;
  } catch (err) {
    console.log("[GRAVY-CDE] Error: no se pudieron obtener colecciones base: " + err);
    return;
  }
  
  try {
    branchesId = $app.findCollectionByNameOrId("branches").id;
  } catch (_) {}

  const writeRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin' || @request.auth.role = 'contador' || @request.auth.role = 'auxiliar')";
  const deleteRule = "@request.auth.collectionName = 'users' && (@request.auth.role = 'superadmin' || @request.auth.role = 'administrador' || @request.auth.role = 'admin')";

  // 1. Colección electronic_documents
  let electronicDocumentsId = "";
  try {
    const col = $app.findCollectionByNameOrId("electronic_documents");
    electronicDocumentsId = col.id;
    let colChanged = false;

    // Asegurar que tax_amount no sea required en bases de datos existentes
    const taxField = col.fields.getByName("tax_amount");
    if (taxField && taxField.required) {
      taxField.required = false;
      colChanged = true;
    }

    // Asegurar que supplier_details exista
    if (!col.fields.getByName("supplier_details")) {
      col.fields.add(new Field({ name: "supplier_details", type: "text", required: false }));
      colChanged = true;
    }

    if (colChanged) {
      $app.save(col);
      console.log("[GRAVY-CDE] Colección electronic_documents actualizada.");
    }
  } catch (_) {
    try {
      const col = new Collection({
        name: "electronic_documents",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "uuid", type: "text", required: true }, // CUFE/CUDE
          { name: "number", type: "text", required: true },
          { name: "document_type", type: "select", required: true, values: ["invoice_purchase", "invoice_sale", "credit_note", "debit_note", "support_document", "payroll", "payroll_adjust"] },
          { name: "status", type: "select", required: true, values: ["pendiente", "homologado", "contabilizado", "error"] },
          { name: "issue_date", type: "text", required: true },
          { name: "reception_date", type: "text", required: false },
          { name: "supplier_nit", type: "text", required: true },
          { name: "supplier_name", type: "text", required: true },
          { name: "customer_nit", type: "text", required: true },
          { name: "customer_name", type: "text", required: true },
          { name: "subtotal", type: "number", required: true, min: 0 },
          { name: "tax_amount", type: "number", required: false, min: 0 },
          { name: "total", type: "number", required: true, min: 0 },
          { name: "xml_file", type: "file", required: false, maxSelect: 1, maxSize: 5242880, mimeTypes: ["text/xml", "application/xml"] },
          { name: "pdf_file", type: "file", required: false, maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf", "image/*"] },
          { name: "processed", type: "bool", required: false },
          { name: "transaction_id", type: "relation", required: false, collectionId: transactionsId, maxSelect: 1, cascadeDelete: false },
          { name: "hash", type: "text", required: false },
          { name: "import_date", type: "text", required: true },
          { name: "notes", type: "text", required: false },
          { name: "supplier_details", type: "text", required: false },
          { name: "user_id", type: "relation", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: false },
          { name: "branch_id", type: "relation", required: false, collectionId: branchesId, maxSelect: 1, cascadeDelete: false }
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_elec_doc_uuid ON electronic_documents (uuid)",
          "CREATE INDEX idx_elec_doc_supplier ON electronic_documents (supplier_nit)",
          "CREATE INDEX idx_elec_doc_status ON electronic_documents (status)"
        ]
      });
      $app.save(col);
      electronicDocumentsId = col.id;
      console.log("[GRAVY-CDE] Colección electronic_documents creada.");
    } catch (err) {
      console.log("[GRAVY-CDE] Error al crear electronic_documents: " + err);
    }
  }

  // 2. Colección electronic_document_items
  try {
    $app.findCollectionByNameOrId("electronic_document_items");
  } catch (_) {
    try {
      if (!electronicDocumentsId) {
        electronicDocumentsId = $app.findCollectionByNameOrId("electronic_documents").id;
      }
      const col = new Collection({
        name: "electronic_document_items",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "document_id", type: "relation", required: true, collectionId: electronicDocumentsId, maxSelect: 1, cascadeDelete: true },
          { name: "code", type: "text", required: false },
          { name: "unspsc_code", type: "text", required: false },
          { name: "description", type: "text", required: true },
          { name: "qty", type: "number", required: true, min: 0.00001 },
          { name: "price", type: "number", required: true, min: 0 },
          { name: "subtotal", type: "number", required: true, min: 0 }
        ]
      });
      $app.save(col);
      console.log("[GRAVY-CDE] Colección electronic_document_items creada.");
    } catch (err) {
      console.log("[GRAVY-CDE] Error al crear electronic_document_items: " + err);
    }
  }

  // 3. Colección electronic_document_taxes
  try {
    $app.findCollectionByNameOrId("electronic_document_taxes");
  } catch (_) {
    try {
      if (!electronicDocumentsId) {
        electronicDocumentsId = $app.findCollectionByNameOrId("electronic_documents").id;
      }
      const col = new Collection({
        name: "electronic_document_taxes",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "document_id", type: "relation", required: true, collectionId: electronicDocumentsId, maxSelect: 1, cascadeDelete: true },
          { name: "tax_type", type: "select", required: true, values: ["iva", "ica", "inc", "retefuente", "reteiva", "reteica"] },
          { name: "rate", type: "number", required: true, min: 0 },
          { name: "base", type: "number", required: true, min: 0 },
          { name: "amount", type: "number", required: true, min: 0 }
        ]
      });
      $app.save(col);
      console.log("[GRAVY-CDE] Colección electronic_document_taxes creada.");
    } catch (err) {
      console.log("[GRAVY-CDE] Error al crear electronic_document_taxes: " + err);
    }
  }

  // 4. Colección homologation_rules
  try {
    $app.findCollectionByNameOrId("homologation_rules");
  } catch (_) {
    try {
      const col = new Collection({
        name: "homologation_rules",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: writeRule,
        updateRule: writeRule,
        deleteRule: deleteRule,
        fields: [
          { name: "rule_type", type: "select", required: true, values: ["supplier", "unspsc", "keyword"] },
          { name: "key_value", type: "text", required: true }, // El NIT, el código UNSPSC, o la palabra clave
          { name: "account_code", type: "text", required: true }, // Código PUC (ej: 519530)
          { name: "description", type: "text", required: false }
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_homol_rule_key ON homologation_rules (rule_type, key_value)"
        ]
      });
      $app.save(col);
      console.log("[GRAVY-CDE] Colección homologation_rules creada.");
    } catch (err) {
      console.log("[GRAVY-CDE] Error al crear homologation_rules: " + err);
    }
  }
});
