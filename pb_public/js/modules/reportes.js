/**
 * ContaCO v2.0 — reportes.js
 */
'use strict';

async function renderReportes(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Generando reportes...</div>`;
  try {
    const [accounts, saldos] = await Promise.all([
      API.getAccounts(false),
      API.getAccountSaldos(),
    ]);

    const trialRows = accounts
      .filter(a => Math.abs(Number(saldos[a.id] || 0)) > 0.0001)
      .map(a => {
        const saldo = Number(saldos[a.id] || 0);
        return {
          code: a.code,
          account: a.name,
          debit: saldo > 0 ? saldo : 0,
          credit: saldo < 0 ? Math.abs(saldo) : 0,
          raw: saldo,
        };
      })
      .sort((a, b) => a.code.localeCompare(b.code));

    const totals = trialRows.reduce((acc, r) => {
      acc.debit += r.debit;
      acc.credit += r.credit;
      return acc;
    }, { debit: 0, credit: 0 });

    const byClass = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 };
    for (const a of accounts) {
      const cls = (a.code || '').charAt(0);
      byClass[cls] = (byClass[cls] || 0) + Number(saldos[a.id] || 0);
    }

    const utilidad = Math.abs(byClass['4'] || 0) - (Number(byClass['5'] || 0) + Number(byClass['6'] || 0) + Number(byClass['7'] || 0));

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Reportes Financieros</h3>
          <p class="text-sm" style="color:#6B7280">Balance de prueba y estado de resultados.</p>
        </div>
        <div class="flex gap-2">
          ${can('canExport') ? '<button class="btn btn-secondary" id="btn-exp-trial"><i class="fas fa-file-excel"></i> Exportar Balance</button>' : ''}
          ${can('canExport') ? '<button class="btn btn-outline" id="btn-exp-er"><i class="fas fa-file-excel"></i> Exportar E.R.</button>' : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div class="stat-card blue"><span class="text-xs font-bold uppercase" style="color:#6B7280">Activos</span><p class="text-2xl font-extrabold mt-2">${fmt(byClass['1'] || 0)}</p></div>
        <div class="stat-card orange"><span class="text-xs font-bold uppercase" style="color:#6B7280">Pasivo + Patrimonio</span><p class="text-2xl font-extrabold mt-2">${fmt(Math.abs(byClass['2'] || 0) + Math.abs(byClass['3'] || 0))}</p></div>
        <div class="stat-card green"><span class="text-xs font-bold uppercase" style="color:#6B7280">Utilidad del Periodo</span><p class="text-2xl font-extrabold mt-2">${fmt(utilidad)}</p></div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b" style="border-color:#F3F4F6"><h4 class="font-bold" style="color:#0D2137">Balance de Prueba</h4></div>
        <div class="overflow-x-auto" style="max-height:350px">
          <table class="data-table">
            <thead><tr><th>Código</th><th>Cuenta</th><th>Débito</th><th>Crédito</th></tr></thead>
            <tbody>
              ${trialRows.length ? trialRows.map(r => `<tr><td>${esc(r.code)}</td><td>${esc(r.account)}</td><td>${fmt(r.debit)}</td><td>${fmt(r.credit)}</td></tr>`).join('') : '<tr><td colspan="4" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="font-bold">Total</td>
                <td class="font-bold">${fmt(totals.debit)}</td>
                <td class="font-bold">${fmt(totals.credit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="p-4 border-b" style="border-color:#F3F4F6"><h4 class="font-bold" style="color:#0D2137">Estado de Resultados (Resumen)</h4></div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between p-3 rounded-lg" style="background:#F8FAFC"><span>Ingresos (Clase 4)</span><strong>${fmt(Math.abs(byClass['4'] || 0))}</strong></div>
          <div class="flex justify-between p-3 rounded-lg" style="background:#F8FAFC"><span>Gastos y Costos (5+6+7)</span><strong>${fmt(Number(byClass['5'] || 0) + Number(byClass['6'] || 0) + Number(byClass['7'] || 0))}</strong></div>
          <div class="flex justify-between p-3 rounded-lg md:col-span-2" style="background:${utilidad >= 0 ? '#ECFDF5' : '#FEF2F2'}"><span class="font-semibold">Resultado Neto</span><strong>${fmt(utilidad)}</strong></div>
        </div>
      </div>`;

    $('#btn-exp-trial')?.addEventListener('click', () => {
      exportToExcel(trialRows.map(r => ({
        codigo: r.code,
        cuenta: r.account,
        debito: r.debit,
        credito: r.credit,
      })), [
        { key: 'codigo', label: 'Código' },
        { key: 'cuenta', label: 'Cuenta' },
        { key: 'debito', label: 'Débito' },
        { key: 'credito', label: 'Crédito' },
      ], 'balance_prueba');
    });

    $('#btn-exp-er')?.addEventListener('click', () => {
      exportToExcel([
        { concepto: 'Ingresos', valor: Math.abs(byClass['4'] || 0) },
        { concepto: 'Gastos y Costos', valor: Number(byClass['5'] || 0) + Number(byClass['6'] || 0) + Number(byClass['7'] || 0) },
        { concepto: 'Resultado Neto', valor: utilidad },
      ], [
        { key: 'concepto', label: 'Concepto' },
        { key: 'valor', label: 'Valor' },
      ], 'estado_resultados');
    });
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}
