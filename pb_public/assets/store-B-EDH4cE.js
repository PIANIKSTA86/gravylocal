import"./style-CkevYgIj.js";const G="573000000000",C="GRAVY",a={vista:"catalogo",carrito:JSON.parse(localStorage.getItem("pedido_carrito")||"[]"),filtros:{categoria:[],linea:[],precio:null,busqueda:"",orden:"relevancia"},showCarrito:!1,showFiltrosMovil:!1,ultimoPedido:null};let u=[],z=[],A=[];const D=[{label:"Todos los precios",value:null},{label:"Hasta $50.000",value:[0,5e4]},{label:"$50.000 a $150.000",value:[5e4,15e4]},{label:"$150.000 a $300.000",value:[15e4,3e5]},{label:"Más de $300.000",value:[3e5,1/0]}],N={tecnologia:"fa-laptop",computadores:"fa-desktop",celulares:"fa-mobile-screen-button",relojes:"fa-clock",audio:"fa-headphones",mascotas:"fa-paw",spa:"fa-spa",aseo:"fa-soap",limpieza:"fa-hands-wash",comida:"fa-utensils",despensa:"fa-basket-shopping",bebidas:"fa-glass-water",licores:"fa-wine-bottle",salud:"fa-heart-pulse",belleza:"fa-wand-magic-sparkles",juguetes:"fa-gamepad",hogar:"fa-house-chimney",ferreteria:"fa-screwdriver-wrench"};function s(e){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0,maximumFractionDigits:0}).format(e)}function R(e){return e.imageUrl?e.imageUrl:"/assets/gravy-logo.png"}function Y(e){return"linea-"+(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function b(){localStorage.setItem("pedido_carrito",JSON.stringify(a.carrito))}function J(e){const i=u.find(o=>o.id===e);if(!i)return;const t=a.carrito.find(o=>o.id===e);if(t){if(t.cantidad>=i.stock){m(`Límite de stock alcanzado (${i.stock} disponibles)`,"warning");return}t.cantidad++}else{if(i.stock<=0){m("Este producto está agotado","warning");return}a.carrito.push({id:e,cantidad:1})}b(),m(`${i.name} agregado al pedido`),l()}function Q(e,i){const t=a.carrito.find(r=>r.id===e);if(!t)return;const o=u.find(r=>r.id===e);if(o){if(i>0&&t.cantidad>=o.stock){m(`Límite de stock alcanzado (${o.stock} disponibles)`,"warning");return}t.cantidad+=i,t.cantidad<=0&&(a.carrito=a.carrito.filter(r=>r.id!==e)),b(),l()}}function W(e){a.carrito=a.carrito.filter(i=>i.id!==e),b(),l()}function Z(){a.carrito=[],b(),l()}function k(){return a.carrito.reduce((e,i)=>e+i.cantidad,0)}function g(){return a.carrito.reduce((e,i)=>{const t=u.find(o=>o.id===i.id);return e+(t?t.price*i.cantidad:0)},0)}function K(e){const i=a.carrito.find(t=>t.id===e);return i?i.cantidad:0}function $(){let e=[...u];const i=a.filtros;if(i.busqueda.trim()){const t=i.busqueda.toLowerCase().trim();e=e.filter(o=>o.name.toLowerCase().includes(t)||o.code.toLowerCase().includes(t)||o.categoria&&o.categoria.toLowerCase().includes(t)||o.linea&&o.linea.toLowerCase().includes(t))}if(i.categoria.length>0&&(e=e.filter(t=>i.categoria.includes(t.categoria))),i.linea.length>0&&(e=e.filter(t=>i.linea.includes(t.linea))),i.precio){const[t,o]=i.precio;e=e.filter(r=>r.price>=t&&r.price<=o)}switch(i.orden){case"precio-asc":e.sort((t,o)=>t.price-o.price);break;case"precio-desc":e.sort((t,o)=>o.price-t.price);break;case"nombre-asc":e.sort((t,o)=>t.name.localeCompare(o.name));break;case"nombre-desc":e.sort((t,o)=>o.name.localeCompare(t.name));break}return e}function P(){const e=a.filtros;return e.categoria.length>0||e.linea.length>0||e.precio!==null||e.busqueda.trim()!==""}function X(){a.filtros={categoria:[],linea:[],precio:null,busqueda:"",orden:"relevancia"},l()}function ee(e){a.filtros.categoria=a.filtros.categoria.filter(i=>i!==e),l()}function te(e){a.filtros.linea=a.filtros.linea.filter(i=>i!==e),l()}function ie(){a.filtros.precio=null,l()}function m(e,i="success"){const t=document.getElementById("toasts");if(!t)return;const o=document.createElement("div");o.className=`toast toast-${i} animate-toast-in`;let r='<i class="fa-solid fa-circle-check" style="color:#FFFFFF"></i>';i==="error"?r='<i class="fa-solid fa-circle-xmark" style="color:#FFFFFF"></i>':i==="warning"&&(r='<i class="fa-solid fa-circle-exclamation" style="color:#FFFFFF"></i>'),o.innerHTML=`${r} <span>${e}</span>`,t.appendChild(o),setTimeout(()=>{o.className=`toast toast-${i} animate-toast-out`,setTimeout(()=>o.remove(),300)},2200)}function w(e){a.vista=e,a.showCarrito=!1,a.showFiltrosMovil=!1,window.scrollTo({top:0,behavior:"smooth"}),l()}function _(){a.showCarrito=!a.showCarrito,a.showFiltrosMovil=!1,l()}function M(){a.showFiltrosMovil=!a.showFiltrosMovil,a.showCarrito=!1,l()}async function oe(e,i){const t={doc_type:e.doc_type,doc_number:e.doc_number,name:e.nombre,email:e.email,phone:e.telefono,address:e.direccion,entrega:e.entrega,referencias:e.referencias,notas:e.notas,items:a.carrito.map(o=>({product_id:o.id,qty:o.cantidad}))};try{const o=await fetch("/api/public/ecommerce/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),r=await o.json();if(!o.ok)throw new Error(r.message||"Error al guardar el pedido");const f=r.order_number||"PED-ERR";if(a.ultimoPedido={numero:f,nombre:e.nombre,telefono:e.telefono,entrega:e.entrega,fecha:new Date().toLocaleString("es-CO"),items:[...a.carrito],total:g()},a.carrito=[],b(),i){let n=`*NUEVO PEDIDO ${f}*
`;n+=`*${C}*
`,n+=`_${new Date().toLocaleDateString("es-CO")}_

`,n+=`*Cliente:* ${e.nombre}
`,n+=`*Documento:* ${e.doc_type} ${e.doc_number}
`,n+=`*Teléfono:* ${e.telefono}
`,n+=`*Entrega:* ${e.entrega}
`,e.direccion&&(n+=`*Dirección:* ${e.direccion}
`),e.referencias&&(n+=`*Referencias:* ${e.referencias}
`),n+=`
*── PRODUCTOS ──*
`,t.items.forEach(x=>{const c=u.find(v=>v.id===x.product_id);c&&(n+=`▸ ${c.name} x${x.qty} ${c.presentacion||"und"} = ${s(c.price*x.qty)}
`)}),n+=`
*TOTAL: ${s(r.total||g())}*
`,e.notas&&(n+=`
*Notas:* ${e.notas}
`),window.open(`https://wa.me/${G}?text=${encodeURIComponent(n)}`,"_blank")}else m("Pedido registrado con éxito");w("confirmacion")}catch(o){console.error(o),m(o.message||"Ocurrió un error al procesar el pedido.","error")}}function l(){var f,n,x;const e=document.getElementById("app");if(!e)return;const i=(f=document.activeElement)==null?void 0:f.id,t=(n=document.activeElement)==null?void 0:n.selectionStart,o=(x=document.activeElement)==null?void 0:x.selectionEnd;let r="";switch(r+=ae(),a.vista){case"catalogo":r+=re();break;case"checkout":r+=de();break;case"confirmacion":r+=ce();break}if(a.showCarrito&&(r+=se()),a.showFiltrosMovil&&(r+=le()),e.innerHTML=r,i){const c=document.getElementById(i);c&&(c.focus(),typeof t=="number"&&c.setSelectionRange(t,o))}}function ae(){const e=k();return`
    <header style="background:rgba(255,255,255,0.85);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);">
      <div style="max-width:1360px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:16px;">
        <!-- Logo -->
        <a href="#" onclick="navegar('catalogo');return false;" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text);flex-shrink:0;">
          <div style="width:38px;height:38px;background:linear-gradient(135deg, var(--accent), var(--accent-hover));border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <i class="fa-solid fa-store" style="color:#FFFFFF;font-size:16px;"></i>
          </div>
          <div style="line-height:1.2;">
            <div style="font-weight:800;font-size:15px;letter-spacing:-0.02em;">${C}</div>
            <div style="font-size:10px;color:var(--text-sec);font-weight:500;text-transform:uppercase;letter-spacing:0.06em;">Catálogo de Pedidos</div>
          </div>
        </a>

        <!-- Búsqueda (desktop) -->
        ${a.vista==="catalogo"?`
        <div style="flex:1;max-width:480px;margin:0 auto;position:relative;" class="hidden md:block">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-sec);font-size:14px;"></i>
          <input id="search-input" type="text" placeholder="Buscar productos..." value="${p(a.filtros.busqueda)}"
            oninput="state.filtros.busqueda=this.value;render();"
            style="width:100%;padding:10px 16px 10px 40px;border:2px solid var(--border);border-radius:10px;font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);background:var(--bg);outline:none;transition:border-color 0.2s;"
            aria-label="Buscar productos">
        </div>`:""}

        <!-- Acciones -->
        <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
          ${a.vista!=="catalogo"?`
          <button onclick="navegar('catalogo')" class="btn-outline" style="padding:8px 16px;font-size:13px;" aria-label="Volver al catálogo">
            <i class="fa-solid fa-arrow-left"></i> <span class="hidden sm:inline">Catálogo</span>
          </button>`:""}

          <!-- Botón carrito -->
          <button onclick="toggleCarrito()" style="position:relative;background:none;border:2px solid var(--border);border-radius:10px;width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;color:var(--text);"
            onmouseenter="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
            onmouseleave="this.style.borderColor='var(--border)';this.style.color='var(--text)'"
            aria-label="Abrir carrito de pedidos">
            <i class="fa-solid fa-cart-shopping" style="font-size:17px;"></i>
            ${e>0?`<span id="cart-badge" style="position:absolute;top:-6px;right:-6px;background:var(--accent);color:#FFFFFF;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid var(--bg-alt);" class="animate-pulse-badge">${e}</span>`:""}
          </button>
        </div>
      </div>
    </header>`}function re(){var t;const e=$(),i=P();return`
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
          <input id="search-input-mobile" type="text" placeholder="Buscar productos..." value="${p(a.filtros.busqueda)}"
            oninput="state.filtros.busqueda=this.value;render();"
            style="width:100%;padding:12px 16px 12px 40px;border:1px solid var(--border);border-radius:12px;font-family:'Outfit',sans-serif;font-size:15px;color:var(--text);background:var(--bg-alt);outline:none;"
            aria-label="Buscar productos">
        </div>
        <!-- Categorías rápidas -->
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">
          ${z.map(o=>{const r=a.filtros.categoria.includes(o),f=o.toLowerCase().trim(),n=N[f]||"fa-tag";return`
              <button onclick="toggleCategoriaFiltro('${o}')"
                style="padding:6px 14px;border-radius:20px;border:1.5px solid ${r?"var(--accent)":"var(--border)"};background:${r?"var(--accent-light)":"transparent"};color:${r?"var(--accent)":"var(--text)"};font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:6px;"
                aria-pressed="${r}">
                <i class="fa-solid ${n}" style="font-size:12px;"></i> ${o}
              </button>
            `}).join("")}
        </div>
      </div>
    </section>

    <!-- Barra de herramientas -->
    <div style="background:var(--bg-alt);border-bottom:1px solid var(--border);padding:12px 20px;position:sticky;top:63px;z-index:40;backdrop-filter:blur(8px);">
      <div style="max-width:1360px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <!-- Botón filtros móvil -->
        <button onclick="toggleFiltrosMovil()" class="md:hidden btn-outline" style="padding:8px 14px;font-size:13px;flex-shrink:0;">
          <i class="fa-solid fa-sliders"></i> Filtros
          ${i?'<span style="background:var(--accent);color:#FFFFFF;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;">!</span>':""}
        </button>

        <!-- Filtros activos -->
        <div style="display:flex;flex-wrap:wrap;gap:6px;flex:1;min-width:0;">
          ${a.filtros.categoria.map(o=>`
            <span class="active-tag">${o} <button onclick="quitarFiltroCategoria('${o}')" aria-label="Quitar filtro ${o}">&times;</button></span>
          `).join("")}
          ${a.filtros.linea.map(o=>`
            <span class="active-tag">${o} <button onclick="quitarFiltroLinea('${o}')" aria-label="Quitar filtro ${o}">&times;</button></span>
          `).join("")}
          ${a.filtros.precio?`
            <span class="active-tag">${((t=D.find(o=>o.value&&o.value[0]===a.filtros.precio[0]))==null?void 0:t.label)||"Rango de precio"} <button onclick="quitarFiltroPrecio()" aria-label="Quitar filtro de precio">&times;</button></span>
          `:""}
          ${i?`<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--danger);font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;padding:4px 0;">Limpiar todo</button>`:""}
        </div>

        <!-- Ordenar y conteo -->
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <span style="font-size:13px;color:var(--text-sec);white-space:nowrap;" class="hidden sm:inline">${e.length} producto${e.length!==1?"s":""}</span>
          <select onchange="state.filtros.orden=this.value;render();"
            style="padding:7px 12px;border:2px solid var(--border);border-radius:8px;font-family:'Outfit',sans-serif;font-size:13px;color:var(--text);background:var(--bg);outline:none;cursor:pointer;color-scheme:light;"
            aria-label="Ordenar productos">
            <option value="relevancia" ${a.filtros.orden==="relevancia"?"selected":""}>Relevancia</option>
            <option value="precio-asc" ${a.filtros.orden==="precio-asc"?"selected":""}>Precio: menor a mayor</option>
            <option value="precio-desc" ${a.filtros.orden==="precio-desc"?"selected":""}>Precio: mayor a menor</option>
            <option value="nombre-asc" ${a.filtros.orden==="nombre-asc"?"selected":""}>Nombre: A-Z</option>
            <option value="nombre-desc" ${a.filtros.orden==="nombre-desc"?"selected":""}>Nombre: Z-A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Contenido: Sidebar + Grid -->
    <div style="max-width:1360px;margin:0 auto;padding:24px 20px 60px;display:flex;gap:28px;">
      <!-- Sidebar filtros (desktop) -->
      <aside class="hidden md:block" style="width:250px;flex-shrink:0;">
        <div style="position:sticky;top:140px;">
          ${B()}
        </div>
      </aside>

      <!-- Grid de productos -->
      <main style="flex:1;min-width:0;">
        ${e.length===0?`
          <div style="text-align:center;padding:80px 20px;" class="animate-fade-in">
            <i class="fa-solid fa-box-open" style="font-size:56px;color:var(--border);margin-bottom:16px;display:block;"></i>
            <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">No se encontraron productos</h3>
            <p style="color:var(--text-sec);margin-bottom:24px;">Intenta ajustar los filtros o buscar otro término.</p>
            <button onclick="limpiarFiltros()" class="btn-primary">Ver todos los productos</button>
          </div>
        `:`
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;">
            ${e.map(o=>ne(o)).join("")}
          </div>
        `}
      </main>
    </div>

    <!-- Footer -->
    <footer style="background:var(--bg-alt);color:var(--text-sec);padding:32px 20px;text-align:center;font-size:13px;border-top:1px solid var(--border);">
      <div style="max-width:1360px;margin:0 auto;">
        <div style="font-weight:700;color:var(--text);font-size:15px;margin-bottom:4px;">${C}</div>
        <div>Catálogo de pedidos en línea &middot; ${new Date().getFullYear()}</div>
      </div>
    </footer>`}function B(){return`
    <div style="background:var(--card-glass);border:1px solid var(--border);border-radius:14px;padding:20px;backdrop-filter:blur(8px);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="font-size:16px;font-weight:700;">Filtros</h2>
        ${P()?`<button onclick="limpiarFiltros()" style="background:none;border:none;color:var(--accent);font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;">Limpiar</button>`:""}
      </div>

      <!-- Categoría -->
      <div class="filter-section" style="margin-bottom:24px;">
        <h3>Categoría</h3>
        ${z.map(e=>{const i=a.filtros.categoria.includes(e),t=e.toLowerCase().trim(),o=N[t]||"fa-tag";return`
            <label class="filter-check">
              <input type="checkbox" ${i?"checked":""}
                onchange="toggleCategoriaFiltro('${e}')">
              <i class="fa-solid ${o}" style="font-size:12px;color:var(--text-sec);width:16px;text-align:center;"></i>
              ${e}
            </label>
          `}).join("")}
      </div>

      <!-- Línea -->
      <div class="filter-section" style="margin-bottom:24px;">
        <h3>Línea</h3>
        ${A.map(e=>`
            <label class="filter-check">
              <input type="checkbox" ${a.filtros.linea.includes(e)?"checked":""}
                onchange="toggleLineaFiltro('${e}')">
              ${e}
            </label>
          `).join("")}
      </div>

      <!-- Precio -->
      <div class="filter-section">
        <h3>Rango de precio</h3>
        ${D.map((e,i)=>`
          <label class="filter-radio">
            <input type="radio" name="precio" ${a.filtros.precio===e.value?"checked":""}
              onchange="state.filtros.precio=${e.value===null?"null":JSON.stringify(e.value)};render();">
            ${e.label}
          </label>
        `).join("")}
      </div>
    </div>`}function ne(e){const i=K(e.id),t=e.stock<=0;let o="";return t?o='<span class="badge-linea" style="background:rgba(239,68,68,0.15);color:#EF4444;border:1px solid rgba(239,68,68,0.3);right:10px;left:auto;top:10px;">Agotado</span>':o=`<span class="badge-linea" style="background:rgba(16,185,129,0.15);color:#34D399;border:1px solid rgba(16,185,129,0.3);right:10px;left:auto;top:10px;"><i class="fa-solid fa-box-open" style="font-size:10px;margin-right:4px;"></i>${e.stock} Disp.</span>`,`
    <article class="product-card animate-fade-in-up" aria-label="${p(e.name)}">
      <div class="img-wrap">
        <img src="${R(e)}" alt="${p(e.name)}" loading="lazy"
          onerror="this.style.display='none';this.parentElement.innerHTML+='<div style=\\'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg-alt);\\'><i class=\\'fa-solid fa-image\\' style=\\'font-size:40px;color:var(--border)\\'></i></div>';">
        <span class="badge-linea ${Y(e.linea)}">${e.linea||"Estándar"}</span>
        ${o}
      </div>
      <div style="padding:14px;flex:1;display:flex;flex-direction:column;gap:6px;">
        <div style="font-size:11px;color:var(--text-sec);font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">${e.categoria||"General"}</div>
        <h3 style="font-size:14px;font-weight:600;line-height:1.35;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p(e.name)}</h3>
        <div style="display:flex;align-items:baseline;gap:4px;margin-top:auto;">
          <span style="font-size:20px;font-weight:800;color:var(--accent);letter-spacing:-0.02em;">${s(e.price)}</span>
          <span style="font-size:12px;color:var(--text-sec);">/ ${e.presentacion||"und"}</span>
        </div>
        ${i===0?`
          <button class="btn-add" onclick="agregarAlCarrito('${e.id}')" ${t?'disabled style="opacity: 0.5; cursor: not-allowed;"':""} aria-label="Agregar ${p(e.name)} al carrito">
            <i class="fa-solid fa-plus" style="font-size:12px;"></i> Agregar
          </button>
        `:`
          <div class="qty-controls">
            <button onclick="cambiarCantidad('${e.id}', -1)" aria-label="Reducir cantidad">−</button>
            <span>${i}</span>
            <button onclick="cambiarCantidad('${e.id}', 1)" aria-label="Aumentar cantidad">+</button>
          </div>
        `}
      </div>
    </article>`}function se(){const e=a.carrito.length===0;return`
    <div class="drawer-overlay" onclick="toggleCarrito()"></div>
    <div class="drawer animate-slide-right" role="dialog" aria-label="Carrito de pedidos">
      <!-- Header del drawer -->
      <div style="padding:20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <h2 style="font-size:18px;font-weight:800;">Tu pedido</h2>
          <div style="font-size:13px;color:var(--text-sec);">${k()} producto${k()!==1?"s":""}</div>
        </div>
        <button onclick="toggleCarrito()" style="background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-sec);transition:all 0.15s;"
          onmouseenter="this.style.background='var(--bg)';this.style.color='var(--text)'"
          onmouseleave="this.style.background='none';this.style.color='var(--text-sec)'"
          aria-label="Cerrar carrito">
          <i class="fa-solid fa-xmark" style="font-size:20px;"></i>
        </button>
      </div>

      ${e?`
        <!-- Estado vacío -->
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;">
          <i class="fa-solid fa-cart-shopping" style="font-size:48px;color:var(--border);margin-bottom:16px;"></i>
          <h3 style="font-size:16px;font-weight:700;margin-bottom:6px;">Tu pedido está vacío</h3>
          <p style="font-size:14px;color:var(--text-sec);margin-bottom:24px;">Agrega productos desde el catálogo</p>
          <button onclick="toggleCarrito()" class="btn-primary" style="padding:10px 24px;font-size:14px;">Ver catálogo</button>
        </div>
      `:`
        <!-- Lista de items -->
        <div style="flex:1;overflow-y:auto;padding:16px 20px;">
          ${a.carrito.map(i=>{const t=u.find(o=>o.id===i.id);return t?`
              <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center;" class="animate-fade-in">
                <div style="width:56px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0;background:var(--bg-alt);border:1px solid var(--border);">
                  <img src="${R(t)}" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p(t.name)}</div>
                  <div style="font-size:12px;color:var(--text-sec);">${s(t.price)} / ${t.presentacion||"und"}</div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <div style="display:flex;align-items:center;border:1.5px solid var(--border);border-radius:6px;overflow:hidden;">
                      <button onclick="cambiarCantidad('${t.id}',-1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:14px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;" aria-label="Reducir cantidad">−</button>
                      <span style="width:28px;text-align:center;font-size:13px;font-weight:700;">${i.cantidad}</span>
                      <button onclick="cambiarCantidad('${t.id}',1)" style="background:none;border:none;width:28px;height:28px;cursor:pointer;font-size:14px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <span style="font-size:14px;font-weight:700;color:var(--accent);">${s(t.price*i.cantidad)}</span>
                  </div>
                </div>
                <button onclick="eliminarDelCarrito('${t.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-sec);padding:4px;transition:color 0.15s;"
                  onmouseenter="this.style.color='var(--danger)'" onmouseleave="this.style.color='var(--text-sec)'"
                  aria-label="Eliminar ${p(t.name)}">
                  <i class="fa-solid fa-trash-can" style="font-size:13px;"></i>
                </button>
              </div>`:""}).join("")}
        </div>

        <!-- Footer del drawer -->
        <div style="padding:20px;border-top:1px solid var(--border);flex-shrink:0;background:var(--bg-alt);">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:500;">Subtotal</span>
            <span style="font-size:18px;font-weight:700;color:var(--text);">${s(g()/1.19)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:500;">IVA Estimado (19%)</span>
            <span style="font-size:18px;font-weight:700;color:var(--text);">${s(g()-g()/1.19)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;border-top:1px dashed var(--border);padding-top:12px;">
            <span style="font-size:14px;color:var(--text-sec);font-weight:500;">Total del pedido</span>
            <span style="font-size:24px;font-weight:900;color:var(--accent);letter-spacing:-0.02em;">${s(g())}</span>
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
    </div>`}function le(){return`
    <div class="mobile-filter-overlay" onclick="toggleFiltrosMovil()"></div>
    <div class="mobile-filter-panel animate-slide-up" role="dialog" aria-label="Filtros">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg-alt);z-index:2;border-radius:20px 20px 0 0;">
        <h2 style="font-size:16px;font-weight:700;">Filtros</h2>
        <button onclick="toggleFiltrosMovil()" style="background:none;border:none;cursor:pointer;width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--text-sec);" aria-label="Cerrar filtros">
          <i class="fa-solid fa-xmark" style="font-size:18px;"></i>
        </button>
      </div>
      <div style="padding:20px;">
        ${B()}
      </div>
      <div style="padding:16px 20px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--bg-alt);">
        <button onclick="toggleFiltrosMovil()" class="btn-primary" style="width:100%;">
          Ver ${$().length} producto${$().length!==1?"s":""}
        </button>
      </div>
    </div>`}function de(){return a.carrito.length===0?(setTimeout(()=>w("catalogo"),0),""):`
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
              ${a.carrito.map(e=>{const i=u.find(t=>t.id===e.id);return i?`
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p(i.name)}</div>
                      <div style="color:var(--text-sec);font-size:12px;">${e.cantidad} x ${s(i.price)}</div>
                    </div>
                    <div style="font-weight:700;flex-shrink:0;margin-left:8px;">${s(i.price*e.cantidad)}</div>
                  </div>`:""}).join("")}
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
              <span style="font-size:13px;color:var(--text-sec);">Subtotal</span>
              <span style="font-size:14px;font-weight:600;color:var(--text);">${s(g()/1.19)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">
              <span style="font-size:13px;color:var(--text-sec);">IVA (19%)</span>
              <span style="font-size:14px;font-weight:600;color:var(--text);">${s(g()-g()/1.19)}</span>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:12px;border-top:2px solid var(--border);">
              <span style="font-size:15px;font-weight:700;">Total</span>
              <span style="font-size:26px;font-weight:900;color:var(--accent);letter-spacing:-0.02em;">${s(g())}</span>
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
    <style>.lg:grid-cols-checkout{grid-template-columns:1fr 380px;}@media(max-width:1023px){.lg:grid-cols-checkout{grid-template-columns:1fr;}}</style>`}function ce(){const e=a.ultimoPedido;return e?`
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
      <div style="font-size:24px;font-weight:900;color:var(--accent);margin-bottom:24px;letter-spacing:0.05em;">${e.numero}</div>

      <!-- Resumen compacto -->
      <div style="background:var(--card-glass);border:1px solid var(--border);border-radius:14px;padding:20px;text-align:left;margin-bottom:24px;backdrop-filter:blur(8px);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:14px;margin-bottom:16px;">
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Cliente</div>
            <div style="font-weight:600;">${p(e.nombre)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Teléfono</div>
            <div style="font-weight:600;">${p(e.telefono)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Entrega</div>
            <div style="font-weight:600;">${p(e.entrega)}</div>
          </div>
          <div>
            <div style="color:var(--text-sec);font-size:12px;font-weight:500;margin-bottom:2px;">Fecha</div>
            <div style="font-weight:600;">${e.fecha}</div>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:12px;">
          ${e.items.map(i=>{const t=u.find(o=>o.id===i.id);return t?`<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
              <span>${p(t.name)} x${i.cantidad}</span>
              <span style="font-weight:600;">${s(t.price*i.cantidad)}</span>
            </div>`:""}).join("")}
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;padding-top:8px;margin-top:8px;border-top:2px solid var(--border);">
            <span>Total</span>
            <span style="color:var(--accent);">${s(e.total)}</span>
          </div>
        </div>
      </div>

      <button onclick="navegar('catalogo')" class="btn-primary" style="padding:14px 40px;">
        <i class="fa-solid fa-arrow-rotate-left"></i> Hacer otro pedido
      </button>
    </div>`:(setTimeout(()=>w("catalogo"),0),"")}function p(e){if(!e)return"";const i=document.createElement("div");return i.textContent=e,i.innerHTML}window.toggleCategoriaFiltro=function(e){const i=a.filtros.categoria.indexOf(e);i===-1?a.filtros.categoria.push(e):a.filtros.categoria.splice(i,1),l()};window.toggleLineaFiltro=function(e){const i=a.filtros.linea.indexOf(e);i===-1?a.filtros.linea.push(e):a.filtros.linea.splice(i,1),l()};async function pe(e,i){var F,E,j,I,O,L,S,q,T;e&&e.preventDefault();const t=document.getElementById("checkout-form");if(!t)return!1;const o=((F=t.elements.namedItem("doc_type"))==null?void 0:F.value)||"CC",r=((E=t.elements.namedItem("doc_number"))==null?void 0:E.value.trim())||"",f=((j=t.elements.namedItem("nombre"))==null?void 0:j.value.trim())||"",n=((I=t.elements.namedItem("telefono"))==null?void 0:I.value.trim())||"",x=((O=t.elements.namedItem("email"))==null?void 0:O.value.trim())||"",c=((L=t.elements.namedItem("entrega"))==null?void 0:L.value)||"",v=((S=t.elements.namedItem("direccion"))==null?void 0:S.value.trim())||"",H=((q=t.elements.namedItem("referencias"))==null?void 0:q.value.trim())||"",V=((T=t.elements.namedItem("notas"))==null?void 0:T.value.trim())||"";if(!r||!f||!n||!c){if(!r){const d=t.elements.namedItem("doc_number");d&&(d.style.borderColor="var(--danger)")}if(!f){const d=t.elements.namedItem("nombre");d&&(d.style.borderColor="var(--danger)")}if(!n){const d=t.elements.namedItem("telefono");d&&(d.style.borderColor="var(--danger)")}if(!c){const d=t.elements.namedItem("entrega");d&&(d.style.borderColor="var(--danger)")}return m("Completa los campos requeridos (*)","warning"),!1}if(c==="Entrega a domicilio"&&!v){const d=t.elements.namedItem("direccion");return d&&(d.style.borderColor="var(--danger)"),m("La dirección de entrega es requerida para domicilio","warning"),!1}const U={doc_type:o,doc_number:r,nombre:f,telefono:n,email:x,entrega:c,direccion:v,referencias:H,notas:V},y=document.getElementById("btn-submit-directo"),h=document.getElementById("btn-submit-whatsapp");return y&&(y.disabled=!0),h&&(h.disabled=!0),await oe(U,i==="whatsapp"),y&&(y.disabled=!1),h&&(h.disabled=!1),!1}async function fe(){try{const e=await fetch("/api/public/ecommerce/products");if(!e.ok)throw new Error("Error al conectar con la base de datos de productos.");u=await e.json();const i=new Set,t=new Set;u.forEach(o=>{o.categoria&&i.add(o.categoria),o.linea&&t.add(o.linea)}),z=Array.from(i).sort(),A=Array.from(t).sort(),l()}catch(e){console.error(e),m("No se pudo cargar el catálogo de productos","error")}}window.state=a;window.render=l;window.navegar=w;window.toggleCarrito=_;window.toggleFiltrosMovil=M;window.agregarAlCarrito=J;window.cambiarCantidad=Q;window.eliminarDelCarrito=W;window.vaciarCarrito=Z;window.limpiarFiltros=X;window.quitarFiltroCategoria=ee;window.quitarFiltroLinea=te;window.quitarFiltroPrecio=ie;window.manejarSubmit=pe;document.addEventListener("change",function(e){const i=e.target;if(i&&i.name==="entrega"){const t=document.getElementById("direccion-field");if(t){const o=i.value==="Entrega a domicilio";t.style.display=o?"block":"none";const r=t.querySelector("input");r&&(r.required=o)}}i&&(i.tagName==="INPUT"||i.tagName==="SELECT")&&(i.style.borderColor="")});document.addEventListener("keydown",function(e){e.key==="Escape"&&(a.showCarrito?_():a.showFiltrosMovil&&M())});document.addEventListener("DOMContentLoaded",()=>{fe()});
