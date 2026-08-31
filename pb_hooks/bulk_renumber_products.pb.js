/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — bulk_renumber_products.pb.js
 * Endpoint de renumeración masiva de referencias de productos.
 * Disponible únicamente para usuarios con rol SUPERADMIN.
 * 
 * Ejecuta la actualización en dos fases dentro de una transacción para evitar
 * conflictos de duplicidad/índices únicos.
 */

routerAdd("POST", "/api/gravy/bulk-renumber-products", (e) => {
  // 1. Verificar autenticación
  let authRecord = e.auth;
  if (!authRecord) {
    try { authRecord = e.requestInfo()?.auth; } catch (_) {}
  }
  if (!authRecord && typeof $apis !== "undefined") {
    try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
  }

  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  // 2. Verificar permisos por Rol (Solo superadmin)
  let role = "";
  try {
    const colName = authRecord.collection() ? authRecord.collection().name : "";
    if (colName === "_superusers" || colName === "_admins") {
      role = "superadmin";
    } else {
      role = String(authRecord.getString("role") || "").toLowerCase().trim();
    }
  } catch (_) {
    role = String(authRecord.getString("role") || "").toLowerCase().trim();
  }

  if (role !== "superadmin") {
    return e.json(403, { message: "No tienes permisos para renumerar referencias (función exclusiva de SUPERADMIN)" });
  }

  // 3. Obtener y validar el cuerpo de la solicitud
  let body = {};
  try {
    body = e.requestInfo().body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (__) {
      body = {};
    }
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const updateConsecutive = body.updateConsecutive === true || body.updateConsecutive === "true";
  const nextConsecutive = Number(body.nextConsecutive) || (items.length + 1);
  const prefix = String(body.prefix || "");
  const digits = Number(body.digits) || 4;

  if (items.length === 0) {
    return e.json(400, { message: "No se proporcionaron productos para renumerar" });
  }

  // Validar unicidad de los nuevos códigos en la lista
  const codeSet = new Set();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it.id || !it.newCode) {
      return e.json(400, { message: "Elemento inválido en la lista de renumeración (índice " + i + ")" });
    }
    const cleanCode = String(it.newCode).trim();
    if (codeSet.has(cleanCode)) {
      return e.json(400, { message: "Código duplicado detectado en la propuesta: " + cleanCode });
    }
    codeSet.add(cleanCode);
  }

  try {
    $app.runInTransaction((txApp) => {
      const nowTs = Date.now();

      // Fase 1: Asignar códigos temporales para evitar colisiones con códigos ya existentes
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        let record = null;
        try {
          record = txApp.findRecordById("products", it.id);
        } catch (_) {
          record = $app.findRecordById("products", it.id);
        }
        if (!record) {
          throw new Error("Producto con ID no encontrado: " + it.id);
        }
        record.set("code", "__TMP_REN__" + it.id + "_" + nowTs);
        const safeType = String(it.type || record.getString("type") || "").toUpperCase().includes("SERV") ? "SERVICIO" : "BIEN";
        record.set("type", safeType);
        txApp.save(record);
      }

      // Fase 2: Asignar los nuevos códigos definitivos
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const cleanCode = String(it.newCode).trim();
        let record = null;
        try {
          record = txApp.findRecordById("products", it.id);
        } catch (_) {
          record = $app.findRecordById("products", it.id);
        }
        record.set("code", cleanCode);
        const safeType = String(it.type || record.getString("type") || "").toUpperCase().includes("SERV") ? "SERVICIO" : "BIEN";
        record.set("type", safeType);
        txApp.save(record);
      }

      // Fase 3: Actualizar el parámetro de configuración de autocodificación si se solicitó
      if (updateConsecutive) {
        try {
          let settingsRec = null;
          try {
            settingsRec = txApp.findFirstRecordByFilter("settings", "key = 'product_config_v1'");
          } catch (_) {
            try {
              settingsRec = $app.findFirstRecordByFilter("settings", "key = 'product_config_v1'");
            } catch (___) {}
          }

          let currentCfg = { auto_code: true, prefix: prefix, digits: digits, consecutive: nextConsecutive };
          if (settingsRec) {
            try {
              const parsed = JSON.parse(settingsRec.getString("value") || "{}");
              currentCfg = Object.assign({}, parsed, {
                prefix: prefix !== undefined ? prefix : parsed.prefix,
                digits: digits !== undefined ? digits : parsed.digits,
                consecutive: nextConsecutive
              });
            } catch (_) {}
            settingsRec.set("value", JSON.stringify(currentCfg));
            txApp.save(settingsRec);
          } else {
            const settingsCol = txApp.findCollectionByNameOrId("settings");
            const newRec = new Record(settingsCol, {
              key: "product_config_v1",
              value: JSON.stringify(currentCfg)
            });
            txApp.save(newRec);
          }
        } catch (cfgErr) {
          console.warn("[BulkRenumber] Error al sincronizar product_config_v1:", cfgErr);
        }
      }

      // Fase 4: Registro en log de auditoría
      try {
        const auditCol = txApp.findCollectionByNameOrId("audit_log");
        if (auditCol) {
          const firstCode = items[0].newCode;
          const lastCode = items[items.length - 1].newCode;
          const details = "Renumeración masiva ejecutada para " + items.length + " productos (Rango: " + firstCode + " - " + lastCode + ").";
          const auditRec = new Record(auditCol, {
            user_id: authRecord.id,
            action: "RENUMBER",
            entity: "products",
            entity_id: "bulk",
            details: details,
            event_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
          });
          txApp.save(auditRec);
        }
      } catch (auditErr) {
        console.warn("[BulkRenumber] Error al registrar log de auditoría:", auditErr);
      }
    });

    return e.json(200, {
      success: true,
      count: items.length,
      message: "Se renumeraron exitosamente " + items.length + " referencias de productos."
    });

  } catch (err) {
    console.error("[BulkRenumber] Error en transacción:", err);
    return e.json(500, { message: "Error al renumerar referencias: " + String(err.message || err) });
  }
});
