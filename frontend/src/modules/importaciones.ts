/**
 * GRAVY v2.0 — importaciones.ts
 * Módulo de Gestión de Importaciones.
 * Permite registrar y gestionar compras internacionales, logística de tránsito,
 * nacionalización, carga de documentos (B/L y Manifiestos), prorrateo de costos
 * y capitalización a bodega mediante facturas de compra.
 */

'use strict';

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
  document.getElementById('btn-import-config')?.addEventListener('click', () => openImportSettingsModal(() => _loadImportacionesPage(c)));

  const applyFilter = () => filterImportTable();
  document.getElementById('imp-q')?.addEventListener('input', applyFilter);
  document.getElementById('imp-status-f')?.addEventListener('change', applyFilter);
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
  const transport = TRANSPORTS.find(t => t.value === imp.transport_type)?.label || imp.transport_type || '—';
  
  return `
    <tr data-impid="${(window as any).esc(imp.id)}" data-impstatus="${(window as any).esc(imp.status)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(imp.number)}</span></td>
      <td>${(window as any).esc(imp.date_created)}</td>
      <td class="font-medium">${supplier ? (window as any).esc(supplier.name) : '—'}</td>
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
          
          ${imp.status === 'recibido' && imp.purchase_invoice_id ? `
            <span class="badge badge-green" title="Factura de compra generada"><i class="fas fa-file-invoice mr-1"></i>Capitalizado</span>
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

  const [suppliers, products] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getProducts({ activeOnly: true }),
  ]);

  if (importId) {
    [imp, existingLines] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id' }),
      (window as any).API.getImportLines(importId),
    ]);
  }

  let lineCounter = 0;
  const consecutive = imp?.number || 'AUTO';

  const formHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      
      <!-- 1. Datos Generales -->
      <div class="p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
        <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-circle-info mr-1 text-blue-700"></i> Información General</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group col-span-1 md:col-span-2">
            <label class="form-label font-bold">Proveedor Internacional <span style="color:#EF4444">*</span></label>
            <div id="imp-supplier-search-wrap" class="relative">
              <input id="imp-supplier-search" class="form-input" autocomplete="off" placeholder="Buscar proveedor por NIT o nombre...">
              <input id="imp-supplier-id" type="hidden" value="${(window as any).esc(imp?.supplier_id || '')}">
              <div id="imp-supplier-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:180px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
            </div>
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
            <label class="form-label font-bold">Tasa Cambio (COP) <span style="color:#EF4444">*</span></label>
            <input type="number" id="imp-exchange-rate" class="form-input" min="1" step="0.01" value="${imp?.exchange_rate || '4000.00'}" oninput="window.impRecalcTotals()">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Nro. Consecutivo</label>
            <input id="imp-number" class="form-input" readonly value="${(window as any).esc(consecutive)}" style="background:#F3F4F6">
          </div>

          <div class="form-group">
            <label class="form-label font-bold">Notas / Comentarios</label>
            <input id="imp-notes" class="form-input" placeholder="Observaciones generales..." value="${(window as any).esc(imp?.notes || '')}">
          </div>
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

      <!-- 3. Detalle de Artículos y Manifiestos -->
      <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes-packing mr-1 text-blue-700"></i> Mercancía de Importación</span>
          <button type="button" class="btn btn-primary btn-sm" id="btn-add-imp-line"><i class="fas fa-plus"></i> Agregar artículo</button>
        </div>

        <div style="overflow-x:auto;max-height:280px;overflow-y:auto">
          <table class="data-table" id="imp-lines-table" style="min-width:1050px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:220px;background:#F4F8FF">Producto</th>
                <th class="text-right" style="width:75px;background:#F4F8FF">Cant.</th>
                <th class="text-right" style="width:110px;background:#F4F8FF" id="lbl-th-fob-price">P. FOB (USD)</th>
                <th class="text-right" style="width:85px;background:#F4F8FF">Arancel %</th>
                <th class="text-right" style="width:85px;background:#F4F8FF">IVA %</th>
                <th style="min-width:180px;background:#F4F8FF">Nro. Manifiesto</th>
                <th style="width:170px;background:#F4F8FF">Archivo Manifiesto (PDF)</th>
                <th class="text-right" style="width:115px;background:#F4F8FF">Costo Est. (COP)</th>
                <th class="text-right" style="width:115px;background:#F4F8FF">Total (COP)</th>
                <th style="width:58px;background:#F4F8FF">Acción</th>
              </tr>
            </thead>
            <tbody id="imp-lines-body"></tbody>
          </table>
        </div>
      </div>

      <!-- 4. Liquidación y Gastos de Nacionalización (COP) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Gastos en Colombia (COP / USD) -->
        <div class="p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
          <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-calculator mr-1 text-blue-700"></i> Liquidación de Gastos de Importación</h4>
          
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold" id="lbl-freight-cost">Flete Internacional (USD)</label>
                <input type="number" id="imp-freight-cost" class="form-input text-right" min="0" step="0.01" value="${imp?.freight_cost || '0'}" oninput="window.impRecalcTotals()">
              </div>
              <div class="form-group">
                <label class="form-label font-bold" id="lbl-insurance-cost">Seguro Internacional (USD)</label>
                <input type="number" id="imp-insurance-cost" class="form-input text-right" min="0" step="0.01" value="${imp?.insurance_cost || '0'}" oninput="window.impRecalcTotals()">
              </div>
            </div>

            <div class="h-px bg-gray-200 my-2"></div>

            <div class="grid grid-cols-3 gap-2">
              <div class="form-group">
                <label class="form-label font-bold text-xs">Gastos Nacionalización (COP)</label>
                <input type="number" id="imp-gastos-nacionalizacion" class="form-input text-right" min="0" step="1" value="${imp?.gastos_nacionalizacion || '0'}" oninput="window.impRecalcTotals()">
              </div>
              <div class="form-group">
                <label class="form-label font-bold text-xs">Transporte Nacional (COP)</label>
                <input type="number" id="imp-transporte-nacional" class="form-input text-right" min="0" step="1" value="${imp?.transporte_nacional || '0'}" oninput="window.impRecalcTotals()">
              </div>
              <div class="form-group">
                <label class="form-label font-bold text-xs">Otros Gastos Locales (COP)</label>
                <input type="number" id="imp-otros-gastos" class="form-input text-right" min="0" step="1" value="${imp?.otros_gastos || '0'}" oninput="window.impRecalcTotals()">
              </div>
            </div>
          </div>
        </div>

        <!-- Resultados Generales -->
        <div class="p-4 rounded-xl border flex flex-col justify-between" style="background:#F4F8FF;border-color:#DBEAFE">
          <div>
            <h4 class="font-bold mb-3" style="color:#1E40AF"><i class="fas fa-file-invoice-dollar mr-1"></i> Resumen de Hoja de Costos</h4>
            
            <div class="space-y-1.5 text-xs font-semibold">
              <div class="flex justify-between text-gray-600"><span>FOB Mercancía (COP):</span> <span id="lbl-res-fob-cop">$ 0</span></div>
              <div class="flex justify-between text-gray-600"><span>Gastos CIF en Red (Flete + Seguro COP):</span> <span id="lbl-res-cif-cop">$ 0</span></div>
              <div class="flex justify-between text-gray-600"><span>Arancel e Impuestos DIAN (Total COP):</span> <span id="lbl-res-arancel-cop">$ 0</span></div>
              <div class="flex justify-between text-gray-600"><span>Otros Gastos en Puerto y Transporte COP:</span> <span id="lbl-res-locales-cop">$ 0</span></div>
            </div>
          </div>

          <div class="border-t pt-3 mt-3 border-blue-200">
            <div class="flex justify-between text-base font-extrabold text-blue-900">
              <span>COSTO TOTAL IMPORTACIÓN:</span>
              <span id="lbl-res-total-cop" class="text-lg text-blue-700">$ 0</span>
            </div>
          </div>
        </div>
      </div>
      
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
  }

  (window as any).selectImpSupplier = function(id: string, text: string) {
    const hidden = document.getElementById('imp-supplier-id') as HTMLInputElement;
    const input = document.getElementById('imp-supplier-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
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

  // Cambiar etiquetas dinámicas según divisa
  (window as any).impUpdateCurrencyLabel = function() {
    const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const thFobPrice = document.getElementById('lbl-th-fob-price');
    const lblFreight = document.getElementById('lbl-freight-cost');
    const lblInsurance = document.getElementById('lbl-insurance-cost');

    if (thFobPrice) thFobPrice.textContent = `P. FOB (${currency})`;
    if (lblFreight) lblFreight.textContent = `Flete Internacional (${currency})`;
    if (lblInsurance) lblInsurance.textContent = `Seguro Internacional (${currency})`;

    window.impRecalcTotals();
  };

  // Agregar línea de artículo
  (window as any).addImpLine = function(line: any = null, fileUrl: string = '') {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('imp-lines-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.id = `imp-row-${idx}`;
    tr.setAttribute('data-lineid', line?.id || '');
    tr.innerHTML = `
      <td>
        <div id="impl-prod-wrap-${idx}" class="relative">
          <input id="impl-prod-search-${idx}" class="form-input w-full" autocomplete="off" placeholder="Buscar producto...">
          <input type="hidden" id="impl-prod-id-${idx}" value="${line?.product_id || ''}">
          <div id="impl-prod-results-${idx}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:160px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td><input type="number" id="impl-qty-${idx}" class="form-input text-right w-full font-semibold" min="0.001" step="0.001" value="${line?.qty || '1'}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-price-${idx}" class="form-input text-right w-full" min="0" step="0.01" value="${line?.fob_price || ''}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-arancel-${idx}" class="form-input text-right w-full" min="0" max="100" step="0.1" value="${line?.arancel_rate ?? '10'}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-iva-${idx}" class="form-input text-right w-full" min="0" max="100" step="1" value="${line?.iva_rate ?? '19'}" oninput="window.impRecalcTotals()"></td>
      <td><input type="text" id="impl-manifest-num-${idx}" class="form-input w-full font-mono text-xs" placeholder="Ej: 260500..." value="${line?.manifest_number || ''}"></td>
      <td>
        <div class="flex items-center gap-1.5">
          <input type="file" id="file-manifest-${idx}" accept="application/pdf,image/*" style="display:none" onchange="window.impHandleFileSelect('manifest_file_${idx - 1}', this.files)">
          <button type="button" class="btn btn-outline btn-sm w-full py-1 text-xs" onclick="document.getElementById('file-manifest-${idx}').click()">
            <i class="fas fa-upload"></i> <span id="lbl-manifest-${idx - 1}">${line?.manifest_file ? 'Reemplazar' : 'Adjuntar PDF'}</span>
          </button>
          ${line?.manifest_file ? `
            <a href="${(window as any).PB_URL}/api/files/import_lines/${line.id}/${line.manifest_file}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="btn btn-outline btn-sm p-1.5 text-blue-600" title="Ver manifiesto actual">
              <i class="fas fa-file-pdf"></i>
            </a>
          ` : ''}
        </div>
      </td>
      <td class="text-right font-semibold" style="color:#4B5563" id="impl-unit-cop-${idx}">$ 0</td>
      <td class="text-right font-bold text-blue-700" id="impl-total-cop-${idx}">$ 0</td>
      <td class="text-center">
        <button type="button" class="btn btn-danger btn-sm p-1.5" onclick="this.closest('tr').remove(); window.impRecalcTotals();" title="Quitar línea"><i class="fas fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    // Autocomplete del producto
    const input = document.getElementById(`impl-prod-search-${idx}`) as HTMLInputElement;
    const hidden = document.getElementById(`impl-prod-id-${idx}`) as HTMLInputElement;
    const results = document.getElementById(`impl-prod-results-${idx}`);
    const priceInput = document.getElementById(`impl-price-${idx}`) as HTMLInputElement;
    const arancelInput = document.getElementById(`impl-arancel-${idx}`) as HTMLInputElement;

    if (line && line.product_id) {
      const match = products.find(p => p.id === line.product_id);
      if (match) input.value = `${match.code} - ${match.name}`;
    }

    const performProdSearch = (val: string) => {
      const q = val.toLowerCase().trim();
      const filtered = !q 
        ? products.slice(0, 30) 
        : products.filter(p => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 30);

      if (!filtered.length) {
        if (results) results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      if (results) {
        results.innerHTML = filtered.map(p => `
          <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                  onclick="window.selectImpLineProduct(${idx}, '${(window as any).esc(p.id)}', '${(window as any).esc(p.code)} - ${(window as any).esc(p.name)}', ${p.cost_price || 0})">
            <div class="font-bold text-gray-800">${(window as any).esc(p.name)}</div>
            <div class="text-[10px] text-gray-500">SKU: ${p.code} | C. Compra: ${(window as any).fmt(p.cost_price || 0)}</div>
          </button>
        `).join('');
      }
    };

    input.addEventListener('focus', () => { performProdSearch(input.value); if (results) results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performProdSearch(input.value); if (results) results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { if (results) results.style.display = 'none'; }, 200); });
  };

  (window as any).selectImpLineProduct = function(idx: number, id: string, label: string, refPrice: number) {
    const input = document.getElementById(`impl-prod-search-${idx}`) as HTMLInputElement;
    const hidden = document.getElementById(`impl-prod-id-${idx}`) as HTMLInputElement;
    const priceInput = document.getElementById(`impl-price-${idx}`) as HTMLInputElement;

    if (input && hidden && priceInput) {
      input.value = label;
      hidden.value = id;
      
      // Intentar sugerir precio en la divisa correspondiente
      const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
      const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');
      if (currency !== 'COP' && refPrice > 0) {
        priceInput.value = (refPrice / exchangeRate).toFixed(2);
      } else {
        priceInput.value = String(refPrice);
      }

      window.impRecalcTotals();
    }
  };

  // CALCULADORA DE PRORRATEO Y LIQUIDACIÓN EN TIEMPO REAL
  (window as any).impRecalcTotals = function() {
    const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
    
    // Gastos en divisa original
    const freightCostVal = parseFloat((document.getElementById('imp-freight-cost') as HTMLInputElement)?.value || '0');
    const insuranceCostVal = parseFloat((document.getElementById('imp-insurance-cost') as HTMLInputElement)?.value || '0');

    // Gastos locales en COP
    const localPortVal = parseFloat((document.getElementById('imp-gastos-nacionalizacion') as HTMLInputElement)?.value || '0');
    const localFreightVal = parseFloat((document.getElementById('imp-transporte-nacional') as HTMLInputElement)?.value || '0');
    const localOtherVal = parseFloat((document.getElementById('imp-otros-gastos') as HTMLInputElement)?.value || '0');

    const totalCIFExpensesCOP = (freightCostVal + insuranceCostVal) * exchangeRate;
    const totalLocalExpensesCOP = localPortVal + localFreightVal + localOtherVal;
    const totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

    let totalFOBCop = 0;
    const rows = document.querySelectorAll('#imp-lines-body tr');
    
    // 1. Primer barrido para calcular el FOB Total en pesos (COP)
    const activeLines: any[] = [];
    rows.forEach(row => {
      const idx = row.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const fobPrice = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
      const arancelRate = parseFloat((document.getElementById(`impl-arancel-${idx}`) as HTMLInputElement)?.value || '0');
      const ivaRate = parseFloat((document.getElementById(`impl-iva-${idx}`) as HTMLInputElement)?.value || '0');
      const productId = (document.getElementById(`impl-prod-id-${idx}`) as HTMLInputElement)?.value;

      if (productId && qty > 0 && fobPrice >= 0) {
        const lineFOBCop = qty * fobPrice * exchangeRate;
        totalFOBCop += lineFOBCop;
        activeLines.push({ idx, qty, fobPrice, arancelRate, ivaRate, lineFOBCop });
      }
    });

    let arancelTotalCOP = 0;
    let grandTotalCOP = 0;

    // 2. Segundo barrido para aplicar prorrateo (FOB weight factor) y calcular unit_cost_cop
    activeLines.forEach(l => {
      const { idx, qty, arancelRate, lineFOBCop } = l;
      
      // Proporción FOB
      const weightFactor = totalFOBCop > 0 ? (lineFOBCop / totalFOBCop) : 0;
      const lineProratedCOP = weightFactor * totalExpensesToProrateCOP;

      // Calcular arancel liquidado sobre valor FOB en COP
      const lineArancelCOP = lineFOBCop * (arancelRate / 100);
      arancelTotalCOP += lineArancelCOP;

      // Costo nacionalizado total en COP para la línea
      const lineTotalCOP = lineFOBCop + lineProratedCOP + lineArancelCOP;
      const unitCostCOP = qty > 0 ? (lineTotalCOP / qty) : 0;

      // Actualizar UI de la línea
      const unitCostEl = document.getElementById(`impl-unit-cop-${idx}`);
      const totalCostEl = document.getElementById(`impl-total-cop-${idx}`);

      if (unitCostEl) unitCostEl.textContent = (window as any).fmt(unitCostCOP);
      if (totalCostEl) totalCostEl.textContent = (window as any).fmt(lineTotalCOP);

      grandTotalCOP += lineTotalCOP;
    });

    // Costo total de importación es FOB + todos los gastos prorrateados + aranceles acumulados
    const finalTotalCOP = totalFOBCop + totalExpensesToProrateCOP + arancelTotalCOP;

    // Actualizar Panel de Totales
    const resFob = document.getElementById('lbl-res-fob-cop');
    const resCif = document.getElementById('lbl-res-cif-cop');
    const resArancel = document.getElementById('lbl-res-arancel-cop');
    const resLocales = document.getElementById('lbl-res-locales-cop');
    const resTotal = document.getElementById('lbl-res-total-cop');

    if (resFob) resFob.textContent = (window as any).fmt(totalFOBCop);
    if (resCif) resCif.textContent = (window as any).fmt(totalCIFExpensesCOP);
    if (resArancel) resArancel.textContent = (window as any).fmt(arancelTotalCOP);
    if (resLocales) resLocales.textContent = (window as any).fmt(totalLocalExpensesCOP);
    if (resTotal) resTotal.textContent = (window as any).fmt(finalTotalCOP);
  };

  // Cargar líneas existentes
  if (existingLines.length) {
    existingLines.forEach((l: any) => (window as any).addImpLine(l));
  } else {
    (window as any).addImpLine();
  }

  document.getElementById('btn-add-imp-line')?.addEventListener('click', () => (window as any).addImpLine());
  
  // Ejecutar primera calculadora al abrir
  setTimeout(() => (window as any).impUpdateCurrencyLabel(), 100);

  // Guardar Borrador
  document.getElementById('btn-save-import')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-import') as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
    }

    try {
      const supplierId = (document.getElementById('imp-supplier-id') as HTMLInputElement)?.value;
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

      if (!supplierId) throw new Error('Por favor selecciona un proveedor internacional.');
      if (exchangeRate <= 0) throw new Error('La tasa de cambio debe ser un número positivo.');

      // Totales
      const totalCIFExpensesCOP = (freightCost + insuranceCost) * exchangeRate;
      const totalLocalExpensesCOP = gastosNacionalizacion + transporteNacional + otrosGastos;
      const totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

      const lines: any[] = [];
      const rows = document.querySelectorAll('#imp-lines-body tr');
      let totalFOB = 0;
      let arancelTotalCOP = 0;

      rows.forEach((row, i) => {
        const idx = row.id.split('-').pop();
        const lineId = row.getAttribute('data-lineid') || null;
        const productId = (document.getElementById(`impl-prod-id-${idx}`) as HTMLInputElement)?.value;
        const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
        const fobPrice = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
        const arancelRate = parseFloat((document.getElementById(`impl-arancel-${idx}`) as HTMLInputElement)?.value || '0');
        const ivaRate = parseFloat((document.getElementById(`impl-iva-${idx}`) as HTMLInputElement)?.value || '0');
        const manifestNumber = (document.getElementById(`impl-manifest-num-${idx}`) as HTMLInputElement)?.value.trim() || null;

        if (!productId) {
          throw new Error(`Por favor selecciona un producto válido en la línea ${i + 1}.`);
        }
        if (qty <= 0) {
          throw new Error(`La cantidad debe ser mayor a cero en la línea ${i + 1}.`);
        }
        if (fobPrice < 0) {
          throw new Error(`El precio FOB no puede ser negativo en la línea ${i + 1}.`);
        }

        const lineFOBCop = qty * fobPrice * exchangeRate;
        totalFOB += (qty * fobPrice);

        lines.push({
          id: lineId,
          product_id: productId,
          qty,
          fob_price: fobPrice,
          arancel_rate: arancelRate,
          iva_rate: ivaRate,
          manifest_number: manifestNumber,
          // Se llenarán en background al aplicar la fórmula
          lineFOBCop,
        });
      });

      if (!lines.length) throw new Error('La importación debe tener al menos un producto.');

      // Finalizar cálculos para guardado
      const totalFOBCop = totalFOB * exchangeRate;
      lines.forEach(l => {
        const weightFactor = totalFOBCop > 0 ? (l.lineFOBCop / totalFOBCop) : 0;
        l.prorated_cost = weightFactor * totalExpensesToProrateCOP;
        l.arancel_amount = l.lineFOBCop * (l.arancel_rate / 100);
        l.iva_amount = l.lineFOBCop * (l.iva_rate / 100);
        
        const lineTotalCOP = l.lineFOBCop + l.prorated_cost + l.arancel_amount;
        l.unit_cost_cop = l.qty > 0 ? (lineTotalCOP / l.qty) : 0;
        l.total_cop = lineTotalCOP;
        
        arancelTotalCOP += l.arancel_amount;
        delete l.lineFOBCop; // Quitar campo temporal
      });

      const grandTotalCOP = totalFOBCop + totalExpensesToProrateCOP + arancelTotalCOP;

      const header: any = {
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
        insurance_cost: insuranceCost,
        gastos_nacionalizacion: gastosNacionalizacion,
        transporte_nacional: transporteNacional,
        otros_gastos: otrosGastos,
        fob_total: totalFOB,
        arancel_total: arancelTotalCOP,
        total_gastos_cif: totalCIFExpensesCOP,
        total_gastos_locales: totalLocalExpensesCOP,
        total: grandTotalCOP,
      };

      if (importId) {
        header.number = imp.number;
        await (window as any).API.updateImport(importId, header, lines, currentUploadedFiles);
        (window as any).showToast('Importación actualizada correctamente', 'success');
      } else {
        const nextNum = await (window as any).API.nextImportConsecutive();
        header.number = nextNum;
        await (window as any).API.createImport(header, lines, currentUploadedFiles);
        (window as any).showToast('Importación guardada correctamente', 'success');
      }

      closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
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
    const [imp, lines] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id,user_id,purchase_invoice_id' }),
      (window as any).API.getImportLines(importId),
    ]);

    const meta = IMPORT_STATUS[imp.status] || { label: imp.status, badge: 'badge-gray' };
    const supplier = imp.expand?.supplier_id;
    const user = imp.expand?.user_id;
    const transport = TRANSPORTS.find(t => t.value === imp.transport_type)?.label || imp.transport_type || '—';

    const modalBody = `
      <div class="space-y-6 text-sm" style="color:#374151">
        
        <!-- Header de la Importación -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl" style="background:#F4F8FF;border:1px solid #DBEAFE">
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Consecutivo</div>
            <div class="text-base font-extrabold text-blue-900">${(window as any).esc(imp.number)}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Estado</div>
            <div class="mt-1"><span class="badge ${meta.badge}">${meta.label}</span></div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Proveedor</div>
            <div class="text-sm font-semibold">${supplier ? (window as any).esc(supplier.name) : '—'}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase font-bold">Fecha Registro</div>
            <div class="text-sm font-semibold">${(window as any).esc(imp.date_created)}</div>
          </div>
        </div>

        <!-- Bloque Logístico y Contabilidad -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border" style="background:#fff;border-color:#E5E7EB">
            <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-truck mr-1 text-blue-700"></i> Datos Logísticos</h4>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between"><span>Incoterm:</span> <span class="font-semibold">${(window as any).esc(imp.incoterm || '—')}</span></div>
              <div class="flex justify-between"><span>Guía B/L o AWB:</span> <span class="font-mono font-semibold">${(window as any).esc(imp.bl_awb || '—')}</span></div>
              <div class="flex justify-between"><span>Medio Transporte:</span> <span class="font-semibold">${transport}</span></div>
              <div class="flex justify-between"><span>Fecha Arribo (ETA):</span> <span class="font-semibold text-blue-700">${(window as any).esc(imp.estimated_arrival || '—')}</span></div>
              <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <span>Documento B/L:</span>
                ${imp.bl_document ? `
                  <a href="${(window as any).PB_URL}/api/files/imports/${imp.id}/${imp.bl_document}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="btn btn-outline btn-xs text-blue-700 font-bold flex items-center gap-1">
                    <i class="fas fa-file-pdf"></i> Descargar B/L
                  </a>
                ` : '<span class="text-gray-400">Sin archivo adjunto</span>'}
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl border" style="background:#fff;border-color:#E5E7EB">
            <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-receipt mr-1 text-blue-700"></i> Integración Contable</h4>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between"><span>Moneda de Compra:</span> <span class="font-semibold">${(window as any).esc(imp.currency)}</span></div>
              <div class="flex justify-between"><span>Tasa de Cambio (TRM):</span> <span class="font-semibold">${(window as any).fmt(imp.exchange_rate).replace('COP', '')} COP</span></div>
              <div class="flex justify-between"><span>Registrado Por:</span> <span class="font-semibold">${user ? (window as any).esc(user.full_name) : '—'}</span></div>
              <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <span>Factura de Compra:</span>
                ${imp.purchase_invoice_id ? `
                  <button onclick="closeModal(); window.viewPurchaseDetail('${(window as any).esc(imp.purchase_invoice_id)}')" class="btn btn-outline btn-xs text-green-700 font-bold flex items-center gap-1">
                    <i class="fas fa-file-invoice"></i> Ver Factura FC
                  </button>
                ` : '<span class="badge badge-orange">Pendiente por Capitalizar</span>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Artículos Prorrateados -->
        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <div class="px-4 py-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
            <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes-packing mr-1 text-blue-700"></i> Detalle de Artículos y Manifiestos</span>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código - Producto</th>
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
                  const manifestLink = l.manifest_file ? `
                    <a href="${(window as any).PB_URL}/api/files/import_lines/${l.id}/${l.manifest_file}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="text-blue-600 font-bold hover:underline" title="Ver manifiesto">
                      <i class="fas fa-file-pdf"></i> PDF
                    </a>
                  ` : '—';

                  return `
                    <tr>
                      <td class="font-medium">${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}</td>
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
              <div class="flex justify-between"><span>Fletes y Seguros CIF COP:</span> <span class="font-bold text-gray-800">${(window as any).fmt(imp.total_gastos_cif || 0)}</span></div>
              <div class="flex justify-between"><span>Aranceles Liquidados COP:</span> <span class="font-bold text-gray-800">${(window as any).fmt(imp.arancel_total || 0)}</span></div>
              <div class="flex justify-between"><span>Otros Gastos Locales COP:</span> <span class="font-bold text-gray-800">${(window as any).fmt(imp.total_gastos_locales || 0)}</span></div>
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
      <button class="btn btn-secondary text-blue-700" style="border-color:#3b82f6" onclick="window.viewImportTraceability('${imp.id}')"><i class="fas fa-chart-line mr-1"></i> Trazabilidad</button>
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

        // 1. Estructurar factura de compra a partir de los datos de importación
        const fcHeader = {
          number: txNumber,
          date: imp.date_created,
          due_date: (window as any).addDaysToDateStr(imp.date_created, 30),
          supplier_id: imp.supplier_id,
          supplier_ref: `IMP: ${imp.number} | B/L: ${imp.bl_awb || 'S/N'}`,
          tx_type_id: txTypeId,
          tx_number: txNumber,
          warehouse_id: whId,
          notes: `Importación capitalizada automáticamente. Consecutivo origen: ${imp.number}.`,
          import_id: importId
        };

        const fcLines = lines.map((l: any, idx: number) => {
          // El precio unitario de compra contable ya es el Landed Cost (FOB + Prorrateo + Arancel)
          return {
            product_id: l.product_id,
            qty: l.qty,
            unit_price: l.unit_cost_cop,
            iva_rate: l.iva_rate || 0,
            subtotal: l.qty * l.unit_cost_cop,
            iva_amount: (l.qty * l.unit_cost_cop) * ((l.iva_rate || 0) / 100),
            total: (l.qty * l.unit_cost_cop) * (1 + ((l.iva_rate || 0) / 100)),
            line_order: idx + 1
          };
        });

        // 2. Crear borrador de factura de compra
        const createdInvoice = await (window as any).API.createPurchaseInvoice(fcHeader, fcLines);

        // 3. Actualizar estado de importación a recibido y enlazar factura
        await (window as any).pb.update('imports', importId, {
          status: 'recibido',
          purchase_invoice_id: createdInvoice.id
        });

        (window as any).showToast(`Importación finalizada. Se generó borrador de factura ${txNumber}.`, 'success');
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
      <div class="space-y-5 text-sm" style="color:#374151">
        <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-book mr-2"></i>Parámetros contables de importaciones</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Estas cuentas se usan para acumular gastos durante el tránsito y realizar la posterior capitalización a bodega.</p>
          
          <div class="space-y-4">
            <div class="form-group">
              <label class="form-label font-bold">Cuenta de Mercancías en Tránsito (Db)</label>
              <select id="imp-cfg-transito" class="form-input">
                ${accountOptions(cfg.accounting?.accounts?.transito_account_code || '143505')}
              </select>
              <p class="text-[10px] text-gray-500 mt-1">Cuenta puente transitoria para acumular FOB, fletes, seguros y gastos locales de nacionalización.</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">Cuenta de Inventario en Bodega (Db)</label>
              <select id="imp-cfg-inventario" class="form-input">
                ${accountOptions(cfg.accounting?.accounts?.inventario_account_code || '143501')}
              </select>
              <p class="text-[10px] text-gray-500 mt-1">Cuenta definitiva donde ingresa el inventario físico al finalizar la importación.</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">Cuenta de Anticipos a Proveedores de Importación (Db)</label>
              <select id="imp-cfg-anticipo" class="form-input">
                ${accountOptions(cfg.accounting?.accounts?.anticipo_account_code || '133025')}
              </select>
              <p class="text-[10px] text-gray-500 mt-1">Cuenta utilizada en egresos de tesorería antes de radicar las facturas correspondientes.</p>
            </div>

            <div class="form-group">
              <label class="form-label font-bold">Cuenta de IVA Descontable por Importaciones (Db)</label>
              <select id="imp-cfg-iva" class="form-input">
                ${accountOptions(cfg.accounting?.accounts?.iva_account_code || '240810')}
              </select>
              <p class="text-[10px] text-gray-500 mt-1">Cuenta del IVA descontable liquidado en la declaración de importación.</p>
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

        const payload = {
          accounting: {
            accounts: {
              transito_account_code: transito,
              inventario_account_code: inventario,
              anticipo_account_code: anticipo,
              iva_account_code: iva
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
          <td class="p-2 font-medium">${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}</td>
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
        <td style="padding:6px;font-size:11px">${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}</td>
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
