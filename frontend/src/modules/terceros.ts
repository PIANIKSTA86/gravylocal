/**
 * GRAVY v2.0 — terceros.js (v2)
 * Maestro de Terceros: clientes, proveedores, empleados, acreedores y transportistas.
 */
'use strict';

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

declare var pb: any;
declare var can: any;
declare var esc: any;
declare var $: any;
declare var $$: any;
declare var showToast: any;
declare var openModal: any;
declare var closeModal: any;
declare var setInputVal: any;
declare var getSelectVal: any;
declare var GEO_DEPTS: any;
declare var GEO_MUNIS: any;
declare var geoMunisByDept: any;
declare var geoMuni: any;
declare var TP_TYPES: any;
declare var COL_DEPTS: any;
declare var PERSON_TYPES: any;

/* ═══════════════════════════════════════════════════════════
   LISTA / TABLA
═══════════════════════════════════════════════════════════ */
async function renderTerceros(c) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  c = getContainer(c);
  if (!c) return;
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando terceros...</div>`;
  try {
    const rows = await pb.listAll('third_parties', { sort: 'name' });

    // Mapa de resolución para Asesores Comerciales (ID -> Nombre legible)
    const tpMap = new Map<string, string>();
    rows.forEach((r: any) => {
      if (r.id) {
        const nameVal = r.name || [r.first_name, r.last_name].filter(Boolean).join(' ') || r.business_name || r.doc_number || r.id;
        tpMap.set(r.id, r.doc_number ? `${r.doc_number} - ${nameVal}` : nameVal);
      }
    });

    const personBadge = (pt) => {
      if (pt === 'JURIDICA') return '<span class="badge badge-blue"><i class="fas fa-building mr-1"></i>Jurídica</span>';
      return '<span class="badge badge-gray"><i class="fas fa-user mr-1"></i>Natural</span>';
    };
    const typeBadge = (t) => {
      const map = { CLIENTE:'badge-green', PROVEEDOR:'badge-blue', EMPLEADO:'badge-orange',
                    PROPIETARIO:'badge-gray', OTRO:'badge-gray' };
      const label = TP_TYPES.find(x => x.code === t)?.name ?? t;
      return `<span class="badge ${map[t] ?? 'badge-gray'}">${esc(label)}</span>`;
    };

    c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Terceros</h3>
        <p class="text-sm" style="color:#6B7280">Clientes, proveedores, empleados y más.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-outline" onclick="exportTercerosExcel()"><i class="fas fa-file-export mr-1.5"></i>Exportar Excel</button>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-tp"><i class="fas fa-user-plus mr-1.5"></i>Nuevo Tercero</button>' : ''}
      </div>
    </div>

    <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input id="tp-q" class="form-input" placeholder="Buscar por nombre, NIT o correo...">
        <select id="tp-person" class="form-input">
          <option value="">Todos los tipos de persona</option>
          ${PERSON_TYPES.map(p => `<option value="${esc(p.code)}">${esc(p.name)}</option>`).join('')}
        </select>
        <select id="tp-type" class="form-input">
          <option value="">Todos los roles</option>
          ${TP_TYPES.map(t => `<option value="${esc(t.code)}">${esc(t.name)}</option>`).join('')}
        </select>
        <select id="tp-status" class="form-input">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto" style="max-height: calc(100vh - 310px)">
        <table class="data-table" id="tp-table">
          <thead>
            <tr>
              <th>Persona</th><th>Documento</th><th>Nombre / Razón Social</th>
              <th>Correo</th><th>Ciudad</th><th>Rol</th><th>Asesor Comercial</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(r => {
              const resolvedAdvisor = r.advisor ? (tpMap.get(r.advisor) || r.advisor_name || r.advisor) : '—';
              return `
              <tr data-type="${esc(r.type)}" data-person="${esc(r.person_type||'NATURAL')}">
                <td>${personBadge(r.person_type)}</td>
                <td><span class="font-semibold">${esc(r.doc_type)} ${esc(r.doc_number)}${r.dv?`-${esc(r.dv)}`:''}</span></td>
                <td>${esc(r.name)}</td>
                <td>${esc(r.email||'—')}</td>
                <td>${esc(r.city||'—')}</td>
                <td>${typeBadge(r.type)}</td>
                <td>${r.advisor ? `<span class="badge badge-gray text-xs" style="white-space:nowrap" title="${esc(resolvedAdvisor)}"><i class="fas fa-user-tag mr-1" style="color:#0D9488"></i>${esc(resolvedAdvisor)}</span>` : '<span style="color:#9CA3AF">—</span>'}</td>
                <td>${r.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editTercero('${esc(r.id)}')" title="Editar"><i class="fas fa-pen"></i></button>` : ''}
                    ${can('canDelete') ? `
                      <button class="btn btn-outline btn-sm" onclick="toggleTercero('${esc(r.id)}', ${r.active?'false':'true'})" title="${r.active?'Inactivar':'Activar'}" style="color:#D97706;border-color:#F59E0B">
                        <i class="fas ${r.active?'fa-ban':'fa-rotate-left'}"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteTercero('${esc(r.id)}')" title="Eliminar permanentemente" style="background:#EF4444;border-color:#EF4444">
                        <i class="fas fa-trash-can"></i>
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('') :
              '<tr><td colspan="9" class="text-center py-10" style="color:#9CA3AF">No hay terceros registrados.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;

    const filter = () => {
      const q  = ($('#tp-q')?.value ?? '').toLowerCase();
      const pt = $('#tp-person')?.value ?? '';
      const t  = $('#tp-type')?.value ?? '';
      const s  = $('#tp-status')?.value ?? '';
      $$('#tp-table tbody tr').forEach(tr => {
        const active = tr.children[7]?.textContent.includes('Activo');
        tr.style.display = (
          (!q  || tr.textContent.toLowerCase().includes(q)) &&
          (!pt || (tr.dataset.person || '') === pt) &&
          (!t  || (tr.dataset.type  || '') === t) &&
          (!s  || (s === 'active' ? active : !active))
        ) ? '' : 'none';
      });
    };
    $('#tp-q')?.addEventListener('input', debounce(filter, 200));
    $('#tp-person')?.addEventListener('change', filter);
    $('#tp-type')?.addEventListener('change', filter);
    $('#tp-status')?.addEventListener('change', filter);
    $('#btn-new-tp')?.addEventListener('click', () => openTerceroForm());
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

/* ═══════════════════════════════════════════════════════════
   FORM HTML
═══════════════════════════════════════════════════════════ */
function terceroFormHtml(row) {
  const pt         = row?.person_type || 'NATURAL';
  const isNatural  = pt === 'NATURAL';
  const countryCode = row?.country || 'CO';
  const isColombia  = countryCode === 'CO';
  const deptCode    = row?.dept_code  || '';
  const deptName   = row?.department || '';
  const selDept    = COL_DEPTS.find(d => d.code === deptCode || d.name === deptName);

  const PTYPES = [
    { code: 'NATURAL',            label: 'Persona Natural',    icon: 'fa-user' },
    { code: 'JURIDICA',           label: 'Persona Jurídica',   icon: 'fa-building' },
  ];

  return /* html */`
  <!-- ── Pestañas Nav ─────────────────────────────────────────── -->
  <div id="tpf-tab-nav"
    style="display:flex;border-bottom:2px solid #E5E7EB;margin:-4px -4px 16px;overflow-x:auto">
    ${['Datos Básicos','Ubicación y Contacto','Tributario y Retenciones','Condiciones de Crédito','Notas'].map((label,i) => `
      <button type="button" id="tpf-tab-${i}" onclick="_tpfSwitchTab(${i})"
        style="padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;
               white-space:nowrap;margin-bottom:-2px;
               border-bottom:2px solid ${i===0?'#E87D1E':'transparent'};
               color:${i===0?'#E87D1E':'#6B7280'};font-weight:${i===0?'600':'400'}">
        ${label}
      </button>`).join('')}
  </div>

  <!-- ══ TAB 0 — Datos Básicos ══════════════════════════════════ -->
  <div id="tpf-panel-0">
    ${!row ? `
    <!-- ── Zona Drag & Drop RUT PDF ─────────────────────────── -->
    <div id="tpf-rut-dropzone" style="border: 2px dashed #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; transition: all 0.2s; margin-bottom: 16px;">
      <div style="font-size: 24px; color: #6366F1; margin-bottom: 6px;"><i class="fas fa-file-pdf"></i></div>
      <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 2px;">¿Tienes el RUT en PDF?</div>
      <div style="font-size: 11px; color: #64748B;">Arrastra tu archivo aquí o haz clic para autocompletar al instante (offline).</div>
      <input type="file" id="tpf-rut-file-input" accept="application/pdf" style="display: none;">
    </div>
    ` : ''}

    <!-- ── 1. Tipo de Persona ───────────────────────────────── -->
    <p class="form-label mb-2">Tipo de Persona <span style="color:#EF4444">*</span></p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${PTYPES.map(p => `
        <label style="display:flex;align-items:center;gap:8px;padding:10px 14px;
               border:2px solid ${pt===p.code?'#E87D1E':'#E5E7EB'};border-radius:10px;
               cursor:pointer;flex:1;min-width:130px;
               background:${pt===p.code?'#FFF7F0':'#FAFAFA'}">
          <input type="radio" name="tpf-person-type-r" value="${p.code}"
            ${pt===p.code?'checked':''} style="accent-color:#E87D1E">
          <i class="fas ${p.icon}"
            style="color:${pt===p.code?'#E87D1E':'#9CA3AF'};font-size:15px"></i>
          <span style="font-size:13px;font-weight:${pt===p.code?'600':'400'};
                       color:${pt===p.code?'#E87D1E':'#374151'}">${p.label}</span>
        </label>`).join('')}
    </div>

    <!-- ── 2. Nombre / Razón Social (cambia según tipo persona) -->
    <div id="tpf-section-natural" class="mb-4" style="${isNatural?'':'display:none'}">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Nombres <span style="color:#EF4444">*</span></label>
          <input id="tpf-first-name" class="form-input" value="${esc(row?.first_name||'')}"
            placeholder="JOSE ALVEIRO" style="text-transform:uppercase">
        </div>
        <div class="form-group">
          <label class="form-label">Apellidos <span style="color:#EF4444">*</span></label>
          <input id="tpf-last-name" class="form-input" value="${esc(row?.last_name||'')}"
            placeholder="GALLEGO PÉREZ" style="text-transform:uppercase">
        </div>
      </div>
    </div>

    <div id="tpf-section-juridica" class="mb-4" style="${isNatural?'display:none':''}">
      <div class="form-group">
        <label class="form-label">Razón Social <span style="color:#EF4444">*</span></label>
        <input id="tpf-business-name" class="form-input" value="${esc(row?.business_name||'')}"
          placeholder="CERAMICAS CONSTRUHOGAR S.A.S." style="text-transform:uppercase">
      </div>
    </div>

    <!-- ── 3. Nombre Comercial — siempre visible ────────────── -->
    <div class="form-group mb-4">
      <label class="form-label">
        Nombre Comercial
        <span style="font-size:11px;color:#9CA3AF;font-weight:400"> — como se conoce comercialmente</span>
      </label>
      <input id="tpf-commercial-name" class="form-input" value="${esc(row?.commercial_name||'')}"
        placeholder="Nombre o marca que usa ante clientes" style="text-transform:uppercase">
    </div>

    <!-- ── 4. Documento ─────────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="form-group md:col-span-5">
        <label class="form-label">Tipo de Documento <span style="color:#EF4444">*</span></label>
        <select id="tpf-doc-type" class="form-input">
          ${LOCAL_DOC_TYPES.map(d => `<option value="${esc(d.code)}" ${row?.doc_type===d.code?'selected':''}>${esc(d.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group ${row?.doc_type==='NIT'||row?.doc_type==='NITPE'?'md:col-span-5':'md:col-span-7'}" id="tpf-doc-number-wrap">
        <label class="form-label">Número de Documento <span style="color:#EF4444">*</span></label>
        <input id="tpf-doc-number" class="form-input" value="${esc(row?.doc_number||'')}"
          placeholder="Ej: 900123456" inputmode="numeric" pattern="[0-9]+" autocomplete="off">
      </div>
      <div class="form-group md:col-span-2" id="tpf-dv-wrap" style="${(row?.doc_type==='NIT'||row?.doc_type==='NITPE')?'':'display:none'}">
        <label class="form-label">DV</label>
        <input id="tpf-dv" class="form-input" value="${esc(row?.dv||'')}" readonly
          style="background:#F9FAFB;font-size:16px;font-weight:700;text-align:center;
                 color:#E87D1E;width:100%">
      </div>
    </div>

    <!-- ── 5. Rol, Estado y Actividad Económica ──────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
      <div class="form-group md:col-span-4">
        <label class="form-label">Tipo Tercero <span style="color:#EF4444">*</span></label>
        <select id="tpf-type" class="form-input">
          ${TP_TYPES.map(t => `<option value="${esc(t.code)}" ${row?.type===t.code?'selected':''}>${esc(t.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group md:col-span-3">
        <label class="form-label">Estado</label>
        <select id="tpf-active" class="form-input">
          <option value="1" ${row?.active!==false?'selected':''}>Activo</option>
          <option value="0" ${row?.active===false?'selected':''}>Inactivo</option>
        </select>
      </div>
      <div class="form-group md:col-span-5">
        <label class="form-label">Actividad Económica (CIIU) <span style="font-size:11px;color:#9CA3AF;font-weight:400">— opcional</span></label>
        <select id="tpf-ciiu" class="form-input">
          <option value="">Seleccionar actividad...</option>
          ${DIAN_CIIU.map(c => `<option value="${esc(c.c)}" ${row?.ciiu===c.c?'selected':''}>${esc(c.c)} — ${esc(c.l)}</option>`).join('')}
        </select>
      </div>
    </div>

  </div>

  <!-- ══ TAB 1 — Ubicación y Contacto ════════════════════════════ -->
  <div id="tpf-panel-1" style="display:none">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Ubicación -->
      <div class="form-group md:col-span-2">
        <label class="form-label">País</label>
        <select id="tpf-country" class="form-input">
          <option value="">Seleccionar país...</option>
          ${GEO_PAISES.map(p => `<option value="${esc(p.code)}" ${countryCode===p.code?'selected':''}>${esc(p.name.charAt(0)+p.name.slice(1).toLowerCase())}</option>`).join('')}
        </select>
      </div>

      <!-- Sección Colombia -->
      <div id="tpf-section-colombia" class="md:col-span-2" style="${isColombia?'':'display:none'}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Departamento -->
          <div class="form-group">
            <label class="form-label">Departamento <span style="color:#EF4444">*</span></label>
            <select id="tpf-dept-select" class="form-input">
              <option value="">Seleccionar departamento...</option>
              ${GEO_DEPTS.map(d => `<option value="${esc(d.code)}" ${selDept?.code===d.code?'selected':''}>${esc(d.name)}</option>`).join('')}
            </select>
          </div>
          <!-- Cód DANE Departamento -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Departamento</label>
            <input id="tpf-dept-code" class="form-input" value="${esc(selDept?.code||deptCode)}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-department" value="${esc(selDept?.name||deptName)}">

          <!-- Ciudad / Municipio -->
          <div class="form-group">
            <label class="form-label">Ciudad / Municipio <span style="color:#EF4444">*</span></label>
            <select id="tpf-city-select" class="form-input">
              <option value="">— seleccione departamento primero —</option>
              ${selDept ? geoMunisByDept(selDept.code).map(m => `<option value="${esc(m.code)}" ${row?.city_code===m.code?'selected':''}>${esc(m.name)}</option>`).join('') : ''}
            </select>
          </div>
          <!-- Cód DANE Municipio -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Municipio</label>
            <input id="tpf-city-code" class="form-input" value="${esc(row?.city_code||'')}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-city" value="${esc(row?.city||'')}">
        </div>
      </div>

      <div class="form-group md:col-span-2">
        <label class="form-label">Dirección</label>
        <input id="tpf-address" class="form-input" value="${esc(row?.address||'')}"
          placeholder="CR 8 73-25" style="text-transform:uppercase">
      </div>

      <!-- Contacto -->
      <div class="form-group">
        <label class="form-label">Nombre del Contacto</label>
        <input id="tpf-contact-name" class="form-input" value="${esc(row?.contact_name||'')}"
          placeholder="Persona de contacto en la empresa">
      </div>
      <div class="form-group">
        <label class="form-label">Asesor Comercial</label>
        <div id="tpf-advisor-wrap" class="relative">
          <input id="tpf-advisor-search" class="form-input" autocomplete="off"
            placeholder="Buscar vendedor por nombre o documento..."
            value="${esc(row?.advisor_name || row?.advisor || '')}">
          <input id="tpf-advisor" type="hidden" value="${esc(row?.advisor||'')}">
          <div id="tpf-advisor-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:30"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono 1</label>
        <input id="tpf-phone" class="form-input" value="${esc(row?.phone||'')}"
          placeholder="Fijo o móvil" inputmode="tel">
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono 2</label>
        <input id="tpf-phone2" class="form-input" value="${esc(row?.phone2||'')}"
          placeholder="Fijo o móvil alternativo" inputmode="tel">
      </div>
      <div class="form-group">
        <label class="form-label">Email Principal</label>
        <input id="tpf-email" type="email" class="form-input" value="${esc(row?.email||'')}"
          placeholder="correo@empresa.com">
      </div>
      <div class="form-group">
        <label class="form-label">Email Facturación Electrónica / Alternativo</label>
        <input id="tpf-email2" type="email" class="form-input" value="${esc(row?.email2||'')}"
          placeholder="correo.facturas@empresa.com">
      </div>
    </div>
  </div>

  <!-- ══ TAB 2 — Información Fiscal y Retenciones ════════════════ -->
  <div id="tpf-panel-2" style="display:none">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-3">
        <div class="form-group">
          <label class="form-label">Agente de Retención en la Fuente</label>
          <select id="tpf-rf" class="form-input">
            <option value="NO" ${row?.rf==='NO'?'selected':''}>No es agente de retención</option>
            <option value="SI" ${row?.rf==='SI'?'selected':''}>Si es agente de retención</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tarifa Retención Fuente (%)</label>
          <input id="tpf-prf" type="number" min="0" max="100" step="0.1" class="form-input"
            value="${esc(row?.prf ?? 0)}" placeholder="0.0">
        </div>
        <div class="form-group">
          <label class="form-label">Tarifa Retención ICA (%)</label>
          <input id="tpf-pi" type="number" min="0" max="100" step="0.1" class="form-input"
            value="${esc(row?.pi ?? 0)}" placeholder="0.0">
        </div>
        <div class="form-group">
          <label class="form-label">Tarifa Retención IVA (%)</label>
          <input id="tpf-piv" type="number" min="0" max="100" step="0.1" class="form-input"
            value="${esc(row?.piv ?? 0)}" placeholder="0.0">
        </div>
      </div>

      <div class="space-y-3">
        <div class="form-group">
          <label class="form-label">Responsabilidades Fiscales (DIAN)</label>
          <div class="border rounded-xl p-3 bg-white space-y-1.5 overflow-y-auto" style="max-height: 180px; border-color:#E5E7EB">
            ${DIAN_RESP.map(r => `
              <label class="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer py-0.5">
                <input type="checkbox" id="tpf-resp-${r.c}" value="${esc(r.c)}" class="tpf-resp-cb font-mono" style="accent-color:#E87D1E">
                <span><strong>${esc(r.c)}</strong> — ${esc(r.l)}</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-3 border rounded-xl p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors" style="border-color:#E5E7EB">
            <input type="checkbox" id="tpf-gcm" ${row?.gcm ? 'checked' : ''} style="accent-color:#E87D1E; width:16px; height:16px">
            <div>
              <div class="text-xs font-semibold text-gray-900">Gran Contribuyente Municipal</div>
            </div>
          </label>
          <label class="flex items-center gap-3 border rounded-xl p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors" style="border-color:#E5E7EB">
            <input type="checkbox" id="tpf-ar" ${row?.ar ? 'checked' : ''} style="accent-color:#E87D1E; width:16px; height:16px">
            <div>
              <div class="text-xs font-semibold text-gray-900">Autorretenedor</div>
            </div>
          </label>
          <label class="flex items-center gap-3 border rounded-xl p-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors" style="border-color:#E5E7EB">
            <input type="checkbox" id="tpf-ei" ${row?.ei ? 'checked' : ''} style="accent-color:#E87D1E; width:16px; height:16px">
            <div>
              <div class="text-xs font-semibold text-gray-900">Exento de IVA</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ TAB 3 — Condiciones de Crédito ══════════════════════════ -->
  <div id="tpf-panel-3" style="display:none">
    <div style="background:#FFF7F0;border:1px solid #FDE8D4;border-radius:10px;padding:12px 16px;margin-bottom:16px">
      <p style="font-size:13px;color:#9A3412;margin:0">
        <i class="fas fa-circle-info mr-1"></i>
        Controla la venta a crédito. Con cupo <strong>0</strong> no se permite cartera.
        <em>Máximo de facturas</em> limita cuántas pueden quedar pendientes de cobro.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Cupo de Crédito (COP)</label>
        <input id="tpf-credit-limit" type="number" min="0" class="form-input"
          value="${esc(row?.credit_limit ?? 0)}" placeholder="0">
      </div>
      <div class="form-group">
        <label class="form-label">Máximo de Facturas con Saldo</label>
        <input id="tpf-max-invoices" type="number" min="0" class="form-input"
          value="${esc(row?.max_invoices ?? 1)}" placeholder="1">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Plazo de Crédito (días)</label>
        <input id="tpf-payment-days" type="number" min="0" class="form-input"
          value="${esc(row?.payment_days ?? 0)}" placeholder="0">
      </div>
    </div>
  </div>

  <!-- ══ TAB 4 — Notas ══════════════════════════════════════════ -->
  <div id="tpf-panel-4" style="display:none">
    <div class="form-group">
      <label class="form-label">Observaciones / Notas Internas</label>
      <textarea id="tpf-notes" class="form-input font-mono" rows="7" placeholder="Información adicional sobre el tercero...">${esc(row?.notes || '')}</textarea>
    </div>
  </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS DEL FORMULARIO
   ═══════════════════════════════════════════════════════════ */
function _tpfSwitchTab(idx) {
  for (let i = 0; i < 5; i++) {
    const panel = $(`#tpf-panel-${i}`);
    const btn   = $(`#tpf-tab-${i}`);
    if (!panel || !btn) continue;
    const on = i === idx;
    panel.style.display = on ? '' : 'none';
    btn.style.borderBottomColor = on ? '#E87D1E' : 'transparent';
    btn.style.color      = on ? '#E87D1E' : '#6B7280';
    btn.style.fontWeight = on ? '600' : '400';
  }
}

function _tpfCurrentPersonType() {
  return document.querySelector('input[name="tpf-person-type-r"]:checked')?.value || 'NATURAL';
}

function _tpfUpdatePersonType() {
  const pt = _tpfCurrentPersonType();
  const isNatural  = pt === 'NATURAL';
  const isJuridica = !isNatural;

  const natSec = $('#tpf-section-natural');
  const jurSec = $('#tpf-section-juridica');
  if (natSec) natSec.style.display  = isNatural  ? '' : 'none';
  if (jurSec) jurSec.style.display  = isJuridica ? '' : 'none';

  // Actualizar estilos de las tarjetas radio
  $$('input[name="tpf-person-type-r"]').forEach(radio => {
    const active = radio.value === pt;
    const lbl    = radio.closest('label');
    if (!lbl) return;
    lbl.style.borderColor  = active ? '#E87D1E' : '#E5E7EB';
    lbl.style.background   = active ? '#FFF7F0' : '#FAFAFA';
    const icon = lbl.querySelector('i');
    const span = lbl.querySelector('span');
    if (icon) icon.style.color      = active ? '#E87D1E' : '#9CA3AF';
    if (span) { span.style.color    = active ? '#E87D1E' : '#374151';
                span.style.fontWeight = active ? '600' : '400'; }
  });

  // Jurídica → sugerir NIT
  if (isJuridica) {
    const docEl = $('#tpf-doc-type');
    if (docEl && docEl.value !== 'NIT' && docEl.value !== 'NITPE') { docEl.value = 'NIT'; _tpfUpdateDV(); }
  }
}

function _tpfUpdateDV() {
  const docType = getSelectVal('tpf-doc-type');
  const wrap    = $('#tpf-dv-wrap');
  const dvEl    = $('#tpf-dv');
  const numWrap = $('#tpf-doc-number-wrap');
  if (!dvEl) return;
  if (docType === 'NIT' || docType === 'NITPE') {
    if (wrap) wrap.style.display = '';
    if (numWrap) {
      numWrap.classList.remove('md:col-span-7');
      numWrap.classList.add('md:col-span-5');
    }
    dvEl.value = calcDV(getInputVal('tpf-doc-number'));
  } else {
    if (wrap) wrap.style.display = 'none';
    if (numWrap) {
      numWrap.classList.remove('md:col-span-5');
      numWrap.classList.add('md:col-span-7');
    }
    dvEl.value = '';
  }
}

function _tpfUpdateCountry() {
  const countryCode = getSelectVal('tpf-country');
  const isColombia  = countryCode === 'CO';
  const sec = $('#tpf-section-colombia');
  if (sec) sec.style.display = isColombia ? '' : 'none';
  // Siempre limpiar la cascada al cambiar de país (incluye volver a Colombia)
  const deptEl = $('#tpf-dept-select');
  if (deptEl) deptEl.value = '';
  setInputVal('tpf-dept-code',  '');
  setInputVal('tpf-department', '');
  const cityEl = $('#tpf-city-select');
  if (cityEl) {
    cityEl.innerHTML = '<option value="">— seleccione departamento primero —</option>';
  }
  setInputVal('tpf-city-code', '');
  setInputVal('tpf-city', '');
}

function _tpfUpdateDept() {
  const code    = getSelectVal('tpf-dept-select');
  const dept    = geoDept(code);
  setInputVal('tpf-dept-code',  code);
  setInputVal('tpf-department', dept?.name || '');
  // Recargar selector de municipios
  const cityEl = $('#tpf-city-select');
  if (!cityEl) return;
  const munis = code ? geoMunisByDept(code) : [];
  cityEl.innerHTML = `<option value="">Seleccionar municipio...</option>` +
    munis.map(m => `<option value="${esc(m.code)}">${esc(m.name)}</option>`).join('');
  // Limpiar valores de ciudad al cambiar departamento
  setInputVal('tpf-city-code', '');
  setInputVal('tpf-city', '');
}

function _tpfUpdateCity() {
  const muniCode = getSelectVal('tpf-city-select');
  const muni     = geoMuni(muniCode);
  setInputVal('tpf-city-code', muniCode);
  setInputVal('tpf-city',      muni?.name || '');
}

function _tpfBindEvents() {
  $$('input[name="tpf-person-type-r"]').forEach(r =>
    r.addEventListener('change', _tpfUpdatePersonType));
  $('#tpf-doc-type')?.addEventListener('change', _tpfUpdateDV);

  // Solo permitir dígitos en número de documento
  const docNumEl = $('#tpf-doc-number');
  if (docNumEl) {
    docNumEl.addEventListener('input', () => {
      const pos = (docNumEl as HTMLInputElement).selectionStart || 0;
      const clean = (docNumEl as HTMLInputElement).value.replace(/[^0-9]/g, '');
      if ((docNumEl as HTMLInputElement).value !== clean) {
        (docNumEl as HTMLInputElement).value = clean;
        (docNumEl as HTMLInputElement).setSelectionRange(pos - 1, pos - 1);
      }
      _tpfUpdateDV();
    });
  }

  $('#tpf-country')?.addEventListener('change', _tpfUpdateCountry);
  $('#tpf-dept-select')?.addEventListener('change', _tpfUpdateDept);

  // Uppercase en tiempo real (preservando posición del cursor)
  ['tpf-first-name','tpf-last-name','tpf-business-name','tpf-commercial-name',
   'tpf-address'].forEach(id => {
    const el = $(`#${id}`) as HTMLInputElement;
    if (!el) return;
    el.addEventListener('input', () => {
      const pos = el.selectionStart;
      el.value  = el.value.toUpperCase();
      el.setSelectionRange(pos, pos);
    });
  });
  $('#tpf-city-select')?.addEventListener('change', _tpfUpdateCity);

  // Inicializar buscador de asesor comercial (vendedores)
  _tpfBindAdvisorSearch();

  // Zona de Arrastre de RUT PDF
  const dropzone = document.getElementById('tpf-rut-dropzone');
  const fileInput = document.getElementById('tpf-rut-file-input') as HTMLInputElement;

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const files = fileInput.files;
      if (files && files.length > 0) {
        handleRUTUpload(files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#6366F1';
      dropzone.style.background = '#EEF2F6';
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#E2E8F0';
      dropzone.style.background = '#F8FAFC';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#E2E8F0';
      dropzone.style.background = '#F8FAFC';
      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && files[0].type === 'application/pdf') {
        handleRUTUpload(files[0]);
      } else {
        showToast('Solo se permiten archivos PDF del RUT.', 'warning');
      }
    });
  }
}

function _tpfBindAdvisorSearch() {
  const wrap    = $('#tpf-advisor-wrap');
  const hidden  = $('#tpf-advisor') as HTMLInputElement;
  const input   = $('#tpf-advisor-search') as HTMLInputElement;
  const results = $('#tpf-advisor-results');
  if (!wrap || !hidden || !input || !results) return;

  // Obtener vendedores cacheados o cargarlos
  const getVendedores = async () => {
    if ((window as any)._tpfVendedoresCache) return (window as any)._tpfVendedoresCache;
    try {
      const list = await pb.listAll('third_parties', {
        filter: 'type="EMPLEADO" && active=true',
        sort: 'name',
        fields: 'id,name,doc_number',
      });
      (window as any)._tpfVendedoresCache = list;
      return list;
    } catch (_) { return []; }
  };

  const paint = (list: any[], query: string) => {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? list.filter(v => `${v.doc_number||''} ${v.name||''}`.toLowerCase().includes(q)).slice(0, 20)
      : list.slice(0, 20);
    if (!filtered.length) {
      results.innerHTML = '<div style="padding:10px 12px;font-size:12px;color:#9CA3AF">Sin vendedores encontrados</div>';
      return;
    }
    results.innerHTML = filtered.map(v => `
      <button type="button" data-vid="${esc(v.id)}" class="w-full text-left px-3 py-2 text-sm"
        style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">
        <div style="font-weight:600">${esc(v.doc_number||'SIN DOC')}</div>
        <div style="font-size:12px;color:#6B7280">${esc(v.name||'')}</div>
      </button>`).join('');
  };

  const show = async () => {
    const list = await getVendedores();
    paint(list, input.value);
    results.style.display = 'block';
    input.select();
  };
  const hide = () => { results.style.display = 'none'; };

  input.onfocus = () => show();
  input.oninput = async () => {
    hidden.value = '';
    const list = await getVendedores();
    paint(list, input.value);
    results.style.display = 'block';
  };
  input.onblur = () => setTimeout(hide, 150);

  results.addEventListener('mousedown', e => e.preventDefault());
  results.addEventListener('click', async e => {
    const btn = (e.target as HTMLElement).closest('[data-vid]') as HTMLElement;
    if (!btn) return;
    const vid = btn.getAttribute('data-vid') || '';
    const list = await getVendedores();
    const v = list.find((x: any) => x.id === vid);
    hidden.value = vid;
    input.value  = v ? `${v.doc_number||''} - ${v.name||''}` : '';
    hide();
  });
}

/* ═══════════════════════════════════════════════════════════
   PAYLOAD
   ═══════════════════════════════════════════════════════════ */
function terceroPayload() {
  const pt        = _tpfCurrentPersonType();
  const isNatural = pt === 'NATURAL';

  // Elimina slashes y espacios al inicio/final del nombre (previene bug de razon social con slash)
  const _snz = (v: string) => v.replace(/^[/\s]+|[/\s]+$/g, '').trim();

  const firstName  = _snz(getInputVal('tpf-first-name').toUpperCase());
  const lastName   = _snz(getInputVal('tpf-last-name').toUpperCase());
  const bizName    = _snz(getInputVal('tpf-business-name').toUpperCase());
  const comName    = _snz(getInputVal('tpf-commercial-name').toUpperCase());
  const name       = isNatural
    ? [firstName, lastName].filter(Boolean).join(' ')
    : (bizName || comName);

  const country    = getSelectVal('tpf-country') || 'CO';
  const isColombia = country === 'CO';

  const advisorId   = ($('#tpf-advisor') as HTMLInputElement)?.value || '';
  const advisorName = ($('#tpf-advisor-search') as HTMLInputElement)?.value || '';

  const respList = [];
  document.querySelectorAll('.tpf-resp-cb:checked').forEach((cb: any) => {
    respList.push(cb.value);
  });

  // Calcular gc y tax_regime a partir de responsabilidades
  const isGc = respList.includes('13');
  let taxRegime = 'NO_RESP';
  if (isGc) {
    taxRegime = 'GRAN_CONTR';
  } else if (respList.includes('47')) {
    taxRegime = 'SIMPLIFICADO';
  } else if (respList.includes('48')) {
    taxRegime = 'COMUN';
  } else if (respList.includes('49') || respList.includes('53')) {
    taxRegime = 'NO_RESP';
  } else {
    // Por defecto, si es jurídica asumimos responsable (COMUN), si es natural NO_RESP
    taxRegime = pt === 'JURIDICA' ? 'COMUN' : 'NO_RESP';
  }

  return {
    person_type:     pt,
    type:            getSelectVal('tpf-type'),
    doc_type:        getSelectVal('tpf-doc-type'),
    doc_number:      getInputVal('tpf-doc-number'),
    dv:              getInputVal('tpf-dv'),
    first_name:      firstName,
    last_name:       lastName,
    business_name:   bizName,
    commercial_name: comName,
    name,
    contact_name:    getInputVal('tpf-contact-name'),
    advisor:         advisorId,
    advisor_name:    advisorName,
    phone:           getInputVal('tpf-phone'),
    phone2:          getInputVal('tpf-phone2'),
    email:           getInputVal('tpf-email'),
    email2:          getInputVal('tpf-email2'),
    country,
    department:      isColombia ? getInputVal('tpf-department') : '',
    dept_code:       isColombia ? getInputVal('tpf-dept-code')  : '',
    city:            isColombia ? getInputVal('tpf-city') : '',
    city_code:       isColombia ? getInputVal('tpf-city-code') : '',
    address:         getInputVal('tpf-address').toUpperCase(),
    tax_regime:      taxRegime,
    credit_limit:    parseFloat(getInputVal('tpf-credit-limit'))  || 0,
    max_invoices:    parseInt(getInputVal('tpf-max-invoices'), 10) || 1,
    payment_days:    parseInt(getInputVal('tpf-payment-days'), 10) || 0,
    active:          getSelectVal('tpf-active') === '1',
    ciiu:            getSelectVal('tpf-ciiu'),
    gc:              isGc,
    gcm:             ($('#tpf-gcm') as HTMLInputElement)?.checked || false,
    ar:              ($('#tpf-ar') as HTMLInputElement)?.checked || false,
    ei:              ($('#tpf-ei') as HTMLInputElement)?.checked || false,
    rf:              getSelectVal('tpf-rf'),
    prf:             parseFloat(getInputVal('tpf-prf')) || 0,
    pi:              parseFloat(getInputVal('tpf-pi')) || 0,
    piv:             parseFloat(getInputVal('tpf-piv')) || 0,
    resp:            respList,
    notes:           getInputVal('tpf-notes'),
  };
}

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN (navega al tab con error)
   ═══════════════════════════════════════════════════════════ */
function _tpfValidate(p) {
  if (!p.doc_type || !p.doc_number) {
    _tpfSwitchTab(0);
    showToast('Tipo y número de documento son obligatorios', 'warning'); return false;
  }
  // Validar que el número de documento solo tenga dígitos
  if (!/^[0-9]+$/.test(p.doc_number)) {
    _tpfSwitchTab(0);
    showToast('El número de documento solo admite dígitos, sin espacios ni símbolos', 'warning'); return false;
  }
  const isNatural = p.person_type === 'NATURAL';
  if (isNatural && (!p.first_name || !p.last_name)) {
    _tpfSwitchTab(0);
    showToast('Nombres y Apellidos son obligatorios para persona natural', 'warning'); return false;
  }
  if (!isNatural && !p.business_name) {
    _tpfSwitchTab(0);
    showToast('La Razón Social es obligatoria', 'warning'); return false;
  }
  if (!p.name) {
    _tpfSwitchTab(0);
    showToast('El nombre no puede quedar vacío', 'warning'); return false;
  }
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    _tpfSwitchTab(1);
    showToast('El correo electrónico principal no es válido', 'warning'); return false;
  }
  if (p.email2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email2)) {
    _tpfSwitchTab(1);
    showToast('El correo electrónico de facturación/alternativo no es válido', 'warning'); return false;
  }
  if (p.country === 'CO' && (!p.city || !p.department)) {
    _tpfSwitchTab(1);
    showToast('Departamento y Ciudad son obligatorios para Colombia', 'warning'); return false;
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════
   ABRIR FORMULARIO
   ═══════════════════════════════════════════════════════════ */
function openTerceroForm(row = null, onSaveSuccess = null, onCancel = null) {
  if (!can('canWrite')) return showToast('No tienes permisos para gestionar terceros', 'error');

  const footer = `<button class="btn btn-outline" id="btn-cancel-tp">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tp"><i class="fas fa-floppy-disk"></i> Guardar</button>`;

  const initTpfEvents = () => {
    $('#btn-cancel-tp')?.addEventListener('click', () => {
      closeModal();
      if (onCancel) onCancel();
    });
    _tpfBindEvents();
    _tpfUpdateDV();
    _tpfUpdatePersonType();
    if (row?.dept_code) {
      const cityEl = $('#tpf-city-select');
      if (cityEl) {
        const munis = geoMunisByDept(row.dept_code);
        const savedCode = row.city_code || '';
        cityEl.innerHTML = '<option value="">Seleccionar municipio...</option>' +
          munis.map(m =>
            `<option value="${esc(m.code)}" ${m.code === savedCode ? 'selected' : ''}>${esc(m.name)}</option>`
          ).join('');
        setInputVal('tpf-city-code', savedCode);
        setInputVal('tpf-city', munis.find(m => m.code === savedCode)?.name || row.city || '');
      }
    }
    if (row?.resp) {
      const list = Array.isArray(row.resp) ? row.resp : [];
      list.forEach(code => {
        const cb = document.getElementById(`tpf-resp-${code}`) as HTMLInputElement;
        if (cb) cb.checked = true;
      });
    }

    $('#btn-save-tp')?.addEventListener('click', async () => {
      const payload = terceroPayload();
      if (!_tpfValidate(payload)) return;
      const btn = $('#btn-save-tp');
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
      try {
        const escapedDoc = pb.escapeFilterValue(payload.doc_number);
        const duplicates = await pb.listAll('third_parties', {
          filter: `doc_number = "${escapedDoc}"`
        });

        const isDuplicate = row?.id 
          ? duplicates.some((d: any) => d.id !== row.id)
          : duplicates.length > 0;

        if (isDuplicate) {
          const dup = duplicates.find((d: any) => d.id !== row?.id) || duplicates[0];
          showToast(`Ya existe un tercero con el número de identificación ${payload.doc_number} (${dup.name})`, 'warning');
          if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
          return;
        }

        let savedRecord = null;
        if (row?.id) {
          savedRecord = await pb.update('third_parties', row.id, payload);
          await API.logAudit('UPDATE', 'Tercero', row.id,
            `${payload.doc_type} ${payload.doc_number} - ${payload.name}`);
        } else {
          savedRecord = await pb.create('third_parties', payload);
          await API.logAudit('CREATE', 'Tercero', savedRecord.id,
            `${payload.doc_type} ${payload.doc_number} - ${payload.name}`);
        }
        closeModal();
        showToast('Tercero guardado correctamente', 'success');
        if (onSaveSuccess) {
          onSaveSuccess(savedRecord);
        } else {
          renderTerceros($('#page-content'));
        }
      } catch (err: any) {
        showToast(err.message || 'Error al guardar el tercero', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
      }
    });
  };

  if (typeof (window as any).openDocumentTab === 'function') {
    const tabKey = row ? `editar-tercero-${row.id}` : 'nuevo-tercero';
    const tabTitle = row ? `Editar: ${row.name || 'Tercero'}` : 'Nuevo Tercero';
    (window as any).openDocumentTab(tabKey, tabTitle, 'fa-user-plus', terceroFormHtml(row), footer, initTpfEvents);
  } else {
    openModal(row ? 'Editar Tercero' : 'Nuevo Tercero', terceroFormHtml(row), footer, true);
    setTimeout(initTpfEvents, 30);
  }
}



/* ═══════════════════════════════════════════════════════════
   EDITAR  (con inferencia backward-compat)
═══════════════════════════════════════════════════════════ */
async function editTercero(id) {
  try {
    const row = await pb.get('third_parties', id);
    // Compat: inferir first_name/last_name/business_name desde campo "name"
    if (!row.first_name && !row.business_name && row.name) {
      const pt = row.person_type || 'NATURAL';
      if (pt === 'NATURAL') {
        const parts  = row.name.trim().split(/\s+/);
        const half   = Math.ceil(parts.length / 2);
        row.first_name = parts.slice(0, half).join(' ');
        row.last_name  = parts.slice(half).join(' ');
      } else {
        row.business_name = row.name;
      }
    }
    // Compat: normalizar country de nombre legado ('COLOMBIA') a código ISO ('CO')
    if (!row.country || row.country.length > 3) {
      const countryName = (row.country || 'COLOMBIA').toUpperCase();
      const found = GEO_PAISES.find(p => p.name === countryName);
      row.country = found ? found.code : 'CO';
    }
    // Compat: inferir dept_code desde nombre de departamento
    if (!row.dept_code && row.department) {
      const deptName = row.department.trim().toUpperCase();
      const found = GEO_DEPTS.find(d => d.name === deptName);
      if (found) row.dept_code = found.code;
    }
    // Compat: inferir city_code desde nombre del municipio
    if (!row.city_code && row.city && row.dept_code) {
      const cityName = row.city.trim().toUpperCase();
      const found = geoMunisByDept(row.dept_code).find(m => m.name === cityName);
      if (found) row.city_code = found.code;
    }
    // Resolver advisor_name legible si advisor posee un ID de registro raw
    if (row.advisor) {
      if (!row.advisor_name || row.advisor_name === row.advisor || !row.advisor_name.includes(' ')) {
        try {
          const advRec = await pb.get('third_parties', row.advisor);
          if (advRec) {
            row.advisor_name = `${advRec.doc_number ? advRec.doc_number + ' - ' : ''}${advRec.name}`;
          }
        } catch (_) {}
      }
    }
    openTerceroForm(row);
  } catch (err) { showToast(err.message, 'error'); }
}

/* ═══════════════════════════════════════════════════════════
   TOGGLE ESTADO
═══════════════════════════════════════════════════════════ */
function toggleTercero(id, active) {
  if (!can('canDelete')) return showToast('No tienes permisos para cambiar estado', 'error');
  confirmDialog(
    active ? 'Reactivar tercero' : 'Inactivar tercero',
    active ? '¿Deseas reactivar este tercero?' : '¿Deseas inactivar este tercero?',
    async () => {
      try {
        await pb.update('third_parties', id, { active });
        const updated = await pb.get('third_parties', id);
        await API.logAudit('STATUS', 'Tercero', id,
          `${updated.doc_type} ${updated.doc_number} - ${updated.name} => ${active?'Activo':'Inactivo'}`);
        showToast('Estado actualizado', 'success');
        renderTerceros($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

function deleteTercero(id) {
  if (!can('canDelete')) return showToast('No tienes permisos para eliminar terceros', 'error');
  confirmDialog(
    'Eliminar tercero',
    '¿Estás seguro de eliminar permanentemente este tercero? Esta acción no se puede deshacer y fallará si el tercero tiene transacciones vinculadas.',
    async () => {
      try {
        await pb.delete('third_parties', id);
        await API.logAudit('DELETE', 'Tercero', id, 'Tercero eliminado permanentemente');
        showToast('Tercero eliminado correctamente', 'success');
        renderTerceros($('#page-content'));
      } catch (err) {
        showToast('No se puede eliminar el tercero porque ya tiene movimientos contables o facturas asociadas. Considera inactivarlo.', 'error');
      }
    }
  );
}

// --- VITE MIGRATION GLOBALS ---
(window as any)._tpfSwitchTab = _tpfSwitchTab;
(window as any).renderTerceros = renderTerceros;
(window as any)._tpfBindEvents = _tpfBindEvents;
(window as any).openTerceroForm = openTerceroForm;
(window as any)._tpfUpdatePersonType = _tpfUpdatePersonType;
(window as any).terceroPayload = terceroPayload;
(window as any)._tpfUpdateCountry = _tpfUpdateCountry;
(window as any).editTercero = editTercero;
(window as any)._tpfUpdateDept = _tpfUpdateDept;
(window as any)._tpfValidate = _tpfValidate;
(window as any).toggleTercero = toggleTercero;
(window as any).deleteTercero = deleteTercero;
(window as any)._tpfUpdateCity = _tpfUpdateCity;
(window as any)._tpfUpdateDV = _tpfUpdateDV;
(window as any).terceroFormHtml = terceroFormHtml;
(window as any)._tpfCurrentPersonType = _tpfCurrentPersonType;
(window as any).exportTercerosExcel = exportTercerosExcel;
(window as any).openNitValidatorModal = openNitValidatorModal;
(window as any).viewTercero = viewTercero;

async function exportTercerosExcel() {
  try {
    const XLSX = (window as any).XLSX;
    if (!XLSX) return showToast('Librería XLSX no cargada', 'error');

    const rows = await pb.listAll('third_parties', { sort: 'name' });

    // Construir mapa de lookup para asesores comerciales (ID -> Nombre)
    const tpMap = new Map<string, string>();
    rows.forEach((r: any) => {
      if (r.id) {
        const nameVal = r.name || [r.first_name, r.last_name].filter(Boolean).join(' ') || r.business_name || r.doc_number || r.id;
        tpMap.set(r.id, nameVal);
      }
    });

    const headers = [
      'ID',
      'Tipo Persona',
      'Rol (Tipo)',
      'Tipo Doc',
      'Documento',
      'DV',
      'Nombre Completo / Razón Social',
      'Razón Social',
      'Nombre Comercial',
      'Nombres / Primer Nombre',
      'Apellidos / Primer Apellido',
      'Nombre Contacto',
      'Teléfono Contacto',
      'Celular / Teléfono 1',
      'Teléfono 2',
      'Email 1',
      'Email 2',
      'País',
      'Departamento',
      'Código Dept',
      'Ciudad / Municipio',
      'Código Ciudad',
      'Dirección',
      'Régimen Tributario',
      'Responsabilidades',
      'Gran Contribuyente',
      'Gran Contribuyente Municipal',
      'Autorretenedor',
      'Exento IVA',
      'Agente Retención DIAN',
      'Regla ReteFuente',
      'ReteFuente %',
      'ReteICA %',
      'ReteIVA %',
      'Código CIIU',
      'ID Asesor Comercial',
      'Asesor Comercial',
      'Banco',
      'Cuenta Bancaria',
      'Tipo Factura Electrónica',
      'Tipo Factura Contingencia',
      'Cupo Crédito ($)',
      'Plazo Crédito (Días)',
      'Facturas Máximas',
      'Estado',
      'Notas / Observaciones',
      'Fecha Creación',
      'Fecha Actualización'
    ];

    const dataRows = rows.map((r: any) => {
      const respVal = Array.isArray(r.resp) ? r.resp.join(';') : (r.resp || '');
      const advisorName = r.advisor ? (tpMap.get(r.advisor) || r.advisor) : '';

      return [
        r.id || '',
        r.person_type || 'NATURAL',
        r.type || 'CLIENTE',
        r.doc_type || 'CC',
        r.doc_number || '',
        r.dv || '',
        r.name || '',
        r.business_name || '',
        r.commercial_name || '',
        r.first_name || '',
        r.last_name || '',
        r.contact_name || '',
        r.contact_phone || '',
        r.phone || '',
        r.phone2 || '',
        r.email || '',
        r.email2 || '',
        r.country || 'CO',
        r.department || '',
        r.dept_code || '',
        r.city || '',
        r.city_code || '',
        r.address || '',
        r.tax_regime || '',
        respVal,
        r.gc ? 'SI' : 'NO',
        r.gcm ? 'SI' : 'NO',
        r.ar ? 'SI' : 'NO',
        r.ei ? 'SI' : 'NO',
        r.is_retention_agent ? 'SI' : 'NO',
        r.rf || '',
        r.prf ?? 0,
        r.pi ?? 0,
        r.piv ?? 0,
        r.ciiu || '',
        r.advisor || '',
        advisorName,
        r.bank_name || '',
        r.bank_account || '',
        r.tfe || '',
        r.tfc || '',
        r.credit_limit ?? 0,
        r.payment_days ?? 0,
        r.max_invoices ?? 0,
        r.active ? 'SI' : 'NO',
        r.notes || '',
        r.created ? new Date(r.created).toLocaleString('es-CO') : '',
        r.updated ? new Date(r.updated).toLocaleString('es-CO') : ''
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Ajuste automático de ancho de columnas para excelente presentación
    const colWidths = headers.map((h, colIdx) => {
      let maxLen = h.length;
      dataRows.forEach(row => {
        const valStr = String(row[colIdx] ?? '');
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Terceros');
    XLSX.writeFile(wb, `terceros_gravy_${(window as any).todayStr()}.xlsx`);
    showToast('Maestro de terceros exportado a Excel con todos los campos registrados', 'success');
  } catch (err: any) {
    showToast('Error al exportar Excel: ' + err.message, 'error');
  }
}

function openNitValidatorModal() {
  const body = `
    <div class="p-2">
      <p class="text-sm text-gray-500 mb-4">Calcula en tiempo real el dígito de verificación DIAN (DV) para un NIT colombiano.</p>
      <div class="form-group mb-4">
        <label class="form-label">Número NIT (sin puntos, guiones ni DV)</label>
        <input id="valnit-input" class="form-input text-lg font-mono tracking-wider" placeholder="Ej: 900123456" inputmode="numeric">
      </div>
      <div class="bg-gray-50 border rounded-xl p-4 text-center" style="border-color:#E5E7EB">
        <div class="text-xs text-gray-400 uppercase font-semibold font-bold">Dígito de Verificación</div>
        <div id="valnit-dv" class="text-4xl font-extrabold text-orange-500 my-1">—</div>
        <div id="valnit-full" class="text-sm font-mono text-gray-600">—</div>
      </div>
    </div>
  `;
  const footer = `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`;
  (window as any).openModal('Calculadora de NIT (DV)', body, footer, false);

  setTimeout(() => {
    const input = document.getElementById('valnit-input');
    const dvEl = document.getElementById('valnit-dv');
    const fullEl = document.getElementById('valnit-full');
    if (input && dvEl && fullEl) {
      input.focus();
      input.addEventListener('input', () => {
        const clean = input.value.replace(/[^0-9]/g, '');
        input.value = clean;
        if (!clean) {
          dvEl.textContent = '—';
          fullEl.textContent = '—';
          return;
        }
        const dv = calcDV(clean);
        dvEl.textContent = dv;
        fullEl.textContent = `${clean}-${dv}`;
      });
    }
  }, 100);
}

async function viewTercero(id, event) {
  if (event) event.stopPropagation();
  try {
    const r = await pb.get('third_parties', id);

    const doc = `${esc(r.doc_type)} ${esc(r.doc_number)}${r.dv ? `-${esc(r.dv)}` : ''}`;
    const formattedCredit = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(r.credit_limit || 0);

    const isNatural = r.person_type === 'NATURAL';
    const typeLabel = TP_TYPES.find(x => x.code === r.type)?.name ?? r.type;

    // Obtener responsabilidades fiscales legibles
    const getRespLabels = () => {
      const list = Array.isArray(r.resp) ? r.resp : [];
      if (!list.length) return '<span class="text-gray-400 text-xs">Sin asignar</span>';
      return list.map(code => {
        const item = DIAN_RESP.find(d => d.c === code);
        return `<span class="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] mr-1 mb-1 font-medium" title="${esc(item?.l || '')}">${esc(code)} — ${esc(item?.l || '')}</span>`;
      }).join('');
    };

    const ciiuItem = DIAN_CIIU.find(d => d.c === r.ciiu);
    const ciiuLabel = ciiuItem ? `${r.ciiu} — ${ciiuItem.l}` : (r.ciiu || 'No especificada');

    const retBar = (label, val, maxVal) => {
      const pct = Math.min(100, ((val || 0) / maxVal) * 100);
      return `
        <div class="mb-2.5">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-500 font-medium">${label}</span>
            <span class="font-bold text-gray-700">${val || 0}%</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div class="bg-orange-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    };

    const body = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 text-sm text-gray-700">
        <!-- Columna 1: Info General y Ubicación -->
        <div class="bg-gray-50 rounded-xl p-4 border" style="border-color:#E5E7EB">
          <h4 class="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3"><i class="fas fa-id-card mr-1.5"></i> Identidad y Ubicación</h4>
          
          <div class="space-y-2.5">
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Tipo Persona</span>
              <span class="font-medium">${isNatural ? 'Persona Natural' : 'Persona Jurídica'}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Razón Social / Nombre</span>
              <span class="font-bold text-gray-900">${esc(r.name)}</span>
            </div>
            ${r.commercial_name ? `
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Nombre Comercial</span>
              <span class="font-medium">${esc(r.commercial_name)}</span>
            </div>` : ''}
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Documento de Identidad</span>
              <span class="font-semibold font-mono">${doc}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Actividad Económica (CIIU)</span>
              <span class="font-medium text-xs">${esc(ciiuLabel)}</span>
            </div>
            <div class="pt-2 border-t" style="border-color:#E5E7EB">
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">País</span>
              <span class="font-medium">${esc(r.country || 'CO')}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Departamento / Ciudad</span>
              <span class="font-medium">${esc(r.department || '—')} / ${esc(r.city || '—')}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Dirección</span>
              <span class="font-medium font-mono">${esc(r.address || '—')}</span>
            </div>
          </div>
        </div>

        <!-- Columna 2: Contacto y Crédito -->
        <div class="bg-gray-50 rounded-xl p-4 border" style="border-color:#E5E7EB">
          <h4 class="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3"><i class="fas fa-phone mr-1.5"></i> Contacto y Crédito</h4>
          
          <div class="space-y-2.5">
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Rol en Sistema</span>
              <span class="badge badge-green text-xs">${esc(typeLabel)}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Nombre Contacto</span>
              <span class="font-medium">${esc(r.contact_name || '—')}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Asesor Comercial</span>
              <span class="font-medium">${esc(r.advisor_name || '—')}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Teléfonos</span>
              <span class="font-semibold">${esc(r.phone || '—')} ${r.phone2 ? ` / ${esc(r.phone2)}` : ''}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Correos Electrónicos</span>
              <span class="font-semibold text-xs block text-blue-600">${esc(r.email || '—')}</span>
              ${r.email2 ? `<span class="text-xs text-blue-500 font-semibold block">${esc(r.email2)}</span>` : ''}
            </div>
            
            <div class="pt-2 border-t" style="border-color:#E5E7EB">
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Cupo de Crédito</span>
              <span class="font-bold text-gray-900">${formattedCredit}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Plazo de Crédito</span>
              <span class="font-medium">${r.payment_days || 0} días</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Facturas Máximas con Saldo</span>
              <span class="font-medium">${r.max_invoices || 0} factura(s)</span>
            </div>
          </div>
        </div>

        <!-- Columna 3: Tributario y Retenciones -->
        <div class="bg-gray-50 rounded-xl p-4 border" style="border-color:#E5E7EB">
          <h4 class="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3"><i class="fas fa-percent mr-1.5"></i> Datos Fiscales y Retenciones</h4>
          
          <div class="space-y-3">
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Régimen Tributario</span>
              <span class="font-medium">${esc(
                (r.tax_regime === 'RESP_IVA' || r.tax_regime === 'COMUN') ? 'Responsable de IVA' :
                (r.tax_regime === 'NO_RESP' || r.tax_regime === 'SIMPLIFICADO') ? 'No Responsable de IVA' :
                r.tax_regime === 'SIMPLE' ? 'Régimen Simple de Tributación' :
                r.tax_regime === 'GRAN_CONTR' ? 'Gran Contribuyente' :
                r.tax_regime || 'Sin especificar'
              )}</span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase mb-1">Responsabilidades DIAN</span>
              <div class="flex flex-wrap max-h-24 overflow-y-auto p-1 bg-white border rounded">
                ${getRespLabels()}
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${r.gc ? '<span class="badge badge-orange text-[10px]">Gran Contribuyente</span>' : ''}
              ${r.gcm ? '<span class="badge badge-teal text-[10px]">Gran Contribuyente Municipal</span>' : ''}
              ${r.ar ? '<span class="badge badge-blue text-[10px]">Autoretenedor</span>' : ''}
              ${r.ei ? '<span class="badge badge-green text-[10px]">Exento IVA</span>' : ''}
            </div>
            
            <div class="pt-2 border-t" style="border-color:#E5E7EB">
              <span class="text-[10px] text-gray-400 block font-semibold uppercase">Agente de Retención</span>
              <span class="font-semibold text-gray-700 text-xs">${r.rf === 'SI' ? 'Sí es Agente de Retención' : 'No es Agente de Retención'}</span>
            </div>

            <div>
              <span class="text-[10px] text-gray-400 block font-semibold uppercase mb-1.5">Porcentajes de Retención</span>
              ${retBar('ReteFuente', r.prf, 10)}
              ${retBar('ReteICA', r.pi, 2)}
              ${retBar('ReteIVA', r.piv, 15)}
            </div>
          </div>
        </div>
      </div>
      ${r.notes ? `
      <div class="mt-4 bg-yellow-50/50 rounded-xl p-3 border border-yellow-100 text-xs text-gray-700">
        <span class="text-[10px] text-yellow-600 block font-semibold uppercase mb-1"><i class="fas fa-sticky-note mr-1"></i> Observaciones Internas</span>
        <p class="font-mono whitespace-pre-line">${esc(r.notes)}</p>
      </div>` : ''}
    `;
    const footer = `
      ${can('canWrite') ? `<button class="btn btn-primary" onclick="closeModal(); editTercero('${esc(r.id)}');"><i class="fas fa-pen mr-1"></i> Editar</button>` : ''}
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
    `;
    (window as any).openModal(`Detalle del Tercero: ${esc(r.name)}`, body, footer, true);
  } catch (err: any) {
    showToast('Error al cargar detalle del tercero: ' + err.message, 'error');
  }
}

/* ══════════════════════════════════════════════════════════
   DIAN RUT PDF PARSER AND AUTOCOMPLETE
   ══════════════════════════════════════════════════════════ */
async function handleRUTUpload(file: File) {
  const dropzone = document.getElementById('tpf-rut-dropzone');
  if (dropzone) {
    dropzone.innerHTML = `<div style="font-size: 24px; color: #4B5563; margin-bottom: 6px;"><i class="fas fa-spinner fa-spin"></i></div>
                          <div style="font-size: 13px; font-weight: 700; color: #1E293B;">Procesando PDF...</div>
                          <div style="font-size: 11px; color: #64748B;">Leyendo estructura digital del RUT.</div>`;
  }

  try {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    const items: any[] = textContent.items;
    
    // Parsear el texto extraído
    const rutData = parseRUTText(items);

    if (!rutData.doc_number) {
      throw new Error("No se pudo detectar el NIT en el documento. Asegúrate de que sea un RUT original de la DIAN.");
    }

    // Verificar si ya existe en la base de datos
    try {
      const escapedDoc = pb.escapeFilterValue(rutData.doc_number);
      const duplicates = await pb.listAll('third_parties', {
        filter: `doc_number = "${escapedDoc}"`
      });

      if (duplicates.length > 0) {
        const existing = duplicates[0];
        const confirmMsg = `El tercero con identificación ${rutData.doc_number} ya está registrado en el sistema como "${existing.name}".\n\n¿Deseas cancelar la creación de este tercero y abrir el registro existente para editarlo?`;

        if (confirm(confirmMsg)) {
          closeModal();
          editTercero(existing.id);
        } else {
          showToast(`Ya existe un tercero con identificación ${rutData.doc_number}. No se aplicaron los datos del RUT.`, 'warning');
          // Restaurar dropzone
          if (dropzone) {
            dropzone.innerHTML = `
              <div style="font-size: 13px; font-weight: 700; color: #E11D48; margin-bottom: 2px;">Carga cancelada</div>
              <div style="font-size: 11px; color: #64748B;">El tercero ya existe en el sistema.</div>
            `;
          }
        }
        return; // Detener flujo para no autocompletar
      }
    } catch (errDb) {
      console.error("Error checking duplicate RUT doc number:", errDb);
      // En caso de error de red o base de datos, dejamos que continúe el flujo
    }

    // Auto-rellenar el formulario en el DOM
    applyRUTDataToForm(rutData);

    showToast('RUT procesado con éxito. Por favor verifica los datos.', 'success');
  } catch (err: any) {
    showToast(err.message || 'Error al procesar el RUT', 'error');
  } finally {
    // Restaurar dropzone
    if (dropzone) {
      dropzone.innerHTML = `
        <div style="font-size: 24px; color: #10B981; margin-bottom: 6px;"><i class="fas fa-circle-check"></i></div>
        <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 2px;">¡RUT Importado con éxito!</div>
        <div style="font-size: 11px; color: #64748B;">Carga otro archivo PDF si deseas sobreescribir.</div>
      `;
    }
  }
}

function parseRUTText(items: any[]) {
  const rut: any = {
    doc_number: '',
    dv: '',
    first_name: '',
    last_name: '',
    business_name: '',
    commercial_name: '',
    address: '',
    email: '',
    phone: '',
    ciiu: '',
    department: '',
    city: '',
    responsabilidades: []
  };

  const rowsMap = new Map<number, any[]>();
  for (const item of items) {
    const y = Math.round(item.transform[5]);
    const x = Math.round(item.transform[4]);
    const str = item.str.trim();
    if (!str) continue;

    let foundY = y;
    for (const existingY of rowsMap.keys()) {
      if (Math.abs(existingY - y) <= 4) {
        foundY = existingY;
        break;
      }
    }
    if (!rowsMap.has(foundY)) {
      rowsMap.set(foundY, []);
    }
    rowsMap.get(foundY)!.push({ str, x, y });
  }

  const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);
  const rows = sortedY.map(y => {
    const rowItems = rowsMap.get(y)!.sort((a, b) => a.x - b.x);
    return {
      y,
      items: rowItems,
      text: rowItems.map(item => item.str).join(" "),
      rawText: rowItems.map(item => item.str).join("")
    };
  });

  // Buscar NIT
  for (const row of rows) {
    const matches = row.text.match(/(\d\s+){6,9}\d/);
    if (matches) {
      const cleanNum = matches[0].replace(/\s+/g, "");
      if (cleanNum.length >= 7 && cleanNum.length <= 10) {
        rut.doc_number = cleanNum;
        break;
      }
    }
  }

  if (!rut.doc_number) {
    for (const row of rows) {
      const cleanText = row.text.replace(/\s+/g, "");
      const matches = cleanText.match(/\b\d{7,10}\b/);
      if (matches) {
        rut.doc_number = matches[0];
        break;
      }
    }
  }

  // Calcular DV
  if (rut.doc_number) {
    const nit = rut.doc_number;
    const vpri = [0, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let x = 0;
    let y = 0;
    const z = nit.length;
    for (let i = 0; i < z; i++) {
      y = parseInt(nit.charAt(z - 1 - i), 10);
      x += y * vpri[i + 1];
    }
    y = x % 11;
    rut.dv = (y > 1) ? String(11 - y) : String(y);
  }

  // Tipo Persona
  let isNatural = true;
  for (const row of rows) {
    if (row.text.includes("Persona natural") || row.text.includes("Cédula de Ciudadanía")) {
      isNatural = true;
      break;
    }
    if (row.text.includes("Persona jurídica")) {
      isNatural = false;
      break;
    }
  }

  // Nombres / Apellidos
  if (isNatural) {
    for (const row of rows) {
      if (row.y >= 510 && row.y <= 535) {
        const uppercaseWords = row.items.map(item => item.str).filter(s => /^[A-ZÑ\s]+$/.test(s) && s.length > 2);
        if (uppercaseWords.length >= 2) {
          const items = row.items.filter(item => /^[A-ZÑ\s]+$/.test(item.str) && item.str.length > 2);
          if (items.length >= 3) {
            rut.last_name = `${items[0].str} ${items[1].str}`.trim();
            rut.first_name = items.slice(2).map(item => item.str).join(" ");
          } else if (items.length === 2) {
            rut.last_name = items[0].str;
            rut.first_name = items[1].str;
          }
          break;
        }
      }
    }
  } else {
    for (const row of rows) {
      if (row.y >= 490 && row.y <= 535) {
        const matches = row.text.match(/^[A-Z0-9Ñ\s.,&-]{6,}$/);
        if (matches) {
          rut.business_name = row.text;
          break;
        }
      }
    }
  }

  // Ubicación: Departamento y Municipio
  const depts = (window as any).GEO_DEPTS || [];
  for (const row of rows) {
    if (row.text.includes("COLOMBIA")) {
      for (const item of row.items) {
        const cleanName = item.str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
        const matchedDept = depts.find((d: any) => d.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() === cleanName);
        if (matchedDept) {
          rut.department = item.str;
          const idx = row.items.indexOf(item);
          if (idx !== -1) {
            for (let i = idx + 1; i < row.items.length; i++) {
              const str = row.items[i].str;
              if (/^[a-zA-ZÑñ\s]+$/.test(str) && str.length > 2) {
                rut.city = str;
                break;
              }
            }
          }
          break;
        }
      }
      if (rut.department) break;
    }
  }

  // Dirección
  for (const row of rows) {
    if (row.y >= 405 && row.y <= 425) {
      if (/^(CL|CR|AV|CLL|CRA|DG|TV|KM|AUTO|TRANS|DIAG|CALLE|CARRERA)/i.test(row.text)) {
        rut.address = row.text;
        break;
      }
    }
  }

  // Correo
  for (const row of rows) {
    const emailMatch = row.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      rut.email = emailMatch[0].toLowerCase();
      break;
    }
  }

  // Teléfono
  for (const row of rows) {
    if (row.y >= 370 && row.y <= 395) {
      for (const item of row.items) {
        const clean = item.str.replace(/\s+/g, "");
        if (/^\d{7,10}$/.test(clean)) {
          rut.phone = clean;
          break;
        }
      }
      if (rut.phone) break;
    }
  }

  // Código CIIU
  for (const row of rows) {
    if (row.y >= 320 && row.y <= 340) {
      const digits = row.items.map(item => item.str).filter(s => /^\d$/.test(s));
      if (digits.length >= 4) {
        rut.ciiu = digits.slice(0, 4).join("");
        break;
      }
    }
  }

  // Responsabilidades tributarias
  const responsabilidades: string[] = [];
  for (const row of rows) {
    const matches = row.text.match(/\b(\d{2})\s*-\s*/g);
    if (matches) {
      matches.forEach(m => {
        const code = m.match(/\d{2}/)![0];
        responsabilidades.push(code);
      });
    }
  }
  rut.responsabilidades = [...new Set(responsabilidades)];

  return rut;
}

function applyRUTDataToForm(rutData: any) {
  // 1. Tipo de Persona
  const isJuridica = !!rutData.business_name;
  const personType = isJuridica ? 'JURIDICA' : 'NATURAL';
  
  const radio = document.querySelector(`input[name="tpf-person-type-r"][value="${personType}"]`) as HTMLInputElement;
  if (radio) {
    radio.checked = true;
    (window as any)._tpfUpdatePersonType();
  }

  // 2. Nombres / Razón Social
  if (isJuridica) {
    setInputVal('tpf-business-name', rutData.business_name);
    setInputVal('tpf-commercial-name', rutData.commercial_name || rutData.business_name);
  } else {
    setInputVal('tpf-first-name', rutData.first_name || '');
    setInputVal('tpf-last-name', rutData.last_name || '');
    setInputVal('tpf-commercial-name', rutData.commercial_name || `${rutData.first_name || ''} ${rutData.last_name || ''}`.trim());
  }

  // 3. Documento (RUT siempre es NIT)
  const docTypeSelect = document.getElementById('tpf-doc-type') as HTMLSelectElement;
  if (docTypeSelect) {
    docTypeSelect.value = 'NIT';
    const dvWrap = document.getElementById('tpf-dv-wrap');
    if (dvWrap) dvWrap.style.display = '';
    const docNumWrap = document.getElementById('tpf-doc-number-wrap');
    if (docNumWrap) {
      docNumWrap.className = 'form-group md:col-span-5';
    }
  }

  setInputVal('tpf-doc-number', rutData.doc_number || '');
  setInputVal('tpf-dv', rutData.dv || '');

  // 4. Contacto y Ubicación
  setInputVal('tpf-address', rutData.address || '');
  setInputVal('tpf-email', rutData.email || '');
  setInputVal('tpf-phone', rutData.phone || '');

  // CIIU
  const ciiuSelect = document.getElementById('tpf-ciiu') as HTMLSelectElement;
  if (ciiuSelect && rutData.ciiu) {
    const optionExists = Array.from(ciiuSelect.options).some(opt => opt.value === rutData.ciiu);
    if (optionExists) {
      ciiuSelect.value = rutData.ciiu;
    }
  }

  // 5. Ubicación: Departamento y Municipio
  const depts = (window as any).GEO_DEPTS || [];
  const munis = (window as any).GEO_MUNIS || [];

  if (rutData.department) {
    const deptNameClean = normalizeGeoName(rutData.department);
    const matchedDept = depts.find(d => normalizeGeoName(d.name) === deptNameClean);
    
    if (matchedDept) {
      const deptSelect = document.getElementById('tpf-dept-select') as HTMLSelectElement;
      if (deptSelect) {
        deptSelect.value = matchedDept.code;
        setInputVal('tpf-dept-code', matchedDept.code);
        setInputVal('tpf-department', matchedDept.name);

        const event = new Event('change');
        deptSelect.dispatchEvent(event);

        setTimeout(() => {
          if (rutData.city) {
            const cityNameClean = normalizeGeoName(rutData.city);
            const deptMunis = munis.filter(m => m.dept_code === matchedDept.code);
            const matchedMuni = deptMunis.find(m => normalizeGeoName(m.name) === cityNameClean);

            if (matchedMuni) {
              const citySelect = document.getElementById('tpf-city-select') as HTMLSelectElement;
              if (citySelect) {
                citySelect.value = matchedMuni.code;
                setInputVal('tpf-city-code', matchedMuni.code);
                setInputVal('tpf-city', matchedMuni.name);
              }
            }
          }
        }, 50);
      }
    }
  }

  // 6. Responsabilidades tributarias (casilla 53)
  if (rutData.responsabilidades && rutData.responsabilidades.length) {
    const cbs = document.querySelectorAll('input[id^="tpf-resp-"]') as NodeListOf<HTMLInputElement>;
    cbs.forEach(cb => cb.checked = false);

    rutData.responsabilidades.forEach(code => {
      const cb = document.getElementById(`tpf-resp-${code}`) as HTMLInputElement;
      if (cb) cb.checked = true;
    });
  }

  highlightInputs();
}

function normalizeGeoName(name: string): string {
  return name.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/, " ")
    .replace(/[^A-Za-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function highlightInputs() {
  const selectors = [
    '#tpf-doc-number', '#tpf-dv', '#tpf-business-name', '#tpf-first-name',
    '#tpf-last-name', '#tpf-address', '#tpf-email', '#tpf-phone',
    '#tpf-dept-select', '#tpf-city-select'
  ];
  selectors.forEach(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    if (el && (el as HTMLInputElement).value) {
      el.style.borderColor = '#10B981';
      el.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
      el.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }, 3000);
    }
  });
}
