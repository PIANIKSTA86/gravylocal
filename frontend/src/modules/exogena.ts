/**
 * GRAVY v2.0 — exogena.ts
 * Módulo de Información Exógena DIAN.
 * Soporta de forma dinámica todos los formatos de FormatosBASE.xlsx.
 */
'use strict';

import { EXOGENA_FORMATS, EXOGENA_COLUMNS, EXOGENA_MAPPINGS } from './exogena_data';

async function renderExogena(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-file-invoice-dollar mr-2" style="color:#D97706"></i>Información Exógena DIAN
        </h3>
        <p class="text-sm" style="color:#6B7280">DIAN — Consolidación tributaria basada en PUC y movimientos reales.</p>
      </div>
    </div>
    <div class="flex gap-1 mb-5 border-b flex-wrap" style="border-color:#E5E7EB">
      <button class="tab-btn active" id="exo-gen-tab">Reportes y Plantillas</button>
      <button class="tab-btn" id="exo-config-tab">Configuración y Mapeo PUC</button>
    </div>
    <div id="exo-content" class="anim-slide-up"></div>`;

  const content = c.querySelector('#exo-content');
  const tabs = {
    gen: c.querySelector('#exo-gen-tab'),
    config: c.querySelector('#exo-config-tab')
  };

  const switchTab = (t) => {
    Object.values(tabs).forEach(b => b.classList.remove('active'));
    tabs[t].classList.add('active');
    if (t === 'gen') _renderExoGen(content);
    if (t === 'config') _renderExoConfig(content);
  };

  tabs.gen.addEventListener('click', () => switchTab('gen'));
  tabs.config.addEventListener('click', () => switchTab('config'));
  switchTab('gen');
}

async function _renderExoGen(c) {
  const currentYear = new Date().getFullYear() - 1;
  c.innerHTML = `
    <div class="bg-white rounded-2xl border p-5 mb-5 flex flex-wrap gap-4 items-end" style="border-color:#F0F0F0; box-shadow: 0 4px 12px rgba(0,0,0,0.02)">
      <div class="w-48">
        <label class="form-label">Selecciona Formato</label>
        <select id="exo-format-select" class="form-input">
          ${EXOGENA_FORMATS.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
        </select>
      </div>
      <div class="w-32">
        <label class="form-label">Año Gravable</label>
        <input type="number" id="exo-year" class="form-input" value="${currentYear}">
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" id="btn-gen-preview">
          <i class="fas fa-play mr-1"></i>Generar Vista Previa
        </button>
        <button class="btn btn-outline" id="btn-export-xlsx">
          <i class="fas fa-file-excel mr-1"></i>Exportar Plantilla Excel
        </button>
      </div>
    </div>
    <div id="exo-gen-results">
      <div class="py-12 text-center text-gray-400">
        <i class="fas fa-table text-4xl mb-3" style="color:#D1D5DB"></i>
        <p>Selecciona un formato y año, luego presiona "Generar Vista Previa" para consolidar los movimientos.</p>
      </div>
    </div>`;

  const results = c.querySelector('#exo-gen-results');
  let currentRows = [];
  let currentCols = [];

  document.getElementById('btn-gen-preview').addEventListener('click', async () => {
    const formatId = document.getElementById('exo-format-select').value;
    const year = document.getElementById('exo-year').value;
    results.innerHTML = `<div class="py-10 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Consolidando información del Formato ${formatId}...</div>`;
    try {
      const rawData = await API.generateExogenaDataset(year, formatId, EXOGENA_MAPPINGS);
      currentCols = EXOGENA_COLUMNS[formatId] || [];
      currentRows = buildExogenaRows(formatId, rawData);

      if (currentRows.length === 0) {
        results.innerHTML = `
          <div class="py-10 text-center text-gray-500 bg-white rounded-2xl border p-6">
            <i class="fas fa-circle-info text-2xl text-amber-500 mb-2"></i>
            <p class="font-semibold">No se encontraron movimientos contables en el año ${year} para el formato seleccionado.</p>
            <p class="text-xs text-gray-400 mt-1">Asegúrate de que las cuentas PUC del formato estén correctamente configuradas y tengan movimientos.</p>
          </div>`;
        return;
      }

      results.innerHTML = `
        <div class="bg-white rounded-2xl border overflow-hidden shadow-sm" style="border-color:#EAF2F8">
          <div class="p-4 border-b flex justify-between items-center bg-gray-50">
            <span class="text-sm font-semibold text-gray-600">
              Registros Consolidados: <span class="badge badge-blue font-bold">${currentRows.length}</span>
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table text-xs compact">
              <thead>
                <tr>
                  ${currentCols.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${currentRows.map(row => `
                  <tr>
                    ${currentCols.map(col => {
                      const val = row[col];
                      const isNum = typeof val === 'number';
                      return `<td class="${isNum ? 'text-right font-mono font-semibold' : ''}">${isNum ? fmt(val) : esc(val)}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    } catch (err) {
      results.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
    }
  });

  document.getElementById('btn-export-xlsx').addEventListener('click', () => {
    if (currentRows.length === 0) {
      return showToast('Primero debes generar la vista previa antes de exportar.', 'warning');
    }
    const formatId = document.getElementById('exo-format-select').value;
    const year = document.getElementById('exo-year').value;
    exportExogenaToExcel(formatId, year, currentRows, currentCols);
  });
}

async function _renderExoConfig(c) {
  c.innerHTML = `
    <div class="bg-white rounded-2xl border p-5 mb-5 shadow-sm" style="border-color:#F0F0F0">
      <h4 class="font-bold text-sm mb-2" style="color:#0D2137"><i class="fas fa-sitemap mr-1"></i>Mapeo Base del PUC</h4>
      <p class="text-xs text-gray-500 leading-relaxed mb-4">
        Los conceptos y sus cuentas asociadas son extraídos dinámicamente de la plantilla excel <strong>FormatosBASE.xlsx</strong>.
        Puedes ver abajo el mapeo actual de los formatos y cuentas.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="form-label">Selecciona Formato para Inspeccionar Mapeo</label>
          <select id="exo-inspect-format" class="form-input mb-4">
            ${EXOGENA_FORMATS.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="exo-mappings-table"></div>
    </div>`;

  const tableContainer = c.querySelector('#exo-mappings-table');
  const inspectSelect = c.querySelector('#exo-inspect-format');

  const updateInspectTable = () => {
    const formatId = inspectSelect.value;
    const mappings = EXOGENA_MAPPINGS[formatId] || {};
    
    if (Object.keys(mappings).length === 0) {
      tableContainer.innerHTML = `
        <div class="py-6 text-center text-gray-400 bg-gray-50 rounded-xl">
          <i class="fas fa-ban text-2xl mb-2"></i>
          <p class="text-xs">No hay mapeo de cuentas contables definido para el Formato ${formatId}.</p>
        </div>`;
      return;
    }

    tableContainer.innerHTML = `
      <div class="overflow-hidden border rounded-xl">
        <table class="data-table text-xs">
          <thead>
            <tr class="bg-gray-50">
              <th>Concepto Dian</th>
              <th>Prefijos de Cuentas Contables Mapeados (PUC)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(mappings).map(([concept, accounts]) => `
              <tr>
                <td><span class="badge badge-orange font-bold font-mono">${concept}</span></td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    ${(accounts as string[]).map(a => `<span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono font-semibold" style="color:#2C3E50">${a}</span>`).join('')}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  };

  inspectSelect.addEventListener('change', updateInspectTable);
  updateInspectTable();
}

function buildExogenaRows(formatId, rawData) {
  // Group rawData by Third Party ID + Concept
  const groups = {};
  for (const item of rawData) {
    const key = `${item.third.id}-${item.conceptCode}`;
    if (!groups[key]) {
      groups[key] = {
        third: item.third,
        conceptCode: item.conceptCode,
        items: []
      };
    }
    groups[key].items.push(item);
  }

  // Convert to specific row structure based on formatId
  return Object.values(groups).map((g: any) => {
    const t = g.third;
    const nameFields = parseThirdName(t.name);
    
    // Base object common to almost all formats
    const row: any = {
      "Concepto": g.conceptCode,
      "Tipo de documento": t.doc_type || '13',
      "Tipo de Documento": t.doc_type || '13',
      "Tipo de documento del Tercero": t.doc_type || '13',
      "Tipo de documento de quien se recibe ingreso": t.doc_type || '13',
      "Tipo de documento del beneficiario": t.doc_type || '13',
      "Número identificación ": t.doc_number,
      "Número identificación": t.doc_number,
      "Número de Identificación del Tercero": t.doc_number,
      "Número identificación del informado": t.doc_number,
      "Número de Identificación del beneficiario": t.doc_number,
      "Número identificación deudor": t.doc_number,
      "Número identificación acreedor": t.doc_number,
      "Número identificación socio o accionista": t.doc_number,
      "NIT informado": t.doc_number,
      "Número identificación de quien se recibe ingreso": t.doc_number,
      "DV": t.dv || '',
      "Primer apellido del informado": nameFields.lastName1,
      "Primer apellido deudor": nameFields.lastName1,
      "Primer apellido acreedor": nameFields.lastName1,
      "Primer apellido socio o accionista": nameFields.lastName1,
      "Primer Apellido del beneficiario": nameFields.lastName1,
      "Primer apellido": nameFields.lastName1,
      "Primer apellido de quien se recibe ingreso": nameFields.lastName1,
      "Segundo apellido del informado": nameFields.lastName2,
      "Segundo apellido deudor": nameFields.lastName2,
      "Segundo apellido acreedor": nameFields.lastName2,
      "Segundo apellido socio o accionista": nameFields.lastName2,
      "Segundo Apellido del beneficiario": nameFields.lastName2,
      "Segundo apellido ": nameFields.lastName2,
      "Segundo apellido de quien se recibe ingreso": nameFields.lastName2,
      "Primer nombre del informado": nameFields.firstName,
      "Primer nombre deudor": nameFields.firstName,
      "Primer nombre acreedor": nameFields.firstName,
      "Primer nombre del socio o accionista": nameFields.firstName,
      "Primer Nombre del beneficiario": nameFields.firstName,
      "Primer nombre": nameFields.firstName,
      "Primer nombre de quien se recibe ingreso": nameFields.firstName,
      "Otros nombres del informado": nameFields.otherNames,
      "Otros nombres deudor": nameFields.otherNames,
      "Otros nombres acreedor": nameFields.otherNames,
      "Otros nombres socio o accionista": nameFields.otherNames,
      "Otros Nombres del beneficiario": nameFields.otherNames,
      "Otros nombres": nameFields.otherNames,
      "Otros nombres de quien se recibe ingreso": nameFields.otherNames,
      "Razón social informado": t.name,
      "Razón social deudor": t.name,
      "Razón social acreedor": t.name,
      "Razón social ": t.name,
      "Razón Social": t.name,
      "Razón social de quien se recibe ingreso": t.name,
      "Dirección": t.address || '',
      "Dirección del beneficiario": t.address || '',
      "Código dpto": t.department || '76',
      "Código del Departamento": t.department || '76',
      "Departamento del beneficiario": t.department || '76',
      "Código mcp": t.city || '892',
      "Código del Municipio": t.city || '892',
      "Municipio del beneficiario": t.city || '892',
      "País de Residencia o domicilio": t.country || '169',
      "Código País": t.country || '169',
      "País del beneficiario ": t.country || '169',
      "Correo Electrónico": t.email || '',
      "Entidad Informante": 'CONDOMINIO PH'
    };

    // Initialize all format columns with 0
    const cols = EXOGENA_COLUMNS[formatId] || [];
    cols.forEach(c => {
      if (!row.hasOwnProperty(c)) row[c] = 0;
    });

    // Now distribute values to specific numeric columns based on formatId and account code prefixes!
    for (const item of g.items) {
      const code = item.accountCode;
      const debit = item.debit;
      const credit = item.credit;

      if (formatId === '1001') {
        if (code.startsWith('2408') && !item.isIvaCost) {
          if (row.hasOwnProperty('Impuesto descontable')) {
            row['Impuesto descontable'] += debit - credit;
          } else if (row.hasOwnProperty('IVA mayor valor del costo o gasto, deducible')) {
            row['IVA mayor valor del costo o gasto, deducible'] += debit - credit;
          }
        } else if (item.isIvaCost) {
          if (row.hasOwnProperty('IVA mayor valor del costo o gasto, deducible')) {
            row['IVA mayor valor del costo o gasto, deducible'] += debit - credit;
          } else if (row.hasOwnProperty('IVA cargado al costo o gasto')) {
            row['IVA cargado al costo o gasto'] += debit - credit;
          }
        } else if (code.startsWith('5') || code.startsWith('6') || code.startsWith('14') || code.startsWith('15')) {
          row['Pago o abono en cuenta deducible'] += debit - credit;
        } else if (code.startsWith('2365')) {
          row['Retención en la fuente practicada Renta'] += credit - debit;
        } else if (code.startsWith('2367') || code.startsWith('2368')) {
          row['Retención en la fuente practicada IVA Régimen común'] += credit - debit;
        }
      } else if (formatId === '1003') {
        row['Valor acumulado del pago o abono sujeto a Retención en la fuente'] += debit;
        row['Retención que le practicaron'] += debit - credit;
      } else if (formatId === '1005') {
        row['Impuesto Descontable'] += debit - credit;
      } else if (formatId === '1006') {
        row['Impuesto generado'] += credit - debit;
      } else if (formatId === '1007') {
        row['Ingresos brutos recibidos'] += credit - debit;
      } else if (formatId === '1008') {
        row['Saldo cuentas por cobrar al 31-12'] += debit - credit;
      } else if (formatId === '1009') {
        row['Saldo cuentas por pagar al 31-12'] += credit - debit;
      } else if (formatId === '1010') {
        row['Valor patrimonial acciones o aportes al 31-12'] += credit - debit;
      } else if (formatId === '1012') {
        row['Valor al 31-12 '] += debit - credit;
      } else if (formatId === '2276') {
        if (code.startsWith('510503') || code.startsWith('510506')) {
          row['Pagos por Salarios (7601)'] += debit - credit;
        } else {
          row['Total ingresos brutos por rentas de trabajo y pensión (suma de L-Z)'] += debit - credit;
        }
      } else {
        // Fallback: put in the first numeric/unfilled column
        const numericCol = cols.find(c => !['Concepto', 'Tipo de documento', 'Número identificación ', 'Primer apellido del informado', 'Segundo apellido del informado', 'Primer nombre del informado', 'Otros nombres del informado', 'Razón social informado', 'Dirección', 'Código dpto', 'Código mcp', 'País de Residencia o domicilio', 'DV'].includes(c));
        if (numericCol) row[numericCol] += debit - credit;
      }
    }

    return row;
  });
}

function parseThirdName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName1: '', lastName2: '', otherNames: '' };
  } else if (parts.length === 2) {
    return { firstName: parts[0], lastName1: parts[1], lastName2: '', otherNames: '' };
  } else if (parts.length === 3) {
    return { firstName: parts[0], lastName1: parts[1], lastName2: parts[2], otherNames: '' };
  } else {
    return { firstName: parts[0], otherNames: parts.slice(1, -2).join(' '), lastName1: parts[parts.length - 2], lastName2: parts[parts.length - 1] };
  }
}

function exportExogenaToExcel(formatId, year, rows, columns) {
  if (!(window as any).XLSX) {
    return showToast('La librería de Excel (SheetJS) no está cargada.', 'error');
  }
  const wsData = [columns];
  rows.forEach(r => {
    wsData.push(columns.map(c => r[c] ?? ''));
  });

  const wb = (window as any).XLSX.utils.book_new();
  const ws = (window as any).XLSX.utils.aoa_to_sheet(wsData);
  (window as any).XLSX.utils.book_append_sheet(wb, ws, `F${formatId}`);
  (window as any).XLSX.writeFile(wb, `Reporte_Exogena_${formatId}_${year}.xlsx`);
  showToast(`Formato ${formatId} exportado con éxito`, 'success');
}

(window as any).renderExogena = renderExogena;
