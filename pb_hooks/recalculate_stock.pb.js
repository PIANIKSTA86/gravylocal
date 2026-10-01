/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — recalculate_stock.pb.js
 * Hook de PocketBase para recalcular todas las existencias y costos promedio.
 * Disponible para administradores (ADMIN y SUPERADMIN).
 */

routerAdd("POST", "/api/gravy/recalculate-stock", (e) => {
  // 1. Verificar autenticación
  const authRecord = e.auth;
  if (!authRecord) {
    return e.json(401, { message: "No autenticado en el servidor" });
  }

  // 2. Verificar rol (admin o superadmin)
  const role = String(authRecord.getString("role") || "").toLowerCase().trim();
  if (role !== "superadmin" && role !== "admin") {
    return e.json(403, { message: "No tienes permisos para ejecutar esta acción (requiere ADMIN o SUPERADMIN)" });
  }

  try {
    $app.runInTransaction((txApp) => {
      console.log("[GRAVY-STOCK-RECALC] Iniciando recalculación de existencias y costos...");

      // 1. Obtener todos los registros de inventory_stock actuales
      let stocks = [];
      try {
        stocks = txApp.findRecordsByFilter("inventory_stock", "1=1", "", 150000);
      } catch (err) {
        console.warn("[Recalculate Stock] Error al obtener stocks: " + err.message);
      }

      // 2. Resetear todos los stocks actuales a 0 qty_on_hand y 0 avg_cost en memoria y DB
      const stockMap = {};
      for (let i = 0; i < stocks.length; i++) {
        const st = stocks[i];
        st.set("qty_on_hand", 0);
        st.set("avg_cost", 0);
        txApp.save(st);
        
        const key = st.getString("product_id") + "_" + st.getString("warehouse_id");
        stockMap[key] = st;
      }

      // 3. Obtener todos los movimientos de inventario con status = 'applied'
      let movements = [];
      try {
        movements = txApp.findRecordsByFilter("inventory_movements", "status = 'applied'", "+date, +id", 150000);
      } catch (err) {
        console.warn("[Recalculate Stock] Error al obtener movimientos: " + err.message);
      }

      // Ordenamiento cronológico estricto: fecha -> prioridad de tipo -> número -> id
      // Prioridad: 1) ENTRADA/AJUSTE_POSITIVO (entra mercancía primero), 2) TRASLADO, 3) SALIDA/AJUSTE_NEGATIVO (salidas después)
      const typePriority = {
        "ENTRADA": 1,
        "AJUSTE_POSITIVO": 1,
        "TRASLADO": 2,
        "SALIDA": 3,
        "AJUSTE_NEGATIVO": 3
      };
      movements.sort((a, b) => {
        const dateA = a.getString("date") || "";
        const dateB = b.getString("date") || "";
        if (dateA !== dateB) return dateA.localeCompare(dateB);

        const pA = typePriority[a.getString("mov_type")] || 4;
        const pB = typePriority[b.getString("mov_type")] || 4;
        if (pA !== pB) return pA - pB;

        const numA = a.getString("number") || "";
        const numB = b.getString("number") || "";
        if (numA !== numB) return numA.localeCompare(numB);

        return a.id.localeCompare(b.id);
      });

      // 0. Obtener configuración de inventarios (costing_scope: GLOBAL vs POR_BODEGA)
      let costingScope = "GLOBAL";
      try {
        const invSetting = txApp.findFirstRecordByFilter("settings", "key = 'inventory_settings_v1'");
        if (invSetting) {
          const parsed = JSON.parse(invSetting.getString("value") || "{}");
          if (parsed.costing_scope) costingScope = parsed.costing_scope;
        }
      } catch (_) {}
      console.log("[GRAVY-STOCK-RECALC] Enfoque de costeo configurado: " + costingScope);

      const stockCollection = txApp.findCollectionByNameOrId("inventory_stock");
      const globalStock = {}; // prodId -> { qty: 0, avg_cost: 0 }

      // Helper interno para ajustar stock en la transacción
      function adjustStockValues(prodId, whId, qtyDelta, unitCost, dateStr, isTransfer) {
        if (!prodId || !whId) return 0;
        const key = prodId + "_" + whId;
        let st = stockMap[key];
        
        if (!st) {
          try {
            st = new Record(stockCollection, {
              product_id: prodId,
              warehouse_id: whId,
              qty_on_hand: 0,
              avg_cost: 0,
              last_mov_date: dateStr
            });
            stockMap[key] = st;
          } catch (e) {
            console.error("[Recalculate Stock] Error creando Record de stock: " + e.message);
            return 0;
          }
        }

        const currentQty = st.getFloat("qty_on_hand") || 0;
        const currentCost = st.getFloat("avg_cost") || 0;

        let newQty = currentQty + qtyDelta;
        let newCost = currentCost;

        if (costingScope === "GLOBAL") {
          const g = globalStock[prodId] || { qty: 0, avg_cost: 0 };
          const priorGQty = g.qty;
          const priorGCost = g.avg_cost;

          if (!isTransfer) {
            if (qtyDelta > 0 && unitCost !== null && unitCost !== undefined && unitCost > 0) {
              const newGQty = priorGQty + qtyDelta;
              if (newGQty > 0) {
                newCost = ((Math.max(0, priorGQty) * priorGCost) + (qtyDelta * unitCost)) / newGQty;
              } else {
                newCost = unitCost;
              }
              newCost = Math.round(newCost * 100) / 100;
              g.qty = newGQty;
              g.avg_cost = newCost;
            } else if (qtyDelta < 0) {
              g.qty += qtyDelta;
              newCost = g.avg_cost;
            }
            globalStock[prodId] = g;
          } else {
            newCost = g.avg_cost;
          }
        } else {
          // Por Bodega individual
          if (qtyDelta > 0 && unitCost !== null && unitCost !== undefined && unitCost > 0) {
            if (newQty > 0) {
              newCost = ((currentQty * currentCost) + (qtyDelta * unitCost)) / newQty;
            } else {
              newCost = unitCost;
            }
            newCost = Math.round(newCost * 100) / 100;
          }
        }

        st.set("qty_on_hand", newQty);
        st.set("avg_cost", newCost);
        st.set("last_mov_date", dateStr);
        txApp.save(st);

        return newCost;
      }

      // 4. Procesar todos los movimientos
      for (let i = 0; i < movements.length; i++) {
        const mov = movements[i];
        const movId = mov.id;
        const movType = mov.getString("mov_type");
        const whId = mov.getString("warehouse_id");
        const destWhId = mov.getString("dest_warehouse_id");
        const movDate = mov.getString("date") || new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);

        let lines = [];
        try {
          lines = txApp.findRecordsByFilter("inventory_movement_lines", "movement_id = '" + movId + "'", "+line_order, +id", 5000);
        } catch (err) {
          console.warn("[Recalculate Stock] Error al obtener líneas de mov " + movId + ": " + err.message);
        }

        for (let j = 0; j < lines.length; j++) {
          const line = lines[j];
          const prodId = line.getString("product_id");
          const qty = line.getFloat("qty") || 0;
          const cost = line.getFloat("unit_cost") || 0;

          if (movType === "ENTRADA" || movType === "AJUSTE_POSITIVO") {
            adjustStockValues(prodId, whId, qty, cost, movDate, false);
          } else if (movType === "SALIDA" || movType === "AJUSTE_NEGATIVO") {
            let exitCost = 0;
            if (costingScope === "GLOBAL") {
              const g = globalStock[prodId];
              exitCost = g && g.avg_cost > 0 ? g.avg_cost : cost;
            } else {
              const keyOrigin = prodId + "_" + whId;
              const originStockRec = stockMap[keyOrigin];
              exitCost = originStockRec ? (originStockRec.getFloat("avg_cost") || 0) : cost;
            }
            if (exitCost > 0 && Math.abs(cost - exitCost) > 0.009) {
              line.set("unit_cost", exitCost);
              txApp.save(line);
            }
            adjustStockValues(prodId, whId, -qty, null, movDate, false);
          } else if (movType === "TRASLADO") {
            if (costingScope === "GLOBAL") {
              // En costeo global corporativo, el traslado se realiza al costo global vigente
              const g = globalStock[prodId] || { qty: 0, avg_cost: 0 };
              const transferCost = g.avg_cost > 0 ? g.avg_cost : (cost > 0 ? cost : 0);

              if (transferCost > 0 && Math.abs(cost - transferCost) > 0.009) {
                line.set("unit_cost", transferCost);
                txApp.save(line);
              }

              adjustStockValues(prodId, whId, -qty, null, movDate, true);
              if (destWhId) {
                adjustStockValues(prodId, destWhId, qty, null, movDate, true);
              }
            } else {
              // 1. Obtener el costo promedio en la bodega origen antes del traslado
              const keyOrigin = prodId + "_" + whId;
              const originStockRec = stockMap[keyOrigin];
              const sourceAvgCost = originStockRec ? (originStockRec.getFloat("avg_cost") || 0) : 0;
              const transferCost = sourceAvgCost > 0 ? sourceAvgCost : (cost > 0 ? cost : 0);

              if (transferCost > 0 && Math.abs(cost - transferCost) > 0.009) {
                line.set("unit_cost", transferCost);
                txApp.save(line);
              }

              // 2. Disminuir stock en bodega origen
              adjustStockValues(prodId, whId, -qty, null, movDate, true);

              // 3. Aumentar stock en bodega destino
              if (destWhId) {
                adjustStockValues(prodId, destWhId, qty, transferCost, movDate, false);
              }
            }
          }
        }
      }

      // 5. Actualizar cost_price y unificar costos según el enfoque de costeo
      if (costingScope === "GLOBAL") {
        for (const k in stockMap) {
          const st = stockMap[k];
          const pId = st.getString("product_id");
          const g = globalStock[pId];
          if (g && g.avg_cost > 0) {
            st.set("avg_cost", g.avg_cost);
            txApp.save(st);
          }
        }
        for (const pId in globalStock) {
          const g = globalStock[pId];
          if (g && g.avg_cost > 0) {
            try {
              const prodRec = txApp.findRecordById("products", pId);
              if (prodRec) {
                prodRec.set("cost_price", g.avg_cost);
                txApp.save(prodRec);
              }
            } catch (pErr) {}
          }
        }
      } else {
        const latestProdCosts = {};
        for (const k in stockMap) {
          const st = stockMap[k];
          const pId = st.getString("product_id");
          const avgC = st.getFloat("avg_cost") || 0;
          const qOnHand = st.getFloat("qty_on_hand") || 0;
          if (avgC > 0 && qOnHand > 0) {
            latestProdCosts[pId] = avgC;
          } else if (avgC > 0 && !latestProdCosts[pId]) {
            latestProdCosts[pId] = avgC;
          }
        }
        for (const pId in latestProdCosts) {
          try {
            const prodRec = txApp.findRecordById("products", pId);
            if (prodRec) {
              prodRec.set("cost_price", latestProdCosts[pId]);
              txApp.save(prodRec);
            }
          } catch (pErr) {}
        }
      }

      console.log("[GRAVY-STOCK-RECALC] Completado exitosamente.");
    });

    return e.json(200, { success: true, message: "Existencias y costo promedio recalculados correctamente." });
  } catch (err) {
    console.error("[Recalculate Stock Hook Error]", err);
    return e.json(500, { message: "Error al recalcular stock: " + err.message });
  }
});
