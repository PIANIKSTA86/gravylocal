/**
 * GRAVY v2.0 — despachos.ts
 * Módulo de Logística: Gestión de Vehículos, Capacidad de Carga y Despacho de Entregas.
 */

'use strict';

interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  capacity: number;
  status: 'DISPONIBLE' | 'EN_RUTA' | 'MANTENIMIENTO';
  notes: string;
  active: boolean;
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
    (window as any).pb.listAll('logistica_vehicles', { sort: 'plate' }),
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
        ${vehicles.map(v => `<option value="${v.id}">${(window as any).esc(v.plate)} — ${(window as any).esc(v.driver)}</option>`).join('')}
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
                  <td>${veh ? `<span class="font-semibold text-xs text-gray-700">${(window as any).esc(veh.plate)}</span> <span class="text-[10px] text-gray-500">(${(window as any).esc(veh.driver)})</span>` : '<span class="text-orange-600 font-semibold italic text-xs">Sin asignar</span>'}</td>
                  <td class="text-xs truncate max-w-xs" title="${(window as any).esc(d.address)}">${(window as any).esc(d.address)}</td>
                  <td class="text-right font-mono text-xs">${d.weight ? (window as any).fmtN(d.weight) : '—'}</td>
                  <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Imprimir Hoja de Ruta" onclick="window._printHojaRuta('${(window as any).esc(d.id)}')"><i class="fas fa-print"></i></button>
                      <button class="btn btn-outline btn-sm" title="Editar" onclick="window._editDelivery('${(window as any).esc(d.id)}')"><i class="fas fa-pen"></i></button>
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
              <th>Estado</th>
              <th>Habilitado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${vehicles.length ? vehicles.map(v => {
              const meta = VEHICLE_STATUS[v.status] || { label: v.status, badge: 'badge-gray' };
              return `
                <tr>
                  <td><span class="font-mono font-bold text-gray-800" style="font-size:13px">${(window as any).esc(v.plate)}</span></td>
                  <td class="font-medium">${(window as any).esc(v.driver)}</td>
                  <td class="text-right font-mono text-xs font-semibold text-blue-700">${(window as any).fmtN(v.capacity)} Kg</td>
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
  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Placa del Vehículo <span style="color:#EF4444">*</span></label>
          <input id="veh-plate" class="form-input font-mono" placeholder="Ej: AAA-123" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" value="${(window as any).esc(veh?.plate || '')}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Nombre del Conductor <span style="color:#EF4444">*</span></label>
          <input id="veh-driver" class="form-input" placeholder="Nombre completo" value="${(window as any).esc(veh?.driver || '')}">
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

  document.getElementById('btn-save-vehicle')?.addEventListener('click', async () => {
    try {
      const plate = (document.getElementById('veh-plate') as HTMLInputElement)?.value.trim();
      const driver = (document.getElementById('veh-driver') as HTMLInputElement)?.value.trim();
      const capacity = parseFloat((document.getElementById('veh-capacity') as HTMLInputElement)?.value || '0');
      const status = (document.getElementById('veh-status') as HTMLSelectElement)?.value;
      const active = (document.getElementById('veh-active') as HTMLSelectElement)?.value === 'true';
      const notes = (document.getElementById('veh-notes') as HTMLTextAreaElement)?.value.trim();

      if (!plate) throw new Error('Por favor ingresa la placa del vehículo.');
      if (!driver) throw new Error('Por favor ingresa el nombre del conductor.');
      if (isNaN(capacity) || capacity <= 0) throw new Error('La capacidad de carga debe ser mayor a cero.');

      const data = { plate, driver, capacity, status, active, notes };

      if (veh) {
        await (window as any).pb.update('logistica_vehicles', veh.id, data);
        (window as any).showToast('Vehículo actualizado correctamente', 'success');
        await (window as any).API.logAudit('UPDATE', 'logistica_vehicles', veh.id, `Vehículo con placa "${plate}" modificado`);
      } else {
        const created = await (window as any).pb.create('logistica_vehicles', data);
        (window as any).showToast('Vehículo registrado correctamente', 'success');
        await (window as any).API.logAudit('CREATE', 'logistica_vehicles', created.id, `Vehículo con placa "${plate}" y conductor "${driver}" registrado`);
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
  const vehicles = (window as any)._desp_vehicles || [];
  const activeVehicles = vehicles.filter((v: any) => v.active && v.status === 'DISPONIBLE');

  // Si estamos editando, incluimos el vehículo actual de la entrega aunque esté ocupado/inactivo
  if (del && del.vehicle_id) {
    const currentVeh = vehicles.find((v: any) => v.id === del.vehicle_id);
    if (currentVeh && !activeVehicles.find((v: any) => v.id === currentVeh.id)) {
      activeVehicles.push(currentVeh);
    }
  }

  const salesOrders = await (window as any).pb.listAll('sales_orders', { filter: 'status="pending"', sort: '-number' }).catch(() => []);
  const invoices = await (window as any).pb.listAll('invoices', { sort: '-number' }).catch(() => []);

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
          <input id="del-client-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del cliente...">
          <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window._despQuickAddCustomer()" title="Nuevo Cliente" style="border-color:#D1D5DB; background:#fff;">
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
            ${activeVehicles.map((v: any) => `<option value="${(window as any).esc(v.id)}"${del?.vehicle_id === v.id ? ' selected' : ''}>${(window as any).esc(v.plate)} — ${(window as any).esc(v.driver)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Peso Carga (Kg)</label>
          <input id="del-weight" type="number" min="0" step="0.01" class="form-input text-right font-semibold" placeholder="0" value="${del?.weight ?? ''}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Estado Despacho <span style="color:#EF4444">*</span></label>
          <select id="del-status" class="form-input">
            ${Object.entries(DELIVERY_STATUS).map(([key, val]) => `<option value="${key}" ${del?.status === key ? 'selected' : ''}>${val.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3" style="border-color:#F0F0F0">
        <div class="form-group">
          <label class="form-label font-bold">Vincular a Pedido (Pendiente)</label>
          <select id="del-order" class="form-input">
            <option value="">— Ninguno —</option>
            ${salesOrders.map((o: any) => `<option value="${(window as any).esc(o.id)}"${del?.sales_order_id === o.id ? ' selected' : ''}>${(window as any).esc(o.number)} (${(window as any).fmt(o.total)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Vincular a Factura de Venta</label>
          <select id="del-invoice" class="form-input">
            <option value="">— Ninguna —</option>
            ${invoices.map((i: any) => `<option value="${(window as any).esc(i.id)}"${del?.invoice_id === i.id ? ' selected' : ''}>${(window as any).esc(i.number)} (${(window as any).fmt(i.total)})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Ítems / Detalles de la Carga <span style="color:#EF4444">*</span></label>
        <textarea id="del-items" class="form-input" rows="3" placeholder="Ej: 10 Cajas de Producto A, 5 Bolsas de Producto B...">${(window as any).esc(del?.items || '')}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Observaciones de Entrega</label>
        <input id="del-notes" class="form-input" placeholder="Ej: llamar al cliente al llegar, ingresar por portería trasera..." value="${(window as any).esc(del?.notes || '')}">
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-delivery"><i class="fas fa-floppy-disk"></i> Programar Entrega</button>
  `;

  (window as any).openModal(del ? `Editar Entrega: ${del.number}` : 'Programar Nueva Entrega', formHtml, footer, true);

  // Inicializar buscador autocompletable de clientes
  const input = document.getElementById('del-client-search') as HTMLInputElement;
  const hidden = document.getElementById('del-client-id') as HTMLInputElement;
  const results = document.getElementById('del-client-results');

  if (input && hidden && results) {
    if (del && del.client_id) {
      const match = clients.find((c: any) => c.id === del.client_id);
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
                onclick="window._selectDelClient('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    (window as any)._selectDelClient = function(id: string, text: string) {
      hidden.value = id;
      input.value = text;
    };
  }

  (window as any)._despQuickAddCustomer = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          (window as any)._desp_clients = thirds;
          clients.length = 0;
          clients.push(...thirds);
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
          (window as any)._selectDelClient(createdRecord.id, selectText);
          (window as any).showToast('Cliente creado y seleccionado en Despachos.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar clientes: ' + err.message, 'error');
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
      const salesOrderId = (document.getElementById('del-order') as HTMLSelectElement)?.value || null;
      const invoiceId = (document.getElementById('del-invoice') as HTMLSelectElement)?.value || null;
      const items = (document.getElementById('del-items') as HTMLTextAreaElement)?.value.trim();
      const notes = (document.getElementById('del-notes') as HTMLInputElement)?.value.trim();

      if (!date) throw new Error('Por favor selecciona una fecha de entrega.');
      if (!clientId) throw new Error('Por favor selecciona un cliente de la lista.');
      if (!address) throw new Error('Por favor ingresa la dirección de entrega.');
      if (!items) throw new Error('Por favor detalla los ítems a entregar.');

      const data = {
        number,
        date,
        client_id: clientId,
        address,
        vehicle_id: vehicleId,
        weight: isNaN(weight) ? null : weight,
        status,
        sales_order_id: salesOrderId,
        invoice_id: invoiceId,
        items,
        notes,
      };

      // Si es un nuevo despacho en 'AUTO', obtenemos consecutivo incremental
      if (!del || del.number === 'AUTO') {
        data.number = await _getAndIncrementDeliveryConsecutive();
      }

      let originalVehicleId = del?.vehicle_id || null;

      if (del) {
        await (window as any).pb.update('logistica_deliveries', del.id, data);
        (window as any).showToast('Entrega actualizada con éxito', 'success');
        await (window as any).API.logAudit('UPDATE', 'logistica_deliveries', del.id, `Entrega/Despacho "${data.number}" modificado.`);
      } else {
        const created = await (window as any).pb.create('logistica_deliveries', data);
        (window as any).showToast('Entrega programada con éxito', 'success');
        await (window as any).API.logAudit('CREATE', 'logistica_deliveries', created.id, `Entrega/Despacho "${data.number}" programada para cliente.`);
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
      (window as any).showToast(err.message || 'Error al guardar entrega', 'error');
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

// Registrar globalmente
(window as any).renderDespachos = renderDespachos;
