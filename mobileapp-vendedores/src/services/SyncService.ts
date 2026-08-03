import { Order, PaymentReceipt } from '../types';
import { OrderRepository } from '../repositories/OrderRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';

const OFFLINE_QUEUE_KEY = 'gravy_offline_queue';

export interface QueueItem {
  id: string;
  type: 'ORDER' | 'PAYMENT';
  payload: Order | PaymentReceipt;
  createdAt: string;
}

export class SyncService {
  /**
   * Obtiene todos los elementos pendientes en la cola offline.
   */
  static getPendingQueue(): QueueItem[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  /**
   * Agrega un pedido o pago a la cola offline cuando no hay conexión a internet.
   */
  static enqueueOfflineItem(type: 'ORDER' | 'PAYMENT', payload: Order | PaymentReceipt): void {
    const queue = this.getPendingQueue();
    const newItem: QueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    };
    queue.push(newItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Procesa y sincroniza todos los elementos acumulados en la cola offline.
   */
  static async syncPendingQueue(onProgress?: (msg: string) => void): Promise<{ success: number; failed: number }> {
    const queue = this.getPendingQueue();
    if (queue.length === 0) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;
    const remaining: QueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.type === 'ORDER') {
          if (onProgress) onProgress(`Sincronizando Pedido ${(item.payload as Order).orderNumber}...`);
          await OrderRepository.createOrder(item.payload as Order);
        } else if (item.type === 'PAYMENT') {
          if (onProgress) onProgress(`Sincronizando Recaudo ${(item.payload as PaymentReceipt).receiptNumber}...`);
          await PaymentRepository.createPaymentReceipt(item.payload as PaymentReceipt);
        }
        success++;
      } catch (err) {
        console.error(`[SyncService] Fallo al sincronizar item ${item.id}:`, err);
        failed++;
        remaining.push(item);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { success, failed };
  }
}
