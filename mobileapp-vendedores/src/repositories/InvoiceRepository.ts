import { Invoice, InvoiceStatus } from '../types';
import { PocketBaseAdapter } from '../lib/pocketbase';

export class InvoiceRepository {
  /**
   * Obtiene la cartera de facturas asociadas a un cliente (o toda la cartera activa si no se pasa id).
   */
  static async getInvoicesByCustomer(customerId?: string): Promise<Invoice[]> {
    try {
      const filterStr = customerId ? `customer_id = "${customerId}"` : '';
      const records = await PocketBaseAdapter.fetchList<any>('invoices', filterStr, '-due_date');

      const today = new Date();

      return records.map((r) => {
        const dueDate = r.due_date ? new Date(r.due_date) : today;
        const diffTime = today.getTime() - dueDate.getTime();
        const agingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const totalAmount = Number(r.total || r.payable_total || 0);
        const paidAmount = Number(r.paid_amount || 0);
        const isPaid = paidAmount >= totalAmount || r.status === 'paid';
        const isPendingTreasury = r.status === 'pending_treasury' || r.status === 'Pendiente Tesorería';

        let status: InvoiceStatus = 'En Proceso';
        if (isPaid) {
          status = 'Pagada';
        } else if (isPendingTreasury) {
          status = 'Pendiente Tesorería';
        } else if (agingDays > 0) {
          status = 'Vencida';
        }

        return {
          id: r.id,
          invoiceNumber: r.number || r.tx_number || `FACT-${r.id.slice(0, 6)}`,
          date: r.date || new Date().toISOString().slice(0, 10),
          dueDate: r.due_date || new Date().toISOString().slice(0, 10),
          description: r.notes || `Factura de Venta ${r.number || ''}`,
          totalAmount,
          paidAmount,
          status,
          customerId: r.customer_id,
          category: 'Venta a Crédito',
          agingDays,
        };
      });
    } catch (error) {
      console.error('[InvoiceRepository] Error obteniendo facturas:', error);
      throw error;
    }
  }
}
