/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — tesoreria.pb.js
 * Motor de aplicación de abonos y generación de líneas de contrapartida.
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
  
  function getOpenItems(thirdPartyId) {
    const lines = $app.findRecordsByFilter(
      "tx_lines", 
      `third_party_id = '${thirdPartyId}'`, 
      "", 
      10000, 
      0
    ) || [];
    
    const docsMap = {};
    for (const line of lines) {
      try {
        const acct = $app.findRecordById("accounts", line.get("account_id"));
        if (!acct.get("maneja_cruce")) continue;
        
        const ref = String(line.get("cross_doc_ref") || "").trim();
        if (!ref) continue;

        const accountId = line.get("account_id");
        const key = ref + "|" + accountId;

        if (!docsMap[key]) {
          let firstDate = "";
          try {
            const tx = $app.findRecordById("transactions", line.get("tx_id"));
            firstDate = tx.get("date") || tx.get("created");
          } catch(err) {}

          docsMap[key] = {
            key: key,
            cross_doc_ref: ref,
            account_id: accountId,
            firstDate: firstDate,
            debit: 0,
            credit: 0
          };
        }

        docsMap[key].debit += Number(line.get("debit") || 0);
        docsMap[key].credit += Number(line.get("credit") || 0);

      } catch(err) {
        // Ignorar
      }
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

  function applyPaymentAuto(openItems, amount, rules) {
    let saldo = amount;
    const abonos = [];
    let items = [...openItems];

    items.sort((a, b) => {
      if (rules.interesPrioridad && Array.isArray(rules.cuentasInteres) && rules.cuentasInteres.length > 0) {
        try {
          const aAcct = $app.findRecordById("accounts", a.account_id);
          const bAcct = $app.findRecordById("accounts", b.account_id);
          const aCode = String(aAcct.get("code"));
          const bCode = String(bAcct.get("code"));
          const aIsInteres = rules.cuentasInteres.includes(aCode);
          const bIsInteres = rules.cuentasInteres.includes(bCode);
          
          if (aIsInteres && !bIsInteres) return -1;
          if (!aIsInteres && bIsInteres) return 1;
        } catch(err) {}
      }

      if (rules.primeroVencido) {
        const dateA = new Date(a.firstDate).getTime();
        const dateB = new Date(b.firstDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }
      return 0;
    });

    for (const item of items) {
      if (saldo <= 0) break;
      const pendiente = item.saldo;
      const abono = Math.min(saldo, pendiente);
      
      if (abono > 0) {
        abonos.push({ 
          key: item.key,
          cross_doc_ref: item.cross_doc_ref,
          monto: abono,
          isReceivable: item.isReceivable,
          account_id: item.account_id
        });
        saldo -= abono;
      }
    }
    return abonos;
  }

  function applyPaymentManual(openItems, distribucion) {
    const abonos = [];
    for (const d of distribucion) {
      let item = null;
      for (const i of openItems) {
        if (i.key === d.key) { item = i; break; }
      }
      if (!item) continue;

      const pendiente = item.saldo;
      const abono = Math.min(Number(d.monto), pendiente);
      
      if (abono > 0) {
        abonos.push({ 
          key: item.key,
          cross_doc_ref: item.cross_doc_ref,
          monto: abono,
          isReceivable: item.isReceivable,
          account_id: item.account_id
        });
      }
    }
    return abonos;
  }

  function doRegistrarPago(e, txType, modo, params) {
    const third_party_id = params.third_party_id;
    const amount = Number(params.amount);
    const contrapartida_account_id = params.contrapartida_account_id;
    const openItems = getOpenItems(third_party_id);
    
    let abonos = [];
    if (modo === 'manual') {
      abonos = applyPaymentManual(openItems, params.distribucion || []);
    } else {
      abonos = applyPaymentAuto(openItems, amount, params.reglas || {});
    }

    const txLinesCollection = $app.findCollectionByNameOrId('tx_lines');
    let totalAplicado = 0;

    if (abonos.length === 0) {
      throw new Error("No se generaron abonos. openItems count: " + openItems.length + " para el tercero: " + third_party_id);
    }

    for (const ab of abonos) {
      const pagoLine = new Record(txLinesCollection);
      pagoLine.set("tx_id", e.record.id);
      pagoLine.set("account_id", ab.account_id);
      pagoLine.set("third_party_id", third_party_id);
      pagoLine.set("cross_doc_ref", ab.cross_doc_ref);
      
      if (ab.isReceivable) {
          pagoLine.set("debit", 0);
          pagoLine.set("credit", ab.monto);
      } else {
          pagoLine.set("debit", ab.monto);
          pagoLine.set("credit", 0);
      }
      
      pagoLine.set("description", 'Abono aplicado a partida ' + ab.cross_doc_ref);
      $app.save(pagoLine);
      totalAplicado += ab.monto;
    }

    if (totalAplicado > 0 && contrapartida_account_id) {
      const contraLine = new Record(txLinesCollection);
      contraLine.set("tx_id", e.record.id);
      contraLine.set("account_id", contrapartida_account_id);
      contraLine.set("third_party_id", third_party_id);
      
      if (txType === 'RC') {
          contraLine.set("debit", totalAplicado);
          contraLine.set("credit", 0);
      } else {
          contraLine.set("debit", 0);
          contraLine.set("credit", totalAplicado);
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
