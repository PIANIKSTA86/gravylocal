/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — ph_email.pb.js
 * Endpoints HTTP para el envío de facturas y estados de cuenta en módulo Copropiedades.
 * Formato adaptado al modelo de referencia estadoCuenta.pdf.
 */

// Helper local para obtener configuración
function getSetting(key, fallback) {
  try {
    const r = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
    return r.get("value") || fallback;
  } catch (_) {
    return fallback;
  }
}

// Formateador de moneda en pesos colombianos (COP)
function fmtCurrency(value) {
  if (value === undefined || value === null) return "$ 0";
  return "$ " + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Formateador de periodo YYYY-MM a nombre del mes en mayúsculas
function getMonthNameUpper(p) {
  if (!p) return '—';
  const parts = String(p).split('-');
  const m = parseInt(parts[1], 10) || 1;
  const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  return months[m - 1] || '';
}

// Helper de números a letras en español
function numeroALetras(num) {
  var tempNum = parseFloat(String(num)).toFixed(2).split('.');
  var entero = parseInt(tempNum[0], 10);
  var centavos = tempNum[1];
  
  if (entero === 0) return ('Son: Cero PESOS ' + centavos + '/100').toUpperCase();
  
  function letras(n) {
    if (n < 10) {
      return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
    }
    if (n < 20) {
      return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
    }
    if (n < 30) {
      if (n === 20) return 'Veinte';
      return 'Veinti' + letras(n - 20).toLowerCase();
    }
    if (n < 100) {
      var u = n % 10;
      var d = Math.floor(n / 10);
      var decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
      return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
    }
    if (n < 1000) {
      var d_u = n % 100;
      var c = Math.floor(n / 100);
      var centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
      if (n === 100) return 'Cien';
      if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
      return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
    }
    if (n < 1000000) {
      var mil = Math.floor(n / 1000);
      var resto = n % 1000;
      var t = '';
      if (mil === 1) t = 'Mil';
      else t = letras(mil) + ' mil';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    if (n < 1000000000) {
      var millon = Math.floor(n / 1000000);
      var resto = n % 1000000;
      var t = '';
      if (millon === 1) t = 'Un millón';
      else t = letras(millon) + ' millones';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    return '';
  }
  
  var res = letras(entero);
  res = res.charAt(0).toUpperCase() + res.slice(1);
  return ('Son: ' + res + ' PESOS ' + centavos + '/100').toUpperCase();
}

// Formateador sin el signo de pesos en el backend
function cleanFmt(value) {
  if (value === undefined || value === null) return "0.00";
  var parts = parseFloat(value).toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
}

// Sincronizador de configuración SMTP local con la global de PocketBase
function syncSmtpSettings() {
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
      pbSettings.meta.senderName = senderName || getSetting("company_name", "GRAVY S.A.S");
      pbSettings.meta.senderAddress = senderAddr || user;
    } else {
      pbSettings.smtp.enabled = false;
    }
    $app.saveSettings(pbSettings);
  } catch (err) {
    console.error("[GRAVY SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
  }
}

// Generador de la plantilla HTML responsiva para correos
function buildPhEmailHtml({
  invoice,
  conceptsList,
  propertyName,
  propertyCode,
  ownerName,
  ownerAddress,
  companyName,
  companyNit,
  companyAddress,
  companyPhone,
  companyEmail,
  companyCity,
  totalActual
}) {
  const numberText = invoice.getString("number");
  
  // Render de las filas agrupadas por concepto
  let tableRowsHtml = "";
  for (const c of conceptsList) {
    const sAnt = c.saldoAnterior > 0 ? cleanFmt(c.saldoAnterior) : "";
    const cMes = c.cobrosMes > 0 ? cleanFmt(c.cobrosMes) : "";
    const sAct = c.saldoActual > 0 ? cleanFmt(c.saldoActual) : "";
    
    tableRowsHtml += `
      <tr style="height: 22px;">
        <td style="padding: 4px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: left;">${c.description}</td>
        <td style="padding: 4px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right;">${sAnt}</td>
        <td style="padding: 4px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right;">${cMes}</td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; font-weight: bold;">${sAct}</td>
      </tr>`;
  }

  // Si hay observaciones, agregarlas abajo
  let notesHtml = "";
  const notes = invoice.getString("notes");
  if (notes && notes.trim()) {
    notesHtml = `
      <div style="margin-top: 15px; font-size: 11px; color: #000; font-style: italic; line-height: 1.4; border-top: 1px dashed #cbd5e1; padding-top: 8px; text-align: left;">
        ${notes.replace(/\n/g, '<br>')}
      </div>`;
  }

  const phoneSection = companyPhone ? `CELULAR PORTERIA ${companyPhone}` : "";
  const addressSection = companyAddress ? `<div style="font-size: 10px; color: #000;">${companyAddress}</div>` : "";
  const contactSection = phoneSection ? `<div style="font-size: 10px; color: #000;">${phoneSection}</div>` : "";
  const emailSection = companyEmail ? `<div style="font-size: 10px; color: #000;">${companyEmail}</div>` : "";
  const citySection = companyCity ? `<div style="font-size: 10px; color: #000;">${companyCity}</div>` : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cuenta de Cobro No. ${numberText}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #000; background-color: #f8fafc; margin: 0; padding: 20px; -webkit-text-size-adjust: 100%;">
  <div style="max-width: 700px; margin: 0 auto; background: #ffffff; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- Encabezado Principal -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
      <tr>
        <td style="width: 65%; text-align: center; vertical-align: top; line-height: 1.3; padding-right: 20px;">
          <div style="font-size: 15px; font-weight: bold; color: #000; text-transform: uppercase;">${companyName}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-top: 2px;">NIT ${companyNit}</div>
          ${addressSection}
          ${contactSection}
          ${emailSection}
          ${citySection}
        </td>
        <td style="width: 35%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <tr>
              <td style="padding: 5px; text-align: center; font-size: 10px; font-weight: bold; color: #000; background-color: #e0e0e0; border: 1px solid #000; text-transform: uppercase;">CUENTA DE COBRO No.</td>
            </tr>
            <tr>
              <td style="padding: 10px; text-align: center; font-size: 18px; font-weight: bold; color: #000; border: 1px solid #000;">${numberText}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Ficha de Datos / Metadatos -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
      <tr>
        <!-- Columna 1: Info del Propietario -->
        <td style="width: 60%; vertical-align: top; padding-right: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="width: 18%; font-weight: bold; padding: 4px 0; color: #000;">Nombre.</td>
              <td style="width: 82%; padding: 4px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0; color: #000;">Direccion.</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerAddress || propertyName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0; color: #000;">Contacto.</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">—</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0; color: #000;">Cod.Int.</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #000;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="border: none; padding: 0; font-weight: bold; color: #000;">${propertyCode}</td>
                    <td style="width: 25%; background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; text-align: center; font-size: 9px; padding: 2px; text-transform: uppercase; color: #000;">NIT / Id.</td>
                    <td style="width: 35%; border-bottom: 1px solid #000; padding: 0 4px; font-weight: bold; color: #000;">—</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0; color: #000;">Correo.</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${invoice.getString("email_sent_to") || '—'}</td>
            </tr>
          </table>
        </td>
        
        <!-- Columna 2: Matricula / Ref.Banco -->
        <td style="width: 20%; vertical-align: top; padding-right: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000;">
            <tr>
              <td style="background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000;">Matricula</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; height: 18px; font-weight: bold; color: #000;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000;">Ref.Banco</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; height: 18px; color: #000;">${propertyName}</td>
            </tr>
          </table>
        </td>

        <!-- Columna 3: Fechas / Mes -->
        <td style="width: 20%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000;">
            <tr>
              <td style="background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; width: 50%; color: #000;">Fecha Emision</td>
              <td style="background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; width: 50%; color: #000;">Fecha Vencimiento</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; color: #000;">${invoice.getString("date")}</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; color: #000;">${invoice.getString("due_date") || invoice.getString("date")}</td>
            </tr>
            <tr>
              <td style="background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000;">Area Und.Privada</td>
              <td style="background-color: #e0e0e0; border: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000;">Mes</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; height: 18px; font-weight: bold; color: #000;">&nbsp;</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; height: 18px; color: #000;">${getMonthNameUpper(invoice.getString("period"))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Tabla de Conceptos -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 15px;">
      <thead>
        <tr style="background-color: #e0e0e0; border-bottom: 1.5px solid #000;">
          <th style="padding: 6px 8px; border: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: left; width: 45%;">Concepto</th>
          <th style="padding: 6px 8px; border: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%;">Saldo Anterior</th>
          <th style="padding: 6px 8px; border: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%;">Cobros del MES</th>
          <th style="padding: 6px 8px; border: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 19%;">Saldo Actual</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <!-- Totales y Nota de Pago -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr>
        <td style="width: 65%; vertical-align: top; text-align: left;">
          <div style="background-color: #f8fafc; padding: 6px 8px; border: 1px solid #000; margin-bottom: 8px; font-size: 11px; font-weight: bold; color: #000; text-transform: uppercase;">
            ${numeroALetras(totalActual)}
          </div>
          <div style="font-size: 10px; font-weight: bold; color: #000; line-height: 1.4; font-style: italic; text-transform: uppercase;">
            ${notes ? notes.replace(/\n/g, '<br>') : 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD UTILIZANDO SU REFERENCIA DE UNIDAD COMO IDENTIFICACIÓN.'}
          </div>
        </td>
        <td style="width: 35%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <tr style="background-color: #e0e0e0;">
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; border-bottom: 1px solid #000; text-transform: uppercase;">Total FACTURA</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-size: 18px; font-weight: bold; color: #000; border: 1px solid #000;">
                <div style="float: left;">$</div>
                <div style="float: right;">${cleanFmt(totalActual)}</div>
                <div style="clear: both;"></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${notesHtml}

    <!-- Pie de Software -->
    <div style="border-top: 1px solid #cbd5e1; margin-top: 25px; padding-top: 8px; font-size: 9px; color: #64748b; text-align: center;">
      Impreso por Software GRAVY v2.0 / NIT. 901.442.115-3 — Sistema de Gestión y Control de Propiedad Horizontal.
    </div>

  </div>
</body>
</html>`;

// ──────────────────────────────────────────────────────────
// ROUTE: Envío individual de Factura / Estado de cuenta
// ──────────────────────────────────────────────────────────
routerAdd('POST', '/api/ph/send-invoice-email', (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }

  // Sincronizar configuraciones SMTP antes del envío
  syncSmtpSettings();

  const body = e.requestInfo()?.body || {};
  const invoiceId = body.invoiceId || body.invoice_id;
  const type = body.type || 'invoice'; // 'invoice' o 'statement'
  const customEmail = String(body.email || '').trim();
  const customSubject = String(body.subject || '').trim();

  if (!invoiceId) {
    e.json(400, { message: "El ID de la factura (invoiceId) es requerido." });
    return;
  }

  try {
    const invoice = $app.findRecordById("ph_invoices", invoiceId);
    if (!invoice) {
      e.json(404, { message: "Factura no encontrada." });
      return;
    }

    $app.expandRecord(invoice, ["property_id"], null);
    const prop = invoice.expandedOne("property_id");
    if (!prop) {
      e.json(400, { message: "La propiedad asociada a la factura no existe." });
      return;
    }

    $app.expandRecord(prop, ["owner_id"], null);
    const owner = prop.expandedOne("owner_id");
    if (!owner && !customEmail) {
      e.json(400, { message: "No se encontró el propietario ni se proporcionó un correo alternativo." });
      return;
    }

    const targetEmail = customEmail || (owner ? (owner.getString("email") || owner.getString("correo") || "") : "");
    if (!targetEmail) {
      e.json(400, { message: "El propietario no tiene un correo registrado y no se especificó un correo alternativo." });
      return;
    }

    // Actualizar correo temporal en el record para renderizado
    invoice.set("email_sent_to", targetEmail);

    const lines = $app.findRecordsByFilter(
      "ph_invoice_lines",
      `invoice_id = '${invoice.id}'`,
      "line_order",
      200,
      0
    );

    // Obtener cartera pendiente (para Saldo Anterior)
    const outstandingInvoices = [];
    if (type === 'statement') {
      const res = $app.findRecordsByFilter(
        "ph_invoices",
        `property_id = '${prop.id}' && id != '${invoice.id}' && status != 'paid' && status != 'voided' && period < '${invoice.getString("period")}'`,
        "period",
        200,
        0
      );
      if (res) {
        for (const oldInv of res) {
          outstandingInvoices.push(oldInv);
        }
      }
    }

    // Agrupar por conceptos
    const conceptsMap = {};
    for (const l of lines) {
      const desc = l.getString("description");
      conceptsMap[desc] = {
        description: desc,
        saldoAnterior: 0,
        cobrosMes: l.getFloat("amount"),
        saldoActual: l.getFloat("amount")
      };
    }

    for (const oldInv of outstandingInvoices) {
      const oldLines = $app.findRecordsByFilter(
        "ph_invoice_lines",
        `invoice_id = '${oldInv.id}'`,
        "line_order",
        200,
        0
      );
      for (const ol of oldLines) {
        const desc = ol.getString("description");
        if (!conceptsMap[desc]) {
          conceptsMap[desc] = {
            description: desc,
            saldoAnterior: 0,
            cobrosMes: 0,
            saldoActual: 0
          };
        }
        conceptsMap[desc].saldoAnterior += ol.getFloat("amount");
        conceptsMap[desc].saldoActual += ol.getFloat("amount");
      }
    }

    const conceptsList = Object.keys(conceptsMap).map(k => conceptsMap[k]);
    const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

    // Configuración de la empresa
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");

    // Generar plantilla de correo
    const htmlContent = buildPhEmailHtml({
      invoice,
      conceptsList,
      propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
      propertyCode: prop.getString("code") || "",
      ownerName: owner ? owner.getString("name") : "Copropietario",
      ownerAddress: owner ? owner.getString("address") : "",
      companyName,
      companyNit,
      companyAddress,
      companyPhone,
      companyEmail,
      companyCity,
      totalActual
    });

    const docLabel = type === 'statement' ? 'Estado de Cuenta' : 'Cuenta de Cobro';
    const emailSubject = customSubject || `${companyName} - ${docLabel} No. ${invoice.getString("number")} - Unidad ${prop.getString("name")}`;

    // Intentar enviar el correo electrónico
    try {
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress,
          name:    $app.settings().meta.senderName,
        },
        to: [{ address: targetEmail }],
        subject: emailSubject,
        html: htmlContent,
      });

      $app.newMailClient().send(message);
    } catch (mailErr) {
      console.error("[GRAVY PH EMAIL] Falló el envío SMTP:", mailErr);
      e.json(500, {
        message: "Error al enviar el correo. Por favor verifique la configuración de correo (SMTP) en el panel administrativo de PocketBase.",
        details: mailErr.message || String(mailErr)
      });
      return;
    }

    e.json(200, { success: true, message: `Correo enviado exitosamente a ${targetEmail}` });
  } catch (err) {
    console.error("[GRAVY PH EMAIL] Error inesperado:", err);
    e.json(500, { message: "Error inesperado al enviar: " + err.message });
  }
});

// ──────────────────────────────────────────────────────────
// ROUTE: Envío masivo de Facturas / Estados de cuenta por Período
// ──────────────────────────────────────────────────────────
routerAdd('POST', '/api/ph/send-bulk-emails', (e) => {
  const auth = e.requestInfo()?.auth;
  if (!auth) {
    e.json(401, { message: "Autenticación requerida." });
    return;
  }

  // Sincronizar configuraciones SMTP antes del envío
  syncSmtpSettings();

  const body = e.requestInfo()?.body || {};
  const period = body.period;
  const type = body.type || 'invoice'; // 'invoice' o 'statement'
  const customSubject = String(body.subject || '').trim();

  if (!period) {
    e.json(400, { message: "El período es requerido." });
    return;
  }

  try {
    const invoices = $app.findRecordsByFilter(
      "ph_invoices",
      `period = '${period}' && status != 'voided'`,
      "number",
      2000,
      0
    );

    if (!invoices.length) {
      e.json(404, { message: "No se encontraron facturas activas para el período " + period });
      return;
    }

    // Configuración de la empresa
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const details = [];

    for (const inv of invoices) {
      try {
        $app.expandRecord(inv, ["property_id"], null);
        const prop = inv.expandedOne("property_id");
        if (!prop) {
          skipped++;
          details.push({ number: inv.getString("number"), status: "skipped", reason: "Propiedad no encontrada" });
          continue;
        }

        $app.expandRecord(prop, ["owner_id"], null);
        const owner = prop.expandedOne("owner_id");
        if (!owner) {
          skipped++;
          details.push({ number: inv.getString("number"), unit: prop.getString("name"), status: "skipped", reason: "Propietario no encontrado" });
          continue;
        }

        const email = owner.getString("email") || owner.getString("correo") || "";
        if (!email) {
          skipped++;
          details.push({ number: inv.getString("number"), unit: prop.getString("name"), status: "skipped", reason: "Propietario sin email registrado" });
          continue;
        }

        inv.set("email_sent_to", email);

        const lines = $app.findRecordsByFilter(
          "ph_invoice_lines",
          `invoice_id = '${inv.id}'`,
          "line_order",
          200,
          0
        );

        // Obtener cartera pendiente (para Saldo Anterior)
        const outstandingInvoices = [];
        if (type === 'statement') {
          const res = $app.findRecordsByFilter(
            "ph_invoices",
            `property_id = '${prop.id}' && id != '${inv.id}' && status != 'paid' && status != 'voided' && period < '${inv.getString("period")}'`,
            "period",
            200,
            0
          );
          if (res) {
            for (const oldInv of res) {
              outstandingInvoices.push(oldInv);
            }
          }
        }

        // Agrupar por conceptos
        const conceptsMap = {};
        for (const l of lines) {
          const desc = l.getString("description");
          conceptsMap[desc] = {
            description: desc,
            saldoAnterior: 0,
            cobrosMes: l.getFloat("amount"),
            saldoActual: l.getFloat("amount")
          };
        }

        for (const oldInv of outstandingInvoices) {
          const oldLines = $app.findRecordsByFilter(
            "ph_invoice_lines",
            `invoice_id = '${oldInv.id}'`,
            "line_order",
            200,
            0
          );
          for (const ol of oldLines) {
            const desc = ol.getString("description");
            if (!conceptsMap[desc]) {
              conceptsMap[desc] = {
                description: desc,
                saldoAnterior: 0,
                cobrosMes: 0,
                saldoActual: 0
              };
            }
            conceptsMap[desc].saldoAnterior += ol.getFloat("amount");
            conceptsMap[desc].saldoActual += ol.getFloat("amount");
          }
        }

        const conceptsList = Object.keys(conceptsMap).map(k => conceptsMap[k]);
        const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

        // Generar plantilla de correo
        const htmlContent = buildPhEmailHtml({
          invoice: inv,
          conceptsList,
          propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
          propertyCode: prop.getString("code") || "",
          ownerName: owner.getString("name") || "Copropietario",
          ownerAddress: owner.getString("address") || "",
          companyName,
          companyNit,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCity,
          totalActual
        });

        const docLabel = type === 'statement' ? 'Estado de Cuenta' : 'Cuenta de Cobro';
        const emailSubject = customSubject || `${companyName} - ${docLabel} No. ${inv.getString("number")} - Unidad ${prop.getString("name")}`;

        // Enviar usando el cliente mailer de PocketBase
        const message = new MailerMessage({
          from: {
            address: $app.settings().meta.senderAddress,
            name:    $app.settings().meta.senderName,
          },
          to: [{ address: email }],
          subject: emailSubject,
          html: htmlContent,
        });

        $app.newMailClient().send(message);
        sent++;
        details.push({ number: inv.getString("number"), unit: prop.getString("name"), email, status: "sent" });

      } catch (err) {
        failed++;
        details.push({ number: inv.getString("number"), status: "failed", reason: err.message || String(err) });
      }
    }

    e.json(200, {
      success: true,
      sent,
      skipped,
      failed,
      details
    });

  } catch (err) {
    console.error("[GRAVY PH EMAIL] Error inesperado en lote:", err);
    e.json(500, { message: "Error inesperado al ejecutar envío masivo: " + err.message });
  }
});
