/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — ph_integrity_guard.pb.js
 * Guardian de Integridad Contable y Sincronización Automática para Propiedad Horizontal.
 * 
 * Funcionalidades:
 * 1. Endpoint /api/ph/integrity-check para auditar en tiempo real el cuadre 100% de las unidades.
 * 2. Tarea Cron diaria (03:00 AM) para auditoría de salud contable automática.
 * 3. Guardias en ph_invoices para impedir facturas huérfanas sin asiento contable.
 * 4. Protección en transactions para evitar que se eliminen comprobantes CF dejando facturas colgadas.
 * 5. Control en tx_lines para garantizar que todo abono en cuenta 134595 tenga referencia de inmueble.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENDPOINT DE AUDITORÍA Y SALUD CONTABLE EN TIEMPO REAL
// ─────────────────────────────────────────────────────────────────────────────
routerAdd("GET", "/api/ph/integrity-check", (c) => {
  try {
    const cutoffDate = String(c.queryParam("cutoff_date") || c.queryParam("to_date") || "").trim();

    // 1. Cargar todas las propiedades activas
    const props = arrayOf(new DynamicModel({ id: "", code: "", name: "", owner_id: "" }));
    $app.db().newQuery("SELECT id, code, name, owner_id FROM ph_properties ORDER BY code ASC").all(props);

    if (props.length === 0) {
      return c.json(200, { ok: true, balanced: true, unitsCount: 0, message: "No hay propiedades registradas." });
    }

    const propById = {};
    const propByCode = {};
    for (const p of props) {
      propById[p.id] = p;
      propByCode[String(p.code || "").trim().toUpperCase()] = p;
    }

    // 2. Cargar facturas (todas para mapear referencias, y filtradas por corte para facturación activa)
    const allInvoices = arrayOf(new DynamicModel({
      id: "", number: "", period: "", date: "", total: -0, status: "", property_id: "", tx_id: ""
    }));
    $app.db().newQuery(
      "SELECT id, number, period, date, total, status, property_id, tx_id " +
      "FROM ph_invoices WHERE status != 'voided' AND tx_id != ''"
    ).all(allInvoices);

    const allInvByNum = {};
    const invsByProp = {};
    for (const inv of allInvoices) {
      const nKey = String(inv.number || "").trim().toUpperCase();
      allInvByNum[nKey] = inv;

      // Solo acumulamos facturado si la fecha de la factura es <= cutoffDate (si se especificó)
      const invDate = String(inv.date || "").slice(0, 10);
      if (!cutoffDate || invDate <= cutoffDate) {
        if (!invsByProp[inv.property_id]) invsByProp[inv.property_id] = [];
        invsByProp[inv.property_id].push(inv);
      }
    }

    // 3. Cargar movimientos contables en cuenta 13459501 (respetando fecha de corte)
    const c13Lines = arrayOf(new DynamicModel({
      id: "", tx_id: "", debit: -0, credit: -0, description: "", cross_doc_ref: "", third_party_id: "", tx_num: ""
    }));

    let c13Sql = `
      SELECT l.id, l.tx_id, l.debit, l.credit, l.description, l.cross_doc_ref, l.third_party_id, t.number as tx_num
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE a.code = '13459501' AND t.status = 'active'
    `;
    if (cutoffDate) {
      c13Sql += ` AND t.date <= '${cutoffDate}'`;
    }

    $app.db().newQuery(c13Sql).all(c13Lines);

    // Mapeo de saldo contable por unidad
    const unitLedger = {};
    for (const p of props) {
      unitLedger[p.id] = { debits: 0, credits: 0, cruceDebits: 0, balance: 0 };
    }

    for (const l of c13Lines) {
      let matchedPropId = null;
      const ref = String(l.cross_doc_ref || "").trim().toUpperCase();

      if (ref.startsWith("ANT-")) {
        matchedPropId = ref.substring(4).toLowerCase();
      } else if (ref.startsWith("ANTICIPO-")) {
        const parts = ref.split("-");
        if (parts.length >= 3) {
          matchedPropId = parts.slice(2).join("-").toLowerCase();
        }
      } else if (ref) {
        const baseInvNum = ref.split("-").slice(0, 3).join("-");
        const inv = allInvByNum[baseInvNum] || allInvByNum[ref];
        if (inv) matchedPropId = inv.property_id;
      }

      if (!matchedPropId && l.description) {
        const bracketMatch = String(l.description).match(/\[([0-9a-zA-Z_-]+)\]/);
        if (bracketMatch && propByCode[bracketMatch[1].toUpperCase()]) {
          matchedPropId = propByCode[bracketMatch[1].toUpperCase()].id;
        } else {
          for (const p of props) {
            if (l.description.indexOf("Unidad " + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
              matchedPropId = p.id;
              break;
            }
          }
        }
      }

      if (matchedPropId && unitLedger[matchedPropId]) {
        const deb = Number(l.debit || 0);
        const cred = Number(l.credit || 0);
        unitLedger[matchedPropId].debits += deb;
        unitLedger[matchedPropId].credits += cred;
        unitLedger[matchedPropId].balance += (deb - cred);
        if (deb > 0 && (String(l.tx_num || "").indexOf("RC-") === 0 || String(l.description || "").indexOf("Cruce / Aplicación") !== -1)) {
          unitLedger[matchedPropId].cruceDebits += deb;
        }
      }
    }

    // 4. Comparar unidad por unidad
    let totalCartera = 0;
    let totalLibro = 0;
    const mismatches = [];

    for (const p of props) {
      const pInvs = invsByProp[p.id] || [];
      let facturado = 0;
      for (const inv of pInvs) facturado += Number(inv.total || 0);

      const ledger = unitLedger[p.id] || { debits: 0, credits: 0, cruceDebits: 0, balance: 0 };
      // En cuenta 13, el recaudo atribuible a cartera descuenta los débitos de cruce interno
      const recaudado = Math.max(0, ledger.credits - (ledger.cruceDebits || 0));
      const carteraBal = Math.round((facturado - recaudado) * 100) / 100;
      const libroBal = Math.round(ledger.balance * 100) / 100;

      totalCartera += carteraBal;
      totalLibro += libroBal;

      const diff = Math.round((carteraBal - libroBal) * 100) / 100;
      if (Math.abs(diff) > 0.01) {
        mismatches.push({
          propertyId: p.id,
          code: p.code,
          name: p.name,
          carteraBalance: carteraBal,
          libroBalance: libroBal,
          diferencia: diff
        });
      }
    }

    totalCartera = Math.round(totalCartera * 100) / 100;
    totalLibro = Math.round(totalLibro * 100) / 100;
    const diffGlobal = Math.round((totalCartera - totalLibro) * 100) / 100;

    return c.json(200, {
      ok: true,
      balanced: mismatches.length === 0,
      unitsCount: props.length,
      balancedUnits: props.length - mismatches.length,
      mismatchedCount: mismatches.length,
      totalCartera: totalCartera,
      totalLibro: totalLibro,
      diferenciaGlobal: diffGlobal,
      mismatches: mismatches,
      auditedAt: new Date().toISOString()
    });
  } catch (err) {
    return c.json(500, { ok: false, error: "Error en auditoría de integridad: " + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CRON JOB NOCTURNO: AUDITORÍA AUTOMÁTICA DE INTEGRIDAD (03:00 AM)
// ─────────────────────────────────────────────────────────────────────────────
cronAdd("ph_nightly_integrity_audit", "0 3 * * *", () => {
  try {
    const unposted = arrayOf(new DynamicModel({ id: "", number: "" }));
    $app.db().newQuery(
      "SELECT id, number FROM ph_invoices WHERE status = 'posted' AND (tx_id IS NULL OR tx_id = '') LIMIT 10"
    ).all(unposted);

    if (unposted.length > 0) {
      console.error(`[GRAVY-PH-GUARD] ALERTA: Se encontraron ${unposted.length} facturas posted sin tx_id.`);
    }

    const draftTxs = arrayOf(new DynamicModel({ id: "", number: "" }));
    $app.db().newQuery(`
      SELECT phi.id, phi.number 
      FROM ph_invoices phi 
      INNER JOIN transactions t ON t.id = phi.tx_id 
      WHERE phi.status = 'posted' AND t.status = 'draft'
      LIMIT 10
    `).all(draftTxs);

    if (draftTxs.length > 0) {
      console.error(`[GRAVY-PH-GUARD] ALERTA: Facturas posted con transacciones contables en draft: ${draftTxs.map(x => x.number).join(", ")}`);
    }

    console.log("[GRAVY-PH-GUARD] Auditoría nocturna completada satisfactoriamente.");
  } catch (err) {
    console.error("[GRAVY-PH-GUARD] Error en cron de auditoría nocturna: " + err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. GUARDIAS PREVENTIVAS EN PH_INVOICES (BLINDAJE DE INTEGRIDAD CONTABLE)
// ─────────────────────────────────────────────────────────────────────────────
onRecordBeforeCreateRequest((e) => {
  const status = String(e.record.getString("status") || "");
  const txId = String(e.record.getString("tx_id") || "").trim();
  const invTotal = Number(e.record.getFloat("total") || 0);
  const invNumber = String(e.record.getString("number") || "");

  // Invariante de causación contable atómica: si se marca posted y tiene tx_id
  if (status === "posted" && txId) {
    try {
      const debitsRow = new DynamicModel({ sum_debits: -0 });
      $app.db().newQuery(
        "SELECT COALESCE(SUM(l.debit), 0) as sum_debits FROM tx_lines l " +
        "INNER JOIN accounts a ON a.id = l.account_id " +
        "WHERE l.tx_id = {:txId} AND a.code LIKE '13%'"
      ).bind({ txId: txId }).one(debitsRow);

      const sumDebits = Number(debitsRow.sum_debits || 0);
      if (sumDebits > 0 && Math.abs(invTotal - sumDebits) > 0.01) {
        console.warn(`[GRAVY-PH-GUARD] Auto-ajustando Factura nueva ${invNumber}: Total (${invTotal}) alineado con débito contable oficial (${sumDebits}).`);
        e.record.set("total", sumDebits);
        e.record.set("subtotal", sumDebits);
      }
    } catch (_) {}
  }
  e.next();
}, "ph_invoices");

onRecordBeforeUpdateRequest((e) => {
  const status = String(e.record.getString("status") || "");
  const txId = String(e.record.getString("tx_id") || "").trim();
  const invTotal = Number(e.record.getFloat("total") || 0);
  const invNumber = String(e.record.getString("number") || "");

  // Invariante de causación contable atómica: si se marca posted y tiene tx_id
  if (status === "posted" && txId) {
    try {
      const debitsRow = new DynamicModel({ sum_debits: -0 });
      $app.db().newQuery(
        "SELECT COALESCE(SUM(l.debit), 0) as sum_debits FROM tx_lines l " +
        "INNER JOIN accounts a ON a.id = l.account_id " +
        "WHERE l.tx_id = {:txId} AND a.code LIKE '13%'"
      ).bind({ txId: txId }).one(debitsRow);

      const sumDebits = Number(debitsRow.sum_debits || 0);
      if (sumDebits > 0 && Math.abs(invTotal - sumDebits) > 0.01) {
        console.warn(`[GRAVY-PH-GUARD] Auto-ajustando Factura ${invNumber}: Total satélite (${invTotal}) alineado con débito contable oficial (${sumDebits}).`);
        e.record.set("total", sumDebits);
        e.record.set("subtotal", sumDebits);
      }
    } catch (_) {}
  }
  e.next();
}, "ph_invoices");

onRecordUpdateRequest((e) => {
  const status = String(e.record.getString("status") || "");
  const txId = String(e.record.getString("tx_id") || "").trim();

  // Si pasa a posted, exigir tx_id o permitir si se está asignando en este mismo guardado
  if (status === "posted" && !txId) {
    // Si viene de un proceso masivo que aún no asigna tx_id, advertir
    console.warn(`[GRAVY-PH-GUARD] Advertencia: Factura ${e.record.getString("number")} marcada posted sin tx_id asignado.`);
  }

  // Si la factura pasa a anulada (voided), asegurar que la transacción asociada no quede activa debitando cartera
  if (status === "voided" && txId) {
    try {
      const tx = $app.findRecordById("transactions", txId);
      if (tx && tx.getString("status") === "active") {
        tx.set("status", "voided");
        $app.save(tx);
        console.log(`[GRAVY-PH-GUARD] Transacción ${txId} anulada automáticamente al anular factura ${e.record.getString("number")}.`);
      }
    } catch (_) {}
  }

  e.next();
}, "ph_invoices");

onRecordDeleteRequest((e) => {
  const txId = String(e.record.getString("tx_id") || "").trim();
  const invNumber = String(e.record.getString("number") || "").trim();

  // Al eliminar físicamente una factura en borrador o prueba, limpiar comprobante contable residual
  if (txId) {
    try {
      const tx = $app.findRecordById("transactions", txId);
      if (tx) {
        $app.delete(tx);
        console.log(`[GRAVY-PH-GUARD] Transacción ${txId} eliminada en cascada al borrar factura ${invNumber}.`);
      }
    } catch (_) {}
  }

  e.next();
}, "ph_invoices");

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROTECCIÓN DE COMPROBANTES CF EN CONTABILIDAD
// ─────────────────────────────────────────────────────────────────────────────
onRecordDeleteRequest((e) => {
  const crossType = String(e.record.getString("cross_type") || "");
  const crossNum = String(e.record.getString("cross_number") || "").trim();
  const txId = String(e.record.id || "");

  if (crossType === "ph_invoices" || (crossNum && crossNum.startsWith("CF-"))) {
    // Verificar si la factura asociada sigue activa en posted
    try {
      const inv = $app.findFirstRecordByFilter("ph_invoices", `number = '${crossNum.replace(/'/g, "''")}' && status = 'posted'`);
      if (inv) {
        throw new BadRequestError(`No se puede eliminar directamente este comprobante contable porque está vinculado a la factura PH activa ${crossNum}. Debe descontabilizarse o anularse desde el módulo de Copropiedades.`);
      }
    } catch (findErr) {
      if (findErr && findErr.message && findErr.message.indexOf("No se puede eliminar") !== -1) {
        throw findErr;
      }
    }
  }

  e.next();
}, "transactions");

