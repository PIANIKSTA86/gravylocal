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
  is_depreciable?: boolean;
  is_immediate_depreciation?: boolean;
  initial_depreciation_niif?: number;
  initial_depreciation_fiscal?: number;
  accumulated_depreciation_niif?: number;
  accumulated_depreciation_fiscal?: number;
  last_depreciation_period?: string;
  category_id?: string;
  parent_asset_id?: string;
  provider_id?: string;
  invoice_number?: string;
  purchase_date?: string;
  start_service_date?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  photo_url?: string;
  qr_code?: string;
  status?: string;
  expand?: any;
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

/* ==========================================
   MOTOR NORMATIVO DE DEPRECIACIÓN Y UVT (E.T. / DUR 1625 / NIC 16)
   ========================================== */
const UVT_BY_YEAR: Record<number, number> = {
  2022: 38004,
  2023: 42412,
  2024: 47065,
  2025: 49799,
  2026: 52374,
  2027: 55000
};

const ASSET_MAX_IMMEDIATE_UVT = 50; // Art. 1.2.1.18.5 DUR 1625 de 2016 (50 UVT)

function getUvtForDateOrYear(dateOrYear?: string | number | null, customCompanyUvt?: number): { year: number; uvtValue: number; limit50Uvt: number } {
  let year = new Date().getFullYear();
  if (typeof dateOrYear === 'number' && dateOrYear > 2000) {
    year = dateOrYear;
  } else if (typeof dateOrYear === 'string' && dateOrYear.trim()) {
    const match = dateOrYear.trim().match(/^(\d{4})/);
    if (match) year = Number(match[1]);
  }
  const uvtValue = (customCompanyUvt && customCompanyUvt > 0 && year === 2026)
    ? customCompanyUvt
    : (UVT_BY_YEAR[year] || customCompanyUvt || 52374);
  return {
    year,
    uvtValue,
    limit50Uvt: uvtValue * ASSET_MAX_IMMEDIATE_UVT
  };
}

async function fetchConfiguredCompanyUvt(): Promise<number> {
  try {
    const rawNominaCfg = await (window as any).API?.getSetting?.('nomina_accounting_config');
    if (rawNominaCfg) {
      const parsed = typeof rawNominaCfg === 'string' ? JSON.parse(rawNominaCfg) : rawNominaCfg;
      const val = Number(parsed?.company_rules?.uvt_value || 0);
      if (val > 0) return val;
    }
    const rawUvt = await (window as any).API?.getSetting?.('uvt_value');
    if (Number(rawUvt) > 0) return Number(rawUvt);
  } catch (_) {}
  return 52374;
}

function getNextPeriod(period: string): string {
  const [yr, mo] = period.split('-').map(Number);
  if (isNaN(yr) || isNaN(mo)) return period;
  if (mo >= 12) {
    return `${yr + 1}-01`;
  }
  return `${yr}-${String(mo + 1).padStart(2, '0')}`;
}

function extractAssetAcquisitionPeriod(a: any): string | null {
  const rawDate = String(a?.purchase_date || a?.start_service_date || a?.invoice_date || '').trim();
  if (!rawDate) return null;
  const m = rawDate.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  return null;
}

/**
 * Determina el primer periodo (YYYY-MM) en que el activo debe iniciar depreciación:
 * - Si tiene Depreciación Inmediata (<= 50 UVT): inicia en el MISMO mes de compra (100% en 1 cuota).
 * - Si tiene Depreciación Estándar: inicia a mes completo en el MES SIGUIENTE al de su compra.
 */
function getAssetFirstDepreciationPeriod(a: any): string | null {
  if (a?.is_depreciable === false) return null;
  const acqPeriod = extractAssetAcquisitionPeriod(a);
  if (!acqPeriod) return null;
  if (a?.is_immediate_depreciation === true) {
    return acqPeriod;
  }
  return getNextPeriod(acqPeriod);
}

function evaluateAssetDepreciationForPeriod(a: any, targetPeriod: string) {
  const cost = Number(a?.cost || 0);
  const isImmediate = a?.is_immediate_depreciation === true;
  const residual = isImmediate ? 0 : Number(a?.residual_value || 0);
  const acqDateStr = a?.purchase_date || a?.start_service_date || '';
  const acqPeriod = extractAssetAcquisitionPeriod(a);
  const firstEligiblePeriod = getAssetFirstDepreciationPeriod(a);

  const maxNIIF = Math.max(0, cost - residual);
  const maxFiscal = Math.max(0, cost);
  const prevAccumNIIF = Math.min(maxNIIF, Math.max(Number(a?.initial_depreciation_niif || 0), Number(a?.accumulated_depreciation_niif || 0)));
  const prevAccumFiscal = Math.min(maxFiscal, Math.max(Number(a?.initial_depreciation_fiscal || 0), Number(a?.accumulated_depreciation_fiscal || 0)));
  const remainingNIIF = Math.max(0, maxNIIF - prevAccumNIIF);
  const remainingFiscal = Math.max(0, maxFiscal - prevAccumFiscal);

  if (a?.is_depreciable === false) {
    return {
      eligible: false,
      reasonCode: 'non_depreciable',
      reasonLabel: 'Catalogado como No Depreciable (NIC 16)',
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod: null,
      isImmediate: false,
      deprNIIF: 0,
      deprFiscal: 0,
      prevAccumNIIF,
      prevAccumFiscal,
      remainingNIIF: 0,
      remainingFiscal: 0,
      maxNIIF,
      maxFiscal
    };
  }

  // 1. Validar fecha de compra / entrada frente al periodo liquidado
  if (firstEligiblePeriod && targetPeriod < firstEligiblePeriod) {
    const reasonLabel = isImmediate
      ? `Comprado en ${acqDateStr || acqPeriod} — Depreciación inmediata aplica en ${firstEligiblePeriod}`
      : (targetPeriod === acqPeriod
          ? `Comprado en ${acqDateStr || acqPeriod} (mismo mes) — Inicia depreciación en ${firstEligiblePeriod}`
          : `Comprado en ${acqDateStr || acqPeriod} (fecha posterior) — Inicia depreciación en ${firstEligiblePeriod}`);
    return {
      eligible: false,
      reasonCode: targetPeriod < (acqPeriod || '') ? 'future_purchase' : 'same_month_purchase',
      reasonLabel,
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod,
      isImmediate,
      deprNIIF: 0,
      deprFiscal: 0,
      prevAccumNIIF,
      prevAccumFiscal,
      remainingNIIF,
      remainingFiscal,
      maxNIIF,
      maxFiscal
    };
  }

  // 2. Validar si el activo ya fue depreciado o tiene corte de saldo inicial igual o posterior al periodo objetivo
  const lastPeriod = (a?.last_depreciation_period || '').trim();
  if (lastPeriod && /^\d{4}-\d{2}$/.test(lastPeriod) && targetPeriod <= lastPeriod) {
    return {
      eligible: false,
      reasonCode: 'already_closed_period',
      reasonLabel: `Ya registra cierre/depreciación hasta el periodo ${lastPeriod}`,
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod,
      isImmediate,
      deprNIIF: 0,
      deprFiscal: 0,
      prevAccumNIIF,
      prevAccumFiscal,
      remainingNIIF,
      remainingFiscal,
      maxNIIF,
      maxFiscal
    };
  }

  // 3. Calcular cuotas del periodo (100% si es Depreciación Inmediata <= 50 UVT, o cuota nominal según vida útil)
  const lifeNIIF = isImmediate ? 1 : (Number(a?.useful_life_niif) || 1);
  const lifeFiscal = isImmediate ? 1 : (Number(a?.useful_life_fiscal) || 1);

  const nominalNIIF = isImmediate ? maxNIIF : (maxNIIF / lifeNIIF);
  const nominalFiscal = isImmediate ? maxFiscal : (maxFiscal / lifeFiscal);

  const deprNIIF = Math.min(nominalNIIF, remainingNIIF);
  const deprFiscal = Math.min(nominalFiscal, remainingFiscal);

  if (deprNIIF <= 0 && deprFiscal <= 0) {
    return {
      eligible: false,
      reasonCode: 'fully_depreciated',
      reasonLabel: 'Vida útil agotada (100% depreciado en libros)',
      acqDateStr,
      acqPeriod,
      firstEligiblePeriod,
      isImmediate,
      deprNIIF: 0,
      deprFiscal: 0,
      prevAccumNIIF,
      prevAccumFiscal,
      remainingNIIF: 0,
      remainingFiscal: 0,
      maxNIIF,
      maxFiscal
    };
  }

  return {
    eligible: true,
    reasonCode: 'ok',
    reasonLabel: isImmediate ? 'Depreciación Inmediata (<= 50 UVT - 100%)' : 'Cuota mensual ordinaria',
    acqDateStr,
    acqPeriod,
    firstEligiblePeriod,
    isImmediate,
    deprNIIF,
    deprFiscal,
    prevAccumNIIF,
    prevAccumFiscal,
    remainingNIIF,
    remainingFiscal,
    maxNIIF,
    maxFiscal
  };
}

(window as any).getUvtForDateOrYear = getUvtForDateOrYear;
(window as any).fetchConfiguredCompanyUvt = fetchConfiguredCompanyUvt;
(window as any).evaluateAssetDepreciationForPeriod = evaluateAssetDepreciationForPeriod;
(window as any).getAssetFirstDepreciationPeriod = getAssetFirstDepreciationPeriod;

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
            <td><strong style="color:#7C3AED">${esc(a.code)}</strong></td>
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

    const getAssetDeprInfo = (a: any) => {
      const isDepr = a.is_depreciable !== false;
      const isImmediate = isDepr && a.is_immediate_depreciation === true;
      const cost = Number(a.cost || 0);
      const residual = isImmediate ? 0 : Number(a.residual_value || 0);
      const firstEligiblePeriod = getAssetFirstDepreciationPeriod(a);

      if (!isDepr) {
        return {
          isDepreciable: false,
          isImmediate: false,
          firstEligiblePeriod: null,
          accumNIIF: 0,
          accumFiscal: 0,
          netNIIF: cost,
          netFiscal: cost,
          variance: 0,
          deprNIIFMonthly: 0,
          deprFiscalMonthly: 0,
          lastPeriod: null,
          monthsPending: 0,
          pendingNIIFAmount: 0,
          status: 'no_depr'
        };
      }

      const initNIIF = Number(a.initial_depreciation_niif || 0);
      const initFiscal = Number(a.initial_depreciation_fiscal || 0);
      const postedNIIF = Number(a.accumulated_depreciation_niif || 0);
      const postedFiscal = Number(a.accumulated_depreciation_fiscal || 0);

      const maxNIIF = Math.max(0, cost - residual);
      const maxFiscal = cost;

      const deprNIIFMonthly = isImmediate ? maxNIIF : ((cost - residual) / (a.useful_life_niif || 1));
      const deprFiscalMonthly = isImmediate ? maxFiscal : (cost / (a.useful_life_fiscal || 1));

      // Saldo REAL asentado en libros contables (no proyección en caliente)
      const accumNIIF = Math.min(maxNIIF, Math.max(initNIIF, postedNIIF));
      const accumFiscal = Math.min(maxFiscal, Math.max(initFiscal, postedFiscal));

      const netNIIF = Math.max(0, cost - accumNIIF - (a.impairment || 0));
      const netFiscal = Math.max(0, cost - accumFiscal);
      const variance = Math.abs(accumNIIF - accumFiscal);

      // Diagnóstico operativo frente a la fecha de consulta
      const lastPeriod = a.last_depreciation_period || null;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1..12
      const currentPeriod = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

      let monthsPending = 0;
      let isScheduledFuture = false;

      if (accumNIIF >= maxNIIF) {
        monthsPending = 0;
      } else if (firstEligiblePeriod && currentPeriod < firstEligiblePeriod) {
        // El activo se compró en el mes actual o en una fecha futura: su depreciación inicia en firstEligiblePeriod
        monthsPending = 0;
        isScheduledFuture = true;
      } else if (lastPeriod && /^\d{4}-\d{2}$/.test(lastPeriod)) {
        const [lYr, lMo] = lastPeriod.split('-').map(Number);
        monthsPending = Math.max(0, (currentYear - lYr) * 12 + (currentMonth - lMo));
      } else if (firstEligiblePeriod && /^\d{4}-\d{2}$/.test(firstEligiblePeriod)) {
        const [fYr, fMo] = firstEligiblePeriod.split('-').map(Number);
        monthsPending = Math.max(0, (currentYear - fYr) * 12 + (currentMonth - fMo) + 1);
      }

      if (isImmediate && monthsPending > 0) {
        monthsPending = 1;
      }

      const pendingNIIFAmount = Math.min(Math.max(0, maxNIIF - accumNIIF), monthsPending * deprNIIFMonthly);

      let status = 'up_to_date';
      if (isScheduledFuture) {
        status = 'scheduled';
      } else if (!lastPeriod && postedNIIF === 0 && initNIIF === 0 && accumNIIF < maxNIIF) {
        status = 'never_run';
      } else if (monthsPending > 0) {
        status = 'pending';
      }

      return {
        isDepreciable: true,
        isImmediate,
        firstEligiblePeriod,
        accumNIIF,
        accumFiscal,
        netNIIF,
        netFiscal,
        variance,
        deprNIIFMonthly,
        deprFiscalMonthly,
        lastPeriod,
        monthsPending,
        pendingNIIFAmount,
        status
      };
    };

    let totalCost = 0;
    let totalDeprNIIF = 0;
    let totalDeprFiscal = 0;
    let assetsWithPendingDepr = 0;
    let totalPendingAmount = 0;

    assets.forEach(a => {
      if (a.status === 'retired' || a.status === 'sold' || a.status === 'lost') return;
      totalCost += (a.cost || 0);
      const d = getAssetDeprInfo(a);
      totalDeprNIIF += d.accumNIIF;
      totalDeprFiscal += d.accumFiscal;
      if (d.isDepreciable && d.monthsPending > 0) {
        assetsWithPendingDepr++;
        totalPendingAmount += d.pendingNIIFAmount;
      }
    });

    const netBookValueNIIF = totalCost - totalDeprNIIF;
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

    c.innerHTML = `
      <!-- Panel de Indicadores Premium -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card flex flex-col justify-between" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
          <div>
            <span class="text-[11px] font-bold text-purple-900/75 uppercase tracking-wider block mb-1">Costo Histórico PPE</span>
            <h3 class="text-xl font-extrabold text-purple-950">${formatCOP(totalCost)}</h3>
          </div>
          <span class="text-[11px] text-emerald-700 font-semibold mt-2"><i class="fas fa-arrow-trend-up mr-1"></i>Activos capitalizados</span>
        </div>

        <div class="stat-card flex flex-col justify-between" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
          <div>
            <span class="text-[11px] font-bold text-purple-900/75 uppercase tracking-wider block mb-1">Valor Neto en Libros</span>
            <h3 class="text-xl font-extrabold text-purple-950">${formatCOP(netBookValueNIIF)}</h3>
          </div>
          <span class="text-[11px] text-purple-700/80 mt-2 font-medium">NIIF (Costo - Depr. Asentada)</span>
        </div>

        <div class="stat-card flex flex-col justify-between" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
          <div>
            <span class="text-[11px] font-bold text-purple-900/75 uppercase tracking-wider block mb-1">Depreciación Acumulada</span>
            <div class="text-xs font-semibold text-purple-950">NIIF: ${formatCOP(totalDeprNIIF)}</div>
            <div class="text-xs text-purple-800/80">Fiscal: ${formatCOP(totalDeprFiscal)}</div>
          </div>
          <span class="text-[11px] text-emerald-700 font-semibold mt-1"><i class="fas fa-book-bookmark mr-1"></i>Saldos causados en libros</span>
        </div>

        <div class="stat-card flex flex-col justify-between" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
          <div>
            <span class="text-[11px] font-bold text-purple-900/75 uppercase tracking-wider block mb-1">Control de Causación</span>
            <h3 class="text-xl font-extrabold ${assetsWithPendingDepr > 0 ? 'text-amber-700' : 'text-emerald-700'}">${assetsWithPendingDepr} con rezago</h3>
          </div>
          <span class="text-[11px] ${assetsWithPendingDepr > 0 ? 'text-amber-600' : 'text-emerald-600'} font-semibold mt-2">
            <i class="fas ${assetsWithPendingDepr > 0 ? 'fa-clock' : 'fa-circle-check'} mr-1"></i>${assetsWithPendingDepr > 0 ? `${formatCOP(totalPendingAmount)} pendiente` : 'Todos los activos al día'}
          </span>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div class="text-xs font-bold text-gray-700"><i class="fas fa-filter text-indigo-500 mr-1.5"></i>Búsqueda y Filtros</div>
          <div class="flex items-center gap-2">
            <button class="btn btn-outline btn-sm" id="btn-export-excel-assets" title="Exportar a Excel"><i class="fas fa-file-excel mr-1.5" style="color:#10B981"></i>Excel</button>
            <button class="btn btn-outline btn-sm" id="btn-export-pdf-assets" title="Exportar a PDF"><i class="fas fa-file-pdf mr-1.5" style="color:#EF4444"></i>PDF</button>
            ${can('canWrite') ? `
              <button class="btn btn-outline btn-sm" id="btn-import-excel-assets" title="Cargar catálogo desde Excel o CSV"><i class="fas fa-file-import mr-1.5" style="color:#059669"></i>Importar Excel</button>
              <button class="btn btn-primary btn-sm" id="btn-new-asset"><i class="fas fa-plus mr-1.5"></i>Nuevo Activo Fijo</button>
            ` : ''}
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
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
          <select id="ast-filter-depreciable" class="form-input text-xs">
            <option value="">Todos (Depreciables y No)</option>
            <option value="depreciable">Solo Depreciables</option>
            <option value="immediate_50uvt">Solo Menor Cuantía (≤ 50 UVT)</option>
            <option value="no_depreciable">Solo No Depreciables</option>
          </select>
          <select id="ast-filter-depr-status" class="form-input text-xs">
            <option value="">Causación (Todos)</option>
            <option value="up_to_date">Al Día</option>
            <option value="pending">Con Rezago / Pendiente</option>
            <option value="never_run">Sin Causar</option>
            <option value="scheduled">Programado (Compra Mes Actual/Futuro)</option>
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
                <th>Causación NIIF</th>
                <th>Centro Costo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${assets.length ? assets.map(a => {
                const cat = a.expand?.category_id;
                const cc = a.expand?.cost_center_id;
                const d = getAssetDeprInfo(a);

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

                let causacionBadge = '<span class="text-gray-400 text-xxs font-medium">N/A</span>';
                if (d.isDepreciable) {
                  if (d.status === 'scheduled') {
                    causacionBadge = `
                      <div class="flex flex-col gap-0.5">
                        <span class="badge badge-purple text-[9px] font-bold" title="Según fecha de compra (${esc(a.purchase_date || a.start_service_date || '')}), inicia depreciación en ${esc(d.firstEligiblePeriod || '')}">
                          <i class="fas fa-calendar-day mr-0.5"></i>Inicia ${esc(d.firstEligiblePeriod || '')}
                        </span>
                      </div>
                    `;
                  } else if (d.status === 'pending') {
                    causacionBadge = `
                      <div class="flex flex-col gap-0.5">
                        <span class="text-xxs font-bold text-gray-700">${esc(d.lastPeriod || 'Sin causar')}</span>
                        <span class="badge badge-orange text-[9px] font-bold" title="${d.monthsPending} mes(es) pendientes por causar (estimado pendiente: ${formatCOP(d.pendingNIIFAmount)})">
                          <i class="fas fa-clock mr-0.5"></i>${d.monthsPending}m pend.
                        </span>
                      </div>
                    `;
                  } else if (d.status === 'never_run') {
                    causacionBadge = `
                      <div class="flex flex-col gap-0.5">
                        <span class="badge badge-blue text-[9px] font-bold" title="Nunca se ha corrido depreciación para este activo">
                          <i class="fas fa-circle-exclamation mr-0.5"></i>Sin causar
                        </span>
                        ${d.monthsPending > 0 ? `<span class="text-[9px] text-amber-700 font-semibold">${d.monthsPending}m pend.</span>` : ''}
                      </div>
                    `;
                  } else {
                    causacionBadge = `
                      <div class="flex flex-col gap-0.5">
                        <span class="text-xxs font-bold text-emerald-800">${esc(d.lastPeriod || 'Al día')}</span>
                        <span class="badge badge-green text-[9px] font-bold"><i class="fas fa-check mr-0.5"></i>Al día</span>
                      </div>
                    `;
                  }
                }

                return `
                  <tr class="hover:bg-gray-50/50" data-cat="${esc(a.category_id || '')}" data-cc="${esc(a.cost_center_id || '')}" data-status="${esc(a.status || 'active')}" data-depreciable="${a.is_depreciable !== false ? '1' : '0'}" data-immediate="${a.is_immediate_depreciation ? '1' : '0'}" data-deprstatus="${d.status}" data-search="${esc(a.code.toLowerCase())} ${esc(a.name.toLowerCase())} ${esc(a.brand?.toLowerCase() || '')}">
                    <td><strong class="text-indigo-900">${esc(a.code)}</strong></td>
                    <td>
                      <div class="text-xs font-bold text-gray-800">${esc(a.name)}</div>
                      ${a.brand ? `<div class="text-xxs text-gray-400">${esc(a.brand)} ${esc(a.model || '')}</div>` : ''}
                      ${(a.purchase_date || a.start_service_date) ? `<div class="text-[10px] text-indigo-600/80 font-medium"><i class="fas fa-calendar-check mr-1"></i>Compra: ${esc(a.purchase_date || a.start_service_date)}</div>` : ''}
                    </td>
                    <td><span class="text-xs text-gray-600 font-semibold">${cat ? esc(cat.name) : '—'}</span></td>
                    <td class="font-semibold text-gray-800">${formatCOP(a.cost)}</td>
                    <td>${d.isDepreciable ? formatCOP(d.isImmediate ? 0 : (a.residual_value || 0)) : '<span class="text-gray-400 text-xxs font-medium">N/A</span>'}</td>
                    <td class="text-gray-700 font-semibold">${formatCOP(d.accumNIIF)}</td>
                    <td class="font-bold text-indigo-950">${formatCOP(d.netNIIF)}</td>
                    <td>${causacionBadge}</td>
                    <td><span class="text-xxs text-gray-500">${cc ? `${esc(cc.code)} - ${esc(cc.name)}` : '—'}</span></td>
                    <td>
                      <div class="flex flex-col gap-1 items-start">
                        ${statusHtml}
                        ${a.is_depreciable !== false
                          ? (a.is_immediate_depreciation
                              ? '<span class="badge badge-purple text-[10px]" title="Menor cuantía <= 50 UVT (Art. 1.2.1.18.5 DUR 1625): Depreciación inmediata 100%"><i class="fas fa-bolt mr-1"></i>≤ 50 UVT (100%)</span>'
                              : '<span class="badge badge-green text-[10px]" title="Activo sujeto a depreciación contable"><i class="fas fa-calculator mr-1"></i>Depreciable</span>')
                          : '<span class="badge badge-blue text-[10px]" style="background:#E0E7FF;color:#3730A3;border:1px solid #C7D2FE" title="Activo no depreciable (NIC 16: terrenos, obras, etc.)"><i class="fas fa-ban mr-1"></i>No Depr.</span>'}
                      </div>
                    </td>
                    <td>
                      <div class="flex gap-1.5 items-center">
                        <button class="btn btn-outline btn-xs" onclick="viewAssetDetail('${esc(a.id)}')" title="Ver Hoja de Vida"><i class="fas fa-eye"></i></button>
                        ${can('canWrite') ? `
                          <button class="btn btn-outline btn-xs" onclick="toggleActivoDepreciable('${esc(a.id)}', ${a.is_depreciable !== false ? 'false' : 'true'})" title="${a.is_depreciable !== false ? 'Marcar como No Depreciable' : 'Marcar como Depreciable'}" style="${a.is_depreciable !== false ? 'color:#D97706;border-color:#F59E0B' : 'color:#059669;border-color:#A7F3D0'}">
                            <i class="fas ${a.is_depreciable !== false ? 'fa-ban' : 'fa-check'}"></i>
                          </button>
                          <button class="btn btn-outline btn-xs" onclick="openAssetForm('${esc(a.id)}')" title="Editar Ficha"><i class="fas fa-pencil"></i></button>
                        ` : ''}
                        ${can('canDelete') ? `<button class="btn btn-danger btn-xs" onclick="deleteAsset('${esc(a.id)}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="11" class="text-center py-12 text-gray-400"><i class="fas fa-info-circle mr-1.5"></i>No hay activos fijos en el catálogo.</td></tr>'}
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
      const deprFilter = ($('#ast-filter-depreciable') as HTMLSelectElement)?.value || '';
      const deprStatusFilter = ($('#ast-filter-depr-status') as HTMLSelectElement)?.value || '';

      $$('#assets-table tbody tr').forEach((tr: HTMLElement) => {
        const searchVal = tr.dataset.search || '';
        const trCat = tr.dataset.cat || '';
        const trCc = tr.dataset.cc || '';
        const trStatus = tr.dataset.status || 'active';
        const trDepr = tr.dataset.depreciable || '1';
        const trImm = tr.dataset.immediate || '0';
        const trDeprStatus = tr.dataset.deprstatus || '';

        const matchSearch = !q || searchVal.includes(q);
        const matchCat = !cat || trCat === cat;
        const matchCc = !cc || trCc === cc;
        const matchStatus = !status || trStatus === status;
        const matchDepr = !deprFilter || (deprFilter === 'depreciable' ? trDepr === '1' : (deprFilter === 'immediate_50uvt' ? trImm === '1' : trDepr === '0'));
        const matchDeprStatus = !deprStatusFilter || trDeprStatus === deprStatusFilter;

        tr.style.display = (matchSearch && matchCat && matchCc && matchStatus && matchDepr && matchDeprStatus) ? '' : 'none';
      });
    };

    $('#ast-q')?.addEventListener('input', debounce(filter, 200));
    $('#ast-filter-cat')?.addEventListener('change', filter);
    $('#ast-filter-cc')?.addEventListener('change', filter);
    $('#ast-filter-status')?.addEventListener('change', filter);
    $('#ast-filter-depreciable')?.addEventListener('change', filter);
    $('#ast-filter-depr-status')?.addEventListener('change', filter);

    $('#btn-new-asset')?.addEventListener('click', () => (window as any).openAssetForm());
    $('#btn-import-excel-assets')?.addEventListener('click', () => {
      if (typeof (window as any)._openMassFixedAssetsImportModal === 'function') {
        (window as any)._openMassFixedAssetsImportModal({
          onComplete: async () => {
            const container = document.getElementById('activos-subtab-content');
            if (container) await renderSubTabCatalogo(container);
          }
        });
      } else {
        showToast('Utilidad de importación de activos no disponible', 'error');
      }
    });

    // ── Exportar a Excel ──────────────────────────────────────────────────
    document.getElementById('btn-export-excel-assets')?.addEventListener('click', () => {
      const rows = assets.map(a => {
        const cat = a.expand?.category_id;
        const cc  = a.expand?.cost_center_id;
        const d = getAssetDeprInfo(a);
        const statusMap: Record<string, string> = { active: 'Activo', suspended: 'Suspendido', in_repair: 'En Reparación', retired: 'Retirado', sold: 'Vendido', lost: 'Perdido', obsolete: 'Obsoleto' };
        return {
          placa: a.code,
          nombre: a.name,
          marca: a.brand || '',
          modelo: a.model || '',
          serial: a.serial_number || '',
          categoria: cat ? `${cat.code} - ${cat.name}` : '',
          es_depreciable: a.is_depreciable !== false ? 'Sí' : 'No',
          depr_inmediata_50uvt: a.is_immediate_depreciation ? 'Sí' : 'No',
          costo: a.cost,
          v_residual_niif: a.is_depreciable !== false ? (a.is_immediate_depreciation ? 0 : (a.residual_value || 0)) : 0,
          v_util_niif: a.is_depreciable !== false ? (a.is_immediate_depreciation ? 1 : (a.useful_life_niif || 0)) : 0,
          v_util_fiscal: a.is_depreciable !== false ? (a.is_immediate_depreciation ? 1 : (a.useful_life_fiscal || 0)) : 0,
          depr_acum_niif: d.accumNIIF,
          depr_acum_fiscal: d.accumFiscal,
          v_neto_libros: d.netNIIF,
          dif_temporaria: d.variance,
          ultimo_periodo: d.lastPeriod || (d.status === 'scheduled' ? `Inicia ${d.firstEligiblePeriod}` : (d.isDepreciable ? 'Sin causar' : 'N/A')),
          meses_pendientes: d.monthsPending,
          depr_pendiente_niif: d.pendingNIIFAmount,
          centro_costo: cc ? `${cc.code} - ${cc.name}` : '',
          estado: statusMap[a.status] || a.status || 'Activo',
          ubicacion: a.location || '',
          fecha_compra: a.purchase_date || '',
          fecha_servicio: a.start_service_date || '',
        };
      });
      const headers = [
        { key: 'placa',               label: 'Placa / Código' },
        { key: 'nombre',              label: 'Nombre del Activo' },
        { key: 'marca',               label: 'Marca' },
        { key: 'modelo',              label: 'Modelo' },
        { key: 'serial',              label: 'No. Serial' },
        { key: 'categoria',           label: 'Categoría' },
        { key: 'es_depreciable',      label: 'Depreciable' },
        { key: 'depr_inmediata_50uvt', label: 'Menor Cuantía <= 50 UVT' },
        { key: 'costo',               label: 'Costo de Adquisición' },
        { key: 'v_residual_niif',     label: 'Valor Residual NIIF' },
        { key: 'v_util_niif',         label: 'Vida Útil NIIF (meses)' },
        { key: 'v_util_fiscal',       label: 'Vida Útil Fiscal (meses)' },
        { key: 'depr_acum_niif',      label: 'Depr. Acum. NIIF (Libros)' },
        { key: 'depr_acum_fiscal',    label: 'Depr. Acum. Fiscal' },
        { key: 'v_neto_libros',       label: 'Valor Neto en Libros' },
        { key: 'ultimo_periodo',      label: 'Último Periodo Causado' },
        { key: 'meses_pendientes',    label: 'Meses Pendientes' },
        { key: 'depr_pendiente_niif', label: 'Depr. Pendiente NIIF' },
        { key: 'dif_temporaria',      label: 'Diferencia Temporaria' },
        { key: 'centro_costo',        label: 'Centro de Costo' },
        { key: 'estado',              label: 'Estado' },
        { key: 'ubicacion',           label: 'Ubicación' },
        { key: 'fecha_compra',        label: 'Fecha de Compra' },
        { key: 'fecha_servicio',      label: 'Fecha Inicio Servicio' },
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
          const d = getAssetDeprInfo(a);
          const statusMap: Record<string, string> = { active: 'Activo', suspended: 'Suspendido', in_repair: 'En Reparación', retired: 'Retirado', sold: 'Vendido', lost: 'Perdido', obsolete: 'Obsoleto' };
          const deprLabel = a.is_depreciable !== false ? `${a.useful_life_niif || 0}m` : 'No Depr.';
          return [
            a.code,
            a.name + (a.brand ? `\n${a.brand} ${a.model || ''}`.trim() : ''),
            cat ? cat.name : '—',
            formatCOPPlain(a.cost),
            a.is_depreciable !== false ? formatCOPPlain(a.residual_value || 0) : '—',
            deprLabel,
            formatCOPPlain(d.accumNIIF),
            formatCOPPlain(d.netNIIF),
            cc ? cc.name : '—',
            statusMap[a.status] || (a.status || 'Activo'),
          ];
        });

        const totCost    = assets.reduce((s, a) => s + (a.cost || 0), 0);
        const totNIIF    = assets.reduce((s, a) => s + getAssetDeprInfo(a).accumNIIF, 0);
        body.push(['TOTAL', `${assets.length} activos`, '', formatCOPPlain(totCost), '', '', formatCOPPlain(totNIIF), formatCOPPlain(totCost - totNIIF), '', '']);

        doc.autoTable({
          startY: header.startY,
          head: [['Placa', 'Nombre / Marca', 'Categoría', 'Costo Adq.', 'V. Residual', 'V. Útil NIIF', 'Depr. Acum. NIIF', 'V. Neto Libros', 'C. Costo', 'Estado']],
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

    const tbl = document.getElementById('assets-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error: ${esc(err.message)}</div>`;
  }
}

// Conmutador rápido de depreciabilidad (similar al toggle de Terceros)
(window as any).toggleActivoDepreciable = async (id: string, makeDepreciable: boolean) => {
  const title = makeDepreciable ? 'Habilitar Depreciación de Activo' : 'Marcar como Activo No Depreciable';
  const msg = makeDepreciable
    ? '¿Deseas activar la depreciación para este activo? Comenzará a causar cuota contable y fiscal en las ejecuciones mensuales.'
    : '¿Deseas marcar este activo como NO depreciable (ej. Terreno, Obra de arte o Lote)? El activo mantendrá su costo histórico y no generará gastos de depreciación acumulada.';

  confirmDialog(title, msg, async () => {
    try {
      await pb.update('niif_assets', id, { is_depreciable: makeDepreciable });
      const a = await pb.get('niif_assets', id);
      await API.logAudit('UPDATE', 'Asset', id, `Cambió depreciabilidad de activo ${a.code} a: ${makeDepreciable ? 'Depreciable' : 'No Depreciable'}`);
      showToast(`Activo ${a.code} marcado como ${makeDepreciable ? 'Depreciable' : 'No Depreciable'}`, 'success');
      const container = document.getElementById('activos-subtab-content');
      if (container) await renderSubTabCatalogo(container);
    } catch (err: any) {
      showToast('Error al actualizar estado del activo: ' + err.message, 'error');
    }
  });
};

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
          <table class="data-table" id="asset-categories-table">
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

    const tbl = document.getElementById('asset-categories-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

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
  let companyUvt = 52374;

  try {
    const [cRes, ccRes, uRes, tpRes, paRes, uvtRes] = await Promise.all([
      pb.listAll('niif_asset_categories', { filter: 'active=true', sort: 'code' }),
      pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' }),
      pb.listAll('users', { sort: 'name' }),
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
      pb.listAll('niif_assets', { filter: 'active=true', sort: 'code' }),
      fetchConfiguredCompanyUvt()
    ]);
    categories = cRes;
    costCenters = ccRes;
    users = uRes;
    thirdParties = tpRes;
    parentAssets = paRes;
    companyUvt = uvtRes || 52374;
    if (id) {
      parentAssets = parentAssets.filter(pa => pa.id !== id);
    }
  } catch (err: any) {
    return showToast('Error al cargar dependencias: ' + err.message, 'error');
  }

  const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

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

      <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider border-b pb-1 mt-4 flex items-center justify-between">
        <span>Parámetros Financieros y Depreciación</span>
        <span class="text-xxs font-normal text-gray-400">NIC 16 / NIIF PYMES Sec. 17</span>
      </h5>

      <!-- Switch Activo Depreciable -->
      <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <i class="fas fa-calculator"></i>
          </div>
          <div>
            <div class="font-bold text-gray-900 text-xs">¿Este activo es sujeto a Depreciación?</div>
            <div class="text-gray-500 text-xxs">Desactiva esta opción para Terrenos, Lotes, Obras de arte o Activos en montaje (no generarán cuota de depreciación acumulada).</div>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="ast-is-depreciable" class="sr-only peer" ${a?.is_depreciable !== false ? 'checked' : ''}>
          <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label">Costo de Adquisición ($ COP) <span class="text-red-500">*</span></label>
          <input id="ast-cost" type="number" class="form-input" placeholder="Costo total de compra" value="${a?.cost || ''}" required>
        </div>
        <div class="form-group depr-param-field">
          <label class="form-label">Valor Residual NIIF ($ COP)</label>
          <input id="ast-residual" type="number" class="form-input" placeholder="Valor de salvamento NIIF" value="${a?.residual_value ?? '0'}">
        </div>
        <div class="form-group depr-param-field">
          <label class="form-label">Método Depreciación</label>
          <select id="ast-method" class="form-input">
            <option value="linea_recta" ${a?.depreciation_method === 'linea_recta' ? 'selected' : ''}>Línea Recta</option>
            <option value="saldos_decrecientes" ${a?.depreciation_method === 'saldos_decrecientes' ? 'selected' : ''}>Saldos Decrecientes</option>
            <option value="unidades_produccion" ${a?.depreciation_method === 'unidades_produccion' ? 'selected' : ''}>Unidades Producción</option>
          </select>
        </div>
      </div>

      <!-- Opción Depreciación Inmediata Menor Cuantía <= 50 UVT (Art. 1.2.1.18.5 DUR 1625 / E.T.) -->
      <div id="ast-immediate-depr-card" class="p-3.5 rounded-xl border transition-all depr-param-field" style="background:linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%); border-color:#DDD6FE">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-start gap-3 flex-1">
            <div id="ast-imm-icon" class="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="space-y-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-gray-900 text-xs">Depreciación Inmediata — Menor Cuantía (≤ 50 UVT)</span>
                <span id="ast-uvt-badge" class="badge badge-gray text-[10px]">Evaluando tope UVT...</span>
              </div>
              <div class="text-gray-600 text-xxs leading-relaxed">
                Art. 1.2.1.18.5 DUR 1625 de 2016: Si el costo de compra no supera <strong>50 UVT</strong>, puede depreciarse al <strong>100% en el mismo mes de compra</strong> (1 cuota, valor residual $0) en NIIF y Fiscal.
              </div>
              <div id="ast-uvt-calc-detail" class="text-[10px] font-semibold text-purple-900 pt-0.5"></div>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0" title="Activar/Desactivar depreciación inmediata al 100% (<= 50 UVT)">
            <input type="checkbox" id="ast-is-immediate-depr" class="sr-only peer" ${a?.is_immediate_depreciation ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-disabled:opacity-40 peer-disabled:cursor-not-allowed peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 depr-param-field" id="ast-lifes-row">
        <div class="form-group">
          <label class="form-label">Vida Útil NIIF (Meses) <span class="text-red-500 life-req">*</span></label>
          <input id="ast-life-niif" type="number" class="form-input" placeholder="Vida útil contable en meses" value="${a?.useful_life_niif || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Vida Útil Fiscal (Meses) <span class="text-red-500 life-req">*</span></label>
          <input id="ast-life-fiscal" type="number" class="form-input" placeholder="Vida útil tributaria en meses" value="${a?.useful_life_fiscal || ''}">
        </div>
      </div>

      <!-- Depreciación Acumulada Previa / Saldos Iniciales -->
      <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 depr-param-field" id="ast-init-depr-panel">
        <div class="flex items-center justify-between">
          <div class="text-xxs font-bold text-gray-700 flex items-center gap-1.5">
            <i class="fas fa-history text-indigo-500"></i> Depreciación Acumulada Previa / Saldo Inicial Individual
          </div>
          <button type="button" class="btn btn-outline btn-xs" id="btn-calc-init-depr" style="font-size:10px; padding:2px 8px;">
            <i class="fas fa-calculator mr-1"></i>Calcular cuotas a la fecha de corte
          </button>
        </div>
        <div class="text-xxs text-gray-500">Si este activo tenía depreciación acumulada antes del periodo actual (ej. a diciembre 2025), ingrese la porción individual correspondiente a esta placa.</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
          <div class="form-group">
            <label class="form-label text-xxs">Depr. Acumulada Inicial NIIF ($)</label>
            <input id="ast-init-depr-niif" type="number" class="form-input text-xs" placeholder="0" value="${a?.initial_depreciation_niif || ''}">
          </div>
          <div class="form-group">
            <label class="form-label text-xxs">Depr. Acumulada Inicial Fiscal ($)</label>
            <input id="ast-init-depr-fiscal" type="number" class="form-input text-xs" placeholder="0" value="${a?.initial_depreciation_fiscal || ''}">
          </div>
          <div class="form-group">
            <label class="form-label text-xxs">Periodo de Corte Saldo Inicial (Cierre)</label>
            <input id="ast-init-depr-period" type="month" class="form-input text-xs" placeholder="AAAA-MM" value="${a?.last_depreciation_period || '2025-12'}">
          </div>
        </div>
        <div class="text-[10px] text-indigo-700 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100 flex items-start gap-1.5">
          <i class="fas fa-circle-info mt-0.5 text-indigo-500"></i>
          <span><strong>Nota Contable:</strong> La cuenta PUC de la categoría (ej. 15923501) puede agrupar varios activos fijos. Ingrese aquí únicamente la alícuota que pertenece a este activo físico individual. El sistema tomará este periodo de corte para calcular con precisión los meses pendientes en el año en curso.</span>
        </div>
      </div>

      <div id="ast-non-depr-banner" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2" style="display:none">
        <i class="fas fa-info-circle text-amber-600 text-sm"></i>
        <span>Este activo está catalogado como <strong>No Depreciable</strong>. Su valor en libros se mantendrá igual a su costo histórico salvo revaluaciones o deterioros.</span>
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
          <label class="form-label">Fecha Compra <span class="text-red-500 date-req">*</span></label>
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

  // Control reactivo del switch de depreciable y del tope de 50 UVT
  const syncImmediate50UvtState = (triggeredByToggle = false) => {
    const isDepr = !!(document.getElementById('ast-is-depreciable') as HTMLInputElement)?.checked;
    const immCheck = document.getElementById('ast-is-immediate-depr') as HTMLInputElement | null;
    const uvtBadge = document.getElementById('ast-uvt-badge');
    const uvtDetail = document.getElementById('ast-uvt-calc-detail');
    const card = document.getElementById('ast-immediate-depr-card');
    const lifeNiifInput = $('#ast-life-niif') as HTMLInputElement | null;
    const lifeFiscalInput = $('#ast-life-fiscal') as HTMLInputElement | null;
    const residualInput = $('#ast-residual') as HTMLInputElement | null;

    if (!immCheck || !isDepr) return;

    const costVal = Number(getInputVal('ast-cost') || 0);
    const dateVal = getInputVal('ast-purchase-date') || getInputVal('ast-service-date') || todayStr();
    const { year, uvtValue, limit50Uvt } = getUvtForDateOrYear(dateVal, companyUvt);
    const costInUvt = costVal > 0 ? (costVal / uvtValue) : 0;
    const isEligible = costVal > 0 && costVal <= limit50Uvt;

    if (!isEligible) {
      const wasChecked = immCheck.checked;
      immCheck.checked = false;
      immCheck.disabled = true;
      if (card) {
        card.style.background = '#F9FAFB';
        card.style.borderColor = '#E5E7EB';
      }
      if (costVal <= 0) {
        if (uvtBadge) {
          uvtBadge.className = 'badge badge-gray text-[10px]';
          uvtBadge.innerHTML = `<i class="fas fa-circle-info mr-1"></i>Tope 50 UVT (${year}): ${formatCOP(limit50Uvt)}`;
        }
        if (uvtDetail) {
          uvtDetail.className = 'text-[10px] font-medium text-gray-500 pt-0.5';
          uvtDetail.textContent = `1 UVT (${year}) = ${formatCOP(uvtValue)}. Ingrese un costo ≤ ${formatCOP(limit50Uvt)} para habilitar esta opción.`;
        }
      } else {
        if (uvtBadge) {
          uvtBadge.className = 'badge badge-orange text-[10px]';
          uvtBadge.innerHTML = `<i class="fas fa-lock mr-1"></i>Supera 50 UVT (${costInUvt.toFixed(1)} UVT) — No elegible`;
        }
        if (uvtDetail) {
          uvtDetail.className = 'text-[10px] font-semibold text-amber-800 pt-0.5';
          uvtDetail.textContent = `El costo equivale a ${costInUvt.toFixed(2)} UVT y supera el tope fiscal de 50 UVT (${formatCOP(limit50Uvt)} para ${year}). Inicia depreciación el mes siguiente al de compra según su vida útil.`;
        }
      }
      if (wasChecked) {
        if (lifeNiifInput) {
          lifeNiifInput.readOnly = false;
          const cat = categories.find(c => c.id === getSelectVal('ast-cat'));
          if (lifeNiifInput.value === '1') lifeNiifInput.value = String(cat?.useful_life_niif_default || 60);
        }
        if (lifeFiscalInput) {
          lifeFiscalInput.readOnly = false;
          const cat = categories.find(c => c.id === getSelectVal('ast-cat'));
          if (lifeFiscalInput.value === '1') lifeFiscalInput.value = String(cat?.useful_life_fiscal_default || 60);
        }
        if (residualInput) residualInput.readOnly = false;
      }
      return;
    }

    // Es elegible (Costo > 0 y Costo <= 50 UVT)
    immCheck.disabled = false;
    const isImmActive = immCheck.checked;

    if (card) {
      card.style.background = isImmActive
        ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
        : 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)';
      card.style.borderColor = isImmActive ? '#6EE7B7' : '#DDD6FE';
    }

    if (uvtBadge) {
      uvtBadge.className = isImmActive ? 'badge badge-green text-[10px]' : 'badge badge-purple text-[10px]';
      uvtBadge.innerHTML = isImmActive
        ? `<i class="fas fa-bolt mr-1"></i>Activa: 100% en mes de compra (${costInUvt.toFixed(1)} UVT)`
        : `<i class="fas fa-check-circle mr-1"></i>Elegible: ${costInUvt.toFixed(2)} UVT (≤ 50 UVT)`;
    }

    if (uvtDetail) {
      uvtDetail.className = isImmActive ? 'text-[10px] font-bold text-emerald-900 pt-0.5' : 'text-[10px] font-semibold text-purple-900 pt-0.5';
      uvtDetail.textContent = isImmActive
        ? `✓ Se depreciará el 100% (${formatCOP(costVal)}) en una sola cuota en el mismo mes de compra tanto en NIIF como en Fiscal (Vida útil = 1 mes, Valor residual = $0).`
        : `Cumple tope de 50 UVT (${formatCOP(limit50Uvt)} en ${year}). Active el interruptor si desea depreciarlo al 100% en el mes de compra; de lo contrario, iniciará depreciación el mes siguiente.`;
    }

    if (isImmActive) {
      if (lifeNiifInput) {
        if (lifeNiifInput.value && lifeNiifInput.value !== '1') lifeNiifInput.dataset.prevLife = lifeNiifInput.value;
        lifeNiifInput.value = '1';
        lifeNiifInput.readOnly = true;
      }
      if (lifeFiscalInput) {
        if (lifeFiscalInput.value && lifeFiscalInput.value !== '1') lifeFiscalInput.dataset.prevLife = lifeFiscalInput.value;
        lifeFiscalInput.value = '1';
        lifeFiscalInput.readOnly = true;
      }
      if (residualInput) {
        if (residualInput.value && residualInput.value !== '0') residualInput.dataset.prevResidual = residualInput.value;
        residualInput.value = '0';
        residualInput.readOnly = true;
      }
    } else if (triggeredByToggle) {
      const cat = categories.find(c => c.id === getSelectVal('ast-cat'));
      if (lifeNiifInput) {
        lifeNiifInput.readOnly = false;
        lifeNiifInput.value = lifeNiifInput.dataset.prevLife || String(cat?.useful_life_niif_default || 60);
      }
      if (lifeFiscalInput) {
        lifeFiscalInput.readOnly = false;
        lifeFiscalInput.value = lifeFiscalInput.dataset.prevLife || String(cat?.useful_life_fiscal_default || 60);
      }
      if (residualInput) {
        residualInput.readOnly = false;
        const factor = (cat?.residual_value_percent_default || 0) / 100;
        residualInput.value = residualInput.dataset.prevResidual || String(Math.round(costVal * factor));
      }
    }
  };

  const syncDepreciableState = () => {
    const isDepr = !!(document.getElementById('ast-is-depreciable') as HTMLInputElement)?.checked;
    $$('.depr-param-field').forEach((el: HTMLElement) => {
      el.style.display = isDepr ? '' : 'none';
    });
    const banner = document.getElementById('ast-non-depr-banner');
    if (banner) banner.style.display = isDepr ? 'none' : 'flex';
    $$('.life-req').forEach((el: HTMLElement) => {
      el.style.display = isDepr ? 'inline' : 'none';
    });
    $$('.date-req').forEach((el: HTMLElement) => {
      el.style.display = isDepr ? 'inline' : 'none';
    });
    if (isDepr) {
      syncImmediate50UvtState(false);
    }
  };

  document.getElementById('ast-is-depreciable')?.addEventListener('change', syncDepreciableState);
  document.getElementById('ast-is-immediate-depr')?.addEventListener('change', () => syncImmediate50UvtState(true));
  document.getElementById('ast-purchase-date')?.addEventListener('change', () => syncImmediate50UvtState(false));
  document.getElementById('ast-service-date')?.addEventListener('change', () => syncImmediate50UvtState(false));
  syncDepreciableState();

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
    syncImmediate50UvtState(false);
    const isImm = !!(document.getElementById('ast-is-immediate-depr') as HTMLInputElement)?.checked;
    if (isImm) return;
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

  $('#btn-calc-init-depr')?.addEventListener('click', () => {
    const cost = Number(getInputVal('ast-cost') || 0);
    const isImm = !!(document.getElementById('ast-is-immediate-depr') as HTMLInputElement)?.checked;
    const residual = isImm ? 0 : Number(getInputVal('ast-residual') || 0);
    const lifeNiif = isImm ? 1 : Number(getInputVal('ast-life-niif') || 0);
    const purchaseDate = getInputVal('ast-purchase-date') || getInputVal('ast-service-date');
    const cutoffPeriod = getInputVal('ast-init-depr-period') || '2025-12';

    if (!cost || !lifeNiif || !purchaseDate || !cutoffPeriod) {
      return showToast('Ingrese costo, vida útil, fecha de compra y periodo de corte para calcular', 'warning');
    }

    const firstPeriod = getAssetFirstDepreciationPeriod({
      is_depreciable: true,
      is_immediate_depreciation: isImm,
      purchase_date: purchaseDate
    });

    if (!firstPeriod || cutoffPeriod < firstPeriod) {
      const initNiifInput = $('#ast-init-depr-niif') as HTMLInputElement | null;
      const initFiscalInput = $('#ast-init-depr-fiscal') as HTMLInputElement | null;
      if (initNiifInput) initNiifInput.value = '0';
      if (initFiscalInput) initFiscalInput.value = '0';
      return showToast(`El activo inicia depreciación en ${firstPeriod || purchaseDate}; al corte ${cutoffPeriod} su depreciación acumulada es $ 0.`, 'info');
    }

    const [startYr, startMo] = firstPeriod.split('-').map(Number);
    const [cutYr, cutMo] = cutoffPeriod.split('-').map(Number);
    // Meses transcurridos desde el primer mes elegible hasta el periodo de corte inclusive
    const months = isImm
      ? 1
      : Math.min(lifeNiif, Math.max(0, (cutYr - startYr) * 12 + (cutMo - startMo) + 1));

    const monthly = (cost - residual) / lifeNiif;
    const calcInitial = Math.min(cost - residual, Math.round(monthly * months));

    const initNiifInput = $('#ast-init-depr-niif') as HTMLInputElement | null;
    const initFiscalInput = $('#ast-init-depr-fiscal') as HTMLInputElement | null;
    if (initNiifInput) initNiifInput.value = String(calcInitial);
    if (initFiscalInput) initFiscalInput.value = String(calcInitial);

    showToast(`Cuotas calculadas: ${months} mes(es) desde ${firstPeriod} hasta ${cutoffPeriod} = $ ${calcInitial.toLocaleString('es-CO')}`, 'info');
  });

  $('#btn-save-asset')?.addEventListener('click', async () => {
    const code = getInputVal('ast-code').toUpperCase().trim();
    const name = getInputVal('ast-name').trim();
    const cost = Number(getInputVal('ast-cost'));
    const category_id = getSelectVal('ast-cat');
    const is_depreciable = !!(document.getElementById('ast-is-depreciable') as HTMLInputElement)?.checked;
    const is_immediate_depreciation = is_depreciable && !!(document.getElementById('ast-is-immediate-depr') as HTMLInputElement)?.checked;
    const purchaseDate = getInputVal('ast-purchase-date');
    const serviceDate = getInputVal('ast-service-date');

    if (!code || !name || !cost || !category_id) {
      return showToast('Por favor llene todos los campos obligatorios (*)', 'warning');
    }

    if (is_immediate_depreciation) {
      const { year, limit50Uvt } = getUvtForDateOrYear(purchaseDate || serviceDate || todayStr(), companyUvt);
      if (cost > limit50Uvt) {
        return showToast(`El costo supera el tope de 50 UVT (${formatCOP(limit50Uvt)} para ${year}). No aplica para Depreciación Inmediata.`, 'error');
      }
    }

    // Si no es depreciable, conservar vida útil numérica previa o predeterminada (>= 1) para satisfacer validación de esquema en PB
    const useful_life_niif = is_depreciable 
      ? (is_immediate_depreciation ? 1 : Number(getInputVal('ast-life-niif'))) 
      : (Number(getInputVal('ast-life-niif')) || a?.useful_life_niif || 120);
    const useful_life_fiscal = is_depreciable 
      ? (is_immediate_depreciation ? 1 : Number(getInputVal('ast-life-fiscal'))) 
      : (Number(getInputVal('ast-life-fiscal')) || a?.useful_life_fiscal || 120);

    if (is_depreciable) {
      if (!useful_life_niif || !useful_life_fiscal) {
        return showToast('Para un activo depreciable, las vidas útiles NIIF y Fiscal en meses son obligatorias', 'warning');
      }
      if (!purchaseDate && !serviceDate) {
        return showToast('Para un activo depreciable, ingrese al menos la fecha de compra o de puesta en servicio', 'warning');
      }
    }

    const payload: any = {
      code,
      name,
      cost,
      category_id,
      is_depreciable,
      is_immediate_depreciation,
      useful_life_niif,
      useful_life_fiscal,
      residual_value: (is_depreciable && !is_immediate_depreciation) ? Number(getInputVal('ast-residual') || 0) : 0,
      initial_depreciation_niif: is_depreciable ? Number(getInputVal('ast-init-depr-niif') || 0) : 0,
      initial_depreciation_fiscal: is_depreciable ? Number(getInputVal('ast-init-depr-fiscal') || 0) : 0,
      last_depreciation_period: is_depreciable ? (getInputVal('ast-init-depr-period').trim() || a?.last_depreciation_period || null) : null,
      depreciation_method: is_depreciable ? (getSelectVal('ast-method') || 'linea_recta') : 'linea_recta',
      cost_center_id: getSelectVal('ast-cc') || null,
      owner_id: getSelectVal('ast-owner') || null,
      location: getInputVal('ast-location').trim(),
      parent_asset_id: getSelectVal('ast-parent') || null,
      provider_id: getSelectVal('ast-provider') || null,
      invoice_number: getInputVal('ast-inv-num').trim(),
      invoice_date: purchaseDate || null,
      purchase_date: purchaseDate || null,
      start_service_date: serviceDate || purchaseDate || null,
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
        await API.logAudit('UPDATE', 'Asset', id, `Modificó ficha de activo: ${code} - ${name} (${is_depreciable ? 'Depreciable' : 'No Depreciable'})`);
        showToast('Activo fijo actualizado correctamente', 'success');
      } else {
        const created = await pb.create('niif_assets', payload);
        await API.logAudit('CREATE', 'Asset', created.id, `Creó ficha de activo: ${code} - ${name} (${is_depreciable ? 'Depreciable' : 'No Depreciable'})`);
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
    const isDepr = a.is_depreciable !== false;
    const isImmediate = isDepr && a.is_immediate_depreciation === true;
    const firstEligiblePeriod = getAssetFirstDepreciationPeriod(a);
    let deprNIIFMonthly = 0;
    let deprFiscalMonthly = 0;
    let accumNIIF = 0;
    let accumFiscal = 0;
    let netNIIF = (a.cost || 0) - (a.impairment || 0);
    let netFiscal = a.cost || 0;
    let monthsPending = 0;
    let pendingNIIFAmount = 0;
    let status = 'up_to_date';
    const lastPeriod = a.last_depreciation_period || null;

    if (isDepr) {
      const initNIIF = Number(a.initial_depreciation_niif || 0);
      const initFiscal = Number(a.initial_depreciation_fiscal || 0);
      const postedNIIF = Number(a.accumulated_depreciation_niif || 0);
      const postedFiscal = Number(a.accumulated_depreciation_fiscal || 0);
      const residual = isImmediate ? 0 : Number(a.residual_value || 0);

      const maxNIIF = Math.max(0, (a.cost || 0) - residual);
      const maxFiscal = a.cost || 0;

      deprNIIFMonthly = isImmediate ? maxNIIF : (((a.cost || 0) - residual) / (a.useful_life_niif || 1));
      deprFiscalMonthly = isImmediate ? maxFiscal : ((a.cost || 0) / (a.useful_life_fiscal || 1));

      // Saldo REAL asentado en libros contables (estrictamente lo registrado)
      accumNIIF = Math.min(maxNIIF, Math.max(initNIIF, postedNIIF));
      accumFiscal = Math.min(maxFiscal, Math.max(initFiscal, postedFiscal));

      netNIIF = Math.max(0, (a.cost || 0) - accumNIIF - (a.impairment || 0));
      netFiscal = Math.max(0, (a.cost || 0) - accumFiscal);

      // Diagnóstico operativo frente a la fecha de consulta
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1..12
      const currentPeriod = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      let isScheduledFuture = false;

      if (accumNIIF >= maxNIIF) {
        monthsPending = 0;
      } else if (firstEligiblePeriod && currentPeriod < firstEligiblePeriod) {
        monthsPending = 0;
        isScheduledFuture = true;
      } else if (lastPeriod && /^\d{4}-\d{2}$/.test(lastPeriod)) {
        const [lYr, lMo] = lastPeriod.split('-').map(Number);
        monthsPending = Math.max(0, (currentYear - lYr) * 12 + (currentMonth - lMo));
      } else if (firstEligiblePeriod && /^\d{4}-\d{2}$/.test(firstEligiblePeriod)) {
        const [fYr, fMo] = firstEligiblePeriod.split('-').map(Number);
        monthsPending = Math.max(0, (currentYear - fYr) * 12 + (currentMonth - fMo) + 1);
      }

      if (isImmediate && monthsPending > 0) {
        monthsPending = 1;
      }

      pendingNIIFAmount = Math.min(Math.max(0, maxNIIF - accumNIIF), monthsPending * deprNIIFMonthly);

      if (isScheduledFuture) {
        status = 'scheduled';
      } else if (!lastPeriod && postedNIIF === 0 && initNIIF === 0 && accumNIIF < maxNIIF) {
        status = 'never_run';
      } else if (monthsPending > 0) {
        status = 'pending';
      } else {
        status = 'up_to_date';
      }
    }

    return `
      <div class="space-y-4 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Datos Generales -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center border-b pb-1.5 mb-2">
                <h6 class="font-bold text-gray-700 mb-0"><i class="fas fa-circle-info mr-1 text-indigo-500"></i>Especificaciones Generales</h6>
                <div class="flex gap-1">
                  ${isDepr 
                    ? (isImmediate
                        ? '<span class="badge badge-purple text-[10px]"><i class="fas fa-bolt mr-1"></i>≤ 50 UVT (Inmediata)</span>'
                        : '<span class="badge badge-green text-[10px]">Depreciable</span>')
                    : '<span class="badge badge-blue text-[10px]" style="background:#E0E7FF;color:#3730A3;border:1px solid #C7D2FE">No Depreciable</span>'}
                </div>
              </div>
              <div class="space-y-1.5">
                <div><strong class="text-gray-500">Nombre:</strong> <span class="text-gray-800 font-semibold">${esc(a.name)}</span></div>
                <div><strong class="text-gray-500">Categoría:</strong> <span class="text-gray-800 font-semibold">${cat ? esc(cat.name) : '—'}</span></div>
                <div><strong class="text-gray-500">Marca/Modelo:</strong> <span class="text-gray-800 font-semibold">${esc(a.brand || '—')} / ${esc(a.model || '—')}</span></div>
                <div><strong class="text-gray-500">Ubicación:</strong> <span class="text-gray-800 font-semibold">${esc(a.location || '—')}</span></div>
                <div><strong class="text-gray-500">Centro de Costo:</strong> <span class="text-gray-800 font-semibold">${cc ? `${esc(cc.code)} - ${esc(cc.name)}` : '—'}</span></div>
                <div><strong class="text-gray-500">Responsable Custodia:</strong> <span class="text-gray-800 font-semibold">${owner ? esc(owner.name) : '—'}</span></div>
                <div><strong class="text-gray-500">Proveedor:</strong> <span class="text-gray-800 font-semibold">${a.expand?.provider_id ? esc(a.expand.provider_id.name) : '—'}</span></div>
                <div><strong class="text-gray-500">Factura Compra:</strong> <span class="text-gray-800 font-semibold">${esc(a.invoice_number || '—')} (${esc(a.purchase_date || '—')})</span></div>
                ${firstEligiblePeriod ? `<div><strong class="text-gray-500">Primer periodo de depreciación:</strong> <span class="text-purple-900 font-bold">${esc(firstEligiblePeriod)} ${isImmediate ? '(Mes de compra - 100%)' : '(Mes siguiente a compra)'}</span></div>` : ''}
                ${a.last_depreciation_period ? `<div><strong class="text-gray-500">Último periodo contabilizado:</strong> <span class="text-indigo-900 font-bold">${esc(a.last_depreciation_period)}</span></div>` : ''}
              </div>
            </div>
          </div>

          <!-- Datos Financieros Dual -->
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center border-b pb-1.5 mb-2">
                <h6 class="font-bold text-gray-700 mb-0"><i class="fas fa-calculator mr-1 text-emerald-500"></i>Saldos en Libros (Contabilizados)</h6>
                ${isDepr && lastPeriod 
                  ? `<span class="badge badge-gray text-[10px]" title="Último periodo cerrado en libros contables">Cierre: ${esc(lastPeriod)}</span>` 
                  : (isDepr ? `<span class="badge badge-orange text-[10px]">Sin Cierre Contable</span>` : '')}
              </div>
              ${isDepr ? `
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
                    <tr class="border-b"><td class="py-1">Valor Residual</td><td class="text-right font-semibold">${formatCOP(isImmediate ? 0 : (a.residual_value || 0))}</td><td class="text-right text-gray-400">$ 0</td></tr>
                    <tr class="border-b"><td class="py-1">Vida Útil</td><td class="text-right font-semibold">${isImmediate ? '1 m (100%)' : `${a.useful_life_niif} m`}</td><td class="text-right text-gray-600">${isImmediate ? '1 m (100%)' : `${a.useful_life_fiscal} m`}</td></tr>
                    <tr class="border-b"><td class="py-1">Cuota Mensual Nominal</td><td class="text-right font-bold text-indigo-900">${formatCOP(deprNIIFMonthly)}</td><td class="text-right text-gray-600">${formatCOP(deprFiscalMonthly)}</td></tr>
                    <tr class="border-b">
                      <td class="py-1">
                        <div>Depr. Acumulada en Libros</div>
                        <div class="text-[9px] text-gray-400 font-normal">${lastPeriod ? `Asentada a ${lastPeriod}` : 'Sin comprobantes causados'}</div>
                      </td>
                      <td class="text-right font-bold text-indigo-900">${formatCOP(accumNIIF)}</td>
                      <td class="text-right text-gray-600">${formatCOP(accumFiscal)}</td>
                    </tr>
                    <tr><td class="py-1">Valor Neto en Libros</td><td class="text-right font-bold text-emerald-700">${formatCOP(netNIIF)}</td><td class="text-right text-gray-600">${formatCOP(netFiscal)}</td></tr>
                  </tbody>
                </table>

                <!-- Diagnóstico Operativo a la Fecha de Consulta -->
                ${monthsPending > 0 ? `
                  <div class="mt-3 p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 text-xs">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-amber-900 text-xxs flex items-center gap-1">
                        <i class="fas fa-clock text-amber-600"></i> Rezago de Causación Detectado
                      </span>
                      <span class="badge badge-orange text-[9px] font-bold">${monthsPending} mes(es) sin causar</span>
                    </div>
                    <div class="text-xxs text-amber-800 leading-normal">
                      A la fecha de consulta no se han contabilizado las cuotas de este periodo.
                      Depreciación proyectada pendiente por causar: <strong class="text-amber-950 font-bold">${formatCOP(pendingNIIFAmount)}</strong>.
                    </div>
                    <div class="mt-2 flex justify-end">
                      <button class="btn btn-outline btn-xs" style="background:#fff; border-color:#F59E0B; color:#B45309" onclick="closeModal(); if (typeof (window as any).navigate === 'function') (window as any).navigate('fixed-assets-depreciacion');">
                        <i class="fas fa-calculator mr-1"></i>Ir a Depreciación Mensual
                      </button>
                    </div>
                  </div>
                ` : (status === 'scheduled' ? `
                  <div class="mt-3 p-2.5 rounded-xl border border-purple-200 bg-purple-50 text-xxs text-purple-900 flex items-center gap-2 font-medium">
                    <i class="fas fa-calendar-day text-purple-600"></i>
                    <span>Activo adquirido en <strong>${esc(a.purchase_date || a.start_service_date || '')}</strong>. Su primera cuota de depreciación se causará en el periodo <strong>${esc(firstEligiblePeriod || '')}</strong>.</span>
                  </div>
                ` : (status === 'up_to_date' ? `
                  <div class="mt-3 p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xxs text-emerald-800 flex items-center gap-1.5 font-medium">
                    <i class="fas fa-circle-check text-emerald-600"></i>
                    <span>Depreciación al día en libros contables (Último cierre: <strong>${esc(lastPeriod || 'Al día')}</strong>).</span>
                  </div>
                ` : `
                  <div class="mt-3 p-2 rounded-xl border border-indigo-200 bg-indigo-50 text-xxs text-indigo-800 flex items-center gap-1.5 font-medium">
                    <i class="fas fa-info-circle text-indigo-600"></i>
                    <span>Activo sin registros de depreciación histórica. Listo para comenzar su ciclo contable.</span>
                  </div>
                `))}
              ` : `
                <div class="py-6 text-center text-gray-500 space-y-2">
                  <i class="fas fa-ban text-indigo-400 text-2xl"></i>
                  <div class="font-bold text-xs text-gray-700">Activo Catalogado como No Depreciable</div>
                  <p class="text-xxs text-gray-500 leading-normal max-w-xs mx-auto">De conformidad con la NIC 16 (párrafo 58), este bien no genera cuota mensual ni amortización acumulada. Su valor en libros se conserva igual a su costo histórico.</p>
                  <div class="mt-2 font-bold text-sm text-indigo-950">Valor en Libros: ${formatCOP(a.cost)}</div>
                </div>
              `}
            </div>
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

function getPreviousPeriod(month: string): string {
  const [yr, mo] = month.split('-').map(Number);
  if (mo === 1) {
    return `${yr - 1}-12`;
  }
  return `${yr}-${String(mo - 1).padStart(2, '0')}`;
}

async function checkDepreciationStatus(month: string) {
  const [yrStr, moStr] = month.split('-');
  const yr = Number(yrStr);
  const mo = Number(moStr);
  const lastDay = new Date(yr, mo, 0).getDate();
  const startDate = `${month}-01`;
  const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

  let checkTxItems: any[] = [];
  let checkEventItems: any[] = [];
  let subsequentTxItems: any[] = [];

  try {
    const [txByCross, txByDesc, evRes, subseqRes] = await Promise.all([
      pb.listAll('transactions', {
        filter: `(cross_type = "DEPRECIACION_MENSUAL" || cross_type = "DEPRE_MENSUAL_NIIF" || cross_type = "DEPRE_MENSUAL_FISCAL") && cross_number = "${month}" && status = "active"`
      }).catch(() => []),
      pb.listAll('transactions', {
        filter: `date >= "${startDate}" && date <= "${endDate} 23:59:59" && (description ~ "depreciaci" || description ~ "Depreciaci") && status = "active"`
      }).catch(() => []),
      pb.listAll('niif_asset_events', {
        filter: `description ~ "${month}"`
      }).catch(() => []),
      pb.listAll('transactions', {
        filter: `date > "${endDate} 23:59:59" && (cross_type ~ "DEPRE" || description ~ "depreciaci" || description ~ "Depreciaci") && status = "active"`
      }).catch(() => [])
    ]);

    const txMap = new Map<string, any>();
    [...txByCross, ...txByDesc].forEach((t: any) => txMap.set(t.id, t));
    checkTxItems = Array.from(txMap.values());
    checkEventItems = evRes || [];
    subsequentTxItems = subseqRes || [];
  } catch (err: any) {
    console.warn('[Depreciation Check] Query check note:', err);
  }

  const activeTxList = checkTxItems.filter((t: any) => t.status === 'active');
  const hasSubsequentPosted = subsequentTxItems.length > 0;

  let state: 'posted' | 'inconsistent' | 'available' = 'available';
  if (activeTxList.length > 0) {
    state = 'posted';
  } else if (checkEventItems.length > 0) {
    state = 'inconsistent';
  }

  const txNIIF = activeTxList.find((t: any) => 
    t.cross_type === 'DEPRE_MENSUAL_NIIF' || 
    t.book_type === 'niif' || 
    (t.description && t.description.toUpperCase().includes('NIIF'))
  );

  const txFiscal = activeTxList.find((t: any) => 
    t.id !== txNIIF?.id && (
      t.cross_type === 'DEPRE_MENSUAL_FISCAL' || 
      t.book_type === 'local' || 
      (t.description && (t.description.toUpperCase().includes('FISCAL') || t.description.toUpperCase().includes('TRIBUTARIA')))
    )
  );

  return {
    state,
    activeTxList,
    txNIIF,
    txFiscal,
    checkEventItems,
    hasSubsequentPosted,
    subsequentTxCount: subsequentTxItems.length
  };
}

async function renderSubTabDepreciacion(c: HTMLElement) {
  const currentMonthDefault = todayStr().slice(0, 7); // YYYY-MM

  // Cargar tipos de comprobantes contables disponibles
  let txTypes: any[] = [];
  try {
    txTypes = await pb.listAll('transaction_types', { filter: 'active=true', sort: 'code' });
  } catch (_) {
    try { txTypes = await pb.listAll('transaction_types'); } catch (_) {}
  }
  if (!txTypes.length) {
    txTypes = [{ id: 'na_default', code: 'NA', name: 'Nota contable y de ajuste', prefix: 'AC' }];
  }

  const txTypeOptions = txTypes.map((t: any) => {
    const isDefault = t.code === 'NA' || t.prefix === 'AC' || t.name.toLowerCase().includes('ajuste') || t.name.toLowerCase().includes('nota');
    return `<option value="${t.id}" ${isDefault ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)} (${esc(t.prefix || t.code)})</option>`;
  }).join('');

  c.innerHTML = `
    <div class="bg-white rounded-2xl border p-6 mb-6" style="border-color:#F0F0F0">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 class="text-base font-bold" style="color:#0D2137"><i class="fas fa-calculator text-indigo-500 mr-2"></i>Procesamiento de Depreciación Mensual</h4>
          <p class="text-xs text-gray-400 mt-0.5">Liquidación paralela del libro contable (NIIF) y libro tributario (Fiscal) con control de duplicidad y reversión LIFO.</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
        <div class="form-group">
          <label class="form-label text-xxs font-bold text-gray-500">Periodo a Depreciar</label>
          <input id="depr-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label text-xxs font-bold text-gray-500">Tipo de Comprobante <span class="text-indigo-600">*</span></label>
          <select id="depr-tx-type" class="form-input text-xs font-semibold">
            ${txTypeOptions}
          </select>
        </div>
        <div class="form-group flex gap-2">
          <button class="btn btn-primary w-full" id="btn-depr-proj"><i class="fas fa-search-plus mr-1.5"></i>Proyectar Cálculo</button>
          <button class="btn btn-secondary w-full" id="btn-depr-post" disabled><i class="fas fa-floppy-disk mr-1.5"></i>Procesar y Contabilizar</button>
        </div>
        <div class="form-group">
          <span class="text-xxs text-gray-400 leading-normal block">Calcula las cuotas mensuales respetando vidas útiles, valores residuales y topes fiscales, y genera los comprobantes bajo el tipo seleccionado.</span>
        </div>
      </div>
    </div>

    <!-- Panel de Resultados de Proyección -->
    <div id="depr-projection-output" class="bg-white rounded-2xl border p-6 min-height: 300px" style="border-color:#F0F0F0">
      <p class="text-xs text-gray-400 text-center py-20"><i class="fas fa-calendar-check text-gray-300 text-3xl block mb-3"></i>Seleccione el periodo y presione Proyectar Cálculo.</p>
    </div>
  `;

  let activeAssetsForDepr: any[] = [];
  let currentDeprStatus: any = null;

  $('#btn-depr-proj')?.addEventListener('click', async () => {
    const month = getInputVal('depr-month');
    const output = document.getElementById('depr-projection-output');
    if (!output) return;

    output.innerHTML = `<div class="p-12 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando activos y estado contable del periodo ${month}...</div>`;

    try {
      const [rawAssets, categories, deprStatus] = await Promise.all([
        pb.listAll('niif_assets', { filter: 'status="active" || status="in_repair"', expand: 'category_id' }),
        pb.listAll('niif_asset_categories', { filter: 'active=true' }),
        checkDepreciationStatus(month)
      ]);

      currentDeprStatus = deprStatus;

      // Excluir activos que explícitamente no son depreciables (terrenos, obras de arte, etc.)
      const allDepreciableAssets = rawAssets.filter((a: any) => a.is_depreciable !== false);
      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

      if (allDepreciableAssets.length === 0) {
        output.innerHTML = `<div class="p-12 text-center text-gray-400"><i class="fas fa-circle-info mr-1"></i>No se encontraron activos fijos depreciables en operación.</div>`;
        return;
      }

      // Evaluar elegibilidad cronológica y normativa de cada activo para el periodo seleccionado
      const evaluatedList = allDepreciableAssets.map((a: any) => ({
        asset: a,
        evalRes: evaluateAssetDepreciationForPeriod(a, month)
      }));

      // Si el periodo ya está contabilizado, incluir en la vista principal tanto los elegibles como los que ya quedaron marcados con last_depreciation_period === month
      const eligibleItems = evaluatedList.filter(({ asset, evalRes }) => {
        if (deprStatus.state === 'posted' && asset.last_depreciation_period === month && evalRes.reasonCode === 'already_depreciated_period') {
          return true;
        }
        return evalRes.eligible;
      });

      const excludedItems = evaluatedList.filter((item) => !eligibleItems.includes(item));

      // Guardar únicamente los activos elegibles para la contabilización del periodo
      activeAssetsForDepr = eligibleItems.map(item => item.asset);

      let totalNIIF = 0;
      let totalFiscal = 0;

      const tableRows = eligibleItems.length > 0 ? eligibleItems.map(({ asset: a, evalRes }) => {
        // Si ya fue contabilizado en este mes, mostrar la cuota nominal que se le aplicó; si está pendiente, mostrar la cuota proyectada
        const deprNIIF = (deprStatus.state === 'posted' && a.last_depreciation_period === month && evalRes.deprNIIF === 0)
          ? Math.round(evalRes.nominalNIIF)
          : evalRes.deprNIIF;
        const deprFiscal = (deprStatus.state === 'posted' && a.last_depreciation_period === month && evalRes.deprFiscal === 0)
          ? Math.round(evalRes.nominalFiscal)
          : evalRes.deprFiscal;

        totalNIIF += deprNIIF;
        totalFiscal += deprFiscal;

        const diff = deprNIIF - deprFiscal;
        const isImm = Boolean(a.is_immediate_depreciation);
        const methodBadge = isImm
          ? `<span class="badge badge-indigo text-xxs font-bold" title="Depreciación Inmediata ≤ 50 UVT (100% en mes de compra)"><i class="fas fa-bolt mr-1"></i>≤ 50 UVT (100%)</span>`
          : `<span class="text-gray-600 font-medium">${a.depreciation_method === 'linea_recta' ? 'Línea Recta' : esc(a.depreciation_method)}</span>`;
        const acqDateStr = a.purchase_date || a.start_service_date || '—';

        return `
          <tr>
            <td><strong>${esc(a.code)}</strong></td>
            <td>
              <div class="font-semibold text-gray-800">${esc(a.name)}</div>
              <div class="text-xxs text-gray-400">Compra: ${esc(acqDateStr)} · Inicia: <strong>${esc(evalRes.firstDepreciationPeriod || '—')}</strong></div>
            </td>
            <td>${formatCOP(a.cost)}</td>
            <td>${formatCOP(isImm ? 0 : (a.residual_value || 0))}</td>
            <td>${methodBadge}</td>
            <td class="text-right font-semibold text-indigo-950">${formatCOP(deprNIIF)}</td>
            <td class="text-right text-gray-600">${formatCOP(deprFiscal)}</td>
            <td class="text-right font-bold ${diff !== 0 ? 'text-amber-600' : 'text-gray-400'}">${formatCOP(diff)}</td>
          </tr>
        `;
      }).join('') : `
        <tr>
          <td colspan="8" class="py-8 text-center text-gray-400">
            <i class="fas fa-calendar-xmark text-xl block mb-1.5 text-gray-300"></i>
            Ningún activo cumple condiciones para depreciar en el periodo <strong>${esc(month)}</strong>. Revise el detalle de activos omitidos más abajo.
          </td>
        </tr>
      `;

      const excludedSectionHtml = excludedItems.length > 0 ? `
        <details class="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
          <summary class="px-4 py-3 cursor-pointer select-none flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 hover:bg-slate-100/80 transition-colors">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center text-xxs">
                <i class="fas fa-filter"></i>
              </span>
              <span>Activos Omitidos en el Periodo ${esc(month)} (${excludedItems.length} de ${allDepreciableAssets.length})</span>
            </div>
            <span class="text-xxs font-semibold text-indigo-600 flex items-center gap-1">
              <i class="fas fa-eye"></i> Ver causal de exclusión por activo
            </span>
          </summary>
          <div class="p-4 pt-2 border-t border-slate-200/80 bg-white">
            <p class="text-xxs text-gray-500 mb-2.5">
              Estos activos no generan cuota contable ni fiscal en <strong>${esc(month)}</strong> por control cronológico de fecha de compra/ingreso o estado de depreciación acumulada:
            </p>
            <div class="overflow-x-auto">
              <table class="data-table text-xxs">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Activo</th>
                    <th>Fecha Compra</th>
                    <th>1er Periodo Depreciable</th>
                    <th>Costo</th>
                    <th>Causal de Exclusión en ${esc(month)}</th>
                  </tr>
                </thead>
                <tbody>
                  ${excludedItems.map(({ asset: a, evalRes }) => {
                    const badgeCls = evalRes.reasonCode === 'future_purchase' || evalRes.reasonCode === 'purchase_month_wait_next'
                      ? 'badge-purple'
                      : (evalRes.reasonCode === 'fully_depreciated' ? 'badge-blue' : 'badge-gray');
                    return `
                      <tr>
                        <td><strong>${esc(a.code)}</strong></td>
                        <td>${esc(a.name)}</td>
                        <td class="font-mono text-gray-600">${esc(a.purchase_date || a.start_service_date || '—')}</td>
                        <td class="font-mono font-bold text-indigo-900">${esc(evalRes.firstDepreciationPeriod || '—')}</td>
                        <td>${formatCOP(a.cost)}</td>
                        <td>
                          <span class="badge ${badgeCls} text-xxs font-semibold mr-1.5">Omitido</span>
                          <span class="text-gray-600">${esc(evalRes.reasonLabel)}</span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      ` : '';

      // Configuración de banners según el estado real
      let stateBadge = '';
      let statusCard = '';

      if (deprStatus.state === 'posted') {
        stateBadge = '<span class="badge badge-orange"><i class="fas fa-lock mr-1"></i>Periodo Contabilizado</span>';
        
        const txNIIFDesc = deprStatus.txNIIF 
          ? esc(deprStatus.txNIIF.number || deprStatus.txNIIF.id) 
          : '<span class="text-amber-600 font-semibold italic"><i class="fas fa-triangle-exclamation mr-1"></i>No generado</span>';

        const txFiscalDesc = deprStatus.txFiscal 
          ? esc(deprStatus.txFiscal.number || deprStatus.txFiscal.id) 
          : '<span class="text-amber-600 font-semibold italic"><i class="fas fa-triangle-exclamation mr-1"></i>No generado</span>';

        statusCard = `
          <div class="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3 text-xs text-amber-950">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 text-base shadow-sm">
                  <i class="fas fa-lock"></i>
                </span>
                <div>
                  <h5 class="font-bold text-amber-900 text-sm">Periodo ${month} Liquidado y Contabilizado</h5>
                  <p class="text-xxs text-amber-700">Existen comprobantes contables activos en el libro diario para este periodo. El procesamiento está bloqueado para proteger la contabilidad.</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xxs font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                <i class="fas fa-circle-check mr-1 text-emerald-600"></i>Contabilidad en Firme
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
              <div class="p-3 bg-white/90 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span class="text-xxs text-gray-400 uppercase font-bold block">Comprobante NIIF (Financiero)</span>
                  <span class="font-bold text-indigo-950 text-xs">${txNIIFDesc}</span>
                  <span class="text-xxs text-gray-500 block truncate max-w-xs">${deprStatus.txNIIF ? esc(deprStatus.txNIIF.description) : 'Libro NIIF'}</span>
                </div>
                <span class="badge badge-indigo text-xxs font-bold">NIIF</span>
              </div>
              <div class="p-3 bg-white/90 rounded-xl border border-amber-100 flex items-center justify-between">
                <div>
                  <span class="text-xxs text-gray-400 uppercase font-bold block">Comprobante Fiscal (Tributario)</span>
                  <span class="font-bold text-gray-800 text-xs">${txFiscalDesc}</span>
                  <span class="text-xxs text-gray-500 block truncate max-w-xs">${deprStatus.txFiscal ? esc(deprStatus.txFiscal.description) : 'Libro Fiscal'}</span>
                </div>
                <span class="badge badge-gray text-xxs font-bold">Fiscal</span>
              </div>
            </div>

            <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/60">
              <div class="text-xxs text-amber-800 flex items-center gap-1.5">
                <i class="fas fa-info-circle text-amber-600"></i>
                ${deprStatus.hasSubsequentPosted 
                  ? `<span class="text-rose-700 font-semibold">Existen ${deprStatus.subsequentTxCount} periodo(s) posterior(es) contabilizado(s). Por regla cronológica LIFO, debe levantar primero el periodo más reciente.</span>` 
                  : 'Para corregir o recalcular este periodo, puede levantar la liquidación: anulará los comprobantes contables y restaurará los saldos.'}
              </div>
              <div>
                <button class="btn btn-sm ${deprStatus.hasSubsequentPosted ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-danger'}" 
                        id="btn-depr-revert" 
                        ${deprStatus.hasSubsequentPosted ? 'disabled' : ''} 
                        data-month="${month}">
                  <i class="fas fa-undo-alt mr-1.5"></i>Levantar Liquidación del Periodo
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (deprStatus.state === 'inconsistent') {
        stateBadge = '<span class="badge badge-rose"><i class="fas fa-triangle-exclamation mr-1"></i>Inconsistencia Detectada</span>';

        statusCard = `
          <div class="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-3 text-xs text-rose-950">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-base shadow-sm">
                  <i class="fas fa-triangle-exclamation"></i>
                </span>
                <div>
                  <h5 class="font-bold text-rose-900 text-sm">Registros Huérfanos en Periodo ${month}</h5>
                  <p class="text-xxs text-rose-700">Se encontraron ${deprStatus.checkEventItems.length} registro(s) de intentos previos, pero <strong>no existe comprobante contable activo</strong> en el libro diario. Subsanelos para procesar en limpio.</p>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" id="btn-depr-clean-orphan" data-month="${month}">
                <i class="fas fa-broom mr-1.5"></i>Subsanar y Limpiar Inconsistencia
              </button>
            </div>
          </div>
        `;
      } else if (eligibleItems.length === 0) {
        stateBadge = '<span class="badge badge-gray"><i class="fas fa-calendar-xmark mr-1"></i>Sin activos elegibles en el periodo</span>';
      } else {
        stateBadge = `<span class="badge badge-green"><i class="fas fa-check mr-1"></i>${eligibleItems.length} activo(s) listo(s) para procesar</span>`;
      }

      output.innerHTML = `
        <div class="space-y-4">
          ${statusCard}
          <div class="flex flex-wrap justify-between items-center gap-2 pb-3 border-b" style="border-color:#EEF0F5">
            <div>
              <h5 class="text-xs font-bold text-gray-800">Proyección de Depreciación para el Periodo: ${month}</h5>
              <p class="text-xxs text-gray-400">Activos incluidos en el cálculo del mes: <strong>${eligibleItems.length}</strong> · Activos omitidos por fecha o tope: <strong>${excludedItems.length}</strong></p>
            </div>
            ${stateBadge}
          </div>

          <div class="overflow-x-auto">
            <table class="data-table text-xxs">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Activo / Vigencia</th>
                  <th>Costo Histórico</th>
                  <th>V. Residual NIIF</th>
                  <th>Modalidad</th>
                  <th class="text-right">Cuota Mensual NIIF</th>
                  <th class="text-right">Cuota Mensual Fiscal</th>
                  <th class="text-right">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                <tr class="font-bold bg-gray-50 border-t-2" style="border-color:#CBD5E1">
                  <td colspan="5" class="py-2">TOTALES A CONTABILIZAR (${eligibleItems.length} ACTIVOS)</td>
                  <td class="text-right text-indigo-900">${formatCOP(totalNIIF)}</td>
                  <td class="text-right text-gray-800">${formatCOP(totalFiscal)}</td>
                  <td class="text-right text-amber-700">${formatCOP(totalNIIF - totalFiscal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${excludedSectionHtml}
        </div>
      `;

      // Actualizar botón de procesamiento según el estado real
      const postBtn = document.getElementById('btn-depr-post') as HTMLButtonElement | null;
      if (postBtn) {
        postBtn.dataset.month = month;
        postBtn.dataset.state = deprStatus.state;

        if (deprStatus.state === 'posted') {
          postBtn.disabled = true;
          postBtn.classList.add('opacity-60', 'cursor-not-allowed');
          postBtn.title = 'Periodo ya contabilizado. Para volver a procesarlo, primero debe levantar la liquidación existente.';
          postBtn.innerHTML = `<i class="fas fa-lock mr-1.5"></i>Periodo Contabilizado`;
        } else if (deprStatus.state === 'inconsistent') {
          postBtn.disabled = true;
          postBtn.classList.add('opacity-60', 'cursor-not-allowed');
          postBtn.title = 'Se detectaron registros huérfanos. Presione "Subsanar y Limpiar Inconsistencia" antes de procesar.';
          postBtn.innerHTML = `<i class="fas fa-triangle-exclamation mr-1.5"></i>Requiere Subsanación`;
        } else if (eligibleItems.length === 0) {
          postBtn.disabled = true;
          postBtn.classList.add('opacity-60', 'cursor-not-allowed');
          postBtn.title = `No hay activos con cuota depreciable para el periodo ${month}.`;
          postBtn.innerHTML = `<i class="fas fa-ban mr-1.5"></i>Sin Activos Elegibles`;
        } else {
          postBtn.disabled = false;
          postBtn.classList.remove('opacity-60', 'cursor-not-allowed');
          postBtn.title = '';
          postBtn.innerHTML = `<i class="fas fa-floppy-disk mr-1.5"></i>Procesar y Contabilizar`;
        }
      }

      // Handler para Subsanar Inconsistencias Huérfanas
      $('#btn-depr-clean-orphan')?.addEventListener('click', () => {
        confirmDialog(
          'Subsanar Inconsistencia de Registros Huérfanos',
          `Se eliminarán los <strong>${deprStatus.checkEventItems.length}</strong> registro(s) de intentos huérfanos que no poseen comprobante contable asociado en el periodo <strong>${month}</strong>.<br><br>¿Desea limpiar estos registros y habilitar el periodo para liquidación?`,
          async () => {
            try {
              for (const ev of deprStatus.checkEventItems) {
                try { await pb.delete('niif_asset_events', ev.id); } catch (_) {}
              }
              showToast(`Inconsistencia del periodo ${month} subsanada con éxito.`, 'success');
              $('#btn-depr-proj')?.click();
            } catch (err: any) {
              showToast('Error al subsanar registros: ' + err.message, 'error');
            }
          }
        );
      });

      // Handler para Levantar / Reversar Liquidación
      $('#btn-depr-revert')?.addEventListener('click', () => {
        if (deprStatus.hasSubsequentPosted) {
          showToast(`No es posible levantar el periodo ${month}. Por integridad contable LIFO, debe levantar primero los periodos posteriores.`, 'warning', 5000);
          return;
        }

        const txNList = deprStatus.activeTxList.map((t: any) => t.number || t.id).join(', ');

        confirmDialog(
          'Levantar Liquidación Mensual',
          `¿Está seguro de que desea levantar la liquidación del periodo <strong>${month}</strong>?<br><br>
           <div class="p-3.5 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-900 space-y-2 mt-2">
             <div class="font-bold flex items-center gap-1.5 text-red-800">
               <i class="fas fa-triangle-exclamation"></i> Acciones contables de reversión:
             </div>
             <ul class="list-disc pl-4 space-y-1 text-red-700">
               <li>Se anularán formalmente los comprobantes contables (<strong>${txNList || 'Activos'}</strong>) pasándolos a estado <em>anulado (voided)</em>.</li>
               <li>Se descontarán las cuotas mensuales de la depreciación acumulada (NIIF y Fiscal) únicamente en la ficha de los activos que fueron depreciados en <strong>${month}</strong>.</li>
               <li>Se restaurará el periodo de última depreciación previo en cada activo afectado.</li>
               <li>Se reabrirá el periodo <strong>${month}</strong> para permitir una nueva proyección o ajuste.</li>
             </ul>
           </div>`,
          async () => {
            const revertBtn = $('#btn-depr-revert') as HTMLButtonElement | null;
            if (revertBtn) {
              revertBtn.disabled = true;
              revertBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>Levantando...`;
            }

            try {
              // 1. Anular comprobantes contables
              for (const tx of deprStatus.activeTxList) {
                await API.voidTransaction(tx.id, `Levantamiento de liquidación mensual de depreciación periodo ${month}`);
              }

              // 2. Mapear eventos del periodo por asset_id para reversar con exactitud solo los activos procesados en este mes
              const eventByAssetId = new Map<string, any>();
              for (const ev of deprStatus.checkEventItems) {
                if (ev.asset_id) {
                  eventByAssetId.set(ev.asset_id, ev);
                }
              }

              const fallbackPrevPeriod = getPreviousPeriod(month);
              for (const a of allDepreciableAssets) {
                const ev = eventByAssetId.get(a.id);
                const wasDepreciatedInMonth = Boolean(ev) || a.last_depreciation_period === month;
                if (!wasDepreciatedInMonth) continue;

                // Además verificar que el activo no sea de compra futura respecto al mes revertido
                const firstPeriod = getAssetFirstDepreciationPeriod(a);
                if (firstPeriod && month < firstPeriod && a.last_depreciation_period !== month && !ev) {
                  continue;
                }

                const isImm = Boolean(a.is_immediate_depreciation);
                const lifeNIIF = isImm ? 1 : (a.useful_life_niif || 1);
                const lifeFiscal = isImm ? 1 : (a.useful_life_fiscal || 1);
                const resVal = isImm ? 0 : (a.residual_value || 0);

                let revertNIIF = Math.round(((a.cost || 0) - resVal) / lifeNIIF);
                let revertFiscal = Math.round((a.cost || 0) / lifeFiscal);
                let restoredPeriod = fallbackPrevPeriod;

                // Si el evento guardó metadatos exactos [DEPR_META:niif=...;fiscal=...;prevPeriod=...], usarlos
                if (ev && typeof ev.description === 'string') {
                  const metaMatch = ev.description.match(/\[DEPR_META:niif=(\d+);fiscal=(\d+);prevPeriod=([^\]]*)\]/);
                  if (metaMatch) {
                    revertNIIF = Number(metaMatch[1]);
                    revertFiscal = Number(metaMatch[2]);
                    restoredPeriod = metaMatch[3] || '';
                  } else if (typeof ev.amount === 'number' && ev.amount > 0) {
                    revertNIIF = Math.round(ev.amount);
                  }
                }

                // Si la fecha de primera depreciación del activo es exactamente este mes `month`, al revertirlo queda sin depreciación previa ('')
                if (firstPeriod && firstPeriod === month && restoredPeriod < firstPeriod) {
                  restoredPeriod = '';
                }

                const currentAccumNIIF = Number(a.accumulated_depreciation_niif || 0);
                const currentAccumFiscal = Number(a.accumulated_depreciation_fiscal || 0);
                const minInitNIIF = Number(a.initial_depreciation_niif || 0);
                const minInitFiscal = Number(a.initial_depreciation_fiscal || 0);

                const newAccumNIIF = Math.max(minInitNIIF, currentAccumNIIF - revertNIIF);
                const newAccumFiscal = Math.max(minInitFiscal, currentAccumFiscal - revertFiscal);

                await pb.update('niif_assets', a.id, {
                  accumulated_depreciation_niif: newAccumNIIF,
                  accumulated_depreciation_fiscal: newAccumFiscal,
                  last_depreciation_period: restoredPeriod
                });
              }

              // 3. Eliminar eventos de ese periodo en niif_asset_events
              for (const ev of deprStatus.checkEventItems) {
                try { await pb.delete('niif_asset_events', ev.id); } catch (_) {}
              }

              // 4. Auditoría
              await API.logAudit('VOID', 'Depreciation Run', month, `Levantó y anuló la liquidación mensual de depreciación del periodo ${month}`);
              showToast(`Liquidación del periodo ${month} levantada con éxito. El periodo ha sido reabierto.`, 'success');

              // 5. Re-proyectar automáticamente para actualizar interfaz
              $('#btn-depr-proj')?.click();
            } catch (err: any) {
              showToast('Error al levantar liquidación: ' + err.message, 'error');
              if (revertBtn) {
                revertBtn.disabled = false;
                revertBtn.innerHTML = `<i class="fas fa-undo-alt mr-1.5"></i>Levantar Liquidación del Periodo`;
              }
            }
          },
          true
        );
      });

    } catch (err: any) {
      output.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-1.5"></i>Error al proyectar: ${esc(err.message)}</div>`;
    }
  });

  $('#btn-depr-post')?.addEventListener('click', async () => {
    const postBtn = $('#btn-depr-post') as HTMLButtonElement | null;
    if (!postBtn) return;
    const month = postBtn.dataset.month || getInputVal('depr-month') || todayStr().slice(0, 7);

    // Validación estricta de bloqueo
    if (currentDeprStatus && currentDeprStatus.state === 'posted') {
      showToast(`El periodo ${month} ya se encuentra contabilizado en firme. Para volver a procesarlo debe levantar primero dicha liquidación.`, 'error', 6000);
      return;
    }

    if (currentDeprStatus && currentDeprStatus.state === 'inconsistent') {
      showToast(`El periodo ${month} posee registros huérfanos. Por favor presione "Subsanar y Limpiar Inconsistencia" antes de continuar.`, 'warning', 6000);
      return;
    }

    const selectedTxTypeId = getInputVal('depr-tx-type') || (txTypes.find((t: any) => t.code === 'NA') || txTypes[0])?.id;
    const selectedTxType = txTypes.find((t: any) => t.id === selectedTxTypeId) || txTypes[0];

    confirmDialog(
      'Contabilizar Depreciación Mensual',
      `¿Desea procesar y contabilizar la depreciación del periodo <strong>${month}</strong>?<br><br>
       <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-left text-xs text-indigo-950 space-y-2">
         <div><strong>Tipo de Comprobante seleccionado:</strong> <span class="font-bold text-indigo-900">${esc(selectedTxType.code)} - ${esc(selectedTxType.name)} (${esc(selectedTxType.prefix || selectedTxType.code)})</span></div>
         <p class="text-xxs text-indigo-700">Se generarán 2 comprobantes independientes (Comprobante NIIF y Comprobante Fiscal) en el libro diario únicamente para los activos elegibles en el periodo <strong>${month}</strong>.</p>
       </div>`,
      async () => {
        postBtn.disabled = true;
        postBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>Procesando...`;

        try {
          const [categories, rawAssets] = await Promise.all([
            pb.listAll('niif_asset_categories'),
            pb.listAll('niif_assets', { filter: 'status="active" || status="in_repair"', expand: 'category_id' })
          ]);
          const eligibleList = rawAssets
            .filter((a: any) => a.is_depreciable !== false)
            .map((a: any) => ({ asset: a, evalRes: evaluateAssetDepreciationForPeriod(a, month) }))
            .filter(({ evalRes }) => evalRes.eligible);

          activeAssetsForDepr = eligibleList.map(x => x.asset);
          const catMap = new Map(categories.map((c: any) => [c.id, c]));

          const unmappedCats = new Set<string>();
          const niifLines: any[] = [];
          const fiscalLines: any[] = [];
          const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

          eligibleList.forEach(({ asset: a, evalRes }) => {
            const cat = catMap.get(a.category_id);
            if (!cat) {
              unmappedCats.add('Sin categoría asignada');
              return;
            }

            if (!cat.account_depr_expense_id || !cat.account_depr_accum_id) {
              unmappedCats.add(`${cat.code} - ${cat.name}`);
            }

            const deprNIIF = evalRes.deprNIIF;
            const deprFiscal = evalRes.deprFiscal;
            const isImm = Boolean(a.is_immediate_depreciation);
            const modeTag = isImm ? ' [Depr. Inmediata ≤50 UVT]' : '';

            const assetThirdPartyId = a.provider_id || null;

            if (deprNIIF > 0 && cat.account_depr_expense_id && cat.account_depr_accum_id) {
              niifLines.push({
                account_id: cat.account_depr_expense_id,
                debit: Math.round(deprNIIF),
                credit: 0,
                description: `Depr. contable NIIF mes ${month} de activo ${a.code}${modeTag}`,
                cost_center_id: a.cost_center_id || null,
                third_party_id: assetThirdPartyId,
                line_order: niifLines.length + 1
              });
              niifLines.push({
                account_id: cat.account_depr_accum_id,
                debit: 0,
                credit: Math.round(deprNIIF),
                description: `Depr. acum. contable NIIF mes ${month} de activo ${a.code}${modeTag}`,
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
                description: `Depr. tributaria fiscal mes ${month} de activo ${a.code}${modeTag}`,
                cost_center_id: a.cost_center_id || null,
                third_party_id: assetThirdPartyId,
                line_order: fiscalLines.length + 1
              });
              fiscalLines.push({
                account_id: cat.account_depr_accum_id,
                debit: 0,
                credit: Math.round(deprFiscal),
                description: `Depr. acum. fiscal mes ${month} de activo ${a.code}${modeTag}`,
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
            showToast(`No hay activos elegibles con saldo por depreciar en ${month} o faltan cuentas PUC parametrizadas.`, 'warning');
            postBtn.disabled = false;
            postBtn.innerHTML = `<i class="fas fa-floppy-disk mr-1.5"></i>Procesar y Contabilizar`;
            return;
          }

          const [yrStr, moStr] = month.split('-');
          const lastDayVal = new Date(Number(yrStr), Number(moStr), 0).getDate();
          const txPostingDate = `${month}-${String(lastDayVal).padStart(2, '0')}`;

          let txNIIFId = "";
          if (niifLines.length > 0) {
            const txDataNIIF = {
              tx_type_id: selectedTxTypeId,
              number: 'AUTO',
              date: txPostingDate,
              description: `Causación Depreciación Contable NIIF - Periodo ${month}`,
              book_type: 'niif',
              cross_enabled: true,
              cross_type: 'DEPRE_MENSUAL_NIIF',
              cross_number: month,
              idempotency_key: `depre_niif_${month}_${Date.now()}`
            };
            const createdTxNIIF = await API.createTransaction(txDataNIIF, niifLines);
            txNIIFId = createdTxNIIF.id;
          }

          let txFiscalId = "";
          if (fiscalLines.length > 0) {
            const txDataFiscal = {
              tx_type_id: selectedTxTypeId,
              number: 'AUTO',
              date: txPostingDate,
              description: `Causación Depreciación Tributaria Fiscal - Periodo ${month}`,
              book_type: 'local',
              cross_enabled: true,
              cross_type: 'DEPRE_MENSUAL_FISCAL',
              cross_number: month,
              idempotency_key: `depre_fiscal_${month}_${Date.now()}`
            };
            const createdTxFiscal = await API.createTransaction(txDataFiscal, fiscalLines);
            txFiscalId = createdTxFiscal.id;
          }

          for (const { asset: a, evalRes } of eligibleList) {
            const isImm = Boolean(a.is_immediate_depreciation);
            const resVal = isImm ? 0 : (a.residual_value || 0);
            const maxNIIF = Math.max(0, (a.cost || 0) - resVal);
            const maxFiscal = a.cost || 0;
            const prevAccumNIIF = Number(a.accumulated_depreciation_niif || a.initial_depreciation_niif || 0);
            const prevAccumFiscal = Number(a.accumulated_depreciation_fiscal || a.initial_depreciation_fiscal || 0);

            const deprNIIF = evalRes.deprNIIF;
            const deprFiscal = evalRes.deprFiscal;

            // Actualizar acumulados persistentes y último periodo en la ficha del activo
            const newAccumNIIF = Math.min(maxNIIF, prevAccumNIIF + Math.round(deprNIIF));
            const newAccumFiscal = Math.min(maxFiscal, prevAccumFiscal + Math.round(deprFiscal));

            if (deprNIIF > 0 || deprFiscal > 0) {
              const metaStr = `[DEPR_META:niif=${Math.round(deprNIIF)};fiscal=${Math.round(deprFiscal)};prevPeriod=${a.last_depreciation_period || ''}]`;
              await pb.create('niif_asset_events', {
                asset_id: a.id,
                event_type: 'mejora',
                date: todayStr(),
                description: `Depreciación mensual procesada para el periodo ${month}${isImm ? ' (Depreciación Inmediata ≤50 UVT)' : ''}. Cuota NIIF: ${formatCOP(deprNIIF)} | Fiscal: ${formatCOP(deprFiscal)}. ${metaStr}`,
                amount: Math.round(deprNIIF),
                previous_value: prevAccumNIIF,
                new_value: newAccumNIIF,
                transaction_id: txNIIFId || txFiscalId || ''
              });
            }

            await pb.update('niif_assets', a.id, {
              accumulated_depreciation_niif: newAccumNIIF,
              accumulated_depreciation_fiscal: newAccumFiscal,
              last_depreciation_period: month
            });
          }

          await API.logAudit('CREATE', 'Depreciation Run', month, `Corrió depreciación mensual del periodo ${month}`);
          showToast('Depreciación mensual contabilizada con éxito (comprobantes NIIF y Fiscal generados)', 'success');
          await renderSubTabDepreciacion(c);
        } catch (err: any) {
          showToast('Error al contabilizar depreciación: ' + err.message, 'error');
          postBtn.disabled = false;
          postBtn.innerHTML = `<i class="fas fa-floppy-disk mr-1.5"></i>Procesar y Contabilizar`;
        }
      }
    );
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
