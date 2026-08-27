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

  if (txType !== 'RC' && txType !== 'CE') return e.next();
  
  const modo = String(rec.get('teso_mode') || 'auto');
  let paramsStr = rec.get('teso_params');
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

    const lines = $app.findRecordsByFilter(
      "tx_lines",
      `third_party_id = '${thirdPartyId}'`,
      "", 10000, 0
    ) || [];

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
        const ref = String(line.get("cross_doc_ref") || "").trim();
        if (!ref) continue;

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

        const key = ref + "|" + lineAccountId;
        if (!docsMap[key]) {
          docsMap[key] = {
            key, cross_doc_ref: ref, account_id: lineAccountId, account_code: code,
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
      if (amount > sumDist + 0.01) {
        nuevoAnticipo = amount - sumDist;
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

      let saldoCash = amount;
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

  // 2. Abonos con Cash / Medios de Pago a Cartera
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

  // 4. Medios de pago / Contrapartida caja-bancos
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

  // 5. Retención en la Fuente
  const retFuenteAmt = Number(params.ret_fuente_amount || 0);
  const retFuenteAcc = params.ret_fuente_account_id;
  if (retFuenteAmt > 0.01 && retFuenteAcc) {
    plannedLines.push({
      account_id: retFuenteAcc,
      third_party_id: third_party_id,
      cross_doc_ref: anticipoRef,
      debit: isRC ? retFuenteAmt : 0,
      credit: isRC ? 0 : retFuenteAmt,
      description: "Retención en la Fuente"
    });
  }

  // 6. Retención ICA
  const retIcaAmt = Number(params.ret_ica_amount || 0);
  const retIcaAcc = params.ret_ica_account_id;
  if (retIcaAmt > 0.01 && retIcaAcc) {
    plannedLines.push({
      account_id: retIcaAcc,
      third_party_id: third_party_id,
      cross_doc_ref: anticipoRef,
      debit: isRC ? retIcaAmt : 0,
      credit: isRC ? 0 : retIcaAmt,
      description: "Retención ICA"
    });
  }

  // 7. Descuento
  const descAmt = Number(params.descuento_amount || 0);
  const descAcc = params.descuento_account_id;
  if (descAmt > 0.01 && descAcc) {
    plannedLines.push({
      account_id: descAcc,
      third_party_id: third_party_id,
      cross_doc_ref: anticipoRef,
      debit: isRC ? descAmt : 0,
      credit: isRC ? 0 : descAmt,
      description: "Descuento comercial condicionado"
    });
  }

  // 8. Ajuste al Peso
  const ajustePesoAmt = Number(params.ajuste_peso_amount || 0);
  const ajustePesoAcc = params.ajuste_peso_account_id;
  const ajustePesoType = params.ajuste_peso_type || 'faltante';
  if (ajustePesoAmt > 0.001 && ajustePesoAcc) {
    const isSobrante = ajustePesoType === 'sobrante';
    plannedLines.push({
      account_id: ajustePesoAcc,
      third_party_id: third_party_id,
      cross_doc_ref: anticipoRef,
      debit: isSobrante ? 0 : ajustePesoAmt,
      credit: isSobrante ? ajustePesoAmt : 0,
      description: `Ajuste al peso (${isSobrante ? 'Sobrante' : 'Faltante'})`
    });
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
      if (pl.cross_doc_ref) lineRec.set("cross_doc_ref", pl.cross_doc_ref);
      lineRec.set("debit", pl.debit);
      lineRec.set("credit", pl.credit);
      lineRec.set("description", pl.description);
      if (branch_id) lineRec.set("branch_id", branch_id);
      if (cost_center_id) lineRec.set("cost_center_id", cost_center_id);

      $app.save(lineRec);
      savedLineRecords.push(lineRec);
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
