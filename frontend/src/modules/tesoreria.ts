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
  if (container) container.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">Busca un ${origen === 'comercial' ? 'tercero' : 'inmueble'} para visualizar su cartera abierta.</div>`;
  
  if (origen === 'comercial') {
    if (lbl) lbl.textContent = 'Tercero (Cliente / Proveedor)';
    if (input) input.placeholder = 'Buscar por documento o nombre...';
    _initTesoTerceroAutocomplete(
      'modal-rc-wrap', 'modal-rc-search', 'modal-rc-hidden', 'modal-rc-results',
      () => true,
      (t) => { _tesoCurrentThirdParty = t; _loadOpenItemsForModal(t.id, true); }
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
          _loadOpenItemsForModal(p.expand.owner_id.id, true, p.id);
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
        <button class="btn btn-primary" onclick="${btnAction}"><i class="fas fa-plus mr-2"></i>${btnText}</button>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-3 mb-4 flex gap-3 items-center flex-wrap">
        <input id="teso-filter-q" class="form-input flex-1 min-w-48" placeholder="Buscar número, tercero...">
        <input id="teso-filter-from" type="date" class="form-input" title="Desde">
        <input id="teso-filter-to" type="date" class="form-input" title="Hasta">
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
            </tr>
          </thead>
          <tbody>
            ${items.length === 0 ? `<tr><td colspan="5" class="text-center p-6 text-gray-500">No hay registros.</td></tr>` : items.map((i: any) => `
              <tr data-q="${_esc(i.number)} ${_esc(i.expand?.third_party_id?.name || '')}" data-date="${_esc(i.date)}">
                <td class="p-3 font-mono font-medium text-blue-800">${_esc(i.number)}</td>
                <td class="p-3 text-gray-600">${_esc(i.date).slice(0, 10)}</td>
                <td class="p-3 font-medium">${_esc(i.expand?.third_party_id?.name || 'N/A')}</td>
                <td class="p-3 text-gray-500 text-sm">${_esc(i.description)}</td>
                <td class="p-3 text-center"><span class="badge ${i.status==='active'?'badge-green':'badge-gray'}">${_esc(i.status)}</span></td>
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

  } catch (err: any) {
    c.innerHTML = `<div class="p-4 text-red-600">Error: ${err.message}</div>`;
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
    
    if (propertyId) {
       const invoices = await pb.listAll('ph_invoices', { filter: `property_id="${propertyId}" && status!="voided"` });
       invoices.forEach((inv: any) => allowedRefs.add(inv.number));
       if (allowedRefs.size === 0) {
         c.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El inmueble no presenta saldos pendientes para esta operación.</div>`;
         return;
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
      if (!l.expand?.account_id?.maneja_cruce) continue;
      const ref = (l.cross_doc_ref || '').trim();
      if (!ref) continue;
      
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

    _tesoCurrentOpenItems = [...docs.values()].map(d => {
      const netOpen = d.debit - d.credit;
      const saldo = isRecaudo ? netOpen : -netOpen;
      return { ...d, saldo, netOpen };
    }).filter(d => d.saldo > 0.01)
      .sort((a, b) => a.firstDate.localeCompare(b.firstDate));

    if (_tesoCurrentOpenItems.length === 0) {
      c.innerHTML = `<div class="p-4 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">El tercero no presenta saldos pendientes para esta operación.</div>`;
      return;
    }

    c.innerHTML = `
      <div class="overflow-x-auto border border-gray-200 rounded-lg mt-3 mb-4">
        <table class="w-full text-sm data-table">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-left">Documento</th>
              <th class="p-2 text-left">Concepto</th>
              <th class="p-2 text-right">Saldo Pendiente</th>
              <th class="p-2 text-right" style="width: 140px">Abono a Aplicar</th>
            </tr>
          </thead>
          <tbody>
            ${_tesoCurrentOpenItems.map(i => `
              <tr class="border-b border-gray-100 bg-white">
                <td class="p-2 font-medium">
                  ${_tesoCurrentOrigen === 'ph' && i.description 
                    ? `<span class="block">${_esc(i.description)}</span><span class="block text-xs text-gray-400">Fac: ${_esc(i.ref)} - ${_esc(i.firstDate)}</span>` 
                    : `${_esc(i.ref)} <div class="text-xs text-gray-400">${_esc(i.firstDate)}</div>`}
                </td>
                <td class="p-2 text-gray-600">${_esc(i.accountName)}</td>
                <td class="p-2 text-right font-semibold ${isRecaudo ? 'text-red-600' : 'text-blue-600'}">${_fmt(i.saldo)}</td>
                <td class="p-2 text-right">
                  <input type="number" min="0" max="${i.saldo}" class="form-input text-right w-full teso-abono-input" data-key="${i.key}" data-ref="${i.ref}" data-account="${i.accountId}" data-max="${i.saldo}" placeholder="0" disabled>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td colspan="2" class="p-2 text-right font-bold">Total a Distribuir:</td>
              <td class="p-2 text-right font-bold" id="teso-modal-total-abonos">$0</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
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
    document.getElementById('teso-modal-total-abonos')!.textContent = '$0';
  }
}

async function _saveTransaccionTeso(isRecaudo: boolean) {
  const montoInput = document.getElementById('teso-modal-monto') as HTMLInputElement;
  const modoSelect = document.getElementById('teso-modal-modo') as HTMLSelectElement;
  const ctaSelect = document.getElementById('teso-modal-cuenta') as HTMLSelectElement;
  
  const monto = Number(montoInput.value);
  const modo = modoSelect.value;
  const bankAccountId = ctaSelect.value;
  const cuentaOpt = ctaSelect.options[ctaSelect.selectedIndex];
  const cuentaId = cuentaOpt ? cuentaOpt.dataset.account : null;

  if (!cuentaId || !bankAccountId) { _showToast('Debes seleccionar un método de pago válido', 'warning'); return; }
  if (!_tesoCurrentThirdParty) { _showToast('Debes seleccionar un tercero', 'warning'); return; }

  // En modo manual sumamos de los inputs, en modo automático del input principal
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
    if (sum <= 0) { _showToast('Debes indicar al menos un abono manual mayor a 0', 'warning'); return; }
  } else {
    if (monto <= 0) { _showToast('El monto a aplicar debe ser mayor a 0', 'warning'); return; }
  }

  const btn = document.getElementById('btn-save-teso-tx') as HTMLButtonElement;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';

  const typeCode = isRecaudo ? 'RC' : 'CE';
  try {
    const pb = _pb();
    const typeRes = await pb.listAll('transaction_types', { filter: `code="${typeCode}"` });
    if (!typeRes.length) throw new Error(`Falta tipo ${typeCode}`);

    const params: any = {
      third_party_id: _tesoCurrentThirdParty.id,
      amount: modo === 'manual' ? distribucion.reduce((a,b)=>a+b.monto, 0) : monto,
      contrapartida_account_id: cuentaId // El pb_hooks lo usará para la línea de banco/caja
    };

    if (_tesoCurrentOrigen === 'ph' && _tesoCurrentPropertyId) {
      params.ph_property_id = _tesoCurrentPropertyId;
    }

    if (modo === 'manual') {
      params.distribucion = distribucion;
    } else {
      // Tomamos reglas del backend
      const sets = await pb.listAll('settings', { filter: `key="treasury_rules"` });
      let rules = { primeroVencido: true, primeroMora: true };
      if (sets.length && sets[0].value) {
        try { rules = JSON.parse(sets[0].value); } catch(_) {}
      }
      params.reglas = rules;
    }

    await pb.create('transactions', {
      tx_type_id: typeRes[0].id,
      number: `${typeCode}-${Date.now()}`, // En el mundo real se usaría consecutivo
      date: new Date().toISOString().slice(0, 10),
      third_party_id: _tesoCurrentThirdParty.id,
      description: `${isRecaudo ? 'Recaudo' : 'Pago'} vía Módulo Tesorería`,
      status: 'active',
      teso_mode: modo,
      teso_params: JSON.stringify(params)
    });

    _showToast(`${typeCode} generado correctamente.`, 'success');
    _closeModal();
    renderTesoListado(document.getElementById('teso-content')!, typeCode as any);

  } catch (err: any) {
    console.error(err);
    const detail = err.data ? JSON.stringify(err.data) : '';
    _showToast(`Error: ${err.message} ${detail}`, 'error');
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-check mr-2"></i>Registrar ${typeCode}`;
  }
}

async function openRecaudoModal() {
  _tesoCurrentOpenItems = [];
  _tesoCurrentThirdParty = null;
  
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await _pb().listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }
  const metodosPago = await _pb().listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });

  const bodyHtml = `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label" id="teso-lbl-tercero">Tercero (Cliente)</label>
          <div id="modal-rc-wrap" class="relative">
            <input id="modal-rc-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
            <input id="modal-rc-hidden" type="hidden" value="">
            <div id="modal-rc-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Método de Recaudo (Cuenta Destino)</label>
          <select id="teso-modal-cuenta" class="form-input">
            <option value="">— Seleccionar Método —</option>
            ${metodosPago.map((c:any) => `<option value="${c.id}" data-account="${c.account_id}">${_esc(c.name)} (${_esc(c.bank)} - ${_esc(c.number)})</option>`).join('')}
          </select>
        </div>
      </div>
      
      <div id="teso-modal-items-container" class="min-h-32 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center text-gray-400">
        Busca un tercero para visualizar su cartera abierta.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 border border-blue-100 rounded-lg">
        <div class="form-group mb-0">
          <label class="form-label">Monto Global a Recibir</label>
          <input id="teso-modal-monto" type="number" min="1" class="form-input text-lg font-bold text-green-700" placeholder="$">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-modal-modo" class="form-input" onchange="window._toggleModalManualMode()">
            <option value="auto">Automático (Según Reglas Config.)</option>
            <option value="manual">Manual (Distribuir en grilla)</option>
          </select>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(true)">
      <i class="fas fa-check mr-2"></i>Registrar RC
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
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tercero (Proveedor / Acreedor)</label>
          <div id="modal-eg-wrap" class="relative">
            <input id="modal-eg-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
            <input id="modal-eg-hidden" type="hidden" value="">
            <div id="modal-eg-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:50"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Método de Pago (Cuenta Origen)</label>
          <select id="teso-modal-cuenta" class="form-input">
            <option value="">— Seleccionar Método —</option>
            ${metodosPago.map((c:any) => `<option value="${c.id}" data-account="${c.account_id}">${_esc(c.name)} (${_esc(c.bank)} - ${_esc(c.number)})</option>`).join('')}
          </select>
        </div>
      </div>
      
      <div id="teso-modal-items-container" class="min-h-32 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center text-gray-400">
        Busca un proveedor para visualizar sus obligaciones pendientes.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50 p-4 border border-red-100 rounded-lg">
        <div class="form-group mb-0">
          <label class="form-label">Monto Global a Pagar</label>
          <input id="teso-modal-monto" type="number" min="1" class="form-input text-lg font-bold text-red-700" placeholder="$">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-modal-modo" class="form-input" onchange="window._toggleModalManualMode()">
            <option value="auto">Automático (Según Reglas Config.)</option>
            <option value="manual">Manual (Distribuir en grilla)</option>
          </select>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-danger" id="btn-save-teso-tx" onclick="window._saveTransaccionTeso(false)">
      <i class="fas fa-check mr-2"></i>Registrar Egreso
    </button>
  `;

  _openModal('Nuevo Comprobante de Egreso', bodyHtml, footerHtml, true);

  setTimeout(() => {
    _initTesoTerceroAutocomplete(
      'modal-eg-wrap', 'modal-eg-search', 'modal-eg-hidden', 'modal-eg-results',
      (t) => t.type === 'PROVEEDOR' || t.type === 'ACREEDOR',
      (t) => { _tesoCurrentThirdParty = t; _loadOpenItemsForModal(t.id, false); }
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
