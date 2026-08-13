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
      pb.listAll('bank_accounts', { sort: 'name', expand: 'account_id' }),
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
          <button class="btn btn-secondary" id="btn-config-recon-mapping" title="Configurar Cuentas PUC de Ajuste"><i class="fas fa-gear"></i></button>
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
      openAdjustmentNoteModal(currentBankAcc, movements, accounts);
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
// PARAMETRIZACIÓN DE CUENTAS PUC PARA NOTAS DE AJUSTE BANCARIO
// ═══════════════════════════════════════════════════════════════════════════════

function getBankReconMappings() {
  try {
    const raw = localStorage.getItem('gravy_bank_recon_mappings_v1');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    gmf: '511505',
    comision: '511515',
    interes: '421005',
    general: '511595',
  };
}

function saveBankReconMappings(mappings) {
  try {
    localStorage.setItem('gravy_bank_recon_mappings_v1', JSON.stringify(mappings));
  } catch (err) {
    console.error('Error guardando mapeos de conciliación:', err);
  }
}

function openBankReconConfigModal(accounts: any[]) {
  const current = getBankReconMappings();

  openModal(
    '<i class="fas fa-gear mr-2 text-blue-600"></i> Parametrización de Cuentas PUC para Notas de Ajuste',
    `
    <div class="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
      <i class="fas fa-info-circle mr-1"></i>
      Asigna las cuentas contables del PUC por defecto que utilizará el generador automático de Notas de Ajuste Bancario para cada categoría.
    </div>

    <div class="space-y-3 text-xs">
      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-red">4x1000 / GMF</span>
          <span>Impuesto al Movimiento Financiero</span>
        </label>
        <p class="text-gray-500 mb-2">Se aplicará a movimientos con descripciones como "4X1000", "GMF", "IMPTO GOBIERNO".</p>
        <select id="cfg-map-gmf" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.gmf || a.code === current.gmf ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-blue">Comisiones / Servicios</span>
          <span>Comisiones Bancarias y PSE</span>
        </label>
        <p class="text-gray-500 mb-2">Se aplicará a transferencias, pagos PSE, corresponsales y cuotas de manejo.</p>
        <select id="cfg-map-comision" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.comision || a.code === current.comision ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-green">Intereses / Rendimientos</span>
          <span>Abono de Intereses sobre Saldos</span>
        </label>
        <p class="text-gray-500 mb-2">Se aplicará a ingresos por rendimientos o abonados de interés por el banco.</p>
        <select id="cfg-map-interes" class="form-input w-full font-medium">
          <option value="">-- Seleccionar Cuenta PUC --</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${a.id === current.interes || a.code === current.interes ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group mb-0 border p-3 rounded-xl bg-gray-50">
        <label class="font-bold text-gray-800 block mb-1 flex items-center gap-2">
          <span class="badge badge-gray">Gastos Generales</span>
          <span>Otros Gastos Bancarios</span>
        </label>
        <p class="text-gray-500 mb-2">Se aplicará por defecto a cualquier otro egreso bancario no categorizado.</p>
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

  $('#btn-save-recon-cfg')?.addEventListener('click', () => {
    const gmfVal = getSelectVal('cfg-map-gmf');
    const comisionVal = getSelectVal('cfg-map-comision');
    const interesVal = getSelectVal('cfg-map-interes');
    const generalVal = getSelectVal('cfg-map-general');

    const newMappings = {
      gmf: gmfVal || '511505',
      comision: comisionVal || '511515',
      interes: interesVal || '421005',
      general: generalVal || '511595',
    };

    saveBankReconMappings(newMappings);
    closeModal();
    showToast('Parametrización de cuentas contables guardada correctamente', 'success');
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERADOR DE NOTA DE AJUSTE BANCARIO (CAUSACIÓN Y CRUCE DE PARTIDAS DEL BANCO)
// ═══════════════════════════════════════════════════════════════════════════════

function openAdjustmentNoteModal(bankAccount, movements, accounts) {
  if (!bankAccount) return showToast('Selecciona una cuenta bancaria', 'warning');
  
  const pendingMovs = movements.filter(m => m.bank_account_id === bankAccount.id && !m.reconciled);
  if (!pendingMovs.length) {
    return showToast('No hay movimientos pendientes en el extracto bancario para causar.', 'info');
  }

  const mappings = getBankReconMappings();

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

  openModal(
    '<i class="fas fa-file-invoice-dollar mr-2 text-emerald-600"></i> Generar Nota de Ajuste Bancario',
    `
    <div class="mb-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
      <i class="fas fa-lightbulb mr-1"></i>
      Se detectaron <strong>${items.length}</strong> movimientos pendientes en el extracto bancario de <strong>${esc(bankAccount.bank)} (${esc(bankAccount.number)})</strong>.
      Asigna o confirma la cuenta contable PUC para cada rubro antes de generar la nota de ajuste contable.
    </div>

    <!-- Opción de Unificación y Resumen Contable -->
    <div class="mb-3 bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <input type="checkbox" id="adj-unify-toggle" checked class="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600">
        <div>
          <label for="adj-unify-toggle" class="font-bold text-blue-900 cursor-pointer">
            <i class="fas fa-layer-group text-blue-600 mr-1"></i> Unificar y resumir partidas por cuenta contable PUC (Recomendado)
          </label>
          <p class="text-blue-700 text-[11px] margin-0">Consolida partidas repetidas (ej. 130 movimientos de GMF/Comisiones en ~5 líneas contables unificadas).</p>
        </div>
      </div>
      <span id="adj-unify-badge" class="badge badge-blue text-[11px] font-semibold"><i class="fas fa-check mr-1"></i>Resumen Activo</span>
    </div>

    <!-- Vista previa de Asiento Contable Resultante (Unificado) -->
    <div id="adj-unified-preview-container" class="mb-3 border border-blue-200 rounded-xl p-3 bg-white shadow-xs">
      <h5 class="font-bold text-xs text-blue-900 mb-2 flex items-center justify-between">
        <span><i class="fas fa-list-check text-blue-600 mr-1.5"></i> Vista Previa del Asiento Contable Resultante</span>
        <span id="adj-unified-count-tag" class="text-[11px] text-blue-700 font-normal"></span>
      </h5>
      <div style="max-height:150px; overflow-y:auto;">
        <table class="data-table w-full text-xs" id="adj-unified-table">
          <thead class="bg-blue-50/80 sticky top-0">
            <tr>
              <th>Cuenta Contable PUC</th>
              <th>Concepto / Resumen</th>
              <th class="text-center">Movimientos</th>
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

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-xs">
      <div class="form-group mb-0">
        <label class="font-bold text-gray-600 block mb-1">Tipo de Comprobante <span class="text-red-500">*</span></label>
        <select id="adj-tx-type" class="form-input w-full">
          <option value="">Cargando tipos de comprobante...</option>
        </select>
      </div>
      <div class="form-group mb-0">
        <label class="font-bold text-gray-600 block mb-1">Fecha del Comprobante <span class="text-red-500">*</span></label>
        <input id="adj-tx-date" type="date" class="form-input w-full" value="${todayStr()}">
      </div>
      <div class="form-group mb-0">
        <label class="font-bold text-gray-600 block mb-1">Concepto General <span class="text-red-500">*</span></label>
        <input id="adj-tx-desc" class="form-input w-full" value="Ajuste y Notas Bancarias Extracto ${esc(bankAccount.bank)} - ${esc(todayStr().slice(0,7))}">
      </div>
    </div>

    <!-- Tabla interactiva de asignación de rubros -->
    <div style="max-height:260px; overflow-y:auto;" class="border rounded-xl mb-3">
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
                <td title="${esc(m.description)}"><div class="truncate max-w-[200px]">${esc(m.description)}</div></td>
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
    <div class="bg-gray-50 border rounded-xl p-3 text-xs flex justify-between items-center">
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

  // Cargar Tipos de Comprobante (transaction_types)
  (async () => {
    try {
      const txTypes = await pb.listAll('transaction_types', { filter: 'active=true', sort: 'name' });
      const select = $('#adj-tx-type') as HTMLSelectElement | null;
      if (select) {
        const pref = txTypes.find(t => t.code === 'NC') || txTypes.find(t => t.code === 'AJ') || txTypes[0];
        select.innerHTML = txTypes.map(t => `<option value="${esc(t.id)}" ${pref && t.id === pref.id ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)}</option>`).join('');
      }
    } catch (_) {}
  })();

  const computeUnifiedPreview = () => {
    const unifyChecked = (document.getElementById('adj-unify-toggle') as HTMLInputElement | null)?.checked ?? true;
    const badge = $('#adj-unify-badge');
    const previewContainer = $('#adj-unified-preview-container');

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
          <td class="text-blue-800">Contrapartida Neta Banco (${selected.length} movimientos procesados)</td>
          <td class="text-center text-blue-800">${selected.length}</td>
          <td class="text-right text-emerald-600">${isBankDebit ? fmt(netBank) : '$0'}</td>
          <td class="text-right text-red-600">${!isBankDebit ? fmt(Math.abs(netBank)) : '$0'}</td>
        </tr>
      `;
    }

    const tbody = $('#adj-unified-tbody');
    if (tbody) {
      tbody.innerHTML = rowsHtml || `<tr><td colspan="5" class="text-center py-3 text-gray-400">Selecciona ítems para ver el resumen del asiento contable.</td></tr>`;
    }

    const countTag = $('#adj-unified-count-tag');
    if (countTag) {
      countTag.innerHTML = `Comprobante resultante: <strong class="text-blue-900 font-bold">${unifiedLinesCount} asientos unificados</strong> (en lugar de ${selected.length + 1} líneas).`;
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

  updateSummary();

  // Guardar Transacción y Vincular a los Movimientos Bancarios
  $('#btn-save-adj-note')?.addEventListener('click', async () => {
    const txTypeId = getSelectVal('adj-tx-type');
    const txDate = getInputVal('adj-tx-date');
    const txDesc = getInputVal('adj-tx-desc').trim();
    const unifyChecked = (document.getElementById('adj-unify-toggle') as HTMLInputElement | null)?.checked ?? true;

    if (!txTypeId || !txDate || !txDesc) {
      return showToast('Completa el tipo, fecha y concepto del comprobante', 'warning');
    }

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
    if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Causando y conciliando...'; }

    try {
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
              debit: 0,
              credit: m.credit,
              description: m.description,
              line_order: order,
            });
            lineMovMap.push({ lineOrder: order, movIds: [m.id] });
          }
        });
      }

      // Contrapartida Neta en la Cuenta Bancaria (bankAccount.account_id)
      const netBank = totInc - totExp;
      if (netBank < 0) {
        lines.unshift({
          account_id: bankAccount.account_id,
          debit: 0,
          credit: Math.abs(netBank),
          description: txDesc,
          line_order: 0,
        });
      } else if (netBank > 0) {
        lines.unshift({
          account_id: bankAccount.account_id,
          debit: netBank,
          credit: 0,
          description: txDesc,
          line_order: 0,
        });
      }

      // 2. Crear Transacción Contable vía API
      const txPayload = {
        tx_type_id: txTypeId,
        date: txDate,
        description: txDesc,
        status: 'active',
      };

      const createdTx = await (window as any).API.createTransaction(txPayload, lines);

      // 3. Consultar las líneas creadas para enlazar los bank_movements
      const safeTxId = pb.escapeFilterValue(createdTx.id);
      const createdTxLines = await pb.listAll('tx_lines', { filter: `tx_id="${safeTxId}"` });

      let reconciledOk = 0;
      for (const mapItem of lineMovMap) {
        const matchingTxLine = createdTxLines.find(c => c.line_order === mapItem.lineOrder);
        if (matchingTxLine) {
          // Actualizar movimientos en lotes de 15 para alta velocidad
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
      showToast(`Se causó la Nota de Ajuste ${createdTx.number || ''} (${lines.length} líneas contables) y se conciliaron ${reconciledOk} movimientos del extracto.`, 'success');
      renderConciliacion($('#page-content'));
    } catch (err: any) {
      showToast('Error causando la nota de ajuste: ' + (err.message || ''), 'error');
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-file-invoice-dollar mr-1"></i> Causar y Conciliar Nota de Ajuste'; }
    }
  });
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
