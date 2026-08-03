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

      // 3. Obtener todos los movimientos de inventario con status = 'applied' ordenados cronológicamente
      let movements = [];
      try {
        movements = txApp.findRecordsByFilter("inventory_movements", "status = 'applied'", "+date, +id", 150000);
      } catch (err) {
        console.warn("[Recalculate Stock] Error al obtener movimientos: " + err.message);
      }

      const stockCollection = txApp.findCollectionByNameOrId("inventory_stock");

      // Helper interno para ajustar stock en la transacción
      function adjustStockValues(prodId, whId, qtyDelta, unitCost, dateStr) {
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

        // Si es una entrada de stock y tenemos un costo válido, recalculamos el costo promedio
        if (qtyDelta > 0 && unitCost !== null && unitCost !== undefined) {
          if (newQty > 0) {
            newCost = ((currentQty * currentCost) + (qtyDelta * unitCost)) / newQty;
          } else {
            newCost = unitCost;
          }
          newCost = Math.round(newCost * 100) / 100;
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
            adjustStockValues(prodId, whId, qty, cost, movDate);
          } else if (movType === "SALIDA" || movType === "AJUSTE_NEGATIVO") {
            adjustStockValues(prodId, whId, -qty, null, movDate);
          } else if (movType === "TRASLADO") {
            // 1. Obtener el costo promedio en la bodega origen antes del traslado
            const keyOrigin = prodId + "_" + whId;
            const originStockRec = stockMap[keyOrigin];
            const sourceAvgCost = originStockRec ? (originStockRec.getFloat("avg_cost") || 0) : 0;

            // 2. Disminuir stock en bodega origen
            adjustStockValues(prodId, whId, -qty, null, movDate);

            // 3. Aumentar stock en bodega destino heredando el costo promedio de la origen
            if (destWhId) {
              adjustStockValues(prodId, destWhId, qty, sourceAvgCost, movDate);
            }
          }
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
