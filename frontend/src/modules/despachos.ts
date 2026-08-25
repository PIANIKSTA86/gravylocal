/**
 * GRAVY v2.0 — despachos.ts
 * Módulo de Logística: Gestión de Vehículos, Capacidad de Carga y Despacho de Entregas.
 */

'use strict';

import { SupplyChainOrchestrator } from '../services/supply-chain-orchestrator';

interface Vehicle {
  id: string;
  plate: string;
  transportista_id?: string;
  driver: string;
  capacity: number;
  status: 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO';
  notes: string;
  active: boolean;
  licencia_vence?: string;
  soat_vence?: string;
  tecnomecanica_vence?: string;
  poliza_rc_vence?: string;
  expand?: {
    transportista_id?: { name: string; doc_number?: string; nit?: string };
  };
}

interface Delivery {
  id: string;
  number: string;
  client_id: string;
  vehicle_id: string;
  address: string;
  date: string;
  status: 'PENDIENTE' | 'DESPACHADO' | 'ENTREGADO' | 'DEVUELTO' | 'CANCELADO';
  weight: number;
  notes: string;
  items: string;
  sales_order_id: string;
  invoice_id: string;
  expand?: {
    client_id?: { name: string; doc_number?: string; nit?: string };
    vehicle_id?: { plate: string; driver: string };
    sales_order_id?: { number: string };
    invoice_id?: { number: string };
  };
}

const DELIVERY_STATUS = {
  PENDIENTE:  { label: 'Pendiente',  badge: 'badge-orange' },
  DESPACHADO: { label: 'En camino',  badge: 'badge-blue'   },
  ENTREGADO:  { label: 'Entregado',  badge: 'badge-green'  },
  DEVUELTO:   { label: 'Devuelto',   badge: 'badge-red'    },
  CANCELADO:  { label: 'Cancelado',  badge: 'badge-gray'   },
};

const VEHICLE_STATUS = {
  DISPONIBLE:    { label: 'Disponible',    badge: 'badge-green'  },
  EN_RUTA:       { label: 'En Ruta',       badge: 'badge-blue'   },
  MANTENIMIENTO: { label: 'Mantenimiento', badge: 'badge-orange' },
};

function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDocAlert(dateStr: string | undefined, docName: string, today: string) {
  if (!dateStr) return { status: 'none', text: `${docName}: Sin registrar`, badge: 'bg-gray-100 text-gray-400' };
  if (dateStr < today) {
    return { status: 'expired', text: `${docName}: Vencido hace ${getDaysDifference(today, dateStr)} días (${dateStr})`, badge: 'bg-red-100 text-red-700 font-bold border border-red-200' };
  }
  const days = getDaysDifference(dateStr, today);
  if (days <= 30) {
    return { status: 'near', text: `${docName}: Vence en ${days} días (${dateStr})`, badge: 'bg-amber-100 text-amber-700 font-semibold border border-amber-200' };
  }
  return { status: 'ok', text: `${docName}: Vigente (${dateStr})`, badge: 'bg-green-100 text-green-700 border border-green-200' };
}

function _normType(val: any) {
  return String(val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function _isTransportistaType(typeVal: any) {
  if (Array.isArray(typeVal)) {
    return typeVal.some((v: any) => _isTransportistaType(v));
  }
  const t = _normType(typeVal);
  return t === 'TRANSPORTISTA' || t === 'TRANPORTISTA' || t === 'PROVEEDOR';
}

function _isClientOrSupplierType(typeVal: any) {
  if (Array.isArray(typeVal)) {
    return typeVal.some((v: any) => _isClientOrSupplierType(v));
  }
  const t = _normType(typeVal);
  return t === 'CLIENTE' || t === 'PROVEEDOR';
}

let activeTab: 'deliveries' | 'vehicles' = 'deliveries';

export async function renderDespachos(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo de logística y despachos...</div>`;

  try {
    await _loadDespachosData(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadDespachosData(c: HTMLElement) {
  // 1. Cargar datos del backend
  const [deliveries, vehicles, clients] = await Promise.all([
    (window as any).pb.listAll('logistica_deliveries', { expand: 'client_id,vehicle_id,sales_order_id,invoice_id', sort: '-date,-number' }),
    (window as any).pb.listAll('logistica_vehicles', { sort: 'plate', expand: 'transportista_id' }),
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
  ]);

  (window as any)._desp_deliveries = deliveries;
  (window as any)._desp_vehicles = vehicles;
  (window as any)._desp_clients = clients;

  _repaintDespachosScreen(c, deliveries, vehicles);
}

function _repaintDespachosScreen(c: HTMLElement, deliveries: Delivery[], vehicles: Vehicle[]) {
  // Calcular KPIs
  const activeVehicles = vehicles.filter(v => v.active && v.status === 'DISPONIBLE').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDIENTE' || d.status === 'DESPACHADO').length;
  const completedDeliveries = deliveries.filter(d => d.status === 'ENTREGADO').length;
  const totalWeight = deliveries.filter(d => d.status === 'ENTREGADO' || d.status === 'DESPACHADO').reduce((sum, d) => sum + (d.weight || 0), 0);

  c.innerHTML = `
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Logística y Despachos</h3>
        <p class="text-sm" style="color:#6B7280">Planificación de rutas, vehículos asignados y seguimiento de entregas físicas.</p>
      </div>
      <div class="flex gap-2">
        ${(window as any).can('canWrite') ? `<button class="btn btn-outline" id="btn-pending-sale" title="Abrir facturación con reserva"><i class="fas fa-file-invoice"></i> Facturar con Reserva</button>` : ''}
        ${activeTab === 'deliveries' 
          ? '<button class="btn btn-primary" id="btn-new-delivery"><i class="fas fa-plus"></i> Programar Entrega</button>'
          : '<button class="btn btn-primary" id="btn-new-vehicle"><i class="fas fa-plus"></i> Registrar Vehículo</button>'
        }
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${_despKpi('Vehículos Disponibles', activeVehicles,                     'fas fa-truck',       '#059669', '#ECFDF5')}
      ${_despKpi('Entregas Activas',       pendingDeliveries,                  'fas fa-clock',       '#C46516', '#FFF8F0')}
      ${_despKpi('Entregas Realizadas',    completedDeliveries,                'fas fa-circle-check','#1A4B8C', '#EEF4FF')}
      ${_despKpi('Peso Despachado',        `${(window as any).fmtN(totalWeight)} Kg`, 'fas fa-weight-hanging', '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Tabs Selector -->
    <div class="flex gap-2 border-b mb-4" style="border-color:#F0F0F0">
      <button type="button" class="tab-btn ${activeTab === 'deliveries' ? 'active' : ''}" id="tab-btn-deliveries">
        <i class="fas fa-boxes-packing mr-1"></i> Planificación de Entregas
      </button>
      <button type="button" class="tab-btn ${activeTab === 'vehicles' ? 'active' : ''}" id="tab-btn-vehicles">
        <i class="fas fa-truck-ramp-box mr-1"></i> Control de Flota (Vehículos)
      </button>
    </div>

    <div id="despachos-tab-content">
      ${activeTab === 'deliveries' ? _renderDeliveriesTab(deliveries, vehicles) : _renderVehiclesTab(vehicles)}
    </div>
  `;

  // Asignar listeners
  document.getElementById('tab-btn-deliveries')?.addEventListener('click', () => { activeTab = 'deliveries'; _repaintDespachosScreen(c, deliveries, vehicles); });
  document.getElementById('tab-btn-vehicles')?.addEventListener('click', () => { activeTab = 'vehicles'; _repaintDespachosScreen(c, deliveries, vehicles); });

  document.getElementById('btn-pending-sale')?.addEventListener('click', () => {
    if (typeof (window as any).openPendingDeliverySaleForm === 'function') {
      (window as any).openPendingDeliverySaleForm(() => _loadDespachosData(c));
    } else {
      (window as any).showToast('La acción de facturar con reserva aún no está disponible.', 'warning');
    }
  });

  document.getElementById('btn-new-delivery')?.addEventListener('click', () => _openDeliveryForm(null, () => _loadDespachosData(c)));
  document.getElementById('btn-new-vehicle')?.addEventListener('click', () => _openVehicleForm(null, () => _loadDespachosData(c)));

  if (activeTab === 'deliveries') {
    const applyDelFilters = () => {
      const q = ((document.getElementById('del-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
      const status = (document.getElementById('del-status-f') as HTMLSelectElement)?.value || '';
      const vehicleId = (document.getElementById('del-vehicle-f') as HTMLSelectElement)?.value || '';

      const rows = document.querySelectorAll('#del-table tbody tr[data-delid]');
      rows.forEach((row: any) => {
        const text = row.textContent.toLowerCase();
        const rowStatus = row.getAttribute('data-status');
        const rowVeh = row.getAttribute('data-vehicle');

        const matchQ = !q || text.includes(q);
        const matchStatus = !status || rowStatus === status;
        const matchVeh = !vehicleId || rowVeh === vehicleId;

        row.style.display = (matchQ && matchStatus && matchVeh) ? '' : 'none';
      });
    };

    document.getElementById('del-q')?.addEventListener('input', applyDelFilters);
    document.getElementById('del-status-f')?.addEventListener('change', applyDelFilters);
    document.getElementById('del-vehicle-f')?.addEventListener('change', applyDelFilters);
  }

  const tblDel = document.getElementById('del-table') as HTMLTableElement;
  if (tblDel) (window as any).makeTableSortable(tblDel);
  const tblVeh = document.getElementById('veh-table') as HTMLTableElement;
  if (tblVeh) (window as any).makeTableSortable(tblVeh);
}

function _despKpi(title: string, value: any, icon: string, color: string, bg: string) {
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

function _renderDeliveriesTab(deliveries: Delivery[], vehicles: Vehicle[]) {
  return `
    <!-- Filtros de Entregas -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="del-q" class="form-input flex-1 min-w-48" placeholder="Buscar por consecutivo, cliente, dirección o notas...">
      <select id="del-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        ${Object.entries(DELIVERY_STATUS).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}
      </select>
      <select id="del-vehicle-f" class="form-input" style="max-width:200px">
        <option value="">Todos los vehículos</option>
        ${vehicles.map(v => `<option value="${v.id}">${(window as any).esc(v.plate)} — ${(window as any).esc(v.expand?.transportista_id?.name || v.driver)}</option>`).join('')}
      </select>
    </div>

    <!-- Tabla de Entregas -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="del-table">
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vehículo Asignado</th>
              <th>Dirección de Entrega</th>
              <th class="text-right">Peso (Kg)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${deliveries.length ? deliveries.map(d => {
              const meta = DELIVERY_STATUS[d.status] || { label: d.status, badge: 'badge-gray' };
              const client = d.expand?.client_id;
              const veh = d.expand?.vehicle_id;
              return `
                <tr data-delid="${(window as any).esc(d.id)}" data-status="${(window as any).esc(d.status)}" data-vehicle="${(window as any).esc(d.vehicle_id || '')}">
                  <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(d.number)}</span></td>
                  <td>${(window as any).esc(d.date)}</td>
                  <td class="font-medium">${client ? (window as any).esc(client.name) : '—'}</td>
                  <td>${veh ? `<span class="font-semibold text-xs text-gray-700">${(window as any).esc(veh.plate)}</span> <span class="text-[10px] text-gray-500">(${(window as any).esc(veh.expand?.transportista_id?.name || veh.driver)})</span>` : '<span class="text-orange-600 font-semibold italic text-xs">Sin asignar</span>'}</td>
                  <td class="text-xs truncate max-w-xs" title="${(window as any).esc(d.address)}">${(window as any).esc(d.address)}</td>
                  <td class="text-right font-mono text-xs">${d.weight ? (window as any).fmtN(d.weight) : '—'}</td>
                  <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                  <td>
                    <div class="flex gap-1 flex-wrap">
                      <button class="btn btn-outline btn-sm" title="Imprimir Hoja de Ruta" onclick="window._printHojaRuta('${(window as any).esc(d.id)}')"><i class="fas fa-print"></i></button>
                      <button class="btn btn-outline btn-sm" title="Editar" onclick="window._editDelivery('${(window as any).esc(d.id)}')"><i class="fas fa-pen"></i></button>
                      ${!d.invoice_id ? `
                        <button class="btn btn-primary btn-sm" title="Facturar esta entrega" onclick="window.invoiceDeliveryDirect('${(window as any).esc(d.id)}')"><i class="fas fa-file-invoice-dollar mr-1"></i> Facturar</button>
                      ` : `
                        <button class="btn btn-outline btn-sm text-green-600" style="border-color:#059669" title="Ver Factura Vinculada" onclick="window.viewSalesInvoiceFromDelivery('${(window as any).esc(d.invoice_id)}')"><i class="fas fa-file-invoice"></i></button>
                      `}
                      <button class="btn btn-danger btn-sm" title="Eliminar" onclick="window._deleteDelivery('${(window as any).esc(d.id)}', '${(window as any).esc(d.number)}')"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-boxes-packing mr-2"></i>No hay despachos ni entregas programadas.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function _renderVehiclesTab(vehicles: Vehicle[]) {
  return `
    <!-- Tabla de Flota -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="veh-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Conductor</th>
              <th class="text-right">Capacidad de Carga</th>
              <th>Documentación</th>
              <th>Estado</th>
              <th>Habilitado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${vehicles.length ? vehicles.map(v => {
              const meta = VEHICLE_STATUS[v.status] || { label: v.status, badge: 'badge-gray' };
              const today = (window as any).todayStr();
              const licAlert = getDocAlert(v.licencia_vence, 'Licencia', today);
              const soatAlert = getDocAlert(v.soat_vence, 'SOAT', today);
              const tecAlert = getDocAlert(v.tecnomecanica_vence, 'Tecnicomecánica', today);
              const rcAlert = getDocAlert(v.poliza_rc_vence, 'Póliza RC', today);
              
              const docBadge = (alert: any, label: string) => {
                return `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${alert.badge}" title="${(window as any).esc(alert.text)}">${label}</span>`;
              };
              return `
                <tr>
                  <td><span class="font-mono font-bold text-gray-800" style="font-size:13px">${(window as any).esc(v.plate)}</span></td>
                  <td class="font-medium">${(window as any).esc(v.expand?.transportista_id?.name || v.driver)}</td>
                  <td class="text-right font-mono text-xs font-semibold text-blue-700">${(window as any).fmtN(v.capacity)} Kg</td>
                  <td>
                    <div class="flex gap-1 items-center font-sans">
                      ${docBadge(licAlert, 'L')}
                      ${docBadge(soatAlert, 'S')}
                      ${docBadge(tecAlert, 'T')}
                      ${docBadge(rcAlert, 'P')}
                    </div>
                  </td>
                  <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                  <td>${v.active !== false ? '<span class="badge badge-green">Sí</span>' : '<span class="badge badge-gray">No</span>'}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Editar" onclick="window._editVehicle('${(window as any).esc(v.id)}')"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-danger btn-sm" title="Eliminar" onclick="window._deleteVehicle('${(window as any).esc(v.id)}', '${(window as any).esc(v.plate)}')"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr><td colspan="6" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-truck-fast mr-2"></i>No hay vehículos de flota registrados.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// VEHICULOS ACCIONES
// ==========================================
async function _openVehicleForm(veh: Vehicle | null = null, onDone: any = null) {
  const transportistas = await (window as any).pb.listAll('third_parties', {
    filter: 'active=true',
    sort: 'name',
  }).then((list: any[]) => list.filter((item: any) => _isTransportistaType(item.type))).catch(() => []);

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Placa del Vehículo <span style="color:#EF4444">*</span></label>
          <input id="veh-plate" class="form-input font-mono" placeholder="Ej: AAA-123" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" value="${(window as any).esc(veh?.plate || '')}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Transportista <span style="color:#EF4444">*</span></label>
          <div id="veh-transportista-search-wrap" class="relative flex gap-1 items-center">
            <input id="veh-transportista-search" class="form-input flex-1" autocomplete="off" placeholder="NIT o nombre del transportista...">
            <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window._despQuickAddTransportista()" title="Nuevo Transportista" style="border-color:#D1D5DB; background:#fff;">
              <i class="fas fa-user-plus text-xs" style="color:#4B5563"></i>
            </button>
            <input id="veh-transportista-id" type="hidden" value="${(window as any).esc(veh?.transportista_id || '')}">
            <div id="veh-transportista-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Capacidad Carga (Kg) <span style="color:#EF4444">*</span></label>
          <input id="veh-capacity" type="number" min="0" class="form-input text-right font-semibold text-blue-700" placeholder="0" value="${veh?.capacity ?? ''}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Estado Flota <span style="color:#EF4444">*</span></label>
          <select id="veh-status" class="form-input">
            ${Object.entries(VEHICLE_STATUS).map(([key, val]) => `<option value="${key}" ${veh?.status === key ? 'selected' : ''}>${val.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Habilitado</label>
          <select id="veh-active" class="form-input">
            <option value="true" ${veh?.active !== false ? 'selected' : ''}>Sí</option>
            <option value="false" ${veh?.active === false ? 'selected' : ''}>No</option>
          </select>
        </div>
      </div>

      <!-- Control de Documentación -->
      <div class="border-t pt-3" style="border-color:#F0F0F0">
        <h4 class="font-bold text-xs uppercase tracking-wider mb-2 text-blue-800 flex items-center gap-1">
          <i class="fas fa-file-shield"></i> Control de Documentación (Vencimientos)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-group">
            <label class="form-label font-bold">Vencimiento Licencia de Conducción</label>
            <input id="veh-licencia-vence" type="date" class="form-input" value="${veh?.licencia_vence || ''}">
          </div>
          <div class="form-group">
            <label class="form-label font-bold">Vencimiento SOAT</label>
            <input id="veh-soat-vence" type="date" class="form-input" value="${veh?.soat_vence || ''}">
          </div>
          <div class="form-group">
            <label class="form-label font-bold">Vencimiento Tecnicomecánica</label>
            <input id="veh-tecnomecanica-vence" type="date" class="form-input" value="${veh?.tecnomecanica_vence || ''}">
          </div>
          <div class="form-group">
            <label class="form-label font-bold">Vencimiento Póliza Responsabilidad Civil</label>
            <input id="veh-poliza-rc-vence" type="date" class="form-input" value="${veh?.poliza_rc_vence || ''}">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Notas del Vehículo</label>
        <textarea id="veh-notes" class="form-input" rows="3" placeholder="Detalles mecánicos, tipo de furgón, etc...">${(window as any).esc(veh?.notes || '')}</textarea>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-vehicle"><i class="fas fa-floppy-disk"></i> Guardar Vehículo</button>
  `;

  (window as any).openModal(veh ? `Editar Vehículo: ${veh.plate}` : 'Registrar Nuevo Vehículo', formHtml, footer, false);

  function initVehTransportistaSearch() {
    const input = document.getElementById('veh-transportista-search') as HTMLInputElement;
    const hidden = document.getElementById('veh-transportista-id') as HTMLInputElement;
    const results = document.getElementById('veh-transportista-results') as HTMLElement;
    if (!input || !hidden || !results) return;

    const current = veh?.transportista_id ? transportistas.find((t: any) => t.id === veh.transportista_id) : transportistas.find((t: any) => String(t.name || '').toLowerCase() === String(veh?.driver || '').toLowerCase());
    if (current) {
      hidden.value = current.id;
      input.value = `${current.doc_number || current.nit || ''} - ${current.name}`;
    } else if (veh?.driver) {
      input.value = veh.driver;
    }

    let highlighted = -1;

    const highlightItem = (idx: number, items: NodeListOf<Element>) => {
      items.forEach((el: any) => { el.style.background = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
        (items[idx] as any).scrollIntoView({ block: 'nearest' });
      }
    };

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query
        ? transportistas.slice(0, 30)
        : transportistas.filter((t: any) => `${t.name} ${t.doc_number} ${t.nit}`.toLowerCase().includes(query)).slice(0, 30);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        highlighted = -1;
        return;
      }

      results.innerHTML = filtered.map((t: any, i: number) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window._despSelectTransportista('${(window as any).esc(t.id)}', '${(window as any).esc(t.doc_number || t.nit || '')} - ${(window as any).esc(t.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(t.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${t.doc_number || t.nit || 'S/N'}</div>
        </button>
      `).join('');
      highlighted = -1;
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      const items = results.querySelectorAll('button');
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        highlighted = Math.min(highlighted + 1, items.length - 1);
        highlightItem(highlighted, items);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        highlighted = Math.max(highlighted - 1, 0);
        highlightItem(highlighted, items);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (!input.value.trim()) return;
        const query = input.value.toLowerCase().trim();
        const filtered = transportistas.filter((t: any) => `${t.name} ${t.doc_number} ${t.nit}`.toLowerCase().includes(query)).slice(0, 30);
        const selected = highlighted >= 0 ? filtered[highlighted] : filtered[0];
        if (selected) {
          (window as any)._despSelectTransportista(selected.id, `${selected.doc_number || selected.nit || ''} - ${selected.name}`);
        }
      } else if (ev.key === 'Escape') {
        results.style.display = 'none';
      }
    });

    results.addEventListener('mousedown', (ev) => ev.preventDefault());
  }

  (window as any)._despSelectTransportista = function(id: string, text: string) {
    const hidden = document.getElementById('veh-transportista-id') as HTMLInputElement;
    const input = document.getElementById('veh-transportista-search') as HTMLInputElement;
    const results = document.getElementById('veh-transportista-results') as HTMLElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
      if (results) results.style.display = 'none';
    }
  };

  (window as any)._despQuickAddTransportista = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm({ type: 'PROVEEDOR' }, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          const latestTransportistas = thirds.filter((item: any) => _isTransportistaType(item.type));
          transportistas.length = 0;
          transportistas.push(...latestTransportistas);
          const currentInput = document.getElementById('veh-transportista-search') as HTMLInputElement;
          (window as any)._despTransportistasCache = latestTransportistas;
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
          (window as any)._despSelectTransportista(createdRecord.id, selectText);
          if (currentInput) currentInput.focus();
          (window as any).showToast('Transportista creado y seleccionado.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar transportistas: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  initVehTransportistaSearch();

  setTimeout(() => {
    const input = document.getElementById('veh-transportista-search') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.select();
    }
  }, 80);

  document.getElementById('btn-save-vehicle')?.addEventListener('click', async () => {
    try {
      const plate = (document.getElementById('veh-plate') as HTMLInputElement)?.value.trim();
      const transportistaId = (document.getElementById('veh-transportista-id') as HTMLInputElement)?.value.trim();
      const transportistaText = (document.getElementById('veh-transportista-search') as HTMLInputElement)?.value.trim();
      const capacity = parseFloat((document.getElementById('veh-capacity') as HTMLInputElement)?.value || '0');
      const status = (document.getElementById('veh-status') as HTMLSelectElement)?.value;
      const active = (document.getElementById('veh-active') as HTMLSelectElement)?.value === 'true';
      const notes = (document.getElementById('veh-notes') as HTMLTextAreaElement)?.value.trim();
      const licencia_vence = (document.getElementById('veh-licencia-vence') as HTMLInputElement)?.value || '';
      const soat_vence = (document.getElementById('veh-soat-vence') as HTMLInputElement)?.value || '';
      const tecnomecanica_vence = (document.getElementById('veh-tecnomecanica-vence') as HTMLInputElement)?.value || '';
      const poliza_rc_vence = (document.getElementById('veh-poliza-rc-vence') as HTMLInputElement)?.value || '';

      if (!plate) throw new Error('Por favor ingresa la placa del vehículo.');
      if (!transportistaText) throw new Error('Por favor selecciona un transportista.');
      if (isNaN(capacity) || capacity <= 0) throw new Error('La capacidad de carga debe ser mayor a cero.');

      const selectedTransportista = transportistas.find((t: any) => t.id === transportistaId) || transportistas.find((t: any) => {
        const normalizedText = transportistaText.toLowerCase().replace(/\s+/g, ' ').trim();
        const normalizedName = String(t.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const normalizedDoc = String(t.doc_number || t.nit || '').toLowerCase().replace(/\s+/g, ' ').trim();
        return normalizedText === normalizedName || (normalizedDoc && normalizedText.includes(normalizedDoc));
      }) || null;
      if (!selectedTransportista) {
        throw new Error('Debes seleccionar un transportista de la lista o crearlo antes de guardar.');
      }
      const driver = selectedTransportista.name;
      const data = { 
        plate, 
        driver, 
        transportista_id: selectedTransportista.id, 
        capacity, 
        status, 
        active, 
        notes,
        licencia_vence,
        soat_vence,
        tecnomecanica_vence,
        poliza_rc_vence
      };

      const today = (window as any).todayStr();
      const expiredDocs: string[] = [];
      if (licencia_vence && licencia_vence < today) expiredDocs.push('Licencia');
      if (soat_vence && soat_vence < today) expiredDocs.push('SOAT');
      if (tecnomecanica_vence && tecnomecanica_vence < today) expiredDocs.push('Tecnicomecánica');
      if (poliza_rc_vence && poliza_rc_vence < today) expiredDocs.push('Póliza RC');

      if (veh) {
        await (window as any).pb.update('logistica_vehicles', veh.id, data);
        if (expiredDocs.length > 0) {
          (window as any).showToast(`Vehículo actualizado, pero tiene documentos vencidos: ${expiredDocs.join(', ')}`, 'warning');
        } else {
          (window as any).showToast('Vehículo actualizado correctamente', 'success');
        }
        await (window as any).API.logAudit('UPDATE', 'logistica_vehicles', veh.id, `Vehículo con placa "${plate}" modificado`);
      } else {
        const created = await (window as any).pb.create('logistica_vehicles', data);
        if (expiredDocs.length > 0) {
          (window as any).showToast(`Vehículo registrado, pero tiene documentos vencidos: ${expiredDocs.join(', ')}`, 'warning');
        } else {
          (window as any).showToast('Vehículo registrado correctamente', 'success');
        }
        await (window as any).API.logAudit('CREATE', 'logistica_vehicles', created.id, `Vehículo con placa "${plate}" y transportista "${driver}" registrado`);
      }

      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message || 'Error al guardar vehículo', 'error');
    }
  });
}

(window as any)._editVehicle = function(id: string) {
  const list: Vehicle[] = (window as any)._desp_vehicles || [];
  const veh = list.find(v => v.id === id);
  if (veh) {
    _openVehicleForm(veh, () => {
      const activeContent = document.getElementById('page-content');
      if (activeContent) renderDespachos(activeContent);
    });
  }
};

(window as any)._deleteVehicle = async function(id: string, plate: string) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el vehículo con placa "${plate}"?`)) return;

  try {
    await (window as any).pb.delete('logistica_vehicles', id);
    (window as any).showToast('Vehículo eliminado con éxito', 'success');
    await (window as any).API.logAudit('DELETE', 'logistica_vehicles', id, `Vehículo con placa "${plate}" eliminado de la flota`);

    const activeContent = document.getElementById('page-content');
    if (activeContent) renderDespachos(activeContent);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al eliminar vehículo', 'error');
  }
};

// ==========================================
// ENTREGAS ACCIONES
// ==========================================
async function _openDeliveryForm(del: Delivery | null = null, onDone: any = null) {
  const clients = (window as any)._desp_clients || [];
  const deliveryThirdParties = clients.filter((c: any) => _isClientOrSupplierType(c.type));
  const vehicles = (window as any)._desp_vehicles || [];
  const activeVehicles = vehicles.filter((v: any) => v.active && v.status === 'DISPONIBLE');

  // Si estamos editando, incluimos el vehículo actual de la entrega aunque esté ocupado/inactivo
  if (del && del.vehicle_id) {
    const currentVeh = vehicles.find((v: any) => v.id === del.vehicle_id);
    if (currentVeh && !activeVehicles.find((v: any) => v.id === currentVeh.id)) {
      activeVehicles.push(currentVeh);
    }
  }

  const invoices = await (window as any).pb.listAll('invoices', { sort: '-number', expand: 'customer_id' }).catch(() => []);
  const originalVehicleOptionLabel: Record<string, string> = {};

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const isPendingDeliveryInvoice = (inv: any) => {
    const status = String(inv?.status || '').toLowerCase();
    const hasPending = !!inv?.has_pending_delivery;
    const fulfillment = String(inv?.delivery_fulfillment_status || '').toUpperCase().trim();
    const pendingByStatus = fulfillment === 'PENDIENTE' || fulfillment === 'PARCIAL' || fulfillment === '';
    return status === 'posted' && hasPending && pendingByStatus;
  };

  const invoiceWeightCache: Record<string, number> = {};
  const invoiceLinesCache: Record<string, any[]> = {};
  const invoiceLabelCache: Record<string, string> = {};

  const getInvoiceLabel = (inv: any) => `${inv.number} (${(window as any).fmt(inv.total || 0)})`;

  const calcInvoiceWeightKg = async (invoiceId: string) => {
    if (!invoiceId) return 0;
    if (invoiceWeightCache[invoiceId] !== undefined) return invoiceWeightCache[invoiceId];

    const lines = await (window as any).API.getInvoiceLines(invoiceId).catch(() => []);
    const total = (lines || []).reduce((sum: number, l: any) => {
      const qty = Math.max(0, toNum(l.qty));
      const byLineBruto = toNum(l.peso_bruto_total);
      const byLineNeto = toNum(l.peso_neto_total);
      const prod = l.expand?.product_id || {};
      const unitWeight = toNum(prod.peso_bruto) || toNum(prod.peso_neto) || toNum(prod.weight) || toNum(prod.unit_weight);
      const lineWeight = byLineBruto > 0 ? byLineBruto : (byLineNeto > 0 ? byLineNeto : (qty * unitWeight));
      return sum + Math.max(0, lineWeight);
    }, 0);

    invoiceWeightCache[invoiceId] = total;
    return total;
  };

  const getInvoiceLinesCached = async (invoiceId: string) => {
    if (!invoiceId) return [];
    if (invoiceLinesCache[invoiceId]) return invoiceLinesCache[invoiceId];
    const lines = await (window as any).API.getInvoiceLines(invoiceId).catch(() => []);
    invoiceLinesCache[invoiceId] = Array.isArray(lines) ? lines : [];
    return invoiceLinesCache[invoiceId];
  };

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Consecutivo Despacho</label>
          <input id="del-number" class="form-input font-mono" readonly value="${(window as any).esc(del?.number || 'AUTO')}" style="background:#F3F4F6">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Fecha Entrega <span style="color:#EF4444">*</span></label>
          <input id="del-date" type="date" class="form-input" value="${del?.date || (window as any).todayStr()}">
        </div>
      </div>

      <div class="form-group relative">
        <label class="form-label font-bold">Cliente <span style="color:#EF4444">*</span></label>
        <div id="del-client-search-wrap" class="relative flex gap-1 items-center">
          <input id="del-client-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del tercero...">
          <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window._despQuickAddCustomer()" title="Nuevo Tercero" style="border-color:#D1D5DB; background:#fff;">
            <i class="fas fa-user-plus text-xs" style="color:#4B5563"></i>
          </button>
          <input id="del-client-id" type="hidden" value="${(window as any).esc(del?.client_id || '')}">
          <div id="del-client-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:160px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:100"></div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Dirección de Entrega <span style="color:#EF4444">*</span></label>
        <input id="del-address" class="form-input" placeholder="Ej: Calle 10 # 5-43, Furgón 3" value="${(window as any).esc(del?.address || '')}">
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Vehículo / Conductor</label>
          <select id="del-vehicle" class="form-input">
            <option value="">— Sin asignar —</option>
            ${activeVehicles.map((v: any) => `<option value="${(window as any).esc(v.id)}"${del?.vehicle_id === v.id ? ' selected' : ''}>${(window as any).esc(v.plate)} — ${(window as any).esc(v.expand?.transportista_id?.name || v.driver)}</option>`).join('')}
          </select>
          <div id="del-vehicle-capacity-hint" class="text-xs mt-1" style="color:#6B7280">Selecciona factura(s) para validar capacidad mínima de carga.</div>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Peso Carga (Kg)</label>
          <input id="del-weight" type="number" min="0" step="0.01" class="form-input text-right font-semibold" placeholder="0" value="${del?.weight ?? ''}" readonly style="background:#F9FAFB">
          <div class="text-xs mt-1" style="color:#6B7280">Cálculo automático según los productos de las facturas vinculadas.</div>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Estado Despacho <span style="color:#EF4444">*</span></label>
          <select id="del-status" class="form-input">
            ${Object.entries(DELIVERY_STATUS).map(([key, val]) => `<option value="${key}" ${del?.status === key ? 'selected' : ''}>${val.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Alertas de Vehículo y Agendamiento -->
      <div id="del-vehicle-alerts-wrapper" class="space-y-2">
        <div id="del-vehicle-doc-alerts"></div>
        <div id="del-vehicle-schedule-info"></div>
        <div id="del-vehicle-week-agenda-panel" class="hidden border rounded-xl p-3 bg-gray-50 mt-3" style="border-color:#E5E7EB"></div>
      </div>

      <div class="border-t pt-3" style="border-color:#F0F0F0">
        <div class="form-group">
          <label class="form-label font-bold">Vincular a Factura(s) de Venta (Pendientes)</label>
          <div id="del-invoice-list" class="rounded-xl border p-2" style="border-color:#E5E7EB; max-height:220px; overflow:auto; background:#fff"></div>
          <input id="del-invoice-ids" type="hidden" value="${(window as any).esc(del?.invoice_id || '')}">
          <div class="text-xs mt-1" style="color:#6B7280">Solo se muestran facturas vigentes del cliente con entrega pendiente. Puedes seleccionar una o varias.</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Ítems / Detalles de la Carga <span style="color:#EF4444">*</span></label>
        <textarea id="del-items" class="form-input" rows="3" placeholder="Ej: 10 Cajas de Producto A, 5 Bolsas de Producto B...">${(window as any).esc(del?.items || '')}</textarea>
        <div class="flex items-center justify-between mt-1 gap-2">
          <div class="text-xs" style="color:#6B7280">Se autocompleta con el consolidado de productos de las facturas seleccionadas.</div>
          <button type="button" id="btn-del-items-autofill" class="btn btn-outline btn-sm">Autocompletar</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Observaciones de Entrega</label>
        <input id="del-notes" class="form-input" placeholder="Ej: llamar al cliente al llegar, ingresar por portería trasera..." value="${(window as any).esc(del?.notes || '')}">
        <div class="flex items-center justify-between mt-1 gap-2">
          <div class="text-xs" style="color:#6B7280">Puedes autogenerar una observación base y luego editarla.</div>
          <button type="button" id="btn-del-notes-autofill" class="btn btn-outline btn-sm">Autocompletar</button>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-delivery"><i class="fas fa-floppy-disk"></i> Programar Entrega</button>
  `;

  (window as any).openModal(del ? `Editar Entrega: ${del.number}` : 'Programar Nueva Entrega', formHtml, footer, true);

  // Inicializar buscador autocompletable de terceros (clientes/proveedores)
  const input = document.getElementById('del-client-search') as HTMLInputElement;
  const hidden = document.getElementById('del-client-id') as HTMLInputElement;
  const results = document.getElementById('del-client-results');

  if (input && hidden && results) {
    if (del && del.client_id) {
      const match = deliveryThirdParties.find((c: any) => c.id === del.client_id) || clients.find((c: any) => c.id === del.client_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query 
        ? deliveryThirdParties.slice(0, 20)
        : deliveryThirdParties.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(query)).slice(0, 20);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((c: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window._selectDelClient('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    results.addEventListener('mousedown', (ev) => ev.preventDefault());

    if (typeof (window as any).initKeyboardAutocomplete === 'function') {
      (window as any).initKeyboardAutocomplete({
        input,
        results,
        itemSelector: 'button',
      });
    }

    (window as any)._selectDelClient = function(id: string, text: string) {
      hidden.value = id;
      input.value = text;
      results.style.display = 'none';
      void refreshInvoiceSelectorAndCapacity();
    };
  }

  const dateInput = document.getElementById('del-date') as HTMLInputElement | null;
  const invoiceList = document.getElementById('del-invoice-list') as HTMLElement | null;
  const invoiceIdsHidden = document.getElementById('del-invoice-ids') as HTMLInputElement | null;
  const vehicleSelect = document.getElementById('del-vehicle') as HTMLSelectElement | null;
  const weightInput = document.getElementById('del-weight') as HTMLInputElement | null;
  const vehicleHint = document.getElementById('del-vehicle-capacity-hint') as HTMLElement | null;
  const itemsInput = document.getElementById('del-items') as HTMLTextAreaElement | null;
  const autofillItemsBtn = document.getElementById('btn-del-items-autofill') as HTMLButtonElement | null;
  const notesInput = document.getElementById('del-notes') as HTMLInputElement | null;
  const autofillNotesBtn = document.getElementById('btn-del-notes-autofill') as HTMLButtonElement | null;

  let itemsDirtyByUser = !!(del?.items || '').trim();
  let lastAutoItemsValue = '';
  let notesDirtyByUser = !!(del?.notes || '').trim();
  let lastAutoNotesValue = '';

  const parseSelectedInvoiceIds = () => {
    if (!invoiceList) return [] as string[];
    const ids = Array.from(invoiceList.querySelectorAll('input[type="checkbox"][data-invoice-id]:checked'))
      .map((el: any) => String(el.getAttribute('data-invoice-id') || '').trim())
      .filter(Boolean);
    return Array.from(new Set(ids));
  };

  const setSelectedInvoiceIdsHidden = (ids: string[]) => {
    if (invoiceIdsHidden) invoiceIdsHidden.value = ids.join(',');
  };

  const getClientId = () => ((document.getElementById('del-client-id') as HTMLInputElement)?.value || '').trim();

  const renderInvoiceSelector = (selectedIds: string[]) => {
    if (!invoiceList) return;
    const clientId = getClientId();
    if (!clientId) {
      invoiceList.innerHTML = '<div class="px-2 py-3 text-xs text-gray-500">Selecciona primero un cliente/proveedor para cargar sus facturas pendientes.</div>';
      return;
    }

    const pendingForClient = invoices.filter((inv: any) => inv.customer_id === clientId && isPendingDeliveryInvoice(inv));

    // En edición, mantener visible la factura previamente vinculada aunque no esté pendiente.
    if (del?.invoice_id && !pendingForClient.find((x: any) => x.id === del.invoice_id)) {
      const oldInv = invoices.find((x: any) => x.id === del.invoice_id && x.customer_id === clientId);
      if (oldInv) pendingForClient.push(oldInv);
    }

    if (!pendingForClient.length) {
      invoiceList.innerHTML = '<div class="px-2 py-3 text-xs text-gray-500">No hay facturas vigentes con entrega pendiente para este cliente.</div>';
      return;
    }

    pendingForClient.forEach((inv: any) => {
      invoiceLabelCache[inv.id] = getInvoiceLabel(inv);
    });

    invoiceList.innerHTML = pendingForClient.map((inv: any) => {
      const checked = selectedIds.includes(inv.id);
      const deliveryStatus = String(inv.delivery_fulfillment_status || '').toUpperCase().trim() || 'PENDIENTE';
      const amount = (window as any).fmt(inv.total || 0);
      return `
        <label class="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer" style="border:1px solid #F3F4F6">
          <span class="flex items-center gap-2 min-w-0">
            <input type="checkbox" data-invoice-id="${(window as any).esc(inv.id)}" ${checked ? 'checked' : ''}>
            <span class="text-xs min-w-0">
              <strong class="font-mono">${(window as any).esc(inv.number)}</strong>
              <span style="color:#6B7280"> - ${amount}</span>
            </span>
          </span>
          <span class="badge ${deliveryStatus === 'PARCIAL' ? 'badge-blue' : 'badge-orange'}">${deliveryStatus}</span>
        </label>
      `;
    }).join('');
  };

  const buildItemsSummaryFromLines = (lines: any[]) => {
    const grouped = new Map<string, { qty: number; name: string }>();

    for (const ln of lines || []) {
      const qty = Math.max(0, toNum(ln?.qty));
      if (qty <= 0) continue;
      const prod = ln?.expand?.product_id;
      const name = String(prod?.name || ln?.description || ln?.product_name || ln?.product_id || 'Producto').trim();
      const key = String(ln?.product_id || name).trim() || name;
      const current = grouped.get(key) || { qty: 0, name };
      current.qty += qty;
      if (!current.name && name) current.name = name;
      grouped.set(key, current);
    }

    if (!grouped.size) return '';

    return Array.from(grouped.values())
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
      .map((it) => `${(window as any).fmtN(it.qty)} x ${it.name}`)
      .join('\n');
  };

  const refreshItemsFromSelectedInvoices = async (force = false) => {
    if (!itemsInput) return;
    if (itemsDirtyByUser && !force) return;

    const selectedIds = parseSelectedInvoiceIds();
    if (!selectedIds.length) {
      if (force) {
        itemsInput.value = '';
        lastAutoItemsValue = '';
        itemsDirtyByUser = false;
      }
      return;
    }

    const allLines = (await Promise.all(selectedIds.map((id) => getInvoiceLinesCached(id)))).flat();
    const summary = buildItemsSummaryFromLines(allLines);
    if (summary) {
      itemsInput.value = summary;
      lastAutoItemsValue = summary;
      itemsDirtyByUser = false;
    }
  };

  const buildAutoNotesText = () => {
    const selectedIds = parseSelectedInvoiceIds();
    const invoiceNumbers = selectedIds
      .map((id) => {
        const inv = invoices.find((x: any) => x.id === id);
        return inv?.number || '';
      })
      .filter(Boolean);
    const weightVal = toNum(weightInput?.value || 0);
    const addressVal = ((document.getElementById('del-address') as HTMLInputElement)?.value || '').trim();

    const parts: string[] = [];
    if (invoiceNumbers.length) parts.push(`Entrega asociada a factura(s): ${invoiceNumbers.join(', ')}`);
    if (weightVal > 0) parts.push(`Peso estimado de carga: ${(window as any).fmtN(weightVal)} Kg`);
    if (addressVal) parts.push(`Destino: ${addressVal}`);
    return parts.join(' | ');
  };

  const refreshNotesFromSelectedInvoices = (force = false) => {
    if (!notesInput) return;
    if (notesDirtyByUser && !force) return;

    const autoText = buildAutoNotesText();
    if (!autoText && !force) return;

    notesInput.value = autoText;
    lastAutoNotesValue = autoText;
    notesDirtyByUser = false;
  };

  const checkSelectedVehicleDocs = () => {
    const vehicleId = vehicleSelect?.value;
    const alertContainer = document.getElementById('del-vehicle-doc-alerts');
    if (!alertContainer) return;
    alertContainer.innerHTML = '';

    if (!vehicleId) return;

    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return;

    const today = (window as any).todayStr();
    const alerts = [
      getDocAlert(vehicle.licencia_vence, 'Licencia de Conducción', today),
      getDocAlert(vehicle.soat_vence, 'SOAT', today),
      getDocAlert(vehicle.tecnomecanica_vence, 'Revisión Tecnicomecánica', today),
      getDocAlert(vehicle.poliza_rc_vence, 'Póliza de Responsabilidad Civil', today)
    ];

    const expiredAlerts = alerts.filter(a => a.status === 'expired');
    const nearAlerts = alerts.filter(a => a.status === 'near');

    if (expiredAlerts.length > 0 || nearAlerts.length > 0) {
      let alertHtml = `
        <div class="p-3 rounded-xl border mt-2 text-xs space-y-1 bg-amber-50" style="border-color:#FDE68A; color:#92400E font-sans">
          <div class="font-bold flex items-center gap-1 mb-1">
            <i class="fas fa-triangle-exclamation"></i> Alertas de Documentación del Vehículo:
          </div>
      `;

      if (expiredAlerts.length > 0) {
        alertHtml += `
          <div class="space-y-1">
            <div class="font-semibold text-red-700">Documentación VENCIDA (¡Acción Requerida!):</div>
            <ul class="list-disc pl-4 space-y-0.5 text-red-700">
              ${expiredAlerts.map(a => `<li>${(window as any).esc(a.text)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (nearAlerts.length > 0) {
        alertHtml += `
          <div class="space-y-1 ${expiredAlerts.length > 0 ? 'mt-2' : ''}">
            <div class="font-semibold text-amber-700">Documentación Próxima a Vencer:</div>
            <ul class="list-disc pl-4 space-y-0.5 text-amber-700">
              ${nearAlerts.map(a => `<li>${(window as any).esc(a.text)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      alertHtml += `</div>`;
      alertContainer.innerHTML = alertHtml;
    }
  };

  const checkVehicleSchedule = () => {
    const vehicleId = vehicleSelect?.value;
    const dateVal = dateInput?.value;
    const scheduleContainer = document.getElementById('del-vehicle-schedule-info');
    if (!scheduleContainer) return;
    scheduleContainer.innerHTML = '';

    if (!vehicleId || !dateVal) return;

    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return;

    const allDeliveries: Delivery[] = (window as any)._desp_deliveries || [];
    const sameDayDeliveries = allDeliveries.filter(d => 
      d.vehicle_id === vehicleId && 
      d.date === dateVal && 
      d.status !== 'CANCELADO' && 
      d.id !== (del?.id || '')
    );

    const vehicleCapacity = toNum(vehicle.capacity);
    const currentDeliveryWeight = parseFloat(weightInput?.value || '0') || 0;
    const otherDeliveriesWeight = sameDayDeliveries.reduce((sum, d) => sum + toNum(d.weight), 0);
    const totalCommittedWeight = otherDeliveriesWeight + currentDeliveryWeight;

    const percentUsed = vehicleCapacity > 0 ? (totalCommittedWeight / vehicleCapacity) * 100 : 0;

    let scheduleHtml = '';

    const viewAgendaBtn = `
      <button type="button" class="btn btn-outline btn-xs flex items-center gap-1 mt-1 text-blue-700" 
              onclick="window._despToggleWeekAgenda('${(window as any).esc(vehicleId)}', '${(window as any).esc(dateVal)}')">
        <i class="fas fa-calendar-days"></i> Ver agenda semanal de este vehículo
      </button>
    `;

    if (sameDayDeliveries.length > 0) {
      const isOverCapacity = totalCommittedWeight > vehicleCapacity;
      const alertBg = isOverCapacity ? '#FEF2F2' : '#EFF6FF';
      const alertBorder = isOverCapacity ? '#FCA5A5' : '#BFDBFE';
      const alertText = isOverCapacity ? '#991B1B' : '#1E40AF';
      const alertIcon = isOverCapacity ? 'fa-triangle-exclamation' : 'fa-info-circle';

      scheduleHtml = `
        <div class="p-3 rounded-xl border mt-2 text-xs space-y-2" style="background:${alertBg}; border-color:${alertBorder}; color:${alertText}">
          <div class="font-bold flex items-center justify-between">
            <span class="flex items-center gap-1">
              <i class="fas ${alertIcon}"></i> Asignaciones para esta fecha (${(window as any).fmtDate(dateVal)}):
            </span>
            <span class="font-semibold px-2 py-0.5 rounded ${isOverCapacity ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}">
              Carga total: ${(window as any).fmtN(totalCommittedWeight)} / ${(window as any).fmtN(vehicleCapacity)} Kg (${percentUsed.toFixed(1)}%)
            </span>
          </div>
          <div class="text-[11px] space-y-1">
            <div class="font-semibold text-gray-700">Otras entregas programadas hoy (${sameDayDeliveries.length}):</div>
            <ul class="list-disc pl-4 space-y-0.5 text-gray-600">
              ${sameDayDeliveries.map(d => {
                const clientName = d.expand?.client_id?.name || 'Cliente';
                return `<li><strong>${(window as any).esc(d.number)}</strong>: ${clientName.slice(0, 25)} (${(window as any).fmtN(d.weight || 0)} Kg) - ${(window as any).esc(d.address)}</li>`;
              }).join('')}
            </ul>
          </div>
          ${isOverCapacity ? `
            <div class="font-bold text-red-700 flex items-center gap-1 mt-1">
              <i class="fas fa-circle-exclamation"></i> ¡ALERTA DE CAPACIDAD! La carga total supera la capacidad máxima del vehículo por ${(window as any).fmtN(totalCommittedWeight - vehicleCapacity)} Kg.
            </div>
          ` : ''}
          <div class="flex justify-end pt-1">
            ${viewAgendaBtn}
          </div>
        </div>
      `;
    } else {
      scheduleHtml = `
        <div class="p-2 rounded-xl border mt-2 text-xs flex items-center justify-between" style="background:#F0FDF4; border-color:#BBF7D0; color:#166534">
          <span class="flex items-center gap-1 font-medium">
            <i class="fas fa-circle-check"></i> Disponible: Sin otras entregas programadas para esta fecha.
          </span>
          ${viewAgendaBtn}
        </div>
      `;
    }

    scheduleContainer.innerHTML = scheduleHtml;
  };

  const getWeekDays = (baseDate: Date) => {
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate.setDate(diff));
    
    const days: { dateStr: string; dateObj: Date; label: string }[] = [];
    const weekdaysNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      days.push({
        dateStr,
        dateObj: current,
        label: `${weekdaysNames[i]} ${current.getDate()}/${current.getMonth() + 1}`
      });
    }
    return days;
  };

  let agendaCurrentBaseDateStr = '';

  const renderWeekAgenda = (vehicleId: string, baseDateStr: string) => {
    const panel = document.getElementById('del-vehicle-week-agenda-panel');
    if (!panel) return;

    agendaCurrentBaseDateStr = baseDateStr;
    const baseDate = new Date(baseDateStr + 'T00:00:00');
    const weekDays = getWeekDays(baseDate);
    const startOfWeek = weekDays[0].dateStr;
    const endOfWeek = weekDays[6].dateStr;

    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) return;

    const allDeliveries: Delivery[] = (window as any)._desp_deliveries || [];
    const weekDeliveries = allDeliveries.filter(d => 
      d.vehicle_id === vehicleId && 
      d.date >= startOfWeek && 
      d.date <= endOfWeek && 
      d.status !== 'CANCELADO'
    );

    const vehicleCapacity = toNum(vehicle.capacity);

    let html = `
      <div class="space-y-3 font-sans">
        <!-- Navegación de Semana -->
        <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
          <button type="button" class="btn btn-outline btn-xs flex items-center gap-1" id="agenda-prev-week" style="font-size:11px; padding: 2px 6px;">
            <i class="fas fa-chevron-left"></i> Anterior
          </button>
          <span class="font-bold text-xs text-gray-700 text-center">
            Semana del ${weekDays[0].dateObj.getDate()} de ${weekDays[0].dateObj.toLocaleDateString('es-ES', {month: 'short'})} 
            al ${weekDays[6].dateObj.getDate()} de ${weekDays[6].dateObj.toLocaleDateString('es-ES', {month: 'short'})} (${weekDays[0].dateObj.getFullYear()})
          </span>
          <button type="button" class="btn btn-outline btn-xs flex items-center gap-1" id="agenda-next-week" style="font-size:11px; padding: 2px 6px;">
            Siguiente <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="flex items-center justify-between text-[11px] text-gray-500 px-1">
          <span>Vehículo: <strong class="text-gray-700">${(window as any).esc(vehicle.plate)}</strong> (${(window as any).esc(vehicle.driver)})</span>
          <span>Capacidad: <strong class="text-blue-700">${(window as any).fmtN(vehicleCapacity)} Kg</strong></span>
        </div>

        <!-- Grid de Días -->
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
    `;

    weekDays.forEach(day => {
      const dayDeliveries = [...weekDeliveries.filter(d => d.date === day.dateStr)];
      
      const isSelectedDate = day.dateStr === dateInput?.value;
      const isCurrentInList = dayDeliveries.some(d => d.id === (del?.id || ''));
      
      const curWeight = parseFloat(weightInput?.value || '0') || 0;
      if (isSelectedDate && !isCurrentInList && curWeight > 0) {
        dayDeliveries.push({
          id: del?.id || 'TEMP',
          number: del?.number || 'AUTO',
          client_id: getClientId(),
          vehicle_id: vehicleId,
          address: '',
          date: day.dateStr,
          status: 'PENDIENTE',
          weight: curWeight,
          notes: '',
          items: '',
          sales_order_id: '',
          invoice_id: ''
        });
      }

      const totalWeight = dayDeliveries.reduce((sum, d) => sum + toNum(d.weight), 0);
      const isOver = totalWeight > vehicleCapacity;
      const isToday = day.dateStr === (window as any).todayStr();

      let dayBg = 'bg-white border-gray-200';
      let dayHeaderColor = 'bg-gray-100 text-gray-700 border-b border-gray-200';
      if (isToday) {
        dayBg = 'bg-blue-50 border-blue-200';
        dayHeaderColor = 'bg-blue-600 text-white';
      } else if (isSelectedDate) {
        dayBg = 'bg-amber-50 border-amber-300';
        dayHeaderColor = 'bg-amber-500 text-white';
      }

      let usageBadge = '';
      if (dayDeliveries.length > 0) {
        if (isOver) {
          usageBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 w-full text-center block">Excedido (${(window as any).fmtN(totalWeight)} Kg)</span>`;
        } else {
          const pct = vehicleCapacity > 0 ? (totalWeight / vehicleCapacity) * 100 : 0;
          usageBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${pct > 80 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-green-100 text-green-700 border border-green-200'} w-full text-center block">${pct.toFixed(0)}% (${(window as any).fmtN(totalWeight)} Kg)</span>`;
        }
      } else {
        usageBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-400 w-full text-center block">Libre</span>`;
      }

      html += `
        <div class="rounded-lg border flex flex-col min-h-[120px] overflow-hidden ${dayBg}" style="box-shadow: 0 1px 2px rgba(0,0,0,0.02)">
          <div class="px-2 py-0.5 text-center font-bold text-[9px] ${dayHeaderColor}">
            ${day.label}
          </div>
          <div class="p-1.5 flex-1 flex flex-col justify-between space-y-1">
            <!-- Entregas -->
            <div class="space-y-1 overflow-y-auto max-h-[70px]">
              ${dayDeliveries.length > 0 ? dayDeliveries.map(d => `
                <div class="p-1 rounded text-[9px] border border-gray-100 bg-white" title="${(window as any).esc(d.expand?.client_id?.name || 'Cliente')} - ${(window as any).esc(d.address)}">
                  <div class="font-bold text-blue-900 truncate">${(window as any).esc(d.number)}</div>
                  <div class="font-mono text-gray-500">${(window as any).fmtN(d.weight || 0)} Kg</div>
                </div>
              `).join('') : `
                <div class="text-[9px] text-gray-400 text-center py-3 italic">Vacío</div>
              `}
            </div>
            
            <!-- Resumen Carga -->
            <div>
              ${usageBadge}
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="flex justify-end pt-1">
          <button type="button" class="btn btn-outline btn-xs" onclick="document.getElementById('del-vehicle-week-agenda-panel').classList.add('hidden')">Cerrar agenda</button>
        </div>
      </div>
    `;

    panel.innerHTML = html;

    document.getElementById('agenda-prev-week')?.addEventListener('click', () => {
      const prevDate = new Date(baseDate);
      prevDate.setDate(baseDate.getDate() - 7);
      const yyyy = prevDate.getFullYear();
      const mm = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dd = String(prevDate.getDate()).padStart(2, '0');
      renderWeekAgenda(vehicleId, `${yyyy}-${mm}-${dd}`);
    });

    document.getElementById('agenda-next-week')?.addEventListener('click', () => {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + 7);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      renderWeekAgenda(vehicleId, `${yyyy}-${mm}-${dd}`);
    });
  };

  (window as any)._despToggleWeekAgenda = (vehicleId: string, baseDateStr: string) => {
    const panel = document.getElementById('del-vehicle-week-agenda-panel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      renderWeekAgenda(vehicleId, baseDateStr);
    } else {
      panel.classList.add('hidden');
    }
  };

  const refreshWeekAgendaIfVisible = () => {
    const panel = document.getElementById('del-vehicle-week-agenda-panel');
    if (panel && !panel.classList.contains('hidden')) {
      const vehicleId = vehicleSelect?.value;
      const dateVal = dateInput?.value;
      if (vehicleId && dateVal) {
        renderWeekAgenda(vehicleId, dateVal);
      } else {
        panel.classList.add('hidden');
      }
    }
  };

  const enforceVehicleCapacity = async () => {
    const selectedIds = parseSelectedInvoiceIds();
    setSelectedInvoiceIdsHidden(selectedIds);

    const weights = await Promise.all(selectedIds.map((id) => calcInvoiceWeightKg(id).catch(() => 0)));
    const requiredWeight = weights.reduce((s, w) => s + toNum(w), 0);

    if (weightInput) {
      weightInput.value = requiredWeight > 0 ? requiredWeight.toFixed(2) : '';
    }

    if (!vehicleSelect) return;

    Array.from(vehicleSelect.options).forEach((opt: any) => {
      const vId = String(opt.value || '');
      if (!vId) return;
      const veh = activeVehicles.find((v: any) => v.id === vId);
      const baseLabel = originalVehicleOptionLabel[vId] || opt.textContent || '';
      if (!originalVehicleOptionLabel[vId]) originalVehicleOptionLabel[vId] = baseLabel;
      const cap = toNum(veh?.capacity);
      const blocked = requiredWeight > 0 && cap < requiredWeight;
      opt.disabled = blocked;
      opt.textContent = blocked ? `${baseLabel} (capacidad insuficiente)` : baseLabel;
    });

    const selectedVehicleId = vehicleSelect.value;
    if (selectedVehicleId) {
      const selectedVehicle = activeVehicles.find((v: any) => v.id === selectedVehicleId);
      const selectedCap = toNum(selectedVehicle?.capacity);
      if (requiredWeight > 0 && selectedCap < requiredWeight) {
        vehicleSelect.value = '';
        (window as any).showToast('El vehículo seleccionado no cumple la capacidad mínima para las facturas elegidas.', 'warning');
      }
    }

    if (vehicleHint) {
      const ton = requiredWeight / 1000;
      vehicleHint.textContent = requiredWeight > 0
        ? `Carga requerida: ${(window as any).fmtN(requiredWeight)} Kg (${ton.toFixed(2)} Ton). Solo se habilitan vehículos con capacidad igual o superior.`
        : 'Selecciona factura(s) para validar capacidad mínima de carga.';
    }

    await refreshItemsFromSelectedInvoices(false);
    refreshNotesFromSelectedInvoices(false);

    checkSelectedVehicleDocs();
    checkVehicleSchedule();
    refreshWeekAgendaIfVisible();
  };

  const refreshInvoiceSelectorAndCapacity = async () => {
    const selectedNow = parseSelectedInvoiceIds();
    renderInvoiceSelector(selectedNow.length ? selectedNow : (invoiceIdsHidden?.value || '').split(',').map(s => s.trim()).filter(Boolean));
    if (invoiceList) {
      invoiceList.querySelectorAll('input[type="checkbox"][data-invoice-id]').forEach((el: any) => {
        el.addEventListener('change', () => { void enforceVehicleCapacity(); });
      });
    }
    await enforceVehicleCapacity();
  };

  await refreshInvoiceSelectorAndCapacity();

  // Listeners para cambio de vehículo y fecha para actualizar disponibilidad y documentos
  vehicleSelect?.addEventListener('change', () => {
    void enforceVehicleCapacity();
  });
  dateInput?.addEventListener('change', () => {
    void enforceVehicleCapacity();
  });

  if (itemsInput) {
    itemsInput.addEventListener('input', () => {
      const current = String(itemsInput.value || '').trim();
      itemsDirtyByUser = current !== String(lastAutoItemsValue || '').trim();
    });
  }

  autofillItemsBtn?.addEventListener('click', async () => {
    await refreshItemsFromSelectedInvoices(true);
  });

  if (notesInput) {
    notesInput.addEventListener('input', () => {
      const current = String(notesInput.value || '').trim();
      notesDirtyByUser = current !== String(lastAutoNotesValue || '').trim();
    });
  }

  autofillNotesBtn?.addEventListener('click', () => {
    refreshNotesFromSelectedInvoices(true);
  });

  (window as any)._despQuickAddCustomer = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          (window as any)._desp_clients = thirds;
          clients.length = 0;
          clients.push(...thirds);
          if (!_isClientOrSupplierType(createdRecord.type)) {
            (window as any).showToast('Tercero creado, pero su tipo no es CLIENTE ni PROVEEDOR. No aparecerá en este selector.', 'warning');
            return;
          }
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
          (window as any)._selectDelClient(createdRecord.id, selectText);
          (window as any).showToast('Tercero creado y seleccionado en Despachos.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar terceros: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  // Guardar Despacho
  document.getElementById('btn-save-delivery')?.addEventListener('click', async () => {
    try {
      const number = (document.getElementById('del-number') as HTMLInputElement)?.value;
      const date = (document.getElementById('del-date') as HTMLInputElement)?.value;
      const clientId = (document.getElementById('del-client-id') as HTMLInputElement)?.value;
      const address = (document.getElementById('del-address') as HTMLInputElement)?.value.trim();
      const vehicleId = (document.getElementById('del-vehicle') as HTMLSelectElement)?.value || null;
      const weight = parseFloat((document.getElementById('del-weight') as HTMLInputElement)?.value || '0');
      const status = (document.getElementById('del-status') as HTMLSelectElement)?.value;
      const selectedInvoiceIds = ((document.getElementById('del-invoice-ids') as HTMLInputElement)?.value || '')
        .split(',')
        .map(x => x.trim())
        .filter(Boolean);
      const invoiceId = selectedInvoiceIds[0] || null;
      const items = (document.getElementById('del-items') as HTMLTextAreaElement)?.value.trim();
      const notes = (document.getElementById('del-notes') as HTMLInputElement)?.value.trim();

      if (!date) throw new Error('Por favor selecciona una fecha de entrega.');
      if (!clientId) throw new Error('Por favor selecciona un tercero (cliente/proveedor) de la lista.');
      if (!address) throw new Error('Por favor ingresa la dirección de entrega.');
      if (!selectedInvoiceIds.length) throw new Error('Debes vincular al menos una factura vigente con entrega pendiente.');
      if (!items) throw new Error('Por favor detalla los ítems a entregar.');

      // Validar peso y dimensiones de productos tipo BIEN vinculados
      for (const invId of selectedInvoiceIds) {
        const lines = await getInvoiceLinesCached(invId);
        for (const l of lines) {
          const prod = l.expand?.product_id;
          if (prod && prod.type === 'BIEN') {
            const pesoNeto = toNum(prod.peso_neto);
            const pesoBruto = toNum(prod.peso_bruto);
            const pesoGen = toNum(prod.peso || prod.weight || prod.unit_weight);
            const largoCm = toNum(prod.largo_cm);
            const anchoCm = toNum(prod.ancho_cm);
            const altoCm = toNum(prod.alto_cm);

            const hasWeight = pesoNeto > 0 || pesoBruto > 0 || pesoGen > 0;
            const hasDimensions = largoCm > 0 && anchoCm > 0 && altoCm > 0;

            if (!hasWeight || !hasDimensions) {
              throw new Error(`El producto "${prod.name}" contenido en las facturas asociadas requiere peso y dimensiones mayores a cero en el catálogo maestro.`);
            }
          }
        }
      }

      if (vehicleId) {
        const selectedVehicle = activeVehicles.find((v: any) => v.id === vehicleId);
        const selectedVehicleCapacity = toNum(selectedVehicle?.capacity);
        const requiredWeight = isNaN(weight) ? 0 : weight;
        
        // Calcular peso acumulado para advertencia de agendamiento
        const allDeliveries: Delivery[] = (window as any)._desp_deliveries || [];
        const sameDayDeliveries = allDeliveries.filter(d => 
          d.vehicle_id === vehicleId && 
          d.date === date && 
          d.status !== 'CANCELADO' && 
          d.id !== (del?.id || '')
        );
        const otherDeliveriesWeight = sameDayDeliveries.reduce((sum, d) => sum + toNum(d.weight), 0);
        const totalCommittedWeight = otherDeliveriesWeight + requiredWeight;

        if (requiredWeight > 0 && selectedVehicleCapacity < requiredWeight) {
          throw new Error(`El vehículo seleccionado no cumple con la capacidad mínima requerida para esta entrega (${(window as any).fmtN(requiredWeight)} Kg).`);
        }
        
        if (totalCommittedWeight > selectedVehicleCapacity) {
          if (!confirm(`Advertencia: El vehículo quedaría sobrecargado el día de la entrega.\nCapacidad: ${(window as any).fmtN(selectedVehicleCapacity)} Kg.\nCarga Proyectada: ${(window as any).fmtN(totalCommittedWeight)} Kg.\n¿Deseas guardar el despacho de todas formas?`)) {
            return;
          }
        }
      }

      const selectedInvoiceNumbers = selectedInvoiceIds
        .map((id) => {
          const inv = invoices.find((x: any) => x.id === id);
          return inv?.number || id;
        })
        .filter(Boolean);

      const notesClean = String(notes || '')
        .replace(/^Facturas vinculadas:\s*.*?(\s*\|\s*)?/i, '')
        .trim();
      const linkedInvoicesNote = `Facturas vinculadas: ${selectedInvoiceNumbers.join(', ')}`;
      const finalNotes = [linkedInvoicesNote, notesClean].filter(Boolean).join(' | ');

      const data = {
        number,
        date,
        client_id: clientId,
        address,
        vehicle_id: vehicleId,
        weight: isNaN(weight) ? null : weight,
        status,
        sales_order_id: del?.sales_order_id || null,
        invoice_id: invoiceId,
        items,
        notes: finalNotes,
      };

      // Si es un nuevo despacho en 'AUTO', obtenemos consecutivo incremental
      if (!del || del.number === 'AUTO') {
        data.number = await _getAndIncrementDeliveryConsecutive();
      }      let originalVehicleId = del?.vehicle_id || null;
      let isNewDelivery = !del;

      if (del) {
        await (window as any).pb.update('logistica_deliveries', del.id, data);
        (window as any).showToast('Entrega actualizada con éxito', 'success');
        await (window as any).API.logAudit('UPDATE', 'logistica_deliveries', del.id, `Entrega/Despacho "${data.number}" modificado.`);
        SupplyChainOrchestrator.handleDeliveryStatusChange(del.id, status).catch(() => {});
      } else {
        const created = await (window as any).pb.create('logistica_deliveries', data);
        (window as any).showToast('Entrega programada con éxito', 'success');
        await (window as any).API.logAudit('CREATE', 'logistica_deliveries', created.id, `Entrega/Despacho "${data.number}" programada para cliente.`);
        SupplyChainOrchestrator.handleDeliveryStatusChange(created.id, status).catch(() => {});
      }

      // Guardar interacción de despacho en el historial del CRM si está asociado a factura o pedido de un trato
      const invId = invoiceId;
      const soId = del?.sales_order_id || null;
      if (invId || soId) {
        try {
          let filterStr = "";
          if (invId && soId) filterStr = `invoice_id="${invId}" || sales_order_id="${soId}"`;
          else if (invId) filterStr = `invoice_id="${invId}"`;
          else if (soId) filterStr = `sales_order_id="${soId}"`;

          const deals = await (window as any).pb.listAll('crm_deals', { filter: filterStr });
          for (const deal of deals) {
            await (window as any).pb.create('crm_interactions', {
              deal_id: deal.id,
              user_id: (window as any).pb.currentUser?.id || null,
              type: 'OTRO',
              request_details: `${isNewDelivery ? 'Despacho registrado/programado' : 'Despacho actualizado'}: ${data.number}`,
              response_details: `Dirección: ${address}. Estado despacho: ${status}. Carga: ${items.slice(0, 100)}...`,
              response_at: (window as any).todayStr()
            });
          }
        } catch (crmErr) {
          console.error("Error al registrar despacho en CRM:", crmErr);
        }
      }
      // Si se asignó un vehículo y el estado es "DESPACHADO" (En ruta), cambiamos estado del vehículo
      if (vehicleId) {
        if (status === 'DESPACHADO') {
          await (window as any).pb.update('logistica_vehicles', vehicleId, { status: 'EN_RUTA' });
        } else if (status === 'ENTREGADO' || status === 'CANCELADO' || status === 'DEVUELTO') {
          await (window as any).pb.update('logistica_vehicles', vehicleId, { status: 'DISPONIBLE' });
        }
      } else if (originalVehicleId) {
        // Si se removió el vehículo, lo ponemos disponible
        await (window as any).pb.update('logistica_vehicles', originalVehicleId, { status: 'DISPONIBLE' });
      }

      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      const isWarning = err.message.includes('requiere peso y dimensiones') || err.message.includes('debe tener registrados');
      (window as any).showToast(err.message || 'Error al guardar entrega', isWarning ? 'warning' : 'error');
    }
  });
}

async function _getAndIncrementDeliveryConsecutive(): Promise<string> {
  try {
    const raw = await (window as any).API.getSetting('delivery_consecutive');
    const next = (parseInt(raw || '0', 10) || 0) + 1;
    await (window as any).API.setSetting('delivery_consecutive', String(next));
    return `DESP-${String(next).padStart(5, '0')}`;
  } catch (_) {
    return `DESP-${Date.now().toString().slice(-6)}`;
  }
}

(window as any)._editDelivery = function(id: string) {
  const list: Delivery[] = (window as any)._desp_deliveries || [];
  const del = list.find(d => d.id === id);
  if (del) {
    _openDeliveryForm(del, () => {
      const activeContent = document.getElementById('page-content');
      if (activeContent) renderDespachos(activeContent);
    });
  }
};

(window as any)._deleteDelivery = async function(id: string, number: string) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el despacho/entrega "${number}"?`)) return;

  try {
    const list: Delivery[] = (window as any)._desp_deliveries || [];
    const del = list.find(d => d.id === id);
    
    await (window as any).pb.delete('logistica_deliveries', id);
    (window as any).showToast('Entrega eliminada con éxito', 'success');
    await (window as any).API.logAudit('DELETE', 'logistica_deliveries', id, `Entrega/Despacho "${number}" eliminada.`);

    // Si tenía un vehículo asignado, lo liberamos
    if (del && del.vehicle_id) {
      await (window as any).pb.update('logistica_vehicles', del.vehicle_id, { status: 'DISPONIBLE' });
    }

    const activeContent = document.getElementById('page-content');
    if (activeContent) renderDespachos(activeContent);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al eliminar entrega', 'error');
  }
};

// Imprimir/Visualizar la Hoja de Ruta
(window as any)._printHojaRuta = async function(deliveryId: string) {
  const list: Delivery[] = (window as any)._desp_deliveries || [];
  const d = list.find(del => del.id === deliveryId);
  if (!d) return;

  const client = d.expand?.client_id;
  const veh = d.expand?.vehicle_id;
  const orderNum = d.expand?.sales_order_id?.number || '—';
  const invoiceNum = d.expand?.invoice_id?.number || '—';

  const previewHtml = `
    <div class="p-6 max-w-2xl mx-auto bg-white rounded-2xl" id="printable-dispatch-area" style="font-family:'Courier New', Courier, monospace; line-height: 1.5; color:#111827">
      <div style="border: 2px solid #000; padding: 16px; border-radius: 12px;">
        <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">HOJA DE RUTA Y DESPACHO</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">DOCUMENTO DE CONTROL DE ENTREGA</p>
          <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: bold; font-family: monospace;">NRO: ${d.number}</p>
        </div>

        <table style="width:100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <tr>
            <td style="width:35%; font-weight: bold; padding: 4px 0;">FECHA DESPACHO:</td>
            <td style="padding: 4px 0;">${(window as any).fmtDate(d.date)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">CLIENTE:</td>
            <td style="padding: 4px 0; font-weight: bold;">${client ? (window as any).esc(client.name) : '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">DOC / NIT CLIENTE:</td>
            <td style="padding: 4px 0;">${client ? (window as any).esc(client.doc_number || client.nit || 'S/N') : '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">DIRECCIÓN DE ENTREGA:</td>
            <td style="padding: 4px 0; font-weight: bold; background:#F9FAFB; padding: 4px 8px; border-radius: 6px;">${(window as any).esc(d.address)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">VEHÍCULO ASIGNADO:</td>
            <td style="padding: 4px 0;">${veh ? `${(window as any).esc(veh.plate)} — Conductor: ${(window as any).esc(veh.driver)}` : 'S/V asignado'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">PESO TOTAL EST.:</td>
            <td style="padding: 4px 0;">${d.weight ? (window as any).fmtN(d.weight) + ' Kg' : '—'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">PEDIDO VINCULADO:</td>
            <td style="padding: 4px 0;">${(window as any).esc(orderNum)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">FACTURA VINCULADA:</td>
            <td style="padding: 4px 0;">${(window as any).esc(invoiceNum)}</td>
          </tr>
        </table>

        <div style="border-top: 1.5px solid #000; padding-top: 12px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; text-decoration: underline;">DETALLE DE LA CARGA A ENTREGAR:</h4>
          <p style="margin: 0; font-size: 12px; white-space: pre-wrap; font-family: inherit; background: #F9FAFB; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB;">${(window as any).esc(d.items)}</p>
        </div>

        ${d.notes ? `
        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold;">Observaciones / Instrucciones de ruta:</h4>
          <p style="margin: 0; font-size: 11px; color:#4B5563;">${(window as any).esc(d.notes)}</p>
        </div>` : ''}

        <div style="margin-top: 40px; border-top: 1px dashed #9CA3AF; padding-top: 24px;">
          <div style="display: flex; justify-content: space-between; gap: 40px; font-size: 11px;">
            <div style="flex: 1; text-align: center;">
              <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 6px;"></div>
              <strong>FIRMA Y SELLO DEL CONDUCTOR</strong>
              <div style="color:#6B7280; margin-top: 4px;">C.C. ___________________</div>
            </div>
            <div style="flex: 1; text-align: center;">
              <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 6px;"></div>
              <strong>FIRMA DE RECIBIDO SATISFACTORIO</strong>
              <div style="color:#6B7280; margin-top: 4px;">Nombre / C.C. / Fecha y Hora</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estilos específicos para impresión -->
    <style>
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-dispatch-area, #printable-dispatch-area * {
          visibility: visible;
        }
        #printable-dispatch-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          border: none !important;
          padding: 0 !important;
        }
      }
    </style>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
    <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print mr-1"></i> Imprimir Documento</button>
  `;

  (window as any).openModal(`Previsualización de Hoja de Ruta: ${d.number}`, previewHtml, footer, true);
};

// Facturar Entrega / Despacho directamente en Ventas
(window as any).invoiceDeliveryDirect = async function(deliveryId: string) {
  try {
    const del = await (window as any).pb.get('logistica_deliveries', deliveryId, { expand: 'client_id,sales_order_id' });
    if (!del) throw new Error('Despacho no encontrado.');

    (window as any).closeModal();
    (window as any).navigate('ventas');
    setTimeout(() => {
      if (typeof (window as any).openSalesForm === 'function') {
        (window as any).openSalesForm(null, () => {
          (window as any).navigate('despachos');
        }, del.sales_order_id || null, null, null, deliveryId);
      }
    }, 250);
  } catch (err: any) {
    (window as any).showToast('Error al preparar facturación de despacho: ' + err.message, 'error');
  }
};

// Ver Factura Vinculada a la Entrega
(window as any).viewSalesInvoiceFromDelivery = function(invoiceId: string) {
  (window as any).closeModal();
  (window as any).navigate('ventas');
  setTimeout(() => {
    if (typeof (window as any).viewSalesInvoiceDetail === 'function') {
      (window as any).viewSalesInvoiceDetail(invoiceId);
    }
  }, 250);
};

// Registrar globalmente
(window as any).renderDespachos = renderDespachos;
