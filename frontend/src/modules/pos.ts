// --- Configuración POS ---
const POS_CONFIG_KEY = 'pos_settings_v1';
function defaultPOSConfig() {
  return {
    operational: {
      enable_discounts: true,
      enable_freight: false,
      enable_withholdings: true,
      withholdings: {
        reterenta: true,
        reteiva: false,
        reteica: true,
      },
      default_due_days: 0,
      allow_negative_stock: false,
      require_cash_count: true,
    },
    accounting: {
      accounts: {
        sales_code: '',
        cash_code: '',
        iva_by_rate: {
          '0': '',
          '5': '',
          '19': '',
        },
        discount_code: '',
        freight_code: '',
        payment_accounts: {
          efectivo_code: '',
          transferencia_code: '',
          credito_code: '',
        },
      },
      withholding_rules: [],
    },
    special: {
      allow_price_edit: false,
      require_customer: true,
      price_source: 'base_price',
      catalog_view_mode: 'grid',
      prices_include_iva: false,  // true = precios con IVA incluido (precio tax-in)
      default_customer_id: '',
    }
  };
}

/**
 * Calcula base imponible e IVA para un ítem del carrito.
 * - prices_include_iva = false (defecto): precio es la BASE. iva = base * rate/100
 * - prices_include_iva = true:  precio es TOTAL con IVA. base = precio/(1+rate/100), iva = precio - base
 */
function calcItemTax(salesPrice: number, ivaRate: number, cfg: any) {
  const includesIva = !!cfg?.special?.prices_include_iva;
  const rate = Number(ivaRate || 0);
  if (includesIva && rate > 0) {
    const divisor = 1 + rate / 100;
    const base = salesPrice / divisor;
    const ivaAmount = salesPrice - base;
    return { base: Math.round(base * 100) / 100, ivaAmount: Math.round(ivaAmount * 100) / 100, total: salesPrice };
  }
  // precio = base, IVA adicional
  const ivaAmount = salesPrice * rate / 100;
  return { base: salesPrice, ivaAmount: Math.round(ivaAmount * 100) / 100, total: salesPrice + ivaAmount };
}

function playPOSBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Tono de 880Hz (La5)
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (_) {}
}

async function getPOSConfig() {
  try {
    const raw = await (window as any).API.getSetting(POS_CONFIG_KEY);
    if (!raw) return defaultPOSConfig();
    return { ...defaultPOSConfig(), ...JSON.parse(raw) };
  } catch {
    return defaultPOSConfig();
  }
}

async function savePOSConfig(cfg: any) {
  await (window as any).API.setSetting(POS_CONFIG_KEY, JSON.stringify(cfg));
  await (window as any).API.logAudit('CONFIG', 'POSConfig', null, 'Configuración de POS actualizada');
}

async function openPOSSettingsModal(onSaved: any = null) {
  const [cfg, accounts, thirds] = await Promise.all([
    getPOSConfig(),
    (window as any).API.getAccounts(true),
    (window as any).API.getTerceros({ type: 'CLIENTE' }),
  ]);
  const accountOptions = (selectedCode = '') => {
    const rows = accounts.filter((a: any) => a.active && Number(a.level) >= 3).sort((a: any, b: any) => a.code.localeCompare(b.code));
    return `<option value="">— Sin definir —</option>${rows.map((a: any) => `<option value="${(window as any).esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${(window as any).esc(a.code)} — ${(window as any).esc(a.name)}</option>`).join('')}`;
  };

  const initialIvaRates = Array.from(new Set([
    '0', '5', '19',
    ...Object.keys(cfg.accounting?.accounts?.iva_by_rate || {}),
  ])).sort((a, b) => Number(a) - Number(b));

  const formHtml = `
    <div class="space-y-5" style="color:#374151">
      <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-sliders mr-2"></i>Parámetros operativos</h4>
        <p class="text-xs mb-3" style="color:#6B7280">Opciones generales del punto de venta.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-discount" type="checkbox" ${cfg.operational.enable_discounts ? 'checked' : ''}>Habilitar descuentos</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-freight" type="checkbox" ${cfg.operational.enable_freight ? 'checked' : ''}>Habilitar fletes</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-withholding" type="checkbox" ${cfg.operational.enable_withholdings ? 'checked' : ''}>Habilitar retenciones</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-neg-stock" type="checkbox" ${cfg.operational.allow_negative_stock ? 'checked' : ''}>Permitir stock negativo</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-cash-count" type="checkbox" ${cfg.operational.require_cash_count ? 'checked' : ''}>Exigir arqueo de caja</label>
          <div class="form-group mb-0">
            <label class="form-label">Plazo por defecto (días)</label>
            <input id="pos-cfg-default-due" class="form-input" type="number" min="0" step="1" value="${(window as any).esc(String(cfg.operational.default_due_days || 0))}">
          </div>
        </div>
      </div>
      <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-book mr-2"></i>Parámetros contables</h4>
        <p class="text-xs mb-3" style="color:#6B7280">Cuentas usadas en la contabilización automática de ventas POS.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Ventas Fallback (Cr)</label>
            <select id="pos-cfg-sales" class="form-input">${accountOptions(cfg.accounting.accounts.sales_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Descuentos</label>
            <select id="pos-cfg-discount-acct" class="form-input">${accountOptions(cfg.accounting.accounts.discount_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Fletes</label>
            <select id="pos-cfg-freight-acct" class="form-input">${accountOptions(cfg.accounting.accounts.freight_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Efectivo Cuenta Caja (Dr)</label>
            <select id="pos-cfg-cash-acct" class="form-input">${accountOptions(cfg.accounting?.accounts?.payment_accounts?.efectivo_code || cfg.accounting.accounts.cash_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Transferencia Cuenta Banco (Dr)</label>
            <select id="pos-cfg-transfer-acct" class="form-input">${accountOptions(cfg.accounting?.accounts?.payment_accounts?.transferencia_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Crédito Cuenta CxC (Dr)</label>
            <select id="pos-cfg-credit-acct" class="form-input">${accountOptions(cfg.accounting?.accounts?.payment_accounts?.credito_code)}</select>
          </div>

          <div class="mt-4 rounded-xl border p-3 col-span-2" style="border-color:#E5E7EB;background:#fff">
            <div class="flex items-center justify-between mb-2">
              <label class="form-label" style="margin-bottom:0">Cuentas IVA Generado por tarifa</label>
              <button type="button" class="btn btn-outline btn-sm" id="btn-pos-cfg-add-iva-rate"><i class="fas fa-plus"></i> Agregar tarifa</button>
            </div>
            <div id="pos-cfg-iva-rates-wrap" class="space-y-2"></div>
            <p class="text-xs mt-2" style="color:#6B7280">La contabilización buscará la cuenta de pasivo según el IVA % de cada línea.</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-cogs mr-2"></i>Opciones Especiales</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-price-edit" type="checkbox" ${cfg.special.allow_price_edit ? 'checked' : ''}>Permitir editar precio en venta</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-require-customer" type="checkbox" ${cfg.special.require_customer ? 'checked' : ''}>Exigir cliente en cada venta</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-prices-include-iva" type="checkbox" ${cfg.special.prices_include_iva ? 'checked' : ''}><span>Precios <strong>incluyen IVA</strong> (precio tax-in)</span></label>
          <div class="form-group mb-0">
            <label class="form-label">Cliente Predeterminado</label>
            <select id="pos-cfg-default-customer" class="form-input">
              <option value="">— Consumidor Final / Ninguno —</option>
              ${thirds.map((t: any) => `<option value="${t.id}"${cfg.special?.default_customer_id === t.id ? ' selected' : ''}>${(window as any).esc(t.name)} (${t.doc_number || t.nit})</option>`).join('')}
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Origen de Precio en POS</label>
            <select id="pos-cfg-price-source" class="form-input">
              <option value="base_price" ${cfg.special.price_source === 'base_price' ? 'selected' : ''}>Precio 1 (Base)</option>
              <option value="precio_venta_2" ${cfg.special.price_source === 'precio_venta_2' ? 'selected' : ''}>Precio 2</option>
              <option value="precio_venta_3" ${cfg.special.price_source === 'precio_venta_3' ? 'selected' : ''}>Precio 3</option>
              <option value="free" ${cfg.special.price_source === 'free' ? 'selected' : ''}>Precio Libre (Cajero Digita)</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Vista del Catálogo</label>
            <select id="pos-cfg-catalog-view" class="form-input">
              <option value="grid" ${cfg.special.catalog_view_mode === 'grid' ? 'selected' : ''}>Cuadrícula Directa</option>
              <option value="categories" ${cfg.special.catalog_view_mode === 'categories' ? 'selected' : ''}>Agrupado por Categorías</option>
              <option value="lines" ${cfg.special.catalog_view_mode === 'lines' ? 'selected' : ''}>Agrupado por Líneas</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
  const footer = `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-pos-cfg-save">Guardar Cambios</button>`;
  (window as any).openModal('Configuración POS', formHtml, footer, false);

  setTimeout(() => {
    const ivaWrap = document.getElementById('pos-cfg-iva-rates-wrap');
    const addIvaRateRow = (rate = '', accountCode = '') => {
      if (!ivaWrap) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center';
      row.innerHTML = `
        <div class="col-span-3">
          <input class="form-input pos-cfg-iva-rate" type="number" min="0" step="0.01" placeholder="Tarifa %" value="${(window as any).esc(String(rate || ''))}">
        </div>
        <div class="col-span-8">
          <select class="form-input pos-cfg-iva-acct">${accountOptions(accountCode)}</select>
        </div>
        <div class="col-span-1 text-right">
          <button type="button" class="btn btn-danger btn-sm pos-cfg-iva-del"><i class="fas fa-trash"></i></button>
        </div>`;
      row.querySelector('.pos-cfg-iva-del')?.addEventListener('click', () => row.remove());
      ivaWrap.appendChild(row);
    };

    if (initialIvaRates.length) {
      initialIvaRates.forEach((rate) => addIvaRateRow(rate, cfg.accounting.accounts.iva_by_rate?.[rate] || ''));
    } else {
      addIvaRateRow('19', '');
    }
    document.getElementById('btn-pos-cfg-add-iva-rate')?.addEventListener('click', () => addIvaRateRow('', ''));

    document.getElementById('btn-pos-cfg-save')?.addEventListener('click', async () => {
      const ivaByRate: any = {};
      const rateRows = document.querySelectorAll('#pos-cfg-iva-rates-wrap > div');
      rateRows.forEach(row => {
        const rateVal = (row.querySelector('.pos-cfg-iva-rate') as HTMLInputElement)?.value.trim();
        const acctVal = (row.querySelector('.pos-cfg-iva-acct') as HTMLSelectElement)?.value;
        if (rateVal && acctVal) {
          ivaByRate[rateVal] = acctVal;
        }
      });

      const newCfg = {
        operational: {
          enable_discounts: (document.getElementById('pos-cfg-discount') as HTMLInputElement)?.checked,
          enable_freight: (document.getElementById('pos-cfg-freight') as HTMLInputElement)?.checked,
          enable_withholdings: (document.getElementById('pos-cfg-withholding') as HTMLInputElement)?.checked,
          allow_negative_stock: (document.getElementById('pos-cfg-neg-stock') as HTMLInputElement)?.checked,
          require_cash_count: (document.getElementById('pos-cfg-cash-count') as HTMLInputElement)?.checked,
          default_due_days: Number((document.getElementById('pos-cfg-default-due') as HTMLInputElement)?.value || 0),
          withholdings: {
            reterenta: true,
            reteiva: false,
            reteica: true,
          },
        },
        accounting: {
          accounts: {
            sales_code: (document.getElementById('pos-cfg-sales') as HTMLSelectElement)?.value,
            cash_code: (document.getElementById('pos-cfg-cash-acct') as HTMLSelectElement)?.value,
            discount_code: (document.getElementById('pos-cfg-discount-acct') as HTMLSelectElement)?.value,
            freight_code: (document.getElementById('pos-cfg-freight-acct') as HTMLSelectElement)?.value,
            payment_accounts: {
              efectivo_code: (document.getElementById('pos-cfg-cash-acct') as HTMLSelectElement)?.value,
              transferencia_code: (document.getElementById('pos-cfg-transfer-acct') as HTMLSelectElement)?.value,
              credito_code: (document.getElementById('pos-cfg-credit-acct') as HTMLSelectElement)?.value,
            },
            iva_by_rate: ivaByRate,
          },
          withholding_rules: [],
        },
        special: {
          allow_price_edit: (document.getElementById('pos-cfg-price-edit') as HTMLInputElement)?.checked,
          require_customer: (document.getElementById('pos-cfg-require-customer') as HTMLInputElement)?.checked,
          prices_include_iva: (document.getElementById('pos-cfg-prices-include-iva') as HTMLInputElement)?.checked,
          price_source: (document.getElementById('pos-cfg-price-source') as HTMLSelectElement)?.value || 'base_price',
          catalog_view_mode: (document.getElementById('pos-cfg-catalog-view') as HTMLSelectElement)?.value || 'grid',
          default_customer_id: (document.getElementById('pos-cfg-default-customer') as HTMLSelectElement)?.value || '',
        }
      };
      await savePOSConfig(newCfg);
      posConfig = newCfg;
      (window as any).showToast('Configuración guardada', 'success');
      (window as any).closeModal();
      if (onSaved) onSaved();
      if (typeof (window as any).filterPosProducts === 'function') {
        (window as any).filterPosProducts();
      }
    });
  }, 100);
}
/**
 * GRAVY v2.0 — pos.ts
 * Módulo de Punto de Venta (POS) para Cajeros.
 * - Control de turnos de caja (Apertura, Arqueo de Cierre y Discrepancias)
 * - Cuadrícula táctil de catálogo con buscador rápido e indicador de stock real
 * - Carrito dinámico con cálculo inmediato de cambio (vueltas)
 * - Contabilización automática en caliente e impresión de tirilla de 80mm
 */

'use strict';

interface PosCartItem {
  id: string;
  code: string;
  name: string;
  sales_price: number;
  iva_rate: number;
  qty: number;
  type: string;
}

let activeShift: any = null;
let posProducts: any[] = [];
let posCustomers: any[] = [];
let posWarehouses: any[] = [];
let posCart: PosCartItem[] = [];
let selectedCustomerId = "";
let selectedWarehouseId = "";
let posConfig: any = null;
let activeCategoryFilter = "";
let activeLineFilter = "";
let posDiscountPct = 0;
let posFreightAmt = 0;

// Cargar estado inicial y renderizar
export async function renderPOS(container: HTMLElement) {
  // Exponer función global para el botón de configuración
  window.openPOSSettingsModal = openPOSSettingsModal;

  const userRole = (window as any).pb.currentUser?.role ?? '';
  const canSeeCfg = ['administrador', 'contador', 'superadmin'].includes(userRole);

  container.innerHTML = `
    <div class="rounded-xl border p-6 space-y-6 min-h-[600px] flex flex-col justify-between" style="border-color:#E5E7EB;background:#FCFCFD">
      ${canSeeCfg ? `
      <div class="flex justify-end mb-2">
        <button class="btn btn-outline btn-sm" title="Configuración POS" onclick="window.openPOSSettingsModal()" style="color:#7F7CFF;border-color:#7F7CFF">
          <i class="fas fa-cog mr-1"></i> Config. POS
        </button>
      </div>` : ''}
      <div id="pos-shift-container" class="flex-grow flex flex-col justify-center items-center py-12">
        <div class="text-center" style="color:#374151">
          <i class="fas fa-spinner fa-spin text-4xl mb-4" style="color:#7F7CFF"></i>
          <p class="text-sm" style="color:#6B7280">Verificando estado del turno de caja...</p>
        </div>
      </div>
    </div>
  `;

  await window.checkActiveShift();
}

window.checkActiveShift = async function() {
  const container = document.getElementById('pos-shift-container');
  if (!container) return;

  try {
    const user = (window as any).pb.currentUser;
    if (!user) {
      container.innerHTML = `
        <div class="text-center max-w-md p-6 border rounded-2xl" style="border-color:#FCA5A5;background:#FEF2F2;color:#DC2626">
          <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
          <h3 class="font-bold text-lg">Sesión no Iniciada</h3>
          <p class="text-xs mt-2" style="color:#6B7280">Por favor inicia sesión en la plataforma para poder abrir un turno de caja POS.</p>
        </div>
      `;
      return;
    }

    // Busca turno abierto
    const res = await (window as any).pb.list('pos_shifts', {
      filter: `user_id="${(window as any).pb.escapeFilterValue(user.id)}" && status="open"`,
      perPage: 1,
    });

    if (res.items.length) {
      activeShift = res.items[0];
      await window.loadPOSInterface();
    } else {
      activeShift = null;
      window.renderShiftOpeningForm();
    }
  } catch (err: any) {
    container.innerHTML = `
      <div class="text-center text-red-400 p-6">
        <i class="fas fa-triangle-exclamation text-3xl mb-2"></i>
        <p class="text-sm">Error de conexión: ${err.message}</p>
        <button class="btn btn-primary btn-sm mt-4" onclick="window.checkActiveShift()">Reintentar</button>
      </div>
    `;
  }
};

// Renderiza formulario de Apertura de Caja
window.renderShiftOpeningForm = function() {
  const container = document.getElementById('pos-shift-container');
  if (!container) return;

  container.innerHTML = `
    <div class="max-w-md w-full p-8 rounded-2xl border" style="border-color:#E5E7EB;background:#FCFCFD">
      <div class="text-center space-y-2 mb-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-500 text-3xl">
          <i class="fas fa-cash-register"></i>
        </div>
        <h3 class="text-xl font-bold" style="color:#0D2137">Apertura de Turno de Caja</h3>
        <p class="text-xs" style="color:#6B7280">Ingresa la base de efectivo inicial en cajón para abrir la jornada.</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="form-label mb-2 block">Base Inicial en Efectivo (COP) <span style="color:#EF4444">*</span></label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
            <input type="number" id="pos-initial-cash" class="form-input w-full pl-8 font-bold text-lg" min="0" step="50" value="100000" style="background:#fff;color:#0D2137">
          </div>
        </div>

        <div>
          <label class="form-label mb-2 block">Notas de Apertura</label>
          <textarea id="pos-opening-notes" class="form-input w-full" rows="2" placeholder="Ej: Billetes sencillos para cambio, turno mañana..." style="background:#fff;color:#0D2137"></textarea>
        </div>

        <button class="btn btn-primary w-full py-3 font-bold text-sm tracking-wide mt-2" onclick="window.openPOSShift()">
          <i class="fas fa-key mr-1"></i> ABRIR CAJA Y EMPEZAR
        </button>
      </div>
    </div>
  `;
};

// Abre el turno de caja
window.openPOSShift = async function() {
  const initialCash = parseFloat((document.getElementById('pos-initial-cash') as HTMLInputElement)?.value || '0');
  const notes = (document.getElementById('pos-opening-notes') as HTMLTextAreaElement)?.value.trim() || '';

  if (Number.isNaN(initialCash) || initialCash < 0) {
    (window as any).showToast('La base inicial debe ser un número igual o mayor a cero.', 'warning');
    return;
  }

  try {
    const user = (window as any).pb.currentUser;
    const shift = await (window as any).pb.create('pos_shifts', {
      user_id: user.id,
      opened_at: (window as any).nowStr(),
      cash_initial: initialCash,
      cash_sales: 0,
      cash_expected: initialCash,
      status: 'open',
      notes: notes
    });

    (window as any).showToast('Turno de caja abierto correctamente', 'success');
    activeShift = shift;
    await window.loadPOSInterface();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al abrir caja', 'error');
  }
};

// Carga la interfaz del POS (Catálogo + Carrito)
window.loadPOSInterface = async function() {
  const mainWrap = document.getElementById('pos-shift-container')?.parentElement;
  if (!mainWrap) return;

  try {
    // Cargar configuración de POS
    posConfig = await getPOSConfig();
    activeCategoryFilter = "";
    activeLineFilter = "";

    // Forzar el contenedor principal a ocupar el 100% de la altura en escritorio
    mainWrap.id = 'pos-main-container';
    mainWrap.style.minHeight = '0';
    mainWrap.style.height = '100%';
    mainWrap.className = 'rounded-xl border p-4 h-full flex flex-col justify-between';

    // Carga maestros
    const [prods, thirds, whs] = await Promise.all([
      (window as any).API.getProducts({ activeOnly: true }),
      (window as any).API.getTerceros({ type: 'CLIENTE' }),
      (window as any).API.getWarehouses(),
    ]);

    posProducts = prods;
    posCustomers = thirds;
    posWarehouses = whs;

    // Buscar "Consumidor Final" por defecto
    const defaultId = posConfig?.special?.default_customer_id;
    const consumer = defaultId 
      ? posCustomers.find(c => c.id === defaultId) 
      : posCustomers.find(c => c.doc_number === '222222222' || c.nit === '222222222' || c.name.toLowerCase().includes('consumidor'));
    selectedCustomerId = consumer ? consumer.id : (posCustomers[0]?.id || "");

    // Bodega por defecto
    selectedWarehouseId = posWarehouses[0]?.id || "";

    posCart = [];
    posDiscountPct = 0;
    posFreightAmt = 0;

    // Render principal
    mainWrap.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)] min-h-[500px] pos-grid">
        <!-- Panel Izquierdo: Catálogo y Buscador (Col 7) -->
        <div class="lg:col-span-7 flex flex-col justify-between space-y-4 h-full pos-catalog-container">
          <div class="flex items-center gap-3">
            <div class="relative flex-grow">
              <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input type="text" id="pos-search-product" class="form-input w-full pl-9 py-2.5" placeholder="Buscar por código de barra, código SKU o nombre del producto..." oninput="window.filterPosProducts()" style="background:#fff;color:#0D2137">
            </div>
            <button class="btn btn-outline py-2.5" onclick="window.renderPOSStockReload()"><i class="fas fa-rotate"></i></button>
          </div>

          <!-- Cuadrícula Catálogo -->
          <div class="flex-grow overflow-y-auto pr-1" id="pos-catalog-grid" style="max-height:calc(100vh-270px)">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <!-- Productos se cargan aquí -->
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Carrito de Compras (Col 5) -->
        <div class="lg:col-span-5 flex flex-col rounded-2xl border h-full pos-cart-container" style="border-color:#E5E7EB;background:#FCFCFD;overflow:hidden">

          <!-- Barra superior del Carrito -->
          <div class="flex justify-between items-center border-b px-5 pt-4 pb-3 flex-shrink-0" style="border-color:#E5E7EB">
            <div>
              <span class="font-bold block text-sm" style="color:#0D2137"><i class="fas fa-cart-shopping text-blue-500 mr-1"></i> Carrito de Ventas</span>
              <span class="text-xs" style="color:#6B7280">Turno de: ${(window as any).esc((window as any).pb.currentUser?.name)}</span>
            </div>
            <div class="flex items-center gap-2">
              ${['administrador','contador','superadmin'].includes((window as any).pb.currentUser?.role) ? `
              <button class="btn btn-outline btn-sm" title="Configuración POS" onclick="window.openPOSSettingsModal(window.loadPOSInterface)" style="color:#7F7CFF;border-color:#7F7CFF">
                <i class="fas fa-cog"></i>
              </button>` : ''}
              <button class="btn btn-outline btn-sm text-red-500 hover:text-red-400" onclick="window.clearPOSCart()"><i class="fas fa-trash-can"></i> Vaciar</button>
            </div>
          </div>

          <!-- Selector de Cliente y Bodega -->
          <div class="grid grid-cols-2 gap-3 px-5 pt-3 pb-2 flex-shrink-0">
            <div>
              <label class="text-[10px] uppercase font-bold block mb-1" style="color:#6B7280">Cliente</label>
              <select id="pos-cart-customer" class="form-input w-full text-xs" onchange="window.posOnCustomerChange()" style="background:#fff;color:#0D2137">
                ${posCustomers.map(c => `<option value="${c.id}"${selectedCustomerId === c.id ? ' selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="text-[10px] uppercase font-bold block mb-1" style="color:#6B7280">Bodega</label>
              <select id="pos-cart-warehouse" class="form-input w-full text-xs" onchange="window.posOnWarehouseChange()" style="background:#fff;color:#0D2137">
                ${posWarehouses.map(w => `<option value="${w.id}"${selectedWarehouseId === w.id ? ' selected' : ''}>${w.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Lista de items del carrito (scroll independiente) -->
          <div class="flex-1 overflow-y-auto px-5 py-2 space-y-3" id="pos-cart-body">
            <!-- Items del carrito -->
          </div>

          <!-- Resumen de Totales y Pago (siempre visible al fondo) -->
          <div class="border-t px-5 pt-3 pb-4 space-y-3 flex-shrink-0" style="border-color:#E5E7EB;background:#FCFCFD">
            ${(posConfig.operational.enable_discounts || posConfig.operational.enable_freight) ? `
            <div class="grid grid-cols-2 gap-3 text-xs border-b pb-2 mb-2" style="border-color:#E5E7EB">
              ${posConfig.operational.enable_discounts ? `
              <div>
                <label class="text-[10px] uppercase font-bold block mb-1" style="color:#6B7280">Descuento (%)</label>
                <input type="number" id="pos-cart-discount-input" class="form-input w-full text-xs py-1 px-2 font-bold" min="0" max="100" value="0" oninput="window.posUpdateDiscountFreight()" style="background:#fff;color:#0D2137;height:28px">
              </div>` : ''}
              ${posConfig.operational.enable_freight ? `
              <div>
                <label class="text-[10px] uppercase font-bold block mb-1" style="color:#6B7280">Flete ($)</label>
                <input type="number" id="pos-cart-freight-input" class="form-input w-full text-xs py-1 px-2 font-bold" min="0" value="0" oninput="window.posUpdateDiscountFreight()" style="background:#fff;color:#0D2137;height:28px">
              </div>` : ''}
            </div>` : ''}

            <div class="space-y-1 text-xs">
              <div class="flex justify-between" style="color:#6B7280"><span>Subtotal:</span> <span id="pos-cart-sub" class="font-bold" style="color:#374151">$ 0</span></div>
              <div class="flex justify-between" style="color:#6B7280"><span>IVA Calculado:</span> <span id="pos-cart-iva" class="font-bold" style="color:#374151">$ 0</span></div>
              ${posConfig.operational.enable_discounts ? `<div class="flex justify-between text-red-500" id="pos-cart-discount-row" style="display:none"><span>Descuento:</span> <span id="pos-cart-discount-val" class="font-bold">-$ 0</span></div>` : ''}
              ${posConfig.operational.enable_freight ? `<div class="flex justify-between text-emerald-600" id="pos-cart-freight-row" style="display:none"><span>Flete:</span> <span id="pos-cart-freight-val" class="font-bold">+$ 0</span></div>` : ''}
              <div class="flex justify-between text-base border-t pt-2 font-extrabold" style="border-color:#E5E7EB;color:#0D2137">
                <span>TOTAL A PAGAR:</span> <span id="pos-cart-total" class="text-blue-500 text-lg">$ 0</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-1">
              <button class="btn btn-outline py-3 font-semibold text-xs text-orange-500 hover:text-orange-400" onclick="window.openArqueoPOSModal()">
                <i class="fas fa-lock mr-1"></i> ARQUEO / CERRAR CAJA
              </button>
              <button class="btn btn-primary py-3 font-bold text-sm" id="btn-pos-checkout" onclick="window.openPOSPaymentModal()">
                <i class="fas fa-cash-register mr-1"></i> PAGAR Y FACTURAR
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    await window.loadPosProductsWithStock();

    // Foco automático inicial y listeners de escáner y teclado
    setTimeout(() => {
      const searchInput = document.getElementById('pos-search-product') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();

        searchInput.addEventListener('keydown', async (ev) => {
          if (ev.key === 'Enter') {
            const val = searchInput.value.trim();
            if (val === '') {
              // Enter con buscador vacío -> Ir a Cobrar
              ev.preventDefault();
              if (posCart.length > 0 && typeof (window as any).openPOSPaymentModal === 'function') {
                (window as any).openPOSPaymentModal();
              }
              return;
            }

            // Buscar coincidencia exacta por código de barra (SKU) u/o EAN
            const exactMatch = posProducts.find(p => String(p.code || '').trim() === val || String(p.ean_code || '').trim() === val);
            if (exactMatch) {
              ev.preventDefault();
              const allowNegative = posConfig?.operational?.allow_negative_stock;
              const inCart = posCart.find(item => item.id === exactMatch.id);
              const currentQty = inCart ? inCart.qty : 0;
              
              if (exactMatch.type === 'BIEN' && !allowNegative && currentQty + 1 > exactMatch.stock) {
                (window as any).showToast(`Existencias insuficientes para ${exactMatch.name} (disp. ${exactMatch.stock}).`, 'warning');
                return;
              }

              if (typeof (window as any).addToPOSCart === 'function') {
                (window as any).addToPOSCart(exactMatch.id);
              }
              playPOSBeep();

              searchInput.value = '';
              if (typeof (window as any).filterPosProducts === 'function') {
                (window as any).filterPosProducts();
              }
            }
          }
        });
      }
    }, 150);

    // Evitar que el clic en zonas muertas de la pantalla robe el foco del buscador
    const mainContainer = document.getElementById('pos-main-container') || mainWrap;
    if (mainContainer) {
      mainContainer.addEventListener('click', (ev) => {
        const target = ev.target as HTMLElement;
        const isInteractive = target.closest('input, textarea, select, button, a, [onclick], .btn, .interactive-item');
        if (!isInteractive) {
          const searchInput = document.getElementById('pos-search-product') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
      });
    }
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al iniciar POS', 'error');
  }
};

window.renderPOSStockReload = async function() {
  (window as any).showToast('Sincronizando inventario...', 'info');
  await window.loadPosProductsWithStock();
};

// Carga productos e inyecta stocks en tiempo real
window.loadPosProductsWithStock = async function() {
  try {
    const stockRows = await (window as any).API.getInventoryStock({ warehouseId: selectedWarehouseId });
    
    // Asocia cantidades a los productos
    posProducts.forEach(p => {
      if (p.type === 'SERVICIO') {
        p.stock = 9999;
      } else {
        const match = stockRows.find((s: any) => s.product_id === p.id);
        p.stock = match ? Number(match.qty_on_hand || 0) : 0;
      }
    });

    window.filterPosProducts();
  } catch (err: any) {
    (window as any).showToast('Error al actualizar existencias', 'error');
  }
};

function getProductPriceByConfig(prod: any, cfg: any) {
  const source = cfg?.special?.price_source || 'base_price';
  if (source === 'free') {
    // Si el precio es libre, sugerir base_price por defecto pero permitir editarlo.
    return Number(prod.base_price ?? 0);
  }
  const price = Number(prod[source] ?? 0);
  if (price <= 0 && source !== 'base_price') {
    return Number(prod.base_price ?? 0); // Fallback a Precio 1 si el seleccionado está en cero o no definido
  }
  return price;
}

window.setCatalogCategoryFilter = function(cat: string) {
  activeCategoryFilter = cat;
  window.filterPosProducts();
};

window.setCatalogLineFilter = function(ln: string) {
  activeLineFilter = ln;
  window.filterPosProducts();
};

window.clearCatalogFilter = function() {
  activeCategoryFilter = "";
  activeLineFilter = "";
  window.filterPosProducts();
};

window.filterPosProducts = function() {
  const query = (document.getElementById('pos-search-product') as HTMLInputElement)?.value.toLowerCase().trim() || '';
  const grid = document.getElementById('pos-catalog-grid');
  if (!grid) return;

  // Si hay una búsqueda, resetear filtros condicionales de navegación
  if (query) {
    activeCategoryFilter = "";
    activeLineFilter = "";
  }

  // 1. Mostrar categorías si está configurado y no hay filtros ni búsquedas activas
  if (posConfig?.special?.catalog_view_mode === 'categories' && !activeCategoryFilter && !query) {
    const cats = [...new Set(posProducts.map(p => p.categoria?.trim()).filter(Boolean))].sort();
    if (posProducts.some(p => !p.categoria?.trim())) {
      cats.push("Sin Categoría");
    }
    grid.innerHTML = `
      <div class="mb-3 px-1 flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500"><i class="fas fa-folder-open text-blue-500 mr-1"></i> Categorías de Producto</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        ${cats.map(cat => `
          <div class="rounded-xl border p-5 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center items-center gap-3 hover:border-blue-300" 
               style="border-color:#E5E7EB;background:#FCFCFD"
               onclick="window.setCatalogCategoryFilter('${(window as any).esc(cat)}')">
            <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-lg">
              <i class="fas fa-folder"></i>
            </div>
            <span class="font-bold text-xs text-gray-700 truncate max-w-full" title="${(window as any).esc(cat)}">${(window as any).esc(cat)}</span>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  // 2. Mostrar líneas si está configurado y no hay filtros ni búsquedas activas
  if (posConfig?.special?.catalog_view_mode === 'lines' && !activeLineFilter && !query) {
    const lns = [...new Set(posProducts.map(p => p.linea?.trim()).filter(Boolean))].sort();
    if (posProducts.some(p => !p.linea?.trim())) {
      lns.push("Sin Línea");
    }
    grid.innerHTML = `
      <div class="mb-3 px-1 flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500"><i class="fas fa-tags text-violet-500 mr-1"></i> Líneas de Producto</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        ${lns.map(ln => `
          <div class="rounded-xl border p-5 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col justify-center items-center gap-3 hover:border-violet-300" 
               style="border-color:#E5E7EB;background:#FCFCFD"
               onclick="window.setCatalogLineFilter('${(window as any).esc(ln)}')">
            <div class="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 text-lg">
              <i class="fas fa-tag"></i>
            </div>
            <span class="font-bold text-xs text-gray-700 truncate max-w-full" title="${(window as any).esc(ln)}">${(window as any).esc(ln)}</span>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  // 3. Filtrar lista de productos
  const filtered = posProducts.filter(p => {
    if (query) {
      return `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(query);
    }
    if (activeCategoryFilter) {
      if (activeCategoryFilter === "Sin Categoría") {
        return !p.categoria?.trim();
      }
      return p.categoria?.trim() === activeCategoryFilter;
    }
    if (activeLineFilter) {
      if (activeLineFilter === "Sin Línea") {
        return !p.linea?.trim();
      }
      return p.linea?.trim() === activeLineFilter;
    }
    return true;
  });

  if (!filtered.length) {
    let returnBtn = "";
    if (activeCategoryFilter || activeLineFilter) {
      returnBtn = `<button class="btn btn-outline btn-sm mt-3" onclick="window.clearCatalogFilter()"><i class="fas fa-chevron-left"></i> Volver</button>`;
    }
    grid.innerHTML = `
      <div class="text-center py-12 text-gray-500 w-full col-span-3">
        <i class="fas fa-box-open text-3xl mb-2 block"></i> No se encontraron productos/servicios en el catálogo.
        <br>${returnBtn}
      </div>
    `;
    return;
  }

  // Generar miga de pan o barra de navegación para filtros activos
  let filterBreadcrumb = "";
  if (activeCategoryFilter) {
    filterBreadcrumb = `
      <div class="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 text-xs text-blue-800 font-medium">
        <span><i class="fas fa-folder-open mr-1"></i> Categoría: <strong>${(window as any).esc(activeCategoryFilter)}</strong></span>
        <button class="btn btn-sm btn-outline py-1 px-3 text-[10px] text-blue-700 bg-white" onclick="window.clearCatalogFilter()"><i class="fas fa-chevron-left"></i> Volver</button>
      </div>
    `;
  } else if (activeLineFilter) {
    filterBreadcrumb = `
      <div class="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl p-3 mb-3 text-xs text-violet-800 font-medium">
        <span><i class="fas fa-tags mr-1"></i> Línea: <strong>${(window as any).esc(activeLineFilter)}</strong></span>
        <button class="btn btn-sm btn-outline py-1 px-3 text-[10px] text-violet-700 bg-white" onclick="window.clearCatalogFilter()"><i class="fas fa-chevron-left"></i> Volver</button>
      </div>
    `;
  }

  const maxToShow = 36;
  const itemsToShow = filtered.slice(0, maxToShow);
  const showMoreAlert = filtered.length > maxToShow 
    ? `<div class="w-full text-center py-3 px-4 text-xs bg-blue-50/80 text-blue-700 rounded-xl border border-blue-100 font-medium mt-4 col-span-2 sm:col-span-3">
         <i class="fas fa-circle-info mr-1"></i> Mostrando ${maxToShow} de ${filtered.length} productos. Refina tu búsqueda para ver otros artículos.
       </div>`
    : '';

  grid.innerHTML = `
    ${filterBreadcrumb}
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      ${itemsToShow.map(p => {
        const allowNegative = posConfig?.operational?.allow_negative_stock;
        const isOutOfStock = p.type === 'BIEN' && p.stock <= 0;
        const isBlocked = isOutOfStock && !allowNegative;

        const stockLabel = p.type === 'SERVICIO' ? 'SERVICIO' : `${p.stock} DISP`;
        const stockBadgeClass = p.type === 'SERVICIO'
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          : p.stock > 10
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : p.stock > 0
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20';

        const price = getProductPriceByConfig(p, posConfig);
        const isFree = posConfig?.special?.price_source === 'free';
        const priceLabel = isFree ? 'Precio Libre' : (window as any).fmt(price);
        const includesIvaBadge = !isFree && posConfig?.special?.prices_include_iva
          ? `<span class="text-[8px] text-orange-500 font-bold block leading-tight">IVA incl.</span>`
          : '';

        return `
          <div class="rounded-xl border p-3 flex flex-col justify-between relative select-none cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-blue-200 ${isBlocked ? 'opacity-55 cursor-not-allowed' : ''}" 
               style="border-color:#E5E7EB;background:#FCFCFD"
               onclick="${isBlocked ? '' : `window.addToPOSCart('${p.id}')`}">
            <div>
              <div class="flex justify-between items-start gap-1">
                <span class="text-[9px] font-mono text-gray-400 block">[${(window as any).esc(p.code || 'S/C')}]</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${stockBadgeClass}">${stockLabel}</span>
              </div>
              <h4 class="font-semibold text-xs text-gray-800 mt-1.5 line-clamp-2" title="${(window as any).esc(p.name)}">${(window as any).esc(p.name)}</h4>
            </div>
            <div class="mt-3 flex justify-between items-end">
              <div>
                <span class="font-extrabold text-blue-600 text-sm">${priceLabel}</span>
                ${includesIvaBadge}
              </div>
              <span class="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs hover:bg-blue-500/20"><i class="fas fa-plus"></i></span>
            </div>
          </div>
        `;
      }).join('')}
      ${showMoreAlert}
    </div>
  `;
};

window.posOnCustomerChange = function() {
  selectedCustomerId = (document.getElementById('pos-cart-customer') as HTMLSelectElement)?.value || "";
};

window.posOnWarehouseChange = async function() {
  selectedWarehouseId = (document.getElementById('pos-cart-warehouse') as HTMLSelectElement)?.value || "";
  posCart = [];
  window.renderPOSCart();
  await window.loadPosProductsWithStock();
};

// --- Gestión de Carrito ---

window.addToPOSCart = function(productId: string) {
  const prod = posProducts.find(p => p.id === productId);
  if (!prod) return;

  const inCart = posCart.find(item => item.id === productId);
  const currentQty = inCart ? inCart.qty : 0;

  const allowNegative = posConfig?.operational?.allow_negative_stock;

  if (prod.type === 'BIEN' && !allowNegative && currentQty + 1 > prod.stock) {
    (window as any).showToast(`No puedes vender más de ${prod.stock} unidades de este producto (stock insuficiente).`, 'warning');
    return;
  }

  if (inCart) {
    inCart.qty++;
  } else {
    const price = getProductPriceByConfig(prod, posConfig);
    posCart.push({
      id: prod.id,
      code: prod.code,
      name: prod.name,
      sales_price: price,
      iva_rate: prod.iva_rate ?? 19,
      qty: 1,
      type: prod.type,
    });
  }

  (window as any).showToast(`Agregado al carrito: ${prod.name}`, 'info', 1500);
  window.renderPOSCart();
};

window.updateCartQty = function(id: string, delta: number) {
  const item = posCart.find(x => x.id === id);
  if (!item) return;

  const prod = posProducts.find(p => p.id === id);
  if (!prod) return;

  const allowNegative = posConfig?.operational?.allow_negative_stock;

  if (item.qty + delta <= 0) {
    posCart = posCart.filter(x => x.id !== id);
  } else {
    if (prod.type === 'BIEN' && !allowNegative && item.qty + delta > prod.stock) {
      (window as any).showToast('Existencias insuficientes en bodega.', 'warning');
      return;
    }
    item.qty += delta;
  }

  window.renderPOSCart();
};

window.removeCartItem = function(id: string) {
  posCart = posCart.filter(x => x.id !== id);
  window.renderPOSCart();
};

window.clearPOSCart = function() {
  posCart = [];
  window.renderPOSCart();
};

window.renderPOSCart = function() {
  const body = document.getElementById('pos-cart-body');
  if (!body) return;

  if (!posCart.length) {
    body.innerHTML = `
      <div class="flex-grow flex flex-col justify-center items-center py-12 text-gray-500 h-full border border-dashed border-gray-800 rounded-2xl">
        <i class="fas fa-basket-shopping text-3xl mb-2"></i>
        <p class="text-xs">Carrito vacío. Haz clic en los artículos de la izquierda.</p>
      </div>
    `;
    const sub = document.getElementById('pos-cart-sub');
    const iva = document.getElementById('pos-cart-iva');
    const tot = document.getElementById('pos-cart-total');
    if (sub) sub.textContent = (window as any).fmt(0);
    if (iva) iva.textContent = (window as any).fmt(0);
    if (tot) tot.textContent = (window as any).fmt(0);

    const discRow = document.getElementById('pos-cart-discount-row');
    if (discRow) discRow.style.display = 'none';
    const freightRow = document.getElementById('pos-cart-freight-row');
    if (freightRow) freightRow.style.display = 'none';

    const discInput = document.getElementById('pos-cart-discount-input') as HTMLInputElement;
    if (discInput) discInput.value = '0';
    const freightInput = document.getElementById('pos-cart-freight-input') as HTMLInputElement;
    if (freightInput) freightInput.value = '0';

    posDiscountPct = 0;
    posFreightAmt = 0;
    return;
  }

  let subtotal = 0;
  let ivaTotal = 0;
  const includesIva = !!posConfig?.special?.prices_include_iva;

  body.innerHTML = posCart.map(item => {
    const tax = calcItemTax(item.sales_price, item.iva_rate, posConfig);
    const itemSub = item.qty * tax.base;
    const itemIva = item.qty * tax.ivaAmount;
    const itemTotal = item.qty * tax.total;
    subtotal += itemSub;
    ivaTotal += itemIva;

    const isPriceEditable = posConfig?.special?.price_source === 'free' || posConfig?.special?.allow_price_edit;
    const priceDisplay = isPriceEditable
      ? `<input type="number" min="0" step="50" class="form-input py-0.5 px-1 text-xs w-24 font-bold inline-block text-right" value="${item.sales_price}" onchange="window.updateCartItemPrice('${item.id}', this.value)" style="background:#fff;color:#0D2137;border:1px solid #DCE6F8;height:24px">`
      : `<strong>${(window as any).fmt(item.sales_price)}</strong>`;

    const ivaLabel = includesIva
      ? `<span class="text-orange-500 font-bold">(IVA incl. ${item.iva_rate}%)</span>`
      : `<span>| IVA: ${item.iva_rate}%</span>`;

    return `
      <div class="rounded-xl p-3 border flex justify-between items-center gap-3 bg-white/[0.01]" style="border-color:rgba(255,255,255,0.05)">
        <div class="flex-grow">
          <h5 class="font-bold text-xs text-black line-clamp-1">${(window as any).esc(item.name)}</h5>
          <div class="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Precio:</span> ${priceDisplay} ${ivaLabel}
            <span class="ml-auto font-bold text-gray-600">${(window as any).fmt(itemTotal)}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 border rounded-lg p-0.5" style="border-color:rgba(255,255,255,0.1);background:rgba(255,255,255,0.02)">
            <button type="button" class="w-6 h-6 rounded flex items-center justify-center text-black hover:bg-black/[0.05] border-none bg-transparent" onclick="window.updateCartQty('${item.id}', -1)"><i class="fas fa-minus text-[10px]"></i></button>
            <span class="text-xs text-black font-bold px-1.5">${(window as any).fmtN(item.qty)}</span>
            <button type="button" class="w-6 h-6 rounded flex items-center justify-center text-black hover:bg-black/[0.05] border-none bg-transparent" onclick="window.updateCartQty('${item.id}', 1)"><i class="fas fa-plus text-[10px]"></i></button>
          </div>
          <button type="button" class="text-gray-500 hover:text-red-400 p-1 border-none bg-transparent cursor-pointer" onclick="window.removeCartItem('${item.id}')"><i class="fas fa-times text-sm"></i></button>
        </div>
      </div>
    `;
  }).join('');

  const discountAmount = Math.round(subtotal * (posDiscountPct / 100) * 100) / 100;
  const freightAmount = Number(posFreightAmt || 0);
  const total = subtotal - discountAmount + ivaTotal + freightAmount;

  const subLbl = document.getElementById('pos-cart-sub');
  const ivaLbl = document.getElementById('pos-cart-iva');
  const totLbl = document.getElementById('pos-cart-total');

  if (subLbl) subLbl.textContent = (window as any).fmt(subtotal);
  if (ivaLbl) ivaLbl.textContent = (window as any).fmt(ivaTotal);

  const discRow = document.getElementById('pos-cart-discount-row');
  const discLbl = document.getElementById('pos-cart-discount-val');
  if (discRow && discLbl) {
    if (discountAmount > 0) {
      discRow.style.display = 'flex';
      discLbl.textContent = `-${(window as any).fmt(discountAmount)}`;
    } else {
      discRow.style.display = 'none';
    }
  }

  const freightRow = document.getElementById('pos-cart-freight-row');
  const freightLbl = document.getElementById('pos-cart-freight-val');
  if (freightRow && freightLbl) {
    if (freightAmount > 0) {
      freightRow.style.display = 'flex';
      freightLbl.textContent = `+${(window as any).fmt(freightAmount)}`;
    } else {
      freightRow.style.display = 'none';
    }
  }

  if (totLbl) totLbl.textContent = (window as any).fmt(total);
};

window.posUpdateDiscountFreight = function() {
  const discInput = document.getElementById('pos-cart-discount-input') as HTMLInputElement;
  const freightInput = document.getElementById('pos-cart-freight-input') as HTMLInputElement;

  if (discInput) {
    const val = parseFloat(discInput.value);
    posDiscountPct = Number.isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
  }
  if (freightInput) {
    const val = parseFloat(freightInput.value);
    posFreightAmt = Number.isNaN(val) ? 0 : Math.max(0, val);
  }
  window.renderPOSCart();
};

window.updateCartItemPrice = function(id: string, val: string) {
  const price = parseFloat(val);
  if (Number.isNaN(price) || price < 0) {
    (window as any).showToast('Precio no válido', 'warning');
    return;
  }
  const item = posCart.find(x => x.id === id);
  if (item) {
    item.sales_price = price;
    window.renderPOSCart();
  }
};

// --- Modal de Arqueo y Cierre ---

window.openArqueoPOSModal = async function() {
  if (!activeShift) return;

  try {
    // Calcula ventas del turno en base a facturas
    const res = await (window as any).pb.listAll('invoices', {
      filter: `pos_shift_id="${activeShift.id}" && status="posted"`
    });

    const cashSales = res.reduce((sum: number, inv: any) => sum + (inv.payment_method === 'EFECTIVO' ? (inv.payable_total ?? inv.total) : 0), 0);
    const expectedCash = activeShift.cash_initial + cashSales;

    const bodyHtml = `
      <div class="space-y-5 text-sm" style="color:#374151">
        <div class="text-center p-4 rounded-xl mb-3" style="background:#F3F4F6">
          <span class="text-xs text-gray-500 block uppercase font-bold">Total Esperado en Caja</span>
          <span class="text-2xl font-black text-blue-700">${(window as any).fmt(expectedCash)}</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div><div class="text-xs text-gray-500">Base Efectivo Apertura</div><div class="font-bold text-gray-800">${(window as any).fmt(activeShift.cash_initial)}</div></div>
          <div><div class="text-xs text-gray-500">Ventas en Efectivo del Turno</div><div class="font-bold text-gray-800">${(window as any).fmt(cashSales)}</div></div>
        </div>

        <div class="border-t pt-4 space-y-4" style="border-color:#E5E7EB">
          <div>
            <label class="form-label font-bold text-gray-700 mb-1.5 block">Efectivo Físico Contado en Cajón <span style="color:#EF4444">*</span></label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
              <input type="number" id="pos-close-actual" class="form-input w-full pl-8 font-black text-lg text-gray-900" min="0" step="50" value="${expectedCash}">
            </div>
            <p class="text-[10px] text-gray-400 mt-1">Digita el valor real de los billetes y monedas que tienes en la caja física.</p>
          </div>

          <div>
            <label class="form-label font-bold text-gray-700 mb-1.5 block">Notas y Observaciones de Cierre</label>
            <textarea id="pos-close-notes" class="form-input w-full text-gray-800" rows="3" placeholder="Ej: Faltante por entrega de vueltas, descuadre de sencillo, todo cuadra ok..."></textarea>
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" id="btn-pos-close-shift" onclick="window.closePOSShift()"><i class="fas fa-lock mr-1"></i> CERTIFICAR Y CERRAR TURNO</button>
    `;

    (window as any).openModal(`Cierre de Caja y Arqueo Diario`, bodyHtml, footer, false);
  } catch (err: any) {
    (window as any).showToast('Error al calcular arqueo', 'error');
  }
};

window.closePOSShift = async function() {
  const btn = document.getElementById('btn-pos-close-shift') as HTMLButtonElement;
  const counted = parseFloat((document.getElementById('pos-close-actual') as HTMLInputElement)?.value || '0');
  const notes = (document.getElementById('pos-close-notes') as HTMLTextAreaElement)?.value.trim() || '';

  if (Number.isNaN(counted) || counted < 0) {
    (window as any).showToast('Digita una cantidad de efectivo físico válida.', 'warning');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Guardando cierre...'; }

  try {
    // Recalcular
    const res = await (window as any).pb.listAll('invoices', {
      filter: `pos_shift_id="${activeShift.id}" && status="posted"`
    });
    const cashSales = res.reduce((sum: number, inv: any) => sum + (inv.payment_method === 'EFECTIVO' ? (inv.payable_total ?? inv.total) : 0), 0);
    const expected = activeShift.cash_initial + cashSales;

    await (window as any).pb.update('pos_shifts', activeShift.id, {
      closed_at: (window as any).nowStr(),
      cash_sales: cashSales,
      cash_expected: expected,
      cash_actual: counted,
      status: 'closed',
      notes: notes
    });

    const diff = counted - expected;
    if (Math.abs(diff) > 0.01) {
      const msg = diff > 0 ? `Sobrante de caja: ${(window as any).fmt(diff)}` : `Faltante de caja: ${(window as any).fmt(diff)}`;
      (window as any).showToast(`Arqueo cerrado con descuadre. ${msg}`, 'warning', 5000);
    } else {
      (window as any).showToast('Arqueo cerrado perfectamente sin descuadres', 'success');
    }

    (window as any).closeModal();
    activeShift = null;
    window.renderShiftOpeningForm();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al cerrar caja', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'CERTIFICAR Y CERRAR TURNO'; }
  }
};

// --- Modal de Pago Rápido POS ---

window.openPOSPaymentModal = function() {
  if (!posCart.length) {
    (window as any).showToast('Agrega productos al carrito primero.', 'warning');
    return;
  }

  let subtotal = 0;
  let ivaTotal = 0;
  posCart.forEach(item => {
    const tax = calcItemTax(item.sales_price, item.iva_rate, posConfig);
    subtotal += item.qty * tax.base;
    ivaTotal += item.qty * tax.ivaAmount;
  });
  const discountAmount = Math.round(subtotal * (posDiscountPct / 100) * 100) / 100;
  const freightAmount = Number(posFreightAmt || 0);
  const total = subtotal - discountAmount + ivaTotal + freightAmount;
  const includesIva = !!posConfig?.special?.prices_include_iva;
  
  let ivaModeDetails = `Base: ${(window as any).fmt(subtotal)}`;
  if (discountAmount > 0) ivaModeDetails += ` - Desc: ${(window as any).fmt(discountAmount)}`;
  ivaModeDetails += ` + IVA: ${(window as any).fmt(ivaTotal)}`;
  if (freightAmount > 0) ivaModeDetails += ` + Flete: ${(window as any).fmt(freightAmount)}`;

  const ivaModeLabel = includesIva
    ? `<span class="text-[10px] text-orange-600 font-bold"><i class="fas fa-circle-info mr-1"></i>Precios con IVA incluido — ${ivaModeDetails}</span>`
    : `<span class="text-[10px] text-gray-400">${ivaModeDetails}</span>`;

  const bodyHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      <div class="text-center p-4 rounded-xl" style="background:#EEF2F6">
        <span class="text-xs text-gray-500 uppercase font-black block">Total a Recaudar</span>
        <span class="text-3xl font-extrabold text-blue-700" id="pos-pay-tot" data-val="${total}">${(window as any).fmt(total)}</span>
        <div class="mt-1">${ivaModeLabel}</div>
      </div>

      <div class="grid grid-cols-4 gap-2" id="pos-pay-methods-grid">
        <button type="button" class="btn btn-outline py-2.5 px-1 flex flex-col items-center gap-1 active text-xs" data-pos-method="EFECTIVO" onclick="window.selectPosPayMethod('EFECTIVO')">
          <i class="fas fa-money-bill-wave text-lg text-emerald-600"></i><span class="font-bold">Efectivo</span>
        </button>
        <button type="button" class="btn btn-outline py-2.5 px-1 flex flex-col items-center gap-1 text-xs" data-pos-method="TRANSFERENCIA" onclick="window.selectPosPayMethod('TRANSFERENCIA')">
          <i class="fas fa-credit-card text-lg text-blue-600"></i><span class="font-bold">Transfer.</span>
        </button>
        <button type="button" class="btn btn-outline py-2.5 px-1 flex flex-col items-center gap-1 text-xs" data-pos-method="CREDITO" onclick="window.selectPosPayMethod('CREDITO')">
          <i class="fas fa-calendar-days text-lg text-orange-600"></i><span class="font-bold">Crédito</span>
        </button>
        <button type="button" class="btn btn-outline py-2.5 px-1 flex flex-col items-center gap-1 text-xs" data-pos-method="MIXTO" onclick="window.selectPosPayMethod('MIXTO')">
          <i class="fas fa-layer-group text-lg text-violet-600"></i><span class="font-bold">Mixto</span>
        </button>
      </div>

      <!-- Sección Efectivo -->
      <div id="pos-pay-cash-sec" class="space-y-4 border-t pt-4" style="border-color:#E5E7EB">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label font-bold text-gray-700 mb-1.5 block">Efectivo Recibido</label>
            <input type="number" id="pos-received-cash" class="form-input w-full font-black text-xl text-emerald-800" min="${total}" step="50" value="${total}" oninput="window.posCalcChange()">
          </div>
          <div>
            <label class="form-label font-bold text-gray-500 mb-1.5 block">Vueltas (Cambio)</label>
            <div class="text-2xl font-black text-emerald-600 pt-2" id="pos-val-change">$ 0</div>
          </div>
        </div>

        <div>
          <label class="text-[10px] text-gray-500 font-bold uppercase block mb-1">Denominaciones rápidas</label>
          <div class="flex gap-2 flex-wrap" id="pos-quick-bills-wrap">
            <!-- Cargados por JS -->
          </div>
        </div>
      </div>

      <!-- Sección Pago Mixto -->
      <div id="pos-pay-mixed-sec" class="space-y-4 border-t pt-4" style="border-color:#E5E7EB; display:none">
        <p class="text-xs text-gray-500 font-bold mb-2">Distribuye el total entre las formas de pago:</p>
        <div class="space-y-3">
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-4 font-bold text-emerald-600"><i class="fas fa-money-bill-wave mr-1"></i> Efectivo</div>
            <div class="col-span-8">
              <input type="number" id="pos-mixed-efectivo" class="form-input w-full text-right font-bold text-emerald-800" min="0" value="${total}" oninput="window.posMixedCalc()">
            </div>
          </div>
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-4 font-bold text-blue-600"><i class="fas fa-credit-card mr-1"></i> Transferencia</div>
            <div class="col-span-8">
              <input type="number" id="pos-mixed-transferencia" class="form-input w-full text-right font-bold text-blue-800" min="0" value="0" oninput="window.posMixedCalc()">
            </div>
          </div>
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-4 font-bold text-orange-600"><i class="fas fa-calendar-days mr-1"></i> Crédito</div>
            <div class="col-span-8">
              <input type="number" id="pos-mixed-credito" class="form-input w-full text-right font-bold text-orange-800" min="0" value="0" oninput="window.posMixedCalc()">
            </div>
          </div>
        </div>

        <div class="border-t pt-3 flex justify-between items-center text-xs font-bold" style="border-color:#E5E7EB">
          <span>Total asignado:</span>
          <span id="pos-mixed-assigned-val" class="text-emerald-600 font-extrabold text-sm">$ 0</span>
        </div>
        <div class="flex justify-between items-center text-xs font-bold text-gray-500" id="pos-mixed-status-row" style="display:none">
          <span>Falta asignar:</span>
          <span id="pos-mixed-status-val" class="font-extrabold text-sm">$ 0</span>
        </div>

        <div class="grid grid-cols-12 gap-3 items-center border-t pt-3" style="border-color:#E5E7EB">
          <div class="col-span-4 text-xs font-bold text-gray-700">Efectivo Recibido</div>
          <div class="col-span-4">
            <input type="number" id="pos-mixed-received" class="form-input w-full text-right font-bold text-emerald-800 text-xs py-1" min="0" value="${total}" oninput="window.posMixedCalc()">
          </div>
          <div class="col-span-4 text-right">
            <span class="text-[9px] text-gray-400 block font-bold uppercase">Vueltas</span>
            <span id="pos-mixed-change" class="font-extrabold text-emerald-600 text-sm">$ 0</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-pos-pay-confirm" onclick="window.confirmPOSPayment()"><i class="fas fa-circle-check mr-1"></i> CONFIRMAR E IMPRIMIR</button>
  `;

  (window as any).openModal(`Checkout y Recaudo POS`, bodyHtml, footer, false);

  window.selectPosPayMethod('EFECTIVO');

  // Auto-enfocar y seleccionar el input de efectivo recibido + Enter para cobrar
  setTimeout(() => {
    const fld = document.getElementById('pos-received-cash') as HTMLInputElement;
    if (fld) {
      fld.focus();
      fld.select();
      fld.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          const confirmBtn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
          if (confirmBtn && !confirmBtn.disabled) {
            if (typeof (window as any).confirmPOSPayment === 'function') {
              (window as any).confirmPOSPayment();
            }
          }
        }
      });
    }
  }, 150);
};

let currentPOSPayMethod = 'EFECTIVO';

window.selectPosPayMethod = function(method: string) {
  currentPOSPayMethod = method;
  
  const btns = document.querySelectorAll('#pos-pay-methods-grid button');
  btns.forEach(btn => {
    const active = btn.getAttribute('data-pos-method') === method;
    btn.classList.toggle('active', active);
    (btn as HTMLButtonElement).style.borderColor = active ? '#1A4B8C' : '#E5E7EB';
    (btn as HTMLButtonElement).style.background = active ? '#EEF4FF' : '#fff';
  });

  const cashSec = document.getElementById('pos-pay-cash-sec');
  const mixedSec = document.getElementById('pos-pay-mixed-sec');
  
  if (cashSec) cashSec.style.display = method === 'EFECTIVO' ? 'block' : 'none';
  if (mixedSec) mixedSec.style.display = method === 'MIXTO' ? 'block' : 'none';

  if (method === 'EFECTIVO') {
    window.loadQuickBills();
    window.posCalcChange();
    const confirmBtn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
    if (confirmBtn) confirmBtn.disabled = false;
  } else if (method === 'MIXTO') {
    const efecInput = document.getElementById('pos-mixed-efectivo') as HTMLInputElement;
    const transInput = document.getElementById('pos-mixed-transferencia') as HTMLInputElement;
    const credInput = document.getElementById('pos-mixed-credito') as HTMLInputElement;
    const recInput = document.getElementById('pos-mixed-received') as HTMLInputElement;

    const tot = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');
    if (efecInput) efecInput.value = String(tot);
    if (transInput) transInput.value = '0';
    if (credInput) credInput.value = '0';
    if (recInput) recInput.value = String(tot);

    window.posMixedCalc();

    setTimeout(() => {
      if (efecInput) {
        efecInput.focus();
        efecInput.select();
      }
      if (recInput) {
        recInput.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            const confirmBtn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
            if (confirmBtn && !confirmBtn.disabled) {
              if (typeof (window as any).confirmPOSPayment === 'function') {
                (window as any).confirmPOSPayment();
              }
            }
          }
        });
      }
    }, 150);
  } else {
    const confirmBtn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
    if (confirmBtn) confirmBtn.disabled = false;
  }
};

window.loadQuickBills = function() {
  const tot = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');
  const wrap = document.getElementById('pos-quick-bills-wrap');
  if (!wrap) return;

  const bills = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const higher = bills.filter(b => b >= tot).slice(0, 4);

  if (!higher.includes(tot)) {
    higher.unshift(tot);
  }

  wrap.innerHTML = higher.map(b => `
    <button type="button" class="btn btn-outline py-2 px-3 font-bold text-xs" onclick="window.setPosReceivedCash(${b})">${b === tot ? 'EXACTO' : (window as any).fmt(b)}</button>
  `).join('');
};

window.setPosReceivedCash = function(val: number) {
  const fld = document.getElementById('pos-received-cash') as HTMLInputElement;
  if (fld) {
    fld.value = String(val);
    window.posCalcChange();
  }
};

window.posCalcChange = function() {
  const tot = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');
  const received = parseFloat((document.getElementById('pos-received-cash') as HTMLInputElement)?.value || '0') || 0;
  const change = Math.max(0, received - tot);

  const lbl = document.getElementById('pos-val-change');
  if (lbl) {
    lbl.textContent = (window as any).fmt(change);
  }
};

window.posMixedCalc = function() {
  const total = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');
  const efec = parseFloat((document.getElementById('pos-mixed-efectivo') as HTMLInputElement)?.value || '0') || 0;
  const trans = parseFloat((document.getElementById('pos-mixed-transferencia') as HTMLInputElement)?.value || '0') || 0;
  const cred = parseFloat((document.getElementById('pos-mixed-credito') as HTMLInputElement)?.value || '0') || 0;

  const assigned = efec + trans + cred;
  const diff = total - assigned;

  const assignedLbl = document.getElementById('pos-mixed-assigned-val');
  const statusRow = document.getElementById('pos-mixed-status-row');
  const statusVal = document.getElementById('pos-mixed-status-val');
  const confirmBtn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;

  if (assignedLbl) assignedLbl.textContent = (window as any).fmt(assigned);

  if (Math.abs(diff) < 0.01) {
    if (assignedLbl) {
      assignedLbl.className = "text-emerald-600 font-extrabold text-sm";
      assignedLbl.innerHTML = `${(window as any).fmt(assigned)} <i class="fas fa-circle-check"></i>`;
    }
    if (statusRow) statusRow.style.display = 'none';
    if (confirmBtn) confirmBtn.disabled = false;
  } else {
    if (assignedLbl) assignedLbl.className = "text-red-500 font-extrabold text-sm";
    if (statusRow) {
      statusRow.style.display = 'flex';
      const statusText = diff > 0 ? 'Falta asignar:' : 'Excedente:';
      statusRow.firstElementChild!.textContent = statusText;
      if (statusVal) {
        statusVal.textContent = (window as any).fmt(Math.abs(diff));
        statusVal.className = diff > 0 ? "text-red-500 font-extrabold text-sm" : "text-orange-500 font-extrabold text-sm";
      }
    }
    if (confirmBtn) confirmBtn.disabled = true;
  }

  const received = parseFloat((document.getElementById('pos-mixed-received') as HTMLInputElement)?.value || '0') || 0;
  const change = Math.max(0, received - efec);
  const changeLbl = document.getElementById('pos-mixed-change');
  if (changeLbl) {
    changeLbl.textContent = (window as any).fmt(change);
  }
};

// --- Procesar y Guardar Venta POS ---

window.confirmPOSPayment = async function() {
  const btn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
  const tot = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');

  let received = 0;
  let change = 0;
  let paymentSplit = null;

  if (currentPOSPayMethod === 'EFECTIVO') {
    received = parseFloat((document.getElementById('pos-received-cash') as HTMLInputElement)?.value || '0') || 0;
    if (received < tot - 0.01) {
      (window as any).showToast('El dinero recibido no puede ser inferior al total a pagar.', 'warning');
      return;
    }
    change = received - tot;
  } else if (currentPOSPayMethod === 'MIXTO') {
    const efec = parseFloat((document.getElementById('pos-mixed-efectivo') as HTMLInputElement)?.value || '0') || 0;
    const trans = parseFloat((document.getElementById('pos-mixed-transferencia') as HTMLInputElement)?.value || '0') || 0;
    const cred = parseFloat((document.getElementById('pos-mixed-credito') as HTMLInputElement)?.value || '0') || 0;
    
    if (Math.abs(tot - (efec + trans + cred)) > 0.01) {
      (window as any).showToast('La asignación de valores no coincide con el total.', 'warning');
      return;
    }
    
    received = parseFloat((document.getElementById('pos-mixed-received') as HTMLInputElement)?.value || '0') || 0;
    if (received < efec - 0.01) {
      (window as any).showToast('El efectivo recibido no puede ser inferior a la porción en efectivo asignada.', 'warning');
      return;
    }
    change = received - efec;
    paymentSplit = JSON.stringify({ EFECTIVO: efec, TRANSFERENCIA: trans, CREDITO: cred });
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Emitiendo ticket contable...'; }

  try {
    const today = (window as any).todayStr().replaceAll('-', '');
    const rand = String(Date.now()).slice(-4);
    const invoiceNumber = `POS-${today}-${rand}`;

    const lines = posCart.map(item => {
      const tax = calcItemTax(item.sales_price, item.iva_rate, posConfig);
      const lineBase = item.qty * tax.base;
      const lineIva  = item.qty * tax.ivaAmount;
      return {
        product_id: item.id,
        qty: item.qty,
        unit_price: tax.base,          // precio unitario SIN IVA (base contable)
        iva_rate: item.iva_rate,
        iva_amount: lineIva,
        subtotal: lineBase,
        total: lineBase + lineIva,
      };
    });

    let subtotal = 0;
    posCart.forEach(item => {
      const tax = calcItemTax(item.sales_price, item.iva_rate, posConfig);
      subtotal += item.qty * tax.base;
    });
    const discountAmount = Math.round(subtotal * (posDiscountPct / 100) * 100) / 100;
    const freightAmount = Number(posFreightAmt || 0);

    const header = {
      number: invoiceNumber,
      customer_id: selectedCustomerId,
      warehouse_id: selectedWarehouseId,
      date: (window as any).todayStr(),
      due_date: (window as any).todayStr(),
      notes: `Venta POS turno #${activeShift.id.slice(-5)}`,
      payment_method: currentPOSPayMethod,
      ret_total: 0,
      status: 'draft', // Empieza en draft y se contabiliza de inmediato
      pos_shift_id: activeShift.id,
      discount_amount: discountAmount,
      freight_amount: freightAmount,
      payment_split: paymentSplit,
    };

    // 1. Crea factura
    const inv = await (window as any).API.createInvoice(header, lines);

    // 2. Contabiliza en caliente
    await (window as any).API.postInvoice(inv.id);

    (window as any).showToast('Venta procesada y contabilizada', 'success');

    // Cerrar el modal de pago antes de mostrar la tirilla
    (window as any).closeModal();

    // Vaciar carrito y refrescar la vista de inmediato
    posCart = [];
    window.renderPOSCart();

    // Muestra simulador de Tirilla Térmica
    window.showThermalTicketReceipt(inv.id, received, change);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al procesar cobro', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'CONFIRMAR E IMPRIMIR'; }
  }
};

// --- Tirilla Térmica 80mm Simulador ---

window.showThermalTicketReceipt = async function(invoiceId: string, receivedCash: number, changeCash: number) {
  try {
    const inv = await (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id,tx_id,tx_id.tx_type_id' });
    const lines = await (window as any).API.getInvoiceLines(invoiceId);

    let einvoiceDoc = null;
    if (inv.tx_id) {
      try {
        const docRes = await (window as any).pb.list('einvoice_docs', {
          filter: `tx_id="${inv.tx_id}"`,
          perPage: 1
        });
        if (docRes.items.length) {
          einvoiceDoc = docRes.items[0];
        }
      } catch (err) {
        console.log("No einvoice doc found or error querying", err);
      }
    }

    const isAccepted = einvoiceDoc && einvoiceDoc.status === 'aceptada';
    const title = isAccepted 
      ? 'FACTURA ELECTRÓNICA DE VENTA' 
      : 'DOCUMENTO EQUIVALENTE ELECTRÓNICO POS<br><span style="font-size:9px">(Tiquete de máquina registradora con sistema P.O.S.)</span>';

    let clientName = inv.expand?.customer_id?.name || 'Consumidor Final';
    let clientDoc = inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '222222222222';
    if (clientDoc === '222222222') {
      clientDoc = '222222222222';
    }

    const resolutionName = inv.expand?.tx_id?.expand?.tx_type_id?.name || 'DOCUMENTO EQUIVALENTE DE VENTA';
    const resolutionDesc = inv.expand?.tx_id?.expand?.tx_type_id?.description || '';

    const taxGroups: { [rate: number]: { base: number, tax: number } } = {};
    for (const l of lines) {
      const rate = Number(l.iva_rate || 0);
      if (!taxGroups[rate]) {
        taxGroups[rate] = { base: 0, tax: 0 };
      }
      taxGroups[rate].base += Number(l.subtotal || 0);
      taxGroups[rate].tax += Number(l.iva_amount || 0);
    }

    let taxBreakdownHtml = `
      <div>--------------------------------</div>
      <div style="font-weight:bold;text-align:center">DESGLOSE DE IMPUESTOS (IVA)</div>
      <div style="display:flex;justify-content:between;font-weight:bold">
        <span>Tarifa</span>
        <span style="width:33%;text-align:right">Base</span>
        <span style="width:33%;text-align:right;float:right">Impuesto</span>
      </div>
    `;
    for (const rate of Object.keys(taxGroups).map(Number).sort((a,b)=>a-b)) {
      const g = taxGroups[rate];
      taxBreakdownHtml += `
        <div style="display:flex;justify-content:between">
          <span>IVA ${rate}%</span>
          <span style="width:33%;text-align:right">${(window as any).fmt(g.base)}</span>
          <span style="width:33%;text-align:right;float:right">${(window as any).fmt(g.tax)}</span>
        </div>
      `;
    }

    let qrAndCufeHtml = '';
    if (isAccepted && einvoiceDoc?.cufe) {
      qrAndCufeHtml = `
        <div>================================</div>
        <div style="text-align:center;margin-top:8px">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=' + einvoiceDoc.cufe)}" style="display:inline-block;width:120px;height:120px;" alt="QR DIAN"/>
        </div>
        <div style="word-break:break-all;font-size:8px;text-align:center;margin-top:4px;line-height:1.1">
          <strong>CUFE:</strong><br>${einvoiceDoc.cufe}
        </div>
      `;
    }

    let splitHtml = '';
    if (inv.payment_method === 'MIXTO' && inv.payment_split) {
      try {
        const split = typeof inv.payment_split === 'string' ? JSON.parse(inv.payment_split) : inv.payment_split;
        splitHtml = Object.keys(split).map(k => {
          if (split[k] > 0) {
            return `<div style="display:flex;justify-content:between;padding-left:10px"><span>- ${k}:</span><span style="float:right">${(window as any).fmt(split[k])}</span></div>`;
          }
          return '';
        }).join('');
      } catch (_) {}
    }

    const ticketHtml = `
      <div class="space-y-4" style="color:#222">
        <p class="text-xs text-center text-gray-500">A continuación puedes previsualizar e imprimir la tirilla térmica legal de venta de 80mm.</p>
        
        <div id="pos-thermal-tirilla" class="mx-auto p-5 border shadow-inner font-mono text-[11px] leading-tight text-black max-w-[280px]" style="background:#fffff8;border-color:#e2e8f0;box-shadow:inset 0 0 10px rgba(0,0,0,0.05)">
          <div class="text-center" style="font-weight:bold;font-size:13px">GRAVY S.A.S</div>
          <div class="text-center">NIT: 901.442.115-3</div>
          <div class="text-center">Calle 26 Norte # 5-44, Cali</div>
          <div class="text-center">Teléfono: (602) 889-1002</div>
          <div class="text-center">================================</div>
          <div class="text-center" style="font-weight:bold;line-height:1.2">${title}</div>
          <div class="text-center" style="font-weight:bold">${inv.number}</div>
          <div>================================</div>
          <div>Fecha: ${(window as any).fmtDate(inv.date)} ${(window as any).nowStr().slice(11, 16)}</div>
          <div>Cajero: ${(window as any).esc((window as any).pb.currentUser?.name)}</div>
          <div>Cliente: ${(window as any).esc(clientName)}</div>
          <div>NIT/C.C: ${clientDoc}</div>
          <div>================================</div>
          <div style="font-weight:bold;display:flex;justify-content:between"><span>DETALLE</span><span style="float:right">TOTAL</span></div>
          <div>--------------------------------</div>
          ${lines.map((l: any) => `
            <div style="margin-bottom:4px">
              <div style="font-weight:bold">${(window as any).esc(l.expand?.product_id?.name || l.description)}</div>
              <div style="color:#555;font-size:9px">Cód: ${(window as any).esc(l.expand?.product_id?.code || '—')} | IVA: ${l.iva_rate ?? 0}%</div>
              <div style="display:flex;justify-content:between">
                <span>${(window as any).fmtN(l.qty)} ${(window as any).esc(l.expand?.product_id?.unit || 'Und')} x ${(window as any).fmt(l.unit_price)}</span>
                <span style="float:right">${(window as any).fmt(l.total)}</span>
              </div>
            </div>
          `).join('')}
          <div>--------------------------------</div>
          <div style="display:flex;justify-content:between"><span>Subtotal:</span><span style="float:right">${(window as any).fmt(inv.subtotal || 0)}</span></div>
          ${inv.discount_amount > 0 ? `<div style="display:flex;justify-content:between;color:#dc2626"><span>Descuento:</span><span style="float:right">-${(window as any).fmt(inv.discount_amount)}</span></div>` : ''}
          ${inv.freight_amount > 0 ? `<div style="display:flex;justify-content:between;color:#059669"><span>Flete:</span><span style="float:right">+${(window as any).fmt(inv.freight_amount)}</span></div>` : ''}
          <div style="display:flex;justify-content:between"><span>IVA:</span><span style="float:right">${(window as any).fmt(inv.iva_total || 0)}</span></div>
          <div style="display:flex;justify-content:between;font-weight:bold;font-size:12px"><span>TOTAL:</span><span style="float:right">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</span></div>
          ${taxBreakdownHtml}
          <div>================================</div>
          <div style="display:flex;justify-content:between"><span>Método Pago:</span><span style="float:right">${inv.payment_method}</span></div>
          ${splitHtml}
          ${(inv.payment_method === 'EFECTIVO' || (inv.payment_method === 'MIXTO' && receivedCash > 0)) ? `
            <div style="display:flex;justify-content:between"><span>Recibido:</span><span style="float:right">${(window as any).fmt(receivedCash)}</span></div>
            <div style="display:flex;justify-content:between;font-weight:bold"><span>Vueltas:</span><span style="float:right">${(window as any).fmt(changeCash)}</span></div>
          ` : ''}
          <div>================================</div>
          <div class="text-center" style="font-weight:bold;font-size:9px">${resolutionName}</div>
          ${resolutionDesc ? `<div class="text-center" style="font-size:8px;color:#555">${resolutionDesc}</div>` : ''}
          <div class="text-center" style="font-size:8px;color:#555;margin-top:6px">
            Software: GRAVY POS | Fabricante: GRAVY S.A.S. NIT: 901.442.115-3
          </div>
          ${qrAndCufeHtml}
        </div>
      </div>
    `;

    let footer = `
      <button class="btn btn-outline" onclick="closeModal(); window.renderPOSCart(); window.loadPosProductsWithStock();">Nueva Venta</button>
    `;
    if (!isAccepted) {
      footer += `
        <button class="btn btn-secondary" onclick="window.emitPosToDian('${invoiceId}', ${receivedCash}, ${changeCash})"><i class="fas fa-paper-plane mr-1"></i> Emitir a DIAN</button>
      `;
    }
    footer += `
      <button class="btn btn-primary" onclick="window.printThermalReceipt('${invoiceId}', ${receivedCash}, ${changeCash})"><i class="fas fa-print"></i> Imprimir Tirilla</button>
    `;

    (window as any).openModal(`Tirilla de Venta Emitida`, ticketHtml, footer, false);
  } catch (err: any) {
    (window as any).showToast('Error al generar tirilla', 'error');
  }
};

window.emitPosToDian = async function(invoiceId: string, receivedCash: number = 0, changeCash: number = 0) {
  try {
    const inv = await (window as any).pb.get('invoices', invoiceId);
    const txId = inv.tx_id;
    if (!txId) {
      (window as any).showToast('Esta venta no tiene transacción contable asociada.', 'warning');
      return;
    }
    
    (window as any).confirmDialog(
      'Emitir Factura POS a la DIAN',
      `¿Deseas firmar digitalmente y emitir el tiquete POS <strong>${inv.number}</strong> a la DIAN como factura electrónica?`,
      async () => {
        try {
          (window as any).showToast('Generando y emitiendo XML POS a DIAN...', 'info');
          const res = await (window as any).pb.send('/api/dian/emit', {
            method: 'POST',
            body: JSON.stringify({ txId: txId }),
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (res && res.success) {
            (window as any).showToast(`Tiquete POS ${inv.number} emitido correctamente a la DIAN. Estado: ${res.status}. ${res.simulated ? '(MODO SIMULADO)' : ''}`, 'success');
            (window as any).closeModal();
            window.showThermalTicketReceipt(invoiceId, receivedCash, changeCash);
          } else {
            (window as any).showToast(`Error al emitir: ${res.dianResponse || 'Respuesta desconocida'}`, 'error');
          }
        } catch (err: any) {
          (window as any).showToast(err.message || 'Error en comunicación', 'error');
        }
      }
    );
  } catch (err: any) {
    (window as any).showToast('Error al cargar datos del tiquete: ' + err.message, 'error');
  }
};

window.printThermalReceipt = async function(invoiceId: string, receivedCash: number, changeCash: number) {
  try {
    const inv = await (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id,tx_id,tx_id.tx_type_id' });
    const lines = await (window as any).API.getInvoiceLines(invoiceId);

    let einvoiceDoc = null;
    if (inv.tx_id) {
      try {
        const docRes = await (window as any).pb.list('einvoice_docs', {
          filter: `tx_id="${inv.tx_id}"`,
          perPage: 1
        });
        if (docRes.items.length) {
          einvoiceDoc = docRes.items[0];
        }
      } catch (err) {
        console.log("No einvoice doc found or error querying", err);
      }
    }

    const isAccepted = einvoiceDoc && einvoiceDoc.status === 'aceptada';
    const title = isAccepted 
      ? 'FACTURA ELECTRÓNICA DE VENTA' 
      : 'DOCUMENTO EQUIVALENTE ELECTRÓNICO POS<br>(Tiquete de máquina registradora con sistema P.O.S.)';

    let clientName = inv.expand?.customer_id?.name || 'Consumidor Final';
    let clientDoc = inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '222222222222';
    if (clientDoc === '222222222') {
      clientDoc = '222222222222';
    }

    const resolutionName = inv.expand?.tx_id?.expand?.tx_type_id?.name || 'DOCUMENTO EQUIVALENTE DE VENTA';
    const resolutionDesc = inv.expand?.tx_id?.expand?.tx_type_id?.description || '';

    const taxGroups: { [rate: number]: { base: number, tax: number } } = {};
    for (const l of lines) {
      const rate = Number(l.iva_rate || 0);
      if (!taxGroups[rate]) {
        taxGroups[rate] = { base: 0, tax: 0 };
      }
      taxGroups[rate].base += Number(l.subtotal || 0);
      taxGroups[rate].tax += Number(l.iva_amount || 0);
    }

    let taxBreakdownHtml = `
      <div class="hr"></div>
      <div class="center bold">DESGLOSE DE IMPUESTOS (IVA)</div>
      <div class="flex-between bold">
        <span>Tarifa</span>
        <span>Base</span>
        <span>Impuesto</span>
      </div>
    `;
    for (const rate of Object.keys(taxGroups).map(Number).sort((a,b)=>a-b)) {
      const g = taxGroups[rate];
      taxBreakdownHtml += `
        <div class="flex-between">
          <span>IVA ${rate}%</span>
          <span>${(window as any).fmt(g.base)}</span>
          <span>${(window as any).fmt(g.tax)}</span>
        </div>
      `;
    }

    let qrAndCufeHtml = '';
    if (isAccepted && einvoiceDoc?.cufe) {
      qrAndCufeHtml = `
        <div class="dbl-hr"></div>
        <div class="center" style="margin-top:8px">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=' + einvoiceDoc.cufe)}" style="display:inline-block;width:120px;height:120px;" />
        </div>
        <div class="center" style="word-break:break-all;font-size:8px;margin-top:4px;line-height:1.1">
          <strong>CUFE:</strong><br>${einvoiceDoc.cufe}
        </div>
      `;
    }

    let splitHtml = '';
    if (inv.payment_method === 'MIXTO' && inv.payment_split) {
      try {
        const split = typeof inv.payment_split === 'string' ? JSON.parse(inv.payment_split) : inv.payment_split;
        splitHtml = Object.keys(split).map(k => {
          if (split[k] > 0) {
            return `<div class="flex-between" style="padding-left:10px"><span>- ${k}:</span><span>${(window as any).fmt(split[k])}</span></div>`;
          }
          return '';
        }).join('');
      } catch (_) {}
    }

    const printWin = window.open('', '_blank');
    if (!printWin) {
      (window as any).showToast('Por favor permite ventanas emergentes.', 'warning');
      return;
    }

    printWin.document.write(`
      <html>
      <head>
        <title>Tirilla POS — ${inv.number}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: monospace; font-size: 11px; margin: 5mm; color:#000; width: 70mm; line-height: 1.3; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .flex-between { display: flex; justify-content: space-between; }
          .hr { border-top: 1px dashed #000; margin: 5px 0; }
          .dbl-hr { border-top: 1.5px double #000; margin: 5px 0; }
          .total-row { font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:13px">GRAVY S.A.S</div>
        <div class="center">NIT: 901.442.115-3</div>
        <div class="center">Calle 26 Norte # 5-44, Cali</div>
        <div class="center">Teléfono: (602) 889-1002</div>
        <div class="dbl-hr"></div>
        <div class="center bold">${title}</div>
        <div class="center bold">${inv.number}</div>
        <div class="dbl-hr"></div>
        <div>Fecha: ${(window as any).fmtDate(inv.date)} ${(window as any).nowStr().slice(11, 16)}</div>
        <div>Cajero: ${(window as any).esc((window as any).pb.currentUser?.name)}</div>
        <div>Cliente: ${(window as any).esc(clientName)}</div>
        <div>NIT/C.C: ${clientDoc}</div>
        <div class="dbl-hr"></div>
        <div class="flex-between bold"><span>DETALLE</span><span>TOTAL</span></div>
        <div class="hr"></div>
        ${lines.map((l: any) => `
          <div style="margin-bottom:3px">
            <div class="bold">${(window as any).esc(l.expand?.product_id?.name || l.description)}</div>
            <div style="color:#555;font-size:10px">Cód: ${(window as any).esc(l.expand?.product_id?.code || '—')} | IVA: ${l.iva_rate ?? 0}%</div>
            <div class="flex-between">
              <span>${(window as any).fmtN(l.qty)} ${(window as any).esc(l.expand?.product_id?.unit || 'Und')} x ${(window as any).fmt(l.unit_price)}</span>
              <span>${(window as any).fmt(l.total)}</span>
            </div>
          </div>
        `).join('')}
        <div class="hr"></div>
        <div class="flex-between"><span>Subtotal:</span><span>${(window as any).fmt(inv.subtotal || 0)}</span></div>
        ${inv.discount_amount > 0 ? `<div class="flex-between" style="color:#dc2626"><span>Descuento:</span><span>-${(window as any).fmt(inv.discount_amount)}</span></div>` : ''}
        ${inv.freight_amount > 0 ? `<div class="flex-between" style="color:#059669"><span>Flete:</span><span>+${(window as any).fmt(inv.freight_amount)}</span></div>` : ''}
        <div class="flex-between"><span>IVA:</span><span>${(window as any).fmt(inv.iva_total || 0)}</span></div>
        <div class="flex-between total-row"><span>TOTAL:</span><span>${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</span></div>
        ${taxBreakdownHtml}
        <div class="dbl-hr"></div>
        <div class="flex-between"><span>Método Pago:</span><span>${inv.payment_method}</span></div>
        ${splitHtml}
        ${(inv.payment_method === 'EFECTIVO' || (inv.payment_method === 'MIXTO' && receivedCash > 0)) ? `
          <div class="flex-between"><span>Recibido:</span><span>${(window as any).fmt(receivedCash)}</span></div>
          <div class="flex-between bold"><span>Vueltas:</span><span>${(window as any).fmt(changeCash)}</span></div>
        ` : ''}
        <div class="dbl-hr"></div>
        <div class="center bold" style="font-size:9px">${resolutionName}</div>
        ${resolutionDesc ? `<div class="center" style="font-size:8px;color:#555">${resolutionDesc}</div>` : ''}
        <div class="center" style="font-size:8px;color:#555;margin-top:6px">
          Software: GRAVY POS | Fabricante: GRAVY S.A.S. NIT: 901.442.115-3
        </div>
        ${qrAndCufeHtml}
        <script>
          window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  } catch (err: any) {
    (window as any).showToast('Error al imprimir tirilla', 'error');
  }
};

// Inyecciones globales
(window as any).renderPOS = renderPOS;

// --- Atajos de Teclado y Flujo Optimizado (Keyboard-First) ---
window.addEventListener('keydown', (e) => {
  // Solo procesar si el módulo POS está activo en la página actual
  if (!document.body.classList.contains('pos-active-page')) return;

  const isModalOpen = document.body.classList.contains('modal-open') || !!document.getElementById('modal-container');
  const activeEl = document.activeElement;
  const isEditingInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
  const isSearchInput = activeEl && activeEl.id === 'pos-search-product';

  if (!isModalOpen) {
    // 1. ESC / F2: Enfocar y limpiar buscador
    if (e.key === 'Escape' || e.key === 'F2') {
      const searchInput = document.getElementById('pos-search-product') as HTMLInputElement;
      if (searchInput) {
        e.preventDefault();
        searchInput.value = '';
        searchInput.focus();
        if (typeof (window as any).filterPosProducts === 'function') {
          (window as any).filterPosProducts();
        }
      }
      return;
    }

    // 2. F8 / CTRL+Enter: Abrir Modal de Checkout
    if (e.key === 'F8' || (e.key === 'Enter' && e.ctrlKey)) {
      e.preventDefault();
      if (typeof (window as any).openPOSPaymentModal === 'function') {
        (window as any).openPOSPaymentModal();
      }
      return;
    }

    // 3. + o -: Modificar cantidad del último ítem del carrito (si el buscador está vacío)
    if (isSearchInput && (e.key === '+' || e.key === '-')) {
      const searchInput = activeEl as HTMLInputElement;
      if (searchInput.value === '') {
        e.preventDefault();
        if (posCart.length > 0) {
          const lastItem = posCart[posCart.length - 1];
          const delta = e.key === '+' ? 1 : -1;
          if (typeof (window as any).updateCartQty === 'function') {
            (window as any).updateCartQty(lastItem.id, delta);
          }
        }
      }
    }

    // 4. Escribir cualquier caracter alfanumérico cuando no hay foco en ningún input enfoca automáticamente el buscador
    if (!isEditingInput && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const searchInput = document.getElementById('pos-search-product') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        // Dejamos que el evento fluya para que el navegador escriba el caracter de inmediato
      }
    }
  } else {
    // --- Atajos en Modal de Cobro Abierto ---
    // F1-F4 para seleccionar forma de pago
    if (e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4') {
      e.preventDefault();
      const methods = { 'F1': 'EFECTIVO', 'F2': 'TRANSFERENCIA', 'F3': 'CREDITO', 'F4': 'MIXTO' };
      const selected = (methods as any)[e.key];
      if (selected && typeof (window as any).selectPosPayMethod === 'function') {
        (window as any).selectPosPayMethod(selected);
      }
      return;
    }

    // Teclas 1-4 para seleccionar forma de pago si no estamos escribiendo en un input
    if (!isEditingInput && (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4')) {
      e.preventDefault();
      const methods = { '1': 'EFECTIVO', '2': 'TRANSFERENCIA', '3': 'CREDITO', '4': 'MIXTO' };
      const selected = (methods as any)[e.key];
      if (selected && typeof (window as any).selectPosPayMethod === 'function') {
        (window as any).selectPosPayMethod(selected);
      }
      return;
    }

    // Enter en el modal confirma el recaudo si el botón no está deshabilitado
    if (e.key === 'Enter') {
      const confirmBtn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
      if (confirmBtn && !confirmBtn.disabled) {
        // Solo prevenir por defecto si no estamos enfocados en otro botón del modal
        if (activeEl?.tagName !== 'BUTTON') {
          e.preventDefault();
          if (typeof (window as any).confirmPOSPayment === 'function') {
            (window as any).confirmPOSPayment();
          }
        }
      }
    }
  }
});
