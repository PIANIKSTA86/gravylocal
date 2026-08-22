/**
 * GRAVY ERP — Queue Worker Asíncrono para Transmisión Masiva de Nómina Electrónica
 * Archivo: pb_hooks/dian_nomina_queue.pb.js
 */

routerAdd('POST', '/api/dian/nomina/emit-batch-async', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const ano = parseInt(body.ano || body.year || '0', 10);
    const mes = parseInt(body.mes || body.month || '0', 10);

    if (!ano || !mes) {
      return e.json(400, { success: false, message: "Año y mes son obligatorios para el procesamiento en lote." });
    }

    // Buscar comprobantes pendientes de este periodo
    const records = $app.findRecordsByFilter(
      "electronic_payrolls",
      `ano = ${ano} && mes = ${mes} && estado_dian != 'APROBADO'`
    );

    if (!records || records.length === 0) {
      return e.json(200, {
        success: true,
        queued: 0,
        message: "No hay comprobantes pendientes de emisión para este mes (todos están APROBADOS o no existen)."
      });
    }

    // 1. Marcar todos los comprobantes pendientes como 'EN_COLA'
    $app.runInTransaction((txApp) => {
      records.forEach((rec) => {
        rec.set("estado_dian", "EN_COLA");
        txApp.save(rec);
      });
    });

    // 2. Disparar procesamiento asíncrono en background
    try {
      const recordIds = records.map((r) => r.getId());
      
      setTimeout(() => {
        processNominaBatchInBackground(recordIds, ano, mes);
      }, 50);

    } catch (bgErr) {
      console.error("[GRAVY QUEUE WORKER] Error iniciando rutina de fondo:", bgErr);
    }

    return e.json(202, {
      success: true,
      queued: records.length,
      message: `Transmisión masiva encolada exitosamente para ${records.length} volantes de nómina.`
    });

  } catch (err) {
    console.error("[GRAVY QUEUE WORKER] Error en /api/dian/nomina/emit-batch-async:", err);
    return e.json(500, { success: false, message: "Error al iniciar cola masiva: " + err.message });
  }
});

routerAdd('GET', '/api/dian/nomina/batch-status', (e) => {
  try {
    const ano = parseInt(e.requestInfo().query.ano || e.requestInfo().query.year || '0', 10);
    const mes = parseInt(e.requestInfo().query.mes || e.requestInfo().query.month || '0', 10);

    if (!ano || !mes) {
      return e.json(400, { success: false, message: "Año y mes son requeridos." });
    }

    const records = $app.findRecordsByFilter(
      "electronic_payrolls",
      `ano = ${ano} && mes = ${mes}`
    );

    const total = records.length;
    let aprobados = 0;
    let rechazados = 0;
    let enCola = 0;
    let enProceso = 0;
    let pendientes = 0;

    records.forEach((r) => {
      const st = r.getString("estado_dian") || "PENDIENTE";
      if (st === "APROBADO" || st === "SIMULADO") aprobados++;
      else if (st === "RECHAZADO") rechazados++;
      else if (st === "EN_COLA") enCola++;
      else if (st === "EN_PROCESO") enProceso++;
      else pendientes++;
    });

    const procesados = aprobados + rechazados;
    const porcentaje = total > 0 ? Math.round((procesados / total) * 100) : 0;
    const finalizado = total > 0 && enCola === 0 && enProceso === 0 && pendientes === 0;

    return e.json(200, {
      success: true,
      ano,
      mes,
      total,
      aprobados,
      rechazados,
      enCola,
      enProceso,
      pendientes,
      procesados,
      porcentaje,
      finalizado
    });

  } catch (err) {
    console.error("[GRAVY QUEUE WORKER] Error en /api/dian/nomina/batch-status:", err);
    return e.json(500, { success: false, message: "Error consultando estado del lote: " + err.message });
  }
});

/**
 * Helper para decodificar Base64 a UTF-8
 */
function decodeBase64Utf8Queue(b64) {
  if (!b64) return "";
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let input = String(b64).replace(/[^A-Za-z0-9\+\/\=]/g, "");
    let i = 0;
    let utf8Xml = "";
    while (i < input.length) {
      let enc1 = chars.indexOf(input.charAt(i++));
      let enc2 = chars.indexOf(input.charAt(i++));
      let enc3 = chars.indexOf(input.charAt(i++));
      let enc4 = chars.indexOf(input.charAt(i++));
      let chr1 = (enc1 << 2) | (enc2 >> 4);
      let chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      let chr3 = ((enc3 & 3) << 6) | enc4;
      utf8Xml += String.fromCharCode(chr1);
      if (enc3 !== 64) utf8Xml += String.fromCharCode(chr2);
      if (enc4 !== 64) utf8Xml += String.fromCharCode(chr3);
    }
    return decodeURIComponent(escape(utf8Xml));
  } catch (_) {
    return b64;
  }
}

/**
 * Función que procesa cada comprobante en cola con transmisión DIAN / Facturatech
 */
function processNominaBatchInBackground(recordIds, ano, mes) {
  console.log(`[GRAVY QUEUE WORKER] Iniciando transmisión masiva de ${recordIds.length} comprobantes para periodo ${mes}/${ano}...`);

  function getSettingQueue(key, defaultValue) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key.replace(/'/g, "''") + "'");
      return (r ? r.get("value") : null) || defaultValue;
    } catch (_) {
      return defaultValue;
    }
  }

  let einvoiceMethod = getSettingQueue("einvoice_method", "simulation");
  let ftechUsername = getSettingQueue("ftech_username", "");
  let ftechPassword = getSettingQueue("ftech_password", "");
  let ftechEnvironment = getSettingQueue("ftech_environment", "demo");

  for (let i = 0; i < recordIds.length; i++) {
    const recId = recordIds[i];
    try {
      const rec = $app.findRecordById("electronic_payrolls", recId);
      if (!rec) continue;

      // Si ya fue aprobado externamente en el interín, omitir
      if (rec.getString("estado_dian") === "APROBADO") continue;

      const xmlContent = rec.getString("xml_generado") || "";
      let cufe = rec.getString("cufe");

      if (einvoiceMethod === "facturatech" && ftechUsername) {
        try {
          const prefijo = rec.getString("prefijo") || "NOM";
          const consecutivo = rec.getInt("consecutivo") || 1;

          const resHub = $http.send({
            url: "http://127.0.0.1:8088/api/facturatech/upload-and-send",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              xmlContent: xmlContent,
              ftechUsername: ftechUsername,
              ftechPassword: ftechPassword,
              ftechEnvironment: ftechEnvironment,
              documentType: "NominaIndividual",
              documentNumber: `${prefijo}${consecutivo}`,
              prefix: prefijo,
              folio: consecutivo,
              isNomina: true
            })
          });

          if (resHub.statusCode === 200) {
            let hubResData = {};
            try {
              hubResData = JSON.parse(resHub.raw);
            } catch (_) {}

            const transId = hubResData.transaccionID || "";
            if (transId) rec.set("ftech_transaction_id", transId);

            let finalStatus = "EN_PROCESO";
            try {
              const statusHubRes = $http.send({
                url: "http://127.0.0.1:8088/api/facturatech/check-status",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  transId: transId,
                  ftechUsername: ftechUsername,
                  ftechPassword: ftechPassword,
                  ftechEnvironment: ftechEnvironment,
                  documentType: "NominaIndividual",
                  documentNumber: `${prefijo}${consecutivo}`,
                  prefix: prefijo,
                  folio: consecutivo,
                  isNomina: true
                })
              });

              if (statusHubRes.statusCode === 200) {
                const sData = JSON.parse(statusHubRes.raw);
                if (sData.status === "aceptada" || sData.status === "APROBADO") {
                  finalStatus = "APROBADO";
                  if (sData.xmlContent && sData.xmlContent.includes("<")) {
                    rec.set("xml_generado", sData.xmlContent);
                    const cMatch = sData.xmlContent.match(/<cbc:UUID[^>]*>(.*?)<\/cbc:UUID>/i) ||
                                   sData.xmlContent.match(/<CUNE[^>]*>(.*?)<\/CUNE>/i) ||
                                   sData.xmlContent.match(/CUNE="([0-9a-fA-F]{64,96})"/i);
                    if (cMatch && cMatch[1]) {
                      rec.set("cufe", cMatch[1].trim());
                    }
                  }
                } else if (sData.status === "rechazada" || sData.status === "RECHAZADO") {
                  finalStatus = "RECHAZADO";
                }
              }
            } catch (_) {}

            rec.set("estado_dian", finalStatus);
            rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
          } else {
            rec.set("estado_dian", "RECHAZADO");
          }
        } catch (ftechErr) {
          console.error(`[GRAVY QUEUE WORKER] Error Hub para ID ${recId}:`, ftechErr);
          rec.set("estado_dian", "RECHAZADO");
        }
      } else {
        // Modo Simulación / Desarrollo explícito
        rec.set("estado_dian", "SIMULADO");
        rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
      }

      $app.save(rec);
      console.log(`[GRAVY QUEUE WORKER] Comprobante ${i + 1}/${recordIds.length} [ID ${recId}] procesado -> Estado: ${rec.getString("estado_dian")}`);

    } catch (lineErr) {
      console.error(`[GRAVY QUEUE WORKER] Error procesando registro ID ${recId}:`, lineErr);
    }
  }

  console.log(`[GRAVY QUEUE WORKER] FINALIZADO lote masivo periodo ${mes}/${ano}.`);
}
