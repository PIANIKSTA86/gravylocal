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
  if (sc.peso !== null) items.push(`Peso: ${fmtN(sc.peso)}`);
  if (sc.cajas_en_pallet !== null) items.push(`Cajas/Pallet: ${fmtN(sc.cajas_en_pallet)}`);
  if (sc.und_empaque !== null) items.push(`UndEmpaque: ${fmtN(sc.und_empaque)}`);
  if (sc.peso_x_und_empaque !== null) items.push(`Peso x UndEmpaque: ${fmtN(sc.peso_x_und_empaque)}`);
  return items.length ? items.join(' | ') : 'Sin condiciones especiales registradas';
}

function openSpecialConditionsModal(current, onApply) {
  const overlayId = 'special-conditions-overlay';
  const prev = document.getElementById(overlayId);
  if (prev) prev.remove();

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'modal-overlay show';
  overlay.style.zIndex = '200';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:640px">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-base font-semibold" style="color:#0D2137">Condiciones especiales</h4>
        <button class="btn btn-outline btn-sm" id="sc-close-btn"><i class="fas fa-xmark"></i></button>
      </div>
      <p class="text-sm mb-4" style="color:#6B7280">Campos opcionales para importacion y logistica.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group">
          <label class="form-label">Peso</label>
          <input id="sc-peso" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.peso ?? ''}" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Caja en Pallet</label>
          <input id="sc-cajas-en-pallet" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.cajas_en_pallet ?? ''}" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">UndEmpaque</label>
          <input id="sc-und-empaque" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.und_empaque ?? ''}" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Peso x UndEmpaque</label>
          <input id="sc-peso-x-und-empaque" type="number" min="0" step="0.0001" class="form-input text-right" value="${current.peso_x_und_empaque ?? ''}" placeholder="0">
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-5">
        <button class="btn btn-outline" id="sc-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="sc-apply-btn"><i class="fas fa-check"></i> Aplicar</button>
      </div>
    </div>`;

  const close = () => overlay.remove();
  document.body.appendChild(overlay);

  overlay.querySelector('#sc-close-btn')?.addEventListener('click', close);
  overlay.querySelector('#sc-cancel-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  overlay.querySelector('#sc-apply-btn')?.addEventListener('click', () => {
    onApply({
      peso: toNullableNumber(getInputVal('sc-peso')),
      cajas_en_pallet: toNullableNumber(getInputVal('sc-cajas-en-pallet')),
      und_empaque: toNullableNumber(getInputVal('sc-und-empaque')),
      peso_x_und_empaque: toNullableNumber(getInputVal('sc-peso-x-und-empaque')),
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
    if (!items.length) return `<p class="text-xs italic py-2" style="color:#9CA3AF">Sin elementos. Agrega el primero.</p>`;
    return items.map((item, i) => `
      <div class="flex items-center justify-between gap-2 py-1 border-b" style="border-color:#F5F5F5">
        <span class="text-sm">${esc(item)}</span>
        <button type="button" class="btn btn-danger btn-sm cm-del" data-idx="${i}" data-ltype="${ltype}"><i class="fas fa-times"></i></button>
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
          <p class="form-label mb-2">Categorías de producto</p>
          <div id="cm-cat-list" class="min-h-12 mb-3">${buildList(draft.categories, 'categories')}</div>
          <div class="flex gap-2">
            <input id="cm-new-cat" class="form-input flex-1" placeholder="Nueva categoría..." maxlength="80">
            <button type="button" class="btn btn-outline btn-sm" id="cm-add-cat-btn"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <div>
          <p class="form-label mb-2">Líneas de producto</p>
          <div id="cm-line-list" class="min-h-12 mb-3">${buildList(draft.lines, 'lines')}</div>
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
    bindDel();
  }
  function bindDel() {
    overlay.querySelectorAll('.cm-del').forEach(btn => {
      btn.addEventListener('click', () => {
        draft[btn.dataset.ltype].splice(Number(btn.dataset.idx), 1);
        repaint();
      });
    });
  }
  bindDel();

  overlay.querySelector('#cm-close-btn')?.addEventListener('click', close);
  overlay.querySelector('#cm-cancel-btn')?.addEventListener('click', close);
  overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });

  const addCat = () => {
    const inp = overlay.querySelector('#cm-new-cat');
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
    const inp = overlay.querySelector('#cm-new-line');
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
    const btn = overlay.querySelector('#cm-save-btn');
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

    openModal(
      `Producto — ${esc(p.code)}`,
      `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
          <span class="form-label">Condiciones especiales</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div><p class="text-xs text-gray-500 mb-1">Peso</p><p class="font-mono text-xs">${p.peso != null ? esc(String(p.peso)) : '—'}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Caja en Pallet</p><p class="font-mono text-xs">${p.cajas_en_pallet != null ? esc(String(p.cajas_en_pallet)) : '—'}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">UndEmpaque</p><p class="font-mono text-xs">${p.und_empaque != null ? esc(String(p.und_empaque)) : '—'}</p></div>
            <div><p class="text-xs text-gray-500 mb-1">Peso x UndEmpaque</p><p class="font-mono text-xs">${p.peso_x_und_empaque != null ? esc(String(p.peso_x_und_empaque)) : '—'}</p></div>
          </div>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      false
    );
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Formulario crear/editar ───────────────────────────────────────────────────
async function openProductForm(row = null, accounts = null, catalog = {}) {
  if (!accounts) {
    accounts = await API.getAccounts(false).catch(() => []);
  }

  // Opciones de cuentas agrupadas por clase
  const acctOptions = (selectedId = '') => {
    const opts = accounts
      .filter(a => a.active && Number(a.level) >= 3)
      .sort((a, b) => a.code.localeCompare(b.code))
      .map(a => `<option value="${esc(a.id)}" ${a.id === selectedId ? 'selected' : ''}>${esc(a.code)} — ${esc(a.name)}</option>`)
      .join('');
    return `<option value="">— Sin asignar —</option>${opts}`;
  };

  const specialConditions = {
    peso: row?.peso ?? null,
    cajas_en_pallet: row?.cajas_en_pallet ?? null,
    und_empaque: row?.und_empaque ?? null,
    peso_x_und_empaque: row?.peso_x_und_empaque ?? null,
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
        <input id="pf-categoria" class="form-input" list="dl-categorias" value="${esc(row?.categoria || '')}" placeholder="Aseo, Alimentos, Repuestos...">
        <datalist id="dl-categorias">${(catalog.categories||[]).map(c=>`<option value="${esc(c)}">`).join('')}</datalist>
      </div>
      <div class="form-group">
        <label class="form-label">Línea</label>
        <input id="pf-linea" class="form-input" list="dl-lineas" value="${esc(row?.linea || '')}" placeholder="Hogar, Industrial, Premium...">
        <datalist id="dl-lineas">${(catalog.lines||[]).map(l=>`<option value="${esc(l)}">`).join('')}</datalist>
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
        <select id="pf-income-acct" class="form-input">${acctOptions(row?.income_account_id)}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de costo / gasto</label>
        <select id="pf-cost-acct" class="form-input">${acctOptions(row?.cost_account_id)}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Cuenta de inventario <small style="color:#9CA3AF">(solo bienes)</small></label>
        <select id="pf-inv-acct" class="form-input">${acctOptions(row?.inventory_account_id)}</select>
      </div>

      <!-- Fila 6: descripción -->
      <div class="form-group md:col-span-3">
        <label class="form-label">Descripción</label>
        <textarea id="pf-desc" class="form-input" rows="2" placeholder="Descripción opcional para documentos comerciales">${esc(row?.description || '')}</textarea>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-product"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    true
  );

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

      const payload = {
        code,
        name,
        description:          getInputVal('pf-desc').trim(),
        type:                 getSelectVal('pf-type'),
        unit:                 getSelectVal('pf-unit'),
        presentacion:         getInputVal('pf-presentacion').trim(),
        categoria:            getInputVal('pf-categoria').trim(),
        linea:                getInputVal('pf-linea').trim(),
        iva_rate:             Number(getSelectVal('pf-iva') || 0),
        base_price:           parseFloat(getInputVal('pf-base-price') || '0') || 0,
        precio_venta_2:       toNullableNumber(getInputVal('pf-sale-price-2')),
        precio_venta_3:       toNullableNumber(getInputVal('pf-sale-price-3')),
        cost_price:           parseFloat(getInputVal('pf-cost-price') || '0') || 0,
        active:               getSelectVal('pf-active') === 'true',
        unspsc_code:          getInputVal('pf-unspsc').trim(),
        ean_code:             getInputVal('pf-ean').trim(),
        peso:                 specialConditions.peso,
        cajas_en_pallet:      specialConditions.cajas_en_pallet,
        und_empaque:          specialConditions.und_empaque,
        peso_x_und_empaque:   specialConditions.peso_x_und_empaque,
        income_account_id:    getSelectVal('pf-income-acct')    || null,
        cost_account_id:      getSelectVal('pf-cost-acct')      || null,
        inventory_account_id: getSelectVal('pf-inv-acct')       || null,
      };

      if (row?.id) {
        await pb.update('products', row.id, payload);
        await API.logAudit('UPDATE', 'Producto', row.id, `${payload.code} — ${payload.name}`);
        showToast('Producto actualizado', 'success');
      } else {
        const created = await pb.create('products', payload);
        await API.logAudit('CREATE', 'Producto', created.id, `${payload.code} — ${payload.name}`);
        showToast('Producto creado', 'success');
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

  $('#btn-catalog-form')?.addEventListener('click', () => {
    openCatalogManagerModal(catalog, (updated) => {
      Object.assign(catalog, updated);
      const dlCat  = document.getElementById('dl-categorias');
      const dlLine = document.getElementById('dl-lineas');
      if (dlCat)  dlCat.innerHTML  = catalog.categories.map(c => `<option value="${esc(c)}">`).join('');
      if (dlLine) dlLine.innerHTML = catalog.lines.map(l => `<option value="${esc(l)}">`).join('');
    });
  });
}

// ── Editar ────────────────────────────────────────────────────────────────────
async function editProduct(id) {
  try {
    const [row, accounts, catalog] = await Promise.all([
      pb.get('products', id),
      API.getAccounts(false),
      loadProductCatalog(),
    ]);
    openProductForm(row, accounts, catalog);
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
