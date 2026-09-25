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

// Catálogo oficial de Unidades de Medida DIAN / UBL 2.1 traducidas al español para visualización amigable
const DIAN_UNITS_MAP: Record<string, string> = {
  '94':  'Unidad',
  'UND': 'Unidad',
  'KGM': 'Kilogramo',
  'GRM': 'Gramo',
  'MTR': 'Metro',
  'MTK': 'Metro cuadrado',
  'MTQ': 'Metro cúbico',
  'CMT': 'Centímetro',
  'CMK': 'Centímetro cuadrado',
  'CMQ': 'Centímetro cúbico',
  'MMT': 'Milímetro',
  'LTR': 'Litro',
  'MLT': 'Mililitro',
  'LBR': 'Libra',
  'ONZ': 'Onza',
  'TNE': 'Tonelada',
  'WSD': 'Servicio',
  'BX':  'Caja',
  'PK':  'Paquete',
  'SET': 'Juego / Set',
  'DZN': 'Docena',
  'FOT': 'Pie',
  'FTK': 'Pie cuadrado',
  'FTQ': 'Pie cúbico',
  'INH': 'Pulgada',
  'BO':  'Botella',
  'JR':  'Tarro',
  'Z3':  'Barril',
  'GL':  'Galón',
  'GN':  'Galón bruto'
};

function formatUnitOfMeasure(code: string): string {
  if (!code) return 'Unidad';
  const clean = String(code).trim().toUpperCase();
  return DIAN_UNITS_MAP[clean] || (clean === 'UND' ? 'Unidad' : code);
}

const IMPORT_CONCEPTS_META: Record<string, { label: string; puc: string; name: string; icon: string; iconColor: string; iconBg: string }> = {
  fob: { label: '1. FOB Mercancía', puc: '220505', name: 'Proveedores del Exterior', icon: 'fas fa-ship', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  freight: { label: '2. Flete Internacional', puc: '233545', name: 'Costos y Gastos Fletes', icon: 'fas fa-plane-departure', iconColor: 'text-sky-600', iconBg: 'bg-sky-50' },
  insurance: { label: '3. Seguro Internacional', puc: '233555', name: 'Seguros y Pólizas Int.', icon: 'fas fa-shield-alt', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
  customs: { label: '4. Aduana / DIAN / SIA', puc: '233595', name: 'Agenciamiento Aduanero y Aranceles', icon: 'fas fa-building-columns', iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
  local_carrier: { label: '5. Transporte Local', puc: '233545', name: 'Acarreos y Fletes Terrestres Locales', icon: 'fas fa-truck', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  local_other: { label: '6. Otros Gastos Portuarios', puc: '233595', name: 'Gastos Portuarios y Bodegaje', icon: 'fas fa-box', iconColor: 'text-orange-600', iconBg: 'bg-orange-50' },
};

function renderStageAccountingViewer({
  stageKey,
  stageTitle,
  pucCode,
  pucName,
  icon,
  iconColor,
  iconBg,
  lines,
  importId,
}: {
  stageKey: string;
  stageTitle: string;
  pucCode: string;
  pucName: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  lines: any[];
  importId: string | null;
}) {
  const totalDebit = (lines || []).reduce((s: number, l: any) => s + Number(l.debit || 0), 0);
  const totalCredit = (lines || []).reduce((s: number, l: any) => s + Number(l.credit || 0), 0);
  const netTotal = totalDebit - totalCredit;
  const hasLines = (lines || []).length > 0;

  return `
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center font-bold text-base">
            <i class="${icon}"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h5 class="font-bold text-sm text-slate-800">${stageTitle}</h5>
              <span class="badge badge-purple text-[10px] font-bold"><i class="fas fa-arrow-right-arrow-left mr-1"></i>Modo Inverso</span>
            </div>
            <p class="text-xs text-slate-500">Contrapartida esperada: <strong>PUC ${pucCode} (${pucName})</strong> · Asientos registrados en contabilidad</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          ${importId ? `
            <button type="button" class="btn btn-outline btn-xs" onclick="window.openLinkTxLineModal('${importId}', '${stageKey}')">
              <i class="fas fa-link mr-1"></i> Vincular Movimiento
            </button>
            <button type="button" class="btn btn-primary btn-xs" onclick="window.openRegisterTxForImport('${importId}', '${stageKey}')">
              <i class="fas fa-plus mr-1"></i> Registrar en Contabilidad
            </button>
          ` : `
            <span class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-medium">
              <i class="fas fa-circle-info mr-1"></i> Guarda el borrador primero para vincular movimientos
            </span>
          `}
          <button type="button" class="btn btn-outline btn-xs" onclick="window.switchImpStageTab('resumen')">
            <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
          </button>
        </div>
      </div>

      <!-- Tabla de Asientos Contables Vinculados -->
      <div class="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table class="w-full text-xs text-left border-collapse">
          <thead class="bg-slate-50 text-slate-600 border-b font-semibold">
            <tr>
              <th class="py-2.5 px-3" style="width:90px">Fecha</th>
              <th class="py-2.5 px-3" style="width:120px">Comprobante</th>
              <th class="py-2.5 px-3" style="min-width:160px">Tercero</th>
              <th class="py-2.5 px-3" style="width:130px">Factura Ref.</th>
              <th class="py-2.5 px-3 text-right" style="width:100px">TRM ($)</th>
              <th class="py-2.5 px-3" style="min-width:180px">Cuenta PUC</th>
              <th class="py-2.5 px-3 text-right" style="width:120px">Débito (COP)</th>
              <th class="py-2.5 px-3 text-right" style="width:120px">Crédito (COP)</th>
              <th class="py-2.5 px-3 text-center" style="width:90px">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${hasLines ? lines.map((l: any) => {
              const tx = l.expand?.tx_id || {};
              const third = l.expand?.third_party_id || tx.expand?.third_party_id || {};
              const acct = l.expand?.account_id || {};
              const txDate = tx.date || (l.created ? l.created.slice(0, 10) : '—');
              const txNum = tx.number || 'Asiento';
              const invRef = l.import_invoice_ref || tx.import_invoice_ref || '—';
              const trm = l.import_trm || tx.import_trm || 0;
              const debit = Number(l.debit || 0);
              const credit = Number(l.credit || 0);

              return `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-2.5 px-3 font-mono text-slate-600">${(window as any).esc(txDate)}</td>
                  <td class="py-2.5 px-3 font-mono font-bold">
                    <button type="button" class="text-blue-600 hover:underline cursor-pointer bg-transparent border-0 p-0 font-mono font-bold" onclick="window.viewStageTx('${l.tx_id || tx.id}')" title="Ver comprobante completo">
                      ${(window as any).esc(txNum)}
                    </button>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="font-bold text-slate-800">${(window as any).esc(third.name || 'Sin Tercero')}</div>
                    ${third.doc_number ? `<div class="text-[10px] text-slate-400 font-mono">Doc: ${(window as any).esc(third.doc_number)}</div>` : ''}
                  </td>
                  <td class="py-2.5 px-3 font-mono font-semibold text-slate-700">${(window as any).esc(invRef)}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-slate-600">${trm > 0 ? '$ ' + (window as any).fmtN(trm) : '—'}</td>
                  <td class="py-2.5 px-3">
                    <span class="font-mono font-semibold text-slate-700">${(window as any).esc(acct.code || '')}</span>
                    <span class="text-slate-500 ml-1 text-[11px]">${(window as any).esc(acct.name || '')}</span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${debit > 0 ? (window as any).fmt(debit) : '—'}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">${credit > 0 ? (window as any).fmt(credit) : '—'}</td>
                  <td class="py-2.5 px-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button type="button" class="btn btn-outline btn-xs text-blue-600 p-1" title="Ver Asiento" onclick="window.viewStageTx('${l.tx_id || tx.id}')">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button type="button" class="btn btn-danger btn-xs p-1" title="Desvincular de esta etapa" onclick="window.unlinkStageTxLine('${l.id}', '${importId}')">
                        <i class="fas fa-unlink"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="9" class="p-8 text-center bg-slate-50/50">
                  <div class="flex flex-col items-center justify-center text-slate-400">
                    <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-2">
                      <i class="fas fa-receipt"></i>
                    </div>
                    <div class="font-bold text-slate-700 text-sm">Sin movimientos contables asociados</div>
                    <p class="text-xs text-slate-400 max-w-md mt-1 mb-3">Esta etapa aún no tiene asientos registrados o vinculados. Puedes registrar un nuevo comprobante desde Contabilidad marcando la casilla de importación, o vincular un asiento ya existente.</p>
                    ${importId ? `
                      <div class="flex gap-2">
                        <button type="button" class="btn btn-primary btn-xs" onclick="window.openLinkTxLineModal('${importId}', '${stageKey}')">
                          <i class="fas fa-link mr-1"></i> Vincular Movimiento
                        </button>
                        <button type="button" class="btn btn-outline btn-xs text-purple-700" onclick="window.openRegisterTxForImport('${importId}', '${stageKey}')">
                          <i class="fas fa-plus mr-1"></i> Registrar en Contabilidad
                        </button>
                      </div>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `}
          </tbody>
          ${hasLines ? `
            <tfoot class="bg-slate-50 border-t font-semibold text-slate-700">
              <tr>
                <td colspan="6" class="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider text-slate-500">Total Acumulado Etapa:</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${(window as any).fmt(totalDebit)}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-rose-600">${totalCredit > 0 ? (window as any).fmt(totalCredit) : '—'}</td>
                <td class="py-2.5 px-3 text-center">
                  <span class="badge badge-emerald font-mono font-bold text-xs">${(window as any).fmt(netTotal)}</span>
                </td>
              </tr>
            </tfoot>
          ` : ''}
        </table>
      </div>

      <div class="flex justify-between items-center p-3.5 bg-purple-50/70 rounded-xl border border-purple-100 text-xs">
        <div class="text-purple-950 font-medium">
          <i class="fas fa-circle-check text-purple-600 mr-1.5"></i>
          Total Asientos Vinculados: <strong>${(lines || []).length}</strong> · Saldo Neto Acumulado: <strong class="font-mono text-purple-900">${(window as any).fmt(netTotal)}</strong>
        </div>
        <div class="text-right font-mono text-xs text-purple-800">
          Contrapartida activa hacia cuenta de tránsito <strong>143505</strong>
        </div>
      </div>
    </div>
  `;
}

export async function renderImportaciones(container: HTMLElement) {
  const c = (window as any).getPageContainer ? (window as any).getPageContainer(container, 'importaciones') : container;
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando importaciones...</div>`;
  try {
    await _loadImportacionesPage(c);
  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc ? (window as any).esc(err.message) : err.message}</div>`;
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
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline text-xs" onclick="(window as any).navigate('preliquidaciones')" title="Abrir simulador de viabilidad y preliquidación"><i class="fas fa-calculator text-indigo-600"></i> Preliquidación & Viabilidad</button>
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
      <td>
        <span class="badge ${meta.badge}">${meta.label}</span>
        ${imp.reopened_count > 0 ? `
          <div class="mt-0.5">
            <span class="badge badge-amber text-[9px] py-0 px-1 font-bold" title="${(window as any).esc(imp.reopened_reason || '')}">
              <i class="fas fa-rotate-left mr-0.5"></i>Reabierta (${imp.reopened_count}x)
            </span>
          </div>
        ` : ''}
      </td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewImportDetail('${(window as any).esc(imp.id)}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm text-indigo-700 hover:bg-indigo-50" style="border-color:#6366f1" title="Dossier Oficial DIAN / Gerencia" onclick="window.openImportExecutiveReport('${(window as any).esc(imp.id)}')"><i class="fas fa-file-contract"></i></button>
          
          ${imp.status !== 'recibido' && imp.status !== 'anulado' && (window as any).can('canWrite') ? `
            <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#3b82f6" title="Editar" onclick="window.editImport('${(window as any).esc(imp.id)}')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-primary btn-sm" title="Nacionalizar / Finalizar" onclick="window.confirmFinalizarImportacion('${(window as any).esc(imp.id)}')"><i class="fas fa-check-double"></i> Recibir</button>
            <button class="btn btn-danger btn-sm" title="Anular" onclick="window.cancelImportDirect('${(window as any).esc(imp.id)}', '${(window as any).esc(imp.number)}')"><i class="fas fa-ban"></i></button>
          ` : ''}
          
          ${imp.status === 'recibido' ? `
            <span class="badge badge-green" title="Importación finalizada y capitalizada"><i class="fas fa-boxes-packing mr-1"></i>Capitalizado</span>
            ${(window as any).can('canWrite') ? `
              <button class="btn btn-outline btn-sm text-amber-700 hover:bg-amber-50" style="border-color:#f59e0b" title="Reabrir importación para ajustes" onclick="window.openReopenImportModal('${(window as any).esc(imp.id)}')"><i class="fas fa-lock-open"></i></button>
            ` : ''}
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

  const [suppliers, products, cfg, linkedTxLinesRes] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getProducts({ activeOnly: true }),
    (window as any).API.getImportConfig().catch(() => ({ costing: { mode: 'direct' } })),
    importId ? (window as any).API.getImportTxLines(importId).catch(() => []) : Promise.resolve([]),
  ]);
  let linkedTxLines: any[] = linkedTxLinesRes || [];
  const isInverseMode = cfg?.costing?.mode === 'inverse';

  // --- HELPERS DE BUSCADORES DINÁMICOS DE TERCEROS ---
  const renderTerceroDynamicPicker = ({
    id,
    value = '',
    placeholder = 'Buscar por NIT o nombre...',
    disabled = false,
    compact = false,
    showQuickAdd = true,
  }: {
    id: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    compact?: boolean;
    showQuickAdd?: boolean;
  }) => {
    const selectedSupplier = suppliers.find((s: any) => s.id === value);
    const displayText = selectedSupplier ? `${selectedSupplier.doc_number || selectedSupplier.nit || 'S/N'} - ${selectedSupplier.name}` : '';
    const heightClass = compact ? 'text-xs py-1 h-7' : 'text-xs py-1.5';

    return `
      <div id="wrap-${id}" class="relative flex items-center gap-1 w-full" style="min-width:${compact ? '160px' : '220px'}">
        <div class="relative flex-1">
          <input id="${id}-search" type="text" class="form-input ${heightClass} w-full pr-6" autocomplete="off" placeholder="${placeholder}" value="${(window as any).esc(displayText)}" ${disabled ? 'disabled style="background:#F3F4F6;color:#374151"' : ''}>
          <button type="button" id="btn-clear-${id}" class="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 text-xs border-0 bg-transparent cursor-pointer p-0 ${displayText && !disabled ? '' : 'hidden'}" title="Limpiar selección">
            <i class="fas fa-circle-xmark"></i>
          </button>
        </div>
        <input id="${id}" type="hidden" value="${(window as any).esc(value || '')}">
        ${showQuickAdd && !disabled ? `
          <button type="button" id="btn-add-${id}" class="btn btn-outline ${compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} text-slate-600 hover:text-blue-600 hover:border-blue-300 flex-shrink-0" title="Crear nuevo tercero">
            <i class="fas fa-user-plus"></i>
          </button>
        ` : ''}
        <div id="${id}-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.15);z-index:9999"></div>
      </div>
    `;
  };

  const initTerceroDynamicPicker = ({
    id,
    onChange,
    disabled = false,
  }: {
    id: string;
    onChange?: (val: string, supplier: any) => void;
    disabled?: boolean;
  }) => {
    const searchInput = document.getElementById(`${id}-search`) as HTMLInputElement;
    const hiddenInput = document.getElementById(id) as HTMLInputElement;
    const resultsDiv = document.getElementById(`${id}-results`);
    const btnClear = document.getElementById(`btn-clear-${id}`);
    const btnAdd = document.getElementById(`btn-add-${id}`);
    if (!searchInput || !hiddenInput || !resultsDiv) return;

    if (disabled) {
      searchInput.disabled = true;
      return;
    }

    const performFilter = (queryVal: string) => {
      const q = queryVal.toLowerCase().trim();
      const filtered = !q
        ? suppliers.slice(0, 30)
        : suppliers.filter((s: any) => `${s.name || ''} ${s.doc_number || ''} ${s.nit || ''}`.toLowerCase().includes(q)).slice(0, 30);

      if (!filtered.length) {
        resultsDiv.innerHTML = `<div class="px-3 py-2 text-xs text-slate-400">Sin coincidencias</div>`;
        return;
      }

      resultsDiv.innerHTML = filtered.map((s: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-0 bg-white hover:bg-blue-50 cursor-pointer block border-b border-slate-100 last:border-0"
                data-supplier-id="${(window as any).esc(s.id)}"
                data-supplier-text="${(window as any).esc(s.doc_number || s.nit || 'S/N')} - ${(window as any).esc(s.name)}">
          <div class="font-bold text-slate-800">${(window as any).esc(s.name)}</div>
          <div class="text-[10px] text-slate-500">Doc: ${(window as any).esc(s.doc_number || s.nit || 'S/N')} ${s.tax_regime ? `· ${s.tax_regime}` : ''}</div>
        </button>
      `).join('');

      resultsDiv.querySelectorAll('button[data-supplier-id]').forEach((btn: any) => {
        btn.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          const sId = btn.getAttribute('data-supplier-id');
          const sText = btn.getAttribute('data-supplier-text');
          hiddenInput.value = sId;
          searchInput.value = sText;
          resultsDiv.style.display = 'none';
          if (btnClear) btnClear.classList.remove('hidden');
          const suppObj = suppliers.find((x: any) => x.id === sId);
          if (onChange) onChange(sId, suppObj);
        });
      });
    };

    searchInput.addEventListener('focus', () => {
      performFilter(searchInput.value);
      resultsDiv.style.display = 'block';
    });

    searchInput.addEventListener('input', () => {
      hiddenInput.value = '';
      if (btnClear) {
        if (searchInput.value) btnClear.classList.remove('hidden');
        else btnClear.classList.add('hidden');
      }
      performFilter(searchInput.value);
      resultsDiv.style.display = 'block';
      if (onChange) onChange('', null);
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => { resultsDiv.style.display = 'none'; }, 250);
    });

    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        hiddenInput.value = '';
        searchInput.value = '';
        btnClear.classList.add('hidden');
        resultsDiv.style.display = 'none';
        if (onChange) onChange('', null);
      });
    }

    if (btnAdd) {
      btnAdd.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof (window as any).openTerceroForm === 'function') {
          (window as any).openTerceroForm(null, async (createdRecord: any) => {
            if (createdRecord && createdRecord.id) {
              suppliers.push(createdRecord);
              hiddenInput.value = createdRecord.id;
              searchInput.value = `${createdRecord.doc_number || createdRecord.nit || 'S/N'} - ${createdRecord.name}`;
              if (btnClear) btnClear.classList.remove('hidden');
              if (onChange) onChange(createdRecord.id, createdRecord);
              (window as any).showToast('Tercero creado y seleccionado exitosamente.', 'success');
            }
          });
        } else {
          (window as any).showToast('Módulo de terceros no disponible.', 'warning');
        }
      });
    }

    if (typeof (window as any).initKeyboardAutocomplete === 'function') {
      (window as any).initKeyboardAutocomplete({
        input: searchInput,
        results: resultsDiv,
        itemSelector: 'button[data-supplier-id]'
      });
    }
  };

  let localStageExpenses: Record<string, any[]> = {};

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

  // Deducción robusta de modo consolidado (por flag, por facturas existentes o por líneas con factura asignada)
  const isImportConsolidated = Boolean(
    imp?.is_consolidated || 
    (localInvoices && localInvoices.length > 0) || 
    (existingLines && existingLines.some((l: any) => l.import_invoice_id || (l.supplier_id && imp?.supplier_id && l.supplier_id !== imp?.supplier_id)))
  );
  if (imp) {
    imp.is_consolidated = isImportConsolidated;
  }

  // Cargar o inicializar estructura multi-línea para cada etapa
  if (imp?.stage_expenses) {
    try {
      localStageExpenses = typeof imp.stage_expenses === 'string' ? JSON.parse(imp.stage_expenses) : imp.stage_expenses;
    } catch (_) {
      localStageExpenses = {};
    }
  }

  const defaultStages = ['freight', 'insurance', 'customs', 'local_carrier', 'local_other'];
  defaultStages.forEach(stg => {
    if (!localStageExpenses[stg] || !localStageExpenses[stg].length) {
      let legacySupp = '';
      let legacyInv = '';
      let legacyCost = 0;
      let legacyTrm = 1;
      let legacyTx = null;

      if (stg === 'freight') {
        legacySupp = imp?.freight_supplier_id || '';
        legacyInv = imp?.freight_invoice_num || '';
        legacyCost = imp?.freight_cost || 0;
        legacyTrm = imp?.freight_trm || imp?.exchange_rate || 4000;
        legacyTx = imp?.tx_freight_id || null;
      } else if (stg === 'insurance') {
        legacySupp = imp?.insurance_supplier_id || '';
        legacyInv = imp?.insurance_invoice_num || '';
        legacyCost = imp?.insurance_cost || 0;
        legacyTrm = imp?.insurance_trm || imp?.exchange_rate || 4000;
        legacyTx = imp?.tx_insurance_id || null;
      } else if (stg === 'customs') {
        legacySupp = imp?.customs_supplier_id || '';
        legacyInv = imp?.customs_invoice_num || '';
        legacyCost = imp?.gastos_nacionalizacion || 0;
        legacyTrm = imp?.customs_trm || imp?.dian_trm || imp?.exchange_rate || 4000;
        legacyTx = imp?.tx_customs_id || null;
      } else if (stg === 'local_carrier') {
        legacySupp = imp?.local_carrier_id || '';
        legacyInv = imp?.local_carrier_invoice_num || '';
        legacyCost = imp?.transporte_nacional || 0;
        legacyTrm = imp?.local_carrier_trm || 1;
        legacyTx = imp?.tx_local_carrier_id || null;
      } else if (stg === 'local_other') {
        legacySupp = imp?.local_other_supplier_id || '';
        legacyInv = imp?.local_other_invoice_num || '';
        legacyCost = imp?.otros_gastos || 0;
        legacyTrm = imp?.local_other_trm || 1;
        legacyTx = imp?.tx_local_other_id || null;
      }

      localStageExpenses[stg] = [{
        id: `stage-${stg}-0`,
        supplier_id: legacySupp,
        invoice_num: legacyInv,
        comment: '',
        amount: legacyCost,
        trm: legacyTrm,
        tx_id: legacyTx
      }];
    }
  });

  let lineCounter = 0;
  const suggestedNumber = !imp ? await (window as any).API.nextImportConsecutive().catch(() => '') : '';
  const consecutive = imp?.number || suggestedNumber;

  const formHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      
      ${imp?.reopened_count > 0 ? `
        <div class="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 shadow-xs">
          <div class="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <i class="fas fa-rotate-left text-sm"></i>
          </div>
          <div class="flex-1 text-xs text-amber-950">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm">Importación Reabierta (Revisión #${imp.reopened_count})</span>
              <span class="text-[11px] text-amber-800 font-mono">${(window as any).esc(imp.reopened_at || '')}</span>
            </div>
            <p class="mt-0.5 text-amber-900">
              <strong>Motivo de reapertura:</strong> ${(window as any).esc(imp.reopened_reason || 'Reabierta para modificaciones.')}
            </p>
            <p class="mt-1 text-[11px] text-amber-800">
              <i class="fas fa-circle-info mr-1"></i> El asiento contable anterior y el ingreso a bodega fueron revertidos de forma segura. Realiza las correcciones de costos, fletes o aranceles y luego utiliza <strong>"Recibir e Ingresar a Bodega"</strong> para recapitalizar el inventario.
            </p>
          </div>
        </div>
      ` : ''}

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
            ${renderTerceroDynamicPicker({
              id: 'imp-supplier-id',
              value: imp?.supplier_id || '',
              placeholder: 'Buscar proveedor por NIT o nombre...'
            })}
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
            <p class="text-xs text-blue-700">Gestiona cada factura comercial con su respectivo proveedor extranjero, vencimiento de pago y porcentaje manual de distribución de costos al cierre.</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold" id="badge-inv-dist-wrap" style="background:#F8FAFC;border-color:#E2E8F0" title="Suma total de los porcentajes de distribución asignados">
              <span class="text-slate-500">Distribución Total:</span>
              <span class="font-mono text-blue-800" id="lbl-inv-total-dist-pct">0%</span>
            </div>
            <button type="button" class="btn btn-outline btn-xs flex items-center gap-1 bg-white hover:bg-amber-50 hover:border-amber-300 text-amber-800" id="btn-inv-suggest-fob" onclick="window.impSuggestInvoiceDistFob()" title="Sugerir porcentajes proporcionalmente según el valor FOB de cada factura">
              <i class="fas fa-wand-magic-sparkles text-amber-500"></i> Sugerir % FOB
            </button>
            <button type="button" class="btn btn-primary btn-xs flex items-center gap-1" onclick="window.impOpenInvoiceModal()">
              <i class="fas fa-plus"></i> Agregar Factura Comercial
            </button>
          </div>
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
                <th class="py-2 px-3 text-right bg-amber-50/80 border-x border-amber-200" style="width:130px" title="Porcentaje manual al tanteo para asignar los costos al cierre de la importación">
                  % Dist. Costo <i class="fas fa-sliders text-amber-600 text-[10px]"></i>
                </th>
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

        <div class="border rounded-xl bg-white shadow-2xs overflow-hidden" style="border-color:#DCE6F8">
          <div style="overflow-x:auto;max-height:480px;overflow-y:auto">
            <table class="data-table" id="imp-lines-table" style="min-width:1420px">
              <thead style="position:sticky;top:0;z-index:10">
                <tr>
                  <th style="min-width:320px;background:#F4F8FF">Producto & Control Lote/Estibas</th>
                  <th class="col-consolidated-th ${imp?.is_consolidated ? '' : 'hidden'}" style="min-width:180px;background:#F4F8FF">Proveedor / Factura</th>
                  <th class="text-right" style="width:140px;background:#F4F8FF">Cant. Total & Unidad</th>
                  <th class="text-right" style="width:130px;background:#F4F8FF" id="lbl-th-fob-price">P. FOB (USD)</th>
                  <th class="text-right" style="width:90px;background:#F4F8FF">Arancel %</th>
                  <th class="text-right" style="width:85px;background:#F4F8FF">IVA %</th>
                  <th style="min-width:140px;background:#F4F8FF">Nro. Manifiesto</th>
                  <th style="width:130px;background:#F4F8FF">Archivo PDF</th>
                  <th class="text-right" style="width:125px;background:#F4F8FF">Costo Est. (COP)</th>
                  <th class="text-right" style="width:130px;background:#F4F8FF">Total (COP)</th>
                  <th style="width:45px;background:#F4F8FF">Acción</th>
                </tr>
              </thead>
              <tbody id="imp-lines-body"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 4. Causaciones por Etapas y Gastos de Nacionalización (Sistema de Pestañas con Pipeline) -->
      ${(() => {
        const stagesList = [imp?.tx_fob_id, imp?.tx_freight_id, imp?.tx_insurance_id, imp?.tx_customs_id, imp?.tx_local_carrier_id, imp?.tx_local_other_id];
        const stagesWithLines = ['fob', 'freight', 'insurance', 'customs', 'local_carrier', 'local_other'].filter(c => (linkedTxLines || []).some((l: any) => l.import_concept === c));
        const causedCount = isInverseMode ? stagesWithLines.length : stagesList.filter(Boolean).length;
        const progressPct = Math.round((causedCount / 6) * 100);

        const getStageDot = (stageKey: string) => {
          if (isInverseMode) {
            const count = (linkedTxLines || []).filter((l: any) => l.import_concept === stageKey).length;
            return count > 0
              ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="${count} movimiento(s) vinculados"></span>`
              : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Sin movimientos vinculados"></span>`;
          }
          const legacyTx = stageKey === 'fob' ? imp?.tx_fob_id : imp?.[`tx_${stageKey}_id`];
          return legacyTx
            ? `<span class="w-2 h-2 rounded-full bg-emerald-500" title="Causado"></span>`
            : `<span class="w-2 h-2 rounded-full bg-slate-300" title="Pendiente"></span>`;
        };

        return `
        <div class="rounded-xl border shadow-sm overflow-hidden bg-white mb-6" style="border-color:#E2E8F0">
          
          <!-- Stepper & Progress Header -->
          <div class="p-4 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg ${isInverseMode ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'} flex items-center justify-center">
                <i class="fas ${isInverseMode ? 'fa-arrow-right-arrow-left' : 'fa-calculator'} text-lg"></i>
              </div>
              <div>
                <h4 class="font-bold text-sm md:text-base text-white flex items-center gap-2">
                  ${isInverseMode ? 'Rastreo y Visor de Costos por Etapas' : 'Causación Contable por Etapas'}
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isInverseMode ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30' : 'bg-blue-500/30 text-blue-200 border border-blue-400/30'}">
                    ${isInverseMode ? '<i class="fas fa-arrow-right-arrow-left mr-1"></i>Modo Inverso (Contabilidad)' : 'Hoja de Costos'}
                  </span>
                </h4>
                <p class="text-xs text-slate-300">
                  ${isInverseMode ? 'Modo Inverso Activo: Los costos de cada etapa se leen directamente de los asientos contables vinculados por código de importación.' : 'Gestión contable secuencial para registro de compras FOB, fletes, seguros, impuestos DIAN y acarreos.'}
                </p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="flex items-center gap-3 bg-slate-800/90 px-3.5 py-2 rounded-lg border border-slate-700">
              <div class="text-right">
                <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">${isInverseMode ? 'Etapas con Asientos' : 'Avance Contable'}</div>
                <div class="text-xs font-bold text-white" id="imp-stage-progress-text">${causedCount} de 6 Etapas ${isInverseMode ? 'Vinculadas' : 'Causadas'}</div>
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
              ${getStageDot('fob')}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="freight" onclick="window.switchImpStageTab('freight')">
              <i class="fas fa-plane-departure text-sky-500"></i>
              <span>2. Flete Int.</span>
              ${getStageDot('freight')}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="insurance" onclick="window.switchImpStageTab('insurance')">
              <i class="fas fa-shield-alt text-amber-500"></i>
              <span>3. Seguro Int.</span>
              ${getStageDot('insurance')}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="customs" onclick="window.switchImpStageTab('customs')">
              <i class="fas fa-building-columns text-purple-500"></i>
              <span>4. Aduana / DIAN</span>
              ${getStageDot('customs')}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="local_carrier" onclick="window.switchImpStageTab('local_carrier')">
              <i class="fas fa-truck text-emerald-600"></i>
              <span>5. Transporte Local</span>
              ${getStageDot('local_carrier')}
            </button>

            <button type="button" class="imp-stage-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border-0 text-slate-600 hover:bg-slate-200/60" data-tab="local_other" onclick="window.switchImpStageTab('local_other')">
              <i class="fas fa-box text-orange-500"></i>
              <span>6. Otros Gastos</span>
              ${getStageDot('local_other')}
            </button>
          </div>

          <!-- Tab Content Panels Container -->
          <div class="p-5 bg-slate-50/50">

            <!-- Panel 0: Vista General - Dashboard Ejecutivo de Hoja de Costos -->
            <div class="imp-stage-panel space-y-5" id="imp-stage-panel-resumen">
              
              <!-- Tarjetas KPI Superiores en Formato Amplio -->
              <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                
                <!-- 1. FOB Mercancía -->
                <div class="p-3.5 rounded-xl border bg-white shadow-sm flex flex-col justify-between" style="border-color:#E2E8F0">
                  <div class="flex items-center justify-between text-slate-500 mb-1">
                    <span class="text-[11px] font-bold uppercase tracking-wider">1. FOB Mercancía</span>
                    <div class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs"><i class="fas fa-ship"></i></div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 font-mono" id="kpi-fob-usd">$ 0 USD</div>
                    <div class="text-base font-extrabold text-slate-900 font-mono mt-0.5" id="lbl-res-fob-cop">$ 0</div>
                  </div>
                  <button type="button" class="mt-2 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold text-left flex items-center gap-1 border-0 bg-transparent p-0 cursor-pointer" onclick="window.switchImpStageTab('fob')">
                    <span>Ver detalle</span> <i class="fas fa-arrow-right text-[9px]"></i>
                  </button>
                </div>

                <!-- 2. Gastos CIF (Flete + Seguro) -->
                <div class="p-3.5 rounded-xl border bg-white shadow-sm flex flex-col justify-between" style="border-color:#E2E8F0">
                  <div class="flex items-center justify-between text-slate-500 mb-1">
                    <span class="text-[11px] font-bold uppercase tracking-wider">2. Logística CIF</span>
                    <div class="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs"><i class="fas fa-plane-departure"></i></div>
                  </div>
                  <div>
                    <div class="text-[11px] text-slate-400">Flete + Seguro Int.</div>
                    <div class="text-base font-extrabold text-sky-950 font-mono mt-0.5" id="lbl-res-cif-cop">$ 0</div>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <button type="button" class="text-[11px] text-sky-600 hover:text-sky-800 font-bold border-0 bg-transparent p-0 cursor-pointer" onclick="window.switchImpStageTab('freight')">Flete</button>
                    <span class="text-slate-300">·</span>
                    <button type="button" class="text-[11px] text-amber-600 hover:text-amber-800 font-bold border-0 bg-transparent p-0 cursor-pointer" onclick="window.switchImpStageTab('insurance')">Seguro</button>
                  </div>
                </div>

                <!-- 3. Aduanas & Arancel DIAN -->
                <div class="p-3.5 rounded-xl border bg-white shadow-sm flex flex-col justify-between" style="border-color:#E2E8F0">
                  <div class="flex items-center justify-between text-slate-500 mb-1">
                    <span class="text-[11px] font-bold uppercase tracking-wider">3. Aduana / DIAN</span>
                    <div class="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><i class="fas fa-building-columns"></i></div>
                  </div>
                  <div>
                    <div class="text-[11px] text-slate-400">Aranceles + Agenciamiento</div>
                    <div class="text-base font-extrabold text-purple-950 font-mono mt-0.5" id="lbl-res-arancel-cop">$ 0</div>
                  </div>
                  <button type="button" class="mt-2 text-[11px] text-purple-600 hover:text-purple-800 font-bold text-left flex items-center gap-1 border-0 bg-transparent p-0 cursor-pointer" onclick="window.switchImpStageTab('customs')">
                    <span>Nacionalización</span> <i class="fas fa-arrow-right text-[9px]"></i>
                  </button>
                </div>

                <!-- 4. Transporte & Gastos Locales -->
                <div class="p-3.5 rounded-xl border bg-white shadow-sm flex flex-col justify-between" style="border-color:#E2E8F0">
                  <div class="flex items-center justify-between text-slate-500 mb-1">
                    <span class="text-[11px] font-bold uppercase tracking-wider">4. Gastos Locales</span>
                    <div class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs"><i class="fas fa-truck"></i></div>
                  </div>
                  <div>
                    <div class="text-[11px] text-slate-400">Acarreos + Bodegaje</div>
                    <div class="text-base font-extrabold text-emerald-950 font-mono mt-0.5" id="lbl-res-locales-cop">$ 0</div>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <button type="button" class="text-[11px] text-emerald-600 hover:text-emerald-800 font-bold border-0 bg-transparent p-0 cursor-pointer" onclick="window.switchImpStageTab('local_carrier')">Transporte</button>
                    <span class="text-slate-300">·</span>
                    <button type="button" class="text-[11px] text-orange-600 hover:text-orange-800 font-bold border-0 bg-transparent p-0 cursor-pointer" onclick="window.switchImpStageTab('local_other')">Otros</button>
                  </div>
                </div>

                <!-- 5. COSTO TOTAL CONSOLIDADO -->
                <div class="col-span-2 md:col-span-1 p-3.5 rounded-xl border bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md flex flex-col justify-between">
                  <div class="flex items-center justify-between text-blue-200 mb-1">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider">Costo Capitalizable</span>
                    <i class="fas fa-sack-dollar text-amber-400 text-sm"></i>
                  </div>
                  <div>
                    <div class="text-[11px] text-blue-200" id="lbl-res-total-usd">Equiv. $ 0 USD</div>
                    <div class="text-lg font-black text-amber-300 font-mono mt-0.5" id="lbl-res-total-cop">$ 0</div>
                  </div>
                  <div class="text-[10px] text-blue-300 font-semibold mt-1">
                    <i class="fas fa-boxes-packing mr-1"></i> Costo final a bodega
                  </div>
                </div>

              </div>

              <!-- Matriz de Liquidación y Hoja de Costos Analítica a Ancho Completo -->
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h5 class="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <i class="fas fa-file-invoice-dollar text-blue-600"></i>
                      Hoja de Costos Consolidada y Estado Contable
                    </h5>
                    <p class="text-xs text-slate-500 mt-0.5">Desglose de cada rubro de importación, contrapartida contable y estado de causación.</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="badge badge-blue text-xs font-semibold" id="badge-summary-lines-count">6 Rubros Contables</span>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-xs text-left border-collapse" id="imp-summary-table">
                    <thead>
                      <tr class="border-b text-slate-500 font-semibold bg-slate-100/50">
                        <th class="py-2.5 px-3">Rubro / Etapa</th>
                        <th class="py-2.5 px-3">Contrapartida PUC</th>
                        <th class="py-2.5 px-3">Tercero(s) / Facturas</th>
                        <th class="py-2.5 px-3 text-right">Subtotal Divisa</th>
                        <th class="py-2.5 px-3 text-right">Total (COP)</th>
                        <th class="py-2.5 px-3 text-right" style="width:90px">% Costo</th>
                        <th class="py-2.5 px-3 text-center" style="width:120px">Estado Contable</th>
                        <th class="py-2.5 px-3 text-center" style="width:110px">Acción</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="imp-summary-tbody">
                      <!-- Inyectado por impRecalcTotals -->
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- Panel 1: FOB Mercancía -->
            <div class="imp-stage-panel hidden space-y-4" id="imp-stage-panel-fob">
              ${isInverseMode ? renderStageAccountingViewer({
                stageKey: 'fob',
                stageTitle: 'Etapa 1: FOB Mercancía (Proveedor del Exterior)',
                pucCode: '220505',
                pucName: 'Proveedores del Exterior',
                icon: 'fas fa-ship',
                iconColor: 'text-indigo-600',
                iconBg: 'bg-indigo-50',
                lines: (linkedTxLines || []).filter((l: any) => l.import_concept === 'fob'),
                importId,
              }) : `
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                      <i class="fas fa-ship"></i>
                    </div>
                    <div>
                      <h5 class="font-bold text-sm text-slate-800">Etapa 1: FOB Mercancía (Proveedor del Exterior)</h5>
                      <p class="text-xs text-slate-400">Contrapartida: <strong>PUC 220505 (Proveedores del Exterior)</strong> · Base de compra internacional</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-primary btn-xs" onclick="window.switchImpStageTab('resumen')">
                      <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
                    </button>
                  </div>
                </div>

                <!-- Vista Estándar: Proveedor Único -->
                <div id="imp-fob-single-view" class="${imp?.is_consolidated ? 'hidden' : ''}">
                  <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Proveedor Internacional:</label>
                      <div class="p-2 bg-white rounded-lg border border-slate-200 font-bold text-slate-800" id="stage-fob-supplier-detail-name">
                        ${imp?.expand?.supplier_id ? (window as any).esc(imp.expand.supplier_id.name) : 'Definido arriba'}
                      </div>
                    </div>
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Nro. Factura Comercial:</label>
                      <input type="text" id="imp-supplier-invoice-num" class="form-input text-xs py-1 font-mono w-full" placeholder="Factura Nro" value="${(window as any).esc(imp?.supplier_invoice_num || '')}" ${imp?.tx_fob_id ? 'disabled' : ''}>
                    </div>
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Total FOB (Divisa):</label>
                      <input type="number" id="imp-fob-total" class="form-input text-xs py-1 text-right font-semibold font-mono w-full" value="${imp?.fob_total || '0'}" readonly style="background:#F3F4F6">
                    </div>
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Acción Contable:</label>
                      <div id="wrap-fob-single-action">
                        ${imp?.tx_fob_id ? `
                          <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full py-1.5" onclick="window.viewStageTx('${imp.tx_fob_id}')">
                            <i class="fas fa-receipt mr-1"></i> Ver Asiento
                          </button>
                        ` : `
                          <button type="button" class="btn btn-primary btn-xs w-full py-1.5" id="btn-causar-fob" onclick="window.triggerStageCausacion('fob')">
                            <i class="fas fa-calculator mr-1"></i> Causar FOB
                          </button>
                        `}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Vista Consolidada: Tabla de Facturas Comerciales por Proveedor -->
                <div id="imp-fob-consolidated-view" class="${imp?.is_consolidated ? '' : 'hidden'} space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800">Causación Individual por Factura Comercial:</span>
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.impOpenInvoiceModal()">
                      <i class="fas fa-plus mr-1"></i> Nueva Factura Comercial
                    </button>
                  </div>
                  <div class="border rounded-xl overflow-hidden bg-white">
                    <table class="w-full text-xs text-left">
                      <thead class="bg-slate-50 text-slate-600 border-b">
                        <tr>
                          <th class="py-2.5 px-3">Proveedor Internacional</th>
                          <th class="py-2.5 px-3">Factura Nro.</th>
                          <th class="py-2.5 px-3">Vencimiento</th>
                          <th class="py-2.5 px-3 text-right">FOB (USD)</th>
                          <th class="py-2.5 px-3 text-right">FOB (COP)</th>
                          <th class="py-2.5 px-3 text-center">Acción Contable</th>
                        </tr>
                      </thead>
                      <tbody id="imp-fob-stage-invoices-body" class="divide-y divide-slate-100"></tbody>
                    </table>
                  </div>
                </div>
              </div>
              `}
            </div>

            <!-- Panel 2: Flete Internacional -->
            <div class="imp-stage-panel hidden space-y-4" id="imp-stage-panel-freight">
              ${isInverseMode ? renderStageAccountingViewer({
                stageKey: 'freight',
                stageTitle: 'Etapa 2: Flete Internacional (Naviera / Aerolínea / Forwarder)',
                pucCode: '233545',
                pucName: 'Costos y Gastos Fletes',
                icon: 'fas fa-plane-departure',
                iconColor: 'text-sky-600',
                iconBg: 'bg-sky-50',
                lines: (linkedTxLines || []).filter((l: any) => l.import_concept === 'freight'),
                importId,
              }) : `
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-base">
                      <i class="fas fa-plane-departure"></i>
                    </div>
                    <div>
                      <h5 class="font-bold text-sm text-slate-800">Etapa 2: Flete Internacional (Naviera / Aerolínea / Forwarder)</h5>
                      <p class="text-xs text-slate-400">Contrapartida: <strong>PUC 233545 (Costos y Gastos por Pagar - Fletes)</strong> · Afecta base CIF</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.impAddStageExpenseLine('freight')">
                      <i class="fas fa-plus mr-1"></i> Agregar Factura / Proveedor Adicional
                    </button>
                    <button type="button" class="btn btn-primary btn-xs" onclick="window.switchImpStageTab('resumen')">
                      <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
                    </button>
                  </div>
                </div>

                <div class="border rounded-xl overflow-hidden bg-white">
                  <table class="w-full text-xs text-left border-collapse" id="imp-stage-freight-table">
                    <thead>
                      <tr class="border-b text-slate-600 font-semibold bg-slate-50">
                        <th class="py-2.5 px-3" style="min-width:210px">Proveedor / Tercero</th>
                        <th class="py-2.5 px-3" style="width:130px">Factura Nro</th>
                        <th class="py-2.5 px-3" style="min-width:160px">Comentario / Detalle</th>
                        <th class="py-2.5 px-3 text-right" style="width:110px">Monto Divisa</th>
                        <th class="py-2.5 px-3 text-right bg-amber-50/50" style="width:105px">TRM ($)</th>
                        <th class="py-2.5 px-3 text-right" style="width:125px">Total (COP)</th>
                        <th class="py-2.5 px-3 text-center" style="width:115px">Acción Contable</th>
                        <th class="py-2.5 px-2 text-center" style="width:36px"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="imp-stage-freight-lines-body"></tbody>
                  </table>
                </div>

                <div class="flex justify-between items-center p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs">
                  <div class="text-sky-900 font-medium">
                    <i class="fas fa-circle-info mr-1 text-sky-600"></i> El flete se prorratea entre los ítems según el método seleccionado (FOB, peso o volumen).
                  </div>
                  <div class="text-right">
                    <span class="text-slate-500 mr-2">Total Flete COP:</span>
                    <span class="font-mono font-bold text-sky-950 text-sm" id="summary-subtotal-freight">$ 0</span>
                  </div>
                </div>
              </div>
              `}
            </div>

            <!-- Panel 3: Seguro Internacional -->
            <div class="imp-stage-panel hidden space-y-4" id="imp-stage-panel-insurance">
              ${isInverseMode ? renderStageAccountingViewer({
                stageKey: 'insurance',
                stageTitle: 'Etapa 3: Seguro Internacional (Aseguradora / Póliza de Carga)',
                pucCode: '233555',
                pucName: 'Seguros y Pólizas Int.',
                icon: 'fas fa-shield-alt',
                iconColor: 'text-amber-600',
                iconBg: 'bg-amber-50',
                lines: (linkedTxLines || []).filter((l: any) => l.import_concept === 'insurance'),
                importId,
              }) : `
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div>
                      <h5 class="font-bold text-sm text-slate-800">Etapa 3: Seguro Internacional (Aseguradora / Póliza de Carga)</h5>
                      <p class="text-xs text-slate-400">Contrapartida: <strong>PUC 233555 (Seguros y Pólizas Internacionales)</strong> · Afecta base CIF</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.impAddStageExpenseLine('insurance')">
                      <i class="fas fa-plus mr-1"></i> Agregar Factura / Aseguradora Adicional
                    </button>
                    <button type="button" class="btn btn-primary btn-xs" onclick="window.switchImpStageTab('resumen')">
                      <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
                    </button>
                  </div>
                </div>

                <div class="border rounded-xl overflow-hidden bg-white">
                  <table class="w-full text-xs text-left border-collapse" id="imp-stage-insurance-table">
                    <thead>
                      <tr class="border-b text-slate-600 font-semibold bg-slate-50">
                        <th class="py-2.5 px-3" style="min-width:210px">Aseguradora / Tercero</th>
                        <th class="py-2.5 px-3" style="width:130px">Póliza / Factura</th>
                        <th class="py-2.5 px-3" style="min-width:160px">Comentario / Cobertura</th>
                        <th class="py-2.5 px-3 text-right" style="width:110px">Monto Divisa</th>
                        <th class="py-2.5 px-3 text-right bg-amber-50/50" style="width:105px">TRM ($)</th>
                        <th class="py-2.5 px-3 text-right" style="width:125px">Total (COP)</th>
                        <th class="py-2.5 px-3 text-center" style="width:115px">Acción Contable</th>
                        <th class="py-2.5 px-2 text-center" style="width:36px"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="imp-stage-insurance-lines-body"></tbody>
                  </table>
                </div>

                <div class="flex justify-between items-center p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                  <div class="text-amber-900 font-medium">
                    <i class="fas fa-circle-info mr-1 text-amber-600"></i> La prima del seguro se integra a la base CIF incrementando la base de aranceles.
                  </div>
                  <div class="text-right">
                    <span class="text-slate-500 mr-2">Total Seguro COP:</span>
                    <span class="font-mono font-bold text-amber-950 text-sm" id="summary-subtotal-insurance">$ 0</span>
                  </div>
                </div>
              </div>
              `}
            </div>

            <!-- Panel 4: Aduana / DIAN -->
            <div class="imp-stage-panel hidden space-y-4" id="imp-stage-panel-customs">
              ${isInverseMode ? renderStageAccountingViewer({
                stageKey: 'customs',
                stageTitle: 'Etapa 4: Nacionalización (Aduana / DIAN / SIA)',
                pucCode: '233595',
                pucName: 'Agenciamiento Aduanero y Aranceles',
                icon: 'fas fa-building-columns',
                iconColor: 'text-purple-600',
                iconBg: 'bg-purple-50',
                lines: (linkedTxLines || []).filter((l: any) => l.import_concept === 'customs'),
                importId,
              }) : `
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base">
                      <i class="fas fa-building-columns"></i>
                    </div>
                    <div>
                      <h5 class="font-bold text-sm text-slate-800">Etapa 4: Nacionalización (Aduana / DIAN / SIA)</h5>
                      <p class="text-xs text-slate-400">Contrapartida: <strong>PUC 233595 (Agenciamiento Aduanero y Nacionalización)</strong></p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.impAddStageExpenseLine('customs')">
                      <i class="fas fa-plus mr-1"></i> Agregar Factura / Agente Adicional
                    </button>
                    <button type="button" class="btn btn-primary btn-xs" onclick="window.switchImpStageTab('resumen')">
                      <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
                    </button>
                  </div>
                </div>

                <div class="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-950 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span class="font-bold"><i class="fas fa-scale-balanced mr-1.5"></i> Aranceles Liquidados de Mercancías:</span>
                    <span class="font-mono font-bold text-purple-900 ml-1" id="stage-customs-arancel">$ 0</span>
                    <p class="text-[11px] text-purple-700 mt-0.5">Calculados automáticamente a partir de la tasa arancelaria de cada producto sobre la base CIF.</p>
                  </div>
                  <div class="text-right">
                    <span class="text-slate-500 mr-2">Total Aduana COP:</span>
                    <span class="font-mono font-bold text-purple-950 text-sm" id="summary-subtotal-customs">$ 0</span>
                  </div>
                </div>

                <div class="border rounded-xl overflow-hidden bg-white">
                  <table class="w-full text-xs text-left border-collapse" id="imp-stage-customs-table">
                    <thead>
                      <tr class="border-b text-slate-600 font-semibold bg-slate-50">
                        <th class="py-2.5 px-3" style="min-width:210px">Agencia Aduanera / DIAN</th>
                        <th class="py-2.5 px-3" style="width:130px">Factura Nro</th>
                        <th class="py-2.5 px-3" style="min-width:160px">Concepto / Trámite</th>
                        <th class="py-2.5 px-3 text-right" style="width:110px">Monto (COP)</th>
                        <th class="py-2.5 px-3 text-right bg-amber-50/50" style="width:105px">TRM ($)</th>
                        <th class="py-2.5 px-3 text-right" style="width:125px">Total (COP)</th>
                        <th class="py-2.5 px-3 text-center" style="width:115px">Acción Contable</th>
                        <th class="py-2.5 px-2 text-center" style="width:36px"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="imp-stage-customs-lines-body"></tbody>
                  </table>
                </div>
              </div>
              `}
            </div>

            <!-- Panel 5: Transporte Local -->
            <div class="imp-stage-panel hidden space-y-4" id="imp-stage-panel-local_carrier">
              ${isInverseMode ? renderStageAccountingViewer({
                stageKey: 'local_carrier',
                stageTitle: 'Etapa 5: Transporte Local / Acarreos Terrestres',
                pucCode: '233545',
                pucName: 'Acarreos y Fletes Terrestres Locales',
                icon: 'fas fa-truck',
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
                lines: (linkedTxLines || []).filter((l: any) => l.import_concept === 'local_carrier'),
                importId,
              }) : `
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                      <i class="fas fa-truck"></i>
                    </div>
                    <div>
                      <h5 class="font-bold text-sm text-slate-800">Etapa 5: Transporte Local / Acarreos Terrestres</h5>
                      <p class="text-xs text-slate-400">Contrapartida: <strong>PUC 233545 (Acarreos y Fletes Terrestres Locales)</strong></p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.impAddStageExpenseLine('local_carrier')">
                      <i class="fas fa-plus mr-1"></i> Agregar Factura / Transportador Adicional
                    </button>
                    <button type="button" class="btn btn-primary btn-xs" onclick="window.switchImpStageTab('resumen')">
                      <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
                    </button>
                  </div>
                </div>

                <div class="border rounded-xl overflow-hidden bg-white">
                  <table class="w-full text-xs text-left border-collapse" id="imp-stage-local_carrier-table">
                    <thead>
                      <tr class="border-b text-slate-600 font-semibold bg-slate-50">
                        <th class="py-2.5 px-3" style="min-width:210px">Transportadora / Tercero</th>
                        <th class="py-2.5 px-3" style="width:130px">Remesa / Factura</th>
                        <th class="py-2.5 px-3" style="min-width:160px">Ruta / Detalle</th>
                        <th class="py-2.5 px-3 text-right" style="width:110px">Monto (COP)</th>
                        <th class="py-2.5 px-3 text-right bg-amber-50/50" style="width:105px">TRM ($)</th>
                        <th class="py-2.5 px-3 text-right" style="width:125px">Total (COP)</th>
                        <th class="py-2.5 px-3 text-center" style="width:115px">Acción Contable</th>
                        <th class="py-2.5 px-2 text-center" style="width:36px"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="imp-stage-local_carrier-lines-body"></tbody>
                  </table>
                </div>

                <div class="flex justify-between items-center p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                  <div class="text-emerald-900 font-medium">
                    <i class="fas fa-circle-info mr-1 text-emerald-600"></i> Flete terrestre desde el puerto o zona franca de ingreso hasta depósito final.
                  </div>
                  <div class="text-right">
                    <span class="text-slate-500 mr-2">Total Transporte COP:</span>
                    <span class="font-mono font-bold text-emerald-950 text-sm" id="summary-subtotal-local_carrier">$ 0</span>
                  </div>
                </div>
              </div>
              `}
            </div>

            <!-- Panel 6: Otros Gastos -->
            <div class="imp-stage-panel hidden space-y-4" id="imp-stage-panel-local_other">
              ${isInverseMode ? renderStageAccountingViewer({
                stageKey: 'local_other',
                stageTitle: 'Etapa 6: Otros Gastos Operativos y Portuarios',
                pucCode: '233595',
                pucName: 'Gastos Portuarios y Bodegaje',
                icon: 'fas fa-box',
                iconColor: 'text-orange-600',
                iconBg: 'bg-orange-50',
                lines: (linkedTxLines || []).filter((l: any) => l.import_concept === 'local_other'),
                importId,
              }) : `
              <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-base">
                      <i class="fas fa-box"></i>
                    </div>
                    <div>
                      <h5 class="font-bold text-sm text-slate-800">Etapa 6: Otros Gastos Operativos y Portuarios</h5>
                      <p class="text-xs text-slate-400">Contrapartida: <strong>PUC 233595 (Gastos Portuarios y Bodegaje)</strong></p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="btn btn-outline btn-xs" onclick="window.impAddStageExpenseLine('local_other')">
                      <i class="fas fa-plus mr-1"></i> Agregar Factura / Operador Adicional
                    </button>
                    <button type="button" class="btn btn-primary btn-xs" onclick="window.switchImpStageTab('resumen')">
                      <i class="fas fa-arrow-left mr-1"></i> Volver a la Hoja de Costos
                    </button>
                  </div>
                </div>

                <div class="border rounded-xl overflow-hidden bg-white">
                  <table class="w-full text-xs text-left border-collapse" id="imp-stage-local_other-table">
                    <thead>
                      <tr class="border-b text-slate-600 font-semibold bg-slate-50">
                        <th class="py-2.5 px-3" style="min-width:210px">Operador / Bodega / Tercero</th>
                        <th class="py-2.5 px-3" style="width:130px">Factura Nro</th>
                        <th class="py-2.5 px-3" style="min-width:160px">Concepto / Almacenaje</th>
                        <th class="py-2.5 px-3 text-right" style="width:110px">Monto (COP)</th>
                        <th class="py-2.5 px-3 text-right bg-amber-50/50" style="width:105px">TRM ($)</th>
                        <th class="py-2.5 px-3 text-right" style="width:125px">Total (COP)</th>
                        <th class="py-2.5 px-3 text-center" style="width:115px">Acción Contable</th>
                        <th class="py-2.5 px-2 text-center" style="width:36px"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100" id="imp-stage-local_other-lines-body"></tbody>
                  </table>
                </div>

                <div class="flex justify-between items-center p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-xs">
                  <div class="text-orange-900 font-medium">
                    <i class="fas fa-circle-info mr-1 text-orange-600"></i> Bodegaje, inspección de contenedor, manipuleos y trámites complementarios.
                  </div>
                  <div class="text-right">
                    <span class="text-slate-500 mr-2">Total Otros Gastos COP:</span>
                    <span class="font-mono font-bold text-orange-950 text-sm" id="summary-subtotal-local_other">$ 0</span>
                  </div>
                </div>
              </div>
              `}
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

  // Inicializar selector dinámico de Tercero / Proveedor Principal
  initTerceroDynamicPicker({
    id: 'imp-supplier-id',
    onChange: (_val, supp) => {
      const stageFobSupplier = document.getElementById('stage-fob-supplier-name');
      const stageFobDetail = document.getElementById('stage-fob-supplier-detail-name');
      const name = supp ? supp.name : 'Definido arriba';
      if (stageFobSupplier) stageFobSupplier.textContent = name;
      if (stageFobDetail) stageFobDetail.textContent = name;
      (window as any).impRecalcTotals();
    }
  });

  // --- Funciones de Gestión y Renderizado Multi-Línea por Etapas ---

  (window as any).impRenderStageTable = function(stageKey: string) {
    const tbody = document.getElementById(`imp-stage-${stageKey}-lines-body`);
    if (!tbody) return;

    const lines = localStageExpenses[stageKey] || [];
    if (!lines.length) {
      const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');
      const defaultTrm = (stageKey === 'local_carrier' || stageKey === 'local_other') ? 1 : exchangeRate;
      localStageExpenses[stageKey] = [{
        id: `stage-${stageKey}-${Date.now()}`,
        supplier_id: '',
        invoice_num: '',
        comment: '',
        amount: 0,
        trm: defaultTrm,
        tx_id: null
      }];
    }

    tbody.innerHTML = (localStageExpenses[stageKey] || []).map((line: any, idx: number) => {
      const isCaused = Boolean(line.tx_id);
      const amountVal = line.amount ?? 0;
      const trmVal = line.trm ?? 1;
      const totalCop = amountVal * trmVal;
      const pickerId = `stage-${stageKey}-line-${idx}-supp`;

      return `
        <tr class="hover:bg-slate-50 transition-colors ${isCaused ? 'bg-slate-50/70' : ''}" id="row-stage-${stageKey}-${idx}">
          <td class="py-2 px-2.5">
            ${renderTerceroDynamicPicker({
              id: pickerId,
              value: line.supplier_id || '',
              placeholder: 'Seleccionar tercero...',
              compact: true,
              disabled: isCaused
            })}
          </td>
          <td class="py-2 px-2.5">
            <input type="text" class="form-input text-xs py-1 font-mono font-bold w-full"
                   value="${(window as any).esc(line.invoice_num || '')}"
                   placeholder="Factura Nro"
                   ${isCaused ? 'disabled style="background:#F3F4F6"' : ''}
                   onchange="window.impUpdateStageLineField('${stageKey}', ${idx}, 'invoice_num', this.value)">
          </td>
          <td class="py-2 px-2.5">
            <input type="text" class="form-input text-xs py-1 w-full text-slate-700"
                   value="${(window as any).esc(line.comment || '')}"
                   placeholder="Detalle o concepto"
                   ${isCaused ? 'disabled style="background:#F3F4F6"' : ''}
                   onchange="window.impUpdateStageLineField('${stageKey}', ${idx}, 'comment', this.value)">
          </td>
          <td class="py-2 px-2.5 text-right">
            <input type="number" class="form-input text-xs py-1 text-right font-mono font-semibold w-full"
                   min="0" step="0.01" value="${amountVal}"
                   ${isCaused ? 'disabled style="background:#F3F4F6"' : ''}
                   oninput="window.impUpdateStageLineField('${stageKey}', ${idx}, 'amount', parseFloat(this.value) || 0)">
          </td>
          <td class="py-2 px-2.5 text-right bg-amber-50/30">
            <input type="number" class="form-input text-xs py-1 text-right font-mono w-full"
                   min="1" step="0.01" value="${trmVal}"
                   ${isCaused ? 'disabled style="background:#F3F4F6"' : ''}
                   oninput="window.impUpdateStageLineField('${stageKey}', ${idx}, 'trm', parseFloat(this.value) || 1)">
          </td>
          <td class="py-2 px-2.5 text-right font-mono font-bold text-slate-800" id="stage-${stageKey}-line-${idx}-cop">
            ${(window as any).fmt(totalCop)}
          </td>
          <td class="py-2 px-2.5 text-center">
            ${isCaused ? `
              <button type="button" class="btn btn-outline btn-xs text-blue-700 w-full py-1" onclick="window.viewStageTx('${line.tx_id}')">
                <i class="fas fa-receipt mr-1"></i> Asiento
              </button>
            ` : `
              <button type="button" class="btn btn-primary btn-xs w-full py-1" id="btn-causar-line-${stageKey}-${idx}" onclick="window.impTriggerStageLineCausacion('${stageKey}', ${idx})">
                <i class="fas fa-calculator mr-1"></i> Causar
              </button>
            `}
          </td>
          <td class="py-2 px-1 text-center">
            ${isCaused ? `
              <span class="text-slate-300" title="Línea con asiento contable"><i class="fas fa-lock text-xs"></i></span>
            ` : `
              <button type="button" class="text-slate-400 hover:text-red-600 transition-colors p-1 border-0 bg-transparent cursor-pointer" onclick="window.impRemoveStageExpenseLine('${stageKey}', ${idx})" title="Eliminar línea">
                <i class="fas fa-trash-can text-xs"></i>
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');

    // Inicializar picker para cada fila de la etapa
    (localStageExpenses[stageKey] || []).forEach((line: any, idx: number) => {
      const isCaused = Boolean(line.tx_id);
      initTerceroDynamicPicker({
        id: `stage-${stageKey}-line-${idx}-supp`,
        disabled: isCaused,
        onChange: (val) => {
          line.supplier_id = val;
          (window as any).impRecalcTotals();
        }
      });
    });
  };

  (window as any).impAddStageExpenseLine = function(stageKey: string) {
    if (!localStageExpenses[stageKey]) localStageExpenses[stageKey] = [];
    const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');
    const defaultTrm = (stageKey === 'local_carrier' || stageKey === 'local_other') ? 1 : exchangeRate;

    localStageExpenses[stageKey].push({
      id: `stage-${stageKey}-${Date.now()}`,
      supplier_id: '',
      invoice_num: '',
      comment: '',
      amount: 0,
      trm: defaultTrm,
      tx_id: null
    });

    (window as any).impRenderStageTable(stageKey);
    (window as any).impRecalcTotals();
  };

  (window as any).impRemoveStageExpenseLine = function(stageKey: string, lineIdx: number) {
    const line = localStageExpenses[stageKey]?.[lineIdx];
    if (!line) return;
    if (line.tx_id) {
      (window as any).showToast('No puedes eliminar una línea que ya cuenta con causación contable.', 'warning');
      return;
    }

    localStageExpenses[stageKey].splice(lineIdx, 1);
    if (!localStageExpenses[stageKey].length) {
      (window as any).impAddStageExpenseLine(stageKey);
    } else {
      (window as any).impRenderStageTable(stageKey);
      (window as any).impRecalcTotals();
    }
  };

  (window as any).impUpdateStageLineField = function(stageKey: string, lineIdx: number, field: string, val: any) {
    const line = localStageExpenses[stageKey]?.[lineIdx];
    if (!line) return;
    line[field] = val;

    const copCell = document.getElementById(`stage-${stageKey}-line-${lineIdx}-cop`);
    if (copCell) {
      const copVal = (line.amount || 0) * (line.trm || 1);
      copCell.textContent = (window as any).fmt(copVal);
    }

    (window as any).impRecalcTotals();
  };

  (window as any).impTriggerStageLineCausacion = async function(stageKey: string, lineIdx: number) {
    if (!importId) {
      (window as any).showToast('Por favor guarda la importación primero como Borrador antes de realizar causaciones contables.', 'warning');
      return;
    }

    const line = localStageExpenses[stageKey]?.[lineIdx];
    if (!line) return;

    if (!line.supplier_id) {
      (window as any).showToast('Debes seleccionar un proveedor / tercero para esta línea.', 'warning');
      return;
    }
    if (!line.invoice_num || !line.invoice_num.trim()) {
      (window as any).showToast('Debes ingresar el número de factura o soporte para esta línea.', 'warning');
      return;
    }
    const amountCOP = (line.amount || 0) * (line.trm || 1);
    if (amountCOP <= 0) {
      (window as any).showToast('El monto a causar debe ser mayor a cero.', 'warning');
      return;
    }

    const btn = document.getElementById(`btn-causar-line-${stageKey}-${lineIdx}`) as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Causando...';
    }

    try {
      await SupplyChainOrchestrator.postImportStageWithPaymentSchedule({
        importId,
        stageName: stageKey as any,
        supplierId: line.supplier_id,
        invoiceNum: line.invoice_num.trim(),
        amount: amountCOP,
        comment: line.comment || '',
        lineId: line.id,
        allowMultiple: true,
        stageExpenses: localStageExpenses
      });

      (window as any).showToast(`Causación y agenda de pagos creadas exitosamente para Factura ${line.invoice_num}.`, 'success');

      (window as any).closeModal();
      setTimeout(() => {
        openImportForm(importId, onDone);
      }, 300);

    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-calculator mr-1"></i> Causar';
      }
    }
  };

  // Renderizar tablas de las etapas 2 a 6
  ['freight', 'insurance', 'customs', 'local_carrier', 'local_other'].forEach(stg => {
    (window as any).impRenderStageTable(stg);
  });

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

  // Helper para control de Pesos y Medidas en línea
  (window as any).impTogglePesosFields = function(idx: number) {
    const wrap = document.getElementById(`wrap-pesos-fields-${idx}`);
    if (wrap) {
      wrap.classList.toggle('hidden');
      if (!wrap.classList.contains('hidden')) {
        const netInput = document.getElementById(`impl-peso-neto-${idx}`) as HTMLInputElement;
        netInput?.focus();
      }
    }
  };

  (window as any).impUpdateLinePesosStatus = function(idx: number) {
    const netInput = document.getElementById(`impl-peso-neto-${idx}`) as HTMLInputElement;
    const grossInput = document.getElementById(`impl-peso-bruto-${idx}`) as HTMLInputElement;
    const btn = document.getElementById(`btn-toggle-pesos-${idx}`);
    const lbl = document.getElementById(`lbl-pesos-btn-${idx}`);
    if (netInput && grossInput && btn && lbl) {
      const net = parseFloat(netInput.value || '0');
      const gross = parseFloat(grossInput.value || '0');
      if (net > 0 || gross > 0) {
        lbl.textContent = `P: ${gross > 0 ? gross : net} Kg`;
        btn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300', 'font-bold');
        btn.classList.remove('text-gray-600');
      } else {
        lbl.textContent = 'Pesos/Medidas';
        btn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300', 'font-bold');
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

    const isConsolidated = (document.getElementById('imp-is-consolidated') as HTMLInputElement)?.checked ?? isImportConsolidated;

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
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(productCode || 'S/C')}]</span>
            <span class="text-xs font-bold text-gray-900 leading-tight block" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
            ${productObj?.visto_bueno_required ? `
              <span class="badge badge-red text-[9px] py-0.5 px-1.5 ml-1 animate-pulse" style="font-size:9px" title="Requiere Visto Bueno ante ${productObj.visto_bueno_entidad} - Registro: ${productObj.registro_sanitario || 'Sin Registro'}">⚠️ V.B. ${productObj.visto_bueno_entidad}</span>
            ` : ''}
          </div>

          <!-- Metadatos técnicos (Posición arancelaria, certificado, país) -->
          <div class="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
            ${(preloadedLine?.posicion_arancelaria || productObj?.posicion_arancelaria) ? `<span>Pos: <span class="font-mono text-slate-700 font-bold">${(window as any).esc(preloadedLine?.posicion_arancelaria || productObj?.posicion_arancelaria)}</span></span>` : ''}
            ${preloadedLine?.pais_origen ? `<span>Origen: ${(window as any).esc(preloadedLine.pais_origen)}</span>` : ''}
          </div>

          <!-- Barra de controles compactos para Lotes, Pesos y Estibas -->
          <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <button type="button" class="btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md ${preloadedLine?.lot_number ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold' : 'text-gray-600 hover:text-blue-700'}" id="btn-toggle-lot-${idx}" onclick="window.impToggleLotFields(${idx})" title="Gestionar lote de fabricación y fecha de vencimiento">
              <i class="fas fa-barcode mr-1 text-indigo-500"></i><span id="lbl-lot-btn-${idx}">${preloadedLine?.lot_number ? `Lote: ${(window as any).esc(preloadedLine.lot_number)}` : '+ Lote'}</span>
            </button>

            <button type="button" class="btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md text-gray-600 hover:text-blue-700" id="btn-toggle-pesos-${idx}" onclick="window.impTogglePesosFields(${idx})" title="Modificar pesos (neto/bruto) y dimensiones de la mercancía">
              <i class="fas fa-weight-hanging mr-1 text-emerald-600"></i><span id="lbl-pesos-btn-${idx}">Pesos/Medidas</span>
            </button>

            <button type="button" class="btn btn-outline btn-xs text-[10px] py-0.5 px-2 rounded-md text-gray-600 hover:text-blue-700" id="btn-pallet-${idx}" onclick="window.impOpenPalletModal(${idx})" title="Configurar desglose por pallets/estibas para las ${initQty} ${formatUnitOfMeasure(prodUnit)}">
              <i class="fas fa-boxes-stacked text-blue-600 mr-1"></i><span id="lbl-pallet-${idx}">Estibas (${(window as any).esc(formatUnitOfMeasure(prodUnit))})</span>
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

          <!-- Micro-formulario expandible de pesos y dimensiones -->
          <div id="wrap-pesos-fields-${idx}" class="hidden mt-1.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span class="text-[9px] text-emerald-900 font-bold uppercase block">Peso Neto Tot (Kg):</span>
                <input type="number" step="0.01" min="0" id="impl-peso-neto-${idx}" class="form-input text-[10px] font-mono py-0.5 px-1.5 h-6 bg-white text-right font-semibold" value="${preloadedLine?.peso_neto_total ?? (productObj?.peso_neto ? (productObj.peso_neto * initQty).toFixed(2) : '0.00')}" oninput="this.dataset.overridden='true'; window.impUpdateLinePesosStatus(${idx}); window.impRecalcTotals();">
              </div>
              <div>
                <span class="text-[9px] text-emerald-900 font-bold uppercase block">Peso Bruto Tot (Kg):</span>
                <input type="number" step="0.01" min="0" id="impl-peso-bruto-${idx}" class="form-input text-[10px] font-mono py-0.5 px-1.5 h-6 bg-white text-right font-semibold" value="${preloadedLine?.peso_bruto_total ?? (productObj?.peso_bruto ? (productObj.peso_bruto * initQty).toFixed(2) : '0.00')}" oninput="this.dataset.overridden='true'; window.impUpdateLinePesosStatus(${idx}); window.impRecalcTotals();">
              </div>
            </div>
            <div class="grid grid-cols-4 gap-1 text-[9px]">
              <div>
                <span class="text-[8px] text-gray-600 uppercase block">Largo(cm)</span>
                <input type="number" step="0.1" min="0" id="impl-largo-cm-${idx}" class="form-input text-[9px] font-mono p-0.5 h-5 bg-white text-right" value="${baseLargoCm}" oninput="this.dataset.overridden='true'; window.impRecalcTotals();">
              </div>
              <div>
                <span class="text-[8px] text-gray-600 uppercase block">Ancho(cm)</span>
                <input type="number" step="0.1" min="0" id="impl-ancho-cm-${idx}" class="form-input text-[9px] font-mono p-0.5 h-5 bg-white text-right" value="${baseAnchoCm}" oninput="this.dataset.overridden='true'; window.impRecalcTotals();">
              </div>
              <div>
                <span class="text-[8px] text-gray-600 uppercase block">Alto(cm)</span>
                <input type="number" step="0.1" min="0" id="impl-alto-cm-${idx}" class="form-input text-[9px] font-mono p-0.5 h-5 bg-white text-right" value="${baseAltoCm}" oninput="this.dataset.overridden='true'; window.impRecalcTotals();">
              </div>
              <div>
                <span class="text-[8px] text-gray-600 uppercase block">CBM Tot</span>
                <input type="number" step="0.0001" min="0" id="impl-cbm-${idx}" class="form-input text-[9px] font-mono p-0.5 h-5 bg-white text-right" value="${preloadedLine?.cubic_meters_total ?? '0.0000'}" oninput="this.dataset.overridden='true';">
              </div>
            </div>
          </div>

          <input type="hidden" id="impl-prod-id-${idx}" value="${(window as any).esc(productId)}">

          <!-- Campos técnicos ocultos (prorrateo/cumplimiento) -->
          <input type="hidden" id="impl-pos-arancel-${idx}" value="${(window as any).esc(preloadedLine?.posicion_arancelaria || productObj?.posicion_arancelaria || '')}">
          <input type="hidden" id="impl-pais-origen-${idx}" value="${(window as any).esc(preloadedLine?.pais_origen || productObj?.pais_origen || '')}">
          <input type="hidden" id="impl-cert-origen-${idx}" value="${(window as any).esc(preloadedLine?.certificado_origen_num || '')}">
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

      <!-- Cantidad Total con Unidad de Medida Humanizada -->
      <td>
        <div class="flex flex-col gap-1">
          <input type="number" id="impl-qty-${idx}" class="form-input text-right w-full font-bold font-mono" style="font-size:13px;height:32px;padding:0 8px" min="0.001" step="0.001" value="${initQty}" oninput="window.impRecalcTotals(); window.impUpdateLinePalletStatus(${idx});">
          <div class="text-right">
            <span class="badge badge-blue text-[10px] py-0.5 px-1.5 font-bold inline-block" title="Código DIAN: ${(window as any).esc(prodUnit)}">
              ${(window as any).esc(formatUnitOfMeasure(prodUnit))}
            </span>
          </div>
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

    // Initial label and reconciliation check for pallets and weights
    (window as any).impUpdateLinePalletStatus(idx);
    (window as any).impUpdateLinePesosStatus(idx);

    (window as any).impRecalcTotals();
  };

  (window as any).impRecalcTotals = function() {
    const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
    const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const prorationMethod = (document.getElementById('imp-proration-method') as HTMLSelectElement)?.value || 'FOB_VALUE';
    const isConsolidated = (document.getElementById('imp-is-consolidated') as HTMLInputElement)?.checked;

    // Calcular costos desde localStageExpenses o desde linkedTxLines si está en modo inverso
    const getNetConceptCOP = (concept: string) => {
      const matching = (linkedTxLines || []).filter((l: any) => l.import_concept === concept);
      return matching.reduce((sum: number, l: any) => sum + (Number(l.debit || 0) - Number(l.credit || 0)), 0);
    };

    const freightLines = localStageExpenses['freight'] || [];
    const insuranceLines = localStageExpenses['insurance'] || [];
    const customsLines = localStageExpenses['customs'] || [];
    const localCarrierLines = localStageExpenses['local_carrier'] || [];
    const localOtherLines = localStageExpenses['local_other'] || [];

    const freightCost = isInverseMode ? 0 : freightLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
    const insuranceCost = isInverseMode ? 0 : insuranceLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
    const gastosNacionalizacion = isInverseMode ? 0 : customsLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
    const transporteNacional = isInverseMode ? 0 : localCarrierLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
    const otrosGastos = isInverseMode ? 0 : localOtherLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);

    const freightCostCOP = isInverseMode ? getNetConceptCOP('freight') : freightLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
    const insuranceCostCOP = isInverseMode ? getNetConceptCOP('insurance') : insuranceLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
    const totalCIFExpensesCOP = freightCostCOP + insuranceCostCOP;

    const gastosNacCOP = isInverseMode ? getNetConceptCOP('customs') : customsLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
    const transporteCOP = isInverseMode ? getNetConceptCOP('local_carrier') : localCarrierLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
    const otrosGastosCOP = isInverseMode ? getNetConceptCOP('local_other') : localOtherLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
    const totalLocalExpensesCOP = gastosNacCOP + transporteCOP + otrosGastosCOP;

    const totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

    let totalFOB = 0;
    let totalWeight = 0;
    let totalVolume = 0;
    let displayFOBUSD = 0;

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

    const inverseFobCOP = isInverseMode ? getNetConceptCOP('fob') : 0;
    const totalFOBCop = (isInverseMode && inverseFobCOP > 0) ? inverseFobCOP : (totalFOB * exchangeRate);
    let arancelTotalCOP = 0;

    // Second pass: distribute costs and update line totals
    const rowDataList: any[] = [];
    rows.forEach((tr: any) => {
      const idx = tr.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`impl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`impl-price-${idx}`) as HTMLInputElement)?.value || '0');
      const arancelRate = parseFloat((document.getElementById(`impl-arancel-${idx}`) as HTMLInputElement)?.value || '0');
      const grossInput = document.getElementById(`impl-peso-bruto-${idx}`) as HTMLInputElement;
      const pesoBrutoLine = parseFloat(grossInput?.value || '0');
      const lineCbm = parseFloat((document.getElementById(`impl-cbm-${idx}`) as HTMLInputElement)?.value || '0');

      rowDataList.push({
        idx,
        tr,
        qty,
        price,
        arancelRate,
        pesoBrutoLine,
        lineCbm,
        rawFob: qty * price,
        lineFOBCop: 0
      });
    });

    const fobTx = isInverseMode ? (linkedTxLines || []).find((l: any) => l.import_concept === 'fob') : null;
    const effectiveTrm = Number(fobTx?.import_trm) || exchangeRate || 1;

    // En Modo Inverso, el valor acumulado de compra asignado (inverseFobCOP) se reparte proporcionalmente entre las referencias
    if (isInverseMode && inverseFobCOP > 0) {
      if (rowDataList.length === 1) {
        rowDataList[0].lineFOBCop = inverseFobCOP;
      } else {
        let totalMetric = 0;
        if (prorationMethod === 'GROSS_WEIGHT') {
          totalMetric = totalWeight;
        } else if (prorationMethod === 'CUBIC_VOLUME') {
          totalMetric = totalVolume;
        } else {
          totalMetric = rowDataList.reduce((s, r) => s + (r.rawFob > 0 ? r.rawFob : (r.qty > 0 ? r.qty : 1)), 0);
        }

        rowDataList.forEach(r => {
          let m = 0;
          if (prorationMethod === 'GROSS_WEIGHT') m = r.pesoBrutoLine;
          else if (prorationMethod === 'CUBIC_VOLUME') m = r.lineCbm;
          else m = r.rawFob > 0 ? r.rawFob : (r.qty > 0 ? r.qty : 1);

          const ratio = totalMetric > 0 ? (m / totalMetric) : (1 / rowDataList.length);
          r.lineFOBCop = ratio * inverseFobCOP;
        });
      }

      // Indicar y sincronizar el precio de compra unitario en base al valor contable
      rowDataList.forEach(r => {
        if (r.qty > 0) {
          const calcPriceCOP = r.lineFOBCop / r.qty;
          const calcPriceUSD = effectiveTrm > 0 ? (calcPriceCOP / effectiveTrm) : calcPriceCOP;
          const priceInput = document.getElementById(`impl-price-${r.idx}`) as HTMLInputElement;
          if (priceInput && document.activeElement !== priceInput) {
            priceInput.value = (Math.round(calcPriceUSD * 100) / 100).toFixed(2);
            r.price = calcPriceUSD;
          }
        }
      });
    } else {
      rowDataList.forEach(r => {
        r.lineFOBCop = r.qty * r.price * exchangeRate;
      });
    }

    // Calcular costos prorrateados y totales por línea
    rowDataList.forEach(r => {
      let factor = 0;
      if (prorationMethod === 'GROSS_WEIGHT' && totalWeight > 0) {
        factor = r.pesoBrutoLine / totalWeight;
      } else if (prorationMethod === 'CUBIC_VOLUME' && totalVolume > 0) {
        factor = r.lineCbm / totalVolume;
      } else if (totalFOBCop > 0) {
        factor = r.lineFOBCop / totalFOBCop;
      }

      const proratedCost = factor * totalExpensesToProrateCOP;
      const arancelAmount = r.lineFOBCop * (r.arancelRate / 100);
      const lineTotalCOP = r.lineFOBCop + proratedCost + arancelAmount;
      const unitCostCOP = r.qty > 0 ? (lineTotalCOP / r.qty) : 0;

      arancelTotalCOP += arancelAmount;

      // Update line labels
      const unitLabel = document.getElementById(`impl-unit-cop-${r.idx}`);
      const totalLabel = document.getElementById(`impl-total-cop-${r.idx}`);
      if (unitLabel) unitLabel.textContent = (window as any).fmt(unitCostCOP);
      if (totalLabel) totalLabel.textContent = (window as any).fmt(lineTotalCOP);
    });

    displayFOBUSD = (isInverseMode && inverseFobCOP > 0 && effectiveTrm > 0)
      ? (inverseFobCOP / effectiveTrm)
      : totalFOB;

    const grandTotalCOP = totalFOBCop + totalExpensesToProrateCOP + arancelTotalCOP;

    // Update global inputs/labels
    const fobTotalInput = document.getElementById('imp-fob-total') as HTMLInputElement;
    if (fobTotalInput) fobTotalInput.value = displayFOBUSD.toFixed(2);

    // KPI Cards Superiores
    const kpiFobUsd = document.getElementById('kpi-fob-usd');
    const lblResFob = document.getElementById('lbl-res-fob-cop');
    const lblResCif = document.getElementById('lbl-res-cif-cop');
    const lblResArancel = document.getElementById('lbl-res-arancel-cop');
    const lblResLocales = document.getElementById('lbl-res-locales-cop');
    const lblResTotalUsd = document.getElementById('lbl-res-total-usd');
    const lblResTotal = document.getElementById('lbl-res-total-cop');
    const customsArancel = document.getElementById('stage-customs-arancel');

    if (kpiFobUsd) kpiFobUsd.textContent = `$ ${(window as any).fmtN(displayFOBUSD)} ${currency}`;
    if (lblResFob) lblResFob.textContent = (window as any).fmt(totalFOBCop);
    if (lblResCif) lblResCif.textContent = (window as any).fmt(totalCIFExpensesCOP);
    if (lblResArancel) lblResArancel.textContent = (window as any).fmt(arancelTotalCOP + gastosNacCOP);
    if (lblResLocales) lblResLocales.textContent = (window as any).fmt(transporteCOP + otrosGastosCOP);
    if (lblResTotalUsd) lblResTotalUsd.textContent = `Equiv. $ ${(window as any).fmtN(grandTotalCOP / (effectiveTrm || exchangeRate))} USD`;
    if (lblResTotal) lblResTotal.textContent = (window as any).fmt(grandTotalCOP);
    if (customsArancel) customsArancel.textContent = (window as any).fmt(arancelTotalCOP);

    // Subtotales en las cabeceras de cada pestaña de etapa
    const subFreight = document.getElementById('summary-subtotal-freight');
    const subInsurance = document.getElementById('summary-subtotal-insurance');
    const subCustoms = document.getElementById('summary-subtotal-customs');
    const subCarrier = document.getElementById('summary-subtotal-local_carrier');
    const subOther = document.getElementById('summary-subtotal-local_other');

    if (subFreight) subFreight.textContent = (window as any).fmt(freightCostCOP);
    if (subInsurance) subInsurance.textContent = (window as any).fmt(insuranceCostCOP);
    if (subCustoms) subCustoms.textContent = (window as any).fmt(arancelTotalCOP + gastosNacCOP);
    if (subCarrier) subCarrier.textContent = (window as any).fmt(transporteCOP);
    if (subOther) subOther.textContent = (window as any).fmt(otrosGastosCOP);

    // Matriz de Hoja de Costos Analítica en Vista General
    const summaryTbody = document.getElementById('imp-summary-tbody');
    if (summaryTbody) {
      const getTercerosSummary = (lines: any[]) => {
        if (!lines || !lines.length) return '<span class="text-slate-400">Sin asignar</span>';
        const assigned = lines.filter(l => l.supplier_id);
        if (!assigned.length) return '<span class="text-slate-400">Sin asignar</span>';
        if (lines.length === 1) {
          const suppObj = suppliers.find((s: any) => s.id === lines[0].supplier_id);
          const sName = suppObj ? suppObj.name : 'Tercero Seleccionado';
          return `<span class="font-semibold text-slate-800">${(window as any).esc(sName)}</span> ${lines[0].invoice_num ? `<span class="text-[10px] text-slate-500 font-mono">(${lines[0].invoice_num})</span>` : ''}`;
        }
        const uniqueSuppIds = Array.from(new Set(assigned.map(l => l.supplier_id)));
        return `<span class="font-semibold text-slate-800">${uniqueSuppIds.length} Proveedor(es)</span> · <span class="text-slate-500">${lines.length} Factura(s)</span>`;
      };

      const getStageBadge = (lines: any[]) => {
        if (!lines || !lines.length) return `<span class="badge badge-slate text-[11px]">⏳ Pendiente</span>`;
        const causedCount = lines.filter(l => l.tx_id).length;
        if (causedCount === lines.length && lines.length > 0) {
          return `<span class="badge badge-emerald text-[11px]"><i class="fas fa-check-circle mr-1"></i>Causado</span>`;
        }
        if (causedCount > 0) {
          return `<span class="badge badge-amber text-[11px]"><i class="fas fa-clock mr-1"></i>Parcial (${causedCount}/${lines.length})</span>`;
        }
        return `<span class="badge badge-slate text-[11px]">⏳ Pendiente</span>`;
      };

      const fobCaused = isConsolidated
        ? (localInvoices.length > 0 && localInvoices.every(i => i.tx_fob_id))
        : Boolean(imp?.tx_fob_id);
      const fobBadge = fobCaused
        ? `<span class="badge badge-emerald text-[11px]"><i class="fas fa-check-circle mr-1"></i>Causado</span>`
        : (isConsolidated && localInvoices.some(i => i.tx_fob_id)
            ? `<span class="badge badge-amber text-[11px]"><i class="fas fa-clock mr-1"></i>Parcial</span>`
            : `<span class="badge badge-slate text-[11px]">⏳ Pendiente</span>`);

      const fobTerceros = isConsolidated
        ? `<span class="font-semibold text-slate-800">${localInvoices.length} Factura(s) Consolidada(s)</span>`
        : (() => {
            const suppId = (document.getElementById('imp-supplier-id') as HTMLInputElement)?.value;
            const suppObj = suppliers.find((s: any) => s.id === suppId);
            const invNum = (document.getElementById('imp-supplier-invoice-num') as HTMLInputElement)?.value;
            return suppObj ? `<span class="font-semibold text-slate-800">${(window as any).esc(suppObj.name)}</span> ${invNum ? `<span class="text-[10px] text-slate-500 font-mono">(${invNum})</span>` : ''}` : '<span class="text-slate-400">Sin asignar</span>';
          })();

      const getConceptTxLines = (concept: string) => (linkedTxLines || []).filter((l: any) => l.import_concept === concept);

      const getInverseTerceros = (concept: string) => {
        const lines = getConceptTxLines(concept);
        if (!lines.length) return '<span class="text-slate-400">Sin asientos</span>';
        const distinctSupps = Array.from(new Set(lines.map((l: any) => l.expand?.third_party_id?.name || l.expand?.tx_id?.expand?.third_party_id?.name).filter(Boolean)));
        const distinctRefs = Array.from(new Set(lines.map((l: any) => l.import_invoice_ref || l.expand?.tx_id?.import_invoice_ref).filter(Boolean)));
        if (distinctSupps.length === 1) {
          return `<span class="font-semibold text-slate-800">${(window as any).esc(distinctSupps[0])}</span> ${distinctRefs.length ? `<span class="text-[10px] text-slate-500 font-mono">(${distinctRefs.join(', ')})</span>` : ''}`;
        }
        return `<span class="font-semibold text-slate-800">${distinctSupps.length} Tercero(s)</span> · <span class="text-slate-500">${lines.length} Movimiento(s)</span>`;
      };

      const getInverseBadge = (concept: string) => {
        const lines = getConceptTxLines(concept);
        if (lines.length > 0) {
          return `<span class="badge badge-emerald text-[11px]"><i class="fas fa-check-circle mr-1"></i>${lines.length} Asiento(s)</span>`;
        }
        return `<span class="badge badge-slate text-[11px]">⏳ Sin Asientos</span>`;
      };

      const rowsData = [
        {
          rubro: '1. FOB Mercancía',
          tab: 'fob',
          puc: '220505 - Proveedores del Exterior',
          terceros: isInverseMode ? getInverseTerceros('fob') : fobTerceros,
          divisa: isInverseMode ? `${(window as any).fmtN(displayFOBUSD)} ${currency}` : `${(window as any).fmtN(totalFOB)} ${currency}`,
          cop: totalFOBCop,
          badge: isInverseMode ? getInverseBadge('fob') : fobBadge,
          btnLabel: isInverseMode ? `Gestionar (${getConceptTxLines('fob').length})` : 'Gestionar FOB'
        },
        {
          rubro: '2. Flete Internacional',
          tab: 'freight',
          puc: '233545 - Costos y Gastos Fletes',
          terceros: isInverseMode ? getInverseTerceros('freight') : getTercerosSummary(freightLines),
          divisa: isInverseMode ? '—' : `${(window as any).fmtN(freightCost)} USD`,
          cop: freightCostCOP,
          badge: isInverseMode ? getInverseBadge('freight') : getStageBadge(freightLines),
          btnLabel: isInverseMode ? `Gestionar (${getConceptTxLines('freight').length})` : `Gestionar (${freightLines.length})`
        },
        {
          rubro: '3. Seguro Internacional',
          tab: 'insurance',
          puc: '233555 - Seguros y Pólizas Int.',
          terceros: isInverseMode ? getInverseTerceros('insurance') : getTercerosSummary(insuranceLines),
          divisa: isInverseMode ? '—' : `${(window as any).fmtN(insuranceCost)} USD`,
          cop: insuranceCostCOP,
          badge: isInverseMode ? getInverseBadge('insurance') : getStageBadge(insuranceLines),
          btnLabel: isInverseMode ? `Gestionar (${getConceptTxLines('insurance').length})` : `Gestionar (${insuranceLines.length})`
        },
        {
          rubro: '4. Aduana / DIAN (Arancel + SIA)',
          tab: 'customs',
          puc: '233595 - Agenciamiento Aduanero',
          terceros: isInverseMode ? getInverseTerceros('customs') : `Arancel Mercancías + ${getTercerosSummary(customsLines)}`,
          divisa: '—',
          cop: isInverseMode ? gastosNacCOP : (arancelTotalCOP + gastosNacCOP),
          badge: isInverseMode ? getInverseBadge('customs') : getStageBadge(customsLines),
          btnLabel: isInverseMode ? `Gestionar (${getConceptTxLines('customs').length})` : `Gestionar (${customsLines.length})`
        },
        {
          rubro: '5. Transporte Local Terrestre',
          tab: 'local_carrier',
          puc: '233545 - Acarreos y Fletes Locales',
          terceros: isInverseMode ? getInverseTerceros('local_carrier') : getTercerosSummary(localCarrierLines),
          divisa: '—',
          cop: transporteCOP,
          badge: isInverseMode ? getInverseBadge('local_carrier') : getStageBadge(localCarrierLines),
          btnLabel: isInverseMode ? `Gestionar (${getConceptTxLines('local_carrier').length})` : `Gestionar (${localCarrierLines.length})`
        },
        {
          rubro: '6. Otros Gastos Portuarios',
          tab: 'local_other',
          puc: '233595 - Gastos Portuarios y Bodega',
          terceros: isInverseMode ? getInverseTerceros('local_other') : getTercerosSummary(localOtherLines),
          divisa: '—',
          cop: otrosGastosCOP,
          badge: isInverseMode ? getInverseBadge('local_other') : getStageBadge(localOtherLines),
          btnLabel: isInverseMode ? `Gestionar (${getConceptTxLines('local_other').length})` : `Gestionar (${localOtherLines.length})`
        },
      ];

      summaryTbody.innerHTML = rowsData.map(r => {
        const pct = grandTotalCOP > 0 ? ((r.cop / grandTotalCOP) * 100).toFixed(1) : '0.0';
        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 px-3 font-bold text-slate-800">${r.rubro}</td>
            <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">${r.puc}</td>
            <td class="py-2.5 px-3 text-xs">${r.terceros}</td>
            <td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-600">${r.divisa}</td>
            <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${(window as any).fmt(r.cop)}</td>
            <td class="py-2.5 px-3 text-right font-mono text-xs font-semibold text-blue-700">${pct}%</td>
            <td class="py-2.5 px-3 text-center">${r.badge}</td>
            <td class="py-2.5 px-3 text-center">
              <button type="button" class="btn btn-outline btn-xs text-blue-600 hover:bg-blue-50 py-1 px-2.5" onclick="window.switchImpStageTab('${r.tab}')">
                ${r.btnLabel} <i class="fas fa-arrow-right ml-1 text-[9px]"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('') + `
        <tr class="bg-slate-100/70 font-extrabold border-t-2 border-slate-300">
          <td class="py-3 px-3 text-slate-900" colspan="3">
            <div class="flex items-center gap-2">
              <i class="fas fa-calculator text-blue-600"></i>
              <span>TOTAL COSTO CAPITALIZABLE (INVENTARIO EN BODEGA)</span>
            </div>
          </td>
          <td class="py-3 px-3 text-right font-mono text-slate-600">Equiv. ${(window as any).fmtN(grandTotalCOP / exchangeRate)} USD</td>
          <td class="py-3 px-3 text-right font-mono text-blue-950 text-sm">${(window as any).fmt(grandTotalCOP)}</td>
          <td class="py-3 px-3 text-right font-mono text-blue-700">100.0%</td>
          <td class="py-3 px-3 text-center" colspan="2">
            <span class="text-xs text-slate-500 font-semibold">${rowsData.filter(r => r.badge.includes('Causado')).length} de 6 causados</span>
          </td>
        </tr>
      `;
    }

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
    const chk = document.getElementById('imp-is-consolidated') as HTMLInputElement;
    if (chk && chk.checked !== isConsolidated) {
      chk.checked = isConsolidated;
    }
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

  (window as any).impUpdateInvoiceDistPct = function(invId: string, val: string) {
    const inv = localInvoices.find(i => i.id === invId);
    if (inv) {
      inv.cost_distribution_pct = parseFloat(val) || 0;
    }
    (window as any).impUpdateInvoiceDistBadge();
  };

  (window as any).impUpdateInvoiceDistBadge = function() {
    const sumPct = localInvoices.reduce((s: number, i: any) => s + (Number(i.cost_distribution_pct) || 0), 0);
    const rounded = Math.round(sumPct * 100) / 100;
    const lbl = document.getElementById('lbl-inv-total-dist-pct');
    const wrap = document.getElementById('badge-inv-dist-wrap');
    if (lbl) lbl.textContent = `${rounded}%`;
    if (wrap) {
      if (Math.abs(rounded - 100) < 0.01) {
        wrap.style.background = '#ECFDF5';
        wrap.style.borderColor = '#A7F3D0';
        wrap.style.color = '#065F46';
      } else if (rounded > 0) {
        wrap.style.background = '#FFFBEB';
        wrap.style.borderColor = '#FDE68A';
        wrap.style.color = '#92400E';
      } else {
        wrap.style.background = '#F8FAFC';
        wrap.style.borderColor = '#E2E8F0';
        wrap.style.color = '#64748B';
      }
    }
  };

  (window as any).impSuggestInvoiceDistFob = function() {
    const totalFob = localInvoices.reduce((s: number, i: any) => s + (Number(i._computed_fob ?? i.fob_amount) || 0), 0);
    if (totalFob <= 0) {
      (window as any).showToast('No hay montos FOB en las facturas para sugerir distribución.', 'warning');
      return;
    }
    localInvoices.forEach(inv => {
      const invFob = Number(inv._computed_fob ?? inv.fob_amount) || 0;
      inv.cost_distribution_pct = Math.round((invFob / totalFob) * 10000) / 100;
    });
    (window as any).impRenderInvoicesTable();
    (window as any).showToast('Distribución porcentual FOB sugerida. Puede ajustarla manualmente.', 'info');
  };

  (window as any).impRenderInvoicesTable = function() {
    const tbody = document.getElementById('imp-invoices-tbody');
    const stageTbody = document.getElementById('imp-fob-stage-invoices-body');
    const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
    const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '4000');

    if (tbody) {
      if (!localInvoices.length) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-gray-400">No hay facturas comerciales agregadas aún. Haz clic en <strong>Agregar Factura Comercial</strong> arriba.</td></tr>`;
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
              <td class="py-2.5 px-2 text-right bg-amber-50/40 border-x border-amber-200" style="width:130px">
                <div class="flex items-center justify-end gap-1">
                  <input type="number" class="form-input text-xs text-right font-mono font-bold text-amber-950 py-1 px-1.5 w-16 line-inv-dist-field rounded border-amber-300 bg-white focus:ring-1 focus:ring-amber-500 shadow-sm"
                         min="0" max="100" step="0.01" data-invid="${inv.id}"
                         value="${inv.cost_distribution_pct !== undefined && inv.cost_distribution_pct !== null ? inv.cost_distribution_pct : ''}"
                         placeholder="0"
                         oninput="window.impUpdateInvoiceDistPct('${inv.id}', this.value)">
                  <span class="font-bold text-slate-500 text-[11px]">%</span>
                </div>
              </td>
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

      (window as any).impUpdateInvoiceDistBadge();
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
            ${renderTerceroDynamicPicker({
              id: 'inv-modal-supplier',
              value: inv?.supplier_id || inv?.third_party_id || '',
              placeholder: 'Buscar proveedor por NIT o nombre...'
            })}
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

          <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <div class="flex items-center justify-between">
              <label class="form-label font-bold text-amber-950 mb-0 flex items-center gap-1.5">
                <i class="fas fa-sliders text-amber-600"></i> % Dist. Costo al Cierre
              </label>
              <div class="flex items-center gap-1">
                <input type="number" id="inv-modal-cost-dist-pct" class="form-input text-xs text-right font-mono font-bold text-amber-950 w-20 py-1 px-2 border-amber-300 bg-white" min="0" max="100" step="0.01" value="${inv?.cost_distribution_pct !== undefined && inv?.cost_distribution_pct !== null ? inv.cost_distribution_pct : ''}" placeholder="0.00">
                <span class="font-bold text-amber-900 text-xs">%</span>
              </div>
            </div>
            <p class="text-[10px] text-amber-800 mt-1">Porcentaje manual al tanteo para calcular el costo individual por producto exclusivamente en el momento del cierre de la importación.</p>
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

    initTerceroDynamicPicker({
      id: 'inv-modal-supplier',
      value: inv?.supplier_id || inv?.third_party_id || ''
    });

    overlay.querySelector('#inv-modal-close')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#inv-modal-cancel')?.addEventListener('click', () => overlay.remove());

    overlay.querySelector('#inv-modal-save')?.addEventListener('click', () => {
      const suppId = (document.getElementById('inv-modal-supplier') as HTMLInputElement)?.value;
      const invNum = (document.getElementById('inv-modal-number') as HTMLInputElement)?.value.trim();
      const invDate = (document.getElementById('inv-modal-date') as HTMLInputElement)?.value;
      const dueDate = (document.getElementById('inv-modal-due-date') as HTMLInputElement)?.value;
      const exRate = parseFloat((document.getElementById('inv-modal-exchange-rate') as HTMLInputElement)?.value) || 1;
      const distPct = parseFloat((document.getElementById('inv-modal-cost-dist-pct') as HTMLInputElement)?.value) || 0;
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
        inv.cost_distribution_pct = distPct;
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
          cost_distribution_pct: distPct,
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

  // Inicializar estado de modo consolidado antes de montar líneas
  (window as any).impToggleConsolidatedMode(isImportConsolidated);

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
  
  // Re-sincronizar modo consolidado y tabla de facturas tras montar líneas
  (window as any).impToggleConsolidatedMode(isImportConsolidated);
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
      const incoterm = (document.getElementById('imp-incoterm') as HTMLSelectElement)?.value || '';
      const currency = (document.getElementById('imp-currency') as HTMLSelectElement)?.value || 'USD';
      const exchangeRate = parseFloat((document.getElementById('imp-exchange-rate') as HTMLInputElement)?.value || '1');
      const blAwb = (document.getElementById('imp-bl-awb') as HTMLInputElement)?.value.trim() || '';
      const transportType = (document.getElementById('imp-transport-type') as HTMLSelectElement)?.value || '';
      const estimatedArrival = (document.getElementById('imp-estimated-arrival') as HTMLInputElement)?.value || '';
      const notes = (document.getElementById('imp-notes') as HTMLInputElement)?.value.trim() || '';

      // Gastos y proveedores derivados de localStageExpenses
      const freightLines = localStageExpenses['freight'] || [];
      const insuranceLines = localStageExpenses['insurance'] || [];
      const customsLines = localStageExpenses['customs'] || [];
      const localCarrierLines = localStageExpenses['local_carrier'] || [];
      const localOtherLines = localStageExpenses['local_other'] || [];

      const freightCost = freightLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const insuranceCost = insuranceLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const gastosNacionalizacion = customsLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const transporteNacional = localCarrierLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const otrosGastos = localOtherLines.reduce((s: number, l: any) => s + (l.amount || 0), 0);

      // Proveedores de Etapas (primer tercero para compatibilidad con vistas legacy)
      const freightSupplierId = freightLines[0]?.supplier_id || null;
      const insuranceSupplierId = insuranceLines[0]?.supplier_id || null;
      const customsSupplierId = customsLines[0]?.supplier_id || null;
      const localCarrierId = localCarrierLines[0]?.supplier_id || null;
      const localOtherSupplierId = localOtherLines[0]?.supplier_id || null;

      // Facturas de Etapas
      const supplierInvoiceNum = (document.getElementById('imp-supplier-invoice-num') as HTMLInputElement)?.value.trim() || '';
      const freightInvoiceNum = freightLines.map((l: any) => l.invoice_num).filter(Boolean).join(', ') || '';
      const insuranceInvoiceNum = insuranceLines.map((l: any) => l.invoice_num).filter(Boolean).join(', ') || '';
      const customsInvoiceNum = customsLines.map((l: any) => l.invoice_num).filter(Boolean).join(', ') || '';
      const localCarrierInvoiceNum = localCarrierLines.map((l: any) => l.invoice_num).filter(Boolean).join(', ') || '';
      const localOtherInvoiceNum = localOtherLines.map((l: any) => l.invoice_num).filter(Boolean).join(', ') || '';

      // Cumplimiento y prorrateo
      const vuceRegistroNum = (document.getElementById('imp-vuce-registro') as HTMLInputElement)?.value.trim() || '';
      const modalidadImportacion = (document.getElementById('imp-modalidad-importacion') as HTMLSelectElement)?.value || '';
      const canalInspeccion = (document.getElementById('imp-canal-inspeccion') as HTMLSelectElement)?.value || '';
      const prorationMethod = (document.getElementById('imp-proration-method') as HTMLSelectElement)?.value || 'FOB_VALUE';
      const dianDeclaracionNum = (document.getElementById('imp-dian-declaracion') as HTMLInputElement)?.value.trim() || '';
      const dianDeclaracionDate = (document.getElementById('imp-dian-declaracion-date') as HTMLInputElement)?.value || '';
      const dianLevanteDate = (document.getElementById('imp-dian-levante-date') as HTMLInputElement)?.value || '';
      const dianTrm = parseFloat((document.getElementById('imp-dian-trm') as HTMLInputElement)?.value) || 0;

      if (!isConsolidated && !supplierId) throw new Error('Por favor selecciona un proveedor internacional.');
      if (isConsolidated && !localInvoices.length) throw new Error('En modo consolidado debes registrar al menos una factura comercial de proveedor.');
      if (exchangeRate <= 0) throw new Error('La tasa de cambio debe ser un número positivo.');

      // TRM específicas por cada rubro
      const freightTrm = freightLines[0]?.trm || exchangeRate;
      const insuranceTrm = insuranceLines[0]?.trm || exchangeRate;
      const customsTrm = customsLines[0]?.trm || exchangeRate;
      const localCarrierTrm = localCarrierLines[0]?.trm || 1;
      const localOtherTrm = localOtherLines[0]?.trm || 1;

      // Totales con TRM individual o desde movimientos contables en modo inverso
      let totalCIFExpensesCOP = freightLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0) +
                                  insuranceLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
      let totalLocalExpensesCOP = customsLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0) +
                                    localCarrierLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0) +
                                    localOtherLines.reduce((s: number, l: any) => s + ((l.amount || 0) * (l.trm || 1)), 0);
      let totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;

      if (isInverseMode) {
        const getNetConceptAmt = (c: string) => (linkedTxLines || [])
          .filter((l: any) => l.import_concept === c)
          .reduce((sum: number, l: any) => sum + (Number(l.debit || 0) - Number(l.credit || 0)), 0);
        
        const invFreightCOP = getNetConceptAmt('freight');
        const invInsuranceCOP = getNetConceptAmt('insurance');
        const invCustomsCOP = getNetConceptAmt('customs');
        const invCarrierCOP = getNetConceptAmt('local_carrier');
        const invOtherCOP = getNetConceptAmt('local_other');
        
        totalCIFExpensesCOP = invFreightCOP + invInsuranceCOP;
        totalLocalExpensesCOP = invCustomsCOP + invCarrierCOP + invOtherCOP;
        totalExpensesToProrateCOP = totalCIFExpensesCOP + totalLocalExpensesCOP;
      }

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
            if (status === 'recibido' || status === 'nacionalizacion') {
              throw new Error(`El producto "${prod?.name || 'Físico'}" (línea ${i + 1}) requiere peso y dimensiones mayores a cero para finalizar o nacionalizar. Puedes ajustarlos con el botón "Pesos/Medidas".`);
            }
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
      const inverseFobCOP = isInverseMode 
        ? (linkedTxLines || []).filter((l: any) => l.import_concept === 'fob').reduce((s: number, l: any) => s + (Number(l.debit || 0) - Number(l.credit || 0)), 0)
        : 0;
      const totalFOBCop = (isInverseMode && inverseFobCOP > 0) ? inverseFobCOP : (totalFOB * exchangeRate);
      const totalWeight = lines.reduce((s, l) => s + (l.peso_bruto_total || 0), 0);
      const fobTx = isInverseMode ? (linkedTxLines || []).find((l: any) => l.import_concept === 'fob') : null;
      const effectiveTrm = Number(fobTx?.import_trm) || exchangeRate || 1;

      // En Modo Inverso, repartir el FOB contable proporcionalmente entre las referencias
      if (isInverseMode && inverseFobCOP > 0) {
        if (lines.length === 1) {
          lines[0].lineFOBCop = inverseFobCOP;
          if (lines[0].qty > 0) {
            lines[0].fob_price = Math.round(((inverseFobCOP / lines[0].qty) / effectiveTrm) * 100) / 100;
          }
        } else {
          let totalMetric = 0;
          if (prorationMethod === 'GROSS_WEIGHT') {
            totalMetric = totalWeight;
          } else if (prorationMethod === 'CUBIC_VOLUME') {
            totalMetric = totalVolume;
          } else {
            totalMetric = lines.reduce((s, l) => s + (((l.qty * l.fob_price) > 0) ? (l.qty * l.fob_price) : (l.qty > 0 ? l.qty : 1)), 0);
          }

          lines.forEach(l => {
            let m = 0;
            if (prorationMethod === 'GROSS_WEIGHT') m = l.peso_bruto_total || 0;
            else if (prorationMethod === 'CUBIC_VOLUME') m = l.cubic_meters_total || 0;
            else m = ((l.qty * l.fob_price) > 0) ? (l.qty * l.fob_price) : (l.qty > 0 ? l.qty : 1);

            const ratio = totalMetric > 0 ? (m / totalMetric) : (1 / lines.length);
            l.lineFOBCop = ratio * inverseFobCOP;
            if (l.qty > 0) {
              l.fob_price = Math.round(((l.lineFOBCop / l.qty) / effectiveTrm) * 100) / 100;
            }
          });
        }
      }

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
        stage_expenses: JSON.stringify(localStageExpenses),

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

      // 1. Guardar facturas comerciales de proveedores internacionales
      // Capturar cualquier valor modificado en los inputs de % dist en la tabla antes de guardar
      document.querySelectorAll('.line-inv-dist-field').forEach((el: any) => {
        const invId = el.getAttribute('data-invid');
        const inv = localInvoices.find(i => i.id === invId);
        if (inv) {
          inv.cost_distribution_pct = parseFloat(el.value) || 0;
        }
      });

      if (localInvoices.length) {
        const savedLines = await (window as any).API.getImportLines(finalImportId);

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
            cost_distribution_pct: Number(inv.cost_distribution_pct) || 0,
            notes: inv.notes || '',
          };

          if (inv.id && !inv.id.startsWith('temp-')) {
            await (window as any).API.updateImportInvoice(inv.id, invData, inv._newFile);
          } else {
            const oldTempId = inv.id;
            const createdInv = await (window as any).API.createImportInvoice(finalImportId, invData, inv._newFile);
            inv.id = createdInv.id;

            // Relacionar líneas temporales con la factura recién creada de forma determinista por posición (line_order)
            for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
              const memLine = lines[lineIdx];
              if (memLine._temp_invoice_id === oldTempId) {
                const sl = savedLines.find((s: any) => s.line_order === (lineIdx + 1)) || savedLines[lineIdx];
                if (sl) {
                  await (window as any).pb.update('import_lines', sl.id, {
                    import_invoice_id: createdInv.id,
                    supplier_id: invData.supplier_id
                  });
                }
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
        const matchingSavedLine = savedLines.find((sl: any) => sl.product_id === l.product_id);
        const lineIdToLink = matchingSavedLine?.id || l.id || null;
        const pcs = localPalletConfigs[rowIdx] || (l.id ? localPalletConfigs[l.id] : null) || (lineIdToLink ? localPalletConfigs[lineIdToLink] : null) || (l.product_id ? localPalletConfigs[l.product_id] : null) || [];

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
                    <th class="py-2 px-3 text-right bg-amber-50/70 border-x border-amber-200" style="width:110px">% Dist. Costo</th>
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
                        <td class="py-2 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/30 border-x border-amber-200">
                          ${inv.cost_distribution_pct ? `${inv.cost_distribution_pct}%` : '—'}
                        </td>
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
                ${imp.reopened_count > 0 ? `
                  <div class="flex justify-between items-center text-[11px] text-amber-800 pt-1">
                    <span>Reaperturas:</span>
                    <span class="badge badge-amber text-[10px] font-bold" title="${(window as any).esc(imp.reopened_reason || '')}">
                      <i class="fas fa-rotate-left mr-1"></i> ${imp.reopened_count} vez(ces)
                    </span>
                  </div>
                ` : ''}
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
                      <td class="text-right font-semibold">
                        <div>${(window as any).fmtN(l.qty)}</div>
                        <div class="text-[10px] text-slate-500 font-normal">${(window as any).esc(formatUnitOfMeasure(prod?.unit || l.unit))}</div>
                      </td>
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
      <button class="btn btn-secondary border-blue-600 text-blue-800 hover:bg-blue-50 font-bold" onclick="window.openImportExecutiveReport('${imp.id}')">
        <i class="fas fa-file-contract mr-1.5 text-blue-600"></i> Dossier Oficial DIAN / Gerencia
      </button>
      ${imp.status !== 'recibido' && imp.status !== 'anulado' && (window as any).can('canWrite') ? `
        <button class="btn btn-secondary" onclick="closeModal(); window.editImport('${imp.id}')"><i class="fas fa-pen"></i> Editar</button>
        <button class="btn btn-primary" onclick="closeModal(); window.confirmFinalizarImportacion('${imp.id}')"><i class="fas fa-check-double"></i> Recibir e Ingresar a Bodega</button>
      ` : ''}
      ${imp.status === 'recibido' && (window as any).can('canWrite') ? `
        <button class="btn btn-outline border-amber-400 text-amber-800 hover:bg-amber-50" onclick="closeModal(); window.openReopenImportModal('${imp.id}')">
          <i class="fas fa-lock-open text-amber-600 mr-1.5"></i> Reabrir Importación
        </button>
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
    const [imp, lines, importInvoices] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id' }),
      (window as any).API.getImportLines(importId),
      (window as any).API.getImportInvoices(importId).catch(() => []),
    ]);

    if (imp.status === 'recibido') {
      throw new Error('Esta importación ya ha sido finalizada y capitalizada.');
    }

    const [warehouses, txTypes] = await Promise.all([
      (window as any).API.getWarehouses(true),
      (window as any).API.getTxTypes(),
    ]);

    const defaultTxType = (txTypes || []).find((t: any) => t.prefix === 'IMP' || t.code === 'BL' || (t.name || '').toLowerCase().includes('importac'))
      || (txTypes || []).find((t: any) => t.prefix === 'FC')
      || (txTypes || [])[0];
    const defaultTxTypeId = defaultTxType?.id || '';

    let initialTxNumber = '';
    if (defaultTxTypeId) {
      try {
        initialTxNumber = await (window as any).API.previewNextTxConsecutive(defaultTxTypeId);
      } catch (e) {
        console.warn('Error previewing consecutive:', e);
      }
    }
    if (!initialTxNumber && defaultTxType) {
      initialTxNumber = `${defaultTxType.prefix ? defaultTxType.prefix + '-' : ''}${String((defaultTxType.consecutive || 0) + 1).padStart(6, '0')}`;
    }

    const isConsolidatedEffective = Boolean(imp.is_consolidated) || ((importInvoices || []).length > 0);
    const invsWithPct = (importInvoices || []).filter((iv: any) => Number(iv.cost_distribution_pct) > 0);
    const hasDistPct = isConsolidatedEffective && (importInvoices || []).length > 0;
    const initialTotalDistPct = (importInvoices || []).reduce((s: number, iv: any) => s + (Number(iv.cost_distribution_pct) || 0), 0);

    const formHtml = `
      <div class="space-y-4 text-sm" style="color:#374151">
        <div class="p-4 rounded-xl" style="background:#FFFBEB;border:1px solid #FDE68A;color:#92400E">
          <p class="font-bold"><i class="fas fa-triangle-exclamation mr-1"></i>¡Atención!</p>
          <p class="text-xs">Estás por finalizar y capitalizar la importación <strong>${imp.number}</strong>. Esta acción creará automáticamente el comprobante contable de compra con los costos finales en pesos (COP), trasladará el inventario a la bodega seleccionada y actualizará el costo promedio en el catálogo de productos.</p>
        </div>

        ${hasDistPct ? `
          <div class="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <i class="fas fa-sliders text-amber-600"></i> Distribución Estricta de Costos por Proveedor:
              </span>
              <span id="cap-pct-badge" class="badge ${Math.abs(initialTotalDistPct - 100) < 0.01 ? 'badge-emerald' : 'badge-amber'} text-[10px] font-bold">
                ${Math.abs(initialTotalDistPct - 100) < 0.01 ? 'Balance 100% ✓' : `Suma: ${initialTotalDistPct}%`}
              </span>
            </div>
            <p class="text-[11px] text-amber-900 leading-snug">
              El porcentaje asignado a cada proveedor determina de manera <strong>estricta</strong> el costo individual de entrada a bodega para sus productos, prevaleciendo sobre el prorrateo general preliminar:
            </p>
            <div class="overflow-x-auto bg-white rounded-lg border border-amber-200 shadow-sm">
              <table class="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr class="bg-amber-100/70 text-amber-950 font-bold border-b border-amber-200">
                    <th class="p-2">Proveedor</th>
                    <th class="p-2">Factura Nro.</th>
                    <th class="p-2 text-right w-28">% Dist. Costo</th>
                    <th class="p-2 text-right">Costo Asignado (COP)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-amber-100 font-mono">
                  ${(importInvoices || []).map((iv: any) => {
                    const supp = iv.expand?.supplier_id || iv.expand?.third_party_id;
                    const sName = supp ? supp.name : 'Proveedor Exterior';
                    const curPct = Number(iv.cost_distribution_pct) || 0;
                    const ratio = initialTotalDistPct > 0 ? (curPct / (initialTotalDistPct === 100 ? 100 : initialTotalDistPct)) : 0;
                    const costAssigned = imp.total * ratio;
                    return `
                      <tr>
                        <td class="p-2 font-sans font-medium text-slate-800">${(window as any).esc(sName)}</td>
                        <td class="p-2 font-bold text-blue-900">${(window as any).esc(iv.invoice_number)}</td>
                        <td class="p-2 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <input type="number" step="0.01" min="0" max="100" class="cap-inv-dist-input form-input text-right font-mono font-bold text-amber-950 w-20 py-0.5 px-1.5 h-7 border-amber-300 bg-white" data-invid="${iv.id}" value="${curPct}">
                            <span class="text-xs font-bold text-slate-500">%</span>
                          </div>
                        </td>
                        <td class="p-2 text-right font-bold text-slate-900" id="cap-inv-cost-${iv.id}">${(window as any).fmt(costAssigned)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- Desplegable interactivo: Comparativa de costo real por producto vs. prorrateo original -->
            <details class="bg-white/80 rounded-lg border border-amber-200/90 p-2 text-xs">
              <summary class="cursor-pointer font-bold text-amber-950 select-none flex items-center justify-between">
                <span><i class="fas fa-boxes-packing text-amber-600 mr-1.5"></i> Desglose de Costo Real por Producto (Costo Original vs. Costo Final con % Proveedor)</span>
                <span class="text-[10px] text-amber-700 underline font-normal">Ver / Reasignar líneas</span>
              </summary>
              <div class="overflow-x-auto mt-2.5">
                <table class="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[9px]">
                      <th class="p-1.5">Producto</th>
                      <th class="p-1.5">Factura / Proveedor</th>
                      <th class="p-1.5 text-right">Cantidad</th>
                      <th class="p-1.5 text-right">Costo Orig. COP</th>
                      <th class="p-1.5 text-right text-blue-900 font-extrabold">Costo Real % COP</th>
                      <th class="p-1.5 text-center">Variación</th>
                    </tr>
                  </thead>
                  <tbody id="cap-lines-preview-tbody" class="divide-y divide-slate-100">
                    <!-- Filas inyectadas dinámicamente por capRecalcPreview -->
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        ` : ''}

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
            ${txTypes.map((t: any) => `<option value="${t.id}" ${t.id === defaultTxTypeId ? 'selected' : ''}>${(window as any).esc(t.prefix || t.code)} — ${(window as any).esc(t.name)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Número de Comprobante Factura <span style="color:#EF4444">*</span></label>
          <input type="text" id="cap-tx-number" class="form-input font-mono font-bold text-blue-950" placeholder="Ej: IMP-00000142" value="${initialTxNumber || `FC-IMP-${imp.number.split('-').pop()}`}">
          <p class="text-[11px] text-gray-500 mt-1">Generado automáticamente según el consecutivo configurado en la base de datos.</p>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-cap"><i class="fas fa-check"></i> Finalizar y Capitalizar</button>
    `;

    (window as any).openModal('Capitalización de Importación', formHtml, footer, false);

    // Función reactiva para recalcular en vivo el desglose y comparativa de costos por producto
    const capRecalcPreview = () => {
      const invInputs = document.querySelectorAll('.cap-inv-dist-input');
      const currentPcts: Record<string, number> = {};
      let sumPct = 0;

      invInputs.forEach((inp: any) => {
        const invId = inp.getAttribute('data-invid');
        const v = parseFloat(inp.value) || 0;
        if (invId) currentPcts[invId] = v;
        sumPct += v;
      });

      // Actualizar badge de suma %
      const badge = document.getElementById('cap-pct-badge');
      if (badge) {
        if (Math.abs(sumPct - 100) < 0.01) {
          badge.className = 'badge badge-emerald text-[10px] font-bold';
          badge.textContent = 'Balance 100% ✓';
        } else {
          badge.className = 'badge badge-amber text-[10px] font-bold';
          badge.textContent = `Suma: ${Math.round(sumPct * 100) / 100}% (Recomendado 100%)`;
        }
      }

      // Actualizar columna Costo Asignado en la tabla de facturas
      (importInvoices || []).forEach((iv: any) => {
        const p = currentPcts[iv.id] || 0;
        const normRatio = sumPct > 0 ? (p / sumPct) : 0;
        const costVal = imp.total * normRatio;
        const lbl = document.getElementById(`cap-inv-cost-${iv.id}`);
        if (lbl) lbl.textContent = (window as any).fmt(costVal);
      });

      // Recalcular costo real por línea de producto y renderizar comparativa
      const tbody = document.getElementById('cap-lines-preview-tbody');
      if (!tbody) return;

      const totalImportCOP = imp.total || 0;
      const lineAssignments: Record<string, string> = {};
      document.querySelectorAll('.cap-line-inv-select').forEach((sel: any) => {
        const lid = sel.getAttribute('data-lineid');
        if (lid) lineAssignments[lid] = sel.value;
      });

      // Distribuir costo de cada factura entre sus líneas correspondientes
      const calculatedLineUnitCosts: Record<string, { unitCost: number; totalCost: number; origCost: number }> = {};

      (importInvoices || []).forEach((iv: any) => {
        const p = currentPcts[iv.id] || 0;
        const normRatio = sumPct > 0 ? (p / sumPct) : 0;
        const pool = totalImportCOP * normRatio;

        const invLines = lines.filter((l: any) => {
          const assignedInvId = lineAssignments[l.id] || l.import_invoice_id;
          return assignedInvId === iv.id || (!assignedInvId && l.supplier_id && (l.supplier_id === iv.supplier_id || l.supplier_id === iv.third_party_id));
        });

        if (invLines.length > 0) {
          let metricTotal = 0;
          if (imp.proration_method === 'GROSS_WEIGHT') {
            metricTotal = invLines.reduce((s: number, l: any) => s + (Number(l.peso_bruto_total) || 0), 0);
          } else if (imp.proration_method === 'CUBIC_VOLUME') {
            metricTotal = invLines.reduce((s: number, l: any) => s + (Number(l.cubic_meters_total) || 0), 0);
          }
          if (metricTotal <= 0) {
            metricTotal = invLines.reduce((s: number, l: any) => s + ((Number(l.qty) || 0) * (Number(l.fob_price) || 0)), 0);
          }

          invLines.forEach((l: any) => {
            let m = 0;
            if (imp.proration_method === 'GROSS_WEIGHT') m = Number(l.peso_bruto_total) || 0;
            else if (imp.proration_method === 'CUBIC_VOLUME') m = Number(l.cubic_meters_total) || 0;
            if (m <= 0) m = (Number(l.qty) || 0) * (Number(l.fob_price) || 0);

            const ratio = metricTotal > 0 ? (m / metricTotal) : (1 / invLines.length);
            const lineTot = Math.round(pool * ratio);
            const lineUnit = Number(l.qty) > 0 ? Math.round((lineTot / Number(l.qty)) * 100) / 100 : 0;

            calculatedLineUnitCosts[l.id] = {
              unitCost: lineUnit,
              totalCost: lineTot,
              origCost: Number(l.unit_cost_cop) || 0
            };
          });
        }
      });

      tbody.innerHTML = lines.map((l: any) => {
        const prod = l.expand?.product_id;
        const assignedInvId = lineAssignments[l.id] || l.import_invoice_id || '';
        const calc = calculatedLineUnitCosts[l.id] || {
          unitCost: Number(l.unit_cost_cop) || 0,
          totalCost: Number(l.total_cop) || 0,
          origCost: Number(l.unit_cost_cop) || 0
        };

        const orig = calc.origCost;
        const real = calc.unitCost;
        const diffPct = orig > 0 ? (((real - orig) / orig) * 100) : 0;
        const diffBadge = Math.abs(diffPct) < 0.01 
          ? `<span class="badge text-[9px] py-0 px-1 bg-slate-100 text-slate-600">0%</span>`
          : diffPct > 0 
            ? `<span class="badge text-[9px] py-0 px-1 font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">+${diffPct.toFixed(1)}%</span>`
            : `<span class="badge text-[9px] py-0 px-1 font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">${diffPct.toFixed(1)}%</span>`;

        return `
          <tr class="hover:bg-slate-50">
            <td class="p-1.5 font-medium text-slate-900">
              ${prod ? `<strong>${(window as any).esc(prod.code)}</strong> - ${(window as any).esc(prod.name)}` : 'Producto'}
            </td>
            <td class="p-1.5">
              <select class="cap-line-inv-select form-input text-[10px] py-0.5 px-1 h-6 bg-white border-slate-300" data-lineid="${l.id}">
                ${(importInvoices || []).map((iv: any) => `
                  <option value="${iv.id}" ${iv.id === assignedInvId ? 'selected' : ''}>
                    ${(window as any).esc(iv.invoice_number)} (${(window as any).esc(iv.expand?.supplier_id?.name || 'Prov')})
                  </option>
                `).join('')}
              </select>
            </td>
            <td class="p-1.5 text-right font-mono font-bold text-slate-800">${(window as any).fmtN(l.qty)}</td>
            <td class="p-1.5 text-right font-mono text-slate-500">${(window as any).fmt(orig)}</td>
            <td class="p-1.5 text-right font-mono font-extrabold text-blue-900">${(window as any).fmt(real)}</td>
            <td class="p-1.5 text-center">${diffBadge}</td>
          </tr>
        `;
      }).join('');

      // Reconectar listener en los selects de reasignación
      tbody.querySelectorAll('.cap-line-inv-select').forEach((sel: any) => {
        sel.addEventListener('change', () => capRecalcPreview());
      });
    };

    // Conectar eventos en los inputs de porcentaje
    document.querySelectorAll('.cap-inv-dist-input').forEach((inp: any) => {
      inp.addEventListener('input', () => capRecalcPreview());
    });

    // Renderizar preview inicial si hay facturas
    if (hasDistPct) {
      setTimeout(() => capRecalcPreview(), 50);
    }

    // Conectar actualización reactiva del consecutivo al cambiar el tipo de comprobante
    const txTypeSelect = document.getElementById('cap-tx-type-id') as HTMLSelectElement;
    const txNumInput = document.getElementById('cap-tx-number') as HTMLInputElement;
    if (txTypeSelect && txNumInput) {
      txTypeSelect.addEventListener('change', async () => {
        const selId = txTypeSelect.value;
        if (!selId) return;
        try {
          const nextConsecutive = await (window as any).API.previewNextTxConsecutive(selId);
          if (nextConsecutive) {
            txNumInput.value = nextConsecutive;
          }
        } catch (err) {
          console.warn('Error al obtener siguiente consecutivo contable:', err);
        }
      });
    }

    document.getElementById('btn-confirm-cap')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-confirm-cap') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Capitalizando con % Proveedor...';
      }

      try {
        const whId = (document.getElementById('cap-warehouse-id') as HTMLSelectElement)?.value;
        const txTypeId = (document.getElementById('cap-tx-type-id') as HTMLSelectElement)?.value;
        const txNumber = (document.getElementById('cap-tx-number') as HTMLInputElement)?.value.trim();

        if (!whId) throw new Error('Por favor selecciona la bodega de destino de los productos.');
        if (!txTypeId) throw new Error('Por favor selecciona el tipo de comprobante contable.');
        if (!txNumber) throw new Error('Por favor ingresa la numeración del comprobante de compra.');

        // 1. Recopilar porcentajes confirmados de cada proveedor
        const customInvoicePcts: Record<string, number> = {};
        document.querySelectorAll('.cap-inv-dist-input').forEach((inp: any) => {
          const invId = inp.getAttribute('data-invid');
          const val = parseFloat(inp.value) || 0;
          if (invId) customInvoicePcts[invId] = val;
        });

        // 2. Recopilar asignación de líneas a facturas
        const lineInvoiceAssignments: Record<string, string> = {};
        document.querySelectorAll('.cap-line-inv-select').forEach((sel: any) => {
          const lid = sel.getAttribute('data-lineid');
          if (lid && sel.value) lineInvoiceAssignments[lid] = sel.value;
        });

        // 3. Ejecutar la capitalización aplicando estrictamente los porcentajes y liberando reservas
        const capResult = await SupplyChainOrchestrator.finalizeImportAndReleaseReservations(
          importId,
          whId,
          txTypeId,
          txNumber,
          customInvoicePcts,
          lineInvoiceAssignments
        );

        const resMsg = capResult.releasedReservationsCount > 0 ? ` Se liberaron ${capResult.releasedReservationsCount} reservas para despacho inmediato.` : '';
        (window as any).showToast(`Importación finalizada con éxito. Costos calculados y cargados a inventario según % del proveedor.${resMsg}`, 'success');
        closeModal();
        
        // Recargar página de importaciones
        if (typeof (window as any).reloadTab === 'function') {
          (window as any).reloadTab('importaciones');
        } else {
          const container = (window as any).getPageContainer ? (window as any).getPageContainer(null, 'importaciones') : document.getElementById('tab-pane-importaciones');
          if (container) renderImportaciones(container);
        }
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
        if (typeof (window as any).reloadTab === 'function') {
          (window as any).reloadTab('importaciones');
        } else {
          const container = (window as any).getPageContainer ? (window as any).getPageContainer(null, 'importaciones') : document.getElementById('tab-pane-importaciones');
          if (container) renderImportaciones(container);
        }
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      }
    }
  );
}

// --- Acción: Reabrir y Descapitalizar Importación con Diagnóstico Pre-Flight ---
async function openReopenImportModal(importId: string) {
  try {
    (window as any).openModal(
      'Reapertura y Descapitalización de Importación',
      `
      <div class="p-8 text-center space-y-3">
        <div class="inline-flex p-3 rounded-full bg-amber-50 text-amber-600 mb-1">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
        </div>
        <h5 class="font-bold text-sm text-slate-800">Analizando Diagnóstico Pre-Flight...</h5>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Verificando existencias físicas en bodega, comprobantes contables y reservas vinculadas antes de permitir la reapertura.
        </p>
      </div>
      `,
      '',
      false
    );

    const preflight = await (window as any).API.checkImportReopenPreflight(importId);
    const imp = preflight.importData;
    const mov = preflight.movement;
    const tx = preflight.transaction;
    const canReopen = preflight.canReopen;

    const modalBody = `
      <div class="space-y-4 text-xs text-slate-700">
        <!-- Encabezado de la Importación -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-500">Expediente</div>
            <div class="font-extrabold text-sm text-blue-900 font-mono">${(window as any).esc(imp.number)}</div>
          </div>
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-500">Valor Landed Capitalizado</div>
            <div class="font-bold text-slate-800">${(window as any).fmt(imp.total || 0)}</div>
          </div>
          <div>
            <div class="text-[10px] uppercase font-bold text-slate-500">Estado Actual</div>
            <div><span class="badge badge-green"><i class="fas fa-check-circle mr-1"></i>Capitalizado</span></div>
          </div>
        </div>

        <!-- 1. Diagnóstico de Stock Físico (Pre-Flight) -->
        <div class="p-3.5 rounded-xl border ${canReopen ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/80 border-rose-300'} space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs ${canReopen ? 'text-emerald-900' : 'text-rose-950'} flex items-center gap-1.5">
              <i class="fas ${canReopen ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-rose-600'}"></i>
              Diagnóstico de Inventario Físico en Bodega:
            </span>
            <span class="badge ${canReopen ? 'badge-emerald' : 'badge-red'} font-bold">
              ${canReopen ? 'Stock Disponible ✓' : 'Faltante de Stock ✗'}
            </span>
          </div>

          ${canReopen ? `
            <p class="text-[11px] text-emerald-800">
              Todas las unidades ingresadas (${preflight.stockChecks.reduce((s: number, c: any) => s + c.requiredQty, 0)} uds) están íntegras en bodega. Se pueden revertir físicamente sin generar saldos negativos.
            </p>
          ` : `
            <div class="text-[11px] text-rose-800 space-y-1">
              <p class="font-semibold">No es posible reabrir automáticamente porque parte de la mercancía ya fue vendida, despachada o trasladada:</p>
              <ul class="list-disc pl-4 space-y-0.5">
                ${preflight.issues.map((iss: string) => `<li>${(window as any).esc(iss)}</li>`).join('')}
              </ul>
            </div>
          `}

          <!-- Tabla Resumen de Productos a Revertir -->
          <div class="overflow-x-auto max-h-40 bg-white rounded border border-slate-200 mt-2">
            <table class="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th class="p-1.5">Producto</th>
                  <th class="p-1.5 text-right">Cant. Importada</th>
                  <th class="p-1.5 text-right">Stock Actual Bodega</th>
                  <th class="p-1.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${preflight.stockChecks.map((sc: any) => `
                  <tr>
                    <td class="p-1.5 font-medium text-slate-800">${(window as any).esc(sc.name)}</td>
                    <td class="p-1.5 text-right font-mono font-bold text-blue-900">${(window as any).fmtN(sc.requiredQty)}</td>
                    <td class="p-1.5 text-right font-mono font-bold ${sc.sufficient ? 'text-slate-700' : 'text-rose-700'}">${(window as any).fmtN(sc.currentStock)}</td>
                    <td class="p-1.5 text-center">
                      <span class="badge ${sc.sufficient ? 'badge-emerald' : 'badge-red'} text-[9px] py-0 px-1">
                        ${sc.sufficient ? 'OK' : 'Faltante'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Impacto Contable y en Cadena de Suministro -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div class="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
            <div class="font-bold text-blue-950 flex items-center gap-1">
              <i class="fas fa-book-bookmark text-blue-600"></i> Impacto Contable
            </div>
            <p class="text-blue-900">
              Se anulará el asiento de capitalización <strong>${tx ? (window as any).esc(tx.number) : 'FC-IMP'}</strong>.
              El débito a la cuenta <strong>143501 (Bodega)</strong> será retirado y la cuenta puente <strong>146505 (Tránsito)</strong> recuperará su saldo original.
            </p>
          </div>

          <div class="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
            <div class="font-bold text-amber-950 flex items-center gap-1">
              <i class="fas fa-handshake text-amber-600"></i> Reservas Comerciales
            </div>
            <p class="text-amber-900">
              ${preflight.affectedReservationsCount > 0 
                ? `<strong>${preflight.affectedReservationsCount}</strong> línea(s) de reserva volverán a estado en espera para evitar despachos mientras se corrigen los datos.`
                : 'No hay reservas comerciales de clientes afectadas por esta importación.'}
            </p>
          </div>
        </div>

        <!-- 3. Formulario de Autorización y Motivo -->
        <div class="space-y-2 pt-1 border-t border-slate-200">
          <label class="form-label font-bold text-xs">
            Motivo de la Reapertura <span class="text-rose-500">*</span>
            <span class="text-[10px] text-slate-400 font-normal ml-1">(Requerido para el libro de auditoría)</span>
          </label>
          <textarea id="reopen-reason-txt" class="form-input text-xs w-full" rows="2" 
                    placeholder="Describe detalladamente por qué se reabre esta importación (ej. Ajuste de flete internacional, corrección de TRM, redistribución de costos en facturas consolidadas...)" 
                    ${!canReopen ? 'disabled' : ''}></textarea>

          <label class="flex items-start gap-2 cursor-pointer mt-2 text-[11px] text-slate-700 select-none">
            <input type="checkbox" id="reopen-confirm-chk" class="rounded w-4 h-4 text-amber-600 focus:ring-amber-500 mt-0.5" ${!canReopen ? 'disabled' : ''}>
            <span>Confirmo que comprendo los efectos contables y de inventario de esta reapertura y deseo proceder.</span>
          </label>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-submit-reopen" ${!canReopen ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
        <i class="fas fa-lock-open mr-1.5"></i> Proceder con la Reapertura
      </button>
    `;

    (window as any).openModal(`Reapertura y Descapitalización — ${imp.number}`, modalBody, footer, true);

    if (canReopen) {
      document.getElementById('btn-submit-reopen')?.addEventListener('click', async () => {
        const reasonInput = (document.getElementById('reopen-reason-txt') as HTMLTextAreaElement)?.value.trim();
        const confirmCheck = (document.getElementById('reopen-confirm-chk') as HTMLInputElement)?.checked;

        if (!reasonInput || reasonInput.length < 5) {
          (window as any).showToast('Por favor escribe un motivo válido para la reapertura (mínimo 5 caracteres).', 'warning');
          document.getElementById('reopen-reason-txt')?.focus();
          return;
        }

        if (!confirmCheck) {
          (window as any).showToast('Debes marcar la casilla de confirmación para continuar.', 'warning');
          return;
        }

        const btn = document.getElementById('btn-submit-reopen') as HTMLButtonElement;
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Revirtiendo inventario y contabilidad...';
        }

        try {
          const res = await (window as any).API.reopenCapitalizedImport(importId, reasonInput);
          (window as any).showToast(`Importación ${res.importNumber} reabierta con éxito. Movimientos revertidos.`, 'success');
          (window as any).closeModal();

          // Abrir inmediatamente el formulario de edición de la importación
          if (typeof (window as any).editImport === 'function') {
            (window as any).editImport(importId);
          } else if (typeof (window as any).reloadTab === 'function') {
            (window as any).reloadTab('importaciones');
          }
        } catch (err: any) {
          (window as any).showToast(err.message, 'error');
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock-open mr-1.5"></i> Proceder con la Reapertura';
          }
        }
      });
    }
  } catch (err: any) {
    (window as any).showToast('Error en diagnóstico de reapertura: ' + err.message, 'error');
  }
}

// Exponer funciones globalmente para acceder desde onclick o eventos
(window as any).renderImportaciones = renderImportaciones;
(window as any).editImport = (id: string) => openImportForm(id, () => {
  if (typeof (window as any).reloadTab === 'function') {
    (window as any).reloadTab('importaciones');
  } else {
    const container = (window as any).getPageContainer ? (window as any).getPageContainer(null, 'importaciones') : document.getElementById('tab-pane-importaciones');
    if (container) renderImportaciones(container);
  }
});
(window as any).viewImportDetail = viewImportDetail;
(window as any).confirmFinalizarImportacion = confirmFinalizarImportacion;
(window as any).cancelImportDirect = cancelImportDirect;
(window as any).openReopenImportModal = openReopenImportModal;
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

async function openLinkTxLineModal(importId: string, stageConcept: string) {
  if (!importId) {
    (window as any).showToast('Debes guardar la importación como borrador antes de vincular movimientos contables.', 'warning');
    return;
  }

  const meta = IMPORT_CONCEPTS_META[stageConcept] || { label: stageConcept, name: stageConcept, puc: '' };
  
  (window as any).openModal(
    `Vincular Movimiento Contable · ${meta.label}`,
    `<div class="p-8 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando movimientos contables disponibles...</div>`,
    '',
    true
  );

  try {
    const candidates = await (window as any).API.searchCandidateTxLinesForImport({ limit: 100, importId });
    
    const renderCandidateRows = (items: any[]) => {
      if (!items.length) {
        return `<tr><td colspan="9" class="text-center py-8 text-slate-400"><i class="fas fa-circle-info mr-1"></i>No hay movimientos contables disponibles para vincular.</td></tr>`;
      }
      return items.map((l: any) => {
        const tx = l.expand?.tx_id || {};
        const third = l.expand?.third_party_id || tx.expand?.third_party_id || {};
        const acct = l.expand?.account_id || {};
        const txDate = tx.date || (l.created ? l.created.slice(0, 10) : '—');
        const txNum = tx.number || 'Asiento';
        const debit = Number(l.debit || 0);
        const credit = Number(l.credit || 0);
        const refVal = l.import_invoice_ref || tx.import_invoice_ref || '';
        const trmVal = l.import_trm || tx.import_trm || '';
        const isTransitMatch = !!(acct.code && acct.code.startsWith('146505'));

        return `
          <tr class="hover:bg-slate-50 transition-colors border-b ${isTransitMatch ? 'bg-blue-50/30' : ''}" data-cand-id="${l.id}">
            <td class="py-2.5 px-3 font-mono text-slate-600">${(window as any).esc(txDate)}</td>
            <td class="py-2.5 px-3 font-mono font-bold text-blue-700">${(window as any).esc(txNum)}</td>
            <td class="py-2.5 px-3">
              <div class="font-bold text-slate-800">${(window as any).esc(third.name || 'Sin Tercero')}</div>
              ${third.doc_number ? `<div class="text-[10px] text-slate-400 font-mono">Doc: ${(window as any).esc(third.doc_number)}</div>` : ''}
            </td>
            <td class="py-2.5 px-3">
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-semibold text-slate-700">${(window as any).esc(acct.code || '')}</span>
                ${isTransitMatch ? `<span class="badge badge-blue text-[9px] font-bold py-0.5 px-1.5"><i class="fas fa-bullseye mr-1"></i>Tránsito</span>` : ''}
              </div>
              <div class="text-[11px] text-slate-500">${(window as any).esc(acct.name || '')}</div>
            </td>
            <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${debit > 0 ? (window as any).fmt(debit) : '—'}</td>
            <td class="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">${credit > 0 ? (window as any).fmt(credit) : '—'}</td>
            <td class="py-2.5 px-2" style="width:130px">
              <input type="text" id="cand-ref-${l.id}" class="form-input text-xs py-1 font-mono w-full" placeholder="Factura Ref" value="${(window as any).esc(refVal)}">
            </td>
            <td class="py-2.5 px-2" style="width:85px">
              <input type="number" id="cand-trm-${l.id}" class="form-input text-xs py-1 font-mono text-right w-full" placeholder="TRM" value="${trmVal || ''}">
            </td>
            <td class="py-2.5 px-3 text-center" style="width:95px">
              <button type="button" class="btn btn-primary btn-xs w-full py-1" onclick="window.doLinkCandidateTxLine('${l.id}', '${importId}', '${stageConcept}')">
                <i class="fas fa-link mr-1"></i> Vincular
              </button>
            </td>
          </tr>
        `;
      }).join('');
    };

    const modalBody = `
      <div class="space-y-4">
        <div class="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <i class="fas fa-info-circle text-blue-600 mt-0.5 text-sm"></i>
          <div>
            <span class="font-bold">Asignación Inversa a la Etapa "${meta.label}":</span>
            <p class="mt-0.5 text-blue-800">Selecciona el movimiento contable que respalda este costo. Al vincularlo, quedará asignado a la importación y alimentará la Hoja de Costos y la liquidación final.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input type="text" id="cand-filter-input" class="form-input text-xs w-full pl-8" placeholder="Filtrar por tercero, cuenta PUC, comprobante o factura...">
            <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          </div>
        </div>

        <div class="border rounded-xl overflow-hidden bg-white max-h-[380px] overflow-y-auto">
          <table class="w-full text-xs text-left border-collapse" id="cand-table">
            <thead class="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b z-10">
              <tr>
                <th class="py-2.5 px-3">Fecha</th>
                <th class="py-2.5 px-3">Comprobante</th>
                <th class="py-2.5 px-3">Tercero</th>
                <th class="py-2.5 px-3">Cuenta PUC</th>
                <th class="py-2.5 px-3 text-right">Débito</th>
                <th class="py-2.5 px-3 text-right">Crédito</th>
                <th class="py-2.5 px-2">Factura Ref</th>
                <th class="py-2.5 px-2 text-right">TRM</th>
                <th class="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody id="cand-tbody" class="divide-y divide-slate-100">
              ${renderCandidateRows(candidates)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const modalFooter = `
      <button type="button" class="btn btn-outline" onclick="window.closeLinkTxModalAndReopen('${importId}')">Cancelar</button>
    `;

    (window as any).openModal(`Vincular Movimiento Contable · ${meta.label}`, modalBody, modalFooter, true);

    const filterInput = document.getElementById('cand-filter-input') as HTMLInputElement;
    filterInput?.addEventListener('input', () => {
      const q = filterInput.value.toLowerCase().trim();
      const filtered = !q ? candidates : candidates.filter((l: any) => {
        const txNum = (l.expand?.tx_id?.number || '').toLowerCase();
        const third = (l.expand?.third_party_id?.name || '').toLowerCase();
        const doc = (l.expand?.third_party_id?.doc_number || '').toLowerCase();
        const acct = ((l.expand?.account_id?.code || '') + ' ' + (l.expand?.account_id?.name || '')).toLowerCase();
        const desc = (l.description || '').toLowerCase();
        const ref = (l.import_invoice_ref || '').toLowerCase();
        return txNum.includes(q) || third.includes(q) || doc.includes(q) || acct.includes(q) || desc.includes(q) || ref.includes(q);
      });
      const tbody = document.getElementById('cand-tbody');
      if (tbody) tbody.innerHTML = renderCandidateRows(filtered);
    });

  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

async function doLinkCandidateTxLine(lineId: string, importId: string, stageConcept: string) {
  try {
    const invRef = (document.getElementById(`cand-ref-${lineId}`) as HTMLInputElement)?.value.trim() || '';
    const trm = parseFloat((document.getElementById(`cand-trm-${lineId}`) as HTMLInputElement)?.value || '0') || 0;
    
    await (window as any).API.linkTxLineToImport(lineId, importId, stageConcept, invRef, trm);
    (window as any).showToast('Movimiento contable vinculado a la etapa con éxito', 'success');
    (window as any).closeModal();
    setTimeout(() => {
      openImportForm(importId);
    }, 200);
  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

async function unlinkStageTxLine(lineId: string, importId: string) {
  const ok = confirm('¿Estás seguro de desvincular este movimiento contable de la importación? El comprobante contable permanecerá intacto en contabilidad.');
  if (!ok) return;

  try {
    await (window as any).API.unlinkTxLineFromImport(lineId);
    (window as any).showToast('Movimiento contable desvinculado con éxito', 'success');
    (window as any).closeModal();
    setTimeout(() => {
      openImportForm(importId);
    }, 200);
  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

function openRegisterTxForImport(importId: string, stageConcept: string) {
  (window as any).closeModal();
  setTimeout(() => {
    if (typeof (window as any).openNuevaTxModal === 'function') {
      (window as any).openNuevaTxModal({
        is_import: true,
        import_id: importId,
        import_concept: stageConcept,
        onSaved: () => {
          openImportForm(importId);
        }
      });
    } else {
      (window as any).showToast('Módulo de transacciones no disponible.', 'error');
    }
  }, 200);
}

function closeLinkTxModalAndReopen(importId: string) {
  (window as any).closeModal();
  setTimeout(() => {
    openImportForm(importId);
  }, 200);
}

(window as any).openLinkTxLineModal = openLinkTxLineModal;
(window as any).doLinkCandidateTxLine = doLinkCandidateTxLine;
(window as any).unlinkStageTxLine = unlinkStageTxLine;
(window as any).openRegisterTxForImport = openRegisterTxForImport;
(window as any).closeLinkTxModalAndReopen = closeLinkTxModalAndReopen;

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

        <div class="rounded-xl border p-4 bg-white" style="border-color:#E5E7EB">
          <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-arrows-turn-to-dots text-purple-600 mr-2"></i>Metodología y Modo de Control de Costos</h4>
          <p class="text-xs mb-3" style="color:#6B7280">Define la metodología global con la que la empresa liquida y causa los costos de importación.</p>
          
          <div class="form-group">
            <label class="form-label font-bold text-xs">Modo de Causación Contable</label>
            <select id="imp-cfg-costing-mode" class="form-input py-1.5 text-xs font-semibold">
              <option value="direct" ${cfg.costing?.mode !== 'inverse' ? 'selected' : ''}>Directo (Causación secuencial por etapas desde el formulario de importación)</option>
              <option value="inverse" ${cfg.costing?.mode === 'inverse' ? 'selected' : ''}>Inverso (Lectura, visor y selector de transacciones acumuladas desde Contabilidad)</option>
            </select>
            <p class="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              <strong>Modo Inverso:</strong> En la captura de transacciones contables se marca cada comprobante/movimiento con el código de importación y su concepto (FOB, Flete, Seguro, Aduana, etc.). El módulo de importaciones transforma cada etapa en un visor de transacciones acumuladas, calculando automáticamente la Hoja de Costos con las cifras contables reales.
            </p>
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

        const costingMode = (document.getElementById('imp-cfg-costing-mode') as HTMLSelectElement)?.value || 'direct';

        const payload = {
          costing: {
            mode: costingMode
          },
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
(window as any).openImportForm = openImportForm;

// ============================================================================
// DOSSIER OFICIAL DE IMPORTACIÓN / REPORTE EJECUTIVO ADUANERO Y CONTABLE (DIAN/GERENCIA)
// ============================================================================

async function openImportExecutiveReport(importId: string) {
  try {
    (window as any).showToast('Generando Dossier Oficial...', 'info');

    const [imp, lines, importInvoices, palletConfigs, txs, settingsList, warehouses] = await Promise.all([
      (window as any).pb.get('imports', importId, { expand: 'supplier_id' }),
      (window as any).API.getImportLines(importId),
      (window as any).API.getImportInvoices(importId).catch(() => []),
      (window as any).API.getImportPalletConfigs(importId).catch(() => []),
      (window as any).pb.listAll('transactions', { filter: `import_id = "${importId}" || notes ~ "${importId}" || number ~ "${importId}"`, expand: 'third_party_id' }).catch(() => []),
      (window as any).pb.listAll('settings', {}).catch(() => []),
      (window as any).API.getWarehouses(true).catch(() => [])
    ]);

    const m: any = Object.fromEntries(settingsList.map((s: any) => [s.key, s.value || '']));
    const company = {
      name: m.company_name || 'EMPRESA IMPORTADORA',
      nit: m.company_nit || 'NIT NO REGISTRADO',
      address: m.company_address || '',
      phone: m.company_phone || '',
      email: m.company_email || '',
      city: m.company_city || 'Colombia'
    };

    // Cálculos de costos y totales
    const exchangeRate = imp.exchange_rate || 1;
    const fobCop = (imp.fob_total || 0) * exchangeRate;
    const freightCop = (imp.freight_cost || 0) * (imp.freight_trm || imp.freight_exchange_rate || exchangeRate);
    const insuranceCop = (imp.insurance_cost || 0) * (imp.insurance_trm || imp.insurance_exchange_rate || exchangeRate);
    const cifCop = fobCop + freightCop + insuranceCop;

    let arancelCop = 0;
    let ivaCop = 0;
    let totalGrossKg = 0;
    let totalNetKg = 0;
    let totalCbm = 0;
    let totalUnits = 0;

    const formattedLines = lines.map((l: any, idx: number) => {
      const prod = l.expand?.product_id;
      const supp = l.expand?.supplier_id;
      const q = Number(l.qty) || 0;
      const fobUnit = Number(l.fob_price) || 0;
      const fobLineDivisa = q * fobUnit;
      const fobLineCop = fobLineDivisa * exchangeRate;
      const arRate = Number(l.arancel_rate) || 0;
      const ivaRate = Number(l.iva_rate) || 0;
      const arVal = fobLineCop * (arRate / 100);
      const ivaVal = (fobLineCop + arVal) * (ivaRate / 100);
      const prorated = Number(l.prorated_cost) || 0;
      const unitCost = Number(l.unit_cost_cop) || (q > 0 ? (fobLineCop + prorated) / q : 0);
      const totalCost = Number(l.total_cop) || (q * unitCost);

      const netKg = Number(l.peso_neto_total) || (prod?.peso_neto ? prod.peso_neto * q : 0);
      const grossKg = Number(l.peso_bruto_total) || (prod?.peso_bruto ? prod.peso_bruto * q : 0);
      const cbm = Number(l.cubic_meters_total) || 0;

      arancelCop += arVal;
      ivaCop += ivaVal;
      totalGrossKg += grossKg;
      totalNetKg += netKg;
      totalCbm += cbm;
      totalUnits += q;

      const unitFormatted = formatUnitOfMeasure(prod?.unit || l.unit);

      return {
        itemNo: idx + 1,
        code: prod?.code || 'S/C',
        name: prod?.name || l.description || 'Producto',
        nandina: l.posicion_arancelaria || prod?.posicion_arancelaria || '—',
        originCountry: l.pais_origen || prod?.pais_origen || '—',
        certOrigin: l.certificado_origen_num || '—',
        unit: unitFormatted,
        rawUnit: prod?.unit || l.unit || '',
        qty: q,
        fobUnit,
        fobLineDivisa,
        fobLineCop,
        arRate,
        arVal,
        ivaRate,
        ivaVal,
        prorated,
        unitCost,
        totalCost,
        lotNumber: l.lot_number || '—',
        expiryDate: l.expiry_date ? l.expiry_date.split(' ')[0] : '—',
        manifest: l.manifest_number || '—',
        grossKg,
        netKg,
        cbm,
        supplierName: supp?.name || '—'
      };
    });

    const otherCostsCop = (Number(imp.customs_cost) || 0) + (Number(imp.local_freight) || 0) + (Number(imp.other_expenses) || 0);
    const grandTotalCop = Number(imp.total) || (cifCop + arancelCop + otherCostsCop);

    // Identificar comprobante contable generado si ya está capitalizada
    const capTx = txs.find((t: any) => t.type === 'purchase' || t.number?.startsWith('IMP-') || t.number?.startsWith('FC-'));
    const destinationWarehouse = warehouses.find((w: any) => w.id === imp.warehouse_id)?.name || 'Bodega Principal';

    const dossierData = {
      company,
      imp,
      lines: formattedLines,
      importInvoices,
      palletConfigs,
      txs,
      warehouses,
      destinationWarehouse,
      capTx,
      summary: {
        totalUnits,
        totalGrossKg,
        totalNetKg,
        totalCbm,
        fobCop,
        freightCop,
        insuranceCop,
        cifCop,
        arancelCop,
        ivaCop,
        otherCostsCop,
        grandTotalCop
      }
    };

    // Modal view
    const modalContent = `
      <div class="space-y-6 text-slate-800">
        <!-- Encabezado Corporativo y Legal -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white shadow-md">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-blue-500/30 text-blue-200 border border-blue-400/40">
                  DOCUMENTO OFICIAL AUDITORÍA
                </span>
                <span class="badge ${imp.status === 'recibido' ? 'badge-emerald' : 'badge-amber'} text-xs uppercase font-bold">
                  ${imp.status === 'recibido' ? '✓ CAPITALIZADA / NACIONALIZADA' : imp.status.toUpperCase()}
                </span>
              </div>
              <h2 class="text-2xl font-black tracking-tight mt-1">DOSSIER TÉCNICO DE IMPORTACIÓN Y COSTOS</h2>
              <p class="text-xs text-blue-200 mt-0.5">Liquidación Aduanera, Estructura Landed Cost CIF y Certificación Contable</p>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right min-w-[200px]">
              <div class="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Operación Aduanera</div>
              <div class="text-xl font-black font-mono tracking-wide text-white">${(window as any).esc(imp.number)}</div>
              <div class="text-xs text-blue-200 font-semibold mt-0.5">TRM Oficial: <span class="font-bold text-white font-mono">$ ${(window as any).fmtN(imp.exchange_rate)}</span></div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/15 text-xs">
            <div>
              <span class="text-[10px] text-blue-300 block uppercase font-bold">Empresa Importadora:</span>
              <span class="font-bold">${(window as any).esc(company.name)}</span>
              <span class="block text-[11px] text-blue-200 font-mono">NIT: ${(window as any).esc(company.nit)}</span>
            </div>
            <div>
              <span class="text-[10px] text-blue-300 block uppercase font-bold">Incoterm & Modalidad:</span>
              <span class="font-bold">${(window as any).esc(imp.incoterm || 'FOB')} — ${imp.is_consolidated ? 'Consolidada (Multi-Prov)' : 'Directa'}</span>
              <span class="block text-[11px] text-blue-200">Moneda: ${(window as any).esc(imp.currency)}</span>
            </div>
            <div>
              <span class="text-[10px] text-blue-300 block uppercase font-bold">Bodega de Destino:</span>
              <span class="font-bold">${(window as any).esc(destinationWarehouse)}</span>
              <span class="block text-[11px] text-blue-200">Fecha Reg: ${imp.date ? imp.date.split(' ')[0] : '—'}</span>
            </div>
            <div>
              <span class="text-[10px] text-blue-300 block uppercase font-bold">Comprobante Contable:</span>
              <span class="font-mono font-extrabold ${capTx ? 'text-emerald-300' : 'text-amber-300'}">${capTx ? (window as any).esc(capTx.number) : 'Pendiente de Cierre'}</span>
              <span class="block text-[11px] text-blue-200">Estado: ${capTx ? 'Contabilizado' : 'Borrador/En Proceso'}</span>
            </div>
          </div>
        </div>

        <!-- 6 Etapas del Landed Cost (Caja Resumen Ejecutiva) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-slate-600 flex items-center gap-2">
              <i class="fas fa-layer-group text-blue-600"></i> Estructura de Liquidación y Formación de Costos (Landed Cost 6 Etapas)
            </h3>
            <span class="text-xs font-mono font-bold text-slate-500">Valores en COP</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mt-3">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 font-bold uppercase block">1. FOB Mercancía</span>
              <div class="text-sm font-black font-mono text-slate-800 mt-1">${(window as any).fmt(fobCop)}</div>
              <span class="text-[10px] text-slate-400 font-mono">${(window as any).fmtN(imp.fob_total)} ${imp.currency}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 font-bold uppercase block">2. Fletes Int.</span>
              <div class="text-sm font-black font-mono text-slate-800 mt-1">${(window as any).fmt(freightCop)}</div>
              <span class="text-[10px] text-slate-400 font-mono">${(window as any).fmtN(imp.freight_cost || 0)} ${imp.currency}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] text-slate-500 font-bold uppercase block">3. Seguros Int.</span>
              <div class="text-sm font-black font-mono text-slate-800 mt-1">${(window as any).fmt(insuranceCop)}</div>
              <span class="text-[10px] text-slate-400 font-mono">${(window as any).fmtN(imp.insurance_cost || 0)} ${imp.currency}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <span class="text-[10px] text-blue-800 font-bold uppercase block">Subtotal CIF</span>
              <div class="text-sm font-black font-mono text-blue-900 mt-1">${(window as any).fmt(cifCop)}</div>
              <span class="text-[10px] text-blue-600 font-semibold">Base Gravable</span>
            </div>
            <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span class="text-[10px] text-amber-800 font-bold uppercase block">4. Aranceles DIAN</span>
              <div class="text-sm font-black font-mono text-amber-900 mt-1">${(window as any).fmt(arancelCop)}</div>
              <span class="text-[10px] text-amber-700 font-semibold">Impuestos Import.</span>
            </div>
            <div class="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span class="text-[10px] text-indigo-800 font-bold uppercase block">5. Gastos Log./Port.</span>
              <div class="text-sm font-black font-mono text-indigo-900 mt-1">${(window as any).fmt(otherCostsCop)}</div>
              <span class="text-[10px] text-indigo-700 font-semibold">Nacionalización</span>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/50 p-3 rounded-xl">
            <div class="flex items-center gap-4 text-xs">
              <div><span class="text-slate-500 font-semibold">Total Ítems:</span> <span class="font-bold text-slate-900 font-mono">${formattedLines.length}</span></div>
              <div><span class="text-slate-500 font-semibold">Total Unidades:</span> <span class="font-bold text-slate-900 font-mono">${(window as any).fmtN(totalUnits)}</span></div>
              <div><span class="text-slate-500 font-semibold">Peso Bruto:</span> <span class="font-bold text-slate-900 font-mono">${totalGrossKg.toFixed(2)} Kg</span></div>
              <div><span class="text-slate-500 font-semibold">Volumen Total:</span> <span class="font-bold text-slate-900 font-mono">${totalCbm.toFixed(3)} m³</span></div>
            </div>
            <div class="text-right mt-2 md:mt-0">
              <span class="text-xs uppercase font-extrabold text-blue-900 mr-2">Total Capitalizado en Bodega:</span>
              <span class="text-xl font-black font-mono text-blue-950">${(window as any).fmt(grandTotalCop)}</span>
            </div>
          </div>
        </div>

        <!-- Matriz Completa de Mercancías -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i class="fas fa-boxes-stacked text-blue-600"></i> Matriz de Mercancías Importadas y Desglose Aduanero
              </h3>
              <p class="text-[11px] text-slate-500 mt-0.5">Clasificación arancelaria, unidades humanizadas, soporte aduanero y prorrateo individual</p>
            </div>
            <span class="badge badge-blue font-mono font-bold text-xs">${formattedLines.length} líneas</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left border-collapse" style="min-width: 1100px">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th class="p-2.5">#</th>
                  <th class="p-2.5">Producto & Posición NANDINA</th>
                  <th class="p-2.5">Origen & Manifiesto</th>
                  <th class="p-2.5 text-right">Cantidad & Unidad</th>
                  <th class="p-2.5 text-right">FOB Unit (${imp.currency})</th>
                  <th class="p-2.5 text-right">Total FOB (${imp.currency})</th>
                  <th class="p-2.5 text-right">Arancel %</th>
                  <th class="p-2.5 text-right">Gastos Prorrateados</th>
                  <th class="p-2.5 text-right">Costo Unit COP</th>
                  <th class="p-2.5 text-right">Costo Total COP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono">
                ${formattedLines.map(l => `
                  <tr class="hover:bg-blue-50/30 transition-colors">
                    <td class="p-2.5 font-bold text-slate-400">${l.itemNo}</td>
                    <td class="p-2.5 font-sans">
                      <div class="font-bold text-slate-900 text-xs">[${(window as any).esc(l.code)}] ${(window as any).esc(l.name)}</div>
                      <div class="text-[10px] text-blue-700 font-mono mt-0.5 font-semibold">NANDINA: ${(window as any).esc(l.nandina)}</div>
                    </td>
                    <td class="p-2.5 font-sans">
                      <div class="text-slate-800 text-xs font-semibold">${(window as any).esc(l.originCountry)}</div>
                      <div class="text-[10px] text-slate-500 font-mono">Manif: ${(window as any).esc(l.manifest)}</div>
                    </td>
                    <td class="p-2.5 text-right">
                      <div class="font-black text-slate-900">${(window as any).fmtN(l.qty)}</div>
                      <div class="text-[10px] text-blue-800 font-sans font-bold">${(window as any).esc(l.unit)}</div>
                    </td>
                    <td class="p-2.5 text-right font-semibold">${(window as any).fmt(l.fobUnit).replace('COP', '')}</td>
                    <td class="p-2.5 text-right font-bold text-slate-800">${(window as any).fmt(l.fobLineDivisa).replace('COP', '')}</td>
                    <td class="p-2.5 text-right text-amber-900 font-bold">${l.arRate}%</td>
                    <td class="p-2.5 text-right text-slate-600">${(window as any).fmt(l.prorated)}</td>
                    <td class="p-2.5 text-right font-extrabold text-blue-900">${(window as any).fmt(l.unitCost)}</td>
                    <td class="p-2.5 text-right font-black text-slate-900">${(window as any).fmt(l.totalCost)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        ${imp.is_consolidated && importInvoices.length > 0 ? `
          <!-- Relación de Proveedores y Facturas Consolidadas -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-xs uppercase font-extrabold tracking-wider text-slate-600 mb-3 flex items-center gap-2">
              <i class="fas fa-file-invoice-dollar text-emerald-600"></i> Relación de Proveedores y Facturas Consolidadas
            </h3>
            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <table class="w-full text-xs text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <th class="p-2">Factura Nro.</th>
                    <th class="p-2">Proveedor / Tercero</th>
                    <th class="p-2 text-right">Monto Divisa</th>
                    <th class="p-2 text-right">% Asignación Costos</th>
                    <th class="p-2 text-right">Costo Liquidado (COP)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-mono">
                  ${importInvoices.map((iv: any) => {
                    const supp = iv.expand?.supplier_id || iv.expand?.third_party_id;
                    const pct = Number(iv.cost_distribution_pct) || 0;
                    const allocatedCop = grandTotalCop * (pct / 100);
                    return `
                      <tr>
                        <td class="p-2 font-bold text-blue-900">${(window as any).esc(iv.invoice_number)}</td>
                        <td class="p-2 font-sans font-medium text-slate-800">${(window as any).esc(supp?.name || 'Proveedor')}</td>
                        <td class="p-2 text-right">${(window as any).fmtN(iv.invoice_amount || 0)} ${(window as any).esc(iv.currency || imp.currency)}</td>
                        <td class="p-2 text-right font-bold text-amber-900">${pct}%</td>
                        <td class="p-2 text-right font-bold text-slate-900">${(window as any).fmt(allocatedCop)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Bloque de Trazabilidad y Certificación de Firmas -->
        <div class="bg-slate-50 rounded-2xl border border-slate-200 p-4">
          <h3 class="text-xs uppercase font-extrabold tracking-wider text-slate-600 mb-2">
            <i class="fas fa-signature text-blue-600 mr-1.5"></i> Control Interno y Firmas de Legalización
          </h3>
          <p class="text-[11px] text-slate-500 mb-6">
            Certificamos que los datos y valores consignados en este informe han sido validados contra las Declaraciones de Importación, Facturas Comerciales del exterior y Comprobantes Contables oficiales.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div class="border-t border-slate-400 text-center pt-2">
              <div class="text-xs font-black text-slate-800 uppercase">Responsable Comercio Exterior</div>
              <div class="text-[10px] text-slate-500">Elaboración y Prorrateo Logístico</div>
            </div>
            <div class="border-t border-slate-400 text-center pt-2">
              <div class="text-xs font-black text-slate-800 uppercase">Contador Público / Revisor Fiscal</div>
              <div class="text-[10px] text-slate-500">T.P. Nro: ___________________</div>
            </div>
            <div class="border-t border-slate-400 text-center pt-2">
              <div class="text-xs font-black text-slate-800 uppercase">Representante Legal / Gerencia</div>
              <div class="text-[10px] text-slate-500">Aprobación Final y Capitalización</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-secondary border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold" id="btn-export-dossier-excel">
        <i class="fas fa-file-excel mr-1.5 text-emerald-600"></i> Exportar a Excel (.xlsx)
      </button>
      <button class="btn btn-primary" id="btn-print-dossier-pdf">
        <i class="fas fa-print mr-1.5"></i> Imprimir / Exportar PDF
      </button>
    `;

    (window as any).openModal(`Dossier Oficial de Importación — ${imp.number}`, modalContent, modalFooter, true);

    // Conectar botones de acción
    setTimeout(() => {
      document.getElementById('btn-export-dossier-excel')?.addEventListener('click', () => {
        exportExecutiveReportToExcel(dossierData);
      });

      document.getElementById('btn-print-dossier-pdf')?.addEventListener('click', () => {
        const printWindow = window.open('', '_blank', 'width=1000,height=850');
        if (printWindow) {
          printWindow.document.write(buildExecutiveReportPrintHTML(dossierData));
          printWindow.document.close();
        }
      });
    }, 150);

  } catch (err: any) {
    (window as any).showToast('Error al generar dossier oficial: ' + err.message, 'error');
  }
}

function exportExecutiveReportToExcel(data: any) {
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    (window as any).showToast('La librería XLSX no está disponible para exportación.', 'error');
    return;
  }

  const { imp, company, lines, importInvoices, summary, destinationWarehouse, capTx } = data;

  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen_Aduanero
  const resumenRows = [
    ['DOSSIER OFICIAL DE IMPORTACIÓN Y LIQUIDACIÓN ADUANERA'],
    ['EMPRESA:', company.name],
    ['NIT:', company.nit],
    ['DIRECCIÓN:', company.address],
    ['TELÉFONO / EMAIL:', `${company.phone} / ${company.email}`],
    [],
    ['DATOS DE LA OPERACIÓN'],
    ['Nro. Importación:', imp.number],
    ['Estado:', imp.status],
    ['Fecha Liquidación:', imp.date ? imp.date.split(' ')[0] : ''],
    ['Incoterm:', imp.incoterm || 'FOB'],
    ['Moneda Original:', imp.currency],
    ['Tasa de Cambio (TRM Oficial):', imp.exchange_rate],
    ['Modalidad:', imp.is_consolidated ? 'Consolidada (Multi-proveedor)' : 'Directa (Proveedor Único)'],
    ['Bodega Destino:', destinationWarehouse],
    ['Comprobante Contable Generado:', capTx ? capTx.number : 'Pendiente'],
    [],
    ['ESTRUCTURA DE COSTOS LANDED COST (COP)'],
    ['1. FOB Mercancía (COP):', summary.fobCop],
    ['2. Fletes Internacionales (COP):', summary.freightCop],
    ['3. Seguros Internacionales (COP):', summary.insuranceCop],
    ['SUBTOTAL CIF (Base Gravable COP):', summary.cifCop],
    ['4. Aranceles DIAN (COP):', summary.arancelCop],
    ['5. IVA Aduanero DIAN (COP):', summary.ivaCop],
    ['6. Gastos Portuarios y Nacionales (COP):', summary.otherCostsCop],
    ['TOTAL COSTO NACIONALIZADO CAPITALIZADO (COP):', summary.grandTotalCop],
    [],
    ['TOTALES FÍSICOS Y LOGÍSTICOS'],
    ['Total Ítems:', lines.length],
    ['Total Unidades Físicas:', summary.totalUnits],
    ['Total Peso Neto (Kg):', summary.totalNetKg],
    ['Total Peso Bruto (Kg):', summary.totalGrossKg],
    ['Total Volumen CBM (m³):', summary.totalCbm]
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen_Aduanero');

  // Hoja 2: Detalle_Mercancias
  const mercanciasHeaders = [
    'Ítem',
    'Código',
    'Descripción Producto',
    'Posición NANDINA (DIAN)',
    'País Origen',
    'Certificado Origen',
    'Unidad de Medida (Humanizada)',
    'Código DIAN Unidad',
    'Cantidad',
    `FOB Unitario (${imp.currency})`,
    `Total FOB (${imp.currency})`,
    'FOB Total (COP)',
    'Arancel %',
    'Valor Arancel (COP)',
    'IVA %',
    'Valor IVA (COP)',
    'Gastos Prorrateados (COP)',
    'Costo Unitario (COP)',
    'Total Costo Nacionalizado (COP)',
    'Lote',
    'Vencimiento',
    'Nro Manifiesto Aduanero',
    'Peso Neto (Kg)',
    'Peso Bruto (Kg)',
    'CBM (m³)',
    'Proveedor'
  ];

  const mercanciasDataRows = lines.map((l: any) => [
    l.itemNo,
    l.code,
    l.name,
    l.nandina,
    l.originCountry,
    l.certOrigin,
    l.unit,
    l.rawUnit,
    l.qty,
    l.fobUnit,
    l.fobLineDivisa,
    l.fobLineCop,
    l.arRate,
    l.arVal,
    l.ivaRate,
    l.ivaVal,
    l.prorated,
    l.unitCost,
    l.totalCost,
    l.lotNumber,
    l.expiryDate,
    l.manifest,
    l.netKg,
    l.grossKg,
    l.cbm,
    l.supplierName
  ]);

  const wsMercancias = XLSX.utils.aoa_to_sheet([mercanciasHeaders, ...mercanciasDataRows]);
  XLSX.utils.book_append_sheet(wb, wsMercancias, 'Detalle_Mercancias');

  // Hoja 3: Facturas_Consolidadas (si aplica)
  if (imp.is_consolidated && importInvoices.length > 0) {
    const invHeaders = [
      'Factura Nro.',
      'Proveedor / Tercero Exterior',
      'Moneda Factura',
      'Monto Factura Extranjera',
      '% Distribución Costo',
      'Costo Asignado (COP)'
    ];
    const invRows = importInvoices.map((iv: any) => {
      const supp = iv.expand?.supplier_id || iv.expand?.third_party_id;
      const pct = Number(iv.cost_distribution_pct) || 0;
      const allocatedCop = summary.grandTotalCop * (pct / 100);
      return [
        iv.invoice_number,
        supp?.name || 'Proveedor',
        iv.currency || imp.currency,
        Number(iv.invoice_amount) || 0,
        pct,
        allocatedCop
      ];
    });
    const wsInvs = XLSX.utils.aoa_to_sheet([invHeaders, ...invRows]);
    XLSX.utils.book_append_sheet(wb, wsInvs, 'Facturas_Consolidadas');
  }

  const fileName = `Dossier_Oficial_Importacion_${imp.number}.xlsx`;
  XLSX.writeFile(wb, fileName);
  (window as any).showToast(`Archivo Excel exportado exitosamente: ${fileName}`, 'success');
}

function buildExecutiveReportPrintHTML(data: any): string {
  const { imp, company, lines, importInvoices, summary, destinationWarehouse, capTx } = data;

  const productRows = lines.map((l: any) => `
    <tr>
      <td style="text-align:center;font-weight:bold">${l.itemNo}</td>
      <td>
        <div style="font-weight:bold;color:#0F172A">${(window as any).esc(l.code)} - ${(window as any).esc(l.name)}</div>
        <div style="font-size:8.5px;color:#475569">NANDINA: <strong>${(window as any).esc(l.nandina)}</strong> | Origen: ${(window as any).esc(l.originCountry)}</div>
      </td>
      <td style="text-align:right">
        <div style="font-weight:bold">${(window as any).fmtN(l.qty)}</div>
        <div style="font-size:8.5px;color:#2563EB;font-weight:bold">${(window as any).esc(l.unit)}</div>
      </td>
      <td style="text-align:right;font-family:monospace">${(window as any).fmt(l.fobUnit).replace('COP', '')}</td>
      <td style="text-align:right;font-family:monospace;font-weight:bold">${(window as any).fmt(l.fobLineDivisa).replace('COP', '')}</td>
      <td style="text-align:right;font-family:monospace">${l.arRate}%</td>
      <td style="text-align:right;font-family:monospace">${(window as any).fmt(l.prorated)}</td>
      <td style="text-align:right;font-family:monospace;font-weight:bold;color:#1E3A8A">${(window as any).fmt(l.unitCost)}</td>
      <td style="text-align:right;font-family:monospace;font-weight:bold">${(window as any).fmt(l.totalCost)}</td>
    </tr>
  `).join('');

  const consolidatedSection = (imp.is_consolidated && importInvoices.length > 0) ? `
    <div class="section-title">3. Relación de Proveedores y Facturas Consolidadas del Exterior</div>
    <table>
      <thead>
        <tr>
          <th>Factura Nro.</th>
          <th>Proveedor Internacional</th>
          <th style="text-align:right">Monto Divisa</th>
          <th style="text-align:right">% Distribución Costo</th>
          <th style="text-align:right">Costo Asignado (COP)</th>
        </tr>
      </thead>
      <tbody>
        ${importInvoices.map((iv: any) => {
          const supp = iv.expand?.supplier_id || iv.expand?.third_party_id;
          const pct = Number(iv.cost_distribution_pct) || 0;
          const allocatedCop = summary.grandTotalCop * (pct / 100);
          return `
            <tr>
              <td style="font-family:monospace;font-weight:bold">${(window as any).esc(iv.invoice_number)}</td>
              <td>${(window as any).esc(supp?.name || 'Proveedor')}</td>
              <td style="text-align:right;font-family:monospace">${(window as any).fmtN(iv.invoice_amount || 0)} ${(window as any).esc(iv.currency || imp.currency)}</td>
              <td style="text-align:right;font-family:monospace;font-weight:bold">${pct}%</td>
              <td style="text-align:right;font-family:monospace;font-weight:bold">${(window as any).fmt(allocatedCop)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Dossier Oficial de Importación - ${imp.number}</title>
      <style>
        @page { size: letter portrait; margin: 12mm 10mm; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 10px;
          line-height: 1.35;
          color: #1E293B;
          margin: 0;
          padding: 10px;
          background: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0F172A;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .company-name { font-size: 14px; font-weight: 900; color: #0F172A; text-transform: uppercase; }
        .doc-title { font-size: 13px; font-weight: 800; color: #1E3A8A; margin-top: 2px; }
        .meta-box {
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 6px 10px;
          background: #F8FAFC;
          font-size: 9px;
          margin-bottom: 10px;
        }
        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .meta-label { font-weight: bold; color: #64748B; text-transform: uppercase; font-size: 8px; }
        .meta-val { font-weight: bold; color: #0F172A; font-size: 9.5px; }
        .section-title {
          font-size: 10.5px;
          font-weight: 800;
          color: #0F172A;
          text-transform: uppercase;
          margin-top: 10px;
          margin-bottom: 4px;
          border-left: 3px solid #2563EB;
          padding-left: 6px;
        }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 9px; }
        th {
          background: #F1F5F9;
          color: #334155;
          font-weight: bold;
          text-align: left;
          padding: 5px 6px;
          border-top: 1px solid #CBD5E1;
          border-bottom: 1px solid #CBD5E1;
          text-transform: uppercase;
          font-size: 8px;
        }
        td {
          padding: 4.5px 6px;
          border-bottom: 1px solid #E2E8F0;
        }
        .summary-box {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 6px;
          margin-bottom: 10px;
        }
        .summary-card { padding: 4px 6px; background: #fff; border: 1px solid #E2E8F0; border-radius: 4px; }
        .summary-card .label { font-size: 7.5px; font-weight: bold; color: #64748B; text-transform: uppercase; }
        .summary-card .val { font-size: 10px; font-weight: 900; font-family: monospace; color: #0F172A; margin-top: 2px; }
        .signatures {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 25px;
          page-break-inside: avoid;
        }
        .sig-block {
          border-top: 1px solid #475569;
          text-align: center;
          padding-top: 4px;
          font-size: 8.5px;
        }
        .no-print { text-align: center; margin-top: 15px; margin-bottom: 10px; }
        .btn-print {
          background: #1E3A8A;
          color: #fff;
          border: none;
          padding: 8px 18px;
          font-size: 12px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
        }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company-name">${(window as any).esc(company.name)}</div>
          <div style="font-size:9px;color:#475569">NIT: ${(window as any).esc(company.nit)} | ${(window as any).esc(company.address)} ${company.phone ? '| Tel: ' + (window as any).esc(company.phone) : ''}</div>
          <div class="doc-title">DOSSIER OFICIAL DE LIQUIDACIÓN DE IMPORTACIÓN Y COSTOS ADUANEROS</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:8px;color:#64748B;font-weight:bold;text-transform:uppercase">Importación Nro.</div>
          <div style="font-size:16px;font-weight:900;font-family:monospace;color:#1E3A8A">${(window as any).esc(imp.number)}</div>
          <div style="font-size:8.5px;color:#334155;font-weight:bold;margin-top:2px">Estado: ${imp.status.toUpperCase()}</div>
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-grid">
          <div><div class="meta-label">Fecha Liquidación:</div><div class="meta-val">${imp.date ? imp.date.split(' ')[0] : '—'}</div></div>
          <div><div class="meta-label">Tasa TRM Oficial:</div><div class="meta-val font-mono">$ ${(window as any).fmtN(imp.exchange_rate)}</div></div>
          <div><div class="meta-label">Incoterm / Moneda:</div><div class="meta-val">${(window as any).esc(imp.incoterm || 'FOB')} (${(window as any).esc(imp.currency)})</div></div>
          <div><div class="meta-label">Modalidad:</div><div class="meta-val">${imp.is_consolidated ? 'Consolidada (Multi-Prov)' : 'Directa'}</div></div>
          <div><div class="meta-label">Bodega Destino:</div><div class="meta-val">${(window as any).esc(destinationWarehouse)}</div></div>
          <div><div class="meta-label">Comprobante Contable:</div><div class="meta-val font-mono">${capTx ? (window as any).esc(capTx.number) : 'Pendiente Cierre'}</div></div>
          <div><div class="meta-label">Peso Bruto / Volumen:</div><div class="meta-val font-mono">${summary.totalGrossKg.toFixed(2)} Kg / ${summary.totalCbm.toFixed(3)} m³</div></div>
          <div><div class="meta-label">Total Unidades:</div><div class="meta-val font-mono">${(window as any).fmtN(summary.totalUnits)}</div></div>
        </div>
      </div>

      <div class="section-title">1. Estructura Landed Cost (6 Etapas de Liquidación en COP)</div>
      <div class="summary-box">
        <div class="summary-card"><div class="label">1. FOB (COP)</div><div class="val">${(window as any).fmt(summary.fobCop)}</div></div>
        <div class="summary-card"><div class="label">2. Fletes Int.</div><div class="val">${(window as any).fmt(summary.freightCop)}</div></div>
        <div class="summary-card"><div class="label">3. Seguros Int.</div><div class="val">${(window as any).fmt(summary.insuranceCop)}</div></div>
        <div class="summary-card"><div class="label">Subtotal CIF</div><div class="val" style="color:#1D4ED8">${(window as any).fmt(summary.cifCop)}</div></div>
        <div class="summary-card"><div class="label">4. Aranceles DIAN</div><div class="val" style="color:#B45309">${(window as any).fmt(summary.arancelCop)}</div></div>
        <div class="summary-card"><div class="label">5. Gastos Log/Port</div><div class="val">${(window as any).fmt(summary.otherCostsCop)}</div></div>
      </div>
      <div style="background:#F1F5F9;padding:6px 10px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-weight:bold;text-transform:uppercase;font-size:9.5px;color:#1E293B">Total Costo Nacionalizado Capitalizado en Bodega:</span>
        <span style="font-size:13px;font-weight:900;font-family:monospace;color:#1E3A8A">${(window as any).fmt(summary.grandTotalCop)}</span>
      </div>

      <div class="section-title">2. Matriz Detallada de Mercancías Importadas y Prorrateo Landed Cost</div>
      <table>
        <thead>
          <tr>
            <th style="width:20px;text-align:center">#</th>
            <th>Producto & Clasificación NANDINA</th>
            <th style="text-align:right">Cant & Unidad</th>
            <th style="text-align:right">FOB Unit (${imp.currency})</th>
            <th style="text-align:right">Total FOB (${imp.currency})</th>
            <th style="text-align:right">Arancel %</th>
            <th style="text-align:right">Prorrateo COP</th>
            <th style="text-align:right">Costo Unit COP</th>
            <th style="text-align:right">Total Costo COP</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      ${consolidatedSection}

      <div class="section-title">4. Certificación Legal y Aprobaciones de Auditoría</div>
      <div style="font-size:8.5px;color:#64748B;margin-bottom:12px">
        El presente dossier consolida los soportes aduaneros, prorrateos logísticos y registros contables bajo el marco regulatorio tributario y aduanero aplicable.
      </div>

      <div class="signatures">
        <div class="sig-block">
          <div style="font-weight:bold;color:#0F172A">RESPONSABLE COMEX / COMPRAS</div>
          <div style="color:#64748B">Elaboración Técnica y Logística</div>
        </div>
        <div class="sig-block">
          <div style="font-weight:bold;color:#0F172A">CONTADOR PÚBLICO / REVISOR FISCAL</div>
          <div style="color:#64748B">T.P. Nro: _________________________</div>
        </div>
        <div class="sig-block">
          <div style="font-weight:bold;color:#0F172A">REPRESENTANTE LEGAL / GERENCIA</div>
          <div style="color:#64748B">Aprobación Final de Capitalización</div>
        </div>
      </div>

      <div class="no-print">
        <button class="btn-print" onclick="window.print()">Imprimir / Guardar como PDF</button>
      </div>
    </body>
    </html>
  `;
}

(window as any).openImportExecutiveReport = openImportExecutiveReport;
