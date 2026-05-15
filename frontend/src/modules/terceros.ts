/**
 * GRAVY v2.0 — terceros.js (v2)
 * Maestro de Terceros: clientes, proveedores, empleados, acreedores y transportistas.
 */
'use strict';

/* ═══════════════════════════════════════════════════════════
   LISTA / TABLA
═══════════════════════════════════════════════════════════ */
async function renderTerceros(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando terceros...</div>`;
  try {
    const rows = await pb.listAll('third_parties', { sort: 'name' });

    const personBadge = (pt) => {
      if (pt === 'JURIDICA')           return '<span class="badge badge-blue"><i class="fas fa-building mr-1"></i>Jurídica</span>';
      if (pt === 'GRAN_CONTRIBUYENTE') return '<span class="badge badge-orange"><i class="fas fa-landmark mr-1"></i>Gran Contr.</span>';
      return '<span class="badge badge-gray"><i class="fas fa-user mr-1"></i>Natural</span>';
    };
    const typeBadge = (t) => {
      const map = { CLIENTE:'badge-green', PROVEEDOR:'badge-blue', EMPLEADO:'badge-orange',
                    ACREEDOR:'badge-gray', TRANSPORTISTA:'badge-blue', OTRO:'badge-gray' };
      const label = TP_TYPES.find(x => x.code === t)?.name ?? t;
      return `<span class="badge ${map[t] ?? 'badge-gray'}">${esc(label)}</span>`;
    };

    c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Terceros</h3>
        <p class="text-sm" style="color:#6B7280">Clientes, proveedores, empleados y más.</p>
      </div>
      ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-tp"><i class="fas fa-user-plus"></i> Nuevo Tercero</button>' : ''}
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
              <th>Correo</th><th>Ciudad</th><th>Rol</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(r => `
              <tr data-type="${esc(r.type)}" data-person="${esc(r.person_type||'NATURAL')}">
                <td>${personBadge(r.person_type)}</td>
                <td><span class="font-semibold">${esc(r.doc_type)} ${esc(r.doc_number)}${r.dv?`-${esc(r.dv)}`:''}</span></td>
                <td>${esc(r.name)}</td>
                <td>${esc(r.email||'—')}</td>
                <td>${esc(r.city||'—')}</td>
                <td>${typeBadge(r.type)}</td>
                <td>${r.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editTercero('${esc(r.id)}')"><i class="fas fa-pen"></i></button>` : ''}
                    ${can('canDelete') ? `<button class="btn btn-danger btn-sm" onclick="toggleTercero('${esc(r.id)}', ${r.active?'false':'true'})"><i class="fas ${r.active?'fa-ban':'fa-rotate-left'}"></i></button>` : ''}
                  </div>
                </td>
              </tr>`).join('') :
              '<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay terceros registrados.</td></tr>'}
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
        const active = tr.children[6]?.textContent.includes('Activo');
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
    { code: 'GRAN_CONTRIBUYENTE', label: 'Gran Contribuyente', icon: 'fa-landmark' },
  ];

  return /* html */`
  <!-- ── Tabs nav ─────────────────────────────────────────────── -->
  <div id="tpf-tab-nav"
    style="display:flex;border-bottom:2px solid #E5E7EB;margin:-4px -4px 16px;overflow-x:auto">
    ${['Identificación','Nombre y Contacto','Ubicación','Crédito'].map((label,i) => `
      <button type="button" id="tpf-tab-${i}" onclick="_tpfSwitchTab(${i})"
        style="padding:10px 14px;border:none;background:none;cursor:pointer;font-size:13px;
               white-space:nowrap;margin-bottom:-2px;
               border-bottom:2px solid ${i===0?'#E87D1E':'transparent'};
               color:${i===0?'#E87D1E':'#6B7280'};font-weight:${i===0?'600':'400'}">
        ${label}
      </button>`).join('')}
  </div>

  <!-- ══ TAB 0 — Identificación ══════════════════════════════════ -->
  <div id="tpf-panel-0">
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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Tipo Tercero <span style="color:#EF4444">*</span></label>
        <select id="tpf-type" class="form-input">
          ${TP_TYPES.map(t => `<option value="${esc(t.code)}" ${row?.type===t.code?'selected':''}>${esc(t.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="tpf-active" class="form-input">
          <option value="1" ${row?.active!==false?'selected':''}>Activo</option>
          <option value="0" ${row?.active===false?'selected':''}>Inactivo</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Documento <span style="color:#EF4444">*</span></label>
        <select id="tpf-doc-type" class="form-input">
          ${DOC_TYPES.map(d => `<option value="${esc(d.code)}" ${row?.doc_type===d.code?'selected':''}>${esc(d.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Número de Documento <span style="color:#EF4444">*</span></label>
        <input id="tpf-doc-number" class="form-input" value="${esc(row?.doc_number||'')}"
          placeholder="Ej: 900123456" inputmode="numeric">
      </div>
      <div class="form-group" id="tpf-dv-wrap" style="${row?.doc_type==='NIT'?'':'display:none'}">
        <label class="form-label">Dígito de Verificación (DV)
          <span style="font-size:11px;color:#9CA3AF;font-weight:400"> — calculado automáticamente</span>
        </label>
        <input id="tpf-dv" class="form-input" value="${esc(row?.dv||'')}" readonly
          style="background:#F9FAFB;font-size:22px;font-weight:700;text-align:center;
                 letter-spacing:6px;color:#E87D1E;max-width:100px">
      </div>
      <div class="form-group">
        <label class="form-label">Régimen Tributario</label>
        <select id="tpf-tax" class="form-input">
          <option value="">Sin especificar</option>
          ${TAX_REGIMES.map(t => `<option value="${esc(t.code)}" ${row?.tax_regime===t.code?'selected':''}>${esc(t.name)}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>

  <!-- ══ TAB 1 — Nombre y Contacto ════════════════════════════════ -->
  <div id="tpf-panel-1" style="display:none">
    <!-- Persona Natural -->
    <div id="tpf-section-natural" style="${isNatural?'':'display:none'}">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px">
        Nombre de la persona</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
    <!-- Persona Jurídica / Gran Contribuyente -->
    <div id="tpf-section-juridica" style="${isNatural?'display:none':''}">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px">
        Razón social</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="form-group md:col-span-2">
          <label class="form-label">Razón Social <span style="color:#EF4444">*</span></label>
          <input id="tpf-business-name" class="form-input" value="${esc(row?.business_name||'')}"
            placeholder="CERAMICAS CONSTRUHOGAR S.A.S." style="text-transform:uppercase">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label">Nombre Comercial</label>
          <input id="tpf-commercial-name" class="form-input" value="${esc(row?.commercial_name||'')}"
            placeholder="Nombre que usa comercialmente" style="text-transform:uppercase">
        </div>
      </div>
    </div>
    <!-- Contacto -->
    <div style="border-top:1px solid #F0F0F0;padding-top:14px">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9CA3AF;margin-bottom:10px">
        Información de contacto</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Nombre del Contacto</label>
          <input id="tpf-contact-name" class="form-input" value="${esc(row?.contact_name||'')}"
            placeholder="Persona de contacto en la empresa">
        </div>
        <div class="form-group">
          <label class="form-label">Asesor Comercial</label>
          <input id="tpf-advisor" class="form-input" value="${esc(row?.advisor||'')}"
            placeholder="Vendedor asignado">
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
          <label class="form-label">Email 1
            <span style="font-size:11px;color:#3B82F6;font-weight:400">
              <i class="fas fa-info-circle"></i> obligatorio para facturación electrónica
            </span>
          </label>
          <input id="tpf-email" type="email" class="form-input" value="${esc(row?.email||'')}"
            placeholder="correo@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Email 2</label>
          <input id="tpf-email2" type="email" class="form-input" value="${esc(row?.email2||'')}"
            placeholder="correo.alternativo@empresa.com">
        </div>
      </div>
    </div>
  </div>

  <!-- ══ TAB 2 — Ubicación ════════════════════════════════════════ -->
  <div id="tpf-panel-2" style="display:none">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- ── País ─────────────────────────────────────────── -->
      <div class="form-group md:col-span-2">
        <label class="form-label">País</label>
        <select id="tpf-country" class="form-input">
          <option value="">Seleccionar país...</option>
          ${GEO_PAISES.map(p => `<option value="${esc(p.code)}" ${countryCode===p.code?'selected':''}>${esc(p.name.charAt(0)+p.name.slice(1).toLowerCase())}</option>`).join('')}
        </select>
      </div>

      <!-- ── Sección Colombia ──────────────────────────────── -->
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
          <!-- Cód DANE Departamento (readonly, auto) -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Departamento</label>
            <input id="tpf-dept-code" class="form-input" value="${esc(selDept?.code||deptCode)}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-department" value="${esc(selDept?.name||deptName)}">

          <!-- Ciudad / Municipio (cascada desde departamento) -->
          <div class="form-group">
            <label class="form-label">Ciudad / Municipio <span style="color:#EF4444">*</span></label>
            <select id="tpf-city-select" class="form-input">
              <option value="">— seleccione departamento primero —</option>
              ${selDept ? geoMunisByDept(selDept.code).map(m => `<option value="${esc(m.code)}" ${row?.city_code===m.code?'selected':''}>${esc(m.name)}</option>`).join('') : ''}
            </select>
          </div>
          <!-- Cód DANE Municipio (readonly, auto) -->
          <div class="form-group">
            <label class="form-label">Cód. DANE Municipio</label>
            <input id="tpf-city-code" class="form-input" value="${esc(row?.city_code||'')}"
              readonly style="background:#F9FAFB;color:#6B7280;font-weight:600" placeholder="Auto">
          </div>
          <input type="hidden" id="tpf-city" value="${esc(row?.city||'')}">
        </div>
      </div>

      <!-- Dirección -->
      <div class="form-group md:col-span-2">
        <label class="form-label">Dirección</label>
        <input id="tpf-address" class="form-input" value="${esc(row?.address||'')}"
          placeholder="CR 8 73-25" style="text-transform:uppercase">
      </div>
    </div>
  </div>

  <!-- ══ TAB 3 — Condiciones de Crédito ══════════════════════════ -->
  <div id="tpf-panel-3" style="display:none">
    <div style="background:#FFF7F0;border:1px solid #FDE8D4;border-radius:10px;
                padding:12px 16px;margin-bottom:16px">
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
      <div class="form-group">
        <label class="form-label">Plazo de Crédito (días)</label>
        <input id="tpf-payment-days" type="number" min="0" class="form-input"
          value="${esc(row?.payment_days ?? 0)}" placeholder="0">
      </div>
    </div>
  </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS DEL FORMULARIO  (deben ser globales: se usan en onclick inline)
═══════════════════════════════════════════════════════════ */
function _tpfSwitchTab(idx) {
  for (let i = 0; i < 4; i++) {
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

  // Jurídica/Gran Contribuyente → sugerir NIT
  if (isJuridica) {
    const docEl = $('#tpf-doc-type');
    if (docEl && docEl.value !== 'NIT') { docEl.value = 'NIT'; _tpfUpdateDV(); }
  }
}

function _tpfUpdateDV() {
  const docType = getSelectVal('tpf-doc-type');
  const wrap    = $('#tpf-dv-wrap');
  const dvEl    = $('#tpf-dv');
  if (!dvEl) return;
  if (docType === 'NIT') {
    if (wrap) wrap.style.display = '';
    dvEl.value = calcDV(getInputVal('tpf-doc-number'));
  } else {
    if (wrap) wrap.style.display = 'none';
    dvEl.value = '';
  }
}

function _tpfUpdateCountry() {
  const countryCode = getSelectVal('tpf-country');
  const isColombia  = countryCode === 'CO';
  const sec = $('#tpf-section-colombia');
  if (sec) sec.style.display = isColombia ? '' : 'none';
  // Limpiar cascada si cambia a no-Colombia
  if (!isColombia) {
    setInputVal('tpf-dept-code',  '');
    setInputVal('tpf-department', '');
    const cityEl = $('#tpf-city-select');
    if (cityEl) { cityEl.innerHTML = '<option value="">—</option>'; }
    setInputVal('tpf-city-code', '');
    setInputVal('tpf-city', '');
  }
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
  $('#tpf-doc-number')?.addEventListener('input', _tpfUpdateDV);
  $('#tpf-country')?.addEventListener('change', _tpfUpdateCountry);
  $('#tpf-dept-select')?.addEventListener('change', _tpfUpdateDept);

  // Uppercase en tiempo real (preservando posición del cursor)
  ['tpf-first-name','tpf-last-name','tpf-business-name','tpf-commercial-name',
   'tpf-address'].forEach(id => {
    const el = $(`#${id}`);
    if (!el) return;
    el.addEventListener('input', () => {
      const pos = el.selectionStart;
      el.value  = el.value.toUpperCase();
      el.setSelectionRange(pos, pos);
    });
  });
  $('#tpf-city-select')?.addEventListener('change', _tpfUpdateCity);
}

/* ═══════════════════════════════════════════════════════════
   PAYLOAD
═══════════════════════════════════════════════════════════ */
function terceroPayload() {
  const pt        = _tpfCurrentPersonType();
  const isNatural = pt === 'NATURAL';

  const firstName  = getInputVal('tpf-first-name').toUpperCase();
  const lastName   = getInputVal('tpf-last-name').toUpperCase();
  const bizName    = getInputVal('tpf-business-name').toUpperCase();
  const comName    = getInputVal('tpf-commercial-name').toUpperCase();
  // Campo combinado para compatibilidad con búsqueda y otros módulos
  const name       = isNatural
    ? [firstName, lastName].filter(Boolean).join(' ')
    : (bizName || comName);

  const country    = getSelectVal('tpf-country') || 'CO';
  const isColombia = country === 'CO';

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
    advisor:         getInputVal('tpf-advisor'),
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
    tax_regime:      getSelectVal('tpf-tax'),
    credit_limit:    parseFloat(getInputVal('tpf-credit-limit'))  || 0,
    max_invoices:    parseInt(getInputVal('tpf-max-invoices'), 10) || 1,
    payment_days:    parseInt(getInputVal('tpf-payment-days'), 10) || 0,
    active:          getSelectVal('tpf-active') === '1',
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
  const isNatural = p.person_type === 'NATURAL';
  if (isNatural && (!p.first_name || !p.last_name)) {
    _tpfSwitchTab(1);
    showToast('Nombres y Apellidos son obligatorios para persona natural', 'warning'); return false;
  }
  if (!isNatural && !p.business_name) {
    _tpfSwitchTab(1);
    showToast('La Razón Social es obligatoria', 'warning'); return false;
  }
  if (!p.name) {
    _tpfSwitchTab(1);
    showToast('El nombre no puede quedar vacío', 'warning'); return false;
  }
  if (p.country === 'CO' && (!p.city || !p.department)) {
    _tpfSwitchTab(2);
    showToast('Departamento y Ciudad son obligatorios para Colombia', 'warning'); return false;
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════
   ABRIR FORMULARIO
═══════════════════════════════════════════════════════════ */
function openTerceroForm(row = null) {
  if (!can('canWrite')) return showToast('No tienes permisos para gestionar terceros', 'error');
  openModal(
    row ? 'Editar Tercero' : 'Nuevo Tercero',
    terceroFormHtml(row),
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tp"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    true
  );
  setTimeout(() => {
    _tpfBindEvents();
    _tpfUpdateDV();
    _tpfUpdatePersonType();
    // Si estamos editando y hay departamento, pre-poblar el selector de ciudades
    // y seleccionar el municipio guardado
    if (row?.dept_code) {
      const cityEl = $('#tpf-city-select');
      if (cityEl) {
        const munis = geoMunisByDept(row.dept_code);
        const savedCode = row.city_code || '';
        cityEl.innerHTML = '<option value="">Seleccionar municipio...</option>' +
          munis.map(m =>
            `<option value="${esc(m.code)}" ${m.code === savedCode ? 'selected' : ''}>${esc(m.name)}</option>`
          ).join('');
        // Sync hidden fields
        setInputVal('tpf-city-code', savedCode);
        setInputVal('tpf-city', munis.find(m => m.code === savedCode)?.name || row.city || '');
      }
    }
  }, 30);

  $('#btn-save-tp')?.addEventListener('click', async () => {
    const payload = terceroPayload();
    if (!_tpfValidate(payload)) return;
    const btn = $('#btn-save-tp');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
    try {
      if (row?.id) {
        await pb.update('third_parties', row.id, payload);
        await API.logAudit('UPDATE', 'Tercero', row.id,
          `${payload.doc_type} ${payload.doc_number} - ${payload.name}`);
      } else {
        const created = await pb.create('third_parties', payload);
        await API.logAudit('CREATE', 'Tercero', created.id,
          `${payload.doc_type} ${payload.doc_number} - ${payload.name}`);
      }
      closeModal();
      showToast('Tercero guardado correctamente', 'success');
      renderTerceros($('#page-content'));
    } catch (err) {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
      showToast(err.message, 'error');
    }
  });
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
(window as any)._tpfUpdateCity = _tpfUpdateCity;
(window as any)._tpfUpdateDV = _tpfUpdateDV;
(window as any).terceroFormHtml = terceroFormHtml;
(window as any)._tpfCurrentPersonType = _tpfCurrentPersonType;
