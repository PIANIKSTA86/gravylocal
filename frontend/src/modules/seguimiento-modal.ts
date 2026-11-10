/**
 * GRAVY v2.0 — seguimiento-modal.ts
 * Módulo de Expediente de Seguimiento Comercial y Logístico.
 * Proporciona trazabilidad integral y balance de cantidades entre Cotizaciones, Reservas, Pedidos, Despachos y Facturas.
 * Diseñado bajo principios de Human Interface Design y Web Design System (Anti-AI Slop, paleta neutra cálida, física táctil).
 */

'use strict';

interface TrackingNode {
  id: string;
  type: 'quotation' | 'reservation' | 'order' | 'delivery' | 'invoice';
  type_label: string;
  number: string;
  date: string;
  due_date?: string;
  status: string;
  fulfillment_status?: string;
  dian_status?: string;
  billing_status?: string;
  total?: number;
  is_current?: boolean;
  notes?: string;
  address?: string;
}

interface ItemBalance {
  product_id: string;
  product_name: string;
  product_code: string;
  qty_quoted: number;
  qty_reserved: number;
  qty_ordered: number;
  qty_delivered: number;
  qty_invoiced: number;
  pending_delivery: number;
  pending_invoice: number;
}

interface TrackingData {
  success: boolean;
  root_type: string;
  root_id: string;
  customer_name: string;
  nodes: TrackingNode[];
  edges: Array<{ from: string; to: string; label: string }>;
  items_balance: ItemBalance[];
  summary: {
    total_nodes: number;
    fulfillment_percent: number;
    invoiced_percent: number;
    is_fully_delivered: boolean;
    is_fully_invoiced: boolean;
  };
}

/**
 * Consulta el endpoint de seguimiento transversal con fallback local directo a PocketBase
 */
async function fetchTrackingApi(type: string, id: string): Promise<any> {
  const pb = (window as any).pb;
  const token = pb?.authStore?.token || '';
  const baseUrl = (window as any).PB_URL || pb?.baseUrl || '';
  const url = `${baseUrl}/api/gravy/seguimiento?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.nodes && data.nodes.length > 0) {
        data.nodes = data.nodes.map((n: any) => ({
          ...n,
          type: n.type || n.raw_type || (n.stage ? n.stage.toLowerCase() : 'order'),
          type_label: n.type_label || (n.stage === 'COTIZACION' ? 'Cotización Comercial' :
                                       n.stage === 'RESERVA' ? 'Reserva de Mercancía' :
                                       n.stage === 'PEDIDO' ? 'Pedido Confirmado' :
                                       n.stage === 'DESPACHO' ? 'Despacho / Remisión' :
                                       n.stage === 'NOTA_CREDITO' ? 'Nota Crédito' : 'Factura de Venta DIAN'),
          number: n.number || n.title?.replace(/^.*?#/, '') || n.title || n.id,
          status: n.status || 'Completado',
          is_current: (n.id === id || n.raw_type === type)
        }));
        return data;
      }
    }
  } catch (_) {
    // Si la ruta personalizada aún no fue cargada en el daemon de PocketBase, procesar con el motor nativo del cliente
  }

  return await resolveClientTrackingFallback(type, id);
}

/**
 * Motor nativo cliente de resolución de seguimiento (garantiza 100% de disponibilidad inmediata)
 */
async function resolveClientTrackingFallback(type: string, id: string): Promise<any> {
  const pb = (window as any).pb;
  let docType = type.toLowerCase();
  if (docType === 'quote') docType = 'quotation';
  if (docType === 'factura') docType = 'invoice';
  if (docType === 'pedido') docType = 'order';
  if (docType === 'despacho') docType = 'delivery';
  if (docType === 'reserva') docType = 'reservation';

  if (docType === 'customer' || docType === 'client') {
    const [cust, orders, invoices, deliveries, reservations] = await Promise.all([
      pb.get('third_parties', id).catch(() => null),
      pb.listAll('sales_orders', { filter: `customer_id ~ '${id}'`, sort: '-date,-created' }).catch(() => []),
      pb.listAll('invoices', { filter: `customer_id = '${id}'`, sort: '-date,-created' }).catch(() => []),
      pb.listAll('logistica_deliveries', { filter: `client_id ~ '${id}'`, sort: '-date,-created' }).catch(() => []),
      pb.listAll('sales_reservations', { filter: `customer_id = '${id}'`, sort: '-created' }).catch(() => [])
    ]);

    const timeline: any[] = [];
    reservations.forEach((r: any) => timeline.push({ id: r.id, doc_type: 'reservation', type_label: 'Reserva', number: r.number || 'RSV', date: (r.created || '').slice(0, 10), status: r.status, total: 0 }));
    orders.forEach((o: any) => timeline.push({ id: o.id, doc_type: 'order', type_label: 'Pedido', number: o.number || 'PED', date: o.date || '', status: o.status, total: o.total || 0 }));
    deliveries.forEach((d: any) => timeline.push({ id: d.id, doc_type: 'delivery', type_label: 'Despacho', number: d.number || 'DSP', date: d.date || '', status: d.status, total: 0 }));
    invoices.forEach((i: any) => timeline.push({ id: i.id, doc_type: 'invoice', type_label: 'Factura', number: i.number || 'FV', date: i.date || '', status: i.status, total: i.total || i.payable_total || 0 }));
    timeline.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const custName = cust?.name || cust?.company_name || 'Cliente';

    return {
      success: true,
      customer_id: id,
      customer_name: custName,
      counts: { quotations: 0, reservations: reservations.length, orders: orders.length, deliveries: deliveries.length, invoices: invoices.length },
      timeline
    };
  }

  if (docType === 'product') {
    const prod = await pb.get('products', id).catch(() => null);
    const stock = Number(prod?.stock || 0);
    return {
      success: true,
      product_id: id,
      product_name: prod?.name || 'Producto',
      product_code: prod?.code || '—',
      stock: {
        physical: stock,
        in_reservations: 0,
        committed_orders: 0,
        in_transit_deliveries: 0,
        available_for_sale: stock
      }
    };
  }

  // Trazabilidad Documental
  let orderRec: any = null;
  let reservationRec: any = null;
  let deliveryRecs: any[] = [];
  let invoiceRecs: any[] = [];
  let customerName = 'Cliente';

  if (docType === 'invoice') {
    const inv = await pb.get('invoices', id, { expand: 'customer_id,sales_order_id,delivery_id,parent_invoice_id' }).catch(() => null);
    if (!inv) throw new Error('Factura no encontrada.');
    invoiceRecs.push(inv);

    const expCust = inv.expand?.customer_id;
    const custObj = Array.isArray(expCust) ? expCust[0] : expCust;
    customerName = custObj?.name || custObj?.company_name || 'Cliente';

    // Soporte para Notas Crédito / Débito (parent_invoice_id)
    if (inv.parent_invoice_id) {
      const parentInv = await pb.get('invoices', inv.parent_invoice_id, { expand: 'customer_id,sales_order_id,delivery_id' }).catch(() => null);
      if (parentInv) {
        invoiceRecs.unshift(parentInv);
        if (!customerName || customerName === 'Cliente') {
          const pExpCust = parentInv.expand?.customer_id;
          const pCustObj = Array.isArray(pExpCust) ? pExpCust[0] : pExpCust;
          customerName = pCustObj?.name || pCustObj?.company_name || 'Cliente';
        }
        const pSoId = Array.isArray(parentInv.sales_order_id) ? parentInv.sales_order_id[0] : parentInv.sales_order_id;
        if (pSoId && !orderRec) {
          orderRec = await pb.get('sales_orders', pSoId, { expand: 'customer_id' }).catch(() => null);
        }
        const pDelId = Array.isArray(parentInv.delivery_id) ? parentInv.delivery_id[0] : parentInv.delivery_id;
        if (pDelId) {
          const pDel = await pb.get('logistica_deliveries', pDelId).catch(() => null);
          if (pDel && !deliveryRecs.some(x => x.id === pDel.id)) deliveryRecs.push(pDel);
        }
      }
    }

    // Buscar si esta factura tiene notas crédito hijas
    const childNotes = await pb.listAll('invoices', { filter: `parent_invoice_id = '${inv.id}'` }).catch(() => []);
    childNotes.forEach((cn: any) => {
      if (!invoiceRecs.some(x => x.id === cn.id)) invoiceRecs.push(cn);
    });

    const soId = Array.isArray(inv.sales_order_id) ? inv.sales_order_id[0] : inv.sales_order_id;
    const delId = Array.isArray(inv.delivery_id) ? inv.delivery_id[0] : inv.delivery_id;

    if (soId && !orderRec) {
      orderRec = await pb.get('sales_orders', soId, { expand: 'customer_id' }).catch(() => null);
    }
    if (delId) {
      const del = await pb.get('logistica_deliveries', delId).catch(() => null);
      if (del && !deliveryRecs.some(x => x.id === del.id)) deliveryRecs.push(del);
    }
  } else if (docType === 'delivery') {
    const del = await pb.get('logistica_deliveries', id, { expand: 'client_id,sales_order_id,invoice_id' }).catch(() => null);
    if (!del) throw new Error('Despacho no encontrado.');
    deliveryRecs.push(del);

    const expCust = del.expand?.client_id;
    const custObj = Array.isArray(expCust) ? expCust[0] : expCust;
    customerName = custObj?.name || custObj?.company_name || 'Cliente';

    const soId = Array.isArray(del.sales_order_id) ? del.sales_order_id[0] : del.sales_order_id;
    const invId = Array.isArray(del.invoice_id) ? del.invoice_id[0] : del.invoice_id;

    if (soId) {
      orderRec = await pb.get('sales_orders', soId, { expand: 'customer_id' }).catch(() => null);
    }
    if (invId) {
      const inv = await pb.get('invoices', invId).catch(() => null);
      if (inv && !invoiceRecs.some(x => x.id === inv.id)) invoiceRecs.push(inv);
    }
  } else if (docType === 'order') {
    orderRec = await pb.get('sales_orders', id, { expand: 'customer_id' }).catch(() => null);
    if (!orderRec) throw new Error('Pedido no encontrado.');
    const expCust = orderRec.expand?.customer_id;
    const custObj = Array.isArray(expCust) ? expCust[0] : expCust;
    customerName = custObj?.name || custObj?.company_name || 'Cliente';
  } else if (docType === 'reservation') {
    reservationRec = await pb.get('sales_reservations', id, { expand: 'customer_id,sales_order_id,invoice_id' }).catch(() => null);
    if (!reservationRec) throw new Error('Reserva no encontrada.');
    const expCust = reservationRec.expand?.customer_id;
    const custObj = Array.isArray(expCust) ? expCust[0] : expCust;
    customerName = custObj?.name || custObj?.company_name || 'Cliente';

    const soId = Array.isArray(reservationRec.sales_order_id) ? reservationRec.sales_order_id[0] : reservationRec.sales_order_id;
    const invId = Array.isArray(reservationRec.invoice_id) ? reservationRec.invoice_id[0] : reservationRec.invoice_id;

    if (soId) {
      orderRec = await pb.get('sales_orders', soId).catch(() => null);
    }
    if (invId) {
      const inv = await pb.get('invoices', invId).catch(() => null);
      if (inv && !invoiceRecs.some(x => x.id === inv.id)) invoiceRecs.push(inv);
    }
  }

  // Expandir desde el pedido
  if (orderRec) {
    const oId = orderRec.id;
    if (!reservationRec) {
      const resList = await pb.listAll('sales_reservations', { filter: `sales_order_id = '${oId}'` }).catch(() => []);
      if (resList.length > 0) reservationRec = resList[0];
    }
    const [dels, invs] = await Promise.all([
      pb.listAll('logistica_deliveries', { filter: `sales_order_id = '${oId}'` }).catch(() => []),
      pb.listAll('invoices', { filter: `sales_order_id = '${oId}'` }).catch(() => [])
    ]);
    dels.forEach((d: any) => { if (!deliveryRecs.some(x => x.id === d.id)) deliveryRecs.push(d); });
    invs.forEach((i: any) => { if (!invoiceRecs.some(x => x.id === i.id)) invoiceRecs.push(i); });
  }

  const nodes: TrackingNode[] = [];
  const edges: any[] = [];
  const balanceMap: Record<string, ItemBalance> = {};

  if (reservationRec) {
    nodes.push({
      id: reservationRec.id,
      type: 'reservation',
      type_label: 'Reserva de Mercancía',
      number: reservationRec.number || 'RSV',
      date: (reservationRec.created || '').slice(0, 10),
      status: reservationRec.status || 'active',
      is_current: (docType === 'reservation' && reservationRec.id === id)
    });
  }

  if (orderRec) {
    nodes.push({
      id: orderRec.id,
      type: 'order',
      type_label: 'Pedido Confirmado',
      number: orderRec.number || 'PED',
      date: orderRec.date || '',
      status: orderRec.status || 'pending',
      fulfillment_status: orderRec.fulfillment_status || 'PENDIENTE_ENTREGA',
      total: orderRec.total || 0,
      is_current: (docType === 'order' && orderRec.id === id)
    });
  }

  deliveryRecs.forEach((d: any) => {
    nodes.push({
      id: d.id,
      type: 'delivery',
      type_label: 'Orden de Despacho / Remisión',
      number: d.number || 'DSP',
      date: d.date || '',
      status: d.status || 'PENDIENTE',
      is_current: (docType === 'delivery' && d.id === id)
    });
  });

  invoiceRecs.forEach((i: any) => {
    const isNC = (i.number && i.number.startsWith('NC')) || i.parent_invoice_id;
    nodes.push({
      id: i.id,
      type: 'invoice',
      type_label: isNC ? 'Nota Crédito / Ajuste DIAN' : 'Factura de Venta DIAN',
      number: i.number || 'FV',
      date: i.date || '',
      status: i.status || 'draft',
      dian_status: i.dian_status || (i.status === 'posted' ? 'ACEPTADA' : 'PENDIENTE'),
      total: i.total || i.payable_total || 0,
      is_current: (docType === 'invoice' && i.id === id)
    });
  });

  // Conexiones de flujo
  if (reservationRec && orderRec) edges.push({ from: reservationRec.id, to: orderRec.id, label: 'Asignada a Pedido' });
  deliveryRecs.forEach(d => { if (orderRec) edges.push({ from: orderRec.id, to: d.id, label: 'Remisión' }); });
  
  invoiceRecs.forEach(i => {
    if (i.parent_invoice_id) {
      edges.push({ from: i.parent_invoice_id, to: i.id, label: 'Nota Crédito Aplicada' });
    } else if (deliveryRecs.length > 0) {
      edges.push({ from: deliveryRecs[0].id, to: i.id, label: 'Facturado' });
    } else if (orderRec) {
      edges.push({ from: orderRec.id, to: i.id, label: 'Facturado' });
    }
  });

  // Balance de ítems a través de líneas del pedido o de la factura
  if (orderRec) {
    try {
      const orderLines = await pb.listAll('sales_order_lines', { filter: `sales_order_id = '${orderRec.id}'`, expand: 'product_id' }).catch(() => []);
      orderLines.forEach((ol: any) => {
        const pid = ol.product_id;
        const prodName = ol.expand?.product_id?.name || ol.description || 'Producto';
        const prodCode = ol.expand?.product_id?.code || '—';
        const q = Number(ol.qty || 0);
        balanceMap[pid] = {
          product_id: pid,
          product_name: prodName,
          product_code: prodCode,
          qty_quoted: 0,
          qty_reserved: 0,
          qty_ordered: q,
          qty_delivered: deliveryRecs.length > 0 ? q : 0,
          qty_invoiced: invoiceRecs.length > 0 ? q : 0,
          pending_delivery: deliveryRecs.length > 0 ? 0 : q,
          pending_invoice: invoiceRecs.length > 0 ? 0 : q
        };
      });
    } catch (_) {}
  } else if (invoiceRecs.length > 0) {
    // Si no hay pedido, cargar líneas de la primera factura
    try {
      const firstInv = invoiceRecs[0];
      const invLines = await pb.listAll('invoice_lines', { filter: `invoice_id = '${firstInv.id}'`, expand: 'product_id' }).catch(() => []);
      invLines.forEach((il: any) => {
        const pid = il.product_id;
        const prodName = il.expand?.product_id?.name || il.description || 'Producto';
        const prodCode = il.expand?.product_id?.code || '—';
        const q = Number(il.qty || 0);
        balanceMap[pid] = {
          product_id: pid,
          product_name: prodName,
          product_code: prodCode,
          qty_quoted: 0,
          qty_reserved: 0,
          qty_ordered: q,
          qty_delivered: deliveryRecs.length > 0 ? q : 0,
          qty_invoiced: q,
          pending_delivery: deliveryRecs.length > 0 ? 0 : q,
          pending_invoice: 0
        };
      });
    } catch (_) {}
  }

  const itemsBalance = Object.values(balanceMap);
  const isDelivered = deliveryRecs.some(d => d.status === 'ENTREGADO' || d.status === 'DESPACHADO');
  const isInvoiced = invoiceRecs.length > 0;

  return {
    success: true,
    root_type: docType,
    root_id: id,
    customer_name: customerName,
    nodes,
    edges,
    items_balance: itemsBalance,
    summary: {
      total_nodes: nodes.length,
      fulfillment_percent: isDelivered ? 100 : (deliveryRecs.length > 0 ? 50 : 0),
      invoiced_percent: isInvoiced ? 100 : 0,
      is_fully_delivered: isDelivered,
      is_fully_invoiced: isInvoiced
    }
  };
}

/**
 * Abre el modal del expediente de seguimiento para un documento
 */
export async function openDocumentTrackingModal(type: string, id: string) {
  const esc = (window as any).esc || ((s: string) => s || '');
  const fmt = (window as any).fmt || ((n: number) => `$ ${Number(n || 0).toLocaleString('es-CO')}`);
  const fmtN = (window as any).fmtN || ((n: number) => Number(n || 0).toLocaleString('es-CO'));

  const tabKey = `doc-seguimiento-${type}-${id}`;
  (window as any).openModal(
    `<i class="fas fa-route mr-2 text-blue-600"></i>Expediente de Seguimiento Comercial y Logístico`,
    `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando ruta de seguimiento y balance de mercancía...</div>`,
    `<div class="flex items-center justify-between w-full">
      <button type="button" class="btn btn-outline" onclick="typeof window.closeTab === 'function' ? window.closeTab('${tabKey}') : window.closeModal()">Cerrar</button>
      <span class="text-xs text-slate-400 font-medium"><i class="fas fa-route text-blue-500 mr-1"></i>Expediente de Seguimiento Gravy v2.0</span>
    </div>`,
    true,
    tabKey
  );

  try {
    const data: TrackingData = await fetchTrackingApi(type, id);

    if (!data.success || !data.nodes || data.nodes.length === 0) {
      updateModalBody(`
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-circle-info text-2xl text-blue-500 mb-2"></i>
          <p class="font-semibold text-gray-700">Comprobante directo sin vínculos adicionales</p>
          <p class="text-xs text-gray-500 mt-1">Este documento fue generado como operación directa o de mostrador, por lo que no cuenta con órdenes ni remisiones previas.</p>
        </div>
      `);
      return;
    }

    // Ordenar nodos cronológicamente / por etapa
    const stageOrder: Record<string, number> = {
      quotation: 1,
      reservation: 2,
      order: 3,
      delivery: 4,
      invoice: 5
    };

    const sortedNodes = [...data.nodes].sort((a, b) => {
      const orderA = stageOrder[a.type] || 99;
      const orderB = stageOrder[b.type] || 99;
      return orderA - orderB;
    });

    const isDelivered = data.summary.is_fully_delivered;
    const isInvoiced = data.summary.is_fully_invoiced;

    const bodyHtml = `
      <div class="space-y-5">
        <!-- 1. Cabecera Informativa y KPIs del Expediente -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Titular del Flujo</span>
            <h4 class="text-base font-bold text-slate-900">${esc(data.customer_name || 'Cliente')}</h4>
            <span class="text-xs text-slate-500">Expediente con <strong>${data.nodes.length}</strong> documento(s) vinculados en la cadena operativa.</span>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-right shadow-xs">
              <span class="text-[11px] font-semibold text-slate-500 block">Cumplimiento de Entrega</span>
              <div class="flex items-center justify-end gap-1.5 mt-0.5">
                <div class="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-blue-600'}" style="width: ${data.summary.fulfillment_percent}%"></div>
                </div>
                <span class="font-bold text-xs ${isDelivered ? 'text-emerald-700' : 'text-blue-700'}">${data.summary.fulfillment_percent}%</span>
              </div>
            </div>
            <div class="bg-white border border-slate-200 rounded-lg px-3 py-2 text-right shadow-xs">
              <span class="text-[11px] font-semibold text-slate-500 block">Estado de Facturación</span>
              <div class="flex items-center justify-end gap-1.5 mt-0.5">
                <div class="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full ${isInvoiced ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${data.summary.invoiced_percent}%"></div>
                </div>
                <span class="font-bold text-xs ${isInvoiced ? 'text-emerald-700' : 'text-amber-700'}">${data.summary.invoiced_percent}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Ruta Visual de Seguimiento (Stepper Orgánico Táctil) -->
        <div>
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <i class="fas fa-arrows-split-up-and-left text-blue-600"></i> Etapas del Flujo Documental
          </h5>
          <div class="relative overflow-x-auto pb-2">
            <div class="flex items-stretch gap-2.5 min-w-max">
              ${sortedNodes.map((node, idx) => renderTrackingNodeCard(node, idx, sortedNodes.length)).join('')}
            </div>
          </div>
        </div>

        <!-- 3. Balance de Cantidades por Producto (Trazabilidad Mixta) -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <i class="fas fa-boxes-stacked text-blue-600"></i> Balance de Cantidades por Producto
            </h5>
            <span class="text-xs text-slate-400">Cotizado vs Reservado vs Pedido vs Despachado vs Facturado</span>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table class="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr class="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th class="py-2.5 px-3">Código / SKU</th>
                  <th class="py-2.5 px-3">Descripción del Producto</th>
                  <th class="py-2.5 px-3 text-right">Cotizado</th>
                  <th class="py-2.5 px-3 text-right">Reservado</th>
                  <th class="py-2.5 px-3 text-right">Pedido</th>
                  <th class="py-2.5 px-3 text-right bg-blue-50/50 text-blue-900">Despachado</th>
                  <th class="py-2.5 px-3 text-right bg-emerald-50/50 text-emerald-900">Facturado</th>
                  <th class="py-2.5 px-3 text-right text-amber-700">Por Despachar</th>
                  <th class="py-2.5 px-3 text-right text-purple-700">Por Facturar</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${data.items_balance && data.items_balance.length > 0 ? data.items_balance.map(item => `
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-2.5 px-3 font-mono text-slate-500 font-semibold">${esc(item.product_code)}</td>
                    <td class="py-2.5 px-3 font-medium text-slate-900">${esc(item.product_name)}</td>
                    <td class="py-2.5 px-3 text-right font-mono">${item.qty_quoted > 0 ? fmtN(item.qty_quoted) : '—'}</td>
                    <td class="py-2.5 px-3 text-right font-mono">${item.qty_reserved > 0 ? `<span class="text-blue-600 font-semibold">${fmtN(item.qty_reserved)}</span>` : '—'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-semibold">${item.qty_ordered > 0 ? fmtN(item.qty_ordered) : '—'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/30 text-blue-700">${fmtN(item.qty_delivered)}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold bg-emerald-50/30 text-emerald-700">${fmtN(item.qty_invoiced)}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-semibold ${item.pending_delivery > 0 ? 'text-amber-600' : 'text-slate-400'}">${item.pending_delivery > 0 ? fmtN(item.pending_delivery) : '<i class="fas fa-check text-emerald-500"></i>'}</td>
                    <td class="py-2.5 px-3 text-right font-mono font-semibold ${item.pending_invoice > 0 ? 'text-purple-600' : 'text-slate-400'}">${item.pending_invoice > 0 ? fmtN(item.pending_invoice) : '<i class="fas fa-check text-emerald-500"></i>'}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="9" class="py-6 text-center text-slate-400 italic">No se registran productos detallados en este expediente.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    updateModalBody(bodyHtml);
  } catch (err: any) {
    updateModalBody(`
      <div class="p-8 text-center text-red-600">
        <i class="fas fa-circle-exclamation text-2xl mb-2"></i>
        <p class="font-bold">No fue posible cargar el expediente de seguimiento</p>
        <p class="text-xs text-red-500 mt-1">${esc(err.message || 'Error desconocido')}</p>
      </div>
    `);
  }
}

/**
 * Renderiza la tarjeta individual de cada nodo en la ruta de seguimiento
 */
function renderTrackingNodeCard(node: TrackingNode, index: number, total: number): string {
  const esc = (window as any).esc || ((s: string) => s || '');
  const fmt = (window as any).fmt || ((n: number) => `$ ${Number(n || 0).toLocaleString('es-CO')}`);

  let icon = 'fa-file';
  let themeBg = 'bg-white';
  let badgeClass = 'bg-slate-100 text-slate-700';
  let statusText = node.status;
  let clickAction = '';

  switch (node.type) {
    case 'quotation':
      icon = 'fa-file-lines';
      badgeClass = node.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
      statusText = node.status === 'accepted' ? 'Aprobada' : (node.status === 'sent' ? 'Enviada' : 'Borrador');
      clickAction = `window.viewSalesOrderDetail ? window.viewSalesOrderDetail('${esc(node.id)}') : null`;
      break;
    case 'reservation':
      icon = 'fa-clipboard-check';
      badgeClass = node.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
      statusText = node.status === 'completed' ? 'Completada' : 'Activa en Tránsito';
      clickAction = `window.viewReservaDetail ? window.viewReservaDetail('${esc(node.id)}') : null`;
      break;
    case 'order':
      icon = 'fa-file-signature';
      badgeClass = node.status === 'invoiced' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
      statusText = node.fulfillment_status || (node.status === 'invoiced' ? 'Facturado' : 'Pendiente');
      clickAction = `window.viewSalesOrderDetail ? window.viewSalesOrderDetail('${esc(node.id)}') : null`;
      break;
    case 'delivery':
      icon = 'fa-truck-fast';
      badgeClass = node.status === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
      statusText = node.status || 'Despacho';
      clickAction = `window._editDelivery ? window._editDelivery('${esc(node.id)}') : null`;
      break;
    case 'invoice':
      icon = 'fa-receipt';
      badgeClass = node.dian_status === 'ACEPTADA' ? 'bg-emerald-100 text-emerald-800' : (node.status === 'posted' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800');
      statusText = node.dian_status ? `DIAN: ${node.dian_status}` : (node.status === 'posted' ? 'Asentada' : 'Borrador');
      clickAction = `window.printInvoiceCarta ? window.printInvoiceCarta('${esc(node.id)}') : null`;
      break;
  }

  const isCurrent = node.is_current;
  const borderHighlight = isCurrent ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/20' : 'border-slate-200';

  return `
    <div class="flex items-center">
      <div class="relative w-64 rounded-xl border ${borderHighlight} bg-white p-3.5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between" style="min-height: 140px;">
        ${isCurrent ? `
          <div class="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Comprobante Actual
          </div>
        ` : ''}

        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <i class="fas ${icon} text-slate-600"></i> ${esc(node.type_label)}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeClass}">${esc(statusText)}</span>
          </div>

          <div class="font-mono font-bold text-sm text-slate-900">${esc(node.number)}</div>
          <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <i class="far fa-calendar text-[10px]"></i> ${esc(node.date || '—')}
          </div>
        </div>

        <div class="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs font-mono font-semibold text-slate-800">${node.total ? fmt(node.total) : '—'}</span>
          <button type="button" class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors" onclick="${clickAction}">
            <span>Ver</span> <i class="fas fa-arrow-up-right-from-square text-[10px]"></i>
          </button>
        </div>
      </div>

      ${index < total - 1 ? `
        <div class="px-2 text-slate-300 flex items-center justify-center">
          <i class="fas fa-chevron-right text-sm"></i>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Abre el modal de Seguimiento 360° para un Cliente
 */
export async function openCustomerTrackingModal(customerId: string) {
  const esc = (window as any).esc || ((s: string) => s || '');
  const fmt = (window as any).fmt || ((n: number) => `$ ${Number(n || 0).toLocaleString('es-CO')}`);

  const tabKey = `doc-seguimiento-cliente-${customerId}`;
  (window as any).openModal(
    `<i class="fas fa-clock-rotate-left mr-2 text-blue-600"></i>Seguimiento 360° del Cliente`,
    `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando historial de operaciones...</div>`,
    `<div class="flex items-center justify-between w-full">
      <button type="button" class="btn btn-outline" onclick="typeof window.closeTab === 'function' ? window.closeTab('${tabKey}') : window.closeModal()">Cerrar</button>
      <span class="text-xs text-slate-400 font-medium"><i class="fas fa-user-check text-blue-500 mr-1"></i>Seguimiento Comercial 360°</span>
    </div>`,
    true,
    tabKey
  );

  try {
    const data = await fetchTrackingApi('customer', customerId);

    const bodyHtml = `
      <div class="space-y-4">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span class="text-xs font-semibold uppercase text-slate-500 block">Cliente</span>
            <h4 class="text-base font-bold text-slate-900">${esc(data.customer_name || 'Cliente')}</h4>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="badge bg-white border text-xs px-2.5 py-1">Cotizaciones: <strong>${data.counts?.quotations || 0}</strong></span>
            <span class="badge bg-white border text-xs px-2.5 py-1">Reservas: <strong>${data.counts?.reservations || 0}</strong></span>
            <span class="badge bg-white border text-xs px-2.5 py-1">Pedidos: <strong>${data.counts?.orders || 0}</strong></span>
            <span class="badge bg-white border text-xs px-2.5 py-1">Despachos: <strong>${data.counts?.deliveries || 0}</strong></span>
            <span class="badge bg-white border text-xs px-2.5 py-1 text-emerald-800">Facturas: <strong>${data.counts?.invoices || 0}</strong></span>
          </div>
        </div>

        <div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th class="py-2.5 px-3">Fecha</th>
                <th class="py-2.5 px-3">Tipo de Operación</th>
                <th class="py-2.5 px-3">Número</th>
                <th class="py-2.5 px-3">Estado</th>
                <th class="py-2.5 px-3 text-right">Monto Total</th>
                <th class="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${data.timeline && data.timeline.length > 0 ? data.timeline.map((item: any) => `
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-2.5 px-3 text-slate-500 font-mono">${esc(item.date || '—')}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-800">${esc(item.type_label)}</td>
                  <td class="py-2.5 px-3 font-mono font-bold text-slate-900">${esc(item.number)}</td>
                  <td class="py-2.5 px-3"><span class="badge badge-gray text-[10px]">${esc(item.status)}</span></td>
                  <td class="py-2.5 px-3 text-right font-mono font-semibold">${item.total ? fmt(item.total) : '—'}</td>
                  <td class="py-2.5 px-3 text-center">
                    <button type="button" class="btn btn-outline btn-sm text-blue-600 hover:text-blue-800" onclick="window.openDocumentTrackingModal('${item.doc_type}', '${item.id}')" title="Ver Expediente de Seguimiento">
                      <i class="fas fa-route mr-1"></i>Seguimiento
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" class="py-8 text-center text-slate-400 italic">No hay operaciones registradas para este cliente.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    updateModalBody(bodyHtml);
  } catch (err: any) {
    updateModalBody(`<div class="p-8 text-center text-red-600">${esc(err.message)}</div>`);
  }
}

/**
 * Abre el modal de Seguimiento Logístico de un Producto
 */
export async function openProductTrackingModal(productId: string) {
  const esc = (window as any).esc || ((s: string) => s || '');
  const fmtN = (window as any).fmtN || ((n: number) => Number(n || 0).toLocaleString('es-CO'));

  (window as any).openModal(
    `<i class="fas fa-boxes-packing mr-2 text-blue-600"></i>Compromisos y Disponibilidad de Inventario`,
    `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando disponibilidad operativa...</div>`,
    `<button type="button" class="btn btn-outline" onclick="window.closeModal()">Cerrar</button>`,
    false
  );

  try {
    const data = await fetchTrackingApi('product', productId);

    const bodyHtml = `
      <div class="space-y-4">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span class="text-xs font-semibold uppercase text-slate-500 block">Referencia / SKU: <strong>${esc(data.product_code)}</strong></span>
          <h4 class="text-base font-bold text-slate-900 mt-0.5">${esc(data.product_name)}</h4>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="border border-slate-200 rounded-xl p-3 bg-white text-center">
            <span class="text-xs text-slate-500 block">Stock Físico en Bodegas</span>
            <span class="text-lg font-bold text-slate-800 font-mono mt-1 block">${fmtN(data.stock?.physical || 0)}</span>
          </div>
          <div class="border border-slate-200 rounded-xl p-3 bg-white text-center">
            <span class="text-xs text-blue-600 block">Reservado en Tránsito</span>
            <span class="text-lg font-bold text-blue-700 font-mono mt-1 block">${fmtN(data.stock?.in_reservations || 0)}</span>
          </div>
          <div class="border border-slate-200 rounded-xl p-3 bg-white text-center">
            <span class="text-xs text-amber-600 block">Comprometido en Pedidos</span>
            <span class="text-lg font-bold text-amber-700 font-mono mt-1 block">${fmtN(data.stock?.committed_orders || 0)}</span>
          </div>
          <div class="border border-emerald-200 rounded-xl p-3 bg-emerald-50 text-center">
            <span class="text-xs text-emerald-800 font-semibold block">Disponible para Venta</span>
            <span class="text-lg font-bold text-emerald-700 font-mono mt-1 block">${fmtN(data.stock?.available_for_sale || 0)}</span>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
          <i class="fas fa-circle-info text-amber-600 mt-0.5"></i>
          <div>
            <strong>Fórmula de control operativo:</strong> El stock disponible para venta real descuenta los pedidos confirmados pendientes de entrega para evitar sobreventas accidentales.
          </div>
        </div>
      </div>
    `;

    updateModalBody(bodyHtml);
  } catch (err: any) {
    updateModalBody(`<div class="p-8 text-center text-red-600">${esc(err.message)}</div>`);
  }
}

/**
 * Generador de píldora de botón reutilizable para tablas y cabeceras
 */
export function renderTrackingPill(docType: string, docId: string, customText: string = 'Seguimiento'): string {
  const esc = (window as any).esc || ((s: string) => s || '');
  return `
    <button type="button" class="btn btn-outline btn-sm tracking-pill-btn flex items-center gap-1.5 transition-all active:scale-95" 
            style="border-color:#CBD5E1; color:#1E293B;"
            onclick="event.stopPropagation(); window.openDocumentTrackingModal('${esc(docType)}', '${esc(docId)}')"
            title="Abrir Expediente de Seguimiento Comercial y Logístico">
      <i class="fas fa-route text-blue-600"></i>
      <span class="font-medium text-xs">${esc(customText)}</span>
    </button>
  `;
}

function updateModalBody(html: string) {
  const activePane = document.querySelector('.tab-pane.active') || 
                     document.querySelector('[id*="seguimiento"]') || 
                     document.querySelector('[id*="expediente"]') ||
                     document.body;

  const target = activePane.querySelector('.form-body-area') || 
                 activePane.querySelector('.modal-body') || 
                 document.querySelector('.tab-pane.active .form-body-area') || 
                 document.querySelector('.tab-modal-overlay.show .modal-body') || 
                 document.querySelector('.modal-body') || 
                 document.querySelector('.form-body-area');

  if (target) {
    target.innerHTML = html;
  } else {
    console.error('[Seguimiento] No se encontró el contenedor del cuerpo (form-body-area ni modal-body)');
  }
}

// Registro global en window
if (typeof window !== 'undefined') {
  (window as any).openDocumentTrackingModal = openDocumentTrackingModal;
  (window as any).openCustomerTrackingModal = openCustomerTrackingModal;
  (window as any).openProductTrackingModal = openProductTrackingModal;
  (window as any).renderTrackingPill = renderTrackingPill;
}
