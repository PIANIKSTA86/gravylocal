/**
 * GRAVY v2.0 — agenda-pagos.ts
 * Programación de pagos, vencimientos CXP e impuestos DIAN con proyecciones.
 */
'use strict';

interface AgendaRecord {
  id: string;
  type: 'cxp_proveedor' | 'impuesto_dian_iva' | 'impuesto_dian_retencion' | 'exogena_dian' | 'otro';
  title: string;
  description?: string;
  due_date: string;
  amount: number;
  status: 'pendiente' | 'programado' | 'pagado' | 'vencido';
  assigned_roles?: string[];
  created?: string;
}

(window as any).renderAgendaPagos = async function (c: HTMLElement) {
  c.innerHTML = `
    <div class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-spinner fa-spin mr-2"></i>Cargando agenda de pagos...
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

    let state = {
      dateFrom: fmtDate(startOfMonth),
      dateTo: fmtDate(endOfMonth),
      type: 'TODOS',
      status: 'TODOS',
      chartInstance: null as any
    };

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
                    <option value="cxp_proveedor" ${state.type === 'cxp_proveedor' ? 'selected' : ''}>CXP Proveedores</option>
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
                <button id="btn-agenda-dian" class="btn btn-outline" style="border-color:var(--accent-violet-strong); color:var(--accent-violet-strong)">
                  <i class="fas fa-calendar-plus mr-1"></i> Calendario DIAN 2026
                </button>
                <button id="btn-agenda-nuevo" class="btn btn-primary">
                  <i class="fas fa-plus mr-1"></i> Programar Pago
                </button>
              </div>
            </div>
          </div>

          <!-- Tarjetas KPI -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px">
            <div class="stat-card blue">
              <div style="color:var(--text-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Total Proyectado</div>
              <div id="kpi-total-proyectado" style="font-size:24px; font-weight:800; color:var(--text-strong); margin-top:8px">$0</div>
              <p style="color:var(--text-muted); font-size:11px; margin-top:4px">Pagos pendientes + programados</p>
            </div>
            <div class="stat-card orange">
              <div style="color:var(--text-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">CXP Proveedores</div>
              <div id="kpi-total-cxp" style="font-size:24px; font-weight:800; color:var(--text-strong); margin-top:8px">$0</div>
              <p style="color:var(--text-muted); font-size:11px; margin-top:4px">Cuentas por pagar pendientes</p>
            </div>
            <div class="stat-card green">
              <div style="color:var(--text-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Impuestos & DIAN</div>
              <div id="kpi-total-dian" style="font-size:24px; font-weight:800; color:var(--text-strong); margin-top:8px">$0</div>
              <p style="color:var(--text-muted); font-size:11px; margin-top:4px">Compromisos fiscales</p>
            </div>
            <div class="stat-card red">
              <div style="color:var(--text-muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px">Total Vencido</div>
              <div id="kpi-total-vencido" style="font-size:24px; font-weight:800; color:#EF4444; margin-top:8px">$0</div>
              <p style="color:#EF4444; font-size:11px; margin-top:4px">Pagos fuera de plazo</p>
            </div>
          </div>

          <!-- Grid principal: Gráfico y Lista -->
          <div style="display:grid; grid-template-columns: 1fr; gap:24px;">
            
            <!-- Gráfica de proyección -->
            <div class="stat-card" style="padding:24px;">
              <h3 class="text-sm font-bold mb-4" style="color:var(--text-strong); text-transform:uppercase; letter-spacing:.5px">
                <i class="fas fa-chart-line mr-2" style="color:var(--accent-violet)"></i>Proyección Flujo de Caja por Día
              </h3>
              <div style="height: 250px; position: relative;">
                <canvas id="agenda-projection-chart"></canvas>
              </div>
            </div>

            <!-- Tabla/Lista de Agenda -->
            <div class="stat-card" style="padding:24px">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
                <h3 class="text-sm font-bold" style="color:var(--text-strong); text-transform:uppercase; letter-spacing:.5px">
                  <i class="fas fa-calendar-alt mr-2" style="color:var(--accent-cyan-strong)"></i>Detalle de Vencimientos
                </h3>
                <span id="agenda-count-badge" class="badge" style="background:var(--accent-soft); color:var(--accent-cyan-strong); font-size:12px; font-weight:700">0 Items</span>
              </div>
              <div style="overflow-x:auto">
                <table class="so-lines-tbl w-full text-left" style="border-collapse:collapse">
                  <thead>
                    <tr style="border-bottom:2px solid var(--border-soft); color:var(--text-muted)">
                      <th style="padding:12px 8px">Tipo</th>
                      <th style="padding:12px 8px">Vencimiento</th>
                      <th style="padding:12px 8px">Concepto</th>
                      <th style="padding:12px 8px">Monto</th>
                      <th style="padding:12px 8px">Asignado a</th>
                      <th style="padding:12px 8px">Estado</th>
                      <th style="padding:12px 8px; text-align:right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="agenda-items-tbody">
                    <!-- Dinámico -->
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      `;

      // Registrar eventos
      document.getElementById('agenda-filter-from')?.addEventListener('change', (e: any) => {
        state.dateFrom = e.target.value;
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
      document.getElementById('btn-agenda-nuevo')?.addEventListener('click', () => {
        openCreateModal();
      });
      document.getElementById('btn-agenda-dian')?.addEventListener('click', () => {
        openDianModal();
      });

      // Primer render de datos
      updateDataView();
    }

    function updateDataView() {
      // 1. Filtrar registros por rango y opciones
      const filtered = records.filter(r => {
        const inDateRange = r.due_date >= state.dateFrom && r.due_date <= state.dateTo;
        const matchesType = state.type === 'TODOS' || r.type === state.type;
        const matchesStatus = state.status === 'TODOS' || r.status === state.status;
        return inDateRange && matchesType && matchesStatus;
      });

      // 2. Calcular KPIs
      let totalProyectado = 0;
      let totalCxp = 0;
      let totalDian = 0;
      let totalVencido = 0;

      filtered.forEach(r => {
        const isTax = r.type === 'impuesto_dian_iva' || r.type === 'impuesto_dian_retencion' || r.type === 'exogena_dian';
        
        // Sumar a total vencido si venció y no está pagado
        if (r.status === 'vencido') {
          totalVencido += r.amount;
        }

        // Proyectado = Pendientes + Programados + Vencidos (lo que se debe)
        if (r.status !== 'pagado') {
          totalProyectado += r.amount;
          if (r.type === 'cxp_proveedor') {
            totalCxp += r.amount;
          } else if (isTax) {
            totalDian += r.amount;
          }
        }
      });

      // Actualizar valores en UI
      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);
      
      const elProyectado = document.getElementById('kpi-total-proyectado');
      const elCxp = document.getElementById('kpi-total-cxp');
      const elDian = document.getElementById('kpi-total-dian');
      const elVencido = document.getElementById('kpi-total-vencido');
      const elBadge = document.getElementById('agenda-count-badge');

      if (elProyectado) elProyectado.innerText = formatCOP(totalProyectado);
      if (elCxp) elCxp.innerText = formatCOP(totalCxp);
      if (elDian) elDian.innerText = formatCOP(totalDian);
      if (elVencido) elVencido.innerText = formatCOP(totalVencido);
      if (elBadge) elBadge.innerText = `${filtered.length} Vencimientos`;

      // 3. Renderizar Tabla
      renderTable(filtered);

      // 4. Renderizar Gráfico
      renderChart(filtered);
    }

    function renderTable(items: AgendaRecord[]) {
      const tbody = document.getElementById('agenda-items-tbody');
      if (!tbody) return;

      if (!items.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="p-8 text-center text-gray-400" style="font-size:13px">
              <i class="fas fa-calendar-check mr-2 text-lg"></i>No hay vencimientos programados en este rango.
            </td>
          </tr>
        `;
        return;
      }

      const typeLabels: Record<string, string> = {
        cxp_proveedor: 'CXP Proveedor',
        impuesto_dian_iva: 'IVA (DIAN)',
        impuesto_dian_retencion: 'Rete. (DIAN)',
        exogena_dian: 'Exógena (DIAN)',
        otro: 'Otro'
      };

      const typeIcons: Record<string, string> = {
        cxp_proveedor: 'fa-truck-field',
        impuesto_dian_iva: 'fa-percent',
        impuesto_dian_retencion: 'fa-building-columns',
        exogena_dian: 'fa-file-invoice-dollar',
        otro: 'fa-info-circle'
      };

      const typeColors: Record<string, string> = {
        cxp_proveedor: '#F97316', // Orange
        impuesto_dian_iva: '#A855F7', // Purple
        impuesto_dian_retencion: '#6366F1', // Indigo
        exogena_dian: '#EF4444', // Red
        otro: '#6B7280' // Gray
      };

      const statusLabels: Record<string, string> = {
        pendiente: 'Pendiente',
        programado: 'Programado',
        pagado: 'Pagado',
        vencido: 'Vencido'
      };

      const statusBadges: Record<string, string> = {
        pendiente: 'background:#FEF3C7; color:#D97706; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:700',
        programado: 'background:#DBEAFE; color:#2563EB; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:700',
        pagado: 'background:#D1FAE5; color:#059669; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:700',
        vencido: 'background:#FEE2E2; color:#DC2626; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:700'
      };

      const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

      tbody.innerHTML = items.map(item => {
        const rolesString = item.assigned_roles && item.assigned_roles.length > 0 
          ? item.assigned_roles.map(r => r.toUpperCase()).join(', ') 
          : 'TODOS';

        return `
          <tr style="border-bottom: 1px solid var(--border-soft); transition: background .15s" class="hover:bg-slate-50">
            <td style="padding:14px 8px; font-size:13px; font-weight:600; color:var(--text-strong)">
              <div style="display:flex; align-items:center; gap:8px">
                <div style="width:28px; height:28px; border-radius:8px; background:rgba(15,23,42,0.04); display:flex; align-items:center; justify-content:center; color:${typeColors[item.type]}">
                  <i class="fas ${typeIcons[item.type]}"></i>
                </div>
                <span>${typeLabels[item.type]}</span>
              </div>
            </td>
            <td style="padding:14px 8px; font-size:13px; font-weight:500; color:var(--text-muted)">
              <div style="display:flex; flex-direction:column">
                <strong>${item.due_date}</strong>
              </div>
            </td>
            <td style="padding:14px 8px; font-size:13px; color:var(--text-strong)">
              <div style="font-weight:600">${item.title}</div>
              <div style="font-size:11px; color:var(--text-muted)">${item.description || ''}</div>
            </td>
            <td style="padding:14px 8px; font-size:13px; font-weight:700; color:var(--text-strong)">
              ${formatCOP(item.amount)}
            </td>
            <td style="padding:14px 8px; font-size:12px; font-weight:600; color:var(--text-muted)">
              <span class="badge" style="background:#F3F4F6; color:#4B5563; font-size:11px">${rolesString}</span>
            </td>
            <td style="padding:14px 8px; font-size:13px">
              <span style="${statusBadges[item.status]}">${statusLabels[item.status]}</span>
            </td>
            <td style="padding:14px 8px; text-align:right">
              <div style="display:flex; gap:6px; justify-content:flex-end">
                ${item.status !== 'pagado' ? `
                  <button class="btn btn-sm btn-outline text-emerald-600 border-emerald-300 btn-mark-paid" data-id="${item.id}" title="Marcar como Pagado">
                    <i class="fas fa-check"></i>
                  </button>
                ` : ''}
                ${item.status === 'pendiente' || item.status === 'vencido' ? `
                  <button class="btn btn-sm btn-outline text-blue-600 border-blue-300 btn-mark-sched" data-id="${item.id}" title="Programar Pago">
                    <i class="fas fa-clock"></i>
                  </button>
                ` : ''}
                <button class="btn btn-sm btn-outline text-red-600 border-red-300 btn-delete-item" data-id="${item.id}" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Asociar eventos de los botones
      tbody.querySelectorAll('.btn-mark-paid').forEach(btn => {
        btn.addEventListener('click', async (e: any) => {
          const id = e.currentTarget.dataset.id;
          await updateStatus(id, 'pagado');
        });
      });

      tbody.querySelectorAll('.btn-mark-sched').forEach(btn => {
        btn.addEventListener('click', async (e: any) => {
          const id = e.currentTarget.dataset.id;
          await updateStatus(id, 'programado');
        });
      });

      tbody.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', async (e: any) => {
          const id = e.currentTarget.dataset.id;
          if (confirm('¿Estás seguro de que deseas eliminar este vencimiento de la agenda?')) {
            await deleteItem(id);
          }
        });
      });
    }

    async function updateStatus(id: string, newStatus: string) {
      try {
        await pb.update('agenda_vencimientos', id, { status: newStatus });
        (window as any).showToast(`Pago marcado como ${newStatus}`, 'success');
        
        // Actualizar datos locales
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
          records[index].status = newStatus as any;
        }
        updateDataView();
        if (typeof (window as any).checkUpcomingVencimientos === 'function') {
          (window as any).checkUpcomingVencimientos();
        }
      } catch (err) {
        console.error('Error al actualizar estado del vencimiento:', err);
        (window as any).showToast('Error al actualizar el estado del pago', 'error');
      }
    }

    async function deleteItem(id: string) {
      try {
        await pb.delete('agenda_vencimientos', id);
        (window as any).showToast('Vencimiento eliminado de la agenda', 'success');
        
        // Remover de datos locales
        records = records.filter(r => r.id !== id);
        updateDataView();
        if (typeof (window as any).checkUpcomingVencimientos === 'function') {
          (window as any).checkUpcomingVencimientos();
        }
      } catch (err) {
        console.error('Error al eliminar vencimiento:', err);
        (window as any).showToast('Error al eliminar el vencimiento', 'error');
      }
    }

    function renderChart(items: AgendaRecord[]) {
      const canvas = document.getElementById('agenda-projection-chart') as HTMLCanvasElement;
      if (!canvas) return;

      // Destruir instancia previa de Chart
      if (state.chartInstance) {
        state.chartInstance.destroy();
      }

      // Agrupar montos pendientes y programados por fecha
      const dailyMap: Record<string, number> = {};
      
      // Llenar el mapa con todas las fechas del rango actual
      const current = new Date(state.dateFrom);
      const limit = new Date(state.dateTo);
      while (current <= limit) {
        const fStr = fmtDate(current);
        dailyMap[fStr] = 0;
        current.setDate(current.getDate() + 1);
      }

      // Sumar montos por fecha para compromisos no pagados
      items.forEach(r => {
        if (r.status !== 'pagado' && dailyMap[r.due_date] !== undefined) {
          dailyMap[r.due_date] += r.amount;
        }
      });

      const labels = Object.keys(dailyMap).sort();
      const dataValues = labels.map(l => dailyMap[l]);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const chartGradient = ctx.createLinearGradient(0, 0, 0, 200);
      chartGradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      chartGradient.addColorStop(1, 'rgba(99, 102, 241, 0.00)');

      const ChartConstructor = (window as any).Chart;
      if (!ChartConstructor) return;

      state.chartInstance = new ChartConstructor(canvas, {
        type: 'bar',
        data: {
          labels: labels.map(l => {
            const parts = l.split('-');
            return `${parts[2]}/${parts[1]}`; // DD/MM format
          }),
          datasets: [{
            label: 'Proyección Pagos ($)',
            data: dataValues,
            borderColor: '#6366F1',
            backgroundColor: '#818CF8',
            borderRadius: 6,
            borderWidth: 0,
            barThickness: 16
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (tooltipItem: any) {
                  return ` Por pagar: $ ${tooltipItem.raw.toLocaleString('es-CO')}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                callback: function (val: any) {
                  return `$ ${val.toLocaleString('es-CO')}`;
                }
              }
            }
          }
        }
      });
    }

    function openCreateModal() {
      const thirdOptions = suppliers.map((s: any) => `
        <option value="${s.id}">${s.name} (${s.nit})</option>
      `).join('');

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
              <input type="date" id="new-agenda-date" class="form-input" required>
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
