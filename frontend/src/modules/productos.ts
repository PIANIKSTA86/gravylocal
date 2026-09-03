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

// Catálogo oficial DIAN/UBL para unidades de medida en facturación electrónica
// Fuente: Anexo técnico DIAN — Tabla 6.3.4 Unidades de Medida (UBL 2.1)
const PRODUCT_UNITS: { code: string; name: string }[] = [
  { code: '94',  name: 'Unidad' },
  { code: 'BO',  name: 'Botella' },
  { code: 'BX',  name: 'Caja' },
  { code: 'CMK', name: 'Centímetro cuadrado' },
  { code: 'CMQ', name: 'Centímetro cúbico' },
  { code: 'CMT', name: 'Centímetro' },
  { code: 'CZ',  name: 'Combo' },
  { code: 'DZN', name: 'Docena' },
  { code: 'FOT', name: 'Pie' },
  { code: 'FTK', name: 'Pie cuadrado' },
  { code: 'FTQ', name: 'Pie cúbico' },
  { code: 'GN',  name: 'Galón bruto' },
  { code: 'GRM', name: 'Gramo' },
  { code: 'INH', name: 'Pulgada' },
  { code: 'JR',  name: 'Tarro' },
  { code: 'KGM', name: 'Kilogramo' },
  { code: 'KMK', name: 'Kilómetro cuadrado' },
  { code: 'KTM', name: 'Kilómetro' },
  { code: 'LBR', name: 'Libra' },
  { code: 'LH',  name: 'Hora de trabajo' },
  { code: 'LTR', name: 'Litro' },
  { code: 'MGM', name: 'Miligramo' },
  { code: 'MLT', name: 'Mililitro' },
  { code: 'MMT', name: 'Milímetro' },
  { code: 'MTK', name: 'Metro cuadrado' },
  { code: 'MTQ', name: 'Metro cúbico' },
  { code: 'MTR', name: 'Metro' },
  { code: 'NL',  name: 'Carga' },
  { code: 'ONZ', name: 'Onza' },
  { code: 'PK',  name: 'Paquete' },
  { code: 'QK',  name: 'Cuarto de kilogramo' },
  { code: 'QT',  name: 'Cuarto de galón (US)' },
  { code: 'SEC', name: 'Segundo' },
  { code: 'SET', name: 'Set (Juego)' },
  { code: 'TNE', name: 'Tonelada (tonelada métrica)' },
  { code: 'WSD', name: 'Servicio' },
  { code: 'WTT', name: 'Vatio' },
  { code: 'Z3',  name: 'Barril' },
];

/** Dado un código DIAN, devuelve el nombre en español o el propio código como fallback */
function getUnitName(code: string): string {
  return PRODUCT_UNITS.find(u => u.code === code)?.name || code || '—';
}

const IVA_RATES = [
  { value: 0,  label: '0% — Excluido / Exento' },
  { value: 5,  label: '5% — Tarifa diferencial' },
  { value: 19, label: '19% — Tarifa general'   },
];

/**
 * Calcula el Precio de Venta 1 a partir del costo de venta, aplicando factor/porcentaje y reglas de redondeo comercial.
 */
export function calculateSalePriceFromCost(costPrice: any, marginFactor: any, marginType: string = 'MARKUP_COST', roundingType: string = 'NEAREST_100') {
  const cost = Number(costPrice) || 0;
  const factor = Number(marginFactor) || 0;
  if (cost <= 0 || factor <= 0) {
    return { price: 0, profit: 0, marginOnSalePercent: 0, rawPrice: 0 };
  }

  let rawPrice = 0;
  if (marginType === 'MARGIN_SALE') {
    // Margen sobre Venta: Costo / (1 - Margin/100)
    const marginFrac = factor / 100;
    if (marginFrac >= 1) {
      rawPrice = cost;
    } else {
      rawPrice = cost / (1 - marginFrac);
    }
  } else if (marginType === 'FACTOR') {
    // Factor multiplicador directo: Costo * Factor
    rawPrice = cost * factor;
  } else {
    // MARKUP_COST (Por defecto): Margen % sobre Costo: Costo * (1 + Margin/100)
    rawPrice = cost * (1 + factor / 100);
  }

  let price = rawPrice;
  switch (roundingType) {
    case 'NEAREST_10':
      price = Math.round(rawPrice / 10) * 10;
      break;
    case 'NEAREST_100':
      price = Math.round(rawPrice / 100) * 100;
      break;
    case 'NEAREST_1000':
      price = Math.round(rawPrice / 1000) * 1000;
      break;
    case 'CEIL_100':
      price = Math.ceil(rawPrice / 100) * 100;
      break;
    case 'CEIL_1000':
      price = Math.ceil(rawPrice / 1000) * 1000;
      break;
    case 'NONE':
    default:
      price = Math.round((rawPrice + Number.EPSILON) * 100) / 100;
      break;
  }

  const profit = price - cost;
  const marginOnSalePercent = price > 0 ? (profit / price) * 100 : 0;

  return { price, profit, marginOnSalePercent, rawPrice };
}


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
    const filledCount = dimValues.filter((v) => v !== null && Number(v) > 0).length;
    const hasNegative = dimValues.some((v) => v !== null && Number(v) < 0);

    let invalid = false;
    let msg = '';

    if (hasNegative) {
      invalid = true;
      msg = 'Largo, Ancho y Alto no pueden ser negativos.';
    } else if (filledCount > 0 && filledCount < 3) {
      invalid = true;
      msg = 'Para cubicaje diligencia Largo, Ancho y Alto completos; o deja los tres vacios.';
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
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  c = getContainer(c);
  if (!c) return;
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando catálogo de productos y stock en tránsito...</div>`;

  try {
    const [products, accounts, catalog, stockRows, importLines, reservationLines] = await Promise.all([
      API.getProducts({ activeOnly: false }),
      API.getAccounts(false),
      loadProductCatalog(),
      API.getInventoryStock().catch(() => []),
      pb.listAll('import_lines', {
        filter: 'import_id.status="transito" || import_id.status="nacionalizacion"',
        expand: 'import_id',
      }).catch(() => []),
      pb.listAll('sales_reservation_lines', {
        filter: 'import_line_id!="" && (status="active" || status="partial") && (reservation_id.status="active" || reservation_id.status="partial")',
      }).catch(() => []),
    ]);

    // Mapeo de stock físico por producto
    const stockMap: Record<string, number> = {};
    (stockRows || []).forEach((s: any) => {
      stockMap[s.product_id] = (stockMap[s.product_id] || 0) + Number(s.qty_on_hand || 0);
    });

    // Mapeo de reservas comprometidas por línea de importación
    const committedByLine: Record<string, number> = {};
    for (const r of (reservationLines || [])) {
      const il = String(r.import_line_id || '').trim();
      if (!il) continue;
      const committed = Math.max(0, Number(r.qty_reserved || 0) - Number(r.qty_dispatched || 0) - Number(r.qty_released || 0));
      committedByLine[il] = (committedByLine[il] || 0) + committed;
    }

    // Mapeo estructurado de unidades en tránsito y lotes por producto
    const incomingMap: Record<string, { totalQty: number; totalAvailable: number; lots: any[] }> = {};
    (importLines || []).forEach((line: any) => {
      const pid = line.product_id;
      if (!pid) return;
      const qty = Number(line.qty || 0);
      const committed = Number(committedByLine[line.id] || 0);
      const available = Math.max(0, qty - committed);
      const eta = line.expand?.import_id?.estimated_arrival ? (window as any).fmtDate(line.expand.import_id.estimated_arrival) : 'Por definir';
      const rawEta = line.expand?.import_id?.estimated_arrival || '9999-99-99';
      const importNumber = line.expand?.import_id?.number || 'IMP';
      const importStatus = line.expand?.import_id?.status === 'transito' ? 'En Tránsito Marítimo' : 'En Puerto / Nacionalización';

      if (!incomingMap[pid]) {
        incomingMap[pid] = { totalQty: 0, totalAvailable: 0, lots: [] };
      }
      incomingMap[pid].totalQty += qty;
      incomingMap[pid].totalAvailable += available;
      incomingMap[pid].lots.push({
        id: line.id,
        import_id: line.import_id,
        importNumber,
        importStatus,
        rawEta,
        eta,
        qty,
        committed,
        available,
      });
    });

    // Ordenar lotes de cada producto por ETA más próximo
    Object.values(incomingMap).forEach((item) => {
      item.lots.sort((a, b) => a.rawEta.localeCompare(b.rawEta));
    });

    const activeCount    = products.filter(p => p.active).length;
    const bienesCount    = products.filter(p => p.type === 'BIEN').length;
    const serviciosCount = products.filter(p => p.type === 'SERVICIO').length;

    // Listas dinámicas para filtros
    const categorias = [...new Set(products.map(p => p.categoria).filter(Boolean))].sort();
    const lineas     = [...new Set(products.map(p => p.linea).filter(Boolean))].sort();

    const isMobile = window.innerWidth <= 768 || pb.currentUser?.role === 'vendedor';
    const savedView = localStorage.getItem('products_view_mode') || (isMobile ? 'cards' : 'table');
    const cartMode = (window as any).SalesCart?.activeMode || 'venta';

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Catálogo Comercial & Preventa</h3>
          <p class="text-sm" style="color:#6B7280">Consulta de existencias en bodega y reservas de embarques en tránsito.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- Toggle Vista Cards ↔ Tabla -->
          <div class="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
            <button id="btn-view-cards" class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${savedView === 'cards' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-600 hover:text-slate-900'}">
              <i class="fas fa-border-all"></i> Cards
            </button>
            <button id="btn-view-table" class="px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${savedView === 'table' ? 'bg-white shadow-xs text-teal-800' : 'text-slate-600 hover:text-slate-900'}">
              <i class="fas fa-list"></i> Tabla
            </button>
          </div>

          ${can('canWrite') ? '<button class="btn btn-outline" id="btn-config-codificacion" onclick="window._openConfigCodificacionModal()"><i class="fas fa-gear"></i> Codificación</button>' : ''}
          ${can('canWrite') ? '<button class="btn btn-outline" id="btn-catalog-manager"><i class="fas fa-tags"></i> Categorías</button>' : ''}
          ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-product"><i class="fas fa-plus"></i> Nuevo Producto</button>' : ''}
        </div>
      </div>

      <!-- Selector Estricto de Modo Comercial (No Mezcla de Naturaleza) -->
      <div class="mb-4 bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button id="btn-mode-venta" class="flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${cartMode === 'venta' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            <i class="fas fa-boxes-stacked"></i> 🛍️ Venta Inmediata (Stock Físico)
          </button>
          <button id="btn-mode-reserva" class="flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${cartMode === 'reserva' ? 'bg-[#006876] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            <i class="fas fa-ship"></i> 🚢 Preventa & Reservas (En Tránsito)
          </button>
        </div>

        <div class="text-xs font-semibold px-2">
          ${cartMode === 'reserva'
            ? '<span class="text-teal-800 font-bold"><i class="fas fa-circle-info mr-1"></i>Modo Reserva Activo: Solo se aparta mercancía en camino con fecha ETA.</span>'
            : '<span class="text-slate-600"><i class="fas fa-circle-check text-emerald-600 mr-1"></i>Modo Venta Inmediata: Stock físico en bodega para despacho ya.</span>'}
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${kpiCard('Total catálogo', products.length, 'fas fa-box-open', '#1A4B8C', '#EEF4FF')}
        ${kpiCard('Activos', activeCount, 'fas fa-circle-check', '#059669', '#ECFDF5')}
        ${kpiCard('Bienes (Físicos)', bienesCount, 'fas fa-boxes-stacked', '#C46516', '#FFF8F0')}
        ${kpiCard('Servicios', serviciosCount, 'fas fa-handshake', '#7C3AED', '#F5F3FF')}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-4 mb-4 shadow-xs" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3">
          <input id="prod-q" class="form-input flex-1 min-w-48 text-xs py-2" placeholder="Buscar por código, referencia o nombre...">
          <select id="prod-type" class="form-input text-xs" style="max-width:180px">
            <option value="">Todos los tipos</option>
            ${PRODUCT_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
          <select id="prod-categoria" class="form-input text-xs" style="max-width:180px">
            <option value="">Todas las categorías</option>
            ${categorias.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
          </select>
          <select id="prod-linea" class="form-input text-xs" style="max-width:160px">
            <option value="">Todas las líneas</option>
            ${lineas.map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join('')}
          </select>
          <select id="prod-iva" class="form-input text-xs" style="max-width:150px">
            <option value="">Tarifas IVA</option>
            ${IVA_RATES.map(r => `<option value="${r.value}">${r.value}%</option>`).join('')}
          </select>
          <select id="prod-status" class="form-input text-xs" style="max-width:140px">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Vista 1: Grid de Tarjetas E-Commerce -->
      <div id="prod-cards-view" style="${savedView === 'cards' ? '' : 'display:none'}" class="pb-36 sm:pb-44">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4" id="prod-cards-grid">
          ${products.length ? renderProductCards(products, stockMap, incomingMap) : '<div class="col-span-full p-8 text-center text-gray-400 bg-white rounded-2xl">No hay productos que coincidan con los filtros.</div>'}
        </div>
      </div>

      <!-- Vista 2: Tabla Administrativa de Escritorio -->
      <div id="prod-table-view" style="${savedView === 'table' ? '' : 'display:none'}" class="bg-white rounded-2xl border overflow-hidden pb-24" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="prod-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Stock Bodega</th>
                <th>En Tránsito</th>
                <th class="text-right">IVA %</th>
                <th class="text-right">Precio base</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              ${products.length ? renderProductRows(products, stockMap, incomingMap) : emptyRow(10)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Barra Flotante Global de Carrito (Sticky sobre el Bottom Nav) -->
      <div id="ecom-floating-cart-bar" class="fixed bottom-[70px] sm:bottom-[74px] left-3 right-3 max-w-xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-slate-700/80 z-[880] flex items-center justify-between gap-3 transition-all" style="display:none">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-[#006876] text-white flex items-center justify-center font-extrabold text-sm relative shadow-sm">
            <i class="fas fa-cart-shopping"></i>
            <span id="ecom-floating-badge" class="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold border-2 border-slate-900">0</span>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block" id="ecom-floating-count-lbl">0 productos</span>
            <span id="ecom-floating-total-lbl" class="text-sm sm:text-base font-extrabold text-emerald-400">$ 0</span>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button id="ecom-btn-clear-cart" class="p-2 text-slate-400 hover:text-rose-400 text-xs rounded-xl" title="Vaciar Carrito">
            <i class="fas fa-trash"></i>
          </button>
          <button id="ecom-btn-checkout" class="btn btn-primary px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
            <span>Finalizar Pedido</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
      `;

    // ── Eventos de Cambio de Modo Comercial (Venta vs Reserva) ──
    $('#btn-mode-venta')?.addEventListener('click', () => {
      const ok = (window as any).SalesCart?.setCartMode('venta');
      if (ok) renderProductos($('#page-content'));
    });

    $('#btn-mode-reserva')?.addEventListener('click', () => {
      const ok = (window as any).SalesCart?.setCartMode('reserva');
      if (ok) renderProductos($('#page-content'));
    });

    // ── Sincronización Reactiva de la Barra Flotante de Carrito ──
    function syncFloatingCartUI() {
      const bar = document.getElementById('ecom-floating-cart-bar');
      const badge = document.getElementById('ecom-floating-badge');
      const countLbl = document.getElementById('ecom-floating-count-lbl');
      const totalLbl = document.getElementById('ecom-floating-total-lbl');
      if (!bar) return;

      const summary = (window as any).SalesCart?.getSummary();
      if (!summary || summary.totalProducts === 0) {
        bar.style.display = 'none';
        return;
      }

      bar.style.display = 'flex';
      const modeTxt = summary.activeMode === 'reserva' ? '📦 Reserva' : '🛍️ Venta';
      if (badge) badge.textContent = String(summary.totalProducts);
      if (countLbl) countLbl.textContent = `${modeTxt}: ${summary.totalProducts} prod (${fmtN(summary.totalUnits)} unid)`;
      if (totalLbl) totalLbl.textContent = fmt(summary.total);
    }

    window.addEventListener('gravy-cart-updated', syncFloatingCartUI);
    syncFloatingCartUI();

    $('#ecom-btn-clear-cart')?.addEventListener('click', () => {
      if (confirm('¿Deseas vaciar todos los productos del carrito de pedido?')) {
        (window as any).SalesCart?.clear();
        $$('.input-ecom-qty').forEach((inp: any) => { inp.value = '0'; });
        $$('.ecom-equiv-box').forEach((box: any) => { box.innerHTML = ''; box.classList.add('hidden'); });
      }
    });

    $('#ecom-btn-checkout')?.addEventListener('click', () => {
      openCheckoutDrawer(() => renderProductos($('#page-content')));
    });

    // ── Eventos Filtros ───────────────────────────────────────
    const applyFilter = () => filterProductCatalog();
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

    const tbl = $('#prod-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

    // Conectar inputs de tarjetas
    _bindProductCardCartEvents(products, incomingMap);

  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

// ── Renderizado de Tarjetas E-Commerce con Metrología Variable y Stock ETA ─────
function renderProductCards(products, stockMap = {}, incomingMap = {}) {
  const cart = (window as any).SalesCart;
  const currentMode = cart?.activeMode || 'venta';

  return products.map(p => {
    const onHand = Number(stockMap[p.id] || 0);
    const incoming = incomingMap[p.id];
    const transitAvail = Number(incoming?.totalAvailable || 0);
    const cartItem = cart?.getItem(p.id);
    const currentQty = cartItem?.qty || 0;
    const selectedUnit = cartItem?.unit || p.unit || 'UND';

    const isService = p.type === 'SERVICIO';
    const maxAllowedQty = isService ? 999999 : (currentMode === 'reserva' ? transitAvail : onHand);
    const isBlocked = !isService && maxAllowedQty <= 0;

    const imageUrl = p.image 
      ? `${(window as any).PB_URL}/api/files/products/${p.id}/${p.image}?thumb=300x300${(window as any).pb.authToken ? '&token=' + (window as any).pb.authToken : ''}`
      : '';

    const hasDimensions = (Number(p.largo_cm) > 0 && Number(p.ancho_cm) > 0) || Number(p.und_empaque) > 0 || String(p.unit).toUpperCase() === 'M2';

    // Semáforo dinámico según el modo activo
    let stockBadge = '';
    if (isService) {
      stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800"><i class="fas fa-handshake mr-1"></i>Servicio</span>`;
    } else if (currentMode === 'reserva') {
      // MODO RESERVA: destaca mercancía en tránsito
      if (transitAvail > 0) {
        const nearestEta = incoming.lots[0]?.eta || 'Pronto';
        stockBadge = `
          <button type="button" class="btn-show-transit-lots text-left w-full px-2 py-1 rounded-lg text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 transition-colors flex items-center justify-between" data-id="${p.id}">
            <span><i class="fas fa-ship mr-1"></i>${fmtN(transitAvail)} en camino</span>
            <span class="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded">ETA ${nearestEta}</span>
          </button>
        `;
      } else {
        stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500"><i class="fas fa-circle-xmark mr-1"></i>Sin embarques en tránsito</span>`;
      }
    } else {
      // MODO VENTA INMEDIATA: destaca stock físico en bodega
      if (onHand > 10) {
        stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800"><i class="fas fa-circle-check mr-1"></i>${fmtN(onHand)} en bodega</span>`;
      } else if (onHand > 0) {
        stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800"><i class="fas fa-triangle-exclamation mr-1"></i>Últimas ${fmtN(onHand)} unid</span>`;
      } else if (transitAvail > 0) {
        stockBadge = `
          <button type="button" class="btn-switch-reserva-item text-left w-full px-2 py-1 rounded-lg text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors" data-id="${p.id}">
            <i class="fas fa-ship mr-1 text-blue-600"></i>0 en bodega · <strong>+${fmtN(transitAvail)} en Tránsito</strong>
          </button>
        `;
      } else {
        stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800"><i class="fas fa-ban mr-1"></i>Agotado</span>`;
      }
    }

    return `
      <div class="prod-ecom-card bg-white rounded-2xl p-3 border ${currentMode === 'reserva' ? 'border-teal-300 bg-teal-50/20' : 'border-slate-200'} shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
           data-id="${p.id}"
           data-type="${esc(p.type)}" 
           data-iva="${p.iva_rate ?? ''}" 
           data-active="${p.active}" 
           data-categoria="${esc(p.categoria || '')}" 
           data-linea="${esc(p.linea || '')}">
        
        <div>
          <!-- Imagen del Producto -->
          <div class="relative w-full h-24 sm:h-28 bg-slate-50 rounded-xl overflow-hidden mb-2 border border-slate-100 flex items-center justify-center cursor-pointer"
               onclick="window.viewProductDetail('${p.id}')">
            ${imageUrl ? `
              <img src="${imageUrl}" alt="${esc(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            ` : `
              <div class="text-slate-300 text-2xl group-hover:scale-110 transition-transform">
                <i class="fas fa-box-open"></i>
              </div>
            `}
            <span class="absolute top-1.5 right-1.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${p.active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'} shadow-2xs">
              ${p.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <!-- Stock Semáforo Interactivo -->
          <div class="mb-1.5">
            ${stockBadge}
          </div>

          <!-- Referencia y Categoría -->
          <p class="text-[10px] font-mono text-slate-500 uppercase tracking-tight truncate">
            ${esc(p.code)} ${p.categoria ? `· <span class="font-sans">${esc(p.categoria)}</span>` : ''}
          </p>

          <!-- Nombre -->
          <h4 class="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2 mt-0.5 cursor-pointer hover:text-teal-700"
              onclick="window.viewProductDetail('${p.id}')">
            ${esc(p.name)}
          </h4>
        </div>

        <div class="mt-2.5 pt-2 border-t border-slate-100 space-y-2">
          
          <!-- Selector de Unidad si tiene Metrología Variable -->
          ${hasDimensions ? `
            <div class="flex items-center justify-between gap-1 text-[10px]">
              <span class="text-slate-500 font-bold">Unidad:</span>
              <select class="ecom-unit-sel font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 outline-none" data-id="${p.id}">
                <option value="M2"${selectedUnit === 'M2' ? ' selected' : ''}>M²</option>
                <option value="CJ"${selectedUnit === 'CJ' ? ' selected' : ''}>Caja</option>
                <option value="UND"${selectedUnit === 'UND' ? ' selected' : ''}>Ficha / Und</option>
                <option value="KG"${selectedUnit === 'KG' ? ' selected' : ''}>Kg</option>
              </select>
            </div>
            <!-- Equivalencias calculadas en vivo -->
            <div class="ecom-equiv-box text-[9px] text-teal-800 font-mono bg-teal-50/70 border border-teal-200/50 p-1 rounded-md ${currentQty > 0 ? '' : 'hidden'}" id="ecom-equiv-${p.id}"></div>
          ` : ''}

          <!-- Precio -->
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-extrabold text-blue-900">${p.base_price ? fmt(p.base_price) : '$ 0'}</span>
            <span class="text-[10px] font-bold text-slate-400">IVA ${p.iva_rate ?? 0}%</span>
          </div>

          <!-- Control Stepper Decimal Táctil + Input Directo con Bloqueo de Stock -->
          ${isBlocked ? `
            <div class="flex items-center justify-between bg-slate-100 rounded-xl p-1 gap-1 opacity-60" title="${currentMode === 'reserva' ? 'Sin embarques disponibles para reserva' : 'Agotado en bodega'}">
              <button type="button" disabled class="w-7 h-7 rounded-lg bg-slate-200 text-slate-400 font-extrabold flex items-center justify-center cursor-not-allowed">
                <i class="fas fa-minus text-[10px]"></i>
              </button>
              <input type="number" disabled class="flex-1 w-12 text-center font-extrabold text-xs bg-slate-200 border border-slate-300 rounded-lg py-1 text-slate-500 cursor-not-allowed" value="0" placeholder="0">
              <button type="button" disabled class="w-7 h-7 rounded-lg bg-slate-200 text-slate-400 font-extrabold flex items-center justify-center cursor-not-allowed">
                <i class="fas fa-plus text-[10px]"></i>
              </button>
            </div>
          ` : `
            <div class="flex items-center justify-between bg-slate-100 rounded-xl p-1 gap-1">
              <button type="button" class="btn-card-minus w-7 h-7 rounded-lg bg-white text-slate-700 font-extrabold flex items-center justify-center shadow-xs active:scale-90" data-id="${p.id}">
                <i class="fas fa-minus text-[10px]"></i>
              </button>
              <input type="number" step="any" min="0" max="${maxAllowedQty}" inputmode="decimal" 
                     class="input-ecom-qty flex-1 w-12 text-center font-extrabold text-xs bg-white border border-slate-200 rounded-lg py-1 text-slate-900 outline-none focus:ring-1 focus:ring-teal-600" 
                     value="${currentQty > 0 ? currentQty : '0'}" 
                     placeholder="0" 
                     data-id="${p.id}"
                     data-max="${maxAllowedQty}">
              <button type="button" class="btn-card-plus w-7 h-7 rounded-lg bg-[#006876] text-white font-extrabold flex items-center justify-center shadow-xs active:scale-90" data-id="${p.id}">
                <i class="fas fa-plus text-[10px]"></i>
              </button>
            </div>
          `}

        </div>

      </div>
    `;
  }).join('');
}

// ── Modal de Detalle de Embarques y Lotes en Tránsito (ETA) ───────────────────
function _showTransitLotsModal(product: any, incomingInfo: any) {
  const lots = incomingInfo?.lots || [];
  const esc = (window as any).esc;
  const fmt = (window as any).fmt;
  const fmtN = (window as any).fmtN;

  const html = `
    <div class="space-y-4 text-slate-800 -m-2 sm:-m-4">
      <div class="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg">
          <i class="fas fa-ship"></i>
        </div>
        <div>
          <h4 class="font-extrabold text-sm text-blue-900">${esc(product.name)}</h4>
          <p class="text-xs text-blue-700 font-mono">Cód: ${esc(product.code)} · Total en camino: <strong>${fmtN(incomingInfo.totalAvailable)} ${esc(product.unit || 'und')}</strong></p>
        </div>
      </div>

      <div class="space-y-2.5 max-h-72 overflow-y-auto">
        ${lots.length === 0 ? `
          <div class="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            <i class="fas fa-box-open text-2xl mb-1 text-slate-300"></i>
            <p class="text-xs font-semibold">No hay lotes con unidades disponibles en este momento.</p>
          </div>
        ` : lots.map((lot: any, idx: number) => {
          const isLotExhausted = Number(lot.available || 0) <= 0;
          return `
            <div class="bg-white p-3.5 rounded-2xl border ${isLotExhausted ? 'border-slate-200 opacity-60 bg-slate-50' : 'border-slate-200 shadow-xs'} space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">${esc(lot.importNumber)}</span>
                  <span class="text-[11px] font-semibold text-slate-600">${esc(lot.importStatus)}</span>
                </div>
                <span class="text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  <i class="fas fa-calendar-day mr-1"></i>ETA: ${lot.eta}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <div>
                  <span class="text-slate-400 text-[10px] block">Disponibilidad en este lote:</span>
                  <span class="font-extrabold text-sm ${isLotExhausted ? 'text-slate-500' : 'text-emerald-700'} font-mono">${fmtN(lot.available)} ${esc(product.unit || 'und')} libres</span>
                </div>

                ${isLotExhausted ? `
                  <button type="button" disabled class="btn btn-sm px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed">
                    <i class="fas fa-ban mr-1"></i>Agotado
                  </button>
                ` : `
                  <button type="button" class="btn-pick-lot btn btn-primary btn-sm px-3 py-1.5 rounded-xl font-bold text-xs bg-[#006876] hover:bg-[#004F5A] text-white flex items-center gap-1.5" data-lotid="${lot.id}">
                    <i class="fas fa-plus"></i> Reservar de este Lote
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  (window as any).openModal('Lotes en Tránsito — ' + product.name, html, '<button class="btn btn-outline" onclick="window.closeModal()">Cerrar</button>', true);

  $$('.btn-pick-lot').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const lotId = btn.dataset.lotid;
      const targetLot = lots.find((l: any) => l.id === lotId);
      if (!targetLot || Number(targetLot.available || 0) <= 0) {
        (window as any).showToast('Este lote no tiene unidades disponibles.', 'warning');
        return;
      }
      const ok = (window as any).SalesCart?.setCartMode('reserva');
      if (ok) {
        (window as any).SalesCart?.setItem(product, 1, product.unit || 'UND', undefined, targetLot);
        (window as any).closeModal();
        (window as any).showToast(`Añadido 1 ${product.unit || 'und'} a la reserva del lote ${targetLot?.importNumber || ''}`, 'success');
        renderProductos($('#page-content'));
      }
    });
  });
}

// ── Enlazar Eventos de Carrito en Tarjetas del Catálogo ────────────────────────
function _bindProductCardCartEvents(products: any[], incomingMap: any = {}) {
  const cart = (window as any).SalesCart;

  const updateCardEquiv = (pid: string, prod: any, qty: number, unit: string) => {
    const box = document.getElementById(`ecom-equiv-${pid}`);
    if (!box) return;
    if (qty <= 0) {
      box.innerHTML = '';
      box.classList.add('hidden');
      return;
    }
    const conv = (window as any).convertProductQty(qty, unit, prod);
    const parts: string[] = [];
    if (conv.cajas != null) parts.push(`<strong>${conv.cajas}</strong> Cajas`);
    if (conv.m2 != null) parts.push(`<strong>${conv.m2}</strong> m²`);
    if (conv.unidades != null) parts.push(`<strong>${conv.unidades}</strong> Fichas`);
    if (conv.pesoKg != null) parts.push(`<strong>${conv.pesoKg}</strong> Kg`);

    box.innerHTML = `ℹ️ ${parts.join(' · ')}`;
    box.classList.remove('hidden');
  };

  // Botón Ver Lotes en Tránsito
  $$('.btn-show-transit-lots').forEach((btn: any) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const pid = btn.dataset.id;
      const prod = products.find(p => p.id === pid);
      if (prod && incomingMap[pid]) {
        _showTransitLotsModal(prod, incomingMap[pid]);
      }
    });
  });

  // Botón Cambiar a Modo Reserva
  $$('.btn-switch-reserva-item').forEach((btn: any) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const ok = cart?.setCartMode('reserva');
      if (ok) renderProductos($('#page-content'));
    });
  });

  $$('.btn-card-plus').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.id;
      const prod = products.find(p => p.id === pid);
      if (!prod) return;

      const input = document.querySelector(`.input-ecom-qty[data-id="${pid}"]`) as HTMLInputElement;
      const unitSel = document.querySelector(`.ecom-unit-sel[data-id="${pid}"]`) as HTMLSelectElement;
      const unit = unitSel ? unitSel.value : (prod.unit || 'UND');

      const maxAllowed = parseFloat(input?.dataset.max || '999999');
      let cur = parseFloat(input?.value || '0') || 0;

      if (cur + 1 > maxAllowed && prod.type !== 'SERVICIO') {
        (window as any).showToast(`Disponibilidad máxima alcanzada (${maxAllowed} ${unit}). No es posible agregar más.`, 'warning');
        return;
      }

      cur += 1;
      if (input) input.value = String(cur);

      cart?.setItem(prod, cur, unit);
      updateCardEquiv(pid, prod, cur, unit);
    });
  });

  $$('.btn-card-minus').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.id;
      const prod = products.find(p => p.id === pid);
      if (!prod) return;

      const input = document.querySelector(`.input-ecom-qty[data-id="${pid}"]`) as HTMLInputElement;
      const unitSel = document.querySelector(`.ecom-unit-sel[data-id="${pid}"]`) as HTMLSelectElement;
      const unit = unitSel ? unitSel.value : (prod.unit || 'UND');

      let cur = parseFloat(input?.value || '0') || 0;
      cur = Math.max(0, cur - 1);
      if (input) input.value = String(cur);

      cart?.setItem(prod, cur, unit);
      updateCardEquiv(pid, prod, cur, unit);
    });
  });

  $$('.input-ecom-qty').forEach((inp: any) => {
    inp.addEventListener('input', () => {
      const pid = inp.dataset.id;
      const prod = products.find(p => p.id === pid);
      if (!prod) return;

      const unitSel = document.querySelector(`.ecom-unit-sel[data-id="${pid}"]`) as HTMLSelectElement;
      const unit = unitSel ? unitSel.value : (prod.unit || 'UND');
      const maxAllowed = parseFloat(inp.dataset.max || '999999');

      let val = parseFloat(inp.value || '0') || 0;

      if (val > maxAllowed && prod.type !== 'SERVICIO') {
        val = maxAllowed;
        inp.value = String(maxAllowed);
        (window as any).showToast(`Cantidad ajustada al límite disponible (${maxAllowed} ${unit}).`, 'warning');
      } else if (val < 0) {
        val = 0;
        inp.value = '0';
      }

      cart?.setItem(prod, val, unit);
      updateCardEquiv(pid, prod, val, unit);
    });
  });

  $$('.ecom-unit-sel').forEach((sel: any) => {
    sel.addEventListener('change', () => {
      const pid = sel.dataset.id;
      const prod = products.find(p => p.id === pid);
      if (!prod) return;

      const input = document.querySelector(`.input-ecom-qty[data-id="${pid}"]`) as HTMLInputElement;
      const val = parseFloat(input?.value || '0') || 0;
      cart?.setItem(prod, val, sel.value);
      updateCardEquiv(pid, prod, val, sel.value);
    });
  });
}

// ── Modal / Drawer de Checkout de Cierre de Pedido ─────────────────────────────
async function openCheckoutDrawer(onDone: any = null) {
  const cart = (window as any).SalesCart;
  const summary = cart?.getSummary();
  if (!summary || summary.totalProducts === 0) {
    (window as any).showToast('El carrito está vacío. Agrega productos desde el catálogo.', 'warning');
    return;
  }

  const [customers, warehouses] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
  ]);

  const preselectedCust = summary.activeCustomer;
  const preselectedCustId = preselectedCust?.id || '';
  const initialCustDisplay = preselectedCust ? `${preselectedCust.name} (${preselectedCust.doc_number || preselectedCust.nit || 'S/N'})` : '';

  const drawerHtml = `
    <div class="space-y-4 text-slate-800 -m-2 sm:-m-4">
      
      <!-- Top: Cliente y Destino -->
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <!-- Buscador Dinámico de Clientes / Terceros -->
        <div class="relative">
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-extrabold text-slate-700">Cliente Adquirente <span class="text-red-500">*</span></label>
            <button type="button" id="chk-customer-add-btn" class="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1">
              <i class="fas fa-user-plus text-xs"></i> <span>+ Nuevo Cliente</span>
            </button>
          </div>
          
          <div class="relative flex items-center">
            <input type="text" id="chk-customer-search-inp" autocomplete="off"
                   placeholder="🔍 Buscar por nombre, NIT, teléfono o ciudad..." 
                   value="${esc(initialCustDisplay)}"
                   class="w-full form-input text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600">
            <input type="hidden" id="chk-customer-id" value="${esc(preselectedCustId)}">
            
            <button type="button" id="chk-customer-clear-btn" class="absolute right-2 text-slate-400 hover:text-rose-500 p-1 ${preselectedCustId ? '' : 'hidden'}" title="Limpiar Selección">
              <i class="fas fa-times-circle text-sm"></i>
            </button>
          </div>

          <!-- Dropdown Flotante Dinámico de Resultados -->
          <div id="chk-customer-results" class="hidden absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-100">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Bodega de Despacho</label>
            <select id="chk-warehouse-sel" class="w-full form-input text-xs py-1.5">
              <option value="">— Bodega Principal —</option>
              ${warehouses.map((w: any) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1">Tipo de Operación</label>
            <select id="chk-mode-sel" class="w-full form-input text-xs py-1.5 font-bold">
              <option value="venta">🛍️ Venta Inmediata</option>
              <option value="reserva">📦 Reserva de Stock</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Resumen de Artículos con Metrología -->
      <div class="border border-slate-200 rounded-2xl overflow-hidden">
        <div class="bg-slate-100 px-3 py-2 border-b border-slate-200 font-extrabold text-xs text-slate-700 flex justify-between">
          <span>Artículos en Pedido (${summary.totalProducts})</span>
          <span>${fmtN(summary.totalUnits)} Unidades Totales</span>
        </div>

        <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 p-2" id="chk-lines-list">
          ${summary.items.map((item: any) => {
            const p = item.product;
            const conv = item.equivalences;
            const equivParts: string[] = [];
            if (conv?.cajas != null && item.unit !== 'CJ') equivParts.push(`${conv.cajas} Cajas`);
            if (conv?.m2 != null && item.unit !== 'M2') equivParts.push(`${conv.m2} m²`);
            if (conv?.pesoKg != null && item.unit !== 'KG') equivParts.push(`${conv.pesoKg} Kg`);

            return `
              <div class="p-2 flex items-center justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <h5 class="font-extrabold text-xs text-slate-900 truncate">${esc(p.name)}</h5>
                  <p class="text-[10px] text-slate-500">
                    <span class="font-mono font-bold">${item.qty} ${item.unit}</span> x ${fmt(item.unitPrice)}
                    ${equivParts.length ? `· <span class="text-teal-700 font-semibold font-mono">(${equivParts.join(' · ')})</span>` : ''}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-xs text-blue-900 font-mono">${fmt(item.total)}</span>
                  <button type="button" class="btn-chk-del text-slate-400 hover:text-rose-600 p-1" data-id="${p.id}" title="Quitar">
                    <i class="fas fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Notas e Instrucciones -->
      <div>
        <label class="block text-[10px] font-bold text-slate-500 mb-1">Observaciones / Instrucciones de Entrega</label>
        <input id="chk-order-notes" type="text" placeholder="Ej: Entregar en obra bloque B, cliente retira en bodega..." class="w-full form-input text-xs py-2">
      </div>

      <!-- Totales -->
      <div class="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-baseline shadow-md">
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Subtotal: ${fmt(summary.subtotal)} · IVA: ${fmt(summary.iva)}</span>
          <span class="text-xs font-bold text-slate-300">TOTAL NETO DEL PEDIDO:</span>
        </div>
        <span class="text-xl font-extrabold text-emerald-400 font-mono">${fmt(summary.total)}</span>
      </div>

    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="window.closeModal()">Seguir Comprando</button>
    <button class="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold" id="btn-chk-save-order">
      <i class="fas fa-circle-check"></i> Emitir Pedido
    </button>
  `;

  (window as any).openModal('Checkout — Finalizar Pedido', drawerHtml, footer, true);

  // ── Lógica del Buscador Dinámico de Clientes ──
  const custSearchInput = document.getElementById('chk-customer-search-inp') as HTMLInputElement;
  const custHiddenId = document.getElementById('chk-customer-id') as HTMLInputElement;
  const custClearBtn = document.getElementById('chk-customer-clear-btn') as HTMLButtonElement;
  const custResults = document.getElementById('chk-customer-results') as HTMLElement;
  const custAddBtn = document.getElementById('chk-customer-add-btn') as HTMLButtonElement;

  const renderCustResults = (query: string) => {
    const q = (query || '').toLowerCase().trim();
    const filtered = !q 
      ? customers.slice(0, 25) 
      : customers.filter((c: any) => {
          const matchStr = `${c.name || ''} ${c.doc_number || ''} ${c.nit || ''} ${c.city || ''} ${c.phone || ''}`.toLowerCase();
          return matchStr.includes(q);
        }).slice(0, 25);

    if (!filtered.length) {
      custResults.innerHTML = `
        <div class="p-3 text-center text-xs text-slate-400">
          <i class="fas fa-user-slash mr-1"></i> No se encontraron clientes con "${esc(query)}"
        </div>
      `;
      custResults.classList.remove('hidden');
      return;
    }

    custResults.innerHTML = filtered.map((c: any) => `
      <div class="p-2.5 hover:bg-teal-50 cursor-pointer flex items-center justify-between gap-2 transition-colors item-cust-pick" data-id="${esc(c.id)}">
        <div class="min-w-0">
          <h5 class="font-extrabold text-xs text-slate-900 truncate">${esc(c.name)}</h5>
          <p class="text-[10px] text-slate-500 truncate">
            Doc: <span class="font-mono font-bold text-slate-700">${esc(c.doc_number || c.nit || 'S/N')}</span>
            ${c.city ? ` · 📍 ${esc(c.city)}` : ''}
            ${c.phone ? ` · 📞 ${esc(c.phone)}` : ''}
          </p>
        </div>
        <span class="text-[10px] bg-slate-100 text-teal-700 font-bold px-2 py-0.5 rounded-md flex-shrink-0">Seleccionar</span>
      </div>
    `).join('');

    custResults.querySelectorAll('.item-cust-pick').forEach((item: any) => {
      item.addEventListener('click', () => {
        const selId = item.dataset.id;
        const selCust = customers.find((c: any) => c.id === selId);
        if (selCust) {
          custHiddenId.value = selCust.id;
          custSearchInput.value = `${selCust.name} (${selCust.doc_number || selCust.nit || 'S/N'})`;
          custClearBtn.classList.remove('hidden');
          custResults.classList.add('hidden');
          cart.setActiveCustomer(selCust);
        }
      });
    });

    custResults.classList.remove('hidden');
  };

  custSearchInput?.addEventListener('focus', () => renderCustResults(custSearchInput.value));
  custSearchInput?.addEventListener('input', () => {
    custHiddenId.value = '';
    custClearBtn.classList.toggle('hidden', !custSearchInput.value);
    renderCustResults(custSearchInput.value);
  });

  custClearBtn?.addEventListener('click', () => {
    custHiddenId.value = '';
    custSearchInput.value = '';
    custClearBtn.classList.add('hidden');
    cart.setActiveCustomer(null);
    custSearchInput.focus();
    renderCustResults('');
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (ev: any) => {
    if (!ev.target.closest('#chk-customer-search-inp') && !ev.target.closest('#chk-customer-results')) {
      custResults?.classList.add('hidden');
    }
  });

  // Botón Crear Nuevo Cliente Rápido
  custAddBtn?.addEventListener('click', () => {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, (createdCustomer: any) => {
        if (createdCustomer && createdCustomer.id) {
          customers.unshift(createdCustomer);
          custHiddenId.value = createdCustomer.id;
          custSearchInput.value = `${createdCustomer.name} (${createdCustomer.doc_number || createdCustomer.nit || 'S/N'})`;
          custClearBtn.classList.remove('hidden');
          cart.setActiveCustomer(createdCustomer);
        }
      });
    }
  });

  // Botones de eliminar línea
  $$('.btn-chk-del').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      cart.removeItem(btn.dataset.id);
      openCheckoutDrawer(onDone);
    });
  });

  // Guardar Pedido Final
  $('#btn-chk-save-order')?.addEventListener('click', async () => {
    try {
      const customerId = (document.getElementById('chk-customer-id') as HTMLInputElement)?.value;
      if (!customerId) throw new Error('Por favor busca y selecciona un cliente para el pedido.');

      const currentSummary = cart.getSummary();
      if (!currentSummary.items.length) throw new Error('No hay artículos en el carrito.');

      const warehouseId = (document.getElementById('chk-warehouse-sel') as HTMLSelectElement)?.value || null;
      const mode = (document.getElementById('chk-mode-sel') as HTMLSelectElement)?.value || 'venta';
      const notes = (document.getElementById('chk-order-notes') as HTMLInputElement)?.value.trim() || (mode === 'reserva' ? 'Reserva de stock en preventa' : '');

      const lines = currentSummary.items.map((item: any) => {
        const p = item.product;
        return {
          product_id: p.id,
          description: `${p.name} [${item.qty} ${item.unit}]`,
          qty: item.qty,
          unit_price: item.unitPrice,
          iva_rate: item.ivaRate,
          iva_amount: item.iva,
          subtotal: item.subtotal,
          total: item.total,
        };
      });

      const isReserva = (mode === 'reserva') || (currentSummary.activeMode === 'reserva');

      // ── Validación Estricta Anti-Saldos Negativos en Tiempo Real ──
      for (const item of currentSummary.items) {
        const p = item.product;
        if (p.type === 'SERVICIO') continue;

        if (isReserva) {
          const incoming = await (window as any).API.getIncomingStockForProduct(p.id).catch(() => []);
          const totalTransitAvail = (incoming || []).reduce((s: number, l: any) => s + Number(l.qty_available ?? l.qty ?? 0), 0);
          if (item.qty > totalTransitAvail) {
            throw new Error(`No es posible procesar la reserva. El producto "${p.name}" supera las unidades libres en tránsito (Solicitado: ${item.qty} ${item.unit}, Disponibles: ${totalTransitAvail} ${item.unit}).`);
          }
        } else {
          const stockRows = await (window as any).API.getInventoryStock().catch(() => []);
          const prodStock = (stockRows || []).filter((s: any) => s.product_id === p.id && (!warehouseId || s.warehouse_id === warehouseId));
          const onHand = prodStock.reduce((s: number, r: any) => s + Number(r.qty_on_hand || 0), 0);
          if (item.qty > onHand) {
            throw new Error(`No es posible procesar el pedido. El producto "${p.name}" supera el stock físico en bodega (Solicitado: ${item.qty} ${item.unit}, Disponible: ${onHand} ${item.unit}).`);
          }
        }
      }

      const header = {
        customer_id: customerId,
        warehouse_id: warehouseId,
        date: (window as any).todayStr(),
        due_date: (window as any).addDaysToDateStr((window as any).todayStr(), isReserva ? 15 : 3),
        notes: isReserva ? `[PREVENTA - RESERVA EN TRÁNSITO] ${notes}` : notes,
      };

      const btnSave = document.getElementById('btn-chk-save-order') as HTMLButtonElement;
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
      }

      const createdOrder = await (window as any).API.createSalesOrder(header, lines);

      if (isReserva) {
        // Crear registro oficial de reserva en PocketBase
        try {
          const resNumber = await (window as any).API.nextSalesReservationConsecutive().catch(() => `RES-${Date.now().toString().slice(-6)}`);
          const resHeader: any = {
            number: resNumber,
            customer_id: customerId,
            sales_order_id: createdOrder.id,
            status: 'active',
            notes: notes || 'Reserva de Importación - Preventa desde Catálogo Móvil',
            created_by: (window as any).pb.currentUser?.id || null,
          };
          const createdRes = await (window as any).pb.create('sales_reservations', resHeader);

          // Crear líneas de reserva asignadas a la importación
          for (const item of currentSummary.items) {
            const p = item.product;
            const targetLot = item.targetLot;
            let importLineId = targetLot?.id || '';
            let importId = targetLot?.import_id || '';
            let eta = targetLot?.rawEta || null;

            if (!importLineId) {
              const incoming = await (window as any).API.getIncomingStockForProduct(p.id).catch(() => []);
              const lot = incoming.find((l: any) => Number(l.qty_available ?? l.qty ?? 0) > 0);
              if (lot) {
                importLineId = lot.id;
                importId = lot.import_id;
                eta = lot.expand?.import_id?.estimated_arrival || null;
              }
            }

            await (window as any).pb.create('sales_reservation_lines', {
              reservation_id: createdRes.id,
              product_id: p.id,
              import_id: importId || null,
              import_line_id: importLineId || null,
              qty_reserved: item.qty,
              qty_dispatched: 0,
              qty_released: 0,
              status: 'active',
              eta_snapshot: eta,
            }).catch(() => {});
          }
        } catch (resErr: any) {
          console.warn('Error al vincular líneas de reserva:', resErr);
        }
      }

      cart.clear();
      (window as any).showToast(`¡${isReserva ? 'Reserva de Preventa' : 'Pedido'} #${createdOrder.number} generado con éxito!`, 'success');
      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      console.error('Error al emitir pedido:', err);
      const errMsg = err?.data?.message || err?.message || 'Error al guardar pedido';
      (window as any).showToast(errMsg, 'error');
      const btnSave = document.getElementById('btn-chk-save-order') as HTMLButtonElement;
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fas fa-circle-check"></i> Emitir Pedido';
      }
    }
  });
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

function renderProductRows(products, stockMap = {}, incomingMap = {}) {
  return products.map(p => {
    const typeBadge = p.type === 'BIEN'
      ? '<span class="badge badge-blue">Bien</span>'
      : '<span class="badge" style="background:#F5F3FF;color:#7C3AED">Servicio</span>';
    const statusBadge = p.active
      ? '<span class="badge badge-green">Activo</span>'
      : '<span class="badge badge-gray">Inactivo</span>';
    const onHand = Number(stockMap[p.id] || 0);
    const incoming = incomingMap[p.id];

    return `<tr data-type="${esc(p.type)}" data-iva="${p.iva_rate ?? ''}" data-active="${p.active}" data-categoria="${esc(p.categoria || '')}" data-linea="${esc(p.linea || '')}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(p.code)}</span></td>
      <td class="font-medium">${esc(p.name)}</td>
      <td>${typeBadge}</td>
      <td class="text-sm">${esc(p.categoria || '—')}</td>
      <td class="font-mono text-xs font-bold ${onHand > 0 ? 'text-emerald-700' : 'text-slate-400'}">${p.type === 'BIEN' ? `${fmtN(onHand)} ${esc(p.unit || '')}` : '—'}</td>
      <td class="text-xs">${incoming ? `<span class="badge badge-blue font-mono text-[10px]">+${fmtN(incoming.qty)}</span> <span class="text-[10px] text-gray-500">${incoming.eta || ''}</span>` : '—'}</td>
      <td class="text-right">${p.iva_rate ?? 0}%</td>
      <td class="text-right font-mono text-xs">
        <div class="font-semibold text-gray-900">${p.base_price ? fmt(p.base_price) : '—'}</div>
        ${p.auto_calc_price && p.margin_factor ? `<div class="text-[10px] text-blue-600 font-medium" title="Calculado desde costo con redondeo"><i class="fas fa-calculator mr-0.5"></i>${p.margin_factor}${p.margin_type === 'FACTOR' ? 'x' : '%'}</div>` : ''}
      </td>
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

// ── Filtro cliente (Aplica tanto a Tabla como a Cards) ────────────────────────
function filterProductCatalog() {
  const q        = (getInputVal('prod-q') || '').toLowerCase();
  const type     = getSelectVal('prod-type');
  const categoria = getSelectVal('prod-categoria');
  const linea    = getSelectVal('prod-linea');
  const iva      = getSelectVal('prod-iva');
  const status   = getSelectVal('prod-status');

  // Filtro en filas de tabla
  $$('#prod-table tbody tr[data-type]').forEach(tr => {
    const text    = tr.textContent.toLowerCase();
    const okQ     = !q        || text.includes(q);
    const okType  = !type     || tr.dataset.type      === type;
    const okCat   = !categoria || tr.dataset.categoria === categoria;
    const okLinea = !linea    || tr.dataset.linea     === linea;
    const okIva   = !iva      || tr.dataset.iva       === iva;
    const okStat  = !status   || tr.dataset.active    === status;
    tr.style.display = okQ && okType && okCat && okLinea && okIva && okStat ? '' : 'none';
  });

  // Filtro en Cards E-Commerce
  $$('.prod-ecom-card').forEach(card => {
    const text    = card.textContent.toLowerCase();
    const okQ     = !q        || text.includes(q);
    const okType  = !type     || card.dataset.type      === type;
    const okCat   = !categoria || card.dataset.categoria === categoria;
    const okLinea = !linea    || card.dataset.linea     === linea;
    const okIva   = !iva      || card.dataset.iva       === iva;
    const okStat  = !status   || card.dataset.active    === status;
    (card as HTMLElement).style.display = okQ && okType && okCat && okLinea && okIva && okStat ? 'flex' : 'none';
  });
}

function filterProductTable() { filterProductCatalog(); }

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

    const marginTypeLabel = p.margin_type === 'MARGIN_SALE' ? 'Margen s/Venta' : p.margin_type === 'FACTOR' ? 'Factor' : 'Markup s/Costo';

    openModal(
      `Producto — ${esc(p.code)}`,
      `<div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div class="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><span class="form-label">Código</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(p.code)}</p></div>
          <div class="md:col-span-2"><span class="form-label">Nombre</span><p class="font-semibold">${esc(p.name)}</p></div>
          <div><span class="form-label">Tipo</span><p>${esc(typeLabel)}</p></div>
          <div><span class="form-label">Unidad de medida (DIAN)</span><p class="font-mono" style="color:#1A4B8C">${esc(p.unit || '—')}<span class="font-sans font-normal text-xs ml-1" style="color:#6B7280">${p.unit ? '— ' + esc(getUnitName(p.unit)) : ''}</span></p></div>
          <div><span class="form-label">Presentacion</span><p>${esc(p.presentacion || '—')}</p></div>
          <div><span class="form-label">Categoria</span><p>${esc(p.categoria || '—')}</p></div>
          <div><span class="form-label">Linea</span><p>${esc(p.linea || '—')}</p></div>
          <div><span class="form-label">Tarifa IVA</span><p>${esc(ivaLabel)}</p></div>
          <div>
            <span class="form-label">Precio base venta</span>
            <p class="font-semibold text-blue-700">
              ${p.base_price ? fmt(p.base_price) : '—'}
              ${p.auto_calc_price && p.margin_factor ? `<span class="badge badge-blue ml-1.5 text-[10px]"><i class="fas fa-calculator mr-1"></i>${p.margin_factor}${p.margin_type === 'FACTOR' ? 'x' : '%'} (${marginTypeLabel})</span>` : ''}
            </p>
          </div>
          <div><span class="form-label">Precio venta 2</span><p>${p.precio_venta_2 ? fmt(p.precio_venta_2) : '—'}</p></div>
          <div><span class="form-label">Precio venta 3</span><p>${p.precio_venta_3 ? fmt(p.precio_venta_3) : '—'}</p></div>
          <div><span class="form-label">Costo estimado</span><p>${p.cost_price ? fmt(p.cost_price) : '—'}</p></div>
-label">Presentacion</span><p>${esc(p.presentacion || '—')}</p></div>
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
  const [allGoods, suppliers, salesCfgRaw, purchaseCfgRaw] = await Promise.all([
    API.getProducts({ activeOnly: true }).catch(() => []),
    pb.listAll('third_parties', { filter: 'type = "PROVEEDOR" && active = true' }).catch(() => []),
    API.getSetting('sales_settings_v2').catch(() => null),
    API.getSetting('purchase_config_v1').catch(() => null),
  ]);
  const allGoodsFiltered = allGoods.filter((p: any) => p.type === 'BIEN' && p.id !== row?.id && !p.is_combo);

  const rawCfg = await API.getSetting('product_config_v1');
  let productCfg = { auto_code: false, prefix: 'P-', consecutive: 1, digits: 4 };
  if (rawCfg) {
    try {
      productCfg = JSON.parse(rawCfg);
    } catch (_) {}
  }

  if (!accounts) {
    accounts = await API.getAccounts(false).catch(() => []);
  }

  const accountList = (Array.isArray(accounts) ? accounts : [])
    .filter(a => a.active && Number(a.level) >= 3)
    .sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')));
  const accountMap = new Map(accountList.map(a => [a.id, a]));

  // ── Detección automática de cuentas contables por defecto del módulo de Facturación ──
  let defaultIncomeAccountId = '';
  let defaultCostAccountId = '';
  let defaultInventoryAccountId = '';

  if (!row) {
    let salesCfg: any = null;
    let purchaseCfg: any = null;
    try { if (salesCfgRaw) salesCfg = JSON.parse(salesCfgRaw); } catch (_) {}
    try { if (purchaseCfgRaw) purchaseCfg = JSON.parse(purchaseCfgRaw); } catch (_) {}

    const salesAccounts = salesCfg?.accounting?.accounts || {};
    const purchaseAccounts = purchaseCfg?.accounting?.accounts || {};

    const findAccountByCode = (codeStr: string, defaultPrefixes: string) => {
      const code = String(codeStr || '').trim();
      if (code) {
        // 1. Coincidencia exacta nivel 5 (auxiliar)
        const exactL5 = accountList.find((a: any) => Number(a.level) === 5 && a.code === code);
        if (exactL5) return exactL5.id;

        // 2. Coincidencia exacta en cualquier nivel -> buscar el primer auxiliar nivel 5 que empiece con ese código
        const exactAny = accountList.find((a: any) => a.code === code);
        if (exactAny) {
          if (Number(exactAny.level) === 5) return exactAny.id;
          const childL5 = accountList.find((a: any) => Number(a.level) === 5 && String(a.code || '').startsWith(code));
          if (childL5) return childL5.id;
        }

        // 3. Primer auxiliar nivel 5 que empiece con el código
        const prefMatch = accountList.find((a: any) => Number(a.level) === 5 && String(a.code || '').startsWith(code));
        if (prefMatch) return prefMatch.id;
      }

      // Fallback: buscar por prefijos generales de la clase contable
      const prefixes = defaultPrefixes.split(',');
      for (const pref of prefixes) {
        const fallback = accountList.find((a: any) => Number(a.level) === 5 && String(a.code || '').startsWith(pref.trim()));
        if (fallback) return fallback.id;
      }
      return '';
    };

    // 1. Cuenta de Ingresos (Clase 41)
    const targetIncomeCode = String(salesAccounts.income_fallback_code || salesAccounts.income_account_code || '41359501').trim();
    defaultIncomeAccountId = findAccountByCode(targetIncomeCode, '41');

    // 2. Cuenta de Costo de Ventas (Clase 61)
    const targetCostCode = String(
      salesAccounts.cost_fallback_code || 
      (purchaseAccounts.cost_fallback_code && String(purchaseAccounts.cost_fallback_code).startsWith('61') ? purchaseAccounts.cost_fallback_code : '') || 
      '61359501'
    ).trim();
    defaultCostAccountId = findAccountByCode(targetCostCode, '61');

    // 3. Cuenta de Inventario (Clase 14)
    const targetInvCode = String(salesAccounts.inventory_fallback_code || purchaseAccounts.inventory_code || salesAccounts.inventory_code || '14350501').trim();
    defaultInventoryAccountId = findAccountByCode(targetInvCode, '14');
  }

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

  const defaultIvaRate = (row?.iva_rate !== undefined && row?.iva_rate !== null) ? Number(row.iva_rate) : 19;

  openModal(
    row ? `Editar — ${esc(row.code)}` : 'Nuevo Producto / Servicio',
    `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Fila 1 -->
      <div class="form-group">
        <label class="form-label">Código <span style="color:#EF4444">*</span></label>
        <input id="pf-code" class="form-input font-mono" 
          value="${esc(row?.code || (productCfg.auto_code ? '[AUTO-GENERADO]' : ''))}" 
          placeholder="P-001" 
          style="text-transform:uppercase" 
          oninput="this.value=this.value.toUpperCase()"
          ${(!row && productCfg.auto_code) ? 'disabled style="background:#F3F4F6;color:#9CA3AF"' : ''}
        >
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Nombre <span style="color:#EF4444">*</span></label>
        <input id="pf-name" class="form-input" value="${esc(row?.name || '')}" placeholder="Nombre del producto o servicio">
      </div>

      <!-- Fila 2: Tipo, Unidad, Presentación -->
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="pf-type" class="form-input">
          ${PRODUCT_TYPES.map(t => `<option value="${t.value}" ${row?.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Unidad de medida <span style="color:#EF4444">*</span></label>
        <select id="pf-unit" class="form-input">
          ${PRODUCT_UNITS.map(u => `<option value="${u.code}" ${row?.unit === u.code ? 'selected' : ''}>${u.code} — ${u.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Presentacion</label>
        <input id="pf-presentacion" class="form-input" value="${esc(row?.presentacion || '')}" placeholder="Caja x 12, Bolsa 1Kg, etc.">
      </div>

      <!-- Fila 2B: Categoría, Línea, Gestión -->
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

      <!-- Fila 3: IVA, Costo estimado -->
      <div class="form-group">
        <label class="form-label">Tarifa IVA <span style="color:#EF4444">*</span></label>
        <select id="pf-iva" class="form-input">
          ${IVA_RATES.map(r => `<option value="${r.value}" ${defaultIvaRate === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Costo estimado / Venta <span style="color:#EF4444">*</span></label>
        <input id="pf-cost-price" type="number" min="0" step="0.01" class="form-input text-right font-semibold" value="${row?.cost_price ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group"></div>

      <!-- Fila 4: Cálculo Opcional de Precio Venta 1 desde Costo -->
      <div class="form-group md:col-span-3 border p-3.5 rounded-xl bg-slate-50/80" style="border-color:#E2E8F0">
        <div class="flex items-center justify-between gap-3 mb-1">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="pf-auto-calc-price" ${row?.auto_calc_price ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer">
            <label for="pf-auto-calc-price" class="form-label mb-0 cursor-pointer font-bold text-gray-800 text-xs">
              <i class="fas fa-calculator mr-1 text-blue-600"></i> APLICAR FACTOR / MARGEN % PARA CALCULAR PRECIO 1 AUTOMÁTICAMENTE (OPCIONAL)
            </label>
          </div>
          <span id="pf-calc-preview-badge" class="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            Sin cálculo automático
          </span>
        </div>

        <div id="pf-calc-container" class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3" style="${row?.auto_calc_price ? '' : 'display:none;'}">
          <div class="form-group mb-0">
            <label class="form-label text-xs">FACTOR O % MARGEN</label>
            <div class="relative">
              <input id="pf-margin-factor" type="number" min="0" step="0.01" class="form-input text-xs text-right pr-7 font-bold" value="${row?.margin_factor ?? ''}" placeholder="Ej: 30">
              <span id="pf-margin-unit-label" class="absolute right-2.5 top-2 text-xs font-semibold text-gray-400">%</span>
            </div>
          </div>

          <div class="form-group mb-0">
            <label class="form-label text-xs">TIPO DE MARGEN</label>
            <select id="pf-margin-type" class="form-input text-xs font-medium">
              <option value="MARKUP_COST" ${(row?.margin_type === 'MARKUP_COST' || !row?.margin_type) ? 'selected' : ''}>Margen % sobre Costo (Markup)</option>
              <option value="MARGIN_SALE" ${row?.margin_type === 'MARGIN_SALE' ? 'selected' : ''}>Margen % sobre Venta (Utilidad)</option>
              <option value="FACTOR" ${row?.margin_type === 'FACTOR' ? 'selected' : ''}>Factor Multiplicador Directo (x N)</option>
            </select>
          </div>

          <div class="form-group mb-0">
            <label class="form-label text-xs">REGLA DE REDONDEO COMERCIAL</label>
            <select id="pf-rounding-type" class="form-input text-xs font-medium">
              <option value="NEAREST_100" ${(row?.rounding_type === 'NEAREST_100' || !row?.rounding_type) ? 'selected' : ''}>A la centena más cercana ($100)</option>
              <option value="NEAREST_1000" ${row?.rounding_type === 'NEAREST_1000' ? 'selected' : ''}>Al millar más cercano ($1,000)</option>
              <option value="CEIL_100" ${row?.rounding_type === 'CEIL_100' ? 'selected' : ''}>Techo centena ($100 arriba)</option>
              <option value="CEIL_1000" ${row?.rounding_type === 'CEIL_1000' ? 'selected' : ''}>Techo millar ($1,000 arriba)</option>
              <option value="NEAREST_10" ${row?.rounding_type === 'NEAREST_10' ? 'selected' : ''}>A la decena más cercana ($10)</option>
              <option value="NONE" ${row?.rounding_type === 'NONE' ? 'selected' : ''}>Sin redondeo (Decimal exacto)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Fila 5: Precios base de venta 1, 2 y 3 -->
      <div class="form-group">
        <label class="form-label">Precio base de venta (Venta 1) <span style="color:#EF4444">*</span></label>
        <input id="pf-base-price" type="number" min="0" step="0.01" class="form-input text-right font-bold text-blue-700" value="${row?.base_price ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Precio venta 2</label>
        <input id="pf-sale-price-2" type="number" min="0" step="0.01" class="form-input text-right" value="${row?.precio_venta_2 ?? ''}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Precio venta 3</label>
        <input id="pf-sale-price-3" type="number" min="0" step="0.01" class="form-input text-right" value="${row?.precio_venta_3 ?? ''}" placeholder="0.00">
      </div>

      <!-- Fila 6: Activo, Stock Min, Stock Max -->
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
        <div class="flex items-center justify-between border-b pb-1 mb-2" style="border-color:#F0F0F0">
          <p class="form-label mb-0" style="border:none;padding:0">Cuentas contables asociadas</p>
          ${!row ? '<span class="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200"><i class="fas fa-wand-magic-sparkles mr-1 text-blue-600"></i>Preconfiguradas automáticamente según Facturación</span>' : ''}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de ingresos</label>
        <input type="hidden" id="pf-income-acct" value="${esc(row?.income_account_id || defaultIncomeAccountId || '')}">
        <div class="relative">
          <input id="pf-income-acct-search" class="form-input" autocomplete="off" placeholder="Buscar cuenta 41...">
          <div id="pf-income-acct-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de costo / gasto</label>
        <input type="hidden" id="pf-cost-acct" value="${esc(row?.cost_account_id || defaultCostAccountId || '')}">
        <div class="relative">
          <input id="pf-cost-acct-search" class="form-input" autocomplete="off" placeholder="Buscar cuenta 61...">
          <div id="pf-cost-acct-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de inventario <small style="color:#9CA3AF">(solo bienes)</small></label>
        <input type="hidden" id="pf-inv-acct" value="${esc(row?.inventory_account_id || defaultInventoryAccountId || '')}">
        <div class="relative">
          <input id="pf-inv-acct-search" class="form-input" autocomplete="off" placeholder="Buscar cuenta 14...">
          <div id="pf-inv-acct-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
        </div>
      </div>

      <!-- Consignment Config -->
      <div class="form-group md:col-span-3 border-t pt-3 mt-2" id="pf-consignment-container" style="border-color:#F0F0F0; display:none;">
        <p class="form-label mb-2" style="font-weight:700;color:#7C3AED"><i class="fas fa-handshake mr-2 text-violet-600"></i>Esquema de Consignación (Proveedores)</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-violet-50/10 p-3 rounded-xl border border-violet-100/50">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="pf-is-consigned" ${row?.is_consigned ? 'checked' : ''} class="rounded text-violet-600 focus:ring-violet-500">
            <label for="pf-is-consigned" class="form-label mb-0 cursor-pointer font-semibold text-gray-700 text-xs">¿Es producto en consignación?</label>
          </div>
          <div class="form-group mb-0" id="pf-consignment-supplier-group" style="display:none;">
            <label class="form-label text-xs">Proveedor Consignatario</label>
            <select id="pf-consignment-supplier" class="form-input text-xs">
              <option value="">— Seleccionar Proveedor —</option>
              ${suppliers.map(s => `<option value="${esc(s.id)}" ${row?.consignment_supplier_id === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group mb-0" id="pf-consignment-cost-group" style="display:none;">
            <label class="form-label text-xs">Costo Pactado de Consignación</label>
            <input type="number" id="pf-consignment-cost" value="${row?.consignment_cost || 0}" step="any" min="0" class="form-input text-xs text-right">
          </div>
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

  // ── Listener de Tipo de Producto (Servicio vs Bien -> Cuenta Inventarios) ──
  const pfTypeSelect = document.getElementById('pf-type') as HTMLSelectElement;
  const pfInvAcctHidden = document.getElementById('pf-inv-acct') as HTMLInputElement;
  const pfInvAcctSearch = document.getElementById('pf-inv-acct-search') as HTMLInputElement;

  const updateInventoryAccountState = () => {
    const isService = pfTypeSelect?.value === 'SERVICIO';
    if (isService) {
      if (pfInvAcctHidden) pfInvAcctHidden.value = '';
      if (pfInvAcctSearch) {
        pfInvAcctSearch.value = '';
        pfInvAcctSearch.disabled = true;
        pfInvAcctSearch.placeholder = 'No aplica para servicios';
      }
    } else {
      if (pfInvAcctSearch) {
        pfInvAcctSearch.disabled = false;
        pfInvAcctSearch.placeholder = 'Buscar cuenta 14...';
      }
      if (!row && !pfInvAcctHidden?.value && defaultInventoryAccountId) {
        if (pfInvAcctHidden) pfInvAcctHidden.value = defaultInventoryAccountId;
        const acc = accountMap.get(defaultInventoryAccountId);
        if (acc && pfInvAcctSearch) pfInvAcctSearch.value = `${acc.code} - ${acc.name}`;
      }
    }
  };

  pfTypeSelect?.addEventListener('change', updateInventoryAccountState);
  updateInventoryAccountState();


  // ── Listener de Cálculo Automático de Precio 1 desde Costo ──────────
  const pfAutoCalcEl = document.getElementById('pf-auto-calc-price') as HTMLInputElement;
  const pfCalcContainer = document.getElementById('pf-calc-container');
  const pfCostPriceInput = document.getElementById('pf-cost-price') as HTMLInputElement;
  const pfBasePriceInput = document.getElementById('pf-base-price') as HTMLInputElement;
  const pfMarginFactorInput = document.getElementById('pf-margin-factor') as HTMLInputElement;
  const pfMarginTypeSelect = document.getElementById('pf-margin-type') as HTMLSelectElement;
  const pfRoundingTypeSelect = document.getElementById('pf-rounding-type') as HTMLSelectElement;
  const pfCalcBadge = document.getElementById('pf-calc-preview-badge');
  const pfMarginUnitLabel = document.getElementById('pf-margin-unit-label');

  const updateAutoCalcPrice = () => {
    const isAuto = pfAutoCalcEl?.checked;
    if (pfCalcContainer) pfCalcContainer.style.display = isAuto ? '' : 'none';

    if (pfMarginUnitLabel && pfMarginTypeSelect) {
      pfMarginUnitLabel.textContent = pfMarginTypeSelect.value === 'FACTOR' ? 'x' : '%';
    }

    if (!isAuto) {
      if (pfCalcBadge) {
        pfCalcBadge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 border border-gray-200';
        pfCalcBadge.textContent = 'Sin cálculo automático';
      }
      return;
    }

    const cost = parseFloat(pfCostPriceInput?.value || '0') || 0;
    const factor = parseFloat(pfMarginFactorInput?.value || '0') || 0;
    const marginType = pfMarginTypeSelect?.value || 'MARKUP_COST';
    const roundingType = pfRoundingTypeSelect?.value || 'NEAREST_100';

    if (cost <= 0 || factor <= 0) {
      if (pfCalcBadge) {
        pfCalcBadge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200';
        pfCalcBadge.textContent = 'Ingresa Costo y Factor > 0 para calcular';
      }
      return;
    }

    const calcResult = calculateSalePriceFromCost(cost, factor, marginType, roundingType);
    if (pfBasePriceInput && calcResult.price > 0) {
      pfBasePriceInput.value = String(calcResult.price);
    }

    if (pfCalcBadge) {
      const typeStr = marginType === 'MARGIN_SALE' ? 's/Venta' : marginType === 'FACTOR' ? 'Mult.' : 'Markup';
      pfCalcBadge.className = 'text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200';
      pfCalcBadge.innerHTML = `<i class="fas fa-[#00A3FF] fa-check-circle mr-1"></i>Precio 1: ${(window as any).fmt(calcResult.price)} <span class="opacity-80 font-normal ml-1">(Ganancia: ${(window as any).fmt(calcResult.profit)} · ${calcResult.marginOnSalePercent.toFixed(1)}% ${typeStr})</span>`;
    }
  };

  pfAutoCalcEl?.addEventListener('change', updateAutoCalcPrice);
  pfCostPriceInput?.addEventListener('input', updateAutoCalcPrice);
  pfMarginFactorInput?.addEventListener('input', updateAutoCalcPrice);
  pfMarginTypeSelect?.addEventListener('change', updateAutoCalcPrice);
  pfRoundingTypeSelect?.addEventListener('change', updateAutoCalcPrice);

  updateAutoCalcPrice();


  if (legacyInvalidFields.length) {
    const unique = [...new Set(legacyInvalidFields)];
    showToast(`Se limpiaron cuentas heredadas no válidas (nivel distinto de 5): ${unique.join(', ')}.`, 'warning');
  }

  const syncInventoryAccountByType = () => {
    const typeSel = document.getElementById('pf-type') as HTMLSelectElement;
    const invInput = document.getElementById('pf-inv-acct-search') as HTMLInputElement;
    const invHidden = document.getElementById('pf-inv-acct') as HTMLInputElement;
    const consignmentContainer = document.getElementById('pf-consignment-container') as HTMLDivElement;
    if (!typeSel || !invInput || !invHidden) return;

    const isBien = typeSel.value === 'BIEN';
    invInput.disabled = !isBien;
    invInput.placeholder = isBien ? 'Buscar cuenta 14...' : 'Solo aplica para BIEN';
    invInput.style.backgroundColor = isBien ? '' : '#F3F4F6';
    if (!isBien) {
      invHidden.value = '';
      invInput.value = '';
    }
    if (consignmentContainer) {
      consignmentContainer.style.display = isBien ? 'block' : 'none';
    }
  };

  const syncConsignmentFields = () => {
    const isConsignedChk = document.getElementById('pf-is-consigned') as HTMLInputElement;
    const supplierGroup = document.getElementById('pf-consignment-supplier-group') as HTMLDivElement;
    const costGroup = document.getElementById('pf-consignment-cost-group') as HTMLDivElement;
    if (!isConsignedChk || !supplierGroup || !costGroup) return;

    const isConsigned = isConsignedChk.checked;
    supplierGroup.style.display = isConsigned ? 'block' : 'none';
    costGroup.style.display = isConsigned ? 'block' : 'none';
  };

  document.getElementById('pf-type')?.addEventListener('change', syncInventoryAccountByType);
  syncInventoryAccountByType();

  document.getElementById('pf-is-consigned')?.addEventListener('change', syncConsignmentFields);
  syncConsignmentFields();

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
      let code = '';
      const name = getInputVal('pf-name').trim();
      if (!name) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
        return showToast('El nombre es obligatorio', 'warning');
      }

      if (!row?.id && productCfg.auto_code) {
        // Generar código automático
        const rawCfg = await API.getSetting('product_config_v1');
        let cfg = { auto_code: true, prefix: 'P-', consecutive: 1, digits: 4 };
        if (rawCfg) {
          try { cfg = JSON.parse(rawCfg); } catch (_) {}
        }
        
        let dupFound = true;
        let nextConsecutive = Number(cfg.consecutive || 1);
        const prefix = String(cfg.prefix || '');
        const digits = Number(cfg.digits || 4);

        while (dupFound) {
          code = prefix + String(nextConsecutive).padStart(digits, '0');
          const dup = await pb.list('products', { filter: `code="${pb.escapeFilterValue(code)}"`, perPage: 1 });
          if (dup.items.length === 0) {
            dupFound = false;
          } else {
            nextConsecutive++;
          }
        }
        cfg.consecutive = nextConsecutive + 1;
        await API.setSetting('product_config_v1', JSON.stringify(cfg));
      } else {
        code = getInputVal('pf-code').trim().toUpperCase();
        if (!code) {
          if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
          return showToast('El código es obligatorio', 'warning');
        }

        // Verificar código duplicado en creación o edición
        const safeCode = pb.escapeFilterValue(code);
        const filterStr = row?.id 
          ? `code="${safeCode}" && id!="${row.id}"`
          : `code="${safeCode}"`;
        const dup = await pb.list('products', { filter: filterStr, perPage: 1 });
        if (dup.items.length) {
          if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
          return showToast(`Ya existe un producto con el código ${code}`, 'warning');
        }
      }

      const isCombo = getCheckVal('pf-is-combo');
      const incomeAccountId = (document.getElementById('pf-income-acct') as HTMLInputElement)?.value || '';
      const costAccountId = (document.getElementById('pf-cost-acct') as HTMLInputElement)?.value || '';
      const inventoryAccountId = (document.getElementById('pf-inv-acct') as HTMLInputElement)?.value || '';

      if (!validateLevel5Account(incomeAccountId, 'Cuenta de ingresos')) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
        return;
      }
      if (!validateLevel5Account(costAccountId, 'Cuenta de costo / gasto')) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
        return;
      }
      if (!validateLevel5Account(inventoryAccountId, 'Cuenta de inventario')) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
        return;
      }

      // Validación de cubicaje: o se diligencian las 3 dimensiones o ninguna.
      const dimsRaw = [specialConditions.largo_cm, specialConditions.ancho_cm, specialConditions.alto_cm];
      const dimsFilledCount = dimsRaw.filter(v => v !== null && v !== undefined && Number(v) > 0).length;
      const hasNegative = dimsRaw.some(v => v !== null && v !== undefined && Number(v) < 0);

      if (hasNegative) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
        return showToast('Largo, Ancho y Alto no pueden ser negativos.', 'warning');
      }
      if (dimsFilledCount > 0 && dimsFilledCount < 3) {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
        return showToast('Para cubicaje debes diligenciar Largo, Ancho y Alto completos; o dejar los tres vacíos.', 'warning');
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
      
      formData.append('auto_calc_price', String((document.getElementById('pf-auto-calc-price') as HTMLInputElement)?.checked || false));
      formData.append('margin_factor', String(parseFloat(getInputVal('pf-margin-factor') || '0') || 0));
      formData.append('margin_type', getSelectVal('pf-margin-type') || 'MARKUP_COST');
      formData.append('rounding_type', getSelectVal('pf-rounding-type') || 'NEAREST_100');

      
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
      formData.append('is_consigned', String((document.getElementById('pf-is-consigned') as HTMLInputElement)?.checked || false));
      formData.append('consignment_supplier_id', (document.getElementById('pf-consignment-supplier') as HTMLInputElement)?.value || '');
      formData.append('consignment_cost', String(parseFloat((document.getElementById('pf-consignment-cost') as HTMLInputElement)?.value || '0') || 0));

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
