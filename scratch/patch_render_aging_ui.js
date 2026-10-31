const fs = require('fs');

const file = 'frontend/src/modules/reportes.ts';
let content = fs.readFileSync(file, 'utf8');
const normalize = s => s.replace(/\r\n/g, '\n');
content = normalize(content);

// 1. In renderAgingPortfolio:
// Replace the start of renderAgingPortfolio up to results.innerHTML ...
const oldAgingStart = `async function renderAgingPortfolio() {
  const view = getReportViewHost();
  if (!view) return;

  let sellers: any[] = [];
  try {
    sellers = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" || type="VENDEDOR"', sort: 'name', fields: 'id,name,doc_number' });
  } catch (_) {}

  view.innerHTML = \`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Cartera por Edades (Por Vencer / 0-30-60-90+)</h4>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="form-group">
          <label class="form-label">Fecha de corte</label>
          <input id="age-cutoff" type="date" class="form-input" value="\${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de cartera</label>
          <select id="age-mode" class="form-input">
            <option value="cxc">Clientes (CxC) — Ctas. 1305 / Cuentas con cruce</option>
            <option value="cxp">Proveedores (CxP) — Ctas. 2205 / Cuentas con cruce</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Vendedor / Asesor</label>
          <select id="age-seller" class="form-input">
            <option value="">Todos los vendedores</option>
            <option value="sin_vendedor">Sin vendedor asignado</option>
            \${sellers.map(s => \`<option value="\${esc(s.id)}">\${esc(s.name)}\${s.doc_number ? \` (\${esc(s.doc_number)})\` : ''}</option>\`).join('')}
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-aging"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end gap-2">
          <button class="btn btn-outline flex-1" id="btn-pdf-aging" disabled><i class="fas fa-file-pdf"></i> PDF</button>
          <button class="btn btn-outline flex-1" id="btn-exp-aging" disabled><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <p class="text-xs mt-2" style="color:#6B7280"><i class="fas fa-info-circle mr-1" style="color:#4F46E5"></i><strong>Cartera Clientes (CxC):</strong> Incluye exclusivamente la cuenta 1305 (Clientes) y cuentas del grupo 13 configuradas con manejo de tercero y documento de cruce. Excluye cuentas fiscales (1355) y deudores no comerciales.</p>
    </div>
    <div id="aging-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-hourglass-half mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>\`;`;

const newAgingStart = `async function renderAgingPortfolio() {
  const view = getReportViewHost();
  if (!view) return;

  let sellers: any[] = [];
  let cruceAccounts: any[] = [];
  try {
    const [selRes, accRes] = await Promise.all([
      pb.listAll('third_parties', { filter: 'type="EMPLEADO" || type="VENDEDOR"', sort: 'name', fields: 'id,name,doc_number' }).catch(() => []),
      API.getAccounts(true).catch(() => [])
    ]);
    sellers = selRes || [];
    cruceAccounts = (accRes || []).filter((a: any) => a.maneja_cruce === 1 || a.maneja_cruce === true || a.maneja_cruce === '1');
    cruceAccounts.sort((a: any, b: any) => String(a.code || '').localeCompare(String(b.code || '')));
  } catch (_) {}

  view.innerHTML = \`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Cartera por Edades (Por Vencer / 0-30-60-90+)</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div class="form-group">
          <label class="form-label">Fecha de corte</label>
          <input id="age-cutoff" type="date" class="form-input" value="\${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de cartera</label>
          <select id="age-mode" class="form-input">
            <option value="cxc">Clientes (CxC) — Ctas. 1305 / Cuentas con cruce</option>
            <option value="cxp">Proveedores (CxP) — Ctas. 2205 / Cuentas con cruce</option>
          </select>
        </div>
        <div class="form-group relative" id="age-accounts-wrap">
          <label class="form-label flex justify-between items-center">
            <span>Cuentas con Cruce</span>
            <span id="age-acc-badge" class="badge badge-info text-xs hidden" style="font-size:10px; padding:1px 6px;">0 sel.</span>
          </label>
          <div class="relative">
            <button type="button" id="age-acc-btn" class="form-input text-left flex justify-between items-center w-full" style="cursor:pointer; background:#fff;">
              <span id="age-acc-label" class="truncate text-sm" style="color:#374151;">Todas según tipo de cartera</span>
              <i class="fas fa-chevron-down text-xs ml-2 text-gray-400"></i>
            </button>
            <div id="age-acc-panel" class="hidden absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow-2xl p-2.5 max-h-64 overflow-y-auto" style="border-color:#D1D5DB; min-width: 320px;">
              <div class="mb-2">
                <input type="text" id="age-acc-search" placeholder="🔍 Filtrar cuenta..." class="form-input text-xs w-full py-1 px-2 mb-1.5" />
                <div class="flex justify-between items-center px-1 text-xs text-gray-500">
                  <button type="button" id="age-acc-select-all" class="text-primary hover:underline font-semibold">Seleccionar visibles</button>
                  <button type="button" id="age-acc-clear" class="text-red-500 hover:underline">Limpiar filtro</button>
                </div>
              </div>
              <div id="age-acc-items" class="space-y-1 text-xs">
                \${cruceAccounts.map(a => \`
                  <label class="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer age-acc-item" data-code="\${esc(a.code)}" data-name="\${esc(a.name)}">
                    <input type="checkbox" class="age-acc-cb rounded" value="\${esc(a.code)}" />
                    <span class="font-mono text-gray-700 font-semibold">\${esc(a.code)}</span>
                    <span class="truncate text-gray-600">\${esc(a.name)}</span>
                  </label>
                \`).join('')}
                \${!cruceAccounts.length ? '<div class="text-gray-400 p-2 text-center">No hay cuentas con cruce configuradas</div>' : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Vendedor / Asesor</label>
          <select id="age-seller" class="form-input">
            <option value="">Todos los vendedores</option>
            <option value="sin_vendedor">Sin vendedor asignado</option>
            \${sellers.map(s => \`<option value="\${esc(s.id)}">\${esc(s.name)}\${s.doc_number ? \` (\${esc(s.doc_number)})\` : ''}</option>\`).join('')}
          </select>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style="border-color:#F3F4F6;">
        <p class="text-xs text-gray-500 mb-0"><i class="fas fa-info-circle mr-1" style="color:#4F46E5"></i>Filtra una o varias cuentas específicas con manejo de cruce (ej. <strong>11050502</strong>, 13050501, 13459501), o déjalo sin selección para aplicar la cartera estándar.</p>
        <div class="flex items-center gap-2">
          <button class="btn btn-primary" id="btn-gen-aging"><i class="fas fa-filter mr-1"></i> Generar</button>
          <button class="btn btn-outline" id="btn-pdf-aging" disabled><i class="fas fa-file-pdf mr-1"></i> PDF</button>
          <button class="btn btn-outline" id="btn-exp-aging" disabled><i class="fas fa-file-excel mr-1"></i> Excel</button>
        </div>
      </div>
    </div>
    <div id="aging-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-hourglass-half mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>\`;

  // Attach dropdown event listeners
  const accWrap = $('#age-accounts-wrap');
  const accBtn = $('#age-acc-btn');
  const accPanel = $('#age-acc-panel');
  const accLabel = $('#age-acc-label');
  const accBadge = $('#age-acc-badge');
  const accSearch = $('#age-acc-search') as HTMLInputElement | null;
  const selectAllBtn = $('#age-acc-select-all');
  const clearBtn = $('#age-acc-clear');

  const updateAccLabel = () => {
    const checked = Array.from(view.querySelectorAll('.age-acc-cb:checked')) as HTMLInputElement[];
    if (checked.length === 0) {
      if (accLabel) accLabel.textContent = 'Todas según tipo de cartera';
      if (accBadge) { accBadge.classList.add('hidden'); accBadge.textContent = ''; }
    } else if (checked.length === 1) {
      const code = checked[0].value;
      const item = cruceAccounts.find(a => a.code === code);
      if (accLabel) accLabel.textContent = item ? \`\${code} - \${item.name}\` : code;
      if (accBadge) { accBadge.classList.remove('hidden'); accBadge.textContent = '1 sel.'; }
    } else {
      if (accLabel) accLabel.textContent = \`\${checked.length} cuentas seleccionadas\`;
      if (accBadge) { accBadge.classList.remove('hidden'); accBadge.textContent = \`\${checked.length} sel.\`; }
    }
  };

  if (accBtn && accPanel) {
    accBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accPanel.classList.toggle('hidden');
      if (!accPanel.classList.contains('hidden') && accSearch) {
        accSearch.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (accWrap && !accWrap.contains(e.target as Node)) {
        accPanel.classList.add('hidden');
      }
    });
  }

  if (accSearch) {
    accSearch.addEventListener('input', () => {
      const q = accSearch.value.toLowerCase().trim();
      const items = view.querySelectorAll('.age-acc-item') as NodeListOf<HTMLElement>;
      items.forEach(el => {
        const code = (el.getAttribute('data-code') || '').toLowerCase();
        const name = (el.getAttribute('data-name') || '').toLowerCase();
        if (!q || code.includes(q) || name.includes(q)) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    });
  }

  view.querySelectorAll('.age-acc-cb').forEach(cb => {
    cb.addEventListener('change', updateAccLabel);
  });

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const visibleItems = Array.from(view.querySelectorAll('.age-acc-item:not(.hidden) .age-acc-cb')) as HTMLInputElement[];
      visibleItems.forEach(cb => cb.checked = true);
      updateAccLabel();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const allCbs = Array.from(view.querySelectorAll('.age-acc-cb')) as HTMLInputElement[];
      allCbs.forEach(cb => cb.checked = false);
      updateAccLabel();
    });
  }`;

if (content.includes(normalize(oldAgingStart))) {
  content = content.replace(normalize(oldAgingStart), normalize(newAgingStart));
  console.log('Successfully replaced oldAgingStart.');
} else {
  console.error('Could not find oldAgingStart');
  process.exit(1);
}

// 2. In generate(): pass accountCodes to buildAgingDocsDirect
const oldGenCall = `      const docs = await buildAgingDocsDirect({ mode, asOfDate, sellerId });`;
const newGenCall = `      const selectedAccCheckboxes = Array.from(view.querySelectorAll('.age-acc-cb:checked')) as HTMLInputElement[];
      const accountCodes = selectedAccCheckboxes.map(cb => cb.value.trim()).join(',');
      const docs = await buildAgingDocsDirect({ mode, asOfDate, sellerId, accountCodes });`;

if (content.includes(normalize(oldGenCall))) {
  content = content.replace(normalize(oldGenCall), normalize(newGenCall));
  console.log('Successfully replaced oldGenCall.');
} else {
  console.error('Could not find oldGenCall');
  process.exit(1);
}

// 3. In lastPdfMeta: include accountLabel and subtitles
const oldPdfMeta = `      lastExportRows = rows.map(r => ({ ...r }));
      lastPdfRows = rows.map(r => ({ ...r }));
      lastPdfMeta = { asOfDate, mode, carteraLabel, sellerLabel };`;

const newPdfMeta = `      lastExportRows = rows.map(r => ({ ...r }));
      lastPdfRows = rows.map(r => ({ ...r }));
      const accountLabel = selectedAccCheckboxes.length ? \`\${selectedAccCheckboxes.length} cuenta(s) filtrada(s)\` : '';
      lastPdfMeta = { asOfDate, mode, carteraLabel, sellerLabel, accountLabel };`;

if (content.includes(normalize(oldPdfMeta))) {
  content = content.replace(normalize(oldPdfMeta), normalize(newPdfMeta));
  console.log('Successfully replaced oldPdfMeta.');
} else {
  console.error('Could not find oldPdfMeta');
}

// 4. In PDF subtitles:
const oldSubtitles = `        subtitles: [
          \`Corte: \${asOfDate}\`,
          \`Cartera: \${carteraLabel}\`,
          \`Vendedor: \${sellerLabel || 'Todos los Vendedores'}\`,
        ],`;

const newSubtitles = `        subtitles: [
          \`Corte: \${asOfDate}\`,
          \`Cartera: \${carteraLabel}\`,
          \`Vendedor: \${sellerLabel || 'Todos los Vendedores'}\`,
          lastPdfMeta.accountLabel ? \`Cuentas: \${lastPdfMeta.accountLabel}\` : '',
        ].filter(Boolean),`;

if (content.includes(normalize(oldSubtitles))) {
  content = content.replace(normalize(oldSubtitles), normalize(newSubtitles));
  console.log('Successfully replaced oldSubtitles.');
} else {
  console.error('Could not find oldSubtitles');
}

fs.writeFileSync(file, content, 'utf8');
console.log('frontend/src/modules/reportes.ts successfully patched.');

