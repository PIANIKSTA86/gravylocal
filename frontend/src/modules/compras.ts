/**
 * GRAVY v2.0 — compras.ts
 * Módulo de Compras de Bienes y Servicios.
 * Rediseñado con paridad total al módulo de Ventas para consistencia del sistema.
 */

'use strict';

interface PurchaseStatusDetail {
  label: string;
  badge: string;
}

const PO_STATUS: Record<string, PurchaseStatusDetail> = {
  draft:  { label: 'Borrador',       badge: 'badge-orange' },
  posted: { label: 'Contabilizada',  badge: 'badge-green'  },
  voided: { label: 'Anulada',        badge: 'badge-red'    },
};

const PURCHASE_CONFIG_KEY = 'purchase_config_v1';
const PO_PRODUCT_TYPES = [
  { value: 'BIEN', label: 'Bien (Inventariable)' },
  { value: 'SERVICIO', label: 'Servicio' },
];
const PO_PRODUCT_UNITS = ['UND', 'KG', 'L', 'M', 'M2', 'M3', 'PAQ', 'CJ', 'HORA', 'MES'];
const PO_IVA_RATES = [0, 5, 19];

// --- Valores por Defecto ---
function defaultPurchaseConfig() {
  return {
    operational: {
      require_warehouse_for_goods: true,
      enable_discounts: true,
      enable_freight: true,
      enable_withholdings: true,
      withholdings: {
        reterenta: true,
        reteiva: false,
        reteica: false,
      },
      default_due_days: 30,
      immediate_posting: false,
    },
    accounting: {
      accounts: {
        payable_code: '220505',
        expense_fallback_code: '5135',
        iva_by_rate: {
          '5': '233501',
          '19': '233502',
        },
        discount_code: '',
        freight_code: '',
      },
      withholding_rules: [
        {
          id: 'wr-ret-renta-3_5',
          concept: 'RETERENTA',
          base_type: 'SUBTOTAL',
          min_base: 0,
          rate: 3.5,
          account_code: '',
        },
      ],
    },
  };
}

function normalizePurchaseConfig(raw: any) {
  const base = defaultPurchaseConfig();
  const op = raw?.operational || {};
  const ac = raw?.accounting || {};
  const acc = ac?.accounts || {};
  
  const rawIvaByRate = (acc.iva_by_rate && typeof acc.iva_by_rate === 'object') ? acc.iva_by_rate : {};
  const ivaByRate: Record<string, string> = {};
  Object.keys(rawIvaByRate).forEach((k) => {
    const rateKey = String(k).trim();
    if (!rateKey) return;
    ivaByRate[rateKey] = String(rawIvaByRate[k] || '').trim();
  });
  if (!Object.keys(ivaByRate).length) {
    const legacy = String(acc.iva_discountable_code || '').trim();
    if (legacy) ivaByRate['19'] = legacy;
  }
  
  const rawRules = Array.isArray(ac.withholding_rules) ? ac.withholding_rules : [];
  const normalizedRules = rawRules
    .map((r, idx) => ({
      id: String(r?.id || `wr-${Date.now()}-${idx}`).trim(),
      concept: String(r?.concept || '').trim().toUpperCase(),
      base_type: String(r?.base_type || 'SUBTOTAL').trim().toUpperCase(),
      min_base: Math.max(0, Number(r?.min_base || 0) || 0),
      rate: Math.max(0, Number(r?.rate || 0) || 0),
      account_code: String(r?.account_code || '').trim(),
    }))
    .filter(r => r.concept && r.rate > 0);

  return {
    operational: {
      require_warehouse_for_goods: op.require_warehouse_for_goods !== false,
      enable_discounts: op.enable_discounts !== false,
      enable_freight: op.enable_freight !== false,
      enable_withholdings: op.enable_withholdings !== false,
      withholdings: {
        reterenta: op?.withholdings?.reterenta !== false,
        reteiva: !!op?.withholdings?.reteiva,
        reteica: !!op?.withholdings?.reteica,
      },
      default_due_days: Math.max(0, Number(op.default_due_days ?? base.operational.default_due_days) || 0),
      immediate_posting: !!op.immediate_posting,
    },
    accounting: {
      accounts: {
        payable_code: String(acc.payable_code || base.accounting.accounts.payable_code).trim(),
        expense_fallback_code: String(acc.expense_fallback_code || base.accounting.accounts.expense_fallback_code).trim(),
        iva_by_rate: Object.keys(ivaByRate).length ? ivaByRate : { ...base.accounting.accounts.iva_by_rate },
        discount_code: String(acc.discount_code || '').trim(),
        freight_code: String(acc.freight_code || '').trim(),
      },
      withholding_rules: normalizedRules.length ? normalizedRules : [...base.accounting.withholding_rules],
    },
  };
}

async function getPurchaseConfig() {
  try {
    const raw = await (window as any).API.getSetting(PURCHASE_CONFIG_KEY);
    if (!raw) return defaultPurchaseConfig();
    return normalizePurchaseConfig(JSON.parse(raw));
  } catch {
    return defaultPurchaseConfig();
  }
}

async function savePurchaseConfig(cfg: any) {
  const normalized = normalizePurchaseConfig(cfg || {});
  await (window as any).API.setSetting(PURCHASE_CONFIG_KEY, JSON.stringify(normalized));
  await (window as any).API.logAudit('CONFIG', 'PurchaseConfig', null, 'Configuración de compras actualizada');
  return normalized;
}

function addDaysToDateStr(dateStr: string, days: number) {
  if (!dateStr || !days) return dateStr || '';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + Number(days || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function fmtPurchaseAuditDate(value: any) {
  if (!value) return '—';
  const dt = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function openPurchaseReasonDialog(opts: any, onConfirm: any) {
  const {
    title,
    messageHtml,
    actionLabel = 'Confirmar',
    actionClass = 'btn-primary',
    placeholder = 'Describe el motivo...',
  } = opts || {};

  (window as any).openModal(
    title || 'Motivo requerido',
    `<div class="space-y-4 text-sm">
      <div style="color:#374151">${messageHtml || ''}</div>
      <div>
        <label class="form-label">Motivo obligatorio</label>
        <textarea id="po-action-reason" class="form-input" rows="4" placeholder="${(window as any).esc(placeholder)}"></textarea>
        <p class="text-xs mt-2" style="color:#6B7280">Este motivo quedará registrado en la auditoría de la compra.</p>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${actionClass}" id="po-action-confirm-btn">${actionLabel}</button>`
  );

  setTimeout(() => {
    const reasonEl = document.getElementById('po-action-reason') as HTMLTextAreaElement;
    const btn = document.getElementById('po-action-confirm-btn') as HTMLButtonElement;
    reasonEl?.focus();
    btn?.addEventListener('click', async () => {
      const reason = String(reasonEl?.value || '').trim();
      if (reason.length < 8) {
        (window as any).showToast('Indica un motivo claro de al menos 8 caracteres.', 'warning');
        reasonEl?.focus();
        return;
      }
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Procesando...';
      }
      try {
        await onConfirm(reason);
        (window as any).closeModal();
      } catch (err: any) {
        (window as any).showToast(err.response?.message || err.message || 'No fue posible completar la acción.', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = actionLabel;
        }
      }
    }, { once: true });
  }, 50);
}

async function openPurchaseSettingsModal(onSaved: any = null) {
  try {
    const [cfg, accounts] = await Promise.all([
      getPurchaseConfig(),
      (window as any).API.getAccounts(true),
    ]);
    const accountOptions = (selectedCode = '') => {
      const rows = accounts
        .filter((a: any) => a.active && Number(a.level) >= 3)
        .sort((a: any, b: any) => a.code.localeCompare(b.code));
      return `<option value="">— Sin definir —</option>${rows.map((a: any) => `<option value="${(window as any).esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${(window as any).esc(a.code)} — ${(window as any).esc(a.name)}</option>`).join('')}`;
    };
    const initialIvaRates = Array.from(new Set([
      ...PO_IVA_RATES.map(r => String(r)),
      ...Object.keys(cfg.accounting.accounts.iva_by_rate || {}),
    ])).sort((a, b) => Number(a) - Number(b));

    (window as any).openModal(
      'Configuración de Compras',
      `<div class="space-y-5">
        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-sliders mr-2"></i>Parámetros operativos</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Define opciones habilitadas para el registro de compras.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label class="inline-flex items-center gap-2"><input id="po-cfg-req-wh" type="checkbox" ${cfg.operational.require_warehouse_for_goods ? 'checked' : ''}>Exigir bodega cuando hay bienes</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-discount" type="checkbox" ${cfg.operational.enable_discounts ? 'checked' : ''}>Habilitar descuentos</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-freight" type="checkbox" ${cfg.operational.enable_freight ? 'checked' : ''}>Habilitar fletes</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-withholding" type="checkbox" ${cfg.operational.enable_withholdings ? 'checked' : ''}>Habilitar retenciones</label>
            <div class="form-group mb-0">
              <label class="form-label">Plazo por defecto (días)</label>
              <input id="po-cfg-default-due" class="form-input" type="number" min="0" step="1" value="${(window as any).esc(String(cfg.operational.default_due_days || 0))}">
            </div>
            <label class="inline-flex items-center gap-2 mt-2"><input id="po-cfg-immediate" type="checkbox" ${cfg.operational.immediate_posting ? 'checked' : ''}>Contabilización inmediata (Guardar y Contabilizar)</label>
          </div>
          <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <label class="inline-flex items-center gap-2"><input id="po-cfg-ret-renta" type="checkbox" ${cfg.operational.withholdings.reterenta ? 'checked' : ''}>ReteRenta</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-ret-iva" type="checkbox" ${cfg.operational.withholdings.reteiva ? 'checked' : ''}>ReteIVA</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-ret-ica" type="checkbox" ${cfg.operational.withholdings.reteica ? 'checked' : ''}>ReteICA</label>
          </div>
        </div>

        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-book mr-2"></i>Parámetros contables</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Estas cuentas se usan en la contabilización automática de la compra.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-group mb-0">
              <label class="form-label">Cuenta proveedores (Cr)</label>
              <select id="po-cfg-payable" class="form-input">${accountOptions(cfg.accounting.accounts.payable_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta gasto fallback (SERVICIO)</label>
              <select id="po-cfg-exp-fallback" class="form-input">${accountOptions(cfg.accounting.accounts.expense_fallback_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta descuentos</label>
              <select id="po-cfg-discount-acct" class="form-input">${accountOptions(cfg.accounting.accounts.discount_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta fletes</label>
              <select id="po-cfg-freight-acct" class="form-input">${accountOptions(cfg.accounting.accounts.freight_code)}</select>
            </div>
          </div>
          <div class="mt-4 rounded-xl border p-3" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Cuentas IVA descontable por tarifa</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-po-cfg-add-iva-rate"><i class="fas fa-plus"></i> Agregar tarifa</button>
            </div>
            <div id="po-cfg-iva-rates-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">La contabilización buscará la cuenta según el IVA % de cada línea.</p>
          </div>
          <div class="mt-4 rounded-xl border p-3" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Reglas de retención (base/tarifa/concepto)</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-po-cfg-add-ret-rule"><i class="fas fa-plus"></i> Agregar regla</button>
            </div>
            <div id="po-cfg-ret-rules-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">Cada regla define concepto, base, base mínima, tarifa y cuenta contable de retención.</p>
          </div>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-save-po-config"><i class="fas fa-floppy-disk"></i> Guardar configuración</button>`,
      true
    );

    const ivaWrap = document.getElementById('po-cfg-iva-rates-wrap');
    const addIvaRateRow = (rate = '', accountCode = '') => {
      if (!ivaWrap) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <div class="col-span-3">
          <input class="form-input po-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${(window as any).esc(String(rate || ''))}">
        </div>
        <div class="col-span-8">
          <select class="form-input po-cfg-iva-acct">${accountOptions(accountCode)}</select>
        </div>
        <div class="col-span-1 text-right">
          <button type="button" class="btn btn-danger btn-sm po-cfg-iva-del"><i class="fas fa-trash"></i></button>
        </div>`;
      row.querySelector('.po-cfg-iva-del')?.addEventListener('click', () => row.remove());
      ivaWrap.appendChild(row);
    };

    if (initialIvaRates.length) {
      initialIvaRates.forEach((rate) => addIvaRateRow(rate, cfg.accounting.accounts.iva_by_rate?.[rate] || ''));
    } else {
      addIvaRateRow('19', '');
    }
    document.getElementById('btn-po-cfg-add-iva-rate')?.addEventListener('click', () => addIvaRateRow('', ''));

    const retWrap = document.getElementById('po-cfg-ret-rules-wrap');
    const conceptOpts = ['RETERENTA', 'RETEIVA', 'RETEICA', 'OTRA'];
    const baseTypeOpts = ['SUBTOTAL', 'IVA', 'TOTAL'];
    const addRetRuleRow = (rule: any = {}) => {
      if (!retWrap) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <div class="col-span-2"><select class="form-input po-cfg-ret-concept">${conceptOpts.map(o => `<option value="${o}"${String(rule.concept || '') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="col-span-2"><select class="form-input po-cfg-ret-base-type">${baseTypeOpts.map(o => `<option value="${o}"${String(rule.base_type || 'SUBTOTAL') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-min-base" type="number" min="0" step="0.01" placeholder="Base mín." value="${(window as any).esc(String(rule.min_base ?? 0))}"></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${(window as any).esc(String(rule.rate ?? 0))}"></div>
        <div class="col-span-3"><select class="form-input po-cfg-ret-account">${accountOptions(rule.account_code || '')}</select></div>
        <div class="col-span-1 text-right"><button type="button" class="btn btn-danger btn-sm po-cfg-ret-del"><i class="fas fa-trash"></i></button></div>`;
      row.querySelector('.po-cfg-ret-del')?.addEventListener('click', () => row.remove());
      retWrap.appendChild(row);
    };

    const initialRules = Array.isArray(cfg.accounting.withholding_rules) ? cfg.accounting.withholding_rules : [];
    if (initialRules.length) {
      initialRules.forEach((r) => addRetRuleRow(r));
    } else {
      addRetRuleRow({ concept: 'RETERENTA', base_type: 'SUBTOTAL', min_base: 0, rate: 3.5, account_code: '' });
    }
    document.getElementById('btn-po-cfg-add-ret-rule')?.addEventListener('click', () => addRetRuleRow({ concept: 'RETERENTA', base_type: 'SUBTOTAL', min_base: 0, rate: 0, account_code: '' }));

    document.getElementById('btn-save-po-config')?.addEventListener('click', async () => {
      try {
        const ivaByRate: Record<string, string> = {};
        (document.querySelectorAll('#po-cfg-iva-rates-wrap .grid') || []).forEach((row) => {
          const rate = String((row.querySelector('.po-cfg-iva-rate') as HTMLInputElement)?.value || '').trim();
          const acct = String((row.querySelector('.po-cfg-iva-acct') as HTMLSelectElement)?.value || '').trim();
          if (!rate) return;
          ivaByRate[rate] = acct;
        });
        const withholdingRules: any[] = [];
        (document.querySelectorAll('#po-cfg-ret-rules-wrap .grid') || []).forEach((row, idx) => {
          const concept = String((row.querySelector('.po-cfg-ret-concept') as HTMLSelectElement)?.value || '').trim().toUpperCase();
          const baseType = String((row.querySelector('.po-cfg-ret-base-type') as HTMLSelectElement)?.value || 'SUBTOTAL').trim().toUpperCase();
          const minBase = Math.max(0, Number((row.querySelector('.po-cfg-ret-min-base') as HTMLInputElement)?.value || 0) || 0);
          const rate = Math.max(0, Number((row.querySelector('.po-cfg-ret-rate') as HTMLInputElement)?.value || 0) || 0);
          const accountCode = String((row.querySelector('.po-cfg-ret-account') as HTMLSelectElement)?.value || '').trim();
          if (!concept || rate <= 0) return;
          withholdingRules.push({
            id: `wr-${Date.now()}-${idx}`,
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
            require_warehouse_for_goods: getCheckVal('po-cfg-req-wh'),
            enable_discounts: getCheckVal('po-cfg-discount'),
            enable_freight: getCheckVal('po-cfg-freight'),
            enable_withholdings: getCheckVal('po-cfg-withholding'),
            default_due_days: Math.max(0, parseInt(getInputVal('po-cfg-default-due') || '0', 10) || 0),
            withholdings: {
              reterenta: getCheckVal('po-cfg-ret-renta'),
              reteiva: getCheckVal('po-cfg-ret-iva'),
              reteica: getCheckVal('po-cfg-ret-ica'),
            },
            immediate_posting: getCheckVal('po-cfg-immediate'),
          },
          accounting: {
            accounts: {
              payable_code: getSelectVal('po-cfg-payable') || '220505',
              expense_fallback_code: getSelectVal('po-cfg-exp-fallback') || '5135',
              iva_by_rate: ivaByRate,
              discount_code: getSelectVal('po-cfg-discount-acct') || '',
              freight_code: getSelectVal('po-cfg-freight-acct') || '',
            },
            withholding_rules: withholdingRules,
          },
        };
        await savePurchaseConfig(payload);
        (window as any).showToast('Configuración de compras guardada', 'success');
        (window as any).closeModal();
        if (typeof onSaved === 'function') onSaved();
      } catch (err: any) {
        (window as any).showToast(err.response?.message || err.message || 'No se pudo guardar la configuración', 'error');
      }
    });
  } catch (err: any) {
    (window as any).showToast(err.response?.message || err.message || 'No se pudo abrir la configuración de compras', 'error');
  }
}

// ── Render Principal ──────────────────────────────────────────────────────────
export async function renderCompras(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando compras...</div>`;
  try {
    await _loadComprasPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.response?.message || err.message)}</div>`;
  }
}

async function _loadComprasPage(c: HTMLElement) {
  const result = await (window as any).API.getPurchaseInvoices({ page: 1, perPage: 200, sort: '-date,-number' });
  const invoices = result.items || [];

  const total    = invoices.length;
  const draft    = invoices.filter((i: any) => i.status === 'draft').length;
  const posted   = invoices.filter((i: any) => i.status === 'posted').length;
  const totalVal = invoices.filter((i: any) => i.status !== 'voided').reduce((s: number, i: any) => s + (i.payable_total ?? i.total ?? 0), 0);

  const prefixes = [...new Set(invoices.map((i: any) => {
    const num = String(i.number || '').trim();
    return num.includes('-') ? num.split('-')[0].toUpperCase() : 'SIN_PREFIJO';
  }))].filter(Boolean).sort();

  c.innerHTML = `
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Compras de Bienes y Servicios</h3>
        <p class="text-sm" style="color:#6B7280">Facturas de compra y Documentos Soporte (DS) con contabilización automática, impuestos, retenciones y control de Kardex.</p>
      </div>
      ${(window as any).can('canWrite') ? `
        <div class="flex gap-2">
          <button class="btn btn-outline" id="btn-po-config" title="Configuración de compras"><i class="fas fa-gear"></i></button>
          <button class="btn btn-primary" id="btn-new-purchase"><i class="fas fa-plus"></i> Nueva Factura de Compra (FC/DS)</button>
        </div>` : ''}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${poKpi('Total facturas',      total,                         'fas fa-file-invoice-dollar', '#1A4B8C', '#EEF4FF')}
      ${poKpi('Borradores',          draft,                         'fas fa-pencil',              '#C46516', '#FFF8F0')}
      ${poKpi('Contabilizadas',      posted,                        'fas fa-check-circle',        '#059669', '#ECFDF5')}
      ${poKpi('Valor total compras', (window as any).fmt(totalVal), 'fas fa-coins',               '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="po-q" class="form-input flex-1 min-w-48" placeholder="Buscar número, proveedor, NIT, referencia o notas...">
      <select id="po-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="draft">Borrador</option>
        <option value="posted">Contabilizada</option>
        <option value="voided">Anulada</option>
      </select>
      <select id="po-prefix-f" class="form-input" style="max-width:180px">
        <option value="">Todos los prefijos</option>
        ${prefixes.map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
      <input id="po-from" type="date" class="form-input" style="max-width:160px" title="Desde">
      <input id="po-to"   type="date" class="form-input" style="max-width:160px" title="Hasta">
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="po-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Ref. proveedor</th>
              <th>Bodega</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA</th>
              <th class="text-right">Total Neto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="po-tbody">
            ${invoices.length ? invoices.map(renderPoRow).join('') : `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice-dollar mr-2"></i>No hay facturas de compra.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('btn-new-purchase')?.addEventListener('click', () => openPurchaseForm(null, () => _loadComprasPage(c)));
  document.getElementById('btn-po-config')?.addEventListener('click', () => openPurchaseSettingsModal(() => _loadComprasPage(c)));

  const applyPoFilter = () => filterPoTable();
  document.getElementById('po-q')?.addEventListener('input', applyPoFilter);
  document.getElementById('po-status-f')?.addEventListener('change', applyPoFilter);
  document.getElementById('po-prefix-f')?.addEventListener('change', applyPoFilter);
  document.getElementById('po-from')?.addEventListener('change', applyPoFilter);
  document.getElementById('po-to')?.addEventListener('change', applyPoFilter);
}

function renderPoRow(inv: any) {
  const meta = PO_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
  const sup  = inv.expand?.supplier_id;
  const wh   = inv.expand?.warehouse_id;
  const num = String(inv.number || '').trim();
  const prefix = num.includes('-') ? num.split('-')[0].toUpperCase() : 'SIN_PREFIJO';
  return `
    <tr data-poid="${(window as any).esc(inv.id)}" data-postatus="${(window as any).esc(inv.status)}" data-podate="${(window as any).esc(inv.date)}" data-poprefix="${(window as any).esc(prefix)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(inv.number)}</span></td>
      <td>${(window as any).esc(inv.date)}</td>
      <td class="font-medium">${sup ? (window as any).esc(sup.name) : '—'}</td>
      <td class="text-sm" style="color:#6B7280">${(window as any).esc(inv.supplier_ref || '—')}</td>
      <td class="text-sm">${wh ? (window as any).esc(wh.name) : '—'}</td>
      <td class="text-right">${(window as any).fmt(inv.subtotal || 0)}</td>
      <td class="text-right">${inv.iva_total ? (window as any).fmt(inv.iva_total) : '—'}</td>
      <td class="text-right font-semibold">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewPurchaseDetail('${(window as any).esc(inv.id)}')"><i class="fas fa-eye"></i></button>
          ${inv.status === 'draft' && (window as any).can('canWrite') ? `
            <button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="window.editPurchase('${(window as any).esc(inv.id)}')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-primary btn-sm" title="Contabilizar" onclick="window.contabilizarCompra('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-check"></i> Contabilizar</button>
            <button class="btn btn-danger btn-sm" title="Anular" onclick="window.voidPurchase('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}', 'draft')"><i class="fas fa-ban"></i></button>
          ` : ''}
          ${inv.status === 'posted' ? `
            ${(window as any).requireRole('admin') ? `<button class="btn btn-outline btn-sm" title="Reabrir para corregir" style="border-color:#D97706;color:#D97706" onclick="window.reopenPurchase('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-rotate-left"></i></button>` : ''}
            ${(inv.expand?.tx_type_id?.code === 'DS' || inv.expand?.tx_type_id?.code === 'FC') && (window as any).can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Generar Nota de Ajuste" style="border-color:#C46516;color:#C46516" onclick="window.openPurchaseNotePreModal('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-file-invoice"></i></button>` : ''}
            ${(window as any).can('canDelete') ? `<button class="btn btn-danger btn-sm" title="Anular definitivamente" onclick="window.voidPurchase('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}', 'posted')"><i class="fas fa-ban"></i></button>` : ''}
            ${inv.tx_id ? `<button class="btn btn-outline btn-sm" title="Ver asiento contable" style="border-color:#7C3AED;color:#7C3AED" onclick="window.seeTxDetail('${(window as any).esc(inv.tx_id)}')"><i class="fas fa-book-open"></i></button>` : ''}
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

function filterPoTable() {
  const q = ((document.getElementById('po-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const st = (document.getElementById('po-status-f') as HTMLSelectElement)?.value || '';
  const prefixF = (document.getElementById('po-prefix-f') as HTMLSelectElement)?.value || '';
  const from = (document.getElementById('po-from') as HTMLInputElement)?.value || '';
  const to = (document.getElementById('po-to') as HTMLInputElement)?.value || '';

  const rows = document.querySelectorAll('#po-table tbody tr[data-poid]');
  rows.forEach((row: any) => {
    const text = row.textContent.toLowerCase();
    const status = row.getAttribute('data-postatus');
    const date = row.getAttribute('data-podate');
    const prefix = row.getAttribute('data-poprefix');

    const matchesQ = !q || text.includes(q);
    const matchesStatus = !st || status === st;
    const matchesPrefix = !prefixF || prefix === prefixF;
    const matchesFrom = !from || date >= from;
    const matchesTo = !to || date <= to;

    row.style.display = (matchesQ && matchesStatus && matchesPrefix && matchesFrom && matchesTo) ? '' : 'none';
  });
}

// ── Formulario Reactivo de Creación / Edición ─────────────────────────
async function openPurchaseForm(invoiceId: string | null = null, onDone: any = null, preloadedImportId: string | null = null, noteConfig: any = null) {
  let inv: any = null, existingLines: any[] = [];

  const [poConfig, suppliers, warehouses, products, txTypes] = await Promise.all([
    getPurchaseConfig(),
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
    (window as any).pb.listAll('transaction_types', { filter: 'active=true', sort: 'name' }),
  ]);

  (window as any).__poTxTypesCache = txTypes;
  (window as any).__poProductsCache = products;

  if (invoiceId) {
    [inv, existingLines] = await Promise.all([
      (window as any).pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id' }),
      (window as any).API.getPurchaseInvoiceLines(invoiceId),
    ]);
  } else if (noteConfig) {
    try {
      const originalInvoice = await (window as any).pb.get('purchase_invoices', noteConfig.originalInvoiceId);
      const lines = await (window as any).API.getPurchaseInvoiceLines(noteConfig.originalInvoiceId);

      inv = {
        supplier_id: originalInvoice.supplier_id,
        warehouse_id: originalInvoice.warehouse_id,
        notes: `Ajuste a documento ${noteConfig.originalInvoiceNum}`,
        date: (window as any).todayStr(),
        payment_method: originalInvoice.payment_method || 'CREDITO',
        tx_type_id: txTypes.find((t: any) => t.code === noteConfig.type)?.id || '',
        dian_resolution_id: noteConfig.resolutionId || null,
        cross_doc_ref: noteConfig.originalInvoiceNum
      };

      existingLines = lines.map((l: any) => ({
        product_id: l.product_id,
        qty: l.qty,
        unit_price: l.unit_price,
        iva_rate: l.iva_rate,
        iva_amount: l.iva_amount,
        subtotal: l.subtotal,
        total: l.total,
        description: l.description || '',
      }));
    } catch (err: any) {
      console.error("Error precargando nota de compra:", err);
      (window as any).showToast("Error al precargar la compra base: " + err.message, "error");
    }
  }

  let lineCounter = 0;
  const billDate = inv?.date || (window as any).todayStr();
  const defaultDueDate = inv?.due_date || addDaysToDateStr(billDate, poConfig.operational.default_due_days || 0);

  // Filtrar tipos de comprobantes contables válidos
  let allowedTxTypes = txTypes.filter((t: any) => t.code === 'FC' || t.code === 'DS' || t.name.toLowerCase().includes('compra'));
  if (noteConfig) {
    const searchType = String(noteConfig.type || '').trim().toUpperCase();
    let noteTypeObj = txTypes.find((t: any) => 
      String(t.code || '').trim().toUpperCase() === searchType || 
      String(t.prefix || '').trim().toUpperCase() === searchType
    );
    if (!noteTypeObj) {
      const fallbackName = searchType === 'NDS' ? 'soporte' : 'egreso';
      noteTypeObj = txTypes.find((t: any) => String(t.name || '').toLowerCase().includes(fallbackName));
    }

    if (noteTypeObj) {
      allowedTxTypes = [noteTypeObj];
      if (!inv) inv = {};
      inv.tx_type_id = noteTypeObj.id; // Forzar selección
    } else {
      (window as any).showToast(`Advertencia: No se encontró un tipo de comprobante para ${noteConfig.type} en la base de datos.`, 'warning');
    }
  }

  const txTypeOptions = (allowedTxTypes.length ? allowedTxTypes : txTypes)
    .map((t: any) => `<option value="${(window as any).esc(t.id)}"${(inv?.tx_type_id === t.id || (!inv && !noteConfig && t.code === 'FC')) ? ' selected' : ''} data-code="${(window as any).esc(t.code)}">${(window as any).esc(t.prefix)} — ${(window as any).esc(t.name)}</option>`)
    .join('');

  const withholdingRules = (poConfig?.accounting?.withholding_rules || [])
    .filter((r: any) => String(r.account_code || '').trim() && Number(r.rate || 0) > 0);

  (window as any).__poRetRulesCache = withholdingRules;
  const hasLineRet = existingLines.some((l: any) => l.ret_rule_id);
  (window as any).__poRetMode = hasLineRet ? 'line' : 'header'; // Inicializa modo retención

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

      <!-- Banner de restauración temporal -->
      <div id="po-restore-alert" class="rounded-xl p-3 mb-2 flex items-center justify-between gap-3" style="display:none;background:#EEF4FF;border:1px solid #D2E3FC;color:#1A4B8C">
        <div class="flex items-center gap-2">
          <i class="fas fa-history text-lg"></i>
          <span>Se encontró una compra anterior sin guardar. ¿Deseas recuperar los datos?</span>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn btn-primary btn-sm" id="btn-po-restore-yes">Recuperar</button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-po-restore-no" style="background:#fff">Descartar</button>
        </div>
      </div>

      <!-- ══ HEADER COMPACTO ══ -->
      ${noteConfig ? `
      <div class="rounded-xl p-3 mb-2 flex items-center gap-3" style="background:#FFF7ED;border:1px solid #FFEDD5">
        <i class="fas fa-file-invoice text-2xl" style="color:#C2410C"></i>
        <div class="flex-1">
          <label class="po-hdr-label" style="color:#C2410C">Concepto de Ajuste para ${noteConfig.type} <span style="color:#EF4444">*</span></label>
          <select id="po-dian-concept" class="form-input po-compact-inp w-full" style="border-color:#FDBA74; max-width:400px">
            <option value="">-- Selecciona el motivo de ajuste --</option>
            <option value="1">1 - Devolución de parte de los bienes</option>
            <option value="2">2 - Anulación de documento soporte</option>
            <option value="3">3 - Rebaja total aplicada</option>
            <option value="4">4 - Descuento total aplicada</option>
            <option value="5">5 - Rescisión: nulidad por falta de requisitos</option>
            <option value="6">6 - Otros (Especificar en descripción)</option>
          </select>
        </div>
      </div>` : ''}
      <div class="rounded-xl p-3" style="background:#F9FAFB;border:1px solid #E5E7EB">
        <!-- Fila 1: Proveedor + Comprobante + Fecha + Vence -->
        <div class="grid gap-2 mb-2" style="grid-template-columns:1fr 180px 140px 140px">
          <!-- Proveedor con autocompletar y adición rápida -->
          <div>
            <label class="po-hdr-label">Proveedor <span style="color:#EF4444">*</span></label>
            <div id="po-supplier-search-wrap" class="relative flex gap-1 items-center">
              <input id="po-supplier-search" class="form-input po-compact-inp flex-1" autocomplete="off" placeholder="NIT o nombre del proveedor...">
              <button type="button" class="btn btn-outline po-icon-btn" onclick="window.poQuickAddThirdParty()" title="Nuevo Proveedor">
                <i class="fas fa-user-plus" style="font-size:11px;color:#4B5563"></i>
              </button>
              <input id="po-supplier" type="hidden" value="${(window as any).esc(inv?.supplier_id || '')}">
              <div id="po-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
            </div>
          </div>
          <!-- Comprobante -->
          <div>
            <label class="po-hdr-label">Comprobante <span style="color:#EF4444">*</span></label>
            <select id="po-tx-type" class="form-input po-compact-inp" onchange="window.poToggleSupplierRef(this)"${noteConfig ? ' disabled style="background-color:#F3F4F6"' : ''}>
              ${noteConfig ? '' : '<option value="">— Seleccionar —</option>'}
              ${txTypeOptions}
            </select>
          </div>
          <!-- Fecha -->
          <div>
            <label class="po-hdr-label">Fecha <span style="color:#EF4444">*</span></label>
            <input id="po-date" type="date" class="form-input po-compact-inp" value="${(window as any).esc(billDate)}" onchange="window.poSuggestDueDate()">
          </div>
          <!-- Vencimiento -->
          <div>
            <label class="po-hdr-label">Vencimiento</label>
            <input id="po-due-date" type="date" class="form-input po-compact-inp" value="${(window as any).esc(defaultDueDate || '')}">
          </div>
        </div>
        <!-- Fila 2: Pago + Bodega + Ref Proveedor + Notas -->
        <div class="grid gap-2" style="grid-template-columns:160px 175px 175px 1fr">
          <!-- Forma de Pago -->
          <div>
            <label class="po-hdr-label">Forma de Pago <span style="color:#EF4444">*</span></label>
            <select id="po-payment-method" class="form-input po-compact-inp">
              <option value="EFECTIVO"${inv?.payment_method === 'EFECTIVO' ? ' selected' : ''}>Efectivo</option>
              <option value="TRANSFERENCIA"${inv?.payment_method === 'TRANSFERENCIA' ? ' selected' : ''}>Tarjeta / Transf.</option>
              <option value="CREDITO"${(inv?.payment_method === 'CREDITO' || !inv) ? ' selected' : ''}>Crédito Comercial</option>
            </select>
          </div>
          <!-- Bodega Destino -->
          <div>
            <label class="po-hdr-label">Bodega Destino <span style="font-size:10px;color:#9CA3AF">(ingreso)</span></label>
            <select id="po-warehouse" class="form-input po-compact-inp" onchange="window.poRecalcLine(0)">
              <option value="">— Sin bodega —</option>
              ${warehouses.map(w => `<option value="${(window as any).esc(w.id)}"${(inv?.warehouse_id === w.id || (!inv && warehouses.length === 1)) ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}
            </select>
          </div>
          <!-- Referencia Proveedor -->
          <div id="po-supplier-ref-wrap">
            <label class="po-hdr-label">Ref. factura proveedor</label>
            <input id="po-supplier-ref" class="form-input po-compact-inp" placeholder="Ej: FAC-2026-001" value="${(window as any).esc(inv?.supplier_ref || '')}">
          </div>
          <!-- Notas -->
          <div>
            <label class="po-hdr-label">Notas / Observaciones</label>
            <input id="po-notes" class="form-input po-compact-inp" placeholder="Observaciones, entrega..." value="${(window as any).esc(inv?.notes || '')}">
          </div>
        </div>
      </div>

      <!-- ══ BUSCADOR GLOBAL DE PRODUCTOS ══ -->
      <div class="relative">
        <i class="fas fa-search" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:13px;pointer-events:none"></i>
        <input id="po-prod-search-global" class="form-input"
               style="padding-left:38px;font-size:14px;border-color:#FDBA74"
               autocomplete="off"
               placeholder="Buscar producto o servicio por nombre o código... (↑↓ para navegar · Enter o clic para agregar)">
        <div id="po-prod-results-global"
             style="display:none;position:absolute;left:0;right:0;top:calc(100% + 3px);max-height:300px;overflow:auto;background:#fff;border:1.5px solid #FDBA74;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);z-index:50">
        </div>
      </div>

      <!-- ══ TABLA DE LÍNEAS ══ -->
      <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
        <!-- Barra superior con toggle retención -->
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#FFF8F0;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes mr-1"></i> Artículos / Servicios Comprados</span>
          <label class="flex items-center gap-2 cursor-pointer select-none" style="font-size:12px;font-weight:600;color:#374151" title="Modo de captura de retenciones">
            <span id="po-ret-mode-lbl-hdr" style="color:#1A4B8C">Global</span>
            <div style="position:relative;display:inline-block;width:38px;height:20px">
              <input type="checkbox" id="po-ret-mode-switch" style="opacity:0;width:0;height:0;position:absolute" onchange="window.poSetRetMode(this.checked)">
              <span id="po-ret-mode-track" onclick="var sw=document.getElementById('po-ret-mode-switch');sw.checked=!sw.checked;window.poSetRetMode(sw.checked)" style="position:absolute;inset:0;background:#1A4B8C;border-radius:10px;cursor:pointer;transition:background .2s"></span>
              <span id="po-ret-mode-knob" style="position:absolute;height:14px;width:14px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.25)"></span>
            </div>
            <span id="po-ret-mode-lbl-line" style="color:#9CA3AF">Por línea</span>
          </label>
        </div>

        <!-- Tabla con scroll vertical -->
        <div style="overflow-x:auto;max-height:280px;overflow-y:auto">
          <table class="data-table po-lines-tbl" id="po-lines-table" style="min-width:960px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:200px;background:#FFF8F0;color:#374151">Producto / Servicio</th>
                <th class="text-right" style="width:110px;background:#FFF8F0;color:#374151">Cantidad</th>
                <th class="text-right" style="width:155px;background:#FFF8F0;color:#374151">Costo Unit.</th>
                <th class="text-right" style="width:95px;background:#FFF8F0;color:#374151">IVA %</th>
                <th class="text-right po-discount-col" style="width:95px;background:#FFF8F0;color:#374151;display:none">Dscto %</th>
                <th class="po-ret-col" style="min-width:185px;background:#FFF8F0;color:#374151;display:none">Retención</th>
                <th class="po-ret-col text-right" style="width:105px;background:#FFF8F0;color:#374151;display:none">Vlr Ret.</th>
                <th class="text-right" style="width:145px;background:#FFF8F0;color:#374151">Total línea</th>
                <th style="width:78px;background:#FFF8F0;color:#374151">Acciones</th>
              </tr>
            </thead>
            <tbody id="po-lines-body"></tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="border-t p-4" style="border-color:#E5E7EB;background:#F9FAFB">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">

            <!-- Col 1: Subtotal · IVA -->
            <div class="space-y-2">
              <div class="flex justify-between gap-4">
                <span style="color:#6B7280">Subtotal:</span>
                <span id="po-total-sub" class="font-semibold" style="color:#0D2137">$ 0</span>
              </div>
              <div class="flex justify-between gap-4 po-discount-col" style="color:#EF4444;display:none">
                <span class="font-medium">Descuento:</span>
                <span id="po-total-discount" class="font-semibold">-$ 0</span>
              </div>
              <div class="flex justify-between gap-4">
                <span style="color:#6B7280">IVA:</span>
                <span id="po-total-iva" class="font-semibold" style="color:#0D2137">$ 0</span>
              </div>
            </div>

            <!-- Col 2: Retenciones -->
            <div id="po-hdr-ret-wrap" class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span style="color:#6B7280;white-space:nowrap;font-size:11px">ReteFuente:</span>
                <div class="flex items-center gap-1 flex-1 justify-end">
                  <select id="po-hdr-ret-rule-renta" class="form-input text-xs" style="min-width:115px;max-width:150px;height:26px;padding:2px 24px 2px 7px;font-size:11px" onchange="window.poRecalcLine(0)">
                    ${retRuleOptionsRenta(inv?.ret_rule_renta_id || '')}
                  </select>
                  <span id="po-total-ret-renta" class="font-semibold text-orange-600" style="min-width:68px;text-align:right">$ 0</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span style="color:#6B7280;white-space:nowrap;font-size:11px">ReteICA:</span>
                <div class="flex items-center gap-1 flex-1 justify-end">
                  <select id="po-hdr-ret-rule-ica" class="form-input text-xs" style="min-width:115px;max-width:150px;height:26px;padding:2px 24px 2px 7px;font-size:11px" onchange="window.poRecalcLine(0)">
                    ${retRuleOptionsIca(inv?.ret_rule_ica_id || '')}
                  </select>
                  <span id="po-total-ret-ica" class="font-semibold text-orange-600" style="min-width:68px;text-align:right">$ 0</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span style="color:#6B7280;white-space:nowrap;font-size:11px">ReteIVA:</span>
                <div class="flex items-center gap-1 flex-1 justify-end">
                  <select id="po-hdr-ret-rule-iva" class="form-input text-xs" style="min-width:115px;max-width:150px;height:26px;padding:2px 24px 2px 7px;font-size:11px" onchange="window.poRecalcLine(0)">
                    ${retRuleOptionsIva(inv?.ret_rule_iva_id || '')}
                  </select>
                  <span id="po-total-ret-iva" class="font-semibold text-orange-600" style="min-width:68px;text-align:right">$ 0</span>
                </div>
              </div>
              <div class="flex justify-between gap-4 text-orange-600 border-t pt-1" style="border-color:#FED7AA">
                <span class="font-semibold text-xs">Total Retenciones:</span>
                <span id="po-total-ret" class="font-bold">$ 0</span>
              </div>
            </div>

            <!-- Col 3: TOTAL NETO destacado -->
            <div class="flex flex-col justify-end">
              <div class="rounded-xl p-3 text-right" style="background:linear-gradient(135deg,#FFF3E0,#FFF8E1);border:1.5px solid #FFE0B2">
                <p class="text-xs font-bold uppercase tracking-wide mb-1" style="color:#6B7280">Total Neto (CxP)</p>
                <p id="po-total-net" class="text-2xl font-extrabold" style="color:#E65100">$ 0</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-po">
      ${poConfig.operational.immediate_posting 
        ? '<i class="fas fa-check-double mr-1"></i> Guardar y Contabilizar' 
        : '<i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador'}
    </button>
  `;

  (window as any).__poConfig = poConfig;
  (window as any).__poModalOpen = true;
  (window as any).__poFormActive = true;
  (window as any).__poCurrentInvoiceId = invoiceId;
  (window as any).openModal(invoiceId ? 'Editar Factura de Compra' : 'Nueva Compra', formHtml, footer, true);
  const mbox = document.getElementById('modal-box');
  if (mbox) { mbox.classList.add('xl'); mbox.classList.remove('wide'); }

  // Configurar visibilidad de descuentos
  const isDiscountEnabled = poConfig.operational.enable_discounts !== false;
  document.querySelectorAll('.po-discount-col').forEach((el: any) => {
    el.style.display = isDiscountEnabled ? '' : 'none';
  });

  // Manejo de restauración de borrador temporal
  setTimeout(() => {
    const restoreAlert = document.getElementById('po-restore-alert');
    const btnRestoreYes = document.getElementById('btn-po-restore-yes');
    const btnRestoreNo = document.getElementById('btn-po-restore-no');

    if (!invoiceId && !preloadedImportId && !noteConfig) {
      const savedStateStr = localStorage.getItem('temp_purchase_form_state');
      if (savedStateStr) {
        try {
          const savedState = JSON.parse(savedStateStr);
          if ((savedState.lines && savedState.lines.length > 0) || savedState.supplier_id) {
            if (restoreAlert) restoreAlert.style.display = 'flex';
            
            btnRestoreYes?.addEventListener('click', () => {
              restorePurchaseFormState(savedState);
              if (restoreAlert) restoreAlert.style.display = 'none';
            });
            
            btnRestoreNo?.addEventListener('click', () => {
              localStorage.removeItem('temp_purchase_form_state');
              if (restoreAlert) restoreAlert.style.display = 'none';
            });
          }
        } catch (e) {
          localStorage.removeItem('temp_purchase_form_state');
        }
      }
    }
  }, 100);

  // --- AutoComplete de Proveedores ---
  function initPoSupplierSearch() {
    const input = document.getElementById('po-supplier-search') as HTMLInputElement;
    const hidden = document.getElementById('po-supplier') as HTMLInputElement;
    const results = document.getElementById('po-supplier-results');
    if (!input || !hidden || !results) return;

    if (inv && inv.supplier_id) {
      const match = suppliers.find((c: any) => c.id === inv.supplier_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query 
        ? suppliers.slice(0, 30) 
        : suppliers.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(query)).slice(0, 30);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((c: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window.selectPoSupplier('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
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

  (window as any).selectPoSupplier = function(id: string, text: string) {
    const hidden = document.getElementById('po-supplier') as HTMLInputElement;
    const input = document.getElementById('po-supplier-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
      if (typeof (window as any).poSaveTempState === 'function') {
        (window as any).poSaveTempState(invoiceId);
      }
    }
  };

  (window as any).poQuickAddThirdParty = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          suppliers.length = 0;
          suppliers.push(...thirds);
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const nameText = createdRecord.name || '';
          const selectText = docNum ? `${docNum} - ${nameText}` : nameText;
          (window as any).selectPoSupplier(createdRecord.id, selectText);
          (window as any).showToast('Proveedor creado y seleccionado.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar proveedores: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  initPoSupplierSearch();

  // --- Sugerencia Consecutivo Contable Interno ---
  const txTypeSel = document.getElementById('po-tx-type') as HTMLSelectElement;
  const suggestTxNumber = () => {
    if (!txTypeSel) return;
    const txNumberInput = document.getElementById('po-tx-number') as HTMLInputElement;
    if (invoiceId && inv?.tx_number) return;
    const selected = txTypes.find((t: any) => t.id === txTypeSel.value);
    if (!selected) return;
    const next = Number(selected.consecutive || 0) + 1;
    const prefix = selected.prefix || selected.code || 'TX';
    const consecutiveVal = `${prefix}-${String(next).padStart(8, '0')}`;
    (window as any).__poSuggestedTxNumber = consecutiveVal;
  };
  txTypeSel?.addEventListener('change', () => {
    suggestTxNumber();
    if ((window as any).poToggleSupplierRef) (window as any).poToggleSupplierRef(txTypeSel);
  });
  suggestTxNumber();
  if (txTypeSel) (window as any).poToggleSupplierRef(txTypeSel);

  (window as any).poSuggestDueDate = () => {
    const dateInput = document.getElementById('po-date') as HTMLInputElement;
    const dueInput = document.getElementById('po-due-date') as HTMLInputElement;
    if (dateInput && dueInput && poConfig.operational.default_due_days) {
      dueInput.value = addDaysToDateStr(dateInput.value, poConfig.operational.default_due_days);
    }
  };

  // --- Manejo de Líneas ---
  (window as any).addPoLine = function(prod: any = null, preloadedLine: any = null) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('po-lines-body');
    if (!tbody) return;

    const productId   = prod?.id   || preloadedLine?.product_id || '';
    const productCode = prod?.code || '';
    const productName = prod?.name || preloadedLine?._name || '(producto)';
    const initQty     = preloadedLine?.qty        ?? 1;
    const initIva     = preloadedLine?.iva_rate   ?? prod?.iva_rate ?? 0;
    const initPrice   = preloadedLine?.unit_price ?? prod?.cost_price ?? 0;
    const initDisc    = preloadedLine?.discount_rate || preloadedLine?.discount_pct || 0;

    const tr = document.createElement('tr');
    tr.id = `po-row-${idx}`;
    tr.dataset.comment = String(preloadedLine?.description || '').trim();
    tr.innerHTML = `
      <td>
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <span class="text-[10px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(productCode || 'S/C')}]</span>
            <span class="text-xs font-semibold text-gray-800 truncate" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
          </div>
          <input type="hidden" id="pol-prod-id-${idx}" value="${(window as any).esc(productId)}">
        </div>
      </td>
      <td><input type="number" id="pol-qty-${idx}" class="form-input text-right w-full font-bold" style="font-size:13px" min="0.001" step="0.001" value="${initQty}" oninput="window.poRecalcLine(${idx})"></td>
      <td><input type="number" id="pol-price-${idx}" class="form-input text-right w-full" style="font-size:13px" min="0" step="0.01" value="${initPrice || ''}" oninput="window.poRecalcLine(${idx})"></td>
      <td>
        <select id="pol-iva-${idx}" class="form-input text-right w-full" style="font-size:12px" onchange="window.poRecalcLine(${idx})">
          <option value="0"  ${initIva == 0  ? 'selected' : ''}>0 %</option>
          <option value="5"  ${initIva == 5  ? 'selected' : ''}>5 %</option>
          <option value="19" ${initIva == 19 ? 'selected' : ''}>19 %</option>
        </select>
      </td>
      <td class="po-discount-col" style="display:none">
        <input type="number" id="pol-disc-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" max="100" step="0.01" value="${initDisc}" placeholder="0" oninput="window.poRecalcLine(${idx})">
      </td>
      <td class="po-ret-col" style="display:none">
        <select id="pol-ret-rule-${idx}" class="form-input text-xs py-1 w-full" onchange="window.poRecalcLine(${idx})">
          ${retRuleOptions(withholdingRules, preloadedLine?.ret_rule_id || '')}
        </select>
      </td>
      <td class="po-ret-col text-right text-orange-600 font-bold" style="display:none" id="pol-ret-val-${idx}">$ 0</td>
      <td class="text-right font-extrabold" style="color:#1A4B8C;font-size:13px" id="pol-total-${idx}">$ 0</td>
      <td>
        <div class="flex items-center gap-1 justify-center">
          <button type="button" class="btn btn-outline btn-sm" id="pol-comment-btn-${idx}" onclick="window.poEditLineComment(${idx})"><i class="fas fa-comment"></i></button>
          <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('po-row-${idx}').remove(); window.poRecalcLine(0)"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);

    // Visibilidad columnas retención
    const isPerLine = (window as any).__poRetMode === 'line';
    tr.querySelectorAll('.po-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });

    // Visibilidad columnas descuento
    const isDiscountEnabled = (window as any).__poConfig?.operational?.enable_discounts !== false;
    tr.querySelectorAll('.po-discount-col').forEach((el: any) => { el.style.display = isDiscountEnabled ? '' : 'none'; });

    paintLineCommentBtn(idx);
    window.poRecalcLine(idx);
  };

  function paintLineCommentBtn(idx: number) {
    const row = document.getElementById(`po-row-${idx}`);
    const btn = document.getElementById(`pol-comment-btn-${idx}`);
    if (!row || !btn) return;
    const has = !!String(row.dataset.comment || '').trim();
    btn.style.borderColor = has ? '#1A4B8C' : '#D1D5DB';
    btn.style.color = has ? '#1A4B8C' : '#6B7280';
    btn.style.background = has ? '#EEF4FF' : '#fff';
    btn.title = has ? 'Editar comentario' : 'Agregar comentario';
  }

  // --- Comentario de Línea Modal ---
  (window as any).poEditLineComment = function(idx: number) {
    const row = document.getElementById(`po-row-${idx}`);
    if (!row) return;

    let overlay = document.getElementById('po-line-comment-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'po-line-comment-overlay';
      overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:220;align-items:center;justify-content:center;padding:16px';
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:16px;width:100%;max-width:460px;box-shadow:0 20px 50px rgba(0,0,0,.2);overflow:hidden">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F0F0F0">
            <h4 style="font-weight:700;color:#0D2137;font-size:15px"><i class="fas fa-comment-dots mr-2" style="color:#1A4B8C"></i>Comentario de línea</h4>
            <button type="button" id="po-line-comment-close" style="background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
          </div>
          <div style="padding:20px">
            <label class="form-label" for="po-line-comment-text">Descripción personalizada</label>
            <textarea id="po-line-comment-text" class="form-input" rows="4" placeholder="Escribe una descripción o comentario..."></textarea>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #F0F0F0">
            <button type="button" class="btn btn-outline" id="po-line-comment-cancel">Cancelar</button>
            <button type="button" class="btn btn-primary" id="po-line-comment-save"><i class="fas fa-check mr-1"></i>Guardar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }

    const ta = document.getElementById('po-line-comment-text') as HTMLTextAreaElement;
    const close = () => { overlay!.style.display = 'none'; };
    const save = () => {
      const val = String(ta?.value || '').trim();
      row.dataset.comment = val;
      paintLineCommentBtn(idx);
      close();
    };

    if (ta) ta.value = String(row.dataset.comment || '');
    overlay.style.display = 'flex';
    setTimeout(() => ta?.focus(), 40);

    document.getElementById('po-line-comment-close')!.onclick = close;
    document.getElementById('po-line-comment-cancel')!.onclick = close;
    document.getElementById('po-line-comment-save')!.onclick = save;
  };

  // --- Buscador Global de Productos ---
  function initPoGlobalProductSearch() {
    const input = document.getElementById('po-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('po-prod-results-global');
    if (!input || !dropdown) return;

    let highlighted = -1;

    // Registrar callback global para sincronizar hover del mouse
    (window as any).poGlobalSearchHover = (idx: number) => {
      highlighted = idx;
      const items = dropdown.querySelectorAll('.po-gsr-row');
      items.forEach((el: any) => { el.style.background = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
      }
    };

    const renderResults = (filtered: any[]) => {
      if (!filtered.length) {
        dropdown.innerHTML = '<div class="px-4 py-3 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin resultados para esta búsqueda.</div>';
        return;
      }
      dropdown.innerHTML = filtered.map((p: any, i: number) => `
        <button type="button"
          id="po-gsr-item-${i}"
          data-prod-idx="${i}"
          class="w-full text-left px-4 py-2.5 text-xs border-none bg-white cursor-pointer block po-gsr-row"
          style="border-bottom:1px solid #F3F4F6;transition:background .1s"
          onmouseenter="window.poGlobalSearchHover(${i})"
          onmouseleave="this.style.background=''"
          onclick="window.poGlobalSelectProduct(${i})">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[9px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(p.code || 'S/C')}]</span>
              <span class="font-semibold text-gray-800 truncate">${(window as any).esc(p.name)}</span>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0 text-right">
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:#EEF4FF;color:#1A4B8C">IVA ${p.iva_rate ?? 0}%</span>
              <span class="font-extrabold text-blue-600 text-xs">${(window as any).fmt(p.cost_price || 0)}</span>
            </div>
          </div>
        </button>
      `).join('');
      highlighted = -1;
      (window as any).__poGlobalFilteredProds = filtered;
    };

    const highlightItem = (idx: number, items: NodeListOf<Element>) => {
      items.forEach((el: any) => { el.style.background = ''; el.style.fontWeight = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
        (items[idx] as any).scrollIntoView({ block: 'nearest' });
      }
    };

    const handleSearch = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        dropdown.style.display = 'none';
        return;
      }
      const filtered = products.filter((p: any) => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    };

    input.addEventListener('input', handleSearch);
    input.addEventListener('focus', handleSearch);

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      const items = dropdown.querySelectorAll('.po-gsr-row');
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
        if (highlighted >= 0) {
          window.poGlobalSelectProduct(highlighted);
        } else if (items.length > 0) {
          window.poGlobalSelectProduct(0);
        }
      } else if (ev.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    dropdown.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
    });

    input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
  }

  // Cargar líneas existentes (modo edición / nota de ajuste)
  if (existingLines.length) {
    existingLines.forEach((l: any) => {
      const match = products.find((p: any) => p.id === l.product_id);
      if (match) l._name = match.name;
      (window as any).addPoLine(null, l);
    });
  }

  initPoGlobalProductSearch();

  // Inicializar modo de retención (Header / Global por defecto)
  const isLineMode = (window as any).__poRetMode === 'line';
  const switchEl = document.getElementById('po-ret-mode-switch') as HTMLInputElement;
  if (switchEl) switchEl.checked = isLineMode;
  (window as any).poSetRetMode(isLineMode);

  // Escuchar cambios para persistencia temporal
  const triggerStateSave = () => {
    if ((window as any).__poFormActive === true && typeof (window as any).poSaveTempState === 'function') {
      (window as any).poSaveTempState(invoiceId);
    }
  };
  document.getElementById('po-supplier-search')?.addEventListener('input', triggerStateSave);
  document.getElementById('po-date')?.addEventListener('change', triggerStateSave);
  document.getElementById('po-due-date')?.addEventListener('change', triggerStateSave);
  document.getElementById('po-payment-method')?.addEventListener('change', triggerStateSave);
  document.getElementById('po-warehouse')?.addEventListener('change', triggerStateSave);
  document.getElementById('po-tx-type')?.addEventListener('change', triggerStateSave);
  document.getElementById('po-supplier-ref')?.addEventListener('input', triggerStateSave);
  document.getElementById('po-notes')?.addEventListener('input', triggerStateSave);

  // Configurar guardado
  document.getElementById('btn-save-po')?.addEventListener('click', () => savePurchaseDraftWrapper(invoiceId, onDone, inv, noteConfig));
}

// ── Wrapper unificado para Guardado de Compra ─────────────────────────
async function savePurchaseDraftWrapper(invoiceId: string | null, onDone: any = null, inv: any = null, noteConfig: any = null) {
  const poConfig = await getPurchaseConfig();
  const btn = document.getElementById('btn-save-po') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = poConfig.operational.immediate_posting
      ? '<i class="fas fa-spinner fa-spin"></i> Contabilizando...'
      : '<i class="fas fa-spinner fa-spin"></i> Guardando...';
  }

  try {
    const supplierId = (document.getElementById('po-supplier') as HTMLInputElement)?.value;
    const date = (document.getElementById('po-date') as HTMLInputElement)?.value;
    const due = (document.getElementById('po-due-date') as HTMLInputElement)?.value;
    const payMethod = (document.getElementById('po-payment-method') as HTMLSelectElement)?.value;
    const warehouseId = (document.getElementById('po-warehouse') as HTMLSelectElement)?.value;
    const txTypeId = (document.getElementById('po-tx-type') as HTMLSelectElement)?.value;
    const supplierRef = (document.getElementById('po-supplier-ref') as HTMLInputElement)?.value || '';
    let notes = (document.getElementById('po-notes') as HTMLInputElement)?.value || '';

    const dianConcept = document.getElementById('po-dian-concept') as HTMLSelectElement;
    if (dianConcept && !dianConcept.value) {
      throw new Error('Debes seleccionar el concepto de corrección DIAN.');
    }
    if (dianConcept && dianConcept.value) {
      notes = `[Ajuste DIAN: ${dianConcept.value}] ` + notes;
    }

    if (!supplierId) throw new Error('Debes seleccionar un proveedor.');
    if (!date) throw new Error('La fecha de emisión es obligatoria.');
    if (!payMethod) throw new Error('Selecciona la forma de pago.');
    if (!txTypeId) throw new Error('Selecciona el tipo de comprobante contable.');

    const tableRows = document.querySelectorAll('#po-lines-body tr');
    const lines: any[] = [];
    let totalDiscount = 0;

    tableRows.forEach((row: any, lineIdx: number) => {
      const idParts = row.id.split('-');
      const idx = idParts[idParts.length - 1];

      const prodId = (document.getElementById(`pol-prod-id-${idx}`) as HTMLInputElement)?.value;
      const qty = parseFloat((document.getElementById(`pol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const price = parseFloat((document.getElementById(`pol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const ivaRate = parseFloat((document.getElementById(`pol-iva-${idx}`) as HTMLSelectElement)?.value || '0') || 0;
      const discPct = parseFloat((document.getElementById(`pol-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const retRuleId = (window as any).__poRetMode === 'line' ? ((document.getElementById(`pol-ret-rule-${idx}`) as HTMLSelectElement)?.value || '') : '';
      const desc = String(row.dataset.comment || '').trim();

      if (!prodId) throw new Error(`Fila ${lineIdx + 1}: selecciona un producto.`);
      if (qty <= 0) throw new Error(`Fila ${lineIdx + 1}: la cantidad debe ser mayor que cero.`);

      const gross = qty * price;
      const discAmt = gross * (discPct / 100);
      const subtotal = gross - discAmt;
      const iva_amount = subtotal * (ivaRate / 100);
      const total = subtotal + iva_amount;

      totalDiscount += discAmt;

      // Calcular retención de línea si aplica
      let retAmt = 0;
      let retRule: any = null;
      if ((window as any).__poRetMode === 'line' && retRuleId && (window as any).__poRetRulesCache) {
        retRule = (window as any).__poRetRulesCache.find((r: any) => r.id === retRuleId);
        if (retRule && subtotal >= retRule.min_base) {
          retAmt = subtotal * (retRule.rate / 100);
        }
      }

      lines.push({
        product_id: prodId,
        qty,
        unit_price: price,
        iva_rate: ivaRate,
        iva_amount,
        subtotal,
        total,
        description: desc,
        discount_rate: discPct,
        discount_pct: discPct,
        ret_rule_id: retRule ? retRule.id : '',
        ret_concept: retRule ? retRule.concept : '',
        ret_base_type: retRule ? retRule.base_type : '',
        ret_base: retRule ? subtotal : 0,
        ret_rate: retRule ? Number(retRule.rate || 0) : 0,
        ret_amount: retAmt,
        ret_account_code: retRule ? String(retRule.account_code || '') : '',
      });
    });

    if (!lines.length) throw new Error('Agrega al menos una línea a la compra.');

    // Validar exigencia de bodega para bienes
    if (poConfig.operational.require_warehouse_for_goods && !warehouseId) {
      const hasGoods = lines.some(l => {
        const pObj = (window as any).__poProductsCache?.find((p: any) => p.id === l.product_id);
        return pObj?.type === 'BIEN';
      });
      if (hasGoods && !warehouseId) {
        throw new Error('Debes seleccionar la bodega destino para las mercancías.');
      }
    }

    // Calcular retenciones globales en cabecera
    let retTotal = 0;
    let retRuleRenta = '';
    let retRuleIca = '';
    let retRuleIva = '';

    if ((window as any).__poRetMode === 'line') {
      lines.forEach(l => { retTotal += l.ret_amount || 0; });
    } else {
      retRuleRenta = (document.getElementById('po-hdr-ret-rule-renta') as HTMLSelectElement)?.value || '';
      retRuleIca = (document.getElementById('po-hdr-ret-rule-ica') as HTMLSelectElement)?.value || '';
      retRuleIva = (document.getElementById('po-hdr-ret-rule-iva') as HTMLSelectElement)?.value || '';
      const subtotalSum = lines.reduce((s, l) => s + l.subtotal, 0);
      const ivaSum = lines.reduce((s, l) => s + l.iva_amount, 0);

      if (retRuleRenta && (window as any).__poRetRulesCache) {
        const r = (window as any).__poRetRulesCache.find((x: any) => x.id === retRuleRenta);
        if (r && subtotalSum >= r.min_base) retTotal += subtotalSum * (r.rate / 100);
      }
      if (retRuleIca && (window as any).__poRetRulesCache) {
        const r = (window as any).__poRetRulesCache.find((x: any) => x.id === retRuleIca);
        if (r && subtotalSum >= r.min_base) retTotal += subtotalSum * (r.rate / 100);
      }
      if (retRuleIva && (window as any).__poRetRulesCache) {
        const r = (window as any).__poRetRulesCache.find((x: any) => x.id === retRuleIva);
        if (r && ivaSum >= r.min_base) retTotal += ivaSum * (r.rate / 100);
      }
    }

    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const iva_total = lines.reduce((s, l) => s + l.iva_amount, 0);
    const gross = subtotal + iva_total;

    // Asignación de consecutivo de compra
    let number = inv?.number;
    if (!number) {
      const todayStr = date.replaceAll('-', '');
      const rand = String(Date.now()).slice(-4);
      let draftPrefix = 'FC';
      if (txTypeId && (window as any).__poTxTypesCache) {
        const tObj = (window as any).__poTxTypesCache.find((t: any) => t.id === txTypeId);
        if (tObj && tObj.prefix) {
          draftPrefix = tObj.prefix;
        }
      }
      number = `${draftPrefix}-${todayStr}-${rand}`;
    }

    const selectedTxType = (window as any).__poTxTypesCache?.find((t: any) => t.id === txTypeId);
    const txCode = selectedTxType ? String(selectedTxType.code || '').toUpperCase() : '';
    const isDianDoc = txCode === 'DS' || txCode === 'NDS';
    const txNumber = isDianDoc ? 'AUTO' : ((window as any).__poSuggestedTxNumber || 'AUTO');

    // Resolver sucursal activa o por defecto del usuario
    const activeBranchId = localStorage.getItem('active_branch_id');
    const currentUser = (window as any).pb.currentUser;
    const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS')
      ? activeBranchId
      : (currentUser?.default_branch_id || null);

    const header = {
      number,
      date,
      due_date: due || null,
      supplier_id: supplierId,
      supplier_ref: supplierRef.trim(),
      tx_type_id: txTypeId,
      tx_number: txNumber,
      warehouse_id: warehouseId || null,
      notes: notes.trim(),
      subtotal,
      iva_total,
      discount_amount: totalDiscount,
      ret_total: retTotal,
      total: gross,
      payable_total: gross - retTotal,
      ret_rule_renta_id: retRuleRenta,
      ret_rule_ica_id: retRuleIca,
      ret_rule_iva_id: retRuleIva,
      branch_id: inv?.branch_id || targetBranchId || null,
      status: 'draft',
    };

    if (invoiceId) {
      await (window as any).pb.update('purchase_invoices', invoiceId, header);
      const oldLines = await (window as any).pb.listAll('purchase_invoice_lines', { filter: `invoice_id="${(window as any).pb.escapeFilterValue(invoiceId)}"` });
      for (const ol of oldLines) await (window as any).pb.delete('purchase_invoice_lines', ol.id);
      for (let i = 0; i < lines.length; i++) {
        await (window as any).pb.create('purchase_invoice_lines', { invoice_id: invoiceId, line_order: i + 1, ...lines[i] });
      }
      await (window as any).API.logAudit('UPDATE', 'PurchaseInvoice', invoiceId, `Actualizada compra borrador ${number}`);

      if (poConfig.operational.immediate_posting) {
        await (window as any).API.postPurchaseInvoice(invoiceId);
        (window as any).showToast(`Compra ${number} guardada y contabilizada exitosamente`, 'success');
      } else {
        (window as any).showToast('Compra borrador actualizada', 'success');
      }
    } else {
      const payload = { ...header };
      if (inv?.dian_resolution_id) {
        (payload as any).dian_resolution_id = inv.dian_resolution_id;
      }
      const newInv = await (window as any).API.createPurchaseInvoice(payload, lines);

      if (poConfig.operational.immediate_posting) {
        await (window as any).API.postPurchaseInvoice(newInv.id);
        (window as any).showToast(`Nueva compra ${newInv.number || number} guardada y contabilizada exitosamente`, 'success');
      } else {
        (window as any).showToast('Nueva compra guardada en borrador', 'success');
      }
    }

    localStorage.removeItem('temp_purchase_form_state');
    (window as any).__poFormActive = false;
    (window as any).closeModal();
    if (typeof onDone === 'function') onDone();
  } catch (err: any) {
    (window as any).showToast(err.response?.message || err.message || 'Error al guardar la compra', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = poConfig.operational.immediate_posting ? '<i class="fas fa-check-double mr-1"></i> Guardar y Contabilizar' : '<i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador';
    }
  }
}

// ── Acciones Globales del Módulo ──────────────────────────────────────
async function viewPurchaseDetail(id: string) {
  try {
    const [inv, lines, history] = await Promise.all([
      (window as any).pb.get('purchase_invoices', id, { expand: 'supplier_id,warehouse_id' }),
      (window as any).API.getPurchaseInvoiceLines(id),
      (window as any).can('canViewAudit')
        ? (window as any).API.getAuditLogs({ entity: 'PurchaseInvoice', entityId: id, actions: ['REOPEN', 'VOID'], limit: 20 }).catch(() => [])
        : Promise.resolve([]),
    ]);
    const mutationCheck = inv.status === 'posted'
      ? await (window as any).API.getPurchaseMutationBlocks(id).catch(() => ({ blocks: [], details: {} }))
      : { blocks: [], details: {} };
    const meta = PO_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
    const sup  = inv.expand?.supplier_id;
    const wh   = inv.expand?.warehouse_id;

    const historyHtml = (window as any).can('canViewAudit') ? `
      <div class="mt-5 rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-clock-rotate-left mr-2"></i>Historial de auditoría</h4>
          <span class="text-xs" style="color:#6B7280">Historial del documento</span>
        </div>
        ${history.length
          ? `<div class="space-y-2">
              ${history.map((h: any) => `
                <div class="rounded-lg border px-3 py-2" style="border-color:#E5E7EB;background:#fff">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold" style="color:#1A4B8C">${(window as any).esc(h.action || 'EVENTO')}</span>
                    <span class="text-xs" style="color:#6B7280">${(window as any).esc(fmtPurchaseAuditDate(h.created || h.createdAt || h.date || ''))}</span>
                  </div>
                  <p class="text-sm mt-1" style="color:#374151">${(window as any).esc(h.description || h.notes || 'Sin detalle')}</p>
                </div>`).join('')}
             </div>`
          : `<p class="text-sm" style="color:#6B7280">No hay eventos registrados de reapertura o anulación.</p>`}
      </div>`
      : '';

    const blockerHtml = inv.status === 'posted' && mutationCheck.blocks.length ? `
      <div class="mt-4 p-4 rounded-xl text-sm" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B">
        <div class="font-semibold mb-2"><i class="fas fa-shield-halved mr-2"></i>Bloqueo de reapertura/anulación</div>
        ${mutationCheck.blocks.map((msg: string) => `<p class="mb-1">• ${(window as any).esc(msg)}</p>`).join('')}
      </div>` : '';

    const bodyHtml = `
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-5">
        <div><span class="form-label font-bold text-gray-500">Número</span><p class="font-mono font-semibold text-blue-700">${(window as any).esc(inv.number)}</p></div>
        <div><span class="form-label font-bold text-gray-500">Estado</span><p><span class="badge ${meta.badge}">${meta.label}</span></p></div>
        <div><span class="form-label font-bold text-gray-500">Fecha</span><p>${(window as any).esc(inv.date)}</p></div>
        <div><span class="form-label font-bold text-gray-500">Proveedor</span><p>${sup ? (window as any).esc(sup.name) : '—'}</p></div>
        <div><span class="form-label font-bold text-gray-500">Ref. proveedor</span><p>${(window as any).esc(inv.supplier_ref || '—')}</p></div>
        <div><span class="form-label font-bold text-gray-500">Bodega destino</span><p>${wh ? (window as any).esc(wh.name) : '—'}</p></div>
        ${inv.due_date ? `<div><span class="form-label font-bold text-gray-500">Vencimiento</span><p>${(window as any).esc(inv.due_date)}</p></div>` : ''}
        ${inv.notes ? `<div class="md:col-span-3"><span class="form-label font-bold text-gray-500">Notas</span><p>${(window as any).esc(inv.notes)}</p></div>` : ''}
      </div>

      <div class="border rounded-xl overflow-hidden mb-4" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto / Servicio</th><th>Descripción</th><th class="text-right">Cant.</th><th class="text-right">P. Unit.</th><th class="text-right">IVA %</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${lines.map((l: any) => {
              const p = l.expand?.product_id;
              const a = l.expand?.account_id;
              return `<tr>
                <td>${p ? `<span class="font-mono text-xs mr-1 text-blue-600">[${(window as any).esc(p.code)}]</span>${(window as any).esc(p.name)}` : (a ? `${(window as any).esc(a.code)} ${(window as any).esc(a.name)}` : '—')}</td>
                <td class="text-sm text-gray-500">${(window as any).esc(l.description || '—')}</td>
                <td class="text-right font-mono">${(window as any).fmtN(l.qty)}</td>
                <td class="text-right font-mono">${(window as any).fmt(l.unit_price)}</td>
                <td class="text-right">${l.iva_rate ? l.iva_rate + '%' : '0%'}</td>
                <td class="text-right font-semibold text-blue-900 font-mono">${(window as any).fmt(l.total)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="flex justify-end">
        <div class="text-sm space-y-1 min-w-56">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span><span class="font-semibold font-mono">${(window as any).fmt((inv.subtotal || 0) + (inv.discount_amount || 0))}</span></div>
          ${inv.discount_amount ? `<div class="flex justify-between gap-8" style="color:#EF4444"><span class="font-medium">Descuento:</span><span class="font-semibold font-mono">-${(window as any).fmt(inv.discount_amount)}</span></div>` : ''}
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span><span class="font-semibold font-mono">${(window as any).fmt(inv.iva_total||0)}</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Retenciones:</span><span class="font-semibold font-mono text-orange-600">${(window as any).fmt(inv.ret_total||0)}</span></div>
          <div class="flex justify-between gap-8 border-t pt-2 text-base" style="border-color:#E5E7EB"><span class="font-bold text-gray-800">TOTAL CxP:</span><span class="font-bold text-orange-700 font-mono">${(window as any).fmt(inv.payable_total || inv.total || 0)}</span></div>
        </div>
      </div>
      ${inv.tx_id ? `<div class="mt-4 p-3 rounded-xl text-sm" style="background:#EEF4FF;color:#2446B8"><i class="fas fa-book-open mr-2"></i>Asiento contable generado: <button class="font-semibold underline cursor-pointer" onclick="closeModal(); setTimeout(() => window.seeTxDetail('${(window as any).esc(inv.tx_id)}'), 300)">Ver asiento</button></div>` : ''}
      ${blockerHtml}
      ${historyHtml}
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      ${inv.status === 'draft' && (window as any).can('canApprove') ? `<button class="btn btn-primary" onclick="closeModal(); window.contabilizarCompra('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-check"></i> Contabilizar</button>` : ''}
      ${inv.status === 'posted' && (window as any).requireRole('admin') ? `<button class="btn btn-outline" style="border-color:#D97706;color:#D97706" onclick="closeModal(); window.reopenPurchase('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-rotate-left"></i> Reabrir</button>` : ''}
      ${inv.status === 'posted' && (window as any).can('canDelete') ? `<button class="btn btn-danger" onclick="closeModal(); window.voidPurchase('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}', 'posted')"><i class="fas fa-ban"></i> Anular</button>` : ''}
    `;

    (window as any).openModal(`Detalle Factura de Compra — ${(window as any).esc(inv.number)}`, bodyHtml, footer, true);
  } catch (err: any) {
    (window as any).showToast(err.response?.message || err.message, 'error');
  }
}

function editPurchase(id: string) {
  openPurchaseForm(id, () => renderCompras(document.getElementById('page-content')!));
}

function contabilizarCompra(id: string, number: string) {
  if (!(window as any).can('canApprove')) return (window as any).showToast('Solo el contador o administrador pueden contabilizar.', 'error');
  (window as any).confirmDialog(
    'Contabilizar Factura de Compra / Documento Soporte',
    `¿Confirmas contabilizar la compra <strong>${(window as any).esc(number)}</strong>?<br><br>
     Se generará automáticamente:<br>
     • Un asiento contable en estado <em>Borrador</em> para su revisión/aprobación<br>
     • Un movimiento de inventario <em>ENTRADA</em> para los bienes físicos`,
    async () => {
      try {
        const { inv, tx } = await (window as any).API.postPurchaseInvoice(id);
        (window as any).showToast(`Factura ${inv.number} contabilizada exitosamente. Asiento ${tx.number} generado (borrador).`, 'success');
        renderCompras(document.getElementById('page-content')!);
      } catch (err: any) {
        (window as any).showToast(err.response?.message || err.message, 'error');
      }
    }
  );
}

function reopenPurchase(id: string, number: string) {
  if (!(window as any).requireRole('admin')) return (window as any).showToast('Solo el administrador puede reabrir compras contabilizadas', 'error');
  openPurchaseReasonDialog(
    {
      title: 'Reabrir Compra para Corrección',
      messageHtml: `
        <p>Se reabrirá la factura <strong>${(window as any).esc(number)}</strong> y el sistema hará lo siguiente:</p>
        <p class="mt-2">• Anulará el asiento contable vinculado</p>
        <p>• Revertirá el movimiento de inventario asociado</p>
        <p>• Dejará la compra en <em>Borrador</em> para corrección y nueva contabilización</p>`,
      actionLabel: 'Reabrir compra',
      actionClass: 'btn-outline',
      placeholder: 'Explica el motivo de la reapertura aprobada por el administrador',
    },
    async (reason: string) => {
      await (window as any).API.reopenPurchaseInvoice(id, reason);
      (window as any).showToast(`Factura ${number} reabierta en borrador. Se revirtieron contabilidad e inventario.`, 'success');
      renderCompras(document.getElementById('page-content')!);
    }
  );
}

function voidPurchase(id: string, number: string, status = 'draft') {
  if (!(window as any).can('canDelete')) return (window as any).showToast('No tienes permisos para anular documentos.', 'error');
  openPurchaseReasonDialog(
    {
      title: 'Anular Compra',
      messageHtml: status === 'posted'
        ? `
          <p>Se anulará la factura <strong>${(window as any).esc(number)}</strong>.</p>
          <p class="mt-2">Para conservar trazabilidad el sistema también anulará el asiento contable y revertirá el movimiento de inventario asociado.</p>`
        : `<p>Vas a anular la factura <strong>${(window as any).esc(number)}</strong>. Esta acción dejará el documento inválido para operación.</p>`,
      actionLabel: 'Anular compra',
      actionClass: 'btn-danger',
      placeholder: 'Explica el motivo de la anulación',
    },
    async (reason: string) => {
      await (window as any).API.voidPurchaseInvoice(id, reason);
      (window as any).showToast(status === 'posted' ? 'Compra anulada. Se revirtieron contabilidad e inventario.' : 'Compra anulada', 'success');
      renderCompras(document.getElementById('page-content')!);
    }
  );
}

// ── KPI helper ────────────────────────────────────────────────────────────────
function poKpi(label: string, value: any, icon: string, color: string, bg: string) {
  return `<div class="rounded-2xl p-4" style="background:${bg}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${icon} text-sm" style="color:${color}"></i>
      <span class="text-xs font-semibold" style="color:${color}">${label}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${color}">${value}</p>
  </div>`;
}

// ── Notas de Ajuste en Compras ────────────────────────────────────────────────
(window as any).openPurchaseNotePreModal = async (purchaseId: string, purchaseNum: string) => {
  let inv: any;
  try {
    inv = await (window as any).pb.get('purchase_invoices', purchaseId, { expand: 'tx_type_id' });
  } catch (err) {
    return (window as any).showToast('No se pudo cargar la factura de compra', 'error');
  }

  if (!inv.tx_id) {
    return (window as any).showToast('La compra no está contabilizada. Genera el comprobante primero.', 'warning');
  }

  const isDS = inv.expand?.tx_type_id?.code === 'DS';
  const defaultNoteType = isDS ? 'NDS' : 'NC'; // NC o CM o NDS

  const html = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="p-3 rounded bg-orange-50 text-orange-800 text-sm border border-orange-200">
        <i class="fas fa-info-circle mr-1"></i> Generar ajuste / nota para la compra <strong>${(window as any).esc(purchaseNum)}</strong>.
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Nota</label>
        <select id="pre-note-type" class="form-input" onchange="window.updatePurchasePreNoteResolutions(this.value)">
          ${isDS 
            ? `<option value="NDS" selected>Nota de Ajuste a Documento Soporte (NDS)</option>` 
            : `<option value="NC" selected>Nota Crédito de Compra (NC)</option>
               <option value="ND">Nota Débito de Compra (ND)</option>`}
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
    <button class="btn btn-primary" onclick="window.continueToPurchaseNoteForm('${(window as any).esc(inv.id)}')">Continuar <i class="fas fa-arrow-right ml-1"></i></button>
  `;

  (window as any).openModal('Asistente de Ajustes de Compras (Notas)', html, footer, false);

  (window as any).updatePurchasePreNoteResolutions = async (type: string) => {
    const sel = document.getElementById('pre-note-resolution') as HTMLSelectElement;
    if (!sel) return;
    sel.innerHTML = '<option value="">Cargando...</option>';
    try {
      const resolutions = await (window as any).pb.listAll('dian_resolutions', { filter: `active=true && document_type="${type}"` }).catch(() => []);
      if (resolutions.length) {
        sel.innerHTML = resolutions.map((r: any) => `<option value="${r.id}">${r.prefix || ''} - ${r.resolution_number ? 'Res. ' + r.resolution_number : 'Interna'}</option>`).join('');
      } else {
        sel.innerHTML = '<option value="">Generación Automática (Según prefijo del tipo contable)</option>';
      }
    } catch {
      sel.innerHTML = '<option value="">Generación Automática</option>';
    }
  };

  (window as any).updatePurchasePreNoteResolutions(defaultNoteType);

  (window as any).continueToPurchaseNoteForm = async (pId: string) => {
    const type = (document.getElementById('pre-note-type') as HTMLSelectElement)?.value || defaultNoteType;
    const resId = (document.getElementById('pre-note-resolution') as HTMLSelectElement)?.value || '';
    (window as any).closeModal();

    window.openPurchaseForm(null, () => (window as any)._loadComprasPage(document.getElementById('page-content')!), null, { originalInvoiceId: pId, type, resolutionId: resId, originalInvoiceNum: purchaseNum });
  };
};

// --- Funciones de Compras a Nivel de Módulo ---
function poToggleSupplierRef(selectEl: HTMLSelectElement) {
  const opt = selectEl.options[selectEl.selectedIndex];
  const code = opt ? opt.getAttribute('data-code') : '';
  const refWrap = document.getElementById('po-supplier-ref-wrap');
  if (code === 'DS' || code === 'NDS') {
    if (refWrap) refWrap.style.display = 'none';
    const refInp = document.getElementById('po-supplier-ref') as HTMLInputElement;
    if (refInp) refInp.value = '';
  } else {
    if (refWrap) refWrap.style.display = 'block';
  }
}

function poGlobalSelectProduct(idx: number) {
  const filtered: any[] = (window as any).__poGlobalFilteredProds || [];
  const prod = filtered[idx];
  if (!prod) return;
  (window as any).addPoLine(prod, null);
  const input = document.getElementById('po-prod-search-global') as HTMLInputElement;
  const dropdown = document.getElementById('po-prod-results-global');
  if (input) { input.value = ''; input.focus(); }
  if (dropdown) dropdown.style.display = 'none';
  const tableWrap = document.querySelector('#po-lines-table')?.closest('div[style*="overflow"]') as HTMLElement;
  if (tableWrap) setTimeout(() => { tableWrap.scrollTop = tableWrap.scrollHeight; }, 50);
}

function poRecalcLine(targetIdx: number = 0) {
  let subtotalSum = 0;
  let ivaSum = 0;
  let retSum = 0;
  let totalDiscount = 0;

  const rows = document.querySelectorAll('#po-lines-body tr');
  rows.forEach((row: any) => {
    const idParts = row.id.split('-');
    const idx = idParts[idParts.length - 1];

    const qty = parseFloat((document.getElementById(`pol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const price = parseFloat((document.getElementById(`pol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const ivaRate = parseFloat((document.getElementById(`pol-iva-${idx}`) as HTMLSelectElement)?.value || '0') || 0;
    const discPct = parseFloat((document.getElementById(`pol-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const retRuleId = (window as any).__poRetMode === 'line' ? ((document.getElementById(`pol-ret-rule-${idx}`) as HTMLSelectElement)?.value || '') : '';

    const gross = qty * price;
    const discAmt = gross * (discPct / 100);
    const sub = gross - discAmt;
    const ivaVal = sub * (ivaRate / 100);
    const total = sub + ivaVal;

    subtotalSum += sub;
    ivaSum += ivaVal;
    totalDiscount += discAmt;

    const totalEl = document.getElementById(`pol-total-${idx}`);
    if (totalEl) totalEl.textContent = (window as any).fmt(total);

    // Si es retención por línea
    if ((window as any).__poRetMode === 'line') {
      let lineRet = 0;
      if (retRuleId && (window as any).__poRetRulesCache) {
        const rule = (window as any).__poRetRulesCache.find((r: any) => r.id === retRuleId);
        if (rule && sub >= rule.min_base) {
          lineRet = sub * (rule.rate / 100);
        }
      }
      retSum += lineRet;
      const lineRetEl = document.getElementById(`pol-ret-val-${idx}`);
      if (lineRetEl) lineRetEl.textContent = lineRet > 0 ? (window as any).fmt(lineRet) : '—';
    }
  });

  // Calcular retenciones globales si corresponde
  let reteRentaVal = 0;
  let reteIcaVal = 0;
  let reteIvaVal = 0;

  if ((window as any).__poRetMode === 'header') {
    const payMethod = (document.getElementById('po-payment-method') as HTMLSelectElement)?.value;
    if (payMethod === 'CREDITO' || payMethod === 'TRANSFERENCIA' || payMethod === 'EFECTIVO') {
      const retRuleRenta = (document.getElementById('po-hdr-ret-rule-renta') as HTMLSelectElement)?.value || '';
      const retRuleIca = (document.getElementById('po-hdr-ret-rule-ica') as HTMLSelectElement)?.value || '';
      const retRuleIva = (document.getElementById('po-hdr-ret-rule-iva') as HTMLSelectElement)?.value || '';

      if (retRuleRenta && (window as any).__poRetRulesCache) {
        const r = (window as any).__poRetRulesCache.find((x: any) => x.id === retRuleRenta);
        if (r && subtotalSum >= r.min_base) reteRentaVal = subtotalSum * (r.rate / 100);
      }
      if (retRuleIca && (window as any).__poRetRulesCache) {
        const r = (window as any).__poRetRulesCache.find((x: any) => x.id === retRuleIca);
        if (r && subtotalSum >= r.min_base) reteIcaVal = subtotalSum * (r.rate / 100);
      }
      if (retRuleIva && (window as any).__poRetRulesCache) {
        const r = (window as any).__poRetRulesCache.find((x: any) => x.id === retRuleIva);
        if (r && ivaSum >= r.min_base) reteIvaVal = ivaSum * (r.rate / 100);
      }
    }
    retSum = reteRentaVal + reteIcaVal + reteIvaVal;

    const rrEl = document.getElementById('po-total-ret-renta');
    if (rrEl) rrEl.textContent = (window as any).fmt(reteRentaVal);
    const riEl = document.getElementById('po-total-ret-ica');
    if (riEl) riEl.textContent = (window as any).fmt(reteIcaVal);
    const rvEl = document.getElementById('po-total-ret-iva');
    if (rvEl) rvEl.textContent = (window as any).fmt(reteIvaVal);
  }

  const netVal = subtotalSum + ivaSum - retSum;

  const subEl = document.getElementById('po-total-sub');
  if (subEl) subEl.textContent = (window as any).fmt(subtotalSum + totalDiscount);
  const discEl = document.getElementById('po-total-discount');
  if (discEl) discEl.textContent = `-${(window as any).fmt(totalDiscount)}`;
  const ivaEl = document.getElementById('po-total-iva');
  if (ivaEl) ivaEl.textContent = (window as any).fmt(ivaSum);
  const retEl = document.getElementById('po-total-ret');
  if (retEl) retEl.textContent = (window as any).fmt(retSum);
  const netEl = document.getElementById('po-total-net');
  if (netEl) netEl.textContent = (window as any).fmt(netVal);

  if ((window as any).__poFormActive === true) {
    poSaveTempState((window as any).__poCurrentInvoiceId);
  }
}

function poSaveTempState(invoiceId: string | null) {
  if (!(window as any).__poFormActive) return;

  const supplierId = (document.getElementById('po-supplier') as HTMLInputElement)?.value || '';
  const supplierSearch = (document.getElementById('po-supplier-search') as HTMLInputElement)?.value || '';
  const date = (document.getElementById('po-date') as HTMLInputElement)?.value || '';
  const due = (document.getElementById('po-due-date') as HTMLInputElement)?.value || '';
  const payMethod = (document.getElementById('po-payment-method') as HTMLSelectElement)?.value || '';
  const warehouseId = (document.getElementById('po-warehouse') as HTMLSelectElement)?.value || '';
  const txTypeId = (document.getElementById('po-tx-type') as HTMLSelectElement)?.value || '';
  const supplierRef = (document.getElementById('po-supplier-ref') as HTMLInputElement)?.value || '';
  const notes = (document.getElementById('po-notes') as HTMLInputElement)?.value || '';

  const retMode = (window as any).__poRetMode || 'header';
  const retRuleRenta = (document.getElementById('po-hdr-ret-rule-renta') as HTMLSelectElement)?.value || '';
  const retRuleIca = (document.getElementById('po-hdr-ret-rule-ica') as HTMLSelectElement)?.value || '';
  const retRuleIva = (document.getElementById('po-hdr-ret-rule-iva') as HTMLSelectElement)?.value || '';

  const tableRows = document.querySelectorAll('#po-lines-body tr');
  const lines: any[] = [];

  tableRows.forEach((row: any) => {
    const idParts = row.id.split('-');
    const idx = idParts[idParts.length - 1];

    const prodId = (document.getElementById(`pol-prod-id-${idx}`) as HTMLInputElement)?.value;
    const qty = parseFloat((document.getElementById(`pol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const price = parseFloat((document.getElementById(`pol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const ivaRate = parseFloat((document.getElementById(`pol-iva-${idx}`) as HTMLSelectElement)?.value || '0') || 0;
    const discPct = parseFloat((document.getElementById(`pol-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const retRuleId = (document.getElementById(`pol-ret-rule-${idx}`) as HTMLSelectElement)?.value || '';
    const desc = String(row.dataset.comment || '').trim();

    if (prodId) {
      const pObj = (window as any).__poProductsCache?.find((p: any) => p.id === prodId);
      const name = pObj ? pObj.name : '(producto)';
      lines.push({
        product_id: prodId,
        _name: name,
        qty,
        unit_price: price,
        iva_rate: ivaRate,
        discount_rate: discPct,
        discount_pct: discPct,
        ret_rule_id: retRuleId,
        description: desc
      });
    }
  });

  const state = {
    invoiceId,
    supplier_id: supplierId,
    supplier_search: supplierSearch,
    date,
    due_date: due,
    payment_method: payMethod,
    warehouse_id: warehouseId,
    tx_type_id: txTypeId,
    supplier_ref: supplierRef,
    notes,
    ret_mode: retMode,
    ret_rule_renta_id: retRuleRenta,
    ret_rule_ica_id: retRuleIca,
    ret_rule_iva_id: retRuleIva,
    lines
  };

  localStorage.setItem('temp_purchase_form_state', JSON.stringify(state));
}

function restorePurchaseFormState(state: any) {
  if (!state) return;

  const supplierHidden = document.getElementById('po-supplier') as HTMLInputElement;
  const supplierSearch = document.getElementById('po-supplier-search') as HTMLInputElement;
  if (supplierHidden && supplierSearch) {
    supplierHidden.value = state.supplier_id || '';
    supplierSearch.value = state.supplier_search || '';
  }

  const dateInput = document.getElementById('po-date') as HTMLInputElement;
  if (dateInput && state.date) dateInput.value = state.date;

  const dueInput = document.getElementById('po-due-date') as HTMLInputElement;
  if (dueInput && state.due_date) dueInput.value = state.due_date;

  const paySelect = document.getElementById('po-payment-method') as HTMLSelectElement;
  if (paySelect && state.payment_method) paySelect.value = state.payment_method;

  const whSelect = document.getElementById('po-warehouse') as HTMLSelectElement;
  if (whSelect && state.warehouse_id) whSelect.value = state.warehouse_id;

  const txSelect = document.getElementById('po-tx-type') as HTMLSelectElement;
  if (txSelect && state.tx_type_id) {
    txSelect.value = state.tx_type_id;
    if ((window as any).poToggleSupplierRef) (window as any).poToggleSupplierRef(txSelect);
  }

  const refInput = document.getElementById('po-supplier-ref') as HTMLInputElement;
  if (refInput && state.supplier_ref) refInput.value = state.supplier_ref;

  const notesInput = document.getElementById('po-notes') as HTMLInputElement;
  if (notesInput && state.notes) notesInput.value = state.notes;

  const tbody = document.getElementById('po-lines-body');
  if (tbody) tbody.innerHTML = '';

  if (Array.isArray(state.lines)) {
    state.lines.forEach((l: any) => {
      const pObj = (window as any).__poProductsCache?.find((p: any) => p.id === l.product_id);
      const prod = pObj ? { ...pObj } : { id: l.product_id, name: l._name };
      (window as any).addPoLine(prod, l);
    });
  }

  const retMode = state.ret_mode || 'header';
  const isLineMode = retMode === 'line';
  (window as any).__poRetMode = retMode;

  const switchEl = document.getElementById('po-ret-mode-switch') as HTMLInputElement;
  if (switchEl) switchEl.checked = isLineMode;

  const ruleRenta = document.getElementById('po-hdr-ret-rule-renta') as HTMLSelectElement;
  if (ruleRenta && state.ret_rule_renta_id) ruleRenta.value = state.ret_rule_renta_id;

  const ruleIca = document.getElementById('po-hdr-ret-rule-ica') as HTMLSelectElement;
  if (ruleIca && state.ret_rule_ica_id) ruleIca.value = state.ret_rule_ica_id;

  const ruleIva = document.getElementById('po-hdr-ret-rule-iva') as HTMLSelectElement;
  if (ruleIva && state.ret_rule_iva_id) ruleIva.value = state.ret_rule_iva_id;

  (window as any).poSetRetMode(isLineMode);
}

function poSetRetMode(isPerLine: boolean) {
  (window as any).__poRetMode = isPerLine ? 'line' : 'header';
  document.querySelectorAll('.po-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });
  const hdrWrap = document.getElementById('po-hdr-ret-wrap');
  if (hdrWrap) hdrWrap.style.display = isPerLine ? 'none' : '';
  const knob  = document.getElementById('po-ret-mode-knob');
  if (knob)  knob.style.transform = isPerLine ? 'translateX(18px)' : '';
  const track = document.getElementById('po-ret-mode-track');
  if (track) track.style.background = isPerLine ? '#6B7280' : '#1A4B8C';
  const lblHdr  = document.getElementById('po-ret-mode-lbl-hdr');
  if (lblHdr)  lblHdr.style.color  = isPerLine ? '#9CA3AF' : '#1A4B8C';
  const lblLine = document.getElementById('po-ret-mode-lbl-line');
  if (lblLine) lblLine.style.color = isPerLine ? '#1A4B8C' : '#9CA3AF';
  
  (window as any).poRecalcLine(0);
}

// --- Inyecciones Globales ---
(window as any).renderCompras = renderCompras;
(window as any).openPurchaseForm = openPurchaseForm;
(window as any).viewPurchaseDetail = viewPurchaseDetail;
(window as any).editPurchase = editPurchase;
(window as any).contabilizarCompra = contabilizarCompra;
(window as any).reopenPurchase = reopenPurchase;
(window as any).voidPurchase = voidPurchase;
(window as any)._loadComprasPage = _loadComprasPage;
(window as any).openPurchaseSettingsModal = openPurchaseSettingsModal;
(window as any).savePurchaseConfig = savePurchaseConfig;
(window as any).defaultPurchaseConfig = defaultPurchaseConfig;
(window as any).normalizePurchaseConfig = normalizePurchaseConfig;
(window as any).getPurchaseConfig = getPurchaseConfig;
(window as any).PURCHASE_CONFIG_KEY = PURCHASE_CONFIG_KEY;
(window as any).PO_STATUS = PO_STATUS;
(window as any).PO_PRODUCT_TYPES = PO_PRODUCT_TYPES;
(window as any).PO_PRODUCT_UNITS = PO_PRODUCT_UNITS;
(window as any).PO_IVA_RATES = PO_IVA_RATES;
(window as any).poKpi = poKpi;
(window as any).addDaysToDateStr = addDaysToDateStr;
(window as any).fmtPurchaseAuditDate = fmtPurchaseAuditDate;
(window as any).filterPoTable = filterPoTable;
(window as any).poToggleSupplierRef = poToggleSupplierRef;
(window as any).poGlobalSelectProduct = poGlobalSelectProduct;
(window as any).poRecalcLine = poRecalcLine;
(window as any).poSetRetMode = poSetRetMode;
(window as any).poSaveTempState = poSaveTempState;
(window as any).restorePurchaseFormState = restorePurchaseFormState;
