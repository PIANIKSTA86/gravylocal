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
      },
      withholding_rules: [],
    },
    special: {
      allow_price_edit: false,
      require_customer: true,
    }
  };
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
  const [cfg, accounts] = await Promise.all([
    getPOSConfig(),
    (window as any).API.getAccounts(true),
  ]);
  const accountOptions = (selectedCode = '') => {
    const rows = accounts.filter((a: any) => a.active && Number(a.level) >= 3).sort((a: any, b: any) => a.code.localeCompare(b.code));
    return `<option value="">— Sin definir —</option>${rows.map((a: any) => `<option value="${(window as any).esc(a.code)}"${a.code === selectedCode ? ' selected' : ''}>${(window as any).esc(a.code)} — ${(window as any).esc(a.name)}</option>`).join('')}`;
  };
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
            <label class="form-label">Cuenta Ventas (Cr)</label>
            <select id="pos-cfg-sales" class="form-input">${accountOptions(cfg.accounting.accounts.sales_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Caja (Dr)</label>
            <select id="pos-cfg-cash" class="form-input">${accountOptions(cfg.accounting.accounts.cash_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Descuentos</label>
            <select id="pos-cfg-discount-acct" class="form-input">${accountOptions(cfg.accounting.accounts.discount_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Fletes</label>
            <select id="pos-cfg-freight-acct" class="form-input">${accountOptions(cfg.accounting.accounts.freight_code)}</select>
          </div>
        </div>
      </div>
      <div class="rounded-xl border p-4" style="border-color:#E5E7EB;background:#FCFCFD">
        <h4 class="font-bold mb-1" style="color:#0D2137"><i class="fas fa-cogs mr-2"></i>Opciones Especiales</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-price-edit" type="checkbox" ${cfg.special.allow_price_edit ? 'checked' : ''}>Permitir editar precio en venta</label>
          <label class="inline-flex items-center gap-2"><input id="pos-cfg-require-customer" type="checkbox" ${cfg.special.require_customer ? 'checked' : ''}>Exigir cliente en cada venta</label>
        </div>
      </div>
    </div>
  `;
  const footer = `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-pos-cfg-save">Guardar Cambios</button>`;
  (window as any).openModal('Configuración POS', formHtml, footer, false);
  setTimeout(() => {
    document.getElementById('btn-pos-cfg-save')?.addEventListener('click', async () => {
      const newCfg = {
        operational: {
          enable_discounts: (document.getElementById('pos-cfg-discount') as HTMLInputElement)?.checked,
          enable_freight: (document.getElementById('pos-cfg-freight') as HTMLInputElement)?.checked,
          enable_withholdings: (document.getElementById('pos-cfg-withholding') as HTMLInputElement)?.checked,
          allow_negative_stock: (document.getElementById('pos-cfg-neg-stock') as HTMLInputElement)?.checked,
          require_cash_count: (document.getElementById('pos-cfg-cash-count') as HTMLInputElement)?.checked,
          default_due_days: Number((document.getElementById('pos-cfg-default-due') as HTMLInputElement)?.value || 0),
          withholdings: {
            reterenta: true, // Puedes expandir para más reglas
            reteiva: false,
            reteica: true,
          },
        },
        accounting: {
          accounts: {
            sales_code: (document.getElementById('pos-cfg-sales') as HTMLSelectElement)?.value,
            cash_code: (document.getElementById('pos-cfg-cash') as HTMLSelectElement)?.value,
            discount_code: (document.getElementById('pos-cfg-discount-acct') as HTMLSelectElement)?.value,
            freight_code: (document.getElementById('pos-cfg-freight-acct') as HTMLSelectElement)?.value,
            iva_by_rate: cfg.accounting.accounts.iva_by_rate,
          },
          withholding_rules: [],
        },
        special: {
          allow_price_edit: (document.getElementById('pos-cfg-price-edit') as HTMLInputElement)?.checked,
          require_customer: (document.getElementById('pos-cfg-require-customer') as HTMLInputElement)?.checked,
        }
      };
      await savePOSConfig(newCfg);
      (window as any).showToast('Configuración guardada', 'success');
      (window as any).closeModal();
      if (onSaved) onSaved();
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

// Cargar estado inicial y renderizar
export async function renderPOS(container: HTMLElement) {
  
  container.innerHTML = `
    <div class="rounded-xl border p-6 space-y-6 min-h-[600px] flex flex-col justify-between" style="border-color:#E5E7EB;background:#FCFCFD">
      <div class="flex justify-end mb-2">
        <button class="btn btn-outline btn-sm" title="Configuración POS" onclick="window.openPOSSettingsModal()">
          <i class="fas fa-cog"></i>
        </button>
      </div>
      <div id="pos-shift-container" class="flex-grow flex flex-col justify-center items-center py-12">
        <div class="text-center" style="color:#374151">
          <i class="fas fa-spinner fa-spin text-4xl mb-4" style="color:#7F7CFF"></i>
          <p class="text-sm" style="color:#6B7280">Verificando estado del turno de caja...</p>
        </div>
      </div>
    </div>
  `;
// Exponer función global para el botón
window.openPOSSettingsModal = openPOSSettingsModal;

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
    const consumer = posCustomers.find(c => c.doc_number === '222222222' || c.nit === '222222222' || c.name.toLowerCase().includes('consumidor'));
    selectedCustomerId = consumer ? consumer.id : (posCustomers[0]?.id || "");

    // Bodega por defecto
    selectedWarehouseId = posWarehouses[0]?.id || "";

    posCart = [];

    // Render principal
    mainWrap.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)] min-h-[500px]">
        <!-- Panel Izquierdo: Catálogo y Buscador (Col 7) -->
        <div class="lg:col-span-7 flex flex-col justify-between space-y-4 h-full">
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
        <div class="lg:col-span-5 flex flex-col justify-between rounded-2xl border p-5 h-full" style="border-color:#E5E7EB;background:#FCFCFD">
          <div class="space-y-4 flex flex-col h-full justify-between">
            <!-- Barra superior del Carrito -->
            <div class="flex justify-between items-center border-b pb-3" style="border-color:#E5E7EB">
              <div>
                <span class="font-bold block text-sm" style="color:#0D2137"><i class="fas fa-cart-shopping text-blue-500 mr-1"></i> Carrito de Ventas</span>
                <span class="text-xs" style="color:#6B7280">Turno de: ${(window as any).esc((window as any).pb.currentUser?.name)}</span>
              </div>
              <button class="btn btn-outline btn-sm text-red-500 hover:text-red-400" onclick="window.clearPOSCart()"><i class="fas fa-trash-can"></i> Vaciar</button>
            </div>

            <!-- Selector de Cliente y Bodega -->
            <div class="grid grid-cols-2 gap-3">
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

            <!-- Lista de items del carrito -->
            <div class="flex-grow overflow-y-auto pr-1 my-3 space-y-3" id="pos-cart-body" style="max-height:calc(100vh-420px)">
              <!-- Items del carrito -->
            </div>

            <!-- Resumen de Totales y Pago -->
            <div class="border-t pt-4 space-y-3" style="border-color:#E5E7EB">
              <div class="space-y-1 text-xs">
                <div class="flex justify-between" style="color:#6B7280"><span>Subtotal:</span> <span id="pos-cart-sub" class="font-bold" style="color:#374151">$ 0</span></div>
                <div class="flex justify-between" style="color:#6B7280"><span>IVA Calculado:</span> <span id="pos-cart-iva" class="font-bold" style="color:#374151">$ 0</span></div>
                <div class="flex justify-between text-base border-t pt-2 font-extrabold" style="border-color:#E5E7EB;color:#0D2137">
                  <span>TOTAL A PAGAR:</span> <span id="pos-cart-total" class="text-blue-500 text-lg">$ 0</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2">
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
      </div>
    `;

    await window.loadPosProductsWithStock();
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

window.filterPosProducts = function() {
  const query = (document.getElementById('pos-search-product') as HTMLInputElement)?.value.toLowerCase().trim() || '';
  const grid = document.getElementById('pos-catalog-grid');
  if (!grid) return;

  const filtered = posProducts.filter(p => {
    return `${p.name} ${p.code}`.toLowerCase().includes(query);
  });

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="text-center py-12 text-gray-500 w-full col-span-3">
        <i class="fas fa-box-open text-3xl mb-2 block"></i> No se encontraron productos/servicios en el catálogo.
      </div>
    `;
    return;
  }

  grid.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      ${filtered.map(p => {
        const isOutOfStock = p.type === 'BIEN' && p.stock <= 0;
        const stockLabel = p.type === 'SERVICIO' ? 'SERVICIO' : `${p.stock} DISP`;
        const stockBadgeClass = p.type === 'SERVICIO'
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          : p.stock > 10
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : p.stock > 0
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20';

        return `
          <div class="rounded-xl border p-3 flex flex-col justify-between relative select-none cursor-pointer transition-all duration-200 hover:scale-[1.02] ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}" 
               style="border-color:rgba(255,255,255,0.06);background:rgba(255,255,255,0.02)"
               onclick="${isOutOfStock ? '' : `window.addToPOSCart('${p.id}')`}">
            <div>
              <div class="flex justify-between items-start gap-1">
                <span class="text-[9px] font-mono text-gray-500 block">[${(window as any).esc(p.code || 'S/C')}]</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${stockBadgeClass}">${stockLabel}</span>
              </div>
              <h4 class="font-semibold text-xs text-black mt-1.5 line-clamp-2" title="${(window as any).esc(p.name)}">${(window as any).esc(p.name)}</h4>
              <div class="text-[11px] text-blue-700 font-bold mt-1">${(window as any).fmt(p.sales_price || 0)}</div>
            </div>
            <div class="mt-3 flex justify-between items-center">
              <span class="font-extrabold text-blue-400 text-sm">${(window as any).fmt(p.sales_price || 0)}</span>
              <span class="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs hover:bg-blue-500/20"><i class="fas fa-plus"></i></span>
            </div>
          </div>
        `;
      }).join('')}
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

  // Stock check
  const inCart = posCart.find(item => item.id === productId);
  const currentQty = inCart ? inCart.qty : 0;

  if (prod.type === 'BIEN' && currentQty + 1 > prod.stock) {
    (window as any).showToast(`No puedes vender más de ${prod.stock} unidades de este producto (stock insuficiente).`, 'warning');
    return;
  }

  if (inCart) {
    inCart.qty++;
  } else {
    posCart.push({
      id: prod.id,
      code: prod.code,
      name: prod.name,
      sales_price: prod.sales_price || 0,
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

  if (item.qty + delta <= 0) {
    posCart = posCart.filter(x => x.id !== id);
  } else {
    if (prod.type === 'BIEN' && item.qty + delta > prod.stock) {
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
    return;
  }

  let subtotal = 0;
  let ivaTotal = 0;

  body.innerHTML = posCart.map(item => {
    const itemSub = item.qty * item.sales_price;
    const itemIva = itemSub * (item.iva_rate / 100);
    subtotal += itemSub;
    ivaTotal += itemIva;

    return `
      <div class="rounded-xl p-3 border flex justify-between items-center gap-3 bg-white/[0.01]" style="border-color:rgba(255,255,255,0.05)">
        <div class="flex-grow">
          <h5 class="font-bold text-xs text-black line-clamp-1">${(window as any).esc(item.name)}</h5>
          <div class="text-[10px] text-gray-400 mt-0.5">Precio: ${(window as any).fmt(item.sales_price)} | IVA: ${item.iva_rate}%</div>
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

  const total = subtotal + ivaTotal;

  const subLbl = document.getElementById('pos-cart-sub');
  const ivaLbl = document.getElementById('pos-cart-iva');
  const totLbl = document.getElementById('pos-cart-total');

  if (subLbl) subLbl.textContent = (window as any).fmt(subtotal);
  if (ivaLbl) ivaLbl.textContent = (window as any).fmt(ivaTotal);
  if (totLbl) totLbl.textContent = (window as any).fmt(total);
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
    const s = item.qty * item.sales_price;
    subtotal += s;
    ivaTotal += s * (item.iva_rate / 100);
  });
  const total = subtotal + ivaTotal;

  const bodyHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      <div class="text-center p-4 rounded-xl" style="background:#EEF2F6">
        <span class="text-xs text-gray-500 uppercase font-black block">Total a Recaudar</span>
        <span class="text-3xl font-extrabold text-blue-700" id="pos-pay-tot" data-val="${total}">${(window as any).fmt(total)}</span>
      </div>

      <div class="grid grid-cols-3 gap-3" id="pos-pay-methods-grid">
        <button type="button" class="btn btn-outline py-3 flex flex-col items-center gap-1 active" data-pos-method="EFECTIVO" onclick="window.selectPosPayMethod('EFECTIVO')">
          <i class="fas fa-money-bill-wave text-xl text-emerald-600"></i><span class="font-bold">Efectivo</span>
        </button>
        <button type="button" class="btn btn-outline py-3 flex flex-col items-center gap-1" data-pos-method="TRANSFERENCIA" onclick="window.selectPosPayMethod('TRANSFERENCIA')">
          <i class="fas fa-credit-card text-xl text-blue-600"></i><span class="font-bold">Tarjeta/Trans.</span>
        </button>
        <button type="button" class="btn btn-outline py-3 flex flex-col items-center gap-1" data-pos-method="CREDITO" onclick="window.selectPosPayMethod('CREDITO')">
          <i class="fas fa-calendar-days text-xl text-orange-600"></i><span class="font-bold">Crédito</span>
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

        <!-- Billetes rápidos -->
        <div>
          <label class="text-[10px] text-gray-500 font-bold uppercase block mb-1">Denominaciones rápidas</label>
          <div class="flex gap-2 flex-wrap" id="pos-quick-bills-wrap">
            <!-- Cargados por JS -->
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
};

let currentPOSPayMethod = 'EFECTIVO';

window.selectPosPayMethod = function(method: string) {
  currentPOSPayMethod = method;
  
  // Cambia botones activos
  const btns = document.querySelectorAll('#pos-pay-methods-grid button');
  btns.forEach(btn => {
    const active = btn.getAttribute('data-pos-method') === method;
    btn.classList.toggle('active', active);
    (btn as HTMLButtonElement).style.borderColor = active ? '#1A4B8C' : '#E5E7EB';
    (btn as HTMLButtonElement).style.background = active ? '#EEF4FF' : '#fff';
  });

  const cashSec = document.getElementById('pos-pay-cash-sec');
  if (cashSec) cashSec.style.display = method === 'EFECTIVO' ? 'block' : 'none';

  if (method === 'EFECTIVO') {
    window.loadQuickBills();
    window.posCalcChange();
  }
};

window.loadQuickBills = function() {
  const tot = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');
  const wrap = document.getElementById('pos-quick-bills-wrap');
  if (!wrap) return;

  // Billetes colombianos de denominación común
  const bills = [1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const higher = bills.filter(b => b >= tot).slice(0, 4);

  if (!higher.includes(tot)) {
    higher.unshift(tot); // exacto
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

// --- Procesar y Guardar Venta POS ---

window.confirmPOSPayment = async function() {
  const btn = document.getElementById('btn-pos-pay-confirm') as HTMLButtonElement;
  const received = parseFloat((document.getElementById('pos-received-cash') as HTMLInputElement)?.value || '0') || 0;
  const tot = parseFloat(document.getElementById('pos-pay-tot')?.getAttribute('data-val') || '0');

  if (currentPOSPayMethod === 'EFECTIVO' && received < tot - 0.01) {
    (window as any).showToast('El dinero recibido no puede ser inferior al total a pagar.', 'warning');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Emitiendo ticket contable...'; }

  try {
    const today = (window as any).todayStr().replaceAll('-', '');
    const rand = String(Date.now()).slice(-4);
    const invoiceNumber = `POS-${today}-${rand}`;

    const lines = posCart.map(item => {
      const subtotal = item.qty * item.sales_price;
      const ivaAmt = subtotal * (item.iva_rate / 100);
      return {
        product_id: item.id,
        qty: item.qty,
        unit_price: item.sales_price,
        iva_rate: item.iva_rate,
        iva_amount: ivaAmt,
        subtotal,
        total: subtotal + ivaAmt,
      };
    });

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
    };

    // 1. Crea factura
    const inv = await (window as any).API.createInvoice(header, lines);

    // 2. Contabiliza en caliente
    await (window as any).API.postInvoice(inv.id);

    (window as any).showToast('Venta procesada y contabilizada', 'success');

    // Muestra simulador de Tirilla Térmica
    window.showThermalTicketReceipt(inv.id, received, received - tot);
    
    // Vaciar carrito
    posCart = [];
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al procesar cobro', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'CONFIRMAR E IMPRIMIR'; }
  }
};

// --- Tirilla Térmica 80mm Simulador ---

window.showThermalTicketReceipt = async function(invoiceId: string, receivedCash: number, changeCash: number) {
  try {
    const inv = await (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id' });
    const lines = await (window as any).API.getInvoiceLines(invoiceId);

    const ticketHtml = `
      <div class="space-y-4" style="color:#222">
        <p class="text-xs text-center text-gray-500">A continuación puedes previsualizar e imprimir la tirilla térmica legal de venta de 80mm.</p>
        
        <div id="pos-thermal-tirilla" class="mx-auto p-5 border shadow-inner font-mono text-[11px] leading-tight text-black max-w-[280px]" style="background:#fffff8;border-color:#e2e8f0;box-shadow:inset 0 0 10px rgba(0,0,0,0.05)">
          <div class="text-center" style="font-weight:bold;font-size:13px">GRAVY S.A.S</div>
          <div class="text-center">NIT: 901.442.115-3</div>
          <div class="text-center">Calle 26 Norte # 5-44, Cali</div>
          <div class="text-center">Teléfono: (602) 889-1002</div>
          <div class="text-center">================================</div>
          <div class="text-center" style="font-weight:bold">RECIBO DE VENTA POS</div>
          <div class="text-center" style="font-weight:bold">${inv.number}</div>
          <div>================================</div>
          <div>Fecha: ${(window as any).fmtDate(inv.date)} ${(window as any).nowStr().slice(11, 16)}</div>
          <div>Cajero: ${(window as any).esc((window as any).pb.currentUser?.name)}</div>
          <div>Cliente: ${(window as any).esc(inv.expand?.customer_id?.name || 'Consumidor Final')}</div>
          <div>NIT/C.C: ${inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '222222222'}</div>
          <div>================================</div>
          <div style="font-weight:bold;display:flex;justify-content:between"><span>DETALLE</span><span style="float:right">TOTAL</span></div>
          <div>--------------------------------</div>
          ${lines.map((l: any) => `
            <div style="margin-bottom:4px">
              <div style="font-weight:bold">${(window as any).esc(l.expand?.product_id?.name || l.description)}</div>
              <div style="display:flex;justify-content:between">
                <span>${(window as any).fmtN(l.qty)} x ${(window as any).fmt(l.unit_price)}</span>
                <span style="float:right">${(window as any).fmt(l.total)}</span>
              </div>
            </div>
          `).join('')}
          <div>--------------------------------</div>
          <div style="display:flex;justify-content:between"><span>Subtotal:</span><span style="float:right">${(window as any).fmt(inv.subtotal || 0)}</span></div>
          <div style="display:flex;justify-content:between"><span>IVA:</span><span style="float:right">${(window as any).fmt(inv.iva_total || 0)}</span></div>
          <div style="display:flex;justify-content:between;font-weight:bold;font-size:12px"><span>TOTAL:</span><span style="float:right">${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</span></div>
          <div>================================</div>
          <div style="display:flex;justify-content:between"><span>Método Pago:</span><span style="float:right">${inv.payment_method}</span></div>
          ${inv.payment_method === 'EFECTIVO' ? `
            <div style="display:flex;justify-content:between"><span>Recibido:</span><span style="float:right">${(window as any).fmt(receivedCash)}</span></div>
            <div style="display:flex;justify-content:between;font-weight:bold"><span>Vueltas:</span><span style="float:right">${(window as any).fmt(changeCash)}</span></div>
          ` : ''}
          <div>================================</div>
          <div class="text-center" style="font-weight:bold">¡GRACIAS POR TU COMPRA!</div>
          <div class="text-center" style="font-size:8px;color:#666">GRAVY v2.0 POS — Facturación Autorizada</div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal(); window.renderPOSCart();">Cerrar</button>
      <button class="btn btn-primary" onclick="window.printThermalReceipt('${invoiceId}', ${receivedCash}, ${changeCash})"><i class="fas fa-print"></i> Imprimir Tirilla</button>
    `;

    (window as any).openModal(`Tirilla de Venta Emitida`, ticketHtml, footer, false);
  } catch (err: any) {
    (window as any).showToast('Error al generar tirilla', 'error');
  }
};

window.printThermalReceipt = async function(invoiceId: string, receivedCash: number, changeCash: number) {
  try {
    const inv = await (window as any).pb.get('invoices', invoiceId, { expand: 'customer_id,warehouse_id' });
    const lines = await (window as any).API.getInvoiceLines(invoiceId);

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
        <div class="center bold">RECIBO DE VENTA POS</div>
        <div class="center bold">${inv.number}</div>
        <div class="dbl-hr"></div>
        <div>Fecha: ${(window as any).fmtDate(inv.date)} ${(window as any).nowStr().slice(11, 16)}</div>
        <div>Cajero: ${(window as any).esc((window as any).pb.currentUser?.name)}</div>
        <div>Cliente: ${(window as any).esc(inv.expand?.customer_id?.name || 'Consumidor Final')}</div>
        <div>NIT/C.C: ${inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '222222222'}</div>
        <div class="dbl-hr"></div>
        <div class="flex-between bold"><span>DETALLE</span><span>TOTAL</span></div>
        <div class="hr"></div>
        ${lines.map((l: any) => `
          <div style="margin-bottom:3px">
            <div class="bold">${(window as any).esc(l.expand?.product_id?.name || l.description)}</div>
            <div class="flex-between">
              <span>${(window as any).fmtN(l.qty)} x ${(window as any).fmt(l.unit_price)}</span>
              <span>${(window as any).fmt(l.total)}</span>
            </div>
          </div>
        `).join('')}
        <div class="hr"></div>
        <div class="flex-between"><span>Subtotal:</span><span>${(window as any).fmt(inv.subtotal || 0)}</span></div>
        <div class="flex-between"><span>IVA:</span><span>${(window as any).fmt(inv.iva_total || 0)}</span></div>
        <div class="flex-between total-row"><span>TOTAL:</span><span>${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</span></div>
        <div class="dbl-hr"></div>
        <div class="flex-between"><span>Método Pago:</span><span>${inv.payment_method}</span></div>
        ${inv.payment_method === 'EFECTIVO' ? `
          <div class="flex-between"><span>Recibido:</span><span>${(window as any).fmt(receivedCash)}</span></div>
          <div class="flex-between bold"><span>Vueltas:</span><span>${(window as any).fmt(changeCash)}</span></div>
        ` : ''}
        <div class="dbl-hr"></div>
        <div class="center bold">¡GRACIAS POR TU COMPRA!</div>
        <div class="center" style="font-size:7px;color:#666">GRAVY v2.0 POS — Facturación Autorizada</div>
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
