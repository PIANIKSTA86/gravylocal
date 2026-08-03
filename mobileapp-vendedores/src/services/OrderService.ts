import { CartItem, Customer, Order } from '../types';
import { OrderRepository } from '../repositories/OrderRepository';

export class OrderService {
  /**
   * Calcula los totales del pedido aplicando impuestos de Colombia (IVA 19%) y descuentos.
   */
  static calculateTotals(items: CartItem[], discountPercentage: number = 0) {
    let subtotal = 0;
    
    items.forEach((item) => {
      subtotal += item.quantity * item.product.price;
    });

    const discount = subtotal * (discountPercentage / 100);
    const subtotalAfterDiscount = subtotal - discount;
    const tax = subtotalAfterDiscount * 0.19; // IVA 19% Colombia
    const total = subtotalAfterDiscount + tax;

    return {
      subtotal,
      discount,
      tax,
      total,
    };
  }

  /**
   * Valida si un pedido sobrepasa el cupo de crédito disponible del cliente.
   */
  static validateCreditLimit(customer: Customer, newOrderTotal: number): { valid: boolean; reason?: string } {
    const availableCredit = customer.creditLimit - customer.creditUsed;
    if (newOrderTotal > availableCredit) {
      return {
        valid: false,
        reason: `El valor del pedido ($${newOrderTotal.toLocaleString('es-CO')}) excede el cupo de crédito disponible ($${availableCredit.toLocaleString('es-CO')}).`,
      };
    }
    return { valid: true };
  }

  /**
   * Procesa y guarda un nuevo pedido de venta.
   */
  static async submitOrder(
    customer: Customer,
    items: CartItem[],
    notes?: string,
    deliveryDate?: string
  ): Promise<Order> {
    const { subtotal, discount, tax, total } = this.calculateTotals(items);

    const orderPayload: Order = {
      id: '',
      orderNumber: '',
      documentType: 'Pedido',
      customerId: customer.id,
      customerName: customer.name,
      customerNit: customer.nit,
      date: new Date().toISOString().slice(0, 10),
      deliveryDate,
      items,
      subtotal,
      discount,
      tax,
      total,
      status: 'Pendiente Sincronización',
      paymentTerms: customer.avgPayCycleDays ? `Crédito ${customer.avgPayCycleDays} Días` : 'Contado',
      notes,
    };

    return OrderRepository.createOrder(orderPayload);
  }
}
