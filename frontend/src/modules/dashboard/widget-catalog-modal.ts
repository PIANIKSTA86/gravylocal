/**
 * GRAVY v2.0 — widget-catalog-modal.ts
 *
 * Modal interactivo de la Biblioteca de Indicadores.
 * Permite al usuario buscar, activar/desactivar y personalizar qué widgets
 * visualizar en su dashboard principal con total independencia.
 */
'use strict';

import { WIDGET_REGISTRY, getDefaultWidgetsForRole } from './widget-registry';

export interface CatalogModalOptions {
  activeWidgetIds: string[];
  userRole: string;
  onSave: (updatedIds: string[]) => void;
  onResetToRole: () => void;
}

export function openWidgetCatalogModal(options: CatalogModalOptions): void {
  const { activeWidgetIds, userRole, onSave, onResetToRole } = options;

  // Estado local temporal de selección
  let selectedSet = new Set<string>(activeWidgetIds);
  let activeTab: string = 'all';
  let searchQuery: string = '';

  // Contenedor modal
  let modalRoot = document.getElementById('widget-catalog-modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'widget-catalog-modal-root';
    document.body.appendChild(modalRoot);
  }

  const renderModalContent = () => {
    if (!modalRoot) return;

    const allWidgets = Object.values(WIDGET_REGISTRY);

    // Filtrar según pestaña y búsqueda
    const filteredWidgets = allWidgets.filter(w => {
      const matchCat = activeTab === 'all' || w.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const categories = [
      { id: 'all', label: 'Todos los Indicadores', icon: 'fa-layer-group' },
      { id: 'admin', label: 'Administración', icon: 'fa-briefcase' },
      { id: 'contabilidad', label: 'Contabilidad & Fiscal', icon: 'fa-scale-balanced' },
      { id: 'inventarios', label: 'Inventarios & Almacén', icon: 'fa-boxes-stacked' },
      { id: 'nomina', label: 'Nómina & RRHH', icon: 'fa-users-gear' },
      { id: 'dian', label: 'Facturación DIAN', icon: 'fa-file-invoice' },
      { id: 'pos', label: 'Punto de Venta POS', icon: 'fa-cash-register' },
      { id: 'compras', label: 'Compras & Proveedores', icon: 'fa-cart-shopping' },
      { id: 'importaciones', label: 'Comercio Exterior', icon: 'fa-ship' },
      { id: 'general', label: 'Operaciones', icon: 'fa-chart-pie' }
    ];

    modalRoot.innerHTML = `
      <div style="
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(15,23,42,.65); backdrop-filter: blur(5px);
        display: flex; align-items: center; justify-content: center;
        padding: 16px; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      ">
        <div class="anim-slide-up" style="
          background: #FFFFFF; border-radius: 20px;
          width: 100%; max-width: 860px; max-height: 90vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(15,23,42,.25);
          border: 1px solid #E2E8F0;
        ">
          <!-- CABECERA -->
          <div style="padding: 20px 24px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; background: #F8FAFC">
            <div>
              <h2 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 4px; display: flex; align-items: center; gap: 8px">
                <span style="width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#6366F1,#4F46E5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px">
                  <i class="fas fa-shapes"></i>
                </span>
                Biblioteca de Indicadores y Widgets
              </h2>
              <p style="font-size: 12px; color: #64748B; margin: 0">
                Selecciona los KPIs y gráficos que deseas tener visibles en tu dashboard principal.
              </p>
            </div>
            <button id="btn-close-widget-modal" style="
              width: 32px; height: 32px; border-radius: 8px; border: 1px solid #E2E8F0;
              background: #fff; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center;
              transition: all .15s; font-size: 14px;
            " onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='#fff'">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <!-- BUSCADOR & FILTROS -->
          <div style="padding: 16px 24px 12px; border-bottom: 1px solid #F1F5F9; background: #fff">
            <!-- Buscador -->
            <div style="position: relative; margin-bottom: 14px">
              <i class="fas fa-magnifying-glass" style="position: absolute; left: 14px; top: 12px; color: #94A3B8; font-size: 13px"></i>
              <input id="widget-search-input" type="text" placeholder="Buscar indicador por nombre o función..." value="${searchQuery}" style="
                width: 100%; padding: 9px 14px 9px 38px; border-radius: 10px; border: 1px solid #CBD5E1;
                font-size: 13px; color: #1E293B; outline: none; transition: border-color .15s;
              " onfocus="this.style.borderColor='#6366F1'" onblur="this.style.borderColor='#CBD5E1'" />
            </div>

            <!-- Pestañas de categorías -->
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px">
              ${categories.map(cat => `
                <button class="cat-tab-btn" data-cat="${cat.id}" style="
                  display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px;
                  font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid ${activeTab === cat.id ? '#6366F1' : '#E2E8F0'};
                  background: ${activeTab === cat.id ? '#6366F1' : '#F8FAFC'};
                  color: ${activeTab === cat.id ? '#fff' : '#64748B'};
                  white-space: nowrap; transition: all .15s;
                ">
                  <i class="fas ${cat.icon}" style="font-size: 11px"></i>
                  ${cat.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- LISTA DE WIDGETS -->
          <div style="padding: 20px 24px; overflow-y: auto; flex: 1; background: #FAFAFA">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px">
              ${filteredWidgets.map(w => {
                const isSelected = selectedSet.has(w.id);
                return `
                  <div style="
                    background: #fff; border-radius: 14px; padding: 16px;
                    border: 1.5px solid ${isSelected ? '#6366F1' : '#E2E8F0'};
                    box-shadow: ${isSelected ? '0 4px 14px rgba(99,102,241,.12)' : '0 1px 3px rgba(15,23,42,.03)'};
                    display: flex; flex-direction: column; justify-content: space-between; gap: 12px;
                    transition: all .2s; position: relative;
                  ">
                    <div>
                      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px">
                        <div style="
                          width: 36px; height: 36px; border-radius: 10px;
                          background: ${isSelected ? 'rgba(99,102,241,.12)' : '#F1F5F9'};
                          color: ${isSelected ? '#4F46E5' : '#64748B'};
                          display: flex; align-items: center; justify-content: center; font-size: 15px;
                        ">
                          <i class="fas ${w.icon}"></i>
                        </div>
                        <span style="
                          font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px;
                          background: #F1F5F9; color: #475569; text-transform: uppercase;
                        ">
                          ${w.categoryLabel}
                        </span>
                      </div>
                      <h4 style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 0 0 4px">
                        ${w.title}
                      </h4>
                      <p style="font-size: 11px; color: #64748B; margin: 0; line-height: 1.4">
                        ${w.description}
                      </p>
                    </div>

                    <!-- Switch Toggle -->
                    <div style="
                      display: flex; align-items: center; justify-content: space-between;
                      padding-top: 10px; border-top: 1px solid #F1F5F9;
                    ">
                      <span style="font-size: 11px; font-weight: 700; color: ${isSelected ? '#4F46E5' : '#94A3B8'}">
                        ${isSelected ? 'Visible en panel' : 'Oculto'}
                      </span>
                      <label style="position: relative; display: inline-block; width: 38px; height: 20px; cursor: pointer">
                        <input type="checkbox" class="widget-toggle" data-id="${w.id}" ${isSelected ? 'checked' : ''} style="opacity: 0; width: 0; height: 0" />
                        <span style="
                          position: absolute; cursor: pointer; inset: 0; border-radius: 20px;
                          background-color: ${isSelected ? '#6366F1' : '#CBD5E1'};
                          transition: .2s;
                        ">
                          <span style="
                            position: absolute; content: ''; height: 14px; width: 14px; left: ${isSelected ? '21px' : '3px'}; bottom: 3px;
                            background-color: white; border-radius: 50%; transition: .2s;
                          "></span>
                        </span>
                      </label>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            ${filteredWidgets.length === 0 ? `
              <div style="text-align: center; padding: 40px 20px; color: #94A3B8">
                <i class="fas fa-filter" style="font-size: 28px; margin-bottom: 10px; opacity: .5"></i>
                <p style="font-size: 13px; font-weight: 600; margin: 0">No se encontraron indicadores con los filtros seleccionados.</p>
              </div>
            ` : ''}
          </div>

          <!-- PIE DE ACCIONES -->
          <div style="
            padding: 16px 24px; border-top: 1px solid #E2E8F0; background: #fff;
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
          ">
            <button id="btn-reset-role" style="
              display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px;
              background: #F1F5F9; color: #475569; font-size: 12px; font-weight: 700; border: 1px solid #E2E8F0;
              cursor: pointer; transition: all .15s;
            " onmouseover="this.style.background='#E2E8F0'" onmouseout="this.style.background='#F1F5F9'">
              <i class="fas fa-rotate-left"></i>
              Restablecer plantilla de mi perfil (${userRole || 'rol'})
            </button>

            <div style="display: flex; align-items: center; gap: 8px">
              <span style="font-size: 12px; color: #64748B; font-weight: 600; margin-right: 6px">
                ${selectedSet.size} ${selectedSet.size === 1 ? 'indicador activo' : 'indicadores activos'}
              </span>
              <button id="btn-cancel-widget-modal" style="
                padding: 9px 16px; border-radius: 10px; background: #fff; border: 1px solid #CBD5E1;
                color: #475569; font-size: 12px; font-weight: 700; cursor: pointer;
              ">
                Cancelar
              </button>
              <button id="btn-save-widgets" style="
                display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px;
                background: linear-gradient(135deg,#6366F1,#4F46E5); color: #fff; border: none;
                font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(99,102,241,.3);
              ">
                <i class="fas fa-check"></i>
                Aplicar al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('btn-close-widget-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-widget-modal')?.addEventListener('click', closeModal);

    // Búsqueda
    const searchInput = document.getElementById('widget-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (ev: any) => {
        searchQuery = ev.target.value;
        renderModalContent();
        // Mantener foco en el input tras re-renderizar
        const newEl = document.getElementById('widget-search-input') as HTMLInputElement;
        if (newEl) {
          newEl.focus();
          newEl.setSelectionRange(newEl.value.length, newEl.value.length);
        }
      });
    }

    // Tabs
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', (ev: any) => {
        activeTab = ev.currentTarget.getAttribute('data-cat') || 'all';
        renderModalContent();
      });
    });

    // Toggles de selección
    document.querySelectorAll('.widget-toggle').forEach(chk => {
      chk.addEventListener('change', (ev: any) => {
        const id = ev.target.getAttribute('data-id');
        if (ev.target.checked) {
          selectedSet.add(id);
        } else {
          selectedSet.delete(id);
        }
        renderModalContent();
      });
    });

    // Resetear a plantilla de rol
    document.getElementById('btn-reset-role')?.addEventListener('click', () => {
      selectedSet = new Set(getDefaultWidgetsForRole(userRole));
      renderModalContent();
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast('Plantilla por defecto cargada', 'info');
      }
    });

    // Guardar
    document.getElementById('btn-save-widgets')?.addEventListener('click', () => {
      if (selectedSet.size === 0) {
        if (typeof (window as any).showToast === 'function') {
          (window as any).showToast('Debes seleccionar al menos un indicador para tu dashboard.', 'warning');
        }
        return;
      }
      onSave(Array.from(selectedSet));
      closeModal();
    });
  };

  const closeModal = () => {
    if (modalRoot) {
      modalRoot.innerHTML = '';
    }
  };

  renderModalContent();
}
