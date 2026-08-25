/**
 * GRAVY v2.0 — supply-chain-orchestrator.ts
 * Motor Central de Integración de Cadena de Suministro y Finanzas.
 * Conecta: Importaciones ➔ Agenda de Pagos ➔ Reservas ➔ Pedidos ➔ Facturación ➔ Logística & Despachos ➔ Tesorería.
 */

'use strict';

import { API } from '../api';

export interface PostImportExpenseScheduleParams {
  importId: string;
  stageName: 'fob' | 'freight' | 'insurance' | 'customs' | 'local_carrier' | 'local_other';
  supplierId: string;
  invoiceNum: string;
  amount: number;
  dueDate?: string;
}

export class SupplyChainOrchestrator {
  private static get pb() {
    return (window as any).pb;
  }

  /**
   * Helper seguro para crear registros en agenda_vencimientos
   */
  private static async safeCreateAgendaRecord(recordData: {
    type: string;
    title: string;
    description: string;
    due_date: string;
    amount: number;
    status: string;
    assigned_roles?: string[];
  }) {
    const payload = {
      type: recordData.type || 'otro',
      title: recordData.title,
      description: recordData.description || '',
      due_date: recordData.due_date,
      amount: Number(recordData.amount || 0),
      status: recordData.status || 'pendiente',
      assigned_roles: recordData.assigned_roles || ['auxiliar', 'contador', 'admin'],
    };

    try {
      return await this.pb.create('agenda_vencimientos', payload);
    } catch (err: any) {
      // Si falla por tipo no reconocido en el select enum, reintentar con 'otro' o 'cxp_proveedor'
      if (payload.type === 'cxc_cliente' || payload.type === 'cxp_importacion') {
        payload.type = payload.type === 'cxc_cliente' ? 'otro' : 'cxp_proveedor';
        return await this.pb.create('agenda_vencimientos', payload).catch(() => null);
      }
      console.warn('[SupplyChainOrchestrator] Error al guardar en agenda_vencimientos:', err?.message || err);
      return null;
    }
  }

  /**
   * 1. Causa etapa de importación contablemente y crea vencimiento automático en la Agenda de Pagos (CXP / DIAN)
   */
  static async postImportStageWithPaymentSchedule(params: PostImportExpenseScheduleParams) {
    const { importId, stageName, supplierId, invoiceNum, amount, dueDate } = params;

    // A. Ejecutar causación contable oficial
    const tx = await API.postImportStage(importId, stageName, supplierId, invoiceNum, amount);

    // B. Crear registro en Agenda de Vencimientos / Programación de Pagos
    try {
      const imp = await this.pb.get('imports', importId, { expand: 'supplier_id' });
      const stageLabels: Record<string, string> = {
        fob: 'FOB Mercancía',
        freight: 'Flete Internacional',
        insurance: 'Seguro Internacional',
        customs: 'Aranceles e Impuestos DIAN',
        local_carrier: 'Transporte Terrestre Local',
        local_other: 'Gastos Portuarios / Otros',
      };

      const targetDueDate = dueDate || imp.estimated_arrival || (window as any).todayStr();
      const type = stageName === 'customs' ? 'impuesto_dian_iva' : 'cxp_importacion';

      await this.safeCreateAgendaRecord({
        type,
        title: `Pago ${stageLabels[stageName] || 'Gasto'} — Imp. ${imp.number} (Fac. ${invoiceNum})`,
        description: `[IMP:${importId}] [TX:${tx.id}] [SUPP:${supplierId}] Causación contable ${tx.number || 'FC'} asociada a la importación ${imp.number}.`,
        due_date: targetDueDate,
        amount: amount,
        status: 'pendiente',
      });
    } catch (err: any) {
      console.warn('Advertencia al registrar en agenda_vencimientos:', err?.message || err);
    }

    return tx;
  }

  /**
   * 2. Capitaliza la importación, traslada a bodega física y libera las reservas en espera
   */
  static async finalizeImportAndReleaseReservations(importId: string, warehouseId: string, txTypeId: string, txNumber: string) {
    // A. Capitalización contable y movimiento físico de inventario (ENTRADA)
    const result = await API.capitalizeImport(importId, warehouseId, txTypeId, txNumber);

    // B. Buscar todas las líneas de reserva vinculadas a esta importación
    let releasedCount = 0;
    try {
      const reservationLines = await this.pb.listAll('sales_reservation_lines', {
        filter: `import_id="${this.pb.escapeFilterValue(importId)}" && (status="active" || status="partial")`,
        expand: 'reservation_id,product_id',
      });

      const affectedReservationIds = new Set<string>();

      for (const rl of reservationLines) {
        affectedReservationIds.add(rl.reservation_id);
        await this.pb.update('sales_reservation_lines', rl.id, {
          status: 'ready_to_dispatch',
          notes: `${rl.notes || ''} | Mercancía ingresada a bodega mediante ${txNumber}`,
        }).catch(() => {});
      }

      // C. Actualizar cabeceras de reservas para alertar al equipo comercial y logístico
      for (const resId of affectedReservationIds) {
        await this.pb.update('sales_reservations', resId, {
          notes: `Mercancía nacionalizada e ingresada a bodega. Disponible para facturación y entrega inmediata.`,
        }).catch(() => {});
        releasedCount++;
      }
    } catch (err: any) {
      console.warn('Advertencia al liberar reservas vinculadas:', err?.message || err);
    }

    return {
      ...result,
      releasedReservationsCount: releasedCount,
    };
  }

  /**
   * 3. Sincroniza la Factura de Venta con Logística y Agenda de Cobros (CXC)
   */
  static async handleInvoiceCreationIntegrations(invoiceId: string) {
    try {
      const inv = await this.pb.get('invoices', invoiceId, { expand: 'customer_id' });
      const payMethod = String(inv.payment_method || '').toUpperCase();
      const payForm = String(inv.payment_form || '');
      const isCredit = (
        payMethod === 'CREDITO' || 
        payMethod === 'CREDIT' || 
        payForm === '2' || 
        (inv.due_date && inv.date && inv.due_date > inv.date)
      );

      // A. Si es venta a crédito con saldo pendiente, registrar en Agenda de Cobros (CXC)
      const totalAmount = Number(inv.payable_total || inv.total || 0);
      if (isCredit && totalAmount > 0) {
        // Verificar si ya existe
        const existing = await this.pb.listAll('agenda_vencimientos', {
          filter: `description ~ "${inv.id}"`,
        }).catch(() => []);

        if (!existing.length) {
          await this.safeCreateAgendaRecord({
            type: 'cxc_cliente',
            title: `Cobro Factura ${inv.number} — ${inv.expand?.customer_id?.name || 'Cliente'}`,
            description: `[INV:${invoiceId}] [CLI:${inv.customer_id}] Cartera comercial correspondiente a la factura de venta ${inv.number}.`,
            due_date: inv.due_date || inv.date,
            amount: totalAmount,
            status: 'pendiente',
          });
        }
      }

      // B. Si tiene entrega pendiente, asegurar que exista el despacho en logística
      if (inv.has_pending_delivery) {
        await this.createDeliveryFromWarehouseGoods(invoiceId).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Error en handleInvoiceCreationIntegrations:', err);
    }
  }

  /**
   * Crea o asegura un registro en logistica_deliveries para mercancías de bodega física o importación
   */
  static async createDeliveryFromWarehouseGoods(invoiceId: string) {
    try {
      const inv = await this.pb.get('invoices', invoiceId, { expand: 'customer_id' });
      if (!inv) return null;

      // 1. Verificar si ya tiene entrega en logística
      const existing = await this.pb.listAll('logistica_deliveries', {
        filter: `invoice_id="${this.pb.escapeFilterValue(invoiceId)}" && status!="CANCELADO"`,
        sort: '-created',
      }).catch(() => []);

      if (existing.length > 0) {
        return existing[0];
      }

      // 2. Obtener líneas de la factura y productos
      const [invLines, products] = await Promise.all([
        API.getInvoiceLines(invoiceId),
        API.getProducts({ activeOnly: false }),
      ]);

      const goodsLines = (invLines || [])
        .map((l: any) => {
          const p = products.find((x: any) => x.id === l.product_id);
          return { line: l, product: p };
        })
        .filter((x: any) => x.product && x.product.type !== 'SERVICIO' && Number(x.line.qty || 0) > 0);

      if (!goodsLines.length) return null;

      const dNumber = await API.nextDeliveryConsecutive();
      const customer = inv.expand?.customer_id || null;
      const itemsSummary = goodsLines.map((x: any) => `${(window as any).fmtN(x.line.qty)} x ${x.product?.name || x.line.product_id}`).join(' | ');

      const delivery = await this.pb.create('logistica_deliveries', {
        number: dNumber,
        date: inv.date || (window as any).todayStr(),
        client_id: inv.customer_id,
        vehicle_id: null,
        address: customer?.address || 'Dirección de entrega cliente',
        status: 'PENDIENTE',
        billing_status: 'FACTURADO',
        delivery_type: 'DIRECTO',
        weight: null,
        notes: `Generado automáticamente por factura ${inv.number}`,
        items: itemsSummary,
        sales_order_id: inv.sales_order_id || null,
        invoice_id: invoiceId,
      });

      // Crear líneas de entrega
      let lineOrder = 1;
      for (const item of goodsLines) {
        await this.pb.create('logistica_delivery_lines', {
          delivery_id: delivery.id,
          line_order: lineOrder++,
          product_id: item.product.id,
          invoice_line_id: item.line.id,
          qty_planned: item.line.qty,
          qty_delivered: 0,
          notes: `Factura ${inv.number}`,
        }).catch(() => {});
      }

      // Actualizar factura
      await this.pb.update('invoices', invoiceId, {
        has_pending_delivery: true,
        delivery_fulfillment_status: 'PENDIENTE',
        delivery_id: delivery.id,
      }).catch(() => {});

      return delivery;
    } catch (err: any) {
      console.warn('Error en createDeliveryFromWarehouseGoods:', err);
      return null;
    }
  }

  /**
   * Crea un despacho en logística a partir de un Pedido de Bodega (antes de facturar)
   */
  static async createDeliveryFromSalesOrder(salesOrderId: string, params: {
    vehicleId?: string | null;
    date?: string;
    address?: string;
    notes?: string;
  }) {
    try {
      const order = await this.pb.get('sales_orders', salesOrderId, { expand: 'customer_id' });
      if (!order) throw new Error('Pedido no encontrado.');

      const [orderLines, products] = await Promise.all([
        API.getSalesOrderLines(salesOrderId),
        API.getProducts({ activeOnly: false }),
      ]);

      const goodsLines = (orderLines || [])
        .map((l: any) => {
          const p = products.find((x: any) => x.id === l.product_id);
          return { line: l, product: p };
        })
        .filter((x: any) => x.product && x.product.type !== 'SERVICIO' && Number(x.line.qty || 0) > 0);

      if (!goodsLines.length) {
        throw new Error('El pedido no contiene ítems físicos para despachar.');
      }

      const dNumber = await API.nextDeliveryConsecutive();
      const customer = order.expand?.customer_id || null;
      const itemsSummary = goodsLines.map((x: any) => `${(window as any).fmtN(x.line.qty)} x ${x.product?.name || x.line.product_id}`).join(' | ');

      const delivery = await this.pb.create('logistica_deliveries', {
        number: dNumber,
        date: params.date || order.date || (window as any).todayStr(),
        client_id: order.customer_id,
        vehicle_id: params.vehicleId || null,
        address: params.address || customer?.address || 'Dirección de entrega cliente',
        status: 'PENDIENTE',
        billing_status: 'PENDIENTE_FACTURAR',
        delivery_type: 'DESDE_PEDIDO',
        weight: null,
        notes: params.notes || `Despacho programado desde Pedido ${order.number}`,
        items: itemsSummary,
        sales_order_id: salesOrderId,
        invoice_id: null,
      });

      let lineOrder = 1;
      for (const item of goodsLines) {
        await this.pb.create('logistica_delivery_lines', {
          delivery_id: delivery.id,
          line_order: lineOrder++,
          product_id: item.product.id,
          qty_planned: item.line.qty,
          qty_delivered: 0,
          notes: `Pedido ${order.number}`,
        }).catch(() => {});
      }

      // Actualizar pedido a estado EN_DESPACHO
      await this.pb.update('sales_orders', salesOrderId, {
        fulfillment_status: 'EN_DESPACHO',
        has_pending_delivery: true,
        delivery_id: delivery.id,
      }).catch(() => {});

      return delivery;
    } catch (err: any) {
      console.error('Error en createDeliveryFromSalesOrder:', err);
      throw err;
    }
  }

  /**
   * 4. Al completar una entrega en Logística (Despachos), actualiza Factura y Pedido
   */
  static async handleDeliveryStatusChange(deliveryId: string, newStatus: string) {
    try {
      const delivery = await this.pb.get('logistica_deliveries', deliveryId, {
        expand: 'invoice_id,sales_order_id,reservation_id',
      });

      if (newStatus === 'ENTREGADO') {
        // A. Actualizar estado de fulfillment en la Factura si existe
        if (delivery.invoice_id) {
          await this.pb.update('invoices', delivery.invoice_id, {
            delivery_fulfillment_status: 'ENTREGADO',
          }).catch(() => {});
        }

        // B. Actualizar reserva vinculada
        if (delivery.reservation_id) {
          await this.pb.update('sales_reservations', delivery.reservation_id, {
            status: 'completed',
          }).catch(() => {});
        }

        // C. Actualizar pedido vinculado
        if (delivery.sales_order_id) {
          await this.pb.update('sales_orders', delivery.sales_order_id, {
            fulfillment_status: 'ENTREGADO',
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.warn('Error en handleDeliveryStatusChange:', err);
    }
  }

  /**
   * 5. Al registrar comprobante de egreso o recibo de caja en Tesorería, marcar el vencimiento en la Agenda
   */
  static async syncTreasuryTransactionWithAgenda(referenceText: string, txId: string) {
    if (!referenceText) return;
    try {
      const safeRef = this.pb.escapeFilterValue(referenceText.trim());
      const records = await this.pb.listAll('agenda_vencimientos', {
        filter: `(title ~ "${safeRef}" || description ~ "${safeRef}") && status!="pagado"`,
      });

      for (const rec of records) {
        await this.pb.update('agenda_vencimientos', rec.id, {
          status: 'pagado',
          description: `${rec.description || ''} | Pagado mediante Comprobante TX: ${txId}`,
        }).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Error en syncTreasuryTransactionWithAgenda:', err);
    }
  }

  /**
   * 6. Sincroniza retroactivamente todas las ventas y compras a crédito existentes que no estén en la Agenda de Pagos
   */
  static async syncHistoricalInvoicesToAgenda() {
    let syncedCount = 0;
    try {
      // 1. Obtener todas las facturas de venta y compra activas/contabilizadas
      const [allInvoices, existingAgenda] = await Promise.all([
        this.pb.listAll('invoices', {
          filter: 'status!="voided" && status!="draft"',
          expand: 'customer_id',
        }).catch(() => []),
        this.pb.listAll('agenda_vencimientos').catch(() => [])
      ]);

      const existingDescriptions = existingAgenda.map((r: any) => `${r.title || ''} ${r.description || ''}`).join(' ');

      for (const inv of allInvoices) {
        // Comprobar si ya existe por ID de factura o número
        if (existingDescriptions.includes(inv.id) || (inv.number && existingDescriptions.includes(inv.number))) {
          continue;
        }

        const payMethod = String(inv.payment_method || '').toUpperCase();
        const payForm = String(inv.payment_form || '');
        const isCredit = (
          payMethod === 'CREDITO' || 
          payMethod === 'CREDIT' || 
          payForm === '2' || 
          (inv.due_date && inv.date && inv.due_date > inv.date)
        );

        if (isCredit && Number(inv.total || inv.payable_total || 0) > 0) {
          const res = await this.safeCreateAgendaRecord({
            type: 'cxc_cliente',
            title: `Cobro Factura ${inv.number} — ${inv.expand?.customer_id?.name || 'Cliente'}`,
            description: `[INV:${inv.id}] Cartera comercial correspondiente a la factura de venta ${inv.number}.`,
            due_date: inv.due_date || inv.date,
            amount: Number(inv.payable_total || inv.total || 0),
            status: 'pendiente',
          });
          if (res) syncedCount++;
        }
      }
    } catch (err: any) {
      console.warn('Error al sincronizar histórico de facturas en agenda:', err);
      throw err;
    }
    return syncedCount;
  }
}

// Exportar globalmente para interoperabilidad en la UI
(window as any).SupplyChainOrchestrator = SupplyChainOrchestrator;
