import"./style-CPLLjZYw.js";const w={PRODUCTS:"gravy_cached_products",CONFIG:"gravy_cached_store_cfg",CART:"pedido_carrito",LAST_ORDER:"pedido_ultimo"};let l={store_name:"GRAVY",whatsapp_number:"573000000000",accent_color:"#3D68A8",welcome_msg:"Revisa nuestro catálogo y haz tu pedido de forma fácil y rápida.",description:"Catálogo interactivo de productos y pedidos en línea.",min_order:0,order_prefix:"PED-",block_out_of_stock:!1,logo:""};const a={vista:"catalogo",carrito:JSON.parse(localStorage.getItem(w.CART)||"[]"),filtros:{categoria:[],linea:[],precio:null,busqueda:"",orden:"relevancia"},showCarrito:!1,showFiltrosMovil:!1,ultimoPedido:null};let u=[],z=[],M=[];const N=[{label:"Todos los precios",value:null},{label:"Hasta $50.000",value:[0,5e4]},{label:"$50.000 a $150.000",value:[5e4,15e4]},{label:"$150.000 a $300.000",value:[15e4,3e5]},{label:"Más de $300.000",value:[3e5,1/0]}],K={tecnologia:"fa-laptop",computadores:"fa-desktop",celulares:"fa-mobile-screen-button",relojes:"fa-clock",audio:"fa-headphones",mascotas:"fa-paw",spa:"fa-spa",aseo:"fa-soap",limpieza:"fa-hands-wash",comida:"fa-utensils",despensa:"fa-basket-shopping",bebidas:"fa-glass-water",licores:"fa-wine-bottle",salud:"fa-heart-pulse",belleza:"fa-wand-magic-sparkles",juguetes:"fa-gamepad",hogar:"fa-house-chimney",ferreteria:"fa-screwdriver-wrench"};function Z(e){let o=e.replace("#","").trim();o.length===3&&(o=o.split("").map(i=>i+i).join(""));const t=parseInt(o,16);return isNaN(t)?{r:61,g:104,b:168}:{r:t>>16&255,g:t>>8&255,b:t&255}}function I(e,o,t){const i=n=>Math.max(0,Math.min(255,Math.round(n))),r=n=>i(n).toString(16).padStart(2,"0");return"#"+r(e)+r(o)+r(t)}function O(e){if(typeof document>"u")return;const o=e||l.accent_color||"#3D68A8",t=Z(o),i=Math.floor(t.r*.18+8),r=Math.floor(t.g*.18+10),n=Math.floor(t.b*.22+18),p=I(i,r,n),c=Math.min(255,Math.floor(t.r*1.25+25)),g=Math.min(255,Math.floor(t.g*1.25+25)),b=Math.min(255,Math.floor(t.b*1.25+25)),h=I(c,g,b),k=Math.max(0,Math.floor(t.r*.82)),P=Math.max(0,Math.floor(t.g*.82)),x=Math.max(0,Math.floor(t.b*.82)),y=I(k,P,x),v=document.documentElement;v.style.setProperty("--accent",o),v.style.setProperty("--accent-hover",y),v.style.setProperty("--accent-dark",p),v.style.setProperty("--accent-bright",h),v.style.setProperty("--accent-glow",`rgba(${t.r}, ${t.g}, ${t.b}, 0.22)`),v.style.setProperty("--accent-light",`rgba(${t.r}, ${t.g}, ${t.b}, 0.14)`);const C=document.querySelector('meta[name="theme-color"]');C&&C.setAttribute("content",o)}function j(e){if(typeof document>"u")return;const o=(e.store_name||"GRAVY").trim(),t=(e.logo||"").trim(),i=e.accent_color||"#3D68A8";document.title=`${o} — Catálogo Interactivo`;const r=document.querySelector('meta[name="description"]');r&&r.setAttribute("content",e.description||`Catálogo de productos de ${o}.`);let n=document.getElementById("store-favicon");if(n||(n=document.createElement("link"),n.rel="icon",n.id="store-favicon",document.head.appendChild(n)),t&&(t.startsWith("http")||t.startsWith("data:")||t.startsWith("/")))n.href=t;else{const p=(o.charAt(0)||"G").toUpperCase(),c=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='${i}'/><text y='70' x='50' text-anchor='middle' font-size='56' fill='white' font-weight='900' font-family='sans-serif'>${p}</text></svg>`;n.href=`data:image/svg+xml,${encodeURIComponent(c)}`}}function f(e){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0,maximumFractionDigits:0}).format(e||0)}function s(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function B(e){return e.imageUrl?e.imageUrl:"/assets/gravy-logo.png"}function Q(e){const o=(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return o.includes("eco")?"badge-linea-eco":o.includes("pre")||o.includes("oro")||o.includes("vip")?"badge-linea-pre":"badge-linea-std"}function $(){localStorage.setItem(w.CART,JSON.stringify(a.carrito))}function X(e){const o=u.find(i=>i.id===e);if(!o)return;const t=a.carrito.find(i=>i.id===e);if(t){if(l.block_out_of_stock&&t.cantidad>=o.stock){m(`Límite de stock alcanzado (${o.stock} disponibles)`,"warning");return}t.cantidad++}else{if(l.block_out_of_stock&&o.stock<=0){m("Este producto se encuentra agotado","warning");return}a.carrito.push({id:e,cantidad:1})}$(),m(`${o.name} agregado al pedido`),d()}function ee(e,o){const t=a.carrito.find(r=>r.id===e);if(!t)return;const i=u.find(r=>r.id===e);if(i){if(o>0&&l.block_out_of_stock&&t.cantidad>=i.stock){m(`Límite de stock alcanzado (${i.stock} disponibles)`,"warning");return}t.cantidad+=o,t.cantidad<=0&&(a.carrito=a.carrito.filter(r=>r.id!==e)),$(),d()}}function te(e){a.carrito=a.carrito.filter(o=>o.id!==e),$(),d()}function oe(){a.carrito=[],$(),d()}function _(){return a.carrito.reduce((e,o)=>e+o.cantidad,0)}function E(){return a.carrito.reduce((e,o)=>{const t=u.find(i=>i.id===o.id);return e+(t?t.price*o.cantidad:0)},0)}function ie(e){const o=a.carrito.find(t=>t.id===e);return o?o.cantidad:0}function ae(){let e=[...u];const o=a.filtros;if(o.busqueda.trim()){const t=o.busqueda.toLowerCase().trim();e=e.filter(i=>i.name&&i.name.toLowerCase().includes(t)||i.code&&i.code.toLowerCase().includes(t)||i.categoria&&i.categoria.toLowerCase().includes(t)||i.linea&&i.linea.toLowerCase().includes(t))}if(o.categoria.length>0&&(e=e.filter(t=>o.categoria.includes(t.categoria))),o.linea.length>0&&(e=e.filter(t=>o.linea.includes(t.linea))),o.precio){const[t,i]=o.precio;e=e.filter(r=>r.price>=t&&r.price<=i)}switch(o.orden){case"precio-asc":e.sort((t,i)=>t.price-i.price);break;case"precio-desc":e.sort((t,i)=>i.price-t.price);break;case"nombre-asc":e.sort((t,i)=>t.name.localeCompare(i.name));break;case"nombre-desc":e.sort((t,i)=>i.name.localeCompare(t.name));break}return e}function G(){const e=a.filtros;return e.categoria.length>0||e.linea.length>0||e.precio!==null||e.busqueda.trim()!==""}function re(){a.filtros={categoria:[],linea:[],precio:null,busqueda:"",orden:"relevancia"},d()}function U(e){a.filtros.categoria=a.filtros.categoria.filter(o=>o!==e),d()}function H(e){a.filtros.linea=a.filtros.linea.filter(o=>o!==e),d()}function ne(){a.filtros.precio=null,d()}function se(e){a.filtros.categoria.includes(e)?U(e):(a.filtros.categoria.push(e),d())}function le(e){a.filtros.linea.includes(e)?H(e):(a.filtros.linea.push(e),d())}function ce(){a.filtros.busqueda="",d();const e=document.getElementById("search-input");e&&e.focus()}function m(e,o="success"){const t=document.getElementById("toasts");if(!t)return;const i=document.createElement("div");i.className=`toast toast-${o} animate-toast-in`;let r='<i class="fa-solid fa-circle-check"></i>';o==="error"?r='<i class="fa-solid fa-circle-xmark"></i>':o==="warning"&&(r='<i class="fa-solid fa-circle-exclamation"></i>'),i.innerHTML=`${r} <span>${s(e)}</span>`,t.appendChild(i),setTimeout(()=>{i.className=`toast toast-${o} animate-toast-out`,setTimeout(()=>i.remove(),260)},2300)}function F(e){a.vista=e,a.showCarrito=!1,a.showFiltrosMovil=!1,window.scrollTo({top:0,behavior:"smooth"}),d()}function V(){a.showCarrito=!a.showCarrito,a.showFiltrosMovil=!1,d()}function J(){a.showFiltrosMovil=!a.showFiltrosMovil,a.showCarrito=!1,d()}async function de(e,o){const t=E();if(l.min_order>0&&t<l.min_order){m(`El pedido no alcanza el monto mínimo requerido de ${f(l.min_order)}`,"warning");return}const i={doc_type:e.doc_type,doc_number:e.doc_number,name:e.nombre,email:e.email,phone:e.telefono,address:e.direccion,entrega:e.entrega,referencias:e.referencias,notas:e.notas,items:a.carrito.map(r=>({product_id:r.id,qty:r.cantidad}))};try{const r=await fetch("/api/public/ecommerce/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}),n=await r.json();if(!r.ok)throw new Error(n.message||"Error al guardar el pedido");const p=n.order_number||l.order_prefix+"0001";if(a.ultimoPedido={numero:p,nombre:e.nombre,telefono:e.telefono,entrega:e.entrega,fecha:new Date().toLocaleString("es-CO"),items:[...a.carrito],total:t},a.carrito=[],$(),o){let c=`*NUEVO PEDIDO ${p}*
`;c+=`*${l.store_name}*
`,c+=`_${new Date().toLocaleDateString("es-CO")}_

`,c+=`*Cliente:* ${e.nombre}
`,c+=`*Documento:* ${e.doc_type} ${e.doc_number}
`,c+=`*Teléfono:* ${e.telefono}
`,c+=`*Entrega:* ${e.entrega}
`,e.direccion&&(c+=`*Dirección:* ${e.direccion}
`),e.referencias&&(c+=`*Referencias:* ${e.referencias}
`),c+=`
*── PRODUCTOS ──*
`,i.items.forEach(b=>{const h=u.find(k=>k.id===b.product_id);h&&(c+=`▸ ${h.name} x${b.qty} ${h.presentacion||"und"} = ${f(h.price*b.qty)}
`)}),c+=`
*TOTAL: ${f(n.total||t)}*
`,e.notas&&(c+=`
*Notas:* ${e.notas}
`);const g=(l.whatsapp_number||"573000000000").replace(/\D/g,"");window.open(`https://wa.me/${g}?text=${encodeURIComponent(c)}`,"_blank")}else m("¡Pedido registrado con éxito!");F("confirmacion")}catch(r){console.error(r),m(r.message||"Ocurrió un error al procesar el pedido.","error")}}function d(){var n,p,c;const e=document.getElementById("app");if(!e)return;const o=(n=document.activeElement)==null?void 0:n.id,t=(p=document.activeElement)==null?void 0:p.selectionStart,i=(c=document.activeElement)==null?void 0:c.selectionEnd;let r="";switch(r+=pe(),a.vista){case"catalogo":r+=ue();break;case"checkout":r+=he();break;case"confirmacion":r+=xe();break}if(a.showCarrito&&(r+=ve()),a.showFiltrosMovil&&(r+=be()),r+=me(),e.innerHTML=r,o){const g=document.getElementById(o);g&&(g.focus(),typeof t=="number"&&g.setSelectionRange(t,i))}}function pe(){const e=_(),o=l.logo,t=l.store_name||"GRAVY";return`
    <header class="cat-header">
      <div class="cat-header-inner">
        <!-- Logotipo / Identidad -->
        <a href="#" onclick="navegar('catalogo');return false;" class="logo-wrap">
          ${o?`
            <img src="${o}" alt="${s(t)}">
          `:`
            <div class="logo-icon">
              <i class="fa-solid fa-store"></i>
            </div>
          `}
          <div>
            <div class="logo-name">${s(t)}</div>
            <div class="logo-sub">Catálogo de Pedidos</div>
          </div>
        </a>

        <!-- Botón Volver y Carrito -->
        <div style="display:flex;align-items:center;gap:10px;">
          ${a.vista!=="catalogo"?`
            <button onclick="navegar('catalogo')" class="btn-outline" style="padding:8px 14px;font-size:13px;">
              <i class="fa-solid fa-arrow-left"></i> <span class="hidden sm:inline">Catálogo</span>
            </button>
          `:""}

          <button onclick="toggleCarrito()" class="header-cart-btn" aria-label="Abrir pedido">
            <i class="fa-solid fa-cart-shopping" style="font-size:18px;"></i>
            ${e>0?`<span class="header-cart-badge">${e}</span>`:""}
          </button>
        </div>
      </div>
    </header>`}function fe(){const e=l.logo,o=a.filtros.busqueda;return`
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-title-row">
          <h1 class="hero-title">${s(l.welcome_msg||"Realiza tu Pedido")}</h1>
          ${e?`
            <div class="hero-logo-wrap">
              <img src="${e}" class="hero-logo-img" alt="Logo">
            </div>
          `:""}
        </div>
        <p class="hero-desc">${s(l.description||"Explora nuestros productos y haz tu pedido en línea fácilmente.")}</p>

        <!-- Buscador con botón limpiar en tiempo real -->
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            id="search-input" 
            type="text" 
            placeholder="Buscar por nombre, código, categoría o línea..." 
            value="${s(o)}"
            oninput="state.filtros.busqueda=this.value;render();"
            autocomplete="off"
          >
          ${o?`
            <button type="button" class="search-clear-btn" onclick="limpiarBusqueda()" title="Borrar búsqueda">
              <i class="fa-solid fa-xmark"></i>
            </button>
          `:""}
        </div>

        <!-- Chips de Categorías Rápidas -->
        ${z.length>0?`
          <div class="cat-chips">
            ${z.map(t=>{const i=a.filtros.categoria.includes(t),r=t.toLowerCase().trim(),n=K[r]||"fa-tag";return`
                <button type="button" class="cat-chip ${i?"active":""}" onclick="toggleCategoriaFiltro('${s(t)}')">
                  <i class="fa-solid ${n}"></i> ${s(t)}
                </button>
              `}).join("")}
          </div>
        `:""}
      </div>
    </section>`}function ue(){var t;const e=ae(),o=G();return`
    ${fe()}

    <!-- Toolbar de filtros activos y ordenamiento -->
    <div class="toolbar">
      <div class="toolbar-inner">
        <!-- Botón filtros para vista móvil -->
        <button type="button" onclick="toggleFiltrosMovil()" class="btn-outline md:hidden" style="padding:7px 12px;font-size:12.5px;">
          <i class="fa-solid fa-sliders"></i> Filtros
          ${o?'<span style="background:var(--accent);color:#fff;width:16px;height:16px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;margin-left:4px;">!</span>':""}
        </button>

        <!-- Tags de Filtros Activos -->
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;min-width:0;">
          ${a.filtros.categoria.map(i=>`
            <span class="active-filter-tag">${s(i)} <button onclick="quitarFiltroCategoria('${s(i)}')">&times;</button></span>
          `).join("")}
          ${a.filtros.linea.map(i=>`
            <span class="active-filter-tag">${s(i)} <button onclick="quitarFiltroLinea('${s(i)}')">&times;</button></span>
          `).join("")}
          ${a.filtros.precio?`
            <span class="active-filter-tag">${((t=N.find(i=>i.value&&i.value[0]===a.filtros.precio[0]))==null?void 0:t.label)||"Precio"} <button onclick="quitarFiltroPrecio()">&times;</button></span>
          `:""}
          ${o?'<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--danger);font-size:12px;font-weight:700;cursor:pointer;margin-left:4px;">Limpiar todo</button>':""}
        </div>

        <!-- Conteo de productos y Orden -->
        <div style="display:flex;align-items:center;gap:10px;margin-left:auto;flex-shrink:0;">
          <span style="font-size:13px;color:var(--text-sec);font-weight:600;">${e.length} productos</span>
          <select 
            onchange="state.filtros.orden=this.value;render();"
            style="padding:6px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:13px;color:var(--text);background:#fff;outline:none;cursor:pointer;color-scheme:light;"
          >
            <option value="relevancia" ${a.filtros.orden==="relevancia"?"selected":""}>Relevancia</option>
            <option value="precio-asc" ${a.filtros.orden==="precio-asc"?"selected":""}>Precio: menor a mayor</option>
            <option value="precio-desc" ${a.filtros.orden==="precio-desc"?"selected":""}>Precio: mayor a menor</option>
            <option value="nombre-asc" ${a.filtros.orden==="nombre-asc"?"selected":""}>Nombre: A-Z</option>
            <option value="nombre-desc" ${a.filtros.orden==="nombre-desc"?"selected":""}>Nombre: Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contenido: Sidebar filtros desktop + Grid de productos -->
    <div class="content-layout">
      <!-- Sidebar Desktop -->
      <aside class="filters-sidebar">
        <div class="filter-panel">
          ${Y()}
        </div>
      </aside>

      <!-- Grid de productos -->
      <main class="products-grid">
        ${e.length===0?`
          <div style="grid-column: 1/-1;text-align:center;padding:70px 20px;" class="animate-fade-in">
            <i class="fa-solid fa-box-open" style="font-size:52px;color:var(--border);margin-bottom:14px;display:block;"></i>
            <h3 style="font-size:18px;font-weight:800;margin-bottom:6px;">No se encontraron productos</h3>
            <p style="color:var(--text-sec);font-size:14px;margin-bottom:20px;">Intenta ajustar los filtros de búsqueda.</p>
            <button onclick="limpiarFiltros()" class="btn-primary" style="padding:10px 22px;font-size:13.5px;">Restablecer filtros</button>
          </div>
        `:`
          ${e.map(i=>ge(i)).join("")}
        `}
      </main>
    </div>

    <!-- Footer -->
    <footer style="background:var(--card);border-top:1px solid var(--border);padding:28px 20px;text-align:center;color:var(--text-sec);font-size:13px;">
      <div style="max-width:1400px;margin:0 auto;">
        <div style="font-weight:800;font-size:15px;color:var(--text);margin-bottom:4px;">${s(l.store_name||"GRAVY")}</div>
        <div>${s(l.company_address||"")} ${l.company_nit?`&middot; NIT: ${s(l.company_nit)}`:""}</div>
        <div style="margin-top:6px;font-size:12px;opacity:0.8;">Catálogo de pedidos en línea &middot; ${new Date().getFullYear()}</div>
      </div>
    </footer>`}function Y(){return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h3 style="font-size:14px;font-weight:800;color:var(--text);"><i class="fa-solid fa-filter mr-1" style="color:var(--accent)"></i> Filtros</h3>
      ${G()?'<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--accent);font-size:12px;font-weight:700;cursor:pointer;">Limpiar</button>':""}
    </div>

    <!-- Categorías -->
    <div class="filter-section">
      <div class="filter-section-title">Categorías</div>
      ${z.map(e=>`
          <label class="filter-label">
            <input type="checkbox" ${a.filtros.categoria.includes(e)?"checked":""} onchange="toggleCategoriaFiltro('${s(e)}')">
            <span>${s(e)}</span>
          </label>
        `).join("")}
    </div>

    <!-- Líneas -->
    <div class="filter-section">
      <div class="filter-section-title">Líneas de Producto</div>
      ${M.map(e=>`
          <label class="filter-label">
            <input type="checkbox" ${a.filtros.linea.includes(e)?"checked":""} onchange="toggleLineaFiltro('${s(e)}')">
            <span>${s(e)}</span>
          </label>
        `).join("")}
    </div>

    <!-- Rangos de Precio -->
    <div class="filter-section">
      <div class="filter-section-title">Rango de Precio</div>
      ${N.map((e,o)=>`
        <label class="filter-label">
          <input type="radio" name="precio" ${a.filtros.precio===e.value?"checked":""}
            onchange="state.filtros.precio=${e.value===null?"null":JSON.stringify(e.value)};render();">
          <span>${s(e.label)}</span>
        </label>
      `).join("")}
    </div>`}function ge(e){const o=ie(e.id),t=e.stock<=0,i=Q(e.linea);return`
    <article class="product-card" aria-label="${s(e.name)}">
      <div class="card-img-wrap">
        <img 
          src="${B(e)}" 
          alt="${s(e.name)}" 
          loading="lazy"
          onerror="this.style.display='none';this.parentElement.innerHTML+='<div class=\\'card-img-placeholder\\'><i class=\\'fa-solid fa-box-open\\'></i></div>';"
        >
        ${e.linea?`<span class="card-linea-badge ${i}">${s(e.linea)}</span>`:""}

        ${t?`
          <div class="card-agotado-overlay">
            <span class="card-agotado-badge">Agotado</span>
          </div>
        `:""}
      </div>

      <div class="card-body">
        <div class="card-cat">${s(e.categoria||"General")}</div>
        <h2 class="card-name" title="${s(e.name)}">${s(e.name)}</h2>
        ${e.code?`<div class="card-ref">REF: ${s(e.code)}</div>`:""}

        <div class="card-price-row">
          <span class="card-price">${f(e.price)}</span>
          <span class="card-unit">/ ${s(e.presentacion||"und")}</span>
        </div>

        <div style="margin-top:8px;">
          ${o===0?`
            <button 
              type="button" 
              class="btn-add" 
              onclick="agregarAlCarrito('${e.id}')"
              ${t&&l.block_out_of_stock?'disabled style="opacity:0.5;cursor:not-allowed;"':""}
            >
              <i class="fa-solid fa-plus"></i> Agregar
            </button>
          `:`
            <div class="qty-controls">
              <button type="button" class="qty-btn" onclick="cambiarCantidad('${e.id}', -1)" aria-label="Disminuir">−</button>
              <div class="qty-val">${o}</div>
              <button type="button" class="qty-btn" onclick="cambiarCantidad('${e.id}', 1)" aria-label="Aumentar">+</button>
            </div>
          `}
        </div>
      </div>
    </article>`}function me(){const e=_();return e<=0||a.vista!=="catalogo"?"":`
    <div class="mobile-cart-bar" onclick="toggleCarrito()">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="mobile-cart-badge">${e}</span>
        <span style="font-weight:700;font-size:14px;">Ver pedido</span>
      </div>
      <div style="font-weight:900;font-size:15px;letter-spacing:-0.01em;">
        ${f(E())}
      </div>
    </div>`}function ve(){const e=_(),o=E(),t=e===0,i=l.min_order<=0||o>=l.min_order;return`
    <div class="drawer-overlay" onclick="toggleCarrito()"></div>
    <div class="drawer" role="dialog" aria-label="Tu pedido">
      <!-- Header -->
      <div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <h2 style="font-size:18px;font-weight:800;color:var(--text);">Tu Pedido</h2>
          <div style="font-size:12px;color:var(--text-sec);font-weight:600;">${e} producto${e!==1?"s":""} seleccionados</div>
        </div>
        <button onclick="toggleCarrito()" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-sec);padding:4px;" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      ${t?`
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;">
          <i class="fa-solid fa-cart-shopping" style="font-size:48px;color:var(--border);margin-bottom:16px;"></i>
          <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Tu pedido está vacío</h3>
          <p style="font-size:14px;color:var(--text-sec);margin-bottom:20px;">Agrega productos desde el catálogo para continuar.</p>
          <button onclick="toggleCarrito()" class="btn-primary" style="padding:10px 24px;">Explorar catálogo</button>
        </div>
      `:`
        <!-- Lista de productos -->
        <div style="flex:1;overflow-y:auto;padding:16px 20px;">
          ${a.carrito.map(r=>{const n=u.find(p=>p.id===r.id);return n?`
              <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center;">
                <div style="width:52px;height:52px;border-radius:var(--radius-md);overflow:hidden;flex-shrink:0;background:var(--bg-alt);border:1px solid var(--border);">
                  <img src="${B(n)}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s(n.name)}</div>
                  <div style="font-size:12px;color:var(--text-sec);">${f(n.price)} / ${s(n.presentacion||"und")}</div>
                  <div style="display:flex;align-items:center;gap:10px;margin-top:6px;">
                    <div style="display:flex;align-items:center;border:1.5px solid var(--border);border-radius:6px;overflow:hidden;">
                      <button onclick="cambiarCantidad('${n.id}',-1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:15px;font-weight:700;color:var(--text);" aria-label="Disminuir">−</button>
                      <span style="width:28px;text-align:center;font-size:13px;font-weight:700;">${r.cantidad}</span>
                      <button onclick="cambiarCantidad('${n.id}',1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:15px;font-weight:700;color:var(--text);" aria-label="Aumentar">+</button>
                    </div>
                    <span style="font-size:14px;font-weight:800;color:var(--accent);">${f(n.price*r.cantidad)}</span>
                  </div>
                </div>
                <button onclick="eliminarDelCarrito('${n.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;" title="Eliminar">
                  <i class="fa-solid fa-trash-can" style="font-size:13px;"></i>
                </button>
              </div>`:""}).join("")}
        </div>

        <!-- Totales y Botón Checkout -->
        <div style="padding:20px;border-top:1px solid var(--border);background:#ffffff;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:600;">Total a pagar</span>
            <span style="font-size:24px;font-weight:900;color:var(--accent);letter-spacing:-0.02em;">${f(o)}</span>
          </div>

          ${i?"":`
            <div style="background:var(--warning-bg);color:var(--warning);padding:8px 12px;border-radius:8px;font-size:12px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>Pedido mínimo: ${f(l.min_order)} (Faltan ${f(l.min_order-o)})</span>
            </div>
          `}

          <button 
            type="button"
            onclick="state.showCarrito=false;navegar('checkout')" 
            class="btn-primary" 
            style="width:100%;margin-bottom:10px;"
            ${i?"":"disabled"}
          >
            <i class="fa-solid fa-clipboard-check"></i> Proceder al Checkout
          </button>
          
          <button onclick="vaciarCarrito()" style="width:100%;background:none;border:none;color:var(--danger);font-size:12.5px;font-weight:700;cursor:pointer;padding:6px;">
            Vaciar pedido
          </button>
        </div>
      `}
    </div>`}function be(){return`
    <div class="mobile-filter-overlay" onclick="toggleFiltrosMovil()"></div>
    <div class="mobile-filter-panel" role="dialog" aria-label="Filtros">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:800;">Filtros de Catálogo</h3>
        <button onclick="toggleFiltrosMovil()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-sec);" aria-label="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      ${Y()}
      <div style="margin-top:20px;">
        <button onclick="toggleFiltrosMovil()" class="btn-primary" style="width:100%;">Aplicar y Ver Resultados</button>
      </div>
    </div>`}function he(){const e=E();return _()===0?(setTimeout(()=>F("catalogo"),0),""):`
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
            ${a.carrito.map(t=>{const i=u.find(r=>r.id===t.id);return i?`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
                  <div style="flex:1;min-width:0;padding-right:8px;">
                    <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s(i.name)}</div>
                    <div style="color:var(--text-sec);font-size:12px;">${t.cantidad} x ${f(i.price)}</div>
                  </div>
                  <div style="font-weight:800;color:var(--text);">${f(i.price*t.cantidad)}</div>
                </div>`:""}).join("")}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:12px;border-top:2px solid var(--border);margin-bottom:20px;">
            <span style="font-size:15px;font-weight:800;">Total Pedido</span>
            <span style="font-size:26px;font-weight:900;color:var(--accent);">${f(e)}</span>
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
            Tu pedido se sincronizará automáticamente con el módulo de despachos y contabilidad de <strong>${s(l.store_name)}</strong>.
          </p>
        </div>
      </div>
    </div>`}function xe(){const e=a.ultimoPedido;return e?`
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
      <div style="font-size:24px;font-weight:900;color:var(--accent);margin-bottom:24px;letter-spacing:0.04em;">${e.numero}</div>

      <!-- Resumen de Confirmación -->
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px;text-align:left;margin-bottom:24px;box-shadow:var(--shadow-sm);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:14px;">
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Cliente</div>
            <div style="font-weight:700;">${s(e.nombre)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Teléfono</div>
            <div style="font-weight:700;">${s(e.telefono)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Entrega</div>
            <div style="font-weight:700;">${s(e.entrega)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:11px;font-weight:700;text-transform:uppercase;">Fecha</div>
            <div style="font-weight:700;">${e.fecha}</div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border);padding-top:10px;margin-top:10px;">
          <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;">
            <span>Total:</span>
            <span style="color:var(--accent);">${f(e.total)}</span>
          </div>
        </div>
      </div>

      <button onclick="navegar('catalogo')" class="btn-primary" style="padding:12px 30px;">
        <i class="fa-solid fa-bag-shopping"></i> Realizar otro pedido
      </button>
    </div>`:(setTimeout(()=>F("catalogo"),0),"")}async function ye(e,o){var v,C,S,T,R,q,D,L,A;e&&e.preventDefault&&e.preventDefault();const t=document.getElementById("checkout-form");if(!t)return!1;const i=((v=t.elements.namedItem("doc_type"))==null?void 0:v.value)||"CC",r=((C=t.elements.namedItem("doc_number"))==null?void 0:C.value.trim())||"",n=((S=t.elements.namedItem("nombre"))==null?void 0:S.value.trim())||"",p=((T=t.elements.namedItem("telefono"))==null?void 0:T.value.trim())||"",c=((R=t.elements.namedItem("email"))==null?void 0:R.value.trim())||"",g=((q=t.elements.namedItem("entrega"))==null?void 0:q.value)||"",b=((D=t.elements.namedItem("direccion"))==null?void 0:D.value.trim())||"",h=((L=t.elements.namedItem("referencias"))==null?void 0:L.value.trim())||"",k=((A=t.elements.namedItem("notas"))==null?void 0:A.value.trim())||"";if(!r||!n||!p||!g)return m("Por favor completa todos los campos requeridos (*)","warning"),!1;if(g==="Entrega a domicilio"&&!b)return m("La dirección de entrega es obligatoria para envíos a domicilio","warning"),!1;const P={doc_type:i,doc_number:r,nombre:n,telefono:p,email:c,entrega:g,direccion:b,referencias:h,notas:k},x=document.getElementById("btn-submit-directo"),y=document.getElementById("btn-submit-whatsapp");return x&&(x.disabled=!0),y&&(y.disabled=!0),await de(P,o==="whatsapp"),x&&(x.disabled=!1),y&&(y.disabled=!1),!1}function we(){try{const e=localStorage.getItem(w.CONFIG);if(e){const t=JSON.parse(e);l={...l,...t},O(l.accent_color),j(l)}const o=localStorage.getItem(w.PRODUCTS);if(o){const t=JSON.parse(o);Array.isArray(t)&&t.length>0&&(u=t,W())}}catch(e){console.warn("Error al leer caché local inicial:",e)}}function W(){const e=new Set,o=new Set;u.forEach(t=>{t.categoria&&e.add(t.categoria),t.linea&&o.add(t.linea)}),z=Array.from(e).sort(),M=Array.from(o).sort()}async function $e(){try{const e=await fetch("/api/public/ecommerce/config");if(e.ok){const o=await e.json();l={...l,...o},localStorage.setItem(w.CONFIG,JSON.stringify(l)),O(l.accent_color),j(l),d()}}catch(e){console.warn("No se pudo actualizar la configuración desde el servidor:",e)}}async function ke(){try{const e=await fetch("/api/public/ecommerce/products");if(!e.ok)throw new Error("Error al conectar con la base de datos de productos.");u=await e.json(),localStorage.setItem(w.PRODUCTS,JSON.stringify(u));const t=new Set(u.map(r=>r.id)),i=a.carrito.length;a.carrito=a.carrito.filter(r=>t.has(r.id)),a.carrito.length!==i&&$(),W(),d()}catch(e){console.error(e),u.length===0&&m("No se pudo cargar el catálogo de productos","error")}}window.state=a;window.render=d;window.navegar=F;window.toggleCarrito=V;window.toggleFiltrosMovil=J;window.agregarAlCarrito=X;window.cambiarCantidad=ee;window.eliminarDelCarrito=te;window.vaciarCarrito=oe;window.limpiarFiltros=re;window.limpiarBusqueda=ce;window.quitarFiltroCategoria=U;window.quitarFiltroLinea=H;window.quitarFiltroPrecio=ne;window.toggleCategoriaFiltro=se;window.toggleLineaFiltro=le;window.manejarSubmit=ye;document.addEventListener("change",function(e){const o=e.target;if(o&&o.name==="entrega"){const t=document.getElementById("direccion-field");if(t){const i=o.value==="Entrega a domicilio";t.style.display=i?"block":"none";const r=t.querySelector("input");r&&(r.required=i)}}o&&(o.tagName==="INPUT"||o.tagName==="SELECT")&&(o.style.borderColor="")});document.addEventListener("keydown",function(e){e.key==="Escape"&&(a.showCarrito?V():a.showFiltrosMovil&&J())});document.addEventListener("DOMContentLoaded",async()=>{we(),d(),await Promise.all([$e(),ke()])});
