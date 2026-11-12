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
      } catch (_2) { }
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
        } catch (_2) { }
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
          } catch (_) { }
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
        } catch (_) { }

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
      } catch (_) { }
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


function formatNumeroALetras(num) {
  const tempNum = parseFloat(String(num || 0)).toFixed(2).split('.');
  const entero = parseInt(tempNum[0], 10);
  const centavos = tempNum[1];
  if (entero === 0) return 'CERO PESOS M/CTE CON ' + centavos + '/100';

  function letras(n) {
    if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
    if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
    if (n < 30) return n === 20 ? 'Veinte' : 'Veinti' + letras(n - 20).toLowerCase();
    if (n < 100) {
      const u = n % 10;
      const d = Math.floor(n / 10);
      const decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
      return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
    }
    if (n < 1000) {
      const d_u = n % 100;
      const c = Math.floor(n / 100);
      const centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
      if (n === 100) return 'Cien';
      if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
      return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
    }
    if (n < 1000000) {
      const mil = Math.floor(n / 1000);
      const resto = n % 1000;
      const t = mil === 1 ? 'Mil' : letras(mil) + ' mil';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    if (n < 1000000000) {
      const millon = Math.floor(n / 1000000);
      const resto = n % 1000000;
      const t = millon === 1 ? 'Un millón' : letras(millon) + ' millones';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    return String(n);
  }

  return (letras(entero) + ' PESOS M/CTE CON ' + centavos + '/100').toUpperCase();
}

function buildNominaPayrollPayload(rec) {
  const prefijo = rec.getString("prefijo") || "NOM";
  const consecutivo = rec.getInt("consecutivo") || 1;
  const docNumber = `${prefijo}-${consecutivo}`;
  const cune = rec.getString("cufe") || "—";
  const xmlGenerado = rec.getString("xml_generado") || "";
  const totalDevengos = rec.getFloat("total_devengos") || 0;
  const totalDeducciones = rec.getFloat("total_deducciones") || 0;
  const totalNeto = rec.getFloat("total_neto") || (totalDevengos - totalDeducciones);

  let emp = null;
  const empId = rec.getString("employee_id");
  if (empId) {
    try { emp = $app.findRecordById("third_parties", empId); } catch (_) { }
    if (!emp) {
      try { emp = $app.findRecordById("employees", empId); } catch (_) { }
    }
  }

  let empRule = {};
  if (emp) {
    try {
      const parts = $app.findRecordsByFilter("settings", "key ~ 'payroll_accounting_config_v1_employee_rules'");
      if (parts && parts.length > 0) {
        let allRulesJson = "";
        parts.forEach((p) => { allRulesJson += (p.getString("value") || ""); });
        const parsedRules = JSON.parse(allRulesJson);
        const found = parsedRules.find((r) => r.employee_id === emp.id);
        if (found) empRule = found;
      }
    } catch (_) { }
  }

  const formatPaymentMethod = function (m) {
    const str = String(m || '').trim();
    const code = (str.match(/\d+/) || [str])[0];
    const methods = {
      '10': '10 - Efectivo',
      '42': '42 - Consignación Bancaria',
      '30': '30 - Transferencia ACH',
      '47': '47 - Transferencia Débito Bancaria',
      '20': '20 - Cheque',
      '48': '48 - Tarjeta Crédito',
      '49': '49 - Tarjeta Débito',
      '1': '01 - Instrumento no definido'
    };
    if (methods[code]) return methods[code];
    if (str.length > 3) return str;
    return str ? (str + ' - Transferencia Bancaria') : '42 - Consignación Bancaria';
  };

  const resolveThirdName = (id) => {
    if (!id) return "";
    try {
      const t = $app.findRecordById("third_parties", id);
      return t ? (t.getString("name") || t.getString("commercial_name") || "") : "";
    } catch (_) {
      return "";
    }
  };

  const epsName = resolveThirdName(empRule.tercero_salud_id);
  const afpName = resolveThirdName(empRule.tercero_pension_id);
  const arlName = resolveThirdName(empRule.tercero_arl_id);
  const cajaName = resolveThirdName(empRule.tercero_caja_id);

  const arlRates = { 1: "0.522%", 2: "1.044%", 3: "2.436%", 4: "4.350%", 5: "6.960%" };
  const arlRiskLevel = empRule.arl_risk_level || 1;
  const arlRate = arlRates[arlRiskLevel] || "0.522%";

  let empName = "";
  let empDoc = "";
  let empAddress = "";
  let empCityDept = "";
  let empPhone = "";
  let empEmail = "";

  if (emp) {
    const fName = (emp.getString("first_name") || "").trim();
    const lName = (emp.getString("last_name") || "").trim();
    empName = (fName && lName) ? `${fName} ${lName}` : (emp.getString("name") || emp.getString("commercial_name") || "Colaborador");
    empDoc = emp.getString("doc_number") || "";
    empAddress = emp.getString("address") || "";
    const city = emp.getString("city") || "";
    const dept = emp.getString("department") || "";
    empCityDept = (city && dept) ? `${city}, ${dept}` : (city || dept || "");
    empPhone = emp.getString("phone") || emp.getString("phone2") || emp.getString("contact_phone") || "";
    empEmail = emp.getString("email") || emp.getString("email2") || "";
  }

  if (!empName) {
    const mPName = (xmlGenerado.match(/PrimerNombre="([^"]*)"/i) || [])[1] || "";
    const mSName = (xmlGenerado.match(/SegundoNombre="([^"]*)"/i) || [])[1] || "";
    const mPApellido = (xmlGenerado.match(/PrimerApellido="([^"]*)"/i) || [])[1] || "";
    const mSApellido = (xmlGenerado.match(/SegundoApellido="([^"]*)"/i) || [])[1] || "";
    const full = [mPName, mSName, mPApellido, mSApellido].filter(Boolean).join(" ");
    empName = full || "Colaborador";
  }
  if (!empDoc) {
    empDoc = (xmlGenerado.match(/NumeroDocumento="([^"]*)"/i) || [])[1] || "";
  }
  if (!empAddress) {
    empAddress = (xmlGenerado.match(/LugarTrabajoDireccion="([^"]*)"/i) || [])[1] || "";
  }

  const fIngreso = empRule.start_date || (xmlGenerado.match(/FechaIngreso="([^"]*)"/i) || [])[1] || (emp ? (emp.getString("date_hired") || emp.getString("hire_date")) : "") || "";

  let fRetiro = empRule.end_date || empRule.retirement_date || (xmlGenerado.match(/FechaRetiro="([^"]*)"/i) || [])[1] || "";
  if (!fRetiro && emp) {
    try {
      const sett = $app.findFirstRecordByFilter("payroll_settlements", "employee_id = '" + emp.id + "'");
      if (sett) {
        fRetiro = sett.getString("settlement_date") || "";
      }
    } catch (_) { }
  }

  const cargo = empRule.position || (emp ? (emp.getString("cargo") || emp.getString("notes") || "") : "") || "Colaborador";

  let predNumber = "";
  let predCune = "";
  let predDate = "";
  let payrollType = "";
  if (xmlGenerado.trim().startsWith('{')) {
    try {
      const jx = JSON.parse(xmlGenerado);
      payrollType = jx.payroll_type || "";
      const p = jx.deleting_predecessor || jx.replacing_predecessor || jx.relevant_predecessor;
      if (p) {
        predNumber = p.number || p.document_number || "";
        predCune = p.cune || "";
        predDate = p.generation_date || "";
      }
    } catch (_) {}
  }

  const recAno = rec.getInt("ano") || 2026;
  const recMes = rec.getInt("mes") || 9;
  const recMesStr = String(recMes).padStart(2, "0");

  return {
    companyName: getSetting("company_name", "DOMESTIKO SAS"),
    companyNit: getSetting("company_nit", "901428834"),
    companyAddress: getSetting("company_address", ""),
    empName: empName,
    empDoc: empDoc,
    empAddress: empAddress,
    empCityDept: empCityDept,
    empPhone: empPhone,
    empEmail: empEmail,
    cargo: cargo,
    costCenter: emp ? (emp.getString("cost_center") || "General / Colaboradores") : "General / Colaboradores",
    basicSalary: empRule.basic_salary || (emp ? emp.getFloat("salary_base") : 0) || totalDevengos || 0,
    bankName: emp ? (emp.getString("bank_name") || "") : "",
    bankAccountType: emp ? (emp.getString("bank_account_type") || "Ahorros") : "Ahorros",
    bankAccount: emp ? (emp.getString("bank_account") || "") : "",
    dateHired: fIngreso,
    startDate: fIngreso,
    fIngreso: fIngreso,
    dateEnd: fRetiro,
    retirementDate: fRetiro,
    paymentMethod: formatPaymentMethod(emp ? emp.getString("payment_method") : "42"),
    healthEntity: epsName || (emp ? emp.getString("eps") : "") || "No asignada",
    pensionEntity: afpName || (empRule.is_pensioner ? "Pensionado (Exento)" : (emp ? emp.getString("afp") : "")) || "No asignada",
    arlEntity: arlName ? `${arlName} - Riesgo ${arlRiskLevel} (${arlRate})` : ((emp ? emp.getString("arl") : "") || "No asignada"),
    cajaEntity: cajaName || (emp ? emp.getString("caja_compensacion") : "") || "No asignada",
    fechasPago: rec.getString("fecha_envio")?.slice(0, 10) || `${recAno}-${recMesStr}-30`,
    issueDate: rec.getString("fecha_envio") || new Date().toISOString().replace('T', ' ').slice(0, 19),
    cune: cune,
    totalDevengos: totalDevengos,
    totalDeducciones: totalDeducciones,
    totalNeto: totalNeto,
    valorEnLetras: formatNumeroALetras(totalNeto),
    ano: recAno,
    mes: recMes,
    settlementStartDate: `${recAno}-${recMesStr}-01`,
    settlementEndDate: `${recAno}-${recMesStr}-30`,
    predecessorNumber: predNumber,
    predecessorCune: predCune,
    predecessorDate: predDate,
    payrollType: payrollType
  };
}

module.exports = {
  sanitizeName,
  getSetting,
  syncSmtpSettings,
  sendInvoiceEmailHelper,
  formatNumeroALetras,
  buildNominaPayrollPayload
};

