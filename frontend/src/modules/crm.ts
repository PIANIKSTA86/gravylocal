/**
 * GRAVY v2.0 — crm.ts
 * Módulo de Seguimiento de Ventas (CRM).
 * Tablero Kanban dinámico para el control del embudo de ventas.
 */

'use strict';

interface Deal {
  id: string;
  title: string;
  client_id: string;
  value: number;
  stage: 'CONTACTO' | 'PROPUESTA' | 'NEGOCIACION' | 'GANADO' | 'PERDIDO';
  expected_close: string;
  notes: string;
  active: boolean;
  expand?: {
    client_id?: {
      name: string;
      doc_number?: string;
      nit?: string;
    };
  };
}

const STAGES = [
  { key: 'CONTACTO',    label: 'Contacto Inicial',    color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: 'fa-comments' },
  { key: 'PROPUESTA',   label: 'Propuesta / Cotiz.',  color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', icon: 'fa-file-invoice-dollar' },
  { key: 'NEGOCIACION', label: 'Negociación',         color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', icon: 'fa-handshake' },
  { key: 'GANADO',      label: 'Cierre Exitoso',      color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: 'fa-circle-check' },
  { key: 'PERDIDO',     label: 'Cierre Perdido',      color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5', icon: 'fa-circle-xmark' },
];

export async function renderCRM(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando embudo CRM...</div>`;

  try {
    await _loadCrmPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadCrmPage(c: HTMLElement) {
  // 1. Obtener todas las oportunidades activas y terceros (para filtros/formularios)
  const [deals, clients] = await Promise.all([
    (window as any).pb.listAll('crm_deals', { expand: 'client_id', sort: '-created' }),
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
  ]);

  (window as any)._crmDealsList = deals;
  (window as any)._crmClientsList = clients;

  _repaintCrmScreen(c, deals, clients);
}

function _repaintCrmScreen(c: HTMLElement, deals: Deal[], clients: any[]) {
  // Calcular KPIs
  const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
  const activeCount = deals.filter(d => d.stage !== 'GANADO' && d.stage !== 'PERDIDO').length;
  const wonValue = deals.filter(d => d.stage === 'GANADO').reduce((acc, d) => acc + (d.value || 0), 0);
  const wonCount = deals.filter(d => d.stage === 'GANADO').length;
  const totalClosed = deals.filter(d => d.stage === 'GANADO' || d.stage === 'PERDIDO').length;
  const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

  c.innerHTML = `
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Seguimiento de Ventas (CRM)</h3>
        <p class="text-sm" style="color:#6B7280">Gestiona y rastrea el progreso del pipeline de ventas por cliente.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" id="btn-new-deal"><i class="fas fa-plus"></i> Nueva Oportunidad</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${_crmKpi('Valor del Pipeline',   (window as any).fmt(totalValue), 'fas fa-funnel-dollar', '#1A4B8C', '#EEF4FF')}
      ${_crmKpi('Oportunidades Activas', activeCount,                   'fas fa-clock',         '#C46516', '#FFF8F0')}
      ${_crmKpi('Cierres Exitosos',     (window as any).fmt(wonValue),   'fas fa-coins',         '#059669', '#ECFDF5')}
      ${_crmKpi('Tasa de Conversión',   `${conversionRate}%`,            'fas fa-chart-line',    '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-5 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="crm-q" class="form-input flex-1 min-w-48" placeholder="Buscar por título o cliente...">
      <select id="crm-client-f" class="form-input" style="max-width:240px">
        <option value="">Todos los clientes</option>
        ${clients.map(cl => `<option value="${(window as any).esc(cl.id)}">${(window as any).esc(cl.name)}</option>`).join('')}
      </select>
    </div>

    <!-- Tablero Kanban -->
    <div class="flex gap-4 overflow-x-auto pb-4" style="min-height:55vh; align-items: flex-start;">
      ${STAGES.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage.key);
        const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        return `
          <div class="flex-1 min-w-[280px] max-w-[320px] bg-gray-50/70 border rounded-2xl p-3 flex flex-col" style="border-color:#E5E7EB; min-height: 50vh;">
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-3 pb-2 border-b" style="border-color:#E5E7EB">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${stage.color}"></span>
                <span class="font-bold text-sm text-gray-800">${stage.label}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold" style="background:${stage.bg}; color:${stage.color}">${stageDeals.length}</span>
              </div>
            </div>
            
            <div class="text-xs font-bold mb-3 flex justify-between" style="color:#6B7280">
              <span>Total acumulado:</span>
              <span style="color:${stage.color}">${(window as any).fmt(stageTotal)}</span>
            </div>

            <!-- List of Cards -->
            <div class="space-y-3 flex-1 overflow-y-auto crm-column" data-stage="${stage.key}" style="max-height: 60vh;">
              ${stageDeals.length ? stageDeals.map(d => _renderDealCard(d, stage)).join('') : `
                <div class="text-center py-8 text-xs text-gray-400 border border-dashed rounded-xl bg-white/50" style="border-color:#D1D5DB">
                  Sin oportunidades
                </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Asignar listeners
  document.getElementById('btn-new-deal')?.addEventListener('click', () => _openDealForm(null, () => _loadCrmPage(c)));

  const applyFilters = () => {
    const q = ((document.getElementById('crm-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
    const clientId = (document.getElementById('crm-client-f') as HTMLSelectElement)?.value || '';

    // Filtrar localmente en el tablero
    const filteredDeals = (window as any)._crmDealsList.filter((d: Deal) => {
      const titleMatch = d.title.toLowerCase().includes(q);
      const clientName = d.expand?.client_id?.name || '';
      const clientMatch = clientName.toLowerCase().includes(q);
      const docMatch = (d.expand?.client_id?.doc_number || d.expand?.client_id?.nit || '').includes(q);
      
      const matchQ = !q || titleMatch || clientMatch || docMatch;
      const matchClient = !clientId || d.client_id === clientId;
      
      return matchQ && matchClient;
    });

    // Repintar el tablero con datos filtrados pero sin recargar del server
    _repaintCrmScreen(c, filteredDeals, (window as any)._crmClientsList);
    // Preservar valores de los filtros
    const qInp = document.getElementById('crm-q') as HTMLInputElement;
    if (qInp) qInp.value = q;
    const clSel = document.getElementById('crm-client-f') as HTMLSelectElement;
    if (clSel) clSel.value = clientId;
  };

  document.getElementById('crm-q')?.addEventListener('input', applyFilters);
  document.getElementById('crm-client-f')?.addEventListener('change', applyFilters);
}

function _crmKpi(title: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card" style="background:#fff; border: 1.5px solid #E5E7EB; border-radius:18px; padding: 16px;">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold tracking-wider" style="color:#6B7280">${title}</span>
          <h4 class="text-xl font-extrabold mt-1" style="color:#0D2137">${value}</h4>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="color:${color}; background:${bg}">
          <i class="${icon}"></i>
        </div>
      </div>
    </div>
  `;
}

function _renderDealCard(d: Deal, stage: any) {
  const clientName = d.expand?.client_id?.name || 'Cliente sin nombre';
  const expectedDate = d.expected_close ? (window as any).fmtDate(d.expected_close) : 'Sin fecha';
  
  // Determinar los botones de desplazamiento de columnas
  const currentIdx = STAGES.findIndex(s => s.key === d.stage);
  const showPrev = currentIdx > 0;
  const showNext = currentIdx < STAGES.length - 1;

  return `
    <div class="bg-white border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 card-opportunity" 
         style="border-color:#E5E7EB; border-left: 4.5px solid ${stage.color};">
      <div class="flex justify-between items-start mb-2 gap-2">
        <h4 class="font-bold text-xs text-gray-800 line-clamp-2" title="${(window as any).esc(d.title)}">${(window as any).esc(d.title)}</h4>
        <div class="flex gap-1 flex-shrink-0">
          <button class="text-gray-400 hover:text-blue-700 bg-transparent border-none p-0.5 cursor-pointer" onclick="window._editDealDirect('${d.id}')" title="Editar"><i class="fas fa-pen text-[10px]"></i></button>
          <button class="text-gray-400 hover:text-red-600 bg-transparent border-none p-0.5 cursor-pointer" onclick="window._deleteDealDirect('${d.id}', '${(window as any).esc(d.title)}')" title="Eliminar"><i class="fas fa-trash text-[10px]"></i></button>
        </div>
      </div>
      
      <p class="text-[11px] font-medium text-gray-500 mb-2 truncate" title="${(window as any).esc(clientName)}">
        <i class="fas fa-user text-[9px] mr-1 text-gray-400"></i>${(window as any).esc(clientName)}
      </p>

      <div class="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100">
        <div class="text-[10px] text-gray-400">
          <div class="font-bold text-blue-700" style="font-size:11px">${(window as any).fmt(d.value)}</div>
          <div class="mt-0.5">ETA: ${expectedDate}</div>
        </div>
        
        <!-- Controles de navegación de columnas -->
        <div class="flex gap-1">
          ${showPrev ? `<button class="w-5 h-5 rounded flex items-center justify-center border hover:bg-gray-100 text-gray-600 cursor-pointer" style="font-size:9px" onclick="window._moveDealStage('${d.id}', -1)" title="Mover a etapa anterior"><i class="fas fa-chevron-left"></i></button>` : ''}
          ${showNext ? `<button class="w-5 h-5 rounded flex items-center justify-center border hover:bg-gray-100 text-gray-600 cursor-pointer" style="font-size:9px" onclick="window._moveDealStage('${d.id}', 1)" title="Mover a siguiente etapa"><i class="fas fa-chevron-right"></i></button>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Mover etapa directamente
(window as any)._moveDealStage = async function(dealId: string, direction: number) {
  const deals: Deal[] = (window as any)._crmDealsList || [];
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;

  const currentIdx = STAGES.findIndex(s => s.key === deal.stage);
  const targetIdx = currentIdx + direction;
  if (targetIdx < 0 || targetIdx >= STAGES.length) return;

  const targetStage = STAGES[targetIdx].key;

  try {
    await (window as any).pb.update('crm_deals', dealId, { stage: targetStage });
    (window as any).showToast(`Oportunidad movida a: ${STAGES[targetIdx].label}`, 'success');
    
    // Registrar Auditoría
    await (window as any).API.logAudit('MOVE_STAGE', 'crm_deals', dealId, `Oportunidad "${deal.title}" movida a ${STAGES[targetIdx].label}`);

    const activeContent = document.getElementById('page-content');
    if (activeContent) {
      renderCRM(activeContent);
    }
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al mover oportunidad', 'error');
  }
};

// Editar directo
(window as any)._editDealDirect = function(dealId: string) {
  const deals: Deal[] = (window as any)._crmDealsList || [];
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;

  _openDealForm(deal, () => {
    const activeContent = document.getElementById('page-content');
    if (activeContent) {
      renderCRM(activeContent);
    }
  });
};

// Eliminar directo
(window as any)._deleteDealDirect = async function(dealId: string, title: string) {
  if (!confirm(`¿Estás seguro de que deseas eliminar la oportunidad "${title}"?`)) return;

  try {
    await (window as any).pb.delete('crm_deals', dealId);
    (window as any).showToast('Oportunidad eliminada con éxito', 'success');
    
    await (window as any).API.logAudit('DELETE', 'crm_deals', dealId, `Oportunidad "${title}" eliminada del CRM`);

    const activeContent = document.getElementById('page-content');
    if (activeContent) {
      renderCRM(activeContent);
    }
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al eliminar', 'error');
  }
};

// Formulario Oportunidad (Crear / Editar)
async function _openDealForm(deal: Deal | null = null, onDone: any = null) {
  const clients = (window as any)._crmClientsList || [];

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="form-group">
        <label class="form-label font-bold">Título de la Oportunidad <span style="color:#EF4444">*</span></label>
        <input id="deal-title" class="form-input" placeholder="Ej: Implementación software, Venta lote 12, etc." value="${(window as any).esc(deal?.title || '')}">
      </div>

      <div class="form-group relative">
        <label class="form-label font-bold">Cliente <span style="color:#EF4444">*</span></label>
        <div id="deal-client-search-wrap" class="relative flex gap-1 items-center">
          <input id="deal-client-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del cliente...">
          <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window._crmQuickAddCustomer()" title="Nuevo Cliente" style="border-color:#D1D5DB; background:#fff;">
            <i class="fas fa-user-plus text-xs" style="color:#4B5563"></i>
          </button>
          <input id="deal-client-id" type="hidden" value="${(window as any).esc(deal?.client_id || '')}">
          <div id="deal-client-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:160px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:100"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Valor Estimado <span style="color:#EF4444">*</span></label>
          <input id="deal-value" type="number" min="0" step="0.01" class="form-input text-right font-semibold" placeholder="0.00" value="${deal?.value ?? ''}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Etapa <span style="color:#EF4444">*</span></label>
          <select id="deal-stage" class="form-input">
            ${STAGES.map(s => `<option value="${s.key}" ${deal?.stage === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Fecha Estimada de Cierre</label>
          <input id="deal-expected-close" type="date" class="form-input" value="${deal?.expected_close || ''}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Activo</label>
          <select id="deal-active" class="form-input">
            <option value="true" ${deal?.active !== false ? 'selected' : ''}>Sí</option>
            <option value="false" ${deal?.active === false ? 'selected' : ''}>No</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Notas / Comentarios</label>
        <textarea id="deal-notes" class="form-input" rows="3" placeholder="Detalles de contacto, requerimientos especiales...">${(window as any).esc(deal?.notes || '')}</textarea>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-deal"><i class="fas fa-floppy-disk"></i> Guardar Oportunidad</button>
  `;

  (window as any).openModal(deal ? 'Editar Oportunidad CRM' : 'Nueva Oportunidad CRM', formHtml, footer, false);

  // Inicializar buscador de clientes
  const input = document.getElementById('deal-client-search') as HTMLInputElement;
  const hidden = document.getElementById('deal-client-id') as HTMLInputElement;
  const results = document.getElementById('deal-client-results');

  if (input && hidden && results) {
    if (deal && deal.client_id) {
      const match = clients.find((c: any) => c.id === deal.client_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query 
        ? clients.slice(0, 20) 
        : clients.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(query)).slice(0, 20);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((c: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window._selectCrmClient('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    (window as any)._selectCrmClient = function(id: string, text: string) {
      hidden.value = id;
      input.value = text;
    };
  }

  (window as any)._crmQuickAddCustomer = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          (window as any)._crmClientsList = thirds;
          clients.length = 0;
          clients.push(...thirds);
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
          (window as any)._selectCrmClient(createdRecord.id, selectText);
          (window as any).showToast('Cliente creado y seleccionado en CRM.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar clientes: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  // Guardar Oportunidad
  document.getElementById('btn-save-deal')?.addEventListener('click', async () => {
    try {
      const title = (document.getElementById('deal-title') as HTMLInputElement)?.value.trim();
      const clientId = (document.getElementById('deal-client-id') as HTMLInputElement)?.value;
      const value = parseFloat((document.getElementById('deal-value') as HTMLInputElement)?.value || '0');
      const stage = (document.getElementById('deal-stage') as HTMLSelectElement)?.value;
      const expectedClose = (document.getElementById('deal-expected-close') as HTMLInputElement)?.value;
      const notes = (document.getElementById('deal-notes') as HTMLTextAreaElement)?.value.trim();
      const active = (document.getElementById('deal-active') as HTMLSelectElement)?.value === 'true';

      if (!title) throw new Error('Por favor ingresa un título para la oportunidad.');
      if (!clientId) throw new Error('Por favor selecciona un cliente de la lista.');
      if (isNaN(value) || value < 0) throw new Error('El valor estimado debe ser un número positivo.');

      const data = {
        title,
        client_id: clientId,
        value,
        stage,
        expected_close: expectedClose,
        notes,
        active,
      };

      if (deal) {
        await (window as any).pb.update('crm_deals', deal.id, data);
        (window as any).showToast('Oportunidad actualizada correctamente', 'success');
        await (window as any).API.logAudit('UPDATE', 'crm_deals', deal.id, `Oportunidad CRM "${title}" modificada`);
      } else {
        const created = await (window as any).pb.create('crm_deals', data);
        (window as any).showToast('Oportunidad registrada con éxito', 'success');
        await (window as any).API.logAudit('CREATE', 'crm_deals', created.id, `Nueva Oportunidad CRM "${title}" registrada por valor de ${value}`);
      }

      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo guardar la oportunidad', 'error');
    }
  });
}

// Exponer renderizador global
(window as any).renderCRM = renderCRM;
