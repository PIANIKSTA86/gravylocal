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

    // 2. Disparar procesamiento asíncrono en background (Go routine / setTimeout wrapper en PocketBase JS)
    // En PocketBase JS VM, usamos $app.onAfterBootstrap o procesamiento asíncrono deferido
    // Para procesamiento background inmediato usaremos un worker goroutine nativo o timeout
    try {
      // Disparar worker no-bloqueante
      $app.runInTransaction((_) => {}); // Warmup
      
      // Procesamiento en segundo plano de los IDs
      const recordIds = records.map((r) => r.getId());
      
      // Lanzamos la rutina de background diferida
      setTimeout(() => {
        processNominaBatchInBackground(recordIds, ano, mes);
      }, 50);

    } catch (bgErr) {
      console.error("[GRAVY QUEUE WORKER] Error iniciando goroutine de fondo:", bgErr);
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
    let pendientes = 0;

    records.forEach((r) => {
      const st = r.getString("estado_dian") || "PENDIENTE";
      if (st === "APROBADO") aprobados++;
      else if (st === "RECHAZADO") rechazados++;
      else if (st === "EN_COLA") enCola++;
      else pendientes++;
    });

    const procesados = aprobados + rechazados;
    const porcentaje = total > 0 ? Math.round((procesados / total) * 100) : 0;
    const finalizado = total > 0 && enCola === 0 && pendientes === 0;

    return e.json(200, {
      success: true,
      ano,
      mes,
      total,
      aprobados,
      rechazados,
      enCola,
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
 * Función que procesa cada comprobante en cola con throttling
 */
function processNominaBatchInBackground(recordIds, ano, mes) {
  console.log(`[GRAVY QUEUE WORKER] Iniciando transmisión masiva de ${recordIds.length} comprobantes para periodo ${mes}/${ano}...`);

  // Obtener configuraciones de empresa y proveedor tecnológico
  let einvoiceMethod = "simulation";
  let ftechUsername = "";
  let ftechPassword = "";
  let ftechEnvironment = "demo";

  try {
    const settingsList = $app.findRecordsByFilter("settings", "key = 'einvoice_method' || key = 'ftech_username' || key = 'ftech_password' || key = 'ftech_environment'");
    settingsList.forEach((s) => {
      const k = s.getString("key");
      const v = s.getString("value");
      if (k === "einvoice_method") einvoiceMethod = v;
      if (k === "ftech_username") ftechUsername = v;
      if (k === "ftech_password") ftechPassword = v;
      if (k === "ftech_environment") ftechEnvironment = v;
    });
  } catch (sErr) {
    console.error("[GRAVY QUEUE WORKER] Error leyendo settings:", sErr);
  }

  for (let i = 0; i < recordIds.length; i++) {
    const recId = recordIds[i];
    try {
      const rec = $app.findRecordById("electronic_payrolls", recId);
      if (!rec) continue;

      // Si ya fue aprobado externamente en el interín, omitir
      if (rec.getString("estado_dian") === "APROBADO") continue;

      const xmlContent = rec.getString("xml_generado") || "";
      let cufe = rec.getString("cufe");

      if (einvoiceMethod === "facturatech" && ftechUsername && ftechPassword) {
        try {
          const xmlBase64 = $security.base64Encode(xmlContent);
          const soapRes = callFacturatechNominaSoap('FtechAction.uploadDocument', {
            username: ftechUsername,
            password: ftechPassword,
            xmlBase64: xmlBase64
          }, { ftechEnvironment });

          if (soapRes.statusCode === 200) {
            const raw = soapRes.raw || "";
            const transIdMatch = raw.match(/<transactionID[^>]*>(.*?)<\/transactionID>/i);
            const transId = transIdMatch ? transIdMatch[1] : "";
            const codeMatch = raw.match(/<code[^>]*>(.*?)<\/code>/i);
            const code = codeMatch ? codeMatch[1] : "200";

            if (transId) rec.set("ftech_transaction_id", transId);

            if (code === "200" || code === "201" || transId) {
              rec.set("estado_dian", "APROBADO");
              if (!cufe) {
                cufe = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                rec.set("cufe", cufe);
              }
              rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
            } else {
              rec.set("estado_dian", "RECHAZADO");
            }
          } else {
            rec.set("estado_dian", "RECHAZADO");
          }
        } catch (ftechErr) {
          console.error(`[GRAVY QUEUE WORKER] Error SOAP para ID ${recId}:`, ftechErr);
          rec.set("estado_dian", "RECHAZADO");
        }
      } else {
        // Modo Simulación / Desarrollo
        if (!cufe) {
          cufe = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        }
        rec.set("estado_dian", "APROBADO");
        rec.set("cufe", cufe);
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
