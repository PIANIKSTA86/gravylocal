/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — tesoreria.pb.js
 * Fase 9: Tesorería (Recaudos, Pagos, Motor de aplicación de abonos)
 */

function getOpenItems(thirdPartyId) {
  // En PocketBase v0.26.8, usamos findRecordsByExpr para buscar líneas de ese tercero
  // con saldo abierto (débito > crédito para CxC, o crédito > débito para CxP)
  const records = $app.findRecordsByExpr("tx_lines", 
    $dbx.exp("third_party_id = {:thirdPartyId} AND ((debit - credit) > 0 OR (credit - debit) > 0)", { thirdPartyId: thirdPartyId })
  );
  return records;
}

function applyPaymentAuto(openItems, amount, rules) {
  let saldo = amount;
  const abonos = [];
  let items = [...openItems];
  
  for (const item of items) {
    if (saldo <= 0) break;
    const debit = Number(item.get("debit") || 0);
    const credit = Number(item.get("credit") || 0);
    const isReceivable = debit > credit; 
    const pendiente = Math.abs(debit - credit);
    const abono = Math.min(saldo, pendiente);
    
    if (abono > 0) {
      abonos.push({ 
        tx_line_id: item.id, 
        monto: abono,
        isReceivable,
        account_id: item.get("account_id")
      });
      saldo -= abono;
    }
  }
  return abonos;
}

function applyPaymentManual(openItems, distribucion) {
  const abonos = [];
  for (const d of distribucion) {
    // Note: JS array methods on Go slices can be tricky, let's use standard loop
    let item = null;
    for (const i of openItems) {
      if (i.id === d.tx_line_id) { item = i; break; }
    }
    if (!item) continue;

    const debit = Number(item.get("debit") || 0);
    const credit = Number(item.get("credit") || 0);
    const isReceivable = debit > credit; 
    const pendiente = Math.abs(debit - credit);
    const abono = Math.min(Number(d.monto), pendiente);
    
    if (abono > 0) {
      abonos.push({ 
        tx_line_id: item.id, 
        monto: abono,
        isReceivable,
        account_id: item.get("account_id")
      });
    }
  }
  return abonos;
}

function registrarPago(e, txType, modo, params) {
  const third_party_id = params.third_party_id;
  const amount = Number(params.amount);
  const openItems = getOpenItems(third_party_id);
  
  let abonos = [];
  if (modo === 'manual') {
    abonos = applyPaymentManual(openItems, params.distribucion || []);
  } else {
    abonos = applyPaymentAuto(openItems, amount, params.reglas || {});
  }

  const txLinesCollection = $app.findCollectionByNameOrId('tx_lines');
  
  for (const ab of abonos) {
    const pagoLine = new Record(txLinesCollection);
    pagoLine.set("tx_id", e.record.id);
    pagoLine.set("account_id", ab.account_id);
    pagoLine.set("third_party_id", third_party_id);
    
    if (ab.isReceivable) {
        pagoLine.set("debit", 0);
        pagoLine.set("credit", ab.monto);
    } else {
        pagoLine.set("debit", ab.monto);
        pagoLine.set("credit", 0);
    }
    
    pagoLine.set("description", 'Abono aplicado a ' + ab.tx_line_id);
    $app.save(pagoLine);
  }
}

onRecordCreateRequest((e) => {
  const rec = e.record;
  if (!rec) return e.next();
  
  const colName = String(rec.collection().name);
  if (colName !== 'transactions') return e.next();
  
  const txTypeId = rec.get('tx_type_id');
  if (!txTypeId) return e.next();
  
  const txTypeRec = $app.findRecordById("transaction_types", txTypeId);
  const txType = String(txTypeRec.get("code")).toUpperCase();
  
  if (txType !== 'RC' && txType !== 'EG') return e.next();
  
  const modo = String(rec.get('teso_mode') || 'auto');
  let paramsStr = rec.get('teso_params');
  if (!paramsStr) return e.next(); 

  let params = {};
  try { params = JSON.parse(String(paramsStr)); } catch(err) { return e.next(); }
  
  registrarPago(e, txType, modo, params);
  
  e.next();
}, 'transactions');
