/**
 * GRAVY v2.0 — geo-tracking.ts
 * Servicio de Telemetría y Geolocalización Continua para Vendedores en Terreno.
 * Transmite coordenadas en tiempo real a PocketBase con optimización de batería y ancho de banda.
 */

export interface TrackingTelemetry {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null; // km/h
  heading: number | null;
  batteryLevel: number | null; // 0 - 100
  isCharging: boolean | null;
  status: 'EN_VISITA' | 'EN_TRANSITO' | 'DETENIDO' | 'OFFLINE';
  lastPing: string;
}

export type TrackingStateCallback = (active: boolean, telemetry?: TrackingTelemetry, error?: string) => void;

class GeoTrackingService {
  private watchId: number | null = null;
  private sellerId: string | null = null;
  private sellerName: string | null = null;
  private userId: string | null = null;
  private liveRecordId: string | null = null;
  private currentVisitId: string | null = null;

  private lastSentLat: number = 0;
  private lastSentLng: number = 0;
  private lastSentTime: number = 0;
  private lastLogTime: number = 0;
  private isSending: boolean = false;

  private callbacks: Set<TrackingStateCallback> = new Set();
  private lastTelemetry: TrackingTelemetry | null = null;

  /**
   * Suscribirse a cambios de estado del servicio
   */
  public subscribe(cb: TrackingStateCallback): () => void {
    this.callbacks.add(cb);
    if (this.lastTelemetry) {
      cb(this.watchId !== null, this.lastTelemetry);
    }
    return () => this.callbacks.delete(cb);
  }

  private notify(active: boolean, telemetry?: TrackingTelemetry, error?: string) {
    this.callbacks.forEach(cb => {
      try {
        cb(active, telemetry, error);
      } catch (err) {
        console.error('[GRAVY-GEO] Error in subscriber callback:', err);
      }
    });
  }

  /**
   * Inicia el rastreo telemétrico continuo
   */
  public async startTracking(sellerId: string, sellerName?: string, userId?: string) {
    if (!navigator.geolocation) {
      this.notify(false, undefined, 'Geolocalización no soportada por este navegador');
      return;
    }

    this.sellerId = sellerId;
    this.sellerName = sellerName || 'Vendedor';
    this.userId = userId || null;

    if (this.watchId !== null) {
      return; // Ya está activo
    }

    try {
      // Buscar si ya existe un registro de live location para reutilizar su ID
      const pb = (window as any).pb;
      if (pb) {
        const existing = await pb.listAll('seller_live_locations', {
          filter: `seller_id = "${sellerId}"`,
          limit: 1,
        }).catch(() => []);
        if (existing.length > 0) {
          this.liveRecordId = existing[0].id;
        }
      }
    } catch (_) {}

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => {
        console.warn('[GRAVY-GEO] Error de GPS:', err.message);
        this.notify(false, undefined, err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );

    this.notify(true);
    console.log('[GRAVY-GEO] Servicio de telemetría GPS iniciado para vendedor:', sellerId);
  }

  /**
   * Detiene el rastreo
   */
  public stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.notify(false);
    console.log('[GRAVY-GEO] Servicio de telemetría GPS detenido.');
  }

  /**
   * Asigna la visita activa cuando se hace check-in o se finaliza
   */
  public setCurrentVisit(visitId: string | null) {
    this.currentVisitId = visitId;
    // Forzar actualización inmediata de estado
    if (this.lastTelemetry) {
      this.lastTelemetry.status = visitId ? 'EN_VISITA' : (this.lastTelemetry.speed && this.lastTelemetry.speed > 5 ? 'EN_TRANSITO' : 'DETENIDO');
      this.syncLocation(this.lastTelemetry);
    }
  }

  public isTracking(): boolean {
    return this.watchId !== null;
  }

  public getLatestTelemetry(): TrackingTelemetry | null {
    return this.lastTelemetry;
  }

  /**
   * Procesa cada lectura del sensor GPS
   */
  private async handlePositionUpdate(pos: GeolocationPosition) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = Math.round(pos.coords.accuracy);
    const speedKmh = pos.coords.speed !== null && pos.coords.speed >= 0 
      ? Math.round(pos.coords.speed * 3.6 * 10) / 10 
      : null;
    const heading = pos.coords.heading !== null && !isNaN(pos.coords.heading) 
      ? Math.round(pos.coords.heading) 
      : null;

    // Obtener información de batería si la API está disponible
    let batteryLevel: number | null = null;
    let isCharging: boolean | null = null;
    try {
      if ('getBattery' in navigator) {
        const batt = await (navigator as any).getBattery();
        batteryLevel = Math.round(batt.level * 100);
        isCharging = batt.charging;
      }
    } catch (_) {}

    // Determinar estado operativo
    let status: 'EN_VISITA' | 'EN_TRANSITO' | 'DETENIDO' | 'OFFLINE' = 'DETENIDO';
    if (this.currentVisitId) {
      status = 'EN_VISITA';
    } else if (speedKmh && speedKmh > 5) {
      status = 'EN_TRANSITO';
    } else {
      const distFromLast = this.calculateDistance(lat, lng, this.lastSentLat, this.lastSentLng);
      if (distFromLast > 35 && (Date.now() - this.lastSentTime < 45000)) {
        status = 'EN_TRANSITO';
      }
    }

    const telemetry: TrackingTelemetry = {
      lat,
      lng,
      accuracy,
      speed: speedKmh,
      heading,
      batteryLevel,
      isCharging,
      status,
      lastPing: new Date().toISOString(),
    };

    this.lastTelemetry = telemetry;
    this.notify(true, telemetry);

    // Throttle inteligente:
    // Enviar si:
    // - Es el primer envío
    // - O han pasado >= 30s y se desplazó > 30m
    // - O han pasado >= 60s (heartbeat mínimo obligatorio)
    const now = Date.now();
    const elapsedSec = (now - this.lastSentTime) / 1000;
    const distMetros = this.calculateDistance(lat, lng, this.lastSentLat, this.lastSentLng);

    if (this.lastSentTime === 0 || elapsedSec >= 60 || (elapsedSec >= 25 && distMetros >= 30)) {
      this.syncLocation(telemetry);
    }
  }

  /**
   * Sincroniza la ubicación actual con PocketBase
   */
  private async syncLocation(t: TrackingTelemetry) {
    if (!this.sellerId || this.isSending) return;
    const pb = (window as any).pb;
    if (!pb) return;

    this.isSending = true;

    try {
      const payload: any = {
        seller_id: this.sellerId,
        user_id: this.userId || undefined,
        seller_name: this.sellerName || 'Vendedor',
        lat: t.lat,
        lng: t.lng,
        accuracy: t.accuracy,
        speed: t.speed,
        heading: t.heading,
        battery_level: t.batteryLevel,
        is_charging: t.isCharging,
        status: t.status,
        current_visit_id: this.currentVisitId || undefined,
        last_ping: t.lastPing,
      };

      if (this.liveRecordId) {
        await pb.update('seller_live_locations', this.liveRecordId, payload);
      } else {
        const created = await pb.create('seller_live_locations', payload);
        this.liveRecordId = created.id;
      }

      this.lastSentLat = t.lat;
      this.lastSentLng = t.lng;
      this.lastSentTime = Date.now();

      // Guardar en log histórico si han pasado más de 3 minutos o es el primero
      const now = Date.now();
      if (now - this.lastLogTime >= 180000 || this.lastLogTime === 0) {
        const today = new Date().toISOString().slice(0, 10);
        await pb.create('seller_tracking_logs', {
          seller_id: this.sellerId,
          visit_date: today,
          lat: t.lat,
          lng: t.lng,
          speed: t.speed,
          status: t.status,
          timestamp: t.lastPing,
        }).catch(() => {});
        this.lastLogTime = now;
      }
    } catch (err: any) {
      console.warn('[GRAVY-GEO] Error al sincronizar telemetría:', err.message);
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Fórmula Haversine para distancia en metros entre dos puntos
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (lat1 === 0 && lon1 === 0) return 99999;
    const R = 6371e3; // Metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const geoTracking = new GeoTrackingService();
(window as any).geoTracking = geoTracking;
