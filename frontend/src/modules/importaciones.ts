/**
 * GRAVY v2.0 — importaciones.ts
 * Módulo de Gestión de Importaciones.
 * Permite registrar y gestionar compras internacionales, logística de tránsito,
 * nacionalización, carga de documentos (B/L y Manifiestos), prorrateo de costos
 * y capitalización a bodega mediante facturas de compra.
 */

'use strict';

import { SupplyChainOrchestrator } from '../services/supply-chain-orchestrator';

interface ImportStatusDetail {
  label: string;
  badge: string;
}

const IMPORT_STATUS: Record<string, ImportStatusDetail> = {
  planeacion:      { label: 'Planeación',      badge: 'badge-gray' },
  transito:        { label: 'En Tránsito',     badge: 'badge-blue' },
  nacionalizacion: { label: 'Nacionalización', badge: 'badge-orange' },
  recibido:        { label: 'Recibido (Finalizado)', badge: 'badge-green' },
  anulado:         { label: 'Anulado',         badge: 'badge-red' },
};

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'CFR', 'CIP', 'CPT', 'DAP', 'DPU', 'DDP', 'FAS', 'FCA'];
const CURRENCIES = ['USD', 'COP', 'EUR', 'CNY'];
const TRANSPORTS = [
  { value: 'maritimo', label: '⚓ Marítimo' },
  { value: 'aereo', label: '✈️ Aéreo' },
  { value: 'terrestre', label: '🚛 Terrestre' },
  { value: 'courier', label: '📦 Courier' }
];

export async function renderImportaciones(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando importaciones...</div>`;
  try {
    await _loadImportacionesPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadImportacionesPage(c: HTMLElement) {
  const result = await (window as any).API.getImports({ page: 1, perPage: 100 });
  const imports = result.items || [];

  const total = imports.length;
  const transit = imports.filter((i: any) => i.status === 'transito').length;
  const nationalization = imports.filter((i: any) => i.status === 'nacionalizacion').length;
  const totalFOB = imports.filter((i: any) => i.status !== 'anulado' && i.currency === 'USD').reduce((s: number, i: any) => s + (i.fob_total || 0), 0);

  c.innerHTML = `
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Gestión de Importaciones</h3>
        <p class="text-sm" style="color:#6B7280">Planifica compras internacionales, controla el tránsito, nacionaliza aduanas y liquida costos de importación.</p>
      </div>
      <div class="flex gap-2">
        ${(window as any).can('canWrite') ? `<button class="btn btn-outline" id="btn-import-pending-sale" title="Crear factura pendiente por entrega"><i class="fas fa-truck-ramp-box"></i> Facturar con Reserva</button>` : ''}
        ${(window as any).can('canWrite') ? `<button class="btn btn-outline" id="btn-import-config" title="Configuración de importaciones"><i class="fas fa-gear"></i></button><button class="btn btn-primary" id="btn-new-import"><i class="fas fa-plus"></i> Nueva Importación</button>` : ''}
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${importKpi('Total importaciones', total, 'fas fa-ship', '#1A4B8C', '#EEF4FF')}
      ${importKpi('En Tránsito (Logística)', transit, 'fas fa-truck-ramp-box', '#0284C7', '#E0F2FE')}
      ${importKpi('Nacionalización (DIAN)', nationalization, 'fas fa-scale-balanced', '#D97706', '#FEF3C7')}
      ${importKpi('Valor FOB Activo (USD)', (window as any).fmt(totalFOB).replace('COP', 'USD'), 'fas fa-circle-dollar-to-slot', '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="imp-q" class="form-input flex-1 min-w-48" placeholder="Buscar por número, proveedor o B/L...">
      <select id="imp-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="planeacion">Planeación</option>
        <option value="transito">En Tránsito</option>
        <option value="nacionalizacion">Nacionalización</option>
        <option value="recibido">Recibido (Finalizado)</option>
        <option value="anulado">Anulado</option>
      </select>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="imp-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha Creada</th>
              <th>Proveedor Internacional</th>
              <th>B/L o AWB</th>
              <th>Medio</th>
              <th>ETA</th>
              <th class="text-right">Total (COP)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="imp-tbody">
            ${imports.length ? imports.map(renderImportRow).join('') : `<tr><td colspan="9" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-ship mr-2"></i>No hay importaciones registradas.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('btn-new-import')?.addEventListener('click', () => openImportForm(null, () => _loadImportacionesPage(c)));
  document.getElementById('btn-import-pending-sale')?.addEventListener('click', () => {
    if (typeof (window as any).openPendingDeliverySaleForm === 'function') {
      (window as any).openPendingDeliverySaleForm(() => _loadImportacionesPage(c));
    } else {
      (window as any).showToast('La acción de facturar con reserva aún no está disponible.', 'warning');
    }
  });
  document.getElementById('btn-import-config')?.addEventListener('click', () => openImportSettingsModal(() => _loadImportacionesPage(c)));

  const applyFilter = () => filterImportTable();
  document.getElementById('imp-q')?.addEventListener('input', applyFilter);
  document.getElementById('imp-status-f')?.addEventListener('change', applyFilter);

  const tbl = document.getElementById('imp-table') as HTMLTableElement;
  if (tbl) (window as any).makeTableSortable(tbl);
}

function importKpi(title: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card blue" style="background:#fff;border-color:#E5E7EB">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold tracking-wider" style="color:#6B7280">${title}</span>
          <h4 class="text-2xl font-extrabold mt-1" style="color:#0D2137">${value}</h4>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="color:${color};background:${bg}">
          <i class="${icon}"></i>
        </div>
      </div>
    </div>
  `;
}

function renderImportRow(imp: any) {
  const meta = IMPORT_STATUS[imp.status] || { label: imp.status, badge: 'badge-gray' };
  const supplier = imp.expand?.supplier_id;
  const forwarder = imp.expand?.forwarder_supplier_id;
  const transport = TRANSPORTS.find(t => t.value === imp.transport_type)?.label || imp.transport_type || '—';

  let supplierHtml = '';
  if (imp.is_consolidated) {
    supplierHtml = `
      <div>
        <span class="badge badge-blue text-[10px] font-bold"><i class="fas fa-boxes-packing mr-1"></i>Consolidada</span>
        ${supplier ? `<div class="text-xs font-semibold text-slate-700 mt-0.5">${(window as any).esc(supplier.name)}</div>` : (forwarder ? `<div class="text-xs text-slate-500 mt-0.5">Agente: ${(window as any).esc(forwarder.name)}</div>` : '<div class="text-[10px] text-gray-400 mt-0.5">Multi-Proveedor</div>')}
      </div>
    `;
  } else {
    supplierHtml = supplier ? (window as any).esc(supplier.name) : '—';
  }

  return `
    <tr data-impid="${(window as any).esc(imp.id)}" data-impstatus="${(window as any).esc(imp.status)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(imp.number)}</span></td>
      <td>${(window as any).esc(imp.date_created)}</td>
      <td class="font-medium">${supplierHtml}</td>
      <td class="font-mono text-sm">${(window as any).esc(imp.bl_awb || '—')}</td>
      <td>${transport}</td>
      <td class="font-semibold" style="color:#4B5563">${(window as any).esc(imp.estimated_arrival || '—')}</td>
      <td class="text-right font-semibold">${(window as any).fmt(imp.total || 0)}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewImportDetail('${(window as any).esc(imp.id)}')"><i class="fas fa-eye"></i></button>
          
          ${imp.status !== 'recibido' && imp.status !== 'anulado' && (window as any).can('canWrite') ? `
            <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#3b82f6" title="Editar" onclick="window.editImport('${(window as any).esc(imp.id)}')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-primary btn-sm" title="Nacionalizar / Finalizar" onclick="window.confirmFinalizarImportacion('${(window as any).esc(imp.id)}')"><i class="fas fa-check-double"></i> Recibir</button>
            <button class="btn btn-danger btn-sm" title="Anular" onclick="window.cancelImportDirect('${(window as any).esc(imp.id)}', '${(window as any).esc(imp.number)}')"><i class="fas fa-ban"></i></button>
          ` : ''}
          
          ${imp.status === 'recibido' ? `
            <span class="badge badge-green" title="Importación finalizada y capitalizada"><i class="fas fa-boxes-packing mr-1"></i>Capitalizado</span>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

function filterImportTable() {
  const q = ((document.getElementById('imp-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const st = (document.getElementById('imp-status-f') as HTMLSelectElement)?.value || '';

  const rows = document.querySelectorAll('#imp-table tbody tr[data-impid]');
  rows.forEach((row: any) => {
    const text = row.textContent.toLowerCase();
    const status = row.getAttribute('data-impstatus');

    const matchesQ = !q || text.includes(q);
    const matchesStatus = !st || status === st;

    row.style.display = (matchesQ && matchesStatus) ? '' : 'none';
  });
}

// Variables para archivos cargados en el modal actual
let currentUploadedFiles: Record<string, File | null> = {};

// --- Formulario de Importación (Crear / Editar) ---
async function openImportForm(importId: string | null = null, onDone: any = null) {
  currentUploadedFiles = {};
  let imp: any = null;
  let existingLines: any[] = [];
  let localInvoices: any[] = [];
  let localPalletConfigs: Record<string, any[]> = {};

  const [suppliers, products] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getProducts({ activeOnly: true }),
  ]);

  const getSupplierOptions = (selectedId: string) => {
    return `<option value="">— Seleccionar —</option>` + suppliers.map((s: any) => `
      <option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>
        ${(window as any).esc(s.name)} (${s.doc_number || s.nit || 'S/N'})
      </option>
    `).join('');
  };

  if (importId) {
    const [impRes, linesRes, invsRes, palletsRes] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id' }),
      (window as any).API.getImportLines(importId),
      (window as any).API.getImportInvoices(importId).catch(() => []),
      (window as any).API.getImportPalletConfigs(importId).catch(() => []),
    ]);
    imp = impRes;
    existingLines = linesRes || [];
    localInvoices = invsRes || [];
    if (palletsRes && palletsRes.length) {
      palletsRes.forEach((pc: any) => {
        const key = pc.import_line_id || pc.product_id;
        if (!localPalletConfigs[key]) localPalletConfigs[key] = [];
        localPalletConfigs[key].push(pc);
      });
    }
  }

  let lineCounter = 0;
  const suggestedNumber = !imp ? await (window as any).API.nextImportConsecutive().catch(() => '') : '';
  const consecutive = imp?.number || suggestedNumber;

  const formHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      
      <!-- 1. Datos Generales -->
      <div class="p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 class="font-bold" style="color:#0D2137"><i class="fas fa-circle-info mr-1 text-blue-700"></i> Información General</h4>
          
          <!-- Switch Modo Consolidado -->
          <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <input type="checkbox" id="imp-is-consolidated" class="rounded w-4 h-4 text-blue-600 focus:ring-blue-500" ${imp?.is_consolidated ? 'checked' : ''} onchange="window.impToggleConsolidatedMode(this.checked)">
            <span class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <i class="fas fa-boxes-packing text-blue-600"></i> Importación Consolidada (Multi-Proveedor)
            </span>
          </label>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group col-span-1 md:col-span-2">
            <label class="form-label font-bold" id="lbl-imp-supplier-title">Proveedor Internacional Principal <span id="imp-supplier-req-star" style="color:#EF4444">${imp?.is_consolidated ? '' : '*'}</span></label>
            <div id="imp-supplier-search-wrap" class="relative">
              <input id="imp-supplier-search" class="form-input" autocomplete="off" placeholder="Buscar proveedor por NIT o nombre...">
              <input id="imp-supplier-id" type="hidden" value="${(window as any).esc(imp?.supplier_id || '')}">
              <div id="imp-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:180px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
            </div>
            <p class="text-[11px] text-gray-500 mt-1" id="lbl-imp-supplier-hint">
              ${imp?.is_consolidated ? 'Proveedor general, consolidador o agente de carga principal.' : 'Proveedor internacional emisor de la mercancía.'}
            </p>
          </div>
          
          <div class="form-group">
            <label class="form-label font-bold">Estado</label>
            <select id="imp-status" class="form-input">
              <option value="planeacion" ${imp?.status === 'planeacion' ? 'selected' : ''}>Planeación</option>
              <option value="transito" ${imp?.status === 'transito' ? 'selected' : ''}>En Tránsito</option>
              <option value="nacionalizacion" ${imp?.status === 'nacionalizacion' ? 'selected' : ''}>Nacionalización</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Incoterm</label>
            <select id="imp-incoterm" class="form-input">
              <option value="">— Seleccionar —</option>
              ${INCOTERMS.map(inc => `<option value="${inc}" ${imp?.incoterm === inc ? 'selected' : ''}>${inc}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
          <div class="form-group">
            <label class="form-label font-bold">Divisa</label>
            <select id="imp-currency" class="form-input" onchange="window.impUpdateCurrencyLabel()">
              ${CURRENCIES.map(curr => `<option value="${curr}" ${imp?.currency === curr ? 'selected' : (curr === 'USD' && !imp ? 'selected' : '')}>${curr}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <div class="flex items-center justify-between">
              <label class="form-label font-bold mb-0">Tasa Cambio Base (COP) <span style="color:#EF4444">*</span></label>
              <button type="button" class="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer border-0 bg-transparent p-0" onclick="window.impSyncGeneralTrmToStages()" title="Copiar esta TRM base a Flete, Seguro y Aduana">
                <i class="fas fa-arrows-rotate mr-0.5"></i> Replicar a rubros
              </button>
            </div>
            <input type="number" id="imp-exchange-rate" class="form-input mt-1 font-mono font-bold" min="1" step="0.01" value="${imp?.exchange_rate || '4000.00'}" oninput="window.impRecalcTotals()">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Nro. Importación / Consecutivo <span style="color:#EF4444">*</span></label>
            <div class="flex gap-1">
              <input id="imp-number" class="form-input font-mono font-bold" placeholder="Ej: 099 o IMP-000099" value="${(window as any).esc(consecutive)}" oninput="window.impUpdateTransitAccountInfo()" ${imp?.tx_fob_id ? 'readonly style="background:#F3F4F6"' : ''}>
              ${!imp ? `
                <button type="button" class="btn btn-outline btn-xs px-2 flex items-center justify-center gap-1" title="Sugerir consecutivo automático" onclick="window.impAutoSuggestNumber()">
                  <i class="fas fa-wand-magic-sparkles text-amber-500"></i> Auto
                </button>
              ` : ''}
            </div>
            <div id="imp-puc-transit-status" class="mt-1 text-[11px] font-semibold"></div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Notas / Comentarios</label>
            <input id="imp-notes" class="form-input" placeholder="Observaciones generales..." value="${(window as any).esc(imp?.notes || '')}">
          </div>
        </div>
      </div>

      <!-- Sección de Facturas Comerciales Consolidadas (Visible en modo consolidado) -->
      <div id="imp-consolidated-invoices-wrap" class="p-4 rounded-xl border ${imp?.is_consolidated ? '' : 'hidden'}" style="background:#F0F7FF;border-color:#BFDBFE">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h4 class="font-bold text-sm text-blue-950 flex items-center gap-2">
              <i class="fas fa-file-invoice-dollar text-blue-600"></i> Facturas Comerciales de Proveedores Internacionales
            </h4>
            <p class="text-xs text-blue-700">Gestiona cada factura comercial con su respectivo proveedor extranjero y fecha de vencimiento para la Agenda de Pagos (CXP 220505).</p>
          </div>
          <button type="button" class="btn btn-primary btn-xs flex items-center gap-1" onclick="window.impOpenInvoiceModal()">
            <i class="fas fa-plus"></i> Agregar Factura Comercial
          </button>
        </div>

        <div class="overflow-x-auto bg-white rounded-lg border border-blue-200">
          <table class="w-full text-xs text-left border-collapse" id="imp-invoices-table">
            <thead>
              <tr class="bg-blue-50/80 text-blue-900 font-semibold border-b border-blue-200">
                <th class="py-2 px-3">Proveedor Exterior</th>
                <th class="py-2 px-3">Factura Nro.</th>
                <th class="py-2 px-3">Fecha Emisión</th>
                <th class="py-2 px-3">Vencimiento (Agenda)</th>
                <th class="py-2 px-3 text-right">Monto FOB USD</th>
                <th class="py-2 px-3 text-right">Monto FOB COP</th>
                <th class="py-2 px-3 text-center">Soporte PDF</th>
                <th class="py-2 px-3 text-center">Estado Contable</th>
                <th class="py-2 px-3 text-center" style="width:100px">Acciones</th>
              </tr>
            </thead>
            <tbody id="imp-invoices-tbody" class="divide-y divide-gray-100">
              <!-- Rendered by impRenderInvoicesTable -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Logística e Información de Tránsito -->
      <div class="p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
        <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-truck mr-1 text-blue-700"></i> Logística de Embarque (Tránsito)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label class="form-label font-bold">B/L o AWB (Nro. Guía)</label>
            <input id="imp-bl-awb" class="form-input" placeholder="Ej: BL-MAEU982348" value="${(window as any).esc(imp?.bl_awb || '')}">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Medio de Transporte</label>
            <select id="imp-transport-type" class="form-input">
              <option value="">— Seleccionar —</option>
              ${TRANSPORTS.map(t => `<option value="${t.value}" ${imp?.transport_type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Fecha Est. Llegada (ETA)</label>
            <input type="date" id="imp-estimated-arrival" class="form-input" value="${(window as any).esc(imp?.estimated_arrival || '')}">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Documento B/L (Conocimiento Embarque)</label>
            <div class="flex items-center gap-2">
              <input type="file" id="file-bl-document" accept="application/pdf,image/*" style="display:none" onchange="window.impHandleFileSelect('bl_document', this.files)">
              <button type="button" class="btn btn-outline w-full flex items-center justify-center gap-1" onclick="document.getElementById('file-bl-document').click()">
                <i class="fas fa-upload"></i> <span id="lbl-bl-document">${imp?.bl_document ? 'Cambiar archivo' : 'Subir B/L'}</span>
              </button>
              ${imp?.bl_document ? `
                <a href="${(window as any).PB_URL}/api/files/imports/${imp.id}/${imp.bl_document}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="btn btn-outline p-2 text-blue-600" title="Ver archivo actual">
                  <i class="fas fa-file-pdf"></i>
                </a>
              ` : ''}
            </div>
            <p class="text-[10px] mt-1 text-gray-500" id="file-bl-status"></p>
          </div>
        </div>
      </div>

      <!-- 3. Cumplimiento Aduanero (DIAN / VUCE) -->
      <div class="p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
        <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-scale-balanced mr-1 text-blue-700"></i> Cumplimiento Aduanero (DIAN / VUCE)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label class="form-label font-bold">Nro. Registro/Licencia VUCE</label>
            <input id="imp-vuce-registro" class="form-input" placeholder="Ej: 2026-VUCE-..." value="${(window as any).esc(imp?.vuce_registro_num || '')}">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Modalidad de Importación</label>
            <select id="imp-modalidad-importacion" class="form-input">
              <option value="">— Seleccionar —</option>
              <option value="ORDINARIA" ${imp?.modalidad_importacion === 'ORDINARIA' ? 'selected' : ''}>Ordinaria</option>
              <option value="FRANQUICIA" ${imp?.modalidad_importacion === 'FRANQUICIA' ? 'selected' : ''}>Franquicia</option>
              <option value="TEMPORAL_REEXP" ${imp?.modalidad_importacion === 'TEMPORAL_REEXP' ? 'selected' : ''}>Temporal Reexportación</option>
              <option value="TEMPORAL_PERF" ${imp?.modalidad_importacion === 'TEMPORAL_PERF' ? 'selected' : ''}>Temporal Perfeccionamiento</option>
              <option value="ENSAMBLE" ${imp?.modalidad_importacion === 'ENSAMBLE' ? 'selected' : ''}>Ensamble</option>
              <option value="URGENTES" ${imp?.modalidad_importacion === 'URGENTES' ? 'selected' : ''}>Envíos Urgentes</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Canal de Inspección</label>
            <select id="imp-canal-inspeccion" class="form-input">
              <option value="">— Seleccionar —</option>
              <option value="AUTOMATICO" ${imp?.canal_inspeccion === 'AUTOMATICO' ? 'selected' : ''}>🟢 Automático</option>
              <option value="DOCUMENTAL" ${imp?.canal_inspeccion === 'DOCUMENTAL' ? 'selected' : ''}>🟡 Documental</option>
              <option value="FISICO" ${imp?.canal_inspeccion === 'FISICO' ? 'selected' : ''}>🔴 Físico</option>
              <option value="NO_INTRUSIVO" ${imp?.canal_inspeccion === 'NO_INTRUSIVO' ? 'selected' : ''}>🔵 No Intrusivo</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Método de Prorrateo</label>
            <select id="imp-proration-method" class="form-input font-semibold" style="color:#1E40AF" onchange="window.impRecalcTotals()">
              <option value="FOB_VALUE" ${imp?.proration_method === 'FOB_VALUE' ? 'selected' : (imp?.proration_method ? '' : 'selected')}>Prorrateo por Valor FOB</option>
              <option value="GROSS_WEIGHT" ${imp?.proration_method === 'GROSS_WEIGHT' ? 'selected' : ''}>Prorrateo por Peso Bruto (Kg)</option>
              <option value="CUBIC_VOLUME" ${imp?.proration_method === 'CUBIC_VOLUME' ? 'selected' : ''}>Prorrateo por Cubicaje (m3)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
          <div class="form-group">
            <label class="form-label font-bold">Nro. Formulario 500 (DIAN)</label>
            <input id="imp-dian-declaracion" class="form-input font-mono" placeholder="Ej: 500260..." value="${(window as any).esc(imp?.dian_declaracion_num || '')}">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Fecha de Aceptación</label>
            <input type="date" id="imp-dian-declaracion-date" class="form-input" value="${(window as any).esc(imp?.dian_declaracion_date || '')}">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Fecha de Levante</label>
            <input type="date" id="imp-dian-levante-date" class="form-input" value="${(window as any).esc(imp?.dian_levante_date || '')}">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">TRM Oficial DIAN ($)</label>
            <input type="number" id="imp-dian-trm" class="form-input" min="1" step="0.01" placeholder="Ej: 4015.20" value="${imp?.dian_trm || ''}">
          </div>
        </div>
      </div>

      <!-- 4. Detalle de Artículos y Manifiestos -->
      <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
        <!-- Alertas de Vistos Buenos -->
        <div id="imp-vb-alerts-wrap" class="px-4 py-2 border-b hidden" style="background:#FFF5F5;border-color:#FEE2E2">
          <div class="flex items-start gap-2 text-red-800 text-xs">
            <i class="fas fa-triangle-exclamation mt-0.5"></i>
            <div>
              <p class="font-bold">⚠️ Vistos Buenos Requeridos (VUCE / DIAN):</p>
              <ul class="list-disc pl-4 mt-0.5 space-y-0.5 font-medium" id="imp-vb-alerts-list">
              </ul>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes-packing mr-1 text-blue-700"></i> Mercancía de Importación</span>
          <div class="flex gap-2 items-center">
            <input type="file" id="file-import-excel" accept=".xlsx, .xls, .csv" style="display:none" onchange="window.impHandleExcelImport(this.files)">
            <button type="button" class="btn btn-outline btn-xs text-blue-700 border-blue-300 hover:bg-blue-50 flex items-center gap-1" onclick="document.getElementById('file-import-excel').click()" title="Cargar lista de productos desde Excel / CSV">
              <i class="fas fa-file-excel text-green-600"></i> Cargar desde Excel
            </button>
            <button type="button" class="btn btn-outline btn-xs text-gray-600 flex items-center gap-1" onclick="window.impDownloadExcelTemplate()" title="Descargar plantilla Excel de ejemplo">
              <i class="fas fa-download"></i> Plantilla Excel
            </button>
          </div>
        </div>
        <!-- Buscador Global de Productos -->
        <div class="relative p-2 bg-white border-b" style="border-color:#E5E7EB">
          <i class="fas fa-search" style="position:absolute;left:21px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:13px;pointer-events:none"></i>
          <input id="imp-prod-search-global" class="form-input"
                 style="padding-left:38px;font-size:14px;border-color:#DCE6F8"
                 autocomplete="off"
                 placeholder="Buscar producto o servicio por nombre o código... (↑↓ para navegar · Enter o clic para agregar)">
          <div id="imp-prod-results-global"
               style="display:none;position:absolute;left:8px;right:8px;top:calc(100% + 3px);max-height:240px;overflow:auto;background:#fff;border:1.5px solid #DCE6F8;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);z-index:50">
          </div>
        </div>

        <div style="overflow-x:auto;max-height:360px;overflow-y:auto">
          <table class="data-table" id="imp-lines-table" style="min-width:1160px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:250px;background:#F4F8FF">Producto & Control Lote/Estibas</th>
                <th class="col-consolidated-th ${imp?.is_consolidated ? '' : 'hidden'}" style="min-width:170px;background:#F4F8FF">Proveedor / Factura</th>
                <th class="text-right" style="width:105px;background:#F4F8FF">Cant. Total</th>
                <th class="text-right" style="width:130px;background:#F4F8FF" id="lbl-th-fob-price">P. FOB (USD)</th>
                <th class="text-right" style="width:85px;background:#F4F8FF">Arancel %</th>
                <th class="text-right" style="width:80px;background:#F4F8FF">IVA %</th>
                <th style="min-width:130px;background:#F4F8FF">Nro. Manifiesto</th>
                <th style="width:125px;background:#F4F8FF">Archivo PDF</th>
                <th class="text-right" style="width:115px;background:#F4F8FF">Costo Est. (COP)</th>
                <th class="text-right" style="width:120px;background:#F4F8FF">Total (COP)</th>
                <th style="width:45px;background:#F4F8FF">Acción</th>
              </tr>
            </thead>
            <tbody id="imp-lines-body"></tbody>
          </table>
        </div>
      </div>

      <!-- 4. Causaciones por Etapas y Gastos de Nacionalización (Sistema de Pestañas con Pipeline) -->
      ${(() => {
        const stagesList = [imp?.tx_fob_id, imp?.tx_freight_id, imp?.tx_insurance_id, imp?.tx_customs_id, imp?.tx_local_carrier_id, imp?.tx_local_other_id];
        const causedCount = stagesList.filter(Boolean).length;
        const progressPct = Math.round((causedCount / 6) * 100);

        return `
        <div class="rounded-xl border shadow-sm overflow-hidden bg-white mb-6" style="border-color:#E2E8F0">
          
          <!-- Stepper & Progress Header -->
          <div class="p-4 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30 text-blue-300">
                <i class="fas fa-calculator text-lg"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm md:text-base text-white flex items-center gap-2">
                  Causación Contable por Etapas
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30">Hoja de Costos</span>
                </h4>
                <p class="text-xs text-slate-300">
                  Gestión contable secuencial para registro de compras FOB, fletes, seguros, impuestos DIAN y acarreos.
                </p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="flex items-center gap-3 bg-slate-800/90 px-3.5 py-2 rounded-lg border border-slate-700">
              <div class="text-right">
                <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avance Contable</div>
                <div class="text-xs font-bold text-white" id="imp-stage-progress-text">${causedCount} de 6 Etapas Causadas</div>
              </div>
              <div class="w-16 bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-400 h-full transition-all duration-300" id="imp-stage-progress-bar" style="width: ${progressPct}%"></div>
              </div>
              <span class="text-xs font-extrabold text-emerald-400 font-mono">${progressPct}%</span>
            </div>
          </div>

          <!-- Tabs Navigation Bar -->
          <div class="flex overflow-x-auto border-b bg-slate-50 p-1.5 gap-1.5 scrollbar-thin" id="imp-stage-tabs-header" style="border-color:#E2E8F0">
            <button type="button" class="imp-stage-tab-btn active px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-0 bg-blue-600 text-white shadow-sm" data-tab="resumen" onclick="window.switchImpStageTab('resumen')">
              <i class="fas fa-layer-group"></i>
              <span>Vista General</span>
            </button>
            
            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="fob" onclick="window.switchImpStageTab('fob')">
              <i class="fas fa-ship text-indigo-500"></i>
              <span>1. FOB Mercancía</span>
              ${imp?.tx_fob_id ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>` : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="freight" onclick="window.switchImpStageTab('freight')">
              <i class="fas fa-plane-departure text-sky-500"></i>
              <span>2. Flete Int.</span>
              ${imp?.tx_freight_id ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>` : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="insurance" onclick="window.switchImpStageTab('insurance')">
              <i class="fas fa-shield-alt text-amber-500"></i>
              <span>3. Seguro Int.</span>
              ${imp?.tx_insurance_id ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>` : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="customs" onclick="window.switchImpStageTab('customs')">
              <i class="fas fa-building-columns text-purple-500"></i>
              <span>4. Aduana / DIAN</span>
              ${imp?.tx_customs_id ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>` : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="local_carrier" onclick="window.switchImpStageTab('local_carrier')">
              <i class="fas fa-truck text-emerald-600"></i>
              <span>5. Transporte Local</span>
              ${imp?.tx_local_carrier_id ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>` : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="local_other" onclick="window.switchImpStageTab('local_other')">
              <i class="fas fa-box text-orange-500"></i>
              <span>6. Otros Gastos</span>
              ${imp?.tx_local_other_id ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>` : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`}
            </button>
          </div>

          <!-- Tab Content Panels Container -->
          <div class="p-5 bg-slate-50/50">

            <!-- Panel 0: Vista General -->
            <div class="imp-stage-panel space-y-6" id="imp-stage-panel-resumen">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Tabla Matriz General -->
                <div class="lg:col-span-2 p-4 rounded-xl border bg-white shadow-sm" style="border-color:#E2E8F0">
                  <div class="flex items-center justify-between mb-3">
                    <h5 class="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <i class="fas fa-table text-blue-600"></i> Matriz de Causación por Etapa
                    </h5>
                    <span class="text-[10px] text-slate-400 font-medium">Haz clic en una etapa para editar en detalle</span>
                  </div>

                  <div style="overflow-x:auto">
                    <table class="w-full text-xs text-left border-collapse" id="imp-stages-table">
                      <thead>
                        <tr class="border-b text-slate-500 font-semibold bg-slate-50" style="border-color:#E5E7EB">
                          <th class="py-2.5 px-3" style="min-width:130px">Etapa</th>
                          <th class="py-2.5 px-3" style="min-width:160px">Proveedor / Tercero</th>
                          <th class="py-2.5 px-3" style="width:105px">Factura Nro</th>
                          <th class="py-2.5 px-3 text-right" style="width:100px">Monto Divisa</th>
                          <th class="py-2.5 px-3 text-right" style="width:100px;background:#FEFCE8" title="Tasa Representativa del Mercado aplicada a este rubro">TRM ($) <i class="fas fa-coins text-amber-500"></i></th>
                          <th class="py-2.5 px-3 text-right" style="width:115px">Total (COP)</th>
                          <th class="py-2.5 px-3 text-center" style="width:110px">Acción Contable</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        
                        <!-- FOB Row -->
                        <tr class="hover:bg-blue-50/40 transition-colors cursor-pointer" onclick="if(!event.target.closest('button, input, select')) window.switchImpStageTab('fob')">
                          <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${imp?.tx_fob_id ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            <span>FOB Mercancía</span>
                            <span class="text-[10px] text-slate-400 font-normal" id="lbl-fob-currency">(USD)</span>
                            <span id="lbl-fob-consolidated-indicator" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold ${imp?.is_consolidated ? '' : 'hidden'}">Consolidado</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <span class="font-medium text-xs text-slate-700" id="stage-fob-supplier-name">
                              ${imp?.is_consolidated ? 'Múltiples Proveedores (Ver tab)' : (imp?.expand?.supplier_id ? (window as any).esc(imp.expand.supplier_id.name) : 'Definido arriba')}
                            </span>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="text" id="imp-supplier-invoice-num" class="form-input text-xs py-1 font-mono ${imp?.is_consolidated ? 'hidden' : ''}" placeholder="Factura Nro" value="${(window as any).esc(imp?.supplier_invoice_num || '')}" ${imp?.tx_fob_id ? 'disabled' : ''}>
                            <span id="imp-consolidated-inv-count-badge" class="text-xs text-blue-700 font-semibold ${imp?.is_consolidated ? '' : 'hidden'}">Ver Facturas</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="number" id="imp-fob-total" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.fob_total || '0'}" readonly style="background:#F3F4F6">
                          </td>
                          <td class="py-2.5 px-3 bg-amber-50/40">
                            <input type="number" id="imp-stage-fob-trm" class="form-input text-xs py-1 text-right font-bold text-slate-700 bg-slate-100" value="${imp?.exchange_rate || '4000.00'}" readonly title="TRM Base de la importación">
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <span id="stage-fob-cop-display" class="font-mono font-bold text-slate-800 text-xs block">$ 0</span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <div id="wrap-fob-single-action" class="${imp?.is_consolidated ? 'hidden' : ''}">
                              ${imp?.tx_fob_id ? `
                                <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_fob_id}')">
                                  <i class="fas fa-receipt mr-1"></i> Asiento
                                </button>
                              ` : `
                                <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-fob" onclick="window.triggerStageCausacion('fob')">
                                  <i class="fas fa-calculator mr-1"></i> Causar
                                </button>
                              `}
                            </div>
                            <button type="button" id="btn-fob-goto-tab" class="btn btn-outline btn-xs text-blue-700 w-full ${imp?.is_consolidated ? '' : 'hidden'}" onclick="window.switchImpStageTab('fob')">
                              <i class="fas fa-list-check mr-1"></i> Ver Detalle
                            </button>
                          </td>
                        </tr>

                        <!-- Freight Row -->
                        <tr class="hover:bg-blue-50/40 transition-colors cursor-pointer" onclick="if(!event.target.closest('button, input, select')) window.switchImpStageTab('freight')">
                          <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${imp?.tx_freight_id ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            Flete Int. <span class="text-[10px] text-slate-400 font-normal" id="lbl-freight-currency">(USD)</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <select id="imp-freight-supplier-id" class="form-input text-xs py-1" ${imp?.tx_freight_id ? 'disabled' : ''}>
                              ${getSupplierOptions(imp?.freight_supplier_id || '')}
                            </select>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="text" id="imp-freight-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.freight_invoice_num || '')}" ${imp?.tx_freight_id ? 'disabled' : ''}>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="number" id="imp-freight-cost" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.freight_cost || '0'}" step="0.01" oninput="window.impRecalcTotals(); window.checkStageAmountChange('freight')" data-original-val="${imp?.freight_cost || '0'}">
                          </td>
                          <td class="py-2.5 px-3 bg-amber-50/40">
                            <input type="number" id="imp-freight-trm" class="form-input text-xs py-1 text-right font-bold text-amber-900 bg-amber-50 border-amber-300" placeholder="TRM Flete" value="${imp?.freight_trm || imp?.freight_exchange_rate || imp?.exchange_rate || '4000.00'}" step="0.01" min="1" oninput="window.impRecalcTotals(); window.checkStageAmountChange('freight')" title="TRM específica de la factura de Flete">
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <span id="stage-freight-cop-display" class="font-mono font-bold text-slate-800 text-xs block">$ 0</span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            ${imp?.tx_freight_id ? `
                              <div class="flex flex-col gap-1 items-center">
                                <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_freight_id}')">
                                  <i class="fas fa-receipt mr-1"></i> Asiento
                                </button>
                                <button type="button" class="btn btn-warning btn-xs w-full hidden" id="btn-adjust-freight" onclick="window.triggerStageAdjustment('freight')">
                                  <i class="fas fa-pen-nib mr-1"></i> Ajustar
                                </button>
                              </div>
                            ` : `
                              <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-freight" onclick="window.triggerStageCausacion('freight')">
                                <i class="fas fa-calculator mr-1"></i> Causar
                              </button>
                            `}
                          </td>
                        </tr>

                        <!-- Insurance Row -->
                        <tr class="hover:bg-blue-50/40 transition-colors cursor-pointer" onclick="if(!event.target.closest('button, input, select')) window.switchImpStageTab('insurance')">
                          <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${imp?.tx_insurance_id ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            Seguro Int. <span class="text-[10px] text-slate-400 font-normal" id="lbl-insurance-currency">(USD)</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <select id="imp-insurance-supplier-id" class="form-input text-xs py-1" ${imp?.tx_insurance_id ? 'disabled' : ''}>
                              ${getSupplierOptions(imp?.insurance_supplier_id || '')}
                            </select>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="text" id="imp-insurance-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.insurance_invoice_num || '')}" ${imp?.tx_insurance_id ? 'disabled' : ''}>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="number" id="imp-insurance-cost" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.insurance_cost || '0'}" step="0.01" oninput="window.impRecalcTotals(); window.checkStageAmountChange('insurance')" data-original-val="${imp?.insurance_cost || '0'}">
                          </td>
                          <td class="py-2.5 px-3 bg-amber-50/40">
                            <input type="number" id="imp-insurance-trm" class="form-input text-xs py-1 text-right font-bold text-amber-900 bg-amber-50 border-amber-300" placeholder="TRM Seguro" value="${imp?.insurance_trm || imp?.insurance_exchange_rate || imp?.exchange_rate || '4000.00'}" step="0.01" min="1" oninput="window.impRecalcTotals(); window.checkStageAmountChange('insurance')" title="TRM de la póliza de Seguro">
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <span id="stage-insurance-cop-display" class="font-mono font-bold text-slate-800 text-xs block">$ 0</span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            ${imp?.tx_insurance_id ? `
                              <div class="flex flex-col gap-1 items-center">
                                <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_insurance_id}')">
                                  <i class="fas fa-receipt mr-1"></i> Asiento
                                </button>
                                <button type="button" class="btn btn-warning btn-xs w-full hidden" id="btn-adjust-insurance" onclick="window.triggerStageAdjustment('insurance')">
                                  <i class="fas fa-pen-nib mr-1"></i> Ajustar
                                </button>
                              </div>
                            ` : `
                              <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-insurance" onclick="window.triggerStageCausacion('insurance')">
                                <i class="fas fa-calculator mr-1"></i> Causar
                              </button>
                            `}
                          </td>
                        </tr>

                        <!-- Customs Row -->
                        <tr class="hover:bg-blue-50/40 transition-colors cursor-pointer" onclick="if(!event.target.closest('button, input, select')) window.switchImpStageTab('customs')">
                          <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${imp?.tx_customs_id ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            Aduana / DIAN <span class="text-[10px] text-slate-400 font-normal">(COP)</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <select id="imp-customs-supplier-id" class="form-input text-xs py-1" ${imp?.tx_customs_id ? 'disabled' : ''}>
                              ${getSupplierOptions(imp?.customs_supplier_id || '')}
                            </select>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="text" id="imp-customs-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.customs_invoice_num || '')}" ${imp?.tx_customs_id ? 'disabled' : ''}>
                          </td>
                          <td class="py-2.5 px-3">
                            <div class="flex flex-col gap-1">
                              <input type="number" id="imp-gastos-nacionalizacion" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.gastos_nacionalizacion || '0'}" oninput="window.impRecalcTotals(); window.checkStageAmountChange('customs')" data-original-val="${imp?.gastos_nacionalizacion || '0'}">
                              <div class="text-[9px] text-slate-500 text-right">Arancel: <span id="stage-customs-arancel">$ 0</span></div>
                            </div>
                          </td>
                          <td class="py-2.5 px-3 bg-amber-50/40">
                            <input type="number" id="imp-customs-trm" class="form-input text-xs py-1 text-right font-bold text-amber-900 bg-amber-50 border-amber-300" placeholder="TRM DIAN" value="${imp?.customs_trm || imp?.dian_trm || imp?.exchange_rate || '4000.00'}" step="0.01" min="1" oninput="window.impRecalcTotals(); window.checkStageAmountChange('customs')" title="TRM Oficial DIAN o del Agenciamiento Aduanero">
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <span id="stage-customs-cop-display" class="font-mono font-bold text-slate-800 text-xs block">$ 0</span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            ${imp?.tx_customs_id ? `
                              <div class="flex flex-col gap-1 items-center">
                                <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_customs_id}')">
                                  <i class="fas fa-receipt mr-1"></i> Asiento
                                </button>
                                <button type="button" class="btn btn-warning btn-xs w-full hidden" id="btn-adjust-customs" onclick="window.triggerStageAdjustment('customs')">
                                  <i class="fas fa-pen-nib mr-1"></i> Ajustar
                                </button>
                              </div>
                            ` : `
                              <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-customs" onclick="window.triggerStageCausacion('customs')">
                                <i class="fas fa-calculator mr-1"></i> Causar
                              </button>
                            `}
                          </td>
                        </tr>

                        <!-- Local Carrier Row -->
                        <tr class="hover:bg-blue-50/40 transition-colors cursor-pointer" onclick="if(!event.target.closest('button, input, select')) window.switchImpStageTab('local_carrier')">
                          <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${imp?.tx_local_carrier_id ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            Transporte Local <span class="text-[10px] text-slate-400 font-normal">(COP)</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <select id="imp-local-carrier-id" class="form-input text-xs py-1" ${imp?.tx_local_carrier_id ? 'disabled' : ''}>
                              ${getSupplierOptions(imp?.local_carrier_id || '')}
                            </select>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="text" id="imp-local-carrier-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.local_carrier_invoice_num || '')}" ${imp?.tx_local_carrier_id ? 'disabled' : ''}>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="number" id="imp-transporte-nacional" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.transporte_nacional || '0'}" oninput="window.impRecalcTotals(); window.checkStageAmountChange('local_carrier')" data-original-val="${imp?.transporte_nacional || '0'}">
                          </td>
                          <td class="py-2.5 px-3 bg-amber-50/40">
                            <input type="number" id="imp-local-carrier-trm" class="form-input text-xs py-1 text-right font-bold text-amber-900 bg-amber-50 border-amber-300" placeholder="1 o TRM" value="${imp?.local_carrier_trm || '1'}" step="0.01" min="0.01" oninput="window.impRecalcTotals(); window.checkStageAmountChange('local_carrier')" title="TRM de Transporte Local (1 si factura en COP o TRM si cotizado en USD)">
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <span id="stage-carrier-cop-display" class="font-mono font-bold text-slate-800 text-xs block">$ 0</span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            ${imp?.tx_local_carrier_id ? `
                              <div class="flex flex-col gap-1 items-center">
                                <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_local_carrier_id}')">
                                  <i class="fas fa-receipt mr-1"></i> Asiento
                                </button>
                                <button type="button" class="btn btn-warning btn-xs w-full hidden" id="btn-adjust-local_carrier" onclick="window.triggerStageAdjustment('local_carrier')">
                                  <i class="fas fa-pen-nib mr-1"></i> Ajustar
                                </button>
                              </div>
                            ` : `
                              <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-local_carrier" onclick="window.triggerStageCausacion('local_carrier')">
                                <i class="fas fa-calculator mr-1"></i> Causar
                              </button>
                            `}
                          </td>
                        </tr>

                        <!-- Local Other Row -->
                        <tr class="hover:bg-blue-50/40 transition-colors cursor-pointer" onclick="if(!event.target.closest('button, input, select')) window.switchImpStageTab('local_other')">
                          <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full ${imp?.tx_local_other_id ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
                            Otros Gastos <span class="text-[10px] text-slate-400 font-normal">(COP)</span>
                          </td>
                          <td class="py-2.5 px-3">
                            <select id="imp-local-other-supplier-id" class="form-input text-xs py-1" ${imp?.tx_local_other_id ? 'disabled' : ''}>
                              ${getSupplierOptions(imp?.local_other_supplier_id || '')}
                            </select>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="text" id="imp-local-other-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.local_other_invoice_num || '')}" ${imp?.tx_local_other_id ? 'disabled' : ''}>
                          </td>
                          <td class="py-2.5 px-3">
                            <input type="number" id="imp-otros-gastos" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.otros_gastos || '0'}" oninput="window.impRecalcTotals(); window.checkStageAmountChange('local_other')" data-original-val="${imp?.otros_gastos || '0'}">
                          </td>
                          <td class="py-2.5 px-3 bg-amber-50/40">
                            <input type="number" id="imp-local-other-trm" class="form-input text-xs py-1 text-right font-bold text-amber-900 bg-amber-50 border-amber-300" placeholder="1 o TRM" value="${imp?.local_other_trm || '1'}" step="0.01" min="0.01" oninput="window.impRecalcTotals(); window.checkStageAmountChange('local_other')" title="TRM de Otros Gastos Portuarios (1 si en COP o TRM si en USD)">
                          </td>
                          <td class="py-2.5 px-3 text-right">
                            <span id="stage-other-cop-display" class="font-mono font-bold text-slate-800 text-xs block">$ 0</span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            ${imp?.tx_local_other_id ? `
                              <div class="flex flex-col gap-1 items-center">
                                <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_local_other_id}')">
                                  <i class="fas fa-receipt mr-1"></i> Asiento
                                </button>
                                <button type="button" class="btn btn-warning btn-xs w-full hidden" id="btn-adjust-local_other" onclick="window.triggerStageAdjustment('local_other')">
                                  <i class="fas fa-pen-nib mr-1"></i> Ajustar
                                </button>
                              </div>
                            ` : `
                              <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-local_other" onclick="window.triggerStageCausacion('local_other')">
                                <i class="fas fa-calculator mr-1"></i> Causar
                              </button>
                            `}
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Resumen de Hoja de Costos (Columna Derecha) -->
                <div class="p-5 rounded-xl border flex flex-col justify-between shadow-sm bg-gradient-to-b from-blue-50/80 via-white to-blue-50/30" style="border-color:#DBEAFE">
                  <div>
                    <h5 class="font-bold text-xs text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <i class="fas fa-file-invoice-dollar text-blue-600"></i> Resumen Hoja de Costos
                    </h5>
                    
                    <div class="space-y-2.5 text-xs font-semibold">
                      <div class="flex justify-between text-slate-600 pb-1 border-b border-blue-100">
                        <span>FOB Mercancía (COP):</span>
                        <span id="lbl-res-fob-cop" class="font-mono text-slate-900">$ 0</span>
                      </div>
                      <div class="flex justify-between text-slate-600 pb-1 border-b border-blue-100">
                        <span>Gastos CIF (Flete + Seguro COP):</span>
                        <span id="lbl-res-cif-cop" class="font-mono text-slate-900">$ 0</span>
                      </div>
                      <div class="flex justify-between text-slate-600 pb-1 border-b border-blue-100">
                        <span>Arancel e Impuestos DIAN COP:</span>
                        <span id="lbl-res-arancel-cop" class="font-mono text-slate-900">$ 0</span>
                      </div>
                      <div class="flex justify-between text-slate-600 pb-1 border-b border-blue-100">
                        <span>Otros Gastos & Transporte COP:</span>
                        <span id="lbl-res-locales-cop" class="font-mono text-slate-900">$ 0</span>
                      </div>
                    </div>
                  </div>

                  <div class="border-t-2 pt-4 mt-6 border-blue-200 bg-white/60 p-3 rounded-lg">
                    <div class="flex justify-between items-baseline text-sm font-extrabold text-blue-950">
                      <span>COSTO TOTAL IMPORTACIÓN:</span>
                      <span id="lbl-res-total-cop" class="text-xl text-blue-700 font-mono">$ 0</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Panel 1: FOB Mercancía -->
            <div class="imp-stage-panel hidden" id="imp-stage-panel-fob">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <i class="fas fa-ship"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-sm text-slate-800">Etapa 1: FOB Mercancía</h5>
                        <p class="text-[11px] text-slate-400">Factura comercial y causación contable a cuentas por pagar proveedor exterior (PUC 220505)</p>
                      </div>
                    </div>
                    <span id="badge-fob-header-status" class="badge ${imp?.tx_fob_id ? 'badge-emerald text-emerald-700 bg-emerald-50' : 'badge-slate text-slate-600 bg-slate-100'} font-semibold text-xs px-2.5 py-1">
                      ${imp?.tx_fob_id ? '✓ Causado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  <!-- Vista Estándar: Proveedor Único -->
                  <div id="imp-fob-single-view" class="${imp?.is_consolidated ? 'hidden' : ''}">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label class="block font-semibold text-slate-700 mb-1">Proveedor Internacional:</label>
                        <div class="p-2 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-800" id="stage-fob-supplier-detail-name">
                          ${imp?.expand?.supplier_id ? (window as any).esc(imp.expand.supplier_id.name) : 'Definido arriba'}
                        </div>
                      </div>

                      <div>
                        <label class="block font-semibold text-slate-700 mb-1">Nro. Factura / Commercial Invoice:</label>
                        <p class="text-[11px] text-slate-400 mb-1">Edita el número en la vista general o matriz.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Vista Consolidada: Tabla de Facturas Comerciales por Proveedor -->
                  <div id="imp-fob-consolidated-view" class="${imp?.is_consolidated ? '' : 'hidden'} space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-800">Causación Individual por Factura Comercial:</span>
                      <button type="button" class="btn btn-outline btn-xs" onclick="window.impOpenInvoiceModal()">
                        <i class="fas fa-plus mr-1"></i> Nueva Factura
                      </button>
                    </div>
                    <div class="border rounded-lg overflow-hidden">
                      <table class="w-full text-xs text-left">
                        <thead class="bg-slate-50 text-slate-600 border-b">
                          <tr>
                            <th class="py-2 px-2.5">Proveedor</th>
                            <th class="py-2 px-2.5">Factura Nro.</th>
                            <th class="py-2 px-2.5">Vencimiento</th>
                            <th class="py-2 px-2.5 text-right">FOB (USD)</th>
                            <th class="py-2 px-2.5 text-right">FOB (COP)</th>
                            <th class="py-2 px-2.5 text-center">Acción Contable</th>
                          </tr>
                        </thead>
                        <tbody id="imp-fob-stage-invoices-body" class="divide-y divide-slate-100">
                          <!-- Injected by impRenderInvoicesTable -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div class="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h6 class="font-bold text-xs text-indigo-900 uppercase tracking-wider mb-2">Impacto Contable FOB</h6>
                    <p class="text-xs text-indigo-700/80 leading-relaxed">
                      El costo FOB se carga a la cuenta de <strong>Inventario en Tránsito (PUC 146505)</strong> en contrapartida de <strong>Proveedores del Exterior (PUC 220505)</strong> con programación automática en la Agenda de Pagos.
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs w-full py-2.5" onclick="window.switchImpStageTab('resumen')">
                    <i class="fas fa-arrow-left mr-1"></i> Volver a la Matriz
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel 2: Flete Internacional -->
            <div class="imp-stage-panel hidden" id="imp-stage-panel-freight">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <i class="fas fa-plane-departure"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-sm text-slate-800">Etapa 2: Flete Internacional</h5>
                        <p class="text-[11px] text-slate-400">Transporte marítimo o aéreo internacional hasta puerto/aeropuerto de entrada</p>
                      </div>
                    </div>
                    <span class="badge ${imp?.tx_freight_id ? 'badge-emerald text-emerald-700 bg-emerald-50' : 'badge-slate text-slate-600 bg-slate-100'} font-semibold text-xs px-2.5 py-1">
                      ${imp?.tx_freight_id ? '✓ Causado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  <p class="text-xs text-slate-600">
                    Introduce el proveedor logístico de flete y el monto del documento soporte. Este costo forma parte del valor <strong>CIF</strong> que incrementa la base gravable de aranceles.
                  </p>
                </div>

                <div class="p-5 bg-sky-50/50 rounded-xl border border-sky-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h6 class="font-bold text-xs text-sky-900 uppercase tracking-wider mb-2">Prorrateo de Flete</h6>
                    <p class="text-xs text-sky-800/80 leading-relaxed">
                      El flete se prorratea entre los productos según el método seleccionado (Valor FOB, Peso Bruto o Volumen CBM).
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs w-full py-2.5" onclick="window.switchImpStageTab('resumen')">
                    <i class="fas fa-arrow-left mr-1"></i> Volver a la Matriz
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel 3: Seguro Internacional -->
            <div class="imp-stage-panel hidden" id="imp-stage-panel-insurance">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <i class="fas fa-shield-alt"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-sm text-slate-800">Etapa 3: Seguro Internacional</h5>
                        <p class="text-[11px] text-slate-400">Póliza de transporte y cobertura de carga internacional</p>
                      </div>
                    </div>
                    <span class="badge ${imp?.tx_insurance_id ? 'badge-emerald text-emerald-700 bg-emerald-50' : 'badge-slate text-slate-600 bg-slate-100'} font-semibold text-xs px-2.5 py-1">
                      ${imp?.tx_insurance_id ? '✓ Causado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  <p class="text-xs text-slate-600">
                    Causa la prima de seguro emitida por la aseguradora internacional o agente de carga para la protección de la mercancía.
                  </p>
                </div>

                <div class="p-5 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h6 class="font-bold text-xs text-amber-900 uppercase tracking-wider mb-2">Cobertura CIF</h6>
                    <p class="text-xs text-amber-800/80 leading-relaxed">
                      El seguro se integra a la base CIF y se capitaliza directamente al inventario en tránsito.
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs w-full py-2.5" onclick="window.switchImpStageTab('resumen')">
                    <i class="fas fa-arrow-left mr-1"></i> Volver a la Matriz
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel 4: Aduana / DIAN -->
            <div class="imp-stage-panel hidden" id="imp-stage-panel-customs">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <i class="fas fa-building-columns"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-sm text-slate-800">Etapa 4: Nacionalización (Aduana / DIAN)</h5>
                        <p class="text-[11px] text-slate-400">Declaración de Importación, Aranceles e Impuestos aduaneros</p>
                      </div>
                    </div>
                    <span class="badge ${imp?.tx_customs_id ? 'badge-emerald text-emerald-700 bg-emerald-50' : 'badge-slate text-slate-600 bg-slate-100'} font-semibold text-xs px-2.5 py-1">
                      ${imp?.tx_customs_id ? '✓ Causado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  <p class="text-xs text-slate-600">
                    Contempla el pago de <strong>Aranceles</strong> (calculados automáticamente según posición arancelaria) más los <strong>Gastos de Agenciamiento Aduanero y Nacionalización (COP)</strong>.
                  </p>
                </div>

                <div class="p-5 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h6 class="font-bold text-xs text-purple-900 uppercase tracking-wider mb-2">Agenciamiento Aduanero</h6>
                    <p class="text-xs text-purple-800/80 leading-relaxed">
                      Genera el comprobante contable a favor de la DIAN / Agencia de Aduanas correspondiente.
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs w-full py-2.5" onclick="window.switchImpStageTab('resumen')">
                    <i class="fas fa-arrow-left mr-1"></i> Volver a la Matriz
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel 5: Transporte Local -->
            <div class="imp-stage-panel hidden" id="imp-stage-panel-local_carrier">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <i class="fas fa-truck"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-sm text-slate-800">Etapa 5: Transporte Local / Acarreos</h5>
                        <p class="text-[11px] text-slate-400">Flete terrestre desde puerto/aeropuerto hasta depósito final</p>
                      </div>
                    </div>
                    <span class="badge ${imp?.tx_local_carrier_id ? 'badge-emerald text-emerald-700 bg-emerald-50' : 'badge-slate text-slate-600 bg-slate-100'} font-semibold text-xs px-2.5 py-1">
                      ${imp?.tx_local_carrier_id ? '✓ Causado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  <p class="text-xs text-slate-600">
                    Registra la factura de transporte nacional expedida por la empresa de acarreos o transportadora local.
                  </p>
                </div>

                <div class="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h6 class="font-bold text-xs text-emerald-900 uppercase tracking-wider mb-2">Transporte Nacional</h6>
                    <p class="text-xs text-emerald-800/80 leading-relaxed">
                      Este valor se suma a la liquidación final del costo unitario nacionalizado.
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs w-full py-2.5" onclick="window.switchImpStageTab('resumen')">
                    <i class="fas fa-arrow-left mr-1"></i> Volver a la Matriz
                  </button>
                </div>
              </div>
            </div>

            <!-- Panel 6: Otros Gastos -->
            <div class="imp-stage-panel hidden" id="imp-stage-panel-local_other">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div class="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        <i class="fas fa-box"></i>
                      </div>
                      <div>
                        <h5 class="font-bold text-sm text-slate-800">Etapa 6: Otros Gastos Operativos</h5>
                        <p class="text-[11px] text-slate-400">Bodegaje, inspección de carga, manipuleos y complementarios</p>
                      </div>
                    </div>
                    <span class="badge ${imp?.tx_local_other_id ? 'badge-emerald text-emerald-700 bg-emerald-50' : 'badge-slate text-slate-600 bg-slate-100'} font-semibold text-xs px-2.5 py-1">
                      ${imp?.tx_local_other_id ? '✓ Causado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  <p class="text-xs text-slate-600">
                    Causa cualquier costo logístico adicional en puerto o zona franca (almacenamiento, estibado, inspección física).
                  </p>
                </div>

                <div class="p-5 bg-orange-50/50 rounded-xl border border-orange-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h6 class="font-bold text-xs text-orange-900 uppercase tracking-wider mb-2">Gastos Portuarios</h6>
                    <p class="text-xs text-orange-800/80 leading-relaxed">
                      Se prorratea en la hoja de costos garantizando la precisión del costo real ingresado a inventario.
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary text-xs w-full py-2.5" onclick="window.switchImpStageTab('resumen')">
                    <i class="fas fa-arrow-left mr-1"></i> Volver a la Matriz
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        `;
      })()}
      
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-import"><i class="fas fa-floppy-disk"></i> Guardar Borrador</button>
  `;

  (window as any).openModal(importId ? 'Editar Importación' : 'Nueva Importación', formHtml, footer, true);

  // Autocomplete de proveedores
  function initImpSupplierSearch() {
    const input = document.getElementById('imp-supplier-search') as HTMLInputElement;
    const hidden = document.getElementById('imp-supplier-id') as HTMLInputElement;
    const results = document.getElementById('imp-supplier-results');
    if (!input || !hidden || !results) return;

    if (imp && imp.supplier_id) {
      const match = suppliers.find((s: any) => s.id === imp.supplier_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query 
        ? suppliers.slice(0, 30) 
        : suppliers.filter((s: any) => `${s.name} ${s.doc_number} ${s.nit}`.toLowerCase().includes(query)).slice(0, 30);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((s: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window.selectImpSupplier('${(window as any).esc(s.id)}', '${(window as any).esc(s.doc_number || s.nit || '')} - ${(window as any).esc(s.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(s.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${s.doc_number || s.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    (window as any).initKeyboardAutocomplete({
      input,
      results,
      itemSelector: 'button',
    });
  }

  (window as any).selectImpSupplier = function(id: string, text: string) {
    const hidden = document.getElementById('imp-supplier-id') as HTMLInputElement;
    const input = document.getElementById('imp-supplier-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
      // Actualizar nombre del proveedor FOB en la tabla de etapas
      const stageFobSupplier = document.getElementById('stage-fob-supplier-name');
      if (stageFobSupplier) {
        const nameOnly = text.split(' - ').pop() || '';
        stageFobSupplier.textContent = nameOnly;
      }
    }
  };

  (window as any).impHandleFileSelect = function(key: string, files: FileList | null) {
    if (!files || !files.length) return;
    const file = files[0];
    currentUploadedFiles[key] = file;
    
    if (key === 'bl_document') {
      const lbl = document.getElementById('lbl-bl-document');
      const status = document.getElementById('file-bl-status');
      if (lbl) lbl.textContent = 'Archivo seleccionado';
      if (status) status.textContent = `📄 ${file.name} (${Math.round(file.size / 1024)} KB)`;
    } else if (key.startsWith('manifest_file_')) {
      const idx = key.split('_').pop();
      const lbl = document.getElementById(`lbl-manifest-${idx}`);
      if (lbl) lbl.textContent = `✓ ${file.name.slice(0, 12)}...`;
    }
  };

  initImpSupplierSearch();

  // Verificación y actualización en tiempo real de cuenta PUC de tránsito
  (window as any).impUpdateTransitAccountInfo = async function() {
    const numberInput = document.getElementById('imp-number') as HTMLInputElement;
    const statusDiv = document.getElementById('imp-puc-transit-status');
    if (!numberInput || !statusDiv) return;

    const numVal = numberInput.value.trim();
    if (!numVal) {
      statusDiv.innerHTML = `<span class="text-gray-400">Ingresa un número de importación para verificar la cuenta PUC</span>`;
      return;
    }

    try {
      const cfg = await (window as any).API.getImportConfig();
      const baseCode = cfg.accounting?.accounts?.transito_account_code || '146505';
      const expectedCode = (window as any).API.getImportTransitAccountCode(baseCode, numVal);

      const safeCode = (window as any).pb.escapeFilterValue(expectedCode);
      const res = await (window as any).pb.list('accounts', { filter: `code="${safeCode}"`, perPage: 1 });

      if (res.items && res.items.length) {
        statusDiv.innerHTML = `<span class="text-green-700 font-bold"><i class="fas fa-circle-check mr-1"></i>Cuenta PUC Tránsito: <span class="font-mono">${expectedCode}</span> — ${res.items[0].name || 'Mercancías en Tránsito'} (Existe ✓)</span>`;
      } else {
        statusDiv.innerHTML = `<span class="text-amber-700 font-bold"><i class="fas fa-triangle-exclamation mr-1"></i>Cuenta PUC Tránsito: <span class="font-mono">${expectedCode}</span> (⚠️ No creada en el PUC. Debes crearla en Cuentas)</span>`;
      }
    } catch (_) {
      statusDiv.innerHTML = '';
    }
  };

  (window as any).impAutoSuggestNumber = async function() {
    try {
      const numberInput = document.getElementById('imp-number') as HTMLInputElement;
      if (numberInput) {
        const next = await (window as any).API.nextImportConsecutive();
        numberInput.value = next;
        (window as any).impUpdateTransitAccountInfo();
      }
    } catch (err: any) {
      (window as any).showToast('Error generando consecutivo: ' + err.message, 'error');
    }
  };

  // Descargar plantilla Excel de ejemplo
  (window as any).impDownloadExcelTemplate = function() {
    if (typeof (window as any).XLSX === 'undefined') {
      (window as any).showToast('La librería de Excel (XLSX) no está cargada.', 'error');
      return;
    }
    const sampleData = [
      {
        "Codigo": "PROD-001",
        "Producto": "Televisor Smart LED 55",
        "Cantidad": 160,
        "Precio_FOB": 350.00,
        "Arancel_Pct": 10,
        "IVA_Pct": 19,
        "Nro_Manifiesto": "2026-MAN-001",
        "Factura_Comercial": "INV-US-8921",
        "Lote": "LOT-2026A",
        "Fecha_Fabricacion": "2026-01-15",
        "Fecha_Vencimiento": "2028-01-15",
        "Pallets_Cant": 10,
        "Cajas_Por_Pallet": 16,
        "Unidades_Por_Caja": 1
      },
      {
        "Codigo": "PROD-002",
        "Producto": "Monitor Gamer 27 144Hz",
        "Cantidad": 48,
        "Precio_FOB": 185.50,
        "Arancel_Pct": 5,
        "IVA_Pct": 19,
        "Nro_Manifiesto": "2026-MAN-002",
        "Factura_Comercial": "INV-HK-5510",
        "Lote": "LOT-2026B",
        "Fecha_Fabricacion": "2026-02-01",
        "Fecha_Vencimiento": "2028-02-01",
        "Pallets_Cant": 2,
        "Cajas_Por_Pallet": 24,
        "Unidades_Por_Caja": 1
      }
    ];
    const ws = (window as any).XLSX.utils.json_to_sheet(sampleData);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Productos Importacion");
    (window as any).XLSX.writeFile(wb, "Plantilla_Importacion_Productos.xlsx");
    (window as any).showToast('Plantilla Excel descargada con soporte de lotes y pallets.', 'success');
  };

  // Carga masiva de líneas desde Excel / CSV
  (window as any).impHandleExcelImport = function(files: FileList | null) {
    if (!files || !files.length) return;
    if (typeof (window as any).XLSX === 'undefined') {
      (window as any).showToast('La librería de Excel (XLSX) no está cargada.', 'error');
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function(e: any) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = (window as any).XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows: any[] = (window as any).XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows.length) {
          throw new Error('El archivo Excel no contiene filas de datos.');
        }

        let loadedCount = 0;
        let unmatchedCount = 0;
        const unmatchedNames: string[] = [];

        jsonRows.forEach((row: any) => {
          const getVal = (keys: string[]): any => {
            const rowKeys = Object.keys(row);
            for (const k of rowKeys) {
              const cleanK = k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
              for (const target of keys) {
                if (cleanK === target || cleanK.includes(target)) {
                  return row[k];
                }
              }
            }
            return '';
          };

          const rawCode = String(getVal(['codigo', 'code', 'ref', 'referencia', 'ean'])).trim();
          const rawName = String(getVal(['producto', 'nombre', 'item', 'descripcion'])).trim();
          const rawQty = parseFloat(String(getVal(['cantidad', 'cant', 'qty', 'unidades'])).replace(/,/g, '.')) || 0;
          const fobPrice = parseFloat(String(getVal(['precio_fob', 'precio fob', 'precio', 'fob', 'costo', 'price'])).replace(/,/g, '.')) || 0;
          const arancelRate = parseFloat(String(getVal(['arancel_pct', 'arancel %', 'arancel', 'arancel_rate'])).replace(/,/g, '.')) || 0;
          const ivaRate = parseFloat(String(getVal(['iva_pct', 'iva %', 'iva', 'iva_rate'])).replace(/,/g, '.')) || 19;
          const manifestNumber = String(getVal(['nro_manifiesto', 'manifiesto', 'manifest'])).trim();

          const lotNumber = String(getVal(['lote', 'lot', 'batch', 'nro_lote'])).trim();
          const mfgDate = String(getVal(['fecha_fabricacion', 'fabricacion', 'mfg', 'mfg_date'])).trim();
          const expDate = String(getVal(['fecha_vencimiento', 'vencimiento', 'exp', 'expiry_date'])).trim();
          const invoiceNumber = String(getVal(['factura_comercial', 'factura', 'invoice', 'invoice_num'])).trim();

          const palletsCant = parseFloat(String(getVal(['pallets_cant', 'pallets', 'estibas', 'cant_pallets'])).replace(/,/g, '.')) || 0;
          const cajasPorPallet = parseFloat(String(getVal(['cajas_por_pallet', 'cajas_pallet', 'cajas_estiba'])).replace(/,/g, '.')) || 0;
          const unidadesPorCaja = parseFloat(String(getVal(['unidades_por_caja', 'unidades_caja', 'units_box'])).replace(/,/g, '.')) || 1;

          let computedQty = rawQty;
          if (palletsCant > 0 && cajasPorPallet > 0) {
            computedQty = palletsCant * cajasPorPallet * unidadesPorCaja;
          }

          let match = null;
          if (rawCode) {
            const cleanSearchCode = rawCode.toLowerCase();
            match = products.find((p: any) =>
              (p.code && p.code.toLowerCase() === cleanSearchCode) ||
              (p.ean_code && p.ean_code.toLowerCase() === cleanSearchCode)
            );
          }

          if (!match && rawName) {
            const cleanSearchName = rawName.toLowerCase();
            match = products.find((p: any) => p.name && p.name.toLowerCase() === cleanSearchName);
          }

          if (match) {
            // Find invoice if specified
            let matchedInvoiceId = '';
            if (invoiceNumber && localInvoices.length) {
              const matchedInv = localInvoices.find((i: any) => i.invoice_number?.toLowerCase() === invoiceNumber.toLowerCase());
              if (matchedInv) matchedInvoiceId = matchedInv.id;
            }

            const lineData: any = {
              product_id: match.id,
              qty: computedQty > 0 ? computedQty : 1,
              fob_price: fobPrice >= 0 ? fobPrice : 0,
              arancel_rate: arancelRate >= 0 ? arancelRate : (match.arancel_rate_default ?? match.arancel_rate ?? 10),
              iva_rate: ivaRate >= 0 ? ivaRate : (match.iva_rate ?? 19),
              manifest_number: manifestNumber,
              lot_number: lotNumber || null,
              manufacturing_date: mfgDate || null,
              expiry_date: expDate || null,
              import_invoice_id: matchedInvoiceId || null,
            };

            (window as any).addImpLine(match, lineData);
            const currentLineIdx = lineCounter;

            // If pallet info was in Excel, save config
            if (palletsCant > 0 && cajasPorPallet > 0) {
              localPalletConfigs[currentLineIdx] = [{
                pallet_qty: palletsCant,
                boxes_per_pallet: cajasPorPallet,
                units_per_box: unidadesPorCaja,
                pallet_type: 'ESTANDAR_120x100',
                height_cm: 150,
                gross_weight_kg: 200,
                lot_number: lotNumber || null
              }];
              const lbl = document.getElementById(`lbl-pallet-${currentLineIdx}`);
              if (lbl) lbl.textContent = `${palletsCant} plts (${palletsCant * cajasPorPallet} cjs)`;
            }

            loadedCount++;
          } else if (rawCode || rawName) {
            unmatchedCount++;
            unmatchedNames.push(rawCode || rawName);
          }
        });

        const fileInput = document.getElementById('file-import-excel') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        if (loadedCount > 0) {
          (window as any).showToast(`Se cargaron ${loadedCount} productos correctamente desde el archivo Excel.`, 'success');
        }

        if (unmatchedCount > 0) {
          setTimeout(() => {
            (window as any).showToast(`⚠️ ${unmatchedCount} ítems no se encontraron en el catálogo de productos: ${unmatchedNames.slice(0, 3).join(', ')}${unmatchedNames.length > 3 ? '...' : ''}`, 'warning');
          }, 1000);
        }

      } catch (err: any) {
        (window as any).showToast('Error leyendo archivo Excel: ' + err.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Cambiar etiquetas dinámicas según divisa
  (window as any).impUpdateCurrencyLabel = function() {
    const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const thFobPrice = document.getElementById('lbl-th-fob-price');
    const lblFobCurrency = document.getElementById('lbl-fob-currency');
    const lblFreightCurrency = document.getElementById('lbl-freight-currency');
    const lblInsuranceCurrency = document.getElementById('lbl-insurance-currency');

    if (thFobPrice) thFobPrice.textContent = `P. FOB (${currency})`;
    if (lblFobCurrency) lblFobCurrency.textContent = `(${currency})`;
    if (lblFreightCurrency) lblFreightCurrency.textContent = `(${currency})`;
    if (lblInsuranceCurrency) lblInsuranceCurrency.textContent = `(${currency})`;

    (window as any).impRecalcTotals();
  };

  // Replicar TRM general a los rubros que la requieran
  (window as any).impSyncGeneralTrmToStages = function() {
    const baseTrm = (document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value;
    if (!baseTrm) return;
    const fTrm = document.getElementById('imp-freight-trm') as HTMLInputElement;
    const iTrm = document.getElementById('imp-insurance-trm') as HTMLInputElement;
    const cTrm = document.getElementById('imp-customs-trm') as HTMLInputElement;
    const dianTrm = document.getElementById('imp-dian-trm') as HTMLInputElement;
    const stageFobTrm = document.getElementById('imp-stage-fob-trm') as HTMLInputElement;
    if (fTrm) fTrm.value = baseTrm;
    if (iTrm) iTrm.value = baseTrm;
    if (cTrm) cTrm.value = baseTrm;
    if (dianTrm && !dianTrm.value) dianTrm.value = baseTrm;
    if (stageFobTrm) stageFobTrm.value = baseTrm;
    (window as any).impRecalcTotals();
    (window as any).showToast('TRM base replicada a rubros de flete, seguro y aduana.', 'info');
  };

  // Helpers para control de Lotes en línea
  (window as any).impToggleLotFields = function(idx: number) {
    const wrap = document.getElementById(`wrap-lot-fields-${idx}`);
    if (wrap) {
      wrap.classList.toggle('hidden');
      if (!wrap.classList.contains('hidden')) {
        const lotInput = document.getElementById(`impl-lot-${idx}`) as HTMLInputElement;
        lotInput?.focus();
      }
    }
  };

  (window as any).impUpdateLotLabel = function(idx: number) {
    const lotInput = document.getElementById(`impl-lot-${idx}`) as HTMLInputElement;
    const btn = document.getElementById(`btn-toggle-lot-${idx}`);
    const lbl = document.getElementById(`lbl-lot-btn-${idx}`);
    if (lotInput && btn && lbl) {
      const val = lotInput.value.trim();
      if (val) {
        lbl.textContent = `Lote: ${val}`;
        btn.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-300', 'font-bold');
        btn.classList.remove('text-gray-600');
      } else {
        lbl.textContent = '+ Lote';
        btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-300', 'font-bold');
        btn.classList.add('text-gray-600');
      }
    }
  };

  // Helper para verificar concordancia entre estibas y cantidad del ítem
  (window as any).impUpdateLinePalletStatus = function(idx: number) {
    const tr = document.getElementById(`imp-row-${idx}`);
    if (!tr) return;
    const qtyInput = document.getElementById(`impl-qty-${idx}`) as HTMLInputElement;
    const currentQty = parseFloat(qtyInput?.value || '0');
    const unit = tr.getAttribute('data-prod-unit') || 'UND';
    const btn = document.getElementById(`btn-pallet-${idx}`);
    const lbl = document.getElementById(`lbl-pallet-${idx}`);
    if (!btn || !lbl) return;

    const pcs = localPalletConfigs[idx];
    if (pcs && pcs.length) {
      const sumPlts = pcs.reduce((s: number, p: any) => s + (Number(p.pallet_qty) || 0), 0);
      const sumUnits = pcs.reduce((s: number, p: any) => s + ((Number(p.pallet_qty) || 0) * (Number(p.boxes_per_pallet) || 0) * (Number(p.units_per_box) || 1)), 0);
      
      if (Math.abs(sumUnits - currentQty) < 0.001) {
        lbl.textContent = `${sumPlts} plts (${sumUnits} ${unit}) ✓`;
        btn.className = 'btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
        btn.title = `Estibas cuadradas: ${sumPlts} pallets con ${sumUnits} ${unit}`;
      } else {
        lbl.textContent = `${sumPlts} plts (${sumUnits}/${currentQty} ${unit}) ⚠️`;
        btn.className = 'btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md bg-amber-50 text-amber-800 border-amber-300 font-bold';
        btn.title = `Descuadre en estibas: ${sumUnits} ${unit} estibadas vs ${currentQty} ${unit} en ítem`;
      }
    } else {
      lbl.textContent = `Estibas (${unit})`;
      btn.className = 'btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md text-gray-600 hover:text-blue-700';
      btn.title = `Configurar estibas para las ${currentQty} ${unit}`;
    }
  };

  // Agregar línea de artículo
  (window as any).addImpLine = function(prod: any = null, preloadedLine: any = null) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('imp-lines-body');
    if (!tbody) return;

    const productId = prod?.id || preloadedLine?.product_id || '';
    const productObj = prod || products.find((p: any) => p.id === productId) || preloadedLine?.expand?.product_id;
    const productCode = productObj?.code || prod?.code || preloadedLine?._code || '';
    const productName = productObj?.name || prod?.name || preloadedLine?._name || '(producto)';
    const prodUnit = productObj?.unit || preloadedLine?.unit || 'UND';
    const prodCajasPallet = Number(productObj?.cajas_en_pallet) || 0;
    const prodUndEmpaque = Number(productObj?.und_empaque) || 1;
    const initQty = preloadedLine?.qty ?? 1;

    // Sugerir FOB price en la divisa elegida
    let initPrice = 0;
    if (preloadedLine) {
      initPrice = preloadedLine.fob_price ?? 0;
    } else if (productObj) {
      const refPrice = productObj.cost_price || 0;
      const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
      const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');
      if (currency !== 'COP' && refPrice > 0) {
        initPrice = parseFloat((refPrice / exchangeRate).toFixed(2));
      } else {
        initPrice = refPrice;
      }
    }

    const initArancel = preloadedLine?.arancel_rate ?? productObj?.arancel_rate_default ?? productObj?.arancel_rate ?? 10;
    const initIva = preloadedLine?.iva_rate ?? productObj?.iva_rate ?? 19;
    const manifestNum = preloadedLine?.manifest_number || '';
    const manifestFile = preloadedLine?.manifest_file || '';
    const lineId = preloadedLine?.id || '';

    const baseNetWeight = productObj?.peso_neto ?? 0;
    const baseGrossWeight = productObj?.peso_bruto ?? 0;
    const baseLargoCm = preloadedLine?.largo_cm ?? productObj?.largo_cm ?? 0;
    const baseAnchoCm = preloadedLine?.ancho_cm ?? productObj?.ancho_cm ?? 0;
    const baseAltoCm = preloadedLine?.alto_cm ?? productObj?.alto_cm ?? 0;

    const isConsolidated = (document.getElementById('imp-is-consolidated') as HTMLInputElement)?.checked;

    // Preload pallet configs if exists
    const existingPcs = (lineId && localPalletConfigs[lineId]) || (productId && localPalletConfigs[productId]) || [];
    if (existingPcs.length && !localPalletConfigs[idx]) {
      localPalletConfigs[idx] = JSON.parse(JSON.stringify(existingPcs));
    }

    const tr = document.createElement('tr');
    tr.id = `imp-row-${idx}`;
    tr.setAttribute('data-lineid', lineId);
    tr.setAttribute('data-prod-unit', prodUnit);
    tr.setAttribute('data-prod-cajas-pallet', String(prodCajasPallet));
    tr.setAttribute('data-prod-und-empaque', String(prodUndEmpaque));
    tr.setAttribute('data-base-peso-neto', String(baseNetWeight));
    tr.setAttribute('data-base-peso-bruto', String(baseGrossWeight));
    tr.setAttribute('data-base-largo-cm', String(baseLargoCm));
    tr.setAttribute('data-base-ancho-cm', String(baseAnchoCm));
    tr.setAttribute('data-base-alto-cm', String(baseAltoCm));
    
    tr.innerHTML = `
      <td>
        <div class="flex flex-col">
          <div class="flex items-center gap-1 flex-wrap">
            <span class="text-[10px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(productCode || 'S/C')}]</span>
            <span class="text-xs font-semibold text-gray-800 truncate" style="max-width:200px" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
            ${productObj?.visto_bueno_required ? `
              <span class="badge badge-red text-[9px] py-0.5 px-1.5 ml-1 animate-pulse" style="font-size:9px" title="Requiere Visto Bueno ante ${productObj.visto_bueno_entidad} - Registro: ${productObj.registro_sanitario || 'Sin Registro'}">⚠️ V.B. ${productObj.visto_bueno_entidad}</span>
            ` : ''}
          </div>

          <!-- Metadatos técnicos (Posición arancelaria, certificado, país) -->
          <div class="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
            ${(preloadedLine?.posicion_arancelaria || productObj?.posicion_arancelaria) ? `<span>Pos: <span class="font-mono text-slate-700">${(window as any).esc(preloadedLine?.posicion_arancelaria || productObj?.posicion_arancelaria)}</span></span>` : ''}
            ${preloadedLine?.pais_origen ? `<span>Origen: ${(window as any).esc(preloadedLine.pais_origen)}</span>` : ''}
          </div>

          <!-- Barra de controles compactos para Lotes y Estibas -->
          <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <button type="button" class="btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md ${preloadedLine?.lot_number ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold' : 'text-gray-600 hover:text-blue-700'}" id="btn-toggle-lot-${idx}" onclick="window.impToggleLotFields(${idx})" title="Gestionar lote de fabricación y fecha de vencimiento">
              <i class="fas fa-barcode mr-1 text-indigo-500"></i><span id="lbl-lot-btn-${idx}">${preloadedLine?.lot_number ? `Lote: ${(window as any).esc(preloadedLine.lot_number)}` : '+ Lote'}</span>
            </button>

            <button type="button" class="btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md text-gray-600 hover:text-blue-700" id="btn-pallet-${idx}" onclick="window.impOpenPalletModal(${idx})" title="Configurar desglose por pallets/estibas para las ${initQty} ${prodUnit}">
              <i class="fas fa-boxes-stacked text-blue-600 mr-1"></i><span id="lbl-pallet-${idx}">Estibas (${(window as any).esc(prodUnit)})</span>
            </button>
          </div>

          <!-- Micro-formulario expandible de lote -->
          <div id="wrap-lot-fields-${idx}" class="${preloadedLine?.lot_number ? '' : 'hidden'} mt-1.5 p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-1">
            <div class="flex items-center gap-1">
              <span class="text-[9px] text-indigo-900 font-bold uppercase w-9 flex-shrink-0">Lote:</span>
              <input type="text" id="impl-lot-${idx}" class="form-input font-mono text-[10px] py-0.5 px-1.5 h-6 flex-1 bg-white" placeholder="Nro Lote..." value="${(window as any).esc(preloadedLine?.lot_number || '')}" oninput="window.impUpdateLotLabel(${idx})">
            </div>
            <div class="grid grid-cols-2 gap-1 text-[9px]">
              <div>
                <span class="text-[8px] text-gray-500 uppercase block">Fabr.</span>
                <input type="date" id="impl-mfg-${idx}" class="form-input text-[9px] p-0.5 h-6 bg-white" value="${preloadedLine?.manufacturing_date ? preloadedLine.manufacturing_date.split(' ')[0] : ''}">
              </div>
              <div>
                <span class="text-[8px] text-gray-500 uppercase block">Venc.</span>
                <input type="date" id="impl-exp-${idx}" class="form-input text-[9px] p-0.5 h-6 bg-white" value="${preloadedLine?.expiry_date ? preloadedLine.expiry_date.split(' ')[0] : ''}">
              </div>
            </div>
          </div>

          <input type="hidden" id="impl-prod-id-${idx}" value="${(window as any).esc(productId)}">

          <!-- Campos técnicos ocultos (prorrateo/cumplimiento) -->
          <input type="hidden" id="impl-pos-arancel-${idx}" value="${(window as any).esc(preloadedLine?.posicion_arancelaria || productObj?.posicion_arancelaria || '')}">
          <input type="hidden" id="impl-pais-origen-${idx}" value="${(window as any).esc(preloadedLine?.pais_origen || productObj?.pais_origen || '')}">
          <input type="hidden" id="impl-cert-origen-${idx}" value="${(window as any).esc(preloadedLine?.certificado_origen_num || '')}">
          <input type="hidden" id="impl-peso-neto-${idx}" value="${preloadedLine?.peso_neto_total ?? (productObj?.peso_neto ? (productObj.peso_neto * initQty).toFixed(2) : '0.00')}">
          <input type="hidden" id="impl-peso-bruto-${idx}" value="${preloadedLine?.peso_bruto_total ?? (productObj?.peso_bruto ? (productObj.peso_bruto * initQty).toFixed(2) : '0.00')}">
          <input type="hidden" id="impl-largo-cm-${idx}" value="${baseLargoCm}">
          <input type="hidden" id="impl-ancho-cm-${idx}" value="${baseAnchoCm}">
          <input type="hidden" id="impl-alto-cm-${idx}" value="${baseAltoCm}">
          <input type="hidden" id="impl-cbm-${idx}" value="${preloadedLine?.cubic_meters_total ?? '0.0000'}">
        </div>
      </td>

      <!-- Columna Proveedor / Factura Consolidada -->
      <td class="col-consolidated-td ${isConsolidated ? '' : 'hidden'}">
        <select id="impl-invoice-${idx}" class="form-input text-xs py-1" onchange="window.impOnLineInvoiceChange(${idx})">
          <option value="">— Seleccionar Factura —</option>
          ${localInvoices.map((inv: any) => `
            <option value="${inv.id}" ${inv.id === (preloadedLine?.import_invoice_id || '') ? 'selected' : ''}>
              ${(window as any).esc(inv.invoice_number)} (${(window as any).esc(inv.expand?.supplier_id?.name || inv.expand?.third_party_id?.name || 'Prov.')})
            </option>
          `).join('')}
        </select>
        <input type="hidden" id="impl-supplier-${idx}" value="${preloadedLine?.supplier_id || ''}">
      </td>

      <!-- Cantidad Total con Unidad de Medida Integrada -->
      <td>
        <div class="relative flex items-center">
          <input type="number" id="impl-qty-${idx}" class="form-input text-right w-full font-bold font-mono" style="font-size:13px;height:34px;padding:0 30px 0 8px" min="0.001" step="0.001" value="${initQty}" oninput="window.impRecalcTotals(); window.impUpdateLinePalletStatus(${idx});">
          <span class="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none uppercase" title="Unidad: ${(window as any).esc(prodUnit)}">${(window as any).esc(prodUnit)}</span>
        </div>
      </td>
      <td><input type="number" id="impl-price-${idx}" class="form-input text-right w-full font-semibold font-mono" style="font-size:13px;height:34px;padding:0 8px" min="0" step="0.01" value="${initPrice || ''}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-arancel-${idx}" class="form-input text-right w-full font-semibold font-mono" style="font-size:13px;height:34px;padding:0 8px" min="0" max="100" step="0.1" value="${initArancel}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-iva-${idx}" class="form-input text-right w-full font-semibold font-mono" style="font-size:13px;height:34px;padding:0 8px" min="0" max="100" step="1" value="${initIva}" oninput="window.impRecalcTotals()"></td>
      <td><input type="text" id="impl-manifest-num-${idx}" class="form-input w-full font-mono text-xs" style="height:32px" placeholder="Ej: 260500..." value="${(window as any).esc(manifestNum)}"></td>
      <td>
        <div class="flex items-center gap-1.5">
          <input type="file" id="file-manifest-${idx}" accept="application/pdf,image/*" style="display:none" onchange="window.impHandleFileSelect('manifest_file_${idx - 1}', this.files)">
          <button type="button" class="btn btn-outline btn-sm w-full py-1 text-xs" style="height:32px" onclick="document.getElementById('file-manifest-${idx}').click()">
            <i class="fas fa-upload"></i> <span id="lbl-manifest-${idx - 1}">${manifestFile ? 'Reemplazar' : 'Adjuntar PDF'}</span>
          </button>
          ${manifestFile ? `
            <a href="${(window as any).PB_URL}/api/files/import_lines/${lineId}/${manifestFile}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="btn btn-outline btn-sm p-1.5 text-blue-600" title="Ver manifiesto actual">
              <i class="fas fa-file-pdf"></i>
            </a>
          ` : ''}
        </div>
      </td>
      <td class="text-right font-semibold" style="color:#4B5563;font-size:13px" id="impl-unit-cop-${idx}">$ 0</td>
      <td class="text-right font-bold text-blue-700" style="font-size:13px" id="impl-total-cop-${idx}">$ 0</td>
      <td class="text-center">
        <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('imp-row-${idx}').remove(); window.impRecalcTotals();" title="Quitar línea"><i class="fas fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    // Initial label and reconciliation check for pallets
    (window as any).impUpdateLinePalletStatus(idx);

    (window as any).impRecalcTotals();
  };

  (window as any).impRecalcTotals = function() {
    const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
    const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const freightCost = parseFloat((document.getElementById('imp-freight-cost') as HTMLInputElement)?.value || '0');
    const insuranceCost = parseFloat((document.getElementById('imp-insurance-cost') as HTMLInputElement)?.value || '0');
    const gastosNacionalizacion = parseFloat((document.getElementById('imp-gastos-nacionalizacion') as HTMLInputElement)?.value || '0');
    const transporteNacional = parseFloat((document.getElementById('imp-transporte-nacional') as HTMLInputElement)?.value || '0');
    const otrosGastos = parseFloat((document.getElementById('imp-otros-gastos') as HTMLInputElement)?.value || '0');
    const prorationMethod = (document.getElementById('imp-proration-method') as HTMLSelectElement)?.value || 'FOB_VALUE';
    const isConsolidated = (document.getElementById('imp-is-consolidated') as HTMLInputElement)?.checked;

    // TRM específicas por cada rubro
    const freightTrm = parseFloat((document.getElementById('imp-freight-trm') as HTMLInputElement)?.value) || exchangeRate;
    const insuranceTrm = parseFloat((document.getElementById('imp-insurance-trm') as HTMLInputElement)?.value) || exchangeRate;
    const customsTrm = parseFloat((document.getElementById('imp-customs-trm') as HTMLInputElement)?.value) || exchangeRate;
    const localCarrierTrm = parseFloat((document.getElementById('imp-local-carrier-trm') as HTMLInputElement)?.value) || 1;
    const localOtherTrm = parseFloat((document.getElementById('imp-local-other-trm') as HTMLInputElement)?.value) || 1;

    // Conversión a COP con TRM individual de cada rubro
    const freightCostCOP = freightCost * freightTrm;
    const insuranceCostCOP = insuranceCost * insuranceTrm;
    const totalCIFExpensesCOP = freightCostCOP + insuranceCostCOP;

    const gastosNacCOP = gastosNacionalizacion;
    const transporteCOP = transporteNacional * localCarrierTrm;
    const otrosGastosCOP = otrosGastos * localOtherTrm;
    const totalLocalExpensesCOP = gastosNacCOP + transporteCOP + otrosGastosCOP;

    const totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

    let totalFOB = 0;
    let totalWeight = 0;
    let totalVolume = 0;

    // Reset computed FOB on localInvoices if in consolidated mode
    if (isConsolidated) {
      localInvoices.forEach(inv => { inv._computed_fob = 0; });
    }
    
    // First pass: update weights if not overridden, and calculate totals
    const rows = document.querySelectorAll('#imp-lines-body tr');
    rows.forEach((tr: any) => {
      const idx = tr.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
      const largoCm = parseFloat((document.getElementById(`impl-largo-cm-${idx}`) as HTMLInputElement)?.value || '0');
      const anchoCm = parseFloat((document.getElementById(`impl-ancho-cm-${idx}`) as HTMLInputElement)?.value || '0');
      const altoCm = parseFloat((document.getElementById(`impl-alto-cm-${idx}`) as HTMLInputElement)?.value || '0');
      
      // Update weights dynamically if not overridden
      const baseNet = parseFloat(tr.getAttribute('data-base-peso-neto') || '0');
      const baseGross = parseFloat(tr.getAttribute('data-base-peso-bruto') || '0');
      const netInput = document.getElementById(`impl-peso-neto-${idx}`) as HTMLInputElement;
      const grossInput = document.getElementById(`impl-peso-bruto-${idx}`) as HTMLInputElement;
      
      if (netInput && baseNet > 0 && netInput.dataset.overridden !== 'true') {
        netInput.value = (baseNet * qty).toFixed(2);
      }
      if (grossInput && baseGross > 0 && grossInput.dataset.overridden !== 'true') {
        grossInput.value = (baseGross * qty).toFixed(2);
      }

      const pesoBrutoLine = parseFloat(grossInput?.value || '0');
      const lineCbm = (largoCm > 0 && anchoCm > 0 && altoCm > 0 && qty > 0)
        ? ((largoCm * anchoCm * altoCm * qty) / 1000000)
        : 0;

      const cbmInput = document.getElementById(`impl-cbm-${idx}`) as HTMLInputElement;
      if (cbmInput && cbmInput.value === '0.0000' && lineCbm > 0) {
        cbmInput.value = lineCbm.toFixed(4);
      }

      const activeCbm = parseFloat(cbmInput?.value || '0') || lineCbm;

      totalFOB += (qty * price);
      totalWeight += pesoBrutoLine;
      totalVolume += activeCbm;

      // Consolidate line FOB into its commercial invoice
      if (isConsolidated) {
        const invSelect = document.getElementById(`impl-invoice-${idx}`) as HTMLSelectElement;
        const invId = invSelect?.value;
        if (invId) {
          const invObj = localInvoices.find(i => i.id === invId);
          if (invObj) {
            invObj._computed_fob = (invObj._computed_fob || 0) + (qty * price);
          }
        }
      }
    });

    const totalFOBCop = totalFOB * exchangeRate;
    let arancelTotalCOP = 0;

    // Second pass: distribute costs and update line totals
    rows.forEach((tr: any) => {
      const idx = tr.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
      const arancelRate = parseFloat((document.getElementById(`impl-arancel-${idx}`) as HTMLInputElement)?.value || '0');
      const grossInput = document.getElementById(`impl-peso-bruto-${idx}`) as HTMLInputElement;
      const pesoBrutoLine = parseFloat(grossInput?.value || '0');
      const lineCbm = parseFloat((document.getElementById(`impl-cbm-${idx}`) as HTMLInputElement)?.value || '0');

      const lineFOBCop = qty * price * exchangeRate;
      
      let factor = 0;
      if (prorationMethod === 'GROSS_WEIGHT' && totalWeight > 0) {
        factor = pesoBrutoLine / totalWeight;
      } else if (prorationMethod === 'CUBIC_VOLUME' && totalVolume > 0) {
        factor = lineCbm / totalVolume;
      } else if (totalFOBCop > 0) {
        factor = lineFOBCop / totalFOBCop;
      }

      const proratedCost = factor * totalExpensesToProrateCOP;
      const arancelAmount = lineFOBCop * (arancelRate / 100);
      const lineTotalCOP = lineFOBCop + proratedCost + arancelAmount;
      const unitCostCOP = qty > 0 ? (lineTotalCOP / qty) : 0;

      arancelTotalCOP += arancelAmount;

      // Update line labels
      const unitLabel = document.getElementById(`impl-unit-cop-${idx}`);
      const totalLabel = document.getElementById(`impl-total-cop-${idx}`);
      if (unitLabel) unitLabel.textContent = (window as any).fmt(unitCostCOP);
      if (totalLabel) totalLabel.textContent = (window as any).fmt(lineTotalCOP);
    });

    // Update global inputs/labels
    const fobTotalInput = document.getElementById('imp-fob-total') as HTMLInputElement;
    if (fobTotalInput) fobTotalInput.value = totalFOB.toFixed(2);

    const lblResFob = document.getElementById('lbl-res-fob-cop');
    const lblResCif = document.getElementById('lbl-res-cif-cop');
    const lblResArancel = document.getElementById('lbl-res-arancel-cop');
    const lblResLocales = document.getElementById('lbl-res-locales-cop');
    const lblResTotal = document.getElementById('lbl-res-total-cop');
    const customsArancel = document.getElementById('stage-customs-arancel');

    if (lblResFob) lblResFob.textContent = (window as any).fmt(totalFOBCop);
    if (lblResCif) lblResCif.textContent = (window as any).fmt(totalCIFExpensesCOP);
    if (lblResArancel) lblResArancel.textContent = (window as any).fmt(arancelTotalCOP + gastosNacCOP);
    if (lblResLocales) lblResLocales.textContent = (window as any).fmt(transporteCOP + otrosGastosCOP);
    if (lblResTotal) lblResTotal.textContent = (window as any).fmt(totalFOBCop + totalExpensesToProrateCOP + arancelTotalCOP);
    if (customsArancel) customsArancel.textContent = (window as any).fmt(arancelTotalCOP);

    // Actualizar totales en COP de cada fila en la Matriz de Etapas
    const stageFobCop = document.getElementById('stage-fob-cop-display');
    if (stageFobCop) stageFobCop.textContent = (window as any).fmt(totalFOBCop);
    const stageFreightCop = document.getElementById('stage-freight-cop-display');
    if (stageFreightCop) stageFreightCop.textContent = (window as any).fmt(freightCostCOP);
    const stageInsuranceCop = document.getElementById('stage-insurance-cop-display');
    if (stageInsuranceCop) stageInsuranceCop.textContent = (window as any).fmt(insuranceCostCOP);
    const stageCustomsCop = document.getElementById('stage-customs-cop-display');
    if (stageCustomsCop) stageCustomsCop.textContent = (window as any).fmt(arancelTotalCOP + gastosNacCOP);
    const stageCarrierCop = document.getElementById('stage-carrier-cop-display');
    if (stageCarrierCop) stageCarrierCop.textContent = (window as any).fmt(transporteCOP);
    const stageOtherCop = document.getElementById('stage-other-cop-display');
    if (stageOtherCop) stageOtherCop.textContent = (window as any).fmt(otrosGastosCOP);
    const stageFobTrm = document.getElementById('imp-stage-fob-trm') as HTMLInputElement;
    if (stageFobTrm) stageFobTrm.value = exchangeRate.toFixed(2);

    // Update invoices table labels if present
    if (isConsolidated) {
      localInvoices.forEach(inv => {
        const invFob = inv._computed_fob ?? inv.fob_amount ?? 0;
        const usdCell = document.getElementById(`inv-fob-usd-${inv.id}`);
        const copCell = document.getElementById(`inv-fob-cop-${inv.id}`);
        const stageUsdCell = document.getElementById(`stage-inv-fob-usd-${inv.id}`);
        const stageCopCell = document.getElementById(`stage-inv-fob-cop-${inv.id}`);

        if (usdCell) usdCell.textContent = (window as any).fmtN(invFob) + ' ' + (inv.currency || currency);
        if (copCell) copCell.textContent = (window as any).fmt(invFob * (inv.exchange_rate || exchangeRate));
        if (stageUsdCell) stageUsdCell.textContent = (window as any).fmtN(invFob) + ' ' + (inv.currency || currency);
        if (stageCopCell) stageCopCell.textContent = (window as any).fmt(invFob * (inv.exchange_rate || exchangeRate));
      });
    }

    // Update Seen entities Vistos Buenos warnings box
    const vbAlertsList = document.getElementById('imp-vb-alerts-list');
    const vbAlertsWrap = document.getElementById('imp-vb-alerts-wrap');
    if (vbAlertsList && vbAlertsWrap) {
      const activeVbs: string[] = [];
      rows.forEach((tr: any) => {
        const badge = tr.querySelector('.badge-red');
        if (badge) {
          const prodName = tr.querySelector('.truncate')?.textContent || 'Producto';
          const title = badge.getAttribute('title') || `Requiere visto bueno`;
          activeVbs.push(`<strong>${prodName}</strong>: ${title}`);
        }
      });
      
      if (activeVbs.length > 0) {
        vbAlertsList.innerHTML = activeVbs.map(item => `<li>${item}</li>`).join('');
        vbAlertsWrap.classList.remove('hidden');
      } else {
        vbAlertsWrap.classList.add('hidden');
      }
    }
  };

  // --- Handlers de Modo Consolidado, Facturas Comerciales y Palletizado ---

  (window as any).impToggleConsolidatedMode = function(isConsolidated: boolean) {
    const invWrap = document.getElementById('imp-consolidated-invoices-wrap');
    const thSupp = document.querySelectorAll('.col-consolidated-th');
    const tdSupp = document.querySelectorAll('.col-consolidated-td');
    const suppStar = document.getElementById('imp-supplier-req-star');
    const suppHint = document.getElementById('lbl-imp-supplier-hint');
    const fobConsolidatedBadge = document.getElementById('lbl-fob-consolidated-indicator');
    const suppInvNumInput = document.getElementById('imp-supplier-invoice-num');
    const invCountBadge = document.getElementById('imp-consolidated-inv-count-badge');
    const singleActionWrap = document.getElementById('wrap-fob-single-action');
    const btnGotoTab = document.getElementById('btn-fob-goto-tab');
    const singleFobView = document.getElementById('imp-fob-single-view');
    const consolidatedFobView = document.getElementById('imp-fob-consolidated-view');
    const stageFobSuppName = document.getElementById('stage-fob-supplier-name');

    if (isConsolidated) {
      invWrap?.classList.remove('hidden');
      thSupp.forEach(el => el.classList.remove('hidden'));
      tdSupp.forEach(el => el.classList.remove('hidden'));
      if (suppStar) suppStar.textContent = '';
      if (suppHint) suppHint.textContent = 'Proveedor general, consolidador o agente de carga principal.';
      fobConsolidatedBadge?.classList.remove('hidden');
      suppInvNumInput?.classList.add('hidden');
      invCountBadge?.classList.remove('hidden');
      singleActionWrap?.classList.add('hidden');
      btnGotoTab?.classList.remove('hidden');
      singleFobView?.classList.add('hidden');
      consolidatedFobView?.classList.remove('hidden');
      if (stageFobSuppName) stageFobSuppName.textContent = 'Múltiples Proveedores (Ver tab)';
    } else {
      invWrap?.classList.add('hidden');
      thSupp.forEach(el => el.classList.add('hidden'));
      tdSupp.forEach(el => el.classList.add('hidden'));
      if (suppStar) suppStar.textContent = '*';
      if (suppHint) suppHint.textContent = 'Proveedor internacional emisor de la mercancía.';
      fobConsolidatedBadge?.classList.add('hidden');
      suppInvNumInput?.classList.remove('hidden');
      invCountBadge?.classList.add('hidden');
      singleActionWrap?.classList.remove('hidden');
      btnGotoTab?.classList.add('hidden');
      singleFobView?.classList.remove('hidden');
      consolidatedFobView?.classList.add('hidden');
      const supplierInput = document.getElementById('imp-supplier-search') as HTMLInputElement;
      if (stageFobSuppName && supplierInput) {
        stageFobSuppName.textContent = supplierInput.value ? supplierInput.value.split(' - ').pop() || 'Definido arriba' : 'Definido arriba';
      }
    }

    (window as any).impRenderInvoicesTable();
    (window as any).impRecalcTotals();
  };

  (window as any).impRenderInvoicesTable = function() {
    const tbody = document.getElementById('imp-invoices-tbody');
    const stageTbody = document.getElementById('imp-fob-stage-invoices-body');
    const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');

    if (tbody) {
      if (!localInvoices.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-gray-400">No hay facturas comerciales agregadas aún. Haz clic en <strong>Agregar Factura Comercial</strong> arriba.</td></tr>`;
      } else {
        tbody.innerHTML = localInvoices.map((inv: any, i: number) => {
          const suppName = inv.expand?.supplier_id?.name || inv.expand?.third_party_id?.name || 'Proveedor Extranjero';
          const invDueDate = inv.payment_due_date || inv.due_date || '—';
          const invFob = inv._computed_fob ?? inv.fob_amount ?? 0;
          const invFobCop = invFob * (inv.exchange_rate || exchangeRate);
          const isCaused = Boolean(inv.tx_fob_id);

          return `
            <tr class="hover:bg-blue-50/50">
              <td class="py-2.5 px-3 font-semibold text-slate-800">${(window as any).esc(suppName)}</td>
              <td class="py-2.5 px-3 font-mono font-bold text-blue-900">${(window as any).esc(inv.invoice_number)}</td>
              <td class="py-2.5 px-3 text-slate-600">${(window as any).esc(inv.invoice_date || '—')}</td>
              <td class="py-2.5 px-3 font-bold text-amber-700">${(window as any).esc(invDueDate)}</td>
              <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800" id="inv-fob-usd-${inv.id}">${(window as any).fmtN(invFob)} ${inv.currency || currency}</td>
              <td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-600" id="inv-fob-cop-${inv.id}">${(window as any).fmt(invFobCop)}</td>
              <td class="py-2.5 px-3 text-center">
                ${inv.invoice_file ? `
                  <a href="${(window as any).PB_URL}/api/files/import_invoices/${inv.id}/${inv.invoice_file}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="text-blue-600 hover:underline font-bold" title="Ver documento adjunto">
                    <i class="fas fa-file-pdf"></i> PDF
                  </a>
                ` : (inv._newFile ? `<span class="text-emerald-600 font-bold" title="${(window as any).esc(inv._newFile.name)}">📄 Por subir</span>` : '<span class="text-gray-400">—</span>')}
              </td>
              <td class="py-2.5 px-3 text-center">
                ${isCaused ? `<span class="badge badge-emerald text-[11px]"><i class="fas fa-check-circle mr-1"></i>Causado</span>` : `<span class="badge badge-slate text-[11px]">⏳ Pendiente</span>`}
              </td>
              <td class="py-2.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button type="button" class="btn btn-outline btn-xs p-1 text-blue-600" onclick="window.impOpenInvoiceModal('${inv.id}')" title="Editar Factura"><i class="fas fa-pen"></i></button>
                  ${!isCaused ? `
                    <button type="button" class="btn btn-outline btn-xs p-1 text-red-600 border-red-200 hover:bg-red-50" onclick="window.impDeleteInvoice('${inv.id}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    if (stageTbody) {
      if (!localInvoices.length) {
        stageTbody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-gray-400">No hay facturas comerciales configuradas.</td></tr>`;
      } else {
        stageTbody.innerHTML = localInvoices.map((inv: any) => {
          const suppName = inv.expand?.supplier_id?.name || inv.expand?.third_party_id?.name || 'Proveedor Extranjero';
          const invDueDate = inv.payment_due_date || inv.due_date || '—';
          const invFob = inv._computed_fob ?? inv.fob_amount ?? 0;
          const invFobCop = invFob * (inv.exchange_rate || exchangeRate);
          const isCaused = Boolean(inv.tx_fob_id);

          return `
            <tr class="hover:bg-slate-50">
              <td class="py-2 px-2.5 font-semibold">${(window as any).esc(suppName)}</td>
              <td class="py-2 px-2.5 font-mono text-blue-900">${(window as any).esc(inv.invoice_number)}</td>
              <td class="py-2 px-2.5 font-semibold text-amber-700">${(window as any).esc(invDueDate)}</td>
              <td class="py-2 px-2.5 text-right font-mono font-bold" id="stage-inv-fob-usd-${inv.id}">${(window as any).fmtN(invFob)} ${inv.currency || currency}</td>
              <td class="py-2 px-2.5 text-right font-mono" id="stage-inv-fob-cop-${inv.id}">${(window as any).fmt(invFobCop)}</td>
              <td class="py-2 px-2.5 text-center">
                ${isCaused ? `
                  <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${inv.tx_fob_id}')">
                    <i class="fas fa-receipt mr-1"></i> Asiento
                  </button>
                ` : `
                  <button type="button" class="btn btn-primary btn-xs w-full" onclick="window.triggerConsolidatedInvoiceCausacion('${inv.id}')">
                    <i class="fas fa-calculator mr-1"></i> Causar FOB
                  </button>
                `}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Refresh all line invoice dropdowns
    const rows = document.querySelectorAll('#imp-lines-body tr');
    rows.forEach((tr: any) => {
      const rowIdx = tr.id.split('-').pop();
      const select = document.getElementById(`impl-invoice-${rowIdx}`) as HTMLSelectElement;
      if (select) {
        const currentVal = select.value;
        select.innerHTML = `<option value="">— Seleccionar Factura —</option>` + localInvoices.map((inv: any) => `
          <option value="${inv.id}" ${inv.id === currentVal ? 'selected' : ''}>
            ${(window as any).esc(inv.invoice_number)} (${(window as any).esc(inv.expand?.supplier_id?.name || inv.expand?.third_party_id?.name || 'Prov.')})
          </option>
        `).join('');
      }
    });
  };

  (window as any).impOnLineInvoiceChange = function(lineIdx: number) {
    const select = document.getElementById(`impl-invoice-${lineIdx}`) as HTMLSelectElement;
    const suppHidden = document.getElementById(`impl-supplier-${lineIdx}`) as HTMLInputElement;
    if (select && suppHidden) {
      const invId = select.value;
      const inv = localInvoices.find(i => i.id === invId);
      if (inv) {
        suppHidden.value = inv.supplier_id || inv.third_party_id || '';
      }
    }
    (window as any).impRecalcTotals();
  };

  (window as any).impOpenInvoiceModal = function(editInvoiceId: string | null = null) {
    const isEditing = Boolean(editInvoiceId);
    const inv = isEditing ? localInvoices.find(i => i.id === editInvoiceId) : null;
    const currentCurrency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const currentExchangeRate = (document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000.00';

    const existingOverlay = document.getElementById('imp-invoice-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'imp-invoice-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-w-lg w-full animate-in fade-in zoom-in-95 duration-150">
        <div class="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <i class="fas fa-file-invoice-dollar text-blue-300 text-lg"></i>
            <h3 class="font-bold text-sm text-white">${isEditing ? 'Editar Factura Comercial' : 'Nueva Factura Comercial de Proveedor'}</h3>
          </div>
          <button type="button" class="text-slate-300 hover:text-white text-lg p-1" id="inv-modal-close"><i class="fas fa-xmark"></i></button>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <div class="form-group">
            <label class="form-label font-bold">Proveedor Internacional <span class="text-red-500">*</span></label>
            <select id="inv-modal-supplier" class="form-input text-xs">
              ${getSupplierOptions(inv?.supplier_id || inv?.third_party_id || '')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold">Nro. Factura Comercial <span class="text-red-500">*</span></label>
              <input type="text" id="inv-modal-number" class="form-input font-mono font-bold text-xs" placeholder="Ej: INV-2026-001" value="${(window as any).esc(inv?.invoice_number || '')}">
            </div>
            <div class="form-group">
              <label class="form-label font-bold">Fecha Emisión</label>
              <input type="date" id="inv-modal-date" class="form-input text-xs" value="${inv?.invoice_date ? inv.invoice_date.split(' ')[0] : new Date().toISOString().split('T')[0]}">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold text-blue-900">Fecha Vencimiento (Agenda CXP) <span class="text-red-500">*</span></label>
              <input type="date" id="inv-modal-due-date" class="form-input text-xs font-semibold" value="${inv?.payment_due_date ? inv.payment_due_date.split(' ')[0] : (inv?.due_date ? inv.due_date.split(' ')[0] : '')}">
            </div>
            <div class="form-group">
              <label class="form-label font-bold">Tasa Cambio (TRM)</label>
              <input type="number" id="inv-modal-exchange-rate" class="form-input text-xs text-right" min="1" step="0.01" value="${inv?.exchange_rate || currentExchangeRate}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Adjuntar Factura PDF / Imagen</label>
            <input type="file" id="inv-modal-file" class="form-input text-xs" accept="application/pdf,image/*">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Notas / Observaciones</label>
            <input type="text" id="inv-modal-notes" class="form-input text-xs" placeholder="Detalles de pago o puerto de embarque..." value="${(window as any).esc(inv?.notes || '')}">
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" class="btn btn-outline" id="inv-modal-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary" id="inv-modal-save">
            <i class="fas fa-check mr-1"></i> Guardar Factura
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#inv-modal-close')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#inv-modal-cancel')?.addEventListener('click', () => overlay.remove());

    overlay.querySelector('#inv-modal-save')?.addEventListener('click', () => {
      const suppId = (document.getElementById('inv-modal-supplier') as HTMLSelectElement)?.value;
      const invNum = (document.getElementById('inv-modal-number') as HTMLInputElement)?.value.trim();
      const invDate = (document.getElementById('inv-modal-date') as HTMLInputElement)?.value;
      const dueDate = (document.getElementById('inv-modal-due-date') as HTMLInputElement)?.value;
      const exRate = parseFloat((document.getElementById('inv-modal-exchange-rate') as HTMLInputElement)?.value) || 1;
      const notesVal = (document.getElementById('inv-modal-notes') as HTMLInputElement)?.value.trim();
      const fileInput = document.getElementById('inv-modal-file') as HTMLInputElement;

      if (!suppId) { (window as any).showToast('Selecciona el proveedor internacional de la factura.', 'warning'); return; }
      if (!invNum) { (window as any).showToast('Ingresa el número de factura comercial.', 'warning'); return; }
      if (!dueDate) { (window as any).showToast('Ingresa la fecha de vencimiento para la Agenda de Pagos.', 'warning'); return; }

      const suppObj = suppliers.find((s: any) => s.id === suppId);

      if (isEditing && inv) {
        inv.supplier_id = suppId;
        inv.third_party_id = suppId;
        inv.invoice_number = invNum;
        inv.invoice_date = invDate;
        inv.payment_due_date = dueDate;
        inv.due_date = dueDate;
        inv.exchange_rate = exRate;
        inv.notes = notesVal;
        inv.expand = { supplier_id: suppObj, third_party_id: suppObj };
        if (fileInput?.files?.[0]) {
          inv._newFile = fileInput.files[0];
        }
      } else {
        const newInv: any = {
          id: `temp-${Date.now()}`,
          supplier_id: suppId,
          third_party_id: suppId,
          invoice_number: invNum,
          invoice_date: invDate,
          payment_due_date: dueDate,
          due_date: dueDate,
          currency: currentCurrency,
          exchange_rate: exRate,
          fob_amount: 0,
          notes: notesVal,
          expand: { supplier_id: suppObj, third_party_id: suppObj }
        };
        if (fileInput?.files?.[0]) {
          newInv._newFile = fileInput.files[0];
        }
        localInvoices.push(newInv);
      }

      (window as any).impRenderInvoicesTable();
      (window as any).impRecalcTotals();
      (window as any).showToast(`Factura ${invNum} guardada.`, 'success');
      overlay.remove();
    });
  };

  (window as any).impDeleteInvoice = function(invId: string) {
    const targetIdx = localInvoices.findIndex(i => i.id === invId);
    if (targetIdx < 0) return;
    const inv = localInvoices[targetIdx];

    if (inv.tx_fob_id) {
      (window as any).showToast('No puedes eliminar una factura que ya ha sido causada contablemente.', 'warning');
      return;
    }

    (window as any).confirmDialog(
      'Eliminar Factura Comercial',
      `¿Deseas eliminar la factura <strong>${inv.invoice_number}</strong>? Se desvinculará de las líneas que la utilicen.`,
      () => {
        localInvoices.splice(targetIdx, 1);
        const rows = document.querySelectorAll('#imp-lines-body tr');
        rows.forEach((tr: any) => {
          const rowIdx = tr.id.split('-').pop();
          const select = document.getElementById(`impl-invoice-${rowIdx}`) as HTMLSelectElement;
          if (select && select.value === invId) {
            select.value = '';
          }
        });
        (window as any).impRenderInvoicesTable();
        (window as any).impRecalcTotals();
        (window as any).showToast('Factura eliminada.', 'success');
      }
    );
  };

  // --- Modal de Desglose de Pallets Heterogéneos (WMS) ---
  (window as any).impOpenPalletModal = function(lineIdx: number) {
    const tr = document.getElementById(`imp-row-${lineIdx}`);
    if (!tr) return;
    const prodName = tr.querySelector('.truncate')?.textContent || 'Producto';
    const prodCode = tr.querySelector('.font-mono')?.textContent || '';
    const lotInput = document.getElementById(`impl-lot-${lineIdx}`) as HTMLInputElement;
    const currentLot = lotInput?.value || '';
    const qtyInput = document.getElementById(`impl-qty-${lineIdx}`) as HTMLInputElement;
    let lineQty = parseFloat(qtyInput?.value || '0');
    const unit = tr.getAttribute('data-prod-unit') || 'UND';
    const cajasPallet = parseFloat(tr.getAttribute('data-prod-cajas-pallet') || '0') || 0;
    const undEmpaque = parseFloat(tr.getAttribute('data-prod-und-empaque') || '1') || 1;

    let configs = localPalletConfigs[lineIdx] ? JSON.parse(JSON.stringify(localPalletConfigs[lineIdx])) : [];
    if (!configs.length) {
      if (lineQty > 0) {
        const uPerB = undEmpaque > 0 ? undEmpaque : 1;
        const totalBoxesNeeded = Math.ceil(lineQty / uPerB);
        const bPerP = (cajasPallet > 0) ? cajasPallet : totalBoxesNeeded;

        if (totalBoxesNeeded <= bPerP) {
          configs.push({
            pallet_qty: 1,
            boxes_per_pallet: totalBoxesNeeded,
            units_per_box: uPerB,
            pallet_type: 'ESTANDAR_120x100',
            height_cm: 150,
            gross_weight_kg: 250,
            lot_number: currentLot
          });
        } else {
          const fullPallets = Math.floor(totalBoxesNeeded / bPerP);
          const remBoxes = totalBoxesNeeded % bPerP;
          if (fullPallets > 0) {
            configs.push({
              pallet_qty: fullPallets,
              boxes_per_pallet: bPerP,
              units_per_box: uPerB,
              pallet_type: 'ESTANDAR_120x100',
              height_cm: 150,
              gross_weight_kg: 250,
              lot_number: currentLot
            });
          }
          if (remBoxes > 0) {
            configs.push({
              pallet_qty: 1,
              boxes_per_pallet: remBoxes,
              units_per_box: uPerB,
              pallet_type: 'ESTANDAR_120x100',
              height_cm: 120,
              gross_weight_kg: 150,
              lot_number: currentLot
            });
          }
        }
      } else {
        configs.push({
          pallet_qty: 1,
          boxes_per_pallet: 1,
          units_per_box: 1,
          pallet_type: 'ESTANDAR_120x100',
          height_cm: 120,
          gross_weight_kg: 50,
          lot_number: currentLot
        });
      }
    }

    const existingOverlay = document.getElementById('imp-pallet-modal-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'imp-pallet-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';

    const renderModalContent = () => {
      let totalPallets = 0;
      let totalBoxes = 0;
      let totalUnits = 0;
      let totalCbm = 0;
      let totalWeight = 0;

      const rowsHtml = configs.map((c: any, cIdx: number) => {
        const pQty = Number(c.pallet_qty) || 0;
        const bPerP = Number(c.boxes_per_pallet) || 0;
        const uPerB = Number(c.units_per_box) || 0;
        const subBoxes = pQty * bPerP;
        const subUnits = subBoxes * uPerB;
        const height = Number(c.height_cm) || 0;
        const isEuropallet = c.pallet_type === 'EUROPALLET_120x80';
        const cbmPerPallet = (1.2 * (isEuropallet ? 0.8 : 1.0) * (height / 100));
        const subCbm = cbmPerPallet * pQty;
        const subWeight = (Number(c.gross_weight_kg) || 0) * pQty;

        totalPallets += pQty;
        totalBoxes += subBoxes;
        totalUnits += subUnits;
        totalCbm += subCbm;
        totalWeight += subWeight;

        return `
          <tr class="border-b border-gray-100 hover:bg-slate-50" data-cidx="${cIdx}">
            <td class="p-2">
              <input type="number" class="form-input text-right font-bold w-20 p-1 text-xs plt-field" data-field="pallet_qty" min="1" step="1" value="${pQty}">
            </td>
            <td class="p-2">
              <input type="number" class="form-input text-right font-semibold w-20 p-1 text-xs plt-field" data-field="boxes_per_pallet" min="1" step="1" value="${bPerP}">
            </td>
            <td class="p-2">
              <div class="relative flex items-center">
                <input type="number" class="form-input text-right font-semibold w-24 p-1 pr-6 text-xs plt-field" data-field="units_per_box" min="0.001" step="1" value="${uPerB}">
                <span class="absolute right-1.5 text-[9px] font-bold text-slate-400 pointer-events-none uppercase">${(window as any).esc(unit)}</span>
              </div>
            </td>
            <td class="p-2 text-right font-mono font-bold text-slate-700">${subBoxes}</td>
            <td class="p-2 text-right font-mono font-bold text-blue-700">${subUnits.toLocaleString()} ${(window as any).esc(unit)}</td>
            <td class="p-2">
              <select class="form-input text-xs p-1 plt-field" data-field="pallet_type">
                <option value="ESTANDAR_120x100" ${c.pallet_type === 'ESTANDAR_120x100' ? 'selected' : ''}>Estándar (120x100)</option>
                <option value="EUROPALLET_120x80" ${c.pallet_type === 'EUROPALLET_120x80' ? 'selected' : ''}>Europallet (120x80)</option>
              </select>
            </td>
            <td class="p-2">
              <input type="number" class="form-input text-right w-16 p-1 text-xs plt-field" data-field="height_cm" min="10" step="1" value="${height}">
            </td>
            <td class="p-2 text-right font-mono text-xs text-slate-600">${subCbm.toFixed(3)} m³</td>
            <td class="p-2">
              <input type="number" class="form-input text-right w-20 p-1 text-xs plt-field" data-field="gross_weight_kg" min="0" step="0.1" value="${c.gross_weight_kg || 0}">
            </td>
            <td class="p-2 text-center">
              <button type="button" class="btn btn-outline btn-xs text-red-600 hover:bg-red-50 border-red-200 plt-btn-del" data-delidx="${cIdx}" title="Eliminar fila">
                <i class="fas fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Comparación y reconciliación exacta con la cantidad del ítem
      const diff = totalUnits - lineQty;
      let reconciliationHtml = '';
      if (Math.abs(diff) < 0.001) {
        reconciliationHtml = `
          <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
            <div class="flex items-center gap-2">
              <i class="fas fa-circle-check text-emerald-600 text-base"></i>
              <span>Total estibado: <strong>${totalUnits} ${(window as any).esc(unit)}</strong> — Coincide 100% con la cantidad del ítem (${lineQty} ${(window as any).esc(unit)})</span>
            </div>
            <span class="badge badge-emerald font-mono font-bold">✓ Cuadrado</span>
          </div>
        `;
      } else if (diff < 0) {
        const missing = Math.abs(diff);
        reconciliationHtml = `
          <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 font-semibold flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <i class="fas fa-triangle-exclamation text-amber-600 text-base"></i>
              <span>Faltan <strong>${missing} ${(window as any).esc(unit)}</strong> por asignar a estibas (${totalUnits} de ${lineQty} ${(window as any).esc(unit)})</span>
            </div>
            <button type="button" class="btn btn-warning btn-xs" id="plt-modal-add-missing">
              <i class="fas fa-plus mr-1"></i> Completar ${missing} ${(window as any).esc(unit)} en nueva estiba
            </button>
          </div>
        `;
      } else {
        const excess = diff;
        reconciliationHtml = `
          <div class="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-900 font-semibold flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <i class="fas fa-circle-exclamation text-rose-600 text-base"></i>
              <span>El total estibado (${totalUnits} ${(window as any).esc(unit)}) supera en <strong>${excess} ${(window as any).esc(unit)}</strong> la cantidad cargada (${lineQty} ${(window as any).esc(unit)})</span>
            </div>
            <button type="button" class="btn btn-outline btn-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-100" id="plt-modal-sync-qty">
              <i class="fas fa-arrows-rotate mr-1"></i> Ajustar Cantidad del Ítem a ${totalUnits} ${(window as any).esc(unit)}
            </button>
          </div>
        `;
      }

      overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-w-4xl w-full max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
          <div class="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200">
                <i class="fas fa-boxes-stacked text-base"></i>
              </div>
              <div>
                <h3 class="font-bold text-sm text-white">Desglose Heterogéneo de Pallets / Estibas (WMS)</h3>
                <p class="text-xs text-blue-200/80">${(window as any).esc(prodCode)} — ${(window as any).esc(prodName)}</p>
                <div class="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                  <span class="bg-blue-800/80 px-2 py-0.5 rounded border border-blue-400/30 text-blue-100">
                    Unidad de Medida: <strong class="font-mono uppercase text-white">${(window as any).esc(unit)}</strong>
                  </span>
                  <span class="bg-blue-800/80 px-2 py-0.5 rounded border border-blue-400/30 text-blue-100">
                    Cantidad Cargada en Ítem: <strong class="font-mono text-white" id="plt-modal-line-qty-text">${lineQty} ${(window as any).esc(unit)}</strong>
                  </span>
                </div>
              </div>
            </div>
            <button type="button" class="text-slate-300 hover:text-white text-lg p-1" id="plt-modal-close"><i class="fas fa-xmark"></i></button>
          </div>

          <div class="p-4 overflow-y-auto flex-1 space-y-4">
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <i class="fas fa-circle-info text-blue-600 mt-0.5 flex-shrink-0"></i>
              <span>
                Configura cómo viene embalado el producto en el contenedor. Si el proveedor envió pallets no uniformes (ej: <strong>10 pallets de 16 cajas</strong> y <strong>2 pallets de 24 cajas</strong>), agrégalos como filas independientes. El cálculo de cajas y unidades está vinculado directamente a la unidad de medida <strong>${(window as any).esc(unit)}</strong>.
              </span>
            </div>

            <!-- Banner de Reconciliación en Tiempo Real -->
            ${reconciliationHtml}

            <div class="border rounded-xl overflow-hidden">
              <table class="w-full text-xs text-left border-collapse">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th class="p-2">Estibas (Cant.)</th>
                    <th class="p-2">Cajas / Estiba</th>
                    <th class="p-2">Unid. / Caja (${(window as any).esc(unit)})</th>
                    <th class="p-2 text-right">Total Cajas</th>
                    <th class="p-2 text-right">Total ${(window as any).esc(unit)}</th>
                    <th class="p-2">Tipo Estiba</th>
                    <th class="p-2 text-right">Alto (cm)</th>
                    <th class="p-2 text-right">CBM (m³)</th>
                    <th class="p-2 text-right">Peso/Estiba (Kg)</th>
                    <th class="p-2 text-center" style="width:40px"></th>
                  </tr>
                </thead>
                <tbody id="plt-modal-tbody">
                  ${rowsHtml}
                </tbody>
              </table>
            </div>

            <button type="button" class="btn btn-outline btn-xs flex items-center gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50" id="plt-modal-add-row">
              <i class="fas fa-plus"></i> Agregar Otra Configuración de Pallet
            </button>

            <!-- Métricas Resumen -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span class="text-slate-500 font-bold uppercase text-[10px]">Total Estibas</span>
                <p class="text-base font-extrabold text-slate-800 font-mono">${totalPallets}</p>
              </div>
              <div>
                <span class="text-slate-500 font-bold uppercase text-[10px]">Total Cajas</span>
                <p class="text-base font-extrabold text-slate-800 font-mono">${totalBoxes}</p>
              </div>
              <div>
                <span class="text-slate-500 font-bold uppercase text-[10px]">Total ${(window as any).esc(unit)}</span>
                <p class="text-base font-extrabold ${Math.abs(diff) < 0.001 ? 'text-emerald-700' : 'text-blue-700'} font-mono">${totalUnits.toLocaleString()} / ${lineQty} ${(window as any).esc(unit)}</p>
              </div>
              <div>
                <span class="text-slate-500 font-bold uppercase text-[10px]">Cubicaje Total</span>
                <p class="text-base font-extrabold text-emerald-700 font-mono">${totalCbm.toFixed(3)} m³</p>
              </div>
              <div>
                <span class="text-slate-500 font-bold uppercase text-[10px]">Peso Bruto</span>
                <p class="text-base font-extrabold text-indigo-700 font-mono">${totalWeight.toFixed(1)} Kg</p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" class="btn btn-outline" id="plt-modal-cancel">Cancelar</button>
            <button type="button" class="btn btn-primary" id="plt-modal-save">
              <i class="fas fa-check mr-1"></i> Aplicar a Línea de Importación
            </button>
          </div>
        </div>
      `;

      // Bindings
      overlay.querySelectorAll('.plt-field').forEach((input: any) => {
        input.addEventListener('input', (e: any) => {
          const row = e.target.closest('tr');
          const cIdx = parseInt(row.getAttribute('data-cidx'), 10);
          const field = e.target.getAttribute('data-field');
          configs[cIdx][field] = field === 'pallet_type' ? e.target.value : parseFloat(e.target.value) || 0;
          renderModalContent();
        });
      });

      overlay.querySelectorAll('.plt-btn-del').forEach((btn: any) => {
        btn.addEventListener('click', () => {
          const delIdx = parseInt(btn.getAttribute('data-delidx'), 10);
          configs.splice(delIdx, 1);
          if (!configs.length) {
            configs.push({ pallet_qty: 1, boxes_per_pallet: 1, units_per_box: 1, pallet_type: 'ESTANDAR_120x100', height_cm: 120, gross_weight_kg: 50 });
          }
          renderModalContent();
        });
      });

      overlay.querySelector('#plt-modal-add-row')?.addEventListener('click', () => {
        configs.push({
          pallet_qty: 1,
          boxes_per_pallet: 20,
          units_per_box: configs[0]?.units_per_box || undEmpaque || 1,
          pallet_type: 'ESTANDAR_120x100',
          height_cm: 150,
          gross_weight_kg: 200,
          lot_number: currentLot
        });
        renderModalContent();
      });

      overlay.querySelector('#plt-modal-add-missing')?.addEventListener('click', () => {
        const missing = Math.abs(totalUnits - lineQty);
        if (missing > 0) {
          const uPerB = configs[0]?.units_per_box || undEmpaque || 1;
          const boxes = Math.ceil(missing / uPerB);
          configs.push({
            pallet_qty: 1,
            boxes_per_pallet: boxes,
            units_per_box: uPerB,
            pallet_type: 'ESTANDAR_120x100',
            height_cm: 120,
            gross_weight_kg: 100,
            lot_number: currentLot
          });
          renderModalContent();
        }
      });

      overlay.querySelector('#plt-modal-sync-qty')?.addEventListener('click', () => {
        lineQty = totalUnits;
        if (qtyInput) {
          qtyInput.value = String(totalUnits);
        }
        renderModalContent();
        (window as any).showToast(`Cantidad del ítem actualizada a ${totalUnits} ${unit}.`, 'info');
      });

      overlay.querySelector('#plt-modal-close')?.addEventListener('click', () => overlay.remove());
      overlay.querySelector('#plt-modal-cancel')?.addEventListener('click', () => overlay.remove());

      overlay.querySelector('#plt-modal-save')?.addEventListener('click', () => {
        // Guardar configs en estado local
        localPalletConfigs[lineIdx] = configs;

        // Calcular totales finales
        let sumUnits = 0;
        let sumBoxes = 0;
        let sumPallets = 0;
        let sumCbm = 0;
        let sumWeight = 0;

        configs.forEach((c: any) => {
          const pQty = Number(c.pallet_qty) || 0;
          const bPerP = Number(c.boxes_per_pallet) || 0;
          const uPerB = Number(c.units_per_box) || 0;
          const totalB = pQty * bPerP;
          const totalU = totalB * uPerB;
          const height = Number(c.height_cm) || 0;
          const isEuro = c.pallet_type === 'EUROPALLET_120x80';
          const cbm = (1.2 * (isEuro ? 0.8 : 1.0) * (height / 100)) * pQty;
          const wt = (Number(c.gross_weight_kg) || 0) * pQty;

          sumPallets += pQty;
          sumBoxes += totalB;
          sumUnits += totalU;
          sumCbm += cbm;
          sumWeight += wt;
        });

        // Actualizar inputs de la línea
        const cbmInput = document.getElementById(`impl-cbm-${lineIdx}`) as HTMLInputElement;
        const grossInput = document.getElementById(`impl-peso-bruto-${lineIdx}`) as HTMLInputElement;

        if (cbmInput) cbmInput.value = sumCbm.toFixed(4);
        if (grossInput) {
          grossInput.value = sumWeight.toFixed(2);
          grossInput.dataset.overridden = 'true';
        }

        // Actualizar botón y estado de estibas de la línea
        (window as any).impUpdateLinePalletStatus(lineIdx);

        (window as any).impRecalcTotals();
        (window as any).showToast(`Palletizado aplicado: ${sumPallets} estibas, ${sumBoxes} cajas, ${sumUnits} ${unit}.`, 'success');
        overlay.remove();
      });
    };

    document.body.appendChild(overlay);
    renderModalContent();
  };

  // --- Causación Individual por Factura Comercial Consolidada ---
  (window as any).triggerConsolidatedInvoiceCausacion = async function(invoiceId: string) {
    if (!importId) {
      (window as any).showToast('Por favor guarda la importación primero como Borrador antes de realizar causaciones.', 'warning');
      return;
    }

    const inv = localInvoices.find(i => i.id === invoiceId);
    if (!inv) {
      (window as any).showToast('No se encontró la factura comercial.', 'error');
      return;
    }

    if (inv.tx_fob_id) {
      (window as any).viewStageTx(inv.tx_fob_id);
      return;
    }

    try {
      const exchangeRateVal = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
      const invFob = inv._computed_fob ?? inv.fob_amount ?? 0;
      const amountCOP = invFob * (inv.exchange_rate || exchangeRateVal);

      if (amountCOP <= 0) {
        throw new Error('El monto FOB de la factura debe ser mayor a cero para poder causarla.');
      }

      await SupplyChainOrchestrator.postImportStageWithPaymentSchedule({
        importId,
        stageName: 'fob',
        supplierId: inv.supplier_id || inv.third_party_id,
        invoiceNum: inv.invoice_number,
        amount: amountCOP,
        dueDate: inv.payment_due_date || inv.due_date,
        invoiceId: inv.id,
        notes: `Causación FOB Factura Comercial ${inv.invoice_number} — Importación ${consecutive}`
      });

      (window as any).showToast(`Causación contable y vencimiento generados para la factura ${inv.invoice_number}.`, 'success');
      (window as any).closeModal();
      setTimeout(() => {
        openImportForm(importId, onDone);
      }, 300);

    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
    }
  };

  function initImpGlobalProductSearch() {
    const input = document.getElementById('imp-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('imp-prod-results-global');
    if (!input || !dropdown) return;

    let highlighted = -1;

    const renderResults = (filtered: any[]) => {
      if (!filtered.length) {
        dropdown.innerHTML = '<div class="px-4 py-3 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin resultados para esta búsqueda.</div>';
        return;
      }
      dropdown.innerHTML = filtered.map((p: any, i: number) => `
        <button type="button"
          id="imp-gsr-item-${i}"
          data-prod-idx="${i}"
          class="w-full text-left px-4 py-2.5 text-xs border-none bg-white cursor-pointer block imp-gsr-row"
          style="border-bottom:1px solid #F3F4F6;transition:background .1s"
          onmouseenter="this.style.background='#F0FBFF'"
          onmouseleave="this.style.background=''"
          onclick="window.impGlobalSelectProduct(${i})">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[9px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(p.code || 'S/C')}]</span>
              <span class="font-semibold text-gray-800 truncate">${(window as any).esc(p.name)}</span>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0 text-right">
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:#EEF4FF;color:#1A4B8C">IVA ${p.iva_rate ?? 19}%</span>
              <span class="font-extrabold text-blue-600 text-xs">${(window as any).fmt(p.cost_price || 0)}</span>
            </div>
          </div>
        </button>
      `).join('');
      highlighted = -1;
      (window as any).__impGlobalFilteredProds = filtered;
    };

    const highlightItem = (idx: number, items: NodeListOf<Element>) => {
      items.forEach((el: any) => { el.style.background = ''; el.style.fontWeight = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
        (items[idx] as any).scrollIntoView({ block: 'nearest' });
      }
    };

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const filtered = !q
        ? products.slice(0, 40)
        : products.filter((p: any) => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    });

    input.addEventListener('focus', () => {
      const q = input.value.trim().toLowerCase();
      const filtered = !q ? products.slice(0, 40) : products.filter((p: any) => `${p.name} ${p.code}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    });

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      const items = dropdown.querySelectorAll('.imp-gsr-row');
      if (ev.key === 'ArrowDown') { ev.preventDefault(); highlighted = Math.min(highlighted + 1, items.length - 1); highlightItem(highlighted, items); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlighted = Math.max(highlighted - 1, 0); highlightItem(highlighted, items); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        const selIdx = highlighted >= 0 ? highlighted : 0;
        (window as any).impGlobalSelectProduct(selIdx);
      } else if (ev.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
  }

  (window as any).impGlobalSelectProduct = function(idx: number) {
    const filtered: any[] = (window as any).__impGlobalFilteredProds || [];
    const prod = filtered[idx];
    if (!prod) return;
    (window as any).addImpLine(prod, null);
    const input = document.getElementById('imp-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('imp-prod-results-global');
    if (input) { input.value = ''; input.focus(); }
    if (dropdown) dropdown.style.display = 'none';
    const tableWrap = document.querySelector('#imp-lines-table')?.closest('div[style*="overflow"]') as HTMLElement;
    if (tableWrap) setTimeout(() => { tableWrap.scrollTop = tableWrap.scrollHeight; }, 50);
  };

  // Cargar líneas existentes
  if (existingLines.length) {
    existingLines.forEach((l: any) => {
      const match = products.find((p: any) => p.id === l.product_id);
      if (match) {
        l._name = match.name;
        l._code = match.code;
      }
      (window as any).addImpLine(match || null, l);
    });
  }

  initImpGlobalProductSearch();
  
  // Inicializar modo consolidado y tabla de facturas
  (window as any).impToggleConsolidatedMode(Boolean(imp?.is_consolidated));
  (window as any).impRenderInvoicesTable();

  // Ejecutar primera calculadora al abrir
  setTimeout(() => (window as any).impUpdateCurrencyLabel(), 100);
  setTimeout(() => (window as any).impUpdateTransitAccountInfo(), 150);

  // Lock supplier & TRM inputs if FOB is already caused
  if (imp?.tx_fob_id) {
    setTimeout(() => {
      const mainSuppSearch = document.getElementById('imp-supplier-search') as HTMLInputElement;
      if (mainSuppSearch) {
        mainSuppSearch.disabled = true;
        mainSuppSearch.style.background = '#F3F4F6';
      }
    }, 120);
  }

  // --- Handlers de Causación Contable por Etapas ---
  (window as any).switchImpStageTab = function(tabId: string) {
    const tabBtns = document.querySelectorAll('.imp-stage-tab-btn');
    const tabPanels = document.querySelectorAll('.imp-stage-panel');

    tabBtns.forEach((btn: any) => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-200/60');
      } else {
        btn.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'hover:bg-slate-200/60');
      }
    });

    tabPanels.forEach((panel: any) => {
      if (panel.id === `imp-stage-panel-${tabId}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
  };

  (window as any).viewStageTx = function(txId: string) {
    (window as any).closeModal();
    setTimeout(() => {
      if (typeof (window as any).seeTxDetail === 'function') {
        (window as any).seeTxDetail(txId);
      } else {
        (window as any).showToast('No se encontró el visualizador de transacciones.', 'error');
      }
    }, 300);
  };

  (window as any).checkStageAmountChange = function(stage: string) {
    const input = document.getElementById(`imp-${stage === 'freight' ? 'freight-cost' : stage === 'insurance' ? 'insurance-cost' : stage === 'customs' ? 'gastos-nacionalizacion' : stage === 'local_carrier' ? 'transporte-nacional' : 'otros-gastos'}`) as HTMLInputElement;
    const btnAdjust = document.getElementById(`btn-adjust-${stage}`);
    if (!input || !btnAdjust) return;

    const originalVal = parseFloat(input.getAttribute('data-original-val') || '0');
    const currentVal = parseFloat(input.value || '0');

    if (Math.abs(currentVal - originalVal) > 0.001) {
      btnAdjust.classList.remove('hidden');
    } else {
      btnAdjust.classList.add('hidden');
    }
  };

  (window as any).triggerStageCausacion = async function(stage: string) {
    if (!importId) {
      (window as any).showToast('Por favor guarda la importación primero como Borrador antes de realizar causaciones.', 'warning');
      return;
    }

    try {
      let supplierId = '';
      let invoiceNum = '';
      let amount = 0;

      if (stage === 'fob') {
        supplierId = (document.getElementById('imp-supplier-id') as HTMLInputElement)?.value;
        invoiceNum = (document.getElementById('imp-supplier-invoice-num') as HTMLInputElement)?.value.trim();
        const fobTotalVal = parseFloat((document.getElementById('imp-fob-total') as HTMLInputElement)?.value || '0');
        const exchangeRateVal = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
        amount = fobTotalVal * exchangeRateVal;
      } else if (stage === 'freight') {
        supplierId = (document.getElementById('imp-freight-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-freight-invoice-num') as HTMLInputElement)?.value.trim();
        const costVal = parseFloat((document.getElementById('imp-freight-cost') as HTMLInputElement)?.value || '0');
        const trmVal = parseFloat((document.getElementById('imp-freight-trm') as HTMLInputElement)?.value) || parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
        amount = costVal * trmVal;
      } else if (stage === 'insurance') {
        supplierId = (document.getElementById('imp-insurance-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-insurance-invoice-num') as HTMLInputElement)?.value.trim();
        const costVal = parseFloat((document.getElementById('imp-insurance-cost') as HTMLInputElement)?.value || '0');
        const trmVal = parseFloat((document.getElementById('imp-insurance-trm') as HTMLInputElement)?.value) || parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
        amount = costVal * trmVal;
      } else if (stage === 'customs') {
        supplierId = (document.getElementById('imp-customs-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-customs-invoice-num') as HTMLInputElement)?.value.trim();
        
        const arancelTotalVal = parseFloat(document.getElementById('lbl-res-arancel-cop')?.textContent?.replace(/[^0-9.-]+/g, '') || '0') || 0;
        const gastosNacVal = parseFloat((document.getElementById('imp-gastos-nacionalizacion') as HTMLInputElement)?.value || '0');
        amount = arancelTotalVal + gastosNacVal;
      } else if (stage === 'local_carrier') {
        supplierId = (document.getElementById('imp-local-carrier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-local-carrier-invoice-num') as HTMLInputElement)?.value.trim();
        const costVal = parseFloat((document.getElementById('imp-transporte-nacional') as HTMLInputElement)?.value || '0');
        const trmVal = parseFloat((document.getElementById('imp-local-carrier-trm') as HTMLInputElement)?.value) || 1;
        amount = costVal * trmVal;
      } else if (stage === 'local_other') {
        supplierId = (document.getElementById('imp-local-other-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-local-other-invoice-num') as HTMLInputElement)?.value.trim();
        const costVal = parseFloat((document.getElementById('imp-otros-gastos') as HTMLInputElement)?.value || '0');
        const trmVal = parseFloat((document.getElementById('imp-local-other-trm') as HTMLInputElement)?.value) || 1;
        amount = costVal * trmVal;
      }

      if (!supplierId) throw new Error('Debes seleccionar un proveedor para esta etapa.');
      if (!invoiceNum) throw new Error('Debes ingresar el número de factura/soporte.');
      if (amount <= 0) throw new Error('El monto a causar debe ser mayor a cero.');

      const btn = document.getElementById(`btn-causar-${stage}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>...';
      }

      await SupplyChainOrchestrator.postImportStageWithPaymentSchedule({
        importId,
        stageName: stage as any,
        supplierId,
        invoiceNum,
        amount
      });
      (window as any).showToast('Causación contable y vencimiento en Agenda de Pagos generados exitosamente.', 'success');
      
      (window as any).closeModal();
      setTimeout(() => {
        openImportForm(importId, onDone);
      }, 300);

    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
      const btn = document.getElementById(`btn-causar-${stage}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-calculator mr-1"></i> Causar';
      }
    }
  };

  (window as any).triggerStageAdjustment = async function(stage: string) {
    if (!importId) return;

    try {
      const input = document.getElementById(`imp-${stage === 'freight' ? 'freight-cost' : stage === 'insurance' ? 'insurance-cost' : stage === 'customs' ? 'gastos-nacionalizacion' : stage === 'local_carrier' ? 'transporte-nacional' : 'otros-gastos'}`) as HTMLInputElement;
      if (!input) return;

      const originalVal = parseFloat(input.getAttribute('data-original-val') || '0');
      const currentVal = parseFloat(input.value || '0');
      const exchangeRateVal = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');

      let deltaAmount = 0;
      let invoiceNum = '';

      if (stage === 'fob') {
        invoiceNum = (document.getElementById('imp-supplier-invoice-num') as HTMLInputElement)?.value.trim();
        deltaAmount = (currentVal - originalVal) * exchangeRateVal;
      } else if (stage === 'freight') {
        invoiceNum = (document.getElementById('imp-freight-invoice-num') as HTMLInputElement)?.value.trim();
        const trmVal = parseFloat((document.getElementById('imp-freight-trm') as HTMLInputElement)?.value) || exchangeRateVal;
        deltaAmount = (currentVal - originalVal) * trmVal;
      } else if (stage === 'insurance') {
        invoiceNum = (document.getElementById('imp-insurance-invoice-num') as HTMLInputElement)?.value.trim();
        const trmVal = parseFloat((document.getElementById('imp-insurance-trm') as HTMLInputElement)?.value) || exchangeRateVal;
        deltaAmount = (currentVal - originalVal) * trmVal;
      } else if (stage === 'customs') {
        invoiceNum = (document.getElementById('imp-customs-invoice-num') as HTMLInputElement)?.value.trim();
        deltaAmount = currentVal - originalVal; // COP
      } else if (stage === 'local_carrier') {
        invoiceNum = (document.getElementById('imp-local-carrier-invoice-num') as HTMLInputElement)?.value.trim();
        const trmVal = parseFloat((document.getElementById('imp-local-carrier-trm') as HTMLInputElement)?.value) || 1;
        deltaAmount = (currentVal - originalVal) * trmVal;
      } else if (stage === 'local_other') {
        invoiceNum = (document.getElementById('imp-local-other-invoice-num') as HTMLInputElement)?.value.trim();
        const trmVal = parseFloat((document.getElementById('imp-local-other-trm') as HTMLInputElement)?.value) || 1;
        deltaAmount = (currentVal - originalVal) * trmVal;
      }

      if (Math.abs(deltaAmount) < 0.01) {
        throw new Error('No hay variación en el monto para realizar ajuste.');
      }

      const reason = prompt(`Estás ajustando contablemente esta etapa por una diferencia de ${(window as any).fmt(deltaAmount)}.\nPor favor ingresa el motivo del ajuste:`);
      if (reason === null) return;
      if (!reason.trim()) throw new Error('Debes ingresar un motivo para el ajuste contable.');

      const btn = document.getElementById(`btn-adjust-${stage}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>...';
      }

      await (window as any).API.postImportAdjustment(importId, stage, deltaAmount, invoiceNum, reason);
      (window as any).showToast('Nota de ajuste contable generada exitosamente.', 'success');

      (window as any).closeModal();
      setTimeout(() => {
        openImportForm(importId, onDone);
      }, 300);

    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
      const btn = document.getElementById(`btn-adjust-${stage}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-pen-nib mr-1"></i> Ajustar';
      }
    }
  };

  // Guardar Borrador
  document.getElementById('btn-save-import')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-import') as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardando...';
    }

    try {
      const isConsolidated = (document.getElementById('imp-is-consolidated') as HTMLInputElement)?.checked || false;
      const supplierId = (document.getElementById('imp-supplier-id') as HTMLInputElement)?.value || (localInvoices[0]?.supplier_id || localInvoices[0]?.third_party_id || null);
      const status = (document.getElementById('imp-status') as HTMLSelectElement)?.value || 'planeacion';
      const incoterm = (document.getElementById('imp-incoterm') as HTMLSelectElement)?.value || null;
      const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
      const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
      const blAwb = (document.getElementById('imp-bl-awb') as HTMLInputElement)?.value.trim() || null;
      const transportType = (document.getElementById('imp-transport-type') as HTMLSelectElement)?.value || null;
      const estimatedArrival = (document.getElementById('imp-estimated-arrival') as HTMLInputElement)?.value || null;
      const notes = (document.getElementById('imp-notes') as HTMLInputElement)?.value.trim() || null;

      // Gastos
      const freightCost = parseFloat((document.getElementById('imp-freight-cost') as HTMLInputElement)?.value || '0');
      const insuranceCost = parseFloat((document.getElementById('imp-insurance-cost') as HTMLInputElement)?.value || '0');
      const gastosNacionalizacion = parseFloat((document.getElementById('imp-gastos-nacionalizacion') as HTMLInputElement)?.value || '0');
      const transporteNacional = parseFloat((document.getElementById('imp-transporte-nacional') as HTMLInputElement)?.value || '0');
      const otrosGastos = parseFloat((document.getElementById('imp-otros-gastos') as HTMLInputElement)?.value || '0');

      // Proveedores de Etapas
      const freightSupplierId = (document.getElementById('imp-freight-supplier-id') as HTMLSelectElement)?.value || null;
      const insuranceSupplierId = (document.getElementById('imp-insurance-supplier-id') as HTMLSelectElement)?.value || null;
      const customsSupplierId = (document.getElementById('imp-customs-supplier-id') as HTMLSelectElement)?.value || null;
      const localCarrierId = (document.getElementById('imp-local-carrier-id') as HTMLSelectElement)?.value || null;
      const localOtherSupplierId = (document.getElementById('imp-local-other-supplier-id') as HTMLSelectElement)?.value || null;

      // Facturas de Etapas
      const supplierInvoiceNum = (document.getElementById('imp-supplier-invoice-num') as HTMLInputElement)?.value.trim() || null;
      const freightInvoiceNum = (document.getElementById('imp-freight-invoice-num') as HTMLInputElement)?.value.trim() || null;
      const insuranceInvoiceNum = (document.getElementById('imp-insurance-invoice-num') as HTMLInputElement)?.value.trim() || null;
      const customsInvoiceNum = (document.getElementById('imp-customs-invoice-num') as HTMLInputElement)?.value.trim() || null;
      const localCarrierInvoiceNum = (document.getElementById('imp-local-carrier-invoice-num') as HTMLInputElement)?.value.trim() || null;
      const localOtherInvoiceNum = (document.getElementById('imp-local-other-invoice-num') as HTMLInputElement)?.value.trim() || null;

      // Cumplimiento y prorrateo
      const vuceRegistroNum = (document.getElementById('imp-vuce-registro') as HTMLInputElement)?.value.trim() || null;
      const modalidadImportacion = (document.getElementById('imp-modalidad-importacion') as HTMLSelectElement)?.value || null;
      const canalInspeccion = (document.getElementById('imp-canal-inspeccion') as HTMLSelectElement)?.value || null;
      const prorationMethod = (document.getElementById('imp-proration-method') as HTMLSelectElement)?.value || 'FOB_VALUE';
      const dianDeclaracionNum = (document.getElementById('imp-dian-declaracion') as HTMLInputElement)?.value.trim() || null;
      const dianDeclaracionDate = (document.getElementById('imp-dian-declaracion-date') as HTMLInputElement)?.value || null;
      const dianLevanteDate = (document.getElementById('imp-dian-levante-date') as HTMLInputElement)?.value || null;
      const dianTrm = parseFloat((document.getElementById('imp-dian-trm') as HTMLInputElement)?.value) || null;

      if (!isConsolidated && !supplierId) throw new Error('Por favor selecciona un proveedor internacional.');
      if (isConsolidated && !localInvoices.length) throw new Error('En modo consolidado debes registrar al menos una factura comercial de proveedor.');
      if (exchangeRate <= 0) throw new Error('La tasa de cambio debe ser un número positivo.');

      // TRM específicas por cada rubro
      const freightTrm = parseFloat((document.getElementById('imp-freight-trm') as HTMLInputElement)?.value) || exchangeRate;
      const insuranceTrm = parseFloat((document.getElementById('imp-insurance-trm') as HTMLInputElement)?.value) || exchangeRate;
      const customsTrm = parseFloat((document.getElementById('imp-customs-trm') as HTMLInputElement)?.value) || exchangeRate;
      const localCarrierTrm = parseFloat((document.getElementById('imp-local-carrier-trm') as HTMLInputElement)?.value) || 1;
      const localOtherTrm = parseFloat((document.getElementById('imp-local-other-trm') as HTMLInputElement)?.value) || 1;

      // Totales con TRM individual
      const totalCIFExpensesCOP = (freightCost * freightTrm) + (insuranceCost * insuranceTrm);
      const totalLocalExpensesCOP = gastosNacionalizacion + (transporteNacional * localCarrierTrm) + (otrosGastos * localOtherTrm);
      const totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

      const lines: any[] = [];
      const rows = document.querySelectorAll('#imp-lines-body tr');
      let totalFOB = 0;
      let arancelTotalCOP = 0;
      let totalVolume = 0;

      rows.forEach((row, i) => {
        const idx = row.id.split('-').pop();
        const lineId = row.getAttribute('data-lineid') || null;
        const productId = (document.getElementById(`impl-prod-id-${idx}`) as HTMLInputElement)?.value;
        const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
        const fobPrice = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
        const arancelRate = parseFloat((document.getElementById(`impl-arancel-${idx}`) as HTMLInputElement)?.value || '0');
        const ivaRate = parseFloat((document.getElementById(`impl-iva-${idx}`) as HTMLInputElement)?.value || '0');
        const manifestNumber = (document.getElementById(`impl-manifest-num-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const paisOrigen = (document.getElementById(`impl-pais-origen-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const certOrigen = (document.getElementById(`impl-cert-origen-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const posArancelaria = (document.getElementById(`impl-pos-arancel-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const pesoNeto = parseFloat((document.getElementById(`impl-peso-neto-${idx}`) as HTMLInputElement)?.value || '0');
        const pesoBruto = parseFloat((document.getElementById(`impl-peso-bruto-${idx}`) as HTMLInputElement)?.value || '0');
        const largoCm = parseFloat((document.getElementById(`impl-largo-cm-${idx}`) as HTMLInputElement)?.value || '0');
        const anchoCm = parseFloat((document.getElementById(`impl-ancho-cm-${idx}`) as HTMLInputElement)?.value || '0');
        const altoCm = parseFloat((document.getElementById(`impl-alto-cm-${idx}`) as HTMLInputElement)?.value || '0');

        // Campos lote y factura
        const lotNumber = (document.getElementById(`impl-lot-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const manufacturingDate = (document.getElementById(`impl-mfg-${idx}`) as HTMLInputElement)?.value || null;
        const expiryDate = (document.getElementById(`impl-exp-${idx}`) as HTMLInputElement)?.value || null;
        const invoiceSelectVal = (document.getElementById(`impl-invoice-${idx}`) as HTMLSelectElement)?.value || null;
        let lineSupplierId = (document.getElementById(`impl-supplier-${idx}`) as HTMLInputElement)?.value || supplierId;

        if (invoiceSelectVal) {
          const invObj = localInvoices.find(inv => inv.id === invoiceSelectVal);
          if (invObj) lineSupplierId = invObj.supplier_id || invObj.third_party_id;
        }

        if (!productId) {
          throw new Error(`Por favor selecciona un producto válido en la línea ${i + 1}.`);
        }
        if (qty <= 0) {
          throw new Error(`La cantidad debe ser mayor a cero en la línea ${i + 1}.`);
        }
        if (fobPrice < 0) {
          throw new Error(`El precio FOB no puede ser negativo en la línea ${i + 1}.`);
        }

        const prod = products.find((p: any) => p.id === productId);
        const isBien = prod ? (prod.type === 'BIEN') : false;
        if (isBien) {
          if (pesoNeto <= 0 || pesoBruto <= 0 || largoCm <= 0 || anchoCm <= 0 || altoCm <= 0) {
            throw new Error(`El producto "${prod?.name || 'Físico'}" (línea ${i + 1}) requiere peso y dimensiones mayores a cero en el catálogo maestro.`);
          }
        }

        const lineFOBCop = qty * fobPrice * exchangeRate;
        const rawCbmInput = parseFloat((document.getElementById(`impl-cbm-${idx}`) as HTMLInputElement)?.value || '0');
        const lineCbm = rawCbmInput > 0 ? rawCbmInput : (
          (largoCm > 0 && anchoCm > 0 && altoCm > 0 && qty > 0) ? ((largoCm * anchoCm * altoCm * qty) / 1000000) : 0
        );

        totalFOB += (qty * fobPrice);
        totalVolume += lineCbm;

        lines.push({
          id: lineId,
          product_id: productId,
          qty,
          fob_price: fobPrice,
          arancel_rate: arancelRate,
          iva_rate: ivaRate,
          manifest_number: manifestNumber,
          pais_origen: paisOrigen,
          certificado_origen_num: certOrigen,
          posicion_arancelaria: posArancelaria,
          peso_neto_total: pesoNeto,
          peso_bruto_total: pesoBruto,
          largo_cm: largoCm,
          ancho_cm: anchoCm,
          alto_cm: altoCm,
          cubic_meters_total: lineCbm,
          lineFOBCop,
          supplier_id: lineSupplierId,
          import_invoice_id: invoiceSelectVal && !invoiceSelectVal.startsWith('temp-') ? invoiceSelectVal : null,
          _temp_invoice_id: invoiceSelectVal && invoiceSelectVal.startsWith('temp-') ? invoiceSelectVal : null,
          lot_number: lotNumber,
          manufacturing_date: manufacturingDate,
          expiry_date: expiryDate,
          _row_idx: idx,
        });
      });

      if (!lines.length) throw new Error('La importación debe tener al menos un producto.');

      // Finalizar cálculos para guardado
      const totalFOBCop = totalFOB * exchangeRate;
      const totalWeight = lines.reduce((s, l) => s + (l.peso_bruto_total || 0), 0);

      lines.forEach(l => {
        let factor = 0;
        if (prorationMethod === 'GROSS_WEIGHT' && totalWeight > 0) {
          factor = (l.peso_bruto_total || 0) / totalWeight;
        } else if (prorationMethod === 'CUBIC_VOLUME' && totalVolume > 0) {
          factor = (l.cubic_meters_total || 0) / totalVolume;
        } else if (totalFOBCop > 0) {
          factor = l.lineFOBCop / totalFOBCop;
        }

        l.prorated_cost = factor * totalExpensesToProrateCOP;
        l.arancel_amount = l.lineFOBCop * (l.arancel_rate / 100);
        l.iva_amount = l.lineFOBCop * (l.iva_rate / 100);
        
        const lineTotalCOP = l.lineFOBCop + l.prorated_cost + l.arancel_amount;
        l.unit_cost_cop = l.qty > 0 ? (lineTotalCOP / l.qty) : 0;
        l.total_cop = lineTotalCOP;
        
        arancelTotalCOP += l.arancel_amount;
        delete l.lineFOBCop;
      });

      const grandTotalCOP = totalFOBCop + totalExpensesToProrateCOP + arancelTotalCOP;

      const header: any = {
        is_consolidated: isConsolidated,
        supplier_id: supplierId,
        status,
        incoterm,
        currency,
        exchange_rate: exchangeRate,
        bl_awb: blAwb,
        transport_type: transportType,
        estimated_arrival: estimatedArrival,
        notes,
        freight_cost: freightCost,
        freight_trm: freightTrm,
        freight_exchange_rate: freightTrm,
        insurance_cost: insuranceCost,
        insurance_trm: insuranceTrm,
        insurance_exchange_rate: insuranceTrm,
        gastos_nacionalizacion: gastosNacionalizacion,
        customs_trm: customsTrm,
        transporte_nacional: transporteNacional,
        local_carrier_trm: localCarrierTrm,
        otros_gastos: otrosGastos,
        local_other_trm: localOtherTrm,
        fob_total: totalFOB,
        arancel_total: arancelTotalCOP,
        total_gastos_cif: totalCIFExpensesCOP,
        total_gastos_locales: totalLocalExpensesCOP,
        total: grandTotalCOP,

        // Relaciones y facturas de causación
        freight_supplier_id: freightSupplierId,
        insurance_supplier_id: insuranceSupplierId,
        customs_supplier_id: customsSupplierId,
        local_carrier_id: localCarrierId,
        local_other_supplier_id: localOtherSupplierId,

        supplier_invoice_num: supplierInvoiceNum,
        freight_invoice_num: freightInvoiceNum,
        insurance_invoice_num: insuranceInvoiceNum,
        customs_invoice_num: customsInvoiceNum,
        local_carrier_invoice_num: localCarrierInvoiceNum,
        local_other_invoice_num: localOtherInvoiceNum,

        // Campos DIAN/VUCE y prorrateo
        vuce_registro_num: vuceRegistroNum,
        modalidad_importacion: modalidadImportacion,
        canal_inspeccion: canalInspeccion,
        proration_method: prorationMethod,
        dian_declaracion_num: dianDeclaracionNum,
        dian_declaracion_date: dianDeclaracionDate,
        dian_levante_date: dianLevanteDate,
        dian_trm: dianTrm,
      };

      const impNumber = (document.getElementById('imp-number') as HTMLInputElement)?.value.trim();
      if (!impNumber) throw new Error('Por favor ingresa un número de importación.');

      if (!importId || (imp && imp.number !== impNumber)) {
        const existing = await (window as any).pb.list('imports', { filter: `number="${(window as any).pb.escapeFilterValue(impNumber)}"` });
        if (existing.items && existing.items.length) {
          throw new Error(`El número de importación "${impNumber}" ya se encuentra registrado. Por favor utiliza un número diferente.`);
        }
      }

      // Validar existencia previa de la cuenta PUC de tránsito (ej. 146505099)
      await (window as any).API.getImportTransitAccount(impNumber);

      header.number = impNumber;

      let savedImport: any = null;
      if (importId) {
        savedImport = await (window as any).API.updateImport(importId, header, lines, currentUploadedFiles);
      } else {
        savedImport = await (window as any).API.createImport(header, lines, currentUploadedFiles);
      }
      const finalImportId = importId || savedImport?.id;

      // 1. Guardar facturas comerciales consolidadas
      if (isConsolidated && localInvoices.length) {
        for (const inv of localInvoices) {
          const invData: any = {
            import_id: finalImportId,
            supplier_id: inv.supplier_id || inv.third_party_id,
            invoice_number: inv.invoice_number,
            invoice_date: inv.invoice_date || null,
            payment_due_date: inv.payment_due_date || inv.due_date || null,
            currency: inv.currency || currency,
            exchange_rate: inv.exchange_rate || exchangeRate,
            fob_amount: inv._computed_fob ?? inv.fob_amount ?? 0,
            notes: inv.notes || '',
          };

          if (inv.id && !inv.id.startsWith('temp-')) {
            await (window as any).API.updateImportInvoice(inv.id, invData, inv._newFile);
          } else {
            const createdInv = await (window as any).API.createImportInvoice(finalImportId, invData, inv._newFile);
            // Relacionar líneas temporales con la factura recién creada
            const savedLines = await (window as any).API.getImportLines(finalImportId);
            for (const sl of savedLines) {
              const matching = lines.find(l => l.product_id === sl.product_id && l._temp_invoice_id === inv.id);
              if (matching) {
                await (window as any).pb.update('import_lines', sl.id, {
                  import_invoice_id: createdInv.id,
                  supplier_id: invData.supplier_id
                });
              }
            }
          }
        }
      }

      // 2. Guardar configuraciones heterogéneas de pallets (WMS)
      const savedLines = await (window as any).API.getImportLines(finalImportId);
      const allPalletConfigsToSave: any[] = [];

      lines.forEach((l) => {
        const rowIdx = l._row_idx;
        const pcs = localPalletConfigs[rowIdx] || [];
        const matchingSavedLine = savedLines.find((sl: any) => sl.product_id === l.product_id);
        const lineIdToLink = matchingSavedLine?.id || l.id || null;

        pcs.forEach((pc: any) => {
          const pQty = Number(pc.pallet_qty) || 1;
          const bPerP = Number(pc.boxes_per_pallet) || 1;
          const uPerB = Number(pc.units_per_box) || 1;
          const tBoxes = pQty * bPerP;
          const tUnits = tBoxes * uPerB;
          const height = Number(pc.height_cm) || 120;
          const isEuro = pc.pallet_type === 'EUROPALLET_120x80';
          const cbm = (1.2 * (isEuro ? 0.8 : 1.0) * (height / 100)) * pQty;

          allPalletConfigsToSave.push({
            import_id: finalImportId,
            product_id: l.product_id,
            import_line_id: lineIdToLink,
            pallet_qty: pQty,
            boxes_per_pallet: bPerP,
            units_per_box: uPerB,
            total_boxes: tBoxes,
            total_units: tUnits,
            pallet_type: pc.pallet_type || 'ESTANDAR_120x100',
            height_cm: height,
            cubic_meters: cbm,
            gross_weight_kg: Number(pc.gross_weight_kg) || 0,
            lot_number: l.lot_number || pc.lot_number || null,
          });
        });
      });

      if (allPalletConfigsToSave.length) {
        await (window as any).API.saveImportPalletConfigs(finalImportId, allPalletConfigsToSave);
      }

      (window as any).showToast(importId ? 'Importación actualizada correctamente.' : 'Importación guardada correctamente.', 'success');
      closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      const isWarning = err.message.includes('requiere peso y dimensiones') || err.message.includes('debe tener registrados');
      (window as any).showToast(err.message, isWarning ? 'warning' : 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar Borrador';
      }
    }
  });
}

// --- Detalle e Historial de Importación ---
async function viewImportDetail(importId: string) {
  try {
    const [imp, lines, invoices, palletConfigs, inventoryPallets] = await Promise.all([
      (window as any).pb.get('imports', importId, {
        expand: 'supplier_id,user_id,purchase_invoice_id,tx_fob_id,tx_freight_id,tx_insurance_id,tx_customs_id,tx_local_carrier_id,tx_local_other_id'
      }),
      (window as any).API.getImportLines(importId),
      (window as any).API.getImportInvoices(importId).catch(() => []),
      (window as any).API.getImportPalletConfigs(importId).catch(() => []),
      (window as any).API.getInventoryPallets(importId).catch(() => []),
    ]);

    const meta = IMPORT_STATUS[imp.status] || { label: imp.status, badge: 'badge-gray' };
    const supplier = imp.expand?.supplier_id;
    const user = imp.expand?.user_id;
    const transport = TRANSPORTS.find(t => t.value === imp.transport_type)?.label || imp.transport_type || '—';

    const renderStageTxLink = (label: string, tx: any, trmText: string = '') => {
      if (!tx) return `<div class="flex justify-between items-center text-[10px]"><span>${label}${trmText ? ` <span class="text-amber-700 font-mono">(${trmText})</span>` : ''}:</span> <span class="text-gray-400 italic">No causado</span></div>`;
      return `
        <div class="flex justify-between items-center text-[10px]">
          <span>${label}${trmText ? ` <span class="text-amber-700 font-mono">(${trmText})</span>` : ''}:</span>
          <button onclick="closeModal(); window.viewStageTx('${tx.id}')" class="text-blue-600 font-bold hover:underline font-mono" title="${(window as any).esc(tx.description || '')}">
            ${tx.number}
          </button>
        </div>
      `;
    };

    const modalBody = `
      <div class="space-y-6 text-sm" style="color:#374151">
        
        <!-- Header de la Importación -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl" style="background:#F4F8FF;border:1px solid #DBEAFE">
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Consecutivo</div>
            <div class="text-base font-extrabold text-blue-900 flex items-center gap-2">
              <span>${(window as any).esc(imp.number)}</span>
              ${imp.is_consolidated ? `<span class="badge badge-blue text-[10px] py-0 px-1.5">Consolidada</span>` : ''}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Estado</div>
            <div class="mt-1"><span class="badge ${meta.badge}">${meta.label}</span></div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">${imp.is_consolidated ? 'Agente / Forwarder' : 'Proveedor'}</div>
            <div class="text-sm font-semibold">${supplier ? (window as any).esc(supplier.name) : (imp.is_consolidated ? 'Múltiples Proveedores' : '—')}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Fecha Registro</div>
            <div class="text-sm font-semibold">${(window as any).esc(imp.date_created)}</div>
          </div>
        </div>

        <!-- Facturas Comerciales de Proveedores Consolidados (si aplica) -->
        ${imp.is_consolidated && invoices.length ? `
          <div class="p-4 rounded-xl border" style="background:#F0F7FF;border-color:#BFDBFE">
            <h4 class="font-bold mb-2 text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <i class="fas fa-file-invoice-dollar text-blue-600"></i> Facturas Comerciales de Proveedores Internacionales (${invoices.length})
            </h4>
            <div class="overflow-x-auto bg-white rounded-lg border border-blue-100">
              <table class="w-full text-xs text-left">
                <thead class="bg-blue-50/70 text-blue-900 font-semibold border-b border-blue-200">
                  <tr>
                    <th class="py-2 px-3">Proveedor Exterior</th>
                    <th class="py-2 px-3">Factura Nro.</th>
                    <th class="py-2 px-3">Fecha Emisión</th>
                    <th class="py-2 px-3">Vencimiento (Agenda)</th>
                    <th class="py-2 px-3 text-right">Monto FOB USD</th>
                    <th class="py-2 px-3 text-right">Monto FOB COP</th>
                    <th class="py-2 px-3 text-center">Estado Contable</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${invoices.map((inv: any) => {
                    const suppName = inv.expand?.supplier_id?.name || inv.expand?.third_party_id?.name || 'Proveedor Extranjero';
                    const invDueDate = inv.payment_due_date || inv.due_date || '—';
                    const invFob = inv.fob_amount || 0;
                    const invFobCop = invFob * (inv.exchange_rate || imp.exchange_rate);
                    const isCaused = Boolean(inv.tx_fob_id);

                    return `
                      <tr>
                        <td class="py-2 px-3 font-semibold text-slate-800">${(window as any).esc(suppName)}</td>
                        <td class="py-2 px-3 font-mono font-bold text-blue-900">${(window as any).esc(inv.invoice_number)}</td>
                        <td class="py-2 px-3 text-slate-600">${(window as any).esc(inv.invoice_date || '—')}</td>
                        <td class="py-2 px-3 font-bold text-amber-700">${(window as any).esc(invDueDate)}</td>
                        <td class="py-2 px-3 text-right font-mono font-bold text-slate-800">${(window as any).fmtN(invFob)} ${inv.currency || imp.currency}</td>
                        <td class="py-2 px-3 text-right font-mono text-slate-600">${(window as any).fmt(invFobCop)}</td>
                        <td class="py-2 px-3 text-center">
                          ${isCaused ? `
                            <button onclick="closeModal(); window.viewStageTx('${inv.tx_fob_id}')" class="badge badge-emerald text-[11px] font-bold hover:underline cursor-pointer border-0">
                              <i class="fas fa-receipt mr-1"></i> Asiento
                            </button>
                          ` : `<span class="badge badge-slate text-[11px]">⏳ Pendiente</span>`}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Bloque Logístico, Aduanero y Contabilidad -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl border col-span-1" style="background:#fff;border-color:#E5E7EB">
            <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-truck mr-1 text-blue-700"></i> Datos Logísticos</h4>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between"><span>Incoterm:</span> <span class="font-semibold">${(window as any).esc(imp.incoterm || '—')}</span></div>
              <div class="flex justify-between"><span>Guía B/L o AWB:</span> <span class="font-mono font-semibold">${(window as any).esc(imp.bl_awb || '—')}</span></div>
              <div class="flex justify-between"><span>Medio Transporte:</span> <span class="font-semibold">${transport}</span></div>
              <div class="flex justify-between"><span>Fecha Arribo (ETA):</span> <span class="font-semibold text-blue-700">${(window as any).esc(imp.estimated_arrival || '—')}</span></div>
              <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 font-semibold">
                <span>Documento B/L:</span>
                ${imp.bl_document ? `
                  <a href="${(window as any).PB_URL}/api/files/imports/${imp.id}/${imp.bl_document}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="btn btn-outline btn-xs text-blue-700 font-bold flex items-center gap-1">
                    <i class="fas fa-file-pdf"></i> Descargar B/L
                  </a>
                ` : '<span class="text-gray-400">Sin archivo adjunto</span>'}
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl border col-span-1" style="background:#fff;border-color:#E5E7EB">
            <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-scale-balanced mr-1 text-blue-700"></i> Aduanas y VUCE</h4>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between"><span>VUCE Licencia:</span> <span class="font-mono font-semibold">${(window as any).esc(imp.vuce_registro_num || '—')}</span></div>
              <div class="flex justify-between"><span>Modalidad:</span> <span class="font-semibold">${(window as any).esc(imp.modalidad_importacion || '—')}</span></div>
              <div class="flex justify-between"><span>Canal:</span> <span class="font-semibold">${imp.canal_inspeccion ? (imp.canal_inspeccion === 'AUTOMATICO' ? '🟢 Automático' : imp.canal_inspeccion === 'DOCUMENTAL' ? '🟡 Documental' : imp.canal_inspeccion === 'FISICO' ? '🔴 Físico' : '🔵 No Intrusivo') : '—'}</span></div>
              <div class="flex justify-between"><span>Declaración Nro:</span> <span class="font-mono font-semibold">${(window as any).esc(imp.dian_declaracion_num || '—')}</span></div>
              <div class="flex justify-between"><span>Levante Fecha:</span> <span class="font-semibold text-green-700">${(window as any).esc(imp.dian_levante_date || '—')}</span></div>
              <div class="flex justify-between"><span>TRM DIAN:</span> <span class="font-semibold">${imp.dian_trm ? (window as any).fmt(imp.dian_trm).replace('COP', '') + ' COP' : '—'}</span></div>
              <div class="flex justify-between"><span>Prorrateo:</span> <span class="font-semibold text-blue-700">${imp.proration_method === 'GROSS_WEIGHT' ? 'Peso Bruto' : (imp.proration_method === 'CUBIC_VOLUME' ? 'Cubicaje' : 'Valor FOB')}</span></div>
            </div>
          </div>

          <div class="p-4 rounded-xl border col-span-1 md:col-span-2 flex flex-col justify-between" style="background:#fff;border-color:#E5E7EB">
            <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-receipt mr-1 text-blue-700"></i> Integración y Causaciones Contables</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div class="space-y-1.5 text-xs">
                <div class="flex justify-between"><span>Moneda de Compra:</span> <span class="font-semibold">${(window as any).esc(imp.currency)}</span></div>
                <div class="flex justify-between"><span>Tasa de Cambio (TRM):</span> <span class="font-semibold">${(window as any).fmt(imp.exchange_rate).replace('COP', '')} COP</span></div>
                <div class="flex justify-between"><span>Registrado Por:</span> <span class="font-semibold">${user ? (window as any).esc(user.full_name) : '—'}</span></div>
                <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 font-semibold text-gray-700">
                  <span>Estado Contable:</span>
                  ${imp.status === 'recibido' ? `
                    <span class="badge badge-green"><i class="fas fa-check-circle mr-1"></i> Capitalizado en Bodega</span>
                  ` : `
                    <span class="badge badge-orange"><i class="fas fa-clock mr-1"></i> Tránsito / Pendiente</span>
                  `}
                </div>
              </div>
              <div class="space-y-1 text-xs border-l pl-4 border-gray-100">
                <div class="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">Causaciones por Etapa</div>
                ${renderStageTxLink('FOB Mercancía', imp.expand?.tx_fob_id, `TRM ${(window as any).fmt(imp.exchange_rate).replace('COP', '')}`)}
                ${renderStageTxLink('Flete Internacional', imp.expand?.tx_freight_id, `TRM ${(window as any).fmt(imp.freight_trm || imp.freight_exchange_rate || imp.exchange_rate).replace('COP', '')}`)}
                ${renderStageTxLink('Seguro Internacional', imp.expand?.tx_insurance_id, `TRM ${(window as any).fmt(imp.insurance_trm || imp.insurance_exchange_rate || imp.exchange_rate).replace('COP', '')}`)}
                ${renderStageTxLink('Aduanas / DIAN', imp.expand?.tx_customs_id, imp.customs_trm || imp.dian_trm ? `TRM ${(window as any).fmt(imp.customs_trm || imp.dian_trm).replace('COP', '')}` : '')}
                ${renderStageTxLink('Transporte Local', imp.expand?.tx_local_carrier_id, imp.local_carrier_trm && imp.local_carrier_trm !== 1 ? `TRM ${(window as any).fmt(imp.local_carrier_trm).replace('COP', '')}` : 'COP')}
                ${renderStageTxLink('Otros Gastos', imp.expand?.tx_local_other_id, imp.local_other_trm && imp.local_other_trm !== 1 ? `TRM ${(window as any).fmt(imp.local_other_trm).replace('COP', '')}` : 'COP')}
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Artículos con Lotes y Palletizado -->
        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <div class="px-4 py-2 flex items-center justify-between" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
            <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes-packing mr-1 text-blue-700"></i> Detalle de Mercancía y Hoja de Costos</span>
            <span class="text-xs text-gray-500">${lines.length} líneas registradas</span>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="min-width:240px">Producto & Especificaciones</th>
                  ${imp.is_consolidated ? `<th style="min-width:160px">Proveedor Exterior</th>` : ''}
                  <th class="text-right">Cant.</th>
                  <th class="text-right">FOB (${imp.currency})</th>
                  <th class="text-right">Arancel %</th>
                  <th>Nro. Manifiesto</th>
                  <th class="text-center">Soporte PDF</th>
                  <th class="text-right">Gasto Prorr. (COP)</th>
                  <th class="text-right">Costo Unit COP</th>
                  <th class="text-right">Total COP</th>
                </tr>
              </thead>
              <tbody>
                ${lines.map((l: any) => {
                  const prod = l.expand?.product_id;
                  const supp = l.expand?.supplier_id;
                  const manifestLink = l.manifest_file ? `
                    <a href="${(window as any).PB_URL}/api/files/import_lines/${l.id}/${l.manifest_file}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="text-blue-600 font-bold hover:underline" title="Ver manifiesto">
                      <i class="fas fa-file-pdf"></i> PDF
                    </a>
                  ` : '—';

                  // Pallets count for this line
                  const linePallets = palletConfigs.filter((pc: any) => pc.import_line_id === l.id || pc.product_id === l.product_id);
                  const totalPlts = linePallets.reduce((s: number, p: any) => s + (p.pallet_qty || 0), 0);
                  const totalBxs = linePallets.reduce((s: number, p: any) => s + (p.total_boxes || (p.pallet_qty * p.boxes_per_pallet) || 0), 0);

                  return `
                    <tr>
                      <td class="font-medium">
                        <div class="font-bold text-slate-900">${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}</div>
                        <div class="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                          <span>Origen: ${(window as any).esc(l.pais_origen || '—')}</span>
                          <span>Cert: ${(window as any).esc(l.certificado_origen_num || '—')}</span>
                          <span>Pos: ${(window as any).esc(l.posicion_arancelaria || '—')}</span>
                          <span>P.Bruto: ${(l.peso_bruto_total || 0).toFixed(2)} Kg</span>
                          ${l.cubic_meters_total ? `<span>CBM: ${(l.cubic_meters_total).toFixed(3)} m³</span>` : ''}
                        </div>
                        ${(l.lot_number || totalPlts > 0) ? `
                          <div class="mt-1 flex items-center gap-1.5 flex-wrap">
                            ${l.lot_number ? `
                              <span class="badge badge-blue text-[10px] font-mono py-0 px-1.5 font-bold">
                                <i class="fas fa-barcode mr-1"></i>Lote: ${(window as any).esc(l.lot_number)}
                              </span>
                              ${l.expiry_date ? `<span class="text-[10px] text-rose-700 font-semibold">Vence: ${(window as any).esc(l.expiry_date.split(' ')[0])}</span>` : ''}
                            ` : ''}
                            ${totalPlts > 0 ? `
                              <span class="badge badge-purple text-[10px] font-mono py-0 px-1.5 font-bold" style="background:#F5F3FF;color:#6D28D9;border:1px solid #DDD6FE">
                                <i class="fas fa-boxes-stacked mr-1"></i>${totalPlts} plts (${totalBxs} cjs)
                              </span>
                            ` : ''}
                          </div>
                        ` : ''}
                      </td>
                      ${imp.is_consolidated ? `
                        <td class="text-xs font-semibold text-slate-700">${supp ? (window as any).esc(supp.name) : '—'}</td>
                      ` : ''}
                      <td class="text-right font-semibold">${(window as any).fmtN(l.qty)}</td>
                      <td class="text-right">${(window as any).fmt(l.fob_price).replace('COP', '')}</td>
                      <td class="text-right text-gray-500">${l.arancel_rate}%</td>
                      <td class="font-mono text-xs">${(window as any).esc(l.manifest_number || '—')}</td>
                      <td class="text-center">${manifestLink}</td>
                      <td class="text-right text-gray-600">${(window as any).fmt(l.prorated_cost || 0)}</td>
                      <td class="text-right font-semibold text-blue-800">${(window as any).fmt(l.unit_cost_cop || 0)}</td>
                      <td class="text-right font-bold">${(window as any).fmt(l.total_cop || 0)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sección de Costos Generales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border" style="background:#fff;border-color:#E5E7EB">
            <h4 class="font-bold mb-2 text-xs uppercase tracking-wider text-gray-500">Hoja de Costos (COP)</h4>
            <div class="space-y-1.5 text-xs font-semibold text-gray-600">
              <div class="flex justify-between"><span>FOB Mercancía COP:</span> <span class="font-bold text-gray-800">${(window as any).fmt(imp.fob_total * imp.exchange_rate)}</span></div>
              <div class="flex justify-between">
                <span>Flete (${(window as any).fmtN(imp.freight_cost || 0)} ${imp.currency} @ ${(window as any).fmt(imp.freight_trm || imp.freight_exchange_rate || imp.exchange_rate).replace('COP', '')}):</span>
                <span class="font-bold text-gray-800">${(window as any).fmt((imp.freight_cost || 0) * (imp.freight_trm || imp.freight_exchange_rate || imp.exchange_rate))}</span>
              </div>
              <div class="flex justify-between">
                <span>Seguro (${(window as any).fmtN(imp.insurance_cost || 0)} ${imp.currency} @ ${(window as any).fmt(imp.insurance_trm || imp.insurance_exchange_rate || imp.exchange_rate).replace('COP', '')}):</span>
                <span class="font-bold text-gray-800">${(window as any).fmt((imp.insurance_cost || 0) * (imp.insurance_trm || imp.insurance_exchange_rate || imp.exchange_rate))}</span>
              </div>
              <div class="flex justify-between"><span>Aranceles Liquidados COP:</span> <span class="font-bold text-gray-800">${(window as any).fmt(imp.arancel_total || 0)}</span></div>
              <div class="flex justify-between"><span>Gastos Aduana / DIAN COP:</span> <span class="font-bold text-gray-800">${(window as any).fmt(imp.gastos_nacionalizacion || 0)}</span></div>
              <div class="flex justify-between">
                <span>Transporte Local ${imp.local_carrier_trm && imp.local_carrier_trm !== 1 ? `(@ TRM ${(window as any).fmt(imp.local_carrier_trm).replace('COP', '')})` : 'COP'}:</span> 
                <span class="font-bold text-gray-800">${(window as any).fmt((imp.transporte_nacional || 0) * (imp.local_carrier_trm || 1))}</span>
              </div>
              <div class="flex justify-between">
                <span>Otros Gastos ${imp.local_other_trm && imp.local_other_trm !== 1 ? `(@ TRM ${(window as any).fmt(imp.local_other_trm).replace('COP', '')})` : 'COP'}:</span> 
                <span class="font-bold text-gray-800">${(window as any).fmt((imp.otros_gastos || 0) * (imp.local_other_trm || 1))}</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl border flex flex-col justify-center items-center" style="background:#F4F8FF;border-color:#DBEAFE">
            <div class="text-xs text-blue-600 uppercase font-bold tracking-widest">Landed Cost COP (Total)</div>
            <div class="text-3xl font-extrabold text-blue-900 mt-1">${(window as any).fmt(imp.total)}</div>
          </div>
        </div>

      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-secondary text-indigo-700" style="border-color:#6366f1" onclick="window.viewImportPalletsLabels('${imp.id}')">
        <i class="fas fa-qrcode mr-1"></i> Rótulos de Estibas (LPN)
      </button>
      <button class="btn btn-secondary text-blue-700" style="border-color:#3b82f6" onclick="window.viewImportTraceability('${imp.id}')">
        <i class="fas fa-chart-line mr-1"></i> Trazabilidad
      </button>
      ${imp.status !== 'recibido' && imp.status !== 'anulado' && (window as any).can('canWrite') ? `
        <button class="btn btn-secondary" onclick="closeModal(); window.editImport('${imp.id}')"><i class="fas fa-pen"></i> Editar</button>
        <button class="btn btn-primary" onclick="closeModal(); window.confirmFinalizarImportacion('${imp.id}')"><i class="fas fa-check-double"></i> Recibir e Ingresar a Bodega</button>
      ` : ''}
    `;

    (window as any).openModal(`Detalle de Importación — ${imp.number}`, modalBody, footer, true);
  } catch (err: any) {
    (window as any).showToast('Error al abrir detalle: ' + err.message, 'error');
  }
}

// --- Vista e Impresión de Rótulos / Etiquetas de Estibas (LPN/QR) ---
async function viewImportPalletsLabels(importId: string) {
  try {
    const [imp, lines, palletConfigs, inventoryPallets] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id' }),
      (window as any).API.getImportLines(importId),
      (window as any).API.getImportPalletConfigs(importId).catch(() => []),
      (window as any).API.getInventoryPallets(importId).catch(() => []),
    ]);

    // Construir lista de pallets a rotular (reales si ya existen, o proyectados según palletConfigs)
    let displayPallets: any[] = [];

    if (inventoryPallets && inventoryPallets.length) {
      displayPallets = inventoryPallets.map((ip: any) => {
        const prod = ip.expand?.product_id;
        const lot = ip.expand?.inventory_lot_id;
        return {
          lpn: ip.pallet_code,
          productCode: prod?.code || '',
          productName: prod?.name || 'Producto',
          lotNumber: lot?.lot_number || 'S/L',
          expiryDate: lot?.expiry_date ? lot.expiry_date.split(' ')[0] : '—',
          boxes: ip.boxes_current ?? ip.boxes_initial ?? 1,
          unitsPerBox: ip.units_per_box || 1,
          totalUnits: ip.units_available || ((ip.boxes_current || 1) * (ip.units_per_box || 1)),
          palletType: ip.pallet_type || 'ESTANDAR_120x100',
          status: ip.status || 'disponible'
        };
      });
    } else if (palletConfigs && palletConfigs.length) {
      let lpnSeq = 1;
      palletConfigs.forEach((pc: any) => {
        const line = lines.find((l: any) => l.id === pc.import_line_id || l.product_id === pc.product_id);
        const prod = line?.expand?.product_id;
        const count = Number(pc.pallet_qty) || 1;

        for (let i = 0; i < count; i++) {
          const lpnCode = `PLT-${imp.number || 'IMP'}-${String(lpnSeq).padStart(3, '0')}`;
          displayPallets.push({
            lpn: lpnCode,
            productCode: prod?.code || '',
            productName: prod?.name || 'Producto',
            lotNumber: pc.lot_number || line?.lot_number || 'S/L',
            expiryDate: line?.expiry_date ? line.expiry_date.split(' ')[0] : '—',
            boxes: pc.boxes_per_pallet || 1,
            unitsPerBox: pc.units_per_box || 1,
            totalUnits: (pc.boxes_per_pallet || 1) * (pc.units_per_box || 1),
            palletType: pc.pallet_type || 'ESTANDAR_120x100',
            status: 'proyectado'
          });
          lpnSeq++;
        }
      });
    }

    if (!displayPallets.length) {
      (window as any).showToast('Esta importación no tiene configuraciones de pallets registradas.', 'warning');
      return;
    }

    const labelsHtml = displayPallets.map((p, idx) => `
      <div class="border-2 border-slate-900 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between print:break-inside-avoid print:border-black" style="min-height:260px">
        <div>
          <!-- Header de etiqueta -->
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
            <div>
              <span class="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">GRAVY WMS · UNIDAD LOGÍSTICA</span>
              <h3 class="text-sm font-black text-slate-900 leading-tight">IMPORTACIÓN #${(window as any).esc(imp.number)}</h3>
            </div>
            <div class="text-right">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300">ESTIBA #${idx + 1}/${displayPallets.length}</span>
            </div>
          </div>

          <!-- LPN Grande y Código de Barras -->
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center my-2">
            <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">License Plate Number (LPN / SSCC)</div>
            <div class="text-xl font-black font-mono tracking-wider text-blue-950">${p.lpn}</div>
            
            <!-- Simulación visual de código de barras Code128 -->
            <div class="flex items-center justify-center gap-[2px] h-9 my-1">
              ${[...Array(38)].map((_, bIdx) => `
                <div style="width:${(bIdx % 3 === 0 || bIdx % 7 === 0) ? '3px' : '1.5px'}; height:100%; background:#000;"></div>
              `).join('')}
            </div>
            <div class="text-[10px] font-mono text-slate-700 tracking-widest">${p.lpn}</div>
          </div>

          <!-- Información del Producto y Lote -->
          <div class="space-y-1.5 text-xs mt-3">
            <div class="flex items-baseline justify-between">
              <span class="font-bold text-slate-500 text-[10px] uppercase">PRODUCTO:</span>
              <span class="font-mono font-extrabold text-blue-900">[${p.productCode || 'S/C'}]</span>
            </div>
            <div class="font-black text-sm text-slate-900 truncate">${(window as any).esc(p.productName)}</div>

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 mt-2">
              <div>
                <span class="text-[10px] text-slate-500 font-bold uppercase block">Lote Fabr.</span>
                <span class="font-mono font-extrabold text-xs text-indigo-900">${(window as any).esc(p.lotNumber)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 font-bold uppercase block">Fecha Venc.</span>
                <span class="font-mono font-extrabold text-xs text-rose-700">${(window as any).esc(p.expiryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del rótulo con empaque -->
        <div class="pt-2 border-t-2 border-slate-900 mt-3 flex items-center justify-between text-xs">
          <div>
            <span class="text-[10px] text-slate-500 font-bold uppercase block">Empaque</span>
            <span class="font-black text-slate-900">${p.boxes} Cajas × ${p.unitsPerBox} Und</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-500 font-bold uppercase block">Total Estiba</span>
            <span class="text-base font-black text-emerald-800 font-mono">${p.totalUnits.toLocaleString()} Und</span>
          </div>
        </div>
      </div>
    `).join('');

    const modalContent = `
      <div class="space-y-4">
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fas fa-print text-blue-600 text-base"></i>
            <div>
              <p class="font-bold">Rótulos Estándar de Almacenamiento (WMS / LPN) — ${displayPallets.length} Estibas</p>
              <p class="text-[11px] text-blue-700">Imprime estas etiquetas adhesivas para colocarlas en los cuatro costados de cada pallet al desembarcar del contenedor.</p>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm flex items-center gap-1.5" onclick="window.print()">
            <i class="fas fa-print"></i> Imprimir Rótulos
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="print-labels-container">
          ${labelsHtml}
        </div>
      </div>
    `;

    (window as any).openModal(`Rótulos de Estibas — Importación ${imp.number}`, modalContent, `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print mr-1"></i> Imprimir</button>`, true);

  } catch (err: any) {
    (window as any).showToast('Error cargando rótulos de estibas: ' + err.message, 'error');
  }
}
(window as any).viewImportPalletsLabels = viewImportPalletsLabels;


// --- Acción: Finalizar e Ingresar a Bodega (Capitalización) ---
async function confirmFinalizarImportacion(importId: string) {
  try {
    const [imp, lines] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id' }),
      (window as any).API.getImportLines(importId),
    ]);

    if (imp.status === 'recibido') {
      throw new Error('Esta importación ya ha sido finalizada y capitalizada.');
    }

    const [warehouses, txTypes] = await Promise.all([
      (window as any).API.getWarehouses(true),
      (window as any).API.getTxTypes(),
    ]);

    const formHtml = `
      <div class="space-y-4 text-sm" style="color:#374151">
        <div class="p-4 rounded-xl" style="background:#FFFBEB;border:1px solid #FDE68A;color:#92400E">
          <p class="font-bold"><i class="fas fa-triangle-exclamation mr-1"></i>¡Atención!</p>
          <p class="text-xs">Estás por finalizar la importación <strong>${imp.number}</strong>. Esta acción creará automáticamente una Factura de Compra (FC) en estado borrador con los costos calculados en pesos (COP) e ingresará los productos a la bodega correspondiente.</p>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Bodega de Destino <span style="color:#EF4444">*</span></label>
          <select id="cap-warehouse-id" class="form-input">
            <option value="">— Seleccionar —</option>
            ${warehouses.map((w: any) => `<option value="${w.id}">${(window as any).esc(w.name)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Tipo Comprobante Contable <span style="color:#EF4444">*</span></label>
          <select id="cap-tx-type-id" class="form-input">
            <option value="">— Seleccionar —</option>
            ${txTypes.map((t: any) => `<option value="${t.id}">${(window as any).esc(t.prefix)} — ${(window as any).esc(t.name)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Número de Comprobante Factura <span style="color:#EF4444">*</span></label>
          <input type="text" id="cap-tx-number" class="form-input" placeholder="Ej: FC-00289" value="FC-IMP-${imp.number.split('-').pop()}">
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-cap"><i class="fas fa-check"></i> Finalizar y Capitalizar</button>
    `;

    (window as any).openModal('Capitalización de Importación', formHtml, footer, false);

    document.getElementById('btn-confirm-cap')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-confirm-cap') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Capitalizando...';
      }

      try {
        const whId = (document.getElementById('cap-warehouse-id') as HTMLSelectElement)?.value;
        const txTypeId = (document.getElementById('cap-tx-type-id') as HTMLSelectElement)?.value;
        const txNumber = (document.getElementById('cap-tx-number') as HTMLInputElement)?.value.trim();

        if (!whId) throw new Error('Por favor selecciona la bodega de destino de los productos.');
        if (!txTypeId) throw new Error('Por favor selecciona el tipo de comprobante contable.');
        if (!txNumber) throw new Error('Por favor ingresa la numeración del comprobante de compra.');

        // 1. Ejecutar la capitalización contable directa y liberar reservas de clientes asociadas
        const capResult = await SupplyChainOrchestrator.finalizeImportAndReleaseReservations(importId, whId, txTypeId, txNumber);

        const resMsg = capResult.releasedReservationsCount > 0 ? ` Se liberaron ${capResult.releasedReservationsCount} reservas para despacho inmediato.` : '';
        (window as any).showToast(`Importación finalizada. Traslado a bodega registrado.${resMsg}`, 'success');
        closeModal();
        
        // Recargar página
        const container = document.getElementById('page-content');
        if (container) renderImportaciones(container);
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-check"></i> Finalizar y Capitalizar';
        }
      }
    });
  } catch (err: any) {
    (window as any).showToast('Error en proceso: ' + err.message, 'error');
  }
}

// --- Acción: Anular Importación ---
async function cancelImportDirect(importId: string, number: string) {
  (window as any).confirmDialog(
    'Anular Importación',
    `¿Deseas anular la importación <strong>${number}</strong>? Esta acción no se puede deshacer.`,
    async () => {
      try {
        await (window as any).API.cancelImport(importId, 'Anulado manualmente desde la interfaz de usuario');
        (window as any).showToast('Importación anulada.', 'success');
        const container = document.getElementById('page-content');
        if (container) renderImportaciones(container);
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      }
    }
  );
}

// Exponer funciones globalmente para acceder desde onclick o eventos
(window as any).renderImportaciones = renderImportaciones;
(window as any).editImport = (id: string) => openImportForm(id, () => {
  const container = document.getElementById('page-content');
  if (container) renderImportaciones(container);
});
(window as any).viewImportDetail = viewImportDetail;
(window as any).confirmFinalizarImportacion = confirmFinalizarImportacion;
(window as any).cancelImportDirect = cancelImportDirect;
(window as any).viewStageTx = (txId: string) => {
  (window as any).closeModal();
  setTimeout(() => {
    if (typeof (window as any).seeTxDetail === 'function') {
      (window as any).seeTxDetail(txId);
    } else {
      (window as any).showToast('No se encontró el visualizador de transacciones.', 'error');
    }
  }, 300);
};

async function openImportSettingsModal(onSaved = null) {
  try {
    const [cfg, accounts] = await Promise.all([
      (window as any).API.getImportConfig(),
      (window as any).API.getAccounts(true),
    ]);

    const accountOptions = (selectedCode = '') => {
      const rows = accounts
        .filter((a: any) => a.active && Number(a.level) >= 3)
        .sort((a: any, b: any) => a.code.localeCompare(b.code));
      return `<option value="">— Sin definir —</option>${rows.map((a: any) => `<option value="${(window as any).esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${(window as any).esc(a.code)} — ${(window as any).esc(a.name)}</option>`).join('')}`;
    };

    const modalBody = `
      <div class="space-y-5 text-sm" style="color:#374151; max-height: 70vh; overflow-y: auto;">
        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-book mr-2"></i>Parámetros contables de importaciones</h4>
          <p class="text-xs mb-4" style="color:#6B7280">Estas cuentas se usan para debitar activos en tránsito, registrar IVA e individualizar los pasivos por cada tipo de gasto.</p>
          
          <h5 class="font-bold text-xs uppercase tracking-wider text-blue-700 mb-3 border-b pb-1">1. Cuentas de Activo y Tránsito (Débitos)</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div class="form-group">
              <label class="form-label font-bold text-xs">Mercancías en Tránsito</label>
              <select id="imp-cfg-transito" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.transito_account_code || '143505')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Inventario en Bodega</label>
              <select id="imp-cfg-inventario" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.inventario_account_code || '143501')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Anticipos a Proveedores</label>
              <select id="imp-cfg-anticipo" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.anticipo_account_code || '133025')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">IVA Descontable por Importaciones</label>
              <select id="imp-cfg-iva" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.iva_account_code || '240810')}
              </select>
            </div>
          </div>

          <h5 class="font-bold text-xs uppercase tracking-wider text-blue-700 mb-3 border-b pb-1">2. Cuentas de Proveedores y Acreedores (Créditos)</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label font-bold text-xs">Proveedores de Mercancía</label>
              <select id="imp-cfg-fob" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.fob_payable_account_code || '220505')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Flete Internacional</label>
              <select id="imp-cfg-freight" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.freight_payable_account_code || '233545')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Seguro Internacional</label>
              <select id="imp-cfg-insurance" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.insurance_payable_account_code || '233555')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Aduana / DIAN (Tasas y Brokerage)</label>
              <select id="imp-cfg-customs" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.customs_payable_account_code || '233595')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Arancel</label>
              <select id="imp-cfg-arancel" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.arancel_payable_account_code || '233595')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Transporte Local</label>
              <select id="imp-cfg-local-carrier" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.local_carrier_payable_account_code || '233545')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold text-xs">Otros Gastos</label>
              <select id="imp-cfg-local-other" class="form-input py-1 text-xs">
                ${accountOptions(cfg.accounting?.accounts?.local_other_payable_account_code || '233595')}
              </select>
            </div>
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-save-imp-config"><i class="fas fa-floppy-disk"></i> Guardar configuración</button>
    `;

    (window as any).openModal('Configuración de Importaciones', modalBody, footer, false);

    document.getElementById('btn-save-imp-config')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-save-imp-config') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
      }

      try {
        const transito = (document.getElementById('imp-cfg-transito') as HTMLSelectElement)?.value || '143505';
        const inventario = (document.getElementById('imp-cfg-inventario') as HTMLSelectElement)?.value || '143501';
        const anticipo = (document.getElementById('imp-cfg-anticipo') as HTMLSelectElement)?.value || '133025';
        const iva = (document.getElementById('imp-cfg-iva') as HTMLSelectElement)?.value || '240810';

        const fob = (document.getElementById('imp-cfg-fob') as HTMLSelectElement)?.value || '220505';
        const freight = (document.getElementById('imp-cfg-freight') as HTMLSelectElement)?.value || '233545';
        const insurance = (document.getElementById('imp-cfg-insurance') as HTMLSelectElement)?.value || '233555';
        const customs = (document.getElementById('imp-cfg-customs') as HTMLSelectElement)?.value || '233595';
        const arancel = (document.getElementById('imp-cfg-arancel') as HTMLSelectElement)?.value || '233595';
        const localCarrier = (document.getElementById('imp-cfg-local-carrier') as HTMLSelectElement)?.value || '233545';
        const localOther = (document.getElementById('imp-cfg-local-other') as HTMLSelectElement)?.value || '233595';

        const payload = {
          accounting: {
            accounts: {
              transito_account_code: transito,
              inventario_account_code: inventario,
              anticipo_account_code: anticipo,
              iva_account_code: iva,
              fob_payable_account_code: fob,
              freight_payable_account_code: freight,
              insurance_payable_account_code: insurance,
              customs_payable_account_code: customs,
              arancel_payable_account_code: arancel,
              local_carrier_payable_account_code: localCarrier,
              local_other_payable_account_code: localOther
            }
          }
        };

        await (window as any).API.saveImportConfig(payload);
        (window as any).showToast('Configuración de importaciones guardada con éxito', 'success');
        closeModal();
        if (onSaved) (onSaved as any)();
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error al guardar la configuración', 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar configuración';
        }
      }
    });

  } catch (err: any) {
    (window as any).showToast('Error al cargar configuración: ' + err.message, 'error');
  }
}

(window as any).openImportSettingsModal = openImportSettingsModal;

async function viewImportTraceability(importId: string) {
  try {
    const data = await (window as any).API.getImportTraceabilityData(importId);
    const imp = data.import;
    const lines = data.lines;
    const transactions = data.transactions;
    const purchaseInvoices = data.purchaseInvoices;

    const supplier = imp.expand?.supplier_id;
    const transport = TRANSPORTS.find(t => t.value === imp.transport_type)?.label || imp.transport_type || '—';

    // 1. Tabla de Productos Prorrateados
    const productRows = lines.map((l: any) => {
      const prod = l.expand?.product_id;
      const totalFobCop = l.qty * l.fob_price * imp.exchange_rate;
      return `
        <tr style="border-bottom:1px solid #E5E7EB">
          <td class="p-2 font-medium">
            ${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}
            <div class="text-[10px] text-gray-400 mt-0.5">
              <span>Orig: ${(window as any).esc(l.pais_origen || '—')}</span> | 
              <span>Cert: ${(window as any).esc(l.certificado_origen_num || '—')}</span> | 
              <span>Pos: ${(window as any).esc(l.posicion_arancelaria || '—')}</span> | 
              <span>P.Bruto: ${(l.peso_bruto_total || 0).toFixed(2)} Kg</span>
            </div>
          </td>
          <td class="p-2 text-right">${(window as any).fmtN(l.qty)}</td>
          <td class="p-2 text-right">${(window as any).fmt(l.fob_price).replace('COP', '')}</td>
          <td class="p-2 text-right">${(window as any).fmt(totalFobCop)}</td>
          <td class="p-2 text-right">${(window as any).fmt(l.prorated_cost || 0)}</td>
          <td class="p-2 text-right">${(window as any).fmt(l.arancel_amount || 0)}</td>
          <td class="p-2 text-right font-semibold text-blue-800">${(window as any).fmt(l.unit_cost_cop || 0)}</td>
          <td class="p-2 text-right font-bold text-gray-800">${(window as any).fmt(l.total_cop || 0)}</td>
        </tr>
      `;
    }).join('');

    // 2. Transacciones Financieras Relacionadas (Egresos, Anticipos)
    let financeRows = '';
    if (!transactions.length) {
      financeRows = `
        <tr>
          <td colspan="5" class="p-4 text-center text-gray-400 font-medium">
            <i class="fas fa-money-bill-transfer mr-2"></i>No se han registrado pagos o anticipos en tesorería para esta importación.
          </td>
        </tr>
      `;
    } else {
      financeRows = transactions.map((t: any) => {
        const activeAmount = t.lines.reduce((s: number, l: any) => s + Math.max(l.debit, l.credit), 0) / 2;
        return `
          <tr style="border-bottom:1px solid #F3F4F6">
            <td class="p-2 font-mono font-bold text-blue-800">${(window as any).esc(t.number)}</td>
            <td class="p-2">${t.date.slice(0, 10)}</td>
            <td class="p-2 text-xs">${(window as any).esc(t.description)}</td>
            <td class="p-2 text-xs font-semibold text-gray-700">${t.lines.map((l: any) => l.third_party_name).filter((v: any, i: any, a: any) => v && a.indexOf(v) === i).join(', ') || '—'}</td>
            <td class="p-2 text-right font-bold text-green-700">${(window as any).fmt(activeAmount)}</td>
          </tr>
        `;
      }).join('');
    }

    // 3. Facturas de Compra Capitalizadas
    let fcRows = '';
    if (!purchaseInvoices.length) {
      fcRows = `
        <tr>
          <td colspan="5" class="p-4 text-center text-gray-400 font-medium">
            <i class="fas fa-file-invoice mr-2"></i>No hay facturas de compra capitalizadas aún.
          </td>
        </tr>
      `;
    } else {
      fcRows = purchaseInvoices.map((inv: any) => `
        <tr style="border-bottom:1px solid #F3F4F6">
          <td class="p-2 font-mono font-bold text-blue-800">${(window as any).esc(inv.number)}</td>
          <td class="p-2">${inv.date}</td>
          <td class="p-2 font-medium">${inv.expand?.supplier_id ? (window as any).esc(inv.expand.supplier_id.name) : '—'}</td>
          <td class="p-2">${inv.expand?.warehouse_id ? (window as any).esc(inv.expand.warehouse_id.name) : '—'}</td>
          <td class="p-2 text-right font-bold">${(window as any).fmt(inv.total)}</td>
        </tr>
      `).join('');
    }

    const modalBody = `
      <div class="space-y-6 text-sm" style="color:#374151">
        <!-- Resumen General -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl" style="background:#F0FDF4;border:1px solid #BBF7D0">
          <div>
            <div class="text-[10px] text-green-700 uppercase font-bold tracking-wider">Nro Importación</div>
            <div class="text-base font-extrabold text-green-950">${(window as any).esc(imp.number)}</div>
          </div>
          <div>
            <div class="text-[10px] text-green-700 uppercase font-bold tracking-wider">Estado Logístico</div>
            <div class="mt-0.5"><span class="badge badge-green">${(window as any).esc(imp.status).toUpperCase()}</span></div>
          </div>
          <div>
            <div class="text-[10px] text-green-700 uppercase font-bold tracking-wider">Proveedor FOB</div>
            <div class="text-sm font-semibold text-green-900">${supplier ? (window as any).esc(supplier.name) : '—'}</div>
          </div>
          <div>
            <div class="text-[10px] text-green-700 uppercase font-bold tracking-wider">Valor Total Landed</div>
            <div class="text-base font-extrabold text-green-950">${(window as any).fmt(imp.total)}</div>
          </div>
        </div>

        <!-- 1. Desglose de Costos de Productos -->
        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <div class="px-4 py-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
            <span class="text-sm font-bold text-gray-800"><i class="fas fa-boxes-packing mr-2 text-blue-700"></i>Costeo Unitario Prorrateado (Landed Cost)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs" style="border-collapse:collapse">
              <thead class="bg-gray-50 text-gray-500 font-semibold" style="border-bottom:1px solid #E5E7EB">
                <tr>
                  <th class="p-2 text-left">Producto</th>
                  <th class="p-2 text-right">Cant.</th>
                  <th class="p-2 text-right">FOB (${imp.currency})</th>
                  <th class="p-2 text-right">FOB (COP)</th>
                  <th class="p-2 text-right">Fletes/Seg (COP)</th>
                  <th class="p-2 text-right">Aranceles (COP)</th>
                  <th class="p-2 text-right">Costo Unit Landed</th>
                  <th class="p-2 text-right">Total Landed</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Pagos y Anticipos (Tesorería) -->
        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <div class="px-4 py-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
            <span class="text-sm font-bold text-gray-800"><i class="fas fa-money-bill-transfer mr-2 text-blue-700"></i>Pagos y Anticipos Contabilizados en Tesorería</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs" style="border-collapse:collapse">
              <thead class="bg-gray-50 text-gray-500 font-semibold" style="border-bottom:1px solid #E5E7EB">
                <tr>
                  <th class="p-2 text-left">Nro Transacción</th>
                  <th class="p-2 text-left">Fecha</th>
                  <th class="p-2 text-left">Concepto</th>
                  <th class="p-2 text-left">Tercero / Beneficiario</th>
                  <th class="p-2 text-right">Monto Pagado</th>
                </tr>
              </thead>
              <tbody>
                ${financeRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Facturas de Compra Generadas -->
        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <div class="px-4 py-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
            <span class="text-sm font-bold text-gray-800"><i class="fas fa-file-invoice mr-2 text-blue-700"></i>Facturas de Compra (FC) de Capitalización</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs" style="border-collapse:collapse">
              <thead class="bg-gray-50 text-gray-500 font-semibold" style="border-bottom:1px solid #E5E7EB">
                <tr>
                  <th class="p-2 text-left">Nro Factura</th>
                  <th class="p-2 text-left">Fecha</th>
                  <th class="p-2 text-left">Proveedor</th>
                  <th class="p-2 text-left">Bodega</th>
                  <th class="p-2 text-right">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                ${fcRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary" id="btn-print-traceability"><i class="fas fa-print mr-2"></i>Imprimir Reporte</button>
    `;

    (window as any).openModal(`Reporte de Trazabilidad Completa — ${imp.number}`, modalBody, footer, true);

    setTimeout(() => {
      document.getElementById('btn-print-traceability')?.addEventListener('click', async () => {
        const printHtml = await buildTraceabilityPrintHTML(data);
        const w = window.open('', '_blank', 'width=950,height=800');
        if (w) {
          w.document.write(printHtml);
          w.document.close();
        }
      });
    }, 150);

  } catch (err: any) {
    (window as any).showToast('Error al cargar trazabilidad: ' + err.message, 'error');
  }
}

async function buildTraceabilityPrintHTML(data: any) {
  const imp = data.import;
  const lines = data.lines;
  const transactions = data.transactions;
  const purchaseInvoices = data.purchaseInvoices;

  const supplier = imp.expand?.supplier_id;
  const transport = TRANSPORTS.find((t: any) => t.value === imp.transport_type)?.label || imp.transport_type || '—';

  let emp = { name: '', nit: '', address: '', phone: '', email: '' };
  try {
    const sets = await (window as any).pb.listAll('settings', {});
    const m: any = Object.fromEntries(sets.map((s: any) => [s.key, s.value || '']));
    emp = {
      name: m.company_name || '',
      nit: m.company_nit || '',
      address: m.company_address || '',
      phone: m.company_phone || '',
      email: m.company_email || ''
    };
  } catch (_) {}

  const productRows = lines.map((l: any) => {
    const prod = l.expand?.product_id;
    const totalFobCop = l.qty * l.fob_price * imp.exchange_rate;
    return `
      <tr style="border-bottom:1px solid #E5E7EB">
        <td style="padding:6px;font-size:11px">
          ${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}
          <div style="font-size:9px;color:#6B7280;margin-top:2px">
            <span>Orig: ${(window as any).esc(l.pais_origen || '—')}</span> | 
            <span>Cert: ${(window as any).esc(l.certificado_origen_num || '—')}</span> | 
            <span>Pos: ${(window as any).esc(l.posicion_arancelaria || '—')}</span> | 
            <span>P.Bruto: ${(l.peso_bruto_total || 0).toFixed(2)} Kg</span>
          </div>
        </td>
        <td style="padding:6px;text-align:right;font-size:11px">${(window as any).fmtN(l.qty)}</td>
        <td style="padding:6px;text-align:right;font-size:11px">${(window as any).fmt(l.fob_price).replace('COP', '')}</td>
        <td style="padding:6px;text-align:right;font-size:11px">${(window as any).fmt(totalFobCop)}</td>
        <td style="padding:6px;text-align:right;font-size:11px">${(window as any).fmt(l.prorated_cost || 0)}</td>
        <td style="padding:6px;text-align:right;font-size:11px">${(window as any).fmt(l.arancel_amount || 0)}</td>
        <td style="padding:6px;text-align:right;font-size:11px;font-weight:bold">${(window as any).fmt(l.unit_cost_cop || 0)}</td>
        <td style="padding:6px;text-align:right;font-size:11px;font-weight:bold">${(window as any).fmt(l.total_cop || 0)}</td>
      </tr>
    `;
  }).join('');

  const financeRows = transactions.length 
    ? transactions.map((t: any) => {
        const activeAmount = t.lines.reduce((s: number, l: any) => s + Math.max(l.debit, l.credit), 0) / 2;
        return `
          <tr style="border-bottom:1px solid #E5E7EB">
            <td style="padding:6px;font-size:11px;font-family:monospace">${(window as any).esc(t.number)}</td>
            <td style="padding:6px;font-size:11px">${t.date.slice(0,10)}</td>
            <td style="padding:6px;font-size:11px">${(window as any).esc(t.description)}</td>
            <td style="padding:6px;font-size:11px">${t.lines.map((l: any) => l.third_party_name).filter((v: any, i: any, a: any) => v && a.indexOf(v) === i).join(', ')}</td>
            <td style="padding:6px;text-align:right;font-size:11px;font-weight:bold;color:#1D6F42">${(window as any).fmt(activeAmount)}</td>
          </tr>
        `;
      }).join('')
    : `<tr><td colspan="5" style="padding:10px;text-align:center;color:#9CA3AF;font-style:italic">No hay transacciones registradas en tesorería.</td></tr>`;

  const fcRows = purchaseInvoices.length
    ? purchaseInvoices.map((inv: any) => `
        <tr style="border-bottom:1px solid #E5E7EB">
          <td style="padding:6px;font-size:11px;font-family:monospace">${(window as any).esc(inv.number)}</td>
          <td style="padding:6px;font-size:11px">${inv.date}</td>
          <td style="padding:6px;font-size:11px">${inv.expand?.supplier_id ? (window as any).esc(inv.expand.supplier_id.name) : '—'}</td>
          <td style="padding:6px;font-size:11px">${inv.expand?.warehouse_id ? (window as any).esc(inv.expand.warehouse_id.name) : '—'}</td>
          <td style="padding:6px;text-align:right;font-size:11px;font-weight:bold">${(window as any).fmt(inv.total)}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="5" style="padding:10px;text-align:center;color:#9CA3AF;font-style:italic">No hay facturas de compra capitalizadas.</td></tr>`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Trazabilidad Importación ${imp.number}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; padding: 20px; line-height: 1.4; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #1A4B8C; padding-bottom: 10px; }
        .company-info h1 { font-size: 18px; margin: 0; color: #0D2137; }
        .company-info p { font-size: 11px; color: #6B7280; margin: 2px 0; }
        .doc-title { text-align: right; }
        .doc-title h2 { font-size: 20px; color: #1A4B8C; margin: 0; }
        .doc-title p { font-size: 12px; margin: 2px 0; font-weight: bold; }
        .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #F3F4F6; border-radius: 8px; padding: 12px; margin-bottom: 20px; }
        .summary-card { font-size: 11px; }
        .summary-card span { display: block; color: #6B7280; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
        .summary-card strong { font-size: 13px; color: #111827; }
        .section-title { font-size: 13px; font-weight: bold; color: #0D2137; margin: 15px 0 6px; text-transform: uppercase; border-left: 3px solid #1A4B8C; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { background: #F9FAFB; padding: 6px; text-align: left; font-size: 11px; color: #4B5563; border-bottom: 1px solid #E5E7EB; }
        td { padding: 6px; font-size: 11px; border-bottom: 1px solid #F3F4F6; }
        .text-right { text-align: right; }
        .no-print { text-align: center; margin-top: 30px; }
        .btn-print { padding: 8px 20px; background: #1A4B8C; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>${(window as any).esc(emp.name)}</h1>
          <p>NIT: ${(window as any).esc(emp.nit)}</p>
          <p>${(window as any).esc(emp.address)}</p>
          <p>${(window as any).esc(emp.phone)} | ${(window as any).esc(emp.email)}</p>
        </div>
        <div class="doc-title">
          <h2>Trazabilidad de Importación</h2>
          <p>Referencia: ${(window as any).esc(imp.number)}</p>
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-card"><span>Proveedor FOB</span><strong>${supplier ? (window as any).esc(supplier.name) : '—'}</strong></div>
        <div class="summary-card"><span>Medio Transporte</span><strong>${transport}</strong></div>
        <div class="summary-card"><span>B/L o AWB</span><strong>${(window as any).esc(imp.bl_awb || '—')}</strong></div>
        <div class="summary-card"><span>TRM (COP)</span><strong>${(window as any).fmt(imp.exchange_rate).replace('COP', '')}</strong></div>
      </div>

      <div class="summary-box" style="background:#ECFDF5; border:1px solid #A7F3D0">
        <div class="summary-card"><span>FOB Mercancía (COP)</span><strong>${(window as any).fmt(imp.fob_total * imp.exchange_rate)}</strong></div>
        <div class="summary-card"><span>Fletes + Seguros (COP)</span><strong>${(window as any).fmt(imp.total_gastos_cif || 0)}</strong></div>
        <div class="summary-card"><span>Aranceles DIAN (COP)</span><strong>${(window as any).fmt(imp.arancel_total || 0)}</strong></div>
        <div class="summary-card"><span>Landed Cost Total (COP)</span><strong>${(window as any).fmt(imp.total)}</strong></div>
      </div>

      <div class="section-title">1. Liquidación de Costeo por Producto</div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th class="text-right">Cant.</th>
            <th class="text-right">FOB (${imp.currency})</th>
            <th class="text-right">FOB (COP)</th>
            <th class="text-right">Fletes/Seg (COP)</th>
            <th class="text-right">Aranceles (COP)</th>
            <th class="text-right">Costo Unit Landed</th>
            <th class="text-right">Total Landed</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <div class="section-title">2. Relación de Egresos y Pagos (Tesorería)</div>
      <table>
        <thead>
          <tr>
            <th>Transacción</th>
            <th>Fecha</th>
            <th>Concepto / Notas</th>
            <th>Tercero Beneficiario</th>
            <th class="text-right">Valor Pagado</th>
          </tr>
        </thead>
        <tbody>
          ${financeRows}
        </tbody>
      </table>

      <div class="section-title">3. Facturación de Compra Asociada (Capitalización)</div>
      <table>
        <thead>
          <tr>
            <th>Nro Factura</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Bodega Destino</th>
            <th class="text-right">Total Facturado</th>
          </tr>
        </thead>
        <tbody>
          ${fcRows}
        </tbody>
      </table>

      <div class="no-print">
        <button class="btn-print" onclick="window.print()">Imprimir Reporte</button>
      </div>
    </body>
    </html>
  `;
}

(window as any).viewImportTraceability = viewImportTraceability;
