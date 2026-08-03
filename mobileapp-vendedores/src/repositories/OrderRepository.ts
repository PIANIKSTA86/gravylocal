import { Order, OrderStatus } from '../types';
import { PocketBaseAdapter, getActiveCompanyId, pb } from '../lib/pocketbase';

export class OrderRepository {
  /**
   * Obtiene la lista de pedidos registrados por la empresa actual.
   */
  static async getOrders(): Promise<Order[]> {
    try {
      const records = await PocketBaseAdapter.fetchList<any>('sales_orders', '', '-created');

      return records.map((r) => {
        let status: OrderStatus = 'Borrador';
        if (r.status === 'pending') status = 'Pendiente Sincronización';
        else if (r.status === 'synced' || r.status === 'approved') status = 'Sincronizado ERP';
        else if (r.status === 'cancelled') status = 'Cancelado';

        return {
          id: r.id,
          orderNumber: r.number || `PED-${r.id.slice(0, 6)}`,
          documentType: 'Pedido',
          customerId: r.customer_id,
          customerName: r.customer_name || 'Cliente GRAVY',
          date: r.date || new Date().toISOString().slice(0, 10),
          deliveryDate: r.due_date,
          items: [], // Se consulta bajo demanda
          subtotal: Number(r.subtotal || 0),
          tax: Number(r.iva_total || 0),
          discount: Number(r.discount_amount || 0),
          total: Number(r.total || 0),
          status,
          paymentTerms: r.payment_terms || 'Crédito 30 Días',
          notes: r.notes || '',
          createdBySeller: r.seller_id || pb.authStore.record?.email || 'Vendedor Móvil',
        };
      });
    } catch (error) {
      console.error('[OrderRepository] Error al obtener pedidos:', error);
      throw error;
    }
  }

  /**
   * Genera y guarda un nuevo pedido de venta con sus correspondientes líneas
   * asegurando el aislamiento multi-tenant por empresa_id.
   */
  static async createOrder(order: Order): Promise<Order> {
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const orderNum = order.orderNumber || `PED-${dateStr}-${timeStr}`;

      const companyId = getActiveCompanyId();

      // 1. Guardar la cabecera del pedido de venta
      const orderRecord = await PocketBaseAdapter.createRecord<any>('sales_orders', {
        number: orderNum,
        customer_id: order.customerId,
        company_id: companyId,
        date: order.date || now.toISOString().slice(0, 10),
        due_date: order.deliveryDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: order.notes || 'Pedido registrado desde GRAVY Mobile App',
        subtotal: order.subtotal,
        iva_total: order.tax,
        discount_amount: order.discount || 0,
        total: order.total,
        status: 'pending',
        user_id: pb.authStore.record?.id,
      });

      // 2. Guardar cada una de las líneas del pedido de venta
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const lineSubtotal = item.quantity * item.product.price;
        const ivaRate = 19; // IVA Estándar Colombia 19%
        const ivaAmount = lineSubtotal * (ivaRate / 100);
        const lineTotal = lineSubtotal + ivaAmount;

        await PocketBaseAdapter.createRecord<any>('sales_order_lines', {
          sales_order_id: orderRecord.id,
          company_id: companyId,
          line_order: i + 1,
          product_id: item.product.id,
          qty: item.quantity,
          unit_price: item.product.price,
          iva_rate: ivaRate,
          iva_amount: ivaAmount,
          subtotal: lineSubtotal,
          total: lineTotal,
          description: item.product.name,
        });
      }

      return {
        ...order,
        id: orderRecord.id,
        orderNumber: orderNum,
        status: 'Sincronizado ERP',
      };
    } catch (error) {
      console.error('[OrderRepository] Error creando pedido:', error);
      throw error;
    }
  }
}
