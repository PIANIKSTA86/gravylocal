/// <reference path="../pb_data/types.d.ts" />

function sanitizeName(val) {
  return String(val || '').replace(/^[\/\s]+|[\/\s]+$/g, '').trim();
}

function getSetting(key, defaultValue) {
  try {
    const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
    return (r ? r.get("value") : null) || defaultValue;
  } catch (_) {
    return defaultValue;
  }
}
globalThis.getSetting = getSetting;


function getAndIncrementDianShipmentConsecutive() {
  const currentYear = new Date().getFullYear();
  const yearStr = String(currentYear);
  
  // 1. Get or create last shipment year setting
  let lastYearRecord;
  let lastYear = "";
  try {
    lastYearRecord = $app.findFirstRecordByFilter("settings", "key = 'dian_last_shipment_year'");
    lastYear = lastYearRecord.get("value") || "";
  } catch (_) {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    lastYearRecord = new Record(settingsCol, { key: "dian_last_shipment_year", value: "" });
    $app.save(lastYearRecord);
  }
  
  // 2. Get or create consecutive setting
  let consecutiveRecord;
  let lastConsecutive = 0;
  try {
    consecutiveRecord = $app.findFirstRecordByFilter("settings", "key = 'dian_shipment_consecutive'");
    lastConsecutive = parseInt(consecutiveRecord.get("value") || "0", 10) || 0;
  } catch (_) {
    const settingsCol = $app.findCollectionByNameOrId("settings");
    consecutiveRecord = new Record(settingsCol, { key: "dian_shipment_consecutive", value: "0" });
    $app.save(consecutiveRecord);
  }
  
  let newConsecutive = 1;
  if (lastYear === yearStr) {
    newConsecutive = lastConsecutive + 1;
  } else {
    // Year has changed or is empty (first run), reset to 1
    newConsecutive = 1;
    lastYearRecord.set("value", yearStr);
    $app.save(lastYearRecord);
  }
  
  consecutiveRecord.set("value", String(newConsecutive));
  $app.save(consecutiveRecord);
  
  return newConsecutive;
}

function mapDocType(type) {
  const t = String(type || '').trim().toUpperCase();
  if (t === '13' || t === 'CC' || t.includes('CEDULA') || t.includes('CÉDULA')) return '13';
  if (t === '31' || t === 'NIT') return '31';
  if (t === '22' || t === 'CE' || t.includes('EXTRANJER')) return '22';
  if (t === '41' || t === 'PASAPORTE' || t === 'PAS') return '41';
  if (t === '47' || t === 'PEP') return '47';
  if (t === '12' || t === 'TI' || t.includes('TARJETA')) return '12';
  if (t === '11' || t === 'RC' || t.includes('REGISTRO')) return '11';
  if (t === '42' || t === 'TE' || t.includes('EXTERIOR')) return '42';
  if (/^\d{2}$/.test(t)) return t;
  return '13';
}

function callFacturatechNominaSoap(actionName, soapBodyParams, settings) {
  try {
    const envStr = (typeof settings === 'string') ? settings : (settings && settings.ftechEnvironment ? settings.ftechEnvironment : 'demo');
    const isDemo = (envStr === 'demo' || envStr === '2' || envStr === 'pruebas');
    const baseUrl = isDemo 
      ? 'https://ws-nomina.facturatech.co/v1/demo/index.php' 
      : 'https://ws-nomina.facturatech.co/v1/pro/index.php';
    const targetNs = 'urn:https://ws-nomina.facturatech.co/v1/pro/';
    const soapAction = targetNs + '#' + actionName;

    let bodyXml = '<urn:' + actionName + ' soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    for (let key in soapBodyParams) {
      const val = soapBodyParams[key];
      const typeStr = (typeof val === 'number' || (!isNaN(val) && String(val).trim() !== '')) ? 'xsd:integer' : 'xsd:string';
      bodyXml += '<' + key + ' xsi:type="' + typeStr + '">' + String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</' + key + '>';
    }
    bodyXml += '</urn:' + actionName + '>';

    const envelope = '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="' + targetNs + '">\n' +
      '  <soapenv:Header/>\n' +
      '  <soapenv:Body>\n' +
      '    ' + bodyXml + '\n' +
      '  </soapenv:Body>\n' +
      '</soapenv:Envelope>';

    const res = $http.send({
      url: baseUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': soapAction
      },
      body: envelope
    });

    return res;
  } catch (httpErr) {
    console.error("[GRAVY HOOK] Error en HTTP SOAP Facturatech Nómina:", httpErr);
    return { statusCode: 500, raw: '<error>' + httpErr.message + '</error>' };
  }
}

globalThis.callFacturatechNominaSoap = callFacturatechNominaSoap;

/**
 * Elimina slashes (/) y espacios al inicio y al final de un nombre.
 * Corrige bug donde datos históricos en third_parties.name contienen
 * un slash inicial (ej: "/JULIAN ESPINO ARRUBL" -> "JULIAN ESPINO ARRUBL").
 */
routerAdd('POST', '/api/dian/emit', (e) => {

  function getSetting(key, defaultValue) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key.replace(/'/g, "''") + "'");
      return (r ? r.get("value") : null) || defaultValue;
    } catch (_) {
      return defaultValue;
    }
  }

  function sanitizeName(val) {
    return String(val || '').replace(/^[\/\s]+|[\/\s]+$/g, '').trim();
  }

  function mapDocType(type) {
    const t = String(type || '').trim().toUpperCase();
    if (t === '13' || t === 'CC' || t.includes('CEDULA') || t.includes('CÉDULA')) return '13';
    if (t === '31' || t === 'NIT') return '31';
    if (t === '22' || t === 'CE' || t.includes('EXTRANJER')) return '22';
    if (t === '41' || t === 'PASAPORTE' || t === 'PAS') return '41';
    if (t === '47' || t === 'PEP') return '47';
    if (t === '12' || t === 'TI' || t.includes('TARJETA')) return '12';
    if (t === '11' || t === 'RC' || t.includes('REGISTRO')) return '11';
    if (t === '42' || t === 'TE' || t.includes('EXTERIOR')) return '42';
    if (/^\d{2}$/.test(t)) return t;
    return '13';
  }

function sendInvoiceEmailHelper(txId, customEmail) {

  const syncSmtpSettings = function() {
    const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = getSetting("smtp_host", "");
        const port = parseInt(getSetting("smtp_port", "587"), 10);
        const user = getSetting("smtp_username", "");
        const pass = getSetting("smtp_password", "");
        const senderName = getSetting("smtp_sender_name", "");
        const senderAddr = getSetting("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || getSetting("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
    } catch (err) {
      console.error("[GRAVY DIAN SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
    }
  };

  try {
    const docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
    if (!docRecord) {
      throw new Error("Documento de facturación no encontrado para esta transacción.");
    }
    
    const xmlContent = docRecord.getString("xml_content");
    if (!xmlContent) {
      throw new Error("El documento no posee contenido XML firmado para reenviar.");
    }
    
    const tx = $app.findRecordById("transactions", txId);
    $app.expandRecord(tx, ["third_party_id"], null);
    const customer = tx.expandedOne("third_party_id");
    let custEmail = customEmail;
    if (!custEmail) {
      custEmail = customer ? customer.getString("email") : "";
    }
    if (!custEmail) {
      throw new Error("Debe configurar un correo en la ficha del tercero.");
    }
    
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyEmail = getSetting("company_email", "noreply@gravy.com");
    const docNumber = tx.getString("number") || "Factura";

    let totalVal = 0;
    try {
      const invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      totalVal = invRec.getFloat("total") || 0;
    } catch (_) {
      try {
        const purRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
        totalVal = purRec.getFloat("total") || 0;
      } catch (_2) {}
    }
    const fmtTotal = "$ " + Math.round(totalVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const companyNitRaw = getSetting("company_nit", "900123456");
    const companyNit = companyNitRaw.split('-')[0].replace(/[^0-9]/g, '');
    
    $app.expandRecord(tx, ["tx_type_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const txTypeCode = txType ? txType.getString("code") : "";
    let docTypeCode = "01";
    if (txTypeCode === "ND") docTypeCode = "02";
    else if (txTypeCode === "NC") docTypeCode = "03";
    
    const commercialName = getSetting("company_name", "GRAVY S.A.S");
    const emailSubject = `${companyNit};${companyName};${docNumber};${docTypeCode};${commercialName};`;

    const einvoiceMethod = getSetting("einvoice_method", "dian");
    let integrationComment = "";
    if (einvoiceMethod === "facturatech") {
      integrationComment = "La integracion de datos es realizada por proveedor tecnologico CADENA S.A. / NIT. 890.930.534-0";
    } else {
      integrationComment = "La integracion de datos es realizada directamente por la UAE DIAN bajo la modalidad de software propio a nombre del emisor de este documento electronico";
    }

    let invoiceData = null;
    try {
      let invRec = null;
      let isPurchase = false;
      try {
        invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        try {
          invRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
          isPurchase = true;
        } catch (_2) {}
      }

      if (invRec) {
        let linesList = [];
        if (!isPurchase) {
          linesList = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invRec.id + "'");
        } else {
          linesList = $app.findRecordsByFilter("purchase_invoice_lines", "invoice_id = '" + invRec.id + "'");
        }
        
        $app.expandRecords(linesList, ["product_id"], null);
        const linesData = [];
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const prod = l.expandedOne("product_id");
          linesData.push({
            desc: prod ? prod.getString("name") : "Producto",
            code: prod ? prod.getString("code") : "—",
            qty: l.getFloat("qty") || 0,
            unitPrice: l.getFloat("unit_price") || 0,
            lineTotal: l.getFloat("total") || 0,
            ivaRate: l.getFloat("iva_rate") || 0,
            unitCode: prod ? (prod.getString("unit") || "94") : "94",
          });
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = sanitizeName(customer ? customer.getString("name") : "Consumidor Final");
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        let cajeroName = "Admin";
        const posShiftId = invRec.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = invRec.getString("pos_shift_id") ? "POS" : "FV";
        
        try {
          const registerId = invRec.getString("pos_shift_id") ? ($app.findRecordById("pos_shifts", invRec.getString("pos_shift_id")).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: invRec.getString("payment_method") || "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      } else {
        const linesList = $app.findRecordsByFilter("tx_lines", "tx_id = '" + txId + "'", "line_order");
        const linesData = [];
        let totalFromLines = 0;
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const d = l.getFloat("debit");
          const c = l.getFloat("credit");
          const amount = d > 0 ? d : c;
          if (amount > 0) {
            linesData.push({
              desc: l.getString("description") || "Concepto Contable",
              code: "—",
              qty: 1,
              unitPrice: amount,
              lineTotal: amount,
              ivaRate: 0
            });
            totalFromLines += amount;
          }
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = customer ? customer.getString("name") : "Consumidor Final";
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        let cajeroName = "Admin";
        const posShiftId = tx.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = posShiftId ? "POS" : "FV";
        
        try {
          const registerId = posShiftId ? ($app.findRecordById("pos_shifts", posShiftId).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal || totalFromLines,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      }
    } catch (errData) {
      console.warn("[GRAVY HOOK] Error al preparar structured invoiceData:", errData);
    }

    try {
      syncSmtpSettings();
    } catch (e) {
      console.warn("[GRAVY] Error syncing SMTP settings:", e);
    }

    let zipPath = "";
    const zipBasenameForEmail = docRecord.getString("zip_filename") || docNumber;
    try {
      const zipRes = $http.send({
        url: "http://127.0.0.1:8088/api/dian/generate-zip-file",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlContent: xmlContent, filename: zipBasenameForEmail, invoiceData: invoiceData })
      });
      if (zipRes.statusCode === 200) {
        const zipData = JSON.parse(zipRes.raw);
        if (zipData.success) {
          zipPath = zipData.zipPath;
        }
      }
    } catch (err) {
      console.error("[GRAVY HOOK] Error al generar ZIP en el orquestador:", err);
    }
    
    const message = new MailerMessage({
      from: {
        address: companyEmail,
        name: companyName
      },
      to: [{ address: custEmail }],
      subject: emailSubject,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="cid:gravy-logo.png" alt="GRAVY Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: #E0F2FE; color: #0369A1; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                Documento Oficial DIAN
              </span>
            </div>
            
            <h2 style="color: #0F172A; font-size: 22px; font-weight: 800; text-align: center; margin-top: 12px; margin-bottom: 8px;">
              ¡Tu Factura Electrónica está lista!
            </h2>
            <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
              Emitida por <strong>${companyName}</strong>
            </p>
            
            <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
              <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
                Estimado cliente <strong>${sanitizeName(customer ? customer.getString("name") : "Consumidor Final")}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
                Adjunto en este correo encontrará el archivo comprimido <strong>ZIP</strong> que contiene el XML firmado y la representación gráfica en formato PDF correspondientes a la <strong>Factura Electrónica de Venta No. ${docNumber}</strong>.
              </p>
            </div>
            
            <h3 style="color: #0F172A; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
              Detalles del Documento
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Número de Documento:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Fecha de Emisión:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${tx.getString("date")}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Monto Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284C7; border-bottom: 1px solid #F1F5F9;">${fmtTotal}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; vertical-align: top;">CUFE / CUDE:</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                  ${docRecord.getString("cufe") || 'N/A'}
                </td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 13px; color: #94A3B8; margin: 0;">
                Gracias por su preferencia y confianza.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
            <p style="font-size: 11px; color: #94A3B8; line-height: 1.5; margin: 0;">
              ${integrationComment}
            </p>
            <p style="font-size: 10px; color: #CBD5E1; margin-top: 12px; margin-bottom: 0;">
              Este es un mensaje automático generado por GRAVY. Por favor no responda a este correo.
            </p>
          </div>
        </div>
      `,
    });
    
    const attachments = {};
    if (zipPath) {
      try {
        const zipFile = $filesystem.fileFromPath(zipPath);
        attachments[`${zipBasenameForEmail}.zip`] = zipFile.reader.open();
      } catch (zipErr) {
        console.error("[GRAVY HOOK] No se pudo abrir el archivo ZIP generado:", zipErr);
        const xmlFile = $filesystem.fileFromBytes(xmlContent, `${zipBasenameForEmail}.xml`);
        attachments[`${zipBasenameForEmail}.xml`] = xmlFile.reader.open();
      }
    } else {
      const xmlFile = $filesystem.fileFromBytes(xmlContent, `${zipBasenameForEmail}.xml`);
      attachments[`${zipBasenameForEmail}.xml`] = xmlFile.reader.open();
    }

    try {
      const logoFile = $filesystem.fileFromPath("pb_public/assets/gravy-logo.png");
      attachments["gravy-logo.png"] = logoFile.reader.open();
    } catch (logoErr) {
      console.warn("[GRAVY HOOK] No se pudo adjuntar el logo de GRAVY:", logoErr);
    }
    
    message.attachments = attachments;
    
    $app.newMailClient().send(message);
    console.log("[GRAVY HOOK] Correo enviado automáticamente a:", custEmail);
    return true;
  } catch (err) {
    console.error("[GRAVY HOOK] Falló al enviar correo en helper:", err);
    throw err;
  }
}


  const calcularDV = (nit) => {
    const cleanNit = String(nit || '').replace(/[^0-9]/g, '');
    if (!cleanNit) return '0';
    const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    const len = cleanNit.length;
    for (let i = 0; i < len; i++) {
      const digito = parseInt(cleanNit.charAt(len - 1 - i), 10);
      suma += digito * pesos[i];
    }
    const residuo = suma % 11;
    return String(residuo > 1 ? 11 - residuo : residuo);
  };


  const buildUblXml = function({
  documentType,
  documentNumber,
  issueDate,
  dueDate,
  creditDays,
  issueTime,
  dianEnvironment,
  emitterNit,
  emitterName,
  emitterAddress,
  emitterPhone,
  emitterEmail,
  custDIANDocType,
  custDocNum,
  custName,
  custAddress,
  custPhone,
  custEmail,
  items,
  subtotal: paramSubtotal,
  ivaTotal: paramIvaTotal,
  total: paramTotal,
  softwareId,
  mandante,
  paymentForm,
  paymentDianCode,
  paymentMethod
}) {
  const dec = (val) => Number(val || 0).toFixed(2);
  const decPrice = (val, qty, subtotal) => {
    const p = Number(val || 0);
    const q = Number(qty || 0);
    const s = Number(subtotal || 0);
    if (q > 0 && s > 0) {
      const calcPrice = s / q;
      if (Math.abs(Number(calcPrice.toFixed(2)) * q - s) < 0.009) {
        return calcPrice.toFixed(2);
      }
      return calcPrice.toFixed(6).replace(/\.?0+$/, '');
    }
    return p.toFixed(2);
  };
  const escXml = (val) => String(val || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  let subtotal = 0;
  let ivaTotal = 0;
  for (const item of items) {
    subtotal += Number(Number(item.subtotal || 0).toFixed(2));
    ivaTotal += Number(Number(item.ivaAmount || 0).toFixed(2));
  }
  let total = subtotal + ivaTotal;
    
  const emitterDv = calcularDV(emitterNit);
  const custDv = custDIANDocType === '31' ? calcularDV(custDocNum) : '0';
    
  const typeCode = documentType === 'Invoice' ? '01' : (documentType === 'CreditNote' ? '91' : '92');
  const customizationValue = mandante ? '11' : '10';
  
  let xml = '';
  
  if (documentType === 'Invoice') {
    xml += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:sts="dian:gov:co:facturaelectronica:Structures-2"
         xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">${customizationValue}</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${escXml(documentNumber)}</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384" schemeID="${dianEnvironment}"><!-- CUFE_PLACEHOLDER --></cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>${typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>`;
  } else if (documentType === 'CreditNote') {
    xml += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<CreditNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
            xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
            xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
            xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
            xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
            xmlns:sts="dian:gov:co:facturaelectronica:Structures-2"
            xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Nota Crédito de Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${escXml(documentNumber)}</cbc:ID>
  <cbc:UUID schemeName="CUDE-SHA384" schemeID="${dianEnvironment}"><!-- CUDE_PLACEHOLDER --></cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>`;
  } else { // DebitNote
    xml += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<DebitNote xmlns="urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2"
            xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
            xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
            xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
            xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
            xmlns:sts="dian:gov:co:facturaelectronica:Structures-2"
            xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:CustomizationID schemeAgencyID="195" schemeID="${dianEnvironment}">10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1: Nota Débito de Factura Electrónica de Venta</cbc:ProfileID>
  <cbc:ID>${escXml(documentNumber)}</cbc:ID>
  <cbc:UUID schemeName="CUDE-SHA384" schemeID="${dianEnvironment}"><!-- CUDE_PLACEHOLDER --></cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>`;
  }
  
  xml += `
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escXml(emitterName)}</cbc:Name>
      </cac:PartyName>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:AddressLine>${escXml(emitterAddress)}</cbc:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${escXml(emitterName)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeID="${emitterDv}" schemeName="31">${escXml(emitterNit)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${escXml(emitterPhone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escXml(emitterEmail)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PhysicalLocation>
        <cac:Address>
          <cbc:AddressLine>${escXml(custAddress)}</cbc:AddressLine>
        </cac:Address>
      </cac:PhysicalLocation>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${escXml(custName)}</cbc:RegistrationName>
        <cbc:CompanyID schemeAgencyID="195" schemeID="${custDv}" schemeName="${custDIANDocType}">${escXml(custDocNum)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${escXml(custPhone)}</cbc:Telephone>
        <cbc:ElectronicMail>${escXml(custEmail)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>`;

  const payForm = String(paymentForm || (paymentMethod === "CREDITO" ? "2" : "1"));
  const payDianCode = String(paymentDianCode || (payForm === "2" ? "30" : (paymentMethod === "TRANSFERENCIA" ? "47" : "10")));
  const dueDateVal = dueDate ? String(dueDate).slice(0, 10) : issueDate;

  let calculatedCreditDays = Number(creditDays || 0);
  if (calculatedCreditDays <= 0 && dueDateVal && issueDate && payForm === "2") {
    try {
      const dIssue = new Date(issueDate + "T12:00:00Z");
      const dDue = new Date(dueDateVal + "T12:00:00Z");
      const diffMs = dDue.getTime() - dIssue.getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays > 0) calculatedCreditDays = diffDays;
    } catch (_) {}
  }

  xml += `
  <cac:PaymentMeans>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansCode>${payDianCode}</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${dueDateVal}</cbc:PaymentDueDate>
  </cac:PaymentMeans>
  
  <cac:PaymentTerms>
    <cbc:ID>1</cbc:ID>
    <cbc:PaymentMeansID>${payForm}</cbc:PaymentMeansID>
    ${payForm === '2' ? `<cbc:Amount currencyID="COP">${dec(total)}</cbc:Amount>
    <cbc:PaymentDueDate>${dueDateVal}</cbc:PaymentDueDate>
    ${calculatedCreditDays > 0 ? `<cbc:DurationMeasure unitCode="DAY">${calculatedCreditDays}</cbc:DurationMeasure>` : ''}` : ''}
  </cac:PaymentTerms>`;

  xml += `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="COP">${dec(ivaTotal)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="COP">${dec(subtotal)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="COP">${dec(ivaTotal)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>01</cbc:ID>
          <cbc:Name>IVA</cbc:Name>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>`;

  xml += `
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="COP">${dec(subtotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="COP">${dec(subtotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="COP">${dec(total)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="COP">${dec(total)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>`;

  for (const item of items) {
    if (documentType === 'Invoice') {
      xml += `
  <cac:InvoiceLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${item.unitCode || '94'}">${dec(item.qty)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${dec(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${dec(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${dec(item.ivaRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escXml(item.description)}</cbc:Description>
      ${mandante ? `
      <cac:InformationContentProviderParty>
        <cac:PowerOfAttorney>
          <cac:AgentParty>
            <cac:PartyIdentification>
              <cbc:ID schemeAgencyID="195" schemeID="${mandante.dv}" schemeName="${mandante.docType}">${escXml(mandante.docNum)}</cbc:ID>
            </cac:PartyIdentification>
          </cac:AgentParty>
        </cac:PowerOfAttorney>
      </cac:InformationContentProviderParty>
      ` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${decPrice(item.price, item.qty, item.subtotal)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
    } else if (documentType === 'CreditNote') {
      xml += `
  <cac:CreditNoteLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:CreditedQuantity unitCode="${item.unitCode || '94'}">${dec(item.qty)}</cbc:CreditedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${dec(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${dec(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${dec(item.ivaRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escXml(item.description)}</cbc:Description>
      ${mandante ? `
      <cac:InformationContentProviderParty>
        <cac:PowerOfAttorney>
          <cac:AgentParty>
            <cac:PartyIdentification>
              <cbc:ID schemeAgencyID="195" schemeID="${mandante.dv}" schemeName="${mandante.docType}">${escXml(mandante.docNum)}</cbc:ID>
            </cac:PartyIdentification>
          </cac:AgentParty>
        </cac:PowerOfAttorney>
      </cac:InformationContentProviderParty>
      ` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${decPrice(item.price, item.qty, item.subtotal)}</cbc:PriceAmount>
    </cac:Price>
  </cac:CreditNoteLine>`;
    } else { // DebitNote
      xml += `
  <cac:DebitNoteLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:DebitedQuantity unitCode="${item.unitCode || '94'}">${dec(item.qty)}</cbc:DebitedQuantity>
    <cbc:LineExtensionAmount currencyID="COP">${dec(item.subtotal)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="COP">${dec(item.subtotal)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="COP">${dec(item.ivaAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${dec(item.ivaRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>01</cbc:ID>
            <cbc:Name>IVA</cbc:Name>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escXml(item.description)}</cbc:Description>
      ${mandante ? `
      <cac:InformationContentProviderParty>
        <cac:PowerOfAttorney>
          <cac:AgentParty>
            <cac:PartyIdentification>
              <cbc:ID schemeAgencyID="195" schemeID="${mandante.dv}" schemeName="${mandante.docType}">${escXml(mandante.docNum)}</cbc:ID>
            </cac:PartyIdentification>
          </cac:AgentParty>
        </cac:PowerOfAttorney>
      </cac:InformationContentProviderParty>
      ` : ''}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="COP">${decPrice(item.price, item.qty, item.subtotal)}</cbc:PriceAmount>
    </cac:Price>
  </cac:DebitNoteLine>`;
    }
  }

  if (documentType === 'Invoice') {
    xml += '\n</Invoice>';
  } else if (documentType === 'CreditNote') {
    xml += '\n</CreditNote>';
  } else {
    xml += '\n</DebitNote>';
  }
  
  return xml;
}

  function buildFtechXml({
    documentType,
    documentNumber,
    issueDate,
    dueDate,
    creditDays,
    issueTime,
    ftechEnvironment,
    emitterNit,
    emitterName,
    emitterAddress,
    emitterPhone,
    emitterEmail,
    custDIANDocType,
    custDocNum,
    custName,
    custAddress,
    custPhone,
    custEmail,
    items,
    subtotal: paramSubtotal,
    ivaTotal: paramIvaTotal,
    total: paramTotal,
    prefix,
    folio,
    resolution,
    companyThird,
    customer,
    crossDocRef,
    clTec,
    cajaName,
    mandante,
    isDS,
    isNDS,
    sinReferencia,
    txDescription,
    paymentForm,
    paymentDianCode,
    paymentMethod
  }) {
    const dec = (val) => Number(val || 0).toFixed(2);
    const decPrice = (val, qty, subtotal) => {
      const p = Number(val || 0);
      const q = Number(qty || 0);
      const s = Number(subtotal || 0);
      if (q > 0 && s > 0) {
        const calcPrice = s / q;
        if (Math.abs(Number(calcPrice.toFixed(2)) * q - s) < 0.009) {
          return calcPrice.toFixed(2);
        }
        return calcPrice.toFixed(6).replace(/\.?0+$/, '');
      }
      return p.toFixed(2);
    };
    const escXml = (val) => String(val || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const getRegimeFiscal = (thirdRecord) => {
      if (!thirdRecord) return '49';
      const docNum = String(thirdRecord.getString("doc_number") || "").trim();
      if (docNum === '2222222222' || docNum === '222222222222') {
        return '49';
      }
      // Personas naturales (CC, TI, CE, etc.) siempre son No Responsables de IVA (49)
      const personType = String(thirdRecord.getString("person_type") || "").toUpperCase();
      if (personType !== 'JURIDICA') {
        return '49';
      }
      // Para personas jurídicas, evaluar régimen
      const regime = String(thirdRecord.getString("tax_regime") || "").toUpperCase();
      if (regime === 'COMUN' || regime === 'GRAN_CONTR') {
        return '48';
      }
      try {
        const respStr = thirdRecord.getString("resp") || "";
        if (respStr.includes("\"48\"")) return '48';
        if (respStr.includes("\"49\"")) return '49';
      } catch (_) {}
      return '48'; // default para jurídica
    };

    let subtotal = 0;
    let ivaTotal = 0;
    for (const item of items) {
      subtotal += Number(Number(item.subtotal || 0).toFixed(2));
      ivaTotal += Number(Number(item.ivaAmount || 0).toFixed(2));
    }
    let total = subtotal + ivaTotal;

    const isNC = (documentType === 'CreditNote');
    const isND = (documentType === 'DebitNote');
    const isInv = (documentType === 'Invoice');

    // 1. Root Element
    const rootTag = (isNC || isND) ? 'NOTA' : (isDS ? 'DOCUMENTO_SOPORTE' : 'FACTURA');

    // 2. ENC Block
    const enc1 = isDS ? 'DS' : (isNC ? 'NC' : (isND ? 'ND' : 'INVOIC'));
    const enc2 = escXml(emitterNit);
    const enc3 = escXml(isDS || isNDS ? emitterNit : custDocNum);
    const enc4 = 'UBL 2.1';
    const enc5 = 'DIAN 2.1';
    const enc6DocPrefix = resolution ? resolution.getString('prefix') : (isDS ? 'DS' : (isNDS ? 'NDS' : prefix));
    const enc6 = escXml(enc6DocPrefix + (isNaN(Number(folio)) ? folio : String(Number(folio))));
    const enc9 = isNC ? '91' : (isND ? '92' : (isDS ? '05' : (isNDS ? '95' : '01')));
    const enc10 = 'COP';
    const enc15 = String(items.length);
    const enc16 = dueDate ? String(dueDate).slice(0, 10) : issueDate;
    const enc20 = escXml(ftechEnvironment || '2'); // 1 = Prod, 2 = Test
    const enc21 = isNC ? (sinReferencia ? '22' : '20') : (isND ? (sinReferencia ? '32' : '30') : ((isDS || isNDS) ? '10' : (mandante ? '11' : '10')));

    const yStr = issueDate ? issueDate.slice(0, 4) : new Date().getFullYear().toString();
    const mStr = issueDate ? issueDate.slice(5, 7) : String(new Date().getMonth() + 1).padStart(2, '0');
    const enc11 = `${yStr}-${mStr}-01`;
    const lastDayNum = new Date(Number(yStr), Number(mStr), 0).getDate();
    const enc12 = `${yStr}-${mStr}-${String(lastDayNum).padStart(2, '0')}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag}${isDS ? ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"' : ''}>
  <ENC>
    <ENC_1>${enc1}</ENC_1>
    <ENC_2>${enc2}</ENC_2>
    ${isDS ? '' : `<ENC_3>${enc3}</ENC_3>`}
    <ENC_4>${enc4}</ENC_4>
    <ENC_5>${enc5}</ENC_5>
    <ENC_6>${enc6}</ENC_6>
    <ENC_7>${issueDate}</ENC_7>
    <ENC_8>${issueTime || '00:00:00-05:00'}</ENC_8>
    <ENC_9>${enc9}</ENC_9>
    <ENC_10>${enc10}</ENC_10>
    ${(isNC || isND) && sinReferencia ? `<ENC_11>${enc11}</ENC_11>\n    <ENC_12>${enc12}</ENC_12>` : ''}
    <ENC_15>${enc15}</ENC_15>
    <ENC_16>${enc16}</ENC_16>
    <ENC_20>${enc20}</ENC_20>
    <ENC_21>${enc21}</ENC_21>
  </ENC>`;

    // 3. IPV Block (Establishment & Resolution)
    const ipv1 = escXml(clTec || "00331-10000-00001-AA962");
    const ipv2 = escXml(cajaName || "Caja1");
    const ipv3 = escXml(companyThird ? companyThird.getString("contact_name") : emitterName);
    const ipv4 = escXml(cajaName || "CAJA1").toUpperCase();
    const ipv5 = escXml(prefix || 'FE');
    const ipv6 = dec(total);

    if (!isDS) {
      const ipv1 = escXml(clTec || "00331-10000-00001-AA962");
      const ipv2 = escXml(cajaName || "Caja1");
      const ipv3 = escXml(companyThird ? companyThird.getString("contact_name") : emitterName);
      const ipv4 = escXml(cajaName || "CAJA1").toUpperCase();
      const ipv5 = escXml(prefix || 'FE');
      const ipv6 = dec(total);

      xml += `
  <IPV>
    <IPV_1>${ipv1}</IPV_1>
    <IPV_2>${ipv2}</IPV_2>
    <IPV_3>${ipv3}</IPV_3>
    <IPV_4>${ipv4}</IPV_4>
    <IPV_5>${ipv5}</IPV_5>
    <IPV_6>${ipv6}</IPV_6>
  </IPV>`;
    }

    // Swap roles for EMI and ADQ if it is Documento Soporte or its Note of Adjustment
    const isPurchaseDoc = isDS || isNDS;

    // 4. EMI Block / PRO Block (Emitter)
    const emi1 = isPurchaseDoc
      ? (customer && customer.getString("person_type") === 'JURIDICA' ? '1' : '2')
      : (companyThird && companyThird.getString("person_type") === 'JURIDICA' ? '1' : '2');
    const emi2 = escXml(isPurchaseDoc ? custDocNum : emitterNit);
    const emi3 = isPurchaseDoc ? ((String(custDIANDocType).trim() == '13' || String(custDIANDocType).trim() == '12' || String(custDIANDocType).trim() == '11') ? '31' : escXml(custDIANDocType)) : '31';
    const emi6 = escXml(isPurchaseDoc ? custName : emitterName);
    const emi7 = escXml(isPurchaseDoc ? custName : (companyThird ? (companyThird.getString("commercial_name") || companyThird.getString("name")) : emitterName));
    const emi10 = escXml(isPurchaseDoc ? custAddress : emitterAddress);
    
    const emiDeptCode = isPurchaseDoc
      ? (customer ? (customer.getString("dept_code") || '11') : '11')
      : (companyThird ? (companyThird.getString("dept_code") || '11') : '11');
    const emiDeptName = isPurchaseDoc
      ? (customer ? (customer.getString("department") || 'BOGOTA') : 'BOGOTA')
      : (companyThird ? (companyThird.getString("department") || 'BOGOTA') : 'BOGOTA');
    const emiCityCode = isPurchaseDoc
      ? (customer ? (customer.getString("city_code") || '11001') : '11001')
      : (companyThird ? (companyThird.getString("city_code") || '11001') : '11001');
    const emiCityName = isPurchaseDoc
      ? (customer ? (customer.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.')
      : (companyThird ? (companyThird.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.');
    const emiCountryCode = isPurchaseDoc
      ? (customer ? (customer.getString("country") || 'CO') : 'CO')
      : (companyThird ? (companyThird.getString("country") || 'CO') : 'CO');
    const emiDv = isPurchaseDoc
      ? (customer ? (customer.getString("dv") || calcularDV(custDocNum)) : calcularDV(custDocNum))
      : calcularDV(emitterNit);
    const emiPostal = String(emiCityCode || '11001').length === 5 
      ? (String(emiCityCode).substring(0, 2) + '0' + String(emiCityCode).substring(2)) 
      : (emiCityCode || '110001');
    const emiPostalDfe = emiCityCode || '111011';
    const emiContact = escXml(isPurchaseDoc ? custName : (companyThird ? (companyThird.getString("contact_name") || companyThird.getString("name")) : emitterName));
    
    const emiTac1 = 'R-99-PN';
    const emiIcc1 = '000000';
    const emiIcc9 = escXml(prefix || 'FE');

    if (isDS) {
      xml += `
  <PRO>
    <PRO_1>${emi1}</PRO_1>
    <PRO_2>${emi2}</PRO_2>
    <PRO_3>${emi3}</PRO_3>
    <PRO_6>${emi6}</PRO_6>
    <PRO_10>${emi10}</PRO_10>
    <PRO_11>${emiDeptCode}</PRO_11>
    <PRO_13>${emiCityName} - ${emiCityCode}</PRO_13>
    <PRO_14>${emiPostal}</PRO_14>
    <PRO_15>${emiCountryCode}</PRO_15>
    <PRO_19>${emiDeptName} - ${emiDeptCode}</PRO_19>
    <PRO_21>Colombia</PRO_21>
    <PRO_22>${emiDv}</PRO_22>
    <PRO_23>${emiCityCode}</PRO_23>
    <TAC>
      <TAC_1>${emiTac1}</TAC_1>
    </TAC>
    <GTE>
      <GTE_1>01</GTE_1>
      <GTE_2>IVA</GTE_2>
    </GTE>
  </PRO>`;
    } else {
      xml += `
  <EMI>
    <EMI_1>${emi1}</EMI_1>
    <EMI_2>${emi2}</EMI_2>
    <EMI_3>${emi3}</EMI_3>
    <EMI_6>${emi6}</EMI_6>
    <EMI_7>${emi7}</EMI_7>
    <EMI_10>${emi10}</EMI_10>
    <EMI_11>${emiDeptCode}</EMI_11>
    <EMI_13>${emiDeptName}</EMI_13>
    <EMI_14>${emiPostal}</EMI_14>
    <EMI_15>${emiCountryCode}</EMI_15>
    <EMI_19>${emiCityName}</EMI_19>
    <EMI_22>${emiDv}</EMI_22>
    <EMI_23>${emiCityCode}</EMI_23>
    <EMI_24>${emiContact}</EMI_24>
    <TAC>
      <TAC_1>${emiTac1}</TAC_1>
    </TAC>
    <DFE>
      <DFE_1>${emiCityCode}</DFE_1>
      <DFE_2>${emiDeptCode}</DFE_2>
      <DFE_3>${emiCountryCode}</DFE_3>
      <DFE_4>${emiPostalDfe}</DFE_4>
      <DFE_5>Colombia</DFE_5>
      <DFE_6>${emiCityName}</DFE_6>
      <DFE_7>${emiDeptName}</DFE_7>
      <DFE_8>${emi10}</DFE_8>
    </DFE>
    <ICC>
      <ICC_1>${emiIcc1}</ICC_1>
      <ICC_9>${emiIcc9}</ICC_9>
    </ICC>
    <CDE>
      <CDE_2>${emiContact}</CDE_2>
      <CDE_3>${escXml(isPurchaseDoc ? custPhone : emitterPhone)}</CDE_3>
      <CDE_4>${escXml(isPurchaseDoc ? custEmail : emitterEmail)}</CDE_4>
    </CDE>
    <GTE>
      <GTE_1>01</GTE_1>
      <GTE_2>IVA</GTE_2>
    </GTE>
  </EMI>`;
    }

    // 5. ADQ Block (Acquirer)
    const adq1Raw = isPurchaseDoc
      ? (companyThird && companyThird.getString("person_type") === 'JURIDICA' ? '1' : '2')
      : (customer && customer.getString("person_type") === 'JURIDICA' ? '1' : '2');
    const adq2 = escXml(isPurchaseDoc ? emitterNit : custDocNum);
    const adq3 = isPurchaseDoc ? '31' : ((custDocNum === '222222222222' || custDocNum === '2222222222' || custName.toUpperCase() === 'CONSUMIDOR FINAL') ? '13' : escXml(custDIANDocType));
    const adq1 = adq3 === '31' ? '1' : adq1Raw;
    const adq6 = escXml(isPurchaseDoc ? emitterName : custName);
    
    const adqDeptCode = isPurchaseDoc
      ? (companyThird ? (companyThird.getString("dept_code") || '11') : '11')
      : (customer ? (customer.getString("dept_code") || '11') : '11');
    const adqDeptName = isPurchaseDoc
      ? (companyThird ? (companyThird.getString("department") || 'BOGOTA') : 'BOGOTA')
      : (customer ? (customer.getString("department") || 'BOGOTA') : 'BOGOTA');
    const adqCityCode = isPurchaseDoc
      ? (companyThird ? (companyThird.getString("city_code") || '11001') : '11001')
      : (customer ? (customer.getString("city_code") || '11001') : '11001');
    const adqCityName = isPurchaseDoc
      ? (companyThird ? (companyThird.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.')
      : (customer ? (customer.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.');
    const adqCountryCode = isPurchaseDoc
      ? (companyThird ? (companyThird.getString("country") || 'CO') : 'CO')
      : (customer ? (customer.getString("country") || 'CO') : 'CO');
    const adqAddress = escXml(isPurchaseDoc ? emitterAddress : custAddress);
    const adqTac1 = 'R-99-PN';
    const adqDv = isPurchaseDoc
      ? (adq3 === '31' ? calcularDV(emitterNit) : '0')
      : (adq3 === '31' ? (customer ? (customer.getString("dv") || calcularDV(custDocNum)) : calcularDV(custDocNum)) : '0');
    const adqPostal = adqCityCode || '110111';
    
    let adqNamesXml = '';
    const cleanDoc = String(isPurchaseDoc ? emitterNit : custDocNum).trim();
    const cleanName = String(isPurchaseDoc ? emitterName : custName).trim().toUpperCase();
    const isConsumidorFinal = cleanDoc === '2222222222' || 
                              cleanDoc === '222222222222' || 
                              cleanName === 'CONSUMIDOR FINAL' || 
                              cleanName === 'CONSUMIDOR_FINAL';
    const adq4 = isConsumidorFinal ? '49' : getRegimeFiscal(isPurchaseDoc ? companyThird : customer);
                              
    if (isConsumidorFinal) {
      adqNamesXml = `
    <ADQ_6>CONSUMIDOR_FINAL</ADQ_6>
    <ADQ_7></ADQ_7>
    <ADQ_8>CONSUMIDOR</ADQ_8>
    <ADQ_9>FINAL</ADQ_9>`;
    } else if (adq1 === '2' && adq3 !== '31' && custDocNum !== '222222222222') {
      let fullName = '';
      let firstName = '';
      let surnames = '';
      const dbFirstName = customer ? String(customer.getString('first_name') || '').trim() : '';
      const dbLastName = customer ? String(customer.getString('last_name') || '').trim() : '';
      
      if (dbFirstName && dbLastName) {
        firstName = dbFirstName;
        surnames = dbLastName;
        fullName = (firstName + ' ' + surnames).trim();
      } else {
        const rawName = String(isPurchaseDoc ? emitterName : custName).trim();
        fullName = rawName;
        const parts = rawName.split(/\s+/);
        if (parts.length === 1) {
          firstName = parts[0];
          surnames = 'N/A';
        } else {
          firstName = parts[0];
          surnames = parts.slice(1).join(' ');
        }
      }
      adqNamesXml = `
    <ADQ_6>${escXml(fullName)}</ADQ_6>
    <ADQ_7></ADQ_7>
    <ADQ_8>${escXml(firstName)}</ADQ_8>
    <ADQ_9>${escXml(surnames)}</ADQ_9>`;
    } else {
      adqNamesXml = `
    <ADQ_6>${escXml(isPurchaseDoc ? emitterName : custName)}</ADQ_6>`;
    }
    if (isDS) {
      xml += `
  <ADQ>
    <ADQ_1>${adq1}</ADQ_1>
    <ADQ_2>${adq2}</ADQ_2>
    <ADQ_3>${adq3}</ADQ_3>
    ${adqNamesXml}
    <ADQ_22>${adqDv}</ADQ_22>
    <TCR>
      <TCR_1>${adqTac1}</TCR_1>
    </TCR>
    <GTA>
      <GTA_1>ZZ</GTA_1>
      <GTA_2>IVA</GTA_2>
    </GTA>
  </ADQ>`;
    } else {
      xml += `
  <ADQ>
    <ADQ_1>${adq1}</ADQ_1>
    <ADQ_2>${adq2}</ADQ_2>
    <ADQ_3>${adq3}</ADQ_3>
    <ADQ_4>${adq4}</ADQ_4>
    ${adqNamesXml}
    <ADQ_11>${adqDeptCode}</ADQ_11>
    <ADQ_12>${adqDeptName}</ADQ_12>
    <ADQ_13>${adqCityName}</ADQ_13>
    <ADQ_14>${adqPostal}</ADQ_14>
    <ADQ_15>${adqCountryCode}</ADQ_15>
    <ADQ_22>${adqDv}</ADQ_22>
    <ADQ_23>${adqCityCode}</ADQ_23>
    <TCR>
      <TCR_1>${adqTac1}</TCR_1>
    </TCR>
    <CDA>
      <CDA_2>${adq6}</CDA_2>
      <CDA_3>${escXml(isPurchaseDoc ? emitterPhone : custPhone)}</CDA_3>
      <CDA_4>${escXml(isPurchaseDoc ? emitterEmail : custEmail)}</CDA_4>
    </CDA>
    <GTA>
      <GTA_1>01</GTA_1>
      <GTA_2>IVA</GTA_2>
    </GTA>
  </ADQ>`;
    }

    // 6. TOT Block
    xml += `
  <TOT>
    <TOT_1>${dec(subtotal)}</TOT_1>
    <TOT_2>COP</TOT_2>
    <TOT_3>${isDS ? '0.00' : dec(subtotal)}</TOT_3>
    <TOT_4>COP</TOT_4>
    <TOT_5>${dec(total)}</TOT_5>
    <TOT_6>COP</TOT_6>
    <TOT_7>${dec(total)}</TOT_7>
    <TOT_8>COP</TOT_8>
  </TOT>`;

    // 7. TIM Block
    if (!isDS) {
      const taxGroups = {};
      for (const item of items) {
        const rate = Number(item.ivaRate || 0).toFixed(1);
        if (!taxGroups[rate]) {
          taxGroups[rate] = { base: 0, amount: 0 };
        }
        taxGroups[rate].base += Number(Number(item.subtotal || 0).toFixed(2));
        taxGroups[rate].amount += Number(Number(item.ivaAmount || 0).toFixed(2));
      }
      
      if (Object.keys(taxGroups).length === 0) {
        taxGroups["0.0"] = { base: subtotal, amount: 0 };
      }

      xml += `
  <TIM>
    <TIM_1>false</TIM_1>
    <TIM_2>${dec(ivaTotal)}</TIM_2>
    <TIM_3>COP</TIM_3>`;

      for (const rate of Object.keys(taxGroups)) {
        const group = taxGroups[rate];
        xml += `
    <IMP>
      <IMP_1>01</IMP_1>
      <IMP_2>${dec(group.base)}</IMP_2>
      <IMP_3>COP</IMP_3>
      <IMP_4>${dec(group.amount)}</IMP_4>
      <IMP_5>COP</IMP_5>
      <IMP_6>${rate}</IMP_6>
    </IMP>`;
      }
      xml += `
  </TIM>`;
    }

    // 8. DRF Block
    const drf1 = escXml(resolution ? resolution.getString("resolution_number") : "18764000000001");
    const drf2 = resolution ? resolution.getString("resolution_date").slice(0, 10) : "2026-01-01";
    const drf3 = resolution ? resolution.getString("expiration_date").slice(0, 10) : "2030-01-01";
    // For DS/NDS, DRF_4 must be resolution prefix or 'DSE' / 'DS'
    const drf4 = escXml((resolution && resolution.getString("prefix")) ? resolution.getString("prefix") : (prefix || (isDS ? 'DSE' : (isNDS ? 'NDS' : 'DS'))));
    const drf5 = String(resolution ? resolution.getInt("number_from") : 1);
    const drf6 = String(resolution ? resolution.getInt("number_to") : 10000);

    xml += `
  <DRF>
    <DRF_1>${drf1}</DRF_1>
    <DRF_2>${drf2}</DRF_2>
    <DRF_3>${drf3}</DRF_3>
    <DRF_4>${drf4}</DRF_4>
    <DRF_5>${drf5}</DRF_5>
    <DRF_6>${drf6}</DRF_6>
  </DRF>`;

    // 9. REF Block
    if ((isNC || isND) && crossDocRef && !sinReferencia) {
      let refPrefix = "FE";
      let refFolio = crossDocRef.replace(/[^0-9]/g, '');
      let refDate = "";
      let refCufe = "";
      
      try {
        let origInvoice = null;
        try {
          origInvoice = $app.findFirstRecordByFilter("invoices", "number = '" + crossDocRef + "'");
        } catch (_) {
          const numDigits = crossDocRef.replace(/[^0-9]/g, '');
          if (numDigits) {
            try {
              origInvoice = $app.findFirstRecordByFilter("invoices", "number LIKE '%" + numDigits + "'");
            } catch (_) {}
          }
        }
        if (origInvoice) {
          refDate = origInvoice.getString("date").slice(0, 10);
          try {
            const origDoc = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + origInvoice.getString("tx_id") + "'");
            if (origDoc) {
              refCufe = origDoc.getString("cufe");
            }
          } catch (_) {}
        }
      } catch (_) {}

      if (!refCufe && customer) {
        if (typeof invoice !== 'undefined' && invoice) {
          const invNotes = invoice.getString("notes") || "";
          const cufeMatch = invNotes.match(/CUFE:\s*([a-fA-F0-9]{64,96})/i);
          if (cufeMatch) {
            refCufe = cufeMatch[1];
          }
        }
      }

      const parts = crossDocRef.split("-");
      if (parts.length > 1) {
        refPrefix = parts[0];
        refFolio = parts.slice(1).join("-").replace(/[^0-9]/g, '');
      } else {
        const match = crossDocRef.match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
          refPrefix = match[1];
          refFolio = match[2];
        }
      }
      
      if (!refDate) {
        refDate = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
      }
      if (!refCufe) {
        refCufe = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
      }

      xml += `
  <REF>
    <REF_1>IV</REF_1>
    <REF_2>${escXml(refPrefix + refFolio)}</REF_2>
    <REF_3>${refDate}</REF_3>
    <REF_4>${escXml(refCufe)}</REF_4>
    <REF_5>CUFE-SHA384</REF_5>
  </REF>`;
    }

    // 9.5 NOT Block (para notas sin referencia)
    if ((isNC || isND) && sinReferencia) {
      xml += `
  <NOT>
    <NOT_1>2</NOT_1>
  </NOT>`;
    }

    // 10. MEP Block & CTS Block (Condiciones y Plazo Facturatech)
    const payForm = String(paymentForm || (paymentMethod === 'CREDITO' ? '2' : '1'));
    const payDianCode = String(paymentDianCode || (payForm === '2' ? '30' : (paymentMethod === 'TRANSFERENCIA' ? '47' : '10')));
    let mep1 = payDianCode;
    let mep2 = payForm;
    const dueDateVal = dueDate ? String(dueDate).slice(0, 10) : issueDate;

    let calculatedCreditDays = Number(creditDays || 0);
    if (calculatedCreditDays <= 0 && dueDateVal && issueDate && mep2 === '2') {
      try {
        const dIssue = new Date(issueDate + 'T12:00:00Z');
        const dDue = new Date(dueDateVal + 'T12:00:00Z');
        const diffMs = dDue.getTime() - dIssue.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays > 0) {
          calculatedCreditDays = diffDays;
        }
      } catch (_) {}
    }
    if (mep2 === '2' && calculatedCreditDays <= 0 && customer) {
      try {
        const custPayDays = customer.getInt('payment_days');
        if (custPayDays > 0) calculatedCreditDays = custPayDays;
      } catch (_) {}
    }
    if (mep2 === '2' && calculatedCreditDays <= 0) {
      calculatedCreditDays = 1;
    }

    if (isDS) {
      xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>${mep2}</MEP_2>
    <MEP_3>${mep2 === '2' ? dueDateVal : issueDate}</MEP_3>
  </MEP>`;
      if (mep2 === '2') {
        xml += `
  <CTS>
    <CTS_1>${calculatedCreditDays}</CTS_1>
    <CTS_2>Crédito a ${calculatedCreditDays} días</CTS_2>
  </CTS>`;
      }
    } else if ((isNC || isND) && sinReferencia) {
      xml += `
  <MEP>
    <MEP_1>ZZZ</MEP_1>
    <MEP_2>1</MEP_2>
    <MEP_3>${issueDate}</MEP_3>
  </MEP>`;
    } else {
      if (mep2 === '2') {
        xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>2</MEP_2>
    <MEP_3>${dueDateVal}</MEP_3>
  </MEP>
  <CTS>
    <CTS_1>${calculatedCreditDays}</CTS_1>
    <CTS_2>Crédito a ${calculatedCreditDays} días</CTS_2>
  </CTS>`;
      } else {
        xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>1</MEP_2>
  </MEP>`;
      }
    }

    // 11. CDN Block & SNO Block
    if (isNC || isND) {
      let cdn1 = "";
      if (txDescription) {
        const matchConcept = txDescription.match(/\[Ajuste DIAN:\s*(\d+)\]/i);
        if (matchConcept) {
          cdn1 = matchConcept[1];
        }
      }
      if (!cdn1) {
        cdn1 = sinReferencia ? (isNC ? '5' : '4') : (isNC ? '2' : '1');
      }

      let cdn2 = isNC ? 'Anulacion de factura electronica de venta' : 'Ajuste de factura electronica de venta';
      if (cdn1 === '1') cdn2 = isNC ? 'Devolucion de parte de los bienes' : 'Intereses';
      else if (cdn1 === '2') cdn2 = isNC ? 'Anulacion de factura electronica' : 'Gastos por cobrar';
      else if (cdn1 === '3') cdn2 = isNC ? 'Rebaja total aplicada' : 'Cambio del valor';
      else if (cdn1 === '4') cdn2 = isNC ? 'Descuento total aplicado' : 'Otros';
      else if (cdn1 === '5') cdn2 = isNC ? (sinReferencia ? 'Otros' : 'Rescision: nulidad por falta de requisitos') : 'Otros';
      else if (cdn1 === '6') cdn2 = 'Otros';

      xml += `
  <CDN>
    <CDN_1>${cdn1}</CDN_1>
    <CDN_2>${escXml(cdn2)}</CDN_2>
  </CDN>`;

      if (sinReferencia) {
        xml += `
  <SNO>
    <SNO_1>Y</SNO_1>
  </SNO>`;
      }
    }

    // 12. ITE Blocks
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemIdx = String(idx + 1);
      const itemQty = dec(item.qty);
      const itemPrice = decPrice(item.price, item.qty, item.subtotal);
      const itemSubtotal = dec(item.subtotal);
      const itemDesc = escXml(item.description);
      const itemIvaRate = dec(item.ivaRate || 0);
      const itemIvaAmount = dec(item.ivaAmount || 0);

      xml += `
  <ITE>
    <ITE_1>${itemIdx}</ITE_1>
    <ITE_3>${itemQty}</ITE_3>
    <ITE_4>${escXml(item.unit || 'ZZ')}</ITE_4>
    <ITE_5>${itemSubtotal}</ITE_5>
    <ITE_6>COP</ITE_6>
    <ITE_7>${itemPrice}</ITE_7>
    <ITE_8>COP</ITE_8>
    <ITE_11>${itemDesc}</ITE_11>${isDS ? '' : `
    <ITE_19>${itemSubtotal}</ITE_19>
    <ITE_20>COP</ITE_20>`}
    <ITE_27>${itemQty}</ITE_27>
    <ITE_28>${escXml(item.unit || 'ZZ')}</ITE_28>
    <IAE>
      <IAE_1>${escXml(isDS ? ((item.code && item.code !== '99999999' && item.code !== '—') ? item.code : 'R001') : (item.code || '99999999'))}</IAE_1>
      <IAE_2>999</IAE_2>
    </IAE>`;

      if (isDS) {
        xml += `
    <IBS>
      <IBS_1>${issueDate}</IBS_1>
      <IBS_2>1</IBS_2>
      <IBS_3>Por operación</IBS_3>
    </IBS>`;
      }

      if (!isDS) {
        xml += `
    <TII>
      <TII_1>${itemIvaAmount}</TII_1>
      <TII_2>COP</TII_2>
      <TII_3>false</TII_3>
      <IIM>
        <IIM_1>01</IIM_1>
        <IIM_2>${itemIvaAmount}</IIM_2>
        <IIM_3>COP</IIM_3>
        <IIM_4>${itemSubtotal}</IIM_4>
        <IIM_5>COP</IIM_5>
        <IIM_6>${itemIvaRate}</IIM_6>
      </IIM>
    </TII>`;
      }

      xml += `
  </ITE>`;
    }

    xml += `
</${rootTag}>`;

    return xml;
  };

  function buildFtechPosXml({
    documentType,
    documentNumber,
    issueDate,
    dueDate,
    creditDays,
    issueTime,
    ftechEnvironment,
    emitterNit,
    emitterName,
    emitterAddress,
    emitterPhone,
    emitterEmail,
    custDIANDocType,
    custDocNum,
    custName,
    custAddress,
    custPhone,
    custEmail,
    items,
    subtotal: paramSubtotal,
    ivaTotal: paramIvaTotal,
    total: paramTotal,
    prefix,
    folio,
    resolution,
    companyThird,
    customer,
    crossDocRef,
    clTec,
    cajaName,
    mandante,
    paymentForm,
    paymentDianCode,
    paymentMethod
  }) {
    const dec = (val) => Number(val || 0).toFixed(2);
    const decPrice = (val, qty, subtotal) => {
      const p = Number(val || 0);
      const q = Number(qty || 0);
      const s = Number(subtotal || 0);
      if (q > 0 && s > 0) {
        const calcPrice = s / q;
        if (Math.abs(Number(calcPrice.toFixed(2)) * q - s) < 0.009) {
          return calcPrice.toFixed(2);
        }
        return calcPrice.toFixed(6).replace(/\.?0+$/, '');
      }
      return p.toFixed(2);
    };
    const escXml = (val) => String(val || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const getRegimeFiscal = (thirdRecord) => {
      if (!thirdRecord) return '49';
      const docNum = String(thirdRecord.getString("doc_number") || "").trim();
      if (docNum === '2222222222' || docNum === '222222222222') {
        return '49';
      }
      // Personas naturales (CC, TI, CE, etc.) siempre son No Responsables de IVA (49)
      const personType = String(thirdRecord.getString("person_type") || "").toUpperCase();
      if (personType !== 'JURIDICA') {
        return '49';
      }
      // Para personas jurídicas, evaluar régimen
      const regime = String(thirdRecord.getString("tax_regime") || "").toUpperCase();
      if (regime === 'COMUN' || regime === 'GRAN_CONTR') {
        return '48';
      }
      try {
        const respStr = thirdRecord.getString("resp") || "";
        if (respStr.includes('"48"')) return '48';
        if (respStr.includes('"49"')) return '49';
      } catch (_) {}
      return '48'; // default para jurídica
    };

    let subtotal = 0;
    let ivaTotal = 0;
    for (const item of items) {
      subtotal += Number(Number(item.subtotal || 0).toFixed(2));
      ivaTotal += Number(Number(item.ivaAmount || 0).toFixed(2));
    }
    let total = subtotal + ivaTotal;

    const rootTag = 'FACTURA';
    const enc1 = 'INVOIC';
    const enc2 = escXml(emitterNit);
    const enc3 = escXml(custDocNum);
    const enc4 = 'UBL 2.1';
    const enc5 = 'DIAN 2.1';
    const enc6DocPrefix = resolution ? resolution.getString('prefix') : prefix;
    const enc6 = escXml(enc6DocPrefix + (isNaN(Number(folio)) ? folio : String(Number(folio))));
    const enc9 = '01';
    const enc10 = 'COP';
    const enc15 = String(items.length);
    const enc16 = dueDate ? String(dueDate).slice(0, 10) : issueDate;
    const enc20 = escXml(ftechEnvironment || '2'); // 1 = Prod, 2 = Test
    const enc21 = mandante ? '11' : '10';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag}>
  <ENC>
    <ENC_1>${enc1}</ENC_1>
    <ENC_2>${enc2}</ENC_2>
    <ENC_3>${enc3}</ENC_3>
    <ENC_4>${enc4}</ENC_4>
    <ENC_5>${enc5}</ENC_5>
    <ENC_6>${enc6}</ENC_6>
    <ENC_7>${issueDate}</ENC_7>
    <ENC_8>${issueTime || '00:00:00-05:00'}</ENC_8>
    <ENC_9>${enc9}</ENC_9>
    <ENC_10>${enc10}</ENC_10>
    <ENC_15>${enc15}</ENC_15>
    <ENC_16>${enc16}</ENC_16>
    <ENC_20>${enc20}</ENC_20>
    <ENC_21>${enc21}</ENC_21>
  </ENC>`;

    const ipv1 = escXml(clTec || "00331-10000-00001-AA962");
    const ipv2 = escXml(cajaName || "Caja1");
    const ipv3 = escXml(companyThird ? companyThird.getString("contact_name") : emitterName);
    const ipv4 = escXml(cajaName || "CAJA1").toUpperCase();
    const ipv5 = escXml(prefix || 'FE');
    const ipv6 = dec(total);

    xml += `
  <IPV>
    <IPV_1>${ipv1}</IPV_1>
    <IPV_2>${ipv2}</IPV_2>
    <IPV_3>${ipv3}</IPV_3>
    <IPV_4>${ipv4}</IPV_4>
    <IPV_5>${ipv5}</IPV_5>
    <IPV_6>${ipv6}</IPV_6>
  </IPV>`;

    // Sanitizaciones específicas de POS para Facturatech
    let emiPhone = String(emitterPhone || '').trim();
    if (emiPhone.length < 3) emiPhone = "601-555-0100";
    
    let emiEmail = String(emitterEmail || '').trim();
    if (emiEmail.length < 3) emiEmail = "dian@gravy.com";
    
    let cPhone = String(custPhone || '').trim();
    if (cPhone.length < 3) cPhone = "555-5555";
    
    let cEmail = String(custEmail || '').trim();
    if (cEmail.length < 3) cEmail = "cliente@dian.com";

    // 4. EMI Block (Emitter)
    const emi1 = (companyThird && companyThird.getString("person_type") === 'JURIDICA' ? '1' : '2');
    const emi2 = escXml(emitterNit);
    const emi3 = '31';
    const emi6 = escXml(emitterName);
    const emi7 = escXml(companyThird ? (companyThird.getString("commercial_name") || companyThird.getString("name")) : emitterName);
    const emi10 = escXml(emitterAddress);
    
    const emiDeptCode = (companyThird ? (companyThird.getString("dept_code") || '11') : '11');
    const emiDeptName = (companyThird ? (companyThird.getString("department") || 'BOGOTA') : 'BOGOTA');
    const emiCityCode = (companyThird ? (companyThird.getString("city_code") || '11001') : '11001');
    const emiCityName = (companyThird ? (companyThird.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.');
    const emiCountryCode = (companyThird ? (companyThird.getString("country") || 'CO') : 'CO');
    const emiDv = calcularDV(emitterNit);
    const emiPostal = emiCityCode || '110111';
    const emiPostalDfe = emiCityCode || '111011';
    const emiContact = escXml(companyThird ? (companyThird.getString("contact_name") || companyThird.getString("name")) : emitterName);
    
    const emiTac1 = 'R-99-PN';
    const emiIcc1 = '000000';
    const emiIcc9 = escXml(prefix || 'FE');

    xml += `
  <EMI>
    <EMI_1>${emi1}</EMI_1>
    <EMI_2>${emi2}</EMI_2>
    <EMI_3>${emi3}</EMI_3>
    <EMI_6>${emi6}</EMI_6>
    <EMI_7>${emi7}</EMI_7>
    <EMI_10>${emi10}</EMI_10>
    <EMI_11>${emiDeptCode}</EMI_11>
    <EMI_13>${emiDeptName}</EMI_13>
    <EMI_14>${emiPostal}</EMI_14>
    <EMI_15>${emiCountryCode}</EMI_15>
    <EMI_19>${emiCityName}</EMI_19>
    <EMI_22>${emiDv}</EMI_22>
    <EMI_23>${emiCityCode}</EMI_23>
    <EMI_24>${emiContact}</EMI_24>
    <TAC>
      <TAC_1>${emiTac1}</TAC_1>
    </TAC>
    <DFE>
      <DFE_1>${emiCityCode}</DFE_1>
      <DFE_2>${emiDeptCode}</DFE_2>
      <DFE_3>${emiCountryCode}</DFE_3>
      <DFE_4>${emiPostalDfe}</DFE_4>
      <DFE_5>Colombia</DFE_5>
      <DFE_6>${emiCityName}</DFE_6>
      <DFE_7>${emiDeptName}</DFE_7>
      <DFE_8>${emi10}</DFE_8>
    </DFE>
    <ICC>
      <ICC_1>${emiIcc1}</ICC_1>
      <ICC_9>${emiIcc9}</ICC_9>
    </ICC>
    <CDE>
      <CDE_2>${emiContact}</CDE_2>
      <CDE_3>${escXml(emiPhone)}</CDE_3>
      <CDE_4>${escXml(emiEmail)}</CDE_4>
    </CDE>
    <GTE>
      <GTE_1>01</GTE_1>
      <GTE_2>IVA</GTE_2>
    </GTE>
  </EMI>`;

    // 5. ADQ Block (Acquirer)
    const adq1Raw = (customer && customer.getString("person_type") === 'JURIDICA' ? '1' : '2');
    const adq2 = escXml(custDocNum);
    const adq3 = (custDocNum === '222222222222' || custDocNum === '2222222222' || custName.toUpperCase() === 'CONSUMIDOR FINAL') ? '13' : escXml(custDIANDocType);
    const adq1 = adq3 === '31' ? '1' : adq1Raw;
    const adq6 = escXml(custName);
    
    const adqDeptCode = (customer ? (customer.getString("dept_code") || '11') : '11');
    const adqDeptName = (customer ? (customer.getString("department") || 'BOGOTA') : 'BOGOTA');
    const adqCityCode = (customer ? (customer.getString("city_code") || '11001') : '11001');
    const adqCityName = (customer ? (customer.getString("city") || 'BOGOTA D.C.') : 'BOGOTA D.C.');
    const adqCountryCode = (customer ? (customer.getString("country") || 'CO') : 'CO');
    const adqAddress = escXml(custAddress);
    const adqTac1 = 'R-99-PN';
    const adqDv = adq3 === '31' ? (customer ? (customer.getString("dv") || calcularDV(custDocNum)) : calcularDV(custDocNum)) : '0';
    const adqPostal = adqCityCode || '110111';
    
    let adqNamesXml = '';
    const cleanDoc = String(custDocNum || '').trim();
    const cleanName = String(custName || '').trim().toUpperCase();
    const isConsumidorFinal = cleanDoc === '2222222222' || 
                              cleanDoc === '222222222222' || 
                              cleanName === 'CONSUMIDOR FINAL' || 
                              cleanName === 'CONSUMIDOR_FINAL';
    const adq4 = isConsumidorFinal ? '49' : getRegimeFiscal(customer);
                              
    if (isConsumidorFinal) {
      adqNamesXml = `
    <ADQ_6>CONSUMIDOR_FINAL</ADQ_6>
    <ADQ_7></ADQ_7>
    <ADQ_8>CONSUMIDOR</ADQ_8>
    <ADQ_9>FINAL</ADQ_9>`;
    } else if (adq1 === '2' && adq3 !== '31' && custDocNum !== '222222222222') {
      let fullName = '';
      let firstName = '';
      let surnames = '';
      const dbFirstName = customer ? String(customer.getString('first_name') || '').trim() : '';
      const dbLastName = customer ? String(customer.getString('last_name') || '').trim() : '';
      
      if (dbFirstName && dbLastName) {
        firstName = dbFirstName;
        surnames = dbLastName;
        fullName = (firstName + ' ' + surnames).trim();
      } else {
        const rawName = String(custName).trim();
        fullName = rawName;
        const parts = rawName.split(/\s+/);
        if (parts.length === 1) {
          firstName = parts[0];
          surnames = 'N/A';
        } else {
          firstName = parts[0];
          surnames = parts.slice(1).join(' ');
        }
      }
      adqNamesXml = `
    <ADQ_6>${escXml(fullName)}</ADQ_6>
    <ADQ_7></ADQ_7>
    <ADQ_8>${escXml(firstName)}</ADQ_8>
    <ADQ_9>${escXml(surnames)}</ADQ_9>`;
    } else {
      adqNamesXml = `
    <ADQ_6>${escXml(custName)}</ADQ_6>`;
    }
    xml += `
  <ADQ>
    <ADQ_1>${adq1}</ADQ_1>
    <ADQ_2>${adq2}</ADQ_2>
    <ADQ_3>${adq3}</ADQ_3>
    <ADQ_4>${adq4}</ADQ_4>
    ${adqNamesXml}
    <ADQ_11>${adqDeptCode}</ADQ_11>
    <ADQ_12>${adqDeptName}</ADQ_12>
    <ADQ_13>${adqCityName}</ADQ_13>
    <ADQ_14>${adqPostal}</ADQ_14>
    <ADQ_15>${adqCountryCode}</ADQ_15>
    <ADQ_22>${adqDv}</ADQ_22>
    <ADQ_23>${adqCityCode}</ADQ_23>
    <TCR>
      <TCR_1>${adqTac1}</TCR_1>
    </TCR>
    <CDA>
      <CDA_2>${adq6}</CDA_2>
      <CDA_3>${escXml(cPhone)}</CDA_3>
      <CDA_4>${escXml(cEmail)}</CDA_4>
    </CDA>
    <GTA>
      <GTA_1>01</GTA_1>
      <GTA_2>IVA</GTA_2>
    </GTA>
  </ADQ>`;

    // 6. TOT Block
    xml += `
  <TOT>
    <TOT_1>${dec(subtotal)}</TOT_1>
    <TOT_2>COP</TOT_2>
    <TOT_3>${dec(subtotal)}</TOT_3>
    <TOT_4>COP</TOT_4>
    <TOT_5>${dec(total)}</TOT_5>
    <TOT_6>COP</TOT_6>
    <TOT_7>${dec(total)}</TOT_7>
    <TOT_8>COP</TOT_8>
  </TOT>`;

    // 7. TIM Block
    const taxGroups = {};
    for (const item of items) {
      const rate = Number(item.ivaRate || 0).toFixed(1);
      if (!taxGroups[rate]) {
        taxGroups[rate] = { base: 0, amount: 0 };
      }
      taxGroups[rate].base += Number(Number(item.subtotal || 0).toFixed(2));
      taxGroups[rate].amount += Number(Number(item.ivaAmount || 0).toFixed(2));
    }
    
    if (Object.keys(taxGroups).length === 0) {
      taxGroups["0.0"] = { base: subtotal, amount: 0 };
    }

    xml += `
  <TIM>
    <TIM_1>false</TIM_1>
    <TIM_2>${dec(ivaTotal)}</TIM_2>
    <TIM_3>COP</TIM_3>`;

    for (const rate of Object.keys(taxGroups)) {
      const group = taxGroups[rate];
      xml += `
    <IMP>
      <IMP_1>01</IMP_1>
      <IMP_2>${dec(group.base)}</IMP_2>
      <IMP_3>COP</IMP_3>
      <IMP_4>${dec(group.amount)}</IMP_4>
      <IMP_5>COP</IMP_5>
      <IMP_6>${rate}</IMP_6>
    </IMP>`;
    }
    xml += `
  </TIM>`;

    // 8. DRF Block
    const drf1 = escXml(resolution ? resolution.getString("resolution_number") : "18764000000001");
    const drf2 = resolution ? resolution.getString("resolution_date").slice(0, 10) : "2026-01-01";
    const drf3 = resolution ? resolution.getString("expiration_date").slice(0, 10) : "2030-01-01";
    const drf4 = escXml(prefix || 'FE');
    const drf5 = String(resolution ? resolution.getInt("number_from") : 1);
    const drf6 = String(resolution ? resolution.getInt("number_to") : 10000);

    xml += `
  <DRF>
    <DRF_1>${drf1}</DRF_1>
    <DRF_2>${drf2}</DRF_2>
    <DRF_3>${drf3}</DRF_3>
    <DRF_4>${drf4}</DRF_4>
    <DRF_5>${drf5}</DRF_5>
    <DRF_6>${drf6}</DRF_6>
  </DRF>`;

    // 10. MEP Block & CTS Block (POS Facturatech)
    const payForm = String(paymentForm || (paymentMethod === 'CREDITO' ? '2' : '1'));
    const payDianCode = String(paymentDianCode || (payForm === '2' ? '30' : (paymentMethod === 'TRANSFERENCIA' ? '47' : '10')));
    let mep1 = payDianCode;
    let mep2 = payForm;
    const dueDateVal = dueDate ? String(dueDate).slice(0, 10) : issueDate;

    let calculatedCreditDays = Number(creditDays || 0);
    if (calculatedCreditDays <= 0 && dueDateVal && issueDate && mep2 === '2') {
      try {
        const dIssue = new Date(issueDate + 'T12:00:00Z');
        const dDue = new Date(dueDateVal + 'T12:00:00Z');
        const diffMs = dDue.getTime() - dIssue.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays > 0) {
          calculatedCreditDays = diffDays;
        }
      } catch (_) {}
    }
    if (mep2 === '2' && calculatedCreditDays <= 0 && customer) {
      try {
        const custPayDays = customer.getInt('payment_days');
        if (custPayDays > 0) calculatedCreditDays = custPayDays;
      } catch (_) {}
    }
    if (mep2 === '2' && calculatedCreditDays <= 0) {
      calculatedCreditDays = 1;
    }

    if (mep2 === '2') {
      xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>2</MEP_2>
    <MEP_3>${dueDateVal}</MEP_3>
  </MEP>
  <CTS>
    <CTS_1>${calculatedCreditDays}</CTS_1>
    <CTS_2>Crédito a ${calculatedCreditDays} días</CTS_2>
  </CTS>`;
    } else {
      xml += `
  <MEP>
    <MEP_1>${mep1}</MEP_1>
    <MEP_2>1</MEP_2>
  </MEP>`;
    }

    // 12. ITE Blocks
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemIdx = String(idx + 1);
      const itemQty = dec(item.qty);
      const itemPrice = decPrice(item.price, item.qty, item.subtotal);
      const itemSubtotal = dec(item.subtotal);
      const itemDesc = escXml(item.description);
      const itemIvaRate = dec(item.ivaRate || 0);
      const itemIvaAmount = dec(item.ivaAmount || 0);

      xml += `
  <ITE>
    <ITE_1>${itemIdx}</ITE_1>
    <ITE_3>${itemQty}</ITE_3>
    <ITE_4>${escXml(item.unit || 'ZZ')}</ITE_4>
    <ITE_5>${itemSubtotal}</ITE_5>
    <ITE_6>COP</ITE_6>
    <ITE_7>${itemPrice}</ITE_7>
    <ITE_8>COP</ITE_8>
    <ITE_11>${itemDesc}</ITE_11>
    <ITE_19>${itemSubtotal}</ITE_19>
    <ITE_20>COP</ITE_20>
    <ITE_27>${itemQty}</ITE_27>
    <ITE_28>${escXml(item.unit || 'ZZ')}</ITE_28>
    <IAE>
      <IAE_1>${escXml(item.code || '99999999')}</IAE_1>
      <IAE_2>999</IAE_2>
    </IAE>
    <TII>
      <TII_1>${itemIvaAmount}</TII_1>
      <TII_2>COP</TII_2>
      <TII_3>false</TII_3>
      <IIM>
        <IIM_1>01</IIM_1>
        <IIM_2>${itemIvaAmount}</IIM_2>
        <IIM_3>COP</IIM_3>
        <IIM_4>${itemSubtotal}</IIM_4>
        <IIM_5>COP</IIM_5>
        <IIM_6>${itemIvaRate}</IIM_6>
      </IIM>
    </TII>
  </ITE>`;
    }

    xml += `
</${rootTag}>`;

    return xml;
  };

    let authRecord = null;
    try { authRecord = e.auth; } catch (_) {}
    if (!authRecord) {
      try { authRecord = $apis.requestInfo(e).authRecord; } catch (_) {}
    }
    if (!authRecord) {
      try { if (e.hasSuperuserAuth && e.hasSuperuserAuth()) authRecord = true; } catch (_) {}
    }
    if (!authRecord) {
      e.json(401, { message: "Autenticación requerida." });
      return;
    }
    
    let body = {};
    try { body = e.requestInfo().body || {}; } catch (_) {
      try { body = e.bindBody({}); } catch (_2) {}
    }
    const txId = body.txId || body.tx_id;
    if (!txId) {
      e.json(400, { message: "txId es requerido." });
      return;
    }
    
    let docRecord = null;
    let realTxId = null;

    try {
      let tx = null;
    let purchaseInv = null;
    let salesInv = null;
    try {
      tx = $app.findRecordById("transactions", txId);
    } catch (_) {
      try {
        purchaseInv = $app.findRecordById("purchase_invoices", txId);
        if (purchaseInv && purchaseInv.getString("tx_id")) {
          tx = $app.findRecordById("transactions", purchaseInv.getString("tx_id"));
        }
      } catch (_2) {
        try {
          salesInv = $app.findRecordById("invoices", txId);
          if (salesInv && salesInv.getString("tx_id")) {
            tx = $app.findRecordById("transactions", salesInv.getString("tx_id"));
          }
        } catch (_3) {}
      }
    }

    if (!tx) {
      e.json(400, { message: "No se encontró la transacción contable asociada a este documento." });
      return;
    }

    realTxId = tx.id;
    
    let txType = null;
    let customer = null;
    if (tx.getString("tx_type_id")) {
      try { txType = $app.findRecordById("transaction_types", tx.getString("tx_type_id")); } catch (_) {}
    }
    if (tx.getString("third_party_id")) {
      try { customer = $app.findRecordById("third_parties", tx.getString("third_party_id")); } catch (_) {}
    }
    
    const txTypeCode = txType ? String(txType.getString("code") || '').toUpperCase() : "";
    const txPrefix = txType ? String(txType.getString("prefix") || '').toUpperCase() : "";

    const isPOS = (txTypeCode === "POS");
    const isNC = (txTypeCode === "NC");
    const isND = (txTypeCode === "ND");
    const isFV = (txTypeCode === "FV");
    const isIA = (txTypeCode === "IA");
    const isDS = (txTypeCode === "DS" || txPrefix === "DS" || txPrefix === "DSE" || !!body.isDocSoporte || (purchaseInv && (String(purchaseInv.getString("number") || "").startsWith("DS") || String(purchaseInv.getString("number") || "").startsWith("DSE"))));
    const isNDS = (txTypeCode === "NDS" || txPrefix === "NDS" || txPrefix === "NDSE" || !!body.isNotaAjusteDocSoporte || (purchaseInv && (String(purchaseInv.getString("number") || "").startsWith("NDS") || String(purchaseInv.getString("number") || "").startsWith("NDSE"))));
    
    if (!isPOS && !isNC && !isND && !isFV && !isIA && !isDS && !isNDS) {
      e.json(400, { message: "El tipo de transacción '" + txTypeCode + "' no es válido para facturación DIAN." });
      return;
    }
    
    // Check or create einvoice_docs
    try {
      docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + realTxId + "'");
      if (docRecord.getString("status") === "aceptada") {
        e.json(400, { message: "Este documento ya fue aceptado por la DIAN." });
        return;
      }
    } catch (_) {
      const einvoiceDocsCol = $app.findCollectionByNameOrId("einvoice_docs");
      docRecord = new Record(einvoiceDocsCol, {
        tx_id: realTxId,
        status: "pendiente",
        cufe: "",
        dian_response: "",
        xml_content: ""
      });
      $app.save(docRecord);
    }
    
    
    const einvoiceMethod = getSetting("einvoice_method", "dian");
    let ftechUsername = getSetting("ftech_username", "");
    if (!ftechUsername) {
      ftechUsername = getSetting("company_nit", "900123456").split('-')[0].replace(/[^0-9]/g, '');
    }
    const ftechPassword = getSetting("ftech_password", "");
    const ftechEnvironment = getSetting("ftech_environment", "2");
    const companyThirdPartyId = getSetting("company_third_party_id", "");

    let emitterNit = String(getSetting("dian_nit", getSetting("company_nit", "900123456"))).trim();
    let emitterName = String(getSetting("company_name", "GRAVY CORP SAS")).trim();
    let emitterAddress = String(getSetting("company_address", "Calle 1 # 2 - 3")).trim();
    let emitterPhone = String(getSetting("company_phone", "601-555-0100")).trim();
    let emitterEmail = String(getSetting("company_email", "facturacion@domestiko.com")).trim();

    if (companyThirdPartyId) {
      try {
        const companyThird = $app.findRecordById("third_parties", companyThirdPartyId);
        if (companyThird) {
          emitterNit = companyThird.getString("doc_number") || emitterNit;
          emitterName = sanitizeName(companyThird.getString("name")) || emitterName;
          emitterAddress = companyThird.getString("address") || emitterAddress;
          emitterPhone = companyThird.getString("phone") || emitterPhone;
          emitterEmail = companyThird.getString("email") || emitterEmail;
        }
      } catch (err) {
        console.warn("[GRAVY] Error al cargar tercero de empresa:", err);
      }
    }

    if (!emitterEmail || !emitterEmail.trim()) {
      emitterEmail = "facturacion@domestiko.com";
    }

    const dianEnvironment = getSetting("dian_environment", "2");
    const clTec = getSetting("dian_cltec", "");
    const softwarePin = getSetting("dian_software_pin", "");
    const softwareId = getSetting("dian_software_id", "");
    const certBase64 = getSetting("dian_certificate_base64", "");
    const certPassword = getSetting("dian_certificate_password", "");
    
    const custName = sanitizeName((customer ? customer.getString("name") : "") || "Consumidor Final");
    const custDocType = (customer ? customer.getString("doc_type") : "") || "CC";
    const custDocNum = (customer ? customer.getString("doc_number") : "") || "222222222222";
    const custEmail = (customer ? customer.getString("email") : "") || "cliente@dian.com";
    const custPhone = (customer ? customer.getString("phone") : "") || "555-5555";
    const custAddress = (customer ? customer.getString("address") : "") || "Ciudad";
    
    const custDIANDocType = mapDocType(custDocType);
    
    const getColombiaDateTime = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const coTime = new Date(utc + (3600000 * -5));
      const y = coTime.getFullYear();
      const m = String(coTime.getMonth() + 1).padStart(2, '0');
      const day = String(coTime.getDate()).padStart(2, '0');
      const hh = String(coTime.getHours()).padStart(2, '0');
      const mm = String(coTime.getMinutes()).padStart(2, '0');
      const ss = String(coTime.getSeconds()).padStart(2, '0');
      return {
        date: `${y}-${m}-${day}`,
        time: `${hh}:${mm}:${ss}-05:00`
      };
    };

    const coDT = getColombiaDateTime();
    // Format issueDate: must be YYYY-MM-DD (Regla DIAN FAD09e: la fecha de emisión debe coincidir con la fecha de firma/transmisión de hoy)
    const issueDate = coDT.date;
    // Format issueTime: must be HH:MM:SS-05:00
    const issueTime = coDT.time;
    
    let subtotal = 0;
    let ivaTotal = 0;
    let total = 0;
    let items = [];
    
    let invoice = null;
    let isInmoInvoice = false;
    let isPurchase = false;

    if (isDS || isNDS) {
      try {
        invoice = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + realTxId + "'");
        if (invoice) {
          isPurchase = true;
          purchaseInv = invoice;
        }
      } catch (_) {}
    }

    if (!invoice) {
      try {
        invoice = $app.findFirstRecordByFilter("invoices", "tx_id = '" + realTxId + "'");
      } catch (_) {
        try {
          invoice = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + realTxId + "'");
          if (invoice) {
            isPurchase = true;
            purchaseInv = invoice;
          }
        } catch (_2) {
          try {
            invoice = $app.findFirstRecordByFilter("inmo_invoices", "tx_id = '" + realTxId + "'");
            isInmoInvoice = true;
          } catch (_) {}
        }
      }
    }

    let dueDate = issueDate;
    if (invoice) {
      const invDueDate = invoice.getString("due_date");
      if (invDueDate) {
        dueDate = invDueDate.slice(0, 10);
      }
    } else if (tx) {
      try {
        const txDueDate = tx.getString("due_date");
        if (txDueDate) {
          dueDate = txDueDate.slice(0, 10);
        }
      } catch (_) {}
    }
    
    let mandanteInfo = null;
    if (invoice) {
      if (isInmoInvoice) {
        subtotal = invoice.getFloat("rent_amount") + (invoice.getFloat("other_amount") || 0);
        const commAmt = invoice.getFloat("commission_amount") || 0;
        
        let inmoCfg = {};
        try {
          const cfgRec = $app.findFirstRecordByFilter("settings", "key = 'inmo_config_v1'");
          if (cfgRec) inmoCfg = JSON.parse(cfgRec.getString("value") || "{}");
        } catch (_) {}

        if (commAmt > 0) {
          // CASO A: FACTURA POR MANDATO (Comisión > 0%)
          ivaTotal = 0;
          total = invoice.getFloat("total") || subtotal;
          
          try {
            const contract = $app.findRecordById("inmo_contracts", invoice.getString("contract_id"));
            const property = $app.findRecordById("inmo_properties", contract.getString("property_id"));
            const owner = $app.findRecordById("third_parties", property.getString("owner_id"));
            if (owner) {
              mandanteInfo = {
                docNum: owner.getString("doc_number"),
                docType: mapDocType(owner.getString("doc_type")),
                dv: owner.getString("dv") || calcularDV(owner.getString("doc_number")),
                name: owner.getString("name")
              };
            }
          } catch (err) {
            console.warn("[GRAVY] Error al cargar mandante para factura electrónica por mandato:", err);
          }

          const lines = $app.findRecordsByFilter("inmo_invoice_lines", "invoice_id = '" + invoice.id + "'", "line_order");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            items.push({
              id: String(i + 1),
              description: line.getString("description") || "Canon de arrendamiento",
              qty: 1,
              price: line.getFloat("amount") || 0,
              ivaRate: 0,
              ivaAmount: 0,
              subtotal: line.getFloat("amount") || 0,
              total: line.getFloat("amount") || 0,
              code: '99999999',
              unit: 'ZZ'
            });
          }
        } else {
          // CASO B: FACTURA ESTÁNDAR DE SERVICIOS DE ARRENDAMIENTO (Sin Mandato / Comisión 0%)
          mandanteInfo = null; // Sin extensión de mandato
          const rentHasIva = !!inmoCfg.rent_has_iva;
          const rentIvaRate = rentHasIva ? (parseFloat(inmoCfg.rent_iva_rate) || 19) : 0;
          
          if (rentHasIva && rentIvaRate > 0) {
            ivaTotal = Math.round(subtotal * (rentIvaRate / 100));
            total = subtotal + ivaTotal;
          } else {
            ivaTotal = 0;
            total = subtotal;
          }

          const lines = $app.findRecordsByFilter("inmo_invoice_lines", "invoice_id = '" + invoice.id + "'", "line_order");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineAmt = line.getFloat("amount") || 0;
            const lineIva = (rentHasIva && rentIvaRate > 0) ? Math.round(lineAmt * (rentIvaRate / 100)) : 0;
            items.push({
              id: String(i + 1),
              description: line.getString("description") || "Servicio de arrendamiento de inmueble",
              qty: 1,
              price: lineAmt,
              ivaRate: rentIvaRate,
              ivaAmount: lineIva,
              subtotal: lineAmt,
              total: lineAmt + lineIva,
              code: '99999999',
              unit: 'ZZ'
            });
          }
        }
      } else {
        subtotal = invoice.getFloat("subtotal");
        ivaTotal = invoice.getFloat("iva_total");
        total = invoice.getFloat("total");
        
        if (!isPurchase && (purchaseInv !== null || isDS || isNDS)) {
          isPurchase = true;
        }
        const linesCollection = isPurchase ? 'purchase_invoice_lines' : 'invoice_lines';
        let lines = $app.findRecordsByFilter(linesCollection, "invoice_id = '" + invoice.id + "'", "line_order");
        if ((!lines || lines.length === 0) && isPurchase) {
          try {
            lines = $app.findRecordsByFilter("purchase_invoice_lines", "purchase_invoice_id = '" + invoice.id + "'", "line_order");
          } catch (_) {}
        }
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          let desc = (line.getString("description") || '').trim();
          let itemCode = '99999999';
          let itemUnit = 'ZZ';
          
          const prodId = line.getString("product_id");
          if (prodId) {
            try {
              const product = $app.findRecordById("products", prodId);
              if (product) {
                if (!desc) {
                  desc = product.getString("name") || product.getString("description");
                }
                itemCode = product.getString("code") || '99999999';
                itemUnit = product.getString("unit") || 'ZZ';
              }
            } catch (_) {}
          }
          if (!desc) {
            const accId = line.getString("account_id");
            if (accId) {
              try {
                const acc = $app.findRecordById("accounts", accId);
                if (acc) {
                  desc = (acc.getString("code") + " - " + acc.getString("name")).trim();
                  itemCode = acc.getString("code") || itemCode;
                }
              } catch (_) {}
            }
          }
          if (!desc) {
            desc = (isDS || isNDS) ? "Servicio / Concepto No Obligado" : "Producto/Servicio";
          }

          items.push({
            id: String(i + 1),
            description: desc,
            qty: line.getFloat("qty") || 1,
            price: line.getFloat("unit_price") || 0,
            ivaRate: line.getFloat("iva_rate") || 0,
            ivaAmount: line.getFloat("iva_amount") || 0,
            subtotal: line.getFloat("subtotal") || 0,
            total: line.getFloat("total") || 0,
            code: itemCode,
            unit: itemUnit
          });
        }
      }
    } else {
      const lines = $app.findRecordsByFilter("tx_lines", "tx_id = '" + txId + "'", "line_order");
      let lineIdx = 1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const d = line.getFloat("debit");
        const c = line.getFloat("credit");
        const amount = d > 0 ? d : c;
        if (amount > 0) {
          items.push({
            id: String(lineIdx++),
            description: line.getString("description") || "Concepto Contable",
            qty: 1,
            price: amount,
            ivaRate: 0,
            ivaAmount: 0,
            subtotal: amount,
            total: amount,
            code: '99999999',
            unit: 'ZZ'
          });
          subtotal += amount;
        }
      }
      total = subtotal;
    }

    if (items.length === 0) {
      const txLines = $app.findRecordsByFilter("tx_lines", "tx_id = '" + realTxId + "'", "line_order");
      let lineIdx = 1;
      for (let i = 0; i < txLines.length; i++) {
        const line = txLines[i];
        const d = line.getFloat("debit");
        const c = line.getFloat("credit");
        const amount = d > 0 ? d : c;
        if (amount > 0) {
          items.push({
            id: String(lineIdx++),
            description: line.getString("description") || "Concepto Contable",
            qty: 1,
            price: amount,
            ivaRate: 0,
            ivaAmount: 0,
            subtotal: amount,
            total: amount,
            code: '99999999',
            unit: 'ZZ'
          });
          subtotal += amount;
        }
      }
      if (items.length > 0) {
        total = subtotal;
      }
    }

    if (items.length === 0) {
      e.json(400, { message: "El documento " + (tx.getString("number") || "") + " no contiene conceptos ni líneas para emitir ante la DIAN." });
      return;
    }
    
    const docNumber = tx.getString("number") || ("TEMP" + Date.now());
    let prefix = txType ? txType.getString("prefix") : "";
    let folio = docNumber;
    if (prefix && folio.startsWith(prefix)) {
      folio = folio.substring(prefix.length);
    }
    folio = folio.replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (!folio) folio = "0";

    let companyThird = null;
    if (companyThirdPartyId) {
      try {
        companyThird = $app.findRecordById("third_parties", companyThirdPartyId);
      } catch (err) {
        console.warn("[GRAVY] Error al cargar tercero de empresa:", err);
      }
    }

    let docTypeForRes = "FV";
    if (isNC) docTypeForRes = "NC";
    else if (isND) docTypeForRes = "ND";
    else if (isPOS) docTypeForRes = "POS";
    else if (isIA) docTypeForRes = "FV";
    else if (isDS) docTypeForRes = "DS";
    else if (isNDS) docTypeForRes = "NDS";

    let resolution = null;
    try {
      if (prefix) {
        resolution = $app.findFirstRecordByFilter("dian_resolutions", "active = true && prefix = '" + prefix + "' && document_type = '" + docTypeForRes + "'");
      }
    } catch (_) {}
    if (!resolution) {
      try {
        resolution = $app.findFirstRecordByFilter("dian_resolutions", "active = true && document_type = '" + docTypeForRes + "'");
      } catch (_) {}
    }
    if (resolution && resolution.getString("prefix") && (!prefix || isDS || isNDS)) {
      if (!prefix || isDS || isNDS) {
        prefix = resolution.getString("prefix");
      }
    }

    let cajaName = "Caja1";
    const posShiftId = tx.getString("pos_shift_id");
    if (posShiftId) {
      try {
        const shift = $app.findRecordById("pos_shifts", posShiftId);
        const regId = shift.getString("pos_register_id");
        if (regId) {
          const register = $app.findRecordById("pos_registers", regId);
          if (register) {
            cajaName = (register.getString("name") || "Caja1").replace(/\s+/g, "");
          }
        }
      } catch (_) {}
    } else if (resolution) {
      const regId = resolution.getString("pos_register_id");
      if (regId) {
        try {
          const register = $app.findRecordById("pos_registers", regId);
          if (register) {
            cajaName = (register.getString("name") || "Caja1").replace(/\s+/g, "");
          }
        } catch (_) {}
      }
    }

    let paymentForm = "1";
    let paymentDianCode = "10";
    let paymentMethod = "EFECTIVO";
    let creditDays = 0;
    if (invoice) {
      const invDueDate = invoice.getString("due_date");
      const invForm = invoice.getString("payment_form");
      const invMethod = invoice.getString("payment_method");
      
      if (invDueDate && invDueDate.slice(0, 10) > issueDate) {
        paymentForm = "2";
      } else if (invForm === "2" || invMethod === "CREDITO") {
        paymentForm = "2";
      } else {
        paymentForm = invForm || "1";
      }
      
      paymentDianCode = invoice.getString("payment_dian_code") || (paymentForm === "2" ? "30" : (invMethod === "TRANSFERENCIA" ? "47" : "10"));
      paymentMethod = invMethod || (paymentForm === "2" ? "CREDITO" : "EFECTIVO");
    }

    const invDateStr = (invoice ? invoice.getString("date") : "") || (tx ? tx.getString("date") : "") || issueDate;
    if (paymentForm === "2" && dueDate) {
      try {
        const dBase = new Date((invDateStr.slice(0, 10) || issueDate) + "T12:00:00Z");
        const dDue = new Date(dueDate.slice(0, 10) + "T12:00:00Z");
        const diffMs = dDue.getTime() - dBase.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays > 0) creditDays = diffDays;
      } catch (_) {}
    }
    if (creditDays <= 0 && paymentForm === "2" && customer) {
      try {
        const cpDays = customer.getInt("payment_days");
        if (cpDays > 0) creditDays = cpDays;
      } catch (_) {}
    }
    if (creditDays <= 0 && paymentForm === "2" && dueDate && issueDate) {
      try {
        const dIssue = new Date(issueDate + "T12:00:00Z");
        const dDue = new Date(dueDate.slice(0, 10) + "T12:00:00Z");
        const diffMs = dDue.getTime() - dIssue.getTime();
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays > 0) creditDays = diffDays;
      } catch (_) {}
    }

    let xml = "";
    if (einvoiceMethod === "facturatech") {
      if (isPOS) {
        xml = buildFtechPosXml({
          documentType: 'Invoice',
          documentNumber: docNumber,
          issueDate,
          dueDate,
          creditDays,
          issueTime,
          ftechEnvironment,
          emitterNit,
          emitterName,
          emitterAddress,
          emitterPhone,
          emitterEmail,
          custDIANDocType,
          custDocNum,
          custName,
          custAddress,
          custPhone,
          custEmail,
          items,
          subtotal,
          ivaTotal,
          total,
          prefix,
          folio,
          resolution,
          companyThird,
          customer,
          clTec,
          cajaName,
          mandante: mandanteInfo,
          paymentForm,
          paymentDianCode,
          paymentMethod
        });
      } else {
        xml = buildFtechXml({
          documentType: (isNC || isNDS ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')),
          documentNumber: docNumber,
          issueDate,
          dueDate,
          creditDays,
          issueTime,
          ftechEnvironment,
          emitterNit,
          emitterName,
          emitterAddress,
          emitterPhone,
          emitterEmail,
          custDIANDocType,
          custDocNum,
          custName,
          custAddress,
          custPhone,
          custEmail,
          items,
          subtotal,
          ivaTotal,
          total,
          prefix,
          folio,
          resolution,
          companyThird,
          customer,
          clTec,
          cajaName,
          mandante: mandanteInfo,
          crossDocRef: (() => {
            const txDesc = tx ? tx.getString("description") : "";
            const invNotes = invoice ? (invoice.getString("notes") || "") : "";
            if (txDesc.includes("[SIN_REFERENCIA]") || invNotes.includes("[SIN_REFERENCIA]")) return "";
            
            // 1. Direct cross_doc_ref field on invoice
            if (invoice) {
              const directRef = invoice.getString("cross_doc_ref");
              if (directRef && directRef.trim()) return directRef.trim();
            }

            // 2. Parse from invoice notes
            if (invNotes) {
              let m = invNotes.match(/Ajuste a documento\s+([A-Za-z0-9\-]+)/i);
              if (m) return m[1].trim();
              m = invNotes.match(/(?:referente a|referencia a|factura)\s+(?:la\s+)?(?:Factura\s+)?(?:Electrónica\s+)?N[º°]?\s*([A-Za-z0-9\-]+)/i);
              if (m) return m[1].trim();
              m = invNotes.match(/(FV-[0-9]+)/i);
              if (m) return m[1].trim();
            }

            // 3. Parse from tx description
            if (txDesc) {
              let m = txDesc.match(/Ajuste a documento\s+([A-Za-z0-9\-]+)/i);
              if (m) return m[1].trim();
              m = txDesc.match(/(?:referente a|referencia a|factura)\s+(?:la\s+)?(?:Factura\s+)?(?:Electrónica\s+)?N[º°]?\s*([A-Za-z0-9\-]+)/i);
              if (m) return m[1].trim();
              m = txDesc.match(/(FV-[0-9]+)/i);
              if (m) return m[1].trim();
            }

            // 4. Fallback: check tx_lines
            if (tx) {
              try {
                const lines = $app.findRecordsByFilter("tx_lines", "tx_id = '" + tx.id + "'");
                for (let idx = 0; idx < lines.length; idx++) {
                  const lineRef = lines[idx].getString("cross_doc_ref");
                  if (lineRef && lineRef.trim()) return lineRef.trim();
                }
              } catch (_) {}
            }

            return "";
          })(),
          isDS,
          isNDS,
          sinReferencia: (() => {
            const txDesc = tx ? tx.getString("description") : "";
            const invNotes = invoice ? (invoice.getString("notes") || "") : "";
            return txDesc.includes("[SIN_REFERENCIA]") || invNotes.includes("[SIN_REFERENCIA]");
          })(),
          txDescription: tx ? tx.getString("description") : "",
          paymentForm,
          paymentDianCode,
          paymentMethod
        });
      }
    } else {
      xml = buildUblXml({
        documentType: (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')),
        documentNumber: docNumber,
        issueDate,
        dueDate,
        creditDays,
        issueTime,
        dianEnvironment,
        emitterNit,
        emitterName,
        emitterAddress,
        emitterPhone,
        emitterEmail,
        custDIANDocType,
        custDocNum,
        custName,
        custAddress,
        custPhone,
        custEmail,
        items,
        subtotal,
        ivaTotal,
        total,
        softwareId,
        mandante: mandanteInfo,
        paymentForm,
        paymentDianCode,
        paymentMethod
      });
    }

    if (body.dryRun || body.testXml) {
      e.json(200, { success: true, xml: xml });
      return;
    }

    if (einvoiceMethod === "facturatech") {
      if (!ftechUsername) {
        e.json(400, { message: "Debe configurar el Usuario/NIT de Facturatech en Configuración -> Facturación Electrónica DIAN." });
        return;
      }

      let responseData = null;
      if (docRecord.getString("status") === "enviada" && docRecord.getString("ftech_transaction_id")) {
        console.log("[GRAVY HOOK] El documento ya posee transactionID (" + docRecord.getString("ftech_transaction_id") + "). Re-consultando estado en Facturatech...");
        responseData = {
          success: true,
          transaccionID: docRecord.getString("ftech_transaction_id")
        };
      } else {
        const hubUrl = "http://127.0.0.1:8088/api/facturatech/upload-and-send";
        console.log("[GRAVY HOOK] Enviando a Facturatech en Hub: " + hubUrl);
        
        const requestBody = {
          xmlContent: xml,
          ftechUsername,
          ftechPassword,
          ftechEnvironment,
          documentType: (isDS ? 'SupportDocument' : (isNDS ? 'SupportDocumentAdjust' : (isNC || isNDS ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice')))),
          documentNumber: docNumber,
          prefix,
          folio,
          isPOS: isPOS,
          isDS: isDS,
          isNDS: isNDS
        };
        
        const res = $http.send({
          url: hubUrl,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        
        if (res.statusCode !== 200) {
          let errDetails = res.raw;
          try {
            const parsed = JSON.parse(res.raw);
            errDetails = parsed.error || parsed.message || res.raw;
          } catch (_) {}
          throw new Error("Facturatech Hub Error (" + res.statusCode + "): " + errDetails);
        }
        
        responseData = JSON.parse(res.raw);
        
        if (!responseData.success) {
          throw new Error(responseData.error || responseData.message || "Error al subir a Facturatech.");
        }
        
        docRecord.set("ftech_transaction_id", responseData.transaccionID || "");
        docRecord.set("status", responseData.status || "enviada");
        docRecord.set("cufe", responseData.cufe || "");
        docRecord.set("dian_response", responseData.message || "Enviado a Facturatech.");
        docRecord.set("xml_content", responseData.xmlContent || xml);
        docRecord.set("sent_at", new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19));
        $app.save(docRecord);
      }

      // Loop up to 5 times to wait for the validation status
      let pollAttempts = 0;
      const maxPollAttempts = 5;
      while (pollAttempts < maxPollAttempts) {
        pollAttempts++;
        console.log("[GRAVY HOOK] Consultando estado automática en Facturatech (Intento " + pollAttempts + ")...");
        
        sleep(3000); // Wait 3 seconds
        
        try {
          const checkRes = $http.send({
            url: "http://127.0.0.1:8088/api/facturatech/check-status",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transId: responseData.transaccionID || docRecord.getString("ftech_transaction_id"),
              ftechUsername,
              ftechPassword,
              ftechEnvironment,
              prefix,
              folio,
              isPOS: isPOS,
              isDS: isDS,
              isNDS: isNDS,
              documentNumber: docNumber,
              documentType: (isDS ? 'SupportDocument' : (isNDS ? 'SupportDocumentAdjust' : (isNC || isNDS ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice'))))
            })
          });
          
          if (checkRes.statusCode === 200) {
            const checkData = JSON.parse(checkRes.raw);
            if (checkData.success) {
              const currentStatus = checkData.status || "enviada";
              docRecord.set("status", currentStatus);
              if (checkData.cufe) {
                docRecord.set("cufe", checkData.cufe);
              }
              if (checkData.xmlContent) {
                docRecord.set("xml_content", checkData.xmlContent);
              }
              docRecord.set("dian_response", checkData.message || "Procesado.");
              $app.save(docRecord);
              
              console.log("[GRAVY HOOK] Intento " + pollAttempts + " - Estado obtenido: " + currentStatus);
              
              if (currentStatus === "aceptada" || currentStatus === "rechazada") {
                break;
              }
            }
          }
        } catch (pollErr) {
          console.warn("[GRAVY HOOK] Error en consulta automática de estado:", pollErr);
        }
      }

      // Auto-send email if accepted
      if (docRecord.getString("status") === "aceptada") {
        try {
          sendInvoiceEmailHelper(txId);
        } catch (emailErr) {
          console.error("[GRAVY HOOK] Error al enviar correo automático:", emailErr);
        }
      }
      
      e.json(200, {
        success: true,
        status: docRecord.get("status"),
        cufe: docRecord.get("cufe"),
        dianResponse: docRecord.get("dian_response"),
        simulated: !!responseData.simulated
      });
      return;
    }

    // Helper autónomo para invocar MATIAS API inmune a aislamiento de scope en Goja
    function getMatiasCaller() {
      if (typeof globalThis.callMatiasApi === "function") {
        return globalThis.callMatiasApi;
      }
      return function(endpoint, method, payload, overrideOptions) {
        const opts = overrideOptions || {};
        let env = opts.environment;
        if (!env) {
          try {
            const rEnv = $app.findFirstRecordByFilter("settings", "key = 'matias_environment'");
            env = (rEnv ? rEnv.get("value") : "") || "sandbox";
          } catch (_) {
            env = "sandbox";
          }
        }
        const baseUrl = env === "production"
          ? "https://api-v2.matias-api.com/api/ubl2.1"
          : "https://sandbox-api.matias-api.com/api/ubl2.1";

        let token = opts.token;
        if (!token) {
          try {
            const rTok = $app.findFirstRecordByFilter("settings", "key = 'matias_api_token'");
            token = (rTok ? rTok.get("value") : "") || "";
          } catch (_) {
            token = "";
          }
        }

        if (!token) {
          throw new Error("Token de MATIAS API no configurado. Vaya a Configuración -> Facturación Electrónica.");
        }

        let clientUuid = opts.client_uuid;
        if (!clientUuid) {
          try {
            const rUuid = $app.findFirstRecordByFilter("settings", "key = 'matias_client_uuid'");
            clientUuid = (rUuid ? rUuid.get("value") : "") || "";
          } catch (_) {
            clientUuid = "";
          }
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
      };
    }

    if (einvoiceMethod === "matias") {
      console.log("[GRAVY HOOK] Emitiendo documento electrónico vía MATIAS API...");

      // Determinar endpoint y tipo de documento MATIAS API
      let matiasEndpoint = "/invoice";
      let matiasTypeDocId = 7; // Factura Electrónica estándar
      let matiasOperationTypeId = mandanteInfo ? 3 : 1;

      if (isPOS) {
        matiasTypeDocId = 20; // POS Electrónico
        matiasOperationTypeId = 1;
      } else if (isNDS) {
        matiasEndpoint = "/ds/adjustment-note";
        matiasTypeDocId = 15; // Nota Ajuste Documento Soporte
        matiasOperationTypeId = 1;
      } else if (isNC) {
        matiasEndpoint = "/notes/credit";
        matiasTypeDocId = 5; // Nota Crédito
        matiasOperationTypeId = 12; // Nota Crédito con referencia a factura electrónica en MATIAS API
      } else if (isND) {
        matiasEndpoint = "/notes/debit";
        matiasTypeDocId = 4; // Nota Débito
        matiasOperationTypeId = 1; // Nota Débito estándar en MATIAS API
      } else if (isDS) {
        matiasEndpoint = "/ds/document";
        matiasTypeDocId = 11; // Documento Soporte
        matiasOperationTypeId = 9;
      }

      // Mapear tipo documento identificación del cliente para MATIAS API
      // 1=RC, 2=TI, 3=CC, 4=TE, 5=Pasaporte, 6=NIT
      let matiasIdDocType = 3;
      if (custDIANDocType === "31") matiasIdDocType = 6;
      else if (custDIANDocType === "13") matiasIdDocType = 3;
      else if (custDIANDocType === "22" || custDIANDocType === "21") matiasIdDocType = 4;
      else if (custDIANDocType === "41") matiasIdDocType = 5;
      else if (custDIANDocType === "12") matiasIdDocType = 2;
      else if (custDIANDocType === "11") matiasIdDocType = 1;

      // Sanear teléfono para reglas estrictas de MATIAS API (numérico entre 7 y 15 dígitos)
      const rawPhone = String(custPhone || "").replace(/[^0-9]/g, "");
      const validPhone = (rawPhone.length >= 7 && rawPhone.length <= 15) ? rawPhone : "3001234567";

      // Líneas para MATIAS API
      const matiasLines = items.map((it, idx) => {
        const uPrice = parseFloat(it.price != null ? it.price : (it.unitPrice || 0));
        const itemQty = parseFloat(it.qty || 1);
        const itemLineTotal = parseFloat((itemQty * uPrice).toFixed(2));
        const itemIvaRate = parseFloat(it.ivaRate || 0);
        const itemIvaAmt = parseFloat((itemLineTotal * itemIvaRate / 100).toFixed(2));
        let unitId = 70; // 94 - unidad por defecto
        const rawUnit = String(it.unit || "").trim().toUpperCase();
        if (rawUnit === "94" || rawUnit === "EA" || rawUnit === "UND" || rawUnit === "UNIDAD") unitId = 70;
        else if (rawUnit === "BX" || rawUnit === "CJ" || rawUnit === "CAJA") unitId = 381;
        else if (rawUnit === "KGM" || rawUnit === "KG") unitId = 767;
        else if (rawUnit === "GRM" || rawUnit === "GR") unitId = 692;
        else if (rawUnit === "LTR" || rawUnit === "LT") unitId = 821;
        else if (rawUnit === "MTK" || rawUnit === "M2") unitId = 863;
        else if (rawUnit === "MTR" || rawUnit === "MT") unitId = 865;
        else if (rawUnit === "ZZ") unitId = 1093;

        const lineObj = {
          unit_measure_id: unitId,
          quantity_units_id: unitId,
          invoiced_quantity: String(itemQty),
          line_extension_amount: itemLineTotal.toFixed(2),
          free_of_charge_indicator: false,
          description: it.description || it.desc || "Producto / Servicio",
          code: it.code || String(idx + 1),
          type_item_identification_id: 4, // Estándar de adopción del contribuyente
          type_item_identifications_id: 4,
          reference_price_id: 1,
          price_amount: uPrice.toFixed(2),
          base_quantity: String(itemQty)
        };

        if (isDS || isNDS) {
          lineObj.invoice_period = {
            start_date: (invoice && invoice.getString("date")) ? invoice.getString("date").slice(0, 10) : issueDate,
            description_code: 1
          };
          lineObj.tax_totals = [{
            tax_id: 1, // IVA 0% para sujetos no obligados a facturar (Regla DIAN FAU04)
            percent: "0.00",
            taxable_amount: itemLineTotal.toFixed(2),
            tax_amount: "0.00"
          }];
        } else {
          lineObj.tax_totals = [{
            tax_id: 1, // IVA (0% o tarifa correspondiente para cumplir regla DIAN FAU04)
            percent: itemIvaRate.toFixed(2),
            taxable_amount: itemLineTotal.toFixed(2),
            tax_amount: itemIvaAmt.toFixed(2)
          }];
        }

        return lineObj;
      });

      const resNum = resolution ? resolution.getString("resolution_number") : getSetting("dian_resolution_number", "18760000001");
      const cleanDocNum = String(folio || tx.getInt("number") || "1");

      // Catálogo oficial DANE a ID interno de municipio en MATIAS API (1.122 municipios)
      const MATIAS_DANE_CITIES = {"11001":149,"13001":150,"13006":151,"13030":152,"13042":153,"13052":154,"13062":155,"13074":156,"13140":157,"13160":158,"13188":159,"13212":160,"13222":161,"13244":162,"13248":163,"13268":164,"13300":165,"13430":166,"13433":167,"13440":168,"13442":169,"13458":170,"13468":171,"13473":172,"13490":173,"13549":174,"13580":175,"13600":176,"13620":177,"13647":178,"13650":179,"13654":180,"13655":181,"13657":182,"13667":183,"13670":184,"13673":185,"13683":186,"13688":187,"13744":188,"13760":189,"13780":190,"13810":191,"13836":192,"13838":193,"13873":194,"13894":195,"15001":196,"15022":197,"15047":198,"15051":199,"15087":200,"15090":201,"15092":202,"15097":203,"15104":204,"15106":205,"15109":206,"15114":207,"15131":208,"15135":209,"15162":210,"15172":211,"15176":212,"15180":213,"15183":214,"15185":215,"15187":216,"15189":217,"15204":218,"15212":219,"15215":220,"15218":221,"15223":222,"15224":223,"15226":224,"15232":225,"15236":226,"15238":227,"15244":228,"15248":229,"15272":230,"15276":231,"15293":232,"15296":233,"15299":234,"15317":235,"15322":236,"15325":237,"15332":238,"15362":239,"15367":240,"15368":241,"15377":242,"15380":243,"15401":244,"15403":245,"15407":246,"15425":247,"15442":248,"15455":249,"15464":250,"15466":251,"15469":252,"15476":253,"15480":254,"15491":255,"15494":256,"15500":257,"15507":258,"15511":259,"15514":260,"15516":261,"15518":262,"15522":263,"15531":264,"15533":265,"15537":266,"15542":267,"15550":268,"15572":269,"15580":270,"15599":271,"15600":272,"15621":273,"15632":274,"15638":275,"15646":276,"15660":277,"15664":278,"15667":279,"15673":280,"15676":281,"15681":282,"15686":283,"15690":284,"15693":285,"15696":286,"15720":287,"15723":288,"15740":289,"15753":290,"15755":291,"15757":292,"15759":293,"15761":294,"15762":295,"15763":296,"15764":297,"15774":298,"15776":299,"15778":300,"15790":301,"15798":302,"15804":303,"15806":304,"15808":305,"15810":306,"15814":307,"15816":308,"15820":309,"15822":310,"15832":311,"15835":312,"15837":313,"15839":314,"15842":315,"15861":316,"15879":317,"15897":318,"17001":319,"17013":320,"17042":321,"17050":322,"17088":323,"17174":324,"17272":325,"17380":326,"17388":327,"17433":328,"17442":329,"17444":330,"17446":331,"17486":332,"17495":333,"17513":334,"17524":335,"17541":336,"17614":337,"17616":338,"17653":339,"17662":340,"17665":341,"17777":342,"17867":343,"17873":344,"17877":345,"18001":346,"18029":347,"18094":348,"18150":349,"18205":350,"18247":351,"18256":352,"18410":353,"18460":354,"18479":355,"18592":356,"18610":357,"18753":358,"18756":359,"18785":360,"18860":361,"19001":362,"19022":363,"19050":364,"19075":365,"19100":366,"19110":367,"19130":368,"19137":369,"19142":370,"19212":371,"19256":372,"19290":373,"19300":374,"19318":375,"19355":376,"19364":377,"19392":378,"19397":379,"19418":380,"19450":381,"19455":382,"19473":383,"19513":384,"19517":385,"19532":386,"19533":387,"19548":388,"19573":389,"19585":390,"19622":391,"19693":392,"19698":393,"19701":394,"19743":395,"19760":396,"19780":397,"19785":398,"19807":399,"19809":400,"19821":401,"19824":402,"19845":403,"20001":404,"20011":405,"20013":406,"20032":407,"20045":408,"20060":409,"20175":410,"20178":411,"20228":412,"20238":413,"20250":414,"20295":415,"20310":416,"20383":417,"20400":418,"20443":419,"20517":420,"20550":421,"20570":422,"20614":423,"20621":424,"20710":425,"20750":426,"20770":427,"20787":428,"23001":429,"23068":430,"23079":431,"23090":432,"23162":433,"23168":434,"23182":435,"23189":436,"23300":437,"23350":438,"23417":439,"23419":440,"23464":441,"23466":442,"23500":443,"23555":444,"23570":445,"23574":446,"23580":447,"23586":448,"23660":449,"23670":450,"23672":451,"23675":452,"23678":453,"23682":454,"23686":455,"23807":456,"23815":457,"23855":458,"25001":459,"25019":460,"25035":461,"25040":462,"25053":463,"25086":464,"25095":465,"25099":466,"25120":467,"25123":468,"25126":469,"25148":470,"25151":471,"25154":472,"25168":473,"25175":474,"25178":475,"25181":476,"25183":477,"25200":478,"25214":479,"25224":480,"25245":481,"25258":482,"25260":483,"25269":484,"25279":485,"25281":486,"25286":487,"25288":488,"25290":489,"25293":490,"25295":491,"25297":492,"25299":493,"25307":494,"25312":495,"25317":496,"25320":497,"25322":498,"25324":499,"25326":500,"25328":501,"25335":502,"25339":503,"25368":504,"25372":505,"25377":506,"25386":507,"25394":508,"25398":509,"25402":510,"25407":511,"25426":512,"25430":513,"25436":514,"25438":515,"25473":516,"25483":517,"25486":518,"25488":519,"25489":520,"25491":521,"25506":522,"25513":523,"25518":524,"25524":525,"25530":526,"25535":527,"25572":528,"25580":529,"25592":530,"25594":531,"25596":532,"25599":533,"25612":534,"25645":535,"25649":536,"25653":537,"25658":538,"25662":539,"25718":540,"25736":541,"25740":542,"25743":543,"25745":544,"25754":545,"25758":546,"25769":547,"25772":548,"25777":549,"25779":550,"25781":551,"25785":552,"25793":553,"25797":554,"25799":555,"25805":556,"25807":557,"25815":558,"25817":559,"25823":560,"25839":561,"25841":562,"25843":563,"25845":564,"25851":565,"25862":566,"25867":567,"25871":568,"25873":569,"25875":570,"25878":571,"25885":572,"25898":573,"25899":574,"27001":575,"27006":576,"27025":577,"27050":578,"27073":579,"27075":580,"27077":581,"27099":582,"27135":583,"27150":584,"27160":585,"27205":586,"27245":587,"27250":588,"27361":589,"27372":590,"27413":591,"27425":592,"27430":593,"27450":594,"27491":595,"27495":596,"27580":597,"27600":598,"27615":599,"27660":600,"27745":601,"27787":602,"27800":603,"27810":604,"41001":605,"41006":606,"41013":607,"41016":608,"41020":609,"41026":610,"41078":611,"41132":612,"41206":613,"41244":614,"41298":615,"41306":616,"41319":617,"41349":618,"41357":619,"41359":620,"41378":621,"41396":622,"41483":623,"41503":624,"41518":625,"41524":626,"41530":627,"41548":628,"41551":629,"41615":630,"41660":631,"41668":632,"41676":633,"41770":634,"41791":635,"41797":636,"41799":637,"41801":638,"41807":639,"41872":640,"41885":641,"44001":642,"44035":643,"44078":644,"44090":645,"44098":646,"44110":647,"44279":648,"44378":649,"44420":650,"44430":651,"44560":652,"44650":653,"44847":654,"44855":655,"44874":656,"47001":657,"47030":658,"47053":659,"47058":660,"47161":661,"47170":662,"47189":663,"47205":664,"47245":665,"47258":666,"47268":667,"47288":668,"47318":669,"47460":670,"47541":671,"47545":672,"47551":673,"47555":674,"47570":675,"47605":676,"47660":677,"47675":678,"47692":679,"47703":680,"47707":681,"47720":682,"47745":683,"47798":684,"47960":685,"47980":686,"50001":687,"50006":688,"50110":689,"50124":690,"50150":691,"50223":692,"50226":693,"50245":694,"50251":695,"50270":696,"50287":697,"50313":698,"50318":699,"50325":700,"50330":701,"50350":702,"50370":703,"50400":704,"50450":705,"50568":706,"50573":707,"50577":708,"50590":709,"50606":710,"50680":711,"50683":712,"50686":713,"50689":714,"50711":715,"52001":716,"52019":717,"52022":718,"52036":719,"52051":720,"52079":721,"52083":722,"52110":723,"52203":724,"52207":725,"52210":726,"52215":727,"52224":728,"52227":729,"52233":730,"52240":731,"52250":732,"52254":733,"52256":734,"52258":735,"52260":736,"52287":737,"52317":738,"52320":739,"52323":740,"52352":741,"52354":742,"52356":743,"52378":744,"52381":745,"52385":746,"52390":747,"52399":748,"52405":749,"52411":750,"52418":751,"52427":752,"52435":753,"52473":754,"52480":755,"52490":756,"52506":757,"52520":758,"52540":759,"52560":760,"52565":761,"52573":762,"52585":763,"52612":764,"52621":765,"52678":766,"52683":767,"52685":768,"52687":769,"52693":770,"52694":771,"52696":772,"52699":773,"52720":774,"52786":775,"52788":776,"52835":777,"52838":778,"52885":779,"54001":780,"54003":781,"54051":782,"54099":783,"54109":784,"54125":785,"54128":786,"54172":787,"54174":788,"54206":789,"54223":790,"54239":791,"54245":792,"54250":793,"54261":794,"54313":795,"54344":796,"54347":797,"54377":798,"54385":799,"54398":800,"54405":801,"54418":802,"54480":803,"54498":804,"54518":805,"54520":806,"54553":807,"54599":808,"54660":809,"54670":810,"54673":811,"54680":812,"54720":813,"54743":814,"54800":815,"54810":816,"54820":817,"54871":818,"54874":819,"63001":820,"63111":821,"63130":822,"63190":823,"63212":824,"63272":825,"63302":826,"63401":827,"63470":828,"63548":829,"63594":830,"63690":831,"66001":832,"66045":833,"66075":834,"66088":835,"66170":836,"66318":837,"66383":838,"66400":839,"66440":840,"66456":841,"66572":842,"66594":843,"66682":844,"66687":845,"68001":846,"68013":847,"68020":848,"68051":849,"68077":850,"68079":851,"68081":852,"68092":853,"68101":854,"68121":855,"68132":856,"68147":857,"68152":858,"68160":859,"68162":860,"68167":861,"68169":862,"68176":863,"68179":864,"68190":865,"68207":866,"68209":867,"68211":868,"68217":869,"68229":870,"68235":871,"68245":872,"68250":873,"68255":874,"68264":875,"68266":876,"68271":877,"68276":878,"68296":879,"68298":880,"68307":881,"68318":882,"68320":883,"68322":884,"68324":885,"68327":886,"68344":887,"68368":888,"68370":889,"68377":890,"68385":891,"68397":892,"68406":893,"68418":894,"68425":895,"68432":896,"68444":897,"68464":898,"68468":899,"68498":900,"68500":901,"68502":902,"68522":903,"68524":904,"68533":905,"68547":906,"68549":907,"68572":908,"68573":909,"68575":910,"68615":911,"68655":912,"68669":913,"68673":914,"68679":915,"68682":916,"68684":917,"68686":918,"68689":919,"68705":920,"68720":921,"68745":922,"68755":923,"68770":924,"68773":925,"68780":926,"68820":927,"68855":928,"68861":929,"68867":930,"68872":931,"68895":932,"70001":933,"70110":934,"70124":935,"70204":936,"70215":937,"70221":938,"70230":939,"70233":940,"70235":941,"70265":942,"70400":943,"70418":944,"70429":945,"70473":946,"70508":947,"70523":948,"70670":949,"70678":950,"70702":951,"70708":952,"70713":953,"70717":954,"70742":955,"70771":956,"70820":957,"70823":958,"73001":959,"73024":960,"73026":961,"73030":962,"73043":963,"73055":964,"73067":965,"73124":966,"73148":967,"73152":968,"73168":969,"73200":970,"73217":971,"73226":972,"73236":973,"73268":974,"73270":975,"73275":976,"73283":977,"73319":978,"73347":979,"73349":980,"73352":981,"73408":982,"73411":983,"73443":984,"73449":985,"73461":986,"73483":987,"73504":988,"73520":989,"73547":990,"73555":991,"73563":992,"73585":993,"73616":994,"73622":995,"73624":996,"73671":997,"73675":998,"73678":999,"73686":1000,"73770":1001,"73854":1002,"73861":1003,"73870":1004,"73873":1005,"76001":1006,"76020":1007,"76036":1008,"76041":1009,"76054":1010,"76100":1011,"76109":1012,"76111":1013,"76113":1014,"76122":1015,"76126":1016,"76130":1017,"76147":1018,"76233":1019,"76243":1020,"76246":1021,"76248":1022,"76250":1023,"76275":1024,"76306":1025,"76318":1026,"76364":1027,"76377":1028,"76400":1029,"76403":1030,"76497":1031,"76520":1032,"76563":1033,"76606":1034,"76616":1035,"76622":1036,"76670":1037,"76736":1038,"76823":1039,"76828":1040,"76834":1041,"76845":1042,"76863":1043,"76869":1044,"76890":1045,"76892":1046,"76895":1047,"81001":1048,"81065":1049,"81220":1050,"81300":1051,"81591":1052,"81736":1053,"81794":1054,"85001":1055,"85010":1056,"85015":1057,"85125":1058,"85136":1059,"85139":1060,"85162":1061,"85225":1062,"85230":1063,"85250":1064,"85263":1065,"85279":1066,"85300":1067,"85315":1068,"85325":1069,"85400":1070,"85410":1071,"85430":1072,"85440":1073,"86001":1074,"86219":1075,"86320":1076,"86568":1077,"86569":1078,"86571":1079,"86573":1080,"86749":1081,"86755":1082,"86757":1083,"86760":1084,"86865":1085,"86885":1086,"88001":1087,"88564":1088,"91001":1089,"91263":1090,"91405":1091,"91407":1092,"91430":1093,"91460":1094,"91530":1095,"91536":1096,"91540":1097,"91669":1098,"91798":1099,"94001":1100,"94343":1101,"94663":1102,"94883":1103,"94884":1104,"94885":1105,"94886":1106,"94887":1107,"94888":1108,"95001":1109,"95015":1110,"95025":1111,"95200":1112,"97001":1113,"97161":1114,"97511":1115,"97666":1116,"97777":1117,"97889":1118,"99001":1119,"99524":1120,"99624":1121,"99773":1122,"05001":1,"05002":2,"05004":3,"05021":4,"05030":5,"05031":6,"05034":7,"05036":8,"05038":9,"05040":10,"05042":11,"05044":12,"05045":13,"05051":14,"05055":15,"05059":16,"05079":17,"05086":18,"05088":19,"05091":20,"05093":21,"05101":22,"05107":23,"05113":24,"05120":25,"05125":26,"05129":27,"05134":28,"05138":29,"05142":30,"05145":31,"05147":32,"05148":33,"05150":34,"05154":35,"05172":36,"05190":37,"05197":38,"05206":39,"05209":40,"05212":41,"05234":42,"05237":43,"05240":44,"05250":45,"05264":46,"05266":47,"05282":48,"05284":49,"05306":50,"05308":51,"05310":52,"05313":53,"05315":54,"05318":55,"05321":56,"05347":57,"05353":58,"05360":59,"05361":60,"05364":61,"05368":62,"05376":63,"05380":64,"05390":65,"05400":66,"05411":67,"05425":68,"05440":69,"05467":70,"05475":71,"05480":72,"05483":73,"05490":74,"05495":75,"05501":76,"05541":77,"05543":78,"05576":79,"05579":80,"05585":81,"05591":82,"05604":83,"05607":84,"05615":85,"05628":86,"05631":87,"05642":88,"05647":89,"05649":90,"05652":91,"05656":92,"05658":93,"05659":94,"05660":95,"05664":96,"05665":97,"05667":98,"05670":99,"05674":100,"05679":101,"05686":102,"05690":103,"05697":104,"05736":105,"05756":106,"05761":107,"05789":108,"05790":109,"05792":110,"05809":111,"05819":112,"05837":113,"05842":114,"05847":115,"05854":116,"05856":117,"05858":118,"05861":119,"05873":120,"05885":121,"05887":122,"05890":123,"05893":124,"05895":125,"08001":126,"08078":127,"08137":128,"08141":129,"08296":130,"08372":131,"08421":132,"08433":133,"08436":134,"08520":135,"08549":136,"08558":137,"08560":138,"08573":139,"08606":140,"08634":141,"08638":142,"08675":143,"08685":144,"08758":145,"08770":146,"08832":147,"08849":148};

      function resolveMatiasCityId(cust, defaultCityId) {
        if (!cust) return defaultCityId || 1006;
        const cCode = String(cust.getString("city_code") || "").trim();
        if (cCode && MATIAS_DANE_CITIES[cCode]) {
          return MATIAS_DANE_CITIES[cCode];
        }
        const cName = String(cust.getString("city") || "").trim().toLowerCase();
        if (cName.includes("cali")) return 1006;
        if (cName.includes("bogot")) return 149;
        if (cName.includes("medell")) return 1;
        if (cName.includes("barranqu")) return 126;
        if (cName.includes("bucaramanga")) return 846;
        if (cName.includes("pereira")) return 832;
        if (cName.includes("cartagena")) return 150;
        if (cName.includes("manizales")) return 319;
        if (cName.includes("armenia")) return 820;
        if (cName.includes("cucuta") || cName.includes("cúcuta")) return 780;
        if (cName.includes("ibague") || cName.includes("ibagué")) return 959;
        if (cName.includes("pasto")) return 716;
        if (cName.includes("popayan") || cName.includes("popayán")) return 362;
        if (cName.includes("neiva")) return 605;
        if (cName.includes("villavicencio")) return 687;
        if (cName.includes("santa marta")) return 657;
        if (cName.includes("valledupar")) return 404;
        if (cName.includes("monteria") || cName.includes("montería")) return 429;
        if (cName.includes("sincelejo")) return 933;
        if (cName.includes("tunja")) return 196;
        if (cName.includes("florencia")) return 346;
        if (cName.includes("riohacha")) return 642;
        if (cName.includes("quibdo") || cName.includes("quibdó")) return 575;
        if (cName.includes("yopal")) return 1055;
        return defaultCityId || 1006;
      }

      const companyCityCode = (companyThird ? companyThird.getString("city_code") : "") || "76001";
      const companyDefaultCityId = MATIAS_DANE_CITIES[companyCityCode] || 1006;
      const resolvedCustomerCityId = resolveMatiasCityId(customer, companyDefaultCityId);
      const custPostalCode = (customer && customer.getString("city_code")) ? customer.getString("city_code") : (companyCityCode || "760001");

      const matiasPayload = {
        resolution_number: String(resNum || "18760000001"),
        prefix: prefix || "",
        document_number: cleanDocNum,
        operation_type_id: matiasOperationTypeId,
        type_document_id: matiasTypeDocId,
        date: issueDate,
        time: issueTime ? issueTime.slice(0, 8) : "12:00:00",
        notes: tx.getString("description") || "Generado por GRAVY ERP",
        send_email: (isDS || isNDS) ? ((custEmail && custEmail.includes('@') && !custEmail.includes('cliente.com') && !custEmail.includes('noobligado.com') && !custEmail.includes('dian.com')) ? 1 : 0) : 0,
        customer: {
          identification_number: String(custDocNum || "222222222222").replace(/[^0-9A-Za-z]/g, ""),
          dni: String(custDocNum || "222222222222").replace(/[^0-9A-Za-z]/g, ""),
          name: custName || (isDS ? "Proveedor No Obligado" : "Consumidor Final"),
          company_name: custName || (isDS ? "Proveedor No Obligado" : "Consumidor Final"),
          email: custEmail || (companyThird ? companyThird.getString("email") : "") || "proveedor@noobligado.com",
          phone: validPhone,
          mobile: validPhone,
          address: custAddress || (companyThird ? companyThird.getString("address") : "") || "CALLE 79 8N 58",
          postal_code: custPostalCode,
          merchant_registration: "0000000-00",
          identity_document_id: matiasIdDocType,
          type_document_identification_id: matiasIdDocType,
          type_organization_id: (isDS || isNDS) ? (custDIANDocType === "31" ? 1 : 2) : (custDIANDocType === "31" ? 1 : 2),
          tax_regime_id: (isDS || isNDS) ? 2 : ((customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 1 : 2),
          tax_level_id: (isDS || isNDS) ? 5 : ((customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 4 : 5),
          type_liability_id: (isDS || isNDS) ? 117 : ((customer && (customer.getString("tax_regime") === 'common' || customer.getString("tax_regime") === 'responsable')) ? 116 : 117),
          municipality_id: resolvedCustomerCityId,
          country_id: 45,
          city_id: resolvedCustomerCityId,
          dv: custDIANDocType === "31" ? (customer ? (customer.getString("dv") || calcularDV(custDocNum)) : calcularDV(custDocNum)) : null
        },
        payments: [{
          payment_method_id: (paymentForm === 'credito' || paymentForm === '2') ? 2 : 1,
          means_payment_id: parseInt(paymentDianCode || 10, 10),
          value_paid: parseFloat(total).toFixed(2),
          payment_due_date: dueDate || issueDate,
          duration_measure: String(creditDays || "0")
        }],
        payment_form: {
          payment_form_id: (paymentForm === 'credito' || paymentForm === '2') ? 2 : 1,
          payment_method_id: parseInt(paymentDianCode || 10, 10),
          payment_due_date: dueDate || issueDate,
          duration_measure: String(creditDays || "0")
        },
        legal_monetary_totals: {
          line_extension_amount: parseFloat(subtotal).toFixed(2),
          tax_exclusive_amount: parseFloat(subtotal).toFixed(2),
          tax_inclusive_amount: parseFloat(total).toFixed(2),
          payable_amount: parseFloat(total).toFixed(2)
        },
        lines: matiasLines
      };

      const taxesByRate = {};
      items.forEach(it => {
        const uPrice = parseFloat(it.price != null ? it.price : (it.unitPrice || 0));
        const itemQty = parseFloat(it.qty || 1);
        const itemLineTotal = parseFloat((itemQty * uPrice).toFixed(2));
        const itemIvaRate = parseFloat(it.ivaRate || 0);
        const rateKey = itemIvaRate.toFixed(2);
        if (!taxesByRate[rateKey]) {
          taxesByRate[rateKey] = {
            tax_id: 1,
            percent: rateKey,
            taxable_amount: 0,
            tax_amount: 0
          };
        }
        const itemIvaAmt = parseFloat((itemLineTotal * itemIvaRate / 100).toFixed(2));
        taxesByRate[rateKey].taxable_amount += itemLineTotal;
        taxesByRate[rateKey].tax_amount += itemIvaAmt;
      });

      if (isDS || isNDS) {
        matiasPayload.tax_totals = [{
          tax_id: 1,
          percent: "0.00",
          taxable_amount: parseFloat(subtotal || 0).toFixed(2),
          tax_amount: "0.00"
        }];
      } else {
        matiasPayload.tax_totals = Object.values(taxesByRate).map(t => ({
          tax_id: t.tax_id,
          percent: t.percent,
          taxable_amount: t.taxable_amount.toFixed(2),
          tax_amount: t.tax_amount.toFixed(2)
        }));
        if (!matiasPayload.tax_totals || matiasPayload.tax_totals.length === 0) {
          matiasPayload.tax_totals = [{
            tax_id: 1,
            percent: "0.00",
            taxable_amount: parseFloat(subtotal || 0).toFixed(2),
            tax_amount: "0.00"
          }];
        }
      }

      // Referencia a documento previo en Notas Crédito, Débito o Notas de Ajuste
      if (isNC || isND || isNDS) {
        let refNum = "";
        let refUuid = "";
        let refDate = issueDate;

        const bodyData = e.requestInfo()?.body || {};
        if (bodyData.billing_reference) {
          refNum = bodyData.billing_reference.number || "";
          refUuid = bodyData.billing_reference.uuid || bodyData.billing_reference.cufe || bodyData.billing_reference.cude || "";
          refDate = bodyData.billing_reference.date || bodyData.billing_reference.issue_date || issueDate;
        }

        const crossDocRef = (invoice ? (invoice.getString("cross_doc_ref") || invoice.getString("parent_invoice_id")) : "") || (tx ? (tx.getString("cross_number") || tx.getString("cross_doc_ref")) : "") || "";

        // 1. Si el invoice tiene parent_invoice_id
        if (!refUuid && invoice && invoice.getString("parent_invoice_id")) {
          try {
            const parentColName = isNDS ? "purchase_invoices" : "invoices";
            const pInv = $app.findRecordById(parentColName, invoice.getString("parent_invoice_id"));
            if (pInv) {
              if (!refNum) refNum = pInv.getString("number") || pInv.getString("tx_number") || "";
              if (pInv.getString("date")) refDate = pInv.getString("date").slice(0, 10);
              if (isNDS && pInv.getString("cuds")) refUuid = pInv.getString("cuds");
              const pDoc = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + pInv.getString("tx_id") + "'");
              if (pDoc && !refUuid) {
                refUuid = pDoc.getString("cufe") || pDoc.getString("uuid") || "";
              }
            }
          } catch (_) {}
        }

        // 2. Si hay crossDocRef
        if (!refUuid && crossDocRef) {
          refNum = refNum || crossDocRef;
          try {
            const parentDoc = $app.findFirstRecordByFilter("einvoice_docs", "doc_number = '" + crossDocRef.replace(/'/g, "''") + "' || prefix || '-' || folio = '" + crossDocRef.replace(/'/g, "''") + "' || folio = '" + crossDocRef.replace(/'/g, "''") + "'");
            if (parentDoc) {
              refUuid = parentDoc.getString("cufe") || parentDoc.getString("uuid") || "";
              refDate = parentDoc.getString("issue_date") || refDate;
              refNum = parentDoc.getString("doc_number") || refNum;
            }
          } catch (_) {}

          if (!refUuid) {
            try {
              const parentColName = isNDS ? "purchase_invoices" : "invoices";
              const pInv = $app.findFirstRecordByFilter(parentColName, "number = '" + crossDocRef.replace(/'/g, "''") + "' || tx_number = '" + crossDocRef.replace(/'/g, "''") + "'");
              if (pInv) {
                if (!refNum) refNum = pInv.getString("number") || pInv.getString("tx_number") || "";
                if (pInv.getString("date")) refDate = pInv.getString("date").slice(0, 10);
                if (isNDS && pInv.getString("cuds")) refUuid = pInv.getString("cuds");
                const pDoc = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + pInv.getString("tx_id") + "'");
                if (pDoc && !refUuid) {
                  refUuid = pDoc.getString("cufe") || pDoc.getString("uuid") || "";
                }
              }
            } catch (_) {}
          }
        }

        // 3. Buscar CUFE directamente en las notas si fue guardado allí
        if (!refUuid && invoice && invoice.getString("notes")) {
          const cufeMatch = invoice.getString("notes").match(/CUFE:\s*([0-9a-fA-F]{64,128})/i);
          if (cufeMatch) {
            refUuid = cufeMatch[1];
          }
        }

        // Limpiar refNum para MATIAS API (ej: FE-00000006 -> FE6 si el prefix es FE)
        let cleanRefNum = refNum || "REF-001";
        if (cleanRefNum.includes('-')) {
          const parts = cleanRefNum.split('-');
          if (parts.length === 2 && /^\d+$/.test(parts[1])) {
            cleanRefNum = parts[0] + parseInt(parts[1], 10);
          }
        }

        matiasPayload.billing_reference = {
          number: cleanRefNum,
          date: refDate || issueDate,
          uuid: refUuid || "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          scheme_name: isNDS ? "CUDS-SHA384" : "CUFE-SHA384"
        };

        const discrepancyCode = bodyData.discrepancy_code || (invoice ? invoice.getString("dian_concept") : "") || (isNC ? "2" : (isND ? "1" : "11"));
        let discrepancyDesc = bodyData.discrepancy_description || "";
        if (!discrepancyDesc) {
          if (discrepancyCode === "1") discrepancyDesc = "Devolución parcial de los bienes y/o no aceptación parcial del servicio";
          else if (discrepancyCode === "2") discrepancyDesc = "Anulación de factura electrónica";
          else if (discrepancyCode === "3") discrepancyDesc = "Rebaja o descuento parcial o total";
          else if (discrepancyCode === "4") discrepancyDesc = "Ajuste de precio";
          else if (discrepancyCode === "6") discrepancyDesc = "Devolución total de bienes";
          else discrepancyDesc = isNC ? "Anulación de factura electrónica" : (isND ? "Ajuste de precio" : "Anulación de documento soporte");
        }

        matiasPayload.discrepancy_response = {
          reference_id: cleanRefNum,
          response_id: String(discrepancyCode),
          description: discrepancyDesc
        };
      }

      // Extraer datos de Operación DIAN Especial si están presentes en notas
      let specialOp = { type: 'standard' };
      const rawNotesForSpecial = (invoice ? invoice.getString("notes") : "") || (tx ? tx.getString("description") : "");
      const specialOpMatch = rawNotesForSpecial.match(/\[DIAN_SPECIAL_OP:(.*?)\]/);
      if (specialOpMatch && specialOpMatch[1]) {
        try {
          specialOp = JSON.parse(specialOpMatch[1]);
        } catch (_) {}
      }

      if (specialOp.type === 'export') {
        matiasTypeDocId = 8; // Factura de Exportación
        matiasOperationTypeId = 2; // Exportación en DIAN
      } else if (specialOp.type === 'contingency') {
        matiasTypeDocId = 9; // Factura de Contingencia
      } else if (specialOp.type === 'mandate') {
        matiasOperationTypeId = 3; // Factura por Mandato
      }

      // Si es POS, MATIAS API requiere point_of_sale
      if (isPOS) {
        matiasPayload.point_of_sale = {
          number: cajaName || "CAJA-01",
          type: "POS"
        };
      }

      // Aplicar particularidades de Operación DIAN Especial
      if (specialOp.type === 'health') {
        matiasPayload.health = {
          operation_type: specialOp.operationType || "SS-CUFE",
          invoice_period: {
            start_date: specialOp.startDate || issueDate,
            start_time: "00:00:00",
            end_date: specialOp.endDate || dueDate || issueDate,
            end_time: "23:59:59"
          },
          users: [{
            provider_code: specialOp.providerCode || getSetting("company_health_provider_code", "110010000101"),
            identification_type_id: parseInt(specialOp.patientDocTypeId || 3, 10),
            identification_number: String(specialOp.patientDocNum || custDocNum || "12345678"),
            first_name: specialOp.patientFirstName || "Usuario",
            first_surname: specialOp.patientLastName || "Salud",
            payment_method_id: parseInt(specialOp.paymentModalityId || 1, 10),
            coverage_id: parseInt(specialOp.coverageId || 1, 10),
            authorization_number: specialOp.authNumber || "",
            prescription_number: specialOp.mipresNumber || "",
            copayment_amount: parseFloat(specialOp.copayment || 0).toFixed(2)
          }]
        };
      } else if (specialOp.type === 'export') {
        const trmVal = parseFloat(specialOp.trm || 1).toFixed(2);
        matiasPayload.payment_exchange_rate = {
          exchange_rate: trmVal,
          base_rate: trmVal,
          currency_id: parseInt(specialOp.currencyId || 169, 10)
        };
        if (specialOp.incoterm) {
          matiasPayload.notes = `[Incoterm: ${specialOp.incoterm}] ` + matiasPayload.notes;
        }
        if (specialOp.countryId) {
          matiasPayload.customer.country_id = parseInt(specialOp.countryId, 10);
          matiasPayload.customer.identity_document_id = 10; // Tax ID Extranjero
          matiasPayload.customer.type_document_identification_id = 10;
        }
      } else if (specialOp.type === 'mandate') {
        matiasLines.forEach(l => {
          l.mandate = {
            identification_number: String(specialOp.mandanteNit || "900000000"),
            name: specialOp.mandanteName || "Mandante Comercial",
            type_document_identification_id: 6
          };
        });
      } else if (specialOp.type === 'contingency' && specialOp.paperNumber) {
        matiasPayload.notes = `[Contingencia Talonario: ${specialOp.paperNumber}] ` + matiasPayload.notes;
      }

      // Limpiar tags de metadatos internos de las notas visibles
      matiasPayload.notes = matiasPayload.notes.replace(/\[DIAN_SPECIAL_OP:.*?\]\s*/g, '').trim() || "Generado por GRAVY ERP";

      // Enviar a MATIAS API
      const matiasCaller = getMatiasCaller();

      const matiasRes = matiasCaller(matiasEndpoint, "POST", matiasPayload);
      let matiasData = matiasRes.data || {};
      const isAlreadyValidated = !!((matiasData.message && matiasData.message.includes("ya se encuentra validado")) || (matiasData.data && (matiasData.data.is_valid === 1 || matiasData.data.status === 1) && matiasData.data.XmlDocumentKey));

      if (!matiasRes.ok && !isAlreadyValidated) {
        const errMsg = matiasRes.data?.message || matiasRes.data?.error || `Error en MATIAS API (${matiasRes.statusCode})`;
        const fullErr = errMsg + (matiasRes.data?.response?.ErrorMessage?.string ? ": " + JSON.stringify(matiasRes.data.response.ErrorMessage.string) : "");
        docRecord.set("status", "rechazada");
        docRecord.set("dian_response", fullErr);
        $app.save(docRecord);

        // Sincronizar purchase_invoices si es compra o documento soporte
        if (isPurchase || isDS || isNDS) {
          try {
            const purToUpdate = purchaseInv || (invoice && isPurchase ? invoice : null) || $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + realTxId + "'");
            if (purToUpdate) {
              purToUpdate.set("status_dian", "rechazada");
              purToUpdate.set("dian_response", fullErr);
              $app.save(purToUpdate);
            }
          } catch (ePur) {
            console.warn("[GRAVY HOOK] No se pudo actualizar purchase_invoice en rechazo:", ePur);
          }
        }

        e.json(matiasRes.statusCode || 400, {
          success: false,
          error: errMsg,
          details: matiasRes.data
        });
        return;
      }

      if (isAlreadyValidated && matiasData.data) {
        matiasData = Object.assign({}, matiasData, matiasData.data);
      }

      const xmlDocKey = matiasData.XmlDocumentKey || matiasData.cufe || matiasData.cude || "";
      const statusCode = String(matiasData.response?.StatusCode || matiasData.response?.ResponseCode || matiasData.status_code || "");
      const rawStatusMsg = String(matiasData.response?.StatusMessage || matiasData.message || "");
      const isDianValid = isAlreadyValidated || 
        matiasData.response?.IsValid === "true" || 
        matiasData.response?.IsValid === true || 
        statusCode === "00" || 
        statusCode === "02" ||
        rawStatusMsg.toLowerCase().includes("validado por la dian") ||
        (!!xmlDocKey && statusCode !== "04" && statusCode !== "99");

      const statusMsg = (isDianValid && (!rawStatusMsg || rawStatusMsg.includes("errores en campos mandatorios") || rawStatusMsg.toLowerCase().includes("validado por la dian")))
        ? "Documento validado por la DIAN"
        : (matiasData.response?.StatusMessage || matiasData.message || "Procesado Correctamente por la DIAN.");

      docRecord.set("status", isDianValid ? "aceptada" : "rechazada");
      docRecord.set("cufe", xmlDocKey);
      docRecord.set("dian_response", statusMsg);

      const decodeBase64Xml = (raw) => {
        if (!raw) return "";
        let input = String(raw).trim();
        if (input.includes("<")) return input;
        try {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
          let i = 0, utf8Str = "";
          while (i < input.length) {
            let enc1 = chars.indexOf(input.charAt(i++));
            let enc2 = chars.indexOf(input.charAt(i++));
            let enc3 = chars.indexOf(input.charAt(i++));
            let enc4 = chars.indexOf(input.charAt(i++));
            let chr1 = (enc1 << 2) | (enc2 >> 4);
            let chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            let chr3 = ((enc3 & 3) << 6) | enc4;
            utf8Str += String.fromCharCode(chr1);
            if (enc3 !== 64) utf8Str += String.fromCharCode(chr2);
            if (enc4 !== 64) utf8Str += String.fromCharCode(chr3);
          }
          return utf8Str;
        } catch (_) {
          return input;
        }
      };

      let savedXml = "";
      if (isDianValid && xmlDocKey) {
        // 1. Intentar obtener el AttachedDocument oficial de MATIAS API
        try {
          const attachedRes = matiasCaller(`/documents/attached/${encodeURIComponent(xmlDocKey)}`, "POST");
          if (attachedRes && attachedRes.ok && attachedRes.data) {
            const attB64 = attachedRes.data.content?.XmlBytesBase64 || attachedRes.data.XmlBytesBase64 || attachedRes.data.xml;
            if (attB64) {
              savedXml = decodeBase64Xml(attB64);
            } else if (attachedRes.data.attachedDocument && attachedRes.data.attachedDocument.url) {
              const fetchAd = $http.send({ url: attachedRes.data.attachedDocument.url, method: "GET", timeout: 30 });
              if (fetchAd && fetchAd.statusCode === 200 && fetchAd.raw) {
                savedXml = fetchAd.raw;
              }
            }
          }
        } catch (eAtt) {
          console.warn("[GRAVY HOOK] No se pudo obtener AttachedDocument de MATIAS:", eAtt);
        }

        // 2. Si no hay AttachedDocument (ej. consumidor final o cliente no obligado), obtener el XML firmado completo del Invoice
        if (!savedXml || !savedXml.includes("<")) {
          try {
            const xmlRes = matiasCaller(`/documents/xml/${encodeURIComponent(xmlDocKey)}`, "GET");
            if (xmlRes && xmlRes.ok && xmlRes.data) {
              const invB64 = xmlRes.data.content?.XmlBytesBase64 || xmlRes.data.XmlBytesBase64;
              if (invB64) {
                savedXml = decodeBase64Xml(invB64);
              }
            }
          } catch (eXml) {
            console.warn("[GRAVY HOOK] No se pudo obtener XML completo de MATIAS:", eXml);
          }
        }
      }

      // 3. Fallback a XmlBase64Bytes si los anteriores no respondieron
      if (!savedXml && matiasData.response?.XmlBase64Bytes) {
        savedXml = decodeBase64Xml(matiasData.response.XmlBase64Bytes);
      }

      if (savedXml) {
        docRecord.set("xml_content", savedXml);
      }
      docRecord.set("sent_at", new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19));
      $app.save(docRecord);

      // Sincronizar de inmediato con purchase_invoices si es compra o documento soporte
      if (isPurchase || isDS || isNDS) {
        try {
          const purToUpdate = purchaseInv || (invoice && isPurchase ? invoice : null) || $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + realTxId + "'");
          if (purToUpdate) {
            purToUpdate.set("status_dian", isDianValid ? "aceptada" : "rechazada");
            if (xmlDocKey) {
              purToUpdate.set("cuds", xmlDocKey);
            }
            purToUpdate.set("dian_response", statusMsg);
            if (savedXml) {
              purToUpdate.set("xml_content", savedXml);
            }
            try {
              $app.save(purToUpdate);
            } catch (errSaveXml) {
              console.warn("[GRAVY HOOK] Reintentando guardar purchase_invoice sin xml_content:", errSaveXml);
              purToUpdate.set("xml_content", "");
              $app.save(purToUpdate);
            }
          }
        } catch (ePur) {
          console.warn("[GRAVY HOOK] No se pudo actualizar purchase_invoice con CUDE y estado:", ePur);
        }
      }

      // Envío automático de correo por SMTP de GRAVY (solo para facturación de venta, no para documento soporte que lo envía MATIAS API)
      if (docRecord.getString("status") === "aceptada" && !isDS && !isNDS) {
        try {
          sendInvoiceEmailHelper(txId);
        } catch (emailErr) {
          console.error("[GRAVY HOOK] Error al enviar correo automático MATIAS:", emailErr);
        }
      }
      // Actualizar consecutivo en dian_resolutions
      if (isDianValid && resolution && cleanDocNum) {
        try {
          const numInt = parseInt(cleanDocNum, 10);
          if (!isNaN(numInt) && numInt >= (resolution.getInt("current_number") || 0)) {
            resolution.set("current_number", numInt);
            $app.save(resolution);
          }
        } catch (_) {}
      }

      e.json(200, {
        success: true,
        status: docRecord.get("status"),
        cufe: docRecord.get("cufe"),
        dianResponse: docRecord.get("dian_response"),
        matiasData: matiasData
      });
      return;
    }
    
    // Call Hub (Direct DIAN)
    const hubUrl = "http://127.0.0.1:8088/api/dian/sign-and-send";
    console.log("[GRAVY HOOK] Enviando a firmar en Hub: " + hubUrl);
    
    // Generate DIAN zip filename (znnnnnnnnnnpppaadddddddd)
    let dianZipBasename = "";
    try {
      const cleanNit = String(emitterNit || '').replace(/[^0-9]/g, '');
      const nitPad = cleanNit.padStart(10, '0');
      const providerCode = getSetting("dian_provider_code", "000");
      const ppp = String(providerCode || '').replace(/[^0-9]/g, '').padStart(3, '0');
      const aa = String(new Date().getFullYear()).slice(-2);
      
      const newConsecutive = getAndIncrementDianShipmentConsecutive();
      const dddddddd = String(newConsecutive).padStart(8, '0');
      
      dianZipBasename = 'z' + nitPad + ppp + aa + dddddddd;
      console.log("[GRAVY DIAN] Consecutivo de envio: " + newConsecutive + " -> Basename: " + dianZipBasename);
    } catch (eName) {
      console.error("[GRAVY DIAN] Error al generar nombre de zip:", eName);
      const nitPad = String(emitterNit || '').replace(/[^0-9]/g, '').padStart(10, '0');
      dianZipBasename = "z" + nitPad + "000" + String(new Date().getFullYear()).slice(-2) + "00000001";
    }
    
    const requestBody = {
      xmlContent: xml,
      certBase64,
      certPassword,
      dianEnvironment,
      documentType: (isDS ? 'SupportDocument' : (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice'))),
      documentNumber: docNumber,
      dianNit: emitterNit,
      dianZipBasename: dianZipBasename,
      issueDate,
      issueTime,
      valFac: subtotal,
      ivaTotal,
      incTotal: 0,
      icaTotal: 0,
      valTot: total,
      adquirerNit: custDocNum,
      clTec,
      softwarePin
    };
    
    const res = $http.send({
      url: hubUrl,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    
    if (res.statusCode !== 200) {
      throw new Error("El Hub retornó código de error: " + res.statusCode + " - " + res.raw);
    }
    
    const responseData = JSON.parse(res.raw);
    
    // Update status in db
    docRecord.set("status", responseData.isValid ? "aceptada" : "rechazada");
    docRecord.set("cufe", responseData.xmlDocumentKey || "");
    docRecord.set("dian_response", responseData.statusMessage || responseData.error || "Procesado.");
    docRecord.set("xml_content", responseData.xmlContent || xml);
    docRecord.set("sent_at", new Date(Date.now() - 5 * 3600 * 1000).toISOString().replace("T", " ").slice(0, 19));
    docRecord.set("zip_filename", dianZipBasename);
    $app.save(docRecord);

    // Auto-send email if accepted
    if (docRecord.getString("status") === "aceptada") {
      try {
        sendInvoiceEmailHelper(txId);
      } catch (emailErr) {
        console.error("[GRAVY HOOK] Error al enviar correo automático:", emailErr);
      }
    }
    
    e.json(200, {
      success: true,
      status: docRecord.get("status"),
      cufe: docRecord.get("cufe"),
      dianResponse: docRecord.get("dian_response"),
      simulated: !!responseData.simulated
    });
    
  } catch (err) {
    console.error("[GRAVY HOOK] Error al emitir a la DIAN:", err);
    const rawError = String(err.message || err);
    if (docRecord) {
      try {
        docRecord.set("status", "rechazada");
        docRecord.set("dian_response", rawError);
        $app.save(docRecord);
      } catch (saveErr) {
        console.error("[GRAVY HOOK] Error al guardar error en docRecord:", saveErr);
      }
    }
    e.json(400, {
      success: false,
      message: rawError,
      providerError: rawError,
      dianResponse: rawError,
      error: rawError
    });
    return;
  }
});

routerAdd('POST', '/api/dian/check-status', (e) => {

  const getSetting = (typeof globalThis.getSetting === 'function')
    ? globalThis.getSetting
    : function(key, defaultValue) {
        try {
          const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
          return (r ? r.get("value") : null) || defaultValue;
        } catch (_) {
          return defaultValue;
        }
      };

function sendInvoiceEmailHelper(txId, customEmail) {


  const syncSmtpSettings = function() {
    const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = getSetting("smtp_host", "");
        const port = parseInt(getSetting("smtp_port", "587"), 10);
        const user = getSetting("smtp_username", "");
        const pass = getSetting("smtp_password", "");
        const senderName = getSetting("smtp_sender_name", "");
        const senderAddr = getSetting("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || getSetting("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
    } catch (err) {
      console.error("[GRAVY DIAN SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
    }
  };

  try {
    const docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
    if (!docRecord) {
      throw new Error("Documento de facturación no encontrado para esta transacción.");
    }
    
    const xmlContent = docRecord.getString("xml_content");
    if (!xmlContent) {
      throw new Error("El documento no posee contenido XML firmado para reenviar.");
    }
    
    const tx = $app.findRecordById("transactions", txId);
    $app.expandRecord(tx, ["third_party_id"], null);
    const customer = tx.expandedOne("third_party_id");
    let custEmail = customEmail;
    if (!custEmail) {
      custEmail = customer ? customer.getString("email") : "";
    }
    if (!custEmail) {
      throw new Error("Debe configurar un correo en la ficha del tercero.");
    }
    
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyEmail = getSetting("company_email", "noreply@gravy.com");
    const docNumber = tx.getString("number") || "Factura";

    let totalVal = 0;
    try {
      const invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      totalVal = invRec.getFloat("total") || 0;
    } catch (_) {
      try {
        const purRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
        totalVal = purRec.getFloat("total") || 0;
      } catch (_2) {}
    }
    const fmtTotal = "$ " + Math.round(totalVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const companyNitRaw = getSetting("company_nit", "900123456");
    const companyNit = companyNitRaw.split('-')[0].replace(/[^0-9]/g, '');
    
    $app.expandRecord(tx, ["tx_type_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const txTypeCode = txType ? txType.getString("code") : "";
    let docTypeCode = "01";
    if (txTypeCode === "ND") docTypeCode = "02";
    else if (txTypeCode === "NC") docTypeCode = "03";
    
    const commercialName = getSetting("company_name", "GRAVY S.A.S");
    const emailSubject = `${companyNit};${companyName};${docNumber};${docTypeCode};${commercialName};`;

    const einvoiceMethod = getSetting("einvoice_method", "dian");
    let integrationComment = "";
    if (einvoiceMethod === "facturatech") {
      integrationComment = "La integracion de datos es realizada por proveedor tecnologico CADENA S.A. / NIT. 890.930.534-0";
    } else {
      integrationComment = "La integracion de datos es realizada directamente por la UAE DIAN bajo la modalidad de software propio a nombre del emisor de este documento electronico";
    }

    let invoiceData = null;
    try {
      let invRec = null;
      let isPurchase = false;
      try {
        invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        try {
          invRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
          isPurchase = true;
        } catch (_2) {}
      }

      if (invRec) {
        let linesList = [];
        if (!isPurchase) {
          linesList = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invRec.id + "'");
        } else {
          linesList = $app.findRecordsByFilter("purchase_invoice_lines", "invoice_id = '" + invRec.id + "'");
        }
        
        $app.expandRecords(linesList, ["product_id"], null);
        const linesData = [];
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const prod = l.expandedOne("product_id");
          linesData.push({
            desc: prod ? prod.getString("name") : "Producto",
            code: prod ? prod.getString("code") : "—",
            qty: l.getFloat("qty") || 0,
            unitPrice: l.getFloat("unit_price") || 0,
            lineTotal: l.getFloat("total") || 0,
            ivaRate: l.getFloat("iva_rate") || 0,
            unitCode: prod ? (prod.getString("unit") || "94") : "94",
          });
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = sanitizeName(customer ? customer.getString("name") : "Consumidor Final");
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        let cajeroName = "Admin";
        const posShiftId = invRec.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = invRec.getString("pos_shift_id") ? "POS" : "FV";
        
        try {
          const registerId = invRec.getString("pos_shift_id") ? ($app.findRecordById("pos_shifts", invRec.getString("pos_shift_id")).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: invRec.getString("payment_method") || "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      } else {
        const linesList = $app.findRecordsByFilter("tx_lines", "tx_id = '" + txId + "'", "line_order");
        const linesData = [];
        let totalFromLines = 0;
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const d = l.getFloat("debit");
          const c = l.getFloat("credit");
          const amount = d > 0 ? d : c;
          if (amount > 0) {
            linesData.push({
              desc: l.getString("description") || "Concepto Contable",
              code: "—",
              qty: 1,
              unitPrice: amount,
              lineTotal: amount,
              ivaRate: 0
            });
            totalFromLines += amount;
          }
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = customer ? customer.getString("name") : "Consumidor Final";
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        let cajeroName = "Admin";
        const posShiftId = tx.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = posShiftId ? "POS" : "FV";
        
        try {
          const registerId = posShiftId ? ($app.findRecordById("pos_shifts", posShiftId).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal || totalFromLines,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      }
    } catch (errData) {
      console.warn("[GRAVY HOOK] Error al preparar structured invoiceData:", errData);
    }

    try {
      syncSmtpSettings();
    } catch (e) {
      console.warn("[GRAVY] Error syncing SMTP settings:", e);
    }

    let zipPath = "";
    const zipBasenameForEmail = docRecord.getString("zip_filename") || docNumber;
    try {
      const zipRes = $http.send({
        url: "http://127.0.0.1:8088/api/dian/generate-zip-file",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlContent: xmlContent, filename: zipBasenameForEmail, invoiceData: invoiceData })
      });
      if (zipRes.statusCode === 200) {
        const zipData = JSON.parse(zipRes.raw);
        if (zipData.success) {
          zipPath = zipData.zipPath;
        }
      }
    } catch (err) {
      console.error("[GRAVY HOOK] Error al generar ZIP en el orquestador:", err);
    }
    
    const message = new MailerMessage({
      from: {
        address: companyEmail,
        name: companyName
      },
      to: [{ address: custEmail }],
      subject: emailSubject,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="cid:gravy-logo.png" alt="GRAVY Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: #E0F2FE; color: #0369A1; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                Documento Oficial DIAN
              </span>
            </div>
            
            <h2 style="color: #0F172A; font-size: 22px; font-weight: 800; text-align: center; margin-top: 12px; margin-bottom: 8px;">
              ¡Tu Factura Electrónica está lista!
            </h2>
            <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
              Emitida por <strong>${companyName}</strong>
            </p>
            
            <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
              <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
                Estimado cliente <strong>${customer ? customer.getString("name") : "Consumidor Final"}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
                Adjunto en este correo encontrará el archivo comprimido <strong>ZIP</strong> que contiene el XML firmado y la representación gráfica en formato PDF correspondientes a la <strong>Factura Electrónica de Venta No. ${docNumber}</strong>.
              </p>
            </div>
            
            <h3 style="color: #0F172A; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
              Detalles del Documento
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Número de Documento:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Fecha de Emisión:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${tx.getString("date")}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Monto Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284C7; border-bottom: 1px solid #F1F5F9;">${fmtTotal}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; vertical-align: top;">CUFE / CUDE:</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                  ${docRecord.getString("cufe") || 'N/A'}
                </td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 13px; color: #94A3B8; margin: 0;">
                Gracias por su preferencia y confianza.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
            <p style="font-size: 11px; color: #94A3B8; line-height: 1.5; margin: 0;">
              ${integrationComment}
            </p>
            <p style="font-size: 10px; color: #CBD5E1; margin-top: 12px; margin-bottom: 0;">
              Este es un mensaje automático generado por GRAVY. Por favor no responda a este correo.
            </p>
          </div>
        </div>
      `,
    });
    
    const attachments = {};
    if (zipPath) {
      try {
        const zipFile = $filesystem.fileFromPath(zipPath);
        attachments[`${zipBasenameForEmail}.zip`] = zipFile.reader.open();
      } catch (zipErr) {
        console.error("[GRAVY HOOK] No se pudo abrir el archivo ZIP generado:", zipErr);
        const xmlFile = $filesystem.fileFromBytes(xmlContent, `${zipBasenameForEmail}.xml`);
        attachments[`${zipBasenameForEmail}.xml`] = xmlFile.reader.open();
      }
    } else {
      const xmlFile = $filesystem.fileFromBytes(xmlContent, `${zipBasenameForEmail}.xml`);
      attachments[`${zipBasenameForEmail}.xml`] = xmlFile.reader.open();
    }

    try {
      const logoFile = $filesystem.fileFromPath("pb_public/assets/gravy-logo.png");
      attachments["gravy-logo.png"] = logoFile.reader.open();
    } catch (logoErr) {
      console.warn("[GRAVY HOOK] No se pudo adjuntar el logo de GRAVY:", logoErr);
    }
    
    message.attachments = attachments;
    
    $app.newMailClient().send(message);
    console.log("[GRAVY HOOK] Correo enviado automáticamente a:", custEmail);
    return true;
  } catch (err) {
    console.error("[GRAVY HOOK] Falló al enviar correo en helper:", err);
    throw err;
  }
}


  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }
  
  const body = e.requestInfo()?.body || {};
  const txId = body.txId || body.tx_id;
  if (!txId) {
    e.json(400, { message: "txId es requerido." });
    return;
  }
  
  try {
    let docRecord = null;
    try {
      docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
    } catch (_) {}

    const tx = $app.findRecordById("transactions", txId);
    if (!tx) {
      e.json(404, { message: "Transacción no encontrada." });
      return;
    }
    $app.expandRecord(tx, ["tx_type_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const prefix = txType ? txType.getString("prefix") : "";
    const docNumber = tx.getString("number") || "";
    let folio = docNumber;
    if (prefix && folio.startsWith(prefix)) {
      folio = folio.substring(prefix.length);
    }
    folio = folio.replace(/[^0-9]/g, '').replace(/^0+/, '');
    if (!folio) folio = "0";

    const txTypeCode = txType ? String(txType.getString("code") || '').toUpperCase() : "";
    const txPrefix = txType ? String(txType.getString("prefix") || '').toUpperCase() : "";
    const isDS = (txTypeCode === "DS" || txPrefix === "DS" || txPrefix === "DSE" || docNumber.startsWith("DS"));
    const isNDS = (txTypeCode === "NDS" || txPrefix === "NDS");
    const isPOS = (txTypeCode === "POS");
    const isNC = (txTypeCode === "NC");
    const isND = (txTypeCode === "ND");

    if (!docRecord) {
      const col = $app.findCollectionByNameOrId("einvoice_docs");
      docRecord = new Record(col);
      docRecord.set("tx_id", txId);
      docRecord.set("status", "pendiente");
      $app.save(docRecord);
    }
    
    if (docRecord.getString("status") === "aceptada") {
      const currentCufe = docRecord.getString("cufe") || "";
      if (currentCufe && currentCufe.length > 20 && currentCufe !== "404" && !body.force) {
        e.json(200, {
          success: true,
          status: "aceptada",
          cufe: currentCufe,
          dianResponse: "Este documento ya fue aceptado por la DIAN."
        });
        return;
      }
    }

    const einvoiceMethod = getSetting("einvoice_method", "dian");
    if (einvoiceMethod === "matias") {
      let currentStatus = docRecord.getString("status") || "pendiente";
      let cufeKey = docRecord.getString("cufe") || "";
      let respMsg = docRecord.getString("dian_response") || "Procesado por MATIAS API";

      if (cufeKey && (!docRecord.getString("xml_content") || !docRecord.getString("xml_content").includes("<"))) {
        try {
          const matiasCaller = getMatiasCaller();
          const xmlRes = matiasCaller("/documents/xml/" + encodeURIComponent(cufeKey), "GET");
          if (xmlRes && xmlRes.ok && xmlRes.data) {
            const rawB64 = xmlRes.data.content?.XmlBytesBase64 || xmlRes.data.XmlBytesBase64;
            if (rawB64) {
              const decodedXml = decodeBase64Xml(rawB64);
              if (decodedXml && decodedXml.includes("<")) {
                docRecord.set("xml_content", decodedXml);
                $app.save(docRecord);
              }
            }
          }
        } catch (_) {}
      }

      if (isDS || isNDS) {
        try {
          const purRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
          if (purRec) {
            purRec.set("status_dian", currentStatus);
            if (cufeKey) purRec.set("cuds", cufeKey);
            if (docRecord.getString("xml_content")) purRec.set("xml_content", docRecord.getString("xml_content"));
            purRec.set("dian_response", respMsg);
            $app.save(purRec);
          }
        } catch (_) {}
      }

      e.json(200, {
        success: true,
        status: currentStatus,
        cufe: cufeKey,
        dianResponse: respMsg
      });
      return;
    }
    
    let transId = docRecord.getString("ftech_transaction_id");
    if (!transId) {
      // Para Documento Soporte (DS/NDS) o POS, Facturatech permite consultar por prefijo y folio directamente
      if (!isDS && !isNDS && !isPOS) {
        e.json(400, { message: "El documento no tiene un ID de transacción de Facturatech asociado." });
        return;
      }
      transId = "";
    }
    
    let ftechUsername = getSetting("ftech_username", "");
    if (!ftechUsername) {
      ftechUsername = getSetting("company_nit", "900123456").split('-')[0].replace(/[^0-9]/g, '');
    }
    const ftechPassword = getSetting("ftech_password", "");
    const ftechEnvironment = getSetting("ftech_environment", "2");
    
    const hubUrl = "http://127.0.0.1:8088/api/facturatech/check-status";
    console.log("[GRAVY HOOK] Consultando estado en Hub: " + hubUrl);

    const requestBody = {
      transId,
      ftechUsername,
      ftechPassword,
      ftechEnvironment,
      prefix,
      folio,
      isPOS: isPOS,
      isDS: isDS,
      isNDS: isNDS,
      documentNumber: docNumber,
      documentType: (isDS ? 'SupportDocument' : (isNDS ? 'SupportDocumentAdjust' : (isNC ? 'CreditNote' : (isND ? 'DebitNote' : 'Invoice'))))
    };
    
    const res = $http.send({
      url: hubUrl,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    
    if (res.statusCode !== 200) {
      throw new Error("El Hub retornó código: " + res.statusCode + " - " + res.raw);
    }
    
    const responseData = JSON.parse(res.raw);
    
    if (!responseData.success) {
      throw new Error(responseData.error || responseData.message || "Error al consultar estado en Facturatech.");
    }
    
    const incomingStatus = responseData.status || "enviada";
    // Si ya estaba aceptada previamente, nunca degradar a enviada por desfase del hub
    if (docRecord.getString("status") !== "aceptada" || incomingStatus === "aceptada") {
      docRecord.set("status", incomingStatus);
    }
    if (responseData.cufe) {
      docRecord.set("cufe", responseData.cufe);
    }
    if (responseData.xmlContent) {
      docRecord.set("xml_content", responseData.xmlContent);
    }
    if (incomingStatus === "aceptada" || docRecord.getString("status") !== "aceptada") {
      docRecord.set("dian_response", responseData.message || "Procesado.");
    }
    $app.save(docRecord);

    // Auto-send email if accepted
    if (docRecord.getString("status") === "aceptada") {
      try {
        sendInvoiceEmailHelper(txId);
      } catch (emailErr) {
        console.error("[GRAVY HOOK] Error al enviar correo automático desde check-status:", emailErr);
      }
    }
    
    e.json(200, {
      success: true,
      status: docRecord.get("status"),
      cufe: docRecord.get("cufe"),
      dianResponse: docRecord.get("dian_response"),
      simulated: !!responseData.simulated
    });
    
  } catch (err) {
    console.error("[GRAVY HOOK] Error al consultar estado Facturatech:", err);
    const rawError = String(err.message || err);
    e.json(400, {
      success: false,
      message: rawError,
      providerError: rawError,
      dianResponse: rawError,
      error: rawError
    });
  }
});

routerAdd('POST', '/api/dian/resend-email', (e) => {

  const getSetting = (typeof globalThis.getSetting === 'function')
    ? globalThis.getSetting
    : function(key, defaultValue) {
        try {
          const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
          return (r ? r.get("value") : null) || defaultValue;
        } catch (_) {
          return defaultValue;
        }
      };

function sendInvoiceEmailHelper(txId, customEmail) {


  const syncSmtpSettings = function() {
    const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = getSetting("smtp_host", "");
        const port = parseInt(getSetting("smtp_port", "587"), 10);
        const user = getSetting("smtp_username", "");
        const pass = getSetting("smtp_password", "");
        const senderName = getSetting("smtp_sender_name", "");
        const senderAddr = getSetting("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || getSetting("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
    } catch (err) {
      console.error("[GRAVY DIAN SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
    }
  };

  try {
    const docRecord = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = '" + txId + "'");
    if (!docRecord) {
      throw new Error("Documento de facturación no encontrado para esta transacción.");
    }
    
    const xmlContent = docRecord.getString("xml_content");
    if (!xmlContent) {
      throw new Error("El documento no posee contenido XML firmado para reenviar.");
    }
    
    const tx = $app.findRecordById("transactions", txId);
    $app.expandRecord(tx, ["third_party_id"], null);
    const customer = tx.expandedOne("third_party_id");
    let custEmail = customEmail;
    if (!custEmail) {
      custEmail = customer ? customer.getString("email") : "";
    }
    if (!custEmail) {
      throw new Error("Debe configurar un correo en la ficha del tercero.");
    }
    
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyEmail = getSetting("company_email", "noreply@gravy.com");
    const docNumber = tx.getString("number") || "Factura";

    let totalVal = 0;
    try {
      const invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      totalVal = invRec.getFloat("total") || 0;
    } catch (_) {
      try {
        const purRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
        totalVal = purRec.getFloat("total") || 0;
      } catch (_2) {}
    }
    const fmtTotal = "$ " + Math.round(totalVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const companyNitRaw = getSetting("company_nit", "900123456");
    const companyNit = companyNitRaw.split('-')[0].replace(/[^0-9]/g, '');
    
    $app.expandRecord(tx, ["tx_type_id"], null);
    const txType = tx.expandedOne("tx_type_id");
    const txTypeCode = txType ? txType.getString("code") : "";
    let docTypeCode = "01";
    if (txTypeCode === "ND") docTypeCode = "02";
    else if (txTypeCode === "NC") docTypeCode = "03";
    
    const commercialName = getSetting("company_name", "GRAVY S.A.S");
    const emailSubject = `${companyNit};${companyName};${docNumber};${docTypeCode};${commercialName};`;

    const einvoiceMethod = getSetting("einvoice_method", "dian");
    let integrationComment = "";
    if (einvoiceMethod === "facturatech") {
      integrationComment = "La integracion de datos es realizada por proveedor tecnologico CADENA S.A. / NIT. 890.930.534-0";
    } else {
      integrationComment = "La integracion de datos es realizada directamente por la UAE DIAN bajo la modalidad de software propio a nombre del emisor de este documento electronico";
    }

    let invoiceData = null;
    try {
      let invRec = null;
      let isPurchase = false;
      try {
        invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        try {
          invRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
          isPurchase = true;
        } catch (_2) {}
      }

      if (invRec) {
        let linesList = [];
        if (!isPurchase) {
          linesList = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invRec.id + "'");
        } else {
          linesList = $app.findRecordsByFilter("purchase_invoice_lines", "invoice_id = '" + invRec.id + "'");
        }
        
        $app.expandRecords(linesList, ["product_id"], null);
        const linesData = [];
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const prod = l.expandedOne("product_id");
          linesData.push({
            desc: prod ? prod.getString("name") : "Producto",
            code: prod ? prod.getString("code") : "—",
            qty: l.getFloat("qty") || 0,
            unitPrice: l.getFloat("unit_price") || 0,
            lineTotal: l.getFloat("total") || 0,
            ivaRate: l.getFloat("iva_rate") || 0,
            unitCode: prod ? (prod.getString("unit") || "94") : "94",
          });
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = customer ? customer.getString("name") : "Consumidor Final";
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        let cajeroName = "Admin";
        const posShiftId = invRec.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = invRec.getString("pos_shift_id") ? "POS" : "FV";
        
        try {
          const registerId = invRec.getString("pos_shift_id") ? ($app.findRecordById("pos_shifts", invRec.getString("pos_shift_id")).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: invRec.getString("payment_method") || "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      } else {
        const linesList = $app.findRecordsByFilter("tx_lines", "tx_id = '" + txId + "'", "line_order");
        const linesData = [];
        let totalFromLines = 0;
        for (let i = 0; i < linesList.length; i++) {
          const l = linesList[i];
          const d = l.getFloat("debit");
          const c = l.getFloat("credit");
          const amount = d > 0 ? d : c;
          if (amount > 0) {
            linesData.push({
              desc: l.getString("description") || "Concepto Contable",
              code: "—",
              qty: 1,
              unitPrice: amount,
              lineTotal: amount,
              ivaRate: 0
            });
            totalFromLines += amount;
          }
        }

        const supplierAddress = getSetting("company_address", "");
        const supplierPhone = getSetting("company_phone", "");
        const supplierEmail = getSetting("company_email", "");

        const customerName = customer ? customer.getString("name") : "Consumidor Final";
        const customerNit = customer ? customer.getString("doc_number") : "222222222";
        const customerAddress = customer ? customer.getString("address") : "";
        const customerPhone = customer ? customer.getString("phone") : "";
        const customerEmail = customer ? customer.getString("email") : "";

        const issueTime = docRecord.getString("sent_at") ? docRecord.getString("sent_at").split(" ")[1] || "12:00:00" : "12:00:00";

        let cajeroName = "Admin";
        const posShiftId = tx.getString("pos_shift_id");
        if (posShiftId) {
          try {
            const shift = $app.findRecordById("pos_shifts", posShiftId);
            $app.expandRecord(shift, ["user_id"], null);
            const user = shift.expandedOne("user_id");
            if (user) {
              cajeroName = user.getString("name") || user.getString("email") || "Admin";
            }
          } catch (_) {}
        }

        let resName = "Factura de Venta POS";
        let resDesc = "";
        let resNum = "";
        let resDate = "";
        let resExpiry = "";
        let resFrom = "";
        let resTo = "";
        let resPrefix = "";
        
        let prefix = "";
        if (docNumber.includes('-')) {
          prefix = docNumber.split('-')[0].trim().toUpperCase();
        }
        let docType = posShiftId ? "POS" : "FV";
        
        try {
          const registerId = posShiftId ? ($app.findRecordById("pos_shifts", posShiftId).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docType + "\" && active=true";
          let resList = [];
          if (registerId && docType === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docType === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docType + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || "Factura de Venta POS";
              resDesc = resolution.getString("description") || "";
              resNum = resolution.getString("resolution_number") || "";
              resDate = resolution.getString("resolution_date") ? resolution.getString("resolution_date").slice(0, 10) : "";
              resExpiry = resolution.getString("expiration_date") ? resolution.getString("expiration_date").slice(0, 10) : "";
              resFrom = resolution.getInt("number_from") || "";
              resTo = resolution.getInt("number_to") || "";
              resPrefix = resolution.getString("prefix") || "";
            }
          }
        } catch (_) {}

        invoiceData = {
          docId: docNumber,
          issueDate: tx.getString("date"),
          issueTime: issueTime,
          cufe: docRecord.getString("cufe") || "N/A",
          payableAmount: totalVal || totalFromLines,
          supplierName: companyName,
          supplierNit: companyNitRaw,
          supplierAddress: supplierAddress,
          supplierPhone: supplierPhone,
          supplierEmail: supplierEmail,
          customerName: customerName,
          customerNit: customerNit,
          customerAddress: customerAddress,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          lines: linesData,
          companyLogo: getSetting("company_logo", ""),
          cajero: cajeroName,
          paymentMethod: "EFECTIVO",
          received: 0,
          change: 0,
          resolutionName: resName,
          resolutionDesc: resDesc,
          resolutionNumber: resNum,
          resolutionDate: resDate,
          resolutionExpiry: resExpiry,
          resolutionRangeFrom: resFrom,
          resolutionRangeTo: resTo,
          resolutionPrefix: resPrefix
        };
      }
    } catch (errData) {
      console.warn("[GRAVY HOOK] Error al preparar structured invoiceData:", errData);
    }

    try {
      syncSmtpSettings();
    } catch (e) {
      console.warn("[GRAVY] Error syncing SMTP settings:", e);
    }

    let zipPath = "";
    const zipBasenameForEmail = docRecord.getString("zip_filename") || docNumber;
    try {
      const zipRes = $http.send({
        url: "http://127.0.0.1:8088/api/dian/generate-zip-file",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xmlContent: xmlContent, filename: zipBasenameForEmail, invoiceData: invoiceData })
      });
      if (zipRes.statusCode === 200) {
        const zipData = JSON.parse(zipRes.raw);
        if (zipData.success) {
          zipPath = zipData.zipPath;
        }
      }
    } catch (err) {
      console.error("[GRAVY HOOK] Error al generar ZIP en el orquestador:", err);
    }
    
    const message = new MailerMessage({
      from: {
        address: companyEmail,
        name: companyName
      },
      to: [{ address: custEmail }],
      subject: emailSubject,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="cid:gravy-logo.png" alt="GRAVY Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: #E0F2FE; color: #0369A1; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                Documento Oficial DIAN
              </span>
            </div>
            
            <h2 style="color: #0F172A; font-size: 22px; font-weight: 800; text-align: center; margin-top: 12px; margin-bottom: 8px;">
              ¡Tu Factura Electrónica está lista!
            </h2>
            <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
              Emitida por <strong>${companyName}</strong>
            </p>
            
            <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
              <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
                Estimado cliente <strong>${customer ? customer.getString("name") : "Consumidor Final"}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
                Adjunto en este correo encontrará el archivo comprimido <strong>ZIP</strong> que contiene el XML firmado y la representación gráfica en formato PDF correspondientes a la <strong>Factura Electrónica de Venta No. ${docNumber}</strong>.
              </p>
            </div>
            
            <h3 style="color: #0F172A; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
              Detalles del Documento
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Número de Documento:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Fecha de Emisión:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${tx.getString("date")}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Monto Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284C7; border-bottom: 1px solid #F1F5F9;">${fmtTotal}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; vertical-align: top;">CUFE / CUDE:</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                  ${docRecord.getString("cufe") || 'N/A'}
                </td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 13px; color: #94A3B8; margin: 0;">
                Gracias por su preferencia y confianza.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
            <p style="font-size: 11px; color: #94A3B8; line-height: 1.5; margin: 0;">
              ${integrationComment}
            </p>
            <p style="font-size: 10px; color: #CBD5E1; margin-top: 12px; margin-bottom: 0;">
              Este es un mensaje automático generado por GRAVY. Por favor no responda a este correo.
            </p>
          </div>
        </div>
      `,
    });
    
    const attachments = {};
    if (zipPath) {
      try {
        const zipFile = $filesystem.fileFromPath(zipPath);
        attachments[`${zipBasenameForEmail}.zip`] = zipFile.reader.open();
      } catch (zipErr) {
        console.error("[GRAVY HOOK] No se pudo abrir el archivo ZIP generado:", zipErr);
        const xmlFile = $filesystem.fileFromBytes(xmlContent, `${zipBasenameForEmail}.xml`);
        attachments[`${zipBasenameForEmail}.xml`] = xmlFile.reader.open();
      }
    } else {
      const xmlFile = $filesystem.fileFromBytes(xmlContent, `${zipBasenameForEmail}.xml`);
      attachments[`${zipBasenameForEmail}.xml`] = xmlFile.reader.open();
    }

    try {
      const logoFile = $filesystem.fileFromPath("pb_public/assets/gravy-logo.png");
      attachments["gravy-logo.png"] = logoFile.reader.open();
    } catch (logoErr) {
      console.warn("[GRAVY HOOK] No se pudo adjuntar el logo de GRAVY:", logoErr);
    }
    
    message.attachments = attachments;
    
    $app.newMailClient().send(message);
    console.log("[GRAVY HOOK] Correo enviado automáticamente a:", custEmail);
    return true;
  } catch (err) {
    console.error("[GRAVY HOOK] Falló al enviar correo en helper:", err);
    throw err;
  }
}


  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }
  
  const body = e.requestInfo()?.body || {};
  const txId = body.txId || body.tx_id;
  if (!txId) {
    e.json(400, { message: "txId es requerido." });
    return;
  }
  
  try {
    sendInvoiceEmailHelper(txId, body.email || body.custEmail);
    e.json(200, { success: true, message: "Correo reenviado exitosamente." });
  } catch (err) {
    console.error("[GRAVY HOOK] Error al reenviar correo:", err);
    e.json(500, { message: "Error al reenviar correo: " + err.message });
  }
});

routerAdd("POST", "/api/dian/pdf-bytes", (e) => {
  const getSetting = (typeof globalThis.getSetting === 'function')
    ? globalThis.getSetting
    : function(key, defaultValue) {
        try {
          const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
          return (r ? r.get("value") : null) || defaultValue;
        } catch (_) {
          return defaultValue;
        }
      };

  const body = e.requestInfo()?.body || {};
  const invoiceId = body.invoiceId || body.invoice_id;
  if (!invoiceId) {
    e.json(400, { message: "invoiceId es requerido." });
    return;
  }

  try {
    const invRec = $app.findRecordById("invoices", invoiceId);
    let customer = null;
    if (invRec.getString("customer_id")) {
      try { customer = $app.findRecordById("third_parties", invRec.getString("customer_id")); } catch (_) {}
    }

    const linesList = $app.findRecordsByFilter("invoice_lines", "invoice_id = '" + invRec.id + "'");
    $app.expandRecords(linesList, ["product_id"], null);

    const linesData = [];
    for (let i = 0; i < linesList.length; i++) {
      const l = linesList[i];
      const prod = l.expandedOne("product_id");
      linesData.push({
        desc: prod ? prod.getString("name") : "Producto",
        code: prod ? prod.getString("code") : "—",
        qty: l.getFloat("qty") || 0,
        unitPrice: l.getFloat("unit_price") || 0,
        lineTotal: l.getFloat("total") || 0,
        ivaRate: l.getFloat("iva_rate") || 0,
        unitCode: prod ? (prod.getString("unit") || "94") : "94",
      });
    }

    let xmlContent = "";
    let cufe = "";
    const txId = invRec.getString("tx_id");
    if (txId) {
      try {
        const einvs = $app.findRecordsByFilter("einvoice_docs", "tx_id = '" + txId + "'");
        if (einvs.length > 0) {
          xmlContent = einvs[0].getString("signed_xml");
          cufe = einvs[0].getString("cufe");
        }
      } catch (_) {}
    }

    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "1130636393-2");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");
    const companyDept = getSetting("company_dept", getSetting("company_department", ""));
    const companyCityCode = getSetting("company_city_code", getSetting("company_dane", ""));
    const companyDeptCode = getSetting("company_dept_code", "");
    const companyLogo = getSetting("company_logo", "");

    let sellerName = "";
    if (invRec.getString("seller_id")) {
      try {
        const sRec = $app.findRecordById("sellers", invRec.getString("seller_id"));
        sellerName = sRec.getString("name");
      } catch (_) {
        try {
          const uRec = $app.findRecordById("users", invRec.getString("seller_id"));
          sellerName = uRec.getString("name") || uRec.getString("first_name") || "";
        } catch (_) {}
      }
    }

    let orderNumberVal = invRec.getString("_sales_order_number") || "";
    if (!orderNumberVal && invRec.getString("sales_order_id")) {
      try {
        const soRec = $app.findRecordById("sales_orders", invRec.getString("sales_order_id"));
        orderNumberVal = soRec.getString("number");
      } catch (_) {}
    }

    let resNumber = "";
    let resDate = "";
    let resExpiry = "";
    let resFrom = "";
    let resTo = "";
    let resPrefix = "";

    const txTypeId = invRec.getString("tx_type_id");
    if (txTypeId) {
      try {
        const txType = $app.findRecordById("transaction_types", txTypeId);
        const prefix = txType.getString("prefix");
        if (prefix) {
          const resList = $app.findRecordsByFilter("dian_resolutions", "prefix = '" + prefix + "' && active = true");
          if (resList.length > 0) {
            const r = resList[0];
            resNumber = r.getString("resolution_number");
            resDate = r.getString("resolution_date") ? r.getString("resolution_date").slice(0, 10) : "";
            resExpiry = r.getString("expiration_date") ? r.getString("expiration_date").slice(0, 10) : "";
            resFrom = String(r.getInt("number_from"));
            resTo = String(r.getInt("number_to"));
            resPrefix = r.getString("prefix");
          }
        }
      } catch (_) {}
    }

    const invoiceData = {
      docId: invRec.getString("number"),
      issueDate: invRec.getString("date"),
      dueDate: invRec.getString("due_date") || invRec.getString("date"),
      issueTime: "12:00:00",
      cufe: cufe || (invRec.getString("status") === "draft" ? "BORRADOR - SIN VALIDEZ TRIBUTARIA" : "DOCUMENTO PENDIENTE DE FIRMA DIAN"),
      supplierName: companyName,
      supplierNit: companyNit,
      supplierAddress: companyAddress,
      supplierPhone: companyPhone,
      supplierEmail: companyEmail,
      supplierCity: companyCity,
      supplierDept: companyDept,
      supplierCityCode: companyCityCode,
      supplierDeptCode: companyDeptCode,
      customerName: customer ? customer.getString("name") : "Consumidor Final",
      customerNit: customer ? (customer.getString("doc_number") || customer.getString("nit") || "222222222") : "222222222",
      customerAddress: customer ? customer.getString("address") : "",
      customerPhone: customer ? customer.getString("phone") : "",
      customerEmail: customer ? customer.getString("email") : "",
      customerCity: customer ? customer.getString("city") : "",
      customerDept: customer ? customer.getString("department") : "",
      customerCityCode: customer ? customer.getString("city_code") : "",
      customerDeptCode: customer ? customer.getString("dept_code") : "",
      poNumber: invRec.getString("po_number") || "",
      orderNumber: orderNumberVal,
      remisionNumber: invRec.getString("remision_number") || "",
      sellerName: sellerName,
      crossDocRef: invRec.getString("cross_doc_ref") || "",
      payableAmount: invRec.getFloat("payable_total") || invRec.getFloat("total") || 0,
      paymentMethod: invRec.getString("payment_method") || "EFECTIVO",
      companyLogo: companyLogo,
      resolutionName: "Factura Electrónica de Venta",
      resolutionNumber: resNumber,
      resolutionDate: resDate,
      resolutionExpiry: resExpiry,
      resolutionRangeFrom: resFrom,
      resolutionRangeTo: resTo,
      resolutionPrefix: resPrefix,
      lines: linesData
    };

    const orchestratorRes = $http.send({
      url: "http://127.0.0.1:8088/api/dian/generate-pdf",
      method: "POST",
      body: JSON.stringify({
        xmlContent: xmlContent,
        filename: invRec.getString("number") || "factura",
        invoiceData: invoiceData
      }),
      headers: { "Content-Type": "application/json" }
    });

    if (orchestratorRes.statusCode === 200) {
      e.blob(200, "application/pdf", orchestratorRes.raw);
    } else {
      e.json(500, { message: "Error en el motor de generación PDF." });
    }
  } catch (err) {
    console.error("[GRAVY HOOK] Error al generar bytes de PDF:", err);
    e.json(500, { message: "Error al generar PDF: " + err.message });
  }
});

// ============================================================================
// NÓMINA ELECTRÓNICA DIAN & FACTURATECH ENDPOINTS (Vía Hub Orquestador)
// ============================================================================

routerAdd('POST', '/api/dian/nomina/emit', (e) => {
  function getNominaSetting(key, defVal) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key.replace(/'/g, "''") + "'");
      return (r ? r.get("value") : null) || defVal;
    } catch (_) {
      return defVal;
    }
  }

  try {
    let body = {};
    try {
      const reqInfo = e.requestInfo();
      body = reqInfo ? (reqInfo.body || {}) : {};
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
    } catch (_) {
      try { body = e.bindBody({}); } catch (_2) {}
    }

    const recordId = body.id || body.electronicPayrollId;
    if (!recordId) {
      e.json(400, { success: false, message: "ID de registro de nómina electrónica no especificado." });
      return;
    }

    let rec = null;
    try {
      rec = $app.findRecordById("electronic_payrolls", recordId);
    } catch (findErr) {
      e.json(404, { success: false, message: "Registro de nómina no encontrado (" + recordId + "): " + findErr.message });
      return;
    }

    if (!rec) {
      e.json(404, { success: false, message: "Registro de nómina electrónica no encontrado." });
      return;
    }

    const einvoiceMethod = getNominaSetting("einvoice_method", "simulation");
    const ftechUsername = getNominaSetting("ftech_username", "");
    const ftechPassword = getNominaSetting("ftech_password", "");
    const ftechEnvironment = getNominaSetting("ftech_environment", "demo");

    let reassignConsecutive = false;
    if (body.reassignConsecutive === true || body.reassignConsecutive === 'true') {
      reassignConsecutive = true;
    }

    let prefijo = rec.getString("prefijo") || "NOM";
    let consecutivo = rec.getInt("consecutivo") || 1;
    let xmlContent = rec.getString("xml_generado") || "";
    let cufe = rec.getString("cufe") || "";

    if (reassignConsecutive) {
      try {
        let activeNeRes = null;
        try {
          activeNeRes = $app.findFirstRecordByFilter("dian_resolutions", "document_type = 'NE' && active = true");
        } catch (_) {}

        let nextNum = 1;
        if (activeNeRes) {
          prefijo = (activeNeRes.getString("prefix") || prefijo || "NOM").trim();
          nextNum = activeNeRes.getInt("current_number") || 1;
          activeNeRes.set("current_number", nextNum + 1);
          $app.save(activeNeRes);
        } else {
          try {
            const maxPayrolls = $app.findRecordsByFilter("electronic_payrolls", "1=1", "-consecutivo", 1);
            if (maxPayrolls && maxPayrolls.length > 0) {
              nextNum = (maxPayrolls[0].getInt("consecutivo") || 0) + 1;
            }
          } catch (_) {}
        }

        consecutivo = nextNum;
        rec.set("consecutivo", consecutivo);
        rec.set("prefijo", prefijo);
        rec.set("ftech_transaction_id", "");
        rec.set("cufe", "");
        rec.set("estado_dian", "PENDIENTE");

        // Actualizar consecutivo y prefijo en el XML generado
        xmlContent = xmlContent.replace(/Consecutivo="[0-9]+"/, `Consecutivo="${consecutivo}"`)
                               .replace(/Numero="[A-Za-z0-9_-]+"/, `Numero="${prefijo}${consecutivo}"`)
                               .replace(/Prefijo="[A-Za-z0-9_-]+"/, `Prefijo="${prefijo}"`);
        rec.set("xml_generado", xmlContent);
        $app.save(rec);
        console.log(`[GRAVY HOOK] Consecutivo reasignado bajo confirmación de usuario a: ${prefijo}${consecutivo}`);
      } catch (reassignErr) {
        console.error("[GRAVY HOOK] Error al reasignar consecutivo:", reassignErr);
      }
    }

    // Sanitización CUNE para Facturatech: el CUNE debe ir vacío CUNE="" para que el proveedor tecnológico lo selle
    if (einvoiceMethod === "facturatech" && xmlContent) {
      xmlContent = xmlContent.replace(/\bCUNE="[^"]*"/g, 'CUNE=""');
      // Proteger EncripCUNE con espacio 'EncripCUNE ="CUNE-SHA384"' para evitar que cualquier versión previa del hub lo mutile
      xmlContent = xmlContent.replace(/EncripCUNE\s*=\s*"[^"]*"/g, 'EncripCUNE ="CUNE-SHA384"');
      rec.set("xml_generado", xmlContent);
    }

    if (einvoiceMethod === "facturatech") {
      if (!ftechUsername) {
        e.json(400, { success: false, message: "Modo Facturatech configurado pero falta el Usuario/NIT de Facturatech en Configuración." });
        return;
      }

      console.log("[GRAVY HOOK] Transmitiendo Nómina Electrónica a Facturatech vía Hub Orquestador...");
      const hubUrl = "http://127.0.0.1:8088/api/facturatech/upload-and-send";
      
      const hubPayload = {
        xmlContent: xmlContent,
        ftechUsername: ftechUsername,
        ftechPassword: ftechPassword,
        ftechEnvironment: ftechEnvironment,
        documentType: "NominaIndividual",
        documentNumber: `${prefijo}${consecutivo}`,
        prefix: prefijo,
        folio: consecutivo,
        isNomina: true
      };

      const resHub = $http.send({
        url: hubUrl,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hubPayload)
      });

      if (resHub.statusCode !== 200) {
        let errDetails = resHub.raw;
        try {
          const parsed = JSON.parse(resHub.raw);
          errDetails = parsed.error || parsed.message || resHub.raw;
        } catch (_) {}
        rec.set("estado_dian", "RECHAZADO");
        rec.set("dian_response", "Error Hub Facturatech: " + errDetails);
        $app.save(rec);
        e.json(resHub.statusCode || 500, { success: false, status: "RECHAZADO", message: "Error Hub Facturatech: " + errDetails, consecutivo, prefijo });
        return;
      }

      let hubResData = {};
      try {
        hubResData = JSON.parse(resHub.raw);
      } catch (_) {}
      
      const transId = hubResData.transaccionID || "";
      if (!hubResData.success || !transId) {
        const errMsg = hubResData.error || hubResData.message || "Error al subir a Facturatech (sin ID de transacción).";
        rec.set("estado_dian", "RECHAZADO");
        rec.set("dian_response", errMsg);
        $app.save(rec);
        e.json(400, { success: false, status: "RECHAZADO", message: errMsg, consecutivo, prefijo });
        return;
      }

      rec.set("ftech_transaction_id", transId);

      // Consultar status inmediato a través del Hub
      let finalStatus = "EN_PROCESO";
      let statusMsg = hubResData.message || "Comprobante recibido por Facturatech y en proceso de validación DIAN.";

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
          if (sData.status === "aceptada" || sData.status === "APROBADO" || (sData.message && /aprobado/i.test(sData.message) && (sData.cufe || rec.get("cufe")))) {
            finalStatus = "APROBADO";
            if (sData.xmlContent && sData.xmlContent.includes("<")) {
              rec.set("xml_generado", sData.xmlContent);
              const cMatch = sData.xmlContent.match(/<cbc:UUID[^>]*>(.*?)<\/cbc:UUID>/i) ||
                             sData.xmlContent.match(/<CUNE[^>]*>(.*?)<\/CUNE>/i) ||
                             sData.xmlContent.match(/CUNE="([0-9a-fA-F]{64,96})"/i);
              if (cMatch && cMatch[1]) {
                cufe = cMatch[1].trim();
                rec.set("cufe", cufe);
              }
            }
          } else if (sData.status === "rechazada" || sData.status === "RECHAZADO") {
            finalStatus = "RECHAZADO";
          }
          if (sData.message) statusMsg = sData.message;
        }
      } catch (stErr) {
        console.warn("[GRAVY HOOK] No se pudo obtener status inmediato:", stErr);
      }

      rec.set("estado_dian", finalStatus);
      rec.set("dian_response", statusMsg);
      rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
      $app.save(rec);

      e.json(200, {
        success: true,
        status: finalStatus,
        cufe: cufe,
        consecutivo: consecutivo,
        prefijo: prefijo,
        transactionID: transId,
        message: statusMsg
      });
      return;
    }

    if (einvoiceMethod === "matias") {
      console.log("[GRAVY HOOK] Transmitiendo Nómina Electrónica vía MATIAS API...");
      
      const matiasCaller = getMatiasCaller();

      // Obtener resolución activa para Nómina Electrónica (NE)
      let neResolution = null;
      try {
        neResolution = $app.findFirstRecordByFilter("dian_resolutions", "document_type = 'NE' && active = true");
      } catch (_) {}

      const resNum = neResolution ? neResolution.getString("resolution_number") : getNominaSetting("dian_resolution_number", "18760000001");
      const pfx = (neResolution ? neResolution.getString("prefix") : prefijo) || "SNEL";

      // Obtener empleado vinculado si existe
      let empRec = null;
      const empId = rec.getString("employee_id");
      if (empId) {
        try {
          empRec = $app.findRecordById("employees", empId);
        } catch (_) {}
      }

      // Extraer datos desde xmlContent si está disponible para máxima fidelidad
      let docNumStr = String(empRec?.getString("document_number") || empRec?.getString("dni") || "1063279307");
      let empName = empRec?.getString("name") || empRec?.getString("first_name") || "Empleado";
      let empSurname = empRec?.getString("last_name") || empRec?.getString("first_surname") || "General";
      let empAddress = empRec?.getString("address") || "Dirección";
      let workedDays = "30";

      if (xmlContent) {
        const mDoc = xmlContent.match(/NumeroDocumento="([^"]+)"/);
        if (mDoc) docNumStr = mDoc[1];
        const mNom = xmlContent.match(/PrimerNombre="([^"]+)"/);
        if (mNom) empName = mNom[1];
        const mApe = xmlContent.match(/PrimerApellido="([^"]+)"/);
        if (mApe) empSurname = mApe[1];
        const mDias = xmlContent.match(/DiasTrabajados="([^"]+)"/);
        if (mDias) workedDays = mDias[1];
      }

      const totalDev = (rec.getFloat("total_devengos") || 0).toFixed(2);
      const totalDed = (rec.getFloat("total_deducciones") || 0).toFixed(2);
      const totalNet = (rec.getFloat("total_neto") || 0).toFixed(2);

      const ano = rec.getInt("ano") || new Date().getFullYear();
      const mes = String(rec.getInt("mes") || (new Date().getMonth() + 1)).padStart(2, '0');
      const lastDayOfMonth = new Date(ano, parseInt(mes, 10), 0).getDate();
      const startDateStr = `${ano}-${mes}-01`;
      const endDateStr = `${ano}-${mes}-${lastDayOfMonth}`;
      const nowStr = new Date().toISOString().slice(0, 10);
      const nowTimeStr = new Date().toTimeString().slice(0, 8);

      const matiasNominaPayload = {
        resolution_number: String(resNum || "18760000001"),
        prefix: pfx,
        document_number: String(consecutivo),
        generation_city_id: "1006",
        worker_code: docNumStr,
        novelty: false,
        pay_day: endDateStr,
        period: {
          date_entry: (empRec?.getString("hire_date") || "2023-01-01").slice(0, 10),
          departure_date: null,
          settlement_start_date: startDateStr,
          settlement_end_date: endDateStr,
          time_worked: String(workedDays),
          generation_date: nowStr
        },
        general_information: {
          generation_date: nowStr,
          generation_time: nowTimeStr,
          period_id: "5",
          currency_id: "272",
          trm: "0"
        },
        notes: `Nómina electrónica periodo ${ano}-${mes}`,
        send_email: 1,
        employee: {
          worker_type_id: 1,
          worker_subtype_id: 1,
          high_risk_pension: "false",
          identity_document_id: "3",
          document_number: docNumStr,
          first_surname: empSurname,
          second_surname: "",
          first_name: empName,
          other_names: "",
          email: empRec?.getString("email") || "",
          working_country_id: 45,
          work_city_id: 1006,
          work_address: empAddress,
          integral_salary: "false",
          contract_type_id: 1,
          salary: String(totalDev),
          worker_code: docNumStr
        },
        payment: {
          payment_method_id: "1",
          means_payment_id: "10",
          bank: "BANCOLOMBIA",
          account_type: "AHORROS",
          account_number: "0"
        },
        earn: {
          basic: {
            worked_days: String(workedDays),
            salary_worked: String(totalDev)
          },
          transport: {
            transportation_assistance: "0.00",
            viatic_maintenance: "0.0",
            viatic_non_salary_maintenance: "0.0"
          }
        },
        deductions: {
          health: {
            percentage: "4",
            deduction: String((parseFloat(totalDed) / 2).toFixed(2))
          },
          pension_fund: {
            percentage: "4",
            deduction: String((parseFloat(totalDed) / 2).toFixed(2))
          }
        },
        rounding: "0",
        total_earned: String(totalDev),
        deductions_total: String(totalDed),
        total_voucher: String(totalNet)
      };

      let matiasNominaEndpoint = "/ep/payroll";
      let sendPayload = matiasNominaPayload;

      const nomAction = body.action || (rec.getString("tipo") === 'reemplazo' ? 'replace' : (rec.getString("tipo") === 'eliminacion' ? 'delete' : 'emit'));

      if (nomAction === "replace" || nomAction === "reemplazo") {
        matiasNominaEndpoint = "/ep/payroll/replace";
        const predNum = String(body.predecessor_number || rec.getString("predecessor_number") || ("NOM" + (consecutivo > 1 ? consecutivo - 1 : 1)));
        const predCune = String(body.predecessor_cune || rec.getString("predecessor_cune") || cufe || "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
        const predDate = String(body.predecessor_date || rec.getString("predecessor_date") || nowStr);

        matiasNominaPayload.replacing_predecessor = {
          number: predNum,
          cune: predCune,
          generation_date: predDate
        };
        sendPayload = matiasNominaPayload;
      } else if (nomAction === "delete" || nomAction === "eliminacion") {
        matiasNominaEndpoint = "/ep/payroll/delete";
        const predNum = String(body.predecessor_number || rec.getString("predecessor_number") || ("NOM" + consecutivo));
        const predCune = String(body.predecessor_cune || rec.getString("predecessor_cune") || cufe || "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
        const predDate = String(body.predecessor_date || rec.getString("predecessor_date") || nowStr);

        sendPayload = {
          resolution_number: String(resNum || "18760000001"),
          document_number: String(consecutivo),
          generation_city_id: "1006",
          deleting_predecessor: {
            number: predNum,
            cune: predCune,
            generation_date: predDate
          },
          general_information: {
            generation_date: nowStr,
            generation_time: nowTimeStr
          },
          notes: body.notes || "Documento de nómina eliminado por ajuste contable"
        };
      }

      const matiasRes = matiasCaller(matiasNominaEndpoint, "POST", sendPayload);
      if (!matiasRes.ok) {
        const errMsg = matiasRes.data?.message || matiasRes.data?.error || `Error en MATIAS API (${matiasRes.statusCode})`;
        rec.set("estado_dian", "RECHAZADO");
        rec.set("dian_response", errMsg + (matiasRes.data?.response?.ErrorMessage?.string ? ": " + JSON.stringify(matiasRes.data.response.ErrorMessage.string) : ""));
        $app.save(rec);
        e.json(matiasRes.statusCode || 400, {
          success: false,
          status: "RECHAZADO",
          message: errMsg,
          details: matiasRes.data,
          consecutivo,
          prefijo: pfx
        });
        return;
      }

      const mData = matiasRes.data || {};
      const xmlDocKey = mData.XmlDocumentKey || mData.cufe || mData.cune || "";
      const statusCode = String(mData.response?.StatusCode || mData.response?.ResponseCode || "");
      const isDianValid = mData.response?.IsValid === "true" || mData.response?.IsValid === true || statusCode === "00" || statusCode === "02";
      const statusMsg = mData.response?.StatusMessage || mData.message || "Nómina Electrónica autorizada por la DIAN.";

      rec.set("estado_dian", isDianValid ? "APROBADO" : "RECHAZADO");
      rec.set("cufe", xmlDocKey);
      rec.set("dian_response", statusMsg);
      if (mData.response?.XmlBase64Bytes) {
        rec.set("xml_generado", mData.response.XmlBase64Bytes);
      }
      rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
      $app.save(rec);

      e.json(200, {
        success: true,
        status: isDianValid ? "APROBADO" : "RECHAZADO",
        cufe: xmlDocKey,
        consecutivo: consecutivo,
        prefijo: pfx,
        transactionID: mData.uuid || "",
        message: statusMsg
      });
      return;
    }

    // Modo Simulación explícito
    rec.set("estado_dian", "SIMULADO");
    rec.set("fecha_envio", new Date().toISOString().replace('T', ' ').slice(0, 19));
    $app.save(rec);

    e.json(200, {
      success: true,
      simulated: true,
      status: "SIMULADO",
      cufe: cufe,
      message: "Modo Simulación: El comprobante no fue transmitido a la DIAN real porque el método de facturación electrónica configurado es 'simulation'."
    });
    return;

  } catch (err) {
    console.error("[GRAVY HOOK] Error en /api/dian/nomina/emit:", err);
    e.json(500, { success: false, message: "Error al emitir nómina electrónica: " + err.message });
  }
});

routerAdd('POST', '/api/dian/nomina/check-status', (e) => {
  function getNominaSetting(key, defVal) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + key.replace(/'/g, "''") + "'");
      return (r ? r.get("value") : null) || defVal;
    } catch (_) {
      return defVal;
    }
  }

  try {
    let body = {};
    try {
      const reqInfo = e.requestInfo();
      body = reqInfo ? (reqInfo.body || {}) : {};
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
    } catch (_) {
      try { body = e.bindBody({}); } catch (_2) {}
    }

    const recordId = body.id || body.electronicPayrollId;
    if (!recordId) {
      e.json(400, { success: false, message: "ID de registro no especificado." });
      return;
    }

    let rec = null;
    try {
      rec = $app.findRecordById("electronic_payrolls", recordId);
    } catch (findErr) {
      e.json(404, { success: false, message: "Registro de nómina electrónica no encontrado: " + findErr.message });
      return;
    }

    if (!rec) {
      e.json(404, { success: false, message: "Registro de nómina electrónica no encontrado." });
      return;
    }

    const einvoiceMethod = getNominaSetting("einvoice_method", "simulation");
    if (einvoiceMethod === "matias") {
      e.json(200, {
        success: true,
        status: rec.getString("estado_dian") || "PENDIENTE",
        cufe: rec.getString("cufe") || "",
        dianResponse: rec.getString("dian_response") || "Procesado por MATIAS API",
        consecutivo: rec.getInt("consecutivo"),
        prefijo: rec.getString("prefijo")
      });
      return;
    }

    const ftechUsername = getNominaSetting("ftech_username", "");
    const ftechPassword = getNominaSetting("ftech_password", "");
    const ftechEnvironment = getNominaSetting("ftech_environment", "demo");
    const prefijo = rec.getString("prefijo") || "NOM";
    const consecutivo = rec.getInt("consecutivo") || 1;
    const transId = rec.getString("ftech_transaction_id");

    if ((transId || (prefijo && consecutivo)) && ftechUsername) {
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
          let estadoFinal = "EN_PROCESO";
          if (sData.status === "aceptada" || sData.status === "APROBADO" || (sData.message && /aprobado/i.test(sData.message) && (sData.cufe || rec.get("cufe")))) {
            estadoFinal = "APROBADO";
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
            estadoFinal = "RECHAZADO";
          }

          rec.set("estado_dian", estadoFinal);
          if (sData.message) rec.set("dian_response", sData.message);
          $app.save(rec);
          e.json(200, { success: true, status: estadoFinal, message: sData.message || `Estado DIAN: ${estadoFinal}` });
          return;
        }
      } catch (errSoap) {
        console.error("[GRAVY HOOK] Error al consultar status Facturatech Nómina:", errSoap);
      }
    }

    const currentStatus = rec.getString("estado_dian") || "PENDIENTE";
    e.json(200, {
      success: true,
      status: currentStatus,
      message: `Estado actual: ${currentStatus}`
    });
    return;

  } catch (err) {
    e.json(500, { success: false, message: "Error al consultar estado de nómina: " + err.message });
  }
});

routerAdd('POST', '/api/dian/nomina/download-xml', (e) => {
  try {
    let body = {};
    try {
      const reqInfo = e.requestInfo();
      body = reqInfo ? (reqInfo.body || {}) : {};
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
    } catch (_) {
      try { body = e.bindBody({}); } catch (_2) {}
    }

    const recordId = body.id || body.electronicPayrollId;
    if (!recordId) {
      e.json(400, { success: false, message: "ID de registro de nómina electrónica no especificado." });
      return;
    }

    let rec = null;
    try {
      rec = $app.findRecordById("electronic_payrolls", recordId);
    } catch (findErr) {
      e.json(404, { success: false, message: "Registro no encontrado: " + findErr.message });
      return;
    }

    if (!rec) {
      e.json(404, { success: false, message: "Registro de nómina electrónica no encontrado." });
      return;
    }

    const prefijo = rec.getString("prefijo") || "NOM";
    const consecutivo = rec.getInt("consecutivo") || 1;
    const filename = `NominaIndividual_${prefijo}-${consecutivo}.xml`;

    let currentXml = rec.getString("xml_generado") || "";
    const isSigned = currentXml.includes("AttachedDocument") || currentXml.includes("ds:SignatureValue") || currentXml.includes("ApplicationResponse");

    e.json(200, {
      success: true,
      isSigned: isSigned,
      xml: currentXml,
      filename: filename
    });
    return;

  } catch (err) {
    console.error("[GRAVY HOOK] Error al descargar XML de nómina:", err);
    e.json(500, { success: false, message: "Error al descargar XML: " + err.message });
  }
});

routerAdd('POST', '/api/dian/nomina/resend-email', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const email = (body.email || '').trim();
    if (!email) {
      return e.json(400, { message: "Debe ingresar un correo electrónico válido." });
    }

    const recordId = body.id || body.electronicPayrollId;
    const rec = recordId ? $app.findRecordById("electronic_payrolls", recordId) : null;

    let companyName = "GRAVY S.A.S";
    try {
      const cRec = $app.findFirstRecordByFilter("settings", "key = 'company_name'");
      if (cRec) companyName = cRec.getString("value") || companyName;
    } catch (_) {}

    const subject = `Comprobante de Nómina Electrónica — ${companyName}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0D2137;">Comprobante de Nómina Electrónica DIAN</h2>
        <p>Estimado(a) colaborador(a),</p>
        <p>Adjunto a este mensaje encontrará la información de su comprobante de nómina electrónica procesado por <strong>${companyName}</strong>.</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Empresa:</strong> ${companyName}</p>
          <p style="margin: 5px 0;"><strong>Estado DIAN:</strong> APROBADO</p>
          <p style="margin: 5px 0;"><strong>CUNE:</strong> ${rec ? (rec.getString("cufe") || "N/A") : "Registrado en el portal DIAN"}</p>
        </div>
        <p>Para consultas adicionales sobre su liquidación de nómina, comuníquese con el departamento de Gestión Humana.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">Mensaje generado automáticamente por el sistema contable GRAVY.</p>
      </div>
    `;

    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress || "no-reply@gravy.com",
        name: $app.settings().meta.senderName || companyName
      },
      to: [{ address: email }],
      subject: subject,
      html: htmlBody
    });

    $app.newMailClient().send(message);
    return e.json(200, { success: true, message: `Correo de comprobante de nómina enviado exitosamente a ${email}` });

  } catch (err) {
    console.error("[GRAVY HOOK] Error al enviar email de nómina:", err);
    return e.json(500, { message: "Error al enviar correo de nómina: " + err.message });
  }
});



routerAdd('POST', '/api/dian/nomina/download-pdf', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const recordId = body.id || body.electronicPayrollId;
    if (!recordId) {
      return e.json(400, { message: "ID de registro de nómina electrónica no especificado." });
    }

    const rec = $app.findRecordById("electronic_payrolls", recordId);
    if (!rec) {
      return e.json(404, { message: "Registro de nómina electrónica no encontrado." });
    }

    const settingsList = $app.findRecordsByFilter("settings", "key = 'einvoice_method' || key = 'ftech_username' || key = 'ftech_password' || key = 'ftech_environment'");
    let einvoiceMethod = "simulation";
    let ftechUsername = "";
    let ftechPassword = "";
    let ftechEnvironment = "demo";

    settingsList.forEach((s) => {
      const k = s.getString("key");
      const v = s.getString("value");
      if (k === "einvoice_method") einvoiceMethod = v;
      if (k === "ftech_username") ftechUsername = v;
      if (k === "ftech_password") ftechPassword = v;
      if (k === "ftech_environment") ftechEnvironment = v;
    });

    const prefijo = rec.getString("prefijo") || "NOM";
    const consecutivo = rec.getInt("consecutivo") || 1;
    const filename = `NominaIndividual_${prefijo}-${consecutivo}.pdf`;

    if (einvoiceMethod === "facturatech" && ftechUsername && ftechPassword && rec.getString("estado_dian") === "APROBADO") {
      try {
        const callFacturatechNominaSoap = (actionName, soapBodyParams, env) => {
          const isDemo = (env === 'demo' || env === '2' || env === 'pruebas');
          const baseUrl = isDemo 
            ? 'https://ws-nomina.facturatech.co/v1/demo/index.php' 
            : 'https://ws-nomina.facturatech.co/v1/pro/index.php';
          const targetNs = 'urn:https://ws-nomina.facturatech.co/v1/pro/';
          const soapAction = targetNs + '#' + actionName;

          let bodyXml = '<urn:' + actionName + ' soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
          bodyXml += '<username xsi:type="xsd:string">' + ftechUsername + '</username>';
          bodyXml += '<password xsi:type="xsd:string">' + ftechPassword + '</password>';
          for (let key in soapBodyParams) {
            const val = soapBodyParams[key];
            const typeStr = (typeof val === 'number' || (!isNaN(val) && String(val).trim() !== '')) ? 'xsd:integer' : 'xsd:string';
            bodyXml += '<' + key + ' xsi:type="' + typeStr + '">' + String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</' + key + '>';
          }
          bodyXml += '</urn:' + actionName + '>';

          const envelope = '<?xml version="1.0" encoding="utf-8"?>\n' +
            '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="' + targetNs + '">\n' +
            '  <soapenv:Header/>\n' +
            '  <soapenv:Body>\n' +
            '    ' + bodyXml + '\n' +
            '  </soapenv:Body>\n' +
            '</soapenv:Envelope>';

          return $http.send({
            url: baseUrl,
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'SOAPAction': soapAction
            },
            body: envelope
          });
        };

        const soapRes = callFacturatechNominaSoap('FtechAction.downloadPDF', {
          prefix: prefijo,
          number: consecutivo
        }, ftechEnvironment);

        if (soapRes.statusCode === 200) {
          const raw = soapRes.raw || "";
          const docB64Match = raw.match(/<documentBase64[^>]*>(.*?)<\/documentBase64>/i);
          const docB64 = docB64Match ? docB64Match[1] : "";
          if (docB64) {
            return e.json(200, {
              success: true,
              isOfficial: true,
              pdfBase64: docB64,
              filename: filename
            });
          }
        }
      } catch (errSoap) {
        console.error("[GRAVY HOOK] Error al descargar PDF oficial de Facturatech:", errSoap);
      }
    }

    return e.json(200, {
      success: true,
      isOfficial: false,
      filename: filename
    });

  } catch (err) {
    return e.json(500, { message: "Error al descargar PDF: " + err.message });
  }
});

// Sincronizar resoluciones y prefijos autorizados desde MATIAS API
routerAdd("POST", "/api/dian/sync-matias-resolutions", (e) => {
  try {
    const reqBody = e.requestInfo()?.body || {};

    // Helper autónomo de llamada MATIAS
    const caller = (typeof getMatiasCaller === "function") ? getMatiasCaller() : (function() {
      return function(endpoint, method, payload, overrideOptions) {
        const opts = overrideOptions || {};
        const env = opts.environment || (function() {
          try {
            const r = $app.findFirstRecordByFilter("settings", "key = 'matias_environment'");
            return (r ? r.get("value") : "") || "sandbox";
          } catch (_) { return "sandbox"; }
        })();
        const baseUrl = env === "production"
          ? "https://api-v2.matias-api.com/api/ubl2.1"
          : "https://sandbox-api.matias-api.com/api/ubl2.1";
        const token = opts.token || (function() {
          try {
            const r = $app.findFirstRecordByFilter("settings", "key = 'matias_api_token'");
            return (r ? r.get("value") : "") || "";
          } catch (_) { return ""; }
        })();
        if (!token) throw new Error("Token de MATIAS API no configurado.");
        const clientUuid = opts.client_uuid || (function() {
          try {
            const r = $app.findFirstRecordByFilter("settings", "key = 'matias_client_uuid'");
            return (r ? r.get("value") : "") || "";
          } catch (_) { return ""; }
        })();
        let fullUrl = baseUrl + endpoint;
        if (clientUuid) {
          fullUrl += (fullUrl.includes("?") ? "&" : "?") + "client_uuid=" + encodeURIComponent(clientUuid);
        }
        const res = $http.send({
          url: fullUrl,
          method: method || "GET",
          headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 60
        });
        let parsed = null;
        try { parsed = JSON.parse(res.raw); } catch (_) { parsed = { raw: res.raw }; }
        return { statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed, raw: res.raw };
      };
    })();

    const passedToken = (reqBody.token || "").trim();
    const passedEnv = (reqBody.environment || "").trim();
    const passedClientUuid = (reqBody.client_uuid || "").trim();

    const res = caller("/resolutions?sync=1", "GET", null, {
      token: passedToken,
      environment: passedEnv,
      client_uuid: passedClientUuid
    });

    if (!res.ok) {
      const errMsg = res.data?.message || res.data?.error || `Error HTTP ${res.statusCode} desde MATIAS API`;
      return e.json(res.statusCode || 400, { 
        success: false, 
        message: "No se pudieron obtener las resoluciones desde MATIAS API: " + errMsg,
        details: res.data || res.raw
      });
    }

    // Auto-persistir credenciales válidas en settings si fueron enviadas en caliente desde el formulario
    try {
      if (passedToken) {
        let tRec = null;
        try { tRec = $app.findFirstRecordByFilter("settings", "key = 'matias_api_token'"); } catch (_) {}
        if (tRec) {
          tRec.set("value", passedToken);
          $app.save(tRec);
        } else {
          const sCol = $app.findCollectionByNameOrId("settings");
          const nRec = new Record(sCol);
          nRec.set("key", "matias_api_token");
          nRec.set("value", passedToken);
          $app.save(nRec);
        }
      }
      if (passedEnv) {
        let eRec = null;
        try { eRec = $app.findFirstRecordByFilter("settings", "key = 'matias_environment'"); } catch (_) {}
        if (eRec) {
          eRec.set("value", passedEnv);
          $app.save(eRec);
        } else {
          const sCol = $app.findCollectionByNameOrId("settings");
          const nRec = new Record(sCol);
          nRec.set("key", "matias_environment");
          nRec.set("value", passedEnv);
          $app.save(nRec);
        }
      }
      if (passedClientUuid !== "") {
        let uRec = null;
        try { uRec = $app.findFirstRecordByFilter("settings", "key = 'matias_client_uuid'"); } catch (_) {}
        if (uRec) {
          uRec.set("value", passedClientUuid);
          $app.save(uRec);
        } else {
          const sCol = $app.findCollectionByNameOrId("settings");
          const nRec = new Record(sCol);
          nRec.set("key", "matias_client_uuid");
          nRec.set("value", passedClientUuid);
          $app.save(nRec);
        }
      }
    } catch (setErr) {
      console.warn("[GRAVY HOOK] Advertencia auto-guardando configuración de MATIAS:", setErr);
    }

    // Extraer registros tolerando diferentes formatos de respuesta
    const rawData = res.data;
    const records = rawData?.dataRecords?.data || rawData?.data || rawData?.records || rawData?.resolutions || (Array.isArray(rawData) ? rawData : []);
    const synced = [];

    // Mapeo normativo DIAN estricto
    // 7: Factura Electrónica (FV), 20: POS Electrónico (POS), 11: Documento Soporte (DS), 13: Nómina Electrónica (NE)
    const typeMapping = {
      7: 'FV',
      20: 'POS',
      11: 'DS',
      13: 'NE'
    };

    const typeCol = $app.findCollectionByNameOrId("dian_resolutions");

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const docType = typeMapping[r.type_document_id] || (r.type_document_id === 1 ? 'FV' : null);
      if (!docType) continue;

      let existing = null;
      try {
        existing = $app.findFirstRecordByFilter("dian_resolutions", "document_type = '" + docType + "'");
      } catch (_) {
        try {
          existing = $app.findFirstRecordByFilter("dian_resolutions", "prefix = '" + (r.prefix || '').replace(/'/g, "''") + "'");
        } catch (_2) {}
      }

      const rec = existing || new Record(typeCol);
      rec.set("document_type", docType);
      rec.set("prefix", r.prefix || "");
      rec.set("resolution_number", String(r.resolution_number || r.number || ""));
      rec.set("number_from", parseInt(r.range_from || r.from || 1, 10));
      rec.set("number_to", parseInt(r.range_up || r.to || 10000, 10));
      if (!existing) {
        rec.set("current_number", parseInt(r.range_from || r.from || 1, 10));
      }
      rec.set("active", r.active == 1 || r.state == 1 || r.status === "active" || r.status === true);
      if (r.date_from || r.start_date) rec.set("resolution_date", r.date_from || r.start_date);
      if (r.date_up || r.end_date) rec.set("expiration_date", r.date_up || r.end_date);
      if (r.technical_key) rec.set("technical_key", r.technical_key);

      $app.save(rec);
      synced.push({
        type: docType,
        prefix: r.prefix || "Sin prefijo",
        resolution: r.resolution_number || r.number || "N/A",
        from: r.range_from || r.from || 1,
        to: r.range_up || r.to || 10000,
        expiration: r.date_up || r.end_date || "Vigente"
      });
    }

    return e.json(200, {
      success: true,
      count: synced.length,
      synced: synced,
      message: synced.length > 0
        ? `Se sincronizaron exitosamente ${synced.length} resoluciones desde MATIAS API.`
        : "MATIAS API respondió correctamente pero no se encontraron resoluciones activas asociadas a este ambiente/token."
    });
  } catch (err) {
    console.error("[GRAVY HOOK] Error en /api/dian/sync-matias-resolutions:", err);
    return e.json(500, { success: false, message: "Error al sincronizar resoluciones: " + err.message });
  }
});



