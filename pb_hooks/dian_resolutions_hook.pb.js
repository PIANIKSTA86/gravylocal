/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — dian_resolutions_hook.pb.js
 * Interceptor de base de datos para la asignación secuencial y atómica
 * de consecutivos de facturación bajo resoluciones oficiales de la DIAN.
 */

var getMaxConsecutiveFromDB = function(tableName, prefix) {
  let maxVal = 0;
  try {
    const db = $app.nonconcurrentDB();
    let sql = "";
    if (prefix) {
      sql = "SELECT number FROM " + tableName + " WHERE number LIKE '" + prefix + "-%' AND number NOT LIKE 'BORR-%'";
    } else {
      sql = "SELECT number FROM " + tableName + " WHERE number NOT LIKE 'BORR-%' AND number != ''";
    }
    const result = [];
    db.newQuery(sql).all(result);
    for (let i = 0; i < result.length; i++) {
      const nStr = String(result[i].number || "");
      const matches = nStr.match(/\d+/g);
      if (matches && matches.length > 0) {
        const val = parseInt(matches[matches.length - 1], 10);
        if (!isNaN(val) && val > maxVal) {
          maxVal = val;
        }
      }
    }
  } catch (err) {
    console.log("[GRAVY-HOOK] Error querying max consecutive from " + tableName + " for prefix '" + prefix + "': " + err);
  }
  return maxVal;
};

const resolutionHandler = (e) => {
  function fetchMaxConsecutive(tableName, prefix) {
    let maxVal = 0;
    try {
      const db = $app.nonconcurrentDB();
      let sql = "";
      if (prefix) {
        sql = "SELECT number FROM " + tableName + " WHERE number LIKE '" + prefix + "-%' AND number NOT LIKE 'BORR-%'";
      } else {
        sql = "SELECT number FROM " + tableName + " WHERE number NOT LIKE 'BORR-%' AND number != ''";
      }
      const result = [];
      db.newQuery(sql).all(result);
      for (let i = 0; i < result.length; i++) {
        const nStr = String(result[i].number || "");
        const matches = nStr.match(/\d+/g);
        if (matches && matches.length > 0) {
          const val = parseInt(matches[matches.length - 1], 10);
          if (!isNaN(val) && val > maxVal) {
            maxVal = val;
          }
        }
      }
    } catch (err) {
      console.log("[GRAVY-HOOK] Error querying max consecutive from " + tableName + " for prefix '" + prefix + "': " + err);
    }
    return maxVal;
  }

  const record = e.record;
  const collectionName = record.collection().name;
  const status = record.getString("status");

  let currentNum = record.getString("number");

  // Si se está editando un registro que YA EXISTÍA previamente en la BD con un número oficial (no BORR-),
  // conservamos su número sin volver a consumir o modificar la resolución DIAN.
  if (!record.isNew() && currentNum && !currentNum.startsWith("BORR-")) {
    e.next();
    return;
  }

  // Si el número enviado por el cliente/frontend ya es un consecutivo oficial (ej: FV-00003766),
  // verificamos si YA existe en la BD. Si NO existe, lo respetamos y actualizamos la resolución.
  if (currentNum && !currentNum.startsWith("BORR-")) {
    let alreadyExists = false;
    try {
      const existingInv = $app.findFirstRecordByFilter(collectionName, "number='" + currentNum + "' && id != '" + record.id + "'");
      if (existingInv) alreadyExists = true;
    } catch (_) {}

    if (!alreadyExists) {
      try {
        const existingTx = $app.findFirstRecordByFilter("transactions", "number='" + currentNum + "' && id != '" + record.id + "'");
        if (existingTx) alreadyExists = true;
      } catch (_) {}
    }

    if (!alreadyExists) {
      const parts = currentNum.split("-");
      const numVal = parseInt(parts[parts.length - 1], 10) || 0;
      
      e.next();

      if (numVal > 0) {
        try {
          const docTypeLocal = collectionName === "purchase_invoices" ? "DS" : (record.getString("pos_shift_id") ? "POS" : "FV");
          const prefixLocal = currentNum.includes("-") ? parts[0].toUpperCase() : "";
          let filterLocal = "active = true && document_type = '" + docTypeLocal + "'";
          if (prefixLocal) filterLocal += " && prefix = '" + prefixLocal + "'";
          
          let resolutionLocal = null;
          try { resolutionLocal = $app.findFirstRecordByFilter("dian_resolutions", filterLocal); } catch (_) {}
          if (!resolutionLocal) {
            try { resolutionLocal = $app.findFirstRecordByFilter("dian_resolutions", "active = true && document_type = '" + docTypeLocal + "'"); } catch (_) {}
          }
          
          if (resolutionLocal) {
            const currentResNum = resolutionLocal.getInt("current_number");
            if (numVal > currentResNum) {
              $app.runInTransaction((txApp) => {
                const res = txApp.findRecordById("dian_resolutions", resolutionLocal.id);
                if (numVal > res.getInt("current_number")) {
                  res.set("current_number", numVal);
                  txApp.save(res);
                  console.log("[GRAVY-RESOLUCIONES] Consecutivo de resolución DIAN actualizado a: " + numVal);
                }
              });
            }
          }
          const rawTxTypeId = record.get("tx_type_id");
          const txTypeIdLocal = String(Array.isArray(rawTxTypeId) ? (rawTxTypeId[0] || "") : (rawTxTypeId || "")).trim();
          if (txTypeIdLocal) {
            try {
              $app.runInTransaction((txApp) => {
                const tt = txApp.findRecordById("transaction_types", txTypeIdLocal);
                if (numVal > Number(tt.get("consecutive") || 0)) {
                  tt.set("consecutive", numVal);
                  txApp.save(tt);
                }
              });
            } catch (_) {}
          }
        } catch (errSync) {
          console.log("[GRAVY-RESOLUCIONES] Error sincronizando consecutivo DIAN: " + errSync);
        }
      }
      return;
    }
    // Si ya existía el número en la BD, la ejecución NO retorna y cae en el bloque de auto-generación de abajo.
  }

  let docType = "FV"; // Por defecto Factura de Venta
  const posShiftId = record.getString("pos_shift_id");
  const rawTxTypeId = record.get("tx_type_id");
  const txTypeId = String(Array.isArray(rawTxTypeId) ? (rawTxTypeId[0] || "") : (rawTxTypeId || "")).trim();
  let txTypePrefix = "";

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
      let txNumber = "";
      let finalConsecutive = 0;
      if (txTypeRecord) {
        try {
          const txType = $app.findRecordById("transaction_types", txTypeId);
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
              finalConsecutive = consecutiveRaw;
              break;
            }
          }
          if (txNumber) {
            record.set("number", txNumber);
            console.log("[GRAVY-HOOK] Asignado consecutivo interno para compra (pre-guardado): " + txNumber);
          }
        } catch(e) {
          console.log("[GRAVY-HOOK] Error generando consecutivo interno para compra", e);
        }
      }
      
      // Guardamos primero en la base de datos
      e.next();

      // Si tiene éxito, actualizamos el consecutivo en la serie
      if (finalConsecutive > 0 && txTypeId) {
        try {
          $app.runInTransaction((txApp) => {
            const tt = txApp.findRecordById("transaction_types", txTypeId);
            const currentConsec = Number(tt.get("consecutive") || 0);
            if (finalConsecutive > currentConsec) {
              tt.set("consecutive", finalConsecutive);
              txApp.save(tt);
              console.log("[GRAVY-HOOK] Guardado consecutivo interno para compra en DB: " + finalConsecutive);
            }
          });
        } catch (err) {
          console.log("[GRAVY-HOOK] Error al actualizar consecutivo interno para compra post-creacion: " + err);
        }
      }
      return;
    }
  } else {
    let isElectronic = true;
    if (txTypeId) {
      try {
        const txType = $app.findRecordById("transaction_types", txTypeId);
        const code = (txType.getString("code") || "").toUpperCase().trim();
        const prefix = (txType.getString("prefix") || "").toUpperCase().trim();
        const name = (txType.getString("name") || "").toUpperCase();
        txTypePrefix = prefix;

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

    // Verificar si existe alguna resolución DIAN activa para este docType y prefix
    let hasResolution = false;
    let testFilter = "active = true && document_type = '" + docType + "'";
    if (txTypePrefix) {
      testFilter += " && prefix = '" + txTypePrefix + "'";
    }
    try {
      const testRes = $app.findFirstRecordByFilter("dian_resolutions", testFilter);
      if (testRes) {
        hasResolution = true;
      }
    } catch (_) {
      // Si no encontramos con el prefijo, probar con el tipo de documento general sin prefijo (solo para prefijos electrónicos típicos)
      const isElectronicPrefix = txTypePrefix === "FV" || txTypePrefix === "NC" || txTypePrefix === "ND" || txTypePrefix === "POS" || txTypePrefix === "FE" || txTypePrefix === "";
      if (isElectronicPrefix) {
        try {
          const testResFallback = $app.findFirstRecordByFilter("dian_resolutions", "active = true && document_type = '" + docType + "'");
          if (testResFallback) {
            hasResolution = true;
          }
        } catch (_) {}
      }
    }

    if (!hasResolution) {
      isElectronic = false;
    }

    if (!isElectronic) {
      let txNumber = "";
      let finalConsecutive = 0;
      try {
        const txType = $app.findRecordById("transaction_types", txTypeId);
        const prefix = String(txType.getString("prefix") || txType.getString("code") || "RM").trim().toUpperCase() || "RM";
        let consecutiveRaw = Number(txType.get("consecutive") || 0);

        while (true) {
          consecutiveRaw++;
          txNumber = `${prefix}-${String(consecutiveRaw).padStart(8, "0")}`;
          let found = false;
          try {
            $app.findFirstRecordByFilter("invoices", "number='" + txNumber + "'");
            found = true;
          } catch (e) {}

          if (!found) {
            try {
              $app.findFirstRecordByFilter("transactions", "number='" + txNumber + "'");
              found = true;
            } catch (e) {}
          }

          if (!found) {
            finalConsecutive = consecutiveRaw;
            break;
          }
        }
        if (txNumber) {
          record.set("number", txNumber);
          console.log("[GRAVY-HOOK] Asignado consecutivo interno para no-electrónico (pre-guardado): " + txNumber);
        }
      } catch(e) {
        console.log("[GRAVY-HOOK] Error generando consecutivo interno para no-electrónico", e);
      }
      
      // Guardar en la base de datos primero
      e.next();

      // Si tiene éxito, actualizamos el consecutivo en la serie
      if (finalConsecutive > 0 && txTypeId) {
        try {
          $app.runInTransaction((txApp) => {
            const tt = txApp.findRecordById("transaction_types", txTypeId);
            const currentConsec = Number(tt.get("consecutive") || 0);
            if (finalConsecutive > currentConsec) {
              tt.set("consecutive", finalConsecutive);
              txApp.save(tt);
              console.log("[GRAVY-HOOK] Guardado consecutivo interno para no-electrónico en DB: " + finalConsecutive);
            }
          });
        } catch (err) {
          console.log("[GRAVY-HOOK] Error al actualizar consecutivo interno para no-electrónico post-creacion: " + err);
        }
      }
      return;
    }
  }

  console.log("[GRAVY-HOOK] Creating " + collectionName + ". Final docType:", docType);

  // Determinar filtro inicial de resolución activa
  if (txTypeId) {
    try {
      const txType = $app.findRecordById("transaction_types", txTypeId);
      txTypePrefix = (txType.getString("prefix") || "").trim().toUpperCase();
    } catch (_) {}
  }

  let filter = "active = true && document_type = '" + docType + "'";
  if (txTypePrefix) {
    const prefixFilter = filter + " && prefix = '" + txTypePrefix + "'";
    try {
      const testRes = $app.findFirstRecordByFilter("dian_resolutions", prefixFilter);
      if (testRes) {
        filter = prefixFilter;
      }
    } catch (_) {}
  }
  let registerId = "";

  // Si es POS y tiene turno, intentar obtener la caja del turno
  if (posShiftId) {
    try {
      const shift = $app.findRecordById("pos_shifts", posShiftId);
      registerId = shift.getString("pos_register_id");
    } catch (_) {}
  }

  let resolutionIdToUpdate = "";
  let nextNumberToSave = 0;
  let formattedNumberLog = "";
  let formattedNumber = "";

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

    const prefix = resolution.getString("prefix");

    // Sincronizar dinámicamente el número actual con el máximo consecutivo entero real en BD
    const maxInv = fetchMaxConsecutive("invoices", prefix);
    const maxTx = fetchMaxConsecutive("transactions", prefix);
    const maxPur = fetchMaxConsecutive("purchase_invoices", prefix);
    const realMaxInDB = Math.max(maxInv, maxTx, maxPur);

    let currentResNum = resolution.getInt("current_number");
    if (realMaxInDB > currentResNum) {
      console.log("[GRAVY-RESOLUCIONES] Sincronizando consecutivo desfasado (" + currentResNum + " -> " + realMaxInDB + ")");
      currentResNum = realMaxInDB;
      try {
        $app.runInTransaction((txApp) => {
          const resRec = txApp.findRecordById("dian_resolutions", resolution.id);
          if (realMaxInDB > resRec.getInt("current_number")) {
            resRec.set("current_number", realMaxInDB);
            txApp.save(resRec);
          }
        });
      } catch (_) {}
    }

    let nextNumber = currentResNum;

    while (true) {
      nextNumber++;

      // Validar límites del rango
      if (nextNumber > maxNumber) {
        throw new BadRequestError("Rango de consecutivos agotado para la resolución DIAN de " + docType + " (Máx autorizado: " + maxNumber + ").");
      }

      // Generar y asignar el número definitivo
      if (docType === "DS" || docType === "NDS") {
        formattedNumber = prefix ? (prefix + String(nextNumber)) : String(nextNumber);
      } else {
        formattedNumber = prefix ? (prefix + "-" + String(nextNumber).padStart(8, '0')) : String(nextNumber).padStart(8, '0');
      }

      let found = false;
      try {
        $app.findFirstRecordByFilter(collectionName, "number='" + formattedNumber + "'");
        found = true;
      } catch (e) {}

      if (!found) {
        try {
          $app.findFirstRecordByFilter("transactions", "number='" + formattedNumber + "'");
          found = true;
        } catch (e) {}
      }

      if (!found) {
        break;
      }
    }
    
    record.set("number", formattedNumber);

    // Guardar variables para actualización posterior si e.next() tiene éxito
    resolutionIdToUpdate = resolution.id;
    nextNumberToSave = nextNumber;
    formattedNumberLog = formattedNumber;

    console.log("[GRAVY-RESOLUCIONES] Asignado consecutivo secuencial (pre-guardado): " + formattedNumber);
  } catch (err) {
    // Fallback de contingencia: si no hay ninguna resolución configurada en la DB (ej: primer arranque local)
    // generamos un número automático para que el sistema siga operando sin fallar.
    let count = 0;
    try {
      const result = $app.findRecordsByFilter("dian_resolutions", "1=1", "", 1);
      count = result.length;
    } catch (_) {}

    if (count === 0) {
      const today = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10).replaceAll("-", "");
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

  // Guardamos primero en la base de datos
  e.next();

  // Si tiene éxito y hay una resolución a actualizar, incrementamos el consecutivo en DB
  if (resolutionIdToUpdate && nextNumberToSave > 0) {
    try {
      $app.runInTransaction((txApp) => {
        const res = txApp.findRecordById("dian_resolutions", resolutionIdToUpdate);
        const currentNum = res.getInt("current_number");
        if (nextNumberToSave > currentNum) {
          res.set("current_number", nextNumberToSave);
          txApp.save(res);
          console.log("[GRAVY-RESOLUCIONES] Consecutivo guardado en resolución DIAN: " + formattedNumberLog);
        }
      });
    } catch (err) {
      console.log("[GRAVY-RESOLUCIONES] Error al guardar consecutivo en resolucion post-creacion: " + err);
    }
  }
};

onRecordCreateRequest(resolutionHandler, "invoices");
onRecordUpdateRequest(resolutionHandler, "invoices");
onRecordCreateRequest(resolutionHandler, "purchase_invoices");
onRecordUpdateRequest(resolutionHandler, "purchase_invoices");

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
    function fetchMaxConsecutiveBoot(tableName, prefix) {
      let maxVal = 0;
      try {
        const db = $app.nonconcurrentDB();
        let sql = "";
        if (prefix) {
          sql = "SELECT number FROM " + tableName + " WHERE number LIKE '" + prefix + "-%' AND number NOT LIKE 'BORR-%'";
        } else {
          sql = "SELECT number FROM " + tableName + " WHERE number NOT LIKE 'BORR-%' AND number != ''";
        }
        const result = [];
        db.newQuery(sql).all(result);
        for (let i = 0; i < result.length; i++) {
          const nStr = String(result[i].number || "");
          const matches = nStr.match(/\d+/g);
          if (matches && matches.length > 0) {
            const val = parseInt(matches[matches.length - 1], 10);
            if (!isNaN(val) && val > maxVal) {
              maxVal = val;
            }
          }
        }
      } catch (_) {}
      return maxVal;
    }

    const resolutions = $app.findRecordsByFilter("dian_resolutions", "active = true", "");
    for (const res of resolutions) {
      const pfx = (res.getString("prefix") || "").trim().toUpperCase();
      if (pfx) {
        const maxInv = fetchMaxConsecutiveBoot("invoices", pfx);
        const maxTx = fetchMaxConsecutiveBoot("transactions", pfx);
        const maxPur = fetchMaxConsecutiveBoot("purchase_invoices", pfx);
        const realMax = Math.max(maxInv, maxTx, maxPur);
        if (realMax > res.getInt("current_number")) {
          res.set("current_number", realMax);
          $app.save(res);
          console.log("[GRAVY-RESOLUCIONES Bootstrap] Consecutivo ajustado para resolución " + pfx + " a " + realMax);
        }
      }
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

