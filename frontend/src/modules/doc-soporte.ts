/**
 * GRAVY v2.0 — doc-soporte.ts
 * Módulo independiente de Documentos Soporte Electrónicos (DS) y Notas de Ajuste (NDS)
 * para Compras a Sujetos No Obligados a Facturar.
 * Corrección de persistencia de configuración en colección 'settings' vía API.setSetting / API.getSetting.
 */

'use strict';

declare var pb: any;
declare var esc: (val: any) => string;
declare var can: (perm: string) => boolean;
declare var requireRole: (role: string) => boolean;
declare var showToast: (msg: string, type?: string) => void;
declare var confirmDialog: (title: string, msg: string, callback: () => void) => void;
declare var openModal: (title: string, body: string, footer: string, large?: boolean) => void;
declare var closeModal: () => void;
declare var fmtDate: (dateStr: string) => string;
declare var fmt: (val: any) => string;
declare var openTerceroForm: (id: string | null, callback: (record: any) => void) => void;

interface DocSoporteItem {
  id: string;
  tx_id?: string;
  number: string;
  date: string;
  due_date?: string;
  supplier_id: string;
  supplier_name: string;
  supplier_nit: string;
  total: number;
  subtotal: number;
  ret_total: number;
  status: string; // 'draft' | 'posted' | 'voided'
  status_dian: string; // 'pendiente' | 'enviada' | 'aceptada' | 'rechazada' | 'borrador'
  cuds?: string;
  xml_content?: string;
  dian_response?: string;
  doc_type: string; // 'DS' | 'NDS'
  payment_form?: string;
  payment_dian_code?: string;
  bank_account_id?: string;
  warehouse_id?: string;
  expand?: any;
}

const DOC_SOPORTE_CONFIG_KEY = 'doc_soporte_config_v1';

function defaultDocSoporteConfig() {
  return {
    operational: {
      enable_withholdings: true,
      default_due_days: 30,
      immediate_posting: false,
      auto_emit_dian: true,
    },
    accounting: {
      accounts: {
        payable_code: '220505',
        expense_fallback_code: '5135',
        cash_account_code: '110505',
        bank_account_code: '111005',
        discount_code: '',
      },
      withholding_rules: [
        {
          id: 'wr-ds-renta-3_5',
          concept: 'RETERENTA',
          base_type: 'SUBTOTAL',
          min_base: 0,
          rate: 3.5,
          account_code: '236540',
        },
        {
          id: 'wr-ds-renta-4_0',
          concept: 'RETERENTA',
          base_type: 'SUBTOTAL',
          min_base: 0,
          rate: 4.0,
          account_code: '236540',
        },
        {
          id: 'wr-ds-ica-0_7',
          concept: 'RETEICA',
          base_type: 'SUBTOTAL',
          min_base: 0,
          rate: 0.7,
          account_code: '236805',
        },
      ],
    },
  };
}

async function getDocSoporteConfig() {
  try {
    let raw = '';
    if ((window as any).API?.getSetting) {
      raw = await (window as any).API.getSetting(DOC_SOPORTE_CONFIG_KEY);
    } else {
      const res = await pb.list('settings', { filter: `key="${DOC_SOPORTE_CONFIG_KEY}"`, perPage: 1 }).catch(() => null);
      raw = res?.items?.[0]?.value || '';
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        operational: { ...defaultDocSoporteConfig().operational, ...(parsed.operational || {}) },
        accounting: {
          accounts: { ...defaultDocSoporteConfig().accounting.accounts, ...(parsed.accounting?.accounts || {}) },
          withholding_rules: Array.isArray(parsed.accounting?.withholding_rules) && parsed.accounting.withholding_rules.length
            ? parsed.accounting.withholding_rules
            : defaultDocSoporteConfig().accounting.withholding_rules
        }
      };
    }
  } catch (_) {}
  return defaultDocSoporteConfig();
}

async function saveDocSoporteConfig(cfg: any) {
  const payload = JSON.stringify(cfg);
  if ((window as any).API?.setSetting) {
    await (window as any).API.setSetting(DOC_SOPORTE_CONFIG_KEY, payload);
  } else {
    const existing = await pb.list('settings', { filter: `key="${DOC_SOPORTE_CONFIG_KEY}"`, perPage: 1 }).catch(() => null);
    if (existing && existing.items && existing.items.length) {
      await pb.update('settings', existing.items[0].id, { value: payload });
    } else {
      await pb.create('settings', { key: DOC_SOPORTE_CONFIG_KEY, value: payload });
    }
  }
}

// ── Render Principal ──────────────────────────────────────────────────────────
export async function renderDocSoporte(container: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  container = getContainer(container);
  if (!container) return;
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Documentos Soporte Electrónicos...</div>`;
  try {
    await loadDocSoportePage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Error al cargar módulo: ${esc(err.message)}</div>`;
  }
}

async function loadDocSoportePage(c: HTMLElement) {
  const [dsResolutions, docs, txs, purInvoices, thirds] = await Promise.all([
    pb.listAll('dian_resolutions', { filter: 'active=true && (document_type="DS" || document_type="NDS")' }).catch(() => []),
    pb.listAll('einvoice_docs', { sort: '-id' }).catch(() => []),
    pb.listAll('transactions', { sort: '-date,-id', expand: 'tx_type_id,third_party_id' }).catch(() => []),
    pb.listAll('purchase_invoices', { sort: '-date,-id', expand: 'supplier_id,tx_type_id' }).catch(() => []),
    pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }).catch(() => [])
  ]);

  const docMap = new Map<string, any>();
  docs.forEach((d: any) => { if (d.tx_id) docMap.set(d.tx_id, d); });

  const dsPrefixes = new Set(dsResolutions.map((r: any) => String(r.prefix || '').toUpperCase()));

  const dsList: DocSoporteItem[] = [];

  purInvoices.forEach((p: any) => {
    const code = String(p.expand?.tx_type_id?.code || '').toUpperCase();
    const prefix = String(p.number || '').split('-')[0].toUpperCase();
    if (code === 'DS' || code === 'NDS' || dsPrefixes.has(prefix) || String(p.number || '').startsWith('DS')) {
      const doc = p.tx_id ? docMap.get(p.tx_id) : null;
      const statusDian = doc ? (doc.status || 'pendiente') : (p.status === 'draft' ? 'borrador' : 'pendiente');

      dsList.push({
        id: p.id,
        tx_id: p.tx_id || '',
        number: p.number || 'DS-BORRADOR',
        date: p.date || '',
        supplier_id: p.supplier_id || '',
        supplier_name: p.expand?.supplier_id?.name || 'Sujeto No Obligado',
        supplier_nit: p.expand?.supplier_id?.doc_number || 'NIT',
        total: p.total || p.payable_total || 0,
        subtotal: p.subtotal || 0,
        ret_total: p.ret_total || 0,
        status: p.status || 'draft',
        status_dian: statusDian,
        cuds: doc?.cufe || doc?.hash || '',
        xml_content: doc?.xml_content || '',
        dian_response: doc?.dian_response || '',
        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        expand: p.expand
      });
    }
  });

  txs.forEach((t: any) => {
    const code = String(t.expand?.tx_type_id?.code || '').toUpperCase();
    const prefix = String(t.expand?.tx_type_id?.prefix || '').toUpperCase();
    if ((code === 'DS' || code === 'NDS' || dsPrefixes.has(prefix)) && !dsList.some(d => d.tx_id === t.id)) {
      const doc = docMap.get(t.id);
      const statusDian = doc ? (doc.status || 'pendiente') : (t.status === 'draft' ? 'borrador' : 'pendiente');

      dsList.push({
        id: t.id,
        tx_id: t.id,
        number: t.number || '',
        date: t.date || '',
        supplier_id: t.third_party_id || '',
        supplier_name: t.expand?.third_party_id?.name || 'Sujeto No Obligado',
        supplier_nit: t.expand?.third_party_id?.doc_number || 'NIT',
        total: t.cross_amount || 0,
        subtotal: t.net_amount || (t.cross_amount || 0),
        ret_total: t.ret_amount || 0,
        status: t.status === 'draft' ? 'draft' : 'posted',
        status_dian: statusDian,
        cuds: doc?.cufe || doc?.hash || '',
        xml_content: doc?.xml_content || '',
        dian_response: doc?.dian_response || '',
        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        expand: t.expand
      });
    }
  });

function getDsPeriodDates(periodType: string): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmtStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (periodType === 'CURRENT_MONTH') {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { from: fmtStr(start), to: fmtStr(end) };
  } else if (periodType === 'PREV_MONTH') {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { from: fmtStr(start), to: fmtStr(end) };
  } else if (periodType === 'CURRENT_QUARTER') {
    const qStartMonth = Math.floor(month / 3) * 3;
    const start = new Date(year, qStartMonth, 1);
    const end = new Date(year, qStartMonth + 3, 0);
    return { from: fmtStr(start), to: fmtStr(end) };
  } else if (periodType === 'CURRENT_YEAR') {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return { from: fmtStr(start), to: fmtStr(end) };
  }
  return { from: '', to: '' };
}

  const defaultDates = getDsPeriodDates('CURRENT_MONTH');

  c.innerHTML = `
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-xl font-bold" style="color:#0D2137">
          <i class="fas fa-file-signature text-indigo-600 mr-2"></i>Documento Soporte Electrónico (DS / NDS)
        </h3>
        <p class="text-sm" style="color:#6B7280">Emisión, firma digital y transmisión ante la DIAN para adquisiciones a sujetos no obligados a facturar.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline" id="btn-ds-config" title="Configuración general y contable de Documento Soporte">
          <i class="fas fa-gear mr-1"></i>Configuración
        </button>
        <button class="btn btn-primary" id="btn-nuevo-ds">
          <i class="fas fa-plus mr-1"></i>Nuevo Documento Soporte (DS)
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div id="ds-kpi-container" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="bg-white rounded-2xl p-4 shadow-sm mb-5 border flex flex-wrap items-center justify-between gap-3" style="border-color:#E2E8F0">
      <div class="flex flex-wrap items-center gap-3 flex-1">
        <div class="relative flex-1 min-w-[200px]">
          <i class="fas fa-search absolute left-3 top-3 text-slate-400"></i>
          <input type="text" id="ds-search-input" class="form-input pl-9 w-full" placeholder="Buscar por número, proveedor o NIT...">
        </div>
        <select id="ds-filter-period" class="form-input w-[150px]">
          <option value="CURRENT_MONTH" selected>Mes Actual</option>
          <option value="PREV_MONTH">Mes Anterior</option>
          <option value="CURRENT_QUARTER">Trimestre Actual</option>
          <option value="CURRENT_YEAR">Año Actual</option>
          <option value="CUSTOM">Personalizado</option>
          <option value="ALL">Todos los períodos</option>
        </select>
        <div class="flex items-center gap-1">
          <input type="date" id="ds-filter-from" class="form-input text-xs w-[135px]" value="${defaultDates.from}" title="Fecha Desde">
          <span class="text-slate-400 text-xs">—</span>
          <input type="date" id="ds-filter-to" class="form-input text-xs w-[135px]" value="${defaultDates.to}" title="Fecha Hasta">
        </div>
        <select id="ds-filter-status" class="form-input w-[160px]">
          <option value="ALL">Todos los estados</option>
          <option value="borrador">Borradores</option>
          <option value="pendiente">Pendiente DIAN</option>
          <option value="enviada">Enviada / Transmitida</option>
          <option value="aceptada">Aceptada DIAN</option>
          <option value="rechazada">Rechazada DIAN</option>
        </select>
        <select id="ds-filter-type" class="form-input w-[150px]">
          <option value="ALL">Todos los tipos</option>
          <option value="DS">DS (Doc Soporte)</option>
          <option value="NDS">NDS (Nota Ajuste)</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden shadow-sm" style="border-color:#E2E8F0">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse" id="ds-table">
          <thead>
            <tr class="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b" style="border-color:#E2E8F0">
              <th class="p-3">Tipo / Número</th>
              <th class="p-3">Fecha</th>
              <th class="p-3">Sujeto No Obligado (Proveedor)</th>
              <th class="p-3 text-right">Total</th>
              <th class="p-3 text-center">Estado DIAN</th>
              <th class="p-3">CUDS / Firma</th>
              <th class="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm" id="ds-table-body">
          </tbody>
        </table>
      </div>
    </div>
  `;

  (window as any).__lastDsList = dsList;
  (window as any).__lastDsResolutions = dsResolutions;

  document.getElementById('btn-ds-config')?.addEventListener('click', () => openDocSoporteSettingsModal());
  document.getElementById('btn-nuevo-ds')?.addEventListener('click', () => openNuevoDsModal(null, dsResolutions, thirds));

  const searchInput = document.getElementById('ds-search-input') as HTMLInputElement;
  const filterPeriod = document.getElementById('ds-filter-period') as HTMLSelectElement;
  const filterFrom = document.getElementById('ds-filter-from') as HTMLInputElement;
  const filterTo = document.getElementById('ds-filter-to') as HTMLInputElement;
  const filterStatus = document.getElementById('ds-filter-status') as HTMLSelectElement;
  const filterType = document.getElementById('ds-filter-type') as HTMLSelectElement;

  const updateKpis = (filteredItems: DocSoporteItem[]) => {
    const totalCount = filteredItems.length;
    const pendingCount = filteredItems.filter(d => d.status_dian === 'pendiente' || d.status_dian === 'borrador').length;
    const acceptedCount = filteredItems.filter(d => d.status_dian === 'aceptada' || d.status_dian === 'enviada').length;
    const rejectedCount = filteredItems.filter(d => d.status_dian === 'rechazada').length;
    const totalAmount = filteredItems.reduce((acc, d) => acc + (d.total || 0), 0);

    const kpiWrap = document.getElementById('ds-kpi-container');
    if (kpiWrap) {
      kpiWrap.innerHTML = `
        ${dsKpiCard('Total Generados', totalCount, 'fas fa-file-contract', '#1E40AF', '#EFF6FF')}
        ${dsKpiCard('Pendientes DIAN', pendingCount, 'fas fa-clock', '#D97706', '#FFFBEB')}
        ${dsKpiCard('Transmitidos / Aceptados', acceptedCount, 'fas fa-circle-check', '#059669', '#ECFDF5')}
        ${dsKpiCard('Rechazados DIAN', rejectedCount, 'fas fa-circle-xmark', '#DC2626', '#FEF2F2')}
        ${dsKpiCard('Monto Total DS', fmt(totalAmount), 'fas fa-money-bill-wave', '#4F46E5', '#EEF2FF')}
      `;
    }
  };

  const filterFn = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const st = filterStatus?.value || 'ALL';
    const tp = filterType?.value || 'ALL';
    const fromVal = filterFrom?.value || '';
    const toVal = filterTo?.value || '';

    const filtered = dsList.filter(d => {
      const dDate = String(d.date || '').slice(0, 10);
      const matchQ = !q || d.number.toLowerCase().includes(q) || d.supplier_name.toLowerCase().includes(q) || d.supplier_nit.includes(q);
      const matchSt = st === 'ALL' || (st === 'pendiente' ? (d.status_dian === 'pendiente' || d.status_dian === 'borrador') : d.status_dian === st);
      const matchTp = tp === 'ALL' || d.doc_type === tp;
      const matchFrom = !fromVal || dDate >= fromVal;
      const matchTo = !toVal || dDate <= toVal;
      return matchQ && matchSt && matchTp && matchFrom && matchTo;
    });

    updateKpis(filtered);
    const tbody = document.getElementById('ds-table-body');
    if (tbody) tbody.innerHTML = renderDsRows(filtered);
  };

  filterPeriod?.addEventListener('change', () => {
    const pVal = filterPeriod.value;
    if (pVal !== 'CUSTOM') {
      const pDates = getDsPeriodDates(pVal);
      if (filterFrom) filterFrom.value = pDates.from;
      if (filterTo) filterTo.value = pDates.to;
    }
    filterFn();
  });

  filterFrom?.addEventListener('change', () => {
    if (filterPeriod) filterPeriod.value = 'CUSTOM';
    filterFn();
  });
  filterTo?.addEventListener('change', () => {
    if (filterPeriod) filterPeriod.value = 'CUSTOM';
    filterFn();
  });

  searchInput?.addEventListener('input', filterFn);
  filterStatus?.addEventListener('change', filterFn);
  filterType?.addEventListener('change', filterFn);

  // Ejecución inicial de filtrado
  filterFn();
}

function dsKpiCard(label: string, val: any, icon: string, color: string, bg: string) {
  return `
    <div class="rounded-2xl p-4 border" style="background:${bg};border-color:${color}20">
      <div class="flex items-center gap-2 mb-1">
        <i class="${icon} text-sm" style="color:${color}"></i>
        <span class="text-xs font-bold" style="color:${color}">${label}</span>
      </div>
      <p class="text-2xl font-extrabold" style="color:${color}">${val}</p>
    </div>
  `;
}

function renderDsRows(list: DocSoporteItem[]): string {
  if (!list.length) {
    return `<tr><td colspan="7" class="p-8 text-center text-slate-400">No se encontraron Documentos Soporte o Notas de Ajuste registrados.</td></tr>`;
  }

  const badgeMap: Record<string, { cls: string; label: string; icon: string }> = {
    borrador:  { cls: 'bg-slate-100 text-slate-700', label: 'Borrador', icon: 'fa-pencil' },
    pendiente: { cls: 'bg-amber-100 text-amber-800', label: 'Pendiente DIAN', icon: 'fa-clock' },
    enviada:   { cls: 'bg-blue-100 text-blue-800',   label: 'Transmitida', icon: 'fa-paper-plane' },
    aceptada:  { cls: 'bg-emerald-100 text-emerald-800', label: 'Aceptada DIAN', icon: 'fa-circle-check' },
    rechazada: { cls: 'bg-rose-100 text-rose-800',   label: 'Rechazada DIAN', icon: 'fa-circle-xmark' },
  };

  return list.map(d => {
    const st = badgeMap[d.status_dian] || badgeMap.pendiente;
    const isNDS = d.doc_type === 'NDS';
    const isDraft = d.status_dian === 'borrador' || d.status === 'draft';

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3 font-semibold text-slate-900">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${isNDS ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}">
              ${d.doc_type}
            </span>
            <span>${esc(d.number || 'DS-BORRADOR')}</span>
          </div>
        </td>
        <td class="p-3 text-slate-600">${fmtDate(d.date)}</td>
        <td class="p-3 text-slate-800 font-medium">
          <div>${esc(d.supplier_name)}</div>
          <div class="text-xs text-slate-400">NIT: ${esc(d.supplier_nit)}</div>
        </td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${fmt(d.total)}</td>
        <td class="p-3 text-center">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}">
            <i class="fas ${st.icon} text-[10px]"></i>${st.label}
          </span>
        </td>
        <td class="p-3 text-xs font-mono text-slate-500">
          ${d.cuds ? `<span title="${esc(d.cuds)}">${esc(d.cuds.slice(0, 16))}...</span>` : '<span class="text-slate-300">—</span>'}
        </td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center gap-1">
            <button class="btn btn-outline btn-sm p-1.5" title="Ver Detalle" onclick="window.viewDsDetail('${esc(d.id)}','${esc(d.tx_id || '')}')">
              <i class="fas fa-eye text-gray-600"></i>
            </button>
            
            ${isDraft ? `
              <button class="btn btn-outline btn-sm p-1.5 border-slate-500 hover:bg-slate-50 text-slate-700" title="Editar Borrador" onclick="window.openEditDsModal('${esc(d.id)}')">
                <i class="fas fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-sm p-1.5 border-emerald-600 hover:bg-emerald-50 text-emerald-700" title="Contabilizar Borrador" onclick="window.contabilizarDsRow('${esc(d.id)}')">
                <i class="fas fa-calculator"></i>
              </button>
            ` : ''}

            ${d.status_dian !== 'aceptada' ? `
              <button class="btn btn-outline btn-sm p-1.5 border-orange-500 hover:bg-orange-50" title="Solicitar Firma DIAN" onclick="window.emitDsDocFromRow('${esc(d.id)}', '${esc(d.tx_id || '')}', '${esc(d.number)}')">
                <i class="fas fa-paper-plane text-orange-600"></i>
              </button>
            ` : ''}

            ${d.status_dian === 'enviada' ? `
              <button class="btn btn-outline btn-sm p-1.5 border-blue-500 hover:bg-blue-50" title="Consultar Estado Facturatech" onclick="window.checkFtechStatus('${esc(d.id)}','${esc(d.tx_id || '')}')">
                <i class="fas fa-arrows-rotate text-blue-600"></i>
              </button>
            ` : ''}

            ${(d.xml_content || d.status_dian === 'aceptada' || d.status_dian === 'enviada') ? `
              <button class="btn btn-outline btn-sm p-1.5 border-emerald-500 hover:bg-emerald-50" title="Descargar ZIP XML" onclick="window.downloadDianZip('${esc(d.tx_id || d.id)}', '${esc(d.number)}')">
                <i class="fas fa-file-zipper text-emerald-600"></i>
              </button>
            ` : ''}

            ${d.status_dian === 'aceptada' ? `
              <button class="btn btn-outline btn-sm p-1.5 border-sky-500 hover:bg-sky-50" title="Reenviar Correo Proveedor" onclick="window.resendDianEmail('${esc(d.tx_id || d.id)}', '${esc(d.number)}')">
                <i class="fas fa-envelope text-sky-600"></i>
              </button>
            ` : ''}

            ${d.doc_type === 'DS' && d.status_dian === 'aceptada' ? `
              <button class="btn btn-outline btn-sm p-1.5 border-purple-500 hover:bg-purple-50" title="Crear Nota de Ajuste (NDS)" onclick="window.openNotaAjusteForDs('${esc(d.id)}', '${esc(d.number)}')">
                <i class="fas fa-rotate-left text-purple-600"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Modal de Configuración General y Contable Completa ─────────────────────────
async function openDocSoporteSettingsModal() {
  const [cfg, accounts] = await Promise.all([
    getDocSoporteConfig(),
    pb.listAll('accounts', { filter: 'active=true', sort: 'code' }).catch(() => [])
  ]);

  const accountOptions = (selectedCode = '') => {
    return `<option value="">— Sin definir —</option>` + accounts.map((a: any) => 
      `<option value="${esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${esc(a.code)} — ${esc(a.name)}</option>`
    ).join('');
  };

  const conceptOpts = ['RETERENTA', 'RETEIVA', 'RETEICA', 'OTRA'];
  const baseTypeOpts = ['SUBTOTAL', 'IVA', 'TOTAL'];

  const bodyHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="rounded-xl border p-4 bg-slate-50 border-slate-200">
        <h4 class="font-bold text-slate-800 mb-1"><i class="fas fa-sliders mr-2 text-indigo-600"></i>Parámetros Operativos</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-2">
          <label class="inline-flex items-center gap-2"><input id="ds-cfg-withholding" type="checkbox" ${cfg.operational.enable_withholdings ? 'checked' : ''}>Habilitar cálculo de retenciones</label>
          <label class="inline-flex items-center gap-2"><input id="ds-cfg-auto-emit" type="checkbox" ${cfg.operational.auto_emit_dian ? 'checked' : ''}>Transmitir a la DIAN automáticamente al guardar</label>
          <div class="form-group mb-0">
            <label class="form-label font-semibold">Plazo vencimiento por defecto (días)</label>
            <input id="ds-cfg-default-due" class="form-input text-xs" type="number" min="0" value="${esc(String(cfg.operational.default_due_days || 30))}">
          </div>
        </div>
      </div>

      <div class="rounded-xl border p-4 bg-slate-50 border-slate-200">
        <h4 class="font-bold text-slate-800 mb-1"><i class="fas fa-book mr-2 text-indigo-600"></i>Cuentas Contables Predeterminadas</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
          <div>
            <label class="form-label font-semibold">Cuenta Pasivo / Cuentas por Pagar (Cr)</label>
            <select id="ds-cfg-payable" class="form-input text-xs">${accountOptions(cfg.accounting.accounts.payable_code)}</select>
          </div>
          <div>
            <label class="form-label font-semibold">Cuenta Gasto Fallback / Servicio (Dr)</label>
            <select id="ds-cfg-exp-fallback" class="form-input text-xs">${accountOptions(cfg.accounting.accounts.expense_fallback_code)}</select>
          </div>
          <div>
            <label class="form-label font-semibold">Cuenta Medio de Pago Efectivo / Caja (Dr/Cr)</label>
            <select id="ds-cfg-cash-acct" class="form-input text-xs">${accountOptions(cfg.accounting.accounts.cash_account_code)}</select>
          </div>
          <div>
            <label class="form-label font-semibold">Cuenta Medio de Pago Transferencia / Banco (Dr/Cr)</label>
            <select id="ds-cfg-bank-acct" class="form-input text-xs">${accountOptions(cfg.accounting.accounts.bank_account_code)}</select>
          </div>
        </div>
      </div>

      <!-- Tabla de Configuración Dinámica de Retenciones -->
      <div class="rounded-xl border p-4 bg-slate-50 border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h4 class="font-bold text-slate-800"><i class="fas fa-percent mr-2 text-indigo-600"></i>Reglas de Retención (ReteFuente, ReteICA, ReteIVA)</h4>
            <p class="text-xs text-slate-500">Configura los porcentajes, bases mínimas y cuentas contables pasivas de retención.</p>
          </div>
          <button type="button" class="btn btn-xs btn-outline" id="btn-add-ds-cfg-ret"><i class="fas fa-plus mr-1"></i>Agregar regla</button>
        </div>
        <div id="ds-cfg-ret-rules-wrap" class="space-y-2 mt-3"></div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-ds-cfg"><i class="fas fa-check mr-1"></i>Guardar Configuración</button>
  `;

  openModal('Configuración General y Contable — Documento Soporte', bodyHtml, footer, true);

  const retWrap = document.getElementById('ds-cfg-ret-rules-wrap');
  const addRetRuleRow = (rule: any = {}) => {
    if (!retWrap) return;
    const row = document.createElement('div');
    row.className = 'grid grid-cols-12 gap-2 items-center text-xs bg-white p-2 rounded border border-slate-200';
    row.innerHTML = `
      <div class="col-span-2">
        <label class="text-[10px] text-slate-400 font-bold block">Concepto</label>
        <select class="form-input text-xs ds-cfg-ret-concept">${conceptOpts.map(o => `<option value="${o}"${String(rule.concept || '') === o ? ' selected' : ''}>${o}</option>`).join('')}</select>
      </div>
      <div class="col-span-2">
        <label class="text-[10px] text-slate-400 font-bold block">Base</label>
        <select class="form-input text-xs ds-cfg-ret-base-type">${baseTypeOpts.map(o => `<option value="${o}"${String(rule.base_type || 'SUBTOTAL') === o ? ' selected' : ''}>${o}</option>`).join('')}</select>
      </div>
      <div class="col-span-2">
        <label class="text-[10px] text-slate-400 font-bold block">Base Mín.</label>
        <input class="form-input text-xs ds-cfg-ret-min-base" type="number" min="0" step="0.01" value="${esc(String(rule.min_base ?? 0))}">
      </div>
      <div class="col-span-2">
        <label class="text-[10px] text-slate-400 font-bold block">Tarifa %</label>
        <input class="form-input text-xs ds-cfg-ret-rate" type="number" min="0" step="0.01" value="${esc(String(rule.rate ?? 0))}">
      </div>
      <div class="col-span-3">
        <label class="text-[10px] text-slate-400 font-bold block">Cuenta Contable</label>
        <select class="form-input text-xs ds-cfg-ret-account">${accountOptions(rule.account_code || '')}</select>
      </div>
      <div class="col-span-1 text-right pt-3">
        <button type="button" class="text-rose-500 hover:text-rose-700 ds-cfg-ret-del"><i class="fas fa-trash"></i></button>
      </div>
    `;
    row.querySelector('.ds-cfg-ret-del')?.addEventListener('click', () => row.remove());
    retWrap.appendChild(row);
  };

  const currentRules = cfg.accounting.withholding_rules || [];
  if (currentRules.length) {
    currentRules.forEach((r: any) => addRetRuleRow(r));
  } else {
    addRetRuleRow({ concept: 'RETERENTA', rate: 3.5, account_code: '236540' });
  }

  document.getElementById('btn-add-ds-cfg-ret')?.addEventListener('click', () => addRetRuleRow({ concept: 'RETERENTA', rate: 3.5 }));

  document.getElementById('btn-save-ds-cfg')?.addEventListener('click', async () => {
    cfg.operational.enable_withholdings = (document.getElementById('ds-cfg-withholding') as HTMLInputElement).checked;
    cfg.operational.auto_emit_dian = (document.getElementById('ds-cfg-auto-emit') as HTMLInputElement).checked;
    cfg.operational.default_due_days = parseInt((document.getElementById('ds-cfg-default-due') as HTMLInputElement).value || '30', 10);
    
    cfg.accounting.accounts.payable_code = (document.getElementById('ds-cfg-payable') as HTMLSelectElement).value;
    cfg.accounting.accounts.expense_fallback_code = (document.getElementById('ds-cfg-exp-fallback') as HTMLSelectElement).value;
    cfg.accounting.accounts.cash_account_code = (document.getElementById('ds-cfg-cash-acct') as HTMLSelectElement).value;
    cfg.accounting.accounts.bank_account_code = (document.getElementById('ds-cfg-bank-acct') as HTMLSelectElement).value;

    const newRules: any[] = [];
    document.querySelectorAll('#ds-cfg-ret-rules-wrap > div').forEach((row: any, idx: number) => {
      const concept = row.querySelector('.ds-cfg-ret-concept')?.value || 'RETERENTA';
      const base_type = row.querySelector('.ds-cfg-ret-base-type')?.value || 'SUBTOTAL';
      const min_base = parseFloat(row.querySelector('.ds-cfg-ret-min-base')?.value || '0');
      const rate = parseFloat(row.querySelector('.ds-cfg-ret-rate')?.value || '0');
      const account_code = row.querySelector('.ds-cfg-ret-account')?.value || '';
      if (rate > 0 || account_code) {
        newRules.push({
          id: `wr-ds-${Date.now()}-${idx}`,
          concept,
          base_type,
          min_base,
          rate,
          account_code
        });
      }
    });
    cfg.accounting.withholding_rules = newRules;

    await saveDocSoporteConfig(cfg);
    showToast('Configuración de Documento Soporte actualizada.', 'success');
    closeModal();
  });
}

// ── Modal de Creación / Edición de Documento Soporte ──────────────────────────
async function openNuevoDsModal(editId: string | null = null, preResolutions: any[] = [], preThirds: any[] = []) {
  const [resolutions, thirdParties, bankAccounts, txTypes, warehouses, products, accounts, cfg] = await Promise.all([
    preResolutions.length ? preResolutions : pb.listAll('dian_resolutions', { filter: 'active=true && document_type="DS"' }),
    preThirds.length ? preThirds : pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    pb.listAll('bank_accounts', { filter: 'active=true', sort: 'name' }).catch(() => []),
    pb.listAll('transaction_types', { filter: 'active=true' }).catch(() => []),
    (window as any).API?.getWarehouses ? (window as any).API.getWarehouses(true) : pb.listAll('warehouses', { filter: 'active=true' }).catch(() => []),
    (window as any).API?.getProducts ? (window as any).API.getProducts({ activeOnly: true }) : pb.listAll('products', { filter: 'active=true' }).catch(() => []),
    pb.listAll('accounts', { filter: 'active=true', sort: 'code' }).catch(() => []),
    getDocSoporteConfig()
  ]);

  (window as any).__dsAccountsCache = accounts;
  (window as any).__dsProductsCache = products;
  (window as any).__dsRetRulesCache = cfg.accounting.withholding_rules || [];

  const dsResolutions = resolutions.filter((r: any) => r.document_type === 'DS');
  const dsTxTypes = txTypes.filter((t: any) => String(t.code).toUpperCase() === 'DS' || dsResolutions.some((r: any) => r.prefix === t.prefix));

  let existingPur: any = null, existingLines: any[] = [];

  if (editId) {
    existingPur = await pb.get('purchase_invoices', editId, { expand: 'supplier_id,tx_type_id' }).catch(() => null);
    if (!existingPur) {
      try {
        existingPur = await pb.getFirstRecordByFilter('purchase_invoices', `tx_id = "${pb.escapeFilterValue(editId)}"`, { expand: 'supplier_id,tx_type_id' });
      } catch (_) {}
    }
    if (existingPur) {
      existingLines = await pb.listAll('purchase_invoice_lines', { filter: `invoice_id = "${existingPur.id}"`, expand: 'product_id,account_id' });
    }
  }

  const withholdingRules = cfg.accounting.withholding_rules || [];

  // ══ REGISTRO PREVIO DE FUNCIONES EN WINDOW ══
  (window as any).dsUpdateConsecutivoPreview = (sourceTrigger?: 'tx_type' | 'resolution') => {
    const txTypeSel = document.getElementById('ds-tx-type') as HTMLSelectElement;
    const resSel = document.getElementById('ds-resolution-id') as HTMLSelectElement;
    const prevEl = document.getElementById('ds-consecutivo-preview') as HTMLInputElement;
    if (!prevEl) return;

    let selectedTxType = txTypes.find((t: any) => t.id === txTypeSel?.value);
    let selectedRes = resolutions.find((r: any) => r.id === resSel?.value);

    if (sourceTrigger === 'tx_type' && selectedTxType) {
      // Al cambiar comprobante contable, buscar la resolución cuyo prefijo coincida exactamente
      const matchingRes = resolutions.find((r: any) => r.prefix === selectedTxType.prefix);
      if (resSel) {
        if (matchingRes) {
          resSel.value = matchingRes.id;
          selectedRes = matchingRes;
        } else {
          resSel.value = '';
          selectedRes = null;
        }
      }
    } else if (sourceTrigger === 'resolution') {
      if (selectedRes) {
        // Al cambiar resolución, buscar el comprobante contable con el mismo prefijo
        const matchingTxType = txTypes.find((t: any) => t.prefix === selectedRes.prefix);
        if (matchingTxType && txTypeSel) {
          txTypeSel.value = matchingTxType.id;
          selectedTxType = matchingTxType;
        }
      }
    } else {
      // Sincronía inicial o por defecto
      if (selectedTxType) {
        const matchingRes = resolutions.find((r: any) => r.prefix === selectedTxType.prefix);
        if (resSel) {
          if (matchingRes) {
            resSel.value = matchingRes.id;
            selectedRes = matchingRes;
          } else {
            resSel.value = '';
            selectedRes = null;
          }
        }
      }
    }

    if (selectedRes) {
      const nextNum = (selectedRes.current_number ? selectedRes.current_number + 1 : selectedRes.number_from) || 1;
      const prefix = selectedRes.prefix ? selectedRes.prefix + '-' : '';
      prevEl.value = `${prefix}${nextNum}`;
      prevEl.style.color = '#1E293B';
    } else {
      prevEl.value = 'Sin resolución DIAN asociada';
      prevEl.style.color = '#EF4444';
    }
  };

  (window as any).dsOnPaymentDianCodeChange = () => {
    const codeSel = document.getElementById('ds-payment-dian-code') as HTMLSelectElement;
    const bankWrap = document.getElementById('ds-bank-account-wrap');
    if (!codeSel || !bankWrap) return;
    const code = codeSel.value;
    const requiresBank = (code === '42' || code === '47' || code === '48' || code === '49');
    bankWrap.style.display = requiresBank ? 'block' : 'none';
  };

  (window as any).dsSetRetMode = (isPerLine: boolean) => {
    (window as any).__dsRetMode = isPerLine ? 'line' : 'header';
    document.querySelectorAll('.ds-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });
    const hdrWrap = document.getElementById('ds-hdr-ret-wrap');
    if (hdrWrap) hdrWrap.style.display = isPerLine ? 'none' : 'block';
    if (typeof (window as any).recalcDsTotals === 'function') {
      (window as any).recalcDsTotals();
    }
  };

  (window as any).recalcDsTotals = () => {
    const rows = document.querySelectorAll('#ds-lines-body tr');
    let subtotalSum = 0, retSum = 0;
    const isPerLine = (window as any).__dsRetMode === 'line';

    rows.forEach((r: any) => {
      const idx = r.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`dsl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`dsl-price-${idx}`) as HTMLInputElement)?.value || '0');

      const lineSub = qty * price;

      let lineRet = 0;
      if (isPerLine) {
        const ruleId = (document.getElementById(`dsl-ret-rule-${idx}`) as HTMLSelectElement)?.value;
        const rule = withholdingRules.find((rr: any) => rr.id === ruleId);
        if (rule) lineRet = Math.round(lineSub * (Number(rule.rate || 0) / 100));
        const valRetEl = document.getElementById(`dsl-ret-val-${idx}`);
        if (valRetEl) valRetEl.textContent = fmt(lineRet);
      }

      const lineTotal = lineSub - lineRet;
      const totEl = document.getElementById(`dsl-total-${idx}`);
      if (totEl) totEl.textContent = fmt(lineTotal);

      subtotalSum += lineSub;
      retSum += lineRet;
    });

    if (!isPerLine) {
      let rRentaVal = 0, rIcaVal = 0;
      const rRentaId = (document.getElementById('ds-hdr-ret-rule-renta') as HTMLSelectElement)?.value;
      const rIcaId = (document.getElementById('ds-hdr-ret-rule-ica') as HTMLSelectElement)?.value;

      const ruleRenta = withholdingRules.find((rr: any) => rr.id === rRentaId);
      const ruleIca = withholdingRules.find((rr: any) => rr.id === rIcaId);

      if (ruleRenta) rRentaVal = Math.round(subtotalSum * (Number(ruleRenta.rate || 0) / 100));
      if (ruleIca) rIcaVal = Math.round(subtotalSum * (Number(ruleIca.rate || 0) / 100));

      retSum = rRentaVal + rIcaVal;

      const elRenta = document.getElementById('ds-total-ret-renta');
      const elIca = document.getElementById('ds-total-ret-ica');
      if (elRenta) elRenta.textContent = `-${fmt(rRentaVal)}`;
      if (elIca) elIca.textContent = `-${fmt(rIcaVal)}`;
    }

    const netTotal = subtotalSum - retSum;

    const subEl = document.getElementById('ds-summary-subtotal');
    const totEl = document.getElementById('ds-summary-total');

    if (subEl) subEl.textContent = fmt(subtotalSum);
    if (totEl) totEl.textContent = fmt(netTotal);
  };

  const txTypeOptions = (dsTxTypes.length ? dsTxTypes : txTypes.filter((t: any) => String(t.code).toUpperCase() === 'DS'))
    .map((t: any) => `<option value="${t.id}"${existingPur?.tx_type_id === t.id ? ' selected' : ''}>${esc(t.prefix || 'DS')} — ${esc(t.name)}</option>`)
    .join('');

  const resOptions = `<option value="">— Sin resolución asociada —</option>` + dsResolutions.map((r: any) => 
    `<option value="${r.id}">${esc(r.prefix || '')} - Res. ${esc(r.resolution_number || 'Interna')}</option>`
  ).join('');

  const bankOptions = bankAccounts.map((b: any) => 
    `<option value="${esc(b.id)}"${existingPur?.bank_account_id === b.id ? ' selected' : ''}>${esc(b.bank || '')} — ${esc(b.number || '')}</option>`
  ).join('');

  const warehouseOptions = warehouses.map((w: any) =>
    `<option value="${esc(w.id)}"${existingPur?.warehouse_id === w.id ? ' selected' : ''}>${esc(w.name)}</option>`
  ).join('');

  const retRuleOptions = (rules = withholdingRules, selectedId = '') => 
    `<option value="">— Sin retención —</option>` + rules.map((r: any) => 
      `<option value="${esc(r.id)}"${r.id === selectedId ? ' selected' : ''}>${esc(r.concept)} ${r.rate}% (${esc(r.account_code || '')})</option>`
    ).join('');

  const retRulesRenta = withholdingRules.filter((r: any) => String(r.concept || '').toUpperCase() === 'RETERENTA');
  const retRulesIca = withholdingRules.filter((r: any) => String(r.concept || '').toUpperCase() === 'RETEICA');

  const bodyHtml = `
    <form id="form-nuevo-ds" class="space-y-4 text-sm" onsubmit="return false;">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- 1. Carga Dinámica de Tercero -->
        <div class="col-span-2">
          <label class="form-label font-bold">Sujeto No Obligado (Proveedor) <span class="text-red-500">*</span></label>
          <div class="relative flex gap-1 items-center">
            <input id="ds-supplier-search" class="form-input flex-1" autocomplete="off" placeholder="NIT o nombre del tercero no obligado...">
            <button type="button" class="btn btn-outline" id="btn-quick-add-third" title="Nuevo Tercero Rápido">
              <i class="fas fa-user-plus text-xs"></i>
            </button>
            <input id="ds-supplier-id" type="hidden" value="${esc(existingPur?.supplier_id || '')}">
            <div id="ds-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
          <!-- 2. Propiedades de Retención del Tercero -->
          <div id="ds-third-tax-badge" class="mt-1 text-xs flex flex-wrap gap-1 items-center"></div>
        </div>

        <!-- 2. Comprobante + Consecutivo DIAN -->
        <div>
          <label class="form-label font-bold">Comprobante Contable <span class="text-red-500">*</span></label>
          <select id="ds-tx-type" class="form-input w-full font-semibold" onchange="window.dsUpdateConsecutivoPreview('tx_type')">
            ${txTypeOptions || '<option value="">DS - Documento Soporte</option>'}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label class="form-label font-bold">Próximo Consecutivo</label>
          <input id="ds-consecutivo-preview" class="form-input font-mono font-bold bg-slate-100 text-slate-800" readonly value="Cargando...">
        </div>
        <div>
          <label class="form-label font-bold">Resolución DIAN</label>
          <select id="ds-resolution-id" class="form-input w-full" onchange="window.dsUpdateConsecutivoPreview('resolution')">
            ${resOptions || '<option value="">Sin resolución activa</option>'}
          </select>
        </div>
        <!-- Bodega de Inventario -->
        <div>
          <label class="form-label font-bold">Bodega (Inventario)</label>
          <select id="ds-warehouse" class="form-input w-full">
            <option value="">— Sin Bodega (Servicios) —</option>
            ${warehouseOptions}
          </select>
        </div>
        <div>
          <label class="form-label font-bold">Fecha Emisión</label>
          <input type="date" id="ds-date" class="form-input w-full" value="${existingPur?.date || (window as any).todayStr()}">
        </div>
        <!-- 3. Selector de Forma de Pago DIAN -->
        <div>
          <label class="form-label font-bold">Forma de Pago (DIAN)</label>
          <select id="ds-payment-form" class="form-input w-full">
            <option value="1"${existingPur?.payment_form === '1' ? ' selected' : ''}>1 - Contado</option>
            <option value="2"${existingPur?.payment_form === '2' ? ' selected' : ''}>2 - Crédito Comercial</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- 3. Selector de Medio de Pago DIAN -->
        <div>
          <label class="form-label font-bold">Medio de Pago (DIAN)</label>
          <select id="ds-payment-dian-code" class="form-input w-full" onchange="window.dsOnPaymentDianCodeChange()">
            <option value="10"${(existingPur?.payment_dian_code === '10' || !existingPur) ? ' selected' : ''}>10 - Efectivo</option>
            <option value="42"${existingPur?.payment_dian_code === '42' ? ' selected' : ''}>42 - Consignación bancaria</option>
            <option value="47"${existingPur?.payment_dian_code === '47' ? ' selected' : ''}>47 - Transferencia</option>
            <option value="48"${existingPur?.payment_dian_code === '48' ? ' selected' : ''}>48 - Tarjeta de crédito</option>
            <option value="49"${existingPur?.payment_dian_code === '49' ? ' selected' : ''}>49 - Tarjeta débito</option>
            <option value="20"${existingPur?.payment_dian_code === '20' ? ' selected' : ''}>20 - Cheque</option>
            <option value="ZZZ"${existingPur?.payment_dian_code === 'ZZZ' ? ' selected' : ''}>ZZZ - Otro medio de pago</option>
          </select>
        </div>
        <!-- 3. Cuenta Bancaria Destino/Origen -->
        <div id="ds-bank-account-wrap" class="hidden">
          <label class="form-label font-bold">Cuenta Bancaria Destino/Origen <span class="text-red-500">*</span></label>
          <select id="ds-bank-account" class="form-input w-full">
            <option value="">— Seleccionar Banco / Cuenta —</option>
            ${bankOptions}
          </select>
        </div>
      </div>

      <!-- BUSCADOR GLOBAL DE PRODUCTOS Y CUENTAS CONTABLES -->
      <div class="flex gap-2 items-center">
        <div style="width: 160px;" class="flex-shrink-0">
          <select id="ds-search-type-filter" class="form-input text-xs font-semibold text-indigo-700 border-indigo-200">
            <option value="BIEN" selected>Bienes (Inventario)</option>
            <option value="SERVICIO">Servicios / Gastos</option>
            <option value="ACCOUNT">Cuentas Contables</option>
            <option value="ALL">Ver Todo</option>
          </select>
        </div>
        <div class="relative flex-1">
          <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-xs pointer-events-none"></i>
          <input id="ds-prod-search-global" class="form-input pl-9 w-full border-indigo-200 text-sm"
                 autocomplete="off" placeholder="Buscar por nombre, código o cuenta contable directa (ej: 5135)...">
          <div id="ds-prod-results-global"
               style="display:none;position:absolute;left:0;right:0;top:calc(100% + 3px);max-height:280px;overflow:auto;background:#fff;border:1.5px solid #6366F1;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);z-index:50">
          </div>
        </div>
      </div>

      <!-- Detalle de Conceptos / Servicios / Bienes (SIN IVA) -->
      <div class="border rounded-xl overflow-hidden border-slate-200 bg-slate-50">
        <div class="flex items-center justify-between px-3 py-2 bg-indigo-50 border-b border-indigo-100">
          <span class="font-bold text-slate-800 text-xs"><i class="fas fa-boxes mr-1 text-indigo-600"></i>Conceptos / Servicios / Bienes Adquiridos (Sin IVA)</span>
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
            <span id="ds-ret-mode-lbl-hdr" class="text-indigo-700">Retención Global</span>
            <div class="relative inline-block w-9 h-5">
              <input type="checkbox" id="ds-ret-mode-switch" class="sr-only" onchange="window.dsSetRetMode(this.checked)">
              <span id="ds-ret-mode-track" onclick="var sw=document.getElementById('ds-ret-mode-switch');sw.checked=!sw.checked;window.dsSetRetMode(sw.checked)" class="absolute inset-0 bg-indigo-600 rounded-full cursor-pointer transition-colors"></span>
              <span id="ds-ret-mode-knob" class="absolute h-3.5 w-3.5 left-1 top-1 bg-white rounded-full transition-transform pointer-events-none shadow"></span>
            </div>
            <span id="ds-ret-mode-lbl-line" class="text-slate-400">Por Línea</span>
          </label>
        </div>

        <div class="overflow-x-auto max-h-64 overflow-y-auto">
          <table class="w-full text-xs text-left" id="ds-lines-table">
            <thead class="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10 border-b">
              <tr>
                <th class="p-2">Producto / Servicio / Cuenta Imputada</th>
                <th class="p-2 w-20 text-center">Cant</th>
                <th class="p-2 w-28 text-right">Costo Unit</th>
                <th class="p-2 ds-ret-col w-40 hidden">Retención</th>
                <th class="p-2 ds-ret-col w-24 text-right hidden">Vlr Ret.</th>
                <th class="p-2 w-32 text-right">Total Línea</th>
                <th class="p-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody id="ds-lines-body" class="divide-y divide-slate-200 bg-white"></tbody>
          </table>
        </div>

        <!-- Totales & Retenciones Contables -->
        <div class="border-t p-3 bg-slate-50 border-slate-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div class="flex justify-between text-slate-600 mb-1"><span>Subtotal Bruto:</span><span id="ds-summary-subtotal" class="font-mono font-bold">$ 0</span></div>
            </div>

            <!-- Header Retenciones Configurable -->
            <div id="ds-hdr-ret-wrap" class="space-y-1.5 border-l border-r px-3 border-slate-200">
              <div class="flex items-center justify-between gap-1">
                <span class="text-slate-600">ReteFuente:</span>
                <select id="ds-hdr-ret-rule-renta" class="form-input text-xs py-0.5 px-1 w-36" onchange="window.recalcDsTotals()">
                  ${retRuleOptions(retRulesRenta)}
                </select>
                <span id="ds-total-ret-renta" class="font-mono font-semibold text-orange-600">-$ 0</span>
              </div>
              <div class="flex items-center justify-between gap-1">
                <span class="text-slate-600">ReteICA:</span>
                <select id="ds-hdr-ret-rule-ica" class="form-input text-xs py-0.5 px-1 w-36" onchange="window.recalcDsTotals()">
                  ${retRuleOptions(retRulesIca)}
                </select>
                <span id="ds-total-ret-ica" class="font-mono font-semibold text-orange-600">-$ 0</span>
              </div>
            </div>

            <div class="flex flex-col justify-end text-right">
              <span class="text-slate-500 font-medium">Total Neto a Pagar:</span>
              <span id="ds-summary-total" class="font-mono text-lg font-extrabold text-indigo-900">$ 0</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label">Observaciones / Notas Tributarias</label>
        <textarea id="ds-notes" class="form-input w-full" rows="2" placeholder="Observaciones adicionales del soporte...">${esc(existingPur?.notes || '')}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-outline" id="btn-save-ds-draft" style="border-color:#D97706;color:#D97706">
      <i class="fas fa-floppy-disk mr-1"></i>Guardar Borrador
    </button>
    <button class="btn btn-primary" id="btn-save-ds-emit">
      <i class="fas fa-file-signature mr-1"></i>Firmar y Contabilizar
    </button>
  `;

  openModal(editId ? 'Editar Documento Soporte' : 'Nuevo Documento Soporte Electrónico (DS)', bodyHtml, footer, true);

  (window as any).__dsRetMode = 'header';

  // 1. Autocompletado Dinámico de Tercero
  initDsSupplierSearch(thirdParties);

  if (existingPur && existingPur.supplier_id) {
    const match = thirdParties.find((t: any) => t.id === existingPur.supplier_id);
    if (match) {
      selectDsSupplier(match.id, `${match.doc_number || match.nit || ''} - ${match.name}`, thirdParties);
    }
  }

  // 3. Buscador Global de Productos y Cuentas Contables Nivel 5
  initDsGlobalProductSearch(products, accounts, withholdingRules);

  // Cargar líneas existentes si se edita borrador
  if (existingLines.length) {
    existingLines.forEach((l: any) => {
      const prod = l.expand?.product_id;
      const acct = l.expand?.account_id;
      if (prod) {
        addDsLine(prod, l, withholdingRules);
      } else if (acct) {
        addDsLine({ account_id: acct.id, code: acct.code, name: acct.name, cost_price: l.unit_price || 0 }, l, withholdingRules);
      }
    });
  } else {
    addDsLine(null, null, withholdingRules);
  }

  // Quick Add Third Party
  document.getElementById('btn-quick-add-third')?.addEventListener('click', () => {
    if (typeof openTerceroForm === 'function') {
      openTerceroForm(null, async (createdRecord: any) => {
        const freshThirds = await pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }).catch(() => []);
        thirdParties.length = 0;
        thirdParties.push(...freshThirds);
        selectDsSupplier(createdRecord.id, `${createdRecord.doc_number || createdRecord.nit || ''} - ${createdRecord.name}`, thirdParties);
        showToast('Tercero creado y seleccionado.', 'success');
      });
    }
  });

  // Previsualizar consecutivo y medio de pago al abrir
  (window as any).dsUpdateConsecutivoPreview();
  (window as any).dsOnPaymentDianCodeChange();

  // 5. Guardar Borrador / Firmar y Contabilizar
  const submitDsForm = async (isEmitDirect: boolean) => {
    const supplierId = (document.getElementById('ds-supplier-id') as HTMLInputElement).value;
    if (!supplierId) return showToast('Selecciona el tercero/proveedor no obligado.', 'warning');

    const txTypeId = (document.getElementById('ds-tx-type') as HTMLSelectElement)?.value || '';
    if (!txTypeId) return showToast('Selecciona el comprobante contable para el documento soporte.', 'warning');

    const dianCode = (document.getElementById('ds-payment-dian-code') as HTMLSelectElement)?.value || '10';
    const requiresBank = (dianCode === '42' || dianCode === '47' || dianCode === '48' || dianCode === '49');
    const bankAccountId = (document.getElementById('ds-bank-account') as HTMLSelectElement)?.value || '';
    if (requiresBank && !bankAccountId) {
      return showToast('Debes seleccionar la cuenta bancaria para la transferencia/tarjeta.', 'warning');
    }

    const rows = document.querySelectorAll('#ds-lines-body tr');
    if (!rows.length) return showToast('Debes agregar al menos un ítem al documento soporte.', 'warning');

    try {
      showToast(isEmitDirect ? 'Procesando firma y emisión a la DIAN...' : 'Guardando Borrador...', 'info');

      const consecutivoPreview = (document.getElementById('ds-consecutivo-preview') as HTMLInputElement)?.value || 'DS';

      let subtotalSum = 0;
      const linesData: any[] = [];

      rows.forEach((r: any) => {
        const idx = r.id.split('-').pop();
        const prodId = (document.getElementById(`dsl-prod-id-${idx}`) as HTMLInputElement)?.value || '';
        const acctId = (document.getElementById(`dsl-acct-id-${idx}`) as HTMLInputElement)?.value || '';
        const descInp = (document.getElementById(`dsl-desc-${idx}`) as HTMLInputElement)?.value || '';
        const qty = parseFloat((document.getElementById(`dsl-qty-${idx}`) as HTMLInputElement)?.value || '0');
        const price = parseFloat((document.getElementById(`dsl-price-${idx}`) as HTMLInputElement)?.value || '0');

        const lineSub = qty * price;
        subtotalSum += lineSub;

        linesData.push({
          product_id: prodId || null,
          account_id: acctId || null,
          description: descInp,
          qty: qty,
          unit_price: price,
          iva_rate: 0,
          iva_amount: 0,
          subtotal: lineSub,
          total: lineSub
        });
      });

      const warehouseId = (document.getElementById('ds-warehouse') as HTMLSelectElement)?.value || '';
      const billDate = (document.getElementById('ds-date') as HTMLInputElement).value || (window as any).todayStr();

      const headerPayload = {
        number: consecutivoPreview,
        tx_number: consecutivoPreview,
        tx_type_id: txTypeId,
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        date: billDate,
        payment_form: (document.getElementById('ds-payment-form') as HTMLSelectElement)?.value || '1',
        payment_dian_code: dianCode,
        bank_account_id: bankAccountId,
        notes: (document.getElementById('ds-notes') as HTMLTextAreaElement).value || 'Documento Soporte a No Obligado a Facturar',
        status: 'draft'
      };

      let purInv: any;
      if (typeof (window as any).API?.createPurchaseInvoice === 'function') {
        purInv = await (window as any).API.createPurchaseInvoice(headerPayload, linesData);
      } else {
        purInv = await pb.create('purchase_invoices', {
          ...headerPayload,
          subtotal: subtotalSum,
          total: subtotalSum,
          payable_total: subtotalSum
        });
        for (let i = 0; i < linesData.length; i++) {
          await pb.create('purchase_invoice_lines', {
            invoice_id: purInv.id,
            line_order: i + 1,
            ...linesData[i]
          });
        }
      }

      closeModal();

      if (isEmitDirect) {
        showToast('Borrador generado. Firmando y contabilizando ante la DIAN...', 'info');
        const postedRes = await (window as any).API.postPurchaseInvoice(purInv.id);
        if (postedRes && postedRes.tx) {
          if ((window as any).emitDianDocFromList) {
            await (window as any).emitDianDocFromList('', postedRes.tx.id, purInv.number || 'DS');
          }
        }
      } else {
        showToast(`Borrador de Documento Soporte (${purInv.number || 'DS'}) guardado con éxito.`, 'success');
      }

      renderDocSoporte((window as any).getPageContainer ? (window as any).getPageContainer() : document.getElementById('page-content')!);
    } catch (err: any) {
      showToast(err.response?.message || err.message, 'error');
    }
  };

  document.getElementById('btn-save-ds-draft')?.addEventListener('click', () => submitDsForm(false));
  document.getElementById('btn-save-ds-emit')?.addEventListener('click', () => submitDsForm(true));
}

let lineCounter = 0;
function addDsLine(item: any = null, preloadedLine: any = null, withholdingRules: any[] = []) {
  const tbody = document.getElementById('ds-lines-body');
  if (!tbody) return;

  // Si se está agregando un concepto/cuenta real (desde buscador o pre-cargado), remover filas por defecto no editadas (con precio 0 y sin IDs)
  if (item || preloadedLine) {
    const existingRows = tbody.querySelectorAll('tr');
    existingRows.forEach((r: any) => {
      const rIdx = r.id.replace('ds-row-', '');
      const rProdId = (document.getElementById(`dsl-prod-id-${rIdx}`) as HTMLInputElement)?.value || '';
      const rAcctId = (document.getElementById(`dsl-acct-id-${rIdx}`) as HTMLInputElement)?.value || '';
      const rDesc = ((document.getElementById(`dsl-desc-${rIdx}`) as HTMLInputElement)?.value || '').trim();
      const rPrice = parseFloat((document.getElementById(`dsl-price-${rIdx}`) as HTMLInputElement)?.value || '0');
      
      const isUntouchedDefault = !rProdId && !rAcctId && (rPrice === 0) && (rDesc === 'Servicio / Gasto' || rDesc === '');
      if (isUntouchedDefault) {
        r.remove();
      }
    });
  }

  lineCounter++;
  const idx = lineCounter;

  const accountId = item?.account_id || preloadedLine?.account_id || '';
  const isDirectAccount = !!accountId;
  const productId = isDirectAccount ? '' : (item?.id || preloadedLine?.product_id || '');

  let itemCode = item?.code || '';
  let itemName = item?.name || preloadedLine?.description || 'Servicio / Gasto';
  const initQty = preloadedLine?.qty ?? 1;
  const initPrice = preloadedLine?.unit_price ?? item?.cost_price ?? item?.price ?? 0;

  const retRuleOptions = (selectedId = '') => 
    `<option value="">— Sin retención —</option>` + withholdingRules.map((r: any) => 
      `<option value="${esc(r.id)}"${r.id === selectedId ? ' selected' : ''}>${esc(r.concept)} ${r.rate}%</option>`
    ).join('');

  const tr = document.createElement('tr');
  tr.id = `ds-row-${idx}`;
  tr.className = 'hover:bg-slate-50 transition-colors';
  tr.innerHTML = `
    <td class="p-2">
      <div class="flex flex-col">
        <div class="flex items-center gap-1">
          <span class="text-[10px] font-mono text-slate-400 flex-shrink-0">[${esc(itemCode || 'COSTO/GASTO')}]</span>
          <input type="text" class="form-input form-input-sm w-full font-semibold text-slate-800" id="dsl-desc-${idx}" value="${esc(itemName)}" placeholder="Descripción del concepto/servicio adquiridos...">
        </div>
        <input type="hidden" id="dsl-prod-id-${idx}" value="${esc(productId)}">
        <input type="hidden" id="dsl-acct-id-${idx}" value="${esc(accountId)}">
      </div>
    </td>
    <td class="p-2"><input type="number" id="dsl-qty-${idx}" class="form-input form-input-sm text-center font-bold w-full" min="0.001" step="any" value="${initQty}" oninput="window.recalcDsTotals()"></td>
    <td class="p-2"><input type="number" id="dsl-price-${idx}" class="form-input form-input-sm text-right w-full" min="0" step="any" value="${initPrice}" oninput="window.recalcDsTotals()"></td>
    <td class="p-2 ds-ret-col hidden">
      <select id="dsl-ret-rule-${idx}" class="form-input form-input-sm text-xs w-full" onchange="window.recalcDsTotals()">
        ${retRuleOptions('')}
      </select>
    </td>
    <td class="p-2 ds-ret-col text-right font-bold text-orange-600 hidden" id="dsl-ret-val-${idx}">$ 0</td>
    <td class="p-2 text-right font-bold text-indigo-900" id="dsl-total-${idx}">$ 0</td>
    <td class="p-2 text-center">
      <button type="button" class="text-rose-500 hover:text-rose-700" onclick="document.getElementById('ds-row-${idx}').remove(); window.recalcDsTotals()"><i class="fas fa-trash"></i></button>
    </td>
  `;
  tbody.appendChild(tr);

  const isPerLine = (window as any).__dsRetMode === 'line';
  tr.querySelectorAll('.ds-ret-col').forEach((el: any) => { el.style.display = isPerLine ? '' : 'none'; });

  if (typeof (window as any).recalcDsTotals === 'function') {
    (window as any).recalcDsTotals();
  }
}

// ── Buscador Dinámico de Terceros ─────────────────────────────────────────────
function initDsSupplierSearch(suppliers: any[]) {
  const input = document.getElementById('ds-supplier-search') as HTMLInputElement;
  const hidden = document.getElementById('ds-supplier-id') as HTMLInputElement;
  const results = document.getElementById('ds-supplier-results');
  if (!input || !hidden || !results) return;

  const performSearch = (val: string) => {
    const query = val.toLowerCase().trim();
    const filtered = !query
      ? suppliers.slice(0, 25)
      : suppliers.filter((c: any) => `${c.name} ${c.doc_number || ''} ${c.nit || ''}`.toLowerCase().includes(query)).slice(0, 25);

    if (!filtered.length) {
      results.innerHTML = '<div class="px-3 py-2 text-xs text-slate-400">Sin coincidencias</div>';
      return;
    }

    results.innerHTML = filtered.map((c: any) => `
      <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-slate-100 cursor-pointer block border-b border-slate-100"
              onclick="window.selectDsSupplier('${esc(c.id)}', '${esc(c.doc_number || c.nit || '')} - ${esc(c.name)}');">
        <div class="font-bold text-slate-800">${esc(c.name)}</div>
        <div class="text-[10px] text-slate-500">Doc: ${esc(c.doc_number || c.nit || 'S/N')} · ${esc(c.tax_regime || 'No responsable')}</div>
      </button>
    `).join('');
  };

  input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
  input.addEventListener('input', () => {
    hidden.value = '';
    dsUpdateSupplierTaxInfo('', suppliers);
    performSearch(input.value);
    results.style.display = 'block';
  });
  input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

  if (typeof (window as any).initKeyboardAutocomplete === 'function') {
    (window as any).initKeyboardAutocomplete({
      input,
      results,
      itemSelector: 'button',
    });
  }

  (window as any).selectDsSupplier = (id: string, text: string) => {
    selectDsSupplier(id, text, suppliers);
    if (results) results.style.display = 'none';
  };
}

function selectDsSupplier(id: string, text: string, suppliers: any[]) {
  const hidden = document.getElementById('ds-supplier-id') as HTMLInputElement;
  const input = document.getElementById('ds-supplier-search') as HTMLInputElement;
  if (hidden && input) {
    hidden.value = id;
    input.value = text;
    dsUpdateSupplierTaxInfo(id, suppliers);
  }
}

function dsUpdateSupplierTaxInfo(supplierId: string, suppliers: any[]) {
  const badgeContainer = document.getElementById('ds-third-tax-badge');
  const retSelect = document.getElementById('ds-hdr-ret-rule-renta') as HTMLSelectElement;
  if (!badgeContainer) return;

  if (!supplierId) {
    badgeContainer.innerHTML = '';
    return;
  }

  const third = suppliers.find((s: any) => s.id === supplierId);
  if (!third) return;

  const regime = String(third.tax_regime || 'NO_RESPONSABLE').toUpperCase();
  const isAgent = !!third.is_retencion_agent;

  let retSuggested = '3.5';
  if (regime === 'GRAN_CONTR' || regime === 'AUTORETENEDOR') {
    retSuggested = '0';
  } else if (regime === 'COMUN') {
    retSuggested = '4.0';
  }

  if (retSelect && retSelect.options) {
    for (let i = 0; i < retSelect.options.length; i++) {
      if (retSelect.options[i].text.includes(`${retSuggested}%`)) {
        retSelect.selectedIndex = i;
        break;
      }
    }
    if (typeof (window as any).recalcDsTotals === 'function') {
      (window as any).recalcDsTotals();
    }
  }

  badgeContainer.innerHTML = `
    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border">
      Régimen: ${esc(regime)}
    </span>
    ${isAgent ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border">Agente Retenedor</span>' : ''}
    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border">
      ReteFuente Sugerida: ${retSuggested}%
    </span>
  `;
}

// ── Buscador Global de Productos y Cuentas Contables Nivel 5 ──────────────────
function initDsGlobalProductSearch(products: any[], accounts: any[], withholdingRules: any[]) {
  const input = document.getElementById('ds-prod-search-global') as HTMLInputElement;
  const filterSel = document.getElementById('ds-search-type-filter') as HTMLSelectElement;
  const results = document.getElementById('ds-prod-results-global');
  if (!input || !results) return;

  const performSearch = (val: string) => {
    const q = val.toLowerCase().trim();
    const filter = filterSel ? filterSel.value : 'ALL';

    let matchedProds = products;
    if (filter === 'BIEN') matchedProds = products.filter((p: any) => p.type === 'BIEN' || !p.type);
    else if (filter === 'SERVICIO') matchedProds = products.filter((p: any) => p.type === 'SERVICIO');
    else if (filter === 'ACCOUNT') matchedProds = [];

    if (q) {
      matchedProds = matchedProds.filter((p: any) => `${p.name} ${p.code}`.toLowerCase().includes(q));
    }
    matchedProds = matchedProds.slice(0, 15);

    let matchedAccounts: any[] = [];
    if (filter === 'ACCOUNT' || filter === 'ALL' || filter === 'SERVICIO') {
      matchedAccounts = accounts.filter((a: any) => {
        const code = String(a.code || '');
        const isCostOrExpense = code.startsWith('5') || code.startsWith('6') || code.startsWith('14') || code.startsWith('2') || code.startsWith('1');
        const matchQ = !q || `${a.code} ${a.name}`.toLowerCase().includes(q);
        return isCostOrExpense && matchQ;
      }).slice(0, 15);
    }

    if (!matchedProds.length && !matchedAccounts.length) {
      results.innerHTML = '<div class="p-3 text-xs text-slate-400 text-center">Sin resultados coincidentes</div>';
      return;
    }

    let html = '';
    if (matchedProds.length) {
      html += `<div class="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">Productos / Bienes / Servicios de Catálogo</div>`;
      html += matchedProds.map((p: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-b border-slate-100 hover:bg-indigo-50 cursor-pointer block"
                onclick="window.selectDsProductItem('${esc(p.id)}', 'product');">
          <div class="font-bold text-slate-800">${esc(p.name)}</div>
          <div class="text-[10px] text-slate-500">Código: ${esc(p.code || 'S/C')} · Costo: ${fmt(p.cost_price || 0)}</div>
        </button>
      `).join('');
    }

    if (matchedAccounts.length) {
      html += `<div class="px-3 py-1 bg-amber-50 text-[10px] font-bold text-amber-800 uppercase">Cuentas Contables Directas (Gastos / Costos)</div>`;
      html += matchedAccounts.map((a: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-b border-slate-100 hover:bg-amber-100/50 cursor-pointer block"
                onclick="window.selectDsProductItem('${esc(a.id)}', 'account');">
          <div class="font-bold text-slate-800 font-mono">${esc(a.code)} — ${esc(a.name)}</div>
          <div class="text-[10px] text-slate-500">Imputación contable directa a cuenta</div>
        </button>
      `).join('');
    }

    results.innerHTML = html;
  };

  input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
  input.addEventListener('input', () => { performSearch(input.value); results.style.display = 'block'; });
  input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });
  filterSel?.addEventListener('change', () => performSearch(input.value));

  if (typeof (window as any).initKeyboardAutocomplete === 'function') {
    (window as any).initKeyboardAutocomplete({
      input,
      results,
      itemSelector: 'button',
    });
  }

  (window as any).selectDsProductItem = (id: string, type: string) => {
    if (type === 'product') {
      const p = products.find((x: any) => x.id === id);
      if (p) addDsLine(p, null, withholdingRules);
    } else {
      const a = accounts.find((x: any) => x.id === id);
      if (a) addDsLine({ account_id: a.id, code: a.code, name: a.name, cost_price: 0 }, null, withholdingRules);
    }
    input.value = '';
    if (results) results.style.display = 'none';
  };
}

// Modal para emitir Nota de Ajuste (NDS)
async function openNuevaNdsModal(resolutions: any[], dsList: DocSoporteItem[], preselectedDsId: string = '') {
  const ndsResolutions = resolutions.filter(r => r.document_type === 'NDS');
  const dsAccepted = dsList.filter(d => d.doc_type === 'DS');

  const dsOptions = dsAccepted.map(d => {
    const isSelected = (d.id === preselectedDsId || d.tx_id === preselectedDsId);
    return `<option value="${d.tx_id || d.id}"${isSelected ? ' selected' : ''}>${esc(d.number)} - ${esc(d.supplier_name)} (${fmt(d.total)})</option>`;
  }).join('');
  const resOptions = ndsResolutions.map(r => `<option value="${r.id}">${esc(r.prefix || '')} - Res. ${esc(r.resolution_number || 'Interna')}</option>`).join('');

  const bodyHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="p-3 rounded bg-orange-50 text-orange-800 border border-orange-200">
        <i class="fas fa-info-circle mr-1"></i> La Nota de Ajuste anula o ajusta un Documento Soporte (DS) previamente emitido ante la DIAN.
      </div>
      <div>
        <label class="form-label font-bold">Documento Soporte Original a Ajustar <span class="text-red-500">*</span></label>
        <select id="nds-target-ds" class="form-input w-full" required>
          <option value="">-- Selecciona el Documento Soporte --</option>
          ${dsOptions || '<option value="">No hay Documentos Soporte registrados</option>'}
        </select>
      </div>
      <div>
        <label class="form-label font-bold">Resolución DIAN para Nota de Ajuste (NDS) <span class="text-red-500">*</span></label>
        <select id="nds-resolution-id" class="form-input w-full" required>
          ${resOptions || '<option value="">Generación Automática (Según tipo contable NDS)</option>'}
        </select>
      </div>
      <div>
        <label class="form-label font-bold">Concepto / Motivo de Ajuste DIAN <span class="text-red-500">*</span></label>
        <select id="nds-dian-concept" class="form-input w-full" required>
          <option value="1">1 - Devolución de parte de los bienes / servicios</option>
          <option value="2" selected>2 - Anulación de documento soporte</option>
          <option value="3">3 - Rebaja total aplicada</option>
          <option value="4">4 - Descuento total applied</option>
          <option value="5">5 - Rescisión: nulidad por falta de requisitos</option>
          <option value="6">6 - Otros (Especificar en notas)</option>
        </select>
      </div>
      <div>
        <label class="form-label font-bold">Justificación del Ajuste</label>
        <textarea id="nds-reason" class="form-input w-full" rows="2" placeholder="Explique el motivo de la nota de ajuste..."></textarea>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-confirm-nds" style="background:#EA580C;border-color:#EA580C">
      <i class="fas fa-check mr-1"></i>Generar y Emitir Nota de Ajuste NDS
    </button>
  `;

  openModal('Emitir Nota de Ajuste a Documento Soporte (NDS)', bodyHtml, footer, false);

  document.getElementById('btn-confirm-nds')?.addEventListener('click', async () => {
    const targetTxId = (document.getElementById('nds-target-ds') as HTMLSelectElement).value;
    if (!targetTxId) return showToast('Selecciona el documento soporte a ajustar.', 'warning');

    try {
      showToast('Generando Nota de Ajuste NDS...', 'info');

      const origTx = await pb.get('transactions', targetTxId, { expand: 'third_party_id' }).catch(() => null);

      const txTypes = await pb.listAll('transaction_types', { filter: 'code="NDS"' }).catch(() => []);
      let txTypeId = txTypes.length ? txTypes[0].id : '';

      if (!txTypeId) {
        const allTypes = await pb.listAll('transaction_types').catch(() => []);
        const found = allTypes.find((t: any) => String(t.code).toUpperCase() === 'NDS');
        if (found) txTypeId = found.id;
      }

      const ndsTx = await pb.create('transactions', {
        date: (window as any).todayStr(),
        third_party_id: origTx?.third_party_id || null,
        tx_type_id: txTypeId,
        net_amount: origTx?.net_amount || 0,
        cross_amount: origTx?.cross_amount || 0,
        status: 'active',
        notes: `NDS Ajuste a DS ${origTx?.number || ''}: ${(document.getElementById('nds-reason') as HTMLTextAreaElement).value || 'Ajuste documento soporte'}`
      });

      closeModal();
      showToast('Nota de Ajuste NDS registrada exitosamente.', 'success');

      if ((window as any).emitDocSoporteFromList) {
        (window as any).emitDocSoporteFromList(ndsTx.id, ndsTx.number || 'NDS');
      }

      renderDocSoporte((window as any).getPageContainer ? (window as any).getPageContainer() : document.getElementById('page-content')!);
    } catch (err: any) {
      showToast(err.response?.message || err.message, 'error');
    }
  });
}

(window as any).renderDocSoporte = renderDocSoporte;
(window as any).openEditDsModal = (editId: string) => {
  openNuevoDsModal(editId);
};
(window as any).openNotaAjusteForDs = async (dsId: string, txId: string, dsNumber: string) => {
  let resolutions = (window as any).__lastDsResolutions;
  if (!resolutions || !resolutions.length) {
    resolutions = await pb.listAll('dian_resolutions', { filter: 'active=true && (document_type="DS" || document_type="NDS")' }).catch(() => []);
  }
  let dsList = (window as any).__lastDsList;
  if (!dsList || !dsList.length) {
    const rawInvoices = await pb.listAll('purchase_invoices', { sort: '-date', expand: 'supplier_id,tx_type_id' }).catch(() => []);
    dsList = rawInvoices.map((p: any) => ({
      id: p.id,
      tx_id: p.tx_id || p.id,
      doc_type: 'DS',
      number: p.number || 'DS',
      date: p.date,
      supplier_name: p.expand?.supplier_id?.name || 'Sujeto No Obligado',
      supplier_nit: p.expand?.supplier_id?.doc_number || p.expand?.supplier_id?.nit || '',
      total: p.total || 0,
      status_dian: p.status_dian || 'aceptada',
      cuds: p.cuds || '',
      xml_content: p.xml_content || ''
    }));
  }
  openNuevaNdsModal(resolutions, dsList, dsId || txId);
};
(window as any).contabilizarDsRow = async function(id: string) {
  try {
    showToast('Contabilizando documento soporte...', 'info');
    const res = await (window as any).API.postPurchaseInvoice(id);
    showToast(`Documento soporte contabilizado con éxito. Consecutivo asignado: ${res.inv.number || 'DS'}`, 'success');
    const container = document.getElementById('page-content');
    if (container) renderDocSoporte(container);
  } catch (err: any) {
    showToast('Error al contabilizar: ' + (err.message || err), 'error');
  }
};

(window as any).emitDocSoporteFromList = async function(txId: string, docNumber: string) {
  if (!txId) {
    showToast('No hay una transacción vinculada a este documento soporte.', 'warning');
    return;
  }
  confirmDialog('Firmar y Emitir Documento Soporte', `¿Confirmas el firmado digital y envío del Documento Soporte <strong>${esc(docNumber)}</strong> a la DIAN / Facturatech?`, async () => {
    try {
      showToast('Transmitiendo Documento Soporte a la DIAN / Facturatech...', 'info');
      const res = await pb.send('/api/dian/emit', {
        method: 'POST',
        body: JSON.stringify({ txId: txId, isDocSoporte: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res && res.success) {
        showToast(`Documento Soporte emitido correctamente. Estado: ${res.status}. ${res.simulated ? '(MODO SIMULADO)' : ''}`, 'success');
        const container = document.getElementById('page-content');
        if (container) renderDocSoporte(container);
      } else {
        showToast(`Error al emitir Documento Soporte: ${res.dianResponse || 'Rechazado por el servidor'}`, 'error');
      }
    } catch (err: any) {
      const errMsg = err.response?.message || err.message || 'Error al emitir Documento Soporte';
      showToast(errMsg, 'error');
    }
  });
};

(window as any).emitDsDocFromRow = async function(id: string, txId: string, docNumber: string) {
  if (!txId) {
    confirmDialog(
      'Documento en Estado Borrador',
      `El documento <strong>${esc(docNumber)}</strong> se encuentra en estado Borrador.<br><br>Para realizar la Firma Electrónica ante la DIAN es <strong>requisito obligatorio</strong> contabilizarlo previamente.<br><br>¿Deseas contabilizar el documento ahora y proceder con la emisión?`,
      async () => {
        try {
          showToast('Contabilizando documento soporte...', 'info');
          const posted = await (window as any).API.postPurchaseInvoice(id);
          if (posted && posted.tx && posted.tx.id) {
            showToast(`Documento contabilizado (${posted.inv.number || docNumber}). Transmitiendo a la DIAN...`, 'info');
            if (typeof (window as any).emitDocSoporteFromList === 'function') {
              await (window as any).emitDocSoporteFromList(posted.tx.id, posted.inv.number || docNumber);
            } else if (typeof (window as any).emitDianDocFromList === 'function') {
              await (window as any).emitDianDocFromList('', posted.tx.id, posted.inv.number || docNumber);
            }
            const container = document.getElementById('page-content');
            if (container) renderDocSoporte(container);
          }
        } catch (err: any) {
          showToast('Error al contabilizar: ' + (err.message || err), 'error');
        }
      }
    );
    return;
  }

  if (typeof (window as any).emitDocSoporteFromList === 'function') {
    await (window as any).emitDocSoporteFromList(txId, docNumber);
  } else if (typeof (window as any).emitDianDocFromList === 'function') {
    await (window as any).emitDianDocFromList('', txId, docNumber);
  }
};

(window as any).viewDsDetail = async function(id: string, txId: string) {
  try {
    showToast('Cargando detalle...', 'info');
    let d: any = null;
    if (txId) {
      const docs = await pb.listAll('einvoice_docs', { filter: `tx_id="${pb.escapeFilterValue(txId)}"` }).catch(() => []);
      if (docs.length) d = docs[0];
    }
    if (!d) {
      try {
        d = await pb.get('dian_documents', id);
      } catch (_) {
        d = await pb.get('purchase_invoices', id);
      }
    }
    let tx: any = null;
    if (txId) {
      tx = await pb.get('transactions', txId).catch(() => null);
    }

    const docNum = (tx && tx.number) || (d && d.number) || 'DS';
    const statusVal = (d && (d.status_dian || d.status)) || 'pendiente';
    const statusInfo: Record<string, { cls: string; label: string }> = {
      borrador:  { cls: 'badge-slate',  label: 'Borrador'  },
      pendiente: { cls: 'badge-orange', label: 'Pendiente' },
      enviada:   { cls: 'badge-blue',   label: 'Enviada'   },
      aceptada:  { cls: 'badge-green',  label: 'Aceptada'  },
      rechazada: { cls: 'badge-red',    label: 'Rechazada' },
    };
    const si = statusInfo[statusVal] || statusInfo.pendiente;

    const xmlContent = (d && d.xml_content) || `<?xml version="1.0" encoding="UTF-8"?>
<DocumentoSoporte>
  <ID>${esc(docNum)}</ID>
  <Note>Documento Soporte sin XML firmado generado aún.</Note>
</DocumentoSoporte>`;

    openModal(
      `Detalle Documento Soporte — ${esc(docNum)}`,
      `<div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><span class="form-label font-bold text-gray-500">Comprobante</span><p class="font-mono font-semibold text-indigo-800">${esc(docNum)}</p></div>
          <div><span class="form-label font-bold text-gray-500">Estado DIAN</span><p><span class="badge ${si.cls}">${si.label}</span></p></div>
          <div><span class="form-label font-bold text-gray-500">Fecha</span><p>${esc(d.date || d.created || (tx && tx.date) || '—')}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label font-bold text-gray-500">CUDS / CUFE</span><p class="font-mono text-xs break-all p-2 rounded" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(d.cuds || d.cufe || 'Pendiente de transmisión')}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label font-bold text-gray-500">Respuesta Servidor DIAN</span><p class="p-2 rounded text-sm text-gray-600 font-medium" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(d.dian_response || '—')}</p></div>
        </div>
        <div>
          <span class="form-label font-bold text-gray-500">Contenido XML (UBL 2.1 / Documento Soporte)</span>
          <textarea readonly class="form-input font-mono text-xs mt-1 w-full" rows="12" style="resize:vertical;background:#F9FAFB">${esc(xmlContent)}</textarea>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err: any) {
    showToast(err.message || 'Error al cargar detalle', 'error');
  }
};

