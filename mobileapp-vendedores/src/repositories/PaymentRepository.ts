import { PaymentReceipt } from '../types';
import { PocketBaseAdapter, getActiveCompanyId, pb } from '../lib/pocketbase';

export class PaymentRepository {
  /**
   * Obtiene la lista de recibos de pago / recaudos.
   */
  static async getPaymentReceipts(): Promise<PaymentReceipt[]> {
    try {
      const records = await PocketBaseAdapter.fetchList<any>('payments', '', '-date');

      return records.map((r) => ({
        id: r.id,
        receiptNumber: r.receipt_number || `REC-${r.id.slice(0, 6)}`,
        customerId: r.customer_id,
        customerName: r.customer_name || 'Cliente GRAVY',
        date: r.date || new Date().toISOString().slice(0, 10),
        paymentMethod: r.payment_method || 'Transferencia',
        referenceNo: r.reference_no || 'N/A',
        invoicesPaid: r.invoices_paid ? JSON.parse(r.invoices_paid) : [],
        totalAmount: Number(r.amount || 0),
        evidenceUrl: r.evidence_url,
        signatureDataUrl: r.signature_data_url,
        status: r.status === 'approved' ? 'Aprobado Contabilidad' : (r.status === 'rejected' ? 'Rechazado' : 'Pendiente Aprobación'),
        treasuryNotes: r.treasury_notes,
        approvedBy: r.approved_by,
        approvedAt: r.approved_at,
      }));
    } catch (error) {
      console.error('[PaymentRepository] Error obteniendo recibos de pago:', error);
      return [];
    }
  }

  /**
   * Registra un recibo de recaudo multifactura con soporte de firma y fotos de evidencia.
   */
  static async createPaymentReceipt(receipt: PaymentReceipt): Promise<PaymentReceipt> {
    try {
      const branchId = getActiveCompanyId();

      const record = await PocketBaseAdapter.createRecord<any>('payments', {
        receipt_number: receipt.receiptNumber,
        customer_id: receipt.customerId,
        customer_name: receipt.customerName,
        branch_id: branchId,
        date: receipt.date,
        amount: receipt.totalAmount,
        payment_method: receipt.paymentMethod,
        reference_no: receipt.referenceNo,
        invoices_paid: JSON.stringify(receipt.invoicesPaid),
        evidence_url: receipt.evidenceUrl || '',
        signature_data_url: receipt.signatureDataUrl || '',
        status: 'pending',
        user_id: pb.authStore.record?.id,
      });

      // Actualizar estado de las facturas abonadas
      for (const item of receipt.invoicesPaid) {
        try {
          const inv = await PocketBaseAdapter.fetchOne<any>('invoices', item.invoiceId);
          const newPaidAmount = Number(inv.paid_amount || 0) + item.amountPaid;
          const isFullyPaid = newPaidAmount >= Number(inv.total || inv.payable_total || 0);

          await PocketBaseAdapter.updateRecord<any>('invoices', item.invoiceId, {
            paid_amount: newPaidAmount,
            status: isFullyPaid ? 'paid' : 'pending_treasury',
          });
        } catch (e) {
          console.warn(`[PaymentRepository] No se pudo actualizar factura ${item.invoiceId}:`, e);
        }
      }

      return {
        ...receipt,
        id: record.id,
      };
    } catch (error) {
      console.error('[PaymentRepository] Error registrando recaudo:', error);
      throw error;
    }
  }

  /**
   * Aprueba un recaudo por parte del área de Tesorería.
   */
  static async approveReceipt(receiptId: string, notes?: string): Promise<boolean> {
    try {
      await PocketBaseAdapter.updateRecord<any>('payments', receiptId, {
        status: 'approved',
        treasury_notes: notes || 'Aprobado y asentado en contabilidad GRAVY',
        approved_by: pb.authStore.record?.email || 'Tesorería Central',
        approved_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error(`[PaymentRepository] Error aprobando recaudo ${receiptId}:`, error);
      return false;
    }
  }

  /**
   * Rechaza un recaudo con observaciones.
   */
  static async rejectReceipt(receiptId: string, notes: string): Promise<boolean> {
    try {
      await PocketBaseAdapter.updateRecord<any>('payments', receiptId, {
        status: 'rejected',
        treasury_notes: notes,
      });
      return true;
    } catch (error) {
      console.error(`[PaymentRepository] Error rechazando recaudo ${receiptId}:`, error);
      return false;
    }
  }
}
