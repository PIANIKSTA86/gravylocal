/**
 * GRAVY v2.0 — spa-belleza.ts
 * Módulo Especializado de Spa de Belleza y Estética Humana (Cosmetología y Cuidado Personal).
 * Fichas clínicas estéticas (tipo de piel, contraindicaciones médicas, alergias cosméticas),
 * agenda de citas con cosmetólogas/especialistas, facturación contable (Pedidos con IVA) y reportes en Excel.
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

let pricesIncludeIva = false;

function getServicePriceDisplay(service: any): number {
  if (!service) return 0;
  const base = service.base_price || 0;
  if (pricesIncludeIva) {
    const ivaRate = service.iva_rate ?? 19;
    return Math.round(base * (1 + ivaRate / 100) * 100) / 100;
  }
  return base;
}

function calculateAge(birthdateStr: string): string {
  if (!birthdateStr) return '—';
  const parts = String(birthdateStr).split('-');
  if (parts.length !== 3) return birthdateStr;
  const bYear = parseInt(parts[0], 10);
  const bMonth = parseInt(parts[1], 10) - 1;
  const bDay = parseInt(parts[2], 10);
  if (isNaN(bYear) || isNaN(bMonth) || isNaN(bDay)) return birthdateStr;

  const today = new Date();
  let years = today.getFullYear() - bYear;
  let months = today.getMonth() - bMonth;
  let days = today.getDate() - bDay;

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const out = [];
  if (years > 0) out.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) out.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (years === 0 && months === 0 && days >= 0) out.push(`${days} ${days === 1 ? 'día' : 'días'}`);
  return out.join(', ') || '0 días';
}

/** Modal ágil para crear un cliente (tercero) sin salir del módulo SPA */
function openQuickClientModal(onSaved: (client: any) => void) {
  const formHtml = `
    <div class="space-y-3 text-xs" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label font-bold">Tipo Documento</label>
          <select id="quickc-doc-type" class="form-input text-xs">
            <option value="CC" selected>Cédula de Ciudadanía (CC)</option>
            <option value="CE">Cédula de Extranjería (CE)</option>
            <option value="NIT">NIT</option>
            <option value="PP">Pasaporte</option>
            <option value="TI">Tarjeta de Identidad</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Número de Documento <span style="color:#EF4444">*</span></label>
          <input id="quickc-doc-num" class="form-input text-xs" placeholder="Ej: 1020304050" required>
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Nombre Completo <span style="color:#EF4444">*</span></label>
          <input id="quickc-name" class="form-input text-xs" placeholder="Ej: Laura Sofía Gómez" required>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Teléfono Celular / WhatsApp</label>
          <input id="quickc-phone" class="form-input text-xs" placeholder="Ej: 3101234567">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Correo Electrónico</label>
          <input id="quickc-email" type="email" class="form-input text-xs" placeholder="Ej: cliente@correo.com">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Dirección</label>
          <input id="quickc-address" class="form-input text-xs" placeholder="Ej: Calle 10 # 40-20">
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary btn-sm" id="btn-save-quick-client" style="background:#8B5CF6; border-color:#8B5CF6">
      <i class="fas fa-user-plus mr-1"></i> Guardar y Seleccionar
    </button>
  `;

  (window as any).openModal('Registrar Nuevo Cliente', formHtml, footer, false);

  document.getElementById('btn-save-quick-client')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-quick-client') as HTMLButtonElement;
    const docType = (document.getElementById('quickc-doc-type') as HTMLSelectElement).value;
    const docNum = (document.getElementById('quickc-doc-num') as HTMLInputElement).value.trim();
    const name = (document.getElementById('quickc-name') as HTMLInputElement).value.trim();
    const phone = (document.getElementById('quickc-phone') as HTMLInputElement).value.trim();
    const email = (document.getElementById('quickc-email') as HTMLInputElement).value.trim().toLowerCase();
    const address = (document.getElementById('quickc-address') as HTMLInputElement).value.trim();

    if (!docNum || !name) {
      (window as any).showToast('Documento y Nombre son campos requeridos.', 'warning');
      return;
    }

    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...`; }

    try {
      const payload: any = {
        type: 'CLIENTE',
        doc_type: docType,
        doc_number: docNum,
        name: name,
        phone: phone,
        email: email,
        address: address,
        active: true
      };

      const newRecord = await (window as any).pb.create('third_parties', payload);
      (window as any).showToast('Cliente creado exitosamente.', 'success');
      (window as any).closeModal();
      onSaved(newRecord);
    } catch (err: any) {
      (window as any).showToast('Error creando cliente: ' + (err.message || err), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-user-plus mr-1"></i> Guardar y Seleccionar`; }
    }
  });
}

// ── HELPER AUTOCOMPLETE DINÁMICO (TECLADO + MOUSE) ───────────────────────────
interface AutocompleteItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

function bindAutocomplete(config: {
  searchInput: HTMLInputElement;
  hiddenInput: HTMLInputElement;
  resultsContainer: HTMLElement;
  getItems: (query: string) => AutocompleteItem[];
  onSelect?: (item: AutocompleteItem) => void;
}) {
  const { searchInput, hiddenInput, resultsContainer, getItems, onSelect } = config;
  let activeIndex = -1;
  let currentItems: AutocompleteItem[] = [];

  const render = () => {
    const query = searchInput.value.toLowerCase().trim();
    currentItems = getItems(query);
    activeIndex = currentItems.length > 0 ? 0 : -1;

    if (currentItems.length === 0) {
      resultsContainer.innerHTML = `
        <div class="px-3 py-3 text-xs text-gray-400 italic text-center">No se encontraron coincidencias</div>
      `;
      resultsContainer.style.display = 'block';
      return;
    }

    resultsContainer.innerHTML = currentItems.map((item, idx) => `
      <div data-idx="${idx}" class="ac-item-row w-full text-left px-3 py-2 text-xs border-b cursor-pointer transition-colors ${idx === activeIndex ? 'bg-purple-100 font-bold' : 'bg-white hover:bg-gray-100'}" style="border-bottom-color:#F3F4F6">
        <div class="font-bold text-gray-800 flex items-center justify-between">
          <span>${(window as any).esc(item.title)}</span>
          ${item.badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">${(window as any).esc(item.badge)}</span>` : ''}
        </div>
        ${item.subtitle ? `<div class="text-[10px] text-gray-500 mt-0.5">${(window as any).esc(item.subtitle)}</div>` : ''}
      </div>
    `).join('');

    resultsContainer.style.display = 'block';

    const itemEls = resultsContainer.querySelectorAll('.ac-item-row');
    itemEls.forEach((el, idx) => {
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectItem(currentItems[idx]);
      });
      el.addEventListener('mouseenter', () => {
        highlightIndex(idx);
      });
    });
  };

  const highlightIndex = (index: number) => {
    const itemEls = resultsContainer.querySelectorAll('.ac-item-row');
    itemEls.forEach((el, idx) => {
      if (idx === index) {
        el.classList.add('bg-purple-100', 'font-bold');
        el.classList.remove('bg-white', 'hover:bg-gray-100');
        (el as HTMLElement).scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('bg-purple-100', 'font-bold');
        el.classList.add('bg-white');
      }
    });
    activeIndex = index;
  };

  const selectItem = (item: AutocompleteItem) => {
    if (!item) return;
    hiddenInput.value = item.id;
    searchInput.value = item.title;
    resultsContainer.style.display = 'none';
    if (onSelect) onSelect(item);
  };

  searchInput.addEventListener('focus', () => {
    render();
  });

  searchInput.addEventListener('input', () => {
    hiddenInput.value = '';
    render();
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      resultsContainer.style.display = 'none';
    }, 180);
  });

  searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (resultsContainer.style.display === 'none') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        render();
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length > 0) {
        const nextIdx = (activeIndex + 1) % currentItems.length;
        highlightIndex(nextIdx);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length > 0) {
        const prevIdx = (activeIndex - 1 + currentItems.length) % currentItems.length;
        highlightIndex(prevIdx);
      }
    } else if (e.key === 'Enter') {
      if (resultsContainer.style.display === 'block' && activeIndex >= 0 && activeIndex < currentItems.length) {
        e.preventDefault();
        selectItem(currentItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      resultsContainer.style.display = 'none';
    }
  });
}

// ── RENDER PRINCIPAL DEL MÓDULO SPA BELLEZA ────────────────────────────────────
export async function renderSpaBelleza(container: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  container = getContainer(container);
  if (!container) return;
  (window as any).renderSpaBelleza = renderSpaBelleza;
  try {
    const [rawSalesCfg, rawPosCfg] = await Promise.all([
      (window as any).API.getSetting('sales_settings_v2').catch(() => null),
      (window as any).API.getSetting('pos_settings_v1').catch(() => null),
    ]);

    const salesConfig = rawSalesCfg ? JSON.parse(rawSalesCfg) : null;
    const posConfig = rawPosCfg ? JSON.parse(rawPosCfg) : null;
    pricesIncludeIva = (salesConfig?.operational?.prices_include_iva === true) || (posConfig?.special?.prices_include_iva === true);
  } catch (e) {
    console.warn("Error loading config in spa-belleza.ts:", e);
  }

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold flex items-center gap-2" style="color:#0D2137">
          <i class="fas fa-[#8B5CF6] fa-spa text-purple-600"></i> Spa de Belleza y Estética Humana
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Gestión de cosmetología, tratamientos faciales y corporales, fichas clínicas estéticas y agendamiento con especialistas.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <a href="/citas.html" target="_blank" class="btn btn-outline btn-sm text-purple-700 font-bold border-purple-300 hover:bg-purple-50" title="Abrir página web pública de agendamiento de citas">
          <i class="fas fa-globe text-purple-600"></i> Portal Citas Online <i class="fas fa-up-right-from-square text-[10px] ml-0.5"></i>
        </a>
        <button id="btn-new-beauty-client-main" class="btn btn-outline btn-sm">
          <i class="fas fa-user-plus text-purple-600"></i> Nueva Ficha Estética
        </button>
        <button id="btn-new-beauty-appt-main" class="btn btn-primary btn-sm" style="background:#8B5CF6; border-color:#8B5CF6">
          <i class="fas fa-calendar-plus"></i> Agendar Cita Estética
        </button>
      </div>
    </div>

    <!-- Pestañas Principales -->
    <div class="border-b mb-6" style="border-color:#E5E7EB">
      <nav class="flex gap-6 text-sm font-semibold">
        <button id="tab-btn-beauty-agenda" class="pb-3 border-b-2 text-purple-600 border-purple-600 flex items-center gap-2 cursor-pointer bg-transparent border-none">
          <i class="fas fa-calendar-days"></i> Agenda de Citas
        </button>
        <button id="tab-btn-beauty-clients" class="pb-3 border-b-2 text-gray-500 border-transparent hover:text-gray-700 flex items-center gap-2 cursor-pointer bg-transparent border-none">
          <i class="fas fa-id-card"></i> Expedientes Estéticos
        </button>
        <button id="tab-btn-beauty-reports" class="pb-3 border-b-2 text-gray-500 border-transparent hover:text-gray-700 flex items-center gap-2 cursor-pointer bg-transparent border-none">
          <i class="fas fa-chart-line"></i> Reportes y Métricas
        </button>
        <button id="tab-btn-beauty-config" class="pb-3 border-b-2 text-gray-500 border-transparent hover:text-gray-700 flex items-center gap-2 cursor-pointer bg-transparent border-none">
          <i class="fas fa-sliders text-purple-500"></i> Portal Citas & Servicios Online
        </button>
      </nav>
    </div>

    <!-- Contenedores de Sección -->
    <div id="beauty-sec-agenda" class="spa-tab-sec block"></div>
    <div id="beauty-sec-clients" class="spa-tab-sec hidden"></div>
    <div id="beauty-sec-reports" class="spa-tab-sec hidden"></div>
    <div id="beauty-sec-config" class="spa-tab-sec hidden"></div>
  `;

  const tabAgenda = document.getElementById('tab-btn-beauty-agenda') as HTMLButtonElement;
  const tabClients = document.getElementById('tab-btn-beauty-clients') as HTMLButtonElement;
  const tabReports = document.getElementById('tab-btn-beauty-reports') as HTMLButtonElement;
  const tabConfig = document.getElementById('tab-btn-beauty-config') as HTMLButtonElement;

  const secAgenda = document.getElementById('beauty-sec-agenda') as HTMLElement;
  const secClients = document.getElementById('beauty-sec-clients') as HTMLElement;
  const secReports = document.getElementById('beauty-sec-reports') as HTMLElement;
  const secConfig = document.getElementById('beauty-sec-config') as HTMLElement;

  const switchTab = (activeTab: HTMLButtonElement, activeSec: HTMLElement) => {
    [tabAgenda, tabClients, tabReports, tabConfig].forEach(t => {
      if (!t) return;
      t.classList.remove('text-purple-600', 'border-purple-600');
      t.classList.add('text-gray-500', 'border-transparent');
    });
    [secAgenda, secClients, secReports, secConfig].forEach(s => {
      if (!s) return;
      s.classList.add('hidden');
    });

    activeTab.classList.remove('text-gray-500', 'border-transparent');
    activeTab.classList.add('text-purple-600', 'border-purple-600');
    activeSec.classList.remove('hidden');
  };

  tabAgenda.addEventListener('click', () => { switchTab(tabAgenda, secAgenda); renderBeautyAgenda(secAgenda); });
  tabClients.addEventListener('click', () => { switchTab(tabClients, secClients); renderBeautyClients(secClients); });
  tabReports.addEventListener('click', () => { switchTab(tabReports, secReports); renderBeautyReports(secReports); });
  tabConfig.addEventListener('click', () => { switchTab(tabConfig, secConfig); renderBeautyConfig(secConfig); });

  document.getElementById('btn-new-beauty-client-main')?.addEventListener('click', () => {
    openBeautyClientForm(null, () => {
      if (!secClients.classList.contains('hidden')) renderBeautyClients(secClients);
    });
  });

  document.getElementById('btn-new-beauty-appt-main')?.addEventListener('click', () => {
    openBeautyAppointmentForm(null, () => {
      if (!secAgenda.classList.contains('hidden')) renderBeautyAgenda(secAgenda);
    });
  });

  renderBeautyAgenda(secAgenda);
}

// ── VISTA 1: AGENDA DE CITAS ESTÉTICAS ────────────────────────────────────────
async function renderBeautyAgenda(container: HTMLElement) {
  const stylists = await (window as any).pb.listAll('third_parties', { filter: 'active=true && type="EMPLEADO"', sort: 'name' }).catch(() => []);
  const thirdPartiesList = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }).catch(() => []);
  const tpMap = new Map(thirdPartiesList.map((t: any) => [t.id, t]));

  container.innerHTML = `
    <div class="p-4 rounded-xl bg-white border mb-6 flex flex-wrap items-center justify-between gap-4" style="border-color:#E5E7EB">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label class="text-xs font-bold text-gray-500 block mb-1">Fecha de Agenda</label>
          <input id="beauty-agenda-date" type="date" class="form-input text-sm py-1.5 px-3" value="${(window as any).todayStr()}">
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 block mb-1">Cosmetóloga / Especialista</label>
          <select id="beauty-agenda-stylist" class="form-input text-sm py-1.5 px-3">
            <option value="">— Todas las Especialistas —</option>
            ${stylists.map((s: any) => `<option value="${s.id}">${(window as any).esc(s.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-export-beauty-agenda" class="btn btn-outline btn-sm">
          <i class="fas fa-file-excel text-green-600 mr-1"></i> Exportar Agenda
        </button>
        <button id="btn-new-beauty-appt" class="btn btn-primary btn-sm" style="background:#8B5CF6; border-color:#8B5CF6">
          <i class="fas fa-plus mr-1"></i> Agendar Cita
        </button>
      </div>
    </div>

    <!-- Grid de Citas -->
    <div id="beauty-agenda-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-calendar-days mr-2"></i>Cargando citas estéticas del día...</div>
    </div>
  `;

  const dateInput = document.getElementById('beauty-agenda-date') as HTMLInputElement;
  const stylistSelect = document.getElementById('beauty-agenda-stylist') as HTMLSelectElement;
  const agendaList = document.getElementById('beauty-agenda-list') as HTMLElement;
  const newApptBtn = document.getElementById('btn-new-beauty-appt') as HTMLButtonElement;
  const exportBtn = document.getElementById('btn-export-beauty-agenda') as HTMLButtonElement;

  let appointmentsCached: any[] = [];

  const loadAppointments = async () => {
    agendaList.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando citas...</div>`;
    
    const selDate = dateInput.value;
    const selStylist = stylistSelect.value;

    try {
      let filter = `start_time >= "${selDate} 00:00" && start_time <= "${selDate} 23:59"`;
      if (selStylist) filter += ` && stylist_id = "${selStylist}"`;

      const appts = await (window as any).pb.listAll('appointments', {
        filter,
        sort: 'start_time',
        expand: 'spa_client_id,client_id,stylist_id,service_id,sales_order_id'
      }).catch(() => (window as any).pb.listAll('appointments', { filter }).catch(() => []));

      // Filtrar citas humanas (NO tienen pet_id)
      const beautyAppts = appts.filter((a: any) => !a.pet_id);
      appointmentsCached = beautyAppts;

      if (beautyAppts.length === 0) {
        agendaList.innerHTML = `
          <div class="col-span-full p-12 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
            <i class="fas fa-calendar-xmark text-3xl mb-2" style="color:#8B5CF6"></i>
            <p class="text-sm font-semibold">No hay citas de belleza/estética para esta fecha.</p>
            <p class="text-xs mt-1">Haz clic en "Agendar Cita" para programar una sesión estética.</p>
          </div>
        `;
        return;
      }

      agendaList.innerHTML = beautyAppts.map((appt: any) => {
        const spaClient = appt.expand?.spa_client_id;
        const clientObj = (appt.client_id ? tpMap.get(appt.client_id) : null) 
          || appt.expand?.client_id 
          || (spaClient?.client_id ? tpMap.get(spaClient.client_id) : null) 
          || spaClient?.expand?.client_id;
        const meta = APPT_STATUS[appt.status] || { label: appt.status, badge: 'badge-gray', color: '#6B7280' };
        const service = appt.expand?.service_id;
        const stylist = appt.expand?.stylist_id;
        const salesOrder = appt.expand?.sales_order_id;
        const priceVal = getServicePriceDisplay(service);

        const clientName = clientObj?.name || 'Cliente';
        const clientDoc = clientObj?.doc_number || clientObj?.nit || '—';

        const hasMedical = spaClient?.medical_conditions && spaClient.medical_conditions.trim();
        const hasAllergies = spaClient?.allergies && spaClient.allergies.trim();

        return `
          <div class="p-4 bg-white rounded-2xl border shadow-sm flex flex-col justify-between" style="border-color:#E5E7EB">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-extrabold px-2.5 py-1 rounded-lg" style="background:#F5F3FF; color:#6D28D9">
                  <i class="far fa-clock mr-1"></i> ${appt.start_time.split(' ')[1] || ''} - ${appt.end_time.split(' ')[1] || ''}
                </span>
                <span class="badge ${meta.badge}">${meta.label}</span>
              </div>

              <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style="background:#F3E8FF; color:#7E22CE">
                  <i class="fas fa-user font-bold"></i>
                </div>
                <div>
                  <h4 class="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 cursor-pointer hover:text-purple-600" 
                      onclick="${spaClient?.id ? `window.viewBeautyClientDetail('${spaClient.id}')` : (clientObj?.id ? `window.createOrOpenSpaClientFromThirdParty('${clientObj.id}')` : '')}"
                      title="Ver o crear expediente estético">
                    ${(window as any).esc(clientName)}
                  </h4>
                  <p class="text-[11px] text-gray-500">
                    CC/NIT: <strong>${(window as any).esc(clientDoc)}</strong> ${spaClient?.skin_type ? `— Piel: <strong class="text-purple-700">${spaClient.skin_type}</strong>` : ''}
                  </p>
                </div>
              </div>

              ${(hasMedical || hasAllergies) ? `
                <div class="mb-3 p-2.5 rounded-lg text-xs space-y-1" style="background:#FAF5FF; border: 1px solid #E9D5FF">
                  ${hasMedical ? `<div class="text-purple-900 font-semibold"><i class="fas fa-notes-medical mr-1 text-purple-600"></i> Médicos: ${(window as any).esc(spaClient.medical_conditions)}</div>` : ''}
                  ${hasAllergies ? `<div class="text-red-800 font-semibold"><i class="fas fa-circle-exclamation mr-1 text-red-600"></i> Alergias: ${(window as any).esc(spaClient.allergies)}</div>` : ''}
                </div>
              ` : ''}

              <div class="space-y-1.5 text-xs text-gray-600 border-t pt-2.5 mb-3" style="border-color:#F3F4F6">
                <div class="flex justify-between"><span class="text-gray-400">Tratamiento:</span><span class="font-bold text-gray-800">${(window as any).esc(service?.name || '—')}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Especialista:</span><span class="font-semibold">${(window as any).esc(stylist?.name || '—')}</span></div>
                <div class="flex justify-between"><span class="text-gray-400">Valor Estimado:</span><span class="font-bold text-purple-700">${(window as any).fmt(priceVal)}</span></div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 border-t pt-3" style="border-color:#F3F4F6">
              ${appt.status === 'pending' ? `
                <button class="btn btn-primary btn-sm flex-1 text-xs" style="background:#8B5CF6; border-color:#8B5CF6" onclick="window.updateBeautyApptStatus('${appt.id}', 'in_progress')">
                  <i class="fas fa-play mr-1"></i> Iniciar
                </button>
              ` : ''}
              ${appt.status === 'in_progress' ? `
                <button class="btn btn-success btn-sm flex-1 text-xs" style="background:#059669; border-color:#059669" onclick="window.updateBeautyApptStatus('${appt.id}', 'completed')">
                  <i class="fas fa-check mr-1"></i> Finalizar
                </button>
              ` : ''}
              ${(appt.status === 'in_progress' || appt.status === 'completed') && salesOrder?.status === 'pending' ? `
                <button class="btn btn-sm text-xs font-bold" style="background:#059669; color:#fff; border:none" onclick="window.payBeautyApptInPos('${appt.id}')" title="Cobrar cita inmediatamente en Punto de Venta POS">
                  <i class="fas fa-cash-register mr-1"></i> Cobrar en POS
                </button>
              ` : ''}
              <button class="btn btn-outline btn-sm" onclick="window.editBeautyApptRecord('${appt.id}')" title="Editar cita">
                <i class="fas fa-pen"></i>
              </button>
              ${spaClient?.id ? `
                <button class="btn btn-outline btn-sm text-purple-700" onclick="window.viewBeautyClientDetail('${spaClient.id}')" title="Ver Expediente Estético">
                  <i class="fas fa-id-card"></i>
                </button>
              ` : (clientObj?.id ? `
                <button class="btn btn-outline btn-sm text-purple-700" onclick="window.createOrOpenSpaClientFromThirdParty('${clientObj.id}')" title="Crear Ficha Estética">
                  <i class="fas fa-plus-circle"></i> Ficha
                </button>
              ` : '')}
              ${salesOrder?.status === 'pending' ? `
                <button class="btn btn-outline btn-sm text-purple-700" onclick="window.location.hash='#pedidos'" title="Ver pedido contable">
                  <i class="fas fa-receipt"></i>
                </button>
              ` : ''}
              ${appt.status !== 'cancelled' ? `
                <button class="btn btn-outline btn-sm text-red-600" onclick="window.updateBeautyApptStatus('${appt.id}', 'cancelled')" title="Cancelar cita y anular orden de venta">
                  <i class="fas fa-xmark"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    } catch (err: any) {
      agendaList.innerHTML = `<div class="col-span-full py-10 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
    }
  };

  dateInput.addEventListener('change', loadAppointments);
  stylistSelect.addEventListener('change', loadAppointments);
  newApptBtn.addEventListener('click', () => openBeautyAppointmentForm(null, loadAppointments));

  exportBtn.addEventListener('click', () => {
    if (appointmentsCached.length === 0) {
      (window as any).showToast('No hay citas para exportar en la fecha seleccionada.', 'warning');
      return;
    }
    const data = appointmentsCached.map((a: any) => {
      const clientObj = tpMap.get(a.client_id) || a.expand?.client_id;
      return {
        'Fecha/Hora': a.start_time,
        'Cliente': clientObj?.name || '',
        'Documento': clientObj?.doc_number || clientObj?.nit || '',
        'Tratamiento': a.expand?.service_id?.name || '',
        'Especialista': a.expand?.stylist_id?.name || '',
        'Estado': APPT_STATUS[a.status]?.label || a.status,
        'Valor': getServicePriceDisplay(a.expand?.service_id)
      };
    });
    (window as any).exportExcel(data, `Agenda_Estetica_${dateInput.value}`);
  });

  loadAppointments();
}

// ── VISTA 2: EXPEDIENTES ESTÉTICOS HUMANO ──────────────────────────────────────
async function renderBeautyClients(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-4 rounded-xl bg-white border mb-6 flex flex-wrap items-center justify-between gap-4" style="border-color:#E5E7EB">
      <div class="relative flex-1 max-w-md">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input id="beauty-clients-q" class="form-input pl-9 text-sm" placeholder="Buscar expediente por nombre o documento...">
      </div>
      <button id="btn-new-beauty-client-tab" class="btn btn-primary btn-sm" style="background:#8B5CF6; border-color:#8B5CF6">
        <i class="fas fa-plus mr-1"></i> Nueva Ficha Estética
      </button>
    </div>

    <div id="beauty-clients-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando expedientes estéticos...</div>
    </div>
  `;

  const searchInput = document.getElementById('beauty-clients-q') as HTMLInputElement;
  const gridContainer = document.getElementById('beauty-clients-grid') as HTMLElement;
  const newClientBtn = document.getElementById('btn-new-beauty-client-tab') as HTMLButtonElement;

  const loadClients = async () => {
    gridContainer.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando expedientes...</div>`;
    const query = searchInput.value.toLowerCase().trim();

    try {
      const records = await (window as any).pb.listAll('spa_clients', {
        sort: '-id',
        expand: 'client_id'
      }).catch(() => (window as any).pb.listAll('spa_clients').catch(() => []));

      const filtered = records.filter((rec: any) => {
        const clientObj = rec.expand?.client_id;
        const searchStr = `${clientObj?.name || ''} ${clientObj?.doc_number || ''} ${clientObj?.nit || ''} ${rec.skin_type || ''}`.toLowerCase();
        return searchStr.includes(query);
      });

      if (filtered.length === 0) {
        gridContainer.innerHTML = `
          <div class="col-span-full p-12 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
            <i class="fas fa-id-card text-3xl mb-2" style="color:#8B5CF6"></i>
            <p class="text-sm font-semibold">No se encontraron expedientes estéticos.</p>
            <p class="text-xs mt-1">Haz clic en <strong>"Nueva Ficha Estética"</strong> para crear la primera.</p>
          </div>
        `;
        return;
      }

      gridContainer.innerHTML = filtered.map((rec: any) => {
        const clientObj = rec.expand?.client_id;
        return `
          <div class="p-4 bg-white rounded-2xl border shadow-sm flex flex-col justify-between" style="border-color:#E5E7EB">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:#F3E8FF; color:#7E22CE">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <h4 class="font-extrabold text-sm text-gray-900">${(window as any).esc(clientObj?.name || 'Cliente')}</h4>
                  <span class="text-xs text-purple-700 font-bold">Doc: ${(window as any).esc(clientObj?.doc_number || clientObj?.nit || '—')}</span>
                </div>
              </div>

              <div class="space-y-1 text-xs text-gray-600 border-t pt-2 mb-3" style="border-color:#F3F4F6">
                <div><span class="text-gray-400">Tipo de Piel:</span> <strong class="text-purple-800">${rec.skin_type || '—'}</strong></div>
                <div><span class="text-gray-400">Edad:</span> <strong class="text-gray-700">${calculateAge(rec.birthdate)}</strong></div>
                <div><span class="text-gray-400">Teléfono:</span> ${(window as any).esc(clientObj?.phone || '—')}</div>
              </div>
            </div>

            <div class="flex items-center gap-2 border-t pt-3" style="border-color:#F3F4F6">
              <button class="btn btn-outline btn-sm flex-1 justify-center" onclick="window.viewBeautyClientDetail('${rec.id}')">
                <i class="fas fa-eye"></i> Expediente
              </button>
              <button class="btn btn-outline btn-sm" onclick="window.editBeautyClientRecord('${rec.id}')">
                <i class="fas fa-pen"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    } catch (err: any) {
      gridContainer.innerHTML = `<div class="col-span-full py-10 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
    }
  };

  searchInput.addEventListener('input', () => {
    const activeTimer = (window as any).__beautySearchTimer;
    if (activeTimer) clearTimeout(activeTimer);
    (window as any).__beautySearchTimer = setTimeout(loadClients, 200);
  });

  newClientBtn.addEventListener('click', () => openBeautyClientForm(null, loadClients));
  loadClients();
}

// ── VISTA DETALLE EXPEDIENTE ESTÉTICO ─────────────────────────────────────────
(window as any).viewBeautyClientDetail = async function(recId: string) {
  try {
    const rec = await (window as any).pb.get('spa_clients', recId, { expand: 'client_id' })
      .catch(() => (window as any).pb.get('spa_clients', recId));

    const clientObj = rec.expand?.client_id;
    const clientId = rec.client_id || clientObj?.id;

    let appts: any[] = [];
    try {
      const allAppts = await (window as any).pb.listAll('appointments', {
        sort: '-start_time',
        expand: 'stylist_id,service_id,sales_order_id'
      }).catch(() => (window as any).pb.listAll('appointments').catch(() => []));

      appts = allAppts.filter((a: any) => a.client_id === clientId || a.spa_client_id === recId);
    } catch (_) {
      appts = [];
    }

    const hasMedical = rec.medical_conditions && rec.medical_conditions.trim();
    const hasAllergies = rec.allergies && rec.allergies.trim();

    const detailHtml = `
      <div class="space-y-6 text-sm" style="color:#374151">
        <div class="flex items-start gap-4 p-4 rounded-xl border" style="background:#FAF5FF; border-color:#E9D5FF">
          <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style="background:#F3E8FF; color:#7E22CE">
            <i class="fas fa-id-card"></i>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 flex-1">
            <div class="col-span-full"><span class="text-[10px] uppercase font-bold text-purple-500">Paciente / Cliente</span><h3 class="text-lg font-extrabold text-purple-900">${(window as any).esc(clientObj?.name || 'Cliente')}</h3></div>
            <div><span class="text-[10px] uppercase font-bold text-gray-400">Documento / Tipo Piel</span><p class="font-semibold">${clientObj?.doc_number || clientObj?.nit || '—'} (Piel: <span class="text-purple-700 font-bold">${rec.skin_type || 'Normal'}</span>)</p></div>
            <div><span class="text-[10px] uppercase font-bold text-gray-400">Nacimiento / Edad</span><p class="font-semibold">${rec.birthdate || '—'} (${calculateAge(rec.birthdate)})</p></div>
            <div class="col-span-full border-t pt-2 mt-1" style="border-color:#E9D5FF"><span class="text-[10px] uppercase font-bold text-gray-400 block">Contacto</span><span class="font-semibold text-gray-800">Teléfono: ${clientObj?.phone || '—'} | Email: ${clientObj?.email || '—'}</span></div>
          </div>
        </div>

        ${(hasMedical || hasAllergies) ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${hasMedical ? `
              <div class="p-3.5 rounded-xl text-purple-900 border flex items-start gap-2.5" style="background:#FAF5FF; border-color:#E9D5FF">
                <i class="fas fa-notes-medical text-purple-600 mt-0.5 text-base"></i>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wide block text-purple-800">Condiciones Médicas</span>
                  <p class="font-bold text-xs mt-0.5">${(window as any).esc(rec.medical_conditions)}</p>
                </div>
              </div>
            ` : ''}
            ${hasAllergies ? `
              <div class="p-3.5 rounded-xl text-red-900 border flex items-start gap-2.5" style="background:#FEF2F2; border-color:#FCA5A5">
                <i class="fas fa-circle-exclamation text-red-500 mt-0.5 text-base"></i>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wide block text-red-800">Alergias Cosméticas</span>
                  <p class="font-bold text-xs mt-0.5">${(window as any).esc(rec.allergies)}</p>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Historial de Tratamientos -->
        <div>
          <h4 class="font-bold text-sm text-gray-800 mb-3"><i class="fas fa-sparkles mr-1.5 text-purple-500"></i> Historial de Tratamientos Estéticos</h4>
          <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
            <table class="data-table w-full">
              <thead>
                <tr style="background:#F9FAFB">
                  <th>Fecha</th>
                  <th>Tratamiento</th>
                  <th>Especialista</th>
                  <th>Notas</th>
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
                      <td class="font-bold text-purple-900">${(window as any).esc(service?.name || '—')}</td>
                      <td class="text-xs">${(window as any).esc(stylist?.name || '—')}</td>
                      <td class="text-xs text-gray-500 italic">"${(window as any).esc(a.notes || '—')}"</td>
                      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                    </tr>
                  `;
                }).join('') : `<tr><td colspan="5" class="text-center py-8 text-gray-400 italic">No registra sesiones anteriores.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const footer = `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`;
    (window as any).openModal(`Expediente Estético: ${clientObj?.name || ''}`, detailHtml, footer, true);
  } catch (err: any) {
    (window as any).showToast('Error cargando expediente: ' + err.message, 'error');
  }
};

// ── FORMULARIO: REGISTRAR / EDITAR FICHA ESTÉTICA ─────────────────────────────
async function openBeautyClientForm(recordId: string | null = null, onDone: any = null, preselectedClientId: string | null = null) {
  let record: any = null;
  const customers = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }).catch(() => []);

  if (recordId) {
    record = await (window as any).pb.get('spa_clients', recordId, { expand: 'client_id' }).catch(() => null);
  }

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Cliente Tercero -->
        <div class="form-group relative md:col-span-2">
          <div class="flex items-center justify-between mb-1">
            <label class="form-label font-bold mb-0">Cliente / Paciente <span style="color:#EF4444">*</span></label>
            <button type="button" id="btn-quick-client-in-f" class="text-xs text-purple-600 font-bold hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
              <i class="fas fa-plus-circle"></i> Nuevo Cliente
            </button>
          </div>
          <input id="beautyf-client-search" class="form-input" autocomplete="off" placeholder="Buscar por cédula o nombre...">
          <input id="beautyf-client-id" type="hidden" value="${record?.client_id || preselectedClientId || ''}">
          <div id="beautyf-client-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
        </div>

        <!-- Tipo de Piel -->
        <div class="form-group">
          <label class="form-label font-bold">Tipo de Piel</label>
          <select id="beautyf-skin-type" class="form-input">
            <option value="NORMAL" ${record?.skin_type === 'NORMAL' ? 'selected' : ''}>Normal</option>
            <option value="MIXTA" ${record?.skin_type === 'MIXTA' ? 'selected' : ''}>Mixta</option>
            <option value="GRASA" ${record?.skin_type === 'GRASA' ? 'selected' : ''}>Grasa</option>
            <option value="SECA" ${record?.skin_type === 'SECA' ? 'selected' : ''}>Seca</option>
            <option value="SENSIBLE" ${record?.skin_type === 'SENSIBLE' ? 'selected' : ''}>Sensible</option>
          </select>
        </div>

        <!-- Fecha Nacimiento -->
        <div class="form-group">
          <label class="form-label font-bold">Fecha de Nacimiento</label>
          <input id="beautyf-birth" type="date" class="form-input" value="${record?.birthdate || ''}">
        </div>

        <!-- Condición Médica / Contraindicaciones -->
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold text-purple-800"><i class="fas fa-notes-medical"></i> Condiciones Médicas / Contraindicaciones</label>
          <input id="beautyf-medical" class="form-input" placeholder="Ej: Embarazo, marcapasos, hipertensión, peeling reciente, botox" value="${(window as any).esc(record?.medical_conditions || '')}">
        </div>

        <!-- Alergias Cosméticas -->
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold text-red-800"><i class="fas fa-circle-exclamation"></i> Alergias Cosméticas / Sensibilidades</label>
          <input id="beautyf-allergies" class="form-input" placeholder="Ej: Alergia a retinol, ácido salicílico, fragancias sintéticas" value="${(window as any).esc(record?.allergies || '')}">
        </div>

        <!-- Observaciones / Preferencias -->
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Preferencias / Historial de Tratamientos</label>
          <input id="beautyf-notes" class="form-input" placeholder="Ej: Prefiere masajes de presión media, fragancias lavanda" value="${(window as any).esc(record?.treatment_notes || '')}">
        </div>

      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-beauty-client" style="background:#8B5CF6; border-color:#8B5CF6"><i class="fas fa-floppy-disk"></i> Guardar Expediente</button>
  `;

  (window as any).openModal(recordId ? 'Editar Ficha Estética' : 'Registrar Ficha Estética', formHtml, footer, false);

  const search = document.getElementById('beautyf-client-search') as HTMLInputElement;
  const clientIdHidden = document.getElementById('beautyf-client-id') as HTMLInputElement;
  const results = document.getElementById('beautyf-client-results') as HTMLElement;

  const initialCId = record?.client_id || preselectedClientId;
  if (initialCId) {
    const match = customers.find((c: any) => c.id === initialCId);
    if (match) search.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
  }

  document.getElementById('btn-quick-client-in-f')?.addEventListener('click', () => {
    openQuickClientModal((newClient) => {
      customers.unshift(newClient);
      clientIdHidden.value = newClient.id;
      search.value = `${newClient.doc_number || newClient.nit || ''} - ${newClient.name}`;
    });
  });

  bindAutocomplete({
    searchInput: search,
    hiddenInput: clientIdHidden,
    resultsContainer: results,
    getItems: (query) => {
      const filtered = !query 
        ? customers.slice(0, 30) 
        : customers.filter((c: any) => `${c.name} ${c.doc_number || ''} ${c.nit || ''}`.toLowerCase().includes(query)).slice(0, 30);
      return filtered.map((c: any) => ({
        id: c.id,
        title: c.name,
        subtitle: `Doc: ${c.doc_number || c.nit || '—'}`
      }));
    }
  });

  document.getElementById('btn-save-beauty-client')?.addEventListener('click', async () => {
    try {
      const clientId = clientIdHidden.value;
      const skinType = (document.getElementById('beautyf-skin-type') as HTMLSelectElement).value;
      const birth = (document.getElementById('beautyf-birth') as HTMLInputElement).value;
      const medical = (document.getElementById('beautyf-medical') as HTMLInputElement).value.trim();
      const allergies = (document.getElementById('beautyf-allergies') as HTMLInputElement).value.trim();
      const notes = (document.getElementById('beautyf-notes') as HTMLInputElement).value.trim();

      if (!clientId) throw new Error('Debes seleccionar un cliente registrado.');

      const payload = {
        client_id: clientId,
        skin_type: skinType,
        birthdate: birth,
        medical_conditions: medical,
        allergies,
        treatment_notes: notes
      };

      if (recordId) {
        await (window as any).pb.update('spa_clients', recordId, payload);
        (window as any).showToast('Ficha estética actualizada con éxito.', 'success');
      } else {
        await (window as any).pb.create('spa_clients', payload);
        (window as any).showToast('Ficha estética registrada con éxito.', 'success');
      }

      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
    }
  });
}

(window as any).editBeautyClientRecord = function(id: string) {
  openBeautyClientForm(id, () => {
    const secClients = document.getElementById('beauty-sec-clients');
    if (secClients && !secClients.classList.contains('hidden')) renderBeautyClients(secClients);
  });
};

// ── FORMULARIO: PROGRAMAR CITA ESTÉTICA HUMANA ─────────────────────────────────
async function openBeautyAppointmentForm(apptId: string | null = null, onDone: any = null) {
  const [spaClients, thirdParties, services, stylists, warehouses] = await Promise.all([
    (window as any).pb.listAll('spa_clients', { sort: '-id', expand: 'client_id' }).catch(() => []),
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).pb.listAll('products', { filter: 'active=true && type="SERVICIO"', sort: 'name' }),
    (window as any).pb.listAll('third_parties', { filter: 'active=true && type="EMPLEADO"', sort: 'name' }),
    (window as any).API.getWarehouses(true),
  ]);

  if (services.length === 0) {
    (window as any).showToast('Crea primero productos de tipo "SERVICIO" en Productos.', 'warning');
    return;
  }

  const defaultWh = warehouses[0]?.id || '';
  let appt: any = null;
  let defaultDuration = 60;

  if (apptId) {
    appt = await (window as any).pb.get('appointments', apptId, { expand: 'client_id,spa_client_id,service_id' })
      .catch(() => (window as any).pb.get('appointments', apptId).catch(() => null));
    if (appt?.start_time && appt?.end_time) {
      const dStart = new Date(appt.start_time.replace(' ', 'T'));
      const dEnd = new Date(appt.end_time.replace(' ', 'T'));
      defaultDuration = Math.round((dEnd.getTime() - dStart.getTime()) / 60000);
    }
  }

  let defaultSubjectId = '';
  let defaultSubjectText = '';

  if (appt) {
    const spaRec = appt.expand?.spa_client_id || spaClients.find((s: any) => s.id === appt.spa_client_id);
    const targetClientId = appt.client_id || spaRec?.client_id || (typeof spaRec?.client_id === 'string' ? spaRec.client_id : spaRec?.client_id?.id);
    const client = thirdParties.find((t: any) => t.id === targetClientId) 
      || appt.expand?.client_id 
      || (spaRec?.expand?.client_id);

    defaultSubjectId = client ? client.id : (targetClientId || '');
    defaultSubjectText = client ? `${client.name} (${client.doc_number || client.nit || 'CC/NIT'})` : '';
  }

  const defaultServiceId = appt ? appt.service_id : '';
  const defaultServiceText = appt ? `${appt.expand?.service_id?.name} — ${(window as any).fmt(getServicePriceDisplay(appt.expand?.service_id))}` : '';
  const defaultStart = appt ? appt.start_time.replace(' ', 'T') : `${(window as any).todayStr()}T09:00`;
  const defaultNotes = appt ? appt.notes || '' : '';

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Autocomplete Cliente Persona -->
        <div class="form-group relative">
          <div class="flex items-center justify-between mb-1">
            <label class="form-label font-bold mb-0">Cliente / Paciente <span style="color:#EF4444">*</span></label>
            <button type="button" id="btn-quick-client-in-appt" class="text-xs text-purple-600 font-bold hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
              <i class="fas fa-plus-circle"></i> Nuevo Cliente
            </button>
          </div>
          <input id="apptf-subj-search" class="form-input" autocomplete="off" placeholder="Escribe para buscar cliente..." value="${(window as any).esc(defaultSubjectText)}">
          <input id="apptf-subj-id" type="hidden" value="${defaultSubjectId}">
          <div id="apptf-subj-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
        </div>

        <!-- Servicio / Tratamiento -->
        <div class="form-group relative">
          <label class="form-label font-bold">Tratamiento / Servicio Estético <span style="color:#EF4444">*</span></label>
          <input id="apptf-service-search" class="form-input" autocomplete="off" placeholder="Escribe para buscar tratamiento..." value="${(window as any).esc(defaultServiceText)}">
          <input id="apptf-service" type="hidden" value="${defaultServiceId}">
          <div id="apptf-service-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
        </div>

        <!-- Cosmetóloga / Especialista -->
        <div class="form-group">
          <label class="form-label font-bold">Cosmetóloga / Especialista <span style="color:#EF4444">*</span></label>
          <select id="apptf-stylist" class="form-input">
            <option value="">— Seleccionar Especialista —</option>
            ${stylists.map((s: any) => `<option value="${s.id}" ${appt?.stylist_id === s.id ? 'selected' : ''}>${(window as any).esc(s.name)}</option>`).join('')}
          </select>
        </div>

        <input type="hidden" id="apptf-wh" value="${defaultWh}">

        <!-- Horarios -->
        <div class="form-group">
          <label class="form-label font-bold">Fecha y Hora de Cita <span style="color:#EF4444">*</span></label>
          <input id="apptf-start" type="datetime-local" class="form-input" value="${defaultStart}">
        </div>

        <!-- Duración Estimada -->
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Duración Estimada</label>
          <div class="flex flex-wrap gap-2 items-center" id="apptf-duration-container">
            <button type="button" class="btn ${defaultDuration === 30 ? 'btn-primary active' : 'btn-outline'} btn-sm duration-btn" data-mins="30">30 min</button>
            <button type="button" class="btn ${defaultDuration === 60 ? 'btn-primary active' : 'btn-outline'} btn-sm duration-btn" data-mins="60">1 hora</button>
            <button type="button" class="btn ${defaultDuration === 90 ? 'btn-primary active' : 'btn-outline'} btn-sm duration-btn" data-mins="90">1.5 horas</button>
            <button type="button" class="btn ${defaultDuration === 120 ? 'btn-primary active' : 'btn-outline'} btn-sm duration-btn" data-mins="120">2 horas</button>
            <div class="flex items-center gap-1.5 ml-auto">
              <input id="apptf-duration-custom" type="number" class="form-input text-xs py-1 px-2 text-center" style="max-width:75px;height:32px" placeholder="Minutos" value="${[30, 60, 90, 120].includes(defaultDuration) ? '' : defaultDuration}">
              <span class="text-xs text-gray-500 font-semibold">min</span>
            </div>
          </div>
          <input id="apptf-duration" type="hidden" value="${defaultDuration}">
        </div>

        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Notas / Indicaciones adicionales</label>
          <input id="apptf-notes" class="form-input" placeholder="Ej: Piel sensible, preferencia suero ácido hialurónico" value="${(window as any).esc(defaultNotes)}">
        </div>

      </div>
    </div>
  `;

  const submitLabel = apptId ? 'Guardar Cambios' : 'Agendar y Generar Pedido';
  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-appt" style="background:#8B5CF6; border-color:#8B5CF6"><i class="fas fa-calendar-check"></i> ${submitLabel}</button>
  `;

  (window as any).openModal(apptId ? 'Modificar Cita Estética' : 'Agendar Cita Estética', formHtml, footer, false);

  const subjSearch = document.getElementById('apptf-subj-search') as HTMLInputElement;
  const subjIdHidden = document.getElementById('apptf-subj-id') as HTMLInputElement;
  const subjResults = document.getElementById('apptf-subj-results') as HTMLElement;

  document.getElementById('btn-quick-client-in-appt')?.addEventListener('click', () => {
    openQuickClientModal((newClient) => {
      thirdParties.unshift(newClient);
      subjIdHidden.value = newClient.id;
      subjSearch.value = `${newClient.name} (${newClient.doc_number || newClient.nit || 'CC/NIT'})`;
    });
  });

  bindAutocomplete({
    searchInput: subjSearch,
    hiddenInput: subjIdHidden,
    resultsContainer: subjResults,
    getItems: (query) => {
      const filtered = !query
        ? thirdParties.slice(0, 30)
        : thirdParties.filter((c: any) => `${c.name} ${c.doc_number || ''} ${c.nit || ''}`.toLowerCase().includes(query)).slice(0, 30);

      return filtered.map((c: any) => {
        const spaRec = spaClients.find((s: any) => s.client_id === c.id || s.client_id?.id === c.id || s.expand?.client_id?.id === c.id);
        return {
          id: c.id,
          title: c.name,
          subtitle: `Doc: ${c.doc_number || c.nit || '—'}${spaRec?.skin_type ? ` — Piel: ${spaRec.skin_type}` : ''}`,
          badge: spaRec?.skin_type || ''
        };
      });
    }
  });

  const serviceSearch = document.getElementById('apptf-service-search') as HTMLInputElement;
  const serviceIdHidden = document.getElementById('apptf-service') as HTMLInputElement;
  const serviceResults = document.getElementById('apptf-service-results') as HTMLElement;

  bindAutocomplete({
    searchInput: serviceSearch,
    hiddenInput: serviceIdHidden,
    resultsContainer: serviceResults,
    getItems: (query) => {
      const filtered = !query
        ? services.slice(0, 30)
        : services.filter((s: any) => `${s.name} ${s.code || ''}`.toLowerCase().includes(query)).slice(0, 30);

      return filtered.map((s: any) => ({
        id: s.id,
        title: s.name,
        subtitle: `Precio: ${(window as any).fmt(getServicePriceDisplay(s))}`,
        badge: (window as any).fmt(getServicePriceDisplay(s))
      }));
    }
  });

  // Duración Pills Logic
  const durationHidden = document.getElementById('apptf-duration') as HTMLInputElement;
  const durationButtons = document.querySelectorAll('.duration-btn');
  const customDurationInput = document.getElementById('apptf-duration-custom') as HTMLInputElement;

  durationButtons.forEach((btn: any) => {
    btn.addEventListener('click', () => {
      durationButtons.forEach((b: any) => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-outline');
      });
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary', 'active');
      durationHidden.value = btn.dataset.mins;
      customDurationInput.value = '';
    });
  });

  customDurationInput.addEventListener('input', () => {
    durationButtons.forEach((b: any) => {
      b.classList.remove('btn-primary', 'active');
      b.classList.add('btn-outline');
    });
    durationHidden.value = customDurationInput.value || '0';
  });

  // Guardar Cita
  document.getElementById('btn-save-appt')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-appt') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...`; }

    try {
      const clientId = subjIdHidden.value;
      const serviceId = serviceIdHidden.value;
      const stylistId = (document.getElementById('apptf-stylist') as HTMLSelectElement).value;
      const startTimeVal = (document.getElementById('apptf-start') as HTMLInputElement).value;
      const durationVal = parseInt(durationHidden.value || '60');
      const notes = (document.getElementById('apptf-notes') as HTMLInputElement).value.trim();
      const warehouseId = (document.getElementById('apptf-wh') as HTMLInputElement).value || null;

      if (!clientId) throw new Error('Debes seleccionar un cliente.');
      if (!serviceId) throw new Error('Debes seleccionar el servicio estético.');
      if (!stylistId) throw new Error('Debes seleccionar una Cosmetóloga/Especialista.');
      if (!startTimeVal) throw new Error('La fecha y hora de inicio son obligatorias.');
      if (durationVal <= 0) throw new Error('La duración debe ser mayor a 0 minutos.');

      const startD = new Date(startTimeVal);
      const endD = new Date(startD.getTime() + durationVal * 60 * 1000);
      
      const formatDT = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      const startTimeStr = formatDT(startD);
      const endTimeStr = formatDT(endD);

      // Control de Conflictos
      const selDate = startTimeVal.split('T')[0];
      const conflictFilter = `stylist_id = "${stylistId}" && start_time >= "${selDate} 00:00" && start_time <= "${selDate} 23:59" && status != "cancelled"`;
      const existingAppts = await (window as any).pb.listAll('appointments', { filter: conflictFilter }).catch(() => []);
      
      const isOverlapping = existingAppts.some((a: any) => {
        if (apptId && a.id === apptId) return false;
        const estStart = new Date(a.start_time.replace(' ', 'T'));
        const estEnd = new Date(a.end_time.replace(' ', 'T'));
        return startD < estEnd && estStart < endD;
      });

      if (isOverlapping) {
        throw new Error('La Cosmetóloga/Especialista seleccionada ya tiene otra cita programada en ese rango horario.');
      }

      const clientRec = thirdParties.find((c: any) => c.id === clientId);
      const spaRec = spaClients.find((s: any) => s.client_id === clientId || s.client_id?.id === clientId || s.expand?.client_id?.id === clientId);

      const serviceProd = services.find((s: any) => s.id === serviceId);
      const price = serviceProd?.base_price || 0;
      const ivaRate = serviceProd?.iva_rate ?? 19;
      const ivaAmt = price * (ivaRate / 100);
      const total = price + ivaAmt;

      const orderHeader = {
        customer_id: clientId,
        warehouse_id: warehouseId,
        seller_id: stylistId,
        date: startTimeVal.split('T')[0],
        due_date: startTimeVal.split('T')[0],
        notes: `Spa Belleza: Tratamiento ${serviceProd?.name || ''} para ${clientRec?.name || ''}`
      };

      const orderLines = [
        {
          product_id: serviceId,
          description: `Servicio Spa Belleza: ${serviceProd?.name || ''} (${clientRec?.name || ''})`,
          qty: 1,
          unit_price: price,
          iva_rate: ivaRate,
          iva_amount: ivaAmt,
          subtotal: price,
          total: total
        }
      ];

      const apptPayload: any = {
        client_id: clientId,
        stylist_id: stylistId,
        start_time: startTimeStr,
        end_time: endTimeStr,
        service_id: serviceId,
        notes: notes
      };

      if (spaRec) {
        apptPayload.spa_client_id = spaRec.id;
      }

      if (apptId) {
        const apptRecord = await (window as any).pb.get('appointments', apptId);
        const salesOrderId = apptRecord.sales_order_id;
        if (salesOrderId) {
          const so = await (window as any).pb.get('sales_orders', salesOrderId).catch(() => null);
          if (so && so.status === 'pending') {
            await (window as any).API.updateSalesOrder(salesOrderId, orderHeader, orderLines);
          }
        }
        await (window as any).pb.update('appointments', apptId, apptPayload);
        (window as any).showToast('Cita estética modificada con éxito.', 'success');
      } else {
        const salesOrder = await (window as any).API.createSalesOrder(orderHeader, orderLines);
        apptPayload.sales_order_id = salesOrder.id;
        apptPayload.status = 'pending';
        await (window as any).pb.create('appointments', apptPayload);
        (window as any).showToast('Cita estética agendada y pedido generado.', 'success');
      }

      (window as any).closeModal();
      if (onDone) onDone();

    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo guardar la cita.', 'error');
    } finally {
      if (btn) { 
        btn.disabled = false; 
        btn.innerHTML = apptId ? `<i class="fas fa-floppy-disk"></i> Guardar Cambios` : `<i class="fas fa-calendar-check"></i> Agendar y Generar Pedido`; 
      }
    }
  });
}

(window as any).editBeautyApptRecord = function(id: string) {
  openBeautyAppointmentForm(id, () => {
    const secAgenda = document.getElementById('beauty-sec-agenda');
    if (secAgenda && !secAgenda.classList.contains('hidden')) renderBeautyAgenda(secAgenda);
  });
};

/** Cobrar cita directamente en el Terminal POS */
(window as any).payBeautyApptInPos = async function(apptId: string) {
  try {
    const appt = await (window as any).pb.get('appointments', apptId, { expand: 'sales_order_id' }).catch(() => null);
    if (!appt) throw new Error('Cita no encontrada.');

    const orderId = appt.sales_order_id;
    if (!orderId) {
      (window as any).showToast('Esta cita no tiene un pedido de venta contable asociado.', 'warning');
      return;
    }

    (window as any).showToast('Cargando pedido en Terminal POS...', 'info');
    if (typeof (window as any).navigate === 'function') {
      (window as any).navigate('pos');
    } else {
      window.location.hash = '#pos';
    }

    // Dar tiempo para renderizar el POS si no estaba en pantalla
    setTimeout(() => {
      if (typeof (window as any).posApplyOrderToCart === 'function') {
        (window as any).posApplyOrderToCart(orderId);
      } else {
        (window as any).showToast('Abre el menú de pedidos en POS para cargar la orden.', 'info');
      }
    }, 320);
  } catch (err: any) {
    (window as any).showToast('Error cargando al POS: ' + (err.message || err), 'error');
  }
};

/** Permite abrir o crear la ficha estética a partir del tercero */
(window as any).createOrOpenSpaClientFromThirdParty = async function(thirdPartyId: string) {
  try {
    const records = await (window as any).pb.listAll('spa_clients', {
      filter: `client_id = "${thirdPartyId}"`
    }).catch(() => []);

    if (records.length > 0) {
      (window as any).viewBeautyClientDetail(records[0].id);
    } else {
      openBeautyClientForm(null, () => {
        const secClients = document.getElementById('beauty-sec-clients');
        if (secClients && !secClients.classList.contains('hidden')) renderBeautyClients(secClients);
        const secAgenda = document.getElementById('beauty-sec-agenda');
        if (secAgenda && !secAgenda.classList.contains('hidden')) renderBeautyAgenda(secAgenda);
      }, thirdPartyId);
    }
  } catch (err: any) {
    (window as any).showToast('Error accediendo al expediente: ' + err.message, 'error');
  }
};

(window as any).updateBeautyApptStatus = async function(id: string, newStatus: string) {
  try {
    const appt = await (window as any).pb.get('appointments', id).catch(() => null);
    await (window as any).pb.update('appointments', id, { status: newStatus });

    // Sincronización contable: si se cancela la cita, cancelar el pedido pendiente para evitar órdenes huérfanas
    if (newStatus === 'cancelled' && appt?.sales_order_id) {
      try {
        const so = await (window as any).pb.get('sales_orders', appt.sales_order_id).catch(() => null);
        if (so && so.status === 'pending') {
          await (window as any).pb.update('sales_orders', appt.sales_order_id, { status: 'cancelled' });
          (window as any).showToast('Pedido de venta asociado marcado como cancelado.', 'info');
        }
      } catch (_) {}
    }

    (window as any).showToast(`Estado de cita actualizado a: ${APPT_STATUS[newStatus]?.label || newStatus}`, 'success');
    const secAgenda = document.getElementById('beauty-sec-agenda');
    if (secAgenda && !secAgenda.classList.contains('hidden')) renderBeautyAgenda(secAgenda);
  } catch (err: any) {
    (window as any).showToast('No se pudo cambiar el estado: ' + err.message, 'error');
  }
};

// ── VISTA 3: REPORTES Y MÉTRICAS (SPA BELLEZA) ─────────────────────────────────
async function renderBeautyReports(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-4 rounded-xl bg-white border mb-6 flex flex-wrap items-center justify-between gap-4" style="border-color:#E5E7EB">
      <div class="flex flex-wrap items-center gap-3">
        <div>
          <label class="text-xs font-bold text-gray-500 block mb-1">Fecha Inicial</label>
          <input id="beauty-rep-start" type="date" class="form-input text-sm py-1.5 px-3" value="${(window as any).todayStr()}">
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 block mb-1">Fecha Final</label>
          <input id="beauty-rep-end" type="date" class="form-input text-sm py-1.5 px-3" value="${(window as any).todayStr()}">
        </div>
        <div class="self-end">
          <button id="btn-filter-beauty-rep" class="btn btn-primary btn-sm" style="background:#8B5CF6; border-color:#8B5CF6">
            <i class="fas fa-filter mr-1"></i> Generar Reporte
          </button>
        </div>
      </div>
    </div>

    <div id="beauty-rep-content" class="space-y-6">
      <div class="py-10 text-center text-gray-400"><i class="fas fa-chart-pie text-2xl mb-2 block"></i>Selecciona un rango de fechas y presiona "Generar Reporte".</div>
    </div>
  `;

  const startInput = document.getElementById('beauty-rep-start') as HTMLInputElement;
  const endInput = document.getElementById('beauty-rep-end') as HTMLInputElement;
  const filterBtn = document.getElementById('btn-filter-beauty-rep') as HTMLButtonElement;
  const repContent = document.getElementById('beauty-rep-content') as HTMLElement;

  const runReport = async () => {
    repContent.innerHTML = `<div class="py-10 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Procesando datos de estética...</div>`;
    const start = startInput.value;
    const end = endInput.value;

    try {
      const [stylists, reportData] = await Promise.all([
        (window as any).pb.listAll('third_parties', { filter: 'active=true && type="EMPLEADO"', sort: 'name' }),
        (window as any).pb.listAll('appointments', {
          filter: `start_time >= "${start} 00:00" && start_time <= "${end} 23:59"`,
          expand: 'client_id,stylist_id,service_id'
        }).catch(() => [])
      ]);

      const beautyAppts = reportData.filter((a: any) => !a.pet_id);

      if (beautyAppts.length === 0) {
        repContent.innerHTML = `<div class="p-8 text-center bg-white rounded-xl border text-gray-500" style="border-color:#E5E7EB">No hay citas de belleza/estética en el rango seleccionado.</div>`;
        return;
      }

      const statsMap = new Map();
      stylists.forEach((s: any) => {
        statsMap.set(s.id, {
          name: s.name,
          pending: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          totalRevenue: 0
        });
      });

      beautyAppts.forEach((a: any) => {
        const stId = a.stylist_id;
        if (stId && statsMap.has(stId)) {
          const st = statsMap.get(stId);
          st[a.status] = (st[a.status] || 0) + 1;
          if (a.status === 'completed') {
            st.totalRevenue += getServicePriceDisplay(a.expand?.service_id);
          }
        }
      });

      repContent.innerHTML = `
        <div class="bg-white p-5 rounded-2xl border" style="border-color:#E5E7EB">
          <h4 class="font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-sparkles text-purple-600"></i> Rendimiento por Cosmetóloga / Especialista
          </h4>
          <div class="overflow-x-auto">
            <table class="data-table w-full text-xs">
              <thead>
                <tr style="background:#F9FAFB">
                  <th>Especialista</th>
                  <th class="text-center">Programadas</th>
                  <th class="text-center">En Proceso</th>
                  <th class="text-center">Terminadas</th>
                  <th class="text-center">Canceladas</th>
                  <th class="text-right">Recaudo Estimado</th>
                </tr>
              </thead>
              <tbody>
                ${Array.from(statsMap.values()).map(st => `
                  <tr>
                    <td class="font-bold text-gray-800">${(window as any).esc(st.name)}</td>
                    <td class="text-center">${st.pending}</td>
                    <td class="text-center">${st.in_progress}</td>
                    <td class="text-center text-green-700 font-bold">${st.completed}</td>
                    <td class="text-center text-red-600">${st.cancelled}</td>
                    <td class="text-right font-extrabold text-purple-700">${(window as any).fmt(st.totalRevenue)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err: any) {
      repContent.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
    }
  };

  filterBtn.addEventListener('click', runReport);
  runReport();
}

// ── VISTA 4: CONFIGURACIÓN PORTAL CITAS Y SERVICIOS ONLINE ─────────────────────

/** Selector modal de productos existentes en el inventario para el portal del Spa */
async function openInventoryPickerModal(currentServices: any[], onAdd: (selected: any[]) => void) {
  const currentIds = new Set(currentServices.map(s => s.id));

  const modalHtml = `
    <div class="space-y-4 text-xs" style="color:#374151">
      <div class="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 text-purple-950 flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <i class="fas fa-boxes-stacked text-sm"></i>
        </div>
        <div>
          <span class="font-bold text-sm block text-purple-900">Seleccionar del Inventario Existente</span>
          <span class="text-xs text-gray-600">
            No tienes que volver a crear productos. Selecciona los ítems que ya tienes en tu inventario para ofrecerlos en el portal web de citas online.
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          <input id="inv-picker-search" type="text" class="form-input text-xs pl-8 pr-3 py-1.5 w-full" placeholder="Buscar por código, nombre o categoría en inventario...">
        </div>
        <div class="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl" id="inv-filter-type-group">
          <button type="button" class="inv-type-pill px-2.5 py-1 rounded-lg text-xs font-bold transition bg-white text-purple-700 shadow-sm" data-type="ALL">Todos</button>
          <button type="button" class="inv-type-pill px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition" data-type="SERVICIO">Servicios</button>
          <button type="button" class="inv-type-pill px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 transition" data-type="PRODUCTO">Productos</button>
        </div>
        <div class="text-xs text-purple-800 font-bold px-3 py-1.5 rounded-lg bg-purple-100" id="inv-picker-count">
          0 seleccionados
        </div>
      </div>

      <div class="border rounded-xl max-h-[360px] overflow-y-auto" style="border-color:#E5E7EB">
        <table class="data-table w-full text-xs">
          <thead class="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th class="w-10 text-center">
                <input type="checkbox" id="inv-picker-check-all" class="w-4 h-4 text-purple-600 rounded cursor-pointer" title="Marcar todos los visibles">
              </th>
              <th class="w-24">Código</th>
              <th>Producto / Tratamiento</th>
              <th class="w-24">Tipo</th>
              <th class="w-28 text-right">Precio Base</th>
              <th class="w-28 text-right">Total IVA</th>
            </tr>
          </thead>
          <tbody id="inv-picker-tbody">
            <tr>
              <td colspan="6" class="text-center py-8 text-gray-400">
                <i class="fas fa-spinner fa-spin mr-1"></i> Consultando catálogo de inventario...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary btn-sm" id="btn-confirm-inv-picker" style="background:#8B5CF6; border-color:#8B5CF6" disabled>
      <i class="fas fa-plus mr-1"></i> Incorporar Seleccionados al Catálogo
    </button>
  `;

  (window as any).openModal('Seleccionar Productos del Inventario', modalHtml, footer, true);

  const tbody = document.getElementById('inv-picker-tbody') as HTMLElement;
  const countLabel = document.getElementById('inv-picker-count') as HTMLElement;
  const confirmBtn = document.getElementById('btn-confirm-inv-picker') as HTMLButtonElement;
  const searchIn = document.getElementById('inv-picker-search') as HTMLInputElement;
  const checkAll = document.getElementById('inv-picker-check-all') as HTMLInputElement;

  let allInventoryProds: any[] = [];
  const selectedMap = new Map<string, any>();
  let currentTypeFilter = 'ALL';

  const updateModalState = () => {
    const totalSelected = selectedMap.size;
    if (countLabel) countLabel.textContent = `${totalSelected} seleccionado${totalSelected === 1 ? '' : 's'}`;
    if (confirmBtn) {
      confirmBtn.disabled = totalSelected === 0;
      confirmBtn.innerHTML = totalSelected > 0
        ? `<i class="fas fa-plus mr-1"></i> Incorporar ${totalSelected} Seleccionado${totalSelected === 1 ? '' : 's'} al Catálogo`
        : `<i class="fas fa-plus mr-1"></i> Incorporar Seleccionados al Catálogo`;
    }
  };

  const getFilteredItems = () => {
    const q = searchIn ? searchIn.value.trim().toLowerCase() : '';
    return allInventoryProds.filter(p => {
      const type = (p.type || 'PRODUCTO').toUpperCase();
      if (currentTypeFilter === 'SERVICIO' && type !== 'SERVICIO') return false;
      if (currentTypeFilter === 'PRODUCTO' && (type === 'SERVICIO')) return false;

      if (!q) return true;
      const name = (p.name || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes(q) || code.includes(q) || cat.includes(q);
    });
  };

  const renderTableRows = () => {
    if (!tbody) return;
    const items = getFilteredItems();
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-400">No se encontraron productos coincidentes en el inventario.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(p => {
      const alreadyIn = currentIds.has(p.id);
      const isChecked = selectedMap.has(p.id);
      return `
        <tr class="inv-picker-row ${alreadyIn ? 'opacity-60 bg-gray-50' : 'hover:bg-purple-50/40 cursor-pointer'} ${isChecked ? 'bg-purple-50/50' : ''}" data-pid="${p.id}">
          <td class="text-center" onclick="event.stopPropagation()">
            ${alreadyIn ? `
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700" title="Ya está en el catálogo del Spa">
                <i class="fas fa-check"></i> En catálogo
              </span>
            ` : `
              <input type="checkbox" class="inv-chk w-4 h-4 text-purple-600 rounded cursor-pointer" data-pid="${p.id}" ${isChecked ? 'checked' : ''}>
            `}
          </td>
          <td class="font-mono font-bold text-gray-700">${(window as any).esc(p.code || '—')}</td>
          <td>
            <div class="font-bold text-gray-900">${(window as any).esc(p.name)}</div>
            <div class="text-[10px] text-gray-400">${(window as any).esc(p.category || 'General')}</div>
          </td>
          <td>
            <span class="badge text-[10px] ${p.type === 'SERVICIO' ? 'badge-blue' : 'badge-gray'}">${(window as any).esc(p.type || 'PRODUCTO')}</span>
          </td>
          <td class="text-right text-gray-600">${(window as any).fmt(p.base_price)}</td>
          <td class="text-right font-bold text-purple-700">${(window as any).fmt(p.total)}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.inv-chk').forEach(el => {
      el.addEventListener('change', (e) => {
        const pid = (e.target as HTMLInputElement).dataset.pid!;
        const prod = allInventoryProds.find(x => x.id === pid);
        if ((e.target as HTMLInputElement).checked) {
          if (prod) selectedMap.set(pid, prod);
        } else {
          selectedMap.delete(pid);
        }
        updateModalState();
      });
    });

    tbody.querySelectorAll('.inv-picker-row').forEach(rowEl => {
      rowEl.addEventListener('click', () => {
        const pid = (rowEl as HTMLElement).dataset.pid;
        if (!pid || currentIds.has(pid)) return;
        const chk = rowEl.querySelector('.inv-chk') as HTMLInputElement;
        if (chk) {
          chk.checked = !chk.checked;
          const prod = allInventoryProds.find(x => x.id === pid);
          if (chk.checked) {
            if (prod) selectedMap.set(pid, prod);
            rowEl.classList.add('bg-purple-50/50');
          } else {
            selectedMap.delete(pid);
            rowEl.classList.remove('bg-purple-50/50');
          }
          updateModalState();
        }
      });
    });
  };

  // Carga con fallback PocketBase SDK directo
  try {
    let list: any[] = [];
    try {
      list = await (window as any).pb.send('/api/gravy/spa-beauty/inventory-products', { method: 'GET' });
    } catch (_) {
      // Fallback directo a la colección products
      const prods = await (window as any).pb.listAll('products', { filter: 'active = true', sort: 'name' });
      list = (prods || []).map((p: any) => {
        const bp = p.base_price || 0;
        const ir = p.iva_rate !== undefined ? p.iva_rate : 19;
        return {
          id: p.id,
          code: p.code || '',
          name: p.name || '',
          description: p.description || '',
          type: p.type || 'PRODUCTO',
          category: p.categoria || p.category || 'General',
          base_price: bp,
          iva_rate: ir,
          total: Math.round(bp * (1 + ir / 100))
        };
      });
    }
    allInventoryProds = list;
    renderTableRows();
  } catch (err: any) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500">Error cargando inventario: ${(window as any).esc(err.message || err)}</td></tr>`;
  }

  // Buscador reactivo
  if (searchIn) {
    searchIn.addEventListener('input', () => {
      renderTableRows();
    });
  }

  // Filtro por tipo (Pills)
  const typePills = document.querySelectorAll('.inv-type-pill') as NodeListOf<HTMLButtonElement>;
  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => {
        p.classList.remove('bg-white', 'text-purple-700', 'shadow-sm', 'font-bold');
        p.classList.add('text-gray-600', 'font-medium');
      });
      pill.classList.add('bg-white', 'text-purple-700', 'shadow-sm', 'font-bold');
      pill.classList.remove('text-gray-600', 'font-medium');
      currentTypeFilter = pill.dataset.type || 'ALL';
      renderTableRows();
    });
  });

  // Marcar todos los visibles
  if (checkAll) {
    checkAll.addEventListener('change', () => {
      const isAll = checkAll.checked;
      const visibleItems = getFilteredItems();
      visibleItems.forEach(p => {
        if (!currentIds.has(p.id)) {
          if (isAll) selectedMap.set(p.id, p);
          else selectedMap.delete(p.id);
        }
      });
      const visibleChks = tbody.querySelectorAll('.inv-chk') as NodeListOf<HTMLInputElement>;
      visibleChks.forEach(chk => {
        chk.checked = isAll;
        const row = chk.closest('tr');
        if (row) row.classList.toggle('bg-purple-50/50', isAll);
      });
      updateModalState();
    });
  }

  // Confirmar selección
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const selected = Array.from(selectedMap.values());
      (window as any).closeModal();
      onAdd(selected);
    });
  }
}

/** Modal ágil opcional para crear un servicio desde cero si no existe en inventario */
function openNewBeautyServiceModal(onSaved: () => void) {
  const formHtml = `
    <div class="space-y-4 text-xs" style="color:#374151">
      <div class="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 flex items-start gap-2">
        <i class="fas fa-magic text-purple-600 mt-0.5"></i>
        <div>
          <span class="font-bold">Creación Directa de Servicio Estético:</span>
          Se creará en el catálogo contable de productos como SERVICIO y quedará configurado inmediatamente para reservas online.
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Nombre del Tratamiento / Servicio <span style="color:#EF4444">*</span></label>
          <input id="qsvc-name" class="form-input text-xs" placeholder="Ej: Limpieza Facial Profunda con Hidratación" required>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Código (Opcional)</label>
          <input id="qsvc-code" class="form-input text-xs" placeholder="Ej: SPA-FACIAL-01 (Dejar vacío para autogenerar)">
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Categoría / Etiqueta Web</label>
          <select id="qsvc-category" class="form-input text-xs">
            <option value="Facial" selected>Facial</option>
            <option value="Corporal">Corporal</option>
            <option value="Masajes">Masajes & Relajación</option>
            <option value="Pestañas & Cejas">Pestañas & Cejas</option>
            <option value="Manicura & Pedicura">Manicura & Pedicura</option>
            <option value="Depilación">Depilación</option>
            <option value="Estética">Estética General</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Precio Base COP ($) <span style="color:#EF4444">*</span></label>
          <input id="qsvc-price" type="number" min="0" step="1000" class="form-input text-xs" placeholder="Ej: 80000" required>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Tarifa IVA (%)</label>
          <select id="qsvc-iva" class="form-input text-xs">
            <option value="0">0% (Exento / Excluido)</option>
            <option value="5">5%</option>
            <option value="19" selected>19% (Tarifa General)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Duración Estimada Cita</label>
          <select id="qsvc-duration" class="form-input text-xs">
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60" selected>60 minutos (1 hora)</option>
            <option value="75">75 minutos</option>
            <option value="90">90 minutos (1.5 horas)</option>
            <option value="120">120 minutos (2 horas)</option>
          </select>
        </div>

        <div class="form-group flex items-center pt-5">
          <label class="flex items-center gap-2 cursor-pointer font-bold select-none text-purple-900">
            <input id="qsvc-publish" type="checkbox" class="w-4 h-4 text-purple-600 rounded" checked>
            <span>Publicar en Portal Online</span>
          </label>
        </div>

        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Descripción Comercial para el Portal</label>
          <textarea id="qsvc-desc" rows="2" class="form-input text-xs" placeholder="Ej: Tratamiento exfoliante para eliminar impurezas, puntos negros y recuperar la luminosidad cutánea."></textarea>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary btn-sm" id="btn-save-quick-svc" style="background:#8B5CF6; border-color:#8B5CF6">
      <i class="fas fa-check mr-1"></i> Crear y Guardar Servicio
    </button>
  `;

  (window as any).openModal('Nuevo Servicio de Estética', formHtml, footer, false);

  document.getElementById('btn-save-quick-svc')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-quick-svc') as HTMLButtonElement;
    const name = (document.getElementById('qsvc-name') as HTMLInputElement).value.trim();
    const code = (document.getElementById('qsvc-code') as HTMLInputElement).value.trim();
    const category = (document.getElementById('qsvc-category') as HTMLSelectElement).value;
    const basePrice = parseFloat((document.getElementById('qsvc-price') as HTMLInputElement).value) || 0;
    const ivaRate = parseFloat((document.getElementById('qsvc-iva') as HTMLSelectElement).value) || 0;
    const duration = parseInt((document.getElementById('qsvc-duration') as HTMLSelectElement).value, 10) || 60;
    const published = (document.getElementById('qsvc-publish') as HTMLInputElement).checked;
    const description = (document.getElementById('qsvc-desc') as HTMLTextAreaElement).value.trim();

    if (!name) {
      (window as any).showToast('El nombre del servicio es obligatorio.', 'warning');
      return;
    }
    if (basePrice <= 0) {
      (window as any).showToast('Por favor ingresa un precio base válido.', 'warning');
      return;
    }

    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...`; }

    try {
      await (window as any).pb.send('/api/gravy/spa-beauty/quick-service', {
        method: 'POST',
        body: JSON.stringify({
          name,
          code,
          category,
          base_price: basePrice,
          iva_rate: ivaRate,
          duration,
          published,
          description
        })
      });

      (window as any).showToast(`Servicio "${name}" creado exitosamente.`, 'success');
      (window as any).closeModal();
      onSaved();
    } catch (err: any) {
      (window as any).showToast('Error al crear servicio: ' + (err.message || err), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-check mr-1"></i> Crear y Guardar Servicio`; }
    }
  });
}

/** Render principal de la pestaña de configuración del Spa y catálogo online */
async function renderBeautyConfig(container: HTMLElement) {
  container.innerHTML = `
    <div class="py-16 text-center text-gray-500">
      <i class="fas fa-spinner fa-spin text-3xl text-purple-600 mb-3 block"></i>
      <p class="font-medium text-sm">Cargando configuración del portal y catálogo de servicios...</p>
    </div>
  `;

  try {
    let cfg: any = {};
    let currentServicesList: any[] = [];
    try {
      const res: any = await (window as any).pb.send('/api/gravy/spa-beauty/settings', { method: 'GET' });
      cfg = res.config || {};
      currentServicesList = res.all_services || [];
    } catch (_) {
      // Fallback directo a PocketBase Collections si el endpoint Goja no ha sido reiniciado
      try {
        const sets = await (window as any).pb.listAll('settings', { filter: 'key = "spa_beauty_config_v1"' });
        if (sets && sets.length > 0 && sets[0].value) {
          cfg = typeof sets[0].value === 'string' ? JSON.parse(sets[0].value) : sets[0].value;
        }
      } catch (e) {
        cfg = {};
      }
      if (!cfg) cfg = {};
      const svcMap = cfg.services || {};
      const svcIds = Object.keys(svcMap);
      const loadedMap = new Map();

      if (svcIds.length > 0) {
        try {
          const filterStr = svcIds.map((id: string) => `id = "${id}"`).join(' || ');
          const prods = await (window as any).pb.listAll('products', { filter: filterStr });
          (prods || []).forEach((p: any) => {
            const bp = p.base_price || 0;
            const ir = p.iva_rate !== undefined ? p.iva_rate : 19;
            loadedMap.set(p.id, {
              id: p.id,
              code: p.code || '',
              name: p.name || '',
              description: p.description || '',
              type: p.type || 'PRODUCTO',
              category: p.categoria || p.category || 'General',
              base_price: bp,
              iva_rate: ir,
              total: Math.round(bp * (1 + ir / 100))
            });
          });
        } catch (_) {}
      }

      // Si aún no hay configurados, precargar servicios o SPA por defecto
      if (loadedMap.size === 0) {
        try {
          const defaultProds = await (window as any).pb.listAll('products', { filter: 'active = true && (type = "SERVICIO" || code ~ "SPA")', sort: 'name' });
          (defaultProds || []).forEach((p: any) => {
            const bp = p.base_price || 0;
            const ir = p.iva_rate !== undefined ? p.iva_rate : 19;
            loadedMap.set(p.id, {
              id: p.id,
              code: p.code || '',
              name: p.name || '',
              description: p.description || '',
              type: p.type || 'SERVICIO',
              category: p.categoria || p.category || 'General',
              base_price: bp,
              iva_rate: ir,
              total: Math.round(bp * (1 + ir / 100))
            });
          });
        } catch (_) {}
      }

      currentServicesList = Array.from(loadedMap.values());
    }

    const svcSettings: Record<string, any> = cfg.services || {};

    const spaName = cfg.spa_name || '';
    const whatsapp = cfg.whatsapp || '';
    const welcomeMsg = cfg.welcome_msg || '';
    const startHour = cfg.start_hour !== undefined ? parseInt(cfg.start_hour, 10) : 8;
    const endHour = cfg.end_hour !== undefined ? parseInt(cfg.end_hour, 10) : 19;
    const slotInterval = cfg.slot_interval !== undefined ? parseInt(cfg.slot_interval, 10) : 60;

    const renderMainLayout = () => {
      const countPublished = currentServicesList.filter(s => {
        if (svcSettings[s.id]) return svcSettings[s.id].published === true;
        const code = (s.code || '').toUpperCase();
        const cat = (s.category || '').toLowerCase();
        const name = (s.name || '').toLowerCase();
        return code.startsWith('SPA') || cat.includes('spa') || cat.includes('facial') || cat.includes('estetica') || name.includes('facial') || name.includes('masaje');
      }).length;

      container.innerHTML = `
        <!-- Cabecera Superior con Enlaces de Acción -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-800 text-white shadow-lg mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <i class="fas fa-globe"></i> Página Web Pública & Agendamiento Online
            </div>
            <h4 class="text-xl font-black text-white">Configuración del Portal y Catálogo de Servicios</h4>
            <p class="text-xs text-purple-100 mt-1 max-w-xl">
              Selecciona directamente del inventario los productos que deseas ofrecer, configura duraciones, horarios y WhatsApp de atención.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <a href="/citas.html" target="_blank" class="px-4 py-2 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 transition shadow flex items-center gap-2">
              <i class="fas fa-external-link-alt text-purple-600"></i> Abrir Portal en Vivo
            </a>
            <button id="btn-open-inv-picker" class="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition shadow flex items-center gap-2">
              <i class="fas fa-boxes-stacked"></i> Seleccionar del Inventario
            </button>
            <button id="btn-quick-new-svc" class="px-3 py-2 rounded-xl bg-purple-800/60 hover:bg-purple-800 text-purple-200 text-xs transition border border-purple-400/30 flex items-center gap-1.5" title="Crear un servicio nuevo si no existe en inventario">
              <i class="fas fa-plus"></i> Crear Nuevo
            </button>
            <button id="btn-save-beauty-cfg-top" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition shadow flex items-center gap-2">
              <i class="fas fa-floppy-disk"></i> Guardar Todo
            </button>
          </div>
        </div>

        <!-- Formulario 1: Parámetros Generales de la Página -->
        <div class="bg-white rounded-2xl border p-5 mb-6 shadow-sm" style="border-color:#E5E7EB">
          <h5 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-store text-purple-600"></i> Parámetros de la Página Web y Horarios
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label class="font-bold text-gray-700 block mb-1">Nombre Comercial del Spa / Centro Estético</label>
              <input id="cfg-spa-name" class="form-input text-xs w-full" placeholder="Ej: Bella Piel Spa & Belleza" value="${(window as any).esc(spaName)}">
              <span class="text-[11px] text-gray-400 mt-0.5 block">Se mostrará en el encabezado del portal público.</span>
            </div>

            <div>
              <label class="font-bold text-gray-700 block mb-1">WhatsApp de Confirmaciones (con cód. país)</label>
              <input id="cfg-spa-wa" class="form-input text-xs w-full" placeholder="Ej: 573101234567" value="${(window as any).esc(whatsapp)}">
              <span class="text-[11px] text-gray-400 mt-0.5 block">Número donde los clientes recibirán o enviarán su confirmación.</span>
            </div>

            <div>
              <label class="font-bold text-gray-700 block mb-1">Intervalo Base de Turnos</label>
              <select id="cfg-spa-interval" class="form-input text-xs w-full">
                <option value="30" ${slotInterval === 30 ? 'selected' : ''}>Cada 30 minutos</option>
                <option value="45" ${slotInterval === 45 ? 'selected' : ''}>Cada 45 minutos</option>
                <option value="60" ${slotInterval === 60 ? 'selected' : ''}>Cada 60 minutos (Recomendado)</option>
                <option value="90" ${slotInterval === 90 ? 'selected' : ''}>Cada 90 minutos</option>
              </select>
              <span class="text-[11px] text-gray-400 mt-0.5 block">Granularidad de los bloques de horario.</span>
            </div>

            <div>
              <label class="font-bold text-gray-700 block mb-1">Hora de Apertura</label>
              <select id="cfg-spa-start" class="form-input text-xs w-full">
                ${[6,7,8,9,10,11,12].map(h => `<option value="${h}" ${startHour === h ? 'selected' : ''}>${String(h).padStart(2,'0')}:00 ${h < 12 ? 'AM' : 'PM'}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="font-bold text-gray-700 block mb-1">Hora de Cierre</label>
              <select id="cfg-spa-end" class="form-input text-xs w-full">
                ${[16,17,18,19,20,21,22].map(h => `<option value="${h}" ${endHour === h ? 'selected' : ''}>${String(h).padStart(2,'0')}:00 PM</option>`).join('')}
              </select>
            </div>

            <div class="md:col-span-3">
              <label class="font-bold text-gray-700 block mb-1">Mensaje de Bienvenida / Eslogan para Clientes</label>
              <input id="cfg-spa-welcome" class="form-input text-xs w-full" placeholder="Ej: Reserva tu sesión de belleza, relajación o cuidado facial en línea de forma fácil y segura." value="${(window as any).esc(welcomeMsg)}">
            </div>
          </div>
        </div>

        <!-- Sección 2: Servicios y Publicación Online -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm" style="border-color:#E5E7EB">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h5 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-list-check text-purple-600"></i> Catálogo de Servicios y Publicación en Línea
              </h5>
              <p class="text-xs text-gray-500 mt-0.5">
                Servicios seleccionados del inventario. Puedes ajustar su visibilidad web, duración por turno y etiqueta pública.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                <input id="beauty-cfg-search" type="text" class="form-input text-xs pl-8 pr-3 py-1.5 w-56" placeholder="Filtrar por código o nombre...">
              </div>
              <button id="btn-add-from-inv-table" class="btn btn-primary btn-sm text-xs" style="background:#8B5CF6; border-color:#8B5CF6">
                <i class="fas fa-boxes-stacked mr-1"></i> + Seleccionar del Inventario
              </button>
              <button id="btn-toggle-all-svc" class="btn btn-outline btn-sm text-xs">
                <i class="fas fa-check-double mr-1"></i> Marcar Todos
              </button>
              <span class="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800" id="badge-svc-count">
                ${countPublished} de ${currentServicesList.length} publicados
              </span>
            </div>
          </div>

          <div class="overflow-x-auto border rounded-xl" style="border-color:#E5E7EB">
            <table class="data-table w-full text-xs" id="table-beauty-cfg-services">
              <thead>
                <tr style="background:#F9FAFB">
                  <th class="w-16 text-center">¿Publicar?</th>
                  <th class="w-24">Código</th>
                  <th>Producto / Servicio</th>
                  <th class="w-36">Etiqueta Web</th>
                  <th class="w-36">Duración</th>
                  <th class="w-24 text-right">Precio Base</th>
                  <th class="w-24 text-right">Total IVA</th>
                  <th class="min-w-[180px]">Descripción para el Portal</th>
                  <th class="w-12 text-center">Quitar</th>
                </tr>
              </thead>
              <tbody id="beauty-cfg-services-tbody">
                ${renderTableRowsHtml()}
              </tbody>
            </table>
          </div>

          <!-- Barra Inferior de Guardado -->
          <div class="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t" style="border-color:#E5E7EB">
            <div class="text-xs text-gray-500">
              <i class="fas fa-info-circle text-purple-500 mr-1"></i>
              Los cambios guardados se reflejarán instantáneamente en la página de agendamiento <span class="font-mono text-purple-700">/citas.html</span>.
            </div>
            <button id="btn-save-beauty-cfg-bottom" class="btn btn-primary px-6 py-2.5 font-bold shadow-lg" style="background:#8B5CF6; border-color:#8B5CF6">
              <i class="fas fa-floppy-disk mr-2"></i> Guardar Configuración y Servicios
            </button>
          </div>
        </div>
      `;

      attachViewEvents();
    };

    const renderTableRowsHtml = () => {
      if (currentServicesList.length === 0) {
        return `
          <tr>
            <td colspan="9" class="text-center py-10 text-gray-400">
              <i class="fas fa-boxes-stacked text-3xl text-purple-300 mb-2 block"></i>
              <p class="font-bold text-gray-700 text-sm">No has seleccionado productos del inventario para la página web.</p>
              <p class="text-xs text-gray-400 mt-1">Haz clic en el botón de abajo para elegir los tratamientos o productos existentes de tu inventario.</p>
              <button class="btn btn-primary btn-sm mt-4" id="btn-empty-select-inv" style="background:#8B5CF6; border-color:#8B5CF6">
                <i class="fas fa-boxes-stacked mr-1.5"></i> Seleccionar Productos del Inventario
              </button>
            </td>
          </tr>
        `;
      }

      return currentServicesList.map(s => {
        const itemCfg = svcSettings[s.id] || {};
        let isPub = false;
        if (svcSettings[s.id]) {
          isPub = itemCfg.published === true;
        } else {
          const code = (s.code || '').toUpperCase();
          const cat = (s.category || '').toLowerCase();
          const name = (s.name || '').toLowerCase();
          isPub = code.startsWith('SPA') || cat.includes('spa') || cat.includes('facial') || cat.includes('estetica') || name.includes('facial') || name.includes('masaje');
        }

        const badge = itemCfg.badge || s.category || 'Estética';
        const dur = itemCfg.duration || 60;
        const desc = itemCfg.description_override || s.description || '';

        return `
          <tr class="service-cfg-row ${isPub ? 'bg-purple-50/30' : ''}" data-sid="${s.id}" data-name="${(window as any).esc(s.name.toLowerCase())}" data-code="${(window as any).esc(s.code.toLowerCase())}">
            <td class="text-center">
              <input type="checkbox" class="cfg-svc-pub-chk w-4 h-4 text-purple-600 rounded cursor-pointer" data-sid="${s.id}" ${isPub ? 'checked' : ''}>
            </td>
            <td class="font-mono font-bold text-gray-700">${(window as any).esc(s.code || '—')}</td>
            <td>
              <div class="font-bold text-gray-900">${(window as any).esc(s.name)}</div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="badge text-[10px] ${s.type === 'SERVICIO' ? 'badge-blue' : 'badge-gray'}">${(window as any).esc(s.type || 'PRODUCTO')}</span>
                <span class="text-[10px] text-gray-400">${(window as any).esc(s.category || 'General')}</span>
              </div>
            </td>
            <td>
              <input type="text" class="cfg-svc-badge form-input text-xs py-1 px-2 w-full" data-sid="${s.id}" value="${(window as any).esc(badge)}" placeholder="Ej: Facial">
            </td>
            <td>
              <select class="cfg-svc-dur form-input text-xs py-1 px-2 w-full" data-sid="${s.id}">
                <option value="15" ${dur === 15 ? 'selected' : ''}>15 min</option>
                <option value="30" ${dur === 30 ? 'selected' : ''}>30 min</option>
                <option value="45" ${dur === 45 ? 'selected' : ''}>45 min</option>
                <option value="60" ${dur === 60 ? 'selected' : ''}>60 min (1 h)</option>
                <option value="75" ${dur === 75 ? 'selected' : ''}>75 min</option>
                <option value="90" ${dur === 90 ? 'selected' : ''}>90 min (1.5 h)</option>
                <option value="120" ${dur === 120 ? 'selected' : ''}>120 min (2 h)</option>
              </select>
            </td>
            <td class="text-right font-medium text-gray-600">${(window as any).fmt(s.base_price)}</td>
            <td class="text-right font-black text-purple-700">${(window as any).fmt(s.total)}</td>
            <td>
              <input type="text" class="cfg-svc-desc form-input text-xs py-1 px-2 w-full" data-sid="${s.id}" value="${(window as any).esc(desc)}" placeholder="Descripción breve para la web...">
            </td>
            <td class="text-center">
              <button type="button" class="btn-remove-cfg-row text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition" data-sid="${s.id}" title="Quitar este servicio del portal web">
                <i class="fas fa-trash-can text-xs"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    };

    const attachViewEvents = () => {
      // 1. Selector de productos del inventario
      const openInvPicker = () => {
        openInventoryPickerModal(currentServicesList, (selectedItems) => {
          if (!selectedItems || selectedItems.length === 0) return;
          selectedItems.forEach(p => {
            if (!currentServicesList.find(x => x.id === p.id)) {
              currentServicesList.push(p);
              svcSettings[p.id] = {
                published: true,
                duration: 60,
                badge: p.category || 'Estética',
                description_override: p.description || ''
              };
            }
          });
          const tbody = document.getElementById('beauty-cfg-services-tbody');
          if (tbody) {
            tbody.innerHTML = renderTableRowsHtml();
            attachTableEvents();
            updateCountBadge();
          }
          (window as any).showToast(`${selectedItems.length} producto(s) incorporado(s) desde el inventario.`, 'success');
        });
      };

      document.getElementById('btn-open-inv-picker')?.addEventListener('click', openInvPicker);
      document.getElementById('btn-add-from-inv-table')?.addEventListener('click', openInvPicker);
      document.getElementById('btn-empty-select-inv')?.addEventListener('click', openInvPicker);

      // 2. Modal manual (opcional)
      document.getElementById('btn-quick-new-svc')?.addEventListener('click', () => {
        openNewBeautyServiceModal(() => renderBeautyConfig(container));
      });

      // 3. Buscador en tiempo real
      const searchInput = document.getElementById('beauty-cfg-search') as HTMLInputElement;
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.trim().toLowerCase();
          const rows = container.querySelectorAll('.service-cfg-row') as NodeListOf<HTMLTableRowElement>;
          rows.forEach(r => {
            const name = r.dataset.name || '';
            const code = r.dataset.code || '';
            if (!q || name.includes(q) || code.includes(q)) {
              r.style.display = '';
            } else {
              r.style.display = 'none';
            }
          });
        });
      }

      // 4. Botón seleccionar todos
      let allCheckedState = false;
      document.getElementById('btn-toggle-all-svc')?.addEventListener('click', () => {
        allCheckedState = !allCheckedState;
        const chks = container.querySelectorAll('.cfg-svc-pub-chk') as NodeListOf<HTMLInputElement>;
        chks.forEach(chk => {
          chk.checked = allCheckedState;
          const row = chk.closest('tr');
          if (row) {
            row.classList.toggle('bg-purple-50/30', allCheckedState);
          }
        });
        updateCountBadge();
      });

      attachTableEvents();

      // 5. Guardado general
      const handleSave = async () => {
        const btnTop = document.getElementById('btn-save-beauty-cfg-top') as HTMLButtonElement;
        const btnBottom = document.getElementById('btn-save-beauty-cfg-bottom') as HTMLButtonElement;

        const setBusy = (b: boolean) => {
          if (btnTop) { btnTop.disabled = b; btnTop.innerHTML = b ? `<i class="fas fa-spinner fa-spin"></i> Guardando...` : `<i class="fas fa-floppy-disk"></i> Guardar Todo`; }
          if (btnBottom) { btnBottom.disabled = b; btnBottom.innerHTML = b ? `<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...` : `<i class="fas fa-floppy-disk mr-2"></i> Guardar Configuración y Servicios`; }
        };

        setBusy(true);

        try {
          const newSpaName = (document.getElementById('cfg-spa-name') as HTMLInputElement).value.trim();
          const newWa = (document.getElementById('cfg-spa-wa') as HTMLInputElement).value.trim();
          const newInterval = parseInt((document.getElementById('cfg-spa-interval') as HTMLSelectElement).value, 10) || 60;
          const newStart = parseInt((document.getElementById('cfg-spa-start') as HTMLSelectElement).value, 10) || 8;
          const newEnd = parseInt((document.getElementById('cfg-spa-end') as HTMLSelectElement).value, 10) || 19;
          const newWelcome = (document.getElementById('cfg-spa-welcome') as HTMLInputElement).value.trim();

          // Mapear cada servicio activo en la tabla
          const servicesMap: Record<string, any> = {};
          currentServicesList.forEach(s => {
            const chk = container.querySelector(`.cfg-svc-pub-chk[data-sid="${s.id}"]`) as HTMLInputElement;
            const badgeIn = container.querySelector(`.cfg-svc-badge[data-sid="${s.id}"]`) as HTMLInputElement;
            const durIn = container.querySelector(`.cfg-svc-dur[data-sid="${s.id}"]`) as HTMLSelectElement;
            const descIn = container.querySelector(`.cfg-svc-desc[data-sid="${s.id}"]`) as HTMLInputElement;

            servicesMap[s.id] = {
              published: chk ? chk.checked : false,
              badge: badgeIn ? badgeIn.value.trim() : (s.category || 'Estética'),
              duration: durIn ? (parseInt(durIn.value, 10) || 60) : 60,
              description_override: descIn ? descIn.value.trim() : ''
            };
          });

          const updatedConfig = {
            spa_name: newSpaName,
            whatsapp: newWa,
            slot_interval: newInterval,
            start_hour: newStart,
            end_hour: newEnd,
            welcome_msg: newWelcome,
            services: servicesMap
          };

          try {
            await (window as any).pb.send('/api/gravy/spa-beauty/settings', {
              method: 'POST',
              body: JSON.stringify({ config: updatedConfig })
            });
          } catch (_) {
            // Fallback directo a la colección settings
            const sets = await (window as any).pb.listAll('settings', { filter: 'key = "spa_beauty_config_v1"' });
            if (sets && sets.length > 0) {
              await (window as any).pb.update('settings', sets[0].id, {
                value: JSON.stringify(updatedConfig)
              });
            } else {
              await (window as any).pb.create('settings', {
                key: 'spa_beauty_config_v1',
                value: JSON.stringify(updatedConfig)
              });
            }
          }

          (window as any).showToast('Configuración y catálogo de citas online guardados exitosamente.', 'success');
          renderBeautyConfig(container);
        } catch (err: any) {
          (window as any).showToast('Error al guardar configuración: ' + (err.message || err), 'error');
        } finally {
          setBusy(false);
        }
      };

      document.getElementById('btn-save-beauty-cfg-top')?.addEventListener('click', handleSave);
      document.getElementById('btn-save-beauty-cfg-bottom')?.addEventListener('click', handleSave);
    };

    const attachTableEvents = () => {
      // Checkbox individual change
      const chks = container.querySelectorAll('.cfg-svc-pub-chk') as NodeListOf<HTMLInputElement>;
      chks.forEach(chk => {
        chk.addEventListener('change', () => {
          const row = chk.closest('tr');
          if (row) {
            row.classList.toggle('bg-purple-50/30', chk.checked);
          }
          updateCountBadge();
        });
      });

      // Botón quitar servicio
      const removeBtns = container.querySelectorAll('.btn-remove-cfg-row') as NodeListOf<HTMLButtonElement>;
      removeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const sid = btn.dataset.sid;
          if (!sid) return;
          currentServicesList = currentServicesList.filter(x => x.id !== sid);
          delete svcSettings[sid];
          const tbody = document.getElementById('beauty-cfg-services-tbody');
          if (tbody) {
            tbody.innerHTML = renderTableRowsHtml();
            attachTableEvents();
            updateCountBadge();
          }
          (window as any).showToast('Servicio retirado de la lista del portal web.', 'info');
        });
      });

      // Botón empty si aplica
      document.getElementById('btn-empty-select-inv')?.addEventListener('click', () => {
        document.getElementById('btn-open-inv-picker')?.click();
      });
    };

    const updateCountBadge = () => {
      const activeChks = container.querySelectorAll('.cfg-svc-pub-chk:checked').length;
      const badge = document.getElementById('badge-svc-count');
      if (badge) {
        badge.textContent = `${activeChks} de ${currentServicesList.length} publicados`;
      }
    };

    renderMainLayout();

  } catch (err: any) {
    container.innerHTML = `
      <div class="p-8 text-center text-red-500 bg-white rounded-2xl border" style="border-color:#FCA5A5">
        <i class="fas fa-circle-exclamation text-3xl mb-2 block"></i>
        <p class="font-bold text-sm">Error cargando configuración del portal</p>
        <p class="text-xs text-gray-500 mt-1">${(window as any).esc(err.message || err)}</p>
        <button class="btn btn-outline btn-sm mt-4" id="btn-retry-beauty-cfg">Reintentar</button>
      </div>
    `;
    document.getElementById('btn-retry-beauty-cfg')?.addEventListener('click', () => renderBeautyConfig(container));
  }
}

(window as any).renderBeautyConfig = renderBeautyConfig;
(window as any).renderSpaBelleza = renderSpaBelleza;
