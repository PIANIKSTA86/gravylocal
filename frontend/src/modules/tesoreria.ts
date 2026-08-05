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

function formatInputWithSeparators(input: HTMLInputElement) {
  const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
  let cursor = input.selectionStart || 0;
  let originalLength = input.value.length;
  let raw = input.value;

  if (!raw.trim()) {
    input.value = '';
    return;
  }

  if (decPlaces === 0) {
    let cleanValue = raw.replace(/\D/g, '');
    if (!cleanValue) {
      input.value = '';
      return;
    }
    let formatted = Number(cleanValue).toLocaleString('es-CO', { maximumFractionDigits: 0 });
    input.value = formatted;
    let newLength = formatted.length;
    cursor = Math.max(0, cursor + (newLength - originalLength));
    input.setSelectionRange(cursor, cursor);
    return;
  }

  let hasComma = raw.includes(',');
  let hasDot = raw.includes('.');

  let intStr = '';
  let decStr = '';
  let isDecimalMode = false;
  let trailingSeparator = false;

  if (hasComma) {
    isDecimalMode = true;
    const parts = raw.split(',');
    intStr = parts[0].replace(/\D/g, '');
    decStr = parts.slice(1).join('').replace(/\D/g, '').slice(0, decPlaces);
    if (parts.slice(1).join('') === '' || raw.endsWith(',')) {
      trailingSeparator = true;
    }
  } else if (hasDot) {
    const lastDotIdx = raw.lastIndexOf('.');
    const afterDot = raw.slice(lastDotIdx + 1);
    const beforeDot = raw.slice(0, lastDotIdx);

    if (raw.endsWith('.')) {
      isDecimalMode = true;
      intStr = beforeDot.replace(/\D/g, '');
      decStr = '';
      trailingSeparator = true;
    } else if (afterDot.length > 0 && afterDot.length <= decPlaces && !/^\d{3}$/.test(afterDot)) {
      isDecimalMode = true;
      intStr = beforeDot.replace(/\D/g, '');
      decStr = afterDot.replace(/\D/g, '').slice(0, decPlaces);
    } else {
      intStr = raw.replace(/\D/g, '');
    }
  } else {
    intStr = raw.replace(/\D/g, '');
  }

  if (!intStr && !decStr && !trailingSeparator) {
    input.value = '';
    return;
  }

  const cleanInt = intStr ? Number(intStr).toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '0';
  let formatted = cleanInt;
  if (isDecimalMode) {
    formatted = `${cleanInt},${decStr}`;
  }

  input.value = formatted;
  let newLength = formatted.length;
  cursor = Math.max(0, cursor + (newLength - originalLength));
  input.setSelectionRange(cursor, cursor);
}

function parseFormattedNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  const s = String(val).trim();
  if (!s) return 0;

  const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;

  if (s.includes(',')) {
    const cleaned = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  if (s.includes('.')) {
    const parts = s.split('.');
    if (parts.length > 2) {
      return parseFloat(s.replace(/\./g, '')) || 0;
    } else if (parts.length === 2) {
      if (decPlaces > 0 && parts[1].length > 0 && parts[1].length <= decPlaces && parts[1].length !== 3) {
        return parseFloat(s) || 0;
      }
      return parseFloat(s.replace(/\./g, '')) || 0;
    }
  }

  return parseFloat(s.replace(/[^0-9\-]/g, '')) || 0;
}

(window as any)._handleMontoInput = (input: HTMLInputElement) => {
  formatInputWithSeparators(input);
  _updateMontoIndicator();
  if ((window as any)._applyDefaultRetenciones) {
    (window as any)._applyDefaultRetenciones();
  }
};

(window as any)._handleAbonoInput = (input: HTMLInputElement) => {
  formatInputWithSeparators(input);
  let val = parseFormattedNumber(input.value || '0');
  let max = Number(input.dataset.max) || 0;
  const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
  if (max > 0 && val > max) {
    val = max;
    input.value = val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces });
  }
  
  let total = 0;
  document.querySelectorAll('.teso-abono-input').forEach(el => {
    total += parseFormattedNumber((el as HTMLInputElement).value || '0');
  });
  const totEl = document.getElementById('teso-modal-total-abonos');
  if (totEl) totEl.textContent = _fmt(total);

  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement | null;
  const isManual = (document.getElementById('teso-modal-modo') as HTMLSelectElement | null)?.value === 'manual';

  if (isManual && montoInput) {
    montoInput.value = total > 0 ? total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces }) : '';
  }

  _updateMontoIndicator();
  if ((window as any)._applyDefaultRetenciones && (document.getElementById('teso-modal-has-retenciones') as HTMLInputElement)?.checked) {
    (window as any)._applyDefaultRetenciones();
  } else {
    _recalculateTesoNeto();
  }
};

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
  input.oninput = () => {
    const q = input.value.trim();
    if (!q) {
      hidden.value = '';
      _tesoCurrentThirdParty = null;
      _tesoCurrentOpenItems = [];
      const container = document.getElementById('teso-modal-items-container');
      if (container) {
        const isCliente = list.some(t => t.type === 'CLIENTE');
        const iconClass = isCliente ? 'fa-search-dollar' : 'fa-file-invoice-dollar';
        const labelText = isCliente
          ? 'Busca un tercero para visualizar su cartera'
          : 'Busca un proveedor para visualizar sus obligaciones';
        container.innerHTML = `
          <div class="text-center p-6">
            <div class="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <i class="fas ${iconClass} text-xl text-gray-400"></i>
            </div>
            <p class="text-xs font-medium text-gray-500">${labelText}</p>
          </div>
        `;
      }
      
      const lblRf = document.getElementById('teso-rate-rf');
      const lblIca = document.getElementById('teso-rate-ica');
      if (lblRf) lblRf.textContent = '';
      if (lblIca) lblIca.textContent = '';
      
      const rfVal = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement | null;
      const icaVal = document.getElementById('teso-modal-ret-ica') as HTMLInputElement | null;
      const descVal = document.getElementById('teso-modal-descuento') as HTMLInputElement | null;
      const brutoVal = document.getElementById('teso-modal-monto') as HTMLInputElement | null;
      const indVal = document.getElementById('teso-monto-indicator');
      if (rfVal) rfVal.value = '';
      if (icaVal) icaVal.value = '';
      if (descVal) descVal.value = '';
      if (brutoVal) brutoVal.value = '';
      if (indVal) indVal.innerHTML = '';
      _recalculateTesoNeto();
    } else {
      hidden.value = '';
    }
    render(input.value);
    results.style.display = 'block';
  };
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

  (window as any).initKeyboardAutocomplete({
    input,
    results,
    itemSelector: '[data-teso-id]',
  });
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

  (window as any).initKeyboardAutocomplete({
    input,
    results,
    itemSelector: '[data-teso-id]',
  });
}

(window as any)._changeTesoOrigen = async (origen: 'comercial' | 'ph') => {
  _tesoCurrentOrigen = origen;
  _tesoCurrentPropertyId = null;
  _tesoCurrentThirdParty = null;
  _tesoCurrentOpenItems = [];
  
  _updateThirdPartyDetailsShow(null);
  
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
      <div class="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
        <i class="fas fa-search text-lg text-gray-400"></i>
      </div>
      <p class="text-xs font-medium text-gray-500">Busca un ${origen === 'comercial' ? 'tercero' : 'inmueble'} para visualizar su cartera abierta</p>
    </div>
  `;
  
  if (origen === 'comercial') {
    if (lbl) lbl.textContent = 'Contribuyente';
    if (input) input.placeholder = 'Buscar...';
    _initTesoTerceroAutocomplete(
      'modal-rc-wrap', 'modal-rc-search', 'modal-rc-hidden', 'modal-rc-results',
      () => true,
      (t) => {
        _tesoCurrentThirdParty = t;
        _updateThirdPartyDetailsShow(t);
        _loadOpenItemsForModal(t.id, true).then(() => {
          const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
          if (total > 0) {
            const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
            if (montoEl && !montoEl.value) {
              const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
              montoEl.value = total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces });
            }
          }
          if ((window as any)._applyDefaultRetenciones) (window as any)._applyDefaultRetenciones();
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
          _updateThirdPartyDetailsShow(p.expand.owner_id);
          _loadOpenItemsForModal(p.expand.owner_id.id, true, p.id).then(() => {
            const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
            if (total > 0) {
              const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
              if (montoEl && !montoEl.value) {
                const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
                montoEl.value = total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces });
              }
            }
            if ((window as any)._applyDefaultRetenciones) (window as any)._applyDefaultRetenciones();
          });
        } else {
          _showToast('Esta unidad no tiene un propietario asignado', 'warning');
        }
      }
    );
  }
};

// ─── VISTAS DE LISTADO (RECAUDOS Y PAGOS) ──────────────────────────────────
// ─── VISTAS DE LISTADO (RECAUDOS Y PAGOS) ──────────────────────────────────
async function renderTesoListado(c: HTMLElement, tipo: 'RC' | 'CE') {
  c.innerHTML = `<div class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando transacciones...</div>`;
  try {
    const pb = _pb();
    
    // Calcular límites de fecha del mes actual en hora local
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const startOfMonthStr = `${y}-${m}-01`;
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    const endOfMonthStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

    const isRecaudo = tipo === 'RC';
    const title = isRecaudo ? 'Recibos de Caja (Recaudos)' : 'Comprobantes de Egreso (Pagos)';
    const btnText = isRecaudo ? 'Nuevo Recibo' : 'Nuevo Egreso';
    const btnAction = isRecaudo ? 'openRecaudoModal()' : 'openPagoModal()';

    // Función auxiliar para calcular montos totales por transacción desde tx_lines
    const fetchTxAmountsMap = async (txItems: any[]) => {
      const txTotalMap = new Map<string, number>();
      if (!txItems.length) return txTotalMap;

      const txIds = txItems.map(i => i.id);
      const chunkSize = 40;
      for (let i = 0; i < txIds.length; i += chunkSize) {
        const chunk = txIds.slice(i, i + chunkSize);
        const filterStr = chunk.map(id => `tx_id="${id}"`).join(' || ');
        try {
          const lines = await pb.listAll('tx_lines', { filter: filterStr, expand: 'account_id' });
          for (const l of lines) {
            const accCode = l.expand?.account_id?.code || '';
            const is11 = accCode.startsWith('11');
            const prev = txTotalMap.get(l.tx_id) || 0;
            if (is11) {
              txTotalMap.set(l.tx_id, prev + (isRecaudo ? Number(l.debit || 0) : Number(l.credit || 0)));
            }
          }
          for (const l of lines) {
            if (!txTotalMap.has(l.tx_id)) {
              const prev = txTotalMap.get(l.tx_id) || 0;
              txTotalMap.set(l.tx_id, prev + (isRecaudo ? Number(l.debit || 0) : Number(l.credit || 0)));
            }
          }
        } catch (_) {}
      }
      return txTotalMap;
    };

    // Obtener todas las transacciones del período actual (todas las que correspondan a RC% o CE%/CG%/EF% o prefijo)
    const filterQuery = isRecaudo 
      ? `(tx_type_id.code="RC" || tx_type_id.code ~ "RC%" || tx_type_id.prefix ~ "RC%" || number ~ "RC%") && status="active" && date >= "${startOfMonthStr}" && date <= "${endOfMonthStr} 23:59:59"`
      : `(tx_type_id.code="CE" || tx_type_id.code ~ "CE%" || tx_type_id.prefix ~ "CE%" || tx_type_id.prefix ~ "CG%" || tx_type_id.prefix ~ "EF%" || number ~ "CE%" || number ~ "CG%" || number ~ "EF%") && status="active" && date >= "${startOfMonthStr}" && date <= "${endOfMonthStr} 23:59:59"`;

    const items = await pb.listAll('transactions', {
      filter: filterQuery,
      sort: '-date',
      expand: 'third_party_id,tx_type_id'
    });

    const txAmountsMap = await fetchTxAmountsMap(items);

    const renderTableRows = (txList: any[], amountsMap: Map<string, number>) => {
      if (txList.length === 0) {
        return `<tr><td colspan="8" class="text-center p-6 text-gray-500">No hay registros en este período.</td></tr>`;
      }
      return txList.map((i: any) => {
        const typeObj = i.expand?.tx_type_id;
        const typeLabel = typeObj ? `${typeObj.name} (${typeObj.prefix || typeObj.code})` : tipo;
        const amount = amountsMap.get(i.id) || 0;

        return `
          <tr class="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-50 last:border-none" 
              data-q="${_esc(i.number)} ${_esc(typeLabel)} ${_esc(i.expand?.third_party_id?.name || '')}" 
              data-date="${_esc(i.date)}" 
              data-id="${_esc(i.id)}">
            <td class="p-3 font-mono font-bold text-blue-800">${_esc(i.number)}</td>
            <td class="p-3 text-xs text-gray-500 font-medium">${_esc(typeLabel)}</td>
            <td class="p-3 text-gray-600 text-sm whitespace-nowrap">${_esc(i.date).slice(0, 10)}</td>
            <td class="p-3 font-medium text-gray-800">${_esc(i.expand?.third_party_id?.name || 'N/A')}</td>
            <td class="p-3 font-mono font-bold text-right text-gray-900">${amount > 0 ? _fmt(amount) : '—'}</td>
            <td class="p-3 text-gray-500 text-sm max-w-xs truncate" title="${_esc(i.description)}">${_esc(i.description || '—')}</td>
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
        `;
      }).join('');
    };

    c.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-gray-800">${title}</h3>
          <p class="text-sm text-gray-500">Historial de ${isRecaudo ? 'recaudos aplicados' : 'pagos emitidos'} en el período seleccionado.</p>
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
          <input id="teso-filter-q" class="form-input w-full pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all text-sm" placeholder="Buscar por número, tipo o tercero...">
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <div class="relative flex-1 md:w-40">
            <input id="teso-filter-from" type="date" class="form-input w-full bg-white text-sm rounded-lg border-gray-200" title="Fecha Desde" value="${startOfMonthStr}">
          </div>
          <span class="text-gray-400 text-xs"><i class="fas fa-arrow-right"></i></span>
          <div class="relative flex-1 md:w-40">
            <input id="teso-filter-to" type="date" class="form-input w-full bg-white text-sm rounded-lg border-gray-200" title="Fecha Hasta" value="${endOfMonthStr}">
          </div>
        </div>
      </div>

      <div class="overflow-x-auto border border-gray-200 rounded-xl">
        <table class="data-table w-full" id="teso-tx-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-left">Número</th>
              <th class="p-3 text-left">Tipo</th>
              <th class="p-3 text-left">Fecha</th>
              <th class="p-3 text-left">Tercero</th>
              <th class="p-3 text-right">Valor / Monto</th>
              <th class="p-3 text-left">Descripción</th>
              <th class="p-3 text-center">Estado</th>
              <th class="p-3 text-center" style="width:90px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableRows(items, txAmountsMap)}
          </tbody>
        </table>
      </div>
    `;

    // Recargar transacciones desde el servidor cuando cambian los filtros de fecha
    const reloadTesoListadoFromServer = async () => {
      const fromInput = document.getElementById('teso-filter-from') as HTMLInputElement | null;
      const toInput = document.getElementById('teso-filter-to') as HTMLInputElement | null;
      const fromVal = fromInput?.value || startOfMonthStr;
      const toVal = toInput?.value || endOfMonthStr;

      const tbody = document.querySelector('#teso-tx-table tbody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-gray-400"><i class="fas fa-spinner fa-spin mr-1 text-sm"></i> Filtrando registros...</td></tr>`;
      }

      try {
        const filteredFilter = isRecaudo 
          ? `(tx_type_id.code="RC" || tx_type_id.code ~ "RC%" || tx_type_id.prefix ~ "RC%" || number ~ "RC%") && status="active" && date >= "${fromVal}" && date <= "${toVal} 23:59:59"`
          : `(tx_type_id.code="CE" || tx_type_id.code ~ "CE%" || tx_type_id.prefix ~ "CE%" || tx_type_id.prefix ~ "CG%" || tx_type_id.prefix ~ "EF%" || number ~ "CE%" || number ~ "CG%" || number ~ "EF%") && status="active" && date >= "${fromVal}" && date <= "${toVal} 23:59:59"`;

        const filteredItems = await pb.listAll('transactions', {
          filter: filteredFilter,
          sort: '-date',
          expand: 'third_party_id,tx_type_id'
        });

        const filteredAmountsMap = await fetchTxAmountsMap(filteredItems);

        if (tbody) {
          tbody.innerHTML = renderTableRows(filteredItems, filteredAmountsMap);

          // Re-vincular eventos click
          tbody.querySelectorAll('.teso-btn-ver').forEach(btn => {
            btn.addEventListener('click', async () => {
              const b = btn as HTMLElement;
              await _tesoVerDetalle(b.dataset.txId || '', b.dataset.txTipo || 'RC');
            });
          });
          tbody.querySelectorAll('.teso-btn-print').forEach(btn => {
            btn.addEventListener('click', async () => {
              const b = btn as HTMLElement;
              await _tesoVerDetalle(b.dataset.txId || '', b.dataset.txTipo || 'RC', true);
            });
          });
        }
      } catch (err: any) {
        _showToast(`Error al recargar listado: ${err.message}`, 'error');
      }
    };

    const filterTableClient = () => {
      const q = ((document.getElementById('teso-filter-q') as HTMLInputElement).value || '').toLowerCase();
      document.querySelectorAll('#teso-tx-table tbody tr[data-q]').forEach(tr => {
        const el = tr as HTMLElement;
        const text = el.dataset.q?.toLowerCase() || '';
        el.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    };

    document.getElementById('teso-filter-q')?.addEventListener('input', filterTableClient);
    document.getElementById('teso-filter-from')?.addEventListener('change', reloadTesoListadoFromServer);
    document.getElementById('teso-filter-to')?.addEventListener('change', reloadTesoListadoFromServer);

    // Vincular eventos iniciales
    c.querySelectorAll('.teso-btn-ver').forEach(btn => {
      btn.addEventListener('click', async () => {
        const b = btn as HTMLElement;
        await _tesoVerDetalle(b.dataset.txId || '', b.dataset.txTipo || 'RC');
      });
    });
    c.querySelectorAll('.teso-btn-print').forEach(btn => {
      btn.addEventListener('click', async () => {
        const b = btn as HTMLElement;
        await _tesoVerDetalle(b.dataset.txId || '', b.dataset.txTipo || 'RC', true);
      });
    });

    const tbl = document.getElementById('teso-tx-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

  } catch (err: any) {
    c.innerHTML = `<div class="p-4 text-red-600">Error: ${err.message}</div>`;
  }
}

// ─── VER DETALLE / IMPRIMIR DESDE LISTADO ──────────────────────────────────
async function _tesoVerDetalle(txId: string, tipo: string, autoprint = false) {
  const pb = _pb();
  try {
    const tx    = await pb.get('transactions', txId, { expand: 'third_party_id,tx_type_id,user_id' });
    const lines = await pb.listAll('tx_lines', { filter: `tx_id="${txId}"`, expand: 'account_id' });

    const isRC       = tipo === 'RC';
    const tipoLabel  = isRC ? 'RECIBO DE CAJA' : 'COMPROBANTE DE EGRESO';
    const acColor    = isRC ? '#1D6F42' : '#B91C1C';
    const acBg       = isRC ? '#F0FDF4' : '#FFF1F2';
    const montoTotal = lines.reduce((s: number, l: any) =>
      s + (isRC ? Number(l.debit || 0) : Number(l.credit || 0)), 0);

    const tObj = tx.expand?.third_party_id || {};
    const uObj = tx.expand?.user_id || {};

    // 1. Generar HTML para el asiento contable dentro del modal
    const tableRows = lines.map((l: any) => `
      <tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:8px;font-family:monospace;font-size:11px">
          <div style="font-weight:700;color:#374151">${_esc(l.expand?.account_id?.code || '')}</div>
          <div style="color:#9CA3AF;font-size:10px">${_esc(l.expand?.account_id?.name || '')}</div>
        </td>
        <td style="padding:8px;text-align:right;font-weight:500;color:#374151">${l.debit > 0 ? _fmt(l.debit) : '—'}</td>
        <td style="padding:8px;text-align:right;font-weight:500;color:#374151">${l.credit > 0 ? _fmt(l.credit) : '—'}</td>
      </tr>
    `).join('');

    // 2. Construir la interfaz del modal (Dashboard de la transacción)
    const htmlModal = `
      <div style="font-family:'Segoe UI',sans-serif;color:#1F2937">
        <!-- Encabezado con datos clave -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="padding:12px;background:#F9FAFB;border-radius:12px;border:1px solid #F3F4F6">
            <p style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700;margin-bottom:4px;letter-spacing:0.5px">Tercero / Beneficiario</p>
            <p style="font-weight:700;font-size:14px;color:#111;margin:0">${_esc(tObj.name || '—')}</p>
            <p style="font-size:12px;color:#6B7280;margin:2px 0 0">NIT/CC: ${_esc(tObj.doc_number || '—')}</p>
          </div>
          <div style="padding:12px;background:#F9FAFB;border-radius:12px;border:1px solid #F3F4F6;text-align:right">
            <p style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700;margin-bottom:4px;letter-spacing:0.5px">Fecha y Número</p>
            <p style="font-weight:700;font-size:14px;color:#111;margin:0">${_esc(tx.number || '—')}</p>
            <p style="font-size:12px;color:#6B7280;margin:2px 0 0">${String(tx.date || '').slice(0, 10)}</p>
          </div>
        </div>

        <!-- Valor Destacado -->
        <div style="background:${acBg};border:1px solid ${acColor}33;border-radius:12px;padding:16px;text-align:center;margin-bottom:16px">
          <p style="font-size:11px;text-transform:uppercase;color:${acColor};font-weight:800;margin-bottom:4px;letter-spacing:1px">Monto Total</p>
          <p style="font-size:32px;font-weight:900;color:${acColor};margin:0">${_fmt(montoTotal)}</p>
          <p style="font-size:11px;color:${acColor};font-style:italic;margin-top:4px">${_numLetras(montoTotal)}</p>
        </div>

        ${tx.description ? `
        <div style="margin-bottom:16px">
          <p style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700;margin-bottom:6px">Observaciones</p>
          <div style="padding:10px;background:#FFF;border:1px solid #F3F4F6;border-radius:8px;font-size:12px;color:#4B5563;line-height:1.5">${_esc(tx.description)}</div>
        </div>` : ''}

        <!-- Tabla Contable -->
        <p style="font-size:10px;text-transform:uppercase;color:#9CA3AF;font-weight:700;margin-bottom:8px">Asiento Contable</p>
        <div style="border:1px solid #F3F4F6;border-radius:10px;overflow:hidden;background:#FFF">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead style="background:#F9FAFB">
              <tr>
                <th style="padding:8px;text-align:left;color:#6B7280;font-weight:600">Cuenta</th>
                <th style="padding:8px;text-align:right;color:#6B7280;font-weight:600">Débito</th>
                <th style="padding:8px;text-align:right;color:#6B7280;font-weight:600">Crédito</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>

        <!-- Auditoría -->
        <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;padding:10px;background:#F9FAFB;border-radius:8px;font-size:11px;color:#9CA3AF">
          <span><i class="fas fa-user-edit mr-1"></i>Registrado por: <strong>${_esc(uObj.name || uObj.username || 'Sistema')}</strong></span>
          <span><i class="fas fa-clock mr-1"></i>${new Date(tx.created).toLocaleString('es-CO')}</span>
        </div>
      </div>`;

    // 3. Preparar el HTML Carta para impresión (en segundo plano)
    const dataPrint = {
      tipo: tipoLabel,
      numero: tx.number || '',
      fecha: String(tx.date || '').slice(0, 10),
      tercero: tObj.name || '',
      terceroObj: tObj,
      monto: montoTotal,
      cuenta: '',
      referencia: '',
      observaciones: tx.description || '',
      partidas: []
    };
    const htmlCarta = await _buildReciboHTML(dataPrint, lines);

    (window as any).openModal(
      `${tipoLabel} — ${tx.number}`,
      htmlModal,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-primary" id="btn-print-detalle"><i class="fas fa-print mr-2"></i>Imprimir Carta</button>`,
      false
    );

    setTimeout(() => {
      document.getElementById('btn-print-detalle')?.addEventListener('click', () => {
        const w = window.open('', '_blank', 'width=920,height=760');
        if (w) { w.document.write(htmlCarta); w.document.close(); }
      });
      if (autoprint) {
        const w = window.open('', '_blank', 'width=920,height=760');
        if (w) { w.document.write(htmlCarta); w.document.close(); }
      }
    }, 150);

  } catch(err: any) {
    _showToast('Error al cargar el detalle: ' + err.message, 'error');
  }
}



// ─── MODALES TRANSACCIONALES ────────────────────────────────────────────────
let _tesoCurrentOpenItems: any[] = [];
let _tesoCurrentThirdParty: ThirdParty | null = null;

interface TesoMixedRow {
  id: string;
  bankAccountId: string;
  metodo: string;
  referencia: string;
  monto: number;
}

let _tesoIsPagoMixto: boolean = false;
let _tesoMixedRows: TesoMixedRow[] = [];
let _tesoAvailableMetodosPago: any[] = [];

(window as any)._toggleTesoPagoMixtoMode = () => {
  const select = document.getElementById('teso-modal-pago-modo') as HTMLSelectElement | null;
  const isMixto = select?.value === 'mixto';
  _tesoIsPagoMixto = isMixto;

  const singleGroup = document.getElementById('teso-single-cuenta-group');
  const mixedContainer = document.getElementById('teso-mixed-cuentas-container');

  if (isMixto) {
    if (singleGroup) singleGroup.classList.add('hidden');
    if (mixedContainer) mixedContainer.classList.remove('hidden');

    if (_tesoMixedRows.length === 0) {
      const firstBank = _tesoAvailableMetodosPago[0]?.id || '';
      const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
      const rfInput = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement;
      const icaInput = document.getElementById('teso-modal-ret-ica') as HTMLInputElement;
      const descInput = document.getElementById('teso-modal-descuento') as HTMLInputElement;

      const monto = parseFormattedNumber(montoInput?.value || '0');
      const rf = parseFormattedNumber(rfInput?.value || '0');
      const ica = parseFormattedNumber(icaInput?.value || '0');
      const desc = parseFormattedNumber(descInput?.value || '0');
      const neto = Math.max(0, monto - rf - ica - desc);

      _tesoMixedRows = [{
        id: 'row_' + Date.now() + '_1',
        bankAccountId: firstBank,
        metodo: 'Transferencia',
        referencia: (document.getElementById('teso-modal-referencia') as HTMLInputElement)?.value || '',
        monto: neto
      }];
    }
    (window as any)._renderTesoMixedRows();
  } else {
    if (singleGroup) singleGroup.classList.remove('hidden');
    if (mixedContainer) mixedContainer.classList.add('hidden');
  }
};

(window as any)._renderTesoMixedRows = () => {
  const tbody = document.getElementById('teso-mixed-rows-tbody');
  if (!tbody) return;

  if (_tesoMixedRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-3 text-center text-xs text-gray-400 italic">No hay medios de pago agregados. Haz clic en "+ Agregar Medio".</td></tr>`;
    _updateMixedPaymentsBalance();
    return;
  }

  tbody.innerHTML = _tesoMixedRows.map((row) => {
    const bankOpts = _tesoAvailableMetodosPago.map((c: any) =>
      `<option value="${c.id}" ${c.id === row.bankAccountId ? 'selected' : ''}>${_esc(c.name)} (${_esc(c.bank)})</option>`
    ).join('');

    const metodos = ['Transferencia', 'Efectivo', 'Consignación', 'Tarjeta Débito', 'Tarjeta Crédito', 'Cheque', 'Otro'];
    const metodoOpts = metodos.map(m =>
      `<option value="${m}" ${m === row.metodo ? 'selected' : ''}>${m}</option>`
    ).join('');

    return `
      <tr class="border-b border-gray-100 bg-white hover:bg-gray-50/80">
        <td class="py-1.5 pr-2">
          <select class="form-input py-1 text-xs bg-gray-50 focus:bg-white" onchange="window._updateTesoMixedRowField('${row.id}', 'bankAccountId', this.value)">
            <option value="">— Seleccionar Cuenta/Banco —</option>
            ${bankOpts}
          </select>
        </td>
        <td class="py-1.5 pr-2">
          <select class="form-input py-1 text-xs bg-gray-50 focus:bg-white" onchange="window._updateTesoMixedRowField('${row.id}', 'metodo', this.value)">
            ${metodoOpts}
          </select>
        </td>
        <td class="py-1.5 pr-2">
          <input type="text" class="form-input py-1 text-xs bg-gray-50 focus:bg-white" placeholder="Ej: Transf #1234" value="${_esc(row.referencia)}" oninput="window._updateTesoMixedRowField('${row.id}', 'referencia', this.value)">
        </td>
        <td class="py-1.5 pr-2">
          <input type="text" class="form-input py-1 text-xs text-right font-bold text-blue-800 bg-gray-50 focus:bg-white" placeholder="0" value="${row.monto > 0 ? row.monto.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2 }) : ''}" oninput="window._handleTesoMixedMontoInput(this, '${row.id}')">
        </td>
        <td class="py-1.5 text-center">
          <button type="button" class="text-red-500 hover:text-red-700 p-1 transition-colors" title="Eliminar fila" onclick="window._removeTesoMixedRow('${row.id}')">
            <i class="fas fa-trash-alt text-xs"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  _updateMixedPaymentsBalance();
};

(window as any)._addTesoMixedRow = () => {
  const firstBank = _tesoAvailableMetodosPago[0]?.id || '';
  _tesoMixedRows.push({
    id: 'row_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    bankAccountId: firstBank,
    metodo: 'Transferencia',
    referencia: '',
    monto: 0
  });
  (window as any)._renderTesoMixedRows();
};

(window as any)._removeTesoMixedRow = (id: string) => {
  _tesoMixedRows = _tesoMixedRows.filter(r => r.id !== id);
  (window as any)._renderTesoMixedRows();
};

(window as any)._updateTesoMixedRowField = (id: string, field: string, val: any) => {
  const row = _tesoMixedRows.find(r => r.id === id);
  if (row) {
    (row as any)[field] = val;
  }
};

(window as any)._handleTesoMixedMontoInput = (input: HTMLInputElement, id: string) => {
  formatInputWithSeparators(input);
  const val = parseFormattedNumber(input.value || '0');
  const row = _tesoMixedRows.find(r => r.id === id);
  if (row) {
    row.monto = val;
  }
  _updateMixedPaymentsBalance();
};

(window as any)._autoFillTesoMixedRow = () => {
  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const rfInput = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement;
  const icaInput = document.getElementById('teso-modal-ret-ica') as HTMLInputElement;
  const descInput = document.getElementById('teso-modal-descuento') as HTMLInputElement;

  const monto = parseFormattedNumber(montoInput?.value || '0');
  const rf = parseFormattedNumber(rfInput?.value || '0');
  const ica = parseFormattedNumber(icaInput?.value || '0');
  const desc = parseFormattedNumber(descInput?.value || '0');
  const neto = Math.max(0, monto - rf - ica - desc);

  const currentSum = _tesoMixedRows.reduce((s, r) => s + r.monto, 0);
  const diff = neto - currentSum;

  if (diff <= 0) {
    _showToast('No hay saldo restante por desglosar.', 'info');
    return;
  }

  const emptyRow = _tesoMixedRows.find(r => r.monto === 0);
  if (emptyRow) {
    emptyRow.monto = diff;
  } else {
    const firstBank = _tesoAvailableMetodosPago[0]?.id || '';
    _tesoMixedRows.push({
      id: 'row_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      bankAccountId: firstBank,
      metodo: 'Transferencia',
      referencia: '',
      monto: diff
    });
  }
  (window as any)._renderTesoMixedRows();
};

function _updateMixedPaymentsBalance() {
  const bar = document.getElementById('teso-mixed-balance-bar');
  if (!bar) return;

  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const rfInput = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement;
  const icaInput = document.getElementById('teso-modal-ret-ica') as HTMLInputElement;
  const descInput = document.getElementById('teso-modal-descuento') as HTMLInputElement;

  const monto = parseFormattedNumber(montoInput?.value || '0');
  const rf = parseFormattedNumber(rfInput?.value || '0');
  const ica = parseFormattedNumber(icaInput?.value || '0');
  const desc = parseFormattedNumber(descInput?.value || '0');
  const neto = Math.max(0, monto - rf - ica - desc);

  const sumMixed = _tesoMixedRows.reduce((s, r) => s + (Number(r.monto) || 0), 0);
  const diff = sumMixed - neto;
  const absDiff = Math.abs(diff);

  let statusBadge = '';
  if (neto <= 0) {
    statusBadge = `<span class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"><i class="fas fa-info-circle"></i> Ingrese un valor total neto</span>`;
  } else if (absDiff < 1) {
    statusBadge = `<span class="inline-flex items-center gap-1 text-xs font-bold text-green-800 bg-green-100 px-2.5 py-1 rounded-full border border-green-200"><i class="fas fa-check-circle text-green-600"></i> Desglose Totalmente Cuadrado</span>`;
  } else if (diff < 0) {
    statusBadge = `<span class="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200"><i class="fas fa-exclamation-triangle text-amber-600"></i> Falta desglosar ${_fmt(absDiff)}</span>`;
  } else {
    statusBadge = `<span class="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-full border border-red-200"><i class="fas fa-exclamation-triangle text-red-600"></i> Exceso desglosado ${_fmt(absDiff)}</span>`;
  }

  bar.innerHTML = `
    <div class="flex items-center gap-4">
      <div><span class="text-gray-500">Total Neto:</span> <strong class="text-gray-900">${_fmt(neto)}</strong></div>
      <div><span class="text-gray-500">Total Medios:</span> <strong class="text-blue-700">${_fmt(sumMixed)}</strong></div>
    </div>
    <div>${statusBadge}</div>
  `;
}

async function _loadOpenItemsForModal(thirdPartyId: string, isRecaudo: boolean, propertyId?: string) {
  const c = document.getElementById('teso-modal-items-container');
  if (!c) return;
  c.innerHTML = '<div class="p-4 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando partidas abiertas...</div>';
  
  try {
    const pb = _pb();
    const cruzarAnticipos = (document.getElementById('teso-modal-cruzar-anticipos') as HTMLInputElement)?.checked ?? false;
    
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
       if (cruzarAnticipos) allowedRefs.add(anticipoRef);
       if (allowedRefs.size <= (cruzarAnticipos ? 1 : 0)) { 
         const hasAnticipo = allowedRefs.has(anticipoRef);
         if (!hasAnticipo) {
           c.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El inmueble no presenta saldos pendientes.</div>`;
           return;
         }
       }
    } else {
       // Modo Comercial: Buscar facturas comerciales para permitir su cruce
       try {
         const commInvoices = await pb.listAll('invoices', { filter: `customer_id="${thirdPartyId}" && status="posted"` });
         commInvoices.forEach((inv: any) => allowedRefs.add(inv.number));
       } catch(_) {}
       
       // Bloquear facturas de PH para evitar cruces cruzados entre módulos
       const phInvoices = await pb.listAll('ph_invoices', { filter: `property_id.owner_id="${thirdPartyId}" && status!="voided"` });
       phInvoices.forEach((inv: any) => blockedRefs.add(inv.number));
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

      const code = (l.expand?.account_id?.code || '').trim();
      let esCuentaCruce = false;
      let esCuentaAnticipo = false;

      if (isRecaudo) {
        // En RC: Cruce en Cuentas 13 (excl. 1330), Anticipo en Cuenta 28 o ANT-
        esCuentaCruce = code.startsWith('13') && !code.startsWith('1330');
        esCuentaAnticipo = code.startsWith('28') || ref === anticipoRef || (anticipoAccountId && l.account_id === anticipoAccountId);
      } else {
        // En CE: Cruce en Cuentas 22, 23, 25, Anticipo en Cuenta 1330 o ANT-
        esCuentaCruce = code.startsWith('22') || code.startsWith('23') || code.startsWith('25');
        esCuentaAnticipo = code.startsWith('1330') || ref === anticipoRef || (anticipoAccountId && l.account_id === anticipoAccountId);
      }

      if (!cruzarAnticipos && esCuentaAnticipo) continue;

      if (!esCuentaCruce && !esCuentaAnticipo && !l.expand?.account_id?.maneja_cruce) continue;
      
      const possibleBase = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
      
      if (propertyId) {
          const isAllowed = allowedRefs.has(ref) || allowedRefs.has(possibleBase);
          if (!isAllowed) continue;
      } else {
          const isBlocked = blockedRefs.has(ref) || blockedRefs.has(possibleBase);
          if (isBlocked && !esCuentaAnticipo) continue;
      }
      
      const key = `${ref}|${l.account_id}`;
      if (!docs.has(key)) {
        docs.set(key, {
          key,
          ref,
          accountId: l.account_id,
          accountName: l.expand?.account_id?.name || '',
          accountCode: code,
          firstDate: l.expand?.tx_id?.date || '',
          description: l.description || '',
          isAnticipo: esCuentaAnticipo,
          debit: 0,
          credit: 0
        });
      }
      const d = docs.get(key);
      d.debit += Number(l.debit || 0);
      d.credit += Number(l.credit || 0);
    }

    const allDocs = [...docs.values()].map(d => {
      const isAnticipo = d.isAnticipo;
      let netOpen = 0;
      let saldo = 0;
      if (isAnticipo) {
        netOpen = isRecaudo ? (d.credit - d.debit) : (d.debit - d.credit);
        saldo = Math.max(0, netOpen);
      } else {
        netOpen = isRecaudo ? (d.debit - d.credit) : (d.credit - d.debit);
        saldo = netOpen;
      }
      return { ...d, saldo, netOpen, isAnticipo };
    });

    const anticipoItems = cruzarAnticipos ? allDocs.filter(d => d.isAnticipo && d.saldo > 0.01) : [];

    _tesoCurrentOpenItems = allDocs
      .filter(d => !d.isAnticipo && Math.abs(d.saldo) > 0.01)
      .sort((a, b) => a.firstDate.localeCompare(b.firstDate));

    const totalAnticipo = anticipoItems.reduce((s, i) => s + i.saldo, 0);
    const totalCartera = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);

    if (_tesoCurrentOpenItems.length === 0 && totalAnticipo <= 0.01) {
      c.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El tercero no presenta saldos pendientes para esta operación.</div>`;
      return;
    }

    // Banner de saldo a favor (anticipo)
    const cuentaAnticiposLbl = isRecaudo ? 'Cuenta 28 - Pasivo Clientes' : 'Cuenta 1330 - Activo Proveedores';
    const anticipoItemsHtml = anticipoItems.map(i => `
      <div class="flex justify-between items-center text-xs py-1 border-t border-green-200/60 mt-1">
        <span><i class="fas fa-receipt text-green-600 mr-1.5"></i><strong>${_esc(i.ref)}</strong> <span class="text-green-700 font-medium">(${_esc(i.accountCode || (isRecaudo ? '28' : '1330'))} — ${_esc(i.accountName || 'Anticipos')})</span></span>
        <span class="font-bold text-green-800">${_fmt(i.saldo)}</span>
      </div>
    `).join('');

    const anticipoBanner = totalAnticipo > 0.01 ? `
      <div class="p-3.5 rounded-xl mb-3 shadow-xs" style="background:#ECFDF5;border:1.5px solid #6EE7B7">
        <div class="flex items-center gap-3">
          <div class="bg-green-600 text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 shadow-sm">
            <i class="fas fa-piggy-bank text-sm"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-green-900 text-sm">Saldo a Favor Disponible en Anticipos (${cuentaAnticiposLbl})</p>
            <p class="text-xs text-green-700">Se detectaron <strong>${anticipoItems.length}</strong> registro(s) de anticipo que suman <strong>${_fmt(totalAnticipo)}</strong> los cuales se aplicarán automáticamente a la cartera.</p>
          </div>
          <div class="font-bold text-green-800 text-xl">${_fmt(totalAnticipo)}</div>
        </div>
        <div class="mt-2 pt-1">
          <div class="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-1">Desglose de Anticipos Causados:</div>
          ${anticipoItemsHtml}
        </div>
      </div>
    ` : '';

    const noCartera = _tesoCurrentOpenItems.length === 0 ? `
      <div class="p-3 text-center text-gray-500 text-sm">
        <i class="fas fa-check-circle text-green-500 mr-2"></i>Cartera al día. El pago se registrará como anticipo.
      </div>
    ` : '';

    const isRecaudoCtx = isRecaudo;
    c.innerHTML = `
      ${anticipoBanner}
      ${noCartera}
      ${_tesoCurrentOpenItems.length > 0 ? `
      <div class="rounded-xl border border-gray-200 overflow-hidden shadow-xs" style="max-height:280px;display:flex;flex-direction:column;background:#fff;">
        <table class="w-full text-xs" style="border-collapse:collapse;table-layout:fixed;">
          <colgroup>
            <col style="width:38%">
            <col style="width:27%">
            <col style="width:17.5%">
            <col style="width:17.5%">
          </colgroup>
          <thead style="position:sticky;top:0;z-index:2;background:#F8FAFC;">
            <tr style="border-bottom:2px solid #E2E8F0;">
              <th style="padding:6px 10px;text-align:left;font-size:10.5px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.04em;">Documento / Fecha</th>
              <th style="padding:6px 10px;text-align:left;font-size:10.5px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.04em;">Cuenta Contable</th>
              <th style="padding:6px 10px;text-align:right;font-size:10.5px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.04em;">Saldo Pendiente</th>
              <th style="padding:6px 10px;text-align:right;font-size:10.5px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.04em;">Abono ($)</th>
            </tr>
          </thead>
        </table>
        <div style="overflow-y:auto;flex:1;">
        <table class="w-full text-xs" style="border-collapse:collapse;table-layout:fixed;">
          <colgroup>
            <col style="width:38%">
            <col style="width:27%">
            <col style="width:17.5%">
            <col style="width:17.5%">
          </colgroup>
          <tbody>
            ${_tesoCurrentOpenItems.map(i => `
              <tr style="border-bottom:1px solid #F1F5F9;" onmouseover="this.style.background='#F0F9FF'" onmouseout="this.style.background=''">
                <td style="padding:5px 10px;vertical-align:middle;">
                  <div style="display:flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden;">
                    <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                      <i class="fas fa-file-invoice text-blue-600" style="font-size:13px;"></i>
                      <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13.5px;font-weight:900;background:#EFF6FF;color:#1E3A8A;padding:2px 8px;border-radius:5px;border:1.5px solid #93C5FD;letter-spacing:-0.02em;">${_esc(i.ref)}</span>
                    </div>
                    <span style="font-size:11px;font-weight:600;color:#64748B;flex-shrink:0;display:inline-flex;align-items:center;gap:3px;">
                      <i class="far fa-calendar-alt text-gray-400" style="font-size:10px;"></i>${_esc(i.firstDate.slice(0,10))}
                    </span>
                    ${_tesoCurrentOrigen === 'ph' && i.description ? `<span style="font-size:11px;font-weight:700;color:#1E3A8A;overflow:hidden;text-overflow:ellipsis;" title="${_esc(i.description)}">· ${_esc(i.description)}</span>` : ''}
                  </div>
                </td>
                <td style="padding:5px 10px;vertical-align:middle;">
                  <div style="font-size:11px;font-weight:600;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px;" title="${_esc(i.accountCode)} - ${_esc(i.accountName)}">
                    <span style="font-family:monospace;font-size:11px;color:#64748B;font-weight:800;flex-shrink:0;">${_esc(i.accountCode || '')}</span>
                    <span style="color:#1E293B;font-weight:600;overflow:hidden;text-overflow:ellipsis;">${_esc(i.accountName)}</span>
                  </div>
                </td>
                <td style="padding:5px 10px;text-align:right;vertical-align:middle;white-space:nowrap;">
                  <span style="font-size:12.5px;font-weight:900;color:${i.saldo < 0 ? '#D97706' : (isRecaudoCtx ? '#DC2626' : '#2563EB')};">${_fmt(i.saldo)}</span>
                </td>
                <td style="padding:4px 8px;text-align:right;vertical-align:middle;">
                  <input type="text" class="teso-abono-input"
                    style="width:100%;text-align:right;font-size:12px;font-weight:800;border:1.5px solid #CBD5E1;border-radius:5px;padding:2px 6px;background:#FFFFFF;color:#0F172A;box-shadow:0 1px 2px rgba(0,0,0,0.03);"
                    data-key="${i.key}" data-ref="${i.ref}" data-account="${i.accountId}" data-max="${i.saldo}"
                    placeholder="0" disabled oninput="window._handleAbonoInput(this)">
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot style="background:#F8FAFC;border-top:2px solid #E2E8F0;">
            <tr>
              <td colspan="2" style="padding:6px 10px;text-align:right;font-weight:800;font-size:11px;color:#334155;">
                TOTAL CARTERA PENDIENTE:
              </td>
              <td style="padding:6px 10px;text-align:right;font-weight:900;font-size:12.5px;color:${totalCartera < 0 ? '#D97706' : '#DC2626'};">
                ${_fmt(totalCartera)}
              </td>
              <td style="padding:6px 10px;text-align:right;font-weight:900;font-size:12.5px;color:#1E40AF;" id="teso-modal-total-abonos">$0</td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
      ` : ''}
    `;
  } catch (err: any) {
    c.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200"><i class="fas fa-exclamation-triangle mr-2"></i> Error: ${err.message}</div>`;
  }
}

function _toggleModalManualMode() {
  const isManual = (document.getElementById('teso-modal-modo') as HTMLSelectElement).value === 'manual';
  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement | null;
  const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;

  document.querySelectorAll('.teso-abono-input').forEach(el => {
    const inp = el as HTMLInputElement;
    inp.disabled = !isManual;
    if (!isManual) inp.value = '';
  });

  let total = 0;
  if (isManual) {
    document.querySelectorAll('.teso-abono-input').forEach(el => {
      total += parseFormattedNumber((el as HTMLInputElement).value || '0');
    });
  }

  const totEl = document.getElementById('teso-modal-total-abonos');
  if (totEl) totEl.textContent = _fmt(total);

  if (isManual && montoInput) {
    montoInput.value = total > 0 ? total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces }) : '';
  }

  _updateMontoIndicator();
  if ((window as any)._applyDefaultRetenciones && (document.getElementById('teso-modal-has-retenciones') as HTMLInputElement)?.checked) {
    (window as any)._applyDefaultRetenciones();
  } else {
    _recalculateTesoNeto();
  }
}

// ─── INDICADOR DE DIFERENCIA (Opción 1) ────────────────────────────────────
function _updateMontoIndicator() {
  const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const indicatorEl = document.getElementById('teso-monto-indicator');
  if (!montoEl || !indicatorEl) return;

  const monto = parseFormattedNumber(montoEl.value || '0');

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

  const txTypeSelect = document.getElementById('teso-modal-tx-type') as HTMLSelectElement;
  const docNumInput   = document.getElementById('teso-modal-doc-number') as HTMLInputElement;
  const dateInput     = document.getElementById('teso-modal-date') as HTMLInputElement;
  const branchSelect  = document.getElementById('teso-modal-branch') as HTMLSelectElement;
  const costCenterSelect = document.getElementById('teso-modal-cost-center') as HTMLSelectElement;

  const monto = parseFormattedNumber(montoInput?.value || '0');
  const modo  = modoSelect?.value || 'auto';
  const bankAccountId = ctaSelect?.value || '';
  const cuentaOpt = ctaSelect?.options[ctaSelect.selectedIndex];
  const cuentaId  = cuentaOpt?.dataset?.account || '';
  const referencia = refInput?.value?.trim() || '';
  const observaciones = obsInput?.value?.trim() || '';

  const selectedTxTypeId = txTypeSelect?.value || '';
  let docNumber = docNumInput?.value?.trim() || 'AUTO';
  
  // If the docNumber matches the next consecutive of the selected tx type, treat it as AUTO
  const selectedTxType = _tesoCurrentTxTypes.find(t => t.id === selectedTxTypeId);
  if (selectedTxType) {
    const prefix = (selectedTxType.prefix || selectedTxType.code || 'TX').trim().toUpperCase();
    const next = (Number(selectedTxType.consecutive) || 0) + 1;
    const nextNum = `${prefix}-${String(next).padStart(8, '0')}`;
    if (docNumber === 'AUTO' || docNumber === nextNum || docNumber.startsWith('AUTO (')) {
      docNumber = 'AUTO';
    }
  }
  const fecha = dateInput?.value || (window as any).todayStr();
  let branchId = branchSelect?.value || '';
  if (!branchId) {
    const pb = _pb();
    const userModel = pb?.authStore?.model || pb?.currentUser || (window as any).API?.currentUser;
    const userDefaultBranchId = userModel?.default_branch_id || userModel?.branch_id || '';
    const activeBranchId = (window as any).CURRENT_BRANCH_ID || localStorage.getItem('active_branch_id') || 'TODAS';
    branchId = userDefaultBranchId || ((activeBranchId !== 'TODAS' && activeBranchId) ? activeBranchId : '');
  }
  const costCenterId = costCenterSelect?.value || '';

  // ── Validación reforzada ──────────────────────────────────────
  if (!_tesoCurrentThirdParty) {
    _showToast('Debes seleccionar un tercero o unidad', 'warning'); return;
  }
  if (!_tesoIsPagoMixto && (!cuentaId || !bankAccountId)) {
    _showToast('Debes seleccionar un método de pago válido', 'warning'); return;
  }
  if (!selectedTxTypeId) {
    _showToast('Debes seleccionar un tipo de comprobante', 'warning'); return;
  }

  let distribucion: any[] = [];
  if (modo === 'manual') {
    let sum = 0;
    document.querySelectorAll('.teso-abono-input').forEach(el => {
      const inp = el as HTMLInputElement;
      const v = parseFormattedNumber(inp.value || '0');
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
      _showToast('El monto debe ser mayor a $0 para poder registrar la transacción', 'warning');
      montoInput?.focus();
      return;
    }
    const totalCartera = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
    if (totalCartera <= 0 && monto > 0) {
      const ok = window.confirm(`Este tercero no tiene cartera abierta.\nSe registrará un anticipo de ${_fmt(monto)} a su favor.\n\n¿Continuar?`);
      if (!ok) return;
    }
  }

  const btn = document.getElementById('btn-save-teso-tx') as HTMLButtonElement;
  const btnOriginalText = btn?.innerHTML || '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...'; }

  const typeCode = isRecaudo ? 'RC' : 'CE';
  try {
    const pb = _pb();

    // Procesar retenciones y descuentos si está habilitado
    const hasRetenciones = (document.getElementById('teso-modal-has-retenciones') as HTMLInputElement)?.checked || false;
    let retFuenteAmt = 0;
    let retIcaAmt = 0;
    let descuentoAmt = 0;

    let retFuenteAccId = '';
    let retIcaAccId = '';
    let descuentoAccId = '';

    if (hasRetenciones) {
      retFuenteAmt = parseFormattedNumber((document.getElementById('teso-modal-ret-fuente') as HTMLInputElement)?.value || '0');
      retIcaAmt = parseFormattedNumber((document.getElementById('teso-modal-ret-ica') as HTMLInputElement)?.value || '0');
      descuentoAmt = parseFormattedNumber((document.getElementById('teso-modal-descuento') as HTMLInputElement)?.value || '0');

      if (isRecaudo) {
        // Cuentas de Activo (1355)
        const rfRes = await pb.listAll('accounts', { filter: 'code ~ "135515%" || code = "135515"', limit: 1 });
        if (rfRes.length) retFuenteAccId = rfRes[0].id;

        const icaRes = await pb.listAll('accounts', { filter: 'code ~ "135518%" || code = "135518"', limit: 1 });
        if (icaRes.length) retIcaAccId = icaRes[0].id;

        const descRes = await pb.listAll('accounts', { filter: 'code ~ "5305%" || code = "5305"', limit: 1 });
        if (descRes.length) descuentoAccId = descRes[0].id;
      } else {
        // Cuentas de Pasivo (2365 / 2368) y Gasto/Ingreso (4210)
        const rfRes = await pb.listAll('accounts', { filter: 'code ~ "2365%" || code = "2365"', limit: 1 });
        if (rfRes.length) retFuenteAccId = rfRes[0].id;

        const icaRes = await pb.listAll('accounts', { filter: 'code ~ "2368%" || code = "2368"', limit: 1 });
        if (icaRes.length) retIcaAccId = icaRes[0].id;

        const descRes = await pb.listAll('accounts', { filter: 'code ~ "4210%" || code = "4210"', limit: 1 });
        if (descRes.length) descuentoAccId = descRes[0].id;
      }

      if (retFuenteAmt > 0 && !retFuenteAccId) {
        _showToast('No se encontró la cuenta contable para Retención en la Fuente (135515/2365)', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
        return;
      }
      if (retIcaAmt > 0 && !retIcaAccId) {
        _showToast('No se encontró la cuenta contable para Retención ICA (135518/2368)', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
        return;
      }
      if (descuentoAmt > 0 && !descuentoAccId) {
        _showToast('No se encontró la cuenta contable para Descuentos (5305/4210)', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
        return;
      }
    }

    // Procesar Ajuste al Peso si está activo
    const hasAjustePeso = (document.getElementById('teso-modal-has-ajuste-peso') as HTMLInputElement)?.checked || false;
    let ajustePesoAmt = 0;
    let ajustePesoType = 'faltante';
    let ajustePesoAccId = '';

    if (hasAjustePeso) {
      ajustePesoAmt = parseFormattedNumber((document.getElementById('teso-modal-ajuste-monto') as HTMLInputElement)?.value || '0');
      ajustePesoType = (document.getElementById('teso-modal-ajuste-tipo') as HTMLSelectElement)?.value || 'faltante';
      ajustePesoAccId = (document.getElementById('teso-modal-ajuste-cuenta') as HTMLSelectElement)?.value || '';

      if (ajustePesoAmt > 0 && !ajustePesoAccId) {
        _showToast('Debes seleccionar la cuenta contable para el Ajuste al Peso', 'warning');
        if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
        return;
      }
    }

    const totalAbono = modo === 'manual' ? distribucion.reduce((a, b) => a + b.monto, 0) : monto;
    let netoTransado = totalAbono - retFuenteAmt - retIcaAmt - descuentoAmt;
    if (hasAjustePeso && ajustePesoAmt > 0) {
      if (isRecaudo) {
        netoTransado = ajustePesoType === 'faltante' ? (netoTransado - ajustePesoAmt) : (netoTransado + ajustePesoAmt);
      } else {
        netoTransado = ajustePesoType === 'sobrante' ? (netoTransado - ajustePesoAmt) : (netoTransado + ajustePesoAmt);
      }
    }

    if (netoTransado < 0) {
      _showToast('Las retenciones, descuentos y ajustes no pueden superar el monto total', 'warning');
      if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
      return;
    }

    const cruzarAnticipos = (document.getElementById('teso-modal-cruzar-anticipos') as HTMLInputElement)?.checked ?? false;

    const params: any = {
      third_party_id: _tesoCurrentThirdParty.id,
      amount: netoTransado,
      contrapartida_account_id: cuentaId,
      cost_center_id: costCenterId || null,
      cruzar_anticipos: cruzarAnticipos,
      ret_fuente_amount: retFuenteAmt,
      ret_fuente_account_id: retFuenteAccId || null,
      ret_ica_amount: retIcaAmt,
      ret_ica_account_id: retIcaAccId || null,
      descuento_amount: descuentoAmt,
      descuento_account_id: descuentoAccId || null,
      ajuste_peso_amount: ajustePesoAmt,
      ajuste_peso_type: ajustePesoType,
      ajuste_peso_account_id: ajustePesoAccId || null
    };

    if (_tesoIsPagoMixto) {
      if (_tesoMixedRows.length === 0) {
        _showToast('Debes agregar al menos un medio de pago en el desglose mixto', 'warning');
        if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
        return;
      }
      let sumMixed = 0;
      const mediosFormatted: any[] = [];
      for (let i = 0; i < _tesoMixedRows.length; i++) {
        const r = _tesoMixedRows[i];
        if (!r.bankAccountId) {
          _showToast(`Seleccione la cuenta/banco para la fila ${i + 1} de medios de pago`, 'warning');
          if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
          return;
        }
        if (r.monto <= 0) {
          _showToast(`El monto de la fila ${i + 1} debe ser mayor a $0`, 'warning');
          if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
          return;
        }
        const accObj = _tesoAvailableMetodosPago.find(m => m.id === r.bankAccountId);
        const accId = accObj?.account_id || accObj?.expand?.account_id?.id || '';
        if (!accId) {
          _showToast(`No se encontró la cuenta contable para el banco de la fila ${i + 1}`, 'error');
          if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
          return;
        }
        sumMixed += r.monto;
        mediosFormatted.push({
          bank_account_id: r.bankAccountId,
          account_id: accId,
          monto: r.monto,
          referencia: r.referencia?.trim() || '',
          metodo: r.metodo || 'Transferencia'
        });
      }

      if (Math.abs(sumMixed - netoTransado) >= 1) {
        _showToast(`La suma de los medios de pago (${_fmt(sumMixed)}) no coincide con el total neto (${_fmt(netoTransado)}).`, 'warning');
        if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalText; }
        return;
      }

      params.is_pago_mixto = true;
      params.medios_pago = mediosFormatted;
      params.contrapartida_account_id = mediosFormatted[0].account_id;
    }

    if (_tesoCurrentOrigen === 'ph' && _tesoCurrentPropertyId) {
      params.ph_property_id = _tesoCurrentPropertyId;
    }
    if (modo === 'manual') {
      params.distribucion = distribucion;
    } else {
      if (_tesoCurrentOpenItems.length > 0) {
        let saldoRestante = totalAbono;
        const autoDist: any[] = [];
        for (const item of _tesoCurrentOpenItems) {
          if (saldoRestante <= 0) break;
          if (item.saldo <= 0) continue;
          const valorAbono = Math.min(saldoRestante, item.saldo);
          autoDist.push({ 
            key: item.key, 
            cross_doc_ref: item.ref, 
            account_id: item.accountId, 
            monto: valorAbono 
          });
          saldoRestante -= valorAbono;
        }
        params.distribucion = autoDist;
      }

      const sets = await pb.listAll('settings', { filter: `key="treasury_rules"` });
      let rules: any = { primeroVencido: true, primeroMora: true };
      if (sets.length && sets[0].value) { try { rules = JSON.parse(sets[0].value); } catch(_) {} }
      params.reglas = rules;
    }

    const txNum      = `${typeCode}-${Date.now()}`;
    const terceroNombre = _tesoCurrentThirdParty.name || _tesoCurrentThirdParty.doc_number || '';
    const cuentaNombre  = cuentaOpt?.text || '';

    const txRecord = await pb.create('transactions', {
      tx_type_id:    selectedTxTypeId,
      number:        docNumber || 'AUTO',
      date:          fecha,
      third_party_id: _tesoCurrentThirdParty.id,
      description:   observaciones || `${isRecaudo ? 'Recaudo' : 'Pago'} vía Módulo Tesorería${referencia ? ' Ref: ' + referencia : ''}`,
      status:        'active',
      teso_mode:     modo,
      branch_id:     branchId || null,
      teso_params:   JSON.stringify(params)
    });

    // Guardar interacción de recaudo en el historial del CRM si cruza facturas de un trato
    if (isRecaudo && params.distribucion && params.distribucion.length > 0) {
      for (const dist of params.distribucion) {
        if (dist.cross_doc_ref) {
          try {
            const invs = await pb.listAll('invoices', { filter: `number="${dist.cross_doc_ref}"` });
            if (invs.length > 0) {
              const invoiceId = invs[0].id;
              const deals = await pb.listAll('crm_deals', { filter: `invoice_id="${invoiceId}"` });
              for (const deal of deals) {
                await pb.create('crm_interactions', {
                  deal_id: deal.id,
                  user_id: pb.currentUser?.id || null,
                  type: 'WHATSAPP',
                  request_details: `Recaudo registrado para la factura ${dist.cross_doc_ref}`,
                  response_details: `Monto recaudado: ${(window as any).fmt(dist.monto)}. Ref: ${referencia || 'N/A'}.`,
                  response_at: fecha
                });
              }
            }
          } catch (crmErr) {
            console.error("Error al registrar interacción de recaudo en CRM:", crmErr);
          }
        }
      }
    }
    // Esperar al hook y obtener líneas contables para el recibo completo
    await new Promise(r => setTimeout(r, 800));
    let txRecordFull = txRecord;
    try { txRecordFull = await pb.get('transactions', txRecord.id); } catch(_) {}
    let txLines: any[] = [];
    try { txLines = await pb.listAll('tx_lines', { filter: `tx_id="${txRecord.id}"`, expand: 'account_id' }); } catch(_) {}

    _closeModal();

    // ── Recibo Imprimible (Opción 2) ──────────────────────────────────────
    _showReciboPrint({
      tipo:        isRecaudo ? 'RECIBO DE CAJA' : 'COMPROBANTE DE EGRESO',
      numero:      txRecordFull.number || txNum,
      fecha,
      tercero:     terceroNombre,
      monto:       totalAbono,
      cuenta:      _tesoIsPagoMixto ? 'Pago Mixto' : cuentaNombre,
      referencia,
      observaciones,
      partidas:    _tesoCurrentOpenItems.slice(),
      modo,
      lineas:      txLines,
      isPagoMixto: _tesoIsPagoMixto,
      mediosPago:  _tesoIsPagoMixto ? _tesoMixedRows.map(r => {
        const accObj = _tesoAvailableMetodosPago.find(m => m.id === r.bankAccountId);
        return {
          cuentaNombre: accObj?.name || 'Caja/Banco',
          metodo: r.metodo,
          referencia: r.referencia,
          monto: r.monto
        };
      }) : null
    });

    const cont = document.getElementById('recaudos-listado-content') || document.getElementById('egresos-listado-content') || document.getElementById('teso-content');
    if (cont) {
      renderTesoListado(cont, typeCode as any);
    }

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
  let totalPendiente = 0;
  try {
    if (tObj.id) {
      const lines = await pb.listAll('tx_lines', {
        filter: `third_party_id="${tObj.id}" && tx_id.status="active"`,
        expand: 'account_id'
      });
      for (const l of lines) {
        const acc = l.expand?.account_id;
        if (!acc || !acc.maneja_cruce) continue;
        const code = acc.code || '';
        if (isRC && code.startsWith('13')) {
          totalPendiente += (l.debit || 0) - (l.credit || 0);
        } else if (!isRC && (code.startsWith('21') || code.startsWith('22') || code.startsWith('23'))) {
          totalPendiente += (l.credit || 0) - (l.debit || 0);
        }
      }
    }
  } catch (err) {
    console.error("Error al calcular saldo de cartera en impresión:", err);
  }
  const tNombre = tObj.name || data.tercero || '';
  const tDoc    = tObj.doc_number || '';
  const tEmail  = tObj.email || '';
  const tPhone  = tObj.phone || '';
  const tDir    = tObj.address || '';
  const enLetras = _numLetras(Number(data.monto||0));

  const aplicados = lineasContables.filter(l => l.cross_doc_ref);
  
  const filaP = aplicados.length > 0 
    ? aplicados.map(l => {
        let label = _esc(l.cross_doc_ref);
        let desc = 'Abono/Pago a documento';
        
        const isRF = l.description === 'Retención en la Fuente' || (l.expand?.account_id?.code && (l.expand.account_id.code.startsWith('135515') || l.expand.account_id.code.startsWith('2365')));
        const isICA = l.description === 'Retención ICA' || (l.expand?.account_id?.code && (l.expand.account_id.code.startsWith('135518') || l.expand.account_id.code.startsWith('2368')));
        const isDesc = l.description === 'Descuento' || (l.expand?.account_id?.code && (l.expand.account_id.code.startsWith('5305') || l.expand.account_id.code.startsWith('4210')));
        
        if (isRF) {
          label = 'Retención en la Fuente';
          desc = 'Deducción tributaria aplicada';
        } else if (isICA) {
          label = 'Retención ICA';
          desc = 'Deducción tributaria de industria y comercio';
        } else if (isDesc) {
          label = 'Descuento Comercial';
          desc = 'Descuento/Ajuste aplicado';
        } else if (l.cross_doc_ref.startsWith('ANT-')) {
          label = 'Anticipo / Saldo a favor';
          desc = 'Aplicación de saldo a favor o excedente';
        }
        
        const valor = Math.max(Number(l.debit || 0), Number(l.credit || 0));
        
        return `
        <tr style="border-bottom:1px solid #E5E7EB">
          <td style="padding:5px 10px;font-size:12px">
            <strong>${label}</strong> 
            <span style="color:#6B7280;font-size:11px"> — ${desc}</span>
          </td>
          <td style="padding:5px 10px;font-size:12px;text-align:right">
            ${_fmt(valor)}
          </td>
        </tr>`;
      }).join('')
    : `<tr style="border-bottom:1px solid #E5E7EB">
        <td style="padding:5px 10px;font-size:12px;color:#6B7280;font-style:italic">
          Monto total registrado (anticipo o concepto sin cruce de factura)
        </td>
        <td style="padding:5px 10px;font-size:12px;text-align:right">${_fmt(data.monto)}</td>
      </tr>`;

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
          ${data.mediosPago && data.mediosPago.length > 0 ? `
            <tr>
              <td style="color:#6B7280;padding:3px 0;vertical-align:top">Forma de pago:</td>
              <td style="text-align:right;font-size:11px">
                <strong style="color:${acColor}">Pago Mixto</strong>
                <div style="margin-top:2px">
                  ${data.mediosPago.map((m: any) => `
                    <div style="font-size:10px;color:#374151;padding:1px 0">
                      ${_esc(m.metodo || 'Medio')}: <strong>${_fmt(m.monto)}</strong>
                      ${m.cuentaNombre ? `<span style="color:#6B7280"> (${_esc(m.cuentaNombre)})</span>` : ''}
                      ${m.referencia ? `<br><span style="font-size:9px;color:#6B7280">Ref: ${_esc(m.referencia)}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              </td>
            </tr>
          ` : `
            <tr><td style="color:#6B7280;padding:3px 0">Metodo ${isRC?'recaudo':'pago'}:</td><td style="text-align:right;font-size:11px">${_esc(data.cuenta||'')}</td></tr>
            ${data.referencia?`<tr><td style="color:#6B7280;padding:3px 0">Referencia:</td><td style="font-weight:700;text-align:right">${_esc(data.referencia)}</td></tr>`:''}
          `}
        </table>
      </td>
    </tr>
  </table>

  <div style="background:${acBg};border:1.5px solid ${acLight};border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:${acColor}">VALOR ${isRC?'RECIBIDO':'PAGADO'}</div>
      <div style="font-size:28px;font-weight:900;color:${acColor}">${_fmt(data.monto||0)}</div>
      <div style="font-size:10px;color:#374151;margin-top:2px;font-style:italic">${enLetras}</div>
    </div>
    <div style="text-align:right;border-left:1px dashed ${acLight};padding-left:20px;min-width:160px">
      <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:#6B7280">SALDO PENDIENTE CARTERA</div>
      <div style="font-size:18px;font-weight:800;color:#374151;margin-top:4px">${totalPendiente <= 0.01 ? '$0' : _fmt(totalPendiente)}</div>
      <div style="font-size:9px;color:#9CA3AF;margin-top:2px;font-style:italic">Cx${isRC?'C':'P'} neto posterior</div>
    </div>
  </div>

  <div style="margin-bottom:12px">
    <div style="font-size:9px;text-transform:uppercase;font-weight:700;color:#374151;margin-bottom:4px">DETALLE DE APLICACION</div>
    <table style="border:1px solid #E5E7EB">
      <thead><tr style="background:#F3F4F6">
        <th style="padding:5px 10px;text-align:left;font-size:11px">Documento / Concepto</th>
        <th style="padding:5px 10px;text-align:right;font-size:11px">Valor Aplicado</th>
      </tr></thead>
      <tbody>${filaP}</tbody>
    </table>
  </div>

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

  let totalPendiente = 0;
  const tObj = data.terceroObj || {};
  try {
    if (tObj.id) {
      const pb = _pb();
      const lines = await pb.listAll('tx_lines', {
        filter: `third_party_id="${tObj.id}" && tx_id.status="active"`,
        expand: 'account_id'
      });
      for (const l of lines) {
        const acc = l.expand?.account_id;
        if (!acc || !acc.maneja_cruce) continue;
        const code = acc.code || '';
        if (isRC && code.startsWith('13')) {
          totalPendiente += (l.debit || 0) - (l.credit || 0);
        } else if (!isRC && (code.startsWith('21') || code.startsWith('22') || code.startsWith('23'))) {
          totalPendiente += (l.credit || 0) - (l.debit || 0);
        }
      }
    }
  } catch (err) {
    console.error("Error al calcular saldo en preview:", err);
  }

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
      <div style="background:#F3F4F6;padding:10px 14px;border-radius:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600;color:#4B5563;font-size:12px">Saldo pendiente en cartera:</span>
        <span style="font-weight:700;color:#111827;font-size:13px;text-align:right;flex:1">${totalPendiente <= 0.01 ? '$0' : _fmt(totalPendiente)}</span>
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

let _tesoCurrentTxTypes: any[] = [];

function _updateTesoDocNumberPlaceholder() {
  const select = document.getElementById('teso-modal-tx-type') as HTMLSelectElement | null;
  const input = document.getElementById('teso-modal-doc-number') as HTMLInputElement | null;
  if (!select || !input) return;
  const selectedId = select.value;
  const txType = _tesoCurrentTxTypes.find(t => t.id === selectedId);
  if (txType) {
    const prefix = (txType.prefix || txType.code || 'TX').trim().toUpperCase();
    const next = (Number(txType.consecutive) || 0) + 1;
    const nextNum = `${prefix}-${String(next).padStart(8, '0')}`;
    const curVal = input.value.trim();
    const wasAuto = !curVal || curVal === 'AUTO' || curVal.startsWith('AUTO (') || _tesoCurrentTxTypes.some(t => {
      const p = (t.prefix || t.code || 'TX').trim().toUpperCase();
      const n = (Number(t.consecutive) || 0) + 1;
      return curVal === `${p}-${String(n).padStart(8, '0')}`;
    });
    if (wasAuto) {
      input.value = nextNum;
    }
  }
}

function _toggleTesoRetenciones() {
  const chk = document.getElementById('teso-modal-has-retenciones') as HTMLInputElement | null;
  const fields = document.querySelectorAll('.teso-ret-field');
  const rfInput = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement;
  const icaInput = document.getElementById('teso-modal-ret-ica') as HTMLInputElement;
  const descInput = document.getElementById('teso-modal-descuento') as HTMLInputElement;

  if (chk?.checked) {
    fields.forEach(el => {
      el.classList.remove('opacity-40', 'pointer-events-none');
    });
    if (rfInput) { rfInput.removeAttribute('disabled'); rfInput.classList.replace('bg-gray-50', 'bg-white'); }
    if (icaInput) { icaInput.removeAttribute('disabled'); icaInput.classList.replace('bg-gray-50', 'bg-white'); }
    if (descInput) { descInput.removeAttribute('disabled'); descInput.classList.replace('bg-gray-50', 'bg-white'); }
    _applyDefaultRetenciones();
  } else {
    fields.forEach(el => {
      el.classList.add('opacity-40', 'pointer-events-none');
    });
    if (rfInput) { rfInput.setAttribute('disabled', 'true'); rfInput.value = ''; rfInput.classList.replace('bg-white', 'bg-gray-50'); }
    if (icaInput) { icaInput.setAttribute('disabled', 'true'); icaInput.value = ''; icaInput.classList.replace('bg-white', 'bg-gray-50'); }
    if (descInput) { descInput.setAttribute('disabled', 'true'); descInput.value = ''; descInput.classList.replace('bg-white', 'bg-gray-50'); }
    _recalculateTesoNeto();
  }
}

(window as any)._toggleTesoCruzarAnticipos = () => {
  if (_tesoCurrentThirdParty) {
    const isRecaudo = !!document.getElementById('modal-rc-wrap');
    _loadOpenItemsForModal(_tesoCurrentThirdParty.id, isRecaudo, _tesoCurrentPropertyId || undefined);
  }
};

function _updateThirdPartyDetailsShow(t: any) {
  const nombreShow = document.getElementById('teso-modal-nombre-show') as HTMLInputElement | null;
  const dirShow = document.getElementById('teso-modal-dir-show') as HTMLInputElement | null;
  const telShow = document.getElementById('teso-modal-tel-show') as HTMLInputElement | null;
  
  if (t) {
    if (nombreShow) nombreShow.value = t.name || '';
    if (dirShow) dirShow.value = t.address || '—';
    if (telShow) telShow.value = t.phone || '—';
  } else {
    if (nombreShow) nombreShow.value = '';
    if (dirShow) dirShow.value = '';
    if (telShow) telShow.value = '';
  }
}

function _applyDefaultRetenciones() {
  const chk = document.getElementById('teso-modal-has-retenciones') as HTMLInputElement | null;
  if (!chk || !_tesoCurrentThirdParty) return;

  const rfRate = parseFloat((_tesoCurrentThirdParty as any).prf || 0);
  const icaRate = parseFloat((_tesoCurrentThirdParty as any).pi || 0);

  const lblRfRate = document.getElementById('teso-rate-rf');
  const lblIcaRate = document.getElementById('teso-rate-ica');

  // Always update rate labels to show percentages, regardless of monto
  if (lblRfRate) lblRfRate.textContent = rfRate > 0 ? `(${rfRate}%)` : '';
  if (lblIcaRate) lblIcaRate.textContent = icaRate > 0 ? `(${icaRate}%)` : '';

  if (!chk.checked) return; // Labels shown but values only calculated when enabled

  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const monto = parseFormattedNumber(montoInput?.value || '0');
  if (monto <= 0) return;

  const rfInput = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement;
  const icaInput = document.getElementById('teso-modal-ret-ica') as HTMLInputElement;

  const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
  const factor = Math.pow(10, decPlaces);
  if (rfInput) {
    if (rfRate > 0) {
      const calculatedRF = Math.round((monto * (rfRate / 100) + Number.EPSILON) * factor) / factor;
      rfInput.value = calculatedRF.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces });
    } else {
      rfInput.value = '';
    }
  }
  if (icaInput) {
    if (icaRate > 0) {
      const calculatedICA = Math.round((monto * (icaRate / 100) + Number.EPSILON) * factor) / factor;
      icaInput.value = calculatedICA.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces });
    } else {
      icaInput.value = '';
    }
  }

  // Recalculate net value after applying retention defaults
  _recalculateTesoNeto();
}

let _tesoAjustePesoAccountsMap: { sobrante: string; faltante: string } = { sobrante: '', faltante: '' };
let _tesoAllAccountsForAjuste: any[] = [];

(window as any)._toggleTesoAjustePeso = () => {
  const chk = document.getElementById('teso-modal-has-ajuste-peso') as HTMLInputElement | null;
  const container = document.getElementById('teso-ajuste-peso-container');
  if (!container) return;
  if (chk?.checked) {
    container.classList.remove('hidden');
    (window as any)._updateAjustePesoAccountOptions();
  } else {
    container.classList.add('hidden');
    const montoInput = document.getElementById('teso-modal-ajuste-monto') as HTMLInputElement | null;
    if (montoInput) montoInput.value = '';
  }
  _recalculateTesoNeto();
};

(window as any)._updateAjustePesoAccountOptions = () => {
  const tipoSelect = document.getElementById('teso-modal-ajuste-tipo') as HTMLSelectElement | null;
  const cuentaSelect = document.getElementById('teso-modal-ajuste-cuenta') as HTMLSelectElement | null;
  if (!tipoSelect || !cuentaSelect) return;

  const tipo = tipoSelect.value;
  const defaultAccId = tipo === 'sobrante' 
    ? _tesoAjustePesoAccountsMap.sobrante 
    : _tesoAjustePesoAccountsMap.faltante;

  if (cuentaSelect.options.length <= 1 && _tesoAllAccountsForAjuste.length > 0) {
    cuentaSelect.innerHTML = '<option value="">— Seleccionar Cuenta PUC —</option>' +
      _tesoAllAccountsForAjuste.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('');
  }
  if (defaultAccId) {
    cuentaSelect.value = defaultAccId;
  }
};

(window as any)._handleAjustePesoInput = (input: HTMLInputElement) => {
  formatInputWithSeparators(input);
  _recalculateTesoNeto();
};

(window as any)._autoAjustarPeso = () => {
  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const ajusteMontoInput = document.getElementById('teso-modal-ajuste-monto') as HTMLInputElement;
  const ajusteTipoSelect = document.getElementById('teso-modal-ajuste-tipo') as HTMLSelectElement;

  if (!montoInput || !ajusteMontoInput || !ajusteTipoSelect) return;

  const totalCartera = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
  const montoBruto = parseFormattedNumber(montoInput.value || '0');

  if (totalCartera <= 0 || montoBruto <= 0) {
    _showToast('Debes ingresar el valor bruto y contar con saldos pendientes para calcular el ajuste al peso.', 'info');
    return;
  }

  const diff = montoBruto - totalCartera;
  const absDiff = Math.abs(diff);

  if (absDiff < 0.001) {
    _showToast('El monto ingresado coincide exactamente con el valor de la cartera.', 'info');
    return;
  }

  if (diff < 0) {
    ajusteTipoSelect.value = 'faltante';
  } else {
    ajusteTipoSelect.value = 'sobrante';
  }

  const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
  ajusteMontoInput.value = absDiff.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces });
  
  (window as any)._updateAjustePesoAccountOptions();
  _recalculateTesoNeto();
  _showToast(`Ajuste al peso calculado: ${ajusteTipoSelect.value === 'sobrante' ? 'Sobrante' : 'Faltante'} de ${_fmt(absDiff)}`, 'success');
};

function _recalculateTesoNeto() {
  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const rfInput = document.getElementById('teso-modal-ret-fuente') as HTMLInputElement;
  const icaInput = document.getElementById('teso-modal-ret-ica') as HTMLInputElement;
  const descInput = document.getElementById('teso-modal-descuento') as HTMLInputElement;
  
  const hasAjustePeso = (document.getElementById('teso-modal-has-ajuste-peso') as HTMLInputElement)?.checked || false;
  const ajusteTipoSelect = document.getElementById('teso-modal-ajuste-tipo') as HTMLSelectElement;
  const ajusteMontoInput = document.getElementById('teso-modal-ajuste-monto') as HTMLInputElement;

  const netEl = document.getElementById('teso-modal-neto-valor');

  const monto = parseFormattedNumber(montoInput?.value || '0');
  const rf = parseFormattedNumber(rfInput?.value || '0');
  const ica = parseFormattedNumber(icaInput?.value || '0');
  const desc = parseFormattedNumber(descInput?.value || '0');

  let ajusteAmt = 0;
  let ajusteTipo = 'faltante';
  if (hasAjustePeso && ajusteMontoInput) {
    ajusteAmt = parseFormattedNumber(ajusteMontoInput.value || '0');
    ajusteTipo = ajusteTipoSelect?.value || 'faltante';
  }

  const docNumEl = document.getElementById('teso-modal-doc-number');
  const isRecaudo = docNumEl?.classList.contains('text-blue-700') || (document.getElementById('modal-rc-wrap') !== null);

  let net = monto - rf - ica - desc;

  if (hasAjustePeso && ajusteAmt > 0) {
    if (isRecaudo) {
      net = ajusteTipo === 'faltante' ? (net - ajusteAmt) : (net + ajusteAmt);
    } else {
      net = ajusteTipo === 'sobrante' ? (net - ajusteAmt) : (net + ajusteAmt);
    }
  }

  if (netEl) {
    netEl.textContent = _fmt(net >= 0 ? net : 0);
  }
  if (_tesoIsPagoMixto) {
    _updateMixedPaymentsBalance();
  }
}

function _handleRetInput(input: HTMLInputElement) {
  formatInputWithSeparators(input);
  _recalculateTesoNeto();
}

async function openRecaudoModal() {
  _tesoCurrentOpenItems = [];
  _tesoCurrentThirdParty = null;
  
  const pb = _pb();
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }

  const [metodosPago, branches, costCenters, txTypes, settingsReq, accountsReq] = await Promise.all([
    pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' }),
    pb.listAll('branches', { filter: 'active=true', sort: 'name' }),
    pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' }),
    pb.listAll('transaction_types', { filter: 'code="RC" || code ~ "RC%"', sort: 'name' }),
    pb.listAll('settings', { filter: 'key="treasury_rules"' }),
    pb.listAll('accounts', { filter: 'level>=3', sort: 'code' })
  ]);

  _tesoAvailableMetodosPago = metodosPago;
  _tesoIsPagoMixto = false;
  _tesoMixedRows = [];
  _tesoAllAccountsForAjuste = accountsReq || [];

  let allowManualDocNumber = false;
  if (settingsReq.length > 0 && settingsReq[0].value) {
    try {
      const parsed = JSON.parse(settingsReq[0].value);
      allowManualDocNumber = !!parsed.allowManualDocNumber;
      _tesoAjustePesoAccountsMap = {
        sobrante: parsed.ajuste_peso_sobrante_account_id || '',
        faltante: parsed.ajuste_peso_faltante_account_id || ''
      };
    } catch (_) {}
  }

  _tesoCurrentTxTypes = txTypes;

  const userModel = pb?.authStore?.model || pb?.currentUser || (window as any).API?.currentUser;
  const userDefaultBranchId = userModel?.default_branch_id || userModel?.branch_id || '';
  const activeBranchId = (window as any).CURRENT_BRANCH_ID || localStorage.getItem('active_branch_id') || 'TODAS';

  const defaultBranchId = (userDefaultBranchId && branches.some((b: any) => b.id === userDefaultBranchId))
    ? userDefaultBranchId
    : ((activeBranchId !== 'TODAS' && activeBranchId && branches.some((b: any) => b.id === activeBranchId))
        ? activeBranchId
        : (branches[0]?.id || ''));

  const branchOptions = branches.map((b: any) =>
    `<option value="${b.id}" ${b.id === defaultBranchId ? 'selected' : ''}>${_esc(b.code ? b.code + ' - ' + b.name : b.name)}</option>`
  ).join('');
  const ccOptions = costCenters.map((c: any) => `<option value="${c.id}">${_esc(c.code)} — ${_esc(c.name)}</option>`).join('');
  const txTypeOptions = txTypes.map((t: any) => `<option value="${t.id}">${_esc(t.prefix || t.code)} — ${_esc(t.name)}</option>`).join('');

  const bodyHtml = `
    <div class="flex flex-col h-full gap-4 text-gray-800" style="font-family:'Segoe UI',sans-serif;">
      <!-- SECCIÓN: INFORMACIÓN GENERAL -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        
        <!-- Cabecera de Sección con No. de Recibo integrado -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 class="text-sm font-bold text-gray-700">Información General</h3>
          <div class="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 shadow-sm">
            <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider">No. de Recibo:</span>
            <input id="teso-modal-doc-number" type="text"
              class="w-64 text-center font-mono text-xs font-bold rounded px-2 py-0.5 focus:ring-1 focus:ring-blue-400 focus:outline-none ${allowManualDocNumber ? 'text-blue-700 bg-white border border-blue-200' : 'text-gray-500 bg-gray-100 border border-gray-300 cursor-not-allowed'}"
              value=""
              ${allowManualDocNumber ? '' : 'disabled'}
              onblur="if(!this.value.trim()) window._updateTesoDocNumberPlaceholder()">
          </div>
        </div>
        
        <!-- Fila 1: Tipo de Comprobante, Fecha, Sucursal, Centro de Costo -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Comprobante (Serie)</label>
            <select id="teso-modal-tx-type" class="form-input py-1.5 text-xs bg-gray-50" onchange="window._updateTesoDocNumberPlaceholder()">
              ${txTypeOptions}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha</label>
            <input id="teso-modal-date" type="date" class="form-input py-1.5 text-xs bg-gray-50" value="${(window as any).todayStr()}">
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sucursal</label>
            <select id="teso-modal-branch" class="form-input py-1.5 text-xs bg-gray-50">
              <option value="">— Seleccione —</option>
              ${branchOptions}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Centro Costo</label>
            <select id="teso-modal-cost-center" class="form-input py-1.5 text-xs bg-gray-50">
              <option value="">— Seleccione —</option>
              ${ccOptions}
            </select>
          </div>
        </div>

        <!-- Fila 2: Contribuyente, Forma de Pago, Método/Banco, Clasificador -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" id="teso-lbl-tercero">Contribuyente</label>
            <div id="modal-rc-wrap" class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search text-xs"></i></div>
              <input id="modal-rc-search" class="form-input pl-7 py-1.5 text-xs bg-gray-50 focus:bg-white transition-colors" autocomplete="off" placeholder="Buscar NIT/CC...">
              <input id="modal-rc-hidden" type="hidden" value="">
              <div id="modal-rc-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:160px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
            </div>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Forma de Pago</label>
            <select id="teso-modal-pago-modo" class="form-input py-1.5 text-xs font-semibold bg-blue-50/50 text-blue-900 border-blue-200" onchange="window._toggleTesoPagoMixtoMode()">
              <option value="unico">Medio Único</option>
              <option value="mixto">⚡ Pago Mixto (Múltiples Medios)</option>
            </select>
          </div>
          <div class="form-group mb-0" id="teso-single-cuenta-group">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Método / Banco</label>
            <select id="teso-modal-cuenta" class="form-input py-1.5 text-xs bg-gray-50">
              <option value="">— Seleccione —</option>
              ${metodosPago.map((c:any) => `<option value="${c.id}" data-account="${c.account_id}">${_esc(c.name)} (${_esc(c.bank)})</option>`).join('')}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Clasificador (Aplicación)</label>
            <select id="teso-modal-modo" class="form-input py-1.5 text-xs bg-gray-50" onchange="window._toggleModalManualMode()">
              <option value="auto">Automática</option>
              <option value="manual">Manual (Grilla)</option>
            </select>
          </div>
        </div>

        <!-- Fila 3: Referencia y Descripción -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group mb-0 col-span-1">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Referencia General</label>
            <input id="teso-modal-referencia" type="text" class="form-input py-1.5 text-xs bg-gray-50" placeholder="No. recibo, transferencia, etc.">
          </div>
          <div class="form-group mb-0 col-span-3">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
            <textarea id="teso-modal-obs" class="form-input py-1 text-xs bg-gray-50 w-full" rows="1" placeholder="Detalle o descripción de la transacción..."></textarea>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: DETALLE (VALORES Y RETENCIONES) -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <!-- Cabecera con checks inline -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 class="text-sm font-bold text-gray-700">Detalle de Valores</h3>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer select-none bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1 text-xs font-semibold text-emerald-800" title="Activa o desactiva la búsqueda y cruce automático de anticipos acumulados">
              <input id="teso-modal-cruzar-anticipos" type="checkbox" class="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" onchange="window._toggleTesoCruzarAnticipos()">
              Cruzar Anticipos
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none bg-amber-50 border border-amber-100 rounded-lg px-3 py-1 text-xs font-semibold text-amber-800" title="Activa o desactiva el ajuste por sobrante o faltante">
              <input id="teso-modal-has-ajuste-peso" type="checkbox" class="rounded border-amber-300 text-amber-600 focus:ring-amber-500" onchange="window._toggleTesoAjustePeso()">
              Ajuste al Peso
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none bg-blue-50 border border-blue-100 rounded-lg px-3 py-1 text-xs font-semibold text-blue-800">
              <input id="teso-modal-has-retenciones" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onchange="window._toggleTesoRetenciones()">
              Retenciones y Descuentos
            </label>
          </div>
        </div>

        <!-- Fila de Ajuste al Peso (Oculta por defecto) -->
        <div id="teso-ajuste-peso-container" class="bg-amber-50/60 p-3 rounded-xl border border-amber-200 hidden space-y-2">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <i class="fas fa-scale-balanced text-amber-600"></i>
              <span class="text-xs font-bold text-amber-900 uppercase">Opciones de Ajuste al Peso</span>
            </div>
            <button type="button" class="btn btn-xs bg-amber-600 text-white hover:bg-amber-700 font-semibold" onclick="window._autoAjustarPeso()">
              <i class="fas fa-calculator mr-1"></i>Auto-Ajustar Peso (Diferencia Cartera)
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-amber-800 uppercase mb-1">Tipo de Ajuste</label>
              <select id="teso-modal-ajuste-tipo" class="form-input py-1 text-xs bg-white font-semibold text-amber-900 border-amber-300" onchange="window._updateAjustePesoAccountOptions(); window._recalculateTesoNeto();">
                <option value="faltante">Faltante (Gasto por ajuste al peso)</option>
                <option value="sobrante">Sobrante (Ingreso por aprovechamiento)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-amber-800 uppercase mb-1">Valor del Ajuste ($)</label>
              <input id="teso-modal-ajuste-monto" type="text" class="form-input py-1 text-xs text-amber-900 font-bold bg-white border-amber-300" placeholder="0" oninput="window._handleAjustePesoInput(this)">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-amber-800 uppercase mb-1">Cuenta Contable (PUC)</label>
              <select id="teso-modal-ajuste-cuenta" class="form-input py-1 text-xs bg-white border-amber-300">
                <option value="">— Seleccionar Cuenta —</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Fila de Valores -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Valor Bruto</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-500 font-bold">$</div>
              <input id="teso-modal-monto" type="text"
                class="form-input pl-7 py-1.5 text-xs font-bold text-green-700 bg-green-50/20 border-green-200 focus:border-green-500"
                placeholder="0" oninput="window._handleMontoInput(this)">
            </div>
            <div id="teso-monto-indicator" class="mt-1 min-h-[16px]"></div>
          </div>

          <!-- Campos de Retenciones -->
          <div class="form-group mb-0 teso-ret-field opacity-40 pointer-events-none">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ReteFuente <span id="teso-rate-rf" class="text-blue-500 font-bold"></span></label>
            <input id="teso-modal-ret-fuente" type="text" class="form-input py-1.5 text-xs text-red-600 font-bold bg-gray-50 border-gray-200" placeholder="0" disabled oninput="window._handleRetInput(this)">
          </div>

          <div class="form-group mb-0 teso-ret-field opacity-40 pointer-events-none">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ReteICA <span id="teso-rate-ica" class="text-blue-500 font-bold"></span></label>
            <input id="teso-modal-ret-ica" type="text" class="form-input py-1.5 text-xs text-red-600 font-bold bg-gray-50 border-gray-200" placeholder="0" disabled oninput="window._handleRetInput(this)">
          </div>

          <div class="form-group mb-0 teso-ret-field opacity-40 pointer-events-none">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Valor Descuento</label>
            <input id="teso-modal-descuento" type="text" class="form-input py-1.5 text-xs text-indigo-600 font-bold bg-gray-50 border-gray-200" placeholder="0" disabled oninput="window._handleRetInput(this)">
          </div>

          <div class="form-group mb-0 col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Valor Neto</label>
            <div class="h-[34px] flex items-center justify-end px-3 bg-blue-50/50 border border-blue-200 rounded-lg text-lg font-black text-blue-700" id="teso-modal-neto-valor">
              $0
            </div>
          </div>
        </div>

        <!-- CONTENEDOR DE MEDIOS DE PAGO MIXTOS -->
        <div id="teso-mixed-cuentas-container" class="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200/80 space-y-3 hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fas fa-layer-group text-blue-600"></i>
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider">Desglose de Medios de Pago (Pago Mixto)</h4>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-xs bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold" onclick="window._addTesoMixedRow()">
                <i class="fas fa-plus mr-1"></i>Agregar Medio
              </button>
              <button type="button" class="btn btn-xs bg-blue-600 text-white hover:bg-blue-700 font-semibold" onclick="window._autoFillTesoMixedRow()">
                <i class="fas fa-magic mr-1"></i>Completar Saldo Restante
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-left text-[10px] font-bold text-gray-500 uppercase border-b border-blue-200/60 pb-1">
                  <th class="pb-1 pr-2">Cuenta / Banco</th>
                  <th class="pb-1 pr-2 w-32">Tipo Método</th>
                  <th class="pb-1 pr-2 w-40">Referencia / Comprobante</th>
                  <th class="pb-1 pr-2 w-36 text-right">Valor ($)</th>
                  <th class="pb-1 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody id="teso-mixed-rows-tbody">
              </tbody>
            </table>
          </div>

          <div id="teso-mixed-balance-bar" class="flex items-center justify-between p-2 rounded-lg text-xs font-bold bg-white border border-gray-200 shadow-xs">
          </div>
        </div>

        <!-- CONTENEDOR DE CARTERA (GRILLA DE FACTURAS) -->
        <div id="teso-modal-items-container" class="rounded-xl border border-gray-200 overflow-hidden min-h-[80px] max-h-[230px] flex flex-col items-center justify-center text-gray-400">
          <div class="text-center p-6">
            <div class="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <i class="fas fa-search-dollar text-xl text-gray-400"></i>
            </div>
            <p class="text-xs font-medium text-gray-500">Busca un tercero para visualizar su cartera</p>
          </div>
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
    _initTesoTerceroAutocomplete(
      'modal-rc-wrap', 'modal-rc-search', 'modal-rc-hidden', 'modal-rc-results',
      (t) => t.type === 'CLIENTE',
      (t) => {
        _tesoCurrentThirdParty = t;
        _updateThirdPartyDetailsShow(t);
        _loadOpenItemsForModal(t.id, true).then(() => {
          const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
          const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
          if (montoEl) {
            montoEl.value = total > 0 ? Math.round(total).toLocaleString('es-CO') : '';
          }
          if ((window as any)._applyDefaultRetenciones) {
            (window as any)._applyDefaultRetenciones();
          } else {
            _recalculateTesoNeto();
          }
        });
      }
    );
    try {
      const sets = await pb.listAll('settings', { filter: `key="treasury_rules"` });
      let rules: any = { modoOperacion: 'comercial' };
      if (sets.length && sets[0].value) {
        try { rules = { ...rules, ...JSON.parse(sets[0].value) }; } catch(e) {}
      }
      (window as any)._changeTesoOrigen(rules.modoOperacion === 'ph' ? 'ph' : 'comercial');
    } catch (e) {
      (window as any)._changeTesoOrigen('comercial');
    }
    _updateTesoDocNumberPlaceholder();
  }, 50);
}

async function openPagoModal() {
  _tesoCurrentOpenItems = [];
  _tesoCurrentThirdParty = null;
  
  const pb = _pb();
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }

  const [metodosPago, branches, costCenters, txTypes, settingsReq, accountsReq] = await Promise.all([
    pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' }),
    pb.listAll('branches', { filter: 'active=true', sort: 'name' }),
    pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' }),
    pb.listAll('transaction_types', { filter: 'code="CE" || code ~ "CE%"', sort: 'name' }),
    pb.listAll('settings', { filter: 'key="treasury_rules"' }),
    pb.listAll('accounts', { filter: 'level>=3', sort: 'code' })
  ]);

  _tesoAvailableMetodosPago = metodosPago;
  _tesoIsPagoMixto = false;
  _tesoMixedRows = [];
  _tesoAllAccountsForAjuste = accountsReq || [];

  let allowManualDocNumber = false;
  if (settingsReq.length > 0 && settingsReq[0].value) {
    try {
      const parsed = JSON.parse(settingsReq[0].value);
      allowManualDocNumber = !!parsed.allowManualDocNumber;
      _tesoAjustePesoAccountsMap = {
        sobrante: parsed.ajuste_peso_sobrante_account_id || '',
        faltante: parsed.ajuste_peso_faltante_account_id || ''
      };
    } catch (_) {}
  }

  _tesoCurrentTxTypes = txTypes;

  const userModel = pb?.authStore?.model || pb?.currentUser || (window as any).API?.currentUser;
  const userDefaultBranchId = userModel?.default_branch_id || userModel?.branch_id || '';
  const activeBranchId = (window as any).CURRENT_BRANCH_ID || localStorage.getItem('active_branch_id') || 'TODAS';

  const defaultBranchId = (userDefaultBranchId && branches.some((b: any) => b.id === userDefaultBranchId))
    ? userDefaultBranchId
    : ((activeBranchId !== 'TODAS' && activeBranchId && branches.some((b: any) => b.id === activeBranchId))
        ? activeBranchId
        : (branches[0]?.id || ''));

  const branchOptions = branches.map((b: any) =>
    `<option value="${b.id}" ${b.id === defaultBranchId ? 'selected' : ''}>${_esc(b.code ? b.code + ' - ' + b.name : b.name)}</option>`
  ).join('');
  const ccOptions = costCenters.map((c: any) => `<option value="${c.id}">${_esc(c.code)} — ${_esc(c.name)}</option>`).join('');
  const txTypeOptions = txTypes.map((t: any) => `<option value="${t.id}">${_esc(t.prefix || t.code)} — ${_esc(t.name)}</option>`).join('');

  const bodyHtml = `
    <div class="flex flex-col h-full gap-4 text-gray-800" style="font-family:'Segoe UI',sans-serif;">
      <!-- SECCIÓN: INFORMACIÓN GENERAL -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        
        <!-- Cabecera de Sección con No. de Egreso integrado -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 class="text-sm font-bold text-gray-700">Información General</h3>
          <div class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 shadow-sm">
            <span class="text-[10px] font-bold text-red-800 uppercase tracking-wider">No. de Egreso:</span>
            <input id="teso-modal-doc-number" type="text"
              class="w-64 text-center font-mono text-xs font-bold rounded px-2 py-0.5 focus:ring-1 focus:ring-red-400 focus:outline-none ${allowManualDocNumber ? 'text-red-700 bg-white border border-red-200' : 'text-gray-500 bg-gray-100 border border-gray-300 cursor-not-allowed'}"
              value=""
              ${allowManualDocNumber ? '' : 'disabled'}
              onblur="if(!this.value.trim()) window._updateTesoDocNumberPlaceholder()">
          </div>
        </div>
        
        <!-- Fila 1: Tipo de Comprobante, Fecha, Sucursal, Centro de Costo -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Comprobante (Serie)</label>
            <select id="teso-modal-tx-type" class="form-input py-1.5 text-xs bg-gray-50" onchange="window._updateTesoDocNumberPlaceholder()">
              ${txTypeOptions}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha</label>
            <input id="teso-modal-date" type="date" class="form-input py-1.5 text-xs bg-gray-50" value="${(window as any).todayStr()}">
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sucursal</label>
            <select id="teso-modal-branch" class="form-input py-1.5 text-xs bg-gray-50">
              <option value="">— Seleccione —</option>
              ${branchOptions}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Centro Costo</label>
            <select id="teso-modal-cost-center" class="form-input py-1.5 text-xs bg-gray-50">
              <option value="">— Seleccione —</option>
              ${ccOptions}
            </select>
          </div>
        </div>

        <!-- Fila 2: Proveedor, Forma de Pago, Cuenta de Origen, Clasificador -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Proveedor</label>
            <div id="modal-eg-wrap" class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search text-xs"></i></div>
              <input id="modal-eg-search" class="form-input pl-7 py-1.5 text-xs bg-gray-50 focus:bg-white transition-colors" autocomplete="off" placeholder="Buscar NIT/CC...">
              <input id="modal-eg-hidden" type="hidden" value="">
              <div id="modal-eg-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:160px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
            </div>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Forma de Pago</label>
            <select id="teso-modal-pago-modo" class="form-input py-1.5 text-xs font-semibold bg-red-50/50 text-red-900 border-red-200" onchange="window._toggleTesoPagoMixtoMode()">
              <option value="unico">Medio Único</option>
              <option value="mixto">⚡ Pago Mixto (Múltiples Medios)</option>
            </select>
          </div>
          <div class="form-group mb-0" id="teso-single-cuenta-group">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuenta de Origen</label>
            <select id="teso-modal-cuenta" class="form-input py-1.5 text-xs bg-gray-50">
              <option value="">— Seleccione —</option>
              ${metodosPago.map((c:any) => `<option value="${c.id}" data-account="${c.account_id}">${_esc(c.name)} (${_esc(c.bank)})</option>`).join('')}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Clasificador (Aplicación)</label>
            <select id="teso-modal-modo" class="form-input py-1.5 text-xs bg-gray-50" onchange="window._toggleModalManualMode()">
              <option value="auto">Automática</option>
              <option value="manual">Manual (Grilla)</option>
            </select>
          </div>
        </div>

        <!-- Fila 3: Referencia y Descripción -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="form-group mb-0 col-span-1">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Referencia General</label>
            <input id="teso-modal-referencia" type="text" class="form-input py-1.5 text-xs bg-gray-50" placeholder="No. cheque, transferencia, etc.">
          </div>
          <div class="form-group mb-0 col-span-3">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
            <textarea id="teso-modal-obs" class="form-input py-1 text-xs bg-gray-50 w-full" rows="1" placeholder="Detalle o descripción de la transacción..."></textarea>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: DETALLE (VALORES Y RETENCIONES) -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <!-- Cabecera con checks inline -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 class="text-sm font-bold text-gray-700">Detalle de Valores</h3>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer select-none bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1 text-xs font-semibold text-emerald-800" title="Activa o desactiva la búsqueda y cruce automático de anticipos acumulados">
              <input id="teso-modal-cruzar-anticipos" type="checkbox" class="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" onchange="window._toggleTesoCruzarAnticipos()">
              Cruzar Anticipos
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none bg-amber-50 border border-amber-100 rounded-lg px-3 py-1 text-xs font-semibold text-amber-800" title="Activa o desactiva el ajuste por sobrante o faltante">
              <input id="teso-modal-has-ajuste-peso" type="checkbox" class="rounded border-amber-300 text-amber-600 focus:ring-amber-500" onchange="window._toggleTesoAjustePeso()">
              Ajuste al Peso
            </label>
            <label class="flex items-center gap-2 cursor-pointer select-none bg-red-50 border border-red-100 rounded-lg px-3 py-1 text-xs font-semibold text-red-800">
              <input id="teso-modal-has-retenciones" type="checkbox" class="rounded border-gray-300 text-red-600 focus:ring-red-500" onchange="window._toggleTesoRetenciones()">
              Retenciones y Descuentos
            </label>
          </div>
        </div>
        
        <!-- Fila de Ajuste al Peso (Oculta por defecto) -->
        <div id="teso-ajuste-peso-container" class="bg-amber-50/60 p-3 rounded-xl border border-amber-200 hidden space-y-2">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <i class="fas fa-scale-balanced text-amber-600"></i>
              <span class="text-xs font-bold text-amber-900 uppercase">Opciones de Ajuste al Peso</span>
            </div>
            <button type="button" class="btn btn-xs bg-amber-600 text-white hover:bg-amber-700 font-semibold" onclick="window._autoAjustarPeso()">
              <i class="fas fa-calculator mr-1"></i>Auto-Ajustar Peso (Diferencia Obligaciones)
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-amber-800 uppercase mb-1">Tipo de Ajuste</label>
              <select id="teso-modal-ajuste-tipo" class="form-input py-1 text-xs bg-white font-semibold text-amber-900 border-amber-300" onchange="window._updateAjustePesoAccountOptions(); window._recalculateTesoNeto();">
                <option value="sobrante">Sobrante (Ingreso por aprovechamiento)</option>
                <option value="faltante">Faltante (Gasto por ajuste al peso)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-amber-800 uppercase mb-1">Valor del Ajuste ($)</label>
              <input id="teso-modal-ajuste-monto" type="text" class="form-input py-1 text-xs text-amber-900 font-bold bg-white border-amber-300" placeholder="0" oninput="window._handleAjustePesoInput(this)">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-amber-800 uppercase mb-1">Cuenta Contable (PUC)</label>
              <select id="teso-modal-ajuste-cuenta" class="form-input py-1 text-xs bg-white border-amber-300">
                <option value="">— Seleccionar Cuenta —</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Fila de Valores -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="form-group mb-0">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Valor Bruto</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-500 font-bold">$</div>
              <input id="teso-modal-monto" type="text"
                class="form-input pl-7 py-1.5 text-xs font-bold text-red-700 bg-red-50/20 border-red-200 focus:border-red-500"
                placeholder="0" oninput="window._handleMontoInput(this)">
            </div>
          </div>

          <!-- Campos de Retenciones -->
          <div class="form-group mb-0 teso-ret-field opacity-40 pointer-events-none">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ReteFuente <span id="teso-rate-rf" class="text-blue-500 font-bold"></span></label>
            <input id="teso-modal-ret-fuente" type="text" class="form-input py-1.5 text-xs text-red-600 font-bold bg-gray-50 border-gray-200" placeholder="0" disabled oninput="window._handleRetInput(this)">
          </div>

          <div class="form-group mb-0 teso-ret-field opacity-40 pointer-events-none">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ReteICA <span id="teso-rate-ica" class="text-blue-500 font-bold"></span></label>
            <input id="teso-modal-ret-ica" type="text" class="form-input py-1.5 text-xs text-red-600 font-bold bg-gray-50 border-gray-200" placeholder="0" disabled oninput="window._handleRetInput(this)">
          </div>

          <div class="form-group mb-0 teso-ret-field opacity-40 pointer-events-none">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Valor Descuento</label>
            <input id="teso-modal-descuento" type="text" class="form-input py-1.5 text-xs text-indigo-600 font-bold bg-gray-50 border-gray-200" placeholder="0" disabled oninput="window._handleRetInput(this)">
          </div>

          <div class="form-group mb-0 col-span-2 md:col-span-1">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Valor Neto</label>
            <div class="h-[34px] flex items-center justify-end px-3 bg-blue-50/50 border border-blue-200 rounded-lg text-lg font-black text-blue-700" id="teso-modal-neto-valor">
              $0
            </div>
          </div>
        </div>

        <!-- CONTENEDOR DE MEDIOS DE PAGO MIXTOS -->
        <div id="teso-mixed-cuentas-container" class="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200/80 space-y-3 hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fas fa-layer-group text-blue-600"></i>
              <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wider">Desglose de Medios de Pago (Pago Mixto)</h4>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-xs bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold" onclick="window._addTesoMixedRow()">
                <i class="fas fa-plus mr-1"></i>Agregar Medio
              </button>
              <button type="button" class="btn btn-xs bg-blue-600 text-white hover:bg-blue-700 font-semibold" onclick="window._autoFillTesoMixedRow()">
                <i class="fas fa-magic mr-1"></i>Completar Saldo Restante
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-left text-[10px] font-bold text-gray-500 uppercase border-b border-blue-200/60 pb-1">
                  <th class="pb-1 pr-2">Cuenta / Banco</th>
                  <th class="pb-1 pr-2 w-32">Tipo Método</th>
                  <th class="pb-1 pr-2 w-40">Referencia / Comprobante</th>
                  <th class="pb-1 pr-2 w-36 text-right">Valor ($)</th>
                  <th class="pb-1 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody id="teso-mixed-rows-tbody">
              </tbody>
            </table>
          </div>

          <div id="teso-mixed-balance-bar" class="flex items-center justify-between p-2 rounded-lg text-xs font-bold bg-white border border-gray-200 shadow-xs">
          </div>
        </div>

        <!-- CONTENEDOR DE CARTERA (GRILLA DE OBLIGACIONES) -->
        <div id="teso-modal-items-container" class="rounded-xl border border-gray-200 overflow-hidden min-h-[80px] max-h-[230px] flex flex-col items-center justify-center text-gray-400">
          <div class="text-center p-6">
            <div class="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <i class="fas fa-file-invoice-dollar text-xl text-gray-400"></i>
            </div>
            <p class="text-xs font-medium text-gray-500">Busca un proveedor para visualizar sus obligaciones</p>
          </div>
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
      (t) => t.type === 'PROVEEDOR',
      (t) => {
        _tesoCurrentThirdParty = t;
        _updateThirdPartyDetailsShow(t);
        _loadOpenItemsForModal(t.id, false).then(() => {
          const total = _tesoCurrentOpenItems.reduce((s, i) => s + i.saldo, 0);
          const montoEl = document.getElementById('teso-modal-monto') as HTMLInputElement;
          if (montoEl) {
            const decPlaces = (window as any).getDecimalPlaces ? (window as any).getDecimalPlaces() : 2;
            montoEl.value = total > 0 ? total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decPlaces }) : '';
          }
          if ((window as any)._applyDefaultRetenciones) {
            (window as any)._applyDefaultRetenciones();
          } else {
            _recalculateTesoNeto();
          }
        });
      }
    );
    _updateTesoDocNumberPlaceholder();
  }, 50);
}

// ─── DASHBOARD ───────────────────────────────────────────────
async function renderTesoDashboard() {
  const c = document.getElementById('teso-content');
  if (!c) return;
  try {
    const pb = _pb();
    const [accounts, txLines] = await Promise.all([
      (window as any).API.getAccounts(false),
      pb.listAll('tx_lines', {
        expand: 'account_id,tx_id',
        filter: 'tx_id.status="active"',
      }),
    ]);

    const accountMap = new Map(accounts.map((a: any) => [a.id, a]));
    const docs = new Map();

    for (const line of txLines) {
      const tx = line.expand?.tx_id;
      if (!tx) continue;

      const acc = line.expand?.account_id || accountMap.get(line.account_id);
      if (!acc || !acc.maneja_cruce) continue;

      const code = acc.code || '';
      const is13 = code.startsWith('13');
      const is21_22_23 = code.startsWith('21') || code.startsWith('22') || code.startsWith('23');

      if (!is13 && !is21_22_23) continue;

      const thirdId = line.third_party_id || tx.third_party_id || 'NO_TERCERO';
      const ref = (line.cross_doc_ref || '').trim() || 'SIN_DOC';

      const key = `${acc.id}|${thirdId}|${ref}`;
      if (!docs.has(key)) {
        docs.set(key, {
          is13,
          is21_22_23,
          debit: 0,
          credit: 0,
        });
      }
      const d = docs.get(key);
      d.debit += Number(line.debit || 0);
      d.credit += Number(line.credit || 0);
    }

    let saldoCxC = 0;
    let saldoCxP = 0;
    let cxcCount = 0;
    let cxpCount = 0;
    const EPS = 0.0001;

    docs.forEach((d) => {
      if (d.is13) {
        const open = d.debit - d.credit;
        if (open > EPS) {
          saldoCxC += open;
          cxcCount++;
        }
      } else if (d.is21_22_23) {
        const open = d.credit - d.debit;
        if (open > EPS) {
          saldoCxP += open;
          cxpCount++;
        }
      }
    });

    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-green-800 mb-1 flex items-center"><i class="fas fa-hand-holding-dollar mr-2"></i> Total Cuentas por Cobrar</div>
          <div class="text-4xl font-bold text-green-900 my-2">${_fmt(saldoCxC)}</div>
          <div class="text-sm text-green-700">${cxcCount} documentos de cruce pendientes</div>
        </div>
        <div class="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm">
          <div class="text-sm font-semibold text-red-800 mb-1 flex items-center"><i class="fas fa-file-invoice-dollar mr-2"></i> Total Cuentas por Pagar</div>
          <div class="text-4xl font-bold text-red-900 my-2">${_fmt(saldoCxP)}</div>
          <div class="text-sm text-red-700">${cxpCount} obligaciones pendientes</div>
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
    
    let rules: any = { primeroVencido: true, primeroMora: true, interesPrioridad: true, cuentasInteres: [], ajuste_peso_sobrante_account_id: '', ajuste_peso_faltante_account_id: '' };
    let recordId = '';
    
    if (settingsReq.length > 0) {
      recordId = settingsReq[0].id;
      if (settingsReq[0].value) {
        try { rules = { ...rules, ...JSON.parse(settingsReq[0].value) }; } catch (_) {}
      }
    }

    const accountOptions = cuentas.map((c:any) => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
    const accountOptionsWithId = cuentas.map((c:any) => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('');
    
    const bodyHtml = `
      <div class="border-b mb-4 flex gap-4" style="border-color:#E5E7EB">
        <button type="button" id="tab-teso-rules" class="py-2 px-1 font-bold text-sm text-blue-600 border-b-2 border-blue-600 focus:outline-none flex items-center gap-2" onclick="window.switchTesoConfigTab('rules')">
          <i class="fas fa-sliders"></i>Reglas de Recaudo
        </button>
        <button type="button" id="tab-teso-concepts" class="py-2 px-1 font-semibold text-sm text-gray-500 hover:text-gray-700 focus:outline-none flex items-center gap-2" onclick="window.switchTesoConfigTab('concepts')">
          <i class="fas fa-list-check"></i>Conceptos de Caja (POS)
        </button>
      </div>

      <div id="teso-pane-rules" class="space-y-6">
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

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
          <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-scale-balanced mr-2 text-amber-600"></i>Cuentas de Ajuste al Peso</h4>
          <p class="text-xs text-gray-500 mb-4">Configura las cuentas contables del PUC asignadas por defecto para registrar diferencias por sobrante o faltante en recaudos y egresos.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Ajuste por Sobrante (Ingreso / Aprovechamiento)</label>
              <select id="teso-cfg-sobrante-account" class="form-input text-xs bg-white w-full border border-gray-300 rounded-lg">
                <option value="">— Seleccionar Cuenta PUC —</option>
                ${accountOptionsWithId}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Ajuste por Faltante (Gasto / Pérdida)</label>
              <select id="teso-cfg-faltante-account" class="form-input text-xs bg-white w-full border border-gray-300 rounded-lg">
                <option value="">— Seleccionar Cuenta PUC —</option>
                ${accountOptionsWithId}
              </select>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
          <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-file-invoice mr-2 text-blue-600"></i>Numeración de Documentos</h4>
          <p class="text-xs text-gray-500 mb-4">Define si los usuarios pueden modificar manualmente el número sugerido de los comprobantes.</p>
          <div class="space-y-3">
            <label class="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
              <input type="checkbox" id="teso-cfg-manual-doc" class="mt-1 w-4 h-4 text-blue-600" ${rules.allowManualDocNumber ? 'checked' : ''}>
              <div>
                <span class="block font-semibold text-sm text-gray-800">Permitir edición manual de números de documento</span>
                <span class="block text-xs text-gray-500 mt-1">Si está desactivado, el campo de número estará bloqueado y se generará strictly según la secuencia correlativa configurada.</span>
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

      <div id="teso-pane-concepts" class="space-y-4" style="display:none">
        <!-- Editor de conceptos dinámicos de caja -->
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-cfg">
        <i class="fas fa-save mr-2"></i>Guardar Reglas
      </button>
    `;

    _openModal('Configuración de Tesorería Automática', bodyHtml, footerHtml, false);

    const sobranteEl = document.getElementById('teso-cfg-sobrante-account') as HTMLSelectElement;
    const faltanteEl = document.getElementById('teso-cfg-faltante-account') as HTMLSelectElement;
    if (sobranteEl && rules.ajuste_peso_sobrante_account_id) sobranteEl.value = rules.ajuste_peso_sobrante_account_id;
    if (faltanteEl && rules.ajuste_peso_faltante_account_id) faltanteEl.value = rules.ajuste_peso_faltante_account_id;

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
      const allowManualDocNumber = (document.getElementById('teso-cfg-manual-doc') as HTMLInputElement).checked;

      const ajuste_peso_sobrante_account_id = (document.getElementById('teso-cfg-sobrante-account') as HTMLSelectElement)?.value || '';
      const ajuste_peso_faltante_account_id = (document.getElementById('teso-cfg-faltante-account') as HTMLSelectElement)?.value || '';

      const payload = {
        key: 'treasury_rules',
        value: JSON.stringify({
          modoOperacion,
          primeroVencido: fifo,
          primeroMora: mora,
          interesPrioridad: interes,
          cuentasInteres: cuentasArr,
          allowManualDocNumber,
          ajuste_peso_sobrante_account_id,
          ajuste_peso_faltante_account_id
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

// ─── PÁGINA INDEPENDIENTE DE RECAUDOS (RC) ───────────────────────────────────
async function showRecaudosScreen(container: HTMLElement) {
  const c = container || document.getElementById('page-content');
  if (!c) return;

  // Render core container structure with loading skeletons
  c.innerHTML = `
    <div class="page-header flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Recaudos (Recibos de Caja)</h2>
        <p class="text-gray-500 text-sm mt-1">Gestión de ingresos, cartera de clientes y carga masiva de recaudos.</p>
      </div>
      <button class="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm" onclick="openTesoreriaConfigModal()">
        <i class="fas fa-cog mr-2 text-gray-500"></i>Configuración
      </button>
    </div>

    <!-- Quick Info Cards Section -->
    <div id="recaudos-quick-info" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-sm animate-pulse">
        <div class="h-4 bg-green-200/50 rounded w-2/3 mb-2"></div>
        <div class="h-8 bg-green-200/50 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-green-200/50 rounded w-3/4"></div>
      </div>
      <div class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-sm animate-pulse">
        <div class="h-4 bg-blue-200/50 rounded w-2/3 mb-2"></div>
        <div class="h-8 bg-blue-200/50 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-blue-200/50 rounded w-3/4"></div>
      </div>
    </div>

    <div id="recaudos-listado-content"></div>
  `;

  const listContainer = document.getElementById('recaudos-listado-content')!;
  renderTesoListado(listContainer, 'RC');

  // Load metrics asynchronously
  loadQuickInfoRecaudos().then(metrics => {
    const statsContainer = document.getElementById('recaudos-quick-info');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-sm font-semibold text-green-800 mb-1 flex items-center">
            <i class="fas fa-hand-holding-dollar mr-2"></i> Total Cuentas por Cobrar (Cartera)
          </div>
          <div class="text-4xl font-bold text-green-900 my-2">${_fmt(metrics.totalCxC)}</div>
          <div class="text-sm text-green-700">${metrics.countCxC} documentos de cobro pendientes</div>
        </div>
        <div class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-sm font-semibold text-blue-800 mb-1 flex items-center">
            <i class="fas fa-cash-register mr-2"></i> Recaudado este Mes
          </div>
          <div class="text-4xl font-bold text-blue-900 my-2">${_fmt(metrics.totalRecaudadoMes)}</div>
          <div class="text-sm text-blue-700">Recaudos totales ingresados en Caja/Bancos</div>
        </div>
      `;
    }
  });
}

async function loadQuickInfoRecaudos() {
  try {
    const pb = _pb();
    const today = (window as any).todayStr();
    const startOfMonthStr = (window as any).getColombiaFirstDayOfMonth();
    const endOfMonthStr = (window as any).getColombiaLastDayOfMonth();

    try {
      const res = await pb.send(`/api/gravy/treasury-metrics?mode=recaudos&asOfDate=${today}&startDate=${startOfMonthStr}&endDate=${endOfMonthStr}`, {});
      if (res && typeof res.portfolioTotal === 'number' && (res.portfolioTotal > 0 || res.monthTotal > 0)) {
        return {
          totalCxC: Number(res.portfolioTotal || 0),
          countCxC: Number(res.portfolioCount || 0),
          totalRecaudadoMes: Number(res.monthTotal || 0)
        };
      }
    } catch (_) {}

    // Fallback si el servidor PocketBase no ha cargado aún el hook
    const openItems = await pb.send(`/api/gravy/report-portfolio-aging?mode=cxc&asOfDate=${today}`, {}).catch(() => []);
    let totalCxC = 0;
    let countCxC = 0;
    if (Array.isArray(openItems)) {
      for (const item of openItems) {
        totalCxC += Number(item.open || 0);
        countCxC++;
      }
    }

    let totalRecaudadoMes = 0;
    try {
      const rcTxs = await pb.listAll('transactions', {
        filter: `(tx_type_id.code="RC" || tx_type_id.code ~ "RC%" || tx_type_id.prefix ~ "RC%" || number ~ "RC%") && status="active" && date >= "${startOfMonthStr}" && date <= "${endOfMonthStr} 23:59:59"`
      });
      if (rcTxs.length) {
        const rcIds = rcTxs.map((t: any) => t.id);
        const chunkSize = 40;
        for (let i = 0; i < rcIds.length; i += chunkSize) {
          const chunk = rcIds.slice(i, i + chunkSize);
          const filterStr = chunk.map(id => `tx_id="${id}"`).join(' || ');
          const lines = await pb.listAll('tx_lines', { filter: filterStr, expand: 'account_id' });
          for (const l of lines) {
            const accCode = l.expand?.account_id?.code || '';
            if (accCode.startsWith('11')) {
              totalRecaudadoMes += Number(l.debit || 0);
            }
          }
        }
      }
    } catch (_) {}

    return { totalCxC, countCxC, totalRecaudadoMes };
  } catch (err) {
    console.error("Error cargando estadísticas de Recaudos:", err);
    return { totalCxC: 0, countCxC: 0, totalRecaudadoMes: 0 };
  }
}

// ─── PÁGINA INDEPENDIENTE DE EGRESOS (CE) ─────────────────────────────────────
async function showEgresosScreen(container: HTMLElement) {
  const c = container || document.getElementById('page-content');
  if (!c) return;

  c.innerHTML = `
    <div class="page-header flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Egresos (Comprobantes de Pago)</h2>
        <p class="text-gray-500 text-sm mt-1">Gestión de egresos rápidos, pagos a proveedores y obligaciones contables.</p>
      </div>
      <button class="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm" onclick="openEgresosConfigModal()">
        <i class="fas fa-sliders mr-2 text-gray-500"></i>Configurar Egresos
      </button>
    </div>

    <!-- Quick Info Cards Section -->
    <div id="egresos-quick-info" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm animate-pulse">
        <div class="h-4 bg-red-200/50 rounded w-2/3 mb-2"></div>
        <div class="h-8 bg-red-200/50 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-red-200/50 rounded w-3/4"></div>
      </div>
      <div class="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl shadow-sm animate-pulse">
        <div class="h-4 bg-amber-200/50 rounded w-2/3 mb-2"></div>
        <div class="h-8 bg-amber-200/50 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-amber-200/50 rounded w-3/4"></div>
      </div>
    </div>

    <div id="egresos-listado-content"></div>
  `;

  const listContainer = document.getElementById('egresos-listado-content')!;
  renderTesoListado(listContainer, 'CE');

  // Load metrics asynchronously
  loadQuickInfoEgresos().then(metrics => {
    const statsContainer = document.getElementById('egresos-quick-info');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-sm font-semibold text-red-800 mb-1 flex items-center">
            <i class="fas fa-file-invoice-dollar mr-2"></i> Total Cuentas por Pagar (Obligaciones)
          </div>
          <div class="text-4xl font-bold text-red-900 my-2">${_fmt(metrics.totalCxP)}</div>
          <div class="text-sm text-red-700">${metrics.countCxP} obligaciones de pago pendientes</div>
        </div>
        <div class="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-sm font-semibold text-amber-800 mb-1 flex items-center">
            <i class="fas fa-money-bill-transfer mr-2"></i> Pagado este Mes
          </div>
          <div class="text-4xl font-bold text-amber-900 my-2">${_fmt(metrics.totalPagadoMes)}</div>
          <div class="text-sm text-amber-700">Pagos totales liquidados de Caja/Bancos</div>
        </div>
      `;
    }
  });
}

async function loadQuickInfoEgresos() {
  try {
    const pb = _pb();
    const today = (window as any).todayStr();
    const startOfMonthStr = (window as any).getColombiaFirstDayOfMonth();
    const endOfMonthStr = (window as any).getColombiaLastDayOfMonth();

    try {
      const res = await pb.send(`/api/gravy/treasury-metrics?mode=egresos&asOfDate=${today}&startDate=${startOfMonthStr}&endDate=${endOfMonthStr}`, {});
      if (res && typeof res.portfolioTotal === 'number' && (res.portfolioTotal > 0 || res.monthTotal > 0)) {
        return {
          totalCxP: Number(res.portfolioTotal || 0),
          countCxP: Number(res.portfolioCount || 0),
          totalPagadoMes: Number(res.monthTotal || 0)
        };
      }
    } catch (_) {}

    // Fallback si el servidor PocketBase no ha cargado aún el hook
    const openItems = await pb.send(`/api/gravy/report-portfolio-aging?mode=cxp&asOfDate=${today}`, {}).catch(() => []);
    let totalCxP = 0;
    let countCxP = 0;
    if (Array.isArray(openItems)) {
      for (const item of openItems) {
        totalCxP += Number(item.open || 0);
        countCxP++;
      }
    }

    let totalPagadoMes = 0;
    try {
      const ceTxs = await pb.listAll('transactions', {
        filter: `(tx_type_id.code="CE" || tx_type_id.code ~ "CE%" || tx_type_id.prefix ~ "CE%" || tx_type_id.prefix ~ "CG%" || tx_type_id.prefix ~ "EF%" || number ~ "CE%" || number ~ "CG%" || number ~ "EF%") && status="active" && date >= "${startOfMonthStr}" && date <= "${endOfMonthStr} 23:59:59"`
      });
      if (ceTxs.length) {
        const ceIds = ceTxs.map((t: any) => t.id);
        const chunkSize = 40;
        for (let i = 0; i < ceIds.length; i += chunkSize) {
          const chunk = ceIds.slice(i, i + chunkSize);
          const filterStr = chunk.map(id => `tx_id="${id}"`).join(' || ');
          const lines = await pb.listAll('tx_lines', { filter: filterStr, expand: 'account_id' });
          for (const l of lines) {
            const accCode = l.expand?.account_id?.code || '';
            if (accCode.startsWith('11')) {
              totalPagadoMes += Number(l.credit || 0);
            }
          }
        }
      }
    } catch (_) {}

    return { totalCxP, countCxP, totalPagadoMes };
  } catch (err) {
    console.error("Error cargando estadísticas de Egresos:", err);
    return { totalCxP: 0, countCxP: 0, totalPagadoMes: 0 };
  }
}

// ─── CONFIGURACIÓN DE EGRESOS RÁPIDOS ──────────────────────────────────────────
async function openEgresosConfigModal() {
  const bodyHtml = `
    <div class="space-y-4">
      <div id="egresos-quick-concepts-pane" class="space-y-4">
        <!-- Renders concepts list dynamically -->
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-primary" onclick="closeModal()">Cerrar</button>
  `;

  _openModal('Configuración de Egresos Rápidos', bodyHtml, footerHtml, false);
  
  (window as any).renderQuickEgresosConceptsList = async () => {
    const pane = document.getElementById('egresos-quick-concepts-pane');
    if (!pane) return;
    pane.innerHTML = '<div class="text-center py-4 text-xs text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i>Cargando conceptos de egreso...</div>';

    try {
      const pb = _pb();
      const [concepts, accounts] = await Promise.all([
        pb.listAll('cash_concepts', { filter: 'type="egreso"', expand: 'account_id', sort: 'name' }),
        pb.listAll('accounts', { filter: 'level>=3', sort: 'code' })
      ]);

      const accountOpts = accounts.map((a: any) => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('');

      const listHtml = concepts.map((c: any) => `
        <tr class="border-b" style="border-color:#F3F4F6">
          <td class="px-3 py-2 font-bold text-xs text-gray-800">${_esc(c.name)}</td>
          <td class="px-3 py-2 text-xs text-gray-600">
            ${c.expand?.account_id ? `${c.expand.account_id.code} - ${c.expand.account_id.name}` : '—'}
          </td>
          <td class="px-3 py-2 text-xs">
            <button class="btn btn-outline py-0.5 px-2 text-[10px] ${c.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50/20' : 'text-gray-400'}" 
                    onclick="window.toggleQuickEgresoActive('${c.id}', ${c.active})">
              ${c.active ? 'Activo' : 'Inactivo'}
            </button>
          </td>
          <td class="px-3 py-2 text-right space-x-1">
            <button class="btn btn-outline py-1 px-2 text-[10px] text-blue-600 border-blue-200 bg-blue-50/15" 
                    onclick="window.editQuickEgreso('${c.id}', '${_esc(c.name)}', '${c.account_id}')">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger py-1 px-2 text-[10px]" onclick="window.deleteQuickEgreso('${c.id}')">
              <i class="fas fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `).join('');

      pane.innerHTML = `
        <div class="flex justify-between items-center bg-gray-50 border p-3 rounded-xl border-gray-200">
          <div>
            <h4 class="font-bold text-xs text-gray-800">Conceptos de Caja (Egresos)</h4>
            <p class="text-[10px] text-gray-400">Conceptos parametrizados para egresos rápidos en caja contable.</p>
          </div>
          <button class="btn btn-primary py-1 px-3 text-xs" onclick="window.showCreateQuickEgresoBox()">
            <i class="fas fa-plus mr-1"></i>Nuevo Concepto
          </button>
        </div>

        <!-- Formulario Concepto -->
        <div id="egresos-quick-concept-form" class="bg-gray-50 border p-3 rounded-xl border-gray-200 space-y-3" style="display:none">
          <h5 class="font-bold text-xs text-gray-800 uppercase">Crear Concepto de Egreso</h5>
          <div class="form-group">
            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre del Concepto</label>
            <input type="text" id="eg-concept-name" class="form-input text-xs w-full" placeholder="Ej: Gastos de Cafetería" style="background:#fff">
          </div>
          <div class="form-group">
            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cuenta Contable Mapeada</label>
            <select id="eg-concept-account" class="form-input text-xs w-full" style="background:#fff">
              <option value="">Selecciona la cuenta PUC...</option>
              ${accountOpts}
            </select>
          </div>
          <div class="flex gap-2 justify-end pt-1">
            <button class="btn btn-outline py-1 px-3 text-xs" onclick="document.getElementById('egresos-quick-concept-form').style.display='none'">Cancelar</button>
            <button class="btn btn-primary py-1 px-3 text-xs" id="btn-save-eg-concept" onclick="window.saveQuickEgresoConcept()">Guardar</button>
          </div>
        </div>

        <div class="overflow-x-auto border rounded-xl" style="border-color:#E5E7EB">
          <table class="w-full text-left" style="background:#fff">
            <thead>
              <tr class="bg-gray-50 border-b text-[10px] font-bold text-gray-500 uppercase" style="border-color:#E5E7EB">
                <th class="px-3 py-2">Nombre</th>
                <th class="px-3 py-2">Cuenta Contable</th>
                <th class="px-3 py-2">Estado</th>
                <th class="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${listHtml || '<tr><td colspan="4" class="text-center py-4 text-gray-400 text-xs">No hay conceptos de egreso.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    } catch (err: any) {
      pane.innerHTML = `<div class="text-center py-4 text-xs text-red-500">Error: ${err.message}</div>`;
    }
  };

  (window as any).showCreateQuickEgresoBox = () => {
    const box = document.getElementById('egresos-quick-concept-form');
    if (!box) return;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    
    const title = box.querySelector('h5');
    if (title) title.textContent = 'Crear Concepto de Egreso';
    
    (document.getElementById('eg-concept-name') as HTMLInputElement).value = '';
    (document.getElementById('eg-concept-account') as HTMLSelectElement).value = '';
    
    const saveBtn = document.getElementById('btn-save-eg-concept') as HTMLButtonElement;
    saveBtn.textContent = 'Guardar';
    saveBtn.onclick = () => (window as any).saveQuickEgresoConcept();
  };

  (window as any).editQuickEgreso = (id: string, name: string, accountId: string) => {
    const box = document.getElementById('egresos-quick-concept-form');
    if (!box) return;
    box.style.display = 'block';
    
    const title = box.querySelector('h5');
    if (title) title.textContent = 'Editar Concepto de Egreso';
    
    (document.getElementById('eg-concept-name') as HTMLInputElement).value = name;
    (document.getElementById('eg-concept-account') as HTMLSelectElement).value = accountId;
    
    const saveBtn = document.getElementById('btn-save-eg-concept') as HTMLButtonElement;
    saveBtn.textContent = 'Actualizar';
    saveBtn.onclick = () => (window as any).updateQuickEgresoConcept(id);
  };

  (window as any).saveQuickEgresoConcept = async () => {
    const name = (document.getElementById('eg-concept-name') as HTMLInputElement).value.trim();
    const accountId = (document.getElementById('eg-concept-account') as HTMLSelectElement).value;
    if (!name || !accountId) { _showToast('Faltan campos obligatorios', 'warning'); return; }
    try {
      await _pb().create('cash_concepts', { name, type: 'egreso', account_id: accountId, active: true, description: 'Egreso rápido parametrizado' });
      _showToast('Concepto creado', 'success');
      (window as any).renderQuickEgresosConceptsList();
    } catch (e: any) { _showToast(e.message, 'error'); }
  };

  (window as any).updateQuickEgresoConcept = async (id: string) => {
    const name = (document.getElementById('eg-concept-name') as HTMLInputElement).value.trim();
    const accountId = (document.getElementById('eg-concept-account') as HTMLSelectElement).value;
    if (!name || !accountId) { _showToast('Faltan campos obligatorios', 'warning'); return; }
    try {
      await _pb().update('cash_concepts', id, { name, account_id: accountId });
      _showToast('Concepto actualizado', 'success');
      (window as any).renderQuickEgresosConceptsList();
    } catch (e: any) { _showToast(e.message, 'error'); }
  };

  (window as any).toggleQuickEgresoActive = async (id: string, active: boolean) => {
    try {
      await _pb().update('cash_concepts', id, { active: !active });
      (window as any).renderQuickEgresosConceptsList();
    } catch (e: any) { _showToast(e.message, 'error'); }
  };

  (window as any).deleteQuickEgreso = async (id: string) => {
    if (!confirm('¿Deseas eliminar este concepto de egreso?')) return;
    try {
      await _pb().delete('cash_concepts', id);
      _showToast('Concepto eliminado', 'success');
      (window as any).renderQuickEgresosConceptsList();
    } catch (e: any) { _showToast(e.message, 'error'); }
  };

  await (window as any).renderQuickEgresosConceptsList();
}

// Registro en el router
if ((window as any).registerModule) {
  (window as any).registerModule('recaudos', showRecaudosScreen);
  (window as any).registerModule('egresos', showEgresosScreen);
}

// Exponer en window para compatibilidad global
(window as any).showRecaudosScreen = showRecaudosScreen;
(window as any).showEgresosScreen = showEgresosScreen;
(window as any).openRecaudoModal = openRecaudoModal;
(window as any).openPagoModal = openPagoModal;
(window as any).openTesoreriaConfigModal = openTesoreriaConfigModal;
(window as any).openEgresosConfigModal = openEgresosConfigModal;
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
        if (raw_f instanceof Date) { fecha = (window as any).getColombiaDateStr(raw_f); }
        else { const s=String(raw_f).trim(); if(/^\d{4}-\d{2}-\d{2}$/.test(s)){fecha=s;} else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){const[d,m,y]=s.split('/');fecha=`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;} else {const d=new Date(s);if(!isNaN(d.getTime()))fecha=(window as any).getColombiaDateStr(d);} }
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

// ─── GESTIÓN DINÁMICA DE CONCEPTOS DE CAJA (EGRESOS / RECAUDOS) ─────────────

window.switchTesoConfigTab = function(tab: 'rules' | 'concepts') {
  const btnRules = document.getElementById('tab-teso-rules');
  const btnConcepts = document.getElementById('tab-teso-concepts');
  const paneRules = document.getElementById('teso-pane-rules');
  const paneConcepts = document.getElementById('teso-pane-concepts');
  const saveBtn = document.getElementById('btn-save-cfg');

  if (tab === 'rules') {
    btnRules?.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    btnRules?.classList.remove('text-gray-500');
    btnConcepts?.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    btnConcepts?.classList.add('text-gray-500');
    if (paneRules) paneRules.style.display = 'block';
    if (paneConcepts) paneConcepts.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'inline-flex';
  } else {
    btnConcepts?.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    btnConcepts?.classList.remove('text-gray-500');
    btnRules?.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
    btnRules?.classList.add('text-gray-500');
    if (paneRules) paneRules.style.display = 'none';
    if (paneConcepts) {
      paneConcepts.style.display = 'block';
      window.renderTesoConceptsList();
    }
    if (saveBtn) saveBtn.style.display = 'none';
  }
};

window.renderTesoConceptsList = async function() {
  const pane = document.getElementById('teso-pane-concepts');
  if (!pane) return;

  pane.innerHTML = '<div class="text-center py-4 text-xs text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i>Cargando conceptos de caja...</div>';

  try {
    const pb = _pb();
    const [concepts, accounts] = await Promise.all([
      pb.listAll('cash_concepts', { expand: 'account_id', sort: 'name' }),
      pb.listAll('accounts', { filter: 'level>=3', sort: 'code' })
    ]);

    const accountOpts = accounts.map((a: any) => `
      <option value="${a.id}">${a.code} - ${a.name}</option>
    `).join('');

    const listHtml = concepts.map((c: any) => `
      <tr class="border-b" style="border-color:#F3F4F6">
        <td class="px-3 py-2.5 font-bold text-xs text-gray-800">${_esc(c.name)}</td>
        <td class="px-3 py-2.5 text-xs">
          <span class="px-2 py-0.5 rounded font-bold text-[10px] ${c.type === 'egreso' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}">
            ${c.type.toUpperCase()}
          </span>
        </td>
        <td class="px-3 py-2.5 text-xs text-gray-600">
          ${c.expand?.account_id ? `${c.expand.account_id.code} - ${c.expand.account_id.name}` : '—'}
        </td>
        <td class="px-3 py-2.5 text-xs">
          <button class="btn btn-outline py-0.5 px-2 text-[10px] ${c.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50/20' : 'text-gray-400'}" 
                  onclick="window.toggleTesoConceptActive('${c.id}', ${c.active})">
            ${c.active ? 'Activo' : 'Inactivo'}
          </button>
        </td>
        <td class="px-3 py-2.5 text-right space-x-1">
          <button class="btn btn-outline py-1 px-2 text-[10px] text-blue-600 border-blue-200 bg-blue-50/15" 
                  onclick="window.editTesoConcept('${c.id}', '${_esc(c.name)}', '${c.type}', '${c.account_id}')" title="Editar concepto">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger py-1 px-2 text-[10px]" onclick="window.deleteTesoConcept('${c.id}')" title="Eliminar concepto">
            <i class="fas fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    pane.innerHTML = `
      <div class="flex justify-between items-center bg-gray-50 border p-4 rounded-xl border-gray-200">
        <div>
          <h4 class="font-bold text-xs text-gray-800 uppercase tracking-wider">Conceptos de Caja (POS)</h4>
          <p class="text-[10px] text-gray-400">Estos conceptos aparecen dinámicamente al registrar egresos o recaudos directos en el POS.</p>
        </div>
        <button class="btn btn-primary py-1.5 px-3 text-xs" onclick="window.showCreateTesoConceptBox()">
          <i class="fas fa-plus mr-1"></i>Nuevo Concepto
        </button>
      </div>

      <!-- Formulario de creación/edición (oculto por defecto) -->
      <div id="teso-create-concept-box" class="bg-gray-50 border p-4 rounded-xl border-gray-200 space-y-3" style="display:none">
        <h5 class="font-bold text-xs text-gray-800 uppercase tracking-wider mb-2">Crear Nuevo Concepto</h5>
        <div class="grid grid-cols-2 gap-3">
          <div class="form-group">
            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre del Concepto</label>
            <input type="text" id="new-concept-name" class="form-input text-xs w-full" placeholder="Ej: Pago de Telefonía" style="background:#fff;color:#0D2137">
          </div>
          <div class="form-group">
            <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tipo de Movimiento</label>
            <select id="new-concept-type" class="form-input text-xs w-full" style="background:#fff;color:#0D2137">
              <option value="egreso">Egreso (Salida de dinero / Gasto)</option>
              <option value="recaudo">Recaudo (Entrada de dinero / Ingreso)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cuenta Contable Mapeada</label>
          <select id="new-concept-account" class="form-input text-xs w-full" style="background:#fff;color:#0D2137">
            <option value="">Selecciona la cuenta PUC...</option>
            ${accountOpts}
          </select>
        </div>
        <div class="flex gap-2 justify-end pt-2">
          <button class="btn btn-outline py-1 px-3 text-xs" onclick="document.getElementById('teso-create-concept-box').style.display='none'">Cancelar</button>
          <button class="btn btn-primary py-1 px-3 text-xs" id="btn-save-new-concept" onclick="window.saveNewTesoConcept()">Guardar Concepto</button>
        </div>
      </div>

      <div class="overflow-x-auto border rounded-xl" style="border-color:#E5E7EB">
        <table class="w-full text-left" style="background:#fff">
          <thead>
            <tr class="bg-gray-50 border-b text-[10px] font-bold text-gray-500 uppercase tracking-wider" style="border-color:#E5E7EB">
              <th class="px-3 py-2">Nombre</th>
              <th class="px-3 py-2">Tipo</th>
              <th class="px-3 py-2">Cuenta Contable</th>
              <th class="px-3 py-2">Estado</th>
              <th class="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${listHtml || '<tr><td colspan="5" class="text-center py-6 text-gray-400 text-xs">No hay conceptos registrados.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch(err: any) {
    pane.innerHTML = `<div class="text-center py-4 text-xs text-red-500">Error: ${err.message}</div>`;
  }
};

window.showCreateTesoConceptBox = function() {
  const box = document.getElementById('teso-create-concept-box');
  if (!box) return;
  
  box.style.display = box.style.display === 'none' ? 'block' : 'none';

  const title = box.querySelector('h5');
  if (title) title.textContent = 'Crear Nuevo Concepto';

  const nameInput = document.getElementById('new-concept-name') as HTMLInputElement;
  const typeSelect = document.getElementById('new-concept-type') as HTMLSelectElement;
  const accountSelect = document.getElementById('new-concept-account') as HTMLSelectElement;
  const saveBtn = document.getElementById('btn-save-new-concept') as HTMLButtonElement;

  if (nameInput) nameInput.value = '';
  if (typeSelect) typeSelect.value = 'egreso';
  if (accountSelect) accountSelect.value = '';

  if (saveBtn) {
    saveBtn.textContent = 'Guardar Concepto';
    saveBtn.onclick = () => window.saveNewTesoConcept();
  }
};

window.editTesoConcept = function(id: string, name: string, type: string, accountId: string) {
  const box = document.getElementById('teso-create-concept-box');
  if (!box) return;
  
  box.style.display = 'block';

  const title = box.querySelector('h5');
  if (title) title.textContent = 'Editar Concepto de Caja';

  const nameInput = document.getElementById('new-concept-name') as HTMLInputElement;
  const typeSelect = document.getElementById('new-concept-type') as HTMLSelectElement;
  const accountSelect = document.getElementById('new-concept-account') as HTMLSelectElement;
  const saveBtn = document.getElementById('btn-save-new-concept') as HTMLButtonElement;

  if (nameInput) nameInput.value = name;
  if (typeSelect) typeSelect.value = type;
  if (accountSelect) accountSelect.value = accountId;

  if (saveBtn) {
    saveBtn.textContent = 'Actualizar Concepto';
    saveBtn.onclick = () => window.updateTesoConcept(id);
  }
};

window.saveNewTesoConcept = async function() {
  const nameInput = document.getElementById('new-concept-name') as HTMLInputElement;
  const typeSelect = document.getElementById('new-concept-type') as HTMLSelectElement;
  const accountSelect = document.getElementById('new-concept-account') as HTMLSelectElement;

  const name = nameInput?.value.trim() || '';
  const type = typeSelect?.value || 'egreso';
  const accountId = accountSelect?.value || '';

  if (!name) {
    _showToast('Escribe un nombre para el concepto.', 'warning');
    return;
  }
  if (!accountId) {
    _showToast('Selecciona una cuenta contable asociada.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-save-new-concept') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...';
  }

  try {
    const pb = _pb();
    await pb.create('cash_concepts', {
      name,
      type,
      account_id: accountId,
      active: true,
      description: 'Creado dinámicamente'
    });

    _showToast('Concepto de caja creado correctamente.', 'success');
    window.renderTesoConceptsList();
  } catch(err: any) {
    _showToast(`Error al guardar: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Guardar Concepto';
    }
  }
};

window.updateTesoConcept = async function(id: string) {
  const nameInput = document.getElementById('new-concept-name') as HTMLInputElement;
  const typeSelect = document.getElementById('new-concept-type') as HTMLSelectElement;
  const accountSelect = document.getElementById('new-concept-account') as HTMLSelectElement;

  const name = nameInput?.value.trim() || '';
  const type = typeSelect?.value || 'egreso';
  const accountId = accountSelect?.value || '';

  if (!name) {
    _showToast('Escribe un nombre para el concepto.', 'warning');
    return;
  }
  if (!accountId) {
    _showToast('Selecciona una cuenta contable asociada.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-save-new-concept') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Actualizando...';
  }

  try {
    const pb = _pb();
    await pb.update('cash_concepts', id, {
      name,
      type,
      account_id: accountId
    });

    _showToast('Concepto de caja actualizado correctamente.', 'success');
    window.renderTesoConceptsList();
  } catch(err: any) {
    _showToast(`Error al actualizar: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Actualizar Concepto';
    }
  }
};

window.toggleTesoConceptActive = async function(id: string, curActive: boolean) {
  try {
    const pb = _pb();
    await pb.update('cash_concepts', id, { active: !curActive });
    _showToast('Estado del concepto actualizado.', 'success');
    window.renderTesoConceptsList();
  } catch(err: any) {
    _showToast(`Error al actualizar estado: ${err.message}`, 'error');
  }
};

window.deleteTesoConcept = async function(id: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar este concepto de caja?')) return;
  try {
    const pb = _pb();
    await pb.delete('cash_concepts', id);
    _showToast('Concepto de caja eliminado.', 'success');
    window.renderTesoConceptsList();
  } catch(err: any) {
    _showToast(`Error al eliminar: ${err.message}`, 'error');
  }
};

// ─── PÁGINA INDEPENDIENTE DE CUENTAS BANCARIAS ────────────────────────────────
async function showBankAccountsScreen(container: HTMLElement) {
  const c = container || document.getElementById('page-content');
  if (!c) return;

  // Render full screen layout (Split: Form on Left, List on Right)
  c.innerHTML = `
    <div class="page-header mb-6">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900">Cuentas Bancarias y Métodos de Pago</h2>
      <p class="text-gray-500 text-sm mt-1">Administración de cuentas financieras, pasarelas de pago y su respectiva asignación a cuentas contables del PUC.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna Formulario (1/3) -->
      <div class="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit">
        <h3 id="ba-form-title" class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-plus-circle text-blue-600 mr-2"></i> Nueva Cuenta / Método
        </h3>
        
        <form id="bank-account-form" onsubmit="event.preventDefault();" class="space-y-4">
          <input type="hidden" id="ba-id" value="">
          
          <div class="form-group">
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre descriptivo / Alias *</label>
            <input type="text" id="ba-name" class="form-input text-sm w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20" placeholder="Ej: Bancolombia Ahorros Principal" required>
          </div>

          <div class="form-group">
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Banco / Entidad Financiera *</label>
            <input type="text" id="ba-bank" class="form-input text-sm w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20" placeholder="Ej: Bancolombia, Banco de Bogotá, Nequi" required>
          </div>

          <div class="form-group">
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Número de Cuenta / Referencia *</label>
            <input type="text" id="ba-number" class="form-input text-sm w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20" placeholder="Ej: 123-456789-01, EFE-01" required>
          </div>

          <div class="form-group">
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Cuenta Contable Asociada (PUC) *</label>
            <select id="ba-account" class="form-input text-sm w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20" required>
              <option value="">Selecciona una cuenta contable...</option>
            </select>
          </div>

          <div class="flex items-center gap-2 py-2">
            <input type="checkbox" id="ba-active" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300" checked>
            <label for="ba-active" class="text-sm font-medium text-gray-700 cursor-pointer">Cuenta activa (Disponible para transacciones)</label>
          </div>

          <div class="flex gap-2 pt-2">
            <button type="button" id="btn-ba-clear" class="btn border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 py-2 px-3 text-sm rounded-xl font-medium shadow-sm" style="display:none;" onclick="window.clearBankAccountForm()">
              Cancelar
            </button>
            <button type="button" id="btn-ba-save" class="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 py-2 px-3 text-sm rounded-xl font-medium shadow-sm" onclick="window.saveBankAccountRecord()">
              <i class="fas fa-save mr-1"></i> Guardar
            </button>
          </div>
        </form>
      </div>

      <!-- Columna Listado (2/3) -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Cuentas y Métodos Registrados</h3>
            <p class="text-gray-400 text-xs mt-0.5">Listado de canales de entrada y salida de tesorería.</p>
          </div>
          <div class="w-full sm:w-64 relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <i class="fas fa-magnifying-glass text-xs"></i>
            </span>
            <input type="text" id="ba-search" class="form-input text-xs pl-8 pr-3 py-2 w-full border border-gray-300 rounded-xl" placeholder="Buscar por banco, número o alias..." oninput="window.filterBankAccountsTable()">
          </div>
        </div>

        <div class="overflow-x-auto border border-gray-100 rounded-xl">
          <table class="w-full text-left" id="bank-accounts-table">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase">
                <th class="px-4 py-3">Banco / Entidad</th>
                <th class="px-4 py-3">Nº Cuenta</th>
                <th class="px-4 py-3">Alias</th>
                <th class="px-4 py-3">Mapeo Contable PUC</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs">
              <tr>
                <td colspan="6" class="text-center py-8 text-gray-400">
                  <i class="fas fa-spinner fa-spin mr-1 text-sm"></i> Cargando cuentas...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  let editingBankAccountId = '';
  let bankAccountsList: any[] = [];

  (window as any).clearBankAccountForm = () => {
    editingBankAccountId = '';
    const idInput = document.getElementById('ba-id') as HTMLInputElement | null;
    const nameInput = document.getElementById('ba-name') as HTMLInputElement | null;
    const bankInput = document.getElementById('ba-bank') as HTMLInputElement | null;
    const numberInput = document.getElementById('ba-number') as HTMLInputElement | null;
    const accountSelect = document.getElementById('ba-account') as HTMLSelectElement | null;
    const activeCb = document.getElementById('ba-active') as HTMLInputElement | null;

    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (bankInput) bankInput.value = '';
    if (numberInput) numberInput.value = '';
    if (accountSelect) accountSelect.value = '';
    if (activeCb) activeCb.checked = true;

    const titleEl = document.getElementById('ba-form-title');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-plus-circle text-blue-600 mr-2"></i> Nueva Cuenta / Método';

    const clearBtn = document.getElementById('btn-ba-clear');
    if (clearBtn) clearBtn.style.display = 'none';
  };

  (window as any).editBankAccount = (id: string) => {
    const item = bankAccountsList.find(b => b.id === id);
    if (!item) return;

    editingBankAccountId = id;
    const idInput = document.getElementById('ba-id') as HTMLInputElement | null;
    const nameInput = document.getElementById('ba-name') as HTMLInputElement | null;
    const bankInput = document.getElementById('ba-bank') as HTMLInputElement | null;
    const numberInput = document.getElementById('ba-number') as HTMLInputElement | null;
    const accountSelect = document.getElementById('ba-account') as HTMLSelectElement | null;
    const activeCb = document.getElementById('ba-active') as HTMLInputElement | null;

    if (idInput) idInput.value = id;
    if (nameInput) nameInput.value = item.name;
    if (bankInput) bankInput.value = item.bank;
    if (numberInput) numberInput.value = item.number;
    if (accountSelect) accountSelect.value = item.account_id || '';
    if (activeCb) activeCb.checked = !!item.active;

    const titleEl = document.getElementById('ba-form-title');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit text-orange-500 mr-2"></i> Editar Cuenta / Método';

    const clearBtn = document.getElementById('btn-ba-clear');
    if (clearBtn) clearBtn.style.display = 'block';

    document.getElementById('ba-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('ba-name')?.focus();
  };

  (window as any).saveBankAccountRecord = async () => {
    const nameInput = document.getElementById('ba-name') as HTMLInputElement | null;
    const bankInput = document.getElementById('ba-bank') as HTMLInputElement | null;
    const numberInput = document.getElementById('ba-number') as HTMLInputElement | null;
    const accountSelect = document.getElementById('ba-account') as HTMLSelectElement | null;
    const activeCb = document.getElementById('ba-active') as HTMLInputElement | null;

    const name = nameInput?.value.trim() || '';
    const bank = bankInput?.value.trim() || '';
    const number = numberInput?.value.trim() || '';
    const account_id = accountSelect?.value || '';
    const active = activeCb?.checked ?? true;

    if (!name || !bank || !number || !account_id) {
      _showToast('Por favor completa todos los campos obligatorios.', 'warning');
      return;
    }

    if (!editingBankAccountId) {
      const duplicate = bankAccountsList.find(b => b.number.trim().toLowerCase() === number.toLowerCase());
      if (duplicate) {
        _showToast(`Ya existe una cuenta con el número "${number}" (${duplicate.bank} - ${duplicate.name}).`, 'warning');
        return;
      }
    }

    const payload = { name, bank, number, account_id, active, currency: 'COP' };
    const btn = document.getElementById('btn-ba-save') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
    }

    try {
      const pb = _pb();
      if (editingBankAccountId) {
        await pb.update('bank_accounts', editingBankAccountId, payload);
        _showToast('Cuenta bancaria actualizada correctamente.', 'success');
      } else {
        await pb.create('bank_accounts', payload);
        _showToast('Cuenta bancaria registrada correctamente.', 'success');
      }
      (window as any).clearBankAccountForm();
      await (window as any).refreshBankAccountsList();
    } catch (err: any) {
      console.error('[BankAccount Save Error]', err);
      _showToast(`Error al guardar: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar';
      }
    }
  };

  (window as any).deleteBankAccountRecord = async (id: string) => {
    try {
      await _pb().get('bank_accounts', id);
    } catch (_) {
      _showToast('Esta cuenta ya no existe en el sistema.', 'warning');
      await (window as any).refreshBankAccountsList();
      return;
    }

    let movCount = 0;
    try {
      const safeId = _pb().escapeFilterValue(id);
      const mvs = await _pb().listAll('bank_movements', { filter: `bank_account_id="${safeId}"` });
      movCount = mvs.length;
    } catch (_) {}

    if (movCount > 0) {
      _showToast(`No es posible eliminar: esta cuenta bancaria contiene ${movCount} movimiento(s) contable(s) vinculados. Desactívala si prefieres no usarla.`, 'warning');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta bancaria? Esta acción no se puede deshacer.')) return;

    try {
      await _pb().delete('bank_accounts', id);
      _showToast('Cuenta bancaria eliminada con éxito.', 'success');
      await (window as any).refreshBankAccountsList();
    } catch (err: any) {
      _showToast(`Error al eliminar: ${err.message}`, 'error');
    }
  };

  (window as any).toggleBankAccountActiveRecord = async (id: string, currentActive: boolean) => {
    try {
      await _pb().update('bank_accounts', id, { active: !currentActive });
      _showToast('Estado de la cuenta actualizado.', 'success');
      await (window as any).refreshBankAccountsList();
    } catch (err: any) {
      _showToast(`Error al actualizar estado: ${err.message}`, 'error');
    }
  };

  (window as any).refreshBankAccountsList = async () => {
    const tableBody = document.querySelector('#bank-accounts-table tbody');
    if (!tableBody) return;

    try {
      const pb = _pb();
      bankAccountsList = await pb.listAll('bank_accounts', { sort: 'name', expand: 'account_id' });
      (window as any).renderBankAccountsRows(bankAccountsList);
    } catch (err: any) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error al cargar listado: ${err.message}</td></tr>`;
    }
  };

  (window as any).renderBankAccountsRows = (list: any[]) => {
    const tableBody = document.querySelector('#bank-accounts-table tbody');
    if (!tableBody) return;

    if (!list.length) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">No hay cuentas bancarias registradas.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map(b => `
      <tr class="hover:bg-gray-50/50 transition-colors duration-150 border-b border-gray-100">
        <td class="px-4 py-3 font-semibold text-gray-900">${_esc(b.bank)}</td>
        <td class="px-4 py-3 text-gray-600">${_esc(b.number)}</td>
        <td class="px-4 py-3 font-medium text-gray-700">${_esc(b.name)}</td>
        <td class="px-4 py-3 text-gray-500">
          ${b.expand?.account_id ? `<span class="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded mr-1">${b.expand.account_id.code}</span> ${_esc(b.expand.account_id.name)}` : '<span class="text-gray-400 font-normal">No asignada</span>'}
        </td>
        <td class="px-4 py-3 text-center">
          <button class="btn btn-outline py-0.5 px-2 text-[10px] ${b.active ? 'text-emerald-600 border-emerald-200 bg-emerald-50/20' : 'text-gray-400 border-gray-200'}"
                  onclick="window.toggleBankAccountActiveRecord('${b.id}', ${b.active})">
            ${b.active ? 'Activo' : 'Inactivo'}
          </button>
        </td>
        <td class="px-4 py-3 text-right space-x-1">
          <button class="btn btn-outline py-1 px-2 text-[10px] text-blue-600 border-blue-200 bg-blue-50/15"
                  onclick="window.editBankAccount('${b.id}')" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger py-1 px-2 text-[10px]"
                  onclick="window.deleteBankAccountRecord('${b.id}')" title="Eliminar">
            <i class="fas fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  (window as any).filterBankAccountsTable = () => {
    const queryInput = document.getElementById('ba-search') as HTMLInputElement | null;
    const query = queryInput?.value.trim().toLowerCase() || '';
    if (!query) {
      (window as any).renderBankAccountsRows(bankAccountsList);
      return;
    }

    const filtered = bankAccountsList.filter(b => 
      b.bank.toLowerCase().includes(query) || 
      b.number.toLowerCase().includes(query) || 
      b.name.toLowerCase().includes(query) ||
      (b.expand?.account_id && (b.expand.account_id.code.includes(query) || b.expand.account_id.name.toLowerCase().includes(query)))
    );

    (window as any).renderBankAccountsRows(filtered);
  };

  // Cargar Cuentas Contables y listado inicial
  try {
    const pb = _pb();
    const selectEl = document.getElementById('ba-account') as HTMLSelectElement | null;

    const accounts = await pb.listAll('accounts', { filter: 'level>=3', sort: 'code' });
    if (selectEl) {
      selectEl.innerHTML = '<option value="">Selecciona la cuenta PUC...</option>' + 
        accounts.map((a: any) => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('');
    }

    await (window as any).refreshBankAccountsList();
  } catch (err: any) {
    _showToast(`Error al cargar datos auxiliares: ${err.message}`, 'error');
  }
}

// Registro en el router
if ((window as any).registerModule) {
  (window as any).registerModule('recaudos', showRecaudosScreen);
  (window as any).registerModule('egresos', showEgresosScreen);
  (window as any).registerModule('cuentas-bancarias', showBankAccountsScreen);
}

// Exponer en window para compatibilidad global
(window as any).showRecaudosScreen = showRecaudosScreen;
(window as any).showEgresosScreen = showEgresosScreen;
(window as any).showBankAccountsScreen = showBankAccountsScreen;
(window as any).openRecaudoModal = openRecaudoModal;
(window as any).openPagoModal = openPagoModal;
(window as any).openTesoreriaConfigModal = openTesoreriaConfigModal;
(window as any).openEgresosConfigModal = openEgresosConfigModal;
(window as any)._toggleModalManualMode = _toggleModalManualMode;
(window as any)._saveTransaccionTeso = _saveTransaccionTeso;
(window as any)._updateMontoIndicator = _updateMontoIndicator;
(window as any)._changeTesoOrigen = _changeTesoOrigen;
(window as any)._toggleTesoRetenciones = _toggleTesoRetenciones;
(window as any)._applyDefaultRetenciones = _applyDefaultRetenciones;
(window as any)._recalculateTesoNeto = _recalculateTesoNeto;
(window as any)._handleRetInput = _handleRetInput;
(window as any)._handleAjustePesoInput = (window as any)._handleAjustePesoInput;
(window as any)._autoAjustarPeso = (window as any)._autoAjustarPeso;
(window as any)._updateTesoDocNumberPlaceholder = _updateTesoDocNumberPlaceholder;
