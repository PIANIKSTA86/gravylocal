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

        <div style="overflow-x:auto;max-height:280px;overflow-y:auto">
          <table class="data-table" id="imp-lines-table" style="min-width:1050px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:220px;background:#F4F8FF">Producto</th>
                <th class="text-right" style="width:95px;background:#F4F8FF">Cant.</th>
                <th class="text-right" style="width:135px;background:#F4F8FF" id="lbl-th-fob-price">P. FOB (USD)</th>
                <th class="text-right" style="width:95px;background:#F4F8FF">Arancel %</th>
                <th class="text-right" style="width:95px;background:#F4F8FF">IVA %</th>
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

      <!-- 4. Causaciones por Etapas y Gastos de Nacionalización -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Tabla de Causaciones Contables -->
        <div class="p-4 rounded-xl border col-span-1" style="background:#F9FAFB;border-color:#E5E7EB">
          <h4 class="font-bold mb-3" style="color:#0D2137"><i class="fas fa-calculator mr-1 text-blue-700"></i> Causación Contable por Etapas</h4>
          
          <div style="overflow-x:auto">
            <table class="w-full text-xs text-left border-collapse" id="imp-stages-table">
              <thead>
                <tr class="border-b text-gray-500 font-semibold" style="border-color:#E5E7EB">
                  <th class="pb-2">Etapa</th>
                  <th class="pb-2">Proveedor / Tercero</th>
                  <th class="pb-2" style="width:120px">Factura Nro</th>
                  <th class="pb-2 text-right" style="width:90px">Monto</th>
                  <th class="pb-2 text-center" style="width:130px">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                
                <!-- FOB Row -->
                <tr class="align-middle">
                  <td class="py-2 font-semibold text-gray-700">FOB Mercancía <span class="text-[10px] text-gray-400" id="lbl-fob-currency">(USD)</span></td>
                  <td class="py-2">
                    <span class="font-medium text-xs text-gray-700" id="stage-fob-supplier-name">${imp?.expand?.supplier_id ? (window as any).esc(imp.expand.supplier_id.name) : 'Definido arriba'}</span>
                  </td>
                  <td class="py-2">
                    <input type="text" id="imp-supplier-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.supplier_invoice_num || '')}" ${imp?.tx_fob_id ? 'disabled' : ''}>
                  </td>
                  <td class="py-2">
                    <input type="number" id="imp-fob-total" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.fob_total || '0'}" readonly style="background:#F3F4F6">
                  </td>
                  <td class="py-2 text-center">
                    ${imp?.tx_fob_id ? `
                      <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full" onclick="window.viewStageTx('${imp.tx_fob_id}')">
                        <i class="fas fa-receipt mr-1"></i> Ver Asiento
                      </button>
                    ` : `
                      <button type="button" class="btn btn-primary btn-xs w-full" id="btn-causar-fob" onclick="window.triggerStageCausacion('fob')">
                        <i class="fas fa-calculator mr-1"></i> Causar
                      </button>
                    `}
                  </td>
                </tr>

                <!-- Freight Row -->
                <tr class="align-middle">
                  <td class="py-2 font-semibold text-gray-700">Flete Internacional <span class="text-[10px] text-gray-400" id="lbl-freight-currency">(USD)</span></td>
                  <td class="py-2">
                    <select id="imp-freight-supplier-id" class="form-input text-xs py-1" ${imp?.tx_freight_id ? 'disabled' : ''}>
                      ${getSupplierOptions(imp?.freight_supplier_id || '')}
                    </select>
                  </td>
                  <td class="py-2">
                    <input type="text" id="imp-freight-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.freight_invoice_num || '')}" ${imp?.tx_freight_id ? 'disabled' : ''}>
                  </td>
                  <td class="py-2">
                    <input type="number" id="imp-freight-cost" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.freight_cost || '0'}" step="0.01" oninput="window.impRecalcTotals(); window.checkStageAmountChange('freight')" data-original-val="${imp?.freight_cost || '0'}">
                  </td>
                  <td class="py-2 text-center">
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
                <tr class="align-middle">
                  <td class="py-2 font-semibold text-gray-700">Seguro Internacional <span class="text-[10px] text-gray-400" id="lbl-insurance-currency">(USD)</span></td>
                  <td class="py-2">
                    <select id="imp-insurance-supplier-id" class="form-input text-xs py-1" ${imp?.tx_insurance_id ? 'disabled' : ''}>
                      ${getSupplierOptions(imp?.insurance_supplier_id || '')}
                    </select>
                  </td>
                  <td class="py-2">
                    <input type="text" id="imp-insurance-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.insurance_invoice_num || '')}" ${imp?.tx_insurance_id ? 'disabled' : ''}>
                  </td>
                  <td class="py-2">
                    <input type="number" id="imp-insurance-cost" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.insurance_cost || '0'}" step="0.01" oninput="window.impRecalcTotals(); window.checkStageAmountChange('insurance')" data-original-val="${imp?.insurance_cost || '0'}">
                  </td>
                  <td class="py-2 text-center">
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
                <tr class="align-middle">
                  <td class="py-2 font-semibold text-gray-700">Aduana / DIAN <span class="text-[10px] text-gray-400">(COP)</span></td>
                  <td class="py-2">
                    <select id="imp-customs-supplier-id" class="form-input text-xs py-1" ${imp?.tx_customs_id ? 'disabled' : ''}>
                      ${getSupplierOptions(imp?.customs_supplier_id || '')}
                    </select>
                  </td>
                  <td class="py-2">
                    <input type="text" id="imp-customs-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.customs_invoice_num || '')}" ${imp?.tx_customs_id ? 'disabled' : ''}>
                  </td>
                  <td class="py-2">
                    <div class="flex flex-col gap-1">
                      <input type="number" id="imp-gastos-nacionalizacion" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.gastos_nacionalizacion || '0'}" oninput="window.impRecalcTotals(); window.checkStageAmountChange('customs')" data-original-val="${imp?.gastos_nacionalizacion || '0'}">
                      <div class="text-[9px] text-gray-500 text-right">Arancel: <span id="stage-customs-arancel">$ 0</span></div>
                    </div>
                  </td>
                  <td class="py-2 text-center">
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
                <tr class="align-middle">
                  <td class="py-2 font-semibold text-gray-700">Transporte Local <span class="text-[10px] text-gray-400">(COP)</span></td>
                  <td class="py-2">
                    <select id="imp-local-carrier-id" class="form-input text-xs py-1" ${imp?.tx_local_carrier_id ? 'disabled' : ''}>
                      ${getSupplierOptions(imp?.local_carrier_id || '')}
                    </select>
                  </td>
                  <td class="py-2">
                    <input type="text" id="imp-local-carrier-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.local_carrier_invoice_num || '')}" ${imp?.tx_local_carrier_id ? 'disabled' : ''}>
                  </td>
                  <td class="py-2">
                    <input type="number" id="imp-transporte-nacional" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.transporte_nacional || '0'}" oninput="window.impRecalcTotals(); window.checkStageAmountChange('local_carrier')" data-original-val="${imp?.transporte_nacional || '0'}">
                  </td>
                  <td class="py-2 text-center">
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
                <tr class="align-middle">
                  <td class="py-2 font-semibold text-gray-700">Otros Gastos <span class="text-[10px] text-gray-400">(COP)</span></td>
                  <td class="py-2">
                    <select id="imp-local-other-supplier-id" class="form-input text-xs py-1" ${imp?.tx_local_other_id ? 'disabled' : ''}>
                      ${getSupplierOptions(imp?.local_other_supplier_id || '')}
                    </select>
                  </td>
                  <td class="py-2">
                    <input type="text" id="imp-local-other-invoice-num" class="form-input text-xs py-1 font-mono" placeholder="Factura Nro" value="${(window as any).esc(imp?.local_other_invoice_num || '')}" ${imp?.tx_local_other_id ? 'disabled' : ''}>
                  </td>
                  <td class="py-2">
                    <input type="number" id="imp-otros-gastos" class="form-input text-xs py-1 text-right font-semibold" value="${imp?.otros_gastos || '0'}" oninput="window.impRecalcTotals(); window.checkStageAmountChange('local_other')" data-original-val="${imp?.otros_gastos || '0'}">
                  </td>
                  <td class="py-2 text-center">
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

    window.impRecalcTotals();
  };

  // Agregar línea de artículo
  (window as any).addImpLine = function(prod: any = null, preloadedLine: any = null) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('imp-lines-body');
    if (!tbody) return;

    const productId = prod?.id || preloadedLine?.product_id || '';
    const productCode = prod?.code || preloadedLine?._code || '';
    const productName = prod?.name || preloadedLine?._name || '(producto)';
    const initQty = preloadedLine?.qty ?? 1;

    // Sugerir FOB price en la divisa elegida
    let initPrice = 0;
    if (preloadedLine) {
      initPrice = preloadedLine.fob_price ?? 0;
    } else if (prod) {
      const refPrice = prod.cost_price || 0;
      const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
      const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');
      if (currency !== 'COP' && refPrice > 0) {
        initPrice = parseFloat((refPrice / exchangeRate).toFixed(2));
      } else {
        initPrice = refPrice;
      }
    }

    const initArancel = preloadedLine?.arancel_rate ?? prod?.arancel_rate_default ?? prod?.arancel_rate ?? 10;
    const initIva = preloadedLine?.iva_rate ?? prod?.iva_rate ?? 19;
    const manifestNum = preloadedLine?.manifest_number || '';
    const manifestFile = preloadedLine?.manifest_file || '';
    const lineId = preloadedLine?.id || '';

    const baseNetWeight = prod?.peso_neto ?? 0;
    const baseGrossWeight = prod?.peso_bruto ?? 0;

    const tr = document.createElement('tr');
    tr.id = `imp-row-${idx}`;
    tr.setAttribute('data-lineid', lineId);
    tr.setAttribute('data-base-peso-neto', String(baseNetWeight));
    tr.setAttribute('data-base-peso-bruto', String(baseGrossWeight));
    
    tr.innerHTML = `
      <td>
        <div class="flex flex-col">
          <div class="flex items-center gap-1 flex-wrap">
            <span class="text-[10px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(productCode || 'S/C')}]</span>
            <span class="text-xs font-semibold text-gray-800 truncate" style="max-width:180px" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
            ${prod?.visto_bueno_required ? `
              <span class="badge badge-red text-[9px] py-0.5 px-1.5 ml-1 animate-pulse" style="font-size:9px" title="Requiere Visto Bueno ante ${prod.visto_bueno_entidad} - Registro: ${prod.registro_sanitario || 'Sin Registro'}">⚠️ V.B. ${prod.visto_bueno_entidad}</span>
            ` : ''}
          </div>
          <input type="hidden" id="impl-prod-id-${idx}" value="${(window as any).esc(productId)}">
          
          <!-- Detalles aduaneros y pesos -->
          <div class="flex flex-col gap-1 mt-1 pl-1 text-[10px] text-gray-500 border-l-2 border-blue-200">
            <div class="flex flex-wrap gap-2 items-center">
              <span><strong>Arancel:</strong> <input type="text" id="impl-pos-arancel-${idx}" class="form-input py-0.5 px-1 font-mono text-[9px]" style="width:75px;height:18px;font-size:9px" placeholder="Arancel" value="${(window as any).esc(preloadedLine?.posicion_arancelaria || prod?.posicion_arancelaria || '')}"></span>
              <span><strong>Orig:</strong> <input type="text" id="impl-pais-origen-${idx}" class="form-input py-0.5 px-1 text-[9px]" style="width:40px;height:18px;font-size:9px" placeholder="País" value="${(window as any).esc(preloadedLine?.pais_origen || prod?.pais_origen || '')}"></span>
              <span><strong>Cert:</strong> <input type="text" id="impl-cert-origen-${idx}" class="form-input py-0.5 px-1 text-[9px]" style="width:55px;height:18px;font-size:9px" placeholder="Cert. Origen" value="${(window as any).esc(preloadedLine?.certificado_origen_num || '')}"></span>
            </div>
            <div class="flex flex-wrap gap-2 items-center mt-0.5">
              <span><strong>P. Neto (Kg):</strong> <input type="number" id="impl-peso-neto-${idx}" class="form-input py-0.5 px-1 text-[9px] text-right" style="width:50px;height:18px;font-size:9px" step="0.01" value="${preloadedLine?.peso_neto_total ?? (prod?.peso_neto ? (prod.peso_neto * initQty).toFixed(2) : '0.00')}" onchange="this.dataset.overridden='true'; window.impRecalcTotals()" oninput="window.impRecalcTotals()"></span>
              <span><strong>P. Bruto (Kg):</strong> <input type="number" id="impl-peso-bruto-${idx}" class="form-input py-0.5 px-1 text-[9px] text-right font-semibold" style="width:50px;height:18px;font-size:9px" step="0.01" value="${preloadedLine?.peso_bruto_total ?? (prod?.peso_bruto ? (prod.peso_bruto * initQty).toFixed(2) : '0.00')}" onchange="this.dataset.overridden='true'; window.impRecalcTotals()" oninput="window.impRecalcTotals()"></span>
            </div>
          </div>
        </div>
      </td>
      <td><input type="number" id="impl-qty-${idx}" class="form-input text-right w-full font-bold" style="font-size:12px" min="0.001" step="0.001" value="${initQty}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-price-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" step="0.01" value="${initPrice || ''}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-arancel-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" max="100" step="0.1" value="${initArancel}" oninput="window.impRecalcTotals()"></td>
      <td><input type="number" id="impl-iva-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" max="100" step="1" value="${initIva}" oninput="window.impRecalcTotals()"></td>
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

    window.impRecalcTotals();
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

    const totalCIFExpensesCOP = (freightCost + insuranceCost) * exchangeRate;
    const totalLocalExpensesCOP = gastosNacionalizacion + transporteNacional + otrosGastos;
    const totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

    let totalFOB = 0;
    let totalWeight = 0;
    
    // First pass: update weights if not overridden, and calculate totals
    const rows = document.querySelectorAll('#imp-lines-body tr');
    rows.forEach((tr: any) => {
      const idx = tr.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
      
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
      totalFOB += (qty * price);
      totalWeight += pesoBrutoLine;
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

      const lineFOBCop = qty * price * exchangeRate;
      
      let factor = 0;
      if (prorationMethod === 'GROSS_WEIGHT' && totalWeight > 0) {
        factor = pesoBrutoLine / totalWeight;
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
    if (lblResArancel) lblResArancel.textContent = (window as any).fmt(arancelTotalCOP);
    if (lblResLocales) lblResLocales.textContent = (window as any).fmt(totalLocalExpensesCOP);
    if (lblResTotal) lblResTotal.textContent = (window as any).fmt(totalFOBCop + totalExpensesToProrateCOP + arancelTotalCOP);
    if (customsArancel) customsArancel.textContent = (window as any).fmt(arancelTotalCOP);

    // Update Seen entities Vustos Buenos warnings box
    const vbAlertsList = document.getElementById('imp-vb-alerts-list');
    const vbAlertsWrap = document.getElementById('imp-vb-alerts-wrap');
    if (vbAlertsList && vbAlertsWrap) {
      const activeVbs: string[] = [];
      rows.forEach((tr: any) => {
        const rowId = tr.id.split('-').pop();
        const prodName = tr.querySelector('.truncate')?.textContent || 'Producto';
        
        // Find if this product has seen visto bueno by looking at the badge
        const badge = tr.querySelector('.badge-red');
        if (badge) {
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
        window.impGlobalSelectProduct(selIdx);
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
  
  // Ejecutar primera calculadora al abrir
  setTimeout(() => (window as any).impUpdateCurrencyLabel(), 100);

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
        const exchangeRateVal = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
        amount = costVal * exchangeRateVal;
      } else if (stage === 'insurance') {
        supplierId = (document.getElementById('imp-insurance-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-insurance-invoice-num') as HTMLInputElement)?.value.trim();
        const costVal = parseFloat((document.getElementById('imp-insurance-cost') as HTMLInputElement)?.value || '0');
        const exchangeRateVal = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
        amount = costVal * exchangeRateVal;
      } else if (stage === 'customs') {
        supplierId = (document.getElementById('imp-customs-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-customs-invoice-num') as HTMLInputElement)?.value.trim();
        
        const arancelTotalVal = parseFloat(document.getElementById('lbl-res-arancel-cop')?.textContent?.replace(/[^0-9.-]+/g, '') || '0') || 0;
        const gastosNacVal = parseFloat((document.getElementById('imp-gastos-nacionalizacion') as HTMLInputElement)?.value || '0');
        amount = arancelTotalVal + gastosNacVal;
      } else if (stage === 'local_carrier') {
        supplierId = (document.getElementById('imp-local-carrier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-local-carrier-invoice-num') as HTMLInputElement)?.value.trim();
        amount = parseFloat((document.getElementById('imp-transporte-nacional') as HTMLInputElement)?.value || '0');
      } else if (stage === 'local_other') {
        supplierId = (document.getElementById('imp-local-other-supplier-id') as HTMLSelectElement)?.value;
        invoiceNum = (document.getElementById('imp-local-other-invoice-num') as HTMLInputElement)?.value.trim();
        amount = parseFloat((document.getElementById('imp-otros-gastos') as HTMLInputElement)?.value || '0');
      }

      if (!supplierId) throw new Error('Debes seleccionar un proveedor para esta etapa.');
      if (!invoiceNum) throw new Error('Debes ingresar el número de factura/soporte.');
      if (amount <= 0) throw new Error('El monto a causar debe ser mayor a cero.');

      const btn = document.getElementById(`btn-causar-${stage}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>...';
      }

      await (window as any).API.postImportStage(importId, stage, supplierId, invoiceNum, amount);
      (window as any).showToast('Causación contable generada exitosamente.', 'success');
      
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
        deltaAmount = (currentVal - originalVal) * exchangeRateVal;
      } else if (stage === 'insurance') {
        invoiceNum = (document.getElementById('imp-insurance-invoice-num') as HTMLInputElement)?.value.trim();
        deltaAmount = (currentVal - originalVal) * exchangeRateVal;
      } else if (stage === 'customs') {
        invoiceNum = (document.getElementById('imp-customs-invoice-num') as HTMLInputElement)?.value.trim();
        deltaAmount = currentVal - originalVal; // COP
      } else if (stage === 'local_carrier') {
        invoiceNum = (document.getElementById('imp-local-carrier-invoice-num') as HTMLInputElement)?.value.trim();
        deltaAmount = currentVal - originalVal; // COP
      } else if (stage === 'local_other') {
        invoiceNum = (document.getElementById('imp-local-other-invoice-num') as HTMLInputElement)?.value.trim();
        deltaAmount = currentVal - originalVal; // COP
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

      // Nuevos campos cumplimiento y prorrateo
      const vuceRegistroNum = (document.getElementById('imp-vuce-registro') as HTMLInputElement)?.value.trim() || null;
      const modalidadImportacion = (document.getElementById('imp-modalidad-importacion') as HTMLSelectElement)?.value || null;
      const canalInspeccion = (document.getElementById('imp-canal-inspeccion') as HTMLSelectElement)?.value || null;
      const prorationMethod = (document.getElementById('imp-proration-method') as HTMLSelectElement)?.value || 'FOB_VALUE';
      const dianDeclaracionNum = (document.getElementById('imp-dian-declaracion') as HTMLInputElement)?.value.trim() || null;
      const dianDeclaracionDate = (document.getElementById('imp-dian-declaracion-date') as HTMLInputElement)?.value || null;
      const dianLevanteDate = (document.getElementById('imp-dian-levante-date') as HTMLInputElement)?.value || null;
      const dianTrm = parseFloat((document.getElementById('imp-dian-trm') as HTMLInputElement)?.value) || null;

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
        const paisOrigen = (document.getElementById(`impl-pais-origen-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const certOrigen = (document.getElementById(`impl-cert-origen-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const posArancelaria = (document.getElementById(`impl-pos-arancel-${idx}`) as HTMLInputElement)?.value.trim() || null;
        const pesoNeto = parseFloat((document.getElementById(`impl-peso-neto-${idx}`) as HTMLInputElement)?.value || '0');
        const pesoBruto = parseFloat((document.getElementById(`impl-peso-bruto-${idx}`) as HTMLInputElement)?.value || '0');

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
          pais_origen: paisOrigen,
          certificado_origen_num: certOrigen,
          posicion_arancelaria: posArancelaria,
          peso_neto_total: pesoNeto,
          peso_bruto_total: pesoBruto,
          lineFOBCop,
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

        // Nuevos campos DIAN/VUCE y prorrateo
        vuce_registro_num: vuceRegistroNum,
        modalidad_importacion: modalidadImportacion,
        canal_inspeccion: canalInspeccion,
        proration_method: prorationMethod,
        dian_declaracion_num: dianDeclaracionNum,
        dian_declaracion_date: dianDeclaracionDate,
        dian_levante_date: dianLevanteDate,
        dian_trm: dianTrm,
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
      (window as any).pb.get('imports', importId, {
        expand: 'supplier_id,user_id,purchase_invoice_id,tx_fob_id,tx_freight_id,tx_insurance_id,tx_customs_id,tx_local_carrier_id,tx_local_other_id'
      }),
      (window as any).API.getImportLines(importId),
    ]);

    const meta = IMPORT_STATUS[imp.status] || { label: imp.status, badge: 'badge-gray' };
    const supplier = imp.expand?.supplier_id;
    const user = imp.expand?.user_id;
    const transport = TRANSPORTS.find(t => t.value === imp.transport_type)?.label || imp.transport_type || '—';

    const renderStageTxLink = (label: string, tx: any) => {
      if (!tx) return `<div class="flex justify-between items-center text-[10px]"><span>${label}:</span> <span class="text-gray-400 italic">No causado</span></div>`;
      return `
        <div class="flex justify-between items-center text-[10px]">
          <span>${label}:</span>
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
              <div class="flex justify-between"><span>Prorrateo:</span> <span class="font-semibold text-blue-700">${imp.proration_method === 'GROSS_WEIGHT' ? 'Peso Bruto' : 'Valor FOB'}</span></div>
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
                    <span class="badge badge-green"><i class="fas fa-check-circle mr-1"></i> Capitalizado</span>
                  ` : `
                    <span class="badge badge-orange"><i class="fas fa-clock mr-1"></i> Tránsito / Pendiente</span>
                  `}
                </div>
              </div>
              <div class="space-y-1 text-xs border-l pl-4 border-gray-100">
                <div class="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">Causaciones por Etapa</div>
                ${renderStageTxLink('FOB Mercancía', imp.expand?.tx_fob_id)}
                ${renderStageTxLink('Flete Internacional', imp.expand?.tx_freight_id)}
                ${renderStageTxLink('Seguro Internacional', imp.expand?.tx_insurance_id)}
                ${renderStageTxLink('Aduanas / DIAN', imp.expand?.tx_customs_id)}
                ${renderStageTxLink('Transporte Local', imp.expand?.tx_local_carrier_id)}
                ${renderStageTxLink('Otros Gastos', imp.expand?.tx_local_other_id)}
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
                      <td class="font-medium">
                        ${prod ? `${(window as any).esc(prod.code)} - ${(window as any).esc(prod.name)}` : (window as any).esc(l.description || '—')}
                        <div class="text-[10px] text-gray-500 mt-0.5">
                          <span>Origen: ${(window as any).esc(l.pais_origen || '—')}</span> | 
                          <span>Cert: ${(window as any).esc(l.certificado_origen_num || '—')}</span> | 
                          <span>Pos: ${(window as any).esc(l.posicion_arancelaria || '—')}</span> | 
                          <span>P.Bruto: ${(l.peso_bruto_total || 0).toFixed(2)} Kg</span>
                        </div>
                      </td>
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

        // 1. Ejecutar la capitalización contable directa (traslado contable Tránsito -> Bodega y Entrada de Inventario)
        await (window as any).API.capitalizeImport(importId, whId, txTypeId, txNumber);

        (window as any).showToast(`Importación finalizada. Traslado contable y entrada a bodega registrados con éxito.`, 'success');
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
