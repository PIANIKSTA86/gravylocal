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
        <button class="sa-tab" data-tab="usuarios" style="padding:12px 20px;font-weight:600;font-size:14px;color:#6B7280;border-bottom:3px solid transparent;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer"><i class="fas fa-users mr-2"></i>Usuarios</button>
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
          
          <div style="margin-top:24px;padding:16px;background:#F9FAFB;border:1px dashed #D1D5DB;border-radius:12px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <h4 style="font-size:13px;font-weight:700;color:#4B5563;margin-bottom:4px"><i class="fas fa-plus-circle mr-2"></i>Aprovisionamiento Multiempresa</h4>
              <p style="font-size:12px;color:#6B7280;margin:0">Crea una nueva base de datos totalmente aislada (nuevo puerto y directorios).</p>
            </div>
            <button class="btn btn-primary" onclick="showCreateCompanyModal()"><i class="fas fa-plus mr-2"></i>Nueva Empresa</button>
          </div>
        </div>
      </div>
      
      <!-- Modal Nueva Empresa -->
      <div id="sa-create-company-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center">
        <div style="background:white;border-radius:16px;width:90%;max-width:500px;padding:24px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:16px">Crear Nueva Empresa</h3>
          <div class="form-group">
            <label>Razón Social</label>
            <input type="text" id="new-comp-name" class="input w-full" placeholder="Ej: Mi Empresa S.A.S.">
          </div>
          <div class="form-group">
            <label>NIT</label>
            <input type="text" id="new-comp-nit" class="input w-full" placeholder="Opcional">
          </div>
          <div class="form-group">
            <label>Color Distintivo</label>
            <input type="color" id="new-comp-color" value="#2446B8" class="w-full" style="height:40px;border-radius:8px;border:1px solid #D1D5DB">
          </div>
          <div class="form-group">
            <label>Módulos Iniciales</label>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">
              <label><input type="checkbox" class="new-comp-mod" value="contabilidad" checked> Contabilidad</label>
              <label><input type="checkbox" class="new-comp-mod" value="comercial" checked> Comercial</label>
              <label><input type="checkbox" class="new-comp-mod" value="nomina"> Nómina</label>
              <label><input type="checkbox" class="new-comp-mod" value="copropiedades"> Copropiedades</label>
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px">
            <button class="btn btn-outline" onclick="document.getElementById('sa-create-company-modal').style.display='none'">Cancelar</button>
            <button class="btn btn-primary" id="btn-create-company" onclick="submitCreateCompany()">Crear e Inicializar</button>
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

      <div id="sa-tab-usuarios" class="sa-tab-content" style="display:none">
        <div style="background:white;border:1px solid #E5E7EB;border-radius:16px;padding:24px">
          <h3 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:20px">Directorio de Usuarios de la Instancia</h3>
          <div class="table-responsive">
            <table class="table w-full">
              <thead>
                <tr>
                  <th style="text-align:left;padding:12px">Usuario</th>
                  <th style="text-align:left;padding:12px">Email</th>
                  <th style="text-align:left;padding:12px">Rol</th>
                  <th style="text-align:center;padding:12px">Estado</th>
                  <th style="text-align:right;padding:12px">Creado</th>
                </tr>
              </thead>
              <tbody id="sa-users-table">
                <tr><td colspan="5" style="text-align:center;padding:20px;color:#6B7280"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</td></tr>
              </tbody>
            </table>
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
    _loadSAUsers(),
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
    const settings = await pb.collection('settings').getFullList();
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
}

async function _loadSALicenses() {
  const container = document.getElementById('sa-licenses-grid');
  if (!container) return;

  const MODULE_META: Record<string, { label: string; icon: string; color: string }> = {
    core:          { label: 'Core (Base)',   icon: 'fa-cube',       color: '#10B981' },
    contabilidad:  { label: 'Contabilidad',  icon: 'fa-calculator', color: '#2446B8' },
    comercial:     { label: 'Comercial',     icon: 'fa-store',      color: '#0C728F' },
    nomina:        { label: 'Nómina',        icon: 'fa-id-card',    color: '#7F7CFF' },
    copropiedades: { label: 'Copropiedades', icon: 'fa-city',       color: '#F59E0B' },
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

    const ORDER = ['core', 'contabilidad', 'comercial', 'nomina', 'copropiedades'];
    
    container.innerHTML = ORDER.map(key => {
      const meta = MODULE_META[key];
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

async function _loadSAUsers() {
  const table = document.getElementById('sa-users-table');
  if (!table) return;

  try {
    const res = await pb.collection('users').getList(1, 50, { sort: '-created' });
    
    table.innerHTML = res.items.map(u => {
      const roleColor = u.role === 'superadmin' ? '#7F7CFF' : (u.role === 'admin' ? '#2446B8' : '#6B7280');
      const roleBg = u.role === 'superadmin' ? '#EEEDFF' : (u.role === 'admin' ? '#EFF2FB' : '#F3F4F6');
      
      return `
        <tr style="border-bottom:1px solid #F3F4F6">
          <td style="padding:12px;font-size:13px">
            <div style="font-weight:600;color:#111827">${esc(u.full_name || 'Sin nombre')}</div>
          </td>
          <td style="padding:12px;font-size:13px;color:#6B7280">${esc(u.email)}</td>
          <td style="padding:12px;font-size:13px">
            <span style="background:${roleBg};color:${roleColor};padding:4px 10px;border-radius:20px;font-weight:700;font-size:11px;text-transform:uppercase">
              ${esc(u.role || 'viewer')}
            </span>
          </td>
          <td style="padding:12px;text-align:center">
            <span style="background:${u.active ? '#ECFDF5' : '#FEF2F2'};color:${u.active ? '#10B981' : '#EF4444'};padding:4px 10px;border-radius:20px;font-weight:600;font-size:11px">
              ${u.active ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td style="padding:12px;font-size:12px;color:#9CA3AF;text-align:right">
            ${new Date(u.created).toLocaleDateString()}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    table.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#EF4444;padding:20px">Error al cargar usuarios: ${esc(String(err))}</td></tr>`;
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
        const res = await pb.collection(col).getList(1, 1, { $cancelKey: col });
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
  try {
    const hubToken = localStorage.getItem('gravy_hub_token');
    const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
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
      ENABLED_MODULES.add(moduleKey);
      if (!activeCompany.modules) activeCompany.modules = [];
      if (!activeCompany.modules.includes(moduleKey)) activeCompany.modules.push(moduleKey);
    } else {
      ENABLED_MODULES.delete(moduleKey);
      if (activeCompany.modules) {
        activeCompany.modules = activeCompany.modules.filter((m: string) => m !== moduleKey);
      }
    }
    
    // Save back to localStorage so it survives reload
    localStorage.setItem('gravy_active_company', JSON.stringify(activeCompany));
    
    if (typeof applyModuleVisibility === 'function') applyModuleVisibility();
    // Refresh tab
    _loadSALicenses();
  } catch (err: any) {
    showToast(err.message, 'error');
    _loadSALicenses(); // revert toggle
  }
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
  
  const modules: string[] = [];
  document.querySelectorAll('.new-comp-mod:checked').forEach(cb => {
    modules.push((cb as HTMLInputElement).value);
  });
  modules.push('core');

  if (!name.trim()) {
    alert('La Raz�n Social es obligatoria.');
    return;
  }

  const btn = document.getElementById('btn-create-company') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<i class=""fas fa-spinner fa-spin mr-2""></i> Creando... (Esto puede tomar unos segundos)';

  try {
    const res = await fetch(`${HUB_URL}/api/hub/create-company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('gravy_hub_token')}`
      },
      body: JSON.stringify({ name, nit, color, modules })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error desconocido');
    }

    alert('Empresa creada e inicializada exitosamente. Ya puedes acceder a ella desde el selector global.');
    document.getElementById('sa-create-company-modal')!.style.display = 'none';
    
    const activeTabBtn = document.querySelector('.sa-tab.active') as HTMLElement;
    if (activeTabBtn) activeTabBtn.click();

  } catch (err) {
    alert('Error al crear la empresa: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Crear e Inicializar';
  }
};
