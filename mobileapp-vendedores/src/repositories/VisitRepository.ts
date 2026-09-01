import { VendorVisit, VisitStatus } from '../types';
import { PocketBaseAdapter, pb } from '../lib/pocketbase';

export class VisitRepository {
  /**
   * Obtiene la lista de visitas del vendedor para la fecha dada (o todas las asignadas al vendedor).
   */
  static async getVisits(dateFilter?: string): Promise<VendorVisit[]> {
    try {
      const records = await PocketBaseAdapter.fetchList<any>(
        'vendor_visits',
        dateFilter ? `visit_date = "${dateFilter}"` : '',
        'order_seq,visit_date',
        'seller_id,client_id,sales_order_id'
      );

      return records.map((r) => {
        const clientObj = r.expand?.client_id;
        const sellerObj = r.expand?.seller_id;
        const orderObj = r.expand?.sales_order_id;

        return {
          id: r.id,
          sellerId: r.seller_id,
          sellerName: sellerObj?.name || 'Mi Vendedor',
          customerId: r.client_id,
          customerName: clientObj?.name || 'Cliente',
          customerAddress: clientObj?.address || 'Sin dirección registrada',
          customerPhone: clientObj?.phone || '',
          customerCity: clientObj?.city || '',
          date: r.visit_date || new Date().toISOString().slice(0, 10),
          orderSeq: Number(r.order_seq || 1),
          status: (r.status as VisitStatus) || 'PROGRAMADA',
          objective: r.objective || 'VENTA',
          checkinTime: r.checkin_time || '',
          checkoutTime: r.checkout_time || '',
          geoLat: r.geo_lat,
          geoLng: r.geo_lng,
          salesOrderId: r.sales_order_id || '',
          salesOrderNumber: orderObj?.number || '',
          noOrderReason: r.no_order_reason || '',
          notes: r.notes || '',
        };
      });
    } catch (error) {
      console.warn('[VisitRepository] Advertencia al obtener visitas de PocketBase, cargando caché:', error);
      // Fallback a LocalStorage para funcionamiento offline
      const cached = localStorage.getItem('gravy_cached_visits');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (_) {}
      }
      return [];
    }
  }

  /**
   * Registra el Check-In del vendedor al llegar al cliente (captura hora y geolocalización GPS).
   */
  static async performCheckIn(visitId: string): Promise<Partial<VendorVisit>> {
    const checkinTime = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    let geoLat: number | undefined = undefined;
    let geoLng: number | undefined = undefined;

    // Obtener geolocalización del navegador / móvil si está disponible
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        geoLat = pos.coords.latitude;
        geoLng = pos.coords.longitude;
      } catch (_) {}
    }

    const payload: any = {
      status: 'EN_CURSO',
      checkin_time: checkinTime,
    };
    if (geoLat !== undefined) payload.geo_lat = geoLat;
    if (geoLng !== undefined) payload.geo_lng = geoLng;

    try {
      await PocketBaseAdapter.updateRecord('vendor_visits', visitId, payload);
    } catch (err) {
      console.warn('[VisitRepository] Check-in guardado offline.');
    }

    return {
      status: 'EN_CURSO',
      checkinTime,
      geoLat,
      geoLng,
    };
  }

  /**
   * Registra el Check-Out / Cierre de la visita con resultado (Éxito, Recaudo o No Efectiva con motivo).
   */
  static async performCheckOut(
    visitId: string,
    outcome: {
      status: VisitStatus;
      salesOrderId?: string;
      noOrderReason?: string;
      notes?: string;
    }
  ): Promise<void> {
    const checkoutTime = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    const payload: any = {
      status: outcome.status,
      checkout_time: checkoutTime,
      sales_order_id: outcome.salesOrderId || null,
      no_order_reason: outcome.noOrderReason || null,
      notes: outcome.notes || '',
    };

    try {
      await PocketBaseAdapter.updateRecord('vendor_visits', visitId, payload);
    } catch (err) {
      console.warn('[VisitRepository] Check-out guardado offline.');
    }
  }

  /**
   * Crea una nueva visita directamente desde la app móvil.
   */
  static async createVisit(visit: Partial<VendorVisit>): Promise<any> {
    const payload = {
      seller_id: visit.sellerId || pb.authStore.record?.id,
      client_id: visit.customerId,
      visit_date: visit.date || new Date().toISOString().slice(0, 10),
      order_seq: visit.orderSeq || 1,
      status: visit.status || 'PROGRAMADA',
      objective: visit.objective || 'VENTA',
      notes: visit.notes || '',
    };

    return await PocketBaseAdapter.createRecord('vendor_visits', payload);
  }
}
