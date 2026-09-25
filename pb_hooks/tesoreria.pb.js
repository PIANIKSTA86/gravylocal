/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — tesoreria.pb.js
 * Motor transaccional y contable de Tesorería (Recibos de Caja RC y Comprobantes de Egreso CE).
 * Garantiza integridad contable, partida doble estricta y atomicidad de registro.
 */

onRecordCreateRequest((e) => {
  const rec = e.record;
  if (!rec) return e.next();
  
  const colName = String(rec.collection().name);
  if (colName !== 'transactions') return e.next();
  
  const txTypeId = rec.get('tx_type_id');
  if (!txTypeId) return e.next();
  
  let txType = '';
  try {
    const txTypeRec = $app.findRecordById("transaction_types", txTypeId);
    txType = String(txTypeRec.get("code") || "").toUpperCase();
    if (!txType) {
      const prefix = String(txTypeRec.get("prefix") || "").toUpperCase();
      if (prefix.indexOf('RC') === 0) txType = 'RC';
      else if (prefix.indexOf('CE') === 0) txType = 'CE';
    }
  } catch(_) {}

  const modo = String(rec.get('teso_mode') || 'auto');
  let paramsStr = rec.get('teso_params');
  let isCruceContable = false;
  if (paramsStr) {
    try {
      const pTest = JSON.parse(String(paramsStr));
      if (pTest.cruzar_anticipos || pTest.ph_property_id || pTest.is_cruce_anticipo) {
        isCruceContable = true;
      }
    } catch(_) {}
  }

  if (txType !== 'RC' && txType !== 'CE' && !isCruceContable) return e.next();
  if (isCruceContable && txType !== 'CE') txType = 'RC';

  if (!paramsStr) {
    throw new BadRequestError("Operación denegada: Faltan los parámetros de tesorería (teso_params) requeridos para generar el comprobante contable.");
  }

  let params = {};
  try {
    params = JSON.parse(String(paramsStr));
  } catch(err) {
    throw new BadRequestError("Parámetros de tesorería corruptos o formato JSON inválido.");
  }

  // ─── Validaciones Previas Esenciales ─────────────────────────────────────
  const third_party_id = String(params.third_party_id || rec.get('third_party_id') || '').trim();
  if (!third_party_id) {
    throw new BadRequestError("Debe seleccionar un tercero o beneficiario válido para la transacción.");
  }

  const isRC = txType === 'RC';
  const propertyId = params.ph_property_id || null;
  const cruzarAnticipos = params.cruzar_anticipos !== false;
  const branch_id = rec.get("branch_id") || null;
  const cost_center_id = params.cost_center_id || null;

  // ─── Cache y utilidades de cuentas contables ──────────────────────────────
  const accountsCache = {};
  function getAccountRecord(accId) {
    if (!accId) return null;
    if (accountsCache[accId]) return accountsCache[accId];
    try {
      const a = $app.findRecordById("accounts", accId);
      accountsCache[accId] = a;
      return a;
    } catch(_) {
      return null;
    }
  }

  function accountManejaCruce(accId) {
    const a = getAccountRecord(accId);
    if (!a) return false;
    return !!(a.getBool("maneja_cruce") || a.get("maneja_cruce") === true || a.get("maneja_cruce") === 1);
  }

  // ─── Cuenta de anticipos (RC -> 28 / CE -> 1330) ──────────────────────────
  function getAnticipoAccountId(txType) {
    try {
      const tesoRulesRec = $app.findFirstRecordByFilter('settings', 'key="treasury_rules"');
      if (tesoRulesRec) {
        const cfg = JSON.parse(tesoRulesRec.get('value') || '{}');
        if (txType === 'CE' && cfg.anticipo_proveedor_account_id) return cfg.anticipo_proveedor_account_id;
        if (txType === 'RC' && cfg.anticipo_cliente_account_id) return cfg.anticipo_cliente_account_id;
      }
    } catch(_) {}

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
        const acc = $app.findFirstRecordByFilter('accounts', 'code ~ "133005%" || code = "133005" || code ~ "1330%" || code = "1330"');
        if (acc) return acc.id;
      } else {
        const acc = $app.findFirstRecordByFilter('accounts', 'code ~ "280505%" || code ~ "2805%" || code = "2805" || code ~ "28%"');
        if (acc) return acc.id;
      }
    } catch(_) {}
    return null;
  }

  const anticipoAccountId = getAnticipoAccountId(txType);
  const anticipoRef = propertyId ? `ANT-${propertyId}` : `ANT-${third_party_id}`;

  // ─── Obtener partidas abiertas reales ────────────────────────────────────
  function getOpenItems(thirdPartyId, propId, type, cruzarAnt) {
    const isRec = type === 'RC';
    const antAccId = getAnticipoAccountId(type);
    const antRef = propId ? `ANT-${propId}` : `ANT-${thirdPartyId}`;

    let lines = [];
    try {
      let filter = `third_party_id = '${thirdPartyId}'`;
      if (propId) {
        filter += ` || cross_doc_ref = '${antRef}'`;
      }
      lines = $app.findRecordsByFilter("tx_lines", filter, "", 10000, 0) || [];
    } catch(_) {
      lines = $app.findRecordsByFilter("tx_lines", `third_party_id = '${thirdPartyId}'`, "", 10000, 0) || [];
    }

    let allowedRefs = null;
    let blockedRefs = null;

    if (propId) {
      allowedRefs = {};
      const invoices = $app.findRecordsByFilter("ph_invoices", `property_id = '${propId}' && status != 'voided'`, "", 10000, 0) || [];
      for (const inv of invoices) allowedRefs[inv.get("number")] = true;
      if (cruzarAnt) allowedRefs[antRef] = true;
    } else {
      // En modo comercial, permitir cruce de facturas del tercero
      allowedRefs = {};
      try {
        const commInvoices = $app.findRecordsByFilter("invoices", `customer_id = '${thirdPartyId}' && status != 'voided'`, "", 10000, 0) || [];
        for (const inv of commInvoices) allowedRefs[inv.get("number")] = true;
      } catch(_) {}

      blockedRefs = {};
      try {
        const props = $app.findRecordsByFilter("ph_properties", `owner_id = '${thirdPartyId}'`, "", 1000, 0) || [];
        if (props.length > 0) {
          const propIds = {};
          for (const p of props) propIds[p.id] = true;
          const phInvoices = $app.findRecordsByFilter("ph_invoices", `status != 'voided'`, "", 10000, 0) || [];
          for (const inv of phInvoices) {
            if (propIds[inv.get("property_id")]) blockedRefs[inv.get("number")] = true;
          }
          for (const p of props) blockedRefs[`ANT-${p.id}`] = true;
        }
      } catch(_) {}
    }

    const docsMap = {};
    for (const line of lines) {
      try {
        const lineAccountId = line.get("account_id");
        let ref = String(line.get("cross_doc_ref") || "").trim();

        let code = '';
        try {
          const acct = $app.findRecordById("accounts", lineAccountId);
          code = String(acct.get("code") || "");
        } catch(_) {}

        let esCuentaCruce = false;
        let esCuentaAnticipo = false;

        if (isRec) {
          esCuentaCruce = code.indexOf('13') === 0 && code.indexOf('1330') !== 0;
          esCuentaAnticipo = code.indexOf('28') === 0 || ref === antRef || (antAccId && lineAccountId === antAccId);
        } else {
          esCuentaCruce = code.indexOf('21') === 0 || code.indexOf('22') === 0 || code.indexOf('23') === 0 || code.indexOf('25') === 0;
          esCuentaAnticipo = code.indexOf('1330') === 0 || ref === antRef || (antAccId && lineAccountId === antAccId);
        }

        // Si es cuenta de anticipo (28 / 1330) y no trae referencia, asignar la canónica antRef
        if (esCuentaAnticipo && !ref) {
          ref = antRef;
        }

        if (!ref) continue;
        if (!cruzarAnt && esCuentaAnticipo) continue;
        if (!esCuentaCruce && !esCuentaAnticipo) continue;

        const possibleBase = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
        const inAllowed = allowedRefs && (allowedRefs[ref] || allowedRefs[possibleBase]);
        const inBlocked = blockedRefs && (blockedRefs[ref] || blockedRefs[possibleBase]);

        if (propId && !inAllowed && !esCuentaAnticipo) continue;
        if (!propId && inBlocked && !esCuentaAnticipo) continue;

        try {
          const tx = $app.findRecordById("transactions", line.get("tx_id"));
          if (tx && tx.get("status") === "voided") continue;
        } catch(_) {}

        // Agrupar anticipos bajo antRef para consolidar el saldo neto a favor disponible
        const docRefKey = esCuentaAnticipo ? antRef : ref;
        const key = docRefKey + "|" + lineAccountId;
        if (!docsMap[key]) {
          docsMap[key] = {
            key, cross_doc_ref: docRefKey, account_id: lineAccountId, account_code: code,
            isAnticipo: esCuentaAnticipo,
            debit: 0, credit: 0
          };
        }
        docsMap[key].debit  += Number(line.get("debit")  || 0);
        docsMap[key].credit += Number(line.get("credit") || 0);
      } catch(_) {}
    }

    const validItems = [];
    for (const key in docsMap) {
      const d = docsMap[key];
      let netOpen = 0;
      if (d.isAnticipo) {
        netOpen = isRec ? (d.credit - d.debit) : (d.debit - d.credit);
        if (netOpen > 0.01) {
          d.saldo = netOpen;
          d.isReceivable = false;
          validItems.push(d);
        }
      } else {
        netOpen = isRec ? (d.debit - d.credit) : (d.credit - d.debit);
        if (Math.abs(netOpen) > 0.01) {
          d.saldo = Math.abs(netOpen);
          d.isReceivable = netOpen > 0;
          validItems.push(d);
        }
      }
    }
    return validItems;
  }

  // ─── Planificar Asientos en Memoria ───────────────────────────────────────
  const openItems = getOpenItems(third_party_id, propertyId, txType, cruzarAnticipos);
  const amount = Number(params.amount || 0);

  const retFuenteAmt = Number(params.ret_fuente_amount || 0);
  const retFuenteAcc = params.ret_fuente_account_id;
  const retIcaAmt = Number(params.ret_ica_amount || 0);
  const retIcaAcc = params.ret_ica_account_id;
  const descAmt = Number(params.descuento_amount || 0);
  const descAcc = params.descuento_account_id;
  const ajustePesoAmt = Number(params.ajuste_peso_amount || 0);
  const ajustePesoAcc = params.ajuste_peso_account_id;
  const ajustePesoType = params.ajuste_peso_type || 'faltante';

  // El monto total de cartera que esta transacción cubre / cancela:
  // En RC: Si faltante (gasto), el cliente pagó menos en banco, por ende cancela amount + retenciones + desc + faltante
  //        Si sobrante (ingreso), el cliente pagó de más, cancela amount + retenciones + desc - sobrante
  // En CE: Si sobrante (aprovechamiento/ingreso), pagamos menos en banco, por ende cancela amount + retenciones + desc + sobrante
  //        Si faltante (gasto), pagamos de más en banco, cancela amount + retenciones + desc - faltante
  let totalCarteraACancelar = amount + retFuenteAmt + retIcaAmt + descAmt;
  if (ajustePesoAmt > 0.001) {
    if (isRC) {
      totalCarteraACancelar += (ajustePesoType === 'faltante' ? ajustePesoAmt : -ajustePesoAmt);
    } else {
      totalCarteraACancelar += (ajustePesoType === 'sobrante' ? ajustePesoAmt : -ajustePesoAmt);
    }
  }
  totalCarteraACancelar = Math.round(totalCarteraACancelar * 100) / 100;

  let anticipoAbonos = [];
  let cashAbonos = [];
  let nuevoAnticipo = 0;
  let anticipoConsumido = 0;

  if (modo === 'manual') {
    const rawDist = Array.isArray(params.distribucion) ? params.distribucion : [];
    for (const d of rawDist) {
      const m = Number(d.monto || 0);
      if (m > 0.01) {
        const match = openItems.find(i => i.key === d.key || i.cross_doc_ref === d.cross_doc_ref);
        cashAbonos.push({
          key: d.key || (d.cross_doc_ref + '|' + d.account_id),
          cross_doc_ref: d.cross_doc_ref,
          account_id: d.account_id || (match ? match.account_id : null),
          monto: match ? Math.min(m, match.saldo) : m,
          isReceivable: match ? match.isReceivable : true,
          isAnticipo: match ? match.isAnticipo : false
        });
      }
    }

    // Si hay ajuste al peso en modo manual, asegurar que los abonos a cartera cuadren con el total a cancelar
    if (ajustePesoAmt > 0.001 && cashAbonos.length > 0) {
      const currentCashSum = cashAbonos.reduce((s, a) => s + a.monto, 0);
      const diffToCover = Math.round((totalCarteraACancelar - currentCashSum) * 100) / 100;
      
      if (Math.abs(diffToCover) > 0.005) {
        // Encontrar el abono que tiene la diferencia pendiente con respecto a su saldo en cartera
        let targetAbono = null;
        for (const ab of cashAbonos) {
          const match = openItems.find(i => i.cross_doc_ref === ab.cross_doc_ref);
          if (match && Math.abs((match.saldo - ab.monto) - diffToCover) < 0.05) {
            targetAbono = ab;
            break;
          }
        }
        if (!targetAbono) targetAbono = cashAbonos[0];
        targetAbono.monto = Math.round((targetAbono.monto + diffToCover) * 100) / 100;
      }
    }
  } else {
    // Modo automático:
    // Si el cliente envió una distribución calculada directamente desde UI
    const clientDist = Array.isArray(params.distribucion) ? params.distribucion.filter(d => Number(d.monto || 0) > 0.01) : [];
    
    if (clientDist.length > 0 && openItems.length === 0) {
      for (const d of clientDist) {
        cashAbonos.push({
          key: d.key,
          cross_doc_ref: d.cross_doc_ref,
          account_id: d.account_id,
          monto: Number(d.monto),
          isReceivable: true,
          isAnticipo: false
        });
      }
      const sumDist = cashAbonos.reduce((s, a) => s + a.monto, 0);
      if (totalCarteraACancelar > sumDist + 0.01) {
        nuevoAnticipo = totalCarteraACancelar - sumDist;
      }
    } else {
      // Separar anticipos disponibles de cartera
      const anticipoItems = cruzarAnticipos ? openItems.filter(i => i.isAnticipo && !i.isReceivable) : [];
      const cxcItems      = openItems.filter(i => !i.isAnticipo);
      const rules         = params.reglas || {};

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
        return 0;
      });

      let anticipoDisponible = anticipoItems.reduce((s, i) => s + i.saldo, 0);
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

      let saldoCash = totalCarteraACancelar;
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

      nuevoAnticipo = saldoCash > 0.01 ? saldoCash : 0;
      anticipoConsumido = Math.min(anticipoDisponible, anticipoAbonos.reduce((s, a) => s + a.monto, 0));
    }
  }

  // ─── Construir y validar lista de líneas en memoria ───────────────────────
  const plannedLines = [];

  // 1. Anticipo existente consumido
  if (anticipoAbonos.length > 0 && anticipoAccountId && anticipoConsumido > 0.01) {
    plannedLines.push({
      account_id: anticipoAccountId,
      third_party_id: third_party_id,
      cross_doc_ref: anticipoRef,
      debit: isRC ? anticipoConsumido : 0,
      credit: isRC ? 0 : anticipoConsumido,
      description: "Aplicación anticipo " + anticipoRef
    });
    for (const ab of anticipoAbonos) {
      if (!ab.account_id || ab.monto <= 0) continue;
      plannedLines.push({
        account_id: ab.account_id,
        third_party_id: third_party_id,
        cross_doc_ref: ab.cross_doc_ref,
        debit: isRC ? 0 : ab.monto,
        credit: isRC ? ab.monto : 0,
        description: "Abono desde anticipo a " + ab.cross_doc_ref
      });
    }
  }

  // 2. Abonos con Cash / Medios de Pago a Cartera (CxC / CxP)
  for (const ab of cashAbonos) {
    if (!ab.account_id || ab.monto <= 0) continue;
    plannedLines.push({
      account_id: ab.account_id,
      third_party_id: third_party_id,
      cross_doc_ref: ab.cross_doc_ref,
      debit: isRC ? 0 : ab.monto,
      credit: isRC ? ab.monto : 0,
      description: "Abono a " + ab.cross_doc_ref
    });
  }

  // 3. Nuevo Anticipo (Excedente)
  if (nuevoAnticipo > 0.01) {
    if (!anticipoAccountId) {
      throw new BadRequestError("No se encontró la cuenta contable de anticipos (2805 / 1330) configurada para registrar el excedente.");
    }
    plannedLines.push({
      account_id: anticipoAccountId,
      third_party_id: third_party_id,
      cross_doc_ref: anticipoRef,
      debit: isRC ? 0 : nuevoAnticipo,
      credit: isRC ? nuevoAnticipo : 0,
      description: "Anticipo / Saldo a favor " + anticipoRef
    });
  }

  // 4. Medios de pago / Contrapartida caja-bancos (Valor neto transado real)
  if (params.medios_pago && Array.isArray(params.medios_pago) && params.medios_pago.length > 0) {
    for (const mp of params.medios_pago) {
      const mpAmount = Number(mp.monto || 0);
      const mpAccId = mp.account_id;
      if (mpAmount > 0.01 && mpAccId) {
        const descPrefix = isRC ? 'Ingreso ' : 'Salida ';
        const descMetodo = mp.metodo ? mp.metodo : 'Caja/Bancos';
        const descRef = mp.referencia ? ` Ref: ${mp.referencia}` : '';
        plannedLines.push({
          account_id: mpAccId,
          third_party_id: third_party_id,
          debit: isRC ? mpAmount : 0,
          credit: isRC ? 0 : mpAmount,
          description: `${descPrefix}${descMetodo}${descRef}`
        });
      }
    }
  } else if (amount > 0.01 && params.contrapartida_account_id) {
    plannedLines.push({
      account_id: params.contrapartida_account_id,
      third_party_id: third_party_id,
      debit: isRC ? amount : 0,
      credit: isRC ? 0 : amount,
      description: isRC ? 'Ingreso a Caja/Bancos por Recaudo' : 'Salida de Caja/Bancos por Pago'
    });
  }

  // Determinar documento principal de cruce para retenciones, descuentos y ajuste al peso
  const primaryDocRef = (cashAbonos.length > 0 && cashAbonos[0].cross_doc_ref) 
    ? cashAbonos[0].cross_doc_ref 
    : ((params.distribucion && params.distribucion.length > 0 && params.distribucion[0].cross_doc_ref) 
        ? params.distribucion[0].cross_doc_ref 
        : anticipoRef);

  // 5. Retención en la Fuente
  if (retFuenteAmt > 0.01 && retFuenteAcc) {
    plannedLines.push({
      account_id: retFuenteAcc,
      third_party_id: third_party_id,
      cross_doc_ref: accountManejaCruce(retFuenteAcc) ? primaryDocRef : null,
      debit: isRC ? retFuenteAmt : 0,
      credit: isRC ? 0 : retFuenteAmt,
      description: "Retención en la Fuente"
    });
  }

  // 6. Retención ICA
  if (retIcaAmt > 0.01 && retIcaAcc) {
    plannedLines.push({
      account_id: retIcaAcc,
      third_party_id: third_party_id,
      cross_doc_ref: accountManejaCruce(retIcaAcc) ? primaryDocRef : null,
      debit: isRC ? retIcaAmt : 0,
      credit: isRC ? 0 : retIcaAmt,
      description: "Retención ICA"
    });
  }

  // 7. Descuento
  if (descAmt > 0.01 && descAcc) {
    plannedLines.push({
      account_id: descAcc,
      third_party_id: third_party_id,
      cross_doc_ref: accountManejaCruce(descAcc) ? primaryDocRef : null,
      debit: isRC ? descAmt : 0,
      credit: isRC ? 0 : descAmt,
      description: "Descuento comercial condicionado"
    });
  }

  // 8. Ajuste al Peso (Afecta la CxC/CxP mediante su contrapartida de Ingreso/Gasto)
  let resolvedAjustePesoAcc = ajustePesoAcc;
  if (ajustePesoAmt > 0.001) {
    if (!resolvedAjustePesoAcc) {
      try {
        const tesoRulesRec = $app.findFirstRecordByFilter('settings', 'key="treasury_rules"');
        if (tesoRulesRec) {
          const cfg = JSON.parse(tesoRulesRec.get('value') || '{}');
          resolvedAjustePesoAcc = (ajustePesoType === 'sobrante') 
            ? cfg.ajuste_peso_sobrante_account_id 
            : cfg.ajuste_peso_faltante_account_id;
        }
      } catch(_) {}
    }
    if (!resolvedAjustePesoAcc) {
      try {
        const isSob = ajustePesoType === 'sobrante';
        const filterStr = isSob 
          ? 'code ~ "429581%" || code ~ "4210%" || name ~ "AJUSTE AL PESO%"' 
          : 'code ~ "530595%" || code ~ "5305%" || name ~ "AJUSTE AL PESO%"';
        const fallbackAcc = $app.findFirstRecordByFilter('accounts', filterStr);
        if (fallbackAcc) resolvedAjustePesoAcc = fallbackAcc.id;
      } catch(_) {}
    }

    if (resolvedAjustePesoAcc) {
      const isSobrante = ajustePesoType === 'sobrante';
      plannedLines.push({
        account_id: resolvedAjustePesoAcc,
        third_party_id: third_party_id,
        // Cuentas de resultado (Ingreso 42 / Gasto 53) no manejan documento de cruce
        cross_doc_ref: accountManejaCruce(resolvedAjustePesoAcc) ? primaryDocRef : null,
        debit: isSobrante ? 0 : ajustePesoAmt,
        credit: isSobrante ? ajustePesoAmt : 0,
        description: `Ajuste al peso (${isSobrante ? 'Sobrante' : 'Faltante'})`
      });
    }
  }

  // ─── VALIDACIÓN ESTRICTA DE PARTIDA DOBLE EN MEMORIA ──────────────────────
  let sumDebits = 0;
  let sumCredits = 0;
  for (const pl of plannedLines) {
    sumDebits += Number(pl.debit || 0);
    sumCredits += Number(pl.credit || 0);
  }

  sumDebits = Math.round(sumDebits * 100) / 100;
  sumCredits = Math.round(sumCredits * 100) / 100;

  if (plannedLines.length < 2) {
    throw new BadRequestError(`No se puede registrar el comprobante: Debe generar al menos 2 movimientos contables. Líneas planificadas: ${plannedLines.length}. Verifique la cartera y los medios de pago.`);
  }

  if (sumDebits <= 0.01 || sumCredits <= 0.01) {
    throw new BadRequestError(`No se puede registrar un comprobante con valor $0. (Débitos: $${sumDebits}, Créditos: $${sumCredits}). Ingrese un valor válido.`);
  }

  const diff = Math.abs(sumDebits - sumCredits);
  if (diff >= 0.05) {
    throw new BadRequestError(`Asiento contable descuadrado. La suma de débitos ($${sumDebits}) no coincide con créditos ($${sumCredits}). Diferencia: $${diff.toFixed(2)}.`);
  }

  // ─── Persistencia Atómica ────────────────────────────────────────────────
  // Primero se guarda la cabecera
  try {
    e.next();
  } catch (err) {
    throw new BadRequestError("Error en base de datos al crear transacción: " + (err.message || err));
  }

  // Ahora se guardan las líneas asociadas a la transacción creada
  const txLinesCollection = $app.findCollectionByNameOrId('tx_lines');
  const savedLineRecords = [];

  try {
    for (const pl of plannedLines) {
      const lineRec = new Record(txLinesCollection);
      lineRec.set("tx_id", rec.id);
      lineRec.set("account_id", pl.account_id);
      lineRec.set("third_party_id", pl.third_party_id);
      // Respetar estrictamente la configuración 'maneja_cruce' de la cuenta contable
      if (pl.cross_doc_ref && accountManejaCruce(pl.account_id)) {
        lineRec.set("cross_doc_ref", pl.cross_doc_ref);
      } else {
        lineRec.set("cross_doc_ref", "");
      }
      lineRec.set("debit", pl.debit);
      lineRec.set("credit", pl.credit);
      lineRec.set("description", pl.description);
      if (branch_id) lineRec.set("branch_id", branch_id);
      if (cost_center_id) lineRec.set("cost_center_id", cost_center_id);

      $app.save(lineRec);
      savedLineRecords.push(lineRec);
    }

    // ── Auto-sincronización de facturas PH saldadas tras el recaudo (individual o masivo) ──
    try {
      const phInvsToCheck = {};
      for (const pl of plannedLines) {
        if (pl.cross_doc_ref) {
          const rawRef = String(pl.cross_doc_ref).trim();
          const baseRef = rawRef.lastIndexOf('-') > 0 ? rawRef.substring(0, rawRef.lastIndexOf('-')) : rawRef;
          phInvsToCheck[rawRef] = true;
          phInvsToCheck[baseRef] = true;
        }
      }
      for (const refNum in phInvsToCheck) {
        if (!refNum || refNum.startsWith('ANT-')) continue;
        const foundInvs = $app.findRecordsByFilter('ph_invoices', "number = '" + refNum + "' && status != 'voided'", "", 10, 0);
        if (foundInvs && foundInvs.length > 0) {
          for (const invRec of foundInvs) {
            try {
              if (typeof autoMarkPaidIfSettled === 'function') {
                autoMarkPaidIfSettled(invRec);
              } else {
                var invNum = invRec.getString("number");
                var invTot = invRec.getFloat("total");
                var q = $app.db().newQuery(
                  "SELECT COALESCE(SUM(l.credit), 0) AS total_paid FROM tx_lines l " +
                  "INNER JOIN transactions t ON t.id = l.tx_id " +
                  "INNER JOIN accounts a ON a.id = l.account_id " +
                  "WHERE t.status = 'active' AND a.code LIKE '13%' " +
                  "AND (l.cross_doc_ref = {:num} OR l.cross_doc_ref LIKE {:numLike})"
                );
                q.bind({ num: invNum, numLike: invNum + '-%' });
                var resD = new DynamicModel({ total_paid: 0 });
                q.one(resD);
                if (Number(resD.total_paid || 0) >= invTot - 0.01) {
                  invRec.set("status", "paid");
                  $app.save(invRec);
                  console.log('[GRAVY TESORERIA] Factura PH ' + invNum + ' marcada automáticamente como paid.');
                }
              }
            } catch (errOne) {
              console.warn('[GRAVY TESORERIA] Error evaluando saldo factura ' + refNum + ':', errOne);
            }
          }
        }

        // Sincronización de facturas comerciales (invoices)
        try {
          const commInvs = $app.findRecordsByFilter('invoices', "number = '" + refNum + "' && status != 'voided' && status != 'paid'", "", 10, 0);
          if (commInvs && commInvs.length > 0) {
            for (const cInv of commInvs) {
              const cInvNum = cInv.getString("number");
              const cInvTot = cInv.getFloat("total");
              const qComm = $app.db().newQuery(
                "SELECT COALESCE(SUM(l.credit), 0) AS total_paid FROM tx_lines l " +
                "INNER JOIN transactions t ON t.id = l.tx_id " +
                "INNER JOIN accounts a ON a.id = l.account_id " +
                "WHERE t.status = 'active' AND a.code LIKE '13%' " +
                "AND (l.cross_doc_ref = {:num} OR l.cross_doc_ref LIKE {:numLike})"
              );
              qComm.bind({ num: cInvNum, numLike: cInvNum + '-%' });
              const resC = new DynamicModel({ total_paid: 0 });
              qComm.one(resC);
              if (Number(resC.total_paid || 0) >= cInvTot - 0.01) {
                cInv.set("status", "paid");
                $app.save(cInv);
                console.log('[GRAVY TESORERIA] Factura comercial ' + cInvNum + ' marcada automáticamente como paid.');
              }
            }
          }
        } catch (_) {}
      }
    } catch (errSync) {
      console.warn('[GRAVY TESORERIA] Aviso sincronizando facturas tras recaudo:', errSync);
    }
  } catch (saveErr) {
    // Si falla el guardado de alguna línea, ROLLBACK: eliminar líneas creadas y la cabecera
    for (const sl of savedLineRecords) {
      try { $app.delete(sl); } catch(_) {}
    }
    try { $app.delete(rec); } catch(_) {}

    console.error("[GRAVY] Error guardando líneas de tesorería, rollback ejecutado:", saveErr);
    throw new BadRequestError("Error crítico al asentar líneas contables: " + (saveErr.message || saveErr));
  }
}, 'transactions');
