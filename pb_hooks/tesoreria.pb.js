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

  // ─── Leer cuenta de anticipos desde configuración ───────────────────────
  function getAnticipoAccountId() {
    try {
      const cfgRec = $app.findFirstRecordByFilter('settings', 'key="ph_config_v1"');
      if (cfgRec) {
        const cfg = JSON.parse(cfgRec.get('value') || '{}');
        return cfg.anticipo_account_id || null;
      }
    } catch(_) {}
    return null;
  }

  // ─── Obtener partidas abiertas ──────────────────────────────────────────
  function getOpenItems(thirdPartyId, propertyId) {
    const anticipoAccountId = getAnticipoAccountId();
    const anticipoRef = propertyId ? `ANT-${propertyId}` : `ANT-${thirdPartyId}`;

    const lines = $app.findRecordsByFilter(
      "tx_lines",
      `third_party_id = '${thirdPartyId}'`,
      "", 10000, 0
    ) || [];

    let allowedRefs = null;
    let blockedRefs = null;

    if (propertyId) {
      allowedRefs = {};
      // Facturas de la unidad
      const invoices = $app.findRecordsByFilter(
        "ph_invoices",
        `property_id = '${propertyId}' && status != 'voided'`,
        "", 10000, 0
      ) || [];
      for (const inv of invoices) allowedRefs[inv.get("number")] = true;
      // Anticipo de esta unidad específica (siempre permitido)
      allowedRefs[anticipoRef] = true;
    } else {
      blockedRefs = {};
      try {
        const props = $app.findRecordsByFilter("ph_properties", `owner_id = '${thirdPartyId}'`, "", 1000, 0) || [];
        const propIds = {};
        for (const p of props) propIds[p.id] = true;

        if (props.length > 0) {
          const invoices = $app.findRecordsByFilter("ph_invoices", `status != 'voided'`, "", 10000, 0) || [];
          for (const inv of invoices) {
            if (propIds[inv.get("property_id")]) blockedRefs[inv.get("number")] = true;
          }
          // Bloquear anticipos de unidades (modo comercial no los ve)
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

        // Verificar si la cuenta maneja cruce O si es la cuenta de anticipos
        let cuentaValida = false;
        try {
          const acct = $app.findRecordById("accounts", lineAccountId);
          cuentaValida = !!acct.get("maneja_cruce");
        } catch(_) {}
        
        const esLineaAnticipo = anticipoAccountId && lineAccountId === anticipoAccountId && ref === anticipoRef;
        if (!cuentaValida && !esLineaAnticipo) continue;

        const tx = $app.findRecordById("transactions", line.get("tx_id"));
        if (tx && tx.get("status") === "voided") continue;

        const possibleBase = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;

        if (propertyId && allowedRefs) {
          const isAllowed = allowedRefs[ref] || allowedRefs[possibleBase];
          if (!isAllowed) continue;
        }
        if (!propertyId && blockedRefs) {
          const isBlocked = blockedRefs[ref] || blockedRefs[possibleBase];
          if (isBlocked) continue;
        }

        const key = ref + "|" + lineAccountId;
        if (!docsMap[key]) {
          const firstDate = tx ? (tx.get("date") || tx.get("created")) : "";
          docsMap[key] = {
            key, cross_doc_ref: ref, account_id: lineAccountId,
            firstDate, isAnticipo: ref === anticipoRef,
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
      const netOpen = d.debit - d.credit;
      if (Math.abs(netOpen) > 0.01) {
        d.saldo = Math.abs(netOpen);
        d.isReceivable = netOpen > 0;
        validItems.push(d);
      }
    }
    return validItems;
  }

  // ─── Distribución automática ────────────────────────────────────────────
  // Devuelve { anticipoAbonos, cashAbonos, nuevoAnticipo }
  function applyPaymentAuto(openItems, amount, rules) {
    // Separar anticipos (créditos disponibles) de cuentas por cobrar
    const anticipoItems = openItems.filter(i => i.isAnticipo && !i.isReceivable);
    const cxcItems      = openItems.filter(i => !i.isAnticipo);

    // Ordenar CxC: intereses primero, luego por fecha
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

    // PASO 1: Aplicar anticipos existentes contra CxC (sin cash)
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

    // PASO 2: Aplicar cash a CxC restante
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
    // Cuánto del anticipo existente se consume
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
    const anticipoAccountId      = getAnticipoAccountId();
    const anticipoRef            = propertyId ? `ANT-${propertyId}` : `ANT-${third_party_id}`;

    const openItems = getOpenItems(third_party_id, propertyId);

    let anticipoAbonos = [], cashAbonos = [], nuevoAnticipo = 0, anticipoConsumido = 0;

    if (modo === 'manual') {
      cashAbonos = applyPaymentManual(openItems, params.distribucion || []);
    } else {
      const result = applyPaymentAuto(openItems, amount, params.reglas || {});
      anticipoAbonos  = result.anticipoAbonos;
      cashAbonos      = result.cashAbonos;
      nuevoAnticipo   = result.nuevoAnticipo;
      anticipoConsumido = result.anticipoConsumido;
    }

    if (anticipoAbonos.length === 0 && cashAbonos.length === 0 && nuevoAnticipo <= 0.01) {
      throw new Error("No se generaron abonos ni anticipo. Cartera vacía para: " + third_party_id);
    }

    const txLinesCollection = $app.findCollectionByNameOrId('tx_lines');

    // 1. Líneas de cierre de anticipo existente → CxC (sin cash, aplicación interna)
    if (anticipoAbonos.length > 0 && anticipoAccountId && anticipoConsumido > 0.01) {
      // Débito a cuenta anticipos (cierra el saldo a favor)
      const lineDebitAnticipo = new Record(txLinesCollection);
      lineDebitAnticipo.set("tx_id", e.record.id);
      lineDebitAnticipo.set("account_id", anticipoAccountId);
      lineDebitAnticipo.set("third_party_id", third_party_id);
      lineDebitAnticipo.set("cross_doc_ref", anticipoRef);
      lineDebitAnticipo.set("debit", anticipoConsumido);
      lineDebitAnticipo.set("credit", 0);
      lineDebitAnticipo.set("description", "Aplicación anticipo a cartera " + anticipoRef);
      $app.save(lineDebitAnticipo);

      // Créditos a cada CxC abonada con anticipo
      for (const ab of anticipoAbonos) {
        const lineCredCxC = new Record(txLinesCollection);
        lineCredCxC.set("tx_id", e.record.id);
        lineCredCxC.set("account_id", ab.account_id);
        lineCredCxC.set("third_party_id", third_party_id);
        lineCredCxC.set("cross_doc_ref", ab.cross_doc_ref);
        lineCredCxC.set("debit", 0);
        lineCredCxC.set("credit", ab.monto);
        lineCredCxC.set("description", "Abono desde anticipo a " + ab.cross_doc_ref);
        $app.save(lineCredCxC);
      }
    }

    // 2. Líneas de cash → CxC
    for (const ab of cashAbonos) {
      const lineCash = new Record(txLinesCollection);
      lineCash.set("tx_id", e.record.id);
      lineCash.set("account_id", ab.account_id);
      lineCash.set("third_party_id", third_party_id);
      lineCash.set("cross_doc_ref", ab.cross_doc_ref);
      if (ab.isReceivable) {
        lineCash.set("debit", 0); lineCash.set("credit", ab.monto);
      } else {
        lineCash.set("debit", ab.monto); lineCash.set("credit", 0);
      }
      lineCash.set("description", "Abono a " + ab.cross_doc_ref);
      $app.save(lineCash);
    }

    // 3. Nuevo anticipo (excedente de cash)
    if (nuevoAnticipo > 0.01 && anticipoAccountId) {
      const lineAnticipo = new Record(txLinesCollection);
      lineAnticipo.set("tx_id", e.record.id);
      lineAnticipo.set("account_id", anticipoAccountId);
      lineAnticipo.set("third_party_id", third_party_id);
      lineAnticipo.set("cross_doc_ref", anticipoRef);
      lineAnticipo.set("debit", 0);
      lineAnticipo.set("credit", nuevoAnticipo);
      lineAnticipo.set("description", "Anticipo / Saldo a favor " + anticipoRef);
      $app.save(lineAnticipo);
    }

    // 4. Contrapartida a bancos/caja (solo el cash real recibido)
    if (amount > 0.01 && contrapartida_account_id) {
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
      $app.save(contraLine);
    }
  }

  try {
    doRegistrarPago(e, txType, modo, params);
  } catch (err) {
    console.error("[GRAVY] Error en registrarPago:", err);
    throw new BadRequestError("Error en registrarPago: " + (err.message || err));
  }
}, 'transactions');
