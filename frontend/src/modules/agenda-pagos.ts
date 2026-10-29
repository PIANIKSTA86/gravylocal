import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface AgendaRecord {
  id: string;
  type: 'cxp_proveedor' | 'cxp_importacion' | 'cxc_cliente' | 'impuesto_dian_iva' | 'impuesto_dian_retencion' | 'exogena_dian' | 'otro';
  title: string;
  description?: string;
  due_date: string;
  amount: number;
  status: 'pendiente' | 'programado' | 'pagado' | 'vencido';
  assigned_roles?: string[];
  created?: string;
}

interface RealCashTransaction {
  id: string;
  number: string;
  date: string;
  type: 'RC' | 'CE';
  third_name: string;
  description: string;
  amount: number;
}

interface RealCashflowData {
  transactions: RealCashTransaction[];
  dailyRealCxc: Record<string, number>;
  dailyRealCxp: Record<string, number>;
  totals: {
    totalRealCxc: number;
    totalRealCxp: number;
    netReal: number;
  };
}

(window as any).renderAgendaPagos = async function (c: HTMLElement) {
  c.innerHTML = `
    <div class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-spinner fa-spin mr-2"></i>Cargando agenda de pagos y flujo de caja...
    </div>
  `;

  try {
    // 1. Carga inicial de datos desde PocketBase
    const pb = (window as any).pb;
    const rawRecords = await pb.listAll('agenda_vencimientos', {
      sort: 'due_date'
    });
    
    let records: AgendaRecord[] = rawRecords.map((r: any) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      due_date: r.due_date,
      amount: r.amount || 0,
      status: r.status || 'pendiente',
      assigned_roles: r.assigned_roles || []
    }));

    // Cargar terceros para el formulario de creación (CXP de proveedores)
    const suppliers = await pb.listAll('third_parties', {
      filter: 'active=true',
      sort: 'name'
    });

    // 2. Definir estado dinámico de filtrado
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const MONTH_NAMES = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    let state = {
      calendarYear: today.getFullYear(),
      calendarMonth: today.getMonth(),
      dateFrom: fmtDate(startOfMonth),
      dateTo: fmtDate(endOfMonth),
      type: 'TODOS',
      status: 'TODOS',
      chartInstance: null as any
    };

    let realCashflow: RealCashflowData = {
      transactions: [],
      dailyRealCxc: {},
      dailyRealCxp: {},
      totals: { totalRealCxc: 0, totalRealCxp: 0, netReal: 0 }
    };

    async function loadRealCashflow() {
      try {
        const res = await fetch(`${pb.baseUrl}/api/gravy/agenda/real-cashflow?startDate=${state.dateFrom}&endDate=${state.dateTo}`, {
          headers: pb.headers()
        });
        if (res.ok) {
          const data = await res.json();
          realCashflow = {
            transactions: data.transactions || [],
            dailyRealCxc: data.dailyRealCxc || {},
            dailyRealCxp: data.dailyRealCxp || {},
            totals: data.totals || { totalRealCxc: 0, totalRealCxp: 0, netReal: 0 }
          };
          return;
        }
      } catch (e) {
        console.warn('Endpoint /api/gravy/agenda/real-cashflow no disponible, usando fallback PB...', e);
      }

      // Fallback directo PB SDK (consultando tx_lines en cuentas 11% Disponible)
      try {
        const lines = await pb.listAll('tx_lines', {
          filter: `account_id.code ~ '11%' && tx_id.status = 'active' && tx_id.date >= '${state.dateFrom}' && tx_id.date <= '${state.dateTo} 23:59:59'`,
          expand: 'tx_id,third_party_id'
        });

        const dailyCxc: Record<string, number> = {};
        const dailyCxp: Record<string, number> = {};
        let totCxc = 0;
        let totCxp = 0;
        const txMap = new Map<string, RealCashTransaction>();

        for (const l of lines) {
          const t = l.expand?.tx_id;
          if (!t) continue;

          const num = String(t.number || '');
          const isRC = num.startsWith('RC');
          const isCE = num.startsWith('CE') || num.startsWith('CG') || num.startsWith('EF');
          if (!isRC && !isCE) continue;

          const d = String(t.date).slice(0, 10);
          const amt = isRC ? Number(l.debit || 0) : Number(l.credit || 0);
          if (amt <= 0) continue;

          if (isRC) {
            totCxc += amt;
            dailyCxc[d] = (dailyCxc[d] || 0) + amt;
          } else {
            totCxp += amt;
            dailyCxp[d] = (dailyCxp[d] || 0) + amt;
          }

          if (txMap.has(t.id)) {
            txMap.get(t.id)!.amount += amt;
          } else {
            const tpName = l.expand?.third_party_id?.name || t.third_party_name || 'Tercero';
            txMap.set(t.id, {
              id: t.id,
              number: t.number,
              date: d,
              type: isRC ? 'RC' : 'CE',
              third_name: tpName,
              description: t.description || l.description || '',
              amount: amt
            });
          }
        }

        realCashflow = {
          transactions: Array.from(txMap.values()),
          dailyRealCxc: dailyCxc,
          dailyRealCxp: dailyCxp,
          totals: {
            totalRealCxc: totCxc,
            totalRealCxp: totCxp,
            netReal: totCxc - totCxp
          }
        };
      } catch (errFallback) {
        console.error('Error en fallback de flujo real:', errFallback);
        realCashflow = {
          transactions: [],
          dailyRealCxc: {},
          dailyRealCxp: {},
          totals: { totalRealCxc: 0, totalRealCxp: 0, netReal: 0 }
        };
      }
    }

    function formatCompactCOP(val: number): string {
      const abs = Math.abs(val);
      const sign = val < 0 ? '-' : '';
      if (abs >= 1_000_000) {
        return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
      }
      if (abs >= 1_000) {
        return `${sign}$${(abs / 1_000).toFixed(0)}k`;
      }
      return `${sign}$${abs.toLocaleString('es-CO')}`;
    }

    // 3. Renderizar Estructura del Módulo
    renderLayout();

    // 4. Funciones de Renderizado Interno
    function renderLayout() {
      c.innerHTML = `
        <div class="anim-slide-up" style="display:flex; flex-direction:column; gap:24px; padding:24px">
          
          <!-- Filtros y Controles Superiores -->
          <div class="stat-card" style="padding: 20px; border-radius: 16px;">
            <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end; justify-content:space-between">
              <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end">
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label" style="font-size:11px">Desde</label>
                  <input type="date" id="agenda-filter-from" class="form-input" value="${state.dateFrom}" style="max-width:150px">
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label" style="font-size:11px">Hasta</label>
                  <input type="date" id="agenda-filter-to" class="form-input" value="${state.dateTo}" style="max-width:150px">
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label" style="font-size:11px">Tipo</label>
                  <select id="agenda-filter-type" class="form-input" style="max-width:180px">
                    <option value="TODOS" ${state.type === 'TODOS' ? 'selected' : ''}>Todos los Vencimientos</option>
                    <option value="cxp_proveedor" ${state.type === 'cxp_proveedor' ? 'selected' : ''}>CXP Proveedores Locales</option>
                    <option value="cxp_importacion" ${state.type === 'cxp_importacion' ? 'selected' : ''}>CXP Importaciones (FOB/Fletes/Navieras)</option>
                    <option value="cxc_cliente" ${state.type === 'cxc_cliente' ? 'selected' : ''}>CXC Clientes (Cartera)</option>
                    <option value="impuesto_dian_iva" ${state.type === 'impuesto_dian_iva' ? 'selected' : ''}>Impuesto IVA (DIAN)</option>
                    <option value="impuesto_dian_retencion" ${state.type === 'impuesto_dian_retencion' ? 'selected' : ''}>Retenciones (DIAN)</option>
                    <option value="exogena_dian" ${state.type === 'exogena_dian' ? 'selected' : ''}>Info Exógena (DIAN)</option>
                    <option value="otro" ${state.type === 'otro' ? 'selected' : ''}>Otros Vencimientos</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0">
                  <label class="form-label" style="font-size:11px">Estado</label>
                  <select id="agenda-filter-status" class="form-input" style="max-width:150px">
                    <option value="TODOS" ${state.status === 'TODOS' ? 'selected' : ''}>Todos los Estados</option>
                    <option value="pendiente" ${state.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="programado" ${state.status === 'programado' ? 'selected' : ''}>Programado</option>
                    <option value="pagado" ${state.status === 'pagado' ? 'selected' : ''}>Pagado</option>
                    <option value="vencido" ${state.status === 'vencido' ? 'selected' : ''}>Vencido</option>
                  </select>
                </div>
              </div>
              
              <div style="display:flex; gap:8px">
                <button id="btn-agenda-sync" class="btn btn-outline" style="border-color:#3b82f6; color:#2563eb" title="Sincronizar facturas de compra y venta a crédito existentes">
                  <i class="fas fa-arrows-rotate mr-1"></i> Sincronizar Cartera & CXP
                </button>
                <button id="btn-agenda-dian" class="btn btn-outline" style="border-color:var(--accent-violet-strong); color:var(--accent-violet-strong)">
                  <i class="fas fa-calendar-plus mr-1"></i> Calendario DIAN 2026
                </button>
                <button id="btn-agenda-nuevo" class="btn btn-primary">
                  <i class="fas fa-plus mr-1"></i> Programar Pago
                </button>
              </div>
            </div>
          </div>

          <!-- Tarjetas KPI: Rolling Cashflow (Real Ejecutado + Proyectado) -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px">
            <div class="stat-card" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
              <div style="color:#5B21B6; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Cobros / Recaudos (CXC)</div>
              <div id="kpi-total-cxc" style="font-size:22px; font-weight:800; color:#059669; margin-top:6px">$0</div>
              <p id="kpi-sub-cxc" style="color:#6D28D9; font-size:11px; margin-top:4px; opacity:0.85">Real RC: $0 | Proy: $0</p>
            </div>
            <div class="stat-card" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
              <div style="color:#5B21B6; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Pagos Proveedores (CXP)</div>
              <div id="kpi-total-cxp" style="font-size:22px; font-weight:800; color:#EA580C; margin-top:6px">$0</div>
              <p id="kpi-sub-cxp" style="color:#6D28D9; font-size:11px; margin-top:4px; opacity:0.85">Real CE: $0 | Proy: $0</p>
            </div>
            <div class="stat-card" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
              <div style="color:#5B21B6; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Impuestos & DIAN</div>
              <div id="kpi-total-dian" style="font-size:22px; font-weight:800; color:#7C3AED; margin-top:6px">$0</div>
              <p style="color:#6D28D9; font-size:11px; margin-top:4px; opacity:0.85">Compromisos fiscales del periodo</p>
            </div>
            <div class="stat-card" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
              <div style="color:#5B21B6; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Total Vencido</div>
              <div id="kpi-total-vencido" style="font-size:22px; font-weight:800; color:#DC2626; margin-top:6px">$0</div>
              <p style="color:#DC2626; font-size:11px; margin-top:4px">Obligaciones fuera de plazo</p>
            </div>
            <div class="stat-card" style="background:#F5F3FF;border:1.5px solid #7C3AED;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04)">
              <div style="color:#5B21B6; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Flujo Neto Rolling</div>
              <div id="kpi-total-neto" style="font-size:22px; font-weight:800; color:#1E1B4B; margin-top:6px">$0</div>
              <p id="kpi-sub-neto" style="color:#6D28D9; font-size:11px; margin-top:4px; opacity:0.85">Neto Real a Hoy: $0</p>
            </div>
          </div>

          <!-- Grid principal: Gráfico y Calendario -->
          <div style="display:grid; grid-template-columns: 1fr; gap:24px;">
            
            <!-- Gráfica de proyección / flujo diario -->
            <div class="stat-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
                <div>
                  <h3 class="text-sm font-bold" style="color:var(--text-strong); text-transform:uppercase; letter-spacing:.5px">
                    <i class="fas fa-chart-line mr-2" style="color:var(--accent-violet)"></i>Flujo de Caja Diario: Ejecutado Real (RC/CE) vs Proyecciones Futuras
                  </h3>
                  <p style="font-size:11px; color:var(--text-muted); margin:2px 0 0 0">
                    Muestra los ingresos y egresos bancarios contabilizados hasta hoy y la proyección de vencimientos futuros.
                  </p>
                </div>
              </div>
              <div style="height: 280px; position: relative;">
                <canvas id="agenda-projection-chart"></canvas>
              </div>
            </div>

            <!-- Calendario Interactivo de Vencimientos -->
            <div class="stat-card" style="padding:24px; border-radius:18px;">
              <!-- Toolbar del Calendario -->
              <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border-soft)">
                <div style="display:flex; align-items:center; gap:12px">
                  <div style="width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 4px 10px rgba(109,40,217,0.25)">
                    <i class="fas fa-calendar-days text-lg"></i>
                  </div>
                  <div>
                    <h3 id="cal-month-title" class="text-lg font-extrabold" style="color:var(--text-strong); margin:0; line-height:1.2">
                      ${MONTH_NAMES[state.calendarMonth]} ${state.calendarYear}
                    </h3>
                    <p style="font-size:12px; color:var(--text-muted); margin:0">Haz clic en cualquier día para inspeccionar cobros reales, pagos efectuados o vencimientos programados</p>
                  </div>
                </div>

                <!-- Controles de Navegación del Calendario -->
                <div style="display:flex; align-items:center; gap:10px">
                  <div style="display:flex; background:rgba(15,23,42,0.04); padding:3px; border-radius:10px; border:1px solid var(--border-soft)">
                    <button id="btn-cal-prev" class="btn btn-sm btn-ghost" style="padding:6px 12px; border-radius:8px" title="Mes Anterior">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                    <button id="btn-cal-today" class="btn btn-sm btn-ghost font-bold" style="padding:6px 14px; border-radius:8px" title="Ir al Mes Actual">
                      Hoy
                    </button>
                    <button id="btn-cal-next" class="btn btn-sm btn-ghost" style="padding:6px 12px; border-radius:8px" title="Mes Siguiente">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                  <span id="agenda-count-badge" class="badge" style="background:#EDE9FE; color:#6D28D9; font-size:12px; font-weight:700; padding:6px 14px; border-radius:10px">
                    0 Vencimientos
                  </span>
                </div>
              </div>

              <!-- Leyenda Rápida de Colores -->
              <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:center; margin-bottom:18px; font-size:11px; font-weight:600; color:var(--text-muted); padding:0 4px">
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#059669; display:inline-block"></span>
                  <span>Recaudo Real Contabilizado (RC)</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#DC2626; display:inline-block"></span>
                  <span>Pago Real Contabilizado (CE)</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#10B981; display:inline-block"></span>
                  <span>Cobro Proyectado (CXC)</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#F97316; display:inline-block"></span>
                  <span>CXP Proveedores</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#0284C7; display:inline-block"></span>
                  <span>CXP Importación</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#8B5CF6; display:inline-block"></span>
                  <span>Impuestos DIAN</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px">
                  <span style="width:10px; height:10px; border-radius:3px; background:#EF4444; display:inline-block"></span>
                  <span>Vencidos en Mora</span>
                </div>
              </div>

              <!-- Grid del Calendario -->
              <div style="overflow-x:auto">
                <div id="agenda-calendar-container" style="min-width:760px"></div>
              </div>
            </div>

          </div>
        </div>
      `;

      // Registrar eventos
      document.getElementById('agenda-filter-from')?.addEventListener('change', (e: any) => {
        state.dateFrom = e.target.value;
        if (state.dateFrom) {
          const parts = state.dateFrom.split('-').map(Number);
          if (parts.length === 3) {
            state.calendarYear = parts[0];
            state.calendarMonth = parts[1] - 1;
          }
        }
        updateDataView();
      });
      document.getElementById('agenda-filter-to')?.addEventListener('change', (e: any) => {
        state.dateTo = e.target.value;
        updateDataView();
      });
      document.getElementById('agenda-filter-type')?.addEventListener('change', (e: any) => {
        state.type = e.target.value;
        updateDataView();
      });
      document.getElementById('agenda-filter-status')?.addEventListener('change', (e: any) => {
        state.status = e.target.value;
        updateDataView();
      });

      // Navegación rápida del Calendario
      document.getElementById('btn-cal-prev')?.addEventListener('click', () => {
        navigateMonth(-1);
      });
      document.getElementById('btn-cal-next')?.addEventListener('click', () => {
        navigateMonth(1);
      });
      document.getElementById('btn-cal-today')?.addEventListener('click', () => {
        const cur = new Date();
        setMonthYear(cur.getFullYear(), cur.getMonth());
      });

      document.getElementById('btn-agenda-nuevo')?.addEventListener('click', () => {
        openCreateModal();
      });
      document.getElementById('btn-agenda-dian')?.addEventListener('click', () => {
        openDianModal();
      });
      document.getElementById('btn-agenda-sync')?.addEventListener('click', async () => {
        const syncBtn = document.getElementById('btn-agenda-sync') as HTMLButtonElement;
        if (syncBtn) {
          syncBtn.disabled = true;
          syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Sincronizando...';
        }
        try {
          const orchestrator = (window as any).SupplyChainOrchestrator;
          if (orchestrator && typeof orchestrator.syncHistoricalInvoicesToAgenda === 'function') {
            const count = await orchestrator.syncHistoricalInvoicesToAgenda();
            (window as any).showToast(`Sincronización completada. Se incorporaron ${count} facturas históricas a la agenda.`, 'success');
            (window as any).renderAgendaPagos(c);
          } else {
            throw new Error('Servicio de sincronización no disponible.');
          }
        } catch (err: any) {
          (window as any).showToast('Error al sincronizar facturas: ' + (err.message || err), 'error');
          if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<i class="fas fa-arrows-rotate mr-1"></i> Sincronizar Cartera & CXP';
          }
        }
      });

      // Primer render de datos
      updateDataView();
    }

    function navigateMonth(delta: number) {
      let m = state.calendarMonth + delta;
      let y = state.calendarYear;
      if (m < 0) {
        m = 11;
        y--;
      } else if (m > 11) {
        m = 0;
        y++;
      }
      setMonthYear(y, m);
    }

    function setMonthYear(y: number, m: number) {
      state.calendarYear = y;
      state.calendarMonth = m;
      const s = new Date(y, m, 1);
      const e = new Date(y, m + 1, 0);
      state.dateFrom = fmtDate(s);
      state.dateTo = fmtDate(e);

      const fromInput = document.getElementById('agenda-filter-from') as HTMLInputElement;
      const toInput = document.getElementById('agenda-filter-to') as HTMLInputElement;
      if (fromInput) fromInput.value = state.dateFrom;
      if (toInput) toInput.value = state.dateTo;

      updateDataView();
    }

    async function updateDataView() {
      // 0. Cargar movimientos reales de caja/bancos (RC y CE)
      await loadRealCashflow();

      const todayStr = fmtDate(new Date());

      // 1. Filtrar registros por rango y opciones
      const filtered = records.filter(r => {
        const inDateRange = r.due_date >= state.dateFrom && r.due_date <= state.dateTo;
        const matchesType = state.type === 'TODOS' || r.type === state.type;
        const matchesStatus = state.status === 'TODOS' || r.status === state.status;
        return inDateRange && matchesType && matchesStatus;
      });

      // 2. Calcular Flujo Real Ejecutado (Recaudos RC y Pagos CE contabilizados en cuentas 11% Disponible)
      const realCxc = realCashflow.totals.totalRealCxc || 0;
      const realCxp = realCashflow.totals.totalRealCxp || 0;
      const realNet = realCashflow.totals.netReal || 0;

      // 3. Calcular Obligaciones Proyectadas (Pendientes)
      let projCxc = 0;
      let projCxp = 0;
      let projDian = 0;
      let totalVencido = 0;

      filtered.forEach(r => {
        const isTax = r.type === 'impuesto_dian_iva' || r.type === 'impuesto_dian_retencion' || r.type === 'exogena_dian';
        
        // Sumar a total vencido si venció y no está pagado
        if (r.status === 'vencido') {
          totalVencido += r.amount;
        }

        if (r.status !== 'pagado') {
          if (r.type === 'cxc_cliente') {
            projCxc += r.amount;
          } else if (r.type === 'cxp_proveedor' || r.type === 'cxp_importacion') {
            projCxp += r.amount;
          } else if (isTax) {
            projDian += r.amount;
          }
        }
      });

      // Rolling Cashflow totals:
      const totalCobrosRolling = realCxc + projCxc;
      const totalPagosRolling = realCxp + projCxp;
      const totalNetoRolling = totalCobrosRolling - totalPagosRolling - projDian;

      // Actualizar valores en UI
      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);
      
      const elCxc = document.getElementById('kpi-total-cxc');
      const elSubCxc = document.getElementById('kpi-sub-cxc');
      const elCxp = document.getElementById('kpi-total-cxp');
      const elSubCxp = document.getElementById('kpi-sub-cxp');
      const elDian = document.getElementById('kpi-total-dian');
      const elVencido = document.getElementById('kpi-total-vencido');
      const elNeto = document.getElementById('kpi-total-neto');
      const elSubNeto = document.getElementById('kpi-sub-neto');
      const elBadge = document.getElementById('agenda-count-badge');
      const calTitle = document.getElementById('cal-month-title');

      if (elCxc) elCxc.innerText = formatCOP(totalCobrosRolling);
      if (elSubCxc) elSubCxc.innerText = `Real RC: ${formatCompactCOP(realCxc)} | Proy: ${formatCompactCOP(projCxc)}`;
      
      if (elCxp) elCxp.innerText = formatCOP(totalPagosRolling);
      if (elSubCxp) elSubCxp.innerText = `Real CE: ${formatCompactCOP(realCxp)} | Proy: ${formatCompactCOP(projCxp)}`;

      if (elDian) elDian.innerText = formatCOP(projDian);
      if (elVencido) elVencido.innerText = formatCOP(totalVencido);
      if (elNeto) {
        elNeto.innerText = formatCOP(totalNetoRolling);
        elNeto.style.color = totalNetoRolling >= 0 ? '#10B981' : '#EF4444';
      }
      if (elSubNeto) {
        elSubNeto.innerText = `Neto Real a Hoy: ${formatCompactCOP(realNet)}`;
      }
      if (elBadge) elBadge.innerText = `${filtered.length} Vencimientos`;

      if (calTitle) calTitle.innerText = `${MONTH_NAMES[state.calendarMonth]} ${state.calendarYear}`;

      // 4. Renderizar Calendario Interactivo con datos reales y proyectados
      renderCalendar(filtered);

      // 5. Renderizar Gráfico Rolling
      renderChart(filtered);
    }

    function renderCalendar(items: AgendaRecord[]) {
      const container = document.getElementById('agenda-calendar-container');
      if (!container) return;

      const y = state.calendarYear;
      const m = state.calendarMonth;

      // Días del mes y offset (Lunes primer día de la semana)
      const firstDay = new Date(y, m, 1);
      const startingDay = firstDay.getDay(); // 0 = Dom, 1 = Lun...
      const startOffset = (startingDay === 0 ? 6 : startingDay - 1);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const daysInPrevMonth = new Date(y, m, 0).getDate();
      const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

      const now = new Date();
      const todayStr = fmtDate(now);

      // Mapear vencimientos por fecha (YYYY-MM-DD)
      const activeRecords = records.filter(r => {
        const matchesType = state.type === 'TODOS' || r.type === state.type;
        const matchesStatus = state.status === 'TODOS' || r.status === state.status;
        return matchesType && matchesStatus;
      });

      const itemsByDate = new Map<string, AgendaRecord[]>();
      activeRecords.forEach(r => {
        if (!itemsByDate.has(r.due_date)) {
          itemsByDate.set(r.due_date, []);
        }
        itemsByDate.get(r.due_date)!.push(r);
      });

      // Mapear transacciones reales por fecha
      const realByDate = new Map<string, RealCashTransaction[]>();
      realCashflow.transactions.forEach(t => {
        if (!realByDate.has(t.date)) {
          realByDate.set(t.date, []);
        }
        realByDate.get(t.date)!.push(t);
      });

      // Cabecera de días de la semana
      let html = `
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:8px; margin-bottom:8px">
          ${DAY_NAMES.map(d => `
            <div style="background:#F1F5F9; color:#475569; font-size:11px; font-weight:800; text-align:center; padding:9px 4px; border-radius:8px; text-transform:uppercase; letter-spacing:.5px">
              ${d}
            </div>
          `).join('')}
        </div>
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:8px">
      `;

      for (let i = 0; i < totalCells; i++) {
        let cellYear = y;
        let cellMonth = m;
        let dayNum = 0;
        let isCurrentMonth = true;

        if (i < startOffset) {
          // Días del mes anterior
          dayNum = daysInPrevMonth - startOffset + i + 1;
          cellMonth = m - 1;
          if (cellMonth < 0) { cellMonth = 11; cellYear--; }
          isCurrentMonth = false;
        } else if (i >= startOffset + daysInMonth) {
          // Días del mes siguiente
          dayNum = i - (startOffset + daysInMonth) + 1;
          cellMonth = m + 1;
          if (cellMonth > 11) { cellMonth = 0; cellYear++; }
          isCurrentMonth = false;
        } else {
          // Días del mes actual
          dayNum = i - startOffset + 1;
        }

        const dateStr = `${cellYear}-${pad(cellMonth + 1)}-${pad(dayNum)}`;
        const isToday = dateStr === todayStr;
        const isPastOrToday = dateStr <= todayStr;
        const dayItems = itemsByDate.get(dateStr) || [];
        const dayRealTxs = realByDate.get(dateStr) || [];

        // Calcular flujos del día
        let dayRealCxc = 0;
        let dayRealCxp = 0;
        dayRealTxs.forEach(t => {
          if (t.type === 'RC') dayRealCxc += t.amount;
          else dayRealCxp += t.amount;
        });

        let dayProjCxc = 0;
        let dayProjCxp = 0;
        let hasOverdue = false;

        dayItems.forEach(item => {
          if (item.status === 'vencido') hasOverdue = true;
          if (item.status !== 'pagado') {
            if (item.type === 'cxc_cliente') {
              dayProjCxc += item.amount;
            } else {
              dayProjCxp += item.amount;
            }
          }
        });

        // Balance neto del día
        const dayNet = isPastOrToday 
          ? ((dayRealCxc + dayProjCxc) - (dayRealCxp + dayProjCxp))
          : (dayProjCxc - dayProjCxp);

        const hasEvents = dayItems.length > 0 || dayRealTxs.length > 0;

        // Estilos de la celda
        let cellBg = isCurrentMonth ? '#FFFFFF' : '#F8FAFC';
        let cellBorder = '1px solid #E2E8F0';
        let textOpacity = isCurrentMonth ? '1' : '0.45';

        if (isToday) {
          cellBorder = '2px solid #8B5CF6';
          cellBg = '#FAF5FF';
        } else if (hasOverdue) {
          cellBorder = '1px solid #FECACA';
        }

        html += `
          <div class="cal-day-cell" data-date="${dateStr}" style="
            min-height: 118px;
            background: ${cellBg};
            border: ${cellBorder};
            border-radius: 12px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: all 0.15s ease;
            position: relative;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 14px rgba(0,0,0,0.06)'; this.style.borderColor='#CBD5E1'"
             onmouseout="this.style.transform='none'; this.style.boxShadow='0 1px 2px rgba(0,0,0,0.03)'; this.style.borderColor='${cellBorder.split(' ')[2]}'">
            
            <!-- Encabezado de la celda: Número de día y Saldo del Día -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
              <div style="display:flex; align-items:center; gap:6px">
                <span style="font-size:13px; font-weight:800; color:${isToday ? '#7C3AED' : '#1E293B'}; opacity:${textOpacity}">
                  ${dayNum}
                </span>
                ${isToday ? `<span style="background:#7C3AED; color:#fff; font-size:9px; font-weight:800; padding:1px 5px; border-radius:6px">Hoy</span>` : ''}
                ${dayRealTxs.length > 0 ? `<span style="background:#ECFDF5; color:#047857; font-size:8.5px; font-weight:800; padding:1px 4px; border-radius:4px" title="Movimientos bancarios reales ejecutados">Real</span>` : ''}
              </div>

              ${hasEvents ? `
                <div style="font-size:10px; font-weight:800; padding:1px 6px; border-radius:6px; ${
                  dayNet > 0 
                    ? 'background:#ECFDF5; color:#059669' 
                    : (dayNet < 0 ? 'background:#FEF2F2; color:#DC2626' : 'background:#F3F4F6; color:#4B5563')
                }" title="Flujo neto del día: ${formatCompactCOP(dayNet)}">
                  ${dayNet > 0 ? '+' : ''}${formatCompactCOP(dayNet)}
                </div>
              ` : ''}
            </div>

            <!-- Chips de Movimientos Reales y Vencimientos Programados -->
            <div style="display:flex; flex-direction:column; gap:4px; flex:1">
              
              <!-- Chips de Movimientos Reales Contabilizados (RC / CE) -->
              ${dayRealTxs.slice(0, 2).map(t => {
                const isRC = t.type === 'RC';
                const chipBg = isRC ? '#ECFDF5' : '#FEF2F2';
                const chipColor = isRC ? '#065F46' : '#991B1B';
                const chipBorder = isRC ? '#A7F3D0' : '#FECACA';
                const iconClass = isRC ? 'fa-money-bill-transfer' : 'fa-receipt';
                const label = isRC ? 'RC' : 'CE';
                
                return `
                  <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    background: ${chipBg};
                    color: ${chipColor};
                    border: 1px solid ${chipBorder};
                    border-left: 3px solid ${isRC ? '#059669' : '#DC2626'};
                    border-radius: 6px;
                    padding: 2px 6px;
                    font-size: 9.5px;
                    font-weight: 700;
                    line-height: 1.3;
                  " title="${label}: ${t.number} — ${t.third_name} (${formatCompactCOP(t.amount)}) [REAL CONTABILIZADO]">
                    <div style="display:flex; align-items:center; gap:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:68%">
                      <i class="fas ${iconClass}" style="font-size:8.5px"></i>
                      <span style="overflow:hidden; text-overflow:ellipsis">${t.number}</span>
                    </div>
                    <span style="font-weight:800; font-size:9px; white-space:nowrap">${isRC ? '+' : '-'}${formatCompactCOP(t.amount)}</span>
                  </div>
                `;
              }).join('')}

              <!-- Chips de Vencimientos Programados de la Agenda -->
              ${dayItems.slice(0, Math.max(1, 3 - dayRealTxs.length)).map(item => {
                const isPaid = item.status === 'pagado';
                const isVencido = item.status === 'vencido';

                let chipBg = '#F3F4F6';
                let chipColor = '#374151';
                let chipBorder = '#E5E7EB';
                let iconClass = 'fa-circle-dot';

                if (item.type === 'cxc_cliente') {
                  chipBg = '#ECFDF5';
                  chipColor = '#065F46';
                  chipBorder = '#A7F3D0';
                  iconClass = 'fa-hand-holding-dollar';
                } else if (item.type === 'cxp_proveedor') {
                  chipBg = '#FFF7ED';
                  chipColor = '#9A3412';
                  chipBorder = '#FED7AA';
                  iconClass = 'fa-truck-field';
                } else if (item.type === 'cxp_importacion') {
                  chipBg = '#F0F9FF';
                  chipColor = '#075985';
                  chipBorder = '#BAE6FD';
                  iconClass = 'fa-ship';
                } else if (item.type.startsWith('impuesto_dian') || item.type === 'exogena_dian') {
                  chipBg = '#FAF5FF';
                  chipColor = '#581C87';
                  chipBorder = '#E9D5FF';
                  iconClass = 'fa-building-columns';
                }

                if (isVencido) {
                  chipBg = '#FEE2E2';
                  chipColor = '#991B1B';
                  chipBorder = '#FCA5A5';
                  iconClass = 'fa-triangle-exclamation';
                } else if (isPaid) {
                  chipBg = '#D1FAE5';
                  chipColor = '#065F46';
                  chipBorder = '#6EE7B7';
                  iconClass = 'fa-check';
                }

                const shortTitle = item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title;

                return `
                  <div style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    background: ${chipBg};
                    color: ${chipColor};
                    border: 1px solid ${chipBorder};
                    border-radius: 6px;
                    padding: 2px 6px;
                    font-size: 9.5px;
                    font-weight: 700;
                    line-height: 1.3;
                    ${isPaid ? 'opacity:0.75; text-decoration:line-through' : ''}
                  " title="${item.title} — ${formatCompactCOP(item.amount)} (${item.status.toUpperCase()})">
                    <div style="display:flex; align-items:center; gap:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:68%">
                      <i class="fas ${iconClass}" style="font-size:8.5px"></i>
                      <span style="overflow:hidden; text-overflow:ellipsis">${shortTitle}</span>
                    </div>
                    <span style="font-weight:800; font-size:9px; white-space:nowrap">${formatCompactCOP(item.amount)}</span>
                  </div>
                `;
              }).join('')}

              ${(dayItems.length + dayRealTxs.length) > 3 ? `
                <div style="font-size:9.5px; font-weight:800; color:#6D28D9; background:#EDE9FE; border-radius:6px; padding:1px 4px; text-align:center; margin-top:auto">
                  + ${(dayItems.length + dayRealTxs.length) - 3} más...
                </div>
              ` : ''}

              ${!hasEvents ? `
                <div style="display:flex; align-items:center; justify-content:center; height:100%; opacity:0; transition:opacity 0.15s" class="hover-add-indicator">
                  <span style="font-size:10px; color:#94A3B8; font-weight:600"><i class="fas fa-plus mr-1"></i>Añadir</span>
                </div>
              ` : ''}
            </div>

          </div>
        `;
      }

      html += `</div>`;
      container.innerHTML = html;

      // Registrar clic en cada día para abrir el modal de detalle del día
      container.querySelectorAll('.cal-day-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const dateStr = cell.getAttribute('data-date');
          if (!dateStr) return;
          const dayItems = itemsByDate.get(dateStr) || [];
          const dayRealTxs = realByDate.get(dateStr) || [];
          openDayDetailModal(dateStr, dayItems, dayRealTxs);
        });
      });
    }

    function openDayDetailModal(dateStr: string, dayItems: AgendaRecord[], dayRealTxs: RealCashTransaction[] = []) {
      const parts = dateStr.split('-').map(Number);
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      
      const weekdayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dateObj.getDay()];
      const monthName = MONTH_NAMES[parts[1] - 1];
      const formattedTitle = `${weekdayName}, ${parts[2]} de ${monthName} de ${parts[0]}`;

      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

      let dayRealCxc = 0;
      let dayRealCxp = 0;
      dayRealTxs.forEach(t => {
        if (t.type === 'RC') dayRealCxc += t.amount;
        else dayRealCxp += t.amount;
      });

      let dayProjCxc = 0;
      let dayProjCxp = 0;
      dayItems.forEach(i => {
        if (i.status !== 'pagado') {
          if (i.type === 'cxc_cliente') dayProjCxc += i.amount;
          else dayProjCxp += i.amount;
        }
      });

      const todayStr = fmtDate(new Date());
      const isPastOrToday = dateStr <= todayStr;
      const netTotalDay = isPastOrToday 
        ? ((dayRealCxc + dayProjCxc) - (dayRealCxp + dayProjCxp))
        : (dayProjCxc - dayProjCxp);

      const typeLabels: Record<string, string> = {
        cxp_proveedor: 'CXP Proveedor',
        cxp_importacion: 'CXP Importación',
        cxc_cliente: 'CXC Cliente (Cartera)',
        impuesto_dian_iva: 'IVA (DIAN)',
        impuesto_dian_retencion: 'Rete. (DIAN)',
        exogena_dian: 'Exógena (DIAN)',
        otro: 'Otro'
      };

      const typeColors: Record<string, string> = {
        cxp_proveedor: '#F97316',
        cxp_importacion: '#0284C7',
        cxc_cliente: '#10B981',
        impuesto_dian_iva: '#A855F7',
        impuesto_dian_retencion: '#6366F1',
        exogena_dian: '#EF4444',
        otro: '#6B7280'
      };

      const statusBadges: Record<string, string> = {
        pendiente: 'background:#FEF3C7; color:#D97706; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:700',
        programado: 'background:#DBEAFE; color:#2563EB; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:700',
        pagado: 'background:#D1FAE5; color:#059669; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:700',
        vencido: 'background:#FEE2E2; color:#DC2626; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:700'
      };

      const bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:20px">
          
          <!-- Balance financiero del día (Real Contabilizado + Proyección) -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px; padding:14px">
            <div>
              <div style="font-size:11px; font-weight:700; color:#059669; text-transform:uppercase">
                Cobros / Recaudos
              </div>
              <div style="font-size:16px; font-weight:800; color:#065F46; margin-top:2px">
                ${formatCOP(dayRealCxc + dayProjCxc)}
              </div>
              <div style="font-size:10px; color:#475569; margin-top:2px">
                Real: <strong>${formatCompactCOP(dayRealCxc)}</strong> | Proy: <strong>${formatCompactCOP(dayProjCxc)}</strong>
              </div>
            </div>
            <div>
              <div style="font-size:11px; font-weight:700; color:#EA580C; text-transform:uppercase">
                Pagos / Egresos
              </div>
              <div style="font-size:16px; font-weight:800; color:#9A3412; margin-top:2px">
                ${formatCOP(dayRealCxp + dayProjCxp)}
              </div>
              <div style="font-size:10px; color:#475569; margin-top:2px">
                Real: <strong>${formatCompactCOP(dayRealCxp)}</strong> | Proy: <strong>${formatCompactCOP(dayProjCxp)}</strong>
              </div>
            </div>
            <div>
              <div style="font-size:11px; font-weight:700; color:#5B21B6; text-transform:uppercase">Flujo Neto</div>
              <div style="font-size:16px; font-weight:800; color:${netTotalDay >= 0 ? '#10B981' : '#EF4444'}; margin-top:2px">
                ${netTotalDay >= 0 ? '+' : ''}${formatCOP(netTotalDay)}
              </div>
              <div style="font-size:10px; color:#6B7280; margin-top:2px">
                ${isPastOrToday ? 'Flujo Ejecutado / Neto' : 'Proyección Estimada'}
              </div>
            </div>
          </div>

          <!-- SECCIÓN 1: Movimientos Reales Contabilizados en Caja y Bancos (si existen) -->
          ${dayRealTxs.length > 0 ? `
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                <span style="font-size:12px; font-weight:800; color:#047857; text-transform:uppercase; letter-spacing:0.5px">
                  <i class="fas fa-file-invoice-dollar mr-1"></i> Movimientos Reales Contabilizados en Bancos/Caja (${dayRealTxs.length})
                </span>
                <span class="badge" style="background:#D1FAE5; color:#065F46; font-size:10px; font-weight:700">
                  <i class="fas fa-check-double mr-1"></i>Cuentas 11 (Disponible)
                </span>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px">
                ${dayRealTxs.map(t => {
                  const isRC = t.type === 'RC';
                  return `
                    <div style="
                      background: ${isRC ? '#F0FDF4' : '#FEF2F2'};
                      border: 1px solid ${isRC ? '#BBF7D0' : '#FECACA'};
                      border-left: 4px solid ${isRC ? '#059669' : '#DC2626'};
                      border-radius: 10px;
                      padding: 10px 14px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    ">
                      <div>
                        <div style="display:flex; align-items:center; gap:8px">
                          <span class="badge" style="background:${isRC ? '#059669' : '#DC2626'}; color:#fff; font-size:10px; font-weight:800; padding:2px 6px">
                            ${isRC ? 'RECAUDO RC' : 'COMPROBANTE CE'}
                          </span>
                          <span style="font-size:13px; font-weight:800; color:#0F172A">${t.number}</span>
                          <span style="font-size:12px; color:#475569; font-weight:600">${t.third_name}</span>
                        </div>
                        ${t.description ? `<div style="font-size:11px; color:#64748B; margin-top:3px">${t.description}</div>` : ''}
                      </div>
                      <div style="text-align:right">
                        <div style="font-size:15px; font-weight:800; color:${isRC ? '#059669' : '#DC2626'}">
                          ${isRC ? '+' : '-'}${formatCOP(t.amount)}
                        </div>
                        <span style="font-size:10px; font-weight:700; color:#4B5563">
                          ${isRC ? 'Ingreso Efectivo' : 'Egreso Efectivo'}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- SECCIÓN 2: Listado de Obligaciones y Vencimientos Programados -->
          <div>
            <div style="font-size:12px; font-weight:800; color:#4338CA; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px">
              <i class="fas fa-calendar-check mr-1"></i> Compromisos y Vencimientos Programados (${dayItems.length})
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; padding-right:4px">
              ${dayItems.length === 0 ? `
                <div style="text-align:center; padding:24px 16px; color:#94A3B8; background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:10px">
                  <i class="fas fa-calendar-plus text-2xl mb-2" style="opacity:0.6"></i>
                  <p style="margin:0; font-size:12.5px; font-weight:600">No hay compromisos pendientes de agenda registrados para esta fecha.</p>
                </div>
              ` : dayItems.map(item => {
                const rolesString = item.assigned_roles && item.assigned_roles.length > 0 
                  ? item.assigned_roles.map(r => r.toUpperCase()).join(', ') 
                  : 'TODOS';

                return `
                  <div style="
                    background:#FFFFFF;
                    border:1px solid #E2E8F0;
                    border-radius:12px;
                    padding:12px 14px;
                    display:flex;
                    flex-direction:column;
                    gap:8px;
                    box-shadow:0 1px 3px rgba(0,0,0,0.02);
                  ">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px">
                      <div>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px">
                          <span class="badge" style="background:rgba(15,23,42,0.05); color:${typeColors[item.type]}; font-size:11px; font-weight:700">
                            ${typeLabels[item.type] || item.type}
                          </span>
                          <span style="${statusBadges[item.status]}">
                            ${item.status.toUpperCase()}
                          </span>
                          <span style="font-size:11px; color:#64748B; font-weight:600">
                            Roles: ${rolesString}
                          </span>
                        </div>
                        <div style="font-size:13px; font-weight:700; color:#1E293B">${item.title}</div>
                        ${item.description ? `<div style="font-size:11px; color:#64748B; margin-top:2px">${item.description}</div>` : ''}
                      </div>
                      <div style="text-align:right">
                        <div style="font-size:15px; font-weight:800; color:#0F172A">${formatCOP(item.amount)}</div>
                      </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:2px; padding-top:6px; border-top:1px solid #F1F5F9">
                      ${item.status !== 'pagado' ? `
                        <button class="btn btn-sm btn-outline text-emerald-600 border-emerald-300 btn-day-mark-paid" data-id="${item.id}" title="Marcar como Pagado">
                          <i class="fas fa-check mr-1"></i> Pagado
                        </button>
                      ` : ''}
                      <button class="btn btn-sm btn-outline text-blue-600 border-blue-300 btn-day-reprogram" data-id="${item.id}" title="Reprogramar fecha de vencimiento">
                        <i class="fas fa-clock mr-1"></i> Reprogramar
                      </button>
                      <button class="btn btn-sm btn-outline text-red-600 border-red-300 btn-day-delete" data-id="${item.id}" title="Eliminar de la agenda">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      `;

      const footerHtml = `
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center">
          <button class="btn btn-primary btn-sm" id="btn-modal-add-for-date">
            <i class="fas fa-plus mr-1"></i> Programar compromiso para esta fecha
          </button>
          <button class="btn btn-outline btn-sm" id="btn-modal-day-close">
            Cerrar
          </button>
        </div>
      `;

      (window as any).openModal(`Detalle Diario: ${formattedTitle}`, bodyHtml, footerHtml);

      // Eventos del modal
      document.getElementById('btn-modal-day-close')?.addEventListener('click', () => {
        (window as any).closeModal();
      });

      document.getElementById('btn-modal-add-for-date')?.addEventListener('click', () => {
        (window as any).closeModal();
        openCreateModal(dateStr);
      });

      document.querySelectorAll('.btn-day-mark-paid').forEach(btn => {
        btn.addEventListener('click', async (e: any) => {
          const id = (e.currentTarget as HTMLElement).dataset.id;
          if (id) {
            await updateStatus(id, 'pagado');
            (window as any).closeModal();
          }
        });
      });

      document.querySelectorAll('.btn-day-reprogram').forEach(btn => {
        btn.addEventListener('click', (e: any) => {
          const id = (e.currentTarget as HTMLElement).dataset.id;
          const targetItem = records.find(r => r.id === id);
          if (targetItem) {
            (window as any).closeModal();
            openReprogramModal(targetItem);
          }
        });
      });

      document.querySelectorAll('.btn-day-delete').forEach(btn => {
        btn.addEventListener('click', async (e: any) => {
          const id = (e.currentTarget as HTMLElement).dataset.id;
          if (id && confirm('¿Estás seguro de que deseas eliminar este vencimiento de la agenda?')) {
            await deleteItem(id);
            (window as any).closeModal();
          }
        });
      });
    }


    function renderChart(items: AgendaRecord[]) {
      const canvas = document.getElementById('agenda-projection-chart') as HTMLCanvasElement;
      if (!canvas) return;

      if (state.chartInstance) {
        state.chartInstance.destroy();
        state.chartInstance = null;
      }

      // Generar fechas en el rango sin desajuste de zona horaria
      const dates: string[] = [];
      try {
        const [sY, sM, sD] = state.dateFrom.split('-').map(Number);
        const [eY, eM, eD] = state.dateTo.split('-').map(Number);
        const curr = new Date(sY, sM - 1, sD, 12, 0, 0);
        const end = new Date(eY, eM - 1, eD, 12, 0, 0);
        while (curr <= end) {
          const y = curr.getFullYear();
          const m = String(curr.getMonth() + 1).padStart(2, '0');
          const d = String(curr.getDate()).padStart(2, '0');
          dates.push(`${y}-${m}-${d}`);
          curr.setDate(curr.getDate() + 1);
        }
      } catch (_) { }

      const todayStr = fmtDate(new Date());

      // Mapear proyecciones de agenda por fecha
      const dailyProjCxc: Record<string, number> = {};
      const dailyProjCxp: Record<string, number> = {};

      dates.forEach(d => {
        dailyProjCxc[d] = 0;
        dailyProjCxp[d] = 0;
      });

      items.forEach(r => {
        if (r.status !== 'pagado') {
          const d = r.due_date;
          if (dailyProjCxc[d] === undefined) {
            dailyProjCxc[d] = 0;
            dailyProjCxp[d] = 0;
            if (!dates.includes(d)) dates.push(d);
          }
          if (r.type === 'cxc_cliente') {
            dailyProjCxc[d] += r.amount;
          } else {
            dailyProjCxp[d] += r.amount;
          }
        }
      });

      dates.sort();

      // Construir series Rolling: Para días <= todayStr se toma el flujo real (RC / CE)
      // Para días > todayStr se toman las obligaciones proyectadas
      const dataCxc: number[] = [];
      const dataCxp: number[] = [];
      const dataNet: number[] = [];

      dates.forEach(d => {
        const isPastOrToday = d <= todayStr;
        
        let cxcVal = 0;
        let cxpVal = 0;

        if (isPastOrToday) {
          // Real ejecutado + vencimientos no pagados de hoy
          cxcVal = (realCashflow.dailyRealCxc[d] || 0) + (d === todayStr ? (dailyProjCxc[d] || 0) : 0);
          cxpVal = (realCashflow.dailyRealCxp[d] || 0) + (d === todayStr ? (dailyProjCxp[d] || 0) : 0);
        } else {
          // Proyección futura
          cxcVal = dailyProjCxc[d] || 0;
          cxpVal = dailyProjCxp[d] || 0;
        }

        dataCxc.push(cxcVal);
        dataCxp.push(cxpVal);
        dataNet.push(cxcVal - cxpVal);
      });

      const labels = dates.map(d => {
        const parts = d.split('-');
        return `${parts[2]}/${parts[1]}`;
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      state.chartInstance = new Chart(canvas, {
        data: {
          labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Cobros / Ingresos (+)',
              data: dataCxc,
              backgroundColor: '#10B981',
              hoverBackgroundColor: '#059669',
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
              order: 2
            },
            {
              type: 'bar' as const,
              label: 'Pagos / Egresos (-)',
              data: dataCxp,
              backgroundColor: '#F97316',
              hoverBackgroundColor: '#EA580C',
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
              order: 2
            },
            {
              type: 'line' as const,
              label: 'Flujo Neto Rolling',
              data: dataNet,
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: false,
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 6,
              borderWidth: 2,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { size: 11, weight: 'bold' }
              }
            },
            tooltip: {
              callbacks: {
                title: function (tooltipItems: any) {
                  if (!tooltipItems || tooltipItems.length === 0) return '';
                  const idx = tooltipItems[0].dataIndex;
                  const dateStr = dates[idx];
                  const isPastOrToday = dateStr <= todayStr;
                  return `${tooltipItems[0].label} (${dateStr}) — ${isPastOrToday ? 'Real Ejecutado / Hoy' : 'Proyección Futura'}`;
                },
                label: function (tooltipItem: any) {
                  const val = tooltipItem.raw || 0;
                  return ` ${tooltipItem.dataset.label}: $ ${Number(val).toLocaleString('es-CO')}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { size: 10 },
                callback: function (val: any) {
                  if (Math.abs(val) >= 1000000) {
                    return `$ ${(val / 1000000).toFixed(1)}M`;
                  }
                  if (Math.abs(val) >= 1000) {
                    return `$ ${(val / 1000).toFixed(0)}k`;
                  }
                  return `$ ${val}`;
                }
              }
            }
          }
        }
      });
    }

    function openCreateModal(prefillDate?: string) {
      const thirdOptions = suppliers.map((s: any) => `
        <option value="${s.id}">${s.name} (${s.nit})</option>
      `).join('');

      const defaultDate = prefillDate || fmtDate(new Date());

      const bodyHtml = `
        <form id="form-agenda-nuevo" style="display:flex; flex-direction:column; gap:16px">
          <div class="form-group">
            <label class="form-label">Tipo de Obligación</label>
            <select id="new-agenda-type" class="form-input" required>
              <option value="cxp_proveedor">Cuentas por Pagar (CXP Proveedor)</option>
              <option value="impuesto_dian_iva">Impuesto de IVA (DIAN)</option>
              <option value="impuesto_dian_retencion">Retención en la Fuente (DIAN)</option>
              <option value="exogena_dian">Información Exógena (DIAN)</option>
              <option value="otro">Otro Compromiso</option>
            </select>
          </div>

          <div class="form-group" id="group-agenda-supplier">
            <label class="form-label">Proveedor</label>
            <select id="new-agenda-supplier" class="form-input">
              <option value="">-- Seleccionar Tercero --</option>
              ${thirdOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Concepto / Título</label>
            <input type="text" id="new-agenda-title" class="form-input" placeholder="Ej: Pago de retenciones DIAN" required>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción Detallada (Opcional)</label>
            <textarea id="new-agenda-desc" class="form-input" placeholder="Detalles de la transacción..." rows="2"></textarea>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px">
            <div class="form-group">
              <label class="form-label">Monto ($ COP)</label>
              <input type="number" id="new-agenda-amount" class="form-input" min="0" required placeholder="0">
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de Vencimiento</label>
              <input type="date" id="new-agenda-date" class="form-input" value="${defaultDate}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Roles Asignados</label>
            <div style="display:flex; gap:12px; margin-top:8px">
              <label style="display:flex; align-items:center; gap:6px; font-size:13px">
                <input type="checkbox" name="assigned_roles" value="auxiliar" checked> Auxiliar
              </label>
              <label style="display:flex; align-items:center; gap:6px; font-size:13px">
                <input type="checkbox" name="assigned_roles" value="contador" checked> Contador
              </label>
              <label style="display:flex; align-items:center; gap:6px; font-size:13px">
                <input type="checkbox" name="assigned_roles" value="admin" checked> Admin
              </label>
            </div>
          </div>
        </form>
      `;

      const footerHtml = `
        <button class="btn btn-outline" id="btn-modal-cancel">Cancelar</button>
        <button class="btn btn-primary" id="btn-modal-save">
          <i class="fas fa-save mr-1"></i>Guardar Recordatorio
        </button>
      `;

      (window as any).openModal('Programar Pago / Vencimiento', bodyHtml, footerHtml);

      // Sincronizar el título según el tipo seleccionado por defecto
      const typeSelect = document.getElementById('new-agenda-type') as HTMLSelectElement;
      const titleInput = document.getElementById('new-agenda-title') as HTMLInputElement;
      const supplierGroup = document.getElementById('group-agenda-supplier') as HTMLDivElement;

      typeSelect.addEventListener('change', () => {
        const tVal = typeSelect.value;
        if (tVal === 'cxp_proveedor') {
          supplierGroup.style.display = 'block';
          titleInput.value = '';
        } else {
          supplierGroup.style.display = 'none';
          if (tVal === 'impuesto_dian_iva') {
            titleInput.value = 'Pago Impuesto IVA (DIAN)';
          } else if (tVal === 'impuesto_dian_retencion') {
            titleInput.value = 'Declaración de Retención en la Fuente';
          } else if (tVal === 'exogena_dian') {
            titleInput.value = 'Presentación de Información Exógena';
          } else {
            titleInput.value = '';
          }
        }
      });

      // Guardar formulario
      document.getElementById('btn-modal-save')?.addEventListener('click', async () => {
        const form = document.getElementById('form-agenda-nuevo') as HTMLFormElement;
        if (!form.reportValidity()) return;

        const valType = typeSelect.value;
        let valTitle = titleInput.value;
        const valDesc = (document.getElementById('new-agenda-desc') as HTMLTextAreaElement).value;
        const valAmount = parseFloat((document.getElementById('new-agenda-amount') as HTMLInputElement).value) || 0;
        const valDate = (document.getElementById('new-agenda-date') as HTMLInputElement).value;

        // Si es CXP, concatenar nombre del proveedor si está seleccionado
        if (valType === 'cxp_proveedor') {
          const supplierSelect = document.getElementById('new-agenda-supplier') as HTMLSelectElement;
          if (supplierSelect.value) {
            const supplierName = supplierSelect.options[supplierSelect.selectedIndex].text;
            valTitle = `CXP Proveedor: ${supplierName}`;
          } else {
            valTitle = valTitle || 'CXP Proveedor Sin Nombre';
          }
        }

        const roleChecks = document.querySelectorAll('input[name="assigned_roles"]:checked');
        const rolesList: string[] = [];
        roleChecks.forEach((chk: any) => rolesList.push(chk.value));

        try {
          const newRecord = await pb.create('agenda_vencimientos', {
            type: valType,
            title: valTitle,
            description: valDesc,
            due_date: valDate,
            amount: valAmount,
            status: 'pendiente',
            assigned_roles: rolesList
          });

          (window as any).showToast('Vencimiento programado exitosamente', 'success');
          (window as any).closeModal();

          // Agregar al estado local y re-filtrar
          records.push({
            id: newRecord.id,
            type: newRecord.type,
            title: newRecord.title,
            description: newRecord.description,
            due_date: newRecord.due_date,
            amount: newRecord.amount || 0,
            status: newRecord.status || 'pendiente',
            assigned_roles: newRecord.assigned_roles || []
          });
          
          // Reordenar por fecha
          records.sort((a, b) => a.due_date.localeCompare(b.due_date));
          updateDataView();
          if (typeof (window as any).checkUpcomingVencimientos === 'function') {
            (window as any).checkUpcomingVencimientos();
          }

        } catch (err) {
          console.error('Error al guardar recordatorio de pago:', err);
          (window as any).showToast('Error al programar el vencimiento', 'error');
        }
      });

      document.getElementById('btn-modal-cancel')?.addEventListener('click', () => {
        (window as any).closeModal();
      });
    }

    function openDianModal() {
      const bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:16px">
          <p style="font-size:13px; color:var(--text-muted)">
            El sistema consultará el NIT de la empresa y generará automáticamente los vencimientos oficiales de <strong>Retención en la Fuente</strong> (mensuales) y de <strong>IVA</strong> para el año 2026.
          </p>
          <div class="form-group">
            <label class="form-label">Periodicidad del IVA</label>
            <select id="dian-iva-periodicity" class="form-input">
              <option value="bimestral">IVA Bimestral (Actividades ordinarias / Régimen Común)</option>
              <option value="cuatrimestral">IVA Cuatrimestral (Pequeños contribuyentes / Ingresos bajos)</option>
            </select>
          </div>
        </div>
      `;

      const footerHtml = `
        <button class="btn btn-outline" id="btn-dian-cancel">Cancelar</button>
        <button class="btn btn-primary" id="btn-dian-confirm">
          <i class="fas fa-magic mr-1"></i> Generar Calendario
        </button>
      `;

      (window as any).openModal('Generar Calendario Tributario DIAN 2026', bodyHtml, footerHtml);

      document.getElementById('btn-dian-confirm')?.addEventListener('click', async () => {
        const periodicity = (document.getElementById('dian-iva-periodicity') as HTMLSelectElement).value;
        const confirmBtn = document.getElementById('btn-dian-confirm') as HTMLButtonElement;
        
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generando...';

        try {
          const res = await fetch(`${pb.baseUrl}/api/gravy/agenda/generar-calendario-dian`, {
            method: 'POST',
            headers: pb.headers(),
            body: JSON.stringify({ periodicity })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Error al generar el calendario tributario');

          (window as any).showToast(data.message, 'success');
          (window as any).closeModal();
          
          // Recargar el módulo entero para leer los nuevos registros
          (window as any).renderAgendaPagos(c);
        } catch (err: any) {
          console.error(err);
          (window as any).showToast(err.message || 'Error al generar el calendario', 'error');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="fas fa-magic mr-1"></i> Generar Calendario';
        }
      });

      document.getElementById('btn-dian-cancel')?.addEventListener('click', () => {
        (window as any).closeModal();
      });
    }

  } catch (err) {
    console.error('Error al iniciar el módulo de agenda de pagos:', err);
    c.innerHTML = `
      <div class="stat-card" style="margin:24px; padding:24px; text-align:center; color:#EF4444">
        <i class="fas fa-exclamation-triangle mr-2 text-2xl"></i>
        <span>Error al inicializar la Agenda de Pagos. Por favor, reinicia el servidor para aplicar las colecciones.</span>
      </div>
    `;
  }
};
