/**
 * GRAVY v2.0 – facturacion-dian.ts
 */
'use strict';

// Declare external globals to satisfy TS compiler if needed
declare var pb: any;
declare var esc: (val: any) => string;
declare var can: (perm: string) => boolean;
declare var showToast: (msg: string, type?: string) => void;
declare var confirmDialog: (title: string, msg: string, callback: () => void) => void;
declare var openModal: (title: string, body: string, footer: string, large?: boolean) => void;
declare var closeModal: () => void;
declare var fmtDate: (dateStr: string) => string;
declare var navigate: (page: string) => void;
declare var getInputVal: (id: string) => string;
declare var getSelectVal: (id: string) => string;
declare var setInputVal: (id: string, val: string) => void;
declare var $: (selector: string) => HTMLElement | null;
declare var $$: (selector: string) => NodeListOf<HTMLElement>;
declare var debounce: (fn: Function, ms: number) => any;

async function renderFacturacionDIAN(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando facturación DIAN...</div>`;
  try {
    const loadErrors: string[] = [];
    
    // Fetch all required tables in parallel
    const [resolutions, docs, txs, invoices, purchases] = await Promise.all([
      pb.listAll('dian_resolutions', { filter: 'active=true' }).catch((err: any) => { loadErrors.push(`resoluciones: ${err.message}`); return []; }),
      pb.listAll('einvoice_docs', { sort: '-id' }).catch((err: any) => { loadErrors.push(`documentos: ${err.message}`); return []; }),
      pb.listAll('transactions', { sort: '-date,-id', filter: 'status="active"', expand: 'tx_type_id,third_party_id' }).catch((err: any) => { loadErrors.push(`transacciones: ${err.message}`); return []; }),
      pb.listAll('invoices', { fields: 'id,tx_id,total' }).catch((err: any) => { loadErrors.push(`facturas: ${err.message}`); return []; }),
      pb.listAll('purchase_invoices', { fields: 'id,tx_id,total' }).catch((err: any) => { loadErrors.push(`compras: ${err.message}`); return []; })
    ]);

    // Create maps for quick lookup
    const totalMap = new Map<string, number>();
    const invoiceIdMap = new Map<string, string>();
    invoices.forEach((i: any) => { if (i.tx_id) { totalMap.set(i.tx_id, i.total); invoiceIdMap.set(i.tx_id, i.id); } });
    purchases.forEach((p: any) => { if (p.tx_id) { totalMap.set(p.tx_id, p.total); invoiceIdMap.set(p.tx_id, p.id); } });

    // Map docRecord by tx_id
    const docMap = new Map<string, any>();
    docs.forEach((d: any) => { if (d.tx_id) docMap.set(d.tx_id, d); });

    // Get active resolutions prefixes and docTypes
    const activePrefixes = new Set(resolutions.map((r: any) => String(r.prefix || '').toUpperCase()));
    const activeDocTypes = new Set(resolutions.map((r: any) => String(r.document_type || '').toUpperCase()));

    // Filter transactions to only those matching DIAN Resolutions
    const signableTxs = txs.filter((t: any) => {
      const prefix = String(t.expand?.tx_type_id?.prefix || '').toUpperCase();
      const code = String(t.expand?.tx_type_id?.code || '').toUpperCase();
      return activePrefixes.has(prefix) || activeDocTypes.has(code);
    });

    const statusInfo: Record<string, { cls: string; icon: string; label: string }> = {
      pendiente: { cls: 'badge-orange', icon: 'fa-clock', label: 'Pendiente' },
      enviada:   { cls: 'badge-blue',   icon: 'fa-paper-plane', label: 'Enviada' },
      aceptada:  { cls: 'badge-green',  icon: 'fa-circle-check', label: 'Aceptada' },
      rechazada: { cls: 'badge-red',    icon: 'fa-circle-xmark', label: 'Rechazada' },
    };
    const si = (s: string) => statusInfo[s] || statusInfo.pendiente;

    // Map each signable transaction to its full display representation
    const items = signableTxs.map((t: any) => {
      const doc = docMap.get(t.id);
      const status = doc?.status || 'pendiente';
      const prefix = String(t.expand?.tx_type_id?.prefix || '').toUpperCase();
      return {
        tx: t,
        doc: doc,
        id: doc?.id || '',
        number: t.number || '',
        date: t.date || '',
        thirdPartyName: t.expand?.third_party_id?.name || 'Consumidor Final',
        total: totalMap.has(t.id) ? totalMap.get(t.id) : (t.cross_amount || 0),
        status: status,
        cufe: doc?.cufe || '',
        dianResponse: doc?.dian_response || '',
        xmlContent: doc?.xml_content || '',
        sentAt: doc?.sent_at || '',
        ftechTransactionId: doc?.ftech_transaction_id || '',
        prefix: prefix,
        docType: String(t.expand?.tx_type_id?.code || '').toUpperCase()
      };
    });

    // Extract unique periods (YYYY-MM) from transaction dates
    const periods = Array.from(new Set(items.map(item => (item.date || '').slice(0, 7)))).filter(Boolean).sort().reverse();
    const activePrefixFilters = Array.from(new Set(items.map(item => item.prefix))).filter(Boolean).sort();

    // Default current month if exists
    const currentMonth = new Date().toISOString().slice(0, 7);
    const defaultPeriod = periods.includes(currentMonth) ? currentMonth : (periods[0] || '');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Facturación Electrónica DIAN</h3>
          <p class="text-sm" style="color:#6B7280">Panel interactivo de consulta, firma y trazabilidad documental.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-dian"><i class="fas fa-plus"></i> Cargar Manual</button>' : ''}
      </div>

      ${loadErrors.length ? `<div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
        <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
        <p class="text-sm" style="color:#6B7280">${esc(loadErrors.join(' | '))}</p>
      </div>` : ''}

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" id="dian-kpis-container">
        <!-- Rendered dynamically on period filter changes -->
      </div>

      <!-- Filters panel -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-48">
            <input id="dian-q" class="form-input w-full" placeholder="Buscar número de documento, tercero o CUFE...">
          </div>
          
          <div class="w-48">
            <select id="dian-period-filter" class="form-input w-full">
              <option value="">Todos los periodos</option>
              ${periods.map(p => `<option value="${p}" ${p === defaultPeriod ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>

          <div class="w-44">
            <select id="dian-prefix-filter" class="form-input w-full">
              <option value="">Todos los prefijos</option>
              ${activePrefixFilters.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
          </div>

          <div class="w-44">
            <select id="dian-status-filter" class="form-input w-full">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviada">Enviada</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          
          <button class="btn btn-outline btn-sm" id="btn-dian-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <!-- Grid container -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="dian-table">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Fecha</th>
                <th>Tercero</th>
                <th class="text-right">Total</th>
                <th>CUFE / CUDE</th>
                <th>Estado</th>
                <th>Respuesta DIAN</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="dian-table-body">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>`;

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
    };

    const renderGridAndKPIs = () => {
      const q = getInputVal('dian-q').toLowerCase();
      const period = getSelectVal('dian-period-filter');
      const prefix = getSelectVal('dian-prefix-filter');
      const status = getSelectVal('dian-status-filter');

      // Filter the items list
      const filtered = items.filter(item => {
        const okQ = !q || item.number.toLowerCase().includes(q) || item.thirdPartyName.toLowerCase().includes(q) || item.cufe.toLowerCase().includes(q);
        const okPeriod = !period || (item.date || '').startsWith(period);
        const okPrefix = !prefix || item.prefix === prefix;
        const okStatus = !status || item.status === status;
        return okQ && okPeriod && okPrefix && okStatus;
      });

      // Update KPI counters based on current filters (except the status filter itself so they show general breakdown)
      const kpiItems = items.filter(item => {
        const okQ = !q || item.number.toLowerCase().includes(q) || item.thirdPartyName.toLowerCase().includes(q) || item.cufe.toLowerCase().includes(q);
        const okPeriod = !period || (item.date || '').startsWith(period);
        const okPrefix = !prefix || item.prefix === prefix;
        return okQ && okPeriod && okPrefix;
      });

      const counts = { pendiente: 0, enviada: 0, aceptada: 0, rechazada: 0 };
      kpiItems.forEach(item => {
        if (counts[item.status] !== undefined) counts[item.status]++;
      });

      const kpisContainer = $('#dian-kpis-container');
      if (kpisContainer) {
        kpisContainer.innerHTML = [
          ['pendiente', '#FFF8F0', '#C46516', counts.pendiente],
          ['enviada', '#EFF6FF', '#1D4ED8', counts.enviada],
          ['aceptada', '#F0FFF4', '#15803D', counts.aceptada],
          ['rechazada', '#FEF2F2', '#B91C1C', counts.rechazada]
        ].map(([s, bg, color, val]) => `
          <div class="rounded-2xl p-4 cursor-pointer dian-kpi" data-status="${s}" onclick="window.filterDianByStatus('${s}')" style="background:${bg};border:2px solid ${status === s ? '#E87D1E' : 'transparent'}">
            <div class="text-xs font-medium mb-1" style="color:${color}">${si(String(s)).label}</div>
            <div class="text-2xl font-bold" style="color:${color}">${val}</div>
          </div>
        `).join('');
      }

      // Render Table Rows
      const tableBody = $('#dian-table-body');
      if (tableBody) {
        if (filtered.length) {
          tableBody.innerHTML = filtered.map(item => {
            const info = si(item.status);
            const truncatedCufe = item.cufe ? item.cufe.slice(0, 16) + '...' : '—';
            const mappedInvId = invoiceIdMap.get(item.tx.id) || '';
            
            // Actions logic
            const canEmit = can('canWrite') && (item.status === 'pendiente' || item.status === 'rechazada');
            const canCheck = can('canWrite') && item.status === 'enviada' && item.ftechTransactionId;
            const canDownload = item.status === 'aceptada' || item.status === 'enviada';
            const canResend = item.status === 'aceptada';
            const canCreditNote = can('canWrite') && item.status === 'aceptada' && (item.docType === 'POS' || item.docType === 'FV');

            return `
              <tr data-status="${item.status}">
                <td>
                  <span class="font-mono font-semibold text-sm block" style="color:#1A4B8C">${esc(item.number)}</span>
                  <span class="text-[10px] text-gray-400 font-medium tracking-wider uppercase block mt-0.5">${esc(item.prefix || 'DOC')}</span>
                </td>
                <td class="text-sm">${esc(item.date)}</td>
                <td class="text-sm font-medium text-gray-700">${esc(item.thirdPartyName)}</td>
                <td class="text-sm text-right font-semibold text-gray-900">${formatCurrency(item.total)}</td>
                <td class="font-mono text-xs max-w-xs truncate" title="${esc(item.cufe)}">${esc(truncatedCufe)}</td>
                <td><span class="badge ${info.cls}"><i class="fas ${info.icon} mr-1"></i>${info.label}</span></td>
                <td class="text-sm max-w-xs truncate text-gray-500" title="${esc(item.dianResponse)}">${esc(item.dianResponse || '—')}</td>
                <td>
                  <div class="flex items-center justify-center gap-1">
                    <button class="btn btn-outline btn-sm p-1.5" title="Ver Detalle" onclick="window.viewDianDetail('${esc(item.tx.id)}')"><i class="fas fa-eye text-gray-600"></i></button>
                    
                    ${canEmit ? `<button class="btn btn-outline btn-sm p-1.5 border-orange-500 hover:bg-orange-50" title="Solicitar Firma DIAN" onclick="window.emitDianDocFromList('${esc(item.id)}','${esc(item.tx.id)}','${esc(item.number)}')"><i class="fas fa-paper-plane text-orange-600"></i></button>` : ''}
                    
                    ${canCheck ? `<button class="btn btn-outline btn-sm p-1.5 border-blue-500 hover:bg-blue-50" title="Consultar Estado Facturatech" onclick="window.checkFtechStatus('${esc(item.id)}','${esc(item.tx.id)}')"><i class="fas fa-arrows-rotate text-blue-600"></i></button>` : ''}
                    
                    ${canDownload ? `<button class="btn btn-outline btn-sm p-1.5 border-emerald-500 hover:bg-emerald-50" title="Descargar ZIP XML" onclick="window.downloadDianZip('${esc(item.tx.id)}','${esc(item.number)}', \`${esc(item.xmlContent)}\`)"><i class="fas fa-file-zipper text-emerald-600"></i></button>` : ''}
                    
                    ${canResend ? `<button class="btn btn-outline btn-sm p-1.5 border-sky-500 hover:bg-sky-50" title="Reenviar Correo Cliente" onclick="window.resendDianEmail('${esc(item.tx.id)}','${esc(item.number)}')"><i class="fas fa-envelope text-sky-600"></i></button>` : ''}
                    
                    ${canCreditNote ? `<button class="btn btn-outline btn-sm p-1.5 border-purple-500 hover:bg-purple-50" title="Crear Nota de Ajuste / Devolución" onclick="window.openSalesNotePreModal('${esc(mappedInvId)}','${esc(item.number)}')"><i class="fas fa-rotate-left text-purple-600"></i></button>` : ''}
                  </div>
                </td>
              </tr>`;
          }).join('');
        } else {
          tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-gray-400"><i class="fas fa-folder-open block text-2xl mb-2"></i>No hay documentos electrónicos que coincidan con los filtros.</td></tr>`;
        }
      }
    };

    // Attach local events
    $('#dian-q')?.addEventListener('input', debounce(renderGridAndKPIs, 150));
    $('#dian-period-filter')?.addEventListener('change', renderGridAndKPIs);
    $('#dian-prefix-filter')?.addEventListener('change', renderGridAndKPIs);
    $('#dian-status-filter')?.addEventListener('change', renderGridAndKPIs);

    $('#btn-dian-clear')?.addEventListener('click', () => {
      setInputVal('dian-q', '');
      const ep = $('#dian-period-filter') as HTMLSelectElement; if (ep) ep.value = defaultPeriod;
      const ex = $('#dian-prefix-filter') as HTMLSelectElement; if (ex) ex.value = '';
      const es = $('#dian-status-filter') as HTMLSelectElement; if (es) es.value = '';
      renderGridAndKPIs();
    });

    $('#btn-new-dian')?.addEventListener('click', () => openDianForm(txs));

    // Expose helpers globally for events
    (window as any).filterDianByStatus = (statusVal: string) => {
      const es = $('#dian-status-filter') as HTMLSelectElement;
      if (es) {
        es.value = (es.value === statusVal) ? '' : statusVal; // toggle selection
        renderGridAndKPIs();
      }
    };

    // Initial render
    renderGridAndKPIs();

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error al cargar panel: ${esc(err.message)}</div>`;
  }
}

async function viewDianDetail(txId: string) {
  try {
    showToast('Cargando detalle...', 'info');
    // Fetch doc by txId
    const docs = await pb.listAll('einvoice_docs', { filter: `tx_id="${pb.escapeFilterValue(txId)}"` });
    if (!docs.length) {
      showToast('Este documento no tiene un registro electrónico de firma aún.', 'warning');
      return;
    }
    const d = docs[0];
    const tx = await pb.get('transactions', txId);
    
    const statusInfo: Record<string, { cls: string; label: string }> = {
      pendiente: { cls: 'badge-orange', label: 'Pendiente' },
      enviada:   { cls: 'badge-blue',   label: 'Enviada'   },
      aceptada:  { cls: 'badge-green',  label: 'Aceptada'  },
      rechazada: { cls: 'badge-red',    label: 'Rechazada' },
    };
    const si = statusInfo[d.status || 'pendiente'] || statusInfo.pendiente;

    const xmlContent = d.xml_content || `<?xml version="1.0" encoding="UTF-8"?>
<!-- Documento Electrónico DIAN - Sin XML firmado generado -->
<Invoice>
  <ID>${esc(tx.number)}</ID>
  <Note>Documento pendiente de firma digital o transmisión ante el hub.</Note>
</Invoice>`;

    openModal(
      `Detalle Electrónico — ${esc(tx.number)}`,
      `<div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><span class="form-label font-bold text-gray-500">Comprobante</span><p class="font-mono font-semibold text-blue-800">${esc(tx.number)}</p></div>
          <div><span class="form-label font-bold text-gray-500">Estado</span><p><span class="badge ${si.cls}">${si.label}</span></p></div>
          <div><span class="form-label font-bold text-gray-500">Fecha Envío</span><p>${esc(d.sent_at ? fmtDate(d.sent_at) : 'No enviado aún')}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label font-bold text-gray-500">CUFE / CUDE</span><p class="font-mono text-xs break-all p-2 rounded" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(d.cufe || 'Pendiente de generación')}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label font-bold text-gray-500">Respuesta Servidor DIAN</span><p class="p-2 rounded text-sm text-gray-600 font-medium" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(d.dian_response || '—')}</p></div>
        </div>
        <div>
          <span class="form-label font-bold text-gray-500">Contenido XML (Firmado / UBL 2.1)</span>
          <textarea readonly class="form-input font-mono text-xs mt-1 w-full" rows="12" style="resize:vertical;background:#F9FAFB">${esc(xmlContent)}</textarea>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

window.checkFtechStatus = async function(id: string, txId: string) {
  if (!txId) {
    showToast('No hay una transacción vinculada a este documento.', 'warning');
    return;
  }
  try {
    showToast('Consultando estado en Facturatech...', 'info');
    const res = await pb.send('/api/dian/check-status', {
      method: 'POST',
      body: JSON.stringify({ txId: txId }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res && res.success) {
      showToast(`Estado actualizado: ${res.status}. ${res.simulated ? '(MODO SIMULADO)' : ''}`, 'success');
      const container = $('#page-content');
      if (container) renderFacturacionDIAN(container);
    } else {
      showToast(`Error al consultar: ${res.dianResponse || 'Respuesta desconocida'}`, 'error');
    }
  } catch (err: any) {
    showToast(err.message || 'Error en comunicación con Facturatech', 'error');
  }
};

window.emitDianDocFromList = async function(id: string, txId: string, docNumber: string) {
  if (!txId) {
    showToast('No hay una transacción vinculada a este documento.', 'warning');
    return;
  }
  confirmDialog('Emitir Documento a DIAN', `¿Confirmas el firmado digital y envío del documento <strong>${esc(docNumber)}</strong> ante la DIAN?`, async () => {
    try {
      showToast('Transmitiendo a la DIAN...', 'info');
      const res = await pb.send('/api/dian/emit', {
        method: 'POST',
        body: JSON.stringify({ txId: txId }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res && res.success) {
        showToast(`Documento emitido correctamente. Estado: ${res.status}. ${res.simulated ? '(MODO SIMULADO)' : ''}`, 'success');
        const container = $('#page-content');
        if (container) renderFacturacionDIAN(container);
      } else {
        showToast(`Error al emitir: ${res.dianResponse || 'Respuesta de DIAN rechazada'}`, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error en comunicación con la DIAN', 'error');
    }
  });
};

(window as any).downloadDianZip = async function(txId: string, number: string, xmlContent: string) {
  if (!xmlContent || xmlContent.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<!-- Documento Electrónico DIAN - Sin XML')) {
    showToast('No hay XML firmado disponible para descargar.', 'warning');
    return;
  }
  try {
    showToast('Comprimiendo y descargando ZIP...', 'info');
    const res = await fetch('http://localhost:8088/api/dian/download-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xmlContent: xmlContent,
        filename: number
      })
    });
    if (!res.ok) throw new Error('El orquestador no pudo generar el ZIP');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${number}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo ZIP descargado exitosamente.', 'success');
  } catch (err: any) {
    showToast(err.message || 'Error al descargar el ZIP', 'error');
  }
};

(window as any).resendDianEmail = async function(txId: string, number: string) {
  try {
    showToast(`Reenviando correo del documento ${number}...`, 'info');
    const res = await pb.send('/api/dian/resend-email', {
      method: 'POST',
      body: JSON.stringify({ txId }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res && res.success) {
      showToast(res.message || 'Correo reenviado exitosamente.', 'success');
    } else {
      showToast(res.message || 'Error al reenviar correo.', 'error');
    }
  } catch (err: any) {
    showToast(err.message || 'Error al reenviar correo.', 'error');
  }
};

function openDianForm(transactions: any[], row: any = null) {
  if (!row && (!transactions || !transactions.length)) {
    return showToast('No hay transacciones activas disponibles para asociar al documento DIAN', 'warning');
  }

  openModal(
    row ? 'Editar Documento DIAN' : 'Nuevo Documento DIAN (Carga Manual)',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label font-bold text-gray-500">Transacción Contable</label>
        <select id="df-tx" class="form-input w-full" ${row ? 'disabled' : ''}>
          <option value="">Seleccione transacción...</option>
          ${transactions.map(t => `<option value="${esc(t.id)}" ${row?.tx_id === t.id ? 'selected' : ''}>${esc(t.number)} — ${esc(t.expand?.tx_type_id?.name || '')} | ${esc(t.expand?.third_party_id?.name || 'Sin tercero')}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label font-bold text-gray-500">Estado</label>
        <select id="df-status" class="form-input w-full" ${row?.status === 'aceptada' || row?.status === 'rechazada' ? 'disabled' : ''}>
          ${['pendiente','enviada','aceptada','rechazada'].map(s => `<option value="${s}" ${(row?.status || 'pendiente') === s ? 'selected' : ''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label font-bold text-gray-500">Fecha Envío</label><input id="df-sent" type="date" class="form-input w-full" value="${esc((row?.sent_at || '').slice(0, 10))}"></div>
      <div class="form-group md:col-span-2"><label class="form-label font-bold text-gray-500">CUFE / CUDE</label><input id="df-cufe" class="form-input font-mono text-xs w-full" placeholder="Se genera automáticamente al enviar" value="${esc(row?.cufe || '')}"></div>
      <div class="form-group md:col-span-2"><label class="form-label font-bold text-gray-500">Respuesta DIAN</label><textarea id="df-resp" class="form-input w-full" rows="3">${esc(row?.dian_response || '')}</textarea></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-dian">Guardar</button>`
  );
  $('#btn-save-dian')?.addEventListener('click', async () => {
    const btn = $('#btn-save-dian') as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    try {
      const payload: any = {
        tx_id: row?.tx_id || getSelectVal('df-tx'),
        cufe: getInputVal('df-cufe'),
        status: getSelectVal('df-status') || row?.status || 'pendiente',
        dian_response: getInputVal('df-resp'),
        sent_at: getInputVal('df-sent') || '',
      };
      if (!payload.tx_id) return showToast('Selecciona una transacción', 'warning');

      // Check duplicates
      if (!row?.id) {
        const existing = await pb.list('einvoice_docs', { filter: `tx_id="${payload.tx_id}"`, perPage: 1 });
        if (existing.items?.length) {
          return showToast('Esta transacción ya tiene documento DIAN asociado. Usa editar.', 'warning');
        }
      }

      if (row?.id) {
        await pb.update('einvoice_docs', row.id, payload);
      } else {
        await pb.create('einvoice_docs', payload);
      }
      closeModal();
      showToast('Documento DIAN guardado', 'success');
      const container = $('#page-content');
      if (container) renderFacturacionDIAN(container);
    } catch (err: any) {
      const details = err?.data?.data
        ? Object.values(err.data.data).map((v: any) => v?.message).filter(Boolean).join(' | ')
        : '';
      showToast(details || err.message || 'No se pudo guardar el documento DIAN', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Guardar';
      }
    }
  });
}

async function editDianDoc(id: string) {
  try {
    const [row, tx] = await Promise.all([
      pb.get('einvoice_docs', id),
      pb.listAll('transactions', { sort: '-date,-created', filter: 'status="active"', expand: 'tx_type_id,third_party_id' }),
    ]);
    openDianForm(tx, row);
  } catch (err: any) { showToast(err.message, 'error'); }
}

// Bind methods to window for Vite global compatibility
(window as any).checkFtechStatus = window.checkFtechStatus;
(window as any).emitDianDocFromList = window.emitDianDocFromList;
(window as any).viewDianDetail = viewDianDetail;
(window as any).editDianDoc = editDianDoc;
(window as any).openDianForm = openDianForm;
(window as any).renderFacturacionDIAN = renderFacturacionDIAN;
