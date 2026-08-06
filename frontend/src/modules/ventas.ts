/**
 * GRAVY v2.0 — ventas.ts
 * Módulo Comercial de Ventas y Facturación.
 * Rediseñado con paridad total al módulo de Compras para consistencia del sistema.
 */

'use strict';

interface InvoiceStatusDetail {
  label: string;
  badge: string;
}

const INV_STATUS: Record<string, InvoiceStatusDetail> = {
  draft:  { label: 'Borrador',       badge: 'badge-orange' },
  posted: { label: 'Contabilizada',  badge: 'badge-green'  },
  voided: { label: 'Anulada',        badge: 'badge-red'    },
};

const SALES_CONFIG_KEY = 'sales_settings_v2';
const SO_IVA_RATES = [0, 5, 19];

// --- Helper para Conversión Dinámica de Cantidades ---
function convertQtyToUnits(qty: number, fromUnit: string, baseUnit: string, largoCm: number, anchoCm: number, undEmpaque: number, pesoBruto: number) {
  const areaPorFicha = (largoCm * anchoCm) / 10000;
  const areaPorCaja = areaPorFicha * undEmpaque;
  const pesoPorFicha = undEmpaque > 0 ? (pesoBruto / undEmpaque) : 0;

  // 1. Convertir a M2 como unidad intermedia
  let qtyInM2 = 0;
  if (fromUnit === 'M2') {
    qtyInM2 = qty;
  } else if (fromUnit === 'CJ') {
    qtyInM2 = qty * areaPorCaja;
  } else if (fromUnit === 'UND') {
    qtyInM2 = qty * areaPorFicha;
  } else if (fromUnit === 'KG') {
    const cajas = pesoBruto > 0 ? (qty / pesoBruto) : 0;
    qtyInM2 = cajas * areaPorCaja;
  } else {
    qtyInM2 = qty;
  }

  // 2. Convertir de M2 a la unidad base de inventario
  let qtyBase = 0;
  if (baseUnit === 'M2') {
    qtyBase = qtyInM2;
  } else if (baseUnit === 'UND') {
    qtyBase = areaPorFicha > 0 ? (qtyInM2 / areaPorFicha) : qty;
  } else if (baseUnit === 'CJ') {
    qtyBase = areaPorCaja > 0 ? (qtyInM2 / areaPorCaja) : qty;
  } else if (baseUnit === 'KG') {
    const pesoPorM2 = areaPorCaja > 0 ? (pesoBruto / areaPorCaja) : 0;
    qtyBase = pesoPorM2 > 0 ? (qtyInM2 * pesoPorM2) : qty;
  } else {
    qtyBase = qty;
  }

  return {
    baseQty: qtyBase,
    m2: qtyInM2,
    cajas: areaPorCaja > 0 ? (qtyInM2 / areaPorCaja) : 0,
    unidades: areaPorFicha > 0 ? (qtyInM2 / areaPorFicha) : 0,
    pesoKg: areaPorCaja > 0 ? ((qtyInM2 / areaPorCaja) * pesoBruto) : 0
  };
}

// --- Valores por Defecto ---
function defaultSalesConfig() {
  return {
    operational: {
      require_warehouse_for_goods: true,
      enable_discounts: true,
      enable_freight: false,
      enable_withholdings: true,
      withholdings: {
        reterenta: true,
        reteiva: false,
        reteica: true,
      },
      default_due_days: 30,
      immediate_posting: false,
      print_format: 'carta_standard',
      document_title: 'Factura de Venta',
      prices_include_iva: false,
      allow_price_edit: true,
      allow_negative_stock: false,
      default_warehouse_id: '',
      enable_multi_unit_conversions: false,
      dian_dependent_posting: false,
    },
    accounting: {
      accounts: {
        receivable_code: '13050501',
        income_fallback_code: '41359501',
        cost_fallback_code: '61359501',
        inventory_fallback_code: '14350501',
        iva_by_rate: {
          '0': '233501',
          '5': '233501',
          '19': '233501',
        },
        discount_code: '',
        freight_code: '',
        cash_code: '',
        refund_code: '',
        inventory_loss_code: '531520',
      },
      withholding_rules: [
        { id: 'wr-renta-2.5', concept: 'RETERENTA', base_type: 'SUBTOTAL', min_base: 1100000, rate: 2.5, account_code: '135515' },
        { id: 'wr-ica-0.4', concept: 'RETEICA', base_type: 'SUBTOTAL', min_base: 0, rate: 0.414, account_code: '135518' },
      ],
    },
  };
}

function normalizeSalesConfig(cfg: any) {
  const base = defaultSalesConfig();
  const op = cfg?.operational || {};
  const acc = cfg?.accounting?.accounts || {};
  const ivaByRate: any = {};
  
  if (acc.iva_by_rate && typeof acc.iva_by_rate === 'object') {
    Object.keys(acc.iva_by_rate).forEach(r => {
      const c = String(acc.iva_by_rate[r] || '').trim();
      if (c) ivaByRate[r] = c;
    });
  }

  const normalizedRules = (cfg?.accounting?.withholding_rules || [])
    .map((r: any) => ({
      id: String(r?.id || `wr-${Date.now()}-${Math.random()}`),
      concept: String(r?.concept || '').trim().toUpperCase(),
      base_type: String(r?.base_type || 'SUBTOTAL').trim().toUpperCase(),
      min_base: Math.max(0, Number(r?.min_base || 0) || 0),
      rate: Math.max(0, Number(r?.rate || 0) || 0),
      account_code: String(r?.account_code || '').trim(),
    }))
    .filter((r: any) => r.concept && r.rate > 0);

  return {
    operational: {
      require_warehouse_for_goods: op.require_warehouse_for_goods !== false,
      enable_discounts: op.enable_discounts !== false,
      enable_freight: op.enable_freight === true,
      enable_withholdings: op.enable_withholdings !== false,
      withholdings: {
        reterenta: op?.withholdings?.reterenta !== false,
        reteiva: !!op?.withholdings?.reteiva,
        reteica: op?.withholdings?.reteica !== false,
      },
      default_due_days: Math.max(0, Number(op.default_due_days ?? base.operational.default_due_days) || 0),
      immediate_posting: op.immediate_posting === true,
      print_format: String(op.print_format || 'carta_standard'),
      document_title: String(op.document_title || 'Factura de Venta'),
      prices_include_iva: op.prices_include_iva === true,
      allow_price_edit: op.allow_price_edit !== false,
      allow_negative_stock: op.allow_negative_stock === true,
      default_warehouse_id: String(op.default_warehouse_id || '').trim(),
      enable_multi_unit_conversions: op.enable_multi_unit_conversions === true,
      dian_dependent_posting: op.dian_dependent_posting === true,
    },
    accounting: {
      accounts: {
        receivable_code: String(acc.receivable_code || base.accounting.accounts.receivable_code).trim(),
        income_fallback_code: String(acc.income_fallback_code || base.accounting.accounts.income_fallback_code).trim(),
        cost_fallback_code: String(acc.cost_fallback_code || base.accounting.accounts.cost_fallback_code).trim(),
        inventory_fallback_code: String(acc.inventory_fallback_code || base.accounting.accounts.inventory_fallback_code).trim(),
        iva_by_rate: Object.keys(ivaByRate).length ? ivaByRate : { ...base.accounting.accounts.iva_by_rate },
        discount_code: String(acc.discount_code || '').trim(),
        freight_code: String(acc.freight_code || '').trim(),
        cash_code: String(acc.cash_code || '').trim(),
        refund_code: String(acc.refund_code || '').trim(),
      },

      withholding_rules: normalizedRules.length ? normalizedRules : [...base.accounting.withholding_rules],
    },
  };
}

async function getSalesConfig() {
  try {
    const raw = await (window as any).API.getSetting(SALES_CONFIG_KEY);
    if (!raw) return defaultSalesConfig();
    return normalizeSalesConfig(JSON.parse(raw));
  } catch {
    return defaultSalesConfig();
  }
}

async function saveSalesConfig(cfg: any) {
  const normalized = normalizeSalesConfig(cfg || {});
  await (window as any).API.setSetting(SALES_CONFIG_KEY, JSON.stringify(normalized));
  await (window as any).API.logAudit('CONFIG', 'SalesConfig', null, 'Configuración de ventas y cartera actualizada');
  return normalized;
}

// --- Configuración Comercial de Ventas Modal ---
async function openSalesSettingsModal(onSaved: any = null) {
  try {
    const [cfg, accounts, warehouses] = await Promise.all([
      getSalesConfig(),
      (window as any).API.getAccounts(true),
      (window as any).API.getWarehouses(true).catch(() => []),
    ]);

    const warehouseOptions = (selectedId = '') => {
      return `<option value="">— Ninguna (Seleccionar al vender) —</option>${warehouses.map((w: any) => `<option value="${(window as any).esc(w.id)}"${w.id === selectedId ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}`;
    };

    const accountOptions = (selectedCode = '') => {
      const rows = accounts
        .filter((a: any) => a.active && Number(a.level) >= 3)
        .sort((a: any, b: any) => a.code.localeCompare(b.code));
      return `<option value="">— Sin definir —</option>${rows.map((a: any) => `<option value="${(window as any).esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${(window as any).esc(a.code)} — ${(window as any).esc(a.name)}</option>`).join('')}`;
    };

    const initialIvaRates = Array.from(new Set([
      ...SO_IVA_RATES.map(r => String(r)),
      ...Object.keys(cfg.accounting.accounts.iva_by_rate || {}),
    ])).sort((a, b) => Number(a) - Number(b));

    const formHtml = `
      <div class="space-y-5" style="color:#374151">
        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-sliders mr-2"></i>Parámetros operativos</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Define opciones habilitadas para la facturación de ventas.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label class="inline-flex items-center gap-2"><input id="so-cfg-req-wh" type="checkbox" ${cfg.operational.require_warehouse_for_goods ? 'checked' : ''}>Exigir bodega cuando hay bienes</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-discount" type="checkbox" ${cfg.operational.enable_discounts ? 'checked' : ''}>Habilitar descuentos</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-freight" type="checkbox" ${cfg.operational.enable_freight ? 'checked' : ''}>Habilitar fletes en ventas</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-withholding" type="checkbox" ${cfg.operational.enable_withholdings ? 'checked' : ''}>Habilitar retenciones (a favor)</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-prices-include-iva" type="checkbox" ${cfg.operational.prices_include_iva ? 'checked' : ''}>Precios incluyen IVA (precio tax-in)</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-allow-price-edit" type="checkbox" ${cfg.operational.allow_price_edit ? 'checked' : ''}>Permitir editar precio en venta</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-allow-negative-stock" type="checkbox" ${cfg.operational.allow_negative_stock ? 'checked' : ''}>Permitir stock negativo</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-multi-unit" type="checkbox" ${cfg.operational.enable_multi_unit_conversions ? 'checked' : ''}>Habilitar conversión de unidades dinámica (Pisos/Peso/M2)</label>
            <label class="inline-flex items-center gap-2 md:col-span-2"><input id="so-cfg-immediate-posting" type="checkbox" ${cfg.operational.immediate_posting ? 'checked' : ''}><strong>Contabilización inmediata al guardar (Evitar Borrador)</strong></label>
            <label class="inline-flex items-center gap-2 md:col-span-2"><input id="so-cfg-dian-dependent" type="checkbox" ${cfg.operational.dian_dependent_posting ? 'checked' : ''}><strong>Vincular Contabilización a Firma DIAN (Firmar y Contabilizar)</strong></label>
            
            <div class="form-group mb-0">
              <label class="form-label">Bodega por Defecto</label>
              <select id="so-cfg-default-warehouse" class="form-input">
                ${warehouseOptions(cfg.operational.default_warehouse_id)}
              </select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Plazo por defecto (días)</label>
              <input id="so-cfg-default-due" class="form-input" type="number" min="0" step="1" value="${(window as any).esc(String(cfg.operational.default_due_days || 0))}">
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Título del Documento Impreso</label>
              <input id="so-cfg-doc-title" class="form-input" type="text" placeholder="Ej: Factura de Venta, Remisión" value="${(window as any).esc(String(cfg.operational.document_title || 'Factura de Venta'))}">
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Formato de Impresión (Carta)</label>
              <select id="so-cfg-print-format" class="form-input">
                <option value="carta_standard"${cfg.operational.print_format === 'carta_standard' ? ' selected' : ''}>Carta Estándar (Tradicional)</option>
                <option value="carta_compact"${cfg.operational.print_format === 'carta_compact' ? ' selected' : ''}>Carta Compacto (Optimizado en espacio)</option>
                <option value="carta_modern"${cfg.operational.print_format === 'carta_modern' ? ' selected' : ''}>Carta Moderno (Diseño minimalista premium)</option>
                <option value="carta_remision"${cfg.operational.print_format === 'carta_remision' ? ' selected' : ''}>Carta Remisión (Logística y Entrega simplificada)</option>
              </select>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <label class="inline-flex items-center gap-2"><input id="so-cfg-ret-renta" type="checkbox" ${cfg.operational.withholdings.reterenta ? 'checked' : ''}>ReteRenta</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-ret-iva" type="checkbox" ${cfg.operational.withholdings.reteiva ? 'checked' : ''}>ReteIVA</label>
            <label class="inline-flex items-center gap-2"><input id="so-cfg-ret-ica" type="checkbox" ${cfg.operational.withholdings.reteica ? 'checked' : ''}>ReteICA</label>
          </div>
        </div>

        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-book mr-2"></i>Parámetros contables</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Estas cuentas se usan en la contabilización automática de la venta.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Clientes Nacionales (Dr)</label>
              <select id="so-cfg-receivable" class="form-input">${accountOptions(cfg.accounting.accounts.receivable_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Efectivo (Caja)</label>
              <select id="so-cfg-cash-acct" class="form-input">${accountOptions(cfg.accounting.accounts.cash_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Ingresos por Defecto (Clase 41)</label>
              <select id="so-cfg-inc-fallback" class="form-input">${accountOptions(cfg.accounting.accounts.income_fallback_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Costo de Ventas por Defecto (Clase 61)</label>
              <select id="so-cfg-cost-fallback" class="form-input">${accountOptions(cfg.accounting.accounts.cost_fallback_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Inventarios por Defecto (Clase 14)</label>
              <select id="so-cfg-inv-fallback" class="form-input">${accountOptions(cfg.accounting.accounts.inventory_fallback_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Descuentos Concedidos</label>
              <select id="so-cfg-discount-acct" class="form-input">${accountOptions(cfg.accounting.accounts.discount_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Fletes Cobrados</label>
              <select id="so-cfg-freight-acct" class="form-input">${accountOptions(cfg.accounting.accounts.freight_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Devolución Ventas (NC)</label>
              <select id="so-cfg-refund-acct" class="form-input">${accountOptions(cfg.accounting.accounts.refund_code)}</select>
            </div>
          </div>
          <div class="mt-4 rounded-xl border p-3" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Cuentas IVA Generado por tarifa</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-so-cfg-add-iva-rate"><i class="fas fa-plus"></i> Agregar tarifa</button>
            </div>
            <div id="so-cfg-iva-rates-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">La contabilización buscará la cuenta de pasivo según el IVA % de cada línea.</p>
          </div>
          <div class="mt-4 rounded-xl border p-3" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Reglas de Retenciones A Favor (base/tarifa/concepto)</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-so-cfg-add-ret-rule"><i class="fas fa-plus"></i> Agregar regla</button>
            </div>
            <div id="so-cfg-ret-rules-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">Cada regla define concepto de activo (ej: 1355 ReteFuente), base mínima, tarifa y cuenta contable.</p>
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-so-config"><i class="fas fa-floppy-disk"></i> Guardar configuración</button>
    `;

    (window as any).openModal('Configuración Comercial de Ventas', formHtml, footer, true);

    const ivaWrap = document.getElementById('so-cfg-iva-rates-wrap');
    const addIvaRateRow = (rate = '', accountCode = '') => {
      if (!ivaWrap) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <div class="col-span-3">
          <input class="form-input so-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${(window as any).esc(String(rate || ''))}">
        </div>
        <div class="col-span-8">
          <select class="form-input so-cfg-iva-acct">${accountOptions(accountCode)}</select>
        </div>
        <div class="col-span-1 text-right">
          <button type="button" class="btn btn-danger btn-sm so-cfg-iva-del"><i class="fas fa-trash"></i></button>
        </div>`;
      row.querySelector('.so-cfg-iva-del')?.addEventListener('click', () => row.remove());
      ivaWrap.appendChild(row);
    };

    if (initialIvaRates.length) {
      initialIvaRates.forEach((rate) => addIvaRateRow(rate, cfg.accounting.accounts.iva_by_rate?.[rate] || ''));
    } else {
      addIvaRateRow('19', '');
    }
    document.getElementById('btn-so-cfg-add-iva-rate')?.addEventListener('click', () => addIvaRateRow('', ''));

    const retWrap = document.getElementById('so-cfg-ret-rules-wrap');
    const conceptOpts = ['RETERENTA', 'RETEIVA', 'RETEICA', 'OTRA'];
    const baseTypeOpts = ['SUBTOTAL', 'IVA', 'TOTAL'];
    const addRetRuleRow = (rule: any = {}) => {
      if (!retWrap) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <div class="col-span-2"><select class="form-input so-cfg-ret-concept">${conceptOpts.map(o => `<option value="${o}"${String(rule.concept || '') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="col-span-2"><select class="form-input so-cfg-ret-base-type">${baseTypeOpts.map(o => `<option value="${o}"${String(rule.base_type || 'SUBTOTAL') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="col-span-2"><input class="form-input so-cfg-ret-min-base" type="number" min="0" step="0.01" placeholder="Base mín." value="${(window as any).esc(String(rule.min_base ?? 0))}"></div>
        <div class="col-span-2"><input class="form-input so-cfg-ret-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${(window as any).esc(String(rule.rate ?? 0))}"></div>
        <div class="col-span-3"><select class="form-input so-cfg-ret-account">${accountOptions(rule.account_code || '')}</select></div>
        <div class="col-span-1 text-right"><button type="button" class="btn btn-danger btn-sm so-cfg-ret-del"><i class="fas fa-trash"></i></button></div>`;
      row.querySelector('.so-cfg-ret-del')?.addEventListener('click', () => row.remove());
      retWrap.appendChild(row);
    };

    const initialRules = Array.isArray(cfg.accounting.withholding_rules) ? cfg.accounting.withholding_rules : [];
    if (initialRules.length) {
      initialRules.forEach((r) => addRetRuleRow(r));
    } else {
      addRetRuleRow({ concept: 'RETERENTA', base_type: 'SUBTOTAL', min_base: 0, rate: 2.5, account_code: '' });
    }
    document.getElementById('btn-so-cfg-add-ret-rule')?.addEventListener('click', () => addRetRuleRow({ concept: 'RETERENTA', base_type: 'SUBTOTAL', min_base: 0, rate: 0, account_code: '' }));

    document.getElementById('btn-save-so-config')?.addEventListener('click', async () => {
      try {
        const ivaByRate: any = {};
        (document.querySelectorAll('#so-cfg-iva-rates-wrap .grid') || []).forEach((row) => {
          const rate = String((row.querySelector('.so-cfg-iva-rate') as HTMLInputElement)?.value || '').trim();
          const acct = String((row.querySelector('.so-cfg-iva-acct') as HTMLSelectElement)?.value || '').trim();
          if (!rate) return;
          ivaByRate[rate] = acct;
        });

        const withholdingRules: any[] = [];
        (document.querySelectorAll('#so-cfg-ret-rules-wrap .grid') || []).forEach((row, idx) => {
          const concept = String((row.querySelector('.so-cfg-ret-concept') as HTMLSelectElement)?.value || '').trim().toUpperCase();
          const baseType = String((row.querySelector('.so-cfg-ret-base-type') as HTMLSelectElement)?.value || 'SUBTOTAL').trim().toUpperCase();
          const minBase = Math.max(0, Number((row.querySelector('.so-cfg-ret-min-base') as HTMLInputElement)?.value || 0) || 0);
          const rate = Math.max(0, Number((row.querySelector('.so-cfg-ret-rate') as HTMLInputElement)?.value || 0) || 0);
          const accountCode = String((row.querySelector('.so-cfg-ret-account') as HTMLSelectElement)?.value || '').trim();
          if (!concept || rate <= 0) return;
          withholdingRules.push({
            id: `wr-sales-${Date.now()}-${idx}`,
            concept,
            base_type: baseType,
            min_base: minBase,
            rate,
            account_code: accountCode,
          });
        });

        const getCheckVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked;
        const getInputVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value;
        const getSelectVal = (id: string) => (document.getElementById(id) as HTMLSelectElement)?.value;

        const payload = {
          operational: {
            require_warehouse_for_goods: getCheckVal('so-cfg-req-wh'),
            enable_discounts: getCheckVal('so-cfg-discount'),
            enable_freight: getCheckVal('so-cfg-freight'),
            enable_withholdings: getCheckVal('so-cfg-withholding'),
            default_due_days: Math.max(0, parseInt(getInputVal('so-cfg-default-due') || '0', 10) || 0),
            withholdings: {
              reterenta: getCheckVal('so-cfg-ret-renta'),
              reteiva: getCheckVal('so-cfg-ret-iva'),
              reteica: getCheckVal('so-cfg-ret-ica'),
            },
            immediate_posting: getCheckVal('so-cfg-immediate-posting'),
            dian_dependent_posting: getCheckVal('so-cfg-dian-dependent'),
            print_format: getSelectVal('so-cfg-print-format') || 'carta_standard',
            document_title: getInputVal('so-cfg-doc-title') || 'Factura de Venta',
            prices_include_iva: getCheckVal('so-cfg-prices-include-iva'),
            allow_price_edit: getCheckVal('so-cfg-allow-price-edit'),
            allow_negative_stock: getCheckVal('so-cfg-allow-negative-stock'),
            default_warehouse_id: getSelectVal('so-cfg-default-warehouse') || '',
            enable_multi_unit_conversions: getCheckVal('so-cfg-multi-unit'),
          },
          accounting: {
            accounts: {
              receivable_code: getSelectVal('so-cfg-receivable') || '130505',
              income_fallback_code: getSelectVal('so-cfg-inc-fallback') || '413505',
              cost_fallback_code: getSelectVal('so-cfg-cost-fallback') || '613595',
              inventory_fallback_code: getSelectVal('so-cfg-inv-fallback') || '143505',
              iva_by_rate: ivaByRate,
              discount_code: getSelectVal('so-cfg-discount-acct') || '',
              freight_code: getSelectVal('so-cfg-freight-acct') || '',
              cash_code: getSelectVal('so-cfg-cash-acct') || '',
              refund_code: getSelectVal('so-cfg-refund-acct') || '',
            },
            withholding_rules: withholdingRules,
          },
        };

        await saveSalesConfig(payload);
        (window as any).showToast('Configuración comercial de ventas guardada', 'success');
        (window as any).closeModal();
        if (typeof onSaved === 'function') onSaved();
      } catch (err: any) {
        (window as any).showToast(err.message || 'No se pudo guardar la configuración', 'error');
      }
    });
  } catch (err: any) {
    (window as any).showToast(err.message || 'No se pudo abrir la configuración comercial', 'error');
  }
}

// --- Render Principal ---
export async function renderVentas(container?: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((c: any) => c || document.getElementById('page-content'));
  const target = getContainer(container);
  if (!target) return;
  target.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando historial de facturación...</div>`;
  try {
    await _loadVentasPage(target);
  } catch (err: any) {
    target.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadVentasPage(c: HTMLElement) {
  const [result, soConfig] = await Promise.all([
    (window as any).API.getInvoices({ page: 1, perPage: 200, sort: '-date,-number' }),
    getSalesConfig(),
  ]);
  (window as any).__soConfig = soConfig;
  const invoices = result.items || [];

  const total = invoices.length;
  const draft = invoices.filter((i: any) => i.status === 'draft').length;
  const posted = invoices.filter((i: any) => i.status === 'posted').length;
  const totalVal = invoices.filter((i: any) => i.status !== 'voided').reduce((s: number, i: any) => s + (i.payable_total ?? i.total ?? 0), 0);

  const prefixes = [...new Set(invoices.map((i: any) => {
    const num = String(i.number || '').trim();
    return num.includes('-') ? num.split('-')[0].toUpperCase() : 'SIN_PREFIJO';
  }))].filter(Boolean).sort();

  c.innerHTML = `
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Ventas y Facturación Comercial</h3>
        <p class="text-sm" style="color:#6B7280">Facturas de venta con contabilización automática, cálculo de costo de ventas (COGS) e integración de Kardex.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline" id="btn-so-config" title="Configuración comercial"><i class="fas fa-gear"></i></button>
        <button class="btn btn-primary" id="btn-new-sales"><i class="fas fa-plus"></i> Nueva Factura de Venta (FV)</button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${salesKpi('Total facturas',      total,                     'fas fa-file-invoice-dollar', '#1A4B8C', '#EEF4FF')}
      ${salesKpi('Borradores',          draft,                     'fas fa-pencil',              '#C46516', '#FFF8F0')}
      ${salesKpi('Contabilizadas',      posted,                    'fas fa-check-circle',        '#059669', '#ECFDF5')}
      ${salesKpi('Valor total ventas',  (window as any).fmt(totalVal), 'fas fa-coins',               '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="so-q" class="form-input flex-1 min-w-48" placeholder="Buscar número de factura, cliente, NIT o notas...">
      <select id="so-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="draft">Borrador</option>
        <option value="posted">Contabilizada</option>
        <option value="voided">Anulada</option>
      </select>
      <select id="so-prefix-f" class="form-input" style="max-width:180px">
        <option value="">Todos los prefijos</option>
        ${prefixes.map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
      <input id="so-from" type="date" class="form-input" style="max-width:160px" title="Desde">
      <input id="so-to"   type="date" class="form-input" style="max-width:160px" title="Hasta">
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="so-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Forma Pago</th>
              <th>Bodega</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA</th>
              <th class="text-right">Total Neto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="so-tbody">
            ${invoices.length ? invoices.map(renderSoRow).join('') : `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice-dollar mr-2"></i>No hay facturas de venta.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('btn-new-sales')?.addEventListener('click', () => openSalesForm(null, () => _loadVentasPage(c)));
  document.getElementById('btn-so-config')?.addEventListener('click', () => openSalesSettingsModal(() => _loadVentasPage(c)));

  const applySoFilter = () => filterSoTable();
  document.getElementById('so-q')?.addEventListener('input', applySoFilter);
  document.getElementById('so-status-f')?.addEventListener('change', applySoFilter);
  document.getElementById('so-prefix-f')?.addEventListener('change', applySoFilter);
  document.getElementById('so-from')?.addEventListener('change', applySoFilter);
  document.getElementById('so-to')?.addEventListener('change', applySoFilter);

  const tbl = document.getElementById('so-table') as HTMLTableElement;
  if (tbl) (window as any).makeTableSortable(tbl);
}

function renderSoRow(inv: any) {
  const meta = INV_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
  const client = inv.expand?.customer_id;
  const wh = inv.expand?.warehouse_id;
  const num = String(inv.number || '').trim();
  const prefix = num.includes('-') ? num.split('-')[0].toUpperCase() : 'SIN_PREFIJO';
  const deliveryStatus = String(inv.delivery_fulfillment_status || '').trim().toUpperCase();
  const deliveryBadge = deliveryStatus === 'ENTREGADO'
    ? '<span class="badge badge-green">Entrega: Completada</span>'
    : deliveryStatus === 'PARCIAL'
      ? '<span class="badge badge-blue">Entrega: Parcial</span>'
      : (inv.has_pending_delivery ? '<span class="badge badge-orange">Entrega: Pendiente</span>' : '');

  const isDianDep = !!(window as any).__soConfig?.operational?.dian_dependent_posting;
  const isElec = inv.is_electronic !== false;
  const isFirmar = isDianDep && isElec;

  return `
    <tr data-soid="${(window as any).esc(inv.id)}" data-sostatus="${(window as any).esc(inv.status)}" data-sodate="${(window as any).esc(inv.date)}" data-soprefix="${(window as any).esc(prefix)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(inv.number)}</span></td>
      <td>${(window as any).esc(inv.date)}</td>
      <td class="font-medium">${client ? (window as any).esc(client.name) : '—'}</td>
      <td class="text-sm" style="color:#6B7280">${(window as any).esc(inv.payment_method)}</td>
      <td class="text-sm">${wh ? (window as any).esc(wh.name) : '—'}</td>
      <td class="text-right">${(window as any).fmt(inv.subtotal || 0)}</td>
      <td class="text-right">${inv.iva_total ? (window as any).fmt(inv.iva_total) : '—'}</td>
      <td class="text-right font-semibold">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</td>
      <td>
        <div class="flex flex-col gap-1">
          <span class="badge ${meta.badge}">${meta.label}</span>
          ${deliveryBadge}
        </div>
      </td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewSalesInvoiceDetail('${(window as any).esc(inv.id)}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm text-teal-600" title="Duplicar Factura (Crear borrador)" onclick="window.duplicateSalesInvoice('${(window as any).esc(inv.id)}')"><i class="fas fa-clone"></i></button>
          ${inv.status === 'draft' ? `
            <button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="window.editSalesInvoice('${(window as any).esc(inv.id)}')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-primary btn-sm" title="${isFirmar ? 'Firmar y Contabilizar' : 'Contabilizar'}" onclick="window.contabilizarVenta('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}', ${isFirmar})"><i class="${isFirmar ? 'fas fa-paper-plane' : 'fas fa-check'}"></i> ${isFirmar ? 'Firmar y Contabilizar' : 'Contabilizar'}</button>
            <button class="btn btn-danger btn-sm" title="Eliminar Borrador" onclick="window.deleteSalesInvoiceDraft('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-trash"></i></button>
          ` : ''}
          ${inv.status === 'posted' ? `
            <button class="btn btn-outline btn-sm" title="Generar Ajuste / Nota DIAN" style="border-color:#8B5CF6;color:#8B5CF6" onclick="window.openSalesNotePreModal('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-file-invoice-dollar"></i></button>
            <button class="btn btn-danger btn-sm" title="Anular Factura" onclick="window.voidSalesInvoiceDirect('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-ban"></i></button>
            ${inv.tx_id ? `<button class="btn btn-outline btn-sm text-purple-600" style="border-color:#7C3AED;color:#7C3AED" title="Ver comprobante" onclick="window.seeSalesTxDetail('${(window as any).esc(inv.tx_id)}')"><i class="fas fa-book-open"></i></button>` : ''}
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

function filterSoTable() {
  const q = ((document.getElementById('so-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const st = (document.getElementById('so-status-f') as HTMLSelectElement)?.value || '';
  const prefixF = (document.getElementById('so-prefix-f') as HTMLSelectElement)?.value || '';
  const from = (document.getElementById('so-from') as HTMLInputElement)?.value || '';
  const to = (document.getElementById('so-to') as HTMLInputElement)?.value || '';

  const rows = document.querySelectorAll('#so-table tbody tr[data-soid]');
  rows.forEach((row: any) => {
    const text = row.textContent.toLowerCase();
    const status = row.getAttribute('data-sostatus');
    const date = row.getAttribute('data-sodate');
    const prefix = row.getAttribute('data-soprefix');

    const matchesQ = !q || text.includes(q);
    const matchesStatus = !st || status === st;
    const matchesPrefix = !prefixF || prefix === prefixF;
    const matchesFrom = !from || date >= from;
    const matchesTo = !to || date <= to;

    row.style.display = (matchesQ && matchesStatus && matchesPrefix && matchesFrom && matchesTo) ? '' : 'none';
  });
}

(window as any).openSalesNotePreModal = async (invoiceId: string, invoiceNum: string) => {
  let inv: any;
  try {
    inv = await (window as any).pb.get('invoices', invoiceId);
  } catch (err) {
    return (window as any).showToast('No se pudo cargar la factura', 'error');
  }

  if (!inv.tx_id) {
    return (window as any).showToast('La factura no está contabilizada. Genera el comprobante primero.', 'warning');
  }

  const html = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="p-3 rounded bg-purple-50 text-purple-800 text-sm border border-purple-200">
        <i class="fas fa-info-circle mr-1"></i> Generar ajuste / nota para la factura <strong>${(window as any).esc(invoiceNum)}</strong>.
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Documento</label>
        <select id="pre-note-type" class="form-input" onchange="window.updatePreNoteResolutions(this.value)">
          <option value="NC">Nota Crédito (Devolución / Rebaja)</option>
          <option value="ND">Nota Débito (Ajuste al alza)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Prefijo / Resolución DIAN</label>
        <select id="pre-note-resolution" class="form-input">
          <option value="">Cargando resoluciones...</option>
        </select>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="window.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="window.continueToNoteForm('${(window as any).esc(inv.tx_id)}')">Continuar <i class="fas fa-arrow-right ml-1"></i></button>
  `;

  (window as any).openModal('Asistente de Ajustes (Notas)', html, footer, false);

  (window as any).updatePreNoteResolutions = async (type: string) => {
    const sel = document.getElementById('pre-note-resolution') as HTMLSelectElement;
    if (!sel) return;
    sel.innerHTML = '<option value="">Cargando...</option>';
    try {
      const resolutions = await (window as any).pb.listAll('dian_resolutions', { filter: `active=true && document_type="${type}"` }).catch(() => []);
      const activeSel = document.getElementById('pre-note-resolution') as HTMLSelectElement;
      if (!activeSel) return;
      if (resolutions.length) {
        activeSel.innerHTML = resolutions.map((r: any) => `<option value="${r.id}">${r.prefix || ''} - ${r.resolution_number ? 'Res. ' + r.resolution_number : 'Interna'}</option>`).join('');
      } else {
        activeSel.innerHTML = '<option value="">Generación Automática (Según prefijo del tipo contable)</option>';
      }
    } catch {
      const activeSel = document.getElementById('pre-note-resolution') as HTMLSelectElement;
      if (activeSel) {
        activeSel.innerHTML = '<option value="">Generación Automática</option>';
      }
    }
  };

  (window as any).updatePreNoteResolutions('NC');

  (window as any).continueToNoteForm = async (txId: string) => {
    const type = (document.getElementById('pre-note-type') as HTMLSelectElement)?.value || 'NC';
    const resId = (document.getElementById('pre-note-resolution') as HTMLSelectElement)?.value || '';
    (window as any).closeModal();

    // Ahora pasamos la orden de clonar la factura a nivel comercial (productos) en lugar de transaccional
    window.openSalesForm(null, () => _loadVentasPage(document.getElementById('content-area') as HTMLElement), null, { originalInvoiceId: invoiceId, type, resolutionId: resId, originalInvoiceNum: invoiceNum });
  };
};

window.soSuggestDueDate = function() {
  const dateStr = (document.getElementById('so-date') as HTMLInputElement)?.value;
  const dueFld = document.getElementById('so-due-date') as HTMLInputElement;
  const daysInput = document.getElementById('so-credit-days') as HTMLInputElement;
  if (!dueFld || !dateStr) return;

  const payForm = (document.getElementById('so-payment-form') as HTMLSelectElement)?.value;
  let days = 0;

  if (payForm === '2') { // Crédito
    if (daysInput) {
      days = Math.max(0, parseInt(daysInput.value, 10) || 0);
    } else {
      days = Math.max(0, Number((window as any).__soCustomerCreditDays || 0) || 0);
    }
  } else { // Contado
    days = 0;
    if (daysInput && daysInput.value !== '0') {
      daysInput.value = '0';
    }
  }

  const date = new Date(dateStr + 'T12:00:00');
  if (!isNaN(date.getTime())) {
    date.setDate(date.getDate() + days);
    dueFld.value = date.toISOString().slice(0, 10);
  }
};

window.soOnPaymentFormChange = function() {
  const payForm = (document.getElementById('so-payment-form') as HTMLSelectElement)?.value;
  const daysInput = document.getElementById('so-credit-days') as HTMLInputElement;
  if (daysInput) {
    if (payForm === '2') { // Crédito
      const custDays = Math.max(0, Number((window as any).__soCustomerCreditDays || 0));
      const curDays = Math.max(0, parseInt(daysInput.value, 10) || 0);
      daysInput.value = String(curDays > 0 ? curDays : (custDays > 0 ? custDays : 30));
    } else { // Contado
      daysInput.value = '0';
    }
  }
  window.soSuggestDueDate();
  // La visibilidad de las retenciones globales se gestiona mediante el selector de modo (soSetRetMode)
  // y no depende de la forma de pago (Contado / Crédito).
  window.soRecalcLine(0);
};

window.soOnPaymentDianCodeChange = function() {
  const code = (document.getElementById('so-payment-dian-code') as HTMLSelectElement)?.value;
  const bankWrap = document.getElementById('so-bank-account-wrap');
  if (bankWrap) {
    const showBank = ['42', '47', '48', '49'].includes(code);
    bankWrap.style.display = showBank ? 'block' : 'none';
  }
};

(window as any).soUpdateLossDisplay = function(idx: number) {
  const chk = document.getElementById(`sol-is-loss-${idx}`) as HTMLInputElement;
  const lbl = document.getElementById(`sol-loss-lbl-${idx}`);
  if (!chk || !lbl) return;
  if (chk.checked) {
    lbl.textContent = 'Pérdida/Gasto';
    lbl.className = 'font-bold text-[11px] text-red-700';
  } else {
    lbl.textContent = 'Reingreso';
    lbl.className = 'font-bold text-[11px] text-gray-500';
  }
};

(window as any).soToggleAllLoss = function(checked: boolean) {
  const tableRows = document.querySelectorAll('#so-lines-body tr');
  tableRows.forEach((row: any) => {
    const idParts = row.id.split('-');
    const idx = idParts[idParts.length - 1];
    const chk = document.getElementById(`sol-is-loss-${idx}`) as HTMLInputElement;
    if (chk) {
      chk.checked = checked;
      (window as any).soUpdateLossDisplay(idx);
    }
  });
};

(window as any).soUpdateNcLossVisibility = function() {
  const txTypeId = (document.getElementById('so-tx-type') as HTMLSelectElement)?.value;
  const txTypes = (window as any).__soTxTypesCache || [];
  const selectedType = txTypes.find((t: any) => t.id === txTypeId);
  const noteCfg = (window as any).__soNoteConfig;
  const isNC = (noteCfg?.type === 'NC') || (selectedType?.code === 'NC') || (selectedType?.prefix === 'NC');

  const lossCols = document.querySelectorAll('.so-loss-col');
  lossCols.forEach((el: any) => {
    el.style.display = isNC ? '' : 'none';
  });

  const bulkWrap = document.getElementById('so-loss-bulk-wrap');
  if (bulkWrap) {
    bulkWrap.style.display = isNC ? 'flex' : 'none';
  }
};

window.soMixedCalc = function() {
  const method = (document.getElementById('so-payment-method') as HTMLSelectElement)?.value || 'EFECTIVO';
  if (method !== 'MIXTO') return;

  const totalNetEl = document.getElementById('so-total-net');
  if (!totalNetEl) return;
  const rawText = totalNetEl.textContent || '$ 0';
  const numericVal = parseFloat(rawText.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
  
  const labelTotal = document.getElementById('so-mixed-total-lbl');
  if (labelTotal) labelTotal.textContent = (window as any).fmt(numericVal);

  const efec = parseFloat((document.getElementById('so-mixed-efectivo') as HTMLInputElement)?.value || '0') || 0;
  const trans = parseFloat((document.getElementById('so-mixed-transferencia') as HTMLInputElement)?.value || '0') || 0;
  const cred = parseFloat((document.getElementById('so-mixed-credito') as HTMLInputElement)?.value || '0') || 0;

  const assigned = efec + trans + cred;
  const diff = numericVal - assigned;

  const assignedVal = document.getElementById('so-mixed-assigned-val');
  const statusRow = document.getElementById('so-mixed-status-row');
  const statusVal = document.getElementById('so-mixed-status-val');
  const mixedBankSelect = document.getElementById('so-mixed-bank-account') as HTMLElement;

  if (assignedVal) {
    assignedVal.textContent = (window as any).fmt(assigned);
  }

  if (mixedBankSelect) {
    mixedBankSelect.style.display = trans > 0 ? 'block' : 'none';
  }

  if (Math.abs(diff) < 0.01) {
    if (assignedVal) assignedVal.className = "text-emerald-600 font-extrabold";
    if (statusRow) statusRow.style.display = 'none';
  } else {
    if (assignedVal) assignedVal.className = "text-red-500 font-extrabold";
    if (statusRow) {
      statusRow.style.display = 'inline-block';
      statusRow.firstElementChild!.textContent = diff > 0 ? 'Falta: ' : 'Exceso: ';
      if (statusVal) {
        statusVal.textContent = (window as any).fmt(Math.abs(diff));
      }
    }
  }
};

// --- Recálculo Completo de Totales ---
window.soRecalcLine = function(rowIdx: number) {
  const roundDec = (v: number) => typeof (window as any).roundDecimals === 'function'
    ? (window as any).roundDecimals(v)
    : Math.round((v + Number.EPSILON) * 100) / 100;

  let subtotalSum = 0;
  let ivaSum = 0;
  let retSum = 0;
  let discountSum = 0;
  let qtyTotal = 0;

  const isPerLine = (window as any).__soRetMode === 'line';
  const tableRows = document.querySelectorAll('#so-lines-body tr');

  const soConfig = (window as any).__soConfig || defaultSalesConfig();
  const pricesIncludeIva = !!soConfig.operational.prices_include_iva;

  tableRows.forEach((row: any) => {
    const idParts = row.id.split('-');
    const idx = idParts[idParts.length - 1];

    const qty      = parseFloat((document.getElementById(`sol-qty-${idx}`)   as HTMLInputElement)?.value || '0') || 0;
    const pr       = parseFloat((document.getElementById(`sol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const ivaRate  = parseFloat((document.getElementById(`sol-iva-${idx}`)   as HTMLSelectElement)?.value || '0') || 0;
    const discPct  = parseFloat((document.getElementById(`sol-disc-${idx}`)  as HTMLInputElement)?.value || '0') || 0;

    qtyTotal += qty;

    // Recálculo de equivalencias y etiquetas descriptivas
    const baseUnit = (row.dataset.baseUnit || 'UND').toUpperCase();
    const largoCm = parseFloat(row.dataset.largoCm || '0') || 0;
    const anchoCm = parseFloat(row.dataset.anchoCm || '0') || 0;
    const undEmpaque = parseFloat(row.dataset.undEmpaque || '0') || 0;
    const pesoBruto = parseFloat(row.dataset.pesoBruto || '0') || 0;
    const hasConversions = row.dataset.hasConversions === 'true';

    const equivLbl = document.getElementById(`sol-equiv-lbl-${idx}`);
    if (hasConversions && equivLbl) {
      const unitSelect = document.getElementById(`sol-unit-${idx}`) as HTMLSelectElement;
      const selectedUnit = unitSelect ? unitSelect.value : baseUnit;
      const convs = convertQtyToUnits(qty, selectedUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);

      equivLbl.innerHTML = `Equivale a: <strong class="text-blue-700">${(window as any).fmtN(convs.cajas)} CJ</strong> | <strong class="text-blue-700">${(window as any).fmtN(convs.m2)} M²</strong> | <strong class="text-blue-700">${(window as any).fmtN(convs.unidades)} UND</strong> | <strong class="text-blue-700">${(window as any).fmtN(convs.pesoKg)} Kg</strong>`;
      equivLbl.classList.remove('hidden');
    } else if (equivLbl) {
      equivLbl.classList.add('hidden');
    }

    // Resaltar en rojo el input de cantidad si la cantidad supera el stock y stock negativo está desactivado
    const prodIdInRow = (document.getElementById(`sol-prod-id-${idx}`) as HTMLInputElement)?.value;
    const productsList = (window as any).__soProductsCache || [];
    const currentWhStockArr = (window as any).__soCurrentWhStock || [];
    const prodMatch = productsList.find((p: any) => p.id === prodIdInRow);
    const isService = prodMatch && (String(prodMatch.type || '').toUpperCase() === 'SERVICIO' || prodMatch.is_service === true);
    const allowNegative = (window as any).__soConfig?.operational?.allow_negative_stock === true;
    const qtyInputEl = document.getElementById(`sol-qty-${idx}`) as HTMLInputElement;

    if (prodIdInRow && !isService && !allowNegative && qtyInputEl) {
      const whId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value;
      const stockRow = currentWhStockArr.find((s: any) => s.product_id === prodIdInRow);
      const availableStock = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;

      let reqBaseQty = qty;
      if (hasConversions) {
        const unitSelect = document.getElementById(`sol-unit-${idx}`) as HTMLSelectElement;
        const selectedUnit = unitSelect ? unitSelect.value : baseUnit;
        const convs = convertQtyToUnits(qty, selectedUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);
        reqBaseQty = convs.baseQty;
      }

      if (reqBaseQty > availableStock) {
        qtyInputEl.style.borderColor = '#EF4444';
        qtyInputEl.style.backgroundColor = '#FEF2F2';
        qtyInputEl.title = `Atención: La cantidad (${(window as any).fmtN(reqBaseQty)} unds) supera las existencias disponibles (${(window as any).fmtN(availableStock)} unds) en la bodega.`;
      } else {
        qtyInputEl.style.borderColor = '';
        qtyInputEl.style.backgroundColor = '';
        qtyInputEl.title = '';
      }
    }

    let lineGross, lineDisc, lineSub, lineIva;
    if (pricesIncludeIva) {
      const lineTotalGross = roundDec(qty * pr);
      const lineTotalDisc = roundDec(lineTotalGross * (discPct / 100));
      const lineTotalNet = roundDec(lineTotalGross - lineTotalDisc);
      
      lineSub = roundDec(lineTotalNet / (1 + ivaRate / 100));
      lineIva = roundDec(lineTotalNet - lineSub);
      lineGross = roundDec(lineTotalGross / (1 + ivaRate / 100));
      lineDisc = roundDec(lineGross * (discPct / 100));
    } else {
      lineGross = roundDec(qty * pr);
      lineDisc  = roundDec(lineGross * (discPct / 100));
      lineSub   = roundDec(lineGross - lineDisc);          // base after discount
      lineIva   = roundDec(lineSub * (ivaRate / 100));
    }
    let lineRet = 0;

    if (isPerLine) {
      const retId = (document.getElementById(`sol-ret-rule-${idx}`) as HTMLSelectElement)?.value;
      if (retId && (window as any).__soRetRulesCache) {
        const rule = (window as any).__soRetRulesCache.find((r: any) => r.id === retId);
        if (rule && lineSub >= rule.min_base) {
          lineRet = roundDec(lineSub * (rule.rate / 100));
        }
      }
      const retFld = document.getElementById(`sol-ret-val-${idx}`);
      if (retFld) retFld.textContent = (window as any).fmt(lineRet);
    }

    subtotalSum  = roundDec(subtotalSum + lineGross);
    ivaSum       = roundDec(ivaSum + lineIva);
    retSum       = roundDec(retSum + lineRet);
    discountSum  = roundDec(discountSum + lineDisc);

    const lineTot = roundDec(lineSub + lineIva - lineRet);
    const totFld = document.getElementById(`sol-total-${idx}`);
    if (totFld) totFld.textContent = (window as any).fmt(lineTot);
  });

  // Retenciones Globales (Header Mode)
  let valRenta = 0;
  let valIca = 0;
  let valIva = 0;

  subtotalSum = roundDec(subtotalSum);
  ivaSum = roundDec(ivaSum);
  discountSum = roundDec(discountSum);
  retSum = roundDec(retSum);

  const netSubtotal = roundDec(subtotalSum - discountSum); // subtotal real después de descuentos
  const totalSum = roundDec(netSubtotal + ivaSum);

  if (!isPerLine) {
    if ((window as any).__soRetRulesCache) {
      const rentaId = (document.getElementById('so-hdr-ret-rule-renta') as HTMLSelectElement)?.value;
      const icaId = (document.getElementById('so-hdr-ret-rule-ica') as HTMLSelectElement)?.value;
      const ivaId = (document.getElementById('so-hdr-ret-rule-iva') as HTMLSelectElement)?.value;

      if (rentaId) {
        const r = (window as any).__soRetRulesCache.find((x: any) => x.id === rentaId);
        if (r) {
          const base = String(r.base_type || '').toUpperCase() === 'TOTAL' ? totalSum : netSubtotal;
          if (base >= r.min_base) valRenta = roundDec(base * (r.rate / 100));
        }
      }
      if (icaId) {
        const r = (window as any).__soRetRulesCache.find((x: any) => x.id === icaId);
        if (r) {
          const base = String(r.base_type || '').toUpperCase() === 'TOTAL' ? totalSum : netSubtotal;
          if (base >= r.min_base) valIca = roundDec(base * (r.rate / 100));
        }
      }
      if (ivaId) {
        const r = (window as any).__soRetRulesCache.find((x: any) => x.id === ivaId);
        if (r && ivaSum >= r.min_base) valIva = roundDec(ivaSum * (r.rate / 100));
      }
      retSum = roundDec(valRenta + valIca + valIva);
    }
  }

  const netTotal = roundDec(netSubtotal + ivaSum - retSum);

  if (document.getElementById('so-total-sub'))      (document.getElementById('so-total-sub') as any).textContent = (window as any).fmt(subtotalSum);
  if (document.getElementById('so-total-iva'))      (document.getElementById('so-total-iva') as any).textContent = (window as any).fmt(ivaSum);
  if (document.getElementById('so-total-discount')) (document.getElementById('so-total-discount') as any).textContent = discountSum > 0 ? `-${(window as any).fmt(discountSum)}` : '-$ 0';
  if (document.getElementById('so-total-ret-renta')) (document.getElementById('so-total-ret-renta') as any).textContent = (window as any).fmt(valRenta);
  if (document.getElementById('so-total-ret-ica'))  (document.getElementById('so-total-ret-ica') as any).textContent = (window as any).fmt(valIca);
  if (document.getElementById('so-total-ret-iva'))  (document.getElementById('so-total-ret-iva') as any).textContent = (window as any).fmt(valIva);
  if (document.getElementById('so-total-ret'))      (document.getElementById('so-total-ret') as any).textContent = (window as any).fmt(retSum);
  if (document.getElementById('so-total-net'))      (document.getElementById('so-total-net') as any).textContent = (window as any).fmt(netTotal);

  const itemsCounterEl = document.getElementById('so-items-counter');
  if (itemsCounterEl) {
    const lineCount = tableRows.length;
    itemsCounterEl.textContent = `${lineCount} línea${lineCount === 1 ? '' : 's'} · ${(window as any).fmtN(qtyTotal)} unds`;
  }

  if (typeof (window as any).soMixedCalc === 'function') {
    (window as any).soMixedCalc();
  }

  if (typeof (window as any).soSaveTempState === 'function') {
    (window as any).soSaveTempState();
  }

  // Recalculate stock highlights when row qty or total changes
  if (rowIdx > 0) {
    const prodId = (document.getElementById(`sol-prod-id-${rowIdx}`) as HTMLInputElement)?.value;
    if (prodId && (window as any).soUpdateStockDisplay) {
      (window as any).soUpdateStockDisplay(rowIdx, prodId);
    }
  } else {
    const rows = document.querySelectorAll('#so-lines-body tr');
    rows.forEach((row: any) => {
      const idx = row.id.split('-').pop();
      const prodId = (document.getElementById(`sol-prod-id-${idx}`) as HTMLInputElement)?.value;
      if (prodId && (window as any).soUpdateStockDisplay) {
        (window as any).soUpdateStockDisplay(idx, prodId);
      }
    });
  }
};

// --- Retention Mode Toggle Logic ---
window.soSetRetMode = function(isPerLine: boolean) {
  (window as any).__soRetMode = isPerLine ? 'line' : 'header';
  document.querySelectorAll('.so-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });
  
  const hdrWrap = document.getElementById('so-hdr-ret-wrap');
  if (hdrWrap) hdrWrap.style.display = isPerLine ? 'none' : 'block';

  const knob = document.getElementById('so-ret-mode-knob');
  if (knob) knob.style.transform = isPerLine ? 'translateX(18px)' : '';

  const track = document.getElementById('so-ret-mode-track');
  if (track) track.style.background = isPerLine ? '#6B7280' : '#1A4B8C';

  const lblHdr = document.getElementById('so-ret-mode-lbl-hdr');
  if (lblHdr) lblHdr.style.color = isPerLine ? '#9CA3AF' : '#1A4B8C';

  const lblLine = document.getElementById('so-ret-mode-lbl-line');
  if (lblLine) lblLine.style.color = isPerLine ? '#1A4B8C' : '#9CA3AF';

  window.soRecalcLine(0);
};

// --- Formulario Reactivo de Creación / Edición ---
async function openSalesForm(invoiceId: string | null = null, onDone: any = null, preloadedOrderId: string | null = null, noteConfig: any = null, preloadedDealId: string | null = null) {
  let inv: any = null, existingLines: any[] = [];
  let split = { EFECTIVO: 0, TRANSFERENCIA: 0, CREDITO: 0 };
  (window as any).__salesModalEditing = !!invoiceId;
  
  const [soConfig, customers, warehouses, products, txTypes, bankAccounts, dianResolutions] = await Promise.all([
    getSalesConfig(),
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
    (window as any).pb.listAll('transaction_types', { filter: 'active=true', sort: 'name' }),
    (window as any).pb.listAll('bank_accounts', { filter: 'active=true', sort: 'name' }).catch(() => []),
    (window as any).pb.listAll('dian_resolutions', { filter: 'active=true' }).catch(() => []),
  ]);

  // Evaluar estrictamente la configuración de stock negativo de ventas e inventario
  const invCfgRaw = await (window as any).API.getSetting('inventory_settings_v1').catch(() => null);
  let invAllowNegative = true;
  if (invCfgRaw) {
    try {
      const parsedInv = JSON.parse(invCfgRaw);
      if (typeof parsedInv?.allow_negative_stock === 'boolean') {
        invAllowNegative = parsedInv.allow_negative_stock;
      }
    } catch (_) {}
  }
  const salesAllowNegative = soConfig.operational?.allow_negative_stock === true;
  soConfig.operational.allow_negative_stock = salesAllowNegative && invAllowNegative;
  (window as any).__soConfig = soConfig;

  (window as any).__soTxTypesCache = txTypes;
  (window as any).__soResolutionsCache = dianResolutions;

  const sellers = customers.filter((c: any) => c.type === 'EMPLEADO');

  let restoredFromLocal = false;
  const preserved = (window as any).__soPreservedState;
  if (preserved) {
    inv = preserved.inv;
    existingLines = preserved.lines;
    (window as any).__soPreservedState = null;
  } else if (invoiceId) {
    [inv, existingLines] = await Promise.all([
      (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id,sales_order_id' }),
      (window as any).API.getInvoiceLines(invoiceId),
    ]);
  }

  if (inv && inv.payment_method === 'MIXTO' && inv.payment_split) {
    try {
      split = typeof inv.payment_split === 'string' ? JSON.parse(inv.payment_split) : inv.payment_split;
    } catch (_) {}
  }

  if (!inv && !invoiceId && !preserved) {
    if (preloadedOrderId) {
      try {
        const preloadedOrder = await (window as any).pb.get('sales_orders', preloadedOrderId);
        const lines = await (window as any).API.getSalesOrderLines(preloadedOrderId);
        inv = {
          customer_id: preloadedOrder.customer_id,
          warehouse_id: preloadedOrder.warehouse_id,
          seller_id: preloadedOrder.seller_id,
          notes: preloadedOrder.notes || `Pedido ${preloadedOrder.number}`,
          date: (window as any).todayStr(),
          payment_method: 'CREDITO',
          sales_order_id: preloadedOrder.id,
          _sales_order_number: preloadedOrder.number
        };
        if (preloadedOrder?.has_pending_delivery || preloadedOrder?.fulfillment_status === 'RESERVADO_IMPORTACION') {
          inv.has_pending_delivery = true;
          inv.delivery_fulfillment_status = 'PENDIENTE';
        }
        existingLines = lines.map((l: any) => ({
          product_id: l.product_id,
          qty: l.qty,
          unit_price: l.unit_price,
          iva_rate: l.iva_rate,
          iva_amount: l.iva_amount,
          subtotal: l.subtotal,
          total: l.total
        }));
      } catch (err: any) {
        console.error("Error precargando pedido:", err);
        (window as any).showToast("Error al precargar datos del pedido: " + err.message, "error");
      }
    } else if (preloadedDealId) {
      try {
        const deal = await (window as any).pb.get('crm_deals', preloadedDealId);
        inv = {
          customer_id: deal.client_id,
          seller_id: deal.seller_id || null,
          notes: `Facturado desde Oportunidad CRM: ${deal.title}`,
          date: (window as any).todayStr(),
          payment_method: 'CREDITO'
        };
      } catch (err: any) {
        console.error("Error precargando oportunidad CRM:", err);
        (window as any).showToast("Error al precargar oportunidad CRM: " + err.message, "error");
      }
    } else if (noteConfig) {
      try {
        const originalInvoice = await (window as any).pb.get('invoices', noteConfig.originalInvoiceId);
        const lines = await (window as any).API.getInvoiceLines(noteConfig.originalInvoiceId);
        
        let origCufe = '';
        if (originalInvoice.tx_id) {
          try {
            const einvs = await (window as any).pb.listAll('einvoice_docs', { filter: `tx_id="${(window as any).pb.escapeFilterValue(originalInvoice.tx_id)}"` }).catch(() => []);
            if (einvs && einvs.length && einvs[0].cufe) {
              origCufe = einvs[0].cufe;
            }
          } catch (_) {}
        }

        const noteTypeLabel = noteConfig.type === 'ND' ? 'Nota Débito' : 'Nota Crédito';
        const invNumStr = originalInvoice.number || noteConfig.originalInvoiceNum || '';
        const cufeStr = origCufe || 'No disponible';
        const defaultNotes = `${noteTypeLabel} referente a la Factura Electrónica N° ${invNumStr}. CUFE: ${cufeStr}`;

        inv = {
          customer_id: originalInvoice.customer_id,
          warehouse_id: originalInvoice.warehouse_id,
          seller_id: originalInvoice.seller_id,
          notes: defaultNotes,
          date: (window as any).todayStr(),
          payment_method: originalInvoice.payment_method,
          tx_type_id: txTypes.find((t: any) => t.code === noteConfig.type)?.id || '',
          dian_resolution_id: noteConfig.resolutionId || null,
          cross_doc_ref: invNumStr
        };
        
        existingLines = lines.map((l: any) => ({
          product_id: l.product_id,
          qty: l.qty,
          unit_price: l.unit_price,
          iva_rate: l.iva_rate,
          iva_amount: l.iva_amount,
          subtotal: l.subtotal,
          total: l.total
        }));
      } catch (err: any) {
        console.error("Error precargando nota:", err);
        (window as any).showToast("Error al precargar la factura base: " + err.message, "error");
      }
    } else {
      // Restaurar borrador de nueva factura si existe
      const savedState = localStorage.getItem('__soTempState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          inv = state.inv;
          const activeProductIds = new Set(products.map((p: any) => p.id));
          existingLines = (state.lines || []).filter((l: any) => activeProductIds.has(l.product_id));
          restoredFromLocal = true;
        } catch (err) {
          console.error("Error al restaurar borrador temporal de factura:", err);
        }
      }
    }
  }

  (window as any).__soProductsCache = products;

  const initialWhId = inv?.warehouse_id || (!inv && (soConfig.operational.default_warehouse_id || (warehouses.length === 1 ? warehouses[0].id : '')));
  let currentWhStock: any[] = [];
  if (initialWhId) {
    currentWhStock = await (window as any).API.getInventoryStock({ warehouseId: initialWhId }).catch(() => []);
  }
  (window as any).__soCurrentWhStock = currentWhStock;

  (window as any).soUpdateStockDisplay = async function(idx: number, productId: string) {
    const whId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value;
    const qtyInput = document.getElementById(`sol-qty-${idx}`) as HTMLInputElement;
    const qtyRequested = parseFloat(qtyInput?.value || '0') || 0;

    const rowEl = document.getElementById(`so-row-${idx}`);
    let qtyBase = qtyRequested;
    if (rowEl) {
      const baseUnit = (rowEl.dataset.baseUnit || 'UND').toUpperCase();
      const largoCm = parseFloat(rowEl.dataset.largoCm || '0') || 0;
      const anchoCm = parseFloat(rowEl.dataset.anchoCm || '0') || 0;
      const undEmpaque = parseFloat(rowEl.dataset.undEmpaque || '0') || 0;
      const pesoBruto = parseFloat(rowEl.dataset.pesoBruto || '0') || 0;
      const hasConversions = rowEl.dataset.hasConversions === 'true';

      if (hasConversions) {
        const unitSelect = document.getElementById(`sol-unit-${idx}`) as HTMLSelectElement;
        const selectedUnit = unitSelect ? unitSelect.value : baseUnit;
        const convs = convertQtyToUnits(qtyRequested, selectedUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);
        qtyBase = convs.baseQty;
      }
    }

    const stockWhLabel = document.getElementById(`sol-stock-wh-lbl-${idx}`);
    const transitLabel = document.getElementById(`sol-transit-lbl-${idx}`);
    const stockContainer = document.getElementById(`sol-stock-container-${idx}`);
    
    if (!stockWhLabel || !transitLabel || !stockContainer) return;

    try {
      const [stocks, incoming] = await Promise.all([
        (window as any).API.getInventoryStock({ productId }),
        (window as any).API.getIncomingStockForProduct(productId).catch(() => [])
      ]);

      const currentWh = stocks.find((s: any) => s.warehouse_id === whId);
      const qtyAvailable = currentWh ? Number(currentWh.qty_on_hand || 0) : 0;
      
      const whName = warehouses.find((w: any) => w.id === whId)?.name || 'Sin bodega';
      if (whId) {
        stockWhLabel.innerHTML = `<i class="fas fa-warehouse mr-0.5"></i> ${whName}: <strong>${(window as any).fmtN(qtyAvailable)}</strong> disp.`;
        if (qtyBase > qtyAvailable + 0.0001) {
          stockWhLabel.style.cssText = 'color:#DC2626; background:#FEF2F2; border: 1px solid #FCA5A5; font-weight:700';
        } else {
          stockWhLabel.style.cssText = 'color:#059669; background:#ECFDF5; border: 1px solid #A7F3D0';
        }
      } else {
        const totalStock = stocks.reduce((sum: number, s: any) => sum + Number(s.qty_on_hand || 0), 0);
        stockWhLabel.innerHTML = `<i class="fas fa-warehouse mr-0.5"></i> Disp. Total: <strong>${(window as any).fmtN(totalStock)}</strong>`;
        stockWhLabel.style.cssText = 'color:#4B5563; background:#F3F4F6; border: 1px solid #E5E7EB';
      }

      const transitQty = incoming.reduce((sum: number, item: any) => sum + Number(item.qty_available ?? item.qty ?? 0), 0);
      if (transitQty > 0) {
        transitLabel.innerHTML = `<i class="fas fa-truck-ramp-box mr-0.5"></i> Tránsito: <strong>${(window as any).fmtN(transitQty)}</strong>`;
        transitLabel.style.cssText = 'color:#0284C7; background:#E0F2FE; border: 1px solid #BAE6FD';
        transitLabel.classList.remove('hidden');
      } else {
        transitLabel.classList.add('hidden');
      }
      
      stockContainer.classList.remove('hidden');
    } catch (err) {
      console.warn('Error fetching stock for line:', err);
    }
  };

  const whSelect = document.getElementById('so-warehouse') as HTMLSelectElement;
  if (whSelect) {
    const handleWhChange = async () => {
      const newWhId = whSelect.value;
      currentWhStock = newWhId ? await (window as any).API.getInventoryStock({ warehouseId: newWhId }).catch(() => []) : [];
      (window as any).__soCurrentWhStock = currentWhStock;
      const rows = document.querySelectorAll('#so-lines-body tr');
      rows.forEach((row: any) => {
        const idx = row.id.split('-').pop();
        const prodId = (document.getElementById(`sol-prod-id-${idx}`) as HTMLInputElement)?.value;
        if (prodId && (window as any).soUpdateStockDisplay) {
          (window as any).soUpdateStockDisplay(idx, prodId);
        }
      });
    };
    whSelect.addEventListener('change', handleWhChange);
  }

  let lineCounter = 0;
  const billDate = inv?.date || (window as any).todayStr();
  const initialDays = inv?.credit_days !== undefined
    ? Number(inv.credit_days)
    : (inv?.date && inv?.due_date)
      ? Math.max(0, Math.round((new Date(inv.due_date + 'T12:00:00').getTime() - new Date(inv.date + 'T12:00:00').getTime()) / 86400000))
      : (soConfig.operational.default_due_days || 0);
  const defaultDueDate = inv?.due_date || (window as any).addDaysToDateStr(billDate, initialDays);

  let allowedTxTypes = txTypes.filter((t: any) => {
    const prefix = String(t.prefix || '').toUpperCase();
    const code = String(t.code || '').toUpperCase();
    const name = String(t.name || '').toLowerCase();
    return prefix === 'FV' || code === 'FV' || prefix === 'RM' || prefix === 'REM' || code === 'RM' || code === 'REM' || name.includes('factura') || name.includes('remision') || name.includes('remisión');
  });
  if (noteConfig) {
    const searchType = String(noteConfig.type || '').trim().toUpperCase(); // 'NC' or 'ND'
    allowedTxTypes = txTypes.filter((t: any) => {
      const code = String(t.code || '').trim().toUpperCase();
      const prefix = String(t.prefix || '').trim().toUpperCase();
      const name = String(t.name || '').toLowerCase();
      const fallbackName = searchType === 'NC' ? 'crédito' : 'débito';
      return code === searchType || prefix === searchType || name.includes(fallbackName);
    });

    if (allowedTxTypes.length) {
      if (!inv) inv = {};
      // If we have a resolution passed, try to map it to its transaction type
      if (noteConfig.resolutionId && dianResolutions) {
        const selectedRes = dianResolutions.find((r: any) => r.id === noteConfig.resolutionId);
        if (selectedRes && selectedRes.prefix) {
          const matchedTxType = allowedTxTypes.find((t: any) => String(t.prefix || '').toUpperCase() === String(selectedRes.prefix).toUpperCase());
          if (matchedTxType) {
            inv.tx_type_id = matchedTxType.id;
          }
        }
      }
      if (!inv.tx_type_id) {
        inv.tx_type_id = allowedTxTypes[0].id;
      }
    } else {
      (window as any).showToast(`Advertencia: No se encontró ningún tipo de comprobante para ${noteConfig.type} en la base de datos.`, 'warning');
    }
  }

  const txTypeOptions = (allowedTxTypes.length ? allowedTxTypes : txTypes)
    .map((t: any) => `<option value="${(window as any).esc(t.id)}"${(inv?.tx_type_id === t.id || (!inv && !noteConfig && t.prefix === 'FV')) ? ' selected' : ''}>${(window as any).esc(t.prefix)} — ${(window as any).esc(t.name)}</option>`)
    .join('');

  const withholdingRules = (soConfig?.accounting?.withholding_rules || [])
    .filter((r: any) => String(r.account_code || '').trim() && Number(r.rate || 0) > 0);
  
  (window as any).__soRetRulesCache = withholdingRules;
  (window as any).__soRetMode = inv?.ret_mode || (inv?.ret_total > 0 && !(inv?.ret_rule_renta_id || inv?.ret_rule_ica_id || inv?.ret_rule_iva_id) ? 'line' : 'header'); // Inicializa modo retención

  const retRuleLabel = (r: any) => `${r.concept} ${r.rate}% (${r.base_type}${Number(r.min_base || 0) > 0 ? `, >= ${(window as any).fmt(r.min_base || 0)}` : ''})`;
  const retRuleOptions = (rules = withholdingRules, selectedId = '') => `<option value="">— Sin retención —</option>${rules.map(r => `<option value="${(window as any).esc(r.id)}"${r.id === selectedId ? ' selected' : ''}>${(window as any).esc(retRuleLabel(r))}</option>`).join('')}`;
  
  const normRetText = (v: any) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const retKindOfRule = (rule: any) => {
    const hay = normRetText(`${rule?.concept || ''} ${rule?.account_code || ''}`);
    if (hay.includes('ica')) return 'ica';
    if (hay.includes('iva')) return 'iva';
    return 'renta';
  };

  const retRulesRenta = withholdingRules.filter(r => retKindOfRule(r) === 'renta');
  const retRulesIca = withholdingRules.filter(r => retKindOfRule(r) === 'ica');
  const retRulesIva = withholdingRules.filter(r => retKindOfRule(r) === 'iva');

  const retRuleOptionsRenta = (sel = '') => retRuleOptions(retRulesRenta, sel);
  const retRuleOptionsIca = (sel = '') => retRuleOptions(retRulesIca, sel);
  const retRuleOptionsIva = (sel = '') => retRuleOptions(retRulesIva, sel);

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">

      ${restoredFromLocal ? `
      <div class="rounded-xl px-4 py-2.5 flex items-center justify-between text-xs" style="background:#FFFBEB;border:1px solid #FCD34D;color:#92400E">
        <div class="flex items-center gap-2">
          <i class="fas fa-clock-rotate-left text-amber-600 text-sm"></i>
          <span>Se restauraron automáticamente los datos de un borrador no guardado en este equipo.</span>
        </div>
        <button type="button" id="btn-banner-reset-so" class="font-bold underline hover:text-amber-950 cursor-pointer">
          <i class="fas fa-eraser mr-1"></i> Descartar y Limpiar
        </button>
      </div>` : ''}

      <!-- ══ HEADER COMPACTO ══ -->
      ${noteConfig ? `
      <div class="rounded-xl p-3 mb-2 flex flex-col md:flex-row md:items-center gap-3 justify-between" style="background:#FEF2F2;border:1px solid #FECACA">
        <div class="flex items-center gap-3 flex-1">
          <i class="fas fa-file-invoice-dollar text-2xl" style="color:#991B1B"></i>
          <div class="flex-1">
            <label class="so-hdr-label" style="color:#991B1B">Concepto de Corrección DIAN para ${noteConfig.type} <span style="color:#EF4444">*</span></label>
            <select id="so-dian-concept" class="form-input so-compact-inp w-full" style="border-color:#FCA5A5; max-width:400px">
              <option value="">-- Selecciona el motivo de ajuste --</option>
              <option value="1">1 - Devolución de parte de los bienes</option>
              <option value="2">2 - Anulación de factura electrónica</option>
              <option value="3">3 - Rebaja total aplicada</option>
              <option value="4">4 - Descuento total aplicado</option>
              <option value="5">5 - Rescisión: nulidad por falta de requisitos / Otros</option>
              <option value="6">6 - Otros (Especificar en descripción)</option>
            </select>
          </div>
        </div>
        <div class="flex items-center">
          <label class="flex items-center gap-2 text-xs font-bold text-red-900 cursor-pointer select-none bg-red-100/80 px-3 py-1.5 rounded-lg border border-red-300">
            <input type="checkbox" id="so-dian-sin-ref" class="w-4 h-4 accent-red-600 rounded cursor-pointer">
            <span>Nota SIN Referencia a Factura (Sin CUFE)</span>
          </label>
        </div>
      </div>` : ''}
      <div class="rounded-xl p-3" style="background:#F9FAFB;border:1px solid #E5E7EB">
        <!-- Fila 1: Cliente + Fecha + Plazo + Vence + Comprobante + Consecutivo -->
        <div class="grid gap-2 mb-2" style="grid-template-columns:2fr 125px 95px 125px 160px 140px">
          <!-- Cliente con botón integrado -->
          <div>
            <label class="so-hdr-label">Cliente / Adquirente <span style="color:#EF4444">*</span></label>
            <div id="so-supplier-search-wrap" class="relative flex gap-1 items-center">
              <input id="so-supplier-search" class="form-input so-compact-inp flex-1" autocomplete="off" placeholder="NIT o nombre del cliente...">
              <button type="button" class="btn btn-outline so-icon-btn" onclick="window.soQuickAddCustomer()" title="Nuevo Cliente">
                <i class="fas fa-user-plus" style="font-size:11px;color:#4B5563"></i>
              </button>
              <input id="so-invoice-id" type="hidden" value="${(window as any).esc(inv?.id || invoiceId || '')}">
              <input id="so-invoice-number" type="hidden" value="${(window as any).esc(inv?.number || '')}">
              <input id="so-supplier" type="hidden" value="${(window as any).esc(inv?.customer_id || '')}">
              <input id="so-sales-order-id" type="hidden" value="${(window as any).esc(inv?.sales_order_id || '')}">
              <input id="so-crm-deal-id" type="hidden" value="${preloadedDealId || ''}">
              <div id="so-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
            </div>
          </div>
          <!-- Fecha Emisión -->
          <div>
            <label class="so-hdr-label">Fecha <span style="color:#EF4444">*</span></label>
            <input id="so-date" type="date" class="form-input so-compact-inp" value="${(window as any).esc(billDate)}" onchange="window.soSuggestDueDate()">
          </div>
          <!-- Plazo (días) -->
          <div>
            <label class="so-hdr-label">Plazo (días)</label>
            <input id="so-credit-days" type="number" min="0" step="1" class="form-input so-compact-inp font-semibold text-center" value="${initialDays}" placeholder="0" oninput="window.soSuggestDueDate()" onchange="window.soSuggestDueDate()">
          </div>
          <!-- Vencimiento (no editable) -->
          <div>
            <label class="so-hdr-label">Vencimiento</label>
            <input id="so-due-date" type="date" class="form-input so-compact-inp" value="${(window as any).esc(defaultDueDate || '')}" readonly style="background-color:#F3F4F6;color:#374151;cursor:not-allowed" title="Fecha de vencimiento calculada automáticamente según la fecha y el plazo en días (no editable)">
          </div>
          <!-- Comprobante -->
          <div>
            <label class="so-hdr-label">Comprobante <span style="color:#EF4444">*</span></label>
            <select id="so-tx-type" class="form-input so-compact-inp" onchange="window.soUpdateConsecutivoPreview(); window.soUpdateNcLossVisibility();">
              <option value="">— Seleccionar —</option>
              ${txTypeOptions}
            </select>
          </div>
          <!-- Consecutivo -->
          <div>
            <label class="so-hdr-label">Consecutivo</label>
            <input id="so-consecutivo-display" class="form-input so-compact-inp font-mono font-semibold" style="background-color:#F3F4F6;color:#374151;cursor:not-allowed" value="${(window as any).esc(inv?.number || '')}" disabled title="Consecutivo estimado según la resolución DIAN vigente para el comprobante seleccionado">
          </div>
        </div>
        <!-- Fila 2: Pago + Bodega + Vendedor + Referencias -->
        <div class="grid gap-2" style="grid-template-columns:110px 165px 130px 130px 140px 140px 140px auto">
          <!-- Forma de Pago -->
          <div>
            <label class="so-hdr-label">Forma de Pago <span style="color:#EF4444">*</span></label>
            <select id="so-payment-form" class="form-input so-compact-inp" onchange="window.soOnPaymentFormChange()">
              <option value="1"${(inv?.payment_form === '1' || (!inv?.payment_form && inv?.payment_method !== 'CREDITO')) ? ' selected' : ''}>1 - Contado</option>
              <option value="2"${(inv?.payment_form === '2' || (!inv?.payment_form && inv?.payment_method === 'CREDITO')) ? ' selected' : ''}>2 - Crédito Comercial</option>
            </select>
            <div id="so-payment-form-hint" style="display:none;font-size:9px;color:#B45309;margin-top:2px"><i class="fas fa-circle-info"></i> Cliente sin crédito asignado</div>
          </div>
          <!-- Método de Pago DIAN -->
          <div>
            <label class="so-hdr-label">Medio de Pago (DIAN) <span style="color:#EF4444">*</span></label>
            <select id="so-payment-dian-code" class="form-input so-compact-inp" onchange="window.soOnPaymentDianCodeChange()">
              <option value="10"${(inv?.payment_dian_code === '10' || (!inv?.payment_dian_code && inv?.payment_method === 'EFECTIVO')) ? ' selected' : ''}>10 - Efectivo</option>
              <option value="20"${inv?.payment_dian_code === '20' ? ' selected' : ''}>20 - Cheque</option>
              <option value="42"${inv?.payment_dian_code === '42' ? ' selected' : ''}>42 - Consignación bancaria</option>
              <option value="47"${(inv?.payment_dian_code === '47' || (!inv?.payment_dian_code && inv?.payment_method === 'TRANSFERENCIA')) ? ' selected' : ''}>47 - Transferencia</option>
              <option value="48"${inv?.payment_dian_code === '48' ? ' selected' : ''}>48 - Tarjeta de crédito</option>
              <option value="49"${inv?.payment_dian_code === '49' ? ' selected' : ''}>49 - Tarjeta débito</option>
              <option value="ZZZ"${inv?.payment_dian_code === 'ZZZ' ? ' selected' : ''}>ZZZ - Otro medio de pago</option>
            </select>
            <div id="so-bank-account-wrap" style="margin-top:4px; display:${(inv?.payment_dian_code === '47' || (!inv?.payment_dian_code && inv?.payment_method === 'TRANSFERENCIA')) ? 'block' : 'none'}">
              <select id="so-bank-account" class="form-input so-compact-inp text-xs">
                <option value="">— Seleccionar Banco —</option>
                ${bankAccounts.map(b => `<option value="${(window as any).esc(b.id)}"${inv?.bank_account_id === b.id ? ' selected' : ''}>${(window as any).esc(b.bank)} — ${(window as any).esc(b.number)}</option>`).join('')}
              </select>
            </div>
          </div>
          <!-- Bodega -->
          <div>
            <label class="so-hdr-label">Bodega <span style="font-size:10px;color:#9CA3AF">(despacho)</span></label>
            <select id="so-warehouse" class="form-input so-compact-inp" onchange="window.soRecalcLine(0)">
              <option value="">— Sin bodega —</option>
              ${warehouses.map(w => `<option value="${(window as any).esc(w.id)}"${(inv?.warehouse_id === w.id || (!inv && (soConfig.operational.default_warehouse_id === w.id || warehouses.length === 1))) ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}
            </select>
          </div>
          <!-- Vendedor -->
          <div>
            <label class="so-hdr-label">Vendedor</label>
            <select id="so-seller" class="form-input so-compact-inp">
              <option value="">— Sin vendedor —</option>
              ${sellers.map(s => `<option value="${(window as any).esc(s.id)}"${inv?.seller_id === s.id ? ' selected' : ''}>${(window as any).esc(s.name)}</option>`).join('')}
            </select>
          </div>
          <!-- Orden de Compra + botón cargar pedido -->
          <div>
            <label class="so-hdr-label">Orden de Compra</label>
            <div class="flex gap-1 items-center">
              <input id="so-po-number" class="form-input so-compact-inp flex-1" placeholder="N.º orden" value="${(window as any).esc(inv?.po_number || '')}">
              <button type="button" class="btn btn-outline so-icon-btn" onclick="window.soLoadPendingOrderModal()" title="Cargar Pedido" style="color:#1A4B8C">
                <i class="fas fa-file-import" style="font-size:11px"></i>
              </button>
            </div>
          </div>
          <!-- N.º de Pedido (heredado, no editable) -->
          <div>
            <label class="so-hdr-label">N.º de Pedido</label>
            <input id="so-order-number-display" class="form-input so-compact-inp" style="background-color:#F3F4F6;color:#6B7280;cursor:not-allowed" value="${(window as any).esc(inv?._sales_order_number || inv?.expand?.sales_order_id?.number || '')}" placeholder="— Sin pedido —" disabled title="Heredado del pedido cargado, no editable">
          </div>
          <!-- N.º de Remisión -->
          <div>
            <label class="so-hdr-label">N.º de Remisión</label>
            <input id="so-remision-number" class="form-input so-compact-inp" placeholder="N.º de remisión" value="${(window as any).esc(inv?.remision_number || '')}">
          </div>
          <!-- Reserva en importación & Facturación Electrónica (DIAN) -->
          <div class="flex items-center gap-3">
            <div>
              <label class="so-hdr-label" style="visibility:hidden">&nbsp;</label>
              <label class="inline-flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap so-compact-inp" style="font-size:11px;font-weight:600;color:#9A3412;height:30px" title="Al contabilizar, el sistema reservará unidades en importaciones activas y programará un despacho pendiente automáticamente.">
                <input id="so-pending-delivery" type="checkbox" ${inv?.has_pending_delivery ? 'checked' : ''}>
                (reserva en importación)
              </label>
            </div>
            ${soConfig.operational.dian_dependent_posting ? `
            <div>
              <label class="so-hdr-label" style="visibility:hidden">&nbsp;</label>
              <label class="inline-flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap so-compact-inp" style="font-size:11px;font-weight:700;color:#1A4B8C;height:30px" title="Marcar si esta factura se enviará electrónicamente a la DIAN.">
                <input id="so-is-electronic" type="checkbox" ${(!inv || inv.is_electronic !== false) ? 'checked' : ''} onchange="window.soUpdateSaveButton()">
                Emitir Factura Electrónica
              </label>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Notas -->
        <div class="mt-2">
          <label class="so-hdr-label">Notas / Observaciones</label>
          <input id="so-notes" class="form-input so-compact-inp" placeholder="Observaciones, condiciones de entrega..." value="${(window as any).esc(inv?.notes || '')}">
        </div>

        <!-- Sección Pago Mixto en Venta -->
        <div id="so-pay-mixed-sec" class="p-3 rounded-xl border mt-2 space-y-3" style="background:#F9FAFB; border-color:#E5E7EB; display:${inv?.payment_method === 'MIXTO' ? 'block' : 'none'}">
          <p class="text-xs text-gray-500 font-bold mb-1">Distribución Pago Mixto (Total Factura: <span id="so-mixed-total-lbl">$ 0</span>):</p>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-emerald-600 block mb-1">Efectivo</label>
              <input type="number" id="so-mixed-efectivo" class="form-input w-full text-xs py-1" min="0" value="${split.EFECTIVO || 0}" oninput="window.soMixedCalc()">
            </div>
            <div>
              <label class="text-xs font-semibold text-blue-600 block mb-1">Transferencia</label>
              <div class="flex gap-2">
                <input type="number" id="so-mixed-transferencia" class="form-input w-full text-xs py-1 flex-1" min="0" value="${split.TRANSFERENCIA || 0}" oninput="window.soMixedCalc()">
                <select id="so-mixed-bank-account" class="form-input w-full text-xs py-1 flex-1" style="display:${(split.TRANSFERENCIA || 0) > 0 ? 'block' : 'none'}">
                  <option value="">— Banco —</option>
                  ${bankAccounts.map(b => `<option value="${(window as any).esc(b.id)}"${inv?.bank_account_id === b.id ? ' selected' : ''}>${(window as any).esc(b.bank)} — ${(window as any).esc(b.number)}</option>`).join('')}
                </select>
              </div>
            </div>
            <div>
              <label class="text-xs font-semibold text-orange-600 block mb-1">Crédito</label>
              <input type="number" id="so-mixed-credito" class="form-input w-full text-xs py-1" min="0" value="${split.CREDITO || 0}" oninput="window.soMixedCalc()">
            </div>
          </div>
          <div class="flex justify-between items-center text-xs font-bold pt-2 border-t" style="border-color:#E5E7EB">
            <span>Asignado: <span id="so-mixed-assigned-val" class="text-emerald-600 font-extrabold">$ 0</span></span>
            <span id="so-mixed-status-row" class="text-red-500" style="display:none">Diferencia: <span id="so-mixed-status-val" class="font-extrabold">$ 0</span></span>
          </div>
        </div>
      </div>

      <!-- ══ BUSCADOR GLOBAL DE PRODUCTOS & CONSULTA DE INVENTARIO ══ -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <i class="fas fa-search" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:13px;pointer-events:none"></i>
          <input id="so-prod-search-global" class="form-input"
                 style="padding-left:38px;font-size:14px;border-color:#DCE6F8"
                 autocomplete="off"
                 placeholder="Buscar producto o servicio por nombre o código... (↑↓ para navegar · Enter o clic para agregar)">
          <div id="so-prod-results-global"
               style="display:none;position:absolute;left:0;right:0;top:calc(100% + 3px);max-height:300px;overflow:auto;background:#fff;border:1.5px solid #DCE6F8;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);z-index:50">
          </div>
        </div>
        <button type="button" class="btn btn-outline flex items-center gap-1.5 whitespace-nowrap shadow-xs" onclick="window.soShowActiveInventoryModal()" style="color:#1A4B8C; border-color:#BFDBFE; background:#EFF6FF; height:42px; font-weight:700; font-size:12px; border-radius:10px" title="Consultar todo el inventario activo con existencias por bodega">
          <i class="fas fa-boxes-stacked text-blue-600"></i> Consultar Inventario
        </button>
      </div>

      <!-- ══ TABLA DE LÍNEAS ══ -->
      <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
        <!-- Barra superior con toggle retención -->
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F4F8FF;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes mr-1"></i> Artículos / Servicios <span id="so-items-counter" style="margin-left:6px;font-size:11px;font-weight:700;color:#1A4B8C;background:#EEF4FF;border-radius:999px;padding:2px 9px">0 líneas · 0 unds</span></span>
          <div class="flex items-center gap-3">
            <div id="so-loss-bulk-wrap" class="items-center gap-2 cursor-pointer select-none" style="display:none;font-size:12px;font-weight:600;color:#991B1B" title="Marcar/desmarcar todos los productos como pérdida o gasto">
              <label class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-900 px-2.5 py-1 rounded-lg border border-red-300 cursor-pointer">
                <input type="checkbox" id="so-loss-bulk-switch" class="w-4 h-4 accent-red-600 rounded cursor-pointer" onchange="window.soToggleAllLoss(this.checked)">
                <span>Dar de baja todas las líneas (Pérdida/Gasto)</span>
              </label>
            </div>
            <label class="flex items-center gap-2 cursor-pointer select-none" style="font-size:12px;font-weight:600;color:#374151" title="Modo de captura de retenciones">
              <span id="so-ret-mode-lbl-hdr" style="color:#1A4B8C">Global</span>
              <div style="position:relative;display:inline-block;width:38px;height:20px">
                <input type="checkbox" id="so-ret-mode-switch" style="opacity:0;width:0;height:0;position:absolute" onchange="window.soSetRetMode(this.checked)">
                <span id="so-ret-mode-track" onclick="var sw=document.getElementById('so-ret-mode-switch');sw.checked=!sw.checked;window.soSetRetMode(sw.checked)" style="position:absolute;inset:0;background:#1A4B8C;border-radius:10px;cursor:pointer;transition:background .2s"></span>
                <span id="so-ret-mode-knob" style="position:absolute;height:14px;width:14px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.25)"></span>
              </div>
              <span id="so-ret-mode-lbl-line" style="color:#9CA3AF">Por línea</span>
            </label>
          </div>
        </div>

        <!-- Tabla con scroll vertical -->
        <div style="overflow-x:auto;max-height:280px;overflow-y:auto">
          <table class="data-table so-lines-tbl" id="so-lines-table" style="min-width:960px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:200px;background:#F4F8FF;color:#374151">Código / Referencia — Producto</th>
                <th class="text-right" style="width:110px;background:#F4F8FF;color:#374151">Cantidad</th>
                <th class="text-right" style="width:155px;background:#F4F8FF;color:#374151">P. Unitario</th>
                <th class="text-right" style="width:95px;background:#F4F8FF;color:#374151">IVA %</th>
                <th class="text-right" style="width:95px;background:#F4F8FF;color:#374151">Dscto %</th>
                <th class="so-ret-col" style="min-width:185px;background:#F4F8FF;color:#374151;display:none">Retención</th>
                <th class="so-ret-col text-right" style="width:105px;background:#F4F8FF;color:#374151;display:none">Vlr Ret.</th>
                <th class="so-loss-col text-center" style="width:140px;background:#FEF2F2;color:#991B1B;display:none" title="Si se marca, el producto devuelto se considera pérdida o daño y NO ingresa al inventario (se convierte en un gasto)">¿Pérdida / Gasto?</th>
                <th class="text-right" style="width:145px;background:#F4F8FF;color:#374151">Total línea</th>
                <th style="width:48px;background:#F4F8FF;color:#374151">Acción</th>
              </tr>
            </thead>
            <tbody id="so-lines-body"></tbody>
          </table>
        </div>

        <!-- ══ TOTALES EN GRID 3 COLUMNAS ══ -->
        <div class="border-t p-4" style="border-color:#E5E7EB;background:#F9FAFB">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">

            <!-- Col 1: Subtotal · IVA · Descuento -->
            <div class="space-y-2">
              <div class="flex justify-between gap-4">
                <span style="color:#6B7280">Subtotal:</span>
                <span id="so-total-sub" class="font-semibold" style="color:#0D2137">$ 0</span>
              </div>
              <div class="flex justify-between gap-4">
                <span style="color:#6B7280">IVA:</span>
                <span id="so-total-iva" class="font-semibold" style="color:#0D2137">$ 0</span>
              </div>
              <div class="flex justify-between gap-4" style="color:#EF4444">
                <span class="font-medium">Descuento líneas:</span>
                <span id="so-total-discount" class="font-semibold">-$ 0</span>
              </div>
            </div>

            <!-- Col 2: Retenciones -->
            <div id="so-hdr-ret-wrap" class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span style="color:#6B7280;white-space:nowrap;font-size:11px">ReteFuente (A favor):</span>
                <div class="flex items-center gap-1 flex-1 justify-end">
                  <select id="so-hdr-ret-rule-renta" class="form-input text-xs" style="min-width:115px;max-width:150px;height:26px;padding:2px 24px 2px 7px;font-size:11px" onchange="window.soRecalcLine(0)">
                    ${retRuleOptionsRenta(inv?.ret_rule_renta_id || '')}
                  </select>
                  <span id="so-total-ret-renta" class="font-semibold text-orange-600" style="min-width:68px;text-align:right">$ 0</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span style="color:#6B7280;white-space:nowrap;font-size:11px">ReteICA (A favor):</span>
                <div class="flex items-center gap-1 flex-1 justify-end">
                  <select id="so-hdr-ret-rule-ica" class="form-input text-xs" style="min-width:115px;max-width:150px;height:26px;padding:2px 24px 2px 7px;font-size:11px" onchange="window.soRecalcLine(0)">
                    ${retRuleOptionsIca(inv?.ret_rule_ica_id || '')}
                  </select>
                  <span id="so-total-ret-ica" class="font-semibold text-orange-600" style="min-width:68px;text-align:right">$ 0</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span style="color:#6B7280;white-space:nowrap;font-size:11px">ReteIVA (A favor):</span>
                <div class="flex items-center gap-1 flex-1 justify-end">
                  <select id="so-hdr-ret-rule-iva" class="form-input text-xs" style="min-width:115px;max-width:150px;height:26px;padding:2px 24px 2px 7px;font-size:11px" onchange="window.soRecalcLine(0)">
                    ${retRuleOptionsIva(inv?.ret_rule_iva_id || '')}
                  </select>
                  <span id="so-total-ret-iva" class="font-semibold text-orange-600" style="min-width:68px;text-align:right">$ 0</span>
                </div>
              </div>
              <div class="flex justify-between gap-4 text-orange-600 border-t pt-1" style="border-color:#FED7AA">
                <span class="font-semibold text-xs">Total Retenciones:</span>
                <span id="so-total-ret" class="font-bold">$ 0</span>
              </div>
            </div>

            <!-- Col 3: TOTAL NETO destacado -->
            <div class="flex flex-col justify-end">
              <div class="rounded-xl p-3 text-right" style="background:linear-gradient(135deg,#EEF4FF,#F0FBFF);border:1.5px solid #DCE6F8">
                <p class="text-xs font-bold uppercase tracking-wide mb-1" style="color:#6B7280">Total Neto (CxC)</p>
                <p id="so-total-net" class="text-2xl font-extrabold" style="color:#1A4B8C">$ 0</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <div class="flex items-center justify-between w-full">
      <div>
        ${(!invoiceId && !preloadedOrderId && !noteConfig) ? `
          <button type="button" class="btn btn-outline border-amber-300 text-amber-800 hover:bg-amber-50 btn-sm" id="btn-reset-so-draft" title="Descartar borrador temporal e iniciar desde cero">
            <i class="fas fa-eraser mr-1.5 font-bold"></i> Limpiar Formulario
          </button>
        ` : ''}
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-save-so">
          ${soConfig.operational.immediate_posting 
            ? '<i class="fas fa-check-double mr-1"></i> Guardar y Contabilizar' 
            : '<i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador'}
        </button>
      </div>
    </div>
  `;

  (window as any).__soConfig = soConfig;
  (window as any).__salesModalOpen = true;

  if (typeof (window as any).openDocumentTab === 'function') {
    const tabKey = invoiceId ? `editar-factura-${invoiceId}` : 'nueva-factura';
    const tabTitle = invoiceId ? 'Editar Factura' : (noteConfig ? `Ajuste (${noteConfig.type})` : 'Nueva Factura de Venta');
    (window as any).openDocumentTab(tabKey, tabTitle, 'fa-receipt', formHtml, footer, () => {
      initSoSupplierSearch();
      initSoLinesAutocomplete();
      bindSoFormEvents();
    });
  } else {
    (window as any).openModal(invoiceId ? 'Editar Factura de Venta' : 'Nueva Factura de Venta', formHtml, footer, true);
    const mbox = document.getElementById('modal-box');
    if (mbox) { mbox.classList.add('xl'); mbox.classList.remove('wide'); }
  }

  // --- AutoComplete de Clientes ---
  function initSoSupplierSearch() {
    const input = document.getElementById('so-supplier-search') as HTMLInputElement;
    const hidden = document.getElementById('so-supplier') as HTMLInputElement;
    const results = document.getElementById('so-supplier-results');
    if (!input || !hidden || !results) return;

    if (inv && inv.customer_id) {
      const match = customers.find((c: any) => c.id === inv.customer_id) || inv.expand?.customer_id;
      if (match) {
        input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
        hidden.value = match.id || inv.customer_id;
        applyCustomerCreditPolicy(match);
        if (!inv.ret_rule_renta_id && !inv.ret_rule_ica_id && !inv.ret_rule_iva_id) applyCustomerWithholdingRates(match);
      }
    } else if (inv && inv.customer_search) {
      input.value = inv.customer_search;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query 
        ? customers.slice(0, 30) 
        : customers.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(query)).slice(0, 30);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((c: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window.selectSoSupplier('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    (window as any).initKeyboardAutocomplete({
      input,
      results,
      itemSelector: 'button',
    });
  }

  (window as any).selectSoSupplier = function(id: string, text: string) {
    const hidden = document.getElementById('so-supplier') as HTMLInputElement;
    const input = document.getElementById('so-supplier-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
    }

    const customer = customers.find((c: any) => c.id === id);
    if (customer) {
      // Autocompletar vendedor asociado al tercero (solo si aún no se ha elegido uno)
      const sellerSel = document.getElementById('so-seller') as HTMLSelectElement;
      if (sellerSel && !sellerSel.value && customer.advisor) {
        sellerSel.value = customer.advisor;
      }
      applyCustomerCreditPolicy(customer);
      applyCustomerWithholdingRates(customer);
    }
  };

  // Aplica la política de crédito del tercero: si no tiene días de plazo asignados
  // (payment_days <= 0), la venta solo puede ser de contado.
  function applyCustomerCreditPolicy(customer: any) {
    const payForm = document.getElementById('so-payment-form') as HTMLSelectElement;
    const hint = document.getElementById('so-payment-form-hint');
    const daysInput = document.getElementById('so-credit-days') as HTMLInputElement;
    if (!payForm) return;
    const creditOpt = payForm.querySelector('option[value="2"]') as HTMLOptionElement;
    const days = Math.max(0, Number(customer?.payment_days || 0) || 0);
    (window as any).__soCustomerCreditDays = days;

    const hasCredit = days > 0;
    if (creditOpt) creditOpt.disabled = !hasCredit;
    payForm.title = hasCredit ? '' : 'El cliente no tiene días de crédito asignados: solo ventas de contado';
    if (hint) hint.style.display = hasCredit ? 'none' : 'block';

    if (!hasCredit && payForm.value === '2') {
      payForm.value = '1';
      (window as any).showToast?.('Cliente sin crédito: condición de pago ajustada a Contado', 'info');
    }

    if (daysInput) {
      if (payForm.value === '2') {
        daysInput.value = String(days);
      } else {
        daysInput.value = '0';
      }
    }

    window.soOnPaymentFormChange();
  }

  // Selecciona automáticamente en el encabezado las reglas de retención (ReteFuente / ReteICA)
  // cuyo porcentaje coincida con la tarifa parametrizada en el tercero (campos prf / pi de terceros.ts).
  // Si el cliente no es agente de retención o no tiene tarifa parametrizada, no se selecciona nada.
  function applyCustomerWithholdingRates(customer: any) {
    const findRuleByRate = (rules: any[], rate: number) => rules.find((r: any) => Math.abs(Number(r.rate || 0) - rate) < 0.01);

    const applyToSelect = (selectId: string, rules: any[], rate: number) => {
      const sel = document.getElementById(selectId) as HTMLSelectElement;
      if (!sel) return;
      if (rate > 0) {
        const rule = findRuleByRate(rules, rate);
        if (rule) sel.value = rule.id;
      }
    };

    const isRetAgent = String(customer?.rf || '').toUpperCase() === 'SI';
    applyToSelect('so-hdr-ret-rule-renta', retRulesRenta, isRetAgent ? Math.max(0, Number(customer?.prf || 0) || 0) : 0);
    applyToSelect('so-hdr-ret-rule-ica', retRulesIca, isRetAgent ? Math.max(0, Number(customer?.pi || 0) || 0) : 0);
    applyToSelect('so-hdr-ret-rule-iva', retRulesIva, isRetAgent ? Math.max(0, Number(customer?.piv || 0) || 0) : 0);

    window.soRecalcLine(0);
  }

  (window as any).soQuickAddCustomer = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      const currentState = getSoFormCurrentState();
      (window as any).__soPreservedState = {
        invoiceId,
        onDone,
        noteConfig,
        inv: currentState.inv,
        lines: currentState.lines
      };

      (window as any).__modalCloseCallback = async () => {
        const preserved = (window as any).__soPreservedState;
        if (preserved) {
          await openSalesForm(preserved.invoiceId, preserved.onDone, null, preserved.noteConfig);
        }
      };

      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        const docNum = createdRecord.doc_number || createdRecord.nit || '';
        const nameText = createdRecord.name || '';
        const selectText = docNum ? `${docNum} - ${nameText}` : nameText;
        (window as any).__soSelectCustomerAfterLoad = { id: createdRecord.id, text: selectText };
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  (window as any).soLoadPendingOrderModal = async function() {
    const currentState = getSoFormCurrentState();
    (window as any).__soPreservedState = {
      invoiceId,
      onDone,
      noteConfig,
      inv: currentState.inv,
      lines: currentState.lines
    };

    (window as any).__modalCloseCallback = async () => {
      const preserved = (window as any).__soPreservedState;
      if (preserved) {
        await openSalesForm(preserved.invoiceId, preserved.onDone, null, preserved.noteConfig);
      }
    };

    const selectedCust = (document.getElementById('so-supplier') as HTMLInputElement)?.value;
    let filter = 'status="pending"';
    if (selectedCust) {
      filter += ` && customer_id="${(window as any).pb.escapeFilterValue(selectedCust)}"`;
    }
    
    try {
      const orders = await (window as any).API.getSalesOrders({ filter, perPage: 100 });
      const list = orders.items || [];
      
      let html = "";
      if (!list.length) {
        html = `<div class="p-8 text-center text-gray-400"><i class="fas fa-info-circle mr-2"></i>No hay pedidos pendientes ${selectedCust ? 'para este cliente' : ''}.</div>`;
      } else {
        html = `
          <div class="overflow-x-auto text-sm" style="color:#374151">
            <table class="data-table w-full">
              <thead>
                <tr style="background:#F4F8FF">
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th class="text-right">Total</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${list.map((o: any) => `
                  <tr>
                    <td><span class="font-mono font-semibold">${(window as any).esc(o.number)}</span></td>
                    <td>${(window as any).esc(o.date)}</td>
                    <td>${(window as any).esc(o.expand?.customer_id?.name || '—')}</td>
                    <td class="text-right font-semibold font-mono">${(window as any).fmt(o.total || 0)}</td>
                    <td class="text-center">
                      <button class="btn btn-primary btn-sm" onclick="window.soApplyOrderToForm('${o.id}')">Cargar</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      
      (window as any).openModal('Cargar Pedido Pendiente', html, `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>`, false);
      
      (window as any).soApplyOrderToForm = function(orderId: string) {
        (window as any).__soPreservedState = null;
        (window as any).__modalCloseCallback = null;
        (window as any).closeModal();
        openSalesForm(invoiceId, onDone, orderId);
      };
    } catch (err: any) {
      (window as any).__soPreservedState = null;
      (window as any).__modalCloseCallback = null;
      (window as any).showToast('Error al cargar pedidos: ' + err.message, 'error');
    }
  };

  (window as any).soUpdateSaveButton = function() {
    const btn = document.getElementById('btn-save-so') as HTMLButtonElement;
    if (!btn) return;
    const cfg = (window as any).__soConfig?.operational;
    const immediate = !!cfg?.immediate_posting;
    const dianDependent = !!cfg?.dian_dependent_posting;
    const isElectronicEl = document.getElementById('so-is-electronic') as HTMLInputElement;
    const isElectronic = isElectronicEl ? isElectronicEl.checked : false;
    if (immediate) {
      if (dianDependent && isElectronic) {
        btn.innerHTML = '<i class="fas fa-paper-plane mr-1"></i> Firmar y Contabilizar';
      } else {
        btn.innerHTML = '<i class="fas fa-check-double mr-1"></i> Guardar y Contabilizar';
      }
    } else {
      btn.innerHTML = '<i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador';
    }
  };

  // Estima el próximo consecutivo DIAN disponible según el comprobante seleccionado
  (window as any).soUpdateConsecutivoPreview = function() {
    const el = document.getElementById('so-consecutivo-display') as HTMLInputElement;
    if (!el) return;
    if (invoiceId) return; // Factura existente: conserva su consecutivo real ya asignado

    const txTypeSel = document.getElementById('so-tx-type') as HTMLSelectElement;
    const txType = ((window as any).__soTxTypesCache || []).find((t: any) => t.id === txTypeSel?.value);
    if (!txType) { el.value = ''; el.placeholder = 'Selecciona un comprobante'; return; }

    const prefix = String(txType.prefix || '').toUpperCase();
    const resolutions = (window as any).__soResolutionsCache || [];
    
    // Auto-adjust electronic flag based on selected tx_type prefix
    const isElectronicEl = document.getElementById('so-is-electronic') as HTMLInputElement;
    if (isElectronicEl) {
      const isFE = prefix === 'FV' || prefix === 'FE';
      isElectronicEl.checked = isFE;
      if (typeof (window as any).soUpdateSaveButton === 'function') {
        (window as any).soUpdateSaveButton();
      }
    }

    const today = new Date();
    const candidates = resolutions.filter((r: any) => {
      if (String(r.prefix || '').toUpperCase() !== prefix) return false;
      if (Number(r.current_number || 0) >= Number(r.number_to || 0)) return false;
      if (r.expiration_date && new Date(r.expiration_date.slice(0, 10)) < today) return false;
      return true;
    }).sort((a: any, b: any) => new Date(a.expiration_date || 0).getTime() - new Date(b.expiration_date || 0).getTime());

    if (!candidates.length) {
      el.value = '';
      el.placeholder = 'Sin resolución vigente';
      return;
    }
    const res = candidates[0];
    const current = Number(res.current_number || 0);
    const from = Number(res.number_from || 0);
    const nextNum = current >= from ? current + 1 : from;
    el.value = `${res.prefix}-${String(nextNum).padStart(8, '0')}`;
    el.placeholder = '';
  };

  initSoSupplierSearch();

  // --- Manejo de Líneas (sin buscador por fila — se usa el buscador global) ---
  (window as any).addSoInvoiceLine = async function(prod: any = null, preloadedLine: any = null) {
    // Datos del producto (viene del buscador global o de una línea existente al editar)
    const prodObj     = prod || preloadedLine?.expand?.product_id;
    const productId   = prodObj?.id   || preloadedLine?.product_id || '';

    // Validar restricción de stock negativo si el parámetro está desactivado
    if (prodObj && !preloadedLine) {
      const isService = String(prodObj.type || prodObj.product_type || '').toUpperCase() === 'SERVICIO' || prodObj.is_service === true;
      const soConfig = (window as any).__soConfig || defaultSalesConfig();
      const allowNegative = soConfig.operational?.allow_negative_stock === true;
      
      if (!isService && !allowNegative) {
        const whId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value || initialWhId;
        let qtyOnHand = 0;
        let whName = 'la bodega seleccionada';

        try {
          const stockRows = await (window as any).API.getInventoryStock(whId ? { warehouseId: whId, productId } : { productId });
          if (whId) {
            const stockRow = stockRows.find((s: any) => s.product_id === productId);
            qtyOnHand = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;
            whName = warehouses.find((w: any) => w.id === whId)?.name || 'la bodega seleccionada';
          } else {
            qtyOnHand = stockRows.reduce((sum: number, s: any) => sum + Number(s.qty_on_hand || 0), 0);
            whName = 'todas las bodegas';
          }
        } catch (_) {
          const stockRow = (currentWhStock || []).find((s: any) => s.product_id === productId);
          qtyOnHand = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;
        }

        if (qtyOnHand <= 0) {
          (window as any).showToast(
            `No es posible seleccionar "${prodObj.name}" porque no tiene stock disponible en ${whName} (${(window as any).fmtN(qtyOnHand)} unds) y la opción "Permitir stock negativo" está desactivada.`,
            'warning'
          );
          return false;
        }
      }
    }

    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('so-lines-body');
    if (!tbody) return false;

    const productCode = prodObj?.code || preloadedLine?.code || '';
    const productName = prodObj?.name || preloadedLine?.name || preloadedLine?._name || '(producto)';
    const initQty     = preloadedLine?.qty        ?? 1;
    const initIva     = preloadedLine?.iva_rate   ?? prodObj?.iva_rate ?? 19;
    const initDisc    = preloadedLine?.discount_pct ?? preloadedLine?.discount_rate ?? 0;

    const soConfig = (window as any).__soConfig || defaultSalesConfig();
    const isTaxIn = soConfig.operational.prices_include_iva === true;
    let initPrice = 0;
    if (preloadedLine) {
      initPrice = isTaxIn 
        ? Math.round(preloadedLine.unit_price * (1 + (preloadedLine.iva_rate || 0) / 100) * 100) / 100
        : preloadedLine.unit_price;
    } else if (prodObj) {
      const prodPrice = prodObj.sales_price || prodObj.base_price || 0;
      const prodIva = prodObj.iva_rate ?? 19;
      initPrice = isTaxIn 
        ? Math.round(prodPrice * (1 + prodIva / 100) * 100) / 100
        : prodPrice;
    }

    // Configuración de conversiones dinámicas
    const isMultiUnitEnabled = soConfig.operational.enable_multi_unit_conversions === true;
    const undEmpaque = Number(prodObj?.und_empaque || 0);
    const largoCm = Number(prodObj?.largo_cm || 0);
    const anchoCm = Number(prodObj?.ancho_cm || 0);
    const pesoBruto = Number(prodObj?.peso_bruto || 0);
    const hasConversions = undEmpaque > 0 && largoCm > 0 && anchoCm > 0;
    const baseUnit = (prodObj?.unit || 'UND').toUpperCase();

    let salesUnit = baseUnit;
    let displayQty = initQty;
    let displayPrice = initPrice;

    if (isMultiUnitEnabled && hasConversions && prodObj) {
      const areaPorFicha = (largoCm * anchoCm) / 10000;
      const areaPorCaja = areaPorFicha * undEmpaque;

      // Intentar extraer unidad de negociación desde la descripción
      const descText = preloadedLine?.description || '';
      const matchDesc = descText.match(/\[Facturado:\s*([\d.]+)\s*(M2|CJ|UND|KG)/i);
      if (matchDesc) {
        displayQty = parseFloat(matchDesc[1]);
        salesUnit = matchDesc[2].toUpperCase();
      }

      // Calcular precio unitario base en M2
      let priceM2 = 0;
      if (baseUnit === 'M2') {
        priceM2 = initPrice;
      } else if (baseUnit === 'UND') {
        priceM2 = areaPorFicha > 0 ? (initPrice / areaPorFicha) : initPrice;
      } else if (baseUnit === 'CJ') {
        priceM2 = areaPorCaja > 0 ? (initPrice / areaPorCaja) : initPrice;
      } else if (baseUnit === 'KG') {
        const pesoPorM2 = areaPorCaja > 0 ? (pesoBruto / areaPorCaja) : 0;
        priceM2 = pesoPorM2 > 0 ? (initPrice * pesoPorM2) : initPrice;
      }

      // Convertir precio base a la unidad de visualización
      if (salesUnit === 'M2') {
        displayPrice = priceM2;
      } else if (salesUnit === 'CJ') {
        displayPrice = priceM2 * areaPorCaja;
      } else if (salesUnit === 'UND') {
        displayPrice = priceM2 * areaPorFicha;
      } else if (salesUnit === 'KG') {
        const pesoPorCaja = pesoBruto;
        displayPrice = pesoPorCaja > 0 ? ((priceM2 * areaPorCaja) / pesoPorCaja) : priceM2;
      }
    }

    const tr = document.createElement('tr');
    tr.id = `so-row-${idx}`;
    tr.dataset.baseUnit = baseUnit;
    tr.dataset.largoCm = String(largoCm);
    tr.dataset.anchoCm = String(anchoCm);
    tr.dataset.undEmpaque = String(undEmpaque);
    tr.dataset.pesoBruto = String(pesoBruto);
    tr.dataset.hasConversions = String(hasConversions);

    tr.innerHTML = `
      <td>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-extrabold flex-shrink-0" style="color:#1A4B8C;background:#EEF4FF;border-radius:4px;padding:1px 6px">${(window as any).esc(productCode || 'S/C')}</span>
            <span class="text-[11px] text-gray-600 truncate" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
          </div>
          <input type="hidden" id="sol-prod-id-${idx}" value="${(window as any).esc(productId)}">
          <div class="flex items-center gap-2 mt-1.5 text-[10px] hidden" id="sol-stock-container-${idx}">
            <span class="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform px-1.5 py-0.5 rounded flex items-center shadow-xs" id="sol-stock-wh-lbl-${idx}">
              <i class="fas fa-warehouse mr-0.5"></i> Bodega: ...
            </span>
            <span class="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform px-1.5 py-0.5 rounded flex items-center shadow-xs hidden" id="sol-transit-lbl-${idx}">
              <i class="fas fa-truck-ramp-box mr-0.5"></i> Tránsito: ...
            </span>
          </div>
          <div class="text-[10px] text-gray-500 font-semibold mt-1 hidden" style="line-height:1.2" id="sol-equiv-lbl-${idx}"></div>
        </div>
      </td>
      <td>
        <div class="flex flex-col gap-1">
          <input type="number" id="sol-qty-${idx}" class="form-input text-right w-full font-bold" style="font-size:13px" min="0.001" step="0.001" value="${displayQty}" oninput="window.soRecalcLine(${idx})">
          ${isMultiUnitEnabled && hasConversions ? `
            <select id="sol-unit-${idx}" class="form-input text-right w-full py-0.5 text-xs font-semibold" style="height:24px; color:#1A4B8C; padding: 2px 2px 2px 4px;">
              <option value="M2" ${salesUnit === 'M2' ? 'selected' : ''}>M² (Área)</option>
              <option value="CJ" ${salesUnit === 'CJ' ? 'selected' : ''}>CJ (Cajas)</option>
              <option value="UND" ${salesUnit === 'UND' ? 'selected' : ''}>UND (Fichas)</option>
              <option value="KG" ${salesUnit === 'KG' ? 'selected' : ''}>KG (Peso)</option>
            </select>
          ` : `
            <div class="text-right text-[10px] text-gray-400 font-semibold pr-1">${(window as any).esc(baseUnit)}</div>
          `}
        </div>
      </td>
      <td><input type="number" id="sol-price-${idx}" class="form-input text-right w-full" style="font-size:13px" min="0" step="0.01" value="${displayPrice || ''}" oninput="window.soRecalcLine(${idx})" ${soConfig.operational.allow_price_edit === false ? 'readonly style="background-color:#F3F4F6"' : ''}></td>
      <td>
        <select id="sol-iva-${idx}" class="form-input text-right w-full" style="font-size:12px" onchange="window.soRecalcLine(${idx})">
          <option value="0"  ${initIva == 0  ? 'selected' : ''}>0 %</option>
          <option value="5"  ${initIva == 5  ? 'selected' : ''}>5 %</option>
          <option value="19" ${initIva == 19 ? 'selected' : ''}>19 %</option>
        </select>
      </td>
      <td><input type="number" id="sol-disc-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" max="100" step="0.01" value="${initDisc}" placeholder="0" oninput="window.soRecalcLine(${idx})"></td>
      <td class="so-ret-col" style="display:none">
        <select id="sol-ret-rule-${idx}" class="form-input text-xs py-1 w-full" onchange="window.soRecalcLine(${idx})">
          ${retRuleOptions(withholdingRules, preloadedLine?.ret_rule_id || '')}
        </select>
      </td>
      <td class="so-loss-col" style="display:none">
        <div class="flex items-center justify-center">
          <label class="flex items-center gap-1.5 cursor-pointer text-xs select-none py-1 px-2 rounded hover:bg-red-50" title="Marcar si este producto es una pérdida/daño (no reingresa a bodega)">
            <input type="checkbox" id="sol-is-loss-${idx}" class="w-4 h-4 accent-red-600 rounded cursor-pointer" ${preloadedLine?.is_loss ? 'checked' : ''} onchange="window.soUpdateLossDisplay(${idx})">
            <span id="sol-loss-lbl-${idx}" class="font-bold text-[11px] ${preloadedLine?.is_loss ? 'text-red-700' : 'text-gray-500'}">${preloadedLine?.is_loss ? 'Pérdida/Gasto' : 'Reingreso'}</span>
          </label>
        </div>
      </td>
      <td class="text-right font-extrabold" style="color:#1A4B8C;font-size:13px" id="sol-total-${idx}">$ 0</td>
      <td class="text-center">
        <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('so-row-${idx}').remove(); window.soRecalcLine(0)"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    // Visibilidad columnas retención y pérdida
    const isPerLine = (window as any).__soRetMode === 'line';
    tr.querySelectorAll('.so-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });
    if (typeof (window as any).soUpdateNcLossVisibility === 'function') {
      (window as any).soUpdateNcLossVisibility();
    }

    setTimeout(() => {
      const whLbl = document.getElementById(`sol-stock-wh-lbl-${idx}`);
      const transLbl = document.getElementById(`sol-transit-lbl-${idx}`);
      whLbl?.addEventListener('click', () => (window as any).showStockBreakdownModal(productId, productName));
      transLbl?.addEventListener('click', () => (window as any).showStockBreakdownModal(productId, productName));
      
      const unitSel = document.getElementById(`sol-unit-${idx}`) as HTMLSelectElement;
      if (unitSel) {
        let prevUnit = salesUnit;
        unitSel.addEventListener('change', () => {
          const newUnit = unitSel.value;
          const priceInput = document.getElementById(`sol-price-${idx}`) as HTMLInputElement;
          const currentPrice = parseFloat(priceInput?.value || '0') || 0;
          const qtyInput = document.getElementById(`sol-qty-${idx}`) as HTMLInputElement;
          const currentQty = parseFloat(qtyInput?.value || '0') || 0;

          // Convertir cantidad
          const convs = convertQtyToUnits(currentQty, prevUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);
          let targetQty = currentQty;
          if (newUnit === 'M2') targetQty = convs.m2;
          else if (newUnit === 'CJ') targetQty = convs.cajas;
          else if (newUnit === 'UND') targetQty = convs.unidades;
          else if (newUnit === 'KG') targetQty = convs.pesoKg;

          if (qtyInput) {
            qtyInput.value = String(Math.round(targetQty * 1000) / 1000);
          }

          // Convertir precio
          let priceM2 = 0;
          const areaPorFicha = (largoCm * anchoCm) / 10000;
          const areaPorCaja = areaPorFicha * undEmpaque;
          const pesoPorCaja = pesoBruto;

          if (prevUnit === 'M2') {
            priceM2 = currentPrice;
          } else if (prevUnit === 'CJ') {
            priceM2 = areaPorCaja > 0 ? (currentPrice / areaPorCaja) : currentPrice;
          } else if (prevUnit === 'UND') {
            priceM2 = areaPorFicha > 0 ? (currentPrice / areaPorFicha) : currentPrice;
          } else if (prevUnit === 'KG') {
            const pesoPorM2 = areaPorCaja > 0 ? (pesoPorCaja / areaPorCaja) : 0;
            priceM2 = pesoPorM2 > 0 ? (currentPrice * pesoPorM2) : currentPrice;
          }

          let targetPrice = priceM2;
          if (newUnit === 'M2') {
            targetPrice = priceM2;
          } else if (newUnit === 'CJ') {
            targetPrice = priceM2 * areaPorCaja;
          } else if (newUnit === 'UND') {
            targetPrice = priceM2 * areaPorFicha;
          } else if (newUnit === 'KG') {
            targetPrice = pesoPorCaja > 0 ? ((priceM2 * areaPorCaja) / pesoPorCaja) : priceM2;
          }

          if (priceInput) {
            priceInput.value = String(Math.round(targetPrice * 100) / 100);
          }

          prevUnit = newUnit;
          window.soRecalcLine(idx);
        });
      }

      if ((window as any).soUpdateStockDisplay) {
        (window as any).soUpdateStockDisplay(idx, productId);
      }
    }, 20);

    window.soRecalcLine(idx);
  };

  // --- Buscador Global de Productos (único, con navegación por teclado) ---
  function initSoGlobalProductSearch() {
    const input = document.getElementById('so-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('so-prod-results-global');
    if (!input || !dropdown) return;

    let highlighted = -1;

    const renderResults = (filtered: any[]) => {
      if (!filtered.length) {
        dropdown.innerHTML = '<div class="px-4 py-3 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin resultados para esta búsqueda.</div>';
        return;
      }
      dropdown.innerHTML = filtered.map((p: any, i: number) => {
        const stockRow = currentWhStock.find((s: any) => s.product_id === p.id);
        const stockQty = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;
        const whId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value;
        const whName = warehouses.find((w: any) => w.id === whId)?.name || 'Sin bodega';
        const stockText = whId ? `${(window as any).fmtN(stockQty)} en ${whName}` : 'Selecciona bodega';
        const stockColor = stockQty > 0 ? 'color:#059669;background:#ECFDF5' : 'color:#9CA3AF;background:#F3F4F6';
        
        return `
          <button type="button"
            id="so-gsr-item-${i}"
            data-prod-idx="${i}"
            class="w-full text-left px-4 py-2.5 text-xs border-none bg-white cursor-pointer block so-gsr-row"
            style="border-bottom:1px solid #F3F4F6;transition:background .1s"
            onmouseenter="window.soGlobalHighlightProduct(${i})"
            onclick="window.soGlobalSelectProduct(${i})">
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-extrabold flex-shrink-0" style="color:#1A4B8C;background:#EEF4FF;border-radius:4px;padding:1px 6px">${(window as any).esc(p.code || 'S/C')}</span>
                  <span class="text-gray-700 truncate">${(window as any).esc(p.name)}</span>
                </div>
                <div class="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;${stockColor}">${(window as any).esc(stockText)}</span>
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0 text-right">
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:#EEF4FF;color:#1A4B8C">IVA ${p.iva_rate ?? 19}%</span>
                <span class="font-extrabold text-blue-600 text-xs">${(window as any).fmt(p.sales_price || p.base_price || 0)}</span>
              </div>
            </div>
          </button>
        `;
      }).join('');
      highlighted = -1;
      (window as any).__soGlobalFilteredProds = filtered;
    };

    const highlightItem = (idx: number, items: NodeListOf<Element>) => {
      items.forEach((el: any) => { el.style.background = ''; el.style.fontWeight = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
        (items[idx] as any).scrollIntoView({ block: 'nearest' });
      }
    };

    (window as any).soGlobalHighlightProduct = function(idx: number) {
      highlighted = idx;
      const items = dropdown.querySelectorAll('.so-gsr-row');
      highlightItem(idx, items);
    };

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        dropdown.style.display = 'none';
        return;
      }
      const filtered = products.filter((p: any) => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    });

    input.addEventListener('focus', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        dropdown.style.display = 'none';
        return;
      }
      const filtered = products.filter((p: any) => `${p.name} ${p.code}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    });

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      const items = dropdown.querySelectorAll('.so-gsr-row');
      if (ev.key === 'ArrowDown') { ev.preventDefault(); highlighted = Math.min(highlighted + 1, items.length - 1); highlightItem(highlighted, items); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlighted = Math.max(highlighted - 1, 0); highlightItem(highlighted, items); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (!input.value.trim()) {
          return; // No agregar si el campo de búsqueda está vacío
        }
        if (highlighted >= 0) {
          window.soGlobalSelectProduct(highlighted);
        } else if (items.length > 0) {
          window.soGlobalSelectProduct(0);
        }
      } else if (ev.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));

    // Prevenir pérdida de foco al hacer click en el dropdown
    dropdown.addEventListener('mousedown', (ev: MouseEvent) => {
      ev.preventDefault();
    });
  }

  (window as any).soGlobalSelectProduct = async function(idx: number) {
    const filtered: any[] = (window as any).__soGlobalFilteredProds || [];
    const prod = filtered[idx];
    if (!prod) return;
    const added = await (window as any).addSoInvoiceLine(prod, null);
    if (added === false) return;
    const input = document.getElementById('so-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('so-prod-results-global');
    if (input) { input.value = ''; input.focus(); }
    if (dropdown) dropdown.style.display = 'none';
    // Scroll al fondo de la tabla para ver la línea recién añadida
    const tableWrap = document.querySelector('#so-lines-table')?.closest('div[style*="overflow"]') as HTMLElement;
    if (tableWrap) setTimeout(() => { tableWrap.scrollTop = tableWrap.scrollHeight; }, 50);
  };

  // Carga líneas existentes (modo edición)
  if (existingLines.length) {
    existingLines.forEach((l: any) => {
      const match = products.find((p: any) => p.id === l.product_id) || l.expand?.product_id;
      (window as any).addSoInvoiceLine(match || null, l);
    });
    window.soRecalcLine(0);
  }

  // --- Persistencia Temporal (Borrador Autónomo) ---
  function getSoFormCurrentState() {
    const customerId = (document.getElementById('so-supplier') as HTMLInputElement)?.value || '';
    const customerSearch = (document.getElementById('so-supplier-search') as HTMLInputElement)?.value || '';
    const date = (document.getElementById('so-date') as HTMLInputElement)?.value || '';
    const creditDays = (document.getElementById('so-credit-days') as HTMLInputElement)?.value || '0';
    const due = (document.getElementById('so-due-date') as HTMLInputElement)?.value || '';
    const payForm = (document.getElementById('so-payment-form') as HTMLSelectElement)?.value || '';
    const payDianCode = (document.getElementById('so-payment-dian-code') as HTMLSelectElement)?.value || '';
    const payMethod = payForm === '2' ? 'CREDITO' : (payDianCode === '10' ? 'EFECTIVO' : 'TRANSFERENCIA');
    const warehouseId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value || '';
    const txTypeId = (document.getElementById('so-tx-type') as HTMLSelectElement)?.value || '';
    const sellerId = (document.getElementById('so-seller') as HTMLSelectElement)?.value || '';
    const notes = (document.getElementById('so-notes') as HTMLInputElement)?.value || '';
    const salesOrderId = (document.getElementById('so-sales-order-id') as HTMLInputElement)?.value || '';
    const dianConcept = (document.getElementById('so-dian-concept') as HTMLSelectElement)?.value || '';
    const poNumber = (document.getElementById('so-po-number') as HTMLInputElement)?.value || '';
    const remisionNumber = (document.getElementById('so-remision-number') as HTMLInputElement)?.value || '';
    const orderNumberDisplay = (document.getElementById('so-order-number-display') as HTMLInputElement)?.value || '';

    const retMode = (window as any).__soRetMode || 'header';
    const retRuleRenta = (document.getElementById('so-hdr-ret-rule-renta') as HTMLSelectElement)?.value || '';
    const retRuleIca = (document.getElementById('so-hdr-ret-rule-ica') as HTMLSelectElement)?.value || '';
    const retRuleIva = (document.getElementById('so-hdr-ret-rule-iva') as HTMLSelectElement)?.value || '';

    const tableRows = document.querySelectorAll('#so-lines-body tr');
    const lines: any[] = [];
    tableRows.forEach((row: any) => {
      const idParts = row.id.split('-');
      const idx = idParts[idParts.length - 1];

      const prodId = (document.getElementById(`sol-prod-id-${idx}`) as HTMLInputElement)?.value;
      const nameEl = row.querySelector('span.truncate');
      const prodName = nameEl ? nameEl.textContent || '' : '';

      const qty = parseFloat((document.getElementById(`sol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const price = parseFloat((document.getElementById(`sol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const ivaRate = parseFloat((document.getElementById(`sol-iva-${idx}`) as HTMLSelectElement)?.value || '0') || 0;
      const discPct = parseFloat((document.getElementById(`sol-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const retRuleId = (document.getElementById(`sol-ret-rule-${idx}`) as HTMLSelectElement)?.value || '';

      if (!prodId) return;

      const soConfig = (window as any).__soConfig || {};
      const isTaxIn = !!soConfig.operational?.prices_include_iva;
      const unitPriceDb = isTaxIn ? (price / (1 + ivaRate / 100)) : price;

      // Conversión de cantidades y precios de vuelta a la unidad base de inventario
      const baseUnit = (row.dataset.baseUnit || 'UND').toUpperCase();
      const largoCm = parseFloat(row.dataset.largoCm || '0') || 0;
      const anchoCm = parseFloat(row.dataset.anchoCm || '0') || 0;
      const undEmpaque = parseFloat(row.dataset.undEmpaque || '0') || 0;
      const pesoBruto = parseFloat(row.dataset.pesoBruto || '0') || 0;
      const hasConversions = row.dataset.hasConversions === 'true';

      const unitSelect = document.getElementById(`sol-unit-${idx}`) as HTMLSelectElement;
      const selectedUnit = unitSelect ? unitSelect.value : baseUnit;

      let finalQty = qty;
      let finalPrice = unitPriceDb;
      let descriptionText = '';

      if (hasConversions && selectedUnit !== baseUnit) {
        const convs = convertQtyToUnits(qty, selectedUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);
        finalQty = convs.baseQty;

        const areaPorFicha = (largoCm * anchoCm) / 10000;
        const areaPorCaja = areaPorFicha * undEmpaque;

        let priceInBase = unitPriceDb;
        if (selectedUnit === 'M2') {
          if (baseUnit === 'UND') priceInBase = unitPriceDb * areaPorFicha;
          else if (baseUnit === 'CJ') priceInBase = unitPriceDb * areaPorCaja;
          else if (baseUnit === 'KG') {
            const pesoPorM2 = areaPorCaja > 0 ? (pesoBruto / areaPorCaja) : 0;
            priceInBase = pesoPorM2 > 0 ? (unitPriceDb / pesoPorM2) : unitPriceDb;
          }
        } else if (selectedUnit === 'CJ') {
          if (baseUnit === 'M2') priceInBase = areaPorCaja > 0 ? (unitPriceDb / areaPorCaja) : unitPriceDb;
          else if (baseUnit === 'UND') priceInBase = undEmpaque > 0 ? (unitPriceDb / undEmpaque) : unitPriceDb;
          else if (baseUnit === 'KG') priceInBase = pesoBruto > 0 ? (unitPriceDb / pesoBruto) : unitPriceDb;
        } else if (selectedUnit === 'UND') {
          if (baseUnit === 'M2') priceInBase = areaPorFicha > 0 ? (unitPriceDb / areaPorFicha) : unitPriceDb;
          else if (baseUnit === 'CJ') priceInBase = unitPriceDb * undEmpaque;
          else if (baseUnit === 'KG') {
            const pesoPorFicha = undEmpaque > 0 ? (pesoBruto / undEmpaque) : 0;
            priceInBase = pesoPorFicha > 0 ? (unitPriceDb / pesoPorFicha) : unitPriceDb;
          }
        } else if (selectedUnit === 'KG') {
          const pesoPorCaja = pesoBruto;
          if (baseUnit === 'M2') {
            priceInBase = areaPorCaja > 0 ? ((unitPriceDb * pesoPorCaja) / areaPorCaja) : unitPriceDb;
          } else if (baseUnit === 'CJ') {
            priceInBase = unitPriceDb * pesoPorCaja;
          } else if (baseUnit === 'UND') {
            priceInBase = undEmpaque > 0 ? ((unitPriceDb * pesoPorCaja) / undEmpaque) : unitPriceDb;
          }
        }
        finalPrice = priceInBase;
        descriptionText = `[Facturado: ${qty} ${selectedUnit} a ${(window as any).fmt(price)}/${selectedUnit}]`;
      }

      const isLoss = !!(document.getElementById(`sol-is-loss-${idx}`) as HTMLInputElement)?.checked;

      lines.push({
        product_id: prodId,
        _name: prodName,
        qty: finalQty,
        unit_price: finalPrice,
        iva_rate: ivaRate,
        discount_pct: discPct,
        ret_rule_id: retRuleId,
        description: descriptionText,
        is_loss: isLoss,
      });
    });

    const currentInvId = (document.getElementById('so-invoice-id') as HTMLInputElement)?.value || null;
    const currentInvNum = (document.getElementById('so-invoice-number') as HTMLInputElement)?.value || (document.getElementById('so-consecutivo-display') as HTMLInputElement)?.value || '';

    return {
      inv: {
        id: currentInvId,
        number: currentInvNum,
        customer_id: customerId,
        customer_search: customerSearch,
        date,
        credit_days: creditDays,
        due_date: due,
        payment_method: payMethod,
        warehouse_id: warehouseId,
        tx_type_id: txTypeId,
        seller_id: sellerId,
        notes,
        sales_order_id: salesOrderId,
        dian_concept: dianConcept,
        po_number: poNumber,
        remision_number: remisionNumber,
        _sales_order_number: orderNumberDisplay,
        ret_rule_renta_id: retRuleRenta,
        ret_rule_ica_id: retRuleIca,
        ret_rule_iva_id: retRuleIva,
        ret_mode: retMode,
      },
      lines
    };
  }

  (window as any).soSaveTempState = function() {
    if (!document.getElementById('so-supplier-search')) {
      return; // El formulario de ventas no está en el DOM (se abrió otro modal)
    }
    if (!invoiceId && !preloadedOrderId && !noteConfig) {
      const state = getSoFormCurrentState();
      localStorage.setItem('__soTempState', JSON.stringify(state));
    }
  };

  // Delegar eventos para autoguardar en cambios dentro del modal
  const formWrap = document.getElementById('so-supplier-search-wrap')?.closest('.space-y-4');
  if (formWrap) {
    const triggerSave = () => {
      if (typeof (window as any).soSaveTempState === 'function') {
        (window as any).soSaveTempState();
      }
    };
    formWrap.addEventListener('input', triggerSave);
    formWrap.addEventListener('change', triggerSave);
  }

  // Configurar eventos del modal
  document.getElementById('btn-save-so')?.addEventListener('click', () => saveInvoiceDraftWrapper(invoiceId, onDone, inv));

  const handleResetDraft = () => {
    (window as any).confirmDialog(
      'Limpiar Formulario de Factura',
      '¿Deseas descartar el borrador temporal guardado en este equipo e iniciar una nueva factura desde cero?',
      async () => {
        localStorage.removeItem('__soTempState');
        (window as any).soSaveTempState = null;
        (window as any).showToast('Borrador temporal eliminado. Formulario reiniciado.', 'info');
        await openSalesForm(null, onDone);
      }
    );
  };

  document.getElementById('btn-reset-so-draft')?.addEventListener('click', handleResetDraft);
  document.getElementById('btn-banner-reset-so')?.addEventListener('click', handleResetDraft);

  initSoGlobalProductSearch();
  window.soSuggestDueDate();
  window.soUpdateConsecutivoPreview();
  window.soSetRetMode((window as any).__soRetMode === 'line');
  if (typeof (window as any).soUpdateSaveButton === 'function') {
    (window as any).soUpdateSaveButton();
  }

  if ((window as any).__soSelectCustomerAfterLoad) {
    const sel = (window as any).__soSelectCustomerAfterLoad;
    (window as any).__soSelectCustomerAfterLoad = null;
    (window as any).selectSoSupplier(sel.id, sel.text);
    (window as any).showToast('Cliente creado y seleccionado en la venta.', 'success');
  }
}

// window.soSuggestDueDate está definido globalmente arriba.

// --- Persistencia Borrador Factura ---
async function saveInvoiceDraftWrapper(invoiceId: string | null, onDone: any = null, inv: any = null) {
  const soConfig = await getSalesConfig();
  const btn = document.getElementById('btn-save-so') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = soConfig.operational.immediate_posting
      ? '<i class="fas fa-spinner fa-spin"></i> Contabilizando...'
      : '<i class="fas fa-spinner fa-spin"></i> Guardando...';
  }

  try {
    const customerId = (document.getElementById('so-supplier') as HTMLInputElement)?.value;
    const date = (document.getElementById('so-date') as HTMLInputElement)?.value;
    const due = (document.getElementById('so-due-date') as HTMLInputElement)?.value;
    
    const payForm = (document.getElementById('so-payment-form') as HTMLSelectElement)?.value || '1';
    const payDianCode = (document.getElementById('so-payment-dian-code') as HTMLSelectElement)?.value || '10';
    // Map to legacy payMethod for compatibility:
    const payMethod = payForm === '2' ? 'CREDITO' : (payDianCode === '10' ? 'EFECTIVO' : 'TRANSFERENCIA');

    const warehouseId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value;
    const txTypeId = (document.getElementById('so-tx-type') as HTMLSelectElement)?.value;
    const domInvoiceId = (document.getElementById('so-invoice-id') as HTMLInputElement)?.value || null;
    const effectiveInvoiceId = invoiceId || domInvoiceId;

    const isElectronicEl = document.getElementById('so-is-electronic') as HTMLInputElement;
    const isElectronic = isElectronicEl ? isElectronicEl.checked : (txTypeId && (window as any).__soTxTypesCache?.find((t: any) => t.id === txTypeId)?.prefix === 'FV');
    const sellerId = (document.getElementById('so-seller') as HTMLSelectElement)?.value || null;
    const pendingDelivery = !!(document.getElementById('so-pending-delivery') as HTMLInputElement)?.checked;
    let notes = (document.getElementById('so-notes') as HTMLInputElement)?.value || '';

    const dianConcept = document.getElementById('so-dian-concept') as HTMLSelectElement;
    const isSinRef = (document.getElementById('so-dian-sin-ref') as HTMLInputElement)?.checked;
    if (dianConcept && !dianConcept.value) {
      throw new Error('Debes seleccionar el concepto de corrección DIAN.');
    }
    if (dianConcept && dianConcept.value) {
      notes = `[Ajuste DIAN: ${dianConcept.value}] ` + notes;
    }
    if (isSinRef) {
      notes = `[SIN_REFERENCIA] ` + notes;
    }

    if (!customerId) throw new Error('Debes seleccionar un cliente.');
    if (!date) throw new Error('La fecha de emisión es obligatoria.');
    if (!payMethod) throw new Error('Selecciona la forma de pago.');
    // Se valida más abajo después de calcular gross y retTotal
    if (!txTypeId) throw new Error('Selecciona el tipo de comprobante.');
    if (!warehouseId) throw new Error('Debes seleccionar la bodega origen (despacho).');

    const tableRows = document.querySelectorAll('#so-lines-body tr');
    const lines: any[] = [];
    let totalDiscount = 0;

    const isTaxIn = !!soConfig.operational.prices_include_iva;

    tableRows.forEach((row: any, lineIdx: number) => {
      const idParts = row.id.split('-');
      const idx = idParts[idParts.length - 1];

      const prodId = (document.getElementById(`sol-prod-id-${idx}`) as HTMLInputElement)?.value;
      const qty = parseFloat((document.getElementById(`sol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const price = parseFloat((document.getElementById(`sol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const ivaRate = parseFloat((document.getElementById(`sol-iva-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const discPct = parseFloat((document.getElementById(`sol-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const retRuleId = (window as any).__soRetMode === 'line' ? ((document.getElementById(`sol-ret-rule-${idx}`) as HTMLSelectElement)?.value || '') : '';

      if (!prodId) throw new Error(`Fila ${lineIdx + 1}: selecciona un producto.`);
      if (qty <= 0) throw new Error(`Fila ${lineIdx + 1}: la cantidad debe ser mayor que cero.`);

      const roundDec = (v: number) => typeof (window as any).roundDecimals === 'function'
        ? (window as any).roundDecimals(v)
        : Math.round((v + Number.EPSILON) * 100) / 100;

      let subtotal, iva_amount, total, storedPrice, lineDiscountAmt;
      if (isTaxIn) {
        const lineTotalGross = roundDec(qty * price);
        const lineTotalDisc = roundDec(lineTotalGross * (discPct / 100));
        const lineTotalNet = roundDec(lineTotalGross - lineTotalDisc);
        
        subtotal = roundDec(lineTotalNet / (1 + ivaRate / 100));
        iva_amount = roundDec(lineTotalNet - subtotal);
        total = roundDec(lineTotalNet);
        storedPrice = roundDec(price / (1 + ivaRate / 100));
        lineDiscountAmt = roundDec(lineTotalDisc / (1 + ivaRate / 100));
      } else {
        const lineGross = roundDec(qty * price);
        const lineDisc = roundDec(lineGross * (discPct / 100));
        
        subtotal = roundDec(lineGross - lineDisc);
        iva_amount = roundDec(subtotal * (ivaRate / 100));
        total = roundDec(subtotal + iva_amount);
        storedPrice = roundDec(price);
        lineDiscountAmt = roundDec(lineDisc);
      }

      totalDiscount = roundDec(totalDiscount + lineDiscountAmt);

      const isLoss = !!(document.getElementById(`sol-is-loss-${idx}`) as HTMLInputElement)?.checked;

      lines.push({
        product_id: prodId,
        qty: roundDec(qty),
        unit_price: storedPrice,
        iva_rate: ivaRate,
        iva_amount: roundDec(iva_amount),
        subtotal: roundDec(subtotal),
        total: roundDec(total),
        discount_rate: discPct,
        discount_pct: discPct,
        ret_rule_id: retRuleId,
        is_loss: isLoss,
      });
    });

    if (!lines.length) throw new Error('Agrega al menos una línea de venta.');

    // Validar existencias disponibles si stock negativo no está permitido
    const allowNegative = (window as any).__soConfig?.operational?.allow_negative_stock === true;
    const prodsCache = (window as any).__soProductsCache || [];
    const currentWhStock = (window as any).__soCurrentWhStock || [];
    const txTypesCache = (window as any).__soTxTypesCache || [];
    const selectedTxType = txTypesCache.find((t: any) => t.id === txTypeId);
    const isNC = (selectedTxType?.code === 'NC') || (selectedTxType?.prefix === 'NC') || ((window as any).__soNoteConfig?.type === 'NC');

    if (!allowNegative && !isNC) {
      // Agrupar cantidades solicitadas por producto
      const qtyByProd: Record<string, number> = {};
      lines.forEach(l => {
        if (l.product_id) {
          qtyByProd[l.product_id] = (qtyByProd[l.product_id] || 0) + Number(l.qty || 0);
        }
      });

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const prodObj = (prodsCache || []).find((p: any) => p.id === line.product_id);
        const isService = prodObj && (String(prodObj.type || '').toUpperCase() === 'SERVICIO' || prodObj.is_service === true);
        if (!isService && line.product_id) {
          const stockRow = (currentWhStock || []).find((s: any) => s.product_id === line.product_id);
          let availableStock = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;

          // Si estamos editando una factura existente (effectiveInvoiceId), sumar las cantidades
          // previamente asociadas a esta factura para no bloquear el guardado si la factura ya las descontó
          if (effectiveInvoiceId && existingLines && existingLines.length > 0) {
            const origQty = existingLines
              .filter((el: any) => el.product_id === line.product_id)
              .reduce((sum: number, el: any) => sum + Number(el.qty || 0), 0);
            availableStock += origQty;
          }

          const totalReqQty = qtyByProd[line.product_id] || line.qty;
          if (totalReqQty > availableStock + 0.0001) {
            throw new Error(`Fila ${i + 1}: La cantidad solicitada para "${prodObj?.name || 'Producto'}" (${(window as any).fmtN(totalReqQty)} unds) supera las existencias disponibles (${(window as any).fmtN(availableStock)} unds) en la bodega seleccionada.`);
          }
        }
      }
    }

    const roundDec = (v: number) => typeof (window as any).roundDecimals === 'function'
      ? (window as any).roundDecimals(v)
      : Math.round((v + Number.EPSILON) * 100) / 100;

    // Calcula retenciones finales
    let retTotal = 0;
    let retRuleRenta = '';
    let retRuleIca = '';
    let retRuleIva = '';

    if ((window as any).__soRetMode === 'line') {
      lines.forEach(l => {
        if (l.ret_rule_id && (window as any).__soRetRulesCache) {
          const rule = (window as any).__soRetRulesCache.find((r: any) => r.id === l.ret_rule_id);
          if (rule && l.subtotal >= rule.min_base) {
            retTotal = roundDec(retTotal + (l.subtotal * (rule.rate / 100)));
          }
        }
      });
    } else {
      retRuleRenta = (document.getElementById('so-hdr-ret-rule-renta') as HTMLSelectElement)?.value || '';
      retRuleIca = (document.getElementById('so-hdr-ret-rule-ica') as HTMLSelectElement)?.value || '';
      retRuleIva = (document.getElementById('so-hdr-ret-rule-iva') as HTMLSelectElement)?.value || '';
      const subtotalSum = roundDec(lines.reduce((s, l) => s + l.subtotal, 0));
      const ivaSum = roundDec(lines.reduce((s, l) => s + l.iva_amount, 0));
      const totalSum = roundDec(subtotalSum + ivaSum);

      const applyHdrRetRule = (ruleId: string, kind: 'renta' | 'ica' | 'iva') => {
        if (!ruleId || !(window as any).__soRetRulesCache) return;
        const r = (window as any).__soRetRulesCache.find((x: any) => x.id === ruleId);
        if (!r) return;
        const base = kind === 'iva' ? ivaSum : (String(r.base_type || '').toUpperCase() === 'TOTAL' ? totalSum : subtotalSum);
        if (base >= (r.min_base || 0)) retTotal = roundDec(retTotal + (base * (r.rate / 100)));
      };
      applyHdrRetRule(retRuleRenta, 'renta');
      applyHdrRetRule(retRuleIca, 'ica');
      applyHdrRetRule(retRuleIva, 'iva');
    }

    const subtotal = roundDec(lines.reduce((s, l) => s + l.subtotal, 0));
    const iva_total = roundDec(lines.reduce((s, l) => s + l.iva_amount, 0));
    const gross = roundDec(subtotal + iva_total);
    const retTotalRounded = roundDec(retTotal);
    const payableTotal = roundDec(gross - retTotalRounded);

    let bankAccountId = null;
    let paymentSplit = null;

    if (payMethod === 'TRANSFERENCIA') {
      bankAccountId = (document.getElementById('so-bank-account') as HTMLSelectElement)?.value || null;
      if (!bankAccountId) throw new Error('Selecciona la cuenta bancaria de destino.');
    } else if (payMethod === 'MIXTO') {
      const efec = roundDec(parseFloat((document.getElementById('so-mixed-efectivo') as HTMLInputElement)?.value || '0') || 0);
      const trans = roundDec(parseFloat((document.getElementById('so-mixed-transferencia') as HTMLInputElement)?.value || '0') || 0);
      const cred = roundDec(parseFloat((document.getElementById('so-mixed-credito') as HTMLInputElement)?.value || '0') || 0);
      
      const payableTotalExpected = payableTotal;
      if (Math.abs(payableTotalExpected - (efec + trans + cred)) > 0.01) {
        throw new Error(`La asignación de valores (${(window as any).fmt(efec + trans + cred)}) no coincide con el total a pagar (${(window as any).fmt(payableTotalExpected)}).`);
      }
      
      paymentSplit = JSON.stringify({ EFECTIVO: efec, TRANSFERENCIA: trans, CREDITO: cred });

      if (trans > 0) {
        bankAccountId = (document.getElementById('so-mixed-bank-account') as HTMLSelectElement)?.value || null;
        if (!bankAccountId) throw new Error('Selecciona la cuenta bancaria de destino para la porción de transferencia.');
      }
    }

    // Consecutivo auto-generado o asignado según resolución para facturas nuevas
    let number = '';
    if (effectiveInvoiceId && inv?.number) {
      number = inv.number;
    } else {
      if (typeof (window as any).soUpdateConsecutivoPreview === 'function') {
        (window as any).soUpdateConsecutivoPreview();
      }
      number = (document.getElementById('so-consecutivo-display') as HTMLInputElement)?.value || '';
    }

    const salesOrderId = (document.getElementById('so-sales-order-id') as HTMLInputElement)?.value || null;
    const poNumber = (document.getElementById('so-po-number') as HTMLInputElement)?.value?.trim() || '';
    const remisionNumber = (document.getElementById('so-remision-number') as HTMLInputElement)?.value?.trim() || '';

    // Precalcular comisiones si es histórico
    let commissionRate = 0;
    let commissionAmount = 0;
    if (sellerId) {
      try {
        const commSettingsRaw = await (window as any).API.getSetting('commission_settings_v1');
        const commSettings = commSettingsRaw ? JSON.parse(commSettingsRaw) : { method: 'dinamico' };
        if (commSettings.method === 'historico') {
          const rules = await (window as any).pb.listAll('commission_rules', { filter: 'active=true' });
          for (const line of lines) {
            const matchedRule = rules.find((r: any) => r.seller_id === sellerId && r.product_id === line.product_id) ||
                                rules.find((r: any) => !r.seller_id && r.product_id === line.product_id) ||
                                rules.find((r: any) => r.seller_id === sellerId && r.type === 'total_sale') ||
                                rules.find((r: any) => !r.seller_id && r.type === 'total_sale');
            if (matchedRule) {
              commissionAmount += (matchedRule.rate / 100) * (line.subtotal || 0);
            }
          }
          commissionAmount = roundDec(commissionAmount);
          commissionRate = subtotal > 0 ? roundDec((commissionAmount / subtotal) * 100) : 0;
        }
      } catch (err) {
        console.warn("Fallo al pre-calcular comisión histórica:", err);
      }
    }

    // Resolver sucursal activa o por defecto del usuario
    const activeBranchId = localStorage.getItem('active_branch_id');
    const currentUser = (window as any).pb.currentUser;
    const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS')
      ? activeBranchId
      : (currentUser?.default_branch_id || null);

    const header = {
      number,
      customer_id: customerId,
      warehouse_id: warehouseId || null,
      seller_id: sellerId,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      date,
      due_date: due || null,
      notes: notes.trim(),
      payment_method: payMethod,
      payment_form: payForm,
      payment_dian_code: payDianCode,
      bank_account_id: bankAccountId,
      po_number: poNumber,
      remision_number: remisionNumber,
      payment_split: paymentSplit,
      discount_amount: totalDiscount,
      subtotal,
      iva_total,
      ret_total: retTotalRounded,
      total: gross,
      payable_total: payableTotal,
      ret_rule_renta_id: retRuleRenta,
      ret_rule_ica_id: retRuleIca,
      ret_rule_iva_id: retRuleIva,
      tx_type_id: txTypeId,
      dian_resolution_id: inv?.dian_resolution_id || null,
      sales_order_id: salesOrderId || null,
      cross_doc_ref: inv?.cross_doc_ref || null,
      branch_id: inv?.branch_id || targetBranchId || null,
      has_pending_delivery: pendingDelivery,
      delivery_fulfillment_status: pendingDelivery ? 'PENDIENTE' : 'NO_REQUIERE',
      status: 'draft',
      is_electronic: isElectronic,
    };

    const crmDealId = (document.getElementById('so-crm-deal-id') as HTMLInputElement)?.value || null;
    let savedInvoiceId = effectiveInvoiceId;

    if (effectiveInvoiceId) {
      await (window as any).pb.update('invoices', effectiveInvoiceId, header);
      const oldLines = await (window as any).pb.listAll('invoice_lines', { filter: `invoice_id="${(window as any).pb.escapeFilterValue(effectiveInvoiceId)}"` });
      for (const ol of oldLines) await (window as any).pb.delete('invoice_lines', ol.id);
      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const linePayload: any = {};
        for (const [k, v] of Object.entries(rawLine)) {
          linePayload[k] = (v === '' || v === undefined) ? null : v;
        }
        await (window as any).pb.create('invoice_lines', { invoice_id: effectiveInvoiceId, line_order: i + 1, ...linePayload });
      }
      await (window as any).API.logAudit('UPDATE', 'Invoice', effectiveInvoiceId, `Actualizada factura borrador ${number}`);
      
      if (soConfig.operational.immediate_posting) {
        if (soConfig.operational.dian_dependent_posting && isElectronic) {
          await (window as any).API.validateInvoiceForDianEmit(effectiveInvoiceId);
        }
        await (window as any).API.postInvoice(effectiveInvoiceId);
        if (soConfig.operational.dian_dependent_posting && isElectronic) {
          try {
            (window as any).showToast('Generando y firmando XML UBL 2.1...', 'info');
            const updatedInv = await (window as any).pb.get('invoices', effectiveInvoiceId);
            const res = await (window as any).pb.send('/api/dian/emit', {
              method: 'POST',
              body: JSON.stringify({ txId: updatedInv.tx_id }),
              headers: { 'Content-Type': 'application/json' }
            });
            if (res && res.success) {
              (window as any).showToast(`Factura ${number} firmada en DIAN, aprobada y contabilizada correctamente`, 'success');
            } else {
              // Revertir contabilización y movimiento de inventario si falla la firma DIAN bajo el parámetro dian_dependent_posting
              await (window as any).API.rollbackInvoicePosting(effectiveInvoiceId, 'revertir_borrador', `Rechazo DIAN: ${res?.dianResponse || 'Error de emisión'}`).catch(() => {});
              await (window as any).pb.update('invoices', effectiveInvoiceId, { status: 'draft', tx_id: '', inv_movement_id: '' });
              (window as any).showToast(`Firma/Envío DIAN rechazado. La contabilización e inventario fueron revertidos y la factura permaneció en BORRADOR: ${res?.dianResponse || 'Error de emisión'}`, 'error');
            }
          } catch (dianErr: any) {
            await (window as any).API.rollbackInvoicePosting(effectiveInvoiceId, 'revertir_borrador', `Error DIAN: ${dianErr.message}`).catch(() => {});
            await (window as any).pb.update('invoices', effectiveInvoiceId, { status: 'draft', tx_id: '', inv_movement_id: '' });
            (window as any).showToast(`Error al emitir a la DIAN. La contabilización e inventario fueron revertidos y la factura permaneció en BORRADOR: ${dianErr.message}`, 'error');
          }
        } else {
          (window as any).showToast(`Factura ${number} guardada y contabilizada exitosamente`, 'success');
        }
      } else {
        (window as any).showToast('Factura comercial borrador actualizada', 'success');
      }
    } else {
      const payload = { ...header };
      if (inv?.dian_resolution_id) {
        (payload as any).dian_resolution_id = inv.dian_resolution_id;
      }
      const newInv = await (window as any).API.createInvoice(payload, lines);
      savedInvoiceId = newInv.id;
      
      if (soConfig.operational.immediate_posting) {
        if (soConfig.operational.dian_dependent_posting && isElectronic) {
          await (window as any).API.validateInvoiceForDianEmit(newInv.id);
        }
        await (window as any).API.postInvoice(newInv.id);
        if (soConfig.operational.dian_dependent_posting && isElectronic) {
          try {
            (window as any).showToast('Generando y firmando XML UBL 2.1...', 'info');
            const updatedInv = await (window as any).pb.get('invoices', newInv.id);
            const res = await (window as any).pb.send('/api/dian/emit', {
              method: 'POST',
              body: JSON.stringify({ txId: updatedInv.tx_id }),
              headers: { 'Content-Type': 'application/json' }
            });
            if (res && res.success) {
              (window as any).showToast(`Nueva factura ${number} firmada en DIAN, aprobada y contabilizada correctamente`, 'success');
            } else {
              await (window as any).API.rollbackInvoicePosting(newInv.id, 'revertir_borrador', `Rechazo DIAN: ${res?.dianResponse || 'Error de emisión'}`).catch(() => {});
              await (window as any).pb.update('invoices', newInv.id, { status: 'draft', tx_id: '', inv_movement_id: '' });
              (window as any).showToast(`Firma/Envío DIAN rechazado. La contabilización e inventario fueron revertidos y la factura permaneció en BORRADOR: ${res?.dianResponse || 'Error de emisión'}`, 'error');
            }
          } catch (dianErr: any) {
            await (window as any).API.rollbackInvoicePosting(newInv.id, 'revertir_borrador', `Error DIAN: ${dianErr.message}`).catch(() => {});
            await (window as any).pb.update('invoices', newInv.id, { status: 'draft', tx_id: '', inv_movement_id: '' });
            (window as any).showToast(`Error al emitir a la DIAN. La contabilización e inventario fueron revertidos y la factura permaneció en BORRADOR: ${dianErr.message}`, 'error');
          }
        } else {
          (window as any).showToast(`Nueva factura ${number} guardada y contabilizada exitosamente`, 'success');
        }
      } else {
        (window as any).showToast('Nueva factura de venta guardada en borrador', 'success');
      }
    }
    if (crmDealId && savedInvoiceId) {
      try {
        await (window as any).pb.update('crm_deals', crmDealId, {
          invoice_id: savedInvoiceId,
          stage: 'GANADO'
        });
        (window as any).showToast('Oportunidad CRM vinculada y marcada como GANADO', 'success');

        // Guardar interacción de factura creada en el historial del CRM
        await (window as any).pb.create('crm_interactions', {
          deal_id: crmDealId,
          user_id: (window as any).pb.currentUser?.id || null,
          type: 'COTIZACION',
          request_details: `Factura de venta creada: ${number || 'Factura'}`,
          response_details: `Valor facturado: ${(window as any).fmt(gross || 0)}. Estado: Cierre de proceso de venta (Ganado).`,
          response_at: (window as any).todayStr()
        });
      } catch (crmErr: any) {
        console.error("Error al vincular factura en CRM:", crmErr);
      }
    }
    localStorage.removeItem('__soTempState');
    (window as any).soSaveTempState = null;
    (window as any).closeModal();
    if (typeof onDone === 'function') onDone();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al guardar factura', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = soConfig.operational.immediate_posting
        ? '<i class="fas fa-check-double mr-1"></i> Guardar y Contabilizar'
        : '<i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador';
    }
  }
}

(window as any).openPendingDeliverySaleForm = function(onDone: any = null) {
  navigate('ventas');
  setTimeout(() => {
    openSalesForm(null, onDone || (() => renderVentas(document.getElementById('page-content')!)));
    setTimeout(() => {
      const pending = document.getElementById('so-pending-delivery') as HTMLInputElement | null;
      if (pending) {
        pending.checked = true;
        pending.dispatchEvent(new Event('change', { bubbles: true }));
      }
      (window as any).showToast('Factura preparada para reserva en importación y entrega pendiente', 'info');
    }, 150);
  }, 250);
};

// --- Impresión Carta Premium ---
window.printInvoiceCarta = async function(invoiceId: string, formatOverride?: string) {
  try {
    const cfg = await getSalesConfig();
    const defaultFormat = cfg.operational.print_format || 'carta_standard';
    const printFormat = formatOverride || defaultFormat;

    if (printFormat === 'carta_standard') {
      try {
        const token = (window as any).pb.getToken();
        const response = await fetch('/api/dian/pdf-bytes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ invoiceId })
        });
        if (response.ok) {
          const blob = await response.blob();
          const pdfUrl = URL.createObjectURL(blob);
          const pdfWin = window.open(pdfUrl, '_blank');
          if (!pdfWin) {
            (window as any).showToast('Por favor, permite abrir ventanas emergentes para visualizar el PDF.', 'warning');
          }
          return;
        }
      } catch (pdfErr) {
        console.warn('Fallback a formato HTML local por error al obtener PDF oficial:', pdfErr);
      }
    }

    const inv = await (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id,tx_id,tx_id.tx_type_id,pos_shift_id,seller_id,sales_order_id' });
    const lines = await (window as any).API.getInvoiceLines(invoiceId);

    const [compName, compNit, compAddress, compPhone, compEmail, compCity, compDept, compCountry, logoBase64] = await Promise.all([
      (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
      (window as any).API.getSetting('company_nit').catch(() => '901.442.115-3'),
      (window as any).API.getSetting('company_address').catch(() => ''),
      (window as any).API.getSetting('company_phone').catch(() => ''),
      (window as any).API.getSetting('company_email').catch(() => ''),
      (window as any).API.getSetting('company_city').catch(() => ''),
      (window as any).API.getSetting('company_dept').catch(() => (window as any).API.getSetting('company_department').catch(() => '')),
      (window as any).API.getSetting('company_country').catch(() => ''),
      (window as any).API.getSetting('company_logo').catch(() => ''),
    ]);

    // --- DIAN Resolution & CUFE / Signature Lookup ---
    let prefix = '';
    if (inv.number && inv.number.includes('-')) {
      prefix = inv.number.split('-')[0].trim().toUpperCase();
    }
    
    let docType = 'POS';
    if (inv.number && (inv.number.startsWith('FE') || inv.number.startsWith('FV') || inv.number.startsWith('NC') || inv.number.startsWith('ND'))) {
      if (inv.number.startsWith('FE') || inv.number.startsWith('FV')) docType = 'FV';
      else if (inv.number.startsWith('NC')) docType = 'NC';
      else if (inv.number.startsWith('ND')) docType = 'ND';
    } else if (!inv.pos_shift_id) {
      docType = 'FV';
    }

    let defaultDocTitle = 'Factura de Venta';
    if (docType === 'NC') defaultDocTitle = 'Nota Crédito de Venta';
    else if (docType === 'ND') defaultDocTitle = 'Nota Débito de Venta';
    else if (docType === 'FV') defaultDocTitle = 'Factura Electrónica de Venta';

    const docTitle = cfg.operational.document_title || defaultDocTitle;

    const formatGeoLocation = (cityVal?: string, deptVal?: string, cityCodeVal?: string, deptCodeVal?: string): string => {
      let cityName = (cityVal || '').trim();
      let deptName = (deptVal || '').trim();

      if (cityCodeVal && (window as any).geoMuni) {
        const muni = (window as any).geoMuni(cityCodeVal);
        if (muni && muni.name) {
          cityName = muni.name;
          if (!deptCodeVal && muni.dept_code) deptCodeVal = muni.dept_code;
        }
      }

      if (deptCodeVal && (window as any).geoDept) {
        const dept = (window as any).geoDept(deptCodeVal);
        if (dept && dept.name) {
          deptName = dept.name;
        }
      }

      if (cityName && deptName) {
        if (cityName.toUpperCase() === deptName.toUpperCase()) return cityName;
        return `${cityName} - ${deptName}`;
      }
      return cityName || deptName || '';
    };

    const compCityDeptStr = formatGeoLocation(compCity, compDept);
    const customerObj = inv.expand?.customer_id;
    const customerCityDeptStr = formatGeoLocation(customerObj?.city, customerObj?.department, customerObj?.city_code, customerObj?.dept_code);
    const poNumberStr = inv.po_number || '—';
    const orderNumberStr = inv._sales_order_number || inv.expand?.sales_order_id?.number || '—';
    const remisionNumberStr = inv.remision_number || '—';
    const sellerNameStr = inv.expand?.seller_id?.name || '—';
    const crossDocRefStr = inv.cross_doc_ref || '—';
    const dueDateStr = inv.due_date || inv.date;

    let resolutionStr = 'Autorización Numeración DIAN No. 18764087257379, Valida desde 2025-01-16 al 2026-01-16. Rango desde FE953 al FE2000. NO Gran Contribuyente, NO Autorretenedor.';
    try {
      const registerId = inv.expand?.pos_shift_id?.pos_register_id || '';
      let filter = `document_type="${docType}" && active=true`;
      
      let resList = [];
      if (registerId && docType === 'POS') {
        resList = await (window as any).pb.listAll('dian_resolutions', { 
          filter: `${filter} && pos_register_id="${(window as any).pb.escapeFilterValue(registerId)}"` 
        }).catch(() => []);
      }
      
      if (!resList.length) {
        let fallbackFilter = `${filter}`;
        if (docType === 'POS') {
          fallbackFilter += ` && pos_register_id=""`;
        }
        if (prefix) {
          fallbackFilter += ` && prefix="${(window as any).pb.escapeFilterValue(prefix)}"`;
        }
        resList = await (window as any).pb.listAll('dian_resolutions', { filter: fallbackFilter }).catch(() => []);
      }
      
      if (!resList.length) {
        resList = await (window as any).pb.listAll('dian_resolutions', { filter: `document_type="${docType}" && active=true` }).catch(() => []);
      }

      let resolution = null;
      if (resList.length) {
        const parts = inv.number ? inv.number.split('-') : [];
        const invNum = parts.length ? (parseInt(parts[parts.length - 1], 10) || 0) : 0;
        resolution = resList.find((r: any) => invNum >= r.number_from && invNum <= r.number_to);
        if (!resolution) {
          resolution = resList.find((r: any) => r.active) || resList[0];
        }
      }

      if (resolution) {
        const rDate = resolution.resolution_date ? resolution.resolution_date.slice(0, 10) : '—';
        const eDate = resolution.expiration_date ? resolution.expiration_date.slice(0, 10) : '—';
        const rPrefix = resolution.prefix || '';
        const docLabel = resolution.document_type === 'FV' ? 'Resolución Facturación Electrónica' : 'Autorización Facturación POS';
        resolutionStr = `${docLabel} No. ${resolution.resolution_number} del ${rDate}. Rango desde ${rPrefix}${resolution.number_from} al ${rPrefix}${resolution.number_to}. Vigente hasta ${eDate}.`;
      }
    } catch (_) {}

    let cufeVal = '';
    if (inv.tx_id) {
      try {
        const einvs = await (window as any).pb.listAll('einvoice_docs', { filter: `tx_id="${(window as any).pb.escapeFilterValue(inv.tx_id)}"` }).catch(() => []);
        if (einvs.length) {
          cufeVal = einvs[0].cufe || '';
        }
      } catch (_) {}
    }
    if (!cufeVal) {
      cufeVal = '898693ace5ddccf4130fe30b590ccc619554b73f00098ae746faa53495fec' + invoiceId.substring(0, 16);
    }

    // --- Spanish Number-to-Words Helper ---
    function numeroALetras(num: number): string {
      var tempNum = parseFloat(String(num)).toFixed(2).split('.');
      var entero = parseInt(tempNum[0], 10);
      var centavos = tempNum[1];
      
      if (entero === 0) return 'Cero Pesos M/CTE con ' + centavos + '/100';
      
      function letras(n: number): string {
        if (n < 10) {
          return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
        }
        if (n < 20) {
          return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
        }
        if (n < 30) {
          if (n === 20) return 'Veinte';
          return 'Veinti' + letras(n - 20).toLowerCase();
        }
        if (n < 100) {
          var u = n % 10;
          var d = Math.floor(n / 10);
          var decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
          return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
        }
        if (n < 1000) {
          var d_u = n % 100;
          var c = Math.floor(n / 100);
          var centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
          if (n === 100) return 'Cien';
          if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
          return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
        }
        if (n < 1000000) {
          var mil = Math.floor(n / 1000);
          var resto = n % 1000;
          var t = '';
          if (mil === 1) t = 'Mil';
          else t = letras(mil) + ' mil';
          return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
        }
        if (n < 1000000000) {
          var millon = Math.floor(n / 1000000);
          var resto = n % 1000000;
          var t = '';
          if (millon === 1) t = 'Un millón';
          else t = letras(millon) + ' millones';
          return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
        }
        return '';
      }
      
      var res = letras(entero);
      res = res.charAt(0).toUpperCase() + res.slice(1);
      return 'Son. ' + res + ' Pesos M/CTE con ' + centavos + '/100';
    }

    const totalNetoVal = inv.payable_total ?? inv.total ?? 0;
    const totalEnLetras = numeroALetras(totalNetoVal);

    // --- Tax & Withholding Calculations ---
    const ivaGroups: Record<number, { base: number; amount: number }> = {};
    lines.forEach((l: any) => {
      const rate = l.iva_rate || 0;
      if (!ivaGroups[rate]) {
        ivaGroups[rate] = { base: 0, amount: 0 };
      }
      ivaGroups[rate].base += l.subtotal || 0;
      ivaGroups[rate].amount += l.iva_amount || 0;
    });

    const rates = [19, 5, 0];
    const ivaRowsHtml = rates.map(r => {
      const data = ivaGroups[r] || { base: 0, amount: 0 };
      return `
        <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:8.5px; border-bottom:1px dashed #ddd; padding-bottom:1px;">
          <span style="font-weight:bold; width:30%; text-align:left;">IVA ${r}%</span>
          <span style="width:35%; text-align:right;">$ ${(window as any).fmtN(data.base)}</span>
          <span style="width:35%; text-align:right;">$ ${(window as any).fmtN(data.amount)}</span>
        </div>
      `;
    }).join('');

    const allRules = (window as any).__soRetRulesCache || [];
    const ruleRenta = allRules.find((r: any) => r.id === inv.ret_rule_renta_id);
    const ruleIca = allRules.find((r: any) => r.id === inv.ret_rule_ica_id);
    
    let reteRentaVal = 0;
    let reteIcaVal = 0;
    const subtotalSum = inv.subtotal || 0;
    
    if (ruleRenta && subtotalSum >= ruleRenta.min_base) {
      reteRentaVal = subtotalSum * (ruleRenta.rate / 100);
    }
    if (ruleIca && subtotalSum >= ruleIca.min_base) {
      reteIcaVal = subtotalSum * (ruleIca.rate / 100);
    }

    const retRowsHtml = `
      <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:8.5px; border-bottom:1px dashed #ddd; padding-bottom:1px;">
        <span style="font-weight:bold; text-align:left; color:#c2410c;">Fte. (${ruleRenta ? ruleRenta.rate + '%' : '-'})</span>
        <span style="text-align:right; color:#c2410c;">$ ${reteRentaVal > 0 ? (window as any).fmtN(reteRentaVal) : '-'}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:8.5px; border-bottom:1px dashed #ddd; padding-bottom:1px;">
        <span style="font-weight:bold; text-align:left; color:#c2410c;">ICA (${ruleIca ? ruleIca.rate + '%' : '-'})</span>
        <span style="text-align:right; color:#c2410c;">$ ${reteIcaVal > 0 ? (window as any).fmtN(reteIcaVal) : '-'}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:8.5px; border-bottom:1px dashed #ddd; padding-bottom:1px;">
        <span style="font-weight:bold; text-align:left; color:#c2410c;">IVA</span>
        <span style="text-align:right; color:#c2410c;">$ -</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-size:8.5px;">
        <span style="font-weight:bold; text-align:left; color:#c2410c;">Otra</span>
        <span style="text-align:right; color:#c2410c;">$ -</span>
      </div>
    `;

    const totalUnits = lines.reduce((s: number, l: any) => s + (l.qty || 0), 0);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      (window as any).showToast('Por favor, permite abrir ventanas emergentes para imprimir.', 'warning');
      return;
    }

    const docStr = printWin.document;
    let htmlContent = '';

    if (printFormat === 'carta_remision') {
      const watermarkHtml = logoBase64 
        ? `<img src="data:image/png;base64,${logoBase64}" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); opacity:0.04; width:380px; height:auto; pointer-events:none; z-index:-10;" />`
        : '';

      htmlContent = `
        <html>
        <head>
          <title>${(window as any).esc(docTitle)} — ${inv.number}</title>
          <style>
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              color: #000;
              margin: 15px;
              font-size: 11px;
              line-height: 1.4;
            }
            .lines-table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            .lines-table th {
              border-top: 2px double #000;
              border-bottom: 1.5px solid #000;
              padding: 6px 5px;
              font-size: 11px;
              font-weight: bold;
              text-align: left;
              text-transform: uppercase;
            }
            .lines-table td {
              padding: 6px 5px;
              font-size: 10.5px;
              border-bottom: 1px solid #f1f5f9;
            }
            .lines-table tr:last-child td {
              border-bottom: 1.5px solid #000;
            }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${watermarkHtml}
          
          <!-- Encabezado Principal (Remisión - 3 Columnas) -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border-bottom:1.5px solid #000; padding-bottom:8px;">
            <tr>
              <!-- Logo de la Empresa (Izquierda) -->
              <td style="width:25%; vertical-align:middle; text-align:left;">
                ${logoBase64 
                  ? `<img src="data:image/png;base64,${logoBase64}" style="max-height:75px; max-width:180px; object-fit:contain;" />` 
                  : `<div style="font-weight:900; font-size:24px; color:#1e3a8a; font-family:sans-serif; letter-spacing:-1px;">${(window as any).esc(compName.substring(0, 3))}</div>`
                }
              </td>
              <!-- Detalles de la Empresa (Centro) -->
              <td style="width:45%; text-align:center; vertical-align:top; line-height:1.4;">
                <div style="font-size:14px; font-weight:bold; text-transform:uppercase; color:#000; letter-spacing:-0.2px;">${(window as any).esc(compName)}</div>
                <div style="font-size:10px; font-weight:bold;">NIT. ${(window as any).esc(compNit)}</div>
                <div style="font-size:9.5px; color:#333; margin-top:2px;">
                  ${compAddress ? `Dirección: ${(window as any).esc(compAddress)}<br>` : ''} 
                  ${compCityDeptStr ? `Ciudad / Depto: ${(window as any).esc(compCityDeptStr)}<br>` : ''}
                  ${compPhone ? `Tel: ${(window as any).esc(compPhone)}` : ''}
                  ${compEmail ? `${compPhone ? ' | ' : ''}E-mail: ${(window as any).esc(compEmail)}` : ''}
                </div>
              </td>
              <!-- Título y Número del Documento (Derecha) -->
              <td style="width:30%; text-align:right; vertical-align:top; line-height:1.4;">
                <div style="color:#1e3a8a; font-size:15px; font-weight:bold; text-transform:uppercase; margin-bottom:2px;">${(window as any).esc(docTitle)}</div>
                <div style="font-size:13px; font-weight:bold; font-family:monospace; color:#ef4444; margin-bottom:4px;">${inv.number}</div>
                <div style="font-size:9.5px; color:#333; line-height:1.35;">
                  <strong>Fecha Emisión:</strong> ${(window as any).fmtDate(inv.date)}<br>
                  <strong>Fecha Vencimiento:</strong> ${(window as any).fmtDate(dueDateStr)}<br>
                  <strong>Forma de Pago:</strong> ${inv.payment_method === 'CREDITO' ? 'Crédito' : 'Contado'}<br>
                  <strong>Orden Compra:</strong> ${(window as any).esc(poNumberStr)}<br>
                  <strong>N.º Pedido:</strong> ${(window as any).esc(orderNumberStr)}<br>
                  <strong>N.º Remisión:</strong> ${(window as any).esc(remisionNumberStr)}<br>
                  <strong>Vendedor:</strong> ${(window as any).esc(sellerNameStr)}
                  ${(docType === 'NC' || docType === 'ND') ? `<br><strong>Doc. Referenciado:</strong> ${(window as any).esc(crossDocRefStr)}` : ''}
                </div>
              </td>
            </tr>
          </table>

          <!-- Bloque de Datos de Cliente -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border:1px solid #000; border-radius:4px;">
            <tr>
              <td style="padding:8px; font-size:10.5px; line-height:1.4;">
                <div style="border-bottom:1px solid #000; font-weight:bold; margin-bottom:6px; text-transform:uppercase; font-size:10.5px; padding-bottom:2px; color:#111;">Adquirente / Cliente</div>
                <table style="width:100%; border-collapse:collapse; font-size:10px;">
                  <tr>
                    <td style="width:50%; vertical-align:top; padding:3px 0;"><strong>Nombre/Razón Social:</strong> ${(window as any).esc(customerObj?.name || 'Consumidor Final')}</td>
                    <td style="width:50%; vertical-align:top; padding:3px 0;"><strong>NIT / Cédula:</strong> ${(window as any).esc(customerObj?.doc_number || customerObj?.nit || '—')}</td>
                  </tr>
                  <tr>
                    <td style="vertical-align:top; padding:3px 0;"><strong>Dirección:</strong> ${(window as any).esc(customerObj?.address || '—')}</td>
                    <td style="vertical-align:top; padding:3px 0;"><strong>Ciudad / Depto:</strong> ${(window as any).esc(customerCityDeptStr || '—')}</td>
                  </tr>
                  <tr>
                    <td style="vertical-align:top; padding:3px 0;"><strong>Teléfono:</strong> ${(window as any).esc(customerObj?.phone || '—')}</td>
                    <td style="vertical-align:top; padding:3px 0;"><strong>E-mail:</strong> ${(window as any).esc(customerObj?.email || '—')}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Tabla de Artículos -->
          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:5%; text-align:center;">Ite</th>
                <th style="width:12%;">Código</th>
                <th style="width:43%;">Descripción del Producto / Servicio</th>
                <th style="width:12%;">Referencia</th>
                <th style="width:8%; text-align:center;">UM</th>
                <th style="width:8%; text-align:right;">Cant.</th>
                <th style="width:12%; text-align:right;">Precio</th>
                <th style="width:12%; text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l, index) => {
                const iteNum = String(index + 1).padStart(3, '0');
                const prodCode = l.expand?.product_id?.code || 'S/C';
                const baseName = l.expand?.product_id?.name || l.description || 'Línea de Venta';
                const prodName = baseName + (l.expand?.product_id?.name && l.description && l.expand.product_id.name !== l.description ? ' - ' + l.description : '');
                const prodRef = l.expand?.product_id?.presentacion || '—';
                const prodUnit = l.expand?.product_id?.unit || 'UND';
                const discountPct = l.discount_rate || l.discount_pct || 0;
                return `
                  <tr>
                    <td style="text-align:center; font-family:monospace;">${iteNum}</td>
                    <td style="font-family:monospace;">${(window as any).esc(prodCode)}</td>
                    <td style="font-weight:600;">
                      ${(window as any).esc(prodName)}
                      ${discountPct > 0 ? `<span style="font-size: 9px; color: #dc2626; font-weight: normal; margin-left: 6px;">(Dto. ${discountPct}%)</span>` : ''}
                    </td>
                    <td>${(window as any).esc(prodRef)}</td>
                    <td style="text-align:center;">${(window as any).esc(prodUnit)}</td>
                    <td style="text-align:right;">${(window as any).fmtN(l.qty)}</td>
                    <td style="text-align:right;">${(window as any).fmt(l.unit_price)}</td>
                    <td style="text-align:right; font-weight:700; color:#000;">${(window as any).fmt(l.total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Cuadro de Totales Simplificado para Remisión -->
          <table style="width:100%; border-collapse:collapse; border:1px solid #000; font-size:9.5px; margin-bottom:12px;">
            <tr>
              <!-- Metadatos de la entrega -->
              <td style="width:60%; padding:8px; vertical-align:top; line-height:1.5; color:#333;">
                <div style="font-weight:bold; color:#111; margin-bottom:4px; text-transform:uppercase; border-bottom:1px solid #ddd; padding-bottom:2px;">Resumen de Entrega</div>
                <strong>Moneda:</strong> COP<br>
                <strong>Total Ítems:</strong> ${lines.length}<br>
                <strong>Total Unidades:</strong> ${totalUnits}
              </td>
              <!-- Totales Financieros Simplificados -->
              <td style="width:40%; border-left:1px solid #000; padding:8px; vertical-align:top; background:#f8fafc; line-height:1.5;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span style="font-weight:bold; color:#475569;">SUB TOTAL:</span>
                  <span style="font-weight:bold; color:#0f172a;">$ ${(window as any).fmtN(inv.subtotal || 0)}</span>
                </div>
                ${inv.discount_amount > 0 ? `
                  <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#dc2626;">
                    <span style="font-weight:bold;">DESCUENTOS:</span>
                    <span style="font-weight:bold;">-$ ${(window as any).fmtN(inv.discount_amount)}</span>
                  </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; border-top:1.5px solid #000; padding-top:6px; margin-top:4px;">
                  <span style="font-weight:bold; color:#1e3a8a; font-size:11px;">TOTAL NETO:</span>
                  <span style="font-weight:900; color:#1e3a8a; font-size:13px;">$ ${(window as any).fmtN(totalNetoVal)}</span>
                </div>
              </td>
            </tr>
          </table>

          <!-- Sección de Notas y Total en Letras -->
          <div style="font-size:9.5px; line-height:1.4; color:#111; margin-top:15px; margin-bottom:15px;">
            ${inv.notes ? `
              <div style="margin-bottom:8px;">
                <strong>Notas / Observaciones:</strong>
                <div style="background:#f8fafc; padding:6px; border:1px solid #cbd5e1; border-radius:4px; margin-top:2px;">
                  ${(window as any).esc(inv.notes)}
                </div>
              </div>
            ` : ''}
            
            <div style="font-weight:bold; background:#f8fafc; padding:6px; border:1px solid #cbd5e1; border-radius:4px;">
              ${totalEnLetras}
            </div>
          </div>

          <!-- Bloque de Firmas -->
          <table style="width:100%; border-collapse:collapse; margin-top:40px; margin-bottom:20px;">
            <tr>
              <!-- Firma Entregado -->
              <td style="width:45%; border-top:1px solid #000; text-align:center; padding-top:6px; font-size:9.5px; vertical-align:top;">
                <div style="font-weight:bold; color:#0f172a;">Entregado por</div>
                <div style="color:#64748b; font-size:8.5px; margin-top:2px;">Firma Autorizada</div>
              </td>
              <!-- Espacio intermedio -->
              <td style="width:10%;"></td>
              <!-- Firma Recibido -->
              <td style="width:45%; border-top:1px solid #000; text-align:center; padding-top:6px; font-size:9.5px; vertical-align:top;">
                <div style="font-weight:bold; color:#0f172a;">Recibido Conforme</div>
                <div style="color:#64748b; font-size:8.5px; margin-top:2px;">Nombre, C.C. y Fecha</div>
              </td>
            </tr>
          </table>

          <!-- Footer simple -->
          <div style="clear:both; text-align:center; border-top:1px dashed #cbd5e1; padding-top:12px; color:#64748b; font-size:8.5px; margin-top:30px; line-height:1.4;">
            <p style="margin: 2px 0;">Este documento es una representación física simplificada (Remisión de Entrega) y no constituye una factura de venta electrónica.</p>
            <p style="margin: 2px 0;">Software de Gestión GRAVY v2.0 — Sistema ERP y Control Administrativo.</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
    } else if (printFormat === 'carta_modern') {
      htmlContent = `
        <html>
        <head>
          <title>${(window as any).esc(docTitle)} — ${inv.number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Outfit', sans-serif; color: #1e293b; margin: 40px; font-size: 13px; line-height: 1.5; background: #ffffff; }
            .hdr-wrapper { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px; border-bottom: 2px solid #f1f5f9; padding-bottom: 25px; }
            .hdr-left { max-width: 65%; }
            .hdr-right { text-align: right; min-width: 30%; }
            .logo-container { height: 60px; margin-bottom: 12px; display: flex; align-items: center; }
            .logo-container img { max-height: 60px; max-width: 180px; object-fit: contain; }
            .company-name { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
            .company-details { color: #64748b; font-size: 12.5px; line-height: 1.4; }
            .invoice-title { font-size: 22px; font-weight: 900; color: #2563eb; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 2px; }
            .invoice-number { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 15px; font-family: monospace; }
            .meta-list { display: flex; flex-direction: column; gap: 4px; color: #64748b; font-size: 12.5px; align-items: flex-end; }
            .meta-list div { display: flex; gap: 6px; }
            .meta-list span { font-weight: 600; color: #0f172a; }
            
            .customer-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #f8fafc; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); }
            .customer-card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            .customer-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 12px 24px; font-size: 13px; }
            .customer-grid div { display: flex; flex-direction: column; }
            .customer-grid label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
            .customer-grid value { font-weight: 600; color: #334155; }

            .lines-table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 13px; }
            .lines-table th { background: #f1f5f9; color: #475569; font-weight: 700; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            .lines-table th:first-child { border-radius: 8px 0 0 8px; }
            .lines-table th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
            .lines-table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .lines-table tr:last-child td { border-bottom: 2px solid #e2e8f0; }
            
            .footer-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 30px; }
            .notes-container { max-width: 50%; color: #64748b; font-size: 12px; line-height: 1.6; }
            .notes-title { font-weight: bold; color: #475569; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            
            .totals-wrapper { width: 40%; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
            .total-row { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; }
            .total-row.grand-total { border-top: 2px solid #f1f5f9; padding-top: 12px; margin-top: 4px; }
            .total-row.grand-total .label { font-size: 13.5px; font-weight: 800; color: #0f172a; }
            .total-row.grand-total .value { font-size: 18px; font-weight: 800; color: #2563eb; }
            
            .legal-footer { clear: both; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 25px; color: #94a3b8; font-size: 11px; margin-top: 60px; line-height: 1.6; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="hdr-wrapper">
            <div class="hdr-left">
              ${logoBase64 ? `<div class="logo-container"><img src="data:image/png;base64,${logoBase64}" alt="Logo" /></div>` : ''}
              <div class="company-name">${(window as any).esc(compName)}</div>
              <div class="company-details">
                NIT: ${(window as any).esc(compNit)}<br>
                ${compAddress ? `Dirección: ${(window as any).esc(compAddress)}<br>` : ''}
                ${compCityDeptStr ? `Ciudad / Depto: ${(window as any).esc(compCityDeptStr)}<br>` : ''}
                ${compPhone ? `Teléfono: ${(window as any).esc(compPhone)}<br>` : ''}
                ${compEmail ? `Email: ${(window as any).esc(compEmail)}<br>` : ''}
              </div>
            </div>
            <div class="hdr-right">
              <div class="invoice-title">${(window as any).esc(docTitle)}</div>
              <div class="invoice-number">${inv.number}</div>
              <div class="meta-list">
                <div>Fecha Emisión: <span>${(window as any).fmtDate(inv.date)}</span></div>
                <div>Fecha Vencimiento: <span>${(window as any).fmtDate(dueDateStr)}</span></div>
                <div>Orden Compra: <span>${(window as any).esc(poNumberStr)}</span></div>
                <div>N.º Pedido: <span>${(window as any).esc(orderNumberStr)}</span></div>
                <div>N.º Remisión: <span>${(window as any).esc(remisionNumberStr)}</span></div>
                <div>Vendedor: <span>${(window as any).esc(sellerNameStr)}</span></div>
                ${(docType === 'NC' || docType === 'ND') ? `<div>Doc. Referenciado: <span>${(window as any).esc(crossDocRefStr)}</span></div>` : ''}
                <div>Estado: <span style="text-transform:uppercase;color:${inv.status === 'posted' ? '#16a34a' : '#ea580c'}">${inv.status === 'posted' ? 'VIGENTE' : 'BORRADOR'}</span></div>
              </div>
            </div>
          </div>

          <!-- Datos del Cliente -->
          <div class="customer-card">
            <div class="customer-card-title">Adquirente / Cliente</div>
            <div class="customer-grid">
              <div><label>Cliente / Razón Social</label><value>${(window as any).esc(customerObj?.name || 'Consumidor Final')}</value></div>
              <div><label>NIT / Cédula</label><value>${(window as any).esc(customerObj?.doc_number || customerObj?.nit || '—')}</value></div>
              <div><label>Dirección</label><value>${(window as any).esc(customerObj?.address || '—')}</value></div>
              <div><label>Ciudad / Departamento</label><value>${(window as any).esc(customerCityDeptStr || '—')}</value></div>
              <div><label>Teléfono</label><value>${(window as any).esc(customerObj?.phone || '—')}</value></div>
              <div><label>Forma de Pago</label><value>${inv.payment_method === 'CREDITO' ? 'Crédito' : 'Contado'}</value></div>
            </div>
          </div>

          <!-- Tabla de Artículos -->
          <table class="lines-table">
            <thead>
              <tr>
                <th>Detalle del Artículo / Servicio</th>
                <th style="text-align:right; width: 10%;">Cantidad</th>
                <th style="text-align:right; width: 20%;">Precio Unitario</th>
                <th style="text-align:right; width: 10%;">IVA</th>
                <th style="text-align:right; width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map(l => {
                const discountPct = l.discount_rate || l.discount_pct || 0;
                return `
                  <tr>
                    <td style="font-weight:600">
                      ${(window as any).esc((l.expand?.product_id?.name || l.description || 'Línea de Venta') + (l.expand?.product_id?.name && l.description ? ' ' + l.description : ''))}
                      ${discountPct > 0 ? `<span style="font-size: 11px; color: #dc2626; font-weight: normal; margin-left: 8px;">(Dto. ${discountPct}%)</span>` : ''}
                    </td>
                    <td style="text-align:right">${(window as any).fmtN(l.qty)}</td>
                    <td style="text-align:right">${(window as any).fmt(l.unit_price)}</td>
                    <td style="text-align:right">${l.iva_rate}%</td>
                    <td style="text-align:right;font-weight:700;color:#2563eb">${(window as any).fmt(l.total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Sección inferior -->
          <div class="footer-section">
            <div class="notes-container">
              ${inv.notes ? `
                <div class="notes-title">Notas / Observaciones</div>
                <p>${(window as any).esc(inv.notes)}</p>
              ` : ''}
            </div>
            
            <div class="totals-wrapper">
              <div class="total-row"><span>Subtotal:</span><span>${(window as any).fmt(inv.subtotal || 0)}</span></div>
              ${inv.discount_amount > 0 ? `<div class="total-row" style="color:#dc2626"><span>Descuentos:</span><span>- ${(window as any).fmt(inv.discount_amount || 0)}</span></div>` : ''}
              <div class="total-row"><span>IVA Calculado:</span><span>${(window as any).fmt(inv.iva_total || 0)}</span></div>
              ${inv.ret_total > 0 ? `<div class="total-row" style="color:#ea580c"><span>Retenciones:</span><span>- ${(window as any).fmt(inv.ret_total || 0)}</span></div>` : ''}
              <div class="total-row grand-total">
                <span class="label">TOTAL NETO:</span>
                <span class="value">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</span>
              </div>
            </div>
          </div>

          <!-- Footer legal -->
          <div class="legal-footer">
            <p style="margin: 4px 0; font-weight: 600; color: #475569;">${resolutionStr}</p>
            <p>Esta factura de venta se asimila en sus efectos a una Letra de Cambio según el Artículo 779 del Código de Comercio colombiano.</p>
            <p>Software de Gestión GRAVY v2.0 — Sistema de ERP y Control Administrativo Autorizado. Soporte Técnico: soporte@gravy.com</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
    } else if (printFormat === 'carta_compact') {
      htmlContent = `
        <html>
        <head>
          <title>${(window as any).esc(docTitle)} — ${inv.number}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; margin: 15px; font-size: 11px; line-height: 1.35; }
            .hdr-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .hdr-left { vertical-align: top; width: 60%; }
            .hdr-right { vertical-align: top; width: 40%; text-align: right; }
            .company-name { font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 2px; }
            .invoice-title { font-size: 16px; font-weight: 800; color: #1e3a8a; margin-bottom: 2px; }
            .box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; background: #f8fafc; margin-bottom: 12px; }
            .box-title { font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; margin-bottom: 6px; color: #1e293b; font-size: 11px; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 4px; }
            .details-grid div span { font-weight: bold; color: #475569; }
            .lines-table { width: 100%; border-collapse: collapse; margin: 15px 0 10px 0; }
            .lines-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 6px; font-size: 10.5px; text-transform: uppercase; }
            .lines-table td { padding: 5px 6px; border-bottom: 1px solid #e2e8f0; }
            .lines-table tr:last-child td { border-bottom: 2px solid #0f172a; }
            .totals-table { width: 35%; float: right; border-collapse: collapse; margin-bottom: 15px; font-size: 11px; }
            .totals-table td { padding: 4px 6px; }
            .totals-table tr.grand-total td { font-size: 13px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #cbd5e1; }
            .footer { clear: both; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 10px; color: #64748b; font-size: 10px; margin-top: 15px; }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="hdr-table">
            <tr>
              <td class="hdr-left">
                ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" style="max-height:50px; max-width:150px; object-fit:contain; margin-bottom:5px;" /><br>` : ''}
                <div class="company-name">${(window as any).esc(compName)}</div>
                <div>NIT: ${(window as any).esc(compNit)}</div>
                ${compAddress ? `<div>Dirección: ${(window as any).esc(compAddress)}</div>` : ''}
                ${compCityDeptStr ? `<div>Ciudad / Depto: ${(window as any).esc(compCityDeptStr)}</div>` : ''}
                ${compPhone ? `<div>Teléfono: ${(window as any).esc(compPhone)}</div>` : ''}
                ${compEmail ? `<div>Email: ${(window as any).esc(compEmail)}</div>` : ''}
              </td>
              <td class="hdr-right">
                <div class="invoice-title">${(window as any).esc(docTitle.toUpperCase())}</div>
                <div style="font-size:14px;font-weight:bold;color:#ef4444;margin-bottom:5px">${inv.number}</div>
                <div>Fecha Emisión: ${(window as any).fmtDate(inv.date)}</div>
                <div>Fecha Vencimiento: ${(window as any).fmtDate(dueDateStr)}</div>
                <div>Orden Compra: ${(window as any).esc(poNumberStr)} | Pedido: ${(window as any).esc(orderNumberStr)}</div>
                <div>Remisión: ${(window as any).esc(remisionNumberStr)} | Vendedor: ${(window as any).esc(sellerNameStr)}</div>
                ${(docType === 'NC' || docType === 'ND') ? `<div>Doc. Ref: ${(window as any).esc(crossDocRefStr)}</div>` : ''}
                <div>Estado de Pago: <span style="font-weight:bold;text-transform:uppercase;color:${inv.status === 'posted' ? 'green' : 'orange'}">${inv.status === 'posted' ? 'CONTABILIZADA / VIGENTE' : 'BORRADOR'}</span></div>
              </td>
            </tr>
          </table>

          <!-- Datos del Cliente -->
          <div class="box">
            <div class="box-title">Adquirente / Cliente</div>
            <div class="details-grid">
              <div><span>Cliente:</span> ${(window as any).esc(customerObj?.name || 'Consumidor Final')}</div>
              <div><span>NIT/Documento:</span> ${(window as any).esc(customerObj?.doc_number || customerObj?.nit || '—')}</div>
              <div><span>Dirección:</span> ${(window as any).esc(customerObj?.address || '—')}</div>
              <div><span>Ciudad/Depto:</span> ${(window as any).esc(customerCityDeptStr || '—')}</div>
              <div><span>Teléfono:</span> ${(window as any).esc(customerObj?.phone || '—')}</div>
              <div><span>Forma de Pago:</span> ${inv.payment_method === 'CREDITO' ? 'Crédito' : 'Contado'}</div>
            </div>
          </div>

          <!-- Tabla de Artículos -->
          <table class="lines-table">
            <thead>
              <tr>
                <th>Detalle del Artículo / Servicio</th>
                <th style="text-align:right">Cantidad</th>
                <th style="text-align:right">Precio Unitario</th>
                <th style="text-align:right">IVA %</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map(l => {
                const discountPct = l.discount_rate || l.discount_pct || 0;
                return `
                  <tr>
                    <td style="font-weight:600">
                      ${(window as any).esc((l.expand?.product_id?.name || l.description || 'Línea de Venta') + (l.expand?.product_id?.name && l.description ? ' ' + l.description : ''))}
                      ${discountPct > 0 ? `<span style="font-size: 9px; color: #dc2626; font-weight: normal; margin-left: 6px;">(Dto. ${discountPct}%)</span>` : ''}
                    </td>
                    <td style="text-align:right">${(window as any).fmtN(l.qty)}</td>
                    <td style="text-align:right">${(window as any).fmt(l.unit_price)}</td>
                    <td style="text-align:right">${l.iva_rate}%</td>
                    <td style="text-align:right;font-weight:bold;color:#1e3a8a">${(window as any).fmt(l.total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Totales -->
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align:right;font-weight:600">${(window as any).fmt(inv.subtotal || 0)}</td>
            </tr>
            ${inv.discount_amount > 0 ? `
              <tr>
                <td style="color:#dc2626">Descuentos:</td>
                <td style="text-align:right;font-weight:600;color:#dc2626">- ${(window as any).fmt(inv.discount_amount || 0)}</td>
              </tr>
            ` : ''}
            <tr>
              <td>IVA Calculado:</td>
              <td style="text-align:right;font-weight:600">${(window as any).fmt(inv.iva_total || 0)}</td>
            </tr>
            ${inv.ret_total > 0 ? `
              <tr>
                <td style="color:#d97706">Retenciones:</td>
                <td style="text-align:right;font-weight:600;color:#d97706">- ${(window as any).fmt(inv.ret_total || 0)}</td>
              </tr>
            ` : ''}
            <tr class="grand-total">
              <td>TOTAL NETO:</td>
              <td style="text-align:right">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</td>
            </tr>
          </table>

          <!-- Footer / Notas legales -->
          <div class="footer">
            ${inv.notes ? `<p><strong>Observaciones:</strong> ${(window as any).esc(inv.notes)}</p>` : ''}
            <p style="margin: 4px 0; font-weight: bold; color: #475569;">${resolutionStr}</p>
            <p>Esta factura de venta se asimila en sus efectos a una Letra de Cambio según el Artículo 779 del Código de Comercio colombiano.</p>
            <p>Software de Gestión GRAVY v2.0 — Sistema de ERP y Control Administrativo Autorizado. Soporte Técnico: soporte@gravy.com</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
    } else {
      // DEFAULT: carta_standard (Basado en el modelo Factura1.pdf)
      const qrData = `Num: ${inv.number} | Nit: ${compNit} | Cliente: ${inv.expand?.customer_id?.doc_number || ''} | Total: ${totalNetoVal} | CUFE: ${cufeVal}`;
      const watermarkHtml = logoBase64 
        ? `<img src="data:image/png;base64,${logoBase64}" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); opacity:0.04; width:380px; height:auto; pointer-events:none; z-index:-10;" />`
        : '';

      htmlContent = `
        <html>
        <head>
          <title>${(window as any).esc(docTitle)} — ${inv.number}</title>
          <style>
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              color: #000;
              margin: 15px;
              font-size: 10px;
              line-height: 1.35;
            }
            .lines-table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            .lines-table th {
              border-top: 2px double #000;
              border-bottom: 1.5px solid #000;
              padding: 5px;
              font-size: 9px;
              font-weight: bold;
              text-align: left;
              text-transform: uppercase;
            }
            .lines-table td {
              padding: 5px;
              font-size: 9px;
              border-bottom: 1px solid #f1f5f9;
            }
            .lines-table tr:last-child td {
              border-bottom: 1.5px solid #000;
            }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${watermarkHtml}
          
          <!-- Encabezado Principal -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:12px; border-bottom:1.5px solid #000; padding-bottom:8px;">
            <tr>
              <!-- Logo de la Empresa -->
              <td style="width:25%; vertical-align:middle; text-align:left;">
                ${logoBase64 
                  ? `<img src="data:image/png;base64,${logoBase64}" style="max-height:65px; max-width:180px; object-fit:contain;" />` 
                  : `<div style="font-weight:900; font-size:24px; color:#1e3a8a; font-family:sans-serif; letter-spacing:-1px;">${(window as any).esc(compName.substring(0, 3))}</div>`
                }
              </td>
              <!-- Detalles de la Empresa (Centrado) -->
              <td style="width:50%; text-align:center; vertical-align:top; line-height:1.4;">
                <div style="font-size:14px; font-weight:bold; text-transform:uppercase; color:#000; letter-spacing:-0.2px;">${(window as any).esc(compName)}</div>
                <div style="font-size:10px; font-weight:bold;">NIT. ${(window as any).esc(compNit)} — Responsable de IVA</div>
                <div style="font-size:9.5px; color:#333;">
                  ${compAddress ? `Dirección: ${(window as any).esc(compAddress)}` : ''} 
                  ${compCityDeptStr ? ` | Ciudad/Depto: ${(window as any).esc(compCityDeptStr)}` : ''}<br>
                  ${compPhone ? `Tel: ${(window as any).esc(compPhone)}` : ''}
                  ${compEmail ? ` | E-mail: ${(window as any).esc(compEmail)}` : ''}
                </div>
              </td>
              <!-- Código QR -->
              <td style="width:25%; vertical-align:middle; text-align:right;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}" style="width:80px; height:80px; object-fit:contain; border:1px solid #e2e8f0; padding:2px; border-radius:4px;" />
              </td>
            </tr>
          </table>

          <!-- Bloque de Datos de Cliente y de Factura -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
            <tr>
              <!-- Cliente -->
              <td style="width:58%; border:1px solid #000; border-radius:4px; padding:6px; vertical-align:top; line-height:1.4; font-size:9.5px;">
                <div style="border-bottom:1px solid #000; font-weight:bold; margin-bottom:4px; text-transform:uppercase; font-size:9.5px; padding-bottom:1px; color:#111;">Cliente / Adquirente</div>
                <strong>Cliente:</strong> ${(window as any).esc(customerObj?.name || 'Consumidor Final')}<br>
                <strong>NIT / Id:</strong> ${(window as any).esc(customerObj?.doc_number || customerObj?.nit || '—')}<br>
                <strong>Dirección:</strong> ${(window as any).esc(customerObj?.address || '—')}<br>
                <strong>Ciudad / Depto:</strong> ${(window as any).esc(customerCityDeptStr || '—')}<br>
                <strong>Teléfono:</strong> ${(window as any).esc(customerObj?.phone || '—')}<br>
                <strong>E-mail:</strong> ${(window as any).esc(customerObj?.email || '—')}<br>
                <strong>Condición:</strong> ${inv.payment_method === 'CREDITO' ? 'Crédito' : 'Contado'}
              </td>
              <!-- Espacio intermedio -->
              <td style="width:2%;"></td>
              <!-- Factura Metadatos -->
              <td style="width:40%; border:1px solid #000; border-radius:4px; padding:6px; vertical-align:top; line-height:1.4; font-size:9.5px;">
                <div style="color:#DC2626; font-size:10.5px; font-weight:bold; text-align:center; margin-bottom:4px; text-transform:uppercase; border-bottom:1px dashed #DC2626; padding-bottom:2px;">${(window as any).esc(docTitle)}</div>
                <div style="font-size:12.5px; font-weight:bold; text-align:center; margin-bottom:6px; font-family:monospace; color:#000;">${inv.number}</div>
                <strong>Fecha Emisión:</strong> ${(window as any).fmtDate(inv.date)}<br>
                <strong>Fecha Vencimiento:</strong> ${(window as any).fmtDate(dueDateStr)}<br>
                <strong>Orden de Compra:</strong> ${(window as any).esc(poNumberStr)}<br>
                <strong>N.º Pedido:</strong> ${(window as any).esc(orderNumberStr)}<br>
                <strong>N.º Remisión:</strong> ${(window as any).esc(remisionNumberStr)}<br>
                <strong>Vendedor:</strong> ${(window as any).esc(sellerNameStr)}
                ${(docType === 'NC' || docType === 'ND') ? `<br><strong>Doc. Referenciado:</strong> ${(window as any).esc(crossDocRefStr)}` : ''}
              </td>
            </tr>
          </table>

          <!-- Tabla de Artículos -->
          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%; text-align:center;">Ite</th>
                <th style="width:12%;">Código</th>
                <th style="width:40%;">Descripción del Producto / Servicio</th>
                <th style="width:10%;">Referencia</th>
                <th style="width:6%; text-align:center;">UM</th>
                <th style="width:6%; text-align:right;">Cant.</th>
                <th style="width:10%; text-align:right;">Precio</th>
                <th style="width:6%; text-align:right;">Dto %</th>
                <th style="width:6%; text-align:right;">Imp %</th>
                <th style="width:10%; text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l, index) => {
                const iteNum = String(index + 1).padStart(3, '0');
                const prodCode = l.expand?.product_id?.code || 'S/C';
                const baseName = l.expand?.product_id?.name || l.description || 'Línea de Venta';
                const prodName = baseName + (l.expand?.product_id?.name && l.description && l.expand.product_id.name !== l.description ? ' - ' + l.description : '');
                const prodRef = l.expand?.product_id?.presentacion || '—';
                const prodUnit = l.expand?.product_id?.unit || 'UND';
                return `
                  <tr>
                    <td style="text-align:center; font-family:monospace;">${iteNum}</td>
                    <td style="font-family:monospace;">${(window as any).esc(prodCode)}</td>
                    <td style="font-weight:600;">${(window as any).esc(prodName)}</td>
                    <td>${(window as any).esc(prodRef)}</td>
                    <td style="text-align:center;">${(window as any).esc(prodUnit)}</td>
                    <td style="text-align:right;">${(window as any).fmtN(l.qty)}</td>
                    <td style="text-align:right;">${(window as any).fmt(l.unit_price)}</td>
                    <td style="text-align:right;">${l.discount_rate ? l.discount_rate + '%' : '0%'}</td>
                    <td style="text-align:right;">${l.iva_rate}%</td>
                    <td style="text-align:right; font-weight:700; color:#000;">${(window as any).fmt(l.total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Cuadro de Totales Multisección -->
          <table style="width:100%; border-collapse:collapse; border:1px solid #000; font-size:9.5px; margin-bottom:12px;">
            <tr>
              <!-- Subtotal y Descuentos -->
              <td style="width:18%; border:1px solid #000; padding:6px; vertical-align:top; line-height:1.4;">
                <div style="font-weight:bold; color:#333; margin-bottom:2px; text-transform:uppercase;">SUB TOTAL</div>
                <div style="font-size:11px; font-weight:bold; color:#000;">$ ${(window as any).fmtN(inv.subtotal || 0)}</div>
                
                <div style="font-weight:bold; color:#333; margin-top:10px; margin-bottom:2px; text-transform:uppercase;">DESCUENTOS</div>
                <div style="font-size:11px; font-weight:bold; color:#000;">$ ${inv.discount_amount ? (window as any).fmtN(inv.discount_amount) : '-'}</div>
              </td>
              
              <!-- Desglose de Tarifas IVA -->
              <td style="width:25%; border:1px solid #000; padding:6px; vertical-align:top;">
                <div style="font-weight:bold; color:#333; margin-bottom:5px; text-transform:uppercase; display:flex; justify-content:space-between; border-bottom:1.5px solid #000; padding-bottom:1px;">
                  <span>Tarifa</span>
                  <span>BASE</span>
                  <span>Vr. IMPUESTO</span>
                </div>
                ${ivaRowsHtml}
              </td>

              <!-- Retenciones -->
              <td style="width:22%; border:1px solid #000; padding:6px; vertical-align:top;">
                <div style="font-weight:bold; color:#c2410c; margin-bottom:5px; text-transform:uppercase; border-bottom:1.5px solid #c2410c; padding-bottom:1px;">TOTAL RETENCIONES</div>
                ${retRowsHtml}
              </td>

              <!-- Flete / Seguro -->
              <td style="width:15%; border:1px solid #000; padding:6px; vertical-align:top; line-height:1.4;">
                <div style="font-weight:bold; color:#333; margin-bottom:2px; text-transform:uppercase;">FLETE</div>
                <div style="font-size:10px; font-weight:bold; color:#000; margin-bottom:8px;">$ -</div>
                <div style="font-weight:bold; color:#333; margin-bottom:2px; text-transform:uppercase;">SEGURO</div>
                <div style="font-size:10px; font-weight:bold; color:#000;">$ -</div>
              </td>

              <!-- Total Neto / Factura -->
              <td style="width:20%; border:1px solid #000; padding:6px; vertical-align:top; background:#f8fafc; text-align:right; line-height:1.4;">
                <div style="font-weight:bold; color:#1e3a8a; text-transform:uppercase; text-align:left; margin-bottom:2px; font-size:9.5px;">TOTAL FACTURA</div>
                <div style="font-size:14.5px; font-weight:900; color:#1e3a8a; margin-bottom:8px;">$ ${(window as any).fmtN(totalNetoVal)}</div>
                <div style="font-size:8px; text-align:left; color:#475569; border-top:1px solid #e2e8f0; padding-top:4px; line-height:1.35;">
                  <strong>MONEDA:</strong> COP<br>
                  <strong>UNDS:</strong> ${totalUnits}<br>
                  <strong>ITEMS:</strong> ${lines.length}
                </div>
              </td>
            </tr>
          </table>

          <!-- Sección de Notas Legales, Resolución DIAN y Firmas -->
          <div style="font-size:9.5px; line-height:1.4; color:#111;">
            <div style="margin-bottom:8px;">
              <strong>Notas:</strong>
              <div style="font-weight:bold; background:#f8fafc; padding:5px; border:1px solid #cbd5e1; border-radius:4px; margin-top:2px;">
                ${totalEnLetras}
              </div>
            </div>

            <p style="margin:4px 0; text-align:justify; font-size:9px; color:#333;">
              Esta factura es un título valor según el Artículo 774 del Código de Comercio colombiano. Factura de venta generada por Software ERP GRAVY v2.0. Autoriza ${compName} / NIT.${compNit}. Proveedor Tecnológico CADENA S.A. / NIT.890.930.534-0. Para transferencias por favor hacer su pago en la cuenta bancaria de ahorros autorizada de ${compName}.
            </p>

            <p style="margin:4px 0; font-size:8.5px; color:#475569; font-weight:semibold;">
              ${resolutionStr}
            </p>

            <div style="margin-top:8px; border-top:1px solid #000; padding-top:5px; font-size:8.5px;">
              <strong>CUFE:</strong> <span style="font-family:monospace; word-break:break-all; font-weight:bold; color:#333;">${cufeVal}</span>
            </div>

            <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:flex-end; font-size:8px; color:#64748b;">
              <span>ORIGINAL</span>
              <span>Pag 1 de 1</span>
            </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
    }

    docStr.write(htmlContent);
    docStr.close();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al imprimir factura', 'error');
  }
};

// --- Dialogo de Razón / Anulación Común ---
window.openSalesReasonDialog = function(opts: any, onConfirm: (reason: string) => Promise<void>) {
  (window as any).openModal(
    opts.title,
    `
      <div class="space-y-4 text-sm" style="color:#374151">
        <div>${opts.messageHtml}</div>
        <div>
          <label class="form-label font-bold text-gray-700">Motivo <span style="color:#EF4444">*</span></label>
          <textarea id="sales-action-reason" class="form-input w-full" rows="4" placeholder="${(window as any).esc(opts.placeholder)}"></textarea>
          <p class="text-xs text-gray-500 mt-1">Este motivo quedará registrado en los logs de auditoría contable.</p>
        </div>
      </div>
    `,
    `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn ${opts.actionClass}" id="sales-action-confirm-btn">${opts.actionLabel}</button>
    `
  );

  setTimeout(() => {
    const text = document.getElementById('sales-action-reason') as HTMLTextAreaElement;
    const btn = document.getElementById('sales-action-confirm-btn') as HTMLButtonElement;
    text?.focus();

    btn?.addEventListener('click', async () => {
      const reason = text?.value.trim() || '';
      if (reason.length < 8) {
        (window as any).showToast('Ingresa un motivo descriptivo de al menos 8 caracteres', 'warning');
        return;
      }
      try {
        btn.disabled = true;
        btn.textContent = 'Procesando...';
        await onConfirm(reason);
        (window as any).closeModal();
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error', 'error');
        btn.disabled = false;
        btn.textContent = opts.actionLabel;
      }
    });
  }, 50);
};

// --- Detalle Completo de Factura ---
window.viewSalesInvoiceDetail = async function(id: string) {
  try {
    const [inv, lines, history, soConfig] = await Promise.all([
      (window as any).pb.get('invoices', id, { expand: 'customer_id,warehouse_id,tx_type_id' }),
      (window as any).API.getInvoiceLines(id),
      (window as any).pb.listAll('audit_log', { filter: `entity="Invoice" && entity_id="${(window as any).pb.escapeFilterValue(id)}"`, sort: '-event_at' }).catch(() => []),
      getSalesConfig(),
    ]);

    const meta = INV_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
    const client = inv.expand?.customer_id;
    const wh = inv.expand?.warehouse_id;

    // Extraer manifiestos de importación asociados a los productos
    const productsWithManifests = lines
      .map((l: any) => l.expand?.product_id)
      .filter((p: any) => p && p.manifest_pdf);

    const uniqueProducts = Array.from(new Map(productsWithManifests.map((p: any) => [p.id, p])).values());

    let manifestsHtml = '';
    if (uniqueProducts.length > 0) {
      manifestsHtml = `
        <div class="p-3.5 rounded-xl border flex flex-col gap-2" style="border-color:#FCA5A5; background:#FFF5F5">
          <span class="text-xs font-extrabold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fas fa-file-pdf text-red-600 text-sm"></i> Manifiestos de Importación Asociados (${uniqueProducts.length})
          </span>
          <div class="flex flex-wrap gap-2 mt-1">
            ${uniqueProducts.map((p: any) => {
              const url = `${(window as any).PB_URL}/api/files/products/${p.id}/${p.manifest_pdf}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}`;
              return `
                <a href="${url}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold bg-white text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm">
                  <i class="fas fa-external-link-alt text-[10px]"></i> [${(window as any).esc(p.code)}] ${(window as any).esc(p.name)}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Comprobante Diario
    let txLines: any[] = [];
    if (inv.tx_id) {
      txLines = await (window as any).API.getTxLines(inv.tx_id).catch(() => []);
    }

    const auditHtml = history.length ? `
      <div class="mt-5 rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <h4 class="font-bold text-gray-800 mb-2"><i class="fas fa-clock-rotate-left mr-2"></i>Historial de Auditoría</h4>
        <div class="space-y-2">
          ${history.map((h: any) => `
            <div class="rounded-lg border px-3 py-2 text-xs" style="border-color:#E5E7EB;background:#fff">
              <div class="flex justify-between font-semibold text-blue-700"><span>${h.action}</span><span>${(h.created || h.event_at || '').slice(0, 19).replace('T', ' ')}</span></div>
              <p class="text-gray-700 mt-1">${h.description}</p>
            </div>
          `).join('')}
        </div>
      </div>` : '';

    const bodyHtml = `
      <div class="space-y-6 text-sm" style="color:#374151">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl" style="background:#F9FAFB">
          <div><span class="text-xs text-gray-500 block">Número</span><p class="font-mono font-bold text-blue-700">${(window as any).esc(inv.number)}</p></div>
          <div><span class="text-xs text-gray-500 block">Estado</span><p><span class="badge ${meta.badge}">${meta.label}</span></p></div>
          <div><span class="text-xs text-gray-500 block">Fecha</span><p>${(window as any).esc(inv.date)}</p></div>
          <div><span class="text-xs text-gray-500 block">Cliente</span><p class="font-semibold">${client ? (window as any).esc(client.name) : '—'}</p></div>
          <div><span class="text-xs text-gray-500 block">Forma Pago</span><p>${(window as any).esc(inv.payment_method)}</p></div>
          <div><span class="text-xs text-gray-500 block">Bodega Origen</span><p>${wh ? (window as any).esc(wh.name) : '—'}</p></div>
          ${inv.due_date ? `<div><span class="text-xs text-gray-500 block">Vencimiento</span><p>${inv.due_date}</p></div>` : ''}
          ${inv.notes ? `<div class="md:col-span-3"><span class="text-xs text-gray-500 block">Notas</span><p class="text-gray-600 italic">${(window as any).esc(inv.notes)}</p></div>` : ''}
        </div>

        ${manifestsHtml}

        <div class="border rounded-xl overflow-hidden mb-4" style="border-color:#F0F0F0">
          <table class="data-table">
            <thead>
              <tr>
                <th style="color:#000">Producto / Servicio</th>
                <th class="text-right" style="color:#000">Cant.</th>
                <th class="text-right" style="color:#000">P. Unit.</th>
                <th class="text-right" style="color:#000">IVA %</th>
                <th class="text-right" style="color:#000">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l: any) => `
                <tr>
                  <td><span class="font-mono text-xs text-blue-500 mr-1">[${(window as any).esc(l.expand?.product_id?.code || 'S/C')}]</span> ${(window as any).esc((l.expand?.product_id?.name || l.description || 'Línea de Venta') + (l.expand?.product_id?.name && l.description ? ' ' + l.description : ''))}</td>
                  <td class="text-right">${(window as any).fmtN(l.qty)}</td>
                  <td class="text-right">${(window as any).fmt(l.unit_price)}</td>
                  <td class="text-right">${l.iva_rate}%</td>
                  <td class="text-right font-bold text-gray-800">${(window as any).fmt(l.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex justify-end p-4 rounded-xl" style="background:#F9FAFB">
          <div class="text-sm space-y-1 min-w-64">
            <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span><span class="font-semibold">${(window as any).fmt(inv.subtotal || 0)}</span></div>
            <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>     <span class="font-semibold">${(window as any).fmt(inv.iva_total || 0)}</span></div>
            <div class="flex justify-between gap-8"><span style="color:#6B7280">Retenciones a favor:</span><span class="font-semibold text-orange-600">- ${(window as any).fmt(inv.ret_total || 0)}</span></div>
            <div class="flex justify-between gap-8 border-t pt-2 text-base" style="border-color:#E5E7EB"><span class="font-bold text-gray-800">TOTAL NETO (CxC):</span><span class="font-bold text-blue-700">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</span></div>
          </div>
        </div>

        <!-- Asiento Diario -->
        ${txLines.length ? `
          <div class="border rounded-xl p-4 space-y-3" style="border-color:#E5E7EB;background:#FCFCFD">
            <h4 class="font-bold text-gray-800 border-b pb-1.5"><i class="fas fa-book-open mr-2 text-purple-600"></i>Asiento Diario Contable [${(window as any).esc(inv.tx_number || 'FV')}]</h4>
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th style="color:#000">Cuenta</th>
                  <th style="color:#000">Tercero</th>
                  <th style="color:#000">Descripción</th>
                  <th class="text-right" style="color:#000">Débito</th>
                  <th class="text-right" style="color:#000">Crédito</th>
                </tr>
              </thead>
              <tbody>
                ${txLines.map(tl => `
                  <tr>
                    <td class="font-semibold">${(window as any).esc(tl.expand?.account_id?.code)} - ${(window as any).esc(tl.expand?.account_id?.name)}</td>
                    <td>${(window as any).esc(tl.expand?.third_party_id?.name || 'S/T')}</td>
                    <td class="text-gray-500">${(window as any).esc(tl.description)}</td>
                    <td class="text-right font-bold text-emerald-700">${tl.debit > 0 ? (window as any).fmt(tl.debit) : '—'}</td>
                    <td class="text-right font-bold text-rose-700">${tl.credit > 0 ? (window as any).fmt(tl.credit) : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${auditHtml}
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary" onclick="window.printInvoiceCarta('${inv.id}')"><i class="fas fa-print"></i> Imprimir Carta</button>
      <button class="btn btn-outline" onclick="window.showThermalTicketReceipt('${inv.id}', 0, 0)"><i class="fas fa-receipt mr-1"></i> Imprimir Tirilla</button>
      <button class="btn btn-outline" style="border-color:#0D9488;color:#0D9488" onclick="closeModal(); window.duplicateSalesInvoice('${inv.id}')"><i class="fas fa-clone mr-1"></i> Duplicar</button>
      ${inv.status === 'draft' ? `
        <button class="btn btn-primary" onclick="closeModal(); window.editSalesInvoice('${inv.id}')"><i class="fas fa-pen"></i> Editar</button>
        ${(soConfig.operational.dian_dependent_posting && inv.is_electronic) ? `
          <button class="btn btn-primary" onclick="closeModal(); window.contabilizarVenta('${inv.id}', '${inv.number}', true)"><i class="fas fa-paper-plane mr-1"></i> Firmar y Contabilizar</button>
        ` : `
          <button class="btn btn-primary" onclick="closeModal(); window.contabilizarVenta('${inv.id}', '${inv.number}', false)"><i class="fas fa-check-double mr-1"></i> Contabilizar</button>
        `}
      ` : ''}
      ${inv.status === 'posted' ? `
        <button class="btn btn-secondary" onclick="window.emitInvoiceToDian('${inv.tx_id}', '${inv.number}')"><i class="fas fa-paper-plane mr-1"></i> Emitir a DIAN</button>
        ${(window as any).can('canWrite') ? `
          <button class="btn btn-outline" style="border-color:#10B981;color:#10B981" onclick="window.openChangePaymentMethodModal('${inv.id}', '${inv.number}')"><i class="fas fa-credit-card mr-1"></i> Cambiar Pago</button>
        ` : ''}
        <button class="btn btn-danger" onclick="closeModal(); window.voidSalesInvoiceDirect('${inv.id}', '${inv.number}')"><i class="fas fa-ban"></i> Anular Factura</button>
      ` : ''}
    `;

    (window as any).openModal(`Detalle de Factura Comercial`, bodyHtml, footer, true);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al cargar detalle', 'error');
  }
};

window.emitInvoiceToDian = async function(txId: string, docNumber: string) {
  if (!txId) {
    (window as any).showToast('Esta factura no tiene una transacción contable asociada para emitir a la DIAN', 'warning');
    return;
  }
  
  (window as any).confirmDialog(
    'Emitir a la DIAN',
    `¿Deseas firmar digitalmente y emitir la factura <strong>${docNumber}</strong> a la DIAN?<br><br>Esta acción enviará la información de la transacción y generará el XML UBL 2.1 firmado.`,
    async () => {
      try {
        (window as any).showToast('Generando y firmando XML UBL 2.1...', 'info');
        const res = await (window as any).pb.send('/api/dian/emit', {
          method: 'POST',
          body: JSON.stringify({ txId: txId }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (res && res.success) {
          (window as any).showToast(`Factura ${docNumber} emitida correctamente. Estado: ${res.status}. ${res.simulated ? '(MODO SIMULADO)' : ''}`, 'success');
          (window as any).closeModal();
          const content = document.getElementById('page-content');
          if (content) {
            (window as any).renderVentas(content);
          }
        } else {
          (window as any).showToast(`Error al emitir factura: ${res.dianResponse || 'Respuesta desconocida'}`, 'error');
        }
      } catch (err: any) {
        const errMsg = err.response?.message || err.message || 'Error al emitir a la DIAN';
        (window as any).showToast(errMsg, 'error');
      }
    }
  );
};

window.editSalesInvoice = async function(id: string) {
  try {
    await openSalesForm(id, () => renderVentas(document.getElementById('page-content')!));
  } catch (err: any) {
    console.error("Error abriendo borrador para edición:", err);
    (window as any).showToast?.("Error al cargar la factura en borrador: " + (err.message || err), "error");
  }
};

window.duplicateSalesInvoice = async function(id: string) {
  try {
    (window as any).showToast?.('Preparando duplicado...', 'info');

    // 1. Obtener la factura original y sus líneas
    const [originalInv, originalLines] = await Promise.all([
      (window as any).pb.get('invoices', id),
      (window as any).API.getInvoiceLines(id),
    ]);

    // 2. Cargar la configuración de ventas para obtener el plazo de vencimiento por defecto
    const soConfig = await getSalesConfig();

    // 3. Generar el nuevo consecutivo (número temporal) en estado borrador
    const today = (window as any).todayStr();
    const todayStr = today.replaceAll('-', '');
    const rand = String(Date.now()).slice(-4);
    let draftPrefix = 'FV';
    
    // Intentar obtener el prefijo del tipo de comprobante seleccionado
    if (originalInv.tx_type_id) {
      try {
        const tObj = await (window as any).pb.get('transaction_types', originalInv.tx_type_id);
        if (tObj && tObj.prefix) {
          draftPrefix = tObj.prefix;
        }
      } catch (_) {}
    }
    const newNumber = '';

    // 4. Calcular nueva fecha de vencimiento
    const defaultDueDays = soConfig?.operational?.default_due_days || 0;
    const newDueDate = (window as any).addDaysToDateStr(today, defaultDueDays);

    // 5. Resolver sucursal activa o por defecto del usuario
    const activeBranchId = localStorage.getItem('active_branch_id');
    const currentUser = (window as any).pb.currentUser;
    const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS')
      ? activeBranchId
      : (currentUser?.default_branch_id || null);

    // 6. Crear cabecera limpia para el duplicado en borrador
    const header = {
      number: newNumber,
      customer_id: originalInv.customer_id,
      warehouse_id: originalInv.warehouse_id || null,
      seller_id: originalInv.seller_id || null,
      commission_rate: originalInv.commission_rate || 0,
      commission_amount: originalInv.commission_amount || 0,
      date: today,
      due_date: newDueDate,
      notes: `Duplicado de factura ${originalInv.number}. ${originalInv.notes || ''}`.trim(),
      payment_method: originalInv.payment_method || 'EFECTIVO',
      payment_form: originalInv.payment_form || 'CONTADO',
      payment_dian_code: originalInv.payment_dian_code || '1',
      bank_account_id: originalInv.bank_account_id || null,
      po_number: originalInv.po_number || '',
      remision_number: originalInv.remision_number || '',
      payment_split: originalInv.payment_split || null,
      discount_amount: originalInv.discount_amount || 0,
      subtotal: originalInv.subtotal || 0,
      iva_total: originalInv.iva_total || 0,
      ret_total: originalInv.ret_total || 0,
      total: originalInv.total || 0,
      payable_total: originalInv.payable_total || 0,
      ret_rule_renta_id: originalInv.ret_rule_renta_id || null,
      ret_rule_ica_id: originalInv.ret_rule_ica_id || null,
      ret_rule_iva_id: originalInv.ret_rule_iva_id || null,
      tx_type_id: originalInv.tx_type_id || null,
      dian_resolution_id: originalInv.dian_resolution_id || null,
      sales_order_id: null,
      cross_doc_ref: null,
      branch_id: targetBranchId || originalInv.branch_id || null,
      has_pending_delivery: originalInv.has_pending_delivery || false,
      delivery_fulfillment_status: originalInv.has_pending_delivery ? 'PENDIENTE' : 'NO_REQUIERE',
      status: 'draft',
      is_electronic: originalInv.is_electronic !== false,
    };

    // 7. Preparar las líneas de la factura
    const lines = originalLines.map((l: any) => ({
      product_id: l.product_id,
      qty: l.qty,
      unit_price: l.unit_price,
      iva_rate: l.iva_rate,
      iva_amount: l.iva_amount,
      subtotal: l.subtotal,
      total: l.total,
      discount_rate: l.discount_rate || 0,
      discount_amount: l.discount_amount || 0,
      notes: l.notes || '',
      cost_price: l.cost_price || 0,
    }));

    // 8. Crear la nueva factura en borrador
    const newInv = await (window as any).API.createInvoice(header, lines);

    (window as any).showToast?.(`Factura duplicada con éxito bajo el consecutivo ${newNumber}`, 'success');

    // 9. Abrir de inmediato el formulario de edición
    await openSalesForm(newInv.id, () => renderVentas(document.getElementById('page-content')!));

  } catch (err: any) {
    console.error("Error al duplicar factura:", err);
    (window as any).showToast?.("Error al duplicar la factura: " + (err.message || err), "error");
  }
};

window.contabilizarVenta = function(id: string, number: string, isElectronic: boolean = false) {
  const title = isElectronic ? 'Firmar y Contabilizar Factura' : 'Contabilizar Factura de Venta';
  const body = isElectronic
    ? `¿Confirmas la firma y contabilización de la factura de venta <strong>${number}</strong>?<br><br>
       Esta operación:<br>
       • Contabilizará localmente el asiento de diario y afectará Kardex<br>
       • Firmará y enviará inmediatamente el documento XML UBL 2.1 ante la DIAN.`
    : `¿Confirmas la contabilización en caliente de la factura de venta <strong>${number}</strong>?<br><br>
       Esta operación:<br>
       • Reducirá las existencias en bodega físicas vía Kardex (Movimiento SALIDA)<br>
       • Publicará el asiento contable diario de cobro e IVA generado<br>
       • Registrará automáticamente el Costo de Ventas (COGS) a costo promedio en el diario contable`;

  (window as any).confirmDialog(
    title,
    body,
    async () => {
      try {
        const isDianDep = !!(window as any).__soConfig?.operational?.dian_dependent_posting;
        if (isElectronic && isDianDep) {
          await (window as any).API.validateInvoiceForDianEmit(id);
        }
        await (window as any).API.postInvoice(id);
        if (isElectronic) {
          try {
            (window as any).showToast('Generando y firmando XML UBL 2.1...', 'info');
            const updatedInv = await (window as any).pb.get('invoices', id);
            const res = await (window as any).pb.send('/api/dian/emit', {
              method: 'POST',
              body: JSON.stringify({ txId: updatedInv.tx_id }),
              headers: { 'Content-Type': 'application/json' }
            });
            if (res && res.success) {
              (window as any).showToast(`Factura ${number} firmada en DIAN, aprobada y contabilizada correctamente`, 'success');
            } else {
              if (isDianDep) {
                await (window as any).API.rollbackInvoicePosting(id, 'revertir_borrador', `Emisión rechazada: ${res?.dianResponse || 'Error'}`).catch(() => {});
                await (window as any).pb.update('invoices', id, { status: 'draft', tx_id: '', inv_movement_id: '' });
                (window as any).showToast(`Emisión DIAN rechazada. La contabilización e inventario fueron cancelados y el documento permaneció en borrador: ${res?.dianResponse || 'Error de emisión'}`, 'error');
              } else {
                (window as any).showToast(`Factura contabilizada localmente, pero falló envío DIAN: ${res?.dianResponse || 'Error de emisión'}`, 'warning');
              }
            }
          } catch (dianErr: any) {
            if (isDianDep) {
              await (window as any).API.rollbackInvoicePosting(id, 'revertir_borrador', `Error DIAN: ${dianErr.message}`).catch(() => {});
              await (window as any).pb.update('invoices', id, { status: 'draft', tx_id: '', inv_movement_id: '' });
              (window as any).showToast(`Error al emitir a la DIAN. La contabilización e inventario fueron cancelados y el documento permaneció en borrador: ${dianErr.message}`, 'error');
            } else {
              (window as any).showToast(`Factura contabilizada localmente, pero falló envío DIAN: ${dianErr.message}`, 'warning');
            }
          }
        } else {
          (window as any).showToast(`Factura ${number} contabilizada exitosamente con Kardex y COGS`, 'success');
        }
        renderVentas(document.getElementById('page-content')!);
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error al contabilizar', 'error');
      }
    }
  );
};

window.deleteSalesInvoiceDraft = function(id: string, number: string) {
  (window as any).confirmDialog(
    'Eliminar Borrador de Factura',
    `¿Estás seguro de eliminar el borrador de factura comercial <strong>${number}</strong>? Esta acción es definitiva.`,
    async () => {
      try {
        await (window as any).API.deleteInvoiceDraft(id);
        (window as any).showToast('Factura borrador y componentes asociados eliminados', 'success');
        renderVentas(document.getElementById('page-content')!);
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error al eliminar borrador', 'error');
      }
    }
  );
};

window.voidSalesInvoiceDirect = function(id: string, number: string) {
  (window as any).openSalesReasonDialog(
    {
      title: 'Anular Factura de Venta',
      messageHtml: `<p>Se anulará definitivamente la factura de venta contabilizada <strong>${(window as any).esc(number)}</strong>.</p>
                    <p class="mt-2">• Se anulará el asiento contable vinculado</p>
                    <p>• Se revertirá el movimiento Kardex reingresando los productos a bodega</p>`,
      actionLabel: 'Anular Factura',
      actionClass: 'btn-danger',
      placeholder: 'Escribe el motivo legal de anulación de la factura...',
    },
    async (reason: string) => {
      await (window as any).API.voidInvoice(id, reason);
      (window as any).showToast(`Factura de venta ${number} anulada. Contabilidad e inventario revertidos.`, 'success');
      renderVentas(document.getElementById('page-content')!);
    }
  );
};

window.seeSalesTxDetail = function(txId: string) {
  if (typeof (window as any).seeTxDetail === 'function') {
    (window as any).seeTxDetail(txId);
  } else {
    (window as any).showToast('Modulo de transacciones contables no disponible', 'warning');
  }
};

(window as any).openChangePaymentMethodModal = async function(id: string, number: string) {
  let inv: any;
  let bankAccounts: any[] = [];
  try {
    inv = await (window as any).pb.get('invoices', id);
    bankAccounts = await (window as any).pb.listAll('bank_accounts', { filter: 'active=true', sort: 'name' }).catch(() => []);
  } catch (err) {
    return (window as any).showToast('No se pudo cargar la factura o las cuentas bancarias', 'error');
  }

  // Verificar si ya fue emitida a la DIAN
  let einv = null;
  if (inv.tx_id) {
    try {
      einv = await (window as any).pb.list('einvoice_docs', {
        filter: `tx_id="${(window as any).pb.escapeFilterValue(inv.tx_id)}" && (status="enviada" || status="aceptada")`,
        perPage: 1
      });
    } catch (_) {}
  }
  const isDianSent = einv && einv.items.length > 0;

  const total = inv.payable_total ?? inv.total ?? 0;

  let split = { EFECTIVO: 0, TRANSFERENCIA: 0, CREDITO: 0 };
  if (inv.payment_method === 'MIXTO' && inv.payment_split) {
    try {
      split = typeof inv.payment_split === 'string' ? JSON.parse(inv.payment_split) : inv.payment_split;
    } catch (_) {}
  }

  const dianWarningHtml = isDianSent ? `
    <div class="p-3 rounded bg-amber-50 text-amber-800 text-xs border border-amber-200 mb-4">
      <i class="fas fa-exclamation-triangle mr-1"></i> <strong>Advertencia Fiscal:</strong> Esta factura ya fue emitida y aceptada por la DIAN. Cambiar la forma de pago corregirá el recaudo interno, los cierres de caja y el asiento contable local, pero el XML oficial de la DIAN mantendrá la forma de pago original.
    </div>
  ` : '';

  const html = `
    <div class="space-y-4 text-sm" style="color:#374151">
      ${dianWarningHtml}
      <div class="p-3 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs">
        Corregir el medio de pago para la factura <strong>${(window as any).esc(number)}</strong>. Total de la venta: <strong>${(window as any).fmt(total)}</strong>.
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Nueva Forma de Pago</label>
        <select id="change-pay-method" class="form-input w-full" onchange="window.toggleChangePayMethodSecs(this.value)">
          <option value="EFECTIVO" ${inv.payment_method === 'EFECTIVO' ? 'selected' : ''}>Efectivo</option>
          <option value="TRANSFERENCIA" ${inv.payment_method === 'TRANSFERENCIA' ? 'selected' : ''}>Transferencia</option>
          <option value="CREDITO" ${inv.payment_method === 'CREDITO' ? 'selected' : ''}>Crédito</option>
          <option value="MIXTO" ${inv.payment_method === 'MIXTO' ? 'selected' : ''}>Mixto</option>
        </select>
      </div>

      <!-- Sección Cuenta Transferencia (visible si método es TRANSFERENCIA) -->
      <div id="change-pay-bank-wrap" class="form-group" style="display:${inv.payment_method === 'TRANSFERENCIA' ? 'block' : 'none'}">
        <label class="form-label font-bold">Cuenta Bancaria Destino <span style="color:#EF4444">*</span></label>
        <select id="change-pay-bank-account" class="form-input w-full">
          <option value="">— Seleccionar Banco —</option>
          ${bankAccounts.map(b => `<option value="${(window as any).esc(b.id)}"${inv?.bank_account_id === b.id ? ' selected' : ''}>${(window as any).esc(b.bank)} — ${(window as any).esc(b.number)}</option>`).join('')}
        </select>
      </div>

      <!-- Sección Pago Mixto -->
      <div id="change-pay-mixed-sec" class="space-y-3 border-t pt-3" style="border-color:#E5E7EB; display:${inv.payment_method === 'MIXTO' ? 'block' : 'none'}">
        <p class="text-xs text-gray-500 font-bold mb-2">Distribuye el total exacto (${(window as any).fmt(total)}):</p>
        <div class="space-y-2">
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-4 font-bold text-emerald-600">Efectivo</div>
            <div class="col-span-8">
              <input type="number" id="change-mixed-efectivo" class="form-input w-full text-right text-xs py-1" min="0" value="${split.EFECTIVO || 0}" oninput="window.changeMixedCalc()">
            </div>
          </div>
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-4 font-bold text-blue-600">Transferencia</div>
            <div class="col-span-8 flex gap-2">
              <input type="number" id="change-mixed-transferencia" class="form-input w-full text-right text-xs py-1 flex-1" min="0" value="${split.TRANSFERENCIA || 0}" oninput="window.changeMixedCalc()">
              <select id="change-mixed-bank-account" class="form-input w-full text-xs py-1 flex-1" style="display:${(split.TRANSFERENCIA || 0) > 0 ? 'block' : 'none'}">
                <option value="">— Banco —</option>
                ${bankAccounts.map(b => `<option value="${(window as any).esc(b.id)}"${inv?.bank_account_id === b.id ? ' selected' : ''}>${(window as any).esc(b.bank)} — ${(window as any).esc(b.number)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-4 font-bold text-orange-600">Crédito</div>
            <div class="col-span-8">
              <input type="number" id="change-mixed-credito" class="form-input w-full text-right text-xs py-1" min="0" value="${split.CREDITO || 0}" oninput="window.changeMixedCalc()">
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center text-xs font-bold pt-2 border-t" style="border-color:#E5E7EB">
          <span>Total asignado:</span>
          <span id="change-mixed-assigned-val" class="text-emerald-600 font-extrabold">$ 0</span>
        </div>
        <div class="flex justify-between items-center text-xs font-bold text-red-500" id="change-mixed-status-row" style="display:none">
          <span>Diferencia:</span>
          <span id="change-mixed-status-val" class="font-extrabold">$ 0</span>
        </div>
      </div>

      <div class="form-group border-t pt-3" style="border-color:#E5E7EB">
        <label class="form-label font-bold text-gray-700">Motivo de la corrección <span style="color:#EF4444">*</span></label>
        <textarea id="change-pay-reason" class="form-input w-full" rows="3" placeholder="Escribe el motivo por el cual corriges la forma de pago (mínimo 8 caracteres)..."></textarea>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="window.closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="change-pay-confirm-btn" onclick="window.confirmChangePaymentMethod('${id}', ${total})"><i class="fas fa-circle-check mr-1"></i> CORREGIR PAGO</button>
  `;

  (window as any).openModal(`Corregir Forma de Pago`, html, footer, false);

  (window as any).toggleChangePayMethodSecs = function(val: string) {
    const mixedSec = document.getElementById('change-pay-mixed-sec');
    if (mixedSec) mixedSec.style.display = val === 'MIXTO' ? 'block' : 'none';

    const bankWrap = document.getElementById('change-pay-bank-wrap');
    if (bankWrap) bankWrap.style.display = val === 'TRANSFERENCIA' ? 'block' : 'none';

    (window as any).changeMixedCalc();
  };

  (window as any).changeMixedCalc = function() {
    const method = (document.getElementById('change-pay-method') as HTMLSelectElement)?.value || 'EFECTIVO';
    const confirmBtn = document.getElementById('change-pay-confirm-btn') as HTMLButtonElement;
    if (method !== 'MIXTO') {
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    const efec = parseFloat((document.getElementById('change-mixed-efectivo') as HTMLInputElement)?.value || '0') || 0;
    const trans = parseFloat((document.getElementById('change-mixed-transferencia') as HTMLInputElement)?.value || '0') || 0;
    const cred = parseFloat((document.getElementById('change-mixed-credito') as HTMLInputElement)?.value || '0') || 0;

    const assigned = efec + trans + cred;
    const diff = total - assigned;

    const assignedLbl = document.getElementById('change-mixed-assigned-val');
    const statusRow = document.getElementById('change-mixed-status-row');
    const statusVal = document.getElementById('change-mixed-status-val');
    const mixedBankSelect = document.getElementById('change-mixed-bank-account') as HTMLElement;

    if (assignedLbl) assignedLbl.textContent = (window as any).fmt(assigned);

    if (mixedBankSelect) {
      mixedBankSelect.style.display = trans > 0 ? 'block' : 'none';
    }

    if (Math.abs(diff) < 0.01) {
      if (assignedLbl) assignedLbl.className = "text-emerald-600 font-extrabold";
      if (statusRow) statusRow.style.display = 'none';
      if (confirmBtn) confirmBtn.disabled = false;
    } else {
      if (assignedLbl) assignedLbl.className = "text-red-500 font-extrabold";
      if (statusRow) {
        statusRow.style.display = 'flex';
        statusRow.firstElementChild!.textContent = diff > 0 ? 'Falta asignar:' : 'Excedente:';
        if (statusVal) {
          statusVal.textContent = (window as any).fmt(Math.abs(diff));
        }
      }
      if (confirmBtn) confirmBtn.disabled = true;
    }
  };

  (window as any).confirmChangePaymentMethod = async function(invoiceId: string, invoiceTotal: number) {
    const confirmBtn = document.getElementById('change-pay-confirm-btn') as HTMLButtonElement;
    const method = (document.getElementById('change-pay-method') as HTMLSelectElement)?.value || 'EFECTIVO';
    const reason = (document.getElementById('change-pay-reason') as HTMLTextAreaElement)?.value.trim() || '';

    if (reason.length < 8) {
      (window as any).showToast('Ingresa un motivo descriptivo de al menos 8 caracteres', 'warning');
      return;
    }

    let newSplit = null;
    let bankAccountId = null;

    if (method === 'TRANSFERENCIA') {
      bankAccountId = (document.getElementById('change-pay-bank-account') as HTMLSelectElement)?.value || null;
      if (!bankAccountId) {
        (window as any).showToast('Selecciona la cuenta bancaria de destino.', 'warning');
        return;
      }
    } else if (method === 'MIXTO') {
      const efec = parseFloat((document.getElementById('change-mixed-efectivo') as HTMLInputElement)?.value || '0') || 0;
      const trans = parseFloat((document.getElementById('change-mixed-transferencia') as HTMLInputElement)?.value || '0') || 0;
      const cred = parseFloat((document.getElementById('change-mixed-credito') as HTMLInputElement)?.value || '0') || 0;
      if (Math.abs(invoiceTotal - (efec + trans + cred)) > 0.01) {
        (window as any).showToast('La asignación de valores no coincide con el total.', 'warning');
        return;
      }
      newSplit = { EFECTIVO: efec, TRANSFERENCIA: trans, CREDITO: cred };
      
      if (trans > 0) {
        bankAccountId = (document.getElementById('change-mixed-bank-account') as HTMLSelectElement)?.value || null;
        if (!bankAccountId) {
          (window as any).showToast('Selecciona la cuenta bancaria para la porción de transferencia.', 'warning');
          return;
        }
      }
    }

    try {
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Procesando cambio...';
      }
      
      await (window as any).API.changeInvoicePaymentMethod(invoiceId, method, newSplit, reason, bankAccountId);
      (window as any).showToast('Forma de pago corregida exitosamente.', 'success');
      (window as any).closeModal();
      
      // Recargar el detalle y refrescar página de ventas
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
        (window as any).renderVentas(pageContent);
      }
    } catch (err: any) {
      (window as any).showToast(err.message || 'Error al cambiar la forma de pago', 'error');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'CORREGIR PAGO';
      }
    }
  };

  // Ejecución inicial de cálculo mixto si aplica
  (window as any).changeMixedCalc();
};

// --- KPI Helper ---
function salesKpi(label: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="rounded-2xl p-4" style="background:${bg}">
      <div class="flex items-center gap-2 mb-1">
        <i class="${icon} text-sm" style="color:${color}"></i>
        <span class="text-xs font-semibold" style="color:${color}">${label}</span>
      </div>
      <p class="text-2xl font-extrabold" style="color:${color}">${value}</p>
    </div>
  `;
}

// --- Consulta de Inventario Activo por Bodegas ---
(window as any).soShowActiveInventoryModal = async function() {
  (window as any).showToast('Cargando inventario activo por bodegas...', 'info');

  try {
    const [products, warehouses, allStock] = await Promise.all([
      (window as any).API.getProducts({ activeOnly: true }),
      (window as any).API.getWarehouses(true),
      (window as any).API.getInventoryStock().catch(() => [])
    ]);

    let overlay = document.getElementById('active-inventory-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'active-inventory-modal-overlay';
      overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(5,8,20,.65);backdrop-filter:blur(5px);z-index:260;align-items:center;justify-content:center;padding:16px';
      document.body.appendChild(overlay);
    }

    const stockMap: Record<string, Record<string, number>> = {};
    const stockTotalMap: Record<string, number> = {};

    (allStock || []).forEach((st: any) => {
      const pId = st.product_id;
      const wId = st.warehouse_id;
      const qty = Number(st.qty_on_hand || 0);
      if (pId) {
        if (!stockMap[pId]) stockMap[pId] = {};
        stockMap[pId][wId] = qty;
        stockTotalMap[pId] = (stockTotalMap[pId] || 0) + qty;
      }
    });

    overlay.innerHTML = `
      <div class="anim-slide-up" style="background:#fff;border-radius:20px;width:100%;max-width:1150px;box-shadow:0 25px 60px rgba(0,0,0,.25);overflow:hidden;display:flex;flex-direction:column;max-height:90vh">
        <div class="flex items-center justify-between px-6 py-4 border-b" style="background:#F8FAFC;border-color:#E2E8F0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-blue-700 font-bold" style="background:#EEF4FF">
              <i class="fas fa-boxes-stacked text-lg"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-gray-800 text-base m-0 flex items-center gap-2">
                Consulta de Inventario Activo por Bodegas
                <span class="badge badge-blue text-[10px] px-2 py-0.5 rounded-full font-extrabold">${products.length} Productos</span>
              </h3>
              <p class="text-xs text-gray-500 m-0">Existencias físicas cruzadas y disponibilidad en tiempo real por cada bodega</p>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('active-inventory-modal-overlay').style.display='none'" class="text-gray-400 hover:text-gray-600 text-2xl border-none bg-transparent cursor-pointer p-1">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <div class="p-4 border-b space-y-3" style="background:#FFFFFF;border-color:#F1F5F9">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="p-3 rounded-xl border flex items-center gap-3" style="background:#F8FAFC;border-color:#E2E8F0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50"><i class="fas fa-box text-sm"></i></div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Prod. Activos</span>
                <span class="text-sm font-extrabold text-gray-800" id="inv-kpi-prods">${products.length}</span>
              </div>
            </div>
            <div class="p-3 rounded-xl border flex items-center gap-3" style="background:#F8FAFC;border-color:#E2E8F0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50"><i class="fas fa-cubes text-sm"></i></div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Unidades Totales</span>
                <span class="text-sm font-extrabold text-emerald-700" id="inv-kpi-units">0</span>
              </div>
            </div>
            <div class="p-3 rounded-xl border flex items-center gap-3" style="background:#F8FAFC;border-color:#E2E8F0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50"><i class="fas fa-vault text-sm"></i></div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Valoración Inv.</span>
                <span class="text-sm font-extrabold text-indigo-700" id="inv-kpi-val">$ 0</span>
              </div>
            </div>
            <div class="p-3 rounded-xl border flex items-center gap-3" style="background:#F8FAFC;border-color:#E2E8F0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 bg-amber-50"><i class="fas fa-warehouse text-sm"></i></div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bodegas Activas</span>
                <span class="text-sm font-extrabold text-gray-800">${warehouses.length}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div class="flex items-center gap-2 flex-1 min-w-[280px]">
              <div class="relative flex-1">
                <i class="fas fa-search" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:12px"></i>
                <input id="inv-modal-search" class="form-input w-full text-xs" style="padding-left:32px;height:34px" placeholder="Buscar por código, referencia o nombre de producto...">
              </div>
              <select id="inv-modal-filter-wh" class="form-input text-xs" style="height:34px;width:160px">
                <option value="ALL">Todas las bodegas</option>
                ${warehouses.map((w: any) => `<option value="${(window as any).esc(w.id)}">${(window as any).esc(w.name)}</option>`).join('')}
              </select>
              <select id="inv-modal-filter-stock" class="form-input text-xs" style="height:34px;width:150px">
                <option value="ALL">Todos los estados</option>
                <option value="WITH_STOCK">Con Stock (> 0)</option>
                <option value="ZERO_STOCK">Sin Stock (= 0)</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="btn-export-active-inv" class="btn btn-outline btn-sm text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5" style="height:34px">
                <i class="fas fa-file-excel"></i> Exportar Excel
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto p-4" style="background:#F8FAFC">
          <div class="border rounded-xl bg-white shadow-xs overflow-hidden" style="border-color:#E2E8F0">
            <table class="w-full text-left text-xs border-collapse" id="active-inv-matrix-table">
              <thead>
                <tr style="background:#F1F5F9;color:#475569;border-bottom:1.5px solid #CBD5E1">
                  <th class="py-2.5 px-3 font-bold">Código</th>
                  <th class="py-2.5 px-3 font-bold">Producto / Referencia</th>
                  <th class="py-2.5 px-3 font-bold">Tipo</th>
                  <th class="py-2.5 px-3 font-bold text-right">P. Venta</th>
                  ${warehouses.map((w: any) => `<th class="py-2.5 px-3 font-bold text-right" style="color:#1E3A8A"><i class="fas fa-warehouse mr-1 text-[10px]"></i>${(window as any).esc(w.name)}</th>`).join('')}
                  <th class="py-2.5 px-3 font-bold text-right" style="background:#E2E8F0;color:#0F172A">Stock Total</th>
                  <th class="py-2.5 px-3 font-bold text-center" style="width:100px">Acción</th>
                </tr>
              </thead>
              <tbody id="active-inv-matrix-tbody">
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-between px-6 py-3 border-t bg-white" style="border-color:#E2E8F0">
          <span class="text-xs text-gray-500 font-medium" id="inv-modal-footer-lbl">Mostrando 0 productos</span>
          <button type="button" onclick="document.getElementById('active-inventory-modal-overlay').style.display='none'" class="btn btn-secondary text-xs px-5 py-2">
            Cerrar
          </button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';

    const searchInput = document.getElementById('inv-modal-search') as HTMLInputElement;
    const whFilterSelect = document.getElementById('inv-modal-filter-wh') as HTMLSelectElement;
    const stockFilterSelect = document.getElementById('inv-modal-filter-stock') as HTMLSelectElement;
    const tbody = document.getElementById('active-inv-matrix-tbody');
    const footerLbl = document.getElementById('inv-modal-footer-lbl');

    const renderMatrix = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const selWh = whFilterSelect?.value || 'ALL';
      const selStock = stockFilterSelect?.value || 'ALL';

      let filtered = products.filter((p: any) => {
        const codeMatch = String(p.code || '').toLowerCase().includes(q);
        const nameMatch = String(p.name || '').toLowerCase().includes(q);
        if (q && !codeMatch && !nameMatch) return false;

        const totStock = stockTotalMap[p.id] || 0;

        if (selStock === 'WITH_STOCK' && totStock <= 0) return false;
        if (selStock === 'ZERO_STOCK' && totStock > 0) return false;

        if (selWh !== 'ALL') {
          const whStock = stockMap[p.id]?.[selWh] || 0;
          if (selStock === 'WITH_STOCK' && whStock <= 0) return false;
          if (selStock === 'ZERO_STOCK' && whStock > 0) return false;
        }

        return true;
      });

      let totalUnitsSum = 0;
      let totalValuationSum = 0;

      filtered.forEach((p: any) => {
        const pTot = stockTotalMap[p.id] || 0;
        totalUnitsSum += pTot;
        const cost = Number(p.cost_price || p.purchase_price || 0);
        totalValuationSum += (pTot > 0 ? pTot * cost : 0);
      });

      const kpiUnitsEl = document.getElementById('inv-kpi-units');
      const kpiValEl = document.getElementById('inv-kpi-val');
      const kpiProdsEl = document.getElementById('inv-kpi-prods');

      if (kpiUnitsEl) kpiUnitsEl.textContent = (window as any).fmtN(totalUnitsSum);
      if (kpiValEl) kpiValEl.textContent = (window as any).fmt(totalValuationSum);
      if (kpiProdsEl) kpiProdsEl.textContent = String(filtered.length);

      if (footerLbl) footerLbl.textContent = `Mostrando ${filtered.length} de ${products.length} productos activos`;

      if (!filtered.length) {
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="${5 + warehouses.length}" class="text-center py-10 text-gray-400"><i class="fas fa-boxes-stacked text-2xl mb-2 block"></i>No se encontraron productos con los filtros seleccionados.</td></tr>`;
        }
        return;
      }

      const salesModalOpen = !!document.getElementById('so-lines-body');

      if (tbody) {
        tbody.innerHTML = filtered.map((p: any) => {
          const isService = String(p.type || '').toUpperCase() === 'SERVICIO' || p.is_service === true;
          const totStock = stockTotalMap[p.id] || 0;
          const totBadgeClass = totStock > 0 ? 'text-emerald-700 bg-emerald-50 font-bold border-emerald-200' : 'text-gray-500 bg-gray-100 font-medium';

          const whCells = warehouses.map((w: any) => {
            const qty = stockMap[p.id]?.[w.id] || 0;
            const cellColor = qty > 0 ? 'color:#059669;font-weight:700' : 'color:#9CA3AF';
            return `<td class="py-2.5 px-3 text-right font-mono text-xs" style="${cellColor}">${isService ? '—' : (window as any).fmtN(qty)}</td>`;
          }).join('');

          const addBtnHtml = salesModalOpen ? `
            <button type="button" class="btn btn-primary btn-sm py-1 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1 w-full"
                    onclick="window.soAddProductFromInventoryModal('${(window as any).esc(p.id)}')">
              <i class="fas fa-plus"></i> Agregar
            </button>
          ` : `<span class="text-gray-400 text-[10px]">—</span>`;

          return `
            <tr class="border-b hover:bg-blue-50/40 transition-colors" style="border-color:#F1F5F9">
              <td class="py-2.5 px-3 font-mono font-bold text-blue-900">${(window as any).esc(p.code || 'S/C')}</td>
              <td class="py-2.5 px-3 font-semibold text-gray-800">${(window as any).esc(p.name)}</td>
              <td class="py-2.5 px-3"><span class="badge ${isService ? 'badge-blue' : 'badge-green'} text-[10px] px-1.5 py-0.5 rounded font-bold">${isService ? 'SERVICIO' : 'BIEN'}</span></td>
              <td class="py-2.5 px-3 text-right font-mono text-gray-700">${(window as any).fmt(p.sales_price || p.base_price || 0)}</td>
              ${whCells}
              <td class="py-2.5 px-3 text-right font-mono text-xs border-l" style="background:#F8FAFC">
                <span class="px-2 py-0.5 rounded border ${totBadgeClass}">${isService ? 'SERVICIO' : (window as any).fmtN(totStock)}</span>
              </td>
              <td class="py-2.5 px-3 text-center">
                ${addBtnHtml}
              </td>
            </tr>
          `;
        }).join('');
      }
    };

    renderMatrix();

    if (searchInput) searchInput.oninput = (window as any).debounce(renderMatrix, 200);
    if (whFilterSelect) whFilterSelect.onchange = renderMatrix;
    if (stockFilterSelect) stockFilterSelect.onchange = renderMatrix;

    const exportBtn = document.getElementById('btn-export-active-inv');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const rows: any[] = [];
        products.forEach((p: any) => {
          const isService = String(p.type || '').toUpperCase() === 'SERVICIO' || p.is_service === true;
          const totStock = stockTotalMap[p.id] || 0;
          const rowObj: any = {
            'Código': p.code || '',
            'Producto / Referencia': p.name || '',
            'Tipo': isService ? 'SERVICIO' : 'BIEN',
            'Precio Venta': p.sales_price || p.base_price || 0,
            'Costo Promedio': p.cost_price || 0,
          };
          warehouses.forEach((w: any) => {
            rowObj[`Bodega: ${w.name}`] = isService ? 0 : (stockMap[p.id]?.[w.id] || 0);
          });
          rowObj['Stock Total'] = isService ? 0 : totStock;
          rows.push(rowObj);
        });

        const headers = [
          { key: 'Código', label: 'Código' },
          { key: 'Producto / Referencia', label: 'Producto / Referencia' },
          { key: 'Tipo', label: 'Tipo' },
          { key: 'Precio Venta', label: 'Precio Venta' },
          { key: 'Costo Promedio', label: 'Costo Promedio' },
          ...warehouses.map((w: any) => ({ key: `Bodega: ${w.name}`, label: `Bodega: ${w.name}` })),
          { key: 'Stock Total', label: 'Stock Total' }
        ];

        (window as any).exportToExcel(rows, headers, 'Inventario_Activo_Por_Bodegas');
      };
    }

  } catch (err: any) {
    console.error('Error abriendo modal de inventario activo:', err);
    (window as any).showToast('Error al consultar inventario: ' + err.message, 'error');
  }
};

(window as any).showActiveInventoryStockModal = (window as any).soShowActiveInventoryModal;

(window as any).soAddProductFromInventoryModal = async function(productId: string) {
  const products = (window as any).__soProductsCache || [];
  const prod = products.find((p: any) => p.id === productId);
  if (prod && typeof (window as any).addSoInvoiceLine === 'function') {
    const added = await (window as any).addSoInvoiceLine(prod, null);
    if (added !== false) {
      // 1. Cerrar el modal de consulta de inventario
      const overlay = document.getElementById('active-inventory-modal-overlay');
      if (overlay) overlay.style.display = 'none';

      // 2. Enfocar y seleccionar el campo de cantidad del producto recién agregado en la factura
      setTimeout(() => {
        const rows = document.querySelectorAll('#so-lines-body tr');
        if (rows.length > 0) {
          const lastRow = rows[rows.length - 1];
          const lastIdx = lastRow.id.split('-').pop();
          const qtyInput = document.getElementById(`sol-qty-${lastIdx}`) as HTMLInputElement;
          if (qtyInput) {
            qtyInput.focus();
            qtyInput.select();
          }
          lastRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, 100);

      (window as any).showToast(`Producto "${prod.name}" añadido a la factura`, 'success');
    }
  } else {
    (window as any).showToast('No se pudo agregar el producto a la factura', 'warning');
  }
};

// Inyecciones globales
(window as any).salesKpi = salesKpi;
(window as any).renderVentas = renderVentas;
(window as any).openSalesSettingsModal = openSalesSettingsModal;
(window as any).saveSalesConfig = saveSalesConfig;
(window as any).openSalesForm = openSalesForm;
(window as any).soMixedCalc = (window as any).soMixedCalc || window.soMixedCalc;
