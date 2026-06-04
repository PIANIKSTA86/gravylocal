/**
 * GRAVY v2.0 — spa.ts
 * Módulo de Spa y Peluquería de Mascotas.
 * Integra agendamiento, expedientes de mascotas con alertas de comportamiento/alergias,
 * y facturación cruzada mediante la generación de Pedidos de Venta.
 */

'use strict';

interface AppointmentStatusDetail {
  label: string;
  badge: string;
  color: string;
}

const APPT_STATUS: Record<string, AppointmentStatusDetail> = {
  pending:     { label: 'Programada', badge: 'badge-orange', color: '#C46516' },
  in_progress: { label: 'En Proceso', badge: 'badge-blue',   color: '#2446B8' },
  completed:   { label: 'Terminada',  badge: 'badge-green',  color: '#059669' },
  cancelled:   { label: 'Cancelada',  badge: 'badge-red',    color: '#DC2626' },
};

// --- Render Principal ---
export async function renderSpa(container: HTMLElement) {
  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137"><i class="fas fa-spa text-blue-600 mr-2"></i>Spa y Estética de Mascotas</h3>
        <p class="text-sm" style="color:#6B7280">Gestiona citas, peluquería, y mantén el historial y alertas de comportamiento/alergias de las mascotas.</p>
      </div>
    </div>

    <!-- Tabs Nav -->
    <div class="flex border-b mb-5" style="border-color:#E5E7EB">
      <button class="tab-btn active" id="tab-spa-agenda" data-tab="agenda"><i class="fas fa-calendar-days mr-2"></i>Agenda de Citas</button>
      <button class="tab-btn" id="tab-spa-mascotas" data-tab="mascotas"><i class="fas fa-paw mr-2"></i>Expediente de Mascotas</button>
    </div>

    <div id="spa-tab-content">
      <div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo...</div>
    </div>
  `;

  const tabContent = document.getElementById('spa-tab-content') as HTMLElement;
  const agendaBtn = document.getElementById('tab-spa-agenda') as HTMLButtonElement;
  const mascotasBtn = document.getElementById('tab-spa-mascotas') as HTMLButtonElement;

  const switchTab = (tab: string) => {
    agendaBtn.classList.toggle('active', tab === 'agenda');
    mascotasBtn.classList.toggle('active', tab === 'mascotas');

    if (tab === 'agenda') {
      renderSpaAgenda(tabContent);
    } else {
      renderSpaMascotas(tabContent);
    }
  };

  agendaBtn.addEventListener('click', () => switchTab('agenda'));
  mascotasBtn.addEventListener('click', () => switchTab('mascotas'));

  // Default tab
  switchTab('agenda');
}

// ── TAB 1: AGENDA DE CITAS ───────────────────────────────────────────────────
async function renderSpaAgenda(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando agenda...</div>`;
  
  try {
    const stylists = await (window as any).pb.listAll('third_parties', { filter: 'active=true && type="VENDEDOR"', sort: 'name' });
    const today = (window as any).todayStr();

    container.innerHTML = `
      <!-- Filtros Agenda -->
      <div class="bg-white rounded-2xl border p-4 mb-5 flex flex-wrap gap-4 items-end justify-between shadow-sm" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="form-group mb-0">
            <label class="form-label font-bold text-xs" style="margin-bottom:4px">Fecha de Agenda</label>
            <input id="spa-agenda-date" type="date" class="form-input text-xs" style="max-width:160px" value="${today}">
          </div>
          <div class="form-group mb-0">
            <label class="form-label font-bold text-xs" style="margin-bottom:4px">Estilista / Colaborador</label>
            <select id="spa-agenda-stylist" class="form-input text-xs" style="min-width:180px">
              <option value="">— Todos los estilistas —</option>
              ${stylists.map((s: any) => `<option value="${(window as any).esc(s.id)}">${(window as any).esc(s.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-new-appointment"><i class="fas fa-plus"></i> Agendar Cita</button>
      </div>

      <!-- Grid de Citas -->
      <div id="spa-agenda-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-calendar-days mr-2"></i>Cargando citas del día...</div>
      </div>
    `;

    const dateInput = document.getElementById('spa-agenda-date') as HTMLInputElement;
    const stylistSelect = document.getElementById('spa-agenda-stylist') as HTMLSelectElement;
    const agendaList = document.getElementById('spa-agenda-list') as HTMLElement;
    const newApptBtn = document.getElementById('btn-new-appointment') as HTMLButtonElement;

    const loadAppointments = async () => {
      agendaList.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando citas...</div>`;
      
      const selDate = dateInput.value;
      const selStylist = stylistSelect.value;

      try {
        let filter = `start_time >= "${selDate} 00:00" && start_time <= "${selDate} 23:59"`;
        if (selStylist) {
          filter += ` && stylist_id = "${selStylist}"`;
        }

        const appts = await (window as any).pb.listAll('appointments', {
          filter,
          sort: 'start_time',
          expand: 'pet_id,pet_id.owner_id,stylist_id,service_id,sales_order_id'
        });

        if (appts.length === 0) {
          agendaList.innerHTML = `
            <div class="col-span-full p-12 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
              <i class="fas fa-calendar-xmark text-3xl mb-2" style="color:#C46516"></i>
              <p class="text-sm font-semibold">No hay citas programadas para esta fecha.</p>
              <p class="text-xs mt-1">Haz clic en "Agendar Cita" para registrar un nuevo servicio.</p>
            </div>
          `;
          return;
        }

        agendaList.innerHTML = appts.map((appt: any) => {
          const pet = appt.expand?.pet_id;
          const owner = pet?.expand?.owner_id;
          const stylist = appt.expand?.stylist_id;
          const service = appt.expand?.service_id;
          const salesOrder = appt.expand?.sales_order_id;
          const meta = APPT_STATUS[appt.status] || { label: appt.status, badge: 'badge-gray', color: '#6B7280' };

          // Extraer hora
          const timeStart = appt.start_time.split(' ')[1] || '';
          const timeEnd = appt.end_time.split(' ')[1] || '';

          // Alertas del perro
          const hasBehavior = pet?.behavior_notes && pet.behavior_notes.trim();
          const hasAllergies = pet?.allergies && pet.allergies.trim();

          return `
            <div class="bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative" style="border-color:#F0F0F0; border-top: 4px solid ${meta.color}">
              <div>
                <!-- Time & Status -->
                <div class="flex items-center justify-between mb-3">
                  <span class="font-bold text-sm text-gray-700"><i class="far fa-clock mr-1 text-gray-400"></i> ${timeStart} - ${timeEnd}</span>
                  <span class="badge ${meta.badge}">${meta.label}</span>
                </div>

                <!-- Mascota & Dueño -->
                <div class="mb-3">
                  <h4 class="font-extrabold text-base flex items-center gap-1.5" style="color:#0D2137">
                    <i class="fas fa-dog text-gray-400"></i> ${(window as any).esc(pet?.name || 'Mascota')}
                    <span class="text-xs font-normal text-gray-500">(${(window as any).esc(pet?.species || '—')})</span>
                  </h4>
                  <p class="text-xs text-gray-500 mt-0.5"><i class="far fa-user mr-1"></i> Dueño: <strong>${(window as any).esc(owner?.name || '—')}</strong></p>
                </div>

                <!-- Alertas de Mascota (UX Crítico) -->
                ${(hasBehavior || hasAllergies) ? `
                  <div class="mb-3 p-2.5 rounded-lg text-xs space-y-1" style="background:#FFF8F0; border: 1px solid #FFE4C4">
                    ${hasBehavior ? `<div class="text-orange-800 font-semibold"><i class="fas fa-triangle-exclamation mr-1 text-orange-600"></i> Conducta: ${(window as any).esc(pet.behavior_notes)}</div>` : ''}
                    ${hasAllergies ? `<div class="text-red-800 font-semibold"><i class="fas fa-circle-exclamation mr-1 text-red-600"></i> Alergias: ${(window as any).esc(pet.allergies)}</div>` : ''}
                  </div>
                ` : ''}

                <!-- Servicio & Estilista -->
                <div class="border-t pt-3 mb-4 space-y-1.5 text-xs text-gray-600" style="border-color:#F3F4F6">
                  <div class="flex justify-between">
                    <span>Servicio:</span>
                    <strong class="text-gray-800">${(window as any).esc(service?.name || '—')}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Estilista:</span>
                    <strong class="text-gray-800">${(window as any).esc(stylist?.name || stylist?.full_name || '—')}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Valor:</span>
                    <strong class="text-blue-700 font-bold">${(window as any).fmt(service?.base_price || 0)}</strong>
                  </div>
                  ${appt.notes ? `<div class="text-gray-400 mt-1 italic">"${(window as any).esc(appt.notes)}"</div>` : ''}
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex flex-wrap gap-1.5 mt-2 border-t pt-3" style="border-color:#F3F4F6">
                ${appt.status === 'pending' ? `
                  <button class="btn btn-primary btn-sm flex-1 justify-center" onclick="window.updateApptStatus('${appt.id}', 'in_progress')" title="Iniciar servicio"><i class="fas fa-play"></i> Iniciar</button>
                  <button class="btn btn-outline btn-sm" onclick="window.invoiceApptSalesOrder('${salesOrder?.id}')" title="Facturar servicio"><i class="fas fa-receipt"></i> Facturar</button>
                  <button class="btn btn-danger btn-sm" onclick="window.updateApptStatus('${appt.id}', 'cancelled')" title="Cancelar cita"><i class="fas fa-times"></i></button>
                ` : ''}
                ${appt.status === 'in_progress' ? `
                  <button class="btn btn-outline btn-sm flex-1 justify-center text-green-700" style="border-color:#10B981" onclick="window.updateApptStatus('${appt.id}', 'completed')" title="Marcar como listo"><i class="fas fa-check"></i> Terminar</button>
                ` : ''}
                ${appt.status === 'completed' ? `
                  <button class="btn btn-primary btn-sm flex-1 justify-center" onclick="window.invoiceApptSalesOrder('${salesOrder?.id}')" title="Facturar servicio"><i class="fas fa-receipt"></i> Facturar</button>
                ` : ''}
                ${appt.status === 'cancelled' ? `
                  <span class="text-xs text-gray-400 italic py-1"><i class="fas fa-ban mr-1"></i> Cita cancelada</span>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');

      } catch (err: any) {
        (window as any).showToast('Error cargando citas: ' + err.message, 'error');
        agendaList.innerHTML = `<div class="col-span-full py-10 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
      }
    };

    dateInput.addEventListener('change', loadAppointments);
    stylistSelect.addEventListener('change', loadAppointments);
    newApptBtn.addEventListener('click', () => openAppointmentForm(null, loadAppointments));

    // Cargar citas inicialmente
    loadAppointments();

  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
  }
}

// Actualizar Estado de la Cita
(window as any).updateApptStatus = async function(id: string, newStatus: string) {
  let message = '¿Confirmas cambiar el estado de la cita?';
  if (newStatus === 'cancelled') message = '¿Estás seguro de cancelar esta cita?';

  (window as any).confirmDialog('Cambiar estado', message, async () => {
    try {
      const appt = await (window as any).pb.get('appointments', id);
      await (window as any).pb.update('appointments', id, { status: newStatus });
      
      // Si la cita se cancela, también intentamos anular el pedido de venta asociado
      if (newStatus === 'cancelled' && appt.sales_order_id) {
        try {
          await (window as any).pb.update('sales_orders', appt.sales_order_id, { status: 'cancelled' });
          (window as any).showToast('Cita y pedido de venta anulados.', 'success');
        } catch (_) {
          (window as any).showToast('Cita cancelada.', 'success');
        }
      } else {
        (window as any).showToast('Estado de cita actualizado.', 'success');
      }

      // Recargar agenda
      const dateFld = document.getElementById('spa-agenda-date') as HTMLInputElement;
      if (dateFld) dateFld.dispatchEvent(new Event('change'));

    } catch (err: any) {
      (window as any).showToast('Error al actualizar estado: ' + err.message, 'error');
    }
  });
};

// Facturar cita usando el Pedido de Ventas existente
(window as any).invoiceApptSalesOrder = function(orderId: string) {
  if (!orderId) {
    (window as any).showToast('Esta cita no posee un pedido de facturación asociado.', 'warning');
    return;
  }
  
  if (typeof (window as any).invoiceSalesOrderDirect === 'function') {
    (window as any).invoiceSalesOrderDirect(orderId);
  } else {
    (window as any).showToast('Módulo de facturación de pedidos no disponible.', 'warning');
  }
};


// ── TAB 2: EXPEDIENTE DE MASCOTAS ────────────────────────────────────────────
async function renderSpaMascotas(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando catálogo de mascotas...</div>`;

  try {
    container.innerHTML = `
      <!-- Filtros Mascotas -->
      <div class="bg-white rounded-2xl border p-4 mb-5 flex flex-wrap gap-4 items-center justify-between shadow-sm" style="border-color:#F0F0F0">
        <input id="spa-pet-q" class="form-input flex-1 min-w-48 text-xs" placeholder="Buscar por nombre de mascota, raza o dueño...">
        <button class="btn btn-primary" id="btn-new-pet"><i class="fas fa-plus"></i> Registrar Mascota</button>
      </div>

      <!-- Listado de Mascotas -->
      <div id="spa-pets-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-paw mr-2"></i>Cargando mascotas...</div>
      </div>
    `;

    const searchInput = document.getElementById('spa-pet-q') as HTMLInputElement;
    const petsGrid = document.getElementById('spa-pets-grid') as HTMLElement;
    const newPetBtn = document.getElementById('btn-new-pet') as HTMLButtonElement;

    const loadPets = async () => {
      petsGrid.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando mascotas...</div>`;
      
      const query = searchInput.value.toLowerCase().trim();

      try {
        const pets = await (window as any).pb.listAll('pets', {
          sort: 'name',
          expand: 'owner_id'
        });

        const filtered = pets.filter((p: any) => {
          const ownerName = p.expand?.owner_id?.name || '';
          return `${p.name} ${p.breed || ''} ${p.species || ''} ${ownerName}`.toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
          petsGrid.innerHTML = `
            <div class="col-span-full p-12 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
              <i class="fas fa-dog text-3xl mb-2" style="color:#9CA3AF"></i>
              <p class="text-sm font-semibold">No se encontraron mascotas.</p>
              <p class="text-xs mt-1">Registra la primera mascota para crear su expediente.</p>
            </div>
          `;
          return;
        }

        petsGrid.innerHTML = filtered.map((p: any) => {
          const owner = p.expand?.owner_id;
          const hasBehavior = p.behavior_notes && p.behavior_notes.trim();
          const hasAllergies = p.allergies && p.allergies.trim();

          let speciesIcon = 'fa-paw';
          if (p.species === 'PERRO') speciesIcon = 'fa-dog';
          else if (p.species === 'GATO') speciesIcon = 'fa-cat';
          else if (p.species === 'AVE') speciesIcon = 'fa-dove';

          return `
            <div class="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" style="border-color:#F0F0F0">
              <div>
                <!-- Encabezado Mascota -->
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:#F2F7FF; color:#1A4B8C">
                    <i class="fas ${speciesIcon}"></i>
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-extrabold text-sm truncate" style="color:#0D2137">${(window as any).esc(p.name)}</h4>
                    <p class="text-xs text-gray-500 truncate">${(window as any).esc(p.breed || 'Raza no definida')}</p>
                  </div>
                </div>

                <!-- Detalles -->
                <div class="text-xs space-y-1 text-gray-600 mb-4">
                  <div>Dueño: <strong class="text-gray-800">${(window as any).esc(owner?.name || '—')}</strong></div>
                  ${p.birthdate ? `<div>Edad/F.Nac: <strong class="text-gray-800">${p.birthdate}</strong></div>` : ''}
                </div>

                <!-- Alertas UX en tarjeta -->
                ${(hasBehavior || hasAllergies) ? `
                  <div class="flex flex-wrap gap-1 mb-3">
                    ${hasBehavior ? `<span class="badge badge-orange py-0.5 px-2 text-[9px] font-bold"><i class="fas fa-triangle-exclamation mr-1"></i>Conducta</span>` : ''}
                    ${hasAllergies ? `<span class="badge badge-red py-0.5 px-2 text-[9px] font-bold"><i class="fas fa-circle-exclamation mr-1"></i>Alergia</span>` : ''}
                  </div>
                ` : ''}
              </div>

              <!-- Acciones -->
              <div class="flex gap-1.5 mt-2 border-t pt-3" style="border-color:#F3F4F6">
                <button class="btn btn-outline btn-sm flex-1 justify-center" onclick="window.viewPetDetail('${p.id}')" title="Ver historial y expediente"><i class="fas fa-eye"></i> Ficha</button>
                <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#DCE6F8" onclick="window.editPetRecord('${p.id}')" title="Editar mascota"><i class="fas fa-pen"></i></button>
              </div>
            </div>
          `;
        }).join('');

      } catch (err: any) {
        (window as any).showToast('Error cargando mascotas: ' + err.message, 'error');
        petsGrid.innerHTML = `<div class="col-span-full py-10 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
      }
    };

    searchInput.addEventListener('input', () => {
      // Debounce simple
      const activeTimer = (window as any).__petSearchTimer;
      if (activeTimer) clearTimeout(activeTimer);
      (window as any).__petSearchTimer = setTimeout(loadPets, 200);
    });

    newPetBtn.addEventListener('click', () => openPetForm(null, loadPets));
    loadPets();

  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
  }
}

// Ficha de Mascota - Detalles e Historial
(window as any).viewPetDetail = async function(petId: string) {
  try {
    const [pet, appts] = await Promise.all([
      (window as any).pb.get('pets', petId, { expand: 'owner_id' }),
      (window as any).pb.listAll('appointments', {
        filter: `pet_id = "${petId}"`,
        sort: '-start_time',
        expand: 'stylist_id,service_id,sales_order_id'
      })
    ]);

    const owner = pet.expand?.owner_id;
    let speciesIcon = 'fa-paw';
    if (pet.species === 'PERRO') speciesIcon = 'fa-dog';
    else if (pet.species === 'GATO') speciesIcon = 'fa-cat';

    const hasBehavior = pet.behavior_notes && pet.behavior_notes.trim();
    const hasAllergies = pet.allergies && pet.allergies.trim();

    const detailHtml = `
      <div class="space-y-6 text-sm" style="color:#374151">
        <!-- Tarjeta de Perfil Mascota -->
        <div class="flex items-start gap-4 p-4 rounded-xl border" style="background:#F9FAFB; border-color:#E5E7EB">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style="background:#EEF4FF; color:#1A4B8C">
            <i class="fas ${speciesIcon}"></i>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 flex-1">
            <div class="col-span-full"><span class="text-[10px] uppercase font-bold text-gray-400">Mascota</span><h3 class="text-lg font-extrabold text-blue-900">${(window as any).esc(pet.name)}</h3></div>
            <div><span class="text-[10px] uppercase font-bold text-gray-400">Especie / Raza</span><p class="font-semibold">${(window as any).esc(pet.species)} — ${(window as any).esc(pet.breed || 'No definida')}</p></div>
            <div><span class="text-[10px] uppercase font-bold text-gray-400">Fecha Nacimiento</span><p class="font-semibold">${pet.birthdate || '—'}</p></div>
            <div class="col-span-full border-t pt-2 mt-1" style="border-color:#E5E7EB"><span class="text-[10px] uppercase font-bold text-gray-400 block">Propietario</span><span class="font-semibold text-gray-800">${owner ? (window as any).esc(owner.name) : '—'} (Celular: ${owner?.phone || '—'})</span></div>
          </div>
        </div>

        <!-- Alertas Críticas de Estética/Spa (UX Clave) -->
        ${(hasBehavior || hasAllergies) ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${hasBehavior ? `
              <div class="p-3.5 rounded-xl text-orange-900 border flex items-start gap-2.5" style="background:#FFFDF5; border-color:#FDE68A">
                <i class="fas fa-triangle-exclamation text-orange-500 mt-0.5 text-base"></i>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wide block text-orange-800">Nota de Conducta</span>
                  <p class="font-bold text-xs mt-0.5">${(window as any).esc(pet.behavior_notes)}</p>
                </div>
              </div>
            ` : ''}
            ${hasAllergies ? `
              <div class="p-3.5 rounded-xl text-red-900 border flex items-start gap-2.5" style="background:#FEF2F2; border-color:#FCA5A5">
                <i class="fas fa-circle-exclamation text-red-500 mt-0.5 text-base"></i>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wide block text-red-800">Alergias / Contraindicaciones</span>
                  <p class="font-bold text-xs mt-0.5">${(window as any).esc(pet.allergies)}</p>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Historial de Servicios -->
        <div>
          <h4 class="font-bold text-sm mb-3 text-gray-800"><i class="fas fa-clock-rotate-left mr-1.5 text-gray-400"></i> Historial de Citas y Estética</h4>
          <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
            <table class="data-table w-full">
              <thead>
                <tr style="background:#F4F8FF">
                  <th>Fecha</th>
                  <th>Servicio</th>
                  <th>Estilista</th>
                  <th>Notas / Observaciones</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${appts.length ? appts.map((a: any) => {
                  const meta = APPT_STATUS[a.status] || { label: a.status, badge: 'badge-gray' };
                  const stylist = a.expand?.stylist_id;
                  const service = a.expand?.service_id;
                  return `
                    <tr>
                      <td class="font-semibold text-xs whitespace-nowrap">${(window as any).esc(a.start_time.split(' ')[0] || a.start_time)}</td>
                      <td class="font-bold">${(window as any).esc(service?.name || '—')}</td>
                      <td class="text-xs">${(window as any).esc(stylist?.name || stylist?.full_name || '—')}</td>
                      <td class="text-xs text-gray-500 italic">"${(window as any).esc(a.notes || '—')}"</td>
                      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                    </tr>
                  `;
                }).join('') : `<tr><td colspan="5" class="text-center py-8 text-gray-400 italic">No registra citas anteriores.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const footer = `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`;
    (window as any).openModal(`Expediente Mascota: ${pet.name}`, detailHtml, footer, true);
  } catch (err: any) {
    (window as any).showToast('Error cargando ficha: ' + err.message, 'error');
  }
};

// Editar Mascota
(window as any).editPetRecord = function(id: string) {
  openPetForm(id, () => {
    const term = document.getElementById('spa-pet-q') as HTMLInputElement;
    if (term) term.dispatchEvent(new Event('input'));
  });
};


// ── FORMULARIO: REGISTRAR / EDITAR MASCOTA ────────────────────────────────────
async function openPetForm(petId: string | null = null, onDone: any = null) {
  let pet: any = null;
  const customers = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });

  if (petId) {
    pet = await (window as any).pb.get('pets', petId, { expand: 'owner_id' });
  }

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label font-bold">Nombre Mascota <span style="color:#EF4444">*</span></label>
          <input id="petf-name" class="form-input" placeholder="Ej: Luna" value="${(window as any).esc(pet?.name || '')}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Especie <span style="color:#EF4444">*</span></label>
          <select id="petf-species" class="form-input">
            <option value="PERRO" ${pet?.species === 'PERRO' ? 'selected' : ''}>Perro</option>
            <option value="GATO" ${pet?.species === 'GATO' ? 'selected' : ''}>Gato</option>
            <option value="AVE" ${pet?.species === 'AVE' ? 'selected' : ''}>Ave</option>
            <option value="ROEDOR" ${pet?.species === 'ROEDOR' ? 'selected' : ''}>Rodedor</option>
            <option value="REPTIL" ${pet?.species === 'REPTIL' ? 'selected' : ''}>Reptil</option>
            <option value="OTRO" ${pet?.species === 'OTRO' ? 'selected' : ''}>Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Raza</label>
          <input id="petf-breed" class="form-input" placeholder="Ej: French Poodle" value="${(window as any).esc(pet?.breed || '')}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Fecha Nacimiento / Edad</label>
          <input id="petf-birth" class="form-input" placeholder="Ej: 2 años / 2024-03-12" value="${(window as any).esc(pet?.birthdate || '')}">
        </div>

        <!-- Autocomplete Dueño (Mapeo a third_parties) -->
        <div class="form-group relative md:col-span-2">
          <label class="form-label font-bold">Propietario / Cliente <span style="color:#EF4444">*</span></label>
          <div class="relative flex gap-1 items-center">
            <input id="petf-owner-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del cliente...">
            <input id="petf-owner-id" type="hidden" value="${(window as any).esc(pet?.owner_id || '')}">
            <div id="petf-owner-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
          </div>
        </div>

        <div class="form-group md:col-span-2">
          <label class="form-label font-bold text-orange-800"><i class="fas fa-triangle-exclamation"></i> Notas de Comportamiento / Conducta</label>
          <input id="petf-behavior" class="form-input" placeholder="Ej: Muy nervioso con el secador, tiende a morder" value="${(window as any).esc(pet?.behavior_notes || '')}">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold text-red-800"><i class="fas fa-circle-exclamation"></i> Alergias / Observaciones Médicas</label>
          <input id="petf-allergies" class="form-input" placeholder="Ej: Alergia a champú tradicional. Usar champú medicado de avena." value="${(window as any).esc(pet?.allergies || '')}">
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-pet"><i class="fas fa-floppy-disk"></i> Guardar Mascota</button>
  `;

  (window as any).openModal(petId ? 'Editar Registro de Mascota' : 'Registrar Nueva Mascota', formHtml, footer, false);

  // Autocomplete
  const search = document.getElementById('petf-owner-search') as HTMLInputElement;
  const ownerIdHidden = document.getElementById('petf-owner-id') as HTMLInputElement;
  const results = document.getElementById('petf-owner-results') as HTMLElement;

  if (pet && pet.owner_id) {
    const match = customers.find((c: any) => c.id === pet.owner_id);
    if (match) search.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
  }

  const performSearch = (val: string) => {
    const query = val.toLowerCase().trim();
    const filtered = !query 
      ? customers.slice(0, 30) 
      : customers.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(query)).slice(0, 30);

    results.innerHTML = filtered.map((c: any) => `
      <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
              onclick="window.selectPetOwner('${c.id}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
        <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
        <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || '—'}</div>
      </button>
    `).join('');
  };

  search.addEventListener('focus', () => { performSearch(search.value); results.style.display = 'block'; });
  search.addEventListener('input', () => { ownerIdHidden.value = ''; performSearch(search.value); results.style.display = 'block'; });
  search.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

  (window as any).selectPetOwner = function(id: string, text: string) {
    if (ownerIdHidden && search) {
      ownerIdHidden.value = id;
      search.value = text;
    }
  };

  // Guardar
  document.getElementById('btn-save-pet')?.addEventListener('click', async () => {
    try {
      const name = (document.getElementById('petf-name') as HTMLInputElement).value.trim();
      const species = (document.getElementById('petf-species') as HTMLSelectElement).value;
      const breed = (document.getElementById('petf-breed') as HTMLInputElement).value.trim();
      const birth = (document.getElementById('petf-birth') as HTMLInputElement).value.trim();
      const ownerId = ownerIdHidden.value;
      const behavior = (document.getElementById('petf-behavior') as HTMLInputElement).value.trim();
      const allergies = (document.getElementById('petf-allergies') as HTMLInputElement).value.trim();

      if (!name) throw new Error('El nombre de la mascota es obligatorio.');
      if (!ownerId) throw new Error('Debes seleccionar un propietario registrado.');

      const payload = {
        name, species, breed,
        birthdate: birth,
        owner_id: ownerId,
        behavior_notes: behavior,
        allergies
      };

      if (petId) {
        await (window as any).pb.update('pets', petId, payload);
        (window as any).showToast('Ficha de mascota actualizada.', 'success');
      } else {
        await (window as any).pb.create('pets', payload);
        (window as any).showToast('Mascota registrada con éxito.', 'success');
      }

      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
    }
  });
}


// ── FORMULARIO: PROGRAMAR NUEVA CITA / AGENDAMIENTO ───────────────────────────
async function openAppointmentForm(apptId: string | null = null, onDone: any = null) {
  const [pets, services, stylists, warehouses] = await Promise.all([
    (window as any).pb.listAll('pets', { sort: 'name' }),
    (window as any).pb.listAll('products', { filter: 'active=true && type="SERVICIO"', sort: 'name' }),
    (window as any).pb.listAll('third_parties', { filter: 'active=true && type="VENDEDOR"', sort: 'name' }),
    (window as any).API.getWarehouses(true),
  ]);

  if (pets.length === 0) {
    (window as any).showToast('Primero debes registrar al menos una mascota.', 'warning');
    return;
  }
  if (services.length === 0) {
    (window as any).showToast('Crea primero productos de tipo "SERVICIO" (Ej: Baño, Corte) en Productos.', 'warning');
    return;
  }

  const defaultWh = warehouses[0]?.id || '';

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Mascota -->
        <div class="form-group">
          <label class="form-label font-bold">Mascota <span style="color:#EF4444">*</span></label>
          <select id="apptf-pet" class="form-input">
            <option value="">— Selecciona Mascota —</option>
            ${pets.map((p: any) => `<option value="${p.id}" data-owner="${p.owner_id}">${(window as any).esc(p.name)} (${(window as any).esc(p.breed || p.species)})</option>`).join('')}
          </select>
        </div>

        <!-- Servicio -->
        <div class="form-group">
          <label class="form-label font-bold">Servicio del Spa <span style="color:#EF4444">*</span></label>
          <select id="apptf-service" class="form-input">
            <option value="">— Selecciona Servicio —</option>
            ${services.map((s: any) => `<option value="${s.id}" data-price="${s.base_price}" data-iva="${s.iva_rate}">${(window as any).esc(s.name)} — ${(window as any).fmt(s.base_price)}</option>`).join('')}
          </select>
        </div>

        <!-- Estilista -->
        <div class="form-group">
          <label class="form-label font-bold">Estilista / Colaborador <span style="color:#EF4444">*</span></label>
          <select id="apptf-stylist" class="form-input">
            <option value="">— Selecciona Estilista —</option>
            ${stylists.map((s: any) => `<option value="${s.id}">${(window as any).esc(s.name)}</option>`).join('')}
          </select>
        </div>

        <!-- Bodega por defecto -->
        <input type="hidden" id="apptf-wh" value="${defaultWh}">

        <!-- Horarios -->
        <div class="form-group">
          <label class="form-label font-bold">Fecha y Hora de Cita <span style="color:#EF4444">*</span></label>
          <input id="apptf-start" type="datetime-local" class="form-input" value="${(window as any).todayStr()}T09:00">
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Duración Estimada</label>
          <select id="apptf-duration" class="form-input">
            <option value="30">30 minutos</option>
            <option value="60" selected>1 hora</option>
            <option value="90">1.5 horas</option>
            <option value="120">2 horas</option>
          </select>
        </div>

        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Notas / Recomendaciones adicionales</label>
          <input id="apptf-notes" class="form-input" placeholder="Ej: usar champú hipoalergénico, corte bajo en orejas">
        </div>

      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-appt"><i class="fas fa-calendar-check"></i> Agendar y Generar Pedido</button>
  `;

  (window as any).openModal('Agendar Cita Spa', formHtml, footer, false);

  // Guardar Cita e Integrar Pedido
  document.getElementById('btn-save-appt')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-appt') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...'; }

    try {
      const petId = (document.getElementById('apptf-pet') as HTMLSelectElement).value;
      const serviceId = (document.getElementById('apptf-service') as HTMLSelectElement).value;
      const stylistId = (document.getElementById('apptf-stylist') as HTMLSelectElement).value;
      const startTimeVal = (document.getElementById('apptf-start') as HTMLInputElement).value;
      const durationVal = parseInt((document.getElementById('apptf-duration') as HTMLSelectElement).value);
      const notes = (document.getElementById('apptf-notes') as HTMLInputElement).value.trim();
      const warehouseId = (document.getElementById('apptf-wh') as HTMLInputElement).value || null;

      if (!petId) throw new Error('Debes seleccionar una mascota.');
      if (!serviceId) throw new Error('Debes seleccionar el servicio.');
      if (!stylistId) throw new Error('Debes seleccionar un estilista.');
      if (!startTimeVal) throw new Error('La fecha y hora de inicio son obligatorias.');

      // 1. Calcular horarios
      const startD = new Date(startTimeVal);
      const endD = new Date(startD.getTime() + durationVal * 60 * 1000);
      
      const formatDT = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      const startTimeStr = formatDT(startD);
      const endTimeStr = formatDT(endD);

      // Fetch pet to get owner_id
      const petRecord = pets.find((p: any) => p.id === petId);
      const ownerId = petRecord?.owner_id;
      if (!ownerId) throw new Error('La mascota seleccionada no posee dueño asignado.');

      // Fetch service product details
      const serviceProd = services.find((s: any) => s.id === serviceId);
      const price = serviceProd?.base_price || 0;
      const ivaRate = serviceProd?.iva_rate ?? 19;
      const ivaAmt = price * (ivaRate / 100);
      const total = price + ivaAmt;

      // ── Mapeo Contable Crítico: Generar Pedido de Venta Pendiente ──
      console.log('Creando pedido de venta asociado...');
      const orderHeader = {
        customer_id: ownerId,
        warehouse_id: warehouseId,
        seller_id: stylistId,
        date: startTimeVal.split('T')[0],
        due_date: startTimeVal.split('T')[0],
        notes: `Spa Mascota: ${petRecord.name} — Servicio: ${serviceProd.name}`
      };

      const orderLines = [
        {
          product_id: serviceId,
          description: `Servicio Spa: ${serviceProd.name} — Mascota: ${petRecord.name}`,
          qty: 1,
          unit_price: price,
          iva_rate: ivaRate,
          iva_amount: ivaAmt,
          subtotal: price,
          total: total
        }
      ];

      // Llamada al endpoint para registrar preventa (pedido)
      const salesOrder = await (window as any).API.createSalesOrder(orderHeader, orderLines);

      // 2. Crear Cita vinculando el Pedido
      console.log('Guardando cita en agenda...');
      await (window as any).pb.create('appointments', {
        pet_id: petId,
        stylist_id: stylistId,
        start_time: startTimeStr,
        end_time: endTimeStr,
        service_id: serviceId,
        status: 'pending',
        notes,
        sales_order_id: salesOrder.id
      });

      (window as any).showToast('Cita agendada y pedido de venta generado.', 'success');
      (window as any).closeModal();
      if (onDone) onDone();

    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo guardar la cita.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-calendar-check"></i> Agendar y Generar Pedido'; }
    }
  });
}

// Registrar en el scope global
(window as any).renderSpa = renderSpa;
