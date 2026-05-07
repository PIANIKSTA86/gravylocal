/**
 * GRAVY v2.0 — compras.js
 * Módulo de Compras de Bienes y Servicios.
 * - Facturas de compra con aplicación contable automática (asiento FC)
 * - Integración de inventario: genera movimiento ENTRADA para bienes
 * - Flujo: Borrador → Contabilizar → Asiento FC (draft) → Aprobación contador
 */
'use strict';

const PO_STATUS = {
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

function defaultPurchaseConfig() {
  return {
    operational: {
      allow_services_without_product: true,
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

function normalizePurchaseConfig(raw) {
  const base = defaultPurchaseConfig();
  const op = raw?.operational || {};
  const ac = raw?.accounting || {};
  const acc = ac?.accounts || {};
  const rawIvaByRate = (acc.iva_by_rate && typeof acc.iva_by_rate === 'object') ? acc.iva_by_rate : {};
  const ivaByRate = {};
  Object.keys(rawIvaByRate).forEach((k) => {
    const rateKey = String(k).trim();
    if (!rateKey) return;
    ivaByRate[rateKey] = String(rawIvaByRate[k] || '').trim();
  });
  if (!Object.keys(ivaByRate).length) {
    // Compatibilidad con esquema anterior de una sola cuenta de IVA.
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

  if (!normalizedRules.length) {
    const legacyRules = [];
    const legacyMap = [
      ['RETERENTA', acc.reterenta_code],
      ['RETEIVA', acc.reteiva_code],
      ['RETEICA', acc.reteica_code],
    ];
    legacyMap.forEach(([concept, accountCode], idx) => {
      const code = String(accountCode || '').trim();
      if (!code) return;
      legacyRules.push({
        id: `wr-legacy-${idx}`,
        concept,
        base_type: 'SUBTOTAL',
        min_base: 0,
        rate: concept === 'RETEICA' ? 0.414 : (concept === 'RETEIVA' ? 15 : 3.5),
        account_code: code,
      });
    });
    if (legacyRules.length) normalizedRules.push(...legacyRules);
  }

  return {
    operational: {
      allow_services_without_product: op.allow_services_without_product !== false,
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
    const raw = await API.getSetting(PURCHASE_CONFIG_KEY);
    if (!raw) return defaultPurchaseConfig();
    return normalizePurchaseConfig(JSON.parse(raw));
  } catch {
    return defaultPurchaseConfig();
  }
}

async function savePurchaseConfig(cfg) {
  const normalized = normalizePurchaseConfig(cfg || {});
  await API.setSetting(PURCHASE_CONFIG_KEY, JSON.stringify(normalized));
  await API.logAudit('CONFIG', 'PurchaseConfig', null, 'Configuracion de compras actualizada');
  return normalized;
}

function addDaysToDateStr(dateStr, days) {
  if (!dateStr || !days) return dateStr || '';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + Number(days || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

async function openPurchaseSettingsModal(onSaved = null) {
  try {
    const [cfg, accounts] = await Promise.all([
      getPurchaseConfig(),
      API.getAccounts(true),
    ]);
    const accountOptions = (selectedCode = '') => {
      const rows = accounts
        .filter(a => a.active && Number(a.level) >= 3)
        .sort((a, b) => a.code.localeCompare(b.code));
      return `<option value="">— Sin definir —</option>${rows.map(a => `<option value="${esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${esc(a.code)} — ${esc(a.name)}</option>`).join('')}`;
    };
    const initialIvaRates = Array.from(new Set([
      ...PO_IVA_RATES.map(r => String(r)),
      ...Object.keys(cfg.accounting.accounts.iva_by_rate || {}),
    ])).sort((a, b) => Number(a) - Number(b));

    openModal(
      'Configuración de Compras',
      `<div class="space-y-5">
        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-sliders mr-2"></i>Parámetros operativos</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Define opciones habilitadas para el registro de compras.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label class="inline-flex items-center gap-2"><input id="po-cfg-svc-no-product" type="checkbox" ${cfg.operational.allow_services_without_product ? 'checked' : ''}>Permitir servicios sin producto (solo cuenta)</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-req-wh" type="checkbox" ${cfg.operational.require_warehouse_for_goods ? 'checked' : ''}>Exigir bodega cuando hay bienes</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-discount" type="checkbox" ${cfg.operational.enable_discounts ? 'checked' : ''}>Habilitar descuentos</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-freight" type="checkbox" ${cfg.operational.enable_freight ? 'checked' : ''}>Habilitar fletes</label>
            <label class="inline-flex items-center gap-2"><input id="po-cfg-withholding" type="checkbox" ${cfg.operational.enable_withholdings ? 'checked' : ''}>Habilitar retenciones</label>
            <div class="form-group mb-0">
              <label class="form-label">Plazo por defecto (días)</label>
              <input id="po-cfg-default-due" class="form-input" type="number" min="0" step="1" value="${esc(String(cfg.operational.default_due_days || 0))}">
            </div>
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
          <input class="form-input po-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(rate || ''))}">
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
    const addRetRuleRow = (rule = {}) => {
      if (!retWrap) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <div class="col-span-2"><select class="form-input po-cfg-ret-concept">${conceptOpts.map(o => `<option value="${o}"${String(rule.concept || '') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="col-span-2"><select class="form-input po-cfg-ret-base-type">${baseTypeOpts.map(o => `<option value="${o}"${String(rule.base_type || 'SUBTOTAL') === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-min-base" type="number" min="0" step="0.01" placeholder="Base mín." value="${esc(String(rule.min_base ?? 0))}"></div>
        <div class="col-span-2"><input class="form-input po-cfg-ret-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${esc(String(rule.rate ?? 0))}"></div>
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

    $('#btn-save-po-config')?.addEventListener('click', async () => {
      try {
        const ivaByRate = {};
        (document.querySelectorAll('#po-cfg-iva-rates-wrap .grid') || []).forEach((row) => {
          const rate = String(row.querySelector('.po-cfg-iva-rate')?.value || '').trim();
          const acct = String(row.querySelector('.po-cfg-iva-acct')?.value || '').trim();
          if (!rate) return;
          ivaByRate[rate] = acct;
        });
        const withholdingRules = [];
        (document.querySelectorAll('#po-cfg-ret-rules-wrap .grid') || []).forEach((row, idx) => {
          const concept = String(row.querySelector('.po-cfg-ret-concept')?.value || '').trim().toUpperCase();
          const baseType = String(row.querySelector('.po-cfg-ret-base-type')?.value || 'SUBTOTAL').trim().toUpperCase();
          const minBase = Math.max(0, Number(row.querySelector('.po-cfg-ret-min-base')?.value || 0) || 0);
          const rate = Math.max(0, Number(row.querySelector('.po-cfg-ret-rate')?.value || 0) || 0);
          const accountCode = String(row.querySelector('.po-cfg-ret-account')?.value || '').trim();
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
        const payload = {
          operational: {
            allow_services_without_product: getCheckVal('po-cfg-svc-no-product'),
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
        showToast('Configuración de compras guardada', 'success');
        closeModal();
        if (typeof onSaved === 'function') onSaved();
      } catch (err) {
        showToast(err.message || 'No se pudo guardar la configuración', 'error');
      }
    });
  } catch (err) {
    showToast(err.message || 'No se pudo abrir la configuración de compras', 'error');
  }
}

// ── Render principal ──────────────────────────────────────────────────────────
async function renderCompras(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando compras...</div>`;
  try {
    await _loadComprasPage(c);
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function _loadComprasPage(c) {
  const result = await API.getPurchaseInvoices({ perPage: 100, sort: '-date' });
  const invoices = result.items || [];

  const total    = invoices.length;
  const draft    = invoices.filter(i => i.status === 'draft').length;
  const posted   = invoices.filter(i => i.status === 'posted').length;
  const totalVal = invoices.filter(i => i.status !== 'voided').reduce((s, i) => s + (i.total || 0), 0);

  c.innerHTML = `
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Compras de Bienes y Servicios</h3>
        <p class="text-sm" style="color:#6B7280">Facturas de compra con contabilización automática e integración de inventario.</p>
      </div>
      ${can('canWrite') ? `<div class="flex gap-2"><button class="btn btn-outline" id="btn-po-config" title="Configuración de compras"><i class="fas fa-gear"></i></button><button class="btn btn-primary" id="btn-new-purchase"><i class="fas fa-plus"></i> Nueva Factura de Compra</button></div>` : ''}
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${poKpi('Total facturas',       total,        'fas fa-file-invoice-dollar', '#1A4B8C','#EEF4FF')}
      ${poKpi('Borradores',           draft,        'fas fa-pencil',              '#C46516','#FFF8F0')}
      ${poKpi('Contabilizadas',       posted,       'fas fa-check-circle',        '#059669','#ECFDF5')}
      ${poKpi('Valor total compras',  fmt(totalVal),'fas fa-coins',               '#7C3AED','#F5F3FF')}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="po-q" class="form-input flex-1 min-w-48" placeholder="Buscar número, proveedor, referencia...">
      <select id="po-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="draft">Borrador</option>
        <option value="posted">Contabilizada</option>
        <option value="voided">Anulada</option>
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
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="po-tbody">
            ${invoices.length ? invoices.map(renderPoRow).join('') : `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-invoice-dollar mr-2"></i>No hay facturas de compra.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;

  // Evento nuevo
  $('#btn-new-purchase')?.addEventListener('click', () => openPurchaseForm(null, () => _loadComprasPage(c)));
  $('#btn-po-config')?.addEventListener('click', () => openPurchaseSettingsModal(() => _loadComprasPage(c)));

  // Filtros
  const applyPoFilter = () => filterPoTable();
  $('#po-q')?.addEventListener('input', debounce(applyPoFilter, 150));
  $('#po-status-f')?.addEventListener('change', applyPoFilter);
  $('#po-from')?.addEventListener('change', applyPoFilter);
  $('#po-to')?.addEventListener('change', applyPoFilter);
}

function renderPoRow(inv) {
  const meta = PO_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
  const sup  = inv.expand?.supplier_id;
  const wh   = inv.expand?.warehouse_id;
  return `<tr data-poid="${esc(inv.id)}" data-postatus="${esc(inv.status)}" data-podate="${esc(inv.date)}">
    <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(inv.number)}</span></td>
    <td>${esc(inv.date)}</td>
    <td class="font-medium">${sup ? esc(sup.name) : '—'}</td>
    <td class="text-sm" style="color:#6B7280">${esc(inv.supplier_ref || '—')}</td>
    <td class="text-sm">${wh ? esc(wh.name) : '—'}</td>
    <td class="text-right">${fmt(inv.subtotal || 0)}</td>
    <td class="text-right">${inv.iva_total ? fmt(inv.iva_total) : '—'}</td>
    <td class="text-right font-semibold">${fmt(inv.total || 0)}</td>
    <td><span class="badge ${meta.badge}">${meta.label}</span></td>
    <td>
      <div class="flex gap-1">
        <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewPurchaseDetail('${esc(inv.id)}')"><i class="fas fa-eye"></i></button>
        ${inv.status === 'draft' && can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="editPurchase('${esc(inv.id)}')"><i class="fas fa-pen"></i></button>` : ''}
        ${inv.status === 'draft' && can('canApprove') ? `<button class="btn btn-primary btn-sm" title="Contabilizar" onclick="contabilizarCompra('${esc(inv.id)}', '${esc(inv.number)}')"><i class="fas fa-check"></i> Contabilizar</button>` : ''}
        ${inv.status === 'draft' && can('canDelete')  ? `<button class="btn btn-danger btn-sm" title="Anular" onclick="voidPurchase('${esc(inv.id)}', '${esc(inv.number)}')"><i class="fas fa-ban"></i></button>` : ''}
        ${inv.status === 'posted' && inv.tx_id ? `<button class="btn btn-outline btn-sm" title="Ver asiento contable" style="border-color:#7C3AED;color:#7C3AED" onclick="seeTxDetail('${esc(inv.tx_id)}')"><i class="fas fa-book-open"></i></button>` : ''}
      </div>
    </td>
  </tr>`;
}

function filterPoTable() {
  const q    = (getInputVal('po-q') || '').toLowerCase();
  const st   = getSelectVal('po-status-f');
  const from = getInputVal('po-from');
  const to   = getInputVal('po-to');
  $$('#po-table tbody tr[data-poid]').forEach(tr => {
    const text = tr.textContent.toLowerCase();
    const date = tr.dataset.podate;
    tr.style.display = (
      (!q    || text.includes(q)) &&
      (!st   || tr.dataset.postatus === st) &&
      (!from || date >= from) &&
      (!to   || date <= to)
    ) ? '' : 'none';
  });
}

// ── Formulario Nueva / Editar Factura ─────────────────────────────────────────
async function openPurchaseForm(invoiceId = null, onDone = null) {
  let inv = null, existingLines = [];
  let [poConfig, suppliers, warehouses, products, accounts, txTypes] = await Promise.all([
    getPurchaseConfig(),
    pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    API.getWarehouses(true),
    API.getProducts({ activeOnly: true }),
    pb.listAll('accounts', {
      filter: 'active=true && level>=3',
      sort: 'code',
    }),
    API.getTxTypes(),
  ]);

  if (invoiceId) {
    [inv, existingLines] = await Promise.all([
      pb.get('purchase_invoices', invoiceId, { expand: 'supplier_id,warehouse_id' }),
      API.getPurchaseInvoiceLines(invoiceId),
    ]);
  }

  // Estado reactivo de líneas
  let lineCounter = 0;
  const serviceAccounts = accounts.filter(a => ['5','6','7'].some(p => a.code.startsWith(p)));
  const billDate = inv?.date || todayStr();
  const defaultDueDate = inv?.due_date || addDaysToDateStr(billDate, poConfig.operational.default_due_days || 0);
  const txTypeOptions = txTypes.map(t => `<option value="${esc(t.id)}"${inv?.tx_type_id === t.id ? ' selected' : ''}>${esc(t.prefix)} — ${esc(t.name)}</option>`).join('');

  function supplierDisplay(s) {
    const doc = s?.doc_number || s?.nit || '';
    return `${doc} - ${s?.name || ''}`.trim();
  }

  const productOptions = () => products.map(p => `<option value="${esc(p.id)}" data-type="${esc(p.type)}" data-cost="${p.cost_price||0}" data-iva="${p.iva_rate||0}" data-invacct="${esc(p.inventory_account_id||'')}" data-costacct="${esc(p.cost_account_id||'')}">${esc(p.code)} — ${esc(p.name)}</option>`).join('');
  const withholdingRules = (poConfig?.accounting?.withholding_rules || []).filter(r => String(r.account_code || '').trim() && Number(r.rate || 0) > 0);
  window.__poRetRulesCache = withholdingRules;
  const retRuleLabel = (r) => `${r.concept} ${r.rate}% (${r.base_type}${Number(r.min_base || 0) > 0 ? `, base >= ${fmt(r.min_base || 0)}` : ''})`;
  const retRuleOptions = () => `<option value="">— Sin retención —</option>${withholdingRules.map(r => `<option value="${esc(r.id)}">${esc(retRuleLabel(r))}</option>`).join('')}`;
  const serviceAccountOptions = () => serviceAccounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} ${esc(a.name)}</option>`).join('');
  const accountSearchData = serviceAccounts.map(a => ({ id: a.id, title: `${a.code} — ${a.name}`, sub: a.code }));
  const productSearchData = products.map(p => ({ id: p.id, title: `${p.code} — ${p.name}`, sub: p.type }));

  openModal(
    invoiceId ? `Editar Factura — ${esc(inv?.number || '')}` : 'Nueva Factura de Compra',
    `<!-- Encabezado -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Proveedor <span style="color:#EF4444">*</span></label>
        <div id="po-supplier-search-wrap" class="relative">
          <input id="po-supplier-search" class="form-input" autocomplete="off" placeholder="Buscar tercero por documento o nombre">
          <input id="po-supplier" type="hidden" value="${esc(inv?.supplier_id || '')}">
          <div id="po-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
        <input id="po-date" type="date" class="form-input" value="${esc(billDate)}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de vencimiento</label>
        <input id="po-due-date" type="date" class="form-input" value="${esc(defaultDueDate || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Ref. factura proveedor</label>
        <input id="po-supplier-ref" class="form-input" placeholder="Ej: FAC-2026-001" value="${esc(inv?.supplier_ref || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de comprobante contable <span style="color:#EF4444">*</span></label>
        <select id="po-tx-type" class="form-input">
          <option value="">— Seleccionar —</option>
          ${txTypeOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Numeración comprobante <span style="color:#EF4444">*</span></label>
        <input id="po-tx-number" class="form-input" placeholder="Ej: FC-00000015" value="${esc(inv?.tx_number || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Bodega destino <span style="font-size:10px;color:#9CA3AF">(para bienes)</span></label>
        <select id="po-warehouse" class="form-input">
          <option value="">— Sin bodega —</option>
          ${warehouses.map(w => `<option value="${esc(w.id)}"${inv?.warehouse_id === w.id ? ' selected' : ''}>${esc(w.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notas</label>
        <input id="po-notes" class="form-input" placeholder="Observaciones" value="${esc(inv?.notes || '')}">
      </div>
    </div>

    <!-- Líneas de compra -->
    <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
      <div class="flex items-center justify-between px-4 py-2" style="background:#F9FAFB">
        <span class="text-sm font-semibold" style="color:#0D2137">Artículos / Servicios</span>
        <div class="flex gap-2">
          <button type="button" class="btn btn-outline btn-sm" id="btn-new-po-product"><i class="fas fa-box-open"></i> Crear producto</button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-add-po-line"><i class="fas fa-plus"></i> Agregar línea</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table" style="min-width:900px">
          <thead>
            <tr>
              <th style="min-width:220px">Producto / Servicio</th>
              <th style="min-width:180px">Cuenta gasto (si es servicio directo)</th>
              <th>Descripción</th>
              <th class="text-right" style="width:80px">Cant.</th>
              <th class="text-right" style="width:110px">P. unitario</th>
              <th class="text-right" style="width:80px">IVA %</th>
              <th style="min-width:200px">Retención</th>
              <th class="text-right" style="width:120px">Vlr Ret.</th>
              <th class="text-right" style="width:110px">Total</th>
              <th style="width:40px"></th>
            </tr>
          </thead>
          <tbody id="po-lines-body"></tbody>
        </table>
      </div>
    </div>
    <!-- Totales -->
    <div class="flex justify-end">
      <div class="text-sm space-y-1 min-w-64">
        <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span> <span id="po-total-sub" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>      <span id="po-total-iva" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8"><span style="color:#6B7280">Retenciones:</span> <span id="po-total-ret" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8"><span style="color:#6B7280">Total factura:</span> <span id="po-total-all" class="font-semibold">$ 0</span></div>
        <div class="flex justify-between gap-8 text-base border-t pt-2" style="border-color:#E5E7EB"><span class="font-bold" style="color:#0D2137">NETO A PAGAR:</span> <span id="po-total-net" class="font-bold" style="color:#1A4B8C">$ 0</span></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-po"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,
    true
  );

  // ── Funciones de líneas ───────────────────────────────────────────────────
  function initPoSupplierSearch() {
    const wrap = document.getElementById('po-supplier-search-wrap');
    const hidden = document.getElementById('po-supplier');
    const input = document.getElementById('po-supplier-search');
    const results = document.getElementById('po-supplier-results');
    if (!wrap || !hidden || !input || !results) return;

    const findById = (id) => suppliers.find(s => s.id === id) || null;
    const search = (q = '') => {
      const query = String(q || '').toLowerCase().trim();
      const terms = query.split(/\s+/).filter(Boolean);
      const data = !terms.length
        ? suppliers.slice(0, 40)
        : suppliers.filter(s => {
          const hay = `${s.doc_number || ''} ${s.nit || ''} ${s.name || ''}`.toLowerCase();
          return terms.every(t => hay.includes(t));
        }).slice(0, 40);
      if (!data.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';
        return;
      }
      results.innerHTML = data.map(s => `<button type="button" data-po-third-id="${esc(s.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(s.doc_number || s.nit || 'SIN DOC')}</div><div style="font-size:12px;color:#6B7280">${esc(s.name || '')}</div></button>`).join('');
    };

    const sync = () => {
      const third = findById(hidden.value);
      input.value = third ? supplierDisplay(third) : '';
    };
    sync();
    input.onfocus = () => { search(input.value); results.style.display = 'block'; };
    input.oninput = () => {
      hidden.value = '';
      search(input.value);
      results.style.display = 'block';
    };
    results.onclick = (ev) => {
      const btn = ev.target.closest('[data-po-third-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-po-third-id') || '';
      hidden.value = id;
      const third = findById(id);
      input.value = third ? supplierDisplay(third) : '';
      results.style.display = 'none';
    };
    if (input._poOutsideHandler) document.removeEventListener('click', input._poOutsideHandler);
    input._poOutsideHandler = (ev) => {
      if (!wrap.contains(ev.target)) results.style.display = 'none';
    };
    setTimeout(() => document.addEventListener('click', input._poOutsideHandler), 0);
  }

  function refreshPoProductSelects() {
    $$('select[id^="pol-prod-"]').forEach(sel => {
      const prev = sel.value;
      sel.innerHTML = `<option value="">— Seleccionar —</option>${productOptions()}`;
      if (prev) sel.value = prev;
    });
    $$('input[id^="pol-prod-search-"]').forEach((inp) => {
      const idx = inp.id.replace('pol-prod-search-', '');
      const sel = document.getElementById(`pol-prod-${idx}`);
      const opt = sel?.selectedOptions?.[0];
      inp.value = (opt && opt.value) ? opt.textContent : '';
    });
  }

  function getRetRuleById(ruleId) {
    return withholdingRules.find(r => r.id === ruleId) || null;
  }

  function calcRetentionValues(subtotal, ivaAmt, totalAmt, rule) {
    if (!rule) return { base: 0, amount: 0 };
    const baseType = String(rule.base_type || 'SUBTOTAL').toUpperCase();
    const base = baseType === 'IVA' ? ivaAmt : (baseType === 'TOTAL' ? totalAmt : subtotal);
    const minBase = Number(rule.min_base || 0) || 0;
    if (base < minBase) return { base, amount: 0 };
    const rate = Number(rule.rate || 0) || 0;
    return { base, amount: base * rate / 100 };
  }

  function initLookupInput({ wrapId, inputId, selectId, resultsId, dataList, onSelected }) {
    const wrap = document.getElementById(wrapId);
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    const results = document.getElementById(resultsId);
    if (!wrap || !input || !select || !results) return;

    const paint = (q = '') => {
      const query = String(q || '').toLowerCase().trim();
      const terms = query.split(/\s+/).filter(Boolean);
      const found = !terms.length
        ? dataList.slice(0, 30)
        : dataList.filter(it => {
          const hay = `${it.title || ''} ${it.sub || ''}`.toLowerCase();
          return terms.every(t => hay.includes(t));
        }).slice(0, 30);
      if (!found.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';
        return;
      }
      results.innerHTML = found.map(it => `<button type="button" data-lookup-id="${esc(it.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer"><div style="font-weight:600">${esc(it.title)}</div><div style="font-size:12px;color:#6B7280">${esc(it.sub || '')}</div></button>`).join('');
    };

    const sync = () => {
      const opt = select.selectedOptions?.[0];
      input.value = (opt && opt.value) ? opt.textContent : '';
    };
    sync();
    input.onfocus = () => { paint(input.value); results.style.display = 'block'; };
    input.oninput = () => {
      select.value = '';
      paint(input.value);
      results.style.display = 'block';
      if (typeof onSelected === 'function') onSelected('');
    };
    results.onclick = (ev) => {
      const btn = ev.target.closest('[data-lookup-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-lookup-id') || '';
      select.value = id;
      const opt = select.selectedOptions?.[0];
      input.value = (opt && opt.value) ? opt.textContent : '';
      results.style.display = 'none';
      if (typeof onSelected === 'function') onSelected(id);
    };
    if (input._lookupOutsideHandler) document.removeEventListener('click', input._lookupOutsideHandler);
    input._lookupOutsideHandler = (ev) => {
      if (!wrap.contains(ev.target)) results.style.display = 'none';
    };
    setTimeout(() => document.addEventListener('click', input._lookupOutsideHandler), 0);
  }

  function openQuickProductCreateModal() {
    if (!can('canWrite')) return showToast('Sin permisos para crear productos', 'error');
    const accountOptions = () => {
      const rows = accounts
        .filter(a => a.active && Number(a.level) >= 3)
        .sort((a, b) => a.code.localeCompare(b.code));
      return `<option value="">— Sin asignar —</option>${rows.map(a => `<option value="${esc(a.id)}">${esc(a.code)} — ${esc(a.name)}</option>`).join('')}`;
    };
    const overlayId = 'po-quick-product-overlay';
    const old = document.getElementById(overlayId);
    if (old) old.remove();
    const div = document.createElement('div');
    div.id = overlayId;
    div.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:12px';
    div.innerHTML = `
      <div style="background:#fff;border-radius:16px;width:100%;max-width:760px;max-height:92vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.2)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #F0F0F0">
          <h4 style="font-weight:700;color:#0D2137;font-size:15px"><i class="fas fa-box-open mr-2" style="color:#1A4B8C"></i>Crear producto desde compra</h4>
          <button id="po-qp-close" style="background:none;border:none;font-size:18px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="padding:18px" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0"><label class="form-label">Codigo *</label><input id="po-qp-code" class="form-input" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" placeholder="P-001"></div>
          <div class="form-group mb-0"><label class="form-label">Nombre *</label><input id="po-qp-name" class="form-input" placeholder="Nombre del producto"></div>
          <div class="form-group mb-0"><label class="form-label">Tipo *</label><select id="po-qp-type" class="form-input">${PO_PRODUCT_TYPES.map(t => `<option value="${esc(t.value)}">${esc(t.label)}</option>`).join('')}</select></div>
          <div class="form-group mb-0"><label class="form-label">Unidad *</label><select id="po-qp-unit" class="form-input">${PO_PRODUCT_UNITS.map(u => `<option value="${esc(u)}">${esc(u)}</option>`).join('')}</select></div>
          <div class="form-group mb-0"><label class="form-label">IVA %</label><select id="po-qp-iva" class="form-input">${PO_IVA_RATES.map(r => `<option value="${r}">${r}%</option>`).join('')}</select></div>
          <div class="form-group mb-0"><label class="form-label">Costo estimado</label><input id="po-qp-cost" type="number" min="0" step="0.01" class="form-input" value="0"></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta costo/gasto</label><select id="po-qp-cost-acct" class="form-input">${accountOptions()}</select></div>
          <div class="form-group mb-0"><label class="form-label">Cuenta inventario</label><select id="po-qp-inv-acct" class="form-input">${accountOptions()}</select></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:12px 20px;border-top:1px solid #F0F0F0">
          <button class="btn btn-outline" id="po-qp-cancel">Cancelar</button>
          <button class="btn btn-primary" id="po-qp-save"><i class="fas fa-floppy-disk"></i> Crear producto</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    const close = () => { div.remove(); };
    document.getElementById('po-qp-close')?.addEventListener('click', close);
    document.getElementById('po-qp-cancel')?.addEventListener('click', close);
    div.addEventListener('click', (ev) => { if (ev.target === div) close(); });

    document.getElementById('po-qp-save')?.addEventListener('click', async () => {
      const btn = document.getElementById('po-qp-save');
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
      try {
        const code = getInputVal('po-qp-code').trim().toUpperCase();
        const name = getInputVal('po-qp-name').trim();
        if (!code) return showToast('El codigo es obligatorio', 'warning');
        if (!name) return showToast('El nombre es obligatorio', 'warning');
        const safeCode = pb.escapeFilterValue(code);
        const dup = await pb.list('products', { filter: `code="${safeCode}"`, perPage: 1 });
        if (dup.items.length) return showToast(`Ya existe un producto con codigo ${code}`, 'warning');

        const payload = {
          code,
          name,
          description: '',
          type: getSelectVal('po-qp-type') || 'BIEN',
          unit: getSelectVal('po-qp-unit') || 'UND',
          presentacion: '',
          categoria: '',
          linea: '',
          iva_rate: Number(getSelectVal('po-qp-iva') || 0),
          base_price: 0,
          precio_venta_2: null,
          precio_venta_3: null,
          cost_price: parseFloat(getInputVal('po-qp-cost') || '0') || 0,
          active: true,
          unspsc_code: '',
          ean_code: '',
          peso: null,
          cajas_en_pallet: null,
          und_empaque: null,
          peso_x_und_empaque: null,
          income_account_id: null,
          cost_account_id: getSelectVal('po-qp-cost-acct') || null,
          inventory_account_id: getSelectVal('po-qp-inv-acct') || null,
        };
        const created = await pb.create('products', payload);
        await API.logAudit('CREATE', 'Producto', created.id, `${created.code} — ${created.name} (desde compras)`);
        products.unshift(created);
        refreshPoProductSelects();
        close();
        showToast('Producto creado y disponible en la factura', 'success');
      } catch (err) {
        showToast(err.message || 'No se pudo crear el producto', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Crear producto'; }
      }
    });
  }

  function recalcTotals() {
    let sub = 0, iva = 0, ret = 0;
    let idx = 1;
    while (idx <= lineCounter + 5) {
      const el = document.getElementById(`pol-price-${idx}`);
      if (!el) { idx++; if (idx > lineCounter + 5) break; continue; }
      const qty  = parseFloat(document.getElementById(`pol-qty-${idx}`)?.value   || '0') || 0;
      const pr   = parseFloat(el.value || '0') || 0;
      const ivaR = parseFloat(document.getElementById(`pol-iva-${idx}`)?.value   || '0') || 0;
      const s    = qty * pr;
      const v    = s * ivaR / 100;
      const t    = s + v;
      const ruleId = getSelectVal(`pol-ret-rule-${idx}`);
      const rule = getRetRuleById(ruleId);
      const retCalc = calcRetentionValues(s, v, t, rule);
      sub += s;
      iva += v;
      ret += retCalc.amount;
      const totEl = document.getElementById(`pol-rowtot-${idx}`);
      if (totEl) totEl.textContent = fmt(t);
      const retEl = document.getElementById(`pol-retamt-${idx}`);
      if (retEl) retEl.textContent = retCalc.amount > 0 ? fmt(retCalc.amount) : '—';
      idx++;
    }
    if ($('#po-total-sub')) $('#po-total-sub').textContent = fmt(sub);
    if ($('#po-total-iva')) $('#po-total-iva').textContent = fmt(iva);
    if ($('#po-total-ret')) $('#po-total-ret').textContent = fmt(ret);
    if ($('#po-total-all')) $('#po-total-all').textContent = fmt(sub + iva);
    if ($('#po-total-net')) $('#po-total-net').textContent = fmt((sub + iva) - ret);
  }

  function addPoLine(line = {}) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('po-lines-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.id = `pol-row-${idx}`;
    tr.innerHTML = `
      <td>
        <div id="pol-prod-wrap-${idx}" class="relative">
          <input id="pol-prod-search-${idx}" class="form-input" style="min-width:200px" autocomplete="off" placeholder="Buscar producto...">
          <select class="form-input" id="pol-prod-${idx}" style="display:none">
            <option value="">— Seleccionar —</option>
            ${productOptions()}
          </select>
          <div id="pol-prod-results-${idx}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td>
        <div id="pol-acct-wrap-${idx}" class="relative">
          <input id="pol-acct-search-${idx}" class="form-input" style="min-width:160px" autocomplete="off" placeholder="Buscar cuenta...">
          <select class="form-input" id="pol-acct-${idx}" style="display:none">
            <option value="">— Solo si no hay producto —</option>
            ${serviceAccountOptions()}
          </select>
          <div id="pol-acct-results-${idx}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td><input id="pol-desc-${idx}" class="form-input" style="min-width:120px" placeholder="Descripción" value="${esc(line.description||'')}"></td>
      <td><input id="pol-qty-${idx}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:70px" value="${line.qty||'1'}" oninput="poRecalcLine(${idx})"></td>
      <td><input id="pol-price-${idx}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" value="${line.unit_price||''}" oninput="poRecalcLine(${idx})"></td>
      <td><input id="pol-iva-${idx}" type="number" min="0" max="100" step="1" class="form-input text-right" style="min-width:60px" value="${line.iva_rate||'0'}" oninput="poRecalcLine(${idx})"></td>
      <td>
        <select id="pol-ret-rule-${idx}" class="form-input" style="min-width:180px" onchange="poRecalcLine(${idx})">
          ${retRuleOptions()}
        </select>
      </td>
      <td class="text-right font-semibold text-sm" id="pol-retamt-${idx}" style="color:#C46516">—</td>
      <td class="text-right font-semibold text-sm" id="pol-rowtot-${idx}" style="color:#1A4B8C">—</td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('pol-row-${idx}').remove(); poRecalcLine(0)"><i class="fas fa-times"></i></button></td>`;
    tbody.appendChild(tr);

    initLookupInput({
      wrapId: `pol-prod-wrap-${idx}`,
      inputId: `pol-prod-search-${idx}`,
      selectId: `pol-prod-${idx}`,
      resultsId: `pol-prod-results-${idx}`,
      dataList: productSearchData,
      onSelected: () => {
        const sel = document.getElementById(`pol-prod-${idx}`);
        const opt = sel?.selectedOptions?.[0];
        if (!opt || !opt.value) return;
        const prFld  = document.getElementById(`pol-price-${idx}`);
        const ivaFld = document.getElementById(`pol-iva-${idx}`);
        if (prFld && !prFld.value) prFld.value = opt.dataset.cost || '';
        if (ivaFld) ivaFld.value = opt.dataset.iva || '0';
        const acctSel = document.getElementById(`pol-acct-${idx}`);
        const acctInp = document.getElementById(`pol-acct-search-${idx}`);
        if (acctSel) acctSel.value = '';
        if (acctInp) acctInp.value = '';
        poRecalcLine(idx);
      },
    });

    initLookupInput({
      wrapId: `pol-acct-wrap-${idx}`,
      inputId: `pol-acct-search-${idx}`,
      selectId: `pol-acct-${idx}`,
      resultsId: `pol-acct-results-${idx}`,
      dataList: accountSearchData,
      onSelected: () => {
        const prodSel = document.getElementById(`pol-prod-${idx}`);
        const prodInp = document.getElementById(`pol-prod-search-${idx}`);
        if (prodSel) prodSel.value = '';
        if (prodInp) prodInp.value = '';
        poRecalcLine(idx);
      },
    });

    if (line.product_id) {
      const sel = document.getElementById(`pol-prod-${idx}`);
      if (sel) sel.value = line.product_id;
      const inp = document.getElementById(`pol-prod-search-${idx}`);
      const opt = sel?.selectedOptions?.[0];
      if (inp && opt?.value) inp.value = opt.textContent;
    }
    if (line.account_id) {
      const sel = document.getElementById(`pol-acct-${idx}`);
      if (sel) sel.value = line.account_id;
      const inp = document.getElementById(`pol-acct-search-${idx}`);
      const opt = sel?.selectedOptions?.[0];
      if (inp && opt?.value) inp.value = opt.textContent;
    }
    if (line.ret_rule_id) {
      const rs = document.getElementById(`pol-ret-rule-${idx}`);
      if (rs) rs.value = line.ret_rule_id;
    }
    recalcTotals();
  }

  // Agregar líneas existentes o una vacía
  if (existingLines.length) {
    for (const l of existingLines) addPoLine(l);
  } else {
    addPoLine();
  }

  initPoSupplierSearch();
  document.getElementById('btn-add-po-line')?.addEventListener('click', () => addPoLine());
  document.getElementById('btn-new-po-product')?.addEventListener('click', () => openQuickProductCreateModal());

  const txTypeSel = document.getElementById('po-tx-type');
  const txNumberInput = document.getElementById('po-tx-number');
  const suggestTxNumber = () => {
    if (!txTypeSel || !txNumberInput) return;
    if (invoiceId && txNumberInput.value) return;
    const selected = txTypes.find(t => t.id === txTypeSel.value);
    if (!selected) return;
    const next = Number(selected.consecutive || 0) + 1;
    const prefix = selected.prefix || selected.code || 'TX';
    txNumberInput.value = `${prefix}-${String(next).padStart(8, '0')}`;
  };
  txTypeSel?.addEventListener('change', suggestTxNumber);
  suggestTxNumber();

  if (!invoiceId && (poConfig.operational.default_due_days || 0) > 0) {
    document.getElementById('po-date')?.addEventListener('change', () => {
      const dateNow = getInputVal('po-date');
      if ($('#po-due-date') && !getInputVal('po-due-date')) {
        setInputVal('po-due-date', addDaysToDateStr(dateNow, poConfig.operational.default_due_days || 0));
      }
    });
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  document.getElementById('btn-save-po')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-po');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
    try {
      const supplierId = getInputVal('po-supplier');
      const date       = getInputVal('po-date');
      const txTypeId   = getSelectVal('po-tx-type');
      const txNumber   = getInputVal('po-tx-number').trim();
      if (!supplierId) return showToast('Selecciona el proveedor', 'warning');
      if (!date)       return showToast('La fecha es obligatoria', 'warning');
      if (!txTypeId)   return showToast('Selecciona el tipo de comprobante contable', 'warning');
      if (!txNumber)   return showToast('Define la numeración del comprobante contable', 'warning');

      // Recopilar líneas
      const linesData = [];
      let retTotal = 0;
      for (let i = 1; i <= lineCounter + 2; i++) {
        const rowEl = document.getElementById(`pol-row-${i}`);
        if (!rowEl) continue;
        const prodId  = getSelectVal(`pol-prod-${i}`);
        const acctId  = getSelectVal(`pol-acct-${i}`);
        const desc    = getInputVal(`pol-desc-${i}`) || '';
        const qty     = parseFloat(getInputVal(`pol-qty-${i}`)   || '0') || 0;
        const price   = parseFloat(getInputVal(`pol-price-${i}`) || '0') || 0;
        const ivaR    = parseFloat(getInputVal(`pol-iva-${i}`)   || '0') || 0;
        const retRuleId = getSelectVal(`pol-ret-rule-${i}`) || '';
        if (!qty || !price) continue;
        if (!prodId && !acctId && !poConfig.operational.allow_services_without_product) {
          return showToast(`Línea ${linesData.length + 1}: selecciona producto o cuenta contable`, 'warning');
        }
        const sub = qty * price;
        const ivaAmt = sub * ivaR / 100;
        const total = sub + ivaAmt;
        const retRule = getRetRuleById(retRuleId);
        const retCalc = calcRetentionValues(sub, ivaAmt, total, retRule);
        retTotal += retCalc.amount || 0;
        linesData.push({
          product_id:  prodId || null,
          account_id:  acctId || null,
          description: desc,
          qty, unit_price: price,
          iva_rate: ivaR,
          subtotal: sub, iva_amount: ivaAmt, total,
          ret_rule_id: retRule ? retRule.id : '',
          ret_concept: retRule ? retRule.concept : '',
          ret_base_type: retRule ? retRule.base_type : '',
          ret_base: retCalc.base || 0,
          ret_rate: retRule ? Number(retRule.rate || 0) : 0,
          ret_amount: retCalc.amount || 0,
          ret_account_code: retRule ? String(retRule.account_code || '') : '',
        });
      }
      if (!linesData.length) return showToast('Agrega al menos una línea válida', 'warning');

      if (poConfig.operational.require_warehouse_for_goods) {
        const hasGoods = linesData.some(l => {
          if (!l.product_id) return false;
          const prod = products.find(p => p.id === l.product_id);
          return prod?.type === 'BIEN';
        });
        if (hasGoods && !getSelectVal('po-warehouse')) {
          return showToast('Selecciona bodega destino para líneas de bienes', 'warning');
        }
      }

      const today  = date.replaceAll('-', '');
      const rand   = String(Date.now()).slice(-4);
      const number = inv?.number || `FC-${today}-${rand}`;

      const header = {
        number, date,
        due_date:     getInputVal('po-due-date') || null,
        supplier_id:  supplierId,
        supplier_ref: getInputVal('po-supplier-ref').trim(),
        tx_type_id:   txTypeId,
        tx_number:    txNumber,
        warehouse_id: getSelectVal('po-warehouse') || null,
        notes:        getInputVal('po-notes').trim(),
        ret_total:    retTotal,
        payable_total: linesData.reduce((s, l) => s + (l.total || 0), 0) - retTotal,
      };

      if (invoiceId) {
        // Editar: actualizar encabezado y reemplazar líneas
        let sub = 0, ivaT = 0;
        for (const l of linesData) { sub += l.subtotal; ivaT += l.iva_amount; }
        await pb.update('purchase_invoices', invoiceId, { ...header, subtotal: sub, iva_total: ivaT, total: sub + ivaT });
        const oldLines = await pb.listAll('purchase_invoice_lines', { filter: `invoice_id="${pb.escapeFilterValue(invoiceId)}"` });
        for (const ol of oldLines) await pb.delete('purchase_invoice_lines', ol.id);
        for (let i = 0; i < linesData.length; i++) {
          await pb.create('purchase_invoice_lines', { invoice_id: invoiceId, line_order: i + 1, ...linesData[i] });
        }
        await API.logAudit('UPDATE', 'PurchaseInvoice', invoiceId, `Editada ${number}`);
        showToast('Factura actualizada', 'success');
      } else {
        await API.createPurchaseInvoice(header, linesData);
        showToast('Factura guardada como borrador', 'success');
      }

      closeModal();
      if (onDone) onDone();
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar borrador'; }
    }
  });
}

// Expone función global para recalcular al cambiar inputs desde el DOM
window.poRecalcLine = function (idx) {
  // recalcTotals() no puede llamarse directo por scope; usamos evento
  const e = new Event('po-recalc');
  document.dispatchEvent(e);
};
document.addEventListener('po-recalc', () => {
  // recalc de todos los totales en el formulario abierto
  let sub = 0, iva = 0, ret = 0;
  for (let i = 1; i <= 100; i++) {
    const rowEl = document.getElementById(`pol-row-${i}`);
    if (!rowEl) continue;
    const qty  = parseFloat(document.getElementById(`pol-qty-${i}`)?.value   || '0') || 0;
    const pr   = parseFloat(document.getElementById(`pol-price-${i}`)?.value  || '0') || 0;
    const ivaR = parseFloat(document.getElementById(`pol-iva-${i}`)?.value    || '0') || 0;
    const s    = qty * pr;
    const v    = s * ivaR / 100;
    const t    = s + v;
    sub += s; iva += v;
    const ruleId = getSelectVal(`pol-ret-rule-${i}`);
    const baseType = String(document.getElementById(`pol-ret-rule-${i}`)?.selectedOptions?.[0]?.textContent || '');
    const ruleLine = (window.__poRetRulesCache || []).find(r => r.id === ruleId) || null;
    let retVal = 0;
    if (ruleLine) {
      const base = String(ruleLine.base_type || 'SUBTOTAL').toUpperCase() === 'IVA' ? v : (String(ruleLine.base_type || 'SUBTOTAL').toUpperCase() === 'TOTAL' ? t : s);
      const minBase = Number(ruleLine.min_base || 0) || 0;
      if (base >= minBase) retVal = base * (Number(ruleLine.rate || 0) || 0) / 100;
    } else if (baseType) {
      retVal = 0;
    }
    ret += retVal;
    const totEl = document.getElementById(`pol-rowtot-${i}`);
    if (totEl) totEl.textContent = fmt(t);
    const retEl = document.getElementById(`pol-retamt-${i}`);
    if (retEl) retEl.textContent = retVal > 0 ? fmt(retVal) : '—';
  }
  if ($('#po-total-sub')) $('#po-total-sub').textContent = fmt(sub);
  if ($('#po-total-iva')) $('#po-total-iva').textContent = fmt(iva);
  if ($('#po-total-ret')) $('#po-total-ret').textContent = fmt(ret);
  if ($('#po-total-all')) $('#po-total-all').textContent = fmt(sub + iva);
  if ($('#po-total-net')) $('#po-total-net').textContent = fmt((sub + iva) - ret);
});

// ── Acciones globales ─────────────────────────────────────────────────────────
async function viewPurchaseDetail(id) {
  try {
    const [inv, lines] = await Promise.all([
      pb.get('purchase_invoices', id, { expand: 'supplier_id,warehouse_id' }),
      API.getPurchaseInvoiceLines(id),
    ]);
    const meta = PO_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
    const sup  = inv.expand?.supplier_id;
    const wh   = inv.expand?.warehouse_id;

    openModal(
      `Factura de Compra — ${esc(inv.number)}`,
      `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-5">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(inv.number)}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${meta.badge}">${meta.label}</span></p></div>
        <div><span class="form-label">Fecha</span><p>${esc(inv.date)}</p></div>
        <div><span class="form-label">Proveedor</span><p>${sup ? esc(sup.name) : '—'}</p></div>
        <div><span class="form-label">Ref. proveedor</span><p>${esc(inv.supplier_ref || '—')}</p></div>
        <div><span class="form-label">Bodega destino</span><p>${wh ? esc(wh.name) : '—'}</p></div>
        ${inv.due_date ? `<div><span class="form-label">Vencimiento</span><p>${esc(inv.due_date)}</p></div>` : ''}
        ${inv.notes    ? `<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(inv.notes)}</p></div>` : ''}
      </div>

      <div class="border rounded-xl overflow-hidden mb-4" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto / Servicio</th><th>Descripción</th><th class="text-right">Cant.</th><th class="text-right">P. Unit.</th><th class="text-right">IVA %</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${lines.map(l => {
              const p = l.expand?.product_id;
              const a = l.expand?.account_id;
              return `<tr>
                <td>${p ? `<span class="font-mono text-xs mr-1" style="color:#1A4B8C">${esc(p.code)}</span>${esc(p.name)}` : (a ? `${esc(a.code)} ${esc(a.name)}` : '—')}</td>
                <td class="text-sm" style="color:#6B7280">${esc(l.description || '—')}</td>
                <td class="text-right">${fmtN(l.qty)}</td>
                <td class="text-right">${fmt(l.unit_price)}</td>
                <td class="text-right">${l.iva_rate ? l.iva_rate + '%' : '—'}</td>
                <td class="text-right font-semibold">${fmt(l.total)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="flex justify-end">
        <div class="text-sm space-y-1 min-w-56">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span><span class="font-semibold">${fmt(inv.subtotal||0)}</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>     <span class="font-semibold">${fmt(inv.iva_total||0)}</span></div>
          <div class="flex justify-between gap-8 border-t pt-2 text-base" style="border-color:#E5E7EB"><span class="font-bold" style="color:#0D2137">TOTAL:</span><span class="font-bold" style="color:#1A4B8C">${fmt(inv.total||0)}</span></div>
        </div>
      </div>
      ${inv.tx_id ? `<div class="mt-4 p-3 rounded-xl text-sm" style="background:#EEF4FF;color:#2446B8"><i class="fas fa-book-open mr-2"></i>Asiento contable generado: <button class="font-semibold underline cursor-pointer" onclick="closeModal(); setTimeout(() => seeTxDetail('${esc(inv.tx_id)}'), 300)">Ver asiento</button></div>` : ''}`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       ${inv.status === 'draft' && can('canApprove') ? `<button class="btn btn-primary" onclick="closeModal(); contabilizarCompra('${esc(inv.id)}', '${esc(inv.number)}')"><i class="fas fa-check"></i> Contabilizar</button>` : ''}`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

function editPurchase(id) {
  openPurchaseForm(id, () => renderCompras($('#page-content')));
}

function contabilizarCompra(id, number) {
  if (!can('canApprove')) return showToast('Solo el contador o admin pueden contabilizar', 'error');
  confirmDialog(
    'Contabilizar Factura de Compra',
    `¿Confirmas contabilizar la factura <strong>${esc(number)}</strong>?<br><br>
     Se generará automáticamente:<br>
     • Un asiento contable (FC) en estado <em>Borrador</em> para su aprobación<br>
     • Un movimiento de inventario <em>ENTRADA</em> para los bienes comprados`,
    async () => {
      try {
        const { inv, tx } = await API.postPurchaseInvoice(id);
        showToast(`Factura ${inv.number} contabilizada. Asiento ${tx.number} generado (pendiente aprobación).`, 'success');
        renderCompras($('#page-content'));
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

function voidPurchase(id, number) {
  if (!can('canDelete')) return showToast('No tienes permisos para anular', 'error');
  confirmDialog(
    'Anular Factura de Compra',
    `¿Confirmas anular la factura <strong>${esc(number)}</strong>? Esta acción no se puede deshacer.`,
    async () => {
      try {
        await API.voidPurchaseInvoice(id);
        showToast('Factura anulada', 'success');
        renderCompras($('#page-content'));
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

// ── KPI helper ────────────────────────────────────────────────────────────────
function poKpi(label, value, icon, color, bg) {
  return `<div class="rounded-2xl p-4" style="background:${bg}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${icon} text-sm" style="color:${color}"></i>
      <span class="text-xs font-semibold" style="color:${color}">${label}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${color}">${value}</p>
  </div>`;
}
