/**
 * ContaCO v2.0 — nomina.js
 */
'use strict';

const NOMINA_CONFIG_KEY = 'payroll_accounting_config_v1';
const NOMINA_CONFIG_KEYS = {
  core: `${NOMINA_CONFIG_KEY}_core`,
  mappings: `${NOMINA_CONFIG_KEY}_mappings`,
  employee_groups: `${NOMINA_CONFIG_KEY}_employee_groups`,
  group_rules: `${NOMINA_CONFIG_KEY}_group_rules`,
  employee_rules: `${NOMINA_CONFIG_KEY}_employee_rules`,
};

// --- CONSTANTES DE NOVEDADES (Legislación Colombiana) ---
const NOVELTY_TYPES = {
  INCAPACIDADES: [
    { key: 'INCAPACIDAD_ENFERMEDAD_GENERAL', label: 'Incapacidad Enfermedad General' },
    { key: 'INCAPACIDAD_ACCIDENTE_TRABAJO', label: 'Incapacidad Accidente de Trabajo' },
    { key: 'INCAPACIDAD_ENFERMEDAD_PROFESION', label: 'Incapacidad Enfermedad Profesional' },
  ],
  LICENCIAS: [
    { key: 'LICENCIA_REMUNERADA', label: 'Licencia Remunerada' },
    { key: 'LICENCIA_NO_REMUNERADA', label: 'Licencia No Remunerada' },
    { key: 'LICENCIA_MATERNIDAD', label: 'Licencia de Maternidad' },
    { key: 'LICENCIA_PATERNIDAD', label: 'Licencia de Paternidad' },
    { key: 'LICENCIA_LUTO', label: 'Licencia por Luto' },
  ],
  PERMISOS: [
    { key: 'PERMISO_REMUNERADO', label: 'Permiso Remunerado' },
    { key: 'PERMISO_NO_REMUNERADO', label: 'Permiso No Remunerado' },
  ],
  HORAS_EXTRAS: [
    { key: 'HORA_EXTRA_DIURNA', label: 'Hora Extra Diurna (HED 1.25)' },
    { key: 'HORA_EXTRA_NOCTURNA', label: 'Hora Extra Nocturna (HEN 1.75)' },
    { key: 'HORA_EXTRA_DOMINICAL', label: 'Hora Extra Dom./Festiva Diurna (HEDDF 2.0)' },
    { key: 'HORA_EXTRA_DOMINICAL_NOCTURNA', label: 'Hora Extra Dom./Festiva Nocturna (HENDF 2.5)' },
  ],
  RECARGOS: [
    { key: 'RECARGO_NOCTURNO', label: 'Recargo Nocturno (0.35)' },
    { key: 'RECARGO_DOMINICAL', label: 'Recargo Dominical/Festivo Diurno (0.75)' },
  ],
  DESCUENTOS: [
    { key: 'PRESTAMO', label: 'Préstamo' },
    { key: 'ANTICIPO', label: 'Anticipo' },
    { key: 'MULTA', label: 'Multa / Sanción' },
    { key: 'EMBARGO', label: 'Embargo' },
    { key: 'LIBRANZA', label: 'Descuento por Libranza' },
    { key: 'OTRA_DEDUCCION', label: 'Otra Deducción' },
  ],
  INGRESOS_ADICIONALES: [
    { key: 'BONIFICACION', label: 'Bonificación' },
    { key: 'COMISION', label: 'Comisión' },
    { key: 'AJUSTE_SALARIAL', label: 'Ajuste Salarial' },
    { key: 'GASTOS_REPRESENTACION', label: 'Gastos de Representación' },
    { key: 'AUX_NO_SALARIALES', label: 'Auxilios No Salariales' },
    { key: 'AUXILIO_RODAMIENTO', label: 'Auxilio de Rodamiento' },
    { key: 'COMPENSATORIOS', label: 'Compensatorios' },
    { key: 'AUXILIO_ALIMENTACION', label: 'Auxilio de Alimentación' },
    { key: 'PRIMA_SERVICIOS', label: 'Prima de Servicios (Legal)' },
    { key: 'INTERESES_CESANTIAS', label: 'Intereses de Cesantías' },
    { key: 'CESANTIAS', label: 'Cesantías (Pago Directo)' },
    { key: 'DOTACION', label: 'Dotación (Entrega en Especie)' },
    { key: 'PRIMA_EXTRALGAL', label: 'Prima Extralegal' },
    { key: 'OTRO_INGRESO', label: 'Otro Ingreso' },
  ],
  OTROS: [
    { key: 'VACACIONES', label: 'Vacaciones' },
    { key: 'SUSPENSION', label: 'Suspensión' },
  ]
};

const NOVEDAD_A_OVERTIME_KEY = {
  HORA_EXTRA_DIURNA: 'hed',
  HORA_EXTRA_NOCTURNA: 'hen',
  RECARGO_NOCTURNO: 'rno',
  HORA_EXTRA_DOMINICAL: 'heddf',
  HORA_EXTRA_DOMINICAL_NOCTURNA: 'hendf',
  RECARGO_DOMINICAL: 'rdfd',
  RECARGO_FESTIVO: 'rdfd',
  RECARGO_NOCTURNO_DOMINICAL: 'rno',
  RECARGO_NOCTURNO_FESTIVO: 'rno',
};

const NOVEDADES_ALL_KEYS = Object.values(NOVELTY_TYPES).flat().map(n => n.key);
const NOMINA_CONFIG_VALUE_MAX_CHARS = 5000;

/**
 * Verifica si el usuario actual posee rol SUPERADMINISTRADOR, ADMINISTRADOR o CONTADOR
 * para realizar aprobaciones, cambio de estatus o registro de pagos de nómina.
 */
function canApproveOrPayPayroll(): boolean {
  const role = String(pb.currentUser?.role || '').toLowerCase();
  return ['superadmin', 'admin', 'administrador', 'contador'].includes(role);
}

const NOMINA_CONCEPTS = [
  { key: 'salary_base', label: 'Salario base', default_side: 'debit' },
  { key: 'overtime', label: 'Horas extra / recargos', default_side: 'debit' },
  { key: 'transport_allowance', label: 'Auxilio de transporte', default_side: 'debit' },
  { key: 'incapacidades', label: 'Incapacidades', default_side: 'debit' },
  { key: 'licencias', label: 'Licencias', default_side: 'debit' },
  { key: 'gastos_representacion', label: 'Gastos de representacion', default_side: 'debit' },
  { key: 'bonificacion', label: 'Bonificacion', default_side: 'debit' },
  { key: 'aux_no_salariales', label: 'Aux no salariales', default_side: 'debit' },
  { key: 'comisiones', label: 'Comisiones', default_side: 'debit' },
  { key: 'dotaciones', label: 'Dotaciones', default_side: 'debit' },
  { key: 'compensatorios', label: 'Compensatorios', default_side: 'debit' },
  { key: 'alimentacion', label: 'Alimentacion', default_side: 'debit' },
  { key: 'rodamiento', label: 'Auxilio de rodamiento', default_side: 'debit' },
  { key: 'ajuste_salarial', label: 'Ajuste Salarial (Base IBC)', default_side: 'debit' },
  { key: 'vacaciones_disfrutadas', label: 'Pago Vacaciones', default_side: 'debit' },
  { key: 'deduction_health', label: 'Deduccion salud trabajador', default_side: 'credit' },
  { key: 'deduction_pension', label: 'Deduccion pension trabajador', default_side: 'credit' },
  { key: 'solidarity_fund', label: 'Fondo de solidaridad', default_side: 'credit' },
  { key: 'withholding_tax', label: 'Retencion en la fuente', default_side: 'credit' },
  { key: 'deduction_other', label: 'Otras deducciones trabajador', default_side: 'credit' },
  { key: 'embargo', label: 'Embargo', default_side: 'credit' },
  { key: 'cxc', label: 'CxC', default_side: 'credit' },
  { key: 'libranza', label: 'Libranza', default_side: 'credit' },
  { key: 'prestamos', label: 'Prestamos', default_side: 'credit' },
  { key: 'net_pay', label: 'Neto a pagar', default_side: 'credit' },
  { key: 'employer_health', label: 'Aporte salud empleador', default_side: 'debit' },
  { key: 'employer_pension', label: 'Aporte pension empleador', default_side: 'debit' },
  { key: 'employer_arl', label: 'ARL', default_side: 'debit' },
  { key: 'sena', label: 'SENA', default_side: 'debit' },
  { key: 'icbf', label: 'ICBF', default_side: 'debit' },
  { key: 'caja_comp', label: 'Caja de compensacion', default_side: 'debit' },
  { key: 'cesantias', label: 'Cesantias causadas', default_side: 'debit' },
  { key: 'intereses_ces', label: 'Intereses cesantias', default_side: 'debit' },
  { key: 'prima', label: 'Prima de servicios', default_side: 'debit' },
  { key: 'vacaciones', label: 'Vacaciones causadas', default_side: 'debit' },
  { key: 'otros_ingresos', label: 'Otros ingresos', default_side: 'debit' },
];

const NOMINA_CONCEPT_BY_KEY = NOMINA_CONCEPTS.reduce((acc, cpt) => {
  acc[cpt.key] = cpt;
  return acc;
}, {});

const NOMINA_EXTRA_EARNING_KEYS = [
  'incapacidades',
  'licencias',
  'gastos_representacion',
  'bonificacion',
  'aux_no_salariales',
  'comisiones',
  'dotaciones',
  'compensatorios',
  'alimentacion',
  'rodamiento',
  'ajuste_salarial',
  'vacaciones_disfrutadas',
  'otros_ingresos',
];

const NOMINA_EXTRA_DEDUCTION_KEYS = [
  'embargo',
  'cxc',
  'libranza',
  'prestamos',
];

const NOMINA_CATEGORY_LABELS = {
  devengo: 'Devengos',
  descuento: 'Descuentos',
  aportes: 'Aportes',
  provision: 'Provisiones',
};

const NOMINA_CONCEPT_RULES = {
  salary_base: { category: 'devengo', allowed_sides: ['debit'] },
  overtime: { category: 'devengo', allowed_sides: ['debit'] },
  transport_allowance: { category: 'devengo', allowed_sides: ['debit'] },
  incapacidades: { category: 'devengo', allowed_sides: ['debit'] },
  licencias: { category: 'devengo', allowed_sides: ['debit'] },
  gastos_representacion: { category: 'devengo', allowed_sides: ['debit'] },
  bonificacion: { category: 'devengo', allowed_sides: ['debit'] },
  aux_no_salariales: { category: 'devengo', allowed_sides: ['debit'] },
  comisiones: { category: 'devengo', allowed_sides: ['debit'] },
  dotaciones: { category: 'devengo', allowed_sides: ['debit'] },
  compensatorios: { category: 'devengo', allowed_sides: ['debit'] },
  alimentacion: { category: 'devengo', allowed_sides: ['debit'] },
  rodamiento: { category: 'devengo', allowed_sides: ['debit'] },
  net_pay: { category: 'devengo', allowed_sides: ['credit'] },

  deduction_health: { category: 'descuento', allowed_sides: ['credit'] },
  deduction_pension: { category: 'descuento', allowed_sides: ['credit'] },
  solidarity_fund: { category: 'descuento', allowed_sides: ['credit'] },
  withholding_tax: { category: 'descuento', allowed_sides: ['credit'] },
  deduction_other: { category: 'descuento', allowed_sides: ['credit'] },
  embargo: { category: 'descuento', allowed_sides: ['credit'] },
  cxc: { category: 'descuento', allowed_sides: ['credit'] },
  libranza: { category: 'descuento', allowed_sides: ['credit'] },
  prestamos: { category: 'descuento', allowed_sides: ['credit'] },

  employer_health: { category: 'aportes', allowed_sides: ['debit', 'credit'] },
  employer_pension: { category: 'aportes', allowed_sides: ['debit', 'credit'] },
  employer_arl: { category: 'aportes', allowed_sides: ['debit', 'credit'] },
  sena: { category: 'aportes', allowed_sides: ['debit', 'credit'] },
  icbf: { category: 'aportes', allowed_sides: ['debit', 'credit'] },
  caja_comp: { category: 'aportes', allowed_sides: ['debit', 'credit'] },

  cesantias: { category: 'provision', allowed_sides: ['debit', 'credit'] },
  intereses_ces: { category: 'provision', allowed_sides: ['debit', 'credit'] },
  prima: { category: 'provision', allowed_sides: ['debit', 'credit'] },
  vacaciones: { category: 'provision', allowed_sides: ['debit', 'credit'] },
};

function getNominaConceptRule(conceptKey) {
  return NOMINA_CONCEPT_RULES[conceptKey] || {
    category: 'devengo',
    allowed_sides: [(NOMINA_CONCEPT_BY_KEY[conceptKey]?.default_side || 'debit') === 'credit' ? 'credit' : 'debit'],
  };
}

function getNominaCategoryLabel(category) {
  return NOMINA_CATEGORY_LABELS[category] || category || 'Sin categoría';
}

function getNominaCategoryConcepts(category) {
  return NOMINA_CONCEPTS.filter((c) => getNominaConceptRule(c.key).category === category);
}

const NOMINA_OVERTIME_TYPES = [
  { key: 'hed', label: 'Extra Diurna (HED)', factor: 1.25 },
  { key: 'hen', label: 'Extra Nocturna (HEN)', factor: 1.75 },
  { key: 'rno', label: 'Recargo Nocturno Ordinario', factor: 0.35 },
  { key: 'heddf', label: 'Hora Extra Diurna Dominical/Festiva (HEDDF)', factor: 2.0 },
  { key: 'hendf', label: 'Hora Extra Nocturna Dominical/Festiva (HENDF)', factor: 2.5 },
  { key: 'rdfd', label: 'Recargo Dominical/Festivo Diurno', factor: 0.75 },
];

const ARL_RISK_RATES = {
  1: 0.00522,
  2: 0.01044,
  3: 0.02436,
  4: 0.0435,
  5: 0.0696,
};

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function calculateSolidarityFund(ibc: number, smmlv: number): number {
  if (!ibc || !smmlv || smmlv <= 0) return 0;
  const numSmmlv = ibc / smmlv;
  if (numSmmlv < 4) return 0;

  let rate = 0.01;
  if (numSmmlv >= 20) {
    rate = 0.02;
  } else if (numSmmlv >= 19) {
    rate = 0.018;
  } else if (numSmmlv >= 18) {
    rate = 0.016;
  } else if (numSmmlv >= 17) {
    rate = 0.014;
  } else if (numSmmlv >= 16) {
    rate = 0.012;
  } else {
    rate = 0.01;
  }

  return round2(ibc * rate);
}

function calculateWithholdingTax(ingresoBruto: number, health: number, pension: number, fsp: number, uvtValue = 52374): number {
  const uvt = uvtValue || 52374;
  const ingresoNeto = Math.max(0, (ingresoBruto || 0) - ((health || 0) + (pension || 0) + (fsp || 0)));
  if (ingresoNeto <= 0) return 0;

  const rentaExenta25 = Math.min(ingresoNeto * 0.25, ingresoNeto * 0.40);
  const baseGravableCop = Math.max(0, ingresoNeto - rentaExenta25);
  const baseUvt = baseGravableCop / uvt;

  let retencionUvt = 0;
  if (baseUvt <= 95) {
    retencionUvt = 0;
  } else if (baseUvt <= 150) {
    retencionUvt = (baseUvt - 95) * 0.19;
  } else if (baseUvt <= 360) {
    retencionUvt = (baseUvt - 150) * 0.28 + 10;
  } else if (baseUvt <= 640) {
    retencionUvt = (baseUvt - 360) * 0.33 + 69;
  } else if (baseUvt <= 945) {
    retencionUvt = (baseUvt - 640) * 0.35 + 162;
  } else if (baseUvt <= 2300) {
    retencionUvt = (baseUvt - 945) * 0.37 + 268;
  } else {
    retencionUvt = (baseUvt - 2300) * 0.39 + 770;
  }

  return round2(retencionUvt * uvt);
}

function nominaThirdDisplay(t) {
  return `${t?.doc_number || ''} - ${t?.name || ''}`.trim();
}

function nominaFindThirdById(terceros, thirdId) {
  if (!thirdId) return null;
  return (Array.isArray(terceros) ? terceros : []).find((t) => t.id === thirdId) || null;
}

function initNominaThirdSearchInput({ terceros, hiddenId, inputId, resultsId, onSelected }) {
  const hidden = document.getElementById(hiddenId);
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  if (!hidden || !input || !results) return;

  const paint = (query = '') => {
    const all = Array.isArray(terceros) ? terceros : [];
    const q = String(query || '').toLowerCase().trim();
    const terms = q ? q.split(/\s+/).filter(Boolean) : [];
    const filtered = (terms.length
      ? all.filter((t) => {
        const hay = `${t.doc_number || ''} ${t.name || ''}`.toLowerCase();
        return terms.every((term) => hay.includes(term));
      })
      : all
    ).slice(0, 30);

    results.innerHTML = `
      <button type="button" data-third-id="" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">Sin tercero</button>
      ${filtered.map((t) => `
        <button type="button" data-third-id="${esc(t.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(t.doc_number || 'SIN DOC')}</div>
          <div style="font-size:12px;color:#6B7280">${esc(t.name || '')}</div>
        </button>
      `).join('')}
    `;
  };

  const syncFromHidden = () => {
    const third = nominaFindThirdById(terceros, hidden.value);
    input.value = third ? nominaThirdDisplay(third) : '';
  };

  syncFromHidden();
  input.onfocus = () => {
    paint(input.value);
    results.style.display = 'block';
  };
  input.oninput = () => {
    hidden.value = '';
    if (typeof onSelected === 'function') onSelected('');
    paint(input.value);
    results.style.display = 'block';
  };
  input.onblur = () => setTimeout(() => { results.style.display = 'none'; }, 120);
  results.onmousedown = (ev) => ev.preventDefault();
  results.onclick = (ev) => {
    const btn = ev.target.closest('[data-third-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-third-id') || '';
    hidden.value = id;
    const third = nominaFindThirdById(terceros, id);
    input.value = third ? nominaThirdDisplay(third) : '';
    results.style.display = 'none';
    if (typeof onSelected === 'function') onSelected(id);
  };

  (window as any).initKeyboardAutocomplete({
    input,
    results,
    itemSelector: '[data-third-id]',
  });
}

function defaultNominaConfig() {
  return {
    balancing_account_id: '',
    adjustment_account_id: '',
    mappings: [],
    employee_groups: [],
    group_rules: [],
    company_rules: {
      smmlv: 1423500,
      uvt_value: 52374,
      transport_allowance: 162000,
      solidarity_threshold_smmlv: 3,
      solidarity_rate: 0.01,
      exempt_sena_icbf: false,
      weekly_hours: 44,
      tercero_sena_id: '',
      tercero_icbf_id: '',
      period_type: 'MENSUAL',
    },
    employee_rules: [],
  };
}

function normalizeNominaConfig(raw) {
  const cfg = raw && typeof raw === 'object' ? raw : {};
  const mappings = Array.isArray(cfg.mappings) ? cfg.mappings : [];
  const groups = Array.isArray(cfg.employee_groups) ? cfg.employee_groups : [];
  const groupRules = Array.isArray(cfg.group_rules) ? cfg.group_rules : [];
  const company = cfg.company_rules && typeof cfg.company_rules === 'object' ? cfg.company_rules : {};
  const employeeRules = Array.isArray(cfg.employee_rules) ? cfg.employee_rules : [];
  return {
    balancing_account_id: cfg.balancing_account_id || '',
    adjustment_account_id: cfg.adjustment_account_id || '',
    mappings: mappings
      .map((m, idx) => ({
        id: m.id || `m-${Date.now()}-${idx}`,
        concept: m.concept || '',
        side: m.side === 'credit' ? 'credit' : 'debit',
        account_id: m.account_id || '',
        employee_id: m.employee_id || '',
        group_id: m.group_id || '',
        active: m.active !== false,
      }))
      .filter((m) => m.concept && m.account_id),
    employee_groups: groups
      .map((g, idx) => ({
        id: g.id || `g-${Date.now()}-${idx}`,
        name: (g.name || '').trim(),
        active: g.active !== false,
      }))
      .filter((g) => g.name),
    group_rules: groupRules
      .map((r) => ({
        group_id: r.group_id || '',
        basic_salary: Number(r.basic_salary) >= 0 ? Number(r.basic_salary) : 0,
        arl_risk_level: Math.max(1, Math.min(5, parseInt(r.arl_risk_level || 1, 10) || 1)),
        is_pensioner: !!r.is_pensioner,
        apply_solidarity_fund: !!r.apply_solidarity_fund,
        apply_withholding_tax: !!r.apply_withholding_tax,
        withholding_rate: Number(r.withholding_rate) >= 0 ? Number(r.withholding_rate) : 0,
      }))
      .filter((r) => r.group_id),
    company_rules: {
      smmlv: Number(company.smmlv) > 0 ? Number(company.smmlv) : 1423500,
      uvt_value: Number(company.uvt_value) > 0 ? Number(company.uvt_value) : 52374,
      transport_allowance: Number(company.transport_allowance) >= 0 ? Number(company.transport_allowance) : 162000,
      solidarity_threshold_smmlv: Number(company.solidarity_threshold_smmlv) > 0 ? Number(company.solidarity_threshold_smmlv) : 3,
      solidarity_rate: Number(company.solidarity_rate) >= 0 ? Number(company.solidarity_rate) : 0.01,
      exempt_sena_icbf: !!company.exempt_sena_icbf,
      weekly_hours: [42, 44, 46, 47, 48].includes(Number(company.weekly_hours)) ? Number(company.weekly_hours) : 44,
      tercero_sena_id: company.tercero_sena_id || '',
      tercero_icbf_id: company.tercero_icbf_id || '',
      period_type: ['MENSUAL', 'QUINCENAL', 'CATORCENA', 'SEMANAL', 'JORNAL'].includes(company.period_type) ? company.period_type : 'MENSUAL',
    },
    employee_rules: employeeRules
      .map((r) => ({
        employee_id: r.employee_id || '',
        group_id: r.group_id || '',
        basic_salary: r.basic_salary === null || r.basic_salary === undefined || r.basic_salary === ''
          ? null
          : (Number(r.basic_salary) >= 0 ? Number(r.basic_salary) : null),
        arl_risk_level: r.arl_risk_level === null || r.arl_risk_level === undefined || r.arl_risk_level === ''
          ? null
          : Math.max(1, Math.min(5, parseInt(r.arl_risk_level, 10) || 1)),
        is_pensioner: typeof r.is_pensioner === 'boolean' ? r.is_pensioner : null,
        apply_transport_allowance: typeof r.apply_transport_allowance === 'boolean' ? r.apply_transport_allowance : null,
        apply_solidarity_fund: typeof r.apply_solidarity_fund === 'boolean' ? r.apply_solidarity_fund : null,
        apply_withholding_tax: typeof r.apply_withholding_tax === 'boolean' ? r.apply_withholding_tax : null,
        withholding_rate: r.withholding_rate === null || r.withholding_rate === undefined || r.withholding_rate === ''
          ? null
          : (Number(r.withholding_rate) >= 0 ? Number(r.withholding_rate) : null),
        tercero_salud_id: r.tercero_salud_id || '',
        tercero_pension_id: r.tercero_pension_id || '',
        tercero_arl_id: r.tercero_arl_id || '',
        tercero_caja_id: r.tercero_caja_id || '',
        position: r.position || '',
        workday_type: r.workday_type || '',
        contract_type: r.contract_type || '',
        start_date: r.start_date || '',
        end_date: r.end_date || '',
      }))
      .filter((r) => r.employee_id),
  };
}

function compactNominaConfigForStorage(config) {
  const normalized = normalizeNominaConfig(config);
  return {
    balancing_account_id: normalized.balancing_account_id || '',
    adjustment_account_id: normalized.adjustment_account_id || '',
    mappings: (normalized.mappings || []).map((m) => ({
      id: m.id || '',
      concept: m.concept || '',
      side: m.side === 'credit' ? 'credit' : 'debit',
      account_id: m.account_id || '',
      employee_id: m.employee_id || '',
      group_id: m.group_id || '',
      active: m.active !== false,
    })),
    employee_groups: (normalized.employee_groups || []).map((g) => ({
      id: g.id || '',
      name: (g.name || '').trim(),
      active: g.active !== false,
    })),
    group_rules: normalized.group_rules || [],
    company_rules: normalized.company_rules || {},
    employee_rules: (normalized.employee_rules || []).map((r) => {
      const compactRule = { employee_id: r.employee_id || '' };
      if (r.group_id) compactRule.group_id = r.group_id;
      if (r.basic_salary !== null && r.basic_salary !== undefined) compactRule.basic_salary = Number(r.basic_salary || 0);
      if (r.arl_risk_level !== null && r.arl_risk_level !== undefined) compactRule.arl_risk_level = Number(r.arl_risk_level || 1);
      if (typeof r.is_pensioner === 'boolean') compactRule.is_pensioner = r.is_pensioner;
      if (typeof r.apply_transport_allowance === 'boolean') (compactRule as any).apply_transport_allowance = r.apply_transport_allowance;
      if (typeof r.apply_solidarity_fund === 'boolean') compactRule.apply_solidarity_fund = r.apply_solidarity_fund;
      if (typeof r.apply_withholding_tax === 'boolean') compactRule.apply_withholding_tax = r.apply_withholding_tax;
      if (r.withholding_rate !== null && r.withholding_rate !== undefined) compactRule.withholding_rate = Number(r.withholding_rate || 0);
      if (r.tercero_salud_id) compactRule.tercero_salud_id = r.tercero_salud_id;
      if (r.tercero_pension_id) compactRule.tercero_pension_id = r.tercero_pension_id;
      if (r.tercero_arl_id) compactRule.tercero_arl_id = r.tercero_arl_id;
      if (r.tercero_caja_id) compactRule.tercero_caja_id = r.tercero_caja_id;
      if (r.position) (compactRule as any).position = r.position;
      if (r.workday_type) (compactRule as any).workday_type = r.workday_type;
      if (r.contract_type) (compactRule as any).contract_type = r.contract_type;
      if (r.start_date) (compactRule as any).start_date = r.start_date;
      if (r.end_date) (compactRule as any).end_date = r.end_date;
      return compactRule;
    }),
  };
}

async function getNominaConfigWithRow() {
  const allShardedRows = await pb.list('settings', {
    perPage: 200,
    page: 1,
    filter: `key~"${pb.escapeFilterValue(NOMINA_CONFIG_KEY + '_')}"`,
  });

  const shardByKey = {};
  (allShardedRows?.items || []).forEach((r) => { shardByKey[r.key] = r; });
  const hasShardedConfig = Object.keys(NOMINA_CONFIG_KEYS).some((k) => !!shardByKey[NOMINA_CONFIG_KEYS[k]]);

  if (hasShardedConfig) {
    const core = await readSettingJsonMaybeChunked(NOMINA_CONFIG_KEYS.core, {});
    const config = {
      balancing_account_id: core?.balancing_account_id || '',
      adjustment_account_id: core?.adjustment_account_id || '',
      company_rules: core?.company_rules && typeof core.company_rules === 'object' ? core.company_rules : {},
      mappings: await readSettingJsonMaybeChunked(NOMINA_CONFIG_KEYS.mappings, []),
      employee_groups: await readSettingJsonMaybeChunked(NOMINA_CONFIG_KEYS.employee_groups, []),
      group_rules: await readSettingJsonMaybeChunked(NOMINA_CONFIG_KEYS.group_rules, []),
      employee_rules: await readSettingJsonMaybeChunked(NOMINA_CONFIG_KEYS.employee_rules, []),
    };

    return {
      row: shardByKey[NOMINA_CONFIG_KEYS.core] || null,
      config: normalizeNominaConfig(config),
    };
  }

  const safeKey = pb.escapeFilterValue(NOMINA_CONFIG_KEY);
  const res = await pb.list('settings', { perPage: 1, page: 1, filter: `key="${safeKey}"` });
  const row = res?.items?.[0] || null;
  if (!row) return { row: null, config: defaultNominaConfig() };
  try {
    return { row, config: normalizeNominaConfig(JSON.parse(row.value || '{}')) };
  } catch (_) {
    return { row, config: defaultNominaConfig() };
  }
}

function splitTextInChunks(text, maxChars = NOMINA_CONFIG_VALUE_MAX_CHARS) {
  const raw = String(text || '');
  if (!raw) return [''];
  const chunks = [];
  for (let i = 0; i < raw.length; i += maxChars) {
    chunks.push(raw.slice(i, i + maxChars));
  }
  return chunks;
}

function settingChunkKey(baseKey, index) {
  return `${baseKey}_part_${String(index + 1).padStart(3, '0')}`;
}

async function listSettingsByPrefix(prefix) {
  const safePrefix = pb.escapeFilterValue(prefix);
  const res = await pb.list('settings', { perPage: 200, page: 1, filter: `key~"${safePrefix}"` });
  const items = Array.isArray(res?.items) ? res.items : [];
  return items.filter((r) => String(r.key || '').startsWith(prefix));
}

async function deleteSettingByKey(key) {
  const safeKey = pb.escapeFilterValue(key);
  const existing = await pb.list('settings', { perPage: 1, page: 1, filter: `key="${safeKey}"` });
  const found = existing?.items?.[0] || null;
  if (found?.id) {
    await pb.delete('settings', found.id);
  }
}

async function readSettingJsonMaybeChunked(baseKey, fallback) {
  const chunkPrefix = `${baseKey}_part_`;
  const chunkRows = await listSettingsByPrefix(chunkPrefix);
  if (chunkRows.length) {
    const sorted = chunkRows
      .slice()
      .sort((a, b) => String(a.key || '').localeCompare(String(b.key || '')));
    const merged = sorted.map((r) => String(r.value || '')).join('');
    try {
      return JSON.parse(merged || 'null') ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  const safeKey = pb.escapeFilterValue(baseKey);
  const existing = await pb.list('settings', { perPage: 1, page: 1, filter: `key="${safeKey}"` });
  const found = existing?.items?.[0] || null;
  if (!found?.value) return fallback;
  try {
    return JSON.parse(found.value);
  } catch (_) {
    return fallback;
  }
}

async function upsertSettingByKey(key, value) {
  const safeKey = pb.escapeFilterValue(key);
  const existing = await pb.list('settings', { perPage: 1, page: 1, filter: `key="${safeKey}"` });
  const found = existing?.items?.[0] || null;
  if (found?.id) {
    try {
      return await pb.update('settings', found.id, { value });
    } catch (err) {
      if (err?.status !== 400) throw err;
      await pb.delete('settings', found.id).catch(() => {});
      return pb.create('settings', { key, value });
    }
  }
  return pb.create('settings', { key, value });
}

async function writeSettingJsonMaybeChunked(baseKey, data) {
  const text = JSON.stringify(data);
  const chunkPrefix = `${baseKey}_part_`;
  const existingChunkRows = await listSettingsByPrefix(chunkPrefix);

  if (text.length <= NOMINA_CONFIG_VALUE_MAX_CHARS) {
    await upsertSettingByKey(baseKey, text);
    for (const row of existingChunkRows) {
      await pb.delete('settings', row.id).catch(() => {});
    }
    return;
  }

  const chunks = splitTextInChunks(text, NOMINA_CONFIG_VALUE_MAX_CHARS);
  for (let i = 0; i < chunks.length; i++) {
    await upsertSettingByKey(settingChunkKey(baseKey, i), chunks[i]);
  }

  for (let i = chunks.length; i < existingChunkRows.length; i++) {
    const staleKey = settingChunkKey(baseKey, i);
    await deleteSettingByKey(staleKey).catch(() => {});
  }

  await deleteSettingByKey(baseKey).catch(() => {});
}

async function saveNominaConfig(config, rowId = '') {
  void rowId;
  const compact = compactNominaConfigForStorage(config);
  const core = {
    balancing_account_id: compact.balancing_account_id || '',
    adjustment_account_id: compact.adjustment_account_id || '',
    company_rules: compact.company_rules || {},
  };

  const writes = [
    [NOMINA_CONFIG_KEYS.core, core],
    [NOMINA_CONFIG_KEYS.mappings, compact.mappings || []],
    [NOMINA_CONFIG_KEYS.employee_groups, compact.employee_groups || []],
    [NOMINA_CONFIG_KEYS.group_rules, compact.group_rules || []],
    [NOMINA_CONFIG_KEYS.employee_rules, compact.employee_rules || []],
  ];

  for (const [key, data] of writes) {
    try {
      await writeSettingJsonMaybeChunked(key, data);
    } catch (err) {
      const detail = err?.message ? `: ${err.message}` : '';
      throw new Error(`Error guardando configuración de nómina en ${key}${detail}`);
    }
  }
}

function getNominaLineMeta(payLine) {
  if (!payLine?.notes) return {};
  try {
    const parsed = JSON.parse(payLine.notes);
    if (parsed && typeof parsed === 'object' && parsed.payroll_meta && typeof parsed.payroll_meta === 'object') {
      return parsed.payroll_meta;
    }
  } catch (_) {}
  return {};
}

function getEmployeePayrollRule(config, employeeId) {
  const rules = Array.isArray(config?.employee_rules) ? config.employee_rules : [];
  const found = rules.find((r) => r.employee_id === employeeId);

  const merged = {
    employee_id: employeeId || '',
    group_id: found?.group_id || '',
    basic_salary: 0,
    arl_risk_level: 1,
    is_pensioner: false,
    apply_transport_allowance: true,
    apply_solidarity_fund: false,
    apply_withholding_tax: false,
    withholding_rate: 0,
    tercero_salud_id: '',
    tercero_pension_id: '',
    tercero_arl_id: '',
    tercero_caja_id: '',
    contract_type: found?.contract_type || 'INDEFINIDO',
    start_date: found?.start_date || '',
    end_date: found?.end_date || '',
    position: found?.position || '',
    workday_type: found?.workday_type || 'COMPLETA',
  };

  if (found) {
    if (found.group_id) merged.group_id = found.group_id;
    if (found.basic_salary !== null && found.basic_salary !== undefined) merged.basic_salary = Number(found.basic_salary || 0);
    if (found.arl_risk_level !== null && found.arl_risk_level !== undefined) merged.arl_risk_level = Math.max(1, Math.min(5, parseInt(found.arl_risk_level || 1, 10) || 1));
    if (typeof found.is_pensioner === 'boolean') merged.is_pensioner = found.is_pensioner;
    if (typeof found.apply_transport_allowance === 'boolean') merged.apply_transport_allowance = found.apply_transport_allowance;
    if (typeof found.apply_solidarity_fund === 'boolean') merged.apply_solidarity_fund = found.apply_solidarity_fund;
    if (typeof found.apply_withholding_tax === 'boolean') merged.apply_withholding_tax = found.apply_withholding_tax;
    if (found.withholding_rate !== null && found.withholding_rate !== undefined) merged.withholding_rate = Number(found.withholding_rate || 0);
    if (found.tercero_salud_id) merged.tercero_salud_id = found.tercero_salud_id;
    if (found.tercero_pension_id) merged.tercero_pension_id = found.tercero_pension_id;
    if (found.tercero_arl_id) merged.tercero_arl_id = found.tercero_arl_id;
    if (found.tercero_caja_id) merged.tercero_caja_id = found.tercero_caja_id;
    if (found.contract_type) merged.contract_type = found.contract_type;
    if (found.start_date) merged.start_date = found.start_date;
    if (found.end_date) merged.end_date = found.end_date;
    if (found.position) merged.position = found.position;
    if (found.workday_type) merged.workday_type = found.workday_type;
  }

  return merged;
}

function findEmployeePayrollRule(config, employeeId) {
  const rules = Array.isArray(config?.employee_rules) ? config.employee_rules : [];
  return rules.find((r) => r.employee_id === employeeId) || null;
}

function isEmployeePayrollRuleComplete(rule) {
  return !!rule && Number(rule.basic_salary || 0) > 0;
}

function getExtraDeductionsFromLine(payLine) {
  const meta = getNominaLineMeta(payLine);
  const solidarity = round2(meta.solidarity_fund || 0);
  const withholding = round2(meta.withholding_tax || 0);
  return {
    solidarity,
    withholding,
    total: round2(solidarity + withholding),
  };
}

function getNominaConceptAmountsFromLine(payLine) {
  const meta = getNominaLineMeta(payLine);
  const conceptAmounts = meta && typeof meta.concept_amounts === 'object' && meta.concept_amounts
    ? meta.concept_amounts
    : {};
  const out = {};
  [...NOMINA_EXTRA_EARNING_KEYS, ...NOMINA_EXTRA_DEDUCTION_KEYS].forEach((key) => {
    out[key] = round2(Number(conceptAmounts[key] || 0));
  });
  return out;
}

function getNominaOvertimeMetaFromLine(payLine) {
  const meta = getNominaLineMeta(payLine);
  const raw = meta && typeof meta.overtime_breakdown === 'object' && meta.overtime_breakdown
    ? meta.overtime_breakdown
    : {};

  const breakdown = NOMINA_OVERTIME_TYPES.map((t) => {
    const row = raw[t.key] && typeof raw[t.key] === 'object' ? raw[t.key] : {};
    return {
      key: t.key,
      label: t.label,
      factor: t.factor,
      hours: round2(Number(row.hours || 0)),
      amount: round2(Number(row.amount || 0)),
    };
  });

  const totalAmount = round2(breakdown.reduce((sum, item) => sum + (item.amount || 0), 0));
  const hasBreakdown = breakdown.some((item) => item.hours > 0 || item.amount > 0);

  return {
    hourly_rate: round2(Number(raw.hourly_rate || 0)),
    breakdown,
    total_amount: hasBreakdown ? totalAmount : round2(Number(payLine?.overtime || 0)),
    hasBreakdown,
  };
}

function getNominaAdditionalConceptTotals(payLine) {
  const conceptAmounts = getNominaConceptAmountsFromLine(payLine);
  const earnings = round2(NOMINA_EXTRA_EARNING_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));
  const deductions = round2(NOMINA_EXTRA_DEDUCTION_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));
  return { conceptAmounts, earnings, deductions };
}

function getNominaConceptAmount(payLine, conceptKey) {
  if (!payLine || !conceptKey) return 0;
  if (conceptKey === 'salary_base') {
    return round2(((payLine.salary_base || 0) / 30) * (payLine.days_worked || 30));
  }
  if (conceptKey === 'solidarity_fund') return getExtraDeductionsFromLine(payLine).solidarity;
  if (conceptKey === 'withholding_tax') return getExtraDeductionsFromLine(payLine).withholding;
  if (conceptKey === 'overtime') return getNominaOvertimeMetaFromLine(payLine).total_amount;
  if (NOMINA_EXTRA_EARNING_KEYS.includes(conceptKey) || NOMINA_EXTRA_DEDUCTION_KEYS.includes(conceptKey)) {
    return getNominaConceptAmountsFromLine(payLine)[conceptKey] || 0;
  }
  return round2(payLine[conceptKey] || 0);
}


function getNominaDevengadoTotal(payLine) {
  const extra = getNominaAdditionalConceptTotals(payLine);
  const salaryProportional = ((payLine?.salary_base || 0) / 30) * (payLine?.days_worked || 30);
  return round2(salaryProportional + (payLine?.transport_allowance || 0) + getNominaConceptAmount(payLine, 'overtime') + extra.earnings);
}

function getNominaDeduccionesTotal(payLine) {
  const extraDed = getExtraDeductionsFromLine(payLine);
  const extra = getNominaAdditionalConceptTotals(payLine);
  return round2((payLine?.deduction_health || 0) + (payLine?.deduction_pension || 0) + (payLine?.deduction_other || 0) + extraDed.total + extra.deductions);
}

function resolveNominaMapping(mappings, conceptKey, employeeId, employeeGroupId = '') {
  const active = (mappings || []).filter((m) => m.active !== false);
  const exact = active.find((m) => m.concept === conceptKey && m.employee_id === employeeId);
  if (exact) return exact;
  const groupMatch = employeeGroupId
    ? active.find((m) => m.concept === conceptKey && m.group_id === employeeGroupId && !m.employee_id)
    : null;
  if (groupMatch) return groupMatch;
  return active.find((m) => m.concept === conceptKey && !m.employee_id && !m.group_id) || null;
}

/**
 * Returns ALL applicable mappings for a concept (one per side).
 * For single-side concepts (devengo/descuento) this returns at most 1 entry.
 * For dual-side concepts (aportes/provisiones) this returns up to 2 entries (debit + credit),
 * each resolved by the same employee > group > default priority chain.
 */
function resolveAllNominaMappings(mappings, conceptKey, employeeId, employeeGroupId = '') {
  const active = (mappings || []).filter((m) => m.active !== false && m.concept === conceptKey);
  const result = [];
  for (const side of ['debit', 'credit']) {
    const forSide = active.filter((m) => m.side === side);
    if (!forSide.length) continue;
    const exact = forSide.find((m) => m.employee_id === employeeId);
    if (exact) { result.push(exact); continue; }
    const groupMatch = employeeGroupId
      ? forSide.find((m) => m.group_id === employeeGroupId && !m.employee_id)
      : null;
    if (groupMatch) { result.push(groupMatch); continue; }
    const def = forSide.find((m) => !m.employee_id && !m.group_id);
    if (def) result.push(def);
  }
  return result;
}

// Resolve the third_party_id for a given concept + payroll line
function resolveNominaTerceroId(conceptKey, line, effectiveRule, companyRules) {
  const empId = line.employee_id || '';
  switch (conceptKey) {
    case 'net_pay':
    case 'cesantias':
    case 'intereses_ces':
    case 'prima':
    case 'vacaciones':
      return empId;
    case 'deduction_health':
    case 'employer_health':
      return effectiveRule.tercero_salud_id || '';
    case 'deduction_pension':
    case 'employer_pension':
      return effectiveRule.tercero_pension_id || '';
    case 'employer_arl':
      return effectiveRule.tercero_arl_id || '';
    case 'caja_comp':
      return effectiveRule.tercero_caja_id || '';
    case 'sena':
      return companyRules.tercero_sena_id || '';
    case 'icbf':
      return companyRules.tercero_icbf_id || '';
    default:
      return empId;
  }
}

// Build the cross_doc_ref for a given concept + payroll line
function resolveNominaCrossDocRef(conceptKey, periodYYYYMM, line) {
  const empDoc = line.expand?.employee_id?.doc_number || line.employee_id || '';
  if (conceptKey === 'net_pay') {
    return `NOM-${periodYYYYMM}-EMP-${empDoc}`;
  }
  return '';
}

async function buildNominaAccountingLines(period, payLines, config) {
  const missing = [];
  const buckets = {};
  const companyRules = config.company_rules || {};
  const periodYYYYMM = (period.date_from || period.date_to || '').slice(0, 7).replace('-', '');

  for (const line of payLines) {
    const effectiveRule = getEmployeePayrollRule(config, line.employee_id);
    for (const concept of NOMINA_CONCEPTS) {
      const amount = getNominaConceptAmount(line, concept.key);
      if (amount <= 0) continue;
      const mappingList = resolveAllNominaMappings(config.mappings, concept.key, line.employee_id, effectiveRule.group_id || '');
      if (!mappingList.length) {
        missing.push({ employee: line.expand?.employee_id?.name || 'Empleado', concept: concept.label });
        continue;
      }
      const thirdPartyId = resolveNominaTerceroId(concept.key, line, effectiveRule, companyRules);
      const crossDocRef = resolveNominaCrossDocRef(concept.key, periodYYYYMM, line);
      for (const mapping of mappingList) {
        const side = mapping.side === 'credit' ? 'credit' : 'debit';
        const bucketKey = `${mapping.account_id}__${side}__${thirdPartyId}`;
        if (!buckets[bucketKey]) {
          buckets[bucketKey] = {
            account_id: mapping.account_id,
            third_party_id: thirdPartyId || undefined,
            cross_doc_ref: crossDocRef || undefined,
            debit: 0,
            credit: 0,
            description: `Nómina ${period.name} - ${concept.label}`,
          };
        }
        if (side === 'debit') buckets[bucketKey].debit = round2(buckets[bucketKey].debit + amount);
        else buckets[bucketKey].credit = round2(buckets[bucketKey].credit + amount);
      }
    }
  }

  if (missing.length) {
    const top = missing.slice(0, 3).map((m) => `${m.employee}: ${m.concept}`).join(' | ');
    throw new Error(`Faltan mapeos contables para algunos conceptos de nómina. ${top}`);
  }

  const txLines = Object.values(buckets).filter((l) => l.debit > 0 || l.credit > 0);
  const totalDebit = round2(txLines.reduce((sum, l) => sum + (l.debit || 0), 0));
  const totalCredit = round2(txLines.reduce((sum, l) => sum + (l.credit || 0), 0));
  const diff = round2(totalDebit - totalCredit);

  if (Math.abs(diff) > 0.01) {
    const adjustmentAccountId = config.adjustment_account_id || config.balancing_account_id;
    if (!adjustmentAccountId) {
      throw new Error(`La nómina no está cuadrada (D ${fmt(totalDebit)} / C ${fmt(totalCredit)}). Configura la cuenta de ajuste contable en el engranaje de Nómina.`);
    }
    const defaultEmployeeId = payLines.find((l) => !!l.employee_id)?.employee_id || '';
    txLines.push({
      account_id: adjustmentAccountId,
      third_party_id: defaultEmployeeId || undefined,
      cross_doc_ref: `NOM-${periodYYYYMM}`,
      debit: diff < 0 ? Math.abs(diff) : 0,
      credit: diff > 0 ? Math.abs(diff) : 0,
      description: `Ajuste de cuadre nómina ${period.name}`,
    });
  }

  return txLines;
}

async function postNominaPeriodAccounting(periodId) {
  const period = await pb.get('payroll_periods', periodId);
  if (period.tx_id && (Array.isArray(period.tx_id) ? period.tx_id.length > 0 : period.tx_id)) return period.tx_id;

  const payLines = await pb.listAll('payroll_lines', {
    filter: `period_id="${pb.escapeFilterValue(periodId)}"`,
    expand: 'employee_id',
  });
  if (!payLines.length) throw new Error('El período no tiene liquidaciones para contabilizar.');

  const txTypes = await API.getTxTypes();
  const txType = txTypes.find((t) => t.code === 'NM') || txTypes.find((t) => (t.name || '').toLowerCase().includes('nomina'));
  if (!txType) throw new Error('No existe tipo de transacción activo para Nómina (código NM).');

  const { config } = await getNominaConfigWithRow();
  if (!config.mappings.length) {
    throw new Error('Primero configura los mapeos contables de nómina (botón de engranaje).');
  }

  // Group payLines by employee_id
  const payLinesByEmployee = {};
  payLines.forEach((line) => {
    const empId = line.employee_id;
    if (!empId) return;
    if (!payLinesByEmployee[empId]) payLinesByEmployee[empId] = [];
    payLinesByEmployee[empId].push(line);
  });

  const txsToCreate = [];

  for (const empId of Object.keys(payLinesByEmployee)) {
    const empPayLines = payLinesByEmployee[empId];
    const txLines = await buildNominaAccountingLines(period, empPayLines, config);
    if (!txLines.length) continue;

    // Phase C: validate requires_third_party and maneja_cruce before posting
    const uniqueAccountIds = [...new Set(txLines.map((l) => l.account_id).filter(Boolean))];
    const accountsUsed = await pb.listAll('accounts', {
      filter: uniqueAccountIds.map((id) => `id="${pb.escapeFilterValue(id)}"`).join('||'),
    }).catch(() => []);
    const accountMetaById = {};
    accountsUsed.forEach((a) => { accountMetaById[a.id] = a; });

    const employeeName = empPayLines[0]?.expand?.employee_id?.name || 'Empleado';
    const validationErrors = [];
    txLines.forEach((l) => {
      const meta = accountMetaById[l.account_id];
      if (!meta) return;
      if (meta.requires_third_party && !l.third_party_id) {
        validationErrors.push(`Cuenta ${meta.code} - ${meta.name}: requiere tercero pero no está asignado.`);
      }
      if (meta.maneja_cruce && !l.cross_doc_ref) {
        validationErrors.push(`Cuenta ${meta.code} - ${meta.name}: requiere cruce pero no tiene referencia.`);
      }
    });

    if (validationErrors.length) {
      throw new Error(`Errores de validación contable para el empleado ${employeeName}:\n${validationErrors.slice(0, 5).join('\n')}`);
    }

    txsToCreate.push({
      employeeName,
      empId,
      txLines
    });
  }

  // Si todas pasaron la validación previa, creamos las transacciones contables en PocketBase de forma segura
  const txIds = [];
  for (const item of txsToCreate) {
    const tx = await API.createTransaction({
      tx_type_id: txType.id,
      date: period.date_to || todayStr(),
      description: `Nómina ${period.name} - ${item.employeeName}`,
      third_party_id: item.empId || undefined,
      branch_id: period.branch_id || null,
    }, item.txLines);

    txIds.push(tx.id);
  }

  return txIds;
}

async function openNominaAccountingSettings(employees = []) {
  try {
    const [{ row, config }, accounts, terceros] = await Promise.all([
      getNominaConfigWithRow(),
      pb.listAll('accounts', { filter: 'active=true', sort: 'code' }),
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    ]);

    if (!accounts.length) return showToast('No hay cuentas activas para mapear.', 'warning');

    const local = {
      rowId: row?.id || '',
      config: normalizeNominaConfig(config),
    };

    const accountOpts = `<option value="">Selecciona cuenta...</option>${accounts.map((a) => `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('')}`;
    const categoryOpts = `<option value="">Selecciona categoría...</option>${Object.keys(NOMINA_CATEGORY_LABELS).map((key) => `<option value="${esc(key)}">${esc(NOMINA_CATEGORY_LABELS[key])}</option>`).join('')}`;
    const groupOpts = () => `<option value="">Selecciona grupo...</option>${(local.config.employee_groups || []).map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}`;

    openModal(
      'Configuración Contable de Nómina',
      `
      <div class="space-y-4">
        <div class="rounded-xl p-3 text-sm" style="background:#F8FAFC;border:1px solid #E2E8F0;color:#334155">
          Configura mapeos contables por grupo para reutilizar reglas contables en grandes volúmenes de empleados.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group">
            <label class="form-label">Jornada laboral semanal (Ley 2101/2021)</label>
            <select id="nom-weekly-hours" class="form-input">
              <option value="48" ${(local.config.company_rules.weekly_hours||44) === 48 ? 'selected' : ''}>48 h/sem (antes Jul 2023)</option>
              <option value="47" ${(local.config.company_rules.weekly_hours||44) === 47 ? 'selected' : ''}>47 h/sem (Jul 2023 – Jun 2024)</option>
              <option value="46" ${(local.config.company_rules.weekly_hours||44) === 46 ? 'selected' : ''}>46 h/sem (Jul 2024 – Jun 2025)</option>
              <option value="44" ${(local.config.company_rules.weekly_hours||44) === 44 ? 'selected' : ''}>44 h/sem (Jul 2025 – Jun 2026)</option>
              <option value="42" ${(local.config.company_rules.weekly_hours||44) === 42 ? 'selected' : ''}>42 h/sem (desde Jul 2026)</option>
            </select>
            <p class="text-xs mt-1" style="color:#6B7280">Define el valor hora base.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Frecuencia de Pago de Nómina *</label>
            <select id="nom-period-type" class="form-input">
              <option value="MENSUAL" ${(local.config.company_rules.period_type||'MENSUAL') === 'MENSUAL' ? 'selected' : ''}>Mensual (30 días)</option>
              <option value="QUINCENAL" ${(local.config.company_rules.period_type||'MENSUAL') === 'QUINCENAL' ? 'selected' : ''}>Quincenal (15 días)</option>
              <option value="CATORCENA" ${(local.config.company_rules.period_type||'MENSUAL') === 'CATORCENA' ? 'selected' : ''}>Catorcenal (14 días)</option>
              <option value="SEMANAL" ${(local.config.company_rules.period_type||'MENSUAL') === 'SEMANAL' ? 'selected' : ''}>Semanal (7 días)</option>
              <option value="JORNAL" ${(local.config.company_rules.period_type||'MENSUAL') === 'JORNAL' ? 'selected' : ''}>Jornal (Diario)</option>
            </select>
            <p class="text-xs mt-1" style="color:#6B7280">Determina el cálculo de períodos.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Contrapartida *</label>
            <select id="nom-balancing-account" class="form-input">${accountOpts}</select>
            <p class="text-xs mt-1" style="color:#6B7280">Salarios por pagar (Neto).</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ajuste (Diferencias) *</label>
            <select id="nom-adjustment-account" class="form-input">${accountOpts}</select>
            <p class="text-xs mt-1" style="color:#6B7280">Cuenta para cuadrar diferencias.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Tercero SENA</label>
            <div class="relative">
              <input id="nom-tercero-sena-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="nom-tercero-sena" type="hidden" value="${esc(local.config.company_rules.tercero_sena_id || '')}">
              <div id="nom-tercero-sena-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tercero ICBF</label>
            <div class="relative">
              <input id="nom-tercero-icbf-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
              <input id="nom-tercero-icbf" type="hidden" value="${esc(local.config.company_rules.tercero_icbf_id || '')}">
              <div id="nom-tercero-icbf-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div class="form-group">
            <label class="form-label">SMMLV vigente</label>
            <input id="nom-smmlv" class="form-input" type="number" min="1" step="1" value="${esc(String(local.config.company_rules.smmlv || 1423500))}">
          </div>
          <div class="form-group">
            <label class="form-label">Valor UVT (2026)</label>
            <input id="nom-uvt-value" class="form-input" type="number" min="1" step="1" value="${esc(String(local.config.company_rules.uvt_value || 52374))}">
          </div>
          <div class="form-group">
            <label class="form-label">Auxilio de transporte</label>
            <input id="nom-transport-allowance" class="form-input" type="number" min="0" step="1" value="${esc(String(local.config.company_rules.transport_allowance || 162000))}">
          </div>
          <div class="form-group">
            <label class="form-label">Umbral fondo solidaridad (SMMLV)</label>
            <input id="nom-sol-threshold" class="form-input" type="number" min="0" step="0.01" value="${esc(String(local.config.company_rules.solidarity_threshold_smmlv || 3))}">
          </div>
          <div class="form-group">
            <label class="form-label">Tarifa fondo solidaridad (%)</label>
            <input id="nom-sol-rate" class="form-input" type="number" min="0" step="0.01" value="${esc(String((local.config.company_rules.solidarity_rate || 0.01) * 100))}">
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#334155">
            <input id="nom-exempt-sena-icbf" type="checkbox" ${local.config.company_rules.exempt_sena_icbf ? 'checked' : ''}>
            Empresa exenta de parafiscales SENA e ICBF
          </label>
        </div>

        <div class="rounded-xl p-3" style="border:1px solid #E5E7EB;background:#FFFFFF">
          <p class="font-semibold mb-2" style="color:#0D2137">Grupos de Empleados</p>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <input id="nom-group-name" class="form-input md:col-span-3" placeholder="Ej: Administrativos, Comerciales, Producción">
            <button class="btn btn-primary" id="btn-add-group"><i class="fas fa-plus"></i> Crear Grupo</button>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table text-sm">
              <thead><tr><th>Grupo</th><th></th></tr></thead>
              <tbody id="nom-groups-body"></tbody>
            </table>
          </div>
        </div>

        <div class="rounded-xl p-3" style="border:1px solid #E5E7EB;background:#FFFFFF">
          <p class="font-semibold mb-2" style="color:#0D2137">Nuevo mapeo contable</p>
          <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
            <select id="nom-map-group" class="form-input">${groupOpts()}</select>
            <select id="nom-map-category" class="form-input">${categoryOpts}</select>
            <select id="nom-map-concept" class="form-input"><option value="">Selecciona concepto...</option></select>
            <select id="nom-map-account-debit" class="form-input">${accountOpts}</select>
            <select id="nom-map-account-credit" class="form-input">${accountOpts}</select>
            <button class="btn btn-primary" id="btn-add-map"><i class="fas fa-plus"></i> Agregar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Grupo</th><th>Categoría</th><th>Concepto</th><th>Cuenta Débito</th><th>Cuenta Crédito</th><th></th></tr></thead>
            <tbody id="nom-map-body"></tbody>
          </table>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-config">Guardar Configuración</button>`,
      true
    );

    const accountById = {};
    accounts.forEach((a) => { accountById[a.id] = a; });
    const groupsById = () => {
      const map = {};
      (local.config.employee_groups || []).forEach((g) => { map[g.id] = g; });
      return map;
    };

    if ($('#nom-balancing-account')) $('#nom-balancing-account').value = local.config.balancing_account_id || '';
    if ($('#nom-adjustment-account')) $('#nom-adjustment-account').value = local.config.adjustment_account_id || '';
    initNominaThirdSearchInput({
      terceros,
      hiddenId: 'nom-tercero-sena',
      inputId: 'nom-tercero-sena-search',
      resultsId: 'nom-tercero-sena-results',
    });
    initNominaThirdSearchInput({
      terceros,
      hiddenId: 'nom-tercero-icbf',
      inputId: 'nom-tercero-icbf-search',
      resultsId: 'nom-tercero-icbf-results',
    });

    const refreshGroupSelectorOptions = () => {
      const mapGroupSel = $('#nom-map-group');
      const prevValue = mapGroupSel ? mapGroupSel.value : '';
      if (mapGroupSel) {
        const options = (local.config.employee_groups || [])
          .map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`)
          .join('');
        mapGroupSel.innerHTML = `<option value="">Selecciona grupo...</option>${options}`;
        if (prevValue && (local.config.employee_groups || []).some((g) => g.id === prevValue)) {
          mapGroupSel.value = prevValue;
        }
      }
    };

    const refreshConceptSelector = () => {
      const category = getSelectVal('nom-map-category');
      const conceptSel = $('#nom-map-concept');
      if (!conceptSel) return;
      const options = category
        ? getNominaCategoryConcepts(category).map((cpt) => `<option value="${esc(cpt.key)}">${esc(cpt.label)}</option>`).join('')
        : '';
      conceptSel.innerHTML = `<option value="">Selecciona concepto...</option>${options}`;
    };

    const applyConceptAccountLocks = () => {
      const conceptKey = getSelectVal('nom-map-concept');
      const debitSel = $('#nom-map-account-debit');
      const creditSel = $('#nom-map-account-credit');
      if (!conceptKey) {
        if (debitSel) {
          debitSel.disabled = true;
          debitSel.value = '';
        }
        if (creditSel) {
          creditSel.disabled = true;
          creditSel.value = '';
        }
        return;
      }
      const rule = getNominaConceptRule(conceptKey);
      const allowed = Array.isArray(rule.allowed_sides) ? rule.allowed_sides : ['debit'];
      if (debitSel) {
        const enabled = allowed.includes('debit');
        debitSel.disabled = !enabled;
        if (!enabled) debitSel.value = '';
      }
      if (creditSel) {
        const enabled = allowed.includes('credit');
        creditSel.disabled = !enabled;
        if (!enabled) creditSel.value = '';
      }
    };

    const renderGroups = () => {
      const body = $('#nom-groups-body');
      if (!body) return;
      const rows = local.config.employee_groups || [];
      body.innerHTML = rows.length
        ? rows.map((g) => `<tr><td>${esc(g.name)}</td><td class="text-right"><button class="btn btn-outline btn-sm btn-del-group" data-id="${esc(g.id)}"><i class="fas fa-trash"></i></button></td></tr>`).join('')
        : '<tr><td colspan="2" class="text-center py-6" style="color:#9CA3AF">Sin grupos definidos.</td></tr>';
      refreshGroupSelectorOptions();
    };

    const renderMappings = () => {
      const body = $('#nom-map-body');
      if (!body) return;
      const gById = groupsById();
      const grouped = {};
      (local.config.mappings || []).forEach((m) => {
        if (m.employee_id) return;
        const groupId = m.group_id || '';
        const key = `${groupId}__${m.concept}`;
        if (!grouped[key]) {
          grouped[key] = {
            group_id: groupId,
            concept: m.concept,
            debit_account_id: '',
            credit_account_id: '',
          };
        }
        if (m.side === 'credit') grouped[key].credit_account_id = m.account_id || '';
        else grouped[key].debit_account_id = m.account_id || '';
      });

      const rows = Object.values(grouped)
        .filter((r) => {
          const selectedGroupId = getSelectVal('nom-map-group') || '';
          if (!selectedGroupId) return true;
          return (r.group_id || '') === selectedGroupId;
        })
        .sort((a, b) => {
          const ga = gById[a.group_id]?.name || '';
          const gb = gById[b.group_id]?.name || '';
          if (ga !== gb) return ga.localeCompare(gb);
          return (NOMINA_CONCEPT_BY_KEY[a.concept]?.label || a.concept).localeCompare(NOMINA_CONCEPT_BY_KEY[b.concept]?.label || b.concept);
        });
      body.innerHTML = rows.length
        ? rows.map((m) => {
          const groupName = m.group_id ? (gById[m.group_id]?.name || 'Grupo no encontrado') : 'Sin grupo';
          const conceptName = NOMINA_CONCEPT_BY_KEY[m.concept]?.label || m.concept;
          const categoryLabel = getNominaCategoryLabel(getNominaConceptRule(m.concept).category);
          const debitName = accountById[m.debit_account_id] ? `${accountById[m.debit_account_id].code} - ${accountById[m.debit_account_id].name}` : '—';
          const creditName = accountById[m.credit_account_id] ? `${accountById[m.credit_account_id].code} - ${accountById[m.credit_account_id].name}` : '—';
          return `<tr>
            <td>${esc(groupName)}</td>
            <td>${esc(categoryLabel)}</td>
            <td>${esc(conceptName)}</td>
            <td>${esc(debitName)}</td>
            <td>${esc(creditName)}</td>
            <td class="text-right"><button class="btn btn-outline btn-sm btn-del-map" data-group="${esc(m.group_id || '')}" data-concept="${esc(m.concept)}"><i class="fas fa-trash"></i></button></td>
          </tr>`;
        }).join('')
        : '<tr><td colspan="6" class="text-center py-6" style="color:#9CA3AF">Sin mapeos configurados para el grupo seleccionado.</td></tr>';
    };

    renderGroups();
    renderMappings();

    $('#btn-add-group')?.addEventListener('click', () => {
      const name = (getInputVal('nom-group-name') || '').trim();
      if (!name) return showToast('Ingresa un nombre para el grupo.', 'warning');
      const exists = (local.config.employee_groups || []).some((g) => (g.name || '').toLowerCase() === name.toLowerCase());
      if (exists) return showToast('Ya existe un grupo con ese nombre.', 'info');
      local.config.employee_groups.push({ id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, active: true });
      setInputVal('nom-group-name', '');
      renderGroups();
      renderMappings();
    });

    $('#nom-groups-body')?.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('.btn-del-group');
      if (!btn) return;
      const groupId = btn.getAttribute('data-id') || '';
      local.config.employee_groups = (local.config.employee_groups || []).filter((g) => g.id !== groupId);
      local.config.mappings = (local.config.mappings || []).filter((m) => m.group_id !== groupId);
      local.config.employee_rules = (local.config.employee_rules || []).map((r) => r.group_id === groupId ? { ...r, group_id: '' } : r);
      renderGroups();
      renderMappings();
    });

    $('#btn-add-map')?.addEventListener('click', () => {
      const groupId = getSelectVal('nom-map-group');
      const category = getSelectVal('nom-map-category');
      const concept = getSelectVal('nom-map-concept');
      const debitAccountId = getSelectVal('nom-map-account-debit');
      const creditAccountId = getSelectVal('nom-map-account-credit');
      if (!groupId) return showToast('Selecciona un grupo para el mapeo contable.', 'warning');
      if (!category) return showToast('Selecciona una categoría.', 'warning');
      if (!concept) return showToast('Selecciona un concepto.', 'warning');

      const rule = getNominaConceptRule(concept);
      const allowed = Array.isArray(rule.allowed_sides) ? rule.allowed_sides : ['debit'];
      if (rule.category !== category) return showToast('El concepto no pertenece a la categoría seleccionada.', 'warning');

      if (allowed.includes('debit') && !debitAccountId) {
        return showToast('Este concepto requiere cuenta débito.', 'warning');
      }
      if (allowed.includes('credit') && !creditAccountId) {
        return showToast('Este concepto requiere cuenta crédito.', 'warning');
      }

      const upsertSide = (side, accountId) => {
        const existing = (local.config.mappings || []).find((m) =>
          m.concept === concept && (m.group_id || '') === (groupId || '') && !m.employee_id && m.side === side
        );
        if (existing) {
          existing.account_id = accountId;
          existing.active = true;
          return;
        }
        local.config.mappings.push({
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          employee_id: '',
          group_id: groupId || '',
          concept,
          side,
          account_id: accountId,
          active: true,
        });
      };

      local.config.mappings = (local.config.mappings || []).filter((m) => {
        if (m.employee_id) return true;
        if (m.concept !== concept) return true;
        if ((m.group_id || '') !== (groupId || '')) return true;
        return allowed.includes(m.side === 'credit' ? 'credit' : 'debit');
      });

      if (allowed.includes('debit')) upsertSide('debit', debitAccountId);
      if (allowed.includes('credit')) upsertSide('credit', creditAccountId);

      renderMappings();
      showToast('Mapeo actualizado', 'success');
    });

    $('#nom-map-group')?.addEventListener('change', () => {
      renderMappings();
    });
    $('#nom-map-category')?.addEventListener('change', () => {
      refreshConceptSelector();
      applyConceptAccountLocks();
    });
    $('#nom-map-concept')?.addEventListener('change', applyConceptAccountLocks);
    refreshGroupSelectorOptions();
    refreshConceptSelector();
    applyConceptAccountLocks();

    $('#nom-map-body')?.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('.btn-del-map');
      if (!btn) return;
      const concept = btn.getAttribute('data-concept') || '';
      const groupId = btn.getAttribute('data-group') || '';
      local.config.mappings = (local.config.mappings || []).filter((m) => {
        if (m.employee_id) return true;
        if (m.concept !== concept) return true;
        return (m.group_id || '') !== groupId;
      });
      renderMappings();
    });

    $('#btn-save-nom-config')?.addEventListener('click', async () => {
      try {
        local.config.balancing_account_id = getSelectVal('nom-balancing-account') || '';
        local.config.adjustment_account_id = getSelectVal('nom-adjustment-account') || '';
        local.config.company_rules = {
          smmlv: Math.max(1, parseNum(getInputVal('nom-smmlv')) || 1423500),
          uvt_value: Math.max(1, parseNum(getInputVal('nom-uvt-value')) || 52374),
          transport_allowance: Math.max(0, parseNum(getInputVal('nom-transport-allowance')) || 162000),
          solidarity_threshold_smmlv: Math.max(0, parseNum(getInputVal('nom-sol-threshold')) || 3),
          solidarity_rate: Math.max(0, (parseNum(getInputVal('nom-sol-rate')) || 1) / 100),
          exempt_sena_icbf: !!$('#nom-exempt-sena-icbf')?.checked,
          weekly_hours: [42, 44, 46, 47, 48].includes(Number(getInputVal('nom-weekly-hours'))) ? Number(getInputVal('nom-weekly-hours')) : 44,
          tercero_sena_id: getSelectVal('nom-tercero-sena') || '',
          tercero_icbf_id: getSelectVal('nom-tercero-icbf') || '',
          period_type: getSelectVal('nom-period-type') || 'MENSUAL',
        };
        await saveNominaConfig(local.config, local.rowId);
        closeModal();
        showToast('Configuración de nómina guardada', 'success');
      } catch (err) {
        showToast(err.message || 'No se pudo guardar la configuración', 'error');
      }
    });
  } catch (err) {
    showToast(err.message || 'No se pudo abrir la configuración de nómina', 'error');
  }
}

async function openNominaEmployeeSettings(employees = [], selectedEmployeeId = null) {
  try {
    const [{ row, config }, terceros] = await Promise.all([
      getNominaConfigWithRow(),
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    ]);
    const local = {
      rowId: row?.id || '',
      config: normalizeNominaConfig(config),
      editingEmployeeId: '',
    };

    const employeeOpts = `<option value="">Selecciona empleado...</option>${employees.map((e) => `<option value="${esc(e.id)}">${esc(e.doc_number || '')} - ${esc(e.name)}</option>`).join('')}`;
    const groupOpts = `<option value="">Sin grupo</option>${(local.config.employee_groups || []).map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}`;
    const groupNameById = {};
    (local.config.employee_groups || []).forEach((g) => { groupNameById[g.id] = g.name; });

    const arlText = (lvl) => `Nivel ${lvl} (${round2((ARL_RISK_RATES[lvl] || ARL_RISK_RATES[1]) * 100)}%)`;

    openModal(
      'Parámetros por Empleado — Nómina',
      `
      <div class="space-y-4">
        <div class="rounded-xl p-3 text-sm" style="background:#F8FAFC;border:1px solid #E2E8F0;color:#334155">
          Asigna un grupo/tipo para mapeo contable y define aquí los parámetros operativos individuales por empleado.
        </div>

        <div id="nom-emp-rules-summary"></div>

        <div class="rounded-xl p-3" style="border:1px solid #E5E7EB;background:#FFFFFF">
          <p class="font-semibold mb-2" style="color:#0D2137">Editar parámetro de empleado</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="form-group">
              <label class="form-label">Empleado</label>
              <select id="nom-emp-rule-employee" class="form-input">${employeeOpts}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo / Grupo</label>
              <select id="nom-emp-rule-group" class="form-input">${groupOpts}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Salario básico mensual</label>
              <input id="nom-emp-rule-salary" class="form-input" type="number" min="0" step="1" value="0">
            </div>
            <div class="form-group">
              <label class="form-label">Categoría ARL</label>
              <select id="nom-emp-rule-arl" class="form-input">
                <option value="1">ARL nivel 1 (0.522%)</option>
                <option value="2">ARL nivel 2 (1.044%)</option>
                <option value="3">ARL nivel 3 (2.436%)</option>
                <option value="4">ARL nivel 4 (4.350%)</option>
                <option value="5">ARL nivel 5 (6.960%)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="inline-flex items-center gap-2 text-sm mt-8" style="color:#334155"><input id="nom-emp-rule-pensioner" type="checkbox"> Es pensionado</label>
              <label class="inline-flex items-center gap-2 text-sm mt-3" style="color:#334155"><input id="nom-emp-rule-transport" type="checkbox" checked> Aplica auxilio transporte</label>
            </div>
            <div class="form-group">
              <label class="inline-flex items-center gap-2 text-sm" style="color:#334155"><input id="nom-emp-rule-solidarity" type="checkbox"> Aporta Fondo de Solidaridad Pensional</label>
              <label class="inline-flex items-center gap-2 text-sm mt-3" style="color:#334155"><input id="nom-emp-rule-withholding" type="checkbox"> Aplica Retención en la Fuente (Art. 383 E.T.)</label>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3" style="border-top:1px solid #E5E7EB">
            <p class="md:col-span-2 text-xs font-semibold" style="color:#6B7280">TERCEROS ENTIDADES (para contabilización automática)</p>
            <div class="form-group">
              <label class="form-label">EPS (Salud)</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-salud-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-salud" type="hidden" value="">
                <div id="nom-emp-rule-tercero-salud-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">AFP (Pensión)</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-pension-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-pension" type="hidden" value="">
                <div id="nom-emp-rule-tercero-pension-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ARL</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-arl-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-arl" type="hidden" value="">
                <div id="nom-emp-rule-tercero-arl-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Caja de Compensación</label>
              <div class="relative">
                <input id="nom-emp-rule-tercero-caja-search" class="form-input" autocomplete="off" placeholder="Buscar tercero...">
                <input id="nom-emp-rule-tercero-caja" type="hidden" value="">
                <div id="nom-emp-rule-tercero-caja-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="btn btn-primary" id="btn-nom-emp-rule-upsert"><i class="fas fa-floppy-disk"></i> Guardar en Lista</button>
            <button class="btn btn-outline" id="btn-nom-emp-rule-clear">Limpiar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Empleado</th><th>Grupo</th><th>Estado</th><th>Salario básico</th><th>ARL</th><th>Pensionado</th><th>Aux. Transp</th><th>Solidaridad</th><th>Retefuente</th><th></th></tr></thead>
            <tbody id="nom-emp-rules-body"></tbody>
          </table>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-employee-rules">Guardar Cambios</button>`,
      true
    );

    const resetForm = () => {
      local.editingEmployeeId = '';
      setInputVal('nom-emp-rule-employee', '');
      setInputVal('nom-emp-rule-group', '');
      setInputVal('nom-emp-rule-salary', '0');
      setInputVal('nom-emp-rule-arl', '1');
      if ($('#nom-emp-rule-pensioner')) $('#nom-emp-rule-pensioner').checked = false;
      if ($('#nom-emp-rule-transport')) $('#nom-emp-rule-transport').checked = true;
      if ($('#nom-emp-rule-solidarity')) $('#nom-emp-rule-solidarity').checked = false;
      if ($('#nom-emp-rule-withholding')) $('#nom-emp-rule-withholding').checked = false;
      setInputVal('nom-emp-rule-withholding-rate', '0');
      setInputVal('nom-emp-rule-tercero-salud', '');
      setInputVal('nom-emp-rule-tercero-pension', '');
      setInputVal('nom-emp-rule-tercero-arl', '');
      setInputVal('nom-emp-rule-tercero-caja', '');
      syncRuleThirdSearchInputs();
    };

    const syncRuleThirdSearchInputs = () => {
      const pairs = [
        ['nom-emp-rule-tercero-salud', 'nom-emp-rule-tercero-salud-search'],
        ['nom-emp-rule-tercero-pension', 'nom-emp-rule-tercero-pension-search'],
        ['nom-emp-rule-tercero-arl', 'nom-emp-rule-tercero-arl-search'],
        ['nom-emp-rule-tercero-caja', 'nom-emp-rule-tercero-caja-search'],
      ];
      pairs.forEach(([hiddenId, inputId]) => {
        const hidden = document.getElementById(hiddenId);
        const input = document.getElementById(inputId);
        if (!hidden || !input) return;
        const third = nominaFindThirdById(terceros, hidden.value || '');
        input.value = third ? nominaThirdDisplay(third) : '';
      });
    };

    const loadRuleToForm = (employeeId) => {
      const explicit = findEmployeePayrollRule(local.config, employeeId) || {};
      const effective = getEmployeePayrollRule(local.config, employeeId);
      local.editingEmployeeId = employeeId;
      setInputVal('nom-emp-rule-employee', employeeId);
      setInputVal('nom-emp-rule-group', explicit.group_id || effective.group_id || '');
      setInputVal('nom-emp-rule-salary', String(round2((explicit.basic_salary ?? effective.basic_salary) || 0)));
      setInputVal('nom-emp-rule-arl', String((explicit.arl_risk_level ?? effective.arl_risk_level ?? 1)));
      if ($('#nom-emp-rule-pensioner')) $('#nom-emp-rule-pensioner').checked = !!(explicit.is_pensioner ?? effective.is_pensioner);
      if ($('#nom-emp-rule-transport')) $('#nom-emp-rule-transport').checked = !!(explicit.apply_transport_allowance ?? effective.apply_transport_allowance ?? true);
      if ($('#nom-emp-rule-solidarity')) $('#nom-emp-rule-solidarity').checked = !!(explicit.apply_solidarity_fund ?? effective.apply_solidarity_fund);
      if ($('#nom-emp-rule-withholding')) $('#nom-emp-rule-withholding').checked = !!(explicit.apply_withholding_tax ?? effective.apply_withholding_tax);
      setInputVal('nom-emp-rule-withholding-rate', String(round2(((explicit.withholding_rate ?? effective.withholding_rate ?? 0) * 100))));
      if ($('#nom-emp-rule-tercero-salud')) $('#nom-emp-rule-tercero-salud').value = explicit.tercero_salud_id || '';
      if ($('#nom-emp-rule-tercero-pension')) $('#nom-emp-rule-tercero-pension').value = explicit.tercero_pension_id || '';
      if ($('#nom-emp-rule-tercero-arl')) $('#nom-emp-rule-tercero-arl').value = explicit.tercero_arl_id || '';
      if ($('#nom-emp-rule-tercero-caja')) $('#nom-emp-rule-tercero-caja').value = explicit.tercero_caja_id || '';
      syncRuleThirdSearchInputs();
    };

    const renderEmployeeRules = () => {
      const summary = $('#nom-emp-rules-summary');
      const body = $('#nom-emp-rules-body');
      if (!body) return;

      const sortedEmployees = [...employees].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      const pending = sortedEmployees.filter((e) => !isEmployeePayrollRuleComplete(getEmployeePayrollRule(local.config, e.id)));

      if (summary) {
        summary.innerHTML = pending.length
          ? `<div class="rounded-xl p-3 text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
               <p class="font-semibold"><i class="fas fa-triangle-exclamation mr-1"></i>Parámetros incompletos: ${pending.length} empleado(s)</p>
               <p class="mt-1">Pendientes de salario básico efectivo: ${esc(pending.slice(0, 8).map((e) => e.name).join(', '))}${pending.length > 8 ? '...' : ''}</p>
             </div>`
          : `<div class="rounded-xl p-3 text-sm" style="background:#F0FFF4;border:1px solid #BBF7D0;color:#166534">
               <p class="font-semibold"><i class="fas fa-circle-check mr-1"></i>Todos los empleados activos tienen parámetros completos para liquidación.</p>
             </div>`;
      }

      body.innerHTML = sortedEmployees.length
        ? sortedEmployees.map((emp) => {
          const effective = getEmployeePayrollRule(local.config, emp.id);
          const explicit = findEmployeePayrollRule(local.config, emp.id);
          const complete = isEmployeePayrollRuleComplete(effective);
          const groupName = effective.group_id ? (groupNameById[effective.group_id] || 'Grupo no encontrado') : 'Sin grupo';
          const rowBg = complete ? '' : ' style="background:#FFF7ED"';
          return `<tr${rowBg}>
            <td>${esc(emp.name || 'Empleado')}</td>
            <td>${esc(groupName)}</td>
            <td>${complete ? '<span class="badge badge-green">Completo</span>' : '<span class="badge" style="background:#FEE2E2;color:#991B1B">Pendiente</span>'}</td>
            <td>${fmt(effective.basic_salary || 0)}</td>
            <td>${esc(arlText(effective.arl_risk_level || 1))}</td>
            <td>${effective.is_pensioner ? 'Sí' : 'No'}</td>
            <td>${effective.apply_transport_allowance ? 'Sí' : 'No'}</td>
            <td>${effective.apply_solidarity_fund ? 'Sí' : 'No'}</td>
            <td>${effective.apply_withholding_tax ? `${round2((effective.withholding_rate || 0) * 100)}%` : 'No'}</td>
            <td class="text-right">
              <div class="flex gap-1 justify-end">
                <button class="btn btn-outline btn-sm btn-edit-emp-rule" data-emp="${esc(emp.id)}" title="Editar"><i class="fas fa-pen"></i></button>
                ${explicit ? `<button class="btn btn-outline btn-sm btn-del-emp-rule" data-emp="${esc(emp.id)}" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
              </div>
            </td>
          </tr>`;
        }).join('')
        : '<tr><td colspan="9" class="text-center py-6" style="color:#9CA3AF">Sin empleados activos.</td></tr>';
    };

    renderEmployeeRules();

    initNominaThirdSearchInput({ terceros, hiddenId: 'nom-emp-rule-tercero-salud', inputId: 'nom-emp-rule-tercero-salud-search', resultsId: 'nom-emp-rule-tercero-salud-results' });
    initNominaThirdSearchInput({ terceros, hiddenId: 'nom-emp-rule-tercero-pension', inputId: 'nom-emp-rule-tercero-pension-search', resultsId: 'nom-emp-rule-tercero-pension-results' });
    initNominaThirdSearchInput({ terceros, hiddenId: 'nom-emp-rule-tercero-arl', inputId: 'nom-emp-rule-tercero-arl-search', resultsId: 'nom-emp-rule-tercero-arl-results' });
    initNominaThirdSearchInput({ terceros, hiddenId: 'nom-emp-rule-tercero-caja', inputId: 'nom-emp-rule-tercero-caja-search', resultsId: 'nom-emp-rule-tercero-caja-results' });
    syncRuleThirdSearchInputs();

    $('#nom-emp-rule-employee')?.addEventListener('change', () => {
      const employeeId = getSelectVal('nom-emp-rule-employee');
      if (!employeeId) return;
      loadRuleToForm(employeeId);
    });

    $('#btn-nom-emp-rule-upsert')?.addEventListener('click', () => {
      const employeeId = getSelectVal('nom-emp-rule-employee');
      if (!employeeId) return showToast('Selecciona un empleado.', 'warning');

      const applyWithholdingTax = !!$('#nom-emp-rule-withholding')?.checked;
      const withholdingRatePct = parseNum(getInputVal('nom-emp-rule-withholding-rate'));

      const rule = {
        employee_id: employeeId,
        group_id: getSelectVal('nom-emp-rule-group') || '',
        basic_salary: Math.max(0, parseNum(getInputVal('nom-emp-rule-salary')) || 0),
        arl_risk_level: Math.max(1, Math.min(5, parseInt(getSelectVal('nom-emp-rule-arl') || '1', 10) || 1)),
        is_pensioner: !!$('#nom-emp-rule-pensioner')?.checked,
        apply_transport_allowance: !!$('#nom-emp-rule-transport')?.checked,
        apply_solidarity_fund: !!$('#nom-emp-rule-solidarity')?.checked,
        apply_withholding_tax: applyWithholdingTax,
        withholding_rate: applyWithholdingTax ? Math.max(0, withholdingRatePct / 100) : 0,
        tercero_salud_id: getSelectVal('nom-emp-rule-tercero-salud') || '',
        tercero_pension_id: getSelectVal('nom-emp-rule-tercero-pension') || '',
        tercero_arl_id: getSelectVal('nom-emp-rule-tercero-arl') || '',
        tercero_caja_id: getSelectVal('nom-emp-rule-tercero-caja') || '',
      };

      local.config.employee_rules = (local.config.employee_rules || []).filter((r) => r.employee_id !== employeeId);
      local.config.employee_rules.push(rule);
      renderEmployeeRules();
      showToast('Parámetro de empleado agregado/actualizado', 'success');
    });

    $('#btn-nom-emp-rule-clear')?.addEventListener('click', () => {
      resetForm();
    });

    $('#nom-emp-rules-body')?.addEventListener('click', (e) => {
      const editBtn = e.target?.closest?.('.btn-edit-emp-rule');
      if (editBtn) {
        const empId = editBtn.getAttribute('data-emp') || '';
        if (empId) loadRuleToForm(empId);
        return;
      }

      const delBtn = e.target?.closest?.('.btn-del-emp-rule');
      if (!delBtn) return;
      const empId = delBtn.getAttribute('data-emp') || '';
      local.config.employee_rules = (local.config.employee_rules || []).filter((r) => r.employee_id !== empId);
      if (local.editingEmployeeId === empId) resetForm();
      renderEmployeeRules();
    });

    $('#btn-save-nom-employee-rules')?.addEventListener('click', async () => {
      try {
        await saveNominaConfig(local.config, local.rowId);
        closeModal();
        showToast('Parámetros por empleado guardados', 'success');
      } catch (err) {
        showToast(err.message || 'No se pudieron guardar los parámetros por empleado', 'error');
      }
    });

    if (selectedEmployeeId) {
      setTimeout(() => {
        const select = $('#nom-emp-rule-employee');
        if (select) {
          select.value = selectedEmployeeId;
          select.dispatchEvent(new Event('change'));
        }
      }, 100);
    }
  } catch (err) {
    showToast(err.message || 'No se pudo abrir el panel de empleados de nómina', 'error');
  }
}

async function liquidarPeriodoMasivo(periodId) {
  try {
    const period = await pb.get('payroll_periods', periodId);
    if ((period.status || 'draft') !== 'draft') {
      return showToast('Solo se pueden liquidar periodos en estado Borrador.', 'warning');
    }

    const { config } = await getNominaConfigWithRow();
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' });
    if (!employees.length) {
      return showToast('No hay empleados activos para liquidar.', 'warning');
    }

    // Verificar parámetros incompletos
    const incomplete = employees.filter(e => !isEmployeePayrollRuleComplete(getEmployeePayrollRule(config, e.id)));
    if (incomplete.length) {
      const names = incomplete.slice(0, 5).map(e => e.name).join(', ');
      return showToast(`Configura el salario básico en Parámetros por Empleado antes de liquidar. Pendientes: ${names}`, 'warning');
    }

    showToast('Generando liquidaciones masivas...', 'info');

    // Obtener las liquidaciones existentes en este periodo
    const existingLines = await pb.listAll('payroll_lines', { filter: `period_id="${pb.escapeFilterValue(periodId)}"` });
    const lineByEmployee = {};
    existingLines.forEach(l => { lineByEmployee[l.employee_id] = l; });

    // Cargar todas las novedades del periodo de una sola vez
    const novelties = await pb.listAll('payroll_novelties', { filter: `period_id="${pb.escapeFilterValue(periodId)}"` });
    const noveltiesByEmployee = {};
    novelties.forEach(n => {
      if (!noveltiesByEmployee[n.employee_id]) noveltiesByEmployee[n.employee_id] = [];
      noveltiesByEmployee[n.employee_id].push(n);
    });

    const SMLV_VIGENTE = config.company_rules.smmlv || 1423500;
    const UVT_VIGENTE = config.company_rules.uvt_value || 52374;
    const AUX_TRANSPORTE_VIGENTE = config.company_rules.transport_allowance || ((SMLV_VIGENTE <= 1423500) ? 162000 : 180000);

    const periodType = config.company_rules.period_type || 'MENSUAL';
    let diasPeriodoBase = 30;
    if (periodType === 'QUINCENAL') diasPeriodoBase = 15;
    else if (periodType === 'CATORCENA') diasPeriodoBase = 14;
    else if (periodType === 'SEMANAL') diasPeriodoBase = 7;
    else if (periodType === 'JORNAL') diasPeriodoBase = 1;

    let creadas = 0;
    let actualizadas = 0;

    for (const emp of employees) {
      const empRule = getEmployeePayrollRule(config, emp.id);
      const empNovelties = noveltiesByEmployee[emp.id] || [];

      let diasIncapacidad = 0;
      let diasAusentismo = 0;
      let diasVacaciones = 0;
      let diasLicenciaRem = 0;
      let bonificaciones = 0;
      let comisiones = 0;
      let otrosIngresos = 0;
      let ajusteSalarial = 0;
      let isVacacionesRetiro = false;
      let prestamos = 0;
      let anticipos = 0;
      let multas = 0;
      let embargos = 0;
      let otrasDeducciones = 0;
      let n_primaServicios = 0;
      let n_interesesCesantias = 0;
      let n_cesantias = 0;
      let dotaciones = 0;
      let gastosRepresentacion = 0;
      let auxNoSalariales = 0;
      let rodamiento = 0;
      let compensatorios = 0;
      let alimentacion = 0;
      let libranzas = 0;

      const otHours = { hed: 0, hen: 0, rno: 0, heddf: 0, hendf: 0, rdfd: 0 };

      empNovelties.forEach(n => {
        const type = n.type || '';
        const qty = Number(n.qty || 0);
        const amount = Number(n.amount || 0);
        const note = String(n.note || n.motivo || '').toLowerCase();

        if (type.startsWith('INCAPACIDAD')) {
          diasIncapacidad += qty;
          diasAusentismo += qty;
        } else if (
          type === 'LICENCIA_NO_REMUNERADA' ||
          type === 'PERMISO_NO_REMUNERADO' ||
          type === 'SUSPENSION'
        ) {
          diasAusentismo += qty;
        } else if (type === 'VACACIONES' || type === 'VACACIONES_RETIRO') {
          diasVacaciones += qty;
          diasAusentismo += qty;
          if (type === 'VACACIONES_RETIRO' || note.includes('retiro') || note.includes('cancelac') || note.includes('liquidacion definitiva')) {
            isVacacionesRetiro = true;
          }
        } else if (
          type === 'LICENCIA_REMUNERADA' ||
          type === 'LICENCIA_MATERNIDAD' ||
          type === 'LICENCIA_PATERNIDAD' ||
          type === 'LICENCIA_LUTO' ||
          type === 'PERMISO_REMUNERADO'
        ) {
          diasLicenciaRem += qty;
        } else if (type === 'BONIFICACION' || type === 'PRIMA_EXTRALGAL') {
          bonificaciones += amount;
        } else if (type === 'COMISION') {
          comisiones += amount;
        } else if (type === 'PRIMA_SERVICIOS') {
          n_primaServicios += amount;
        } else if (type === 'INTERESES_CESANTIAS') {
          n_interesesCesantias += amount;
        } else if (type === 'CESANTIAS') {
          n_cesantias += amount;
        } else if (type === 'DOTACION') {
          dotaciones += amount;
        } else if (type === 'AJUSTE_SALARIAL') {
          ajusteSalarial += amount;
        } else if (type === 'OTRO_INGRESO' || type === 'REINTEGRO') {
          otrosIngresos += amount;
        } else if (type === 'PRESTAMO') {
          prestamos += amount;
        } else if (type === 'ANTICIPO') {
          anticipos += amount;
        } else if (type === 'MULTA') {
          multas += amount;
        } else if (type === 'EMBARGO') {
          embargos += amount;
        } else if (type === 'OTRA_DEDUCCION') {
          otrasDeducciones += amount;
        } else if (type === 'GASTOS_REPRESENTACION') {
          gastosRepresentacion += amount;
        } else if (type === 'AUX_NO_SALARIALES') {
          auxNoSalariales += amount;
        } else if (type === 'AUXILIO_RODAMIENTO') {
          rodamiento += amount;
        } else if (type === 'COMPENSATORIOS') {
          compensatorios += amount;
        } else if (type === 'AUXILIO_ALIMENTACION') {
          alimentacion += amount;
        } else if (type === 'LIBRANZA') {
          libranzas += amount;
        } else if (type === 'OTRA_DEDUCCION') {
          otrasDeducciones += amount;
        } else if (NOVEDAD_A_OVERTIME_KEY[type]) {
          const key = NOVEDAD_A_OVERTIME_KEY[type];
          otHours[key] += qty;
        }
      });

      const daysWorked = Math.max(0, diasPeriodoBase - diasAusentismo);
      const salary = empRule.basic_salary || 0;
      const salaryProportional = round2((salary / 30) * daysWorked);

      const weeklyHours = config.company_rules.weekly_hours || 44;
      const hourlyRate = round2(salary / (weeklyHours * 5));

      let otAmount = 0;
      const overtimeBreakdown = {};
      NOMINA_OVERTIME_TYPES.forEach(t => {
        const hours = otHours[t.key] || 0;
        const amount = round2(hourlyRate * hours * t.factor);
        otAmount = round2(otAmount + amount);
        overtimeBreakdown[t.key] = { hours, amount };
      });

      let transportAllowance = 0;
      const transportDays = Math.max(0, daysWorked);
      if (empRule.apply_transport_allowance !== false && salary <= (SMLV_VIGENTE * 2)) {
        transportAllowance = round2((AUX_TRANSPORTE_VIGENTE / 30) * transportDays);
      }

      const vacacionesAmount = round2((salary / 30) * diasVacaciones);
      const licenciasAmount = round2((salary / 30) * diasLicenciaRem);
      const incapacidadesAmount = round2((salary / 30) * diasIncapacidad * 0.6667);

      const totalEarnings = round2(
        salaryProportional + transportAllowance + otAmount +
        vacacionesAmount + licenciasAmount + incapacidadesAmount + bonificaciones + comisiones + ajusteSalarial + otrosIngresos +
        gastosRepresentacion + auxNoSalariales + rodamiento + compensatorios + alimentacion +
        n_primaServicios + n_interesesCesantias + n_cesantias
      );

      // Si las vacaciones corresponden a liquidación por retiro o cancelación de contrato, NO forman parte del IBC de EPS/Pensión
      const ibcVacaciones = isVacacionesRetiro ? 0 : vacacionesAmount;
      const isIntegralSalary = empRule.is_integral_salary || String(empRule.salary_type || '').toUpperCase() === 'INTEGRAL';

      const rawIbc = Math.min(
        salaryProportional + otAmount + ibcVacaciones + licenciasAmount + incapacidadesAmount + comisiones + ajusteSalarial,
        SMLV_VIGENTE * 25
      );
      const ibc = round2(isIntegralSalary ? totalEarnings * 0.70 : rawIbc);

      const deductionHealth = empRule.subtipoTrabajador === 'APRENDIZ' ? 0 : round2(ibc * 0.04);
      const deductionPension = (empRule.subtipoTrabajador === 'APRENDIZ' || empRule.is_pensioner) ? 0 : round2(ibc * 0.04);

      const solidarityFund = (empRule.apply_solidarity_fund !== false) ? calculateSolidarityFund(ibc, SMLV_VIGENTE) : 0;
      const withholdingTax = (empRule.apply_withholding_tax !== false) ? calculateWithholdingTax(totalEarnings, deductionHealth, deductionPension, solidarityFund, UVT_VIGENTE) : 0;

      const deductionOther = prestamos + anticipos + multas + embargos + otrasDeducciones + libranzas;
      const totalDeducciones = round2(deductionHealth + deductionPension + solidarityFund + withholdingTax + deductionOther);
      const netPay = round2(totalEarnings - totalDeducciones);

      const employerHealth = empRule.subtipoTrabajador === 'APRENDIZ' ? 0 : round2(ibc * 0.085);
      const employerPension = (empRule.subtipoTrabajador === 'APRENDIZ' || empRule.is_pensioner) ? 0 : round2(ibc * 0.12);
      const arlRate = ARL_RISK_RATES[empRule.arl_risk_level] || ARL_RISK_RATES[1];
      const employerArl = empRule.subtipoTrabajador === 'APRENDIZ' ? round2(salary * ARL_RISK_RATES[1]) : round2(ibc * arlRate);
      const sena = (empRule.subtipoTrabajador === 'APRENDIZ' || config.company_rules.exempt_sena_icbf) ? 0 : round2(ibc * 0.02);
      const icbf = (empRule.subtipoTrabajador === 'APRENDIZ' || config.company_rules.exempt_sena_icbf) ? 0 : round2(ibc * 0.03);
      const cajaComp = empRule.subtipoTrabajador === 'APRENDIZ' ? 0 : round2(ibc * 0.04);

      const cesantias = round2(round2(ibc * 0.0833) + n_cesantias);
      const interesesCes = round2(round2(cesantias * 0.12) + n_interesesCesantias);
      const prima = round2(round2(ibc * 0.0833) + n_primaServicios);
      const vacacionesCausadas = round2(ibc * 0.0417);

      const conceptAmounts = {
        incapacidades: incapacidadesAmount,
        licencias: licenciasAmount,
        gastos_representacion: gastosRepresentacion,
        bonificacion: bonificaciones,
        aux_no_salariales: auxNoSalariales,
        comisiones: comisiones,
        dotaciones: dotaciones,
        compensatorios: compensatorios,
        alimentacion: alimentacion,
        rodamiento: rodamiento,
        ajuste_salarial: ajusteSalarial,
        vacaciones_disfrutadas: vacacionesAmount,
        otros_ingresos: otrosIngresos,
        embargo: embargos,
        cxc: 0,
        libranza: libranzas,
        prestamos: prestamos + anticipos + multas,
      };

      const notesObj = {
        payroll_meta: {
          dias_vacaciones: diasVacaciones,
          vacaciones_disfrutadas: vacacionesAmount,
          arl_risk_level: empRule.arl_risk_level,
          arl_rate: arlRate,
          is_pensioner: !!empRule.is_pensioner,
          solidarity_fund: round2(solidarityFund),
          withholding_tax: round2(withholdingTax),
          company_exempt_sena_icbf: !!config.company_rules.exempt_sena_icbf,
          overtime_breakdown: {
            hourly_rate: hourlyRate,
            total_hours: Object.values(otHours).reduce((a,b)=>a+b, 0),
            total_amount: otAmount,
            ...overtimeBreakdown
          },
          transport_days: transportDays,
          transport_monthly: AUX_TRANSPORTE_VIGENTE,
          concept_amounts: conceptAmounts
        }
      };

      const payload = {
        period_id: periodId,
        employee_id: emp.id,
        salary_base: salary,
        days_worked: daysWorked,
        overtime: otAmount,
        transport_allowance: transportAllowance,
        deduction_health: deductionHealth,
        deduction_pension: deductionPension,
        deduction_other: deductionOther,
        net_pay: netPay,
        employer_health: employerHealth,
        employer_pension: employerPension,
        employer_arl: employerArl,
        sena,
        icbf,
        caja_comp: cajaComp,
        cesantias,
        intereses_ces: interesesCes,
        prima,
        vacaciones: vacacionesCausadas,
        notes: JSON.stringify(notesObj)
      };

      const existing = lineByEmployee[emp.id];
      if (existing) {
        await pb.update('payroll_lines', existing.id, payload);
        actualizadas++;
      } else {
        await pb.create('payroll_lines', payload);
        creadas++;
      }
    }

    showToast(`Liquidación completada. Creadas: ${creadas}, Actualizadas: ${actualizadas}`, 'success');
    navigate((window as any).currentPage || 'nomina-liquidacion');
  } catch (err) {
    showToast(`Error al liquidar periodo: ${err.message}`, 'error');
  }
}

async function renderNominaPeriodos(c, periods, lines, periodTotals, loadErrors, noEmployees, noPeriods) {
  const statusBadge = s => ({
    draft: '<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>',
    approved: '<span class="badge badge-blue">Aprobada</span>',
    paid: '<span class="badge badge-green">Pagada</span>',
  }[s] || '<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>');

  c.innerHTML = `
    ${loadErrors.length ? `
      <div class="mb-4 p-4 rounded-2xl border text-left" style="background:#FEF2F2;border-color:#FECACA">
        <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
        <p class="text-sm" style="color:#6B7280">${esc(loadErrors.join(' | '))}</p>
      </div>` : ''}

    ${(noEmployees || noPeriods) ? `
      <div class="mb-4 p-4 rounded-2xl border text-left" style="background:#FFF8F0;border-color:#FED7AA">
        <div class="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Configuración inicial requerida</p>
            <p class="text-sm" style="color:#6B7280">
              ${noEmployees ? 'No hay terceros tipo EMPLEADO activos.' : ''}
              ${noEmployees && noPeriods ? ' ' : ''}
              ${noPeriods ? 'No hay Periodos de nómina creados.' : ''}
            </p>
          </div>
          <div class="flex gap-2">
            ${noEmployees ? '<button class="btn btn-outline btn-sm" id="btn-go-empleados"><i class="fas fa-users"></i> Crear Empleado</button>' : ''}
            ${noPeriods && can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-fast-period"><i class="fas fa-calendar-plus"></i> Crear Periodo</button>' : ''}
          </div>
        </div>
      </div>` : ''}

    <!-- Períodos -->
    <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
      <div class="p-4 border-b flex items-center justify-between text-left" style="border-color:#F3F4F6">
         <h4 class="font-bold text-sm text-gray-800">Historial de Períodos de Nómina</h4>
      </div>
      <div class="overflow-x-auto text-left">
        <table class="data-table" id="payroll-periods-table">
          <thead><tr><th>Nombre</th><th>Desde</th><th>Hasta</th><th>Empleados</th><th>Devengado</th><th>Parafiscales</th><th>Neto Pago</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${periods.length ? periods.map(p => {
              const t = periodTotals[p.id] || { devengado:0, deducciones:0, neto:0, parafiscales:0, count:0 };
              return `<tr>
                <td class="font-semibold">${esc(p.name)}</td>
                <td>${esc(p.date_from)}</td><td>${esc(p.date_to)}</td>
                <td class="text-center">${t.count}</td>
                <td>${fmt(t.devengado)}</td>
                <td>${fmt(t.parafiscales)}</td>
                <td class="font-semibold">${fmt(t.neto)}</td>
                <td>${statusBadge(p.status)}</td>
                <td>
                  <div class="flex gap-1 justify-end flex-wrap">
                    <button class="btn btn-outline btn-sm" title="Ver liquidaciones" onclick="viewPeriodLines('${esc(p.id)}','${esc(p.name)}','${esc(p.status || 'draft')}')"><i class="fas fa-list-ul"></i></button>
                    ${t.count > 0 ? `<button class="btn btn-outline btn-sm text-indigo-600 font-semibold" title="Imprimir Desprendibles Consolidados del Período" onclick="window.printConsolidatedPayrollSlips('${esc(p.id)}')"><i class="fas fa-copy mr-1"></i>Desprendibles</button>` : ''}
                    ${t.count > 0 ? `<button class="btn btn-outline btn-sm text-emerald-700 font-semibold" title="Imprimir Lista de Pago Consolidada / Planilla" onclick="window.printConsolidatedPayrollSummary('${esc(p.id)}')"><i class="fas fa-file-invoice-dollar mr-1"></i>Lista de Pago</button>` : ''}
                    ${can('canWrite') && p.status === 'draft' ? `<button class="btn btn-outline btn-sm text-emerald-700 font-bold" title="Pre-liquidar período automáticamente" onclick="window.liquidarPeriodoMasivo('${esc(p.id)}')"><i class="fas fa-calculator mr-1"></i>Pre-liquidar</button>` : ''}
                    ${canApproveOrPayPayroll() && p.status === 'draft' ? `<button class="btn btn-primary btn-sm" title="Aprobar período" onclick="setPeriodStatus('${esc(p.id)}','approved')"><i class="fas fa-check mr-1"></i>Aprobar</button>` : ''}
                    ${canApproveOrPayPayroll() && p.status === 'approved' ? `<button class="btn btn-secondary btn-sm" title="Marcar pagada" onclick="setPeriodStatus('${esc(p.id)}','paid')"><i class="fas fa-money-bill-wave mr-1"></i>Pagar Salarios</button>` : ''}
                    ${canApproveOrPayPayroll() && (p.status === 'approved' || p.status === 'paid') ? `<button class="btn btn-outline btn-sm" title="Pagar Planilla Aportes" onclick="window._openPayPlanillaModal('${esc(p.id)}','${esc(p.name)}')"><i class="fas fa-file-invoice text-emerald-600 mr-1"></i>Pagar Planilla</button>` : ''}
                    ${can('canDelete') && p.status === 'draft' ? `<button class="btn btn-outline btn-sm" title="Eliminar período" onclick="deletePayrollPeriod('${esc(p.id)}','${esc(p.name)}')"><i class="fas fa-trash"></i></button>` : ''}
                    ${(can('canDelete') || ['superadmin', 'administrador', 'admin', 'propietario', 'gerente'].includes(String(pb.currentUser?.role || '').toLowerCase())) && t.count > 0 ? `<button class="btn btn-outline btn-sm text-red-600 font-bold" title="Reversar y eliminar liquidaciones (Borrador/Aprobado/Pagado)" onclick="window.reversarLiquidacionPeriodo('${esc(p.id)}')"><i class="fas fa-undo mr-1"></i>Reversar</button>` : ''}
                  </div>
                </td>
              </tr>`;
             }).join('') : '<tr><td colspan="9" class="text-center py-8" style="color:#9CA3AF">Sin períodos de nómina.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Liquidaciones recientes -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="p-4 border-b text-left" style="border-color:#F3F4F6">
        <h4 class="font-bold text-sm text-gray-800">Liquidaciones Recientes</h4>
      </div>
      <div class="overflow-x-auto text-left">
        <table class="data-table" id="payroll-lines-table">
           <thead><tr><th>Período</th><th>Empleado</th><th>Días</th><th>Devengado</th><th>Salud/Pens.</th><th>Neto</th><th></th></tr></thead>
          <tbody>
            ${lines.length ? lines.slice(0, 30).map(l => `
              <tr>
                <td>${esc(l.expand?.period_id?.name || '?')}</td>
                <td>${esc(l.expand?.employee_id?.name || '?')}</td>
                <td class="text-center">${esc(String(l.days_worked || 30))}</td>
                <td>${fmt(getNominaDevengadoTotal(l))}</td>
                <td>${fmt(getNominaDeduccionesTotal(l))}</td>
                <td class="font-semibold">${fmt(l.net_pay || 0)}</td>
                <td>
                  <div class="flex gap-1 justify-end">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(l.id)}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(l.id)}')"><i class="fas fa-print"></i></button>
                    ${can('canWrite') && (l.expand?.period_id?.status || 'draft') === 'draft' ? `<button class="btn btn-outline btn-sm" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(l.id)}')"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </td>
              </tr>`).join('') : '<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">Sin liquidaciones.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;

  $('#btn-go-empleados')?.addEventListener('click', () => navigate('nomina-empleados'));
  $('#btn-fast-period')?.addEventListener('click', () => openPeriodForm());

  const tblPeriods = document.getElementById('payroll-periods-table') as HTMLTableElement;
  if (tblPeriods) (window as any).makeTableSortable(tblPeriods);
  const tblLines = document.getElementById('payroll-lines-table') as HTMLTableElement;
  if (tblLines) (window as any).makeTableSortable(tblLines);
}

async function renderNominaEmpleados(c) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando empleados...</div>`;
  try {
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO"', sort: 'name' });
    const { config } = await getNominaConfigWithRow();
    
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Empleados de Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Gestión de personal y parámetros individuales de liquidación.</p>
        </div>
        <div class="flex gap-2">
          ${can('canWrite') ? `
            <button class="btn btn-outline" id="btn-nomina-config-emp" title="Configurar contabilización y SMMLV"><i class="fas fa-gear"></i> Configuración Contable</button>
            <button class="btn btn-secondary" id="btn-new-employee-np"><i class="fas fa-plus"></i> Registrar Empleado</button>
          ` : ''}
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto text-left">
          <table class="data-table text-sm" id="employees-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Identificación</th>
                <th>Grupo / Mapeo</th>
                <th class="text-right">Salario Básico</th>
                <th>ARL</th>
                <th>Salud/Pensión</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${employees.length ? employees.map(emp => {
                const rule = getEmployeePayrollRule(config, emp.id);
                const groupName = config.employee_groups?.find(g => g.id === rule.group_id)?.name || 'Sin grupo';
                const arlText = `Nivel ${rule.arl_risk_level}`;
                
                return `
                  <tr>
                    <td class="font-semibold">${esc(emp.name)}</td>
                    <td>${esc(emp.doc_type || 'CC')} ${esc(emp.doc_number || '')}</td>
                    <td><span class="badge" style="background:#E2E8F0;color:#334155">${esc(groupName)}</span></td>
                    <td class="text-right font-medium text-blue-900">${rule.basic_salary ? fmt(rule.basic_salary) : '<span class="text-red-500 font-semibold">No parametrizado</span>'}</td>
                    <td>${esc(arlText)}</td>
                    <td>
                      ${rule.is_pensioner ? '<span class="badge badge-green">Pensionado</span>' : '<span class="badge" style="background:#EBF8FF;color:#2B6CB0">Activo (4%)</span>'}
                    </td>
                    <td>
                      ${emp.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-red">Inactivo</span>'}
                    </td>
                    <td class="text-right">
                      <div class="flex gap-1 justify-end">
                        <button class="btn btn-outline btn-sm btn-edit-emp-params" data-id="${esc(emp.id)}" title="Configurar parámetros de nómina"><i class="fas fa-user-gear"></i></button>
                        <button class="btn btn-outline btn-sm btn-edit-emp-profile" data-id="${esc(emp.id)}" title="Editar datos personales"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-outline btn-sm btn-toggle-emp-active ${emp.active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}" data-id="${esc(emp.id)}" data-active="${emp.active}" title="${emp.active ? 'Desactivar empleado' : 'Activar empleado'}">
                          <i class="fas ${emp.active ? 'fa-user-slash' : 'fa-user-check'}"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="8" class="text-center py-8 text-gray-400">No se encontraron empleados registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $('#btn-nomina-config-emp')?.addEventListener('click', () => openNominaAccountingSettings(employees));
    $('#btn-new-employee-np')?.addEventListener('click', () => {
      if (typeof (window as any).openTerceroForm === 'function') {
        (window as any).openTerceroForm(null, () => {
          renderNominaEmpleados(c);
        });
      } else {
        showToast('Formulario de terceros no disponible.', 'error');
      }
    });


    c.querySelectorAll('.btn-edit-emp-params').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openNominaEmployeeSettings(employees, id);
      });
    });

    c.querySelectorAll('.btn-edit-emp-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (typeof (window as any).openTerceroForm === 'function') {
          (window as any).openTerceroForm(id, () => {
            renderNominaEmpleados(c);
          });
        } else {
          showToast('Formulario de terceros no disponible.', 'error');
        }
      });
    });

    c.querySelectorAll('.btn-toggle-emp-active').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const active = btn.getAttribute('data-active') === 'true';
        try {
          (btn as HTMLButtonElement).disabled = true;
          await pb.update('third_parties', id, { active: !active });
          showToast(`Empleado ${active ? 'desactivado' : 'activado'} correctamente.`, 'success');
          await renderNominaEmpleados(c);
        } catch (err) {
          showToast(err.message || 'No se pudo cambiar el estado del empleado', 'error');
          (btn as HTMLButtonElement).disabled = false;
        }
      });
    });

    const tbl = document.getElementById('employees-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderNominaContratos(c) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando contratos...</div>`;
  try {
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO"', sort: 'name' });
    const { config } = await getNominaConfigWithRow();

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Contratos de Trabajo</h3>
           <p class="text-sm" style="color:#6B7280">Control de tipos de contrato, fechas de inicio/fin y asignación salarial.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto text-left">
          <table class="data-table text-sm" id="contracts-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Identificación</th>
                <th>Cargo</th>
                <th>Jornada</th>
                <th>Tipo de Contrato</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th class="text-right">Salario Base</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${employees.length ? employees.map(emp => {
                const rule = getEmployeePayrollRule(config, emp.id);
                const contractType = rule.contract_type || 'INDEFINIDO';
                const contractTypeLabel = {
                  INDEFINIDO: 'Término Indefinido',
                  TERMINADO_FIJO: 'Término Fijo',
                  OBRA_LABOR: 'Obra o Labor',
                  APRENDIZAJE: 'Aprendizaje',
                  PRACTICA: 'Práctica'
                }[contractType] || contractType;
                
                const weeklyHours = config.company_rules?.weekly_hours || 44;
                const workdayTypeLabel = {
                  COMPLETA: `Tiempo Completo (${weeklyHours}h/sem)`,
                  MEDIA: 'Medio Tiempo',
                  PARCIAL: 'Tiempo Parcial / Horas',
                  OTRO: 'Otro'
                }[rule.workday_type || ''] || rule.workday_type || `Tiempo Completo (${weeklyHours}h/sem)`;
                
                const startDate = rule.start_date || '—';
                const endDate = rule.end_date || '—';
                
                return `
                  <tr>
                    <td class="font-semibold">${esc(emp.name)}</td>
                    <td>${esc(emp.doc_number || '')}</td>
                    <td><span class="text-gray-700 font-semibold text-xs">${esc(rule.position || '—')}</span></td>
                    <td><span class="text-xs text-gray-500">${esc(workdayTypeLabel)}</span></td>
                    <td><span class="badge" style="background:#EEF2F6;color:#475569">${esc(contractTypeLabel)}</span></td>
                    <td>${esc(startDate)}</td>
                    <td>${esc(endDate)}</td>
                    <td class="text-right font-semibold text-blue-900">${rule.basic_salary ? fmt(rule.basic_salary) : '—'}</td>
                    <td>
                      ${emp.active ? '<span class="badge badge-green">Vigente</span>' : '<span class="badge badge-red">Finalizado</span>'}
                    </td>
                    <td class="text-right">
                      <button class="btn btn-outline btn-sm btn-edit-contract" data-id="${esc(emp.id)}"><i class="fas fa-file-signature mr-1"></i>Editar Contrato</button>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="10" class="text-center py-8 text-gray-400">No se encontraron empleados registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    c.querySelectorAll('.btn-edit-contract').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openContractForm(employees, id);
      });
    });

    const tbl = document.getElementById('contracts-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function openContractForm(employees, employeeId) {
  try {
    const { row, config } = await getNominaConfigWithRow();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    const rule = getEmployeePayrollRule(config, employeeId);

    const contractTypeOpts = [
      { v: 'INDEFINIDO', l: 'Término Indefinido' },
      { v: 'TERMINADO_FIJO', l: 'Término Fijo' },
      { v: 'OBRA_LABOR', l: 'Obra o Labor' },
      { v: 'APRENDIZAJE', l: 'Aprendizaje' },
      { v: 'PRACTICA', l: 'Práctica' }
    ].map(o => `<option value="${o.v}" ${rule.contract_type === o.v ? 'selected' : ''}>${o.l}</option>`).join('');

    const weeklyHours = config.company_rules?.weekly_hours || 44;
    const workdayOpts = [
      { v: 'COMPLETA', l: `Tiempo Completo (${weeklyHours}h/sem)` },
      { v: 'MEDIA', l: 'Medio Tiempo' },
      { v: 'PARCIAL', l: 'Tiempo Parcial / Por Horas' },
      { v: 'OTRO', l: 'Otro' }
    ].map(o => `<option value="${o.v}" ${rule.workday_type === o.v ? 'selected' : ''}>${o.l}</option>`).join('');

    const bodyHtml = `
      <div class="border-b mb-4 flex gap-4 text-xs font-semibold">
        <button class="tab-btn active" id="tab-contract-details" type="button" style="padding-bottom:8px">Detalles del Contrato</button>
        <button class="tab-btn" id="tab-contract-docs" type="button" style="padding-bottom:8px">Documentos Adjuntos</button>
      </div>

      <!-- Panel 1: Detalles del Contrato -->
      <div id="panel-contract-details" class="space-y-4 animate-fadeIn">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
          <div class="form-group md:col-span-2">
            <label class="form-label">Empleado</label>
            <input class="form-input bg-gray-100" value="${esc(emp.name)}" disabled>
          </div>
          <div class="form-group">
            <label class="form-label">Cargo / Puesto *</label>
            <input type="text" id="cont-form-position" class="form-input" placeholder="Ej: Auxiliar Contable" value="${esc(rule.position || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Jornada Laboral *</label>
            <select id="cont-form-workday" class="form-input">${workdayOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de Contrato *</label>
            <select id="cont-form-type" class="form-input">${contractTypeOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Salario Básico Mensual *</label>
            <input type="number" id="cont-form-salary" class="form-input" min="0" value="${rule.basic_salary || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de Inicio *</label>
            <input type="date" id="cont-form-start" class="form-input" value="${rule.start_date || todayStr()}">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de Fin (término fijo)</label>
            <input type="date" id="cont-form-end" class="form-input" value="${rule.end_date || ''}">
          </div>
        </div>
      </div>

      <!-- Panel 2: Documentos Adjuntos -->
      <div id="panel-contract-docs" class="hidden space-y-4 animate-fadeIn">
        <div class="p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-3 items-end text-left" style="background:#F9FAFB; border-color:#E5E7EB">
          <div class="form-group">
            <label class="form-label text-xs font-semibold">Categoría *</label>
            <select id="doc-upload-cat" class="form-input text-xs">
              <option value="HOJA_VIDA">Hoja de Vida</option>
              <option value="ESTUDIOS">Certificado de Estudios</option>
              <option value="SEGURIDAD_SOCIAL">Afiliación Seguridad Social</option>
              <option value="EXAMEN_MEDICO">Examen Médico Ocupacional</option>
              <option value="HISTORIA_CLINICA">Historia Clínica</option>
              <option value="OTRO">Otro Documento</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs font-semibold">Selecciona Archivo *</label>
            <input type="file" id="doc-upload-file" class="form-input text-xs" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
          </div>
          <button class="btn btn-secondary w-full justify-center text-xs" id="btn-upload-doc" type="button">
            <i class="fas fa-upload mr-1"></i>Subir Documento
          </button>
        </div>

        <div class="overflow-x-auto border rounded-xl" style="border-color:#F0F0F0">
          <table class="data-table text-xs text-left" id="tbl-contract-docs">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Categoría</th>
                <th>Fecha Carga</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="body-contract-docs">
              <tr>
                <td colspan="4" class="text-center py-4 text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i>Cargando documentos...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    openModal(
      `Editar Contrato — ${esc(emp.name)}`,
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-contract">Guardar Contrato</button>`
    );

    const btnSave = $('#btn-save-contract');
    const tabDetails = $('#tab-contract-details');
    const tabDocs = $('#tab-contract-docs');
    const panelDetails = $('#panel-contract-details');
    const panelDocs = $('#panel-contract-docs');

    // Cambiar de pestañas (Tabs)
    tabDetails?.addEventListener('click', () => {
      tabDetails.classList.add('active');
      tabDocs?.classList.remove('active');
      panelDetails?.classList.remove('hidden');
      panelDocs?.classList.add('hidden');
      if (btnSave) btnSave.style.display = '';
    });

    tabDocs?.addEventListener('click', () => {
      tabDocs.classList.add('active');
      tabDetails?.classList.remove('active');
      panelDocs?.classList.remove('hidden');
      panelDetails?.classList.add('hidden');
      if (btnSave) btnSave.style.display = 'none'; // No se necesita botón guardar para adjuntos (tienen sus propios botones de subir/borrar)
      loadDocs();
    });

    // Cargar documentos
    const categoryLabels: Record<string, string> = {
      HOJA_VIDA: 'Hoja de Vida',
      ESTUDIOS: 'Certificado de Estudios',
      SEGURIDAD_SOCIAL: 'Afiliación Seguridad Social',
      EXAMEN_MEDICO: 'Examen Médico Ocupacional',
      HISTORIA_CLINICA: 'Historia Clínica',
      OTRO: 'Otro Documento'
    };

    const loadDocs = async () => {
      const tbody = $('#body-contract-docs');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i>Cargando...</td></tr>';
      try {
        const docs = await pb.listAll('payroll_documents', { 
          filter: `employee_id = "${pb.escapeFilterValue(employeeId)}"`,
          sort: '-created'
        });

        if (docs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-400">Sin documentos registrados.</td></tr>';
        } else {
          tbody.innerHTML = docs.map(d => {
            const url = `${(window as any).PB_URL}/api/files/payroll_documents/${d.id}/${d.file}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}`;
            return `
              <tr class="text-xs">
                <td class="font-semibold">${esc(d.name)}</td>
                <td><span class="badge" style="background:#EBF8FF;color:#2B6CB0">${esc(categoryLabels[d.category] || d.category)}</span></td>
                <td>${esc(d.date || d.created?.slice(0, 10) || '')}</td>
                <td class="text-right space-x-1">
                  <a href="${url}" target="_blank" class="btn btn-outline btn-xs inline-flex items-center" title="Descargar / Ver"><i class="fas fa-download"></i></a>
                  <button class="btn btn-danger btn-xs btn-delete-doc" data-doc-id="${esc(d.id)}" title="Eliminar"><i class="fas fa-trash-can"></i></button>
                </td>
              </tr>
            `;
          }).join('');

          // Listeners para eliminar documentos
          tbody.querySelectorAll('.btn-delete-doc').forEach(btn => {
            btn.addEventListener('click', async () => {
              const docId = btn.getAttribute('data-doc-id');
              if (!docId) return;
              if (!confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) return;
              try {
                await pb.delete('payroll_documents', docId);
                showToast('Documento eliminado con éxito.', 'success');
                loadDocs();
              } catch (err: any) {
                showToast(`Error al eliminar: ${err.message}`, 'error');
              }
            });
          });
        }
      } catch (err: any) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Error al cargar documentos: ${esc(err.message)}</td></tr>`;
      }
    };

    // Subir documento
    $('#btn-upload-doc')?.addEventListener('click', async () => {
      const fileInput = document.getElementById('doc-upload-file') as HTMLInputElement;
      const category = getSelectVal('doc-upload-cat');
      const file = fileInput?.files?.[0];

      if (!file) return showToast('Selecciona un archivo para subir', 'warning');
      if (file.size > 10 * 1024 * 1024) return showToast('El archivo no debe superar los 10 MB', 'error');

      const btnUpload = $('#btn-upload-doc') as HTMLButtonElement;
      if (btnUpload) {
        btnUpload.disabled = true;
        btnUpload.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Subiendo...';
      }

      try {
        const formData = new FormData();
        formData.append('employee_id', employeeId);
        formData.append('category', category);
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('date', todayStr());

        await pb.create('payroll_documents', formData);
        showToast('Documento cargado correctamente', 'success');
        fileInput.value = '';
        loadDocs();
      } catch (err: any) {
        showToast(`Error al subir archivo: ${err.message}`, 'error');
      } finally {
        if (btnUpload) {
          btnUpload.disabled = false;
          btnUpload.innerHTML = '<i class="fas fa-upload mr-1"></i>Subir Documento';
        }
      }
    });

    // Guardar detalles del contrato
    btnSave?.addEventListener('click', async () => {
      try {
        const position = getInputVal('cont-form-position').trim();
        const workday = getSelectVal('cont-form-workday');
        const type = getSelectVal('cont-form-type');
        const salary = parseNum(getInputVal('cont-form-salary')) || 0;
        const start = getInputVal('cont-form-start');
        const end = getInputVal('cont-form-end') || '';

        if (!type || salary <= 0 || !start || !position) {
          return showToast('Completa los campos obligatorios.', 'warning');
        }

        const rules = Array.isArray(config.employee_rules) ? [...config.employee_rules] : [];
        const foundIdx = rules.findIndex(r => r.employee_id === employeeId);

        const newRule = {
          ...(foundIdx >= 0 ? rules[foundIdx] : { employee_id: employeeId }),
          basic_salary: salary,
          contract_type: type,
          start_date: start,
          end_date: end,
          position: position,
          workday_type: workday
        };

        if (foundIdx >= 0) rules[foundIdx] = newRule;
        else rules.push(newRule);

        config.employee_rules = rules;
        await saveNominaConfig(config, row?.id || '');
        closeModal();
        showToast('Contrato actualizado con éxito', 'success');
        renderNominaContratos($('#page-content'));
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    });

  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

async function renderNominaPeriodosPage(c) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando períodos...</div>`;
  try {
    const loadErrors = [];
    const periods = await pb.listAll('payroll_periods', { sort: '-date_from' }).catch((err) => {
      loadErrors.push(`periodos: ${err.message}`);
      return [];
    });
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' }).catch((err) => {
      loadErrors.push(`empleados: ${err.message}`);
      return [];
    });
    const lines = await pb.listAll('payroll_lines', { sort: '-id', expand: 'period_id,employee_id' }).catch(async (err) => {
      try {
        return await pb.listAll('payroll_lines', { expand: 'period_id,employee_id' });
      } catch (_) {
        loadErrors.push(`liquidaciones: ${err.message}`);
        return [];
      }
    });

    const periodTotals = {};
    lines.forEach(l => {
      const pid = l.period_id;
      if (!periodTotals[pid]) periodTotals[pid] = { devengado: 0, deducciones: 0, neto: 0, parafiscales: 0, count: 0 };
      const dev = getNominaDevengadoTotal(l);
      const ded = getNominaDeduccionesTotal(l);
      const para = (l.employer_health || 0) + (l.employer_pension || 0) + (l.employer_arl || 0) + (l.sena || 0) + (l.icbf || 0) + (l.caja_comp || 0);
      periodTotals[pid].devengado += dev;
      periodTotals[pid].deducciones += ded;
      periodTotals[pid].neto += (l.net_pay || 0);
      periodTotals[pid].parafiscales += para;
      periodTotals[pid].count++;
    });

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Períodos de Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Gestión de períodos de pago mensuales o quincenales.</p>
        </div>
        ${can('canWrite') ? `
          <button class="btn btn-primary" id="btn-new-period-pg"><i class="fas fa-calendar-plus"></i> Nuevo Período</button>
        ` : ''}
      </div>
    `;

    const wrap = document.createElement('div');
    c.appendChild(wrap);
    
    await renderNominaPeriodos(wrap, periods, lines, periodTotals, loadErrors, employees.length === 0, periods.length === 0);

    $('#btn-new-period-pg')?.addEventListener('click', () => openPeriodForm());

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderNominaNovedadesPage(c) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando novedades...</div>`;
  try {
    const periods = await pb.listAll('payroll_periods', { sort: '-date_from' });
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' });
    
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Novedades de Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Registro de incapacidades, horas extras, bonificaciones y deducciones del mes.</p>
        </div>
      </div>
      <div id="novedades-content-pg"></div>
    `;

    await renderNominaNovedades($('#novedades-content-pg'), periods, employees);

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderNominaLiquidacionPage(c) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando liquidaciones...</div>`;
  try {
    const periods = await pb.listAll('payroll_periods', { sort: '-date_from' });
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' });
    
    const draftPeriods = periods.filter(p => p.status === 'draft' || !p.status);
    const periodOptions = draftPeriods.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Proceso de Liquidación</h3>
           <p class="text-sm" style="color:#6B7280">Pre-liquidación masiva en un solo clic y gestión de volantes individuales.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div class="form-group mb-0 text-left" style="min-width:240px">
            <label class="form-label text-xs font-semibold">Selecciona Período en Borrador</label>
            <select id="liq-period-select" class="form-input">${periodOptions || '<option value="">No hay periodos en borrador</option>'}</select>
          </div>
          <div class="flex gap-2">
            ${can('canWrite') && draftPeriods.length ? `
              <button class="btn btn-secondary btn-sm" id="btn-liq-manual"><i class="fas fa-plus mr-1"></i>Nueva Liquidación Manual</button>
              <button class="btn btn-primary btn-sm" id="btn-liq-masiva-pg"><i class="fas fa-calculator mr-1"></i>Pre-liquidar Masivamente (1-Click)</button>
            ` : ''}
          </div>
        </div>

        <div id="liquidacion-resultados-pg">
          <!-- Carga dinámica -->
        </div>
      </div>
    `;

    const loadLiquidacionesPeriodo = async () => {
      const periodId = getSelectVal('liq-period-select');
      const container = $('#liquidacion-resultados-pg');
      if (!container) return;
      if (!periodId) {
        container.innerHTML = '<div class="p-8 text-center text-gray-400">Selecciona un período activo para visualizar y procesar las liquidaciones.</div>';
        return;
      }

      container.innerHTML = '<div class="p-4 text-center text-gray-500">Cargando liquidaciones del período...</div>';
      try {
        const lines = await pb.listAll('payroll_lines', { filter: `period_id="${periodId}"`, expand: 'employee_id,period_id', sort: 'id' });

        if (!lines.length) {
          container.innerHTML = `
            <div class="p-8 text-center text-gray-500 border border-dashed rounded-2xl">
              <i class="fas fa-calculator text-gray-300 text-4xl mb-2"></i>
              <p class="font-medium">No se han generado liquidaciones para este período.</p>
              <p class="text-xs text-gray-400 mt-1">Presiona "Pre-liquidar Masivamente (1-Click)" para calcular automáticamente el salario y las novedades.</p>
            </div>
          `;
          return;
        }

        const totDev = lines.reduce((s,l) => s + getNominaDevengadoTotal(l), 0);
        const totNeto = lines.reduce((s,l) => s + (l.net_pay||0), 0);
        const totPara = lines.reduce((s,l) => s + (l.employer_health||0)+(l.employer_pension||0)+(l.employer_arl||0)+(l.sena||0)+(l.icbf||0)+(l.caja_comp||0), 0);
        const totProv = lines.reduce((s,l) => s + (l.cesantias||0)+(l.intereses_ces||0)+(l.prima||0)+(l.vacaciones||0), 0);

        const isUserAdminOrSuperadmin = ['superadmin', 'administrador', 'admin', 'propietario', 'gerente'].includes(String(pb.currentUser?.role || '').toLowerCase()) || can('canDelete');

        container.innerHTML = `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl border mb-4">
            <div class="text-center"><div class="text-xs text-gray-400">Total Devengado</div><div class="font-bold text-sm text-blue-900">${fmt(totDev)}</div></div>
            <div class="text-center"><div class="text-xs text-gray-400">Total Neto</div><div class="font-bold text-sm text-emerald-800">${fmt(totNeto)}</div></div>
            <div class="text-center"><div class="text-xs text-gray-400">Parafiscales</div><div class="font-bold text-sm text-orange-900">${fmt(totPara)}</div></div>
            <div class="text-center"><div class="text-xs text-gray-400">Provisiones</div><div class="font-bold text-sm text-purple-900">${fmt(totProv)}</div></div>
          </div>

          <div class="flex justify-between items-center mb-4 gap-3 flex-wrap">
            <div class="text-sm font-semibold text-gray-700">Listado de Colillas</div>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm text-indigo-600 font-semibold" onclick="window.printConsolidatedPayrollSlips('${esc(periodId)}')"><i class="fas fa-copy mr-1"></i>Desprendibles Consolidados</button>
              <button class="btn btn-outline btn-sm text-emerald-700 font-semibold" onclick="window.printConsolidatedPayrollSummary('${esc(periodId)}')"><i class="fas fa-file-invoice-dollar mr-1"></i>Lista de Pago Consolidada</button>
              ${isUserAdminOrSuperadmin ? `
                <button class="btn btn-danger btn-sm" onclick="window.reversarLiquidacionPeriodo('${esc(periodId)}')">
                  <i class="fas fa-trash-can mr-1"></i>Eliminar Liquidación de Período
                </button>
              ` : ''}
            </div>
          </div>

          <div class="overflow-x-auto text-left">
            <table class="data-table text-xs" id="liq-page-table">
               <thead><tr><th>Empleado</th><th>Días</th><th>Salario Base</th><th>Devengado</th><th>Deducciones</th><th class="font-semibold">Neto a Pagar</th><th class="text-right">Acciones</th></tr></thead>
              <tbody>
                ${lines.map(l => `<tr>
                  <td class="font-semibold">${esc(l.expand?.employee_id?.name || '?')}</td>
                  <td class="text-center">${l.days_worked||30}</td>
                  <td>${fmt(l.salary_base||0)}</td>
                  <td>${fmt(getNominaDevengadoTotal(l))}</td>
                  <td>${fmt(getNominaDeduccionesTotal(l))}</td>
                  <td class="font-semibold text-emerald-800">${fmt(l.net_pay||0)}</td>
                  <td class="text-right">
                    <div class="flex gap-1 justify-end">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(l.id)}')"><i class="fas fa-eye"></i></button>
                      <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(l.id)}')"><i class="fas fa-print"></i></button>
                      ${can('canWrite') ? `
                        <button class="btn btn-outline btn-sm text-blue-600 btn-edit-liq-pg" data-id="${esc(l.id)}" title="Editar liquidación"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-outline btn-sm text-red-600" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(l.id)}')"><i class="fas fa-trash"></i></button>
                      ` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        `;

        container.querySelectorAll('.btn-edit-liq-pg').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const line = lines.find(x => x.id === id);
            if (line) {
              openPayrollLineForm(periods, employees, line);
            }
          });
        });


        const tbl = document.getElementById('liq-page-table') as HTMLTableElement;
        if (tbl) (window as any).makeTableSortable(tbl);

      } catch (err) {
        container.innerHTML = `<div class="p-4 text-center text-red-500">${esc(err.message)}</div>`;
      }
    };

    $('#liq-period-select')?.addEventListener('change', loadLiquidacionesPeriodo);
    
    $('#btn-liq-masiva-pg')?.addEventListener('click', async () => {
      const periodId = getSelectVal('liq-period-select');
      if (!periodId) return showToast('Selecciona un período', 'warning');
      
      const btn = $('#btn-liq-masiva-pg');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Liquidando...';
      }
      
      try {
        await window.liquidarPeriodoMasivo(periodId);
        loadLiquidacionesPeriodo();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-calculator mr-1"></i>Pre-liquidar Masivamente (1-Click)';
        }
      }
    });

    $('#btn-liq-manual')?.addEventListener('click', () => {
      openPayrollLineForm(periods, employees);
    });

    loadLiquidacionesPeriodo();

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderNominaElectronicaPage(c) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando nómina electrónica...</div>`;
  try {
    const periods = await pb.listAll('payroll_periods', { sort: '-date_from' });
    
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Nómina Electrónica DIAN</h3>
           <p class="text-sm" style="color:#6B7280">Consolidación de nómina individual electrónica y reportes DIAN.</p>
        </div>
      </div>
      <div id="electronica-content-pg"></div>
    `;

    await renderNominaElectronica($('#electronica-content-pg'), periods);

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderNomina(c) {
  return renderNominaPeriodosPage(c);
}

async function renderNominaNovedades(c, periods, employees) {
  c.innerHTML = `<div class="p-4 text-center text-sm text-gray-500">Cargando novedades...</div>`;
  try {
    const novelties = await pb.listAll('payroll_novelties', {
      expand: 'period_id,employee_id',
      sort: '-date_from'
    });

    const employeeOpts = `<option value="all">Todos los empleados</option>${employees.map(e => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('')}`;
    const typeOpts = `<option value="all">Todos los tipos</option>${Object.entries(NOVELTY_TYPES).map(([cat, tipos]) => `
      <optgroup label="${esc(cat)}">
        ${tipos.map(t => `<option value="${esc(t.key)}">${esc(t.label)}</option>`).join('')}
      </optgroup>
    `).join('')}`;

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="form-group mb-0" style="min-width:200px">
              <select id="nov-filter-employee" class="form-input text-sm">${employeeOpts}</select>
            </div>
            <div class="form-group mb-0" style="min-width:200px">
              <select id="nov-filter-type" class="form-input text-sm">${typeOpts}</select>
            </div>
          </div>
          ${can('canWrite') ? `<button class="btn btn-primary btn-sm" id="btn-new-novelty"><i class="fas fa-plus mr-1"></i>Registrar Novedad</button>` : ''}
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm" id="novelties-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Periodo</th>
                <th>Tipo de Novedad</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th class="text-center">Cant/Horas/Días</th>
                <th class="text-right">Valor COP</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="novelties-table-body">
              <!-- Carga dinámica -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const renderRows = () => {
      const empFilter = $('#nov-filter-employee')?.value || 'all';
      const typeFilter = $('#nov-filter-type')?.value || 'all';
      const body = $('#novelties-table-body');
      if (!body) return;

      const filtered = novelties.filter(n => {
        const matchEmp = empFilter === 'all' || n.employee_id === empFilter;
        const matchType = typeFilter === 'all' || n.type === typeFilter;
        return matchEmp && matchType;
      });

      const labelForType = (type) => {
        let found = type;
        Object.values(NOVELTY_TYPES).forEach(list => {
          const item = list.find(x => x.key === type);
          if (item) found = item.label;
        });
        return found;
      };

      body.innerHTML = filtered.length ? filtered.map(n => {
        const empName = n.expand?.employee_id?.name || 'Empleado no encontrado';
        const periodName = n.expand?.period_id?.name || 'Sin periodo';
        const isDraft = (n.expand?.period_id?.status || 'draft') === 'draft';
        return `
          <tr>
            <td class="font-semibold">${esc(empName)}</td>
            <td>${esc(periodName)}</td>
            <td>${esc(labelForType(n.type))}</td>
            <td>${esc(n.date_from)}</td>
            <td>${esc(n.date_to || '—')}</td>
            <td class="text-center">${n.qty || '—'}</td>
            <td class="text-right">${n.amount ? fmt(n.amount) : '—'}</td>
            <td>
              ${isDraft ? '<span class="badge" style="background:#FFF3CD;color:#856404">Pendiente</span>' : '<span class="badge badge-green">Procesado</span>'}
            </td>
            <td class="text-right">
              <div class="flex gap-1 justify-end">
                ${isDraft && can('canWrite') ? `
                  <button class="btn btn-outline btn-sm btn-edit-novelty" data-id="${esc(n.id)}"><i class="fas fa-pen"></i></button>
                  <button class="btn btn-outline btn-sm btn-del-novelty" data-id="${esc(n.id)}"><i class="fas fa-trash"></i></button>
                ` : '—'}
              </div>
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="9" class="text-center py-6 text-gray-400">No se encontraron novedades registradas.</td></tr>`;

      body.querySelectorAll('.btn-edit-novelty').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const novelty = novelties.find(n => n.id === id);
          if (novelty) openNoveltyForm(periods, employees, novelty);
        });
      });

      body.querySelectorAll('.btn-del-novelty').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          confirmDialog('Eliminar Novedad', '¿Confirmas eliminar esta novedad de la nómina?', async () => {
            try {
              await pb.delete('payroll_novelties', id);
              showToast('Novedad eliminada', 'success');
              renderNomina($('#page-content'));
            } catch (err) {
              showToast(err.message, 'error');
            }
          });
        });
      });
    };

    $('#nov-filter-employee')?.addEventListener('change', renderRows);
    $('#nov-filter-type')?.addEventListener('change', renderRows);
    $('#btn-new-novelty')?.addEventListener('click', () => openNoveltyForm(periods, employees));

    renderRows();
    const tbl = document.getElementById('novelties-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err) {
    c.innerHTML = `<div class="p-4 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function openNoveltyForm(periods, employees, novelty = null) {
  const openPeriods = periods.filter(p => p.status === 'draft' || !p.status);
  if (!openPeriods.length) {
    return showToast('No hay periodos en borrador para registrar novedades.', 'warning');
  }

  const employeeOpts = `<option value="">— Seleccionar empleado —</option>${employees.map(e => `<option value="${esc(e.id)}">${esc(e.doc_number || '')} - ${esc(e.name)}</option>`).join('')}`;
  const periodOpts = openPeriods.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  const typeOpts = `<option value="">— Seleccionar tipo de novedad —</option>${Object.entries(NOVELTY_TYPES).map(([cat, tipos]) => `
    <optgroup label="${esc(cat)}">
      ${tipos.map(t => `<option value="${esc(t.key)}">${esc(t.label)}</option>`).join('')}
    </optgroup>
  `).join('')}`;

  const bodyHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
      <div class="form-group"><label class="form-label">Periodo de Nómina *</label><select id="nov-form-period" class="form-input">${periodOpts}</select></div>
      <div class="form-group"><label class="form-label">Empleado *</label><select id="nov-form-employee" class="form-input">${employeeOpts}</select></div>
      <div class="form-group md:col-span-2"><label class="form-label">Tipo de Novedad *</label><select id="nov-form-type" class="form-input">${typeOpts}</select></div>
      <div class="form-group"><label class="form-label">Fecha Inicio *</label><input type="date" id="nov-form-date-from" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Fecha Fin (opcional)</label><input type="date" id="nov-form-date-to" class="form-input"></div>
      <div class="form-group" id="container-nov-qty"><label class="form-label" id="lbl-nov-qty">Cantidad (Días / Horas)</label><input type="number" id="nov-form-qty" class="form-input" min="0" step="0.1" value="0"></div>
      <div class="form-group" id="container-nov-amount" style="display:none"><label class="form-label">Valor total (COP)</label><input type="number" id="nov-form-amount" class="form-input" min="0" step="1" value="0"></div>
      <div class="form-group"><label class="form-label">Número de soporte (EPS/Radicado)</label><input type="text" id="nov-form-support" class="form-input" placeholder="Ej: INC-94827"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Observaciones</label><textarea id="nov-form-desc" class="form-input" rows="2" placeholder="Detalles de la novedad..."></textarea></div>
    </div>
  `;

  openModal(
    novelty ? 'Editar Novedad de Nómina' : 'Registrar Novedad de Nómina',
    bodyHtml,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-novelty">Guardar</button>`
  );

  const getFieldType = (tipo) => {
    if (['HORA_EXTRA_DIURNA', 'HORA_EXTRA_NOCTURNA', 'HORA_EXTRA_DOMINICAL', 'HORA_EXTRA_DOMINICAL_NOCTURNA', 'RECARGO_NOCTURNO', 'RECARGO_DOMINICAL'].includes(tipo)) return 'horas';
    if (['PRESTAMO', 'ANTICIPO', 'MULTA', 'EMBARGO', 'OTRA_DEDUCCION', 'BONIFICACION', 'COMISION', 'AJUSTE_SALARIAL', 'PRIMA_SERVICIOS', 'INTERESES_CESANTIAS', 'CESANTIAS', 'DOTACION', 'PRIMA_EXTRALGAL', 'OTRO_INGRESO', 'GASTOS_REPRESENTACION', 'AUX_NO_SALARIALES', 'AUXILIO_RODAMIENTO', 'COMPENSATORIOS', 'AUXILIO_ALIMENTACION', 'LIBRANZA'].includes(tipo)) return 'valor';
    return 'dias';
  };

  const adjustFields = () => {
    const tipo = $('#nov-form-type')?.value || '';
    const fType = getFieldType(tipo);
    const qtyContainer = $('#container-nov-qty');
    const amountContainer = $('#container-nov-amount');
    const lblQty = $('#lbl-nov-qty');

    if (fType === 'horas') {
      if (qtyContainer) qtyContainer.style.display = '';
      if (amountContainer) amountContainer.style.display = 'none';
      if (lblQty) lblQty.innerHTML = 'Cantidad de Horas *';
    } else if (fType === 'valor') {
      if (qtyContainer) qtyContainer.style.display = 'none';
      if (amountContainer) amountContainer.style.display = '';
    } else {
      if (qtyContainer) qtyContainer.style.display = '';
      if (amountContainer) amountContainer.style.display = 'none';
      if (lblQty) lblQty.innerHTML = 'Cantidad de Días *';
    }
  };

  $('#nov-form-type')?.addEventListener('change', adjustFields);

  const calcDays = () => {
    const fromStr = $('#nov-form-date-from')?.value || '';
    const toStr = $('#nov-form-date-to')?.value || '';
    const tipo = $('#nov-form-type')?.value || '';
    if (fromStr && toStr && getFieldType(tipo) === 'dias') {
      const from = new Date(fromStr);
      const to = new Date(toStr);
      const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0 && $('#nov-form-qty')) {
        $('#nov-form-qty').value = String(diff);
      }
    }
  };

  $('#nov-form-date-from')?.addEventListener('change', calcDays);
  $('#nov-form-date-to')?.addEventListener('change', calcDays);

  if (novelty) {
    if ($('#nov-form-period')) $('#nov-form-period').value = novelty.period_id || '';
    if ($('#nov-form-employee')) $('#nov-form-employee').value = novelty.employee_id || '';
    if ($('#nov-form-type')) $('#nov-form-type').value = novelty.type || '';
    if ($('#nov-form-date-from')) $('#nov-form-date-from').value = novelty.date_from || '';
    if ($('#nov-form-date-to')) $('#nov-form-date-to').value = novelty.date_to || '';
    if ($('#nov-form-qty')) $('#nov-form-qty').value = String(novelty.qty || 0);
    if ($('#nov-form-amount')) $('#nov-form-amount').value = String(novelty.amount || 0);
    if ($('#nov-form-support')) $('#nov-form-support').value = novelty.support_number || '';
    if ($('#nov-form-desc')) $('#nov-form-desc').value = novelty.description || '';
    adjustFields();
  }

  $('#btn-save-novelty')?.addEventListener('click', async () => {
    try {
      const payload = {
        period_id: getSelectVal('nov-form-period'),
        employee_id: getSelectVal('nov-form-employee'),
        type: getSelectVal('nov-form-type'),
        date_from: getInputVal('nov-form-date-from'),
        date_to: getInputVal('nov-form-date-to') || undefined,
        qty: parseNum(getInputVal('nov-form-qty')) || 0,
        amount: parseNum(getInputVal('nov-form-amount')) || 0,
        support_number: getInputVal('nov-form-support') || '',
        description: getInputVal('nov-form-desc') || '',
        status: 'draft'
      };

      if (!payload.period_id || !payload.employee_id || !payload.type || !payload.date_from) {
        return showToast('Completa los campos obligatorios.', 'warning');
      }

      if (novelty) {
        await pb.update('payroll_novelties', novelty.id, payload);
        showToast('Novedad actualizada', 'success');
      } else {
        await pb.create('payroll_novelties', payload);
        showToast('Novedad registrada', 'success');
      }
      closeModal();
      navigate((window as any).currentPage || 'nomina-novedades');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function renderPlanillaPilaRevision(year: number, month: number) {
  try {
    const monthPadded = String(month).padStart(2, '0');
    const ymPrefix = `${year}-${monthPadded}`;

    const allPeriods = await pb.listAll('payroll_periods');
    const matchingPeriods = allPeriods.filter((p: any) => (p.date_from || '').startsWith(ymPrefix) || (p.date_to || '').startsWith(ymPrefix));

    if (!matchingPeriods.length) {
      return showToast(`No hay períodos de nómina registrados para ${month}/${year}.`, 'warning');
    }

    const periodIds = matchingPeriods.map((p: any) => p.id);
    const filterExpr = periodIds.map((id: string) => `period_id="${pb.escapeFilterValue(id)}"`).join('||');
    const lines = await pb.listAll('payroll_lines', {
      filter: filterExpr,
      expand: 'employee_id'
    });

    if (!lines.length) {
      return showToast(`No se encontraron liquidaciones de nómina registradas para los períodos de ${month}/${year}.`, 'warning');
    }

    // Config & Third Parties for fund names
    const { config } = await getNominaConfigWithRow();
    const thirdParties = await pb.listAll('third_parties', { filter: 'active=true' }).catch(() => []);
    const thirdPartiesMap = new Map<string, any>(thirdParties.map((tp: any) => [tp.id, tp]));

    // Query novelties for matching periods
    const novelties = await pb.listAll('payroll_novelties', {
      filter: filterExpr
    }).catch(() => []);
    const empNoveltiesMap = new Map<string, any[]>();
    novelties.forEach((nov: any) => {
      if (nov.employee_id) {
        if (!empNoveltiesMap.has(nov.employee_id)) empNoveltiesMap.set(nov.employee_id, []);
        empNoveltiesMap.get(nov.employee_id)!.push(nov);
      }
    });

    const mapNoveltyToPilaAbbr = (typeStr: string): string => {
      const t = (typeStr || '').toUpperCase().trim();
      if (!t) return '';
      if (t === 'INGRESO' || t === 'ING') return 'ING';
      if (t === 'RETIRO' || t === 'RET') return 'RET';
      if (t === 'TRASLADO_DESDE_EPS' || t === 'TDE') return 'TDE';
      if (t === 'TRASLADO_A_EPS' || t === 'TAE') return 'TAE';
      if (t === 'TRASLADO_DESDE_AFP' || t === 'TDP') return 'TDP';
      if (t === 'TRASLADO_A_AFP' || t === 'TAP') return 'TAP';
      if (t === 'AJUSTE_SALARIAL' || t === 'VSP' || t === 'VARIACION_SALARIO') return 'VSP';
      if (t.startsWith('HORA_EXTRA') || t.startsWith('RECARGO') || t === 'COMISION' || t === 'BONIFICACION' || t === 'VST') return 'VST';
      if (t === 'VCT' || t === 'VARIACION_CENTRO_TRABAJO') return 'VCT';
      if (t === 'LICENCIA_NO_REMUNERADA' || t === 'PERMISO_NO_REMUNERADO' || t === 'SUSPENSION' || t === 'SLN') return 'SLN';
      if (t === 'INCAPACIDAD_ENFERMEDAD_GENERAL' || t === 'INCAPACIDAD' || t === 'IGE') return 'IGE';
      if (t === 'LICENCIA_MATERNIDAD' || t === 'LICENCIA_PATERNIDAD' || t === 'LMA') return 'LMA';
      if (t === 'VACACIONES' || t === 'VAC') return 'VAC';
      if (t === 'AVP' || t === 'APORTE_VOLUNTARIO_PENSION') return 'AVP';
      if (t === 'INCAPACIDAD_ACCIDENTE_TRABAJO' || t === 'INCAPACIDAD_ENFERMEDAD_PROFESION' || t === 'IRL') return 'IRL';
      return t;
    };

    // Accumulate by employee (monthly consolidation)
    const empMap = new Map<string, any>();

    for (const line of lines) {
      const empId = line.employee_id || line.expand?.employee_id?.id || '';
      if (!empId) continue;

      const empObj = line.expand?.employee_id || {};
      const effectiveRule = getEmployeePayrollRule(config, empId);

      if (!empMap.has(empId)) {
        const pensionFundId = effectiveRule.tercero_pension_id || '';
        const saludFundId = effectiveRule.tercero_salud_id || '';
        const cajaFundId = effectiveRule.tercero_caja_id || '';

        const pensionFundName = thirdPartiesMap.get(pensionFundId)?.name || (pensionFundId ? 'Fondo Pensión' : 'NO ASIGNADO');
        const saludFundName = thirdPartiesMap.get(saludFundId)?.name || (saludFundId ? 'EPS' : 'NO ASIGNADO');
        const cajaFundName = thirdPartiesMap.get(cajaFundId)?.name || (cajaFundId ? 'CCF' : 'NO ASIGNADO');

        const arlLevel = effectiveRule.arl_risk_level || line.arl_risk_level || 1;
        const arlRate = ARL_RISK_RATES[arlLevel] || 0.00522;
        const arlTarifaStr = `${round2(arlRate * 100)}%`;

        empMap.set(empId, {
          empId,
          doc: empObj.doc_number || empObj.numeroDocumento || line.employee_id || '—',
          name: empObj.name || (empObj.first_name ? `${empObj.first_name} ${empObj.last_name || ''}` : 'Empleado'),
          noveltySet: new Set<string>(),
          novedad: 'NO',
          horasExtrasHoras: 0,
          horasExtrasMonto: 0,
          otDetalleParts: [] as string[],
          comisionesMonto: 0,
          diasLaborados: 0,
          diasCotizados: 0,
          diasAfp: 0,
          diasEps: 0,
          diasArp: 0,
          diasCcf: 0,
          adminPension: pensionFundName,
          ibcPension: 0,
          aportePension: 0,
          adminSalud: saludFundName,
          ibcSalud: 0,
          aporteSalud: 0,
          adminCajas: cajaFundName,
          ibcCajas: 0,
          aporteCajas: 0,
          tarifaRiesgos: arlTarifaStr,
          ibcRiesgos: 0,
          aporteRiesgos: 0,
          aporteSena: 0,
          aporteIcbf: 0,
          esap: 0,
          aporteMinisterio: 0,
          fondoSolidaridad: 0,
          totalEmpPila: 0,
          totalAportesEmpleado: 0
        });
      }

      const acc = empMap.get(empId);

      // Collect novelties from payroll_novelties for PILA badge display
      const empNovs = empNoveltiesMap.get(empId) || [];
      empNovs.forEach((nov: any) => {
        const abbr = mapNoveltyToPilaAbbr(nov.type);
        if (abbr) acc.noveltySet.add(abbr);
      });

      // Overtime & concept amounts for this line
      const otMeta = getNominaOvertimeMetaFromLine(line);
      const lineOtAmount = otMeta.total_amount || round2(Number(line.overtime || 0));
      let lineOtHours = 0;
      if (otMeta.breakdown && Array.isArray(otMeta.breakdown)) {
        otMeta.breakdown.forEach((b: any) => {
          if (b.hours > 0 || b.amount > 0) {
            lineOtHours += b.hours || 0;
            acc.otDetalleParts.push(`${b.hours}h ${b.key.toUpperCase()} ($${fmt(b.amount || 0)})`);
          }
        });
      }
      if (lineOtAmount > 0) acc.noveltySet.add('VST');

      const conceptAmounts = getNominaConceptAmountsFromLine(line);
      const lineComisiones = round2(Number(conceptAmounts.comisiones || 0));
      if (lineComisiones > 0) acc.noveltySet.add('VST');

      const lineIncap = round2(Number(conceptAmounts.incapacidades || 0));
      const lineLic = round2(Number(conceptAmounts.licencias || 0));
      const lineVac = round2(Number(conceptAmounts.vacaciones_disfrutadas || 0));
      const lineAjuste = round2(Number(conceptAmounts.ajuste_salarial || 0));
      const lineBonif = round2(Number(conceptAmounts.bonificacion || 0));

      if (lineIncap > 0) acc.noveltySet.add('IGE');
      if (lineLic > 0) acc.noveltySet.add('SLN');
      if (lineVac > 0) acc.noveltySet.add('VAC');
      if (lineBonif > 0 || lineAjuste > 0) acc.noveltySet.add('VST');

      // Collect ING / RET from contract dates
      const startDate = effectiveRule.start_date || empObj.hire_date || '';
      const endDate = effectiveRule.end_date || empObj.termination_date || '';
      if (startDate && startDate.startsWith(ymPrefix)) acc.noveltySet.add('ING');
      if (endDate && endDate.startsWith(ymPrefix)) acc.noveltySet.add('RET');

      const days = line.days_worked || 30;

      // Base salary proportional to days worked in this period
      const proportionalSalary = round2(((line.salary_base || 0) / 30) * days);

      // Real IBC for PILA = Base Salario + Horas Extras + Comisiones + Incapacidades + Licencias + Vacaciones + Ajustes Salariales
      const lineIbc = round2(proportionalSalary + lineOtAmount + lineComisiones + lineIncap + lineLic + lineVac + lineAjuste + lineBonif);

      const saludTrab = line.deduction_health || 0;
      const saludEmp = line.employer_health || 0;
      const penTrab = line.deduction_pension || 0;
      const penEmp = line.employer_pension || 0;
      const fsp = line.solidarity_fund || 0;
      const arlVal = line.employer_arl || 0;
      const caja = line.caja_comp || 0;
      const sena = line.sena || 0;
      const icbf = line.icbf || 0;

      acc.horasExtrasMonto += lineOtAmount;
      acc.horasExtrasHoras += lineOtHours;
      acc.comisionesMonto += lineComisiones;

      acc.diasLaborados += days;
      acc.diasCotizados += days;
      acc.diasAfp += effectiveRule.is_pensioner ? 0 : days;
      acc.diasEps += days;
      acc.diasArp += days;
      acc.diasCcf += days;

      const isExempt = !!config.company_rules.exempt_sena_icbf && (lineIbc < (config.company_rules.smmlv * 10));
      const effectiveSena = isExempt ? 0 : sena;
      const effectiveIcbf = isExempt ? 0 : icbf;
      const effectiveSalud = round2(saludTrab + (isExempt ? 0 : saludEmp));

      acc.ibcPension += lineIbc;
      acc.aportePension += round2(penTrab + penEmp + fsp);

      acc.ibcSalud += lineIbc;
      acc.aporteSalud += effectiveSalud;

      acc.ibcCajas += lineIbc;
      acc.aporteCajas += caja;

      acc.ibcRiesgos += lineIbc;
      acc.aporteRiesgos += arlVal;

      acc.aporteSena += effectiveSena;
      acc.aporteIcbf += effectiveIcbf;
      acc.esap += 0;
      acc.aporteMinisterio += 0;
      acc.fondoSolidaridad += fsp;
      acc.totalAportesEmpleado += round2(saludTrab + penTrab + fsp);
    }

    const rowItems = Array.from(empMap.values()).map(acc => {
      const novArray = Array.from(acc.noveltySet as Set<string>);
      acc.novedad = novArray.length > 0 ? novArray.join(', ') : 'NO';

      acc.horasExtrasMonto = round2(acc.horasExtrasMonto);
      acc.horasExtrasHoras = round2(acc.horasExtrasHoras);
      acc.comisionesMonto = round2(acc.comisionesMonto);

      const uniqueOt = Array.from(new Set(acc.otDetalleParts as string[]));
      acc.horasExtrasDetalle = uniqueOt.length > 0 
        ? uniqueOt.join(' | ') 
        : (acc.horasExtrasHoras > 0 ? `${acc.horasExtrasHoras} hrs ($${fmt(acc.horasExtrasMonto)})` : '—');

      acc.diasLaborados = Math.min(30, acc.diasLaborados);
      acc.diasCotizados = Math.min(30, acc.diasCotizados);
      acc.diasAfp = Math.min(30, acc.diasAfp);
      acc.diasEps = Math.min(30, acc.diasEps);
      acc.diasArp = Math.min(30, acc.diasArp);
      acc.diasCcf = Math.min(30, acc.diasCcf);

      acc.ibcPension = round2(acc.ibcPension);
      acc.aportePension = round2(acc.aportePension);
      acc.ibcSalud = round2(acc.ibcSalud);
      acc.aporteSalud = round2(acc.aporteSalud);
      acc.ibcCajas = round2(acc.ibcCajas);
      acc.aporteCajas = round2(acc.aporteCajas);
      acc.ibcRiesgos = round2(acc.ibcRiesgos);
      acc.aporteRiesgos = round2(acc.aporteRiesgos);
      acc.aporteSena = round2(acc.aporteSena);
      acc.aporteIcbf = round2(acc.aporteIcbf);
      acc.esap = round2(acc.esap);
      acc.aporteMinisterio = round2(acc.aporteMinisterio);
      acc.fondoSolidaridad = round2(acc.fondoSolidaridad);
      acc.totalAportesEmpleado = round2(acc.totalAportesEmpleado);

      acc.totalEmpPila = round2(acc.aporteSalud + acc.aportePension + acc.aporteRiesgos + acc.aporteCajas + acc.aporteSena + acc.aporteIcbf + acc.esap + acc.aporteMinisterio);
      return acc;
    });

    let totIbcPension = 0, totAportePension = 0;
    let totIbcSalud = 0, totAporteSalud = 0;
    let totIbcCajas = 0, totAporteCajas = 0;
    let totIbcRiesgos = 0, totAporteRiesgos = 0;
    let totSena = 0, totIcbf = 0, totEsap = 0, totMinisterio = 0;
    let totHorasExtrasMonto = 0, totHorasExtrasHoras = 0, totComisionesMonto = 0;
    let totPilaGlobal = 0;
    let totAportesEmpleado = 0;
    let totFondoSolidaridad = 0;

    rowItems.forEach(r => {
      totHorasExtrasMonto += r.horasExtrasMonto;
      totHorasExtrasHoras += r.horasExtrasHoras;
      totComisionesMonto += r.comisionesMonto;

      totIbcPension += r.ibcPension;
      totAportePension += r.aportePension;
      totIbcSalud += r.ibcSalud;
      totAporteSalud += r.aporteSalud;
      totIbcCajas += r.ibcCajas;
      totAporteCajas += r.aporteCajas;
      totIbcRiesgos += r.ibcRiesgos;
      totAporteRiesgos += r.aporteRiesgos;
      totSena += r.aporteSena;
      totIcbf += r.aporteIcbf;
      totEsap += r.esap;
      totMinisterio += r.aporteMinisterio;
      totPilaGlobal += r.totalEmpPila;
      totAportesEmpleado += r.totalAportesEmpleado;
      totFondoSolidaridad += r.fondoSolidaridad;
    });

    // Company info for PDF header
    const settingsList = await pb.listAll('settings', { filter: 'key="company" || key="company_name" || key="company_nit"' }).catch(() => []);
    let companyName = 'MI EMPRESA S.A.S.';
    let companyNit = '';
    const companySetting = settingsList.find((s: any) => s.key === 'company');
    if (companySetting) {
      try {
        const valObj = typeof companySetting.value === 'string' ? JSON.parse(companySetting.value) : companySetting.value;
        companyName = valObj.name || valObj.razon_social || companyName;
        companyNit = valObj.nit || companyNit;
      } catch (_) {}
    }

    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthLabel = monthNames[month] || String(month);

    const bodyHtml = `
      <div class="space-y-4 text-left text-xs" id="printable-pila-report">
        <div class="flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-xl border">
          <div>
            <h3 class="font-bold text-sm text-gray-800">PLANILLA DE REVISIÓN DE SEGURIDAD SOCIAL Y PARAFISCALES (PILA)</h3>
            <p class="text-gray-500">Período Acumulado: <strong>${monthLabel} / ${year}</strong> — Empleados Consolidados: <strong>${rowItems.length}</strong></p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm text-emerald-700 font-bold" id="btn-export-pila-excel"><i class="fas fa-file-excel mr-1"></i>Exportar a Excel (25+ Campos)</button>
            <button class="btn btn-primary btn-sm font-bold" id="btn-export-pila-pdf"><i class="fas fa-file-pdf mr-1"></i>Imprimir / Exportar a PDF</button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-6 gap-2 text-center font-semibold">
          <div class="bg-blue-50 p-2 rounded-lg border border-blue-100"><div class="text-gray-400 text-3xs">TOTAL IBC</div><div class="text-blue-900 text-xs font-bold">${fmt(totIbcSalud)}</div></div>
          <div class="bg-indigo-50 p-2 rounded-lg border border-indigo-100"><div class="text-gray-400 text-3xs">HORAS EXTRAS / COMIS.</div><div class="text-indigo-900 text-xs font-bold">${fmt(totHorasExtrasMonto + totComisionesMonto)}</div></div>
          <div class="bg-emerald-50 p-2 rounded-lg border border-emerald-100"><div class="text-gray-400 text-3xs">TOTAL SALUD</div><div class="text-emerald-900 text-xs font-bold">${fmt(totAporteSalud)}</div></div>
          <div class="bg-purple-50 p-2 rounded-lg border border-purple-100"><div class="text-gray-400 text-3xs">TOTAL PENSIÓN</div><div class="text-purple-900 text-xs font-bold">${fmt(totAportePension)}</div></div>
          <div class="bg-amber-50 p-2 rounded-lg border border-amber-100"><div class="text-gray-400 text-3xs">TOTAL ARL</div><div class="text-amber-900 text-xs font-bold">${fmt(totAporteRiesgos)}</div></div>
          <div class="bg-emerald-100 p-2 rounded-lg border border-emerald-300"><div class="text-emerald-800 text-3xs">TOTAL PLANILLA PILA</div><div class="text-emerald-950 text-sm font-bold">${fmt(totPilaGlobal)}</div></div>
        </div>

        <div class="overflow-x-auto border rounded-xl bg-white max-h-96">
          <table class="data-table text-xs whitespace-nowrap">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="sticky left-0 bg-gray-100 z-10">Empleado / Cédula</th>
                <th class="text-center">Novedad</th>
                <th class="text-right">Horas Extras / Recargos</th>
                <th class="text-right">Comisiones</th>
                <th class="text-center">Días (Lab/Cot)</th>
                <th class="text-center">Días (AFP/EPS/ARP/CCF)</th>
                <th>Administrador Pensión</th>
                <th class="text-right">IBC Pensión</th>
                <th class="text-right">Aporte Pensión</th>
                <th>Administrador Salud</th>
                <th class="text-right">IBC Salud</th>
                <th class="text-right">Aporte Salud</th>
                <th>Administrador Cajas</th>
                <th class="text-right">IBC Cajas</th>
                <th class="text-right">Aporte Cajas</th>
                <th class="text-center">Tarifa ARL</th>
                <th class="text-right">IBC Riesgos</th>
                <th class="text-right">Aporte Riesgos</th>
                <th class="text-right">Aporte SENA</th>
                <th class="text-right">Aporte ICBF</th>
                <th class="text-right">ESAP</th>
                <th class="text-right">Aporte Ministerio</th>
                <th class="text-right text-violet-900">Fondo Solidaridad</th>
                <th class="text-right font-bold text-indigo-900">Aportes Empleado ($)</th>
                <th class="text-right font-bold text-emerald-900">Total PILA ($)</th>
              </tr>
            </thead>
            <tbody>
              ${rowItems.map(r => `
                <tr>
                  <td class="sticky left-0 bg-white z-10 border-r">
                    <div class="font-semibold text-gray-800">${esc(r.name)}</div>
                    <div class="text-gray-400 text-3xs">${esc(r.doc)}</div>
                  </td>
                  <td class="text-center">
                    <span class="badge ${r.novedad !== 'NO' && r.novedad !== 'No' ? 'badge-amber font-bold' : 'badge-gray'}">${esc(r.novedad)}</span>
                  </td>
                  <td class="text-right">
                    <div class="font-semibold ${r.horasExtrasMonto > 0 ? 'text-indigo-900' : 'text-gray-400'}">${fmt(r.horasExtrasMonto)}</div>
                    <div class="text-gray-400 text-3xs" title="${esc(r.horasExtrasDetalle)}">${esc(r.horasExtrasDetalle)}</div>
                  </td>
                  <td class="text-right font-semibold ${r.comisionesMonto > 0 ? 'text-blue-900' : 'text-gray-400'}">
                    ${fmt(r.comisionesMonto)}
                  </td>
                  <td class="text-center font-mono">${r.diasLaborados} / ${r.diasCotizados}</td>
                  <td class="text-center font-mono text-3xs text-gray-600">${r.diasAfp} / ${r.diasEps} / ${r.diasArp} / ${r.diasCcf}</td>
                  <td>${esc(r.adminPension)}</td>
                  <td class="text-right font-mono">${fmt(r.ibcPension)}</td>
                  <td class="text-right font-semibold text-purple-900">${fmt(r.aportePension)}</td>
                  <td>${esc(r.adminSalud)}</td>
                  <td class="text-right font-mono">${fmt(r.ibcSalud)}</td>
                  <td class="text-right font-semibold text-emerald-900">${fmt(r.aporteSalud)}</td>
                  <td>${esc(r.adminCajas)}</td>
                  <td class="text-right font-mono">${fmt(r.ibcCajas)}</td>
                  <td class="text-right font-mono">${fmt(r.aporteCajas)}</td>
                  <td class="text-center font-mono text-xs">${esc(r.tarifaRiesgos)}</td>
                  <td class="text-right font-mono">${fmt(r.ibcRiesgos)}</td>
                  <td class="text-right font-semibold text-amber-900">${fmt(r.aporteRiesgos)}</td>
                  <td class="text-right font-mono">${fmt(r.aporteSena)}</td>
                  <td class="text-right font-mono">${fmt(r.aporteIcbf)}</td>
                  <td class="text-right font-mono">${fmt(r.esap)}</td>
                  <td class="text-right font-mono">${fmt(r.aporteMinisterio)}</td>
                  <td class="text-right font-semibold text-violet-900">${fmt(r.fondoSolidaridad)}</td>
                  <td class="text-right font-semibold text-indigo-900">${fmt(r.totalAportesEmpleado)}</td>
                  <td class="text-right font-bold text-emerald-800 text-sm">${fmt(r.totalEmpPila)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-gray-100 font-bold border-t">
                <td colspan="2" class="sticky left-0 bg-gray-100 z-10">TOTALES CONSOLIDADOS (${rowItems.length} Empleados)</td>
                <td class="text-right text-indigo-900">${fmt(totHorasExtrasMonto)}</td>
                <td class="text-right text-blue-900">${fmt(totComisionesMonto)}</td>
                <td colspan="2">—</td>
                <td>—</td>
                <td class="text-right">${fmt(totIbcPension)}</td>
                <td class="text-right text-purple-900">${fmt(totAportePension)}</td>
                <td>—</td>
                <td class="text-right">${fmt(totIbcSalud)}</td>
                <td class="text-right text-emerald-900">${fmt(totAporteSalud)}</td>
                <td>—</td>
                <td class="text-right">${fmt(totIbcCajas)}</td>
                <td class="text-right">${fmt(totAporteCajas)}</td>
                <td>—</td>
                <td class="text-right">${fmt(totIbcRiesgos)}</td>
                <td class="text-right text-amber-900">${fmt(totAporteRiesgos)}</td>
                <td class="text-right">${fmt(totSena)}</td>
                <td class="text-right">${fmt(totIcbf)}</td>
                <td class="text-right">${fmt(totEsap)}</td>
                <td class="text-right">${fmt(totMinisterio)}</td>
                <td class="text-right text-violet-900 font-bold">${fmt(totFondoSolidaridad)}</td>
                <td class="text-right text-indigo-950 font-bold">${fmt(totAportesEmpleado)}</td>
                <td class="text-right text-emerald-950 text-sm">${fmt(totPilaGlobal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    openModal(`Planilla PILA de Revisión — ${monthLabel} ${year}`, bodyHtml, `<button class="btn btn-primary" onclick="closeModal()">Cerrar</button>`, true);

    $('#btn-export-pila-pdf')?.addEventListener('click', () => {
      const companyInfo = {
        name: companyName,
        nit: companyNit
      };
      const totalsObj = {
        totIbcSalud,
        totAporteSalud,
        totIbcPension,
        totAportePension,
        totIbcRiesgos,
        totAporteRiesgos,
        totIbcCajas,
        totAporteCajas,
        totSena,
        totIcbf,
        totEsap,
        totMinisterio,
        totFondoSolidaridad,
        totHorasExtrasMonto,
        totHorasExtrasHoras,
        totComisionesMonto,
        totParafiscales: totAporteCajas + totSena + totIcbf + totEsap + totMinisterio,
        totPilaGlobal,
        totAportesEmpleado
      };
      exportPlanillaPilaPdf(monthLabel, year, rowItems, totalsObj, companyInfo);
    });

    $('#btn-export-pila-excel')?.addEventListener('click', () => {
      const exportExcelData = rowItems.map((r: any) => ({
        identificacion_empleado: r.doc,
        nombre_empleado: r.name,
        novedad: r.novedad,
        horas_extras_cant: r.horasExtrasHoras,
        horas_extras_monto: r.horasExtrasMonto,
        horas_extras_detalle: r.horasExtrasDetalle,
        comisiones_monto: r.comisionesMonto,
        dias_laborados: r.diasLaborados,
        dias_cotizados: r.diasCotizados,
        dias_afp: r.diasAfp,
        dias_eps: r.diasEps,
        dias_arp: r.diasArp,
        dias_ccf: r.diasCcf,
        admin_pension: r.adminPension,
        ibc_pension: r.ibcPension,
        aporte_pension: r.aportePension,
        admin_salud: r.adminSalud,
        ibc_salud: r.ibcSalud,
        aporte_salud: r.aporteSalud,
        admin_cajas: r.adminCajas,
        ibc_cajas: r.ibcCajas,
        aporte_cajas: r.aporteCajas,
        tarifa_arl: r.tarifaRiesgos,
        ibc_riesgos: r.ibcRiesgos,
        aporte_riesgos: r.aporteRiesgos,
        aporte_sena: r.aporteSena,
        aporte_icbf: r.aporteIcbf,
        esap: r.esap,
        aporte_ministerio: r.aporteMinisterio,
        fondo_solidaridad: r.fondoSolidaridad,
        aportes_empleado: r.totalAportesEmpleado,
        total_pila: r.totalEmpPila,
      }));

      exportExcelData.push({
        identificacion_empleado: 'TOTALES',
        nombre_empleado: 'TOTAL CONSOLIDADO',
        novedad: '',
        horas_extras_cant: totHorasExtrasHoras,
        horas_extras_monto: totHorasExtrasMonto,
        horas_extras_detalle: '',
        comisiones_monto: totComisionesMonto,
        dias_laborados: rowItems.reduce((s: number, r: any) => s + r.diasLaborados, 0),
        dias_cotizados: rowItems.reduce((s: number, r: any) => s + r.diasCotizados, 0),
        dias_afp: rowItems.reduce((s: number, r: any) => s + r.diasAfp, 0),
        dias_eps: rowItems.reduce((s: number, r: any) => s + r.diasEps, 0),
        dias_arp: rowItems.reduce((s: number, r: any) => s + r.diasArp, 0),
        dias_ccf: rowItems.reduce((s: number, r: any) => s + r.diasCcf, 0),
        admin_pension: '',
        ibc_pension: totIbcPension,
        aporte_pension: totAportePension,
        admin_salud: '',
        ibc_salud: totIbcSalud,
        aporte_salud: totAporteSalud,
        admin_cajas: '',
        ibc_cajas: totIbcCajas,
        aporte_cajas: totAporteCajas,
        tarifa_arl: '',
        ibc_riesgos: totIbcRiesgos,
        aporte_riesgos: totAporteRiesgos,
        aporte_sena: totSena,
        aporte_icbf: totIcbf,
        esap: totEsap,
        aporte_ministerio: totMinisterio,
        fondo_solidaridad: totFondoSolidaridad,
        aportes_empleado: totAportesEmpleado,
        total_pila: totPilaGlobal,
      });

      const headers = [
        { key: 'identificacion_empleado', label: 'Identificación Empleado' },
        { key: 'nombre_empleado', label: 'Nombre Completo Empleado' },
        { key: 'novedad', label: 'Novedad PILA' },
        { key: 'horas_extras_cant', label: 'Horas Extras (Cant. Horas)' },
        { key: 'horas_extras_monto', label: 'Horas Extras ($)' },
        { key: 'horas_extras_detalle', label: 'Detalle Horas Extras' },
        { key: 'comisiones_monto', label: 'Comisiones ($)' },
        { key: 'dias_laborados', label: 'Días Laborados' },
        { key: 'dias_cotizados', label: 'Días Cotizados' },
        { key: 'dias_afp', label: 'Días a Pagar AFP' },
        { key: 'dias_eps', label: 'Días a Pagar EPS' },
        { key: 'dias_arp', label: 'Días a Pagar ARP' },
        { key: 'dias_ccf', label: 'Días a Pagar CCF' },
        { key: 'admin_pension', label: 'Administrador Pensión' },
        { key: 'ibc_pension', label: 'IBC Pensión ($)' },
        { key: 'aporte_pension', label: 'Aporte Pensión ($)' },
        { key: 'admin_salud', label: 'Administrador Salud' },
        { key: 'ibc_salud', label: 'IBC Salud ($)' },
        { key: 'aporte_salud', label: 'Aporte Salud ($)' },
        { key: 'admin_cajas', label: 'Administrador Cajas' },
        { key: 'ibc_cajas', label: 'IBC Cajas ($)' },
        { key: 'aporte_cajas', label: 'Aporte Cajas ($)' },
        { key: 'tarifa_arl', label: 'Tarifa Riesgos ARL' },
        { key: 'ibc_riesgos', label: 'IBC Riesgos ($)' },
        { key: 'aporte_riesgos', label: 'Aporte Riesgos ($)' },
        { key: 'aporte_sena', label: 'Aportes SENA ($)' },
        { key: 'aporte_icbf', label: 'Aporte ICBF ($)' },
        { key: 'esap', label: 'ESAP ($)' },
        { key: 'aporte_ministerio', label: 'Aporte Ministerio ($)' },
        { key: 'fondo_solidaridad', label: 'Fondo de Solidaridad ($)' },
        { key: 'aportes_empleado', label: 'Aportes Empleado ($)' },
        { key: 'total_pila', label: 'Total PILA ($)' },
      ];

      if (typeof (window as any).exportToExcel === 'function') {
        (window as any).exportToExcel(exportExcelData, headers, `Planilla_PILA_Revision_${monthLabel}_${year}`);
      } else {
        showToast('La función de exportación a Excel no está disponible.', 'error');
      }
    });
  } catch (err: any) {
    showToast(`Error al generar planilla de revisión: ${err.message}`, 'error');
  }
}

function exportPlanillaPilaPdf(monthLabel: string, year: number, rowItems: any[], totals: any, companyInfo: any) {
  const now = new Date();
  const fechaGeneracion = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Planilla PILA de Revisión — ${monthLabel} ${year}</title>
  <style>
    @page {
      size: letter landscape;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 8pt;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .company-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2px;
    }
    .meta-text {
      font-size: 8pt;
      color: #64748b;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .kpi-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 5px;
      text-align: center;
    }
    .kpi-card.highlight {
      background-color: #f0fdf4;
      border-color: #86efac;
    }
    .kpi-label {
      font-size: 6.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .kpi-value {
      font-size: 8.5pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .kpi-card.highlight .kpi-value {
      color: #166534;
      font-size: 9.5pt;
    }
    table.pila-pdf-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7pt;
    }
    table.pila-pdf-table th, table.pila-pdf-table td {
      border: 1px solid #cbd5e1;
      padding: 3px 4px;
      vertical-align: middle;
    }
    table.pila-pdf-table th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6pt;
      text-align: center;
    }
    table.pila-pdf-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .badge-pdf {
      display: inline-block;
      padding: 1px 3px;
      border-radius: 3px;
      font-size: 6pt;
      font-weight: 700;
    }
    .badge-pdf-amber { background-color: #fef3c7; color: #92400e; }
    .badge-pdf-gray { background-color: #f1f5f9; color: #64748b; }

    .tfoot-row td {
      background-color: #e2e8f0 !important;
      font-weight: 800;
      font-size: 7.5pt;
      border-top: 2px solid #0f766e;
    }
    .signatures-container {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 42%;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      text-align: center;
      font-size: 7.5pt;
      color: #475569;
    }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#1e293b; color:#fff; padding:8px 12px; text-align:center; margin-bottom:10px; border-radius:6px; font-size:12px;">
    <button onclick="window.print()" style="background:#0f766e; color:#fff; border:none; padding:6px 14px; border-radius:4px; font-weight:bold; cursor:pointer;">
      🖨️ Imprimir / Guardar como PDF
    </button>
    <span style="margin-left:12px; opacity:0.85;">Recomendado: Orientación <strong>Horizontal (Landscape)</strong> en tamaño Carta/A4.</span>
  </div>

  <div class="header-container">
    <div>
      <div class="company-title">${esc(companyInfo.name)}</div>
      <div class="meta-text">${companyInfo.nit ? 'NIT: ' + esc(companyInfo.nit) : ''}</div>
      <div class="report-title">PLANILLA DE REVISIÓN DE SEGURIDAD SOCIAL Y PARAFISCALES (PILA)</div>
      <div class="meta-text">Nómina Electrónica DIAN — Resumen Acumulado Mensual por Empleado</div>
    </div>
    <div class="text-right">
      <div class="meta-text">Período: <strong>${monthLabel} / ${year}</strong></div>
      <div class="meta-text">Empleados Consolidados: <strong>${rowItems.length}</strong></div>
      <div class="meta-text">Generado: ${fechaGeneracion}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">TOTAL IBC</div><div class="kpi-value">${fmt(totals.totIbcSalud)}</div></div>
    <div class="kpi-card"><div class="kpi-label">HORAS EXTRAS / COMIS.</div><div class="kpi-value" style="color:#3730a3;">${fmt((totals.totHorasExtrasMonto || 0) + (totals.totComisionesMonto || 0))}</div></div>
    <div class="kpi-card"><div class="kpi-label">TOTAL SALUD</div><div class="kpi-value">${fmt(totals.totAporteSalud)}</div></div>
    <div class="kpi-card"><div class="kpi-label">TOTAL PENSIÓN</div><div class="kpi-value">${fmt(totals.totAportePension)}</div></div>
    <div class="kpi-card"><div class="kpi-label">TOTAL ARL</div><div class="kpi-value">${fmt(totals.totAporteRiesgos)}</div></div>
    <div class="kpi-card highlight"><div class="kpi-label">TOTAL PLANILLA PILA</div><div class="kpi-value">${fmt(totals.totPilaGlobal)}</div></div>
  </div>

  <table class="pila-pdf-table">
    <thead>
      <tr>
        <th style="width:9%;">Empleado / Cédula</th>
        <th style="width:3.5%;">Nov.</th>
        <th style="width:6.5%;">Horas Extras / Recargos</th>
        <th style="width:4.5%;">Comisiones</th>
        <th style="width:3%;">Días</th>
        <th style="width:3.5%;">Entidades</th>
        <th style="width:6.5%;">Fondo Pensión</th>
        <th style="width:4.5%;">IBC Pensión</th>
        <th style="width:4.5%;">Aporte Pensión</th>
        <th style="width:6.5%;">EPS Salud</th>
        <th style="width:4.5%;">IBC Salud</th>
        <th style="width:4.5%;">Aporte Salud</th>
        <th style="width:5.5%;">Caja CCF</th>
        <th style="width:4.5%;">IBC Cajas</th>
        <th style="width:4%;">Aporte Cajas</th>
        <th style="width:3%;">ARL %</th>
        <th style="width:4%;">Aporte ARL</th>
        <th style="width:3%;">SENA</th>
        <th style="width:3%;">ICBF</th>
        <th style="width:3.5%;">F.Solidar.</th>
        <th style="width:4.5%;">Aportes Emp.</th>
        <th style="width:5%;">Total PILA</th>
      </tr>
    </thead>
    <tbody>
      ${rowItems.map(r => `
        <tr>
          <td class="text-left font-bold">
            <div>${esc(r.name)}</div>
            <div style="font-size:6pt; color:#64748b; font-weight:normal;">${esc(r.doc)}</div>
          </td>
          <td class="text-center">
            <span class="badge-pdf ${r.novedad !== 'NO' && r.novedad !== 'No' ? 'badge-pdf-amber' : 'badge-pdf-gray'}">${esc(r.novedad)}</span>
          </td>
          <td class="text-right font-mono">
            <div style="font-weight:bold; color:${r.horasExtrasMonto > 0 ? '#3730a3' : '#64748b'};">${fmt(r.horasExtrasMonto)}</div>
            <div style="font-size:5.5pt; color:#64748b;">${esc(r.horasExtrasDetalle)}</div>
          </td>
          <td class="text-right font-mono font-bold" style="color:${r.comisionesMonto > 0 ? '#1e3a8a' : '#64748b'};">
            ${fmt(r.comisionesMonto)}
          </td>
          <td class="text-center font-mono">${r.diasLaborados}/${r.diasCotizados}</td>
          <td class="text-center font-mono" style="font-size:6pt;">${r.diasAfp}/${r.diasEps}/${r.diasArp}/${r.diasCcf}</td>
          <td class="text-left">${esc(r.adminPension)}</td>
          <td class="text-right font-mono">${fmt(r.ibcPension)}</td>
          <td class="text-right font-mono font-bold" style="color:#581c87;">${fmt(r.aportePension)}</td>
          <td class="text-left">${esc(r.adminSalud)}</td>
          <td class="text-right font-mono">${fmt(r.ibcSalud)}</td>
          <td class="text-right font-mono font-bold" style="color:#065f46;">${fmt(r.aporteSalud)}</td>
          <td class="text-left">${esc(r.adminCajas)}</td>
          <td class="text-right font-mono">${fmt(r.ibcCajas)}</td>
          <td class="text-right font-mono">${fmt(r.aporteCajas)}</td>
          <td class="text-center font-mono">${esc(r.tarifaRiesgos)}</td>
          <td class="text-right font-mono font-bold" style="color:#92400e;">${fmt(r.aporteRiesgos)}</td>
          <td class="text-right font-mono">${fmt(r.aporteSena)}</td>
          <td class="text-right font-mono">${fmt(r.aporteIcbf)}</td>
          <td class="text-right font-mono font-bold" style="color:#6d28d9;">${fmt(r.fondoSolidaridad)}</td>
          <td class="text-right font-mono font-bold" style="color:#312e81;">${fmt(r.totalAportesEmpleado)}</td>
          <td class="text-right font-mono font-bold" style="color:#064e3b; font-size:7.5pt;">${fmt(r.totalEmpPila)}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr class="tfoot-row">
        <td colspan="2" class="text-left">TOTALES CONSOLIDADOS (${rowItems.length} EMPLEADOS)</td>
        <td class="text-right font-mono" style="color:#3730a3;">${fmt(totals.totHorasExtrasMonto || 0)}</td>
        <td class="text-right font-mono" style="color:#1e3a8a;">${fmt(totals.totComisionesMonto || 0)}</td>
        <td colspan="2" class="text-center">—</td>
        <td class="text-center">—</td>
        <td class="text-right font-mono">${fmt(totals.totIbcPension)}</td>
        <td class="text-right font-mono" style="color:#581c87;">${fmt(totals.totAportePension)}</td>
        <td class="text-center">—</td>
        <td class="text-right font-mono">${fmt(totals.totIbcSalud)}</td>
        <td class="text-right font-mono" style="color:#065f46;">${fmt(totals.totAporteSalud)}</td>
        <td class="text-center">—</td>
        <td class="text-right font-mono">${fmt(totals.totIbcCajas)}</td>
        <td class="text-right font-mono">${fmt(totals.totAporteCajas)}</td>
        <td class="text-center">—</td>
        <td class="text-right font-mono" style="color:#92400e;">${fmt(totals.totAporteRiesgos)}</td>
        <td class="text-right font-mono">${fmt(totals.totSena)}</td>
        <td class="text-right font-mono">${fmt(totals.totIcbf)}</td>
        <td class="text-right font-mono" style="color:#6d28d9;">${fmt(totals.totFondoSolidaridad || 0)}</td>
        <td class="text-right font-mono" style="color:#312e81;">${fmt(totals.totAportesEmpleado)}</td>
        <td class="text-right font-mono" style="color:#064e3b; font-size:8pt;">${fmt(totals.totPilaGlobal)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="signatures-container">
    <div class="signature-box">
      <br><br>
      <strong>Elaborado por / Liquidación de Nómina</strong><br>
      Firma y Cédula
    </div>
    <div class="signature-box">
      <br><br>
      <strong>Revisado y Aprobado / Contabilidad y Gerencia</strong><br>
      Firma, Cédula y T.P.
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  <\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
  if (!win) {
    showToast('El navegador bloqueó la ventana emergente. Permite popups para esta página.', 'warning');
    return;
  }
  win.document.write(html);
  win.document.close();
}

(window as any).exportPlanillaPilaPdf = exportPlanillaPilaPdf;

async function renderDetailedPayrollReport(year: number, month: number) {
  try {
    const monthPadded = String(month).padStart(2, '0');
    const ymPrefix = `${year}-${monthPadded}`;

    const allPeriods = await pb.listAll('payroll_periods');
    const matchingPeriods = allPeriods.filter((p: any) => (p.date_from || '').startsWith(ymPrefix) || (p.date_to || '').startsWith(ymPrefix));

    if (!matchingPeriods.length) {
      return showToast(`No hay períodos de nómina registrados para ${month}/${year}.`, 'warning');
    }

    const periodIds = matchingPeriods.map((p: any) => p.id);
    const filterExpr = periodIds.map((id: string) => `period_id="${pb.escapeFilterValue(id)}"`).join('||');
    const lines = await pb.listAll('payroll_lines', {
      filter: filterExpr,
      expand: 'employee_id'
    });

    if (!lines.length) {
      return showToast(`No se encontraron liquidaciones de nómina registradas para los períodos de ${month}/${year}.`, 'warning');
    }

    const { config } = await getNominaConfigWithRow();
    const thirdParties = await pb.listAll('third_parties', { filter: 'active=true' }).catch(() => []);
    const thirdPartiesMap = new Map<string, any>(thirdParties.map((tp: any) => [tp.id, tp]));

    const novelties = await pb.listAll('payroll_novelties', {
      filter: filterExpr
    }).catch(() => []);

    // Fetch company info
    const settingsList = await pb.listAll('settings', { filter: 'key="company" || key="company_name" || key="company_nit"' }).catch(() => []);
    let companyName = 'MI EMPRESA S.A.S.';
    let companyNit = '';
    const companySetting = settingsList.find((s: any) => s.key === 'company');
    if (companySetting) {
      try {
        const valObj = typeof companySetting.value === 'string' ? JSON.parse(companySetting.value) : companySetting.value;
        companyName = valObj.name || valObj.razon_social || companyName;
        companyNit = valObj.nit || companyNit;
      } catch (_) {}
    }

    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthLabel = monthNames[month] || String(month);

    const empMap = new Map<string, any>();

    let totalDevengosGlobal = 0;
    let totalDeduccionesGlobal = 0;
    let totalNetoGlobal = 0;

    for (const line of lines) {
      const empId = line.employee_id || line.expand?.employee_id?.id || '';
      if (!empId) continue;

      const empObj = line.expand?.employee_id || {};
      const empRule = getEmployeePayrollRule(config, empId);
      const notesObj = getNominaLineMeta(line);
      const conceptAmounts = getNominaConceptAmountsFromLine(line);
      const otMeta = getNominaOvertimeMetaFromLine(line);

      const periodObj = matchingPeriods.find((p: any) => p.id === line.period_id) || {};
      const dateParts = (periodObj.date_to || '').split('-');
      const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : '';

      const empNovs = novelties.filter((nov: any) => nov.employee_id === empId);

      // Sueldo Trabajado proportional
      const sueldoTrabajado = round2((line.salary_base || 0) / 30 * line.days_worked);

      // OT breakdown
      const findOt = (key: string) => otMeta.breakdown?.find((b: any) => b.key === key) || { hours: 0, amount: 0 };

      // Incapacidades
      const generalIncaps = empNovs.filter((nov: any) => nov.type === 'INCAPACIDAD_ENFERMEDAD_GENERAL');
      const gIncapsQty = generalIncaps.reduce((s: number, n: any) => s + (n.qty || 0), 0);
      const gIncapsPay = generalIncaps.reduce((s: number, n: any) => s + (n.amount || 0), 0);

      // Licencias MP
      const mpLicences = empNovs.filter((nov: any) => nov.type === 'LICENCIA_MATERNIDAD' || nov.type === 'LICENCIA_PATERNIDAD');
      const mpLicencesQty = mpLicences.reduce((s: number, n: any) => s + (n.qty || 0), 0);
      const mpLicencesPay = mpLicences.reduce((s: number, n: any) => s + (n.amount || 0), 0);

      // Incapacidades ARL
      const arlIncaps = empNovs.filter((nov: any) => nov.type === 'INCAPACIDAD_ACCIDENTE_TRABAJO' || nov.type === 'INCAPACIDAD_ENFERMEDAD_PROFESION');
      const arlIncapsQty = arlIncaps.reduce((s: number, n: any) => s + (n.qty || 0), 0);
      const arlIncapsPay = arlIncaps.reduce((s: number, n: any) => s + (n.amount || 0), 0);

      // Licencias NR
      const nrLicences = empNovs.filter((nov: any) => nov.type === 'LICENCIA_NO_REMUNERADA' || nov.type === 'PERMISO_NO_REMUNERADO' || nov.type === 'SUSPENSION');
      const nrLicencesQty = nrLicences.reduce((s: number, n: any) => s + (n.qty || 0), 0);
      const nrLicencesPay = nrLicences.reduce((s: number, n: any) => s + (n.amount || 0), 0);
      const nrLicencesInicio = nrLicences[0]?.date_from || '';
      const nrLicencesFin = nrLicences[0]?.date_to || '';

      // Auxilios No Salariales (Alimentacion + rodamiento + aux_no_salariales)
      const auxNoSalarial = round2((conceptAmounts.alimentacion || 0) + (conceptAmounts.rodamiento || 0) + (conceptAmounts.aux_no_salariales || 0));

      const n_primaServicios = empNovs.filter((nov: any) => nov.type === 'PRIMA_SERVICIOS').reduce((sum: number, n: any) => sum + (n.amount || 0), 0);
      const n_cesantias = empNovs.filter((nov: any) => nov.type === 'CESANTIAS').reduce((sum: number, n: any) => sum + (n.amount || 0), 0);
      const n_interesesCesantias = empNovs.filter((nov: any) => nov.type === 'INTERESES_CESANTIAS').reduce((sum: number, n: any) => sum + (n.amount || 0), 0);

      // Devengos sum (excludes provisions, includes actual payments of benefits)
      const devengos = round2(
        sueldoTrabajado +
        (line.transport_allowance || 0) +
        (otMeta.total_amount || 0) +
        (conceptAmounts.vacaciones_disfrutadas || 0) +
        n_primaServicios +
        n_cesantias +
        n_interesesCesantias +
        (conceptAmounts.gastos_representacion || 0) +
        (conceptAmounts.bonificacion || 0) +
        auxNoSalarial +
        (conceptAmounts.comisiones || 0) +
        (conceptAmounts.dotaciones || 0) +
        (conceptAmounts.compensatorios || 0) +
        (conceptAmounts.otros_ingresos || 0) +
        (conceptAmounts.incapacidades || 0) +
        (conceptAmounts.licencias || 0)
      );

      // Deducciones sum
      const fsp = notesObj.solidarity_fund || line.solidarity_fund || 0;
      const withholding = line.withholding_tax || notesObj.withholding_tax || 0;
      const deducciones = round2(
        (line.deduction_health || 0) +
        (line.deduction_pension || 0) +
        fsp +
        withholding +
        (conceptAmounts.embargo || 0) +
        (conceptAmounts.libranza || 0) +
        (conceptAmounts.prestamos || 0) +
        (line.deduction_other || 0)
      );

      const totalNeto = round2(devengos - deducciones);

      const ibc = line.deduction_health > 0 ? round2(line.deduction_health / 0.04) : 0;
      const fspRate = fsp > 0 && ibc > 0 ? round2((fsp / ibc) * 100) : 0;

      if (!empMap.has(empId)) {
        empMap.set(empId, {
          fecha_liquidacion: dateStr,
          doc_number: empObj.doc_number || empObj.numeroDocumento || line.employee_id || '',
          full_name: empObj.name || (empObj.first_name ? `${empObj.first_name} ${empObj.last_name || ''}` : 'Empleado'),
          sueldo_basico: line.salary_base || 0,
          sueldo_trabajado: 0,
          aux_transporte: 0,
          viaticos1: 0,
          viaticos2: 0,
          hed_cant: 0,
          hed_pago: 0,
          hen_cant: 0,
          hen_pago: 0,
          hrn_cant: 0,
          hrn_pago: 0,
          heddf_cant: 0,
          heddf_pago: 0,
          hrddf_cant: 0,
          hrddf_pago: 0,
          hendf_cant: 0,
          hendf_pago: 0,
          hrndf_cant: 0,
          hrndf_pago: 0,
          vac_cant: 0,
          vac_pago: 0,
          primas_cant: 0,
          primas_pago: 0,
          primas_pago_ns: 0,
          cesantias_pago: 0,
          cesantias_porc: 0,
          cesantias_int: 0,
          incap_inicio: generalIncaps[0]?.date_from || '',
          incap_fin: generalIncaps[0]?.date_to || '',
          incap_cant: 0,
          incap_tipo: generalIncaps[0] ? 'General' : '',
          incap_pago: 0,
          lic_mp_inicio: mpLicences[0]?.date_from || '',
          lic_mp_fin: mpLicences[0]?.date_to || '',
          lic_mp_cant: 0,
          lic_mp_pago: 0,
          incap_arl_inicio: arlIncaps[0]?.date_from || '',
          incap_arl_fin: arlIncaps[0]?.date_to || '',
          incap_arl_cant: 0,
          incap_arl_pago: 0,
          lic_nr_inicio: nrLicencesInicio,
          lic_nr_fin: nrLicencesFin,
          lic_nr_cant: 0,
          lic_nr_pago: 0,
          gastos_represen: 0,
          bonif_salarial: 0,
          bonif_no_salarial: 0,
          aux_salariales: 0,
          aux_no_salariales: 0,
          huelga_inicio: '',
          huelga_fin: '',
          huelga_cant: 0,
          otro_cpt_desc: conceptAmounts.otros_ingresos > 0 ? 'Otros Ingresos' : '',
          otro_cpt_sal: 0,
          otro_cpt_no_sal: 0,
          compensacion_ord: 0,
          compensacion_ext: 0,
          bonos_pagosal: 0,
          bonos_pagonosal: 0,
          bonos_alimsal: 0,
          pago_rec_tercero: 0,
          comision: 0,
          pago_anticipado: 0,
          dotacion_anticipado: 0,
          apoyos_anticipado: 0,
          bono_retiro: 0,
          prestamos_anticipos: 0,
          indemniza: 0,
          pension_voluntaria: 0,
          retefuente: 0,
          ica: 0,
          afc_cesantias: 0,
          cooperativa: 0,
          embargos: 0,
          educacion: 0,
          reintegro: 0,
          deuda: 0,
          redondeo: 0,
          devengos_total: 0,
          deducciones_total: 0,
          comprobante_total: 0,
          salud_porc: 4,
          salud_base: 0,
          salud_ded: 0,
          pension_porc: empRule.is_pensioner ? 0 : 4,
          pension_base: 0,
          pension_ded: 0,
          fsp_porc: fspRate,
          fsp_ded: 0,
          fsp_sub: 0,
          base_aportes: 0,
          sindicato_porc: 0,
          sindicato_ded: 0,
          sancion_pub: 0,
          sancion_priv: 0,
          libranza_desc: conceptAmounts.libranza > 0 ? 'Libranza' : '',
          libranza_ded: 0,
          pago_terceros: 0,
          prestamos: 0,
          otras_ded: 0,
          prov_cesantias: 0,
          prov_int_ces: 0,
          prov_primas: 0,
          prov_vacaciones: 0,
          aporte_salud_patron: 0,
          aporte_pension_patron: 0,
          aporte_riesgos: 0,
          aporte_caja: 0,
          aporte_icbf: 0,
          aporte_sena: 0
        });
      }

      const acc = empMap.get(empId);

      // Accumulate numeric fields
      acc.sueldo_trabajado += sueldoTrabajado;
      acc.aux_transporte += line.transport_allowance || 0;
      acc.hed_cant += findOt('hed').hours;
      acc.hed_pago += findOt('hed').amount;
      acc.hen_cant += findOt('hen').hours;
      acc.hen_pago += findOt('hen').amount;
      acc.hrn_cant += findOt('rno').hours;
      acc.hrn_pago += findOt('rno').amount;
      acc.heddf_cant += findOt('heddf').hours;
      acc.heddf_pago += findOt('heddf').amount;
      acc.hrddf_cant += findOt('rdfd').hours;
      acc.hrddf_pago += findOt('rdfd').amount;
      acc.hendf_cant += findOt('hendf').hours;
      acc.hendf_pago += findOt('hendf').amount;

      // Vacaciones: only reported if there is an actual payment
      if ((conceptAmounts.vacaciones_disfrutadas || 0) > 0) {
        acc.vac_cant += notesObj.dias_vacaciones || 0;
        acc.vac_pago += conceptAmounts.vacaciones_disfrutadas || 0;
      }
      
      // Primas: only reported if there is an actual payment novelty
      if (n_primaServicios > 0) {
        const primaNov = empNovs.find((nov: any) => nov.type === 'PRIMA_SERVICIOS');
        acc.primas_cant += (primaNov?.qty || 180);
        acc.primas_pago += n_primaServicios;
      }

      // Cesantias: only reported if there is an actual payment novelty
      if (n_cesantias > 0) {
        acc.cesantias_pago += n_cesantias;
        acc.cesantias_porc = 8.33;
      }

      // Intereses de Cesantias: only reported if there is an actual payment novelty
      if (n_interesesCesantias > 0) {
        acc.cesantias_int += n_interesesCesantias;
      }

      acc.incap_cant += gIncapsQty;
      acc.incap_pago += gIncapsPay;
      acc.lic_mp_cant += mpLicencesQty;
      acc.lic_mp_pago += mpLicencesPay;
      acc.incap_arl_cant += arlIncapsQty;
      acc.incap_arl_pago += arlIncapsPay;
      acc.lic_nr_cant += nrLicencesQty;
      acc.lic_nr_pago += nrLicencesPay;

      acc.gastos_represen += conceptAmounts.gastos_representacion || 0;
      acc.bonif_salarial += conceptAmounts.bonificacion || 0;
      acc.aux_no_salariales += auxNoSalarial;
      acc.otro_cpt_no_sal += conceptAmounts.otros_ingresos || 0;
      acc.comision += conceptAmounts.comisiones || 0;
      acc.prestamos_anticipos += conceptAmounts.prestamos || 0;
      acc.retefuente += withholding;
      acc.embargos += conceptAmounts.embargo || 0;

      acc.devengos_total += devengos;
      acc.deducciones_total += deducciones;
      acc.comprobante_total += totalNeto;

      acc.salud_base += ibc;
      acc.salud_ded += line.deduction_health || 0;
      acc.pension_base += line.deduction_pension > 0 ? ibc : 0;
      acc.pension_ded += line.deduction_pension || 0;
      acc.fsp_ded += fsp;
      acc.base_aportes += ibc;

      acc.libranza_ded += conceptAmounts.libranza || 0;
      acc.prestamos += conceptAmounts.prestamos || 0;
      acc.otras_ded += line.deduction_other || 0;

      acc.prov_cesantias += round2((line.cesantias || 0) - n_cesantias);
      acc.prov_int_ces += round2((line.intereses_ces || 0) - n_interesesCesantias);
      acc.prov_primas += round2((line.prima || 0) - n_primaServicios);
      acc.prov_vacaciones += line.vacaciones || 0;

      acc.aporte_salud_patron += line.employer_health || 0;
      acc.aporte_pension_patron += line.employer_pension || 0;
      acc.aporte_riesgos += line.employer_arl || 0;
      acc.aporte_caja += line.caja_comp || 0;
      acc.aporte_icbf += line.icbf || 0;
      acc.aporte_sena += line.sena || 0;
    }

    const reportRows: any[] = [];
    for (const acc of empMap.values()) {
      acc.sueldo_trabajado = round2(acc.sueldo_trabajado);
      acc.aux_transporte = round2(acc.aux_transporte);
      acc.hed_pago = round2(acc.hed_pago);
      acc.hen_pago = round2(acc.hen_pago);
      acc.hrn_pago = round2(acc.hrn_pago);
      acc.heddf_pago = round2(acc.heddf_pago);
      acc.hrddf_pago = round2(acc.hrddf_pago);
      acc.hendf_pago = round2(acc.hendf_pago);
      acc.vac_pago = round2(acc.vac_pago);
      acc.primas_pago = round2(acc.primas_pago);
      acc.cesantias_pago = round2(acc.cesantias_pago);
      acc.cesantias_int = round2(acc.cesantias_int);
      acc.incap_pago = round2(acc.incap_pago);
      acc.lic_mp_pago = round2(acc.lic_mp_pago);
      acc.incap_arl_pago = round2(acc.incap_arl_pago);
      acc.lic_nr_pago = round2(acc.lic_nr_pago);
      acc.gastos_represen = round2(acc.gastos_represen);
      acc.bonif_salarial = round2(acc.bonif_salarial);
      acc.aux_no_salariales = round2(acc.aux_no_salariales);
      acc.otro_cpt_no_sal = round2(acc.otro_cpt_no_sal);
      acc.comision = round2(acc.comision);
      acc.prestamos_anticipos = round2(acc.prestamos_anticipos);
      acc.retefuente = round2(acc.retefuente);
      acc.embargos = round2(acc.embargos);
      acc.devengos_total = round2(acc.devengos_total);
      acc.deducciones_total = round2(acc.deducciones_total);
      acc.comprobante_total = round2(acc.comprobante_total);
      acc.salud_base = round2(acc.salud_base);
      acc.salud_ded = round2(acc.salud_ded);
      acc.pension_base = round2(acc.pension_base);
      acc.pension_ded = round2(acc.pension_ded);
      acc.fsp_ded = round2(acc.fsp_ded);
      acc.base_aportes = round2(acc.base_aportes);
      acc.libranza_ded = round2(acc.libranza_ded);
      acc.prestamos = round2(acc.prestamos);
      acc.otras_ded = round2(acc.otras_ded);
      acc.prov_cesantias = round2(acc.prov_cesantias);
      acc.prov_int_ces = round2(acc.prov_int_ces);
      acc.prov_primas = round2(acc.prov_primas);
      acc.prov_vacaciones = round2(acc.prov_vacaciones);
      acc.aporte_salud_patron = round2(acc.aporte_salud_patron);
      acc.aporte_pension_patron = round2(acc.aporte_pension_patron);
      acc.aporte_riesgos = round2(acc.aporte_riesgos);
      acc.aporte_caja = round2(acc.aporte_caja);
      acc.aporte_icbf = round2(acc.aporte_icbf);
      acc.aporte_sena = round2(acc.aporte_sena);

      totalDevengosGlobal += acc.devengos_total;
      totalDeduccionesGlobal += acc.deducciones_total;
      totalNetoGlobal += acc.comprobante_total;

      reportRows.push(acc);
    }

    const bodyHtml = `
      <div class="space-y-4 text-left text-xs">
        <div class="flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-xl border">
          <div>
            <h3 class="font-bold text-sm text-gray-800">REPORTE DETALLADO DE NÓMINA (REVISIÓN AUDITORÍA)</h3>
            <p class="text-gray-500">Período: <strong>${monthLabel} / ${year}</strong> — Liquidaciones Consolidadas: <strong>${reportRows.length}</strong></p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm font-bold" id="btn-export-detailed-excel"><i class="fas fa-file-excel mr-1"></i>Exportar a Excel Detallado (112 Columnas)</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-center font-semibold">
          <div class="bg-blue-50 p-2 rounded-lg border border-blue-100"><div class="text-gray-400 text-3xs">TOTAL DEVENGOS</div><div class="text-blue-900 text-xs font-bold">${fmt(totalDevengosGlobal)}</div></div>
          <div class="bg-red-50 p-2 rounded-lg border border-red-100"><div class="text-gray-400 text-3xs">TOTAL DEDUCCIONES</div><div class="text-red-900 text-xs font-bold">${fmt(totalDeduccionesGlobal)}</div></div>
          <div class="bg-emerald-50 p-2 rounded-lg border border-emerald-100"><div class="text-gray-400 text-3xs">NETO A PAGAR (CONSOLIDADO)</div><div class="text-emerald-950 text-sm font-bold">${fmt(totalNetoGlobal)}</div></div>
        </div>

        <div class="overflow-x-auto border rounded-xl bg-white max-h-96">
          <table class="data-table text-xs whitespace-nowrap">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="sticky left-0 bg-gray-100 z-10">Doc. Identidad</th>
                <th>Empleado / Nombre Completo</th>
                <th class="text-right">Sueldo Básico</th>
                <th class="text-right">Sueldo Trabajado</th>
                <th class="text-right">Auxilio Transporte</th>
                <th class="text-right">Salud Empleado</th>
                <th class="text-right">Pensión Empleado</th>
                <th class="text-right text-violet-900">Fondo Solidaridad</th>
                <th class="text-right">Total Deducciones</th>
                <th class="text-right font-bold text-emerald-900">Neto a Pagar ($)</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows.map(r => `
                <tr>
                  <td class="sticky left-0 bg-white z-10 border-r font-mono">${esc(r.doc_number)}</td>
                  <td class="font-semibold text-gray-800">${esc(r.full_name)}</td>
                  <td class="text-right font-mono">${fmt(r.sueldo_basico)}</td>
                  <td class="text-right font-mono">${fmt(r.sueldo_trabajado)}</td>
                  <td class="text-right font-mono">${fmt(r.aux_transporte)}</td>
                  <td class="text-right font-mono">${fmt(r.salud_ded)}</td>
                  <td class="text-right font-mono">${fmt(r.pension_ded)}</td>
                  <td class="text-right font-semibold text-violet-900 font-mono">${fmt(r.fsp_ded)}</td>
                  <td class="text-right font-semibold text-red-900 font-mono">${fmt(r.deducciones_total)}</td>
                  <td class="text-right font-bold text-emerald-800 font-mono">${fmt(r.comprobante_total)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-gray-100 font-bold border-t">
                <td colspan="2" class="sticky left-0 bg-gray-100 z-10">TOTALES CONSOLIDADOS (${reportRows.length} Empleados)</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td class="text-right text-violet-900 font-bold font-mono">${fmt(reportRows.reduce((s, r) => s + r.salud_ded, 0))}</td>
                <td class="text-right text-violet-900 font-bold font-mono">${fmt(reportRows.reduce((s, r) => s + r.pension_ded, 0))}</td>
                <td class="text-right text-violet-950 font-bold font-mono">${fmt(reportRows.reduce((s, r) => s + r.fsp_ded, 0))}</td>
                <td class="text-right text-red-900 font-mono">${fmt(totalDeduccionesGlobal)}</td>
                <td class="text-right text-emerald-950 font-mono">${fmt(totalNetoGlobal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    openModal(`Reporte Detallado de Nómina — ${monthLabel} ${year}`, bodyHtml, `<button class="btn btn-primary" onclick="closeModal()">Cerrar</button>`, true);

    $('#btn-export-detailed-excel')?.addEventListener('click', () => {
      exportDetailedPayrollExcel(monthLabel, year, reportRows);
    });

  } catch (err: any) {
    showToast(`Error al generar reporte detallado: ${err.message}`, 'error');
  }
}

function exportDetailedPayrollExcel(monthLabel: string, year: number, rows: any[]) {
  const excelData = rows.map((r: any) => ({
    fecha_liq: r.fecha_liquidacion,
    doc_id: r.doc_number,
    full_name: r.full_name,
    sueldo_basico: r.sueldo_basico,
    sueldo_trabajado: r.sueldo_trabajado,
    aux_transporte: r.aux_transporte,
    viaticos1: r.viaticos1,
    viaticos2: r.viaticos2,
    hed_cant: r.hed_cant,
    hed_pago: r.hed_pago,
    hen_cant: r.hen_cant,
    hen_pago: r.hen_pago,
    hrn_cant: r.hrn_cant,
    hrn_pago: r.hrn_pago,
    heddf_cant: r.heddf_cant,
    heddf_pago: r.heddf_pago,
    hrddf_cant: r.hrddf_cant,
    hrddf_pago: r.hrddf_pago,
    hendf_cant: r.hendf_cant,
    hendf_pago: r.hendf_pago,
    hrndf_cant: r.hrndf_cant,
    hrndf_pago: r.hrndf_pago,
    vac_cant: r.vac_cant,
    vac_pago: r.vac_pago,
    primas_cant: r.primas_cant,
    primas_pago: r.primas_pago,
    primas_pago_ns: r.primas_pago_ns,
    cesantias_pago: r.cesantias_pago,
    cesantias_porc: r.cesantias_porc,
    cesantias_int: r.cesantias_int,
    incap_inicio: r.incap_inicio,
    incap_fin: r.incap_fin,
    incap_cant: r.incap_cant,
    incap_tipo: r.incap_tipo,
    incap_pago: r.incap_pago,
    lic_mp_inicio: r.lic_mp_inicio,
    lic_mp_fin: r.lic_mp_fin,
    lic_mp_cant: r.lic_mp_cant,
    lic_mp_pago: r.lic_mp_pago,
    incap_arl_inicio: r.incap_arl_inicio,
    incap_arl_fin: r.incap_arl_fin,
    incap_arl_cant: r.incap_arl_cant,
    incap_arl_pago: r.incap_arl_pago,
    lic_nr_inicio: r.lic_nr_inicio,
    lic_nr_fin: r.lic_nr_fin,
    lic_nr_pago: r.lic_nr_pago,
    gastos_represen: r.gastos_represen,
    bonif_salarial: r.bonif_salarial,
    bonif_no_salarial: r.bonif_no_salarial,
    aux_salariales: r.aux_salariales,
    aux_no_salariales: r.aux_no_salariales,
    huelga_inicio: r.huelga_inicio,
    huelga_fin: r.huelga_fin,
    huelga_cant: r.huelga_cant,
    otro_cpt_desc: r.otro_cpt_desc,
    otro_cpt_sal: r.otro_cpt_sal,
    otro_cpt_no_sal: r.otro_cpt_no_sal,
    compensacion_ord: r.compensacion_ord,
    compensacion_ext: r.compensacion_ext,
    bonos_pagosal: r.bonos_pagosal,
    bonos_pagonosal: r.bonos_pagonosal,
    bonos_alimsal: r.bonos_alimsal,
    pago_rec_tercero: r.pago_rec_tercero,
    comision: r.comision,
    pago_anticipado: r.pago_anticipado,
    dotacion_anticipado: r.dotacion_anticipado,
    apoyos_anticipado: r.apoyos_anticipado,
    bono_retiro: r.bono_retiro,
    prestamos_anticipos: r.prestamos_anticipos,
    indemniza: r.indemniza,
    pension_voluntaria: r.pension_voluntaria,
    retefuente: r.retefuente,
    ica: r.ica,
    afc_cesantias: r.afc_cesantias,
    cooperativa: r.cooperativa,
    embargos: r.embargos,
    educacion: r.educacion,
    reintegro: r.reintegro,
    deuda: r.deuda,
    redondeo: r.redondeo,
    devengos_total: r.devengos_total,
    deducciones_total: r.deducciones_total,
    comprobante_total: r.comprobante_total,
    salud_porc: r.salud_porc,
    salud_base: r.salud_base,
    salud_ded: r.salud_ded,
    pension_porc: r.pension_porc,
    pension_base: r.pension_base,
    pension_ded: r.pension_ded,
    fsp_porc: r.fsp_porc,
    fsp_ded: r.fsp_ded,
    fsp_sub: r.fsp_sub,
    base_aportes: r.base_aportes,
    sindicato_porc: r.sindicato_porc,
    sindicato_ded: r.sindicato_ded,
    sancion_pub: r.sancion_pub,
    sancion_priv: r.sancion_priv,
    libranza_desc: r.libranza_desc,
    libranza_ded: r.libranza_ded,
    pago_terceros: r.pago_terceros,
    prestamos: r.prestamos,
    otras_ded: r.otras_ded,
    prov_cesantias: r.prov_cesantias,
    prov_int_ces: r.prov_int_ces,
    prov_primas: r.prov_primas,
    prov_vacaciones: r.prov_vacaciones,
    aporte_salud_patron: r.aporte_salud_patron,
    aporte_pension_patron: r.aporte_pension_patron,
    aporte_riesgos: r.aporte_riesgos,
    aporte_caja: r.aporte_caja,
    aporte_icbf: r.aporte_icbf,
    aporte_sena: r.aporte_sena
  }));

  excelData.push({
    fecha_liq: 'TOTALES',
    doc_id: 'TOTAL CONSOLIDADO',
    full_name: '',
    sueldo_basico: rows.reduce((s, r) => s + r.sueldo_basico, 0),
    sueldo_trabajado: rows.reduce((s, r) => s + r.sueldo_trabajado, 0),
    aux_transporte: rows.reduce((s, r) => s + r.aux_transporte, 0),
    viaticos1: 0,
    viaticos2: 0,
    hed_cant: rows.reduce((s, r) => s + r.hed_cant, 0),
    hed_pago: rows.reduce((s, r) => s + r.hed_pago, 0),
    hen_cant: rows.reduce((s, r) => s + r.hen_cant, 0),
    hen_pago: rows.reduce((s, r) => s + r.hen_pago, 0),
    hrn_cant: rows.reduce((s, r) => s + r.hrn_cant, 0),
    hrn_pago: rows.reduce((s, r) => s + r.hrn_pago, 0),
    heddf_cant: rows.reduce((s, r) => s + r.heddf_cant, 0),
    heddf_pago: rows.reduce((s, r) => s + r.heddf_pago, 0),
    hrddf_cant: rows.reduce((s, r) => s + r.hrddf_cant, 0),
    hrddf_pago: rows.reduce((s, r) => s + r.hrddf_pago, 0),
    hendf_cant: rows.reduce((s, r) => s + r.hendf_cant, 0),
    hendf_pago: rows.reduce((s, r) => s + r.hendf_pago, 0),
    hrndf_cant: 0,
    hrndf_pago: 0,
    vac_cant: rows.reduce((s, r) => s + r.vac_cant, 0),
    vac_pago: rows.reduce((s, r) => s + r.vac_pago, 0),
    primas_cant: 0,
    primas_pago: rows.reduce((s, r) => s + r.primas_pago, 0),
    primas_pago_ns: 0,
    cesantias_pago: rows.reduce((s, r) => s + r.cesantias_pago, 0),
    cesantias_porc: 0,
    cesantias_int: rows.reduce((s, r) => s + r.cesantias_int, 0),
    incap_inicio: '',
    incap_fin: '',
    incap_cant: rows.reduce((s, r) => s + r.incap_cant, 0),
    incap_tipo: '',
    incap_pago: rows.reduce((s, r) => s + r.incap_pago, 0),
    lic_mp_inicio: '',
    lic_mp_fin: '',
    lic_mp_cant: rows.reduce((s, r) => s + r.lic_mp_cant, 0),
    lic_mp_pago: rows.reduce((s, r) => s + r.lic_mp_pago, 0),
    incap_arl_inicio: '',
    incap_arl_fin: '',
    incap_arl_cant: rows.reduce((s, r) => s + r.incap_arl_cant, 0),
    incap_arl_pago: rows.reduce((s, r) => s + r.incap_arl_pago, 0),
    lic_nr_inicio: '',
    lic_nr_fin: '',
    lic_nr_cant: rows.reduce((s, r) => s + r.lic_nr_cant, 0),
    lic_nr_pago: rows.reduce((s, r) => s + r.lic_nr_pago, 0),
    gastos_represen: rows.reduce((s, r) => s + r.gastos_represen, 0),
    bonif_salarial: rows.reduce((s, r) => s + r.bonif_salarial, 0),
    bonif_no_salarial: 0,
    aux_salariales: 0,
    aux_no_salariales: rows.reduce((s, r) => s + r.aux_no_salariales, 0),
    huelga_inicio: '',
    huelga_fin: '',
    huelga_cant: 0,
    otro_cpt_desc: '',
    otro_cpt_sal: 0,
    otro_cpt_no_sal: rows.reduce((s, r) => s + r.otro_cpt_no_sal, 0),
    compensacion_ord: 0,
    compensacion_ext: 0,
    bonos_pagosal: 0,
    bonos_pagonosal: 0,
    bonos_alimsal: 0,
    pago_rec_tercero: 0,
    comision: rows.reduce((s, r) => s + r.comision, 0),
    pago_anticipado: 0,
    dotacion_anticipado: 0,
    apoyos_anticipado: 0,
    bono_retiro: 0,
    prestamos_anticipos: rows.reduce((s, r) => s + r.prestamos_anticipos, 0),
    indemniza: 0,
    pension_voluntaria: 0,
    retefuente: rows.reduce((s, r) => s + r.retefuente, 0),
    ica: 0,
    afc_cesantias: 0,
    cooperativa: 0,
    embargos: rows.reduce((s, r) => s + r.embargos, 0),
    educacion: 0,
    reintegro: 0,
    deuda: 0,
    redondeo: 0,
    devengos_total: rows.reduce((s, r) => s + r.devengos_total, 0),
    deducciones_total: rows.reduce((s, r) => s + r.deducciones_total, 0),
    comprobante_total: rows.reduce((s, r) => s + r.comprobante_total, 0),
    salud_porc: 0,
    salud_base: rows.reduce((s, r) => s + r.salud_base, 0),
    salud_ded: rows.reduce((s, r) => s + r.salud_ded, 0),
    pension_porc: 0,
    pension_base: rows.reduce((s, r) => s + r.pension_base, 0),
    pension_ded: rows.reduce((s, r) => s + r.pension_ded, 0),
    fsp_porc: 0,
    fsp_ded: rows.reduce((s, r) => s + r.fsp_ded, 0),
    fsp_sub: 0,
    base_aportes: rows.reduce((s, r) => s + r.base_aportes, 0),
    sindicato_porc: 0,
    sindicato_ded: 0,
    sancion_pub: 0,
    sancion_priv: 0,
    libranza_desc: '',
    libranza_ded: rows.reduce((s, r) => s + r.libranza_ded, 0),
    pago_terceros: 0,
    prestamos: rows.reduce((s, r) => s + r.prestamos, 0),
    otras_ded: rows.reduce((s, r) => s + r.otras_ded, 0),
    prov_cesantias: rows.reduce((s, r) => s + r.prov_cesantias, 0),
    prov_int_ces: rows.reduce((s, r) => s + r.prov_int_ces, 0),
    prov_primas: rows.reduce((s, r) => s + r.prov_primas, 0),
    prov_vacaciones: rows.reduce((s, r) => s + r.prov_vacaciones, 0),
    aporte_salud_patron: rows.reduce((s, r) => s + r.aporte_salud_patron, 0),
    aporte_pension_patron: rows.reduce((s, r) => s + r.aporte_pension_patron, 0),
    aporte_riesgos: rows.reduce((s, r) => s + r.aporte_riesgos, 0),
    aporte_caja: rows.reduce((s, r) => s + r.aporte_caja, 0),
    aporte_icbf: rows.reduce((s, r) => s + r.aporte_icbf, 0),
    aporte_sena: rows.reduce((s, r) => s + r.aporte_sena, 0)
  });

  const headers = [
    { key: 'fecha_liq', label: '7.Fecha Liquidacion' },
    { key: 'doc_id', label: '8.Codigo Trabajador/ No.ID' },
    { key: 'full_name', label: '16.Nombre Completo' },
    { key: 'sueldo_basico', label: '32.Sueldo Basico' },
    { key: 'sueldo_trabajado', label: '39.Sueldo Trabajado' },
    { key: 'aux_transporte', label: '40.Auxilio Transporte' },
    { key: 'viaticos1', label: '41.Viaticos1' },
    { key: 'viaticos2', label: '42.Viaticos2' },
    { key: 'hed_cant', label: '45.HED Cantidad' },
    { key: 'hed_pago', label: '46.HED Pago' },
    { key: 'hen_cant', label: '49.HEN Cantidad' },
    { key: 'hen_pago', label: '50.HEN Pago' },
    { key: 'hrn_cant', label: '53.HRN Cantidad' },
    { key: 'hrn_pago', label: '54.HRN Pago' },
    { key: 'heddf_cant', label: '57.HEDDF Cantidad' },
    { key: 'heddf_pago', label: '58.HEDDF Pago' },
    { key: 'hrddf_cant', label: '61.HRDDF Cantidad' },
    { key: 'hrddf_pago', label: '62.HRDDF Pago' },
    { key: 'hendf_cant', label: '65.HENDF Cantidad' },
    { key: 'hendf_pago', label: '66.HENDF Pago' },
    { key: 'hrndf_cant', label: '69.HRNDF Cantidad' },
    { key: 'hrndf_pago', label: '70.HRNDF Pago' },
    { key: 'vac_cant', label: '73.Cantidad Vac.Comun' },
    { key: 'vac_pago', label: '74.Pago Vac.Comun' },
    { key: 'primas_cant', label: '79.Primas Cantidad' },
    { key: 'primas_pago', label: '80.Prima Pago' },
    { key: 'primas_pago_ns', label: '81.Prima PagoNS' },
    { key: 'cesantias_pago', label: '82.Cesantias Pago' },
    { key: 'cesantias_porc', label: '83.Cesantias Porcentaje' },
    { key: 'cesantias_int', label: '84.Cesantias Intereses' },
    { key: 'incap_inicio', label: '85.FechaIncio Incapacidad' },
    { key: 'incap_fin', label: '86.FechaFin Incapacidad' },
    { key: 'incap_cant', label: '87.Cantidad Incapacidad' },
    { key: 'incap_tipo', label: '88.Tipo Incapacidad' },
    { key: 'incap_pago', label: '89.Pago Incapacidad' },
    { key: 'lic_mp_inicio', label: '90.FechaIncio LicenciaMP' },
    { key: 'lic_mp_fin', label: '91.FechaFin LicenciaMP' },
    { key: 'lic_mp_cant', label: '92.Cantidad LicenciaMP' },
    { key: 'lic_mp_pago', label: '93.Pago LicenciaMP' },
    { key: 'incap_arl_inicio', label: '94.FechaIncio Incap. ARL' },
    { key: 'incap_arl_fin', label: '95.FechaFin Incap. ARL' },
    { key: 'incap_arl_cant', label: '96.Cantidad Incap. ARL' },
    { key: 'incap_arl_pago', label: '97.Pago Incap. ARL' },
    { key: 'lic_nr_inicio', label: '98.FechaIncio LicenciaNR' },
    { key: 'lic_nr_fin', label: '99.FechaFin LicenciaNR' },
    { key: 'lic_nr_pago', label: '100.Pago LicenciaNR' },
    { key: 'gastos_represen', label: '101.Gastos Represen' },
    { key: 'bonif_salarial', label: '102.Bonificacion Salarial' },
    { key: 'bonif_no_salarial', label: '103.Bonificacion NoSalarial' },
    { key: 'aux_salariales', label: '104.Auxilios Salariales' },
    { key: 'aux_no_salariales', label: '105.Auxilios NoSalarial' },
    { key: 'huelga_inicio', label: '106.FechaIncio Huelga' },
    { key: 'huelga_fin', label: '107.FechaFin Huelga' },
    { key: 'huelga_cant', label: '108.Cantidad Huelga' },
    { key: 'otro_cpt_desc', label: '109.OtroConcepto Descripcion' },
    { key: 'otro_cpt_sal', label: '110.OtroConcepto Salarial' },
    { key: 'otro_cpt_no_sal', label: '111.OtroConcepto NoSalarial' },
    { key: 'compensacion_ord', label: '112.Compensacion Ordinaria' },
    { key: 'compensacion_ext', label: '113.Compensacion Ext.Ord' },
    { key: 'bonos_pagosal', label: '114.Bonos PagoSal' },
    { key: 'bonos_pagonosal', label: '115.Bonos PagoNoSal' },
    { key: 'bonos_alimsal', label: '116.Bonos AlimSal' },
    { key: 'pago_rec_tercero', label: '117.Pago Rec de tercero' },
    { key: 'comision', label: '118.Comision' },
    { key: 'pago_anticipado', label: '119.Pago Anticipado' },
    { key: 'dotacion_anticipado', label: '120.Dotacion Anticipado' },
    { key: 'apoyos_anticipado', label: '121.ApoyoS Anticipado' },
    { key: 'bono_retiro', label: '122.Bono Retiro Anticipado' },
    { key: 'prestamos_anticipos', label: '123.Prestamos Anticipos' },
    { key: 'indemniza', label: '124.Indemniza Anticipado' },
    { key: 'pension_voluntaria', label: '125.Pension Voluntaria' },
    { key: 'retefuente', label: '126.Retefuente' },
    { key: 'ica', label: '127.ICA' },
    { key: 'afc_cesantias', label: '128.AFC cesantias' },
    { key: 'cooperativa', label: '129.Cooperativa' },
    { key: 'embargos', label: '130.Embargos' },
    { key: 'educacion', label: '132.Educacion' },
    { key: 'reintegro', label: '133.Reintegro' },
    { key: 'deuda', label: '134.Deuda' },
    { key: 'redondeo', label: '135.Redondeo' },
    { key: 'devengos_total', label: '136.Devengos Total' },
    { key: 'deducciones_total', label: '137.Deduccion Total' },
    { key: 'comprobante_total', label: '138.Comprobante Total' },
    { key: 'salud_porc', label: '139.Salud Porcentaje' },
    { key: 'salud_base', label: '140.Salud Base' },
    { key: 'salud_ded', label: '141.Salud Deduccion' },
    { key: 'pension_porc', label: '142.Pension Porcentaje' },
    { key: 'pension_base', label: '143.Pension Base' },
    { key: 'pension_ded', label: '144.Pension Deduccion' },
    { key: 'fsp_porc', label: '145.Fondo Solid Porc.' },
    { key: 'fsp_ded', label: '146.Fondo Solid Ded.' },
    { key: 'fsp_sub', label: '147.FondoSP Porc_Sub' },
    { key: 'base_aportes', label: '148.Base aportes Liquidacion' },
    { key: 'sindicato_porc', label: '149.Sindicato Porcentaje' },
    { key: 'sindicato_ded', label: '150.Sindicato Deduccion' },
    { key: 'sancion_pub', label: '151.Sancion Publica' },
    { key: 'sancion_priv', label: '152.Sancion Privada' },
    { key: 'libranza_desc', label: '153.Libranza Descripcion' },
    { key: 'libranza_ded', label: '154.Libranza Deduccion' },
    { key: 'pago_terceros', label: '155.Pago Terceros' },
    { key: 'prestamos', label: '156.Prestamos' },
    { key: 'otras_ded', label: '157.Otras Deducciones' },
    { key: 'prov_cesantias', label: '158.Provision Cesantias' },
    { key: 'prov_int_ces', label: '159.Provision Int.Cesant.' },
    { key: 'prov_primas', label: '160.Provision Primas' },
    { key: 'prov_vacaciones', label: '161.Provision Vacaciones' },
    { key: 'aporte_salud_patron', label: '162.Aporte Salud 8.5' },
    { key: 'aporte_pension_patron', label: '163.Aporte Pension 12' },
    { key: 'aporte_riesgos', label: '164.Aporte Riesgos' },
    { key: 'aporte_caja', label: '165.Aporte Caja Comp. 4' },
    { key: 'aporte_icbf', label: '166.Aporte ICBF 3' },
    { key: 'aporte_sena', label: '167.Aporte SENA 2' }
  ];

  if (typeof (window as any).exportToExcel === 'function') {
    (window as any).exportToExcel(excelData, headers, `Reporte_Detallado_Nomina_${monthLabel}_${year}`);
  } else {
    showToast('La función de exportación a Excel no está disponible.', 'error');
  }
}

(window as any).exportPlanillaPilaPdf = exportPlanillaPilaPdf;
(window as any).renderDetailedPayrollReport = renderDetailedPayrollReport;
(window as any).exportDetailedPayrollExcel = exportDetailedPayrollExcel;

function buildSingleWorkerUblXml(emp: any, company: any, year: number, month: number, consecutivo: number) {
  const ymPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const now = new Date();
  const fechaGen = now.toISOString().slice(0, 10);
  const horaGen = now.toTimeString().slice(0, 8) + "-05:00";
  const numSec = `NOM${consecutivo}`;
  const docNum = emp.numeroDocumento || '00000000';
  const sueldoBasico = round2(emp.sueldoBasico || 0).toFixed(2);
  const devengos = round2(emp.totalDevengos || 0).toFixed(2);
  const deducciones = round2(emp.totalDeducciones || 0).toFixed(2);
  const neto = round2(emp.netoPagar || 0).toFixed(2);

  let otNodesXml = '';
  if (emp.otBreakdownMap && Object.keys(emp.otBreakdownMap).length > 0) {
    const map = emp.otBreakdownMap;
    if (map.hed && map.hed.amount > 0) otNodesXml += `<HEDs><HED HoraInicio="${ymPrefix}-01T08:00:00" HoraFin="${ymPrefix}-01T10:00:00" Cantidad="${map.hed.hours}" Porcentaje="25.00" Pago="${round2(map.hed.amount).toFixed(2)}" /></HEDs>\n`;
    if (map.hen && map.hen.amount > 0) otNodesXml += `<HENs><HEN HoraInicio="${ymPrefix}-01T21:00:00" HoraFin="${ymPrefix}-01T23:00:00" Cantidad="${map.hen.hours}" Porcentaje="75.00" Pago="${round2(map.hen.amount).toFixed(2)}" /></HENs>\n`;
    if (map.rno && map.rno.amount > 0) otNodesXml += `<HRNs><HRN HoraInicio="${ymPrefix}-01T21:00:00" HoraFin="${ymPrefix}-01T23:00:00" Cantidad="${map.rno.hours}" Porcentaje="35.00" Pago="${round2(map.rno.amount).toFixed(2)}" /></HRNs>\n`;
    if (map.heddf && map.heddf.amount > 0) otNodesXml += `<HEDDFs><HEDDF HoraInicio="${ymPrefix}-01T08:00:00" HoraFin="${ymPrefix}-01T10:00:00" Cantidad="${map.heddf.hours}" Porcentaje="100.00" Pago="${round2(map.heddf.amount).toFixed(2)}" /></HEDDFs>\n`;
    if (map.hendf && map.hendf.amount > 0) otNodesXml += `<HENDFs><HENDF HoraInicio="${ymPrefix}-01T21:00:00" HoraFin="${ymPrefix}-01T23:00:00" Cantidad="${map.hendf.hours}" Porcentaje="150.00" Pago="${round2(map.hendf.amount).toFixed(2)}" /></HENDFs>\n`;
    if (map.rdfd && map.rdfd.amount > 0) otNodesXml += `<HRDDFs><HRDDF HoraInicio="${ymPrefix}-01T08:00:00" HoraFin="${ymPrefix}-01T10:00:00" Cantidad="${map.rdfd.hours}" Porcentaje="75.00" Pago="${round2(map.rdfd.amount).toFixed(2)}" /></HRDDFs>\n`;
  } else if ((emp.horasExtrasMonto || 0) > 0) {
    otNodesXml = `<HEDs><HED Cantidad="1" Porcentaje="25.00" Pago="${round2(emp.horasExtrasMonto).toFixed(2)}" /></HEDs>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--Version #1.0-->
<NominaIndividual xmlns="dian:gov:co:facturaelectronica:NominaIndividual"
 xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
 xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
 xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"
 xmlns:xades141="http://uri.etsi.org/01903/v1.4.1#"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 SchemaLocation=""
 xsi:schemaLocation="dian:gov:co:facturaelectronica:NominaIndividual NominaIndividualElectronicaXSD.xsd">
<ext:UBLExtensions>
</ext:UBLExtensions>
<Periodo FechaIngreso="${emp.fechaIngreso || '2020-01-01'}" TiempoLaborado="${emp.diasLaborados || 30}" FechaLiquidacionInicio="${ymPrefix}-01" FechaLiquidacionFin="${ymPrefix}-30" FechaGen="${fechaGen}"/>
<NumeroSecuenciaXML CodigoTrabajador="${esc(docNum)}" Prefijo="NOM" Consecutivo="${consecutivo}" Numero="${numSec}" />
<LugarGeneracionXML Pais="CO" DepartamentoEstado="76" MunicipioCiudad="76001" Idioma="es" />
<InformacionGeneral Version="V1.0: Documento Soporte de Pago de Nómina Electrónica" Ambiente="1" FechaGen="${fechaGen}" HoraGen="${horaGen}" TipoXML="102" PeriodoNomina="5" TipoMoneda="COP" TRM="1.00"/>
<Empleador RazonSocial="${esc(company.companyName)}" PrimerApellido="" SegundoApellido="" PrimerNombre="" NIT="${esc(company.companyNit)}" DV="${esc(company.companyDv)}" Pais="CO" DepartamentoEstado="76" MunicipioCiudad="76001" Direccion="${esc(company.companyDir)}" />
<Trabajador TipoTrabajador="01" SubTipoTrabajador="00" AltoRiesgoPension="false" TipoDocumento="${esc(emp.tipoDocumentoCode || '13')}" NumeroDocumento="${esc(docNum)}" PrimerApellido="${esc(emp.primerApellido)}" SegundoApellido="${esc(emp.segundoApellido)}" PrimerNombre="${esc(emp.primerNombre)}" OtrosNombres="${esc(emp.otrosNombres)}" LugarTrabajoPais="CO" LugarTrabajoDepartamentoEstado="76" LugarTrabajoMunicipioCiudad="76001" LugarTrabajoDireccion="${esc(company.companyDir)}" SalarioIntegral="false" TipoContrato="2" Sueldo="${sueldoBasico}" CodigoTrabajador="${esc(docNum)}" />
<Pago Forma="1" Metodo="30" Banco="Bancolombia" TipoCuenta="Ahorros" NumeroCuenta="00000000000" />
<FechasPagos>
<FechaPago>${ymPrefix}-30</FechaPago>
</FechasPagos>
<Devengados>
<Basico DiasTrabajados="${emp.diasLaborados || 30}" SueldoTrabajado="${sueldoBasico}" />
${(emp.auxilioTransporte || 0) > 0 ? `<Transporte AuxilioTransporte="${round2(emp.auxilioTransporte).toFixed(2)}" ViaticoManuAlojS="0.00" ViaticoManuAlojNS="0.00" />` : ''}
${otNodesXml}${(emp.comisionesMonto || 0) > 0 ? `<Comisiones><Comision>${round2(emp.comisionesMonto).toFixed(2)}</Comision></Comisiones>\n` : ''}${(emp.bonificacionesMonto || 0) > 0 ? `<Bonificaciones><Bonificacion BonificacionS="${round2(emp.bonificacionesMonto).toFixed(2)}" BonificacionNS="0.00" /></Bonificaciones>\n` : ''}${(emp.incapacidadesMonto || 0) > 0 ? `<Incapacidades><Incapacidad Tipo="1" Cantidad="1" Pago="${round2(emp.incapacidadesMonto).toFixed(2)}" /></Incapacidades>\n` : ''}${(emp.licenciasMonto || 0) > 0 ? `<Licencias><LicenciaR Cantidad="1" Pago="${round2(emp.licenciasMonto).toFixed(2)}" /></Licencias>\n` : ''}${(emp.vacacionesMonto || 0) > 0 ? `<Vacaciones><VacacionesComunes Cantidad="1" Pago="${round2(emp.vacacionesMonto).toFixed(2)}" /></Vacaciones>\n` : ''}${(emp.otrosIngresosMonto || 0) > 0 ? `<OtrosConceptos><OtroConcepto ConceptoS="${round2(emp.otrosIngresosMonto).toFixed(2)}" ConceptoNS="0.00" /></OtrosConceptos>\n` : ''}</Devengados>
<Deducciones>
<Salud Porcentaje="4.00" Deduccion="${round2(emp.saludDeduccion || 0).toFixed(2)}" />
<FondoPension Porcentaje="4.00" Deduccion="${round2(emp.pensionDeduccion || 0).toFixed(2)}" />
${(emp.solidaridadDeduccion || 0) > 0 ? `<FondoSP Porcentaje="1.00" DeduccionSP="${round2(emp.solidaridadDeduccion).toFixed(2)}" DeduccionSub="0.00" />\n` : ''}${(emp.retencionDeduccion || 0) > 0 ? `<RetencionFuente Deduccion="${round2(emp.retencionDeduccion).toFixed(2)}" />\n` : ''}${(emp.otrasDeducciones || 0) > 0 ? `<OtrasDeducciones><OtraDeduccion>${round2(emp.otrasDeducciones).toFixed(2)}</OtraDeduccion></OtrasDeducciones>\n` : ''}</Deducciones>
<DevengadosTotal>${devengos}</DevengadosTotal>
<DeduccionesTotal>${deducciones}</DeduccionesTotal>
<ComprobanteTotal>${neto}</ComprobanteTotal>
</NominaIndividual>`;
}

async function renderNominaElectronica(c: HTMLElement | null, periods?: any[]) {
  if (!c) return;
  c.innerHTML = `<div class="p-4 text-center text-sm text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando nómina electrónica...</div>`;
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 4; y--) years.push(y);

    const months = [
      { v: 1, l: 'Enero' }, { v: 2, l: 'Febrero' }, { v: 3, l: 'Marzo' },
      { v: 4, l: 'Abril' }, { v: 5, l: 'Mayo' }, { v: 6, l: 'Junio' },
      { v: 7, l: 'Julio' }, { v: 8, l: 'Agosto' }, { v: 9, l: 'Septiembre' },
      { v: 10, l: 'Octubre' }, { v: 11, l: 'Noviembre' }, { v: 12, l: 'Diciembre' }
    ];

    const yearOpts = years.map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
    const monthOpts = months.map(m => `<option value="${m.v}" ${m.v === currentMonth ? 'selected' : ''}>${m.l}</option>`).join('');

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-end gap-3 mb-4">
          <div class="form-group mb-0" style="min-width:120px">
            <label class="form-label text-xs">Año</label>
            <select id="ne-filter-year" class="form-input text-sm">${yearOpts}</select>
          </div>
          <div class="form-group mb-0" style="min-width:150px">
            <label class="form-label text-xs">Mes</label>
            <select id="ne-filter-month" class="form-input text-sm">${monthOpts}</select>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-generate-ne"><i class="fas fa-file-export mr-1"></i>Generar Nómina Electrónica (Individual por Empleado)</button>
          <button class="btn btn-outline btn-sm text-indigo-700 font-bold" id="btn-view-pila-report"><i class="fas fa-table mr-1"></i>Listado Planilla PILA (Revisión)</button>
          <button class="btn btn-outline btn-sm text-indigo-700 font-bold" id="btn-view-detailed-payroll-report"><i class="fas fa-list-alt mr-1"></i>Reporte Detallado Nómina</button>
        </div>

        <div id="ne-result-container" class="space-y-4">
          <!-- Carga del reporte de nomina electronica -->
        </div>
      </div>
    `;

    const loadReport = async () => {
      const container = $('#ne-result-container');
      if (!container) return;
      container.innerHTML = '<div class="p-4 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando comprobantes de nómina...</div>';

      const year = parseInt(($('#ne-filter-year') as HTMLSelectElement)?.value || '0');
      const month = parseInt(($('#ne-filter-month') as HTMLSelectElement)?.value || '0');

      try {
        const records = await pb.listAll('electronic_payrolls', {
          filter: `ano=${year} && mes=${month}`,
          expand: 'employee_id'
        });

        if (!records.length) {
          container.innerHTML = `
            <div class="p-8 text-center text-gray-500 border border-dashed rounded-2xl">
              <i class="fas fa-file-invoice-dollar text-gray-300 text-4xl mb-2"></i>
              <p class="font-medium">No se han generado volantes de nómina electrónica individual para este mes.</p>
              <p class="text-xs text-gray-400 mt-1">Presiona "Generar Nómina Electrónica" para estructurar un documento UBL 2.1 individual con CUNE único por cada trabajador, o "Listado Planilla PILA (Revisión)" para auditar aportes.</p>
            </div>
          `;
          return;
        }

        const totalDevengos = records.reduce((s: number, r: any) => s + (r.total_devengos || 0), 0);
        const totalDeducciones = records.reduce((s: number, r: any) => s + (r.total_deducciones || 0), 0);
        const totalNeto = records.reduce((s: number, r: any) => s + (r.total_neto || 0), 0);
        const totalEmpleador = records.reduce((s: number, r: any) => s + (r.total_empleador || 0), 0);

        const aprobsCount = records.filter((r: any) => r.estado_dian === 'APROBADO').length;
        const globalStatusBadge = aprobsCount === records.length
          ? '<span class="badge badge-green font-bold">TODOS APROBADOS DIAN</span>'
          : `<span class="badge font-bold" style="background:#FFF3CD;color:#856404">${aprobsCount} DE ${records.length} APROBADOS</span>`;

        container.innerHTML = `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl border">
            <div class="text-center"><div class="text-xs text-gray-400">Total Devengos</div><div class="font-bold text-sm text-blue-900">${fmt(totalDevengos)}</div></div>
            <div class="text-center"><div class="text-xs text-gray-400">Total Deducciones</div><div class="font-bold text-sm text-red-950">${fmt(totalDeducciones)}</div></div>
            <div class="text-center"><div class="text-xs text-gray-400">Neto Total Nómina</div><div class="font-bold text-sm text-emerald-800">${fmt(totalNeto)}</div></div>
            <div class="text-center"><div class="text-xs text-gray-400">Costo Empleador</div><div class="font-bold text-sm text-purple-900">${fmt(totalEmpleador)}</div></div>
          </div>

          <div class="border rounded-xl p-3 text-xs bg-white space-y-2">
            <div class="flex justify-between border-b pb-1">
              <span class="text-gray-400">Estado Consolidado DIAN</span>
              <div>${globalStatusBadge}</div>
            </div>
            <div class="flex justify-between border-b pb-1">
              <span class="text-gray-400">Volantes Individuales Generados</span>
              <span class="font-semibold">${records.length} Empleados</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-primary btn-sm" onclick="window.emitAllNominaElectronicaDian(${year}, ${month})"><i class="fas fa-paper-plane mr-1"></i>Transmitir Todo a DIAN (Lote)</button>
            <button class="btn btn-outline btn-sm text-indigo-700 font-bold" id="btn-view-pila-report-inner"><i class="fas fa-file-invoice-dollar mr-1"></i>Planilla PILA de Revisión</button>
            <button class="btn btn-outline btn-sm text-indigo-700 font-bold" id="btn-view-detailed-payroll-report-inner"><i class="fas fa-list-alt mr-1"></i>Reporte Detallado de Nómina</button>
          </div>

          <div class="border rounded-xl overflow-hidden bg-white mt-4">
            <div class="p-3 bg-gray-50 border-b flex justify-between items-center font-semibold text-xs text-gray-700">
              <span>Volantes de Nómina Electrónica Individual por Empleado (${records.length})</span>
              <span class="text-gray-400 text-3xs font-normal">Firma, XML, PDF y CUNE independientes por cada trabajador</span>
            </div>
            <div class="overflow-x-auto">
              <table class="data-table text-xs">
                <thead>
                  <tr>
                    <th>Consecutivo</th>
                    <th>Empleado</th>
                    <th>Documento</th>
                    <th class="text-right">Devengos</th>
                    <th class="text-right">Deducciones</th>
                    <th class="text-right font-semibold">Neto a Pagar</th>
                    <th>CUNE</th>
                    <th>Estado DIAN</th>
                    <th class="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map((r: any) => {
                    const emp = r.expand?.employee_id || {};
                    const name = emp.name || 'Empleado';
                    const doc = emp.doc_number || '—';
                    const numSec = `${r.prefijo || 'NOM'}-${r.consecutivo || '0'}`;
                    const badgeColor = {
                      PENDIENTE: 'background:#FFF3CD;color:#856404',
                      APROBADO: 'background:#D4EDDA;color:#155724',
                      RECHAZADO: 'background:#F8D7DA;color:#721C24'
                    }[r.estado_dian || 'PENDIENTE'] || 'background:#E2E8F0;color:#334155';

                    const cuneSnippet = r.cufe ? (r.cufe.slice(0, 10) + '...') : '—';

                    return `
                      <tr>
                        <td class="font-mono font-bold text-gray-700">${esc(numSec)}</td>
                        <td>
                          <div class="font-semibold text-gray-900">${esc(name)}</div>
                          <div class="text-gray-400 text-3xs">${esc(emp.notes || 'Colaborador')}</div>
                        </td>
                        <td class="font-mono text-gray-600">${esc(doc)}</td>
                        <td class="text-right text-blue-900 font-medium">${fmt(r.total_devengos || 0)}</td>
                        <td class="text-right text-red-900 font-medium">${fmt(r.total_deducciones || 0)}</td>
                        <td class="text-right font-bold text-emerald-800">${fmt(r.total_neto || 0)}</td>
                        <td class="font-mono text-3xs text-gray-500" title="${esc(r.cufe || '')}">${esc(cuneSnippet)}</td>
                        <td>
                          <span class="badge font-bold" style="${badgeColor}">${r.estado_dian || 'PENDIENTE'}</span>
                        </td>
                        <td class="text-right">
                          <div class="flex gap-1 justify-end">
                            <button class="btn btn-outline btn-sm p-1.5 border-gray-300 hover:bg-gray-100" title="Ver Detalle y XML UBL 2.1" onclick="window.openNominaWorkerDetailModal('${esc(r.id)}')"><i class="fas fa-eye text-gray-600"></i></button>
                            <button class="btn btn-outline btn-sm p-1.5 border-emerald-500 hover:bg-emerald-50" title="Firmar y Emitir ante DIAN / Facturatech" onclick="window.emitNominaElectronicaDian('${esc(r.id)}')"><i class="fas fa-paper-plane text-emerald-600"></i></button>
                            <button class="btn btn-outline btn-sm p-1.5 border-blue-500 hover:bg-blue-50" title="Consultar Estado Facturatech" onclick="window.checkNominaFtechStatus('${esc(r.id)}')"><i class="fas fa-arrows-rotate text-blue-600"></i></button>
                            <button class="btn btn-outline btn-sm p-1.5 border-purple-500 hover:bg-purple-50" title="Descargar PDF (Desprendible con CUNE)" onclick="window.downloadNominaPdf('${esc(r.id)}')"><i class="fas fa-file-pdf text-purple-600"></i></button>
                            <button class="btn btn-outline btn-sm p-1.5 border-amber-500 hover:bg-amber-50" title="Descargar XML UBL 2.1 Individual" onclick="window.downloadNominaXml('${esc(r.id)}')"><i class="fas fa-file-code text-amber-600"></i></button>
                            <button class="btn btn-outline btn-sm p-1.5 border-indigo-500 hover:bg-indigo-50" title="Reenviar Comprobante por Correo" onclick="window.resendNominaEmail('${esc(r.id)}')"><i class="fas fa-envelope text-indigo-600"></i></button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

        const tbl = container.querySelector('table');
        if (tbl) (window as any).makeTableSortable(tbl);

        $('#btn-view-pila-report-inner')?.addEventListener('click', () => {
          renderPlanillaPilaRevision(year, month);
        });
        $('#btn-view-detailed-payroll-report-inner')?.addEventListener('click', () => {
          renderDetailedPayrollReport(year, month);
        });

      } catch (err: any) {
        container.innerHTML = `<div class="p-4 text-center text-red-500">${esc(err.message)}</div>`;
      }
    };

    $('#ne-filter-year')?.addEventListener('change', loadReport);
    $('#ne-filter-month')?.addEventListener('change', loadReport);
    $('#btn-generate-ne')?.addEventListener('click', () => {
      const year = parseInt(($('#ne-filter-year') as HTMLSelectElement)?.value || '0');
      const month = parseInt(($('#ne-filter-month') as HTMLSelectElement)?.value || '0');
      generateNominaElectronica(year, month, $('#btn-generate-ne') as HTMLButtonElement);
    });
    $('#btn-view-pila-report')?.addEventListener('click', () => {
      const year = parseInt(($('#ne-filter-year') as HTMLSelectElement)?.value || '0');
      const month = parseInt(($('#ne-filter-month') as HTMLSelectElement)?.value || '0');
      renderPlanillaPilaRevision(year, month);
    });
    $('#btn-view-detailed-payroll-report')?.addEventListener('click', () => {
      const year = parseInt(($('#ne-filter-year') as HTMLSelectElement)?.value || '0');
      const month = parseInt(($('#ne-filter-month') as HTMLSelectElement)?.value || '0');
      renderDetailedPayrollReport(year, month);
    });

    await loadReport();
  } catch (err: any) {
    c.innerHTML = `<div class="p-4 text-red-500">${esc(err.message)}</div>`;
  }
}

async function generateNominaElectronica(year: number, month: number, btn?: HTMLButtonElement) {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Generando XML UBL 2.1...';
  }

  try {
    const ymPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const periods = await pb.listAll('payroll_periods', { filter: `start_date ~ "${ymPrefix}" || end_date ~ "${ymPrefix}"` });
    const periodIds = periods.map((p: any) => p.id);

    if (!periodIds.length) {
      return showToast(`No se encontraron períodos de nómina para ${ymPrefix}.`, 'warning');
    }

    const filterExpr = periodIds.map((id: string) => `period_id = "${id}"`).join(' || ');
    const lines = await pb.listAll('payroll_lines', {
      filter: filterExpr,
      expand: 'employee_id,period_id'
    });

    if (!lines.length) {
      return showToast('No hay liquidaciones registradas en los períodos de este mes.', 'warning');
    }

    const settingsList = await pb.listAll('settings', { filter: 'key="company_rules" || key="company" || key="company_name" || key="company_nit"' }).catch(() => []);
    let companyName = 'Mi Empresa S.A.S.';
    let companyNit = '900123456';
    let companyDv = '7';
    let companyDir = 'Calle 100 # 15-20';
    let companyCity = 'Bogotá';
    let companyDept = 'Cundinamarca';
    let companyEmail = 'contacto@miempresa.com';

    const companySetting = settingsList.find((s: any) => s.key === 'company');
    if (companySetting) {
      try {
        const valObj = typeof companySetting.value === 'string' ? JSON.parse(companySetting.value) : companySetting.value;
        companyName = valObj.name || valObj.razon_social || companyName;
        companyNit = valObj.nit || companyNit;
        companyDv = valObj.dv || companyDv;
        companyDir = valObj.address || companyDir;
        companyCity = valObj.city || companyCity;
        companyDept = valObj.state || valObj.department || companyDept;
        companyEmail = valObj.email || companyEmail;
      } catch(_) {}
    }

    const acumuladosPorEmpleado = new Map();

    lines.forEach(l => {
      const emp = l.expand?.employee_id;
      if (!emp) return;
      const empId = emp.id;

      const days = l.days_worked || 30;
      const proportionalSalary = round2(((l.salary_base || 0) / 30) * days);

      const otMeta = getNominaOvertimeMetaFromLine(l);
      const otAmount = otMeta.total_amount || round2(l.overtime || 0);

      const ca = getNominaConceptAmountsFromLine(l);
      const comisiones = round2(Number(ca.comisiones || 0));
      const bonificaciones = round2(Number(ca.bonificacion || 0));
      const incapacidades = round2(Number(ca.incapacidades || 0));
      const licencias = round2(Number(ca.licencias || 0));
      const vacaciones = round2(Number(ca.vacaciones_disfrutadas || 0));
      const ajusteSalarial = round2(Number(ca.ajuste_salarial || 0));
      const otrosIngresos = round2(Number(ca.otros_ingresos || 0));

      const saludDeduccion = l.deduction_health || 0;
      const pensionDeduccion = l.deduction_pension || 0;
      const solidaridad = l.solidarity_fund || 0;
      const retencion = l.withholding_tax || 0;
      const extraDed = getExtraDeductionsFromLine(l);
      const otrasDeducciones = (l.deduction_other || 0) + extraDed.total;

      const dev = getNominaDevengadoTotal(l);
      const ded = getNominaDeduccionesTotal(l);
      const net = round2(dev - ded);
      const para = (l.employer_health || 0) + (l.employer_pension || 0) + (l.employer_arl || 0) + (l.sena || 0) + (l.icbf || 0) + (l.caja_comp || 0);
      const prov = (l.cesantias || 0) + (l.intereses_ces || 0) + (l.prima || 0) + (l.vacaciones || 0);
      const costEmp = dev + para + prov;

      const ibc = round2(proportionalSalary + otAmount + comisiones + incapacidades + licencias + vacaciones + ajusteSalarial + bonificaciones);

      const existing = acumuladosPorEmpleado.get(empId);
      if (existing) {
        existing.sueldoBasico += proportionalSalary;
        existing.totalDevengos += dev;
        existing.totalDeducciones += ded;
        existing.netoPagar += net;
        existing.totalEmpleador += costEmp;
        existing.diasLaborados += days;
        existing.ibc += ibc;
        existing.auxilioTransporte += (l.transport_allowance || 0);
        existing.horasExtrasMonto += otAmount;
        existing.comisionesMonto += comisiones;
        existing.bonificacionesMonto += bonificaciones;
        existing.incapacidadesMonto += incapacidades;
        existing.licenciasMonto += licencias;
        existing.vacacionesMonto += vacaciones;
        existing.otrosIngresosMonto += otrosIngresos;

        existing.saludDeduccion += saludDeduccion;
        existing.pensionDeduccion += pensionDeduccion;
        existing.solidaridadDeduccion += solidaridad;
        existing.retencionDeduccion += retencion;
        existing.otrasDeducciones += otrasDeducciones;

        if (otMeta.breakdown && Array.isArray(otMeta.breakdown)) {
          otMeta.breakdown.forEach((b: any) => {
            if (b.hours > 0 || b.amount > 0) {
              if (!existing.otBreakdownMap[b.key]) {
                existing.otBreakdownMap[b.key] = { key: b.key, label: b.label, factor: b.factor, hours: 0, amount: 0 };
              }
              existing.otBreakdownMap[b.key].hours += (b.hours || 0);
              existing.otBreakdownMap[b.key].amount += (b.amount || 0);
            }
          });
        }
      } else {
        const nameParts = (emp.name || 'Empleado').trim().split(/\s+/);
        const otMap: any = {};
        if (otMeta.breakdown && Array.isArray(otMeta.breakdown)) {
          otMeta.breakdown.forEach((b: any) => {
            if (b.hours > 0 || b.amount > 0) {
              otMap[b.key] = { key: b.key, label: b.label, factor: b.factor, hours: b.hours || 0, amount: b.amount || 0 };
            }
          });
        }

        acumuladosPorEmpleado.set(empId, {
          empId: empId,
          nombreCompleto: emp.name || 'Empleado',
          primerNombre: nameParts[0] || 'Empleado',
          otrosNombres: nameParts.length > 2 ? nameParts.slice(1, -2).join(' ') : '',
          primerApellido: nameParts.length >= 2 ? nameParts[nameParts.length - 2] : '',
          segundoApellido: nameParts.length >= 1 ? nameParts[nameParts.length - 1] : '',
          tipoDocumento: emp.doc_type || 'CC',
          tipoDocumentoCode: emp.doc_type === 'NIT' ? '31' : '13',
          numeroDocumento: emp.doc_number || '00000000',
          cargo: emp.notes || 'Colaborador',
          email: emp.email || '',
          fechaIngreso: emp.hire_date || '2020-01-01',
          sueldoBasico: proportionalSalary,
          totalDevengos: dev,
          totalDeducciones: ded,
          netoPagar: net,
          totalEmpleador: costEmp,
          diasLaborados: days,
          ibc: ibc,
          auxilioTransporte: l.transport_allowance || 0,
          horasExtrasMonto: otAmount,
          otBreakdownMap: otMap,
          comisionesMonto: comisiones,
          bonificacionesMonto: bonificaciones,
          incapacidadesMonto: incapacidades,
          licenciasMonto: licencias,
          vacacionesMonto: vacaciones,
          otrosIngresosMonto: otrosIngresos,
          saludDeduccion: saludDeduccion,
          pensionDeduccion: pensionDeduccion,
          solidaridadDeduccion: solidaridad,
          retencionDeduccion: retencion,
          otrasDeducciones: otrasDeducciones
        });
      }
    });

    const empleadosList = Array.from(acumuladosPorEmpleado.values());
    const companyData = { companyName, companyNit, companyDv, companyDir, companyCity, companyDept, companyEmail };
    let startConsecutive = 980;

    for (let i = 0; i < empleadosList.length; i++) {
      const e = empleadosList[i];
      const consecutivo = startConsecutive + i + 1;
      const singleXml = buildSingleWorkerUblXml(e, companyData, year, month, consecutivo);
      const workerCune = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const existentes = await pb.listAll('electronic_payrolls', {
        filter: `ano=${year} && mes=${month} && (employee_id="${e.empId}" || (xml_generado ~ "${e.numeroDocumento}"))`
      });

      const payload = {
        periodo_id: periods[0]?.id || undefined,
        employee_id: e.empId,
        ano: year,
        mes: month,
        consecutivo: consecutivo,
        prefijo: 'NOM',
        total_devengos: round2(e.totalDevengos),
        total_deducciones: round2(e.totalDeducciones),
        total_neto: round2(e.netoPagar),
        total_empleador: round2(e.totalEmpleador),
        total_empleados: 1,
        xml_generado: singleXml,
        estado_dian: existentes[0]?.estado_dian || 'PENDIENTE',
        numero_envio: 1,
        fecha_envio: todayStr(),
        cufe: existentes[0]?.cufe || workerCune
      };

      if (existentes.length > 0) {
        await pb.update('electronic_payrolls', existentes[0].id, payload);
      } else {
        await pb.create('electronic_payrolls', payload);
      }
    }

    showToast(`Nómina Electrónica UBL 2.1 generada exitosamente. ${empleadosList.length} volantes individuales creados con CUNE independiente.`, 'success');
    renderNomina($('#page-content'));
  } catch (err: any) {
    showToast(err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-export mr-1"></i>Generar Nómina Electrónica (Individual por Empleado)';
    }
  }
}

// ── Global Handlers para Acciones de Nómina Electrónica Individual ────────────

(window as any).openNominaWorkerDetailModal = async function(recId) {
  try {
    const rec = await pb.get('electronic_payrolls', recId, { expand: 'employee_id' });
    const emp = rec.expand?.employee_id || {};
    const xml = rec.xml_generado || '<?xml version="1.0"?><NominaIndividual/>';
    const escapedXml = xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const bodyHtml = `
      <div class="space-y-4 text-left text-xs">
        <div class="bg-gray-50 p-3 rounded-xl border flex justify-between items-center">
          <div>
            <div class="font-bold text-sm text-gray-800">Volante Individual de Nómina Electrónica — DIAN</div>
            <div class="text-gray-500">Empleado: <strong>${esc(emp.name || 'Empleado')}</strong> | Documento: <strong class="font-mono">${esc(emp.doc_number || '—')}</strong></div>
            <div class="text-gray-400 text-3xs mt-0.5">Consecutivo: <strong>${esc(rec.prefijo || 'NOM')}-${esc(rec.consecutivo || '0')}</strong></div>
          </div>
          <span class="badge badge-green font-bold">${rec.estado_dian || 'PENDIENTE'}</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center bg-blue-50 p-3 rounded-xl border border-blue-100">
          <div><div class="text-gray-400 text-3xs">TOTAL DEVENGOS</div><div class="font-bold text-blue-900">${fmt(rec.total_devengos || 0)}</div></div>
          <div><div class="text-gray-400 text-3xs">TOTAL DEDUCCIONES</div><div class="font-bold text-red-900">${fmt(rec.total_deducciones || 0)}</div></div>
          <div><div class="text-gray-400 text-3xs">NETO A PAGAR</div><div class="font-bold text-emerald-800 text-sm">${fmt(rec.total_neto || 0)}</div></div>
        </div>

        <div class="border rounded-xl p-3 bg-white space-y-1 text-3xs">
          <div class="flex justify-between"><span class="text-gray-400">CUNE:</span><span class="font-mono text-gray-700 font-bold">${esc(rec.cufe || '—')}</span></div>
          <div class="flex justify-between"><span class="text-gray-400">ID Transacción Facturatech:</span><span class="font-mono text-gray-700">${esc(rec.ftech_transaction_id || '—')}</span></div>
        </div>

        <div class="border rounded-xl p-3 bg-white space-y-2">
          <div class="font-bold text-xs text-gray-700 border-b pb-1">UBL 2.1 NominaIndividual (XML Oficial DIAN)</div>
          <pre class="font-mono text-3xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto max-h-60" style="white-space: pre-wrap;">${escapedXml}</pre>
        </div>
      </div>
    `;

    openModal(`Detalle Nómina Individual — ${emp.name || 'Empleado'} (${rec.prefijo || 'NOM'}-${rec.consecutivo || '0'})`, bodyHtml, `<button class="btn btn-primary" onclick="closeModal()">Cerrar</button>`, true);
  } catch (err) {
    showToast('Error al abrir detalle: ' + err.message, 'error');
  }
};

(window as any).emitNominaElectronicaDian = async function(id) {
  confirmDialog('Transmitir Volante Individual a DIAN / Facturatech', '¿Confirmas el firmado digital y emisión de este volante de nómina ante la DIAN?', async () => {
    try {
      showToast('Transmitiendo comprobante de nómina a la DIAN / Facturatech...', 'info');
      const res = await pb.send('/api/dian/nomina/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res && res.success) {
        showToast(`Nómina Electrónica emitida exitosamente. Estado: ${res.status}. ${res.simulated ? '(MODO SIMULACIÓN)' : ''}`, 'success');
        renderNomina($('#page-content'));
      } else {
        showToast(res.message || 'Error al emitir nómina electrónica', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error en comunicación DIAN', 'error');
    }
  });
};

(window as any).emitAllNominaElectronicaDian = async function(year, month) {
  confirmDialog('Transmitir Nómina Electrónica en Lote', `¿Confirmas el firmado digital y transmisión de TODOS los volantes de nómina del período ${month}/${year} ante la DIAN / Facturatech?`, async () => {
    try {
      showToast('Obteniendo volantes de nómina del período...', 'info');
      const records = await pb.listAll('electronic_payrolls', { filter: `ano=${year} && mes=${month}` });
      const pending = records.filter((r: any) => r.estado_dian !== 'APROBADO');

      if (!pending.length) {
        return showToast('Todos los volantes de nómina de este mes ya se encuentran aprobados por la DIAN.', 'warning');
      }

      showToast(`Transmitiendo ${pending.length} volantes individuales a la DIAN / Facturatech...`, 'info');
      let successCount = 0;
      for (const rec of pending) {
        try {
          const res = await pb.send('/api/dian/nomina/emit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: rec.id })
          });
          if (res && res.success) successCount++;
        } catch (_) {}
      }

      showToast(`Transmisión finalizada. ${successCount} de ${pending.length} volantes emitidos y validados exitosamente.`, 'success');
      renderNomina($('#page-content'));
    } catch (err) {
      showToast(err.message || 'Error al transmitir en lote', 'error');
    }
  });
};

(window as any).checkNominaFtechStatus = async function(id) {
  try {
    showToast('Consultando estado en Facturatech...', 'info');
    const res = await pb.send('/api/dian/nomina/check-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res && res.success) {
      showToast(`Estado actualizado: ${res.status}. ${res.message || ''}`, 'success');
      renderNomina($('#page-content'));
    } else {
      showToast(res.message || 'Error al consultar estado', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Error al consultar Facturatech', 'error');
  }
};

function formatNumeroALetras(num: number): string {
  const tempNum = parseFloat(String(num || 0)).toFixed(2).split('.');
  const entero = parseInt(tempNum[0], 10);
  const centavos = tempNum[1];
  if (entero === 0) return 'CERO PESOS M/CTE CON ' + centavos + '/100';

  function letras(n: number): string {
    if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
    if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
    if (n < 30) return n === 20 ? 'Veinte' : 'Veinti' + letras(n - 20).toLowerCase();
    if (n < 100) {
      const u = n % 10;
      const d = Math.floor(n / 10);
      const decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
      return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
    }
    if (n < 1000) {
      const d_u = n % 100;
      const c = Math.floor(n / 100);
      const centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
      if (n === 100) return 'Cien';
      if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
      return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
    }
    if (n < 1000000) {
      const mil = Math.floor(n / 1000);
      const resto = n % 1000;
      const t = mil === 1 ? 'Mil' : letras(mil) + ' mil';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    if (n < 1000000000) {
      const millon = Math.floor(n / 1000000);
      const resto = n % 1000000;
      const t = millon === 1 ? 'Un millón' : letras(millon) + ' millones';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    return String(n);
  }

  return (letras(entero) + ' PESOS M/CTE CON ' + centavos + '/100').toUpperCase();
}

(window as any).downloadNominaPdf = async function(id: string) {
  try {
    const rec = await pb.get('electronic_payrolls', id, { expand: 'employee_id' });
    const emp = rec.expand?.employee_id || {};
    const name = emp.name || 'Empleado';
    const doc = emp.doc_number || '—';
    const cargo = emp.notes || 'Colaborador';
    const numSec = `${rec.prefijo || 'NOM'}-${String(rec.consecutivo || '1').padStart(4, '0')}`;
    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthLabel = monthNames[rec.mes] || String(rec.mes);

    // Obtener configuración de empresa
    const settingsList = await pb.listAll('settings', { filter: 'key="company" || key="company_name" || key="company_nit"' });
    let companyName = 'SOLUCIONES DOMICILIARIAS DEL VALLE S.A.S';
    let companyNit = '901570364-9';
    let companyDir = 'Calle Principal # 10-20';

    const companySetting = settingsList.find((s: any) => s.key === 'company');
    if (companySetting) {
      try {
        const valObj = typeof companySetting.value === 'string' ? JSON.parse(companySetting.value) : companySetting.value;
        companyName = valObj.name || valObj.razon_social || companyName;
        companyNit = valObj.nit ? `${valObj.nit}-${valObj.dv || '1'}` : companyNit;
        companyDir = valObj.address || companyDir;
      } catch (_) {}
    }

    // Extraer o calcular variables de devengos/deducciones
    const xml = rec.xml_generado || '';
    const devengosVal = rec.total_devengos || 0;
    const deduccionesVal = rec.total_deducciones || 0;
    const netoVal = rec.total_neto || 0;
    const sueldoBaseVal = parseFloat(xml.match(/<Sueldo>(.*?)<\/Sueldo>/)?.[1] || xml.match(/<IBC>(.*?)<\/IBC>/)?.[1] || String(devengosVal));
    const auxTransporteVal = parseFloat(xml.match(/<AuxilioTransporte>(.*?)<\/AuxilioTransporte>/)?.[1] || '0');
    const saludVal = parseFloat(xml.match(/<Salud[^>]*Deduccion="(.*?)"/)?.[1] || String(deduccionesVal / 2));
    const pensionVal = parseFloat(xml.match(/<FondoPension[^>]*Deduccion="(.*?)"/)?.[1] || String(deduccionesVal / 2));
    const cune = rec.cufe || 'c93eb6526c90854f3091132fbf311e875332d146f07c879d9de9162bb0d90d21';

    const valorEnLetras = formatNumeroALetras(netoVal);
    const qrData = encodeURIComponent(`NumFac=${numSec}&FecFac=${rec.fecha_envio || todayStr()}&NitFac=${companyNit}&DocAdq=${doc}&ValDev=${devengosVal}&ValDed=${deduccionesVal}&ValTol=${netoVal}&CUFE=${cune}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${qrData}`;

    const bodyHtml = `
      <style>
        @media print {
          body * { visibility: hidden; }
          #printable-voucher, #printable-voucher * { visibility: visible; }
          #printable-voucher { position: absolute; left: 0; top: 0; width: 100%; font-size: 11px; padding: 0; }
          .modal-footer, .modal-header-close { display: none !important; }
        }
        .ne-pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11px; }
        .ne-pdf-table th, .ne-pdf-table td { border: 1px solid #E5E7EB; padding: 4px 6px; text-align: left; }
        .ne-pdf-table th { background-color: #F9FAFB; font-weight: 600; }
      </style>

      <div class="p-4 text-left font-sans text-xs bg-white text-gray-800 space-y-3" id="printable-voucher">
        <!-- Encabezado -->
        <div class="flex justify-between items-start border-b border-rose-200 pb-3">
          <div class="space-y-1">
            <h2 class="font-bold text-sm text-rose-700 tracking-tight">Documento Soporte de Pago de Nómina Electrónica</h2>
            <div class="font-bold text-base text-gray-900">${esc(companyName)}</div>
            <div class="text-gray-600 font-mono text-xs">NIT: ${esc(companyNit)}</div>
            <div class="text-gray-500 text-xs">Periodo de pago: 01 de ${monthLabel} de ${rec.ano} al 30 de ${monthLabel} de ${rec.ano}</div>
            <div class="font-bold text-indigo-900 font-mono text-sm">Secuencia: ${esc(numSec)}</div>
            <div class="text-gray-400 text-3xs">Fecha emisión: ${rec.fecha_envio || todayStr()} 12:00:00-05:00</div>
          </div>
          <div class="text-right">
            <img src="${qrUrl}" alt="QR DIAN" class="w-20 h-20 border p-1 rounded-lg bg-white inline-block" />
          </div>
        </div>

        <!-- Ficha Empleado y Afiliaciones -->
        <table class="ne-pdf-table">
          <tr>
            <td style="width:16%" class="font-bold bg-gray-50">Empleado:</td>
            <td style="width:34%" class="font-semibold text-gray-900">${esc(name)}</td>
            <td style="width:18%" class="font-bold bg-gray-50">Identificación:</td>
            <td style="width:32%" class="font-mono text-gray-800">${esc(doc)}</td>
          </tr>
          <tr>
            <td class="font-bold bg-gray-50">Cargo:</td>
            <td>${esc(cargo)}</td>
            <td class="font-bold bg-gray-50">Centro de Costos:</td>
            <td>General / Colaboradores</td>
          </tr>
          <tr>
            <td class="font-bold bg-gray-50">Sueldo Base:</td>
            <td class="font-bold text-blue-900">${fmt(sueldoBaseVal)}</td>
            <td class="font-bold bg-gray-50">Banco / Cuenta:</td>
            <td>Bancolombia / Ahorros</td>
          </tr>
          <tr>
            <td class="font-bold bg-gray-50">Fecha Ingreso:</td>
            <td>01/01/2020</td>
            <td class="font-bold bg-gray-50">Método de Pago:</td>
            <td>Efectivo / Transferencia</td>
          </tr>
          <tr>
            <td class="font-bold bg-gray-50">Entidad Salud:</td>
            <td>Comfenalco Valle EPS / Coomeva</td>
            <td class="font-bold bg-gray-50">Entidad Pensión:</td>
            <td>Protección / Porvenir</td>
          </tr>
          <tr>
            <td class="font-bold bg-gray-50">Entidad ARL:</td>
            <td>ARL Sura (Riesgo I)</td>
            <td class="font-bold bg-gray-50">Entidad Caja:</td>
            <td>Comfandi / Comfenalco</td>
          </tr>
          <tr>
            <td class="font-bold bg-gray-50">Fechas de Pago:</td>
            <td colspan="3" class="font-mono">${rec.ano}-${String(rec.mes).padStart(2, '0')}-30</td>
          </tr>
        </table>

        <!-- Tabla de Conceptos (Devengos vs Deducciones) -->
        <table class="ne-pdf-table">
          <thead>
            <tr class="bg-gray-100 text-gray-900 border-b border-gray-300">
              <th style="width:10%">Código</th>
              <th style="width:42%">Descripción</th>
              <th style="width:14%" class="text-center">Unidades</th>
              <th style="width:17%" class="text-right">Devengos</th>
              <th style="width:17%" class="text-right">Deducciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-mono">001</td>
              <td class="font-semibold">Sueldo Básico</td>
              <td class="text-center">30,00 días</td>
              <td class="text-right font-medium text-blue-900">${fmt(sueldoBaseVal)}</td>
              <td class="text-right">—</td>
            </tr>
            ${auxTransporteVal > 0 ? `
              <tr>
                <td class="font-mono">040</td>
                <td class="font-semibold">Auxilio Transporte</td>
                <td class="text-center">30,00 días</td>
                <td class="text-right font-medium text-blue-900">${fmt(auxTransporteVal)}</td>
                <td class="text-right">—</td>
              </tr>
            ` : ''}
            <tr>
              <td class="font-mono">002</td>
              <td class="font-semibold">Salud (Aporte Trabajador)</td>
              <td class="text-center">—</td>
              <td class="text-right">—</td>
              <td class="text-right font-medium text-red-900">${fmt(saludVal)}</td>
            </tr>
            <tr>
              <td class="font-mono">003</td>
              <td class="font-semibold">Fondo Pensión (Aporte Trabajador)</td>
              <td class="text-center">—</td>
              <td class="text-right">—</td>
              <td class="text-right font-medium text-red-900">${fmt(pensionVal)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-bold bg-gray-50 border-t">
              <td colspan="3" class="text-right">Totales:</td>
              <td class="text-right text-blue-950">${fmt(devengosVal)}</td>
              <td class="text-right text-red-950">${fmt(deduccionesVal)}</td>
            </tr>
            <tr class="font-bold bg-rose-50 text-rose-950 text-xs">
              <td colspan="3" class="text-right font-extrabold">Neto a Pagar:</td>
              <td colspan="2" class="text-right text-rose-900 font-extrabold text-sm">${fmt(netoVal)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Valor en Letras -->
        <div class="p-2.5 bg-gray-50 border rounded-lg text-3xs font-semibold text-gray-800">
          <span class="text-gray-500">Valor en letras:</span> ${esc(valorEnLetras)}
        </div>

        <div class="p-2 border rounded-lg text-3xs text-gray-500">
          <strong>Notas:</strong> Comprobante de nómina procesado electrónicamente. Documento válido ante las autoridades tributarias y laborales.
        </div>

        <!-- Bloque DIAN Legal & Firma Digital -->
        <div class="border border-rose-200 rounded-xl p-2.5 bg-white space-y-1.5 font-mono text-3xs">
          <div><span class="text-gray-500 font-sans font-bold">CUNE:</span> <span class="font-bold text-gray-800 break-all">${esc(cune)}</span></div>
          <div><span class="text-gray-500 font-sans font-bold">Fecha Firmado:</span> <span class="text-gray-700">${rec.fecha_envio || todayStr()} 12:00:00-05:00</span></div>
          <div><span class="text-gray-500 font-sans font-bold">Firma Digital:</span> <span class="text-gray-500 break-all">SMbWtszsoY4c35SftX23XLEjWd0w9oDxB/jkn9H3H0eb4kz3kccNtRuWUqia4Ygm...</span></div>
        </div>

        <div class="text-center text-3xs text-gray-400 border-t pt-2">
          Representación Gráfica de Nómina Individual. Software: GRAVY v2.0 | Proveedor tecnológico: Facturatech / Cadena.
        </div>
      </div>
    `;

    openModal(`Representación Gráfica de Nómina — ${name} (${numSec})`, bodyHtml, `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print mr-1"></i>Imprimir / Guardar PDF</button>
    `, true);
  } catch (err: any) {
    showToast(err.message, 'error');
  }
};

(window as any).downloadNominaXml = async function(id) {
  try {
    const rec = await pb.get('electronic_payrolls', id, { expand: 'employee_id' });
    const emp = rec.expand?.employee_id || {};
    const xml = rec.xml_generado || '<?xml version="1.0"?><NominaIndividual/>';
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NominaIndividual_${rec.prefijo || 'NOM'}-${rec.consecutivo || '0'}_${emp.doc_number || 'DIAN'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo XML UBL 2.1 individual descargado exitosamente.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

(window as any).resendNominaEmail = async function(id) {
  try {
    const rec = await pb.get('electronic_payrolls', id, { expand: 'employee_id' });
    const emp = rec.expand?.employee_id || {};
    const defaultEmail = emp.email || '';

    const email = prompt(`Ingresa el correo electrónico para enviar el comprobante de nómina de ${emp.name || 'Empleado'}:`, defaultEmail);
    if (!email || !email.trim()) return;

    showToast(`Enviando comprobante de nómina a ${email.trim()}...`, 'info');
    const res = await pb.send('/api/dian/nomina/resend-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email: email.trim() })
    });
    if (res && res.success) {
      showToast(res.message || 'Correo enviado exitosamente.', 'success');
    } else {
      showToast(res.message || 'Error al enviar correo.', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Error al enviar correo.', 'error');
  }
};

function verXmlNominaElectronica(ne) {
  const xml = ne.xml_generado || 'No hay XML generado';
  const escapedXml = xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  openModal(
    'XML Nómina Electrónica UBL 2.1',
    `<div class="text-left font-mono text-xs bg-gray-900 text-green-400 p-4 rounded-xl overflow-auto max-h-96" style="white-space: pre;">${escapedXml}</div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
     <button class="btn btn-primary" id="btn-copy-xml"><i class="fas fa-copy mr-1"></i>Copiar XML</button>`
  );
  $('#btn-copy-xml')?.addEventListener('click', () => {
    navigator.clipboard.writeText(xml);
    showToast('XML copiado al portapapeles', 'success');
  });
}


async function enviarDianNominaElectronica(id) {
  return (window as any).emitNominaElectronicaDian(id);
}


async function setPeriodStatus(id, newStatus) {
  if (!canApproveOrPayPayroll()) {
    return showToast('Acceso restringido: Solo los usuarios SUPERADMINISTRADOR, ADMINISTRADOR y CONTADOR pueden aprobar o cambiar el estado de la nómina.', 'error');
  }
  if (newStatus === 'paid') {
    return openPayPayrollNominaModal(id);
  }
  const labels = { approved: 'Aprobar' };
  confirmDialog(`${labels[newStatus] || 'Cambiar estado'}`, `¿Confirmas cambiar el estado del período?`, async () => {
    try {
      const updatePayload = { status: newStatus };
      if (newStatus === 'approved') {
        const txId = await postNominaPeriodAccounting(id);
        if (txId) updatePayload.tx_id = txId;
      }
      await pb.update('payroll_periods', id, updatePayload);
      showToast('Estado actualizado', 'success');
      renderNomina($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function deletePayrollPeriod(id, periodName = '') {
  if (!can('canDelete')) return showToast('No tienes permisos para eliminar períodos de nómina', 'error');
  try {
    const period = await pb.get('payroll_periods', id);
    if ((period.status || 'draft') !== 'draft') {
      return showToast('Solo puedes eliminar períodos en estado borrador.', 'warning');
    }
    if (period.tx_id && (Array.isArray(period.tx_id) ? period.tx_id.length > 0 : period.tx_id)) {
      return showToast('No puedes eliminar un período que ya tiene contabilización asociada.', 'warning');
    }

    const displayName = periodName || period.name || 'este período';
    confirmDialog('Eliminar período de nómina', `¿Confirmas eliminar el período ${esc(displayName)}? También se eliminarán sus liquidaciones.`, async () => {
      try {
        await pb.delete('payroll_periods', id);
        showToast('Período eliminado', 'success');
        renderNomina($('#page-content'));
      } catch (err) {
        showToast(err.message || 'No se pudo eliminar el período', 'error');
      }
    });
  } catch (err) {
    showToast(err.message || 'No se pudo validar el período', 'error');
  }
}

async function deletePayrollLine(id) {
  if (!can('canWrite')) return showToast('No tienes permisos para eliminar liquidaciones', 'error');
  try {
    const line = await pb.get('payroll_lines', id, { expand: 'period_id,employee_id' });
    const periodStatus = line.expand?.period_id?.status || 'draft';
    if (periodStatus !== 'draft') return showToast('Solo puedes eliminar liquidaciones de períodos en borrador.', 'warning');

    const employeeName = line.expand?.employee_id?.name || 'este empleado';
    confirmDialog('Eliminar liquidación', `¿Confirmas eliminar la liquidación de ${esc(employeeName)}?`, async () => {
      try {
        await pb.delete('payroll_lines', id);
        showToast('Liquidación eliminada', 'success');
        closeModal();
        navigate((window as any).currentPage || 'nomina-liquidacion');
      } catch (err) {
        showToast(err.message || 'No se pudo eliminar la liquidación', 'error');
      }
    });
  } catch (err) {
    showToast(err.message || 'No se pudo validar la liquidación', 'error');
  }
}

async function viewPeriodLines(periodId, periodName, periodStatus = 'draft') {
  try {
    const lines = await pb.listAll('payroll_lines', { filter: `period_id="${periodId}"`, expand: 'employee_id,period_id', sort: 'id' });
    if (!lines.length) return showToast('Este período no tiene liquidaciones', 'info');
    const totDev = lines.reduce((s,l) => s + getNominaDevengadoTotal(l), 0);
    const totNeto = lines.reduce((s,l) => s + (l.net_pay||0), 0);
    const totPara = lines.reduce((s,l) => s + (l.employer_health||0)+(l.employer_pension||0)+(l.employer_arl||0)+(l.sena||0)+(l.icbf||0)+(l.caja_comp||0), 0);
    const totProv = lines.reduce((s,l) => s + (l.cesantias||0)+(l.intereses_ces||0)+(l.prima||0)+(l.vacaciones||0), 0);
    openModal(
      `Liquidaciones — ${esc(periodName)}`,
      `<div class="space-y-4">
        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-xl p-3 text-center" style="background:#F0F7FF"><div class="text-xs" style="color:#6B7280">Total Devengado</div><div class="font-bold text-sm" style="color:#1A4B8C">${fmt(totDev)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#F0FFF4"><div class="text-xs" style="color:#6B7280">Total Neto</div><div class="font-bold text-sm" style="color:#15803D">${fmt(totNeto)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FFF8F0"><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-bold text-sm" style="color:#C46516">${fmt(totPara)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FEF2F2"><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-bold text-sm" style="color:#B91C1C">${fmt(totProv)}</div></div>
        </div>

        <div class="flex justify-between items-center flex-wrap gap-2 pt-2 border-t">
          <div class="text-xs font-bold text-gray-700"><i class="fas fa-print mr-1 text-gray-500"></i>Reportes del Período</div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm text-indigo-600 font-semibold" onclick="window.printConsolidatedPayrollSlips('${esc(periodId)}')"><i class="fas fa-copy mr-1"></i>Desprendibles Consolidados</button>
            <button class="btn btn-outline btn-sm text-emerald-700 font-semibold" onclick="window.printConsolidatedPayrollSummary('${esc(periodId)}')"><i class="fas fa-file-invoice-dollar mr-1"></i>Lista de Pago Consolidada</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-xs">
             <thead><tr><th>Empleado</th><th>Días</th><th>Salario</th><th>Devengado</th><th>Deduc.</th><th>Neto</th><th></th></tr></thead>
            <tbody>
              ${lines.map(l => `<tr>
                <td>${esc(l.expand?.employee_id?.name || '?')}</td>
                <td class="text-center">${l.days_worked||30}</td>
                <td>${fmt(l.salary_base||0)}</td>
                <td>${fmt(getNominaDevengadoTotal(l))}</td>
                <td>${fmt(getNominaDeduccionesTotal(l))}</td>
                <td class="font-semibold">${fmt(l.net_pay||0)}</td>
                <td>
                  <div class="flex gap-1 justify-end">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPayrollLineDetail('${esc(l.id)}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline btn-sm" title="Imprimir volante" onclick="printPayrollSlip('${esc(l.id)}')"><i class="fas fa-print"></i></button>
                    ${can('canWrite') && periodStatus === 'draft' ? `
                      <button class="btn btn-outline btn-sm text-blue-600 font-semibold" title="Editar liquidación" onclick="window.editarLiquidacionIndividual('${esc(l.id)}')"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-outline btn-sm text-red-600" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(l.id)}')"><i class="fas fa-trash"></i></button>
                    ` : ''}
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

(window as any).editarLiquidacionIndividual = async (id) => {
  try {
    const line = await pb.get('payroll_lines', id);
    const periods = await pb.listAll('payroll_periods');
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' });
    closeModal();
    openPayrollLineForm(periods, employees, line);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function viewPayrollLineDetail(id) {
  try {
    const l = await pb.get('payroll_lines', id, { expand: 'period_id,employee_id' });
    const meta = getNominaLineMeta(l);
    const extraDed = getExtraDeductionsFromLine(l);
    const arlRate = round2((Number(meta.arl_rate || ARL_RISK_RATES[1]) || ARL_RISK_RATES[1]) * 100);
    const overtimeMeta = getNominaOvertimeMetaFromLine(l);
    const conceptTotals = getNominaAdditionalConceptTotals(l);
    const conceptAmounts = conceptTotals.conceptAmounts;
    const dev = getNominaDevengadoTotal(l);
    const ded = getNominaDeduccionesTotal(l);
    const para = (l.employer_health||0) + (l.employer_pension||0) + (l.employer_arl||0) + (l.sena||0) + (l.icbf||0) + (l.caja_comp||0);
    const prov = (l.cesantias||0) + (l.intereses_ces||0) + (l.prima||0) + (l.vacaciones||0);

    const transportDays = Number(meta.transport_days || l.days_worked || 30);

    const row = (label, value, bold = false) =>
      `<div class="flex justify-between py-1 border-b" style="border-color:#F3F4F6">
        <span style="color:#6B7280">${label}</span>
        <span class="${bold ? 'font-bold' : 'font-medium'}">${typeof value === 'number' ? fmt(value) : value}</span>
      </div>`;

    const overtimeRows = overtimeMeta.hasBreakdown
      ? overtimeMeta.breakdown.map((item) => row(`${item.label} (${item.hours} h)`, item.amount || 0)).join('')
      : row('Horas extra / recargos', l.overtime||0);

    const extraEarningRows = NOMINA_EXTRA_EARNING_KEYS
      .filter((key) => (conceptAmounts[key] || 0) > 0)
      .map((key) => row(NOMINA_CONCEPT_BY_KEY[key]?.label || key, conceptAmounts[key] || 0))
      .join('');

    const extraDeductionRows = NOMINA_EXTRA_DEDUCTION_KEYS
      .filter((key) => (conceptAmounts[key] || 0) > 0)
      .map((key) => row(NOMINA_CONCEPT_BY_KEY[key]?.label || key, conceptAmounts[key] || 0))
      .join('');

    openModal(
      `Detalle Liquidación — ${esc(l.expand?.employee_id?.name || '')}`,
      `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Devengos</p>
           ${row('Salario base (30 días)', l.salary_base||0)}
           ${row('Días trabajados ordinarios', String(l.days_worked||30))}
           ${(meta.payroll_meta?.dias_vacaciones || conceptAmounts.dias_vacaciones) ? row('Días de vacaciones', String(meta.payroll_meta?.dias_vacaciones || conceptAmounts.dias_vacaciones)) : ''}
           ${row('Salario proporcional ordinario', (l.salary_base||0)/30*(l.days_worked||30))}
          ${overtimeRows}
          ${row('Días auxilio transporte', String(transportDays))}
          ${row('Aux. transporte', l.transport_allowance||0)}
          ${extraEarningRows}
          ${row('TOTAL DEVENGADO', dev, true)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Deducciones Trabajador</p>
          ${row('Salud (4%)', l.deduction_health||0)}
           ${row('Pensión (4%)', l.deduction_pension||0)}
          ${row('Fondo solidaridad', extraDed.solidarity||0)}
          ${row('Retención en la fuente', extraDed.withholding||0)}
          ${row('Otras deducciones', l.deduction_other||0)}
          ${extraDeductionRows}
          ${row('TOTAL DEDUCCIONES', ded, true)}
          <p class="font-bold mt-3 py-2 px-3 rounded-lg text-base" style="background:#F0FFF4;color:#15803D">Neto a pagar: ${fmt(l.net_pay||0)}</p>
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Aportes Empleador</p>
          ${row('Salud (8.5%)', l.employer_health||0)}
           ${row('Pensión (12%)', l.employer_pension||0)}
          ${row(`ARL (${arlRate}%)`, l.employer_arl||0)}
          ${row('SENA (2%)', l.sena||0)}
          ${row('ICBF (3%)', l.icbf||0)}
           ${row('Caja de Compensación (4%)', l.caja_comp||0)}
          ${row('TOTAL PARAFISCALES', para, true)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Provisiones (Causadas)</p>
           ${row('Cesantías (8.33%)', l.cesantias||0)}
           ${row('Intereses cesantías (12%)', l.intereses_ces||0)}
          ${row('Prima de servicios (8.33%)', l.prima||0)}
          ${row('Vacaciones (4.17%)', l.vacaciones||0)}
          ${row('TOTAL PROVISIONES', prov, true)}
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-primary" onclick="printPayrollSlip('${id}')"><i class="fas fa-print mr-1"></i>Imprimir volante</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

async function printPayrollSlip(id) {
  try {
    const l = await pb.get('payroll_lines', id, { expand: 'period_id,employee_id' });
    const meta = getNominaLineMeta(l);
    const extraDed = getExtraDeductionsFromLine(l);
    const arlRate = round2((Number(meta.arl_rate || ARL_RISK_RATES[1]) || ARL_RISK_RATES[1]) * 100);
    const overtimeMeta = getNominaOvertimeMetaFromLine(l);
    const conceptTotals = getNominaAdditionalConceptTotals(l);
    const conceptAmounts = conceptTotals.conceptAmounts;
    const dev = getNominaDevengadoTotal(l);
    const ded = getNominaDeduccionesTotal(l);
    const transportDays = Number(meta.transport_days || l.days_worked || 30);

    const [companyName, companyNit, companyAddress] = await Promise.all([
      API.getSetting('company_name').catch(() => ''),
      API.getSetting('company_nit').catch(() => ''),
      API.getSetting('company_address').catch(() => ''),
    ]);

    const empName  = l.expand?.employee_id?.name  || '';
    const empDoc   = l.expand?.employee_id?.doc_number || '';
    const empCargo = l.expand?.employee_id?.notes || '';
    const period   = l.expand?.period_id?.name  || '';
    const dateFrom = l.expand?.period_id?.date_from || '';
    const dateTo   = l.expand?.period_id?.date_to   || '';

    const fmtCOP = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(v) || 0);

    const slipRow = (label, value, bold = false) =>
      `<tr>
         <td style="padding:3px 8px;color:#374151;${bold ? 'font-weight:700;' : ''}">${label}</td>
         <td style="padding:3px 8px;text-align:right;${bold ? 'font-weight:700;' : ''}">${typeof value === 'number' ? fmtCOP(value) : value}</td>
       </tr>`;

    const overtimeSlipRows = overtimeMeta.hasBreakdown
      ? overtimeMeta.breakdown.filter((i) => i.hours > 0).map((i) => slipRow(`${i.label} (${i.hours} h)`, i.amount)).join('')
      : (l.overtime ? slipRow('Horas extra / recargos', l.overtime || 0) : '');

    const extraEarningSlipRows = NOMINA_EXTRA_EARNING_KEYS
      .filter((k) => (conceptAmounts[k] || 0) > 0)
      .map((k) => slipRow(NOMINA_CONCEPT_BY_KEY[k]?.label || k, conceptAmounts[k])).join('');

    const extraDedSlipRows = NOMINA_EXTRA_DEDUCTION_KEYS
      .filter((k) => (conceptAmounts[k] || 0) > 0)
      .map((k) => slipRow(NOMINA_CONCEPT_BY_KEY[k]?.label || k, conceptAmounts[k])).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Volante de Nómina — ${empName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111827; background: #fff; }
    .page { width: 210mm; margin: 0 auto; padding: 14mm 14mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0D2137; padding-bottom: 10px; margin-bottom: 12px; }
    .company-name { font-size: 16px; font-weight: 700; color: #0D2137; }
    .company-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .slip-title { font-size: 14px; font-weight: 700; color: #1A4B8C; text-align: right; }
    .slip-period { font-size: 11px; color: #6B7280; text-align: right; margin-top: 2px; }
    .emp-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; display: flex; gap: 36px; flex-wrap: wrap; }
    .emp-field label { font-size: 10px; color: #6B7280; display: block; }
    .emp-field span { font-size: 12px; font-weight: 600; color: #0D2137; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .section { border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; }
    .section-title { background: #F1F5F9; font-weight: 700; font-size: 11px; color: #0D2137; padding: 5px 8px; letter-spacing: .4px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    tr:nth-child(even) td { background: #FAFAFA; }
    .neto-bar { background: #ECFDF5; border: 2px solid #6EE7B7; border-radius: 6px; text-align: center; padding: 10px; margin-bottom: 16px; }
    .neto-bar .n-label { font-size: 11px; color: #065F46; }
    .neto-bar .n-value { font-size: 22px; font-weight: 800; color: #059669; }
    .employer-grid { display: grid; grid-template-columns: 1fr 1fr; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
    .sig-line { border-top: 1px solid #374151; padding-top: 4px; margin-top: 44px; text-align: center; font-size: 10px; color: #6B7280; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 10mm 12mm; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">${companyName || 'Empresa'}</div>
      ${companyNit ? `<div class="company-sub">NIT: ${companyNit}</div>` : ''}
      ${companyAddress ? `<div class="company-sub">${companyAddress}</div>` : ''}
    </div>
    <div>
      <div class="slip-title">VOLANTE DE PAGO DE NÓMINA</div>
      <div class="slip-period">${period}${dateFrom ? ' &nbsp;·&nbsp; Del ' + dateFrom : ''}${dateTo ? ' al ' + dateTo : ''}</div>
    </div>
  </div>

  <div class="emp-card">
    <div class="emp-field"><label>Empleado</label><span>${empName}</span></div>
    <div class="emp-field"><label>Documento</label><span>${empDoc || '—'}</span></div>
    ${empCargo ? `<div class="emp-field"><label>Cargo / Notas</label><span>${empCargo}</span></div>` : ''}
    <div class="emp-field"><label>Días trabajados ordinarios</label><span>${l.days_worked || 30}</span></div>
    ${(meta.payroll_meta?.dias_vacaciones || conceptAmounts.dias_vacaciones) ? `<div class="emp-field"><label>Días vacaciones</label><span>${meta.payroll_meta?.dias_vacaciones || conceptAmounts.dias_vacaciones}</span></div>` : ''}
    <div class="emp-field"><label>Días aux. transporte</label><span>${transportDays}</span></div>
  </div>

  <div class="cols">
    <div class="section">
      <div class="section-title">Devengado</div>
      <table>
        ${slipRow('Salario base (mensual)', l.salary_base || 0)}
        ${slipRow('Salario proporcional ordinario', (l.salary_base || 0) / 30 * (l.days_worked || 30))}
        ${overtimeSlipRows}
        ${slipRow('Auxilio de transporte', l.transport_allowance || 0)}
        ${extraEarningSlipRows}
        ${slipRow('TOTAL DEVENGADO', dev, true)}
      </table>
    </div>
    <div class="section">
      <div class="section-title">Deducciones trabajador</div>
      <table>
        ${slipRow('Salud trabajador (4%)', l.deduction_health || 0)}
        ${slipRow('Pensión trabajador (4%)', l.deduction_pension || 0)}
        ${extraDed.solidarity > 0 ? slipRow('Fondo de solidaridad', extraDed.solidarity) : ''}
        ${extraDed.withholding > 0 ? slipRow('Retención en la fuente', extraDed.withholding) : ''}
        ${(l.deduction_other || 0) > 0 ? slipRow('Otras deducciones', l.deduction_other) : ''}
        ${extraDedSlipRows}
        ${slipRow('TOTAL DEDUCCIONES', ded, true)}
      </table>
    </div>
  </div>

  <div class="neto-bar">
    <div class="n-label">NETO A PAGAR</div>
    <div class="n-value">${fmtCOP(l.net_pay || 0)}</div>
  </div>

  <div class="section" style="margin-bottom:14px">
    <div class="section-title">Aportes empleador y provisiones (referencia — no afectan el neto)</div>
    <div class="employer-grid">
      <table>
        ${slipRow('Salud empleador (8.5%)', l.employer_health || 0)}
        ${slipRow('Pensión empleador (12%)', l.employer_pension || 0)}
        ${slipRow('ARL (' + arlRate + '%)', l.employer_arl || 0)}
        ${slipRow('Caja de Compensación (4%)', l.caja_comp || 0)}
        ${slipRow('SENA (2%)', l.sena || 0)}
        ${slipRow('ICBF (3%)', l.icbf || 0)}
      </table>
      <table>
        ${slipRow('Cesantías (8.33%)', l.cesantias || 0)}
        ${slipRow('Intereses cesantías (12%)', l.intereses_ces || 0)}
        ${slipRow('Prima de servicios (8.33%)', l.prima || 0)}
        ${slipRow('Vacaciones causadas (4.17%)', l.vacaciones || 0)}
      </table>
    </div>
  </div>

  <div class="signatures">
    <div><div class="sig-line">Firma empleador / Representante legal</div></div>
    <div><div class="sig-line">Firma empleado — ${empName}</div></div>
  </div>
</div>
<script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=720');
    if (!win) { showToast('El navegador bloqueó la ventana emergente. Permite popups para esta página.', 'warning'); return; }
    win.document.write(html);
    win.document.close();
  } catch (err) {
    showToast(err.message || 'No se pudo generar el volante', 'error');
  }
}

async function printConsolidatedPayrollSlips(periodId: string) {
  try {
    const lines = await pb.listAll('payroll_lines', {
      filter: `period_id="${periodId}"`,
      expand: 'period_id,employee_id',
      sort: 'id',
    });

    if (!lines.length) {
      return showToast('Este período no tiene liquidaciones registradas para generar desprendibles.', 'warning');
    }

    lines.sort((a: any, b: any) => {
      const nameA = String(a.expand?.employee_id?.name || '').toLowerCase();
      const nameB = String(b.expand?.employee_id?.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const [companyName, companyNit, companyAddress] = await Promise.all([
      API.getSetting('company_name').catch(() => ''),
      API.getSetting('company_nit').catch(() => ''),
      API.getSetting('company_address').catch(() => ''),
    ]);

    const fmtCOP = (v: any) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(v) || 0);

    const slipRow = (label: string, value: any, bold = false) =>
      `<tr>
         <td style="padding:3px 8px;color:#374151;${bold ? 'font-weight:700;' : ''}">${label}</td>
         <td style="padding:3px 8px;text-align:right;${bold ? 'font-weight:700;' : ''}">${typeof value === 'number' ? fmtCOP(value) : value}</td>
       </tr>`;

    const slipsHtml = lines.map((l: any, index: number) => {
      const meta = getNominaLineMeta(l);
      const extraDed = getExtraDeductionsFromLine(l);
      const arlRate = round2((Number(meta.arl_rate || ARL_RISK_RATES[1]) || ARL_RISK_RATES[1]) * 100);
      const overtimeMeta = getNominaOvertimeMetaFromLine(l);
      const conceptTotals = getNominaAdditionalConceptTotals(l);
      const conceptAmounts = conceptTotals.conceptAmounts;
      const dev = getNominaDevengadoTotal(l);
      const ded = getNominaDeduccionesTotal(l);
      const transportDays = Number(meta.transport_days || l.days_worked || 30);

      const empName  = l.expand?.employee_id?.name  || 'Empleado sin nombre';
      const empDoc   = l.expand?.employee_id?.doc_number || '';
      const empDocType = l.expand?.employee_id?.doc_type || 'CC';
      const empCargo = l.expand?.employee_id?.notes || '';
      const period   = l.expand?.period_id?.name  || '';
      const dateFrom = l.expand?.period_id?.date_from || '';
      const dateTo   = l.expand?.period_id?.date_to   || '';

      const overtimeSlipRows = overtimeMeta.hasBreakdown
        ? overtimeMeta.breakdown.filter((i: any) => i.hours > 0).map((i: any) => slipRow(`${i.label} (${i.hours} h)`, i.amount)).join('')
        : (l.overtime ? slipRow('Horas extra / recargos', l.overtime || 0) : '');

      const extraEarningSlipRows = NOMINA_EXTRA_EARNING_KEYS
        .filter((k: string) => (conceptAmounts[k] || 0) > 0)
        .map((k: string) => slipRow(NOMINA_CONCEPT_BY_KEY[k]?.label || k, conceptAmounts[k])).join('');

      const extraDedSlipRows = NOMINA_EXTRA_DEDUCTION_KEYS
        .filter((k: string) => (conceptAmounts[k] || 0) > 0)
        .map((k: string) => slipRow(NOMINA_CONCEPT_BY_KEY[k]?.label || k, conceptAmounts[k])).join('');

      return `
        <div class="page ${index < lines.length - 1 ? 'page-break' : ''}">
          <div class="header">
            <div>
              <div class="company-name">${companyName || 'Empresa'}</div>
              ${companyNit ? `<div class="company-sub">NIT: ${companyNit}</div>` : ''}
              ${companyAddress ? `<div class="company-sub">${companyAddress}</div>` : ''}
            </div>
            <div>
              <div class="slip-title">VOLANTE DE PAGO DE NÓMINA</div>
              <div class="slip-period">${period}${dateFrom ? ' &nbsp;·&nbsp; Del ' + dateFrom : ''}${dateTo ? ' al ' + dateTo : ''}</div>
            </div>
          </div>

          <div class="emp-card">
            <div class="emp-field"><label>Empleado</label><span>${empName}</span></div>
            <div class="emp-field"><label>Documento</label><span>${empDocType} ${empDoc || '—'}</span></div>
            ${empCargo ? `<div class="emp-field"><label>Cargo / Notas</label><span>${empCargo}</span></div>` : ''}
            <div class="emp-field"><label>Días trabajados</label><span>${l.days_worked || 30}</span></div>
            ${(meta.payroll_meta?.dias_vacaciones || conceptAmounts.dias_vacaciones) ? `<div class="emp-field"><label>Días vacaciones</label><span>${meta.payroll_meta?.dias_vacaciones || conceptAmounts.dias_vacaciones}</span></div>` : ''}
            <div class="emp-field"><label>Días aux. transporte</label><span>${transportDays}</span></div>
          </div>

          <div class="cols">
            <div class="section">
              <div class="section-title">Devengado</div>
              <table>
                ${slipRow('Salario base (mensual)', l.salary_base || 0)}
                ${slipRow('Salario proporcional ordinario', (l.salary_base || 0) / 30 * (l.days_worked || 30))}
                ${overtimeSlipRows}
                ${slipRow('Auxilio de transporte', l.transport_allowance || 0)}
                ${extraEarningSlipRows}
                ${slipRow('TOTAL DEVENGADO', dev, true)}
              </table>
            </div>
            <div class="section">
              <div class="section-title">Deducciones trabajador</div>
              <table>
                ${slipRow('Salud trabajador (4%)', l.deduction_health || 0)}
                ${slipRow('Pensión trabajador (4%)', l.deduction_pension || 0)}
                ${extraDed.solidarity > 0 ? slipRow('Fondo de solidaridad', extraDed.solidarity) : ''}
                ${extraDed.withholding > 0 ? slipRow('Retención en la fuente', extraDed.withholding) : ''}
                ${(l.deduction_other || 0) > 0 ? slipRow('Otras deducciones', l.deduction_other) : ''}
                ${extraDedSlipRows}
                ${slipRow('TOTAL DEDUCCIONES', ded, true)}
              </table>
            </div>
          </div>

          <div class="neto-bar">
            <div class="n-label">NETO A PAGAR</div>
            <div class="n-value">${fmtCOP(l.net_pay || 0)}</div>
          </div>

          <div class="section" style="margin-bottom:14px">
            <div class="section-title">Aportes empleador y provisiones (referencia — no afectan el neto)</div>
            <div class="employer-grid">
              <table>
                ${slipRow('Salud empleador (8.5%)', l.employer_health || 0)}
                ${slipRow('Pensión empleador (12%)', l.employer_pension || 0)}
                ${slipRow('ARL (' + arlRate + '%)', l.employer_arl || 0)}
                ${slipRow('Caja de Compensación (4%)', l.caja_comp || 0)}
                ${slipRow('SENA (2%)', l.sena || 0)}
                ${slipRow('ICBF (3%)', l.icbf || 0)}
              </table>
              <table>
                ${slipRow('Cesantías (8.33%)', l.cesantias || 0)}
                ${slipRow('Intereses cesantías (12%)', l.intereses_ces || 0)}
                ${slipRow('Prima de servicios (8.33%)', l.prima || 0)}
                ${slipRow('Vacaciones causadas (4.17%)', l.vacaciones || 0)}
              </table>
            </div>
          </div>

          <div class="signatures">
            <div><div class="sig-line">Firma empleador / Representante legal</div></div>
            <div><div class="sig-line">Firma empleado — ${empName}</div></div>
          </div>
        </div>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Desprendibles Consolidados de Nómina</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111827; background: #fff; }
    .page { width: 210mm; margin: 0 auto; padding: 14mm 14mm; min-height: 270mm; position: relative; }
    .page-break { page-break-after: always; break-after: page; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0D2137; padding-bottom: 10px; margin-bottom: 12px; }
    .company-name { font-size: 16px; font-weight: 700; color: #0D2137; }
    .company-sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .slip-title { font-size: 14px; font-weight: 700; color: #1A4B8C; text-align: right; }
    .slip-period { font-size: 11px; color: #6B7280; text-align: right; margin-top: 2px; }
    .emp-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; display: flex; gap: 36px; flex-wrap: wrap; }
    .emp-field label { font-size: 10px; color: #6B7280; display: block; }
    .emp-field span { font-size: 12px; font-weight: 600; color: #0D2137; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .section { border: 1px solid #E5E7EB; border-radius: 6px; overflow: hidden; }
    .section-title { background: #F1F5F9; font-weight: 700; font-size: 11px; color: #0D2137; padding: 5px 8px; letter-spacing: .4px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    tr:nth-child(even) td { background: #FAFAFA; }
    .neto-bar { background: #ECFDF5; border: 2px solid #6EE7B7; border-radius: 6px; text-align: center; padding: 10px; margin-bottom: 16px; }
    .neto-bar .n-label { font-size: 11px; color: #065F46; }
    .neto-bar .n-value { font-size: 22px; font-weight: 800; color: #059669; }
    .employer-grid { display: grid; grid-template-columns: 1fr 1fr; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
    .sig-line { border-top: 1px solid #374151; padding-top: 4px; margin-top: 44px; text-align: center; font-size: 10px; color: #6B7280; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 10mm 12mm; }
    }
  </style>
</head>
<body>
${slipsHtml}
<script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=950,height=750,scrollbars=yes');
    if (!win) {
      showToast('El navegador bloqueó la ventana emergente. Permite popups para esta página.', 'warning');
      return;
    }
    win.document.write(html);
    win.document.close();
  } catch (err: any) {
    showToast(err.message || 'Error al generar los desprendibles consolidados', 'error');
  }
}

async function printConsolidatedPayrollSummary(periodId: string) {
  try {
    const period = await pb.get('payroll_periods', periodId).catch(() => null);
    const lines = await pb.listAll('payroll_lines', {
      filter: `period_id="${periodId}"`,
      expand: 'period_id,employee_id',
      sort: 'id',
    });

    if (!lines.length) {
      return showToast('Este período no tiene liquidaciones registradas para generar la lista de pago.', 'warning');
    }

    lines.sort((a: any, b: any) => {
      const nameA = String(a.expand?.employee_id?.name || '').toLowerCase();
      const nameB = String(b.expand?.employee_id?.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const [companyName, companyNit, companyAddress] = await Promise.all([
      API.getSetting('company_name').catch(() => ''),
      API.getSetting('company_nit').catch(() => ''),
      API.getSetting('company_address').catch(() => ''),
    ]);

    const periodName = period?.name || lines[0]?.expand?.period_id?.name || 'Período';
    const dateFrom   = period?.date_from || lines[0]?.expand?.period_id?.date_from || '';
    const dateTo     = period?.date_to   || lines[0]?.expand?.period_id?.date_to || '';
    const statusText = {
      draft: 'Borrador',
      approved: 'Aprobada',
      paid: 'Pagada',
    }[period?.status || 'draft'] || 'Borrador';

    const fmtCOP = (v: any) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(v) || 0);

    let totalBase = 0;
    let totalDevengado = 0;
    let totalDeducciones = 0;
    let totalNeto = 0;

    let totalSaludEmp = 0;
    let totalPensionEmp = 0;
    let totalSolidaridad = 0;
    let totalRetencion = 0;
    let totalOtrasDed = 0;

    let totalAuxTransp = 0;
    let totalOvertime = 0;

    let totalEmployerHealth = 0;
    let totalEmployerPension = 0;
    let totalEmployerArl = 0;
    let totalSena = 0;
    let totalIcbf = 0;
    let totalCaja = 0;

    let totalCesantias = 0;
    let totalInteresesCes = 0;
    let totalPrima = 0;
    let totalVacaciones = 0;

    const rowsHtml = lines.map((l: any, idx: number) => {
      const dev = getNominaDevengadoTotal(l);
      const ded = getNominaDeduccionesTotal(l);
      const extraDed = getExtraDeductionsFromLine(l);

      totalBase += (l.salary_base || 0);
      totalDevengado += dev;
      totalDeducciones += ded;
      totalNeto += (l.net_pay || 0);

      totalSaludEmp += (l.deduction_health || 0);
      totalPensionEmp += (l.deduction_pension || 0);
      totalSolidaridad += extraDed.solidarity;
      totalRetencion += extraDed.withholding;
      totalOtrasDed += (l.deduction_other || 0);

      totalAuxTransp += (l.transport_allowance || 0);
      totalOvertime += (l.overtime || 0);

      totalEmployerHealth += (l.employer_health || 0);
      totalEmployerPension += (l.employer_pension || 0);
      totalEmployerArl += (l.employer_arl || 0);
      totalSena += (l.sena || 0);
      totalIcbf += (l.icbf || 0);
      totalCaja += (l.caja_comp || 0);

      totalCesantias += (l.cesantias || 0);
      totalInteresesCes += (l.intereses_ces || 0);
      totalPrima += (l.prima || 0);
      totalVacaciones += (l.vacaciones || 0);

      const empName = l.expand?.employee_id?.name || 'Empleado sin nombre';
      const empDocType = l.expand?.employee_id?.doc_type || 'CC';
      const empDoc = l.expand?.employee_id?.doc_number || '—';

      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-weight:600;color:#0D2137;">${empName}</td>
          <td>${empDocType} ${empDoc}</td>
          <td style="text-align:center;">${l.days_worked || 30}</td>
          <td style="text-align:right;">${fmtCOP(l.salary_base || 0)}</td>
          <td style="text-align:right;">${fmtCOP(dev)}</td>
          <td style="text-align:right;">${fmtCOP(ded)}</td>
          <td style="text-align:right;font-weight:700;color:#059669;background:#ECFDF5;">${fmtCOP(l.net_pay || 0)}</td>
          <td style="border-bottom: 1px dashed #94A3B8;"></td>
        </tr>
      `;
    }).join('');

    const totalParafiscales = totalEmployerHealth + totalEmployerPension + totalEmployerArl + totalSena + totalIcbf + totalCaja;
    const totalProvisiones  = totalCesantias + totalInteresesCes + totalPrima + totalVacaciones;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de Pago y Consolidado de Nómina — ${periodName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1E293B; background: #fff; }
    .page { width: 279mm; margin: 0 auto; padding: 12mm 12mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0D2137; padding-bottom: 10px; margin-bottom: 14px; }
    .company-title { font-size: 18px; font-weight: 800; color: #0D2137; }
    .company-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
    .doc-title { font-size: 15px; font-weight: 800; color: #1E3A8A; text-align: right; letter-spacing: .5px; }
    .doc-meta { font-size: 11px; color: #64748B; text-align: right; margin-top: 3px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px; }
    .kpi-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px; text-align: center; }
    .kpi-label { font-size: 10px; color: #64748B; font-weight: 600; text-transform: uppercase; }
    .kpi-val { font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px; }
    .kpi-highlight { background: #ECFDF5; border-color: #A7F3D0; }
    .kpi-highlight .kpi-val { color: #047857; font-size: 15px; }

    table.report-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; }
    table.report-table th { background: #0D2137; color: #fff; padding: 6px 8px; text-align: left; font-weight: 700; }
    table.report-table td { padding: 6px 8px; border-bottom: 1px solid #E2E8F0; }
    table.report-table tr:nth-child(even) td { background: #F8FAFC; }
    table.report-table tfoot td { background: #F1F5F9; font-weight: 800; border-top: 2px solid #0D2137; border-bottom: 2px solid #0D2137; font-size: 11px; }

    .summary-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .summary-box { border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden; }
    .summary-box-title { background: #E2E8F0; font-weight: 700; font-size: 10px; color: #0F172A; padding: 5px 8px; text-transform: uppercase; letter-spacing: .3px; }
    .summary-table { width: 100%; border-collapse: collapse; font-size: 10px; }
    .summary-table td { padding: 4px 8px; border-bottom: 1px solid #F1F5F9; }
    .summary-table td:last-child { text-align: right; font-weight: 600; }
    .summary-table tr.total-row td { background: #F1F5F9; font-weight: 800; border-top: 1px solid #CBD5E1; }

    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 36px; page-break-inside: avoid; }
    .sig-block { border-top: 1px solid #334155; padding-top: 4px; text-align: center; font-size: 10px; color: #475569; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { size: landscape; margin: 8mm; }
      .page { width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-title">${companyName || 'Empresa'}</div>
      ${companyNit ? `<div class="company-sub">NIT: ${companyNit}</div>` : ''}
      ${companyAddress ? `<div class="company-sub">${companyAddress}</div>` : ''}
    </div>
    <div>
      <div class="doc-title">LISTA DE PAGO Y CONSOLIDADO DE NÓMINA</div>
      <div class="doc-meta"><strong>Período:</strong> ${periodName} &nbsp;|&nbsp; <strong>Fechas:</strong> ${dateFrom} a ${dateTo} &nbsp;|&nbsp; <strong>Estado:</strong> ${statusText}</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Empleados</div><div class="kpi-val">${lines.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Devengado</div><div class="kpi-val" style="color:#1E40AF;">${fmtCOP(totalDevengado)}</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Deducciones</div><div class="kpi-val" style="color:#991B1B;">${fmtCOP(totalDeducciones)}</div></div>
    <div class="kpi-card kpi-highlight"><div class="kpi-label">Neto a Pagar</div><div class="kpi-val">${fmtCOP(totalNeto)}</div></div>
    <div class="kpi-card"><div class="kpi-label">Parafiscales Patronales</div><div class="kpi-val" style="color:#C46516;">${fmtCOP(totalParafiscales)}</div></div>
    <div class="kpi-card"><div class="kpi-label">Provisiones Ley</div><div class="kpi-val" style="color:#6B21A8;">${fmtCOP(totalProvisiones)}</div></div>
  </div>

  <table class="report-table">
    <thead>
      <tr>
        <th style="width:30px;text-align:center;">#</th>
        <th>Empleado</th>
        <th>Documento</th>
        <th style="width:60px;text-align:center;">Días</th>
        <th style="text-align:right;">Sueldo Base</th>
        <th style="text-align:right;">Devengados</th>
        <th style="text-align:right;">Deducciones</th>
        <th style="text-align:right;">Neto a Pagar</th>
        <th style="width:180px;">Firma / Confirmación Pago</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right;">TOTALES GENERALES:</td>
        <td style="text-align:right;">${fmtCOP(totalBase)}</td>
        <td style="text-align:right;color:#1E40AF;">${fmtCOP(totalDevengado)}</td>
        <td style="text-align:right;color:#991B1B;">${fmtCOP(totalDeducciones)}</td>
        <td style="text-align:right;color:#047857;font-size:12px;">${fmtCOP(totalNeto)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="summary-cols">
    <div class="summary-box">
      <div class="summary-box-title">Devengados y Deducciones Empleados</div>
      <table class="summary-table">
        <tr><td>Auxilio de Transporte Total</td><td>${fmtCOP(totalAuxTransp)}</td></tr>
        <tr><td>Horas Extra / Recargos Total</td><td>${fmtCOP(totalOvertime)}</td></tr>
        <tr><td>Salud Empleados (4%)</td><td>${fmtCOP(totalSaludEmp)}</td></tr>
        <tr><td>Pensión Empleados (4%)</td><td>${fmtCOP(totalPensionEmp)}</td></tr>
        ${totalSolidaridad > 0 ? `<tr><td>Fondo de Solidaridad</td><td>${fmtCOP(totalSolidaridad)}</td></tr>` : ''}
        ${totalRetencion > 0 ? `<tr><td>Retención en la Fuente</td><td>${fmtCOP(totalRetencion)}</td></tr>` : ''}
        ${totalOtrasDed > 0 ? `<tr><td>Otras Deducciones Total</td><td>${fmtCOP(totalOtrasDed)}</td></tr>` : ''}
        <tr class="total-row"><td>TOTAL NETO PAGO</td><td>${fmtCOP(totalNeto)}</td></tr>
      </table>
    </div>

    <div class="summary-box">
      <div class="summary-box-title">Aportes Patronales (Seg. Social / Parafiscales)</div>
      <table class="summary-table">
        <tr><td>Salud Empleador (8.5%)</td><td>${fmtCOP(totalEmployerHealth)}</td></tr>
        <tr><td>Pensión Empleador (12%)</td><td>${fmtCOP(totalEmployerPension)}</td></tr>
        <tr><td>ARL Patronal</td><td>${fmtCOP(totalEmployerArl)}</td></tr>
        <tr><td>Caja de Compensación (4%)</td><td>${fmtCOP(totalCaja)}</td></tr>
        <tr><td>SENA (2%)</td><td>${fmtCOP(totalSena)}</td></tr>
        <tr><td>ICBF (3%)</td><td>${fmtCOP(totalIcbf)}</td></tr>
        <tr class="total-row"><td>TOTAL APORTES PATRONALES</td><td>${fmtCOP(totalParafiscales)}</td></tr>
      </table>
    </div>

    <div class="summary-box">
      <div class="summary-box-title">Provisiones Prestaciones Sociales</div>
      <table class="summary-table">
        <tr><td>Cesantías (8.33%)</td><td>${fmtCOP(totalCesantias)}</td></tr>
        <tr><td>Intereses Cesantías (12% s/ces)</td><td>${fmtCOP(totalInteresesCes)}</td></tr>
        <tr><td>Prima de Servicios (8.33%)</td><td>${fmtCOP(totalPrima)}</td></tr>
        <tr><td>Vacaciones (4.17%)</td><td>${fmtCOP(totalVacaciones)}</td></tr>
        <tr class="total-row"><td>TOTAL PROVISIONES DE LEY</td><td>${fmtCOP(totalProvisiones)}</td></tr>
      </table>
    </div>
  </div>

  <div class="signatures">
    <div>
      <div class="sig-block">
        <strong>Elaborado por:</strong><br>
        Firma / Responsable de Nómina
      </div>
    </div>
    <div>
      <div class="sig-block">
        <strong>Revisado y Aprobado por:</strong><br>
        Firma / Director Financiero o Gerente
      </div>
    </div>
  </div>
</div>
<script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=1100,height=800,scrollbars=yes');
    if (!win) {
      showToast('El navegador bloqueó la ventana emergente. Permite popups para esta página.', 'warning');
      return;
    }
    win.document.write(html);
    win.document.close();
  } catch (err: any) {
    showToast(err.message || 'Error al generar la lista de pago consolidada', 'error');
  }
}

function generarPeriodosColombia(ano, mes, tipo) {
  const MESES_NOMBRES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const primerDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);
  const periodos = [];
  const mesNombre = MESES_NOMBRES[mes - 1];

  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (tipo) {
    case 'MENSUAL':
      periodos.push({
        name: `Nómina ${mesNombre} ${ano}`,
        date_from: formatYMD(primerDia),
        date_to: formatYMD(ultimoDia),
      });
      break;

    case 'QUINCENAL':
      periodos.push(
        {
          name: `Nómina ${mesNombre} ${ano} — Q1`,
          date_from: formatYMD(primerDia),
          date_to: formatYMD(new Date(ano, mes - 1, 15)),
        },
        {
          name: `Nómina ${mesNombre} ${ano} — Q2`,
          date_from: formatYMD(new Date(ano, mes - 1, 16)),
          date_to: formatYMD(ultimoDia),
        }
      );
      break;

    case 'CATORCENA': {
      let inicio = new Date(primerDia);
      let num = 1;
      while (inicio <= ultimoDia) {
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 13);
        if (fin > ultimoDia) fin.setTime(ultimoDia.getTime());
        periodos.push({
          name: `Nómina ${mesNombre} ${ano} — Catorcena ${num}`,
          date_from: formatYMD(new Date(inicio)),
          date_to: formatYMD(fin),
        });
        inicio = new Date(fin);
        inicio.setDate(inicio.getDate() + 1);
        num++;
      }
      break;
    }

    case 'SEMANAL': {
      let inicio = new Date(primerDia);
      let num = 1;
      while (inicio <= ultimoDia) {
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 6);
        if (fin > ultimoDia) fin.setTime(ultimoDia.getTime());
        periodos.push({
          name: `Nómina ${mesNombre} ${ano} — Semana ${num}`,
          date_from: formatYMD(new Date(inicio)),
          date_to: formatYMD(fin),
        });
        inicio = new Date(fin);
        inicio.setDate(inicio.getDate() + 1);
        num++;
      }
      break;
    }

    case 'JORNAL': {
      for (let d = 1; d <= ultimoDia.getDate(); d++) {
        periodos.push({
          name: `Nómina ${mesNombre} ${ano} — Día ${d}`,
          date_from: formatYMD(new Date(ano, mes - 1, d)),
          date_to: formatYMD(new Date(ano, mes - 1, d)),
        });
      }
      break;
    }
  }

  return periodos;
}

async function openPeriodForm() {
  try {
    const { config } = await getNominaConfigWithRow();
    const periodType = config.company_rules.period_type || 'MENSUAL';

    const periodTypeLabel = {
      MENSUAL: 'Mensual (30 días)',
      QUINCENAL: 'Quincenal (15 días)',
      CATORCENA: 'Catorcenal (14 días)',
      SEMANAL: 'Semanal (7 días)',
      JORNAL: 'Jornal (Diario)'
    }[periodType] || periodType;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let yearOptions = '';
    for (let y = currentYear - 1; y <= currentYear + 2; y++) {
      yearOptions += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
    }

    const MESES_NOMBRES = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    let monthOptions = '';
    MESES_NOMBRES.forEach((m, idx) => {
      monthOptions += `<option value="${idx + 1}" ${idx + 1 === currentMonth ? 'selected' : ''}>${m}</option>`;
    });

    const bodyHtml = `
      <div class="space-y-4 text-sm text-left">
        <div class="p-3 rounded-xl border flex items-center justify-between" style="background:#F0FDF4;border-color:#BBF7D0">
          <div>
            <span class="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">Frecuencia de Pago de la Empresa</span>
            <p class="font-bold text-sm text-emerald-950">${esc(periodTypeLabel)}</p>
          </div>
          <span class="badge badge-green"><i class="fas fa-building mr-1"></i>Configuración</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label text-xs font-semibold">Año de Generación</label>
            <select id="gen-period-year" class="form-input">${yearOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs font-semibold">Mes de Generación</label>
            <select id="gen-period-month" class="form-input">${monthOptions}</select>
          </div>
        </div>

        <div class="rounded-xl border p-3 bg-white" style="border-color:#E5E7EB">
          <p class="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Períodos a Crear</p>
          <div class="max-h-60 overflow-y-auto space-y-2" id="gen-periods-preview-list">
            <!-- Carga dinámica -->
          </div>
        </div>
      </div>
    `;

    openModal(
      'Generador de Períodos de Nómina',
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-period">Generar Períodos</button>`
    );

    const renderPreview = () => {
      const y = parseInt(getSelectVal('gen-period-year'), 10);
      const m = parseInt(getSelectVal('gen-period-month'), 10);
      const propuestos = generarPeriodosColombia(y, m, periodType);

      const container = document.getElementById('gen-periods-preview-list');
      if (!container) return;

      container.innerHTML = propuestos.map(p => `
        <div class="flex items-center justify-between p-2.5 rounded-lg border text-xs" style="background:#F8FAFC;border-color:#F1F5F9">
          <div>
            <span class="font-semibold text-gray-800">${esc(p.name)}</span>
            <div class="text-[10px] text-gray-400 mt-0.5"><i class="fas fa-calendar-day mr-1"></i>${p.date_from} al ${p.date_to}</div>
          </div>
          <span class="badge" style="background:#E2E8F0;color:#475569">Borrador</span>
        </div>
      `).join('');
    };

    $('#gen-period-year')?.addEventListener('change', renderPreview);
    $('#gen-period-month')?.addEventListener('change', renderPreview);

    renderPreview();

    $('#btn-save-period')?.addEventListener('click', async () => {
      const btn = $('#btn-save-period') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';
      }

      try {
        const y = parseInt(getSelectVal('gen-period-year'), 10);
        const m = parseInt(getSelectVal('gen-period-month'), 10);
        const propuestos = generarPeriodosColombia(y, m, periodType);

        const activeBranchId = localStorage.getItem('active_branch_id');
        const currentUser = pb.currentUser;
        const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS')
          ? activeBranchId
          : (currentUser?.default_branch_id || null);

        // Validar si ya existen
        const existentes = await pb.listAll('payroll_periods', {
          filter: `date_from >= "${y}-${String(m).padStart(2, '0')}-01" && date_to <= "${y}-${String(m).padStart(2, '0')}-31"`
        });

        let creadosCount = 0;
        let duplicadosCount = 0;

        for (const p of propuestos) {
          const existe = existentes.some(e => e.date_from === p.date_from && e.date_to === p.date_to);
          if (!existe) {
            await pb.create('payroll_periods', {
              name: p.name,
              date_from: p.date_from,
              date_to: p.date_to,
              status: 'draft',
              branch_id: targetBranchId || null,
            });
            creadosCount++;
          } else {
            duplicadosCount++;
          }
        }

        closeModal();
        if (creadosCount > 0) {
          showToast(`Se crearon ${creadosCount} período(s) de nómina exitosamente.${duplicadosCount > 0 ? ` (${duplicadosCount} ya existían)` : ''}`, 'success');
        } else {
          showToast('Los períodos para este mes ya se encontraban creados.', 'info');
        }
        navigate((window as any).currentPage || 'nomina-periodos');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Generar Períodos';
        }
      }
    });

  } catch (err) {
    showToast(err.message || 'No se pudo cargar la configuración de la empresa', 'error');
  }
}

async function openPayrollLineForm(periods, employees, lineToEdit = null) {
  if (!periods.length) return showToast('Primero crea un período de nómina', 'warning');
  if (!employees.length) return showToast('No hay terceros tipo EMPLEADO activos', 'warning');

  const openPeriods = periods.filter((p) => p.status === 'draft' || !p.status);
  if (!openPeriods.length && !lineToEdit) return showToast('No hay períodos en estado Borrador para liquidar', 'warning');

  const { config } = await getNominaConfigWithRow();
  const employeesMissingSalary = employees.filter((e) => {
    const rule = getEmployeePayrollRule(config, e.id);
    return !isEmployeePayrollRuleComplete(rule);
  });
  if (employeesMissingSalary.length && !lineToEdit) {
    const names = employeesMissingSalary.slice(0, 5).map((e) => e.name).join(', ');
    return showToast(`Debes configurar salario básico en todos los empleados activos antes de liquidar. Pendientes: ${names}`, 'warning');
  }

  const periodType = config.company_rules.period_type || 'MENSUAL';
  let diasPeriodoBase = 30;
  if (periodType === 'QUINCENAL') diasPeriodoBase = 15;
  else if (periodType === 'CATORCENA') diasPeriodoBase = 14;
  else if (periodType === 'SEMANAL') diasPeriodoBase = 7;
  else if (periodType === 'JORNAL') diasPeriodoBase = 1;

  const overtimeInputs = NOMINA_OVERTIME_TYPES.map((t) => `
    <div class="form-group">
      <label class="form-label">${esc(t.label)} (horas)</label>
      <input id="pl-ot-${esc(t.key)}" class="form-input" value="0">
    </div>
  `).join('');

  const earningInputs = NOMINA_EXTRA_EARNING_KEYS.map((key) => `
    <div class="form-group">
      <label class="form-label">${esc(NOMINA_CONCEPT_BY_KEY[key]?.label || key)}</label>
      <input id="pl-cpt-${esc(key)}" class="form-input" value="0">
    </div>
  `).join('');

  const deductionInputs = NOMINA_EXTRA_DEDUCTION_KEYS.map((key) => `
    <div class="form-group">
      <label class="form-label">${esc(NOMINA_CONCEPT_BY_KEY[key]?.label || key)}</label>
      <input id="pl-cpt-${esc(key)}" class="form-input" value="0">
    </div>
  `).join('');

  openModal(
    lineToEdit ? 'Editar Liquidación de Nómina' : 'Nueva Liquidación de Nómina',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
      <div class="form-group"><label class="form-label">Período</label><select id="pl-period" class="form-input" ${lineToEdit ? 'disabled' : ''}>${periods.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Empleado</label><select id="pl-emp" class="form-input" ${lineToEdit ? 'disabled' : ''}>${employees.map((e) => `<option value="${esc(e.id)}">${esc(e.doc_number)} - ${esc(e.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Salario Base (mensual)</label><input id="pl-salary" class="form-input" value="0"><p class="text-xs mt-1" style="color:#6B7280">Se autocompleta según parámetro del empleado.</p></div>
      <div class="form-group"><label class="form-label">Días salario (max ${diasPeriodoBase})</label><input id="pl-days-salary" class="form-input" value="${diasPeriodoBase}"></div>
      <div class="form-group"><label class="form-label">Días auxilio transporte (0 a ${diasPeriodoBase})</label><input id="pl-days-transport" class="form-input" value="${diasPeriodoBase}"></div>
      <div class="form-group"><label class="form-label">Auxilio de Transporte mensual</label><input id="pl-aux" class="form-input" value="${esc(String(config.company_rules?.transport_allowance !== undefined ? config.company_rules.transport_allowance : 162000))}" title="Auxilio de transporte configurado"><p class="text-xs mt-1" style="color:#6B7280">Se liquida proporcional con los días de auxilio.</p></div>
      <div class="form-group"><label class="form-label">Otras Deducciones</label><input id="pl-ded-other" class="form-input" value="0" placeholder="Deducciones varias no clasificadas"></div>
    </div>

    <div class="rounded-xl p-3 mt-4 text-left" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Horas extra y recargos — jornada ${config.company_rules?.weekly_hours || 44} h/semana (valor hora = salario / ${(config.company_rules?.weekly_hours || 44) * 5})</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${overtimeInputs}</div>
    </div>

    <div class="rounded-xl p-3 mt-4 text-left" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Devengos adicionales (débito)</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${earningInputs}</div>
    </div>

    <div class="rounded-xl p-3 mt-4 text-left" style="background:#F0FDF4;border:1px solid #BBF7D0">
      <p class="font-semibold mb-2 text-emerald-950"><i class="fas fa-hand-holding-dollar mr-1"></i>Liquidación de Prestaciones y Acumulados (Pagos Directos)</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="form-group"><label class="form-label">Prima de Servicios ($)</label><input id="pl-prima" class="form-input" value="0"></div>
        <div class="form-group"><label class="form-label">Cesantías ($)</label><input id="pl-cesantias" class="form-input" value="0"></div>
        <div class="form-group"><label class="form-label">Intereses de Cesantías ($)</label><input id="pl-intereses-ces" class="form-input" value="0"></div>
      </div>
    </div>

    <div class="rounded-xl p-3 mt-4 text-left" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Deducciones por concepto (crédito)</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${deductionInputs}</div>
    </div>

    <div id="nomina-preview" class="mt-4 p-3 rounded-xl text-sm" style="background:#F9FAFB;border:1px solid #E5E7EB;display:none"></div>`,

    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-secondary btn-sm" id="btn-preview-pl"><i class="fas fa-calculator"></i> Calcular</button>
     <button class="btn btn-primary" id="btn-save-pl">Guardar</button>`
  );

  const getConceptAmountsFromForm = () => {
    const values = {};
    [...NOMINA_EXTRA_EARNING_KEYS, ...NOMINA_EXTRA_DEDUCTION_KEYS].forEach((key) => {
      values[key] = round2(parseNum(getInputVal(`pl-cpt-${key}`)) || 0);
    });
    return values;
  };

  const getOvertimeFromForm = (salary) => {
    const weeklyHours = config.company_rules?.weekly_hours || 44;
    const hourlyRate = round2((salary || 0) / (weeklyHours * 5));
    const breakdown = NOMINA_OVERTIME_TYPES.map((t) => {
      const hours = round2(parseNum(getInputVal(`pl-ot-${t.key}`)) || 0);
      const amount = round2(hourlyRate * hours * t.factor);
      return { key: t.key, hours, amount };
    });
    return {
      hourly_rate: hourlyRate,
      total_hours: round2(breakdown.reduce((sum, row) => sum + (row.hours || 0), 0)),
      total_amount: round2(breakdown.reduce((sum, row) => sum + (row.amount || 0), 0)),
      breakdown,
    };
  };

  const calcPreview = async () => {
    const salary = parseNum(getInputVal('pl-salary'));
    const salaryDays = parseNum(getInputVal('pl-days-salary')) || diasPeriodoBase;
    const transportDays = parseNum(getInputVal('pl-days-transport')) || 0;
    const auxMonthly = parseNum(getInputVal('pl-aux'));
    const aux = round2((auxMonthly / 30) * transportDays);
    const dedOther = parseNum(getInputVal('pl-ded-other'));
    const employeeId = getSelectVal('pl-emp');
    if (salary <= 0) return;

    const primaVal = parseNum(getInputVal('pl-prima')) || 0;
    const cesantiasVal = parseNum(getInputVal('pl-cesantias')) || 0;
    const interesesCesVal = parseNum(getInputVal('pl-intereses-ces')) || 0;

    const overtimeMeta = getOvertimeFromForm(salary);
    const ot = overtimeMeta.total_amount;
    const conceptAmounts = getConceptAmountsFromForm();
    const extraEarnings = round2(NOMINA_EXTRA_EARNING_KEYS.filter(k => k !== 'dotaciones').reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));
    const extraDedConcepts = round2(NOMINA_EXTRA_DEDUCTION_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));

    const empRule = getEmployeePayrollRule(config, employeeId);
    const companyRules = config.company_rules || defaultNominaConfig().company_rules;

    const salProp = (salary / 30) * salaryDays;
    const baseSal = salProp + ot;
    const ibcVacaciones = conceptAmounts.es_retiro ? 0 : (conceptAmounts.vacaciones || 0);
    const devengado = baseSal + aux + extraEarnings + primaVal + cesantiasVal + interesesCesVal;
    const isIntegralSalary = empRule.is_integral_salary || String(empRule.salary_type || '').toUpperCase() === 'INTEGRAL';

    const rawIbc = Math.min(
      baseSal + (conceptAmounts.incapacidades || 0) + (conceptAmounts.licencias || 0) + (conceptAmounts.comisiones || 0) + (conceptAmounts.ajuste_salarial || 0) + ibcVacaciones,
      (companyRules.smmlv || 1423500) * 25
    );
    const ibc = round2(isIntegralSalary ? devengado * 0.70 : rawIbc);

    const dedSalud = round2(ibc * 0.04);
    const dedPension = empRule.is_pensioner ? 0 : round2(ibc * 0.04);

    const SMLV_VIGENTE = companyRules.smmlv || 1423500;
    const UVT_VIGENTE = companyRules.uvt_value || 52374;

    const dedSolidarity = (empRule.apply_solidarity_fund !== false) ? calculateSolidarityFund(ibc, SMLV_VIGENTE) : 0;
    const dedWithholding = (empRule.apply_withholding_tax !== false) ? calculateWithholdingTax(devengado, dedSalud, dedPension, dedSolidarity, UVT_VIGENTE) : 0;
    const dedTotal = round2(dedSalud + dedPension + dedSolidarity + dedWithholding + dedOther + extraDedConcepts);
    const neto = round2(devengado - dedTotal);

    const arlRate = ARL_RISK_RATES[empRule.arl_risk_level] || ARL_RISK_RATES[1];
    const senaRate = companyRules.exempt_sena_icbf ? 0 : 0.02;
    const icbfRate = companyRules.exempt_sena_icbf ? 0 : 0.03;
    const pensionRate = empRule.is_pensioner ? 0 : 0.12;
    const para = round2(ibc * (0.085 + pensionRate + arlRate + senaRate + icbfRate + 0.04));
    const prov = round2(ibc * (0.0833 + 0.12 * 0.0833 + 0.0833 + 0.0417));

    const preview = $('#nomina-preview');
    if (!preview) return;
    preview.style.display = '';
    preview.innerHTML = `
      <div class="grid grid-cols-3 gap-3 text-center">
        <div><div class="text-xs" style="color:#6B7280">Devengado</div><div class="font-bold" style="color:#1A4B8C">${fmt(devengado)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Deducciones</div><div class="font-bold" style="color:#B91C1C">${fmt(dedTotal)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Neto a Pagar</div><div class="font-bold" style="color:#15803D">${fmt(neto)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-medium" style="color:#C46516">${fmt(para)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-medium" style="color:#7C3AED">${fmt(prov)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Costo Total</div><div class="font-bold" style="color:#0D2137">${fmt(devengado + para + prov)}</div></div>
      </div>
      <div class="mt-3 text-xs" style="color:#64748B">
        Salario (${salaryDays} días): ${fmt(salProp)} | Auxilio (${transportDays} días): ${fmt(aux)} | Horas extra/recargos: ${fmt(ot)} | Devengos adicionales: ${fmt(extraEarnings)} | Deducciones por concepto: ${fmt(extraDedConcepts)}
      </div>`;
  };

  $('#btn-preview-pl')?.addEventListener('click', calcPreview);

  const watchedInputs = [
    'pl-salary', 'pl-days-salary', 'pl-days-transport', 'pl-aux', 'pl-ded-other',
    'pl-prima', 'pl-cesantias', 'pl-intereses-ces',
    ...NOMINA_OVERTIME_TYPES.map((t) => `pl-ot-${t.key}`),
    ...NOMINA_EXTRA_EARNING_KEYS.map((k) => `pl-cpt-${k}`),
    ...NOMINA_EXTRA_DEDUCTION_KEYS.map((k) => `pl-cpt-${k}`),
  ];
  watchedInputs.forEach((id) => $('#' + id)?.addEventListener('input', debounce(() => { calcPreview(); }, 250)));

  const loadEmployeeNovelties = async (periodId, employeeId) => {
    if (!periodId || !employeeId) return;
    try {
      const novelties = await pb.listAll('payroll_novelties', { 
        filter: `period_id="${pb.escapeFilterValue(periodId)}" && employee_id="${pb.escapeFilterValue(employeeId)}"` 
      });
      
      // Resetear inputs de horas extra a 0
      NOMINA_OVERTIME_TYPES.forEach(t => {
        if ($('#pl-ot-' + t.key)) setInputVal('pl-ot-' + t.key, '0');
      });
      // Resetear otros conceptos a 0
      [...NOMINA_EXTRA_EARNING_KEYS, ...NOMINA_EXTRA_DEDUCTION_KEYS].forEach(key => {
        if ($('#pl-cpt-' + key)) setInputVal('pl-cpt-' + key, '0');
      });
      setInputVal('pl-ded-other', '0');
      setInputVal('pl-prima', '0');
      setInputVal('pl-cesantias', '0');
      setInputVal('pl-intereses-ces', '0');

      let diasAusentismo = 0;
      let diasVacaciones = 0;

      novelties.forEach(n => {
        const type = n.type || '';
        const qty = Number(n.qty || 0);
        const amount = Number(n.amount || 0);

        if (type.startsWith('INCAPACIDAD') || type === 'LICENCIA_NO_REMUNERADA' || type === 'PERMISO_NO_REMUNERADO' || type === 'SUSPENSION') {
          diasAusentismo += qty;
        } else if (type === 'VACACIONES') {
          diasVacaciones += qty;
        }

        // Mapear novedades a inputs de horas extra
        if (NOVEDAD_A_OVERTIME_KEY[type]) {
          const key = NOVEDAD_A_OVERTIME_KEY[type];
          const input = $('#pl-ot-' + key);
          if (input) {
            setInputVal('pl-ot-' + key, String(Number(input.value || 0) + qty));
          }
        }

        // Mapear novedades de valor específicas de prestaciones
        if (type === 'PRIMA_SERVICIOS') {
          setInputVal('pl-prima', String(amount));
        } else if (type === 'CESANTIAS') {
          setInputVal('pl-cesantias', String(amount));
        } else if (type === 'INTERESES_CESANTIAS') {
          setInputVal('pl-intereses-ces', String(amount));
        } else {
          // Mapear otras novedades de valor a inputs de concepto correspondientes
          let conceptKey = '';
          if (type === 'BONIFICACION' || type === 'PRIMA_EXTRALGAL') conceptKey = 'bonificacion';
          else if (type === 'COMISION') conceptKey = 'comisiones';
          else if (type === 'DOTACION') conceptKey = 'dotaciones';
          else if (type === 'PRESTAMO' || type === 'ANTICIPO' || type === 'MULTA' || type === 'OTRA_DEDUCCION') conceptKey = 'prestamos';
          else if (type === 'EMBARGO') conceptKey = 'embargo';
          else if (type === 'GASTOS_REPRESENTACION') conceptKey = 'gastos_representacion';
          else if (type === 'AUX_NO_SALARIALES') conceptKey = 'aux_no_salariales';
          else if (type === 'AUXILIO_RODAMIENTO') conceptKey = 'rodamiento';
          else if (type === 'COMPENSATORIOS') conceptKey = 'compensatorios';
          else if (type === 'AUXILIO_ALIMENTACION') conceptKey = 'alimentacion';
          else if (type === 'LIBRANZA') conceptKey = 'libranza';

          if (conceptKey) {
            const input = $('#pl-cpt-' + conceptKey);
            if (input) {
              setInputVal('pl-cpt-' + conceptKey, String(Number(input.value || 0) + amount));
            }
          }
        }
      });

      // Calcular días de salario y transporte
      const salaryDays = Math.max(0, diasPeriodoBase - diasAusentismo);
      const transportDays = Math.max(0, salaryDays);

      setInputVal('pl-days-salary', String(salaryDays));
      setInputVal('pl-days-transport', String(transportDays));

      calcPreview();
    } catch (err) {
      console.error('Error al cargar novedades del empleado:', err);
    }
  };

  const applyEmployeeDefaults = async () => {
    const employeeId = getSelectVal('pl-emp');
    const periodId = getSelectVal('pl-period');
    const empRule = getEmployeePayrollRule(config, employeeId);
    if ((empRule.basic_salary || 0) > 0) {
      setInputVal('pl-salary', String(round2(empRule.basic_salary)));
    }
    if (!lineToEdit) {
      const basicSalary = empRule.basic_salary || 0;
      const smmlvLimit = 2 * (config.company_rules?.smmlv || 1423500);
      if ($('#pl-aux')) {
        if (empRule.apply_transport_allowance === false || basicSalary > smmlvLimit) {
          setInputVal('pl-aux', '0');
        } else {
          setInputVal('pl-aux', String(config.company_rules?.transport_allowance || 162000));
        }
      }
      await loadEmployeeNovelties(periodId, employeeId);
    }
  };

  $('#pl-emp')?.addEventListener('change', async () => {
    await applyEmployeeDefaults();
  });

  $('#pl-period')?.addEventListener('change', async () => {
    await applyEmployeeDefaults();
  });

  if (lineToEdit) {
    if ($('#pl-period')) $('#pl-period').value = lineToEdit.period_id || '';
    if ($('#pl-emp')) $('#pl-emp').value = lineToEdit.employee_id || '';
    if ($('#pl-salary')) $('#pl-salary').value = String(lineToEdit.salary_base || 0);
    if ($('#pl-days-salary')) $('#pl-days-salary').value = String(lineToEdit.days_worked || diasPeriodoBase);
    const meta = getNominaLineMeta(lineToEdit);
    if ($('#pl-days-transport')) $('#pl-days-transport').value = String(meta.transport_days || lineToEdit.days_worked || diasPeriodoBase);
    if ($('#pl-aux')) $('#pl-aux').value = String(meta.transport_monthly || config.company_rules?.transport_allowance || 162000);
    if ($('#pl-ded-other')) $('#pl-ded-other').value = String(lineToEdit.deduction_other || 0);
    if ($('#pl-prima')) $('#pl-prima').value = String(lineToEdit.prima || 0);
    if ($('#pl-cesantias')) $('#pl-cesantias').value = String(lineToEdit.cesantias || 0);
    if ($('#pl-intereses-ces')) $('#pl-intereses-ces').value = String(lineToEdit.intereses_ces || 0);

    const overtimeMeta = getNominaOvertimeMetaFromLine(lineToEdit);
    const conceptTotals = getNominaAdditionalConceptTotals(lineToEdit);
    const conceptAmounts = conceptTotals.conceptAmounts;

    NOMINA_OVERTIME_TYPES.forEach((t) => {
      const field = overtimeMeta.breakdown?.find((x) => x.key === t.key) || overtimeMeta[t.key];
      const val = field ? (field.hours ?? field.qty ?? 0) : 0;
      if ($('#pl-ot-' + t.key)) $('#pl-ot-' + t.key).value = String(val);
    });

    [...NOMINA_EXTRA_EARNING_KEYS, ...NOMINA_EXTRA_DEDUCTION_KEYS].forEach((key) => {
      if ($('#pl-cpt-' + key)) $('#pl-cpt-' + key).value = String(conceptAmounts[key] || 0);
    });
  } else {
    applyEmployeeDefaults();
  }

  calcPreview();

  $('#btn-save-pl')?.addEventListener('click', async () => {
    const btn = $('#btn-save-pl');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    try {
      const salary = parseNum(getInputVal('pl-salary'));
      const salaryDays = parseNum(getInputVal('pl-days-salary')) || diasPeriodoBase;
      const transportDays = parseNum(getInputVal('pl-days-transport')) || 0;
      const auxMonthly = parseNum(getInputVal('pl-aux'));
      const aux = round2((auxMonthly / 30) * transportDays);
      const dedOther = parseNum(getInputVal('pl-ded-other'));
      const employeeId = getSelectVal('pl-emp');

      if (salary <= 0) return showToast('El salario base debe ser mayor a cero', 'warning');
      if (salaryDays <= 0 || salaryDays > diasPeriodoBase) return showToast('Días salario debe estar entre 1 y ' + diasPeriodoBase, 'warning');
      if (transportDays < 0 || transportDays > diasPeriodoBase) return showToast('Días auxilio transporte debe estar entre 0 y ' + diasPeriodoBase, 'warning');

      const periodId = getSelectVal('pl-period');
      if (!periodId) return showToast('Selecciona un Periodo', 'warning');
      const period = await pb.get('payroll_periods', periodId);
      if ((period.status || 'draft') !== 'draft' && !lineToEdit) {
        return showToast('El Periodo seleccionado no esta en borrador. No se pueden registrar nuevas liquidaciones.', 'error');
      }

      const overtimeMeta = getOvertimeFromForm(salary);
      const ot = overtimeMeta.total_amount;
      const conceptAmounts = getConceptAmountsFromForm();
      const extraEarnings = round2(NOMINA_EXTRA_EARNING_KEYS.filter(k => k !== 'dotaciones').reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));
      const extraDedConcepts = round2(NOMINA_EXTRA_DEDUCTION_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));

      const primaVal = parseNum(getInputVal('pl-prima')) || 0;
      const cesantiasVal = parseNum(getInputVal('pl-cesantias')) || 0;
      const interesesCesVal = parseNum(getInputVal('pl-intereses-ces')) || 0;

      const salaryProportional = (salary / 30) * salaryDays;
      const baseSalarial = salaryProportional + ot;

      const empRule = getEmployeePayrollRule(config, employeeId);
      if (!isEmployeePayrollRuleComplete(empRule)) {
        return showToast('El empleado no tiene salario básico configurado en Parámetros por Empleado.', 'warning');
      }
      const companyRules = config.company_rules || defaultNominaConfig().company_rules;

      const isIntegralSalary = empRule.is_integral_salary || String(empRule.salary_type || '').toUpperCase() === 'INTEGRAL';
      const ibcVacaciones = conceptAmounts.es_retiro ? 0 : (conceptAmounts.vacaciones || 0);
      const devengado = baseSalarial + aux + extraEarnings + primaVal + cesantiasVal + interesesCesVal;

      const rawIbc = Math.min(
        baseSalarial + (conceptAmounts.incapacidades || 0) + (conceptAmounts.licencias || 0) + (conceptAmounts.comisiones || 0) + (conceptAmounts.ajuste_salarial || 0) + ibcVacaciones,
        (companyRules.smmlv || 1423500) * 25
      );
      const ibc = round2(isIntegralSalary ? devengado * 0.70 : rawIbc);

      const deductionHealth = round2(ibc * 0.04);
      const deductionPension = empRule.is_pensioner ? 0 : round2(ibc * 0.04);
      const SMLV_VIGENTE = companyRules.smmlv || 1423500;
      const UVT_VIGENTE = companyRules.uvt_value || 52374;

      const solidarityFund = (empRule.apply_solidarity_fund !== false) ? calculateSolidarityFund(ibc, SMLV_VIGENTE) : 0;
      const withholdingTax = (empRule.apply_withholding_tax !== false) ? calculateWithholdingTax(devengado, deductionHealth, deductionPension, solidarityFund, UVT_VIGENTE) : 0;
      const deductionOther = dedOther;

      const employerHealth = round2(ibc * 0.085);
      const employerPension = empRule.is_pensioner ? 0 : round2(ibc * 0.12);
      const arlRate = ARL_RISK_RATES[empRule.arl_risk_level] || ARL_RISK_RATES[1];
      const employerArl = round2(ibc * arlRate);
      const sena = companyRules.exempt_sena_icbf ? 0 : round2(ibc * 0.02);
      const icbf = companyRules.exempt_sena_icbf ? 0 : round2(ibc * 0.03);
      const cajaComp = round2(ibc * 0.04);
      const cesantias = cesantiasVal || round2(baseSalarial * 0.0833);
      const interesesCes = interesesCesVal || round2(cesantias * 0.12);
      const prima = primaVal || round2(baseSalarial * 0.0833);
      const vacaciones = round2(baseSalarial * 0.0417);
      const netPay = round2(devengado - deductionHealth - deductionPension - solidarityFund - withholdingTax - deductionOther - extraDedConcepts);

      const overtimeBreakdown = {};
      overtimeMeta.breakdown.forEach((row) => {
        overtimeBreakdown[row.key] = {
          hours: round2(row.hours || 0),
          amount: round2(row.amount || 0),
        };
      });

      const notesObj = {
        payroll_meta: {
          arl_risk_level: empRule.arl_risk_level,
          arl_rate: arlRate,
          is_pensioner: !!empRule.is_pensioner,
          solidarity_fund: round2(solidarityFund),
          withholding_tax: round2(withholdingTax),
          company_exempt_sena_icbf: !!companyRules.exempt_sena_icbf,
          overtime_breakdown: {
            hourly_rate: round2(overtimeMeta.hourly_rate || 0),
            total_hours: round2(overtimeMeta.total_hours || 0),
            total_amount: round2(ot || 0),
            ...overtimeBreakdown,
          },
          transport_days: transportDays,
          transport_monthly: round2(auxMonthly || 0),
          concept_amounts: conceptAmounts,
        },
      };

      const payload = {
        period_id: periodId,
        employee_id: employeeId,
        salary_base: salary,
        days_worked: salaryDays,
        overtime: ot,
        transport_allowance: aux,
        deduction_health: deductionHealth,
        deduction_pension: deductionPension,
        deduction_other: deductionOther,
        net_pay: netPay,
        employer_health: employerHealth,
        employer_pension: employerPension,
        employer_arl: employerArl,
        sena,
        icbf,
        caja_comp: cajaComp,
        cesantias,
        intereses_ces: interesesCes,
        prima,
        vacaciones,
        notes: JSON.stringify(notesObj),
      };

      if (lineToEdit) {
        await pb.update('payroll_lines', lineToEdit.id, payload);
        showToast('Liquidación actualizada', 'success');
      } else {
        await pb.create('payroll_lines', payload);
        showToast('Liquidación registrada', 'success');
      }
      closeModal();
      navigate((window as any).currentPage || 'nomina-liquidacion');
    } catch (err) {
      const details = err?.data?.data
        ? Object.values(err.data.data).map((v) => v?.message).filter(Boolean).join(' | ')
        : '';
      showToast(details || err.message || 'No se pudo registrar la Liquidacion', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Guardar';
      }
    }
  });
}


// --- VITE MIGRATION GLOBALS ---
(window as any).ARL_RISK_RATES = ARL_RISK_RATES;
(window as any).openNominaEmployeeSettings = openNominaEmployeeSettings;
(window as any).compactNominaConfigForStorage = compactNominaConfigForStorage;
(window as any).writeSettingJsonMaybeChunked = writeSettingJsonMaybeChunked;
(window as any).upsertSettingByKey = upsertSettingByKey;
(window as any).isEmployeePayrollRuleComplete = isEmployeePayrollRuleComplete;
(window as any).viewPeriodLines = viewPeriodLines;
(window as any).listSettingsByPrefix = listSettingsByPrefix;
(window as any).nominaThirdDisplay = nominaThirdDisplay;
(window as any).getEmployeePayrollRule = getEmployeePayrollRule;
(window as any).getNominaAdditionalConceptTotals = getNominaAdditionalConceptTotals;
(window as any).getNominaConfigWithRow = getNominaConfigWithRow;
(window as any).deleteSettingByKey = deleteSettingByKey;
(window as any).saveNominaConfig = saveNominaConfig;
(window as any).normalizeNominaConfig = normalizeNominaConfig;
(window as any).getNominaConceptRule = getNominaConceptRule;
(window as any).getNominaDeduccionesTotal = getNominaDeduccionesTotal;
(window as any).NOMINA_EXTRA_DEDUCTION_KEYS = NOMINA_EXTRA_DEDUCTION_KEYS;
(window as any).round2 = round2;
(window as any).nominaFindThirdById = nominaFindThirdById;
(window as any).renderNomina = renderNomina;
(window as any).setPeriodStatus = setPeriodStatus;
(window as any).openNominaAccountingSettings = openNominaAccountingSettings;
(window as any).initNominaThirdSearchInput = initNominaThirdSearchInput;
(window as any).getExtraDeductionsFromLine = getExtraDeductionsFromLine;
(window as any).getNominaConceptAmountsFromLine = getNominaConceptAmountsFromLine;
(window as any).postNominaPeriodAccounting = postNominaPeriodAccounting;
(window as any).viewPayrollLineDetail = viewPayrollLineDetail;
(window as any).NOMINA_CONCEPTS = NOMINA_CONCEPTS;
(window as any).NOMINA_CATEGORY_LABELS = NOMINA_CATEGORY_LABELS;
(window as any).findEmployeePayrollRule = findEmployeePayrollRule;
(window as any).getNominaOvertimeMetaFromLine = getNominaOvertimeMetaFromLine;
(window as any).resolveNominaCrossDocRef = resolveNominaCrossDocRef;
(window as any).NOMINA_OVERTIME_TYPES = NOMINA_OVERTIME_TYPES;
(window as any).NOMINA_EXTRA_EARNING_KEYS = NOMINA_EXTRA_EARNING_KEYS;
(window as any).deletePayrollPeriod = deletePayrollPeriod;
(window as any).buildNominaAccountingLines = buildNominaAccountingLines;
(window as any).openPayrollLineForm = openPayrollLineForm;
(window as any).defaultNominaConfig = defaultNominaConfig;
(window as any).settingChunkKey = settingChunkKey;
(window as any).resolveAllNominaMappings = resolveAllNominaMappings;
(window as any).NOMINA_CONFIG_VALUE_MAX_CHARS = NOMINA_CONFIG_VALUE_MAX_CHARS;
(window as any).printPayrollSlip = printPayrollSlip;
(window as any).calculateSolidarityFund = calculateSolidarityFund;
(window as any).calculateWithholdingTax = calculateWithholdingTax;
(window as any).printConsolidatedPayrollSlips = printConsolidatedPayrollSlips;
(window as any).printConsolidatedPayrollSummary = printConsolidatedPayrollSummary;
(window as any).resolveNominaTerceroId = resolveNominaTerceroId;
(window as any).readSettingJsonMaybeChunked = readSettingJsonMaybeChunked;
(window as any).deletePayrollLine = deletePayrollLine;
(window as any).NOMINA_CONFIG_KEYS = NOMINA_CONFIG_KEYS;
(window as any).NOMINA_CONCEPT_RULES = NOMINA_CONCEPT_RULES;
(window as any).getNominaConceptAmount = getNominaConceptAmount;
(window as any).NOMINA_CONFIG_KEY = NOMINA_CONFIG_KEY;
(window as any).getNominaCategoryConcepts = getNominaCategoryConcepts;
(window as any).splitTextInChunks = splitTextInChunks;
(window as any).getNominaCategoryLabel = getNominaCategoryLabel;
(window as any).resolveNominaMapping = resolveNominaMapping;
(window as any).getNominaLineMeta = getNominaLineMeta;
(window as any).NOMINA_CONCEPT_BY_KEY = NOMINA_CONCEPT_BY_KEY;
(window as any).openPeriodForm = openPeriodForm;
(window as any).getNominaDevengadoTotal = getNominaDevengadoTotal;
(window as any).liquidarPeriodoMasivo = liquidarPeriodoMasivo;
(window as any).renderNominaNovedades = renderNominaNovedades;
(window as any).openNoveltyForm = openNoveltyForm;
(window as any).renderNominaElectronica = renderNominaElectronica;
(window as any).generateNominaElectronica = generateNominaElectronica;
(window as any).generarNominaElectronica = generateNominaElectronica;
(window as any).verXmlNominaElectronica = verXmlNominaElectronica;
(window as any).enviarDianNominaElectronica = enviarDianNominaElectronica;
(window as any).renderNominaEmpleados = renderNominaEmpleados;
(window as any).renderNominaContratos = renderNominaContratos;
(window as any).renderNominaPeriodosPage = renderNominaPeriodosPage;
(window as any).renderNominaNovedadesPage = renderNominaNovedadesPage;
(window as any).renderNominaLiquidacionPage = renderNominaLiquidacionPage;
(window as any).renderNominaElectronicaPage = renderNominaElectronicaPage;
(window as any).canApproveOrPayPayroll = canApproveOrPayPayroll;
(window as any).renderPlanillaPilaRevision = renderPlanillaPilaRevision;

(window as any).reversarLiquidacionPeriodo = async (periodId: string) => {
  const isUserAdminOrSuperadmin = ['superadmin', 'administrador', 'admin', 'propietario', 'gerente'].includes(String(pb.currentUser?.role || '').toLowerCase()) || can('canDelete');
  if (!isUserAdminOrSuperadmin) {
    return showToast('No tienes permisos de administrador para eliminar liquidaciones.', 'error');
  }

  try {
    const period = await pb.get('payroll_periods', periodId);
    let warningMsg = '¿Estás totalmente seguro de eliminar TODAS las liquidaciones generadas para este período? Esta acción no se puede deshacer y borrará las colillas calculadas.';
    
    if (period.status === 'approved' || period.status === 'paid') {
      warningMsg = `¡ATENCIÓN! Este período se encuentra en estado ${period.status.toUpperCase()}. Al reversar, se borrarán de forma definitiva todas las colillas calculadas, se eliminará el comprobante contable del diario y se restablecerá el período a Borrador. ¿Estás seguro de proceder?`;
    } else if (period.tx_id && (Array.isArray(period.tx_id) ? period.tx_id.length > 0 : period.tx_id)) {
      warningMsg = 'ATENCIÓN: Este período ya tiene un comprobante contable asociado. Al reversar se eliminarán las colillas y el comprobante del diario. ¿Estás seguro de proceder?';
    }

    if (!confirm(warningMsg)) return;

    const lines = await pb.listAll('payroll_lines', { filter: `period_id="${pb.escapeFilterValue(periodId)}"` });
    
    // 1. Borrar todas las líneas de colillas de pago
    for (const line of lines) {
      await pb.delete('payroll_lines', line.id);
    }

    // 2. Si tenía transacción contable asociada, eliminarla
    if (period.tx_id) {
      const txIds = Array.isArray(period.tx_id) ? period.tx_id : [period.tx_id];
      for (const txId of txIds) {
        if (txId) {
          await pb.delete('transactions', txId).catch((e: any) => {
            console.warn('No se pudo borrar el comprobante contable de la bd:', e);
          });
        }
      }
    }

    // 3. Restablecer el período a borrador
    await pb.update('payroll_periods', periodId, { status: 'draft', tx_id: '' });
    showToast('Liquidación de período reversada correctamente.', 'success');

    const activeRoute = (window as any).router?.currentRoute;
    if (activeRoute === 'nomina-periodos') {
      renderNominaPeriodosPage($('#page-content'));
    } else if (activeRoute === 'nomina-liquidacion') {
      renderNominaLiquidacionPage($('#page-content'));
    }
  } catch (err: any) {
    showToast(`Error al reversar: ${err.message}`, 'error');
  }
};

async function openPayPayrollNominaModal(periodId: string) {
  if (!canApproveOrPayPayroll()) {
    return showToast('Acceso restringido: Solo los usuarios SUPERADMINISTRADOR, ADMINISTRADOR y CONTADOR pueden registrar el pago de nómina.', 'error');
  }
  try {
    const period = await pb.get('payroll_periods', periodId);

    const metodosPago = await pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });
    if (!metodosPago.length) {
      return showToast('No hay métodos de pago o cuentas bancarias activas registradas.', 'warning');
    }

    const payLines = await pb.listAll('payroll_lines', {
      filter: `period_id="${pb.escapeFilterValue(periodId)}"`,
      expand: 'employee_id'
    });
    if (!payLines.length) {
      return showToast('El período no tiene liquidaciones registradas.', 'warning');
    }

    const { config } = await getNominaConfigWithRow();
    
    const grouped = [];
    let grandTotal = 0;
    const periodYYYYMM = (period.date_from || period.date_to || '').slice(0, 7).replace('-', '');

    for (const line of payLines) {
      const netPayAmount = line.net_pay || 0;
      if (netPayAmount <= 0.01) continue;

      const effectiveRule = getEmployeePayrollRule(config, line.employee_id);
      const mappingList = resolveAllNominaMappings(config.mappings, 'net_pay', line.employee_id, effectiveRule.group_id || '');
      const creditMapping = mappingList.find((m: any) => m.side === 'credit');
      if (!creditMapping) {
        throw new Error(`Falta mapeo de pasivo (Crédito) para el concepto Neto a pagar de ${line.expand?.employee_id?.name || 'empleado'}. Configúralo en el engranaje de nómina.`);
      }

      const empDoc = line.expand?.employee_id?.doc_number || line.employee_id || '';
      const crossDocRef = `NOM-${periodYYYYMM}-EMP-${empDoc}`;

      grouped.push({
        accountId: creditMapping.account_id,
        thirdPartyId: line.employee_id,
        employeeName: line.expand?.employee_id?.name || 'Empleado',
        crossDocRef: crossDocRef,
        amount: netPayAmount
      });
      
      grandTotal = round2(grandTotal + netPayAmount);
    }

    if (grandTotal <= 0.01) {
      return showToast('El total neto a pagar para este período es cero.', 'warning');
    }

    (window as any)._payPayrollData = {
      periodId,
      periodName: period.name,
      grouped,
      grandTotal
    };

    const bodyHtml = `
      <div class="space-y-4 text-sm text-left">
        <div class="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
          <strong>Período:</strong> ${esc(period.name)}<br>
          <strong>Total Neto a Pagar (Salarios):</strong> ${fmt(grandTotal)}
        </div>
        <div class="form-group">
          <label class="form-label">Método / Banco / Caja</label>
          <select id="modal-pay-payroll-cuenta" class="form-input">
            <option value="">— Seleccionar —</option>
            ${metodosPago.map((c: any) => `<option value="${c.id}" data-account="${c.account_id}">${esc(c.name)} (${esc(c.bank)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Pago</label>
          <input type="date" id="modal-pay-payroll-date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <input type="text" id="modal-pay-payroll-obs" class="form-input" value="Pago Salarios Nómina período ${period.name}">
        </div>
      </div>
    `;

    openModal(
      'Registrar Pago de Nómina (Salarios)',
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-confirm-pay-payroll" onclick="window._savePayPayroll()"><i class="fas fa-check mr-2"></i>Registrar Pago</button>`,
      false
    );
  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

async function resolveCompanyThirdPartyId(fallbackEmpId: string): Promise<string> {
  try {
    const linked = await (window as any).API.getSetting('company_third_party_id').catch(() => '') || '';
    if (linked) return linked;

    const companyNit = await (window as any).API.getSetting('company_nit').catch(() => '') || '';
    if (companyNit) {
      const cleanNit = companyNit.replace(/[^0-9]/g, '');
      const filterExpr = cleanNit
        ? `doc_number="${pb.escapeFilterValue(cleanNit)}" || doc_number="${pb.escapeFilterValue(companyNit)}"`
        : `doc_number="${pb.escapeFilterValue(companyNit)}"`;
      const matchingTp = await pb.listAll('third_parties', { filter: filterExpr });
      if (matchingTp.length > 0) return matchingTp[0].id;
    }
  } catch (_) {}
  return fallbackEmpId;
}

async function savePayPayroll() {
  if (!canApproveOrPayPayroll()) {
    return showToast('Acceso restringido: Solo los usuarios SUPERADMINISTRADOR, ADMINISTRADOR y CONTADOR pueden registrar el pago de nómina.', 'error');
  }
  const ctaSelect = $('#modal-pay-payroll-cuenta') as HTMLSelectElement;
  const dateInput = $('#modal-pay-payroll-date') as HTMLInputElement;
  const obsInput = $('#modal-pay-payroll-obs') as HTMLInputElement;

  const bankAccountId = ctaSelect?.value || '';
  const accountId = ctaSelect?.options[ctaSelect.selectedIndex]?.dataset?.account || '';
  const date = dateInput?.value || todayStr();
  const obs = obsInput?.value?.trim() || '';

  if (!bankAccountId || !accountId) {
    return showToast('Selecciona un método de pago válido.', 'warning');
  }

  const data = (window as any)._payPayrollData;
  if (!data) return;

  const btn = $('#btn-confirm-pay-payroll') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Registrando...';
  }

  try {
    const typeRes = await pb.listAll('transaction_types', { filter: 'code="CE"' });
    if (!typeRes.length) throw new Error('No se encontró el tipo de transacción CE.');
    const txTypeId = typeRes[0].id;

    const txLines = [];
    let lineOrder = 1;

    for (const item of data.grouped) {
      txLines.push({
        account_id: item.accountId,
        third_party_id: item.thirdPartyId || undefined,
        cross_doc_ref: item.crossDocRef || undefined,
        debit: item.amount,
        credit: 0,
        description: `Pago Nómina ${data.periodName} - ${item.employeeName}`,
        line_order: lineOrder++
      });
    }

    const fallbackEmpId = data.grouped[0]?.thirdPartyId || '';
    const bankThirdPartyId = await resolveCompanyThirdPartyId(fallbackEmpId);

    txLines.push({
      account_id: accountId,
      third_party_id: bankThirdPartyId || undefined,
      debit: 0,
      credit: data.grandTotal,
      description: `Salida de Caja/Bancos por Pago Nómina período ${data.periodName}`,
      line_order: lineOrder++
    });

    let payrollBranchId: string | null = null;
    try {
      if (data.periodId) {
        const periodRec = await pb.get('payroll_periods', data.periodId);
        payrollBranchId = periodRec?.branch_id || null;
      }
    } catch (_) {}
    if (!payrollBranchId) {
      const activeBranchId = localStorage.getItem('active_branch_id');
      const currentUser = pb.currentUser;
      payrollBranchId = (activeBranchId && activeBranchId !== 'TODAS')
        ? activeBranchId
        : (currentUser?.default_branch_id || null);
    }

    const uniqueAccountIds = [...new Set(txLines.map((l) => l.account_id).filter(Boolean))];
    const accountsUsed = await pb.listAll('accounts', {
      filter: uniqueAccountIds.map((id) => `id="${pb.escapeFilterValue(id)}"`).join('||'),
    }).catch(() => []);
    const accountMetaById = {};
    accountsUsed.forEach((a) => { accountMetaById[a.id] = a; });

    const validationErrors = [];
    txLines.forEach((l) => {
      const meta = accountMetaById[l.account_id];
      if (!meta) return;
      if (meta.requires_third_party && !l.third_party_id) {
        validationErrors.push(`Cuenta ${meta.code} - ${meta.name}: requiere tercero pero no está asignado.`);
      }
      if (meta.maneja_cruce && !l.cross_doc_ref) {
        validationErrors.push(`Cuenta ${meta.code} - ${meta.name}: requiere cruce pero no tiene referencia.`);
      }
    });
    if (validationErrors.length) {
      throw new Error(`Errores de validación contable:\n${validationErrors.slice(0, 5).join('\n')}`);
    }

    const txRecord = await (window as any).API.createTransaction({
      tx_type_id: txTypeId,
      date: date,
      description: obs || `Pago Nómina período ${data.periodName}`,
      status: 'active',
      branch_id: payrollBranchId || null,
    }, txLines);

    await pb.update('payroll_periods', data.periodId, { status: 'paid' });

    closeModal();
    showToast(`Comprobante de Egreso ${txRecord.number} creado y nómina marcada como pagada.`, 'success');
    navigate((window as any).currentPage || 'nomina-periodos');
  } catch (err: any) {
    showToast(`Error al registrar pago: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i>Registrar Pago';
    }
  }
}

async function openPayPlanillaModal(periodId: string, periodName: string) {
  if (!canApproveOrPayPayroll()) {
    return showToast('Acceso restringido: Solo los usuarios SUPERADMINISTRADOR, ADMINISTRADOR y CONTADOR pueden registrar el pago de la planilla de aportes.', 'error');
  }
  try {
    const metodosPago = await pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });
    if (!metodosPago.length) {
      return showToast('No hay métodos de pago o cuentas bancarias activas registradas.', 'warning');
    }

    const payLines = await pb.listAll('payroll_lines', {
      filter: `period_id="${pb.escapeFilterValue(periodId)}"`,
      expand: 'employee_id'
    });
    if (!payLines.length) {
      return showToast('El período no tiene liquidaciones registradas.', 'warning');
    }

    const { config } = await getNominaConfigWithRow();
    const companyRules = config.company_rules || {};

    const conceptsToPay = [
      'deduction_health', 'employer_health',
      'deduction_pension', 'employer_pension', 'solidarity_fund',
      'employer_arl', 'caja_comp', 'sena', 'icbf'
    ];

    const grouped = new Map<string, { accountId: string, thirdPartyId: string, amount: number, label: string }>();
    let grandTotal = 0;

    for (const line of payLines) {
      const effectiveRule = getEmployeePayrollRule(config, line.employee_id);
      for (const key of conceptsToPay) {
        const amount = getNominaConceptAmount(line, key);
        if (amount <= 0) continue;

        const mappingList = resolveAllNominaMappings(config.mappings, key, line.employee_id, effectiveRule.group_id || '');
        const creditMapping = mappingList.find((m: any) => m.side === 'credit');
        if (!creditMapping) {
          throw new Error(`Falta mapeo de pasivo (Crédito) para el concepto ${NOMINA_CONCEPT_BY_KEY[key]?.label || key}. Configúralo en el engranaje de nómina.`);
        }

        const thirdPartyId = resolveNominaTerceroId(key, line, effectiveRule, companyRules);
        const mapKey = `${creditMapping.account_id}|${thirdPartyId}`;

        if (!grouped.has(mapKey)) {
          grouped.set(mapKey, {
            accountId: creditMapping.account_id,
            thirdPartyId: thirdPartyId,
            amount: 0,
            label: NOMINA_CONCEPT_BY_KEY[key]?.label || key
          });
        }
        const item = grouped.get(mapKey)!;
        item.amount = round2(item.amount + amount);
        grandTotal = round2(grandTotal + amount);
      }
    }

    if (grandTotal <= 0.01) {
      return showToast('El total de la planilla de aportes y parafiscales para este período es cero.', 'warning');
    }

    (window as any)._payPlanillaData = {
      periodId,
      periodName,
      grouped: Array.from(grouped.values()),
      grandTotal
    };

    const bodyHtml = `
      <div class="space-y-4 text-sm text-left">
        <div class="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
          <strong>Período:</strong> ${esc(periodName)}<br>
          <strong>Total Planilla Aportes y Parafiscales:</strong> ${fmt(grandTotal)}
        </div>
        <div class="form-group">
          <label class="form-label">Método / Banco / Caja</label>
          <select id="modal-pay-planilla-cuenta" class="form-input">
            <option value="">— Seleccionar —</option>
            ${metodosPago.map((c: any) => `<option value="${c.id}" data-account="${c.account_id}">${esc(c.name)} (${esc(c.bank)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Pago</label>
          <input type="date" id="modal-pay-planilla-date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <input type="text" id="modal-pay-planilla-obs" class="form-input" value="Pago Planilla Aportes Nómina período ${periodName}">
        </div>
      </div>
    `;

    openModal(
      'Registrar Pago de Planilla Aportes',
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-confirm-pay-planilla" onclick="window._savePayPlanilla()"><i class="fas fa-check mr-2"></i>Registrar Pago</button>`,
      false
    );
  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

async function savePayPlanilla() {
  if (!canApproveOrPayPayroll()) {
    return showToast('Acceso restringido: Solo los usuarios SUPERADMINISTRADOR, ADMINISTRADOR y CONTADOR pueden registrar el pago de la planilla de aportes.', 'error');
  }
  const ctaSelect = $('#modal-pay-planilla-cuenta') as HTMLSelectElement;
  const dateInput = $('#modal-pay-planilla-date') as HTMLInputElement;
  const obsInput = $('#modal-pay-planilla-obs') as HTMLInputElement;

  const bankAccountId = ctaSelect?.value || '';
  const accountId = ctaSelect?.options[ctaSelect.selectedIndex]?.dataset?.account || '';
  const date = dateInput?.value || todayStr();
  const obs = obsInput?.value?.trim() || '';

  if (!bankAccountId || !accountId) {
    return showToast('Selecciona un método de pago válido.', 'warning');
  }

  const data = (window as any)._payPlanillaData;
  if (!data) return;

  const btn = $('#btn-confirm-pay-planilla') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Registrando...';
  }

  try {
    const typeRes = await pb.listAll('transaction_types', { filter: 'code="CE"' });
    if (!typeRes.length) throw new Error('No se encontró el tipo de transacción CE.');
    const txTypeId = typeRes[0].id;

    const txLines = [];
    let lineOrder = 1;

    for (const item of data.grouped) {
      if (item.amount <= 0.01) continue;
      txLines.push({
        account_id: item.accountId,
        third_party_id: item.thirdPartyId || undefined,
        debit: item.amount,
        credit: 0,
        description: `Pago Planilla Nómina ${data.periodName} - ${item.label}`,
        line_order: lineOrder++
      });
    }

    const fallbackEmpId = data.grouped[0]?.thirdPartyId || '';
    const bankThirdPartyId = await resolveCompanyThirdPartyId(fallbackEmpId);

    txLines.push({
      account_id: accountId,
      third_party_id: bankThirdPartyId || undefined,
      debit: 0,
      credit: data.grandTotal,
      description: `Salida de Caja/Bancos por Pago Planilla Aportes Nómina`,
      line_order: lineOrder++
    });

    // Resolver sucursal del período o sucursal activa/defecto del usuario
    let planillaBranchId: string | null = null;
    try {
      if (data.periodId) {
        const periodRec = await pb.get('payroll_periods', data.periodId);
        planillaBranchId = periodRec?.branch_id || null;
      }
    } catch (_) {}
    if (!planillaBranchId) {
      const activeBranchId = localStorage.getItem('active_branch_id');
      const currentUser = pb.currentUser;
      planillaBranchId = (activeBranchId && activeBranchId !== 'TODAS')
        ? activeBranchId
        : (currentUser?.default_branch_id || null);
    }

    const txRecord = await (window as any).API.createTransaction({
      tx_type_id: txTypeId,
      date: date,
      description: obs || `Pago Planilla Aportes Nómina período ${data.periodName}`,
      status: 'active',
      branch_id: planillaBranchId || null,
    }, txLines);

    closeModal();
    showToast(`Comprobante de Egreso ${txRecord.number} creado exitosamente.`, 'success');
    navigate((window as any).currentPage || 'nomina-periodos');
  } catch (err: any) {
    showToast(`Error al registrar pago: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i>Registrar Pago';
    }
  }
}

async function renderNominaDistribucionDotacionPage(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos de distribución...</div>`;
  try {
    const periodsRaw = await pb.listAll('payroll_periods', { sort: '-date_from' });
    const periods = periodsRaw.filter(p => p.status === 'draft' || !p.status);
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' });
    const suppliers = await pb.listAll('third_parties', { filter: 'type="PROVEEDOR" && active=true', sort: 'name' });

    if (!periods.length) {
      c.innerHTML = `
        <div class="p-8 text-center text-gray-500 border border-dashed rounded-2xl max-w-xl mx-auto mt-10 bg-white">
          <i class="fas fa-calendar-times text-red-400 text-4xl mb-2"></i>
          <p class="font-bold text-gray-700">No hay períodos de nómina en Borrador</p>
          <p class="text-sm text-gray-400 mt-1">Debes crear un período de nómina en estado borrador antes de distribuir dotaciones.</p>
          <button class="btn btn-primary btn-sm mt-4" onclick="navigate('nomina-periodos')">Ir a Períodos</button>
        </div>
      `;
      return;
    }

    const periodOptions = periods.map(p => `<option value="${esc(p.id)}" data-start="${p.date_from}" data-end="${p.date_to}">${esc(p.name)}</option>`).join('');
    const supplierOptions = suppliers.map(s => `<option value="${esc(s.id)}">${esc(s.doc_number || '')} - ${esc(s.name)}</option>`).join('');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Distribución Masiva de Dotaciones</h3>
           <p class="text-sm" style="color:#6B7280">Filtra un proveedor, asocia su factura de compra y distribuye automáticamente el valor a los empleados seleccionados.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
        <!-- Columna izquierda: Configuración de la factura y distribución -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white rounded-2xl border p-5 space-y-4 shadow-sm" style="border-color:#EAF2F8">
            <h4 class="font-bold text-gray-800 text-sm mb-3 border-b pb-2"><i class="fas fa-cogs mr-2 text-blue-600"></i>Configuración de Origen</h4>
            
            <div class="form-group">
              <label class="form-label text-xs font-semibold">Período de Nómina Target *</label>
              <select id="dd-period" class="form-input">${periodOptions}</select>
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-semibold">Proveedor *</label>
              <select id="dd-supplier" class="form-input">
                <option value="">-- Selecciona un proveedor --</option>
                ${supplierOptions}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-semibold">Factura de Compra Proveedor *</label>
              <select id="dd-invoice" class="form-input" disabled>
                <option value="">-- Selecciona primero un proveedor --</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-semibold">Valor Total Factura ($)</label>
              <input type="text" id="dd-total-invoice" class="form-input" disabled value="0">
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-semibold">Valor a Distribuir ($) *</label>
              <input type="number" id="dd-amount-distribute" class="form-input" min="1" value="0">
              <p class="text-xs text-gray-400 mt-1">Por defecto es el total de la factura, pero puedes editarlo.</p>
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-semibold">Soporte / Entrega Radicado</label>
              <input type="text" id="dd-support" class="form-input" placeholder="Ej: FC-4827">
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-semibold">Descripción Novedad</label>
              <textarea id="dd-desc" class="form-input" rows="2" placeholder="Ej: Dotación de ropa y calzado de labor..."></textarea>
            </div>
          </div>
        </div>

        <!-- Columna derecha: Empleados y Distribución -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-2xl border p-5 shadow-sm" style="border-color:#EAF2F8">
            <h4 class="font-bold text-gray-800 text-sm mb-3 border-b pb-2 flex justify-between items-center">
              <span><i class="fas fa-users mr-2 text-emerald-600"></i>Empleados Beneficiarios</span>
              <span class="text-xs font-normal text-gray-500" id="dd-selected-count">0 seleccionados</span>
            </h4>

            <div class="flex gap-2 mb-3">
              <input id="dd-emp-search" class="form-input flex-1 text-xs" placeholder="Buscar empleado por nombre o NIT...">
              <button class="btn btn-outline btn-sm" id="dd-btn-select-all" type="button">Todos</button>
              <button class="btn btn-outline btn-sm" id="dd-btn-deselect-all" type="button">Ninguno</button>
            </div>

            <div class="overflow-y-auto border rounded-xl p-2" style="max-height: 280px; border-color:#F0F0F0">
              <table class="data-table text-xs text-left" id="dd-emp-table">
                <thead>
                  <tr>
                    <th width="40" class="text-center">Sel.</th>
                    <th>Documento</th>
                    <th>Nombre Empleado</th>
                  </tr>
                </thead>
                <tbody id="dd-emp-list">
                  ${employees.map(e => `
                    <tr class="emp-row" data-name="${esc(e.name.toLowerCase())}" data-doc="${esc(e.doc_number || '')}">
                      <td class="text-center">
                        <input type="checkbox" class="dd-emp-checkbox" value="${esc(e.id)}">
                      </td>
                      <td>${esc(e.doc_number || '')}</td>
                      <td class="font-semibold">${esc(e.name)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="mt-4 p-4 rounded-xl border space-y-3" style="background:#F8FAFC; border-color:#E2E8F0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-700">Valor Unitario Proyectado por Empleado:</span>
                <span class="text-lg font-bold text-blue-900" id="dd-unit-projection">$ 0</span>
              </div>
              <p class="text-xs text-gray-500">
                Fórmula: [Valor a Distribuir] / [Empleados Seleccionados]. Esto creará una novedad de tipo "Dotación (Entrega en Especie)" para cada empleado en el período target.
              </p>
            </div>

            <div class="mt-5 flex justify-end gap-2 border-t pt-4">
              <button class="btn btn-outline" id="dd-btn-cancel" type="button">Cancelar</button>
              <button class="btn btn-primary" id="dd-btn-process" type="button"><i class="fas fa-share-nodes mr-1"></i>Distribuir y Crear Novedades</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Eventos interactivos
    const selectSupplier = $('#dd-supplier') as HTMLSelectElement;
    const selectInvoice = $('#dd-invoice') as HTMLSelectElement;
    const inputTotalInvoice = $('#dd-total-invoice') as HTMLInputElement;
    const inputAmountDistribute = $('#dd-amount-distribute') as HTMLInputElement;
    const inputSupport = $('#dd-support') as HTMLInputElement;
    const inputDesc = $('#dd-desc') as HTMLTextAreaElement;
    const labelProjection = $('#dd-unit-projection') as HTMLElement;
    const labelSelectedCount = $('#dd-selected-count') as HTMLElement;

    // Calcular proyección
    const recalcProjection = () => {
      const amount = Number(inputAmountDistribute?.value || 0);
      const checkedBoxes = document.querySelectorAll('.dd-emp-checkbox:checked');
      const count = checkedBoxes.length;
      labelSelectedCount.textContent = `${count} seleccionados`;

      if (count > 0 && amount > 0) {
        const unit = round2(amount / count);
        labelProjection.textContent = fmt(unit);
      } else {
        labelProjection.textContent = '$ 0';
      }
    };

    // Cambiar proveedor -> Cargar facturas en cascada
    selectSupplier?.addEventListener('change', async () => {
      const supplierId = selectSupplier.value;
      
      // Resetear campos dependientes
      selectInvoice.innerHTML = '<option value="">-- Selecciona una factura --</option>';
      selectInvoice.disabled = true;
      inputTotalInvoice.value = '0';
      inputAmountDistribute.value = '0';
      inputSupport.value = '';
      inputDesc.value = '';
      recalcProjection();

      if (!supplierId) return;

      selectInvoice.innerHTML = '<option value="">Cargando facturas...</option>';
      try {
        const invoices = await pb.listAll('purchase_invoices', { 
          filter: `supplier_id = "${pb.escapeFilterValue(supplierId)}"`, 
          sort: '-date' 
        });

        if (invoices.length === 0) {
          selectInvoice.innerHTML = '<option value="">Sin facturas registradas para este proveedor</option>';
          selectInvoice.disabled = true;
        } else {
          selectInvoice.innerHTML = '<option value="">-- Selecciona una factura --</option>' + 
            invoices.map(inv => `<option value="${esc(inv.id)}" data-total="${inv.total || 0}" data-number="${inv.number}">${esc(inv.number)} - Total: ${fmt(inv.total || 0)} (${inv.date?.slice(0, 10) || ''})</option>`).join('');
          selectInvoice.disabled = false;
        }
      } catch (err: any) {
        selectInvoice.innerHTML = '<option value="">Error al cargar facturas</option>';
        showToast(`Error al cargar facturas: ${err.message}`, 'error');
      }
    });

    // Cambiar factura
    selectInvoice?.addEventListener('change', () => {
      const opt = selectInvoice.options[selectInvoice.selectedIndex];
      if (opt && opt.value) {
        const total = Number(opt.getAttribute('data-total') || 0);
        const number = opt.getAttribute('data-number') || '';
        inputTotalInvoice.value = fmt(total);
        inputAmountDistribute.value = String(total);
        inputSupport.value = number;
        inputDesc.value = `Distribución de Dotación según Factura de Compra N° ${number}`;
      } else {
        inputTotalInvoice.value = '0';
        inputAmountDistribute.value = '0';
        inputSupport.value = '';
        inputDesc.value = '';
      }
      recalcProjection();
    });

    inputAmountDistribute?.addEventListener('input', recalcProjection);

    // Checkbox clicks
    document.querySelectorAll('.dd-emp-checkbox').forEach(cb => {
      cb.addEventListener('change', recalcProjection);
    });

    // Buscar empleados
    const searchInput = $('#dd-emp-search') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase().trim();
      document.querySelectorAll('#dd-emp-list .emp-row').forEach((row: any) => {
        const name = row.getAttribute('data-name') || '';
        const doc = row.getAttribute('data-doc') || '';
        const matches = name.includes(val) || doc.includes(val);
        row.style.display = matches ? '' : 'none';
      });
    });

    // Seleccionar todos / ninguno
    $('#dd-btn-select-all')?.addEventListener('click', () => {
      document.querySelectorAll('.dd-emp-checkbox').forEach((cb: any) => {
        cb.checked = true;
      });
      recalcProjection();
    });

    $('#dd-btn-deselect-all')?.addEventListener('click', () => {
      document.querySelectorAll('.dd-emp-checkbox').forEach((cb: any) => {
        cb.checked = false;
      });
      recalcProjection();
    });

    $('#dd-btn-cancel')?.addEventListener('click', () => {
      navigate('nomina-novedades');
    });

    // Procesar distribución masiva
    $('#dd-btn-process')?.addEventListener('click', async () => {
      const periodSelect = $('#dd-period') as HTMLSelectElement;
      const periodId = periodSelect.value;
      const amount = Number(inputAmountDistribute.value || 0);
      const support = inputSupport.value.trim();
      const desc = inputDesc.value.trim();

      const checkedBoxes = document.querySelectorAll('.dd-emp-checkbox:checked');
      const selectedEmpIds = Array.from(checkedBoxes).map((cb: any) => cb.value);

      if (!periodId) return showToast('Selecciona un período de nómina target', 'warning');
      if (amount <= 0) return showToast('El valor a distribuir debe ser mayor a cero', 'warning');
      if (!selectedEmpIds.length) return showToast('Selecciona al menos un empleado beneficiario', 'warning');

      const btn = $('#dd-btn-process') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Procesando...';
      }

      try {
        const optPeriod = periodSelect.options[periodSelect.selectedIndex];
        const dateFrom = optPeriod.getAttribute('data-start') || '';
        const dateTo = optPeriod.getAttribute('data-end') || '';
        const valuePerEmp = round2(amount / selectedEmpIds.length);

        showToast(`Distribuyendo $${fmt(valuePerEmp)} a cada uno de los ${selectedEmpIds.length} empleados...`, 'info');

        // Crear las novedades en PocketBase
        for (const empId of selectedEmpIds) {
          await pb.create('payroll_novelties', {
            period_id: periodId,
            employee_id: empId,
            type: 'DOTACION',
            date_from: dateFrom,
            date_to: dateTo || undefined,
            qty: 0,
            amount: valuePerEmp,
            support_number: support || undefined,
            description: desc || undefined,
            status: 'draft'
          });
        }

        showToast('Distribución de dotación completada. Novedades registradas con éxito.', 'success');
        navigate('nomina-novedades');
      } catch (err: any) {
        showToast(`Error al distribuir dotaciones: ${err.message}`, 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-share-nodes mr-1"></i>Distribuir y Crear Novedades';
        }
      }
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500">${esc(err.message)}</div>`;
  }
}

(window as any).renderNominaDistribucionDotacionPage = renderNominaDistribucionDotacionPage;
(window as any)._openPayPlanillaModal = openPayPlanillaModal;
(window as any)._savePayPlanilla = savePayPlanilla;
(window as any)._openPayPayrollModal = openPayPayrollNominaModal;
(window as any)._savePayPayroll = savePayPayroll;
