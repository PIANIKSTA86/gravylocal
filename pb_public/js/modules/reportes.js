/**
 * ContaCO v2.0 — reportes.js
 */
'use strict';

let REPORT_STATE = {
  accounts: null,
  saldos: null,
  transactions: null,
  txLines: null,
  thirdParties: null,
};

async function renderReportes(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Reportes Financieros</h3>
        <p class="text-sm" style="color:#6B7280">Selecciona el reporte a generar. Se carga solo bajo demanda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" id="report-cards">
      ${reportCard('trial', 'Balance de Prueba', 'Saldos débitos y créditos por cuenta.')}
      ${reportCard('income', 'Estado de Resultados', 'Ingresos, gastos y utilidad neta.')}
      ${reportCard('position', 'Estado de Situación Financiera', 'Activos, pasivos y patrimonio (Balance General).')}
      ${reportCard('journal', 'Libro Diario', 'Detalle cronológico de movimientos contables.')}
      ${reportCard('aux', 'Libro Auxiliar', 'Movimientos por Cuenta y Tercero o Tercero y Cuenta.')}
    </div>

    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div id="report-view" class="p-8 text-center" style="color:#9CA3AF">
        <i class="fas fa-chart-column mr-2"></i>Selecciona una card para generar el reporte.
      </div>
    </div>`;

  $('#btn-report-trial')?.addEventListener('click', renderTrialBalance);
  $('#btn-report-income')?.addEventListener('click', renderIncomeStatement);
  $('#btn-report-position')?.addEventListener('click', renderFinancialPosition);
  $('#btn-report-journal')?.addEventListener('click', renderJournalBook);
  $('#btn-report-aux')?.addEventListener('click', renderAuxiliaryBook);
}

function reportCard(id, title, subtitle) {
  return `
    <div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
      <h4 class="font-bold mb-1" style="color:#0D2137">${esc(title)}</h4>
      <p class="text-sm mb-3" style="color:#6B7280">${esc(subtitle)}</p>
      <button class="btn btn-primary btn-sm" id="btn-report-${esc(id)}"><i class="fas fa-play"></i> Generar</button>
    </div>`;
}

async function ensureAccountsSaldos() {
  if (!REPORT_STATE.accounts || !REPORT_STATE.saldos) {
    const [accounts, saldos] = await Promise.all([
      API.getAccounts(false),
      API.getAccountSaldos(),
    ]);
    REPORT_STATE.accounts = accounts;
    REPORT_STATE.saldos = saldos;
  }
  return { accounts: REPORT_STATE.accounts, saldos: REPORT_STATE.saldos };
}

async function ensureLedgerData() {
  if (!REPORT_STATE.transactions || !REPORT_STATE.txLines || !REPORT_STATE.thirdParties) {
    const [transactions, txLines, thirdParties] = await Promise.all([
      pb.listAll('transactions', { sort: '-id', expand: 'tx_type_id,third_party_id', filter: 'status="active"' }),
      pb.listAll('tx_lines', { sort: 'id', expand: 'account_id,tx_id' }),
      pb.listAll('third_parties', { sort: 'name' }),
    ]);
    REPORT_STATE.transactions = transactions;
    REPORT_STATE.txLines = txLines;
    REPORT_STATE.thirdParties = thirdParties;
  }
  return {
    transactions: REPORT_STATE.transactions,
    txLines: REPORT_STATE.txLines,
    thirdParties: REPORT_STATE.thirdParties,
  };
}

function getByClass(accounts, saldos) {
  const byClass = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 };
  for (const a of accounts) {
    const cls = (a.code || '').charAt(0);
    byClass[cls] = (byClass[cls] || 0) + Number(saldos[a.id] || 0);
  }
  return byClass;
}

async function getSettingFirst(keys, fallback = '') {
  for (const key of keys) {
    try {
      const value = await API.getSetting(key);
      if (value) return value;
    } catch (_) {}
  }
  return fallback;
}

function fmtSignedAmount(value) {
  const n = Number(value || 0);
  if (n < 0) {
    return { text: `(${fmt(Math.abs(n))})`, isNegative: true };
  }
  return { text: fmt(n), isNegative: false };
}

async function renderTrialBalance() {
  const view = $('#report-view');
  if (!view) return;
  const today = todayStr();
  const fromDefault = `${today.slice(0, 7)}-01`;
  const defaultSignaturesSetting = await getSettingFirst(['trial_show_signatures_default', 'show_signatures_default'], '0');
  const signaturesChecked = String(defaultSignaturesSetting).trim() === '1' || String(defaultSignaturesSetting).toLowerCase() === 'true';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Balance de Prueba (Detallado)</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input id="trial-from" type="date" class="form-input" value="${fromDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input id="trial-to" type="date" class="form-input" value="${today}">
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="trial-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="trial-show-third" type="checkbox">
            Mostrar terceros
          </label>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="trial-show-signatures" type="checkbox" ${signaturesChecked ? 'checked' : ''}>
            Mostrar firmas
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-trial"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-trial" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="trial-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona el lapso y pulsa Generar.
    </div>`;

  let lastExportRows = [];

  const generate = async () => {
    const results = $('#trial-results');
    if (!results) return;
    const fromDate = getInputVal('trial-from');
    const toDate = getInputVal('trial-to');
    const selectedLevel = getSelectVal('trial-level');
    const maxLevel = selectedLevel === 'all' ? Number.POSITIVE_INFINITY : Number(selectedLevel || 3);
    const includeThird = getCheckVal('trial-show-third');
    const includeSignatures = getCheckVal('trial-show-signatures');

    if (!fromDate || !toDate) {
      return showToast('Selecciona el lapso (desde y hasta).', 'warning');
    }
    if (fromDate > toDate) {
      return showToast('La fecha Desde no puede ser mayor que Hasta.', 'warning');
    }

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Balance de Prueba...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();
      const { transactions, txLines } = await ensureLedgerData();
      const txById = Object.fromEntries(transactions.map(t => [t.id, t]));

      const accountById = new Map(accounts.map(a => [a.id, {
        id: a.id,
        code: String(a.code || ''),
        name: String(a.name || ''),
        level: Number(a.level || 1),
        parent_code: String(a.parent_code || ''),
        ownPrev: 0,
        ownDebit: 0,
        ownCredit: 0,
        prev: 0,
        debit: 0,
        credit: 0,
        current: 0,
        third: new Map(),
        children: [],
      }]));

      const accountByCode = new Map();
      accountById.forEach((v) => {
        if (v.code) accountByCode.set(v.code, v);
      });

      // Acumula movimientos propios por cuenta según el lapso seleccionado.
      for (const line of txLines) {
        const tx = txById[line.tx_id];
        if (!tx || tx.status !== 'active' || !tx.date) continue;
        const acc = accountById.get(line.account_id);
        if (!acc) continue;

        const date = String(tx.date);
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        if (date < fromDate) {
          acc.ownPrev += (debit - credit);
        } else if (date >= fromDate && date <= toDate) {
          acc.ownDebit += debit;
          acc.ownCredit += credit;
        }

        if (includeThird) {
          const thirdId = String(tx.third_party_id || 'NO_TERCERO');
          const thirdName = tx.expand?.third_party_id?.name || 'Sin tercero';
          if (!acc.third.has(thirdId)) {
            acc.third.set(thirdId, { id: thirdId, name: thirdName, prev: 0, debit: 0, credit: 0, current: 0 });
          }
          const t = acc.third.get(thirdId);
          if (date < fromDate) {
            t.prev += (debit - credit);
          } else if (date >= fromDate && date <= toDate) {
            t.debit += debit;
            t.credit += credit;
          }
          t.current = t.prev + t.debit - t.credit;
        }
      }

      const roots = [];
      accountById.forEach((acc) => {
        const parent = acc.parent_code ? accountByCode.get(acc.parent_code) : null;
        if (parent) parent.children.push(acc);
        else roots.push(acc);
      });

      const sortByCode = (a, b) => a.code.localeCompare(b.code);
      roots.sort(sortByCode);
      accountById.forEach((acc) => acc.children.sort(sortByCode));

      const rows = [];
      const EPS = 0.0001;

      const calcNode = (node) => {
        let prev = node.ownPrev;
        let debit = node.ownDebit;
        let credit = node.ownCredit;

        for (const child of node.children) {
          const c = calcNode(child);
          prev += c.prev;
          debit += c.debit;
          credit += c.credit;
        }

        const current = prev + debit - credit;
        node.prev = prev;
        node.debit = debit;
        node.credit = credit;
        node.current = current;
        return { prev, debit, credit, current };
      };

      roots.forEach((r) => calcNode(r));

      const buildVisibleRows = (node, depth) => {
        const childRows = [];
        for (const child of node.children) {
          childRows.push(...buildVisibleRows(child, depth + 1));
        }

        const hasActivity = Math.abs(node.prev) > EPS || Math.abs(node.debit) > EPS || Math.abs(node.credit) > EPS || Math.abs(node.current) > EPS;
        const visible = hasActivity || childRows.length > 0;
        if (!visible) return [];

        const rowLevel = Number(node.level || (depth + 1));

        const currentRow = {
          code: node.code,
          account: node.name,
          level: rowLevel,
          depth,
          isGroup: node.children.length > 0,
          prev: node.prev,
          debit: node.debit,
          credit: node.credit,
          current: node.current,
          node,
        };

        if (rowLevel <= maxLevel) {
          return [currentRow, ...childRows];
        }
        return childRows;
      };

      rows.length = 0;
      roots.forEach((r) => rows.push(...buildVisibleRows(r, 0)));

      const totals = roots.reduce((acc, r) => {
        acc.prev += r.prev;
        acc.debit += r.debit;
        acc.credit += r.credit;
        acc.current += r.current;
        return acc;
      }, { prev: 0, debit: 0, credit: 0, current: 0 });

      const totalPrev = fmtSignedAmount(totals.prev);
      const totalDebit = fmtSignedAmount(totals.debit);
      const totalCredit = fmtSignedAmount(totals.credit);
      const totalCurrent = fmtSignedAmount(totals.current);

      const displayRows = [];
      for (const r of rows) {
        displayRows.push({ ...r, thirdName: '' });
        if (includeThird && r.node && r.node.third && r.node.third.size) {
          const thirdRows = [...r.node.third.values()]
            .filter(t => Math.abs(t.prev) > EPS || Math.abs(t.debit) > EPS || Math.abs(t.credit) > EPS || Math.abs(t.current) > EPS)
            .sort((a, b) => a.name.localeCompare(b.name));

          for (const t of thirdRows) {
            displayRows.push({
              code: '',
              account: 'Detalle por tercero',
              level: r.level,
              depth: r.depth + 1,
              isGroup: false,
              prev: t.prev,
              debit: t.debit,
              credit: t.credit,
              current: t.current,
              thirdName: t.name,
              isThirdDetail: true,
            });
          }
        }
      }

      lastExportRows = displayRows.map(r => ({
        codigo: r.code,
        descripcion: `${'  '.repeat(r.depth)}${r.account}`,
        tercero: r.thirdName || '',
        nivel: r.level,
        saldo_anterior: r.prev,
        mov_debito: r.debit,
        mov_credito: r.credit,
        saldo_actual: r.current,
      }));

      if ($('#btn-exp-trial')) $('#btn-exp-trial').disabled = !displayRows.length;

      let signaturesHtml = '';
      if (includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        signaturesHtml = `
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${signatureBlock(repName, repTitle, '')}
              ${signatureBlock(contName, contTitle, contLicense)}
              ${signatureBlock(revName, revTitle, revLicense)}
            </div>
          </div>`;
      }

      results.innerHTML = `
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Balance de Comprobación Detallado</p>
          <p class="text-sm mt-1" style="color:#6B7280">DEL ${esc(fromDate)} AL ${esc(toDate)}</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:520px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Descripción</th>
                ${includeThird ? '<th>Tercero</th>' : ''}
                <th>Saldo Anterior</th>
                <th>Mov. Débito</th>
                <th>Mov. Crédito</th>
                <th>Saldo Actual</th>
              </tr>
            </thead>
            <tbody>
              ${displayRows.length
                ? displayRows.map((r) => {
                  const prev = fmtSignedAmount(r.prev);
                  const debit = fmtSignedAmount(r.debit);
                  const credit = fmtSignedAmount(r.credit);
                  const current = fmtSignedAmount(r.current);
                  return `
                <tr>
                  <td class="font-mono text-xs ${r.isGroup ? 'font-bold' : ''}">${esc(r.code)}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="padding-left:${8 + (r.depth * 18)}px">${esc(r.account)}</td>
                  ${includeThird ? `<td class="${r.isThirdDetail ? 'font-medium' : ''}">${esc(r.thirdName || '—')}</td>` : ''}
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="${prev.isNegative ? 'color:#B91C1C' : ''}">${prev.text}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="${debit.isNegative ? 'color:#B91C1C' : ''}">${debit.text}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="${credit.isNegative ? 'color:#B91C1C' : ''}">${credit.text}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="${current.isNegative ? 'color:#B91C1C' : ''}">${current.text}</td>
                </tr>`;
                }).join('')
                : `<tr><td colspan="${includeThird ? '7' : '6'}" class="text-center py-10" style="color:#9CA3AF">No hay datos para el lapso seleccionado.</td></tr>`}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${includeThird ? '3' : '2'}" class="font-bold">Total</td>
                <td class="font-bold" style="${totalPrev.isNegative ? 'color:#B91C1C' : ''}">${totalPrev.text}</td>
                <td class="font-bold" style="${totalDebit.isNegative ? 'color:#B91C1C' : ''}">${totalDebit.text}</td>
                <td class="font-bold" style="${totalCredit.isNegative ? 'color:#B91C1C' : ''}">${totalCredit.text}</td>
                <td class="font-bold" style="${totalCurrent.isNegative ? 'color:#B91C1C' : ''}">${totalCurrent.text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${signaturesHtml}`;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
    }
  };

  $('#btn-gen-trial')?.addEventListener('click', generate);
  $('#btn-exp-trial')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    exportToExcel(lastExportRows, [
      { key: 'codigo', label: 'CUENTA' },
      { key: 'descripcion', label: 'DESCRIPCIÓN' },
      { key: 'nivel', label: 'NIVEL' },
      { key: 'tercero', label: 'TERCERO' },
      { key: 'saldo_anterior', label: 'BALANCE ANTERIOR' },
      { key: 'mov_debito', label: 'DÉBITOS' },
      { key: 'mov_credito', label: 'CRÉDITOS' },
      { key: 'saldo_actual', label: 'BALANCE ACTUAL' },
    ], `balance_prueba_n${getSelectVal('trial-level')}_${getInputVal('trial-from')}_${getInputVal('trial-to')}`);
  });
}

function signatureBlock(name, title, extraLine = '') {
  return `
    <div class="pt-6">
      <div style="border-top:1px solid #111827; margin-bottom:6px"></div>
      <p class="text-sm font-semibold" style="color:#0D2137">${esc(name || '________________________')}</p>
      <p class="text-xs" style="color:#6B7280">${esc(title || '')}</p>
      ${extraLine ? `<p class="text-xs" style="color:#6B7280">${esc(extraLine)}</p>` : ''}
    </div>`;
}

async function renderIncomeStatement() {
  const view = $('#report-view');
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Resultados...</div>';

  try {
    const { accounts, saldos } = await ensureAccountsSaldos();
    const byClass = getByClass(accounts, saldos);
    const ingresos = Math.abs(byClass['4'] || 0);
    const gastos = Number(byClass['5'] || 0) + Number(byClass['6'] || 0) + Number(byClass['7'] || 0);
    const utilidad = ingresos - gastos;

    view.innerHTML = `
      <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
        <h4 class="font-bold" style="color:#0D2137">Estado de Resultados</h4>
        ${can('canExport') ? '<button class="btn btn-outline btn-sm" id="btn-exp-er"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div class="flex justify-between p-3 rounded-lg" style="background:#F8FAFC"><span>Ingresos (Clase 4)</span><strong>${fmt(ingresos)}</strong></div>
        <div class="flex justify-between p-3 rounded-lg" style="background:#F8FAFC"><span>Gastos y Costos (5+6+7)</span><strong>${fmt(gastos)}</strong></div>
        <div class="flex justify-between p-3 rounded-lg md:col-span-2" style="background:${utilidad >= 0 ? '#ECFDF5' : '#FEF2F2'}"><span class="font-semibold">Resultado Neto</span><strong>${fmt(utilidad)}</strong></div>
      </div>`;

    $('#btn-exp-er')?.addEventListener('click', () => {
      exportToExcel([
        { concepto: 'Ingresos', valor: ingresos },
        { concepto: 'Gastos y Costos', valor: gastos },
        { concepto: 'Resultado Neto', valor: utilidad },
      ], [
        { key: 'concepto', label: 'Concepto' },
        { key: 'valor', label: 'Valor' },
      ], 'estado_resultados');
    });
  } catch (err) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderFinancialPosition() {
  const view = $('#report-view');
  if (!view) return;
  const currentMonthDefault = todayStr().slice(0, 7);
  const y = Number(currentMonthDefault.slice(0, 4));
  const m = Number(currentMonthDefault.slice(5, 7));
  const compareMonthDefault = `${String(y - 1)}-${String(m).padStart(2, '0')}`;

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Situación Financiera (Balance General)</h4>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="pos-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="pos-compare-month" type="month" class="form-input" value="${compareMonthDefault}">
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="pos-show-notes" type="checkbox" checked>
            Mostrar nota/revelación
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-position"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-position" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="position-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona mes y comparación para generar el reporte.
    </div>`;

  let lastExportRows = [];

  const endOfMonth = (monthStr) => {
    const year = Number(String(monthStr || '').slice(0, 4));
    const month = Number(String(monthStr || '').slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return '';
    const dt = new Date(year, month, 0);
    const yv = dt.getFullYear();
    const mv = String(dt.getMonth() + 1).padStart(2, '0');
    const dv = String(dt.getDate()).padStart(2, '0');
    return `${yv}-${mv}-${dv}`;
  };

  const fmtLongDate = (dateStr) => {
    if (!dateStr) return '—';
    const dt = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return dateStr;
    return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const buildBalancesAt = (accounts, transactions, txLines, cutoffDate) => {
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));
    const byAccount = Object.fromEntries(accounts.map(a => [a.id, 0]));

    for (const line of txLines) {
      const tx = txById[line.tx_id];
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (String(tx.date) > cutoffDate) continue;
      byAccount[line.account_id] = Number(byAccount[line.account_id] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
    }

    return byAccount;
  };

  const toAmount = (raw, kind) => {
    return kind === 'asset' ? Number(raw || 0) : Math.abs(Number(raw || 0));
  };

  const groupSection = (accounts, balancesNow, balancesCmp, filterFn, kind, showNotes, startNote) => {
    const detail = accounts
      .filter(filterFn)
      .sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')))
      .map((acc, idx) => {
        const now = toAmount(balancesNow[acc.id], kind);
        const cmp = toAmount(balancesCmp[acc.id], kind);
        return {
          note: showNotes ? String(startNote + idx) : '',
          label: acc.name,
          now,
          cmp,
        };
      })
      .filter(r => Math.abs(r.now) > 0.0001 || Math.abs(r.cmp) > 0.0001);

    const totalNow = detail.reduce((s, r) => s + r.now, 0);
    const totalCmp = detail.reduce((s, r) => s + r.cmp, 0);

    return { detail, totalNow, totalCmp, nextNote: startNote + detail.length };
  };

  const generate = async () => {
    const results = $('#position-results');
    if (!results) return;

    const reportMonth = getInputVal('pos-month');
    const compareMonth = getInputVal('pos-compare-month');
    const showNotes = getCheckVal('pos-show-notes');

    if (!reportMonth || !compareMonth) {
      return showToast('Selecciona ambos meses para el reporte comparativo.', 'warning');
    }

    const reportDate = endOfMonth(reportMonth);
    const compareDate = endOfMonth(compareMonth);
    if (!reportDate || !compareDate) {
      return showToast('Mes inválido. Revisa los filtros.', 'warning');
    }

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Situación Financiera...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();
      const { transactions, txLines } = await ensureLedgerData();

      const balNow = buildBalancesAt(accounts, transactions, txLines, reportDate);
      const balCmp = buildBalancesAt(accounts, transactions, txLines, compareDate);

      let noteCounter = 1;
      const actCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('11'), 'asset', showNotes, noteCounter); noteCounter = actCorr.nextNote;
      const actNoCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('1') && !String(a.code || '').startsWith('11'), 'asset', showNotes, noteCounter); noteCounter = actNoCorr.nextNote;
      const pasCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('21'), 'liability', showNotes, noteCounter); noteCounter = pasCorr.nextNote;
      const pasNoCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('2') && !String(a.code || '').startsWith('21'), 'liability', showNotes, noteCounter); noteCounter = pasNoCorr.nextNote;
      const patrimonio = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('3'), 'equity', showNotes, noteCounter);

      const totalActivosNow = actCorr.totalNow + actNoCorr.totalNow;
      const totalActivosCmp = actCorr.totalCmp + actNoCorr.totalCmp;
      const totalPasivosNow = pasCorr.totalNow + pasNoCorr.totalNow;
      const totalPasivosCmp = pasCorr.totalCmp + pasNoCorr.totalCmp;
      const totalPyPNow = totalPasivosNow + patrimonio.totalNow;
      const totalPyPCmp = totalPasivosCmp + patrimonio.totalCmp;

      const colCount = showNotes ? 4 : 3;
      const noteHead = showNotes ? '<th style="width:90px">Nota</th>' : '';

      const detailRowsHtml = (section) => section.detail.map(r => `
        <tr>
          <td style="padding-left:24px">${esc(r.label)}</td>
          ${showNotes ? `<td class="text-center">${esc(r.note)}</td>` : ''}
          <td class="text-right">${fmt(r.now)}</td>
          <td class="text-right">${fmt(r.cmp)}</td>
        </tr>`).join('');

      results.innerHTML = `
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Estado de Situación Financiera</p>
          <p class="text-sm" style="color:#6B7280">(Expresado en pesos colombianos)</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:560px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rubro</th>
                ${noteHead}
                <th class="text-right">${esc(fmtLongDate(reportDate))}</th>
                <th class="text-right">${esc(fmtLongDate(compareDate))}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-bold" colspan="${colCount}">Activos</td></tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Activos corrientes</td></tr>
              ${detailRowsHtml(actCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(actCorr.totalNow)}</td>
                <td class="font-bold text-right">${fmt(actCorr.totalCmp)}</td>
              </tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Activos no corrientes</td></tr>
              ${detailRowsHtml(actNoCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos no corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(actNoCorr.totalNow)}</td>
                <td class="font-bold text-right">${fmt(actNoCorr.totalCmp)}</td>
              </tr>
              <tr>
                <td class="font-bold">Total activos</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(totalActivosNow)}</td>
                <td class="font-bold text-right">${fmt(totalActivosCmp)}</td>
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Pasivos</td></tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Pasivos corrientes</td></tr>
              ${detailRowsHtml(pasCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(pasCorr.totalNow)}</td>
                <td class="font-bold text-right">${fmt(pasCorr.totalCmp)}</td>
              </tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Pasivos no corrientes</td></tr>
              ${detailRowsHtml(pasNoCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos no corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(pasNoCorr.totalNow)}</td>
                <td class="font-bold text-right">${fmt(pasNoCorr.totalCmp)}</td>
              </tr>
              <tr>
                <td class="font-bold">Total pasivos</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(totalPasivosNow)}</td>
                <td class="font-bold text-right">${fmt(totalPasivosCmp)}</td>
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Patrimonio</td></tr>
              ${detailRowsHtml(patrimonio)}
              <tr>
                <td class="font-bold">Total patrimonio</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(patrimonio.totalNow)}</td>
                <td class="font-bold text-right">${fmt(patrimonio.totalCmp)}</td>
              </tr>

              <tr>
                <td class="font-bold">Total pasivos más patrimonio</td>
                ${showNotes ? '<td></td>' : ''}
                <td class="font-bold text-right">${fmt(totalPyPNow)}</td>
                <td class="font-bold text-right">${fmt(totalPyPCmp)}</td>
              </tr>
            </tbody>
          </table>
        </div>`;

      lastExportRows = [];
      const pushSection = (title, section, sectionTotalLabel) => {
        lastExportRows.push({ rubro: title, nota: '', actual: '', comparativo: '' });
        section.detail.forEach((r) => {
          lastExportRows.push({ rubro: `  ${r.label}`, nota: r.note || '', actual: r.now, comparativo: r.cmp });
        });
        lastExportRows.push({ rubro: sectionTotalLabel, nota: '', actual: section.totalNow, comparativo: section.totalCmp });
      };

      pushSection('Activos corrientes', actCorr, 'Total activos corrientes');
      pushSection('Activos no corrientes', actNoCorr, 'Total activos no corrientes');
      lastExportRows.push({ rubro: 'Total activos', nota: '', actual: totalActivosNow, comparativo: totalActivosCmp });
      pushSection('Pasivos corrientes', pasCorr, 'Total pasivos corrientes');
      pushSection('Pasivos no corrientes', pasNoCorr, 'Total pasivos no corrientes');
      lastExportRows.push({ rubro: 'Total pasivos', nota: '', actual: totalPasivosNow, comparativo: totalPasivosCmp });
      pushSection('Patrimonio', patrimonio, 'Total patrimonio');
      lastExportRows.push({ rubro: 'Total pasivos más patrimonio', nota: '', actual: totalPyPNow, comparativo: totalPyPCmp });

      if ($('#btn-exp-position')) $('#btn-exp-position').disabled = !lastExportRows.length;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
    }
  };

  $('#btn-gen-position')?.addEventListener('click', generate);
  $('#btn-exp-position')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    exportToExcel(lastExportRows, [
      { key: 'rubro', label: 'Rubro' },
      { key: 'nota', label: 'Nota' },
      { key: 'actual', label: getInputVal('pos-month') },
      { key: 'comparativo', label: getInputVal('pos-compare-month') },
    ], `estado_situacion_financiera_${getInputVal('pos-month')}_vs_${getInputVal('pos-compare-month')}`);
  });
}

async function renderJournalBook() {
  const view = $('#report-view');
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Libro Diario...</div>';

  try {
    const { transactions, txLines } = await ensureLedgerData();
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));
    const rows = txLines
      .map(l => {
        const tx = txById[l.tx_id];
        if (!tx || tx.status !== 'active') return null;
        return {
          fecha: tx.date || '',
          comprobante: tx.number || '',
          tipo: tx.expand?.tx_type_id?.name || '',
          descripcion: tx.description || '',
          tercero: tx.expand?.third_party_id?.name || '—',
          cuenta: `${l.expand?.account_id?.code || ''} - ${l.expand?.account_id?.name || ''}`.trim(),
          debito: Number(l.debit || 0),
          credito: Number(l.credit || 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => `${a.fecha} ${a.comprobante}`.localeCompare(`${b.fecha} ${b.comprobante}`));

    view.innerHTML = `
      <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
        <h4 class="font-bold" style="color:#0D2137">Libro Diario</h4>
        ${can('canExport') ? '<button class="btn btn-outline btn-sm" id="btn-exp-journal"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>
      <div class="overflow-x-auto" style="max-height:420px">
        <table class="data-table">
          <thead><tr><th>Fecha</th><th>Comp.</th><th>Tipo</th><th>Descripción</th><th>Tercero</th><th>Cuenta</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map(r => `<tr><td>${esc(r.fecha)}</td><td>${esc(r.comprobante)}</td><td>${esc(r.tipo)}</td><td>${esc(r.descripcion)}</td><td>${esc(r.tercero)}</td><td>${esc(r.cuenta)}</td><td>${fmt(r.debito)}</td><td>${fmt(r.credito)}</td></tr>`).join('') : '<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>'}
          </tbody>
        </table>
      </div>`;

    $('#btn-exp-journal')?.addEventListener('click', () => {
      exportToExcel(rows, [
        { key: 'fecha', label: 'Fecha' },
        { key: 'comprobante', label: 'Comprobante' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'tercero', label: 'Tercero' },
        { key: 'cuenta', label: 'Cuenta' },
        { key: 'debito', label: 'Débito' },
        { key: 'credito', label: 'Crédito' },
      ], 'libro_diario');
    });
  } catch (err) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderAuxiliaryBook() {
  const view = $('#report-view');
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Libro Auxiliar...</div>';

  try {
    const [{ accounts }, { thirdParties }] = await Promise.all([
      ensureAccountsSaldos(),
      ensureLedgerData(),
    ]);

    view.innerHTML = `
      <div class="p-4 border-b" style="border-color:#F3F4F6">
        <h4 class="font-bold mb-3" style="color:#0D2137">Libro Auxiliar</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select id="aux-mode" class="form-input">
            <option value="cuenta-tercero">Cuenta y luego Tercero</option>
            <option value="tercero-cuenta">Tercero y luego Cuenta</option>
          </select>
          <select id="aux-account" class="form-input">
            <option value="">Todas las cuentas</option>
            ${accounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
          </select>
          <select id="aux-third" class="form-input">
            <option value="">Todos los terceros</option>
            ${thirdParties.map(t => `<option value="${esc(t.id)}">${esc(t.doc_number || '')} - ${esc(t.name)}</option>`).join('')}
          </select>
          <button class="btn btn-primary" id="btn-gen-aux"><i class="fas fa-filter"></i> Generar</button>
        </div>
      </div>
      <div id="aux-results" class="p-4 text-sm" style="color:#6B7280">Configura filtros y pulsa Generar.</div>`;

    $('#btn-gen-aux')?.addEventListener('click', generateAuxiliaryRows);
  } catch (err) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function generateAuxiliaryRows() {
  const results = $('#aux-results');
  if (!results) return;
  results.innerHTML = '<div class="p-4 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando...</div>';

  try {
    const { transactions, txLines } = await ensureLedgerData();
    const mode = getSelectVal('aux-mode');
    const accountId = getSelectVal('aux-account');
    const thirdId = getSelectVal('aux-third');

    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));
    const rows = txLines
      .map(l => {
        const tx = txById[l.tx_id];
        if (!tx || tx.status !== 'active') return null;
        const thirdPartyId = tx.third_party_id || '';
        if (accountId && l.account_id !== accountId) return null;
        if (thirdId && thirdPartyId !== thirdId) return null;

        const accountCode = l.expand?.account_id?.code || '';
        const accountName = l.expand?.account_id?.name || '';
        const thirdName = tx.expand?.third_party_id?.name || 'Sin tercero';

        return {
          fecha: tx.date || '',
          comprobante: tx.number || '',
          cuenta: `${accountCode} - ${accountName}`.trim(),
          tercero: thirdName,
          descripcion: l.description || tx.description || '',
          debito: Number(l.debit || 0),
          credito: Number(l.credit || 0),
          keyCuenta: `${accountCode} - ${accountName}`.trim(),
          keyTercero: thirdName,
        };
      })
      .filter(Boolean);

    const primaryField = mode === 'tercero-cuenta' ? 'keyTercero' : 'keyCuenta';
    const secondaryField = mode === 'tercero-cuenta' ? 'keyCuenta' : 'keyTercero';
    const primaryLabel = mode === 'tercero-cuenta' ? 'Tercero' : 'Cuenta';
    const secondaryLabel = mode === 'tercero-cuenta' ? 'Cuenta' : 'Tercero';

    rows.sort((a, b) => {
      const aKey = `${a[primaryField]}|${a[secondaryField]}|${a.fecha}|${a.comprobante}`;
      const bKey = `${b[primaryField]}|${b[secondaryField]}|${b.fecha}|${b.comprobante}`;
      return aKey.localeCompare(bKey);
    });

    if (!rows.length) {
      results.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF">No hay movimientos para los filtros seleccionados.</div>';
      return;
    }

    const totalDebit = rows.reduce((s, r) => s + r.debito, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credito, 0);

    // Agrupa jerárquicamente para que el modo elegido cambie la lectura visual.
    const grouped = new Map();
    for (const row of rows) {
      const pk = row[primaryField] || '—';
      const sk = row[secondaryField] || '—';
      if (!grouped.has(pk)) grouped.set(pk, new Map());
      const secondaryMap = grouped.get(pk);
      if (!secondaryMap.has(sk)) secondaryMap.set(sk, []);
      secondaryMap.get(sk).push(row);
    }

    let groupedHtml = '';
    grouped.forEach((secondaryMap, primaryValue) => {
      const primaryRows = [...secondaryMap.values()].flat();
      const primaryDebit = primaryRows.reduce((s, r) => s + r.debito, 0);
      const primaryCredit = primaryRows.reduce((s, r) => s + r.credito, 0);

      groupedHtml += `
        <tr>
          <td colspan="7" class="font-bold" style="background:#EFF6FF;color:#1E3A8A">${esc(primaryLabel)}: ${esc(primaryValue)}</td>
        </tr>`;

      secondaryMap.forEach((items, secondaryValue) => {
        const secDebit = items.reduce((s, r) => s + r.debito, 0);
        const secCredit = items.reduce((s, r) => s + r.credito, 0);
        groupedHtml += `
          <tr>
            <td colspan="7" class="font-semibold" style="background:#F8FAFC;color:#334155;padding-left:1.5rem">${esc(secondaryLabel)}: ${esc(secondaryValue)}</td>
          </tr>
          ${items.map(r => `<tr>
            <td>${esc(r.fecha)}</td>
            <td>${esc(r.comprobante)}</td>
            <td>${esc(r.cuenta)}</td>
            <td>${esc(r.tercero)}</td>
            <td>${esc(r.descripcion)}</td>
            <td>${fmt(r.debito)}</td>
            <td>${fmt(r.credito)}</td>
          </tr>`).join('')}
          <tr>
            <td colspan="5" class="font-semibold" style="background:#F8FAFC;padding-left:2.5rem">Subtotal ${esc(secondaryLabel)}: ${esc(secondaryValue)}</td>
            <td class="font-semibold" style="background:#F8FAFC">${fmt(secDebit)}</td>
            <td class="font-semibold" style="background:#F8FAFC">${fmt(secCredit)}</td>
          </tr>`;
      });

      groupedHtml += `
        <tr>
          <td colspan="5" class="font-bold" style="background:#DBEAFE;color:#1E3A8A">Subtotal ${esc(primaryLabel)}: ${esc(primaryValue)}</td>
          <td class="font-bold" style="background:#DBEAFE;color:#1E3A8A">${fmt(primaryDebit)}</td>
          <td class="font-bold" style="background:#DBEAFE;color:#1E3A8A">${fmt(primaryCredit)}</td>
        </tr>`;
    });

    results.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#6B7280">Orden actual: <strong>${esc(primaryLabel)} → ${esc(secondaryLabel)}</strong> · Registros: <strong>${fmtN(rows.length)}</strong></p>
        ${can('canExport') ? '<button class="btn btn-outline btn-sm" id="btn-exp-aux"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>
      <div class="overflow-x-auto" style="max-height:420px">
        <table class="data-table">
          <thead><tr><th>Fecha</th><th>Comp.</th><th>Cuenta</th><th>Tercero</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${groupedHtml}</tbody>
          <tfoot><tr><td colspan="5" class="font-bold">Total</td><td class="font-bold">${fmt(totalDebit)}</td><td class="font-bold">${fmt(totalCredit)}</td></tr></tfoot>
        </table>
      </div>`;

    $('#btn-exp-aux')?.addEventListener('click', () => {
      const exportRows = rows.map(r => ({
        fecha: r.fecha,
        comprobante: r.comprobante,
        cuenta: r.cuenta,
        tercero: r.tercero,
        descripcion: r.descripcion,
        debito: r.debito,
        credito: r.credito,
        grupo_principal: r[primaryField],
        grupo_secundario: r[secondaryField],
      }));

      exportToExcel(exportRows, [
        { key: 'fecha', label: 'Fecha' },
        { key: 'comprobante', label: 'Comprobante' },
        { key: 'cuenta', label: 'Cuenta' },
        { key: 'tercero', label: 'Tercero' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'debito', label: 'Débito' },
        { key: 'credito', label: 'Crédito' },
        { key: 'grupo_principal', label: `Grupo Principal (${primaryLabel})` },
        { key: 'grupo_secundario', label: `Grupo Secundario (${secondaryLabel})` },
      ], 'libro_auxiliar');
    });
  } catch (err) {
    results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}
