/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — seguimiento_api.pb.js
 * API transversal de Seguimiento Comercial y Logístico:
 * Permite auditar en tiempo real la vinculación de documentos (Cotizaciones, Reservas, Pedidos, Despachos, Facturas)
 * y el balance de cantidades por producto en cada etapa del flujo.
 * 
 * NOTA DE ARQUITECTURA GOJA:
 * En PocketBase Goja, los callbacks registrados mediante routerAdd se ejecutan en runtimes
 * aislados del pool sin acceso al ámbito léxico externo del archivo. Por ello, todas las
 * funciones auxiliares de consulta y agregación están encapsuladas dentro del cuerpo del handler.
 */

routerAdd("GET", "/api/gravy/seguimiento", (e) => {
  // ──────────────────────────────────────────────────────────
  // 1. HELPERS DE BASE DE DATOS Y NORMALIZACIÓN
  // ──────────────────────────────────────────────────────────
  function safeFind(colName, id) {
    if (!id) return null;
    try {
      return $app.findRecordById(colName, String(id));
    } catch (_) {
      return null;
    }
  }

  function safeFilter(colName, filterExpr, limit, sort) {
    try {
      const s = typeof sort === "string" ? sort : "";
      const lim = typeof limit === "number" ? limit : 50;
      return $app.findRecordsByFilter(colName, filterExpr, s, lim, 0);
    } catch (err) {
      console.log("[GRAVY-SEGUIMIENTO] safeFilter error (" + colName + "): " + err);
      return [];
    }
  }

  function resolveCustomerName(cId) {
    if (!cId) return "Cliente General";
    let targetId = cId;
    if (Array.isArray(cId) && cId.length > 0) {
      targetId = cId[0];
    }
    try {
      const cust = $app.findRecordById("third_parties", String(targetId));
      return cust.get("name") || cust.get("company_name") || "Cliente";
    } catch (_) {
      return "Cliente";
    }
  }

  function aggregateLines(balanceMap, collectionName, filterExpr, qtyFieldName, stageKey, fallbackQtyField) {
    try {
      const lines = safeFilter(collectionName, filterExpr, 100);
      lines.forEach(line => {
        let pId = line.get("product_id");
        if (Array.isArray(pId) && pId.length > 0) pId = pId[0];
        if (!pId) return;

        if (!balanceMap[pId]) {
          let pName = "Producto";
          let pCode = "—";
          try {
            const prod = $app.findRecordById("products", String(pId));
            pName = prod.get("name") || "Producto";
            pCode = prod.get("code") || prod.get("barcode") || "—";
          } catch (_) {}

          balanceMap[pId] = {
            id: pId,
            name: pName,
            code: pCode,
            quoted: 0,
            reserved: 0,
            ordered: 0,
            delivered: 0,
            invoiced: 0
          };
        }

        let val = Number(line.get(qtyFieldName) || 0);
        if (val === 0 && fallbackQtyField) {
          val = Number(line.get(fallbackQtyField) || 0);
        }
        balanceMap[pId][stageKey] += val;
      });
    } catch (err) {
      console.log("[GRAVY-SEGUIMIENTO] Error agregando líneas de " + collectionName + ": " + err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. CONSTRUCCIÓN DE EXPEDIENTE POR DOCUMENTO
  // ──────────────────────────────────────────────────────────
  function buildDocumentTracking(rawType, docId) {
    let docType = String(rawType || "").toLowerCase();
    if (docType === "quote") docType = "quotation";
    if (docType === "factura") docType = "invoice";
    if (docType === "pedido") docType = "order";
    if (docType === "despacho") docType = "delivery";
    if (docType === "reserva") docType = "reservation";

    const nodes = [];
    const edges = [];
    const productBalanceMap = {};

    let quotationRecord = null;
    let reservationRecord = null;
    let orderRecord = null;
    let deliveryRecords = [];
    let invoiceRecords = [];
    let customerName = "Cliente";

    // Identificar documento raíz
    if (docType === "invoice") {
      let inv = safeFind("invoices", docId);
      if (!inv) throw new Error("Factura no encontrada.");

      // Soporte para Notas Crédito que referencian factura padre
      const parentInvId = inv.get("parent_invoice_id") || inv.get("invoice_id") || inv.get("cross_doc_ref");
      if (parentInvId) {
        try {
          const pInv = safeFind("invoices", String(parentInvId));
          if (pInv) {
            inv = pInv;
            docId = pInv.id;
          }
        } catch (_) {}
      }

      invoiceRecords.push(inv);
      customerName = resolveCustomerName(inv.get("customer_id"));

      const orderRef = inv.get("order_id") || inv.get("sales_order_id") || inv.get("sales_order");
      if (orderRef) {
        orderRecord = safeFind("sales_orders", orderRef);
      }
      const deliveryRef = inv.get("delivery_id") || inv.get("despacho_id");
      if (deliveryRef) {
        const d = safeFind("logistica_deliveries", deliveryRef);
        if (d) deliveryRecords.push(d);
      }
      const quoteRef = inv.get("quotation_id") || inv.get("quote_id");
      if (quoteRef) {
        quotationRecord = safeFind("quotations", quoteRef);
      }
    } else if (docType === "delivery") {
      const del = safeFind("logistica_deliveries", docId);
      if (!del) throw new Error("Despacho no encontrado.");
      deliveryRecords.push(del);
      customerName = resolveCustomerName(del.get("client_id") || del.get("customer_id"));

      const orderRef = del.get("sales_order_id") || del.get("order_id");
      if (orderRef) {
        orderRecord = safeFind("sales_orders", orderRef);
      }
      const invoiceRef = del.get("invoice_id");
      if (invoiceRef) {
        const inv = safeFind("invoices", invoiceRef);
        if (inv) invoiceRecords.push(inv);
      }
    } else if (docType === "order") {
      orderRecord = safeFind("sales_orders", docId);
      if (!orderRecord) throw new Error("Pedido no encontrado.");
      customerName = resolveCustomerName(orderRecord.get("customer_id"));

      const quoteRef = orderRecord.get("quotation_id") || orderRecord.get("quote_id");
      if (quoteRef) {
        quotationRecord = safeFind("quotations", quoteRef);
      }
      const resRef = orderRecord.get("reservation_id") || orderRecord.get("reserva_id");
      if (resRef) {
        reservationRecord = safeFind("sales_reservations", resRef);
      }
    } else if (docType === "reservation") {
      reservationRecord = safeFind("sales_reservations", docId);
      if (!reservationRecord) throw new Error("Reserva no encontrada.");
      customerName = resolveCustomerName(reservationRecord.get("customer_id"));

      const orderRef = reservationRecord.get("sales_order_id") || reservationRecord.get("order_id");
      if (orderRef) {
        orderRecord = safeFind("sales_orders", orderRef);
      }
      const invoiceRef = reservationRecord.get("invoice_id");
      if (invoiceRef) {
        const inv = safeFind("invoices", invoiceRef);
        if (inv) invoiceRecords.push(inv);
      }
    } else if (docType === "quotation") {
      quotationRecord = safeFind("quotations", docId);
      if (!quotationRecord) throw new Error("Cotización no encontrada.");
      customerName = resolveCustomerName(quotationRecord.get("customer_id"));

      const orderRef = quotationRecord.get("sales_order_id") || quotationRecord.get("order_id");
      if (orderRef) {
        orderRecord = safeFind("sales_orders", orderRef);
      }
      const invRef = quotationRecord.get("invoice_id");
      if (invRef) {
        const inv = safeFind("invoices", invRef);
        if (inv) invoiceRecords.push(inv);
      }
    }

    // Si encontramos pedido pero faltan otros enlaces, buscar de forma bidireccional
    if (orderRecord) {
      if (!quotationRecord) {
        const qByOrder = safeFilter("quotations", "sales_order_id = '" + orderRecord.id + "'", 1);
        if (qByOrder.length > 0) quotationRecord = qByOrder[0];
      }
      if (!reservationRecord) {
        const rByOrder = safeFilter("sales_reservations", "sales_order_id = '" + orderRecord.id + "'", 1);
        if (rByOrder.length > 0) reservationRecord = rByOrder[0];
      }
      if (deliveryRecords.length === 0) {
        deliveryRecords = safeFilter("logistica_deliveries", "sales_order_id = '" + orderRecord.id + "'", 10);
      }
      if (invoiceRecords.length === 0) {
        const directInvId = orderRecord.get("invoice_id");
        if (directInvId) {
          const directInv = safeFind("invoices", directInvId);
          if (directInv) invoiceRecords.push(directInv);
        }
      }
      if (invoiceRecords.length === 0) {
        invoiceRecords = safeFilter("invoices", "sales_order_id = '" + orderRecord.id + "'", 10);
      }
    }

    // Si aún no hay factura pero hay despachos con invoice_id
    if (invoiceRecords.length === 0 && deliveryRecords.length > 0) {
      deliveryRecords.forEach(d => {
        const invId = d.get("invoice_id");
        if (invId) {
          const inv = safeFind("invoices", invId);
          if (inv && !invoiceRecords.some(x => x.id === inv.id)) {
            invoiceRecords.push(inv);
          }
        }
      });
    }

    // Si hay facturas, buscar Notas Crédito asociadas
    const allInvoices = [...invoiceRecords];
    invoiceRecords.forEach(inv => {
      const ncList = safeFilter("invoices", "parent_invoice_id = '" + inv.id + "' || cross_doc_ref = '" + inv.id + "'", 5);
      ncList.forEach(nc => {
        if (!allInvoices.some(x => x.id === nc.id)) {
          allInvoices.push(nc);
        }
      });
    });
    invoiceRecords = allInvoices;

    // ──────────────────────────────────────────────────────────
    // ARMAR NODOS Y RELACIONES (EDGES)
    // ──────────────────────────────────────────────────────────

    // 1. Cotización
    if (quotationRecord) {
      const qNum = quotationRecord.get("number") || quotationRecord.get("consecutive") || quotationRecord.id;
      nodes.push({
        id: quotationRecord.id,
        type: "quotation",
        type_label: "Cotización Comercial",
        number: qNum,
        stage: "COTIZACION",
        title: "Cotización #" + qNum,
        date: quotationRecord.get("date") || quotationRecord.created,
        status: quotationRecord.get("status") || "EMITIDA",
        total: Number(quotationRecord.get("total") || 0),
        raw_type: "quotation",
        is_current: (docType === "quotation" && quotationRecord.id === docId)
      });
      aggregateLines(productBalanceMap, "quotation_lines", "quotation_id = '" + quotationRecord.id + "'", "quantity", "quoted", "qty");
    }

    // 2. Reserva
    if (reservationRecord) {
      const rNum = reservationRecord.get("code") || reservationRecord.get("number") || reservationRecord.id;
      nodes.push({
        id: reservationRecord.id,
        type: "reservation",
        type_label: "Reserva de Mercancía",
        number: rNum,
        stage: "RESERVA",
        title: "Reserva #" + rNum,
        date: reservationRecord.get("date") || reservationRecord.created,
        status: reservationRecord.get("status") || "PENDIENTE",
        total: Number(reservationRecord.get("total") || 0),
        raw_type: "reservation",
        is_current: (docType === "reservation" && reservationRecord.id === docId)
      });
      aggregateLines(productBalanceMap, "sales_reservation_lines", "reservation_id = '" + reservationRecord.id + "'", "qty_reserved", "reserved");

      if (quotationRecord) {
        edges.push({
          from: quotationRecord.id,
          to: reservationRecord.id,
          label: "Reservado de cotización"
        });
      }
    }

    // 3. Pedido
    if (orderRecord) {
      const oNum = orderRecord.get("order_number") || orderRecord.get("number") || orderRecord.id;
      nodes.push({
        id: orderRecord.id,
        type: "order",
        type_label: "Pedido Confirmado",
        number: oNum,
        stage: "PEDIDO",
        title: "Pedido #" + oNum,
        date: orderRecord.get("date") || orderRecord.created,
        status: orderRecord.get("status") || "PENDIENTE",
        fulfillment_status: orderRecord.get("fulfillment_status") || "PENDIENTE",
        total: Number(orderRecord.get("total") || 0),
        raw_type: "order",
        is_current: (docType === "order" && orderRecord.id === docId)
      });
      aggregateLines(productBalanceMap, "sales_order_lines", "sales_order_id = '" + orderRecord.id + "'", "qty", "ordered");

      if (quotationRecord) {
        edges.push({
          from: quotationRecord.id,
          to: orderRecord.id,
          label: "Convertido a pedido"
        });
      }
      if (reservationRecord) {
        edges.push({
          from: reservationRecord.id,
          to: orderRecord.id,
          label: "Asociado a pedido"
        });
      }
    }

    // 4. Despachos
    deliveryRecords.forEach(del => {
      const dNum = del.get("delivery_number") || del.get("guide_number") || del.id;
      nodes.push({
        id: del.id,
        type: "delivery",
        type_label: "Despacho / Remisión",
        number: dNum,
        stage: "DESPACHO",
        title: "Despacho #" + dNum,
        date: del.get("date") || del.created,
        status: del.get("status") || "DESPACHADO",
        carrier: del.get("carrier") || del.get("transporter") || "Interno",
        raw_type: "delivery",
        is_current: (docType === "delivery" && del.id === docId)
      });
      aggregateLines(productBalanceMap, "logistica_delivery_lines", "delivery_id = '" + del.id + "'", "qty_delivered", "delivered", "qty_planned");

      if (orderRecord) {
        edges.push({
          from: orderRecord.id,
          to: del.id,
          label: "Remisión de entrega"
        });
      }
    });

    // 5. Facturación
    invoiceRecords.forEach(inv => {
      const isNC = (inv.get("type") || "").toLowerCase().indexOf("credito") >= 0 || (inv.get("number") || "").startsWith("NC");
      const iNum = inv.get("number") || inv.get("invoice_number") || inv.id;
      nodes.push({
        id: inv.id,
        type: "invoice",
        type_label: isNC ? "Nota Crédito / Ajuste DIAN" : "Factura de Venta DIAN",
        number: iNum,
        stage: isNC ? "NOTA_CREDITO" : "FACTURACION",
        title: (isNC ? "Nota Crédito #" : "Factura #") + iNum,
        date: inv.get("date") || inv.created,
        status: inv.get("status") || "EMITIDA",
        total: Number(inv.get("total") || 0),
        dian_status: inv.get("dian_status") || "NO_APLICA",
        raw_type: "invoice",
        is_current: (docType === "invoice" && inv.id === docId)
      });
      aggregateLines(productBalanceMap, "invoice_lines", "invoice_id = '" + inv.id + "'", "quantity", "invoiced", "qty");

      const parentRef = inv.get("parent_invoice_id") || inv.get("cross_doc_ref");
      if (parentRef && invoiceRecords.some(x => x.id === parentRef)) {
        edges.push({
          from: parentRef,
          to: inv.id,
          label: "Ajuste por Nota Crédito"
        });
      } else if (deliveryRecords.length > 0) {
        edges.push({
          from: deliveryRecords[0].id,
          to: inv.id,
          label: "Facturado tras entrega"
        });
      } else if (orderRecord) {
        edges.push({
          from: orderRecord.id,
          to: inv.id,
          label: "Factura comercial"
        });
      }
    });

    // Construcción de matriz de balance
    const itemsBalance = Object.keys(productBalanceMap).map(k => {
      const it = productBalanceMap[k];
      const pendingDelivery = Math.max(0, it.ordered - it.delivered);
      const pendingInvoicing = Math.max(0, it.delivered > 0 ? it.delivered - it.invoiced : it.ordered - it.invoiced);
      return {
        product_id: it.id,
        product_code: it.code,
        product_name: it.name,
        qty_quoted: it.quoted,
        qty_reserved: it.reserved,
        qty_ordered: it.ordered,
        qty_delivered: it.delivered,
        qty_invoiced: it.invoiced,
        pending_delivery: pendingDelivery,
        pending_invoicing: pendingInvoicing,
        fulfillment_percent: it.ordered > 0 ? Math.min(100, Math.round((it.delivered / it.ordered) * 100)) : (it.delivered > 0 ? 100 : 0)
      };
    });

    let totalOrderedQty = 0;
    let totalDeliveredQty = 0;
    let totalInvoicedQty = 0;
    itemsBalance.forEach(b => {
      totalOrderedQty += b.qty_ordered;
      totalDeliveredQty += b.qty_delivered;
      totalInvoicedQty += b.qty_invoiced;
    });

    const fulfillmentPercent = totalOrderedQty > 0 ? Math.min(100, Math.round((totalDeliveredQty / totalOrderedQty) * 100)) : (totalDeliveredQty > 0 ? 100 : 0);
    const invoicedPercent = (totalOrderedQty > 0 || totalDeliveredQty > 0)
      ? Math.min(100, Math.round((totalInvoicedQty / Math.max(totalOrderedQty, totalDeliveredQty)) * 100))
      : (totalInvoicedQty > 0 ? 100 : 0);

    return {
      success: true,
      root_type: docType,
      root_id: docId,
      customer_name: customerName,
      nodes: nodes,
      edges: edges,
      items_balance: itemsBalance,
      summary: {
        total_nodes: nodes.length,
        fulfillment_percent: fulfillmentPercent,
        invoiced_percent: invoicedPercent,
        is_fully_delivered: totalOrderedQty > 0 && totalDeliveredQty >= totalOrderedQty,
        is_fully_invoiced: totalOrderedQty > 0 && totalInvoicedQty >= totalOrderedQty
      }
    };
  }

  // ──────────────────────────────────────────────────────────
  // 3. CONSTRUCCIÓN DE EXPEDIENTE POR CLIENTE (360°)
  // ──────────────────────────────────────────────────────────
  function buildCustomerTracking(customerId) {
    let customerName = resolveCustomerName(customerId);

    const quotes = safeFilter("quotations", "customer_id = '" + customerId + "'", 15);
    const reservations = safeFilter("sales_reservations", "customer_id = '" + customerId + "'", 15);
    const orders = safeFilter("sales_orders", "customer_id ~ '" + customerId + "'", 20);
    const deliveries = safeFilter("logistica_deliveries", "client_id ~ '" + customerId + "'", 20);
    const invoices = safeFilter("invoices", "customer_id = '" + customerId + "'", 25);

    const timeline = [];

    quotes.forEach(q => {
      timeline.push({
        id: q.id,
        type: "quotation",
        title: "Cotización #" + (q.get("number") || q.id),
        date: q.get("date") || q.created,
        status: q.get("status") || "EMITIDA",
        total: Number(q.get("total") || 0)
      });
    });

    reservations.forEach(r => {
      timeline.push({
        id: r.id,
        type: "reservation",
        title: "Reserva #" + (r.get("code") || r.id),
        date: r.get("date") || r.created,
        status: r.get("status") || "ACTIVA",
        total: Number(r.get("total") || 0)
      });
    });

    orders.forEach(o => {
      timeline.push({
        id: o.id,
        type: "order",
        title: "Pedido #" + (o.get("order_number") || o.id),
        date: o.get("date") || o.created,
        status: o.get("status") || "PENDIENTE",
        fulfillment_status: o.get("fulfillment_status") || "PENDIENTE",
        total: Number(o.get("total") || 0)
      });
    });

    deliveries.forEach(d => {
      timeline.push({
        id: d.id,
        type: "delivery",
        title: "Despacho #" + (d.get("delivery_number") || d.id),
        date: d.get("date") || d.created,
        status: d.get("status") || "DESPACHADO"
      });
    });

    invoices.forEach(inv => {
      const isNC = (inv.get("type") || "").toLowerCase().indexOf("credito") >= 0 || (inv.get("number") || "").startsWith("NC");
      timeline.push({
        id: inv.id,
        type: "invoice",
        title: (isNC ? "Nota Crédito #" : "Factura #") + (inv.get("number") || inv.id),
        date: inv.get("date") || inv.created,
        status: inv.get("status") || "EMITIDA",
        total: Number(inv.get("total") || 0),
        dian_status: inv.get("dian_status") || "NO_APLICA"
      });
    });

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      success: true,
      customer_id: customerId,
      customer_name: customerName,
      counts: {
        quotations: quotes.length,
        reservations: reservations.length,
        orders: orders.length,
        deliveries: deliveries.length,
        invoices: invoices.length
      },
      timeline: timeline
    };
  }

  // ──────────────────────────────────────────────────────────
  // 4. CONSTRUCCIÓN DE SEGUIMIENTO POR PRODUCTO
  // ──────────────────────────────────────────────────────────
  function buildProductTracking(productId) {
    let prodName = "Producto";
    let prodCode = "—";
    let currentStock = 0;

    try {
      const prod = $app.findRecordById("products", productId);
      prodName = prod.get("name") || "Producto";
      prodCode = prod.get("code") || prod.get("barcode") || "—";
      currentStock = Number(prod.get("stock") || 0);
    } catch (_) {
      throw new Error("Producto no encontrado.");
    }

    let qtyInReservations = 0;
    const activeReservationLines = safeFilter("sales_reservation_lines", "product_id = '" + productId + "' && status = 'active'", 50);
    activeReservationLines.forEach(l => {
      qtyInReservations += Number(l.get("qty_reserved") || 0);
    });

    let qtyCommittedInOrders = 0;
    const orderLines = safeFilter("sales_order_lines", "product_id = '" + productId + "'", 100);
    orderLines.forEach(ol => {
      const soId = ol.get("sales_order_id");
      if (soId) {
        try {
          const order = $app.findRecordById("sales_orders", soId);
          const st = String(order.get("status") || "").toLowerCase();
          const fst = String(order.get("fulfillment_status") || "");
          if (st !== "cancelled" && fst !== "ENTREGADO") {
            qtyCommittedInOrders += Number(ol.get("qty") || 0);
          }
        } catch (_) {}
      }
    });

    let qtyInTransitDeliveries = 0;
    const delLines = safeFilter("logistica_delivery_lines", "product_id = '" + productId + "'", 50);
    delLines.forEach(dl => {
      const dId = dl.get("delivery_id");
      if (dId) {
        try {
          const del = $app.findRecordById("logistica_deliveries", dId);
          const st = String(del.get("status") || "").toUpperCase();
          if (st === "PENDIENTE" || st === "DESPACHADO") {
            qtyInTransitDeliveries += Number(dl.get("qty_planned") || dl.get("qty_delivered") || 0);
          }
        } catch (_) {}
      }
    });

    const availableStock = Math.max(0, currentStock - qtyCommittedInOrders);

    return {
      success: true,
      product_id: productId,
      product_name: prodName,
      product_code: prodCode,
      stock: {
        physical: currentStock,
        in_reservations: qtyInReservations,
        committed_orders: qtyCommittedInOrders,
        in_transit_deliveries: qtyInTransitDeliveries,
        available_for_sale: availableStock
      }
    };
  }

  // ──────────────────────────────────────────────────────────
  // 5. PARSEO DE PARÁMETROS Y DESPACHO
  // ──────────────────────────────────────────────────────────
  let query = {};
  try {
    if (typeof e.requestInfo === "function") {
      const ri = e.requestInfo();
      query = (ri && ri.query) ? ri.query : {};
    }
  } catch (_) {}

  if ((!query.type && !query.doc_type) || !query.id) {
    try {
      if (typeof $apis !== "undefined" && typeof $apis.requestInfo === "function") {
        const ri2 = $apis.requestInfo(e);
        query = (ri2 && ri2.query) ? ri2.query : query;
      }
    } catch (_) {}
  }

  if ((!query.type && !query.doc_type) || !query.id) {
    try {
      if (e.request && e.request.url) {
        const q = typeof e.request.url.query === "function" ? e.request.url.query() : null;
        if (q && typeof q.get === "function") {
          query.type = query.type || q.get("type");
          query.doc_type = query.doc_type || q.get("doc_type");
          query.id = query.id || q.get("id");
        }
      }
    } catch (_) {}
  }

  const rawType = String(query.type || query.doc_type || "").trim().toLowerCase();
  const id = String(query.id || "").trim();

  if (!rawType || !id) {
    return e.json(400, {
      success: false,
      message: "Parámetros 'type' e 'id' requeridos."
    });
  }

  try {
    if (rawType === "customer" || rawType === "client") {
      return e.json(200, buildCustomerTracking(id));
    }

    if (rawType === "product") {
      return e.json(200, buildProductTracking(id));
    }

    return e.json(200, buildDocumentTracking(rawType, id));
  } catch (err) {
    console.log("[GRAVY-SEGUIMIENTO] Error: " + err);
    return e.json(500, { success: false, message: "Error al generar seguimiento: " + String(err) });
  }
});
