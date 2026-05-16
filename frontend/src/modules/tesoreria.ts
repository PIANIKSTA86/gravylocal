/**
 * GRAVY v2.0 — tesoreria.ts
 * Módulo Tesorería: pagos, recaudos, cartera y configuración.
 */

interface ThirdParty { id: string; name: string; doc_number: string; type: string; }
interface TxLine {
  id: string; tx_id: string; account_id: string; third_party_id: string;
  debit: number; credit: number; description: string;
  expand?: { tx_id?: { number: string; date: string }; account_id?: { name: string; code: string }; };
}

// Helpers globales inyectados en window por utils.ts / app.ts
const _pb = (): any => (window as any).pb;
const _fmt = (v: number) => (window as any).fmt ? (window as any).fmt(v) : `$${Number(v).toLocaleString('es-CO')}`;
const _esc = (s: string) => (window as any).esc ? (window as any).esc(s) : String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const _openModal = (title: string, body: string, footer: string, wide: boolean) => (window as any).openModal(title, body, footer, wide);
const _closeModal = () => (window as any).closeModal();
const _showToast = (msg: string, type: string) => (window as any).showToast(msg, type);

let _tesoAllTerceros: ThirdParty[] = [];

// ─── UTILIDADES AUTOCOMPLETE ──────────────────────────────────────────────
function _tesoFmtTercero(t: ThirdParty) {
  return `${t.doc_number || ''} — ${t.name || ''}`.trim();
}

function _initTesoTerceroAutocomplete(
  wrapId: string, inputId: string, hiddenId: string, resultsId: string,
  filterFn: (t: ThirdParty) => boolean, onSelect: (t: ThirdParty) => void
) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId) as HTMLInputElement;
  const hidden = document.getElementById(hiddenId) as HTMLInputElement;
  const results = document.getElementById(resultsId);
  if (!wrap || !input || !hidden || !results) return;

  const list = _tesoAllTerceros.filter(filterFn);

  const render = (q = '') => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const data = !terms.length ? list.slice(0, 50) : list.filter(t => {
      const hay = `${t.doc_number || ''} ${t.name || ''}`.toLowerCase();
      return terms.every(w => hay.includes(w));
    }).slice(0, 50);
    
    if (!data.length) {
      results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-500">Sin resultados</div>';
      return;
    }
    results.innerHTML = data.map(t =>
      `<button type="button" data-teso-id="${t.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 bg-white border-none cursor-pointer text-gray-800">
        <div class="font-semibold">${t.doc_number || 'SIN DOC'}</div>
        <div class="text-xs text-gray-500">${t.name || ''}</div>
      </button>`
    ).join('');
  };

  const syncDisplay = () => {
    const found = list.find(t => t.id === hidden.value);
    input.value = found ? _tesoFmtTercero(found) : '';
  };
  syncDisplay();

  input.onfocus = () => { render(input.value); results.style.display = 'block'; };
  input.oninput = () => { hidden.value = ''; render(input.value); results.style.display = 'block'; };
  results.onclick = (ev: Event) => {
    const btn = (ev.target as Element).closest('[data-teso-id]') as HTMLElement | null;
    if (!btn) return;
    const id = btn.dataset.tesoId || '';
    const found = list.find(t => t.id === id) || null;
    hidden.value = id;
    input.value = found ? _tesoFmtTercero(found) : '';
    results.style.display = 'none';
    if (found) onSelect(found);
  };
  const outsideHandler = (ev: Event) => {
    if (!wrap.contains(ev.target as Node)) results.style.display = 'none';
  };
  setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

let _tesoAllProperties: any[] = [];
let _tesoCurrentOrigen: 'comercial' | 'ph' = 'comercial';
let _tesoCurrentPropertyId: string | null = null;

function _initTesoPropertyAutocomplete(
  wrapId: string, inputId: string, hiddenId: string, resultsId: string,
  onSelect: (p: any) => void
) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId) as HTMLInputElement;
  const hidden = document.getElementById(hiddenId) as HTMLInputElement;
  const results = document.getElementById(resultsId);
  if (!wrap || !input || !hidden || !results) return;

  const render = (q = '') => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const data = !terms.length ? _tesoAllProperties.slice(0, 50) : _tesoAllProperties.filter(t => {
      const hay = `${t.code || ''} ${t.name || ''} ${t.expand?.owner_id?.name || ''}`.toLowerCase();
      return terms.every(w => hay.includes(w));
    }).slice(0, 50);
    
    if (!data.length) {
      results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-500">Sin resultados</div>';
      return;
    }
    results.innerHTML = data.map(t =>
      `<button type="button" data-teso-id="${t.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 bg-white border-none cursor-pointer text-gray-800">
        <div class="font-semibold">${_esc(t.code)} - ${_esc(t.name)}</div>
        <div class="text-xs text-gray-500"><i class="fas fa-user mr-1"></i>${_esc(t.expand?.owner_id?.name || 'Sin propietario asignado')}</div>
      </button>`
    ).join('');
  };

  const syncDisplay = () => {
    const found = _tesoAllProperties.find(t => t.id === hidden.value);
    input.value = found ? `${found.code} - ${found.name}` : '';
  };
  syncDisplay();

  input.onfocus = () => { render(input.value); results.style.display = 'block'; };
  input.oninput = () => { hidden.value = ''; render(input.value); results.style.display = 'block'; };
  results.onclick = (ev: Event) => {
    const btn = (ev.target as Element).closest('[data-teso-id]') as HTMLElement | null;
    if (!btn) return;
    const id = btn.dataset.tesoId || '';
    const found = _tesoAllProperties.find(t => t.id === id) || null;
    hidden.value = id;
    input.value = found ? `${found.code} - ${found.name}` : '';
    results.style.display = 'none';
    if (found) onSelect(found);
  };
  const outsideHandler = (ev: Event) => {
    if (!wrap.contains(ev.target as Node)) results.style.display = 'none';
  };
  setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

(window as any)._changeTesoOrigen = async (origen: 'comercial' | 'ph') => {
  _tesoCurrentOrigen = origen;
  _tesoCurrentPropertyId = null;
  _tesoCurrentThirdParty = null;
  _tesoCurrentOpenItems = [];
  
  const lbl = document.getElementById('teso-lbl-tercero');
  const input = document.getElementById('modal-rc-search') as HTMLInputElement;
  const hidden = document.getElementById('modal-rc-hidden') as HTMLInputElement;
  const results = document.getElementById('modal-rc-results');
  const container = document.getElementById('teso-modal-items-container');
  
  if (input) { input.value = ''; input.oninput = null; input.onfocus = null; }
  if (hidden) hidden.value = '';
  if (results) { results.style.display = 'none'; results.onclick = null; }
  if (container) container.innerHTML = `
    <div class="text-center w-full">
      <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
        <i class="fas fa-search text-2xl text-gray-400"></i>
      </div>
      <p class="font-medium text-gray-500">Busca un ${origen === 'comercial' ? 'tercero' : 'inmueble'} para visualizar su cartera abierta</p>
    </div>
  `;
  
  if (origen === 'comercial') {
    if (lbl) lbl.textContent = 'Proveedor / Acreedor';
    if (input) input.placeholder = 'Buscar...';
    _initTesoTerceroAutocomplete(
      'modal-rc-wrap', 'modal-rc-search', 'modal-rc-hidden', 'modal-rc-results',
      () => true,
      (t) => {
        _tesoCurrentThirdParty = t;
        _loadOpenItemsForModal(t.id, true).then(() => {
          const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
          if (total > 0) {
            const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
            if (montoEl && !montoEl.value) montoEl.value = String(Math.round(total));
          }
        });
      }
    );
  } else {
    if (lbl) lbl.textContent = 'Unidad PH (Apartamento / Casa)';
    if (input) input.placeholder = 'Buscar por código (Ej: A101)...';
    
    if (!_tesoAllProperties.length) {
      _tesoAllProperties = await _pb().listAll('ph_properties', { filter: 'active=true', expand: 'owner_id', sort: 'code' });
    }
    
    _initTesoPropertyAutocomplete(
      'modal-rc-wrap', 'modal-rc-search', 'modal-rc-hidden', 'modal-rc-results',
      (p) => {
        _tesoCurrentPropertyId = p.id;
        if (p.expand?.owner_id) {
          _tesoCurrentThirdParty = p.expand.owner_id;
          _loadOpenItemsForModal(p.expand.owner_id.id, true, p.id).then(() => {
            const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
            if (total > 0) {
              const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
              if (montoEl && !montoEl.value) montoEl.value = String(Math.round(total));
            }
          });
        } else {
          _showToast('Esta unidad no tiene un propietario asignado', 'warning');
        }
      }
    );
  }
};

// ─── VISTAS DE LISTADO (RECAUDOS Y PAGOS) ──────────────────────────────────
async function renderTesoListado(c: HTMLElement, tipo: 'RC' | 'CE') {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando transacciones...</div>`;
  try {
    const pb = _pb();
    const typeRes = await pb.listAll('transaction_types', { filter: `code="${tipo}"` });
    if (!typeRes.length) throw new Error(`No existe el tipo de transacción ${tipo}`);
    
    const typeId = typeRes[0].id;
    const items = await pb.listAll('transactions', {
      filter: `tx_type_id="${typeId}"`,
      sort: '-date',
      expand: 'third_party_id'
    });

    const isRecaudo = tipo === 'RC';
    const title = isRecaudo ? 'Recibos de Caja (Recaudos)' : 'Comprobantes de Egreso (Pagos)';
    const btnText = isRecaudo ? 'Nuevo Recibo' : 'Nuevo Egreso';
    const btnAction = isRecaudo ? 'openRecaudoModal()' : 'openPagoModal()';

    c.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-800">${title}</h3>
          <p class="text-sm text-gray-500">Historial de ${isRecaudo ? 'recaudos aplicados' : 'pagos emitidos'}.</p>
        </div>
        <div class="flex gap-2">
          ${isRecaudo ? `<button class="btn btn-outline" onclick="window._openMassRCModal()"><i class="fas fa-file-upload mr-2"></i>Carga Masiva</button>` : ''}
          <button class="btn btn-primary" onclick="${btnAction}"><i class="fas fa-plus mr-2"></i>${btnText}</button>
        </div>
      </div>

      <div class="bg-gray-50/50 backdrop-blur-sm rounded-xl border border-gray-200 p-2 mb-4 flex flex-col md:flex-row gap-3 items-center shadow-sm">
        <div class="relative flex-1 w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <i class="fas fa-search"></i>
          </div>
          <input id="teso-filter-q" class="form-input w-full pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all" placeholder="Buscar por número o tercero...">
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <div class="relative flex-1 md:w-40">
            <input id="teso-filter-from" type="date" class="form-input w-full bg-white text-sm rounded-lg border-gray-200" title="Fecha Desde">
          </div>
          <span class="text-gray-400 text-xs"><i class="fas fa-arrow-right"></i></span>
          <div class="relative flex-1 md:w-40">
            <input id="teso-filter-to" type="date" class="form-input w-full bg-white text-sm rounded-lg border-gray-200" title="Fecha Hasta">
          </div>
        </div>
      </div>

      <div class="overflow-x-auto border border-gray-200 rounded-xl">
        <table class="data-table w-full" id="teso-tx-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-left">Número</th>
              <th class="p-3 text-left">Fecha</th>
              <th class="p-3 text-left">Tercero</th>
              <th class="p-3 text-left">Descripción</th>
              <th class="p-3 text-center">Estado</th>
              <th class="p-3 text-center" style="width:90px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.length === 0 ? `<tr><td colspan="6" class="text-center p-6 text-gray-500">No hay registros.</td></tr>` : items.map((i: any) => `
              <tr class="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-50 last:border-none" data-q="${_esc(i.number)} ${_esc(i.expand?.third_party_id?.name || '')}" data-date="${_esc(i.date)}" data-id="${_esc(i.id)}">
                <td class="p-3 font-mono font-medium text-blue-800">${_esc(i.number)}</td>
                <td class="p-3 text-gray-600">${_esc(i.date).slice(0, 10)}</td>
                <td class="p-3 font-medium">${_esc(i.expand?.third_party_id?.name || 'N/A')}</td>
                <td class="p-3 text-gray-500 text-sm">${_esc(i.description)}</td>
                <td class="p-3 text-center"><span class="badge ${i.status==='active'?'badge-green':'badge-gray'}">${i.status === 'active' ? 'Activo' : _esc(i.status)}</span></td>
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button title="Ver detalle" data-tx-id="${_esc(i.id)}" data-tx-tipo="${tipo}"
                      class="teso-btn-ver inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                      <i class="fas fa-eye text-xs"></i>
                    </button>
                    <button title="Imprimir" data-tx-id="${_esc(i.id)}" data-tx-tipo="${tipo}"
                      class="teso-btn-print inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors">
                      <i class="fas fa-print text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const filterTable = () => {
      const q = ((document.getElementById('teso-filter-q') as HTMLInputElement).value || '').toLowerCase();
      const from = (document.getElementById('teso-filter-from') as HTMLInputElement).value;
      const to = (document.getElementById('teso-filter-to') as HTMLInputElement).value;
      
      document.querySelectorAll('#teso-tx-table tbody tr[data-q]').forEach(tr => {
        const el = tr as HTMLElement;
        const text = el.dataset.q?.toLowerCase() || '';
        const d = (el.dataset.date || '').slice(0, 10);
        const matchQ = !q || text.includes(q);
        const matchFrom = !from || d >= from;
        const matchTo = !to || d <= to;
        el.style.display = (matchQ && matchFrom && matchTo) ? '' : 'none';
      });
    };

    document.getElementById('teso-filter-q')?.addEventListener('input', filterTable);
    document.getElementById('teso-filter-from')?.addEventListener('change', filterTable);
    document.getElementById('teso-filter-to')?.addEventListener('change', filterTable);

    // ── Botones Ver e Imprimir ─────────────────────────────────────────────────
    c.querySelectorAll('.teso-btn-ver').forEach(btn => {
      btn.addEventListener('click', async () => {
        const b = btn as HTMLElement;
        const txId = b.dataset.txId || '';
        const txTipo = b.dataset.txTipo || 'RC';
        await _tesoVerDetalle(txId, txTipo);
      });
    });
    c.querySelectorAll('.teso-btn-print').forEach(btn => {
      btn.addEventListener('click', async () => {
        const b = btn as HTMLElement;
        const txId = b.dataset.txId || '';
        const txTipo = b.dataset.txTipo || 'RC';
        await _tesoVerDetalle(txId, txTipo, true);
      });
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-4 text-red-600">Error: ${err.message}</div>`;
  }
}

// ─── VER DETALLE / IMPRIMIR DESDE LISTADO ──────────────────────────────────
async function _tesoVerDetalle(txId: string, tipo: string, autoprint = false) {
  const pb = _pb();
  try {
    const tx = await pb.get('transactions', txId, { expand: 'third_party_id,tx_type_id' });
    const lines = await pb.listAll('tx_lines', {
      filter: `tx_id="${txId}"`,
      expand: 'account_id'
    });

    const isRC = tipo === 'RC';
    const color = isRC ? '#059669' : '#DC2626';
    const icon  = isRC ? 'fa-hand-holding-dollar' : 'fa-paper-plane';
    const tipoLabel = isRC ? 'RECIBO DE CAJA' : 'COMPROBANTE DE EGRESO';

    // Calcular monto total (suma débitos en RC, créditos en CE)
    const montoTotal = lines.reduce((s: number, l: any) => s + (isRC ? Number(l.debit || 0) : Number(l.credit || 0)), 0);

    const lineasHtml = lines.map((l: any) => `
      <tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:5px 8px;font-size:12px;font-family:monospace">${_esc(l.expand?.account_id?.code || '')} — ${_esc(l.expand?.account_id?.name || '')}</td>
        <td style="padding:5px 8px;text-align:right;font-size:12px">${Number(l.debit) > 0 ? _fmt(l.debit) : ''}</td>
        <td style="padding:5px 8px;text-align:right;font-size:12px">${Number(l.credit) > 0 ? _fmt(l.credit) : ''}</td>
        <td style="padding:5px 8px;font-size:11px;color:#9CA3AF">${_esc(l.cross_doc_ref || '')}</td>
      </tr>`).join('');

    const html = `
      <div style="max-width:540px;margin:0 auto;font-family:'Segoe UI',sans-serif">
        <div style="background:${color};color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px">
          <i class="fas ${icon}" style="font-size:22px"></i>
          <div>
            <div style="font-size:17px;font-weight:700">${tipoLabel}</div>
            <div style="font-size:12px;opacity:0.85">Núm. ${_esc(tx.number)} &nbsp;&bull;&nbsp; ${String(tx.date || '').slice(0,10)}</div>
          </div>
        </div>
        <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:18px 22px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
            <div>
              <div style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700">Tercero</div>
              <div style="font-weight:600;color:#111;font-size:14px">${_esc(tx.expand?.third_party_id?.name || tx.third_party_id || '—')}</div>
            </div>
            <div>
              <div style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700">Estado</div>
              <div style="font-weight:600;color:${tx.status === 'active' ? '#059669' : '#6B7280'};font-size:14px">${_esc(tx.status || '')}</div>
            </div>
          </div>
          <div style="background:${isRC ? '#ECFDF5' : '#FEF2F2'};border-radius:10px;padding:14px;margin-bottom:14px;text-align:center">
            <div style="font-size:11px;text-transform:uppercase;color:${color};font-weight:700">VALOR ${isRC ? 'RECIBIDO' : 'PAGADO'}</div>
            <div style="font-size:30px;font-weight:800;color:${color}">${_fmt(montoTotal)}</div>
          </div>
          ${tx.description ? `<div style="margin-bottom:12px;padding:8px;background:#F9FAFB;border-radius:8px;font-size:12px;color:#6B7280">${_esc(tx.description)}</div>` : ''}
          <div style="font-size:11px;text-transform:uppercase;color:#9CA3AF;font-weight:700;margin-bottom:6px">Asiento Contable</div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:#F3F4F6">
                <th style="padding:5px 8px;text-align:left;border-bottom:1px solid #E5E7EB">Cuenta</th>
                <th style="padding:5px 8px;text-align:right;border-bottom:1px solid #E5E7EB">Débito</th>
                <th style="padding:5px 8px;text-align:right;border-bottom:1px solid #E5E7EB">Crédito</th>
                <th style="padding:5px 8px;text-align:left;border-bottom:1px solid #E5E7EB">Doc. Cruce</th>
              </tr>
            </thead>
            <tbody>${lineasHtml}</tbody>
          </table>
          <div style="margin-top:18px;padding-top:14px;border-top:1px dashed #E5E7EB;text-align:center;font-size:11px;color:#9CA3AF">
            GRAVY v2.0 &mdash; ${new Date().toLocaleString('es-CO')}
          </div>
        </div>
      </div>`;

    (window as any).openModal(
      `${tipoLabel} — ${tx.number}`,
      html,
      `<button class="btn btn-outline" onclick="closeModal()"><i class="fas fa-times mr-1"></i>Cerrar</button>
       <button class="btn btn-primary" onclick="window._printRecibo()"><i class="fas fa-print mr-1"></i>Imprimir</button>`,
      false
    );

    if (autoprint) {
      setTimeout(() => (window as any)._printRecibo(), 400);
    }

  } catch(err: any) {
    _showToast('Error al cargar el detalle: ' + err.message, 'error');
  }
}

// ─── MODALES TRANSACCIONALES ────────────────────────────────────────────────
let _tesoCurrentOpenItems: any[] = [];
let _tesoCurrentThirdParty: ThirdParty | null = null;

async function _loadOpenItemsForModal(thirdPartyId: string, isRecaudo: boolean, propertyId?: string) {
  const c = document.getElementById('teso-modal-items-container');
  if (!c) return;
  c.innerHTML = '<div class="p-4 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando partidas abiertas...</div>';
  
  try {
    const pb = _pb();
    
    let allowedRefs = new Set<string>();
    let blockedRefs = new Set<string>();
    
    // Calcular referencia de anticipo según modo
    const anticipoRef = propertyId ? `ANT-${propertyId}` : `ANT-${thirdPartyId}`;

    // Leer cuenta de anticipos desde config PH
    let anticipoAccountId: string | null = null;
    try {
      const cfgSets = await pb.listAll('settings', { filter: 'key="ph_config_v1"' });
      if (cfgSets.length) {
        const cfg = JSON.parse(cfgSets[0].value || '{}');
        anticipoAccountId = cfg.anticipo_account_id || null;
      }
    } catch(_) {}

    if (propertyId) {
       const invoices = await pb.listAll('ph_invoices', { filter: `property_id="${propertyId}" && status!="voided"` });
       invoices.forEach((inv: any) => allowedRefs.add(inv.number));
       // Siempre permitir la referencia de anticipo de esta unidad
       allowedRefs.add(anticipoRef);
       if (allowedRefs.size <= 1) { // Solo la ref de anticipo, sin facturas
         // Verificar si hay anticipo activo
         const hasAnticipo = allowedRefs.has(anticipoRef);
         if (!hasAnticipo) {
           c.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El inmueble no presenta saldos pendientes para esta operación.</div>`;
           return;
         }
       }
    } else {
       const invoices = await pb.listAll('ph_invoices', { filter: `property_id.owner_id="${thirdPartyId}" && status!="voided"` });
       invoices.forEach((inv: any) => blockedRefs.add(inv.number));
    }
    
    const allLines = await pb.listAll('tx_lines', {
      filter: `third_party_id="${thirdPartyId}"`,
      expand: 'tx_id,account_id'
    });

    const docs = new Map();
    
    for (const l of allLines) {
      if (l.expand?.tx_id?.status === 'voided') continue;
      const ref = (l.cross_doc_ref || '').trim();
      if (!ref) continue;

      // Permitir cuenta de anticipos aunque no maneje cruce, si la ref es la de anticipo
      const esAnticipo = ref === anticipoRef && anticipoAccountId && l.account_id === anticipoAccountId;
      if (!esAnticipo && !l.expand?.account_id?.maneja_cruce) continue;
      
      const possibleBase = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
      
      if (propertyId) {
          const isAllowed = allowedRefs.has(ref) || allowedRefs.has(possibleBase);
          if (!isAllowed) continue;
      } else {
          const isBlocked = blockedRefs.has(ref) || blockedRefs.has(possibleBase);
          if (isBlocked) continue;
      }
      
      const key = `${ref}|${l.account_id}`;
      if (!docs.has(key)) {
        docs.set(key, {
          key,
          ref,
          accountId: l.account_id,
          accountName: l.expand?.account_id?.name || '',
          firstDate: l.expand?.tx_id?.date || '',
          description: l.description || '',
          debit: 0,
          credit: 0
        });
      }
      const d = docs.get(key);
      d.debit += Number(l.debit || 0);
      d.credit += Number(l.credit || 0);
    }

    const allDocs = [...docs.values()].map(d => {
      const netOpen = d.debit - d.credit;
      const isAnticipo = d.ref === anticipoRef;
      // Para anticipos: saldo a favor = crédito > débito (netOpen < 0)
      // Para CxC: saldo pendiente = débito > crédito (netOpen > 0)
      let saldo: number;
      if (isAnticipo) {
        saldo = Math.abs(netOpen); // siempre positivo para display
      } else {
        saldo = isRecaudo ? netOpen : -netOpen;
      }
      return { ...d, saldo, netOpen, isAnticipo };
    });

    const anticipoItems = allDocs.filter(d => d.isAnticipo && d.saldo > 0.01);
    _tesoCurrentOpenItems = allDocs
      .filter(d => !d.isAnticipo && d.saldo > 0.01)
      .sort((a, b) => a.firstDate.localeCompare(b.firstDate));

    const totalAnticipo = anticipoItems.reduce((s, i) => s + i.saldo, 0);

    if (_tesoCurrentOpenItems.length === 0 && totalAnticipo <= 0.01) {
      c.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El tercero no presenta saldos pendientes para esta operación.</div>`;
      return;
    }

    // Banner de saldo a favor (anticipo)
    const anticipoBanner = totalAnticipo > 0.01 ? `
      <div class="flex items-center gap-3 p-3 rounded-xl mb-3" style="background:#ECFDF5;border:1.5px solid #6EE7B7">
        <div class="bg-green-500 text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-piggy-bank text-sm"></i>
        </div>
        <div class="flex-1">
          <p class="font-bold text-green-800 text-sm">Saldo a favor disponible</p>
          <p class="text-xs text-green-700">Este cliente tiene un anticipo de <strong>${_fmt(totalAnticipo)}</strong> que se aplicará automáticamente antes de consumir el efectivo.</p>
        </div>
        <div class="font-bold text-green-700 text-lg">${_fmt(totalAnticipo)}</div>
      </div>
    ` : '';

    const noCartera = _tesoCurrentOpenItems.length === 0 ? `
      <div class="p-3 text-center text-gray-500 text-sm">
        <i class="fas fa-check-circle text-green-500 mr-2"></i>Cartera al día. El pago se registrará como anticipo.
      </div>
    ` : '';

    c.innerHTML = `
      ${anticipoBanner}
      ${noCartera}
      ${_tesoCurrentOpenItems.length > 0 ? `
      <div class="overflow-x-auto border border-gray-200 rounded-lg mb-2">
        <table class="w-full text-sm data-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-2 text-left">Documento / Concepto</th>
              <th class="p-2 text-left">Cuenta</th>
              <th class="p-2 text-right">Saldo Pendiente</th>
              <th class="p-2 text-right" style="width: 140px">Abono a Aplicar</th>
            </tr>
          </thead>
          <tbody>
            ${_tesoCurrentOpenItems.map(i => `
              <tr class="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                <td class="p-2 font-medium">
                  ${_tesoCurrentOrigen === 'ph' && i.description
                    ? `<span class="block text-xs font-bold text-blue-700">${_esc(i.description)}</span><span class="block text-xs text-gray-400">${_esc(i.ref)} &middot; ${_esc(i.firstDate.slice(0,10))}</span>`
                    : `<span class="font-mono text-xs">${_esc(i.ref)}</span><div class="text-xs text-gray-400">${_esc(i.firstDate.slice(0,10))}</div>`}
                </td>
                <td class="p-2 text-gray-500 text-xs">${_esc(i.accountName)}</td>
                <td class="p-2 text-right font-bold ${isRecaudo ? 'text-red-600' : 'text-blue-600'}">${_fmt(i.saldo)}</td>
                <td class="p-2 text-right">
                  <input type="number" min="0" max="${i.saldo}" class="form-input text-right w-full teso-abono-input"
                    data-key="${i.key}" data-ref="${i.ref}" data-account="${i.accountId}" data-max="${i.saldo}"
                    placeholder="0" disabled>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot class="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colspan="2" class="p-2 text-right font-bold text-gray-700">Total cartera:</td>
              <td class="p-2 text-right font-bold text-red-700">${_fmt(_tesoCurrentOpenItems.reduce((s,i) => s+i.saldo, 0))}</td>
              <td class="p-2 text-right font-bold" id="teso-modal-total-abonos">$0</td>
            </tr>
          </tfoot>
        </table>
      </div>
      ` : ''}
    `;

    // Listener para inputs manuales si se cambia modo
    document.querySelectorAll('.teso-abono-input').forEach(inp => {
      inp.addEventListener('input', () => {
        let total = 0;
        document.querySelectorAll('.teso-abono-input').forEach(el => total += Number((el as HTMLInputElement).value || 0));
        document.getElementById('teso-modal-total-abonos')!.textContent = _fmt(total);
      });
    });
  } catch (err: any) {
    c.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200"><i class="fas fa-exclamation-triangle mr-2"></i> Error: ${err.message}</div>`;
  }
}

function _toggleModalManualMode() {
  const isManual = (document.getElementById('teso-modal-modo') as HTMLSelectElement).value === 'manual';
  document.querySelectorAll('.teso-abono-input').forEach(el => {
    const inp = el as HTMLInputElement;
    inp.disabled = !isManual;
    if (!isManual) inp.value = '';
  });
  if (!isManual) {
    const totEl = document.getElementById('teso-modal-total-abonos');
    if (totEl) totEl.textContent = '$0';
  }
}

// ─── INDICADOR DE DIFERENCIA (Opción 1) ────────────────────────────────────
function _updateMontoIndicator() {
  const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const indicatorEl = document.getElementById('teso-monto-indicator');
  if (!montoEl || !indicatorEl) return;

  const monto = Number(montoEl.value || 0);
  const totalCartera = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);

  if (monto <= 0 || totalCartera <= 0) {
    indicatorEl.innerHTML = '';
    return;
  }

  const diff = monto - totalCartera;
  const absDiff = Math.abs(diff);

  if (Math.abs(diff) < 1) {
    indicatorEl.innerHTML = `
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <i class="fas fa-check-circle"></i> Cubre exactamente la cartera
      </span>`;
  } else if (diff < 0) {
    indicatorEl.innerHTML = `
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
        <i class="fas fa-exclamation-triangle"></i> Pago parcial &mdash; queda ${_fmt(absDiff)} por cobrar
      </span>`;
  } else {
    indicatorEl.innerHTML = `
      <span class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
        <i class="fas fa-piggy-bank"></i> Excedente ${_fmt(absDiff)} &rarr; se registrará como anticipo
      </span>`;
  }
}

async function _saveTransaccionTeso(isRecaudo: boolean) {
  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const modoSelect = document.getElementById('teso-modal-modo') as HTMLSelectElement;
  const ctaSelect  = document.getElementById('teso-modal-cuenta') as HTMLSelectElement;
  const refInput   = document.getElementById('teso-modal-referencia') as HTMLInputElement;
  const obsInput   = document.getElementById('teso-modal-obs') as HTMLInputElement;

  const monto = Number(montoInput?.value || 0);
  const modo  = modoSelect?.value || 'auto';
  const bankAccountId = ctaSelect?.value || '';
  const cuentaOpt = ctaSelect?.options[ctaSelect.selectedIndex];
  const cuentaId  = cuentaOpt?.dataset?.account || '';
  const referencia = refInput?.value?.trim() || '';
  const observaciones = obsInput?.value?.trim() || '';

  // ── Validación reforzada (Opción 4) ──────────────────────────────────────
  if (!_tesoCurrentThirdParty) {
    _showToast('Debes seleccionar un tercero o unidad', 'warning'); return;
  }
  if (!cuentaId || !bankAccountId) {
    _showToast('Debes seleccionar un método de pago válido', 'warning'); return;
  }

  let distribucion: any[] = [];
  if (modo === 'manual') {
    let sum = 0;
    document.querySelectorAll('.teso-abono-input').forEach(el => {
      const inp = el as HTMLInputElement;
      const v = Number(inp.value);
      if (v > 0) {
        distribucion.push({ key: inp.dataset.key, cross_doc_ref: inp.dataset.ref, account_id: inp.dataset.account, monto: v });
        sum += v;
      }
    });
    if (sum <= 0) {
      _showToast('Debes indicar al menos un abono manual mayor a 0', 'warning'); return;
    }
  } else {
    if (monto <= 0) {
      _showToast('El monto debe ser mayor a $0 para poder registrar el recaudo', 'warning');
      montoInput?.focus();
      return;
    }
    const totalCartera = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
    if (totalCartera <= 0 && monto > 0) {
      // Si no hay cartera, confirmar que se creará anticipo
      const ok = window.confirm(`Este tercero no tiene cartera abierta.\nSe registrará un anticipo de ${_fmt(monto)} a su favor.\n\n¿Continuar?`);
      if (!ok) return;
    }
  }

  const btn = document.getElementById('btn-save-teso-tx') as HTMLButtonElement;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...'; }

  const typeCode = isRecaudo ? 'RC' : 'CE';
  try {
    const pb = _pb();
    const typeRes = await pb.listAll('transaction_types', { filter: `code="${typeCode}"` });
    if (!typeRes.length) throw new Error(`Falta tipo de transacción ${typeCode}`);

    const params: any = {
      third_party_id: _tesoCurrentThirdParty.id,
      amount: modo === 'manual' ? distribucion.reduce((a, b) => a + b.monto, 0) : monto,
      contrapartida_account_id: cuentaId
    };
    if (_tesoCurrentOrigen === 'ph' && _tesoCurrentPropertyId) {
      params.ph_property_id = _tesoCurrentPropertyId;
    }
    if (modo === 'manual') {
      params.distribucion = distribucion;
    } else {
      const sets = await pb.listAll('settings', { filter: `key="treasury_rules"` });
      let rules: any = { primeroVencido: true, primeroMora: true };
      if (sets.length && sets[0].value) { try { rules = JSON.parse(sets[0].value); } catch(_) {} }
      params.reglas = rules;
    }

    const montoFinal = params.amount;
    const fecha      = new Date().toISOString().slice(0, 10);
    const txNum      = `${typeCode}-${Date.now()}`;
    const terceroNombre = _tesoCurrentThirdParty.name || _tesoCurrentThirdParty.doc_number || '';
    const cuentaNombre  = cuentaOpt?.text || '';

    const txRecord = await pb.create('transactions', {
      tx_type_id:    typeRes[0].id,
      number:        txNum,
      date:          fecha,
      third_party_id: _tesoCurrentThirdParty.id,
      description:   observaciones || `${isRecaudo ? 'Recaudo' : 'Pago'} vía Módulo Tesorería${referencia ? ' Ref: ' + referencia : ''}`,
      status:        'active',
      teso_mode:     modo,
      teso_params:   JSON.stringify(params)
    });

    // Esperar al hook y obtener líneas contables para el recibo completo
    await new Promise(r => setTimeout(r, 800));
    let txLines: any[] = [];
    try { txLines = await pb.listAll('tx_lines', { filter: `tx_id="${txRecord.id}"`, expand: 'account_id' }); } catch(_) {}

    _closeModal();

    // ── Recibo Imprimible (Opción 2) ──────────────────────────────────────
    _showReciboPrint({
      tipo:        isRecaudo ? 'RECIBO DE CAJA' : 'COMPROBANTE DE EGRESO',
      numero:      txNum,
      fecha,
      tercero:     terceroNombre,
      monto:       montoFinal,
      cuenta:      cuentaNombre,
      referencia,
      observaciones,
      partidas:    _tesoCurrentOpenItems.slice(),
      modo,
      lineas:      txLines
    });

    renderTesoListado(document.getElementById('teso-content')!, typeCode as any);

  } catch (err: any) {
    console.error(err);
    const detail = err.data ? JSON.stringify(err.data) : '';
    _showToast(`Error: ${err.message} ${detail}`, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-paper-plane mr-2"></i>Registrar ${typeCode}`; }
  }
}

// ─── RECIBO IMPRIMIBLE (Opción 2) ───────────────────────────────────────────

// --- NUMERO EN LETRAS (ES-CO) -----------------------------------------------
function _numLetras(n: number): string {
  const u = ['','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve',
    'diez','once','doce','trece','catorce','quince','dieciseis','diecisiete','dieciocho','diecinueve',
    'veinte','veintiuno','veintidos','veintitres','veinticuatro','veinticinco','veintiseis','veintisiete','veintiocho','veintinueve'];
  const d = ['','','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
  const c = ['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
  if (n === 0) return 'cero';
  if (n < 0) return 'menos ' + _numLetras(-n);
  const e = Math.floor(n);
  const dec = Math.round((n - e) * 100);
  let str = '';
  if (e >= 1000000) { const m = Math.floor(e/1000000); str += (m===1?'un millon ':_numLetras(m)+' millones '); }
  if (e >= 1000) { const mi = Math.floor((e%1000000)/1000); str += (mi===1?'mil ':_numLetras(mi)+' mil '); }
  const ce = e % 1000;
  if (ce >= 100) { str += (ce===100?'cien ':c[Math.floor(ce/100)]+' '); }
  const re = ce % 100;
  if (re > 0 && re < 30) str += u[re] + ' ';
  else if (re >= 30) { str += d[Math.floor(re/10)] + (re%10 > 0 ? ' y ' + u[re%10] + ' ' : ' '); }
  const result = str.trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + ' pesos' + (dec > 0 ? ' con ' + dec + '/100' : ' con 00/100') + ' M/Cte.';
}

// --- PLANTILLA CARTA ---------------------------------------------------------
async function _buildReciboHTML(data: any, lineasContables: any[] = []) {
  const isRC = (data.tipo || '').includes('CAJA');
  const acColor  = isRC ? '#1D6F42' : '#B91C1C';
  const acBg     = isRC ? '#F0FDF4' : '#FFF1F2';
  const acLight  = isRC ? '#D1FAE5' : '#FECDD3';
  const tipoLbl  = isRC ? 'RECIBO DE CAJA' : 'COMPROBANTE DE EGRESO';
  const pb = _pb();
  let emp = {name:'',nit:'',address:'',phone:'',email:''};
  let elaboradoPor = '';
  try {
    const sets = await pb.listAll('settings', {});
    const m: any = Object.fromEntries(sets.map((s:any) => [s.key, s.value||'']));
    emp = {name:m.company_name||'',nit:m.company_nit||'',address:m.company_address||'',phone:m.company_phone||'',email:m.company_email||''};
    elaboradoPor = m.representante_legal_name || m.legal_representative_name || '';
  } catch(_) {}
  const tObj    = data.terceroObj || {};
  const tNombre = tObj.name || data.tercero || '';
  const tDoc    = tObj.doc_number || '';
  const tEmail  = tObj.email || '';
  const tPhone  = tObj.phone || '';
  const tDir    = tObj.address || '';
  const enLetras = _numLetras(Number(data.monto||0));

  const filaP = (data.partidas||[]).map((p:any)=>
    `<tr style="border-bottom:1px solid #E5E7EB">
      <td style="padding:5px 10px;font-size:12px">${_esc(p.ref||'')}${p.description?' - '+_esc(p.description):''}</td>
      <td style="padding:5px 10px;font-size:12px;text-align:right">${_fmt(p.saldo)}</td>
    </tr>`).join('');

  const filaL = lineasContables.map((l:any)=>
    `<tr style="border-bottom:1px solid #E5E7EB">
      <td style="padding:4px 10px;font-size:11px;font-family:monospace">${_esc(l.expand?.account_id?.code||'')} - ${_esc(l.expand?.account_id?.name||'')}</td>
      <td style="padding:4px 10px;font-size:11px;text-align:right">${Number(l.debit)>0?_fmt(l.debit):''}</td>
      <td style="padding:4px 10px;font-size:11px;text-align:right">${Number(l.credit)>0?_fmt(l.credit):''}</td>
      <td style="padding:4px 10px;font-size:11px;color:#9CA3AF">${_esc(l.cross_doc_ref||'')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html lang="es"><head>
  <meta charset="UTF-8">
  <title>${tipoLbl} ${data.numero||''}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#111;background:#fff}
    .page{width:216mm;min-height:279mm;margin:0 auto;padding:14mm 16mm;background:#fff}
    .no-print{text-align:center;padding:12px;background:#F3F4F6;border-top:1px solid #E5E7EB}
    table{border-collapse:collapse;width:100%}
    @media print{.no-print{display:none}@page{size:letter;margin:12mm 14mm}}
  </style>
</head><body>
<div class="page">

  <table style="margin-bottom:14px">
    <tr>
      <td style="width:65%;vertical-align:top">
        <div style="font-size:18px;font-weight:800;color:#0D2137">${_esc(emp.name)||'Razon Social'}</div>
        ${emp.nit?`<div style="font-size:11px;color:#6B7280">NIT: ${_esc(emp.nit)}</div>`:''}
        ${emp.address?`<div style="font-size:11px;color:#6B7280">${_esc(emp.address)}</div>`:''}
        ${emp.phone?`<div style="font-size:11px;color:#6B7280">Tel: ${_esc(emp.phone)}${emp.email?' | '+_esc(emp.email):''}</div>`:''}
      </td>
      <td style="width:35%;vertical-align:top;text-align:right">
        <div style="display:inline-block;background:${acColor};color:#fff;padding:8px 16px;border-radius:8px;text-align:center">
          <div style="font-size:11px;font-weight:800;letter-spacing:1px">${tipoLbl}</div>
          <div style="font-size:22px;font-weight:900;letter-spacing:2px">No. ${_esc(data.numero||'')}</div>
        </div>
      </td>
    </tr>
  </table>

  <hr style="border:none;border-top:2px solid ${acColor};margin-bottom:12px">

  <table style="margin-bottom:12px;font-size:12px">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:12px">
        <div style="background:${acBg};border:1px solid ${acLight};border-radius:8px;padding:10px 12px">
          <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:${acColor};margin-bottom:6px">DATOS DEL ${isRC?'CLIENTE':'PROVEEDOR'}</div>
          <div style="font-weight:700;font-size:13px;color:#111">${_esc(tNombre)||'---'}</div>
          ${tDoc?`<div style="color:#374151">C.C./NIT: <strong>${_esc(tDoc)}</strong></div>`:''}
          ${tDir?`<div style="color:#6B7280;font-size:11px">${_esc(tDir)}</div>`:''}
          ${tPhone?`<div style="color:#6B7280;font-size:11px">Tel: ${_esc(tPhone)}</div>`:''}
          ${tEmail?`<div style="color:#6B7280;font-size:11px">${_esc(tEmail)}</div>`:''}
        </div>
      </td>
      <td style="width:50%;vertical-align:top">
        <table style="font-size:12px;width:100%">
          <tr><td style="color:#6B7280;padding:3px 0">Fecha:</td><td style="font-weight:700;text-align:right">${_esc(String(data.fecha||'').slice(0,10))}</td></tr>
          <tr><td style="color:#6B7280;padding:3px 0">Metodo ${isRC?'recaudo':'pago'}:</td><td style="text-align:right;font-size:11px">${_esc(data.cuenta||'')}</td></tr>
          ${data.referencia?`<tr><td style="color:#6B7280;padding:3px 0">Referencia:</td><td style="font-weight:700;text-align:right">${_esc(data.referencia)}</td></tr>`:''}
        </table>
      </td>
    </tr>
  </table>

  <div style="background:${acBg};border:1.5px solid ${acLight};border-radius:10px;padding:12px 16px;margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:${acColor}">VALOR ${isRC?'RECIBIDO':'PAGADO'}</div>
    <div style="font-size:28px;font-weight:900;color:${acColor}">${_fmt(data.monto||0)}</div>
    <div style="font-size:10px;color:#374151;margin-top:2px;font-style:italic">${enLetras}</div>
  </div>

  ${(data.partidas||[]).length>0?`
  <div style="margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:#374151;margin-bottom:4px">DETALLE DE APLICACION</div>
    <table style="border:1px solid #E5E7EB">
      <thead><tr style="background:#F3F4F6">
        <th style="padding:5px 10px;text-align:left;font-size:11px">Documento / Concepto</th>
        <th style="padding:5px 10px;text-align:right;font-size:11px">Valor</th>
      </tr></thead>
      <tbody>${filaP}</tbody>
    </table>
  </div>`:'<div style="font-size:11px;color:#6B7280;margin-bottom:12px;font-style:italic">Registrado como anticipo - sin cartera abierta a la fecha.</div>'}

  ${filaL?`
  <div style="margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:#374151;margin-bottom:4px">ASIENTO CONTABLE</div>
    <table style="border:1px solid #E5E7EB">
      <thead><tr style="background:#F3F4F6">
        <th style="padding:4px 10px;text-align:left;font-size:11px">Cuenta</th>
        <th style="padding:4px 10px;text-align:right;font-size:11px">Debito</th>
        <th style="padding:4px 10px;text-align:right;font-size:11px">Credito</th>
        <th style="padding:4px 10px;text-align:left;font-size:11px">Doc. Cruce</th>
      </tr></thead>
      <tbody>${filaL}</tbody>
    </table>
  </div>`:''}

  ${data.observaciones?`
  <div style="border:1px solid #E5E7EB;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:12px">
    <span style="font-size:9px;text-transform:uppercase;font-weight:700;color:#6B7280">Observaciones: </span>
    <span style="color:#374151">${_esc(data.observaciones)}</span>
  </div>`:''}

  <div style="display:flex;gap:40px;justify-content:space-around;margin-top:36px">
    <div style="text-align:center;flex:1">
      <div style="border-top:1px solid #374151;padding-top:6px;margin-top:40px">
        <div style="font-size:11px;font-weight:700;color:#111">${elaboradoPor||'&nbsp;'}</div>
        <div style="font-size:10px;color:#6B7280">Elaborado por</div>
      </div>
    </div>
    <div style="text-align:center;flex:1">
      <div style="border-top:1px solid #374151;padding-top:6px;margin-top:40px">
        <div style="font-size:11px;font-weight:700;color:#111">&nbsp;</div>
        <div style="font-size:10px;color:#6B7280">Firma Recibido</div>
        ${tDoc?`<div style="font-size:9px;color:#9CA3AF">C.C./NIT: ${_esc(tDoc)}</div>`:''}
      </div>
    </div>
  </div>

  <div style="margin-top:16px;padding-top:8px;border-top:1px dashed #D1D5DB;text-align:center;font-size:9px;color:#9CA3AF">
    GRAVY v2.0 - Generado el ${new Date().toLocaleString('es-CO')} - Documento de control interno
  </div>

</div>
<div class="no-print">
  <button onclick="window.print()" style="padding:9px 24px;background:#1E40AF;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">
    Imprimir
  </button>
  <button onclick="window.close()" style="margin-left:10px;padding:9px 20px;background:#E5E7EB;color:#374151;border:none;border-radius:8px;cursor:pointer;font-size:14px">
    Cerrar
  </button>
</div>
</body></html>`;
}

// --- SHOW RECIBO (post-registro) ---------------------------------------------
async function _showReciboPrint(data: any) {
  const isRC = (data.tipo||'').includes('CAJA');
  const acColor = isRC ? '#1D6F42' : '#B91C1C';
  const acBg    = isRC ? '#F0FDF4' : '#FFF1F2';
  if (_tesoCurrentThirdParty) data.terceroObj = _tesoCurrentThirdParty;

  // Generar recibo carta completo con líneas contables del hook
  const html = await _buildReciboHTML(data, data.lineas || []);

  const preview = `
    <div style="font-size:13px;font-family:'Segoe UI',sans-serif">
      <div style="display:flex;align-items:center;gap:12px;padding:14px;background:${acBg};border-radius:10px;margin-bottom:10px">
        <i class="fas fa-check-circle" style="font-size:28px;color:${acColor};flex-shrink:0"></i>
        <div style="flex:1">
          <p style="font-weight:700;font-size:14px;color:#111;margin:0">${_esc(data.tipo)} registrado</p>
          <p style="color:#6B7280;font-size:12px;margin:3px 0 0">No. <strong>${_esc(data.numero)}</strong> &bull; <strong>${_fmt(data.monto)}</strong></p>
          <p style="color:#6B7280;font-size:11px;font-style:italic;margin:2px 0 0">${_numLetras(data.monto)}</p>
        </div>
      </div>
      <p style="font-size:11px;color:#9CA3AF;text-align:center;margin:0">
        El recibo incluye datos de empresa, tercero, asiento contable completo y firmas.
      </p>
    </div>`;

  (window as any).openModal(`${data.tipo} registrado`, preview,
    `<button class="btn btn-outline" onclick="closeModal()"><i class="fas fa-times mr-1"></i>Cerrar</button>
     <button class="btn btn-primary" id="btn-print-recibo"><i class="fas fa-print mr-1"></i>Imprimir Recibo</button>`,
    false);

  setTimeout(() => {
    document.getElementById('btn-print-recibo')?.addEventListener('click', () => {
      const w = window.open('', '_blank', 'width=920,height=760');
      if (w) { w.document.write(html); w.document.close(); }
    });
  }, 100);
}


(window as any)._printRecibo = async (htmlStr?: string) => {
  if (htmlStr) {
    const w = window.open('', '_blank', 'width=900,height=750');
    if (w) { w.document.write(htmlStr); w.document.close(); }
    return;
  }
  const modal = document.getElementById('modal-body') || document.querySelector('[id*=modal] > div');
  if (!modal) return;
  const w = window.open('', '_blank', 'width=900,height=750');
  if (!w) return;
  w.document.write(modal.innerHTML);
  w.document.close();
};

async function openRecaudoModal() {
  _tesoCurrentOpenItems = [];
  _tesoCurrentThirdParty = null;
  
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await _pb().listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }
  const metodosPago = await _pb().listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });

  const bodyHtml = `
    <div class="flex flex-col h-full gap-3">
      <!-- DASHBOARD PANORÁMICO DE 4 COLUMNAS -->
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        <!-- Tercero -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" id="teso-lbl-tercero">Tercero (Cliente)</label>
          <div id="modal-rc-wrap" class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search"></i></div>
            <input id="modal-rc-search" class="form-input pl-8 py-2 text-sm bg-gray-50 focus:bg-white transition-colors" autocomplete="off" placeholder="Buscar...">
            <input id="modal-rc-hidden" type="hidden" value="">
            <div id="modal-rc-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>

        <!-- Monto -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Monto a Recibir</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-green-600 font-bold">$</div>
            <input id="teso-modal-monto" type="number" min="1"
              class="form-input pl-7 py-2 font-bold text-green-700 bg-green-50/30 border-green-200 focus:border-green-500 focus:ring-green-100 placeholder-green-300"
              placeholder="0.00" oninput="window._updateMontoIndicator()">
          </div>
          <div id="teso-monto-indicator" class="mt-1 min-h-[20px]"></div>
        </div>

        <!-- Método de Pago -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Método / Banco</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-university"></i></div>
             <select id="teso-modal-cuenta" class="form-input pl-8 py-2 text-sm bg-gray-50">
               <option value="">— Seleccionar —</option>
               ${metodosPago.map((c:any) => `<option value="${c.id}" data-account="${c.account_id}">${_esc(c.name)} (${_esc(c.bank)})</option>`).join('')}
             </select>
          </div>
        </div>

        <!-- Modo Aplicación -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aplicación</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-500"><i class="fas fa-magic"></i></div>
             <select id="teso-modal-modo" class="form-input pl-8 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-blue-200 focus:border-blue-500" onchange="window._toggleModalManualMode()">
               <option value="auto">Automática</option>
               <option value="manual">Manual (Grilla)</option>
             </select>
          </div>
        </div>
      </div>
      
      <!-- CONTENEDOR DE CARTERA (GRILLA) -->
      <div id="teso-modal-items-container" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-gray-400 min-h-[300px] shadow-inner overflow-hidden">
        <div class="text-center">
          <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-search-dollar text-2xl text-gray-400"></i>
          </div>
          <p class="font-medium text-gray-500">Busca un tercero para visualizar su cartera</p>
        </div>
      </div>

      <!-- FILA INFERIOR: Referencia + Observaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-hashtag mr-1"></i>Número de Referencia</label>
          <input id="teso-modal-referencia" type="text" class="form-input py-2 text-sm" placeholder="No. recibo, transferencia, etc.">
        </div>
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-comment-alt mr-1"></i>Observaciones</label>
          <input id="teso-modal-obs" type="text" class="form-input py-2 text-sm" placeholder="Nota interna opcional...">
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(true)">
      <i class="fas fa-paper-plane mr-2"></i>Registrar RC
    </button>
  `;

  _openModal('Nuevo Recibo de Caja', bodyHtml, footerHtml, true);

  setTimeout(async () => {
    try {
      const sets = await _pb().listAll('settings', { filter: `key="treasury_rules"` });
      let rules: any = { modoOperacion: 'comercial' };
      if (sets.length && sets[0].value) {
        try { rules = { ...rules, ...JSON.parse(sets[0].value) }; } catch(e) {}
      }
      (window as any)._changeTesoOrigen(rules.modoOperacion === 'ph' ? 'ph' : 'comercial');
    } catch (e) {
      (window as any)._changeTesoOrigen('comercial');
    }
  }, 50);
}

async function openPagoModal() {
  _tesoCurrentOpenItems = [];
  _tesoCurrentThirdParty = null;
  
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await _pb().listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }
  const metodosPago = await _pb().listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });

  const bodyHtml = `
    <div class="flex flex-col h-full gap-3">
      <!-- DASHBOARD PANORÁMICO DE 4 COLUMNAS -->
      <div class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        <!-- Tercero -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Proveedor / Acreedor</label>
          <div id="modal-eg-wrap" class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search"></i></div>
            <input id="modal-eg-search" class="form-input pl-8 py-2 text-sm bg-gray-50 focus:bg-white transition-colors" autocomplete="off" placeholder="Buscar...">
            <input id="modal-eg-hidden" type="hidden" value="">
            <div id="modal-eg-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>

        <!-- Monto -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Monto a Pagar</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-red-600 font-bold">$</div>
            <input id="teso-modal-monto" type="number" min="1" class="form-input pl-7 py-2 font-bold text-red-700 bg-red-50/30 border-red-200 focus:border-red-500 focus:ring-red-100 placeholder-red-300" placeholder="0.00">
          </div>
        </div>

        <!-- Método de Pago -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuenta de Origen</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-university"></i></div>
             <select id="teso-modal-cuenta" class="form-input pl-8 py-2 text-sm bg-gray-50">
               <option value="">— Seleccionar —</option>
               ${metodosPago.map((c:any) => `<option value="${c.id}" data-account="${c.account_id}">${_esc(c.name)} (${_esc(c.bank)})</option>`).join('')}
             </select>
          </div>
        </div>

        <!-- Modo Aplicación -->
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Aplicación</label>
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-blue-500"><i class="fas fa-magic"></i></div>
             <select id="teso-modal-modo" class="form-input pl-8 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-blue-200 focus:border-blue-500" onchange="window._toggleModalManualMode()">
               <option value="auto">Automática</option>
               <option value="manual">Manual (Grilla)</option>
             </select>
          </div>
        </div>
      </div>
      
      <!-- CONTENEDOR DE CARTERA (GRILLA) -->
      <div id="teso-modal-items-container" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center text-gray-400 min-h-[300px] shadow-inner overflow-hidden">
        <div class="text-center">
          <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-file-invoice-dollar text-2xl text-gray-400"></i>
          </div>
          <p class="font-medium text-gray-500">Busca un proveedor para visualizar sus obligaciones</p>
        </div>
      </div>

      <!-- FILA INFERIOR: Referencia + Observaciones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-hashtag mr-1"></i>Número de Referencia</label>
          <input id="teso-modal-referencia" type="text" class="form-input py-2 text-sm" placeholder="No. cheque, transferencia, etc.">
        </div>
        <div class="form-group mb-0">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"><i class="fas fa-comment-alt mr-1"></i>Observaciones</label>
          <input id="teso-modal-obs" type="text" class="form-input py-2 text-sm" placeholder="Nota interna opcional...">
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-danger" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(false)">
      <i class="fas fa-paper-plane mr-2"></i>Registrar Pago
    </button>
  `;

  _openModal('Nuevo Comprobante de Egreso', bodyHtml, footerHtml, true);

  setTimeout(() => {
    _initTesoTerceroAutocomplete(
      'modal-eg-wrap', 'modal-eg-search', 'modal-eg-hidden', 'modal-eg-results',
      (t) => t.type === 'PROVEEDOR' || t.type === 'ACREEDOR',
      (t) => {
        _tesoCurrentThirdParty = t;
        _loadOpenItemsForModal(t.id, false).then(() => {
          // Autocompletar monto con total de CxP
          const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
          if (total > 0) {
            const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
            if (montoEl && !montoEl.value) montoEl.value = String(Math.round(total));
          }
        });
      }
    );
  }, 50);
}

// ─── DASHBOARD ───────────────────────────────────────────────
async function renderTesoDashboard() {
  const c = document.getElementById('teso-content');
  if (!c) return;
  try {
    const pb = _pb();
    const [cxcRes, cxpRes] = await Promise.all([
      pb.listAll('tx_lines', { filter: 'debit > credit' }),
      pb.listAll('tx_lines', { filter: 'credit > debit' }),
    ]);
    const saldoCxC = cxcRes.reduce((acc: number, cur: any) => acc + (cur.debit - cur.credit), 0);
    const saldoCxP = cxpRes.reduce((acc: number, cur: any) => acc + (cur.credit - cur.debit), 0);
    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-green-800 mb-1 flex items-center"><i class="fas fa-hand-holding-dollar mr-2"></i> Total Cuentas por Cobrar</div>
          <div class="text-4xl font-bold text-green-900 my-2">${_fmt(saldoCxC)}</div>
          <div class="text-sm text-green-700">${cxcRes.length} partidas abiertas a favor</div>
        </div>
        <div class="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-red-800 mb-1 flex items-center"><i class="fas fa-file-invoice-dollar mr-2"></i> Total Cuentas por Pagar</div>
          <div class="text-4xl font-bold text-red-900 my-2">${_fmt(saldoCxP)}</div>
          <div class="text-sm text-red-700">${cxpRes.length} obligaciones pendientes</div>
        </div>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 flex items-start gap-4">
        <i class="fas fa-robot mt-1 text-xl text-blue-600"></i>
        <div>
          <p class="font-bold text-base mb-1">Tesorería Inteligente</p>
          <p class="mb-2">El motor backend aplica automáticamente los pagos cruzando de manera precisa la cuenta de origen contra la cuenta de cartera específica (Capital, Intereses, etc.), asegurando un cuadre contable perfecto.</p>
          <p class="text-xs text-blue-700 font-semibold cursor-pointer hover:underline" onclick="openTesoreriaConfigModal()"><i class="fas fa-cog mr-1"></i> Configurar Reglas de Aplicación Automática</p>
        </div>
      </div>`;
  } catch (err: any) {
    c.innerHTML = `<div class="text-red-500 p-4">Error cargando dashboard: ${err.message}</div>`;
  }
}

// ─── MODAL DE CONFIGURACIÓN ───────────────────────────────────────────
async function openTesoreriaConfigModal() {
  try {
    const pb = _pb();
    const settingsReq = await pb.listAll('settings', { filter: `key="treasury_rules"` });
    const cuentas = await pb.listAll('accounts', { filter: 'level>=3', sort: 'code' });
    
    let rules: any = { primeroVencido: true, primeroMora: true, interesPrioridad: true, cuentasInteres: [] };
    let recordId = '';
    
    if (settingsReq.length > 0) {
      recordId = settingsReq[0].id;
      if (settingsReq[0].value) {
        try { rules = { ...rules, ...JSON.parse(settingsReq[0].value) }; } catch (_) {}
      }
    }

    const accountOptions = cuentas.map((c:any) => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
    
    const bodyHtml = `
      <div class="space-y-6">
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
          <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-building mr-2 text-blue-600"></i>Modo de Operación de Recaudos</h4>
          <p class="text-xs text-gray-500 mb-4">Define el comportamiento predeterminado para buscar la cartera al hacer un Recibo de Caja.</p>
          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="radio" name="teso-cfg-modo-operacion" value="comercial" class="mt-1 w-4 h-4 text-blue-600" ${rules.modoOperacion !== 'ph' ? 'checked' : ''}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Comercial (Búsqueda por Tercero)</span>
                <span class="block text-xs text-gray-500 mt-1">Busca clientes de forma global por nombre o documento.</span>
              </div>
            </label>
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="radio" name="teso-cfg-modo-operacion" value="ph" class="mt-1 w-4 h-4 text-blue-600" ${rules.modoOperacion === 'ph' ? 'checked' : ''}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Propiedad Horizontal (Búsqueda por Unidad)</span>
                <span class="block text-xs text-gray-500 mt-1">Busca inmuebles (Ej: APTO A101) para filtrar y pagar solo la cartera de esa unidad.</span>
              </div>
            </label>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-sort-amount-down mr-2 text-blue-600"></i>Prioridad de Aplicación Automática</h4>
          <p class="text-xs text-gray-500 mb-4">Cuando se registre un pago o recaudo en modo "Automático", el sistema ordenará las partidas abiertas del tercero siguiendo estas reglas:</p>
          
          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="checkbox" id="teso-cfg-fifo" class="mt-1 w-4 h-4 text-blue-600" ${rules.primeroVencido ? 'checked' : ''}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Método FIFO (Facturas más antiguas primero)</span>
                <span class="block text-xs text-gray-500 mt-1">Aplica los abonos comenzando por los saldos cuya fecha de causación sea más antigua.</span>
              </div>
            </label>
            
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="checkbox" id="teso-cfg-mora" class="mt-1 w-4 h-4 text-blue-600" ${rules.primeroMora ? 'checked' : ''}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Priorizar facturas vencidas (En mora)</span>
                <span class="block text-xs text-gray-500 mt-1">Si está activo, se pagarán primero las facturas que ya pasaron su fecha de vencimiento.</span>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200 bg-blue-50/50 cursor-pointer">
              <input type="checkbox" id="teso-cfg-interes" class="mt-1 w-4 h-4 text-blue-600" ${rules.interesPrioridad ? 'checked' : ''}>
              <div class="w-full">
                <span class="block font-semibold text-sm text-blue-900">Regla Especial: Interés a Capital (Copropiedades)</span>
                <span class="block text-xs text-blue-700 mt-1 mb-2">Aplica el abono primero a las líneas de interés antes que a capital, identificándolas por código contable.</span>
                
                <div class="form-group mt-2 mb-0">
                  <label class="text-xs font-semibold text-gray-600">Códigos contables de cuentas de Intereses (separados por coma)</label>
                  <input id="teso-cfg-cuentas-interes" type="text" class="form-input text-sm" placeholder="Ej: 1345, 134510" value="${(rules.cuentasInteres || []).join(', ')}">
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-cfg">
        <i class="fas fa-save mr-2"></i>Guardar Reglas
      </button>
    `;

    _openModal('Configuración de Tesorería Automática', bodyHtml, footerHtml, false);

    document.getElementById('btn-save-cfg')!.onclick = async () => {
      const btn = document.getElementById('btn-save-cfg') as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

      const fifo = (document.getElementById('teso-cfg-fifo') as HTMLInputElement).checked;
      const mora = (document.getElementById('teso-cfg-mora') as HTMLInputElement).checked;
      const interes = (document.getElementById('teso-cfg-interes') as HTMLInputElement).checked;
      const ctasStr = (document.getElementById('teso-cfg-cuentas-interes') as HTMLInputElement).value;
      const cuentasArr = ctasStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const modoOperacion = (document.querySelector('input[name="teso-cfg-modo-operacion"]:checked') as HTMLInputElement)?.value || 'comercial';

      const payload = {
        key: 'treasury_rules',
        value: JSON.stringify({
          modoOperacion,
          primeroVencido: fifo,
          primeroMora: mora,
          interesPrioridad: interes,
          cuentasInteres: cuentasArr
        })
      };

      try {
        if (recordId) {
          await pb.update('settings', recordId, payload);
        } else {
          await pb.create('settings', payload);
        }
        _showToast('Reglas guardadas correctamente', 'success');
        _closeModal();
      } catch (e: any) {
        _showToast(`Error: ${e.message}`, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Reglas';
      }
    };

  } catch (err: any) {
    _showToast(`Error al abrir configuración: ${err.message}`, 'error');
  }
}

// ─── ESTRUCTURA PRINCIPAL DEL MÓDULO ─────────────────────────────────────
function showTesoreriaScreen(container: HTMLElement) {
  const c = container || document.getElementById('page-content');
  if (!c) return;
  c.innerHTML = `
    <div class="page-header flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Tesorería</h2>
        <p class="text-gray-500 text-sm mt-1">Gestión de recaudos, pagos a proveedores y conciliación.</p>
      </div>
      <button class="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm" onclick="openTesoreriaConfigModal()">
        <i class="fas fa-cog mr-2 text-gray-500"></i>Configuración
      </button>
    </div>

    <div class="flex gap-1 mb-6 border-b border-gray-200">
      <button class="tab-btn teso-tab px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-target="dashboard">Resumen</button>
      <button class="tab-btn teso-tab px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-target="recaudos">Recaudos (RC)</button>
      <button class="tab-btn teso-tab px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-target="pagos">Pagos (CE)</button>
    </div>

    <div id="teso-content" class="min-h-96"></div>
  `;

  document.querySelectorAll('.teso-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).dataset.target;
      setTesoTab(target!);
    });
  });

  setTesoTab('dashboard');
}

function setTesoTab(tab: string) {
  document.querySelectorAll('.teso-tab').forEach(btn => {
    const t = (btn as HTMLElement).dataset.target;
    if (t === tab) {
      btn.classList.add('text-blue-600', 'border-blue-600');
      btn.classList.remove('text-gray-500', 'border-transparent');
    } else {
      btn.classList.remove('text-blue-600', 'border-blue-600');
      btn.classList.add('text-gray-500', 'border-transparent');
    }
  });

  const c = document.getElementById('teso-content')!;
  if (tab === 'dashboard') renderTesoDashboard();
  if (tab === 'recaudos') renderTesoListado(c, 'RC');
  if (tab === 'pagos') renderTesoListado(c, 'CE');
}

// Registro en el router
if ((window as any).registerModule) {
  (window as any).registerModule('tesoreria', showTesoreriaScreen);
}

// Exponer en window para compatibilidad global
(window as any).showTesoreriaScreen = showTesoreriaScreen;
(window as any).openRecaudoModal = openRecaudoModal;
(window as any).openPagoModal = openPagoModal;
(window as any).openTesoreriaConfigModal = openTesoreriaConfigModal;
(window as any)._toggleModalManualMode = _toggleModalManualMode;
(window as any)._saveTransaccionTeso = _saveTransaccionTeso;
(window as any)._updateMontoIndicator = _updateMontoIndicator;
(window as any)._changeTesoOrigen = _changeTesoOrigen;

// ─── CARGA MASIVA DE RECAUDOS PH ─────────────────────────────────────────────

function _downloadPlantillaRC() {
  const XLSX = (window as any).XLSX;
  if (!XLSX) { _showToast('Librería XLSX no cargada', 'error'); return; }
  const ws = XLSX.utils.aoa_to_sheet([
    ['codigo_unidad', 'fecha', 'valor', 'referencia', 'observaciones'],
    ['A101', '2026-05-16', 450000, 'TRANSF-9821', 'Pago mayo'],
    ['B202', '2026-05-16', 380000, '', 'Pago cuota ordinaria'],
    ['C303', '2026-05-16', 520000, 'CHQ-4455', ''],
  ]);
  ws['!cols'] = [{wch:16},{wch:14},{wch:12},{wch:18},{wch:24}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recaudos');
  XLSX.writeFile(wb, 'plantilla_recaudos_ph.xlsx');
}

async function _openMassRCModal() {
  const pb = _pb();
  const metodosPago = await pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });
  if (!metodosPago.length) { _showToast('No hay cuentas bancarias activas', 'warning'); return; }
  let _massRows: any[] = [];
  const optsPago = metodosPago.map((c:any) => `<option value="${_esc(c.id)}" data-account="${_esc(c.account_id)}">${_esc(c.name)} (${_esc(c.bank)})</option>`).join('');
  const bodyHtml = `<div style="font-family:'Segoe UI',sans-serif">
    <div id="mass-rc-step1">
      <p class="text-sm text-gray-600 mb-3">Descarga la plantilla, completa los datos y súbela para registrar múltiples recaudos automáticamente.</p>
      <div class="form-group"><label class="block text-xs font-bold text-gray-500 uppercase mb-1"><i class="fas fa-university mr-1"></i>Método de Pago (aplica a todos)</label>
        <select id="mass-rc-cuenta" class="form-input"><option value="">-- Seleccionar --</option>${optsPago}</select></div>
      <div id="mass-rc-drop" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all mt-3" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium text-gray-700">Arrastra el archivo aquí o <span style="color:#1D6F42;text-decoration:underline">haz clic</span></p>
        <p class="text-xs mt-1 text-gray-400">Formato: .xlsx / .xls — máx. 8 MB</p>
        <input type="file" id="mass-rc-file" accept=".xlsx,.xls" class="hidden">
      </div>
    </div>
    <div id="mass-rc-step2" class="hidden">
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm font-semibold text-gray-800">Vista previa y validación</p>
        <span id="mass-rc-badge" class="text-xs font-semibold"></span>
      </div>
      <div class="border border-gray-200 rounded-xl overflow-hidden" style="max-height:340px;overflow-y:auto">
        <table class="data-table w-full text-xs"><thead class="bg-gray-50"><tr>
          <th class="p-2">Fila</th><th class="p-2 text-left">Unidad</th><th class="p-2 text-left">Propietario</th>
          <th class="p-2 text-left">Fecha</th><th class="p-2 text-right">Valor</th><th class="p-2 text-left">Ref.</th>
          <th class="p-2 text-center">Estado</th><th class="p-2 text-left">Detalle</th>
        </tr></thead><tbody id="mass-rc-tbody"></tbody></table>
      </div>
    </div>
    <div id="mass-rc-step3" class="hidden text-center">
      <div class="rounded-xl p-5" style="background:#F0FDF4;border:1px solid #D1FAE5">
        <i class="fas fa-spinner fa-spin text-3xl mb-3" id="mass-rc-spin" style="color:#059669"></i>
        <i class="fas fa-check-circle text-3xl mb-3 hidden" id="mass-rc-done-icon" style="color:#059669"></i>
        <p class="font-semibold text-gray-800 mb-3" id="mass-rc-status">Procesando recaudos...</p>
        <div class="w-full rounded-full h-3 mb-2" style="background:#D1FAE5">
          <div id="mass-rc-bar" class="h-3 rounded-full transition-all" style="background:#059669;width:0%"></div>
        </div>
        <p class="text-xs text-gray-500" id="mass-rc-detail"></p>
      </div>
      <div id="mass-rc-result" class="mt-3 hidden"></div>
    </div>
  </div>`;
  const footerHtml = `<button class="btn btn-outline" onclick="closeModal()"><i class="fas fa-times mr-1"></i>Cancelar</button>
    <button class="btn btn-outline" onclick="window._downloadPlantillaRC()"><i class="fas fa-download mr-1"></i>Plantilla</button>
    <button class="btn btn-primary hidden" id="mass-rc-btn-next"></button>`;
  (window as any).openModal('Carga Masiva de Recaudos PH', bodyHtml, footerHtml, true);
  setTimeout(() => {
    const drop = document.getElementById('mass-rc-drop');
    const fileInp = document.getElementById('mass-rc-file') as HTMLInputElement;
    const btnNext = document.getElementById('mass-rc-btn-next') as HTMLButtonElement;
    const hilite = (on: boolean) => { if (!drop) return; drop.style.borderColor = on?'#1D6F42':'#D1D5DB'; drop.style.background = on?'#ECFDF5':'#FAFAFA'; };
    drop?.addEventListener('click', () => fileInp?.click());
    drop?.addEventListener('dragover', e => { e.preventDefault(); hilite(true); });
    drop?.addEventListener('dragleave', () => hilite(false));
    drop?.addEventListener('drop', e => { e.preventDefault(); hilite(false); const f=(e as DragEvent).dataTransfer?.files?.[0]; if(f) processFile(f); });
    fileInp?.addEventListener('change', () => { if(fileInp.files?.[0]) processFile(fileInp.files[0]); });
    btnNext?.addEventListener('click', () => execute());
    async function processFile(file: File) {
      if (file.size > 8*1024*1024) { _showToast('El archivo supera 8 MB','error'); return; }
      const XLSX = (window as any).XLSX;
      if (!XLSX) { _showToast('Librería XLSX no cargada','error'); return; }
      const cuentaSel = document.getElementById('mass-rc-cuenta') as HTMLSelectElement;
      if (!cuentaSel?.value) { _showToast('Selecciona un método de pago primero','warning'); return; }
      const bankAccountId = cuentaSel.value;
      const cuentaAccId = cuentaSel.options[cuentaSel.selectedIndex]?.dataset?.account||'';
      const wb = XLSX.read(await file.arrayBuffer(), { type:'array', cellDates:true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval:'' }) as any[];
      const norm = (k:string) => String(k||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_').trim();
      const rows = raw.map(r => { const o:any={}; Object.entries(r).forEach(([k,v])=>{o[norm(k)]=v;}); return o; }).filter(r=>r.codigo_unidad||r.codigo||r.unidad);
      if (!rows.length) { _showToast('No se encontraron filas con datos','warning'); return; }
      const props = await pb.listAll('ph_properties', { filter:'active=true', expand:'owner_id', sort:'code' });
      const propByCode = new Map(props.map((p:any) => [String(p.code||'').trim().toUpperCase(), p]));
      const typeRes = await pb.listAll('transaction_types', { filter:'code="RC"' });
      const txTypeId = typeRes[0]?.id||'';
      _massRows = rows.map((r:any, i:number) => {
        const codigo = String(r.codigo_unidad||r.codigo||r.unidad||'').toUpperCase().trim();
        const raw_f  = r.fecha||r.date||'';
        const raw_v  = r.valor||r.value||r.monto||0;
        const ref    = String(r.referencia||r.reference||'').trim();
        const obs    = String(r.observaciones||r.obs||'').trim();
        let fecha = '';
        if (raw_f instanceof Date) { fecha = raw_f.toISOString().slice(0,10); }
        else { const s=String(raw_f).trim(); if(/^\d{4}-\d{2}-\d{2}$/.test(s)){fecha=s;} else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){const[d,m,y]=s.split('/');fecha=`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;} else {const d=new Date(s);if(!isNaN(d.getTime()))fecha=d.toISOString().slice(0,10);} }
        const valor = Number(String(raw_v).replace(/[^0-9.]/g,''))||0;
        const prop  = propByCode.get(codigo);
        const errs: string[] = [];
        if(!codigo) errs.push('Falta código'); else if(!prop) errs.push(`Unidad "${codigo}" no encontrada`); else if(!prop.expand?.owner_id) errs.push('Sin propietario');
        if(!fecha) errs.push('Fecha inválida');
        if(valor<=0) errs.push('Valor debe ser > 0');
        return {rowNo:i+2,codigo,fecha,valor,ref,obs,prop,txTypeId,bankAccountId,cuentaAccId,owner:prop?.expand?.owner_id||null,ok:errs.length===0,errors:errs};
      });
      document.getElementById('mass-rc-step1')?.classList.add('hidden');
      document.getElementById('mass-rc-step2')?.classList.remove('hidden');
      const ok=_massRows.filter(r=>r.ok).length; const bad=_massRows.length-ok;
      const badge=document.getElementById('mass-rc-badge');
      if(badge) badge.innerHTML=`<span style="color:${bad>0?'#B91C1C':'#166534'}">${_massRows.length} filas · ${ok} válidas${bad>0?' · '+bad+' con error':''}</span>`;
      const tbody=document.getElementById('mass-rc-tbody');
      if(tbody) tbody.innerHTML=_massRows.map(r=>`<tr style="background:${r.ok?'':'#FFF7F7'}">
        <td class="p-2 text-center text-gray-400">${r.rowNo}</td>
        <td class="p-2 font-mono font-bold text-blue-800">${_esc(r.codigo)}</td>
        <td class="p-2">${_esc(r.owner?.name||'—')}</td>
        <td class="p-2">${_esc(r.fecha||'—')}</td>
        <td class="p-2 text-right font-bold">${_fmt(r.valor)}</td>
        <td class="p-2 text-xs text-gray-500">${_esc(r.ref||'—')}</td>
        <td class="p-2 text-center">${r.ok?'<span class="badge badge-green">OK</span>':'<span class="badge badge-red">Error</span>'}</td>
        <td class="p-2 text-xs" style="color:${r.ok?'#6B7280':'#B91C1C'}">${r.ok?(r.obs||'Listo'):r.errors.join(' · ')}</td>
      </tr>`).join('');
      if(ok>0){btnNext.classList.remove('hidden');btnNext.innerHTML=`<i class="fas fa-bolt mr-1"></i>Procesar ${ok} recaudo(s)`;}
    }
    async function execute() {
      const valids=_massRows.filter(r=>r.ok); if(!valids.length) return;
      document.getElementById('mass-rc-step2')?.classList.add('hidden');
      document.getElementById('mass-rc-step3')?.classList.remove('hidden');
      btnNext.classList.add('hidden');
      const bar=document.getElementById('mass-rc-bar'); const status=document.getElementById('mass-rc-status'); const detail=document.getElementById('mass-rc-detail');
      let created=0; let failed=0; const errList:string[]=[];
      for(let i=0;i<valids.length;i++){
        const r=valids[i];
        if(bar) bar.style.width=`${Math.round((i/valids.length)*100)}%`;
        if(status) status.textContent=`Procesando ${i+1} de ${valids.length}...`;
        if(detail) detail.textContent=`Unidad ${r.codigo} — ${_fmt(r.valor)}`;
        try {
          await pb.create('transactions',{tx_type_id:r.txTypeId,number:`RC-MASIVO-${Date.now()}-${i}`,date:r.fecha,third_party_id:r.owner.id,
            description:r.obs||`Recaudo carga masiva${r.ref?' Ref: '+r.ref:''}`,status:'active',teso_mode:'auto',
            teso_params:JSON.stringify({third_party_id:r.owner.id,ph_property_id:r.prop.id,amount:r.valor,contrapartida_account_id:r.cuentaAccId,reglas:{primeroVencido:true,primeroMora:true}})});
          created++;
        } catch(err:any){ failed++; errList.push(`Unidad ${r.codigo}: ${err.message}`); }
      }
      if(bar) bar.style.width='100%'; if(status) status.textContent='Proceso completado'; if(detail) detail.textContent='';
      document.getElementById('mass-rc-spin')?.classList.add('hidden');
      document.getElementById('mass-rc-done-icon')?.classList.remove('hidden');
      const result=document.getElementById('mass-rc-result');
      if(result){result.classList.remove('hidden');result.innerHTML=`<div class="rounded-xl p-4" style="background:#F9FAFB;border:1px solid #E5E7EB">
        <div class="flex gap-6 justify-center mb-3">
          <div class="text-center"><div class="text-3xl font-bold" style="color:#059669">${created}</div><div class="text-xs text-gray-500 mt-1">Registrados</div></div>
          ${failed>0?`<div class="text-center"><div class="text-3xl font-bold" style="color:#DC2626">${failed}</div><div class="text-xs text-gray-500 mt-1">Con error</div></div>`:''}
        </div>
        ${errList.length?`<div style="background:#FFF1F2;border-radius:8px;padding:8px;font-size:11px;color:#B91C1C">${errList.map(e=>`<div>• ${_esc(e)}</div>`).join('')}</div>`:`<p class="text-center text-xs text-green-700 font-medium">✓ Todos los recaudos fueron registrados exitosamente</p>`}
      </div>`;}
      const cont=document.getElementById('teso-content'); if(cont) renderTesoListado(cont,'RC');
    }
  }, 120);
}

(window as any)._openMassRCModal     = _openMassRCModal;
(window as any)._downloadPlantillaRC = _downloadPlantillaRC;
