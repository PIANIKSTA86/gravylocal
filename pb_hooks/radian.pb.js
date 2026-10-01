/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — radian.pb.js
 * Módulo de integración para Eventos RADIAN y Buzón Tributario DIAN vía MATIAS API.
 * 
 * Gestiona:
 * 1. Conexión y llamada unificada a MATIAS API (/api/ubl2.1/events/...)
 * 2. Ingesta por Correo IMAP (dispara al hub :8088/api/imap/sync e importa CUFEs)
 * 3. Ingesta Masiva por Excel oficial DIAN (POST /events/import-excel)
 * 4. Ingesta puntual por CUFE (POST /events/import-track-id)
 * 5. Emisión de eventos legales DIAN:
 *    - 030: Acuse de Recibo
 *    - 032: Recibo del Bien y/o Prestación del Servicio
 *    - 033: Aceptación Expresa (Título Valor)
 *    - 031: Reclamo con Causales (Inconsistencias, No entrega, etc.)
 */

// Helper para obtener configuración segura
function getRadianSetting(key, defVal) {
  try {
    const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
    return (r ? r.get("value") : null) || defVal;
  } catch (_) {
    return defVal;
  }
}

// Obtener URL base de MATIAS API según ambiente
function getMatiasBaseUrl() {
  const env = getRadianSetting("matias_environment", "sandbox");
  if (env === "production") {
    const customUrl = getRadianSetting("matias_custom_url", "");
    return customUrl ? customUrl.replace(/\/+$/, "") : "https://api.matias-api.com/api/ubl2.1";
  }
  return "https://sandbox-api.matias-api.com/api/ubl2.1";
}

// Invocador HTTP centralizado para MATIAS API
function callMatiasApi(endpoint, method, payload) {
  const baseUrl = getMatiasBaseUrl();
  const token = getRadianSetting("matias_api_token", "");
  const clientUuid = getRadianSetting("matias_client_uuid", "");

  if (!token) {
    throw new Error("Token de MATIAS API no configurado. Vaya a Configuración -> Facturación Electrónica.");
  }

  let fullUrl = baseUrl + endpoint;
  if (clientUuid) {
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + "client_uuid=" + encodeURIComponent(clientUuid);
  }

  const reqOptions = {
    url: fullUrl,
    method: method || "GET",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    timeout: 120
  };

  if (payload && (method === "POST" || method === "PUT" || method === "PATCH")) {
    reqOptions.body = JSON.stringify(payload);
  }

  const res = $http.send(reqOptions);
  let parsed = null;
  try {
    parsed = JSON.parse(res.raw);
  } catch (_) {
    parsed = { raw: res.raw };
  }

  return {
    statusCode: res.statusCode,
    ok: res.statusCode >= 200 && res.statusCode < 300,
    data: parsed,
    raw: res.raw
  };
}
globalThis.callMatiasApi = callMatiasApi;

// --- 1. PROBAR CONEXIÓN IMAP ---
routerAdd('POST', '/api/radian/test-imap', (c) => {
  try {
    const body = c.requestInfo()?.body || {};
    const res = $http.send({
      url: 'http://127.0.0.1:8088/api/imap/test',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeout: 30
    });

    let parsed = {};
    try { parsed = JSON.parse(res.raw); } catch (_) { parsed = { error: res.raw }; }
    return c.json(res.statusCode, parsed);
  } catch (err) {
    return c.json(500, { success: false, error: 'Error contactando el microservicio IMAP: ' + err.message });
  }
});

// --- 2. SINCRONIZAR CORREO DE FACTURACIÓN (BUZÓN IMAP) ---
routerAdd('POST', '/api/radian/sync-email', (c) => {
  try {
    const imapEnabled = getRadianSetting("imap_enabled", "0") === "1";
    const imapHost = getRadianSetting("imap_host", "");
    const imapPort = getRadianSetting("imap_port", "993");
    const imapUser = getRadianSetting("imap_username", "");
    const imapPass = getRadianSetting("imap_password", "");
    const imapTls = getRadianSetting("imap_tls", "1") === "1";

    if (!imapEnabled || !imapHost || !imapUser || !imapPass) {
      return c.json(400, {
        success: false,
        error: "El buzón IMAP no está configurado o está inactivo. Configure el servidor, usuario y contraseña en Configuración -> Buzón IMAP."
      });
    }

    // Llamar al microservicio IMAP en el hub :8088
    const hubRes = $http.send({
      url: 'http://127.0.0.1:8088/api/imap/sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: imapHost,
        port: imapPort,
        user: imapUser,
        pass: imapPass,
        tls: imapTls,
        maxEmails: 50
      }),
      timeout: 180
    });

    if (hubRes.statusCode !== 200) {
      let errDetails = hubRes.raw;
      try {
        const parsedErr = JSON.parse(hubRes.raw);
        errDetails = parsedErr.error || parsedErr.message || hubRes.raw;
      } catch (_) {}
      return c.json(hubRes.statusCode || 500, { success: false, error: "Error en sincronización IMAP: " + errDetails });
    }

    const hubData = JSON.parse(hubRes.raw);
    const invoices = hubData.invoices || [];
    let importedCount = 0;
    let existingCount = 0;

    const col = $app.findCollectionByNameOrId("electronic_documents");

    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      if (!inv.cufe) continue;

      // Verificar si ya existe en la base de datos local
      let existingRecord = null;
      try {
        existingRecord = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + inv.cufe + "'");
      } catch (_) {}

      if (existingRecord) {
        existingCount++;
        continue;
      }

      // Encolar en MATIAS API si hay token configurado
      try {
        const token = getRadianSetting("matias_api_token", "");
        if (token) {
          callMatiasApi("/events/import-track-id", "POST", { trackId: inv.cufe });
        }
      } catch (eMatias) {
        console.warn("[GRAVY RADIAN] Advertencia encolando CUFE en MATIAS API: " + eMatias.message);
      }

      // Crear registro en electronic_documents
      const newDoc = new Record(col, {
        uuid: inv.cufe,
        number: inv.number || "SIN-NUMERO",
        document_type: inv.documentType || "invoice_purchase",
        status: "pendiente",
        issue_date: inv.issueDate || new Date().toISOString().slice(0, 10),
        reception_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        supplier_nit: inv.supplierNit || "",
        supplier_name: inv.supplierName || "PROVEEDOR",
        customer_nit: inv.customerNit || "",
        customer_name: inv.customerName || "",
        subtotal: inv.subtotal || 0,
        tax_amount: inv.taxAmount || 0,
        total: inv.total || 0,
        processed: false,
        import_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        reception_source: "email",
        radian_030_status: "none",
        radian_032_status: "none",
        radian_033_status: "none",
        radian_031_status: "none"
      });

      $app.save(newDoc);
      importedCount++;
    }

    return c.json(200, {
      success: true,
      foundCount: invoices.length,
      importedCount: importedCount,
      existingCount: existingCount,
      message: `Buzón sincronizado. Facturas nuevas: ${importedCount}, existentes: ${existingCount}.`
    });
  } catch (err) {
    console.error("[GRAVY RADIAN] Error en /api/radian/sync-email:", err);
    return c.json(500, { success: false, error: err.message });
  }
});

// --- 3. IMPORTACIÓN MASIVA DESDE EXCEL DE LA DIAN ---
routerAdd('POST', '/api/radian/import-excel', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    const excelBase64 = rawBody.document_base64 || rawBody.excelBase64 || "";

    if (!excelBase64) {
      return c.json(400, { success: false, error: "Debe suministrar el archivo Excel codificado en Base64." });
    }

    // 1. Transmitir archivo Excel a MATIAS API
    const matiasRes = callMatiasApi("/events/import-excel", "POST", {
      document_base64: excelBase64
    });

    if (!matiasRes.ok) {
      const errMsg = matiasRes.data?.message || matiasRes.data?.error || `Error en MATIAS API (${matiasRes.statusCode})`;
      return c.json(matiasRes.statusCode, { success: false, error: errMsg, details: matiasRes.data });
    }

    // 2. Consultar listado de documentos encolados en MATIAS API para sincronizar la base local
    let syncedLocal = 0;
    try {
      const recRes = callMatiasApi("/events/document-receptions?limit=50", "GET");
      if (recRes.ok && recRes.data?.dataRecords?.data) {
        const records = recRes.data.dataRecords.data;
        const col = $app.findCollectionByNameOrId("electronic_documents");

        for (let i = 0; i < records.length; i++) {
          const r = records[i];
          const cufe = r.trackId || r.cufe || r.uuid;
          if (!cufe) continue;

          let localDoc = null;
          try {
            localDoc = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + cufe + "'");
          } catch (_) {}

          if (!localDoc) {
            localDoc = new Record(col, {
              uuid: cufe,
              number: r.number || r.document_number || "RECIBIDA",
              document_type: "invoice_purchase",
              status: "pendiente",
              issue_date: r.date || r.issue_date || new Date().toISOString().slice(0, 10),
              supplier_nit: r.sender_nit || r.emitter_nit || "",
              supplier_name: r.sender_name || r.emitter_name || "PROVEEDOR",
              subtotal: parseFloat(r.subtotal || 0) || 0,
              tax_amount: parseFloat(r.tax_amount || 0) || 0,
              total: parseFloat(r.total || 0) || 0,
              processed: false,
              import_date: new Date().toISOString().replace("T", " ").slice(0, 19),
              reception_source: "excel_dian",
              matias_reception_id: String(r.id || ""),
              radian_030_status: "none",
              radian_032_status: "none",
              radian_033_status: "none",
              radian_031_status: "none"
            });
            $app.save(localDoc);
            syncedLocal++;
          }
        }
      }
    } catch (eSync) {
      console.warn("[GRAVY RADIAN] Aviso sincronizando recepciones locales: " + eSync.message);
    }

    return c.json(200, {
      success: true,
      matiasResult: matiasRes.data,
      syncedLocal: syncedLocal,
      message: `Excel procesado exitosamente por MATIAS API. Facturas sincronizadas localmente: ${syncedLocal}`
    });
  } catch (err) {
    console.error("[GRAVY RADIAN] Error en /api/radian/import-excel:", err);
    return c.json(500, { success: false, error: err.message });
  }
});

// --- 4. IMPORTACIÓN PUNTUAL POR CUFE ---
routerAdd('POST', '/api/radian/import-cufe', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    const cufe = (rawBody.cufe || rawBody.trackId || "").trim();

    if (!cufe) {
      return c.json(400, { success: false, error: "Debe ingresar el CUFE o TrackID de la factura." });
    }

    // Llamar a MATIAS API para importar el documento
    const matiasRes = callMatiasApi("/events/import-track-id", "POST", { trackId: cufe });

    if (!matiasRes.ok) {
      const errMsg = matiasRes.data?.message || matiasRes.data?.error || `Error importando CUFE (${matiasRes.statusCode})`;
      return c.json(matiasRes.statusCode, { success: false, error: errMsg, details: matiasRes.data });
    }

    // Registrar o actualizar localmente
    const col = $app.findCollectionByNameOrId("electronic_documents");
    let localDoc = null;
    try {
      localDoc = $app.findFirstRecordByFilter("electronic_documents", "uuid = '" + cufe + "'");
    } catch (_) {}

    if (!localDoc) {
      localDoc = new Record(col, {
        uuid: cufe,
        number: rawBody.number || "POR-ASIGNAR",
        document_type: "invoice_purchase",
        status: "pendiente",
        issue_date: rawBody.issue_date || new Date().toISOString().slice(0, 10),
        supplier_nit: rawBody.supplier_nit || "",
        supplier_name: rawBody.supplier_name || "PROVEEDOR",
        subtotal: parseFloat(rawBody.subtotal || 0) || 0,
        total: parseFloat(rawBody.total || 0) || 0,
        processed: false,
        import_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        reception_source: "manual_cufe",
        radian_030_status: "none",
        radian_032_status: "none",
        radian_033_status: "none",
        radian_031_status: "none"
      });
      $app.save(localDoc);
    }

    return c.json(200, {
      success: true,
      message: "Factura encolada con éxito en MATIAS API y registrada en GRAVY.",
      matiasData: matiasRes.data
    });
  } catch (err) {
    console.error("[GRAVY RADIAN] Error en /api/radian/import-cufe:", err);
    return c.json(500, { success: false, error: err.message });
  }
});

// --- 5. EMISIÓN DE EVENTOS RADIAN (030, 032, 033, 031) ---
routerAdd('POST', '/api/radian/send-event', (c) => {
  try {
    const rawBody = c.requestInfo()?.body || {};
    const docId = rawBody.docId || "";
    const eventCode = rawBody.code || "030"; // '030', '032', '033', '031'
    const notes = rawBody.notes || "";
    const claimCode = rawBody.claim_code || "";

    if (!docId) {
      return c.json(400, { success: false, error: "Identificador del documento no suministrado." });
    }

    const docRecord = $app.findRecordById("electronic_documents", docId);
    if (!docRecord) {
      return c.json(404, { success: false, error: "Documento electrónico no encontrado en la base de datos." });
    }

    const cufe = docRecord.getString("uuid");
    if (!cufe) {
      return c.json(400, { success: false, error: "El documento no cuenta con un CUFE válido para transmitir ante la DIAN." });
    }

    // Validar orden secuencial RADIAN
    if (eventCode === "032") {
      const s030 = docRecord.getString("radian_030_status");
      if (s030 !== "sent") {
        return c.json(400, { success: false, error: "Debe emitir primero el evento 030 (Acuse de Recibo) antes de confirmar el recibo del bien." });
      }
    } else if (eventCode === "033") {
      const s032 = docRecord.getString("radian_032_status");
      if (s032 !== "sent") {
        return c.json(400, { success: false, error: "Debe emitir primero el evento 032 (Recibo del Bien o Servicio) antes de la Aceptación Expresa." });
      }
    } else if (eventCode === "031") {
      if (!claimCode) {
        return c.json(400, { success: false, error: "Para registrar un reclamo (031) debe seleccionar una causal de reclamo oficial (claim_code: 01, 02, 03, 04)." });
      }
    }

    // Payload para MATIAS API
    const eventPayload = {
      code: eventCode,
      notes: notes || (
        eventCode === "030" ? "Acuse de recibo de factura electrónica" :
        eventCode === "032" ? "Recibo del bien y/o prestación del servicio" :
        eventCode === "033" ? "Aceptación expresa de la factura como título valor" :
        "Reclamo de la factura electrónica"
      )
    };

    if (eventCode === "031") {
      eventPayload.claim_code = claimCode;
    }

    // Enviar a MATIAS API: POST /events/send/{trackId}
    const matiasRes = callMatiasApi(`/events/send/${encodeURIComponent(cufe)}`, "POST", eventPayload);

    if (!matiasRes.ok) {
      const errMsg = matiasRes.data?.message || matiasRes.data?.error || `Error en DIAN/MATIAS API (${matiasRes.statusCode})`;
      return c.json(matiasRes.statusCode, { success: false, error: errMsg, details: matiasRes.data });
    }

    const resData = matiasRes.data || {};
    const nowIso = new Date().toISOString().replace("T", " ").slice(0, 19);
    const eventCude = resData.cude || resData.uuid || resData.trackId || "";

    // Actualizar campos correspondientes en el registro local
    if (eventCode === "030") {
      docRecord.set("radian_030_status", "sent");
      docRecord.set("radian_030_date", nowIso);
      if (eventCude) docRecord.set("radian_030_cude", eventCude);
    } else if (eventCode === "032") {
      docRecord.set("radian_032_status", "sent");
      docRecord.set("radian_032_date", nowIso);
      if (eventCude) docRecord.set("radian_032_cude", eventCude);
    } else if (eventCode === "033") {
      docRecord.set("radian_033_status", "sent");
      docRecord.set("radian_033_date", nowIso);
      if (eventCude) docRecord.set("radian_033_cude", eventCude);
    } else if (eventCode === "031") {
      docRecord.set("radian_031_status", "sent");
      docRecord.set("radian_031_claim_code", claimCode);
      docRecord.set("radian_031_notes", notes);
    }

    docRecord.set("radian_last_response", resData.message || "Evento autorizado por la DIAN.");
    $app.save(docRecord);

    return c.json(200, {
      success: true,
      eventCode: eventCode,
      message: resData.message || "Evento emitido y validado con éxito ante la DIAN.",
      dianData: resData
    });
  } catch (err) {
    console.error("[GRAVY RADIAN] Error en /api/radian/send-event:", err);
    return c.json(500, { success: false, error: err.message });
  }
});

// --- 6. LISTADO Y ESTADOS DEL BUZÓN TRIBUTARIO RADIAN ---
routerAdd('GET', '/api/radian/documents', (c) => {
  try {
    const query = c.requestInfo()?.query || {};
    const filterParts = [];

    if (query.status) {
      filterParts.push(`status = '${query.status}'`);
    }

    if (query.search) {
      const q = String(query.search).replace(/'/g, "''");
      filterParts.push(`(number ~ '${q}' || supplier_name ~ '${q}' || supplier_nit ~ '${q}' || uuid ~ '${q}')`);
    }

    const filter = filterParts.join(" && ");
    const records = $app.findRecordsByFilter(
      "electronic_documents",
      filter || "id != ''",
      "-issue_date",
      parseInt(query.limit || 50, 10),
      0
    );

    const docs = records.map((r) => ({
      id: r.id,
      uuid: r.getString("uuid"),
      number: r.getString("number"),
      document_type: r.getString("document_type"),
      status: r.getString("status"),
      issue_date: r.getString("issue_date"),
      reception_date: r.getString("reception_date"),
      supplier_nit: r.getString("supplier_nit"),
      supplier_name: r.getString("supplier_name"),
      customer_nit: r.getString("customer_nit"),
      customer_name: r.getString("customer_name"),
      subtotal: r.getFloat("subtotal"),
      tax_amount: r.getFloat("tax_amount"),
      total: r.getFloat("total"),
      transaction_id: r.getString("transaction_id"),
      reception_source: r.getString("reception_source"),
      radian_030_status: r.getString("radian_030_status") || "none",
      radian_030_date: r.getString("radian_030_date"),
      radian_030_cude: r.getString("radian_030_cude"),
      radian_032_status: r.getString("radian_032_status") || "none",
      radian_032_date: r.getString("radian_032_date"),
      radian_032_cude: r.getString("radian_032_cude"),
      radian_033_status: r.getString("radian_033_status") || "none",
      radian_033_date: r.getString("radian_033_date"),
      radian_033_cude: r.getString("radian_033_cude"),
      radian_031_status: r.getString("radian_031_status") || "none",
      radian_031_claim_code: r.getString("radian_031_claim_code"),
      radian_031_notes: r.getString("radian_031_notes"),
      radian_last_response: r.getString("radian_last_response")
    }));

    return c.json(200, { success: true, count: docs.length, documents: docs });
  } catch (err) {
    console.error("[GRAVY RADIAN] Error en /api/radian/documents:", err);
    return c.json(500, { success: false, error: err.message });
  }
});
