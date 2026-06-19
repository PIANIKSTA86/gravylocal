/**
 * GRAVY v2.0 — productos.js
 * Catálogo maestro de Productos y Servicios (F1).
 * Sirve de base para Facturación, CRM, Inventarios y POS.
 */
'use strict';

// ── Constantes de dominio ─────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  { value: 'BIEN',     label: 'Bien (producto físico)' },
  { value: 'SERVICIO', label: 'Servicio' },
];

const PRODUCT_UNITS = [
  'UND','KG','GR','LT','ML','MT','CM','M2','M3',
  'CJ','BL','GL','PAR','HORA','DIA','MES','SVC',
];

const IVA_RATES = [
  { value: 0,  label: '0% — Excluido / Exento' },
  { value: 5,  label: '5% — Tarifa diferencial' },
  { value: 19, label: '19% — Tarifa general'   },
];

function toNullableNumber(raw) {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function specialConditionsSummary(sc) {
  const items = [];
  if (sc.posicion_arancelaria) items.push(`P.Arancelaria: ${sc.posicion_arancelaria}`);
  if (sc.arancel_rate_default !== null && sc.arancel_rate_default !== undefined) items.push(`Arancel: ${sc.arancel_rate_default}%`);
  if (sc.pais_origen) items.push(`Origen: ${sc.pais_origen}`);
  if (sc.visto_bueno_required) items.push(`V.B. [${sc.visto_bueno_entidad || 'S/E'}]`);
  if (sc.peso !== null) items.push(`Peso: ${fmtN(sc.peso)}`);
  if (sc.peso_neto !== null) items.push(`Neto: ${fmtN(sc.peso_neto)}`);
  if (sc.peso_bruto !== null) items.push(`Bruto: ${fmtN(sc.peso_bruto)}`);
  if (sc.largo_cm !== null) items.push(`L: ${fmtN(sc.largo_cm)} cm`);
  if (sc.ancho_cm !== null) items.push(`A: ${fmtN(sc.ancho_cm)} cm`);
  if (sc.alto_cm !== null) items.push(`H: ${fmtN(sc.alto_cm)} cm`);
  return items.length ? items.join(' | ') : 'Sin condiciones especiales registradas';
}

function openSpecialConditionsModal(current, onApply) {
  const overlayId = 'special-conditions-overlay';
  const prev = document.getElementById(overlayId);
  if (prev) prev.remove();

  const ENTIDADES = ["ICA", "INVIMA", "SIC", "INDUMIL", "AUNAP", "MINCIT", "OTRO"];

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'modal-overlay show';
  overlay.style.zIndex = '200';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:720px">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-semibold" style="color:#0D2137"><i class="fas fa-sliders mr-2 text-blue-700"></i>Condiciones especiales e Importación</h4>
        <button class="btn btn-outline btn-sm" id="sc-close-btn"><i class="fas fa-xmark"></i></button>
      </div>
      <p class="text-sm mb-4" style="color:#6B7280">Ingresa la información técnica y aduanera para los procesos de logística e importación (DIAN / VUCE).</p>
      
      <!-- Tabs Selector -->
      <div class="flex gap-2 border-b mb-4" style="border-color:#F0F0F0">
        <button type="button" class="tab-btn active" id="sc-tab-btn-logistica">
          <i class="fas fa-boxes-stacked mr-1"></i> Logística de Carga
        </button>
        <button type="button" class="tab-btn" id="sc-tab-btn-aduanas">
          <i class="fas fa-scale-balanced mr-1"></i> Clasificación y VUCE
        </button>
      </div>

      <div class="max-h-[50vh] overflow-y-auto pr-1">
        <!-- Pestaña 1: Logística de Carga -->
        <div id="sc-panel-logistica" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group">
            <label class="form-label text-xs">Peso (General)</label>
            <input id="sc-peso" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.peso ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Cajas en Pallet</label>
            <input id="sc-cajas-en-pallet" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.cajas_en_pallet ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Unidades por Empaque</label>
            <input id="sc-und-empaque" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.und_empaque ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Peso x Unidad Empaque</label>
            <input id="sc-peso-x-und-empaque" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.peso_x_und_empaque ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Peso Neto (Kg) <small style="color:#9CA3AF">(sin empaque)</small></label>
            <input id="sc-peso-neto" type="number" min="0" step="0.0001" class="form-input text-right font-semibold" value="${current.peso_neto ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Peso Bruto (Kg) <small style="color:#9CA3AF">(con empaque/pallet)</small></label>
            <input id="sc-peso-bruto" type="number" min="0" step="0.0001" class="form-input text-right font-semibold" value="${current.peso_bruto ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Largo (cm)</label>
            <input id="sc-largo-cm" type="number" min="0" step="0.1" class="form-input text-right font-semibold" value="${current.largo_cm ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Ancho (cm)</label>
            <input id="sc-ancho-cm" type="number" min="0" step="0.1" class="form-input text-right font-semibold" value="${current.ancho_cm ?? ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Alto (cm)</label>
            <input id="sc-alto-cm" type="number" min="0" step="0.1" class="form-input text-right font-semibold" value="${current.alto_cm ?? ''}" placeholder="0">
          </div>
        </div>

        <!-- Pestaña 2: Clasificación y VUCE -->
        <div id="sc-panel-aduanas" class="grid grid-cols-1 md:grid-cols-2 gap-3 hidden">
          <div class="form-group">
            <label class="form-label text-xs">Posición Arancelaria <small style="color:#9CA3AF">(10 dígitos)</small></label>
            <input id="sc-posicion-arancelaria" type="text" maxlength="10" class="form-input font-mono font-semibold" value="${current.posicion_arancelaria ?? ''}" placeholder="Ej: 1501100000">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Arancel Base (%)</label>
            <input id="sc-arancel-rate-default" type="number" min="0" max="100" step="0.1" class="form-input text-right font-semibold text-blue-700" value="${current.arancel_rate_default ?? ''}" placeholder="10">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">País de Origen</label>
            <input id="sc-pais-origen" type="text" class="form-input font-semibold" value="${current.pais_origen ?? ''}" placeholder="Ej: China, Estados Unidos">
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Marca / Modelo</label>
            <div class="flex gap-2">
              <input id="sc-marca" class="form-input text-xs font-semibold" placeholder="Marca" value="${current.marca ?? ''}">
              <input id="sc-modelo" class="form-input text-xs font-semibold" placeholder="Modelo" value="${current.modelo ?? ''}">
            </div>
          </div>
          <div class="col-span-2 form-group flex items-center gap-2 mt-2">
            <label class="inline-flex items-center gap-2 cursor-pointer font-semibold text-xs text-gray-800">
              <input type="checkbox" id="sc-visto-bueno-required" class="rounded text-[#E87D1E] focus:ring-[#E87D1E]" ${current.visto_bueno_required ? 'checked' : ''}>
              <span>¿Requiere Visto Bueno / Permiso Previo?</span>
            </label>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Entidad de Visto Bueno</label>
            <select id="sc-visto-bueno-entidad" class="form-input">
              <option value="">— Ninguna —</option>
              ${ENTIDADES.map(ent => `<option value="${ent}" ${current.visto_bueno_entidad === ent ? 'selected' : ''}>${ent}</option>`).join('')}
            </select>
          </div>
          <div class="form-group col-span-2">
            <label class="form-label text-xs">Registro Sanitario / Nro. Registro de Venta</label>
            <input id="sc-registro-sanitario" type="text" class="form-input font-mono font-semibold" value="${current.registro_sanitario ?? ''}" placeholder="Ej: Registro INVIMA Nro, Registro ICA...">
          </div>
        </div>
      </div>
      
      <p id="sc-dims-validation" class="text-xs font-semibold mt-2 hidden"></p>
      <p id="sc-cbm-preview" class="text-xs font-semibold mt-1 hidden"></p>
      <p class="text-[11px] mt-1" style="color:#6B7280">
        Guia de calculo: CBM por unidad = (Largo cm x Ancho cm x Alto cm) / 1,000,000.
      </p>

      <div class="flex justify-end gap-2 mt-5">
        <button class="btn btn-outline" id="sc-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="sc-apply-btn"><i class="fas fa-check"></i> Aplicar</button>
      </div>
    </div>`;

  const close = () => overlay.remove();
  document.body.appendChild(overlay);

  // Eventos de Pestañas (Tabs)
  const btnLogistica = overlay.querySelector('#sc-tab-btn-logistica');
  const btnAduanas = overlay.querySelector('#sc-tab-btn-aduanas');
  const panelLogistica = overlay.querySelector('#sc-panel-logistica');
  const panelAduanas = overlay.querySelector('#sc-panel-aduanas');

  const switchTab = (tab: 'logistica' | 'aduanas') => {
    if (tab === 'logistica') {
      btnLogistica?.classList.add('active');
      btnAduanas?.classList.remove('active');
      panelLogistica?.classList.remove('hidden');
      panelAduanas?.classList.add('hidden');
    } else {
      btnLogistica?.classList.remove('active');
      btnAduanas?.classList.add('active');
      panelLogistica?.classList.add('hidden');
      panelAduanas?.classList.remove('hidden');
    }
  };

  btnLogistica?.addEventListener('click', () => switchTab('logistica'));
  btnAduanas?.addEventListener('click', () => switchTab('aduanas'));

  // Manejo contextual de Vistos Buenos
  const checkVb = overlay.querySelector('#sc-visto-bueno-required') as HTMLInputElement;
  const selectEntidad = overlay.querySelector('#sc-visto-bueno-entidad') as HTMLSelectElement;
  const inputRegistro = overlay.querySelector('#sc-registro-sanitario') as HTMLInputElement;
  const applyBtn = overlay.querySelector('#sc-apply-btn') as HTMLButtonElement;
  const dimsValidationMsg = overlay.querySelector('#sc-dims-validation') as HTMLElement;
  const cbmPreviewMsg = overlay.querySelector('#sc-cbm-preview') as HTMLElement;
  const dimInputs = [
    overlay.querySelector('#sc-largo-cm') as HTMLInputElement,
    overlay.querySelector('#sc-ancho-cm') as HTMLInputElement,
    overlay.querySelector('#sc-alto-cm') as HTMLInputElement,
  ];

  const validateDimensionInputs = () => {
    const dimValues = dimInputs.map((inp) => toNullableNumber(inp?.value));
    const filledCount = dimValues.filter((v) => v !== null).length;

    let invalid = false;
    let msg = '';

    if (filledCount > 0 && filledCount < 3) {
      invalid = true;
      msg = 'Para cubicaje diligencia Largo, Ancho y Alto completos; o deja los tres vacios.';
    } else if (filledCount === 3 && dimValues.some((v) => Number(v) <= 0)) {
      invalid = true;
      msg = 'Largo, Ancho y Alto deben ser mayores a cero.';
    }

    if (applyBtn) {
      applyBtn.disabled = invalid;
      applyBtn.style.opacity = invalid ? '0.6' : '';
      applyBtn.style.cursor = invalid ? 'not-allowed' : '';
    }

    if (dimsValidationMsg) {
      if (invalid) {
        dimsValidationMsg.textContent = msg;
        dimsValidationMsg.classList.remove('hidden');
        dimsValidationMsg.style.color = '#B91C1C';
      } else {
        dimsValidationMsg.textContent = '';
        dimsValidationMsg.classList.add('hidden');
      }
    }

    if (cbmPreviewMsg) {
      if (!invalid && filledCount === 3) {
        const largo = Number(dimValues[0]);
        const ancho = Number(dimValues[1]);
        const alto = Number(dimValues[2]);
        const cbm = (largo * ancho * alto) / 1000000;
        cbmPreviewMsg.textContent = `CBM estimado por unidad: ${cbm.toFixed(6)} m3`;
        cbmPreviewMsg.classList.remove('hidden');
        cbmPreviewMsg.style.color = '#1D4ED8';
      } else {
        cbmPreviewMsg.textContent = '';
        cbmPreviewMsg.classList.add('hidden');
      }
    }
  };

  const toggleVbFields = () => {
    const isChecked = checkVb?.checked || false;
    if (selectEntidad) {
      selectEntidad.disabled = !isChecked;
      if (!isChecked) selectEntidad.value = '';
    }
    if (inputRegistro) {
      inputRegistro.disabled = !isChecked;
      if (!isChecked) inputRegistro.value = '';
    }
  };

  checkVb?.addEventListener('change', toggleVbFields);
  toggleVbFields(); // Sincronización inicial al abrir

  dimInputs.forEach((inp) => {
    inp?.addEventListener('input', validateDimensionInputs);
  });
  validateDimensionInputs();

  overlay.querySelector('#sc-close-btn')?.addEventListener('click', close);
  overlay.querySelector('#sc-cancel-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  overlay.querySelector('#sc-apply-btn')?.addEventListener('click', () => {
    if (applyBtn?.disabled) return;

    const isVbReq = (document.getElementById('sc-visto-bueno-required') as HTMLInputElement)?.checked || false;
    onApply({
      peso: toNullableNumber(getInputVal('sc-peso')),
      cajas_en_pallet: toNullableNumber(getInputVal('sc-cajas-en-pallet')),
      und_empaque: toNullableNumber(getInputVal('sc-und-empaque')),
      peso_x_und_empaque: toNullableNumber(getInputVal('sc-peso-x-und-empaque')),
      peso_neto: toNullableNumber(getInputVal('sc-peso-neto')),
      peso_bruto: toNullableNumber(getInputVal('sc-peso-bruto')),
      largo_cm: toNullableNumber(getInputVal('sc-largo-cm')),
      ancho_cm: toNullableNumber(getInputVal('sc-ancho-cm')),
      alto_cm: toNullableNumber(getInputVal('sc-alto-cm')),
      posicion_arancelaria: getInputVal('sc-posicion-arancelaria').trim(),
      arancel_rate_default: toNullableNumber(getInputVal('sc-arancel-rate-default')),
      pais_origen: getInputVal('sc-pais-origen').trim(),
      marca: getInputVal('sc-marca').trim(),
      modelo: getInputVal('sc-modelo').trim(),
      visto_bueno_required: isVbReq,
      visto_bueno_entidad: getSelectVal('sc-visto-bueno-entidad') || '',
      registro_sanitario: getInputVal('sc-registro-sanitario').trim(),
    });
    close();
  });
}

// ── Catálogo de Categorías y Líneas (guardado en settings) ───────────────────
async function loadProductCatalog() {
  try {
    const raw = await API.getSetting('product_catalog_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        lines:      Array.isArray(parsed.lines)      ? parsed.lines      : [],
      };
    }
  } catch (_) {}
  return { categories: [], lines: [] };
}

async function saveProductCatalog(cat) {
  await API.setSetting('product_catalog_v1', JSON.stringify(cat));
}

function openCatalogManagerModal(catalog, onSave) {
  const overlayId = 'catalog-manager-overlay';
  const prev = document.getElementById(overlayId);
  if (prev) prev.remove();

  const draft = {
    categories: [...(catalog.categories || [])],
    lines:      [...(catalog.lines      || [])],
  };

  function buildList(items, ltype) {
    if (!items.length) {
      return `<p class="text-xs italic py-4 text-center text-gray-400"><i class="fas fa-folder-open mr-1"></i> Sin elementos. Agrega el primero.</p>`;
    }
    return items.map((item, i) => `
      <div class="flex items-center justify-between gap-2 py-1.5 px-2.5 hover:bg-white rounded-lg transition-colors border-b border-gray-100/50" style="border-color:#F5F5F5">
        <span class="text-sm font-medium text-gray-800">${esc(item)}</span>
        <button type="button" class="cm-del text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer" data-idx="${i}" data-ltype="${ltype}" title="Eliminar" style="width:26px; height:26px;">
          <i class="fas fa-trash text-xs"></i>
        </button>
      </div>`).join('');
  }

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'modal-overlay show';
  overlay.style.zIndex = '200';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:680px">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-semibold" style="color:#0D2137"><i class="fas fa-tags mr-2" style="color:#64E1FF"></i>Gestionar Categorías y Líneas</h4>
        <button type="button" class="btn btn-outline btn-sm" id="cm-close-btn"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p class="form-label mb-2 flex items-center justify-between">
            <span>Categorías de producto</span>
            <span class="badge badge-blue text-xs font-semibold" id="cm-cat-badge">0</span>
          </p>
          <div class="bg-gray-50 border rounded-xl p-2 mb-3" style="border-color:#E5E7EB">
            <div id="cm-cat-list" class="overflow-y-auto pr-1" style="max-height: 220px; min-height: 48px;">
              ${buildList(draft.categories, 'categories')}
            </div>
          </div>
          <div class="flex gap-2">
            <input id="cm-new-cat" class="form-input flex-1" placeholder="Nueva categoría..." maxlength="80">
            <button type="button" class="btn btn-outline btn-sm" id="cm-add-cat-btn"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <div>
          <p class="form-label mb-2 flex items-center justify-between">
            <span>Líneas de producto</span>
            <span class="badge badge-blue text-xs font-semibold" id="cm-line-badge">0</span>
          </p>
          <div class="bg-gray-50 border rounded-xl p-2 mb-3" style="border-color:#E5E7EB">
            <div id="cm-line-list" class="overflow-y-auto pr-1" style="max-height: 220px; min-height: 48px;">
              ${buildList(draft.lines, 'lines')}
            </div>
          </div>
          <div class="flex gap-2">
            <input id="cm-new-line" class="form-input flex-1" placeholder="Nueva línea..." maxlength="80">
            <button type="button" class="btn btn-outline btn-sm" id="cm-add-line-btn"><i class="fas fa-plus"></i></button>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-5">
        <button type="button" class="btn btn-outline" id="cm-cancel-btn">Cancelar</button>
        <button type="button" class="btn btn-primary" id="cm-save-btn"><i class="fas fa-floppy-disk"></i> Guardar</button>
      </div>
    </div>`;

  const close = () => overlay.remove();
  document.body.appendChild(overlay);

  function repaint() {
    overlay.querySelector('#cm-cat-list').innerHTML  = buildList(draft.categories, 'categories');
    overlay.querySelector('#cm-line-list').innerHTML = buildList(draft.lines, 'lines');
    
    // Update badge counts
    const catBadge = overlay.querySelector('#cm-cat-badge');
    const lineBadge = overlay.querySelector('#cm-line-badge');
    if (catBadge) catBadge.textContent = String(draft.categories.length);
    if (lineBadge) lineBadge.textContent = String(draft.lines.length);

    bindDel();
  }
  function bindDel() {
    overlay.querySelectorAll('.cm-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const hbtn = btn as HTMLElement;
        const ltype = hbtn.dataset.ltype as 'categories' | 'lines';
        const idx = Number(hbtn.dataset.idx);
        draft[ltype].splice(idx, 1);
        repaint();
      });
    });
  }
  
  repaint(); // Initial call to setup badges and attach event listeners

  overlay.querySelector('#cm-close-btn')?.addEventListener('click', close);
  overlay.querySelector('#cm-cancel-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });

  const addCat = () => {
    const inp = overlay.querySelector('#cm-new-cat') as HTMLInputElement;
    const val = (inp?.value || '').trim();
    if (!val) return;
    if (draft.categories.includes(val)) { showToast('Ya existe esa categoría', 'warning'); return; }
    draft.categories.push(val);
    inp.value = '';
    repaint();
  };
  overlay.querySelector('#cm-add-cat-btn')?.addEventListener('click', addCat);
  overlay.querySelector('#cm-new-cat')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addCat(); } });

  const addLine = () => {
    const inp = overlay.querySelector('#cm-new-line') as HTMLInputElement;
    const val = (inp?.value || '').trim();
    if (!val) return;
    if (draft.lines.includes(val)) { showToast('Ya existe esa línea', 'warning'); return; }
    draft.lines.push(val);
    inp.value = '';
    repaint();
  };
  overlay.querySelector('#cm-add-line-btn')?.addEventListener('click', addLine);
  overlay.querySelector('#cm-new-line')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addLine(); } });

  overlay.querySelector('#cm-save-btn')?.addEventListener('click', async () => {
    const btn = overlay.querySelector('#cm-save-btn') as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
    try {
      await saveProductCatalog(draft);
      showToast('Catálogo guardado', 'success');
      onSave({ categories: [...draft.categories], lines: [...draft.lines] });
      close();
    } catch (err) {
      showToast(err.message || 'No se pudo guardar', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
    }
  });
}

// ── Render principal ──────────────────────────────────────────────────────────
async function renderProductos(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando productos...</div>`;

  try {
    const [products, accounts, catalog] = await Promise.all([
      API.getProducts({ activeOnly: false }),
      API.getAccounts(false),
      loadProductCatalog(),
    ]);

    const activeCount    = products.filter(p => p.active).length;
    const bienesCount    = products.filter(p => p.type === 'BIEN').length;
    const serviciosCount = products.filter(p => p.type === 'SERVICIO').length;

    // Listas dinámicas para filtros
    const categorias = [...new Set(products.map(p => p.categoria).filter(Boolean))].sort();
    const lineas     = [...new Set(products.map(p => p.linea).filter(Boolean))].sort();

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Productos y Servicios</h3>
          <p class="text-sm" style="color:#6B7280">Catálogo maestro — base de Facturación, CRM e Inventarios.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          ${can('canWrite') ? '<button class="btn btn-outline" id="btn-catalog-manager"><i class="fas fa-tags"></i> Categorías / Líneas</button>' : ''}
          ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-product"><i class="fas fa-plus"></i> Nuevo Producto/Servicio</button>' : ''}
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${kpiCard('Total catálogo', products.length, 'fas fa-box-open', '#1A4B8C', '#EEF4FF')}
        ${kpiCard('Activos', activeCount, 'fas fa-circle-check', '#059669', '#ECFDF5')}
        ${kpiCard('Bienes', bienesCount, 'fas fa-boxes-stacked', '#C46516', '#FFF8F0')}
        ${kpiCard('Servicios', serviciosCount, 'fas fa-handshake', '#7C3AED', '#F5F3FF')}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="prod-q" class="form-input flex-1 min-w-48" placeholder="Buscar por código o nombre...">
          <select id="prod-type" class="form-input" style="max-width:200px">
            <option value="">Todos los tipos</option>
            ${PRODUCT_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
          <select id="prod-iva" class="form-input" style="max-width:180px">
            <option value="">Todas las tarifas IVA</option>
            ${IVA_RATES.map(r => `<option value="${r.value}">${r.value}%</option>`).join('')}
          </select>
          <select id="prod-categoria" class="form-input" style="max-width:180px">
            <option value="">Todas las categorías</option>
            ${categorias.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
          </select>
          <select id="prod-linea" class="form-input" style="max-width:160px">
            <option value="">Todas las líneas</option>
            ${lineas.map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join('')}
          </select>
          <select id="prod-status" class="form-input" style="max-width:160px">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="prod-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Línea</th>
                <th>Unidad</th>
                <th class="text-right">IVA %</th>
                <th class="text-right">Precio base</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              ${products.length ? renderProductRows(products) : emptyRow(10)}
            </tbody>
          </table>
        </div>
      </div>`;

    // ── Eventos ───────────────────────────────────────────────
    const applyFilter = () => filterProductTable();
    $('#prod-q')?.addEventListener('input', debounce(applyFilter, 150));
    $('#prod-type')?.addEventListener('change', applyFilter);
    $('#prod-categoria')?.addEventListener('change', applyFilter);
    $('#prod-linea')?.addEventListener('change', applyFilter);
    $('#prod-iva')?.addEventListener('change', applyFilter);
    $('#prod-status')?.addEventListener('change', applyFilter);
    $('#btn-new-product')?.addEventListener('click', () => openProductForm(null, accounts, catalog));
    $('#btn-catalog-manager')?.addEventListener('click', () => {
      openCatalogManagerModal(catalog, (updated) => {
        Object.assign(catalog, updated);
        renderProductos($('#page-content'));
      });
    });

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

// ── Helpers de renderizado ────────────────────────────────────────────────────
function kpiCard(label, value, icon, color, bg) {
  return `<div class="rounded-2xl p-4" style="background:${bg};border:1px solid ${bg}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${icon} text-sm" style="color:${color}"></i>
      <span class="text-xs font-semibold" style="color:${color}">${label}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${color}">${fmtN(value)}</p>
  </div>`;
}

function renderProductRows(products) {
  return products.map(p => {
    const typeBadge = p.type === 'BIEN'
      ? '<span class="badge badge-blue">Bien</span>'
      : '<span class="badge" style="background:#F5F3FF;color:#7C3AED">Servicio</span>';
    const statusBadge = p.active
      ? '<span class="badge badge-green">Activo</span>'
      : '<span class="badge badge-gray">Inactivo</span>';
    const incomeAcct = p.expand?.income_account_id;
    return `<tr data-type="${esc(p.type)}" data-iva="${p.iva_rate ?? ''}" data-active="${p.active}" data-categoria="${esc(p.categoria || '')}" data-linea="${esc(p.linea || '')}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(p.code)}</span></td>
      <td class="font-medium">${esc(p.name)}</td>
      <td>${typeBadge}</td>
      <td class="text-sm">${esc(p.categoria || '—')}</td>
      <td class="text-sm">${esc(p.linea || '—')}</td>
      <td><span class="font-mono text-xs">${esc(p.unit || '—')}</span></td>
      <td class="text-right">${p.iva_rate ?? 0}%</td>
      <td class="text-right">${p.base_price ? fmt(p.base_price) : '—'}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewProductDetail('${esc(p.id)}')"><i class="fas fa-eye"></i></button>
          ${can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Editar" onclick="editProduct('${esc(p.id)}')"><i class="fas fa-pen"></i></button>` : ''}
          ${can('canWrite') ? `<button class="btn btn-outline btn-sm" title="${p.active ? 'Desactivar' : 'Activar'}" onclick="toggleProductStatus('${esc(p.id)}', ${!p.active})">
            <i class="fas ${p.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>` : ''}
          ${can('canDelete') ? `<button class="btn btn-danger btn-sm" title="Eliminar" onclick="deleteProduct('${esc(p.id)}', '${esc(p.name)}')"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function emptyRow(cols) {
  return `<tr><td colspan="${cols}" class="text-center py-10" style="color:#9CA3AF">
    <i class="fas fa-box-open mr-2"></i>No hay productos registrados.
  </td></tr>`;
}

// ── Filtro cliente ────────────────────────────────────────────────────────────
function filterProductTable() {
  const q        = (getInputVal('prod-q') || '').toLowerCase();
  const type     = getSelectVal('prod-type');
  const categoria = getSelectVal('prod-categoria');
  const linea    = getSelectVal('prod-linea');
  const iva      = getSelectVal('prod-iva');
  const status   = getSelectVal('prod-status');

  $$('#prod-table tbody tr[data-type]').forEach(tr => {
    const text    = tr.textContent.toLowerCase();
    const okQ     = !q        || text.includes(q);
    const okType  = !type     || tr.dataset.type      === type;
    const okCat   = !categoria|| tr.dataset.categoria === categoria;
    const okLinea = !linea    || tr.dataset.linea     === linea;
    const okIva   = !iva      || tr.dataset.iva       === iva;
    const okStat  = !status   || tr.dataset.active    === status;
    tr.style.display = okQ && okType && okCat && okLinea && okIva && okStat ? '' : 'none';
  });
}

// ── Ver detalle ───────────────────────────────────────────────────────────────
async function viewProductDetail(id) {
  try {
    const p = await pb.get('products', id, { expand: 'income_account_id,cost_account_id,inventory_account_id' });
    const typeLabel = PRODUCT_TYPES.find(t => t.value === p.type)?.label || p.type;
    const ivaLabel  = IVA_RATES.find(r => r.value === p.iva_rate)?.label || `${p.iva_rate}%`;
    const ia  = p.expand?.income_account_id;
    const ca  = p.expand?.cost_account_id;
    const inv = p.expand?.inventory_account_id;

    const imageUrl = p.image 
      ? `${(window as any).PB_URL}/api/files/products/${p.id}/${p.image}?thumb=300x300${(window as any).pb.authToken ? '&token=' + (window as any).pb.authToken : ''}`
      : '';
    const manifestUrl = p.manifest_pdf
      ? `${(window as any).PB_URL}/api/files/products/${p.id}/${p.manifest_pdf}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}`
      : '';

    const imageHtml = imageUrl 
      ? `<div class="flex flex-col items-center justify-center border rounded-2xl p-2 bg-gray-50/50 shadow-sm" style="border-color:#E5E7EB; max-width:240px; margin: 0 auto;">
          <img src="${imageUrl}" alt="${esc(p.name)}" class="rounded-xl object-cover w-full aspect-square bg-white border" style="border-color:#F0F0F0; max-height:200px">
          <p class="text-xs text-gray-500 mt-2"><i class="fas fa-image mr-1"></i>Imagen del Producto</p>
         </div>`
      : `<div class="flex flex-col items-center justify-center border border-dashed rounded-2xl p-6 bg-gray-50/30 text-gray-400" style="border-color:#D1D5DB; max-width:240px; margin: 0 auto; min-height: 200px;">
          <i class="fas fa-box-open text-3xl mb-2"></i>
          <p class="text-xs text-center">Sin imagen catalogada</p>
         </div>`;

    const manifestHtml = manifestUrl
      ? `<div class="mt-2">
          <a href="${manifestUrl}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors">
            <i class="fas fa-file-pdf"></i> Ver Manifiesto de Importación PDF
          </a>
         </div>`
      : `<p class="text-xs italic text-gray-400 mt-2">Sin manifiesto asociado</p>`;

    openModal(
      `Producto — ${esc(p.code)}`,
      `<div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div class="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><span class="form-label">Código</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(p.code)}</p></div>
          <div class="md:col-span-2"><span class="form-label">Nombre</span><p class="font-semibold">${esc(p.name)}</p></div>
          <div><span class="form-label">Tipo</span><p>${esc(typeLabel)}</p></div>
          <div><span class="form-label">Unidad de medida</span><p class="font-mono">${esc(p.unit || '—')}</p></div>
          <div><span class="form-label">Presentacion</span><p>${esc(p.presentacion || '—')}</p></div>
          <div><span class="form-label">Categoria</span><p>${esc(p.categoria || '—')}</p></div>
          <div><span class="form-label">Linea</span><p>${esc(p.linea || '—')}</p></div>
          <div><span class="form-label">Tarifa IVA</span><p>${esc(ivaLabel)}</p></div>
          <div><span class="form-label">Precio base venta</span><p>${p.base_price ? fmt(p.base_price) : '—'}</p></div>
          <div><span class="form-label">Precio venta 2</span><p>${p.precio_venta_2 ? fmt(p.precio_venta_2) : '—'}</p></div>
          <div><span class="form-label">Precio venta 3</span><p>${p.precio_venta_3 ? fmt(p.precio_venta_3) : '—'}</p></div>
          <div><span class="form-label">Costo estimado</span><p>${p.cost_price ? fmt(p.cost_price) : '—'}</p></div>
          <div><span class="form-label">Estado</span><p>${p.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</p></div>
          <div><span class="form-label">Cód. UNSPSC (DIAN)</span><p class="font-mono">${esc(p.unspsc_code || '—')}</p></div>
          <div><span class="form-label">Cód. EAN/barras</span><p class="font-mono">${esc(p.ean_code || '—')}</p></div>
          <div><span class="form-label">Stock Mínimo (Alerta)</span><p class="font-semibold text-orange-700">${p.stock_min !== null && p.stock_min !== undefined ? fmtN(p.stock_min) : '—'}</p></div>
          <div><span class="form-label">Stock Máximo (Alerta)</span><p class="font-semibold text-blue-700">${p.stock_max !== null && p.stock_max !== undefined ? fmtN(p.stock_max) : '—'}</p></div>
          ${p.description ? `<div class="col-span-2 md:col-span-3"><span class="form-label">Descripción</span><p>${esc(p.description)}</p></div>` : ''}
          <div class="col-span-2 md:col-span-3 border-t pt-3 mt-1" style="border-color:#F0F0F0">
            <span class="form-label">Cuentas contables</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div><p class="text-xs text-gray-500 mb-1">Ingresos</p>
                <p class="font-mono text-xs">${ia ? esc(`${ia.code} — ${ia.name}`) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Costo/Gasto</p>
                <p class="font-mono text-xs">${ca ? esc(`${ca.code} — ${ca.name}`) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Inventario</p>
                <p class="font-mono text-xs">${inv ? esc(`${inv.code} — ${inv.name}`) : '—'}</p></div>
            </div>
          </div>
          <div class="col-span-2 md:col-span-3 border-t pt-3 mt-1" style="border-color:#F0F0F0">
            <span class="form-label">Condiciones especiales e Importación</span>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <div><p class="text-xs text-gray-500 mb-1">Peso (General)</p><p class="font-mono text-xs">${p.peso != null ? esc(String(p.peso)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Peso Neto (Kg)</p><p class="font-mono text-xs font-semibold">${p.peso_neto != null ? esc(String(p.peso_neto)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Peso Bruto (Kg)</p><p class="font-mono text-xs font-semibold">${p.peso_bruto != null ? esc(String(p.peso_bruto)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Caja en Pallet</p><p class="font-mono text-xs">${p.cajas_en_pallet != null ? esc(String(p.cajas_en_pallet)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Largo (cm)</p><p class="font-mono text-xs font-semibold">${p.largo_cm != null ? esc(String(p.largo_cm)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Ancho (cm)</p><p class="font-mono text-xs font-semibold">${p.ancho_cm != null ? esc(String(p.ancho_cm)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Alto (cm)</p><p class="font-mono text-xs font-semibold">${p.alto_cm != null ? esc(String(p.alto_cm)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">CBM por unidad</p><p class="font-mono text-xs font-semibold">${(p.largo_cm != null && p.ancho_cm != null && p.alto_cm != null) ? esc((((Number(p.largo_cm) * Number(p.ancho_cm) * Number(p.alto_cm)) / 1000000).toFixed(6))) : '—'}</p></div>
              
              <div><p class="text-xs text-gray-500 mb-1">UndEmpaque</p><p class="font-mono text-xs">${p.und_empaque != null ? esc(String(p.und_empaque)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Peso x UndEmpaque</p><p class="font-mono text-xs">${p.peso_x_und_empaque != null ? esc(String(p.peso_x_und_empaque)) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Posición Arancelaria</p><p class="font-mono text-xs font-semibold text-blue-800">${p.posicion_arancelaria ? esc(p.posicion_arancelaria) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Arancel Base (%)</p><p class="font-mono text-xs font-semibold text-blue-800">${p.arancel_rate_default != null ? esc(String(p.arancel_rate_default)) + '%' : '—'}</p></div>
              
              <div><p class="text-xs text-gray-500 mb-1">País de Origen</p><p class="text-xs font-semibold">${p.pais_origen ? esc(p.pais_origen) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Marca / Modelo</p><p class="text-xs">${p.marca || p.modelo ? esc(`${p.marca || '—'} / ${p.modelo || '—'}`) : '—'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Visto Bueno (VUCE)</p><p class="text-xs font-semibold">${p.visto_bueno_required ? `<span class="badge badge-orange">Requiere [${p.visto_bueno_entidad || 'S/E'}]</span>` : 'No requiere'}</p></div>
              <div><p class="text-xs text-gray-500 mb-1">Registro Sanitario / Venta</p><p class="text-xs font-mono">${p.registro_sanitario ? esc(p.registro_sanitario) : '—'}</p></div>
            </div>
          </div>
          <div class="col-span-2 md:col-span-3 border-t pt-3 mt-1" style="border-color:#F0F0F0">
            <span class="form-label">Manifiesto de Importación PDF</span>
            ${manifestHtml}
          </div>
        </div>
        <div class="md:col-span-1 flex flex-col justify-start">
          ${imageHtml}
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Formulario crear/editar ───────────────────────────────────────────────────
async function openProductForm(row = null, accounts = null, catalog = {}, initialComponents = []) {
  const allGoods = await API.getProducts({ activeOnly: true }).catch(() => []);
  const allGoodsFiltered = allGoods.filter((p: any) => p.type === 'BIEN' && p.id !== row?.id && !p.is_combo);

  if (!accounts) {
    accounts = await API.getAccounts(false).catch(() => []);
  }

  const accountList = (Array.isArray(accounts) ? accounts : [])
    .filter(a => a.active && Number(a.level) >= 3)
    .sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')));
  const accountMap = new Map(accountList.map(a => [a.id, a]));

  const pickAccountByPrefix = (prefix = '', query = '') => {
    const q = String(query || '').trim().toLowerCase();
    return accountList
      .filter((a: any) => Number(a.level) === 5)
      .filter((a: any) => String(a.code || '').startsWith(prefix))
      .filter((a: any) => {
        if (!q) return true;
        const hay = `${a.code || ''} ${a.name || ''}`.toLowerCase();
        return q.split(/\s+/).every((term: string) => hay.includes(term));
      })
      .slice(0, 30);
  };

  const specialConditions = {
    peso: row?.peso ?? null,
    cajas_en_pallet: row?.cajas_en_pallet ?? null,
    und_empaque: row?.und_empaque ?? null,
    peso_x_und_empaque: row?.peso_x_und_empaque ?? null,
    peso_neto: row?.peso_neto ?? null,
    peso_bruto: row?.peso_bruto ?? null,
    largo_cm: row?.largo_cm ?? null,
    ancho_cm: row?.ancho_cm ?? null,
    alto_cm: row?.alto_cm ?? null,
    posicion_arancelaria: row?.posicion_arancelaria ?? '',
    arancel_rate_default: row?.arancel_rate_default ?? null,
    pais_origen: row?.pais_origen ?? '',
    marca: row?.marca ?? '',
    modelo: row?.modelo ?? '',
    visto_bueno_required: row?.visto_bueno_required ?? false,
    visto_bueno_entidad: row?.visto_bueno_entidad ?? '',
    registro_sanitario: row?.registro_sanitario ?? '',
  };

  openModal(
    row ? `Editar — ${esc(row.code)}` : 'Nuevo Producto / Servicio',
    `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Fila 1 -->
      <div class="form-group">
        <label class="form-label">Código <span style="color:#EF4444">*</span></label>
        <input id="pf-code" class="form-input font-mono" value="${esc(row?.code || '')}" placeholder="P-001" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Nombre <span style="color:#EF4444">*</span></label>
        <input id="pf-name" class="form-input" value="${esc(row?.name || '')}" placeholder="Nombre del producto o servicio">
      </div>

      <!-- Fila 2 -->
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="pf-type" class="form-input">
          ${PRODUCT_TYPES.map(t => `<option value="${t.value}" ${row?.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Unidad de medida <span style="color:#EF4444">*</span></label>
        <select id="pf-unit" class="form-input">
          ${PRODUCT_UNITS.map(u => `<option value="${u}" ${row?.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Presentacion</label>
        <input id="pf-presentacion" class="form-input" value="${esc(row?.presentacion || '')}" placeholder="Caja x 12, Bolsa 1Kg, etc.">
      </div>

      <!-- Fila 2B -->
      <div class="form-group">
        <label class="form-label">Categoría</label>
        <select id="pf-categoria" class="form-input">
          <option value="">— Sin Categoría —</option>
          ${(catalog.categories||[]).map(c=>`<option value="${esc(c)}" ${row?.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Línea</label>
        <select id="pf-linea" class="form-input">
          <option value="">— Sin Línea —</option>
          ${(catalog.lines||[]).map(l=>`<option value="${esc(l)}" ${row?.linea === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group flex items-end">
        ${can('canWrite') ? '<button type="button" class="btn btn-outline btn-sm w-full" id="btn-catalog-form"><i class="fas fa-tags"></i> Gestionar Cat./Líneas</button>' : '<span></span>'}
      </div>
      <div class="form-group">
        <label class="form-label">Tarifa IVA <span style="color:#EF4444">*</span></label>
        <select id="pf-iva" class="form-input">
          ${IVA_RATES.map(r => `<option value="${r.value}" ${Number(row?.iva_rate) === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </div>

      <!-- Fila 3: precios -->
      <div class="form-group">
        <label class="form-label">Precio base de venta</label>
        <input id="pf-base-price" type="number" min="0" step="0.01" class="form-input text-right" value="${row?.base_price ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Costo estimado</label>
        <input id="pf-cost-price" type="number" min="0" step="0.01" class="form-input text-right" value="${row?.cost_price ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Precio venta 2</label>
        <input id="pf-sale-price-2" type="number" min="0" step="0.01" class="form-input text-right" value="${row?.precio_venta_2 ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Precio venta 3</label>
        <input id="pf-sale-price-3" type="number" min="0" step="0.01" class="form-input text-right" value="${row?.precio_venta_3 ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Activo</label>
        <select id="pf-active" class="form-input">
          <option value="true"  ${(row?.active !== false) ? 'selected' : ''}>Sí</option>
          <option value="false" ${row?.active === false    ? 'selected' : ''}>No</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Stock Mínimo (Alerta)</label>
        <input id="pf-stock-min" type="number" min="0" step="0.0001" class="form-input text-right font-semibold text-orange-700" value="${row?.stock_min ?? ''}" placeholder="0">
      </div>
      <div class="form-group">
        <label class="form-label">Stock Máximo (Alerta)</label>
        <input id="pf-stock-max" type="number" min="0" step="0.0001" class="form-input text-right font-semibold text-blue-700" value="${row?.stock_max ?? ''}" placeholder="0">
      </div>

      <div class="form-group md:col-span-3">
        <label class="form-label">Condiciones especiales</label>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="btn btn-outline btn-sm" id="btn-special-conditions">
            <i class="fas fa-sliders"></i> Condiciones especiales
          </button>
          <span id="pf-special-summary" class="text-xs" style="color:#6B7280">${esc(specialConditionsSummary(specialConditions))}</span>
        </div>
      </div>

      <!-- Fila 4: DIAN -->
      <div class="form-group">
        <label class="form-label">Código UNSPSC <small style="color:#9CA3AF">(DIAN)</small></label>
        <input id="pf-unspsc" class="form-input font-mono" value="${esc(row?.unspsc_code || '')}" placeholder="Ej: 44121618">
      </div>
      <div class="form-group">
        <label class="form-label">Código EAN / Barras</label>
        <input id="pf-ean" class="form-input font-mono" value="${esc(row?.ean_code || '')}" placeholder="Ej: 7702010123456">
      </div>
      <div class="form-group md:col-span-1"></div>

      <!-- Fila 5: cuentas contables -->
      <div class="form-group col-span-1 md:col-span-3">
        <p class="form-label mb-2" style="border-bottom:1px solid #F0F0F0;padding-bottom:6px">Cuentas contables asociadas</p>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de ingresos</label>
        <input type="hidden" id="pf-income-acct" value="${esc(row?.income_account_id || '')}">
        <div class="relative">
          <input id="pf-income-acct-search" class="form-input" autocomplete="off" placeholder="Buscar cuenta 41...">
          <div id="pf-income-acct-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de costo / gasto</label>
        <input type="hidden" id="pf-cost-acct" value="${esc(row?.cost_account_id || '')}">
        <div class="relative">
          <input id="pf-cost-acct-search" class="form-input" autocomplete="off" placeholder="Buscar cuenta 61...">
          <div id="pf-cost-acct-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de inventario <small style="color:#9CA3AF">(solo bienes)</small></label>
        <input type="hidden" id="pf-inv-acct" value="${esc(row?.inventory_account_id || '')}">
        <div class="relative">
          <input id="pf-inv-acct-search" class="form-input" autocomplete="off" placeholder="Buscar cuenta 14...">
          <div id="pf-inv-acct-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
        </div>
      </div>

      <!-- Fila 6: descripción -->
      <div class="form-group md:col-span-3">
        <label class="form-label">Descripción</label>
        <textarea id="pf-desc" class="form-input" rows="2" placeholder="Descripción opcional para documentos comerciales">${esc(row?.description || '')}</textarea>
      </div>

      <!-- Fila 5.5: Archivos Adjuntos -->
      <div class="form-group md:col-span-3 border-t pt-3 mt-2" style="border-color:#F0F0F0">
        <p class="form-label mb-2" style="font-weight:700;color:#0D2137"><i class="fas fa-paperclip mr-2 text-blue-700"></i>Archivos y Multimedia</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Carga de Imagen -->
          <div class="rounded-xl border p-3 bg-gray-50/50" style="border-color:#E5E7EB">
            <label class="form-label text-xs font-semibold mb-1">Imagen de Catálogo (JPG, PNG, WEBP - Máx. 5MB)</label>
            <input id="pf-image" type="file" accept="image/*" class="form-input text-xs w-full bg-white mb-2">
            ${row?.image ? `
              <div class="flex items-center justify-between bg-white border rounded-lg px-2 py-1.5 text-xs" style="border-color:#F0F0F0">
                <span class="truncate text-gray-600 flex-1"><i class="fas fa-image text-blue-600 mr-1.5"></i>${esc(row.image)}</span>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a href="${(window as any).PB_URL}/api/files/products/${row.id}/${row.image}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Ver imagen actual">Ver</a>
                  <button type="button" id="pf-image-clear-btn" class="text-red-500 hover:text-red-700 font-semibold bg-transparent border-none cursor-pointer" onclick="window.clearProductFile('image')">Eliminar</button>
                  <input type="hidden" id="pf-image-clear" value="false">
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- Carga de Manifiesto PDF -->
          <div class="rounded-xl border p-3 bg-gray-50/50" style="border-color:#E5E7EB">
            <label class="form-label text-xs font-semibold mb-1">Manifiesto de Importación PDF (Máx. 10MB)</label>
            <input id="pf-manifest-pdf" type="file" accept="application/pdf" class="form-input text-xs w-full bg-white mb-2">
            ${row?.manifest_pdf ? `
              <div class="flex items-center justify-between bg-white border rounded-lg px-2 py-1.5 text-xs" style="border-color:#F0F0F0">
                <span class="truncate text-gray-600 flex-1"><i class="fas fa-file-pdf text-red-600 mr-1.5"></i>${esc(row.manifest_pdf)}</span>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a href="${(window as any).PB_URL}/api/files/products/${row.id}/${row.manifest_pdf}${(window as any).pb.authToken ? '?token=' + (window as any).pb.authToken : ''}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Ver PDF actual">Ver</a>
                  <button type="button" id="pf-manifest-clear-btn" class="text-red-500 hover:text-red-700 font-semibold bg-transparent border-none cursor-pointer" onclick="window.clearProductFile('manifest')">Eliminar</button>
                  <input type="hidden" id="pf-manifest-clear" value="false">
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Combo / Kit Config -->
      <div class="form-group md:col-span-3 border-t pt-3 mt-2" style="border-color:#F0F0F0">
        <label class="inline-flex items-center gap-2 cursor-pointer font-bold" style="color:#0D2137">
          <input type="checkbox" id="pf-is-combo" class="rounded text-[#E87D1E] focus:ring-[#E87D1E]" ${row?.is_combo ? 'checked' : ''}>
          <span>¿Es un Combo / Kit / Ensamble de Mercancía?</span>
        </label>
        <p class="text-xs text-gray-500 mt-1">Al activar esta opción, al vender este producto se descontará el inventario de sus componentes individuales.</p>
        
        <div id="pf-combo-section" style="${row?.is_combo ? '' : 'display:none'}" class="mt-3 p-4 rounded-xl border bg-gray-50" style="border-color:#E5E7EB">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold uppercase text-gray-600">Componentes del Combo</span>
            <button type="button" class="btn btn-outline btn-sm shadow-sm" id="pf-btn-add-comp" style="font-size: 11px; padding: 4px 8px;"><i class="fas fa-plus mr-1"></i>Agregar</button>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table text-xs w-full">
              <thead>
                <tr>
                  <th>Componente (Producto Físico)</th>
                  <th class="text-right" style="width:100px">Cantidad</th>
                  <th class="text-right" style="width:120px">Costo Unit.</th>
                  <th class="text-right" style="width:120px">Costo Subtotal</th>
                  <th style="width:40px"></th>
                </tr>
              </thead>
              <tbody id="pf-combo-body">
                <!-- Se cargan dinámicamente -->
              </tbody>
              <tfoot>
                <tr class="font-bold">
                  <td colspan="3" class="text-right py-2">Costo Total del Combo:</td>
                  <td class="text-right py-2 text-[#E87D1E]" id="pf-combo-total-cost">$ 0</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-product"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    true
  );

  const legacyInvalidFields: string[] = [];

  const initProductAccountPicker = ({ hiddenId, inputId, resultsId, prefix, label }) => {
    const hidden = document.getElementById(hiddenId) as HTMLInputElement;
    const input = document.getElementById(inputId) as HTMLInputElement;
    const results = document.getElementById(resultsId);
    if (!hidden || !input || !results) return;

    const paint = (query = '') => {
      const found = pickAccountByPrefix(prefix, query);
      if (!found.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs" style="color:#9CA3AF">Sin resultados</div>';
        return;
      }
      results.innerHTML = found.map((a: any) => `
        <button type="button" data-account-id="${esc(a.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer">
          <div style="font-weight:600">${esc(a.code || '')}</div>
          <div style="font-size:12px;color:#6B7280">${esc(a.name || '')}</div>
        </button>
      `).join('');
    };

    const syncInputFromHidden = () => {
      const acc = accountMap.get(hidden.value);
      if (!acc) {
        if (hidden.value) legacyInvalidFields.push(label);
        hidden.value = '';
        input.value = '';
        return;
      }
      if (Number(acc.level) !== 5) {
        legacyInvalidFields.push(label);
        hidden.value = '';
        input.value = '';
        return;
      }
      input.value = `${acc.code} - ${acc.name}`;
    };

    syncInputFromHidden();
    input.onfocus = () => {
      paint(input.value);
      results.style.display = 'block';
      input.select();
    };
    input.oninput = () => {
      if (hidden.value) hidden.value = '';
      paint(input.value);
      results.style.display = 'block';
    };
    input.onkeydown = (e) => {
      if (e.key === 'Escape') results.style.display = 'none';
    };
    input.onblur = () => setTimeout(() => { results.style.display = 'none'; }, 120);
    results.onmousedown = (ev) => ev.preventDefault();
    results.onclick = (ev: any) => {
      const btn = ev.target.closest('[data-account-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-account-id') || '';
      hidden.value = id;
      const acc = accountMap.get(id);
      input.value = acc ? `${acc.code} - ${acc.name}` : '';
      results.style.display = 'none';
    };

    (window as any).initKeyboardAutocomplete({
      input,
      results,
      itemSelector: '[data-account-id]',
    });
  };

  initProductAccountPicker({ hiddenId: 'pf-income-acct', inputId: 'pf-income-acct-search', resultsId: 'pf-income-acct-results', prefix: '41', label: 'Cuenta de ingresos' });
  initProductAccountPicker({ hiddenId: 'pf-cost-acct', inputId: 'pf-cost-acct-search', resultsId: 'pf-cost-acct-results', prefix: '61', label: 'Cuenta de costo / gasto' });
  initProductAccountPicker({ hiddenId: 'pf-inv-acct', inputId: 'pf-inv-acct-search', resultsId: 'pf-inv-acct-results', prefix: '14', label: 'Cuenta de inventario' });

  if (legacyInvalidFields.length) {
    const unique = [...new Set(legacyInvalidFields)];
    showToast(`Se limpiaron cuentas heredadas no válidas (nivel distinto de 5): ${unique.join(', ')}.`, 'warning');
  }

  const syncInventoryAccountByType = () => {
    const typeSel = document.getElementById('pf-type') as HTMLSelectElement;
    const invInput = document.getElementById('pf-inv-acct-search') as HTMLInputElement;
    const invHidden = document.getElementById('pf-inv-acct') as HTMLInputElement;
    if (!typeSel || !invInput || !invHidden) return;

    const isBien = typeSel.value === 'BIEN';
    invInput.disabled = !isBien;
    invInput.placeholder = isBien ? 'Buscar cuenta 14...' : 'Solo aplica para BIEN';
    invInput.style.backgroundColor = isBien ? '' : '#F3F4F6';
    if (!isBien) {
      invHidden.value = '';
      invInput.value = '';
    }
  };
  document.getElementById('pf-type')?.addEventListener('change', syncInventoryAccountByType);
  syncInventoryAccountByType();

  const validateLevel5Account = (accountId: string, label: string) => {
    const id = String(accountId || '').trim();
    if (!id) return true;
    const acc = accountMap.get(id);
    if (!acc) {
      showToast(`${label}: la cuenta seleccionada no existe o no está disponible.`, 'warning');
      return false;
    }
    if (Number(acc.level) !== 5) {
      showToast(`${label}: solo se permiten cuentas de nivel 5.`, 'warning');
      return false;
    }
    return true;
  };

  let compCounter = 0;
  function addCompLine(comp = null) {
    compCounter++;
    const idx = compCounter;
    const tbody = document.getElementById('pf-combo-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.id = `pf-comp-row-${idx}`;
    tr.className = "border-b";
    tr.style.borderColor = "#F3F4F6";
    tr.innerHTML = `
      <td class="py-1">
        <select class="form-input text-xs w-full pf-comp-select" id="pf-comp-prod-${idx}" style="min-width:180px">
          <option value="">— Seleccione Producto —</option>
          ${allGoodsFiltered.map((p: any) => `<option value="${esc(p.id)}" data-cost="${p.cost_price || 0}">${esc(p.code)} — ${esc(p.name)}</option>`).join('')}
        </select>
      </td>
      <td class="py-1">
        <input type="number" min="0.0001" step="0.0001" class="form-input text-xs text-right w-full pf-comp-qty" id="pf-comp-qty-${idx}" placeholder="0" value="${comp ? comp.qty : '1'}">
      </td>
      <td class="text-right py-1 text-gray-500 font-mono" id="pf-comp-cost-${idx}">$ 0</td>
      <td class="text-right py-1 font-semibold font-mono pf-comp-subtotal" id="pf-comp-subtotal-${idx}">$ 0</td>
      <td class="text-center py-1">
        <button type="button" class="btn btn-danger btn-sm p-1" onclick="document.getElementById('pf-comp-row-${idx}').remove(); window.recalcComboCost();" style="border-radius:6px; padding: 2px 6px;"><i class="fas fa-times text-xs"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    const select = document.getElementById(`pf-comp-prod-${idx}`);
    const qtyInput = document.getElementById(`pf-comp-qty-${idx}`);

    const updateLineCosts = () => {
      const opt = select.selectedOptions[0];
      const unitCost = opt ? parseFloat(opt.dataset.cost || '0') : 0;
      const qty = parseFloat(qtyInput.value) || 0;
      const subtotal = qty * unitCost;

      const costLabel = document.getElementById(`pf-comp-cost-${idx}`);
      const subtotalLabel = document.getElementById(`pf-comp-subtotal-${idx}`);
      
      if (costLabel) costLabel.textContent = (window as any).fmt(unitCost);
      if (subtotalLabel) {
        subtotalLabel.textContent = (window as any).fmt(subtotal);
        subtotalLabel.setAttribute('data-subtotal', String(subtotal));
      }
      (window as any).recalcComboCost();
    };

    select.addEventListener('change', updateLineCosts);
    qtyInput.addEventListener('input', updateLineCosts);

    if (comp) {
      select.value = comp.component_id;
      qtyInput.value = comp.qty;
      updateLineCosts();
    }
  }

  (window as any).recalcComboCost = function() {
    let total = 0;
    const subs = document.querySelectorAll('.pf-comp-subtotal');
    subs.forEach((el: any) => {
      total += parseFloat(el.getAttribute('data-subtotal') || '0');
    });
    const totalEl = document.getElementById('pf-combo-total-cost');
    if (totalEl) totalEl.textContent = (window as any).fmt(total);

    const costPriceInput = document.getElementById('pf-cost-price');
    if (costPriceInput) {
      costPriceInput.value = String(total);
    }
  };

  document.getElementById('pf-is-combo')?.addEventListener('change', function(e: any) {
    const isChecked = e.target.checked;
    const section = document.getElementById('pf-combo-section');
    if (section) section.style.display = isChecked ? '' : 'none';
    if (isChecked) {
      const tbody = document.getElementById('pf-combo-body');
      if (tbody && tbody.children.length === 0) {
        addCompLine();
      }
      (window as any).recalcComboCost();
    }
  });

  document.getElementById('pf-btn-add-comp')?.addEventListener('click', () => addCompLine());

  if (row?.is_combo && initialComponents && initialComponents.length > 0) {
    initialComponents.forEach((c: any) => addCompLine(c));
  }

  $('#btn-save-product')?.addEventListener('click', async () => {
    const btn = $('#btn-save-product');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }

    try {
      const code = getInputVal('pf-code').trim().toUpperCase();
      const name = getInputVal('pf-name').trim();
      if (!code) return showToast('El código es obligatorio', 'warning');
      if (!name) return showToast('El nombre es obligatorio', 'warning');

      // Verificar código duplicado en creación
      if (!row?.id) {
        const safeCode = pb.escapeFilterValue(code);
        const dup = await pb.list('products', { filter: `code="${safeCode}"`, perPage: 1 });
        if (dup.items.length) return showToast(`Ya existe un producto con el código ${code}`, 'warning');
      }

      const isCombo = getCheckVal('pf-is-combo');
      const incomeAccountId = (document.getElementById('pf-income-acct') as HTMLInputElement)?.value || '';
      const costAccountId = (document.getElementById('pf-cost-acct') as HTMLInputElement)?.value || '';
      const inventoryAccountId = (document.getElementById('pf-inv-acct') as HTMLInputElement)?.value || '';

      if (!validateLevel5Account(incomeAccountId, 'Cuenta de ingresos')) return;
      if (!validateLevel5Account(costAccountId, 'Cuenta de costo / gasto')) return;
      if (!validateLevel5Account(inventoryAccountId, 'Cuenta de inventario')) return;

      // Validación de cubicaje: o se diligencian las 3 dimensiones o ninguna.
      const dimsRaw = [specialConditions.largo_cm, specialConditions.ancho_cm, specialConditions.alto_cm];
      const dimsFilledCount = dimsRaw.filter(v => v !== null).length;
      if (dimsFilledCount > 0 && dimsFilledCount < 3) {
        return showToast('Para cubicaje debes diligenciar Largo, Ancho y Alto completos; o dejar los tres vacíos.', 'warning');
      }
      if (dimsFilledCount === 3) {
        const hasInvalidDim = dimsRaw.some(v => Number(v) <= 0);
        if (hasInvalidDim) {
          return showToast('Largo, Ancho y Alto deben ser mayores a cero para calcular cubicaje.', 'warning');
        }
      }

      const componentsData = [];
      if (isCombo) {
        let lineIdx = 1;
        while (true) {
          const select = document.getElementById(`pf-comp-prod-${lineIdx}`) as HTMLSelectElement;
          if (!select) {
            lineIdx++;
            if (lineIdx > compCounter + 5) break;
            continue;
          }
          const compId = select.value;
          const qty = parseFloat((document.getElementById(`pf-comp-qty-${lineIdx}`) as HTMLInputElement)?.value || '0');
          if (compId && qty > 0) {
            componentsData.push({ component_id: compId, qty });
          }
          lineIdx++;
          if (lineIdx > compCounter + 2) break;
        }
        if (!componentsData.length) {
          throw new Error('Un combo debe tener al menos un componente con cantidad válida.');
        }
      }

      const formData = new FormData();
      formData.append('code', code);
      formData.append('name', name);
      formData.append('description', getInputVal('pf-desc').trim());
      formData.append('type', getSelectVal('pf-type'));
      formData.append('unit', getSelectVal('pf-unit'));
      formData.append('presentacion', getInputVal('pf-presentacion').trim());
      formData.append('categoria', getSelectVal('pf-categoria'));
      formData.append('linea', getSelectVal('pf-linea'));
      formData.append('iva_rate', String(Number(getSelectVal('pf-iva') || 0)));
      formData.append('base_price', String(parseFloat(getInputVal('pf-base-price') || '0') || 0));
      
      const valV2 = toNullableNumber(getInputVal('pf-sale-price-2'));
      formData.append('precio_venta_2', valV2 !== null ? String(valV2) : '');
      const valV3 = toNullableNumber(getInputVal('pf-sale-price-3'));
      formData.append('precio_venta_3', valV3 !== null ? String(valV3) : '');
      formData.append('cost_price', String(parseFloat(getInputVal('pf-cost-price') || '0') || 0));
      formData.append('active', String(getSelectVal('pf-active') === 'true'));
      
      const valStockMin = toNullableNumber(getInputVal('pf-stock-min'));
      formData.append('stock_min', valStockMin !== null ? String(valStockMin) : '');
      const valStockMax = toNullableNumber(getInputVal('pf-stock-max'));
      formData.append('stock_max', valStockMax !== null ? String(valStockMax) : '');
      
      formData.append('unspsc_code', getInputVal('pf-unspsc').trim());
      formData.append('ean_code', getInputVal('pf-ean').trim());
      
      formData.append('peso', specialConditions.peso !== null ? String(specialConditions.peso) : '');
      formData.append('cajas_en_pallet', specialConditions.cajas_en_pallet !== null ? String(specialConditions.cajas_en_pallet) : '');
      formData.append('und_empaque', specialConditions.und_empaque !== null ? String(specialConditions.und_empaque) : '');
      formData.append('peso_x_und_empaque', specialConditions.peso_x_und_empaque !== null ? String(specialConditions.peso_x_und_empaque) : '');
      formData.append('peso_neto', specialConditions.peso_neto !== null ? String(specialConditions.peso_neto) : '');
      formData.append('peso_bruto', specialConditions.peso_bruto !== null ? String(specialConditions.peso_bruto) : '');
      formData.append('largo_cm', specialConditions.largo_cm !== null ? String(specialConditions.largo_cm) : '');
      formData.append('ancho_cm', specialConditions.ancho_cm !== null ? String(specialConditions.ancho_cm) : '');
      formData.append('alto_cm', specialConditions.alto_cm !== null ? String(specialConditions.alto_cm) : '');
      
      formData.append('posicion_arancelaria', specialConditions.posicion_arancelaria || '');
      formData.append('arancel_rate_default', specialConditions.arancel_rate_default !== null ? String(specialConditions.arancel_rate_default) : '');
      formData.append('pais_origen', specialConditions.pais_origen || '');
      formData.append('marca', specialConditions.marca || '');
      formData.append('modelo', specialConditions.modelo || '');
      formData.append('visto_bueno_required', String(specialConditions.visto_bueno_required));
      formData.append('visto_bueno_entidad', specialConditions.visto_bueno_entidad || '');
      formData.append('registro_sanitario', specialConditions.registro_sanitario || '');
      
      formData.append('income_account_id', incomeAccountId);
      formData.append('cost_account_id', costAccountId);
      formData.append('inventory_account_id', inventoryAccountId);
      formData.append('is_combo', String(isCombo));

      const filePdf = (document.getElementById('pf-manifest-pdf') as HTMLInputElement)?.files?.[0];
      if (filePdf) {
        formData.append('manifest_pdf', filePdf);
      } else if ((document.getElementById('pf-manifest-clear') as HTMLInputElement)?.value === 'true') {
        formData.append('manifest_pdf', '');
      }

      const fileImg = (document.getElementById('pf-image') as HTMLInputElement)?.files?.[0];
      if (fileImg) {
        formData.append('image', fileImg);
      } else if ((document.getElementById('pf-image-clear') as HTMLInputElement)?.value === 'true') {
        formData.append('image', '');
      }

      let savedId = "";
      if (row?.id) {
        await pb.update('products', row.id, formData);
        await API.logAudit('UPDATE', 'Producto', row.id, `${code} — ${name}`);
        showToast('Producto actualizado', 'success');
        savedId = row.id;
      } else {
        const created = await pb.create('products', formData);
        await API.logAudit('CREATE', 'Producto', created.id, `${code} — ${name}`);
        showToast('Producto creado', 'success');
        savedId = created.id;
      }

      // Guardar componentes
      const existingComps = await pb.listAll('product_components', { filter: `parent_id="${pb.escapeFilterValue(savedId)}"` });
      for (const c of existingComps) {
        await pb.delete('product_components', c.id);
      }
      if (isCombo) {
        for (const c of componentsData) {
          await pb.create('product_components', {
            parent_id: savedId,
            component_id: c.component_id,
            qty: c.qty
          });
        }
      }

      closeModal();
      renderProductos($('#page-content'));
    } catch (err) {
      const details = err?.data?.data
        ? Object.values(err.data.data).map(v => v?.message).filter(Boolean).join(' | ')
        : '';
      showToast(details || err.message || 'No se pudo guardar', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
    }
  });

  $('#btn-special-conditions')?.addEventListener('click', () => {
    openSpecialConditionsModal(specialConditions, (updated) => {
      Object.assign(specialConditions, updated);
      const summary = $('#pf-special-summary');
      if (summary) summary.textContent = specialConditionsSummary(specialConditions);
    });
  });

  // Callbacks para carga y eliminación de archivos
  (window as any).clearProductFile = function(type: 'image' | 'manifest') {
    if (type === 'image') {
      const clearFld = document.getElementById('pf-image-clear') as HTMLInputElement;
      if (clearFld) clearFld.value = 'true';
      const btn = document.getElementById('pf-image-clear-btn') as HTMLButtonElement;
      if (btn) {
        btn.textContent = 'Marcado para eliminar';
        btn.classList.add('text-orange-600');
        btn.classList.remove('text-red-500');
        btn.disabled = true;
      }
    } else {
      const clearFld = document.getElementById('pf-manifest-clear') as HTMLInputElement;
      if (clearFld) clearFld.value = 'true';
      const btn = document.getElementById('pf-manifest-clear-btn') as HTMLButtonElement;
      if (btn) {
        btn.textContent = 'Marcado para eliminar';
        btn.classList.add('text-orange-600');
        btn.classList.remove('text-red-500');
        btn.disabled = true;
      }
    }
  };

  document.getElementById('pf-image')?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length) {
      const clearFld = document.getElementById('pf-image-clear') as HTMLInputElement;
      if (clearFld) clearFld.value = 'false';
      const btn = document.getElementById('pf-image-clear-btn') as HTMLButtonElement;
      if (btn) {
        btn.textContent = 'Eliminar';
        btn.classList.remove('text-orange-600');
        btn.classList.add('text-red-500');
        btn.disabled = false;
      }
    }
  });

  document.getElementById('pf-manifest-pdf')?.addEventListener('change', (e: any) => {
    if (e.target.files && e.target.files.length) {
      const clearFld = document.getElementById('pf-manifest-clear') as HTMLInputElement;
      if (clearFld) clearFld.value = 'false';
      const btn = document.getElementById('pf-manifest-clear-btn') as HTMLButtonElement;
      if (btn) {
        btn.textContent = 'Eliminar';
        btn.classList.remove('text-orange-600');
        btn.classList.add('text-red-500');
        btn.disabled = false;
      }
    }
  });

  $('#btn-catalog-form')?.addEventListener('click', () => {
    openCatalogManagerModal(catalog, (updated) => {
      Object.assign(catalog, updated);
      const selCat = document.getElementById('pf-categoria') as HTMLSelectElement;
      const selLine = document.getElementById('pf-linea') as HTMLSelectElement;
      
      if (selCat) {
        const val = selCat.value;
        selCat.innerHTML = `<option value="">— Sin Categoría —</option>` + catalog.categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
        selCat.value = val;
      }
      if (selLine) {
        const val = selLine.value;
        selLine.innerHTML = `<option value="">— Sin Línea —</option>` + catalog.lines.map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join('');
        selLine.value = val;
      }
    });
  });
}

// ── Editar ────────────────────────────────────────────────────────────────────
async function editProduct(id) {
  try {
    const [row, accounts, catalog, components] = await Promise.all([
      pb.get('products', id),
      API.getAccounts(false),
      loadProductCatalog(),
      pb.listAll('product_components', { filter: `parent_id="${pb.escapeFilterValue(id)}"`, expand: 'component_id' }).catch(() => []),
    ]);
    openProductForm(row, accounts, catalog, components);
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Activar / Desactivar ──────────────────────────────────────────────────────
async function toggleProductStatus(id, newActive) {
  try {
    const updated = await pb.update('products', id, { active: newActive });
    await API.logAudit('STATUS', 'Producto', id, `${updated.code} → ${newActive ? 'Activo' : 'Inactivo'}`);
    showToast(`Producto ${newActive ? 'activado' : 'desactivado'}`, 'success');
    renderProductos($('#page-content'));
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Eliminar ──────────────────────────────────────────────────────────────────
function deleteProduct(id, name) {
  confirmDialog(
    'Eliminar producto',
    `¿Confirmas eliminar <strong>${esc(name)}</strong>?<br><small style="color:#6B7280">Esta acción no se puede deshacer. Si el producto está referenciado en documentos, considera desactivarlo en lugar de eliminarlo.</small>`,
    async () => {
      try {
        await pb.delete('products', id);
        await API.logAudit('DELETE', 'Producto', id, `Eliminado: ${name}`);
        showToast('Producto eliminado', 'success');
        renderProductos($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

// --- VITE MIGRATION GLOBALS ---
(window as any).openProductForm = openProductForm;
(window as any).PRODUCT_TYPES = PRODUCT_TYPES;
(window as any).toNullableNumber = toNullableNumber;
(window as any).toggleProductStatus = toggleProductStatus;
(window as any).viewProductDetail = viewProductDetail;
(window as any).saveProductCatalog = saveProductCatalog;
(window as any).IVA_RATES = IVA_RATES;
(window as any).emptyRow = emptyRow;
(window as any).deleteProduct = deleteProduct;
(window as any).openCatalogManagerModal = openCatalogManagerModal;
(window as any).renderProductos = renderProductos;
(window as any).PRODUCT_UNITS = PRODUCT_UNITS;
(window as any).editProduct = editProduct;
(window as any).filterProductTable = filterProductTable;
(window as any).renderProductRows = renderProductRows;
(window as any).openSpecialConditionsModal = openSpecialConditionsModal;
(window as any).kpiCard = kpiCard;
(window as any).specialConditionsSummary = specialConditionsSummary;
(window as any).loadProductCatalog = loadProductCatalog;
