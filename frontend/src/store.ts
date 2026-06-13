import './style.css';

// --- Interfaces ---
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

// --- Configuración ---
const WHATSAPP_NUMERO = '573000000000'; // Número de WhatsApp por defecto para despacho
const NOMBRE_TIENDA = 'GRAVY';

// --- Estado Global ---
const state = {
  vista: 'catalogo', // 'catalogo' | 'checkout' | 'confirmacion'
  carrito: JSON.parse(localStorage.getItem('pedido_carrito') || '[]') as Array<{ id: string; cantidad: number }>,
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

// --- Utilidades ---
function fmt(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n);
}

function getProductImg(p: Product): string {
  if (p.imageUrl) return p.imageUrl;
  return '/assets/gravy-logo.png'; // Fallback
}

function lineaClass(linea: string): string {
  return 'linea-' + (linea || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// --- Persistencia del Carrito ---
function guardarCarrito() {
  localStorage.setItem('pedido_carrito', JSON.stringify(state.carrito));
}

// --- Acciones del Carrito ---
function agregarAlCarrito(id: string) {
  const prod = PRODUCTOS.find(p => p.id === id);
  if (!prod) return;

  const existente = state.carrito.find(i => i.id === id);
  if (existente) {
    if (existente.cantidad >= prod.stock) {
      mostrarToast(`Límite de stock alcanzado (${prod.stock} disponibles)`, 'warning');
      return;
    }
    existente.cantidad++;
  } else {
    if (prod.stock <= 0) {
      mostrarToast(`Este producto está agotado`, 'warning');
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

  if (delta > 0 && item.cantidad >= prod.stock) {
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

// --- Filtrado y Ordenamiento ---
function getProductosFiltrados(): Product[] {
  let res = [...PRODUCTOS];
  const f = state.filtros;

  // Búsqueda
  if (f.busqueda.trim()) {
    const q = f.busqueda.toLowerCase().trim();
    res = res.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
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
  // Precio
  if (f.precio) {
    const [min, max] = f.precio;
    res = res.filter(p => p.price >= min && p.price <= max);
  }
  // Ordenar
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

// --- Toasts ---
function mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success') {
  const container = document.getElementById('toasts');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo} animate-toast-in`;
  
  let icon = '<i class="fa-solid fa-circle-check" style="color:#FFFFFF"></i>';
  if (tipo === 'error') {
    icon = '<i class="fa-solid fa-circle-xmark" style="color:#FFFFFF"></i>';
  } else if (tipo === 'warning') {
    icon = '<i class="fa-solid fa-circle-exclamation" style="color:#FFFFFF"></i>';
  }
  
  toast.innerHTML = `${icon} <span>${mensaje}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.className = `toast toast-${tipo} animate-toast-out`;
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// --- Navegación ---
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

// --- Envío de Pedido a Backend y WhatsApp ---
async function registrarYEnviar(datos: any, viaWhatsApp: boolean) {
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

    const consecutivo = resData.order_number || 'PED-ERR';
    state.ultimoPedido = {
      numero: consecutivo,
      nombre: datos.nombre,
      telefono: datos.telefono,
      entrega: datos.entrega,
      fecha: new Date().toLocaleString('es-CO'),
      items: [...state.carrito],
      total: getCarritoTotal()
    };

    // Vaciar carrito local
    state.carrito = [];
    guardarCarrito();

    if (viaWhatsApp) {
      // Generar texto estructurado para WhatsApp
      let text = `*NUEVO PEDIDO ${consecutivo}*\n`;
      text += `*${NOMBRE_TIENDA}*\n`;
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
      text += `\n*TOTAL: ${fmt(resData.total || getCarritoTotal())}*\n`;
      if (datos.notas) text += `\n*Notas:* ${datos.notas}\n`;

      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      mostrarToast('Pedido registrado con éxito');
    }

    navegar('confirmacion');
  } catch (err: any) {
    console.error(err);
    mostrarToast(err.message || 'Ocurrió un error al procesar el pedido.', 'error');
  }
}

// --- Renderizado SPA ---
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  // Respaldar foco y cursor del usuario si está escribiendo
  const activeId = document.activeElement?.id;
  const selectionStart = (document.activeElement as HTMLInputElement)?.selectionStart;
  const selectionEnd = (document.activeElement as HTMLInputElement)?.selectionEnd;

  let html = '';

  // Header siempre visible
  html += renderHeader();

  // Vista principal
  switch (state.vista) {
    case 'catalogo': html += renderCatalogo(); break;
    case 'checkout': html += renderCheckout(); break;
    case 'confirmacion': html += renderConfirmacion(); break;
  }

  // Drawer del carrito (overlay)
  if (state.showCarrito) {
    html += renderCarritoDrawer();
  }

  // Panel filtros móvil
  if (state.showFiltrosMovil) {
    html += renderFiltrosMovil();
  }

  app.innerHTML = html;

  // Restaurar foco y cursor
  if (activeId) {
    const el = document.getElementById(activeId) as HTMLInputElement;
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
  return `
    <header style="background:rgba(255,255,255,0.85);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);">
      <div style="max-width:1360px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:16px;">
        <!-- Logo -->
        <a href="#" onclick="navegar('catalogo');return false;" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text);flex-shrink:0;">
          <div style="width:38px;height:38px;background:linear-gradient(135deg, var(--accent), var(--accent-hover));border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-store" style="color:#FFFFFF;font-size:16px;"></i>
          </div>
          <div style="line-height:1.2;">
            <div style="font-weight:800;font-size:15px;letter-spacing:-0.02em;">${NOMBRE_TIENDA}</div>
            <div style="font-size:10px;color:var(--text-sec);font-weight:500;text-transform:uppercase;letter-spacing:0.06em;">Catálogo de Pedidos</div>
          </div>
        </a>

        <!-- Búsqueda (desktop) -->
        ${state.vista === 'catalogo' ? `
        <div style="flex:1;max-width:480px;margin:0 auto;position:relative;" class="hidden md:block">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-sec);font-size:14px;"></i>
          <input id="search-input" type="text" placeholder="Buscar productos..." value="${escHtml(state.filtros.busqueda)}"
            oninput="state.filtros.busqueda=this.value;render();"
            style="width:100%;padding:10px 16px 10px 40px;border:2px solid var(--border);border-radius:10px;font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);background:var(--bg);outline:none;transition:border-color 0.2s;"
            aria-label="Buscar productos">
        </div>` : ''}

        <!-- Acciones -->
        <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
          ${state.vista !== 'catalogo' ? `
          <button onclick="navegar('catalogo')" class="btn-outline" style="padding:8px 16px;font-size:13px;" aria-label="Volver al catálogo">
            <i class="fa-solid fa-arrow-left"></i> <span class="hidden sm:inline">Catálogo</span>
          </button>` : ''}

          <!-- Botón carrito -->
          <button onclick="toggleCarrito()" style="position:relative;background:none;border:2px solid var(--border);border-radius:10px;width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;color:var(--text);"
            onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
            onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text)'"
            aria-label="Abrir carrito de pedidos">
            <i class="fa-solid fa-cart-shopping" style="font-size:17px;"></i>
            ${count > 0 ? `<span id="cart-badge" style="position:absolute;top:-6px;right:-6px;background:var(--accent);color:#FFFFFF;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid var(--bg-alt);" class="animate-pulse-badge">${count}</span>` : ''}
          </button>
        </div>
      </div>
    </header>`;
}

// --- Vista: CATÁLOGO ---
function renderCatalogo() {
  const filtrados = getProductosFiltrados();
  const activos = hayFiltrosActivos();

  return `
    <!-- Hero -->
    <section style="position:relative;overflow:hidden;background:linear-gradient(135deg, #EEF4FF 0%, #E2ECFE 100%);padding:48px 20px 40px;border-bottom:1px solid var(--border);">
      <div class="hero-blob" style="width:300px;height:300px;background:var(--accent);top:-80px;right:10%;"></div>
      <div class="hero-blob" style="width:200px;height:200px;background:var(--accent-hover);bottom:-60px;left:5%;animation-delay:-4s;"></div>
      <div style="max-width:1360px;margin:0 auto;position:relative;z-index:2;">
        <h1 class="font-display" style="color:var(--text);font-size:clamp(28px,5vw,44px);font-weight:900;margin-bottom:8px;letter-spacing:-0.02em;">Realiza tu Pedido</h1>
        <p style="color:var(--text-sec);font-size:16px;max-width:500px;margin-bottom:24px;font-weight:300;">
          Explora los productos del catálogo, agrega lo que necesites y finaliza tu pedido de forma segura.
        </p>
        <!-- Búsqueda móvil -->
        <div style="position:relative;max-width:480px;" class="md:hidden">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-sec);font-size:14px;"></i>
          <input id="search-input-mobile" type="text" placeholder="Buscar productos..." value="${escHtml(state.filtros.busqueda)}"
            oninput="state.filtros.busqueda=this.value;render();"
            style="width:100%;padding:12px 16px 12px 40px;border:1px solid var(--border);border-radius:12px;font-family:'Outfit',sans-serif;font-size:15px;color:var(--text);background:var(--bg-alt);outline:none;"
            aria-label="Buscar productos">
        </div>
        <!-- Categorías rápidas -->
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">
          ${CATEGORIAS.map(cat => {
            const isSelected = state.filtros.categoria.includes(cat);
            const catLower = cat.toLowerCase().trim();
            const icon = ICONOS_CATEGORIA[catLower] || 'fa-tag';
            return `
              <button onclick="toggleCategoriaFiltro('${cat}')"
                style="padding:6px 14px;border-radius:20px;border:1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'};background:${isSelected ? 'var(--accent-light)' : 'transparent'};color:${isSelected ? 'var(--accent)' : 'var(--text)'};font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px;"
                aria-pressed="${isSelected}">
                <i class="fa-solid ${icon}" style="font-size:12px;"></i> ${cat}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- Barra de herramientas -->
    <div style="background:var(--bg-alt);border-bottom:1px solid var(--border);padding:12px 20px;position:sticky;top:63px;z-index:40;backdrop-filter:blur(8px);">
      <div style="max-width:1360px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <!-- Botón filtros móvil -->
        <button onclick="toggleFiltrosMovil()" class="md:hidden btn-outline" style="padding:8px 14px;font-size:13px;flex-shrink:0;">
          <i class="fa-solid fa-sliders"></i> Filtros
          ${activos ? `<span style="background:var(--accent);color:#FFFFFF;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;">!</span>` : ''}
        </button>

        <!-- Filtros activos -->
        <div style="display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0;">
          ${state.filtros.categoria.map(cat => `
            <span class="active-tag">${cat} <button onclick="quitarFiltroCategoria('${cat}')" aria-label="Quitar filtro ${cat}">&times;</button></span>
          `).join('')}
          ${state.filtros.linea.map(lin => `
            <span class="active-tag">${lin} <button onclick="quitarFiltroLinea('${lin}')" aria-label="Quitar filtro ${lin}">&times;</button></span>
          `).join('')}
          ${state.filtros.precio ? `
            <span class="active-tag">${RANGOS_PRECIO.find(r => r.value && r.value[0] === state.filtros.precio![0])?.label || 'Rango de precio'} <button onclick="quitarFiltroPrecio()" aria-label="Quitar filtro de precio">&times;</button></span>
          ` : ''}
          ${activos ? `<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--danger);font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;padding:4px 0;">Limpiar todo</button>` : ''}
        </div>

        <!-- Ordenar y conteo -->
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <span style="font-size:13px;color:var(--text-sec);white-space:nowrap;" class="hidden sm:inline">${filtrados.length} producto${filtrados.length !== 1 ? 's' : ''}</span>
          <select onchange="state.filtros.orden=this.value;render();"
            style="padding:7px 12px;border:2px solid var(--border);border-radius:8px;font-family:'Outfit',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none;cursor:pointer;color-scheme:light;"
            aria-label="Ordenar productos">
            <option value="relevancia" ${state.filtros.orden === 'relevancia' ? 'selected' : ''}>Relevancia</option>
            <option value="precio-asc" ${state.filtros.orden === 'precio-asc' ? 'selected' : ''}>Precio: menor a mayor</option>
            <option value="precio-desc" ${state.filtros.orden === 'precio-desc' ? 'selected' : ''}>Precio: mayor a menor</option>
            <option value="nombre-asc" ${state.filtros.orden === 'nombre-asc' ? 'selected' : ''}>Nombre: A-Z</option>
            <option value="nombre-desc" ${state.filtros.orden === 'nombre-desc' ? 'selected' : ''}>Nombre: Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contenido: Sidebar + Grid -->
    <div style="max-width:1360px;margin:0 auto;padding:24px 20px 60px;display:flex;gap:28px;">
      <!-- Sidebar filtros (desktop) -->
      <aside class="hidden md:block" style="width:250px;flex-shrink:0;">
        <div style="position:sticky;top:140px;">
          ${renderFiltrosContenido()}
        </div>
      </aside>

      <!-- Grid de productos -->
      <main style="flex:1;min-width:0;">
        ${filtrados.length === 0 ? `
          <div style="text-align:center;padding:80px 20px;" class="animate-fade-in">
            <i class="fa-solid fa-box-open" style="font-size:56px;color:var(--border);margin-bottom:16px;display:block;"></i>
            <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">No se encontraron productos</h3>
            <p style="color:var(--text-sec);margin-bottom:24px;">Intenta ajustar los filtros o buscar otro término.</p>
            <button onclick="limpiarFiltros()" class="btn-primary">Ver todos los productos</button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;">
            ${filtrados.map(p => renderProductCard(p)).join('')}
          </div>
        `}
      </main>
    </div>

    <!-- Footer -->
    <footer style="background:var(--bg-alt);color:var(--text-sec);padding:32px 20px;text-align:center;font-size:13px;border-top:1px solid var(--border);">
      <div style="max-width:1360px;margin:0 auto;">
        <div style="font-weight:700;color:var(--text);font-size:15px;margin-bottom:4px;">${NOMBRE_TIENDA}</div>
        <div>Catálogo de pedidos en línea &middot; ${new Date().getFullYear()}</div>
      </div>
    </footer>`;
}

// --- Componente: CONTENIDO DE FILTROS ---
function renderFiltrosContenido() {
  return `
    <div style="background:var(--card-glass);border:1px solid var(--border);border-radius:14px;padding:20px;backdrop-filter:blur(8px);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="font-size:16px;font-weight:700;">Filtros</h2>
        ${hayFiltrosActivos() ? `<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--accent);font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;">Limpiar</button>` : ''}
      </div>

      <!-- Categoría -->
      <div class="filter-section" style="margin-bottom:24px;">
        <h3>Categoría</h3>
        ${CATEGORIAS.map(cat => {
          const isChecked = state.filtros.categoria.includes(cat);
          const catLower = cat.toLowerCase().trim();
          const icon = ICONOS_CATEGORIA[catLower] || 'fa-tag';
          return `
            <label class="filter-check">
              <input type="checkbox" ${isChecked ? 'checked' : ''}
                onchange="toggleCategoriaFiltro('${cat}')">
              <i class="fa-solid ${icon}" style="font-size:12px;color:var(--text-sec);width:16px;text-align:center;"></i>
              ${cat}
            </label>
          `;
        }).join('')}
      </div>

      <!-- Línea -->
      <div class="filter-section" style="margin-bottom:24px;">
        <h3>Línea</h3>
        ${LINEAS.map(lin => {
          const isChecked = state.filtros.linea.includes(lin);
          return `
            <label class="filter-check">
              <input type="checkbox" ${isChecked ? 'checked' : ''}
                onchange="toggleLineaFiltro('${lin}')">
              ${lin}
            </label>
          `;
        }).join('')}
      </div>

      <!-- Precio -->
      <div class="filter-section">
        <h3>Rango de precio</h3>
        ${RANGOS_PRECIO.map((r, i) => `
          <label class="filter-radio">
            <input type="radio" name="precio" ${state.filtros.precio === r.value ? 'checked' : ''}
              onchange="state.filtros.precio=${r.value === null ? 'null' : JSON.stringify(r.value)};render();">
            ${r.label}
          </label>
        `).join('')}
      </div>
    </div>`;
}

// --- Componente: TARJETA DE PRODUCTO ---
function renderProductCard(p: Product) {
  const qty = getCantidadEnCarrito(p.id);
  const isOutOfStock = p.stock <= 0;

  // Badge de stock
  let stockBadge = '';
  if (isOutOfStock) {
    stockBadge = `<span class="badge-linea" style="background:rgba(239,68,68,0.15);color:#EF4444;border:1px solid rgba(239,68,68,0.3);right:10px;left:auto;top:10px;">Agotado</span>`;
  } else {
    stockBadge = `<span class="badge-linea" style="background:rgba(16,185,129,0.15);color:#34D399;border:1px solid rgba(16,185,129,0.3);right:10px;left:auto;top:10px;"><i class="fa-solid fa-box-open" style="font-size:10px;margin-right:4px;"></i>${p.stock} Disp.</span>`;
  }

  return `
    <article class="product-card animate-fade-in-up" aria-label="${escHtml(p.name)}">
      <div class="img-wrap">
        <img src="${getProductImg(p)}" alt="${escHtml(p.name)}" loading="lazy"
          onerror="this.style.display='none';this.parentElement.innerHTML+='<div style=\\'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg-alt);\\'><i class=\\'fa-solid fa-image\\' style=\\'font-size:40px;color:var(--border)\\'></i></div>';">
        <span class="badge-linea ${lineaClass(p.linea)}">${p.linea || 'Estándar'}</span>
        ${stockBadge}
      </div>
      <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:6px;">
        <div style="font-size:11px;color:var(--text-sec);font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">${p.categoria || 'General'}</div>
        <h3 style="font-size:14px;font-weight:600;line-height:1.35;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escHtml(p.name)}</h3>
        <div style="display:flex;align-items:baseline;gap:4px;margin-top:auto;">
          <span style="font-size:20px;font-weight:800;color:var(--accent);letter-spacing:-0.02em;">${fmt(p.price)}</span>
          <span style="font-size:12px;color:var(--text-sec);">/ ${p.presentacion || 'und'}</span>
        </div>
        ${qty === 0 ? `
          <button class="btn-add" onclick="agregarAlCarrito('${p.id}')" ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} aria-label="Agregar ${escHtml(p.name)} al carrito">
            <i class="fa-solid fa-plus" style="font-size:12px;"></i> Agregar
          </button>
        ` : `
          <div class="qty-controls">
            <button onclick="cambiarCantidad('${p.id}', -1)" aria-label="Reducir cantidad">−</button>
            <span>${qty}</span>
            <button onclick="cambiarCantidad('${p.id}', 1)" aria-label="Aumentar cantidad">+</button>
          </div>
        `}
      </div>
    </article>`;
}

// --- Componente: CAJÓN DEL CARRITO ---
function renderCarritoDrawer() {
  const vacio = state.carrito.length === 0;
  return `
    <div class="drawer-overlay" onclick="toggleCarrito()"></div>
    <div class="drawer animate-slide-right" role="dialog" aria-label="Carrito de pedidos">
      <!-- Header del drawer -->
      <div style="padding:20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <h2 style="font-size:18px;font-weight:800;">Tu pedido</h2>
          <div style="font-size:13px;color:var(--text-sec);">${getCarritoCount()} producto${getCarritoCount() !== 1 ? 's' : ''}</div>
        </div>
        <button onclick="toggleCarrito()" style="background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-sec);transition:all 0.15s;"
          onmouseenter="this.style.background='var(--bg)';this.style.color='var(--text)'"
          onmouseleave="this.style.background='none';this.style.color='var(--text-sec)'"
          aria-label="Cerrar carrito">
          <i class="fa-solid fa-xmark" style="font-size:20px;"></i>
        </button>
      </div>

      ${vacio ? `
        <!-- Estado vacío -->
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;">
          <i class="fa-solid fa-cart-shopping" style="font-size:48px;color:var(--border);margin-bottom:16px;"></i>
          <h3 style="font-size:16px;font-weight:700;margin-bottom:6px;">Tu pedido está vacío</h3>
          <p style="font-size:14px;color:var(--text-sec);margin-bottom:24px;">Agrega productos desde el catálogo</p>
          <button onclick="toggleCarrito()" class="btn-primary" style="padding:10px 24px;font-size:14px;">Ver catálogo</button>
        </div>
      ` : `
        <!-- Lista de items -->
        <div style="flex:1;overflow-y:auto;padding:16px 20px;">
          ${state.carrito.map(item => {
            const prod = PRODUCTOS.find(p => p.id === item.id);
            if (!prod) return '';
            return `
              <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center;" class="animate-fade-in">
                <div style="width:56px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0;background:var(--bg-alt);border:1px solid var(--border);">
                  <img src="${getProductImg(prod)}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(prod.name)}</div>
                  <div style="font-size:12px;color:var(--text-sec);">${fmt(prod.price)} / ${prod.presentacion || 'und'}</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <div style="display:flex;align-items:center;border:1.5px solid var(--border);border-radius:6px;overflow:hidden;">
                      <button onclick="cambiarCantidad('${prod.id}',-1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:14px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;" aria-label="Reducir cantidad">−</button>
                      <span style="width:28px;text-align:center;font-size:13px;font-weight:700;">${item.cantidad}</span>
                      <button onclick="cambiarCantidad('${prod.id}',1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:14px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <span style="font-size:14px;font-weight:700;color:var(--accent);">${fmt(prod.price * item.cantidad)}</span>
                  </div>
                </div>
                <button onclick="eliminarDelCarrito('${prod.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-sec);padding:4px;transition:color 0.15s;"
                  onmouseenter="this.style.color='var(--danger)'" onmouseleave="this.style.color='var(--text-sec)'"
                  aria-label="Eliminar ${escHtml(prod.name)}">
                  <i class="fa-solid fa-trash-can" style="font-size:13px;"></i>
                </button>
              </div>`;
          }).join('')}
        </div>

        <!-- Footer del drawer -->
        <div style="padding:20px;border-top:1px solid var(--border);flex-shrink:0;background:var(--bg-alt);">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:500;">Subtotal</span>
            <span style="font-size:18px;font-weight:700;color:var(--text);">${fmt(getCarritoTotal() / 1.19)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:500;">IVA Estimado (19%)</span>
            <span style="font-size:18px;font-weight:700;color:var(--text);">${fmt(getCarritoTotal() - (getCarritoTotal() / 1.19))}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;border-top:1px dashed var(--border);padding-top:12px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:500;">Total del pedido</span>
            <span style="font-size:24px;font-weight:900;color:var(--accent);letter-spacing:-0.02em;">${fmt(getCarritoTotal())}</span>
          </div>
          <button onclick="state.showCarrito=false;navegar('checkout')" class="btn-primary" style="width:100%;margin-bottom:10px;">
            <i class="fa-solid fa-clipboard-list"></i> Finalizar pedido
          </button>
          <button onclick="vaciarCarrito()" style="width:100%;background:none;border:none;color:var(--danger);font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;padding:8px;transition:opacity 0.15s;"
            onmouseenter="this.style.opacity='0.7'" onmouseleave="this.style.opacity='1'">
            Vaciar pedido
          </button>
        </div>
      `}
    </div>`;
}

// --- Componente: FILTROS MÓVIL ---
function renderFiltrosMovil() {
  return `
    <div class="mobile-filter-overlay" onclick="toggleFiltrosMovil()"></div>
    <div class="mobile-filter-panel animate-slide-up" role="dialog" aria-label="Filtros">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg-alt);z-index:2;border-radius:20px 20px 0 0;">
        <h2 style="font-size:16px;font-weight:700;">Filtros</h2>
        <button onclick="toggleFiltrosMovil()" style="background:none;border:none;cursor:pointer;width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--text-sec);" aria-label="Cerrar filtros">
          <i class="fa-solid fa-xmark" style="font-size:18px;"></i>
        </button>
      </div>
      <div style="padding:20px;">
        ${renderFiltrosContenido()}
      </div>
      <div style="padding:16px 20px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--bg-alt);">
        <button onclick="toggleFiltrosMovil()" class="btn-primary" style="width:100%;">
          Ver ${getProductosFiltrados().length} producto${getProductosFiltrados().length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>`;
}

// --- Vista: CHECKOUT ---
function renderCheckout() {
  if (state.carrito.length === 0) {
    setTimeout(() => navegar('catalogo'), 0);
    return '';
  }
  return `
    <div style="max-width:960px;margin:0 auto;padding:32px 20px 60px;" class="animate-fade-in-up">
      <button onclick="navegar('catalogo')" style="background:none;border:none;cursor:pointer;color:var(--text-sec);font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;display:flex;align-items:center;gap:6px;margin-bottom:24px;transition:color 0.15s;"
        onmouseenter="this.style.color='var(--text)'" onmouseleave="this.style.color='var(--text-sec)'">
        <i class="fa-solid fa-arrow-left"></i> Volver al catálogo
      </button>

      <h1 style="font-size:28px;font-weight:900;margin-bottom:4px;letter-spacing:-0.02em;">Finalizar pedido</h1>
      <p style="color:var(--text-sec);margin-bottom:32px;">Completa tus datos para enviar el pedido.</p>

      <div style="display:grid;grid-template-columns:1fr;gap:28px;" class="lg:grid-cols-checkout">
        <!-- Formulario -->
        <div>
          <div style="background:var(--card-glass);border:1px solid var(--border);border-radius:14px;padding:24px;backdrop-filter:blur(8px);">
            <h2 style="font-size:16px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-user" style="color:var(--accent);font-size:14px;"></i> Datos de contacto
            </h2>
            <form id="checkout-form" onsubmit="return false;">
              <div style="display:grid;gap:16px;">
                <!-- Documento (Requerido por Backend PocketBase) -->
                <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;">
                  <div>
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Tipo Doc. *</label>
                    <select name="doc_type" class="form-input" required style="height: 48px; color-scheme: light;">
                      <option value="CC" selected>Cédula (CC)</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">Extranjería (CE)</option>
                    </select>
                  </div>
                  <div>
                    <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Identificación *</label>
                    <input type="text" name="doc_number" class="form-input" placeholder="Número de Documento" required style="height: 48px;">
                  </div>
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Nombre completo / Razón Social *</label>
                  <input type="text" name="nombre" class="form-input" placeholder="Tu nombre" required>
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Teléfono *</label>
                  <input type="tel" name="telefono" class="form-input" placeholder="300 123 4567" required>
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Correo electrónico</label>
                  <input type="email" name="email" class="form-input" placeholder="correo@ejemplo.com">
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Método de entrega *</label>
                  <select name="entrega" class="form-input" required style="color-scheme: light;">
                    <option value="">Selecciona una opción</option>
                    <option value="Entrega a domicilio">Entrega a domicilio</option>
                    <option value="Recoger en tienda">Recoger en tienda</option>
                  </select>
                </div>
                <div id="direccion-field" style="display:none;">
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Dirección de entrega *</label>
                  <input type="text" name="direccion" class="form-input" placeholder="Calle, número, oficina, barrio">
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Referencias adicionales</label>
                  <input type="text" name="referencias" class="form-input" placeholder="Ej: Color de portón, indicaciones específicas">
                </div>
                <div>
                  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Notas del pedido</label>
                  <textarea name="notas" class="form-input" rows="3" placeholder="Instrucciones especiales, preferencias..." style="resize:vertical;min-height:80px;"></textarea>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Resumen -->
        <div>
          <div style="background:var(--card-glass);border:1px solid var(--border);border-radius:14px;padding:24px;position:sticky;top:90px;backdrop-filter:blur(8px);">
            <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-receipt" style="color:var(--accent);font-size:14px;"></i> Resumen del pedido
            </h2>
            <div style="max-height:280px;overflow-y:auto;margin-bottom:16px;">
              ${state.carrito.map(item => {
                const prod = PRODUCTOS.find(p => p.id === item.id);
                if (!prod) return '';
                return `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(prod.name)}</div>
                      <div style="color:var(--text-sec);font-size:12px;">${item.cantidad} x ${fmt(prod.price)}</div>
                    </div>
                    <div style="font-weight:700;flex-shrink:0;margin-left:8px;">${fmt(prod.price * item.cantidad)}</div>
                  </div>`;
              }).join('')}
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
              <span style="font-size:13px;color:var(--text-sec);">Subtotal</span>
              <span style="font-size:14px;font-weight:600;color:var(--text);">${fmt(getCarritoTotal() / 1.19)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">
              <span style="font-size:13px;color:var(--text-sec);">IVA (19%)</span>
              <span style="font-size:14px;font-weight:600;color:var(--text);">${fmt(getCarritoTotal() - (getCarritoTotal() / 1.19))}</span>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:12px;border-top:2px solid var(--border);">
              <span style="font-size:15px;font-weight:700;">Total</span>
              <span style="font-size:26px;font-weight:900;color:var(--accent);letter-spacing:-0.02em;">${fmt(getCarritoTotal())}</span>
            </div>
            
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px;">
              <button id="btn-submit-whatsapp" onclick="manejarSubmit(null, 'whatsapp')" class="btn-whatsapp" style="width:100%;">
                <i class="fa-brands fa-whatsapp" style="font-size:18px;"></i> Enviar por WhatsApp
              </button>
              <button id="btn-submit-directo" onclick="manejarSubmit(null, 'directo')" class="btn-primary" style="width:100%;">
                <i class="fa-solid fa-paper-plane"></i> Registrar pedido
              </button>
            </div>
            <p style="font-size:11px;color:var(--text-sec);text-align:center;margin-top:12px;">
              Al registrar el pedido, se guardará directamente en nuestro sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
    <style>.lg\:grid-cols-checkout{grid-template-columns:1fr 380px;}@media(max-width:1023px){.lg\:grid-cols-checkout{grid-template-columns:1fr;}}</style>`;
}

// --- Vista: CONFIRMACIÓN ---
function renderConfirmacion() {
  const pedido = state.ultimoPedido;
  if (!pedido) {
    setTimeout(() => navegar('catalogo'), 0);
    return '';
  }

  return `
    <div style="max-width:640px;margin:0 auto;padding:60px 20px;text-align:center;" class="animate-scale-in">
      <!-- Ícono de éxito -->
      <div style="width:88px;height:88px;border-radius:50%;background:var(--accent-light);margin:0 auto 24px;display:flex;align-items:center;justify-content:center;border: 1px solid var(--border);">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" stroke="var(--accent)" stroke-width="3" opacity="0.2"/>
          <path d="M13 22 L19 28 L31 16" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
            style="stroke-dasharray:48;stroke-dashoffset:0;animation:checkDraw 0.6s ease 0.3s both;"/>
        </svg>
      </div>

      <h1 style="font-size:28px;font-weight:900;margin-bottom:8px;letter-spacing:-0.02em;">Pedido registrado</h1>
      <p style="color:var(--text-sec);font-size:16px;margin-bottom:4px;">Tu número de pedido es:</p>
      <div style="font-size:24px;font-weight:900;color:var(--accent);margin-bottom:24px;letter-spacing:0.05em;">${pedido.numero}</div>

      <!-- Resumen compacto -->
      <div style="background:var(--card-glass);border:1px solid var(--border);border-radius:14px;padding:20px;text-align:left;margin-bottom:24px;backdrop-filter:blur(8px);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:14px;margin-bottom:16px;">
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Cliente</div>
            <div style="font-weight:600;">${escHtml(pedido.nombre)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Teléfono</div>
            <div style="font-weight:600;">${escHtml(pedido.telefono)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Entrega</div>
            <div style="font-weight:600;">${escHtml(pedido.entrega)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Fecha</div>
            <div style="font-weight:600;">${pedido.fecha}</div>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:12px;">
          ${pedido.items.map((item: any) => {
            const prod = PRODUCTOS.find(p => p.id === item.id);
            if (!prod) return '';
            return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
              <span>${escHtml(prod.name)} x${item.cantidad}</span>
              <span style="font-weight:600;">${fmt(prod.price * item.cantidad)}</span>
            </div>`;
          }).join('')}
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;padding-top:8px;margin-top:8px;border-top:2px solid var(--border);">
            <span>Total</span>
            <span style="color:var(--accent);">${fmt(pedido.total)}</span>
          </div>
        </div>
      </div>

      <button onclick="navegar('catalogo')" class="btn-primary" style="padding:14px 40px;">
        <i class="fa-solid fa-arrow-rotate-left"></i> Hacer otro pedido
      </button>
    </div>`;
}

// --- Escapar HTML ---
function escHtml(str: string): string {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Toggle filtros ---
window.toggleCategoriaFiltro = function(cat: string) {
  const idx = state.filtros.categoria.indexOf(cat);
  if (idx === -1) {
    state.filtros.categoria.push(cat);
  } else {
    state.filtros.categoria.splice(idx, 1);
  }
  render();
};

window.toggleLineaFiltro = function(lin: string) {
  const idx = state.filtros.linea.indexOf(lin);
  if (idx === -1) {
    state.filtros.linea.push(lin);
  } else {
    state.filtros.linea.splice(idx, 1);
  }
  render();
};

// --- Manejador del Formulario Submit ---
async function manejarSubmit(e: Event | null, modo: 'whatsapp' | 'directo') {
  if (e) e.preventDefault();
  const form = document.getElementById('checkout-form') as HTMLFormElement;
  if (!form) return false;

  // Extraer valores
  const doc_type = (form.elements.namedItem('doc_type') as HTMLSelectElement)?.value || 'CC';
  const doc_number = (form.elements.namedItem('doc_number') as HTMLInputElement)?.value.trim() || '';
  const nombre = (form.elements.namedItem('nombre') as HTMLInputElement)?.value.trim() || '';
  const telefono = (form.elements.namedItem('telefono') as HTMLInputElement)?.value.trim() || '';
  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim() || '';
  const entrega = (form.elements.namedItem('entrega') as HTMLSelectElement)?.value || '';
  const direccion = (form.elements.namedItem('direccion') as HTMLInputElement)?.value.trim() || '';
  const referencias = (form.elements.namedItem('referencias') as HTMLInputElement)?.value.trim() || '';
  const notas = (form.elements.namedItem('notas') as HTMLTextAreaElement)?.value.trim() || '';

  // Validaciones
  if (!doc_number || !nombre || !telefono || !entrega) {
    if (!doc_number) {
      const docNumEl = form.elements.namedItem('doc_number') as HTMLInputElement;
      if (docNumEl) docNumEl.style.borderColor = 'var(--danger)';
    }
    if (!nombre) {
      const nombreEl = form.elements.namedItem('nombre') as HTMLInputElement;
      if (nombreEl) nombreEl.style.borderColor = 'var(--danger)';
    }
    if (!telefono) {
      const telEl = form.elements.namedItem('telefono') as HTMLInputElement;
      if (telEl) telEl.style.borderColor = 'var(--danger)';
    }
    if (!entrega) {
      const entregaEl = form.elements.namedItem('entrega') as HTMLSelectElement;
      if (entregaEl) entregaEl.style.borderColor = 'var(--danger)';
    }
    mostrarToast('Completa los campos requeridos (*)', 'warning');
    return false;
  }

  if (entrega === 'Entrega a domicilio' && !direccion) {
    const dirEl = form.elements.namedItem('direccion') as HTMLInputElement;
    if (dirEl) dirEl.style.borderColor = 'var(--danger)';
    mostrarToast('La dirección de entrega es requerida para domicilio', 'warning');
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

  const btnSubmit = document.getElementById('btn-submit-directo') as HTMLButtonElement;
  const btnWhatsapp = document.getElementById('btn-submit-whatsapp') as HTMLButtonElement;
  if (btnSubmit) btnSubmit.disabled = true;
  if (btnWhatsapp) btnWhatsapp.disabled = true;

  await registrarYEnviar(datos, modo === 'whatsapp');

  if (btnSubmit) btnSubmit.disabled = false;
  if (btnWhatsapp) btnWhatsapp.disabled = false;
  
  return false;
}

// --- Carga Inicial de Productos ---
async function fetchCatalog() {
  try {
    const res = await fetch('/api/public/ecommerce/products');
    if (!res.ok) throw new Error('Error al conectar con la base de datos de productos.');
    PRODUCTOS = await res.json();
    
    // Extraer Categorías y Líneas dinámicamente de los productos
    const catsSet = new Set<string>();
    const linesSet = new Set<string>();
    PRODUCTOS.forEach(p => {
      if (p.categoria) catsSet.add(p.categoria);
      if (p.linea) linesSet.add(p.linea);
    });
    
    CATEGORIAS = Array.from(catsSet).sort();
    LINEAS = Array.from(linesSet).sort();

    render();
  } catch (err) {
    console.error(err);
    mostrarToast('No se pudo cargar el catálogo de productos', 'error');
  }
}

// --- Exponer funciones al objeto Window (para llamados onclick/onchange inline) ---
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
(window as any).quitarFiltroCategoria = quitarFiltroCategoria;
(window as any).quitarFiltroLinea = quitarFiltroLinea;
(window as any).quitarFiltroPrecio = quitarFiltroPrecio;
(window as any).manejarSubmit = manejarSubmit;

// --- Listeners de Eventos Generales ---
document.addEventListener('change', function(e) {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  if (target && target.name === 'entrega') {
    const dirField = document.getElementById('direccion-field');
    if (dirField) {
      const isDomicilio = target.value === 'Entrega a domicilio';
      dirField.style.display = isDomicilio ? 'block' : 'none';
      const inputEl = dirField.querySelector('input');
      if (inputEl) {
        inputEl.required = isDomicilio;
      }
    }
  }
  // Resetear color de borde si se corrige el valor
  if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) {
    target.style.borderColor = '';
  }
});

// Manejar escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (state.showCarrito) {
      toggleCarrito();
    } else if (state.showFiltrosMovil) {
      toggleFiltrosMovil();
    }
  }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  fetchCatalog();
});
