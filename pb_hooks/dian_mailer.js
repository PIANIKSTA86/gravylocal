/**
 * GRAVY DIAN Mailer Module (dian_mailer.js)
 * Sistema Unificado de Mensajería Electrónica (DIAN Colombia)
 * Compatible con Goja Runtime de PocketBase via require(`${__hooks}/dian_mailer.js`)
 */

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

function syncSmtpSettings() {
  const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
  try {
    const pbSettings = $app.settings();
    if (smtpEnabled) {
      const host = getSetting("smtp_host", "");
      const port = parseInt(getSetting("smtp_port", "587"), 10);
      const user = getSetting("smtp_username", "");
      const pass = String(getSetting("smtp_password", "")).replace(/\s+/g, "");
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
}

function sendInvoiceEmailHelper(txId, customEmail) {
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
    $app.expandRecord(tx, ["third_party_id", "tx_type_id"], null);
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
    const docNumber = tx.getString("number") || "Documento";

    const txType = tx.expandedOne("tx_type_id");
    const txTypeCode = txType ? (txType.getString("code") || "").toUpperCase() : "";
    const txTypeName = txType ? (txType.getString("name") || "").toUpperCase() : "";

    let isPurchase = false;
    let isSupportDoc = false;
    let isSupportDocAdjustment = false;
    let docTypeCode = "01";
    let docTitle = "Factura Electrónica de Venta";
    let recipientLabel = "cliente";

    if (txTypeCode === "DS" || txTypeName.includes("DOCUMENTO SOPORTE") || docNumber.startsWith("DS")) {
      isSupportDoc = true;
      isPurchase = true;
      docTypeCode = "05";
      docTitle = "Documento Soporte Electrónico";
      recipientLabel = "proveedor / contratista";
    } else if (txTypeCode === "NDS" || txTypeCode === "NAS" || txTypeName.includes("AJUSTE A DOCUMENTO SOPORTE") || txTypeName.includes("AJUSTE CREDITO A DOCUMENTO SOPORTE") || docNumber.startsWith("NDS") || docNumber.startsWith("NAS")) {
      isSupportDocAdjustment = true;
      isPurchase = true;
      docTypeCode = "95";
      docTitle = "Nota de Ajuste a Documento Soporte";
      recipientLabel = "proveedor / contratista";
    } else if (txTypeCode === "ND" || docNumber.startsWith("ND")) {
      docTypeCode = "02";
      docTitle = "Nota Débito Electrónica";
      recipientLabel = "cliente";
    } else if (txTypeCode === "NC" || docNumber.startsWith("NC")) {
      docTypeCode = "03";
      docTitle = "Nota Crédito Electrónica";
      recipientLabel = "cliente";
    } else if (txTypeCode === "FC") {
      isPurchase = true;
    }

    let badgeText = "Documento Oficial DIAN";
    let badgeBg = "#E0F2FE";
    let badgeColor = "#0369A1";
    if (docTypeCode === "05") {
      badgeText = "Documento Soporte DIAN";
      badgeBg = "#FEF3C7";
      badgeColor = "#92400E";
    } else if (docTypeCode === "95") {
      badgeText = "Ajuste a Documento Soporte";
      badgeBg = "#FEE2E2";
      badgeColor = "#991B1B";
    } else if (docTypeCode === "03") {
      badgeText = "Nota Crédito DIAN";
      badgeBg = "#F3E8FF";
      badgeColor = "#6B21A8";
    } else if (docTypeCode === "02") {
      badgeText = "Nota Débito DIAN";
      badgeBg = "#FFEDD5";
      badgeColor = "#9A3412";
    } else if (docTypeCode === "01") {
      badgeText = "Factura Electrónica DIAN";
      badgeBg = "#E0F2FE";
      badgeColor = "#0369A1";
    }

    let totalVal = 0;
    try {
      const invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      totalVal = invRec.getFloat("total") || 0;
    } catch (_) {
      try {
        const purRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
        totalVal = purRec.getFloat("total") || 0;
        isPurchase = true;
      } catch (_2) {}
    }
    const fmtTotal = "$ " + Math.round(totalVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const companyNitRaw = getSetting("company_nit", "900123456");
    const companyNit = companyNitRaw.split('-')[0].replace(/[^0-9]/g, '');
    const commercialName = getSetting("company_name", "GRAVY S.A.S");
    
    // Formato obligatorio DIAN: NitEmisor;NombreEmisor;NumDoc;TipoDoc;NombreComercial;
    const emailSubject = `${companyNit};${companyName};${docNumber};${docTypeCode};${commercialName};`;

    const einvoiceMethod = getSetting("einvoice_method", "dian");
    let integrationComment = "";
    if (einvoiceMethod === "facturatech") {
      integrationComment = "La integración de datos es realizada por proveedor tecnológico CADENA S.A. / NIT. 890.930.534-0";
    } else {
      integrationComment = "La integración de datos es realizada directamente por la UAE DIAN bajo la modalidad de software propio a nombre del emisor de este documento electrónico";
    }

    let invoiceData = null;
    try {
      let invRec = null;
      try {
        invRec = $app.findFirstRecordByFilter("invoices", "tx_id = '" + txId + "'");
      } catch (_) {
        try {
          invRec = $app.findFirstRecordByFilter("purchase_invoices", "tx_id = '" + txId + "'");
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

        const customerName = sanitizeName(customer ? customer.getString("name") : (isSupportDoc ? "Proveedor / Contratista" : "Consumidor Final"));
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

        let resName = docTitle;
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
        let docTypeResolution = invRec.getString("pos_shift_id") ? "POS" : (isSupportDoc ? "DS" : "FV");
        
        try {
          const registerId = invRec.getString("pos_shift_id") ? ($app.findRecordById("pos_shifts", invRec.getString("pos_shift_id")).getString("pos_register_id") || "") : "";
          let filter = "document_type=\"" + docTypeResolution + "\" && active=true";
          let resList = [];
          if (registerId && docTypeResolution === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\"" + registerId + "\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docTypeResolution === "POS") {
              fallbackFilter += " && pos_register_id=\"\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\"" + prefix + "\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\"" + docTypeResolution + "\" && active=true");
          }
          if (resList.length) {
            const parts = docNumber.split('-');
            const invNum = parseInt(parts[parts.length - 1], 10) || 0;
            let resolution = resList.find(r => invNum >= r.getInt("number_from") && invNum <= r.getInt("number_to"));
            if (!resolution) {
              resolution = resList.find(r => r.getBool("active")) || resList[0];
            }
            if (resolution) {
              resName = resolution.getString("name") || docTitle;
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
    
    const fromAddr = getSetting("smtp_sender_address", "") || getSetting("smtp_username", "") || companyEmail;
    const fromName = getSetting("smtp_sender_name", "") || companyName;

    const cufeLabel = (isSupportDoc || isSupportDocAdjustment || docTypeCode === '02' || docTypeCode === '03') ? "CUDE" : "CUFE";
    const cufeValue = docRecord.getString("cufe") || 'N/A';
    const recipientName = sanitizeName(customer ? customer.getString("name") : (isSupportDoc ? "Proveedor / Contratista" : "Consumidor Final"));

    const message = new MailerMessage({
      from: {
        address: fromAddr,
        name: fromName
      },
      to: [{ address: custEmail }],
      subject: emailSubject,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
              <tr>
                <td align="center" style="vertical-align: middle;">
                  <img src="cid:gravy-logo.png" alt="GRAVY" width="48" height="48" style="height: 48px; width: 48px; display: block; margin: 0 auto; border: 0; outline: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-weight: 800; color: #7C3AED; font-size: 18px;" />
                </td>
              </tr>
            </table>
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                ${badgeText}
              </span>
            </div>
            
            <h2 style="color: #0F172A; font-size: 22px; font-weight: 800; text-align: center; margin-top: 12px; margin-bottom: 8px;">
              ¡Su ${docTitle} está disponible!
            </h2>
            <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
              Emitido por <strong>${companyName}</strong>
            </p>
            
            <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
              <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
                Estimado(a) ${recipientLabel} <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
                Adjunto en este correo encontrará el archivo comprimido <strong>ZIP</strong> que contiene el XML firmado con validación DIAN y la representación gráfica en formato PDF correspondientes a: <strong>${docTitle} No. ${docNumber}</strong>.
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
                <td style="padding: 10px 0; color: #64748B; vertical-align: top;">${cufeLabel}:</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                  ${cufeValue}
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

    message.attachments = attachments;

    const inlineAttachments = {};
    const cleanHooks = String(typeof __hooks !== "undefined" ? __hooks : "").replace(/\\/g, "/");
    const candidateLogoPaths = [
      cleanHooks + "/assets/gravy-logo.png",
      cleanHooks + "/../../../pb_public/assets/gravy-logo-email.png",
      cleanHooks + "/../../../pb_public/assets/gravy-logo.png",
      cleanHooks + "/../../pb_public/assets/gravy-logo.png",
      cleanHooks + "/../pb_public/assets/gravy-logo.png",
      "C:/Users/JULIAN/Desktop/GravyLocalTABS/pb_public/assets/gravy-logo-email.png",
      "C:/Users/JULIAN/Desktop/GravyLocalTABS/pb_public/assets/gravy-logo.png",
      "pb_public/assets/gravy-logo.png"
    ];

    for (let i = 0; i < candidateLogoPaths.length; i++) {
      try {
        const logoFile = $filesystem.fileFromPath(candidateLogoPaths[i]);
        if (logoFile && logoFile.size > 0) {
          inlineAttachments["gravy-logo.png"] = logoFile.reader.open();
          console.log("[GRAVY HOOK] Logo inline embebido con éxito desde:", candidateLogoPaths[i]);
          break;
        }
      } catch (_) {}
    }

    if (Object.keys(inlineAttachments).length > 0) {
      message.inlineAttachments = inlineAttachments;
    }
    
    $app.newMailClient().send(message);
    console.log("[GRAVY HOOK] Correo enviado exitosamente a:", custEmail);
    return true;
  } catch (err) {
    console.error("[GRAVY HOOK] Falló al enviar correo en helper:", err);
    throw err;
  }
}

module.exports = {
  sanitizeName,
  getSetting,
  syncSmtpSettings,
  sendInvoiceEmailHelper
};

