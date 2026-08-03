/**
 * GRAVY v2.0 — compra-sugerida.ts
 * Reporte y generación inteligente de compras sugeridas.
 */
'use strict';

(window as any).renderCompraSugerida = async function(c: HTMLElement) {
  c.innerHTML = `
    <div class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-spinner fa-spin mr-2"></i>Cargando análisis de compras...
    </div>
  `;

  try {
    // 1. Cargar datos básicos de catálogos
    const [products, warehouses, suppliers, txTypes] = await Promise.all([
      (window as any).API.getProducts({ activeOnly: true }),
      (window as any).API.getWarehouses(false),
      (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
      (window as any).pb.listAll('transaction_types', { filter: 'active=true' })
    ]);

    // Filtrar solo productos tipo BIEN (los servicios no tienen stock ni se compran físicamente)
    const physicalProducts = products.filter((p: any) => p.type === 'BIEN');

    if (!physicalProducts.length) {
      c.innerHTML = `
        <div class="p-8 text-center" style="color:#9CA3AF">
          <i class="fas fa-box-open mr-2 text-xl"></i>No hay productos tipo BIEN registrados en el sistema.
        </div>
      `;
      return;
    }

    // Encontrar tipo de transacción de compra por defecto
    const defaultTxType = txTypes.find((t: any) => t.code === 'FC' || t.prefix === 'FC') || txTypes[0];

    // Estado local para los cálculos
    let state = {
      rotationDays: 30,
      securityDays: 7,
      defaultLeadTime: 15,
      selectedWarehouse: 'TODAS',
      selectedSupplier: 'TODOS',
      productsData: [] as any[],
      selectedIds: new Set<string>()
    };

    // Función principal para recargar y calcular
    async function loadCalculations() {
      // Mostrar indicador de carga en la tabla/KPIs
      const tableBody = document.getElementById('cs-table-body');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="9" class="p-8 text-center text-gray-400">
              <i class="fas fa-spinner fa-spin mr-2"></i>Recalculando rotación y stock sugerido...
            </td>
          </tr>
        `;
      }

      // Calcular fecha de inicio para análisis de rotación
      const now = new Date();
      const startDate = new Date(now.getTime() - state.rotationDays * 24 * 60 * 60 * 1000);
      const startDateStr = (window as any).getColombiaDateStr(startDate);

      try {
        // 1. Obtener Stock
        const stockRows = await (window as any).API.getInventoryStock();

        // 2. Obtener Facturas de Venta Recientes
        const invoices = await (window as any).pb.listAll('invoices', {
          filter: `date >= "${startDateStr}" && status = "posted"`
        });
        const invoiceIds = invoices.map((inv: any) => inv.id);

        // 3. Obtener Líneas de Facturas de Venta en Lote (evita filtros relacionales que pueden fallar por permisos/sucursales)
        let salesLines: any[] = [];
        if (invoiceIds.length > 0) {
          for (let i = 0; i < invoiceIds.length; i += 50) {
            const chunk = invoiceIds.slice(i, i + 50);
            const filterStr = chunk.map(id => `invoice_id="${id}"`).join(' || ');
            const chunkLines = await (window as any).pb.listAll('invoice_lines', {
              filter: filterStr
            });
            salesLines.push(...chunkLines);
          }
        }

        // 4. Obtener Facturas de Compra Recientes para Deducir Proveedores
        const recentPurchases = await (window as any).pb.list('purchase_invoices', {
          page: 1,
          perPage: 100,
          sort: '-date',
          expand: 'supplier_id'
        });
        const purchaseIds = recentPurchases.items.map((p: any) => p.id);

        // 5. Obtener Líneas de Compra
        let purchaseLines: any[] = [];
        if (purchaseIds.length > 0) {
          for (let i = 0; i < purchaseIds.length; i += 50) {
            const chunk = purchaseIds.slice(i, i + 50);
            const filterStr = chunk.map(id => `invoice_id="${id}"`).join(' || ');
            const chunkLines = await (window as any).pb.listAll('purchase_invoice_lines', {
              filter: filterStr
            });
            purchaseLines.push(...chunkLines);
          }
        }

        // Crear mapa para buscar cabecera de compra por id
        const purchasesMap = new Map<string, any>();
        for (const p of recentPurchases.items) {
          purchasesMap.set(p.id, p);
        }

        // Mapear último proveedor y costo de compra por producto
        const lastSupplierMap = new Map<string, { id: string; name: string; cost: number }>();
        for (const line of purchaseLines) {
          const prodId = line.product_id;
          const parentPurchase = purchasesMap.get(line.invoice_id);
          const supplier = parentPurchase?.expand?.supplier_id;
          if (prodId && supplier && !lastSupplierMap.has(prodId)) {
            lastSupplierMap.set(prodId, {
              id: supplier.id,
              name: supplier.name || supplier.trade_name || 'Sin nombre',
              cost: Number(line.unit_cost || 0)
            });
          }
        }

        // Mapear ventas totales en el periodo seleccionado por producto
        const salesMap = new Map<string, number>();
        for (const line of salesLines) {
          const prodId = line.product_id;
          const qty = Number(line.qty || 0);
          if (prodId) {
            salesMap.set(prodId, (salesMap.get(prodId) || 0) + qty);
          }
        }

        // Mapear stock acumulado por producto (y opcionalmente por bodega)
        const stockMap = new Map<string, number>();
        for (const s of stockRows) {
          if (state.selectedWarehouse !== 'TODAS' && s.warehouse_id !== state.selectedWarehouse) {
            continue;
          }
          const prodId = s.product_id;
          if (prodId) {
            stockMap.set(prodId, (stockMap.get(prodId) || 0) + Number(s.qty_on_hand || 0));
          }
        }

        // Construir la data final para la tabla
        state.productsData = physicalProducts.map((p: any) => {
          const currentStock = stockMap.get(p.id) || 0;
          const totalSales = salesMap.get(p.id) || 0;
          const dailySalesRate = totalSales / state.rotationDays;
          
          // Lead Time y Proveedor
          const purchaseInfo = lastSupplierMap.get(p.id);
          const supplierId = purchaseInfo?.id || '';
          const supplierName = purchaseInfo?.name || 'Desconocido';
          const costPrice = purchaseInfo?.cost || p.cost_price || 0;

          // Fórmulas
          const leadTimeStock = dailySalesRate * state.defaultLeadTime;
          const safetyStock = dailySalesRate * state.securityDays;
          const requiredStock = leadTimeStock + safetyStock;
          
          let suggestedQty = 0;
          if (currentStock < requiredStock) {
            suggestedQty = Math.ceil(requiredStock - currentStock);
          }

          // Determinar nivel de rotación badge
          let rotationLevel = 'LOW';
          if (dailySalesRate > 1.5) rotationLevel = 'HIGH';
          else if (dailySalesRate > 0.3) rotationLevel = 'MEDIUM';

          return {
            id: p.id,
            code: p.code || 'SIN COD',
            name: p.name,
            category: p.category || 'General',
            currentStock,
            dailySalesRate,
            safetyStock,
            suggestedQty,
            originalSuggestedQty: suggestedQty,
            supplierId,
            supplierName,
            costPrice,
            rotationLevel
          };
        });

        // Filtrar según proveedor seleccionado
        if (state.selectedSupplier !== 'TODOS') {
          state.productsData = state.productsData.filter(p => p.supplierId === state.selectedSupplier);
        }

        state.selectedIds.clear();
        renderUI();
      } catch (err: any) {
        console.error(err);
        const errContainer = document.getElementById('cs-table-body');
        if (errContainer) {
          errContainer.innerHTML = `
            <tr>
              <td colspan="9" class="p-8 text-center text-rose-500 font-bold">
                <i class="fas fa-circle-exclamation mr-2"></i>Error al recalcular datos: ${err.message}
              </td>
            </tr>
          `;
        }
      }
    }

    // Generar las facturas de compra borrador en lote
    async function generateDraftInvoices() {
      const selectedProducts = state.productsData.filter(p => state.selectedIds.has(p.id) && p.suggestedQty > 0);
      if (!selectedProducts.length) {
        (window as any).showToast('No has seleccionado ningún producto con cantidad sugerida mayor a cero.', 'warning');
        return;
      }

      // Agrupar por proveedor
      const grouped = new Map<string, typeof selectedProducts>();
      for (const p of selectedProducts) {
        const supId = p.supplierId || 'temp_unknown';
        if (!grouped.has(supId)) grouped.set(supId, []);
        grouped.get(supId)!.push(p);
      }

      let createdCount = 0;
      const createdIds: string[] = [];

      try {
        for (const [supId, prods] of grouped.entries()) {
          let finalSupplierId = supId;
          if (supId === 'temp_unknown') {
            if (suppliers.length > 0) {
              finalSupplierId = suppliers[0].id;
            } else {
              throw new Error('No hay proveedores registrados en el sistema para asociar los productos sin proveedor conocido.');
            }
          }

          const today = (window as any).todayStr();
          const randomSuffix = String(Date.now()).slice(-4);
          const number = `FC-SUG-${today.replaceAll('-', '')}-${randomSuffix}`;

          // Calcular totales
          let subtotal = 0;
          const linesPayload = prods.map((p, idx) => {
            const lineSubtotal = p.suggestedQty * p.costPrice;
            subtotal += lineSubtotal;
            return {
              product_id: p.id,
              qty: p.suggestedQty,
              unit_cost: p.costPrice,
              subtotal: lineSubtotal,
              iva_rate: 0,
              iva_amount: 0,
              total: lineSubtotal,
              notes: 'Generado desde Compra Sugerida'
            };
          });

          const activeBranchId = localStorage.getItem('active_branch_id');
          const targetBranch = (activeBranchId && activeBranchId !== 'TODAS') ? activeBranchId : null;

          const header = {
            number,
            date: today,
            supplier_id: finalSupplierId,
            warehouse_id: state.selectedWarehouse !== 'TODAS' ? state.selectedWarehouse : (warehouses[0]?.id || null),
            tx_type_id: defaultTxType?.id || null,
            tx_number: 'AUTO',
            subtotal,
            iva_total: 0,
            total: subtotal,
            payable_total: subtotal,
            status: 'draft',
            notes: 'Reabastecimiento automático sugerido por el sistema.',
            branch_id: targetBranch
          };

          // Crear la factura de compra borrador
          const inv = await (window as any).pb.create('purchase_invoices', header);
          createdIds.push(inv.id);

          // Crear las líneas
          for (let i = 0; i < linesPayload.length; i++) {
            await (window as any).pb.create('purchase_invoice_lines', {
              invoice_id: inv.id,
              line_order: i + 1,
              ...linesPayload[i]
            });
          }

          await (window as any).API.logAudit('CREATE', 'PurchaseInvoice', inv.id, `Generada compra borrador sugerida ${number}`);
          createdCount++;
        }

        (window as any).showToast(`Se han creado ${createdCount} borradores de factura de compra exitosamente.`, 'success');
        
        // Redirigir al listado de compras
        (window as any).navigate('compras');
      } catch (err: any) {
        (window as any).showToast(`Error al generar compras: ${err.message}`, 'error');
      }
    }

    // Renderizado completo de la interfaz
    function renderUI() {
      // 1. Contar KPIs
      const skusToBuy = state.productsData.filter(p => p.suggestedQty > 0).length;
      const criticalSkus = state.productsData.filter(p => p.currentStock <= 0).length;
      const totalInvestment = state.productsData.reduce((sum, p) => sum + (p.suggestedQty * p.costPrice), 0);

      // 2. Pintar la grilla principal
      c.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-xl font-bold" style="color:#0D2137">
              <i class="fas fa-wand-magic-sparkles mr-2 text-indigo-600"></i>Reabastecimiento Inteligente
            </h3>
            <p class="text-sm text-gray-500">Reporte predictivo de compras sugeridas según rotación, stock actual y tiempo de entrega.</p>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Card SKUs -->
          <div class="p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)">
            <div>
              <div class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">SKUs a Comprar</div>
              <div class="text-2xl font-black text-indigo-900">${skusToBuy} de ${state.productsData.length}</div>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 text-xl">
              <i class="fas fa-boxes-stacked"></i>
            </div>
          </div>
          <!-- Card Inversión -->
          <div class="p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]" style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)">
            <div>
              <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Inversión Estimada</div>
              <div class="text-2xl font-black text-emerald-900">${(window as any).fmt(totalInvestment)}</div>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 text-xl">
              <i class="fas fa-dollar-sign"></i>
            </div>
          </div>
          <!-- Card Críticos -->
          <div class="p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]" style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)">
            <div>
              <div class="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">SKUs sin Stock / Críticos</div>
              <div class="text-2xl font-black text-rose-900">${criticalSkus}</div>
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-600 text-xl">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
          </div>
        </div>

        <!-- Filtros e Inputs de Control -->
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[180px]">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Historial de Ventas (Rotación)</label>
            <select id="cs-rotation-days" class="form-input w-full">
              <option value="30" ${state.rotationDays === 30 ? 'selected' : ''}>Últimos 30 días</option>
              <option value="60" ${state.rotationDays === 60 ? 'selected' : ''}>Últimos 60 días</option>
              <option value="90" ${state.rotationDays === 90 ? 'selected' : ''}>Últimos 90 días</option>
            </select>
          </div>
          <div class="w-[140px]">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Cobertura (Seguridad)</label>
            <div class="relative">
              <input id="cs-security-days" type="number" min="0" value="${state.securityDays}" class="form-input w-full pr-12">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">días</span>
            </div>
          </div>
          <div class="w-[140px]">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Tiempo de Entrega</label>
            <div class="relative">
              <input id="cs-lead-time" type="number" min="1" value="${state.defaultLeadTime}" class="form-input w-full pr-12">
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">días</span>
            </div>
          </div>
          <div class="flex-1 min-w-[180px]">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Bodega de Stock</label>
            <select id="cs-warehouse" class="form-input w-full">
              <option value="TODAS" ${state.selectedWarehouse === 'TODAS' ? 'selected' : ''}>[ Todas las bodegas ]</option>
              ${warehouses.map((w: any) => `
                <option value="${w.id}" ${state.selectedWarehouse === w.id ? 'selected' : ''}>${(window as any).esc(w.name)}</option>
              `).join('')}
            </select>
          </div>
          <div class="flex-1 min-w-[180px]">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Proveedor</label>
            <select id="cs-supplier" class="form-input w-full">
              <option value="TODOS" ${state.selectedSupplier === 'TODOS' ? 'selected' : ''}>[ Todos los proveedores ]</option>
              ${suppliers.map((s: any) => `
                <option value="${s.id}" ${state.selectedSupplier === s.id ? 'selected' : ''}>${(window as any).esc(s.name || s.trade_name)}</option>
              `).join('')}
            </select>
          </div>
          <button id="cs-btn-apply" class="btn btn-primary px-5 py-3 h-[42px] flex items-center gap-2">
            <i class="fas fa-arrows-rotate"></i> Calcular
          </button>
        </div>

        <!-- Tabla de Datos -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-xs font-bold text-gray-500 uppercase">
                  <th class="p-4 w-[40px] text-center">
                    <input type="checkbox" id="cs-th-select-all" class="w-4 h-4 text-indigo-600 rounded border-slate-300">
                  </th>
                  <th class="p-4">Producto</th>
                  <th class="p-4">Rotación</th>
                  <th class="p-4 text-right">Stock Actual</th>
                  <th class="p-4 text-right">Vel. Diaria</th>
                  <th class="p-4 text-right">Stock Seg.</th>
                  <th class="p-4 text-right">Último Proveedor</th>
                  <th class="p-4 text-right bg-indigo-50/30 text-indigo-900 w-[120px]">Compra Sugerida</th>
                  <th class="p-4 text-right">Costo Estimado</th>
                </tr>
              </thead>
              <tbody id="cs-table-body" class="divide-y divide-slate-100 text-sm">
                ${state.productsData.map(p => {
                  const hasSuggestion = p.suggestedQty > 0;
                  const isChecked = state.selectedIds.has(p.id);
                  const isLow = p.currentStock <= p.safetyStock;

                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (p.rotationLevel === 'HIGH') badgeColor = 'bg-emerald-100 text-emerald-800';
                  else if (p.rotationLevel === 'MEDIUM') badgeColor = 'bg-blue-100 text-blue-800';

                  return `
                    <tr class="hover:bg-slate-50 transition-colors ${hasSuggestion ? 'font-medium' : ''}">
                      <td class="p-4 text-center">
                        <input type="checkbox" class="cs-row-checkbox w-4 h-4 text-indigo-600 rounded border-slate-300" data-id="${p.id}" ${isChecked ? 'checked' : ''} ${!hasSuggestion ? 'disabled' : ''}>
                      </td>
                      <td class="p-4">
                        <div class="text-slate-800 font-bold">${(window as any).esc(p.name)}</div>
                        <div class="text-xs text-gray-400">Cod: ${(window as any).esc(p.code)} · ${p.category}</div>
                      </td>
                      <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs font-semibold ${badgeColor}">
                          ${p.rotationLevel === 'HIGH' ? '🔥 Alta' : p.rotationLevel === 'MEDIUM' ? '📊 Media' : '📋 Baja'}
                        </span>
                      </td>
                      <td class="p-4 text-right ${isLow ? 'text-rose-600 font-bold' : 'text-slate-700'}">
                        ${(window as any).fmtN(p.currentStock)}
                        ${isLow ? '<i class="fas fa-triangle-exclamation ml-1 text-rose-500" title="Stock por debajo de cobertura de seguridad"></i>' : ''}
                      </td>
                      <td class="p-4 text-right text-slate-600">${(window as any).fmtN(p.dailySalesRate)}/día</td>
                      <td class="p-4 text-right text-slate-500">${(window as any).fmtN(p.safetyStock)}</td>
                      <td class="p-4 text-right text-xs text-slate-500 max-w-[150px] truncate" title="${(window as any).esc(p.supplierName)}">
                        ${(window as any).esc(p.supplierName)}
                      </td>
                      <td class="p-4 text-right bg-indigo-50/20">
                        <input type="number" min="0" data-id="${p.id}" value="${p.suggestedQty}" class="cs-qty-input w-20 text-right p-1 border border-slate-200 rounded font-bold text-indigo-600 focus:outline-none focus:border-indigo-500">
                      </td>
                      <td class="p-4 text-right text-slate-700 font-bold">
                        ${(window as any).fmt(p.suggestedQty * p.costPrice)}
                        <div class="text-[10px] text-gray-400 font-normal">Costo u: ${(window as any).fmt(p.costPrice)}</div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Floating Action Bar for Generating Purchase Orders -->
        <div id="cs-action-bar" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 transition-all duration-300 opacity-0 pointer-events-none transform translate-y-4">
          <div class="text-sm">
            <span class="font-bold text-indigo-400" id="cs-selected-count">0</span> productos seleccionados
            <span class="text-slate-400 mx-2">|</span>
            Total estimado: <span class="font-bold text-emerald-400" id="cs-selected-total">$0</span>
          </div>
          <button id="cs-btn-generate" class="btn btn-primary px-5 py-2 flex items-center gap-2">
            <i class="fas fa-file-invoice"></i> Generar Borrador de Compra
          </button>
        </div>
      `;

      // 3. Vincular Event Listeners de UI
      setupEventListeners();
    }

    // Configurar controladores de eventos
    function setupEventListeners() {
      const btnApply = document.getElementById('cs-btn-apply');
      btnApply?.addEventListener('click', () => {
        const rotVal = Number((document.getElementById('cs-rotation-days') as HTMLSelectElement)?.value || 30);
        const secVal = Number((document.getElementById('cs-security-days') as HTMLInputElement)?.value || 7);
        const leadVal = Number((document.getElementById('cs-lead-time') as HTMLInputElement)?.value || 15);
        const whVal = (document.getElementById('cs-warehouse') as HTMLSelectElement)?.value || 'TODAS';
        const supVal = (document.getElementById('cs-supplier') as HTMLSelectElement)?.value || 'TODOS';

        state.rotationDays = rotVal;
        state.securityDays = secVal;
        state.defaultLeadTime = leadVal;
        state.selectedWarehouse = whVal;
        state.selectedSupplier = supVal;

        loadCalculations();
      });

      // Manejar cambios manuales en la cantidad sugerida de la tabla
      const qtyInputs = document.querySelectorAll('.cs-qty-input');
      qtyInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          const prodId = target.dataset.id;
          const newQty = Math.max(0, parseInt(target.value) || 0);
          
          const p = state.productsData.find(x => x.id === prodId);
          if (p) {
            p.suggestedQty = newQty;
            
            // Si la cantidad es cero, deseleccionar
            if (newQty === 0) {
              state.selectedIds.delete(p.id);
            } else {
              state.selectedIds.add(p.id);
            }
            // Volver a calcular el coste de la fila y actualizar la barra de acción
            const row = target.closest('tr');
            if (row) {
              const costCell = row.querySelector('td:last-child');
              if (costCell) {
                costCell.innerHTML = `
                  ${(window as any).fmt(newQty * p.costPrice)}
                  <div class="text-[10px] text-gray-400 font-normal">Costo u: ${(window as any).fmt(p.costPrice)}</div>
                `;
              }
              const checkbox = row.querySelector('.cs-row-checkbox') as HTMLInputElement;
              if (checkbox) {
                checkbox.checked = state.selectedIds.has(p.id);
              }
            }
            updateActionBar();
          }
        });
      });

      // Seleccionar/Deseleccionar fila
      const rowCheckboxes = document.querySelectorAll('.cs-row-checkbox');
      rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          const prodId = target.dataset.id;
          if (prodId) {
            if (target.checked) {
              state.selectedIds.add(prodId);
            } else {
              state.selectedIds.delete(prodId);
            }
            updateActionBar();
          }
        });
      });

      // Seleccionar todo
      const selectAll = document.getElementById('cs-th-select-all') as HTMLInputElement;
      selectAll?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const boxes = document.querySelectorAll('.cs-row-checkbox') as NodeListOf<HTMLInputElement>;
        
        boxes.forEach(box => {
          const prodId = box.dataset.id;
          if (prodId && !box.disabled) {
            box.checked = target.checked;
            if (target.checked) {
              state.selectedIds.add(prodId);
            } else {
              state.selectedIds.delete(prodId);
            }
          }
        });
        updateActionBar();
      });

      // Botón generar factura en lote
      const btnGenerate = document.getElementById('cs-btn-generate');
      btnGenerate?.addEventListener('click', generateDraftInvoices);
    }

    // Actualiza el estado visual de la barra flotante de acciones
    function updateActionBar() {
      const actionBar = document.getElementById('cs-action-bar');
      const countEl = document.getElementById('cs-selected-count');
      const totalEl = document.getElementById('cs-selected-total');

      if (!actionBar) return;

      const selectedProducts = state.productsData.filter(p => state.selectedIds.has(p.id) && p.suggestedQty > 0);
      const totalCost = selectedProducts.reduce((sum, p) => sum + (p.suggestedQty * p.costPrice), 0);

      if (selectedProducts.length > 0) {
        if (countEl) countEl.innerText = String(selectedProducts.length);
        if (totalEl) totalEl.innerText = (window as any).fmt(totalCost);

        actionBar.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        actionBar.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      } else {
        actionBar.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
        actionBar.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      }
    }

    // Lanzar primera carga de datos
    await loadCalculations();

  } catch (err: any) {
    c.innerHTML = `
      <div class="p-8 text-center" style="color:#EF4444">
        <i class="fas fa-circle-exclamation mr-2"></i>Error al cargar módulo de compra sugerida: ${err.message}
      </div>
    `;
  }
};
