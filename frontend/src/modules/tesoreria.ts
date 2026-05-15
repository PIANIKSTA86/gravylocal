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

// Helper — cliente REST propio de GRAVY (pb.list, pb.listAll, pb.create, etc.)
const _pb = (): any => (window as any).pb;

let tesoRecaudoThirdParty: ThirdParty | null = null;
let tesoRecaudoOpenItems: TxLine[] = [];
let tesoPagoProveedor: ThirdParty | null = null;
let tesoPagoObligaciones: TxLine[] = [];

// Cache de terceros cargados (patrón igual a compras.ts)
let _tesoAllTerceros: ThirdParty[] = [];

/** Muestra el tercero en el input: NIT — Nombre */
function _tesoFmtTercero(t: ThirdParty) {
  return `${t.doc_number || ''} — ${t.name || ''}`.trim();
}

/** Inicializa el autocomplete de tercero igual que en el modal de Compras */
function _initTesoTerceroAutocomplete(
  wrapId: string,
  inputId: string,
  hiddenId: string,
  resultsId: string,
  filterFn: (t: ThirdParty) => boolean,
  onSelect: (t: ThirdParty) => void
) {
  const wrap    = document.getElementById(wrapId);
  const input   = document.getElementById(inputId)   as HTMLInputElement;
  const hidden  = document.getElementById(hiddenId)  as HTMLInputElement;
  const results = document.getElementById(resultsId);
  if (!wrap || !input || !hidden || !results) return;

  const list = _tesoAllTerceros.filter(filterFn);

  const render = (q = '') => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const data = !terms.length
      ? list.slice(0, 50)
      : list.filter(t => {
          const hay = `${t.doc_number || ''} ${t.name || ''}`.toLowerCase();
          return terms.every(w => hay.includes(w));
        }).slice(0, 50);
    if (!data.length) {
      results.innerHTML = '<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';
      return;
    }
    results.innerHTML = data.map(t =>
      `<button type="button" data-teso-id="${t.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-blue-50" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
        <div style="font-weight:600">${t.doc_number || 'SIN DOC'}</div>
        <div style="font-size:12px;color:#6B7280">${t.name || ''}</div>
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
    input.value  = found ? _tesoFmtTercero(found) : '';
    results.style.display = 'none';
    if (found) onSelect(found);
  };
  const outsideHandler = (ev: Event) => {
    if (!wrap.contains(ev.target as Node)) results.style.display = 'none';
  };
  setTimeout(() => document.addEventListener('click', outsideHandler), 0);
}

// ─── RECAUDOS ────────────────────────────────────────────────
async function renderTesoRecaudos(c: HTMLElement) {
  // Precargar terceros en memoria si no se han cargado aún
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await _pb().listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }

  c.innerHTML = `
    <div class="form-group mb-4">
      <label class="form-label">Tercero (Cliente / Propietario)</label>
      <div id="teso-rec-wrap" class="relative">
        <input id="teso-rec-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
        <input id="teso-rec-hidden" type="hidden" value="">
        <div id="teso-rec-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
      </div>
    </div>
    <div id="teso-open-items"></div>
    <div id="teso-result"></div>
  `;

  _initTesoTerceroAutocomplete(
    'teso-rec-wrap', 'teso-rec-search', 'teso-rec-hidden', 'teso-rec-results',
    () => true,  // todos los terceros activos
    (t) => { tesoRecaudoThirdParty = t; cargarPartidaRecaudo(t.id); }
  );
}

async function cargarPartidaRecaudo(thirdPartyId: string) {
  document.getElementById('teso-open-items')!.innerHTML =
    '<div class="p-4 text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Cargando partidas...</div>';
  const pb = _pb();
  const lines = await pb.listAll('tx_lines', {
    filter: `third_party_id="${thirdPartyId}" && debit > credit`,
    expand: 'tx_id,account_id',
  });
  tesoRecaudoOpenItems = lines as TxLine[];
  renderTesoRecaudoOpenItems();
}

// Mantener compatibilidad con referencias anteriores
async function buscarTercero() {
  const hidden = document.getElementById('teso-rec-hidden') as HTMLInputElement | null;
  if (hidden?.value) await cargarPartidaRecaudo(hidden.value);
}

function renderTesoRecaudoOpenItems() {
  const div = document.getElementById('teso-open-items')!;
  if (!tesoRecaudoOpenItems.length) {
    div.innerHTML = '<div class="text-gray-500 p-4 bg-gray-50 rounded">No hay partidas abiertas para este tercero.</div>';
    return;
  }
  div.innerHTML = `
    <h3 class="font-semibold text-lg mb-2">Cuentas por Cobrar — ${tesoRecaudoThirdParty?.name}</h3>
    <div class="overflow-x-auto mb-4 border rounded">
      <table class="data-table w-full text-sm">
        <thead class="bg-gray-100"><tr>
          <th class="p-2">Comprobante</th><th class="p-2">Fecha</th>
          <th class="p-2">Concepto</th><th class="p-2 text-right">Saldo</th>
        </tr></thead>
        <tbody>
          ${tesoRecaudoOpenItems.map(i => `
            <tr class="border-b">
              <td class="p-2 font-medium">${i.expand?.tx_id?.number || 'N/A'}</td>
              <td class="p-2 text-gray-500">${(i.expand?.tx_id?.date || '').slice(0,10)}</td>
              <td class="p-2">${i.expand?.account_id?.name || i.description || ''}</td>
              <td class="p-2 text-right font-semibold text-red-600">$${(i.debit - i.credit).toLocaleString('es-CO')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="bg-gray-50 p-4 rounded border">
      <h4 class="font-semibold mb-3">Aplicar Recaudo</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Monto Total</label>
          <input id="teso-monto" class="form-input text-lg font-bold text-green-700" type="number" min="1" placeholder="$">
        </div>
        <div class="form-group">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-modo" class="form-input">
            <option value="auto">Automático (FIFO)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>
      <div id="teso-manual-form" style="display:none" class="mb-4"></div>
      <button class="btn btn-primary" id="teso-aplicar">
        <i class="fas fa-check-circle mr-2"></i>Registrar Recibo de Caja (RC)
      </button>
    </div>
  `;
  document.getElementById('teso-aplicar')!.onclick = prepararTesoRecaudoAbono;
  document.getElementById('teso-modo')!.onchange = toggleTesoRecaudoManualForm;
}

function toggleTesoRecaudoManualForm() {
  const modo = (document.getElementById('teso-modo') as HTMLSelectElement).value;
  const div = document.getElementById('teso-manual-form')!;
  if (modo === 'manual') {
    div.style.display = '';
    div.innerHTML = `<div class="space-y-2">
      ${tesoRecaudoOpenItems.map(i => `
        <div class="flex items-center justify-between p-2 bg-white border rounded">
          <label class="text-sm font-medium">${i.expand?.tx_id?.number} — ${i.expand?.account_id?.name || i.description} (Pendiente: $${(i.debit - i.credit).toLocaleString('es-CO')})</label>
          <input type="number" min="0" max="${i.debit - i.credit}" class="form-input w-32 text-right teso-abono-item" data-id="${i.id}" placeholder="0">
        </div>`).join('')}
    </div>`;
  } else {
    div.style.display = 'none';
    div.innerHTML = '';
  }
}

async function prepararTesoRecaudoAbono() {
  const monto = Number((document.getElementById('teso-monto') as HTMLInputElement).value);
  const modo = (document.getElementById('teso-modo') as HTMLSelectElement).value;
  if (!monto || monto <= 0) return;
  const pb = _pb();
  let params: any = { third_party_id: tesoRecaudoThirdParty!.id, amount: monto };
  if (modo === 'manual') {
    const distribucion: any[] = [];
    document.querySelectorAll('.teso-abono-item').forEach(el => {
      const val = Number((el as HTMLInputElement).value);
      if (val > 0) distribucion.push({ tx_line_id: (el as HTMLElement).dataset.id, monto: val });
    });
    params.distribucion = distribucion;
  } else {
    params.reglas = { prioridadConceptos: [], primeroVencido: true, primeroMora: true };
  }
  try {
    const rcs = await pb.list('transaction_types', { filter: 'code="RC"', perPage: 1 });
    if (!rcs.items.length) throw new Error('No existe el tipo de transacción RC.');
    await pb.create('transactions', {
      tx_type_id: rcs.items[0].id,
      number: `RC-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      third_party_id: tesoRecaudoThirdParty!.id,
      description: 'Recaudo desde Tesorería',
      status: 'active',
      teso_mode: modo,
      teso_params: JSON.stringify(params),
    });
    document.getElementById('teso-result')!.innerHTML = '<div class="mt-4 p-3 bg-green-100 text-green-800 rounded font-semibold"><i class="fas fa-check mr-2"></i>Recibo de Caja generado y abonos aplicados.</div>';
    buscarTercero();
  } catch (err: any) {
    document.getElementById('teso-result')!.innerHTML = `<div class="mt-4 p-3 bg-red-100 text-red-800 rounded font-semibold"><i class="fas fa-times mr-2"></i>Error: ${err.message}</div>`;
  }
}

// ─── PAGOS ───────────────────────────────────────────────────
async function renderTesoPagos(c: HTMLElement) {
  // Precargar terceros en memoria si no se han cargado aún
  if (!_tesoAllTerceros.length) {
    _tesoAllTerceros = await _pb().listAll('third_parties', { filter: 'active=true', sort: 'name' });
  }

  c.innerHTML = `
    <div class="form-group mb-4">
      <label class="form-label">Proveedor / Acreedor</label>
      <div id="teso-pago-wrap" class="relative">
        <input id="teso-pago-search" class="form-input" autocomplete="off" placeholder="Buscar por documento o nombre...">
        <input id="teso-pago-hidden" type="hidden" value="">
        <div id="teso-pago-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:240px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
      </div>
    </div>
    <div id="teso-prov-items"></div>
    <div id="teso-pago-result"></div>
  `;

  _initTesoTerceroAutocomplete(
    'teso-pago-wrap', 'teso-pago-search', 'teso-pago-hidden', 'teso-pago-results',
    (t) => t.type === 'PROVEEDOR' || t.type === 'ACREEDOR',
    (t) => { tesoPagoProveedor = t; cargarObligacionesPago(t.id); }
  );
}

async function cargarObligacionesPago(thirdPartyId: string) {
  document.getElementById('teso-prov-items')!.innerHTML =
    '<div class="p-4 text-gray-500"><i class="fas fa-circle-notch fa-spin mr-2"></i>Cargando obligaciones...</div>';
  const pb = _pb();
  const lines = await pb.listAll('tx_lines', {
    filter: `third_party_id="${thirdPartyId}" && credit > debit`,
    expand: 'tx_id,account_id',
  });
  tesoPagoObligaciones = lines as TxLine[];
  renderTesoPagoObligaciones();
}

// Mantener compatibilidad con referencias anteriores
async function buscarProveedor() {
  const hidden = document.getElementById('teso-pago-hidden') as HTMLInputElement | null;
  if (hidden?.value) await cargarObligacionesPago(hidden.value);
}

function renderTesoPagoObligaciones() {
  const div = document.getElementById('teso-prov-items')!;
  if (!tesoPagoObligaciones.length) {
    div.innerHTML = '<div class="text-gray-500 p-4 bg-gray-50 rounded">No hay obligaciones pendientes.</div>';
    return;
  }
  div.innerHTML = `
    <h3 class="font-semibold text-lg mb-2">Cuentas por Pagar — ${tesoPagoProveedor?.name}</h3>
    <div class="overflow-x-auto mb-4 border rounded">
      <table class="data-table w-full text-sm">
        <thead class="bg-gray-100"><tr>
          <th class="p-2">Comprobante</th><th class="p-2">Fecha</th>
          <th class="p-2">Concepto</th><th class="p-2 text-right">Saldo</th>
        </tr></thead>
        <tbody>
          ${tesoPagoObligaciones.map(i => `
            <tr class="border-b">
              <td class="p-2 font-medium">${i.expand?.tx_id?.number || 'N/A'}</td>
              <td class="p-2 text-gray-500">${(i.expand?.tx_id?.date || '').slice(0,10)}</td>
              <td class="p-2">${i.expand?.account_id?.name || i.description || ''}</td>
              <td class="p-2 text-right font-semibold text-red-600">$${(i.credit - i.debit).toLocaleString('es-CO')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="bg-gray-50 p-4 rounded border">
      <h4 class="font-semibold mb-3">Aplicar Pago</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Monto Total</label>
          <input id="teso-pago-monto" class="form-input text-lg font-bold text-red-700" type="number" min="1" placeholder="$">
        </div>
        <div class="form-group">
          <label class="form-label">Modo de Aplicación</label>
          <select id="teso-pago-modo" class="form-input">
            <option value="auto">Automático (FIFO)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>
      <div id="teso-pago-manual-form" style="display:none" class="mb-4"></div>
      <button class="btn btn-primary" id="teso-aplicar-pago">
        <i class="fas fa-check-circle mr-2"></i>Registrar Comprobante de Egreso (EG)
      </button>
    </div>
  `;
  document.getElementById('teso-aplicar-pago')!.onclick = prepararTesoPago;
  document.getElementById('teso-pago-modo')!.onchange = toggleTesoPagoManualForm;
}

function toggleTesoPagoManualForm() {
  const modo = (document.getElementById('teso-pago-modo') as HTMLSelectElement).value;
  const div = document.getElementById('teso-pago-manual-form')!;
  if (modo === 'manual') {
    div.style.display = '';
    div.innerHTML = `<div class="space-y-2">
      ${tesoPagoObligaciones.map(i => `
        <div class="flex items-center justify-between p-2 bg-white border rounded">
          <label class="text-sm font-medium">${i.expand?.tx_id?.number} — ${i.expand?.account_id?.name || i.description} (Pendiente: $${(i.credit - i.debit).toLocaleString('es-CO')})</label>
          <input type="number" min="0" max="${i.credit - i.debit}" class="form-input w-32 text-right teso-pago-item" data-id="${i.id}" placeholder="0">
        </div>`).join('')}
    </div>`;
  } else {
    div.style.display = 'none';
    div.innerHTML = '';
  }
}

async function prepararTesoPago() {
  const monto = Number((document.getElementById('teso-pago-monto') as HTMLInputElement).value);
  const modo = (document.getElementById('teso-pago-modo') as HTMLSelectElement).value;
  if (!monto || monto <= 0) return;
  const pb = _pb();
  let params: any = { third_party_id: tesoPagoProveedor!.id, amount: monto };
  if (modo === 'manual') {
    const distribucion: any[] = [];
    document.querySelectorAll('.teso-pago-item').forEach(el => {
      const val = Number((el as HTMLInputElement).value);
      if (val > 0) distribucion.push({ tx_line_id: (el as HTMLElement).dataset.id, monto: val });
    });
    params.distribucion = distribucion;
  } else {
    params.reglas = { prioridadConceptos: [], primeroVencido: true, primeroMora: true };
  }
  try {
    const egs = await pb.list('transaction_types', { filter: 'code="EG"', perPage: 1 });
    if (!egs.items.length) throw new Error('No existe el tipo de transacción EG.');
    await pb.create('transactions', {
      tx_type_id: egs.items[0].id,
      number: `EG-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      third_party_id: tesoPagoProveedor!.id,
      description: 'Pago desde Tesorería',
      status: 'active',
      teso_mode: modo,
      teso_params: JSON.stringify(params),
    });
    document.getElementById('teso-pago-result')!.innerHTML = '<div class="mt-4 p-3 bg-green-100 text-green-800 rounded font-semibold"><i class="fas fa-check mr-2"></i>Egreso generado y pagos aplicados.</div>';
    buscarProveedor();
  } catch (err: any) {
    document.getElementById('teso-pago-result')!.innerHTML = `<div class="mt-4 p-3 bg-red-100 text-red-800 rounded font-semibold"><i class="fas fa-times mr-2"></i>Error: ${err.message}</div>`;
  }
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
        <div class="p-6 bg-green-50 border border-green-100 rounded-xl shadow-sm">
          <div class="text-sm font-semibold text-green-700 mb-1">Total Cuentas por Cobrar</div>
          <div class="text-4xl font-bold text-green-900">$${saldoCxC.toLocaleString('es-CO')}</div>
          <div class="text-sm text-gray-500 mt-2">${cxcRes.length} partidas abiertas</div>
        </div>
        <div class="p-6 bg-red-50 border border-red-100 rounded-xl shadow-sm">
          <div class="text-sm font-semibold text-red-700 mb-1">Total Cuentas por Pagar</div>
          <div class="text-4xl font-bold text-red-900">$${saldoCxP.toLocaleString('es-CO')}</div>
          <div class="text-sm text-gray-500 mt-2">${cxpRes.length} obligaciones pendientes</div>
        </div>
      </div>
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3">
        <i class="fas fa-info-circle mt-1"></i>
        <div>
          <p class="font-semibold mb-1">Motor de Tesorería Automática</p>
          <p>Al registrar un Recaudo (RC) o Pago (EG), el motor en el backend aplica los abonos automáticamente según las reglas configuradas (FIFO), o en modo manual según la distribución que selecciones en el formulario.</p>
        </div>
      </div>`;
  } catch (err: any) {
    c.innerHTML = `<div class="text-red-500 p-4">Error cargando dashboard: ${err.message}</div>`;
  }
}

// ─── CONFIGURACIÓN ───────────────────────────────────────────
async function renderTesoConfig(c: HTMLElement) {
  try {
    const pb = _pb();
    const settings = await pb.list('treasury_settings', { perPage: 1 });
    let rule: any = { primeroVencido: true, primeroMora: true };
    if (settings.items.length && settings.items[0].auto_rules) {
      try { rule = JSON.parse(settings.items[0].auto_rules); } catch (_) {}
    }
    c.innerHTML = `
      <div class="max-w-2xl">
        <h3 class="text-lg font-semibold mb-4">Configuración de Reglas Automáticas</h3>
        <div class="form-group mb-4">
          <label class="form-label flex items-center gap-2">
            <input type="checkbox" id="teso-cfg-mora" ${rule.primeroMora ? 'checked' : ''} class="w-4 h-4">
            Priorizar facturas en mora
          </label>
        </div>
        <div class="form-group mb-6">
          <label class="form-label flex items-center gap-2">
            <input type="checkbox" id="teso-cfg-vencido" ${rule.primeroVencido ? 'checked' : ''} class="w-4 h-4">
            Priorizar facturas más antiguas (FIFO)
          </label>
        </div>
        <button class="btn btn-primary" id="teso-cfg-save">Guardar Configuración</button>
        <div id="teso-cfg-result" class="mt-4"></div>
      </div>`;
    document.getElementById('teso-cfg-save')!.onclick = async () => {
      const pMora = (document.getElementById('teso-cfg-mora') as HTMLInputElement).checked;
      const pVen = (document.getElementById('teso-cfg-vencido') as HTMLInputElement).checked;
      const newRules = { prioridadConceptos: [], primeroVencido: pVen, primeroMora: pMora };
      try {
        if (settings.items.length) {
          await pb.update('treasury_settings', settings.items[0].id, { auto_rules: JSON.stringify(newRules) });
        } else {
          await pb.create('treasury_settings', { auto_rules: JSON.stringify(newRules) });
        }
        document.getElementById('teso-cfg-result')!.innerHTML = '<span class="text-green-600 font-semibold"><i class="fas fa-check mr-2"></i>Guardado correctamente</span>';
      } catch (err: any) {
        document.getElementById('teso-cfg-result')!.innerHTML = `<span class="text-red-600 font-semibold"><i class="fas fa-times mr-2"></i>Error: ${err.message}</span>`;
      }
    };
  } catch (err: any) {
    c.innerHTML = `<div class="text-red-500 p-4">Error cargando configuración: ${err.message}</div>`;
  }
}

// ─── ESTRUCTURA PRINCIPAL ─────────────────────────────────────
function showTesoreriaScreen(container: HTMLElement) {
  const c = container || document.getElementById('page-content');
  if (!c) return;
  c.innerHTML = `
    <div class="page-header flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Tesorería Automática</h2>
        <p class="text-gray-500 text-sm mt-1">Gestión de cartera, recaudos, pagos y reglas contables.</p>
      </div>
      <button class="btn btn-outline" id="teso-btn-config"><i class="fas fa-cog mr-2"></i>Configuración</button>
    </div>
    <div class="flex gap-2 mb-6 border-b border-gray-200 pb-2">
      <button class="tab-btn" id="teso-tab-dashboard">Dashboard</button>
      <button class="tab-btn" id="teso-tab-recaudos">Recaudos (CxC)</button>
      <button class="tab-btn" id="teso-tab-pagos">Pagos (CxP)</button>
      <button class="tab-btn" id="teso-tab-config">Configuración</button>
    </div>
    <div id="teso-content" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-96"></div>`;

  document.getElementById('teso-tab-dashboard')!.onclick = () => setTesoTab2('dashboard');
  document.getElementById('teso-tab-recaudos')!.onclick  = () => setTesoTab2('recaudos');
  document.getElementById('teso-tab-pagos')!.onclick     = () => setTesoTab2('pagos');
  document.getElementById('teso-tab-config')!.onclick    = () => setTesoTab2('config');
  document.getElementById('teso-btn-config')!.onclick    = () => setTesoTab2('config');
  setTesoTab2('dashboard');
}

function setTesoTab2(tab: string) {
  ['dashboard','recaudos','pagos','config'].forEach(t => {
    const el = document.getElementById('teso-tab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  const c = document.getElementById('teso-content')!;
  c.innerHTML = '<div class="flex justify-center p-10"><i class="fas fa-circle-notch fa-spin text-2xl text-gray-400"></i></div>';
  if (tab === 'dashboard') renderTesoDashboard();
  if (tab === 'recaudos')  renderTesoRecaudos(c);
  if (tab === 'pagos')     renderTesoPagos(c);
  if (tab === 'config')    renderTesoConfig(c);
}

// Registro en el router
if ((window as any).registerModule) {
  (window as any).registerModule('tesoreria', showTesoreriaScreen);
}

// Exponer en window para compatibilidad con el router de GRAVY
(window as any).showTesoreriaScreen        = showTesoreriaScreen;
(window as any).setTesoTab2                = setTesoTab2;
(window as any).renderTesoDashboard        = renderTesoDashboard;
(window as any).renderTesoRecaudos         = renderTesoRecaudos;
(window as any).renderTesoPagos            = renderTesoPagos;
(window as any).renderTesoConfig           = renderTesoConfig;
(window as any).buscarTercero              = buscarTercero;
(window as any).buscarProveedor            = buscarProveedor;
(window as any).prepararTesoPago           = prepararTesoPago;
(window as any).prepararTesoRecaudoAbono   = prepararTesoRecaudoAbono;
(window as any).toggleTesoPagoManualForm   = toggleTesoPagoManualForm;
(window as any).toggleTesoRecaudoManualForm = toggleTesoRecaudoManualForm;
