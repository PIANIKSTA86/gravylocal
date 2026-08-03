/**
 * GRAVY v2.0 — niif.ts
 * Módulo de Gestión NIIF (IFRS) para Copropiedades y PYMES
 */
'use strict';

interface NIIFSettings {
  id?: string;
  grupo_empresa: string;
  moneda_funcional: string;
  moneda_presentacion: string;
  fecha_transicion?: string;
  fecha_adopcion?: string;
  metodo_depreciacion?: string;
  metodo_inventarios?: string;
  materialidad?: number;
  politicas_aprobadas?: boolean;
}

interface NIIFPolicy {
  id?: string;
  code: string;
  name: string;
  standard?: string;
  objective?: string;
  scope?: string;
  recognition?: string;
  initial_measurement?: string;
  subsequent_measurement?: string;
  derecognition?: string;
  disclosures?: string;
  status: 'borrador' | 'aprobada';
  version?: string;
  date?: string;
  owner?: string;
}

interface NIIFAsset {
  id?: string;
  code: string;
  name: string;
  cost: number;
  useful_life_niif: number;
  useful_life_fiscal: number;
  depreciation_method: 'linea_recta' | 'saldos_decrecientes' | 'unidades_produccion';
  residual_value?: number;
  impairment?: number;
  revaluation?: number;
  location?: string;
  cost_center_id?: string;
  owner_id?: string;
  active?: boolean;
}

interface NIIFLease {
  id?: string;
  contract_number: string;
  description: string;
  lessor_id?: string;
  start_date: string;
  term_months: number;
  monthly_canon: number;
  implicit_interest_rate: number;
  right_of_use_value?: number;
  lease_liability_value?: number;
  amortization_table?: string;
  active?: boolean;
}

// Estado local del módulo
let NIIF_ACTIVE_TAB = 'diagnostico';

// Estado local para paginación y búsqueda del Mapeo NIIF
const MAPEO_STATE = {
  accounts: [] as any[],
  filteredAccounts: [] as any[],
  page: 1,
  perPage: 50,
  search: ''
};

async function renderNIIF(c: HTMLElement, initialTab?: string) {
  if (initialTab) {
    NIIF_ACTIVE_TAB = initialTab;
  }

  // Render loading state
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo NIIF...</div>`;

  // Renderizar la subpestaña seleccionada directamente sobre el contenedor principal `c`
  switch (NIIF_ACTIVE_TAB) {
    case 'diagnostico':
      await renderTabDiagnostico(c);
      break;
    case 'politicas':
      await renderTabPoliticas(c);
      break;
    case 'mapeo':
      await renderTabMapeo(c);
      break;
    case 'activos':
      await renderTabActivos(c);
      break;
    case 'arrendamientos':
      await renderTabArrendamientos(c);
      break;
    case 'impuesto':
      await renderTabImpuestoDiferido(c);
      break;
    case 'notas':
      await renderTabNotas(c);
      break;
    case 'reportes':
      await renderTabReportes(c);
      break;
  }
}

/* ==========================================
   TAB 1: DIAGNÓSTICO Y GRUPO NIIF
   ========================================== */
async function renderTabDiagnostico(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando estado de la base de datos...</div>`;
  
  let settings: NIIFSettings | null = null;
  try {
    const records = await pb.listAll('niif_settings', { limit: 1 });
    if (records.length > 0) {
      settings = records[0] as any;
    }
  } catch (_) {}

  // Ejecutar validaciones automáticas del motor NIIF
  let unmappedAccounts = 0;
  let assetsWithoutUsefulLife = 0;
  let unreviewedNotes = 0;
  let unmeasuredLeases = 0;

  try {
    const [accounts, assets, notes, leases] = await Promise.all([
      pb.listAll('accounts', { filter: 'active=true' }),
      pb.listAll('niif_assets', { filter: 'active=true' }),
      pb.listAll('financial_notes', { filter: 'revisado=false' }),
      pb.listAll('inmo_contracts', { filter: 'active=true && type="RECIBIDO"' })
    ]);

    unmappedAccounts = accounts.filter(a => !a.niif_classification || !a.niif_statement).length;
    assetsWithoutUsefulLife = assets.filter(a => !a.useful_life_niif || !a.useful_life_fiscal).length;
    unreviewedNotes = notes.length;
    unmeasuredLeases = leases.filter(l => !l.right_of_use_value).length;
  } catch (err) {
    console.warn('[NIIF Diagnostic] Error running diagnostics:', err);
  }

  const hasIssues = (unmappedAccounts + assetsWithoutUsefulLife + unreviewedNotes + unmeasuredLeases) > 0;

  c.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Panel de Clasificación de Grupo -->
      <div class="lg:col-span-2 bg-white rounded-2xl border p-6 space-y-6" style="border-color:#F0F0F0">
        <div>
          <h4 class="text-base font-bold mb-1" style="color:#0D2137"><i class="fas fa-circle-nodes text-indigo-500 mr-1.5"></i>Clasificación de Grupo de Adopción</h4>
          <p class="text-xs text-gray-500">Determine el marco técnico normativo de acuerdo con el Decreto 2420 de 2015 de Colombia.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl" style="background:#F8F9FC; border: 1px solid #EEF0F5">
          <div class="form-group">
            <label class="form-label text-xs">Grupo Asignado Actualmente</label>
            <div class="font-bold text-indigo-900 text-lg">${settings?.grupo_empresa || 'NO PARAMETRIZADO'}</div>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Moneda Funcional</label>
            <div class="font-bold text-gray-800 text-sm">${settings?.moneda_funcional || 'COP (Pesos Colombianos)'}</div>
          </div>
        </div>

        <div class="border-t pt-4 space-y-4">
          <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Asistente de Clasificación NIIF</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Número de empleados</label>
              <input id="diag-emp" type="number" class="form-input" placeholder="Ej: 15" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Activos Totales (en SMMLV)</label>
              <input id="diag-act" type="number" class="form-input" placeholder="Ej: 500" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Ingresos Anuales (en SMMLV)</label>
              <input id="diag-ing" type="number" class="form-input" placeholder="Ej: 300" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">¿Es Entidad sin Ánimo de Lucro / PH?</label>
              <select id="diag-esal" class="form-input">
                <option value="1">Sí (Propiedad Horizontal / ESAL)</option>
                <option value="0">No (Comercial / S.A.S. / Persona Natural)</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-outline btn-sm" id="btn-diag-calc"><i class="fas fa-wand-magic-sparkles mr-1.5"></i>Calcular Grupo Sugerido</button>
            <button class="btn btn-primary btn-sm" id="btn-diag-save-settings"><i class="fas fa-floppy-disk mr-1.5"></i>Guardar Parámetros</button>
          </div>
        </div>
      </div>

      <!-- Panel del Motor de Validaciones Automático -->
      <div class="bg-white rounded-2xl border p-6 flex flex-col justify-between" style="border-color:#F0F0F0">
        <div class="space-y-4">
          <div>
            <h4 class="text-base font-bold mb-1" style="color:#0D2137"><i class="fas fa-shield-halved text-emerald-500 mr-1.5"></i>Motor de Validaciones NIIF</h4>
            <p class="text-xs text-gray-500">Alertas automáticas previas al cierre contable contable de NIIF.</p>
          </div>

          <div class="space-y-3">
            ${renderDiagnosticRow('Cuentas sin clasificación NIIF', unmappedAccounts, 'mapeo', 'fa-route', 'text-amber-500')}
            ${renderDiagnosticRow('Activos sin depreciación dual parametrizada', assetsWithoutUsefulLife, 'activos', 'fa-building', 'text-indigo-500')}
            ${renderDiagnosticRow('Arrendamientos sin medición NIIF 16', unmeasuredLeases, 'arrendamientos', 'fa-file-signature', 'text-rose-500')}
            ${renderDiagnosticRow('Notas/revelaciones pendientes de revisar', unreviewedNotes, 'notas', 'fa-note-sticky', 'text-sky-500')}
          </div>
        </div>

        <div class="border-t pt-4 mt-6">
          <div class="p-3 rounded-xl flex items-center gap-3" style="background:${hasIssues ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)'}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background:${hasIssues ? '#F59E0B' : '#10B981'}; color:#fff">
              <i class="fas ${hasIssues ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-gray-900">${hasIssues ? 'Requiere Atención' : 'Cumplimiento Completo'}</div>
              <div class="text-xxs text-gray-500">${hasIssues ? 'Resuelva las alertas antes de generar los reportes.' : 'La configuración NIIF está al día.'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Evento calcular grupo sugerido
  $('#btn-diag-calc')?.addEventListener('click', () => {
    const emp = Number(($('#diag-emp') as HTMLInputElement)?.value || 0);
    const act = Number(($('#diag-act') as HTMLInputElement)?.value || 0);
    const ing = Number(($('#diag-ing') as HTMLInputElement)?.value || 0);
    const esal = ($('#diag-esal') as HTMLSelectElement)?.value === '1';

    let sugerido = 'Grupo 3 (Microempresas)';
    if (esal) {
      sugerido = 'Grupo 2 (NIIF para PYMES)'; // Propiedad Horizontal colombiana típicamente pertenece al Grupo 2
    } else {
      if (act > 30000 || ing > 6000 || emp > 200) {
        sugerido = 'Grupo 1 (NIIF Plenas)';
      } else if (act > 500 || ing > 6000 || emp > 10) {
        sugerido = 'Grupo 2 (NIIF para PYMES)';
      }
    }

    confirmDialog('Grupo NIIF Sugerido', `De acuerdo con las variables ingresadas, su copropiedad/empresa se clasifica en el <strong>${sugerido}</strong>.<br><br>¿Desea establecer este grupo como el oficial en la configuración de GRAVY?`, () => {
      const activeGroupEl = $('#diag-group-input') || { value: sugerido }; // dummy fallback
      showToast('Grupo sugerido calculado. Haga clic en Guardar para confirmar.', 'success');
      localStorage.setItem('gravy_niif_sug_group', sugerido);
      loadActiveTab(); // recargar
    });
  });

  // Guardar configuración general
  $('#btn-diag-save-settings')?.addEventListener('click', async () => {
    const grupo = localStorage.getItem('gravy_niif_sug_group') || settings?.grupo_empresa || 'Grupo 2';
    const data = {
      grupo_empresa: grupo,
      moneda_funcional: 'COP',
      moneda_presentacion: 'COP',
      politicas_aprobadas: true
    };

    try {
      if (settings?.id) {
        await pb.update('niif_settings', settings.id, data);
      } else {
        await pb.create('niif_settings', data);
      }
      showToast('Configuración general NIIF guardada', 'success');
      loadActiveTab();
    } catch (err: any) {
      showToast('Error al guardar configuración: ' + err.message, 'error');
    }
  });
}

function renderDiagnosticRow(title: string, count: number, tabToGo: string, icon: string, iconColor: string) {
  const badgeClass = count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
  return `
    <div class="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition cursor-pointer" onclick="navigateTab('${tabToGo}')" style="border-color:#F3F4F6">
      <div class="flex items-center gap-2.5">
        <i class="fas ${icon} ${iconColor} text-sm"></i>
        <span class="text-xs font-semibold text-gray-700">${title}</span>
      </div>
      <span class="px-2 py-0.5 rounded-full text-xxs font-bold ${badgeClass}">${count}</span>
    </div>
  `;
}

(window as any).navigateTab = (tab: string) => {
  const btn = document.querySelector(`.niif-tab-btn[data-tab="${tab}"]`) as HTMLButtonElement | null;
  if (btn) btn.click();
};

/* ==========================================
   TAB 2: POLÍTICAS CONTABLES NIIF
   ========================================== */
async function renderTabPoliticas(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando políticas contables...</div>`;

  try {
    let rows = await pb.listAll('niif_policies', { sort: 'code' });

    // Si está vacío, sembrar plantillas iniciales por defecto (Grupo 2 PYMES)
    if (rows.length === 0) {
      c.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0">
          <i class="fas fa-seedling text-indigo-500 text-4xl mb-4"></i>
          <h4 class="text-base font-bold mb-2" style="color:#0D2137">No se encontraron políticas contables</h4>
          <p class="text-xs text-gray-500 max-width: 440px; margin: 0 auto 16px">¿Desea sembrar automáticamente las políticas contables estándar adaptadas a la Propiedad Horizontal y PYMES colombianas bajo el Decreto 2420 de 2015?</p>
          <button class="btn btn-primary" id="btn-seed-policies"><i class="fas fa-magic mr-1.5"></i>Crear Políticas Estándar</button>
        </div>
      `;

      $('#btn-seed-policies')?.addEventListener('click', async () => {
        c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando políticas contables estándar...</div>`;
        const templates: NIIFPolicy[] = [
          {
            code: 'POL-01',
            name: 'Efectivo y Equivalentes de Efectivo',
            standard: 'NIIF para PYMES Sección 7 / NIC 7',
            objective: 'Establecer las bases para el reconocimiento y presentación del disponible.',
            scope: 'Aplica a caja general, fondos fijos y cuentas de ahorro o corrientes en bancos.',
            recognition: 'Se reconoce cuando existe disponibilidad inmediata de los recursos.',
            initial_measurement: 'Se medirá al costo de la transacción, el cual equivale a su valor nominal.',
            subsequent_measurement: 'Se presentará al valor nominal. Los rendimientos financieros se reconocen en el estado de resultados.',
            derecognition: 'Se dará de baja cuando se giren los cheques o se debiten las transferencias electrónicas.',
            disclosures: 'Revelar las conciliaciones bancarias, restricciones al efectivo y tasas de interés devengadas.',
            status: 'aprobada',
            version: '1.0',
            date: todayStr()
          },
          {
            code: 'POL-02',
            name: 'Propiedades, Planta y Equipo',
            standard: 'NIIF para PYMES Sección 17 / NIC 16',
            objective: 'Prescribir el tratamiento contable de los activos fijos tangibles.',
            scope: 'Aplica a terrenos, edificaciones, equipos de computación, maquinaria y muebles.',
            recognition: 'Se reconoce si es probable que generen beneficios económicos futuros y su costo sea medible con fiabilidad.',
            initial_measurement: 'Medición al costo de adquisición más gastos directos de instalación y transporte.',
            subsequent_measurement: 'Modelo del costo menos depreciación acumulada y pérdidas por deterioro.',
            derecognition: 'Baja en cuentas por venta, obsolescencia o retiro físico definitivo.',
            disclosures: 'Revelar vidas útiles, métodos de depreciación, depreciación acumulada y conciliación de saldos.',
            status: 'aprobada',
            version: '1.0',
            date: todayStr()
          },
          {
            code: 'POL-03',
            name: 'Arrendamientos y Derechos de Uso',
            standard: 'NIIF para PYMES Sección 20 / NIIF 16',
            objective: 'Establecer los lineamientos para el reconocimiento de contratos de arrendamiento.',
            scope: 'Aplica a contratos sobre bienes inmuebles y equipos bajo control de la entidad.',
            recognition: 'Reconocimiento inicial de un activo por derecho de uso y un pasivo por arrendamiento financiero.',
            initial_measurement: 'Valor presente neto de los cánones de arrendamiento futuros descontados a la tasa implícita.',
            subsequent_measurement: 'Depreciación en línea recta del derecho de uso y amortización a costo amortizado del pasivo.',
            derecognition: 'Terminación anticipada o vencimiento del plazo del contrato de arrendamiento.',
            disclosures: 'Revelar tabla de amortización, tasas aplicadas y canon de arrendamiento total cancelado.',
            status: 'aprobada',
            version: '1.0',
            date: todayStr()
          }
        ];

        try {
          for (const item of templates) {
            await pb.create('niif_policies', item);
          }
          showToast('Políticas estándar creadas correctamente', 'success');
          loadActiveTab();
        } catch (err: any) {
          showToast('Error al crear políticas: ' + err.message, 'error');
          loadActiveTab();
        }
      });
      return;
    }

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-base font-bold" style="color:#0D2137">Manual de Políticas Contables NIIF</h4>
          <p class="text-xs text-gray-500">Consulte y edite el marco de políticas contables adoptado oficialmente por la entidad.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-new-policy"><i class="fas fa-plus mr-1.5"></i>Nueva Política</button>' : ''}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Lista de políticas a la izquierda -->
        <div class="md:col-span-1 space-y-2 border-r pr-4" style="border-color:#EEF0F5" id="policies-list">
          ${rows.map((p, idx) => `
            <div class="p-3 rounded-xl border hover:bg-indigo-50/30 transition cursor-pointer policy-item ${idx === 0 ? 'bg-indigo-50/50 border-indigo-200' : 'border-gray-200'}" data-id="${esc(p.id)}" style="box-shadow: 0 2px 8px rgba(0,0,0,0.01)">
              <div class="text-xxs font-bold text-indigo-600 mb-1">${esc(p.code)}</div>
              <div class="text-xs font-bold text-gray-800">${esc(p.name)}</div>
              <div class="text-xxs text-gray-400 mt-2">${esc(p.standard || '—')}</div>
            </div>
          `).join('')}
        </div>

        <!-- Visor / Editor detallado a la derecha -->
        <div class="md:col-span-3 bg-white rounded-2xl border p-6" style="border-color:#F0F0F0" id="policy-detail-panel">
          <p class="text-xs text-gray-400 text-center py-20">Selecciona una política de la lista para ver sus detalles o editarla.</p>
        </div>
      </div>
    `;

    const loadPolicyDetail = async (id: string) => {
      const panel = document.getElementById('policy-detail-panel');
      if (!panel) return;
      panel.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando detalles de política...</div>`;

      try {
        const p = await pb.get('niif_policies', id);
        const editable = can('canWrite');

        panel.innerHTML = `
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b pb-4" style="border-color:#EEF0F5">
              <div>
                <span class="text-xxs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">${esc(p.code)}</span>
                <h4 class="text-base font-bold text-gray-900 mt-1">${esc(p.name)}</h4>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge ${p.status === 'aprobada' ? 'badge-green' : 'badge-orange'}">${esc(p.status.toUpperCase())}</span>
                ${editable ? `<button class="btn btn-outline btn-sm" onclick="editPolicyForm('${esc(p.id)}')"><i class="fas fa-pen mr-1"></i>Editar</button>` : ''}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div><strong class="text-gray-500">Estándar / Norma:</strong> <span class="text-gray-800 font-semibold">${esc(p.standard || '—')}</span></div>
              <div><strong class="text-gray-500">Fecha de Aprobación:</strong> <span class="text-gray-800 font-semibold">${esc(p.date || '—')}</span></div>
              <div><strong class="text-gray-500">Versión:</strong> <span class="text-gray-800 font-semibold">${esc(p.version || '1.0')}</span></div>
              <div><strong class="text-gray-500">Responsable / Dueño:</strong> <span class="text-gray-800 font-semibold">${esc(p.owner || 'Contador General')}</span></div>
            </div>

            <div class="space-y-3 pt-2 text-xs">
              <div>
                <strong class="text-gray-700 block font-bold mb-1">1. Objetivo</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.objective || 'Sin definir.')}</p>
              </div>
              <div>
                <strong class="text-gray-700 block font-bold mb-1">2. Alcance</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.scope || 'Sin definir.')}</p>
              </div>
              <div>
                <strong class="text-gray-700 block font-bold mb-1">3. Reconocimiento Inicial</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.recognition || 'Sin definir.')}</p>
              </div>
              <div>
                <strong class="text-gray-700 block font-bold mb-1">4. Medición Inicial</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.initial_measurement || 'Sin definir.')}</p>
              </div>
              <div>
                <strong class="text-gray-700 block font-bold mb-1">5. Medición Posterior</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.subsequent_measurement || 'Sin definir.')}</p>
              </div>
              <div>
                <strong class="text-gray-700 block font-bold mb-1">6. Baja en Cuentas</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.derecognition || 'Sin definir.')}</p>
              </div>
              <div>
                <strong class="text-gray-700 block font-bold mb-1">7. Revelaciones</strong>
                <p class="text-gray-600 bg-gray-50 p-2.5 rounded-lg border leading-relaxed">${esc(p.disclosures || 'Sin definir.')}</p>
              </div>
            </div>
          </div>
        `;
      } catch (err: any) {
        panel.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error al cargar detalles: ${esc(err.message)}</div>`;
      }
    };

    // Registrar clics en lista
    c.querySelectorAll('.policy-item').forEach((item: any) => {
      item.addEventListener('click', () => {
        c.querySelectorAll('.policy-item').forEach((b: any) => {
          b.classList.remove('bg-indigo-50/50', 'border-indigo-200');
          b.classList.add('border-gray-200');
        });
        item.classList.remove('border-gray-200');
        item.classList.add('bg-indigo-50/50', 'border-indigo-200');
        loadPolicyDetail(item.dataset.id);
      });
    });

    // Cargar la primera por defecto
    if (rows.length > 0) {
      loadPolicyDetail(rows[0].id);
    }

    $('#btn-new-policy')?.addEventListener('click', () => editPolicyForm());

    (window as any).editPolicyForm = async (id?: string) => {
      let policy: any = null;
      if (id) {
        policy = await pb.get('niif_policies', id);
      }
      
      const title = id ? 'Editar Política Contable' : 'Nueva Política Contable';
      const body = `
        <form class="space-y-4" id="policy-form">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Código <span class="text-red-500">*</span></label>
              <input id="pol-code" class="form-input" placeholder="Ej: POL-04" value="${esc(policy?.code || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Nombre de Política <span class="text-red-500">*</span></label>
              <input id="pol-name" class="form-input" placeholder="Ej: Cartera e Instrumentos" value="${esc(policy?.name || '')}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Norma / Estándar Asociado</label>
              <input id="pol-std" class="form-input" placeholder="Ej: Sección 11 NIIF para PYMES" value="${esc(policy?.standard || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select id="pol-status" class="form-input">
                <option value="borrador" ${policy?.status === 'borrador' ? 'selected' : ''}>Borrador</option>
                <option value="aprobada" ${policy?.status === 'aprobada' ? 'selected' : ''}>Aprobada</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Objetivo</label>
            <textarea id="pol-obj" class="form-input" rows="2">${esc(policy?.objective || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Alcance</label>
            <textarea id="pol-scope" class="form-input" rows="2">${esc(policy?.scope || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Reconocimiento Inicial</label>
            <textarea id="pol-rec" class="form-input" rows="2">${esc(policy?.recognition || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Medición Inicial</label>
            <textarea id="pol-meas-init" class="form-input" rows="2">${esc(policy?.initial_measurement || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Medición Posterior</label>
            <textarea id="pol-meas-post" class="form-input" rows="2">${esc(policy?.subsequent_measurement || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Baja en Cuentas</label>
            <textarea id="pol-derec" class="form-input" rows="2">${esc(policy?.derecognition || '')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Revelaciones</label>
            <textarea id="pol-disc" class="form-input" rows="2">${esc(policy?.disclosures || '')}</textarea>
          </div>
        </form>
      `;

      openModal(title, body, `
        <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="btn-save-policy"><i class="fas fa-floppy-disk mr-1"></i>Guardar</button>
      `);

      $('#btn-save-policy')?.addEventListener('click', async () => {
        const payload = {
          code: getInputVal('pol-code').trim(),
          name: getInputVal('pol-name').trim(),
          standard: getInputVal('pol-std').trim(),
          status: getSelectVal('pol-status'),
          objective: getInputVal('pol-obj').trim(),
          scope: getInputVal('pol-scope').trim(),
          recognition: getInputVal('pol-rec').trim(),
          initial_measurement: getInputVal('pol-meas-init').trim(),
          subsequent_measurement: getInputVal('pol-meas-post').trim(),
          derecognition: getInputVal('pol-derec').trim(),
          disclosures: getInputVal('pol-disc').trim(),
          date: todayStr(),
          version: '1.0'
        };

        if (!payload.code || !payload.name) {
          return showToast('El código y el nombre son campos obligatorios', 'warning');
        }

        try {
          if (id) {
            await pb.update('niif_policies', id, payload);
            showToast('Política contable actualizada', 'success');
          } else {
            await pb.create('niif_policies', payload);
            showToast('Política contable creada', 'success');
          }
          closeModal();
          loadActiveTab();
        } catch (err: any) {
          showToast('Error al guardar política: ' + err.message, 'error');
        }
      });
    };

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

async function renderTabMapeo(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando plan de cuentas y catálogo...</div>`;

  try {
    if (!MAPEO_STATE.accounts.length) {
      MAPEO_STATE.accounts = await pb.listAll('accounts', { sort: 'code' });
    }
    
    MAPEO_STATE.search = '';
    MAPEO_STATE.filteredAccounts = [...MAPEO_STATE.accounts];
    MAPEO_STATE.page = 1;

    const NIIF_CLASSES = [
      'Efectivo y equivalentes de efectivo',
      'Deudores comerciales y otras cuentas por cobrar',
      'Inventarios',
      'Activos biológicos',
      'Propiedades de inversión',
      'Propiedades, planta y equipo',
      'Activos intangibles distintos de la plusvalía',
      'Obligaciones financieras',
      'Cuentas por pagar comerciales y otras cuentas por pagar',
      'Pasivos por impuestos diferidos',
      'Provisiones por beneficios a empleados',
      'Capital social',
      'Reservas y ganancias acumuladas',
      'Ingresos de actividades ordinarias',
      'Costo de ventas',
      'Gastos de administración',
      'Gastos de ventas',
      'Costos financieros',
      'Impuesto sobre la renta'
    ];

    const NIIF_STATEMENTS = [
      { code: 'ESF_corriente', name: 'Estado Situación Financiera - Corriente' },
      { code: 'ESF_no_corriente', name: 'Estado Situación Financiera - No Corriente' },
      { code: 'ER_ingreso', name: 'Estado de Resultados - Ingreso' },
      { code: 'ER_gasto', name: 'Estado de Resultados - Gasto / Costo' },
      { code: 'Patrimonio', name: 'Patrimonio' }
    ];

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-base font-bold" style="color:#0D2137">Homologación y Catálogo NIIF</h4>
          <p class="text-xs text-gray-500">Mapea cada cuenta del PUC colombiano directamente a sus categorías internacionales correspondientes.</p>
        </div>
        <div class="flex items-center gap-3">
          <select id="mapeo-per-page" class="form-input text-xs w-28">
            <option value="50" ${MAPEO_STATE.perPage === 50 ? 'selected' : ''}>50 por pág.</option>
            <option value="100" ${MAPEO_STATE.perPage === 100 ? 'selected' : ''}>100 por pág.</option>
            <option value="200" ${MAPEO_STATE.perPage === 200 ? 'selected' : ''}>200 por pág.</option>
          </select>
          <input id="mapeo-search" class="form-input text-xs w-64" placeholder="Buscar por código o nombre..." value="${esc(MAPEO_STATE.search)}">
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 350px)">
          <table class="data-table" id="mapeo-table">
            <thead>
              <tr>
                <th>Código PUC</th>
                <th>Nombre Cuenta</th>
                <th>Naturaleza</th>
                <th>Clasificación NIIF / Rubro</th>
                <th>Estándar / Sección</th>
                <th>Estado Financiero Destino</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="mapeo-table-body">
            </tbody>
          </table>
        </div>
        
        <div id="mapeo-pagination" class="flex justify-between items-center px-6 py-4 border-t bg-gray-50/50" style="border-color:#F0F0F0">
        </div>
      </div>
    `;

    const tableBody = document.getElementById('mapeo-table-body') as HTMLElement;
    const paginationContainer = document.getElementById('mapeo-pagination') as HTMLElement;

    const renderMapeoTable = () => {
      const totalItems = MAPEO_STATE.filteredAccounts.length;
      const totalPages = Math.ceil(totalItems / MAPEO_STATE.perPage) || 1;
      
      if (MAPEO_STATE.page > totalPages) {
        MAPEO_STATE.page = totalPages;
      }
      
      const startIdx = (MAPEO_STATE.page - 1) * MAPEO_STATE.perPage;
      const endIdx = Math.min(startIdx + MAPEO_STATE.perPage, totalItems);
      const pageSlice = MAPEO_STATE.filteredAccounts.slice(startIdx, endIdx);

      if (pageSlice.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-8 text-gray-500">
              <i class="fas fa-circle-info mr-1.5"></i>No se encontraron cuentas con el filtro ingresado
            </td>
          </tr>
        `;
        paginationContainer.innerHTML = '';
        return;
      }

      tableBody.innerHTML = pageSlice.map(a => {
        const natureBadge = a.nature === 'debit' ? '<span class="badge badge-blue">D</span>' : '<span class="badge badge-orange">C</span>';
        return `
          <tr data-id="${esc(a.id)}" class="hover:bg-gray-50/50">
            <td><strong style="color:#1A4B8C">${esc(a.code)}</strong></td>
            <td><span class="text-xs font-semibold text-gray-800">${esc(a.name)}</span></td>
            <td class="text-center">${natureBadge}</td>
            <td>
              <span class="text-xs text-gray-600 font-medium">${esc(a.niif_classification || '— Sin Clasificar —')}</span>
            </td>
            <td>
              <span class="text-xxs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-semibold">${esc(a.niif_standard || '—')}</span>
            </td>
            <td>
              <span class="text-xs text-indigo-900 font-medium">${esc(NIIF_STATEMENTS.find(s => s.code === a.niif_statement)?.name || '—')}</span>
            </td>
            <td>
              <button class="btn btn-outline btn-sm btn-edit-mapping" data-id="${esc(a.id)}" title="Editar Homologación"><i class="fas fa-pencil"></i></button>
            </td>
          </tr>
        `;
      }).join('');

      paginationContainer.innerHTML = `
        <span class="text-xs text-gray-500">
          Mostrando <strong>${totalItems === 0 ? 0 : startIdx + 1}–${endIdx}</strong> de <strong>${totalItems}</strong> cuentas
        </span>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" id="mapeo-prev" ${MAPEO_STATE.page <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Ant.</button>
          <span class="text-xs font-semibold px-3 flex items-center bg-white border rounded-lg text-gray-700">Pág. ${MAPEO_STATE.page} / ${totalPages}</span>
          <button class="btn btn-outline btn-sm" id="mapeo-next" ${MAPEO_STATE.page >= totalPages ? 'disabled' : ''}>Sig. <i class="fas fa-chevron-right"></i></button>
        </div>
      `;

      document.getElementById('mapeo-prev')?.addEventListener('click', () => {
        MAPEO_STATE.page--;
        renderMapeoTable();
      });
      document.getElementById('mapeo-next')?.addEventListener('click', () => {
        MAPEO_STATE.page++;
        renderMapeoTable();
      });

      tableBody.querySelectorAll('.btn-edit-mapping').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const id = target.dataset.id;
          if (id) {
            (window as any).openMappingModal(id);
          }
        });
      });
    };

    const doFilter = () => {
      const q = ($('#mapeo-search') as HTMLInputElement)?.value.toLowerCase().trim() || '';
      MAPEO_STATE.search = q;
      if (!q) {
        MAPEO_STATE.filteredAccounts = [...MAPEO_STATE.accounts];
      } else {
        MAPEO_STATE.filteredAccounts = MAPEO_STATE.accounts.filter(a => 
          a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
        );
      }
      MAPEO_STATE.page = 1;
      renderMapeoTable();
    };

    $('#mapeo-search')?.addEventListener('input', debounce(doFilter, 200));

    $('#mapeo-per-page')?.addEventListener('change', (e) => {
      const select = e.currentTarget as HTMLSelectElement;
      MAPEO_STATE.perPage = Number(select.value);
      MAPEO_STATE.page = 1;
      renderMapeoTable();
    });

    renderMapeoTable();

    (window as any).openMappingModal = async (id: string) => {
      let a = MAPEO_STATE.accounts.find(x => x.id === id);
      if (!a) {
        a = await pb.get('accounts', id);
      }
      
      const body = `
        <div class="space-y-4">
          <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
            <strong>Cuenta Seleccionada:</strong> <span class="text-indigo-900 font-bold">${esc(a.code)} - ${esc(a.name)}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Clasificación NIIF (Rubro de Presentación)</label>
            <select id="map-class" class="form-input">
              <option value="">-- Sin Definir --</option>
              ${NIIF_CLASSES.map(cls => `<option value="${esc(cls)}" ${a.niif_classification === cls ? 'selected' : ''}>${esc(cls)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estándar Internacional (NIC / NIIF)</label>
            <input id="map-std" class="form-input" placeholder="Ej: NIC 7, NIC 16, NIIF 16" value="${esc(a.niif_standard || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Estado Financiero Destino</label>
            <select id="map-statement" class="form-input">
              <option value="">-- Sin Definir --</option>
              ${NIIF_STATEMENTS.map(st => `<option value="${esc(st.code)}" ${a.niif_statement === st.code ? 'selected' : ''}>${esc(st.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Categoría para Flujo de Efectivo</label>
            <select id="map-cf" class="form-input">
              <option value="">-- No aplica --</option>
              <option value="operacion" ${a.niif_cf_category === 'operacion' ? 'selected' : ''}>Actividades de Operación</option>
              <option value="inversion" ${a.niif_cf_category === 'inversion' ? 'selected' : ''}>Actividades de Inversión</option>
              <option value="financiacion" ${a.niif_cf_category === 'financiacion' ? 'selected' : ''}>Actividades de Financiación</option>
            </select>
          </div>
        </div>
      `;

      openModal('Homologar Cuenta PUC a NIIF', body, `
        <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="btn-save-mapping"><i class="fas fa-check mr-1"></i>Guardar Mapeo</button>
      `);

      $('#btn-save-mapping')?.addEventListener('click', async () => {
        const payload = {
          niif_classification: getSelectVal('map-class'),
          niif_standard: getInputVal('map-std').trim().toUpperCase(),
          niif_statement: getSelectVal('map-statement'),
          niif_cf_category: getSelectVal('map-cf')
        };

        try {
          await pb.update('accounts', id, payload);
          showToast('Mapeo de cuenta guardado correctamente', 'success');
          
          // Update memory cache
          const idx = MAPEO_STATE.accounts.findIndex(x => x.id === id);
          if (idx !== -1) {
            MAPEO_STATE.accounts[idx] = { ...MAPEO_STATE.accounts[idx], ...payload };
          }
          // Filter again to preserve current filter
          const q = MAPEO_STATE.search;
          if (!q) {
            MAPEO_STATE.filteredAccounts = [...MAPEO_STATE.accounts];
          } else {
            MAPEO_STATE.filteredAccounts = MAPEO_STATE.accounts.filter(a => 
              a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
            );
          }
          
          closeModal();
          renderMapeoTable();
        } catch (err: any) {
          showToast('Error al guardar: ' + err.message, 'error');
        }
      });
    };

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

let ACTIVOS_ACTIVE_TAB = 'catalogo';

async function renderTabActivos(c: HTMLElement) {
  switch (ACTIVOS_ACTIVE_TAB) {
    case 'catalogo':
      await renderSubTabCatalogo(c);
      break;
    case 'categorias':
      await renderSubTabCategorias(c);
      break;
    case 'depreciacion':
      await renderSubTabDepreciacion(c);
      break;
    case 'inventario':
      await renderSubTabInventario(c);
      break;
  }
}

async function renderSubTabCatalogo(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando catálogo de activos...</div>`;
  try {
    const [assets, categories, costCenters, users] = await Promise.all([
      pb.listAll('niif_assets', { sort: 'code', expand: 'category_id,cost_center_id,owner_id' }),
      pb.listAll('niif_asset_categories', { filter: 'active=true', sort: 'code' }),
      pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' }),
      pb.listAll('users', { sort: 'name' })
    ]);

    const calculateMonthsElapsed = (startDateStr: string) => {
      if (!startDateStr) return 0;
      const start = new Date(startDateStr);
      const end = new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return Math.max(0, months);
    };

    let totalCost = 0;
    let totalDeprNIIF = 0;
    let totalDeprFiscal = 0;

    assets.forEach(a => {
      if (a.status === 'retired' || a.status === 'sold' || a.status === 'lost') return;
      totalCost += a.cost;
      
      const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
      
      const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
      const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
      totalDeprNIIF += accumNIIF;
      
      const deprFiscalMonthly = a.cost / (a.useful_life_fiscal || 1);
      const accumFiscal = Math.min(a.cost, deprFiscalMonthly * months);
      totalDeprFiscal += accumFiscal;
    });

    const netBookValueNIIF = totalCost - totalDeprNIIF;
    const bookVariance = Math.abs(totalDeprNIIF - totalDeprFiscal);
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    c.innerHTML = `
      <!-- Panel de Indicadores Premium -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card blue flex flex-col justify-between">
          <div>
            <span class="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Costo Histórico PPE</span>
            <h3 class="text-lg font-bold text-gray-900">${formatCOP(totalCost)}</h3>
          </div>
          <span class="text-xxs text-emerald-600 font-semibold mt-2"><i class="fas fa-arrow-trend-up mr-1"></i>Activos capitalizados</span>
        </div>

        <div class="stat-card green flex flex-col justify-between" style="position:relative">
          <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:#10B981"></div>
          <div>
            <span class="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Valor Neto en Libros</span>
            <h3 class="text-lg font-bold text-gray-900">${formatCOP(netBookValueNIIF)}</h3>
          </div>
          <span class="text-xxs text-gray-500 mt-2">NIIF (Costo - Depreciación)</span>
        </div>

        <div class="stat-card orange flex flex-col justify-between">
          <div>
            <span class="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Depreciación Acumulada</span>
            <div class="text-xs font-semibold text-gray-700">NIIF: ${formatCOP(totalDeprNIIF)}</div>
            <div class="text-xs text-gray-500">Fiscal: ${formatCOP(totalDeprFiscal)}</div>
          </div>
          <span class="text-xxs text-gray-400 mt-1">Comparativo dual acumulado</span>
        </div>

        <div class="stat-card red flex flex-col justify-between" style="position:relative">
          <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:#F59E0B"></div>
          <div>
            <span class="text-xxs font-bold text-gray-400 uppercase tracking-wider block mb-1">Diferencia Temporaria</span>
            <h3 class="text-lg font-bold text-amber-700">${formatCOP(bookVariance)}</h3>
          </div>
          <span class="text-xxs text-amber-600 mt-2"><i class="fas fa-circle-info mr-1"></i>Base para Impuesto Diferido</span>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div class="text-xs font-bold text-gray-700"><i class="fas fa-filter text-indigo-500 mr-1.5"></i>Búsqueda y Filtros</div>
          <div class="flex items-center gap-2">
            <button class="btn btn-outline btn-sm" id="btn-export-excel-assets" title="Exportar a Excel"><i class="fas fa-file-excel mr-1.5" style="color:#10B981"></i>Excel</button>
            <button class="btn btn-outline btn-sm" id="btn-export-pdf-assets" title="Exportar a PDF"><i class="fas fa-file-pdf mr-1.5" style="color:#EF4444"></i>PDF</button>
            ${can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-new-asset"><i class="fas fa-plus mr-1.5"></i>Nuevo Activo Fijo</button>' : ''}
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input id="ast-q" class="form-input text-xs" placeholder="Buscar por código, placa, nombre o marca...">
          <select id="ast-filter-cat" class="form-input text-xs">
            <option value="">Todas las Categorías</option>
            ${categories.map(cat => `<option value="${esc(cat.id)}">${esc(cat.code)} - ${esc(cat.name)}</option>`).join('')}
          </select>
          <select id="ast-filter-cc" class="form-input text-xs">
            <option value="">Todos los Centros de Costo</option>
            ${costCenters.map(cc => `<option value="${esc(cc.id)}">${esc(cc.code)} - ${esc(cc.name)}</option>`).join('')}
          </select>
          <select id="ast-filter-status" class="form-input text-xs">
            <option value="">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
            <option value="in_repair">En Reparación</option>
            <option value="retired">Dados de Baja</option>
            <option value="sold">Vendidos</option>
          </select>
        </div>
      </div>

      <!-- Tabla del Catálogo -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 350px)">
          <table class="data-table" id="assets-table">
            <thead>
              <tr>
                <th>Placa / Código</th>
                <th>Activo</th>
                <th>Categoría</th>
                <th>Costo de Adq.</th>
                <th>V. Residual NIIF</th>
                <th>Depr. Acum. NIIF</th>
                <th>V. Neto Libros</th>
                <th>Centro Costo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${assets.length ? assets.map(a => {
                const cat = a.expand?.category_id;
                const cc = a.expand?.cost_center_id;
                
                const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
                const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
                const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
                const netNIIF = a.cost - accumNIIF;

                const statusLabels: Record<string, string> = {
                  active: '<span class="badge badge-green">Activo</span>',
                  suspended: '<span class="badge badge-gray">Suspendido</span>',
                  in_repair: '<span class="badge badge-orange">En Reparación</span>',
                  retired: '<span class="badge badge-red">Retirado</span>',
                  sold: '<span class="badge badge-blue">Vendido</span>',
                  lost: '<span class="badge badge-red">Perdido</span>',
                  obsolete: '<span class="badge badge-gray">Obsoleto</span>'
                };
                const statusHtml = statusLabels[a.status] || `<span class="badge badge-green">${esc(a.status || 'Activo')}</span>`;

                return `
                  <tr class="hover:bg-gray-50/50" data-cat="${esc(a.category_id || '')}" data-cc="${esc(a.cost_center_id || '')}" data-status="${esc(a.status || 'active')}" data-search="${esc(a.code.toLowerCase())} ${esc(a.name.toLowerCase())} ${esc(a.brand?.toLowerCase() || '')}">
                    <td><strong class="text-indigo-900">${esc(a.code)}</strong></td>
                    <td>
                      <div class="text-xs font-bold text-gray-800">${esc(a.name)}</div>
                      ${a.brand ? `<div class="text-xxs text-gray-400">${esc(a.brand)} ${esc(a.model || '')}</div>` : ''}
                    </td>
                    <td><span class="text-xs text-gray-600 font-semibold">${cat ? esc(cat.name) : '—'}</span></td>
                    <td class="font-semibold text-gray-800">${formatCOP(a.cost)}</td>
                    <td>${formatCOP(a.residual_value || 0)}</td>
                    <td class="text-gray-500 font-medium">${formatCOP(accumNIIF)}</td>
                    <td class="font-bold text-indigo-950">${formatCOP(netNIIF)}</td>
                    <td><span class="text-xxs text-gray-500">${cc ? `${esc(cc.code)} - ${esc(cc.name)}` : '—'}</span></td>
                    <td>${statusHtml}</td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-outline btn-xs" onclick="viewAssetDetail('${esc(a.id)}')" title="Ver Hoja de Vida"><i class="fas fa-eye"></i></button>
                        ${can('canWrite') ? `<button class="btn btn-outline btn-xs" onclick="openAssetForm('${esc(a.id)}')" title="Editar Ficha"><i class="fas fa-pencil"></i></button>` : ''}
                        ${can('canDelete') ? `<button class="btn btn-danger btn-xs" onclick="deleteAsset('${esc(a.id)}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="10" class="text-center py-12 text-gray-400"><i class="fas fa-info-circle mr-1.5"></i>No hay activos fijos en el catálogo.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Filtros de tabla
    const filter = () => {
      const q = ($('#ast-q') as HTMLInputElement)?.value.toLowerCase().trim() || '';
      const cat = ($('#ast-filter-cat') as HTMLSelectElement)?.value || '';
      const cc = ($('#ast-filter-cc') as HTMLSelectElement)?.value || '';
      const status = ($('#ast-filter-status') as HTMLSelectElement)?.value || '';

      $$('#assets-table tbody tr').forEach((tr: HTMLElement) => {
        const searchVal = tr.dataset.search || '';
        const trCat = tr.dataset.cat || '';
        const trCc = tr.dataset.cc || '';
        const trStatus = tr.dataset.status || 'active';

        const matchSearch = !q || searchVal.includes(q);
        const matchCat = !cat || trCat === cat;
        const matchCc = !cc || trCc === cc;
        const matchStatus = !status || trStatus === status;

        tr.style.display = (matchSearch && matchCat && matchCc && matchStatus) ? '' : 'none';
      });
    };

    $('#ast-q')?.addEventListener('input', debounce(filter, 200));
    $('#ast-filter-cat')?.addEventListener('change', filter);
    $('#ast-filter-cc')?.addEventListener('change', filter);
    $('#ast-filter-status')?.addEventListener('change', filter);

    $('#btn-new-asset')?.addEventListener('click', () => (window as any).openAssetForm());

    // ── Exportar a Excel ──────────────────────────────────────────────────
    document.getElementById('btn-export-excel-assets')?.addEventListener('click', () => {
      const formatCOPPlain = (n: number) => Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const rows = assets.map(a => {
        const cat = a.expand?.category_id;
        const cc  = a.expand?.cost_center_id;
        const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
        const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
        const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
        const deprFiscalMonthly = a.cost / (a.useful_life_fiscal || 1);
        const accumFiscal = Math.min(a.cost, deprFiscalMonthly * months);
        const netNIIF = a.cost - accumNIIF;
        const statusMap: Record<string, string> = { active: 'Activo', suspended: 'Suspendido', in_repair: 'En Reparación', retired: 'Retirado', sold: 'Vendido', lost: 'Perdido', obsolete: 'Obsoleto' };
        return {
          placa: a.code,
          nombre: a.name,
          marca: a.brand || '',
          modelo: a.model || '',
          serial: a.serial_number || '',
          categoria: cat ? `${cat.code} - ${cat.name}` : '',
          costo: a.cost,
          v_residual_niif: a.residual_value || 0,
          v_util_niif: a.useful_life_niif || 0,
          v_util_fiscal: a.useful_life_fiscal || 0,
          depr_acum_niif: accumNIIF,
          depr_acum_fiscal: accumFiscal,
          v_neto_libros: netNIIF,
          dif_temporaria: Math.abs(accumNIIF - accumFiscal),
          centro_costo: cc ? `${cc.code} - ${cc.name}` : '',
          estado: statusMap[a.status] || a.status || 'Activo',
          ubicacion: a.location || '',
          fecha_compra: a.purchase_date || '',
          fecha_servicio: a.start_service_date || '',
        };
      });
      const headers = [
        { key: 'placa',            label: 'Placa / Código' },
        { key: 'nombre',           label: 'Nombre del Activo' },
        { key: 'marca',            label: 'Marca' },
        { key: 'modelo',           label: 'Modelo' },
        { key: 'serial',           label: 'No. Serial' },
        { key: 'categoria',        label: 'Categoría' },
        { key: 'costo',            label: 'Costo de Adquisición' },
        { key: 'v_residual_niif',  label: 'Valor Residual NIIF' },
        { key: 'v_util_niif',      label: 'Vida Útil NIIF (meses)' },
        { key: 'v_util_fiscal',    label: 'Vida Útil Fiscal (meses)' },
        { key: 'depr_acum_niif',   label: 'Depr. Acum. NIIF' },
        { key: 'depr_acum_fiscal', label: 'Depr. Acum. Fiscal' },
        { key: 'v_neto_libros',    label: 'Valor Neto en Libros' },
        { key: 'dif_temporaria',   label: 'Diferencia Temporaria' },
        { key: 'centro_costo',     label: 'Centro de Costo' },
        { key: 'estado',           label: 'Estado' },
        { key: 'ubicacion',        label: 'Ubicación' },
        { key: 'fecha_compra',     label: 'Fecha de Compra' },
        { key: 'fecha_servicio',   label: 'Fecha Inicio Servicio' },
      ];
      (window as any).exportToExcel(rows, headers, `Listado_Activos_Fijos_${(window as any).todayStr()}`);
    });

    // ── Exportar a PDF ────────────────────────────────────────────────────
    document.getElementById('btn-export-pdf-assets')?.addEventListener('click', async () => {
      try {
        const jsPdfCtor = (window as any).jspdf?.jsPDF ?? (window as any).jsPDF;
        if (typeof jsPdfCtor !== 'function') {
          showToast('No se pudo inicializar el generador PDF. Recarga la página.', 'error');
          return;
        }
        const drawHeader = (window as any).drawPdfHeader;
        const getPdfCtx  = (window as any).getPdfHeaderContext;
        const headerCtx  = typeof getPdfCtx === 'function'
          ? await getPdfCtx()
          : { companyName: '', companyNit: '', companyAddress: '', softwareName: 'GRAVY v2.0', userName: '', generatedAt: new Date().toLocaleString('es-CO') };

        const formatCOPPlain = (n: number) => Number(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
        const header = typeof drawHeader === 'function'
          ? drawHeader(doc, headerCtx, { title: 'Listado de Activos Fijos', subtitles: [`Generado: ${new Date().toLocaleDateString('es-CO')}`] })
          : { startY: 66, marginLeft: 24, marginRight: doc.internal.pageSize.getWidth() - 24 };

        const body = assets.map(a => {
          const cat = a.expand?.category_id;
          const cc  = a.expand?.cost_center_id;
          const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
          const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
          const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
          const netNIIF = a.cost - accumNIIF;
          const statusMap: Record<string, string> = { active: 'Activo', suspended: 'Suspendido', in_repair: 'En Reparación', retired: 'Retirado', sold: 'Vendido', lost: 'Perdido', obsolete: 'Obsoleto' };
          return [
            a.code,
            a.name + (a.brand ? `\n${a.brand} ${a.model || ''}`.trim() : ''),
            cat ? cat.name : '—',
            formatCOPPlain(a.cost),
            formatCOPPlain(a.residual_value || 0),
            `${a.useful_life_niif || 0}m / ${a.useful_life_fiscal || 0}m`,
            formatCOPPlain(accumNIIF),
            formatCOPPlain(netNIIF),
            cc ? cc.name : '—',
            statusMap[a.status] || (a.status || 'Activo'),
          ];
        });

        const totCost    = assets.reduce((s, a) => s + (a.cost || 0), 0);
        const totNIIF    = assets.reduce((a2, a) => {
          const months2 = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
          const monthly2 = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
          return a2 + Math.min(a.cost - (a.residual_value || 0), monthly2 * months2);
        }, 0);
        body.push(['TOTAL', `${assets.length} activos`, '', formatCOPPlain(totCost), '', '', formatCOPPlain(totNIIF), formatCOPPlain(totCost - totNIIF), '', '']);

        doc.autoTable({
          startY: header.startY,
          head: [['Placa', 'Nombre / Marca', 'Categoría', 'Costo Adq.', 'V. Residual', 'V. Útil NIIF/Fiscal', 'Depr. Acum. NIIF', 'V. Neto Libros', 'C. Costo', 'Estado']],
          body,
          theme: 'plain',
          margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
          styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.2, lineWidth: 0, overflow: 'linebreak' },
          headStyles: { fillColor: [230, 230, 242], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.8, lineWidth: { bottom: 0.3 } },
          columnStyles: {
            0: { cellWidth: 52 },
            1: { cellWidth: 110 },
            2: { cellWidth: 70 },
            3: { cellWidth: 72, halign: 'right' },
            4: { cellWidth: 60, halign: 'right' },
            5: { cellWidth: 54, halign: 'center' },
            6: { cellWidth: 72, halign: 'right' },
            7: { cellWidth: 72, halign: 'right' },
            8: { cellWidth: 65 },
            9: { cellWidth: 50, halign: 'center' },
          },
          didParseCell: (data: any) => {
            if (data.section !== 'body') return;
            const isTotal = data.row.index === body.length - 1;
            if (isTotal) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [236, 236, 236];
              data.cell.styles.textColor = [13, 33, 55];
              data.cell.styles.lineWidth = { top: 0.2 };
            }
          },
          didDrawPage: (data: any) => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(140, 140, 140);
            doc.text('Reporte generado por GRAVY — Activos Fijos', 24, pageHeight - 10);
            doc.text(`Página ${data.pageNumber}`, pageWidth - 24, pageHeight - 10, { align: 'right' });
          },
        });

        doc.save(`Listado_Activos_Fijos_${(window as any).todayStr()}.pdf`);
      } catch (err: any) {
        showToast(`Error al generar PDF: ${err.message}`, 'error');
      }
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

async function renderSubTabCategorias(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando categorías contables...</div>`;
  try {
    const categories = await pb.listAll('niif_asset_categories', { sort: 'code' });
    const accounts = await pb.listAll('accounts', { filter: 'active=true', sort: 'code' });
    const acMap = new Map(accounts.map(a => [a.id, a]));

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-sm font-bold text-gray-800">Categorías de Activos Fijos</h4>
          <p class="text-xs text-gray-500">Defina las políticas de depreciación por defecto y el mapeo al Plan de Cuentas PUC para cada categoría.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-new-category"><i class="fas fa-plus mr-1.5"></i>Nueva Categoría</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>V. Útil NIIF / Fiscal</th>
                <th>Método Depr.</th>
                <th>V. Residual</th>
                <th>Cuenta Activo</th>
                <th>Cuenta Depr. Acum.</th>
                <th>Cuenta Gasto Depr.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${categories.length ? categories.map(cat => {
                const actAcc = acMap.get(cat.account_asset_id);
                const depAcc = acMap.get(cat.account_depr_accum_id);
                const expAcc = acMap.get(cat.account_depr_expense_id);
                
                return `
                  <tr class="hover:bg-gray-50/50">
                    <td><strong class="text-indigo-900">${esc(cat.code)}</strong></td>
                    <td><span class="text-xs font-bold text-gray-800">${esc(cat.name)}</span></td>
                    <td>
                      <span class="badge badge-blue">${cat.useful_life_niif_default || '—'} m (NIIF)</span>
                      <span class="badge badge-gray">${cat.useful_life_fiscal_default || '—'} m (Fiscal)</span>
                    </td>
                    <td><span class="text-xs text-gray-500">${cat.depreciation_method_default === 'linea_recta' ? 'Línea Recta' : (cat.depreciation_method_default || '—')}</span></td>
                    <td><span class="text-xs text-gray-600">${cat.residual_value_percent_default || 0}%</span></td>
                    <td><span class="text-xxs text-gray-500 font-mono">${actAcc ? `${actAcc.code} - ${actAcc.name}` : '—'}</span></td>
                    <td><span class="text-xxs text-gray-500 font-mono">${depAcc ? `${depAcc.code} - ${depAcc.name}` : '—'}</span></td>
                    <td><span class="text-xxs text-gray-500 font-mono">${expAcc ? `${expAcc.code} - ${expAcc.name}` : '—'}</span></td>
                    <td>${cat.active !== false ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                    <td>
                      <div class="flex gap-2">
                        ${can('canWrite') ? `<button class="btn btn-outline btn-xs" onclick="openCategoryForm('${esc(cat.id)}')" title="Editar"><i class="fas fa-pencil"></i></button>` : ''}
                        ${can('canDelete') ? `<button class="btn btn-danger btn-xs" onclick="deleteCategory('${esc(cat.id)}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="10" class="text-center py-12 text-gray-400"><i class="fas fa-info-circle mr-1.5"></i>No hay categorías de activos configuradas.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $('#btn-new-category')?.addEventListener('click', () => (window as any).openCategoryForm());

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

(window as any).openCategoryForm = async (id?: string) => {
  let cat: any = null;
  if (id) {
    try {
      cat = await pb.get('niif_asset_categories', id);
    } catch (err: any) {
      return showToast('Error al cargar categoría: ' + err.message, 'error');
    }
  }

  let accounts: any[] = [];
  try {
    accounts = await pb.listAll('accounts', { filter: 'active=true', sort: 'code' });
  } catch (err: any) {
    return showToast('Error al cargar plan de cuentas: ' + err.message, 'error');
  }

  const renderAccSelect = (prefix: string, selectedId?: string) => {
    const filtered = accounts.filter(a => a.code.startsWith(prefix));
    return `
      <option value="">-- Seleccionar Cuenta --</option>
      ${filtered.map(a => `<option value="${esc(a.id)}" ${selectedId === a.id ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
    `;
  };

  const title = id ? 'Editar Categoría de Activos' : 'Nueva Categoría de Activos';
  const body = `
    <form class="space-y-4 text-xs" id="category-form">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Código <span class="text-red-500">*</span></label>
          <input id="cat-code" class="form-input" placeholder="Ej: VEH" value="${esc(cat?.code || '')}" style="text-transform:uppercase" required ${id ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label class="form-label">Nombre <span class="text-red-500">*</span></label>
          <input id="cat-name" class="form-input" placeholder="Ej: VEHÍCULOS" value="${esc(cat?.name || '')}" style="text-transform:uppercase" required>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-group">
          <label class="form-label">Vida Útil NIIF (Meses)</label>
          <input id="cat-life-niif" type="number" class="form-input" placeholder="Ej: 120" value="${cat?.useful_life_niif_default || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Vida Útil Fiscal (Meses)</label>
          <input id="cat-life-fiscal" type="number" class="form-input" placeholder="Ej: 120" value="${cat?.useful_life_fiscal_default || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Método Depreciación</label>
          <select id="cat-method" class="form-input">
            <option value="linea_recta" ${cat?.depreciation_method_default === 'linea_recta' ? 'selected' : ''}>Línea Recta</option>
            <option value="saldos_decrecientes" ${cat?.depreciation_method_default === 'saldos_decrecientes' ? 'selected' : ''}>Saldos Decrecientes</option>
            <option value="unidades_produccion" ${cat?.depreciation_method_default === 'unidades_produccion' ? 'selected' : ''}>Unidades Producción</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Valor Residual Defecto (%)</label>
          <input id="cat-residual" type="number" class="form-input" placeholder="Ej: 10" value="${cat?.residual_value_percent_default || '0'}">
        </div>
      </div>

      <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mt-4">Mapeo Contable PUC (Cuentas)</h5>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Cuenta del Activo (Clase 15)</label>
          <select id="cat-acc-asset" class="form-input">${renderAccSelect('15', cat?.account_asset_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Depr. Acumulada (Clase 159)</label>
          <select id="cat-acc-depr-accum" class="form-input">${renderAccSelect('159', cat?.account_depr_accum_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Gasto Depreciación (Clase 5)</label>
          <select id="cat-acc-depr-exp" class="form-input">${renderAccSelect('5', cat?.account_depr_expense_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Deterioro Acumulado (Clase 159/1)</label>
          <select id="cat-acc-imp-accum" class="form-input">${renderAccSelect('159', cat?.account_impairment_accum_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Gasto Deterioro (Clase 5)</label>
          <select id="cat-acc-imp-exp" class="form-input">${renderAccSelect('5', cat?.account_impairment_expense_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Superávit Revaluación (Clase 3)</label>
          <select id="cat-acc-reval" class="form-input">${renderAccSelect('3', cat?.account_revaluation_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Ganancia en Bajas (Clase 4)</label>
          <select id="cat-acc-gain" class="form-input">${renderAccSelect('4', cat?.account_disposal_gain_id)}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta Pérdida en Bajas (Clase 5)</label>
          <select id="cat-acc-loss" class="form-input">${renderAccSelect('5', cat?.account_disposal_loss_id)}</select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="cat-active" class="form-input">
          <option value="1" ${cat?.active !== false ? 'selected' : ''}>Activo</option>
          <option value="0" ${cat?.active === false ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
    </form>
  `;

  openModal(title, body, `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary btn-sm" id="btn-save-cat"><i class="fas fa-check mr-1.5"></i>Guardar Categoría</button>
  `, true);

  $('#btn-save-cat')?.addEventListener('click', async () => {
    const code = getInputVal('cat-code').toUpperCase().trim();
    const name = getInputVal('cat-name').toUpperCase().trim();
    
    if (!code || !name) {
      return showToast('El código y el nombre son campos obligatorios', 'warning');
    }

    const payload = {
      code,
      name,
      useful_life_niif_default: Number(getInputVal('cat-life-niif')) || null,
      useful_life_fiscal_default: Number(getInputVal('cat-life-fiscal')) || null,
      depreciation_method_default: getSelectVal('cat-method') || null,
      residual_value_percent_default: Number(getInputVal('cat-residual')) || 0,
      account_asset_id: getSelectVal('cat-acc-asset') || null,
      account_depr_accum_id: getSelectVal('cat-acc-depr-accum') || null,
      account_depr_expense_id: getSelectVal('cat-acc-depr-exp') || null,
      account_impairment_accum_id: getSelectVal('cat-acc-imp-accum') || null,
      account_impairment_expense_id: getSelectVal('cat-acc-imp-exp') || null,
      account_revaluation_id: getSelectVal('cat-acc-reval') || null,
      account_disposal_gain_id: getSelectVal('cat-acc-gain') || null,
      account_disposal_loss_id: getSelectVal('cat-acc-loss') || null,
      active: getSelectVal('cat-active') === '1'
    };

    try {
      if (id) {
        await pb.update('niif_asset_categories', id, payload);
        await API.logAudit('UPDATE', 'Asset Category', id, `Modificó categoría de activo: ${code} - ${name}`);
        showToast('Categoría actualizada con éxito', 'success');
      } else {
        const created = await pb.create('niif_asset_categories', payload);
        await API.logAudit('CREATE', 'Asset Category', created.id, `Creó categoría de activo: ${code} - ${name}`);
        showToast('Categoría creada con éxito', 'success');
      }
      closeModal();
      const container = document.getElementById('activos-subtab-content');
      if (container) await renderSubTabCategorias(container);
    } catch (err: any) {
      showToast('Error al guardar categoría: ' + err.message, 'error');
    }
  });
};

(window as any).deleteCategory = async (id: string) => {
  confirmDialog(
    'Eliminar Categoría',
    '¿Estás seguro de que deseas eliminar esta categoría? Si hay activos asociados a ella, esta acción fallará.',
    async () => {
      try {
        const cat = await pb.get('niif_asset_categories', id);
        const assets = await pb.list('niif_assets', { filter: `category_id="${id}"`, perPage: 1 });
        if (assets.items.length > 0) {
          return showToast('No se puede eliminar la categoría porque hay activos fijos asignados a ella.', 'error');
        }
        await pb.delete('niif_asset_categories', id);
        await API.logAudit('DELETE', 'Asset Category', id, `Eliminó categoría de activo: ${cat.code}`);
        showToast('Categoría eliminada con éxito', 'success');
        const container = document.getElementById('activos-subtab-content');
        if (container) await renderSubTabCategorias(container);
      } catch (err: any) {
        showToast('Error al eliminar categoría: ' + err.message, 'error');
      }
    }
  );
};

(window as any).openAssetForm = async (id?: string) => {
  let a: any = null;
  if (id) {
    try {
      a = await pb.get('niif_assets', id);
    } catch (err: any) {
      return showToast('Error al cargar activo: ' + err.message, 'error');
    }
  }

  let categories: any[] = [];
  let costCenters: any[] = [];
  let users: any[] = [];
  let thirdParties: any[] = [];
  let parentAssets: any[] = [];

  try {
    const [cRes, ccRes, uRes, tpRes, paRes] = await Promise.all([
      pb.listAll('niif_asset_categories', { filter: 'active=true', sort: 'code' }),
      pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' }),
      pb.listAll('users', { sort: 'name' }),
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
      pb.listAll('niif_assets', { filter: 'active=true', sort: 'code' })
    ]);
    categories = cRes;
    costCenters = ccRes;
    users = uRes;
    thirdParties = tpRes;
    parentAssets = paRes;
    if (id) {
      parentAssets = parentAssets.filter(pa => pa.id !== id);
    }
  } catch (err: any) {
    return showToast('Error al cargar dependencias: ' + err.message, 'error');
  }

  const title = id ? 'Editar Activo Fijo' : 'Nuevo Activo Fijo';
  const body = `
    <form class="space-y-4 text-xs" id="asset-form">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label">Código / Placa <span class="text-red-500">*</span></label>
          <input id="ast-code" class="form-input" placeholder="Ej: AST-001" value="${esc(a?.code || '')}" style="text-transform:uppercase" required ${id ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label class="form-label">Nombre del Activo <span class="text-red-500">*</span></label>
          <input id="ast-name" class="form-input" placeholder="Ej: Planta Eléctrica Principal" value="${esc(a?.name || '')}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Categoría <span class="text-red-500">*</span></label>
          <select id="ast-cat" class="form-input" required>
            <option value="">-- Seleccionar Categoría --</option>
            ${categories.map(cat => `<option value="${esc(cat.id)}" ${a?.category_id === cat.id ? 'selected' : ''}>${esc(cat.code)} - ${esc(cat.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mt-4">Parámetros Financieros (Depreciación Dual)</h5>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label">Costo de Adquisición ($ COP) <span class="text-red-500">*</span></label>
          <input id="ast-cost" type="number" class="form-input" placeholder="Costo total de compra" value="${a?.cost || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Valor Residual NIIF ($ COP)</label>
          <input id="ast-residual" type="number" class="form-input" placeholder="Valor de salvamento NIIF" value="${a?.residual_value ?? '0'}">
        </div>
        <div class="form-group">
          <label class="form-label">Método Depreciación</label>
          <select id="ast-method" class="form-input">
            <option value="linea_recta" ${a?.depreciation_method === 'linea_recta' ? 'selected' : ''}>Línea Recta</option>
            <option value="saldos_decrecientes" ${a?.depreciation_method === 'saldos_decrecientes' ? 'selected' : ''}>Saldos Decrecientes</option>
            <option value="unidades_produccion" ${a?.depreciation_method === 'unidades_produccion' ? 'selected' : ''}>Unidades Producción</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Vida Útil NIIF (Meses) <span class="text-red-500">*</span></label>
          <input id="ast-life-niif" type="number" class="form-input" placeholder="Vida útil contable en meses" value="${a?.useful_life_niif || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Vida Útil Fiscal (Meses) <span class="text-red-500">*</span></label>
          <input id="ast-life-fiscal" type="number" class="form-input" placeholder="Vida útil tributaria en meses" value="${a?.useful_life_fiscal || ''}" required>
        </div>
      </div>

      <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mt-4">Ubicación y Responsable</h5>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-group">
          <label class="form-label">Centro de Costos</label>
          <select id="ast-cc" class="form-input">
            <option value="">-- Ninguno --</option>
            ${costCenters.map(cc => `<option value="${esc(cc.id)}" ${a?.cost_center_id === cc.id ? 'selected' : ''}>${esc(cc.code)} - ${esc(cc.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Responsable Custodia</label>
          <select id="ast-owner" class="form-input">
            <option value="">-- Seleccionar Colaborador --</option>
            ${users.map(u => `<option value="${esc(u.id)}" ${a?.owner_id === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ubicación Física</label>
          <input id="ast-location" class="form-input" placeholder="Ej: Oficina 302, Sede Norte" value="${esc(a?.location || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Activo Principal (NIIF Componente)</label>
          <select id="ast-parent" class="form-input">
            <option value="">-- Ninguno (Activo Principal) --</option>
            ${parentAssets.map(pa => `<option value="${esc(pa.id)}" ${a?.parent_asset_id === pa.id ? 'selected' : ''}>${esc(pa.code)} - ${esc(pa.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mt-4">Adquisición e Identificación</h5>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-group">
          <label class="form-label">Proveedor</label>
          <select id="ast-provider" class="form-input">
            <option value="">-- Seleccionar Proveedor --</option>
            ${thirdParties.map(tp => `<option value="${esc(tp.id)}" ${a?.provider_id === tp.id ? 'selected' : ''}>${esc(tp.doc_number)} - ${esc(tp.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nro Factura</label>
          <input id="ast-inv-num" class="form-input" placeholder="Ej: FE-1234" value="${esc(a?.invoice_number || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha Compra</label>
          <input id="ast-purchase-date" type="date" class="form-input" value="${a?.purchase_date || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Puesta en Servicio</label>
          <input id="ast-service-date" type="date" class="form-input" value="${a?.start_service_date || ''}">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label">Marca</label>
          <input id="ast-brand" class="form-input" placeholder="Ej: Caterpillar" value="${esc(a?.brand || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Modelo / Serie</label>
          <input id="ast-model" class="form-input" placeholder="Ej: 320D / S-45678" value="${esc(a?.model || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Fotografía del Activo (URL)</label>
          <input id="ast-photo" class="form-input" placeholder="URL de la imagen" value="${esc(a?.photo_url || '')}">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Placa de Identificación / QR</label>
          <input id="ast-qr" class="form-input" placeholder="Código impreso en placa o QR" value="${esc(a?.qr_code || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Estado Físico / Operativo</label>
          <select id="ast-status" class="form-input">
            <option value="active" ${a?.status === 'active' || !a ? 'selected' : ''}>Activo (En Operación)</option>
            <option value="suspended" ${a?.status === 'suspended' ? 'selected' : ''}>Suspendido (Sin depreciar temporalmente)</option>
            <option value="in_repair" ${a?.status === 'in_repair' ? 'selected' : ''}>En Reparación</option>
            <option value="retired" ${a?.status === 'retired' ? 'selected' : ''}>Dado de Baja (Retirado)</option>
            <option value="sold" ${a?.status === 'sold' ? 'selected' : ''}>Vendido</option>
          </select>
        </div>
      </div>
    </form>
  `;

  openModal(title, body, `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary btn-sm" id="btn-save-asset"><i class="fas fa-check mr-1.5"></i>Guardar Activo</button>
  `, true);

  // Escuchar cambios de categoría para auto-completar parámetros
  $('#ast-cat')?.addEventListener('change', () => {
    const catId = getSelectVal('ast-cat');
    if (!catId) return;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    const costVal = Number(getInputVal('ast-cost') || 0);

    const lifeNiifInput = $('#ast-life-niif') as HTMLInputElement | null;
    const lifeFiscalInput = $('#ast-life-fiscal') as HTMLInputElement | null;
    const deprMethodSelect = $('#ast-method') as HTMLSelectElement | null;
    const residualInput = $('#ast-residual') as HTMLInputElement | null;

    if (lifeNiifInput && !lifeNiifInput.value) lifeNiifInput.value = String(cat.useful_life_niif_default || '');
    if (lifeFiscalInput && !lifeFiscalInput.value) lifeFiscalInput.value = String(cat.useful_life_fiscal_default || '');
    if (deprMethodSelect) deprMethodSelect.value = cat.depreciation_method_default || 'linea_recta';
    if (residualInput && (!residualInput.value || residualInput.value === '0')) {
      const factor = (cat.residual_value_percent_default || 0) / 100;
      residualInput.value = String(Math.round(costVal * factor));
    }
  });

  $('#ast-cost')?.addEventListener('input', () => {
    const costVal = Number(getInputVal('ast-cost') || 0);
    const catId = getSelectVal('ast-cat');
    if (!catId) return;
    const cat = categories.find(c => c.id === catId);
    if (!cat || !cat.residual_value_percent_default) return;

    const residualInput = $('#ast-residual') as HTMLInputElement | null;
    if (residualInput) {
      const factor = cat.residual_value_percent_default / 100;
      residualInput.value = String(Math.round(costVal * factor));
    }
  });

  $('#btn-save-asset')?.addEventListener('click', async () => {
    const code = getInputVal('ast-code').toUpperCase().trim();
    const name = getInputVal('ast-name').trim();
    const cost = Number(getInputVal('ast-cost'));
    const category_id = getSelectVal('ast-cat');
    const useful_life_niif = Number(getInputVal('ast-life-niif'));
    const useful_life_fiscal = Number(getInputVal('ast-life-fiscal'));

    if (!code || !name || !cost || !category_id || !useful_life_niif || !useful_life_fiscal) {
      return showToast('Por favor llene todos los campos obligatorios (*)', 'warning');
    }

    const payload = {
      code,
      name,
      cost,
      category_id,
      useful_life_niif,
      useful_life_fiscal,
      residual_value: Number(getInputVal('ast-residual') || 0),
      depreciation_method: getSelectVal('ast-method') || 'linea_recta',
      cost_center_id: getSelectVal('ast-cc') || null,
      owner_id: getSelectVal('ast-owner') || null,
      location: getInputVal('ast-location').trim(),
      parent_asset_id: getSelectVal('ast-parent') || null,
      provider_id: getSelectVal('ast-provider') || null,
      invoice_number: getInputVal('ast-inv-num').trim(),
      invoice_date: getInputVal('ast-purchase-date') || null,
      purchase_date: getInputVal('ast-purchase-date') || null,
      start_service_date: getInputVal('ast-service-date') || null,
      brand: getInputVal('ast-brand').trim(),
      model: getInputVal('ast-model').trim(),
      photo_url: getInputVal('ast-photo').trim(),
      qr_code: getInputVal('ast-qr').trim() || code,
      status: getSelectVal('ast-status') || 'active',
      active: getSelectVal('ast-status') !== 'retired'
    };

    try {
      if (id) {
        await pb.update('niif_assets', id, payload);
        await API.logAudit('UPDATE', 'Asset', id, `Modificó ficha de activo: ${code} - ${name}`);
        showToast('Activo fijo actualizado correctamente', 'success');
      } else {
        const created = await pb.create('niif_assets', payload);
        await API.logAudit('CREATE', 'Asset', created.id, `Creó ficha de activo: ${code} - ${name}`);
        showToast('Activo fijo creado correctamente', 'success');
      }
      closeModal();
      const container = document.getElementById('activos-subtab-content');
      if (container) await renderSubTabCatalogo(container);
    } catch (err: any) {
      showToast('Error al guardar activo: ' + err.message, 'error');
    }
  });
};

(window as any).deleteAsset = async (id: string) => {
  confirmDialog('Eliminar Activo', '¿Estás seguro de que deseas eliminar permanentemente este activo de la base de datos? Esta acción es irreversible.', async () => {
    try {
      const a = await pb.get('niif_assets', id);
      await pb.delete('niif_assets', id);
      await API.logAudit('DELETE', 'Asset', id, `Eliminó activo fijo: ${a.code} - ${a.name}`);
      showToast('Activo fijo eliminado', 'success');
      const container = document.getElementById('activos-subtab-content');
      if (container) await renderSubTabCatalogo(container);
    } catch (err: any) {
      showToast('Error al eliminar activo: ' + err.message, 'error');
    }
  });
};

(window as any).viewAssetDetail = async (id: string) => {
  let a: any = null;
  let cat: any = null;
  let cc: any = null;
  let owner: any = null;
  let events: any[] = [];
  let components: any[] = [];

  try {
    a = await pb.get('niif_assets', id, { expand: 'category_id,cost_center_id,owner_id,provider_id' });
    cat = a.expand?.category_id;
    cc = a.expand?.cost_center_id;
    owner = a.expand?.owner_id;
    
    try {
      events = await pb.listAll('niif_asset_events', {
        filter: `asset_id="${id}"`,
        sort: '-date',
        expand: 'cost_center_from_id,cost_center_to_id,owner_from_id,owner_to_id,transaction_id'
      });
    } catch (_errEv) {
      try {
        events = await pb.listAll('niif_asset_events', {
          filter: `asset_id="${id}"`,
          sort: '-date'
        });
      } catch (_errEv2) {
        events = [];
      }
    }

    components = await pb.listAll('niif_assets', {
      filter: `parent_asset_id="${id}"`,
      sort: 'code'
    });
  } catch (err: any) {
    return showToast('Error al cargar hoja de vida: ' + err.message, 'error');
  }

  const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

  const title = `Hoja de Vida: Placa ${esc(a.qr_code || a.code)}`;

  const buildFinancialTab = () => {
    const calculateMonthsElapsed = (startDateStr: string) => {
      if (!startDateStr) return 0;
      const start = new Date(startDateStr);
      const end = new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return Math.max(0, months);
    };

    const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
    
    const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
    const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
    const netNIIF = a.cost - accumNIIF - (a.impairment || 0);

    const deprFiscalMonthly = a.cost / (a.useful_life_fiscal || 1);
    const accumFiscal = Math.min(a.cost, deprFiscalMonthly * months);
    const netFiscal = a.cost - accumFiscal;

    return `
      <div class="space-y-4 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Datos Generales -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h6 class="font-bold text-gray-700 border-b pb-1.5 mb-2"><i class="fas fa-circle-info mr-1 text-indigo-500"></i>Especificaciones Generales</h6>
            <div class="space-y-1.5">
              <div><strong class="text-gray-500">Nombre:</strong> <span class="text-gray-800 font-semibold">${esc(a.name)}</span></div>
              <div><strong class="text-gray-500">Categoría:</strong> <span class="text-gray-800 font-semibold">${cat ? esc(cat.name) : '—'}</span></div>
              <div><strong class="text-gray-500">Marca/Modelo:</strong> <span class="text-gray-800 font-semibold">${esc(a.brand || '—')} / ${esc(a.model || '—')}</span></div>
              <div><strong class="text-gray-500">Ubicación:</strong> <span class="text-gray-800 font-semibold">${esc(a.location || '—')}</span></div>
              <div><strong class="text-gray-500">Centro de Costo:</strong> <span class="text-gray-800 font-semibold">${cc ? `${esc(cc.code)} - ${esc(cc.name)}` : '—'}</span></div>
              <div><strong class="text-gray-500">Responsable Custodia:</strong> <span class="text-gray-800 font-semibold">${owner ? esc(owner.name) : '—'}</span></div>
              <div><strong class="text-gray-500">Proveedor:</strong> <span class="text-gray-800 font-semibold">${a.expand?.provider_id ? esc(a.expand.provider_id.name) : '—'}</span></div>
              <div><strong class="text-gray-500">Factura Compra:</strong> <span class="text-gray-800 font-semibold">${esc(a.invoice_number || '—')} (${esc(a.purchase_date || '—')})</span></div>
            </div>
          </div>

          <!-- Datos Financieros Dual -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h6 class="font-bold text-gray-700 border-b pb-1.5 mb-2"><i class="fas fa-calculator mr-1 text-emerald-500"></i>Cálculos de Depreciación Dual</h6>
            <table class="w-full text-xxs leading-relaxed">
              <thead>
                <tr class="border-b text-gray-500 text-left">
                  <th class="pb-1">Concepto</th>
                  <th class="pb-1 text-right">Libro NIIF</th>
                  <th class="pb-1 text-right">Libro Fiscal</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b"><td class="py-1">Costo Original</td><td class="text-right font-semibold">${formatCOP(a.cost)}</td><td class="text-right text-gray-600">${formatCOP(a.cost)}</td></tr>
                <tr class="border-b"><td class="py-1">Valor Residual</td><td class="text-right font-semibold">${formatCOP(a.residual_value || 0)}</td><td class="text-right text-gray-400">$ 0</td></tr>
                <tr class="border-b"><td class="py-1">Vida Útil</td><td class="text-right font-semibold">${a.useful_life_niif} m</td><td class="text-right text-gray-600">${a.useful_life_fiscal} m</td></tr>
                <tr class="border-b"><td class="py-1">Depr. Mensual</td><td class="text-right font-bold text-indigo-900">${formatCOP(deprNIIFMonthly)}</td><td class="text-right text-gray-600">${formatCOP(deprFiscalMonthly)}</td></tr>
                <tr class="border-b"><td class="py-1">Depr. Acumulada</td><td class="text-right font-bold text-indigo-900">${formatCOP(accumNIIF)}</td><td class="text-right text-gray-600">${formatCOP(accumFiscal)}</td></tr>
                <tr><td class="py-1">Valor en Libros</td><td class="text-right font-bold text-emerald-700">${formatCOP(netNIIF)}</td><td class="text-right text-gray-600">${formatCOP(netFiscal)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Botones de Operaciones del Ciclo de Vida -->
        ${can('canWrite') ? `
          <div class="flex gap-2 flex-wrap bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl justify-center">
            <button class="btn btn-outline btn-xs" onclick="openTransferForm('${esc(a.id)}')"><i class="fas fa-truck-ramp-box mr-1"></i>Trasladar Activo</button>
            <button class="btn btn-outline btn-xs" onclick="openImprovementForm('${esc(a.id)}')"><i class="fas fa-circle-plus mr-1"></i>Registrar Mejora</button>
            <button class="btn btn-outline btn-xs" onclick="openImpairmentForm('${esc(a.id)}')"><i class="fas fa-triangle-exclamation mr-1"></i>Deterioro NIC 36</button>
            <button class="btn btn-danger btn-xs" onclick="openDisposalForm('${esc(a.id)}')" style="background:#EF4444; border-color:#EF4444"><i class="fas fa-trash-can mr-1"></i>Dar de Baja</button>
          </div>
        ` : ''}
      </div>
    `;
  };

  const buildComponentsTab = () => {
    return `
      <div class="space-y-4 text-xs">
        <div class="flex justify-between items-center mb-2">
          <h6 class="font-bold text-gray-700"><i class="fas fa-puzzle-piece mr-1.5 text-purple-500"></i>Componentes del Activo (NIIF)</h6>
        </div>
        <div class="bg-white rounded-xl border overflow-hidden">
          <table class="data-table text-xxs">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Componente</th>
                <th>Costo</th>
                <th>Vida Útil NIIF</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${components.length ? components.map(c => `
                <tr>
                  <td><strong>${esc(c.code)}</strong></td>
                  <td>${esc(c.name)}</td>
                  <td>${formatCOP(c.cost)}</td>
                  <td>${c.useful_life_niif} m</td>
                  <td><span class="badge badge-green">${esc(c.status)}</span></td>
                </tr>
              `).join('') : '<tr><td colspan="5" class="text-center py-6 text-gray-400">Este activo no tiene componentes registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const buildEventsTab = () => {
    return `
      <div class="space-y-4 text-xs">
        <h6 class="font-bold text-gray-700 mb-2"><i class="fas fa-history mr-1.5 text-amber-500"></i>Línea de Tiempo de Novedades (Kardex)</h6>
        <div class="relative pl-6 border-l border-gray-200 ml-3 space-y-4">
          ${events.length ? events.map(ev => {
            const evIcons: Record<string, string> = {
              traslado: '<i class="fas fa-truck-ramp-box text-blue-500"></i>',
              mejora: '<i class="fas fa-circle-plus text-emerald-500"></i>',
              revaluacion: '<i class="fas fa-arrow-trend-up text-indigo-500"></i>',
              deterioro: '<i class="fas fa-triangle-exclamation text-amber-600"></i>',
              baja: '<i class="fas fa-trash-can text-red-500"></i>'
            };
            const icon = evIcons[ev.event_type] || '<i class="fas fa-calendar-day text-gray-500"></i>';

            return `
              <div class="relative">
                <div class="absolute -left-9 top-0.5 bg-white border w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                  ${icon}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xxs font-bold text-gray-900 uppercase">${esc(ev.event_type)}</span>
                    <span class="text-xxs text-gray-400 font-semibold">${esc(ev.date)}</span>
                  </div>
                  <p class="text-gray-600 mt-1">${esc(ev.description || '')}</p>
                  ${ev.amount ? `<div class="text-xxs font-bold text-indigo-950 mt-0.5">Monto: ${formatCOP(ev.amount)}</div>` : ''}
                </div>
              </div>
            `;
          }).join('') : '<div class="text-center py-6 text-gray-400">No se registran traslados o novedades en este activo.</div>'}
        </div>
      </div>
    `;
  };

  const bodyHtml = `
    <div class="flex gap-2 border-b mb-4 pb-px text-xxs font-bold">
      <button class="px-3 py-1.5 border-b-2 border-indigo-600 text-indigo-600 modal-tab-btn" data-tab="fin">Financiero & General</button>
      <button class="px-3 py-1.5 border-b-2 border-transparent text-gray-500 hover:text-gray-800 modal-tab-btn" data-tab="comp">Componentes NIIF</button>
      <button class="px-3 py-1.5 border-b-2 border-transparent text-gray-500 hover:text-gray-800 modal-tab-btn" data-tab="event">Historial Novedades</button>
    </div>
    <div id="modal-tab-content">${buildFinancialTab()}</div>
  `;

  openModal(title, bodyHtml, `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar Hoja de Vida</button>
  `, true);

  const modalBox = document.getElementById('modal-overlay');
  if (modalBox) {
    modalBox.querySelectorAll('.modal-tab-btn').forEach((btn: any) => {
      btn.addEventListener('click', () => {
        modalBox.querySelectorAll('.modal-tab-btn').forEach((b: any) => {
          b.classList.remove('border-indigo-600', 'text-indigo-600');
          b.classList.add('border-transparent', 'text-gray-500');
        });
        btn.classList.remove('border-transparent', 'text-gray-500');
        btn.classList.add('border-indigo-600', 'text-indigo-600');

        const tab = btn.dataset.tab;
        const contentDiv = document.getElementById('modal-tab-content');
        if (!contentDiv) return;

        if (tab === 'fin') contentDiv.innerHTML = buildFinancialTab();
        else if (tab === 'comp') contentDiv.innerHTML = buildComponentsTab();
        else if (tab === 'event') contentDiv.innerHTML = buildEventsTab();
      });
    });
  }
};

(window as any).openTransferForm = async (id: string) => {
  try {
    const a = await pb.get('niif_assets', id, { expand: 'cost_center_id,owner_id' });
    const costCenters = await pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' });
    const users = await pb.listAll('users', { sort: 'name' });

    const body = `
      <form class="space-y-4 text-xs" id="transfer-form">
        <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xxs text-indigo-950 font-semibold mb-2">
          Activo a Trasladar: ${esc(a.code)} - ${esc(a.name)}
        </div>
        <div class="form-group">
          <label class="form-label">Nueva Ubicación Física</label>
          <input id="trn-location" class="form-input" placeholder="Ej: Oficina 404, Sede Norte" value="${esc(a.location || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Nuevo Centro de Costos</label>
          <select id="trn-cc" class="form-input">
            <option value="">-- Ninguno --</option>
            ${costCenters.map(cc => `<option value="${esc(cc.id)}" ${a.cost_center_id === cc.id ? 'selected' : ''}>${esc(cc.code)} - ${esc(cc.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nuevo Responsable Custodia</label>
          <select id="trn-owner" class="form-input">
            <option value="">-- Ninguno --</option>
            ${users.map(u => `<option value="${esc(u.id)}" ${a.owner_id === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Descripción / Justificación del Traslado <span class="text-red-500">*</span></label>
          <input id="trn-desc" class="form-input" placeholder="Ej: Reasignación por cambio de área de trabajo" required>
        </div>
      </form>
    `;

    openModal('Trasladar Activo Fijo', body, `
      <button class="btn btn-outline btn-sm" onclick="viewAssetDetail('${esc(a.id)}')">Volver</button>
      <button class="btn btn-primary btn-sm" id="btn-save-transfer"><i class="fas fa-truck-ramp-box mr-1"></i>Confirmar Traslado</button>
    `);

    $('#btn-save-transfer')?.addEventListener('click', async () => {
      const location = getInputVal('trn-location').trim();
      const cost_center_id = getSelectVal('trn-cc') || null;
      const owner_id = getSelectVal('trn-owner') || null;
      const desc = getInputVal('trn-desc').trim();

      if (!desc) {
        return showToast('Por favor ingrese la justificación del traslado', 'warning');
      }

      try {
        const eventPayload = {
          asset_id: id,
          event_type: 'traslado',
          date: todayStr(),
          description: `Traslado. Justificación: ${desc}`,
          location_from: a.location || '—',
          location_to: location || '—',
          cost_center_from_id: a.cost_center_id || null,
          cost_center_to_id: cost_center_id,
          owner_from_id: a.owner_id || null,
          owner_to_id: owner_id
        };

        await pb.create('niif_asset_events', eventPayload);
        await pb.update('niif_assets', id, { location, cost_center_id, owner_id });

        await API.logAudit('STATUS', 'Asset Transfer', id, `Trasladó activo ${a.code} a ${location || 'sin ubicación'}`);
        showToast('Traslado registrado con éxito', 'success');
        await viewAssetDetail(id);
      } catch (err: any) {
        showToast('Error al registrar traslado: ' + err.message, 'error');
      }
    });
  } catch (err: any) {
    showToast('Error al cargar formulario: ' + err.message, 'error');
  }
};

(window as any).openImprovementForm = async (id: string) => {
  try {
    const a = await pb.get('niif_assets', id);

    const body = `
      <form class="space-y-4 text-xs" id="improvement-form">
        <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xxs text-indigo-950 font-semibold mb-2">
          Registrar Adición / Mejora para: ${esc(a.code)} - ${esc(a.name)}
        </div>
        <div class="form-group">
          <label class="form-label">Monto de la Mejora (Capitalizable - $ COP) <span class="text-red-500">*</span></label>
          <input id="imp-amount" type="number" class="form-input" placeholder="Monto total a capitalizar" required>
        </div>
        <div class="form-group">
          <label class="form-label">Incremento de Vida Útil NIIF (Meses opcional)</label>
          <input id="imp-life-niif" type="number" class="form-input" placeholder="Ej: 12 (dejar vacío si no cambia)" value="">
        </div>
        <div class="form-group">
          <label class="form-label">Incremento de Vida Útil Fiscal (Meses opcional)</label>
          <input id="imp-life-fiscal" type="number" class="form-input" placeholder="Ej: 12 (dejar vacío si no cambia)" value="">
        </div>
        <div class="form-group">
          <label class="form-label">Descripción de la Mejora <span class="text-red-500">*</span></label>
          <input id="imp-desc" class="form-input" placeholder="Ej: Ampliación de capacidad o repotenciación" required>
        </div>
      </form>
    `;

    openModal('Registrar Mejora / Adición', body, `
      <button class="btn btn-outline btn-sm" onclick="viewAssetDetail('${esc(a.id)}')">Volver</button>
      <button class="btn btn-primary btn-sm" id="btn-save-improvement"><i class="fas fa-check mr-1.5"></i>Registrar Mejora</button>
    `);

    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    $('#btn-save-improvement')?.addEventListener('click', async () => {
      const amount = Number(getInputVal('imp-amount') || 0);
      const desc = getInputVal('imp-desc').trim();
      const addLifeNIIF = Number(getInputVal('imp-life-niif') || 0);
      const addLifeFiscal = Number(getInputVal('imp-life-fiscal') || 0);

      if (!amount || !desc) {
        return showToast('Por favor ingrese el monto y la descripción', 'warning');
      }

      try {
        const newCost = a.cost + amount;
        const newLifeNIIF = a.useful_life_niif + addLifeNIIF;
        const newLifeFiscal = a.useful_life_fiscal + addLifeFiscal;

        const eventPayload = {
          asset_id: id,
          event_type: 'mejora',
          date: todayStr(),
          description: `Mejora/Adición. Detalle: ${desc}. Incremento de vida útil NIIF: +${addLifeNIIF} meses, Fiscal: +${addLifeFiscal} meses.`,
          amount: amount,
          previous_value: a.cost,
          new_value: newCost
        };

        await pb.create('niif_asset_events', eventPayload);

        await pb.update('niif_assets', id, {
          cost: newCost,
          useful_life_niif: newLifeNIIF,
          useful_life_fiscal: newLifeFiscal
        });

        await API.logAudit('UPDATE', 'Asset Improvement', id, `Registró mejora en activo ${a.code} por ${formatCOP(amount)}`);
        showToast('Mejora capitalizada con éxito', 'success');
        await viewAssetDetail(id);
      } catch (err: any) {
        showToast('Error al registrar mejora: ' + err.message, 'error');
      }
    });
  } catch (err: any) {
    showToast('Error al cargar formulario: ' + err.message, 'error');
  }
};

(window as any).openImpairmentForm = async (id: string) => {
  try {
    const a = await pb.get('niif_assets', id, { expand: 'category_id' });
    const cat = a.expand?.category_id;

    const calculateMonthsElapsed = (startDateStr: string) => {
      if (!startDateStr) return 0;
      const start = new Date(startDateStr);
      const end = new Date();
      return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    };
    const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
    const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
    const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
    const netNIIF = a.cost - accumNIIF - (a.impairment || 0);
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    const body = `
      <form class="space-y-4 text-xs" id="impairment-form">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xxs text-amber-900 font-semibold mb-2">
          Prueba de Deterioro de Activo (NIC 36) para: ${esc(a.code)} - ${esc(a.name)}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Valor en Libros NIIF Actual</label>
            <input class="form-input text-gray-500 font-semibold" value="${formatCOP(netNIIF)}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Valor de Uso ($ COP) <span class="text-red-500">*</span></label>
            <input id="imp-use-val" type="number" class="form-input" placeholder="Flujos futuros traídos a VP" required>
          </div>
          <div class="form-group">
            <label class="form-label">Valor Razonable neto de Gastos ($ COP) <span class="text-red-500">*</span></label>
            <input id="imp-fair-val" type="number" class="form-input" placeholder="Valor de mercado estimado" required>
          </div>
          <div class="form-group">
            <label class="form-label">Pérdida por Deterioro Calculada</label>
            <input id="imp-loss-calculated" class="form-input font-bold text-red-600" value="$ 0" disabled>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Justificación o Indicadores de Deterioro <span class="text-red-500">*</span></label>
          <input id="imp-notes" class="form-input" placeholder="Ej: Daño físico, obsolescencia tecnológica..." required>
        </div>
      </form>
    `;

    openModal('Calcular Deterioro (NIC 36)', body, `
      <button class="btn btn-outline btn-sm" onclick="viewAssetDetail('${esc(a.id)}')">Volver</button>
      <button class="btn btn-primary btn-sm" id="btn-save-impairment"><i class="fas fa-calculator mr-1"></i>Contabilizar Deterioro</button>
    `);

    const calculateLoss = () => {
      const vUse = Number(getInputVal('imp-use-val') || 0);
      const vFair = Number(getInputVal('imp-fair-val') || 0);
      
      const vRecoverable = Math.max(vUse, vFair);
      const loss = Math.max(0, netNIIF - vRecoverable);

      const display = $('#imp-loss-calculated') as HTMLInputElement | null;
      if (display) {
        display.value = formatCOP(loss);
        display.dataset.loss = String(loss);
      }
    };

    $('#imp-use-val')?.addEventListener('input', calculateLoss);
    $('#imp-fair-val')?.addEventListener('input', calculateLoss);

    $('#btn-save-impairment')?.addEventListener('click', async () => {
      const vUse = Number(getInputVal('imp-use-val') || 0);
      const vFair = Number(getInputVal('imp-fair-val') || 0);
      const notes = getInputVal('imp-notes').trim();
      const lossEl = $('#imp-loss-calculated') as HTMLInputElement | null;
      const loss = Number(lossEl?.dataset.loss || 0);

      if (!vUse || !vFair || !notes) {
        return showToast('Por favor complete todos los campos obligatorios', 'warning');
      }

      if (loss <= 0) {
        return showToast('El valor recuperable es mayor o igual al valor en libros. No se requiere contabilizar pérdida por deterioro.', 'info');
      }

      try {
        const accImpairmentExpId = cat?.account_impairment_expense_id;
        const accImpairmentAccumId = cat?.account_impairment_accum_id;

        if (!accImpairmentExpId || !accImpairmentAccumId) {
          return showToast('La categoría de este activo no tiene parametrizadas las cuentas de deterioro.', 'error');
        }

        let txTypes: any[] = [];
        try { txTypes = await pb.listAll('transaction_types'); } catch(_) {}
        const naType = txTypes.find(t => t.code === 'NA') || txTypes[0];

        const txData = {
          tx_type_id: naType.id,
          number: 'AUTO',
          date: todayStr(),
          description: `Ajuste contable deterioro NIC 36 activo: ${a.code} - ${a.name}. Motivo: ${notes}`,
          book_type: 'niif'
        };

        const txLines = [
          {
            account_id: accImpairmentExpId,
            debit: loss,
            credit: 0,
            description: `Pérdida por deterioro de activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          },
          {
            account_id: accImpairmentAccumId,
            debit: 0,
            credit: loss,
            description: `Deterioro acumulado activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          }
        ];

        const createdTx = await API.createTransaction(txData, txLines);

        await pb.create('niif_asset_events', {
          asset_id: id,
          event_type: 'deterioro',
          date: todayStr(),
          description: `Deterioro NIC 36 registrado. Valor Recuperable: ${formatCOP(Math.max(vUse, vFair))} (Valor de Uso: ${formatCOP(vUse)}, Valor Razonable: ${formatCOP(vFair)}). Justificación: ${notes}`,
          amount: loss,
          previous_value: a.impairment || 0,
          new_value: (a.impairment || 0) + loss,
          transaction_id: createdTx.id
        });

        await pb.update('niif_assets', id, {
          impairment: (a.impairment || 0) + loss
        });

        await API.logAudit('CREATE', 'Impairment adjustment', id, `Deterioro registrado para activo ${a.code} por ${formatCOP(loss)}`);
        showToast('Deterioro registrado y contabilizado en NIIF', 'success');
        await viewAssetDetail(id);
      } catch (err: any) {
        showToast('Error al guardar deterioro: ' + err.message, 'error');
      }
    });
  } catch (err: any) {
    showToast('Error al cargar formulario: ' + err.message, 'error');
  }
};

(window as any).openDisposalForm = async (id: string) => {
  try {
    const a = await pb.get('niif_assets', id, { expand: 'category_id' });
    const cat = a.expand?.category_id;
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    const calculateMonthsElapsed = (startDateStr: string) => {
      if (!startDateStr) return 0;
      const start = new Date(startDateStr);
      const end = new Date();
      return Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    };
    
    const months = calculateMonthsElapsed(a.start_service_date || a.purchase_date);
    const deprNIIFMonthly = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
    const accumNIIF = Math.min(a.cost - (a.residual_value || 0), deprNIIFMonthly * months);
    const netNIIF = a.cost - accumNIIF - (a.impairment || 0);

    const deprFiscalMonthly = a.cost / (a.useful_life_fiscal || 1);
    const accumFiscal = Math.min(a.cost, deprFiscalMonthly * months);
    const netFiscal = a.cost - accumFiscal;

    const body = `
      <form class="space-y-4 text-xs" id="disposal-form">
        <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-xxs text-red-950 font-semibold mb-2">
          Procesar Baja contable y tributaria de: ${esc(a.code)} - ${esc(a.name)}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Costo Histórico</label>
            <input class="form-input text-gray-500 font-semibold" value="${formatCOP(a.cost)}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Depreciación Acumulada NIIF</label>
            <input class="form-input text-gray-500 font-semibold" value="${formatCOP(accumNIIF)}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Valor en Libros NIIF</label>
            <input class="form-input text-gray-800 font-bold" value="${formatCOP(netNIIF)}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Valor en Libros Fiscal</label>
            <input class="form-input text-gray-600" value="${formatCOP(netFiscal)}" disabled>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div class="form-group">
            <label class="form-label">Concepto de Baja <span class="text-red-500">*</span></label>
            <select id="dsp-type" class="form-input">
              <option value="venta">Venta comercial</option>
              <option value="retiro">Retiro / Obsolescencia / Chatarra</option>
              <option value="perdida">Pérdida / Hurto / Destrucción</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Precio de Venta ($ COP, si aplica)</label>
            <input id="dsp-price" type="number" class="form-input" placeholder="0" value="0">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Detalle / Notas de la Baja <span class="text-red-500">*</span></label>
          <input id="dsp-desc" class="form-input" placeholder="Ej: Venta de vehículo según escritura, desmantelamiento de planta..." required>
        </div>
      </form>
    `;

    openModal('Baja de Activo Fijo (Retiro Contable)', body, `
      <button class="btn btn-outline btn-sm" onclick="viewAssetDetail('${esc(a.id)}')">Volver</button>
      <button class="btn btn-danger btn-sm" id="btn-confirm-disposal"><i class="fas fa-trash-can mr-1"></i>Confirmar Baja y Asiento</button>
    `);

    $('#dsp-type')?.addEventListener('change', () => {
      const type = getSelectVal('dsp-type');
      const input = $('#dsp-price') as HTMLInputElement | null;
      if (input) {
        input.disabled = (type !== 'venta');
        if (type !== 'venta') input.value = '0';
      }
    });

    $('#btn-confirm-disposal')?.addEventListener('click', async () => {
      const type = getSelectVal('dsp-type');
      const price = Number(getInputVal('dsp-price') || 0);
      const desc = getInputVal('dsp-desc').trim();

      if (!desc) {
        return showToast('Por favor ingrese las notas explicativas de la baja', 'warning');
      }

      try {
        const accAssetId = cat?.account_asset_id;
        const accDeprId = cat?.account_depr_accum_id;
        const accGainId = cat?.account_disposal_gain_id;
        const accLossId = cat?.account_disposal_loss_id;

        if (!accAssetId || !accDeprId || !accGainId || !accLossId) {
          return showToast('La categoría de este activo no tiene parametrizadas las cuentas PUC de baja.', 'error');
        }

        let txTypes: any[] = [];
        try { txTypes = await pb.listAll('transaction_types'); } catch(_) {}
        const naType = txTypes.find(t => t.code === 'NA') || txTypes[0];

        const gainOrLoss = price - netNIIF;
        const isGain = gainOrLoss > 0;
        
        const txDataNIIF = {
          tx_type_id: naType.id,
          number: 'AUTO',
          date: todayStr(),
          description: `Baja contable NIIF de activo: ${a.code} - ${a.name}. Detalle: ${desc}`,
          book_type: 'niif'
        };

        const txLinesNIIF = [
          {
            account_id: accDeprId,
            debit: accumNIIF,
            credit: 0,
            description: `Retiro de depr. acumulada NIIF del activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          },
          {
            account_id: accAssetId,
            debit: 0,
            credit: a.cost,
            description: `Retiro del costo histórico NIIF del activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          }
        ];

        let accounts: any[] = [];
        try { accounts = await pb.listAll('accounts', { filter: 'active=true', sort: 'code' }); } catch(_) {}
        let cashAccount = accounts.find(ac => ac.code.startsWith('1105') || ac.code.startsWith('1110'));

        if (type === 'venta' && price > 0) {
          txLinesNIIF.push({
            account_id: cashAccount ? cashAccount.id : accAssetId,
            debit: price,
            credit: 0,
            description: `Ingreso por venta de activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          });
        }

        if (gainOrLoss !== 0) {
          txLinesNIIF.push({
            account_id: isGain ? accGainId : accLossId,
            debit: isGain ? 0 : Math.abs(gainOrLoss),
            credit: isGain ? gainOrLoss : 0,
            description: isGain ? `Ganancia en venta de activo ${a.code}` : `Pérdida en retiro/baja de activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          });
        }

        const createdTxNIIF = await API.createTransaction(txDataNIIF, txLinesNIIF);

        const gainOrLossFiscal = price - netFiscal;
        const isGainFiscal = gainOrLossFiscal > 0;

        const txDataFiscal = {
          tx_type_id: naType.id,
          number: 'AUTO',
          date: todayStr(),
          description: `Baja fiscal de activo: ${a.code} - ${a.name}. Detalle: ${desc}`,
          book_type: 'local'
        };

        const txLinesFiscal = [
          {
            account_id: accDeprId,
            debit: accumFiscal,
            credit: 0,
            description: `Retiro de depr. acumulada fiscal del activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          },
          {
            account_id: accAssetId,
            debit: 0,
            credit: a.cost,
            description: `Retiro del costo histórico fiscal del activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          }
        ];

        if (type === 'venta' && price > 0) {
          txLinesFiscal.push({
            account_id: cashAccount ? cashAccount.id : accAssetId,
            debit: price,
            credit: 0,
            description: `Ingreso por venta fiscal de activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          });
        }

        if (gainOrLossFiscal !== 0) {
          txLinesFiscal.push({
            account_id: isGainFiscal ? accGainId : accLossId,
            debit: isGainFiscal ? 0 : Math.abs(gainOrLossFiscal),
            credit: isGainFiscal ? gainOrLossFiscal : 0,
            description: isGainFiscal ? `Ganancia fiscal en venta de activo ${a.code}` : `Pérdida fiscal en baja de activo ${a.code}`,
            cost_center_id: a.cost_center_id || null,
            third_party_id: a.provider_id || null
          });
        }

        await API.createTransaction(txDataFiscal, txLinesFiscal);

        await pb.create('niif_asset_events', {
          asset_id: id,
          event_type: 'baja',
          date: todayStr(),
          description: `Baja definitiva del activo. Concepto: ${type.toUpperCase()}. Nota: ${desc}. Resultado NIIF: ${gainOrLoss >= 0 ? 'Ganancia' : 'Pérdida'} de ${formatCOP(Math.abs(gainOrLoss))}.`,
          amount: price,
          transaction_id: createdTxNIIF.id
        });

        await pb.update('niif_assets', id, {
          status: type === 'venta' ? 'sold' : 'retired',
          active: false
        });

        await API.logAudit('DELETE', 'Asset Disposal', id, `Dio de baja activo ${a.code} (concepto: ${type})`);
        showToast('Activo dado de baja contable y fiscalmente', 'success');
        closeModal();
        const container = document.getElementById('activos-subtab-content');
        if (container) await renderSubTabCatalogo(container);
      } catch (err: any) {
        showToast('Error al procesar baja: ' + err.message, 'error');
      }
    });
  } catch (err: any) {
    showToast('Error al cargar formulario: ' + err.message, 'error');
  }
};

async function renderSubTabDepreciacion(c: HTMLElement) {
  const currentMonthDefault = todayStr().slice(0, 7); // YYYY-MM

  c.innerHTML = `
    <div class="bg-white rounded-2xl border p-6 mb-6" style="border-color:#F0F0F0">
      <h4 class="text-base font-bold mb-4" style="color:#0D2137"><i class="fas fa-calculator text-indigo-500 mr-1.5"></i>Procesamiento de Depreciación Mensual</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
        <div class="form-group">
          <label class="form-label text-xxs font-bold text-gray-500">Periodo a Depreciar</label>
          <input id="depr-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group flex gap-2">
          <button class="btn btn-primary w-full" id="btn-depr-proj"><i class="fas fa-search-plus mr-1"></i>Proyectar Cálculo</button>
          <button class="btn btn-secondary w-full" id="btn-depr-post" disabled><i class="fas fa-floppy-disk mr-1"></i>Procesar y Contabilizar</button>
        </div>
        <div class="form-group">
          <span class="text-xxs text-gray-400 leading-normal block">Calcula en paralelo la depreciación del libro contable (NIIF) y libro tributario (Fiscal) para todos los activos en operación.</span>
        </div>
      </div>
    </div>

    <!-- Panel de Resultados de Proyección -->
    <div id="depr-projection-output" class="bg-white rounded-2xl border p-6 min-height: 300px" style="border-color:#F0F0F0">
      <p class="text-xs text-gray-400 text-center py-20"><i class="fas fa-calendar-check text-gray-300 text-3xl block mb-3"></i>Seleccione el periodo y presione Proyectar Cálculo.</p>
    </div>
  `;

  let activeAssetsForDepr: any[] = [];

  $('#btn-depr-proj')?.addEventListener('click', async () => {
    const month = getInputVal('depr-month');
    const output = document.getElementById('depr-projection-output');
    if (!output) return;

    output.innerHTML = `<div class="p-12 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando activos depreciables...</div>`;

    try {
      const [assets, categories] = await Promise.all([
        pb.listAll('niif_assets', { filter: 'status="active" || status="in_repair"', expand: 'category_id' }),
        pb.listAll('niif_asset_categories', { filter: 'active=true' })
      ]);

      activeAssetsForDepr = assets;
      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

      if (assets.length === 0) {
        output.innerHTML = `<div class="p-12 text-center text-gray-400"><i class="fas fa-circle-info mr-1"></i>No se encontraron activos fijos en operación para depreciar.</div>`;
        return;
      }

      const [yrStr, moStr] = month.split('-');
      const yr = Number(yrStr);
      const mo = Number(moStr);
      const lastDay = new Date(yr, mo, 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

      let checkTxItems: any[] = [];
      let checkEventItems: any[] = [];
      try {
        const checkTx = await pb.list('transactions', {
          filter: `date >= "${startDate}" && date <= "${endDate} 23:59:59" && (description ~ "depreciaci" || description ~ "Depreciaci") && status = "active"`,
          perPage: 1
        });
        checkTxItems = checkTx.items;

        const checkEv = await pb.list('niif_asset_events', {
          filter: `description ~ "${month}"`,
          perPage: 1
        });
        checkEventItems = checkEv.items;
      } catch (err: any) {
        console.warn('[Depreciation Check] Query check note:', err);
      }

      const alreadyPosted = checkTxItems.length > 0 || checkEventItems.length > 0;

      const tableRows = assets.map(a => {
        const deprNIIF = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
        const deprFiscal = a.cost / (a.useful_life_fiscal || 1);
        const diff = deprNIIF - deprFiscal;
        const methodStr = a.depreciation_method === 'linea_recta' ? 'Línea Recta' : esc(a.depreciation_method);

        return `
          <tr>
            <td><strong>${esc(a.code)}</strong></td>
            <td>${esc(a.name)}</td>
            <td>${formatCOP(a.cost)}</td>
            <td>${formatCOP(a.residual_value || 0)}</td>
            <td><span class="text-gray-500">${methodStr}</span></td>
            <td class="text-right font-semibold text-indigo-950">${formatCOP(deprNIIF)}</td>
            <td class="text-right text-gray-600">${formatCOP(deprFiscal)}</td>
            <td class="text-right font-bold ${diff !== 0 ? 'text-amber-600' : 'text-gray-400'}">${formatCOP(diff)}</td>
          </tr>
        `;
      }).join('');

      let totalNIIF = 0;
      let totalFiscal = 0;
      assets.forEach(a => {
        totalNIIF += (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
        totalFiscal += a.cost / (a.useful_life_fiscal || 1);
      });

      const stateBadge = alreadyPosted 
        ? '<span class="badge badge-orange"><i class="fas fa-triangle-exclamation mr-1"></i>¡Atención! Ya se registraron comprobantes en este periodo</span>' 
        : '<span class="badge badge-green"><i class="fas fa-check mr-1"></i>Listo para procesar</span>';

      const warningBanner = alreadyPosted ? `
        <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div class="flex items-center gap-2">
            <i class="fas fa-triangle-exclamation text-amber-600 text-base"></i>
            <div>
              <strong>Validación de Duplicidad:</strong> La depreciación del periodo <strong>${month}</strong> ya cuenta con registros contables procesados.
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-xxs font-bold bg-amber-200 text-amber-900">Periodo Contabilizado</span>
        </div>
      ` : '';

      output.innerHTML = `
        <div class="space-y-4">
          ${warningBanner}
          <div class="flex justify-between items-center pb-3 border-b" style="border-color:#EEF0F5">
            <h5 class="text-xs font-bold text-gray-800">Proyección de Depreciación para el Periodo: ${month}</h5>
            ${stateBadge}
          </div>

          <div class="overflow-x-auto">
            <table class="data-table text-xxs">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Activo</th>
                  <th>Costo Histórico</th>
                  <th>V. Residual NIIF</th>
                  <th>Método</th>
                  <th class="text-right">Cuota Mensual NIIF</th>
                  <th class="text-right">Cuota Mensual Fiscal</th>
                  <th class="text-right">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                <tr class="font-bold bg-gray-50 border-t-2" style="border-color:#CBD5E1">
                  <td colspan="5" class="py-2">TOTALES</td>
                  <td class="text-right text-indigo-900">${formatCOP(totalNIIF)}</td>
                  <td class="text-right text-gray-800">${formatCOP(totalFiscal)}</td>
                  <td class="text-right text-amber-700">${formatCOP(totalNIIF - totalFiscal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      const postBtn = document.getElementById('btn-depr-post') as HTMLButtonElement | null;
      if (postBtn) {
        postBtn.disabled = false;
        postBtn.dataset.month = month;
        postBtn.dataset.already = alreadyPosted ? '1' : '0';
      }

    } catch (err: any) {
      output.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error al proyectar: ${esc(err.message)}</div>`;
    }
  });

  $('#btn-depr-post')?.addEventListener('click', async () => {
    const postBtn = $('#btn-depr-post') as HTMLButtonElement | null;
    if (!postBtn) return;
    const month = postBtn.dataset.month || getInputVal('depr-month') || todayStr().slice(0, 7);
    const already = postBtn.dataset.already === '1';

    const action = async () => {
      postBtn.disabled = true;
      postBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>Procesando...`;

      try {
        const [categories, assets] = await Promise.all([
          pb.listAll('niif_asset_categories'),
          activeAssetsForDepr.length > 0
            ? Promise.resolve(activeAssetsForDepr)
            : pb.listAll('niif_assets', { filter: 'status="active" || status="in_repair"', expand: 'category_id' })
        ]);
        activeAssetsForDepr = assets;
        const catMap = new Map(categories.map(c => [c.id, c]));

        let txTypes: any[] = [];
        try { txTypes = await pb.listAll('transaction_types'); } catch(_) {}
        const naType = txTypes.find(t => t.code === 'NA') || txTypes[0];

        const unmappedCats = new Set<string>();
        const niifLines: any[] = [];
        const fiscalLines: any[] = [];
        const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

        activeAssetsForDepr.forEach((a) => {
          const cat = catMap.get(a.category_id);
          if (!cat) {
            unmappedCats.add('Sin categoría asignada');
            return;
          }

          if (!cat.account_depr_expense_id || !cat.account_depr_accum_id) {
            unmappedCats.add(`${cat.code} - ${cat.name}`);
          }

          const deprNIIF = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
          const deprFiscal = a.cost / (a.useful_life_fiscal || 1);

          const assetThirdPartyId = a.provider_id || null;

          if (deprNIIF > 0 && cat.account_depr_expense_id && cat.account_depr_accum_id) {
            niifLines.push({
              account_id: cat.account_depr_expense_id,
              debit: Math.round(deprNIIF),
              credit: 0,
              description: `Depr. contable NIIF mes ${month} de activo ${a.code}`,
              cost_center_id: a.cost_center_id || null,
              third_party_id: assetThirdPartyId,
              line_order: niifLines.length + 1
            });
            niifLines.push({
              account_id: cat.account_depr_accum_id,
              debit: 0,
              credit: Math.round(deprNIIF),
              description: `Depr. acum. contable NIIF mes ${month} de activo ${a.code}`,
              cost_center_id: a.cost_center_id || null,
              third_party_id: assetThirdPartyId,
              line_order: niifLines.length + 1
            });
          }

          if (deprFiscal > 0 && cat.account_depr_expense_id && cat.account_depr_accum_id) {
            fiscalLines.push({
              account_id: cat.account_depr_expense_id,
              debit: Math.round(deprFiscal),
              credit: 0,
              description: `Depr. tributaria fiscal mes ${month} de activo ${a.code}`,
              cost_center_id: a.cost_center_id || null,
              third_party_id: assetThirdPartyId,
              line_order: fiscalLines.length + 1
            });
            fiscalLines.push({
              account_id: cat.account_depr_accum_id,
              debit: 0,
              credit: Math.round(deprFiscal),
              description: `Depr. acum. fiscal mes ${month} de activo ${a.code}`,
              cost_center_id: a.cost_center_id || null,
              third_party_id: assetThirdPartyId,
              line_order: fiscalLines.length + 1
            });
          }
        });

        if (unmappedCats.size > 0) {
          showToast(`Categorías sin cuentas PUC de depreciación: ${[...unmappedCats].join(', ')}. Configure las cuentas en la pestaña Categorías.`, 'warning', 6000);
        }

        if (niifLines.length === 0 && fiscalLines.length === 0) {
          showToast('No hay cuentas PUC de depreciación parametrizadas para contabilizar.', 'warning');
          const container = document.getElementById('activos-subtab-content');
          if (container) await renderSubTabDepreciacion(container);
          return;
        }

        const [yrStr, moStr] = month.split('-');
        const lastDayVal = new Date(Number(yrStr), Number(moStr), 0).getDate();
        const txPostingDate = `${month}-${String(lastDayVal).padStart(2, '0')}`;

        let txNIIFId = "";
        if (niifLines.length > 0) {
          const txDataNIIF = {
            tx_type_id: naType.id,
            number: 'AUTO',
            date: txPostingDate,
            description: `Causación Depreciación Contable NIIF - Periodo ${month}`,
            book_type: 'niif'
          };
          const createdTxNIIF = await API.createTransaction(txDataNIIF, niifLines);
          txNIIFId = createdTxNIIF.id;
        }

        let txFiscalId = "";
        if (fiscalLines.length > 0) {
          const txDataFiscal = {
            tx_type_id: naType.id,
            number: 'AUTO',
            date: txPostingDate,
            description: `Causación Depreciación Tributaria Fiscal - Periodo ${month}`,
            book_type: 'local'
          };
          const createdTxFiscal = await API.createTransaction(txDataFiscal, fiscalLines);
          txFiscalId = createdTxFiscal.id;
        }

        for (const a of activeAssetsForDepr) {
          const deprNIIF = (a.cost - (a.residual_value || 0)) / (a.useful_life_niif || 1);
          await pb.create('niif_asset_events', {
            asset_id: a.id,
            event_type: 'mejora',
            date: todayStr(),
            description: `Depreciación mensual procesada para el periodo ${month}. Cuota NIIF: ${formatCOP(deprNIIF)}.`,
            amount: deprNIIF,
            transaction_id: txNIIFId || null
          });
        }

        await API.logAudit('CREATE', 'Depreciation Run', month, `Corrió depreciación mensual del periodo ${month}`);
        showToast('Depreciación mensual contabilizada con éxito', 'success');
        await renderSubTabDepreciacion(c);
      } catch (err: any) {
        showToast('Error al contabilizar depreciación: ' + err.message, 'error');
        postBtn.disabled = false;
        postBtn.innerHTML = `<i class="fas fa-floppy-disk mr-1"></i>Procesar y Contabilizar`;
      }
    };

    if (already) {
      confirmDialog(
        'Depreciación Duplicada',
        'Ya se detectó un comprobante contable de depreciación en este mes. ¿Estás seguro de que deseas procesarlo nuevamente? Esto duplicará los asientos en el libro mayor.',
        action,
        true
      );
    } else {
      action();
    }
  });
}

async function renderSubTabInventario(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inventarios físicos...</div>`;
  try {
    const inventories = await pb.listAll('niif_asset_inventories', { sort: '-date' });
    const assets = await pb.listAll('niif_assets', { filter: 'active=true' });

    const invRows = inventories.map(inv => {
      const stateBadge = inv.status === 'open' ? '<span class="badge badge-orange">Abierto</span>' : '<span class="badge badge-green">Conciliado / Cerrado</span>';
      
      return `
        <tr class="hover:bg-gray-50/50">
          <td><strong class="text-indigo-900">${esc(inv.code)}</strong></td>
          <td><span class="text-xs font-semibold text-gray-800">${esc(inv.date)}</span></td>
          <td><span class="text-xs text-gray-500">${esc(inv.description || '—')}</span></td>
          <td>${stateBadge}</td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-xs" onclick="openInventoryConveyor('${esc(inv.id)}')" title="Escanear y Conciliar"><i class="fas fa-qrcode mr-1"></i>${inv.status === 'open' ? 'Escanear' : 'Ver resultados'}</button>
              ${can('canDelete') ? `<button class="btn btn-danger btn-xs" onclick="deleteInventory('${esc(inv.id)}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const newBtn = can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-new-inventory"><i class="fas fa-plus mr-1.5"></i>Iniciar Conteo Físico</button>' : '';

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-sm font-bold text-gray-800">Conciliación e Inventario Físico (Lectura QR)</h4>
          <p class="text-xs text-gray-500">Registre los conteos de activos tomados en bodega y concilie diferencias contra el catálogo contable.</p>
        </div>
        ${newBtn}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código de Conteo</th>
                <th>Fecha Conteo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${invRows || '<tr><td colspan="5" class="text-center py-12 text-gray-400"><i class="fas fa-qrcode mr-1.5"></i>No hay conteos de inventario registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $('#btn-new-inventory')?.addEventListener('click', () => openNewInventoryModal(assets));

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

async function openNewInventoryModal(assets: any[]) {
  const codeDefault = `INV-${todayStr().replace(/\-/g, '')}`;
  const body = `
    <form class="space-y-4 text-xs" id="new-inventory-form">
      <div class="form-group">
        <label class="form-label">Código del Conteo <span class="text-red-500">*</span></label>
        <input id="inv-code" class="form-input" value="${codeDefault}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Inicio <span class="text-red-500">*</span></label>
        <input id="inv-date" type="date" class="form-input" value="${todayStr()}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Descripción / Notas del Conteo</label>
        <input id="inv-desc" class="form-input" placeholder="Ej: Conteo anual de equipos de oficina de la sede principal">
      </div>
    </form>
  `;

  openModal('Iniciar Conteo Físico', body, `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary btn-sm" id="btn-create-inventory"><i class="fas fa-check mr-1.5"></i>Crear Conteo</button>
  `);

  $('#btn-create-inventory')?.addEventListener('click', async () => {
    const code = getInputVal('inv-code').toUpperCase().trim();
    const date = getInputVal('inv-date');
    const description = getInputVal('inv-desc').trim();

    if (!code || !date) {
      return showToast('Por favor llene los campos obligatorios', 'warning');
    }

    try {
      const payload = {
        code,
        date,
        description,
        status: 'open',
        results: JSON.stringify([])
      };

      await pb.create('niif_asset_inventories', payload);
      showToast('Conteo físico iniciado con éxito', 'success');
      closeModal();
      const container = document.getElementById('activos-subtab-content');
      if (container) await renderSubTabInventario(container);
    } catch (err: any) {
      showToast('Error al iniciar conteo: ' + err.message, 'error');
    }
  });
}

(window as any).openInventoryConveyor = async (id: string) => {
  try {
    const inv = await pb.get('niif_asset_inventories', id);
    const assets = await pb.listAll('niif_assets', { filter: 'active=true' });
    const scanned = JSON.parse(inv.results || '[]');

    const scannedCodes = new Set(scanned.map((s: any) => s.code));
    const missing = assets.filter(a => !scannedCodes.has(a.code));
    const ok = assets.filter(a => scannedCodes.has(a.code));

    const okRows = ok.map(a => `
      <tr class="border-b"><td class="py-1"><strong>${esc(a.code)}</strong></td><td class="py-1 text-gray-700">${esc(a.name)}</td></tr>
    `).join('');

    const missingRows = missing.map(a => `
      <tr class="border-b"><td class="py-1"><strong class="text-red-900">${esc(a.code)}</strong></td><td class="py-1 text-gray-500">${esc(a.name)}</td></tr>
    `).join('');

    const scanOptions = assets.map(a => `<option value="${esc(a.code)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('');

    const scanInputArea = inv.status === 'open' ? `
      <div class="bg-gray-50 border p-4 rounded-xl space-y-3">
        <h6 class="font-bold text-gray-700"><i class="fas fa-qrcode text-indigo-500 mr-1.5"></i>Simulador de Lectura QR / Entrada Placa</h6>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div class="form-group md:col-span-2">
            <label class="form-label text-xxs">Seleccione o digite la placa del activo escaneado</label>
            <select id="scan-select-asset" class="form-input text-xs">
              <option value="">-- Seleccionar Placa --</option>
              ${scanOptions}
            </select>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-simulate-scan"><i class="fas fa-barcode mr-1.5"></i>Escanear Placa</button>
        </div>
      </div>
    ` : '';

    const bodyHtml = `
      <div class="space-y-4 text-xs">
        <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center text-xxs font-semibold mb-2">
          <div><strong>Conteo:</strong> <span class="text-indigo-900 font-bold">${esc(inv.code)}</span></div>
          <div><strong>Total Activos Registrados:</strong> <span class="text-gray-700 font-bold">${assets.length}</span></div>
          <div><strong>Escaneados/Encontrados:</strong> <span class="text-emerald-700 font-bold">${scanned.length}</span></div>
        </div>

        ${scanInputArea}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Encontrados -->
          <div class="bg-white rounded-xl border p-4">
            <h6 class="font-bold text-emerald-700 border-b pb-1.5 mb-2"><i class="fas fa-circle-check mr-1.5"></i>Encontrados / Conciliados (${ok.length})</h6>
            <div class="overflow-y-auto" style="max-height: 250px">
              <table class="w-full text-xxs leading-relaxed">
                <tbody>
                  ${okRows || '<tr><td class="text-center py-6 text-gray-400">Ningún activo escaneado aún.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Faltantes -->
          <div class="bg-white rounded-xl border p-4">
            <h6 class="font-bold text-red-700 border-b pb-1.5 mb-2"><i class="fas fa-triangle-exclamation mr-1.5"></i>Faltantes en Conteo (${missing.length})</h6>
            <div class="overflow-y-auto" style="max-height: 250px">
              <table class="w-full text-xxs leading-relaxed">
                <tbody>
                  ${missingRows || '<tr><td class="text-center py-6 text-emerald-600 font-semibold">¡Todos los activos conciliados con éxito!</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    openModal(`Conteo Físico: ${esc(inv.code)}`, bodyHtml, `
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
      ${inv.status === 'open' ? `<button class="btn btn-primary btn-sm" id="btn-close-inventory"><i class="fas fa-check-double mr-1.5"></i>Cerrar and Conciliar Conteo</button>` : ''}
    `, true);

    // Simulated scan trigger
    $('#btn-simulate-scan')?.addEventListener('click', async () => {
      const code = getSelectVal('scan-select-asset');
      if (!code) return showToast('Por favor seleccione una placa', 'warning');

      if (scanned.find((s: any) => s.code === code)) {
        return showToast('Esta placa ya fue escaneada en este conteo.', 'warning');
      }

      scanned.push({ code, timestamp: (window as any).nowStr() });
      try {
        await pb.update('niif_asset_inventories', id, { results: JSON.stringify(scanned) });
        showToast(`Placa ${code} escaneada con éxito`, 'success');
        await openInventoryConveyor(id);
      } catch (err: any) {
        showToast('Error al registrar lectura: ' + err.message, 'error');
      }
    });

    // Cerrar Conteo
    $('#btn-close-inventory')?.addEventListener('click', async () => {
      confirmDialog(
        'Cerrar Conteo Físico',
        '¿Estás seguro de que deseas finalizar este conteo? Esto bloqueará los cambios de escaneo y registrará el informe definitivo de conciliación.',
        async () => {
          try {
            await pb.update('niif_asset_inventories', id, { status: 'closed' });
            showToast('Conteo físico cerrado y conciliado con éxito', 'success');
            closeModal();
            const container = document.getElementById('activos-subtab-content');
            if (container) await renderSubTabInventario(container);
          } catch (err: any) {
            showToast('Error al cerrar conteo: ' + err.message, 'error');
          }
        },
        false
      );
    });

  } catch (err: any) {
    showToast('Error al cargar conteo: ' + err.message, 'error');
  }
};

(window as any).deleteInventory = async (id: string) => {
  confirmDialog(
    'Eliminar Conteo Físico',
    '¿Estás seguro de que deseas eliminar permanentemente este conteo de inventario? Se perderán las lecturas registradas.',
    async () => {
      try {
        await pb.delete('niif_asset_inventories', id);
        showToast('Conteo de inventario eliminado', 'success');
        const container = document.getElementById('activos-subtab-content');
        if (container) await renderSubTabInventario(container);
      } catch (err: any) {
        showToast('Error al eliminar: ' + err.message, 'error');
      }
    }
  );
};

/* ==========================================
   TAB 5: ARRENDAMIENTOS NIIF 16
   ========================================== */
async function renderTabArrendamientos(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando arrendamientos NIIF 16...</div>`;

  try {
    const leases = await pb.listAll('inmo_contracts', { filter: 'type="RECIBIDO"', sort: 'number', expand: 'lessor_id' });

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-base font-bold" style="color:#0D2137">Contratos de Arrendamiento (NIIF 16)</h4>
          <p class="text-xs text-gray-500">Valore los activos por derecho de uso y pasivos por arrendamiento descontando flujos de caja futuros.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-new-lease"><i class="fas fa-plus mr-1.5"></i>Registrar Contrato NIIF 16</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nro Contrato</th>
                <th>Descripción / Arrendador</th>
                <th>Plazo (Meses)</th>
                <th>Canon Mensual</th>
                <th>Tasa Implícita</th>
                <th>Valor Presente (VPN)</th>
                <th>Derecho de Uso Inicial</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${leases.length ? leases.map(l => {
                const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);
                return `
                  <tr class="hover:bg-gray-50/50">
                    <td><strong class="text-indigo-900">${esc(l.number)}</strong></td>
                    <td>
                      <div class="text-xs font-bold text-gray-800">${esc(l.description)}</div>
                      <div class="text-xxs text-gray-500">Arrendador: ${esc(l.expand?.lessor_id?.name || '—')}</div>
                      <div class="text-xxs text-gray-400">Inicio: ${esc(l.start_date || '—')}</div>
                    </td>
                    <td><span class="badge bg-indigo-50 text-indigo-700 font-bold">${l.term_months} meses</span></td>
                    <td class="font-semibold text-gray-800">${formatCOP(l.monthly_rent || 0)}</td>
                    <td><span class="text-xs font-medium text-gray-600">${l.implicit_interest_rate}% mensual</span></td>
                    <td class="font-bold text-emerald-700">${formatCOP(l.right_of_use_value || 0)}</td>
                    <td class="font-semibold text-gray-700">${formatCOP(l.lease_liability_value || 0)}</td>
                    <td>
                      <div class="flex gap-2">
                        <button class="btn btn-outline btn-sm" onclick="openContractModal('${esc(l.id)}', 'RECIBIDO')" title="Editar Contrato NIIF 16"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-outline btn-sm" onclick="viewAmortizationTable('${esc(l.id)}')" title="Tabla de Amortización"><i class="fas fa-table-list"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteLease('${esc(l.id)}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="8" class="text-center py-12 text-gray-400"><i class="fas fa-circle-info mr-1.5"></i>No hay contratos de arrendamiento bajo NIIF 16.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $('#btn-new-lease')?.addEventListener('click', () => (window as any).openContractModal('', 'RECIBIDO'));

    (window as any).viewAmortizationTable = async (id: string) => {
      const l = await pb.get('inmo_contracts', id);
      const rows = JSON.parse(l.amortization_table || '[]');
      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

      const body = `
        <div class="space-y-4">
          <div class="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs">
            <div><strong>Contrato:</strong> <span class="text-indigo-900 font-bold">${esc(l.number)}</span></div>
            <div><strong>VP Activo Derecho de Uso:</strong> <span class="text-indigo-900 font-bold">${formatCOP(l.right_of_use_value)}</span></div>
          </div>

          <div class="overflow-y-auto" style="max-height: 400px">
            <table class="data-table text-xxs">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Saldo Inicial Pasivo</th>
                  <th>Gasto Interés</th>
                  <th>Canon de Pago</th>
                  <th>Abono Principal</th>
                  <th>Saldo Final Pasivo</th>
                  <th>Depr. Derecho Uso</th>
                  <th>Costo en Libros Activo</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((r: any) => `
                  <tr>
                    <td class="text-center font-bold">${r.month}</td>
                    <td>${formatCOP(r.beg)}</td>
                    <td class="text-rose-600 font-medium">${formatCOP(r.interest)}</td>
                    <td class="font-semibold text-gray-800">${formatCOP(r.payment)}</td>
                    <td class="text-emerald-700 font-medium">${formatCOP(r.principal)}</td>
                    <td class="font-bold">${formatCOP(r.end)}</td>
                    <td>${formatCOP(r.dep)}</td>
                    <td class="text-indigo-900 font-semibold">${formatCOP(r.carrying)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      openModal('Tabla de Amortización NIIF 16', body, `
        <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
      `, true);
    };

    (window as any).deleteLease = async (id: string) => {
      confirmDialog('Eliminar Contrato', '¿Estás seguro de que deseas eliminar permanentemente este contrato NIIF 16?', async () => {
        try {
          await pb.delete('inmo_contracts', id);
          showToast('Contrato eliminado correctamente', 'success');
          loadActiveTab();
        } catch (err: any) {
          showToast('Error al eliminar: ' + err.message, 'error');
        }
      });
    };

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

/* ==========================================
   TAB 6: IMPUESTO DIFERIDO
   ========================================== */
async function renderTabImpuestoDiferido(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando diferencias temporarias para impuesto diferido...</div>`;

  try {
    // Para simplificar la conciliación del impuesto diferido, comparamos las diferencias
    // en los activos fijos registrados en el catálogo NIIF.
    const assets = await pb.listAll('niif_assets', { filter: 'active=true' });
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    // Tasa impositiva por defecto (ej. 35% en Colombia para comerciales, o tarifa específica)
    let taxRate = 35; 

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-base font-bold" style="color:#0D2137">Impuesto Diferido (Diferencias Temporarias NIC 12)</h4>
          <p class="text-xs text-gray-500">Conciliación automática de la base contable (NIIF) y base fiscal de los rubros patrimoniales.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-gray-600">Tarifa Renta Aplicable:</label>
          <input id="imp-rate" type="number" class="form-input text-xs w-20 text-center" value="${taxRate}"> <span class="text-xs">%</span>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Activo / Concepto</th>
                <th>Base Contable (NIIF)</th>
                <th>Base Fiscal (Tributaria)</th>
                <th>Diferencia Temporaria</th>
                <th>Tipo Diferencia</th>
                <th>Impuesto Diferido Sugerido</th>
                <th>Cuenta de Destino</th>
              </tr>
            </thead>
            <tbody>
              ${assets.length ? assets.map(a => {
                // Cálculo simplificado: asumimos 1 año de depreciación transcurrida
                // Base NIIF = Costo - 12 meses de depreciación NIIF
                const deprNIIF = (a.cost - (a.residual_value || 0)) / a.useful_life_niif * 12;
                const baseNIIF = Math.max(0, a.cost - deprNIIF);
                
                // Base Fiscal = Costo - 12 meses de depreciación Fiscal
                const deprFiscal = a.cost / a.useful_life_fiscal * 12;
                const baseFiscal = Math.max(0, a.cost - deprFiscal);

                const difference = baseNIIF - baseFiscal;
                const isTaxable = difference > 0; // Si base NIIF > base Fiscal en activo -> Impuesto diferido Pasivo
                const diffType = difference === 0 ? 'Sin diferencia' : (isTaxable ? 'Pasivo Diferido' : 'Activo Diferido');
                const badgeColor = difference === 0 ? 'badge-gray' : (isTaxable ? 'badge-orange' : 'badge-green');
                
                const factorRate = taxRate / 100;
                const deferredTaxValue = Math.abs(difference * factorRate);

                return `
                  <tr class="hover:bg-gray-50/50">
                    <td><strong class="text-indigo-900">${esc(a.code)}</strong> - <span class="text-xs font-bold text-gray-800">${esc(a.name)}</span></td>
                    <td class="font-semibold text-indigo-950">${formatCOP(baseNIIF)}</td>
                    <td class="font-semibold text-gray-500">${formatCOP(baseFiscal)}</td>
                    <td class="font-bold ${difference !== 0 ? 'text-indigo-900' : 'text-gray-400'}">${formatCOP(difference)}</td>
                    <td><span class="badge ${badgeColor}">${diffType}</span></td>
                    <td class="font-bold ${difference !== 0 ? 'text-amber-700' : 'text-gray-400'}">${formatCOP(deferredTaxValue)}</td>
                    <td class="text-xxs font-mono text-gray-500">${isTaxable ? '272505 (Pasivo Imp. Diferido)' : '171010 (Activo Imp. Diferido)'}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="7" class="text-center py-12 text-gray-400"><i class="fas fa-circle-info mr-1.5"></i>Registre activos fijos para proyectar diferencias temporarias.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $('#imp-rate')?.addEventListener('change', () => {
      taxRate = Number(($('#imp-rate') as HTMLInputElement)?.value || 35);
      // Re-calcular
      loadActiveTab();
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

/* ==========================================
   TAB 7: NOTAS Y REVELACIONES (REVELACIONES)
   ========================================== */
async function renderTabNotas(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando notas y revelaciones contables...</div>`;

  try {
    const currentPeriod = todayStr().slice(0, 7); // YYYY-MM
    const notes = await pb.listAll('financial_notes', { filter: `periodo="${currentPeriod}"`, sort: 'nota_num' });
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h4 class="text-base font-bold" style="color:#0D2137">Editor de Notas y Revelaciones Financieras</h4>
          <p class="text-xs text-gray-500">Redacte y apruebe las notas aclaratorias obligatorias para el cierre contable del periodo <strong>${currentPeriod}</strong>.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-new-note"><i class="fas fa-plus mr-1.5"></i>Redactar Nueva Nota</button>' : ''}
      </div>

      <div class="space-y-4">
        ${notes.length ? notes.map(n => `
          <div class="bg-white rounded-2xl border p-6 flex flex-col justify-between hover:shadow-md transition" style="border-color:#F0F0F0; box-shadow: 0 4px 12px rgba(0,0,0,0.01)">
            <div class="flex justify-between items-start border-b pb-3 mb-3" style="border-color:#EEF0F5">
              <div>
                <span class="text-xxs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Nota Nro. ${n.nota_num} - ${esc(n.tipo_informe)}</span>
                <h5 class="text-sm font-bold text-gray-800 mt-1">${esc(n.titulo)}</h5>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge ${n.revisado ? 'badge-green' : 'badge-orange'}">${n.revisado ? 'Revisada' : 'Pendiente'}</span>
                <button class="btn btn-outline btn-xs" onclick="openNoteForm('${esc(n.id)}')" title="Editar"><i class="fas fa-pencil"></i></button>
              </div>
            </div>
            <div class="text-xs text-gray-600 leading-relaxed whitespace-pre-line">${esc(n.contenido || '— Sin redactar aún —')}</div>
            ${n.sugerido ? `
              <div class="mt-4 p-3 rounded-lg border text-xxs text-amber-700 bg-amber-50/50" style="border-color:#FDE68A">
                <strong>Sugerencia del Sistema (Saldos):</strong><br>
                ${esc(n.sugerido)}
              </div>
            ` : ''}
          </div>
        `).join('') : `
          <div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0">
            <i class="fas fa-note-sticky text-gray-300 text-4xl mb-4"></i>
            <h4 class="text-base font-bold mb-2" style="color:#0D2137">No hay notas redactadas</h4>
            <p class="text-xs text-gray-500 max-width: 440px; margin: 0 auto">Cree las revelaciones explicativas para cada rubro contable de este periodo.</p>
          </div>
        `}
      </div>
    `;

    $('#btn-new-note')?.addEventListener('click', () => openNoteForm());

    (window as any).openNoteForm = async (id?: string) => {
      let note: any = null;
      if (id) {
        note = await pb.get('financial_notes', id);
      }

      // Cargar cuentas para relacionar la nota
      const accounts = await pb.listAll('accounts', { filter: 'level=2' });

      const title = id ? 'Editar Nota Financiera' : 'Redactar Nueva Nota';
      const body = `
        <form class="space-y-4" id="note-form">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Número de Nota <span class="text-red-500">*</span></label>
              <input id="nte-num" type="number" class="form-input" placeholder="Ej: 1" value="${note?.nota_num || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Estado Financiero <span class="text-red-500">*</span></label>
              <select id="nte-inf" class="form-input">
                <option value="ESF" ${note?.tipo_informe === 'ESF' ? 'selected' : ''}>Estado de Situación Financiera (ESF)</option>
                <option value="ER" ${note?.tipo_informe === 'ER' ? 'selected' : ''}>Estado de Resultados Integral (ERI)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Rubro Asociado</label>
              <select id="nte-code" class="form-input">
                <option value="">-- Seleccionar Cuenta Raíz --</option>
                ${accounts.map(a => `<option value="${esc(a.code)}" ${note?.cuenta_codigo === a.code ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Título de la Nota <span class="text-red-500">*</span></label>
            <input id="nte-title" class="form-input" placeholder="Ej: Efectivo y Equivalentes de Efectivo" value="${esc(note?.titulo || '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contenido / Revelación <span class="text-red-500">*</span></label>
            <textarea id="nte-content" class="form-input font-sans text-xs" rows="8" placeholder="Redacte el detalle explicativo..." required>${esc(note?.contenido || '')}</textarea>
          </div>
          <div class="form-group flex items-center gap-2">
            <input type="checkbox" id="nte-rev" ${note?.revisado ? 'checked' : ''} class="w-4 h-4" style="accent-color:#10B981">
            <label class="form-label mb-0" for="nte-rev">Marcar esta nota como revisada y aprobada</label>
          </div>
        </form>
      `;

      openModal(title, body, `
        <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="btn-save-note"><i class="fas fa-check mr-1.5"></i>Guardar Nota</button>
      `, true);

      // Evento auto-sugerir texto si cambia la cuenta
      $('#nte-code')?.addEventListener('change', async () => {
        const code = getSelectVal('nte-code');
        if (!code) return;
        
        try {
          // Consultar el saldo acumulado de esa cuenta raíz
          const accts = await pb.listAll('accounts', { filter: `code^="${code}" && active=true` });
          const ids = accts.map(a => `account_id="${a.id}"`).join(' || ');
          let sum = 0;
          if (ids) {
            const limitDate = getLastDayOfPeriod(currentPeriod);
            const lines = await pb.listAll('tx_lines', { 
              filter: `(${ids}) && tx_id.date <= "${limitDate} 23:59:59" && tx_id.status = "active"`
            });
            sum = lines.reduce((acc, curr) => acc + (Number(curr.debit || 0) - Number(curr.credit || 0)), 0);
          }

          const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);
          const sugText = `Al corte del periodo contable, el rubro presenta un saldo de ${formatCOP(sum)}, representado principalmente por los saldos conciliados en bancos y cuentas de ahorro. No existen restricciones de uso sobre estos recursos.`;
          
          const textEl = $('#nte-content') as HTMLTextAreaElement | null;
          if (textEl && !textEl.value) {
            textEl.value = sugText;
          }
        } catch (_) {}
      });

      $('#btn-save-note')?.addEventListener('click', async () => {
        const num = Number(getInputVal('nte-num'));
        const inf = getSelectVal('nte-inf');
        const code = getSelectVal('nte-code');
        const titleVal = getInputVal('nte-title').trim();
        const contentVal = getInputVal('nte-content').trim();
        const rev = !!document.getElementById('nte-rev')?.checked;

        if (!num || !inf || !titleVal || !contentVal) {
          return showToast('Por favor llene todos los campos obligatorios', 'warning');
        }

        const payload = {
          periodo: currentPeriod,
          nota_num: num,
          tipo_informe: inf,
          cuenta_codigo: code,
          titulo: titleVal,
          contenido: contentVal,
          revisado: rev,
          updated_by: pb.currentUser?.id || null
        };

        try {
          if (id) {
            await pb.update('financial_notes', id, payload);
            showToast('Nota financiera guardada', 'success');
          } else {
            await pb.create('financial_notes', payload);
            showToast('Nota financiera creada', 'success');
          }
          closeModal();
          loadActiveTab();
        } catch (err: any) {
          showToast('Error al guardar: ' + err.message, 'error');
        }
      });
    };

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

/* ==========================================
   TAB 8: ESTADOS FINANCIEROS NIIF (REPORTES)
   ========================================== */
async function renderTabReportes(c: HTMLElement) {
  const currentMonthDefault = todayStr().slice(0, 7);

  c.innerHTML = `
    <div class="bg-white rounded-2xl border p-6 mb-6" style="border-color:#F0F0F0">
      <h4 class="text-base font-bold mb-4" style="color:#0D2137"><i class="fas fa-filter text-indigo-500 mr-1.5"></i>Generar Estados Financieros NIIF</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
        <div class="form-group">
          <label class="form-label text-xxs font-bold text-gray-500">Periodo Contable</label>
          <input id="rep-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label text-xxs font-bold text-gray-500">Tipo de Reporte NIIF</label>
          <select id="rep-type" class="form-input">
            <option value="esf">Estado de Situación Financiera (ESF)</option>
            <option value="eri">Estado de Resultados Integral (ERI)</option>
            <option value="conciliacion">Conciliación Fiscal (NIIF vs Local)</option>
          </select>
        </div>
        <div class="form-group flex gap-2">
          <button class="btn btn-primary w-full" id="btn-niif-gen"><i class="fas fa-calculator mr-1"></i>Generar</button>
          <button class="btn btn-outline" id="btn-niif-pdf" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group">
          <span class="text-xxs text-gray-400 leading-normal block">Filtra automáticamente transacciones de tipo libro <strong>both</strong> y <strong>niif</strong>, excluyendo apuntes tributarios locales.</span>
        </div>
      </div>
    </div>

    <!-- Panel de Resultados de Reporte -->
    <div id="niif-report-output" class="bg-white rounded-2xl border p-6 min-height: 400px" style="border-color:#F0F0F0">
      <p class="text-xs text-gray-400 text-center py-24"><i class="fas fa-chart-column text-gray-300 text-3xl block mb-3"></i>Selecciona el reporte y presiona Generar.</p>
    </div>
  `;

  $('#btn-niif-gen')?.addEventListener('click', async () => {
    const month = getInputVal('rep-month');
    const type = getSelectVal('rep-type');
    const output = document.getElementById('niif-report-output');
    if (!output) return;

    output.innerHTML = `<div class="p-12 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando base de datos NIIF...</div>`;

    try {
      // 1. Cargar todas las cuentas y apuntes contables optimizados para el periodo
      const lastDay = getLastDayOfPeriod(month);
      const [accounts, txLines] = await Promise.all([
        pb.listAll('accounts', { filter: 'active=true' }),
        pb.listAll('tx_lines', { 
          filter: `tx_id.date <= "${lastDay} 23:59:59" && tx_id.status = "active"`,
          expand: 'tx_id'
        })
      ]);

      // 2. Determinar saldos diferenciados
      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);
      
      const buildBalances = (bookFilter: 'niif' | 'local') => {
        const balances = Object.fromEntries(accounts.map(a => [a.id, 0]));

        for (const l of txLines) {
          const tx = l.expand?.tx_id;
          if (!tx) continue;

          const book = tx.book_type || 'both';
          if (bookFilter === 'niif') {
            if (book === 'local') continue; // excluir local
          } else {
            if (book === 'niif') continue; // excluir niif
          }

          balances[l.account_id] = (balances[l.account_id] || 0) + (Number(l.debit || 0) - Number(l.credit || 0));
        }
        return balances;
      };

      if (type === 'esf') {
        const niifBals = buildBalances('niif');
        // Agrupar cuentas de nivel 1 o por rubro NIIF mapeado
        const grouped: Record<string, number> = {};
        
        accounts.forEach(a => {
          if (a.niif_classification) {
            grouped[a.niif_classification] = (grouped[a.niif_classification] || 0) + (niifBals[a.id] || 0);
          }
        });

        output.innerHTML = `
          <div class="space-y-4">
            <div class="text-center pb-4 border-b" style="border-color:#EEF0F5">
              <h5 class="text-base font-bold text-gray-900">Estado de Situación Financiera NIIF</h5>
              <div class="text-xs text-gray-500">Periodo de Reporte: ${month} | Estándares Internacionales</div>
            </div>

            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Rubro NIIF / Clasificación Financiera</th>
                    <th class="text-right">Saldo en Libros NIIF</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(grouped).map(([cls, bal]) => `
                    <tr>
                      <td><span class="text-xs font-bold text-gray-800">${esc(cls)}</span></td>
                      <td class="text-right font-semibold ${bal < 0 ? 'text-red-600' : 'text-gray-900'}">${formatCOP(bal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (type === 'eri') {
        const niifBals = buildBalances('niif');
        // Ingresos y Gastos
        const grouped: Record<string, number> = {};
        
        accounts.forEach(a => {
          if (a.niif_classification && (a.code.startsWith('4') || a.code.startsWith('5') || a.code.startsWith('6'))) {
            grouped[a.niif_classification] = (grouped[a.niif_classification] || 0) + (niifBals[a.id] || 0);
          }
        });

        output.innerHTML = `
          <div class="space-y-4">
            <div class="text-center pb-4 border-b" style="border-color:#EEF0F5">
              <h5 class="text-base font-bold text-gray-900">Estado de Resultados Integral NIIF</h5>
              <div class="text-xs text-gray-500">Periodo de Reporte: ${month}</div>
            </div>

            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Grupo / Concepto</th>
                    <th class="text-right">Monto NIIF</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(grouped).map(([cls, bal]) => `
                    <tr>
                      <td><span class="text-xs font-bold text-gray-800">${esc(cls)}</span></td>
                      <td class="text-right font-semibold ${bal < 0 ? 'text-red-600' : 'text-gray-900'}">${formatCOP(bal)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        // Conciliación NIIF vs Local
        const niifBals = buildBalances('niif');
        const locBals = buildBalances('local');

        output.innerHTML = `
          <div class="space-y-4">
            <div class="text-center pb-4 border-b" style="border-color:#EEF0F5">
              <h5 class="text-base font-bold text-gray-900">Conciliación Contable NIIF vs Fiscal</h5>
              <div class="text-xs text-gray-500">Comparativo al corte de: ${month}</div>
            </div>

            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Cuenta PUC</th>
                    <th>Nombre Cuenta</th>
                    <th class="text-right">Base Fiscal (Local)</th>
                    <th class="text-right">Base NIIF (Internacional)</th>
                    <th class="text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  ${accounts.filter(a => a.level <= 4).map(a => {
                    const lBal = locBals[a.id] || 0;
                    const nBal = niifBals[a.id] || 0;
                    const diff = nBal - lBal;
                    if (lBal === 0 && nBal === 0) return ''; // ocultar vacías

                    return `
                      <tr class="hover:bg-gray-50/50">
                        <td><strong>${esc(a.code)}</strong></td>
                        <td><span class="text-xs text-gray-700">${esc(a.name)}</span></td>
                        <td class="text-right text-gray-600">${formatCOP(lBal)}</td>
                        <td class="text-right text-indigo-950 font-semibold">${formatCOP(nBal)}</td>
                        <td class="text-right font-bold ${diff !== 0 ? 'text-amber-600' : 'text-gray-500'}">${formatCOP(diff)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      
      const pdfBtn = document.getElementById('btn-niif-pdf') as HTMLButtonElement | null;
      if (pdfBtn) pdfBtn.disabled = false;

    } catch (err: any) {
      output.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error al consultar saldos: ${esc(err.message)}</div>`;
    }
  });
}

function todayStr(): string {
  return (window as any).getColombiaDateStr();
}

function getLastDayOfPeriod(period: string): string {
  if (!period) return todayStr();
  const parts = period.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (isNaN(year) || isNaN(month)) return period + '-31'; // safety fallback
  const lastDay = new Date(year, month, 0).getDate();
  return `${period}-${String(lastDay).padStart(2, '0')}`;
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderNIIF = renderNIIF;
(window as any).renderTabActivosSidebar = async (c: HTMLElement, subTab: string) => {
  ACTIVOS_ACTIVE_TAB = subTab;
  await renderTabActivos(c);
};
