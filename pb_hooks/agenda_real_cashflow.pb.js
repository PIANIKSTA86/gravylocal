/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — agenda_real_cashflow.pb.js
 * Endpoint para obtener el flujo real de caja (Recaudos RC y Pagos CE contabilizados en cuentas 11% disponible)
 * para alimentar el Rolling Cashflow de la Agenda de Pagos.
 */

routerAdd("GET", "/api/gravy/agenda/real-cashflow", (c) => {
  let authRecord = null;
  try { authRecord = c.auth; } catch (_) {}
  if (!authRecord && typeof $apis !== "undefined") {
    try { authRecord = $apis.requestInfo(c).authRecord; } catch (_) {}
  }
  if (!authRecord) {
    try { authRecord = c.get("authRecord"); } catch (_) {}
  }
  if (!authRecord) {
    try {
      const authHeader = String(c.request().header.get("Authorization") || "").trim();
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (token) {
          try { authRecord = $app.findAuthRecordByToken(token, "users"); } catch (_) {}
          if (!authRecord) {
            try { authRecord = $app.findAuthRecordByToken(token, "_superusers"); } catch (_) {}
          }
        }
      }
    } catch (_) {}
  }

  if (!authRecord) {
    return c.json(401, { error: "No autorizado" });
  }

  const queryParams = c.requestInfo().query || {};
  const startDate = String(queryParams.startDate || "").trim();
  const endDate = String(queryParams.endDate || "").trim();
  const branchId = String(queryParams.branch_id || queryParams.branch || "").trim();

  if (!startDate || !endDate) {
    return c.json(400, { error: "Parámetros startDate y endDate son requeridos (YYYY-MM-DD)" });
  }

  try {
    let sql = `
      SELECT 
        t.id,
        t.number,
        SUBSTR(t.date, 1, 10) as date,
        CASE 
          WHEN (tt.code LIKE 'RC%' OR t.number LIKE 'RC%') THEN 'RC' 
          ELSE 'CE' 
        END as type,
        COALESCE(tp.name, 'Tercero') as third_name,
        COALESCE(t.description, '') as description,
        ROUND(SUM(CASE WHEN a.code LIKE '11%' THEN (CASE WHEN tt.code LIKE 'RC%' OR t.number LIKE 'RC%' THEN l.debit ELSE l.credit END) ELSE 0 END), 2) as amount
      FROM tx_lines l
      INNER JOIN transactions t ON t.id = l.tx_id
      LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
      LEFT JOIN third_parties tp ON tp.id = t.third_party_id
      INNER JOIN accounts a ON a.id = l.account_id
      WHERE t.status = 'active'
        AND t.date >= {:startDate} AND t.date <= {:endDate}
        AND (
          tt.code LIKE 'RC%' OR tt.code LIKE 'CE%' OR 
          t.number LIKE 'RC%' OR t.number LIKE 'CE%' OR
          t.number LIKE 'CG%' OR t.number LIKE 'EF%'
        )
    `;

    const binds = {
      startDate: startDate,
      endDate: endDate + " 23:59:59"
    };

    if (branchId && branchId !== "TODAS" && branchId !== "ALL") {
      sql += " AND COALESCE(l.branch_id, t.branch_id) = {:branchId}";
      binds.branchId = branchId;
    }

    sql += " GROUP BY t.id HAVING amount > 0 ORDER BY t.date ASC";

    const query = $app.db().newQuery(sql);
    query.bind(binds);

    const rows = arrayOf(new DynamicModel({
      id: "",
      number: "",
      date: "",
      type: "",
      third_name: "",
      description: "",
      amount: -0
    }));
    query.all(rows);

    let totalRealCxc = 0;
    let totalRealCxp = 0;
    const dailyRealCxc = {};
    const dailyRealCxp = {};
    const transactions = [];

    for (const r of rows) {
      const amt = Number(r.amount || 0);
      const d = String(r.date).slice(0, 10);
      const isRC = r.type === 'RC';

      if (isRC) {
        totalRealCxc += amt;
        dailyRealCxc[d] = (dailyRealCxc[d] || 0) + amt;
      } else {
        totalRealCxp += amt;
        dailyRealCxp[d] = (dailyRealCxp[d] || 0) + amt;
      }

      transactions.push({
        id: r.id,
        number: r.number,
        date: d,
        type: isRC ? 'RC' : 'CE',
        third_name: r.third_name,
        description: r.description,
        amount: amt
      });
    }

    return c.json(200, {
      transactions: transactions,
      dailyRealCxc: dailyRealCxc,
      dailyRealCxp: dailyRealCxp,
      totals: {
        totalRealCxc: totalRealCxc,
        totalRealCxp: totalRealCxp,
        netReal: totalRealCxc - totalRealCxp
      }
    });

  } catch (err) {
    console.error("[AGENDA-REAL-CASHFLOW] Error: " + err);
    return c.json(500, { error: "Error consultando flujo real: " + err });
  }
});
