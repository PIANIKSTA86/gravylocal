/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — tesoreria.pb.js
 * Motor de aplicación de abonos y anticipos.
 * - Modo PH: anticipo atado a propiedad (ANT-{propertyId})
 * - Modo Comercial: anticipo atado a tercero (ANT-{thirdPartyId})
 */

onRecordCreateRequest((e) => {
  const rec = e.record;
  if (!rec) return e.next();
  
  const colName = String(rec.collection().name);
  if (colName !== 'transactions') return e.next();
  
  const txTypeId = rec.get('tx_type_id');
  if (!txTypeId) return e.next();
  
  const txTypeRec = $app.findRecordById("transaction_types", txTypeId);
  const txType = String(txTypeRec.get("code")).toUpperCase();
  
  if (txType !== 'RC' && txType !== 'CE') return e.next();
  
  const modo = String(rec.get('teso_mode') || 'auto');
  let paramsStr = rec.get('teso_params');
  if (!paramsStr) return e.next();

  let params = {};
  try { params = JSON.parse(String(paramsStr)); } catch(err) { return e.next(); }
  try {
    e.next();
  } catch(err) {
    throw new BadRequestError("DB Error: " + (err.message || err));
  }

  // ─── Leer cuenta de anticipos según operación (RC -> 28 / CE -> 1330) ────
  function getAnticipoAccountId(txType) {
    try {
      const cfgRec = $app.findFirstRecordByFilter('settings', 'key="ph_config_v1"');
      if (cfgRec) {
        const cfg = JSON.parse(cfgRec.get('value') || '{}');
        if (txType === 'CE' && cfg.anticipo_proveedor_account_id) return cfg.anticipo_proveedor_account_id;
        if (txType === 'RC' && cfg.anticipo_account_id) return cfg.anticipo_account_id;
      }
    } catch(_) {}

    try {
      if (txType === 'CE') {
        const acc = $app.findFirstRecordByFilter('accounts', 'code ~ "133005%" || code = "133005" || code ~ "1330%"');
        if (acc) return acc.id;
      } else {
        const acc = $app.findFirstRecordByFilter('accounts', 'code ~ "2805%" || code = "2805" || code ~ "28%"');
        if (acc) return acc.id;
      }
    } catch(_) {}
    return null;
  }

  // ─── Obtener partidas abiertas ──────────────────────────────────────────
  function getOpenItems(thirdPartyId, propertyId, txType, cruzarAnticipos = true) {
    const anticipoAccountId = getAnticipoAccountId(txType);
    const anticipoRef = propertyId ? `ANT-${propertyId}` : `ANT-${thirdPartyId}`;
    const isRC = txType === 'RC';

    const lines = $app.findRecordsByFilter(
      "tx_lines",
      `third_party_id = '${thirdPartyId}'`,
      "", 10000, 0
    ) || [];

    let allowedRefs = null;
    let blockedRefs = null;

    if (propertyId) {
      allowedRefs = {};
      const invoices = $app.findRecordsByFilter("ph_invoices", `property_id = '${propertyId}' && status != 'voided'`, "", 10000, 0) || [];
      for (const inv of invoices) allowedRefs[inv.get("number")] = true;
      if (cruzarAnticipos) allowedRefs[anticipoRef] = true;
    } else {
      allowedRefs = {};
      try {
        const commInvoices = $app.findRecordsByFilter("invoices", `customer_id = '${thirdPartyId}' && status = 'posted'`, "", 10000, 0) || [];
        for (const inv of commInvoices) allowedRefs[inv.get("number")] = true;
      } catch(err) {}

      blockedRefs = {};
      try {
        const props = $app.findRecordsByFilter("ph_properties", `owner_id = '${thirdPartyId}'`, "", 1000, 0) || [];
        const propIds = {};
        for (const p of props) propIds[p.id] = true;

        if (props.length > 0) {
          const phInvoices = $app.findRecordsByFilter("ph_invoices", `status != 'voided'`, "", 10000, 0) || [];
          for (const inv of phInvoices) {
            if (propIds[inv.get("property_id")]) blockedRefs[inv.get("number")] = true;
          }
          for (const p of props) blockedRefs[`ANT-${p.id}`] = true;
        }
      } catch(err) {}
    }

    const docsMap = {};
    for (const line of lines) {
      try {
        const lineAccountId = line.get("account_id");
        const ref = String(line.get("cross_doc_ref") || "").trim();
        if (!ref) continue;

        let code = '';
        try {
          const acct = $app.findRecordById("accounts", lineAccountId);
          code = String(acct.get("code") || "");
        } catch(_) {}

        let esCuentaCruce = false;
        let esCuentaAnticipo = false;

        if (isRC) {
          esCuentaCruce = code.indexOf('13') === 0 && code.indexOf('1330') !== 0;
          esCuentaAnticipo = code.indexOf('28') === 0 || ref === anticipoRef || (anticipoAccountId && lineAccountId === anticipoAccountId);
        } else {
          esCuentaCruce = code.indexOf('22') === 0 || code.indexOf('23') === 0 || code.indexOf('25') === 0;
          esCuentaAnticipo = code.indexOf('1330') === 0 || ref === anticipoRef || (anticipoAccountId && lineAccountId === anticipoAccountId);
        }

        if (!cruzarAnticipos && esCuentaAnticipo) continue;

        if (!esCuentaCruce && !esCuentaAnticipo) continue;

        const possibleBase = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
        const inAllowed = allowedRefs && (allowedRefs[ref] || allowedRefs[possibleBase]);
        const inBlocked = blockedRefs && (blockedRefs[ref] || blockedRefs[possibleBase]);

        if (!esCuentaAnticipo && !inAllowed) {
           if (inBlocked) continue;
        }

        const tx = $app.findRecordById("transactions", line.get("tx_id"));
        if (tx && tx.get("status") === "voided") continue;

        const key = ref + "|" + lineAccountId;
        if (!docsMap[key]) {
          const firstDate = tx ? (tx.get("date") || tx.get("created")) : "";
          docsMap[key] = {
            key, cross_doc_ref: ref, account_id: lineAccountId, account_code: code,
            firstDate, isAnticipo: esCuentaAnticipo,
            debit: 0, credit: 0
          };
        }
        docsMap[key].debit  += Number(line.get("debit")  || 0);
        docsMap[key].credit += Number(line.get("credit") || 0);
      } catch(err) {}
    }

    const validItems = [];
    for (const key in docsMap) {
      const d = docsMap[key];
      let netOpen = 0;
      if (d.isAnticipo) {
        netOpen = isRC ? (d.credit - d.debit) : (d.debit - d.credit);
        if (netOpen > 0.01) {
          d.saldo = netOpen;
          d.isReceivable = false;
          validItems.push(d);
        }
      } else {
        netOpen = isRC ? (d.debit - d.credit) : (d.credit - d.debit);
        if (Math.abs(netOpen) > 0.01) {
          d.saldo = Math.abs(netOpen);
          d.isReceivable = netOpen > 0;
          validItems.push(d);
        }
      }
    }
    return validItems;
  }

  // ─── Distribución automática ────────────────────────────────────────────
  // Devuelve { anticipoAbonos, cashAbonos, nuevoAnticipo }
  function applyPaymentAuto(openItems, amount, rules, cruzarAnticipos = true) {
    // Separar anticipos (créditos disponibles) de cuentas por cobrar/pagar
    const anticipoItems = cruzarAnticipos ? openItems.filter(i => i.isAnticipo && !i.isReceivable) : [];
    const cxcItems      = openItems.filter(i => !i.isAnticipo);

    // Ordenar facturas: intereses primero, luego por fecha
    cxcItems.sort((a, b) => {
      if (rules.interesPrioridad && Array.isArray(rules.cuentasInteres) && rules.cuentasInteres.length > 0) {
        try {
          const aAcct = $app.findRecordById("accounts", a.account_id);
          const bAcct = $app.findRecordById("accounts", b.account_id);
          const aIsInt = rules.cuentasInteres.includes(String(aAcct.get("code")));
          const bIsInt = rules.cuentasInteres.includes(String(bAcct.get("code")));
          if (aIsInt && !bIsInt) return -1;
          if (!aIsInt && bIsInt) return 1;
        } catch(_) {}
      }
      if (rules.primeroVencido) {
        const da = new Date(a.firstDate).getTime();
        const db = new Date(b.firstDate).getTime();
        if (da !== db) return da - db;
      }
      return 0;
    });

    // Calcular saldo total de anticipos disponibles
    let anticipoDisponible = anticipoItems.reduce((s, i) => s + i.saldo, 0);

    // PASO 1: Aplicar anticipos existentes contra facturas (sin cash)
    const anticipoAbonos = [];
    const saldosCxC = cxcItems.map(i => ({ ...i, saldoRestante: i.saldo }));
    
    let anticoporConsumir = anticipoDisponible;
    if (anticoporConsumir > 0.01) {
      for (const cxc of saldosCxC) {
        if (anticoporConsumir <= 0.01) break;
        const aplicar = Math.min(anticoporConsumir, cxc.saldoRestante);
        if (aplicar > 0.01) {
          anticipoAbonos.push({
            key: cxc.key, cross_doc_ref: cxc.cross_doc_ref,
            account_id: cxc.account_id, monto: aplicar,
            isReceivable: cxc.isReceivable, isAnticipo: false
          });
          cxc.saldoRestante -= aplicar;
          anticoporConsumir -= aplicar;
        }
      }
    }

    // PASO 2: Aplicar cash a facturas restantes
    let saldoCash = amount;
    const cashAbonos = [];
    for (const cxc of saldosCxC) {
      if (saldoCash <= 0.01) break;
      if (cxc.saldoRestante <= 0.01) continue;
      const aplicar = Math.min(saldoCash, cxc.saldoRestante);
      if (aplicar > 0.01) {
        cashAbonos.push({
          key: cxc.key, cross_doc_ref: cxc.cross_doc_ref,
          account_id: cxc.account_id, monto: aplicar,
          isReceivable: cxc.isReceivable, isAnticipo: false
        });
        saldoCash -= aplicar;
      }
    }

    // PASO 3: Si sobra cash → nuevo anticipo
    const nuevoAnticipo = saldoCash > 0.01 ? saldoCash : 0;
    const anticipoConsumido = Math.min(anticipoDisponible, anticipoAbonos.reduce((s, a) => s + a.monto, 0));

    return { anticipoAbonos, cashAbonos, nuevoAnticipo, anticipoConsumido, anticipoDisponible };
  }

  // ─── Distribución manual ─────────────────────────────────────────────────
  function applyPaymentManual(openItems, distribucion) {
    const abonos = [];
    for (const d of distribucion) {
      const item = openItems.find(i => i.key === d.key);
      if (!item) continue;
      const abono = Math.min(Number(d.monto), item.saldo);
      if (abono > 0.01) {
        abonos.push({
          key: item.key, cross_doc_ref: item.cross_doc_ref,
          account_id: item.account_id, monto: abono,
          isReceivable: item.isReceivable, isAnticipo: item.isAnticipo
        });
      }
    }
    return abonos;
  }

  // ─── Registro final ──────────────────────────────────────────────────────
  function doRegistrarPago(e, txType, modo, params) {
    const third_party_id         = params.third_party_id;
    const amount                 = Number(params.amount);
    const contrapartida_account_id = params.contrapartida_account_id;
    const propertyId             = params.ph_property_id || null;
    const anticipoAccountId      = getAnticipoAccountId(txType);
    const anticipoRef            = propertyId ? `ANT-${propertyId}` : `ANT-${third_party_id}`;
    const cruzarAnticipos        = params.cruzar_anticipos !== false;

    const branch_id              = e.record.get("branch_id") || null;
    const cost_center_id         = params.cost_center_id || null;

    const openItems = getOpenItems(third_party_id, propertyId, txType, cruzarAnticipos);

    let anticipoAbonos = [], cashAbonos = [], nuevoAnticipo = 0, anticipoConsumido = 0;

    if (modo === 'manual') {
      cashAbonos = applyPaymentManual(openItems, params.distribucion || []);
    } else {
      const result = applyPaymentAuto(openItems, amount, params.reglas || {}, cruzarAnticipos);
      anticipoAbonos  = result.anticipoAbonos;
      cashAbonos      = result.cashAbonos;
      nuevoAnticipo   = result.nuevoAnticipo;
      anticipoConsumido = result.anticipoConsumido;
    }

    if (anticipoAbonos.length === 0 && cashAbonos.length === 0 && nuevoAnticipo <= 0.01) {
      throw new Error("No se generaron abonos ni anticipo. Cartera vacía para: " + third_party_id);
    }

    const txLinesCollection = $app.findCollectionByNameOrId('tx_lines');

    function saveLine(line) {
      if (branch_id) line.set("branch_id", branch_id);
      if (cost_center_id) line.set("cost_center_id", cost_center_id);
      $app.save(line);
    }

    // 1. Líneas de cierre de anticipo existente
    if (anticipoAbonos.length > 0 && anticipoAccountId && anticipoConsumido > 0.01) {
      const lineAnticipoConsumido = new Record(txLinesCollection);
      lineAnticipoConsumido.set("tx_id", e.record.id);
      lineAnticipoConsumido.set("account_id", anticipoAccountId);
      lineAnticipoConsumido.set("third_party_id", third_party_id);
      lineAnticipoConsumido.set("cross_doc_ref", anticipoRef);
      if (txType === 'RC') {
        // Disminuye pasivo (Cuenta 28) -> Débito
        lineAnticipoConsumido.set("debit", anticipoConsumido);
        lineAnticipoConsumido.set("credit", 0);
      } else {
        // Disminuye activo (Cuenta 1330) -> Crédito
        lineAnticipoConsumido.set("debit", 0);
        lineAnticipoConsumido.set("credit", anticipoConsumido);
      }
      lineAnticipoConsumido.set("description", "Aplicación anticipo " + anticipoRef);
      saveLine(lineAnticipoConsumido);

      for (const ab of anticipoAbonos) {
        const lineDoc = new Record(txLinesCollection);
        lineDoc.set("tx_id", e.record.id);
        lineDoc.set("account_id", ab.account_id);
        lineDoc.set("third_party_id", third_party_id);
        lineDoc.set("cross_doc_ref", ab.cross_doc_ref);
        if (txType === 'RC') {
          // Abono a CxC (Cuenta 13) -> Crédito
          lineDoc.set("debit", 0);
          lineDoc.set("credit", ab.monto);
        } else {
          // Abono a CxP (Cuenta 22/23/25) -> Débito
          lineDoc.set("debit", ab.monto);
          lineDoc.set("credit", 0);
        }
        lineDoc.set("description", "Abono desde anticipo a " + ab.cross_doc_ref);
        saveLine(lineDoc);
      }
    }

    // 2. Líneas de cash → Facturas
    for (const ab of cashAbonos) {
      const lineCash = new Record(txLinesCollection);
      lineCash.set("tx_id", e.record.id);
      lineCash.set("account_id", ab.account_id);
      lineCash.set("third_party_id", third_party_id);
      lineCash.set("cross_doc_ref", ab.cross_doc_ref);
      if (txType === 'RC') {
        lineCash.set("debit", 0); lineCash.set("credit", ab.monto);
      } else {
        lineCash.set("debit", ab.monto); lineCash.set("credit", 0);
      }
      lineCash.set("description", "Abono a " + ab.cross_doc_ref);
      saveLine(lineCash);
    }

    // 3. Nuevo anticipo (excedente de cash)
    if (nuevoAnticipo > 0.01 && anticipoAccountId) {
      const lineNuevoAnticipo = new Record(txLinesCollection);
      lineNuevoAnticipo.set("tx_id", e.record.id);
      lineNuevoAnticipo.set("account_id", anticipoAccountId);
      lineNuevoAnticipo.set("third_party_id", third_party_id);
      lineNuevoAnticipo.set("cross_doc_ref", anticipoRef);
      if (txType === 'RC') {
        // Nuevo pasivo (Cuenta 28) -> Crédito
        lineNuevoAnticipo.set("debit", 0);
        lineNuevoAnticipo.set("credit", nuevoAnticipo);
      } else {
        // Nuevo activo (Cuenta 1330) -> Débito
        lineNuevoAnticipo.set("debit", nuevoAnticipo);
        lineNuevoAnticipo.set("credit", 0);
      }
      lineNuevoAnticipo.set("description", "Anticipo / Saldo a favor " + anticipoRef);
      saveLine(lineNuevoAnticipo);
    }

    // 4. Contrapartida a bancos/caja (soporte para medios de pago únicos o mixtos)
    if (params.medios_pago && Array.isArray(params.medios_pago) && params.medios_pago.length > 0) {
      for (const mp of params.medios_pago) {
        const mpAmount = Number(mp.monto || 0);
        const mpAccId = mp.account_id;
        if (mpAmount > 0.01 && mpAccId) {
          const contraLine = new Record(txLinesCollection);
          contraLine.set("tx_id", e.record.id);
          contraLine.set("account_id", mpAccId);
          contraLine.set("third_party_id", third_party_id);
          if (txType === 'RC') {
            contraLine.set("debit", mpAmount); contraLine.set("credit", 0);
          } else {
            contraLine.set("debit", 0); contraLine.set("credit", mpAmount);
          }
          const descPrefix = txType === 'RC' ? 'Ingreso ' : 'Salida ';
          const descMetodo = mp.metodo ? mp.metodo : 'Caja/Bancos';
          const descRef = mp.referencia ? ` Ref: ${mp.referencia}` : '';
          contraLine.set("description", `${descPrefix}${descMetodo}${descRef}`);
          saveLine(contraLine);
        }
      }
    } else if (amount > 0.01 && contrapartida_account_id) {
      const contraLine = new Record(txLinesCollection);
      contraLine.set("tx_id", e.record.id);
      contraLine.set("account_id", contrapartida_account_id);
      contraLine.set("third_party_id", third_party_id);
      if (txType === 'RC') {
        contraLine.set("debit", amount); contraLine.set("credit", 0);
      } else {
        contraLine.set("debit", 0); contraLine.set("credit", amount);
      }
      contraLine.set("description", txType === 'RC' ? 'Ingreso a Caja/Bancos por Recaudo' : 'Salida de Caja/Bancos por Pago');
      saveLine(contraLine);
    }

    // 5. Línea de Retención en la Fuente
    const retFuenteAmt = Number(params.ret_fuente_amount || 0);
    const retFuenteAcc = params.ret_fuente_account_id;
    if (retFuenteAmt > 0.01 && retFuenteAcc) {
      const lineRF = new Record(txLinesCollection);
      lineRF.set("tx_id", e.record.id);
      lineRF.set("account_id", retFuenteAcc);
      lineRF.set("third_party_id", third_party_id);
      lineRF.set("cross_doc_ref", anticipoRef);
      if (txType === 'RC') {
        lineRF.set("debit", retFuenteAmt); lineRF.set("credit", 0);
      } else {
        lineRF.set("debit", 0); lineRF.set("credit", retFuenteAmt);
      }
      lineRF.set("description", "Retención en la Fuente");
      saveLine(lineRF);
    }

    // 6. Línea de Retención ICA
    const retIcaAmt = Number(params.ret_ica_amount || 0);
    const retIcaAcc = params.ret_ica_account_id;
    if (retIcaAmt > 0.01 && retIcaAcc) {
      const lineICA = new Record(txLinesCollection);
      lineICA.set("tx_id", e.record.id);
      lineICA.set("account_id", retIcaAcc);
      lineICA.set("third_party_id", third_party_id);
      lineICA.set("cross_doc_ref", anticipoRef);
      if (txType === 'RC') {
        lineICA.set("debit", retIcaAmt); lineICA.set("credit", 0);
      } else {
        lineICA.set("debit", 0); lineICA.set("credit", retIcaAmt);
      }
      lineICA.set("description", "Retención ICA");
      saveLine(lineICA);
    }

    // 7. Línea de Descuento
    const descAmt = Number(params.descuento_amount || 0);
    const descAcc = params.descuento_account_id;
    if (descAmt > 0.01 && descAcc) {
      const lineDesc = new Record(txLinesCollection);
      lineDesc.set("tx_id", e.record.id);
      lineDesc.set("account_id", descAcc);
      lineDesc.set("third_party_id", third_party_id);
      lineDesc.set("cross_doc_ref", anticipoRef);
      if (txType === 'RC') {
        lineDesc.set("debit", descAmt); lineDesc.set("credit", 0);
      } else {
        lineDesc.set("debit", 0); lineDesc.set("credit", descAmt);
      }
      lineDesc.set("description", "Descuento comercial condicionado");
      saveLine(lineDesc);
    }

    // 8. Línea de Ajuste al Peso (Sobrante o Faltante)
    const ajustePesoAmt = Number(params.ajuste_peso_amount || 0);
    const ajustePesoAcc = params.ajuste_peso_account_id;
    const ajustePesoType = params.ajuste_peso_type || 'faltante';
    if (ajustePesoAmt > 0.001 && ajustePesoAcc) {
      const lineAjuste = new Record(txLinesCollection);
      lineAjuste.set("tx_id", e.record.id);
      lineAjuste.set("account_id", ajustePesoAcc);
      lineAjuste.set("third_party_id", third_party_id);
      lineAjuste.set("cross_doc_ref", anticipoRef);
      if (ajustePesoType === 'sobrante') {
        // Sobrante -> Ingreso/Aprovechamiento -> Crédito
        lineAjuste.set("debit", 0);
        lineAjuste.set("credit", ajustePesoAmt);
        lineAjuste.set("description", "Ajuste al peso (Sobrante)");
      } else {
        // Faltante -> Gasto/Pérdida -> Débito
        lineAjuste.set("debit", ajustePesoAmt);
        lineAjuste.set("credit", 0);
        lineAjuste.set("description", "Ajuste al peso (Faltante)");
      }
      saveLine(lineAjuste);
    }
  }

  try {
    doRegistrarPago(e, txType, modo, params);
  } catch (err) {
    console.error("[GRAVY] Error en registrarPago:", err);
    throw new BadRequestError("Error en registrarPago: " + (err.message || err));
  }
}, 'transactions');
