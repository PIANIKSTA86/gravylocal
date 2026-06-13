/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — dian_resolutions_hook.pb.js
 * Interceptor de base de datos para la asignación secuencial y atómica
 * de consecutivos de facturación bajo resoluciones oficiales de la DIAN.
 */

const resolutionHandler = (e) => {
  const record = e.record;
  const collectionName = record.collection().name;

  let docType = "FV"; // Por defecto Factura de Venta
  const posShiftId = record.getString("pos_shift_id");
  const txTypeId = record.getString("tx_type_id");

  if (collectionName === "purchase_invoices") {
    let isDS = false;
    let txTypeRecord = null;
    if (txTypeId) {
      try {
        txTypeRecord = $app.findRecordById("transaction_types", txTypeId);
        const code = (txTypeRecord.getString("code") || "").toUpperCase().trim();
        if (code === "DS") { isDS = true; docType = "DS"; }
        if (code === "NDS") { isDS = true; docType = "NDS"; }
      } catch (err) {}
    }
    // Si no es Documento Soporte ni su Nota de Ajuste, usamos el consecutivo interno de transaction_types
    if (!isDS) {
      if (txTypeRecord) {
        try {
          let txNumber = "";
          $app.runInTransaction((txApp) => {
            const txType = txApp.findRecordById("transaction_types", txTypeId);
            const prefix = String(txType.getString("prefix") || txType.getString("code") || "FC").trim().toUpperCase() || "FC";
            let consecutiveRaw = Number(txType.get("consecutive") || 0);

            while (true) {
              consecutiveRaw++;
              txNumber = `${prefix}-${String(consecutiveRaw).padStart(8, "0")}`;
              let found = false;
              try {
                $app.findFirstRecordByFilter("purchase_invoices", "number='" + txNumber + "'");
                found = true;
              } catch (e) {}

              if (!found) {
                try {
                  $app.findFirstRecordByFilter("transactions", "number='" + txNumber + "'");
                  found = true;
                } catch (e) {}
              }

              if (!found) {
                txType.set("consecutive", consecutiveRaw);
                txApp.save(txType);
                break;
              }
            }
          });
          if (txNumber) {
            record.set("number", txNumber);
            console.log("[GRAVY-HOOK] Asignado consecutivo interno para compra: " + txNumber);
          }
        } catch(e) {
          console.log("[GRAVY-HOOK] Error generando consecutivo interno para compra", e);
        }
      }
      e.next();
      return;
    }
  } else {
    // Lógica original para invoices
    if (txTypeId) {
      try {
        const txType = $app.findRecordById("transaction_types", txTypeId);
        const code = (txType.getString("code") || "").toUpperCase().trim();
        const prefix = (txType.getString("prefix") || "").toUpperCase().trim();
        const name = (txType.getString("name") || "").toUpperCase();
        
        if (code === "NC" || prefix === "NC" || name.includes("CRÉDITO") || name.includes("CREDITO")) {
          docType = "NC";
        } else if (code === "ND" || prefix === "ND" || name.includes("DÉBITO") || name.includes("DEBITO")) {
          docType = "ND";
        }
      } catch (err) {
        console.log("[GRAVY-HOOK] Error looking up txType:", err);
      }
    }
    // Si no se detectó como Nota y tiene turno POS, entonces es POS
    if (docType === "FV" && posShiftId) {
      docType = "POS";
    }
  }

  console.log("[GRAVY-HOOK] Creating " + collectionName + ". Final docType:", docType);

  // Determinar filtro inicial de resolución activa
  let filter = "active = true && document_type = '" + docType + "'";
  let registerId = "";

  // Si es POS y tiene turno, intentar obtener la caja del turno
  if (posShiftId) {
    try {
      const shift = $app.findRecordById("pos_shifts", posShiftId);
      registerId = shift.getString("pos_register_id");
    } catch (_) {}
  }

  try {
    // Buscar resoluciones
    let resolution = null;
    
    // Si la terminal tiene una caja asociada, buscar la resolución de esa caja primero
    if (registerId) {
      try {
        resolution = $app.findFirstRecordByFilter("dian_resolutions", filter + " && pos_register_id = '" + registerId + "'");
      } catch (_) {
        // Si no hay resolución específica de caja, buscar una genérica sin caja asignada
        try {
          resolution = $app.findFirstRecordByFilter("dian_resolutions", filter + " && pos_register_id = ''");
        } catch (_) {}
      }
    } else {
      // Buscar resolución genérica
      try {
        resolution = $app.findFirstRecordByFilter("dian_resolutions", filter + " && pos_register_id = ''");
      } catch (_) {}
    }

    if (!resolution) {
      // Intentar obtener cualquier resolución activa de este tipo si no se encontró con los filtros anteriores
      try {
        resolution = $app.findFirstRecordByFilter("dian_resolutions", filter);
      } catch (_) {}
    }

    if (!resolution) {
      throw new BadRequestError("No se encontró ninguna resolución activa de tipo " + docType + ".");
    }

    const nextNumber = resolution.getInt("current_number") + 1;
    const maxNumber = resolution.getInt("number_to");
    const expirationStr = resolution.getString("expiration_date");

    // Validar fecha de expiración
    if (expirationStr) {
      const expDate = new Date(expirationStr.slice(0, 10) + "T23:59:59");
      const today = new Date();
      if (today > expDate) {
        throw new BadRequestError("La resolución DIAN para " + docType + " ha expirado el " + expirationStr.slice(0, 10) + ".");
      }
    }

    // Validar límites del rango
    if (nextNumber > maxNumber) {
      throw new BadRequestError("Rango de consecutivos agotado para la resolución DIAN de " + docType + " (Máx autorizado: " + maxNumber + ").");
    }

    // Generar y asignar el número definitivo
    const prefix = resolution.getString("prefix");
    const formattedNumber = prefix ? (prefix + "-" + String(nextNumber).padStart(8, '0')) : String(nextNumber).padStart(8, '0');
    
    record.set("number", formattedNumber);

    // Incrementar el consecutivo en la resolución y guardar
    resolution.set("current_number", nextNumber);
    $app.save(resolution);

    console.log("[GRAVY-RESOLUCIONES] Asignado consecutivo secuencial: " + formattedNumber);
  } catch (err) {
    // Fallback de contingencia: si no hay ninguna resolución configurada en la DB (ej: primer arranque local)
    // generamos un número automático para que el sistema siga operando sin fallar.
    let count = 0;
    try {
      const result = $app.findRecordsByFilter("dian_resolutions", "1=1", "", 1);
      count = result.length;
    } catch (_) {}

    if (count === 0) {
      const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
      const rand = String(Date.now()).slice(-4);
      let fbPrefix = "FV";
      if (docType === "POS") fbPrefix = "POS";
      if (docType === "NC") fbPrefix = "NC";
      if (docType === "ND") fbPrefix = "ND";
      if (docType === "DS") fbPrefix = "DS";
      if (docType === "NDS") fbPrefix = "NDS";
      record.set("number", fbPrefix + "-" + today + "-" + rand);
    } else {
      throw new BadRequestError("Error de Numeración DIAN: " + err.message);
    }
  }

  e.next();
};

onRecordCreateRequest(resolutionHandler, "invoices");
onRecordCreateRequest(resolutionHandler, "purchase_invoices");

onBootstrap((e) => {
  e.next();
  
  function syncResolution(res) {
    const prefix = (res.getString("prefix") || "").trim().toUpperCase();
    const docType = res.getString("document_type");
    if (!prefix) return;
    try {
      const ttCol = $app.findCollectionByNameOrId("transaction_types");
      let existing = null;
      try {
        existing = $app.findFirstRecordByFilter("transaction_types", "code = '" + docType + "' && prefix = '" + prefix + "'");
      } catch (_) {}
      let typeName = "";
      if (docType === "POS") typeName = "Factura de Venta POS " + prefix;
      else if (docType === "FV") typeName = "Factura de Venta " + prefix;
      else if (docType === "NC") typeName = "Nota Crédito " + prefix;
      else if (docType === "ND") typeName = "Nota Débito " + prefix;
      else if (docType === "DS") typeName = "Documento Soporte " + prefix;
      else if (docType === "NDS") typeName = "Nota Ajuste DS " + prefix;
      else typeName = docType + " " + prefix;

      if (existing) {
        let changed = false;
        if (!existing.getBool("active")) { existing.set("active", true); changed = true; }
        const resConsec = res.getInt("current_number");
        if (resConsec > existing.getInt("consecutive")) { existing.set("consecutive", resConsec); changed = true; }
        if (changed) { $app.save(existing); console.log("[GRAVY-RESOLUCIONES] Sincronizado: " + docType + "-" + prefix); }
      } else {
        const newTt = new Record(ttCol, {
          code: docType,
          prefix: prefix,
          name: typeName,
          description: "Generada por resolución DIAN " + prefix,
          consecutive: res.getInt("current_number"),
          active: true
        });
        $app.save(newTt);
        console.log("[GRAVY-RESOLUCIONES] Creado: " + docType + "-" + prefix);
      }
    } catch (err) {
      console.log("[GRAVY-RESOLUCIONES] Error al sincronizar " + prefix + ": " + err);
    }
  }

  try {
    const resolutions = $app.findRecordsByFilter("dian_resolutions", "active = true", "");
    for (const res of resolutions) {
      syncResolution(res);
    }
  } catch (err) {
    console.log("[GRAVY-RESOLUCIONES] Error en sincronización bootstrap:", err);
  }
});

onRecordCreateRequest((e) => {
  e.next();
  
  function syncResolution(res) {
    const prefix = (res.getString("prefix") || "").trim().toUpperCase();
    const docType = res.getString("document_type");
    if (!prefix) return;
    try {
      const ttCol = $app.findCollectionByNameOrId("transaction_types");
      let existing = null;
      try {
        existing = $app.findFirstRecordByFilter("transaction_types", "code = '" + docType + "' && prefix = '" + prefix + "'");
      } catch (_) {}
      let typeName = "";
      if (docType === "POS") typeName = "Factura de Venta POS " + prefix;
      else if (docType === "FV") typeName = "Factura de Venta " + prefix;
      else if (docType === "NC") typeName = "Nota Crédito " + prefix;
      else if (docType === "ND") typeName = "Nota Débito " + prefix;
      else if (docType === "DS") typeName = "Documento Soporte " + prefix;
      else if (docType === "NDS") typeName = "Nota Ajuste DS " + prefix;
      else typeName = docType + " " + prefix;

      if (existing) {
        let changed = false;
        if (!existing.getBool("active")) { existing.set("active", true); changed = true; }
        const resConsec = res.getInt("current_number");
        if (resConsec > existing.getInt("consecutive")) { existing.set("consecutive", resConsec); changed = true; }
        if (changed) { $app.save(existing); console.log("[GRAVY-RESOLUCIONES] Sincronizado: " + docType + "-" + prefix); }
      } else {
        const newTt = new Record(ttCol, {
          code: docType,
          prefix: prefix,
          name: typeName,
          description: "Generada por resolución DIAN " + prefix,
          consecutive: res.getInt("current_number"),
          active: true
        });
        $app.save(newTt);
        console.log("[GRAVY-RESOLUCIONES] Creado: " + docType + "-" + prefix);
      }
    } catch (err) {
      console.log("[GRAVY-RESOLUCIONES] Error al sincronizar " + prefix + ": " + err);
    }
  }

  syncResolution(e.record);
}, "dian_resolutions");

onRecordUpdateRequest((e) => {
  e.next();

  function syncResolution(res) {
    const prefix = (res.getString("prefix") || "").trim().toUpperCase();
    const docType = res.getString("document_type");
    if (!prefix) return;
    try {
      const ttCol = $app.findCollectionByNameOrId("transaction_types");
      let existing = null;
      try {
        existing = $app.findFirstRecordByFilter("transaction_types", "code = '" + docType + "' && prefix = '" + prefix + "'");
      } catch (_) {}
      let typeName = "";
      if (docType === "POS") typeName = "Factura de Venta POS " + prefix;
      else if (docType === "FV") typeName = "Factura de Venta " + prefix;
      else if (docType === "NC") typeName = "Nota Crédito " + prefix;
      else if (docType === "ND") typeName = "Nota Débito " + prefix;
      else if (docType === "DS") typeName = "Documento Soporte " + prefix;
      else if (docType === "NDS") typeName = "Nota Ajuste DS " + prefix;
      else typeName = docType + " " + prefix;

      if (existing) {
        let changed = false;
        if (!existing.getBool("active")) { existing.set("active", true); changed = true; }
        const resConsec = res.getInt("current_number");
        if (resConsec > existing.getInt("consecutive")) { existing.set("consecutive", resConsec); changed = true; }
        if (changed) { $app.save(existing); console.log("[GRAVY-RESOLUCIONES] Sincronizado: " + docType + "-" + prefix); }
      } else {
        const newTt = new Record(ttCol, {
          code: docType,
          prefix: prefix,
          name: typeName,
          description: "Generada por resolución DIAN " + prefix,
          consecutive: res.getInt("current_number"),
          active: true
        });
        $app.save(newTt);
        console.log("[GRAVY-RESOLUCIONES] Creado: " + docType + "-" + prefix);
      }
    } catch (err) {
      console.log("[GRAVY-RESOLUCIONES] Error al sincronizar " + prefix + ": " + err);
    }
  }

  syncResolution(e.record);
}, "dian_resolutions");

