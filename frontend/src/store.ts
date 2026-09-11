import './style.css';

// --- Interfaces de Datos ---
interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  precio_venta_2?: number;
  presentacion: string;
  categoria: string;
  linea: string;
  imageUrl: string;
  stock: number;
}

interface StoreConfig {
  store_name: string;
  whatsapp_number: string;
  accent_color: string;
  welcome_msg: string;
  description: string;
  min_order: number;
  order_prefix: string;
  block_out_of_stock: boolean;
  logo: string;
  company_name?: string;
  company_nit?: string;
  company_address?: string;
  company_phone?: string;
}

// Claves de almacenamiento local-first (Stale-While-Revalidate)
const CK_KEYS = {
  PRODUCTS: 'gravy_cached_products',
  CONFIG: 'gravy_cached_store_cfg',
  CART: 'pedido_carrito',
  LAST_ORDER: 'pedido_ultimo'
};

// Configuración por defecto
let CONFIG: StoreConfig = {
  store_name: 'GRAVY',
  whatsapp_number: '573000000000',
  accent_color: '#3D68A8',
  welcome_msg: 'Revisa nuestro catálogo y haz tu pedido de forma fácil y rápida.',
  description: 'Catálogo interactivo de productos y pedidos en línea.',
  min_order: 0,
  order_prefix: 'PED-',
  block_out_of_stock: false,
  logo: ''
};

// Estado Global de la SPA
const state = {
  vista: 'catalogo', // 'catalogo' | 'checkout' | 'confirmacion'
  carrito: JSON.parse(localStorage.getItem(CK_KEYS.CART) || '[]') as Array<{ id: string; cantidad: number }>,
  filtros: {
    categoria: [] as string[],
    linea: [] as string[],
    precio: null as [number, number] | null,
    busqueda: '',
    orden: 'relevancia',
  },
  showCarrito: false,
  showFiltrosMovil: false,
  ultimoPedido: null as any,
};

let PRODUCTOS: Product[] = [];
let CATEGORIAS: string[] = [];
let LINEAS: string[] = [];

const RANGOS_PRECIO = [
  { label: 'Todos los precios', value: null },
  { label: 'Hasta $50.000', value: [0, 50000] },
  { label: '$50.000 a $150.000', value: [50000, 150000] },
  { label: '$150.000 a $300.000', value: [150000, 300000] },
  { label: 'Más de $300.000', value: [300000, Infinity] },
];

const ICONOS_CATEGORIA: Record<string, string> = {
  'tecnologia': 'fa-laptop',
  'computadores': 'fa-desktop',
  'celulares': 'fa-mobile-screen-button',
  'relojes': 'fa-clock',
  'audio': 'fa-headphones',
  'mascotas': 'fa-paw',
  'spa': 'fa-spa',
  'aseo': 'fa-soap',
  'limpieza': 'fa-hands-wash',
  'comida': 'fa-utensils',
  'despensa': 'fa-basket-shopping',
  'bebidas': 'fa-glass-water',
  'licores': 'fa-wine-bottle',
  'salud': 'fa-heart-pulse',
  'belleza': 'fa-wand-magic-sparkles',
  'juguetes': 'fa-gamepad',
  'hogar': 'fa-house-chimney',
  'ferreteria': 'fa-screwdriver-wrench'
};

// --- MOTOR MATEMÁTICO DE COLORES & IDENTIDAD (MAKAO DESIGN ENGINE) ---
function ckHexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = (hex || '#3D68A8').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 61, g: 104, b: 168 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function ckRgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function aplicarTemaColor(hexColor: string) {
  if (typeof document === 'undefined') return;
  const hex = hexColor || CONFIG.accent_color || '#3D68A8';
  const rgb = ckHexToRgb(hex);

  // Derivar tonalidades calculadas
  const darkR = Math.floor(rgb.r * 0.18 + 8);
  const darkG = Math.floor(rgb.g * 0.18 + 10);
  const darkB = Math.floor(rgb.b * 0.22 + 18);
  const hexDark = ckRgbToHex(darkR, darkG, darkB);

  const brightR = Math.min(255, Math.floor(rgb.r * 1.25 + 25));
  const brightG = Math.min(255, Math.floor(rgb.g * 1.25 + 25));
  const brightB = Math.min(255, Math.floor(rgb.b * 1.25 + 25));
  const hexBright = ckRgbToHex(brightR, brightG, brightB);

  const hoverR = Math.max(0, Math.floor(rgb.r * 0.82));
  const hoverG = Math.max(0, Math.floor(rgb.g * 0.82));
  const hoverB = Math.max(0, Math.floor(rgb.b * 0.82));
  const hexHover = ckRgbToHex(hoverR, hoverG, hoverB);

  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-hover', hexHover);
  root.style.setProperty('--accent-dark', hexDark);
  root.style.setProperty('--accent-bright', hexBright);
  root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`);
  root.style.setProperty('--accent-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`);

  // Meta theme-color móvil
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', hex);
}

function actualizarIdentidad(cfg: StoreConfig) {
  if (typeof document === 'undefined') return;
  const nombre = (cfg.store_name || 'GRAVY').trim();
  const logo = (cfg.logo || '').trim();
  const color = cfg.accent_color || '#3D68A8';

  // 1. Título pestaña del navegador
  document.title = `${nombre} — Catálogo Interactivo`;

  // 2. Meta descripción
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', cfg.description || `Catálogo de productos de ${nombre}.`);
  }

  // 3. Favicon dinámico (Usa logo o SVG generado al vuelo)
  let favicon = document.getElementById('store-favicon') as HTMLLinkElement | null;
  if (!favicon) {
    favicon = document.createElement('link') as HTMLLinkElement;
    favicon.rel = 'icon';
    favicon.id = 'store-favicon';
    document.head.appendChild(favicon);
  }

  if (logo && (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/'))) {
    favicon.href = logo;
  } else {
    const letra = (nombre.charAt(0) || 'G').toUpperCase();
    const svgCode = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='${color}'/><text y='70' x='50' text-anchor='middle' font-size='56' fill='white' font-weight='900' font-family='sans-serif'>${letra}</text></svg>`;
    favicon.href = `data:image/svg+xml,${encodeURIComponent(svgCode)}`;
  }
}

// --- Utilidades de Formato ---
function fmt(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n || 0);
}

function escHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getProductImg(p: Product): string {
  if (p.imageUrl) return p.imageUrl;
  return '/assets/gravy-logo.png';
}

function getLineaBadgeClass(linea: string): string {
  const norm = (linea || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('eco')) return 'badge-linea-eco';
  if (norm.includes('pre') || norm.includes('oro') || norm.includes('vip')) return 'badge-linea-pre';
  return 'badge-linea-std';
}

// --- Persistencia del Carrito ---
function guardarCarrito() {
  localStorage.setItem(CK_KEYS.CART, JSON.stringify(state.carrito));
}

// --- Acciones del Carrito ---
function agregarAlCarrito(id: string) {
  const prod = PRODUCTOS.find(p => p.id === id);
  if (!prod) return;

  const existente = state.carrito.find(i => i.id === id);
  if (existente) {
    if (CONFIG.block_out_of_stock && existente.cantidad >= prod.stock) {
      mostrarToast(`Límite de stock alcanzado (${prod.stock} disponibles)`, 'warning');
      return;
    }
    existente.cantidad++;
  } else {
    if (CONFIG.block_out_of_stock && prod.stock <= 0) {
      mostrarToast(`Este producto se encuentra agotado`, 'warning');
      return;
    }
    state.carrito.push({ id, cantidad: 1 });
  }

  guardarCarrito();
  mostrarToast(`${prod.name} agregado al pedido`);
  render();
}

function cambiarCantidad(id: string, delta: number) {
  const item = state.carrito.find(i => i.id === id);
  if (!item) return;

  const prod = PRODUCTOS.find(p => p.id === id);
  if (!prod) return;

  if (delta > 0 && CONFIG.block_out_of_stock && item.cantidad >= prod.stock) {
    mostrarToast(`Límite de stock alcanzado (${prod.stock} disponibles)`, 'warning');
    return;
  }

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    state.carrito = state.carrito.filter(i => i.id !== id);
  }
  guardarCarrito();
  render();
}

function eliminarDelCarrito(id: string) {
  state.carrito = state.carrito.filter(i => i.id !== id);
  guardarCarrito();
  render();
}

function vaciarCarrito() {
  state.carrito = [];
  guardarCarrito();
  render();
}

function getCarritoCount(): number {
  return state.carrito.reduce((s, i) => s + i.cantidad, 0);
}

function getCarritoTotal(): number {
  return state.carrito.reduce((s, i) => {
    const prod = PRODUCTOS.find(p => p.id === i.id);
    return s + (prod ? prod.price * i.cantidad : 0);
  }, 0);
}

function getCantidadEnCarrito(id: string): number {
  const item = state.carrito.find(i => i.id === id);
  return item ? item.cantidad : 0;
}

// --- Filtrado y Búsqueda en Memoria (Búsqueda en < 1ms) ---
function getProductosFiltrados(): Product[] {
  let res = [...PRODUCTOS];
  const f = state.filtros;

  // Búsqueda en tiempo real
  if (f.busqueda.trim()) {
    const q = f.busqueda.toLowerCase().trim();
    res = res.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q)) ||
      (p.linea && p.linea.toLowerCase().includes(q))
    );
  }
  // Categoría (OR)
  if (f.categoria.length > 0) {
    res = res.filter(p => f.categoria.includes(p.categoria));
  }
  // Línea (OR)
  if (f.linea.length > 0) {
    res = res.filter(p => f.linea.includes(p.linea));
  }
  // Rango de precio
  if (f.precio) {
    const [min, max] = f.precio;
    res = res.filter(p => p.price >= min && p.price <= max);
  }
  // Ordenamiento
  switch (f.orden) {
    case 'precio-asc': res.sort((a, b) => a.price - b.price); break;
    case 'precio-desc': res.sort((a, b) => b.price - a.price); break;
    case 'nombre-asc': res.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'nombre-desc': res.sort((a, b) => b.name.localeCompare(a.name)); break;
  }
  return res;
}

function hayFiltrosActivos(): boolean {
  const f = state.filtros;
  return f.categoria.length > 0 || f.linea.length > 0 || f.precio !== null || f.busqueda.trim() !== '';
}

function limpiarFiltros() {
  state.filtros = { categoria: [], linea: [], precio: null, busqueda: '', orden: 'relevancia' };
  render();
}

function quitarFiltroCategoria(cat: string) {
  state.filtros.categoria = state.filtros.categoria.filter(c => c !== cat);
  render();
}

function quitarFiltroLinea(lin: string) {
  state.filtros.linea = state.filtros.linea.filter(l => l !== lin);
  render();
}

function quitarFiltroPrecio() {
  state.filtros.precio = null;
  render();
}

function toggleCategoriaFiltro(cat: string) {
  if (state.filtros.categoria.includes(cat)) {
    quitarFiltroCategoria(cat);
  } else {
    state.filtros.categoria.push(cat);
    render();
  }
}

function toggleLineaFiltro(lin: string) {
  if (state.filtros.linea.includes(lin)) {
    quitarFiltroLinea(lin);
  } else {
    state.filtros.linea.push(lin);
    render();
  }
}

function limpiarBusqueda() {
  state.filtros.busqueda = '';
  render();
  const inp = document.getElementById('search-input') as HTMLInputElement | null;
  if (inp) inp.focus();
}

// --- Toasts de Notificación ---
function mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success') {
  const container = document.getElementById('toasts');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo} animate-toast-in`;
  
  let icon = '<i class="fa-solid fa-circle-check"></i>';
  if (tipo === 'error') {
    icon = '<i class="fa-solid fa-circle-xmark"></i>';
  } else if (tipo === 'warning') {
    icon = '<i class="fa-solid fa-circle-exclamation"></i>';
  }
  
  toast.innerHTML = `${icon} <span>${escHtml(mensaje)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.className = `toast toast-${tipo} animate-toast-out`;
    setTimeout(() => toast.remove(), 260);
  }, 2300);
}

// --- Navegación SPA ---
function navegar(vista: string) {
  state.vista = vista;
  state.showCarrito = false;
  state.showFiltrosMovil = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function toggleCarrito() {
  state.showCarrito = !state.showCarrito;
  state.showFiltrosMovil = false;
  render();
}

function toggleFiltrosMovil() {
  state.showFiltrosMovil = !state.showFiltrosMovil;
  state.showCarrito = false;
  render();
}

// --- Enviar Pedido a Backend y WhatsApp ---
async function registrarYEnviar(datos: any, viaWhatsApp: boolean) {
  const total = getCarritoTotal();
  if (CONFIG.min_order > 0 && total < CONFIG.min_order) {
    mostrarToast(`El pedido no alcanza el monto mínimo requerido de ${fmt(CONFIG.min_order)}`, 'warning');
    return;
  }

  const payload = {
    doc_type: datos.doc_type,
    doc_number: datos.doc_number,
    name: datos.nombre,
    email: datos.email,
    phone: datos.telefono,
    address: datos.direccion,
    entrega: datos.entrega,
    referencias: datos.referencias,
    notas: datos.notas,
    items: state.carrito.map(item => ({ product_id: item.id, qty: item.cantidad }))
  };

  try {
    const res = await fetch('/api/public/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.message || 'Error al guardar el pedido');
    }

    const consecutivo = resData.order_number || (CONFIG.order_prefix + '0001');
    state.ultimoPedido = {
      numero: consecutivo,
      nombre: datos.nombre,
      telefono: datos.telefono,
      entrega: datos.entrega,
      fecha: new Date().toLocaleString('es-CO'),
      items: [...state.carrito],
      total: total
    };

    // Vaciar carrito
    state.carrito = [];
    guardarCarrito();

    if (viaWhatsApp) {
      let text = `*NUEVO PEDIDO ${consecutivo}*\n`;
      text += `*${CONFIG.store_name}*\n`;
      text += `_${new Date().toLocaleDateString('es-CO')}_\n\n`;
      text += `*Cliente:* ${datos.nombre}\n`;
      text += `*Documento:* ${datos.doc_type} ${datos.doc_number}\n`;
      text += `*Teléfono:* ${datos.telefono}\n`;
      text += `*Entrega:* ${datos.entrega}\n`;
      if (datos.direccion) text += `*Dirección:* ${datos.direccion}\n`;
      if (datos.referencias) text += `*Referencias:* ${datos.referencias}\n`;
      text += `\n*── PRODUCTOS ──*\n`;
      payload.items.forEach(item => {
        const prod = PRODUCTOS.find(p => p.id === item.product_id);
        if (prod) {
          text += `▸ ${prod.name} x${item.qty} ${prod.presentacion || 'und'} = ${fmt(prod.price * item.qty)}\n`;
        }
      });
      text += `\n*TOTAL: ${fmt(resData.total || total)}*\n`;
      if (datos.notas) text += `\n*Notas:* ${datos.notas}\n`;

      const targetWa = (CONFIG.whatsapp_number || '573000000000').replace(/\D/g, '');
      window.open(`https://wa.me/${targetWa}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      mostrarToast('¡Pedido registrado con éxito!');
    }

    navegar('confirmacion');
  } catch (err: any) {
    console.error(err);
    mostrarToast(err.message || 'Ocurrió un error al procesar el pedido.', 'error');
  }
}

// --- RENDERIZADO SPA ---
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  // Preservar foco si el usuario está tipeando en el buscador
  const activeId = document.activeElement?.id;
  const selectionStart = (document.activeElement as HTMLInputElement)?.selectionStart;
  const selectionEnd = (document.activeElement as HTMLInputElement)?.selectionEnd;

  let html = '';

  // Header siempre visible
  html += renderHeader();

  // Vista activa
  switch (state.vista) {
    case 'catalogo': html += renderCatalogo(); break;
    case 'checkout': html += renderCheckout(); break;
    case 'confirmacion': html += renderConfirmacion(); break;
  }

  // Drawer lateral del carrito
  if (state.showCarrito) {
    html += renderCarritoDrawer();
  }

  // Panel desplegable móvil de filtros
  if (state.showFiltrosMovil) {
    html += renderFiltrosMovil();
  }

  // Barra flotante inferior en móviles
  html += renderMobileCartBar();

  app.innerHTML = html;

  // Restaurar foco y posición del cursor
  if (activeId) {
    const el = document.getElementById(activeId) as HTMLInputElement | null;
    if (el) {
      el.focus();
      if (typeof selectionStart === 'number') {
        el.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}

// --- Componente: HEADER ---
function renderHeader() {
  const count = getCarritoCount();
  const logoUrl = CONFIG.logo;
  const nombre = CONFIG.store_name || 'GRAVY';

  return `
    <header class="cat-header">
      <div class="cat-header-inner">
        <!-- Logotipo / Identidad -->
        <a href="#" onclick="navegar('catalogo');return false;" class="logo-wrap">
          ${logoUrl ? `
            <img src="${logoUrl}" alt="${escHtml(nombre)}">
          ` : `
            <div class="logo-icon">
              <i class="fa-solid fa-store"></i>
            </div>
          `}
          <div>
            <div class="logo-name">${escHtml(nombre)}</div>
            <div class="logo-sub">Catálogo de Pedidos</div>
          </div>
        </a>

        <!-- Botón Volver y Carrito -->
        <div style="display:flex;align-items:center;gap:10px;">
          ${state.vista !== 'catalogo' ? `
            <button onclick="navegar('catalogo')" class="btn-outline" style="padding:8px 14px;font-size:13px;">
              <i class="fa-solid fa-arrow-left"></i> <span class="hidden sm:inline">Catálogo</span>
            </button>
          ` : ''}

          <button onclick="toggleCarrito()" class="header-cart-btn" aria-label="Abrir pedido">
            <i class="fa-solid fa-cart-shopping" style="font-size:18px;"></i>
            ${count > 0 ? `<span class="header-cart-badge">${count}</span>` : ''}
          </button>
        </div>
      </div>
    </header>`;
}

// --- Componente: HERO BANNER ---
function renderHero() {
  const logoUrl = CONFIG.logo;
  const searchVal = state.filtros.busqueda;

  return `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-title-row">
          <h1 class="hero-title">${escHtml(CONFIG.welcome_msg || 'Realiza tu Pedido')}</h1>
          ${logoUrl ? `
            <div class="hero-logo-wrap">
              <img src="${logoUrl}" class="hero-logo-img" alt="Logo">
            </div>
          ` : ''}
        </div>
        <p class="hero-desc">${escHtml(CONFIG.description || 'Explora nuestros productos y haz tu pedido en línea fácilmente.')}</p>

        <!-- Buscador con botón limpiar en tiempo real -->
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            id="search-input" 
            type="text" 
            placeholder="Buscar por nombre, código, categoría o línea..." 
            value="${escHtml(searchVal)}"
            oninput="state.filtros.busqueda=this.value;render();"
            autocomplete="off"
          >
          ${searchVal ? `
            <button type="button" class="search-clear-btn" onclick="limpiarBusqueda()" title="Borrar búsqueda">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : ''}
        </div>

        <!-- Chips de Categorías Rápidas -->
        ${CATEGORIAS.length > 0 ? `
          <div class="cat-chips">
            ${CATEGORIAS.map(cat => {
              const active = state.filtros.categoria.includes(cat);
              const catLower = cat.toLowerCase().trim();
              const icon = ICONOS_CATEGORIA[catLower] || 'fa-tag';
              return `
                <button type="button" class="cat-chip ${active ? 'active' : ''}" onclick="toggleCategoriaFiltro('${escHtml(cat)}')">
                  <i class="fa-solid ${icon}"></i> ${escHtml(cat)}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    </section>`;
}

// --- Vista: CATÁLOGO ---
function renderCatalogo() {
  const filtrados = getProductosFiltrados();
  const activos = hayFiltrosActivos();

  return `
    ${renderHero()}

    <!-- Toolbar de filtros activos y ordenamiento -->
    <div class="toolbar">
      <div class="toolbar-inner">
        <!-- Botón filtros para vista móvil -->
        <button type="button" onclick="toggleFiltrosMovil()" class="btn-outline md:hidden" style="padding:7px 12px;font-size:12.5px;">
          <i class="fa-solid fa-sliders"></i> Filtros
          ${activos ? `<span style="background:var(--accent);color:#fff;width:16px;height:16px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;margin-left:4px;">!</span>` : ''}
        </button>

        <!-- Tags de Filtros Activos -->
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;min-width:0;">
          ${state.filtros.categoria.map(cat => `
            <span class="active-filter-tag">${escHtml(cat)} <button onclick="quitarFiltroCategoria('${escHtml(cat)}')">&times;</button></span>
          `).join('')}
          ${state.filtros.linea.map(lin => `
            <span class="active-filter-tag">${escHtml(lin)} <button onclick="quitarFiltroLinea('${escHtml(lin)}')">&times;</button></span>
          `).join('')}
          ${state.filtros.precio ? `
            <span class="active-filter-tag">${RANGOS_PRECIO.find(r => r.value && r.value[0] === state.filtros.precio![0])?.label || 'Precio'} <button onclick="quitarFiltroPrecio()">&times;</button></span>
          ` : ''}
          ${activos ? `<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--danger);font-size:12px;font-weight:700;cursor:pointer;margin-left:4px;">Limpiar todo</button>` : ''}
        </div>

        <!-- Conteo de productos y Orden -->
        <div style="display:flex;align-items:center;gap:10px;margin-left:auto;flex-shrink:0;">
          <span style="font-size:13px;color:var(--text-sec);font-weight:600;">${filtrados.length} productos</span>
          <select 
            onchange="state.filtros.orden=this.value;render();"
            style="padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:13px;color:var(--text);background:#fff;outline:none;cursor:pointer;color-scheme:light;"
          >
            <option value="relevancia" ${state.filtros.orden === 'relevancia' ? 'selected' : ''}>Relevancia</option>
            <option value="precio-asc" ${state.filtros.orden === 'precio-asc' ? 'selected' : ''}>Precio: menor a mayor</option>
            <option value="precio-desc" ${state.filtros.orden === 'precio-desc' ? 'selected' : ''}>Precio: mayor a menor</option>
            <option value="nombre-asc" ${state.filtros.orden === 'nombre-asc' ? 'selected' : ''}>Nombre: A-Z</option>
            <option value="nombre-desc" ${state.filtros.orden === 'nombre-desc' ? 'selected' : ''}>Nombre: Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contenido: Sidebar filtros desktop + Grid de productos -->
    <div class="content-layout">
      <!-- Sidebar Desktop -->
      <aside class="filters-sidebar">
        <div class="filter-panel">
          ${renderFiltrosContenido()}
        </div>
      </aside>

      <!-- Grid de productos -->
      <main class="products-grid">
        ${filtrados.length === 0 ? `
          <div style="grid-column: 1/-1;text-align:center;padding:70px 20px;" class="animate-fade-in">
            <i class="fa-solid fa-box-open" style="font-size:52px;color:var(--border);margin-bottom:14px;display:block;"></i>
            <h3 style="font-size:18px;font-weight:800;margin-bottom:6px;">No se encontraron productos</h3>
            <p style="color:var(--text-sec);font-size:14px;margin-bottom:20px;">Intenta ajustar los filtros de búsqueda.</p>
            <button onclick="limpiarFiltros()" class="btn-primary" style="padding:10px 22px;font-size:13.5px;">Restablecer filtros</button>
          </div>
        ` : `
          ${filtrados.map(p => renderProductCard(p)).join('')}
        `}
      </main>
    </div>

    <!-- Footer -->
    <footer style="background:var(--card);border-top:1px solid var(--border);padding:28px 20px;text-align:center;color:var(--text-sec);font-size:13px;">
      <div style="max-width:1400px;margin:0 auto;">
        <div style="font-weight:800;font-size:15px;color:var(--text);margin-bottom:4px;">${escHtml(CONFIG.store_name || 'GRAVY')}</div>
        <div>${escHtml(CONFIG.company_address || '')} ${CONFIG.company_nit ? `&middot; NIT: ${escHtml(CONFIG.company_nit)}` : ''}</div>
        <div style="margin-top:6px;font-size:12px;opacity:0.8;">Catálogo de pedidos en línea &middot; ${new Date().getFullYear()}</div>
      </div>
    </footer>`;
}

// --- Componente: CONTENIDO DE FILTROS ---
function renderFiltrosContenido() {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h3 style="font-size:14px;font-weight:800;color:var(--text);"><i class="fa-solid fa-filter mr-1" style="color:var(--accent)"></i> Filtros</h3>
      ${hayFiltrosActivos() ? `<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--accent);font-size:12px;font-weight:700;cursor:pointer;">Limpiar</button>` : ''}
    </div>

    <!-- Categorías -->
    <div class="filter-section">
      <div class="filter-section-title">Categorías</div>
      ${CATEGORIAS.map(cat => {
        const checked = state.filtros.categoria.includes(cat);
        return `
          <label class="filter-label">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleCategoriaFiltro('${escHtml(cat)}')">
            <span>${escHtml(cat)}</span>
          </label>
        `;
      }).join('')}
    </div>

    <!-- Líneas -->
    <div class="filter-section">
      <div class="filter-section-title">Líneas de Producto</div>
      ${LINEAS.map(lin => {
        const checked = state.filtros.linea.includes(lin);
        return `
          <label class="filter-label">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleLineaFiltro('${escHtml(lin)}')">
            <span>${escHtml(lin)}</span>
          </label>
        `;
      }).join('')}
    </div>

    <!-- Rangos de Precio -->
    <div class="filter-section">
      <div class="filter-section-title">Rango de Precio</div>
      ${RANGOS_PRECIO.map((r, i) => `
        <label class="filter-label">
          <input type="radio" name="precio" ${state.filtros.precio === r.value ? 'checked' : ''}
            onchange="state.filtros.precio=${r.value === null ? 'null' : JSON.stringify(r.value)};render();">
          <span>${escHtml(r.label)}</span>
        </label>
      `).join('')}
    </div>`;
}

// --- Componente: TARJETA DE PRODUCTO (MAKAO CARD) ---
function renderProductCard(p: Product) {
  const qty = getCantidadEnCarrito(p.id);
  const isAgotado = p.stock <= 0;
  const badgeClass = getLineaBadgeClass(p.linea);

  return `
    <article class="product-card" aria-label="${escHtml(p.name)}">
      <div class="card-img-wrap">
        <img 
          src="${getProductImg(p)}" 
          alt="${escHtml(p.name)}" 
          loading="lazy"
          onerror="this.style.display='none';this.parentElement.innerHTML+='<div class=\\'card-img-placeholder\\'><i class=\\'fa-solid fa-box-open\\'></i></div>';"
        >
        ${p.linea ? `<span class="card-linea-badge ${badgeClass}">${escHtml(p.linea)}</span>` : ''}

        ${isAgotado ? `
          <div class="card-agotado-overlay">
            <span class="card-agotado-badge">Agotado</span>
          </div>
        ` : ''}
      </div>

      <div class="card-body">
        <div class="card-cat">${escHtml(p.categoria || 'General')}</div>
        <h2 class="card-name" title="${escHtml(p.name)}">${escHtml(p.name)}</h2>
        ${p.code ? `<div class="card-ref">REF: ${escHtml(p.code)}</div>` : ''}

        <div class="card-price-row">
          <span class="card-price">${fmt(p.price)}</span>
          <span class="card-unit">/ ${escHtml(p.presentacion || 'und')}</span>
        </div>

        <div style="margin-top:8px;">
          ${qty === 0 ? `
            <button 
              type="button" 
              class="btn-add" 
              onclick="agregarAlCarrito('${p.id}')"
              ${(isAgotado && CONFIG.block_out_of_stock) ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
            >
              <i class="fa-solid fa-plus"></i> Agregar
            </button>
          ` : `
            <div class="qty-controls">
              <button type="button" class="qty-btn" onclick="cambiarCantidad('${p.id}', -1)" aria-label="Disminuir">−</button>
              <div class="qty-val">${qty}</div>
              <button type="button" class="qty-btn" onclick="cambiarCantidad('${p.id}', 1)" aria-label="Aumentar">+</button>
            </div>
          `}
        </div>
      </div>
    </article>`;
}

// --- Componente: BARRA FLOTANTE MÓVIL ---
function renderMobileCartBar() {
  const count = getCarritoCount();
  if (count <= 0 || state.vista !== 'catalogo') return '';

  return `
    <div class="mobile-cart-bar" onclick="toggleCarrito()">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="mobile-cart-badge">${count}</span>
        <span style="font-weight:700;font-size:14px;">Ver pedido</span>
      </div>
      <div style="font-weight:900;font-size:15px;letter-spacing:-0.01em;">
        ${fmt(getCarritoTotal())}
      </div>
    </div>`;
}

// --- Componente: CAJÓN DESLIZANTE DEL CARRITO (DRAWER) ---
function renderCarritoDrawer() {
  const count = getCarritoCount();
  const total = getCarritoTotal();
  const vacio = count === 0;
  const cumpleMinimo = CONFIG.min_order <= 0 || total >= CONFIG.min_order;

  return `
    <div class="drawer-overlay" onclick="toggleCarrito()"></div>
    <div class="drawer" role="dialog" aria-label="Tu pedido">
      <!-- Header -->
      <div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <h2 style="font-size:18px;font-weight:800;color:var(--text);">Tu Pedido</h2>
          <div style="font-size:12px;color:var(--text-sec);font-weight:600;">${count} producto${count !== 1 ? 's' : ''} seleccionados</div>
        </div>
        <button onclick="toggleCarrito()" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-sec);padding:4px;" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      ${vacio ? `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;">
          <i class="fa-solid fa-cart-shopping" style="font-size:48px;color:var(--border);margin-bottom:16px;"></i>
          <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Tu pedido está vacío</h3>
          <p style="font-size:14px;color:var(--text-sec);margin-bottom:20px;">Agrega productos desde el catálogo para continuar.</p>
          <button onclick="toggleCarrito()" class="btn-primary" style="padding:10px 24px;">Explorar catálogo</button>
        </div>
      ` : `
        <!-- Lista de productos -->
        <div style="flex:1;overflow-y:auto;padding:16px 20px;">
          ${state.carrito.map(item => {
            const prod = PRODUCTOS.find(p => p.id === item.id);
            if (!prod) return '';
            return `
              <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center;">
                <div style="width:52px;height:52px;border-radius:var(--radius-md);overflow:hidden;flex-shrink:0;background:var(--bg-alt);border:1px solid var(--border);">
                  <img src="${getProductImg(prod)}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(prod.name)}</div>
                  <div style="font-size:12px;color:var(--text-sec);">${fmt(prod.price)} / ${escHtml(prod.presentacion || 'und')}</div>
                  <div style="display:flex;align-items:center;gap:10px;margin-top:6px;">
                    <div style="display:flex;align-items:center;border:1.5px solid var(--border);border-radius:6px;overflow:hidden;">
                      <button onclick="cambiarCantidad('${prod.id}',-1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:15px;font-weight:700;color:var(--text);" aria-label="Disminuir">−</button>
                      <span style="width:28px;text-align:center;font-size:13px;font-weight:700;">${item.cantidad}</span>
                      <button onclick="cambiarCantidad('${prod.id}',1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:15px;font-weight:700;color:var(--text);" aria-label="Aumentar">+</button>
                    </div>
                    <span style="font-size:14px;font-weight:800;color:var(--accent);">${fmt(prod.price * item.cantidad)}</span>
                  </div>
                </div>
                <button onclick="eliminarDelCarrito('${prod.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;" title="Eliminar">
                  <i class="fa-solid fa-trash-can" style="font-size:13px;"></i>
                </button>
              </div>`;
          }).join('')}
        </div>

        <!-- Totales y Botón Checkout -->
        <div style="padding:20px;border-top:1px solid var(--border);background:#ffffff;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:600;">Total a pagar</span>
            <span style="font-size:24px;font-weight:900;color:var(--accent);letter-spacing:-0.02em;">${fmt(total)}</span>
          </div>

          ${!cumpleMinimo ? `
            <div style="background:var(--warning-bg);color:var(--warning);padding:8px 12px;border-radius:8px;font-size:12px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>Pedido mínimo: ${fmt(CONFIG.min_order)} (Faltan ${fmt(CONFIG.min_order - total)})</span>
            </div>
          ` : ''}

          <button 
            type="button"
            onclick="state.showCarrito=false;navegar('checkout')" 
            class="btn-primary" 
            style="width:100%;margin-bottom:10px;"
            ${!cumpleMinimo ? 'disabled' : ''}
          >
            <i class="fa-solid fa-clipboard-check"></i> Proceder al Checkout
          </button>
          
          <button onclick="vaciarCarrito()" style="width:100%;background:none;border:none;color:var(--danger);font-size:12.5px;font-weight:700;cursor:pointer;padding:6px;">
            Vaciar pedido
          </button>
        </div>
      `}
    </div>`;
}

// --- Componente: PANEL MÓVIL DE FILTROS ---
function renderFiltrosMovil() {
  return `
    <div class="mobile-filter-overlay" onclick="toggleFiltrosMovil()"></div>
    <div class="mobile-filter-panel" role="dialog" aria-label="Filtros">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:800;">Filtros de Catálogo</h3>
        <button onclick="toggleFiltrosMovil()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-sec);" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      ${renderFiltrosContenido()}
      <div style="margin-top:20px;">
        <button onclick="toggleFiltrosMovil()" class="btn-primary" style="width:100%;">Aplicar y Ver Resultados</button>
      </div>
    </div>`;
}

// --- Vista: CHECKOUT ---
function renderCheckout() {
  const total = getCarritoTotal();
  const count = getCarritoCount();

  if (count === 0) {
    setTimeout(() => navegar('catalogo'), 0);
    return '';
  }

  return `
    <div style="max-width:1100px;margin:0 auto;padding:32px 20px 80px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button onclick="navegar('catalogo')" class="btn-outline" style="padding:8px 14px;font-size:13px;">
          <i class="fa-solid fa-arrow-left"></i> Volver
        </button>
        <h1 style="font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.02em;">Finalizar Pedido</h1>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:28px;align-items:start;">
        <!-- Formulario Datos del Cliente -->
        <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm);">
          <h2 style="font-size:16px;font-weight:800;margin-bottom:18px;color:var(--text);display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-user-check" style="color:var(--accent);"></i> Datos de Contacto y Entrega
          </h2>

          <form id="checkout-form" onsubmit="event.preventDefault();" style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:100px 1fr;gap:10px;">
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Tipo Doc. *</label>
                <select name="doc_type" class="form-input" required style="padding:11px 8px;color-scheme:light;">
                  <option value="CC">CC</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">CE</option>
                  <option value="PP">Pasaporte</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Número de Documento *</label>
                <input type="text" name="doc_number" class="form-input" placeholder="Ej: 1020304050" required>
              </div>
            </div>

            <div>
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Nombre Completo / Razón Social *</label>
              <input type="text" name="nombre" class="form-input" placeholder="Nombre y apellido" required>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Teléfono WhatsApp *</label>
                <input type="tel" name="telefono" class="form-input" placeholder="Ej: 3001234567" required>
              </div>
              <div>
                <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Correo (Opcional)</label>
                <input type="email" name="email" class="form-input" placeholder="cliente@correo.com">
              </div>
            </div>

            <div>
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Método de Entrega *</label>
              <select name="entrega" class="form-input" required style="color-scheme:light;">
                <option value="Entrega a domicilio">Entrega a domicilio</option>
                <option value="Recoger en tienda">Recoger en tienda / sede</option>
              </select>
            </div>

            <div id="direccion-field">
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Dirección de Entrega *</label>
              <input type="text" name="direccion" class="form-input" placeholder="Calle, número, apartamento, barrio" required>
            </div>

            <div>
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Referencias de Ubicación</label>
              <input type="text" name="referencias" class="form-input" placeholder="Ej: Casa blanca portón negro, frente al parque">
            </div>

            <div>
              <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Notas o Instrucciones del Pedido</label>
              <textarea name="notas" class="form-input" rows="2" placeholder="Observaciones particulares..."></textarea>
            </div>
          </form>
        </div>

        <!-- Resumen del Pedido -->
        <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm);position:sticky;top:90px;">
          <h2 style="font-size:16px;font-weight:800;margin-bottom:16px;color:var(--text);display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-receipt" style="color:var(--accent);"></i> Resumen de Compra
          </h2>

          <div style="max-height:260px;overflow-y:auto;margin-bottom:16px;padding-right:4px;">
            ${state.carrito.map(item => {
              const prod = PRODUCTOS.find(p => p.id === item.id);
              if (!prod) return '';
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
                  <div style="flex:1;min-width:0;padding-right:8px;">
                    <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(prod.name)}</div>
                    <div style="color:var(--text-sec);font-size:12px;">${item.cantidad} x ${fmt(prod.price)}</div>
                  </div>
                  <div style="font-weight:800;color:var(--text);">${fmt(prod.price * item.cantidad)}</div>
                </div>`;
            }).join('')}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:12px;border-top:2px solid var(--border);margin-bottom:20px;">
            <span style="font-size:15px;font-weight:800;">Total Pedido</span>
            <span style="font-size:26px;font-weight:900;color:var(--accent);">${fmt(total)}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <button id="btn-submit-whatsapp" type="button" onclick="manejarSubmit(null, 'whatsapp')" class="btn-whatsapp" style="width:100%;">
              <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> Confirmar y Enviar por WhatsApp
            </button>
            <button id="btn-submit-directo" type="button" onclick="manejarSubmit(null, 'directo')" class="btn-primary" style="width:100%;">
              <i class="fa-solid fa-check"></i> Registrar Pedido Directo
            </button>
          </div>

          <p style="font-size:11.5px;color:var(--text-sec);text-align:center;margin-top:14px;line-height:1.4;">
            Tu pedido se sincronizará automáticamente con el módulo de despachos y contabilidad de <strong>${escHtml(CONFIG.store_name)}</strong>.
          </p>
        </div>
      </div>
    </div>`;
}

// --- Vista: CONFIRMACIÓN ---
function renderConfirmacion() {
  const pedido = state.ultimoPedido;
  if (!pedido) {
    setTimeout(() => navegar('catalogo'), 0);
    return '';
  }

  return `
    <div style="max-width:620px;margin:0 auto;padding:60px 20px;text-align:center;" class="animate-fade-in">
      <div style="width:84px;height:84px;border-radius:50%;background:var(--accent-light);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;border:1px solid var(--accent);">
        <svg width="42" height="42" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" stroke="var(--accent)" stroke-width="3" opacity="0.2"/>
          <path d="M13 22 L19 28 L31 16" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
            style="stroke-dasharray:48;stroke-dashoffset:0;animation:checkDraw 0.6s ease 0.2s both;"/>
        </svg>
      </div>

      <h1 style="font-size:26px;font-weight:900;margin-bottom:6px;color:var(--text);">¡Pedido Registrado con Éxito!</h1>
      <p style="color:var(--text-sec);font-size:15px;margin-bottom:4px;">Número de orden:</p>
      <div style="font-size:24px;font-weight:900;color:var(--accent);margin-bottom:24px;letter-spacing:0.04em;">${pedido.numero}</div>

      <!-- Resumen de Confirmación -->
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:left;margin-bottom:24px;box-shadow:var(--shadow-sm);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:14px;">
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Cliente</div>
            <div style="font-weight:700;">${escHtml(pedido.nombre)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Teléfono</div>
            <div style="font-weight:700;">${escHtml(pedido.telefono)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Entrega</div>
            <div style="font-weight:700;">${escHtml(pedido.entrega)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Fecha</div>
            <div style="font-weight:700;">${pedido.fecha}</div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:10px;">
          <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;">
            <span>Total:</span>
            <span style="color:var(--accent);">${fmt(pedido.total)}</span>
          </div>
        </div>
      </div>

      <button onclick="navegar('catalogo')" class="btn-primary" style="padding:12px 30px;">
        <i class="fa-solid fa-bag-shopping"></i> Realizar otro pedido
      </button>
    </div>`;
}

// --- Manejador de Submit del Formulario de Checkout ---
async function manejarSubmit(e: any, modo: 'whatsapp' | 'directo') {
  if (e && e.preventDefault) e.preventDefault();
  const form = document.getElementById('checkout-form') as HTMLFormElement | null;
  if (!form) return false;

  const doc_type = (form.elements.namedItem('doc_type') as HTMLSelectElement)?.value || 'CC';
  const doc_number = (form.elements.namedItem('doc_number') as HTMLInputElement)?.value.trim() || '';
  const nombre = (form.elements.namedItem('nombre') as HTMLInputElement)?.value.trim() || '';
  const telefono = (form.elements.namedItem('telefono') as HTMLInputElement)?.value.trim() || '';
  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim() || '';
  const entrega = (form.elements.namedItem('entrega') as HTMLSelectElement)?.value || '';
  const direccion = (form.elements.namedItem('direccion') as HTMLInputElement)?.value.trim() || '';
  const referencias = (form.elements.namedItem('referencias') as HTMLInputElement)?.value.trim() || '';
  const notas = (form.elements.namedItem('notas') as HTMLTextAreaElement)?.value.trim() || '';

  if (!doc_number || !nombre || !telefono || !entrega) {
    mostrarToast('Por favor completa todos los campos requeridos (*)', 'warning');
    return false;
  }

  if (entrega === 'Entrega a domicilio' && !direccion) {
    mostrarToast('La dirección de entrega es obligatoria para envíos a domicilio', 'warning');
    return false;
  }

  const datos = {
    doc_type,
    doc_number,
    nombre,
    telefono,
    email,
    entrega,
    direccion,
    referencias,
    notas
  };

  const btnSubmit = document.getElementById('btn-submit-directo') as HTMLButtonElement | null;
  const btnWhatsapp = document.getElementById('btn-submit-whatsapp') as HTMLButtonElement | null;
  if (btnSubmit) btnSubmit.disabled = true;
  if (btnWhatsapp) btnWhatsapp.disabled = true;

  await registrarYEnviar(datos, modo === 'whatsapp');

  if (btnSubmit) btnSubmit.disabled = false;
  if (btnWhatsapp) btnWhatsapp.disabled = false;
  return false;
}

// --- CARGA SÍNCRONA LOCAL-FIRST & ASÍNCRONA DESDE POCKETBASE ---
function cargarCacheLocal() {
  try {
    const rawCfg = localStorage.getItem(CK_KEYS.CONFIG);
    if (rawCfg) {
      const parsedCfg = JSON.parse(rawCfg);
      CONFIG = { ...CONFIG, ...parsedCfg };
      aplicarTemaColor(CONFIG.accent_color);
      actualizarIdentidad(CONFIG);
    }

    const rawProds = localStorage.getItem(CK_KEYS.PRODUCTS);
    if (rawProds) {
      const parsedProds = JSON.parse(rawProds);
      if (Array.isArray(parsedProds) && parsedProds.length > 0) {
        PRODUCTOS = parsedProds;
        extraerCategoriasYLineas();
      }
    }
  } catch (err) {
    console.warn('Error al leer caché local inicial:', err);
  }
}

function extraerCategoriasYLineas() {
  const catsSet = new Set<string>();
  const linesSet = new Set<string>();
  PRODUCTOS.forEach(p => {
    if (p.categoria) catsSet.add(p.categoria);
    if (p.linea) linesSet.add(p.linea);
  });
  CATEGORIAS = Array.from(catsSet).sort();
  LINEAS = Array.from(linesSet).sort();
}

async function fetchStoreConfig() {
  try {
    const res = await fetch('/api/public/ecommerce/config');
    if (res.ok) {
      const freshConfig: StoreConfig = await res.json();
      CONFIG = { ...CONFIG, ...freshConfig };
      localStorage.setItem(CK_KEYS.CONFIG, JSON.stringify(CONFIG));
      aplicarTemaColor(CONFIG.accent_color);
      actualizarIdentidad(CONFIG);
      render();
    }
  } catch (err) {
    console.warn('No se pudo actualizar la configuración desde el servidor:', err);
  }
}

async function fetchCatalog() {
  try {
    const res = await fetch('/api/public/ecommerce/products');
    if (!res.ok) throw new Error('Error al conectar con la base de datos de productos.');
    const freshProducts: Product[] = await res.json();

    PRODUCTOS = freshProducts;
    localStorage.setItem(CK_KEYS.PRODUCTS, JSON.stringify(PRODUCTOS));

    // Sanitizar ítems del carrito que ya no existan
    const activeIds = new Set(PRODUCTOS.map(p => p.id));
    const prevLen = state.carrito.length;
    state.carrito = state.carrito.filter(i => activeIds.has(i.id));
    if (state.carrito.length !== prevLen) {
      guardarCarrito();
    }

    extraerCategoriasYLineas();
    render();
  } catch (err) {
    console.error(err);
    if (PRODUCTOS.length === 0) {
      mostrarToast('No se pudo cargar el catálogo de productos', 'error');
    }
  }
}

// --- Exponer funciones en el objeto Window ---
(window as any).state = state;
(window as any).render = render;
(window as any).navegar = navegar;
(window as any).toggleCarrito = toggleCarrito;
(window as any).toggleFiltrosMovil = toggleFiltrosMovil;
(window as any).agregarAlCarrito = agregarAlCarrito;
(window as any).cambiarCantidad = cambiarCantidad;
(window as any).eliminarDelCarrito = eliminarDelCarrito;
(window as any).vaciarCarrito = vaciarCarrito;
(window as any).limpiarFiltros = limpiarFiltros;
(window as any).limpiarBusqueda = limpiarBusqueda;
(window as any).quitarFiltroCategoria = quitarFiltroCategoria;
(window as any).quitarFiltroLinea = quitarFiltroLinea;
(window as any).quitarFiltroPrecio = quitarFiltroPrecio;
(window as any).toggleCategoriaFiltro = toggleCategoriaFiltro;
(window as any).toggleLineaFiltro = toggleLineaFiltro;
(window as any).manejarSubmit = manejarSubmit;

// --- Listeners de Eventos DOM ---
document.addEventListener('change', function(e) {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  if (target && target.name === 'entrega') {
    const dirField = document.getElementById('direccion-field');
    if (dirField) {
      const isDomicilio = target.value === 'Entrega a domicilio';
      dirField.style.display = isDomicilio ? 'block' : 'none';
      const inputEl = dirField.querySelector('input');
      if (inputEl) inputEl.required = isDomicilio;
    }
  }
  if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) {
    target.style.borderColor = '';
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (state.showCarrito) toggleCarrito();
    else if (state.showFiltrosMovil) toggleFiltrosMovil();
  }
});

// Inicialización: Render instantáneo con caché local y sincronización en segundo plano
document.addEventListener('DOMContentLoaded', async () => {
  cargarCacheLocal();
  render(); // Render instantáneo en 0ms
  await Promise.all([fetchStoreConfig(), fetchCatalog()]);
});
