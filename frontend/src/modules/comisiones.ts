/**
 * GRAVY v2.0 — comisiones.ts
 * Módulo de comisiones a vendedores.
 * Permite parametrizar reglas generales o por producto, y calcular comisiones en base facturada o cobrada.
 */

'use strict';

interface CommissionSettings {
  basis: 'facturada' | 'cobrada';
  method: 'dinamico' | 'historico';
}

const SETTINGS_KEY = 'commission_settings_v1';

function defaultSettings(): CommissionSettings {
  return {
    basis: 'facturada',
    method: 'dinamico'
  };
}

async function getSettings(): Promise<CommissionSettings> {
  try {
    const raw = await (window as any).API.getSetting(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return JSON.parse(raw);
  } catch {
    return defaultSettings();
  }
}

async function saveSettings(cfg: CommissionSettings) {
  await (window as any).API.setSetting(SETTINGS_KEY, JSON.stringify(cfg));
  await (window as any).API.logAudit('CONFIG', 'CommissionSettings', null, 'Configuración de comisiones actualizada');
}

/* ═══════════════════════════════════════════════════════════
   RENDER PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export async function renderComisiones(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo de comisiones...</div>`;
  try {
    const [cfg, rules, sellers, products] = await Promise.all([
      getSettings(),
      (window as any).pb.listAll('commission_rules', { sort: 'name', expand: 'product_id,seller_id' }),
      (window as any).pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' }),
      (window as any).pb.listAll('products', { filter: 'active=true', sort: 'name' })
    ]);

    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Comisiones a Vendedores</h3>
          <p class="text-sm" style="color:#6B7280">Configuración de bases, reglas por producto o vendedor y reportes de comisiones acumuladas.</p>
        </div>
      </div>

      <!-- PESTAÑAS -->
      <div class="flex border-b mb-5" style="border-color:#E5E7EB">
        <button class="tab-btn active" id="tab-btn-report" onclick="window.switchCommTab('report')"><i class="fas fa-chart-line mr-2"></i>Reporte de Comisiones</button>
        <button class="tab-btn" id="tab-btn-rules" onclick="window.switchCommTab('rules')"><i class="fas fa-scale-balanced mr-2"></i>Reglas de Comisión</button>
        <button class="tab-btn" id="tab-btn-settings" onclick="window.switchCommTab('settings')"><i class="fas fa-gears mr-2"></i>Configuración Módulo</button>
      </div>

      <!-- SECCIÓN REPORTE -->
      <div id="comm-sect-report" class="comm-tab-panel">
        <div class="bg-white rounded-2xl border p-4 mb-5" style="border-color:#F0F0F0">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="form-group mb-0 flex-1 min-w-[200px]">
              <label class="form-label font-bold">Vendedor</label>
              <select id="comm-rep-seller" class="form-input">
                <option value="">— Todos los vendedores —</option>
                ${sellers.map((s: any) => `<option value="${s.id}">${(window as any).esc(s.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group mb-0 flex-1 min-w-[150px]">
              <label class="form-label font-bold">Desde</label>
              <input id="comm-rep-from" type="date" class="form-input" value="${(window as any).todayStr().slice(0, 8)}01">
            </div>
            <div class="form-group mb-0 flex-1 min-w-[150px]">
              <label class="form-label font-bold">Hasta</label>
              <input id="comm-rep-to" type="date" class="form-input" value="${(window as any).todayStr()}">
            </div>
            <div class="flex gap-2">
              <button class="btn btn-primary" id="btn-comm-run"><i class="fas fa-search"></i> Calcular</button>
              <button class="btn btn-outline" id="btn-comm-excel" disabled><i class="fas fa-file-excel"></i> Excel</button>
            </div>
          </div>
        </div>

        <!-- KPIs DEL REPORTE -->
        <div id="comm-rep-kpis" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5" style="display:none"></div>

        <!-- RESULTADOS DEL REPORTE -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
          <div class="overflow-x-auto">
            <table class="data-table" id="comm-table-results">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Fecha</th>
                  <th>Vendedor</th>
                  <th>Cliente</th>
                  <th class="text-right">Subtotal</th>
                  <th class="text-right">Venta Aplicada</th>
                  <th class="text-right">% Com.</th>
                  <th class="text-right">Comisión</th>
                  <th>Método Pago</th>
                  <th>Recaudo %</th>
                </tr>
              </thead>
              <tbody id="comm-tbody-results">
                <tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-circle-info mr-2"></i>Selecciona filtros y haz clic en Calcular.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECCIÓN REGLAS -->
      <div id="comm-sect-rules" class="comm-tab-panel" style="display:none">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-bold text-gray-800"><i class="fas fa-list mr-1"></i> Reglas vigentes</h4>
          <button class="btn btn-primary btn-sm" id="btn-new-rule"><i class="fas fa-plus"></i> Nueva Regla</button>
        </div>
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre Regla</th>
                <th>Tipo Aplicación</th>
                <th>Vendedor Restricción</th>
                <th>Producto Restricción</th>
                <th class="text-right">Porcentaje (%)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${rules.length ? rules.map((r: any) => `
                <tr>
                  <td class="font-semibold">${(window as any).esc(r.name)}</td>
                  <td>${r.type === 'total_sale' ? '<span class="badge badge-blue">Total Factura</span>' : '<span class="badge badge-orange">Por Producto</span>'}</td>
                  <td>${r.expand?.seller_id ? (window as any).esc(r.expand.seller_id.name) : '<span class="text-gray-400">— Global —</span>'}</td>
                  <td>${r.expand?.product_id ? `[${(window as any).esc(r.expand.product_id.code)}] ${(window as any).esc(r.expand.product_id.name)}` : '<span class="text-gray-400">— Todos —</span>'}</td>
                  <td class="text-right font-bold text-blue-700">${r.rate}%</td>
                  <td>${r.active ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>'}</td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-outline btn-sm" onclick="window.editCommRule('${r.id}')"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-danger btn-sm" onclick="window.toggleCommRule('${r.id}', ${r.active ? 'false' : 'true'})">
                        <i class="fas ${r.active ? 'fa-ban' : 'fa-check'}"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay reglas de comisión configuradas.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECCIÓN CONFIGURACIÓN -->
      <div id="comm-sect-settings" class="comm-tab-panel" style="display:none">
        <div class="bg-white rounded-2xl border p-6 max-w-2xl" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4 text-gray-800"><i class="fas fa-gears mr-2 text-blue-700"></i> Parámetros de Operación</h4>
          
          <div class="form-group">
            <label class="form-label font-bold">1. Base de Cálculo (Facturado vs Cobrado)</label>
            <p class="text-xs text-gray-500 mb-2">Determina el momento en que se genera la comisión contable.</p>
            <select id="comm-cfg-basis" class="form-input">
              <option value="facturada" ${cfg.basis === 'facturada' ? 'selected' : ''}>Venta Facturada (Al registrar/contabilizar factura)</option>
              <option value="cobrada" ${cfg.basis === 'cobrada' ? 'selected' : ''}>Venta Cobrada (Proporcional a los recaudos de cartera)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">2. Método de Cálculo (Dinámico vs Histórico)</label>
            <p class="text-xs text-gray-500 mb-2">Determina cómo se valoran las tasas de comisión en el tiempo.</p>
            <select id="comm-cfg-method" class="form-input">
              <option value="dinamico" ${cfg.method === 'dinamico' ? 'selected' : ''}>Cálculo Dinámico (Aplica reglas actuales retrospectivamente)</option>
              <option value="historico" ${cfg.method === 'historico' ? 'selected' : ''}>Histórico (Congela el porcentaje y valor en la factura al emitirse)</option>
            </select>
          </div>

          <div class="flex justify-end mt-6">
            <button class="btn btn-primary" id="btn-save-comm-settings"><i class="fas fa-floppy-disk"></i> Guardar Configuración</button>
          </div>
        </div>
      </div>
    `;

    // Asignar eventos
    document.getElementById('btn-save-comm-settings')?.addEventListener('click', async () => {
      const basis = (document.getElementById('comm-cfg-basis') as HTMLSelectElement).value as any;
      const method = (document.getElementById('comm-cfg-method') as HTMLSelectElement).value as any;
      const saveBtn = document.getElementById('btn-save-comm-settings') as HTMLButtonElement;
      
      saveBtn.disabled = true;
      try {
        await saveSettings({ basis, method });
        (window as any).showToast('Parámetros globales guardados correctamente.', 'success');
        renderComisiones(container);
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
        saveBtn.disabled = false;
      }
    });

    document.getElementById('btn-new-rule')?.addEventListener('click', () => window.openCommRuleForm(null, () => renderComisiones(container), sellers, products));
    document.getElementById('btn-comm-run')?.addEventListener('click', () => window.runCommissionsReport(cfg, rules));

    const tbl = document.getElementById('comm-table-results') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

    // Exponer ayudantes de edición
    (window as any).editCommRule = (id: string) => {
      const match = rules.find((r: any) => r.id === id);
      if (match) window.openCommRuleForm(match, () => renderComisiones(container), sellers, products);
    };

    (window as any).toggleCommRule = async (id: string, active: boolean) => {
      try {
        await (window as any).pb.update('commission_rules', id, { active });
        (window as any).showToast('Estado de regla actualizado.', 'success');
        renderComisiones(container);
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      }
    };

  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

/* ═══════════════════════════════════════════════════════════
   CAMBIO DE PESTAÑAS
   ═══════════════════════════════════════════════════════════ */
(window as any).switchCommTab = function(tabName: 'report' | 'rules' | 'settings') {
  document.querySelectorAll('.comm-tab-panel').forEach((el: any) => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach((el: any) => el.classList.remove('active'));

  const activePanel = document.getElementById(`comm-sect-${tabName}`);
  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activePanel) activePanel.style.display = 'block';
  if (activeBtn) activeBtn.classList.add('active');
};

/* ═══════════════════════════════════════════════════════════
   FORMULARIO DE REGLAS (MODAL)
   ═══════════════════════════════════════════════════════════ */
(window as any).openCommRuleForm = function(row: any = null, onSaved: any, sellers: any[], products: any[]) {
  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="form-group">
        <label class="form-label font-bold">Nombre de la Regla <span style="color:#EF4444">*</span></label>
        <input id="rule-name" class="form-input" placeholder="Ej: General 5%, Zapatos 10%" value="${(window as any).esc(row?.name || '')}">
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label font-bold">Tipo de Regla <span style="color:#EF4444">*</span></label>
          <select id="rule-type" class="form-input" onchange="window.onRuleTypeChange(this.value)">
            <option value="total_sale" ${row?.type === 'total_sale' ? 'selected' : ''}>Total de la Venta</option>
            <option value="per_product" ${row?.type === 'per_product' ? 'selected' : ''}>Por Producto Específico</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Porcentaje de Comisión (%) <span style="color:#EF4444">*</span></label>
          <input id="rule-rate" type="number" min="0" max="100" step="0.01" class="form-input" placeholder="Ej: 5" value="${row?.rate ?? ''}">
        </div>
      </div>

      <div class="form-group" id="rule-product-wrap" style="${row?.type === 'per_product' ? '' : 'display:none'}">
        <label class="form-label font-bold">Producto Asociado <span style="color:#EF4444">*</span></label>
        <select id="rule-product" class="form-input">
          <option value="">— Seleccionar Producto —</option>
          ${products.map(p => `<option value="${p.id}" ${row?.product_id === p.id ? 'selected' : ''}>[${(window as any).esc(p.code)}] ${(window as any).esc(p.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Vendedor Restricción <span class="text-gray-400 font-normal">(Vacío para aplicar globalmente)</span></label>
        <select id="rule-seller" class="form-input">
          <option value="">— Todos los vendedores (Global) —</option>
          ${sellers.map(s => `<option value="${s.id}" ${row?.seller_id === s.id ? 'selected' : ''}>${(window as any).esc(s.name)}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label font-bold">Estado</label>
        <select id="rule-active" class="form-input">
          <option value="1" ${row?.active !== false ? 'selected' : ''}>Activa</option>
          <option value="0" ${row?.active === false ? 'selected' : ''}>Inactiva</option>
        </select>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-rule"><i class="fas fa-floppy-disk"></i> Guardar Regla</button>
  `;

  (window as any).openModal(row ? 'Editar Regla de Comisión' : 'Nueva Regla de Comisión', formHtml, footer);

  (window as any).onRuleTypeChange = (val: string) => {
    const wrap = document.getElementById('rule-product-wrap');
    if (wrap) wrap.style.display = val === 'per_product' ? 'block' : 'none';
  };

  document.getElementById('btn-save-rule')?.addEventListener('click', async () => {
    const name = (document.getElementById('rule-name') as HTMLInputElement).value.trim();
    const type = (document.getElementById('rule-type') as HTMLSelectElement).value;
    const rate = parseFloat((document.getElementById('rule-rate') as HTMLInputElement).value);
    const product_id = (document.getElementById('rule-product') as HTMLSelectElement).value;
    const seller_id = (document.getElementById('rule-seller') as HTMLSelectElement).value || null;
    const active = (document.getElementById('rule-active') as HTMLSelectElement).value === '1';

    if (!name || isNaN(rate)) {
      (window as any).showToast('Nombre y porcentaje son obligatorios.', 'warning');
      return;
    }
    if (type === 'per_product' && !product_id) {
      (window as any).showToast('Selecciona un producto para la regla.', 'warning');
      return;
    }

    const payload = {
      name,
      type,
      rate,
      product_id: type === 'per_product' ? product_id : null,
      seller_id,
      active
    };

    const saveBtn = document.getElementById('btn-save-rule') as HTMLButtonElement;
    saveBtn.disabled = true;

    try {
      if (row?.id) {
        await (window as any).pb.update('commission_rules', row.id, payload);
        (window as any).showToast('Regla de comisión modificada.', 'success');
      } else {
        await (window as any).pb.create('commission_rules', payload);
        (window as any).showToast('Regla de comisión creada.', 'success');
      }
      (window as any).closeModal();
      onSaved();
    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
      saveBtn.disabled = false;
    }
  });
};

/* ═══════════════════════════════════════════════════════════
   CÁLCULO Y REPORTE DE COMISIONES
   ═══════════════════════════════════════════════════════════ */
let LATEST_REPORT_DATA: any[] = [];

(window as any).runCommissionsReport = async function(cfg: CommissionSettings, rules: any[]) {
  const sellerId = (document.getElementById('comm-rep-seller') as HTMLSelectElement).value;
  const fromDate = (document.getElementById('comm-rep-from') as HTMLInputElement).value;
  const toDate = (document.getElementById('comm-rep-to') as HTMLInputElement).value;
  const runBtn = document.getElementById('btn-comm-run') as HTMLButtonElement;
  const tbody = document.getElementById('comm-tbody-results');
  
  if (!fromDate || !toDate) {
    (window as any).showToast('Define rango de fechas.', 'warning');
    return;
  }

  runBtn.disabled = true;
  if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando facturas y cobros...</td></tr>`;

  try {
    // 1. Filtrar facturas
    let invFilter = `date>="${fromDate}" && date<="${toDate}" && status="posted"`;
    if (sellerId) {
      invFilter += ` && seller_id="${(window as any).pb.escapeFilterValue(sellerId)}"`;
    }

    const invoices = await (window as any).pb.listAll('invoices', {
      filter: invFilter,
      expand: 'customer_id,seller_id',
      sort: 'date,number'
    });

    if (!invoices.length) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF">No se encontraron ventas para los filtros seleccionados.</td></tr>`;
      document.getElementById('comm-rep-kpis')!.style.display = 'none';
      (document.getElementById('btn-comm-excel') as HTMLButtonElement).disabled = true;
      runBtn.disabled = false;
      return;
    }

    // 2. Cargar todas las líneas de factura para el lote
    const invIds = invoices.map((i: any) => i.id);
    const filterIds = invIds.map((id: string) => `invoice_id="${id}"`).join(' || ');
    const allLines = await (window as any).pb.listAll('invoice_lines', {
      filter: `(${filterIds})`
    });

    const linesByInvoice: Record<string, any[]> = {};
    allLines.forEach((l: any) => {
      if (!linesByInvoice[l.invoice_id]) linesByInvoice[l.invoice_id] = [];
      linesByInvoice[l.invoice_id].push(l);
    });

    // 3. Cargar recaudos asociados para facturas a crédito si base es "cobrada"
    const creditsMap: Record<string, number> = {};
    const creditInvoices = invoices.filter((i: any) => i.payment_method === 'CREDITO');
    
    if (cfg.basis === 'cobrada' && creditInvoices.length > 0) {
      // Buscar movimientos contables que crucen con los números de estas facturas
      const refFilter = creditInvoices.map((i: any) => `cross_doc_ref="${(window as any).pb.escapeFilterValue(i.number)}"`).join(' || ');
      const txLines = await (window as any).pb.listAll('tx_lines', {
        filter: `(${refFilter}) && tx_id.status="active"`,
        expand: 'account_id'
      });

      txLines.forEach((l: any) => {
        // En cuentas de tipo 13 (Clientes), los créditos disminuyen la deuda (pagos recibidos)
        const isClientAcc = l.expand?.account_id?.code?.startsWith('13');
        if (isClientAcc && l.credit > 0) {
          const ref = String(l.cross_doc_ref || '').trim();
          creditsMap[ref] = (creditsMap[ref] || 0) + Number(l.credit);
        }
      });
    }

    // 4. Procesar y calcular comisiones por factura
    const reportRows: any[] = [];
    let sumVentasHdr = 0;
    let sumVentasReal = 0;
    let sumComisionesTotal = 0;

    for (const inv of invoices) {
      const lines = linesByInvoice[inv.id] || [];
      const subtotalVal = inv.subtotal || lines.reduce((s, l) => s + (l.subtotal || 0), 0);

      // Calcular fracción cobrada
      let collectedFraction = 1.0;
      if (inv.payment_method === 'CREDITO') {
        const totalCredited = creditsMap[inv.number] || 0;
        const totalInv = inv.payable_total ?? inv.total ?? 1;
        collectedFraction = Math.min(1.0, Math.max(0.0, totalCredited / totalInv));
      }

      // Calcular comisión
      let baseCommission = 0;
      let calculatedRate = 0;

      if (cfg.method === 'historico' && inv.commission_amount !== undefined && inv.commission_amount !== null && inv.commission_amount > 0) {
        baseCommission = Number(inv.commission_amount);
        calculatedRate = Number(inv.commission_rate ?? 0);
      } else {
        // Cálculo Dinámico o Fallback
        for (const line of lines) {
          // Buscar regla aplicable
          let matchedRule = null;
          // Orden de prioridad:
          // 1. Vendedor + Producto específico
          // 2. Producto específico (Global)
          // 3. Vendedor (Total Factura)
          // 4. Global (Total Factura)
          matchedRule = rules.find((r: any) => r.active && r.seller_id === inv.seller_id && r.product_id === line.product_id) ||
                        rules.find((r: any) => r.active && !r.seller_id && r.product_id === line.product_id) ||
                        rules.find((r: any) => r.active && r.seller_id === inv.seller_id && r.type === 'total_sale') ||
                        rules.find((r: any) => r.active && !r.seller_id && r.type === 'total_sale');

          if (matchedRule) {
            baseCommission += (matchedRule.rate / 100) * (line.subtotal || 0);
          }
        }
        calculatedRate = subtotalVal > 0 ? (baseCommission / subtotalVal) * 100 : 0;
      }

      const commissionVal = baseCommission;
      let appliedVenta = subtotalVal;
      let finalCommission = commissionVal;

      if (cfg.basis === 'cobrada') {
        appliedVenta = subtotalVal * collectedFraction;
        finalCommission = commissionVal * collectedFraction;
      }

      sumVentasHdr += subtotalVal;
      sumVentasReal += appliedVenta;
      sumComisionesTotal += finalCommission;

      reportRows.push({
        id: inv.id,
        number: inv.number,
        date: inv.date,
        seller: inv.expand?.seller_id?.name || '<span class="text-gray-400">Sin asignar</span>',
        sellerName: inv.expand?.seller_id?.name || 'Sin asignar',
        customer: inv.expand?.customer_id?.name || 'Cliente',
        subtotal: subtotalVal,
        appliedVenta: appliedVenta,
        rate: calculatedRate.toFixed(2),
        commission: finalCommission,
        paymentMethod: inv.payment_method,
        collectedPct: Math.round(collectedFraction * 100)
      });
    }

    LATEST_REPORT_DATA = reportRows;

    // 5. Render KPIs
    const kpiWrap = document.getElementById('comm-rep-kpis');
    if (kpiWrap) {
      kpiWrap.style.display = 'grid';
      kpiWrap.innerHTML = `
        ${commKpi('Venta Facturada (Subtotal)', (window as any).fmt(sumVentasHdr), 'fas fa-file-invoice', '#1A4B8C', '#EEF4FF')}
        ${commKpi('Base Real (Venta ' + (cfg.basis === 'cobrada' ? 'Cobrada' : 'Facturada') + ')', (window as any).fmt(sumVentasReal), 'fas fa-sack-dollar', '#059669', '#ECFDF5')}
        ${commKpi('Comisiones Acumuladas', (window as any).fmt(sumComisionesTotal), 'fas fa-percent', '#7C3AED', '#F5F3FF')}
        ${commKpi('Ventas Procesadas', invoices.length, 'fas fa-list-check', '#C46516', '#FFF8F0')}
      `;
    }

    // 6. Render Table rows
    if (tbody) {
      tbody.innerHTML = reportRows.map((r: any) => `
        <tr>
          <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(r.number)}</span></td>
          <td>${r.date}</td>
          <td>${r.seller}</td>
          <td class="font-medium">${(window as any).esc(r.customer)}</td>
          <td class="text-right">${(window as any).fmt(r.subtotal)}</td>
          <td class="text-right font-medium">${(window as any).fmt(r.appliedVenta)}</td>
          <td class="text-right font-bold text-blue-600">${r.rate}%</td>
          <td class="text-right font-bold text-green-700">${(window as any).fmt(r.commission)}</td>
          <td><span class="badge ${r.paymentMethod === 'CREDITO' ? 'badge-orange' : 'badge-green'}">${r.paymentMethod}</span></td>
          <td>
            <div class="flex items-center gap-1">
              <span class="font-semibold text-xs">${r.collectedPct}%</span>
              <div style="flex:1;height:4px;background:#E5E7EB;border-radius:2px;min-width:30px">
                <div style="height:100%;width:${r.collectedPct}%;background:${r.collectedPct === 100 ? '#10B981' : '#F59E0B'};border-radius:2px"></div>
              </div>
            </div>
          </td>
        </tr>
      `).join('');
      const tbl = document.getElementById('comm-table-results') as HTMLTableElement;
      if (tbl) (window as any).reapplyTableSort(tbl);
    }

    (document.getElementById('btn-comm-excel') as HTMLButtonElement).disabled = false;
    (window as any).showToast('Cálculo de comisiones completado con éxito.', 'success');

  } catch (err: any) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center py-10" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</td></tr>`;
    (window as any).showToast('Fallo al calcular comisiones: ' + err.message, 'error');
  } finally {
    runBtn.disabled = false;
  }
};

/* ═══════════════════════════════════════════════════════════
   EXPORTAR REPORTE A EXCEL
   ═══════════════════════════════════════════════════════════ */
document.getElementById('btn-comm-excel')?.addEventListener('click', () => {
  if (!LATEST_REPORT_DATA.length) return;
  const headers = [
    { label: 'Factura', key: 'number' },
    { label: 'Fecha', key: 'date' },
    { label: 'Vendedor', key: 'sellerName' },
    { label: 'Cliente', key: 'customer' },
    { label: 'Subtotal COP', key: 'subtotal' },
    { label: 'Venta Base COP', key: 'appliedVenta' },
    { label: 'Tarifa %', key: 'rate' },
    { label: 'Comisión COP', key: 'commission' },
    { label: 'Forma Pago', key: 'paymentMethod' },
    { label: 'Cobro %', key: 'collectedPct' }
  ];
  (window as any).exportToExcel(LATEST_REPORT_DATA, headers, 'Reporte_Comisiones');
});

/* ═══════════════════════════════════════════════════════════
   KPI CARD BUILDER
   ═══════════════════════════════════════════════════════════ */
function commKpi(title: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card" style="border-left: 4px solid ${color}">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">${(window as any).esc(title)}</p>
          <h3 class="text-lg font-extrabold mt-1 text-gray-900">${(window as any).esc(String(value))}</h3>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-base" style="background:${bg};color:${color}">
          <i class="${icon}"></i>
        </div>
      </div>
    </div>
  `;
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderComisiones = renderComisiones;
