/**
 * GRAVY v2.0 — crm.ts
 * Módulo de Seguimiento de Ventas (CRM).
 * Tablero Kanban dinámico para el control del embudo de ventas.
 */

'use strict';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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
    (window as any).pb.listAll('crm_deals', { expand: 'client_id,sales_order_id,invoice_id', sort: '-created' }),
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
        <button class="btn btn-secondary text-blue-700" style="border-color:#3B82F6; background:#fff" id="btn-crm-reports"><i class="fas fa-chart-pie mr-1"></i> Reportes e Indicadores</button>
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
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold column-badge" style="background:${stage.bg}; color:${stage.color}">${stageDeals.length}</span>
              </div>
            </div>
            
            <div class="text-xs font-bold mb-3 flex justify-between" style="color:#6B7280">
              <span>Total acumulado:</span>
              <span class="column-total" style="color:${stage.color}">${(window as any).fmt(stageTotal)}</span>
            </div>

            <!-- List of Cards -->
            <div class="space-y-3 flex-1 overflow-y-auto crm-column" data-stage="${stage.key}" style="max-height: 60vh;">
              <div class="text-center py-8 text-xs text-gray-400 border border-dashed rounded-xl bg-white/50 empty-placeholder" style="border-color:#D1D5DB; display: ${stageDeals.length ? 'none' : 'block'};">
                Sin oportunidades
              </div>
              ${stageDeals.map(d => _renderDealCard(d, stage)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Asignar listeners
  document.getElementById('btn-new-deal')?.addEventListener('click', () => _openDealForm(null, () => _loadCrmPage(c)));
  document.getElementById('btn-crm-reports')?.addEventListener('click', () => _openCrmReportsModal());

  const applyFilters = () => {
    const q = ((document.getElementById('crm-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
    const clientId = (document.getElementById('crm-client-f') as HTMLSelectElement)?.value || '';

    const columns = c.querySelectorAll('.crm-column');
    columns.forEach((col: any) => {
      const cards = col.querySelectorAll('.card-opportunity');
      let visibleCount = 0;
      let stageTotal = 0;

      cards.forEach((card: any) => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const client = (card.getAttribute('data-client-name') || '').toLowerCase();
        const doc = (card.getAttribute('data-client-doc') || '').toLowerCase();
        const cid = card.getAttribute('data-client-id') || '';
        const val = parseFloat(card.getAttribute('data-value') || '0');

        const matchQ = !q || title.includes(q) || client.includes(q) || doc.includes(q);
        const matchClient = !clientId || cid === clientId;

        if (matchQ && matchClient) {
          card.style.display = '';
          visibleCount++;
          stageTotal += val;
        } else {
          card.style.display = 'none';
        }
      });

      const badge = col.parentElement.querySelector('.column-badge');
      if (badge) badge.textContent = String(visibleCount);

      const totalSpan = col.parentElement.querySelector('.column-total');
      if (totalSpan) totalSpan.textContent = (window as any).fmt(stageTotal);

      const emptyDiv = col.querySelector('.empty-placeholder');
      if (emptyDiv) {
        emptyDiv.style.display = visibleCount === 0 ? '' : 'none';
      }
    });
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
  const clientDoc = d.expand?.client_id?.doc_number || d.expand?.client_id?.nit || '';
  const expectedDate = d.expected_close ? (window as any).fmtDate(d.expected_close) : 'Sin fecha';
  
  // Determinar los botones de desplazamiento de columnas
  const currentIdx = STAGES.findIndex(s => s.key === d.stage);
  const showPrev = currentIdx > 0;
  const showNext = currentIdx < STAGES.length - 1;

  let docBadgeHtml = '';
  if (d.invoice_id) {
    const invNum = d.expand?.invoice_id?.number || 'Ver Factura';
    docBadgeHtml = `<div class="mt-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1" style="background:#ECFDF5; color:#059669; border: 1.5px solid #A7F3D0;" onclick="window._viewInvoiceDirect('${d.invoice_id}')" title="Ver Factura"><i class="fas fa-file-invoice"></i> ${invNum}</span></div>`;
  } else if (d.sales_order_id) {
    const ordNum = d.expand?.sales_order_id?.number || 'Ver Pedido';
    docBadgeHtml = `
      <div class="mt-2 flex flex-wrap gap-1 items-center justify-between">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1" style="background:#EFF6FF; color:#1B72E8; border: 1.5px solid #BFDBFE;" onclick="window._viewOrderDirect('${d.sales_order_id}')" title="Ver Pedido"><i class="fas fa-file-signature"></i> ${ordNum}</span>
        <button class="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-green-600 hover:bg-green-700 text-white border-none cursor-pointer flex items-center gap-0.5" onclick="window._invoiceSalesOrderDirectFromCRM('${d.sales_order_id}')" title="Facturar este Pedido"><i class="fas fa-receipt"></i> Facturar</button>
      </div>
    `;
  } else if (d.stage === 'PROPUESTA' || d.stage === 'NEGOCIACION') {
    docBadgeHtml = `<div class="mt-2 text-right"><button class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer inline-flex items-center gap-1" onclick="window._convertDealToOrder('${d.id}')" title="Crear Pedido/Cotización para esta oportunidad"><i class="fas fa-file-signature"></i> Crear Pedido</button></div>`;
  }

  return `
    <div class="bg-white border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 card-opportunity" 
         style="border-color:#E5E7EB; border-left: 4.5px solid ${stage.color};"
         data-title="${(window as any).esc(d.title)}"
         data-client-name="${(window as any).esc(clientName)}"
         data-client-doc="${(window as any).esc(clientDoc)}"
         data-client-id="${d.client_id}"
         data-value="${d.value || 0}">
      <div class="flex justify-between items-start mb-2 gap-2">
        <h4 class="font-bold text-xs text-gray-800 line-clamp-2" title="${(window as any).esc(d.title)}">${(window as any).esc(d.title)}</h4>
        <div class="flex gap-1 flex-shrink-0">
          <button class="text-gray-400 hover:text-blue-700 bg-transparent border-none p-0.5 cursor-pointer" onclick="window._editDealDirect('${d.id}')" title="Editar"><i class="fas fa-pen text-[10px]"></i></button>
          <button class="text-gray-400 hover:text-red-600 bg-transparent border-none p-0.5 cursor-pointer" onclick="window._deleteDealDirect('${d.id}', '${(window as any).esc(d.title)}')" title="Eliminar"><i class="fas fa-trash text-[10px]"></i></button>
        </div>
      </div>
      
      <p class="text-[11px] font-medium text-gray-500 mb-1 truncate" title="${(window as any).esc(clientName)}">
        <i class="fas fa-user text-[9px] mr-1 text-gray-400"></i>${(window as any).esc(clientName)}
      </p>

      <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
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

      ${docBadgeHtml}
    </div>
  `;
}

// Navegación directa del CRM a Ventas / Pedidos
(window as any)._viewInvoiceDirect = function(invoiceId: string) {
  (window as any).navigate('ventas');
  setTimeout(() => {
    if (typeof (window as any).viewSalesInvoiceDetail === 'function') {
      (window as any).viewSalesInvoiceDetail(invoiceId);
    }
  }, 250);
};

(window as any)._viewOrderDirect = function(orderId: string) {
  (window as any).navigate('pedidos');
  setTimeout(() => {
    if (typeof (window as any).viewSalesOrderDetail === 'function') {
      (window as any).viewSalesOrderDetail(orderId);
    }
  }, 250);
};

(window as any)._convertDealToOrder = function(dealId: string) {
  (window as any).navigate('pedidos');
  setTimeout(() => {
    if (typeof (window as any).openOrderForm === 'function') {
      (window as any).openOrderForm(null, () => {
        (window as any).navigate('crm');
      }, dealId);
    }
  }, 250);
};

(window as any)._invoiceSalesOrderDirectFromCRM = function(orderId: string) {
  (window as any).navigate('ventas');
  setTimeout(() => {
    if (typeof (window as any).invoiceSalesOrderDirect === 'function') {
      (window as any).invoiceSalesOrderDirect(orderId);
    }
  }, 250);
};

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



// Renderizador de ítems de la línea de tiempo
function _renderTimelineItem(act: any) {
  const dateStr = act.created ? (window as any).fmtDate(act.created) : '—';
  const timeStr = act.created ? new Date(act.created).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '';
  const userName = act.expand?.user_id?.full_name || act.expand?.user_id?.name || 'Sistema';
  
  const typeIcons: any = {
    LLAMADA: 'fa-phone text-blue-500 bg-blue-50 border-blue-200',
    CORREO: 'fa-envelope text-purple-500 bg-purple-50 border-purple-200',
    REUNION: 'fa-handshake text-orange-500 bg-orange-50 border-orange-200',
    WHATSAPP: 'fa-comments text-green-500 bg-green-50 border-green-200',
    COTIZACION: 'fa-file-invoice-dollar text-teal-500 bg-teal-50 border-teal-200',
    OTRO: 'fa-info-circle text-gray-500 bg-gray-50 border-gray-200'
  };
  const iconClass = typeIcons[act.type] || 'fa-info-circle text-gray-500 bg-gray-50 border-gray-200';

  let docLinkHtml = '';
  if (act.isVirtual) {
    if (act.docType === 'order') {
      docLinkHtml = `<span class="mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 w-fit" onclick="window._viewOrderDirect('${act.docId}')"><i class="fas fa-file-signature"></i> Ver Pedido</span>`;
    } else if (act.docType === 'invoice') {
      docLinkHtml = `<span class="mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 w-fit" onclick="window._viewInvoiceDirect('${act.docId}')"><i class="fas fa-file-invoice"></i> Ver Factura</span>`;
    }
  }

  // Reglas de permisos para modificar o eliminar
  const currentUser = (window as any).pb.currentUser;
  const isAdmin = currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'propietario');
  const isOwner = currentUser && act.user_id === currentUser.id;
  
  let isWithin30Mins = false;
  if (act.created) {
    const createdDate = new Date(act.created);
    const diffMs = Date.now() - createdDate.getTime();
    const diffMins = diffMs / 1000 / 60;
    isWithin30Mins = diffMins <= 30;
  }

  const canEdit = !act.isVirtual && ((isOwner && isWithin30Mins) || isAdmin);
  const canDelete = !act.isVirtual && isAdmin;

  let actionsHtml = '';
  if (canEdit || canDelete) {
    actionsHtml = `
      <div class="flex items-center gap-2 ml-2">
        ${canEdit ? `<button class="text-gray-400 hover:text-blue-600 bg-transparent border-none p-0 cursor-pointer" onclick="window._editCrmInteraction('${act.id}')" title="Editar interacción"><i class="fas fa-pen text-[10px]"></i></button>` : ''}
        ${canDelete ? `<button class="text-gray-400 hover:text-red-600 bg-transparent border-none p-0 cursor-pointer" onclick="window._deleteCrmInteraction('${act.id}', '${act.deal_id}')" title="Eliminar interacción"><i class="fas fa-trash text-[10px]"></i></button>` : ''}
      </div>
    `;
  }

  return `
    <div class="flex gap-3 text-xs relative group pb-4">
      <div class="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gray-200 group-last:hidden"></div>
      
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border bg-white ${iconClass.split(' ')[2] || ''}">
        <i class="fas ${iconClass.split(' ')[0]} ${iconClass.split(' ')[1]}" style="font-size: 11px;"></i>
      </div>
      
      <div class="flex-1 bg-white border rounded-xl p-2.5 shadow-sm" style="border-color:#E5E7EB">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-bold text-gray-800">${userName}</span>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-gray-400 font-medium">${dateStr} ${timeStr}</span>
            ${actionsHtml}
          </div>
        </div>
        
        <div class="text-gray-600 whitespace-pre-wrap">${(window as any).esc(act.request_details)}</div>
        
        ${act.response_details ? `
          <div class="mt-2 bg-gray-50 border-l-2 p-2 rounded-r text-gray-500 font-medium" style="border-color: #3B82F6">
            <span class="font-bold text-[10px] text-blue-600 uppercase block mb-0.5">Respuesta / Compromiso:</span>
            ${(window as any).esc(act.response_details)}
            ${act.response_at ? `<span class="block text-[9px] text-gray-400 mt-1 font-normal">Resuelto el: ${act.response_at}</span>` : ''}
          </div>
        ` : ''}
        
        ${docLinkHtml}
      </div>
    </div>
  `;
}

// Carga e inicialización de la línea de tiempo
async function _loadCrmTimeline(dealId: string) {
  const container = document.getElementById('crm-timeline-list');
  if (!container) return;

  try {
    const [realActivities, deal] = await Promise.all([
      (window as any).pb.listAll('crm_interactions', {
        filter: `deal_id="${dealId}"`,
        sort: '-created',
        expand: 'user_id'
      }),
      (window as any).pb.get('crm_deals', dealId, {
        expand: 'sales_order_id,invoice_id'
      })
    ]);

    const list: any[] = [...realActivities];

    // Hito virtual de Pedido
    if (deal.sales_order_id && deal.expand?.sales_order_id) {
      list.push({
        id: 'v-so',
        type: 'COTIZACION',
        created: deal.expand.sales_order_id.created,
        request_details: `Pedido de venta enlazado al proceso: ${deal.expand.sales_order_id.number || 'Ver Pedido'}`,
        response_details: `Valor del pedido: ${(window as any).fmt(deal.expand.sales_order_id.total || 0)}`,
        expand: {
          user_id: {
            name: 'Sistema / Ventas'
          }
        },
        isVirtual: true,
        docType: 'order',
        docId: deal.sales_order_id
      });
    }

    // Hito virtual de Factura
    if (deal.invoice_id && deal.expand?.invoice_id) {
      list.push({
        id: 'v-inv',
        type: 'COTIZACION',
        created: deal.expand.invoice_id.created,
        request_details: `Factura de venta enlazada al proceso: ${deal.expand.invoice_id.number || 'Ver Factura'}`,
        response_details: `Valor facturado: ${(window as any).fmt(deal.expand.invoice_id.total || 0)}`,
        expand: {
          user_id: {
            name: 'Sistema / Facturación'
          }
        },
        isVirtual: true,
        docType: 'invoice',
        docId: deal.invoice_id
      });
    }

    // Ordenar cronológicamente decreciente (más nuevo arriba)
    list.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    if (!list.length) {
      container.innerHTML = `
        <div class="text-center py-10 text-xs text-gray-400">
          <i class="fas fa-history text-lg mb-2 block"></i>
          Aún no se han registrado interacciones o seguimiento en este proceso.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(act => _renderTimelineItem(act)).join('');
  } catch (err: any) {
    container.innerHTML = `
      <div class="text-center py-10 text-xs text-red-500">
        <i class="fas fa-exclamation-triangle text-lg mb-2 block"></i>
        Error al cargar historial: ${err.message}
      </div>
    `;
  }
}

// APIs Globales de Modificación/Eliminación de Interacciones
(window as any)._deleteCrmInteraction = async function(actId: string, dealId: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta interacción del historial? Esta acción no se puede deshacer.')) return;
  
  try {
    await (window as any).pb.delete('crm_interactions', actId);
    (window as any).showToast('Interacción eliminada con éxito', 'success');
    
    await (window as any).API.logAudit('DELETE', 'crm_interactions', actId, `Interacción de seguimiento eliminada para el trato: ${dealId}`);
    
    // Cancelar edición si era la interacción borrada
    if ((window as any)._activeEditingInteractionId === actId) {
      (window as any)._clearCrmActivityFormEdit();
    }
    
    await _loadCrmTimeline(dealId);
  } catch (err: any) {
    (window as any).showToast('Error al eliminar interacción: ' + err.message, 'error');
  }
};

(window as any)._editCrmInteraction = async function(actId: string) {
  try {
    const act = await (window as any).pb.get('crm_interactions', actId);
    
    // Llenar campos
    const typeSelect = document.getElementById('act-type') as HTMLSelectElement;
    const requestText = document.getElementById('act-request') as HTMLTextAreaElement;
    const responseText = document.getElementById('act-response') as HTMLTextAreaElement;
    
    if (typeSelect) typeSelect.value = act.type;
    if (requestText) requestText.value = act.request_details;
    if (responseText) responseText.value = act.response_details || '';
    
    // Estilos visuales del contenedor en modo edición
    const formContainer = document.getElementById('crm-activity-form-container');
    const formTitle = document.getElementById('crm-activity-form-title');
    const actionsWrap = document.getElementById('crm-activity-actions-wrap');
    
    if (formContainer) {
      formContainer.style.borderColor = '#3B82F6';
      formContainer.style.backgroundColor = '#EFF6FF'; // fondo azul muy claro
    }
    
    if (formTitle) {
      formTitle.innerHTML = `<i class="fas fa-pen-to-square text-blue-600 mr-1.5"></i>Editar Actividad (Modo Edición)`;
    }
    
    (window as any)._activeEditingInteractionId = actId;
    
    // Inyectar botón cancelar si no existe
    if (actionsWrap && !document.getElementById('btn-cancel-activity-edit')) {
      const saveBtn = document.getElementById('btn-save-activity');
      if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Guardar Cambios';
        saveBtn.className = 'btn btn-primary btn-sm flex-1 font-bold py-2';
      }
      
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'btn-cancel-activity-edit';
      cancelBtn.className = 'btn btn-outline btn-sm flex-1 font-bold py-2';
      cancelBtn.innerHTML = '<i class="fas fa-xmark mr-1"></i> Cancelar';
      cancelBtn.addEventListener('click', () => {
        (window as any)._clearCrmActivityFormEdit();
      });
      actionsWrap.appendChild(cancelBtn);
    }
  } catch (err: any) {
    (window as any).showToast('Error al cargar la actividad: ' + err.message, 'error');
  }
};

(window as any)._clearCrmActivityFormEdit = function() {
  const typeSelect = document.getElementById('act-type') as HTMLSelectElement;
  const requestText = document.getElementById('act-request') as HTMLTextAreaElement;
  const responseText = document.getElementById('act-response') as HTMLTextAreaElement;
  
  if (typeSelect) typeSelect.value = 'LLAMADA';
  if (requestText) requestText.value = '';
  if (responseText) responseText.value = '';
  
  const formContainer = document.getElementById('crm-activity-form-container');
  const formTitle = document.getElementById('crm-activity-form-title');
  const actionsWrap = document.getElementById('crm-activity-actions-wrap');
  
  if (formContainer) {
    formContainer.style.borderColor = '#E5E7EB';
    formContainer.style.backgroundColor = '#F9FAFB'; // fondo gris claro por defecto
  }
  
  if (formTitle) {
    formTitle.innerHTML = `<i class="fas fa-plus-circle text-green-600 mr-1.5"></i>Registrar Actividad`;
  }
  
  (window as any)._activeEditingInteractionId = null;
  
  const cancelBtn = document.getElementById('btn-cancel-activity-edit');
  if (cancelBtn) cancelBtn.remove();
  
  const saveBtn = document.getElementById('btn-save-activity');
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar Seguimiento';
    saveBtn.className = 'btn btn-primary btn-sm w-full font-bold py-2';
  }
};


// Formulario Oportunidad (Crear / Editar)
async function _openDealForm(deal: Deal | null = null, onDone: any = null) {
  const clients = (window as any)._crmClientsList || [];
  const sellers = clients.filter((c: any) => c.type === 'EMPLEADO');

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
          <label class="form-label font-bold">Vendedor Asignado</label>
          <select id="deal-seller-id" class="form-input">
            <option value="">— Sin vendedor —</option>
            ${sellers.map((s: any) => `<option value="${s.id}" ${deal?.seller_id === s.id ? 'selected' : ''}>${(window as any).esc(s.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Etapa <span style="color:#EF4444">*</span></label>
          <select id="deal-stage" class="form-input">
            ${STAGES.map(s => `<option value="${s.key}" ${deal?.stage === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>
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

  let modalBody = '';
  const isEdit = !!(deal && deal.id);

  if (isEdit) {
    modalBody = `
      <div class="space-y-4">
        <!-- Tabs Selector -->
        <div class="flex border-b" style="border-color:#E5E7EB; margin-bottom:12px;">
          <button type="button" class="tab-btn active" data-tab="tab-crm-details">
            <i class="fas fa-file-invoice mr-1.5"></i> Detalles de la Oportunidad
          </button>
          <button type="button" class="tab-btn" data-tab="tab-crm-timeline">
            <i class="fas fa-history mr-1.5"></i> Historial y Seguimiento
          </button>
        </div>

        <!-- Tab Content: Details -->
        <div id="tab-crm-details" class="tab-content">
          ${formHtml}
        </div>

        <!-- Tab Content: Timeline -->
        <div id="tab-crm-timeline" class="tab-content hidden">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <!-- Columna Izquierda: Timeline -->
            <div class="lg:col-span-7 flex flex-col">
              <h4 class="font-bold text-xs text-gray-800 mb-3"><i class="fas fa-list text-blue-500 mr-1.5"></i>Línea de Tiempo de Contactos</h4>
              <div id="crm-timeline-list" class="space-y-3 overflow-y-auto pr-1" style="max-height: 380px; min-height: 200px;">
                <div class="text-center py-8 text-xs text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i>Cargando historial...</div>
              </div>
            </div>
            
            <!-- Columna Derecha: Registrar Actividad -->
            <div class="lg:col-span-5 bg-gray-50 border rounded-xl p-4 transition-all duration-200" style="border-color:#E5E7EB" id="crm-activity-form-container">
              <h4 class="font-bold text-xs text-gray-800 mb-3" id="crm-activity-form-title"><i class="fas fa-plus-circle text-green-600 mr-1.5"></i>Registrar Actividad</h4>
              <div class="space-y-3 text-xs">
                <div class="form-group">
                  <label class="form-label font-semibold">Tipo de Contacto <span style="color:#EF4444">*</span></label>
                  <select id="act-type" class="form-input text-xs" style="height: 34px; padding: 6px 12px;">
                    <option value="LLAMADA">Llamada Telefónica</option>
                    <option value="CORREO">Correo Electrónico</option>
                    <option value="REUNION">Reunión / Visita</option>
                    <option value="WHATSAPP">Mensaje WhatsApp</option>
                    <option value="COTIZACION">Entrega Cotización</option>
                    <option value="OTRO">Otro contacto</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label font-semibold">¿Qué solicita el cliente? <span style="color:#EF4444">*</span></label>
                  <textarea id="act-request" class="form-input text-xs" rows="3" placeholder="Detalle de la solicitud o requerimiento..."></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label font-semibold">Respuesta / Compromiso <span class="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea id="act-response" class="form-input text-xs" rows="3" placeholder="Detalle de lo que se le respondió o agendó..."></textarea>
                </div>
                <div class="flex gap-2" id="crm-activity-actions-wrap">
                  <button type="button" class="btn btn-primary btn-sm w-full font-bold py-2" id="btn-save-activity"><i class="fas fa-save mr-1"></i> Guardar Seguimiento</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    modalBody = formHtml;
  }

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-deal"><i class="fas fa-floppy-disk"></i> Guardar Oportunidad</button>
  `;

  (window as any).openModal(isEdit ? 'Editar Oportunidad CRM' : 'Nueva Oportunidad CRM', modalBody, footer, isEdit);

  // Inicializar buscador de clientes
  const input = document.getElementById('deal-client-search') as HTMLInputElement;
  const hidden = document.getElementById('deal-client-id') as HTMLInputElement;
  const results = document.getElementById('deal-client-results');

  if (input && hidden && results) {
    if (deal && deal.client_id) {
      const match = clients.find((c: any) => c.id === deal.client_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
    }

    const selectClient = (id: string, text: string) => {
      hidden.value = id;
      input.value = text;
      results.style.display = 'none';
    };

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query 
        ? clients.slice(0, 20) 
        : clients.filter((c: any) => `${c.name || ''} ${c.doc_number || ''} ${c.nit || ''}`.toLowerCase().includes(query)).slice(0, 20);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((c: any) => {
        const textVal = `${c.doc_number || c.nit || ''} - ${c.name}`;
        return `
          <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block client-option-btn"
                  data-id="${(window as any).esc(c.id)}"
                  data-text="${(window as any).esc(textVal)}">
            <div class="font-bold text-gray-800 pointer-events-none">${(window as any).esc(c.name)}</div>
            <div class="text-[10px] text-gray-500 pointer-events-none">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
          </button>
        `;
      }).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    // Delegar el evento click para evitar problemas de escape de comillas en inline onclick
    results.addEventListener('click', (ev) => {
      const btn = (ev.target as HTMLElement).closest('.client-option-btn');
      if (btn) {
        const id = btn.getAttribute('data-id');
        const text = btn.getAttribute('data-text');
        if (id && text) {
          selectClient(id, text);
        }
      }
    });

    results.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
    });

    if (typeof (window as any).initKeyboardAutocomplete === 'function') {
      (window as any).initKeyboardAutocomplete({
        input,
        results,
        itemSelector: 'button.client-option-btn',
        onSelect: (btn: HTMLElement) => {
          const id = btn.getAttribute('data-id');
          const text = btn.getAttribute('data-text');
          if (id && text) {
            selectClient(id, text);
          }
        }
      });
    }

    if ((window as any).__crmSelectCustomerAfterLoad) {
      const sel = (window as any).__crmSelectCustomerAfterLoad;
      (window as any).__crmSelectCustomerAfterLoad = null;
      selectClient(sel.id, sel.text);
      (window as any).showToast('Cliente creado y seleccionado en CRM.', 'success');
    }
  }

  // Asegurar limpieza de estado de edición al abrir o cambiar de pestaña
  (window as any)._activeEditingInteractionId = null;

  // Manejo de Pestañas
  if (isEdit) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn: any) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b: any) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        const tabId = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach((c: any) => {
          c.classList.add('hidden');
        });
        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.classList.remove('hidden');

        if (tabId === 'tab-crm-timeline') {
          _loadCrmTimeline(deal!.id);
        }
      });
    });

    // Guardar Actividad
    const btnSaveAct = document.getElementById('btn-save-activity');
    if (btnSaveAct) {
      btnSaveAct.addEventListener('click', async () => {
        try {
          const type = (document.getElementById('act-type') as HTMLSelectElement)?.value;
          const requestDetails = (document.getElementById('act-request') as HTMLTextAreaElement)?.value.trim();
          const responseDetails = (document.getElementById('act-response') as HTMLTextAreaElement)?.value.trim();
          const userId = (window as any).pb.currentUser?.id;

          if (!requestDetails) throw new Error('Por favor describe lo que necesita o solicita el cliente.');
          if (!userId) throw new Error('No se pudo determinar el usuario en sesión.');

          btnSaveAct.setAttribute('disabled', 'true');
          btnSaveAct.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';

          const data = {
            deal_id: deal!.id,
            user_id: userId,
            type,
            request_details: requestDetails,
            response_details: responseDetails || '',
            response_at: responseDetails ? (window as any).todayStr() : ''
          };

          const editingId = (window as any)._activeEditingInteractionId;
          if (editingId) {
            // MODO EDICIÓN
            await (window as any).pb.update('crm_interactions', editingId, data);
            (window as any).showToast('Actividad actualizada correctamente.', 'success');
            (window as any)._clearCrmActivityFormEdit();
          } else {
            // MODO CREACIÓN
            await (window as any).pb.create('crm_interactions', data);
            (window as any).showToast('Actividad registrada correctamente.', 'success');
            (document.getElementById('act-request') as HTMLTextAreaElement).value = '';
            (document.getElementById('act-response') as HTMLTextAreaElement).value = '';
          }

          await _loadCrmTimeline(deal!.id);
        } catch (err: any) {
          (window as any).showToast(err.message || 'No se pudo guardar el seguimiento.', 'error');
        } finally {
          btnSaveAct.removeAttribute('disabled');
          const isEditing = !!(window as any)._activeEditingInteractionId;
          btnSaveAct.innerHTML = isEditing 
            ? '<i class="fas fa-check mr-1"></i> Guardar Cambios' 
            : '<i class="fas fa-save mr-1"></i> Guardar Seguimiento';
        }
      });
    }
  }

  const getCrmFormCurrentState = () => {
    const title = (document.getElementById('deal-title') as HTMLInputElement)?.value || '';
    const client_id = (document.getElementById('deal-client-id') as HTMLInputElement)?.value || '';
    const valStr = (document.getElementById('deal-value') as HTMLInputElement)?.value || '0';
    const value = parseFloat(valStr) || 0;
    const seller_id = (document.getElementById('deal-seller-id') as HTMLSelectElement)?.value || '';
    const stage = (document.getElementById('deal-stage') as HTMLSelectElement)?.value as any;
    const expected_close = (document.getElementById('deal-expected-close') as HTMLInputElement)?.value || '';
    const active = (document.getElementById('deal-active') as HTMLSelectElement)?.value === 'true';
    const notes = (document.getElementById('deal-notes') as HTMLTextAreaElement)?.value || '';

    return {
      id: deal?.id || '',
      title,
      client_id,
      value,
      seller_id,
      stage,
      expected_close,
      active,
      notes
    };
  };

  (window as any)._crmQuickAddCustomer = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      const currentState = getCrmFormCurrentState();
      (window as any).__crmPreservedState = {
        deal: currentState,
        onDone
      };

      (window as any).__modalCloseCallback = async () => {
        const preserved = (window as any).__crmPreservedState;
        if (preserved) {
          (window as any).__crmPreservedState = null;
          try {
            const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
            (window as any)._crmClientsList = thirds;
          } catch (err) {
            console.error("Error recargando terceros:", err);
          }
          await _openDealForm(preserved.deal, preserved.onDone);
        }
      };

      (window as any).openTerceroForm({ type: 'CLIENTE' }, async (createdRecord: any) => {
        const docNum = createdRecord.doc_number || createdRecord.nit || '';
        const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
        (window as any).__crmSelectCustomerAfterLoad = { id: createdRecord.id, text: selectText };
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
      const sellerId = (document.getElementById('deal-seller-id') as HTMLSelectElement)?.value || null;
      const stage = (document.getElementById('deal-stage') as HTMLSelectElement)?.value;
      const expectedClose = (document.getElementById('deal-expected-close') as HTMLInputElement)?.value;
      const notes = (document.getElementById('deal-notes') as HTMLTextAreaElement)?.value.trim();
      const active = (document.getElementById('deal-active') as HTMLSelectElement)?.value === 'true';
      const userId = (window as any).pb.currentUser?.id || null;

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
        seller_id: sellerId,
        user_id: userId,
      };

      if (deal && deal.id) {
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

// Modal de Reportes y Estadísticas CRM
async function _openCrmReportsModal() {
  const deals: Deal[] = (window as any)._crmDealsList || [];
  const clients: any[] = (window as any)._crmClientsList || [];
  const sellers = clients.filter((c: any) => c.type === 'EMPLEADO');

  // Métricas Generales
  const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);
  const activeCount = deals.filter(d => d.stage !== 'GANADO' && d.stage !== 'PERDIDO').length;
  const wonValue = deals.filter(d => d.stage === 'GANADO').reduce((acc, d) => acc + (d.value || 0), 0);
  const wonCount = deals.filter(d => d.stage === 'GANADO').length;
  const totalClosed = deals.filter(d => d.stage === 'GANADO' || d.stage === 'PERDIDO').length;
  const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

  // Cargar interacciones de PocketBase
  let interactions: any[] = [];
  try {
    interactions = await (window as any).pb.listAll('crm_interactions');
  } catch (err) {
    console.error("Error al cargar actividades para reportes:", err);
  }

  // Desglose de actividades
  const actCounts: any = { LLAMADA: 0, CORREO: 0, REUNION: 0, WHATSAPP: 0, COTIZACION: 0, OTRO: 0 };
  interactions.forEach((i: any) => {
    if (actCounts[i.type] !== undefined) {
      actCounts[i.type]++;
    } else {
      actCounts.OTRO++;
    }
  });

  // Estadísticas por Vendedor
  const sellerStats: any[] = [];
  const unassignedDeals = deals.filter(d => !d.seller_id);
  if (unassignedDeals.length > 0) {
    const totalV = unassignedDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonD = unassignedDeals.filter(d => d.stage === 'GANADO');
    const wonV = wonD.reduce((sum, d) => sum + (d.value || 0), 0);
    const rate = Math.round((wonD.length / unassignedDeals.length) * 100);
    sellerStats.push({
      name: 'Sin asignar',
      count: unassignedDeals.length,
      value: totalV,
      wonCount: wonD.length,
      wonValue: wonV,
      rate
    });
  }
  
  sellers.forEach((s: any) => {
    const sDeals = deals.filter(d => d.seller_id === s.id);
    if (sDeals.length === 0) return;
    
    const totalV = sDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonD = sDeals.filter(d => d.stage === 'GANADO');
    const wonV = wonD.reduce((sum, d) => sum + (d.value || 0), 0);
    const rate = sDeals.length > 0 ? Math.round((wonD.length / sDeals.length) * 100) : 0;
    
    sellerStats.push({
      name: s.name,
      count: sDeals.length,
      value: totalV,
      wonCount: wonD.length,
      wonValue: wonV,
      rate
    });
  });

  const bodyHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      <!-- Mini KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gray-50 border rounded-2xl p-4 flex flex-col" style="border-color:#E5E7EB">
          <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Valor total Pipeline</span>
          <span class="text-xl font-extrabold text-blue-900 mt-1">${(window as any).fmt(totalValue)}</span>
          <span class="text-[10px] text-gray-400 mt-0.5">Suma total de oportunidades</span>
        </div>
        <div class="bg-gray-50 border rounded-2xl p-4 flex flex-col" style="border-color:#E5E7EB">
          <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tasa de Conversión</span>
          <span class="text-xl font-extrabold text-purple-700 mt-1">${conversionRate}%</span>
          <span class="text-[10px] text-gray-400 mt-0.5">Efectividad de cierre</span>
        </div>
        <div class="bg-gray-50 border rounded-2xl p-4 flex flex-col" style="border-color:#E5E7EB">
          <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tratos Activos</span>
          <span class="text-xl font-extrabold text-orange-600 mt-1">${activeCount}</span>
          <span class="text-[10px] text-gray-400 mt-0.5">En proceso de negociación</span>
        </div>
        <div class="bg-gray-50 border rounded-2xl p-4 flex flex-col" style="border-color:#E5E7EB">
          <span class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tratos Ganados</span>
          <span class="text-xl font-extrabold text-emerald-600 mt-1">${wonCount}</span>
          <span class="text-[10px] text-gray-400 mt-0.5">Cierres exitosos logrados</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Izquierda: Gráficos -->
        <div class="lg:col-span-6 space-y-5">
          <!-- Gráfico de Embudo (Funnel) -->
          <div class="bg-white border rounded-2xl p-4 shadow-sm" style="border-color:#E5E7EB">
            <h4 class="font-bold text-xs text-gray-800 mb-3"><i class="fas fa-funnel-dollar text-blue-600 mr-1.5"></i>Embudo de Ventas (Valor por Etapa)</h4>
            <div class="relative w-full h-[220px]">
              <canvas id="crm-chart-funnel"></canvas>
            </div>
          </div>

          <!-- Gráfico de Actividades -->
          <div class="bg-white border rounded-2xl p-4 shadow-sm" style="border-color:#E5E7EB">
            <h4 class="font-bold text-xs text-gray-800 mb-3"><i class="fas fa-history text-purple-600 mr-1.5"></i>Actividades de Seguimiento por Tipo</h4>
            <div class="relative w-full h-[220px] flex justify-center items-center">
              <canvas id="crm-chart-activities" style="max-width: 280px;"></canvas>
            </div>
          </div>
        </div>

        <!-- Derecha: Rendimiento Vendedores -->
        <div class="lg:col-span-6">
          <div class="bg-white border rounded-2xl p-4 shadow-sm h-full flex flex-col" style="border-color:#E5E7EB">
            <h4 class="font-bold text-xs text-gray-800 mb-3"><i class="fas fa-users-viewfinder text-green-600 mr-1.5"></i>Rendimiento de Vendedores</h4>
            <div class="overflow-x-auto flex-1">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 font-bold uppercase border-b" style="border-color:#E5E7EB">
                    <th class="p-2.5 rounded-l-xl">Vendedor</th>
                    <th class="p-2.5 text-center">Tratos</th>
                    <th class="p-2.5 text-right">Valor Pipeline</th>
                    <th class="p-2.5 text-center">Ganados</th>
                    <th class="p-2.5 text-right rounded-r-xl">Efectividad</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${sellerStats.length === 0 
                    ? `<tr><td colspan="5" class="p-4 text-center text-gray-400">Sin datos de gestión de vendedores</td></tr>`
                    : sellerStats.map(s => `
                      <tr class="hover:bg-gray-50/50">
                        <td class="p-2.5 font-bold text-gray-800">${(window as any).esc(s.name)}</td>
                        <td class="p-2.5 text-center text-gray-600">${s.count}</td>
                        <td class="p-2.5 text-right font-semibold text-blue-900">${(window as any).fmt(s.value)}</td>
                        <td class="p-2.5 text-center text-emerald-600 font-bold">${s.wonCount}</td>
                        <td class="p-2.5 text-right font-extrabold text-purple-700">${s.rate}%</td>
                      </tr>
                    `).join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" style="border-color:#D1D5DB" onclick="closeModal()">Cerrar</button>
    <button class="btn btn-primary" onclick="window._exportCrmToExcel()"><i class="fas fa-file-excel mr-1"></i> Exportar Pipeline (Excel)</button>
  `;

  (window as any).openModal('Reportes y Estadísticas CRM', bodyHtml, footerHtml, true);

  // Inicializar Gráficos con Chart.js
  setTimeout(() => {
    // 1. Gráfico Funnel (Barras Horizontales)
    const funnelCtx = (document.getElementById('crm-chart-funnel') as HTMLCanvasElement)?.getContext('2d');
    if (funnelCtx) {
      if ((window as any)._crmFunnelChart) (window as any)._crmFunnelChart.destroy();
      
      const stageValues = STAGES.map(st => {
        return deals.filter(d => d.stage === st.key).reduce((sum, d) => sum + (d.value || 0), 0);
      });
      const stageLabels = STAGES.map(st => st.label);
      const stageColors = STAGES.map(st => st.color);

      (window as any)._crmFunnelChart = new Chart(funnelCtx, {
        type: 'bar',
        data: {
          labels: stageLabels,
          datasets: [{
            label: 'Valor total ($)',
            data: stageValues,
            backgroundColor: stageColors,
            borderRadius: 6,
            borderWidth: 0,
            barThickness: 18
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Valor: ${(window as any).fmt(context.raw)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 10, weight: 'bold' } }
            }
          }
        }
      });
    }

    // 2. Gráfico Actividades (Doughnut)
    const actCtx = (document.getElementById('crm-chart-activities') as HTMLCanvasElement)?.getContext('2d');
    if (actCtx) {
      if ((window as any)._crmActivitiesChart) (window as any)._crmActivitiesChart.destroy();

      const actLabels = ['Llamada', 'Correo', 'Reunión', 'WhatsApp', 'Cotización', 'Otro'];
      const actData = [actCounts.LLAMADA, actCounts.CORREO, actCounts.REUNION, actCounts.WHATSAPP, actCounts.COTIZACION, actCounts.OTRO];
      const actColors = ['#3B82F6', '#8B5CF6', '#F97316', '#10B981', '#06B6D4', '#6B7280'];

      (window as any)._crmActivitiesChart = new Chart(actCtx, {
        type: 'doughnut',
        data: {
          labels: actLabels,
          datasets: [{
            data: actData,
            backgroundColor: actColors,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 10,
                font: { size: 10 }
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }, 100);
}

// Exportación del pipeline a archivo Excel
(window as any)._exportCrmToExcel = function() {
  const deals: Deal[] = (window as any)._crmDealsList || [];
  const clients: any[] = (window as any)._crmClientsList || [];
  
  if (!deals.length) {
    (window as any).showToast('No hay datos para exportar', 'warning');
    return;
  }
  
  const headers = [
    { key: 'title', label: 'Título de la Oportunidad' },
    { key: 'client', label: 'Cliente' },
    { key: 'doc', label: 'Documento Cliente' },
    { key: 'value', label: 'Valor Estimado' },
    { key: 'stage', label: 'Etapa' },
    { key: 'date', label: 'Fecha Estimada Cierre' },
    { key: 'notes', label: 'Notas / Comentarios' },
    { key: 'status', label: 'Estado' },
    { key: 'seller', label: 'Vendedor Responsable' }
  ];

  const rows = deals.map(d => {
    const client = clients.find(c => c.id === d.client_id);
    const clientName = client ? client.name : 'Desconocido';
    const clientDoc = client ? (client.doc_number || client.nit || '') : '';
    const seller = clients.find(c => c.id === d.seller_id);
    const sellerName = seller ? seller.name : 'Sin asignar';
    const stageLabel = STAGES.find(s => s.key === d.stage)?.label || d.stage;
    const value = d.value || 0;
    const date = d.expected_close || '';
    const notes = d.notes || '';
    const status = d.active ? 'Activo' : 'Inactivo';

    return {
      title: d.title,
      client: clientName,
      doc: clientDoc,
      value: value,
      stage: stageLabel,
      date: date,
      notes: notes,
      status: status,
      seller: sellerName
    };
  });

  if (typeof (window as any).exportToExcel === 'function') {
    (window as any).exportToExcel(rows, headers, 'pipeline_crm');
    (window as any).showToast('Reporte de Excel exportado con éxito', 'success');
  } else {
    (window as any).showToast('Función de exportación a Excel no disponible', 'error');
  }
};

// Exponer renderizador global
(window as any).renderCRM = renderCRM;
