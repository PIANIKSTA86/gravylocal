/// <reference path="../pb_data/types.d.ts" />
/**
 * GRAVY v2.0 — sales_workflow_orchestrator.pb.js
 * Automatización Server-Side para el ciclo de vida:
 * Facturación ➔ Agenda de Cobros (CXC) ➔ Logística & Despachos ➔ Pedidos.
 */

onRecordCreateRequest((e) => {
  e.next();
  handleSalesInvoiceWorkflow(e.record);
}, "invoices");

onRecordUpdateRequest((e) => {
  e.next();
  handleSalesInvoiceWorkflow(e.record);
}, "invoices");

onRecordUpdateRequest((e) => {
  e.next();
  handleDeliveryStatusChange(e.record);
}, "logistica_deliveries");

/**
 * Orquesta la integración al asentar o actualizar una factura de venta
 */
function handleSalesInvoiceWorkflow(invoice) {
  if (!invoice) return;

  const status = invoice.get("status");
  if (status !== "posted") return; // Solo procesar facturas asentadas

  const invoiceId = invoice.id;
  const number = invoice.get("number") || "FV";
  const date = invoice.get("date") || "";
  const dueDate = invoice.get("due_date") || date;
  const total = Number(invoice.get("payable_total") || invoice.get("total") || 0);
  const paymentMethod = String(invoice.get("payment_method") || "").toUpperCase();
  const paymentForm = String(invoice.get("payment_form") || "");
  const customerId = invoice.get("customer_id");
  const salesOrderId = invoice.get("sales_order_id");
  const deliveryId = invoice.get("delivery_id");
  const hasPendingDelivery = invoice.get("has_pending_delivery") === true;

  // 1. Obtener nombre del cliente
  let customerName = "Cliente";
  try {
    if (customerId) {
      const customer = $app.findRecordById("third_parties", customerId);
      customerName = customer.get("name") || "Cliente";
    }
  } catch (err) {
    console.log("[GRAVY-SALES-ORCHESTRATOR] Error al buscar cliente: " + err);
  }

  // 2. Determinar si es venta a crédito o con vencimiento diferido
  const isCredit = (
    paymentMethod === "CREDITO" ||
    paymentMethod === "CREDIT" ||
    paymentForm === "2" ||
    (dueDate && date && dueDate > date)
  );

  // 3. Sincronizar en Agenda de Cobros (CXC)
  if (isCredit && total > 0) {
    try {
      const refTag = `[INV:${invoiceId}]`;
      const existing = $app.findRecordsByFilter(
        "agenda_vencimientos",
        `description ~ '${invoiceId}'`,
        "",
        1,
        0
      );

      const title = `Cobro Fac. ${number} — ${customerName}`;
      const description = `${refTag} Cartera comercial de venta. Cliente: ${customerName}.`;

      if (existing && existing.length > 0) {
        const rec = existing[0];
        if (rec.get("amount") !== total || rec.get("due_date") !== dueDate || rec.get("title") !== title) {
          rec.set("amount", total);
          rec.set("due_date", dueDate);
          rec.set("title", title);
          rec.set("description", description);
          $app.save(rec);
          console.log("[GRAVY-SALES-ORCHESTRATOR] CXC actualizada en agenda para factura: " + number);
        }
      } else {
        const agendaCol = $app.findCollectionByNameOrId("agenda_vencimientos");
        const newAgenda = new Record(agendaCol, {
          type: "cxc_cliente",
          title: title,
          description: description,
          due_date: dueDate,
          amount: total,
          status: "pendiente",
          assigned_roles: JSON.stringify(["auxiliar", "contador", "admin"])
        });
        $app.save(newAgenda);
        console.log("[GRAVY-SALES-ORCHESTRATOR] CXC creada automáticamente en agenda para factura: " + number);
      }
    } catch (err) {
      console.log("[GRAVY-SALES-ORCHESTRATOR] Error al registrar CXC en agenda: " + err);
    }
  }

  // 4. Si la factura se generó a partir de un despacho existente, marcar despacho como FACTURADO
  if (deliveryId) {
    try {
      const delivery = $app.findRecordById("logistica_deliveries", deliveryId);
      let dChanged = false;
      if (delivery.get("invoice_id") !== invoiceId) {
        delivery.set("invoice_id", invoiceId);
        dChanged = true;
      }
      if (delivery.get("billing_status") !== "FACTURADO") {
        delivery.set("billing_status", "FACTURADO");
        dChanged = true;
      }
      if (dChanged) {
        $app.save(delivery);
        console.log("[GRAVY-SALES-ORCHESTRATOR] Despacho " + delivery.get("number") + " enlazado y marcado como FACTURADO.");
      }
    } catch (err) {
      console.log("[GRAVY-SALES-ORCHESTRATOR] Error al actualizar despacho desde factura: " + err);
    }
  }

  // 5. Si la factura proviene de un pedido, marcar pedido como FACTURADO / invoiced
  if (salesOrderId) {
    try {
      const order = $app.findRecordById("sales_orders", salesOrderId);
      let oChanged = false;
      if (order.get("invoice_id") !== invoiceId) {
        order.set("invoice_id", invoiceId);
        oChanged = true;
      }
      if (order.get("status") !== "invoiced") {
        order.set("status", "invoiced");
        oChanged = true;
      }
      if (order.get("fulfillment_status") !== "FACTURADO") {
        order.set("fulfillment_status", "FACTURADO");
        oChanged = true;
      }
      if (oChanged) {
        $app.save(order);
        console.log("[GRAVY-SALES-ORCHESTRATOR] Pedido " + order.get("number") + " actualizado a facturado.");
      }
    } catch (err) {
      console.log("[GRAVY-SALES-ORCHESTRATOR] Error al actualizar pedido desde factura: " + err);
    }
  }
}

/**
 * Orquesta la actualización de estados cuando un despacho cambia a ENTREGADO
 */
function handleDeliveryStatusChange(delivery) {
  if (!delivery) return;

  const status = delivery.get("status");
  const invoiceId = delivery.get("invoice_id");
  const salesOrderId = delivery.get("sales_order_id");

  if (status === "ENTREGADO") {
    // Actualizar factura si existe
    if (invoiceId) {
      try {
        const inv = $app.findRecordById("invoices", invoiceId);
        if (inv.get("delivery_fulfillment_status") !== "ENTREGADO") {
          inv.set("delivery_fulfillment_status", "ENTREGADO");
          $app.save(inv);
        }
      } catch (err) {
        console.log("[GRAVY-SALES-ORCHESTRATOR] Error al actualizar factura de entrega: " + err);
      }
    }

    // Actualizar pedido si existe
    if (salesOrderId) {
      try {
        const ord = $app.findRecordById("sales_orders", salesOrderId);
        if (ord.get("fulfillment_status") !== "ENTREGADO" && ord.get("fulfillment_status") !== "FACTURADO") {
          ord.set("fulfillment_status", "ENTREGADO");
          $app.save(ord);
        }
      } catch (err) {
        console.log("[GRAVY-SALES-ORCHESTRATOR] Error al actualizar pedido de entrega: " + err);
      }
    }
  }
}
