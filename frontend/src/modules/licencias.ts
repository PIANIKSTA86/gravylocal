/**
 * GRAVY v2.0 — licencias.ts
 * Panel de administración de módulos y licencias.
 * Solo accesible para usuarios con rol "admin".
 */

'use strict';

async function renderLicencias(container: HTMLElement): Promise<void> {
  if (!container) return;

  // Solo admin puede acceder
  const role = pb?.currentUser?.role ?? 'viewer';
  if (role !== 'admin') {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center anim-fade" style="min-height:60vh;gap:16px">
        <i class="fas fa-shield-halved" style="font-size:40px;color:#EF4444"></i>
        <p class="font-bold" style="color:#374151">Acceso restringido</p>
        <p class="text-sm" style="color:#9CA3AF">Esta sección es solo para administradores del sistema.</p>
        <button class="btn btn-outline" onclick="navigate('dashboard')"><i class="fas fa-house"></i> Volver</button>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="anim-slide-up" id="licencias-root">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <h2 style="font-size:20px;font-weight:800;color:#0B1635;margin-bottom:4px">
          <i class="fas fa-key mr-2" style="color:#7F7CFF"></i>Licencias y Módulos
        </h2>
        <p style="font-size:13px;color:#61708F">
          Activa o desactiva los módulos disponibles en esta instalación de GRAVY.
        </p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="renderLicencias(document.getElementById('page-content'))">
        <i class="fas fa-rotate-right"></i> Actualizar
      </button>
    </div>

    <!-- Cargando -->
    <div id="lic-loading" style="display:flex;align-items:center;gap:10px;padding:20px;color:#6B7280;font-size:14px">
      <div class="loader-ring" style="width:24px;height:24px;border-width:3px"></div>
      Cargando módulos...
    </div>

    <!-- Grid de módulos -->
    <div id="lic-grid" style="display:none;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px"></div>

    <!-- Info adicional -->
    <div id="lic-info" style="display:none;margin-top:28px;padding:18px 22px;border-radius:14px;background:#F8FAFF;border:1px solid var(--border-soft)">
      <h4 style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px">
        <i class="fas fa-circle-info mr-2" style="color:#2446B8"></i>Información sobre el sistema de módulos
      </h4>
      <ul style="font-size:13px;color:#61708F;line-height:1.9;padding-left:18px">
        <li>Los módulos <strong>Core</strong> siempre están activos y no pueden deshabilitarse.</li>
        <li>Deshabilitar un módulo oculta sus funciones del menú y bloquea el acceso a la API.</li>
        <li>Los cambios se aplican al próximo inicio de sesión de los usuarios.</li>
        <li>Para una gestión avanzada de licencias contacta a soporte GRAVY.</li>
      </ul>
    </div>
  </div>`;

  await _loadLicenciasData(container);
}

async function _loadLicenciasData(container: HTMLElement): Promise<void> {
  const loading = container.querySelector('#lic-loading') as HTMLElement;
  const grid    = container.querySelector('#lic-grid') as HTMLElement;
  const info    = container.querySelector('#lic-info') as HTMLElement;

  // Definición visual de módulos (orden y metadatos)
  const MODULE_META: Record<string, {
    label: string; icon: string; color: string;
    description: string; pages: string[];
  }> = {
    core: {
      label:       'Core (Base)',
      icon:        'fa-cube',
      color:       '#10B981',
      description: 'Dashboard, configuración, usuarios, terceros, plan de cuentas. Siempre activo.',
      pages:       ['Dashboard', 'Configuración', 'Usuarios', 'Plan de Cuentas', 'Terceros', 'Tipos de Tx', 'Auditoría'],
    },
    contabilidad: {
      label:       'Contabilidad',
      icon:        'fa-calculator',
      color:       '#2446B8',
      description: 'Módulo contable completo para operaciones diarias y reportes financieros.',
      pages:       ['Consulta Tx', 'Reportes', 'Cierre Contable', 'Facturación DIAN', 'Exógena', 'Utilidades'],
    },
    comercial: {
      label:       'Comercial',
      icon:        'fa-store',
      color:       '#0C728F',
      description: 'Ciclo comercial completo: ventas, compras, inventario, POS y tesorería.',
      pages:       ['Ventas', 'Compras', 'Inventario', 'POS', 'Tesorería', 'Conciliación Bancaria'],
    },
    nomina: {
      label:       'Nómina',
      icon:        'fa-id-card',
      color:       '#7F7CFF',
      description: 'Liquidación de nómina, prestaciones sociales, aportes parafiscales.',
      pages:       ['Nómina', 'Liquidaciones', 'Nómina Electrónica'],
    },
    copropiedades: {
      label:       'Copropiedades',
      icon:        'fa-city',
      color:       '#F59E0B',
      description: 'Administración de propiedad horizontal: cuotas, propietarios, informes.',
      pages:       ['Copropiedades', 'Propietarios', 'Cuotas PH'],
    },
  };

  try {
    // Cargar licencias desde el backend
    const res = await fetch(
      `${(window as any).PB_URL || window.location.origin}/api/gravy/my-licenses`,
      { headers: pb.authToken ? { 'Authorization': `Bearer ${pb.authToken}` } : {} }
    );
    const data = await res.json();

    // Construir mapa module_key → estado
    const licMap: Record<string, { enabled: boolean; plan: string; expires_at: string | null }> = {};
    for (const m of (data.modules || [])) {
      licMap[m.module_key] = { enabled: true, plan: m.plan || 'perpetua', expires_at: m.expires_at };
    }

    // Obtener lista completa de licencias (para ver también las deshabilitadas)
    let allLicenses: any[] = [];
    try {
      const full = await pb.list('licenses', { perPage: 50 });
      allLicenses = full.items || [];
      for (const lic of allLicenses) {
        if (!licMap[lic.module_key]) {
          licMap[lic.module_key] = {
            enabled: lic.enabled ?? false,
            plan: lic.plan || 'perpetua',
            expires_at: lic.expires_at || null,
          };
        }
      }
    } catch (_) {}

    // Renderizar grid
    if (loading) loading.style.display = 'none';
    if (grid)    grid.style.display    = 'grid';
    if (info)    info.style.display    = 'block';

    const ORDER = ['core', 'contabilidad', 'comercial', 'nomina', 'copropiedades'];
    grid.innerHTML = ORDER.map(key => {
      const meta    = MODULE_META[key];
      if (!meta) return '';
      const lic     = licMap[key];
      const enabled = lic?.enabled ?? false;
      const isCore  = key === 'core';
      const plan    = lic?.plan || 'perpetua';
      const expires = lic?.expires_at || null;

      const planColors: Record<string, string> = {
        trial: '#F59E0B', mensual: '#2446B8', anual: '#10B981', perpetua: '#7F7CFF',
      };

      return `
        <div class="stat-card" style="border-radius:16px;padding:0;overflow:hidden;border:1.5px solid ${enabled ? meta.color + '33' : '#E5E7EB'}">
          <!-- Header de color -->
          <div style="
            height:6px;
            background:${enabled
              ? `linear-gradient(90deg,${meta.color},${meta.color}99)`
              : 'linear-gradient(90deg,#D1D5DB,#E5E7EB)'};
          "></div>

          <div style="padding:20px 22px">
            <!-- Icono + título + toggle -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="
                  width:44px;height:44px;border-radius:14px;flex-shrink:0;
                  background:${enabled ? meta.color + '1A' : '#F3F4F6'};
                  display:flex;align-items:center;justify-content:center">
                  <i class="fas ${meta.icon}" style="font-size:18px;color:${enabled ? meta.color : '#9CA3AF'}"></i>
                </div>
                <div>
                  <h3 style="font-size:15px;font-weight:800;color:${enabled ? '#0B1635' : '#9CA3AF'}">
                    ${esc(meta.label)}
                  </h3>
                  <span style="
                    font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;
                    background:${(planColors[plan] || '#6B7280') + '1A'};
                    color:${planColors[plan] || '#6B7280'}">
                    ${plan.toUpperCase()}${expires ? ` · ${expires.substring(0, 10)}` : ''}
                  </span>
                </div>
              </div>

              <!-- Toggle switch -->
              ${isCore
                ? `<span style="font-size:11px;color:#10B981;font-weight:700;padding:4px 10px;
                   background:#ECFDF5;border-radius:20px">
                   <i class="fas fa-lock-open mr-1"></i>Siempre activo</span>`
                : `<label style="position:relative;display:inline-block;width:46px;height:26px;cursor:pointer">
                   <input type="checkbox" style="opacity:0;width:0;height:0"
                     id="toggle-${key}"
                     ${enabled ? 'checked' : ''}
                     onchange="toggleLicense('${key}', this.checked)">
                   <span style="
                     position:absolute;inset:0;border-radius:13px;transition:.3s;
                     background:${enabled ? meta.color : '#D1D5DB'};
                     box-shadow:${enabled ? `0 0 12px ${meta.color}55` : 'none'}">
                   </span>
                   <span style="
                     position:absolute;top:3px;left:${enabled ? '23px' : '3px'};
                     width:20px;height:20px;background:#fff;border-radius:50%;
                     transition:.3s;box-shadow:0 1px 4px rgba(0,0,0,.2)">
                   </span>
                 </label>`
              }
            </div>

            <!-- Descripción -->
            <p style="font-size:12px;color:#61708F;line-height:1.6;margin-bottom:14px">
              ${esc(meta.description)}
            </p>

            <!-- Páginas incluidas -->
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${meta.pages.map(p =>
                `<span style="
                  font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;
                  background:${enabled ? '#F0F9FF' : '#F9FAFB'};
                  color:${enabled ? '#0C728F' : '#9CA3AF'};
                  border:1px solid ${enabled ? '#BAE6FD' : '#E5E7EB'}">
                  ${esc(p)}
                </span>`
              ).join('')}
            </div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    if (loading) loading.style.display = 'none';
    if (grid) {
      grid.style.display = 'block';
      grid.innerHTML = `
        <div style="padding:20px;text-align:center;color:#EF4444">
          <i class="fas fa-circle-exclamation" style="font-size:24px;margin-bottom:8px;display:block"></i>
          Error al cargar licencias: ${esc(String(err))}
        </div>`;
    }
  }
}

/** Habilitar/deshabilitar un módulo desde el toggle */
async function toggleLicense(moduleKey: string, enabled: boolean): Promise<void> {
  const toggle = document.getElementById(`toggle-${moduleKey}`) as HTMLInputElement | null;
  if (toggle) toggle.disabled = true;

  try {
    const res = await fetch(
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error desconocido');

    showToast(data.message, 'success');

    // Recargar licencias en memoria y reaplicar visibilidad del sidebar
    if (typeof loadLicenses === 'function')           await loadLicenses();
    if (typeof applyModuleVisibility === 'function')  applyModuleVisibility();

    // Re-renderizar el panel para reflejar el nuevo estado con animación
    setTimeout(() => renderLicencias(document.getElementById('page-content') as HTMLElement), 300);
  } catch (err: any) {
    showToast(err.message || 'No se pudo actualizar la licencia', 'error');
    // Revertir el toggle visualmente
    if (toggle) { toggle.checked = !enabled; toggle.disabled = false; }
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderLicencias   = renderLicencias;
(window as any).toggleLicense     = toggleLicense;
