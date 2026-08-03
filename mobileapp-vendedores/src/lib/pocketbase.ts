import PocketBase from 'pocketbase';

/**
 * Resuelve dinámicamente la URL de PocketBase asegurando la conexión
 * desde PC (localhost:8090), red local Wi-Fi (192.168.x.x:8090) y dispositivos móviles nativos.
 */
export function getPocketBaseUrl(): string {
  if ((import.meta as any).env?.VITE_PB_URL) {
    return (import.meta as any).env.VITE_PB_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol.startsWith('https') ? 'https:' : 'http:';

    // Si se accede desde un celular u otro equipo en la red local (ej: 192.168.1.95:3000)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '0.0.0.0') {
      return `${protocol}//${hostname}:8090`;
    }
  }

  return 'http://localhost:8090';
}

export const PB_URL = getPocketBaseUrl();

/** Instancia Singleton del SDK PocketBase */
export const pb = new PocketBase(PB_URL);

// Desactivar la auto-cancelación global para permitir consultas paralelas con Promise.all sin abortar peticiones
pb.autoCancellation(false);

/**
 * Obtiene la sede / empresa activa (branch_id / default_branch_id) para garantizar
 * el aislamiento de datos entre sedes.
 */
export function getActiveCompanyId(): string | null {
  try {
    const activeCompRaw = localStorage.getItem('gravy_active_company');
    if (activeCompRaw) {
      const activeComp = JSON.parse(activeCompRaw);
      if (activeComp?.id) return activeComp.id;
    }
  } catch (err) {
    console.warn('[GRAVY Mobile] Error al leer gravy_active_company:', err);
  }

  // Fallback: verificar en el registro de authStore
  const model = pb.authStore.record;
  if (model?.default_branch_id) return model.default_branch_id;
  if (model?.branch_id) return model.branch_id;

  return null;
}

/**
 * Guarda la sede / empresa activa en el almacenamiento local.
 */
export function setActiveCompany(company: { id: string; name: string; nit?: string }): void {
  localStorage.setItem('gravy_active_company', JSON.stringify(company));
}

/**
 * Inyecta el filtro multi-sede únicamente en las colecciones que poseen el campo branch_id.
 */
export function buildTenantFilter(collectionName: string, customFilter?: string): string {
  const branchId = getActiveCompanyId();
  
  // Colecciones que poseen la columna branch_id en PocketBase
  const branchCollections = ['invoices', 'sales_orders'];

  if (branchId && branchCollections.includes(collectionName)) {
    const tenantConstraint = `branch_id = "${branchId}"`;
    if (!customFilter || customFilter.trim() === '') {
      return tenantConstraint;
    }
    return `${tenantConstraint} && (${customFilter})`;
  }

  return customFilter || '';
}

/**
 * Interfaz de Adaptador de Base de Datos para abstraer PocketBase y la futura migración a PostgreSQL.
 */
export interface IDataAdapter {
  fetchList<T>(collection: string, filter?: string, sort?: string): Promise<T[]>;
  fetchOne<T>(collection: string, id: string): Promise<T>;
  createRecord<T>(collection: string, data: Partial<T>): Promise<T>;
  updateRecord<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  deleteRecord(collection: string, id: string): Promise<boolean>;
}

export const PocketBaseAdapter: IDataAdapter = {
  async fetchList<T>(collection: string, filter?: string, sort?: string): Promise<T[]> {
    const finalFilter = buildTenantFilter(collection, filter);
    return pb.collection(collection).getFullList<T>({
      filter: finalFilter || undefined,
      sort: sort || undefined,
      requestKey: null,
    });
  },

  async fetchOne<T>(collection: string, id: string): Promise<T> {
    return pb.collection(collection).getOne<T>(id);
  },

  async createRecord<T>(collection: string, data: Partial<T>): Promise<T> {
    const branchId = getActiveCompanyId();
    const payload = {
      ...data,
      branch_id: branchId || (data as any)?.branch_id,
    };
    return pb.collection(collection).create<T>(payload);
  },

  async updateRecord<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    return pb.collection(collection).update<T>(id, data);
  },

  async deleteRecord(collection: string, id: string): Promise<boolean> {
    await pb.collection(collection).delete(id);
    return true;
  },
};
