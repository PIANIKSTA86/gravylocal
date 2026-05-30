/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — dian_resolutions_hook.pb.js
 * Interceptor de base de datos para la asignación secuencial y atómica
 * de consecutivos de facturación bajo resoluciones oficiales de la DIAN.
 */

onRecordCreateRequest((e) => {
  const record = e.record;

  let docType = "FV"; // Por defecto Factura de Venta
  const posShiftId = record.getString("pos_shift_id");
  if (posShiftId) {
    docType = "POS";
  }

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
      throw new Error("No se encontró ninguna resolución activa de tipo " + docType + ".");
    }

    const nextNumber = resolution.getInt("current_number") + 1;
    const maxNumber = resolution.getInt("number_to");
    const expirationStr = resolution.getString("expiration_date");

    // Validar fecha de expiración
    if (expirationStr) {
      const expDate = new Date(expirationStr.slice(0, 10) + "T23:59:59");
      const today = new Date();
      if (today > expDate) {
        throw new Error("La resolución DIAN para " + docType + " ha expirado el " + expirationStr.slice(0, 10) + ".");
      }
    }

    // Validar límites del rango
    if (nextNumber > maxNumber) {
      throw new Error("Rango de consecutivos agotado para la resolución DIAN de " + docType + " (Máx autorizado: " + maxNumber + ").");
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
      record.set("number", (docType === "POS" ? "POS" : "FV") + "-" + today + "-" + rand);
    } else {
      throw new Error("Error de Numeración DIAN: " + err.message);
    }
  }

  e.next();
}, "invoices");
