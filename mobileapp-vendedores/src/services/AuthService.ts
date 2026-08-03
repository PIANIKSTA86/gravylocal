import { pb, setActiveCompany } from '../lib/pocketbase';

export interface CompanyOption {
  id: string;
  name: string;
  nit?: string;
}

export class AuthService {
  /**
   * Autentica a un usuario vendedor con correo y contraseña.
   */
  static async login(email: string, pass: string): Promise<any> {
    const authData = await pb.collection('users').authWithPassword(email.trim(), pass);

    // Cargar sedes / empresas asociadas al usuario si existen
    const companies = await this.getUserCompanies();
    if (companies.length > 0) {
      setActiveCompany(companies[0]);
    } else if (authData.record?.default_branch_id) {
      setActiveCompany({
        id: authData.record.default_branch_id,
        name: 'Sede Principal (Cali)',
      });
    }

    return authData;
  }

  /**
   * Cierra la sesión activa y limpia el token de almacenamiento local.
   */
  static logout(): void {
    pb.authStore.clear();
    localStorage.removeItem('gravy_active_company');
  }

  /**
   * Verifica si existe una sesión válida y no expirada.
   */
  static isAuthenticated(): boolean {
    return pb.authStore.isValid;
  }

  /**
   * Obtiene la información del usuario en sesión.
   */
  static getCurrentUser() {
    return pb.authStore.record;
  }

  /**
   * Obtiene la lista de sedes / empresas accesibles para el usuario autenticado (multiempresa).
   */
  static async getUserCompanies(): Promise<CompanyOption[]> {
    try {
      const records = await pb.collection('branches').getFullList({
        sort: 'name',
      });
      return records.map((r) => ({
        id: r.id,
        name: r.name,
      }));
    } catch (_) {
      const user = this.getCurrentUser();
      if (user?.default_branch_id) {
        return [{ id: user.default_branch_id, name: 'Sede Principal' }];
      }
      return [{ id: 'eo3d07bscdpb7kd', name: 'GRAVY Cali' }];
    }
  }

  /**
   * Cambia la empresa activa de trabajo (Multi-tenant switch).
   */
  static selectCompany(company: CompanyOption): void {
    setActiveCompany(company);
  }
}
