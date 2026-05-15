/**
 * GRAVY v2.0 — dashboard.js
 */
'use strict';

async function renderDashboard(c) {
  c.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      ${['#EEF4FF','#FFF8F0','#ECFDF5','#FEF2F2'].map(bg => `
        <div class="rounded-2xl p-4 anim-slide-up" style="background:${bg}">
          <div class="h-3 w-20 rounded mb-3" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
          <div class="h-7 w-28 rounded" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
        </div>`).join('')}
    </div>`;

  try {
    const [kpis, saldos] = await Promise.all([
      API.getDashboardKpis(),
      API.getAccountSaldos(),
    ]);

    // Calcular totales por naturaleza de cuenta
    const accounts = await API.getAccounts();
    let totalActivos = 0, totalPasivos = 0, totalIngresos = 0, totalGastos = 0;
    for (const ac of accounts) {
      const saldo = saldos[ac.id] ?? 0;
      const cls   = ac.code.charAt(0);
      if (cls === '1')      totalActivos  += saldo;
      else if (cls === '2') totalPasivos  += Math.abs(saldo);
      else if (cls === '4') totalIngresos += Math.abs(saldo);
      else if (cls === '5' || cls === '6' || cls === '7') totalGastos += saldo;
    }

    // Últimas transacciones
    const txRes = await API.getTransactions({ page: 1, perPage: 8 });

    c.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#EEF4FF;animation-delay:.05s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-building text-sm" style="color:#1A4B8C"></i>
          <span class="text-xs font-semibold" style="color:#1A4B8C">Total Activos</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#1A4B8C">${fmt(totalActivos)}</p>
        <p class="text-xs mt-1" style="color:#1A4B8C;opacity:.7">${fmtN(kpis.totalAc)} cuentas activas</p>
      </div>
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#FFF8F0;animation-delay:.1s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-file-invoice-dollar text-sm" style="color:#C46516"></i>
          <span class="text-xs font-semibold" style="color:#C46516">Total Pasivos</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#C46516">${fmt(totalPasivos)}</p>
        <p class="text-xs mt-1" style="color:#C46516;opacity:.7">Patrimonio: ${fmt(totalActivos - totalPasivos)}</p>
      </div>
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#ECFDF5;animation-delay:.15s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-arrow-trend-up text-sm" style="color:#059669"></i>
          <span class="text-xs font-semibold" style="color:#059669">Ingresos del Período</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#059669">${fmt(totalIngresos)}</p>
        <p class="text-xs mt-1" style="color:#059669;opacity:.7">Gastos: ${fmt(totalGastos)}</p>
      </div>
      <div class="rounded-2xl p-4 anim-slide-up" style="background:#FEF2F2;animation-delay:.2s">
        <div class="flex items-center gap-2 mb-1">
          <i class="fas fa-receipt text-sm" style="color:#DC2626"></i>
          <span class="text-xs font-semibold" style="color:#DC2626">Transacciones</span>
        </div>
        <p class="text-2xl font-extrabold" style="color:#DC2626">${fmtN(kpis.totalTx)}</p>
        <p class="text-xs mt-1" style="color:#DC2626;opacity:.7">${fmtN(kpis.totalTp)} terceros registrados</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div class="xl:col-span-2 bg-white rounded-2xl border overflow-hidden anim-slide-up" style="border-color:#F0F0F0;animation-delay:.25s">
        <div class="flex items-center justify-between p-5 pb-3">
          <h3 class="font-bold text-sm" style="color:#0D2137">Últimas Transacciones</h3>
          <button class="btn btn-outline btn-sm" onclick="navigate('consulta-tx')"><i class="fas fa-arrow-right"></i> Ver todas</button>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Tipo / N.°</th><th>Fecha</th><th>Descripción</th><th>Tercero</th></tr></thead>
            <tbody>${txRes.items.length ? txRes.items.map(t => `
              <tr class="cursor-pointer" onclick="viewTransaction('${esc(t.id)}')">
                <td><span class="font-semibold" style="color:#E87D1E">${esc(t.expand?.tx_type_id?.prefix ?? '')}-${esc(t.number)}</span></td>
                <td>${esc(t.date)}</td>
                <td class="max-w-xs truncate">${esc(t.description ?? '—')}</td>
                <td>${esc(t.expand?.third_party_id?.name ?? '—')}</td>
              </tr>`).join('') :
              '<tr><td colspan="4" class="text-center py-8" style="color:#9CA3AF">No hay transacciones registradas</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 anim-slide-up" style="border-color:#F0F0F0;animation-delay:.3s">
        <h3 class="font-bold text-sm mb-4" style="color:#0D2137">Acciones Rápidas</h3>
        <div class="flex flex-col gap-3">
          ${can('canWrite') ? `<button onclick="navigate('nueva-tx')" class="btn btn-primary w-full justify-center"><i class="fas fa-plus"></i> Nueva Transacción</button>` : ''}
          <button onclick="navigate('plan-cuentas')" class="btn btn-secondary w-full justify-center"><i class="fas fa-sitemap"></i> Plan de Cuentas</button>
          ${can('canWrite') ? `<button onclick="navigate('terceros')" class="btn btn-outline w-full justify-center"><i class="fas fa-user-plus"></i> Gestionar Terceros</button>` : ''}
          <button onclick="navigate('reportes')" class="btn btn-outline w-full justify-center"><i class="fas fa-chart-pie"></i> Generar Reportes</button>
        </div>
        <div class="mt-6 p-4 rounded-xl" style="background:linear-gradient(135deg,#0D2137,#1A4B8C)">
          <p class="text-xs font-bold mb-1" style="color:rgba(255,255,255,.6)">RESULTADO DEL PERIODO</p>
          <p class="text-xl font-extrabold text-white">${fmt(totalIngresos - totalGastos)}</p>
          <p class="text-xs mt-1" style="color:rgba(255,255,255,.5)">Ingresos − Gastos − Costos</p>
        </div>
      </div>
    </div>`;
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function viewTransaction(id) {
  navigate('consulta-tx');
  // Abrir el detalle una vez que el módulo haya renderizado
  setTimeout(() => {
    if (typeof seeTxDetail === 'function') seeTxDetail(id);
  }, 120);
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderDashboard = renderDashboard;
(window as any).viewTransaction = viewTransaction;
