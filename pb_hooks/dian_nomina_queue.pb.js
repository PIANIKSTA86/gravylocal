/**
 * GRAVY ERP — Queue Worker Asíncrono para Transmisión Masiva de Nómina Electrónica
 * Archivo: pb_hooks/dian_nomina_queue.pb.js
 */

routerAdd('POST', '/api/dian/nomina/emit', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const recordId = body.id || body.electronicPayrollId;
    const reassignConsecutive = !!body.reassignConsecutive;

    if (!recordId) {
      return e.json(400, { success: false, message: "ID del comprobante de nómina es obligatorio." });
    }

    const rec = $app.findRecordById("electronic_payrolls", recordId);
    if (!rec) {
      return e.json(404, { success: false, message: "Comprobante de nómina no encontrado." });
    }

    function getSettingSingle(key, defaultValue) {
      try {
        const r = $app.findFirstRecordByFilter("settings", "key = '" + key.replace(/'/g, "''") + "'");
        return (r ? r.get("value") : null) || defaultValue;
      } catch (_) {
        return defaultValue;
      }
    }

    let prefijo = rec.getString("prefijo") || "NOM";
    let consecutivo = rec.getInt("consecutivo") || 1;

    // Si se solicitó reasignar consecutivo (por rechazo o nueva emisión)
    if (reassignConsecutive) {
      const isAjuste = prefijo.includes("AJ") || prefijo.startsWith("NA") || (rec.getString("xml_generado") || "").includes("NominaIndividualDeAjuste");
      const resDocType = isAjuste ? "NANE" : "NE";
      try {
        const resRec = $app.findFirstRecordByFilter("dian_resolutions", `document_type = '${resDocType}' && active = true`);
        if (resRec) {
          prefijo = (resRec.getString("prefix") || prefijo).trim();
          consecutivo = resRec.getInt("current_number") || consecutivo;
          resRec.set("current_number", consecutivo + 1);
          $app.save(resRec);
        }
      } catch (_) {}
      rec.set("prefijo", prefijo);
      rec.set("consecutivo", consecutivo);
    }

    let einvoiceMethod = getSettingSingle("einvoice_method", "simulation");
    let ftechUsername = getSettingSingle("ftech_username", "");
    let ftechPassword = getSettingSingle("ftech_password", "");
    let ftechEnvironment = getSettingSingle("ftech_environment", "demo");

    const xmlContent = rec.getString("xml_generado") || "";
    const isAjusteDoc = prefijo.includes("AJ") || prefijo.startsWith("NA") || xmlContent.includes("NominaIndividualDeAjuste");
    const docTypeName = isAjusteDoc ? "NominaIndividualDeAjuste" : "NominaIndividual";

    if (einvoiceMethod === "matias") {
      try {
        const caller = typeof globalThis.getMatiasCaller === "function" ? globalThis.getMatiasCaller() : null;
        const matiasCaller = caller || function(ep, method, pl) {
          const rTok = $app.findFirstRecordByFilter("settings", "key = 'matias_api_token'");
          const token = rTok ? rTok.get("value") : "";
          const rEnv = $app.findFirstRecordByFilter("settings", "key = 'matias_environment'");
          const env = (rEnv ? rEnv.get("value") : "") || "production";
          const baseUrl = env === "production" ? "https://api-v2.matias-api.com" : "https://sandbox-api.matias-api.com";
          const res = $http.send({
            url: baseUrl + ep,
            method: method || "POST",
            headers: {
              "Authorization": "Bearer " + token,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: pl ? JSON.stringify(pl) : "",
            timeout: 60
          });
          let parsed = null;
          try { parsed = JSON.parse(res.raw); } catch (_) { parsed = { raw: res.raw }; }
          return { statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed, raw: res.raw };
        };

        const builder = require(`${__hooks}/dian_nomina_matias_builder.js`);
        const { endpoint, payload } = builder.buildMatiasPayrollPayloadFromRec(rec, isAjusteDoc, prefijo, consecutivo);
        console.log(`[GRAVY NOMINA MATIAS] Emitiendo a ${endpoint}:`, JSON.stringify(payload).slice(0, 300));

        const matiasRes = matiasCaller(endpoint, "POST", payload);
        const matiasData = matiasRes.data || {};

        if (matiasRes.statusCode === 200 && matiasData.success) {
          const resp = matiasData.response || {};
          const isDianValid = (resp.IsValid === "true" || resp.IsValid === true || resp.StatusCode === "00");
          const xmlDocKey = matiasData.XmlDocumentKey || "";

          let statusMsg = resp.StatusDescription || resp.StatusMessage || matiasData.message || "Procesado por la DIAN";
          if (!isDianValid && resp.ErrorMessage) {
            let em = resp.ErrorMessage.string || resp.ErrorMessage;
            if (Array.isArray(em)) em = em.join(" | ");
            statusMsg = String(em);
          }

          const finalStatus = isDianValid ? "APROBADO" : "RECHAZADO";
          rec.set("estado_dian", finalStatus);
          rec.set("dian_response", statusMsg);
          rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
          if (xmlDocKey) rec.set("cufe", xmlDocKey.trim());
          if (finalStatus === "APROBADO" && xmlDocKey) {
            try {
              const xmlRes = matiasCaller(`/documents/xml/${encodeURIComponent(xmlDocKey.trim())}`, "GET");
              const b64 = (xmlRes && xmlRes.data && xmlRes.data.content && xmlRes.data.content.XmlBytesBase64) ||
                          (xmlRes && xmlRes.data && xmlRes.data.XmlBytesBase64) ||
                          (matiasData && matiasData.XmlBase64Bytes) || null;
              if (b64) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                let input = String(b64).replace(/[^A-Za-z0-9\+\/\=]/g, '');
                let i = 0, utf8Xml = '';
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
                let decodedXml = utf8Xml;
                try {
                  if (typeof escape === 'function') decodedXml = decodeURIComponent(escape(utf8Xml));
                } catch (_) {}
                if (decodedXml && decodedXml.includes('<')) {
                  try {
                    $app.db().newQuery("UPDATE electronic_payrolls SET xml_generado = {:xml} WHERE id = {:id}").bind({ id: rec.id, xml: decodedXml }).execute();
                    console.log('[CHECK STATUS NOMINA] XML firmado guardado exitosamente vía DB, longitud:', decodedXml.length);
                  } catch (eDb) {
                    console.warn('[CHECK STATUS NOMINA] Error guardando XML en DB:', eDb);
                    rec.set('xml_generado', decodedXml);
                  }
                }
              }
            } catch (eXml) {
              console.warn("[GRAVY NOMINA MATIAS] No se pudo obtener XML firmado de MATIAS:", eXml);
            }
          } else if (matiasData.XmlBase64Bytes && typeof decodeBase64Utf8Queue === "function") {
            try {
              const decodedXml = decodeBase64Utf8Queue(matiasData.XmlBase64Bytes);
              if (decodedXml && decodedXml.includes("<")) rec.set("xml_generado", decodedXml);
            } catch (_) {}
          }

          $app.save(rec);

          // Si es una Nota de Ajuste de Eliminación (Tipo 2) aprobada, actualizar el documento predecesor a ANULADO
          if (finalStatus === "APROBADO" && isAjusteDoc) {
            try {
              const rawJson = rec.getString("xml_generado") || "";
              let predNum = null;
              let predCune = null;
              if (rawJson.startsWith("{")) {
                const pj = JSON.parse(rawJson);
                if (pj.payroll_type === "delete" || pj.deleting_predecessor) {
                  predNum = pj.deleting_predecessor ? pj.deleting_predecessor.number : null;
                  predCune = pj.deleting_predecessor ? pj.deleting_predecessor.cune : null;
                }
              } else if (rawJson.includes("<Eliminar>")) {
                const mNum = rawJson.match(/NumeroPred\s*=\s*"([^"]*)"/i);
                const mCune = rawJson.match(/CUNEPred\s*=\s*"([^"]*)"/i);
                if (mNum) predNum = mNum[1];
                if (mCune) predCune = mCune[1];
              }

              if (predCune || predNum) {
                const filter = predCune ? `cufe = '${predCune.replace(/'/g, "''")}'` : `consecutivo = ${parseInt(String(predNum).replace(/[^0-9]/g, '')) || 0}`;
                const predRec = $app.findFirstRecordByFilter("electronic_payrolls", filter);
                if (predRec) {
                  predRec.set("estado_dian", "ANULADO");
                  predRec.set("dian_response", `Anulado formalmente ante la DIAN mediante Nota de Ajuste ${prefijo}-${consecutivo}`);
                  $app.save(predRec);
                  console.log(`[GRAVY NOMINA] Documento predecesor ${predRec.getString("prefijo")}-${predRec.getInt("consecutivo")} actualizado a ANULADO.`);
                }
              }
            } catch (errPred) {
              console.error("[GRAVY NOMINA] Error al actualizar estado del predecesor:", errPred);
            }
          }

          return e.json(200, {
            success: true,
            status: finalStatus,
            cufe: rec.getString("cufe"),
            message: statusMsg
          });
        } else {
          let errDetail = matiasData.message || matiasData.error || ("Error MATIAS HTTP " + matiasRes.statusCode);
          if (matiasData.errors && typeof matiasData.errors === "object") {
            const errList = [];
            Object.keys(matiasData.errors).forEach((k) => {
              const v = matiasData.errors[k];
              errList.push(Array.isArray(v) ? v.join(", ") : String(v));
            });
            if (errList.length > 0) errDetail = errList.join(" | ");
          }

          const isAlreadyValidated = String(errDetail).toLowerCase().includes("ya se encuentra validado") ||
                                     String(errDetail).toLowerCase().includes("ya fue validado") ||
                                     String(errDetail).toLowerCase().includes("ya ha sido autorizada");

          if (isAlreadyValidated) {
            console.log(`[GRAVY NOMINA MATIAS] Documento ${prefijo}-${consecutivo} ya validado en MATIAS. Recuperando estado...`);
            try {
              const searchRes = matiasCaller(`/documents?query=${encodeURIComponent(consecutivo)}`, "GET");
              const items = searchRes.data?.dataRecords?.data || searchRes.data?.data || (Array.isArray(searchRes.data) ? searchRes.data : []);
              const docNumStr = String(consecutivo);
              const targetNorm = (prefijo + docNumStr).toUpperCase().replace(/[^A-Z0-9]/g, '');
              const matched = items.find(function(it) {
                const itNum = String(it.document_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                return itNum === targetNorm || itNum === docNumStr ||
                       itNum === (prefijo + String(consecutivo).padStart(5, '0')).toUpperCase() ||
                       itNum === (prefijo + String(consecutivo).padStart(8, '0')).toUpperCase();
              });

              const resolvedCufe = matched?.XmlDocumentKey || matched?.cufe || matched?.cune || "";
              if (resolvedCufe) {
                rec.set("cufe", resolvedCufe);
                rec.set("estado_dian", "APROBADO");
                rec.set("dian_response", "Documento validado y autorizado previamente ante la DIAN.");
                rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
                try {
                  const xmlRes = matiasCaller(`/documents/xml/${encodeURIComponent(resolvedCufe)}`, "GET");
                  const b64 = (xmlRes && xmlRes.data && xmlRes.data.content && xmlRes.data.content.XmlBytesBase64) ||
                              (xmlRes && xmlRes.data && xmlRes.data.XmlBytesBase64) || null;
                  if (b64 && typeof decodeBase64Utf8Queue === "function") {
                    const decodedXml = decodeBase64Utf8Queue(b64);
                    if (decodedXml && decodedXml.includes("<")) rec.set("xml_generado", decodedXml);
                  }
                } catch (_) {}
                $app.save(rec);
                return e.json(200, {
                  success: true,
                  status: "APROBADO",
                  cufe: resolvedCufe,
                  message: "Documento validado y autorizado previamente ante la DIAN."
                });
              }
            } catch (eRecov) {
              console.warn("[GRAVY NOMINA MATIAS] Error al recuperar documento ya validado:", eRecov);
            }
          }

          rec.set("estado_dian", "RECHAZADO");
          rec.set("dian_response", errDetail);
          rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
          $app.save(rec);

          return e.json(200, {
            success: true,
            status: "RECHAZADO",
            message: errDetail
          });
        }
      } catch (errMatias) {
        rec.set("estado_dian", "RECHAZADO");
        rec.set("dian_response", errMatias.message || "Error al conectar con DIAN API");
        $app.save(rec);
        return e.json(500, { success: false, message: errMatias.message });
      }
    } else if (einvoiceMethod === "facturatech" && ftechUsername) {
      try {
        let sendXmlContent = (xmlContent || '').replace(/\bCUNE="[^"]*"/g, 'CUNE=""');
        sendXmlContent = sendXmlContent.replace(/EncripCUNE\s*=\s*"[^"]*"/g, 'EncripCUNE ="CUNE-SHA384"');

        const resHub = $http.send({
          url: "http://127.0.0.1:8088/api/facturatech/upload-and-send",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            xmlContent: sendXmlContent,
            ftechUsername: ftechUsername,
            ftechPassword: ftechPassword,
            ftechEnvironment: ftechEnvironment,
            documentType: docTypeName,
            documentNumber: `${prefijo}${consecutivo}`,
            prefix: prefijo,
            folio: consecutivo,
            isNomina: true
          })
        });

        if (resHub.statusCode === 200) {
          let hubResData = {};
          try { hubResData = JSON.parse(resHub.raw); } catch (_) {}
          const transId = hubResData.transaccionID || "";
          if (!hubResData.success || !transId) {
            rec.set("estado_dian", "RECHAZADO");
            rec.set("dian_response", hubResData.error || hubResData.message || "Error al transmitir a Facturatech");
            $app.save(rec);
            return e.json(200, { success: true, status: "RECHAZADO", message: rec.getString("dian_response") });
          }

          rec.set("ftech_transaction_id", transId);
          let finalStatus = "EN_PROCESO";
          let statusMessage = hubResData.message || "En proceso de validación DIAN";

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
                documentType: docTypeName,
                documentNumber: `${prefijo}${consecutivo}`,
                prefix: prefijo,
                folio: consecutivo,
                isNomina: true
              })
            });

            if (statusHubRes.statusCode === 200) {
              const sData = JSON.parse(statusHubRes.raw);
              if (sData.message) statusMessage = sData.message;
              if (sData.status === "aceptada" || sData.status === "APROBADO") {
                finalStatus = "APROBADO";
                if (sData.cufe) rec.set("cufe", sData.cufe.trim());
                if (sData.xmlContent && sData.xmlContent.includes("<")) {
                  rec.set("xml_generado", sData.xmlContent);
                }
              } else if (sData.status === "rechazada" || sData.status === "RECHAZADO") {
                finalStatus = "RECHAZADO";
              }
            }
          } catch (_) {}

          rec.set("estado_dian", finalStatus);
          rec.set("dian_response", statusMessage);
          rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
          $app.save(rec);

          return e.json(200, {
            success: true,
            status: finalStatus,
            transactionID: transId,
            cufe: rec.getString("cufe"),
            message: statusMessage
          });
        } else {
          rec.set("estado_dian", "RECHAZADO");
          rec.set("dian_response", "Error HTTP desde Hub: " + resHub.statusCode);
          $app.save(rec);
          return e.json(200, { success: true, status: "RECHAZADO", message: rec.getString("dian_response") });
        }
      } catch (errHub) {
        rec.set("estado_dian", "RECHAZADO");
        rec.set("dian_response", errHub.message || "Error al conectar con Facturatech");
        $app.save(rec);
        return e.json(500, { success: false, message: errHub.message });
      }
    } else {
      // Modo Simulación
      const simulatedCufe = "SIM-" + Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
      rec.set("estado_dian", "APROBADO");
      rec.set("cufe", simulatedCufe);
      rec.set("dian_response", "Aprobado (Simulación)");
      rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
      $app.save(rec);

      return e.json(200, {
        success: true,
        status: "APROBADO",
        simulated: true,
        cufe: simulatedCufe,
        message: "Comprobante emitido y validado exitosamente (Modo Simulación)."
      });
    }
  } catch (err) {
    return e.json(500, { success: false, message: "Error interno al emitir nómina: " + err.message });
  }
});

routerAdd('POST', '/api/dian/nomina/check-status', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const recordId = body.id || body.electronicPayrollId;
    if (!recordId && !body.consecutivo && !body.documentNumber) {
      return e.json(400, { success: false, message: "ID o consecutivo es obligatorio." });
    }

    let rec = null;
    if (recordId) {
      try { rec = $app.findRecordById("electronic_payrolls", recordId); } catch (_) {}
    }
    if (!rec && body.consecutivo) {
      try { rec = $app.findFirstRecordByFilter("electronic_payrolls", "consecutivo = " + parseInt(body.consecutivo, 10)); } catch (_) {}
    }
    if (!rec && body.documentNumber) {
      try {
        const numClean = String(body.documentNumber).replace(/[^0-9]/g, '');
        rec = $app.findFirstRecordByFilter("electronic_payrolls", "consecutivo = " + parseInt(numClean, 10));
      } catch (_) {}
    }
    if (!rec) return e.json(404, { success: false, message: "Registro no encontrado." });

    const transId = rec.getString("ftech_transaction_id");
    const prefijo = rec.getString("prefijo") || "NOM";
    const consecutivo = rec.getInt("consecutivo") || 1;
    const xmlContent = rec.getString("xml_generado") || "";
    const isAjusteDoc = prefijo.includes("AJ") || prefijo.startsWith("NA") || xmlContent.includes("NominaIndividualDeAjuste");
    const docTypeName = isAjusteDoc ? "NominaIndividualDeAjuste" : "NominaIndividual";

    function getSettingCheck(key, defaultValue) {
      try {
        const r = $app.findFirstRecordByFilter("settings", "key = '" + key.replace(/'/g, "''") + "'");
        return (r ? r.get("value") : null) || defaultValue;
      } catch (_) {
        return defaultValue;
      }
    }

    const einvoiceMethod = getSettingCheck("einvoice_method", "facturatech");
    const ftechUsername = getSettingCheck("ftech_username", "");
    const ftechPassword = getSettingCheck("ftech_password", "");
    const ftechEnvironment = getSettingCheck("ftech_environment", "demo");

    if (einvoiceMethod === "matias") {
      try {
        let cufeKey = (rec.getString("cufe") || "").trim();

        // 1. Extraer CUFE/CUNE del XML si aún no está en el campo cufe
        if (!cufeKey || cufeKey.length < 20 || cufeKey === "404") {
          const cuneMatch = xmlContent.match(/\bCUNE="([a-f0-9]{40,})"/i) ||
                            xmlContent.match(/<cbc:UUID[^>]*>([a-f0-9]{40,})<\/cbc:UUID>/i) ||
                            xmlContent.match(/documentkey=([a-f0-9]{40,})/i);
          if (cuneMatch) {
            cufeKey = cuneMatch[1].trim();
          }
        }

        // 2. Extraer CUFE/CUNE de la respuesta previa si existe
        if (!cufeKey || cufeKey.length < 20 || cufeKey === "404") {
          const prevResp = rec.getString("dian_response") || "";
          const mKey = prevResp.match(/\b([a-f0-9]{64,})\b/i);
          if (mKey) {
            cufeKey = mKey[1].trim();
          }
        }

        // Helper para llamar a MATIAS API
        const rTok = $app.findFirstRecordByFilter("settings", "key = 'matias_api_token'");
        const token = rTok ? rTok.get("value") : "";
        const rEnv = $app.findFirstRecordByFilter("settings", "key = 'matias_environment'");
        const env = (rEnv ? rEnv.get("value") : "") || "production";
        const baseUrl = env === "production" ? "https://api-v2.matias-api.com/api/ubl2.1" : "https://sandbox-api.matias-api.com/api/ubl2.1";

        const matiasCall = function(ep, method, pl) {
          let cleanEp = ep;
          if (cleanEp.startsWith("/api/ubl2.1")) cleanEp = cleanEp.slice("/api/ubl2.1".length);
          const fullUrl = baseUrl + (cleanEp.startsWith("/") ? "" : "/") + cleanEp;
          const res = $http.send({
            url: fullUrl,
            method: method || "GET",
            headers: {
              "Authorization": "Bearer " + token,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: pl ? JSON.stringify(pl) : "",
            timeout: 60
          });
          let parsed = {};
          try { parsed = JSON.parse(res.raw); } catch (_) {}
          return { statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed, raw: res.raw };
        };

        // 3. Si aún no tenemos CUFE, buscar el documento en MATIAS API por consecutivo y query
        if (!cufeKey || cufeKey.length < 20 || cufeKey === "404") {
          try {
            const searchQueries = [
              `/documents?query=${encodeURIComponent(consecutivo)}`,
              `/documents?document_number=${encodeURIComponent(prefijo + consecutivo)}`,
              `/documents?per_page=50`
            ];

            for (const qUrl of searchQueries) {
              const searchRes = matiasCall(qUrl, "GET");
              if (searchRes && searchRes.ok && searchRes.data) {
                const items = searchRes.data.dataRecords?.data || searchRes.data.data || (Array.isArray(searchRes.data) ? searchRes.data : []);
                const docNumStr = String(consecutivo);
                const targetNorm = (prefijo + docNumStr).toUpperCase().replace(/[^A-Z0-9]/g, '');

                const matched = items.find(function(it) {
                  const itNum = String(it.document_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                  return itNum === targetNorm || itNum === docNumStr ||
                         itNum === (prefijo + String(consecutivo).padStart(5, '0')).toUpperCase() ||
                         itNum === (prefijo + String(consecutivo).padStart(8, '0')).toUpperCase();
                });

                if (matched) {
                  cufeKey = matched.XmlDocumentKey || matched.cufe || matched.cune || matched.jsonData?.cufe || "";
                  if (!cufeKey && matched.identification) cufeKey = matched.identification;
                  if (cufeKey) break;
                }
              }
            }
          } catch (eFind) {
            console.warn("[CHECK STATUS NOMINA] Error buscando en /documents de MATIAS:", eFind);
          }
        }

        // Si después de todas las búsquedas no hay CUFE
        if (!cufeKey || cufeKey.length < 20 || cufeKey === "404") {
          return e.json(200, {
            success: true,
            status: rec.getString("estado_dian"),
            message: "Sin CUFE/CUNE registrado ni documento encontrado en el proveedor tecnológico."
          });
        }

        // 4. Consultar estado oficial en DIAN vía MATIAS API: POST /status/document/{cufe}
        const statusRes = matiasCall(`/status/document/${encodeURIComponent(cufeKey)}`, "POST", {
          sendmail: false,
          sendmailtome: false
        });

        if (statusRes.ok && statusRes.data) {
          const resp = statusRes.data.response || statusRes.data.ResponseDian || statusRes.data;
          const isDianValid = (resp.IsValid === "true" || resp.IsValid === true || resp.StatusCode === "00" || statusRes.data.is_valid === 1);
          const isDianReject = (resp.IsValid === "false" || resp.IsValid === false || resp.StatusCode === "04" || resp.StatusCode === "99");

          let statusMsg = resp.StatusDescription || resp.StatusMessage || statusRes.data.message || (isDianValid ? "Documento autorizado por la DIAN" : "Consultado en DIAN");

          if (!isDianValid && resp.ErrorMessage) {
            let em = resp.ErrorMessage.string || resp.ErrorMessage;
            if (Array.isArray(em)) em = em.join(" | ");
            statusMsg = String(em);
          }

          let finalStatus = rec.getString("estado_dian");
          if (isDianValid) {
            finalStatus = "APROBADO";
          } else if (isDianReject) {
            finalStatus = "RECHAZADO";
          }

          rec.set("estado_dian", finalStatus);
          rec.set("cufe", cufeKey);
          rec.set("dian_response", statusMsg);
          $app.save(rec);

          // Si está aprobado y el XML generado localmente no contiene la firma DIAN (<ds:Signature>), descargar el XML oficial firmado
          const currentXml = rec.getString("xml_generado") || "";
          if (finalStatus === "APROBADO" && (!currentXml || !currentXml.includes("<ds:Signature"))) {
            try {
              const xmlRes = matiasCall(`/documents/xml/${encodeURIComponent(cufeKey)}`, "GET");
              const b64 = (xmlRes && xmlRes.data && xmlRes.data.content && xmlRes.data.content.XmlBytesBase64) ||
                          (xmlRes && xmlRes.data && xmlRes.data.XmlBytesBase64) ||
                          (resp && resp.XmlBase64Bytes) ||
                          (statusRes && statusRes.data && statusRes.data.XmlBase64Bytes) || null;
              if (b64) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                let input = String(b64).replace(/[^A-Za-z0-9\+\/\=]/g, '');
                let i = 0, utf8Xml = '';
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
                let decodedXml = utf8Xml;
                try {
                  if (typeof escape === 'function') decodedXml = decodeURIComponent(escape(utf8Xml));
                } catch (_) {}
                if (decodedXml && decodedXml.includes('<')) {
                  try {
                    const targetId = rec.getString("id") || recordId;
                    $app.db().newQuery("UPDATE electronic_payrolls SET xml_generado = {:xml} WHERE id = {:id}").bind({ id: targetId, xml: decodedXml }).execute();
                    console.log('[CHECK STATUS NOMINA] XML firmado guardado exitosamente vía DB, longitud:', decodedXml.length);
                  } catch (eDb) {
                    console.warn('[CHECK STATUS NOMINA] Error guardando XML en DB:', eDb);
                  }
                }
              }
            } catch (eXml) {
              console.warn("[CHECK STATUS NOMINA] Error obteniendo XML firmado de MATIAS:", eXml);
            }
          }

          return e.json(200, {
            success: true,
            status: finalStatus,
            cufe: cufeKey,
            message: statusMsg
          });
        }

        return e.json(200, {
          success: true,
          status: rec.getString("estado_dian"),
          message: statusRes.data?.message || ("Error al consultar proveedor (HTTP " + statusRes.statusCode + ")")
        });
      } catch (errMatias) {
        return e.json(500, { success: false, message: "Error al consultar estado en DIAN API: " + errMatias.message });
      }
    }

    if (!transId) {
      return e.json(200, { success: true, status: rec.getString("estado_dian"), message: "Sin transacción externa registrada." });
    }

    const statusHubRes = $http.send({
      url: "http://127.0.0.1:8088/api/facturatech/check-status",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transId: transId,
        ftechUsername: ftechUsername,
        ftechPassword: ftechPassword,
        ftechEnvironment: ftechEnvironment,
        documentType: docTypeName,
        documentNumber: `${prefijo}${consecutivo}`,
        prefix: prefijo,
        folio: consecutivo,
        isNomina: true
      })
    });

    if (statusHubRes.statusCode === 200) {
      const sData = JSON.parse(statusHubRes.raw);
      let finalStatus = rec.getString("estado_dian");
      let statusMessage = sData.message || rec.getString("dian_response");

      if (sData.status === "aceptada" || sData.status === "APROBADO") {
        finalStatus = "APROBADO";
        if (sData.cufe) rec.set("cufe", sData.cufe.trim());
        if (sData.xmlContent && sData.xmlContent.includes("<")) {
          rec.set("xml_generado", sData.xmlContent);
        }
      } else if (sData.status === "rechazada" || sData.status === "RECHAZADO") {
        finalStatus = "RECHAZADO";
      }

      rec.set("estado_dian", finalStatus);
      rec.set("dian_response", statusMessage);
      $app.save(rec);

      return e.json(200, {
        success: true,
        status: finalStatus,
        cufe: rec.getString("cufe"),
        message: statusMessage
      });
    }

    return e.json(200, { success: true, status: rec.getString("estado_dian"), message: "Consulta ejecutada." });
  } catch (err) {
    return e.json(500, { success: false, message: "Error al consultar estado: " + err.message });
  }
});

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

    // 2. Procesar comprobantes secuencialmente
    try {
      const recordIds = records.map((r) => r.getId());
      processNominaBatchInBackground(recordIds, ano, mes);
    } catch (bgErr) {
      console.error("[GRAVY QUEUE WORKER] Error procesando lote de nómina:", bgErr);
      return e.json(500, { success: false, message: "Error procesando lote de nómina: " + bgErr.message });
    }

    return e.json(200, {
      success: true,
      queued: records.length,
      message: `Transmisión masiva procesada para ${records.length} volantes de nómina.`
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
    try {
      return decodeURIComponent(escape(utf8Xml));
    } catch (_) {
      return utf8Xml;
    }
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
      const prefijo = rec.getString("prefijo") || "NOM";
      const consecutivo = rec.getInt("consecutivo") || 1;
      const isAjusteDoc = prefijo.includes("AJ") || prefijo.startsWith("NA") || xmlContent.includes("NominaIndividualDeAjuste");

      if (einvoiceMethod === "matias") {
        try {
          const caller = typeof globalThis.getMatiasCaller === "function" ? globalThis.getMatiasCaller() : null;
          const matiasCaller = caller || function(ep, method, pl) {
            const rTok = $app.findFirstRecordByFilter("settings", "key = 'matias_api_token'");
            const token = rTok ? rTok.get("value") : "";
            const rEnv = $app.findFirstRecordByFilter("settings", "key = 'matias_environment'");
            const env = (rEnv ? rEnv.get("value") : "") || "production";
            const baseUrl = env === "production" ? "https://api-v2.matias-api.com" : "https://sandbox-api.matias-api.com";
            const res = $http.send({
              url: baseUrl + ep,
              method: method || "POST",
              headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: pl ? JSON.stringify(pl) : "",
              timeout: 60
            });
            let parsed = null;
            try { parsed = JSON.parse(res.raw); } catch (_) { parsed = { raw: res.raw }; }
            return { statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed, raw: res.raw };
          };

          const builder = require(`${__hooks}/dian_nomina_matias_builder.js`);
        const { endpoint, payload } = builder.buildMatiasPayrollPayloadFromRec(rec, isAjusteDoc, prefijo, consecutivo);
          console.log(`[GRAVY QUEUE WORKER MATIAS] Emitiendo ${recId} a ${endpoint}:`, JSON.stringify(payload).slice(0, 300));

          const matiasRes = matiasCaller(endpoint, "POST", payload);
          const matiasData = matiasRes.data || {};

          if (matiasRes.statusCode === 200 && matiasData.success) {
            const resp = matiasData.response || {};
            const isDianValid = (resp.IsValid === "true" || resp.IsValid === true || resp.StatusCode === "00");
            const xmlDocKey = matiasData.XmlDocumentKey || "";

            let statusMsg = resp.StatusDescription || resp.StatusMessage || matiasData.message || "Procesado por la DIAN";
            if (!isDianValid && resp.ErrorMessage) {
              let em = resp.ErrorMessage.string || resp.ErrorMessage;
              if (Array.isArray(em)) em = em.join(" | ");
              statusMsg = String(em);
            }

            const finalStatus = isDianValid ? "APROBADO" : "RECHAZADO";
            rec.set("estado_dian", finalStatus);
            rec.set("dian_response", statusMsg);
            rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
            if (xmlDocKey) rec.set("cufe", xmlDocKey.trim());
            if (finalStatus === "APROBADO" && xmlDocKey) {
              try {
                const xmlRes = matiasCaller(`/documents/xml/${encodeURIComponent(xmlDocKey.trim())}`, "GET");
                const b64 = (xmlRes && xmlRes.data && xmlRes.data.content && xmlRes.data.content.XmlBytesBase64) ||
                          (xmlRes && xmlRes.data && xmlRes.data.XmlBytesBase64) ||
                          (matiasData && matiasData.XmlBase64Bytes) || null;
                if (b64 && typeof decodeBase64Utf8Queue === "function") {
                  const decodedXml = decodeBase64Utf8Queue(b64);
                  if (decodedXml && decodedXml.includes("<")) rec.set("xml_generado", decodedXml);
                }
              } catch (eXml) {
                console.warn("[GRAVY NOMINA MATIAS] No se pudo obtener XML firmado de MATIAS:", eXml);
              }
            } else if (matiasData.XmlBase64Bytes && typeof decodeBase64Utf8Queue === "function") {
              try {
                const decodedXml = decodeBase64Utf8Queue(matiasData.XmlBase64Bytes);
                if (decodedXml && decodedXml.includes("<")) rec.set("xml_generado", decodedXml);
              } catch (_) {}
            }
          } else {
            let errDetail = matiasData.message || matiasData.error || ("Error MATIAS HTTP " + matiasRes.statusCode);
            if (matiasData.errors && typeof matiasData.errors === "object") {
              const errList = [];
              Object.keys(matiasData.errors).forEach((k) => {
                const v = matiasData.errors[k];
                errList.push(Array.isArray(v) ? v.join(", ") : String(v));
              });
              if (errList.length > 0) errDetail = errList.join(" | ");
            }

            const isAlreadyValidated = String(errDetail).toLowerCase().includes("ya se encuentra validado") ||
                                       String(errDetail).toLowerCase().includes("ya fue validado") ||
                                       String(errDetail).toLowerCase().includes("ya ha sido autorizada");

            if (isAlreadyValidated) {
              console.log(`[GRAVY NOMINA MATIAS BATCH] Documento ${prefijo}-${consecutivo} ya validado en MATIAS. Recuperando estado...`);
              try {
                const searchRes = matiasCaller(`/documents?query=${encodeURIComponent(consecutivo)}`, "GET");
                const items = searchRes.data?.dataRecords?.data || searchRes.data?.data || (Array.isArray(searchRes.data) ? searchRes.data : []);
                const docNumStr = String(consecutivo);
                const targetNorm = (prefijo + docNumStr).toUpperCase().replace(/[^A-Z0-9]/g, '');
                const matched = items.find(function(it) {
                  const itNum = String(it.document_number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                  return itNum === targetNorm || itNum === docNumStr ||
                         itNum === (prefijo + String(consecutivo).padStart(5, '0')).toUpperCase() ||
                         itNum === (prefijo + String(consecutivo).padStart(8, '0')).toUpperCase();
                });

                const resolvedCufe = matched?.XmlDocumentKey || matched?.cufe || matched?.cune || "";
                if (resolvedCufe) {
                  rec.set("cufe", resolvedCufe);
                  rec.set("estado_dian", "APROBADO");
                  rec.set("dian_response", "Documento validado y autorizado previamente ante la DIAN.");
                  rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
                  try {
                    const xmlRes = matiasCaller(`/documents/xml/${encodeURIComponent(resolvedCufe)}`, "GET");
                    const b64 = (xmlRes && xmlRes.data && xmlRes.data.content && xmlRes.data.content.XmlBytesBase64) ||
                              (xmlRes && xmlRes.data && xmlRes.data.XmlBytesBase64) || null;
                    if (b64 && typeof decodeBase64Utf8Queue === "function") {
                      const decodedXml = decodeBase64Utf8Queue(b64);
                      if (decodedXml && decodedXml.includes("<")) rec.set("xml_generado", decodedXml);
                    }
                  } catch (_) {}
                } else {
                  rec.set("estado_dian", "RECHAZADO");
                  rec.set("dian_response", errDetail);
                  rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
                }
              } catch (_) {
                rec.set("estado_dian", "RECHAZADO");
                rec.set("dian_response", errDetail);
                rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
              }
            } else {
              rec.set("estado_dian", "RECHAZADO");
              rec.set("dian_response", errDetail);
              rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
            }
          }
        } catch (errMatias) {
          rec.set("estado_dian", "RECHAZADO");
          rec.set("dian_response", errMatias.message || "Error al conectar con DIAN API");
          rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
        }
      } else if (einvoiceMethod === "facturatech" && ftechUsername) {
        try {
          const prefijo = rec.getString("prefijo") || "NOM";
          const consecutivo = rec.getInt("consecutivo") || 1;

          let sendXmlContent = (xmlContent || '').replace(/\bCUNE="[^"]*"/g, 'CUNE=""');
          sendXmlContent = sendXmlContent.replace(/EncripCUNE\s*=\s*"[^"]*"/g, 'EncripCUNE ="CUNE-SHA384"');

          const resHub = $http.send({
            url: "http://127.0.0.1:8088/api/facturatech/upload-and-send",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              xmlContent: sendXmlContent,
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
            if (!hubResData.success || !transId) {
              rec.set("estado_dian", "RECHAZADO");
              rec.set("dian_response", hubResData.error || hubResData.message || "Error al transmitir a Facturatech");
              $app.save(rec);
              continue;
            }
            rec.set("ftech_transaction_id", transId);

            let finalStatus = "EN_PROCESO";
            let statusMessage = hubResData.message || "En proceso";
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
                if (sData.message) statusMessage = sData.message;
                if (sData.status === "aceptada" || sData.status === "APROBADO") {
                  finalStatus = "APROBADO";
                  if (sData.cufe) {
                    rec.set("cufe", sData.cufe.trim());
                  }
                  if (sData.xmlContent && sData.xmlContent.includes("<")) {
                    rec.set("xml_generado", sData.xmlContent);
                    const cMatch = sData.xmlContent.match(/<cbc:UUID[^>]*>(.*?)<\/cbc:UUID>/i) ||
                                   sData.xmlContent.match(/<CUNE[^>]*>(.*?)<\/CUNE>/i) ||
                                   sData.xmlContent.match(/CUNE="([0-9a-fA-F]{64,96})"/i) ||
                                   sData.xmlContent.match(/([0-9a-fA-F]{64,96})/);
                    if (cMatch && cMatch[1] && !rec.get("cufe")) {
                      rec.set("cufe", cMatch[1].trim());
                    }
                  }
                } else if (sData.status === "rechazada" || sData.status === "RECHAZADO") {
                  finalStatus = "RECHAZADO";
                }
              }
            } catch (_) {}

            rec.set("estado_dian", finalStatus);
            rec.set("dian_response", statusMessage);
            rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
          } else {
            rec.set("estado_dian", "RECHAZADO");
            rec.set("dian_response", "Error HTTP: " + resHub.statusCode);
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
