/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — restore.pb.js
 * Endpoint de restauración masiva transaccional en servidor.
 * Recibe el JSON completo de respaldo y lo inserta usando la API de Go de PocketBase
 * dentro de una única transacción SQLite para optimizar rendimiento y consistencia.
 */

routerAdd("POST", "/api/gravy/restore", (e) => {
  // 1. Verificar autenticación
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  // 2. Verificar permisos por Rol (solo admin, superadmin y contador pueden restaurar)
  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin" && role !== "admin" && role !== "contador" && role !== "administrador") {
    return e.json(403, { message: "No tienes permisos para realizar una restauración" });
  }

  // 3. Obtener el cuerpo de la petición
  let body = null;
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (_) {}
  }

  if (!body || !body.collections) {
    return e.json(400, { message: "El formato de respaldo no es válido o está vacío" });
  }

  const collections = body.collections;

  // Asegurar que la colección dian_resolutions contenga todos los tipos de documento
  try {
    const drCol = $app.findCollectionByNameOrId("dian_resolutions");
    const docTypeField = drCol.fields.getByName("document_type");
    if (docTypeField && docTypeField.type === "select") {
      const allowed = ["FV", "POS", "DS", "NE", "NC", "ND", "NDS"];
      const current = docTypeField.values || [];
      const missing = allowed.filter(v => current.indexOf(v) === -1);
      if (missing.length > 0) {
        docTypeField.values = Array.from(new Set([...current, ...allowed]));
        $app.save(drCol);
        console.log("[Restore Server] Schema patched: dian_resolutions.document_type updated with missing values: " + missing.join(", "));
      }
    }
  } catch (schemaErr) {
    console.warn("[Restore Server Schema Patch Error] " + schemaErr.message);
  }

  // Orden estricto respetando dependencias de claves foráneas
  const ORDER = [
    // 1. Configuración e infraestructura independiente
    'settings',
    'treasury_settings',
    'niif_settings',
    'niif_policies',
    'licenses',
    'geo_countries',
    'geo_departments',
    'geo_municipalities',
    'branches',
    'exogena_concepts',
    'financial_notes',
    'account_types',
    'cash_concepts',
    'homologation_rules',
    'agenda_vencimientos',
    'niif_asset_categories',
    'ph_common_areas',
    'ph_budgets',
    'ph_budget_lines',
    'payroll_periods',
    'commission_rules',
    'pets',
    'listas_precios',

    // 2. Catálogos y maestros contables principales
    'cost_centers',
    'accounts',
    'warehouses',
    'transaction_types',

    // 3. Datos maestros intermedios
    'third_parties',
    'clientes',
    'spa_clients',
    'ph_billing_concepts',
    'pos_registers',
    'products',
    'precios_producto',
    'niif_assets',
    'niif_leases',

    // 4. Datos maestros dependientes
    'users',
    'dian_resolutions',
    'logistica_vehicles',
    'ph_properties',
    'inmo_properties',
    'product_components',
    'niif_asset_events',
    'niif_asset_inventories',

    // 5. Datos operativos, movimientos y transacciones contables
    'pos_shifts',
    'transactions',
    'tx_lines',
    'payments',
    'bank_accounts',
    'bank_movements',
    'payroll_documents',
    'payroll_lines',
    'payroll_novelties',
    'electronic_payrolls',
    'inventory_movements',
    'inventory_movement_lines',
    'inventory_stock',
    'consignment_settlements',
    'consignment_settlement_lines',
    'purchase_invoices',
    'purchase_invoice_lines',
    'invoices',
    'invoice_lines',
    'einvoice_docs',
    'electronic_documents',
    'electronic_document_items',
    'electronic_document_taxes',
    'sales_orders',
    'sales_order_lines',
    'sales_reservations',
    'sales_reservation_lines',
    'appointments',
    'ph_invoices',
    'ph_invoice_lines',
    'ph_reservations',
    'ph_pqrs',
    'ph_individual_charges',
    'inmo_contracts',
    'inmo_invoices',
    'inmo_invoice_lines',
    'inmo_property_history',
    'crm_deals',
    'crm_interactions',
    'logistica_deliveries',
    'logistica_delivery_lines',
    'imports',
    'import_lines',
    'audit_log',
  ];

  let restored = 0;
  let skipped = 0;
  let errors = [];

  try {
    // Ejecutar todo el proceso de inserción en una transacción SQLite
    $app.runInTransaction((txApp) => {
      
      // FASE 1: Limpieza en orden inverso de dependencias
      const REVERSE_ORDER = [...ORDER].reverse();
      for (let cIdx = 0; cIdx < REVERSE_ORDER.length; cIdx++) {
        const colName = REVERSE_ORDER[cIdx];
        
        // Solo limpiar si la colección está presente en el backup recibido
        if (!collections[colName] || !Array.isArray(collections[colName])) {
          continue;
        }

        let col;
        try {
          col = txApp.findCollectionByNameOrId(colName);
        } catch (_) {
          continue; // La colección no existe en el esquema de este tenant, continuar
        }

        // Obtener todos los registros y eliminarlos
        try {
          const existing = txApp.findRecordsByFilter(colName, "1=1", "", 150000);
          if (existing && existing.length > 0) {
            console.log("[Restore Server] Limpiando " + existing.length + " registros de " + colName);
            for (let rIdx = 0; rIdx < existing.length; rIdx++) {
              txApp.delete(existing[rIdx]);
            }
          }
        } catch (delErr) {
          console.warn("[Restore Server Cleanup Error] " + colName + ": " + delErr.message);
        }
      }

      // FASE 2: Inserción en orden secuencial de dependencias
      for (let cIdx = 0; cIdx < ORDER.length; cIdx++) {
        const colName = ORDER[cIdx];
        const rows = collections[colName];
        if (!Array.isArray(rows) || rows.length === 0) {
          continue;
        }

        let col;
        try {
          col = txApp.findCollectionByNameOrId(colName);
        } catch (_) {
          continue; // La colección no existe en el esquema
        }

        console.log("[Restore Server] Restaurando " + rows.length + " registros de " + colName);

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          try {
            // Sanitizar campos del sistema
            const cleanRow = { ...row };
            delete cleanRow.collectionId;
            delete cleanRow.collectionName;
            delete cleanRow.created;
            delete cleanRow.updated;
            delete cleanRow.expand;

            let r;
            try {
              // Buscar por ID para ver si existe (por si no se eliminó en limpieza)
              r = txApp.findRecordById(colName, row.id);
            } catch (_) {
              // Si no existe, crear un nuevo Record de la colección e inyectar el ID
              r = new Record(col);
              r.id = row.id;
            }

            // Mapear campos
            for (const key in cleanRow) {
              const val = cleanRow[key];
              r.set(key, val);
            }

            let saveSuccess = false;
            let attempts = 0;
            while (!saveSuccess && attempts < 5) {
              try {
                txApp.save(r);
                saveSuccess = true;
                restored++;
              } catch (saveErr) {
                attempts++;
                const errMsg = saveErr.message;
                if (errMsg.indexOf("Failed to find all relation records") !== -1) {
                  const colonIdx = errMsg.indexOf(":");
                  if (colonIdx !== -1) {
                    const fieldName = errMsg.substring(0, colonIdx).trim();
                    console.log("[Restore Server Self-Healing] Handling invalid relation field '" + fieldName + "' on " + colName + "/" + row.id);
                    
                    let healed = false;
                    try {
                      const field = col.fields.getByName(fieldName);
                      if (field && field.collectionId) {
                        const targetCol = txApp.findCollectionByNameOrId(field.collectionId);
                        if (targetCol) {
                          let targetIds = [];
                          if (Array.isArray(row[fieldName])) {
                            targetIds = row[fieldName];
                          } else if (typeof row[fieldName] === "string" && row[fieldName].trim() !== "") {
                            targetIds = [row[fieldName].trim()];
                          }
                          
                          if (targetIds.length > 0) {
                            for (let tIdx = 0; tIdx < targetIds.length; tIdx++) {
                              const targetId = targetIds[tIdx];
                              try {
                                txApp.findRecordById(targetCol.name, targetId);
                              } catch (_) {
                                const dummyRec = new Record(targetCol);
                                dummyRec.id = targetId;
                                
                                if (targetCol.name === "third_parties") {
                                  dummyRec.set("name", "Tercero Temporal (" + targetId + ")");
                                  dummyRec.set("doc_type", "NIT");
                                  dummyRec.set("doc_number", targetId);
                                  dummyRec.set("type", "OTRO");
                                } else if (targetCol.name === "users") {
                                  dummyRec.set("email", "temp_" + targetId + "@contaco.com");
                                  dummyRec.set("role", "admin");
                                } else if (targetCol.name === "pos_registers") {
                                  dummyRec.set("name", "Caja Temporal (" + targetId + ")");
                                  dummyRec.set("terminal_key", "TEMP_" + targetId);
                                } else if (targetCol.name === "branches") {
                                  dummyRec.set("name", "Sucursal Temporal (" + targetId + ")");
                                } else if (targetCol.name === "warehouses") {
                                  dummyRec.set("name", "Bodega Temporal (" + targetId + ")");
                                } else if (targetCol.name === "transactions") {
                                  dummyRec.set("number", "TEMP_" + targetId);
                                } else if (targetCol.name === "cost_centers") {
                                  dummyRec.set("code", "CC_" + targetId);
                                  dummyRec.set("name", "Centro de Costo Temporal (" + targetId + ")");
                                } else if (targetCol.name === "listas_precios") {
                                  dummyRec.set("name", "Lista Temporal (" + targetId + ")");
                                } else if (targetCol.name === "clientes") {
                                  dummyRec.set("nombre", "Cliente Temporal (" + targetId + ")");
                                }
                                
                                txApp.save(dummyRec);
                                console.log("[Restore Server Self-Healing] Created dummy record in " + targetCol.name + " with ID: " + targetId);
                              }
                            }
                            healed = true;
                          }
                        }
                      }
                    } catch (healErr) {
                      console.warn("[Restore Server Self-Healing Error] " + healErr.message);
                    }
                    
                    if (!healed) {
                      r.set(fieldName, "");
                    }
                    continue;
                  }
                }
                throw saveErr;
              }
            }
          } catch (rowErr) {
            skipped++;
            if (errors.length < 10) {
              errors.push(colName + "/" + row.id + ": " + rowErr.message);
            }
            console.warn("[Restore Server Row Error] " + colName + "/" + row.id + ": " + rowErr.message);
          }
        }
      }

      // FASE 3: Procesar cualquier colección en el respaldo JSON no listada en ORDER (Contingencia dinámica)
      const processedCols = new Set(ORDER);
      const allBackupCols = Object.keys(collections);

      for (let bIdx = 0; bIdx < allBackupCols.length; bIdx++) {
        const colName = allBackupCols[bIdx];
        if (processedCols.has(colName)) continue;

        const rows = collections[colName];
        if (!Array.isArray(rows) || rows.length === 0) continue;

        let col;
        try {
          col = txApp.findCollectionByNameOrId(colName);
        } catch (_) {
          continue;
        }

        console.log("[Restore Server Contingencia] Restaurando colección dinámica " + rows.length + " registros de " + colName);

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          try {
            const cleanRow = { ...row };
            delete cleanRow.collectionId;
            delete cleanRow.collectionName;
            delete cleanRow.created;
            delete cleanRow.updated;
            delete cleanRow.expand;

            let r;
            try {
              r = txApp.findRecordById(colName, row.id);
            } catch (_) {
              r = new Record(col);
              r.id = row.id;
            }

            for (const key in cleanRow) {
              r.set(key, cleanRow[key]);
            }

            txApp.save(r);
            restored++;
          } catch (rowErr) {
            skipped++;
            if (errors.length < 10) {
              errors.push(colName + "/" + row.id + ": " + rowErr.message);
            }
          }
        }
      }
    });

    // 4. Escribir registro en la bitácora de auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action: "BACKUP_RESTORED",
        entity: "sistema",
        entity_id: "",
        details: "Restauración masiva backend: " + restored + " restaurados, " + skipped + " omitidos",
        user_id: authRecord.id,
        username: authRecord.getString("email") || authRecord.getString("username") || "system"
      });
      $app.save(auditRec);
    } catch (auditErr) {
      console.warn("[Restore Server Audit Log Error] " + auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Restauración completada con éxito",
      restored: restored,
      skipped: skipped,
      errors: errors
    });

  } catch (err) {
    console.error("[Restore Server Exception] Falló restauración transaccional:", err);
    return e.json(500, {
      success: false,
      message: "Fallo durante la restauración masiva: " + err.message
    });
  }
});
