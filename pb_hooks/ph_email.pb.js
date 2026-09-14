/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — ph_email.pb.js
 * Endpoints HTTP para el envío de facturas y estados de cuenta en módulo Copropiedades.
 * Formato adaptado al modelo de referencia estadoCuenta.pdf.
 */

// Helper local para obtener configuración
function getSetting(key, fallback) {
  try {
    const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
    return r ? (r.get("value") || fallback) : fallback;
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

// Formateador de fecha YYYY-MM-DD a DD/MM/YYYY sin desfasar zona horaria
function fmtDateDDMMYYYY(dStr) {
  if (!dStr) return '—';
  const s = String(dStr).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return m[3] + '/' + m[2] + '/' + m[1];
  }
  return s;
}

// Obtener el período inmediatamente anterior (YYYY-MM)
function getPreviousPeriod(period) {
  if (!period) return '';
  const parts = String(period).split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (isNaN(y) || isNaN(m)) return '';
  m -= 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return y + '-' + (m < 10 ? '0' + m : m);
}

// Normalizador de nombre de concepto para unificar rubros idénticos (ej. mora de varios meses)
function getCanonicalConceptName(rawDesc) {
  if (!rawDesc) return 'CONCEPTO';
  var str = String(rawDesc).trim();
  var norm = str
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u');

  // Variaciones de intereses de mora (mes actual, meses anteriores, acumulados, etc.)
  if (
    (norm.indexOf('interes') !== -1 && norm.indexOf('mora') !== -1) ||
    norm === 'mora' ||
    norm.indexOf('mora ') === 0 ||
    norm.indexOf(' intereses mora') !== -1
  ) {
    return 'INTERESES DE MORA';
  }

  // Cuota ordinaria de administración
  if (
    norm.indexOf('cuota de administracion') !== -1 ||
    norm.indexOf('cuota administracion') !== -1 ||
    norm.indexOf('cuota ordinaria') !== -1 ||
    norm === 'administracion'
  ) {
    return 'CUOTA ADMINISTRACION';
  }

  // Fondo de imprevistos
  if (
    norm.indexOf('fondo de imprevistos') !== -1 ||
    norm.indexOf('fondo imprevistos') !== -1
  ) {
    return 'FONDO DE IMPREVISTOS';
  }

  return str;
}

// Carga catálogo de conceptos de cobro PH para resolución por ID
function getPhConceptsCache() {
  var cache = {
    byId: {},
    moraId: '',
    admId: '',
    byCanonicalName: {}
  };
  try {
    var records = $app.findRecordsByFilter("ph_billing_concepts", "", "code", 500, 0);
    if (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        var id = r.id || (r.getString ? r.getString("id") : "");
        var code = (r.getString ? r.getString("code") : (r.code || "")).trim().toUpperCase();
        var name = (r.getString ? r.getString("name") : (r.name || "")).trim();
        var upperName = name.toUpperCase();
        cache.byId[id] = { id: id, code: code, name: name };

        if (code === "MORA" || upperName.indexOf("MORA") !== -1) {
          cache.moraId = id;
        }
        if (code === "ADM" || upperName.indexOf("ADMIN") !== -1) {
          cache.admId = id;
        }

        var canonical = getCanonicalConceptName(name);
        cache.byCanonicalName[canonical] = id;
      }
    }
  } catch (e) {
    console.warn("[GRAVY PH] Advertencia al cargar catálogo de conceptos:", e);
  }
  return cache;
}

// Clasificador híbrido: ID-First con respaldo canónico para unificación total
function resolveConceptGroup(line, cache) {
  var rawId = line.getString ? line.getString("concept_id") : (line.concept_id || "");
  var rawDesc = line.getString ? line.getString("description") : (line.description || "Concepto");
  var canonicalDesc = getCanonicalConceptName(rawDesc);

  // 1. Prioridad Intereses de Mora: ID de mora O descripción con palabras clave de mora
  var conceptObj = (rawId && cache && cache.byId) ? cache.byId[rawId] : null;
  var isMoraById = rawId && (rawId === cache?.moraId || (conceptObj && (conceptObj.code === "MORA" || conceptObj.name.toUpperCase().indexOf("MORA") !== -1)));
  var isMoraByText = canonicalDesc === "INTERESES DE MORA";

  if (isMoraById || isMoraByText) {
    return {
      groupKey: "__MORA__",
      conceptId: (conceptObj ? conceptObj.id : (cache ? cache.moraId : "")) || "",
      description: "INTERESES DE MORA"
    };
  }

  // 2. Si tiene concept_id registrado y existe en el catálogo
  if (conceptObj) {
    return {
      groupKey: "ID_" + conceptObj.id,
      conceptId: conceptObj.id,
      description: conceptObj.name.toUpperCase()
    };
  }

  // 3. Si no tiene concept_id pero el texto canónico corresponde a un concepto del catálogo (ej. CUOTA ADMINISTRACION)
  if (cache && cache.byCanonicalName && cache.byCanonicalName[canonicalDesc]) {
    var matchedId = cache.byCanonicalName[canonicalDesc];
    var matchedConcept = cache.byId[matchedId];
    if (matchedConcept) {
      return {
        groupKey: "ID_" + matchedConcept.id,
        conceptId: matchedConcept.id,
        description: matchedConcept.name.toUpperCase()
      };
    }
  }

  // 4. Si tiene un concept_id desconocido / huérfano
  if (rawId) {
    return {
      groupKey: "ID_" + rawId,
      conceptId: rawId,
      description: canonicalDesc || String(rawDesc).toUpperCase()
    };
  }

  // 5. Fallback por texto normalizado
  return {
    groupKey: "__TEXT_" + canonicalDesc,
    conceptId: "",
    description: canonicalDesc || "CONCEPTO"
  };
}

// Constructor y clasificador unificado de conceptos (saldos anteriores vs cobros del mes)
function buildGroupedConceptsList(lines, outstandingInvoices, cache) {
  if (!cache) {
    cache = getPhConceptsCache();
  }
  var conceptsMap = {};

  if (lines) {
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      var group = resolveConceptGroup(l, cache);
      var key = group.groupKey;
      var amount = l.getFloat ? l.getFloat("amount") : (Number(l.amount) || 0);
      if (!conceptsMap[key]) {
        conceptsMap[key] = {
          conceptId: group.conceptId,
          description: group.description,
          saldoAnterior: 0,
          cobrosMes: 0,
          saldoActual: 0
        };
      }
      conceptsMap[key].cobrosMes += amount;
      conceptsMap[key].saldoActual += amount;
    }
  }

  if (outstandingInvoices) {
    for (var j = 0; j < outstandingInvoices.length; j++) {
      var oldInv = outstandingInvoices[j];
      var oldLines = $app.findRecordsByFilter(
        "ph_invoice_lines",
        "invoice_id = '" + oldInv.id + "'",
        "line_order",
        200,
        0
      );
      if (oldLines) {
        for (var k = 0; k < oldLines.length; k++) {
          var ol = oldLines[k];
          var groupOld = resolveConceptGroup(ol, cache);
          var keyOld = groupOld.groupKey;
          var amountOld = ol.getFloat ? ol.getFloat("amount") : (Number(ol.amount) || 0);
          if (!conceptsMap[keyOld]) {
            conceptsMap[keyOld] = {
              conceptId: groupOld.conceptId,
              description: groupOld.description,
              saldoAnterior: 0,
              cobrosMes: 0,
              saldoActual: 0
            };
          }
          conceptsMap[keyOld].saldoAnterior += amountOld;
          conceptsMap[keyOld].saldoActual += amountOld;
        }
      }
    }
  }

  var list = Object.keys(conceptsMap).map(function(k) { return conceptsMap[k]; });

  // Orden contable estándar: Cuota de administración al inicio, Intereses de mora al final
  list.sort(function(a, b) {
    var nameA = String(a.description || '').toUpperCase();
    var nameB = String(b.description || '').toUpperCase();
    if (nameA.indexOf('ADMIN') !== -1 && nameB.indexOf('ADMIN') === -1) return -1;
    if (nameA.indexOf('ADMIN') === -1 && nameB.indexOf('ADMIN') !== -1) return 1;
    if (nameA.indexOf('MORA') !== -1 && nameB.indexOf('MORA') === -1) return 1;
    if (nameA.indexOf('MORA') === -1 && nameB.indexOf('MORA') !== -1) return -1;
    return nameA.localeCompare(nameB);
  });

  return list;
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
function syncSmtpSettings(fnGetSetting) {
  const _get = (typeof fnGetSetting === 'function') ? fnGetSetting : (typeof getSetting === 'function' ? getSetting : function(k, f) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(k || '').replace(/'/g, "''") + "'");
      return r ? (r.get("value") || f) : f;
    } catch (_) { return f; }
  });
  const smtpEnabled = _get("smtp_enabled", "0") === "1";
  try {
    const pbSettings = $app.settings();
    if (smtpEnabled) {
      const host = _get("smtp_host", "");
      const port = parseInt(_get("smtp_port", "587"), 10);
      const user = _get("smtp_username", "");
      const pass = _get("smtp_password", "");
      const senderName = _get("smtp_sender_name", "");
      const senderAddr = _get("smtp_sender_address", "");
      
      pbSettings.smtp.enabled = true;
      pbSettings.smtp.host = host;
      pbSettings.smtp.port = port;
      pbSettings.smtp.username = user;
      pbSettings.smtp.password = pass;
      pbSettings.smtp.tls = (port === 465);
      pbSettings.meta.senderName = senderName || _get("company_name", "GRAVY S.A.S");
      pbSettings.meta.senderAddress = senderAddr || user;
    } else {
      pbSettings.smtp.enabled = false;
    }
    $app.save(pbSettings);
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
  propertyArea,
  propertyCoef,
  propertyMatricula,
  ownerName,
  ownerDocNumber,
  ownerAddress,
  ownerPhone,
  companyName,
  companyNit,
  companyAddress,
  companyPhone,
  companyEmail,
  companyCity,
  companyLogo,
  totalActual,
  notes: customNotes,
  prevMonthUnitRecaudo,
  prevMonthTotalRecaudo,
  prevMonthName
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
        <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: left; background-color: #ffffff;">${c.description}</td>
        <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; background-color: #ffffff;">${sAnt}</td>
        <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; background-color: #ffffff;">${cMes}</td>
        <td style="padding: 5px 8px; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; font-weight: bold; background-color: #ffffff;">${sAct}</td>
      </tr>`;
  }

  // Nota al pie de factura / instrucciones de recaudo
  let notesHtml = "";
  let defaultFooterNote = "";
  try {
    defaultFooterNote = (typeof getSetting === 'function') ? getSetting("ph_invoice_footer_note", "") : "";
  } catch (_) {}
  const notes = (customNotes || invoice.getString("notes") || defaultFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();

  const phoneSection = companyPhone ? `TEL / PORTERÍA: ${companyPhone}` : "";
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
<body style="font-family: Arial, Helvetica, sans-serif; color: #000; background-color: #f1f5f9; margin: 0; padding: 20px; -webkit-text-size-adjust: 100%;">
  <div style="max-width: 720px; margin: 0 auto; background: #ffffff; padding: 20px; border: 1px solid #cbd5e1;">
    
    <!-- Encabezado Principal: Logo, Datos Copropiedad y Caja de Documento -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; border-bottom: 2px solid #000; padding-bottom: 10px;">
      <tr>
        <td style="width: 25%; vertical-align: middle; text-align: left; padding-right: 10px;">
          ${companyLogo 
            ? `<img src="data:image/png;base64,${companyLogo}" style="max-height: 75px; max-width: 170px; object-fit: contain; display: block;" alt="Logo Copropiedad" />`
            : `<div style="font-size: 20px; font-weight: 900; color: #000; font-family: sans-serif; letter-spacing: -0.5px;">${companyName.substring(0, 4)}</div>`
          }
        </td>
        <td style="width: 45%; text-align: center; vertical-align: top; line-height: 1.3; padding: 0 10px;">
          <div style="font-size: 14.5px; font-weight: bold; color: #000; text-transform: uppercase;">${companyName}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-top: 2px;">NIT ${companyNit}</div>
          ${addressSection}
          ${contactSection}
          ${emailSection}
          ${citySection}
        </td>
        <td style="width: 30%; vertical-align: top; text-align: right;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; background-color: #ffffff;">
            <tr>
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; background-color: #ffffff; border-bottom: 1px solid #000; text-transform: uppercase; letter-spacing: 0.5px;">CUENTA DE COBRO No.</td>
            </tr>
            <tr>
              <td style="padding: 8px; text-align: center; font-size: 17px; font-weight: bold; color: #000; background-color: #ffffff; border-bottom: 1px solid #000; font-family: monospace;">${numberText}</td>
            </tr>
            <tr>
              <td style="padding: 3px; text-align: center; font-size: 9.5px; font-weight: bold; color: #000; background-color: #ffffff; text-transform: uppercase;">PERÍODO: ${getMonthNameUpper(invoice.getString("period"))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Ficha de Datos / Metadatos (Fondo Blanco Puro) -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
      <tr>
        <!-- Columna 1: Info del Propietario -->
        <td style="width: 55%; vertical-align: top; padding-right: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="width: 22%; font-weight: bold; padding: 3.5px 0; color: #000;">Nombre:</td>
              <td style="width: 78%; padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Dirección:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerAddress || propertyName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Contacto:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerPhone || '—'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Cód. Unidad:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="border: none; padding: 0; font-weight: bold; color: #000;">${propertyCode || propertyName}</td>
                    <td style="width: 28%; border: 1px solid #000; font-weight: bold; text-align: center; font-size: 9px; padding: 2px; text-transform: uppercase; color: #000; background-color: #ffffff;">NIT / C.C.</td>
                    <td style="width: 38%; border-bottom: 1px solid #000; padding: 0 4px; font-weight: bold; color: #000;">${ownerDocNumber || '—'}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Correo:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${invoice.getString("email_sent_to") || '—'}</td>
            </tr>
          </table>
        </td>
        
        <!-- Columna 2: Matrícula / Ref. Banco -->
        <td style="width: 22%; vertical-align: top; padding-right: 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
            <tr>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000; background-color: #ffffff; text-transform: uppercase;">Matrícula</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; padding: 5px; text-align: center; height: 18px; font-weight: bold; color: #000; background-color: #ffffff;">${propertyMatricula || '&nbsp;'}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000; background-color: #ffffff; text-transform: uppercase;">Ref. Banco</td>
            </tr>
            <tr>
              <td style="padding: 5px; text-align: center; font-weight: bold; height: 18px; color: #000; background-color: #ffffff;">${propertyName}</td>
            </tr>
          </table>
        </td>

        <!-- Columna 3: Fechas / Área -->
        <td style="width: 23%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; width: 50%; color: #000; background-color: #ffffff;">Emisión</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; width: 50%; color: #000; background-color: #ffffff;">Vencimiento</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; color: #000; background-color: #ffffff;">${fmtDateDDMMYYYY(invoice.getString("date"))}</td>
              <td style="border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; color: #000; background-color: #ffffff;">${fmtDateDDMMYYYY(invoice.getString("due_date") || invoice.getString("date"))}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; color: #000; background-color: #ffffff;">Área (m²)</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; color: #000; background-color: #ffffff;">Coeficiente</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; padding: 4px; text-align: center; height: 18px; font-weight: bold; color: #000; background-color: #ffffff;">${propertyArea || '&nbsp;'}</td>
              <td style="padding: 4px; text-align: center; font-weight: bold; height: 18px; color: #000; background-color: #ffffff;">${propertyCoef || '—'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Barra de Recaudo del Mes Inmediatamente Anterior -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
      <tr>
        <td style="width: 50%; padding: 4.5px 8px; border-right: 1px solid #000; background-color: #ffffff; color: #000;">
          <span style="font-weight: bold; text-transform: uppercase;">Recaudo Mes Anterior Unidad ${prevMonthName ? '(' + prevMonthName + ')' : ''}:</span>
          <span style="font-weight: bold; font-family: monospace; font-size: 11px; margin-left: 6px;">$ ${cleanFmt(prevMonthUnitRecaudo)}</span>
        </td>
        <td style="width: 50%; padding: 4.5px 8px; background-color: #ffffff; color: #000;">
          <span style="font-weight: bold; text-transform: uppercase;">Total Recaudo Copropiedad ${prevMonthName ? '(' + prevMonthName + ')' : ''}:</span>
          <span style="font-weight: bold; font-family: monospace; font-size: 11px; margin-left: 6px;">$ ${cleanFmt(prevMonthTotalRecaudo)}</span>
        </td>
      </tr>
    </table>

    <!-- Tabla de Conceptos (100% de Ancho, Fondo Blanco) -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 14px;">
      <thead>
        <tr style="border-bottom: 1.5px solid #000;">
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: left; width: 46%; background-color: #ffffff;">CONCEPTO</th>
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">SALDO ANTERIOR</th>
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">COBROS DEL MES</th>
          <th style="padding: 6px 8px; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">SALDO TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <!-- Totales y Nota de Pago (Sin Rellenos de Color) -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
      <tr>
        <td style="width: 65%; vertical-align: top; text-align: left; padding-right: 15px;">
          <div style="background-color: #ffffff; padding: 6px 8px; border: 1px solid #000; margin-bottom: 8px; font-size: 10.5px; font-weight: bold; color: #000; text-transform: uppercase;">
            ${numeroALetras(totalActual)}
          </div>
          <div style="font-size: 10px; font-weight: bold; color: #000; line-height: 1.4; font-style: italic; text-transform: uppercase;">
            ${notes ? notes.replace(/\n/g, '<br>') : 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.'}
          </div>
        </td>
        <td style="width: 35%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; background-color: #ffffff;">
            <tr>
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #ffffff;">TOTAL A PAGAR</td>
            </tr>
            <tr>
              <td style="padding: 9px 10px; font-size: 18px; font-weight: bold; color: #000; background-color: #ffffff;">
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
    <div style="border-top: 1px solid #000; margin-top: 22px; padding-top: 6px; font-size: 8.5px; color: #333; text-align: center;">
      Documento emitido por GRAVY v2.0 / NIT. 901.442.115-3 — Sistema Integral de Control y Gestión de Propiedad Horizontal.
    </div>

  </div>
</body>
</html>`;
}

// Helper para generar y obtener archivo PDF del orquestador (puerto 8088)
function generatePhPdfAttachment({
  invoice,
  conceptsList,
  propertyName,
  propertyCode,
  propertyArea,
  propertyCoef,
  propertyMatricula,
  ownerName,
  ownerNit,
  ownerDocNumber,
  ownerAddress,
  ownerPhone,
  ownerEmail,
  companyName,
  companyNit,
  companyAddress,
  companyPhone,
  companyEmail,
  companyCity,
  companyLogo,
  totalActual,
  type,
  notes,
  prevMonthUnitRecaudo,
  prevMonthTotalRecaudo,
  prevMonthName
}) {
  const numberText = invoice.getString("number") || "cuenta";
  const docType = type || 'invoice';
  const filename = `${docType === 'statement' ? 'EstadoCuenta' : 'CuentaCobro'}_${numberText}`;

  try {
    const orchestratorRes = $http.send({
      url: "http://127.0.0.1:8088/api/ph/generate-pdf",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: filename,
        statementData: {
          companyName,
          companyNit,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCity,
          companyLogo,
          docType,
          docNumber: numberText,
          period: invoice.getString("period"),
          date: invoice.getString("date"),
          dueDate: invoice.getString("due_date") || invoice.getString("date"),
          propertyName,
          propertyCode,
          propertyArea,
          propertyCoef,
          propertyMatricula,
          ownerName,
          ownerNit: ownerDocNumber || ownerNit || '—',
          ownerDocNumber: ownerDocNumber || ownerNit || '—',
          ownerAddress,
          ownerPhone,
          ownerEmail,
          conceptsList,
          totalActual,
          notes,
          prevMonthUnitRecaudo,
          prevMonthTotalRecaudo,
          prevMonthName
        }
      })
    });

    if (orchestratorRes.statusCode === 200) {
      const data = JSON.parse(orchestratorRes.raw);
      if (data.success && data.pdfPath) {
        return {
          filename: data.filename || `${filename}.pdf`,
          pdfPath: data.pdfPath
        };
      }
    }
  } catch (err) {
    console.warn("[GRAVY PH EMAIL] No se pudo generar PDF en el orquestador:", err);
  }
  return null;
}

// ──────────────────────────────────────────────────────────
// ROUTE: Envío individual de Factura / Estado de cuenta
// ──────────────────────────────────────────────────────────
routerAdd('POST', '/api/ph/send-invoice-email', (e) => {
  // ── HELPERS LOCALES PARA EL RUNTIME DE POCKETBASE (GOJA) ──
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
      return r ? (r.get("value") || fallback) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const fmtCurrency = function(value) {
    if (value === undefined || value === null) return "$ 0";
    return "$ " + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getMonthNameUpper = function(p) {
    if (!p) return '—';
    const parts = String(p).split('-');
    const m = parseInt(parts[1], 10) || 1;
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    return months[m - 1] || '';
  };

  const fmtDateDDMMYYYY = function(dStr) {
    if (!dStr) return '—';
    const s = String(dStr).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return m[3] + '/' + m[2] + '/' + m[1];
    }
    return s;
  };

  const getPreviousPeriod = function(period) {
    if (!period) return '';
    const parts = String(period).split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(y) || isNaN(m)) return '';
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return y + '-' + (m < 10 ? '0' + m : m);
  };

  const numeroALetras = function(num) {
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
        if (mil === 1) t = 'Un millón';
        else t = letras(millon) + ' millones';
        return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
      }
      return '';
    }
    
    var res = letras(entero);
    res = res.charAt(0).toUpperCase() + res.slice(1);
    return ('Son: ' + res + ' PESOS ' + centavos + '/100').toUpperCase();
  };

  const cleanFmt = function(value) {
    if (value === undefined || value === null) return "0.00";
    var parts = parseFloat(value).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const syncSmtpSettings = function(fnGetSetting) {
    const _get = (typeof fnGetSetting === 'function') ? fnGetSetting : getSetting;
    const smtpEnabled = _get("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = _get("smtp_host", "");
        const port = parseInt(_get("smtp_port", "587"), 10);
        const user = _get("smtp_username", "");
        const pass = _get("smtp_password", "");
        const senderName = _get("smtp_sender_name", "");
        const senderAddr = _get("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || _get("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
    } catch (err) {
      console.error("[GRAVY SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
    }
  };

  const buildPhEmailHtml = function({
    invoice,
    conceptsList,
    propertyName,
    propertyCode,
    propertyArea,
    propertyCoef,
    propertyMatricula,
    ownerName,
    ownerDocNumber,
    ownerAddress,
    ownerPhone,
    companyName,
    companyNit,
    companyAddress,
    companyPhone,
    companyEmail,
    companyCity,
    companyLogo,
    totalActual,
    notes: customNotes,
    prevMonthUnitRecaudo,
    prevMonthTotalRecaudo,
    prevMonthName
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
          <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: left; background-color: #ffffff;">${c.description}</td>
          <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; background-color: #ffffff;">${sAnt}</td>
          <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; background-color: #ffffff;">${cMes}</td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; font-weight: bold; background-color: #ffffff;">${sAct}</td>
        </tr>`;
    }

    // Nota al pie de factura / instrucciones de recaudo
    let defaultFooterNote = "";
    try {
      defaultFooterNote = getSetting("ph_invoice_footer_note", "");
    } catch (_) {}
    const notes = (customNotes || invoice.getString("notes") || defaultFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();

    const phoneSection = companyPhone ? `TEL / PORTERÍA: ${companyPhone}` : "";
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
<body style="font-family: Arial, Helvetica, sans-serif; color: #000; background-color: #f1f5f9; margin: 0; padding: 20px; -webkit-text-size-adjust: 100%;">
  <div style="max-width: 720px; margin: 0 auto; background: #ffffff; padding: 20px; border: 1px solid #cbd5e1;">
    
    <!-- Encabezado Principal: Logo, Datos Copropiedad y Caja de Documento -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; border-bottom: 2px solid #000; padding-bottom: 10px;">
      <tr>
        <td style="width: 25%; vertical-align: middle; text-align: left; padding-right: 10px;">
          ${companyLogo 
            ? `<img src="data:image/png;base64,${companyLogo}" style="max-height: 75px; max-width: 170px; object-fit: contain; display: block;" alt="Logo Copropiedad" />`
            : `<div style="font-size: 20px; font-weight: 900; color: #000; font-family: sans-serif; letter-spacing: -0.5px;">${companyName.substring(0, 4)}</div>`
          }
        </td>
        <td style="width: 45%; text-align: center; vertical-align: top; line-height: 1.3; padding: 0 10px;">
          <div style="font-size: 14.5px; font-weight: bold; color: #000; text-transform: uppercase;">${companyName}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-top: 2px;">NIT ${companyNit}</div>
          ${addressSection}
          ${contactSection}
          ${emailSection}
          ${citySection}
        </td>
        <td style="width: 30%; vertical-align: top; text-align: right;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; background-color: #ffffff;">
            <tr>
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; background-color: #ffffff; border-bottom: 1px solid #000; text-transform: uppercase; letter-spacing: 0.5px;">CUENTA DE COBRO No.</td>
            </tr>
            <tr>
              <td style="padding: 8px; text-align: center; font-size: 17px; font-weight: bold; color: #000; background-color: #ffffff; border-bottom: 1px solid #000; font-family: monospace;">${numberText}</td>
            </tr>
            <tr>
              <td style="padding: 3px; text-align: center; font-size: 9.5px; font-weight: bold; color: #000; background-color: #ffffff; text-transform: uppercase;">PERÍODO: ${getMonthNameUpper(invoice.getString("period"))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Ficha de Datos / Metadatos (Fondo Blanco Puro) -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
      <tr>
        <!-- Columna 1: Info del Propietario -->
        <td style="width: 55%; vertical-align: top; padding-right: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="width: 22%; font-weight: bold; padding: 3.5px 0; color: #000;">Nombre:</td>
              <td style="width: 78%; padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Dirección:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerAddress || propertyName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Contacto:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerPhone || '—'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Cód. Unidad:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="border: none; padding: 0; font-weight: bold; color: #000;">${propertyCode || propertyName}</td>
                    <td style="width: 28%; border: 1px solid #000; font-weight: bold; text-align: center; font-size: 9px; padding: 2px; text-transform: uppercase; color: #000; background-color: #ffffff;">NIT / C.C.</td>
                    <td style="width: 38%; border-bottom: 1px solid #000; padding: 0 4px; font-weight: bold; color: #000;">${ownerDocNumber || '—'}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Correo:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${invoice.getString("email_sent_to") || '—'}</td>
            </tr>
          </table>
        </td>
        
        <!-- Columna 2: Matrícula / Ref. Banco -->
        <td style="width: 22%; vertical-align: top; padding-right: 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
            <tr>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000; background-color: #ffffff; text-transform: uppercase;">Matrícula</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; padding: 5px; text-align: center; height: 18px; font-weight: bold; color: #000; background-color: #ffffff;">${propertyMatricula || '&nbsp;'}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000; background-color: #ffffff; text-transform: uppercase;">Ref. Banco</td>
            </tr>
            <tr>
              <td style="padding: 5px; text-align: center; font-weight: bold; height: 18px; color: #000; background-color: #ffffff;">${propertyName}</td>
            </tr>
          </table>
        </td>

        <!-- Columna 3: Fechas / Área -->
        <td style="width: 23%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; width: 50%; color: #000; background-color: #ffffff;">Emisión</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; width: 50%; color: #000; background-color: #ffffff;">Vencimiento</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; color: #000; background-color: #ffffff;">${fmtDateDDMMYYYY(invoice.getString("date"))}</td>
              <td style="border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; color: #000; background-color: #ffffff;">${fmtDateDDMMYYYY(invoice.getString("due_date") || invoice.getString("date"))}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; color: #000; background-color: #ffffff;">Área (m²)</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; color: #000; background-color: #ffffff;">Coeficiente</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; padding: 4px; text-align: center; height: 18px; font-weight: bold; color: #000; background-color: #ffffff;">${propertyArea || '&nbsp;'}</td>
              <td style="padding: 4px; text-align: center; font-weight: bold; height: 18px; color: #000; background-color: #ffffff;">${propertyCoef || '—'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Barra de Recaudo del Mes Inmediatamente Anterior -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
      <tr>
        <td style="width: 50%; padding: 4.5px 8px; border-right: 1px solid #000; background-color: #ffffff; color: #000;">
          <span style="font-weight: bold; text-transform: uppercase;">Recaudo Mes Anterior Unidad ${prevMonthName ? '(' + prevMonthName + ')' : ''}:</span>
          <span style="font-weight: bold; font-family: monospace; font-size: 11px; margin-left: 6px;">$ ${cleanFmt(prevMonthUnitRecaudo)}</span>
        </td>
        <td style="width: 50%; padding: 4.5px 8px; background-color: #ffffff; color: #000;">
          <span style="font-weight: bold; text-transform: uppercase;">Total Recaudo Copropiedad ${prevMonthName ? '(' + prevMonthName + ')' : ''}:</span>
          <span style="font-weight: bold; font-family: monospace; font-size: 11px; margin-left: 6px;">$ ${cleanFmt(prevMonthTotalRecaudo)}</span>
        </td>
      </tr>
    </table>

    <!-- Tabla de Conceptos (100% de Ancho, Fondo Blanco) -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 14px;">
      <thead>
        <tr style="border-bottom: 1.5px solid #000;">
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: left; width: 46%; background-color: #ffffff;">CONCEPTO</th>
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">SALDO ANTERIOR</th>
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">COBROS DEL MES</th>
          <th style="padding: 6px 8px; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">SALDO TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <!-- Totales y Nota de Pago (Sin Rellenos de Color) -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
      <tr>
        <td style="width: 65%; vertical-align: top; text-align: left; padding-right: 15px;">
          <div style="background-color: #ffffff; padding: 6px 8px; border: 1px solid #000; margin-bottom: 8px; font-size: 10.5px; font-weight: bold; color: #000; text-transform: uppercase;">
            ${numeroALetras(totalActual)}
          </div>
          <div style="font-size: 10px; font-weight: bold; color: #000; line-height: 1.4; font-style: italic; text-transform: uppercase;">
            ${notes ? notes.replace(/\n/g, '<br>') : 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.'}
          </div>
        </td>
        <td style="width: 35%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; background-color: #ffffff;">
            <tr>
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #ffffff;">TOTAL A PAGAR</td>
            </tr>
            <tr>
              <td style="padding: 9px 10px; font-size: 18px; font-weight: bold; color: #000; background-color: #ffffff;">
                <div style="float: left;">$</div>
                <div style="float: right;">${cleanFmt(totalActual)}</div>
                <div style="clear: both;"></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Pie de Software -->
    <div style="border-top: 1px solid #000; margin-top: 22px; padding-top: 6px; font-size: 8.5px; color: #333; text-align: center;">
      Documento emitido por GRAVY v2.0 / NIT. 901.442.115-3 — Sistema Integral de Control y Gestión de Propiedad Horizontal.
    </div>

  </div>
</body>
</html>`;
  };

  const generatePhPdfAttachment = function({
    invoice,
    conceptsList,
    propertyName,
    propertyCode,
    propertyArea,
    propertyCoef,
    propertyMatricula,
    ownerName,
    ownerNit,
    ownerDocNumber,
    ownerAddress,
    ownerPhone,
    ownerEmail,
    companyName,
    companyNit,
    companyAddress,
    companyPhone,
    companyEmail,
    companyCity,
    companyLogo,
    totalActual,
    type,
    notes,
    prevMonthUnitRecaudo,
    prevMonthTotalRecaudo,
    prevMonthName
  }) {
    const numberText = invoice.getString("number") || "cuenta";
    const docType = type || 'invoice';
    const filename = `${docType === 'statement' ? 'EstadoCuenta' : 'CuentaCobro'}_${numberText}`;

    try {
      const orchestratorRes = $http.send({
        url: "http://127.0.0.1:8088/api/ph/generate-pdf",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: filename,
          statementData: {
            companyName,
            companyNit,
            companyAddress,
            companyPhone,
            companyEmail,
            companyCity,
            companyLogo,
            docType,
            docNumber: numberText,
            period: invoice.getString("period"),
            date: invoice.getString("date"),
            dueDate: invoice.getString("due_date") || invoice.getString("date"),
            propertyName,
            propertyCode,
            propertyArea,
            propertyCoef,
            propertyMatricula,
            ownerName,
            ownerNit: ownerDocNumber || ownerNit || '—',
            ownerDocNumber: ownerDocNumber || ownerNit || '—',
            ownerAddress,
            ownerPhone,
            ownerEmail,
            conceptsList,
            totalActual,
            notes,
            prevMonthUnitRecaudo,
            prevMonthTotalRecaudo,
            prevMonthName
          }
        })
      });

      if (orchestratorRes.statusCode === 200) {
        const data = JSON.parse(orchestratorRes.raw);
        if (data.success && data.pdfPath) {
          return {
            filename: data.filename || `${filename}.pdf`,
            pdfPath: data.pdfPath
          };
        }
      }
    } catch (err) {
      console.warn("[GRAVY PH EMAIL] No se pudo generar PDF en el orquestador:", err);
    }
    return null;
  };

  let auth = null;
  try { auth = e.requestInfo()?.auth || e.auth; } catch (_) {
    try { auth = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!auth) {
    return e.json(401, { message: "Autenticación requerida." });
  }

  // Sincronizar configuraciones SMTP antes del envío
  try { syncSmtpSettings(getSetting); } catch (_) {}

  let body = {};
  try {
    body = e.requestInfo()?.body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (_) {}
  }
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) {}
  }

  let invoiceId = body?.invoiceId || body?.invoice_id || body?.id;
  if (!invoiceId) {
    try {
      const q = e.requestInfo()?.query || {};
      invoiceId = q.invoiceId || q.invoice_id || q.id;
    } catch (_) {}
  }

  const type = String(body?.type || 'invoice').trim(); // 'invoice' o 'statement'
  const customEmail = String(body?.email || '').trim();
  const customSubject = String(body?.subject || '').trim();

  if (!invoiceId) {
    return e.json(400, { message: "El ID de la factura (invoiceId) es requerido." });
  }

  try {
    const invoice = $app.findRecordById("ph_invoices", invoiceId);
    if (!invoice) {
      return e.json(404, { message: "Factura no encontrada." });
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

    // Agrupar por conceptos de forma canónica (unificando saldos anteriores y cobros del mes)
    const conceptsList = buildGroupedConceptsList(lines, outstandingInvoices);
    const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

    const ownerDocNumber = owner ? (owner.getString("doc_number") ? (owner.getString("doc_number") + (owner.getString("dv") ? "-" + owner.getString("dv") : "")) : (owner.getString("nit") || owner.getString("document") || "—")) : "—";
    const ownerPhone = owner ? (owner.getString("phone") || owner.getString("celular") || "—") : "—";

    const prevPeriod = getPreviousPeriod(invoice.getString("period"));
    const prevMonthName = getMonthNameUpper(prevPeriod);
    let prevMonthUnitRecaudo = 0;
    let prevMonthTotalRecaudo = 0;
    if (prevPeriod) {
      try {
        const unitPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `property_id = '${prop.id}' && period = '${prevPeriod}' && status = 'paid'`,
          "",
          200,
          0
        );
        if (unitPaid) {
          for (const p of unitPaid) {
            prevMonthUnitRecaudo += p.getFloat("total");
          }
        }
        const allPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `period = '${prevPeriod}' && status = 'paid'`,
          "",
          1000,
          0
        );
        if (allPaid) {
          for (const p of allPaid) {
            prevMonthTotalRecaudo += p.getFloat("total");
          }
        }
      } catch (errRec) {
        console.warn("[GRAVY PH EMAIL] Advertencia al calcular recaudos mes anterior:", errRec);
      }
    }

    // Configuración de la empresa
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");
    const companyLogo = getSetting("company_logo", "");
    const companyFooterNote = getSetting("ph_invoice_footer_note", "");
    const invoiceNotes = (invoice.getString("notes") || companyFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();

    // Generar plantilla de correo
    const htmlContent = buildPhEmailHtml({
      invoice,
      conceptsList,
      propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
      propertyCode: prop.getString("code") || "",
      propertyArea: prop.getString("area_m2") || prop.getString("area") || "",
      propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",
      propertyMatricula: prop.getString("matricula") || "",
      ownerName: owner ? owner.getString("name") : "Copropietario",
      ownerDocNumber,
      ownerAddress: owner ? owner.getString("address") : "",
      ownerPhone,
      companyName,
      companyNit,
      companyAddress,
      companyPhone,
      companyEmail,
      companyCity,
      companyLogo,
      totalActual,
      notes: invoiceNotes,
      prevMonthUnitRecaudo,
      prevMonthTotalRecaudo,
      prevMonthName
    });

    const docLabel = type === 'statement' ? 'Estado de Cuenta' : 'Cuenta de Cobro';
    const emailSubject = customSubject || `${companyName} - ${docLabel} No. ${invoice.getString("number")} - Unidad ${prop.getString("name")}`;

    // Intentar enviar el correo electrónico con adjunto PDF
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

      // Generar y adjuntar el archivo PDF oficial
      const pdfAttachment = generatePhPdfAttachment({
        invoice,
        conceptsList,
        propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
        propertyCode: prop.getString("code") || "",
        propertyArea: prop.getString("area_m2") || prop.getString("area") || "",
        propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",
        propertyMatricula: prop.getString("matricula") || "",
        ownerName: owner ? owner.getString("name") : "Copropietario",
        ownerNit: ownerDocNumber,
        ownerDocNumber,
        ownerAddress: owner ? owner.getString("address") : "",
        ownerPhone,
        ownerEmail: targetEmail,
        companyName,
        companyNit,
        companyAddress,
        companyPhone,
        companyEmail,
        companyCity,
        companyLogo,
        totalActual,
        type,
        notes: invoiceNotes,
        prevMonthUnitRecaudo,
        prevMonthTotalRecaudo,
        prevMonthName
      });

      if (pdfAttachment && pdfAttachment.pdfPath) {
        try {
          const pdfFile = $filesystem.fileFromPath(pdfAttachment.pdfPath);
          message.attachments = {
            [pdfAttachment.filename]: pdfFile.reader.open()
          };
        } catch (attErr) {
          console.warn("[GRAVY PH EMAIL] Error al adjuntar archivo PDF individual:", attErr);
        }
      }

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
  // ── HELPERS LOCALES PARA EL RUNTIME DE POCKETBASE (GOJA) ──
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
      return r ? (r.get("value") || fallback) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const fmtCurrency = function(value) {
    if (value === undefined || value === null) return "$ 0";
    return "$ " + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getMonthNameUpper = function(p) {
    if (!p) return '—';
    const parts = String(p).split('-');
    const m = parseInt(parts[1], 10) || 1;
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    return months[m - 1] || '';
  };

  const fmtDateDDMMYYYY = function(dStr) {
    if (!dStr) return '—';
    const s = String(dStr).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return m[3] + '/' + m[2] + '/' + m[1];
    }
    return s;
  };

  const getPreviousPeriod = function(period) {
    if (!period) return '';
    const parts = String(period).split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(y) || isNaN(m)) return '';
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return y + '-' + (m < 10 ? '0' + m : m);
  };

  const numeroALetras = function(num) {
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
  };

  const cleanFmt = function(value) {
    if (value === undefined || value === null) return "0.00";
    var parts = parseFloat(value).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const syncSmtpSettings = function(fnGetSetting) {
    const _get = (typeof fnGetSetting === 'function') ? fnGetSetting : getSetting;
    const smtpEnabled = _get("smtp_enabled", "0") === "1";
    try {
      const pbSettings = $app.settings();
      if (smtpEnabled) {
        const host = _get("smtp_host", "");
        const port = parseInt(_get("smtp_port", "587"), 10);
        const user = _get("smtp_username", "");
        const pass = _get("smtp_password", "");
        const senderName = _get("smtp_sender_name", "");
        const senderAddr = _get("smtp_sender_address", "");
        
        pbSettings.smtp.enabled = true;
        pbSettings.smtp.host = host;
        pbSettings.smtp.port = port;
        pbSettings.smtp.username = user;
        pbSettings.smtp.password = pass;
        pbSettings.smtp.tls = (port === 465);
        pbSettings.meta.senderName = senderName || _get("company_name", "GRAVY S.A.S");
        pbSettings.meta.senderAddress = senderAddr || user;
      } else {
        pbSettings.smtp.enabled = false;
      }
      $app.save(pbSettings);
    } catch (err) {
      console.error("[GRAVY SMTP SYNC] Falló al aplicar settings SMTP locales a PocketBase:", err);
    }
  };

  const buildPhEmailHtml = function({
    invoice,
    conceptsList,
    propertyName,
    propertyCode,
    propertyArea,
    propertyCoef,
    propertyMatricula,
    ownerName,
    ownerDocNumber,
    ownerAddress,
    ownerPhone,
    companyName,
    companyNit,
    companyAddress,
    companyPhone,
    companyEmail,
    companyCity,
    companyLogo,
    totalActual,
    notes: customNotes,
    prevMonthUnitRecaudo,
    prevMonthTotalRecaudo,
    prevMonthName
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
          <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: left; background-color: #ffffff;">${c.description}</td>
          <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; background-color: #ffffff;">${sAnt}</td>
          <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; background-color: #ffffff;">${cMes}</td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #000; font-size: 11px; color: #000; text-align: right; font-weight: bold; background-color: #ffffff;">${sAct}</td>
        </tr>`;
    }

    // Nota al pie de factura / instrucciones de recaudo
    let defaultFooterNote = "";
    try {
      defaultFooterNote = getSetting("ph_invoice_footer_note", "");
    } catch (_) {}
    const notes = (customNotes || invoice.getString("notes") || defaultFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();

    const phoneSection = companyPhone ? `TEL / PORTERÍA: ${companyPhone}` : "";
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
<body style="font-family: Arial, Helvetica, sans-serif; color: #000; background-color: #f1f5f9; margin: 0; padding: 20px; -webkit-text-size-adjust: 100%;">
  <div style="max-width: 720px; margin: 0 auto; background: #ffffff; padding: 20px; border: 1px solid #cbd5e1;">
    
    <!-- Encabezado Principal: Logo, Datos Copropiedad y Caja de Documento -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; border-bottom: 2px solid #000; padding-bottom: 10px;">
      <tr>
        <td style="width: 25%; vertical-align: middle; text-align: left; padding-right: 10px;">
          ${companyLogo 
            ? `<img src="data:image/png;base64,${companyLogo}" style="max-height: 75px; max-width: 170px; object-fit: contain; display: block;" alt="Logo Copropiedad" />`
            : `<div style="font-size: 20px; font-weight: 900; color: #000; font-family: sans-serif; letter-spacing: -0.5px;">${companyName.substring(0, 4)}</div>`
          }
        </td>
        <td style="width: 45%; text-align: center; vertical-align: top; line-height: 1.3; padding: 0 10px;">
          <div style="font-size: 14.5px; font-weight: bold; color: #000; text-transform: uppercase;">${companyName}</div>
          <div style="font-size: 11px; font-weight: bold; color: #000; margin-top: 2px;">NIT ${companyNit}</div>
          ${addressSection}
          ${contactSection}
          ${emailSection}
          ${citySection}
        </td>
        <td style="width: 30%; vertical-align: top; text-align: right;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; background-color: #ffffff;">
            <tr>
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; background-color: #ffffff; border-bottom: 1px solid #000; text-transform: uppercase; letter-spacing: 0.5px;">CUENTA DE COBRO No.</td>
            </tr>
            <tr>
              <td style="padding: 8px; text-align: center; font-size: 17px; font-weight: bold; color: #000; background-color: #ffffff; border-bottom: 1px solid #000; font-family: monospace;">${numberText}</td>
            </tr>
            <tr>
              <td style="padding: 3px; text-align: center; font-size: 9.5px; font-weight: bold; color: #000; background-color: #ffffff; text-transform: uppercase;">PERÍODO: ${getMonthNameUpper(invoice.getString("period"))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Ficha de Datos / Metadatos (Fondo Blanco Puro) -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
      <tr>
        <!-- Columna 1: Info del Propietario -->
        <td style="width: 55%; vertical-align: top; padding-right: 15px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="width: 22%; font-weight: bold; padding: 3.5px 0; color: #000;">Nombre:</td>
              <td style="width: 78%; padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Dirección:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerAddress || propertyName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Contacto:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${ownerPhone || '—'}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Cód. Unidad:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="border: none; padding: 0; font-weight: bold; color: #000;">${propertyCode || propertyName}</td>
                    <td style="width: 28%; border: 1px solid #000; font-weight: bold; text-align: center; font-size: 9px; padding: 2px; text-transform: uppercase; color: #000; background-color: #ffffff;">NIT / C.C.</td>
                    <td style="width: 38%; border-bottom: 1px solid #000; padding: 0 4px; font-weight: bold; color: #000;">${ownerDocNumber || '—'}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3.5px 0; color: #000;">Correo:</td>
              <td style="padding: 3.5px 0; border-bottom: 1px solid #000; font-weight: bold; color: #000;">${invoice.getString("email_sent_to") || '—'}</td>
            </tr>
          </table>
        </td>
        
        <!-- Columna 2: Matrícula / Ref. Banco -->
        <td style="width: 22%; vertical-align: top; padding-right: 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
            <tr>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000; background-color: #ffffff; text-transform: uppercase;">Matrícula</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; padding: 5px; text-align: center; height: 18px; font-weight: bold; color: #000; background-color: #ffffff;">${propertyMatricula || '&nbsp;'}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 4px; text-align: center; color: #000; background-color: #ffffff;">Ref. Banco</td>
            </tr>
            <tr>
              <td style="padding: 5px; text-align: center; font-weight: bold; height: 18px; color: #000; background-color: #ffffff;">${propertyName}</td>
            </tr>
          </table>
        </td>

        <!-- Columna 3: Fechas / Área -->
        <td style="width: 23%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; width: 50%; color: #000; background-color: #ffffff;">Emisión</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; width: 50%; color: #000; background-color: #ffffff;">Vencimiento</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; color: #000; background-color: #ffffff;">${fmtDateDDMMYYYY(invoice.getString("date"))}</td>
              <td style="border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; color: #000; background-color: #ffffff;">${fmtDateDDMMYYYY(invoice.getString("due_date") || invoice.getString("date"))}</td>
            </tr>
            <tr>
              <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; color: #000; background-color: #ffffff;">Área (m²)</td>
              <td style="border-bottom: 1px solid #000; font-weight: bold; padding: 3.5px; text-align: center; color: #000; background-color: #ffffff;">Coeficiente</td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; padding: 4px; text-align: center; height: 18px; font-weight: bold; color: #000; background-color: #ffffff;">${propertyArea || '&nbsp;'}</td>
              <td style="padding: 4px; text-align: center; font-weight: bold; height: 18px; color: #000; background-color: #ffffff;">${propertyCoef || '—'}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Barra de Recaudo del Mes Inmediatamente Anterior -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; border: 1px solid #000; background-color: #ffffff;">
      <tr>
        <td style="width: 50%; padding: 4.5px 8px; border-right: 1px solid #000; background-color: #ffffff; color: #000;">
          <span style="font-weight: bold; text-transform: uppercase;">Recaudo Mes Anterior Unidad ${prevMonthName ? '(' + prevMonthName + ')' : ''}:</span>
          <span style="font-weight: bold; font-family: monospace; font-size: 11px; margin-left: 6px;">$ ${cleanFmt(prevMonthUnitRecaudo)}</span>
        </td>
        <td style="width: 50%; padding: 4.5px 8px; background-color: #ffffff; color: #000;">
          <span style="font-weight: bold; text-transform: uppercase;">Total Recaudo Copropiedad ${prevMonthName ? '(' + prevMonthName + ')' : ''}:</span>
          <span style="font-weight: bold; font-family: monospace; font-size: 11px; margin-left: 6px;">$ ${cleanFmt(prevMonthTotalRecaudo)}</span>
        </td>
      </tr>
    </table>

    <!-- Tabla de Conceptos (100% de Ancho, Fondo Blanco) -->
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 14px;">
      <thead>
        <tr style="border-bottom: 1.5px solid #000;">
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: left; width: 46%; background-color: #ffffff;">CONCEPTO</th>
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">SALDO ANTERIOR</th>
          <th style="padding: 6px 8px; border-right: 1px solid #000; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">COBROS DEL MES</th>
          <th style="padding: 6px 8px; font-size: 11px; font-weight: bold; color: #000; text-align: right; width: 18%; background-color: #ffffff;">SALDO TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>

    <!-- Totales y Nota de Pago (Sin Rellenos de Color) -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
      <tr>
        <td style="width: 65%; vertical-align: top; text-align: left; padding-right: 15px;">
          <div style="background-color: #ffffff; padding: 6px 8px; border: 1px solid #000; margin-bottom: 8px; font-size: 10.5px; font-weight: bold; color: #000; text-transform: uppercase;">
            ${numeroALetras(totalActual)}
          </div>
          <div style="font-size: 10px; font-weight: bold; color: #000; line-height: 1.4; font-style: italic; text-transform: uppercase;">
            ${notes ? notes.replace(/\n/g, '<br>') : 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.'}
          </div>
        </td>
        <td style="width: 35%; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; background-color: #ffffff;">
            <tr>
              <td style="padding: 4px; text-align: center; font-size: 10px; font-weight: bold; color: #000; border-bottom: 1px solid #000; text-transform: uppercase; background-color: #ffffff;">TOTAL A PAGAR</td>
            </tr>
            <tr>
              <td style="padding: 9px 10px; font-size: 18px; font-weight: bold; color: #000; background-color: #ffffff;">
                <div style="float: left;">$</div>
                <div style="float: right;">${cleanFmt(totalActual)}</div>
                <div style="clear: both;"></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Pie de Software -->
    <div style="border-top: 1px solid #000; margin-top: 22px; padding-top: 6px; font-size: 8.5px; color: #333; text-align: center;">
      Documento emitido por GRAVY v2.0 / NIT. 901.442.115-3 — Sistema Integral de Control y Gestión de Propiedad Horizontal.
    </div>

  </div>
</body>
</html>`;
  };

  const generatePhPdfAttachment = function({
    invoice,
    conceptsList,
    propertyName,
    propertyCode,
    propertyArea,
    propertyCoef,
    propertyMatricula,
    ownerName,
    ownerNit,
    ownerDocNumber,
    ownerAddress,
    ownerPhone,
    ownerEmail,
    companyName,
    companyNit,
    companyAddress,
    companyPhone,
    companyEmail,
    companyCity,
    companyLogo,
    totalActual,
    type,
    notes,
    prevMonthUnitRecaudo,
    prevMonthTotalRecaudo,
    prevMonthName
  }) {
    const numberText = invoice.getString("number") || "cuenta";
    const docType = type || 'invoice';
    const filename = `${docType === 'statement' ? 'EstadoCuenta' : 'CuentaCobro'}_${numberText}`;

    try {
      const orchestratorRes = $http.send({
        url: "http://127.0.0.1:8088/api/ph/generate-pdf",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: filename,
          statementData: {
            companyName,
            companyNit,
            companyAddress,
            companyPhone,
            companyEmail,
            companyCity,
            companyLogo,
            docType,
            docNumber: numberText,
            period: invoice.getString("period"),
            date: invoice.getString("date"),
            dueDate: invoice.getString("due_date") || invoice.getString("date"),
            propertyName,
            propertyCode,
            propertyArea,
            propertyCoef,
            propertyMatricula,
            ownerName,
            ownerNit: ownerDocNumber || ownerNit || '—',
            ownerDocNumber: ownerDocNumber || ownerNit || '—',
            ownerAddress,
            ownerPhone,
            ownerEmail,
            conceptsList,
            totalActual,
            notes,
            prevMonthUnitRecaudo,
            prevMonthTotalRecaudo,
            prevMonthName
          }
        })
      });

      if (orchestratorRes.statusCode === 200) {
        const data = JSON.parse(orchestratorRes.raw);
        if (data.success && data.pdfPath) {
          return {
            filename: data.filename || `${filename}.pdf`,
            pdfPath: data.pdfPath
          };
        }
      }
    } catch (err) {
      console.warn("[GRAVY PH EMAIL] No se pudo generar PDF en el orquestador:", err);
    }
    return null;
  };

  let auth = null;
  try { auth = e.requestInfo()?.auth || e.auth; } catch (_) {
    try { auth = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!auth) {
    return e.json(401, { message: "Autenticación requerida." });
  }

  // Sincronizar configuraciones SMTP antes del envío
  try { syncSmtpSettings(getSetting); } catch (smtpErr) {
    console.warn("[GRAVY PH EMAIL] Advertencia al sincronizar SMTP:", smtpErr);
  }

  let body = {};
  try {
    body = e.requestInfo()?.body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (_) {}
  }
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) {}
  }

  let period = String(body?.period || body?.periodo || "").trim();
  if (!period) {
    try {
      const q = e.requestInfo()?.query || {};
      period = String(q.period || q.periodo || "").trim();
    } catch (_) {}
  }

  const type = String(body?.type || 'invoice').trim(); // 'invoice' o 'statement'
  const customSubject = String(body?.subject || '').trim();

  if (!period) {
    return e.json(400, { message: "El período es requerido (formato YYYY-MM)." });
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
      return e.json(404, { message: "No se encontraron facturas activas para el período " + period });
    }

    // Configuración de la empresa
    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");
    const companyLogo = getSetting("company_logo", "");
    const companyFooterNote = getSetting("ph_invoice_footer_note", "");

    const prevPeriod = getPreviousPeriod(period);
    const prevMonthName = getMonthNameUpper(prevPeriod);
    let prevMonthTotalRecaudo = 0;
    if (prevPeriod) {
      try {
        const allPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `period = '${prevPeriod}' && status = 'paid'`,
          "",
          1000,
          0
        );
        if (allPaid) {
          for (const p of allPaid) {
            prevMonthTotalRecaudo += p.getFloat("total");
          }
        }
      } catch (_) {}
    }

    const conceptsCache = getPhConceptsCache();

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

        const ownerDocNumber = owner.getString("doc_number") ? (owner.getString("doc_number") + (owner.getString("dv") ? "-" + owner.getString("dv") : "")) : (owner.getString("nit") || owner.getString("document") || "—");
        const ownerPhone = owner.getString("phone") || owner.getString("celular") || "—";

        let prevMonthUnitRecaudo = 0;
        if (prevPeriod) {
          try {
            const unitPaid = $app.findRecordsByFilter(
              "ph_invoices",
              `property_id = '${prop.id}' && period = '${prevPeriod}' && status = 'paid'`,
              "",
              200,
              0
            );
            if (unitPaid) {
              for (const p of unitPaid) {
                prevMonthUnitRecaudo += p.getFloat("total");
              }
            }
          } catch (_) {}
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

        // Agrupar por conceptos de forma canónica (unificando saldos anteriores y cobros del mes)
        const conceptsList = buildGroupedConceptsList(lines, outstandingInvoices, conceptsCache);
        const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

        const invoiceNotes = (inv.getString("notes") || companyFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();

        // Generar plantilla de correo
        const htmlContent = buildPhEmailHtml({
          invoice: inv,
          conceptsList,
          propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
          propertyCode: prop.getString("code") || "",
          propertyArea: prop.getString("area_m2") || prop.getString("area") || "",
          propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",
          propertyMatricula: prop.getString("matricula") || "",
          ownerName: owner.getString("name") || "Copropietario",
          ownerDocNumber,
          ownerAddress: owner.getString("address") || "",
          ownerPhone,
          companyName,
          companyNit,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCity,
          companyLogo,
          totalActual,
          notes: invoiceNotes,
          prevMonthUnitRecaudo,
          prevMonthTotalRecaudo,
          prevMonthName
        });

        const docLabel = type === 'statement' ? 'Estado de Cuenta' : 'Cuenta de Cobro';
        const emailSubject = customSubject || `${companyName} - ${docLabel} No. ${inv.getString("number")} - Unidad ${prop.getString("name")}`;

        // Generar y adjuntar archivo PDF oficial de copropiedad
        const pdfAttachment = generatePhPdfAttachment({
          invoice: inv,
          conceptsList,
          propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
          propertyCode: prop.getString("code") || "",
          propertyArea: prop.getString("area_m2") || prop.getString("area") || "",
          propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",
          propertyMatricula: prop.getString("matricula") || "",
          ownerName: owner.getString("name") || "Copropietario",
          ownerNit: ownerDocNumber,
          ownerDocNumber,
          ownerAddress: owner.getString("address") || "",
          ownerPhone,
          ownerEmail: email,
          companyName,
          companyNit,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCity,
          companyLogo,
          totalActual,
          type,
          notes: invoiceNotes
        });

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

        if (pdfAttachment && pdfAttachment.pdfPath) {
          try {
            const pdfFile = $filesystem.fileFromPath(pdfAttachment.pdfPath);
            message.attachments = {
              [pdfAttachment.filename]: pdfFile.reader.open()
            };
          } catch (attErr) {
            console.warn("[GRAVY PH EMAIL] Error al adjuntar PDF en lote:", attErr);
          }
        }

        $app.newMailClient().send(message);
        sent++;
        details.push({
          number: inv.getString("number"),
          unit: prop.getString("name"),
          email,
          status: "sent",
          pdfAttached: !!(pdfAttachment && pdfAttachment.pdfPath)
        });

        // Pausa defensiva (Throttling de 350ms) entre envíos para respetar límites de tasa y anti-spam de Gmail SMTP
        try { if (typeof sleep === 'function') sleep(350); } catch (_) {}

      } catch (err) {
        failed++;
        details.push({ number: inv.getString("number"), status: "failed", reason: err.message || String(err) });
      }
    }

    return e.json(200, {
      success: true,
      sent,
      skipped,
      failed,
      details
    });

  } catch (err) {
    console.error("[GRAVY PH EMAIL] Error inesperado en lote:", err);
    return e.json(500, { message: "Error inesperado al ejecutar envío masivo: " + err.message });
  }
});

// ──────────────────────────────────────────────────────────
// ROUTE: Descarga individual de Factura / Estado de cuenta en PDF
// ──────────────────────────────────────────────────────────
routerAdd('POST', '/api/ph/download-invoice-pdf', (e) => {
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
      return r ? (r.get("value") || fallback) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const getMonthNameUpper = function(p) {
    if (!p) return '—';
    const parts = String(p).split('-');
    const m = parseInt(parts[1], 10) || 1;
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    return months[m - 1] || '';
  };

  const getPreviousPeriod = function(period) {
    if (!period) return '';
    const parts = String(period).split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(y) || isNaN(m)) return '';
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return y + '-' + (m < 10 ? '0' + m : m);
  };

  let auth = null;
  try { auth = e.requestInfo()?.auth || e.auth; } catch (_) {
    try { auth = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!auth) {
    return e.json(401, { message: "Autenticación requerida." });
  }

  let body = {};
  try {
    body = e.requestInfo()?.body || {};
  } catch (_) {
    try {
      body = $apis.requestInfo(e).body || {};
    } catch (_) {}
  }
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) {}
  }

  let invoiceId = body?.invoiceId || body?.id || body?.invoice_id;
  if (!invoiceId) {
    try {
      const q = e.requestInfo()?.query || {};
      invoiceId = q.invoiceId || q.id || q.invoice_id;
    } catch (_) {}
  }

  const type = String(body?.type || 'invoice').trim(); // 'invoice' o 'statement'

  if (!invoiceId) {
    return e.json(400, { message: "El ID de la factura es requerido." });
  }

  try {
    const inv = $app.findRecordById("ph_invoices", invoiceId);
    if (!inv) {
      return e.json(404, { message: "Factura no encontrada." });
    }

    $app.expandRecord(inv, ["property_id"], null);
    const prop = inv.expandedOne("property_id");
    if (!prop) {
      e.json(404, { message: "Propiedad asociada no encontrada." });
      return;
    }

    $app.expandRecord(prop, ["owner_id"], null);
    const owner = prop.expandedOne("owner_id");

    const lines = $app.findRecordsByFilter(
      "ph_invoice_lines",
      `invoice_id = '${inv.id}'`,
      "line_order",
      200,
      0
    );

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

    // Agrupar por conceptos de forma canónica (unificando saldos anteriores y cobros del mes)
    const conceptsList = buildGroupedConceptsList(lines, outstandingInvoices);
    const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

    const ownerDocNumber = owner ? (owner.getString("doc_number") ? (owner.getString("doc_number") + (owner.getString("dv") ? "-" + owner.getString("dv") : "")) : (owner.getString("nit") || owner.getString("document") || "—")) : "—";
    const ownerPhone = owner ? (owner.getString("phone") || owner.getString("celular") || "—") : "—";

    const prevPeriod = getPreviousPeriod(inv.getString("period"));
    const prevMonthName = getMonthNameUpper(prevPeriod);
    let prevMonthUnitRecaudo = 0;
    let prevMonthTotalRecaudo = 0;
    if (prevPeriod) {
      try {
        const unitPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `property_id = '${prop.id}' && period = '${prevPeriod}' && status = 'paid'`,
          "",
          200,
          0
        );
        if (unitPaid) {
          for (const p of unitPaid) {
            prevMonthUnitRecaudo += p.getFloat("total");
          }
        }
        const allPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `period = '${prevPeriod}' && status = 'paid'`,
          "",
          1000,
          0
        );
        if (allPaid) {
          for (const p of allPaid) {
            prevMonthTotalRecaudo += p.getFloat("total");
          }
        }
      } catch (errRec) {
        console.warn("[GRAVY PH EMAIL] Advertencia al calcular recaudos mes anterior:", errRec);
      }
    }

    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");
    const companyLogo = getSetting("company_logo", "");
    const companyFooterNote = getSetting("ph_invoice_footer_note", "");
    const invoiceNotes = (inv.getString("notes") || companyFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();

    const numberText = inv.getString("number") || "cuenta";
    const docType = type || 'invoice';
    const rawUnit = prop.getString("name") || prop.getString("code") || "Unidad";
    const cleanUnit = rawUnit.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filename = `${docType === 'statement' ? 'EstadoCuenta' : 'CuentaCobro'}_${numberText}_${cleanUnit}`;

    const orchestratorRes = $http.send({
      url: "http://127.0.0.1:8088/api/ph/generate-pdf",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: filename,
        format: "base64",
        statementData: {
          companyName,
          companyNit,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCity,
          companyLogo,
          docType,
          docNumber: numberText,
          period: inv.getString("period"),
          date: inv.getString("date"),
          dueDate: inv.getString("due_date") || inv.getString("date"),
          propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
          propertyCode: prop.getString("code") || "",
          propertyArea: prop.getString("area_m2") || prop.getString("area") || "",
          propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",
          propertyMatricula: prop.getString("matricula") || "",
          ownerName: owner ? owner.getString("name") : "Copropietario",
          ownerNit: ownerDocNumber,
          ownerDocNumber,
          ownerAddress: owner ? owner.getString("address") : "",
          ownerPhone,
          ownerEmail: owner ? (owner.getString("email") || owner.getString("correo") || "—") : "—",
          conceptsList,
          totalActual,
          notes: invoiceNotes,
          prevMonthUnitRecaudo,
          prevMonthTotalRecaudo,
          prevMonthName
        }
      })
    });

    if (orchestratorRes.statusCode === 200) {
      const data = JSON.parse(orchestratorRes.raw);
      if (data.pdfBase64) {
        return e.json(200, {
          success: true,
          pdfBase64: data.pdfBase64,
          filename: `${filename}.pdf`
        });
      }
    }

    return e.json(500, { message: "No se pudo generar el archivo PDF en el orquestador." });
  } catch (err) {
    console.error("[GRAVY PH EMAIL] Error generando PDF individual:", err);
    return e.json(500, { message: "Error al generar PDF individual: " + err.message });
  }
});

// ──────────────────────────────────────────────────────────
// ROUTE: Descarga de PDF Único Unificado (Multipágina) para todas las facturas del período
// ──────────────────────────────────────────────────────────
routerAdd('POST', '/api/ph/download-period-pdf', (e) => {
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = '" + String(key || '').replace(/'/g, "''") + "'");
      return r ? (r.get("value") || fallback) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const getMonthNameUpper = function(p) {
    if (!p) return '—';
    const parts = String(p).split('-');
    const m = parseInt(parts[1], 10) || 1;
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    return months[m - 1] || '';
  };

  const getPreviousPeriod = function(period) {
    if (!period) return '';
    const parts = String(period).split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(y) || isNaN(m)) return '';
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return y + '-' + (m < 10 ? '0' + m : m);
  };

  let auth = null;
  try { auth = e.requestInfo()?.auth || e.auth; } catch (_) {
    try { auth = $apis.requestInfo(e).authRecord; } catch (_) {}
  }
  if (!auth) {
    return e.json(401, { message: "Autenticación requerida." });
  }

  let body = {};
  try { body = e.requestInfo()?.body || {}; } catch (_) {
    try { body = $apis.requestInfo(e).body || {}; } catch (_) {}
  }
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) {}
  }

  let period = String(body?.period || body?.periodo || "").trim();
  if (!period) {
    try {
      const q = e.requestInfo()?.query || {};
      period = String(q.period || q.periodo || "").trim();
    } catch (_) {}
  }

  const type = String(body?.type || 'invoice').trim(); // 'invoice' o 'statement'

  if (!period) {
    return e.json(400, { message: "El período de facturación es requerido (formato YYYY-MM)." });
  }

  try {
    const invoices = $app.findRecordsByFilter(
      "ph_invoices",
      `period = '${period}' && status != 'voided'`,
      "number",
      2000,
      0
    );

    if (!invoices || invoices.length === 0) {
      return e.json(404, { message: `No hay facturas activas para el período ${period}.` });
    }

    const companyName = getSetting("company_name", "GRAVY S.A.S");
    const companyNit = getSetting("company_nit", "");
    const companyAddress = getSetting("company_address", "");
    const companyPhone = getSetting("company_phone", "");
    const companyEmail = getSetting("company_email", "");
    const companyCity = getSetting("company_city", "");
    const companyLogo = getSetting("company_logo", "");
    const companyFooterNote = getSetting("ph_invoice_footer_note", "");

    const prevPeriod = getPreviousPeriod(period);
    const prevMonthName = getMonthNameUpper(prevPeriod);
    let prevMonthTotalRecaudo = 0;

    if (prevPeriod) {
      try {
        const allPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `period = '${prevPeriod}' && status = 'paid'`,
          "",
          1000,
          0
        );
        if (allPaid) {
          for (const p of allPaid) {
            prevMonthTotalRecaudo += p.getFloat("total");
          }
        }
      } catch (errRec) {
        console.warn("[GRAVY PH EMAIL] Advertencia al calcular recaudos globales mes anterior:", errRec);
      }
    }

    const conceptsCache = getPhConceptsCache();
    const statements = [];

    for (const inv of invoices) {
      $app.expandRecord(inv, ["property_id"], null);
      const prop = inv.expandedOne("property_id");
      if (!prop) continue;

      $app.expandRecord(prop, ["owner_id"], null);
      const owner = prop.expandedOne("owner_id");

      const lines = $app.findRecordsByFilter(
        "ph_invoice_lines",
        `invoice_id = '${inv.id}'`,
        "line_order",
        200,
        0
      );

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

      // Agrupar por conceptos de forma canónica (unificando saldos anteriores y cobros del mes)
      const conceptsList = buildGroupedConceptsList(lines, outstandingInvoices, conceptsCache);
      const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

      const ownerDocNumber = owner ? (owner.getString("doc_number") ? (owner.getString("doc_number") + (owner.getString("dv") ? "-" + owner.getString("dv") : "")) : (owner.getString("nit") || owner.getString("document") || "—")) : "—";
      const ownerPhone = owner ? (owner.getString("phone") || owner.getString("celular") || "—") : "—";

      let prevMonthUnitRecaudo = 0;
      if (prevPeriod) {
        try {
          const unitPaid = $app.findRecordsByFilter(
            "ph_invoices",
            `property_id = '${prop.id}' && period = '${prevPeriod}' && status = 'paid'`,
            "",
            200,
            0
          );
          if (unitPaid) {
            for (const p of unitPaid) {
              prevMonthUnitRecaudo += p.getFloat("total");
            }
          }
        } catch (_) {}
      }

      const invoiceNotes = (inv.getString("notes") || companyFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();
      const numberText = inv.getString("number") || "0000";

      statements.push({
        companyName,
        companyNit,
        companyAddress,
        companyPhone,
        companyEmail,
        companyCity,
        companyLogo,
        docType: type,
        docNumber: numberText,
        period: inv.getString("period"),
        date: inv.getString("date"),
        dueDate: inv.getString("due_date") || inv.getString("date"),
        propertyName: prop.getString("name") || prop.getString("code") || "Unidad",
        propertyCode: prop.getString("code") || "",
        propertyArea: prop.getString("area_m2") || prop.getString("area") || "",
        propertyCoef: prop.getString("coef_participacion") ? (prop.getString("coef_participacion") + "%") : "",
        propertyMatricula: prop.getString("matricula") || "",
        ownerName: owner ? owner.getString("name") : "Copropietario",
        ownerNit: ownerDocNumber,
        ownerDocNumber,
        ownerAddress: owner ? owner.getString("address") : "",
        ownerPhone,
        ownerEmail: owner ? (owner.getString("email") || owner.getString("correo") || "—") : "—",
        conceptsList,
        totalActual,
        notes: invoiceNotes,
        prevMonthUnitRecaudo,
        prevMonthTotalRecaudo,
        prevMonthName
      });
    }

    const docTypeLabel = type === 'statement' ? 'EstadosCuenta' : 'Facturas';
    const cleanPeriod = period.replace(/[^0-9\-]/g, '');
    const filename = `${docTypeLabel}_Copropiedad_${cleanPeriod}`;

    const orchestratorRes = $http.send({
      url: "http://127.0.0.1:8088/api/ph/generate-bulk-pdf",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: filename,
        statements: statements,
        format: "base64"
      })
    });

    if (orchestratorRes.statusCode === 200) {
      const data = JSON.parse(orchestratorRes.raw);
      if (data.pdfBase64) {
        return e.json(200, {
          success: true,
          pdfBase64: data.pdfBase64,
          filename: `${filename}.pdf`,
          totalInvoices: statements.length
        });
      }
    }

    return e.json(500, { message: "No se pudo generar el archivo PDF consolidado en el orquestador." });
  } catch (err) {
    console.error("[GRAVY PH EMAIL] Error generando PDF unificado del período:", err);
    return e.json(500, { message: "Error al generar PDF unificado: " + err.message });
  }
});

