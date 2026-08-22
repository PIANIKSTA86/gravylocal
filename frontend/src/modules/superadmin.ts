/**
 * GRAVY v2.0 — superadmin.ts
 * Panel exclusivo para el rol "superadmin" (Gestión del Sistema).
 */

'use strict';

const getHubUrl = (): string => {
  const { protocol, hostname, port } = window.location;
  if (port) {
    return `${protocol}//${hostname}:8089`;
  }
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return `${protocol}//hub.${parts.slice(1).join('.')}`;
  }
  return `${protocol}//hub.${hostname}`;
};

const HUB_URL = getHubUrl();

async function renderSuperadmin(container: HTMLElement): Promise<void> {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  container = getContainer(container);
  if (!container) return;

  const role = pb?.currentUser?.role ?? 'viewer';
  if (role !== 'superadmin') {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center anim-fade" style="min-height:60vh;gap:16px">
        <i class="fas fa-shield-halved" style="font-size:40px;color:#EF4444"></i>
        <p class="font-bold" style="color:#374151">Acceso Denegado</p>
        <p class="text-sm" style="color:#9CA3AF">El panel SuperAdministrador es exclusivo para los gestores del sistema GRAVY.</p>
        <button class="btn btn-outline" onclick="navigate('dashboard')"><i class="fas fa-house"></i> Volver</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="anim-slide-up" id="superadmin-root">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px;background:#1e1e2d;color:white;padding:24px;border-radius:16px;">
        <div style="display:flex;align-items:center;gap:16px">
          <div style="width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#7F7CFF,#2446B8);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(36,70,184,0.3)">
            <i class="fas fa-crown" style="font-size:24px;color:white"></i>
          </div>
          <div>
            <h2 style="font-size:22px;font-weight:800;margin-bottom:4px;letter-spacing:-0.5px">Panel SuperAdmin</h2>
            <p style="font-size:13px;color:#a0a0b8;margin:0">Gestión global de la instancia GRAVY</p>
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn" style="background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2)" onclick="renderSuperadmin(document.getElementById('page-content'))">
            <i class="fas fa-rotate-right"></i> Refrescar
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display:flex;gap:4px;margin-bottom:24px;border-bottom:2px solid #E5E7EB;padding-bottom:0">
        <button class="sa-tab active" data-tab="empresas" style="padding:12px 20px;font-weight:700;font-size:14px;color:#2446B8;border-bottom:3px solid #2446B8;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer"><i class="fas fa-building mr-2"></i>Empresas</button>
        <button class="sa-tab" data-tab="licencias" style="padding:12px 20px;font-weight:600;font-size:14px;color:#6B7280;border-bottom:3px solid transparent;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer"><i class="fas fa-key mr-2"></i>Licencias</button>
        <button class="sa-tab" data-tab="sistema" style="padding:12px 20px;font-weight:600;font-size:14px;color:#6B7280;border-bottom:3px solid transparent;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer"><i class="fas fa-server mr-2"></i>Sistema</button>
      </div>

      <!-- Tab Contents -->
      <div id="sa-tab-empresas" class="sa-tab-content">
        <div style="background:white;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="font-size:16px;font-weight:700;color:#111827">Información de la Empresa Actual</h3>
            <span style="font-size:11px;font-weight:700;padding:4px 10px;background:#ECFDF5;color:#10B981;border-radius:20px"><i class="fas fa-check-circle mr-1"></i>Instancia Activa</span>
          </div>
          <div id="sa-company-info" style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div style="font-size:14px;color:#6B7280"><i class="fas fa-spinner fa-spin"></i> Cargando datos...</div>
          </div>
          
          <!-- Directorio de Empresas Locales en el HUB -->
          <div id="sa-hub-companies" style="margin-top:28px;border-top:1px solid #F3F4F6;padding-top:24px">
            <h4 style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px"><i class="fas fa-folder-tree mr-2" style="color:#2446B8"></i>Empresas en la Instancia Local</h4>
            <div style="font-size:13px;color:#6B7280"><i class="fas fa-spinner fa-spin"></i> Cargando empresas...</div>
          </div>
          
          <div style="margin-top:28px;padding:16px;background:#F9FAFB;border:1px dashed #D1D5DB;border-radius:12px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <h4 style="font-size:13px;font-weight:700;color:#4B5563;margin-bottom:4px"><i class="fas fa-plus-circle mr-2"></i>Aprovisionamiento Multiempresa</h4>
              <p style="font-size:12px;color:#6B7280;margin:0">Crea una nueva base de datos totalmente aislada (nuevo puerto y directorios).</p>
            </div>
            <button class="btn btn-primary" onclick="showCreateCompanyModal()"><i class="fas fa-plus mr-2"></i>Nueva Empresa</button>
          </div>
        </div>
      </div>
      
      <!-- Modal Nueva Empresa Rediseñado Premium -->
      <div id="sa-create-company-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,8,20,0.5);backdrop-filter:blur(8px);z-index:9999;align-items:center;justify-content:center;animation:fadeIn 0.3s ease">
        <div style="background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.08);width:90%;max-width:550px;padding:32px;box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25);animation:slideInUp 0.3s ease">
          
          <!-- Header -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;border-bottom:1px solid #F3F4F6;padding-bottom:16px">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#7F7CFF,#2446B8);display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 10px rgba(36,70,184,0.2)">
              <i class="fas fa-building" style="font-size:18px"></i>
            </div>
            <div>
              <h3 style="font-size:18px;font-weight:800;color:#111827;margin:0">Aprovisionar Empresa</h3>
              <p style="font-size:12px;color:#6B7280;margin:0">Crea una instancia aislada y asocia un Administrador.</p>
            </div>
          </div>

          <!-- Campos de Empresa -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div class="form-group" style="margin:0">
              <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Razón Social</label>
              <input type="text" id="new-comp-name" class="form-input w-full" placeholder="Ej: Mi Empresa S.A.S." style="border-radius:10px;padding:10px 14px">
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">NIT / Identificación</label>
              <input type="text" id="new-comp-nit" class="form-input w-full" placeholder="Ej: 900.123.456-7" style="border-radius:10px;padding:10px 14px">
            </div>
          </div>

          <!-- Color Picker y Vista Previa -->
          <div style="display:grid;grid-template-columns:140px 1fr;gap:16px;margin-bottom:16px;align-items:center">
            <div class="form-group" style="margin:0">
              <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Tema de Marca</label>
              <input type="color" id="new-comp-color" value="#2446B8" class="w-full" style="height:44px;border-radius:10px;border:1px solid #D1D5DB;cursor:pointer;padding:2px" oninput="document.getElementById('new-comp-preview-badge').style.backgroundColor = this.value; document.getElementById('new-comp-preview-stripe').style.backgroundColor = this.value;">
            </div>
            <div id="new-comp-preview-card" style="border:1px solid #E5E7EB;border-radius:12px;background:#F9FAFB;padding:12px;display:flex;align-items:center;gap:12px;height:44px;margin-top:18px">
              <div id="new-comp-preview-stripe" style="width:6px;height:24px;border-radius:3px;background:#2446B8;transition:background 0.2s"></div>
              <div>
                <span id="new-comp-preview-badge" style="font-size:11px;font-weight:700;padding:2px 8px;background:#2446B8;color:white;border-radius:20px;transition:background 0.2s">Previsualizar Marca</span>
              </div>
            </div>
          </div>

          <!-- Credenciales Administrador -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;border-top:1px solid #F3F4F6;padding-top:16px">
            <div class="form-group" style="margin:0">
              <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Clave Administrador</label>
              <input type="password" id="new-comp-admin-pass" class="form-input w-full" placeholder="Mínimo 8 caracteres" style="border-radius:10px;padding:10px 14px">
            </div>
            <div class="form-group" style="margin:0">
              <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Confirmar Clave</label>
              <input type="password" id="new-comp-admin-pass2" class="form-input w-full" placeholder="Repite contraseña" style="border-radius:10px;padding:10px 14px">
            </div>
          </div>

          <!-- Módulos en Cuadrícula Visual -->
          <div class="form-group" style="margin-bottom:20px">
            <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:10px">Módulos Iniciales</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              
              <!-- Card Contabilidad -->
              <div class="sa-module-choice" style="border:2px solid #2446B8;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:#F0F4FF;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="contabilidad" checked style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(36,70,184,0.1);display:flex;align-items:center;justify-content:center;color:#2446B8"><i class="fas fa-calculator"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Contabilidad</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">Balances, facturación, DIAN</p>
                </div>
              </div>

              <!-- Card Comercial -->
              <div class="sa-module-choice" style="border:2px solid #2446B8;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:#F0F4FF;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="comercial" checked style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(12,114,143,0.1);display:flex;align-items:center;justify-content:center;color:#0C728F"><i class="fas fa-store"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Comercial</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">Ventas, compras, POS</p>
                </div>
              </div>

              <!-- Card Nómina -->
              <div class="sa-module-choice" style="border:2px solid #E5E7EB;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:white;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="nomina" style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(127,124,255,0.1);display:flex;align-items:center;justify-content:center;color:#7F7CFF"><i class="fas fa-id-card"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Nómina</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">Empleados, liquidación</p>
                </div>
              </div>

              <!-- Card Copropiedades -->
              <div class="sa-module-choice" style="border:2px solid #E5E7EB;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:white;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="copropiedades" style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(245,158,11,0.1);display:flex;align-items:center;justify-content:center;color:#F59E0B"><i class="fas fa-city"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Copropiedades</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">PH, expensas, cartera</p>
                </div>
              </div>

              <!-- Card NIIF (IFRS) -->
              <div class="sa-module-choice" style="border:2px solid #E5E7EB;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:white;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="niif" style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(36,70,184,0.1);display:flex;align-items:center;justify-content:center;color:#2446B8"><i class="fas fa-scale-balanced"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Normas NIIF</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">Políticas, Arrendamientos NIIF 16</p>
                </div>
              </div>

              <!-- Card Spa Mascotas -->
              <div class="sa-module-choice" style="border:2px solid #E5E7EB;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:white;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="spa" style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(244,63,94,0.1);display:flex;align-items:center;justify-content:center;color:#F43F5E"><i class="fas fa-dog"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Spa Mascotas</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">Veterinaria y peluquería</p>
                </div>
              </div>

              <!-- Card Spa Belleza -->
              <div class="sa-module-choice" style="border:2px solid #E5E7EB;border-radius:12px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;background:white;transition:all 0.2s" onclick="const cb = this.querySelector('input'); cb.checked = !cb.checked; this.style.borderColor = cb.checked ? '#2446B8' : '#E5E7EB'; this.style.backgroundColor = cb.checked ? '#F0F4FF' : 'white';">
                <input type="checkbox" class="new-comp-mod" value="spa-belleza" style="display:none">
                <div style="width:32px;height:32px;border-radius:8px;background:rgba(236,72,153,0.1);display:flex;align-items:center;justify-content:center;color:#EC4899"><i class="fas fa-spa"></i></div>
                <div>
                  <p style="font-size:13px;font-weight:700;margin:0;color:#111827">Spa Belleza</p>
                  <p style="font-size:10px;color:#6B7280;margin:0">Estética y cosmetología humana</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Acciones -->
          <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;border-top:1px solid #F3F4F6;padding-top:16px">
            <button class="btn btn-outline" style="border-radius:10px" onclick="document.getElementById('sa-create-company-modal').style.display='none'">Cancelar</button>
            <button class="btn btn-primary" id="btn-create-company" style="border-radius:10px" onclick="submitCreateCompany()">Crear e Inicializar</button>
          </div>
        </div>
      </div>

      <!-- Modal Eliminar Empresa Rediseñado Premium -->
      <div id="sa-delete-company-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,8,20,0.5);backdrop-filter:blur(8px);z-index:9999;align-items:center;justify-content:center;animation:fadeIn 0.3s ease">
        <div style="background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.08);width:90%;max-width:550px;padding:32px;box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25);animation:slideInUp 0.3s ease">
          
          <!-- Header -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;border-bottom:1px solid #F3F4F6;padding-bottom:16px">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#FCA5A5,#EF4444);display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 10px rgba(239,68,68,0.2)">
              <i class="fas fa-trash-can" style="font-size:18px"></i>
            </div>
            <div>
              <h3 style="font-size:18px;font-weight:800;color:#111827;margin:0">Eliminar Empresa</h3>
              <p style="font-size:12px;color:#EF4444;margin:0;font-weight:700">Esta acción borrará físicamente la base de datos y todos sus datos.</p>
            </div>
          </div>

          <!-- Advertencia Detallada -->
          <div style="padding:16px;background:#FEF2F2;border:1px solid #FEE2E2;border-radius:12px;margin-bottom:20px;font-size:13px;line-height:1.6;color:#991B1B">
            <p style="margin:0 0 8px;font-weight:800"><i class="fas fa-triangle-exclamation mr-1"></i> ADVERTENCIA IRREVERSIBLE</p>
            <p style="margin:0">Esta acción eliminará de forma permanente los archivos físicos de la base de datos de la empresa, todas sus transacciones, usuarios locales, y las cuentas del HUB de aquellos usuarios que pertenezcan únicamente a esta empresa de forma irreversible.</p>
          </div>

          <!-- Campos de Confirmación -->
          <input type="hidden" id="delete-comp-id">
          <input type="hidden" id="delete-comp-nit-val">
          
          <div class="form-group" style="margin-bottom:16px">
            <label class="form-label" id="delete-comp-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Escribe el NIT de la empresa para confirmar</label>
            <input type="text" id="delete-comp-nit-input" class="form-input w-full" placeholder="Ingresa el NIT aquí" style="border-radius:10px;padding:10px 14px">
          </div>
          
          <div class="form-group" style="margin-bottom:20px">
            <label class="form-label" style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px">Escribe la palabra "ELIMINAR" para proceder</label>
            <input type="text" id="delete-comp-confirm-word" class="form-input w-full" placeholder="Escribe ELIMINAR en mayúsculas" style="border-radius:10px;padding:10px 14px">
          </div>

          <!-- Acciones -->
          <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;border-top:1px solid #F3F4F6;padding-top:16px">
            <button class="btn btn-outline" style="border-radius:10px" onclick="document.getElementById('sa-delete-company-modal').style.display='none'">Cancelar</button>
            <button class="btn" id="btn-delete-company-submit" style="border-radius:10px;background:#EF4444;color:white;cursor:pointer" onclick="submitDeleteCompany()">Eliminar Definitivamente</button>
          </div>
        </div>
      </div>

      <div id="sa-tab-licencias" class="sa-tab-content" style="display:none">
        <div style="background:white;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="font-size:16px;font-weight:700;color:#111827">Control de Licencias por Módulo</h3>
            <p style="font-size:13px;color:#6B7280;margin:0">Activa o restringe módulos para esta empresa.</p>
          </div>
          <div id="sa-licenses-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
            <div style="font-size:14px;color:#6B7280"><i class="fas fa-spinner fa-spin"></i> Cargando módulos...</div>
          </div>
        </div>
      </div>

      <div id="sa-tab-sistema" class="sa-tab-content" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
          <div style="background:white;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
            <h3 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:20px"><i class="fas fa-server mr-2" style="color:#7F7CFF"></i>Entorno de Ejecución</h3>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;font-size:13px">
              <li style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #F3F4F6">
                <span style="color:#6B7280">Versión de GRAVY</span>
                <span style="font-weight:700;color:#111827">v2.0 Local</span>
              </li>
              <li style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #F3F4F6">
                <span style="color:#6B7280">Motor de Base de Datos</span>
                <span style="font-weight:700;color:#111827">PocketBase JSVM (v0.23+)</span>
              </li>
              <li style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #F3F4F6">
                <span style="color:#6B7280">Modo de Despliegue</span>
                <span style="font-weight:700;color:#111827">Single-Tenant (On-Premise)</span>
              </li>
              <li style="display:flex;justify-content:space-between">
                <span style="color:#6B7280">URL de la API</span>
                <span style="font-weight:600;color:#2446B8">${esc((window as any).PB_URL || window.location.origin)}</span>
              </li>
            </ul>
          </div>
          
          <div style="background:white;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
            <h3 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:20px"><i class="fas fa-database mr-2" style="color:#10B981"></i>Estado de Base de Datos</h3>
            <div id="sa-db-stats" style="font-size:13px;color:#6B7280"><i class="fas fa-spinner fa-spin"></i> Obteniendo métricas...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab Switching Logic
  container.querySelectorAll('.sa-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = (e.currentTarget as HTMLElement).dataset.tab;
      // Update buttons
      container.querySelectorAll('.sa-tab').forEach(b => {
        (b as HTMLElement).style.color = '#6B7280';
        (b as HTMLElement).style.fontWeight = '600';
        (b as HTMLElement).style.borderBottomColor = 'transparent';
      });
      (e.currentTarget as HTMLElement).style.color = '#2446B8';
      (e.currentTarget as HTMLElement).style.fontWeight = '700';
      (e.currentTarget as HTMLElement).style.borderBottomColor = '#2446B8';
      
      // Update contents
      container.querySelectorAll('.sa-tab-content').forEach(content => {
        (content as HTMLElement).style.display = 'none';
      });
      const tabContent = container.querySelector(`#sa-tab-${target}`);
      if (tabContent) (tabContent as HTMLElement).style.display = 'block';
    });
  });

  // Fetch Data
  await Promise.all([
    _loadSACompany(),
    _loadSALicenses(),
    _loadSADbStats()
  ]);
}

// ==========================================
// DATA LOADERS
// ==========================================

async function _loadSACompany() {
  const container = document.getElementById('sa-company-info');
  if (!container) return;
  
  try {
    const settings = await pb.listAll('settings');
    const map: Record<string, string> = {};
    settings.forEach(s => map[s.key] = s.value);
    
    container.innerHTML = `
      <div style="padding:16px;border:1px solid #E5E7EB;border-radius:12px;background:#F9FAFB">
        <p style="font-size:12px;color:#6B7280;margin-bottom:4px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Razón Social</p>
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0">${esc(map['company_name'] || 'No definida')}</p>
      </div>
      <div style="padding:16px;border:1px solid #E5E7EB;border-radius:12px;background:#F9FAFB">
        <p style="font-size:12px;color:#6B7280;margin-bottom:4px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">NIT / Identificación</p>
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0">${esc(map['company_nit'] || 'No definido')}</p>
      </div>
      <div style="padding:16px;border:1px solid #E5E7EB;border-radius:12px;background:#F9FAFB">
        <p style="font-size:12px;color:#6B7280;margin-bottom:4px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Dirección</p>
        <p style="font-size:14px;font-weight:600;color:#374151;margin:0">${esc(map['company_address'] || 'No definida')}</p>
      </div>
      <div style="padding:16px;border:1px solid #E5E7EB;border-radius:12px;background:#F9FAFB">
        <p style="font-size:12px;color:#6B7280;margin-bottom:4px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Contacto</p>
        <p style="font-size:14px;font-weight:600;color:#374151;margin:0">${esc(map['company_phone'] || '')} <br/> <span style="font-weight:400;color:#6B7280">${esc(map['company_email'] || '')}</span></p>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="grid-column:1/-1;color:#EF4444;font-size:13px">Error al cargar empresa: ${esc(String(err))}</div>`;
  }

  // Cargar empresas registradas en el HUB
  const hubContainer = document.getElementById('sa-hub-companies');
  if (hubContainer) {
    try {
      const hubToken = localStorage.getItem('gravy_hub_token');
      if (!hubToken) throw new Error('No hay sesión en el HUB');
      
      const res = await fetch(`${HUB_URL}/api/hub/my-companies`, {
        headers: { 'Authorization': `Bearer ${hubToken}` }
      });
      if (!res.ok) throw new Error('Error al conectar con el HUB');
      const data = await res.json();
      const companies = data.companies || [];
      
      const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
      if (companies.length === 0) {
        hubContainer.innerHTML = `
          <h4 style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px"><i class="fas fa-folder-tree mr-2" style="color:#2446B8"></i>Empresas en la Instancia Local</h4>
          <div style="font-size:13px;color:#6B7280">No hay otras empresas registradas en este servidor.</div>
        `;
      } else {
        const listHtml = companies.map((c: any) => {
          const isCurrentActive = c.company_id === activeCompany.company_id;
          return `
          <div style="padding:12px;border:1px solid #E5E7EB;border-radius:12px;background:#F9FAFB;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:12px">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:10px;height:10px;border-radius:50%;background-color:${c.company_color}"></div>
              <div>
                <p style="font-size:14px;font-weight:700;color:#111827;margin:0">${esc(c.company_name)}</p>
                <p style="font-size:11px;color:#6B7280;margin:0">URL: <span style="font-mono">${esc(c.company_url)}</span> | Rol: <strong>${esc(c.role.toUpperCase())}</strong></p>
              </div>
            </div>
            ${isCurrentActive ? 
              `<span style="font-size:11px;font-weight:700;padding:4px 10px;background:#ECFDF5;color:#10B981;border-radius:20px"><i class="fas fa-circle-check mr-1"></i>Activa (Actual)</span>` :
              `<button class="btn" style="background:#FEE2E2;color:#EF4444;border:1px solid #FCA5A5;padding:6px 12px;font-size:12px;border-radius:8px;font-weight:700;cursor:pointer" onclick="confirmDeleteCompany('${c.company_id}', '${esc(c.company_name)}', '${esc(c.company_nit || '900000000')}')"><i class="fas fa-trash-can mr-1"></i>Eliminar</button>`
            }
          </div>
          `;
        }).join('');
        
        hubContainer.innerHTML = `
          <h4 style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px"><i class="fas fa-folder-tree mr-2" style="color:#2446B8"></i>Empresas en la Instancia Local</h4>
          <div style="max-height:300px;overflow-y:auto">${listHtml}</div>
        `;
      }
    } catch (err: any) {
      hubContainer.innerHTML = `
        <h4 style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px"><i class="fas fa-folder-tree mr-2" style="color:#2446B8"></i>Empresas en la Instancia Local</h4>
        <div style="font-size:13px;color:#EF4444">Error al cargar directorio del HUB: ${esc(err.message)}</div>
      `;
    }
  }
}

async function _loadSALicenses() {
  const container = document.getElementById('sa-licenses-grid');
  if (!container) return;

  const MODULE_META: Record<string, { label: string; icon: string; color: string }> = {
    core:          { label: 'Core (Base)',   icon: 'fa-cube',       color: '#10B981' },
    contabilidad:  { label: 'Contabilidad',  icon: 'fa-calculator', color: '#2446B8' },
    comercial:     { label: 'Comercial',     icon: 'fa-store',      color: '#0C728F' },
    crm:           { label: 'CRM (Ventas)',  icon: 'fa-funnel-dollar', color: '#EC4899' },
    nomina:        { label: 'Nómina',        icon: 'fa-id-card',    color: '#7F7CFF' },
    copropiedades: { label: 'Copropiedades', icon: 'fa-city',       color: '#F59E0B' },
    inmobiliarias: { label: 'Inmobiliaria',  icon: 'fa-house-chimney-window', color: '#EC4899' },
    logistica:     { label: 'Logística',     icon: 'fa-ship',       color: '#3B82F6' },
    inventarios:   { label: 'Inventarios',   icon: 'fa-warehouse',  color: '#10B981' },
    tesoreria:     { label: 'Tesorería',     icon: 'fa-landmark',   color: '#F59E0B' },
    'tienda-virtual': { label: 'Tienda Virtual', icon: 'fa-basket-shopping', color: '#14B8A6' },
    spa:           { label: 'Spa Mascotas (Veterinaria)', icon: 'fa-dog', color: '#F43F5E' },
    'spa-belleza': { label: 'Spa Belleza Humana',         icon: 'fa-spa', color: '#EC4899' },
    conciliacion:  { label: 'Conciliación Bancaria', icon: 'fa-scale-balanced', color: '#6366F1' },
    niif:          { label: 'Gestión NIIF (IFRS)', icon: 'fa-scale-balanced', color: '#2446B8' },
    activos_fijos: { label: 'Activos Fijos', icon: 'fa-boxes-stacked', color: '#10B981' },
  };

  try {
    const hubToken = localStorage.getItem('gravy_hub_token');
    const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
    if (!hubToken || !activeCompany.company_id) throw new Error('No hay sesión en el HUB');

    const res = await fetch(`${HUB_URL}/api/collections/licenses/records?filter=(company_id='${activeCompany.company_id}')`, {
      headers: { 'Authorization': `Bearer ${hubToken}` }
    });
    const data = await res.json();
    
    // Convert to map
    const licMap: Record<string, any> = {};
    (data.items || []).forEach((m: any) => licMap[m.module_key] = m);

    const ORDER = ['core', 'contabilidad', 'comercial', 'crm', 'nomina', 'copropiedades', 'inmobiliarias', 'logistica', 'inventarios', 'tesoreria', 'tienda-virtual', 'spa', 'spa-belleza', 'conciliacion', 'niif', 'activos_fijos'];
    
    container.innerHTML = ORDER.map(key => {
      const meta = MODULE_META[key];
      if (!meta) return ''; // guard: skip unknown keys
      const lic = licMap[key] || { enabled: false, plan: 'none', expires_at: null };
      const enabled = lic.enabled;
      const isCore = key === 'core';

      return `
        <div style="padding:16px;border:1px solid ${enabled ? meta.color+'40' : '#E5E7EB'};border-radius:12px;background:${enabled ? meta.color+'0A' : '#F9FAFB'};display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:10px;background:${enabled ? meta.color+'20' : '#E5E7EB'};display:flex;align-items:center;justify-content:center;color:${enabled ? meta.color : '#9CA3AF'}">
                <i class="fas ${meta.icon}"></i>
              </div>
              <div>
                <h4 style="font-size:14px;font-weight:700;color:${enabled ? '#111827' : '#6B7280'};margin:0">${esc(meta.label)}</h4>
                <p style="font-size:11px;color:#6B7280;margin:0">Plan: ${esc(lic.plan ? lic.plan.toUpperCase() : 'PERPETUA')}</p>
              </div>
            </div>
            ${isCore ? 
              `<span style="font-size:11px;font-weight:700;color:#10B981;background:#ECFDF5;padding:4px 8px;border-radius:6px">Obligatorio</span>` :
              `<label style="position:relative;display:inline-block;width:40px;height:22px;cursor:pointer">
                 <input type="checkbox" style="opacity:0;width:0;height:0" onchange="saToggleLicense('${key}', this.checked)" ${enabled ? 'checked' : ''}>
                 <span style="position:absolute;inset:0;border-radius:11px;background:${enabled ? meta.color : '#D1D5DB'};transition:.3s"></span>
                 <span style="position:absolute;top:3px;left:${enabled ? '21px' : '3px'};width:16px;height:16px;background:#fff;border-radius:50%;transition:.3s"></span>
               </label>`
            }
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color:#EF4444;font-size:13px">Error al cargar licencias desde el HUB: ${esc(String(err))}</div>`;
  }
}


async function _loadSADbStats() {
  const container = document.getElementById('sa-db-stats');
  if (!container) return;

  try {
    // This is an approximation since we don't have a direct stats endpoint without admin auth, 
    // but we can query counts for main collections to show some activity.
    const collections = ['transactions', 'purchase_invoices', 'inventory_movements', 'third_parties'];
    
    let html = `<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px">`;
    
    for (const col of collections) {
      try {
        const res = await pb.list(col, { page: 1, perPage: 1 });
        html += `
          <li style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #F3F4F6">
            <span style="color:#6B7280;text-transform:capitalize">${col.replace('_', ' ')}</span>
            <span style="font-weight:700;color:#111827">${res.totalItems} registros</span>
          </li>`;
      } catch (_) {
        html += `
          <li style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #F3F4F6">
            <span style="color:#6B7280;text-transform:capitalize">${col.replace('_', ' ')}</span>
            <span style="font-weight:600;color:#EF4444">Sin acceso / No existe</span>
          </li>`;
      }
    }
    html += `</ul>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="color:#EF4444">Error al cargar métricas: ${esc(String(err))}</div>`;
  }
}

async function saToggleLicense(moduleKey: string, enabled: boolean) {
  const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
  const alertText = enabled
    ? `¿Estás seguro de que deseas <strong>habilitar</strong> el módulo <strong>${moduleKey}</strong> para la empresa <strong>${esc(activeCompany.name || '')}</strong> en el HUB?`
    : `¿Estás seguro de que deseas <strong>deshabilitar</strong> el módulo <strong>${moduleKey}</strong> para la empresa <strong>${esc(activeCompany.name || '')}</strong>?<br><br><span style="color:#EF4444;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> ADVERTENCIA:</span> Esto retirará el acceso a este módulo y afectará a todos los usuarios del tenant.`;

  (window as any).confirmDialog(
    `Confirmar licencia HUB: ${moduleKey.toUpperCase()}`,
    alertText,
    async () => {
      try {
        const hubToken = localStorage.getItem('gravy_hub_token');
        if (!hubToken || !activeCompany.company_id) throw new Error('No hay sesión en el HUB');

        const res = await fetch(`${HUB_URL}/api/hub/toggle-license`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hubToken}` },
          body: JSON.stringify({ company_id: activeCompany.company_id, module_key: moduleKey, enabled }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error desconocido del HUB');
        
        showToast(data.message, 'success');
        
        // Update local set
        if (enabled) {
          if (typeof (window as any).enableModule === 'function') {
            (window as any).enableModule(moduleKey);
          } else if (typeof ENABLED_MODULES !== 'undefined') {
            ENABLED_MODULES.add(moduleKey);
          }
          if (!activeCompany.modules) activeCompany.modules = [];
          if (!activeCompany.modules.includes(moduleKey)) activeCompany.modules.push(moduleKey);
        } else {
          if (typeof (window as any).disableModule === 'function') {
            (window as any).disableModule(moduleKey);
          } else if (typeof ENABLED_MODULES !== 'undefined') {
            ENABLED_MODULES.delete(moduleKey);
          }
          if (activeCompany.modules) {
            activeCompany.modules = activeCompany.modules.filter((m: string) => m !== moduleKey);
          }
        }
        
        // Save back to localStorage so it survives reload
        localStorage.setItem('gravy_active_company', JSON.stringify(activeCompany));
        
        // Sincronizar también con la base de datos local del tenant
        try {
          await fetch(
            `${(window as any).PB_URL || window.location.origin}/api/gravy/toggle-license`,
            {
              method:  'POST',
              headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${pb.authToken}`,
              },
              body: JSON.stringify({ module_key: moduleKey, enabled }),
            }
          );
        } catch (_) {}

        if (typeof applyModuleVisibility === 'function') applyModuleVisibility();
        _loadSALicenses();
      } catch (err: any) {
        showToast(err.message, 'error');
        _loadSALicenses(); // revert toggle
      }
    },
    !enabled
  );

  // Revertir visualmente el toggle mientras se espera confirmación
  _loadSALicenses();
}

// Global Exports
(window as any).renderSuperadmin = renderSuperadmin;
(window as any).saToggleLicense = saToggleLicense;

(window as any).showCreateCompanyModal = function() {
  const modal = document.getElementById('sa-create-company-modal');
  if (modal) modal.style.display = 'flex';
};

(window as any).submitCreateCompany = async function() {
  const name = (document.getElementById('new-comp-name') as HTMLInputElement).value;
  const nit = (document.getElementById('new-comp-nit') as HTMLInputElement).value;
  const color = (document.getElementById('new-comp-color') as HTMLInputElement).value;
  const password = (document.getElementById('new-comp-admin-pass') as HTMLInputElement).value;
  const passwordConfirm = (document.getElementById('new-comp-admin-pass2') as HTMLInputElement).value;
  
  const modules: string[] = [];
  document.querySelectorAll('.new-comp-mod:checked').forEach(cb => {
    modules.push((cb as HTMLInputElement).value);
  });
  modules.push('core');

  if (!name.trim()) {
    showToast('La Razón Social es obligatoria.', 'warning');
    return;
  }

  if (!password) {
    showToast('La contraseña del administrador es obligatoria.', 'warning');
    return;
  }

  if (password.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres.', 'warning');
    return;
  }

  if (password !== passwordConfirm) {
    showToast('Las contraseñas no coinciden.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-create-company') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creando... (Esto puede tomar unos segundos)';

  try {
    const res = await fetch(`${HUB_URL}/api/hub/create-company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('gravy_hub_token')}`
      },
      body: JSON.stringify({ name, nit, color, password, modules })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error desconocido');
    }

    showToast('Empresa creada e inicializada exitosamente. Ya puedes acceder a ella desde el selector global.', 'success');
    document.getElementById('sa-create-company-modal')!.style.display = 'none';
    
    // Limpiar campos
    (document.getElementById('new-comp-name') as HTMLInputElement).value = '';
    (document.getElementById('new-comp-nit') as HTMLInputElement).value = '';
    (document.getElementById('new-comp-admin-pass') as HTMLInputElement).value = '';
    (document.getElementById('new-comp-admin-pass2') as HTMLInputElement).value = '';
    
    const activeTabBtn = document.querySelector('.sa-tab.active') as HTMLElement;
    if (activeTabBtn) activeTabBtn.click();

  } catch (err: any) {
    showToast('Error al crear la empresa: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Crear e Inicializar';
  }
};

(window as any).confirmDeleteCompany = function(companyId: string, name: string, nit: string) {
  const modal = document.getElementById('sa-delete-company-modal');
  if (!modal) return;
  
  (document.getElementById('delete-comp-id') as HTMLInputElement).value = companyId;
  (document.getElementById('delete-comp-nit-val') as HTMLInputElement).value = nit;
  (document.getElementById('delete-comp-nit-input') as HTMLInputElement).value = '';
  (document.getElementById('delete-comp-confirm-word') as HTMLInputElement).value = '';
  
  const label = document.getElementById('delete-comp-label');
  if (label) {
    label.innerHTML = `Escribe el NIT de la empresa <strong>"${esc(name)}"</strong> para confirmar: <br><span style="color:#6B7280;text-transform:none">NIT a escribir: <strong>${esc(nit)}</strong></span>`;
  }
  
  modal.style.display = 'flex';
};

(window as any).submitDeleteCompany = async function() {
  const companyId = (document.getElementById('delete-comp-id') as HTMLInputElement).value;
  const targetNit = (document.getElementById('delete-comp-nit-val') as HTMLInputElement).value;
  const typedNit = (document.getElementById('delete-comp-nit-input') as HTMLInputElement).value;
  const typedConfirmWord = (document.getElementById('delete-comp-confirm-word') as HTMLInputElement).value;

  if (typedNit.trim() !== targetNit.trim()) {
    showToast('El NIT ingresado no coincide con el de la empresa.', 'warning');
    return;
  }

  if (typedConfirmWord.trim() !== 'ELIMINAR') {
    showToast('Debes escribir la palabra ELIMINAR en mayúsculas.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-delete-company-submit') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Eliminando...';

  try {
    const res = await fetch(`${HUB_URL}/api/hub/delete-company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('gravy_hub_token')}`
      },
      body: JSON.stringify({ company_id: companyId })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error desconocido');
    }

    showToast('La empresa y sus recursos han sido eliminados por completo.', 'success');
    document.getElementById('sa-delete-company-modal')!.style.display = 'none';
    
    // Recargar pestaña activa
    const activeTabBtn = document.querySelector('.sa-tab.active') as HTMLElement;
    if (activeTabBtn) activeTabBtn.click();

  } catch (err: any) {
    showToast('Error al eliminar la empresa: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Eliminar Definitivamente';
  }
};
