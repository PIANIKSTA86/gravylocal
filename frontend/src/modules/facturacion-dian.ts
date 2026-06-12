/**
 * GRAVY v2.0 ? facturacion-dian.js
 */
'use strict';

async function renderFacturacionDIAN(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando facturaci?n DIAN...</div>`;
  try {
    const loadErrors = [];
    const docs = await pb.listAll('einvoice_docs', { sort: '-created', expand: 'tx_id' }).catch((err) => {
      loadErrors.push(`documentos: ${err.message}`);
      return [];
    });
    const tx = await pb.listAll('transactions', { sort: '-date,-created', filter: 'status="active"', expand: 'tx_type_id,third_party_id' }).catch((err) => {
      loadErrors.push(`transacciones: ${err.message}`);
      return [];
    });

    const statusInfo = {
      pendiente: { cls: 'badge-orange', icon: 'fa-clock', label: 'Pendiente' },
      enviada:   { cls: 'badge-blue',   icon: 'fa-paper-plane', label: 'Enviada' },
      aceptada:  { cls: 'badge-green',  icon: 'fa-circle-check', label: 'Aceptada' },
      rechazada: { cls: 'badge-red',    icon: 'fa-circle-xmark', label: 'Rechazada' },
    };
    const si = s => statusInfo[s] || statusInfo.pendiente;

    // KPI counts
    const counts = { pendiente: 0, enviada: 0, aceptada: 0, rechazada: 0 };
    docs.forEach(d => { const s = d.status || 'pendiente'; if (counts[s] !== undefined) counts[s]++; });

    const noTx = tx.length === 0;

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Facturaci?n Electr?nica DIAN</h3>
          <p class="text-sm" style="color:#6B7280">Gesti?n de estado documental y trazabilidad CUFE.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-dian"><i class="fas fa-plus"></i> Nuevo Documento DIAN</button>' : ''}
      </div>

      ${loadErrors.length ? `<div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
        <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
        <p class="text-sm" style="color:#6B7280">${esc(loadErrors.join(' | '))}</p>
      </div>` : ''}

      ${noTx ? `<div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>No hay transacciones activas para facturar</p>
            <p class="text-sm" style="color:#6B7280">Crea primero un comprobante en Nueva transaccion o usa uno existente activo.</p>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-go-nueva-tx"><i class="fas fa-file-circle-plus"></i> Ir a Nueva transaccion</button>
        </div>
      </div>` : ''}

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${[['pendiente','#FFF8F0','#C46516'],['enviada','#EFF6FF','#1D4ED8'],['aceptada','#F0FFF4','#15803D'],['rechazada','#FEF2F2','#B91C1C']].map(([s,bg,color]) => `
          <div class="rounded-2xl p-4 cursor-pointer dian-kpi" data-status="${s}" style="background:${bg};border:2px solid transparent" onclick="filterDianByStatus('${s}')">
            <div class="text-xs font-medium mb-1" style="color:${color}">${si(s).label}</div>
            <div class="text-2xl font-bold" style="color:${color}">${counts[s]}</div>
          </div>`).join('')}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="dian-q" class="form-input flex-1 min-w-48" placeholder="Buscar comprobante, CUFE, respuesta...">
          <select id="dian-status-filter" class="form-input" style="max-width:200px">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviada">Enviada</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <button class="btn btn-outline btn-sm" id="btn-dian-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="dian-table">
            <thead><tr><th>Comprobante</th><th>Tercero</th><th>CUFE</th><th>Estado</th><th>Respuesta DIAN</th><th>Enviado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${docs.length ? docs.map(d => {
                const s = d.status || 'pendiente';
                const info = si(s);
                const txRef = d.expand?.tx_id;
                return `<tr data-status="${s}">
                  <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(txRef?.number || '?')}</span></td>
                  <td>${esc(txRef?.expand?.third_party_id?.name || '?')}</td>
                  <td class="font-mono text-xs max-w-xs truncate" title="${esc(d.cufe||'')}">${d.cufe ? esc(d.cufe.slice(0,20))+'?' : '?'}</td>
                  <td><span class="badge ${info.cls}"><i class="fas ${info.icon} mr-1"></i>${info.label}</span></td>
                  <td class="text-sm max-w-xs truncate" title="${esc(d.dian_response||'')}">${esc(d.dian_response || '?')}</td>
                  <td>${esc(d.sent_at ? fmtDate(d.sent_at) : '?')}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewDianDetail('${esc(d.id)}')"><i class="fas fa-eye"></i></button>
                      ${can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Editar" onclick="editDianDoc('${esc(d.id)}')"><i class="fas fa-pen"></i></button>` : ''}
                      ${can('canWrite') && (s === 'pendiente' || s === 'rechazada') ? `<button class="btn btn-secondary btn-sm" title="Enviar a DIAN" onclick="window.emitDianDocFromList('${esc(d.id)}','${esc(d.tx_id)}')"><i class="fas fa-paper-plane mr-1"></i> Enviar</button>` : ''}
                      ${can('canWrite') && s === 'enviada' && d.ftech_transaction_id ? `<button class="btn btn-sm btn-info text-white bg-blue-500 hover:bg-blue-600" title="Consultar Estado Facturatech" onclick="window.checkFtechStatus('${esc(d.id)}','${esc(d.tx_id)}')"><i class="fas fa-arrows-rotate mr-1"></i> Consultar</button>` : ''}
                    </div>
                  </td>
                </tr>`;
              }).join('') : '<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay documentos DIAN registrados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;

    const applyDianFilter = () => {
      const q = getInputVal('dian-q').toLowerCase();
      const sf = getSelectVal('dian-status-filter');
      $$('#dian-table tbody tr[data-status]').forEach(tr => {
        const okQ = !q || tr.textContent.toLowerCase().includes(q);
        const okS = !sf || tr.dataset.status === sf;
        tr.style.display = okQ && okS ? '' : 'none';
      });
    };
    $('#dian-q')?.addEventListener('input', debounce(applyDianFilter, 150));
    $('#dian-status-filter')?.addEventListener('change', applyDianFilter);
    $('#btn-dian-clear')?.addEventListener('click', () => {
      setInputVal('dian-q', '');
      const el = $('#dian-status-filter'); if (el) el.value = '';
      $$('#dian-table tbody tr[data-status]').forEach(tr => tr.style.display = '');
      $$('.dian-kpi').forEach(k => k.style.borderColor = 'transparent');
    });
    $('#btn-new-dian')?.addEventListener('click', () => openDianForm(tx));
    $('#btn-go-nueva-tx')?.addEventListener('click', () => navigate('nueva-tx'));
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function filterDianByStatus(status) {
  const el = $('#dian-status-filter');
  if (el) { el.value = status; el.dispatchEvent(new Event('change')); }
  $$('.dian-kpi').forEach(k => k.style.borderColor = k.dataset.status === status ? '#E87D1E' : 'transparent');
}

async function viewDianDetail(id) {
  try {
    const d = await pb.get('einvoice_docs', id, { expand: 'tx_id' });
    const txRef = d.expand?.tx_id;
    const statusInfo = {
      pendiente: { cls: 'badge-orange', label: 'Pendiente' },
      enviada:   { cls: 'badge-blue',   label: 'Enviada'   },
      aceptada:  { cls: 'badge-green',  label: 'Aceptada'  },
      rechazada: { cls: 'badge-red',    label: 'Rechazada' },
    };
    const si = statusInfo[d.status || 'pendiente'] || statusInfo.pendiente;

    // Build simulated XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Documento Electr?nico DIAN - GRAVY v2 (Simulaci?n) -->
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <UBLVersionID>UBL 2.1</UBLVersionID>
  <ID>${esc(txRef?.number || 'N/A')}</ID>
  <IssueDate>${esc((d.sent_at || '').slice(0,10) || '?')}</IssueDate>
  <CUFE>${esc(d.cufe || 'Pendiente de generaci?n')}</CUFE>
  <InvoiceTypeCode>01</InvoiceTypeCode>
  <Note>${esc(d.dian_response || '')}</Note>
</Invoice>`;

    openModal(
      `Documento DIAN ? ${esc(txRef?.number || id)}`,
      `<div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div><span class="form-label">Comprobante</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(txRef?.number || '?')}</p></div>
          <div><span class="form-label">Estado</span><p><span class="badge ${si.cls}">${si.label}</span></p></div>
          <div><span class="form-label">Fecha Env?o</span><p>${esc(d.sent_at ? fmtDate(d.sent_at) : 'No enviado')}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label">CUFE</span><p class="font-mono text-xs break-all p-2 rounded" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(d.cufe || 'Pendiente de generaci?n')}</p></div>
          <div class="col-span-2 md:col-span-3"><span class="form-label">Respuesta DIAN</span><p class="p-2 rounded text-sm" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(d.dian_response || '?')}</p></div>
        </div>
        <div>
          <span class="form-label">Contenido XML (Firmado / UBL 2.1)</span>
          <textarea readonly class="form-input font-mono text-xs mt-1" rows="12" style="resize:vertical">${esc(d.xml_content || xmlContent)}</textarea>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

function generateMockCufe(txId, dateStr) {
  const seed = `${txId}|${dateStr}|${Date.now()}`;
  try {
    return btoa(seed).replace(/[^A-Za-z0-9]/g, '').slice(0, 64).padEnd(64, '0');
  } catch {
    return `CUFE${Date.now()}${txId}`.slice(0, 64);
  }
}

window.checkFtechStatus = async function(id, txId) {
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
      renderFacturacionDIAN($('#page-content'));
    } else {
      showToast(`Error al consultar: ${res.dianResponse || 'Respuesta desconocida'}`, 'error');
    }
  } catch (err: any) {
    showToast(err.message || 'Error en comunicación con Facturatech', 'error');
  }
};

window.emitDianDocFromList = async function(id, txId) {
  if (!txId) {
    showToast('No hay una transacción vinculada a este documento.', 'warning');
    return;
  }
  confirmDialog('Emitir Documento a DIAN', '¿Confirmas el envío y firmado digital de este documento contable ante la DIAN?', async () => {
    try {
      showToast('Transmitiendo a la DIAN...', 'info');
      const res = await pb.send('/api/dian/emit', {
        method: 'POST',
        body: JSON.stringify({ txId: txId }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res && res.success) {
        showToast(`Documento emitido correctamente. Estado: ${res.status}. ${res.simulated ? '(MODO SIMULADO)' : ''}`, 'success');
        renderFacturacionDIAN($('#page-content'));
      } else {
        showToast(`Error al emitir: ${res.dianResponse || 'Respuesta desconocida'}`, 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error en comunicación con la DIAN', 'error');
    }
  });
};

function openDianForm(transactions, row = null) {
  if (!row && (!transactions || !transactions.length)) {
    return showToast('No hay transacciones activas disponibles para asociar al documento DIAN', 'warning');
  }

  openModal(
    row ? 'Editar Documento DIAN' : 'Nuevo Documento DIAN',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Transacci?n Contable</label>
        <select id="df-tx" class="form-input" ${row ? 'disabled' : ''}>
          <option value="">Seleccione transacci?n...</option>
          ${transactions.map(t => `<option value="${esc(t.id)}" ${row?.tx_id === t.id ? 'selected' : ''}>${esc(t.number)} ? ${esc(t.expand?.tx_type_id?.name || '')} | ${esc(t.expand?.third_party_id?.name || 'Sin tercero')}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Estado</label>
        <select id="df-status" class="form-input" ${row?.status === 'aceptada' || row?.status === 'rechazada' ? 'disabled' : ''}>
          ${['pendiente','enviada','aceptada','rechazada'].map(s => `<option value="${s}" ${(row?.status || 'pendiente') === s ? 'selected' : ''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Fecha Env?o</label><input id="df-sent" type="date" class="form-input" value="${esc((row?.sent_at || '').slice(0, 10))}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">CUFE</label><input id="df-cufe" class="form-input font-mono text-xs" placeholder="Se genera autom?ticamente al enviar" value="${esc(row?.cufe || '')}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Respuesta DIAN</label><textarea id="df-resp" class="form-input" rows="3">${esc(row?.dian_response || '')}</textarea></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-dian">Guardar</button>`
  );
  $('#btn-save-dian')?.addEventListener('click', async () => {
    const btn = $('#btn-save-dian');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    try {
      const payload = {
        tx_id: row?.tx_id || getSelectVal('df-tx'),
        cufe: getInputVal('df-cufe'),
        status: getSelectVal('df-status') || row?.status || 'pendiente',
        dian_response: getInputVal('df-resp'),
        sent_at: getInputVal('df-sent') || '',
      };
      if (!payload.tx_id) return showToast('Selecciona una transacci?n', 'warning');

      // Evitar duplicados por transaccion
      if (!row?.id) {
        const existing = await pb.list('einvoice_docs', { filter: `tx_id="${payload.tx_id}"`, perPage: 1 });
        if (existing.items?.length) {
          return showToast('Esta transaccion ya tiene documento DIAN asociado. Usa editar.', 'warning');
        }
      }

      if (row?.id) {
        await pb.update('einvoice_docs', row.id, payload);
      } else {
        const created = await pb.create('einvoice_docs', payload);
      }
      closeModal();
      showToast('Documento DIAN guardado', 'success');
      renderFacturacionDIAN($('#page-content'));
    } catch (err) {
      const details = err?.data?.data
        ? Object.values(err.data.data).map(v => v?.message).filter(Boolean).join(' | ')
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

async function editDianDoc(id) {
  try {
    const [row, tx] = await Promise.all([
      pb.get('einvoice_docs', id),
      pb.listAll('transactions', { sort: '-date,-created', filter: 'status="active"', expand: 'tx_type_id,third_party_id' }),
    ]);
    openDianForm(tx, row);
  } catch (err) { showToast(err.message, 'error'); }
}


// --- VITE MIGRATION GLOBALS ---
(window as any).checkFtechStatus = window.checkFtechStatus;
(window as any).emitDianDocFromList = window.emitDianDocFromList;
(window as any).filterDianByStatus = filterDianByStatus;
(window as any).generateMockCufe = generateMockCufe;
(window as any).viewDianDetail = viewDianDetail;
(window as any).editDianDoc = editDianDoc;
(window as any).openDianForm = openDianForm;
(window as any).renderFacturacionDIAN = renderFacturacionDIAN;
