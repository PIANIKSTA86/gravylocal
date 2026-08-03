/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — clear_data.pb.js
 * Endpoint de limpieza masiva de datos transaccionales, inventario, productos y terceros.
 * Disponible únicamente para usuarios SUPERADMIN.
 * Ejecuta la eliminación en orden inverso de dependencias dentro de una transacción SQLite.
 */

routerAdd("POST", "/api/gravy/clear-data", (e) => {
  // 1. Verificar autenticación
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  // 2. Verificar permisos por Rol (Solo superadmin)
  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin") {
    return e.json(403, { message: "No tienes permisos para limpiar la base de datos (solo SUPERADMIN)" });
  }

  // Colecciones a limpiar en orden inverso de dependencias de claves foráneas
  const COLLECTIONS_TO_CLEAR = [
    'import_lines',
    'imports',
    'logistica_delivery_lines',
    'logistica_deliveries',
    'crm_interactions',
    'crm_deals',
    'inmo_property_history',
    'inmo_invoice_lines',
    'inmo_invoices',
    'inmo_contracts',
    'inmo_properties',
    'ph_individual_charges',
    'ph_pqrs',
    'ph_reservations',
    'ph_invoice_lines',
    'ph_invoices',
    'appointments',
    'sales_reservation_lines',
    'sales_reservations',
    'sales_order_lines',
    'sales_orders',
    'einvoice_docs',
    'invoice_lines',
    'invoices',
    'purchase_invoice_lines',
    'purchase_invoices',
    'inventory_stock',
    'inventory_movement_lines',
    'inventory_movements',
    'payroll_lines',
    'payroll_novelties',
    'payroll_documents',
    'electronic_payrolls',
    'bank_movements',
    'tx_lines',
    'transactions',
    'pos_shifts',
    'product_components',
    'products',
    'pets',
    'third_parties',
  ];

  let clearedCount = 0;
  let skippedCollections = [];
  let errors = [];

  try {
    // Limpiar referencias a terceros en tablas que no se borran por completo para evitar errores de integridad referencial
    const rawUpdates = [
      "UPDATE users SET owner_id = ''",
      "UPDATE ph_properties SET owner_id = '', occupant_id = ''",
      "UPDATE payroll_novelties SET employee_id = ''",
      "UPDATE payroll_documents SET employee_id = ''"
    ];
    for (let i = 0; i < rawUpdates.length; i++) {
      try {
        $app.nonconcurrentDB().newQuery(rawUpdates[i]).execute();
      } catch (_) {
        // Ignorar si la tabla o los campos no existen en el esquema actual
      }
    }

    // Ejecutar todo el proceso en una transacción SQLite
    $app.runInTransaction((txApp) => {
      for (let cIdx = 0; cIdx < COLLECTIONS_TO_CLEAR.length; cIdx++) {
        const colName = COLLECTIONS_TO_CLEAR[cIdx];
        
        let col;
        try {
          col = txApp.findCollectionByNameOrId(colName);
        } catch (_) {
          skippedCollections.push(colName);
          continue; // La colección no existe en el esquema, continuar
        }

        // Obtener todos los registros y eliminarlos
        try {
          const existing = txApp.findRecordsByFilter(colName, "1=1", "", 150000);
          if (existing && existing.length > 0) {
            console.log("[Clear Data Server] Limpiando " + existing.length + " registros de " + colName);
            for (let rIdx = 0; rIdx < existing.length; rIdx++) {
              txApp.delete(existing[rIdx]);
              clearedCount++;
            }
          }
        } catch (delErr) {
          console.warn("[Clear Data Server Cleanup Error] " + colName + ": " + delErr.message);
          errors.push(colName + ": " + delErr.message);
          throw delErr; // Si falla uno, abortamos la transacción para mantener consistencia
        }
      }
    });

    // Registrar en la bitácora de auditoría
    try {
      const auditCol = $app.findCollectionByNameOrId("audit_log");
      const auditRec = new Record(auditCol, {
        event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
        action: "DATABASE_CLEARED",
        entity: "sistema",
        entity_id: "",
        details: "Limpieza de base de datos ejecutada exitosamente: " + clearedCount + " registros eliminados.",
        user_id: authRecord.id,
        username: authRecord.getString("email") || authRecord.getString("username") || "system"
      });
      $app.save(auditRec);
    } catch (auditErr) {
      console.warn("[Clear Data Server Audit Log Error] " + auditErr.message);
    }

    return e.json(200, {
      success: true,
      message: "Base de datos limpiada con éxito",
      cleared: clearedCount,
      skipped: skippedCollections,
      errors: errors
    });

  } catch (err) {
    console.error("[Clear Data Server Exception] Falló limpieza de base de datos:", err);
    return e.json(500, {
      success: false,
      message: "Fallo durante la limpieza de base de datos: " + err.message
    });
  }
});
