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
    },
    accounting: {
      accounts: {
        receivable_code: '130505',
        income_fallback_code: '413505',
        iva_by_rate: {
          '0': '233501',
          '5': '233501',
          '19': '233501',
        },
        discount_code: '',
        freight_code: '',
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
    },
    accounting: {
      accounts: {
        receivable_code: String(acc.receivable_code || base.accounting.accounts.receivable_code).trim(),
        income_fallback_code: String(acc.income_fallback_code || base.accounting.accounts.income_fallback_code).trim(),
        iva_by_rate: Object.keys(ivaByRate).length ? ivaByRate : { ...base.accounting.accounts.iva_by_rate },
        discount_code: String(acc.discount_code || '').trim(),
        freight_code: String(acc.freight_code || '').trim(),
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
    const [cfg, accounts] = await Promise.all([
      getSalesConfig(),
      (window as any).API.getAccounts(true),
    ]);

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
            <div class="form-group mb-0">
              <label class="form-label">Plazo por defecto (días)</label>
              <input id="so-cfg-default-due" class="form-input" type="number" min="0" step="1" value="${(window as any).esc(String(cfg.operational.default_due_days || 0))}">
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
              <label class="form-label">Cuenta Ingresos Fallback (SERVICIO)</label>
              <select id="so-cfg-inc-fallback" class="form-input">${accountOptions(cfg.accounting.accounts.income_fallback_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Descuentos Concedidos</label>
              <select id="so-cfg-discount-acct" class="form-input">${accountOptions(cfg.accounting.accounts.discount_code)}</select>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Cuenta Fletes Cobrados</label>
              <select id="so-cfg-freight-acct" class="form-input">${accountOptions(cfg.accounting.accounts.freight_code)}</select>
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
          },
          accounting: {
            accounts: {
              receivable_code: getSelectVal('so-cfg-receivable') || '130505',
              income_fallback_code: getSelectVal('so-cfg-inc-fallback') || '413505',
              iva_by_rate: ivaByRate,
              discount_code: getSelectVal('so-cfg-discount-acct') || '',
              freight_code: getSelectVal('so-cfg-freight-acct') || '',
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
export async function renderVentas(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando historial de facturación...</div>`;
  try {
    await _loadVentasPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadVentasPage(c: HTMLElement) {
  const result = await (window as any).API.getInvoices({ page: 1, perPage: 200, sort: '-date,-number' });
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
}

function renderSoRow(inv: any) {
  const meta = INV_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
  const client = inv.expand?.customer_id;
  const wh = inv.expand?.warehouse_id;
  const num = String(inv.number || '').trim();
  const prefix = num.includes('-') ? num.split('-')[0].toUpperCase() : 'SIN_PREFIJO';
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
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewSalesInvoiceDetail('${(window as any).esc(inv.id)}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm text-gray-500" title="Imprimir Carta" onclick="window.printInvoiceCarta('${(window as any).esc(inv.id)}')"><i class="fas fa-print"></i></button>
          <button class="btn btn-outline btn-sm text-blue-500" title="Imprimir Tirilla (POS)" onclick="window.showThermalTicketReceipt('${(window as any).esc(inv.id)}', 0, 0)"><i class="fas fa-receipt"></i></button>
          ${inv.status === 'draft' ? `
            <button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="window.editSalesInvoice('${(window as any).esc(inv.id)}')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-primary btn-sm" title="Contabilizar" onclick="window.contabilizarVenta('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-check"></i> Contabilizar</button>
            <button class="btn btn-danger btn-sm" title="Eliminar Borrador" onclick="window.deleteSalesInvoiceDraft('${(window as any).esc(inv.id)}', '${(window as any).esc(inv.number)}')"><i class="fas fa-trash"></i></button>
          ` : ''}
          ${inv.status === 'posted' ? `
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

// --- Formulario Reactivo de Creación / Edición ---
async function openSalesForm(invoiceId: string | null = null, onDone: any = null, preloadedOrderId: string | null = null) {
  let inv: any = null, existingLines: any[] = [];
  
  const [soConfig, customers, warehouses, products, txTypes] = await Promise.all([
    getSalesConfig(),
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
    (window as any).pb.listAll('transaction_types', { filter: 'active=true', sort: 'name' }),
  ]);

  if (invoiceId) {
    [inv, existingLines] = await Promise.all([
      (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id' }),
      (window as any).API.getInvoiceLines(invoiceId),
    ]);
  } else if (preloadedOrderId) {
    try {
      const preloadedOrder = await (window as any).pb.get('sales_orders', preloadedOrderId);
      const lines = await (window as any).API.getSalesOrderLines(preloadedOrderId);
      inv = {
        customer_id: preloadedOrder.customer_id,
        warehouse_id: preloadedOrder.warehouse_id,
        notes: preloadedOrder.notes || `Pedido ${preloadedOrder.number}`,
        date: (window as any).todayStr(),
        payment_method: 'CREDITO',
        sales_order_id: preloadedOrder.id
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
      console.error("Error precargando pedido:", err);
      (window as any).showToast("Error al precargar datos del pedido: " + err.message, "error");
    }
  }

  let lineCounter = 0;
  const billDate = inv?.date || (window as any).todayStr();
  const defaultDueDate = inv?.due_date || (window as any).addDaysToDateStr(billDate, soConfig.operational.default_due_days || 0);

  // Filtrar tipos de transacción de tipo Ventas (ej: FV, POS)
  const salesTypes = txTypes.filter((t: any) => t.prefix === 'FV' || t.code === 'FV' || t.name.toLowerCase().includes('venta'));
  const txTypeOptions = (salesTypes.length ? salesTypes : txTypes)
    .map((t: any) => `<option value="${(window as any).esc(t.id)}"${(inv?.tx_type_id === t.id || (!inv && t.prefix === 'FV')) ? ' selected' : ''}>${(window as any).esc(t.prefix)} — ${(window as any).esc(t.name)}</option>`)
    .join('');

  const withholdingRules = (soConfig?.accounting?.withholding_rules || [])
    .filter((r: any) => String(r.account_code || '').trim() && Number(r.rate || 0) > 0);
  
  (window as any).__soRetRulesCache = withholdingRules;
  (window as any).__soRetMode = inv?.ret_total > 0 ? 'header' : 'line'; // Inicializa modo retención

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
    <div class="space-y-6 text-sm" style="color:#374151">
      <!-- Encabezado -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl" style="background:#F9FAFB;border:1px solid #E5E7EB">
        <div class="form-group relative">
          <label class="form-label font-bold">Cliente / Adquirente <span style="color:#EF4444">*</span></label>
          <div id="so-supplier-search-wrap" class="relative flex gap-1 items-center">
            <input id="so-supplier-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del cliente...">
            <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window.soQuickAddCustomer()" title="Nuevo Cliente" style="border-color:#D1D5DB; background:#fff;">
              <i class="fas fa-user-plus text-xs" style="color:#4B5563"></i>
            </button>
            <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window.soLoadPendingOrderModal()" title="Cargar Pedido de Venta" style="border-color:#D1D5DB; background:#fff;color:#1A4B8C">
              <i class="fas fa-file-import text-xs"></i>
            </button>
            <input id="so-supplier" type="hidden" value="${(window as any).esc(inv?.customer_id || '')}">
            <input id="so-sales-order-id" type="hidden" value="${(window as any).esc(inv?.sales_order_id || '')}">
            <div id="so-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Fecha Emisión <span style="color:#EF4444">*</span></label>
          <input id="so-date" type="date" class="form-input" value="${(window as any).esc(billDate)}" onchange="window.soSuggestDueDate()">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Fecha Vencimiento</label>
          <input id="so-due-date" type="date" class="form-input" value="${(window as any).esc(defaultDueDate || '')}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Forma de Pago <span style="color:#EF4444">*</span></label>
          <select id="so-payment-method" class="form-input" onchange="window.soOnPaymentMethodChange()">
            <option value="EFECTIVO"${inv?.payment_method === 'EFECTIVO' ? ' selected' : ''}>Efectivo</option>
            <option value="TRANSFERENCIA"${inv?.payment_method === 'TRANSFERENCIA' ? ' selected' : ''}>Tarjeta / Transferencia</option>
            <option value="CREDITO"${(inv?.payment_method === 'CREDITO' || !inv) ? ' selected' : ''}>Crédito Comercial</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Comprobante Contable <span style="color:#EF4444">*</span></label>
          <select id="so-tx-type" class="form-input">
            <option value="">— Seleccionar comprobante —</option>
            ${txTypeOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Bodega Origen <span style="font-size:10px;color:#9CA3AF">(despacho)</span></label>
          <select id="so-warehouse" class="form-input" onchange="window.soRecalcLine(0)">
            <option value="">— Sin bodega —</option>
            ${warehouses.map(w => `<option value="${(window as any).esc(w.id)}"${(inv?.warehouse_id === w.id || (!inv && warehouses.length === 1)) ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-span-1 md:col-span-3">
          <label class="form-label font-bold">Notas u Observaciones</label>
          <input id="so-notes" class="form-input" placeholder="Ej: despacho inmediato, pago a 30 días, etc." value="${(window as any).esc(inv?.notes || '')}">
        </div>
      </div>

      <!-- Líneas de Venta -->
      <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
        <!-- Barra superior de la tabla -->
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes mr-1"></i> Artículos / Servicios</span>
          <div class="flex items-center gap-3 flex-wrap">
            <label class="flex items-center gap-2 cursor-pointer select-none" style="font-size:12px;font-weight:600;color:#374151" title="Captura de Retenciones">
              <span id="so-ret-mode-lbl-hdr" style="color:#1A4B8C">Global</span>
              <div style="position:relative;display:inline-block;width:38px;height:20px">
                <input type="checkbox" id="so-ret-mode-switch" style="opacity:0;width:0;height:0;position:absolute" onchange="window.soSetRetMode(this.checked)">
                <span id="so-ret-mode-track" onclick="var sw=document.getElementById('so-ret-mode-switch');sw.checked=!sw.checked;window.soSetRetMode(sw.checked)" style="position:absolute;inset:0;background:#1A4B8C;border-radius:10px;cursor:pointer;transition:background .2s"></span>
                <span id="so-ret-mode-knob" style="position:absolute;height:14px;width:14px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.25)"></span>
              </div>
              <span id="so-ret-mode-lbl-line" style="color:#9CA3AF">Por línea</span>
            </label>
            <button type="button" class="btn btn-outline btn-sm" id="btn-add-so-line"><i class="fas fa-plus"></i> Agregar línea</button>
          </div>
        </div>

        <!-- Tabla -->
        <div style="overflow-x:auto;max-height:300px;overflow-y:auto">
          <table class="data-table" id="so-lines-table" style="min-width:740px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:220px;background:#F4F8FF;color:#374151">Producto / Servicio</th>
                <th class="text-right" style="width:75px;background:#F4F8FF;color:#374151">Cant.</th>
                <th class="text-right" style="width:115px;background:#F4F8FF;color:#374151">P. Unitario</th>
                <th class="text-right" style="width:72px;background:#F4F8FF;color:#374151">IVA %</th>
                <th class="so-ret-col" style="min-width:190px;background:#F4F8FF;color:#374151;display:none">Retención</th>
                <th class="so-ret-col text-right" style="width:115px;background:#F4F8FF;color:#374151;display:none">Vlr Ret.</th>
                <th class="text-right" style="width:115px;background:#F4F8FF;color:#374151">Total línea</th>
                <th style="width:58px;background:#F4F8FF;color:#374151">Acción</th>
              </tr>
            </thead>
            <tbody id="so-lines-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Totales -->
      <div class="flex justify-end p-4 rounded-xl" style="background:#F9FAFB">
        <div class="text-sm space-y-1 min-w-80">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span> <span id="so-total-sub" class="font-semibold">$ 0</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>      <span id="so-total-iva" class="font-semibold">$ 0</span></div>
          <div id="so-hdr-ret-wrap" class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span style="color:#6B7280;white-space:nowrap">ReteRenta (A favor):</span>
              <div class="flex items-center gap-2">
                <select id="so-hdr-ret-rule-renta" class="form-input text-xs py-1" style="min-width:170px" onchange="window.soRecalcLine(0)">
                  ${retRuleOptionsRenta(inv?.ret_rule_renta_id || '')}
                </select>
                <span id="so-total-ret-renta" class="font-semibold text-orange-600" style="min-width:90px;text-align:right">$ 0</span>
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span style="color:#6B7280;white-space:nowrap">ReteICA (A favor):</span>
              <div class="flex items-center gap-2">
                <select id="so-hdr-ret-rule-ica" class="form-input text-xs py-1" style="min-width:170px" onchange="window.soRecalcLine(0)">
                  ${retRuleOptionsIca(inv?.ret_rule_ica_id || '')}
                </select>
                <span id="so-total-ret-ica" class="font-semibold text-orange-600" style="min-width:90px;text-align:right">$ 0</span>
              </div>
            </div>
          </div>
          <div class="flex justify-between gap-8 text-orange-600"><span class="font-semibold">Total Retenciones:</span> <span id="so-total-ret" class="font-bold">$ 0</span></div>
          <div class="flex justify-between gap-8 text-base border-t pt-2" style="border-color:#E5E7EB"><span class="font-extrabold text-gray-900">TOTAL NETO (CxC):</span> <span id="so-total-net" class="font-extrabold text-blue-700 text-lg">$ 0</span></div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-so"><i class="fas fa-floppy-disk"></i> Guardar Borrador</button>
  `;

  (window as any).openModal(invoiceId ? 'Editar Factura de Venta' : 'Nueva Factura de Venta', formHtml, footer, true);

  // --- AutoComplete de Clientes ---
  function initSoSupplierSearch() {
    const input = document.getElementById('so-supplier-search') as HTMLInputElement;
    const hidden = document.getElementById('so-supplier') as HTMLInputElement;
    const results = document.getElementById('so-supplier-results');
    if (!input || !hidden || !results) return;

    if (inv && inv.customer_id) {
      const match = customers.find((c: any) => c.id === inv.customer_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
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
  }

  (window as any).selectSoSupplier = function(id: string, text: string) {
    const hidden = document.getElementById('so-supplier') as HTMLInputElement;
    const input = document.getElementById('so-supplier-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
    }
  };

  (window as any).soQuickAddCustomer = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          customers.length = 0;
          customers.push(...thirds);
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const nameText = createdRecord.name || '';
          const selectText = docNum ? `${docNum} - ${nameText}` : nameText;
          (window as any).selectSoSupplier(createdRecord.id, selectText);
          (window as any).showToast('Cliente creado y seleccionado en la venta.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar clientes: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  (window as any).soLoadPendingOrderModal = async function() {
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
        (window as any).closeModal();
        openSalesForm(invoiceId, onDone, orderId);
      };
    } catch (err: any) {
      (window as any).showToast('Error al cargar pedidos: ' + err.message, 'error');
    }
  };

  initSoSupplierSearch();

  // --- Manejo de Líneas ---
  (window as any).addSoInvoiceLine = function(line: any = null) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('so-lines-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.id = `so-row-${idx}`;
    tr.innerHTML = `
      <td>
        <div id="sol-prod-wrap-${idx}" class="relative">
          <input id="sol-prod-search-${idx}" class="form-input w-full" autocomplete="off" placeholder="Buscar producto o servicio...">
          <input type="hidden" id="sol-prod-id-${idx}" value="${line?.product_id || ''}">
          <div id="sol-prod-results-${idx}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:180px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td><input type="number" id="sol-qty-${idx}" class="form-input text-right w-full font-semibold" min="0.001" step="0.001" value="${line?.qty || '1'}" oninput="window.soRecalcLine(${idx})"></td>
      <td><input type="number" id="sol-price-${idx}" class="form-input text-right w-full" min="0" step="0.01" value="${line?.unit_price || ''}" oninput="window.soRecalcLine(${idx})"></td>
      <td><input type="number" id="sol-iva-${idx}" class="form-input text-right w-full" min="0" max="100" step="1" value="${line?.iva_rate ?? '19'}" oninput="window.soRecalcLine(${idx})"></td>
      <td class="so-ret-col" style="display:none">
        <select id="sol-ret-rule-${idx}" class="form-input text-xs py-1 w-full" onchange="window.soRecalcLine(${idx})">
          ${retRuleOptions(withholdingRules, line?.ret_rule_id || '')}
        </select>
      </td>
      <td class="so-ret-col text-right text-orange-600 font-bold" style="display:none" id="sol-ret-val-${idx}">$ 0</td>
      <td class="text-right font-extrabold text-blue-700" id="sol-total-${idx}">$ 0</td>
      <td class="text-center">
        <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('so-row-${idx}').remove(); window.soRecalcLine(0)"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    // AutoComplete de Productos por línea
    window.initSoProductSearch(idx, line);

    // Refrescar visibilidad de columnas de retención
    const isPerLine = (window as any).__soRetMode === 'line';
    tr.querySelectorAll('.so-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });

    window.soRecalcLine(idx);
  };

  (window as any).initSoProductSearch = function(rowIdx: number, line: any) {
    const input = document.getElementById(`sol-prod-search-${rowIdx}`) as HTMLInputElement;
    const hidden = document.getElementById(`sol-prod-id-${rowIdx}`) as HTMLInputElement;
    const results = document.getElementById(`sol-prod-results-${rowIdx}`);
    if (!input || !hidden || !results) return;

    if (line && line.product_id) {
      const match = products.find((p: any) => p.id === line.product_id);
      if (match) input.value = `[${match.code || 'S/C'}] ${match.name}`;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query
        ? products.slice(0, 30)
        : products.filter((p: any) => `${p.name} ${p.code}`.toLowerCase().includes(query)).slice(0, 30);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((p: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window.selectSoProduct(${rowIdx}, '${(window as any).esc(p.id)}', '${(window as any).esc(p.code || 'S/C')}', '${(window as any).esc(p.name)}', ${p.sales_price || 0}, ${p.iva_rate ?? 19})">
          <div class="font-bold text-gray-800">[${p.code || 'S/C'}] ${p.name}</div>
          <div class="text-[10px] text-gray-500">Precio Sugerido: ${(window as any).fmt(p.sales_price || 0)} | IVA: ${p.iva_rate}%</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });
  };

  (window as any).selectSoProduct = function(rowIdx: number, id: string, code: string, name: string, price: number, ivaRate: number) {
    const hidden = document.getElementById(`sol-prod-id-${rowIdx}`) as HTMLInputElement;
    const input = document.getElementById(`sol-prod-search-${rowIdx}`) as HTMLInputElement;
    const priceFld = document.getElementById(`sol-price-${rowIdx}`) as HTMLInputElement;
    const ivaFld = document.getElementById(`sol-iva-${rowIdx}`) as HTMLInputElement;

    if (hidden && input) {
      hidden.value = id;
      input.value = `[${code}] ${name}`;
      if (priceFld && !priceFld.value) priceFld.value = String(price);
      if (ivaFld) ivaFld.value = String(ivaRate);
      window.soRecalcLine(rowIdx);
    }
  };

  // Carga líneas iniciales
  if (existingLines.length) {
    existingLines.forEach(l => (window as any).addSoInvoiceLine(l));
  } else {
    (window as any).addSoInvoiceLine();
  }

  // Configurar eventos del modal
  document.getElementById('btn-add-so-line')?.addEventListener('click', () => (window as any).addSoInvoiceLine());
  document.getElementById('btn-save-so')?.addEventListener('click', () => saveInvoiceDraftWrapper(invoiceId, onDone));

  window.soSuggestDueDate();
  window.soSetRetMode(inv?.ret_total > 0 && !(inv?.ret_rule_renta_id || inv?.ret_rule_ica_id));
}

window.soSuggestDueDate = function() {
  const dateStr = (document.getElementById('so-date') as HTMLInputElement)?.value;
  if (!dateStr) return;
  const payMethod = (document.getElementById('so-payment-method') as HTMLSelectElement)?.value;
  const dueFld = document.getElementById('so-due-date') as HTMLInputElement;
  if (!dueFld) return;

  if (payMethod === 'CREDITO') {
    const days = 30; // Por defecto
    const date = new Date(dateStr + 'T12:00:00');
    date.setDate(date.getDate() + days);
    dueFld.value = date.toISOString().slice(0, 10);
  } else {
    dueFld.value = dateStr;
  }
};

window.soOnPaymentMethodChange = function() {
  window.soSuggestDueDate();
  const method = (document.getElementById('so-payment-method') as HTMLSelectElement)?.value;
  const hdrWrap = document.getElementById('so-hdr-ret-wrap');
  
  if (hdrWrap) {
    // Si no es crédito, no aplica retención a menos que sea un caso especial
    hdrWrap.style.display = method === 'CREDITO' ? 'block' : 'none';
  }
  window.soRecalcLine(0);
};

// --- Recálculo Completo de Totales ---
window.soRecalcLine = function(rowIdx: number) {
  let subtotalSum = 0;
  let ivaSum = 0;
  let retSum = 0;

  const isPerLine = (window as any).__soRetMode === 'line';
  const tableRows = document.querySelectorAll('#so-lines-body tr');

  tableRows.forEach((row: any) => {
    const idParts = row.id.split('-');
    const idx = idParts[idParts.length - 1];

    const qty = parseFloat((document.getElementById(`sol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const pr = parseFloat((document.getElementById(`sol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
    const ivaRate = parseFloat((document.getElementById(`sol-iva-${idx}`) as HTMLInputElement)?.value || '0') || 0;

    const lineSub = qty * pr;
    const lineIva = lineSub * (ivaRate / 100);
    let lineRet = 0;

    if (isPerLine) {
      const retId = (document.getElementById(`sol-ret-rule-${idx}`) as HTMLSelectElement)?.value;
      if (retId && (window as any).__soRetRulesCache) {
        const rule = (window as any).__soRetRulesCache.find((r: any) => r.id === retId);
        if (rule && lineSub >= rule.min_base) {
          lineRet = lineSub * (rule.rate / 100);
        }
      }
      const retFld = document.getElementById(`sol-ret-val-${idx}`);
      if (retFld) retFld.textContent = (window as any).fmt(lineRet);
    }

    subtotalSum += lineSub;
    ivaSum += lineIva;
    retSum += lineRet;

    const lineTot = lineSub + lineIva - lineRet;
    const totFld = document.getElementById(`sol-total-${idx}`);
    if (totFld) totFld.textContent = (window as any).fmt(lineTot);
  });

  // Retenciones Globales (Header Mode)
  let valRenta = 0;
  let valIca = 0;

  if (!isPerLine) {
    const payMethod = (document.getElementById('so-payment-method') as HTMLSelectElement)?.value;
    if (payMethod === 'CREDITO' && (window as any).__soRetRulesCache) {
      const rentaId = (document.getElementById('so-hdr-ret-rule-renta') as HTMLSelectElement)?.value;
      const icaId = (document.getElementById('so-hdr-ret-rule-ica') as HTMLSelectElement)?.value;

      if (rentaId) {
        const r = (window as any).__soRetRulesCache.find((x: any) => x.id === rentaId);
        if (r && subtotalSum >= r.min_base) valRenta = subtotalSum * (r.rate / 100);
      }
      if (icaId) {
        const r = (window as any).__soRetRulesCache.find((x: any) => x.id === icaId);
        if (r && subtotalSum >= r.min_base) valIca = subtotalSum * (r.rate / 100);
      }
      retSum = valRenta + valIca;
    }
  }

  const netTotal = subtotalSum + ivaSum - retSum;

  if (document.getElementById('so-total-sub')) (document.getElementById('so-total-sub') as any).textContent = (window as any).fmt(subtotalSum);
  if (document.getElementById('so-total-iva')) (document.getElementById('so-total-iva') as any).textContent = (window as any).fmt(ivaSum);
  if (document.getElementById('so-total-ret-renta')) (document.getElementById('so-total-ret-renta') as any).textContent = (window as any).fmt(valRenta);
  if (document.getElementById('so-total-ret-ica')) (document.getElementById('so-total-ret-ica') as any).textContent = (window as any).fmt(valIca);
  if (document.getElementById('so-total-ret')) (document.getElementById('so-total-ret') as any).textContent = (window as any).fmt(retSum);
  if (document.getElementById('so-total-net')) (document.getElementById('so-total-net') as any).textContent = (window as any).fmt(netTotal);
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

// --- Persistencia Borrador Factura ---
async function saveInvoiceDraftWrapper(invoiceId: string | null, onDone: any = null) {
  const btn = document.getElementById('btn-save-so') as HTMLButtonElement;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }

  try {
    const customerId = (document.getElementById('so-supplier') as HTMLInputElement)?.value;
    const date = (document.getElementById('so-date') as HTMLInputElement)?.value;
    const due = (document.getElementById('so-due-date') as HTMLInputElement)?.value;
    const payMethod = (document.getElementById('so-payment-method') as HTMLSelectElement)?.value;
    const warehouseId = (document.getElementById('so-warehouse') as HTMLSelectElement)?.value;
    const txTypeId = (document.getElementById('so-tx-type') as HTMLSelectElement)?.value;
    const notes = (document.getElementById('so-notes') as HTMLInputElement)?.value || '';

    if (!customerId) throw new Error('Debes seleccionar un cliente.');
    if (!date) throw new Error('La fecha de emisión es obligatoria.');
    if (!payMethod) throw new Error('Selecciona la forma de pago.');
    if (!txTypeId) throw new Error('Selecciona el tipo de comprobante.');

    const tableRows = document.querySelectorAll('#so-lines-body tr');
    const lines: any[] = [];

    tableRows.forEach((row: any, lineIdx: number) => {
      const idParts = row.id.split('-');
      const idx = idParts[idParts.length - 1];

      const prodId = (document.getElementById(`sol-prod-id-${idx}`) as HTMLInputElement)?.value;
      const qty = parseFloat((document.getElementById(`sol-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const price = parseFloat((document.getElementById(`sol-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const ivaRate = parseFloat((document.getElementById(`sol-iva-${idx}`) as HTMLInputElement)?.value || '0') || 0;
      const retRuleId = (window as any).__soRetMode === 'line' ? ((document.getElementById(`sol-ret-rule-${idx}`) as HTMLSelectElement)?.value || '') : '';

      if (!prodId) throw new Error(`Fila ${lineIdx + 1}: selecciona un producto.`);
      if (qty <= 0) throw new Error(`Fila ${lineIdx + 1}: la cantidad debe ser mayor que cero.`);

      const subtotal = qty * price;
      const iva_amount = subtotal * (ivaRate / 100);

      lines.push({
        product_id: prodId,
        qty,
        unit_price: price,
        iva_rate: ivaRate,
        iva_amount,
        subtotal,
        total: subtotal + iva_amount,
        ret_rule_id: retRuleId,
      });
    });

    if (!lines.length) throw new Error('Agrega al menos una línea de venta.');

    // Calcula retenciones finales
    let retTotal = 0;
    let retRuleRenta = '';
    let retRuleIca = '';

    if ((window as any).__soRetMode === 'line') {
      lines.forEach(l => {
        if (l.ret_rule_id && (window as any).__soRetRulesCache) {
          const rule = (window as any).__soRetRulesCache.find((r: any) => r.id === l.ret_rule_id);
          if (rule && l.subtotal >= rule.min_base) {
            retTotal += l.subtotal * (rule.rate / 100);
          }
        }
      });
    } else {
      if (payMethod === 'CREDITO') {
        retRuleRenta = (document.getElementById('so-hdr-ret-rule-renta') as HTMLSelectElement)?.value || '';
        retRuleIca = (document.getElementById('so-hdr-ret-rule-ica') as HTMLSelectElement)?.value || '';
        const subtotalSum = lines.reduce((s, l) => s + l.subtotal, 0);

        if (retRuleRenta && (window as any).__soRetRulesCache) {
          const r = (window as any).__soRetRulesCache.find((x: any) => x.id === retRuleRenta);
          if (r && subtotalSum >= r.min_base) retTotal += subtotalSum * (r.rate / 100);
        }
        if (retRuleIca && (window as any).__soRetRulesCache) {
          const r = (window as any).__soRetRulesCache.find((x: any) => x.id === retRuleIca);
          if (r && subtotalSum >= r.min_base) retTotal += subtotalSum * (r.rate / 100);
        }
      }
    }

    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const iva_total = lines.reduce((s, l) => s + l.iva_amount, 0);
    const gross = subtotal + iva_total;

    // Consecutivo auto-generado si es nuevo
    let number = inv?.number;
    if (!number) {
      const todayStr = date.replaceAll('-', '');
      const rand = String(Date.now()).slice(-4);
      number = `FV-${todayStr}-${rand}`;
    }

    const salesOrderId = (document.getElementById('so-sales-order-id') as HTMLInputElement)?.value || null;

    const header = {
      number,
      customer_id: customerId,
      warehouse_id: warehouseId || null,
      date,
      due_date: due || null,
      notes: notes.trim(),
      payment_method: payMethod,
      subtotal,
      iva_total,
      ret_total: retTotal,
      total: gross,
      payable_total: gross - retTotal,
      ret_rule_renta_id: retRuleRenta,
      ret_rule_ica_id: retRuleIca,
      tx_type_id: txTypeId,
      sales_order_id: salesOrderId || null,
      status: 'draft',
    };

    if (invoiceId) {
      await (window as any).pb.update('invoices', invoiceId, header);
      const oldLines = await (window as any).pb.listAll('invoice_lines', { filter: `invoice_id="${(window as any).pb.escapeFilterValue(invoiceId)}"` });
      for (const ol of oldLines) await (window as any).pb.delete('invoice_lines', ol.id);
      for (let i = 0; i < lines.length; i++) {
        await (window as any).pb.create('invoice_lines', { invoice_id: invoiceId, line_order: i + 1, ...lines[i] });
      }
      await (window as any).API.logAudit('UPDATE', 'Invoice', invoiceId, `Actualizada factura borrador ${number}`);
      (window as any).showToast('Factura comercial borrador actualizada', 'success');
    } else {
      await (window as any).API.createInvoice(header, lines);
      (window as any).showToast('Nueva factura de venta guardada en borrador', 'success');
    }

    (window as any).closeModal();
    if (typeof onDone === 'function') onDone();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al guardar factura', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar Borrador'; }
  }
}

// --- Impresión Carta Premium ---
window.printInvoiceCarta = async function(invoiceId: string) {
  try {
    const inv = await (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id' });
    const lines = await (window as any).API.getInvoiceLines(invoiceId);

    const [compName, compNit, compAddress, compPhone, compEmail, compCity, compCountry] = await Promise.all([
      (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
      (window as any).API.getSetting('company_nit').catch(() => '901.442.115-3'),
      (window as any).API.getSetting('company_address').catch(() => ''),
      (window as any).API.getSetting('company_phone').catch(() => ''),
      (window as any).API.getSetting('company_email').catch(() => ''),
      (window as any).API.getSetting('company_city').catch(() => ''),
      (window as any).API.getSetting('company_country').catch(() => ''),
    ]);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      (window as any).showToast('Por favor, permite abrir ventanas emergentes para imprimir.', 'warning');
      return;
    }

    const docStr = printWin.document;
    docStr.write(`
      <html>
      <head>
        <title>Factura de Venta — ${inv.number}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; margin: 40px; font-size: 13px; line-height: 1.5; }
          .hdr-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .hdr-left { vertical-align: top; width: 60%; }
          .hdr-right { vertical-align: top; width: 40%; text-align: right; }
          .company-name { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
          .invoice-title { font-size: 22px; font-weight: 800; color: #1e3a8a; margin-bottom: 5px; }
          .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; margin-bottom: 20px; }
          .box-title { font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; color: #1e293b; }
          .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 8px; }
          .details-grid div span { font-weight: bold; color: #475569; }
          .lines-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .lines-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
          .lines-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .lines-table tr:last-child td { border-bottom: 2px solid #0f172a; }
          .totals-table { width: 40%; float: right; border-collapse: collapse; margin-bottom: 30px; }
          .totals-table td { padding: 8px 10px; }
          .totals-table tr.grand-total td { font-size: 15px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #cbd5e1; }
          .footer { clear: both; text-align: center; border-top: 1.5px dashed #cbd5e1; padding-top: 20px; color: #64748b; font-size: 11px; margin-top: 40px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <table class="hdr-table">
          <tr>
            <td class="hdr-left">
              <div class="company-name">${(window as any).esc(compName)}</div>
              <div>NIT: ${(window as any).esc(compNit)}</div>
              ${compAddress ? `<div>Dirección: ${(window as any).esc(compAddress)}</div>` : ''}
              ${compPhone ? `<div>Teléfono: ${(window as any).esc(compPhone)}</div>` : ''}
              ${compEmail ? `<div>Email: ${(window as any).esc(compEmail)}</div>` : ''}
              ${(compCity || compCountry) ? `<div>${(window as any).esc(compCity)}${compCity && compCountry ? ', ' : ''}${(window as any).esc(compCountry)}</div>` : ''}
            </td>
            <td class="hdr-right">
              <div class="invoice-title">FACTURA DE VENTA</div>
              <div style="font-size:16px;font-weight:bold;color:#ef4444;margin-bottom:10px">${inv.number}</div>
              <div>Fecha Emisión: ${(window as any).fmtDate(inv.date)}</div>
              <div>Fecha Vencimiento: ${(window as any).fmtDate(inv.due_date || inv.date)}</div>
              <div>Estado de Pago: <span style="font-weight:bold;text-transform:uppercase;color:${inv.status === 'posted' ? 'green' : 'orange'}">${inv.status === 'posted' ? 'CONTABILIZADA / VIGENTE' : 'BORRADOR / PRE-FACTURA'}</span></div>
            </td>
          </tr>
        </table>

        <!-- Datos del Cliente -->
        <div class="box">
          <div class="box-title">Adquirente / Cliente</div>
          <div class="details-grid">
            <div><span>Cliente:</span> ${inv.expand?.customer_id?.name || 'Consumidor Final'}</div>
            <div><span>NIT/Documento:</span> ${inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '—'}</div>
            <div><span>Dirección:</span> ${inv.expand?.customer_id?.address || '—'}</div>
            <div><span>Teléfono:</span> ${inv.expand?.customer_id?.phone || '—'}</div>
            <div><span>Forma de Pago:</span> ${inv.payment_method}</div>
            <div><span>Bodega Origen:</span> ${inv.expand?.warehouse_id?.name || '—'}</div>
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
            ${lines.map(l => `
              <tr>
                <td style="font-weight:600">${(window as any).esc(l.expand?.product_id?.name || l.description || 'Línea de Venta')}</td>
                <td style="text-align:right">${(window as any).fmtN(l.qty)}</td>
                <td style="text-align:right">${(window as any).fmt(l.unit_price)}</td>
                <td style="text-align:right">${l.iva_rate}%</td>
                <td style="text-align:right;font-weight:bold;color:#1e3a8a">${(window as any).fmt(l.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totales -->
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align:right;font-weight:600">${(window as any).fmt(inv.subtotal || 0)}</td>
          </tr>
          <tr>
            <td>IVA Calculado:</td>
            <td style="text-align:right;font-weight:600">${(window as any).fmt(inv.iva_total || 0)}</td>
          </tr>
          <tr>
            <td style="color:#d97706">Retenciones a favor:</td>
            <td style="text-align:right;font-weight:600;color:#d97706">- ${(window as any).fmt(inv.ret_total || 0)}</td>
          </tr>
          <tr class="grand-total">
            <td>TOTAL NETO:</td>
            <td style="text-align:right">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</td>
          </tr>
        </table>

        <!-- Footer / Notas legales -->
        <div class="footer">
          <p>Esta factura de venta se asimila en sus efectos a una Letra de Cambio según el Artículo 779 del Código de Comercio colombiano.</p>
          <p>Software de Gestión GRAVY v2.0 — Sistema de ERP y Control Administrativo Autorizado. Soporte Técnico: soporte@gravy.com</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
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
    const [inv, lines, history] = await Promise.all([
      (window as any).pb.get('invoices', id, { expand: 'customer_id,warehouse_id,tx_type_id' }),
      (window as any).API.getInvoiceLines(id),
      (window as any).pb.listAll('audit_logs', { filter: `entity="Invoice" && entity_id="${(window as any).pb.escapeFilterValue(id)}"`, sort: '-created' }).catch(() => []),
    ]);

    const meta = INV_STATUS[inv.status] || { label: inv.status, badge: 'badge-gray' };
    const client = inv.expand?.customer_id;
    const wh = inv.expand?.warehouse_id;

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
              <div class="flex justify-between font-semibold text-blue-700"><span>${h.action}</span><span>${h.created.slice(0, 19).replace('T', ' ')}</span></div>
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
                  <td><span class="font-mono text-xs text-blue-500 mr-1">[${(window as any).esc(l.expand?.product_id?.code || 'S/C')}]</span> ${(window as any).esc(l.expand?.product_id?.name || l.description)}</td>
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
      ${inv.status === 'draft' ? `
        <button class="btn btn-primary" onclick="closeModal(); window.editSalesInvoice('${inv.id}')"><i class="fas fa-pen"></i> Editar</button>
        <button class="btn btn-primary" onclick="closeModal(); window.contabilizarVenta('${inv.id}', '${inv.number}')"><i class="fas fa-check-double"></i> Contabilizar</button>
      ` : ''}
      ${inv.status === 'posted' ? `
        <button class="btn btn-secondary" onclick="window.emitInvoiceToDian('${inv.tx_id}', '${inv.number}')"><i class="fas fa-paper-plane mr-1"></i> Emitir a DIAN</button>
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
        (window as any).showToast(err.message || 'Error al emitir a la DIAN', 'error');
      }
    }
  );
};

window.editSalesInvoice = function(id: string) {
  openSalesForm(id, () => renderVentas(document.getElementById('page-content')!));
};

window.contabilizarVenta = function(id: string, number: string) {
  (window as any).confirmDialog(
    'Contabilizar Factura de Venta',
    `¿Confirmas la contabilización en caliente de la factura de venta <strong>${number}</strong>?<br><br>
     Esta operación:<br>
     • Reducirá las existencias en bodega físicas vía Kardex (Movimiento SALIDA)<br>
     • Publicará el asiento contable diario de cobro e IVA generado<br>
     • Registrará automáticamente el Costo de Ventas (COGS) a costo promedio en el diario contable`,
    async () => {
      try {
        await (window as any).API.postInvoice(id);
        (window as any).showToast(`Factura ${number} contabilizada exitosamente con Kardex y COGS`, 'success');
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

// Inyecciones globales
(window as any).salesKpi = salesKpi;
(window as any).renderVentas = renderVentas;
(window as any).openSalesSettingsModal = openSalesSettingsModal;
(window as any).saveSalesConfig = saveSalesConfig;
(window as any).openSalesForm = openSalesForm;
