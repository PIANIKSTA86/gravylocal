/**
 * GRAVY v2.0 ? conciliacion.js
 */
'use strict';

let _selectedBankId = '';
let _filterFrom = '';
let _filterTo = '';
let _isInitialized = false;

async function renderConciliacion(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo de conciliación bancaria...</div>`;
  try {
    const [bankAccounts, accounts] = await Promise.all([
      pb.listAll('bank_accounts', { sort: 'name', expand: 'account_id,third_party_id,default_tx_type_id' }),
      API.getAccounts(true),
    ]);

    if (!_isInitialized) {
      if (bankAccounts.length > 0) {
        _selectedBankId = bankAccounts[0].id;
      }
      _filterFrom = todayStr().slice(0, 8) + '01';
      _filterTo = todayStr();
      _isInitialized = true;
    }

    let movements: any[] = []; // Movimientos de Extracto Bancario
    let txLines: any[] = [];   // Movimientos de Libro Auxiliar Contable
    let leftFilter = 'all';    // 'all' | 'pending' | 'reconciled'
    let rightFilter = 'all';   // 'all' | 'pending' | 'reconciled'

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-xl font-bold flex items-center gap-2" style="color:#0D2137">
            <i class="fas fa-scale-balanced text-blue-600"></i> Conciliación Bancaria Dual
          </h3>
          <p class="text-sm text-gray-500">Cruce dinámico lado a lado entre el Libro Auxiliar Contable y el Extracto del Banco.</p>
        </div>
        ${can('canWrite') ? `
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-secondary" id="btn-manage-banks"><i class="fas fa-building-columns"></i> Cuentas Bancarias</button>
          <button class="btn btn-secondary" id="btn-config-recon-mapping" title="Configurar Cuentas PUC de Ajuste y Comprobante"><i class="fas fa-gear"></i></button>
          <button class="btn btn-secondary" id="btn-import-ext"><i class="fas fa-file-import"></i> Importar Extracto</button>
          <button class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus"></i> Nuevo Movimiento</button>
        </div>` : ''}
      </div>

      <!-- Barra de Filtros y Controles -->
      <div class="bg-white rounded-2xl border p-4 mb-4 shadow-sm" style="border-color:#E5E7EB">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div class="md:col-span-3 form-group mb-0">
            <label class="text-xs font-bold text-gray-600 block mb-1">Cuenta Bancaria</label>
            <select id="bank-filter" class="form-input w-full font-medium">
              <option value="">Todas las cuentas bancarias</option>
              ${bankAccounts.map(b => `<option value="${esc(b.id)}" ${b.id === _selectedBankId ? 'selected' : ''}>${esc(b.bank)} - ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
            </select>
          </div>
          <div class="md:col-span-2 form-group mb-0">
            <label class="text-xs font-bold text-gray-600 block mb-1">Desde</label>
            <input id="filter-from" type="date" class="form-input w-full text-xs" value="${esc(_filterFrom)}">
          </div>
          <div class="md:col-span-2 form-group mb-0">
            <label class="text-xs font-bold text-gray-600 block mb-1">Hasta</label>
            <input id="filter-to" type="date" class="form-input w-full text-xs" value="${esc(_filterTo)}">
          </div>
          <div class="md:col-span-2 mb-0">
            <button class="btn btn-primary w-full" id="btn-search-movs" style="height:38px; display:flex; align-items:center; justify-content:center; gap:6px;">
              <i class="fas fa-search"></i> Cargar Datos
            </button>
          </div>
          <div class="md:col-span-3 form-group mb-0">
            <label class="text-xs font-bold text-gray-600 block mb-1">Filtro rápido en pantalla</label>
            <input id="mov-q" class="form-input w-full text-xs" placeholder="Buscar por concepto, comprobante...">
          </div>
        </div>

        ${can('canWrite') ? `
        <div class="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t" style="border-color:#F3F4F6">
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-secondary" id="btn-suggest-recon" style="background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE">
              <i class="fas fa-wand-magic-sparkles mr-1"></i> Sugerir Conciliación Automatizada
            </button>
            <button class="btn btn-secondary" id="btn-gen-adjustment-note" style="background:#F0FDF4;color:#15803D;border-color:#BBF7D0">
              <i class="fas fa-file-invoice-dollar mr-1"></i> Generar Nota de Ajuste (<span id="unrecon-count">0</span>)
            </button>
            <button class="btn btn-primary" id="btn-pair-selected" disabled>
              <i class="fas fa-link mr-1"></i> Conciliar Pareja Seleccionada
            </button>
            <button class="btn btn-secondary" id="btn-close-recon" style="background:#ECFDF5;color:#047857;border-color:#A7F3D0" title="Cerrar período y certificar conciliación formal">
              <i class="fas fa-lock mr-1"></i> Cerrar Conciliación
            </button>
            <button class="btn btn-secondary" id="btn-history-recon" style="background:#F8FAFC;color:#475569;border-color:#CBD5E1" title="Ver actas y certificados emitidos">
              <i class="fas fa-certificate mr-1"></i> Actas / Certificados
            </button>
            <button class="btn btn-outline" id="btn-clear-movs" style="border-color:#FECACA;color:#DC2626">
              <i class="fas fa-trash-can mr-1"></i> Limpiar Extracto
            </button>
          </div>
          <div class="text-xs text-gray-500 font-medium">
            <i class="fas fa-info-circle text-blue-500 mr-1"></i> Marca 1 movimiento contable y 1 del extracto para emparejar manualmente.
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Banner de Período con Conciliación Cerrada -->
      <div id="recon-closed-banner" style="display:none" class="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      </div>

      <!-- Tarjetas de Métricas KPI -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div class="bg-white rounded-xl border p-3 border-blue-100 shadow-sm">
          <div class="text-xs font-semibold text-blue-600 uppercase tracking-wider">Libro Auxiliar Contable</div>
          <div class="text-lg font-bold text-gray-800 mt-1" id="kpi-aux-net">$0</div>
          <div class="text-xs text-gray-500 mt-0.5" id="kpi-aux-counts">0 movimientos</div>
        </div>

        <div class="bg-white rounded-xl border p-3 border-emerald-100 shadow-sm">
          <div class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Extracto Bancario</div>
          <div class="text-lg font-bold text-gray-800 mt-1" id="kpi-bank-net">$0</div>
          <div class="text-xs text-gray-500 mt-0.5" id="kpi-bank-counts">0 movimientos</div>
        </div>

        <div class="bg-white rounded-xl border p-3 border-amber-100 shadow-sm">
          <div class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Diferencia de Conciliación</div>
          <div class="text-lg font-bold text-gray-800 mt-1" id="kpi-diff">$0</div>
          <div class="text-xs text-gray-500 mt-0.5">Delta de saldos</div>
        </div>

        <div class="bg-white rounded-xl border p-3 border-purple-100 shadow-sm">
          <div class="text-xs font-semibold text-purple-600 uppercase tracking-wider">Avance de Cruce</div>
          <div class="text-lg font-bold text-purple-700 mt-1" id="kpi-progress">0%</div>
          <div class="text-xs text-gray-500 mt-0.5" id="kpi-match-counts">0 concilidados</div>
        </div>
      </div>

      <!-- DUAL PANEL SIDE-BY-SIDE GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- COLUMNA IZQUIERDA: LIBRO AUXILIAR CONTABLE -->
        <div class="bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm" style="border-color:#E5E7EB">
          <div class="p-3 bg-gray-50 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <h4 class="font-bold text-sm text-gray-800">1. Libro Auxiliar (Software)</h4>
              <span class="badge badge-blue text-xs" id="badge-aux-count">0</span>
            </div>
            <div class="flex gap-1 text-xs">
              <button class="px-2 py-1 rounded font-semibold btn-tab-left bg-blue-600 text-white" data-tab="all">Todos</button>
              <button class="px-2 py-1 rounded font-semibold btn-tab-left bg-gray-100 text-gray-600" data-tab="pending">Pendientes</button>
              <button class="px-2 py-1 rounded font-semibold btn-tab-left bg-gray-100 text-gray-600" data-tab="reconciled">Conciliados</button>
            </div>
          </div>

          <div class="overflow-x-auto overflow-y-auto" style="max-height: calc(100vh - 360px); min-height: 380px;">
            <table class="data-table w-full text-xs" id="table-aux">
              <thead class="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th style="width:30px"></th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Detalle / Tercero</th>
                  <th class="text-right">Débito ($)</th>
                  <th class="text-right">Crédito ($)</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colspan="7" class="text-center py-10 text-gray-400">Cargando libro auxiliar...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- COLUMNA DERECHA: EXTRACTO BANCARIO -->
        <div class="bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm" style="border-color:#E5E7EB">
          <div class="p-3 bg-gray-50 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <h4 class="font-bold text-sm text-gray-800">2. Extracto Bancario (Banco)</h4>
              <span class="badge badge-green text-xs" id="badge-bank-count">0</span>
            </div>
            <div class="flex gap-1 text-xs">
              <button class="px-2 py-1 rounded font-semibold btn-tab-right bg-emerald-600 text-white" data-tab="all">Todos</button>
              <button class="px-2 py-1 rounded font-semibold btn-tab-right bg-gray-100 text-gray-600" data-tab="pending">Pendientes</button>
              <button class="px-2 py-1 rounded font-semibold btn-tab-right bg-gray-100 text-gray-600" data-tab="reconciled">Conciliados</button>
            </div>
          </div>

          <div class="overflow-x-auto overflow-y-auto" style="max-height: calc(100vh - 360px); min-height: 380px;">
            <table class="data-table w-full text-xs" id="table-bank">
              <thead class="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th style="width:30px"></th>
                  <th>Fecha</th>
                  <th>Descripción / Concepto</th>
                  <th class="text-right">Ingreso ($)</th>
                  <th class="text-right">Egreso ($)</th>
                  <th class="text-center">Estado</th>
                  <th style="width:40px"></th>
                </tr>
              </thead>
              <tbody>
                <tr><td colspan="7" class="text-center py-10 text-gray-400">Cargando extracto bancario...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Mapas de vinculo pareado
    const movByTxLineId = new Map<string, any>();
    const txLineByMovId = new Map<string, any>();

    const updatePairingButtonState = () => {
      const selectedLeft = $$('#table-aux tbody .check-left:checked');
      const selectedRight = $$('#table-bank tbody .check-right:checked');
      const btnPair = $('#btn-pair-selected') as HTMLButtonElement | null;
      if (btnPair) {
        const canPair = selectedLeft.length === 1 && selectedRight.length === 1;
        btnPair.disabled = !canPair;
        btnPair.innerHTML = `<i class="fas fa-link mr-1"></i> Conciliar Pareja (${selectedLeft.length}:${selectedRight.length})`;
      }
    };

    const renderLeftTable = () => {
      const tbody = $('#table-aux tbody');
      if (!tbody) return;

      const q = getInputVal('mov-q').toLowerCase();
      const filtered = txLines.filter(l => {
        const isReconciled = movByTxLineId.has(l.id);
        if (leftFilter === 'pending' && isReconciled) return false;
        if (leftFilter === 'reconciled' && !isReconciled) return false;
        if (q) {
          const comp = (l.expand?.tx_id?.number || '').toLowerCase();
          const det = (l.description || '').toLowerCase();
          const third = (l.expand?.third_party_id?.name || '').toLowerCase();
          if (!comp.includes(q) && !det.includes(q) && !third.includes(q)) return false;
        }
        return true;
      });

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400">No hay movimientos contables.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(l => {
        const date = l.expand?.tx_id?.date || '';
        const comp = l.expand?.tx_id?.number || 'Comp';
        const third = l.expand?.third_party_id?.name || '';
        const det = l.description || third || 'Sin detalle';
        const partnerMov = movByTxLineId.get(l.id);
        const isReconciled = !!partnerMov;

        const rowBgClass = isReconciled 
          ? 'bg-emerald-50/50 hover:bg-emerald-100/60' 
          : 'bg-amber-50/40 hover:bg-amber-100/50';

        return `
          <tr class="${rowBgClass} transition-colors cursor-pointer" data-tx-line-id="${esc(l.id)}" data-partner-mov-id="${partnerMov ? esc(partnerMov.id) : ''}">
            <td><input type="checkbox" class="check-left" value="${esc(l.id)}"></td>
            <td class="whitespace-nowrap font-medium">${esc(date.slice(0, 10))}</td>
            <td><span class="font-bold text-blue-700">${esc(comp)}</span></td>
            <td title="${esc(det)}"><div class="truncate max-w-[180px]">${esc(det)}</div></td>
            <td class="text-right font-medium text-emerald-700">${l.debit > 0 ? fmt(l.debit) : '-'}</td>
            <td class="text-right font-medium text-red-700">${l.credit > 0 ? fmt(l.credit) : '-'}</td>
            <td class="text-center">
              ${isReconciled 
                ? `<span class="badge badge-green" title="Conciliado con extracto"><i class="fas fa-check-double mr-1"></i>Conciliado</span>` 
                : `<span class="badge badge-orange" title="Pendiente de cruce contable">Pendiente</span>`}
            </td>
          </tr>
        `;
      }).join('');

      $$('#table-aux tbody .check-left').forEach(cb => cb.addEventListener('change', updatePairingButtonState));
    };

    const renderRightTable = () => {
      const tbody = $('#table-bank tbody');
      if (!tbody) return;

      const q = getInputVal('mov-q').toLowerCase();
      const filtered = movements.filter(m => {
        const isReconciled = m.reconciled || txLineByMovId.has(m.id);
        if (rightFilter === 'pending' && isReconciled) return false;
        if (rightFilter === 'reconciled' && !isReconciled) return false;
        if (q) {
          const desc = (m.description || '').toLowerCase();
          const ref = (m.ref || '').toLowerCase();
          if (!desc.includes(q) && !ref.includes(q)) return false;
        }
        return true;
      });

      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400">No hay movimientos de extracto bancario.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map(m => {
        const date = m.date || '';
        const desc = m.description || 'Movimiento Banco';
        const partnerTx = txLineByMovId.get(m.id) || m.expand?.tx_line_id;
        const isReconciled = m.reconciled || !!partnerTx;

        const rowBgClass = isReconciled 
          ? 'bg-emerald-50/50 hover:bg-emerald-100/60' 
          : 'bg-amber-50/40 hover:bg-amber-100/50';

        return `
          <tr class="${rowBgClass} transition-colors cursor-pointer" data-bank-mov-id="${esc(m.id)}" data-partner-tx-id="${partnerTx ? esc(partnerTx.id || partnerTx) : ''}">
            <td><input type="checkbox" class="check-right" value="${esc(m.id)}"></td>
            <td class="whitespace-nowrap font-medium">${esc(date.slice(0, 10))}</td>
            <td title="${esc(desc)}"><div class="truncate max-w-[200px] font-medium text-gray-800">${esc(desc)}</div></td>
            <td class="text-right font-medium text-emerald-700">${m.credit > 0 ? fmt(m.credit) : '-'}</td>
            <td class="text-right font-medium text-red-700">${m.debit > 0 ? fmt(m.debit) : '-'}</td>
            <td class="text-center">
              ${isReconciled 
                ? `<span class="badge badge-green" title="Conciliado"><i class="fas fa-check-double mr-1"></i>Conciliado</span>` 
                : `<span class="badge badge-orange" title="Extracto pendiente de cruce">Pendiente</span>`}
            </td>
            <td class="text-center">
              ${can('canWrite') ? `
                <button class="btn btn-outline btn-sm" style="padding:1px 6px;font-size:10px" onclick="toggleRecon('${esc(m.id)}', ${isReconciled ? 'false' : 'true'})">
                  <i class="fas ${isReconciled ? 'fa-xmark text-red-500' : 'fa-check text-emerald-600'}"></i>
                </button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('');

      $$('#table-bank tbody .check-right').forEach(cb => cb.addEventListener('change', updatePairingButtonState));
    };

    const updateKPIs = () => {
      const auxDeb = txLines.reduce((s, l) => s + (l.debit || 0), 0);
      const auxCred = txLines.reduce((s, l) => s + (l.credit || 0), 0);
      const auxNet = auxDeb - auxCred;

      const bankInc = movements.reduce((s, m) => s + (m.credit || 0), 0);
      const bankExp = movements.reduce((s, m) => s + (m.debit || 0), 0);
      const bankNet = bankInc - bankExp;

      const diff = auxNet - bankNet;
      const reconciledCount = movements.filter(m => m.reconciled || txLineByMovId.has(m.id)).length;
      const totalCount = movements.length || 1;
      const pct = Math.round((reconciledCount / totalCount) * 100);

      const kpiAuxNet = $('#kpi-aux-net');
      const kpiBankNet = $('#kpi-bank-net');
      const kpiDiff = $('#kpi-diff');
      const kpiProgress = $('#kpi-progress');
      const kpiAuxCounts = $('#kpi-aux-counts');
      const kpiBankCounts = $('#kpi-bank-counts');
      const kpiMatchCounts = $('#kpi-match-counts');

      if (kpiAuxNet) kpiAuxNet.textContent = fmt(auxNet);
      if (kpiBankNet) kpiBankNet.textContent = fmt(bankNet);
      if (kpiDiff) {
        kpiDiff.textContent = fmt(diff);
        kpiDiff.className = `text-lg font-bold mt-1 ${Math.abs(diff) < 1 ? 'text-emerald-600' : 'text-amber-600'}`;
      }
      if (kpiProgress) kpiProgress.textContent = `${pct}%`;
      if (kpiAuxCounts) kpiAuxCounts.textContent = `${txLines.length} reg (Déb: ${fmt(auxDeb)} | Cré: ${fmt(auxCred)})`;
      if (kpiBankCounts) kpiBankCounts.textContent = `${movements.length} reg (Ing: ${fmt(bankInc)} | Egr: ${fmt(bankExp)})`;
      if (kpiMatchCounts) kpiMatchCounts.textContent = `${reconciledCount} de ${movements.length} concilidados`;

      const unreconCount = movements.filter(m => !m.reconciled && !txLineByMovId.has(m.id)).length;
      if ($('#unrecon-count')) $('#unrecon-count').textContent = String(unreconCount);
      if ($('#badge-aux-count')) $('#badge-aux-count').textContent = String(txLines.length);
      if ($('#badge-bank-count')) $('#badge-bank-count').textContent = String(movements.length);
    };

    const reloadAllData = async () => {
      _selectedBankId = getSelectVal('bank-filter');
      _filterFrom = getInputVal('filter-from');
      _filterTo = getInputVal('filter-to');

      const tbodyAux = $('#table-aux tbody');
      const tbodyBank = $('#table-bank tbody');
      if (tbodyAux) tbodyAux.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando auxiliar contable...</td></tr>`;
      if (tbodyBank) tbodyBank.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando extracto...</td></tr>`;

      try {
        // 1. Cargar Extracto Bancario (bank_movements)
        const bankFilters = [];
        if (_selectedBankId) bankFilters.push(`bank_account_id = "${pb.escapeFilterValue(_selectedBankId)}"`);
        if (_filterFrom) bankFilters.push(`date >= "${pb.escapeFilterValue(_filterFrom)}"`);
        if (_filterTo) bankFilters.push(`date <= "${pb.escapeFilterValue(_filterTo)}"`);

        movements = await pb.listAll('bank_movements', {
          sort: '-date',
          filter: bankFilters.join(' && '),
          expand: 'bank_account_id,tx_line_id',
        });

        // 2. Cargar Libro Auxiliar Contable (tx_lines)
        const currentBankAcc = bankAccounts.find(b => b.id === _selectedBankId);
        const bankAccId = currentBankAcc?.account_id;

        if (bankAccId) {
          // Resolver subcuentas contables hijas del PUC
          const targetAccountIds = [bankAccId];
          const mainAcc = accounts.find(a => a.id === bankAccId);
          if (mainAcc) {
            const mainCode = (mainAcc.code || '').trim();
            accounts.forEach(a => {
              if (a.id !== bankAccId) {
                const aCode = (a.code || '').trim();
                if ((a.parent_id && a.parent_id === bankAccId) || (mainCode && aCode && aCode.startsWith(mainCode))) {
                  targetAccountIds.push(a.id);
                }
              }
            });
          }

          const safeAccountFilter = targetAccountIds.map(id => `account_id="${pb.escapeFilterValue(id)}"`).join(' || ');
          const txFilters = [`(${safeAccountFilter})`, 'tx_id.status != "voided"'];
          if (_filterFrom) txFilters.push(`tx_id.date >= "${pb.escapeFilterValue(_filterFrom)}"`);
          if (_filterTo) txFilters.push(`tx_id.date <= "${pb.escapeFilterValue(_filterTo)} 23:59:59"`);

          txLines = await pb.listAll('tx_lines', {
            filter: txFilters.join(' && '),
            expand: 'tx_id,third_party_id',
            sort: '-tx_id.date',
          });
        } else {
          txLines = [];
        }

        // 3. Reconstruir mapas de vínculos
        movByTxLineId.clear();
        txLineByMovId.clear();
        movements.forEach(m => {
          if (m.tx_line_id) {
            movByTxLineId.set(m.tx_line_id, m);
            txLineByMovId.set(m.id, m.expand?.tx_line_id || { id: m.tx_line_id });
          }
        });

        renderLeftTable();
        renderRightTable();
        updateKPIs();
        updatePairingButtonState();

        // Verificar si existe conciliación cerrada en el período para esta cuenta bancaria
        const closedBanner = $('#recon-closed-banner');
        if (closedBanner && _selectedBankId) {
          try {
            const safeBId = pb.escapeFilterValue(_selectedBankId);
            const closures = await pb.listAll('bank_reconciliations', {
              filter: `bank_account_id="${safeBId}" && status="closed" && period_end>="${pb.escapeFilterValue(_filterFrom)}" && period_start<="${pb.escapeFilterValue(_filterTo)}"`,
              sort: '-period_end',
              expand: 'closed_by,bank_account_id'
            });
            if (closures.length > 0) {
              const c = closures[0];
              closedBanner.style.display = 'flex';
              closedBanner.innerHTML = `
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg shadow-xs">
                    <i class="fas fa-lock"></i>
                  </div>
                  <div>
                    <div class="font-bold text-emerald-900 text-sm flex items-center gap-2">
                      <span>Período con Conciliación Bancaria Cerrada y Certificada</span>
                      <span class="badge badge-green text-xs"><i class="fas fa-certificate mr-1"></i>Auditado</span>
                    </div>
                    <p class="text-xs text-emerald-700 mb-0">
                      Corte formal del <strong>${esc(c.period_start)}</strong> al <strong>${esc(c.period_end)}</strong> | Cerrado por: <strong>${esc(c.expand?.closed_by?.name || 'Contabilidad')}</strong>. Saldo libros: <strong>${fmt(c.book_balance || 0)}</strong> | Extracto: <strong>${fmt(c.bank_balance || 0)}</strong>.
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn-outline btn-sm bg-white text-emerald-800 border-emerald-300 font-semibold" onclick="window.openReconciliationCertificateModal('${esc(c.id)}')">
                    <i class="fas fa-certificate mr-1 text-emerald-600"></i> Ver Acta / Certificado
                  </button>
                  <button class="btn btn-outline btn-sm bg-white text-gray-600 border-gray-300 font-semibold" id="btn-banner-history">
                    <i class="fas fa-clock-rotate-left mr-1"></i> Historial Actas
                  </button>
                </div>
              `;
              $('#btn-banner-history')?.addEventListener('click', () => {
                const currentBankAcc = bankAccounts.find(b => b.id === _selectedBankId);
                openReconciliationsHistoryModal(currentBankAcc);
              });
            } else {
              closedBanner.style.display = 'none';
            }
          } catch (_) {
            closedBanner.style.display = 'none';
          }
        }
      } catch (err: any) {
        showToast('Error cargando conciliación: ' + (err.message || ''), 'error');
      }
    };

    // Eventos de Filtros y Búsqueda
    $('#btn-search-movs')?.addEventListener('click', reloadAllData);
    $('#filter-from')?.addEventListener('keydown', e => { if (e.key === 'Enter') reloadAllData(); });
    $('#filter-to')?.addEventListener('keydown', e => { if (e.key === 'Enter') reloadAllData(); });
    $('#bank-filter')?.addEventListener('change', reloadAllData);
    $('#mov-q')?.addEventListener('input', debounce(() => { renderLeftTable(); renderRightTable(); }, 150));

    // Eventos de Pestañas de estado (Left & Right)
    $$('.btn-tab-left').forEach(btn => {
      btn.addEventListener('click', (e) => {
        $$('.btn-tab-left').forEach(b => { b.className = 'px-2 py-1 rounded font-semibold btn-tab-left bg-gray-100 text-gray-600'; });
        const target = e.currentTarget as HTMLElement;
        target.className = 'px-2 py-1 rounded font-semibold btn-tab-left bg-blue-600 text-white';
        leftFilter = target.dataset.tab || 'all';
        renderLeftTable();
      });
    });

    $$('.btn-tab-right').forEach(btn => {
      btn.addEventListener('click', (e) => {
        $$('.btn-tab-right').forEach(b => { b.className = 'px-2 py-1 rounded font-semibold btn-tab-right bg-gray-100 text-gray-600'; });
        const target = e.currentTarget as HTMLElement;
        target.className = 'px-2 py-1 rounded font-semibold btn-tab-right bg-emerald-600 text-white';
        rightFilter = target.dataset.tab || 'all';
        renderRightTable();
      });
    });

    // Acción: Conciliar Pareja Seleccionada Manualmente
    $('#btn-pair-selected')?.addEventListener('click', async () => {
      const selectedLeft = $('#table-aux tbody .check-left:checked') as HTMLInputElement | null;
      const selectedRight = $('#table-bank tbody .check-right:checked') as HTMLInputElement | null;
      if (!selectedLeft || !selectedRight) return showToast('Selecciona 1 ítem del libro y 1 del extracto', 'warning');

      const leftId = selectedLeft.value;
      const rightId = selectedRight.value;

      try {
        await pb.update('bank_movements', rightId, { reconciled: true, tx_line_id: leftId });
        showToast('Pareja conciliada correctamente', 'success');
        await reloadAllData();
      } catch (err: any) {
        showToast('Error conciliando pareja: ' + (err.message || ''), 'error');
      }
    });

    // Acción: Sugerir Conciliación Automática
    $('#btn-suggest-recon')?.addEventListener('click', async () => {
      const bankId = getSelectVal('bank-filter');
      if (!bankId) return showToast('Selecciona una cuenta bancaria para sugerir conciliación', 'warning');
      const bank = bankAccounts.find(b => b.id === bankId);
      if (!bank?.account_id) return showToast('La cuenta bancaria no tiene cuenta contable asociada', 'warning');

      const btn = $('#btn-suggest-recon') as HTMLButtonElement | null;
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Emparejando...'; }

      try {
        const suggestions = await buildReconSuggestions(bank, movements, 30, accounts);
        if (!suggestions.length) {
          showToast('No se encontraron nuevas parejas automáticas', 'info');
        } else {
          let ok = 0;
          for (const s of suggestions) {
            try {
              await pb.update('bank_movements', s.movementId, { reconciled: true, tx_line_id: s.txLineId });
              ok++;
            } catch (_) {}
          }
          showToast(`Conciliadas ${ok} pareja(s) automáticamente`, 'success');
          await reloadAllData();
        }
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles mr-1"></i> Sugerir Conciliación Automatizada'; }
      }
    });

    // Acción: Generar Nota de Ajuste Bancario
    $('#btn-gen-adjustment-note')?.addEventListener('click', () => {
      const currentBankAcc = bankAccounts.find(b => b.id === _selectedBankId);
      openAdjustmentNoteModal(currentBankAcc, movements, accounts, reloadAllData);
    });

    // Acción: Cerrar Conciliación Formal del Período
    $('#btn-close-recon')?.addEventListener('click', () => {
      const currentBankAcc = bankAccounts.find(b => b.id === _selectedBankId);
      openCloseReconciliationModal(currentBankAcc, movements, txLines, _filterFrom, _filterTo, reloadAllData);
    });

    // Acción: Historial de Actas y Certificados
    $('#btn-history-recon')?.addEventListener('click', () => {
      const currentBankAcc = bankAccounts.find(b => b.id === _selectedBankId);
      openReconciliationsHistoryModal(currentBankAcc);
    });

    $('#btn-manage-banks')?.addEventListener('click', () => (window as any).navigate('cuentas-bancarias'));
    $('#btn-config-recon-mapping')?.addEventListener('click', () => openBankReconConfigModal(accounts));
    $('#btn-new-mov')?.addEventListener('click', () => openBankMovementForm(bankAccounts));
    $('#btn-import-ext')?.addEventListener('click', () => openImportModal(bankAccounts));
    $('#btn-clear-movs')?.addEventListener('click', () => openClearMovementsModal(bankAccounts, movements));

    await reloadAllData();
  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function openBankAccountsManager(bankAccountsList, accounts) {
  let editingBankAccountId = '';
  let currentList = [...bankAccountsList];

  const renderRowsHtml = (list) => {
    if (!list.length) {
      return `<tr><td colspan="6" class="text-center py-6" style="color:#9CA3AF">No hay cuentas bancarias registradas.</td></tr>`;
    }
    return list.map(b => `
      <tr id="ba-m-row-${b.id}">
        <td><strong>${esc(b.bank)}</strong></td>
        <td>${esc(b.number)}</td>
        <td>${esc(b.name)}</td>
        <td>${esc(b.expand?.account_id?.code || '')} - ${esc(b.expand?.account_id?.name || '')}</td>
        <td>${b.active ? '<span class="badge badge-green">Sí</span>' : '<span class="badge badge-red">No</span>'}</td>
        <td style="text-align:center">
          <div class="flex justify-center gap-1">
            <button class="btn btn-outline btn-sm" style="padding:2px 8px" onclick="window._editBankAccountInModal('${esc(b.id)}')">
              <i class="fas fa-pencil" style="font-size:11px"></i>
            </button>
            ${can('canDelete') ? `
            <button class="btn btn-outline btn-sm" style="padding:2px 8px;color:#EF4444;border-color:#FECACA" onclick="window._deleteBankAccountInModal('${esc(b.id)}')"
              title="Eliminar cuenta (solo si no tiene movimientos)">
              <i class="fas fa-trash-can" style="font-size:11px"></i>
            </button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  };

  const buildModalContent = () => {
    return `
      <!-- Formulario de Creación/Edición -->
      <div class="bg-gray-50 rounded-xl p-4 border mb-4" style="border-color:#E5E7EB">
        <h4 class="text-sm font-bold mb-3" id="ba-m-title" style="color:#0D2137"><i class="fas fa-plus mr-1"></i> Nueva Cuenta Bancaria</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div class="form-group mb-0">
            <label class="form-label text-xs">Nombre descriptivo <span style="color:#EF4444">*</span></label>
            <input id="ba-m-name" class="form-input w-full" placeholder="Ej. Ahorros Principal">
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Banco <span style="color:#EF4444">*</span></label>
            <input id="ba-m-bank" class="form-input w-full" placeholder="Ej. Bancolombia">
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Número de Cuenta <span style="color:#EF4444">*</span></label>
            <input id="ba-m-number" class="form-input w-full" placeholder="Ej. 123-456789-01">
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Cuenta contable asociada <span style="color:#EF4444">*</span></label>
            <select id="ba-m-account" class="form-input w-full">
              <option value="">-- Seleccionar cuenta --</option>
              ${accounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3">
          <label class="flex items-center gap-2 cursor-pointer text-xs" style="font-weight:600;color:#374151">
            <input type="checkbox" id="ba-m-active" checked style="accent-color:#2E6CE6">
            <span>Cuenta Activa (Disponible para movimientos)</span>
          </label>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" id="btn-ba-m-clear" style="display:none">Cancelar Edición</button>
            <button class="btn btn-primary btn-sm" id="btn-ba-m-save"><i class="fas fa-save mr-1"></i> Guardar Cuenta</button>
          </div>
        </div>
      </div>

      <!-- Listado de Cuentas -->
      <p style="font-weight:700;font-size:13px;color:#374151;margin-bottom:10px">Cuentas Bancarias Registradas</p>
      <div style="max-height:240px;overflow-y:auto;border:1px solid #F0F0F0;border-radius:12px">
        <table class="data-table" style="font-size:12px" id="ba-m-table">
          <thead>
            <tr>
              <th>Banco</th>
              <th>Número</th>
              <th>Nombre</th>
              <th>Cuenta Contable</th>
              <th>Activa</th>
              <th style="text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${renderRowsHtml(currentList)}
          </tbody>
        </table>
      </div>
    `;
  };

  (window as any).__baMgrNeedsRefresh = false;

  openModal(
    '<i class="fas fa-building-columns mr-2"></i>Cuentas Bancarias',
    `<div id="ba-m-container">${buildModalContent()}</div>`,
    `<button class="btn btn-outline" onclick="(function(){ closeModal(); if(window.__baMgrNeedsRefresh){ window.__baMgrNeedsRefresh=false; renderConciliacion(document.getElementById('page-content')); } })()" >Cerrar</button>`,
    true
  );

  const refreshList = async () => {
    try {
      currentList = await pb.listAll('bank_accounts', { sort: 'name', expand: 'account_id' });
      const tbody = document.querySelector('#ba-m-table tbody');
      if (tbody) {
        tbody.innerHTML = renderRowsHtml(currentList);
      }
    } catch (err: any) {
      showToast('Error al refrescar listado: ' + err.message, 'error');
    }
  };

  const resetForm = () => {
    editingBankAccountId = '';
    setInputVal('ba-m-name', '');
    setInputVal('ba-m-bank', '');
    setInputVal('ba-m-number', '');
    setSelectVal('ba-m-account', '');
    const activeCb = document.getElementById('ba-m-active') as HTMLInputElement | null;
    if (activeCb) activeCb.checked = true;

    const title = document.getElementById('ba-m-title');
    if (title) title.innerHTML = '<i class="fas fa-plus mr-1"></i> Nueva Cuenta Bancaria';

    const clearBtn = document.getElementById('btn-ba-m-clear');
    if (clearBtn) clearBtn.style.display = 'none';
  };

  (window as any)._editBankAccountInModal = (id) => {
    const item = currentList.find(b => b.id === id);
    if (!item) return;
    editingBankAccountId = id;

    setInputVal('ba-m-name', item.name);
    setInputVal('ba-m-bank', item.bank);
    setInputVal('ba-m-number', item.number);
    setSelectVal('ba-m-account', item.account_id);
    const activeCb = document.getElementById('ba-m-active') as HTMLInputElement | null;
    if (activeCb) activeCb.checked = !!item.active;

    const title = document.getElementById('ba-m-title');
    if (title) title.innerHTML = '<i class="fas fa-pencil mr-1"></i> Editar Cuenta Bancaria';

    const clearBtn = document.getElementById('btn-ba-m-clear');
    if (clearBtn) clearBtn.style.display = '';

    document.getElementById('ba-m-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('ba-m-name')?.focus();
  };

  (window as any)._deleteBankAccountInModal = async (id) => {
    // Paso 1: Verificar que el registro aún existe (evita 404 por lista obsoleta)
    let accountExists = true;
    try {
      await pb.get('bank_accounts', id);
    } catch (checkErr: any) {
      accountExists = false;
    }

    if (!accountExists) {
      showToast(
        'Esta cuenta ya no existe en el sistema. Actualizando lista...',
        'warning'
      );
      (window as any).__baMgrNeedsRefresh = true;
      await refreshList();
      return;
    }

    // Paso 2: Verificar movimientos bancarios asociados (evita error 400/FK)
    let movCount = 0;
    try {
      const safeId = pb.escapeFilterValue(id);
      const mvsCheck = await pb.listAll('bank_movements', {
        filter: `bank_account_id="${safeId}"`,
      });
      movCount = mvsCheck.length;
    } catch (_) { /* Si falla la verificación, continuar */ }

    if (movCount > 0) {
      showToast(
        `No se puede eliminar: esta cuenta tiene ${movCount} movimiento(s) bancario(s) registrado(s). ` +
        'Elimínalos primero desde "Limpiar Período", o desactiva la cuenta en lugar de eliminarla.',
        'warning'
      );
      return;
    }

    if (!confirm(
      '¿Estás seguro de eliminar esta cuenta bancaria?\n\n' +
      'Esta acción es irreversible. Solo es posible si la cuenta no tiene movimientos asociados.'
    )) return;

    try {
      await pb.delete('bank_accounts', id);
      showToast('Cuenta bancaria eliminada correctamente', 'success');
      (window as any).__baMgrNeedsRefresh = true;
      await refreshList();
    } catch (err: any) {
      const msg = err.message || '';
      const status = err.status || err.statusCode || 0;

      if (status === 404 || msg.includes('404') || msg.toLowerCase().includes('not found')) {
        // La cuenta fue eliminada por otro usuario/sesión entre la verificación y el delete
        showToast('Esta cuenta ya no existe en el sistema. Actualizando lista...', 'warning');
        (window as any).__baMgrNeedsRefresh = true;
        await refreshList();
      } else if (status === 400 || msg.includes('400') || msg.toLowerCase().includes('constraint') || msg.toLowerCase().includes('foreign')) {
        showToast(
          'No se puede eliminar: la cuenta está referenciada en otros registros del sistema.',
          'error'
        );
      } else {
        showToast(msg || 'Error al eliminar la cuenta', 'error');
      }
    }
  };

  document.getElementById('btn-ba-m-clear')?.addEventListener('click', resetForm);

  const rawSaveBtn = document.getElementById('btn-ba-m-save');
  const saveBtn = rawSaveBtn?.cloneNode(true) as HTMLButtonElement | null;
  if (rawSaveBtn && saveBtn) rawSaveBtn.replaceWith(saveBtn);

  saveBtn?.addEventListener('click', async () => {
    const nameVal   = getInputVal('ba-m-name').trim();
    const bankVal   = getInputVal('ba-m-bank').trim();
    const numberVal = getInputVal('ba-m-number').trim();
    const accountId = getSelectVal('ba-m-account').trim();

    if (!nameVal || !bankVal || !numberVal || !accountId) {
      return showToast('Completa todos los campos obligatorios', 'warning');
    }

    if (!editingBankAccountId) {
      const duplicates = currentList.filter(
        b => b.number.trim().toLowerCase() === numberVal.toLowerCase()
      );
      if (duplicates.length > 0) {
        showToast(
          `Ya existe una cuenta bancaria con el número "${numberVal}" (${duplicates[0].bank} - ${duplicates[0].name}).`,
          'warning'
        );
        return;
      }
    }

    const payload = {
      name:       nameVal,
      bank:       bankVal,
      number:     numberVal,
      account_id: accountId,
      currency:   'COP',
      active:     (document.getElementById('ba-m-active') as HTMLInputElement)?.checked ?? true,
    };

    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }

    try {
      if (editingBankAccountId) {
        await pb.update('bank_accounts', editingBankAccountId, payload);
        showToast('Cuenta bancaria actualizada', 'success');
      } else {
        await pb.create('bank_accounts', payload);
        showToast('Cuenta bancaria creada', 'success');
      }
      (window as any).__baMgrNeedsRefresh = true;
      resetForm();
      await refreshList();
    } catch (err: any) {
      // Mostrar el error exacto de PocketBase (ya contiene detalles de campo por _err)
      console.error('[BankAccount save] Error 400 data:', err.data);
      const msg = err.message || 'Error al guardar cuenta bancaria';
      showToast(msg, 'error');
    } finally {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Guardar Cuenta'; }
    }
  });
}

function openBankMovementForm(bankAccounts) {
  openModal(
    'Nuevo Movimiento Bancario',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Cuenta Bancaria</label><select id="bm-acc" class="form-input">${bankAccounts.map(b => `<option value="${esc(b.id)}">${esc(b.bank)} - ${esc(b.number)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Fecha</label><input id="bm-date" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Descripción</label><input id="bm-desc" class="form-input"></div>
      <div class="form-group"><label class="form-label">Débito</label><input id="bm-debit" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Crédito</label><input id="bm-credit" class="form-input" value="0"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Referencia</label><input id="bm-ref" class="form-input"></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-bm">Guardar</button>`
  );
  $('#btn-save-bm')?.addEventListener('click', async () => {
    try {
      const payload = {
        bank_account_id: getSelectVal('bm-acc'),
        date: getInputVal('bm-date'),
        description: getInputVal('bm-desc'),
        debit: parseNum(getInputVal('bm-debit')),
        credit: parseNum(getInputVal('bm-credit')),
        balance: 0,
        ref: getInputVal('bm-ref'),
        reconciled: false,
      };
      if (!payload.bank_account_id || !payload.date) return showToast('Cuenta y fecha son obligatorias', 'warning');
      if (!(payload.debit > 0 || payload.credit > 0)) return showToast('Ingresa débito o crédito', 'warning');
      await pb.create('bank_movements', payload);
      closeModal();
      showToast('Movimiento registrado', 'success');
      renderConciliacion($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function toggleRecon(id, reconciled) {
  try {
    await pb.update('bank_movements', id, { reconciled });
    showToast('Estado de conciliación actualizado', 'success');
    renderConciliacion($('#page-content'));
  } catch (err) { showToast(err.message, 'error'); }
}

function _asDateOnly(s) {
  if (!s) return null;
  const d = new Date(String(s).slice(0, 10) + 'T00:00:00');
  return isNaN(d) ? null : d;
}

function _daysDiff(a, b) {
  const da = _asDateOnly(a);
  const db = _asDateOnly(b);
  if (!da || !db) return 999;
  return Math.round(Math.abs((da - db) / 86400000));
}

function _normText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _textOverlap(a, b) {
  const stop = new Set(['de','la','el','los','las','por','para','con','del','y','en','a','un','una']);
  const wa = new Set(_normText(a).split(' ').filter(w => w.length >= 4 && !stop.has(w)));
  const wb = new Set(_normText(b).split(' ').filter(w => w.length >= 4 && !stop.has(w)));
  if (!wa.size || !wb.size) return 0;
  let common = 0;
  wa.forEach(w => { if (wb.has(w)) common++; });
  return common / Math.max(wa.size, wb.size);
}

async function buildReconSuggestions(bankAccount, movements, dayWindow = 30, accounts: any[] = []) {
  const accountId = bankAccount?.account_id;
  if (!accountId) return [];

  // 1. Resolver todas las subcuentas contables hijas del PUC (para jerarquías contables 1110 -> 111005 -> 11100501)
  const targetAccountIds = [accountId];
  if (Array.isArray(accounts) && accounts.length > 0) {
    const mainAcc = accounts.find(a => a.id === accountId);
    if (mainAcc) {
      const mainCode = (mainAcc.code || '').trim();
      accounts.forEach(a => {
        if (a.id !== accountId) {
          const aCode = (a.code || '').trim();
          if ((a.parent_id && a.parent_id === accountId) || (mainCode && aCode && aCode.startsWith(mainCode))) {
            targetAccountIds.push(a.id);
          }
        }
      });
    }
  }

  // 2. Construir filtro PocketBase soportando múltiples subcuentas y filtrando transacciones anuladas
  const safeFilter = targetAccountIds.map(id => `account_id="${pb.escapeFilterValue(id)}"`).join(' || ');
  const filterStr = targetAccountIds.length > 1 
    ? `(${safeFilter}) && tx_id.status != "voided"`
    : `account_id="${pb.escapeFilterValue(accountId)}" && tx_id.status != "voided"`;

  let txLines: any[] = [];
  try {
    txLines = await pb.listAll('tx_lines', {
      filter: filterStr,
      expand: 'tx_id',
      sort: '-id',
    });
  } catch (err) {
    console.warn('[buildReconSuggestions] Error consultando tx_lines con filtro amplio, usando fallback:', err);
    txLines = await pb.listAll('tx_lines', {
      filter: `account_id="${pb.escapeFilterValue(accountId)}"`,
      expand: 'tx_id',
      sort: '-id',
    });
  }

  const usedLineIds = new Set(
    movements.filter(m => m.tx_line_id).map(m => m.tx_line_id)
  );

  const remainingLines = txLines.filter(l => !usedLineIds.has(l.id) && l.expand?.tx_id);
  const pendingMovs = movements.filter(m => m.bank_account_id === bankAccount.id && !m.reconciled);
  const reservedLines = new Set();
  const suggestions: any[] = [];

  for (const m of pendingMovs) {
    const amount = +(m.debit > 0 ? m.debit : m.credit || 0);
    if (!amount) continue;

    // En contabilidad bancaria el sentido es inverso al extracto.
    const primarySide = m.debit > 0 ? 'credit' : 'debit';
    const altSide = m.debit > 0 ? 'debit' : 'credit';

    const candidates = remainingLines
      .filter(l => !reservedLines.has(l.id))
      .map(l => {
        const primaryAmt = +(l[primarySide] || 0);
        const altAmt = +(l[altSide] || 0);
        
        let diffAmt = Math.abs(primaryAmt - amount);
        let isInverseSide = false;

        // Si no coincide en el lado directo, verificar si fue grabado en sentido inverso en la contabilidad
        if (diffAmt >= 1.0 && altAmt > 0) {
          const invDiff = Math.abs(altAmt - amount);
          if (invDiff < 1.0) {
            diffAmt = invDiff;
            isInverseSide = true;
          }
        }

        if (diffAmt >= 1.0) return null; // Diferencia de monto superior a 1 peso

        const txDate = l.expand?.tx_id?.date || '';
        const dDiff = _daysDiff(m.date, txDate);
        const descScore = _textOverlap(m.description || m.ref || '', l.description || l.expand?.tx_id?.description || '');
        let score = Math.max(0, 100 - dDiff * 3) + descScore * 40;
        if (isInverseSide) score -= 30;

        return { line: l, dDiff, descScore, score, isInverseSide, diffAmt };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null && c.dDiff <= dayWindow)
      .sort((a, b) => b.score - a.score);

    if (!candidates.length) continue;

    const top = candidates[0];
    const alt = candidates[1];
    const unique = !alt || top.score - alt.score >= 20;

    let confidence = 'baja';
    if (unique && top.dDiff <= 2 && !top.isInverseSide) {
      confidence = 'alta';
    } else if (top.dDiff <= 7 && !top.isInverseSide) {
      confidence = 'media';
    }

    let reason = `Monto ${fmt(amount)} · dif fecha ${top.dDiff} día(s)`;
    if (top.isInverseSide) reason += ' (lado inverso en contabilidad)';

    suggestions.push({
      movementId: m.id,
      txLineId: top.line.id,
      confidence,
      reason,
    });
    reservedLines.add(top.line.id);
  }

  return suggestions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIMPIAR PERÍODO — elimina movimientos bancarios de un rango de fechas
// ═══════════════════════════════════════════════════════════════════════════════

function openClearMovementsModal(bankAccounts, movements) {
  // Pre-poblar desde/hasta con lo que ya tiene el filtro activo
  const preFrom = getInputVal('filter-from') || '';
  const preTo   = getInputVal('filter-to')   || '';
  const preBid  = getSelectVal('bank-filter') || '';

  openModal(
    '<i class="fas fa-trash-can mr-2" style="color:#DC2626"></i>Limpiar Período',
    `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 14px;font-size:13px;color:#991B1B;margin-bottom:16px">
       <i class="fas fa-triangle-exclamation mr-1"></i>
       Esta acción <strong>elimina permanentemente</strong> los movimientos del rango seleccionado.
       Los movimientos ya conciliados se eliminarán también y perderán su vínculo contable.
     </div>
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div class="form-group mb-0">
         <label class="form-label">Cuenta bancaria</label>
         <select id="clr-bank" class="form-input">
           <option value="">Todas las cuentas</option>
           ${bankAccounts.map(b => `<option value="${esc(b.id)}" ${b.id === preBid ? 'selected' : ''}>${esc(b.bank)} - ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
         </select>
       </div>
       <div></div>
       <div class="form-group mb-0">
         <label class="form-label">Desde <span style="color:#EF4444">*</span></label>
         <input id="clr-from" type="date" class="form-input" value="${esc(preFrom)}">
       </div>
       <div class="form-group mb-0">
         <label class="form-label">Hasta <span style="color:#EF4444">*</span></label>
         <input id="clr-to" type="date" class="form-input" value="${esc(preTo)}">
       </div>
     </div>
     <div id="clr-preview" class="mt-4" style="font-size:13px;color:#6B7280;min-height:24px"></div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="btn-clr-confirm" disabled>
       <i class="fas fa-trash-can mr-1"></i> Eliminar movimientos
     </button>`
  );

  const updatePreview = async () => {
    const bid  = getSelectVal('clr-bank');
    const from = getInputVal('clr-from');
    const to   = getInputVal('clr-to');
    if (!from || !to) {
      $('#clr-preview').innerHTML = '<span style="color:#9CA3AF">Selecciona ambas fechas para ver cuántos registros se eliminarán.</span>';
      const btn = $('#btn-clr-confirm') as HTMLButtonElement | null;
      if (btn) btn.disabled = true;
      return;
    }
    if (from > to) {
      $('#clr-preview').innerHTML = '<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>La fecha inicial no puede ser mayor que la final.</span>';
      const btn = $('#btn-clr-confirm') as HTMLButtonElement | null;
      if (btn) btn.disabled = true;
      return;
    }

    try {
      const filters = [];
      if (bid) filters.push(`bank_account_id = "${pb.escapeFilterValue(bid)}"`);
      filters.push(`date >= "${pb.escapeFilterValue(from)}"`);
      filters.push(`date <= "${pb.escapeFilterValue(to)}"`);
      
      const affected = await pb.listAll('bank_movements', { filter: filters.join(' && ') });
      const recon = affected.filter(m => m.reconciled).length;
      
      if (!affected.length) {
        $('#clr-preview').innerHTML = '<span style="color:#6B7280">Ningún movimiento coincide con ese rango.</span>';
        const btn = $('#btn-clr-confirm') as HTMLButtonElement | null;
        if (btn) btn.disabled = true;
        return;
      }
      
      $('#clr-preview').innerHTML = `
        <span style="color:#DC2626;font-weight:700"><i class="fas fa-triangle-exclamation mr-1"></i>
        Se eliminarán <strong>${affected.length}</strong> movimiento(s)
        ${recon ? `<span style="color:#92400E"> — de los cuales <strong>${recon}</strong> ya están conciliados</span>` : ''}
        </span>`;
      const btn = $('#btn-clr-confirm') as HTMLButtonElement | null;
      if (btn) btn.disabled = false;
    } catch (err: any) {
      $('#clr-preview').innerHTML = `<span style="color:#EF4444">Error al cargar vista previa: ${esc(err.message)}</span>`;
    }
  };

  $('#clr-bank')?.addEventListener('change', updatePreview);
  $('#clr-from')?.addEventListener('change', updatePreview);
  $('#clr-to')?.addEventListener('change', updatePreview);
  updatePreview();

  $('#btn-clr-confirm')?.addEventListener('click', async () => {
    const bid  = getSelectVal('clr-bank');
    const from = getInputVal('clr-from');
    const to   = getInputVal('clr-to');
    
    const btn = $('#btn-clr-confirm') as HTMLButtonElement | null;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...'; }
    
    try {
      const filters = [];
      if (bid) filters.push(`bank_account_id = "${pb.escapeFilterValue(bid)}"`);
      filters.push(`date >= "${pb.escapeFilterValue(from)}"`);
      filters.push(`date <= "${pb.escapeFilterValue(to)}"`);
      
      const toDelete = await pb.listAll('bank_movements', { filter: filters.join(' && ') });
      if (!toDelete.length) {
        closeModal();
        return;
      }
      
      let ok = 0, fail = 0;
      for (const m of toDelete) {
        try { await pb.delete('bank_movements', m.id); ok++; }
        catch (_) { fail++; }
      }
      closeModal();
      if (fail) showToast(`Eliminados ${ok}. ${fail} no pudieron borrarse (pueden tener restricciones).`, 'warning');
      else      showToast(`${ok} movimiento(s) eliminado(s) correctamente`, 'success');
      renderConciliacion($('#page-content'));
    } catch (err: any) {
      showToast('Error al eliminar movimientos: ' + err.message, 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash-can mr-1"></i> Eliminar movimientos'; }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTACIÓN DE EXTRACTO BANCARIO (REFACTORIZADO Y SEGURO)
// ═══════════════════════════════════════════════════════════════════════════════

let _importRows: any[] = [];
let _importBankAccId = '';

function openImportModal(bankAccounts: any[]) {
  _importRows = [];
  _importBankAccId = '';

  // wide = false asegura que se renderice como Overlay Modal contextual flotante
  openModal(
    '<i class="fas fa-file-import mr-2"></i>Importar Extracto Bancario',
    `<div id="import-wizard-container" class="p-1"></div>`,
    '',
    false
  );

  _renderImportStep1(bankAccounts);
}

function _renderImportStep1(bankAccounts: any[]) {
  const container = document.getElementById('import-wizard-container');
  if (!container) return;

  container.innerHTML = `
    <div class="mb-4">
      <label class="form-label font-bold text-xs text-gray-700">Cuenta bancaria destino <span style="color:#EF4444">*</span></label>
      <select id="imp-bank-acc" class="form-input w-full font-medium text-xs">
        ${bankAccounts.map(b => `<option value="${esc(b.id)}">${esc(b.bank)} — ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
      </select>
    </div>

    <div style="display:flex;gap:0;border-bottom:2px solid #E5E7EB;margin-bottom:16px">
      <button class="imp-tab" data-tab="excel"
        style="padding:8px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid #2E6CE6;color:#2E6CE6;margin-bottom:-2px">
        <i class="fas fa-file-excel mr-1"></i> Excel / CSV
      </button>
      <button class="imp-tab" data-tab="paste"
        style="padding:8px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:#6B7280">
        <i class="fas fa-paste mr-1"></i> Copiar/Pegar desde PDF
      </button>
    </div>

    <div id="imp-tab-excel">
      <div id="imp-drop-zone"
        style="border:2px dashed #D1D5DB;border-radius:14px;padding:36px;text-align:center;cursor:pointer;background:#F9FAFB;transition:all .2s">
        <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:#9CA3AF;display:block;margin-bottom:8px"></i>
        <p style="font-weight:600;font-size:14px;color:#374151;margin:0 0 4px">Haz clic o arrastra el archivo aquí</p>
        <p style="font-size:12px;color:#9CA3AF;margin:0">Formatos: .xlsx · .xls · .csv</p>
        <input type="file" id="imp-file-input" accept=".xlsx,.xls,.csv" style="display:none">
      </div>
      <div id="imp-col-map" class="mt-4" style="display:none"></div>
    </div>

    <div id="imp-tab-paste" style="display:none">
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:10px 14px;font-size:13px;color:#92400E;margin-bottom:10px">
        <i class="fas fa-lightbulb mr-1"></i>
        Abre el PDF, selecciona el texto de la tabla de movimientos (<strong>Ctrl+A</strong> en la página del extracto) y pégalo aquí.
        Soporta extractos de Bancolombia, Davivienda, Banco de Bogotá, Nequi, etc.
      </div>

      <div style="margin-bottom:10px">
        <label class="form-label" style="margin-bottom:6px">¿Cómo están los valores en el extracto?</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="tres" checked style="accent-color:#2E6CE6">
            <span><i class="fas fa-table-columns mr-1" style="color:#6B7280"></i> Débito | Crédito | Saldo <span style="font-size:11px;color:#9CA3AF">(más común)</span></span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="dos" style="accent-color:#2E6CE6">
            <span><i class="fas fa-columns mr-1" style="color:#6B7280"></i> Débito | Crédito (sin saldo)</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="signos" style="accent-color:#2E6CE6">
            <span><i class="fas fa-plus-minus mr-1" style="color:#6B7280"></i> Valor único (+/−)</span>
          </label>
        </div>
      </div>

      <textarea id="imp-paste-area" class="form-input w-full" rows="7"
        style="font-family:monospace;font-size:12px;resize:vertical"
        placeholder="Pega el texto aquí. Ejemplo:&#10;01/04/2026  TRANSFERENCIA PAGO  1.250.000,00  4.800.000,00&#10;05-Ene-2026 COMPRA POS EXITO    85.400,00    4.714.600,00"></textarea>

      <div style="display:flex;align-items:center;justify-content:between;gap:12px;margin-top:12px">
        <button class="btn btn-secondary" id="btn-imp-analyze">
          <i class="fas fa-wand-magic-sparkles mr-1"></i> Analizar texto
        </button>
        <span style="font-size:12px;color:#9CA3AF">Detección automática de fechas, descripciones y montos.</span>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t flex justify-end gap-2" style="border-color:#E5E7EB">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    </div>
  `;

  // Tab switching
  container.querySelectorAll('.imp-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      container.querySelectorAll('.imp-tab').forEach(t => {
        (t as HTMLElement).style.borderBottom = 'none';
        (t as HTMLElement).style.color = '#6B7280';
      });
      const target = e.currentTarget as HTMLElement;
      target.style.borderBottom = '3px solid #2E6CE6';
      target.style.color = '#2E6CE6';
      const excelTab = container.querySelector('#imp-tab-excel') as HTMLElement;
      const pasteTab = container.querySelector('#imp-tab-paste') as HTMLElement;
      if (excelTab) excelTab.style.display = target.dataset.tab === 'excel' ? '' : 'none';
      if (pasteTab) pasteTab.style.display = target.dataset.tab === 'paste' ? '' : 'none';
    });
  });

  // Drag & drop / file selection
  const dz = container.querySelector('#imp-drop-zone') as HTMLElement | null;
  const fileInput = container.querySelector('#imp-file-input') as HTMLInputElement | null;

  dz?.addEventListener('click', () => fileInput?.click());
  dz?.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#2E6CE6'; dz.style.background = '#EFF6FF'; });
  dz?.addEventListener('dragleave', () => { dz.style.borderColor = '#D1D5DB'; dz.style.background = '#F9FAFB'; });
  dz?.addEventListener('drop', e => {
    e.preventDefault();
    dz.style.borderColor = '#D1D5DB'; dz.style.background = '#F9FAFB';
    const f = e.dataTransfer?.files?.[0];
    if (f) _handleExcelFile(f, bankAccounts);
  });
  fileInput?.addEventListener('change', e => {
    const files = (e.target as HTMLInputElement).files;
    if (files?.[0]) _handleExcelFile(files[0], bankAccounts);
  });

  // Evento analizar PDF
  container.querySelector('#btn-imp-analyze')?.addEventListener('click', () => {
    const pasteArea = container.querySelector('#imp-paste-area') as HTMLTextAreaElement | null;
    const text = pasteArea?.value?.trim() || '';
    if (!text) return showToast('Pega el texto del extracto primero', 'warning');
    const selectedFormat = (container.querySelector('input[name="imp-format"]:checked') as HTMLInputElement)?.value || 'tres';
    const rows = _parsePdfText(text, selectedFormat);
    if (!rows.length) return showToast('No se detectaron movimientos válidos. Revisa el formato pegado.', 'warning');
    const bankAccId = (container.querySelector('#imp-bank-acc') as HTMLSelectElement)?.value || '';
    _renderImportPreview(rows, bankAccounts, bankAccId);
  });
}

// ─── EXCEL / CSV ──────────────────────────────────────────────────────────────
function _handleExcelFile(file: File, bankAccounts: any[]) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (raw.length < 2) return showToast('El archivo no tiene datos suficientes', 'warning');
      const map = _autoMapColumns(raw);
      _renderColMapper(raw, map, file.name, bankAccounts);
    } catch (err: any) { showToast('Error al leer archivo Excel: ' + err.message, 'error'); }
  };
  reader.readAsArrayBuffer(file);
}

const _COL_KEYS = {
  date:  ['fecha','date','dia','fec'],
  desc:  ['descripcion','descripción','concepto','detalle','movimiento','transaccion','transacción'],
  debit: ['debito','débito','cargo','egreso','salida','retiro','debit','db'],
  cred:  ['credito','crédito','abono','ingreso','deposito','depósito','credit','cr','entrada'],
  ref:   ['referencia','ref','numero','número','doc','comprobante','nro','cheque'],
};

function _autoMapColumns(raw: any[][]) {
  let hRow = 0;
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const cells = raw[i].map(c => String(c).toLowerCase());
    let hits = 0;
    for (const keys of Object.values(_COL_KEYS)) {
      if (cells.some(cell => keys.some(k => cell.includes(k)))) hits++;
    }
    if (hits >= 2) { hRow = i; break; }
  }
  const hdrs = raw[hRow].map(c => String(c).toLowerCase().trim());
  const find = (keys: string[]) => hdrs.findIndex(h => keys.some(k => h.includes(k)));
  return { hRow, date: find(_COL_KEYS.date), desc: find(_COL_KEYS.desc),
           debit: find(_COL_KEYS.debit), cred: find(_COL_KEYS.cred), ref: find(_COL_KEYS.ref) };
}

function _renderColMapper(raw: any[][], map: any, fileName: string, bankAccounts: any[]) {
  const container = document.getElementById('import-wizard-container');
  if (!container) return;

  const hdrs = raw[map.hRow];
  const dataRows = raw.length - map.hRow - 1;

  const dz = container.querySelector('#imp-drop-zone') as HTMLElement | null;
  if (dz) {
    dz.style.cssText = 'padding:10px 16px;border:1.5px solid #22C55E;border-radius:12px;background:#F0FDF4;display:flex;align-items:center;gap:10px;cursor:default';
    dz.innerHTML = `<i class="fas fa-file-excel" style="color:#16A34A;font-size:1.3rem"></i>
      <span style="font-size:14px;font-weight:600;color:#15803D">${esc(fileName)}</span>
      <span style="font-size:12px;color:#6B7280">${dataRows} filas detectadas</span>`;
    dz.onclick = null;
  }

  const opts = (sel: number) => [-1, ...hdrs.keys()].map(i =>
    `<option value="${i}" ${i === sel ? 'selected' : ''}>${i < 0 ? '— No usar —' : `Col.${i+1}: ${esc(String(hdrs[i]).slice(0,24))}`}</option>`
  ).join('');

  const mapDiv = container.querySelector('#imp-col-map') as HTMLElement | null;
  if (mapDiv) {
    mapDiv.style.display = '';
    mapDiv.innerHTML = `
      <p style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px">
        Mapeo de columnas <span style="font-weight:400;color:#9CA3AF">(ajusta si es necesario)</span>
      </p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div><label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
             <select id="mc-date"  class="form-input" style="font-size:13px">${opts(map.date)}</select></div>
        <div><label class="form-label">Descripción <span style="color:#EF4444">*</span></label>
             <select id="mc-desc"  class="form-input" style="font-size:13px">${opts(map.desc)}</select></div>
        <div><label class="form-label">Débito</label>
             <select id="mc-debit" class="form-input" style="font-size:13px">${opts(map.debit)}</select></div>
        <div><label class="form-label">Crédito</label>
             <select id="mc-cred"  class="form-input" style="font-size:13px">${opts(map.cred)}</select></div>
        <div><label class="form-label">Referencia</label>
             <select id="mc-ref"   class="form-input" style="font-size:13px">${opts(map.ref)}</select></div>
      </div>

      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px 14px;margin-bottom:12px">
        <p style="font-size:12px;font-weight:700;color:#1D4ED8;margin:0 0 6px">
          <i class="fas fa-info-circle mr-1"></i> ¿El extracto usa una sola columna de valor con positivo/negativo?
        </p>
        <div style="display:flex;align-items:center;gap:10px">
          <select id="mc-valor" class="form-input" style="font-size:13px;max-width:280px">${opts(-1)}</select>
          <span style="font-size:12px;color:#6B7280">Selecciona la columna. Positivo → Crédito · Negativo → Débito. <em>Ignora los campos Débito/Crédito de arriba.</em></span>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-imp-preview">
        <i class="fas fa-eye mr-1"></i> Ver vista previa
      </button>`;
  }

  container.querySelector('#btn-imp-preview')?.addEventListener('click', () => {
    const ci = {
      date:  +(container.querySelector('#mc-date') as HTMLSelectElement).value,
      desc:  +(container.querySelector('#mc-desc') as HTMLSelectElement).value,
      debit: +(container.querySelector('#mc-debit') as HTMLSelectElement).value,
      cred:  +(container.querySelector('#mc-cred') as HTMLSelectElement).value,
      ref:   +(container.querySelector('#mc-ref') as HTMLSelectElement).value,
      valor: +(container.querySelector('#mc-valor') as HTMLSelectElement).value,
    };
    if (ci.date < 0 || ci.desc < 0)
      return showToast('Las columnas Fecha y Descripción son obligatorias', 'warning');
    const useValor = ci.valor >= 0;
    if (!useValor && ci.debit < 0 && ci.cred < 0)
      return showToast('Selecciona al menos una columna de valor (Débito, Crédito, o Valor único)', 'warning');

    const rows = [];
    for (let i = map.hRow + 1; i < raw.length; i++) {
      const r = raw[i];
      const dateStr = _parseExcelDate(r[ci.date]);
      if (!dateStr) continue;
      let debit = 0, credit = 0;
      if (useValor) {
        const signed = _parseSignedColNum(r[ci.valor]);
        if (signed < 0) debit = Math.abs(signed);
        else credit = signed;
      } else {
        debit  = ci.debit >= 0 ? _parseColNum(r[ci.debit]) : 0;
        credit = ci.cred  >= 0 ? _parseColNum(r[ci.cred])  : 0;
      }
      if (!debit && !credit) continue;
      rows.push({
        date: dateStr,
        description: String(r[ci.desc] ?? '').trim(),
        debit, credit,
        ref: ci.ref >= 0 ? String(r[ci.ref] ?? '').trim() : '',
      });
    }
    if (!rows.length)
      return showToast('No se encontraron filas válidas con el mapeo seleccionado', 'warning');

    const bankAccId = (container.querySelector('#imp-bank-acc') as HTMLSelectElement)?.value || '';
    _renderImportPreview(rows, bankAccounts, bankAccId);
  });
}

function _parseExcelDate(val: any): string | null {
  if (val == null || val === '') return null;
  if (val instanceof Date && !isNaN(val.getTime())) return (window as any).getColombiaDateStr(val);
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400000));
    return isNaN(d.getTime()) ? null : (window as any).getColombiaDateStr(d);
  }
  const s = String(val).trim();
  const ES_MONTHS: Record<string, string> = {
    ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
    jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
  };

  // Caso 1: DD/MM/YYYY o DD-Ene-2026
  const m1 = s.match(/^(\d{1,2})[\/\-\.]([0-9]{1,2}|[a-zA-Z]{3})[\/\-\.](\d{2,4})$/);
  if (m1) {
    let [, d, mo, y] = m1;
    if (y.length === 2) y = '20' + y;
    const moLower = mo.toLowerCase().slice(0, 3);
    const finalMonth = ES_MONTHS[moLower] || mo.padStart(2, '0');
    return `${y}-${finalMonth}-${d.padStart(2, '0')}`;
  }

  // Caso 2: YYYY/MM/DD
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2,'0')}-${m2[3].padStart(2,'0')}`;

  // Caso 3: DD/MM o DD-Ene (Sin año, común en Bancolombia Excel ej. "1/07")
  const m3 = s.match(/^(\d{1,2})[\/\-\.]([0-9]{1,2}|[a-zA-Z]{3})$/);
  if (m3) {
    let [, d, mo] = m3;
    const moLower = mo.toLowerCase().slice(0, 3);
    const finalMonth = ES_MONTHS[moLower] || mo.padStart(2, '0');
    let y = '2026';
    if (_filterFrom && _filterFrom.length >= 4) {
      y = _filterFrom.slice(0, 4);
    } else {
      y = String(new Date().getFullYear());
    }
    return `${y}-${finalMonth}-${d.padStart(2, '0')}`;
  }

  return null;
}

function _parseColNum(val: any): number {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return Math.abs(val);
  const s = String(val).replace(/\u00A0|\u2009|\u202F|\s/g, '');
  let cleaned: string;
  if (/\d\.\d{3},/.test(s))      cleaned = s.replace(/\./g, '').replace(',', '.');
  else if (/\d,\d{3}\./.test(s)) cleaned = s.replace(/,/g, '');
  else                            cleaned = s.replace(/[^0-9.\-]/g, '');
  return Math.abs(parseFloat(cleaned)) || 0;
}

function _parseSignedColNum(val: any): number {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  const isNeg = /[-−]/.test(s) || /\(.*\)/.test(s);
  const clean = s.replace(/[^0-9.,]/g, '');
  const abs = _parseColNum(clean);
  return isNeg ? -abs : abs;
}

function _parsePdfText(text: string, format = 'tres') {
  const rows: any[] = [];
  const normalized = text
    .replace(/\u00A0|\u2009|\u202F/g, ' ')
    .replace(/\u2212/g, '-');

  const ES_MONTHS: Record<string, string> = {
    ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
    jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
  };

  const DATE_RE = /\b(\d{1,2})[\/\-\.]([0-9]{1,2}|[a-zA-Z]{3})[\/\-\.](\d{2,4})\b|\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/;
  const NUM_SRC = '[-\u2212]?\\(?\\$?\\s*\\d{1,3}(?:[.,\\u00A0\\u2009\\u202F ]\\d{3})+(?:[.,]\\d{1,2})?\\)?|[-\u2212]?\\(?\\$?\\s*\\d+[.,]\\d{2}\\)?';

  const groups: Array<{ date: string; lines: string[] }> = [];

  for (const rawLine of normalized.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const dm = line.match(DATE_RE);
    if (dm) {
      let dateStr = '';
      if (dm[4]) {
        dateStr = `${dm[4]}-${dm[5]}-${dm[6]}`;
      } else {
        let [, d, mo, y] = dm;
        if (y.length === 2) y = '20' + y;
        const moLower = mo.toLowerCase().slice(0, 3);
        const finalMonth = ES_MONTHS[moLower] || mo.padStart(2, '0');
        dateStr = `${y}-${finalMonth}-${d.padStart(2, '0')}`;
      }
      groups.push({ date: dateStr, lines: [line] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].lines.push(line);
    }
  }

  if (!groups.length) return rows;

  let prevSaldo: number | null = null;

  for (const g of groups) {
    const fullText = g.lines.join(' ');
    const numMatches = [...fullText.matchAll(new RegExp(NUM_SRC, 'g'))].map(m => {
      const raw = m[0];
      const signed = _parseSignedColNum(raw);
      return { abs: Math.abs(signed), isNeg: signed < 0, signed };
    }).filter(n => n.abs > 0);

    if (!numMatches.length) continue;

    const dateM = fullText.match(DATE_RE);
    const afterDate = dateM ? fullText.slice(dateM.index! + dateM[0].length) : fullText;
    let description = afterDate
      .replace(new RegExp(NUM_SRC, 'g'), ' ')
      .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description || description.length < 2) description = 'Movimiento Bancario';

    let debit = 0, credit = 0;

    if (format === 'signos') {
      const n = numMatches[0];
      if (n.isNeg) debit = n.abs;
      else credit = n.abs;
    } else if (format === 'dos') {
      if (numMatches.length >= 2) {
        debit = numMatches[numMatches.length - 2].abs;
        credit = numMatches[numMatches.length - 1].abs;
      } else {
        credit = numMatches[numMatches.length - 1].abs;
      }
    } else {
      if (numMatches.length >= 2) {
        const saldo = numMatches[numMatches.length - 1].abs;
        const amount = numMatches[numMatches.length - 2].abs;
        if (prevSaldo !== null) {
          const delta = saldo - prevSaldo;
          if (delta >= -amount * 0.01) credit = amount;
          else debit = amount;
        } else {
          credit = amount;
        }
        prevSaldo = saldo;
      } else if (numMatches.length === 1) {
        credit = numMatches[0].abs;
      }
    }

    if (!debit && !credit) continue;
    rows.push({ date: g.date, description, debit, credit, ref: '' });
  }

  return rows;
}

// ─── VISTA PREVIA Y CONFIRMACIÓN DE IMPORTACIÓN ──────────────────────────────

function _renderImportPreview(rows: any[], bankAccounts: any[], bankAccId: string) {
  _importRows = rows.map((r, i) => ({ ...r, _id: i, _skip: false }));
  _importBankAccId = bankAccId;

  const container = document.getElementById('import-wizard-container');
  if (!container) return;

  const bankLabel = bankAccounts.find(b => b.id === bankAccId);
  const bankName = bankLabel ? `${bankLabel.bank} — ${bankLabel.number}` : bankAccId;

  container.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap">
      <div>
        <p style="font-weight:700;font-size:14px;color:#374151;margin:0 0 2px">Vista previa de importación</p>
        <p style="font-size:12px;color:#6B7280;margin:0">
          Cuenta: <strong>${esc(bankName)}</strong> &nbsp;·&nbsp; Elimina filas no deseadas antes de confirmar.
        </p>
      </div>
      <span id="imp-count-badge" class="badge badge-blue" style="white-space:nowrap">
        ${rows.length} movimientos
      </span>
    </div>

    <div style="max-height:320px;overflow-y:auto;border:1px solid #F0F0F0;border-radius:12px">
      <table class="data-table" style="font-size:12px" id="imp-preview-table">
        <thead>
          <tr><th>Fecha</th><th>Descripción</th><th style="text-align:right">Débito</th>
              <th style="text-align:right">Crédito</th><th>Ref.</th><th></th></tr>
        </thead>
        <tbody>
          ${_importRows.map(r => `
            <tr id="imp-row-${r._id}">
              <td>${esc(r.date)}</td>
              <td>${esc(r.description)}</td>
              <td style="text-align:right">${r.debit ? fmt(r.debit) : '<span style="color:#D1D5DB">—</span>'}</td>
              <td style="text-align:right">${r.credit ? fmt(r.credit) : '<span style="color:#D1D5DB">—</span>'}</td>
              <td>${esc(r.ref || '—')}</td>
              <td>
                <button class="btn btn-outline btn-sm btn-del-row" data-id="${r._id}"
                  style="color:#EF4444;border-color:#FECACA;padding:2px 8px" title="Eliminar fila">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="mt-4 pt-3 border-t flex items-center justify-between gap-2" style="border-color:#E5E7EB">
      <button class="btn btn-outline" id="btn-imp-back">
        <i class="fas fa-arrow-left mr-1"></i> Volver
      </button>
      <button class="btn btn-primary" id="btn-imp-confirm">
        <i class="fas fa-file-import mr-1"></i> Importar <span id="imp-confirm-count">${rows.length}</span> movimientos
      </button>
    </div>
  `;

  container.querySelectorAll('.btn-del-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number((e.currentTarget as HTMLElement).dataset.id);
      _removeImportRow(id);
    });
  });

  container.querySelector('#btn-imp-back')?.addEventListener('click', () => {
    _importRows = []; _importBankAccId = '';
    _renderImportStep1(bankAccounts);
  });

  container.querySelector('#btn-imp-confirm')?.addEventListener('click', () => _doImport());
}

function _removeImportRow(id: number) {
  const row = _importRows.find(r => r._id === id);
  if (row) row._skip = true;
  document.getElementById(`imp-row-${id}`)?.remove();
  const remaining = _importRows.filter(r => !r._skip).length;
  
  const badge = document.getElementById('imp-count-badge');
  const countSpan = document.getElementById('imp-confirm-count');
  if (badge) badge.textContent = `${remaining} movimientos`;
  if (countSpan) countSpan.textContent = String(remaining);

  if (!remaining) {
    const btn = document.getElementById('btn-imp-confirm') as HTMLButtonElement | null;
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
  }
}

// ─── PERSISTENCIA OPTIMIZADA POR LOTES (CHUNK PROMISES) ───────────────────────

async function _doImport() {
  if (!_importBankAccId) return showToast('Cuenta bancaria no definida', 'error');
  const toImport = _importRows.filter(r => !r._skip);
  if (!toImport.length) return showToast('No hay movimientos para importar', 'warning');

  const btn = document.getElementById('btn-imp-confirm') as HTMLButtonElement | null;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Importando...'; }

  let ok = 0;
  let fail = 0;
  const chunkSize = 15; // Tamaño del lote para peticiones HTTP concurrentes

  for (let i = 0; i < toImport.length; i += chunkSize) {
    const chunk = toImport.slice(i, i + chunkSize);
    const promises = chunk.map(r => pb.create('bank_movements', {
      bank_account_id: _importBankAccId,
      date: r.date,
      description: r.description,
      debit: r.debit || 0,
      credit: r.credit || 0,
      balance: 0,
      ref: r.ref || '',
      reconciled: false,
    }));

    const results = await Promise.allSettled(promises);
    results.forEach(res => {
      if (res.status === 'fulfilled') ok++;
      else fail++;
    });
  }

  closeModal();
  _importRows = [];
  _importBankAccId = '';

  if (fail > 0) {
    showToast(`Importados ${ok} movimientos correctamente. ${fail} fallaron al guardar.`, 'warning');
  } else {
    showToast(`${ok} movimientos importados correctamente`, 'success');
  }

  const pageContent = document.getElementById('page-content');
  if (pageContent) renderConciliacion(pageContent);
}


// ═══════════════════════════════════════════════════════════════════════════════
// PARAMETRIZACIÓN DE CUENTAS PUC Y COMPROBANTE PARA NOTAS DE AJUSTE BANCARIO
// ═══════════════════════════════════════════════════════════════════════════════

let _cachedReconMappings: any = null;

async function getBankReconMappingsAsync() {
  if (_cachedReconMappings) return _cachedReconMappings;
  try {
    const dbVal = await (window as any).API?.getSetting?.('bank_recon_config');
    if (dbVal) {
      _cachedReconMappings = typeof dbVal === 'string' ? JSON.parse(dbVal) : dbVal;
      return _cachedReconMappings;
    }
  } catch (_) {}

  try {
    const raw = localStorage.getItem('gravy_bank_recon_mappings_v1');
    if (raw) {
      _cachedReconMappings = JSON.parse(raw);
      return _cachedReconMappings;
    }
  } catch (_) {}

  _cachedReconMappings = {
    gmf: '511505',
    comision: '511515',
    interes: '421005',
    general: '511595',
    default_tx_type_id: '',
    default_third_party_id: '',
  };
  return _cachedReconMappings;
}

function getBankReconMappings() {
  if (_cachedReconMappings) return _cachedReconMappings;
  try {
    const raw = localStorage.getItem('gravy_bank_recon_mappings_v1');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    gmf: '511505',
    comision: '511515',
    interes: '421005',
    general: '511595',
    default_tx_type_id: '',
    default_third_party_id: '',
  };
}

async function saveBankReconMappings(mappings: any) {
  _cachedReconMappings = { ...mappings };
  try {
    localStorage.setItem('gravy_bank_recon_mappings_v1', JSON.stringify(mappings));
  } catch (_) {}

  try {
    if ((window as any).API?.setSetting) {
      await (window as any).API.setSetting('bank_recon_config', JSON.stringify(mappings));
    }
  } catch (err) {
    console.warn('No se pudo persistir en settings de base de datos, usando localStorage:', err);
  }
}

async function openBankReconConfigModal(accounts: any[]) {
  const current = await getBankReconMappingsAsync();
  let txTypes: any[] = [];
  let thirdParties: any[] = [];

  try {
    [txTypes, thirdParties] = await Promise.all([
      pb.listAll('transaction_types', { filter: 'active=true', sort: 'name' }),
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    ]);
  } catch (_) {}

  // Filtrar tipos de comprobante sugeridos para ajustes bancarios (NB, NC, AJ, CE, RC)
  const preferredCodes = ['NB', 'NC', 'AJ', 'CE', 'RC'];
  const suggestedTypes = txTypes.filter(t => preferredCodes.includes((t.code || '').toUpperCase()));
  const otherTypes = txTypes.filter(t => !preferredCodes.includes((t.code || '').toUpperCase()));

  openModal(
    '<i class="fas fa-gear mr-2 text-blue-600"></i> Parametrización Contable de Conciliación y Ajustes Bancarios',
    `
    <div class="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
      <i class="fas fa-info-circle mr-1"></i>
      Configura el <strong>Tipo de Comprobante</strong>, el <strong>Tercero/Banco por Defecto</strong> y las <strong>Cuentas PUC</strong> automáticas que utilizará el generador de Notas de Ajuste Bancario. Esta configuración se guarda de forma centralizada en el sistema.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50 border-blue-100">
        <label class="font-bold text-gray-800 block mb-1">
          <i class="fas fa-file-lines text-blue-600 mr-1"></i> Tipo de Comprobante por Defecto
        </label>
        <p class="text-gray-500 mb-2">Comprobante asignado para notas de ajuste y causaciones bancarias (Recomendado: NB o NC).</p>
        <select id="cfg-map-tx-type" class="form-input w-full font-medium">
          <option value="">-- Usar detección automática (NB / NC) --</option>
          ${suggestedTypes.length ? `<optgroup label="Sugeridos para Bancos">${suggestedTypes.map(t => `<option value="${esc(t.id)}" ${t.id === current.default_tx_type_id ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)}</option>`).join('')}</optgroup>` : ''}
          ${otherTypes.length ? `<optgroup label="Otros Comprobantes">${otherTypes.map(t => `<option value="${esc(t.id)}" ${t.id === current.default_tx_type_id ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)}</option>`).join('')}</optgroup>` : ''}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50 border-blue-100">
        <label class="font-bold text-gray-800 block mb-1">
          <i class="fas fa-building text-blue-600 mr-1"></i> Tercero / Banco por Defecto
        </label>
        <p class="text-gray-500 mb-2">Tercero (NIT) predeterminado para las líneas de ajuste y contrapartidas.</p>
        <select id="cfg-map-third-party" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Tercero por Defecto --</option>
          ${thirdParties.map(tp => `<option value="${esc(tp.id)}" ${tp.id === current.default_third_party_id ? 'selected' : ''}>${esc(tp.document_number || '')} - ${esc(tp.name)}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="space-y-3 text-xs">
      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-red">4x1000 / GMF</span>
          <span>Gravamen a los Movimientos Financieros</span>
        </label>
        <p class="text-gray-500 mb-2">Para movimientos con descripciones como "4X1000", "GMF", "IMPTO GOBIERNO".</p>
        <select id="cfg-map-gmf" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.gmf || a.code === current.gmf ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-blue">Comisiones / Servicios</span>
          <span>Comisiones Bancarias, Cuotas y PSE</span>
        </label>
        <p class="text-gray-500 mb-2">Para transferencias, comisiones por pagos PSE, cuotas de manejo y corresponsales.</p>
        <select id="cfg-map-comision" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.comision || a.code === current.comision ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-green">Intereses / Rendimientos</span>
          <span>Abonos de Interés y Rendimientos Financieros</span>
        </label>
        <p class="text-gray-500 mb-2">Para notas de crédito por rendimientos, abonos de interés o dividendos de saldos.</p>
        <select id="cfg-map-interes" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.interes || a.code === current.interes ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-gray">Gastos Generales</span>
          <span>Otros Egresos y Gastos Bancarios</span>
        </label>
        <p class="text-gray-500 mb-2">Para cualquier otro egreso bancario pendiente no clasificado.</p>
        <select id="cfg-map-general" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.general || a.code === current.general ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>
    </div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-recon-cfg">
      <i class="fas fa-save mr-1"></i> Guardar Parametrización
    </button>
    `,
    true
  );

  $('#btn-save-recon-cfg')?.addEventListener('click', async () => {
    const saveBtn = $('#btn-save-recon-cfg') as HTMLButtonElement | null;
    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...'; }

    const newMappings = {
      gmf: getSelectVal('cfg-map-gmf') || '511505',
      comision: getSelectVal('cfg-map-comision') || '511515',
      interes: getSelectVal('cfg-map-interes') || '421005',
      general: getSelectVal('cfg-map-general') || '511595',
      default_tx_type_id: getSelectVal('cfg-map-tx-type') || '',
      default_third_party_id: getSelectVal('cfg-map-third-party') || '',
    };

    await saveBankReconMappings(newMappings);
    closeModal();
    showToast('Parametrización contable de conciliación guardada exitosamente', 'success');
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// GENERADOR AVANZADO DE NOTA DE AJUSTE BANCARIO (CREAR NUEVO O VINCULAR EXISTENTE)
// ═══════════════════════════════════════════════════════════════════════════════

async function openAdjustmentNoteModal(bankAccount: any, movements: any[], accounts: any[], onDoneCb?: () => void) {
  if (!bankAccount) return showToast('Selecciona una cuenta bancaria', 'warning');
  
  const pendingMovs = movements.filter(m => m.bank_account_id === bankAccount.id && !m.reconciled);
  if (!pendingMovs.length) {
    return showToast('No hay movimientos pendientes en el extracto bancario para causar.', 'info');
  }

  const mappings = await getBankReconMappingsAsync();

  // Cargar comprobantes (transaction_types) y terceros activos
  let txTypes: any[] = [];
  let thirdParties: any[] = [];
  try {
    [txTypes, thirdParties] = await Promise.all([
      pb.listAll('transaction_types', { filter: 'active=true', sort: 'name' }),
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    ]);
  } catch (_) {}

  // Determinar Tercero por defecto para el Banco
  let defaultThirdPartyId = bankAccount.third_party_id || mappings.default_third_party_id || '';
  if (!defaultThirdPartyId && bankAccount.bank) {
    const bankKeyword = bankAccount.bank.trim().toLowerCase();
    const matchedThird = thirdParties.find(tp => (tp.name || '').toLowerCase().includes(bankKeyword));
    if (matchedThird) defaultThirdPartyId = matchedThird.id;
  }

  // Pre-clasificación inteligente de rubros por concepto usando parametrización
  const items = pendingMovs.map(m => {
    const desc = (m.description || '').toUpperCase();
    let targetKey = mappings.general || '511595';
    let category = 'Gasto General';
    let catClass = 'badge-gray';

    if (desc.includes('4X1000') || desc.includes('GMF') || desc.includes('IMPTO GOBIERNO') || desc.includes('GRAVAMEN')) {
      targetKey = mappings.gmf || '511505';
      category = '4x1000 / GMF';
      catClass = 'badge-red';
    } else if (desc.includes('COMISION') || desc.includes('SERVICIO') || desc.includes('CUOTA') || desc.includes('PSE') || desc.includes('CORRESPONSAL')) {
      targetKey = mappings.comision || '511515';
      category = 'Comisión / Servicio';
      catClass = 'badge-blue';
    } else if (desc.includes('INTERES') || desc.includes('ABONO INTERES') || desc.includes('RENDIMIENTO')) {
      targetKey = mappings.interes || '421005';
      category = 'Interés / Rendimiento';
      catClass = 'badge-green';
    }

    // Buscar por ID exacto o por código PUC
    let foundAcc = accounts.find(a => a.id === targetKey || (a.code || '').trim() === String(targetKey).trim());
    if (!foundAcc) {
      foundAcc = accounts.find(a => (a.code || '').trim().startsWith(String(targetKey).trim().slice(0, 4)));
    }

    return {
      mov: m,
      selectedAccountId: foundAcc ? foundAcc.id : '',
      category,
      catClass,
      checked: true
    };
  });

  // Tipos de transacción recomendados para notas bancarias y ajustes
  const preferredCodes = ['NB', 'NC', 'AJ', 'CE', 'RC'];
  const suggestedTxTypes = txTypes.filter(t => preferredCodes.includes((t.code || '').toUpperCase()));
  const otherTxTypes = txTypes.filter(t => !preferredCodes.includes((t.code || '').toUpperCase()));

  let preselectedTxTypeId = bankAccount.default_tx_type_id || mappings.default_tx_type_id || '';
  if (!preselectedTxTypeId) {
    const pref = txTypes.find(t => t.code === 'NB') || txTypes.find(t => t.code === 'NC') || txTypes.find(t => t.code === 'AJ') || txTypes[0];
    if (pref) preselectedTxTypeId = pref.id;
  }

  openModal(
    '<i class="fas fa-file-invoice-dollar mr-2 text-emerald-600"></i> Generar Nota de Ajuste Bancario',
    `
    <div class="mb-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
      <i class="fas fa-lightbulb mr-1"></i>
      Se detectaron <strong>${items.length}</strong> movimientos pendientes en el extracto bancario de <strong>${esc(bankAccount.bank)} (${esc(bankAccount.number)})</strong>.
      Decide el destino contable (crear un comprobante nuevo o vincular a uno existente) y verifica las cuentas PUC antes de causar.
    </div>

    <!-- Pestañas de Modo de Destino: Nuevo vs Vincular Existente -->
    <div class="flex gap-2 mb-3 border-b pb-2">
      <button type="button" id="tab-adj-new" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white transition-colors">
        <i class="fas fa-plus-circle mr-1"></i> 1. Generar Nuevo Comprobante
      </button>
      <button type="button" id="tab-adj-link" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
        <i class="fas fa-link mr-1"></i> 2. Vincular a Comprobante Existente
      </button>
    </div>

    <!-- PANEL 1: NUEVO COMPROBANTE -->
    <div id="panel-adj-new">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 text-xs">
        <div class="form-group mb-0">
          <label class="font-bold text-gray-700 block mb-1">Tipo de Comprobante <span class="text-red-500">*</span></label>
          <select id="adj-tx-type" class="form-input w-full font-medium">
            ${suggestedTxTypes.length ? `<optgroup label="Sugeridos para Bancos">${suggestedTxTypes.map(t => `<option value="${esc(t.id)}" ${t.id === preselectedTxTypeId ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)}</option>`).join('')}</optgroup>` : ''}
            ${otherTxTypes.length ? `<optgroup label="Otros">${otherTxTypes.map(t => `<option value="${esc(t.id)}" ${t.id === preselectedTxTypeId ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)}</option>`).join('')}</optgroup>` : ''}
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="font-bold text-gray-700 block mb-1">Tercero / Banco (NIT) <span class="text-red-500">*</span></label>
          <select id="adj-third-party" class="form-input w-full font-medium">
            <option value="">-- Seleccionar Tercero / NIT --</option>
            ${thirdParties.map(tp => `<option value="${esc(tp.id)}" ${tp.id === defaultThirdPartyId ? 'selected' : ''}>${esc(tp.document_number || '')} - ${esc(tp.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="font-bold text-gray-700 block mb-1">Fecha del Comprobante <span class="text-red-500">*</span></label>
          <input id="adj-tx-date" type="date" class="form-input w-full" value="${todayStr()}">
        </div>
        <div class="form-group mb-0">
          <label class="font-bold text-gray-700 block mb-1">Concepto General <span class="text-red-500">*</span></label>
          <input id="adj-tx-desc" class="form-input w-full" value="Ajuste y Notas Bancarias ${esc(bankAccount.bank)} - ${esc(todayStr().slice(0,7))}">
        </div>
      </div>

      <!-- Opción de Unificación y Resumen Contable -->
      <div class="mb-3 bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <input type="checkbox" id="adj-unify-toggle" checked class="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600">
          <div>
            <label for="adj-unify-toggle" class="font-bold text-blue-900 cursor-pointer">
              <i class="fas fa-layer-group text-blue-600 mr-1"></i> Unificar y resumir partidas por cuenta contable PUC (Recomendado)
            </label>
            <p class="text-blue-700 text-[11px] mb-0">Consolida partidas repetidas en líneas contables unificadas con contrapartida bancaria.</p>
          </div>
        </div>
        <span id="adj-unify-badge" class="badge badge-blue text-[11px] font-semibold"><i class="fas fa-check mr-1"></i>Resumen Activo</span>
      </div>

      <!-- Vista previa del Asiento Contable Resultante -->
      <div id="adj-unified-preview-container" class="mb-3 border border-blue-200 rounded-xl p-3 bg-white shadow-xs">
        <h5 class="font-bold text-xs text-blue-900 mb-2 flex items-center justify-between">
          <span><i class="fas fa-list-check text-blue-600 mr-1.5"></i> Vista Previa del Asiento Contable Resultante</span>
          <span id="adj-unified-count-tag" class="text-[11px] text-blue-700 font-normal"></span>
        </h5>
        <div style="max-height:140px; overflow-y:auto;">
          <table class="data-table w-full text-xs" id="adj-unified-table">
            <thead class="bg-blue-50/80 sticky top-0">
              <tr>
                <th>Cuenta Contable PUC</th>
                <th>Tercero Responsable</th>
                <th>Concepto / Resumen</th>
                <th class="text-center">Movs</th>
                <th class="text-right">Débito ($)</th>
                <th class="text-right">Crédito ($)</th>
              </tr>
            </thead>
            <tbody id="adj-unified-tbody">
              <!-- Se llena dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PANEL 2: VINCULAR A COMPROBANTE EXISTENTE -->
    <div id="panel-adj-link" style="display:none;" class="mb-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
      <div class="mb-2 text-amber-900">
        <i class="fas fa-magnifying-glass text-amber-600 mr-1"></i>
        <strong>Vincular a un comprobante contable ya registrado en el sistema:</strong>
        Usa esta opción si el comprobante (ej: Egreso, Recibo o Nota) ya fue creado previamente y solo deseas conciliar sus líneas con el extracto.
      </div>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end mb-3">
        <div class="md:col-span-8 form-group mb-0">
          <label class="font-bold text-gray-700 block mb-1">Buscar Comprobante Existente</label>
          <input id="adj-link-search" class="form-input w-full" placeholder="Buscar por número (ej: NB-00000008, NC-123) o descripción...">
        </div>
        <div class="md:col-span-4 mb-0">
          <button type="button" class="btn btn-secondary w-full" id="btn-adj-link-find" style="height:38px;">
            <i class="fas fa-search mr-1"></i> Buscar Comprobante
          </button>
        </div>
      </div>
      <div id="adj-link-results" style="max-height:140px; overflow-y:auto;" class="bg-white border rounded-lg p-2">
        <p class="text-gray-400 text-center py-3">Ingresa un término para buscar transacciones existentes.</p>
      </div>
      <input type="hidden" id="adj-linked-tx-id" value="">
    </div>

    <!-- Tabla interactiva de selección y asignación de rubros -->
    <div style="max-height:240px; overflow-y:auto;" class="border rounded-xl mb-3">
      <table class="data-table w-full text-xs" id="adj-items-table">
        <thead class="sticky top-0 bg-gray-100 z-10">
          <tr>
            <th style="width:30px"><input type="checkbox" id="adj-check-all" checked></th>
            <th>Fecha</th>
            <th>Descripción Extracto</th>
            <th class="text-right">Monto ($)</th>
            <th>Categoría Sugerida</th>
            <th>Cuenta Contable PUC <span class="text-red-500">*</span></th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => {
            const m = it.mov;
            const amt = m.debit > 0 ? -m.debit : m.credit;
            const isExp = m.debit > 0;
            return `
              <tr id="adj-row-${esc(m.id)}">
                <td><input type="checkbox" class="adj-item-check" data-idx="${idx}" ${it.checked ? 'checked' : ''}></td>
                <td class="whitespace-nowrap font-medium">${esc((m.date || '').slice(0,10))}</td>
                <td title="${esc(m.description)}"><div class="truncate max-w-[220px]">${esc(m.description)}</div></td>
                <td class="text-right font-bold ${isExp ? 'text-red-600' : 'text-emerald-600'}">${fmt(amt)}</td>
                <td><span class="badge ${it.catClass}">${esc(it.category)}</span></td>
                <td>
                  <select class="form-input w-full text-xs adj-acc-select" data-idx="${idx}" style="padding:2px 4px; height:28px;">
                    <option value="">-- Seleccionar Cuenta Contable --</option>
                    ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === it.selectedAccountId ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
                  </select>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Resumen de totales de la Nota -->
    <div class="bg-gray-50 border rounded-xl p-3 text-xs flex flex-wrap justify-between items-center gap-2">
      <div>
        <span class="font-bold text-gray-700">Ítems seleccionados: </span>
        <span id="adj-selected-count" class="font-bold text-blue-600">${items.length}</span> de ${items.length}
      </div>
      <div class="flex gap-4">
        <div><span class="text-gray-500">Gastos/GMF: </span><strong class="text-red-600" id="adj-total-exp">$0</strong></div>
        <div><span class="text-gray-500">Ingresos/Intereses: </span><strong class="text-emerald-600" id="adj-total-inc">$0</strong></div>
        <div><span class="text-gray-500">Neto Banco: </span><strong class="text-blue-700" id="adj-total-net">$0</strong></div>
      </div>
    </div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-adj-note">
      <i class="fas fa-file-invoice-dollar mr-1"></i> Causar y Conciliar Nota de Ajuste
    </button>
    `,
    true
  );

  let currentMode: 'new' | 'link' = 'new';

  // Toggle entre modo Nuevo Comprobante y Vincular Existente
  $('#tab-adj-new')?.addEventListener('click', () => {
    currentMode = 'new';
    $('#tab-adj-new')!.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white transition-colors';
    $('#tab-adj-link')!.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors';
    $('#panel-adj-new')!.style.display = '';
    $('#panel-adj-link')!.style.display = 'none';
    const btn = $('#btn-save-adj-note');
    if (btn) btn.innerHTML = '<i class="fas fa-file-invoice-dollar mr-1"></i> Causar y Conciliar Nota de Ajuste';
    computeUnifiedPreview();
  });

  $('#tab-adj-link')?.addEventListener('click', () => {
    currentMode = 'link';
    $('#tab-adj-link')!.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white transition-colors';
    $('#tab-adj-new')!.className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors';
    $('#panel-adj-new')!.style.display = 'none';
    $('#panel-adj-link')!.style.display = '';
    const btn = $('#btn-save-adj-note');
    if (btn) btn.innerHTML = '<i class="fas fa-link mr-1"></i> Vincular y Conciliar a Comprobante Existente';
  });

  // Buscador de comprobante existente
  const searchLinkedTx = async () => {
    const q = getInputVal('adj-link-search').trim();
    const resBox = $('#adj-link-results');
    if (!resBox) return;

    resBox.innerHTML = `<div class="text-center py-3 text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i> Buscando comprobantes...</div>`;
    try {
      const filters = ['status != "voided"'];
      if (q) {
        filters.push(`(number ~ "${pb.escapeFilterValue(q)}" || description ~ "${pb.escapeFilterValue(q)}")`);
      }
      const txs = await pb.listAll('transactions', {
        filter: filters.join(' && '),
        sort: '-date',
        expand: 'tx_type_id,third_party_id'
      });

      if (!txs.length) {
        resBox.innerHTML = `<div class="text-center py-3 text-gray-500">No se encontraron comprobantes con el criterio "${esc(q)}".</div>`;
        return;
      }

      resBox.innerHTML = `
        <table class="data-table w-full text-xs">
          <thead>
            <tr>
              <th style="width:25px"></th>
              <th>Fecha</th>
              <th>Tipo / Número</th>
              <th>Tercero</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${txs.slice(0, 20).map(t => {
              const ttCode = t.expand?.tx_type_id?.code || '';
              const tpName = t.expand?.third_party_id?.name || '';
              return `
                <tr class="cursor-pointer hover:bg-blue-50" onclick="window._selectAdjLinkedTx('${esc(t.id)}', '${esc(t.number)}')">
                  <td><input type="radio" name="radio-linked-tx" value="${esc(t.id)}" id="radio-tx-${esc(t.id)}"></td>
                  <td class="whitespace-nowrap font-medium">${esc((t.date || '').slice(0, 10))}</td>
                  <td class="font-bold text-blue-700">${esc(ttCode)} ${esc(t.number)}</td>
                  <td title="${esc(tpName)}"><div class="truncate max-w-[150px]">${esc(tpName)}</div></td>
                  <td title="${esc(t.description)}"><div class="truncate max-w-[200px]">${esc(t.description)}</div></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } catch (err: any) {
      resBox.innerHTML = `<div class="text-center py-2 text-red-500">Error en búsqueda: ${esc(err.message)}</div>`;
    }
  };

  (window as any)._selectAdjLinkedTx = (txId: string, txNumber: string) => {
    setInputVal('adj-linked-tx-id', txId);
    const radio = $(`#radio-tx-${txId}`) as HTMLInputElement | null;
    if (radio) radio.checked = true;
    showToast(`Comprobante ${txNumber} seleccionado para vinculación`, 'info');
  };

  $('#btn-adj-link-find')?.addEventListener('click', searchLinkedTx);
  $('#adj-link-search')?.addEventListener('keydown', e => { if (e.key === 'Enter') searchLinkedTx(); });

  const computeUnifiedPreview = () => {
    const unifyChecked = (document.getElementById('adj-unify-toggle') as HTMLInputElement | null)?.checked ?? true;
    const badge = $('#adj-unify-badge');
    const previewContainer = $('#adj-unified-preview-container');
    const selectedThirdId = getSelectVal('adj-third-party');
    const thirdObj = thirdParties.find(tp => tp.id === selectedThirdId);
    const thirdLabel = thirdObj ? `${thirdObj.document_number || ''} - ${thirdObj.name}` : 'Tercero Banco';

    if (badge) {
      badge.className = unifyChecked ? 'badge badge-blue text-[11px] font-semibold' : 'badge badge-gray text-[11px] font-semibold';
      badge.innerHTML = unifyChecked ? '<i class="fas fa-check mr-1"></i>Resumen Activo' : '<i class="fas fa-bars mr-1"></i>Detalle Completo';
    }

    const selected: { it: any; accId: string }[] = [];
    items.forEach((it, idx) => {
      const cb = document.querySelector(`.adj-item-check[data-idx="${idx}"]`) as HTMLInputElement | null;
      const sel = document.querySelector(`.adj-acc-select[data-idx="${idx}"]`) as HTMLSelectElement | null;
      if (cb && cb.checked) {
        const accId = sel ? sel.value : it.selectedAccountId;
        selected.push({ it, accId });
      }
    });

    if (!unifyChecked) {
      if (previewContainer) previewContainer.style.display = 'none';
      return;
    }

    if (previewContainer) previewContainer.style.display = '';

    const groupsMap = new Map<string, { accountId: string; accountObj: any; category: string; count: number; debit: number; credit: number }>();

    selected.forEach(({ it, accId }) => {
      const acc = accounts.find(a => a.id === accId || (a.code || '').trim() === String(accId).trim());
      const key = accId || 'sin_cuenta';

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          accountId: accId,
          accountObj: acc,
          category: it.category || 'Ajuste Bancario',
          count: 0,
          debit: 0,
          credit: 0
        });
      }

      const grp = groupsMap.get(key)!;
      grp.count++;
      if (it.mov.debit > 0) grp.debit += it.mov.debit;
      if (it.mov.credit > 0) grp.credit += it.mov.credit;
    });

    let totExp = 0;
    let totInc = 0;
    let rowsHtml = '';
    let unifiedLinesCount = 0;

    groupsMap.forEach(grp => {
      if (grp.debit > 0 || grp.credit > 0) {
        unifiedLinesCount++;
        totExp += grp.debit;
        totInc += grp.credit;

        const accCode = grp.accountObj ? grp.accountObj.code : '---';
        const accName = grp.accountObj ? grp.accountObj.name : 'Sin cuenta asignada';

        rowsHtml += `
          <tr>
            <td class="font-bold text-blue-900 whitespace-nowrap">${esc(accCode)} - ${esc(accName)}</td>
            <td class="text-gray-700 whitespace-nowrap max-w-[140px] truncate" title="${esc(thirdLabel)}">${esc(thirdLabel)}</td>
            <td>Resumen ${esc(grp.category)} (${grp.count} movimiento${grp.count > 1 ? 's' : ''})</td>
            <td class="text-center font-semibold text-gray-700">${grp.count}</td>
            <td class="text-right font-bold ${grp.debit > 0 ? 'text-red-600' : 'text-gray-400'}">${grp.debit > 0 ? fmt(grp.debit) : '$0'}</td>
            <td class="text-right font-bold ${grp.credit > 0 ? 'text-emerald-600' : 'text-gray-400'}">${grp.credit > 0 ? fmt(grp.credit) : '$0'}</td>
          </tr>
        `;
      }
    });

    const netBank = totInc - totExp;
    if (netBank !== 0) {
      unifiedLinesCount++;
      const bankAccObj = accounts.find(a => a.id === bankAccount.account_id);
      const bCode = bankAccObj ? bankAccObj.code : '1110';
      const bName = bankAccObj ? bankAccObj.name : `Banco ${bankAccount.bank}`;
      const isBankDebit = netBank > 0;

      rowsHtml += `
        <tr class="bg-blue-50/50 font-bold border-t border-blue-200">
          <td class="text-blue-900 whitespace-nowrap">${esc(bCode)} - ${esc(bName)}</td>
          <td class="text-gray-700 whitespace-nowrap max-w-[140px] truncate" title="${esc(thirdLabel)}">${esc(thirdLabel)}</td>
          <td class="text-blue-800">Contrapartida Neta Banco (${selected.length} movimientos procesados)</td>
          <td class="text-center text-blue-800">${selected.length}</td>
          <td class="text-right text-emerald-600">${isBankDebit ? fmt(netBank) : '$0'}</td>
          <td class="text-right text-red-600">${!isBankDebit ? fmt(Math.abs(netBank)) : '$0'}</td>
        </tr>
      `;
    }

    const tbody = $('#adj-unified-tbody');
    if (tbody) {
      tbody.innerHTML = rowsHtml || `<tr><td colspan="6" class="text-center py-3 text-gray-400">Selecciona ítems para ver el resumen del asiento contable.</td></tr>`;
    }

    const countTag = $('#adj-unified-count-tag');
    if (countTag) {
      countTag.innerHTML = `Asiento resultante: <strong class="text-blue-900 font-bold">${unifiedLinesCount} líneas unificadas</strong> con tercero asociado.`;
    }
  };

  const updateSummary = () => {
    let count = 0;
    let totExp = 0;
    let totInc = 0;

    items.forEach((it, idx) => {
      const cb = document.querySelector(`.adj-item-check[data-idx="${idx}"]`) as HTMLInputElement | null;
      if (cb && cb.checked) {
        count++;
        if (it.mov.debit > 0) totExp += it.mov.debit;
        if (it.mov.credit > 0) totInc += it.mov.credit;
      }
    });

    const netBank = totInc - totExp;
    const cntSpan = $('#adj-selected-count');
    const expSpan = $('#adj-total-exp');
    const incSpan = $('#adj-total-inc');
    const netSpan = $('#adj-total-net');
    const saveBtn = $('#btn-save-adj-note') as HTMLButtonElement | null;

    if (cntSpan) cntSpan.textContent = String(count);
    if (expSpan) expSpan.textContent = fmt(totExp);
    if (incSpan) incSpan.textContent = fmt(totInc);
    if (netSpan) netSpan.textContent = fmt(netBank);
    if (saveBtn) saveBtn.disabled = count === 0;

    computeUnifiedPreview();
  };

  $$('#adj-items-table .adj-item-check').forEach(cb => cb.addEventListener('change', updateSummary));
  $('#adj-check-all')?.addEventListener('change', e => {
    const on = !!(e.target as HTMLInputElement).checked;
    $$('#adj-items-table .adj-item-check').forEach(cb => { (cb as HTMLInputElement).checked = on; });
    updateSummary();
  });
  $$('#adj-items-table .adj-acc-select').forEach(sel => {
    sel.addEventListener('change', e => {
      const idx = +(e.target as HTMLElement).dataset.idx!;
      items[idx].selectedAccountId = (e.target as HTMLSelectElement).value;
      updateSummary();
    });
  });
  $('#adj-unify-toggle')?.addEventListener('change', updateSummary);
  $('#adj-third-party')?.addEventListener('change', computeUnifiedPreview);

  updateSummary();

  // Guardar Transacción y Vincular a los Movimientos Bancarios
  $('#btn-save-adj-note')?.addEventListener('click', async () => {
    const selectedItems: any[] = [];
    for (let idx = 0; idx < items.length; idx++) {
      const cb = document.querySelector(`.adj-item-check[data-idx="${idx}"]`) as HTMLInputElement | null;
      const sel = document.querySelector(`.adj-acc-select[data-idx="${idx}"]`) as HTMLSelectElement | null;
      if (cb && cb.checked) {
        const accId = sel ? sel.value : items[idx].selectedAccountId;
        if (!accId) {
          return showToast(`Asigna una cuenta contable para el movimiento "${items[idx].mov.description.slice(0,30)}"`, 'warning');
        }
        selectedItems.push({ ...items[idx], selectedAccountId: accId });
      }
    }

    if (!selectedItems.length) return showToast('Selecciona al menos un movimiento para ajustar', 'warning');

    const saveBtn = $('#btn-save-adj-note') as HTMLButtonElement | null;
    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Procesando...'; }

    try {
      if (currentMode === 'link') {
        // ─── MODO VINCULAR A COMPROBANTE EXISTENTE ────────────────────────
        const linkedTxId = getInputVal('adj-linked-tx-id').trim();
        if (!linkedTxId) {
          if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-link mr-1"></i> Vincular y Conciliar a Comprobante Existente'; }
          return showToast('Selecciona el comprobante existente de la lista para vincular', 'warning');
        }

        // Consultar líneas contables del comprobante seleccionado
        const safeTxId = pb.escapeFilterValue(linkedTxId);
        const existingTxLines = await pb.listAll('tx_lines', { filter: `tx_id="${safeTxId}"` });
        const bankAccLine = existingTxLines.find(l => l.account_id === bankAccount.account_id);

        let reconciledCount = 0;
        for (const it of selectedItems) {
          // Buscar una línea contable coincidente o asociar a la línea del banco
          const matchingLine = existingTxLines.find(l => l.account_id === it.selectedAccountId) || bankAccLine || existingTxLines[0];
          if (matchingLine) {
            await pb.update('bank_movements', it.mov.id, {
              reconciled: true,
              tx_line_id: matchingLine.id
            });
            reconciledCount++;
          }
        }

        closeModal();
        showToast(`Se vincularon y conciliaron ${reconciledCount} movimientos al comprobante seleccionado.`, 'success');
        if (onDoneCb) onDoneCb();
        else renderConciliacion($('#page-content'));
        return;
      }

      // ─── MODO CREAR NUEVO COMPROBANTE ─────────────────────────────────
      const txTypeId = getSelectVal('adj-tx-type');
      const thirdPartyId = getSelectVal('adj-third-party');
      const txDate = getInputVal('adj-tx-date');
      const txDesc = getInputVal('adj-tx-desc').trim();
      const unifyChecked = (document.getElementById('adj-unify-toggle') as HTMLInputElement | null)?.checked ?? true;

      if (!txTypeId || !txDate || !txDesc) {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-file-invoice-dollar mr-1"></i> Causar y Conciliar Nota de Ajuste'; }
        return showToast('Completa el tipo, fecha y concepto del comprobante', 'warning');
      }

      if (!thirdPartyId) {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-file-invoice-dollar mr-1"></i> Causar y Conciliar Nota de Ajuste'; }
        return showToast('Selecciona el Tercero / Banco responsable para el comprobante', 'warning');
      }

      let totExp = 0;
      let totInc = 0;
      const lines: any[] = [];
      const lineMovMap: { lineOrder: number; movIds: string[] }[] = [];

      if (unifyChecked) {
        // Modo Unificado: Agrupar por cuenta contable PUC
        const groupsMap = new Map<string, { accountId: string; category: string; count: number; debit: number; credit: number; debitMovIds: string[]; creditMovIds: string[] }>();

        selectedItems.forEach(it => {
          const accId = it.selectedAccountId;
          if (!groupsMap.has(accId)) {
            groupsMap.set(accId, {
              accountId: accId,
              category: it.category || 'Ajuste Bancario',
              count: 0,
              debit: 0,
              credit: 0,
              debitMovIds: [],
              creditMovIds: []
            });
          }

          const grp = groupsMap.get(accId)!;
          grp.count++;
          if (it.mov.debit > 0) {
            grp.debit += it.mov.debit;
            grp.debitMovIds.push(it.mov.id);
          } else if (it.mov.credit > 0) {
            grp.credit += it.mov.credit;
            grp.creditMovIds.push(it.mov.id);
          }
        });

        let lineOrderIdx = 1;
        groupsMap.forEach(grp => {
          if (grp.debit > 0) {
            totExp += grp.debit;
            const order = lineOrderIdx++;
            lines.push({
              account_id: grp.accountId,
              third_party_id: thirdPartyId,
              debit: grp.debit,
              credit: 0,
              description: `Ajuste ${grp.category} (${grp.debitMovIds.length} movimientos extracto)`,
              line_order: order,
            });
            lineMovMap.push({ lineOrder: order, movIds: grp.debitMovIds });
          }
          if (grp.credit > 0) {
            totInc += grp.credit;
            const order = lineOrderIdx++;
            lines.push({
              account_id: grp.accountId,
              third_party_id: thirdPartyId,
              debit: 0,
              credit: grp.credit,
              description: `Ajuste ${grp.category} (${grp.creditMovIds.length} movimientos extracto)`,
              line_order: order,
            });
            lineMovMap.push({ lineOrder: order, movIds: grp.creditMovIds });
          }
        });

      } else {
        // Modo Detallado: 1 línea por movimiento
        selectedItems.forEach((it, i) => {
          const m = it.mov;
          const order = i + 1;
          if (m.debit > 0) {
            totExp += m.debit;
            lines.push({
              account_id: it.selectedAccountId,
              third_party_id: thirdPartyId,
              debit: m.debit,
              credit: 0,
              description: m.description,
              line_order: order,
            });
            lineMovMap.push({ lineOrder: order, movIds: [m.id] });
          } else if (m.credit > 0) {
            totInc += m.credit;
            lines.push({
              account_id: it.selectedAccountId,
              third_party_id: thirdPartyId,
              debit: 0,
              credit: m.credit,
              description: m.description,
              line_order: order,
            });
            lineMovMap.push({ lineOrder: order, movIds: [m.id] });
          }
        });
      }

      // Contrapartida Neta en la Cuenta Bancaria (bankAccount.account_id) con el NIT del Banco
      const netBank = totInc - totExp;
      if (netBank < 0) {
        lines.unshift({
          account_id: bankAccount.account_id,
          third_party_id: thirdPartyId,
          debit: 0,
          credit: Math.abs(netBank),
          description: txDesc,
          line_order: 0,
        });
      } else if (netBank > 0) {
        lines.unshift({
          account_id: bankAccount.account_id,
          third_party_id: thirdPartyId,
          debit: netBank,
          credit: 0,
          description: txDesc,
          line_order: 0,
        });
      }

      // Crear Transacción Contable vía API con Tercero en Cabecera
      const txPayload = {
        tx_type_id: txTypeId,
        third_party_id: thirdPartyId,
        date: txDate,
        description: txDesc,
        status: 'active',
      };

      const createdTx = await (window as any).API.createTransaction(txPayload, lines);

      // Consultar las líneas creadas para enlazar los bank_movements
      const safeTxId = pb.escapeFilterValue(createdTx.id);
      const createdTxLines = await pb.listAll('tx_lines', { filter: `tx_id="${safeTxId}"` });

      let reconciledOk = 0;
      for (const mapItem of lineMovMap) {
        const matchingTxLine = createdTxLines.find(c => c.line_order === mapItem.lineOrder);
        if (matchingTxLine) {
          const chunkSize = 15;
          for (let i = 0; i < mapItem.movIds.length; i += chunkSize) {
            const chunk = mapItem.movIds.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async mId => {
              try {
                await pb.update('bank_movements', mId, {
                  reconciled: true,
                  tx_line_id: matchingTxLine.id
                });
                reconciledOk++;
              } catch (_) {}
            }));
          }
        }
      }

      closeModal();
      showToast(`Se causó el Comprobante ${createdTx.number || ''} (${lines.length} líneas) y se conciliaron ${reconciledOk} movimientos del extracto.`, 'success');
      if (onDoneCb) onDoneCb();
      else renderConciliacion($('#page-content'));
    } catch (err: any) {
      showToast('Error causando la nota de ajuste: ' + (err.message || ''), 'error');
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-file-invoice-dollar mr-1"></i> Causar y Conciliar Nota de Ajuste'; }
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// MOTOR DE CIERRE FORMAL DE CONCILIACIÓN BANCARIA
// ═══════════════════════════════════════════════════════════════════════════════

async function openCloseReconciliationModal(
  bankAccount: any,
  movements: any[],
  txLines: any[],
  fromDate: string,
  toDate: string,
  onDoneCb?: () => void
) {
  if (!bankAccount) return showToast('Selecciona una cuenta bancaria para cerrar conciliación', 'warning');

  const auxDeb = txLines.reduce((s, l) => s + (l.debit || 0), 0);
  const auxCred = txLines.reduce((s, l) => s + (l.credit || 0), 0);
  const bookBalance = auxDeb - auxCred;

  const bankInc = movements.reduce((s, m) => s + (m.credit || 0), 0);
  const bankExp = movements.reduce((s, m) => s + (m.debit || 0), 0);
  const bankBalance = bankInc - bankExp;

  const difference = bookBalance - bankBalance;

  // Partidas pendientes en extracto y en libros
  const pendingBankMovs = movements.filter(m => !m.reconciled);
  const pendingTxLines = txLines.filter(l => !movements.some(m => m.tx_line_id === l.id));
  const reconciledMovs = movements.filter(m => m.reconciled);

  const isExactMatch = Math.abs(difference) < 1;

  openModal(
    '<i class="fas fa-lock mr-2 text-emerald-600"></i> Cierre y Certificación de Conciliación Bancaria',
    `
    <div class="mb-3 p-3 rounded-xl border ${isExactMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'} text-xs">
      <div class="flex items-center gap-2 font-bold mb-1">
        <i class="fas ${isExactMatch ? 'fa-circle-check text-emerald-600' : 'fa-triangle-exclamation text-amber-600'} text-sm"></i>
        <span>${isExactMatch ? 'Conciliación Cuadrada y Lista para Certificar' : 'Conciliación con Diferencia de Saldos'}</span>
      </div>
      <p class="mb-0 text-[11px]">
        ${isExactMatch 
          ? 'El saldo en libros auxiliares y el saldo del extracto bancario coinciden perfectamente ($0 diferencia). Al cerrar, se generará el Acta Oficial no transaccional con firmas de auditoría.' 
          : 'Existe un delta entre el Libro Auxiliar y el Extracto Bancario. Si corresponde a partidas en tránsito justificadas (ej: cheques girados y no cobrados), registra la justificación contable para expedir el Acta.'}
      </p>
    </div>

    <!-- Resumen Cuantitativo de la Conciliación -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
      <div class="bg-gray-50 border rounded-xl p-3">
        <div class="text-gray-500 font-medium">Saldo Libro Auxiliar</div>
        <div class="text-base font-bold text-gray-800 mt-1">${fmt(bookBalance)}</div>
        <div class="text-[11px] text-gray-500 mt-0.5">Déb: ${fmt(auxDeb)} | Cré: ${fmt(auxCred)}</div>
      </div>
      <div class="bg-gray-50 border rounded-xl p-3">
        <div class="text-gray-500 font-medium">Saldo Extracto Bancario</div>
        <div class="text-base font-bold text-gray-800 mt-1">${fmt(bankBalance)}</div>
        <div class="text-[11px] text-gray-500 mt-0.5">Ing: ${fmt(bankInc)} | Egr: ${fmt(bankExp)}</div>
      </div>
      <div class="bg-gray-50 border rounded-xl p-3">
        <div class="text-gray-500 font-medium">Diferencia de Conciliación</div>
        <div class="text-base font-bold mt-1 ${isExactMatch ? 'text-emerald-600' : 'text-amber-600'}">${fmt(difference)}</div>
        <div class="text-[11px] text-gray-500 mt-0.5">${isExactMatch ? 'Cuadre perfecto (0.00)' : 'Diferencia a justificar'}</div>
      </div>
    </div>

    <!-- Indicadores de Partidas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-xs">
      <div class="p-2.5 rounded-lg border bg-emerald-50/60 border-emerald-200">
        <span class="font-bold text-emerald-800"><i class="fas fa-check-double mr-1"></i> Partidas Conciliadas:</span>
        <strong class="text-emerald-900">${reconciledMovs.length}</strong> de ${movements.length}
      </div>
      <div class="p-2.5 rounded-lg border bg-amber-50/60 border-amber-200">
        <span class="font-bold text-amber-800"><i class="fas fa-clock mr-1"></i> Pendientes Extracto:</span>
        <strong class="text-amber-900">${pendingBankMovs.length}</strong>
      </div>
      <div class="p-2.5 rounded-lg border bg-blue-50/60 border-blue-200">
        <span class="font-bold text-blue-800"><i class="fas fa-book mr-1"></i> Pendientes en Libros:</span>
        <strong class="text-blue-900">${pendingTxLines.length}</strong>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
      <div class="form-group mb-0">
        <label class="font-bold text-gray-700 block mb-1">Período de Corte</label>
        <input class="form-input w-full bg-gray-100 font-medium" value="${esc(fromDate)} hasta ${esc(toDate)}" readonly>
      </div>
      <div class="form-group mb-0">
        <label class="font-bold text-gray-700 block mb-1">Saldo Final Oficial según Extracto del Banco ($)</label>
        <input id="close-recon-bank-bal" type="number" step="0.01" class="form-input w-full font-bold text-gray-800" value="${bankBalance}">
      </div>
    </div>

    <div class="form-group mb-0 text-xs">
      <label class="font-bold text-gray-700 block mb-1">
        Observaciones y Notas Contables de Auditoría
        ${!isExactMatch ? '<span class="text-red-500 font-normal">(Requeridas para justificar partidas en tránsito)</span>' : ''}
      </label>
      <textarea id="close-recon-notes" class="form-input w-full text-xs" rows="3" placeholder="Ej: Se certifica que las partidas conciliatorias en tránsito corresponden a 2 cheques girados pendientes de cobro por proveedores...">${isExactMatch ? 'Conciliación bancaria efectuada a satisfacción sin diferencias de auditoría.' : ''}</textarea>
    </div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-do-close-recon" style="background:#059669;border-color:#047857">
      <i class="fas fa-lock mr-1"></i> Cerrar Período y Emitir Acta Oficial
    </button>
    `,
    true
  );

  $('#btn-do-close-recon')?.addEventListener('click', async () => {
    const notesVal = (getInputVal('close-recon-notes') || '').trim();
    const customBankBal = parseFloat(getInputVal('close-recon-bank-bal')) || bankBalance;

    if (!isExactMatch && !notesVal) {
      return showToast('Por favor ingresa las notas contables justificando la diferencia de saldos antes de cerrar.', 'warning');
    }

    const btn = $('#btn-do-close-recon') as HTMLButtonElement | null;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Cerrando y emitiendo acta...'; }

    try {
      // 1. Armar Snapshot inmutable de la conciliación
      const snapshotData = {
        bankAccount: {
          id: bankAccount.id,
          bank: bankAccount.bank,
          number: bankAccount.number,
          name: bankAccount.name,
          account_code: bankAccount.expand?.account_id?.code || '',
          account_name: bankAccount.expand?.account_id?.name || '',
        },
        balances: {
          bookBalance,
          bankBalance: customBankBal,
          difference: bookBalance - customBankBal,
          auxDeb,
          auxCred,
          bankInc,
          bankExp,
        },
        counts: {
          totalExtracto: movements.length,
          totalLibros: txLines.length,
          reconciledCount: reconciledMovs.length,
          pendingBankCount: pendingBankMovs.length,
          pendingBookCount: pendingTxLines.length,
        },
        pendingBankItems: pendingBankMovs.slice(0, 50).map(m => ({
          date: m.date,
          description: m.description,
          debit: m.debit,
          credit: m.credit,
          ref: m.ref,
        })),
        pendingBookItems: pendingTxLines.slice(0, 50).map(l => ({
          date: l.expand?.tx_id?.date,
          comp: l.expand?.tx_id?.number,
          description: l.description,
          debit: l.debit,
          credit: l.credit,
        })),
      };

      // 2. Crear registro en colección bank_reconciliations
      const reconPayload = {
        bank_account_id: bankAccount.id,
        period_start: fromDate,
        period_end: toDate,
        book_balance: bookBalance,
        bank_balance: customBankBal,
        difference: bookBalance - customBankBal,
        status: 'closed',
        reconciled_count: reconciledMovs.length,
        pending_bank_count: pendingBankMovs.length,
        pending_book_count: pendingTxLines.length,
        closed_by: pb.currentUser?.id || null,
        closed_at: new Date().toISOString(),
        notes: notesVal,
        snapshot_data: snapshotData,
      };

      const createdRecon = await pb.create('bank_reconciliations', reconPayload);

      // 3. Vincular los movimientos conciliados al id de la conciliación
      const updatePromises = reconciledMovs.map(m => pb.update('bank_movements', m.id, { reconciliation_id: createdRecon.id }).catch(() => {}));
      await Promise.allSettled(updatePromises);

      closeModal();
      showToast('Conciliación Bancaria cerrada exitosamente.', 'success');

      if (onDoneCb) onDoneCb();

      // Abrir inmediatamente el Certificado / Acta no transaccional
      openReconciliationCertificateModal(createdRecon);
    } catch (err: any) {
      showToast('Error al cerrar conciliación: ' + (err.message || ''), 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-lock mr-1"></i> Cerrar Período y Emitir Acta Oficial'; }
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// ACTA Y CERTIFICADO DE CONCILIACIÓN BANCARIA (DOCUMENTO NO TRANSACCIONAL)
// ═══════════════════════════════════════════════════════════════════════════════

async function openReconciliationCertificateModal(reconIdOrRecord: any) {
  let recon: any = null;
  if (typeof reconIdOrRecord === 'string') {
    try {
      recon = await pb.get('bank_reconciliations', reconIdOrRecord, { expand: 'bank_account_id,closed_by' });
    } catch (err: any) {
      return showToast('No se pudo cargar el acta de conciliación: ' + err.message, 'error');
    }
  } else {
    recon = reconIdOrRecord;
  }

  if (!recon) return;

  // Cargar datos institucionales de la empresa
  let companyName = 'EMPRESA PRINCIPAL';
  let companyNit = '';
  let companyAddress = '';
  let companyPhone = '';

  try {
    const sets = await pb.listAll('settings', {
      filter: 'key="company" || key="company_name" || key="company_nit" || key="company_address" || key="company_phone"'
    });
    sets.forEach(s => {
      if (s.key === 'company_name' || s.key === 'company') companyName = s.value || companyName;
      if (s.key === 'company_nit') companyNit = s.value || '';
      if (s.key === 'company_address') companyAddress = s.value || '';
      if (s.key === 'company_phone') companyPhone = s.value || '';
    });
  } catch (_) {}

  const snap = recon.snapshot_data || {};
  const bankAcc = recon.expand?.bank_account_id || snap.bankAccount || {};
  const balances = snap.balances || {
    bookBalance: recon.book_balance || 0,
    bankBalance: recon.bank_balance || 0,
    difference: recon.difference || 0,
  };

  const closedDateStr = recon.closed_at 
    ? new Date(recon.closed_at).toLocaleString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : todayStr();

  const auditorName = recon.expand?.closed_by?.name || 'Departamento Contable';
  const pendingBankItems: any[] = snap.pendingBankItems || [];
  const pendingBookItems: any[] = snap.pendingBookItems || [];

  const certificateHtml = `
    <div id="recon-certificate-doc" class="bg-white text-gray-900 p-6 rounded-xl border shadow-sm font-sans" style="max-width:850px; margin:0 auto; font-size:12px; line-height:1.4;">
      <!-- Encabezado Institucional -->
      <div class="border-b-2 border-gray-800 pb-3 mb-4 flex justify-between items-start">
        <div>
          <h2 class="text-lg font-extrabold uppercase tracking-wide text-gray-900 m-0">${esc(companyName)}</h2>
          <p class="text-xs text-gray-600 m-0 font-medium">NIT: ${esc(companyNit || 'S.N.')} | ${esc(companyAddress)} ${companyPhone ? ' - Tel: ' + esc(companyPhone) : ''}</p>
          <p class="text-xs font-semibold text-blue-700 m-0 mt-1 uppercase">Módulo de Tesorería y Control Financiero</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
            <i class="fas fa-certificate mr-1"></i> Documento Certificado
          </span>
          <div class="text-[11px] text-gray-500">Acta N°: <strong>ACTA-${esc((recon.period_end || '').slice(0,7).replace('-',''))}-${esc(bankAcc.bank || 'BANCO').slice(0,4).toUpperCase()}</strong></div>
          <div class="text-[11px] text-gray-500">Fecha de Cierre: ${esc(closedDateStr)}</div>
        </div>
      </div>

      <!-- Título del Documento -->
      <div class="text-center my-4">
        <h3 class="text-base font-black uppercase text-gray-900 tracking-wider m-0">CERTIFICADO Y ACTA DE CONCILIACIÓN BANCARIA</h3>
        <p class="text-xs text-gray-600 font-medium m-0 mt-0.5">Control Interno No Transaccional y Certificación de Saldos</p>
      </div>

      <!-- Datos de la Cuenta y Período -->
      <div class="grid grid-cols-2 gap-3 mb-4 bg-gray-50 border rounded-lg p-3 text-xs">
        <div>
          <div><span class="font-bold text-gray-700">Entidad Bancaria:</span> ${esc(bankAcc.bank || 'Banco')}</div>
          <div><span class="font-bold text-gray-700">Número de Cuenta:</span> ${esc(bankAcc.number || '')} (${esc(bankAcc.name || '')})</div>
          <div><span class="font-bold text-gray-700">Cuenta PUC Asociada:</span> ${esc(bankAcc.account_code || bankAcc.expand?.account_id?.code || '1110')} - ${esc(bankAcc.account_name || bankAcc.expand?.account_id?.name || '')}</div>
        </div>
        <div>
          <div><span class="font-bold text-gray-700">Período Conciliado:</span> Del <strong>${esc(recon.period_start)}</strong> al <strong>${esc(recon.period_end)}</strong></div>
          <div><span class="font-bold text-gray-700">Estado del Proceso:</span> <strong class="text-emerald-700 uppercase">Conciliación Cerrada al 100%</strong></div>
          <div><span class="font-bold text-gray-700">Responsable de Cierre:</span> ${esc(auditorName)}</div>
        </div>
      </div>

      <!-- ESTADO DE CONCILIACIÓN BANCARIA (ECUACIÓN FORMAL) -->
      <div class="mb-4">
        <h4 class="font-bold text-xs uppercase text-gray-800 border-b pb-1 mb-2">1. Estado Cuantitativo de Conciliación de Saldos</h4>
        <table class="w-full border text-xs" style="border-collapse:collapse;">
          <tbody>
            <tr class="border-b bg-gray-50 font-bold">
              <td class="p-2 text-gray-800">Saldo Final según Libro Auxiliar Contable (al corte ${esc(recon.period_end)})</td>
              <td class="p-2 text-right text-gray-900 w-36">${fmt(balances.bookBalance)}</td>
            </tr>
            <tr class="border-b text-gray-700">
              <td class="p-2 pl-6">(+) Partidas del Extracto pendientes de registrar en libros (Ingresos no contabilizados)</td>
              <td class="p-2 text-right text-emerald-700">$0</td>
            </tr>
            <tr class="border-b text-gray-700">
              <td class="p-2 pl-6">(-) Partidas del Extracto pendientes de registrar en libros (Gastos/ND no contabilizados)</td>
              <td class="p-2 text-right text-red-700">$0</td>
            </tr>
            <tr class="border-b text-gray-700">
              <td class="p-2 pl-6">(+) Consignaciones en tránsito (registradas en libros, no reflejadas por el banco)</td>
              <td class="p-2 text-right text-emerald-700">${fmt(pendingBookItems.filter(b => b.debit > 0).reduce((s, x) => s + x.debit, 0))}</td>
            </tr>
            <tr class="border-b text-gray-700">
              <td class="p-2 pl-6">(-) Cheques girados y no cobrados / Transferencias en tránsito</td>
              <td class="p-2 text-right text-red-700">${fmt(pendingBookItems.filter(b => b.credit > 0).reduce((s, x) => s + x.credit, 0))}</td>
            </tr>
            <tr class="border-b bg-emerald-50/70 font-bold">
              <td class="p-2 text-emerald-950 font-extrabold">(=) Saldo Conciliado según Extracto Oficial del Banco</td>
              <td class="p-2 text-right text-emerald-800 font-extrabold">${fmt(balances.bankBalance)}</td>
            </tr>
            <tr class="bg-gray-100 font-bold">
              <td class="p-2 text-gray-900">DIFERENCIA NETA DE CONCILIACIÓN</td>
              <td class="p-2 text-right ${Math.abs(balances.difference) < 1 ? 'text-emerald-700' : 'text-amber-700'}">${fmt(balances.difference)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PARTIDAS CONCILIATORIAS EN TRÁNSITO (SI EXISTEN) -->
      ${(pendingBookItems.length > 0 || pendingBankItems.length > 0) ? `
      <div class="mb-4">
        <h4 class="font-bold text-xs uppercase text-gray-800 border-b pb-1 mb-2">2. Anexo de Partidas Conciliatorias en Tránsito</h4>
        <table class="w-full border text-[11px]" style="border-collapse:collapse;">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-1.5 text-left border">Origen</th>
              <th class="p-1.5 text-left border">Fecha</th>
              <th class="p-1.5 text-left border">Documento / Ref</th>
              <th class="p-1.5 text-left border">Concepto / Tercero</th>
              <th class="p-1.5 text-right border">Monto ($)</th>
            </tr>
          </thead>
          <tbody>
            ${pendingBookItems.map(it => `
              <tr class="border-b">
                <td class="p-1.5 border font-semibold text-blue-700">Libro Auxiliar</td>
                <td class="p-1.5 border">${esc((it.date || '').slice(0,10))}</td>
                <td class="p-1.5 border">${esc(it.comp || 'Tx')}</td>
                <td class="p-1.5 border">${esc(it.description || '')}</td>
                <td class="p-1.5 border text-right font-medium">${fmt(it.debit > 0 ? it.debit : -it.credit)}</td>
              </tr>
            `).join('')}
            ${pendingBankItems.map(it => `
              <tr class="border-b">
                <td class="p-1.5 border font-semibold text-amber-700">Extracto Bancario</td>
                <td class="p-1.5 border">${esc((it.date || '').slice(0,10))}</td>
                <td class="p-1.5 border">${esc(it.ref || 'Mov')}</td>
                <td class="p-1.5 border">${esc(it.description || '')}</td>
                <td class="p-1.5 border text-right font-medium">${fmt(it.credit > 0 ? it.credit : -it.debit)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Notas y Observaciones de Auditoría -->
      <div class="mb-5 bg-gray-50 border rounded-lg p-3 text-xs">
        <span class="font-bold text-gray-800 block mb-1">Notas y Dictamen de Conciliación:</span>
        <p class="text-gray-700 mb-0 italic">${esc(recon.notes || 'Conciliación bancaria cerrada y aprobada sin discrepancias contables. Los saldos en libros y extracto corresponden con exactitud.')}</p>
      </div>

      <!-- Declaración de Certificación -->
      <p class="text-[11px] text-gray-600 text-justify mb-6" style="line-height:1.5;">
        <strong>Certificación:</strong> En cumplimiento de las disposiciones legales y de control interno contable, se hace constar que los saldos y operaciones aquí consignados han sido verificados integralmente cruzando el Libro Auxiliar del software con el Extracto expedido por la entidad financiera, encontrándose la conciliación cerrada, cuadrada y soportada a satisfacción.
      </p>

      <!-- Bloque Formal de Firmas Contables -->
      <div class="grid grid-cols-3 gap-6 pt-6 border-t border-gray-300 text-center text-xs">
        <div>
          <div class="border-b border-gray-400 mb-1" style="height:38px;"></div>
          <strong class="block text-gray-800">ELABORÓ</strong>
          <span class="text-[11px] text-gray-600 block">${esc(auditorName)}</span>
          <span class="text-[10px] text-gray-400">Tesorero / Auxiliar Contable</span>
        </div>
        <div>
          <div class="border-b border-gray-400 mb-1" style="height:38px;"></div>
          <strong class="block text-gray-800">REVISÓ</strong>
          <span class="text-[11px] text-gray-600 block">Contador Público</span>
          <span class="text-[10px] text-gray-400">T.P. Nº: ____________________</span>
        </div>
        <div>
          <div class="border-b border-gray-400 mb-1" style="height:38px;"></div>
          <strong class="block text-gray-800">APROBÓ</strong>
          <span class="text-[11px] text-gray-600 block">Revisor Fiscal / Gerente</span>
          <span class="text-[10px] text-gray-400">C.C. / T.P.: ____________________</span>
        </div>
      </div>
    </div>
  `;

  openModal(
    '<i class="fas fa-certificate mr-2 text-emerald-600"></i> Acta y Certificado de Conciliación Bancaria',
    `
    <div class="mb-3 flex justify-between items-center text-xs bg-gray-50 border p-2.5 rounded-xl">
      <span class="text-gray-600">
        <i class="fas fa-info-circle text-blue-500 mr-1"></i>
        Este es un <strong>documento no transaccional</strong> de auditoría contable. Puedes imprimirlo directamente o descargarlo en PDF.
      </span>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm" id="btn-cert-print">
          <i class="fas fa-print mr-1"></i> Imprimir Acta
        </button>
        <button class="btn btn-primary btn-sm" id="btn-cert-pdf" style="background:#059669;border-color:#047857">
          <i class="fas fa-file-pdf mr-1"></i> Descargar PDF
        </button>
      </div>
    </div>
    <div style="max-height:calc(100vh - 280px); overflow-y:auto;" class="border rounded-xl p-2 bg-gray-100">
      ${certificateHtml}
    </div>
    `,
    `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
    true
  );

  // Botón Imprimir
  $('#btn-cert-print')?.addEventListener('click', () => {
    printReconciliationCertificate(companyName, companyNit, bankAcc, recon, balances, pendingBookItems, pendingBankItems, auditorName, closedDateStr);
  });

  // Botón Descargar PDF
  $('#btn-cert-pdf')?.addEventListener('click', () => {
    downloadReconciliationPdf(companyName, companyNit, bankAcc, recon, balances, pendingBookItems, pendingBankItems, auditorName, closedDateStr);
  });
}

// Impresión limpia del Acta vía ventana emergente
function printReconciliationCertificate(
  companyName: string,
  companyNit: string,
  bankAcc: any,
  recon: any,
  balances: any,
  pendingBookItems: any[],
  pendingBankItems: any[],
  auditorName: string,
  closedDateStr: string
) {
  const printWin = window.open('', '_blank', 'width=900,height=800');
  if (!printWin) return showToast('Permite ventanas emergentes para imprimir el certificado', 'warning');

  const content = document.getElementById('recon-certificate-doc')?.innerHTML || '';
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Acta de Conciliación Bancaria - ${esc(bankAcc.bank || '')} (${esc(recon.period_end || '')})</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111827; margin: 20px; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #D1D5DB; padding: 6px 8px; }
        th { background-color: #F3F4F6; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .border-b { border-bottom: 1px solid #D1D5DB; }
        @media print {
          body { margin: 0; }
          @page { size: letter; margin: 1.5cm; }
        }
      </style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

// Generación de PDF oficial descargable con jsPDF
function downloadReconciliationPdf(
  companyName: string,
  companyNit: string,
  bankAcc: any,
  recon: any,
  balances: any,
  pendingBookItems: any[],
  pendingBankItems: any[],
  auditorName: string,
  closedDateStr: string
) {
  const jsPdfCtor = (window as any).jspdf?.jsPDF;
  if (!jsPdfCtor) {
    return showToast('El generador PDF no está listo en esta vista. Puedes usar el botón "Imprimir Acta" y guardar como PDF.', 'warning');
  }

  try {
    const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(companyName.toUpperCase(), pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`NIT: ${companyNit || 'S.N.'} - Módulo de Tesorería y Conciliación Bancaria`, pageWidth / 2, 58, { align: 'center' });

    doc.setDrawColor(20, 83, 45);
    doc.setLineWidth(1.5);
    doc.line(40, 68, pageWidth - 40, 68);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('CERTIFICADO Y ACTA DE CONCILIACIÓN BANCARIA', pageWidth / 2, 85, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Corte: ${recon.period_start} al ${recon.period_end}  |  Acta N°: ACTA-${(recon.period_end || '').slice(0,7).replace('-','')}-${(bankAcc.bank || 'BANCO').slice(0,4).toUpperCase()}  |  Emisión: ${closedDateStr}`, pageWidth / 2, 98, { align: 'center' });

    // Cuadro de Cuenta
    const infoY = 112;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, infoY, pageWidth - 80, 42, 4, 4, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Banco / Entidad:', 50, infoY + 16);
    doc.text('Cuenta Bancaria:', 50, infoY + 30);
    doc.text('Cuenta PUC Software:', 320, infoY + 16);
    doc.text('Auditor / Cerrado por:', 320, infoY + 30);

    doc.setFont('helvetica', 'normal');
    doc.text(bankAcc.bank || 'Banco', 130, infoY + 16);
    doc.text(`${bankAcc.number || ''} (${bankAcc.name || ''})`, 130, infoY + 30);
    doc.text(`${bankAcc.account_code || '1110'} - ${bankAcc.account_name || 'Bancos'}`, 425, infoY + 16);
    doc.text(auditorName, 425, infoY + 30);

    // Tabla de Conciliación de Saldos
    const tableBody = [
      ['Saldo Final según Libro Auxiliar Contable', fmt(balances.bookBalance)],
      ['(+) Partidas del Extracto no causadas en libros', '$0'],
      ['(-) Partidas del Extracto no causadas en libros', '$0'],
      ['(+) Consignaciones en tránsito (libros no extracto)', fmt(pendingBookItems.filter(b => b.debit > 0).reduce((s, x) => s + x.debit, 0))],
      ['(-) Cheques girados y no cobrados / pendientes', fmt(pendingBookItems.filter(b => b.credit > 0).reduce((s, x) => s + x.credit, 0))],
      ['(=) Saldo Conciliado según Extracto Oficial del Banco', fmt(balances.bankBalance)],
      ['DIFERENCIA NETA DE CONCILIACIÓN', fmt(balances.difference)],
    ];

    (doc as any).autoTable({
      startY: 165,
      head: [['Concepto / Estado de Conciliación', 'Valor']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: pageWidth - 80 - 100 },
        1: { cellWidth: 100, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 40, right: 40 },
    });

    let lastY = (doc as any).lastAutoTable?.finalY || 320;

    // Tabla de Partidas Conciliatorias (si existen)
    if (pendingBookItems.length > 0 || pendingBankItems.length > 0) {
      const pendingRows = [
        ...pendingBookItems.map(it => ['Libro', it.date?.slice(0,10) || '', it.comp || '', it.description || '', fmt(it.debit > 0 ? it.debit : -it.credit)]),
        ...pendingBankItems.map(it => ['Extracto', it.date?.slice(0,10) || '', it.ref || '', it.description || '', fmt(it.credit > 0 ? it.credit : -it.debit)]),
      ];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Anexo: Partidas Conciliatorias en Tránsito', 40, lastY + 20);

      (doc as any).autoTable({
        startY: lastY + 26,
        head: [['Origen', 'Fecha', 'Ref', 'Concepto', 'Monto']],
        body: pendingRows.slice(0, 15),
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 55 },
          2: { cellWidth: 60 },
          3: { cellWidth: pageWidth - 80 - 245 },
          4: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 40, right: 40 },
      });

      lastY = (doc as any).lastAutoTable?.finalY || lastY + 100;
    }

    // Dictamen y Observaciones
    if (lastY > 580) {
      doc.addPage();
      lastY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Observaciones y Dictamen:', 40, lastY + 20);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(recon.notes || 'Conciliación bancaria cerrada y certificada sin diferencias.', pageWidth - 80);
    doc.text(splitNotes, 40, lastY + 32);

    const signY = Math.max(lastY + 80, 640);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.8);

    doc.line(50, signY, 190, signY);
    doc.line(220, signY, 360, signY);
    doc.line(390, signY, 530, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('ELABORÓ', 120, signY + 12, { align: 'center' });
    doc.text('REVISÓ', 290, signY + 12, { align: 'center' });
    doc.text('APROBÓ', 460, signY + 12, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(auditorName, 120, signY + 23, { align: 'center' });
    doc.text('Contador Público - T.P.', 290, signY + 23, { align: 'center' });
    doc.text('Revisor Fiscal / Gerente', 460, signY + 23, { align: 'center' });

    const fileName = `Acta_Conciliacion_${(bankAcc.bank || 'BANCO').replace(/\s+/g,'_')}_${(recon.period_end || '').replace(/-/g,'')}.pdf`;
    doc.save(fileName);
    showToast(`PDF ${fileName} descargado correctamente`, 'success');
  } catch (pdfErr: any) {
    showToast('Error generando PDF: ' + pdfErr.message, 'error');
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// HISTORIAL DE ACTAS Y CONCILIACIONES CERRADAS
// ═══════════════════════════════════════════════════════════════════════════════

async function openReconciliationsHistoryModal(bankAccount: any) {
  if (!bankAccount) return showToast('Selecciona una cuenta bancaria', 'warning');

  let closures: any[] = [];
  try {
    const safeBId = pb.escapeFilterValue(bankAccount.id);
    closures = await pb.listAll('bank_reconciliations', {
      filter: `bank_account_id="${safeBId}"`,
      sort: '-period_end',
      expand: 'closed_by,reopened_by'
    });
  } catch (err: any) {
    return showToast('Error cargando historial de conciliaciones: ' + err.message, 'error');
  }

  const renderHistoryRows = () => {
    if (!closures.length) {
      return `<tr><td colspan="7" class="text-center py-6 text-gray-400">No hay conciliaciones cerradas para esta cuenta bancaria.</td></tr>`;
    }

    return closures.map(c => {
      const isClosed = c.status === 'closed';
      const statusBadge = isClosed 
        ? '<span class="badge badge-green"><i class="fas fa-certificate mr-1"></i>Cerrada</span>'
        : '<span class="badge badge-orange"><i class="fas fa-rotate-left mr-1"></i>Reabierta</span>';

      return `
        <tr class="hover:bg-gray-50 text-xs">
          <td class="font-bold text-gray-900">${esc(c.period_start)} al ${esc(c.period_end)}</td>
          <td class="text-right font-medium">${fmt(c.book_balance || 0)}</td>
          <td class="text-right font-medium">${fmt(c.bank_balance || 0)}</td>
          <td class="text-right font-bold ${Math.abs(c.difference || 0) < 1 ? 'text-emerald-600' : 'text-amber-600'}">${fmt(c.difference || 0)}</td>
          <td class="text-center">${statusBadge}</td>
          <td class="text-gray-600">${esc(c.expand?.closed_by?.name || 'Contabilidad')}</td>
          <td class="text-center">
            <div class="flex justify-center gap-1">
              <button class="btn btn-outline btn-sm" style="padding:2px 6px; font-size:11px;" title="Ver Acta / Certificado" onclick="window.openReconciliationCertificateModal('${esc(c.id)}')">
                <i class="fas fa-file-lines text-emerald-700"></i>
              </button>
              ${(can('canWrite') && isClosed) ? `
              <button class="btn btn-outline btn-sm text-amber-600 border-amber-300" style="padding:2px 6px; font-size:11px;" title="Reabrir Conciliación" onclick="window._reopenReconciliation('${esc(c.id)}')">
                <i class="fas fa-lock-open"></i>
              </button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  (window as any)._reopenReconciliation = async (reconId: string) => {
    if (!confirm('¿Estás seguro de REABRIR este período de conciliación?\n\nEsta acción quitará el bloqueo formal para permitir ajustes contables o re-conciliaciones. Se registrará la reapertura en la auditoría.')) {
      return;
    }

    try {
      await pb.update('bank_reconciliations', reconId, {
        status: 'reopened',
        reopened_by: pb.currentUser?.id || null,
        reopened_at: new Date().toISOString(),
      });
      showToast('Período de conciliación reabierto correctamente', 'info');
      closeModal();
      renderConciliacion($('#page-content'));
    } catch (err: any) {
      showToast('Error reabriendo conciliación: ' + err.message, 'error');
    }
  };

  openModal(
    `<i class="fas fa-certificate mr-2 text-emerald-600"></i> Historial de Actas y Conciliaciones - ${esc(bankAccount.bank)} (${esc(bankAccount.number)})`,
    `
    <div class="mb-3 text-xs text-gray-600 bg-gray-50 border rounded-xl p-3">
      Histórico oficial de conciliaciones bancarias periódicas certificadas. Puedes consultar y reimprimir cualquier acta o descargar su PDF correspondiente.
    </div>
    <div style="max-height:360px; overflow-y:auto;" class="border rounded-xl">
      <table class="data-table w-full text-xs">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th>Período Auditado</th>
            <th class="text-right">Saldo Libros ($)</th>
            <th class="text-right">Saldo Extracto ($)</th>
            <th class="text-right">Diferencia ($)</th>
            <th class="text-center">Estado</th>
            <th>Cerrado por</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${renderHistoryRows()}
        </tbody>
      </table>
    </div>
    `,
    `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
    true
  );
}

// --- VITE MIGRATION GLOBALS ---
(window as any).openBankReconConfigModal = openBankReconConfigModal;
(window as any).openAdjustmentNoteModal = openAdjustmentNoteModal;
(window as any).renderConciliacion = renderConciliacion;
(window as any)._normText = _normText;
(window as any)._renderColMapper = _renderColMapper;
(window as any)._parseExcelDate = _parseExcelDate;
(window as any)._parsePdfText = _parsePdfText;
(window as any).openBankAccountsManager = openBankAccountsManager;
(window as any)._autoMapColumns = _autoMapColumns;
(window as any).openImportModal = openImportModal;
(window as any)._handleExcelFile = _handleExcelFile;
(window as any)._parseColNum = _parseColNum;
(window as any).buildReconSuggestions = buildReconSuggestions;
(window as any)._importRows = _importRows;
(window as any)._renderImportStep1 = _renderImportStep1;
(window as any)._removeImportRow = _removeImportRow;
(window as any)._COL_KEYS = _COL_KEYS;
(window as any)._renderImportPreview = _renderImportPreview;
(window as any)._parseSignedColNum = _parseSignedColNum;
(window as any)._daysDiff = _daysDiff;
(window as any).openClearMovementsModal = openClearMovementsModal;
(window as any)._doImport = _doImport;
(window as any)._importBankAccId = _importBankAccId;
(window as any)._asDateOnly = _asDateOnly;
(window as any).openBankMovementForm = openBankMovementForm;
(window as any).toggleRecon = toggleRecon;
(window as any)._textOverlap = _textOverlap;
(window as any).openCloseReconciliationModal = openCloseReconciliationModal;
(window as any).openReconciliationCertificateModal = openReconciliationCertificateModal;
(window as any).openReconciliationsHistoryModal = openReconciliationsHistoryModal;
(window as any).printReconciliationCertificate = printReconciliationCertificate;
(window as any).downloadReconciliationPdf = downloadReconciliationPdf;

