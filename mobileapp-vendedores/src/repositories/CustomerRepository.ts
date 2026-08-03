import { Customer } from '../types';
import { PocketBaseAdapter, buildTenantFilter, pb } from '../lib/pocketbase';

export class CustomerRepository {
  /**
   * Obtiene la lista completa de clientes activos filtrada estrictamente por empresa_id.
   */
  static async getCustomers(): Promise<Customer[]> {
    try {
      const records = await PocketBaseAdapter.fetchList<any>('third_parties', 'type = "CLIENTE"', 'name');
      
      // Obtener facturas pendientes por empresa para calcular cartera actual
      const pendingInvoices = await PocketBaseAdapter.fetchList<any>(
        'invoices', 
        'status != "paid" && status != "voided" && status != "cancelled"'
      );

      const today = new Date();

      // Mapear acumulados de cartera y clasificación de edades por cliente
      const customerMap: Record<string, {
        balance: number;
        alDia: number;
        d1_30: number;
        d31_60: number;
        d60Plus: number;
      }> = {};

      pendingInvoices.forEach((inv) => {
        const cid = inv.customer_id;
        if (!cid) return;

        if (!customerMap[cid]) {
          customerMap[cid] = { balance: 0, alDia: 0, d1_30: 0, d31_60: 0, d60Plus: 0 };
        }

        const totalAmount = Number(inv.total || 0);
        const paidAmount = Number(inv.paid_amount || 0);
        const dueBalance = Math.max(0, totalAmount - paidAmount);

        customerMap[cid].balance += dueBalance;

        // Calcular días de mora
        const dueDate = inv.due_date ? new Date(inv.due_date) : today;
        const diffTime = today.getTime() - dueDate.getTime();
        const agingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (agingDays <= 0) {
          customerMap[cid].alDia += dueBalance;
        } else if (agingDays <= 30) {
          customerMap[cid].d1_30 += dueBalance;
        } else if (agingDays <= 60) {
          customerMap[cid].d31_60 += dueBalance;
        } else {
          customerMap[cid].d60Plus += dueBalance;
        }
      });

      return records.map((r) => {
        const stats = customerMap[r.id] || { balance: 0, alDia: 0, d1_30: 0, d31_60: 0, d60Plus: 0 };
        const creditLimit = Number(r.credit_limit || 10000000);
        const balanceDue = stats.balance;

        let status: 'ACTIVE PARTNER' | 'ON HOLD' | 'CREDIT RISK' = 'ACTIVE PARTNER';
        if (stats.d60Plus > 0) {
          status = 'CREDIT RISK';
        } else if (balanceDue > creditLimit) {
          status = 'ON HOLD';
        }

        return {
          id: r.id,
          name: r.name || 'Cliente sin nombre',
          nit: r.doc_number || r.nit || 'S/N',
          address: r.address || 'Dirección no registrada',
          contactPerson: r.contact_person || r.contact_name || 'Contacto principal',
          phone: r.phone || r.mobile || '',
          email: r.email || '',
          region: r.city || r.region || 'Nacional',
          creditLimit,
          creditUsed: balanceDue,
          balanceDue,
          avgPayCycleDays: Number(r.payment_terms_days || 30),
          status,
          agingSummary: {
            alDia: stats.alDia,
            d1_30: stats.d1_30,
            d31_60: stats.d31_60,
            d60Plus: stats.d60Plus,
          },
        };
      });
    } catch (error) {
      console.error('[CustomerRepository] Error cargando clientes de PocketBase:', error);
      throw error;
    }
  }

  /**
   * Obtiene un cliente por su ID validando el aislamiento por empresa_id.
   */
  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const customers = await this.getCustomers();
      return customers.find((c) => c.id === id) || null;
    } catch (error) {
      console.error(`[CustomerRepository] Error obteniendo cliente ${id}:`, error);
      return null;
    }
  }
}
