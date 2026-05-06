/**
 * GRAVY v2.0 — nomina.js
 */
'use strict';

const NOMINA_CONFIG_KEY = 'payroll_accounting_config_v1';
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
];

const NOMINA_EXTRA_DEDUCTION_KEYS = [
  'embargo',
  'cxc',
  'libranza',
  'prestamos',
];

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

function defaultNominaConfig() {
  return {
    balancing_account_id: '',
    mappings: [],
    employee_groups: [],
    group_rules: [],
    company_rules: {
      smmlv: 1423500,
      solidarity_threshold_smmlv: 3,
      solidarity_rate: 0.01,
      exempt_sena_icbf: false,
      weekly_hours: 44,
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
      solidarity_threshold_smmlv: Number(company.solidarity_threshold_smmlv) > 0 ? Number(company.solidarity_threshold_smmlv) : 3,
      solidarity_rate: Number(company.solidarity_rate) >= 0 ? Number(company.solidarity_rate) : 0.01,
      exempt_sena_icbf: !!company.exempt_sena_icbf,
      weekly_hours: [42, 44, 46, 47, 48].includes(Number(company.weekly_hours)) ? Number(company.weekly_hours) : 44,
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
        apply_solidarity_fund: typeof r.apply_solidarity_fund === 'boolean' ? r.apply_solidarity_fund : null,
        apply_withholding_tax: typeof r.apply_withholding_tax === 'boolean' ? r.apply_withholding_tax : null,
        withholding_rate: r.withholding_rate === null || r.withholding_rate === undefined || r.withholding_rate === ''
          ? null
          : (Number(r.withholding_rate) >= 0 ? Number(r.withholding_rate) : null),
      }))
      .filter((r) => r.employee_id),
  };
}

async function getNominaConfigWithRow() {
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

async function saveNominaConfig(config, rowId = '') {
  const payload = { key: NOMINA_CONFIG_KEY, value: JSON.stringify(normalizeNominaConfig(config)) };
  if (rowId) {
    await pb.update('settings', rowId, payload);
  } else {
    await pb.create('settings', payload);
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
    apply_solidarity_fund: false,
    apply_withholding_tax: false,
    withholding_rate: 0,
  };

  if (found) {
    if (found.group_id) merged.group_id = found.group_id;
    if (found.basic_salary !== null && found.basic_salary !== undefined) merged.basic_salary = Number(found.basic_salary || 0);
    if (found.arl_risk_level !== null && found.arl_risk_level !== undefined) merged.arl_risk_level = Math.max(1, Math.min(5, parseInt(found.arl_risk_level || 1, 10) || 1));
    if (typeof found.is_pensioner === 'boolean') merged.is_pensioner = found.is_pensioner;
    if (typeof found.apply_solidarity_fund === 'boolean') merged.apply_solidarity_fund = found.apply_solidarity_fund;
    if (typeof found.apply_withholding_tax === 'boolean') merged.apply_withholding_tax = found.apply_withholding_tax;
    if (found.withholding_rate !== null && found.withholding_rate !== undefined) merged.withholding_rate = Number(found.withholding_rate || 0);
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
  return round2((payLine?.salary_base || 0) + (payLine?.transport_allowance || 0) + getNominaConceptAmount(payLine, 'overtime') + extra.earnings);
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

async function buildNominaAccountingLines(period, payLines, config) {
  const missing = [];
  const buckets = {};

  for (const line of payLines) {
    const effectiveRule = getEmployeePayrollRule(config, line.employee_id);
    for (const concept of NOMINA_CONCEPTS) {
      const amount = getNominaConceptAmount(line, concept.key);
      if (amount <= 0) continue;
      const mapping = resolveNominaMapping(config.mappings, concept.key, line.employee_id, effectiveRule.group_id || '');
      if (!mapping) {
        missing.push({ employee: line.expand?.employee_id?.name || 'Empleado', concept: concept.label });
        continue;
      }
      const side = mapping.side === 'credit' ? 'credit' : 'debit';
      const bucketKey = `${mapping.account_id}__${side}`;
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          account_id: mapping.account_id,
          debit: 0,
          credit: 0,
          description: `Nómina ${period.name} - ${concept.label}`,
        };
      }
      if (side === 'debit') buckets[bucketKey].debit = round2(buckets[bucketKey].debit + amount);
      else buckets[bucketKey].credit = round2(buckets[bucketKey].credit + amount);
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
    if (!config.balancing_account_id) {
      throw new Error(`La nómina no está cuadrada (D ${fmt(totalDebit)} / C ${fmt(totalCredit)}). Configura una cuenta de ajuste en el engranaje de Nómina.`);
    }
    txLines.push({
      account_id: config.balancing_account_id,
      debit: diff < 0 ? Math.abs(diff) : 0,
      credit: diff > 0 ? Math.abs(diff) : 0,
      description: `Ajuste de cuadre nómina ${period.name}`,
    });
  }

  return txLines;
}

async function postNominaPeriodAccounting(periodId) {
  const period = await pb.get('payroll_periods', periodId);
  if (period.tx_id) return period.tx_id;

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

  const txLines = await buildNominaAccountingLines(period, payLines, config);
  if (!txLines.length) throw new Error('No hay líneas contables para generar en este período.');

  const tx = await API.createTransaction({
    tx_type_id: txType.id,
    date: period.date_to || todayStr(),
    description: `Nómina ${period.name}`,
  }, txLines);

  return tx.id;
}

async function openNominaAccountingSettings(employees = []) {
  try {
    const [{ row, config }, accounts] = await Promise.all([
      getNominaConfigWithRow(),
      pb.listAll('accounts', { filter: 'active=true', sort: 'code' }),
    ]);

    if (!accounts.length) return showToast('No hay cuentas activas para mapear.', 'warning');

    const local = {
      rowId: row?.id || '',
      config: normalizeNominaConfig(config),
    };

    const accountOpts = `<option value="">Selecciona cuenta...</option>${accounts.map((a) => `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('')}`;
    const conceptOpts = NOMINA_CONCEPTS.map((cpt) => `<option value="${esc(cpt.key)}">${esc(cpt.label)}</option>`).join('');
    const groupOpts = () => `<option value="">Todos los grupos</option>${(local.config.employee_groups || []).map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}`;

    openModal(
      'Configuración Contable de Nómina',
      `
      <div class="space-y-4">
        <div class="rounded-xl p-3 text-sm" style="background:#F8FAFC;border:1px solid #E2E8F0;color:#334155">
          Configura mapeos contables por grupo para reutilizar reglas contables en grandes volúmenes de empleados.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label">Cuenta de Ajuste (opcional)</label>
            <select id="nom-balancing-account" class="form-input">${accountOpts}</select>
          </div>
          <div class="form-group">
            <label class="form-label">SMMLV vigente</label>
            <input id="nom-smmlv" class="form-input" type="number" min="1" step="1" value="${esc(String(local.config.company_rules.smmlv || 1423500))}">
          </div>
          <div class="form-group">
            <label class="form-label">Jornada laboral semanal (Ley 2101/2021)</label>
            <select id="nom-weekly-hours" class="form-input">
              <option value="48" ${(local.config.company_rules.weekly_hours||44) === 48 ? 'selected' : ''}>48 h/sem (antes Jul 2023)</option>
              <option value="47" ${(local.config.company_rules.weekly_hours||44) === 47 ? 'selected' : ''}>47 h/sem (Jul 2023 – Jun 2024)</option>
              <option value="46" ${(local.config.company_rules.weekly_hours||44) === 46 ? 'selected' : ''}>46 h/sem (Jul 2024 – Jun 2025)</option>
              <option value="44" ${(local.config.company_rules.weekly_hours||44) === 44 ? 'selected' : ''}>44 h/sem (Jul 2025 – Jun 2026)</option>
              <option value="42" ${(local.config.company_rules.weekly_hours||44) === 42 ? 'selected' : ''}>42 h/sem (desde Jul 2026)</option>
            </select>
            <p class="text-xs mt-1" style="color:#6B7280">Define el valor hora base para liquidar horas extra y recargos.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Umbral fondo solidaridad (SMMLV)</label>
            <input id="nom-sol-threshold" class="form-input" type="number" min="0" step="0.01" value="${esc(String(local.config.company_rules.solidarity_threshold_smmlv || 3))}">
          </div>
          <div class="form-group">
            <label class="form-label">Tarifa fondo solidaridad (%)</label>
            <input id="nom-sol-rate" class="form-input" type="number" min="0" step="0.01" value="${esc(String((local.config.company_rules.solidarity_rate || 0.01) * 100))}">
          </div>
          <div class="form-group md:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#334155">
              <input id="nom-exempt-sena-icbf" type="checkbox" ${local.config.company_rules.exempt_sena_icbf ? 'checked' : ''}>
              Empresa exenta de parafiscales SENA e ICBF
            </label>
          </div>
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
            <input id="nom-map-group-filter" class="form-input" placeholder="Filtrar grupos...">
            <select id="nom-map-group" class="form-input">${groupOpts()}</select>
            <select id="nom-map-concept" class="form-input">${conceptOpts}</select>
            <select id="nom-map-side" class="form-input">
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
            </select>
            <select id="nom-map-account" class="form-input">${accountOpts}</select>
            <button class="btn btn-primary" id="btn-add-map"><i class="fas fa-plus"></i> Agregar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Aplica a</th><th>Concepto</th><th>Lado</th><th>Cuenta</th><th></th></tr></thead>
            <tbody id="nom-map-body"></tbody>
          </table>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="btn-save-nom-config">Guardar Configuración</button>`,
      true
    );

    const employeeById = {};
    employees.forEach((e) => { employeeById[e.id] = e; });
    const accountById = {};
    accounts.forEach((a) => { accountById[a.id] = a; });
    const groupsById = () => {
      const map = {};
      (local.config.employee_groups || []).forEach((g) => { map[g.id] = g; });
      return map;
    };

    if ($('#nom-balancing-account')) $('#nom-balancing-account').value = local.config.balancing_account_id || '';

    const refreshGroupSelectors = () => {
      const q = (getInputVal('nom-map-group-filter') || '').trim().toLowerCase();
      const mapGroupSel = $('#nom-map-group');
      if (mapGroupSel) {
        const options = (local.config.employee_groups || [])
          .filter((g) => !q || (g.name || '').toLowerCase().includes(q))
          .map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`)
          .join('');
        mapGroupSel.innerHTML = `<option value="">Selecciona grupo...</option>${options}`;
      }
    };

    const applyConceptDefaultSide = () => {
      const conceptKey = getSelectVal('nom-map-concept');
      const defaultSide = NOMINA_CONCEPT_BY_KEY[conceptKey]?.default_side;
      if (!defaultSide) return;
      setInputVal('nom-map-side', defaultSide === 'credit' ? 'credit' : 'debit');
    };

    const renderGroups = () => {
      const body = $('#nom-groups-body');
      if (!body) return;
      const rows = local.config.employee_groups || [];
      body.innerHTML = rows.length
        ? rows.map((g) => `<tr><td>${esc(g.name)}</td><td class="text-right"><button class="btn btn-outline btn-sm btn-del-group" data-id="${esc(g.id)}"><i class="fas fa-trash"></i></button></td></tr>`).join('')
        : '<tr><td colspan="2" class="text-center py-6" style="color:#9CA3AF">Sin grupos definidos.</td></tr>';
      refreshGroupSelectors();
    };

    const renderMappings = () => {
      const body = $('#nom-map-body');
      if (!body) return;
      const gById = groupsById();
      const rows = local.config.mappings || [];
      body.innerHTML = rows.length
        ? rows.map((m) => {
          const appliesTo = m.employee_id
            ? (employeeById[m.employee_id]?.name || 'Empleado no encontrado')
            : (m.group_id ? `Grupo: ${gById[m.group_id]?.name || 'Grupo no encontrado'}` : 'Todos');
          const conceptName = NOMINA_CONCEPT_BY_KEY[m.concept]?.label || m.concept;
          const accountName = accountById[m.account_id] ? `${accountById[m.account_id].code} - ${accountById[m.account_id].name}` : 'Cuenta no encontrada';
          return `<tr>
            <td>${esc(appliesTo)}</td>
            <td>${esc(conceptName)}</td>
            <td>${m.side === 'credit' ? 'Crédito' : 'Débito'}</td>
            <td>${esc(accountName)}</td>
            <td class="text-right"><button class="btn btn-outline btn-sm btn-del-map" data-id="${esc(m.id)}"><i class="fas fa-trash"></i></button></td>
          </tr>`;
        }).join('')
        : '<tr><td colspan="5" class="text-center py-6" style="color:#9CA3AF">Sin mapeos configurados.</td></tr>';
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
      const concept = getSelectVal('nom-map-concept');
      const side = getSelectVal('nom-map-side');
      const accountId = getSelectVal('nom-map-account');
      if (!concept || !accountId) return showToast('Selecciona concepto y cuenta.', 'warning');
      if (!groupId) return showToast('Selecciona un grupo para el mapeo contable.', 'warning');

      const duplicate = (local.config.mappings || []).find((m) =>
        m.concept === concept && (m.group_id || '') === (groupId || '') && m.side === side
      );
      if (duplicate) return showToast('Ya existe un mapeo igual (ámbito + concepto + lado).', 'info');

      local.config.mappings.push({
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        employee_id: '',
        group_id: groupId || '',
        concept,
        side: side === 'credit' ? 'credit' : 'debit',
        account_id: accountId,
        active: true,
      });
      renderMappings();
    });

    $('#nom-map-group-filter')?.addEventListener('input', debounce(refreshGroupSelectors, 180));
    $('#nom-map-concept')?.addEventListener('change', applyConceptDefaultSide);
    refreshGroupSelectors();
    applyConceptDefaultSide();

    $('#nom-map-body')?.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('.btn-del-map');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      local.config.mappings = (local.config.mappings || []).filter((m) => m.id !== id);
      renderMappings();
    });

    $('#btn-save-nom-config')?.addEventListener('click', async () => {
      try {
        local.config.balancing_account_id = getSelectVal('nom-balancing-account') || '';
        local.config.company_rules = {
          smmlv: Math.max(1, parseNum(getInputVal('nom-smmlv')) || 1423500),
          solidarity_threshold_smmlv: Math.max(0, parseNum(getInputVal('nom-sol-threshold')) || 3),
          solidarity_rate: Math.max(0, (parseNum(getInputVal('nom-sol-rate')) || 1) / 100),
          exempt_sena_icbf: !!$('#nom-exempt-sena-icbf')?.checked,
          weekly_hours: [42, 44, 46, 47, 48].includes(Number(getInputVal('nom-weekly-hours'))) ? Number(getInputVal('nom-weekly-hours')) : 44,
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

async function openNominaEmployeeSettings(employees = []) {
  try {
    const { row, config } = await getNominaConfigWithRow();
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
            </div>
            <div class="form-group">
              <label class="inline-flex items-center gap-2 text-sm" style="color:#334155"><input id="nom-emp-rule-solidarity" type="checkbox"> Aporta solidaridad</label>
              <label class="inline-flex items-center gap-2 text-sm mt-3" style="color:#334155"><input id="nom-emp-rule-withholding" type="checkbox"> Aplica retefuente</label>
              <input id="nom-emp-rule-withholding-rate" class="form-input mt-2" type="number" min="0" step="0.01" placeholder="Tarifa retefuente %">
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="btn btn-primary" id="btn-nom-emp-rule-upsert"><i class="fas fa-floppy-disk"></i> Guardar en Lista</button>
            <button class="btn btn-outline" id="btn-nom-emp-rule-clear">Limpiar</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead><tr><th>Empleado</th><th>Grupo</th><th>Estado</th><th>Salario básico</th><th>ARL</th><th>Pensionado</th><th>Solidaridad</th><th>Retefuente</th><th></th></tr></thead>
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
      if ($('#nom-emp-rule-solidarity')) $('#nom-emp-rule-solidarity').checked = false;
      if ($('#nom-emp-rule-withholding')) $('#nom-emp-rule-withholding').checked = false;
      setInputVal('nom-emp-rule-withholding-rate', '0');
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
      if ($('#nom-emp-rule-solidarity')) $('#nom-emp-rule-solidarity').checked = !!(explicit.apply_solidarity_fund ?? effective.apply_solidarity_fund);
      if ($('#nom-emp-rule-withholding')) $('#nom-emp-rule-withholding').checked = !!(explicit.apply_withholding_tax ?? effective.apply_withholding_tax);
      setInputVal('nom-emp-rule-withholding-rate', String(round2(((explicit.withholding_rate ?? effective.withholding_rate ?? 0) * 100))));
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
        apply_solidarity_fund: !!$('#nom-emp-rule-solidarity')?.checked,
        apply_withholding_tax: applyWithholdingTax,
        withholding_rate: applyWithholdingTax ? Math.max(0, withholdingRatePct / 100) : 0,
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
  } catch (err) {
    showToast(err.message || 'No se pudo abrir el panel de empleados de nómina', 'error');
  }
}

async function renderNomina(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando nómina...</div>`;
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
    const noEmployees = employees.length === 0;
    const noPeriods = periods.length === 0;

    // Aggregate per period
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

    const statusBadge = s => ({
      draft: '<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>',
      approved: '<span class="badge badge-blue">Aprobada</span>',
      paid: '<span class="badge badge-green">Pagada</span>',
    }[s] || '<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Liquidación de períodos, prestaciones y aportes parafiscales.</p>
        </div>
        ${can('canWrite') ? `<div class="flex gap-2">${requireRole('admin') ? '<button class="btn btn-outline" id="btn-nomina-empleado" title="Parámetros por empleado"><i class="fas fa-user-gear"></i> Empleado</button><button class="btn btn-outline" id="btn-nomina-config" title="Configurar contabilización"><i class="fas fa-gear"></i></button>' : ''}<button class="btn btn-secondary" id="btn-new-period"><i class="fas fa-calendar-plus"></i> Nuevo Período</button><button class="btn btn-primary" id="btn-new-payline"><i class="fas fa-plus"></i> Nueva Liquidación</button></div>` : ''}
      </div>

      ${loadErrors.length ? `
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
          <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
          <p class="text-sm" style="color:#6B7280">${esc(loadErrors.join(' | '))}</p>
        </div>` : ''}

      ${(noEmployees || noPeriods) ? `
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
          <div class="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Configuracion inicial requerida</p>
              <p class="text-sm" style="color:#6B7280">
                ${noEmployees ? 'No hay terceros tipo EMPLEADO activos.' : ''}
                ${noEmployees && noPeriods ? ' ' : ''}
                ${noPeriods ? 'No hay Periodos de nomina creados.' : ''}
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
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
           <h4 class="font-bold" style="color:#0D2137">Períodos de Nómina</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
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
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver liquidaciones" onclick="viewPeriodLines('${esc(p.id)}','${esc(p.name)}','${esc(p.status || 'draft')}')"><i class="fas fa-list-ul"></i></button>
                       ${can('canWrite') && p.status === 'draft' ? `<button class="btn btn-primary btn-sm" title="Aprobar período" onclick="setPeriodStatus('${esc(p.id)}','approved')"><i class="fas fa-check"></i></button>` : ''}
                      ${can('canWrite') && p.status === 'approved' ? `<button class="btn btn-secondary btn-sm" title="Marcar pagada" onclick="setPeriodStatus('${esc(p.id)}','paid')"><i class="fas fa-money-bill-wave"></i></button>` : ''}
                      ${can('canDelete') && p.status === 'draft' ? `<button class="btn btn-outline btn-sm" title="Eliminar período" onclick="deletePayrollPeriod('${esc(p.id)}','${esc(p.name)}')"><i class="fas fa-trash"></i></button>` : ''}
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
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Liquidaciones Recientes</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
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

    $('#btn-new-period')?.addEventListener('click', () => openPeriodForm());
    $('#btn-new-payline')?.addEventListener('click', () => openPayrollLineForm(periods, employees));
    $('#btn-nomina-empleado')?.addEventListener('click', () => openNominaEmployeeSettings(employees));
    $('#btn-nomina-config')?.addEventListener('click', () => openNominaAccountingSettings(employees));
    $('#btn-go-empleados')?.addEventListener('click', () => navigate('terceros'));
    $('#btn-fast-period')?.addEventListener('click', () => openPeriodForm());
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function setPeriodStatus(id, newStatus) {
  const labels = { approved: 'Aprobar', paid: 'Marcar como Pagada' };
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
    if (period.tx_id) {
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
        renderNomina($('#page-content'));
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
                    ${can('canWrite') && periodStatus === 'draft' ? `<button class="btn btn-outline btn-sm" title="Eliminar liquidación" onclick="deletePayrollLine('${esc(l.id)}')"><i class="fas fa-trash"></i></button>` : ''}
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
           ${row('Días trabajados', l.days_worked||30)}
          ${row('Salario proporcional', (l.salary_base||0)/30*(l.days_worked||30))}
          ${overtimeRows}
          ${row('Días auxilio transporte', transportDays)}
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
           ${row('Intereses cesantías (1%)', l.intereses_ces||0)}
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
    <div class="emp-field"><label>Días salario</label><span>${l.days_worked || 30}</span></div>
    <div class="emp-field"><label>Días aux. transporte</label><span>${transportDays}</span></div>
  </div>

  <div class="cols">
    <div class="section">
      <div class="section-title">Devengado</div>
      <table>
        ${slipRow('Salario base (mensual)', l.salary_base || 0)}
        ${slipRow('Salario proporcional', (l.salary_base || 0) / 30 * (l.days_worked || 30))}
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
        ${slipRow('Intereses cesantías (1%)', l.intereses_ces || 0)}
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

function openPeriodForm() {
  openModal(
    'Nuevo Período de Nómina',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Nombre del Período</label><input id="pp-name" class="form-input" placeholder="Ej: Nómina Mayo 2026"></div>
      <div class="form-group"><label class="form-label">Fecha Desde</label><input id="pp-from" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Fecha Hasta</label><input id="pp-to" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Estado Inicial</label><select id="pp-status" class="form-input"><option value="draft">Borrador</option><option value="approved">Aprobada</option></select></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-period">Guardar</button>`
  );
  $('#btn-save-period')?.addEventListener('click', async () => {
    try {
      const payload = { name: getInputVal('pp-name'), date_from: getInputVal('pp-from'), date_to: getInputVal('pp-to'), status: getSelectVal('pp-status') };
      if (!payload.name || !payload.date_from || !payload.date_to) return showToast('Completa los campos obligatorios', 'warning');
      const r = await pb.create('payroll_periods', payload);
      closeModal();
      showToast('Período creado', 'success');
      renderNomina($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function openPayrollLineForm(periods, employees) {
  if (!periods.length) return showToast('Primero crea un período de nómina', 'warning');
  if (!employees.length) return showToast('No hay terceros tipo EMPLEADO activos', 'warning');

  const openPeriods = periods.filter((p) => p.status === 'draft' || !p.status);
  if (!openPeriods.length) return showToast('No hay períodos en estado Borrador para liquidar', 'warning');

  const { config } = await getNominaConfigWithRow();
  const employeesMissingSalary = employees.filter((e) => {
    const rule = getEmployeePayrollRule(config, e.id);
    return !isEmployeePayrollRuleComplete(rule);
  });
  if (employeesMissingSalary.length) {
    const names = employeesMissingSalary.slice(0, 5).map((e) => e.name).join(', ');
    return showToast(`Debes configurar salario básico en todos los empleados activos antes de liquidar. Pendientes: ${names}${employeesMissingSalary.length > 5 ? '...' : ''}`, 'warning');
  }

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
    'Nueva Liquidación de Nómina',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Período</label><select id="pl-period" class="form-input">${openPeriods.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Empleado</label><select id="pl-emp" class="form-input">${employees.map((e) => `<option value="${esc(e.id)}">${esc(e.doc_number)} - ${esc(e.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Salario Base (mensual)</label><input id="pl-salary" class="form-input" value="0"><p class="text-xs mt-1" style="color:#6B7280">Se autocompleta según parámetro del empleado.</p></div>
      <div class="form-group"><label class="form-label">Días salario (max 30)</label><input id="pl-days-salary" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Días auxilio transporte (0 a 30)</label><input id="pl-days-transport" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Auxilio de Transporte mensual</label><input id="pl-aux" class="form-input" value="200000" title="2026: $200.000"><p class="text-xs mt-1" style="color:#6B7280">Se liquida proporcional con los días de auxilio.</p></div>
      <div class="form-group"><label class="form-label">Otras Deducciones</label><input id="pl-ded-other" class="form-input" value="0" placeholder="Deducciones varias no clasificadas"></div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Horas extra y recargos — jornada ${config.company_rules?.weekly_hours || 44} h/semana (valor hora = salario / ${(config.company_rules?.weekly_hours || 44) * 5})</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${overtimeInputs}</div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
      <p class="font-semibold mb-2" style="color:#0D2137">Devengos adicionales (débito)</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">${earningInputs}</div>
    </div>

    <div class="rounded-xl p-3 mt-4" style="background:#F8FAFC;border:1px solid #E2E8F0">
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
    const salaryDays = parseNum(getInputVal('pl-days-salary')) || 30;
    const transportDays = parseNum(getInputVal('pl-days-transport')) || 0;
    const auxMonthly = parseNum(getInputVal('pl-aux'));
    const aux = round2((auxMonthly / 30) * transportDays);
    const dedOther = parseNum(getInputVal('pl-ded-other'));
    const employeeId = getSelectVal('pl-emp');
    if (salary <= 0) return;

    const overtimeMeta = getOvertimeFromForm(salary);
    const ot = overtimeMeta.total_amount;
    const conceptAmounts = getConceptAmountsFromForm();
    const extraEarnings = round2(NOMINA_EXTRA_EARNING_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));
    const extraDedConcepts = round2(NOMINA_EXTRA_DEDUCTION_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));

    const empRule = getEmployeePayrollRule(config, employeeId);
    const companyRules = config.company_rules || defaultNominaConfig().company_rules;

    const salProp = (salary / 30) * salaryDays;
    const baseSal = salProp + ot;
    const devengado = baseSal + aux + extraEarnings;
    const dedSalud = baseSal * 0.04;
    const dedPension = empRule.is_pensioner ? 0 : (baseSal * 0.04);

    const threshold = (companyRules.smmlv || 1423500) * (companyRules.solidarity_threshold_smmlv || 3);
    const dedSolidarity = (empRule.apply_solidarity_fund && baseSal >= threshold)
      ? (baseSal * (companyRules.solidarity_rate || 0.01))
      : 0;
    const dedWithholding = empRule.apply_withholding_tax ? (baseSal * (empRule.withholding_rate || 0)) : 0;
    const dedTotal = dedSalud + dedPension + dedSolidarity + dedWithholding + dedOther + extraDedConcepts;
    const neto = devengado - dedTotal;

    const arlRate = ARL_RISK_RATES[empRule.arl_risk_level] || ARL_RISK_RATES[1];
    const senaRate = companyRules.exempt_sena_icbf ? 0 : 0.02;
    const icbfRate = companyRules.exempt_sena_icbf ? 0 : 0.03;
    const para = baseSal * (0.085 + 0.12 + arlRate + senaRate + icbfRate + 0.04);
    const prov = baseSal * (0.0833 + 0.01 * 0.0833 + 0.0833 + 0.0417);

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
    ...NOMINA_OVERTIME_TYPES.map((t) => `pl-ot-${t.key}`),
    ...NOMINA_EXTRA_EARNING_KEYS.map((k) => `pl-cpt-${k}`),
    ...NOMINA_EXTRA_DEDUCTION_KEYS.map((k) => `pl-cpt-${k}`),
  ];
  watchedInputs.forEach((id) => $('#' + id)?.addEventListener('input', debounce(() => { calcPreview(); }, 250)));

  const applyEmployeeDefaults = () => {
    const employeeId = getSelectVal('pl-emp');
    const empRule = getEmployeePayrollRule(config, employeeId);
    if ((empRule.basic_salary || 0) > 0) {
      setInputVal('pl-salary', String(round2(empRule.basic_salary)));
    }
  };

  $('#pl-emp')?.addEventListener('change', () => {
    applyEmployeeDefaults();
    calcPreview();
  });

  applyEmployeeDefaults();
  calcPreview();

  $('#btn-save-pl')?.addEventListener('click', async () => {
    const btn = $('#btn-save-pl');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    try {
      const salary = parseNum(getInputVal('pl-salary'));
      const salaryDays = parseNum(getInputVal('pl-days-salary')) || 30;
      const transportDays = parseNum(getInputVal('pl-days-transport')) || 0;
      const auxMonthly = parseNum(getInputVal('pl-aux'));
      const aux = round2((auxMonthly / 30) * transportDays);
      const dedOther = parseNum(getInputVal('pl-ded-other'));
      const employeeId = getSelectVal('pl-emp');

      if (salary <= 0) return showToast('El salario base debe ser mayor a cero', 'warning');
      if (salaryDays <= 0 || salaryDays > 30) return showToast('Días salario debe estar entre 1 y 30', 'warning');
      if (transportDays < 0 || transportDays > 30) return showToast('Días auxilio transporte debe estar entre 0 y 30', 'warning');

      const periodId = getSelectVal('pl-period');
      if (!periodId) return showToast('Selecciona un Periodo', 'warning');
      const period = await pb.get('payroll_periods', periodId);
      if ((period.status || 'draft') !== 'draft') {
        return showToast('El Periodo seleccionado no esta en borrador. No se pueden registrar nuevas liquidaciones.', 'error');
      }

      const overtimeMeta = getOvertimeFromForm(salary);
      const ot = overtimeMeta.total_amount;
      const conceptAmounts = getConceptAmountsFromForm();
      const extraEarnings = round2(NOMINA_EXTRA_EARNING_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));
      const extraDedConcepts = round2(NOMINA_EXTRA_DEDUCTION_KEYS.reduce((sum, key) => sum + (conceptAmounts[key] || 0), 0));

      const salaryProportional = (salary / 30) * salaryDays;
      const baseSalarial = salaryProportional + ot;
      const devengado = baseSalarial + aux + extraEarnings;

      const empRule = getEmployeePayrollRule(config, employeeId);
      if (!isEmployeePayrollRuleComplete(empRule)) {
        return showToast('El empleado no tiene salario básico configurado en Parámetros por Empleado.', 'warning');
      }
      const companyRules = config.company_rules || defaultNominaConfig().company_rules;

      const deductionHealth = baseSalarial * 0.04;
      const deductionPension = empRule.is_pensioner ? 0 : (baseSalarial * 0.04);
      const threshold = (companyRules.smmlv || 1423500) * (companyRules.solidarity_threshold_smmlv || 3);
      const solidarityFund = (empRule.apply_solidarity_fund && baseSalarial >= threshold)
        ? (baseSalarial * (companyRules.solidarity_rate || 0.01))
        : 0;
      const withholdingTax = empRule.apply_withholding_tax ? (baseSalarial * (empRule.withholding_rate || 0)) : 0;
      const deductionOther = dedOther;

      const employerHealth = baseSalarial * 0.085;
      const employerPension = baseSalarial * 0.12;
      const arlRate = ARL_RISK_RATES[empRule.arl_risk_level] || ARL_RISK_RATES[1];
      const employerArl = baseSalarial * arlRate;
      const sena = companyRules.exempt_sena_icbf ? 0 : (baseSalarial * 0.02);
      const icbf = companyRules.exempt_sena_icbf ? 0 : (baseSalarial * 0.03);
      const cajaComp = baseSalarial * 0.04;
      const cesantias = baseSalarial * 0.0833;
      const interesesCes = cesantias * 0.01;
      const prima = baseSalarial * 0.0833;
      const vacaciones = baseSalarial * 0.0417;
      const netPay = devengado - deductionHealth - deductionPension - solidarityFund - withholdingTax - deductionOther - extraDedConcepts;

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

      await pb.create('payroll_lines', payload);
      closeModal();
      showToast('Liquidación registrada', 'success');
      renderNomina($('#page-content'));
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

