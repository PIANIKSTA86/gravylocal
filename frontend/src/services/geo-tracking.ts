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
   * [DEPRECADO EN WEB]: La adquisición y transmisión de telemetría GPS está delegada
   * exclusivamente a la aplicación móvil nativa. La versión web no emite coordenadas.
   */
  public async startTracking(sellerId: string, sellerName?: string, userId?: string) {
    this.sellerId = sellerId;
    this.sellerName = sellerName || 'Vendedor';
    this.userId = userId || null;

    console.info('[GRAVY-GEO] Emisión de GPS web desactivada por arquitectura. La telemetría en tiempo real corresponde a la App Móvil nativa.');
    this.notify(false, undefined, 'Emisión GPS delegada exclusivamente a la App Móvil.');
    return;
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
   * [DESACTIVADO EN WEB]: La versión web opera en modo solo lectura/visualizador.
   * La app móvil es la única responsable de escribir en seller_live_locations y seller_tracking_logs.
   */
  private async syncLocation(_t: TrackingTelemetry) {
    // No-op en la web: la telemetría corresponde exclusivamente a la app móvil.
    return;
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
