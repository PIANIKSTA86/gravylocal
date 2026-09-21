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

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Calcula el total de pagos contables ya aplicados a una factura PH.
// Consulta tx_lines (cuentas 13xxxx) via cross_doc_ref o cross_number. Retorna total recaudado (créditos).
// ─────────────────────────────────────────────────────────────────────────────
function getNetPaymentsForPhInvoice(invoiceNumber, thirdPartyId) {
  if (!invoiceNumber) return 0;
  try {
    var cleanNum = String(invoiceNumber).trim();
    var sql =
      "SELECT COALESCE(SUM(l.credit), 0) AS total_paid" +
      " FROM tx_lines l" +
      " INNER JOIN transactions t ON t.id = l.tx_id" +
      " INNER JOIN accounts a ON a.id = l.account_id" +
      " WHERE t.status = 'active'" +
      "   AND a.code LIKE '13%'" +
      "   AND (" +
      "     l.cross_doc_ref = {:invoiceNumber}" +
      "     OR l.cross_doc_ref LIKE {:invoiceNumberLike}" +
      "     OR (t.cross_type = 'ph_invoices' AND t.cross_number = {:invoiceNumber})" +
      "   )";
    var binds = {
      invoiceNumber: cleanNum,
      invoiceNumberLike: cleanNum + '-%'
    };
    if (thirdPartyId && String(thirdPartyId).trim()) {
      sql += " AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = {:thirdPartyId}";
      binds.thirdPartyId = String(thirdPartyId).trim();
    }
    var query = $app.db().newQuery(sql);
    query.bind(binds);
    var result = new DynamicModel({ total_paid: 0 });
    query.one(result);
    return Math.max(0, Number(result.total_paid || 0));
  } catch (errPay) {
    console.warn('[GRAVY PH] Error al calcular pagos para factura ' + invoiceNumber + ':', errPay);
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Marca automáticamente una factura PH como paid si el saldo
// contable real (tx_lines) cubre el total de la factura.
// ─────────────────────────────────────────────────────────────────────────────
function autoMarkPaidIfSettled(invoiceRecord) {
  try {
    var invNumber = invoiceRecord.getString ? invoiceRecord.getString("number") : (invoiceRecord.number || "");
    var invStatus = invoiceRecord.getString ? invoiceRecord.getString("status") : (invoiceRecord.status || "");
    var invTotal  = invoiceRecord.getFloat  ? invoiceRecord.getFloat("total")   : (Number(invoiceRecord.total) || 0);
    if (!invNumber || invTotal <= 0 || invStatus === 'paid' || invStatus === 'voided') return;
    var paid = getNetPaymentsForPhInvoice(invNumber, null);
    if (paid >= invTotal - 0.01) {
      if (invoiceRecord.set) {
        invoiceRecord.set("status", "paid");
        $app.save(invoiceRecord);
      } else if (invoiceRecord.id) {
        var rec = $app.findRecordById("ph_invoices", invoiceRecord.id);
        if (rec) {
          rec.set("status", "paid");
          $app.save(rec);
        }
      }
      console.log('[GRAVY PH] Factura ' + invNumber + ' marcada automáticamente como paid (Total: ' + invTotal + ', Pagado: ' + paid + ').');
    }
  } catch (errMark) {
    console.warn('[GRAVY PH] No se pudo auto-marcar factura como paid:', errMark);
  }
}

// Sincroniza en lote facturas posted de una propiedad
function syncPropertyInvoicesStatus(propertyId) {
  if (!propertyId) return;
  try {
    var invoices = $app.findRecordsByFilter("ph_invoices", "property_id = '" + propertyId + "' && status = 'posted'", "", 500, 0);
    if (invoices) {
      for (var i = 0; i < invoices.length; i++) {
        autoMarkPaidIfSettled(invoices[i]);
      }
    }
  } catch (err) {
    console.warn('[GRAVY PH] Error sincronizando estado de facturas de propiedad ' + propertyId + ':', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Obtiene el recaudo contable real del mes anterior tanto para la unidad
// como para la copropiedad entera consultando directamente tx_lines (cuentas 13%).
// ─────────────────────────────────────────────────────────────────────────────
function getPreviousMonthRecaudos(propertyId, ownerId, prevPeriod) {
  var unitRecaudo = 0;
  var totalRecaudo = 0;
  if (!prevPeriod) return { unitRecaudo: unitRecaudo, totalRecaudo: totalRecaudo };
  var startDate = prevPeriod + '-01';
  var endDate = prevPeriod + '-31 23:59:59';

  // 1. Total recaudo PH en el mes anterior (todas las cuentas 13% en el mes)
  try {
    var sqlAll =
      "SELECT COALESCE(SUM(l.credit), 0) AS total" +
      " FROM tx_lines l" +
      " INNER JOIN transactions t ON t.id = l.tx_id" +
      " INNER JOIN accounts a ON a.id = l.account_id" +
      " WHERE t.status = 'active'" +
      "   AND a.code LIKE '13%'" +
      "   AND (t.number LIKE 'RC-%' OR t.teso_mode != '')" +
      "   AND t.date >= {:startDate}" +
      "   AND t.date <= {:endDate}";
    var qAll = $app.db().newQuery(sqlAll);
    qAll.bind({ startDate: startDate, endDate: endDate });
    var resAll = new DynamicModel({ total: 0 });
    qAll.one(resAll);
    totalRecaudo = Number(resAll.total || 0);
  } catch (eAll) {
    console.warn('[GRAVY PH] Error calculando totalRecaudo:', eAll);
  }

  // 2. Recaudo de la unidad en el mes anterior
  try {
    var sqlUnit =
      "SELECT COALESCE(SUM(l.credit), 0) AS total" +
      " FROM tx_lines l" +
      " INNER JOIN transactions t ON t.id = l.tx_id" +
      " INNER JOIN accounts a ON a.id = l.account_id" +
      " WHERE t.status = 'active'" +
      "   AND a.code LIKE '13%'" +
      "   AND (t.number LIKE 'RC-%' OR t.teso_mode != '')" +
      "   AND t.date >= {:startDate}" +
      "   AND t.date <= {:endDate}" +
      "   AND (";
    var conds = [];
    var binds = { startDate: startDate, endDate: endDate };
    if (ownerId && String(ownerId).trim()) {
      conds.push("t.third_party_id = {:ownerId}");
      conds.push("l.third_party_id = {:ownerId}");
      binds.ownerId = String(ownerId).trim();
    }
    if (propertyId && String(propertyId).trim()) {
      conds.push("t.teso_params LIKE {:propPattern}");
      binds.propPattern = '%"ph_property_id":"' + String(propertyId).trim() + '"%';
    }
    if (conds.length > 0) {
      sqlUnit += conds.join(" OR ") + ")";
      var qUnit = $app.db().newQuery(sqlUnit);
      qUnit.bind(binds);
      var resUnit = new DynamicModel({ total: 0 });
      qUnit.one(resUnit);
      unitRecaudo = Number(resUnit.total || 0);
    }
  } catch (eUnit) {
    console.warn('[GRAVY PH] Error calculando unitRecaudo:', eUnit);
  }

  // Fallback a ph_invoices si contabilidad arrojó 0
  if (unitRecaudo <= 0 && propertyId) {
    try {
      var unitPaid = $app.findRecordsByFilter(
        "ph_invoices",
        "property_id = '" + propertyId + "' && period = '" + prevPeriod + "' && status = 'paid'",
        "",
        100,
        0
      );
      if (unitPaid) {
        for (var i = 0; i < unitPaid.length; i++) {
          unitRecaudo += unitPaid[i].getFloat("total");
        }
      }
    } catch (_) {}
  }

  return { unitRecaudo: unitRecaudo, totalRecaudo: totalRecaudo };
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

  // ── Saldo anterior: descuenta pagos contables reales via tx_lines ──────────
  if (outstandingInvoices) {
    for (var j = 0; j < outstandingInvoices.length; j++) {
      var oldInv = outstandingInvoices[j];
      var invNumber    = oldInv.getString ? oldInv.getString("number")         : (oldInv.number         || "");
      var invThirdId   = oldInv.getString ? oldInv.getString("third_party_id") : (oldInv.third_party_id || "");
      var invoiceTotal = oldInv.getFloat  ? oldInv.getFloat("total")           : (Number(oldInv.total)  || 0);

      // Pagos reales ya registrados en contabilidad para esta factura
      var alreadyPaid    = getNetPaymentsForPhInvoice(invNumber, invThirdId);
      var pendingBalance = Math.max(0, invoiceTotal - alreadyPaid);

      if (pendingBalance < 0.01) {
        try { autoMarkPaidIfSettled(oldInv); } catch (_) {}
        continue;
      }

      // Factor de proporción para pagos parciales
      var proportionFactor = (invoiceTotal > 0.01) ? (pendingBalance / invoiceTotal) : 1;

      var oldLines = $app.findRecordsByFilter(
        "ph_invoice_lines",
        "invoice_id = '" + oldInv.id + "'",
        "line_order",
        200,
        0
      );
      if (oldLines) {
        for (var k = 0; k < oldLines.length; k++) {
          var ol        = oldLines[k];
          var groupOld  = resolveConceptGroup(ol, cache);
          var keyOld    = groupOld.groupKey;
          var amountOld = ol.getFloat ? ol.getFloat("amount") : (Number(ol.amount) || 0);
          var pendingAmt = Math.round(amountOld * proportionFactor * 100) / 100;
          if (pendingAmt < 0.01) continue;
          if (!conceptsMap[keyOld]) {
            conceptsMap[keyOld] = {
              conceptId: groupOld.conceptId,
              description: groupOld.description,
              saldoAnterior: 0,
              cobrosMes: 0,
              saldoActual: 0
            };
          }
          conceptsMap[keyOld].saldoAnterior += pendingAmt;
          conceptsMap[keyOld].saldoActual   += pendingAmt;
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

// Exponer helpers en globalThis para que estén disponibles en callbacks de routerAdd (Goja)
try {
  globalThis.getSetting = getSetting;
  globalThis.fmtCurrency = fmtCurrency;
  globalThis.getMonthNameUpper = getMonthNameUpper;
  globalThis.fmtDateDDMMYYYY = fmtDateDDMMYYYY;
  globalThis.getPreviousPeriod = getPreviousPeriod;
  globalThis.getCanonicalConceptName = getCanonicalConceptName;
  globalThis.getPhConceptsCache = getPhConceptsCache;
  globalThis.resolveConceptGroup = resolveConceptGroup;
  globalThis.getNetPaymentsForPhInvoice = getNetPaymentsForPhInvoice;
  globalThis.autoMarkPaidIfSettled = autoMarkPaidIfSettled;
  globalThis.syncPropertyInvoicesStatus = syncPropertyInvoicesStatus;
  globalThis.getPreviousMonthRecaudos = getPreviousMonthRecaudos;
  globalThis.buildGroupedConceptsList = buildGroupedConceptsList;
} catch (_) {}

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

  const getCanonicalConceptName = (typeof globalThis.getCanonicalConceptName === 'function') ? globalThis.getCanonicalConceptName : function(rawDesc) { return String(rawDesc || '').trim() || 'CONCEPTO'; };
  const getPhConceptsCache = (typeof globalThis.getPhConceptsCache === 'function') ? globalThis.getPhConceptsCache : function() { return { byId:{}, moraId:'', admId:'', byCanonicalName:{} }; };
  const resolveConceptGroup = (typeof globalThis.resolveConceptGroup === 'function') ? globalThis.resolveConceptGroup : function(line, cache) { return { groupKey: "__CONCEPT__", conceptId: "", description: "CONCEPTO" }; };
  const getNetPaymentsForPhInvoice = (typeof globalThis.getNetPaymentsForPhInvoice === 'function') ? globalThis.getNetPaymentsForPhInvoice : function() { return 0; };
  const autoMarkPaidIfSettled = (typeof globalThis.autoMarkPaidIfSettled === 'function') ? globalThis.autoMarkPaidIfSettled : function() {};
  const getPreviousMonthRecaudos = (typeof globalThis.getPreviousMonthRecaudos === 'function') ? globalThis.getPreviousMonthRecaudos : function() { return { unitRecaudo: 0, totalRecaudo: 0 }; };
  const buildGroupedConceptsList = (typeof globalThis.buildGroupedConceptsList === 'function') ? globalThis.buildGroupedConceptsList : function() { return []; };

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
    const prevRecaudos = getPreviousMonthRecaudos(prop ? prop.id : '', owner ? owner.id : '', prevPeriod);
    const prevMonthUnitRecaudo = prevRecaudos.unitRecaudo;
    const prevMonthTotalRecaudo = prevRecaudos.totalRecaudo;

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

      try {
        invoice.set("email_sent", true);
        invoice.set("email_sent_to", targetEmail);
        invoice.set("email_sent_at", new Date().toISOString().replace('T', ' ').substring(0, 19));
        invoice.set("email_status", "sent");
        invoice.set("email_last_error", "");
        $app.save(invoice);
      } catch (saveErr) {
        console.warn("[GRAVY PH EMAIL] No se pudo persistir estado individual:", saveErr);
      }
    } catch (mailErr) {
      console.error("[GRAVY PH EMAIL] Falló el envío SMTP:", mailErr);
      try {
        invoice.set("email_status", "failed");
        invoice.set("email_last_error", String(mailErr && mailErr.message ? mailErr.message : mailErr || "").substring(0, 250));
        $app.save(invoice);
      } catch (_) {}
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

  const getCanonicalConceptName = (typeof globalThis.getCanonicalConceptName === 'function') ? globalThis.getCanonicalConceptName : function(rawDesc) { return String(rawDesc || '').trim() || 'CONCEPTO'; };
  const getPhConceptsCache = (typeof globalThis.getPhConceptsCache === 'function') ? globalThis.getPhConceptsCache : function() { return { byId:{}, moraId:'', admId:'', byCanonicalName:{} }; };
  const resolveConceptGroup = (typeof globalThis.resolveConceptGroup === 'function') ? globalThis.resolveConceptGroup : function(line, cache) { return { groupKey: "__CONCEPT__", conceptId: "", description: "CONCEPTO" }; };
  const getNetPaymentsForPhInvoice = (typeof globalThis.getNetPaymentsForPhInvoice === 'function') ? globalThis.getNetPaymentsForPhInvoice : function() { return 0; };
  const autoMarkPaidIfSettled = (typeof globalThis.autoMarkPaidIfSettled === 'function') ? globalThis.autoMarkPaidIfSettled : function() {};
  const getPreviousMonthRecaudos = (typeof globalThis.getPreviousMonthRecaudos === 'function') ? globalThis.getPreviousMonthRecaudos : function() { return { unitRecaudo: 0, totalRecaudo: 0 }; };
  const buildGroupedConceptsList = (typeof globalThis.buildGroupedConceptsList === 'function') ? globalThis.buildGroupedConceptsList : function() { return []; };

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
    prevMonthName,
    customMessageHtml,
    customNoticeHtml
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

    <!-- Mensaje Personalizado de la Administración -->
    ${customMessageHtml ? `
    <div style="margin-bottom: 14px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; line-height: 1.5; color: #1e293b;">
      ${customMessageHtml}
    </div>` : ''}

    <!-- Aviso Especial / Circular / Asamblea -->
    ${customNoticeHtml ? `
    <div style="margin-bottom: 14px; padding: 12px 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; font-size: 12px; line-height: 1.5; color: #92400e;">
      <div style="font-weight: bold; margin-bottom: 4px; font-size: 12.5px;">📢 AVISO IMPORTANTE DE LA ADMINISTRACIÓN</div>
      <div>${customNoticeHtml}</div>
    </div>` : ''}

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
  const customMessage = String(body?.message || '').trim();
  const customNotice = String(body?.notice !== undefined ? body.notice : '').trim();

  let targetInvoiceIds = null;
  if (Array.isArray(body?.invoiceIds) && body.invoiceIds.length > 0) {
    targetInvoiceIds = body.invoiceIds.map(id => String(id || '').trim()).filter(Boolean);
  }

  // Filtro inteligente para reanudar envíos pendientes (omite los ya despachados)
  let onlyPending = true;
  if (body?.onlyPending !== undefined) {
    onlyPending = !!body.onlyPending;
  } else {
    try {
      const q = e.requestInfo()?.query || {};
      if (q.onlyPending !== undefined) onlyPending = q.onlyPending !== 'false';
      else if (q.only_pending !== undefined) onlyPending = q.only_pending !== 'false';
    } catch (_) {}
  }

  if (!period) {
    return e.json(400, { message: "El período es requerido (formato YYYY-MM)." });
  }

  // Plantillas de asunto y cuerpo configurables con tokens
  const defaultSubjectTemplate = type === 'statement'
    ? (getSetting("ph_email_template_statement_subject", "") || "{copropiedad} — Estado de Cuenta {periodo} — Unidad {unidad}")
    : (getSetting("ph_email_template_invoice_subject", "") || "{copropiedad} — Cuenta de Cobro No. {numero_factura} — Unidad {unidad}");

  const defaultBodyTemplate = type === 'statement'
    ? (getSetting("ph_email_template_statement_body", "") || "Estimado(a) {propietario},\n\nLe compartimos su estado de cuenta integral correspondiente al período {periodo} para la unidad {unidad}.\n\n{aviso_adicional}\n\nAdjunto a este correo encontrará su documento oficial en formato PDF.\n\nInstrucciones de Pago:\n{instrucciones_pago}\n\nAtentamente,\nAdministración {copropiedad}")
    : (getSetting("ph_email_template_invoice_body", "") || "Estimado(a) {propietario},\n\nLe compartimos su cuenta de cobro correspondiente al período {periodo} para la unidad {unidad}.\n\n{aviso_adicional}\n\nAdjunto a este correo encontrará su documento oficial en formato PDF.\n\nInstrucciones de Pago:\n{instrucciones_pago}\n\nAgradecemos realizar su pago oportunamente.\nAtentamente,\nAdministración {copropiedad}");

  const effectiveSubjectTemplate = customSubject || defaultSubjectTemplate;
  const effectiveBodyTemplate = customMessage || defaultBodyTemplate;
  const rawNotice = customNotice || getSetting("ph_email_monthly_notice", "");

  const interpolatePhTokens = function(templateStr, ctx) {
    if (!templateStr) return "";
    let res = String(templateStr);
    res = res.replace(/\{aviso_adicional\}/gi, ctx.noticeText || "");
    res = res.replace(/\{propietario\}/gi, ctx.ownerName || "Copropietario");
    res = res.replace(/\{unidad\}/gi, ctx.unitName || "Unidad");
    res = res.replace(/\{periodo\}/gi, ctx.periodLabel || "");
    res = res.replace(/\{numero_factura\}/gi, ctx.invoiceNumber || "");
    res = res.replace(/\{total_mes\}/gi, ctx.totalMesFmt || "$ 0");
    res = res.replace(/\{saldo_anterior\}/gi, ctx.saldoAnteriorFmt || "$ 0");
    res = res.replace(/\{total_pagar\}/gi, ctx.totalPagarFmt || "$ 0");
    res = res.replace(/\{fecha_emision\}/gi, ctx.dateFmt || "");
    res = res.replace(/\{fecha_vencimiento\}/gi, ctx.dueDateFmt || "");
    res = res.replace(/\{copropiedad\}/gi, ctx.companyName || "Copropiedad");
    res = res.replace(/\{nit_copropiedad\}/gi, ctx.companyNit || "");
    res = res.replace(/\{instrucciones_pago\}/gi, ctx.paymentInstructions || "");
    return res;
  };

  try {
    let invoices = [];
    if (targetInvoiceIds && targetInvoiceIds.length > 0) {
      for (const invId of targetInvoiceIds) {
        try {
          const inv = $app.findRecordById("ph_invoices", invId);
          if (inv && inv.getString("status") !== "voided") {
            invoices.push(inv);
          }
        } catch (_) {}
      }
    } else {
      invoices = $app.findRecordsByFilter(
        "ph_invoices",
        `period = '${period}' && status != 'voided'`,
        "number",
        2000,
        0
      );
    }

    if (!invoices.length) {
      return e.json(404, { message: "No se encontraron facturas activas para procesar en el período " + period });
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
    let circuitBreakerTriggered = false;
    let circuitBreakerReason = "";
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
          try {
            inv.set("email_status", "skipped");
            inv.set("email_last_error", "Propietario sin email registrado");
            $app.save(inv);
          } catch (_) {}
          details.push({ number: inv.getString("number"), unit: prop.getString("name"), status: "skipped", reason: "Propietario sin email registrado" });
          continue;
        }

        // Si onlyPending está activo, omitir si la factura ya fue enviada con éxito previamente
        const alreadySent = (inv.getBool && inv.getBool("email_sent")) || inv.getString("email_status") === "sent";
        if (onlyPending && alreadySent) {
          skipped++;
          const sentAtStr = inv.getString("email_sent_at") ? ` el ${inv.getString("email_sent_at")}` : "";
          details.push({
            number: inv.getString("number"),
            unit: prop.getString("name"),
            email: inv.getString("email_sent_to") || email,
            status: "skipped",
            reason: `Ya enviada exitosamente${sentAtStr} (Omitida para reanudar pendientes)`
          });
          continue;
        }

        const ownerDocNumber = owner.getString("doc_number") ? (owner.getString("doc_number") + (owner.getString("dv") ? "-" + owner.getString("dv") : "")) : (owner.getString("nit") || owner.getString("document") || "—");
        const ownerPhone = owner.getString("phone") || owner.getString("celular") || "—";

        const prevRecaudosBatch = getPreviousMonthRecaudos(prop ? prop.id : '', owner ? owner.id : '', prevPeriod);
        const prevMonthUnitRecaudo = prevRecaudosBatch.unitRecaudo;

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

        const saldoAnterior = conceptsList.reduce((s, c) => s + (c.saldoAnterior || 0), 0);
        const cobrosMes = conceptsList.reduce((s, c) => s + (c.cobrosMes || 0), 0);
        const totalPagar = totalActual;
        const periodParts = String(inv.getString("period") || "").split("-");
        const periodMonthYear = getMonthNameUpper(inv.getString("period")) + (periodParts.length > 1 ? (" " + periodParts[0]) : "");

        const tokenCtx = {
          ownerName: owner.getString("name") || "Copropietario",
          unitName: prop.getString("name") || prop.getString("code") || "Unidad",
          periodLabel: periodMonthYear,
          invoiceNumber: inv.getString("number"),
          totalMesFmt: fmtCurrency(cobrosMes),
          saldoAnteriorFmt: fmtCurrency(saldoAnterior),
          totalPagarFmt: fmtCurrency(totalPagar),
          dateFmt: fmtDateDDMMYYYY(inv.getString("date")),
          dueDateFmt: fmtDateDDMMYYYY(inv.getString("due_date") || inv.getString("date")),
          companyName: companyName,
          companyNit: companyNit,
          paymentInstructions: invoiceNotes,
          noticeText: rawNotice
        };

        const emailSubject = interpolatePhTokens(effectiveSubjectTemplate, tokenCtx);

        let interpolatedBody = interpolatePhTokens(effectiveBodyTemplate, tokenCtx);
        let noticeBlockHtml = "";
        if (rawNotice) {
          if (!effectiveBodyTemplate.includes("{aviso_adicional}")) {
            noticeBlockHtml = rawNotice.split('\n').map(p => p.trim() ? `<p style="margin: 0 0 6px 0;">${p}</p>` : '').join('');
          }
        }

        const messageParagraphsHtml = interpolatedBody
          .split('\n')
          .map(p => p.trim() ? `<p style="margin: 0 0 8px 0;">${p}</p>` : '')
          .join('');

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
          prevMonthName,
          customMessageHtml: messageParagraphsHtml,
          customNoticeHtml: noticeBlockHtml
        });

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

        // Registrar persistencia del envío exitoso en la factura
        try {
          inv.set("email_sent", true);
          inv.set("email_sent_to", email);
          inv.set("email_sent_at", new Date().toISOString().replace('T', ' ').substring(0, 19));
          inv.set("email_status", "sent");
          inv.set("email_last_error", "");
          $app.save(inv);
        } catch (saveErr) {
          console.warn("[GRAVY PH EMAIL] Advertencia al persistir estado enviado:", saveErr);
        }

        details.push({
          number: inv.getString("number"),
          unit: prop.getString("name"),
          email,
          status: "sent",
          pdfAttached: !!(pdfAttachment && pdfAttachment.pdfPath)
        });

        // Pausa defensiva (Throttling de 450ms) entre envíos para respetar límites de tasa
        try { if (typeof sleep === 'function') sleep(450); } catch (_) {}

      } catch (err) {
        failed++;
        const errMsg = String(err && err.message ? err.message : err || "");

        // Registrar fallo en la factura
        try {
          inv.set("email_status", "failed");
          inv.set("email_last_error", errMsg.substring(0, 250));
          $app.save(inv);
        } catch (_) {}

        details.push({ number: inv.getString("number"), status: "failed", reason: errMsg });

        // CIRCUIT BREAKER INTELIGENTE: Detectar bloqueo o cuota superada en el servidor SMTP
        const isDailyLimit = errMsg.includes("550") || errMsg.includes("Daily user sending limit") || errMsg.includes("limit exceeded") || errMsg.includes("Quota exceeded");
        const isLoginBlocked = errMsg.includes("454") || errMsg.includes("Too many login attempts") || errMsg.includes("try again later");
        const isAuthFailed = errMsg.includes("535") || errMsg.includes("Authentication failed") || errMsg.includes("BadCredentials") || errMsg.includes("Username and Password not accepted");

        if (isDailyLimit || isLoginBlocked || isAuthFailed) {
          circuitBreakerTriggered = true;
          if (isDailyLimit) {
            circuitBreakerReason = "Límite diario de envío de correos excedido en el servidor SMTP (Código 550). Proceso detenido preventivamente.";
          } else if (isLoginBlocked) {
            circuitBreakerReason = "Bloqueo por exceso de conexiones/intentos de login (Código 454). Proceso detenido preventivamente para evitar sanciones.";
          } else {
            circuitBreakerReason = "Credenciales SMTP o autenticación rechazada por el servidor (Código 535).";
          }
          console.error("[GRAVY PH EMAIL] Circuit Breaker activado:", circuitBreakerReason);
          break; // Detener de inmediato el bucle para proteger la cuenta
        }
      }
    }

    return e.json(200, {
      success: true,
      sent,
      skipped,
      failed,
      circuitBreaker: {
        triggered: circuitBreakerTriggered,
        reason: circuitBreakerReason
      },
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

  const getCanonicalConceptName = (typeof globalThis.getCanonicalConceptName === 'function')
    ? globalThis.getCanonicalConceptName
    : function(rawDesc) {
        if (!rawDesc) return 'CONCEPTO';
        var str = String(rawDesc).trim();
        var norm = str.toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u');
        if ((norm.indexOf('interes') !== -1 && norm.indexOf('mora') !== -1) || norm === 'mora' || norm.indexOf('mora ') === 0 || norm.indexOf(' intereses mora') !== -1) return 'INTERESES DE MORA';
        if (norm.indexOf('cuota de administracion') !== -1 || norm.indexOf('cuota administracion') !== -1 || norm.indexOf('cuota ordinaria') !== -1 || norm === 'administracion') return 'CUOTA ADMINISTRACION';
        if (norm.indexOf('fondo de imprevistos') !== -1 || norm.indexOf('fondo imprevistos') !== -1) return 'FONDO DE IMPREVISTOS';
        return str;
      };

  const getPhConceptsCache = (typeof globalThis.getPhConceptsCache === 'function')
    ? globalThis.getPhConceptsCache
    : function() {
        var cache = { byId: {}, moraId: '', admId: '', byCanonicalName: {} };
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
              if (code === "MORA" || upperName.indexOf("MORA") !== -1) cache.moraId = id;
              if (code === "ADM" || upperName.indexOf("ADMIN") !== -1) cache.admId = id;
              var canonical = getCanonicalConceptName(name);
              cache.byCanonicalName[canonical] = id;
            }
          }
        } catch (e) { console.warn("[GRAVY PH] Advertencia al cargar catálogo de conceptos:", e); }
        return cache;
      };

  const resolveConceptGroup = (typeof globalThis.resolveConceptGroup === 'function')
    ? globalThis.resolveConceptGroup
    : function(line, cache) {
        var rawId = line.getString ? line.getString("concept_id") : (line.concept_id || "");
        var rawDesc = line.getString ? line.getString("description") : (line.description || "Concepto");
        var canonicalDesc = getCanonicalConceptName(rawDesc);
        var conceptObj = (rawId && cache && cache.byId) ? cache.byId[rawId] : null;
        var isMoraById = rawId && (rawId === (cache ? cache.moraId : '') || (conceptObj && (conceptObj.code === "MORA" || conceptObj.name.toUpperCase().indexOf("MORA") !== -1)));
        var isMoraByText = canonicalDesc === "INTERESES DE MORA";
        if (isMoraById || isMoraByText) return { groupKey: "__MORA__", conceptId: (conceptObj ? conceptObj.id : (cache ? cache.moraId : "")) || "", description: "INTERESES DE MORA" };
        if (conceptObj) return { groupKey: "ID_" + conceptObj.id, conceptId: conceptObj.id, description: conceptObj.name.toUpperCase() };
        if (cache && cache.byCanonicalName && cache.byCanonicalName[canonicalDesc]) {
          var matchedId = cache.byCanonicalName[canonicalDesc];
          var matchedConcept = cache.byId[matchedId];
          if (matchedConcept) return { groupKey: "ID_" + matchedConcept.id, conceptId: matchedConcept.id, description: matchedConcept.name.toUpperCase() };
        }
        if (rawId) return { groupKey: "ID_" + rawId, conceptId: rawId, description: canonicalDesc || String(rawDesc).toUpperCase() };
        return { groupKey: "__TEXT_" + canonicalDesc, conceptId: "", description: canonicalDesc || "CONCEPTO" };
      };

  const getNetPaymentsForPhInvoice = (typeof globalThis.getNetPaymentsForPhInvoice === 'function')
    ? globalThis.getNetPaymentsForPhInvoice
    : function(invoiceNumber, thirdPartyId) {
        if (!invoiceNumber) return 0;
        try {
          var cleanNum = String(invoiceNumber).trim();
          var sql = "SELECT COALESCE(SUM(l.credit), 0) AS total_paid FROM tx_lines l INNER JOIN transactions t ON t.id = l.tx_id INNER JOIN accounts a ON a.id = l.account_id WHERE t.status = 'active' AND a.code LIKE '13%' AND (l.cross_doc_ref = {:invoiceNumber} OR l.cross_doc_ref LIKE {:invoiceNumberLike} OR (t.cross_type = 'ph_invoices' AND t.cross_number = {:invoiceNumber}))";
          var binds = { invoiceNumber: cleanNum, invoiceNumberLike: cleanNum + '-%' };
          if (thirdPartyId && String(thirdPartyId).trim()) {
            sql += " AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = {:thirdPartyId}";
            binds.thirdPartyId = String(thirdPartyId).trim();
          }
          var query = $app.db().newQuery(sql);
          query.bind(binds);
          var result = new DynamicModel({ total_paid: 0 });
          query.one(result);
          return Math.max(0, Number(result.total_paid || 0));
        } catch (_) { return 0; }
      };

  const autoMarkPaidIfSettled = (typeof globalThis.autoMarkPaidIfSettled === 'function')
    ? globalThis.autoMarkPaidIfSettled
    : function(invoiceRecord) {
        try {
          var invNumber = invoiceRecord.getString ? invoiceRecord.getString("number") : (invoiceRecord.number || "");
          var invStatus = invoiceRecord.getString ? invoiceRecord.getString("status") : (invoiceRecord.status || "");
          var invTotal  = invoiceRecord.getFloat  ? invoiceRecord.getFloat("total")   : (Number(invoiceRecord.total) || 0);
          if (!invNumber || invTotal <= 0 || invStatus === 'paid' || invStatus === 'voided') return;
          var paid = getNetPaymentsForPhInvoice(invNumber, null);
          if (paid >= invTotal - 0.01) {
            if (invoiceRecord.set) { invoiceRecord.set("status", "paid"); $app.save(invoiceRecord); }
            else if (invoiceRecord.id) { var rec = $app.findRecordById("ph_invoices", invoiceRecord.id); if (rec) { rec.set("status", "paid"); $app.save(rec); } }
          }
        } catch (_) {}
      };

  const getPreviousMonthRecaudos = (typeof globalThis.getPreviousMonthRecaudos === 'function')
    ? globalThis.getPreviousMonthRecaudos
    : function(propertyId, ownerId, prevPeriod) {
        var unitRecaudo = 0; var totalRecaudo = 0;
        if (!prevPeriod) return { unitRecaudo: unitRecaudo, totalRecaudo: totalRecaudo };
        var startDate = prevPeriod + '-01'; var endDate = prevPeriod + '-31 23:59:59';
        try {
          var sqlAll = "SELECT COALESCE(SUM(l.credit), 0) AS total FROM tx_lines l INNER JOIN transactions t ON t.id = l.tx_id INNER JOIN accounts a ON a.id = l.account_id WHERE t.status = 'active' AND a.code LIKE '13%' AND (t.number LIKE 'RC-%' OR t.teso_mode != '') AND t.date >= {:startDate} AND t.date <= {:endDate}";
          var qAll = $app.db().newQuery(sqlAll); qAll.bind({ startDate: startDate, endDate: endDate });
          var resAll = new DynamicModel({ total: 0 }); qAll.one(resAll);
          totalRecaudo = Number(resAll.total || 0);
        } catch (_) {}
        try {
          var sqlUnit = "SELECT COALESCE(SUM(l.credit), 0) AS total FROM tx_lines l INNER JOIN transactions t ON t.id = l.tx_id INNER JOIN accounts a ON a.id = l.account_id WHERE t.status = 'active' AND a.code LIKE '13%' AND (t.number LIKE 'RC-%' OR t.teso_mode != '') AND t.date >= {:startDate} AND t.date <= {:endDate} AND (";
          var conds = []; var binds = { startDate: startDate, endDate: endDate };
          if (ownerId && String(ownerId).trim()) { conds.push("t.third_party_id = {:ownerId}"); conds.push("l.third_party_id = {:ownerId}"); binds.ownerId = String(ownerId).trim(); }
          if (propertyId && String(propertyId).trim()) { conds.push("t.teso_params LIKE {:propPattern}"); binds.propPattern = '%"ph_property_id":"' + String(propertyId).trim() + '"%'; }
          if (conds.length > 0) {
            sqlUnit += conds.join(" OR ") + ")";
            var qUnit = $app.db().newQuery(sqlUnit); qUnit.bind(binds);
            var resUnit = new DynamicModel({ total: 0 }); qUnit.one(resUnit);
            unitRecaudo = Number(resUnit.total || 0);
          }
        } catch (_) {}
        if (unitRecaudo <= 0 && propertyId) {
          try {
            var unitPaid = $app.findRecordsByFilter("ph_invoices", "property_id = '" + propertyId + "' && period = '" + prevPeriod + "' && status = 'paid'", "", 100, 0);
            if (unitPaid) { for (var i = 0; i < unitPaid.length; i++) unitRecaudo += unitPaid[i].getFloat("total"); }
          } catch (_) {}
        }
        return { unitRecaudo: unitRecaudo, totalRecaudo: totalRecaudo };
      };

  const buildGroupedConceptsList = (typeof globalThis.buildGroupedConceptsList === 'function')
    ? globalThis.buildGroupedConceptsList
    : function(lines, outstandingInvoices, cache) {
        if (!cache) cache = getPhConceptsCache();
        var conceptsMap = {};
        if (lines) {
          for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            var group = resolveConceptGroup(l, cache);
            var key = group.groupKey;
            var amount = l.getFloat ? l.getFloat("amount") : (Number(l.amount) || 0);
            if (!conceptsMap[key]) conceptsMap[key] = { conceptId: group.conceptId, description: group.description, saldoAnterior: 0, cobrosMes: 0, saldoActual: 0 };
            conceptsMap[key].cobrosMes += amount;
            conceptsMap[key].saldoActual += amount;
          }
        }
        if (outstandingInvoices) {
          for (var j = 0; j < outstandingInvoices.length; j++) {
            var oldInv = outstandingInvoices[j];
            var invNumber = oldInv.getString ? oldInv.getString("number") : (oldInv.number || "");
            var invThirdId = oldInv.getString ? oldInv.getString("third_party_id") : (oldInv.third_party_id || "");
            var invoiceTotal = oldInv.getFloat ? oldInv.getFloat("total") : (Number(oldInv.total) || 0);
            var alreadyPaid = getNetPaymentsForPhInvoice(invNumber, invThirdId);
            var pendingBalance = Math.max(0, invoiceTotal - alreadyPaid);
            if (pendingBalance < 0.01) { try { autoMarkPaidIfSettled(oldInv); } catch (_) {} continue; }
            var proportionFactor = (invoiceTotal > 0.01) ? (pendingBalance / invoiceTotal) : 1;
            var oldLines = $app.findRecordsByFilter("ph_invoice_lines", "invoice_id = '" + oldInv.id + "'", "line_order", 200, 0);
            if (oldLines) {
              for (var k = 0; k < oldLines.length; k++) {
                var ol = oldLines[k];
                var groupOld = resolveConceptGroup(ol, cache);
                var keyOld = groupOld.groupKey;
                var amountOld = ol.getFloat ? ol.getFloat("amount") : (Number(ol.amount) || 0);
                var pendingAmt = Math.round(amountOld * proportionFactor * 100) / 100;
                if (pendingAmt < 0.01) continue;
                if (!conceptsMap[keyOld]) conceptsMap[keyOld] = { conceptId: groupOld.conceptId, description: groupOld.description, saldoAnterior: 0, cobrosMes: 0, saldoActual: 0 };
                conceptsMap[keyOld].saldoAnterior += pendingAmt;
                conceptsMap[keyOld].saldoActual += pendingAmt;
              }
            }
          }
        }
        var list = Object.keys(conceptsMap).map(function(k) { return conceptsMap[k]; });
        list.sort(function(a, b) {
          var aDesc = (a.description || '').toUpperCase();
          var bDesc = (b.description || '').toUpperCase();
          var aIsMora = aDesc.indexOf('MORA') !== -1;
          var bIsMora = bDesc.indexOf('MORA') !== -1;
          var aIsAdm = aDesc.indexOf('ADMIN') !== -1;
          var bIsAdm = bDesc.indexOf('ADMIN') !== -1;
          if (aIsAdm && !bIsAdm) return -1;
          if (!aIsAdm && bIsAdm) return 1;
          if (aIsMora && !bIsMora) return 1;
          if (!aIsMora && bIsMora) return -1;
          return aDesc.localeCompare(bDesc);
        });
        return list;
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
    const prevRecaudosSingle = getPreviousMonthRecaudos(prop ? prop.id : '', owner ? owner.id : '', prevPeriod);
    const prevMonthUnitRecaudo = prevRecaudosSingle.unitRecaudo;
    const prevMonthTotalRecaudo = prevRecaudosSingle.totalRecaudo;

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

  const getCanonicalConceptName = (typeof globalThis.getCanonicalConceptName === 'function')
    ? globalThis.getCanonicalConceptName
    : function(rawDesc) {
        if (!rawDesc) return 'CONCEPTO';
        var str = String(rawDesc).trim();
        var norm = str.toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u');
        if ((norm.indexOf('interes') !== -1 && norm.indexOf('mora') !== -1) || norm === 'mora' || norm.indexOf('mora ') === 0 || norm.indexOf(' intereses mora') !== -1) return 'INTERESES DE MORA';
        if (norm.indexOf('cuota de administracion') !== -1 || norm.indexOf('cuota administracion') !== -1 || norm.indexOf('cuota ordinaria') !== -1 || norm === 'administracion') return 'CUOTA ADMINISTRACION';
        if (norm.indexOf('fondo de imprevistos') !== -1 || norm.indexOf('fondo imprevistos') !== -1) return 'FONDO DE IMPREVISTOS';
        return str;
      };

  const getPhConceptsCache = (typeof globalThis.getPhConceptsCache === 'function')
    ? globalThis.getPhConceptsCache
    : function() {
        var cache = { byId: {}, moraId: '', admId: '', byCanonicalName: {} };
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
              if (code === "MORA" || upperName.indexOf("MORA") !== -1) cache.moraId = id;
              if (code === "ADM" || upperName.indexOf("ADMIN") !== -1) cache.admId = id;
              var canonical = getCanonicalConceptName(name);
              cache.byCanonicalName[canonical] = id;
            }
          }
        } catch (e) { console.warn("[GRAVY PH] Advertencia al cargar catálogo de conceptos:", e); }
        return cache;
      };

  const resolveConceptGroup = (typeof globalThis.resolveConceptGroup === 'function')
    ? globalThis.resolveConceptGroup
    : function(line, cache) {
        var rawId = line.getString ? line.getString("concept_id") : (line.concept_id || "");
        var rawDesc = line.getString ? line.getString("description") : (line.description || "Concepto");
        var canonicalDesc = getCanonicalConceptName(rawDesc);
        var conceptObj = (rawId && cache && cache.byId) ? cache.byId[rawId] : null;
        var isMoraById = rawId && (rawId === (cache ? cache.moraId : '') || (conceptObj && (conceptObj.code === "MORA" || conceptObj.name.toUpperCase().indexOf("MORA") !== -1)));
        var isMoraByText = canonicalDesc === "INTERESES DE MORA";
        if (isMoraById || isMoraByText) return { groupKey: "__MORA__", conceptId: (conceptObj ? conceptObj.id : (cache ? cache.moraId : "")) || "", description: "INTERESES DE MORA" };
        if (conceptObj) return { groupKey: "ID_" + conceptObj.id, conceptId: conceptObj.id, description: conceptObj.name.toUpperCase() };
        if (cache && cache.byCanonicalName && cache.byCanonicalName[canonicalDesc]) {
          var matchedId = cache.byCanonicalName[canonicalDesc];
          var matchedConcept = cache.byId[matchedId];
          if (matchedConcept) return { groupKey: "ID_" + matchedConcept.id, conceptId: matchedConcept.id, description: matchedConcept.name.toUpperCase() };
        }
        if (rawId) return { groupKey: "ID_" + rawId, conceptId: rawId, description: canonicalDesc || String(rawDesc).toUpperCase() };
        return { groupKey: "__TEXT_" + canonicalDesc, conceptId: "", description: canonicalDesc || "CONCEPTO" };
      };

  const getNetPaymentsForPhInvoice = (typeof globalThis.getNetPaymentsForPhInvoice === 'function')
    ? globalThis.getNetPaymentsForPhInvoice
    : function(invoiceNumber, thirdPartyId) {
        if (!invoiceNumber) return 0;
        try {
          var cleanNum = String(invoiceNumber).trim();
          var sql = "SELECT COALESCE(SUM(l.credit), 0) AS total_paid FROM tx_lines l INNER JOIN transactions t ON t.id = l.tx_id INNER JOIN accounts a ON a.id = l.account_id WHERE t.status = 'active' AND a.code LIKE '13%' AND (l.cross_doc_ref = {:invoiceNumber} OR l.cross_doc_ref LIKE {:invoiceNumberLike} OR (t.cross_type = 'ph_invoices' AND t.cross_number = {:invoiceNumber}))";
          var binds = { invoiceNumber: cleanNum, invoiceNumberLike: cleanNum + '-%' };
          if (thirdPartyId && String(thirdPartyId).trim()) {
            sql += " AND COALESCE(NULLIF(TRIM(l.third_party_id), ''), t.third_party_id) = {:thirdPartyId}";
            binds.thirdPartyId = String(thirdPartyId).trim();
          }
          var query = $app.db().newQuery(sql);
          query.bind(binds);
          var result = new DynamicModel({ total_paid: 0 });
          query.one(result);
          return Math.max(0, Number(result.total_paid || 0));
        } catch (_) { return 0; }
      };

  const autoMarkPaidIfSettled = (typeof globalThis.autoMarkPaidIfSettled === 'function')
    ? globalThis.autoMarkPaidIfSettled
    : function(invoiceRecord) {
        try {
          var invNumber = invoiceRecord.getString ? invoiceRecord.getString("number") : (invoiceRecord.number || "");
          var invStatus = invoiceRecord.getString ? invoiceRecord.getString("status") : (invoiceRecord.status || "");
          var invTotal  = invoiceRecord.getFloat  ? invoiceRecord.getFloat("total")   : (Number(invoiceRecord.total) || 0);
          if (!invNumber || invTotal <= 0 || invStatus === 'paid' || invStatus === 'voided') return;
          var paid = getNetPaymentsForPhInvoice(invNumber, null);
          if (paid >= invTotal - 0.01) {
            if (invoiceRecord.set) { invoiceRecord.set("status", "paid"); $app.save(invoiceRecord); }
            else if (invoiceRecord.id) { var rec = $app.findRecordById("ph_invoices", invoiceRecord.id); if (rec) { rec.set("status", "paid"); $app.save(rec); } }
          }
        } catch (_) {}
      };

  const getPreviousMonthRecaudos = (typeof globalThis.getPreviousMonthRecaudos === 'function')
    ? globalThis.getPreviousMonthRecaudos
    : function(propertyId, ownerId, prevPeriod) {
        var unitRecaudo = 0; var totalRecaudo = 0;
        if (!prevPeriod) return { unitRecaudo: unitRecaudo, totalRecaudo: totalRecaudo };
        var startDate = prevPeriod + '-01'; var endDate = prevPeriod + '-31 23:59:59';
        try {
          var sqlAll = "SELECT COALESCE(SUM(l.credit), 0) AS total FROM tx_lines l INNER JOIN transactions t ON t.id = l.tx_id INNER JOIN accounts a ON a.id = l.account_id WHERE t.status = 'active' AND a.code LIKE '13%' AND (t.number LIKE 'RC-%' OR t.teso_mode != '') AND t.date >= {:startDate} AND t.date <= {:endDate}";
          var qAll = $app.db().newQuery(sqlAll); qAll.bind({ startDate: startDate, endDate: endDate });
          var resAll = new DynamicModel({ total: 0 }); qAll.one(resAll);
          totalRecaudo = Number(resAll.total || 0);
        } catch (_) {}
        try {
          var sqlUnit = "SELECT COALESCE(SUM(l.credit), 0) AS total FROM tx_lines l INNER JOIN transactions t ON t.id = l.tx_id INNER JOIN accounts a ON a.id = l.account_id WHERE t.status = 'active' AND a.code LIKE '13%' AND (t.number LIKE 'RC-%' OR t.teso_mode != '') AND t.date >= {:startDate} AND t.date <= {:endDate} AND (";
          var conds = []; var binds = { startDate: startDate, endDate: endDate };
          if (ownerId && String(ownerId).trim()) { conds.push("t.third_party_id = {:ownerId}"); conds.push("l.third_party_id = {:ownerId}"); binds.ownerId = String(ownerId).trim(); }
          if (propertyId && String(propertyId).trim()) { conds.push("t.teso_params LIKE {:propPattern}"); binds.propPattern = '%"ph_property_id":"' + String(propertyId).trim() + '"%'; }
          if (conds.length > 0) {
            sqlUnit += conds.join(" OR ") + ")";
            var qUnit = $app.db().newQuery(sqlUnit); qUnit.bind(binds);
            var resUnit = new DynamicModel({ total: 0 }); qUnit.one(resUnit);
            unitRecaudo = Number(resUnit.total || 0);
          }
        } catch (_) {}
        if (unitRecaudo <= 0 && propertyId) {
          try {
            var unitPaid = $app.findRecordsByFilter("ph_invoices", "property_id = '" + propertyId + "' && period = '" + prevPeriod + "' && status = 'paid'", "", 100, 0);
            if (unitPaid) { for (var i = 0; i < unitPaid.length; i++) unitRecaudo += unitPaid[i].getFloat("total"); }
          } catch (_) {}
        }
        return { unitRecaudo: unitRecaudo, totalRecaudo: totalRecaudo };
      };

  const buildGroupedConceptsList = (typeof globalThis.buildGroupedConceptsList === 'function')
    ? globalThis.buildGroupedConceptsList
    : function(lines, outstandingInvoices, cache) {
        if (!cache) cache = getPhConceptsCache();
        var conceptsMap = {};
        if (lines) {
          for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            var group = resolveConceptGroup(l, cache);
            var key = group.groupKey;
            var amount = l.getFloat ? l.getFloat("amount") : (Number(l.amount) || 0);
            if (!conceptsMap[key]) conceptsMap[key] = { conceptId: group.conceptId, description: group.description, saldoAnterior: 0, cobrosMes: 0, saldoActual: 0 };
            conceptsMap[key].cobrosMes += amount;
            conceptsMap[key].saldoActual += amount;
          }
        }
        if (outstandingInvoices) {
          for (var j = 0; j < outstandingInvoices.length; j++) {
            var oldInv = outstandingInvoices[j];
            var invNumber = oldInv.getString ? oldInv.getString("number") : (oldInv.number || "");
            var invThirdId = oldInv.getString ? oldInv.getString("third_party_id") : (oldInv.third_party_id || "");
            var invoiceTotal = oldInv.getFloat ? oldInv.getFloat("total") : (Number(oldInv.total) || 0);
            var alreadyPaid = getNetPaymentsForPhInvoice(invNumber, invThirdId);
            var pendingBalance = Math.max(0, invoiceTotal - alreadyPaid);
            if (pendingBalance < 0.01) { try { autoMarkPaidIfSettled(oldInv); } catch (_) {} continue; }
            var proportionFactor = (invoiceTotal > 0.01) ? (pendingBalance / invoiceTotal) : 1;
            var oldLines = $app.findRecordsByFilter("ph_invoice_lines", "invoice_id = '" + oldInv.id + "'", "line_order", 200, 0);
            if (oldLines) {
              for (var k = 0; k < oldLines.length; k++) {
                var ol = oldLines[k];
                var groupOld = resolveConceptGroup(ol, cache);
                var keyOld = groupOld.groupKey;
                var amountOld = ol.getFloat ? ol.getFloat("amount") : (Number(ol.amount) || 0);
                var pendingAmt = Math.round(amountOld * proportionFactor * 100) / 100;
                if (pendingAmt < 0.01) continue;
                if (!conceptsMap[keyOld]) conceptsMap[keyOld] = { conceptId: groupOld.conceptId, description: groupOld.description, saldoAnterior: 0, cobrosMes: 0, saldoActual: 0 };
                conceptsMap[keyOld].saldoAnterior += pendingAmt;
                conceptsMap[keyOld].saldoActual += pendingAmt;
              }
            }
          }
        }
        var list = Object.keys(conceptsMap).map(function(k) { return conceptsMap[k]; });
        list.sort(function(a, b) {
          var aDesc = (a.description || '').toUpperCase();
          var bDesc = (b.description || '').toUpperCase();
          var aIsMora = aDesc.indexOf('MORA') !== -1;
          var bIsMora = bDesc.indexOf('MORA') !== -1;
          var aIsAdm = aDesc.indexOf('ADMIN') !== -1;
          var bIsAdm = bDesc.indexOf('ADMIN') !== -1;
          if (aIsAdm && !bIsAdm) return -1;
          if (!aIsAdm && bIsAdm) return 1;
          if (aIsMora && !bIsMora) return 1;
          if (!aIsMora && bIsMora) return -1;
          return aDesc.localeCompare(bDesc);
        });
        return list;
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

    const companyData = {
      companyName: getSetting("company_name", "GRAVY S.A.S"),
      companyNit: getSetting("company_nit", ""),
      companyAddress: getSetting("company_address", ""),
      companyPhone: getSetting("company_phone", ""),
      companyEmail: getSetting("company_email", ""),
      companyCity: getSetting("company_city", ""),
      companyLogo: getSetting("company_logo", "")
    };
    const companyFooterNote = getSetting("ph_invoice_footer_note", "");

    const prevPeriod = getPreviousPeriod(period);
    const prevMonthName = getMonthNameUpper(prevPeriod);
    let prevMonthTotalRecaudo = 0;
    const unitRecaudoMap = {};

    // 1. Precarga en lote de recaudos del mes anterior (evita cientos de queries individuales)
    if (prevPeriod) {
      try {
        const prevPaid = $app.findRecordsByFilter(
          "ph_invoices",
          `period = '${prevPeriod}' && status = 'paid'`,
          "",
          1000,
          0
        ) || [];
        for (const p of prevPaid) {
          const t = p.getFloat("total");
          prevMonthTotalRecaudo += t;
          const pid = p.getString("property_id");
          unitRecaudoMap[pid] = (unitRecaudoMap[pid] || 0) + t;
        }
      } catch (errRec) {
        console.warn("[GRAVY PH EMAIL] Advertencia al calcular recaudos mes anterior:", errRec);
      }
    }

    // 2. Precarga de todas las propiedades y sus propietarios en memoria (Map)
    const allProps = $app.findRecordsByFilter("ph_properties", "", "code", 2000, 0) || [];
    const propsMap = {};
    for (const p of allProps) {
      try { $app.expandRecord(p, ["owner_id"], null); } catch (_) {}
      propsMap[p.id] = p;
    }

    // 3. Precarga de todas las líneas de factura del período en una sola consulta rápida
    const linesByInvoiceId = {};
    for (const inv of invoices) {
      linesByInvoiceId[inv.id] = [];
    }
    try {
      const invIdList = invoices.map(i => "'" + i.id + "'").join(",");
      if (invIdList) {
        const rawLines = [];
        $app.db().newQuery("SELECT * FROM ph_invoice_lines WHERE invoice_id IN (" + invIdList + ") ORDER BY line_order ASC")
          .all(rawLines);
        for (const rl of rawLines) {
          if (linesByInvoiceId[rl.invoice_id]) {
            linesByInvoiceId[rl.invoice_id].push(rl);
          }
        }
      }
    } catch (_) {}

    // 4. Precarga de facturas pendientes de períodos anteriores si es statement
    const pendingByPropId = {};
    if (type === 'statement') {
      try {
        const allPending = $app.findRecordsByFilter(
          "ph_invoices",
          `status != 'paid' && status != 'voided' && period < '${period}'`,
          "period",
          2000,
          0
        ) || [];
        for (const pInv of allPending) {
          const propId = pInv.getString("property_id");
          if (!pendingByPropId[propId]) pendingByPropId[propId] = [];
          pendingByPropId[propId].push(pInv);
        }
      } catch (_) {}
    }

    const conceptsCache = getPhConceptsCache();
    const statements = [];

    for (const inv of invoices) {
      const propId = inv.getString("property_id");
      let prop = propsMap[propId];
      if (!prop) {
        try {
          $app.expandRecord(inv, ["property_id"], null);
          prop = inv.expandedOne("property_id");
          if (prop) $app.expandRecord(prop, ["owner_id"], null);
        } catch (_) {}
      }
      if (!prop) continue;

      const owner = prop.expandedOne ? prop.expandedOne("owner_id") : null;

      let lines = linesByInvoiceId[inv.id];
      if (!lines || lines.length === 0) {
        lines = $app.findRecordsByFilter(
          "ph_invoice_lines",
          `invoice_id = '${inv.id}'`,
          "line_order",
          200,
          0
        );
      }

      const outstandingInvoices = (type === 'statement') ? (pendingByPropId[prop.id] || []) : [];

      // Agrupar por conceptos de forma canónica (unificando saldos anteriores y cobros del mes)
      const conceptsList = buildGroupedConceptsList(lines, outstandingInvoices, conceptsCache);
      const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

      const ownerDocNumber = owner ? (owner.getString("doc_number") ? (owner.getString("doc_number") + (owner.getString("dv") ? "-" + owner.getString("dv") : "")) : (owner.getString("nit") || owner.getString("document") || "—")) : "—";
      const ownerPhone = owner ? (owner.getString("phone") || owner.getString("celular") || "—") : "—";

      const prevMonthUnitRecaudo = unitRecaudoMap[prop.id] || 0;
      const invoiceNotes = (inv.getString("notes") || companyFooterNote || "CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.").trim();
      const numberText = inv.getString("number") || "0000";

      statements.push({
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

    if (!statements || statements.length === 0) {
      return e.json(404, { message: `No se encontraron unidades con facturas válidas para compilar en el período ${period}.` });
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
        companyData: companyData,
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
    } else {
      let orchError = "";
      try { orchError = JSON.parse(orchestratorRes.raw)?.error || ""; } catch (_) {}
      return e.json(500, { message: "Error del orquestador PDF (" + orchestratorRes.statusCode + "): " + (orchError || orchestratorRes.raw || "Fallo en orquestador") });
    }

    return e.json(500, { message: "No se pudo generar el archivo PDF consolidado en el orquestador." });
  } catch (err) {
    console.error("[GRAVY PH EMAIL] Error generando PDF unificado del período:", err);
    return e.json(500, { message: "Error al generar PDF unificado: " + err.message });
  }
});

// ROUTE: GET /api/ph/unit-balance
// Consulta saldo real pendiente por unidad via tx_lines.
routerAdd('GET', '/api/ph/unit-balance', (c) => {
  let propertyId = '';
  let period = '';
  let thirdId = '';
  try {
    propertyId = c.queryParam('propertyId') || c.queryParam('property_id') || '';
    period = c.queryParam('period') || c.queryParam('periodo') || '';
    thirdId = c.queryParam('thirdPartyId') || c.queryParam('third_party_id') || '';
  } catch (_) {}
  if (!propertyId && !thirdId) {
    try {
      const q = c.requestInfo ? c.requestInfo().query : {};
      propertyId = String(q.propertyId || q.property_id || '').trim();
      period = String(q.period || q.periodo || '').trim();
      thirdId = String(q.thirdPartyId || q.third_party_id || '').trim();
    } catch (_) {}
  }
  if (!propertyId && !thirdId) return c.json(400, { error: 'Se requiere propertyId o thirdPartyId.' });

  try {
    let filter = "status != 'voided'";
    if (propertyId) filter += " && property_id = '" + propertyId + "'";
    if (period) filter += " && period = '" + period + "'";
    const invoices = $app.findRecordsByFilter('ph_invoices', filter, 'period', 500, 0);
    const result = []; let totalPending = 0, totalInvoiced = 0, totalPaid = 0;
    for (const inv of invoices) {
      const invNumber = inv.getString('number'), invTotal = inv.getFloat('total'), invStatus = inv.getString('status');
      const paidAmount = getNetPaymentsForPhInvoice(invNumber, thirdId || null);
      const pendingAmount = Math.max(0, invTotal - paidAmount);
      totalInvoiced += invTotal; totalPaid += Math.min(paidAmount, invTotal); totalPending += pendingAmount;
      if (pendingAmount < 0.01 && invStatus !== 'paid' && invStatus !== 'voided') {
        try { autoMarkPaidIfSettled(inv); } catch (_) {}
      }
      result.push({
        invoiceId: inv.id,
        invoiceNumber: invNumber,
        period: inv.getString('period'),
        date: inv.getString('date'),
        dueDate: inv.getString('due_date'),
        status: invStatus,
        total: invTotal,
        paidAmount: Math.min(paidAmount, invTotal),
        pendingAmount: pendingAmount,
        isSettled: pendingAmount < 0.01
      });
    }
    return c.json(200, {
      propertyId: propertyId || null,
      period: period || null,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalPending: Math.round(totalPending * 100) / 100,
      invoiceCount: result.length,
      pendingCount: result.filter(r => !r.isSettled).length,
      invoices: result
    });
  } catch (err) {
    console.error('[GRAVY PH] Error en /api/ph/unit-balance:', err);
    return c.json(500, { error: 'Error al calcular saldo de unidad: ' + err.message });
  }
});

