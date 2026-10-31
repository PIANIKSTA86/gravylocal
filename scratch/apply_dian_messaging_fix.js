const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('pb_hooks', 'dian.pb.js');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Check existing position
const routerEmitIdx = content.indexOf("routerAdd('POST', '/api/dian/emit'");
if (routerEmitIdx === -1) {
  console.error("Could not find routerAdd('POST', '/api/dian/emit'");
  process.exit(1);
}

// 2. Define top-level helpers
const topLevelHelpers = `
function syncSmtpSettings() {
  const smtpEnabled = getSetting("smtp_enabled", "0") === "1";
  try {
    const pbSettings = $app.settings();
    if (smtpEnabled) {
      const host = getSetting("smtp_host", "");
      const port = parseInt(getSetting("smtp_port", "587"), 10);
      const user = getSetting("smtp_username", "");
      const pass = String(getSetting("smtp_password", "")).replace(/\\s+/g, "");
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
globalThis.syncSmtpSettings = syncSmtpSettings;

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
  if (/^\\d{2}$/.test(t)) return t;
  return '13';
}
globalThis.mapDocType = mapDocType;

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
    } else if (txTypeCode === "NDS" || txTypeCode === "NAS" || txTypeName.includes("AJUSTE A DOCUMENTO SOPORTE") || txTypeName.includes("AJUSTE CREDITO A DOCUMENTO SOPORTE")) {
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
    const fmtTotal = "$ " + Math.round(totalVal).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");

    const companyNitRaw = getSetting("company_nit", "900123456");
    const companyNit = companyNitRaw.split('-')[0].replace(/[^0-9]/g, '');
    const commercialName = getSetting("company_name", "GRAVY S.A.S");
    
    // Formato obligatorio DIAN: NitEmisor;NombreEmisor;NumDoc;TipoDoc;NombreComercial;
    const emailSubject = \`\${companyNit};\${companyName};\${docNumber};\${docTypeCode};\${commercialName};\`;

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
          let filter = "document_type=\\"" + docTypeResolution + "\\" && active=true";
          let resList = [];
          if (registerId && docTypeResolution === "POS") {
            resList = $app.findRecordsByFilter("dian_resolutions", filter + " && pos_register_id=\\"" + registerId + "\\"");
          }
          if (!resList.length) {
            let fallbackFilter = filter;
            if (docTypeResolution === "POS") {
              fallbackFilter += " && pos_register_id=\\"\\"";
            }
            if (prefix) {
              fallbackFilter += " && prefix=\\"" + prefix + "\\"";
            }
            resList = $app.findRecordsByFilter("dian_resolutions", fallbackFilter);
          }
          if (!resList.length) {
            resList = $app.findRecordsByFilter("dian_resolutions", "document_type=\\"" + docTypeResolution + "\\" && active=true");
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
      html: \`
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
              ¡Su \${docTitle} está listo(a)!
            </h2>
            <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
              Emitido por <strong>\${companyName}</strong>
            </p>
            
            <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
              <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
                Estimado(a) \${recipientLabel} <strong>\${recipientName}</strong>,
              </p>
              <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
                Adjunto en este correo encontrará el archivo comprimido <strong>ZIP</strong> que contiene el XML firmado con validación DIAN y la representación gráfica en formato PDF correspondientes a: <strong>\${docTitle} No. \${docNumber}</strong>.
              </p>
            </div>
            
            <h3 style="color: #0F172A; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
              Detalles del Documento
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Número de Documento:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9;">\${docNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Fecha de Emisión:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A; border-bottom: 1px solid #F1F5F9;">\${tx.getString("date")}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Monto Total:</td>
                <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284C7; border-bottom: 1px solid #F1F5F9;">\${fmtTotal}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748B; vertical-align: top;">\${cufeLabel}:</td>
                <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                  \${cufeValue}
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
              \${integrationComment}
            </p>
            <p style="font-size: 10px; color: #CBD5E1; margin-top: 12px; margin-bottom: 0;">
              Este es un mensaje automático generado por GRAVY. Por favor no responda a este correo.
            </p>
          </div>
        </div>
      \`,
    });
    
    const attachments = {};
    if (zipPath) {
      try {
        const zipFile = $filesystem.fileFromPath(zipPath);
        attachments[\`\${zipBasenameForEmail}.zip\`] = zipFile.reader.open();
      } catch (zipErr) {
        console.error("[GRAVY HOOK] No se pudo abrir el archivo ZIP generado:", zipErr);
        const xmlFile = $filesystem.fileFromBytes(xmlContent, \`\${zipBasenameForEmail}.xml\`);
        attachments[\`\${zipBasenameForEmail}.xml\`] = xmlFile.reader.open();
      }
    } else {
      const xmlFile = $filesystem.fileFromBytes(xmlContent, \`\${zipBasenameForEmail}.xml\`);
      attachments[\`\${zipBasenameForEmail}.xml\`] = xmlFile.reader.open();
    }

    try {
      const logoFile = $filesystem.fileFromPath("pb_public/assets/gravy-logo.png");
      attachments["gravy-logo.png"] = logoFile.reader.open();
    } catch (logoErr) {
      console.warn("[GRAVY HOOK] No se pudo adjuntar el logo de GRAVY:", logoErr);
    }
    
    message.attachments = attachments;
    
    $app.newMailClient().send(message);
    console.log("[GRAVY HOOK] Correo enviado exitosamente a:", custEmail);
    return true;
  } catch (err) {
    console.error("[GRAVY HOOK] Falló al enviar correo en helper:", err);
    throw err;
  }
}
globalThis.sendInvoiceEmailHelper = sendInvoiceEmailHelper;
`;

// Insert top-level helpers right before routerEmitIdx
const beforeEmit = content.slice(0, routerEmitIdx);
const afterEmit = content.slice(routerEmitIdx);

// Inside routerAdd('POST', '/api/dian/emit', remove the duplicate sendInvoiceEmailHelper
const helperInEmit = "function sendInvoiceEmailHelper(txId, customEmail) {";
const helperIdx = afterEmit.indexOf(helperInEmit);
if (helperIdx === -1) {
  console.error("Could not find helper inside emit");
  process.exit(1);
}

// Find end of helper inside emit
let depth = 0;
let helperEnd = -1;
for (let i = helperIdx; i < afterEmit.length; i++) {
  if (afterEmit[i] === '{') depth++;
  else if (afterEmit[i] === '}') {
    depth--;
    if (depth === 0) {
      helperEnd = i + 1;
      break;
    }
  }
}

if (helperEnd === -1) {
  console.error("Could not find end of helper inside emit");
  process.exit(1);
}

// Remove the helper from inside emit
const cleanedAfterEmit = afterEmit.slice(0, helperIdx) + afterEmit.slice(helperEnd);

// Combine new content
let finalContent = beforeEmit + topLevelHelpers + "\n\n" + cleanedAfterEmit;

// Now let's update routerAdd('POST', '/api/dian/nomina/resend-email' in finalContent
const nominaResendStart = "routerAdd('POST', '/api/dian/nomina/resend-email', (e) => {";
const nextRoute = "routerAdd('POST', '/api/dian/nomina/download-pdf'";
const nominaIdx = finalContent.indexOf(nominaResendStart);
const nextRouteIdx = finalContent.indexOf(nextRoute);

if (nominaIdx !== -1 && nextRouteIdx !== -1) {
  const updatedNominaHandler = `routerAdd('POST', '/api/dian/nomina/resend-email', (e) => {
  try {
    const body = e.requestInfo().body || {};
    const email = (body.email || '').trim();
    if (!email) {
      return e.json(400, { message: "Debe ingresar un correo electrónico válido." });
    }

    const recordId = body.id || body.electronicPayrollId;
    const rec = recordId ? $app.findRecordById("electronic_payrolls", recordId) : null;
    if (!rec) {
      return e.json(404, { message: "Registro de nómina electrónica no encontrado." });
    }

    try {
      syncSmtpSettings();
    } catch (eSync) {
      console.warn("[GRAVY] Error syncing SMTP for payroll:", eSync);
    }

    let companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyEmail = getSetting("company_email", "noreply@gravy.com");
    const fromAddr = getSetting("smtp_sender_address", "") || getSetting("smtp_username", "") || companyEmail;
    const fromName = getSetting("smtp_sender_name", "") || companyName;

    const prefijo = rec.getString("prefijo") || "NOM";
    const consecutivo = rec.getInt("consecutivo") || 1;
    const docNumber = \`\${prefijo}-\${consecutivo}\`;
    const cune = rec.getString("cufe") || "Registrado en el portal DIAN";

    let empName = "Colaborador";
    try {
      const empId = rec.getString("employee_id");
      if (empId) {
        const empRec = $app.findRecordById("employees", empId);
        empName = empRec ? (empRec.getString("name") || empRec.getString("first_name") || "Colaborador") : "Colaborador";
      }
    } catch (_) {}

    const totalDevengos = rec.getFloat("total_devengos") || 0;
    const totalDeducciones = rec.getFloat("total_deducciones") || 0;
    const totalNeto = rec.getFloat("total_neto") || (totalDevengos - totalDeducciones);
    const fmtNeto = "$ " + Math.round(totalNeto).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");

    const subject = \`Comprobante de Nómina Electrónica \${docNumber} — \${companyName}\`;
    const htmlBody = \`
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="cid:gravy-logo.png" alt="GRAVY Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="background-color: #DCFCE7; color: #166534; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
              Nómina Oficial DIAN
            </span>
          </div>
          <h2 style="color: #0F172A; font-size: 22px; font-weight: 800; text-align: center; margin-top: 12px; margin-bottom: 8px;">
            Comprobante de Nómina Electrónica
          </h2>
          <p style="text-align: center; color: #64748B; font-size: 14px; margin-top: 0; margin-bottom: 28px;">
            Emitido por <strong>\${companyName}</strong>
          </p>
          <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #F1F5F9; margin-bottom: 28px;">
            <p style="font-size: 14px; margin: 0 0 12px 0; color: #475569;">
              Estimado(a) colaborador(a) <strong>\${empName}</strong>,
            </p>
            <p style="font-size: 14px; margin: 0; line-height: 1.6; color: #475569;">
              Adjunto a este mensaje encontrará su comprobante formal de nómina electrónica correspondiente al consecutivo <strong>\${docNumber}</strong> procesado y validado ante la DIAN.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 28px;">
            <tr>
              <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Documento:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A; border-bottom: 1px solid #F1F5F9;">\${docNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Estado DIAN:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #16A34A; border-bottom: 1px solid #F1F5F9;">\${rec.getString("estado_dian") || "APROBADO"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748B; border-bottom: 1px solid #F1F5F9;">Neto Pagado:</td>
              <td style="padding: 10px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284C7; border-bottom: 1px solid #F1F5F9;">\${fmtNeto}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748B; vertical-align: top;">CUNE:</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px; word-break: break-all; color: #475569; max-width: 200px;">
                \${cune}
              </td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #64748B; text-align: center; margin: 0;">
            Para consultas sobre su liquidación, comuníquese con el departamento de Gestión Humana.
          </p>
        </div>
        <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
          <p style="font-size: 10px; color: #CBD5E1; margin: 0;">
            Mensaje generado automáticamente por el sistema contable GRAVY. Por favor no responda a este correo.
          </p>
        </div>
      </div>
    \`;

    const message = new MailerMessage({
      from: {
        address: fromAddr,
        name: fromName
      },
      to: [{ address: email }],
      subject: subject,
      html: htmlBody
    });

    const attachments = {};
    const xmlGenerado = rec.getString("xml_generado");
    if (xmlGenerado) {
      const xmlFile = $filesystem.fileFromBytes(xmlGenerado, \`Nomina_\${docNumber}.xml\`);
      attachments[\`Nomina_\${docNumber}.xml\`] = xmlFile.reader.open();
    }
    const pdfB64 = rec.getString("pdf_base64");
    if (pdfB64) {
      try {
        const pdfFile = $filesystem.fileFromBytes(pdfB64, \`Nomina_\${docNumber}.pdf\`);
        attachments[\`Nomina_\${docNumber}.pdf\`] = pdfFile.reader.open();
      } catch (_) {}
    }
    try {
      const logoFile = $filesystem.fileFromPath("pb_public/assets/gravy-logo.png");
      attachments["gravy-logo.png"] = logoFile.reader.open();
    } catch (_) {}

    message.attachments = attachments;

    $app.newMailClient().send(message);
    return e.json(200, { success: true, message: \`Correo de comprobante de nómina enviado exitosamente a \${email}\` });
  } catch (err) {
    console.error("[GRAVY HOOK] Error al enviar email de nómina:", err);
    return e.json(500, { message: "Error al enviar correo de nómina: " + err.message });
  }
});

`;

  finalContent = finalContent.slice(0, nominaIdx) + updatedNominaHandler + "\n\n" + finalContent.slice(nextRouteIdx);
}

fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("[+] Successfully updated pb_hooks/dian.pb.js");
