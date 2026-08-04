/**
 * GRAVY v2.0 — reportes.js
 */
'use strict';

let REPORT_STATE = {
  accounts: null,
  saldos: null,
  transactions: null,
  txLines: null,
  thirdParties: null,
  // Portfolio-specific cache keyed by "mode|asOfDate"
  portfolioCache: {} as Record<string, any[]>,
};

function initAccountSearch(inputEl: HTMLInputElement, hiddenEl: HTMLInputElement, resultsEl: HTMLElement, accounts: any[]) {
  if (!inputEl || !hiddenEl || !resultsEl) return;

  const clickOutsideHandler = (ev: MouseEvent) => {
    if (!inputEl.parentElement?.contains(ev.target as Node)) {
      resultsEl.style.display = 'none';
    }
  };
  document.addEventListener('click', clickOutsideHandler);

  const paint = (query = '') => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = accounts.filter(a => {
      const hay = `${a.code || ''} ${a.name || ''}`.toLowerCase();
      return terms.every(term => hay.includes(term));
    }).slice(0, 30);

    if (!found.length) {
      resultsEl.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin resultados</div>';
      return;
    }

    resultsEl.innerHTML = found.map(a => `
      <button type="button" data-account-id="${(window as any).esc(a.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">
        <div style="font-weight:600">${(window as any).esc(a.code || '')}</div>
        <div style="font-size:12px;color:#6B7280">${(window as any).esc(a.name || '')}</div>
      </button>
    `).join('');
  };

  inputEl.onfocus = () => {
    paint(inputEl.value);
    resultsEl.style.display = 'block';
    inputEl.select();
  };

  inputEl.oninput = () => {
    hiddenEl.value = '';
    paint(inputEl.value);
    resultsEl.style.display = 'block';
  };

  inputEl.onblur = () => setTimeout(() => { resultsEl.style.display = 'none'; }, 150);
  resultsEl.onmousedown = (ev) => ev.preventDefault();
  resultsEl.onclick = (ev) => {
    const btn = (ev.target as HTMLElement).closest('[data-account-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-account-id') || '';
    hiddenEl.value = id;
    const acct = accounts.find(a => a.id === id);
    inputEl.value = acct ? `${acct.code} - ${acct.name}` : '';
    resultsEl.style.display = 'none';
  };

  (window as any).initKeyboardAutocomplete({
    input: inputEl,
    results: resultsEl,
    itemSelector: '[data-account-id]',
  });
}

function initThirdSearch(inputEl: HTMLInputElement, hiddenEl: HTMLInputElement, resultsEl: HTMLElement, thirdParties: any[]) {
  if (!inputEl || !hiddenEl || !resultsEl) return;

  const clickOutsideHandler = (ev: MouseEvent) => {
    if (!inputEl.parentElement?.contains(ev.target as Node)) {
      resultsEl.style.display = 'none';
    }
  };
  document.addEventListener('click', clickOutsideHandler);

  const paint = (query = '') => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = thirdParties.filter(t => {
      const hay = `${t.doc_number || ''} ${t.name || ''}`.toLowerCase();
      return terms.every(term => hay.includes(term));
    }).slice(0, 30);

    if (!found.length) {
      resultsEl.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin resultados</div>';
      return;
    }

    resultsEl.innerHTML = found.map(t => `
      <button type="button" data-third-id="${(window as any).esc(t.id)}" class="w-full text-left px-3 py-2 text-sm" style="border:none;background:#fff;color:#0D2137;cursor:pointer;border-bottom:1px solid #F1F5F9">
        <div style="font-weight:600">${(window as any).esc(t.doc_number || 'SIN DOC')}</div>
        <div style="font-size:12px;color:#6B7280">${(window as any).esc(t.name || '')}</div>
      </button>
    `).join('');
  };

  inputEl.onfocus = () => {
    paint(inputEl.value);
    resultsEl.style.display = 'block';
    inputEl.select();
  };

  inputEl.oninput = () => {
    hiddenEl.value = '';
    paint(inputEl.value);
    resultsEl.style.display = 'block';
  };

  inputEl.onblur = () => setTimeout(() => { resultsEl.style.display = 'none'; }, 150);
  resultsEl.onmousedown = (ev) => ev.preventDefault();
  resultsEl.onclick = (ev) => {
    const btn = (ev.target as HTMLElement).closest('[data-third-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-third-id') || '';
    hiddenEl.value = id;
    const third = thirdParties.find(t => t.id === id);
    inputEl.value = third ? `${third.doc_number || ''} - ${third.name}` : '';
    resultsEl.style.display = 'none';
  };

  (window as any).initKeyboardAutocomplete({
    input: inputEl,
    results: resultsEl,
    itemSelector: '[data-third-id]',
  });
}

async function renderReportes(c) {
  REPORT_STATE.accounts = null;
  REPORT_STATE.saldos = null;
  REPORT_STATE.transactions = null;
  REPORT_STATE.txLines = null;
  REPORT_STATE.thirdParties = null;
  REPORT_STATE.portfolioCache = {};

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Módulo de Reportes</h3>
        <p class="text-sm" style="color:#6B7280">Selecciona el reporte a generar. Se cargan bajo demanda.</p>
      </div>
    </div>

    <!-- Categoría 1: Financieros & Contables -->
    <div class="mb-6">
      <h4 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color:#1A4B8C; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
        <i class="fas fa-calculator"></i> Financieros y Contables
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="report-cards-financial">
        ${reportCard('trial', 'Balance de Prueba', 'Saldos débitos y créditos por cuenta.')}
        ${reportCard('income', 'Estado de Resultados', 'Ingresos, gastos y utilidad neta.')}
        ${reportCard('position', 'Estado de Situación Financiera', 'Activos, pasivos y patrimonio (Balance General).')}
        ${reportCard('journal', 'Libro Diario', 'Detalle cronológico de movimientos contables.')}
        ${reportCard('aux', 'Libro Auxiliar', 'Movimientos por Cuenta y Tercero o Tercero y Cuenta.')}
        ${reportCard('cash-flow', 'Flujo de Caja', 'Detalle de ingresos y egresos de efectivo (Método Directo).')}
        ${reportCard('financial-analysis', 'Análisis Financiero', 'Análisis integrado de cartera, flujo de caja y ejecución presupuestal con gráficos SVG.')}
        ${reportCard('financial-notes', 'Notas a los Estados Financieros', 'Redacte y gestione las revelaciones vinculadas a cada número de nota del ESF y ER.')}
        ${reportCard('cost-centers', 'Balance por Centro de Costo', 'Saldos débitos, créditos y saldo neto agrupados por centro de costo.')}
      </div>
    </div>

    <!-- Categoría 2: Ventas y Cartera -->
    <div class="mb-6">
      <h4 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color:#1A4B8C; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
        <i class="fas fa-chart-line"></i> Ventas y Cartera
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="report-cards-sales">
        ${reportCard('ventas-emision', 'Reporte de Ventas por Emisión', 'Consulta ventas detalladas agrupadas por POS, Factura Estándar o Pedidos.')}
        ${reportCard('ventas-productos', 'Reporte de Ventas por Producto (Acumulado)', 'Consulta los productos vendidos acumulados en un rango de fechas por caja y tipo de emisión.')}
        ${reportCard('ventas-calor', 'Horarios de Calor de Ventas', 'Visualiza el volumen y valor de ventas agrupado por hora del día y día de la semana para identificar horas pico.')}
        ${reportCard('ar-bal', 'Saldos Cuentas por Cobrar', 'Pendientes por tercero y cuenta de cartera.')}
        ${reportCard('ap-bal', 'Saldos Cuentas por Pagar', 'Pendientes por tercero y cuenta por pagar.')}
        ${reportCard('aging', 'Cartera por Edades', 'Tramos 0-30-60-90+ para clientes o proveedores.')}
        ${reportCard('historial-pagos', 'Historial de Pagos de Cartera', 'Detalle cronológico de abonos y pagos recibidos de un cliente en un rango de fechas.')}
        ${reportCard('estado-cuenta-tercero', 'Estado de Cuenta por Tercero', 'Consulta detallada de saldos iniciales, movimientos del período y saldo acumulado por tercero y lapso de tiempo.')}
      </div>
    </div>

    <!-- Categoría 3: Impuestos y Certificaciones -->
    <div class="mb-6">
      <h4 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color:#1A4B8C; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
        <i class="fas fa-file-invoice-dollar"></i> Impuestos y Certificaciones
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="report-cards-taxes">
        ${reportCard('iva', 'Reporte de IVA', 'Consulta IVA generado vs descontable con cuentas configurables.')}
        ${reportCard('retenciones', 'Reporte de Retenciones', 'Consulta retenciones practicadas y a favor por cuenta.')}
        ${reportCard('ret-cert', 'Certificados de Retención', 'Generar certificados de retención (ReteFuente, ReteIVA, ReteICA) para proveedores.')}
        ${reportCard('paz-salvo', 'Certificado de Paz y Salvo', 'Generar certificado de paz y salvo de cartera para clientes.')}
      </div>
    </div>

    <!-- Categoría 4: Auditoría y Gestión -->
    <div class="mb-6">
      <h4 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color:#1A4B8C; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
        <i class="fas fa-shield-alt"></i> Auditoría y Gestión
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="report-cards-audit">
        ${reportCard('consecutive-audit', 'Auditoría de Consecutivos', 'Verifica la secuencia de numeración de comprobantes en un período: detecta faltantes y descuadres.')}
        ${reportCard('budget-execution', 'Ejecución Presupuestal Detallada', 'Seguimiento mensual detallado y transacciones de la ejecución presupuestal.')}
      </div>
    </div>`;

  $('#btn-report-trial')?.addEventListener('click', () => launchReportModal('Balance de Prueba', () => renderTrialBalance()));
  $('#btn-report-income')?.addEventListener('click', () => launchReportModal('Estado de Resultados', () => renderIncomeStatement()));
  $('#btn-report-position')?.addEventListener('click', () => launchReportModal('Estado de Situación Financiera', () => renderFinancialPosition()));
  $('#btn-report-cost-centers')?.addEventListener('click', () => launchReportModal('Balance por Centro de Costo', () => renderCostCentersReport()));
  $('#btn-report-journal')?.addEventListener('click', () => launchReportModal('Libro Diario', () => renderJournalBook()));
  $('#btn-report-aux')?.addEventListener('click', () => launchReportModal('Libro Auxiliar', () => renderAuxiliaryBook()));
  $('#btn-report-ar-bal')?.addEventListener('click', () => launchReportModal('Saldos Cuentas por Cobrar', () => renderPortfolioBalances('cxc')));
  $('#btn-report-ap-bal')?.addEventListener('click', () => launchReportModal('Saldos Cuentas por Pagar', () => renderPortfolioBalances('cxp')));
  $('#btn-report-aging')?.addEventListener('click', () => launchReportModal('Cartera por Edades', () => renderAgingPortfolio()));
  $('#btn-report-ret-cert')?.addEventListener('click', () => launchReportModal('Certificados de Retención', () => renderWithholdingCertificates()));
  $('#btn-report-paz-salvo')?.addEventListener('click', () => launchReportModal('Certificado de Paz y Salvo de Cartera', () => renderPazYSalvoCertificate()));
  $('#btn-report-historial-pagos')?.addEventListener('click', () => launchReportModal('Historial de Pagos de Cartera de un Cliente', () => renderClientPaymentsHistory()));
  $('#btn-report-iva')?.addEventListener('click', () => launchReportModal('Reporte de IVA', () => renderIvaReport()));
  $('#btn-report-retenciones')?.addEventListener('click', () => launchReportModal('Reporte de Retenciones', () => renderRetencionesReport()));
  $('#btn-report-cash-flow')?.addEventListener('click', () => launchReportModal('Reporte de Flujo de Caja', () => renderCashFlowReport()));
  $('#btn-report-financial-analysis')?.addEventListener('click', () => launchReportModal('Análisis Financiero Integrado', () => renderFinancialAnalysisReport()));
  $('#btn-report-ventas-emision')?.addEventListener('click', () => launchReportModal('Reporte de Ventas por Tipo de Emisión', () => renderSalesEmissionReport()));
  $('#btn-report-ventas-productos')?.addEventListener('click', () => launchReportModal('Reporte de Ventas por Producto (Acumulado)', () => renderSalesProductsReport()));
  $('#btn-report-ventas-calor')?.addEventListener('click', () => launchReportModal('Horarios de Calor de Ventas', () => renderSalesHeatmapReport()));
  $('#btn-report-budget-execution')?.addEventListener('click', () => launchReportModal('Ejecución Presupuestal Detallada', () => renderDetailedBudgetExecutionReport()));
  $('#btn-report-financial-notes')?.addEventListener('click', () => launchReportModal('Notas a los Estados Financieros', () => renderFinancialNotesManager()));
  $('#btn-report-consecutive-audit')?.addEventListener('click', () => launchReportModal('Auditoría de Consecutivos de Comprobantes', () => renderConsecutiveAuditReport()));
  $('#btn-report-estado-cuenta-tercero')?.addEventListener('click', () => launchReportModal('Estado de Cuenta por Tercero', () => renderAccountStatementReport()));
}

function getReportViewHost() {
  return $('#report-view-modal') || $('#report-view');
}

function launchReportModal(title, renderFn) {
  openModal(
    `<i class="fas fa-chart-column mr-2" style="color:#1A4B8C"></i>${esc(title)}`,
    '<div id="report-view-modal" class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reporte...</div>',
    '<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>',
    true
  );
  setTimeout(() => {
    renderFn();
  }, 0);
}

function reportCard(id, title, subtitle) {
  return `
    <div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
      <h4 class="font-bold mb-1" style="color:#0D2137">${esc(title)}</h4>
      <p class="text-sm mb-3" style="color:#6B7280">${esc(subtitle)}</p>
      <button class="btn btn-primary btn-sm" id="btn-report-${esc(id)}"><i class="fas fa-play"></i> Generar</button>
    </div>`;
}

async function ensureAccountsSaldos() {
  if (!REPORT_STATE.accounts || !REPORT_STATE.saldos) {
    const [accounts, saldos] = await Promise.all([
      API.getAccounts(false),
      API.getAccountSaldos(),
    ]);
    REPORT_STATE.accounts = accounts;
    REPORT_STATE.saldos = saldos;
  }
  return { accounts: REPORT_STATE.accounts, saldos: REPORT_STATE.saldos };
}

async function ensureThirdParties() {
  if (!REPORT_STATE.thirdParties) {
    REPORT_STATE.thirdParties = await pb.listAll('third_parties', { sort: 'name' });
  }
  return REPORT_STATE.thirdParties;
}

async function ensureLedgerData(explicitToDate = '') {
  // 1. Determinar la fecha límite (toDate) activa en la interfaz de reportes
  let limitDate = explicitToDate;
  if (!limitDate) {
    const toInputs = ['trial-to', 'ledger-to', 'diary-to', 'income-to', 'balance-to', 'exogena-to', 'audit-to', 'cartera-to', 'aux-date-to'];
    for (const id of toInputs) {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el && el.value) {
        limitDate = el.value;
        break;
      }
    }
  }

  // 2. Si la fecha límite requerida cambió, invalidamos la caché de transacciones y líneas
  if ((REPORT_STATE as any).cachedToDate !== limitDate) {
    REPORT_STATE.transactions = null;
    REPORT_STATE.txLines = null;
    (REPORT_STATE as any).cachedToDate = limitDate;
  }

  // Cargar terceros de manera independiente y eficiente si no están en caché
  await ensureThirdParties();

  if (!REPORT_STATE.transactions || !REPORT_STATE.txLines) {
    let txFilter = 'status="active"';
    let linesFilter = 'tx_id.status="active"';
    
    if (limitDate) {
      txFilter += ` && date <= "${limitDate} 23:59:59"`;
      linesFilter += ` && tx_id.date <= "${limitDate} 23:59:59"`;
    }

    const [transactions, txLines] = await Promise.all([
      pb.listAll('transactions', { 
        sort: '-id', 
        expand: 'tx_type_id,third_party_id', 
        filter: txFilter 
      }),
      pb.listAll('tx_lines', { 
        sort: 'id', 
        expand: 'account_id,tx_id', 
        filter: linesFilter 
      }),
    ]);
    REPORT_STATE.transactions = transactions;
    REPORT_STATE.txLines = txLines;
  }
  return {
    transactions: REPORT_STATE.transactions,
    txLines: REPORT_STATE.txLines,
    thirdParties: REPORT_STATE.thirdParties,
  };
}

function getByClass(accounts, saldos) {
  const byClass = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 };
  for (const a of accounts) {
    const cls = (a.code || '').charAt(0);
    byClass[cls] = (byClass[cls] || 0) + Number(saldos[a.id] || 0);
  }
  return byClass;
}

async function getSettingFirst(keys, fallback = '') {
  for (const key of keys) {
    try {
      const value = await API.getSetting(key);
      if (value) return value;
    } catch (_) {}
  }
  return fallback;
}

function fmtSignedAmount(value) {
  const n = Number(value || 0);
  if (n < 0) {
    return { text: `(${fmt(Math.abs(n))})`, isNegative: true };
  }
  return { text: fmt(n), isNegative: false };
}

function fmtSignedPlain(value) {
  const n = Number(value || 0);
  if (n < 0) {
    return `-${fmt(Math.abs(n))}`;
  }
  return fmt(n);
}

function fmtPolarityAmount(value) {
  const n = Number(value || 0);
  const signed = fmtSignedAmount(n);
  if (n < 0) return { text: signed.text, color: '#B91C1C' };
  if (n > 0) return { text: signed.text, color: '#166534' };
  return { text: signed.text, color: '#6B7280' };
}

function getPdfCtorOrWarn() {
  const jsPdfCtor = window.jspdf?.jsPDF;
  if (typeof jsPdfCtor !== 'function') {
    showToast('No se pudo inicializar el generador PDF.', 'error');
    return null;
  }
  return jsPdfCtor;
}

function fmtPdfNum(value) {
  return Number(value || 0).toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtPdfSignedNum(value) {
  const n = Number(value || 0);
  const txt = fmtPdfNum(Math.abs(n));
  return n < 0 ? `-${txt}` : txt;
}

async function getPdfHeaderContext() {
  const [companyName, companyNit, companyAddress, companyCity, companyCountry, softwareName] = await Promise.all([
    API.getSetting('company_name').catch(() => ''),
    API.getSetting('company_nit').catch(() => ''),
    API.getSetting('company_address').catch(() => ''),
    API.getSetting('company_city').catch(() => ''),
    API.getSetting('company_country').catch(() => ''),
    API.getSetting('software_name').catch(() => ''),
  ]);

  return {
    companyName: String(companyName || 'EMPRESA').trim(),
    companyNit: String(companyNit || 'N/A').trim(),
    companyAddress: [companyAddress, companyCity, companyCountry].map(v => String(v || '').trim()).filter(Boolean).join(' / ') || 'Direccion no configurada',
    softwareName: String(softwareName || 'GRAVY v2.0').trim(),
    userName: String(sessionStorage.getItem('user_name') || 'Usuario').trim(),
    generatedAt: new Date().toLocaleString('es-CO'),
  };
}

const TEMPLATE_NOTE_1 = `La copropiedad {empresa} con NIT {nit}, es una entidad sin ánimo de lucro constituida conforme a las leyes colombianas. Su objeto social principal consiste en la administración correcta y eficaz de los bienes y servicios comunes del conjunto, velando por el interés común de los propietarios.

Bases de preparación: Los estados financieros han sido preparados de acuerdo con el marco técnico normativo para los preparadores de información financiera que conforman el Grupo 3 (o Grupo 2 de NIIF para PYMES según corresponda), bajo el Decreto 2420 de 2015 y sus modificaciones reglamentarias.

Periodo contable: Las cifras presentadas corresponden al mes de corte {periodo} y se presentan de forma comparativa.`;

const TEMPLATE_NOTE_2 = `Las principales políticas y prácticas contables aplicadas en la preparación de estos estados financieros son:

1. Base de medición: Costo histórico.
2. Moneda funcional y de presentación: Pesos colombianos (COP).
3. Efectivo y equivalentes: Incluye fondos en caja general, cajas menores y depósitos a la vista en entidades bancarias de disponibilidad inmediata.
4. Propiedades, planta y equipo: Se miden al costo histórico menos depreciación acumulada. Las vidas útiles estimadas son acordes al reglamento de propiedad horizontal y políticas vigentes.
5. Reconocimiento de ingresos y gastos: Se reconocen por el método de causación o devengo.
6. Juicios y estimaciones de la gerencia: Evaluaciones continuas basadas en la experiencia histórica para estimación de cartera de difícil cobro o provisiones de imprevistos.`;

async function getPopulatedTemplate(templateText: string, periodStr: string): Promise<string> {
  const headerCtx = await getPdfHeaderContext();
  const empresa = headerCtx.companyName || '________________________';
  const nit = headerCtx.companyNit || '________________________';
  
  let formattedPeriod = periodStr;
  try {
    const y = Number(periodStr.slice(0, 4));
    const m = Number(periodStr.slice(5, 7));
    const dt = new Date(y, m - 1, 1);
    if (!Number.isNaN(dt.getTime())) {
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      formattedPeriod = `${monthNames[m - 1]} de ${y}`;
    }
  } catch (_) {}

  return templateText
    .replace(/{empresa}/g, empresa)
    .replace(/{nit}/g, nit)
    .replace(/{periodo}/g, formattedPeriod);
}

function getNoteSupportingData(accounts: any[], balNow: Record<string, number>, balCmp: Record<string, number>, prefixes: string[]): any[] {
  const detail = [];
  const EPS = 0.01;
  
  for (const acc of accounts) {
    const code = String(acc.code || '');
    if (!prefixes.some(p => code.startsWith(p))) continue;
    const level = Number(acc.level || 1);
    if (level !== 3 && level !== 4) continue;

    let sumNow = Number(balNow[acc.id] || 0);
    let sumCmp = Number(balCmp[acc.id] || 0);
    
    for (const child of accounts) {
      const childCode = String(child.code || '');
      if (childCode.startsWith(code) && child.id !== acc.id) {
        sumNow += Number(balNow[child.id] || 0);
        sumCmp += Number(balCmp[child.id] || 0);
      }
    }

    if (Math.abs(sumNow) < EPS && Math.abs(sumCmp) < EPS) continue;

    // Adjust sign for liability (2), equity (3), and revenue (4) accounts
    const cls = code.charAt(0);
    if (cls === '2' || cls === '3' || cls === '4') {
      sumNow = -sumNow;
      sumCmp = -sumCmp;
    }

    detail.push({
      code,
      name: acc.name || code,
      now: sumNow,
      cmp: sumCmp,
      variation: sumNow - sumCmp
    });
  }

  return detail.sort((a, b) => a.code.localeCompare(b.code));
}

function drawPdfHeader(doc, headerCtx, cfg) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 24;
  const right = pageWidth - 24;
  const title = String(cfg?.title || '').trim();
  const subtitles = Array.isArray(cfg?.subtitles) ? cfg.subtitles : [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(13, 33, 55);
  doc.text(headerCtx.companyName, left, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`NIT: ${headerCtx.companyNit}`, left, 30);
  doc.text(headerCtx.companyAddress, left, 40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(13, 33, 55);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  subtitles.slice(0, 3).forEach((line, idx) => {
    doc.text(String(line || ''), pageWidth / 2, 30 + (idx * 10), { align: 'center' });
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(headerCtx.softwareName, right, 20, { align: 'right' });
  doc.text(`Usuario: ${headerCtx.userName}`, right, 30, { align: 'right' });
  doc.text(`Impreso: ${headerCtx.generatedAt}`, right, 40, { align: 'right' });

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(left, 58, right, 58);

  return {
    marginLeft: left,
    marginRight: right,
    startY: 66,
  };
}

function drawPdfFooter(doc, pageNumber) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Reporte generado por GRAVY', 24, pageHeight - 10);
  doc.text(`Pagina ${pageNumber}`, pageWidth - 24, pageHeight - 10, { align: 'right' });
}

function diffDays(fromDate, toDate) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function diffDaysSigned(fromDate, toDate) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + Number(n || 0));
  return (window as any).getColombiaDateStr(d);
}

function agingBucket(expiredDays) {
  if (expiredDays < 0) return 'por_vencer';
  if (expiredDays <= 30) return 'b0_30';
  if (expiredDays <= 60) return 'b31_60';
  if (expiredDays <= 90) return 'b61_90';
  return 'b90p';
}

async function buildOpenPortfolioDocs({ mode = 'cxc', asOfDate = todayStr(), thirdType = '' } = {}) {
  const cacheKey = `${mode}|${asOfDate}|${thirdType}`;
  if (REPORT_STATE.portfolioCache[cacheKey]) {
    return REPORT_STATE.portfolioCache[cacheKey];
  }

  const items = await pb.send(`/api/gravy/report-portfolio-aging?mode=${mode}&asOfDate=${asOfDate}&thirdType=${encodeURIComponent(thirdType)}`, {
    method: 'GET'
  });

  REPORT_STATE.portfolioCache[cacheKey] = items || [];
  return items || [];
}

/**
 * Dedicated, optimized query for Cartera por Edades.
 * Fetches ONLY the account codes relevant to the mode (13 for CxC, 22/23/25 for CxP)
 * and filters by date server-side. Uses a local cache keyed by mode|asOfDate.
 */
async function buildAgingDocsDirect({ mode = 'cxc', asOfDate = todayStr() } = {}) {
  return buildOpenPortfolioDocs({ mode, asOfDate, thirdType: '' });
}

async function renderPortfolioBalances(mode) {
  const view = getReportViewHost();
  if (!view) return;

  const isCxc = mode === 'cxc';
  const title = isCxc ? 'Saldos de Cuentas por Cobrar' : 'Saldos de Cuentas por Pagar';
  const defaultThirdType = isCxc ? 'CLIENTE' : 'PROVEEDOR';
  const entityLabel = isCxc ? 'clientes' : 'proveedores';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">${esc(title)}</h4>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="form-group">
          <label class="form-label">Corte</label>
          <input id="bal-cutoff" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de tercero</label>
          <select id="bal-third-type" class="form-input">
            <option value="">Todos</option>
            <option value="CLIENTE" ${defaultThirdType === 'CLIENTE' ? 'selected' : ''}>Cliente</option>
            <option value="PROVEEDOR" ${defaultThirdType === 'PROVEEDOR' ? 'selected' : ''}>Proveedor</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-bal"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-bal" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-bal" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
      <p class="text-xs mt-3" style="color:#6B7280">Reporte de saldo abierto por documento de cruce, agrupado por tercero y cuenta (${esc(entityLabel)}).</p>
    </div>
    <div id="bal-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>`;

  let lastExportRows = [];
  let lastPdfRows = [];

  const generate = async () => {
    const results = $('#bal-results');
    if (!results) return;

    const asOfDate = getInputVal('bal-cutoff');
    const thirdType = getSelectVal('bal-third-type');
    if (!asOfDate) return showToast('Selecciona la fecha de corte.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando reporte...</div>';

    try {
      const docs = await buildOpenPortfolioDocs({ mode, asOfDate, thirdType });

      if (!docs.length) {
        results.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</div>';
        lastExportRows = [];
        lastPdfRows = [];
        if ($('#btn-exp-bal')) $('#btn-exp-bal').disabled = true;
        if ($('#btn-pdf-bal')) $('#btn-pdf-bal').disabled = true;
        return;
      }

      const byThirdAccount = new Map();
      for (const d of docs) {
        const key = `${d.third_id}|${d.account_id}`;
        if (!byThirdAccount.has(key)) {
          byThirdAccount.set(key, {
            third_name: d.third_name,
            third_doc: d.third_doc,
            third_type: d.third_type,
            account_code: d.account_code,
            account_name: d.account_name,
            docs_count: 0,
            open_total: 0,
            max_days: 0,
          });
        }
        const row = byThirdAccount.get(key);
        row.docs_count += 1;
        row.open_total += Number(d.open || 0);
        row.max_days = Math.max(row.max_days, Number(d.days || 0));
      }

      const rows = [...byThirdAccount.values()].sort((a, b) => {
        const aKey = `${a.third_name}|${a.account_code}`;
        const bKey = `${b.third_name}|${b.account_code}`;
        return aKey.localeCompare(bKey);
      });

      const totalOpen = rows.reduce((s, r) => s + Number(r.open_total || 0), 0);
      const totalDocs = rows.reduce((s, r) => s + Number(r.docs_count || 0), 0);

      results.innerHTML = `
        <div class="p-4 border-b flex flex-wrap items-center justify-between gap-3" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Terceros/cuentas: <strong>${fmtN(rows.length)}</strong> · Documentos: <strong>${fmtN(totalDocs)}</strong> · Saldo abierto: <strong>${fmt(totalOpen)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:460px">
          <table class="data-table">
            <thead><tr><th>Tercero</th><th>Cuenta</th><th># Docs</th><th>Antigüedad máx. (días)</th><th>Saldo abierto</th></tr></thead>
            <tbody>
              ${rows.map(r => `<tr>
                <td>${esc(r.third_doc ? `${r.third_doc} - ${r.third_name}` : r.third_name)}</td>
                <td>${esc(r.account_code)} - ${esc(r.account_name)}</td>
                <td>${fmtN(r.docs_count)}</td>
                <td>${fmtN(r.max_days)}</td>
                <td class="font-semibold" style="color:${isCxc ? '#065F46' : '#1E3A8A'}">${fmt(r.open_total)}</td>
              </tr>`).join('')}
            </tbody>
            <tfoot><tr><td colspan="4" class="font-bold">Total saldo abierto</td><td class="font-bold">${fmt(totalOpen)}</td></tr></tfoot>
          </table>
        </div>`;

      lastExportRows = rows.map(r => ({
        tercero: r.third_name,
        documento: r.third_doc,
        tipo_tercero: r.third_type,
        cuenta_codigo: r.account_code,
        cuenta_nombre: r.account_name,
        documentos: r.docs_count,
        antiguedad_max_dias: r.max_days,
        saldo_abierto: r.open_total,
      }));
      lastPdfRows = rows.map(r => ({ ...r }));

      if ($('#btn-exp-bal')) $('#btn-exp-bal').disabled = !lastExportRows.length;
      if ($('#btn-pdf-bal')) $('#btn-pdf-bal').disabled = !lastPdfRows.length;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastExportRows = [];
      lastPdfRows = [];
      if ($('#btn-exp-bal')) $('#btn-exp-bal').disabled = true;
      if ($('#btn-pdf-bal')) $('#btn-pdf-bal').disabled = true;
    }
  };

  $('#btn-gen-bal')?.addEventListener('click', generate);
  $('#btn-exp-bal')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    exportToExcel(lastExportRows, [
      { key: 'tercero', label: 'Tercero' },
      { key: 'documento', label: 'Documento' },
      { key: 'cuenta_codigo', label: 'Código cuenta' },
      { key: 'cuenta_nombre', label: 'Nombre cuenta' },
      { key: 'documentos', label: '# Documentos' },
      { key: 'antiguedad_max_dias', label: 'Antigüedad máx. (días)' },
      { key: 'saldo_abierto', label: 'Saldo abierto' },
    ], mode === 'cxc' ? 'saldos_cuentas_por_cobrar' : 'saldos_cuentas_por_pagar');
  });
  $('#btn-pdf-bal')?.addEventListener('click', async () => {
    if (!lastPdfRows.length) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const asOfDate = getInputVal('bal-cutoff') || todayStr();
      const thirdType = getSelectVal('bal-third-type') || 'TODOS';
      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const header = drawPdfHeader(doc, headerCtx, {
        title,
        subtitles: [`Corte: ${asOfDate}`, `Tipo de tercero: ${thirdType}`],
      });

      const totalOpen = lastPdfRows.reduce((s, r) => s + Number(r.open_total || 0), 0);
      const totalDocs = lastPdfRows.reduce((s, r) => s + Number(r.docs_count || 0), 0);
      const body = lastPdfRows.map(r => [
        r.third_doc ? `${r.third_doc} - ${r.third_name}` : r.third_name,
        `${r.account_code} - ${r.account_name}`.trim(),
        fmtN(r.docs_count),
        fmtN(r.max_days),
        fmtPdfNum(r.open_total || 0),
      ]);

      body.push(['TOTAL', '', fmtN(totalDocs), '', fmtPdfNum(totalOpen)]);

      doc.autoTable({
        startY: header.startY,
        head: [['Tercero', 'Cuenta', '# Docs', 'Antiguedad max. (dias)', 'Saldo abierto']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 7.2, textColor: [55, 55, 55], cellPadding: 2.4, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.3, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0: { cellWidth: 170 },
          1: { cellWidth: 195 },
          2: { cellWidth: 56, halign: 'right' },
          3: { cellWidth: 63, halign: 'right' },
          4: { cellWidth: 80, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const isTotal = data.row.index === body.length - 1;
          if (isTotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.2 };
            data.cell.styles.lineColor = [13, 33, 55];
          }
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`${mode === 'cxc' ? 'saldos_cuentas_por_cobrar' : 'saldos_cuentas_por_pagar'}_${asOfDate}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

async function renderAgingPortfolio() {
  const view = getReportViewHost();
  if (!view) return;

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Cartera por Edades (Por Vencer / 0-30-60-90+)</h4>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="form-group">
          <label class="form-label">Fecha de corte</label>
          <input id="age-cutoff" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de cartera</label>
          <select id="age-mode" class="form-input">
            <option value="cxc">Clientes (CxC) — Ctas. 13</option>
            <option value="cxp">Proveedores (CxP) — Ctas. 22/23/25</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-aging"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end gap-2">
          <button class="btn btn-outline flex-1" id="btn-pdf-aging" disabled><i class="fas fa-file-pdf"></i> PDF</button>
          ${can('canExport') ? '<button class="btn btn-outline flex-1" id="btn-exp-aging" disabled><i class="fas fa-file-excel"></i> Excel</button>' : ''}
        </div>
      </div>
      <p class="text-xs mt-2" style="color:#9CA3AF"><i class="fas fa-info-circle mr-1"></i>El tipo de cartera determina automáticamente las cuentas y el perfil de tercero a consultar.</p>
    </div>
    <div id="aging-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-hourglass-half mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>`;

  let lastExportRows = [];
  let lastPdfRows = [];
  let lastPdfMeta = {};

  const generate = async () => {
    const results = $('#aging-results');
    if (!results) return;

    const asOfDate = getInputVal('age-cutoff');
    const mode = getSelectVal('age-mode') || 'cxc';
    if (!asOfDate) return showToast('Selecciona la fecha de corte.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando cartera por edades...</div>';

    try {
      const docs = await buildAgingDocsDirect({ mode, asOfDate });

      if (!docs.length) {
        results.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</div>';
        lastExportRows = []; lastPdfRows = [];
        if ($('#btn-exp-aging')) $('#btn-exp-aging').disabled = true;
        if ($('#btn-pdf-aging')) $('#btn-pdf-aging').disabled = true;
        return;
      }

      const rows = docs.map(d => {
        const isSaldoAFavor = d.bucket === 'saldo_a_favor';
        const saldoAFavorVal = isSaldoAFavor ? Math.abs(Number(d.open || 0)) : 0;
        return {
          tercero: d.third_name,
          documento_tercero: d.third_doc,
          cuenta_id: d.account_id,
          cuenta: `${d.account_code} - ${d.account_name}`.trim(),
          cuenta_code: d.account_code,
          documento_cruce: d.doc_ref,
          fecha_documento: d.doc_date,
          plazo_dias: Number(d.payment_days || 0),
          vencimiento: d.due_date,
          expired_days: Number(d.expired_days || 0),
          saldo_a_favor: saldoAFavorVal,
          por_vencer:  d.bucket === 'por_vencer' ? Number(d.open || 0) : 0,
          de_0_a_30:   d.bucket === 'b0_30'      ? Number(d.open || 0) : 0,
          de_31_a_60:  d.bucket === 'b31_60'     ? Number(d.open || 0) : 0,
          de_61_a_90:  d.bucket === 'b61_90'     ? Number(d.open || 0) : 0,
          mayor_a_90:  d.bucket === 'b90p'       ? Number(d.open || 0) : 0,
          total: Number(d.open || 0),
        };
      }).sort((a, b) => {
        const aKey = `${a.cuenta_code}|${a.tercero}|${a.fecha_documento}|${a.documento_cruce}`;
        const bKey = `${b.cuenta_code}|${b.tercero}|${b.fecha_documento}|${b.documento_cruce}`;
        return aKey.localeCompare(bKey);
      });

      const totals = rows.reduce((acc, r) => {
        acc.saldo_a_favor += r.saldo_a_favor;
        acc.por_vencer     += r.por_vencer;
        acc.de_0_a_30      += r.de_0_a_30;
        acc.de_31_a_60     += r.de_31_a_60;
        acc.de_61_a_90     += r.de_61_a_90;
        acc.mayor_a_90     += r.mayor_a_90;
        acc.total          += r.total;
        return acc;
      }, { saldo_a_favor: 0, por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 });

      const carteraLabel = mode === 'cxc' ? 'Clientes (CxC)' : 'Proveedores (CxP)';

      // Group by account for section headers in table
      const byAccount = new Map();
      for (const r of rows) {
        if (!byAccount.has(r.cuenta)) byAccount.set(r.cuenta, []);
        byAccount.get(r.cuenta).push(r);
      }

      const bodyRowsHtml = [];
      for (const [cuenta, cuentaRows] of byAccount) {
        bodyRowsHtml.push(`<tr style="background:#F0F4F8">
            <td colspan="12" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
              <i class="fas fa-bookmark mr-1" style="color:#E87D1E"></i>${esc(cuenta)}
            </td>
          </tr>`);
        
        let accountSubtotal = { saldo_a_favor: 0, por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
        
        // Group by third party within this account
        const byThird = new Map();
        for (const r of cuentaRows) {
          const key = r.tercero;
          if (!byThird.has(key)) byThird.set(key, []);
          byThird.get(key).push(r);
        }
        
        for (const [tercero, terceroRows] of byThird) {
          let thirdSubtotal = { saldo_a_favor: 0, por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
          for (const r of terceroRows) {
            const expColor = r.saldo_a_favor > 0 ? '#2563EB' : (r.expired_days < 0 ? '#059669' : r.expired_days <= 30 ? '#D97706' : '#EF4444');
            bodyRowsHtml.push(`<tr>
              <td>${esc(r.documento_tercero ? `${r.documento_tercero} - ${r.tercero}` : r.tercero)}</td>
              <td><span class="font-mono">${esc(r.documento_cruce)}</span></td>
              <td>${esc(r.fecha_documento)}</td>
              <td style="text-align:right">${fmtN(r.plazo_dias)}</td>
              <td>${esc(r.vencimiento)}</td>
              <td style="color:#2563EB;font-weight:${r.saldo_a_favor > 0 ? '600' : '400'}">${r.saldo_a_favor > 0 ? `-${fmt(r.saldo_a_favor)}` : fmt(0)}</td>
              <td style="color:${expColor};font-weight:${r.por_vencer > 0 ? '600' : '400'}">${fmt(r.por_vencer)}</td>
              <td>${fmt(r.de_0_a_30)}</td>
              <td>${fmt(r.de_31_a_60)}</td>
              <td>${fmt(r.de_61_a_90)}</td>
              <td>${fmt(r.mayor_a_90)}</td>
              <td class="font-semibold" style="color:#0D2137">${fmt(r.total)}</td>
            </tr>`);
            thirdSubtotal.saldo_a_favor += r.saldo_a_favor;
            thirdSubtotal.por_vencer += r.por_vencer;
            thirdSubtotal.de_0_a_30 += r.de_0_a_30;
            thirdSubtotal.de_31_a_60 += r.de_31_a_60;
            thirdSubtotal.de_61_a_90 += r.de_61_a_90;
            thirdSubtotal.mayor_a_90 += r.mayor_a_90;
            thirdSubtotal.total += r.total;
          }
          
          bodyRowsHtml.push(`<tr style="background:#F9FAFB">
            <td colspan="5" class="font-semibold text-xs" style="padding-left: 20px; color:#4B5563">Subtotal ${esc(tercero)}</td>
            <td class="font-semibold text-xs text-right" style="color:#2563EB">${thirdSubtotal.saldo_a_favor > 0 ? `-${fmt(thirdSubtotal.saldo_a_favor)}` : fmt(0)}</td>
            <td class="font-semibold text-xs text-right" style="color:#059669">${fmt(thirdSubtotal.por_vencer)}</td>
            <td class="font-semibold text-xs text-right" style="color:#4B5563">${fmt(thirdSubtotal.de_0_a_30)}</td>
            <td class="font-semibold text-xs text-right" style="color:#4B5563">${fmt(thirdSubtotal.de_31_a_60)}</td>
            <td class="font-semibold text-xs text-right" style="color:#4B5563">${fmt(thirdSubtotal.de_61_a_90)}</td>
            <td class="font-semibold text-xs text-right" style="color:#4B5563">${fmt(thirdSubtotal.mayor_a_90)}</td>
            <td class="font-semibold text-xs text-right" style="color:#1F2937">${fmt(thirdSubtotal.total)}</td>
          </tr>`);
          
          accountSubtotal.saldo_a_favor += thirdSubtotal.saldo_a_favor;
          accountSubtotal.por_vencer += thirdSubtotal.por_vencer;
          accountSubtotal.de_0_a_30 += thirdSubtotal.de_0_a_30;
          accountSubtotal.de_31_a_60 += thirdSubtotal.de_31_a_60;
          accountSubtotal.de_61_a_90 += thirdSubtotal.de_61_a_90;
          accountSubtotal.mayor_a_90 += thirdSubtotal.mayor_a_90;
          accountSubtotal.total += thirdSubtotal.total;
        }
        
        bodyRowsHtml.push(`<tr style="background:#FDF6E3">
            <td colspan="5" class="font-bold">Subtotal Cuenta ${esc(cuenta)}</td>
            <td class="font-bold" style="color:#2563EB">${accountSubtotal.saldo_a_favor > 0 ? `-${fmt(accountSubtotal.saldo_a_favor)}` : fmt(0)}</td>
            <td class="font-bold" style="color:#059669">${fmt(accountSubtotal.por_vencer)}</td>
            <td class="font-bold">${fmt(accountSubtotal.de_0_a_30)}</td>
            <td class="font-bold">${fmt(accountSubtotal.de_31_a_60)}</td>
            <td class="font-bold">${fmt(accountSubtotal.de_61_a_90)}</td>
            <td class="font-bold">${fmt(accountSubtotal.mayor_a_90)}</td>
            <td class="font-bold" style="color:#0D2137">${fmt(accountSubtotal.total)}</td>
          </tr>`);
      }

      results.innerHTML = `
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Cartera: <strong>${esc(carteraLabel)}</strong> · Corte: <strong>${esc(asOfDate)}</strong> · Documentos: <strong>${fmtN(rows.length)}</strong> · Total Neto: <strong>${fmt(totals.total)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:480px">
          <table class="data-table">
            <thead><tr>
              <th>Tercero</th><th>Doc. Cruce</th><th>Fecha Doc.</th>
              <th style="text-align:right">Plazo</th><th>Vencimiento</th>
              <th style="color:#2563EB">Saldo a Favor</th><th>Por Vencer</th><th>0-30 días</th><th>31-60 días</th><th>61-90 días</th><th>Más de 90</th><th>Total</th>
            </tr></thead>
            <tbody>${bodyRowsHtml.join('')}</tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">Total general</td>
                <td class="font-bold" style="color:#2563EB">${totals.saldo_a_favor > 0 ? `-${fmt(totals.saldo_a_favor)}` : fmt(0)}</td>
                <td class="font-bold" style="color:#059669">${fmt(totals.por_vencer)}</td>
                <td class="font-bold">${fmt(totals.de_0_a_30)}</td>
                <td class="font-bold">${fmt(totals.de_31_a_60)}</td>
                <td class="font-bold">${fmt(totals.de_61_a_90)}</td>
                <td class="font-bold">${fmt(totals.mayor_a_90)}</td>
                <td class="font-bold">${fmt(totals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`;

      lastExportRows = rows.map(r => ({ ...r }));
      lastPdfRows = rows.map(r => ({ ...r }));
      lastPdfMeta = { asOfDate, mode, carteraLabel };

      if ($('#btn-exp-aging')) $('#btn-exp-aging').disabled = !lastExportRows.length;
      if ($('#btn-pdf-aging')) $('#btn-pdf-aging').disabled = !lastPdfRows.length;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastExportRows = []; lastPdfRows = [];
      if ($('#btn-exp-aging')) $('#btn-exp-aging').disabled = true;
      if ($('#btn-pdf-aging')) $('#btn-pdf-aging').disabled = true;
    }
  };

  $('#btn-gen-aging')?.addEventListener('click', generate);

  $('#btn-exp-aging')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    exportToExcel(lastExportRows, [
      { key: 'tercero',           label: 'Tercero' },
      { key: 'documento_tercero', label: 'Documento tercero' },
      { key: 'cuenta',            label: 'Cuenta' },
      { key: 'documento_cruce',   label: 'Doc. Cruce' },
      { key: 'fecha_documento',   label: 'Fecha documento' },
      { key: 'plazo_dias',        label: 'Plazo (días)' },
      { key: 'vencimiento',       label: 'Vencimiento' },
      { key: 'saldo_a_favor',     label: 'Saldo a Favor' },
      { key: 'por_vencer',        label: 'Por Vencer' },
      { key: 'de_0_a_30',         label: '0-30 días' },
      { key: 'de_31_a_60',        label: '31-60 días' },
      { key: 'de_61_a_90',        label: '61-90 días' },
      { key: 'mayor_a_90',        label: 'Más de 90 días' },
      { key: 'total',             label: 'Total' },
    ], `cartera_por_edades_${lastPdfMeta.mode || 'cxc'}`);
  });

  $('#btn-pdf-aging')?.addEventListener('click', async () => {
    if (!lastPdfRows.length) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const { asOfDate, carteraLabel } = lastPdfMeta;

      const totals = lastPdfRows.reduce((acc, r) => {
        acc.saldo_a_favor += Number(r.saldo_a_favor || 0);
        acc.por_vencer     += Number(r.por_vencer     || 0);
        acc.de_0_a_30      += Number(r.de_0_a_30      || 0);
        acc.de_31_a_60     += Number(r.de_31_a_60     || 0);
        acc.de_61_a_90     += Number(r.de_61_a_90     || 0);
        acc.mayor_a_90     += Number(r.mayor_a_90     || 0);
        acc.total          += Number(r.total         || 0);
        return acc;
      }, { saldo_a_favor: 0, por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 });

      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Cartera por Edades',
        subtitles: [
          `Corte: ${asOfDate}`,
          `Cartera: ${carteraLabel}`,
        ],
      });

      // Build body — group by account with section header rows and subtotals
      const body = [];
      const accountGroups = new Map();
      for (const r of lastPdfRows) {
        if (!accountGroups.has(r.cuenta)) accountGroups.set(r.cuenta, []);
        accountGroups.get(r.cuenta).push(r);
      }

      const accountSectionIndices = new Set();
      const subtotalIndices = new Set();
      const thirdSubtotalIndices = new Set();
      let rowIdx = 0;
      const hasMultipleAccounts = accountGroups.size > 1;

      for (const [cuenta, cuentaRows] of accountGroups) {
        if (hasMultipleAccounts) {
          body.push([{ content: cuenta, colSpan: 12, styles: { fontStyle: 'bold', fillColor: [235, 240, 248], textColor: [13, 33, 55] } }]);
          accountSectionIndices.add(rowIdx++);
        }
        
        const byThird = new Map();
        for (const r of cuentaRows) {
          const key = r.tercero;
          if (!byThird.has(key)) byThird.set(key, []);
          byThird.get(key).push(r);
        }

        let accountSubtotal = { saldo_a_favor: 0, por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
        for (const [tercero, terceroRows] of byThird) {
          let thirdSubtotal = { saldo_a_favor: 0, por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
          for (const r of terceroRows) {
            body.push([
              r.documento_tercero ? `${r.documento_tercero} - ${r.tercero}` : r.tercero,
              r.documento_cruce,
              r.fecha_documento,
              String(r.plazo_dias || 0),
              r.vencimiento,
              r.saldo_a_favor > 0 ? `-${fmtPdfNum(r.saldo_a_favor)}` : fmtPdfNum(0),
              fmtPdfNum(r.por_vencer),
              fmtPdfNum(r.de_0_a_30),
              fmtPdfNum(r.de_31_a_60),
              fmtPdfNum(r.de_61_a_90),
              fmtPdfNum(r.mayor_a_90),
              fmtPdfNum(r.total),
            ]);
            thirdSubtotal.saldo_a_favor += Number(r.saldo_a_favor || 0);
            thirdSubtotal.por_vencer += Number(r.por_vencer || 0);
            thirdSubtotal.de_0_a_30 += Number(r.de_0_a_30 || 0);
            thirdSubtotal.de_31_a_60 += Number(r.de_31_a_60 || 0);
            thirdSubtotal.de_61_a_90 += Number(r.de_61_a_90 || 0);
            thirdSubtotal.mayor_a_90 += Number(r.mayor_a_90 || 0);
            thirdSubtotal.total += Number(r.total || 0);
            rowIdx++;
          }
          body.push([
            `Subtotal ${tercero}`, '', '', '', '',
            thirdSubtotal.saldo_a_favor > 0 ? `-${fmtPdfNum(thirdSubtotal.saldo_a_favor)}` : fmtPdfNum(0),
            fmtPdfNum(thirdSubtotal.por_vencer),
            fmtPdfNum(thirdSubtotal.de_0_a_30),
            fmtPdfNum(thirdSubtotal.de_31_a_60),
            fmtPdfNum(thirdSubtotal.de_61_a_90),
            fmtPdfNum(thirdSubtotal.mayor_a_90),
            fmtPdfNum(thirdSubtotal.total),
          ]);
          thirdSubtotalIndices.add(rowIdx++);
          accountSubtotal.saldo_a_favor += thirdSubtotal.saldo_a_favor;
          accountSubtotal.por_vencer += thirdSubtotal.por_vencer;
          accountSubtotal.de_0_a_30 += thirdSubtotal.de_0_a_30;
          accountSubtotal.de_31_a_60 += thirdSubtotal.de_31_a_60;
          accountSubtotal.de_61_a_90 += thirdSubtotal.de_61_a_90;
          accountSubtotal.mayor_a_90 += thirdSubtotal.mayor_a_90;
          accountSubtotal.total += thirdSubtotal.total;
        }

        if (hasMultipleAccounts) {
          body.push([
            `Subtotal Cuenta ${cuenta}`, '', '', '', '',
            accountSubtotal.saldo_a_favor > 0 ? `-${fmtPdfNum(accountSubtotal.saldo_a_favor)}` : fmtPdfNum(0),
            fmtPdfNum(accountSubtotal.por_vencer),
            fmtPdfNum(accountSubtotal.de_0_a_30),
            fmtPdfNum(accountSubtotal.de_31_a_60),
            fmtPdfNum(accountSubtotal.de_61_a_90),
            fmtPdfNum(accountSubtotal.mayor_a_90),
            fmtPdfNum(accountSubtotal.total),
          ]);
          subtotalIndices.add(rowIdx++);
        }
      }
      body.push([
        'TOTAL', '', '', '', '',
        totals.saldo_a_favor > 0 ? `-${fmtPdfNum(totals.saldo_a_favor)}` : fmtPdfNum(0),
        fmtPdfNum(totals.por_vencer),
        fmtPdfNum(totals.de_0_a_30),
        fmtPdfNum(totals.de_31_a_60),
        fmtPdfNum(totals.de_61_a_90),
        fmtPdfNum(totals.mayor_a_90),
        fmtPdfNum(totals.total)
      ]);

      doc.autoTable({
        startY: header.startY,
        head: [['Tercero', 'Cruce', 'Fecha', 'Plazo', 'Vencimiento', 'Saldo a Favor', 'Por Vencer', '0-30', '31-60', '61-90', '>90', 'Total']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 7.2, textColor: [55, 55, 55], cellPadding: 2.2, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.5, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0:  { cellWidth: 154 },
          1:  { cellWidth: 65 },
          2:  { cellWidth: 50 },
          3:  { cellWidth: 30, halign: 'right' },
          4:  { cellWidth: 48 },
          5:  { cellWidth: 55, halign: 'right' },
          6:  { cellWidth: 55, halign: 'right' },
          7:  { cellWidth: 44, halign: 'right' },
          8:  { cellWidth: 44, halign: 'right' },
          9:  { cellWidth: 44, halign: 'right' },
          10: { cellWidth: 44, halign: 'right' },
          11: { cellWidth: 65, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const isTotal = data.row.index === body.length - 1;
          const isSubtotal = subtotalIndices.has(data.row.index);
          const isThirdSubtotal = thirdSubtotalIndices.has(data.row.index);
          if (isTotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.2 };
            data.cell.styles.lineColor = [13, 33, 55];
          } else if (isSubtotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [253, 246, 227];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.1 };
            data.cell.styles.lineColor = [13, 33, 55];
          } else if (isThirdSubtotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [249, 250, 251];
            data.cell.styles.textColor = [55, 65, 81];
            data.cell.styles.lineWidth = { top: 0.05 };
            data.cell.styles.lineColor = [200, 200, 200];
          }
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`cartera_por_edades_${lastPdfMeta.mode || 'cxc'}_${asOfDate}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

async function renderTrialBalance() {
  const view = getReportViewHost();
  if (!view) return;
  const today = todayStr();
  const fromDefault = `${today.slice(0, 7)}-01`;
  const defaultSignaturesSetting = await getSettingFirst(['trial_show_signatures_default', 'show_signatures_default'], '0');
  const signaturesChecked = String(defaultSignaturesSetting).trim() === '1' || String(defaultSignaturesSetting).toLowerCase() === 'true';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Balance de Prueba (Detallado)</h4>
      <div class="grid grid-cols-1 md:grid-cols-9 gap-3">
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input id="trial-from" type="date" class="form-input" value="${fromDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input id="trial-to" type="date" class="form-input" value="${today}">
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta / Grupo</label>
          <input id="trial-account-prefix" type="text" class="form-input" placeholder="Todas (ej. 24, 1105)" list="trial-accounts-list" autocomplete="off">
          <datalist id="trial-accounts-list"></datalist>
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="trial-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="trial-show-third" type="checkbox">
            Mostrar terceros
          </label>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="trial-show-signatures" type="checkbox" ${signaturesChecked ? 'checked' : ''}>
            Mostrar firmas
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-trial"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-trial" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-trial" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="trial-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona el lapso y pulsa Generar.
    </div>`;

  ensureAccountsSaldos().then(({ accounts }) => {
    const listEl = $('#trial-accounts-list');
    if (listEl && accounts && accounts.length) {
      const sortedAccs = [...accounts].sort((a, b) => (String(a.code || '')).localeCompare(String(b.code || '')));
      listEl.innerHTML = sortedAccs
        .map(a => `<option value="${esc(a.code)}">${esc(a.code)} - ${esc(a.name)}</option>`)
        .join('');
    }
  }).catch(() => {});

  let lastExportRows = [];
  let lastTrialPdf = null;

  const generate = async () => {
    const results = $('#trial-results');
    if (!results) return;
    const fromDate = getInputVal('trial-from');
    const toDate = getInputVal('trial-to');
    const rawAccountFilter = getInputVal('trial-account-prefix').trim();
    const accountPrefix = rawAccountFilter.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const selectedLevel = getSelectVal('trial-level');
    const maxLevel = selectedLevel === 'all' ? Number.POSITIVE_INFINITY : Number(selectedLevel || 3);
    const includeThird = getCheckVal('trial-show-third');
    const includeSignatures = getCheckVal('trial-show-signatures');

    if (!fromDate || !toDate) {
      return showToast('Selecciona el lapso (desde y hasta).', 'warning');
    }
    if (fromDate > toDate) {
      return showToast('La fecha Desde no puede ser mayor que Hasta.', 'warning');
    }

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Balance de Prueba...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();
      const url = `/api/gravy/report-trial-balance?fromDate=${fromDate}&toDate=${toDate}&includeThird=${includeThird}${accountPrefix ? `&accountPrefix=${encodeURIComponent(accountPrefix)}` : ''}`;
      const data: any[] = await pb.send(url, { method: 'GET' });

      const accountById = new Map(accounts.map(a => [a.id, {
        id: a.id,
        code: String(a.code || ''),
        name: String(a.name || ''),
        level: Number(a.level || 1),
        parent_code: String(a.parent_code || ''),
        ownPrev: 0,
        ownDebit: 0,
        ownCredit: 0,
        prev: 0,
        debit: 0,
        credit: 0,
        current: 0,
        third: new Map(),
        children: [],
      }]));

      const accountByCode = new Map();
      accountById.forEach((v) => {
        if (v.code) accountByCode.set(v.code, v);
      });

      // Acumula movimientos propios por cuenta según el lapso seleccionado de la respuesta pre-agregada.
      for (const row of data) {
        const acc = accountById.get(row.accountId);
        if (!acc) continue;

        const prev = Number(row.prevBalance || 0);
        const debit = Number(row.debitSum || 0);
        const credit = Number(row.creditSum || 0);

        acc.ownPrev += prev;
        acc.ownDebit += debit;
        acc.ownCredit += credit;

        if (includeThird) {
          const thirdId = row.thirdPartyId || 'NO_TERCERO';
          const thirdName = row.thirdPartyName || 'Sin tercero';
          const doc = row.thirdPartyDoc || '';
          const nameWithDoc = doc ? `${thirdName} (NIT: ${doc})` : thirdName;

          if (!acc.third.has(thirdId)) {
            acc.third.set(thirdId, { id: thirdId, name: nameWithDoc, prev: 0, debit: 0, credit: 0, current: 0 });
          }
          const t = acc.third.get(thirdId);
          t.prev += prev;
          t.debit += debit;
          t.credit += credit;
          t.current = t.prev + t.debit - t.credit;
        }
      }

      const roots = [];
      accountById.forEach((acc) => {
        const parent = acc.parent_code ? accountByCode.get(acc.parent_code) : null;
        if (parent) parent.children.push(acc);
        else roots.push(acc);
      });

      const sortByCode = (a, b) => a.code.localeCompare(b.code);
      roots.sort(sortByCode);
      accountById.forEach((acc) => acc.children.sort(sortByCode));

      const rows = [];
      const EPS = 0.0001;

      const calcNode = (node) => {
        let prev = node.ownPrev;
        let debit = node.ownDebit;
        let credit = node.ownCredit;

        for (const child of node.children) {
          const c = calcNode(child);
          prev += c.prev;
          debit += c.debit;
          credit += c.credit;
        }

        const current = prev + debit - credit;
        node.prev = prev;
        node.debit = debit;
        node.credit = credit;
        node.current = current;
        return { prev, debit, credit, current };
      };

      roots.forEach((r) => calcNode(r));

      const buildVisibleRows = (node, depth) => {
        const childRows = [];
        for (const child of node.children) {
          childRows.push(...buildVisibleRows(child, depth + 1));
        }

        const hasActivity = Math.abs(node.prev) > EPS || Math.abs(node.debit) > EPS || Math.abs(node.credit) > EPS || Math.abs(node.current) > EPS;
        const visible = hasActivity || childRows.length > 0;
        if (!visible) return [];

        const rowLevel = Number(node.level || (depth + 1));

        const currentRow = {
          code: node.code,
          account: node.name,
          level: rowLevel,
          depth,
          isGroup: node.children.length > 0,
          prev: node.prev,
          debit: node.debit,
          credit: node.credit,
          current: node.current,
          node,
        };

        if (rowLevel <= maxLevel) {
          return [currentRow, ...childRows];
        }
        return childRows;
      };

      rows.length = 0;
      roots.forEach((r) => rows.push(...buildVisibleRows(r, 0)));

      const totals = roots.reduce((acc, r) => {
        acc.prev += r.prev;
        acc.debit += r.debit;
        acc.credit += r.credit;
        acc.current += r.current;
        return acc;
      }, { prev: 0, debit: 0, credit: 0, current: 0 });

      const totalPrev = fmtSignedAmount(totals.prev);
      const totalDebit = fmtSignedAmount(totals.debit);
      const totalCredit = fmtSignedAmount(totals.credit);
      const totalCurrent = fmtSignedAmount(totals.current);

      const displayRows = [];
      for (const r of rows) {
        displayRows.push({ ...r, thirdName: '' });
        if (includeThird && r.node && r.node.third && r.node.third.size) {
          const thirdRows = [...r.node.third.values()]
            .filter(t => Math.abs(t.prev) > EPS || Math.abs(t.debit) > EPS || Math.abs(t.credit) > EPS || Math.abs(t.current) > EPS)
            .sort((a, b) => a.name.localeCompare(b.name));

          for (const t of thirdRows) {
            displayRows.push({
              code: '',
              account: 'Detalle por tercero',
              level: r.level,
              depth: r.depth + 1,
              isGroup: false,
              prev: t.prev,
              debit: t.debit,
              credit: t.credit,
              current: t.current,
              thirdName: t.name,
              isThirdDetail: true,
            });
          }
        }
      }

      lastExportRows = displayRows.map(r => ({
        codigo: r.code,
        descripcion: `${'  '.repeat(r.depth)}${r.account}`,
        tercero: r.thirdName || '',
        nivel: r.level,
        saldo_anterior: r.prev,
        mov_debito: r.debit,
        mov_credito: r.credit,
        saldo_actual: r.current,
      }));

      if ($('#btn-exp-trial')) $('#btn-exp-trial').disabled = !displayRows.length;
      if ($('#btn-pdf-trial')) $('#btn-pdf-trial').disabled = !displayRows.length;

      lastTrialPdf = {
        fromDate,
        toDate,
        accountPrefix,
        includeThird,
        includeSignatures,
        displayRows: displayRows.map(r => ({ ...r })),
        totals: { ...totals },
      };

      let signaturesHtml = '';
      if (includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        signaturesHtml = `
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${signatureBlock(repName, repTitle, '')}
              ${signatureBlock(contName, contTitle, contLicense)}
              ${signatureBlock(revName, revTitle, revLicense)}
            </div>
          </div>`;
      }

      results.innerHTML = `
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Balance de Comprobación Detallado</p>
          <p class="text-sm mt-1" style="color:#6B7280">
            DEL ${esc(fromDate)} AL ${esc(toDate)}
            ${accountPrefix ? ` &bull; <span class="font-semibold" style="color:#0D2137">FILTRADO POR CUENTA: ${esc(accountPrefix)}</span>` : ''}
          </p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:520px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Descripción</th>
                ${includeThird ? '<th>Tercero</th>' : ''}
                <th>Saldo Anterior</th>
                <th>Mov. Débito</th>
                <th>Mov. Crédito</th>
                <th>Saldo Actual</th>
              </tr>
            </thead>
            <tbody>
              ${displayRows.length
                ? displayRows.map((r) => {
                  const prev = fmtPolarityAmount(r.prev);
                  const debit = fmtPolarityAmount(r.debit);
                  const credit = fmtPolarityAmount(r.credit);
                  const current = fmtPolarityAmount(r.current);
                  return `
                <tr>
                  <td class="font-mono text-xs ${r.isGroup ? 'font-bold' : ''}">${esc(r.code)}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="padding-left:${8 + (r.depth * 18)}px">${esc(r.account)}</td>
                  ${includeThird ? `<td class="${r.isThirdDetail ? 'font-medium' : ''}">${esc(r.thirdName || '—')}</td>` : ''}
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="color:${prev.color}">${prev.text}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="color:${debit.color}">${debit.text}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="color:${credit.color}">${credit.text}</td>
                  <td class="${r.isGroup ? 'font-bold' : ''}" style="color:${current.color}">${current.text}</td>
                </tr>`;
                }).join('')
                : `<tr><td colspan="${includeThird ? '7' : '6'}" class="text-center py-10" style="color:#9CA3AF">No hay datos para el lapso o cuenta seleccionada.</td></tr>`}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${includeThird ? '3' : '2'}" class="font-bold">Total</td>
                <td class="font-bold" style="color:${fmtPolarityAmount(totals.prev).color}">${totalPrev.text}</td>
                <td class="font-bold" style="color:${fmtPolarityAmount(totals.debit).color}">${totalDebit.text}</td>
                <td class="font-bold" style="color:${fmtPolarityAmount(totals.credit).color}">${totalCredit.text}</td>
                <td class="font-bold" style="color:${fmtPolarityAmount(totals.current).color}">${totalCurrent.text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ${signaturesHtml}`;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastTrialPdf = null;
      if ($('#btn-pdf-trial')) $('#btn-pdf-trial').disabled = true;
    }
  };

  $('#btn-gen-trial')?.addEventListener('click', generate);
  $('#btn-exp-trial')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    const accTag = lastTrialPdf?.accountPrefix ? `_cuenta_${lastTrialPdf.accountPrefix}` : '';
    exportToExcel(lastExportRows, [
      { key: 'codigo', label: 'CUENTA' },
      { key: 'descripcion', label: 'DESCRIPCIÓN' },
      { key: 'nivel', label: 'NIVEL' },
      { key: 'tercero', label: 'TERCERO' },
      { key: 'saldo_anterior', label: 'BALANCE ANTERIOR' },
      { key: 'mov_debito', label: 'DÉBITOS' },
      { key: 'mov_credito', label: 'CRÉDITOS' },
      { key: 'saldo_actual', label: 'BALANCE ACTUAL' },
    ], `balance_prueba${accTag}_n${getSelectVal('trial-level')}_${getInputVal('trial-from')}_${getInputVal('trial-to')}`);
  });
  $('#btn-pdf-trial')?.addEventListener('click', async () => {
    if (!lastTrialPdf || !lastTrialPdf.displayRows.length) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Balance de Prueba (Detallado)',
        subtitles: [
          `Desde: ${lastTrialPdf.fromDate}`,
          `Hasta: ${lastTrialPdf.toDate}`,
          lastTrialPdf.accountPrefix ? `Cuenta/Grupo: ${lastTrialPdf.accountPrefix}` : 'Cuentas: Todas',
          `Detalle por tercero: ${lastTrialPdf.includeThird ? 'Si' : 'No'}`,
        ],
      });

      const cols = lastTrialPdf.includeThird
        ? ['Cuenta', 'Descripcion', 'Tercero', 'Saldo Anterior', 'Mov. Debito', 'Mov. Credito', 'Saldo Actual']
        : ['Cuenta', 'Descripcion', 'Saldo Anterior', 'Mov. Debito', 'Mov. Credito', 'Saldo Actual'];

      const body = lastTrialPdf.displayRows.map(r => {
        const label = `${'  '.repeat(Number(r.depth || 0))}${r.account || ''}`;
        if (lastTrialPdf.includeThird) {
          return [
            r.code || '',
            label,
            r.thirdName || '',
            fmtPdfSignedNum(r.prev || 0),
            fmtPdfNum(r.debit || 0),
            fmtPdfNum(r.credit || 0),
            fmtPdfSignedNum(r.current || 0),
            r.isGroup ? 'group' : (r.isThirdDetail ? 'third' : 'detail'),
          ];
        }
        return [
          r.code || '',
          label,
          fmtPdfSignedNum(r.prev || 0),
          fmtPdfNum(r.debit || 0),
          fmtPdfNum(r.credit || 0),
          fmtPdfSignedNum(r.current || 0),
          r.isGroup ? 'group' : 'detail',
        ];
      });

      if (lastTrialPdf.includeThird) {
        body.push([
          'TOTAL',
          '',
          '',
          fmtPdfSignedNum(lastTrialPdf.totals.prev || 0),
          fmtPdfNum(lastTrialPdf.totals.debit || 0),
          fmtPdfNum(lastTrialPdf.totals.credit || 0),
          fmtPdfSignedNum(lastTrialPdf.totals.current || 0),
          'total',
        ]);
      } else {
        body.push([
          'TOTAL',
          '',
          fmtPdfSignedNum(lastTrialPdf.totals.prev || 0),
          fmtPdfNum(lastTrialPdf.totals.debit || 0),
          fmtPdfNum(lastTrialPdf.totals.credit || 0),
          fmtPdfSignedNum(lastTrialPdf.totals.current || 0),
          'total',
        ]);
      }

      doc.autoTable({
        startY: header.startY,
        head: [cols],
        body: body.map(r => r.slice(0, cols.length)),
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 7.5, textColor: [55, 55, 55], cellPadding: 2.7, lineWidth: 0 },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', lineWidth: { bottom: 0.25 } },
        columnStyles: lastTrialPdf.includeThird
          ? {
            0: { cellWidth: 62 },
            1: { cellWidth: 242 },
            2: { cellWidth: 140 },
            3: { cellWidth: 80, halign: 'right' },
            4: { cellWidth: 80, halign: 'right' },
            5: { cellWidth: 80, halign: 'right' },
            6: { cellWidth: 80, halign: 'right' },
          }
          : {
            0: { cellWidth: 70 },
            1: { cellWidth: 346 },
            2: { cellWidth: 88, halign: 'right' },
            3: { cellWidth: 88, halign: 'right' },
            4: { cellWidth: 88, halign: 'right' },
            5: { cellWidth: 88, halign: 'right' },
          },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const marker = body[data.row.index]?.[cols.length];
          if (marker === 'group') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [13, 33, 55];
          } else if (marker === 'third') {
            data.cell.styles.fillColor = [248, 250, 252];
          } else if (marker === 'total') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.2 };
            data.cell.styles.lineColor = [13, 33, 55];
          }
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      if (lastTrialPdf.includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        const finalY = (doc.lastAutoTable?.finalY || header.startY) + 34;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let signY = finalY;
        if (signY > pageHeight - 90) {
          doc.addPage();
          signY = 80;
        }
        const columns = [pageWidth * 0.18, pageWidth * 0.50, pageWidth * 0.82];
        const signs = [
          { name: repName || '', title: repTitle || '', extra: '' },
          { name: contName || '', title: contTitle || '', extra: contLicense || '' },
          { name: revName || '', title: revTitle || '', extra: revLicense || '' },
        ];

        doc.setDrawColor(70, 70, 70);
        doc.setTextColor(60, 60, 60);
        signs.forEach((s, idx) => {
          const x = columns[idx];
          doc.line(x - 75, signY, x + 75, signY);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(String(s.name || '________________________'), x, signY + 12, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text(String(s.title || ''), x, signY + 22, { align: 'center' });
          if (s.extra) doc.text(String(s.extra), x, signY + 31, { align: 'center' });
        });
      }

      doc.save(`balance_prueba_${lastTrialPdf.fromDate}_${lastTrialPdf.toDate}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

function signatureBlock(name, title, extraLine = '') {
  return `
    <div class="pt-6">
      <div style="border-top:1px solid #111827; margin-bottom:6px"></div>
      <p class="text-sm font-semibold" style="color:#0D2137">${esc(name || '________________________')}</p>
      <p class="text-xs" style="color:#6B7280">${esc(title || '')}</p>
      ${extraLine ? `<p class="text-xs" style="color:#6B7280">${esc(extraLine)}</p>` : ''}
    </div>`;
}

async function drawPdfSignatures(doc: any, startY: number): Promise<number> {
  const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
    getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
    getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
    getSettingFirst(['contador_name', 'accountant_name']),
    getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
    getSettingFirst(['contador_license', 'accountant_license']),
    getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
    getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
    getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
  ]);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let signY = startY + 45;

  if (signY > pageHeight - 95) {
    doc.addPage();
    signY = 80;
  }

  const columns = [pageWidth * 0.18, pageWidth * 0.50, pageWidth * 0.82];
  const signs = [
    { name: repName || '', title: repTitle || '', extra: '' },
    { name: contName || '', title: contTitle || '', extra: contLicense || '' },
    { name: revName || '', title: revTitle || '', extra: revLicense || '' },
  ];

  doc.setDrawColor(70, 70, 70);
  doc.setTextColor(60, 60, 60);
  signs.forEach((s, idx) => {
    const x = columns[idx];
    doc.line(x - 75, signY, x + 75, signY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(s.name || '________________________'), x, signY + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(String(s.title || ''), x, signY + 22, { align: 'center' });
    if (s.extra) doc.text(String(s.extra), x, signY + 31, { align: 'center' });
  });

  return signY + 45;
}

function monthRangeToDates(fromMonth, toMonth) {
  const normalize = (monthStr, end = false) => {
    const year = Number(String(monthStr || '').slice(0, 4));
    const month = Number(String(monthStr || '').slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return '';
    if (!end) return `${String(year)}-${String(month).padStart(2, '0')}-01`;
    const dt = new Date(year, month, 0);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  const fromDate = normalize(fromMonth, false);
  const toDate = normalize(toMonth, true);
  if (!fromDate || !toDate) return null;
  if (String(fromDate) > String(toDate)) return null;
  return { fromDate, toDate };
}

async function renderIncomeStatement() {
  const view = getReportViewHost();
  if (!view) return;
  const currentMonthDefault = todayStr().slice(0, 7);
  const y = Number(currentMonthDefault.slice(0, 4));
  const m = Number(currentMonthDefault.slice(5, 7));
  const compareMonthDefault = `${String(y - 1)}-${String(m).padStart(2, '0')}`;
  const defaultSignaturesSetting = await getSettingFirst(['trial_show_signatures_default', 'show_signatures_default'], '0');
  const signaturesChecked = String(defaultSignaturesSetting).trim() === '1' || String(defaultSignaturesSetting).toLowerCase() === 'true';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Resultados</h4>
      <div class="grid grid-cols-1 md:grid-cols-9 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="inc-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="inc-compare-month" type="month" class="form-input" value="${compareMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Periodo del cálculo</label>
          <select id="inc-period-type" class="form-input">
            <option value="year" selected>Acumulado del año</option>
            <option value="month">Solo el mes</option>
            <option value="historical">Histórico total</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="inc-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="inc-show-notes" type="checkbox" checked>
            Mostrar nota/revelación
          </label>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="inc-show-signatures" type="checkbox" ${signaturesChecked ? 'checked' : ''}>
            Mostrar firmas
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-er"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-er" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-er" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="income-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona mes y comparación para generar el reporte.
    </div>`;

  let lastExportRows = [];
  let lastIncomePdf = null;

  const endOfMonth = (monthStr) => {
    const year = Number(String(monthStr || '').slice(0, 4));
    const month = Number(String(monthStr || '').slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return '';
    const dt = new Date(year, month, 0);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  const fmtLongDate = (dateStr) => {
    if (!dateStr) return '—';
    const dt = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return dateStr;
    return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const buildBalancesAt = (accounts, transactions, txLines, cutoffDate, startDate = '') => {
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));
    const byAccount = Object.fromEntries(accounts.map(a => [a.id, 0]));
    for (const line of txLines) {
      const tx = txById[line.tx_id];
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (String(tx.date) > cutoffDate) continue;
      if (startDate && String(tx.date) < startDate) continue;
      byAccount[line.account_id] = Number(byAccount[line.account_id] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
    }
    return byAccount;
  };

  const getPeriodBalances = (accounts, balNow, balCmp, kind) => {
    const sectionAccounts = accounts.filter((a) => String(a.code || '').startsWith(kind));
    const nodeById = new Map(sectionAccounts.map((acc) => {
      const baseNow = Number(balNow[acc.id] || 0);
      const baseCmp = Number(balCmp[acc.id] || 0);
      const ownNow = kind === '4' ? -baseNow : baseNow;
      const ownCmp = kind === '4' ? -baseCmp : baseCmp;
      return [acc.id, {
        id: acc.id,
        code: String(acc.code || ''),
        name: String(acc.name || ''),
        level: Number(acc.level || 1),
        parentCode: String(acc.parent_code || ''),
        ownNow,
        ownCmp,
        now: 0,
        cmp: 0,
        children: [],
      }];
    }));

    const byCode = new Map();
    nodeById.forEach((n) => { if (n.code) byCode.set(n.code, n); });
    const roots = [];
    nodeById.forEach((n) => {
      const parent = n.parentCode ? byCode.get(n.parentCode) : null;
      if (parent) parent.children.push(n);
      else roots.push(n);
    });
    const sortByCode = (a, b) => a.code.localeCompare(b.code);
    roots.sort(sortByCode);
    nodeById.forEach((n) => n.children.sort(sortByCode));

    const calcNode = (n) => {
      let now = n.ownNow;
      let cmp = n.ownCmp;
      for (const c of n.children) {
        const sc = calcNode(c);
        now += sc.now;
        cmp += sc.cmp;
      }
      n.now = now;
      n.cmp = cmp;
      return { now, cmp };
    };
    roots.forEach((r) => calcNode(r));

    return roots;
  };
  const generate = async () => {
    const results = $('#income-results');
    if (!results) return;

    const reportMonth = getInputVal('inc-month');
    const compareMonth = getInputVal('inc-compare-month');
    const periodType = getSelectVal('inc-period-type') || 'year';
    const showNotes = getCheckVal('inc-show-notes');
    const includeSignatures = getCheckVal('inc-show-signatures');
    const selectedLevel = getSelectVal('inc-level');
    const maxLevel = selectedLevel === 'all' ? Number.POSITIVE_INFINITY : Number(selectedLevel || 3);

    if (!reportMonth || !compareMonth) {
      return showToast('Selecciona ambos meses para el reporte comparativo.', 'warning');
    }

    const reportDate = endOfMonth(reportMonth) + ' 23:59:59';
    const compareDate = endOfMonth(compareMonth) + ' 23:59:59';
    if (!reportDate || !compareDate) {
      return showToast('Mes inválido. Revisa los filtros.', 'warning');
    }

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Resultados...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();

      let startNow = '';
      let startCmp = '';

      if (periodType === 'month') {
        startNow = `${reportMonth}-01 00:00:00`;
        startCmp = `${compareMonth}-01 00:00:00`;
      } else if (periodType === 'year') {
        startNow = `${reportMonth.slice(0, 4)}-01-01 00:00:00`;
        startCmp = `${compareMonth.slice(0, 4)}-01-01 00:00:00`;
      }

      const [balNow, balCmp] = await Promise.all([
        pb.send(`/api/gravy/report-balances?startDate=${startNow}&endDate=${reportDate}`, { method: 'GET' }),
        pb.send(`/api/gravy/report-balances?startDate=${startCmp}&endDate=${compareDate}`, { method: 'GET' })
      ]);

      const roots4 = getPeriodBalances(accounts, balNow, balCmp, '4');
      const roots5 = getPeriodBalances(accounts, balNow, balCmp, '5');
      const roots6 = getPeriodBalances(accounts, balNow, balCmp, '6');
      const roots7 = getPeriodBalances(accounts, balNow, balCmp, '7');

      const getErNoteNum = (code: string): string => {
        if (code.startsWith('4')) return '4';
        if (code.startsWith('5') || code.startsWith('6') || code.startsWith('7')) return '5';
        return '';
      };

      const buildRows = (roots) => {
        const EPS = 0.0001;
        const detail = [];
        const visit = (node) => {
          const childRows = [];
          for (const c of node.children) childRows.push(...visit(c));
          const hasActivity = Math.abs(node.now) > EPS || Math.abs(node.cmp) > EPS;
          if (!hasActivity && !childRows.length) return [];
          const rows = [];
          if (Number(node.level || 1) <= maxLevel) {
            rows.push({
              note: showNotes ? getErNoteNum(node.code) : '',
              label: node.name,
              now: node.now,
              cmp: node.cmp,
            });
          }
          rows.push(...childRows);
          return rows;
        };

        roots.forEach((r) => detail.push(...visit(r)));
        const totalNow = roots.reduce((s, r) => s + Number(r.now || 0), 0);
        const totalCmp = roots.reduce((s, r) => s + Number(r.cmp || 0), 0);
        return { detail, totalNow, totalCmp };
      };

      const ingresos = buildRows(roots4);
      const gastos = buildRows(roots5);
      const costos = buildRows(roots6);
      const otrosGastos = buildRows(roots7);

      const totalGastosNow = costos.totalNow + gastos.totalNow + otrosGastos.totalNow;
      const totalGastosCmp = costos.totalCmp + gastos.totalCmp + otrosGastos.totalCmp;
      const utilidadNow = ingresos.totalNow - totalGastosNow;
      const utilidadCmp = ingresos.totalCmp - totalGastosCmp;

      const colCount = showNotes ? 4 : 3;
      const noteHead = showNotes ? '<th style="width:90px">Nota</th>' : '';
      const amountCell = (value, extraClass = '') => {
        const v = fmtPolarityAmount(value);
        return `<td class="text-right ${extraClass}" style="color:${v.color}">${v.text}</td>`;
      };
      const detailRowsHtml = (section) => section.detail.map(r => {
        const lvl = Number(r.level || 1);
        const padding = 12 + (lvl - 1) * 12;
        const isBoldClass = lvl <= 3 ? 'font-bold' : (lvl === 4 ? 'font-semibold' : '');
        return `
        <tr class="${isBoldClass}">
          <td style="padding-left:${padding}px">${esc(r.label)}</td>
          ${showNotes ? `<td class="text-center">${esc(r.note)}</td>` : ''}
          ${amountCell(r.now, isBoldClass)}
          ${amountCell(r.cmp, isBoldClass)}
        </tr>`;
      }).join('');

      let signaturesHtml = '';
      if (includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        signaturesHtml = `
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${signatureBlock(repName, repTitle, '')}
              ${signatureBlock(contName, contTitle, contLicense)}
              ${signatureBlock(revName, revTitle, revLicense)}
            </div>
          </div>`;
      }

      results.innerHTML = `
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Estado de Resultados</p>
          <p class="text-sm" style="color:#6B7280">(Expresado en pesos colombianos)</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:560px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rubro</th>
                ${noteHead}
                <th class="text-right">${esc(fmtLongDate(reportDate))}</th>
                <th class="text-right">${esc(fmtLongDate(compareDate))}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-bold" colspan="${colCount}">Ingresos (Clase 4)</td></tr>
              ${detailRowsHtml(ingresos)}
              <tr>
                <td class="font-bold">Total ingresos</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(ingresos.totalNow, 'font-bold')}
                ${amountCell(ingresos.totalCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Costos de venta (Clase 6)</td></tr>
              ${detailRowsHtml(costos)}
              <tr>
                <td class="font-bold">Total costos de venta</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(costos.totalNow, 'font-bold')}
                ${amountCell(costos.totalCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Gastos operacionales (Clase 5)</td></tr>
              ${detailRowsHtml(gastos)}
              <tr>
                <td class="font-bold">Total gastos operacionales</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(gastos.totalNow, 'font-bold')}
                ${amountCell(gastos.totalCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Costos de producción/operación (Clase 7)</td></tr>
              ${detailRowsHtml(otrosGastos)}
              <tr>
                <td class="font-bold">Total costos de producción/operación</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(otrosGastos.totalNow, 'font-bold')}
                ${amountCell(otrosGastos.totalCmp, 'font-bold')}
              </tr>

              <tr>
                <td class="font-bold">Total gastos y costos</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(totalGastosNow, 'font-bold')}
                ${amountCell(totalGastosCmp, 'font-bold')}
              </tr>
              <tr>
                <td class="font-bold">Resultado neto del periodo</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(utilidadNow, 'font-bold')}
                ${amountCell(utilidadCmp, 'font-bold')}
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2 text-center text-xs italic text-gray-500" style="border-top: 1px solid #F3F4F6">
          Las notas o revelaciones adjuntas son parte integral de los estados financieros.
        </div>
        ${signaturesHtml}`;

      lastExportRows = [];
      const pushSection = (title, section, totalLabel) => {
        lastExportRows.push({ rubro: title, nota: '', actual: '', comparativo: '', isBold: true, level: 1 });
        section.detail.forEach((r) => {
          lastExportRows.push({ rubro: r.label, nota: r.note || '', actual: r.now, comparativo: r.cmp, level: r.level, code: r.code });
        });
        lastExportRows.push({ rubro: totalLabel, nota: '', actual: section.totalNow, comparativo: section.totalCmp, isBold: true, level: 2 });
      };

      pushSection('Ingresos (Clase 4)', ingresos, 'Total ingresos');
      pushSection('Costos de venta (Clase 6)', costos, 'Total costos de venta');
      pushSection('Gastos operacionales (Clase 5)', gastos, 'Total gastos operacionales');
      pushSection('Costos de producción/operación (Clase 7)', otrosGastos, 'Total costos de producción/operación');
      lastExportRows.push({ rubro: 'Total gastos y costos', nota: '', actual: totalGastosNow, comparativo: totalGastosCmp });
      lastExportRows.push({ rubro: 'Resultado neto del periodo', nota: '', actual: utilidadNow, comparativo: utilidadCmp });

      if (includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        lastExportRows.push({ rubro: '', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({ rubro: 'Las notas o revelaciones adjuntas son parte integral de los estados financieros.', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({ rubro: '', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({
          rubro: repName || '________________________',
          nota: contName || '________________________',
          actual: revName || '________________________',
          comparativo: ''
        });
        lastExportRows.push({
          rubro: repTitle || 'Representante Legal',
          nota: `${contTitle || 'Contador'}${contLicense ? ' (' + contLicense + ')' : ''}`,
          actual: `${revTitle || 'Revisor Fiscal'}${revLicense ? ' (' + revLicense + ')' : ''}`,
          comparativo: ''
        });
      } else {
        lastExportRows.push({ rubro: '', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({ rubro: 'Las notas o revelaciones adjuntas son parte integral de los estados financieros.', nota: '', actual: '', comparativo: '' });
      }

      lastIncomePdf = {
        reportMonth,
        compareMonth,
        reportDate,
        compareDate,
        showNotes,
        includeSignatures,
        sections: { ingresos, costos, gastos, otrosGastos },
        totals: { totalGastosNow, totalGastosCmp, utilidadNow, utilidadCmp },
        accounts,
        balNow,
        balCmp
      };

      if ($('#btn-exp-er')) $('#btn-exp-er').disabled = !lastExportRows.length;
      if ($('#btn-pdf-er')) $('#btn-pdf-er').disabled = !lastExportRows.length;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastExportRows = [];
      lastIncomePdf = null;
      if ($('#btn-exp-er')) $('#btn-exp-er').disabled = true;
      if ($('#btn-pdf-er')) $('#btn-pdf-er').disabled = true;
    }
  };

  $('#btn-gen-er')?.addEventListener('click', generate);
  $('#btn-exp-er')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    exportToExcel(lastExportRows, [
      { key: 'rubro', label: 'Rubro' },
      { key: 'nota', label: 'Nota' },
      { key: 'actual', label: getInputVal('inc-month') },
      { key: 'comparativo', label: getInputVal('inc-compare-month') },
    ], `estado_resultados_${getInputVal('inc-month')}_vs_${getInputVal('inc-compare-month')}`);
  });
  $('#btn-pdf-er')?.addEventListener('click', async () => {
    if (!lastIncomePdf) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const { showNotes, sections, totals, reportDate, compareDate, reportMonth, compareMonth } = lastIncomePdf;
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const headerCtx = await getPdfHeaderContext();
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Estado de Resultados',
        subtitles: [
          `Periodo mensual comparativo: ${reportMonth} vs ${compareMonth}`,
          `Cortes: ${reportDate} / ${compareDate}`,
        ],
      });

      const body = [];
      const pushSection = (sectionTitle, section, totalLabel) => {
        body.push([{ content: sectionTitle, colSpan: showNotes ? 4 : 3, styles: { fontStyle: 'bold', textColor: [13, 33, 55], fillColor: [245, 245, 245] } }]);
        section.detail.forEach((r) => {
          if (showNotes) body.push([r.label, r.note || '', fmtPdfSignedNum(r.now), fmtPdfSignedNum(r.cmp)]);
          else body.push([r.label, fmtPdfSignedNum(r.now), fmtPdfSignedNum(r.cmp)]);
        });
        if (showNotes) body.push([totalLabel, '', fmtPdfSignedNum(section.totalNow), fmtPdfSignedNum(section.totalCmp)]);
        else body.push([totalLabel, fmtPdfSignedNum(section.totalNow), fmtPdfSignedNum(section.totalCmp)]);
      };

      pushSection('Ingresos (Clase 4)', sections.ingresos, 'Total ingresos');
      pushSection('Costos de venta (Clase 6)', sections.costos, 'Total costos de venta');
      pushSection('Gastos operacionales (Clase 5)', sections.gastos, 'Total gastos operacionales');
      pushSection('Costos de producción/operación (Clase 7)', sections.otrosGastos, 'Total costos de producción/operación');
      if (showNotes) body.push(['Total gastos y costos', '', fmtPdfSignedNum(totals.totalGastosNow), fmtPdfSignedNum(totals.totalGastosCmp)]);
      else body.push(['Total gastos y costos', fmtPdfSignedNum(totals.totalGastosNow), fmtPdfSignedNum(totals.totalGastosCmp)]);
      if (showNotes) body.push(['Resultado neto del periodo', '', fmtPdfSignedNum(totals.utilidadNow), fmtPdfSignedNum(totals.utilidadCmp)]);
      else body.push(['Resultado neto del periodo', fmtPdfSignedNum(totals.utilidadNow), fmtPdfSignedNum(totals.utilidadCmp)]);

      const head = showNotes
        ? [['Rubro', 'Nota', String(reportDate), String(compareDate)]]
        : [['Rubro', String(reportDate), String(compareDate)]];

      doc.autoTable({
        startY: header.startY,
        head,
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 7.3, textColor: [55, 55, 55], cellPadding: 2.5, lineWidth: 0 },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', lineWidth: { bottom: 0.25 } },
        columnStyles: showNotes
          ? {
            0: { cellWidth: 280 },
            1: { cellWidth: 54, halign: 'center' },
            2: { cellWidth: 110, halign: 'right' },
            3: { cellWidth: 110, halign: 'right' },
          }
          : {
            0: { cellWidth: 334 },
            1: { cellWidth: 110, halign: 'right' },
            2: { cellWidth: 110, halign: 'right' },
          },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const firstCell = body[data.row.index]?.[0];
          if (typeof firstCell === 'object' && firstCell?.colSpan) return;
          const label = String(firstCell || '').toLowerCase();
          if (label.startsWith('total ') || label.startsWith('resultado ')) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
          }
        },
      });

      // Draw footnote
      let signY = doc.lastAutoTable.finalY + 25;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('Las notas o revelaciones adjuntas son parte integral de los estados financieros.', doc.internal.pageSize.getWidth() / 2, signY, { align: 'center' });
      signY += 15;

      // Draw signatures and notes
      let notasGuardadas: any[] = [];
      try {
        const pMonth = getInputVal('inc-month');
        if (pMonth) {
          notasGuardadas = await loadFinancialNotes(pMonth, 'ER');
        }
      } catch (_) {}

      if (notasGuardadas.length > 0) {
        const notesFinalY = drawNotesInPdf(doc, notasGuardadas, header.marginLeft, doc.internal.pageSize.getWidth(), lastIncomePdf.accounts, lastIncomePdf.balNow, lastIncomePdf.balCmp);
        if (lastIncomePdf.includeSignatures) {
          await drawPdfSignatures(doc, notesFinalY);
        }
      } else {
        if (lastIncomePdf.includeSignatures) {
          await drawPdfSignatures(doc, signY);
        }
      }

      const totalPagesER = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPagesER; p++) {
        doc.setPage(p);
        drawPdfFooter(doc, p);
      }

      doc.save(`estado_resultados_${reportMonth}_vs_${compareMonth}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

async function renderFinancialPosition() {
  const view = getReportViewHost();
  if (!view) return;
  const currentMonthDefault = todayStr().slice(0, 7);
  const y = Number(currentMonthDefault.slice(0, 4));
  const m = Number(currentMonthDefault.slice(5, 7));
  const compareMonthDefault = `${String(y - 1)}-${String(m).padStart(2, '0')}`;
  const defaultSignaturesSetting = await getSettingFirst(['trial_show_signatures_default', 'show_signatures_default'], '0');
  const signaturesChecked = String(defaultSignaturesSetting).trim() === '1' || String(defaultSignaturesSetting).toLowerCase() === 'true';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Situación Financiera (Balance General)</h4>
      <div class="grid grid-cols-1 md:grid-cols-9 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="pos-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="pos-compare-month" type="month" class="form-input" value="${compareMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Periodo del cálculo</label>
          <select id="pos-period-type" class="form-input">
            <option value="year" selected>Acumulado del año</option>
            <option value="month">Solo el mes</option>
            <option value="historical">Histórico total</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nivel de información</label>
          <select id="pos-level" class="form-input">
            <option value="all">Todos</option>
            <option value="1">Nivel 1</option>
            <option value="2">Nivel 2</option>
            <option value="3" selected>Nivel 3</option>
            <option value="4">Nivel 4</option>
            <option value="5">Nivel 5</option>
            <option value="6">Nivel 6</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="pos-show-notes" type="checkbox" checked>
            Mostrar nota/revelación
          </label>
        </div>
        <div class="form-group flex items-end">
          <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
            <input id="pos-show-signatures" type="checkbox" ${signaturesChecked ? 'checked' : ''}>
            Mostrar firmas
          </label>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-position"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-position" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-position" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="position-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona mes y comparación para generar el reporte.
    </div>`;

  let lastExportRows = [];
  let lastPositionPdf = null;

  const endOfMonth = (monthStr) => {
    const year = Number(String(monthStr || '').slice(0, 4));
    const month = Number(String(monthStr || '').slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return '';
    const dt = new Date(year, month, 0);
    const yv = dt.getFullYear();
    const mv = String(dt.getMonth() + 1).padStart(2, '0');
    const dv = String(dt.getDate()).padStart(2, '0');
    return `${yv}-${mv}-${dv}`;
  };

  const fmtLongDate = (dateStr) => {
    if (!dateStr) return '—';
    const dt = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return dateStr;
    return dt.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const buildBalancesAt = (accounts, transactions, txLines, cutoffDate) => {
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));
    const byAccount = Object.fromEntries(accounts.map(a => [a.id, 0]));

    for (const line of txLines) {
      const tx = txById[line.tx_id];
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (String(tx.date) > cutoffDate) continue;
      byAccount[line.account_id] = Number(byAccount[line.account_id] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
    }

    return byAccount;
  };

  const toAmount = (raw, kind) => {
    const n = Number(raw || 0);
    // Activo mantiene signo natural; Pasivo/Patrimonio invierten signo para mostrar
    // saldos normales como positivos y saldos anormales como negativos.
    return kind === 'asset' ? n : -n;
  };

  const getEsfNoteNum = (code: string): string => {
    if (code.startsWith('11')) return '3.1';
    if (code.startsWith('12') || code.startsWith('13')) return '3.2';
    if (code.startsWith('14')) return '3.3';
    if (code.startsWith('15') || code.startsWith('16') || code.startsWith('17') || code.startsWith('18') || code.startsWith('19')) return '3.4';
    if (code.startsWith('21') || code.startsWith('22') || code.startsWith('23')) return '3.5';
    if (code.startsWith('24') || code.startsWith('25') || code.startsWith('26') || code.startsWith('27') || code.startsWith('28') || code.startsWith('29')) return '3.6';
    if (code.startsWith('3')) return '3.7';
    return '';
  };

  const groupSection = (accounts, balancesNow, balancesCmp, filterFn, kind, showNotes, maxLevel) => {
    const EPS = 0.0001;
    const sectionAccounts = accounts.filter(filterFn);
    const nodeById = new Map(sectionAccounts.map((acc) => [acc.id, {
      id: acc.id,
      code: String(acc.code || ''),
      name: String(acc.name || ''),
      level: Number(acc.level || 1),
      parentCode: String(acc.parent_code || ''),
      ownNow: toAmount(balancesNow[acc.id], kind),
      ownCmp: toAmount(balancesCmp[acc.id], kind),
      now: 0,
      cmp: 0,
      children: [],
    }]));

    const nodeByCode = new Map();
    nodeById.forEach((node) => {
      if (node.code) nodeByCode.set(node.code, node);
    });

    const roots = [];
    nodeById.forEach((node) => {
      const parent = node.parentCode ? nodeByCode.get(node.parentCode) : null;
      if (parent) parent.children.push(node);
      else roots.push(node);
    });

    const sortByCode = (a, b) => a.code.localeCompare(b.code);
    roots.sort(sortByCode);
    nodeById.forEach((node) => node.children.sort(sortByCode));

    const calcNode = (node) => {
      let now = node.ownNow;
      let cmp = node.ownCmp;
      for (const child of node.children) {
        const c = calcNode(child);
        now += c.now;
        cmp += c.cmp;
      }
      node.now = now;
      node.cmp = cmp;
      return { now, cmp };
    };

    roots.forEach((root) => calcNode(root));

    const buildVisibleRows = (node) => {
      const childRows = [];
      for (const child of node.children) {
        childRows.push(...buildVisibleRows(child));
      }

      const hasActivity = Math.abs(node.now) > EPS || Math.abs(node.cmp) > EPS;
      const visible = hasActivity || childRows.length > 0;
      if (!visible) return [];

      const rows = [];
      if (Number(node.level || 1) <= maxLevel) {
        rows.push({
          note: showNotes ? getEsfNoteNum(node.code) : '',
          label: node.name,
          level: Number(node.level || 1),
          code: String(node.code || ''),
          now: node.now,
          cmp: node.cmp,
        });
      }

      rows.push(...childRows);
      return rows;
    };

    const detail = roots.flatMap((root) => buildVisibleRows(root));
    const totalNow = roots.reduce((s, root) => s + root.now, 0);
    const totalCmp = roots.reduce((s, root) => s + root.cmp, 0);

    return { detail, totalNow, totalCmp };
  };

  const generate = async () => {
    const results = $('#position-results');
    if (!results) return;

    const reportMonth = getInputVal('pos-month');
    const compareMonth = getInputVal('pos-compare-month');
    const periodType = getSelectVal('pos-period-type') || 'historical';
    const showNotes = getCheckVal('pos-show-notes');
    const includeSignatures = getCheckVal('pos-show-signatures');
    const selectedLevel = getSelectVal('pos-level');
    const maxLevel = selectedLevel === 'all' ? Number.POSITIVE_INFINITY : Number(selectedLevel || 3);

    if (!reportMonth || !compareMonth) {
      return showToast('Selecciona ambos meses para el reporte comparativo.', 'warning');
    }

    const reportDate = endOfMonth(reportMonth);
    const compareDate = endOfMonth(compareMonth);
    if (!reportDate || !compareDate) {
      return showToast('Mes inválido. Revisa los filtros.', 'warning');
    }

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Situación Financiera...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();

      // Para el Estado de Situación Financiera (Balance General), las cuentas de Activos, Pasivos y Patrimonio
      // son reales y acumulativas por naturaleza. Por tanto, para obtener el saldo final correcto y cuadrado,
      // siempre debemos calcular desde el origen de los tiempos (startDate = '') hasta la fecha de corte.
      const startNow = '';
      const startCmp = '';

      const [balNow, balCmp] = await Promise.all([
        pb.send(`/api/gravy/report-balances?startDate=${startNow}&endDate=${reportDate}`, { method: 'GET' }),
        pb.send(`/api/gravy/report-balances?startDate=${startCmp}&endDate=${compareDate}`, { method: 'GET' })
      ]);

      const actCorr = groupSection(accounts, balNow, balCmp, a => ['11', '12', '13', '14'].some(prefix => String(a.code || '').startsWith(prefix)), 'asset', showNotes, maxLevel);
      const actNoCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('1') && !['11', '12', '13', '14'].some(prefix => String(a.code || '').startsWith(prefix)), 'asset', showNotes, maxLevel);
      const pasCorr = groupSection(accounts, balNow, balCmp, a => ['21', '22', '23', '24', '25', '26', '28'].some(prefix => String(a.code || '').startsWith(prefix)), 'liability', showNotes, maxLevel);
      const pasNoCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('2') && !['21', '22', '23', '24', '25', '26', '28'].some(prefix => String(a.code || '').startsWith(prefix)), 'liability', showNotes, maxLevel);
      const patrimonio = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('3'), 'equity', showNotes, maxLevel);

      const totalActivosNow = actCorr.totalNow + actNoCorr.totalNow;
      const totalActivosCmp = actCorr.totalCmp + actNoCorr.totalCmp;
      const totalPasivosNow = pasCorr.totalNow + pasNoCorr.totalNow;
      const totalPasivosCmp = pasCorr.totalCmp + pasNoCorr.totalCmp;
      const totalPyPNow = totalPasivosNow + patrimonio.totalNow;
      const totalPyPCmp = totalPasivosCmp + patrimonio.totalCmp;

      const colCount = showNotes ? 4 : 3;
      const noteHead = showNotes ? '<th style="width:90px">Nota</th>' : '';

      const amountCell = (value, extraClass = '') => {
        const v = fmtPolarityAmount(value);
        const color = `color:${v.color}`;
        return `<td class="text-right ${extraClass}" style="${color}">${v.text}</td>`;
      };

      const detailRowsHtml = (section) => section.detail.map(r => {
        const lvl = Number(r.level || 1);
        const padding = 12 + (lvl - 1) * 12;
        const isBoldClass = lvl <= 3 ? 'font-bold' : (lvl === 4 ? 'font-semibold' : '');
        return `
        <tr class="${isBoldClass}">
          <td style="padding-left:${padding}px">${esc(r.label)}</td>
          ${showNotes ? `<td class="text-center">${esc(r.note)}</td>` : ''}
          ${amountCell(r.now, isBoldClass)}
          ${amountCell(r.cmp, isBoldClass)}
        </tr>`;
      }).join('');

      let signaturesHtml = '';
      if (includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        signaturesHtml = `
          <div class="p-4 pt-2">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
              ${signatureBlock(repName, repTitle, '')}
              ${signatureBlock(contName, contTitle, contLicense)}
              ${signatureBlock(revName, revTitle, revLicense)}
            </div>
          </div>`;
      }

      results.innerHTML = `
        <div class="px-4 pt-4 text-center">
          <p class="text-xl font-bold" style="color:#0D2137">Estado de Situación Financiera</p>
          <p class="text-sm" style="color:#6B7280">(Expresado en pesos colombianos)</p>
        </div>
        <div class="overflow-x-auto p-4" style="max-height:560px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rubro</th>
                ${noteHead}
                <th class="text-right">${esc(fmtLongDate(reportDate))}</th>
                <th class="text-right">${esc(fmtLongDate(compareDate))}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-bold" colspan="${colCount}">Activos</td></tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Activos corrientes</td></tr>
              ${detailRowsHtml(actCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(actCorr.totalNow, 'font-bold')}
                ${amountCell(actCorr.totalCmp, 'font-bold')}
              </tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Activos no corrientes</td></tr>
              ${detailRowsHtml(actNoCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total activos no corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(actNoCorr.totalNow, 'font-bold')}
                ${amountCell(actNoCorr.totalCmp, 'font-bold')}
              </tr>
              <tr>
                <td class="font-bold">Total activos</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(totalActivosNow, 'font-bold')}
                ${amountCell(totalActivosCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Pasivos</td></tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Pasivos corrientes</td></tr>
              ${detailRowsHtml(pasCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(pasCorr.totalNow, 'font-bold')}
                ${amountCell(pasCorr.totalCmp, 'font-bold')}
              </tr>
              <tr><td class="font-semibold" colspan="${colCount}" style="padding-left:12px">Pasivos no corrientes</td></tr>
              ${detailRowsHtml(pasNoCorr)}
              <tr>
                <td class="font-bold" style="padding-left:12px">Total pasivos no corrientes</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(pasNoCorr.totalNow, 'font-bold')}
                ${amountCell(pasNoCorr.totalCmp, 'font-bold')}
              </tr>
              <tr>
                <td class="font-bold">Total pasivos</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(totalPasivosNow, 'font-bold')}
                ${amountCell(totalPasivosCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Patrimonio</td></tr>
              ${detailRowsHtml(patrimonio)}
              <tr>
                <td class="font-bold">Total patrimonio</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(patrimonio.totalNow, 'font-bold')}
                ${amountCell(patrimonio.totalCmp, 'font-bold')}
              </tr>

              <tr>
                <td class="font-bold">Total pasivos más patrimonio</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(totalPyPNow, 'font-bold')}
                ${amountCell(totalPyPCmp, 'font-bold')}
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2 text-center text-xs italic text-gray-500" style="border-top: 1px solid #F3F4F6">
          Las notas o revelaciones adjuntas son parte integral de los estados financieros.
        </div>
        ${signaturesHtml}`;

      lastExportRows = [];
      const pushSection = (title, section, sectionTotalLabel) => {
        lastExportRows.push({ rubro: title, nota: '', actual: '', comparativo: '', isBold: true, level: 1 });
        section.detail.forEach((r) => {
          lastExportRows.push({ rubro: r.label, nota: r.note || '', actual: r.now, comparativo: r.cmp, level: r.level, code: r.code });
        });
        lastExportRows.push({ rubro: sectionTotalLabel, nota: '', actual: section.totalNow, comparativo: section.totalCmp, isBold: true, level: 2 });
      };

      pushSection('Activos corrientes', actCorr, 'Total activos corrientes');
      pushSection('Activos no corrientes', actNoCorr, 'Total activos no corrientes');
      lastExportRows.push({ rubro: 'Total activos', nota: '', actual: totalActivosNow, comparativo: totalActivosCmp });
      pushSection('Pasivos corrientes', pasCorr, 'Total pasivos corrientes');
      pushSection('Pasivos no corrientes', pasNoCorr, 'Total pasivos no corrientes');
      lastExportRows.push({ rubro: 'Total pasivos', nota: '', actual: totalPasivosNow, comparativo: totalPasivosCmp });
      pushSection('Patrimonio', patrimonio, 'Total patrimonio');
      lastExportRows.push({ rubro: 'Total pasivos más patrimonio', nota: '', actual: totalPyPNow, comparativo: totalPyPCmp });

      if (includeSignatures) {
        const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
          getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
          getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
          getSettingFirst(['contador_name', 'accountant_name']),
          getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
          getSettingFirst(['contador_license', 'accountant_license']),
          getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
          getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
          getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
        ]);

        lastExportRows.push({ rubro: '', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({ rubro: 'Las notas o revelaciones adjuntas son parte integral de los estados financieros.', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({ rubro: '', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({
          rubro: repName || '________________________',
          nota: contName || '________________________',
          actual: revName || '________________________',
          comparativo: ''
        });
        lastExportRows.push({
          rubro: repTitle || 'Representante Legal',
          nota: `${contTitle || 'Contador'}${contLicense ? ' (' + contLicense + ')' : ''}`,
          actual: `${revTitle || 'Revisor Fiscal'}${revLicense ? ' (' + revLicense + ')' : ''}`,
          comparativo: ''
        });
      } else {
        lastExportRows.push({ rubro: '', nota: '', actual: '', comparativo: '' });
        lastExportRows.push({ rubro: 'Las notas o revelaciones adjuntas son parte integral de los estados financieros.', nota: '', actual: '', comparativo: '' });
      }

      lastPositionPdf = {
        reportMonth,
        compareMonth,
        reportDate,
        compareDate,
        showNotes,
        includeSignatures,
        sections: {
          actCorr,
          actNoCorr,
          pasCorr,
          pasNoCorr,
          patrimonio,
        },
        totals: {
          totalActivosNow,
          totalActivosCmp,
          totalPasivosNow,
          totalPasivosCmp,
          totalPyPNow,
          totalPyPCmp,
        },
        accounts,
        balNow,
        balCmp
      };

      if ($('#btn-exp-position')) $('#btn-exp-position').disabled = !lastExportRows.length;
      if ($('#btn-pdf-position')) $('#btn-pdf-position').disabled = !lastExportRows.length;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastExportRows = [];
      lastPositionPdf = null;
      if ($('#btn-exp-position')) $('#btn-exp-position').disabled = true;
      if ($('#btn-pdf-position')) $('#btn-pdf-position').disabled = true;
    }
  };

  $('#btn-gen-position')?.addEventListener('click', generate);
  $('#btn-exp-position')?.addEventListener('click', () => {
    if (!lastExportRows.length) return;
    exportToExcel(lastExportRows, [
      { key: 'rubro', label: 'Rubro' },
      { key: 'nota', label: 'Nota' },
      { key: 'actual', label: getInputVal('pos-month') },
      { key: 'comparativo', label: getInputVal('pos-compare-month') },
    ], `estado_situacion_financiera_${getInputVal('pos-month')}_vs_${getInputVal('pos-compare-month')}`);
  });
  $('#btn-pdf-position')?.addEventListener('click', async () => {
    if (!lastPositionPdf) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const { showNotes, sections, totals, reportDate, compareDate, reportMonth, compareMonth } = lastPositionPdf;
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const headerCtx = await getPdfHeaderContext();
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Estado de Situacion Financiera',
        subtitles: [
          `Periodo mensual comparativo: ${reportMonth} vs ${compareMonth}`,
          `Cortes: ${reportDate} / ${compareDate}`,
        ],
      });

      const body = [];
      const pushSection = (sectionTitle, section, totalLabel) => {
        body.push([{ content: sectionTitle, colSpan: showNotes ? 4 : 3, styles: { fontStyle: 'bold', textColor: [13, 33, 55], fillColor: [245, 245, 245] } }]);
        section.detail.forEach((r) => {
          if (showNotes) body.push([r.label, r.note || '', fmtPdfSignedNum(r.now), fmtPdfSignedNum(r.cmp)]);
          else body.push([r.label, fmtPdfSignedNum(r.now), fmtPdfSignedNum(r.cmp)]);
        });
        if (showNotes) body.push([totalLabel, '', fmtPdfSignedNum(section.totalNow), fmtPdfSignedNum(section.totalCmp)]);
        else body.push([totalLabel, fmtPdfSignedNum(section.totalNow), fmtPdfSignedNum(section.totalCmp)]);
      };

      pushSection('Activos corrientes', sections.actCorr, 'Total activos corrientes');
      pushSection('Activos no corrientes', sections.actNoCorr, 'Total activos no corrientes');
      if (showNotes) body.push(['Total activos', '', fmtPdfSignedNum(totals.totalActivosNow), fmtPdfSignedNum(totals.totalActivosCmp)]);
      else body.push(['Total activos', fmtPdfSignedNum(totals.totalActivosNow), fmtPdfSignedNum(totals.totalActivosCmp)]);
      pushSection('Pasivos corrientes', sections.pasCorr, 'Total pasivos corrientes');
      pushSection('Pasivos no corrientes', sections.pasNoCorr, 'Total pasivos no corrientes');
      if (showNotes) body.push(['Total pasivos', '', fmtPdfSignedNum(totals.totalPasivosNow), fmtPdfSignedNum(totals.totalPasivosCmp)]);
      else body.push(['Total pasivos', fmtPdfSignedNum(totals.totalPasivosNow), fmtPdfSignedNum(totals.totalPasivosCmp)]);
      pushSection('Patrimonio', sections.patrimonio, 'Total patrimonio');
      if (showNotes) body.push(['Total pasivos mas patrimonio', '', fmtPdfSignedNum(totals.totalPyPNow), fmtPdfSignedNum(totals.totalPyPCmp)]);
      else body.push(['Total pasivos mas patrimonio', fmtPdfSignedNum(totals.totalPyPNow), fmtPdfSignedNum(totals.totalPyPCmp)]);

      const head = showNotes
        ? [['Rubro', 'Nota', String(reportDate), String(compareDate)]]
        : [['Rubro', String(reportDate), String(compareDate)]];

      doc.autoTable({
        startY: header.startY,
        head,
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 7.3, textColor: [55, 55, 55], cellPadding: 2.5, lineWidth: 0 },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', lineWidth: { bottom: 0.25 } },
        columnStyles: showNotes
          ? {
            0: { cellWidth: 280 },
            1: { cellWidth: 54, halign: 'center' },
            2: { cellWidth: 110, halign: 'right' },
            3: { cellWidth: 110, halign: 'right' },
          }
          : {
            0: { cellWidth: 334 },
            1: { cellWidth: 110, halign: 'right' },
            2: { cellWidth: 110, halign: 'right' },
          },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const firstCell = body[data.row.index]?.[0];
          if (typeof firstCell === 'object' && firstCell?.colSpan) return;
          const label = String(firstCell || '').toLowerCase();
          if (label.startsWith('total ')) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
          }
        },
      });

      // Draw footnote
      let signY = doc.lastAutoTable.finalY + 25;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text('Las notas o revelaciones adjuntas son parte integral de los estados financieros.', doc.internal.pageSize.getWidth() / 2, signY, { align: 'center' });
      signY += 15;

      // Draw signatures and notes
      let notasGuardadas: any[] = [];
      try {
        const pMonth = getInputVal('pos-month');
        if (pMonth) {
          notasGuardadas = await loadFinancialNotes(pMonth, 'ESF');
        }
      } catch (_) {}

      if (notasGuardadas.length > 0) {
        const notesFinalY = drawNotesInPdf(doc, notasGuardadas, header.marginLeft, doc.internal.pageSize.getWidth(), lastPositionPdf.accounts, lastPositionPdf.balNow, lastPositionPdf.balCmp);
        if (lastPositionPdf.includeSignatures) {
          await drawPdfSignatures(doc, notesFinalY);
        }
      } else {
        if (lastPositionPdf.includeSignatures) {
          await drawPdfSignatures(doc, signY);
        }
      }

      const totalPagesESF = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPagesESF; p++) {
        doc.setPage(p);
        drawPdfFooter(doc, p);
      }

      doc.save(`estado_situacion_financiera_${reportMonth}_vs_${compareMonth}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

async function fetchFilteredJournalData(fromDate: string, toDate: string, txTypeId: string | null) {
  return pb.send(`/api/gravy/report-journal?fromDate=${fromDate}&toDate=${toDate}&txTypeId=${txTypeId || ''}`, { method: 'GET' });
}

async function renderJournalBook() {
  const view = getReportViewHost();
  if (!view) return;
  const currentMonth = todayStr().slice(0, 7);

  let txTypes = [];
  try {
    txTypes = await API.getTxTypes();
  } catch (_) {
    txTypes = [];
  }

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Libro Diario</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Mes desde</label>
          <input id="journal-month-from" type="month" class="form-input" value="${currentMonth}">
        </div>
        <div class="form-group">
          <label class="form-label">Mes hasta</label>
          <input id="journal-month-to" type="month" class="form-input" value="${currentMonth}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de transacción</label>
          <select id="journal-tx-type" class="form-input">
            <option value="">Todos</option>
            ${txTypes.map(tt => `<option value="${esc(tt.id)}">${esc(tt.code || '')} - ${esc(tt.name || '')}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Formato</label>
          <select id="journal-format" class="form-input">
            <option value="detailed" selected>Detallado</option>
            <option value="summarized">Resumido</option>
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-journal"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-journal" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-journal" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="journal-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona rango mensual y filtros para generar el Libro Diario.
    </div>`;

  let lastRows = [];
  let lastMeta = null;

  const generate = async () => {
    const results = $('#journal-results');
    if (!results) return;

    const fromMonth = getInputVal('journal-month-from');
    const toMonth = getInputVal('journal-month-to');
    const txTypeId = getSelectVal('journal-tx-type');
    const format = getSelectVal('journal-format') || 'detailed';
    const range = monthRangeToDates(fromMonth, toMonth);
    if (!range) return showToast('Rango mensual inválido. Verifica Desde/Hasta.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Libro Diario...</div>';

    try {
      const data = await fetchFilteredJournalData(range.fromDate, range.toDate, txTypeId) as any[];

      const rows = data.map(r => ({
        fecha: r.fecha || '',
        comprobante: r.comprobante || '',
        descripcion: r.descripcion || '',
        tercero: r.tercero || '—',
        cuenta: `${r.accountCode || ''} - ${r.accountName || ''}`.trim(),
        accountCode: r.accountCode || '',
        accountName: r.accountName || '',
        debito: Number(r.debito || 0),
        credito: Number(r.credito || 0),
        typeId: r.typeId,
        typeCode: r.typeCode,
        typeName: r.typeName,
      })).sort((a, b) => `${a.fecha}|${a.comprobante}|${a.cuenta}`.localeCompare(`${b.fecha}|${b.comprobante}|${b.cuenta}`));

      const totalDeb = rows.reduce((s, r) => s + Number(r.debito || 0), 0);
      const totalCre = rows.reduce((s, r) => s + Number(r.credito || 0), 0);

      // Group rows by comprobante (documento) for visual hierarchy and subtotals (Detailed mode)
      const groups = [];
      let currentGroup = null;
      for (const r of rows) {
        if (!currentGroup || currentGroup.comprobante !== r.comprobante) {
          currentGroup = {
            comprobante: r.comprobante,
            fecha: r.fecha,
            descripcion: r.descripcion,
            tercero: r.tercero,
            lines: [],
            totalDeb: 0,
            totalCre: 0,
          };
          groups.push(currentGroup);
        }
        currentGroup.lines.push(r);
        currentGroup.totalDeb += r.debito;
        currentGroup.totalCre += r.credito;
      }

      // Group rows by transaction type and account for Summarized mode
      const summaryGroupsMap = new Map<string, {
        typeId: string;
        typeCode: string;
        typeName: string;
        accountsMap: Map<string, {
          accountCode: string;
          accountName: string;
          debit: number;
          credit: number;
        }>
      }>();

      for (const r of rows) {
        const typeId = r.typeId;
        if (!summaryGroupsMap.has(typeId)) {
          summaryGroupsMap.set(typeId, {
            typeId,
            typeCode: r.typeCode,
            typeName: r.typeName,
            accountsMap: new Map(),
          });
        }

        const g = summaryGroupsMap.get(typeId)!;
        const accCode = r.accountCode;
        if (!g.accountsMap.has(accCode)) {
          g.accountsMap.set(accCode, {
            accountCode: accCode,
            accountName: r.accountName,
            debit: 0,
            credit: 0,
          });
        }

        const accRow = g.accountsMap.get(accCode)!;
        accRow.debit += r.debito;
        accRow.credit += r.credito;
      }

      const sortedSummaryGroups = Array.from(summaryGroupsMap.values())
        .sort((a, b) => a.typeCode.localeCompare(b.typeCode));

      let tbodyHtml = '';
      if (format === 'summarized') {
        tbodyHtml = sortedSummaryGroups.length ? sortedSummaryGroups.map(g => {
          const sortedAccounts = Array.from(g.accountsMap.values())
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
          const subtotalDeb = sortedAccounts.reduce((sum, a) => sum + a.debit, 0);
          const subtotalCre = sortedAccounts.reduce((sum, a) => sum + a.credit, 0);

          return `
            <tr style="background-color: #F9FAFB; font-weight: bold; border-top: 1.5px solid #E5E7EB;">
              <td colspan="4" class="text-left" style="color: #0D2137; padding-top: 6px; padding-bottom: 6px;">
                Tipo de Transacción: <strong>${esc(g.typeCode)} - ${esc(g.typeName)}</strong>
              </td>
            </tr>
            ${sortedAccounts.map(a => `
              <tr>
                <td>${esc(a.accountCode)}</td>
                <td>${esc(a.accountName)}</td>
                <td class="text-right">${a.debit > 0 ? fmt(a.debit) : '—'}</td>
                <td class="text-right">${a.credit > 0 ? fmt(a.credit) : '—'}</td>
              </tr>
            `).join('')}
            <tr class="font-semibold text-xs" style="background-color: #F3F4F6; border-bottom: 1.5px solid #D1D5DB;">
              <td colspan="2" class="text-right font-bold" style="color: #4B5563">Subtotal ${esc(g.typeCode)}</td>
              <td class="text-right font-bold" style="color: #111827">${fmt(subtotalDeb)}</td>
              <td class="text-right font-bold" style="color: #111827">${fmt(subtotalCre)}</td>
            </tr>
          `;
        }).join('') : '<tr><td colspan="4" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>';
      } else {
        tbodyHtml = groups.length ? groups.map(g => {
          return g.lines.map((line, idx) => {
            const showHeader = idx === 0;
            return `
              <tr>
                <td>${showHeader ? esc(line.fecha) : ''}</td>
                <td>${showHeader ? `<strong>${esc(line.comprobante)}</strong>` : ''}</td>
                <td>${showHeader ? esc(line.tercero) : ''}</td>
                <td>${esc(line.cuenta)}</td>
                <td class="text-xs text-gray-500">${esc(line.descripcion !== g.descripcion ? line.descripcion : '')}</td>
                <td class="text-right">${fmt(line.debito)}</td>
                <td class="text-right">${fmt(line.credito)}</td>
              </tr>
            `;
          }).join('') + `
            <tr class="font-semibold" style="background-color: #F9FAFB; border-bottom: 1.5px solid #E5E7EB;">
              <td colspan="5" class="text-right text-xs" style="color: #4B5563">Subtotal ${esc(g.comprobante)}</td>
              <td class="text-right" style="color: #111827">${fmt(g.totalDeb)}</td>
              <td class="text-right" style="color: #111827">${fmt(g.totalCre)}</td>
            </tr>
          `;
        }).join('') : '<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>';
      }

      const tableHeaderHtml = format === 'summarized'
        ? `<thead><tr><th>Código Cuenta</th><th>Cuenta</th><th class="text-right">Débito</th><th class="text-right">Crédito</th></tr></thead>`
        : `<thead><tr><th>Fecha</th><th>Comp.</th><th>Tercero</th><th>Cuenta</th><th>Descripción</th><th class="text-right">Débito</th><th class="text-right">Crédito</th></tr></thead>`;

      const colSpanTotal = format === 'summarized' ? 2 : 5;

      results.innerHTML = `
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Período: <strong>${esc(fromMonth)}</strong> a <strong>${esc(toMonth)}</strong> · Comprobantes: <strong>${fmtN(groups.length)}</strong> · Débito: <strong>${fmt(totalDeb)}</strong> · Crédito: <strong>${fmt(totalCre)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:420px">
          <table class="data-table">
            ${tableHeaderHtml}
            <tbody>
              ${tbodyHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${colSpanTotal}" class="font-bold">TOTAL GENERAL</td>
                <td class="text-right font-bold">${fmt(totalDeb)}</td>
                <td class="text-right font-bold">${fmt(totalCre)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`;

      lastRows = rows;
      lastMeta = { fromMonth, toMonth, txTypeId, format, totalDeb, totalCre };

      if ($('#btn-exp-journal')) $('#btn-exp-journal').disabled = !rows.length;
      if ($('#btn-pdf-journal')) $('#btn-pdf-journal').disabled = !rows.length;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastRows = [];
      lastMeta = null;
      if ($('#btn-exp-journal')) $('#btn-exp-journal').disabled = true;
      if ($('#btn-pdf-journal')) $('#btn-pdf-journal').disabled = true;
    }
  };

  $('#btn-gen-journal')?.addEventListener('click', generate);

  $('#btn-exp-journal')?.addEventListener('click', () => {
    if (!lastRows.length || !lastMeta) return;

    const exportRows = [];
    if (lastMeta.format === 'summarized') {
      // Group rows by transaction type and account for summarized Excel
      const xlsGroupsMap = new Map<string, {
        typeCode: string;
        typeName: string;
        accountsMap: Map<string, {
          accountCode: string;
          accountName: string;
          debit: number;
          credit: number;
        }>
      }>();

      for (const r of lastRows) {
        const typeId = r.typeId;
        if (!xlsGroupsMap.has(typeId)) {
          xlsGroupsMap.set(typeId, {
            typeCode: r.typeCode,
            typeName: r.typeName,
            accountsMap: new Map(),
          });
        }
        const g = xlsGroupsMap.get(typeId)!;
        const accCode = r.accountCode;
        if (!g.accountsMap.has(accCode)) {
          g.accountsMap.set(accCode, {
            accountCode: accCode,
            accountName: r.accountName,
            debit: 0,
            credit: 0,
          });
        }
        const accRow = g.accountsMap.get(accCode)!;
        accRow.debit += r.debito;
        accRow.credit += r.credito;
      }

      const sortedXlsGroups = Array.from(xlsGroupsMap.values())
        .sort((a, b) => a.typeCode.localeCompare(b.typeCode));

      sortedXlsGroups.forEach(g => {
        const sortedAccounts = Array.from(g.accountsMap.values())
          .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
        
        sortedAccounts.forEach(a => {
          exportRows.push({
            tipo_transaccion: `${g.typeCode} - ${g.typeName}`,
            codigo_cuenta: a.accountCode,
            cuenta: a.accountName,
            debito: a.debit,
            credito: a.credit,
          });
        });
      });

      exportRows.push({
        tipo_transaccion: 'TOTAL GENERAL',
        codigo_cuenta: '',
        cuenta: '',
        debito: lastMeta.totalDeb,
        credito: lastMeta.totalCre,
        isBold: true
      });

      exportToExcel(exportRows, [
        { key: 'tipo_transaccion', label: 'Tipo Transacción' },
        { key: 'codigo_cuenta', label: 'Cod. Cuenta' },
        { key: 'cuenta', label: 'Cuenta' },
        { key: 'debito', label: 'Debe' },
        { key: 'credito', label: 'Haber' },
      ], `libro_diario_resumido_${lastMeta.fromMonth}_a_${lastMeta.toMonth}`);
    } else {
      lastRows.forEach(r => {
        exportRows.push({
          fecha: r.fecha,
          comprobante: r.comprobante,
          tercero: r.tercero,
          cuenta: r.cuenta,
          descripcion: r.descripcion,
          debito: r.debito,
          credito: r.credito,
          isBold: false
        });
      });
      exportRows.push({
        fecha: 'TOTAL GENERAL',
        comprobante: '',
        tercero: '',
        cuenta: '',
        descripcion: '',
        debito: lastMeta.totalDeb,
        credito: lastMeta.totalCre,
        isBold: true
      });
      exportToExcel(exportRows, [
        { key: 'fecha', label: 'Fecha' },
        { key: 'comprobante', label: 'Comp.' },
        { key: 'tercero', label: 'Tercero' },
        { key: 'cuenta', label: 'Cuenta' },
        { key: 'descripcion', label: 'Descripcion' },
        { key: 'debito', label: 'Debito' },
        { key: 'credito', label: 'Credito' },
      ], `libro_diario_detallado_${lastMeta.fromMonth}_a_${lastMeta.toMonth}`);
    }
  });

  $('#btn-pdf-journal')?.addEventListener('click', async () => {
    if (!lastRows.length || !lastMeta) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const headerCtx = await getPdfHeaderContext();
      const selectedType = txTypes.find(t => String(t.id) === String(lastMeta.txTypeId));
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Libro Diario',
        subtitles: [
          `Periodo mensual: ${lastMeta.fromMonth} a ${lastMeta.toMonth}`,
          `Tipo de transaccion: ${selectedType ? `${selectedType.code || ''} - ${selectedType.name || ''}` : 'Todos'}`,
          `Formato: ${lastMeta.format === 'summarized' ? 'Resumido' : 'Detallado'}`,
        ],
      });

      const body = [];
      if (lastMeta.format === 'summarized') {
        // Group rows by transaction type and account for summarized PDF
        const pdfGroupsMap = new Map<string, {
          typeCode: string;
          typeName: string;
          accountsMap: Map<string, {
            accountCode: string;
            accountName: string;
            debit: number;
            credit: number;
          }>
        }>();

        for (const r of lastRows) {
          const typeId = r.typeId;
          if (!pdfGroupsMap.has(typeId)) {
            pdfGroupsMap.set(typeId, {
              typeCode: r.typeCode,
              typeName: r.typeName,
              accountsMap: new Map(),
            });
          }
          const g = pdfGroupsMap.get(typeId)!;
          const accCode = r.accountCode;
          if (!g.accountsMap.has(accCode)) {
            g.accountsMap.set(accCode, {
              accountCode: accCode,
              accountName: r.accountName,
              debit: 0,
              credit: 0,
            });
          }
          const accRow = g.accountsMap.get(accCode)!;
          accRow.debit += r.debito;
          accRow.credit += r.credito;
        }

        const sortedPdfGroups = Array.from(pdfGroupsMap.values())
          .sort((a, b) => a.typeCode.localeCompare(b.typeCode));

        sortedPdfGroups.forEach(g => {
          const sortedAccounts = Array.from(g.accountsMap.values())
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
          const subtotalDeb = sortedAccounts.reduce((sum, a) => sum + a.debit, 0);
          const subtotalCre = sortedAccounts.reduce((sum, a) => sum + a.credit, 0);

          // Group Header Row
          body.push([
            { content: `Tipo de Transacción: ${g.typeCode} - ${g.typeName}`, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
          ]);

          // Account Rows
          sortedAccounts.forEach(a => {
            body.push([
              a.accountCode,
              a.accountName,
              a.debit > 0 ? fmtPdfNum(a.debit) : '—',
              a.credit > 0 ? fmtPdfNum(a.credit) : '—'
            ]);
          });

          // Subtotal Row
          body.push([
            { content: `Subtotal ${g.typeCode}`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } },
            { content: fmtPdfNum(subtotalDeb), styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } },
            { content: fmtPdfNum(subtotalCre), styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } }
          ]);
        });

        // Grand Total Row
        body.push([
          { content: 'TOTAL GENERAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 230, 230] } },
          { content: fmtPdfNum(lastMeta.totalDeb), styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 230, 230] } },
          { content: fmtPdfNum(lastMeta.totalCre), styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 230, 230] } }
        ]);

        doc.autoTable({
          startY: header.startY,
          head: [['Código Cuenta', 'Cuenta', 'Débito', 'Crédito']],
          body,
          theme: 'plain',
          margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
          styles: { font: 'helvetica', fontSize: 7.5, textColor: [55, 55, 55], cellPadding: 3.0, lineWidth: 0, overflow: 'linebreak' },
          headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 8.0, lineWidth: { bottom: 0.25 } },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 244 },
            2: { cellWidth: 120, halign: 'right' },
            3: { cellWidth: 120, halign: 'right' },
          },
          didParseCell: (data) => {
            if (data.section !== 'body') return;
            if (data.row.index === body.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [236, 236, 236];
              data.cell.styles.textColor = [13, 33, 55];
              data.cell.styles.lineWidth = { top: 0.2 };
              data.cell.styles.lineColor = [13, 33, 55];
            }
          },
          didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
        });
      } else {
        // Detailed PDF
        const pdfGroups = [];
        let currentGroup = null;
        for (const r of lastRows) {
          if (!currentGroup || currentGroup.comprobante !== r.comprobante) {
            currentGroup = {
              comprobante: r.comprobante,
              fecha: r.fecha,
              descripcion: r.descripcion,
              tercero: r.tercero,
              lines: [],
              totalDeb: 0,
              totalCre: 0,
            };
            pdfGroups.push(currentGroup);
          }
          currentGroup.lines.push(r);
          currentGroup.totalDeb += r.debito;
          currentGroup.totalCre += r.credito;
        }

        pdfGroups.forEach(g => {
          g.lines.forEach((l, idx) => {
            body.push([
              idx === 0 ? l.fecha : '',
              idx === 0 ? l.comprobante : '',
              idx === 0 ? l.tercero : '',
              l.cuenta,
              l.descripcion,
              fmtPdfNum(l.debito),
              fmtPdfNum(l.credito)
            ]);
          });
          // Subtotal row
          body.push([
            { content: `Subtotal ${g.comprobante}`, colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } },
            { content: fmtPdfNum(g.totalDeb), styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } },
            { content: fmtPdfNum(g.totalCre), styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } }
          ]);
        });
        // Grand total row
        body.push([
          { content: 'TOTAL GENERAL', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 230, 230] } },
          { content: fmtPdfNum(lastMeta.totalDeb), styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 230, 230] } },
          { content: fmtPdfNum(lastMeta.totalCre), styles: { fontStyle: 'bold', halign: 'right', fillColor: [230, 230, 230] } }
        ]);

        doc.autoTable({
          startY: header.startY,
          head: [['Fecha', 'Comp.', 'Tercero', 'Cuenta', 'Descripcion', 'Debito', 'Credito']],
          body,
          theme: 'plain',
          margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
          styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
          headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 65 },
            2: { cellWidth: 90 },
            3: { cellWidth: 110 },
            4: { cellWidth: 137 },
            5: { cellWidth: 56, halign: 'right' },
            6: { cellWidth: 56, halign: 'right' },
          },
          didParseCell: (data) => {
            if (data.section !== 'body') return;
            if (data.row.index === body.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [236, 236, 236];
              data.cell.styles.textColor = [13, 33, 55];
              data.cell.styles.lineWidth = { top: 0.2 };
              data.cell.styles.lineColor = [13, 33, 55];
            }
          },
          didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
        });
      }

      doc.save(`libro_diario_${lastMeta.fromMonth}_${lastMeta.toMonth}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}
async function renderAuxiliaryBook() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Libro Auxiliar...</div>';

  try {
    const [{ accounts }, thirdParties] = await Promise.all([
      ensureAccountsSaldos(),
      ensureThirdParties(),
    ]);

    view.innerHTML = `
      <div class="p-4 border-b" style="border-color:#F3F4F6">
        <h4 class="font-bold mb-3" style="color:#0D2137">Libro Auxiliar</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <select id="aux-mode" class="form-input">
            <option value="cuenta-tercero">Cuenta y luego Tercero</option>
            <option value="tercero-cuenta">Tercero y luego Cuenta</option>
            <option value="cuenta-sin-tercero">Por Cuenta (Sin Terceros)</option>
          </select>
          <div class="relative">
            <input type="text" id="aux-account-search" class="form-input w-full" placeholder="Todas las cuentas (Escribe para buscar...)" autocomplete="off" />
            <input type="hidden" id="aux-account" value="" />
            <div id="aux-account-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:250px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:90"></div>
          </div>
          <div class="relative">
            <input type="text" id="aux-third-search" class="form-input w-full" placeholder="Todos los terceros (Escribe para buscar...)" autocomplete="off" />
            <input type="hidden" id="aux-third" value="" />
            <div id="aux-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:250px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:90"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Fecha desde (saldo inicial)</label>
            <input type="date" id="aux-date-from" class="form-input mt-1" />
          </div>
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Fecha hasta</label>
            <input type="date" id="aux-date-to" class="form-input mt-1" />
          </div>
          <div class="flex items-end">
            <button class="btn btn-primary w-full" id="btn-gen-aux"><i class="fas fa-filter"></i> Generar</button>
          </div>
        </div>
      </div>
      <div id="aux-results" class="p-4 text-sm" style="color:#6B7280">Configura filtros y pulsa Generar.</div>`;

    initAccountSearch(
      document.getElementById('aux-account-search') as HTMLInputElement,
      document.getElementById('aux-account') as HTMLInputElement,
      document.getElementById('aux-account-results') as HTMLElement,
      accounts
    );
    initThirdSearch(
      document.getElementById('aux-third-search') as HTMLInputElement,
      document.getElementById('aux-third') as HTMLInputElement,
      document.getElementById('aux-third-results') as HTMLElement,
      thirdParties
    );

    $('#btn-gen-aux')?.addEventListener('click', generateAuxiliaryRows);
  } catch (err) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function closeAuxTxDetailPanel() {
  const panel = $('#aux-tx-detail-overlay');
  if (!panel) return;
  panel.remove();
}

async function openAuxTxDetailInReport(id) {
  try {
    closeAuxTxDetailPanel();
    const panel = document.createElement('div');
    panel.id = 'aux-tx-detail-overlay';
    panel.style.cssText = 'position:fixed;inset:0;z-index:1200;background:rgba(13,33,55,.45);display:flex;align-items:center;justify-content:center;padding:20px';
    panel.innerHTML = '<div class="rounded-2xl border bg-white p-6 text-center" style="width:min(1080px,96vw);max-height:92vh;overflow:auto;border-color:#D1D5DB;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comprobante...</div>';
    document.body.appendChild(panel);

    const tx = await pb.get('transactions', id, { expand: 'tx_type_id,third_party_id,user_id' });
    const lines = await API.getTxLines(id);

    panel.innerHTML = `
      <div class="rounded-2xl border bg-white" style="width:min(1080px,96vw);max-height:92vh;overflow:auto;border-color:#D1D5DB;box-shadow:0 24px 60px rgba(0,0,0,.25)">
        <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color:#E5E7EB">
          <h4 class="font-bold" style="color:#0D2137">Comprobante ${esc(tx.number || '')}</h4>
          <button class="btn btn-outline btn-sm" onclick="closeAuxTxDetailPanel()"><i class="fas fa-xmark"></i> Cerrar</button>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
            <div><strong>Fecha:</strong> ${esc(tx.date || '—')}</div>
            <div><strong>Tercero:</strong> ${esc(tx.expand?.third_party_id?.name || '—')}</div>
            <div><strong>Estado:</strong> ${esc(tx.status || '—')}</div>
          </div>
          <p class="mb-3" style="color:#6B7280">${esc(tx.description || '')}</p>
          <div class="overflow-x-auto" style="max-height:260px">
            <table class="data-table">
              <thead><tr><th>Cuenta</th><th>Tercero línea</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
              <tbody>
                ${lines.map(l => `<tr>
                  <td>${esc(l.expand?.account_id?.code || '')} - ${esc(l.expand?.account_id?.name || '')}</td>
                  <td>${esc(l.expand?.third_party_id?.name || '—')}</td>
                  <td>${l.cross_doc_ref ? `<span class="badge" style="background:#F3F4F6;color:#374151">${esc(l.cross_doc_ref)}</span>` : '—'}</td>
                  <td>${esc(l.description || '—')}</td>
                  <td>${fmt(l.debit || 0)}</td>
                  <td>${fmt(l.credit || 0)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="flex justify-end mt-3">
            <button class="btn btn-outline btn-sm" style="border-color:#374151;color:#374151" onclick="printTxNotaContable('${esc(id)}')"><i class="fas fa-print"></i> Imprimir nota contable</button>
          </div>
        </div>
      </div>`;

    panel.addEventListener('click', (ev) => {
      if (ev.target === panel) closeAuxTxDetailPanel();
    });
  } catch (err) {
    const panel = $('#aux-tx-detail-overlay');
    if (panel) {
      panel.innerHTML = `<div class="rounded-xl border p-4 bg-white" style="width:min(780px,92vw);border-color:#FCA5A5;background:#FEF2F2;color:#991B1B"><div class="flex items-center justify-between gap-2"><div><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div><button class="btn btn-outline btn-sm" onclick="closeAuxTxDetailPanel()">Cerrar</button></div></div>`;
    }
  }
}

async function generateAuxiliaryRows() {
  const results = $('#aux-results');
  if (!results) return;

  const mode      = getSelectVal('aux-mode');
  let accountId   = getSelectVal('aux-account');
  let thirdId     = getSelectVal('aux-third');
  const dateFrom  = ($('#aux-date-from')?.value || '').trim();
  const dateTo    = ($('#aux-date-to')?.value   || '').trim();

  // Validación obligatoria de rango de fechas
  if (!dateFrom || !dateTo) {
    results.innerHTML = '<div class="p-4 text-center text-orange-500 font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>Por favor selecciona ambas fechas (desde y hasta) para generar el Libro Auxiliar.</div>';
    showToast('Selecciona ambas fechas (desde/hasta).', 'warning');
    return;
  }

  results.innerHTML = '<div class="p-4 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando...</div>';

  try {
    // Cargar catálogos ligeros
    const [{ accounts }, thirdParties] = await Promise.all([
      ensureAccountsSaldos(),
      ensureThirdParties(),
    ]);

    // Validar coincidencia de autocompletado para cuentas
    const accountSearchVal = ($('#aux-account-search') as HTMLInputElement)?.value.trim();
    if (accountSearchVal && !accountId) {
      const exactMatch = accounts.find(a => String(a.code || '').trim() === accountSearchVal || `${a.code} - ${a.name}` === accountSearchVal);
      if (exactMatch) {
        accountId = exactMatch.id;
        const hiddenEl = document.getElementById('aux-account') as HTMLInputElement;
        if (hiddenEl) hiddenEl.value = exactMatch.id;
      } else {
        results.innerHTML = '<div class="p-4 text-center text-orange-500 font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>Por favor selecciona una cuenta válida de la lista sugerida.</div>';
        showToast('Selecciona una cuenta sugerida válida.', 'warning');
        return;
      }
    }

    // Validar coincidencia de autocompletado para terceros
    const thirdSearchVal = ($('#aux-third-search') as HTMLInputElement)?.value.trim();
    if (thirdSearchVal && !thirdId) {
      const exactMatch = thirdParties.find(t => String(t.doc_number || '').trim() === thirdSearchVal || `${t.doc_number || ''} - ${t.name}` === thirdSearchVal);
      if (exactMatch) {
        thirdId = exactMatch.id;
        const hiddenEl = document.getElementById('aux-third') as HTMLInputElement;
        if (hiddenEl) hiddenEl.value = exactMatch.id;
      } else {
        results.innerHTML = '<div class="p-4 text-center text-orange-500 font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>Por favor selecciona un tercero válido de la lista sugerida.</div>';
        showToast('Selecciona un tercero sugerido válido.', 'warning');
        return;
      }
    }

    // Construye el conjunto de cuentas válidas: la seleccionada + todos sus descendientes
    let allowedAccountIds = null;
    if (accountId) {
      const selectedAccount = accounts.find(a => a.id === accountId);
      if (selectedAccount) {
        const selectedCode = String(selectedAccount.code || '');
        allowedAccountIds = new Set(
          accounts
            .filter(a => {
              const code = String(a.code || '');
              return code === selectedCode || code.startsWith(selectedCode);
            })
            .map(a => a.id)
        );
      } else {
        allowedAccountIds = new Set([accountId]);
      }
    }

    // Consultar el endpoint optimizado del Libro Auxiliar
    const accIdsParam = allowedAccountIds ? Array.from(allowedAccountIds).join(',') : '';
    const res: any = await pb.send(`/api/gravy/report-auxiliary?fromDate=${dateFrom}&toDate=${dateTo}&accountIds=${accIdsParam}&thirdId=${thirdId || ''}`, { method: 'GET' });
    const { openingBalances, periodLines } = res;

    // ── Saldos anteriores (movimientos ANTES de dateFrom) ──
    const openingByKey = new Map();
    for (const b of openingBalances) {
      if (mode === 'cuenta-sin-tercero') {
        const openingKey = `acc|${b.accountId}`;
        openingByKey.set(openingKey, (openingByKey.get(openingKey) || 0) + Number(b.balance || 0));
      } else {
        const accountManejaCruce = b.docCruce !== 'NO_CRUCE';
        const openingKey = accountManejaCruce
          ? `doc|${b.accountId}|${b.thirdId}|${b.docCruce}`
          : `acc|${b.accountId}|${b.thirdId}`;
        openingByKey.set(openingKey, Number(b.balance || 0));
      }
    }

    // ── Filas del período ──
    const rows = periodLines.map(l => {
      const isCruce = l.accountManejaCruce === 1 || l.accountManejaCruce === true;
      const thirdName = l.thirdName || 'Sin tercero';
      const thirdDoc = l.thirdDoc || '';
      const thirdDisplay = thirdDoc ? `${thirdDoc} - ${thirdName}` : thirdName;

      return {
        fecha:         l.fecha || '',
        comprobante:   l.comprobante || '',
        txId:          l.txId || '',
        cuenta:        `${l.accountCode} - ${l.accountName}`.trim(),
        accountCode:   l.accountCode,
        accountName:   l.accountName,
        tercero:       thirdDisplay,
        thirdName:     thirdName,
        thirdDoc:      thirdDoc,
        doc_cruce:     l.doc_cruce,
        descripcion:   l.descripcion || '',
        debito:        Number(l.debito || 0),
        credito:       Number(l.credito || 0),
        keyCuenta:     `${l.accountCode} - ${l.accountName}`.trim(),
        keyTercero:    thirdDisplay,
        accountId:     l.accountId,
        accountNature: l.accountNature || 'debit',
        accountManejaCruce: isCruce,
        thirdId:        l.thirdId || 'NO_TERCERO',
      };
    });

    // ── Pre-calcular saldos por fila ─────────────────────────────────────────
    // saldo_anterior: saldo inicial del rango
    // saldo_actual: saldo inicial + movimientos acumulados en el rango
    const sortedForBalance = [...rows].sort((a, b) => {
      if (mode === 'cuenta-sin-tercero') {
        return `${a.accountId}|${a.fecha}|${a.comprobante}|${a.txId}`.localeCompare(
               `${b.accountId}|${b.fecha}|${b.comprobante}|${b.txId}`);
      }
      return `${a.accountId}|${a.thirdId}|${a.fecha}|${a.doc_cruce || 'SIN_DOC'}|${a.comprobante}`.localeCompare(
             `${b.accountId}|${b.thirdId}|${b.fecha}|${b.doc_cruce || 'SIN_DOC'}|${b.comprobante}`);
    });

    const periodDeltaByKey = new Map();
    for (const row of sortedForBalance) {
      const balanceKey = (mode === 'cuenta-sin-tercero')
        ? `acc|${row.accountId}`
        : (row.accountManejaCruce
            ? `doc|${row.accountId}|${row.thirdId}|${row.doc_cruce || 'SIN_DOC'}`
            : `acc|${row.accountId}|${row.thirdId}`);
      row.balanceKey = balanceKey;
      const opening = openingByKey.get(balanceKey) || 0;
      const moved = periodDeltaByKey.get(balanceKey) || 0;
      const delta = row.debito - row.credito;
      row.saldo_anterior = opening + moved;
      row.saldo_actual = opening + moved + delta;
      periodDeltaByKey.set(balanceKey, moved + delta);
    }

    const primaryField   = mode === 'tercero-cuenta' ? 'keyTercero' : 'keyCuenta';
    const secondaryField = mode === 'tercero-cuenta' ? 'keyCuenta'  : 'keyTercero';
    const primaryLabel   = mode === 'cuenta-sin-tercero' ? 'Cuenta' : (mode === 'tercero-cuenta' ? 'Tercero' : 'Cuenta');
    const secondaryLabel = mode === 'cuenta-sin-tercero' ? 'Sin Terceros' : (mode === 'tercero-cuenta' ? 'Cuenta' : 'Tercero');

    if (mode === 'cuenta-sin-tercero') {
      rows.sort((a, b) => {
        const aKey = `${a.accountCode}|${a.fecha}|${a.comprobante}|${a.txId}`;
        const bKey = `${b.accountCode}|${b.fecha}|${b.comprobante}|${b.txId}`;
        return aKey.localeCompare(bKey);
      });
    } else {
      rows.sort((a, b) => {
        const aKey = `${a[primaryField]}|${a[secondaryField]}|${a.fecha}|${a.doc_cruce || 'SIN_DOC'}|${a.comprobante}`;
        const bKey = `${b[primaryField]}|${b[secondaryField]}|${b.fecha}|${b.doc_cruce || 'SIN_DOC'}|${b.comprobante}`;
        return aKey.localeCompare(bKey);
      });
    }

    if (!rows.length) {
      results.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF">No hay movimientos para los filtros seleccionados.</div>';
      return;
    }

    const calcOpeningTotal = (items) => {
      const seen = new Set();
      let total = 0;
      for (const r of items) {
        const k = r.balanceKey || '';
        if (!k || seen.has(k)) continue;
        seen.add(k);
        total += Number(r.saldo_anterior || 0);
      }
      return total;
    };

    const calcClosingTotal = (items) => {
      const lastByKey = new Map();
      for (const r of items) {
        const k = r.balanceKey || '';
        if (!k) continue;
        lastByKey.set(k, Number(r.saldo_actual || 0));
      }
      let total = 0;
      lastByKey.forEach(v => { total += v; });
      return total;
    };

    const totalPrev   = calcOpeningTotal(rows);
    const totalDebit  = rows.reduce((s, r) => s + r.debito,  0);
    const totalCredit = rows.reduce((s, r) => s + r.credito, 0);
    const totalCurr   = calcClosingTotal(rows);

    const layoutRows = [];

    if (mode === 'cuenta-sin-tercero') {
      const groupedAcc = new Map();
      for (const row of rows) {
        const accKey = row.keyCuenta || '—';
        if (!groupedAcc.has(accKey)) groupedAcc.set(accKey, []);
        groupedAcc.get(accKey).push(row);
      }

      groupedAcc.forEach((items, accKey) => {
        const firstAcc = items[0] || {};
        const accDebit = items.reduce((s, r) => s + r.debito, 0);
        const accCredit = items.reduce((s, r) => s + r.credito, 0);
        const accPrev = calcOpeningTotal(items);
        const accCurr = calcClosingTotal(items);

        layoutRows.push({
          kind: 'primary',
          cuenta: firstAcc.accountCode || accKey,
          detalle: (firstAcc.accountName || '').toUpperCase(),
        });

        items.forEach((r) => {
          layoutRows.push({
            kind: 'detail',
            cuenta: r.accountCode,
            tercero: r.tercero,
            fecha: r.fecha,
            cruce: r.doc_cruce,
            detalle: r.descripcion,
            comprobante: r.comprobante,
            txId: r.txId,
            saldo_anterior: r.saldo_anterior,
            debito: r.debito,
            credito: r.credito,
            saldo_actual: r.saldo_actual,
          });
        });

        layoutRows.push({
          kind: 'subtotal-primary',
          detalle: `SubTotal ${firstAcc.accountName || accKey}`,
          saldo_anterior: accPrev,
          debito: accDebit,
          credito: accCredit,
          saldo_actual: accCurr,
        });
      });
    } else {
      const grouped = new Map();
      for (const row of rows) {
        const pk = row[primaryField] || '—';
        const sk = row[secondaryField] || '—';
        if (!grouped.has(pk)) grouped.set(pk, new Map());
        const secondaryMap = grouped.get(pk);
        if (!secondaryMap.has(sk)) secondaryMap.set(sk, []);
        secondaryMap.get(sk).push(row);
      }

      grouped.forEach((secondaryMap, primaryValue) => {
        const primaryRows = [...secondaryMap.values()].flat();
        const firstPrimary = primaryRows[0] || {};
        const primaryDebit = primaryRows.reduce((s, r) => s + r.debito, 0);
        const primaryCredit = primaryRows.reduce((s, r) => s + r.credito, 0);
        const primaryPrev = calcOpeningTotal(primaryRows);
        const primaryCurr = calcClosingTotal(primaryRows);

        if (mode === 'cuenta-tercero') {
          layoutRows.push({
            kind: 'primary',
            cuenta: firstPrimary.accountCode || primaryValue,
            detalle: (firstPrimary.accountName || '').toUpperCase(),
          });
        } else {
          layoutRows.push({
            kind: 'primary',
            nit: firstPrimary.thirdDoc || '',
            detalle: (firstPrimary.thirdName || primaryValue).toUpperCase(),
          });
        }

        secondaryMap.forEach((items, secondaryValue) => {
          const firstSecondary = items[0] || {};
          const secPrev = calcOpeningTotal(items);
          const secDebit = items.reduce((s, r) => s + r.debito, 0);
          const secCredit = items.reduce((s, r) => s + r.credito, 0);
          const secCurr = calcClosingTotal(items);

          if (mode === 'cuenta-tercero') {
            layoutRows.push({
              kind: 'secondary',
              nit: firstSecondary.thirdDoc || '',
              detalle: (firstSecondary.thirdName || secondaryValue).toUpperCase(),
            });
          } else {
            layoutRows.push({
              kind: 'secondary',
              cuenta: firstSecondary.accountCode || secondaryValue,
              detalle: (firstSecondary.accountName || '').toUpperCase(),
            });
          }

          items.forEach((r) => {
            layoutRows.push({
              kind: 'detail',
              cuenta: r.accountCode,
              tercero: r.tercero,
              fecha: r.fecha,
              cruce: r.doc_cruce,
              detalle: r.descripcion,
              comprobante: r.comprobante,
              txId: r.txId,
              saldo_anterior: r.saldo_anterior,
              debito: r.debito,
              credito: r.credito,
              saldo_actual: r.saldo_actual,
            });
          });

          layoutRows.push({
            kind: 'subtotal-secondary',
            detalle: `SubTotal ${mode === 'cuenta-tercero' ? (firstSecondary.thirdName || secondaryValue) : (firstSecondary.accountName || secondaryValue)}`,
            saldo_anterior: secPrev,
            debito: secDebit,
            credito: secCredit,
            saldo_actual: secCurr,
          });
        });

        layoutRows.push({
          kind: 'subtotal-primary',
          detalle: `SubTotal ${mode === 'cuenta-tercero' ? (firstPrimary.accountName || primaryValue) : (firstPrimary.thirdName || primaryValue)}`,
          saldo_anterior: primaryPrev,
          debito: primaryDebit,
          credito: primaryCredit,
          saldo_actual: primaryCurr,
        });
      });
    }

    layoutRows.push({
      kind: 'grand-total',
      detalle: 'GRAN TOTAL LIBRO AUXILIAR',
      saldo_anterior: totalPrev,
      debito: totalDebit,
      credito: totalCredit,
      saldo_actual: totalCurr,
    });

    const firstKey = 'cuenta';
    const secondKey = 'tercero';

    const groupedHtml = layoutRows.map((r) => {
      if (r.kind === 'primary') {
        if (mode === 'tercero-cuenta') {
          return `<tr style="background:#F9FAFB;border-top:1px solid #E5E7EB;border-bottom:1px solid #E5E7EB"><td></td><td style="font-weight:700;color:#0D2137">${esc(r.nit || '')} - ${esc(r.detalle || '')}</td><td colspan="4"></td><td></td><td></td><td></td><td></td></tr>`;
        }
        return `<tr style="background:#F9FAFB;border-top:1px solid #E5E7EB;border-bottom:1px solid #E5E7EB"><td style="font-weight:700;color:#0D2137">${esc(r.cuenta || '')}</td><td colspan="4" style="font-weight:700;color:#0D2137">${esc(r.detalle || '')}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
      }
      if (r.kind === 'secondary') {
        if (mode === 'tercero-cuenta') {
          return `<tr><td style="font-weight:700;color:#374151">${esc(r.cuenta || '')}</td><td style="font-weight:700;color:#374151" colspan="4">${esc(r.detalle || '')}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
        }
        return `<tr><td></td><td style="font-weight:700;color:#374151" colspan="4">${esc(r.nit || '')} - ${esc(r.detalle || '')}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
      }
      if (r.kind === 'subtotal-secondary') {
        return `<tr style="background:#F5F5F5;border-top:1px solid #D0D0D0"><td colspan="6" style="font-weight:700;color:#0D2137">${esc(r.detalle || '')}</td><td style="text-align:right;font-weight:700">${fmtSignedPlain(r.saldo_anterior || 0)}</td><td style="text-align:right;font-weight:700">${fmt(r.debito || 0)}</td><td style="text-align:right;font-weight:700">${fmt(r.credito || 0)}</td><td style="text-align:right;font-weight:700">${fmtSignedPlain(r.saldo_actual || 0)}</td></tr>`;
      }
      if (r.kind === 'subtotal-primary') {
        return `<tr style="background:#ECECEC;border-top:1px solid #B0B0B0;border-bottom:1px solid #B0B0B0"><td colspan="6" style="font-weight:800;color:#0D2137">${esc(r.detalle || '')}</td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_anterior || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.debito || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.credito || 0)}</td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_actual || 0)}</td></tr>`;
      }
      if (r.kind === 'grand-total') {
        return `<tr style="background:#E2E2E2;border-top:2px solid #0D2137;border-bottom:2px solid #0D2137"><td colspan="6" style="font-weight:800;color:#0D2137">${esc(r.detalle || '')}</td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_anterior || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.debito || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.credito || 0)}</td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_actual || 0)}</td></tr>`;
      }
      return `<tr>
        <td style="font-size:0.8rem;color:#4B5563">${esc(r.cuenta || '')}</td>
        <td style="font-weight:600;color:#1F2937">${esc(r.tercero || '')}</td>
        <td>${esc(r.fecha || '')}</td>
        <td style="font-family:monospace;font-size:0.8rem">${esc(r.cruce || '')}</td>
        <td>${esc(r.detalle || '')}</td>
        <td>${r.txId ? `<a href="#" onclick="event.preventDefault(); openAuxTxDetailInReport('${esc(r.txId)}');" style="color:#2563EB;font-weight:700;text-decoration:underline">${esc(r.comprobante || '')}</a>` : esc(r.comprobante || '')}</td>
        <td style="text-align:right">${fmtSignedPlain(r.saldo_anterior || 0)}</td>
        <td style="text-align:right">${fmt(r.debito || 0)}</td>
        <td style="text-align:right">${fmt(r.credito || 0)}</td>
        <td style="text-align:right;font-weight:600">${fmtSignedPlain(r.saldo_actual || 0)}</td>
      </tr>`;
    }).join('');

    results.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#6B7280">Orden actual: <strong>${esc(primaryLabel)}${mode === 'cuenta-sin-tercero' ? '' : ' → ' + esc(secondaryLabel)} → Fecha → Doc. Cruce</strong> · Registros: <strong>${fmtN(rows.length)}</strong></p>
        <div class="flex items-center gap-2">
          <button class="btn btn-outline btn-sm" id="btn-pdf-aux" style="border-color:#6B7280;color:#374151"><i class="fas fa-file-pdf"></i> PDF</button>
          ${can('canExport') ? '<button class="btn btn-outline btn-sm" id="btn-exp-aux"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
      <div class="overflow-x-auto" style="max-height:420px">
        <table class="data-table">
          <thead><tr><th>CUENTA</th><th>TERCERO</th><th>FECHA</th><th>CRUCE</th><th>DETALLE DOCTO.</th><th>COMPROBANTE</th><th>SALDO ANTERIOR</th><th>DEBITO</th><th>CREDITO</th><th>NUEVO SALDO</th></tr></thead>
          <tbody>${groupedHtml}</tbody>
        </table>
      </div>`;

    $('#btn-exp-aux')?.addEventListener('click', async () => {
      try {
        const [companyName, companyNit, companyAddress, companyCity, companyCountry, softwareName] = await Promise.all([
          API.getSetting('company_name').catch(() => ''),
          API.getSetting('company_nit').catch(() => ''),
          API.getSetting('company_address').catch(() => ''),
          API.getSetting('company_city').catch(() => ''),
          API.getSetting('company_country').catch(() => ''),
          API.getSetting('software_name').catch(() => ''),
        ]);

        const companyLine1 = (companyName || 'EMPRESA').trim();
        const companyLine2 = companyNit ? `NIT: ${companyNit.trim()}` : '';
        const companyLine3 = [companyAddress, companyCity, companyCountry].map(v => String(v || '').trim()).filter(Boolean).join(' / ');
        const reportTypeLine = mode === 'cuenta-sin-tercero' ? 'Por Cuenta (Sin Terceros)' : `${primaryLabel} -> ${secondaryLabel}`;
        const reportDateLine = `Desde: ${dateFrom || 'Inicio'}  Hasta: ${dateTo || 'Hoy'}`;
        const selectedAcc = accountId ? accounts.find(a => a.id === accountId) : null;
        const selectedAccLabel = selectedAcc
          ? [selectedAcc.code, selectedAcc.name].map(v => String(v || '').trim()).filter(Boolean).join(' - ') || 'Cuenta seleccionada'
          : 'Todas';
        const reportAccountLine = `Cuentas consultadas: ${selectedAccLabel}`;
        const softwareLine = (softwareName || 'GRAVY v2.0').trim();
        const userName = (sessionStorage.getItem('user_name') || 'Usuario').trim();
        const generatedAt = new Date().toLocaleString('es-CO');

        const exportRows = layoutRows.map((r) => ({
          cuenta: r.cuenta || '',
          tercero: r.tercero || '',
          fecha: r.fecha || '',
          cruce: r.cruce || '',
          detalle_docto: r.detalle || '',
          comprobante: r.comprobante || '',
          saldo_anterior: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.saldo_anterior || 0) : '',
          debito: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.debito || 0) : '',
          credito: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.credito || 0) : '',
          nuevo_saldo: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.saldo_actual || 0) : '',
          isBold: r.kind !== 'detail',
        }));

        exportToExcel(exportRows, [
          { key: 'cuenta',         label: 'CUENTA' },
          { key: 'tercero',        label: 'TERCERO' },
          { key: 'fecha',          label: 'FECHA' },
          { key: 'cruce',          label: 'CRUCE' },
          { key: 'detalle_docto',   label: 'DETALLE DOCTO.' },
          { key: 'comprobante',     label: 'COMPROBANTE' },
          { key: 'saldo_anterior',  label: 'SALDO ANTERIOR' },
          { key: 'debito',          label: 'DEBITO' },
          { key: 'credito',         label: 'CREDITO' },
          { key: 'nuevo_saldo',     label: 'NUEVO SALDO' },
        ], 'libro_auxiliar', {
          title: 'LIBRO AUXILIAR',
          companyName: companyLine1,
          companyNit: companyLine2,
          companyAddress: companyLine3,
          subtitles: [
            `Tipo: ${reportTypeLine}`,
            reportDateLine,
            reportAccountLine,
            `Software: ${softwareLine} | Usuario: ${userName} | Fecha de generación: ${generatedAt}`,
          ],
        });
      } catch (err: any) {
        showToast(`Error al exportar a Excel: ${err.message}`, 'error');
      }
    });

    $('#btn-pdf-aux')?.addEventListener('click', async () => {
      try {
        const jsPdfCtor = window.jspdf?.jsPDF;
        if (typeof jsPdfCtor !== 'function') {
          showToast('No se pudo inicializar el generador PDF.', 'error');
          return;
        }

        const [companyName, companyNit, companyAddress, companyCity, companyCountry, softwareName] = await Promise.all([
          API.getSetting('company_name').catch(() => ''),
          API.getSetting('company_nit').catch(() => ''),
          API.getSetting('company_address').catch(() => ''),
          API.getSetting('company_city').catch(() => ''),
          API.getSetting('company_country').catch(() => ''),
          API.getSetting('software_name').catch(() => ''),
        ]);

        const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const generatedAt = new Date().toLocaleString('es-CO');
        const pageMarginLeft = 24;
        const pageMarginRight = pageWidth - 24;
        const companyLine1 = (companyName || 'EMPRESA').trim();
        const companyLine2 = `NIT: ${(companyNit || 'N/A').trim()}`;
        const companyLine3 = [companyAddress, companyCity, companyCountry].map(v => String(v || '').trim()).filter(Boolean).join(' / ') || 'Direccion no configurada';
        const reportTypeLine = mode === 'cuenta-sin-tercero' ? 'Por Cuenta (Sin Terceros)' : `${primaryLabel} -> ${secondaryLabel}`;
        const reportDateLine = `Desde: ${dateFrom || 'Inicio'}  Hasta: ${dateTo || 'Hoy'}`;
        const selectedAcc = accountId ? accounts.find(a => a.id === accountId) : null;
        const selectedAccLabel = selectedAcc
          ? [selectedAcc.code, selectedAcc.name].map(v => String(v || '').trim()).filter(Boolean).join(' - ') || 'Cuenta seleccionada'
          : 'Todas';
        const reportAccountLine = `Cuentas consultadas: ${selectedAccLabel}`;
        const softwareLine = (softwareName || 'GRAVY v2.0').trim();
        const userName = (sessionStorage.getItem('user_name') || 'Usuario').trim();

        // === ENCABEZADO EN 3 BLOQUES ===
        // Bloque izquierdo: Empresa
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(13, 33, 55);
        doc.text(companyLine1, pageMarginLeft, 20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(companyLine2, pageMarginLeft, 30);
        doc.text(companyLine3, pageMarginLeft, 40);

        // Bloque central: Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(13, 33, 55);
        doc.text('LIBRO AUXILIAR', pageWidth / 2, 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(`Tipo: ${reportTypeLine}`, pageWidth / 2, 30, { align: 'center' });
        doc.text(reportDateLine, pageWidth / 2, 40, { align: 'center' });
        doc.text(reportAccountLine, pageWidth / 2, 50, { align: 'center' });

        // Bloque derecho: Software + usuario + fecha/hora
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(softwareLine, pageMarginRight, 20, { align: 'right' });
        doc.text(`Usuario: ${userName}`, pageMarginRight, 30, { align: 'right' });
        doc.text(`Impreso: ${generatedAt}`, pageMarginRight, 40, { align: 'right' });

        // Línea separadora
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.line(pageMarginLeft, 58, pageMarginRight, 58);

        // Construir body con información de tipo de fila
        const fmtPdfNum = (v) => Number(v || 0).toLocaleString('es-CO', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const fmtPdfSignedNum = (v) => {
          const n = Number(v || 0);
          const text = fmtPdfNum(Math.abs(n));
          return n < 0 ? `-${text}` : text;
        };

        const body = layoutRows.map((r) => {
          const row = [];
          if (r.kind === 'primary') {
            if (mode === 'tercero-cuenta') {
              row.push('', `${r.nit || ''} ${r.detalle || ''}`, '', '', '', '', '', '', '', '');
            } else {
              row.push(r.cuenta || '', r.detalle || '', '', '', '', '', '', '', '', '');
            }
          } else if (r.kind === 'secondary') {
            if (mode === 'tercero-cuenta') {
              row.push(r.cuenta || '', r.detalle || '', '', '', '', '', '', '', '', '');
            } else {
              row.push('', `${r.nit || ''} ${r.detalle || ''}`, '', '', '', '', '', '', '', '');
            }
          } else if (r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') {
            row.push('', '', '', '', '', r.detalle || '', fmtPdfSignedNum(r.saldo_anterior || 0), fmtPdfNum(r.debito || 0), fmtPdfNum(r.credito || 0), fmtPdfSignedNum(r.saldo_actual || 0));
          } else {
            row.push(r.cuenta || '', r.tercero || '', r.fecha || '', r.cruce || '', r.detalle || '', r.comprobante || '', fmtPdfSignedNum(r.saldo_anterior || 0), fmtPdfNum(r.debito || 0), fmtPdfNum(r.credito || 0), fmtPdfSignedNum(r.saldo_actual || 0));
          }
          row._rowKind = r.kind; // Marcar tipo de fila para styling
          return row;
        });

        doc.autoTable({
          startY: 66,
          head: [[
            'CUENTA', 'TERCERO', 'FECHA', 'CRUCE', 'DETALLE DOCTO.', 'COMPROBANTE',
            'SALDO ANTERIOR', 'DEBITO', 'CREDITO', 'NUEVO SALDO',
          ]],
          body,
          theme: 'plain',
          margin: { top: 66, left: pageMarginLeft, right: 24, bottom: 26 },
          styles: {
            font: 'helvetica',
            fontSize: 7.5,
            textColor: [55, 55, 55],
            lineColor: [225, 225, 225],
            lineWidth: 0,
            cellPadding: 2.8,
          },
          headStyles: {
            fillColor: [230, 230, 230],
            textColor: [13, 33, 55],
            fontStyle: 'bold',
            lineColor: [180, 180, 180],
            lineWidth: { top: 0, right: 0, bottom: 0.25, left: 0 },
          },
          columnStyles: {
            0: { cellWidth: 42 },
            1: { cellWidth: 70 },
            2: { cellWidth: 42 },
            3: { cellWidth: 32 },
            4: { cellWidth: 92 },
            5: { cellWidth: 48 },
            6: { cellWidth: 58, halign: 'right' },
            7: { cellWidth: 56, halign: 'right' },
            8: { cellWidth: 56, halign: 'right' },
            9: { cellWidth: 58, halign: 'right' },
          },
          didParseCell: (data) => {
            if (data.section !== 'body') return;
            const { cell, row, column } = data;
            const rowKind = body[row.index]?._rowKind;

            if (rowKind === 'primary') {
              cell.styles.fontStyle = 'bold';
              cell.styles.textColor = [13, 33, 55];
              cell.styles.fillColor = [255, 255, 255];
              cell.styles.lineWidth = 0;
            } else if (rowKind === 'secondary') {
              cell.styles.fontStyle = 'bold';
              cell.styles.textColor = [20, 20, 20];
              cell.styles.fillColor = [255, 255, 255];
              cell.styles.lineWidth = 0;
            } else if (rowKind === 'subtotal-secondary') {
              cell.styles.fillColor = [245, 245, 245];
              cell.styles.fontStyle = 'bold';
              cell.styles.lineWidth = { top: 0.15, right: 0, bottom: 0, left: 0 };
              cell.styles.lineColor = [208, 208, 208];
            } else if (rowKind === 'subtotal-primary') {
              cell.styles.fillColor = [236, 236, 236];
              cell.styles.fontStyle = 'bold';
              cell.styles.lineWidth = { top: 0.15, right: 0, bottom: 0.15, left: 0 };
              cell.styles.lineColor = [176, 176, 176];
            } else if (rowKind === 'grand-total') {
              cell.styles.fillColor = [226, 226, 226];
              cell.styles.fontStyle = 'bold';
              cell.styles.lineWidth = { top: 0.2, right: 0, bottom: 0.2, left: 0 };
              cell.styles.lineColor = [13, 33, 55];
              cell.styles.textColor = [13, 33, 55];
            } else if (rowKind === 'detail') {
              cell.styles.fontSize = column.index >= 6 ? 6.1 : 6.4;
              cell.styles.cellPadding = column.index >= 6 ? 2.1 : 2.6;
              cell.styles.lineWidth = 0;
            }
          },
          didDrawPage: (data) => {
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text('Reporte generado por GRAVY - Escala de grises', pageMarginLeft, pageHeight - 10);
            doc.text(`Página ${data.pageNumber}`, pageMarginRight, pageHeight - 10, { align: 'right' });
          },
        });

        doc.save(`libro_auxiliar_${todayStr()}.pdf`);
      } catch (err) {
        showToast(`Error al generar PDF: ${err.message}`, 'error');
      }
    });
  } catch (err) {
    results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).launchReportModal = launchReportModal;
(window as any).agingBucket = agingBucket;
(window as any).renderAgingPortfolio = renderAgingPortfolio;
(window as any).renderPortfolioBalances = renderPortfolioBalances;
(window as any).buildOpenPortfolioDocs = buildOpenPortfolioDocs;
(window as any).ensureLedgerData = ensureLedgerData;
(window as any).ensureThirdParties = ensureThirdParties;
(window as any).generateAuxiliaryRows = generateAuxiliaryRows;
(window as any).drawPdfHeader = drawPdfHeader;
(window as any).renderTrialBalance = renderTrialBalance;
(window as any).getSettingFirst = getSettingFirst;
(window as any).monthRangeToDates = monthRangeToDates;
(window as any).diffDays = diffDays;
(window as any).getReportViewHost = getReportViewHost;
(window as any).reportCard = reportCard;
(window as any).openAuxTxDetailInReport = openAuxTxDetailInReport;
(window as any).fmtSignedAmount = fmtSignedAmount;
(window as any).renderFinancialPosition = renderFinancialPosition;
(window as any).fmtPolarityAmount = fmtPolarityAmount;
(window as any).fmtSignedPlain = fmtSignedPlain;
(window as any).diffDaysSigned = diffDaysSigned;
(window as any).renderJournalBook = renderJournalBook;
(window as any).closeAuxTxDetailPanel = closeAuxTxDetailPanel;
(window as any).renderIncomeStatement = renderIncomeStatement;
(window as any).ensureAccountsSaldos = ensureAccountsSaldos;
(window as any).getByClass = getByClass;
(window as any).fmtPdfSignedNum = fmtPdfSignedNum;
(window as any).renderAuxiliaryBook = renderAuxiliaryBook;
(window as any).getPdfHeaderContext = getPdfHeaderContext;
(window as any).addDays = addDays;
(window as any).fmtPdfNum = fmtPdfNum;
(window as any).getPdfCtorOrWarn = getPdfCtorOrWarn;
(window as any).REPORT_STATE = REPORT_STATE;
(window as any).renderReportes = renderReportes;
(window as any).drawPdfFooter = drawPdfFooter;
(window as any).signatureBlock = signatureBlock;

async function renderWithholdingCertificates() {
  const view = getReportViewHost();
  if (!view) return;

  const [thirds, companyCityRaw] = await Promise.all([
    API.getTerceros({}),
    API.getSetting('company_city').catch(() => 'Bogotá'),
  ]);
  const companyCity = String(companyCityRaw || 'Bogotá').trim();

  // Ordenar terceros alfabéticamente
  thirds.sort((a, b) => a.name.localeCompare(b.name));

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Certificados de Retención</h4>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div class="form-group md:col-span-2">
          <label class="form-label">Tercero (Proveedor)</label>
          <div class="relative">
            <input type="text" id="ret-third-search" class="form-input w-full text-xs" placeholder="— Seleccione Tercero (Escribe para buscar...) —" autocomplete="off" />
            <input type="hidden" id="ret-third" value="" />
            <div id="ret-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:250px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:90"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Año Gravable</label>
          <input id="ret-year" type="number" class="form-input" value="${new Date().getFullYear() - 1}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo Retención</label>
          <select id="ret-type" class="form-input">
            <option value="todos">Todos</option>
            <option value="rente">ReteFuente</option>
            <option value="iva">ReteIVA</option>
            <option value="ica">ReteICA</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ciudad Exp.</label>
          <input id="ret-city" class="form-input" value="${esc(companyCity)}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha Exp.</label>
          <input id="ret-date" type="date" class="form-input" value="${todayStr()}">
        </div>
      </div>
      
      <div class="flex gap-3 mt-3">
        <button class="btn btn-primary" id="btn-gen-ret-cert"><i class="fas fa-filter"></i> Generar Vista Previa</button>
        <button class="btn btn-outline" id="btn-pdf-ret-cert" disabled><i class="fas fa-file-pdf"></i> Generar Certificado PDF</button>
      </div>
    </div>
    <div id="ret-cert-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-file-invoice mr-2"></i>Selecciona filtros y pulsa Generar Vista Previa.
    </div>
  `;

  initThirdSearch(
    document.getElementById('ret-third-search') as HTMLInputElement,
    document.getElementById('ret-third') as HTMLInputElement,
    document.getElementById('ret-third-results') as HTMLElement,
    thirds
  );

  let lastGeneratedData = null;

  const generate = async () => {
    const results = $('#ret-cert-results');
    if (!results) return;

    const thirdId = getSelectVal('ret-third');
    const year = getInputVal('ret-year');
    const retType = getSelectVal('ret-type');
    const city = getInputVal('ret-city') || 'Bogotá';
    const expDate = getInputVal('ret-date') || todayStr();

    if (!thirdId) return showToast('Seleccione un tercero.', 'warning');
    if (!year) return showToast('Ingrese el año gravable.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos contables...</div>';

    try {
      const safeThirdId = pb.escapeFilterValue(thirdId);
      const [lines, purchaseCfgRaw, salesCfgRaw, accounts] = await Promise.all([
        pb.listAll('tx_lines', {
          filter: `third_party_id="${safeThirdId}" && tx_id.status="active"`,
          expand: 'account_id,tx_id',
        }),
        API.getSetting('purchase_config_v1').catch(() => null),
        API.getSetting('sales_settings_v2').catch(() => null),
        API.getAccounts(true).catch(() => []),
      ]);

      const purchaseCfg = purchaseCfgRaw ? JSON.parse(purchaseCfgRaw) : null;
      const salesCfg = salesCfgRaw ? JSON.parse(salesCfgRaw) : null;

      // Map accounts by code for fast lookup
      const accountMap = new Map();
      for (const a of accounts) {
        if (a.code) {
          accountMap.set(a.code, a);
        }
      }

      const purchaseRules = purchaseCfg?.accounting?.withholding_rules || [];
      const salesRules = salesCfg?.accounting?.withholding_rules || [];

      const resolveRate = (accCode, acc, lineRateRaw) => {
        const lineRate = Number(lineRateRaw || 0);
        if (lineRate > 0) return lineRate;

        // Check purchase rules matching account_code
        const pRule = purchaseRules.find(r => r.account_code === accCode);
        if (pRule && Number(pRule.rate || 0) > 0) {
          return Number(pRule.rate);
        }

        // Check sales rules matching account_code
        const sRule = salesRules.find(r => r.account_code === accCode);
        if (sRule && Number(sRule.rate || 0) > 0) {
          return Number(sRule.rate);
        }

        // Check account default rate fields
        if (acc) {
          if (accCode.startsWith('2365') && Number(acc.ret_rate_reterenta || 0) > 0) {
            return Number(acc.ret_rate_reterenta);
          }
          if (accCode.startsWith('2367') && Number(acc.ret_rate_reteiva || 0) > 0) {
            return Number(acc.ret_rate_reteiva);
          }
          if (accCode.startsWith('2368') && Number(acc.ret_rate_reteica || 0) > 0) {
            return Number(acc.ret_rate_reteica);
          }
        }

        // Fallbacks to Colombian defaults
        if (accCode.startsWith('2365')) return 3.5;
        if (accCode.startsWith('2367')) return 15;
        if (accCode.startsWith('2368')) return 0.414;

        return 0;
      };

      const yearLines = lines.filter(l => l.expand?.tx_id?.date && l.expand.tx_id.date.startsWith(year));
      const withholdingGroups = [];

      for (const l of yearLines) {
        const accCode = l.expand?.account_id?.code || '';
        const accName = l.expand?.account_id?.name || '';

        let type = '';
        if (accCode.startsWith('2365')) type = 'rente';
        else if (accCode.startsWith('2367')) type = 'iva';
        else if (accCode.startsWith('2368')) type = 'ica';
        else continue;

        if (retType !== 'todos' && retType !== type) continue;

        const withheld = Number(l.credit || 0) - Number(l.debit || 0);
        if (withheld <= 0.01) continue;

        const acc = l.expand?.account_id || accountMap.get(accCode);
        const rate = resolveRate(accCode, acc, l.ret_rate);
        
        let base = Number(l.ret_base || 0);
        // Recalculate base if it is 0 or if it was saved incorrectly as equal to the withheld amount
        if (base <= 0.01 || (rate > 0 && Math.abs(base - withheld) < 0.05 && Math.abs(rate - 100) > 0.01)) {
          base = rate > 0 ? (withheld / (rate / 100)) : withheld;
        }

        withholdingGroups.push({
          accountCode: accCode,
          accountName: accName,
          type,
          rate,
          base,
          amount: withheld,
        });
      }

      if (withholdingGroups.length === 0) {
        results.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF">No se encontraron retenciones aplicadas a este tercero en el año seleccionado.</div>';
        lastGeneratedData = null;
        const pdfBtn = document.getElementById('btn-pdf-ret-cert');
        if (pdfBtn) (pdfBtn as HTMLButtonElement).disabled = true;
        return;
      }

      const summaryMap = new Map();
      for (const item of withholdingGroups) {
        const key = `${item.accountCode}|${item.rate}`;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            accountCode: item.accountCode,
            accountName: item.accountName,
            type: item.type,
            rate: item.rate,
            base: 0,
            amount: 0,
          });
        }
        const grp = summaryMap.get(key);
        grp.base += item.base;
        grp.amount += item.amount;
      }

      const summaryList = [...summaryMap.values()].sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      const totalBase = summaryList.reduce((s, r) => s + r.base, 0);
      const totalAmount = summaryList.reduce((s, r) => s + r.amount, 0);

      results.innerHTML = `
        <div class="p-4 border-b flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-xl mb-4">
          <p class="text-sm" style="color:#6B7280">Año Gravable: <strong>${esc(year)}</strong> · Total Base: <strong>${fmt(totalBase)}</strong> · Total Retenido: <strong>${fmt(totalAmount)}</strong></p>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Concepto / Cuenta</th>
                <th>Tarifa</th>
                <th class="text-right">Base Gravable</th>
                <th class="text-right">Valor Retenido</th>
              </tr>
            </thead>
            <tbody>
              ${summaryList.map(r => `
                <tr>
                  <td><span class="font-bold">${esc(r.accountCode)}</span> - ${esc(r.accountName)}</td>
                  <td>${r.rate > 0 ? `${r.rate}%` : '—'}</td>
                  <td class="text-right font-semibold">${fmt(r.base)}</td>
                  <td class="text-right font-semibold text-orange-600">${fmt(r.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="font-bold">
                <td colspan="2">TOTAL RETENCIONES</td>
                <td class="text-right">${fmt(totalBase)}</td>
                <td class="text-right text-orange-600">${fmt(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

      lastGeneratedData = {
        third: thirds.find(t => t.id === thirdId),
        year,
        type: retType,
        city,
        expDate,
        items: summaryList,
        totalBase,
        totalAmount,
      };

      const pdfBtn = document.getElementById('btn-pdf-ret-cert');
      if (pdfBtn) (pdfBtn as HTMLButtonElement).disabled = false;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastGeneratedData = null;
      const pdfBtn = document.getElementById('btn-pdf-ret-cert');
      if (pdfBtn) (pdfBtn as HTMLButtonElement).disabled = true;
    }
  };

  $('#btn-gen-ret-cert')?.addEventListener('click', generate);
  $('#btn-pdf-ret-cert')?.addEventListener('click', async () => {
    if (!lastGeneratedData) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });

      const left = 36;
      const right = doc.internal.pageSize.getWidth() - 36;
      const width = right - left;

      // 1. Cabecera
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(13, 33, 55);
      doc.text(headerCtx.companyName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`NIT: ${headerCtx.companyNit}`, doc.internal.pageSize.getWidth() / 2, 65, { align: 'center' });
      doc.text(headerCtx.companyAddress, doc.internal.pageSize.getWidth() / 2, 78, { align: 'center' });

      doc.setFontSize(12);
      doc.text('CERTIFICADO DE RETENCION EN LA FUENTE', doc.internal.pageSize.getWidth() / 2, 110, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`AÑO GRAVABLE: ${lastGeneratedData.year}`, doc.internal.pageSize.getWidth() / 2, 125, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(left, 140, right, 140);

      // 2. Información del retenido
      const t = lastGeneratedData.third;
      doc.setFont('helvetica', 'bold');
      doc.text('RETENIDO A:', left, 160);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre / Razón Social: ${t.name}`, left, 175);
      doc.text(`NIT / Cédula: ${t.doc_number}`, left, 188);
      doc.text(`Dirección: ${t.address || 'No registrada'}`, left, 201);
      doc.text(`Ciudad: ${t.city || 'No registrada'}`, left, 214);

      // 3. Tabla
      const body = lastGeneratedData.items.map(r => [
        `${r.accountCode} - ${r.accountName}`,
        r.rate > 0 ? `${r.rate}%` : '—',
        fmtPdfNum(r.base),
        fmtPdfNum(r.amount),
      ]);
      body.push(['TOTALES', '', fmtPdfNum(lastGeneratedData.totalBase), fmtPdfNum(lastGeneratedData.totalAmount)]);

      doc.autoTable({
        startY: 235,
        head: [['Concepto de Retención', 'Tarifa', 'Base Gravable', 'Valor Retenido']],
        body,
        theme: 'plain',
        margin: { top: 235, left, right: 36, bottom: 50 },
        styles: { font: 'helvetica', fontSize: 8.5, textColor: [55, 55, 55], cellPadding: 4, lineWidth: 0.1, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [240, 240, 240], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 8.5 },
        columnStyles: {
          0: { cellWidth: 260 },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 110, halign: 'right' },
          3: { cellWidth: 110, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const isTotal = data.row.index === body.length - 1;
          if (isTotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.textColor = [13, 33, 55];
          }
        },
      });

      const finalY = doc.previousAutoTable.finalY + 30;

      // 4. Firmas y pie de página
      doc.setFontSize(8.5);
      doc.text(`Ciudad de Expedición: ${lastGeneratedData.city}`, left, finalY);
      doc.text(`Fecha de Expedición: ${lastGeneratedData.expDate}`, left, finalY + 12);
      doc.text('Este documento no requiere firma autógrafa para su validez (Art. 10 D.R. 836/91).', left, finalY + 35, { maxWidth: width });

      doc.line(left, finalY + 100, left + 180, finalY + 100);
      doc.text('Firma Agente Retenedor / Certificador', left, finalY + 112);

      doc.save(`certificado_retencion_${t.doc_number}_${lastGeneratedData.year}.pdf`);
      showToast('Certificado generado en PDF.', 'success');
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

async function renderPazYSalvoCertificate() {
  const view = getReportViewHost();
  if (!view) return;

  const [thirds, companyCityRaw] = await Promise.all([
    API.getTerceros({}),
    API.getSetting('company_city').catch(() => 'Bogotá'),
  ]);
  const companyCity = String(companyCityRaw || 'Bogotá').trim();

  thirds.sort((a, b) => a.name.localeCompare(b.name));

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Certificado de Paz y Salvo de Cartera</h4>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="form-group md:col-span-2">
          <label class="form-label">Tercero (Cliente / Copropietario)</label>
          <div class="relative">
            <input type="text" id="paz-third-search" class="form-input w-full text-xs" placeholder="— Seleccione Tercero (Escribe para buscar...) —" autocomplete="off" />
            <input type="hidden" id="paz-third" value="" />
            <div id="paz-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:250px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:90"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Corte</label>
          <input id="paz-cutoff" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Ciudad Exp.</label>
          <input id="paz-city" class="form-input" value="${esc(companyCity)}">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Observaciones / Concepto (para incluir en el documento)</label>
        <input id="paz-concept" class="form-input" placeholder="Ej: Para trámites notariales, venta de inmueble, etc.">
      </div>
      
      <div class="flex gap-3">
        <button class="btn btn-primary" id="btn-gen-paz-salvo"><i class="fas fa-check-double"></i> Verificar Cartera y Generar</button>
        <button class="btn btn-outline" id="btn-pdf-paz-salvo" disabled><i class="fas fa-file-pdf"></i> Descargar Paz y Salvo PDF</button>
      </div>
    </div>
    <div id="paz-salvo-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-check mr-2"></i>Selecciona filtros y pulsa Verificar Cartera y Generar.
    </div>
  `;

  initThirdSearch(
    document.getElementById('paz-third-search') as HTMLInputElement,
    document.getElementById('paz-third') as HTMLInputElement,
    document.getElementById('paz-third-results') as HTMLElement,
    thirds
  );

  let lastGeneratedData = null;

  const generate = async () => {
    const results = $('#paz-salvo-results');
    if (!results) return;

    const thirdId = getSelectVal('paz-third');
    const cutoffDate = getInputVal('paz-cutoff');
    const city = getInputVal('paz-city') || 'Bogotá';
    const concept = getInputVal('paz-concept') || 'Trámites administrativos';

    if (!thirdId) return showToast('Seleccione un tercero.', 'warning');
    if (!cutoffDate) return showToast('Ingrese la fecha de corte.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Verificando saldos en cartera...</div>';

    try {
      const docs = await buildOpenPortfolioDocs({ mode: 'cxc', asOfDate: cutoffDate, thirdType: '' });
      const clientDocs = docs.filter(d => d.third_id === thirdId);
      const totalOpen = clientDocs.reduce((s, r) => s + Number(r.open || 0), 0);
      const selectedThird = thirds.find(t => t.id === thirdId);

      if (totalOpen > 0.01) {
        results.innerHTML = `
          <div class="p-6 border rounded-2xl text-center max-w-xl mx-auto" style="border-color:#FCA5A5;background:#FEF2F2;color:#DC2626">
            <i class="fas fa-triangle-exclamation text-3xl mb-3"></i>
            <h4 class="font-bold text-base mb-2">No se puede generar el Paz y Salvo</h4>
            <p class="text-sm mb-4" style="color:#374151">El tercero <strong>${esc(selectedThird.name)}</strong> presenta saldos vencidos en cartera a la fecha de corte.</p>
            <div class="text-left bg-white p-4 rounded-xl border mb-3 overflow-x-auto" style="border-color:#F87171;color:#374151">
              <p class="font-bold text-xs uppercase mb-2" style="color:#991B1B">Detalle de Cartera Pendiente:</p>
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b" style="border-color:#E5E7EB"><th class="text-left pb-1">Doc. Ref</th><th class="text-left pb-1">Fecha</th><th class="text-right pb-1">Días Venc.</th><th class="text-right pb-1">Saldo Abierto</th></tr>
                </thead>
                <tbody>
                  ${clientDocs.map(d => `
                    <tr class="border-b" style="border-color:#F3F4F6">
                      <td class="py-1 font-mono">${esc(d.doc_ref)}</td>
                      <td class="py-1">${esc(d.doc_date)}</td>
                      <td class="py-1 text-right">${fmtN(d.expired_days)}</td>
                      <td class="py-1 text-right font-semibold">${fmt(d.open)}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr class="font-bold"><td colspan="3" class="pt-2 text-left">TOTAL DEUDA:</td><td class="pt-2 text-right" style="color:#DC2626">${fmt(totalOpen)}</td></tr>
                </tfoot>
              </table>
            </div>
            <p class="text-xs" style="color:#9CA3AF">El tercero debe registrar el pago de todos sus saldos pendientes para poder expedir un paz y salvo.</p>
          </div>
        `;
        lastGeneratedData = null;
        const pdfBtn = document.getElementById('btn-pdf-paz-salvo');
        if (pdfBtn) (pdfBtn as HTMLButtonElement).disabled = true;
        return;
      }

      const issueDate = new Date();
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const dateText = `${issueDate.getDate()} de ${months[issueDate.getMonth()]} de ${issueDate.getFullYear()}`;

      results.innerHTML = `
        <div class="p-8 border rounded-2xl max-w-2xl mx-auto bg-white shadow-sm" style="border-color:#E5E7EB;color:#374151;font-family:serif;line-height:1.8">
          <div class="text-center mb-8 font-sans">
            <h3 class="font-bold text-lg" style="color:#0D2137">PAZ Y SALVO VERIFICADO</h3>
            <span class="badge badge-green mt-2 px-3 py-1 font-semibold"><i class="fas fa-check-circle mr-1"></i>Apto para Expedición</span>
          </div>
          
          <p class="text-right mb-6 text-sm font-sans" style="color:#6B7280">${esc(city)}, ${dateText}</p>
          
          <div class="text-center font-bold text-base mb-8">
            CERTIFICADO DE PAZ Y SALVO
          </div>
          
          <p class="mb-4 text-justify">
            La administración y representación legal de la organización/copropiedad, hace constar que el Sr(a). 
            <strong>${esc(selectedThird.name)}</strong>, identificado(a) con Nit / Cédula No. 
            <strong>${esc(selectedThird.doc_number)}</strong>, a la fecha de corte de <strong>${esc(cutoffDate)}</strong>, se encuentra a 
            <strong>PAZ Y SALVO</strong> por todo concepto de obligaciones financieras y cartera con nuestra entidad.
          </p>
          
          <p class="mb-6 text-justify">
            Se expide el presente certificado con destino a: <strong>${esc(concept)}</strong>.
          </p>
          
          <div class="mt-12 pt-8 border-t flex justify-around font-sans text-xs" style="border-color:#E5E7EB">
            <div class="text-center">
              <div class="w-36 h-px bg-gray-400 mx-auto mb-2"></div>
              <p class="font-bold">ADMINISTRACIÓN</p>
              <p style="color:#6B7280">Representante Legal</p>
            </div>
            <div class="text-center">
              <div class="w-36 h-px bg-gray-400 mx-auto mb-2"></div>
              <p class="font-bold">DEPARTAMENTO CONTABLE</p>
              <p style="color:#6B7280">Contador Público</p>
            </div>
          </div>
        </div>
      `;

      lastGeneratedData = {
        third: selectedThird,
        cutoffDate,
        city,
        concept,
        dateText,
      };

      const pdfBtn = document.getElementById('btn-pdf-paz-salvo');
      if (pdfBtn) (pdfBtn as HTMLButtonElement).disabled = false;
    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastGeneratedData = null;
      const pdfBtn = document.getElementById('btn-pdf-paz-salvo');
      if (pdfBtn) (pdfBtn as HTMLButtonElement).disabled = true;
    }
  };

  $('#btn-gen-paz-salvo')?.addEventListener('click', generate);

  $('#btn-pdf-paz-salvo')?.addEventListener('click', async () => {
    if (!lastGeneratedData) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });

      const left = 54;
      const right = doc.internal.pageSize.getWidth() - 54;
      const width = right - left;

      // Header de la empresa
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(13, 33, 55);
      doc.text(headerCtx.companyName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 70, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`NIT: ${headerCtx.companyNit}`, doc.internal.pageSize.getWidth() / 2, 85, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(headerCtx.companyAddress, doc.internal.pageSize.getWidth() / 2, 98, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.line(left, 115, right, 115);

      // Fecha
      doc.setTextColor(55, 55, 55);
      doc.setFontSize(10);
      doc.text(`${lastGeneratedData.city}, ${lastGeneratedData.dateText}`, right, 140, { align: 'right' });

      // Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(13, 33, 55);
      doc.text('CERTIFICADO DE PAZ Y SALVO', doc.internal.pageSize.getWidth() / 2, 190, { align: 'center' });

      // Cuerpo
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(55, 55, 55);

      const bodyText1 = `La administración y representación legal de la entidad, de conformidad con los registros contables vigentes en el sistema, certifica que el Sr(a). ${lastGeneratedData.third.name}, identificado(a) con Nit / Cédula No. ${lastGeneratedData.third.doc_number}, a la fecha de corte de ${lastGeneratedData.cutoffDate}, se encuentra a PAZ Y SALVO por todo concepto de obligaciones financieras y cartera.`;

      const splitText1 = doc.splitTextToSize(bodyText1, width);
      doc.text(splitText1, left, 230);

      const bodyText2 = `El presente certificado se expide a solicitud del interesado con destino a: ${lastGeneratedData.concept}.`;
      const splitText2 = doc.splitTextToSize(bodyText2, width);
      doc.text(splitText2, left, 310);

      const bodyText3 = `Para constancia de lo anterior, se firma el presente documento en la ciudad de ${lastGeneratedData.city}.`;
      doc.text(bodyText3, left, 350);

      // Firmas
      const sigY = 480;
      doc.line(left, sigY, left + 160, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('ADMINISTRACIÓN', left, sigY + 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Representante Legal / Gerente', left, sigY + 27);

      doc.line(right - 160, sigY, right, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('DEPARTAMENTO CONTABLE', right, sigY + 15, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Contador Público', right, sigY + 27, { align: 'right' });

      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(`Documento emitido electrónicamente por ${headerCtx.softwareName}`, left, doc.internal.pageSize.getHeight() - 30);

      doc.save(`certificado_paz_y_salvo_${lastGeneratedData.third.doc_number}.pdf`);
      showToast('Paz y salvo descargado.', 'success');
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

(window as any).renderWithholdingCertificates = renderWithholdingCertificates;
(window as any).renderPazYSalvoCertificate = renderPazYSalvoCertificate;

async function renderClientPaymentsHistory() {
  const view = getReportViewHost();
  if (!view) return;

  const thirds = await API.getTerceros({});
  thirds.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const now = new Date();
  const startDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const endDefault = todayStr();

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Historial de Pagos de Cartera por Cliente</h4>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div class="form-group md:col-span-2">
          <label class="form-label">Cliente</label>
          <div class="relative">
            <input type="text" id="hist-third-search" class="form-input w-full text-xs" placeholder="— Seleccione Cliente (Escribe para buscar...) —" autocomplete="off" />
            <input type="hidden" id="hist-third" value="" />
            <div id="hist-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:250px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:90"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input id="hist-start" type="date" class="form-input" value="${startDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input id="hist-end" type="date" class="form-input" value="${endDefault}">
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 justify-between items-center mt-4 pt-3 border-t" style="border-color:#F3F4F6">
        <div class="flex gap-1.5">
          <button class="btn btn-xs btn-outline" id="btn-preset-30">Últimos 30 días</button>
          <button class="btn btn-xs btn-outline" id="btn-preset-month">Este Mes</button>
          <button class="btn btn-xs btn-outline" id="btn-preset-year">Este Año</button>
          <button class="btn btn-xs btn-outline" id="btn-preset-prev">Año Anterior</button>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary" id="btn-gen-hist"><i class="fas fa-filter"></i> Generar</button>
          <button class="btn btn-outline" id="btn-pdf-hist" disabled><i class="fas fa-file-pdf"></i> PDF</button>
          <button class="btn btn-outline" id="btn-exp-hist" disabled><i class="fas fa-file-excel"></i> Exportar</button>
        </div>
      </div>
    </div>
    <div id="hist-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-magnifying-glass mr-2"></i>Busca un cliente, elige el rango de fechas y presiona Generar.
    </div>
  `;

  initThirdSearch(
    document.getElementById('hist-third-search') as HTMLInputElement,
    document.getElementById('hist-third') as HTMLInputElement,
    document.getElementById('hist-third-results') as HTMLElement,
    thirds
  );

  let lastGeneratedPayments = [];
  let selectedThird = null;
  let dateFrom = '';
  let dateTo = '';

  const setDatesAndGenerate = (start: string, end: string) => {
    const sEl = document.getElementById('hist-start') as HTMLInputElement;
    const eEl = document.getElementById('hist-end') as HTMLInputElement;
    if (sEl) sEl.value = start;
    if (eEl) eEl.value = end;
    generate();
  };

  $('#btn-preset-30')?.addEventListener('click', () => {
    const tEnd = todayStr();
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const tStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDatesAndGenerate(tStart, tEnd);
  });

  $('#btn-preset-month')?.addEventListener('click', () => {
    const tEnd = todayStr();
    const d = new Date();
    const tStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    setDatesAndGenerate(tStart, tEnd);
  });

  $('#btn-preset-year')?.addEventListener('click', () => {
    const tEnd = todayStr();
    const d = new Date();
    const tStart = `${d.getFullYear()}-01-01`;
    setDatesAndGenerate(tStart, tEnd);
  });

  $('#btn-preset-prev')?.addEventListener('click', () => {
    const prevYear = new Date().getFullYear() - 1;
    setDatesAndGenerate(`${prevYear}-01-01`, `${prevYear}-12-31`);
  });

  const generate = async () => {
    const results = $('#hist-results');
    if (!results) return;

    const thirdId = getInputVal('hist-third');
    const start = getInputVal('hist-start');
    const end = getInputVal('hist-end');

    if (!thirdId) return showToast('Selecciona un cliente.', 'warning');
    if (!start || !end) return showToast('Selecciona el rango de fechas.', 'warning');

    results.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando historial de pagos...</div>';

    try {
      const [{ accounts }, thirdParties] = await Promise.all([
        ensureAccountsSaldos(),
        ensureThirdParties(),
      ]);

      selectedThird = thirdParties.find((t: any) => t.id === thirdId);
      dateFrom = start;
      dateTo = end;

      // Cuentas de Cartera / Cuentas por Cobrar (Clase 13)
      const cxcAccIds = accounts
        .filter((a: any) => String(a.code || '').startsWith('13'))
        .map((a: any) => a.id)
        .join(',');

      // Endpoint de consulta indexada ultrarrápido (del lado del servidor)
      const res: any = await pb.send(
        `/api/gravy/report-auxiliary?fromDate=${start}&toDate=${end}&thirdId=${thirdId}&accountIds=${cxcAccIds}`,
        { method: 'GET' }
      );

      const periodLines = res?.periodLines || [];

      // Filtrar líneas de abono o crédito recibidas en la cuenta de cartera
      const payments = periodLines
        .filter((l: any) => Number(l.credito || 0) > 0.0001)
        .map((l: any) => ({
          id: l.txId || l.id,
          date: l.fecha || '',
          number: l.comprobante || 'S/N',
          tx_type_name: l.accountName || 'Recibo de Caja',
          tx_type_prefix: l.comprobante ? l.comprobante.split('-')[0] : 'RC',
          account_code: l.accountCode || '',
          account_name: l.accountName || '',
          cross_doc_ref: l.doc_cruce || '',
          description: l.descripcion || 'Abono de cartera',
          amount: Number(l.credito || 0)
        }))
        .sort((a: any, b: any) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number));

      lastGeneratedPayments = payments;

      if (!payments.length) {
        results.innerHTML = '<div class="p-8 text-center text-gray-500"><i class="fas fa-circle-exclamation mr-2"></i>No se encontraron pagos registrados para este cliente en el periodo seleccionado.</div>';
        ($('#btn-pdf-hist') as HTMLButtonElement).disabled = true;
        ($('#btn-exp-hist') as HTMLButtonElement).disabled = true;
        return;
      }

      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const count = payments.length;
      const avg = totalPaid / count;
      const lastPayment = payments[payments.length - 1];

      // KPI Cards
      const kpisHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-left">
          <div class="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm" style="border-color:#E5E7EB">
            <div>
              <p class="text-xs font-semibold" style="color:#6B7280">Total Recaudado</p>
              <h4 class="text-lg font-bold mt-1" style="color:#059669">${fmt(totalPaid)}</h4>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
              <i class="fas fa-hand-holding-dollar"></i>
            </div>
          </div>
          <div class="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm" style="border-color:#E5E7EB">
            <div>
              <p class="text-xs font-semibold" style="color:#6B7280">Nº Abonos / Pagos</p>
              <h4 class="text-lg font-bold mt-1" style="color:#1A4B8C">${fmtN(count)}</h4>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
              <i class="fas fa-receipt"></i>
            </div>
          </div>
          <div class="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm" style="border-color:#E5E7EB">
            <div>
              <p class="text-xs font-semibold" style="color:#6B7280">Pago Promedio</p>
              <h4 class="text-lg font-bold mt-1" style="color:#4F46E5">${fmt(avg)}</h4>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600">
              <i class="fas fa-calculator"></i>
            </div>
          </div>
          <div class="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm" style="border-color:#E5E7EB">
            <div>
              <p class="text-xs font-semibold" style="color:#6B7280">Último Pago</p>
              <h4 class="text-sm font-bold mt-1" style="color:#D97706">${fmt(lastPayment.amount)}</h4>
              <p class="text-[10px] text-gray-400 font-semibold">${lastPayment.date}</p>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
              <i class="fas fa-calendar-check"></i>
            </div>
          </div>
        </div>
      `;

      // Monthly Trend SVG Chart
      const monthlyMap = new Map();
      for (const p of payments) {
        const mKey = p.date.substring(0, 7);
        monthlyMap.set(mKey, (monthlyMap.get(mKey) || 0) + p.amount);
      }
      const sortedMonths = [...monthlyMap.keys()].sort();
      const monthlyData = sortedMonths.map(m => ({ month: m, amount: monthlyMap.get(m) }));

      let chartHtml = '';
      if (monthlyData.length > 0) {
        const svgW = 600;
        const svgH = 160;
        const padL = 60;
        const padR = 20;
        const padT = 15;
        const padB = 30;
        const chartW = svgW - padL - padR;
        const chartH = svgH - padT - padB;

        const maxVal = Math.max(...monthlyData.map(d => d.amount), 1000);
        let gridHtml = '';
        for (let i = 0; i <= 3; i++) {
          const yPos = padT + (chartH * i / 3);
          const val = maxVal * (3 - i) / 3;
          gridHtml += `
            <line x1="${padL}" y1="${yPos}" x2="${svgW - padR}" y2="${yPos}" stroke="#F3F4F6" stroke-width="1" stroke-dasharray="3,3" />
            <text x="${padL - 8}" y="${yPos + 3}" fill="#9CA3AF" font-size="8" text-anchor="end">${fmt(val)}</text>
          `;
        }

        const barSpacing = chartW / Math.max(monthlyData.length, 1);
        const barW = Math.min(barSpacing * 0.45, 30);

        let barsHtml = '';
        monthlyData.forEach((d, idx) => {
          const xCenter = padL + (idx * barSpacing) + (barSpacing / 2);
          const h = (d.amount / maxVal) * chartH;
          const y = padT + chartH - h;
          const x = xCenter - barW / 2;

          const monthParts = d.month.split('-');
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          const label = `${monthNames[parseInt(monthParts[1], 10) - 1]} ${monthParts[0].substring(2)}`;

          barsHtml += `
            <g class="group cursor-pointer">
              <rect x="${x}" y="${y}" width="${barW}" height="${Math.max(h, 3)}" fill="url(#histPaymentGrad)" rx="3" class="transition-all hover:opacity-80" />
              <text x="${xCenter}" y="${svgH - padB + 14}" fill="#4B5563" font-size="8" font-weight="600" text-anchor="middle">${label}</text>
              <title>${label}: ${fmt(d.amount)}</title>
            </g>
          `;
        });

        chartHtml = `
          <div class="bg-white p-4 rounded-2xl border mb-6" style="border-color:#E5E7EB">
            <h5 class="text-xs font-bold mb-3 text-left" style="color:#0D2137"><i class="fas fa-chart-bar mr-1 text-emerald-600"></i>Tendencia de Recaudo Mensual</h5>
            <div style="height: 160px; max-width: 600px; margin: 0 auto;">
              <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%">
                <defs>
                  <linearGradient id="histPaymentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#10B981" />
                    <stop offset="100%" stop-color="#059669" />
                  </linearGradient>
                </defs>
                ${gridHtml}
                ${barsHtml}
                <line x1="${padL}" y1="${padT + chartH}" x2="${svgW - padR}" y2="${padT + chartH}" stroke="#D1D5DB" stroke-width="1" />
              </svg>
            </div>
          </div>
        `;
      }

      const tableRowsHtml = payments.map(p => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="whitespace-nowrap text-left">${esc(p.date)}</td>
          <td class="font-semibold whitespace-nowrap text-left"><span class="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-700 mr-1.5 font-bold">${esc(p.tx_type_prefix)}</span>${esc(p.number)}</td>
          <td class="text-gray-600 text-xs text-left">${esc(p.account_code)} - ${esc(p.account_name)}</td>
          <td class="text-gray-500 font-mono text-xs whitespace-nowrap text-left">${esc(p.cross_doc_ref || 'Sin cruce')}</td>
          <td class="text-left"><div class="max-w-[240px] truncate text-xs" title="${esc(p.description)}">${esc(p.description)}</div></td>
          <td class="text-right font-semibold text-emerald-700">${fmt(p.amount)}</td>
        </tr>
      `).join('');

      const tableHtml = `
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="overflow-x-auto" style="max-height: 400px">
            <table class="data-table w-full">
              <thead class="sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th class="text-left">Fecha</th>
                  <th class="text-left">Comprobante</th>
                  <th class="text-left">Cuenta de Cartera</th>
                  <th class="text-left">Doc Referencia</th>
                  <th class="text-left">Detalle / Concepto</th>
                  <th class="text-right">Valor Pagado</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
              <tfoot>
                <tr class="bg-slate-50 font-bold">
                  <td colspan="5" class="text-left">Total recaudado en el periodo</td>
                  <td class="text-right text-emerald-800">${fmt(totalPaid)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;

      results.innerHTML = `
        ${kpisHtml}
        ${chartHtml}
        ${tableHtml}
      `;

      ($('#btn-pdf-hist') as HTMLButtonElement).disabled = false;
      ($('#btn-exp-hist') as HTMLButtonElement).disabled = false;

    } catch (err) {
      results.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      lastGeneratedPayments = [];
      selectedThird = null;
      ($('#btn-pdf-hist') as HTMLButtonElement).disabled = true;
      ($('#btn-exp-hist') as HTMLButtonElement).disabled = true;
    }
  };

  $('#btn-gen-hist')?.addEventListener('click', generate);

  $('#btn-exp-hist')?.addEventListener('click', () => {
    if (!lastGeneratedPayments.length || !selectedThird) return;
    const rows = lastGeneratedPayments.map(p => ({
      fecha: p.date,
      comprobante: `${p.tx_type_prefix}-${p.number}`,
      tipo_comprobante: p.tx_type_name,
      cuenta_codigo: p.account_code,
      cuenta_nombre: p.account_name,
      documento_referencia: p.cross_doc_ref,
      concepto: p.description,
      valor_pagado: p.amount
    }));
    exportToExcel(rows, [
      { key: 'fecha', label: 'Fecha' },
      { key: 'comprobante', label: 'Comprobante' },
      { key: 'tipo_comprobante', label: 'Tipo' },
      { key: 'cuenta_codigo', label: 'Código Cuenta' },
      { key: 'cuenta_nombre', label: 'Nombre Cuenta' },
      { key: 'documento_referencia', label: 'Doc Referencia' },
      { key: 'concepto', label: 'Concepto' },
      { key: 'valor_pagado', label: 'Valor Pagado' }
    ], `Historial_Pagos_${selectedThird.doc_number || 'Cliente'}_${dateFrom}_a_${dateTo}`);
  });

  $('#btn-pdf-hist')?.addEventListener('click', async () => {
    if (!lastGeneratedPayments.length || !selectedThird) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;

      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'HISTORIAL DE PAGOS DE CARTERA',
        subtitles: [
          `Cliente: ${selectedThird.doc_number || ''} - ${selectedThird.name}`,
          `Periodo: ${dateFrom} a ${dateTo}`
        ],
      });

      const totalPaid = lastGeneratedPayments.reduce((s, p) => s + p.amount, 0);
      const body = lastGeneratedPayments.map(p => [
        p.date,
        `${p.tx_type_prefix}-${p.number}`,
        p.cross_doc_ref || 'Sin cruce',
        `${p.account_code} - ${p.account_name}`,
        p.description,
        fmtPdfNum(p.amount)
      ]);

      body.push(['TOTAL RECAUDADO', '', '', '', '', fmtPdfNum(totalPaid)]);

      doc.autoTable({
        startY: header.startY,
        head: [['Fecha', 'Comprobante', 'Doc Ref', 'Cuenta', 'Detalle/Concepto', 'Valor Pagado']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 7, textColor: [55, 55, 55], cellPadding: 2.5, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.2, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 70 },
          2: { cellWidth: 60 },
          3: { cellWidth: 120 },
          4: { cellWidth: 160 },
          5: { cellWidth: 80, halign: 'right' },
        },
        didParseCell: (data: any) => {
          if (data.section !== 'body') return;
          const isTotal = data.row.index === body.length - 1;
          if (isTotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.2 };
            data.cell.styles.lineColor = [13, 33, 55];
          }
        },
        didDrawPage: (data: any) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`historial_pagos_${selectedThird.doc_number || 'Cliente'}_${dateFrom}_a_${dateTo}.pdf`);
      showToast('Historial de pagos PDF descargado.', 'success');
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
}

(window as any).renderClientPaymentsHistory = renderClientPaymentsHistory;

function matchesPrefix(code: string, prefixes: string[]) {
  if (!code) return false;
  return prefixes.some(p => code.startsWith(p));
}

const esc = (window as any).esc || ((str: any) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'));

function initMultiAccountSelector(config: {
  containerId: string;
  inputId: string;
  hiddenId: string;
  resultsId: string;
  accounts: any[];
  themeColor: 'rose' | 'emerald';
}) {
  const container = document.getElementById(config.containerId);
  const input = document.getElementById(config.inputId) as HTMLInputElement | null;
  const hidden = document.getElementById(config.hiddenId) as HTMLInputElement | null;
  const results = document.getElementById(config.resultsId);

  if (!container || !input || !hidden || !results) return;

  let selectedCodes = hidden.value.split(',').map(s => s.trim()).filter(Boolean);

  const getAccountByCode = (code: string) => {
    return config.accounts.find(a => String(a.code) === code);
  };

  const syncValue = () => {
    hidden.value = selectedCodes.join(', ');
  };

  const renderChips = () => {
    const chips = container.querySelectorAll('.iva-chip');
    chips.forEach(c => c.remove());

    selectedCodes.forEach(code => {
      const acc = getAccountByCode(code);
      const label = acc ? `${acc.code} - ${acc.name}` : `${code} (Prefijo)`;

      const chip = document.createElement('span');
      chip.className = `iva-chip flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold text-xs transition duration-150 border `;
      if (config.themeColor === 'rose') {
        chip.className += 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/50';
      } else {
        chip.className += 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/50';
      }

      chip.innerHTML = `
        <span>${esc(label)}</span>
        <button type="button" class="text-[14px] hover:text-red-600 transition ml-0.5" style="border:none; background:none; padding:0; cursor:pointer; color:inherit; line-height:1;">&times;</button>
      `;

      chip.querySelector('button')?.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCodes = selectedCodes.filter(c => c !== code);
        syncValue();
        renderChips();
      });

      container.insertBefore(chip, input);
    });
  };

  const addCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    if (!selectedCodes.includes(cleanCode)) {
      selectedCodes.push(cleanCode);
      syncValue();
      renderChips();
    }
    input.value = '';
    results.style.display = 'none';
  };

  const paintDropdown = (query = '') => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = config.accounts.filter(a => {
      const hay = `${a.code || ''} ${a.name || ''}`.toLowerCase();
      return terms.every(term => hay.includes(term));
    }).slice(0, 15);

    let html = '';
    const cleanQuery = query.trim();
    if (cleanQuery && !selectedCodes.includes(cleanQuery)) {
      html += `
        <button type="button" data-custom-code="${esc(cleanQuery)}" class="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 flex items-center gap-1.5 font-medium transition cursor-pointer border-none border-b border-gray-100">
          <i class="fas fa-plus-circle text-indigo-500"></i>
          <span>Agregar "${esc(cleanQuery)}" como prefijo personalizado</span>
        </button>
      `;
    }

    if (found.length) {
      html += found.map(a => `
        <button type="button" data-account-code="${esc(a.code)}" class="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col transition cursor-pointer border-none bg-white text-gray-800 border-b border-gray-100">
          <div style="font-weight:600; color:#0F172A;">${esc(a.code || '')}</div>
          <div style="font-size:11px; color:#64748B;">${esc(a.name || '')}</div>
        </button>
      `).join('');
    } else if (!cleanQuery) {
      html += '<div class="px-3 py-3 text-xs text-gray-400 text-center">Escribe para buscar cuentas...</div>';
    } else if (!html) {
      html += '<div class="px-3 py-3 text-xs text-gray-400 text-center">Sin resultados coincidentes</div>';
    }

    results.innerHTML = html;
  };

  let activeIndex = -1;

  const getVisibleItems = () => {
    return Array.from(results.querySelectorAll('button[data-account-code], button[data-custom-code]')) as HTMLButtonElement[];
  };

  const updateHighlight = () => {
    const items = getVisibleItems();
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.style.backgroundColor = '#F1F5F9';
        item.focus();
      } else {
        item.style.backgroundColor = item.hasAttribute('data-custom-code') ? '#EEF2FF' : '#FFFFFF';
      }
    });
  };

  input.addEventListener('focus', () => {
    paintDropdown(input.value);
    results.style.display = 'block';
    activeIndex = -1;
  });

  input.addEventListener('input', () => {
    paintDropdown(input.value);
    results.style.display = 'block';
    activeIndex = -1;
  });

  const clickOutsideHandler = (ev: MouseEvent) => {
    if (!container.parentElement?.contains(ev.target as Node)) {
      results.style.display = 'none';
    }
  };
  document.addEventListener('click', clickOutsideHandler);

  container.addEventListener('click', (e) => {
    if (e.target === container || (e.target as HTMLElement).classList.contains('iva-chip') === false) {
      input.focus();
    }
  });

  results.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest('button');
    if (!btn) return;
    const code = btn.getAttribute('data-account-code') || btn.getAttribute('data-custom-code');
    if (code) {
      addCode(code);
    }
  });

  results.addEventListener('mousedown', (ev) => {
    ev.preventDefault();
  });

  input.addEventListener('keydown', (ev: KeyboardEvent) => {
    const items = getVisibleItems();
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (results.style.display === 'none') {
        results.style.display = 'block';
        paintDropdown(input.value);
        return;
      }
      activeIndex = (activeIndex + 1) % items.length;
      updateHighlight();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      activeIndex = activeIndex - 1 < 0 ? items.length - 1 : activeIndex - 1;
      updateHighlight();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (results.style.display !== 'none' && activeIndex >= 0 && activeIndex < items.length) {
        const selectedBtn = items[activeIndex];
        const code = selectedBtn.getAttribute('data-account-code') || selectedBtn.getAttribute('data-custom-code');
        if (code) addCode(code);
      } else {
        const code = input.value.trim();
        if (code) addCode(code);
      }
    } else if (ev.key === 'Escape') {
      results.style.display = 'none';
      input.blur();
    } else if (ev.key === 'Backspace' && !input.value && selectedCodes.length > 0) {
      selectedCodes.pop();
      syncValue();
      renderChips();
    }
  });

  renderChips();
}

async function renderIvaReport() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Reporte de IVA...</div>';

  try {
    const [{ accounts }, genAccountsStr, descAccountsStr] = await Promise.all([
      ensureAccountsSaldos(),
      API.getSetting('report_iva_generado').catch(() => '233501'),
      API.getSetting('report_iva_descontable').catch(() => '233502'),
    ]);

    const defaultGenStr = genAccountsStr || '233501';
    const defaultDescStr = descAccountsStr || '233502';
    const today = todayStr();
    const firstDayOfMonth = today.substring(0, 8) + '01';

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-file-invoice-dollar mr-2 text-green-600"></i>Reporte de IVA (Impuesto a las Ventas)</h4>
        
        <!-- Configuración de cuentas (Colapsable para no saturar) -->
        <details class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
          <summary class="p-3 font-bold text-xs text-gray-700 cursor-pointer flex items-center justify-between select-none hover:bg-gray-100">
            <span class="flex items-center gap-1.5"><i class="fas fa-gears text-gray-500"></i>Configuración de Cuentas Contables</span>
            <span class="text-[10px] text-gray-400 font-normal">Clic para expandir y configurar cuentas</span>
          </summary>
          <div class="p-4 border-t border-gray-200 text-xs space-y-4 bg-white">
            <span class="text-[10px] text-gray-400 block mb-1">Separa los códigos por comas</span>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Selector IVA Generado -->
              <div class="form-group relative">
                <label class="block font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <i class="fas fa-arrow-up text-rose-500"></i> Cuentas IVA Generado (Ventas/Pasivo)
                </label>
                <div id="iva-acc-gen-chips-container" class="flex flex-wrap items-center gap-1.5 p-2 min-h-[38px] bg-white border border-gray-200 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
                  <input id="iva-acc-gen-search" type="text" class="flex-grow outline-none border-none p-0 text-xs text-gray-800 bg-transparent focus:ring-0" placeholder="Buscar o ingresar cuenta..." style="border: none; background: transparent; box-shadow: none;">
                </div>
                <input type="hidden" id="iva-acc-gen" value="${esc(defaultGenStr)}">
                <div id="iva-acc-gen-results" class="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-lg text-xs" style="display: none; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"></div>
              </div>

              <!-- Selector IVA Descontable -->
              <div class="form-group relative">
                <label class="block font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <i class="fas fa-arrow-down text-emerald-500"></i> Cuentas IVA Descontable (Compras/Activo)
                </label>
                <div id="iva-acc-desc-chips-container" class="flex flex-wrap items-center gap-1.5 p-2 min-h-[38px] bg-white border border-gray-200 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
                  <input id="iva-acc-desc-search" type="text" class="flex-grow outline-none border-none p-0 text-xs text-gray-800 bg-transparent focus:ring-0" placeholder="Buscar o ingresar cuenta..." style="border: none; background: transparent; box-shadow: none;">
                </div>
                <input type="hidden" id="iva-acc-desc" value="${esc(defaultDescStr)}">
                <div id="iva-acc-desc-results" class="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-lg text-xs" style="display: none; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"></div>
              </div>
            </div>
            <div class="flex justify-end pt-1">
              <button class="btn btn-secondary btn-xs py-1.5 px-3 flex items-center gap-1.5" id="btn-save-iva-config">
                <i class="fas fa-floppy-disk"></i> Guardar Cuentas
              </button>
            </div>
          </div>
        </details>

        <!-- Filtros del Reporte en un Grid horizontal moderno -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Fecha Desde</label>
            <input type="date" id="iva-date-from" class="form-input w-full text-xs" style="height: 38px;" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Fecha Hasta</label>
            <input type="date" id="iva-date-to" class="form-input w-full text-xs" style="height: 38px;" value="${today}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Tipo de Reporte</label>
            <select id="iva-report-type" class="form-input w-full text-xs" style="height: 38px; background-color: #fff; color: #0D2137;">
              <option value="resumido">Consolidado (Resumido)</option>
              <option value="detallado" selected>Detallado</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Tipo de Persona</label>
            <select id="iva-person-filter" class="form-input w-full text-xs" style="height: 38px; background-color: #fff; color: #0D2137;">
              <option value="ambos" selected>Ambos</option>
              <option value="natural">Persona Natural</option>
              <option value="juridica">Persona Jurídica</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1 text-xs font-bold py-2 justify-center flex items-center" style="height: 38px;" id="btn-gen-iva"><i class="fas fa-play mr-1"></i>Generar</button>
            <button class="btn btn-outline text-xs py-2 justify-center flex items-center text-green-700 border-green-600 hover:bg-green-50" style="height: 38px;" id="btn-exp-iva" disabled title="Exportar a Excel"><i class="fas fa-file-excel"></i></button>
            <button class="btn btn-outline text-xs py-2 justify-center flex items-center text-red-700 border-red-600 hover:bg-red-50" style="height: 38px;" id="btn-pdf-iva" disabled title="Exportar a PDF"><i class="fas fa-file-pdf"></i></button>
          </div>
        </div>

        <!-- Opciones adicionales -->
        <div class="flex items-center gap-4 mt-2">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 font-semibold">
            <input type="checkbox" id="iva-omit-dian" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" style="width:14px;height:14px" checked />
            Omitir registros DIAN (NIT 800197268)
          </label>
        </div>
      </div>
      <div id="iva-results" class="p-5 text-sm text-center text-gray-400">Configura los filtros y haz clic en Generar.</div>`;

    initMultiAccountSelector({
      containerId: 'iva-acc-gen-chips-container',
      inputId: 'iva-acc-gen-search',
      hiddenId: 'iva-acc-gen',
      resultsId: 'iva-acc-gen-results',
      accounts,
      themeColor: 'rose'
    });

    initMultiAccountSelector({
      containerId: 'iva-acc-desc-chips-container',
      inputId: 'iva-acc-desc-search',
      hiddenId: 'iva-acc-desc',
      resultsId: 'iva-acc-desc-results',
      accounts,
      themeColor: 'emerald'
    });

    $('#btn-save-iva-config')?.addEventListener('click', async () => {
      const genVal = getInputVal('iva-acc-gen').trim();
      const descVal = getInputVal('iva-acc-desc').trim();
      try {
        await Promise.all([
          API.setSetting('report_iva_generado', genVal),
          API.setSetting('report_iva_descontable', descVal),
        ]);
        showToast('Configuración de cuentas de IVA guardada.', 'success');
      } catch (err: any) {
        showToast(`Error al guardar configuración: ${err.message}`, 'error');
      }
    });

    $('#btn-gen-iva')?.addEventListener('click', generateIvaReportRows);
    $('#btn-exp-iva')?.addEventListener('click', exportIvaToExcel);
    $('#btn-pdf-iva')?.addEventListener('click', exportIvaToPdf);
  } catch (err: any) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function generateIvaReportRows() {
  const fromDate = getInputVal('iva-date-from');
  const toDate = getInputVal('iva-date-to');
  const reportType = getInputVal('iva-report-type') || 'detallado';
  const personFilter = getInputVal('iva-person-filter') || 'ambos';
  const omitDian = (document.getElementById('iva-omit-dian') as HTMLInputElement | null)?.checked ?? false;

  if (!fromDate || !toDate) {
    return showToast('Por favor selecciona las fechas Desde y Hasta.', 'warning');
  }

  const results = $('#iva-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Reporte de IVA...</div>';

  try {
    const genPrefixes = getInputVal('iva-acc-gen').split(',').map(s => s.trim()).filter(Boolean);
    const descPrefixes = getInputVal('iva-acc-desc').split(',').map(s => s.trim()).filter(Boolean);

    const prefixes = [...genPrefixes, ...descPrefixes];
    let accountFilter = '';
    if (prefixes.length > 0) {
      accountFilter = ' && (' + prefixes.map(p => `account_id.code ~ "${p}"`).join(' || ') + ')';
    }
    const linesFilter = `tx_id.status="active" && tx_id.date >= "${fromDate}" && tx_id.date <= "${toDate} 23:59:59"${accountFilter}`;

    const [rawTxLines, thirdParties] = await Promise.all([
      pb.listAll('tx_lines', {
        filter: linesFilter,
        expand: 'account_id,tx_id',
        ignoreBranch: true
      }),
      pb.listAll('third_parties')
    ]);

    const thirdById = Object.fromEntries(thirdParties.map(t => [t.id, t]));

    // Obtener los cross_doc_ref de las líneas asociadas a las mismas transacciones
    const txIds = [...new Set(rawTxLines.map(l => l.tx_id))];
    const crossDocRefsMap = new Map();
    if (txIds.length > 0) {
      const chunks = [];
      const chunkSize = 50;
      for (let i = 0; i < txIds.length; i += chunkSize) {
        chunks.push(txIds.slice(i, i + chunkSize));
      }
      
      const crossLinesPromises = chunks.map(chunk => {
        const filter = chunk.map(id => `tx_id="${id}"`).join(' || ') + ' && cross_doc_ref != ""';
        return pb.listAll('tx_lines', { filter, fields: 'tx_id,cross_doc_ref' });
      });
      
      const crossLinesRes = await Promise.all(crossLinesPromises);
      const crossLines = crossLinesRes.flat();
      for (const cl of crossLines) {
        if (cl.cross_doc_ref) {
          crossDocRefsMap.set(cl.tx_id, cl.cross_doc_ref);
        }
      }
    }

    const getPersonType = (third: any) => {
      if (third?.person_type) return third.person_type;
      const doc = (third?.doc_number || '').replace(/[^0-9]/g, '');
      if (doc.length >= 9 && (doc.startsWith('8') || doc.startsWith('9'))) {
        return 'JURIDICA';
      }
      return 'NATURAL';
    };

    const genLines: any[] = [];
    const descLines: any[] = [];

    const resolveIvaRateAndBase = (line: any, rowNet: number) => {
      let rate = Number(line.ret_rate || 0);
      if (rate <= 0) {
        const acc = line.expand?.account_id;
        if (acc && Number(acc.ret_rate_reteiva || 0) > 0) {
          rate = Number(acc.ret_rate_reteiva);
        } else {
          rate = 19;
        }
      }
      let base = Number(line.ret_base || 0);
      const amount = Math.abs(rowNet);
      if (base <= 0.01 || Math.abs(base - amount) < 0.05) {
        base = rate > 0 ? (amount / (rate / 100)) : amount;
      }
      // Redondear a 2 decimales para evitar ruido de punto flotante de JS
      base = Math.round(base * 100) / 100;
      return { rate, base };
    };

    for (const l of rawTxLines) {
      const tx = l.expand?.tx_id;
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (tx.date < fromDate || tx.date > toDate) continue;

      // Resolver Tercero y tipo de persona
      const actualThirdId = l.third_party_id || tx.third_party_id;
      const third = actualThirdId ? thirdById[actualThirdId] : null;

      // Omitir registros DIAN (NIT 800197268)
      if (omitDian && third?.doc_number) {
        const cleanDoc = String(third.doc_number).replace(/[^0-9]/g, '');
        if (cleanDoc === '800197268') {
          continue;
        }
      }

      const pType = getPersonType(third);

      // Filtrar por Persona Natural / Jurídica
      if (personFilter === 'natural' && pType !== 'NATURAL') continue;
      if (personFilter === 'juridica' && pType !== 'JURIDICA') continue;

      const code = l.expand?.account_id?.code || '';
      const crossDocRef = l.cross_doc_ref || crossDocRefsMap.get(l.tx_id) || '';

      if (matchesPrefix(code, genPrefixes)) {
        const rowNet = Number(l.credit || 0) - Number(l.debit || 0);
        const { rate, base } = resolveIvaRateAndBase(l, rowNet);
        genLines.push({ line: l, tx, third, rate, base, net: rowNet, type: 'Generado', crossDocRef });
      } else if (matchesPrefix(code, descPrefixes)) {
        const rowNet = Number(l.debit || 0) - Number(l.credit || 0);
        const { rate, base } = resolveIvaRateAndBase(l, rowNet);
        descLines.push({ line: l, tx, third, rate, base, net: rowNet, type: 'Descontable', crossDocRef });
      }
    }

    // Cálculos de KPI globales
    const sumGenDebit = genLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumGenCredit = genLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumGenBase = genLines.reduce((acc, curr) => acc + curr.base, 0);
    const netGen = sumGenCredit - sumGenDebit;

    const sumDescDebit = descLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumDescCredit = descLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumDescBase = descLines.reduce((acc, curr) => acc + curr.base, 0);
    const netDesc = sumDescDebit - sumDescCredit;

    const netSuggested = netGen - netDesc;

    // Agrupamiento por Cuenta Contable
    const accountGroups = new Map();

    const addLineToGroup = (item: any) => {
      const code = item.line.expand?.account_id?.code || '';
      const name = item.line.expand?.account_id?.name || '';
      if (!accountGroups.has(code)) {
        accountGroups.set(code, {
          code,
          name,
          type: item.type,
          lines: [],
          totalBase: 0,
          totalValor: 0
        });
      }
      accountGroups.get(code).lines.push(item);
    };

    genLines.forEach(addLineToGroup);
    descLines.forEach(addLineToGroup);

    const sortedAccountCodes = [...accountGroups.keys()].sort();

    // Procesar agrupamiento y subtotales por cuenta
    sortedAccountCodes.forEach(code => {
      const g = accountGroups.get(code);
      if (reportType === 'resumido') {
        const aggregates = new Map();
        g.lines.forEach((item: any) => {
          const thirdId = item.third?.id || 'SIN_TERCERO';
          const key = `${thirdId}_${item.rate}`;
          if (!aggregates.has(key)) {
            aggregates.set(key, {
              third: item.third,
              rate: item.rate,
              base: 0,
              value: 0
            });
          }
          const agg = aggregates.get(key);
          agg.base += item.base;
          agg.value += Math.abs(item.net);
        });
        g.aggregatedRows = [...aggregates.values()].sort((a, b) => 
          (a.third?.name || '').localeCompare(b.third?.name || '')
        );
        g.totalBase = g.aggregatedRows.reduce((sum: number, r: any) => sum + r.base, 0);
        g.totalValor = g.aggregatedRows.reduce((sum: number, r: any) => sum + r.value, 0);
      } else {
        g.lines.sort((a: any, b: any) => a.tx.date.localeCompare(b.tx.date));
        g.totalBase = g.lines.reduce((sum: number, r: any) => sum + r.base, 0);
        g.totalValor = g.lines.reduce((sum: number, r: any) => sum + Math.abs(r.net), 0);
      }
    });

    let suggestedClass = '';
    let suggestedIcon = '';
    let suggestedText = '';
    if (netSuggested > 0) {
      suggestedClass = 'bg-red-50 border-red-200 text-red-700';
      suggestedIcon = 'fa-circle-exclamation';
      suggestedText = `Sugerencia de Pago (A Pagar): ${fmt(netSuggested)}`;
    } else if (netSuggested < 0) {
      suggestedClass = 'bg-green-50 border-green-200 text-green-700';
      suggestedIcon = 'fa-circle-check';
      suggestedText = `Saldo a Favor: ${fmt(Math.abs(netSuggested))}`;
    } else {
      suggestedClass = 'bg-gray-50 border-gray-200 text-gray-700';
      suggestedIcon = 'fa-circle-info';
      suggestedText = 'Impuesto Neto Balanceado: $0';
    }

    // Renderizado de la tabla de resultados
    let tableHtml = '';
    if (!sortedAccountCodes.length) {
      tableHtml = `
        <div class="p-8 text-center text-gray-400 bg-white rounded-2xl border" style="border-color:#E5E7EB">
          <i class="fas fa-folder-open text-3xl mb-2 text-gray-300 block"></i>
          No hay movimientos de IVA que coincidan con los filtros seleccionados en este período.
        </div>`;
    } else {
      const isRes = reportType === 'resumido';
      tableHtml = `
        <div class="bg-white rounded-2xl border overflow-hidden shadow-sm animate-fade-in" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700 flex items-center gap-2">
              <i class="fas fa-list text-green-600"></i>
              <span>Listado de IVA - ${isRes ? 'Consolidado (Resumido)' : 'Detallado'}</span>
            </h5>
            <span class="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
              ${isRes ? `${sortedAccountCodes.length} cuentas agrupadas` : `${genLines.length + descLines.length} registros`}
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table w-full text-xs text-left border-collapse">
              <thead>
                <tr class="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200 select-none">
                  <th class="p-3">Nombre/Razón Social</th>
                  <th class="p-3">Ident./Nit</th>
                  <th class="p-3 text-center">DV</th>
                  <th class="p-3 text-center">P.J./P.N.</th>
                  <th class="p-3">Dirección</th>
                  <th class="p-3 text-center">Tipo IVA</th>
                  ${isRes ? '' : '<th class="p-3">Documento</th><th class="p-3 text-center">Fecha</th><th class="p-3">NumExterno</th>'}
                  <th class="p-3">Ciudad</th>
                  <th class="p-3 text-right">Base Gravable</th>
                  <th class="p-3 text-right">%</th>
                  <th class="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${sortedAccountCodes.map(code => {
                  const g = accountGroups.get(code);
                  const accHeader = `
                    <tr class="bg-green-50/50">
                      <td colspan="${isRes ? 10 : 13}" class="p-2.5 font-bold text-green-900 border-b border-green-100/80 text-xs">
                        <i class="fas fa-folder-tree text-green-500 mr-1.5"></i>
                        ${esc(code)} — ${esc(g.name)} 
                        <span class="badge ${g.type === 'Generado' ? 'badge-orange' : 'badge-green'} ml-2" style="font-size: 9px; padding: 1px 6px;">${esc(g.type)}</span>
                      </td>
                    </tr>`;

                  let rowsHtml = '';
                  if (isRes) {
                    rowsHtml = g.aggregatedRows.map((agg: any) => `
                      <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                        <td class="p-3 font-medium text-gray-800">${esc(agg.third?.name || 'Sin tercero')}</td>
                        <td class="p-3 font-mono text-gray-600">${esc(agg.third?.doc_number || 'SIN DOC')}</td>
                        <td class="p-3 text-center font-mono text-gray-600">${esc(agg.third?.dv || '—')}</td>
                        <td class="p-3 text-center font-semibold text-gray-700">${getPersonType(agg.third) === 'JURIDICA' ? 'J' : 'N'}</td>
                        <td class="p-3 text-gray-600">${esc(agg.third?.address || '—')}</td>
                        <td class="p-3 text-center"><span class="badge ${g.type === 'Generado' ? 'badge-orange' : 'badge-green'} text-[10px]">${esc(g.type)}</span></td>
                        <td class="p-3 text-gray-600">${esc(agg.third?.city || '—')}</td>
                        <td class="p-3 text-right font-mono text-gray-700 font-semibold">${fmt(agg.base)}</td>
                        <td class="p-3 text-right font-mono text-gray-600">${agg.rate > 0 ? `${agg.rate}%` : '—'}</td>
                        <td class="p-3 text-right font-mono text-green-950 font-bold">${fmt(agg.value)}</td>
                      </tr>`).join('');
                  } else {
                    rowsHtml = g.lines.map((item: any) => `
                      <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                        <td class="p-3 font-medium text-gray-800">${esc(item.third?.name || 'Sin tercero')}</td>
                        <td class="p-3 font-mono text-gray-600">${esc(item.third?.doc_number || 'SIN DOC')}</td>
                        <td class="p-3 text-center font-mono text-gray-600">${esc(item.third?.dv || '—')}</td>
                        <td class="p-3 text-center font-semibold text-gray-700">${getPersonType(item.third) === 'JURIDICA' ? 'J' : 'N'}</td>
                        <td class="p-3 text-gray-600">${esc(item.third?.address || '—')}</td>
                        <td class="p-3 text-center"><span class="badge ${g.type === 'Generado' ? 'badge-orange' : 'badge-green'} text-[10px]">${esc(g.type)}</span></td>
                        <td class="p-3 font-mono text-blue-900 font-semibold">${esc(item.tx.number)}</td>
                        <td class="p-3 text-center font-mono text-gray-600">${esc(item.tx.date)}</td>
                        <td class="p-3 font-mono text-gray-600">${esc(item.crossDocRef || '—')}</td>
                        <td class="p-3 text-gray-600">${esc(item.third?.city || '—')}</td>
                        <td class="p-3 text-right font-mono text-gray-700 font-semibold">${fmt(item.base)}</td>
                        <td class="p-3 text-right font-mono text-gray-600">${item.rate > 0 ? `${item.rate}%` : '—'}</td>
                        <td class="p-3 text-right font-mono text-green-950 font-bold">${fmt(Math.abs(item.net))}</td>
                      </tr>`).join('');
                  }

                  const subtotalHtml = `
                    <tr class="bg-gray-50/80 border-b border-gray-200 font-bold text-gray-700">
                      <td colspan="${isRes ? 7 : 10}" class="p-3 text-right">Subtotal Cuenta ${code}:</td>
                      <td class="p-3 text-right font-mono text-gray-800">${fmt(g.totalBase)}</td>
                      <td></td>
                      <td class="p-3 text-right font-mono text-green-900">${fmt(g.totalValor)}</td>
                    </tr>`;

                  return accHeader + rowsHtml + subtotalHtml;
                }).join('')}
              </tbody>
              <tfoot>
                <!-- Totalizador general en la tabla -->
                <tr class="bg-green-100/20 border-t-2 border-green-200 font-extrabold text-gray-800">
                  <td colspan="${isRes ? 7 : 10}" class="p-3 text-right text-xs uppercase">Base Total / Neto Reportado:</td>
                  <td class="p-3 text-right font-mono text-gray-900 text-xs">${fmt(sumGenBase + sumDescBase)}</td>
                  <td></td>
                  <td class="p-3 text-right font-mono text-green-950 text-xs">${fmt(netGen + netDesc)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>`;
    }

    results.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase">Total IVA Generado</p>
          <p class="text-2xl font-bold mt-1 text-gray-800">${fmt(netGen)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Créditos: ${fmt(sumGenCredit)} · Débitos: ${fmt(sumGenDebit)}</p>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase">Total IVA Descontable</p>
          <p class="text-2xl font-bold mt-1 text-gray-800">${fmt(netDesc)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Débitos: ${fmt(sumDescDebit)} · Créditos: ${fmt(sumDescCredit)}</p>
        </div>
        <div class="rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${suggestedClass}" style="border-width:1px">
          <div>
            <p class="text-xs font-bold uppercase opacity-80">Sugerencia de Liquidación</p>
            <p class="text-2xl font-bold mt-1">${netSuggested >= 0 ? fmt(netSuggested) : fmt(Math.abs(netSuggested))}</p>
          </div>
          <div class="flex items-center justify-between gap-2 mt-2">
            <p class="text-xs font-semibold flex items-center gap-1"><i class="fas ${suggestedIcon}"></i> ${suggestedText}</p>
            ${netSuggested > 0 && can('canWrite') ? `<button class="btn btn-secondary btn-xs py-1" id="btn-pay-iva"><i class="fas fa-money-bill-wave mr-1"></i>Pagar</button>` : ''}
          </div>
        </div>
      </div>
      ${tableHtml}
    `;

    (window as any)._ivaReportData = {
      fromDate,
      toDate,
      reportType,
      personFilter,
      genPrefixes,
      descPrefixes,
      genLines,
      descLines,
      accountGroups: sortedAccountCodes.map(code => accountGroups.get(code)),
      netGen,
      netDesc,
      netSuggested,
      sumGenBase,
      sumDescBase
    };

    const expBtn = $('#btn-exp-iva') as HTMLButtonElement | null;
    const pdfBtn = $('#btn-pdf-iva') as HTMLButtonElement | null;
    if (expBtn) expBtn.disabled = false;
    if (pdfBtn) pdfBtn.disabled = false;
    $('#btn-pay-iva')?.addEventListener('click', () => (window as any)._openPayIvaModal());
  } catch (err: any) {
    results.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function exportIvaToExcel() {
  const data = (window as any)._ivaReportData;
  if (!data) return;

  const [companyName, companyNit] = await Promise.all([
    API.getSetting('company_name').catch(() => 'EMPRESA'),
    API.getSetting('company_nit').catch(() => 'N/A'),
  ]);

  const fromDate = data.fromDate;
  const toDate = data.toDate;
  const reportType = data.reportType;
  const isRes = reportType === 'resumido';
  
  const year = fromDate.substring(0, 4);

  const formatExcelDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(parts[1], 10) - 1;
    return `${months[idx] || parts[1]}-${parts[2]}-${parts[0]}`;
  };

  const formattedFrom = formatExcelDate(fromDate);
  const formattedTo = formatExcelDate(toDate);

  const formatExcelNum = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const rounded = Math.round(val * 100) / 100;
    return String(rounded).replace('.', ',');
  };

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8"/><style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; }
    td { padding: 4px; vertical-align: middle; }
    .header-company { font-size: 11pt; font-weight: bold; }
    .header-nit { font-size: 10pt; font-weight: bold; }
    .header-title { font-size: 12pt; font-weight: bold; color: #0D2137; text-align: left; }
    .header-subtitle { font-size: 10pt; font-weight: bold; color: #4B5563; }
    .th-col { background-color: #E6E6E6; font-weight: bold; border: 0.5pt solid #CCCCCC; padding: 5px; text-align: left; }
    .account-row td { font-weight: bold; background-color: #F0FDF4; border: 0.5pt solid #D1D5DB; }
    .data-row td { border: 0.5pt solid #E5E7EB; }
    .subtotal-row td { font-weight: bold; border-top: 0.5pt solid #000; border-bottom: 0.5pt double #000; }
    .total-row td { font-weight: bold; background-color: #DCFCE7; border-top: 1.5pt solid #16A34A; border-bottom: 2pt double #16A34A; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  </style></head><body>`;

  html += '<table>';
  
  html += `<tr><td class="header-company" colspan="9">${esc(companyName.toUpperCase())}</td></tr>`;
  html += `<tr><td class="header-nit" colspan="9">NIT. ${esc(companyNit)}</td></tr>`;
  html += `<tr><td colspan="9"></td></tr>`;
  
  const reportTitleName = isRes ? 'INFORME CONSOLIDADO DE IVA' : 'INFORME DETALLADO DE IVA';
  html += `<tr><td class="header-title" colspan="9">${reportTitleName}</td></tr>`;
  html += `<tr><td class="header-subtitle" colspan="9">POR EL AÑO GRAVABLE DE ${year}</td></tr>`;
  html += `<tr><td class="header-subtitle" colspan="9">Desde ${formattedFrom} Hasta ${formattedTo}</td></tr>`;
  html += `<tr><td colspan="9"></td></tr>`;

  const columns = isRes 
    ? ['Nombre/Razón Social', 'Ident./Nit', 'DigVer', 'P. Jurídica/P. Natural', 'Dirección', 'Tipo IVA', 'Ciudad', 'Base', '%', 'Valor']
    : ['Nombre/Razón Social', 'Ident./Nit', 'DigVer', 'P. Jurídica/P. Natural', 'Dirección', 'Tipo IVA', 'Documento', 'Fecha', 'NumExterno', 'Ciudad', 'Base', '%', 'Valor'];

  html += '<tr>';
  columns.forEach(col => {
    html += `<td class="th-col">${esc(col)}</td>`;
  });
  html += '</tr>';

  data.accountGroups.forEach((g: any) => {
    const firstRate = g.lines[0]?.rate > 0 ? g.lines[0].rate : 0;
    const rateText = firstRate > 0 ? `${firstRate.toFixed(2)} %`.replace('.', ',') : '';
    html += `<tr class="account-row">`;
    html += `<td>${esc(g.code)} - ${esc(g.name)} (${g.type === 'Generado' ? 'IVA Generado' : 'IVA Descontable'})</td>`;
    html += `<td>${esc(rateText)}</td>`;
    for (let i = 2; i < columns.length; i++) {
      html += '<td></td>';
    }
    html += '</tr>';

    if (isRes) {
      g.aggregatedRows.forEach((agg: any) => {
        const getPersonType = (third: any) => {
          if (third?.person_type) return third.person_type;
          const doc = (third?.doc_number || '').replace(/[^0-9]/g, '');
          if (doc.length >= 9 && (doc.startsWith('8') || doc.startsWith('9'))) return 'JURIDICA';
          return 'NATURAL';
        };
        html += `<tr class="data-row">`;
        html += `<td>${esc(agg.third?.name || 'Sin tercero')}</td>`;
        html += `<td style="mso-number-format:\\@">${esc(agg.third?.doc_number || 'SIN DOC')}</td>`;
        html += `<td class="text-center">${esc(agg.third?.dv || '—')}</td>`;
        html += `<td class="text-center">${getPersonType(agg.third) === 'JURIDICA' ? 'J' : 'N'}</td>`;
        html += `<td>${esc(agg.third?.address || '—')}</td>`;
        html += `<td>${esc(g.type)}</td>`;
        html += `<td>${esc(agg.third?.city || '—')}</td>`;
        html += `<td class="text-right">${formatExcelNum(agg.base)}</td>`;
        html += `<td class="text-right">${formatExcelNum(agg.rate)}%</td>`;
        html += `<td class="text-right">${formatExcelNum(agg.value)}</td>`;
        html += '</tr>';
      });
    } else {
      g.lines.forEach((item: any) => {
        const getPersonType = (third: any) => {
          if (third?.person_type) return third.person_type;
          const doc = (third?.doc_number || '').replace(/[^0-9]/g, '');
          if (doc.length >= 9 && (doc.startsWith('8') || doc.startsWith('9'))) return 'JURIDICA';
          return 'NATURAL';
        };
        html += `<tr class="data-row">`;
        html += `<td>${esc(item.third?.name || 'Sin tercero')}</td>`;
        html += `<td style="mso-number-format:\\@">${esc(item.third?.doc_number || 'SIN DOC')}</td>`;
        html += `<td class="text-center">${esc(item.third?.dv || '—')}</td>`;
        html += `<td class="text-center">${getPersonType(item.third) === 'JURIDICA' ? 'J' : 'N'}</td>`;
        html += `<td>${esc(item.third?.address || '—')}</td>`;
        html += `<td>${esc(g.type)}</td>`;
        html += `<td>${esc(item.tx.number)}</td>`;
        html += `<td class="text-center">${formatExcelDate(item.tx.date)}</td>`;
        html += `<td style="mso-number-format:\\@">${esc(item.crossDocRef || '—')}</td>`;
        html += `<td>${esc(item.third?.city || '—')}</td>`;
        html += `<td class="text-right">${formatExcelNum(item.base)}</td>`;
        html += `<td class="text-right">${formatExcelNum(item.rate)}%</td>`;
        html += `<td class="text-right">${formatExcelNum(Math.abs(item.net))}</td>`;
        html += '</tr>';
      });
    }

    html += `<tr class="subtotal-row">`;
    if (isRes) {
      html += `<td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalBase)}</td>`;
      html += `<td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalValor)}</td>`;
    } else {
      html += `<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalBase)}</td>`;
      html += `<td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalValor)}</td>`;
    }
    html += '</tr>';
  });

  const totalBases = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalBase, 0);
  const totalValor = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalValor, 0);

  html += `<tr class="total-row">`;
  if (isRes) {
    html += `<td>TOTAL GENERAL</td><td></td><td></td><td></td><td></td><td></td><td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalBases)}</td>`;
    html += `<td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalValor)}</td>`;
  } else {
    html += `<td>TOTAL GENERAL</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalBases)}</td>`;
    html += `<td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalValor)}</td>`;
  }
  html += '</tr>';

  html += '</table></body></html>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filePrefix = isRes ? 'reporte_iva_consolidado' : 'reporte_iva_detallado';
  a.download = `${filePrefix}_${fromDate}_a_${toDate}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportIvaToPdf() {
  const data = (window as any)._ivaReportData;
  if (!data) return;

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;

    const reportType = data.reportType || 'detallado';
    const isRes = reportType === 'resumido';
    const orientation = isRes ? 'portrait' : 'landscape';

    const doc = new jsPdfCtor({ orientation, unit: 'pt', format: 'letter' });
    const headerCtx = await getPdfHeaderContext();

    const reportTitleName = isRes 
      ? 'Informe Consolidado de IVA' 
      : 'Informe Detallado de IVA';

    const header = drawPdfHeader(doc, headerCtx, {
      title: reportTitleName,
      subtitles: [
        `Periodo: ${data.fromDate} a ${data.toDate}`,
        `IVA Generado: ${fmtPdfNum(data.netGen)} · IVA Descontable: ${fmtPdfNum(data.netDesc)}`,
        `Sugerencia de Liquidación: ${data.netSuggested >= 0 ? 'A Pagar' : 'Saldo a Favor'} ${fmtPdfNum(Math.abs(data.netSuggested))}`
      ],
    });

    const body: any[] = [];
    const getPersonType = (third: any) => {
      if (third?.person_type) return third.person_type;
      const docNum = (third?.doc_number || '').replace(/[^0-9]/g, '');
      if (docNum.length >= 9 && (docNum.startsWith('8') || docNum.startsWith('9'))) return 'JURIDICA';
      return 'NATURAL';
    };

    data.accountGroups.forEach((g: any) => {
      const colSpan = isRes ? 10 : 13;
      body.push([
        { 
          content: `${g.code} — ${g.name} (${g.type === 'Generado' ? 'Pasivo / Generado' : 'Activo / Descontable'})`, 
          colSpan, 
          styles: { fontStyle: 'bold', fillColor: [240, 253, 244], textColor: [15, 23, 42] } 
        }
      ]);

      if (isRes) {
        g.aggregatedRows.forEach((agg: any) => {
          const pType = getPersonType(agg.third) === 'JURIDICA' ? 'J' : 'N';
          body.push([
            agg.third?.name || 'Sin tercero',
            agg.third?.doc_number || 'SIN DOC',
            agg.third?.dv || '—',
            pType,
            agg.third?.address || '—',
            g.type,
            agg.third?.city || '—',
            fmtPdfNum(agg.base),
            agg.rate > 0 ? `${agg.rate}%` : '—',
            fmtPdfNum(agg.value)
          ]);
        });
      } else {
        g.lines.forEach((item: any) => {
          const pType = getPersonType(item.third) === 'JURIDICA' ? 'J' : 'N';
          body.push([
            item.third?.name || 'Sin tercero',
            item.third?.doc_number || 'SIN DOC',
            item.third?.dv || '—',
            pType,
            item.third?.address || '—',
            g.type,
            item.tx.number,
            item.tx.date,
            item.crossDocRef || '—',
            item.third?.city || '—',
            fmtPdfNum(item.base),
            item.rate > 0 ? `${item.rate}%` : '—',
            fmtPdfNum(Math.abs(item.net))
          ]);
        });
      }

      if (isRes) {
        body.push([
          { content: `Total Cuenta ${g.code}:`, colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalBase), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250] } },
          { content: '', styles: { fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250], textColor: [17, 24, 39] } }
        ]);
      } else {
        body.push([
          { content: `Total Cuenta ${g.code}:`, colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalBase), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250] } },
          { content: '', styles: { fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250], textColor: [17, 24, 39] } }
        ]);
      }
    });

    const totalBases = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalBase, 0);
    const totalValor = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalValor, 0);

    if (isRes) {
      body.push([
        { content: 'TOTAL GENERAL:', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 252, 231] } },
        { content: fmtPdfNum(totalBases), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 252, 231] } },
        { content: '', styles: { fillColor: [220, 252, 231] } },
        { content: fmtPdfNum(totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 252, 231], textColor: [21, 128, 61] } }
      ]);
    } else {
      body.push([
        { content: 'TOTAL GENERAL:', colSpan: 10, styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 252, 231] } },
        { content: fmtPdfNum(totalBases), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 252, 231] } },
        { content: '', styles: { fillColor: [220, 252, 231] } },
        { content: fmtPdfNum(totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 252, 231], textColor: [21, 128, 61] } }
      ]);
    }

    const head = isRes 
      ? [['Nombre/Razón Social', 'Ident./Nit', 'DV', 'P.J./P.N.', 'Dirección', 'Tipo', 'Ciudad', 'Base Gravable', '%', 'Valor']]
      : [['Nombre/Razón Social', 'Ident./Nit', 'DV', 'P.J./P.N.', 'Dirección', 'Tipo', 'Documento', 'Fecha', 'NumExt', 'Ciudad', 'Base', '%', 'Valor']];

    const columnStyles: any = {};
    if (isRes) {
      columnStyles[0] = { cellWidth: 120 };
      columnStyles[1] = { cellWidth: 65 };
      columnStyles[2] = { cellWidth: 20, halign: 'center' };
      columnStyles[3] = { cellWidth: 35, halign: 'center' };
      columnStyles[4] = { cellWidth: 110 };
      columnStyles[5] = { cellWidth: 50 };
      columnStyles[6] = { cellWidth: 60 };
      columnStyles[7] = { cellWidth: 60, halign: 'right' };
      columnStyles[8] = { cellWidth: 30, halign: 'right' };
      columnStyles[9] = { cellWidth: 60, halign: 'right' };
    } else {
      columnStyles[0] = { cellWidth: 100 };
      columnStyles[1] = { cellWidth: 55 };
      columnStyles[2] = { cellWidth: 18, halign: 'center' };
      columnStyles[3] = { cellWidth: 25, halign: 'center' };
      columnStyles[4] = { cellWidth: 80 };
      columnStyles[5] = { cellWidth: 45 };
      columnStyles[6] = { cellWidth: 60 };
      columnStyles[7] = { cellWidth: 45, halign: 'center' };
      columnStyles[8] = { cellWidth: 50 };
      columnStyles[9] = { cellWidth: 55 };
      columnStyles[10] = { cellWidth: 50, halign: 'right' };
      columnStyles[11] = { cellWidth: 25, halign: 'right' };
      columnStyles[12] = { cellWidth: 50, halign: 'right' };
    }

    doc.autoTable({
      startY: header.startY,
      head,
      body,
      theme: 'plain',
      margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
      styles: { font: 'helvetica', fontSize: 6.2, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.4, lineWidth: { bottom: 0.25 } },
      columnStyles,
      didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
    });

    const filePrefix = isRes ? 'reporte_iva_consolidado' : 'reporte_iva_detallado';
    doc.save(`${filePrefix}_${data.fromDate}_a_${data.toDate}.pdf`);
  } catch (err: any) {
    showToast(`Error al generar PDF: ${err.message}`, 'error');
  }
}

async function renderRetencionesReport() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Reporte de Retenciones...</div>';

  try {
    const [pracAccountsStr, favorAccountsStr] = await Promise.all([
      API.getSetting('report_ret_practicadas').catch(() => '2330'),
      API.getSetting('report_ret_favor').catch(() => '1355'),
    ]);

    const defaultPracStr = pracAccountsStr || '2330';
    const defaultFavorStr = favorAccountsStr || '1355';
    const today = todayStr();
    const firstDayOfMonth = today.substring(0, 8) + '01';

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-percent mr-2 text-indigo-600"></i>Reporte de Retenciones en la Fuente</h4>
        
        <!-- Configuración de cuentas (Colapsable para no saturar) -->
        <details class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
          <summary class="p-3 font-bold text-xs text-gray-700 cursor-pointer flex items-center justify-between select-none hover:bg-gray-100">
            <span class="flex items-center gap-1.5"><i class="fas fa-gears text-gray-500"></i>Configuración de Cuentas Contables</span>
            <span class="text-[10px] text-gray-400 font-normal">Clic para expandir y configurar cuentas</span>
          </summary>
          <div class="p-4 border-t border-gray-200 text-xs space-y-3 bg-white">
            <span class="text-[10px] text-gray-400 block mb-1">Separa los códigos por comas</span>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="block font-bold text-gray-500 mb-1">Retenciones Practicadas (A Terceros / Pasivo)</label>
                <input id="ret-acc-prac" class="form-input text-xs w-full" value="${esc(defaultPracStr)}" placeholder="Ej: 2330, 2365">
              </div>
              <div class="form-group">
                <label class="block font-bold text-gray-500 mb-1">Retenciones a Favor (Anticipos / Activo)</label>
                <input id="ret-acc-favor" class="form-input text-xs w-full" value="${esc(defaultFavorStr)}" placeholder="Ej: 135515, 1355">
              </div>
            </div>
            <div class="flex justify-end">
              <button class="btn btn-secondary btn-xs py-1" id="btn-save-ret-config"><i class="fas fa-floppy-disk mr-1"></i>Guardar Cuentas</button>
            </div>
          </div>
        </details>

        <!-- Filtros del Reporte en un Grid horizontal moderno -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Fecha Desde</label>
            <input type="date" id="ret-date-from" class="form-input w-full text-xs" style="height: 38px;" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Fecha Hasta</label>
            <input type="date" id="ret-date-to" class="form-input w-full text-xs" style="height: 38px;" value="${today}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Tipo de Reporte</label>
            <select id="ret-report-type" class="form-input w-full text-xs" style="height: 38px; background-color: #fff; color: #0D2137;">
              <option value="resumido">Consolidado (Resumido)</option>
              <option value="detallado" selected>Detallado</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Tipo de Persona</label>
            <select id="ret-person-filter" class="form-input w-full text-xs" style="height: 38px; background-color: #fff; color: #0D2137;">
              <option value="ambos" selected>Ambos</option>
              <option value="natural">Persona Natural</option>
              <option value="juridica">Persona Jurídica</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1 text-xs font-bold py-2 justify-center flex items-center" style="height: 38px;" id="btn-gen-ret"><i class="fas fa-play mr-1"></i>Generar</button>
            <button class="btn btn-outline text-xs py-2 justify-center flex items-center text-green-700 border-green-600 hover:bg-green-50" style="height: 38px;" id="btn-exp-ret" disabled title="Exportar a Excel"><i class="fas fa-file-excel"></i></button>
            <button class="btn btn-outline text-xs py-2 justify-center flex items-center text-red-700 border-red-600 hover:bg-red-50" style="height: 38px;" id="btn-pdf-ret" disabled title="Exportar a PDF"><i class="fas fa-file-pdf"></i></button>
          </div>
        </div>

        <!-- Opciones adicionales -->
        <div class="flex items-center gap-4 mt-2">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 font-semibold">
            <input type="checkbox" id="ret-omit-dian" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" style="width:14px;height:14px" checked />
            Omitir registros DIAN (NIT 800197268)
          </label>
        </div>
      </div>
      <div id="ret-results" class="p-5 text-sm text-center text-gray-400">Configura los filtros y haz clic en Generar.</div>`;

    $('#btn-save-ret-config')?.addEventListener('click', async () => {
      const pracVal = getInputVal('ret-acc-prac').trim();
      const favorVal = getInputVal('ret-acc-favor').trim();
      try {
        await Promise.all([
          API.setSetting('report_ret_practicadas', pracVal),
          API.setSetting('report_ret_favor', favorVal),
        ]);
        showToast('Configuración de cuentas de Retenciones guardada.', 'success');
      } catch (err: any) {
        showToast(`Error al guardar configuración: ${err.message}`, 'error');
      }
    });

    $('#btn-gen-ret')?.addEventListener('click', generateRetReportRows);
    $('#btn-exp-ret')?.addEventListener('click', exportRetToExcel);
    $('#btn-pdf-ret')?.addEventListener('click', exportRetToPdf);
  } catch (err: any) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function generateRetReportRows() {
  const fromDate = getInputVal('ret-date-from');
  const toDate = getInputVal('ret-date-to');
  const reportType = getInputVal('ret-report-type') || 'detallado';
  const personFilter = getInputVal('ret-person-filter') || 'ambos';
  const omitDian = (document.getElementById('ret-omit-dian') as HTMLInputElement | null)?.checked ?? false;

  if (!fromDate || !toDate) {
    return showToast('Por favor selecciona las fechas Desde y Hasta.', 'warning');
  }

  const results = $('#ret-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Reporte de Retenciones...</div>';

  try {
    const pracPrefixes = getInputVal('ret-acc-prac').split(',').map(s => s.trim()).filter(Boolean);
    const favorPrefixes = getInputVal('ret-acc-favor').split(',').map(s => s.trim()).filter(Boolean);

    const prefixes = [...pracPrefixes, ...favorPrefixes];
    let accountFilter = '';
    if (prefixes.length > 0) {
      accountFilter = ' && (' + prefixes.map(p => `account_id.code ~ "${p}"`).join(' || ') + ')';
    }
    const linesFilter = `tx_id.status="active" && tx_id.date >= "${fromDate}" && tx_id.date <= "${toDate} 23:59:59"${accountFilter}`;

    const [rawTxLines, thirdParties] = await Promise.all([
      pb.listAll('tx_lines', {
        filter: linesFilter,
        expand: 'account_id,tx_id',
        ignoreBranch: true
      }),
      pb.listAll('third_parties')
    ]);

    const thirdById = Object.fromEntries(thirdParties.map(t => [t.id, t]));

    // Obtener los cross_doc_ref de las líneas asociadas a las mismas transacciones
    const txIds = [...new Set(rawTxLines.map(l => l.tx_id))];
    const crossDocRefsMap = new Map();
    if (txIds.length > 0) {
      const chunks = [];
      const chunkSize = 50;
      for (let i = 0; i < txIds.length; i += chunkSize) {
        chunks.push(txIds.slice(i, i + chunkSize));
      }
      
      const crossLinesPromises = chunks.map(chunk => {
        const filter = chunk.map(id => `tx_id="${id}"`).join(' || ') + ' && cross_doc_ref != ""';
        return pb.listAll('tx_lines', { filter, fields: 'tx_id,cross_doc_ref' });
      });
      
      const crossLinesRes = await Promise.all(crossLinesPromises);
      const crossLines = crossLinesRes.flat();
      for (const cl of crossLines) {
        if (cl.cross_doc_ref) {
          crossDocRefsMap.set(cl.tx_id, cl.cross_doc_ref);
        }
      }
    }

    const getPersonType = (third: any) => {
      if (third?.person_type) return third.person_type;
      const doc = (third?.doc_number || '').replace(/[^0-9]/g, '');
      if (doc.length >= 9 && (doc.startsWith('8') || doc.startsWith('9'))) {
        return 'JURIDICA';
      }
      return 'NATURAL';
    };

    const pracLines: any[] = [];
    const favorLines: any[] = [];

    const resolveRetRateAndBase = (line: any, rowNet: number) => {
      let rate = Number(line.ret_rate || 0);
      const acc = line.expand?.account_id;
      const code = acc?.code || '';
      if (rate <= 0) {
        if (acc) {
          if (code.startsWith('2365') && Number(acc.ret_rate_reterenta || 0) > 0) {
            rate = Number(acc.ret_rate_reterenta);
          } else if (code.startsWith('2367') && Number(acc.ret_rate_reteiva || 0) > 0) {
            rate = Number(acc.ret_rate_reteiva);
          } else if (code.startsWith('2368') && Number(acc.ret_rate_reteica || 0) > 0) {
            rate = Number(acc.ret_rate_reteica);
          } else if (code.startsWith('1355') && Number(acc.ret_rate_reterenta || 0) > 0) {
            rate = Number(acc.ret_rate_reterenta);
          }
        }
        if (rate <= 0) {
          if (code.startsWith('2365') || code.startsWith('1355')) rate = 3.5;
          else if (code.startsWith('2367')) rate = 15;
          else if (code.startsWith('2368')) rate = 0.414;
          else rate = 0;
        }
      }
      let base = Number(line.ret_base || 0);
      const amount = Math.abs(rowNet);
      if (base <= 0.01 || Math.abs(base - amount) < 0.05) {
        base = rate > 0 ? (amount / (rate / 100)) : amount;
      }
      // Redondear a 2 decimales para evitar el ruido de punto flotante de JS (ej: 385000 / 0.035 -> 10999999.999999998)
      base = Math.round(base * 100) / 100;
      return { rate, base };
    };

    for (const l of rawTxLines) {
      const tx = l.expand?.tx_id;
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (tx.date < fromDate || tx.date > toDate) continue;

      // Resolver Tercero y tipo de persona
      const actualThirdId = l.third_party_id || tx.third_party_id;
      const third = actualThirdId ? thirdById[actualThirdId] : null;

      // Omitir registros DIAN (NIT 800197268)
      if (omitDian && third?.doc_number) {
        const cleanDoc = String(third.doc_number).replace(/[^0-9]/g, '');
        if (cleanDoc === '800197268') {
          continue;
        }
      }

      const pType = getPersonType(third);

      // Filtrar por Persona Natural / Jurídica
      if (personFilter === 'natural' && pType !== 'NATURAL') continue;
      if (personFilter === 'juridica' && pType !== 'JURIDICA') continue;

      const code = l.expand?.account_id?.code || '';
      const crossDocRef = l.cross_doc_ref || crossDocRefsMap.get(l.tx_id) || '';
      if (matchesPrefix(code, pracPrefixes)) {
        const rowNet = Number(l.credit || 0) - Number(l.debit || 0);
        const { rate, base } = resolveRetRateAndBase(l, rowNet);
        pracLines.push({ line: l, tx, third, rate, base, net: rowNet, type: 'Practicada', crossDocRef });
      } else if (matchesPrefix(code, favorPrefixes)) {
        const rowNet = Number(l.debit || 0) - Number(l.credit || 0);
        const { rate, base } = resolveRetRateAndBase(l, rowNet);
        favorLines.push({ line: l, tx, third, rate, base, net: rowNet, type: 'A Favor', crossDocRef });
      }
    }

    // Cálculos de KPI globales
    const sumPracDebit = pracLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumPracCredit = pracLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumPracBase = pracLines.reduce((acc, curr) => acc + curr.base, 0);
    const netPrac = sumPracCredit - sumPracDebit;

    const sumFavorDebit = favorLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumFavorCredit = favorLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumFavorBase = favorLines.reduce((acc, curr) => acc + curr.base, 0);
    const netFavor = sumFavorDebit - sumFavorCredit;

    const netSuggested = netPrac - netFavor;

    // Agrupamiento por Cuenta Contable
    const accountGroups = new Map();

    const addLineToGroup = (item: any) => {
      const code = item.line.expand?.account_id?.code || '';
      const name = item.line.expand?.account_id?.name || '';
      if (!accountGroups.has(code)) {
        accountGroups.set(code, {
          code,
          name,
          type: item.type,
          lines: [],
          totalBase: 0,
          totalValor: 0
        });
      }
      accountGroups.get(code).lines.push(item);
    };

    pracLines.forEach(addLineToGroup);
    favorLines.forEach(addLineToGroup);

    const sortedAccountCodes = [...accountGroups.keys()].sort();

    // Procesar agrupamiento y subtotales por cuenta
    sortedAccountCodes.forEach(code => {
      const g = accountGroups.get(code);
      if (reportType === 'resumido') {
        const aggregates = new Map();
        g.lines.forEach((item: any) => {
          const thirdId = item.third?.id || 'SIN_TERCERO';
          const key = `${thirdId}_${item.rate}`;
          if (!aggregates.has(key)) {
            aggregates.set(key, {
              third: item.third,
              rate: item.rate,
              base: 0,
              value: 0
            });
          }
          const agg = aggregates.get(key);
          agg.base += item.base;
          agg.value += Math.abs(item.net);
        });
        g.aggregatedRows = [...aggregates.values()].sort((a, b) => 
          (a.third?.name || '').localeCompare(b.third?.name || '')
        );
        g.totalBase = g.aggregatedRows.reduce((sum: number, r: any) => sum + r.base, 0);
        g.totalValor = g.aggregatedRows.reduce((sum: number, r: any) => sum + r.value, 0);
      } else {
        g.lines.sort((a: any, b: any) => a.tx.date.localeCompare(b.tx.date));
        g.totalBase = g.lines.reduce((sum: number, r: any) => sum + r.base, 0);
        g.totalValor = g.lines.reduce((sum: number, r: any) => sum + Math.abs(r.net), 0);
      }
    });

    let suggestedClass = '';
    let suggestedIcon = '';
    let suggestedText = '';
    if (netSuggested > 0) {
      suggestedClass = 'bg-red-50 border-red-200 text-red-700';
      suggestedIcon = 'fa-circle-exclamation';
      suggestedText = `Sugerencia de Pago (A Pagar): ${fmt(netSuggested)}`;
    } else if (netSuggested < 0) {
      suggestedClass = 'bg-green-50 border-green-200 text-green-700';
      suggestedIcon = 'fa-circle-check';
      suggestedText = `Saldo a Favor (Anticipo): ${fmt(Math.abs(netSuggested))}`;
    } else {
      suggestedClass = 'bg-gray-50 border-gray-200 text-gray-700';
      suggestedIcon = 'fa-circle-info';
      suggestedText = 'Retenciones Netas Balanceadas: $0';
    }

    // Renderizado de la tabla de resultados
    let tableHtml = '';
    if (!sortedAccountCodes.length) {
      tableHtml = `
        <div class="p-8 text-center text-gray-400 bg-white rounded-2xl border" style="border-color:#E5E7EB">
          <i class="fas fa-folder-open text-3xl mb-2 text-gray-300 block"></i>
          No hay movimientos de Retenciones que coincidan con los filtros seleccionados en este período.
        </div>`;
    } else {
      const isRes = reportType === 'resumido';
      tableHtml = `
        <div class="bg-white rounded-2xl border overflow-hidden shadow-sm animate-fade-in" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700 flex items-center gap-2">
              <i class="fas fa-list text-indigo-600"></i>
              <span>Listado de Retenciones en la Fuente - ${isRes ? 'Consolidado (Resumido)' : 'Detallado'}</span>
            </h5>
            <span class="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
              ${isRes ? `${sortedAccountCodes.length} cuentas agrupadas` : `${pracLines.length + favorLines.length} registros`}
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table w-full text-xs text-left border-collapse">
              <thead>
                <tr class="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wider border-b border-gray-200 select-none">
                  <th class="p-3">Nombre/Razón Social</th>
                  <th class="p-3">Ident./Nit</th>
                  <th class="p-3 text-center">DV</th>
                  <th class="p-3 text-center">P.J./P.N.</th>
                  <th class="p-3">Dirección</th>
                  ${isRes ? '' : '<th class="p-3">Documento</th><th class="p-3 text-center">Fecha</th><th class="p-3">NumExterno</th>'}
                  <th class="p-3">Ciudad</th>
                  <th class="p-3 text-right">Base Gravable</th>
                  <th class="p-3 text-right">%</th>
                  <th class="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${sortedAccountCodes.map(code => {
                  const g = accountGroups.get(code);
                  const accHeader = `
                    <tr class="bg-indigo-50/50">
                      <td colspan="${isRes ? 9 : 12}" class="p-2.5 font-bold text-indigo-900 border-b border-indigo-100/80 text-xs">
                        <i class="fas fa-folder-tree text-indigo-500 mr-1.5"></i>
                        ${esc(code)} — ${esc(g.name)} 
                        <span class="badge ${g.type === 'Practicada' ? 'badge-orange' : 'badge-green'} ml-2" style="font-size: 9px; padding: 1px 6px;">${esc(g.type)}</span>
                      </td>
                    </tr>`;

                  let rowsHtml = '';
                  if (isRes) {
                    rowsHtml = g.aggregatedRows.map((agg: any) => `
                      <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                        <td class="p-3 font-medium text-gray-800">${esc(agg.third?.name || 'Sin tercero')}</td>
                        <td class="p-3 font-mono text-gray-600">${esc(agg.third?.doc_number || 'SIN DOC')}</td>
                        <td class="p-3 text-center font-mono text-gray-600">${esc(agg.third?.dv || '—')}</td>
                        <td class="p-3 text-center font-semibold text-gray-700">${getPersonType(agg.third) === 'JURIDICA' ? 'J' : 'N'}</td>
                        <td class="p-3 text-gray-600">${esc(agg.third?.address || '—')}</td>
                        <td class="p-3 text-gray-600">${esc(agg.third?.city || '—')}</td>
                        <td class="p-3 text-right font-mono text-gray-700 font-semibold">${fmt(agg.base)}</td>
                        <td class="p-3 text-right font-mono text-gray-600">${agg.rate > 0 ? `${agg.rate}%` : '—'}</td>
                        <td class="p-3 text-right font-mono text-indigo-950 font-bold">${fmt(agg.value)}</td>
                      </tr>`).join('');
                  } else {
                    rowsHtml = g.lines.map((item: any) => `
                      <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                        <td class="p-3 font-medium text-gray-800">${esc(item.third?.name || 'Sin tercero')}</td>
                        <td class="p-3 font-mono text-gray-600">${esc(item.third?.doc_number || 'SIN DOC')}</td>
                        <td class="p-3 text-center font-mono text-gray-600">${esc(item.third?.dv || '—')}</td>
                        <td class="p-3 text-center font-semibold text-gray-700">${getPersonType(item.third) === 'JURIDICA' ? 'J' : 'N'}</td>
                        <td class="p-3 text-gray-600">${esc(item.third?.address || '—')}</td>
                        <td class="p-3 font-mono text-blue-900 font-semibold">${esc(item.tx.number)}</td>
                        <td class="p-3 text-center font-mono text-gray-600">${esc(item.tx.date)}</td>
                        <td class="p-3 font-mono text-gray-600">${esc(item.crossDocRef || '—')}</td>
                        <td class="p-3 text-gray-600">${esc(item.third?.city || '—')}</td>
                        <td class="p-3 text-right font-mono text-gray-700 font-semibold">${fmt(item.base)}</td>
                        <td class="p-3 text-right font-mono text-gray-600">${item.rate > 0 ? `${item.rate}%` : '—'}</td>
                        <td class="p-3 text-right font-mono text-indigo-950 font-bold">${fmt(Math.abs(item.net))}</td>
                      </tr>`).join('');
                  }

                  const subtotalHtml = `
                    <tr class="bg-gray-50/80 border-b border-gray-200 font-bold text-gray-700">
                      <td colspan="${isRes ? 6 : 9}" class="p-3 text-right">Subtotal Cuenta ${code}:</td>
                      <td class="p-3 text-right font-mono text-gray-800">${fmt(g.totalBase)}</td>
                      <td></td>
                      <td class="p-3 text-right font-mono text-indigo-900">${fmt(g.totalValor)}</td>
                    </tr>`;

                  return accHeader + rowsHtml + subtotalHtml;
                }).join('')}
              </tbody>
              <tfoot>
                <!-- Totalizador general en la tabla -->
                <tr class="bg-indigo-100/20 border-t-2 border-indigo-200 font-extrabold text-gray-800">
                  <td colspan="${isRes ? 6 : 9}" class="p-3 text-right text-xs uppercase">Base Total / Neto Reportado:</td>
                  <td class="p-3 text-right font-mono text-gray-900 text-xs">${fmt(sumPracBase + sumFavorBase)}</td>
                  <td></td>
                  <td class="p-3 text-right font-mono text-indigo-950 text-xs">${fmt(netPrac + netFavor)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>`;
    }

    results.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase">Retenciones Practicadas (A Terceros)</p>
          <p class="text-2xl font-bold mt-1 text-gray-800">${fmt(netPrac)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Créditos: ${fmt(sumPracCredit)} · Débitos: ${fmt(sumPracDebit)}</p>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase">Retenciones a Favor (Anticipos)</p>
          <p class="text-2xl font-bold mt-1 text-gray-800">${fmt(netFavor)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Débitos: ${fmt(sumFavorDebit)} · Créditos: ${fmt(sumFavorCredit)}</p>
        </div>
        <div class="rounded-2xl border p-4 shadow-sm flex flex-col justify-between ${suggestedClass}" style="border-width:1px">
          <div>
            <p class="text-xs font-bold uppercase opacity-80">Sugerencia de Liquidación</p>
            <p class="text-2xl font-bold mt-1">${netSuggested >= 0 ? fmt(netSuggested) : fmt(Math.abs(netSuggested))}</p>
          </div>
          <div class="flex items-center justify-between gap-2 mt-2">
            <p class="text-xs font-semibold flex items-center gap-1"><i class="fas ${suggestedIcon}"></i> ${suggestedText}</p>
            ${netSuggested > 0 && can('canWrite') ? `<button class="btn btn-secondary btn-xs py-1" id="btn-pay-retenciones"><i class="fas fa-money-bill-wave mr-1"></i>Pagar</button>` : ''}
          </div>
        </div>
      </div>
      ${tableHtml}
    `;

    (window as any)._retReportData = {
      fromDate,
      toDate,
      reportType,
      personFilter,
      pracPrefixes,
      favorPrefixes,
      pracLines,
      favorLines,
      accountGroups: sortedAccountCodes.map(code => accountGroups.get(code)),
      netPrac,
      netFavor,
      netSuggested,
      sumPracBase,
      sumFavorBase
    };

    const expBtn = $('#btn-exp-ret') as HTMLButtonElement | null;
    const pdfBtn = $('#btn-pdf-ret') as HTMLButtonElement | null;
    if (expBtn) expBtn.disabled = false;
    if (pdfBtn) pdfBtn.disabled = false;
    $('#btn-pay-retenciones')?.addEventListener('click', () => (window as any)._openPayRetencionesModal());
  } catch (err: any) {
    results.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function exportRetToExcel() {
  const data = (window as any)._retReportData;
  if (!data) return;

  const [companyName, companyNit] = await Promise.all([
    API.getSetting('company_name').catch(() => 'EMPRESA'),
    API.getSetting('company_nit').catch(() => 'N/A'),
  ]);

  const fromDate = data.fromDate;
  const toDate = data.toDate;
  const reportType = data.reportType;
  const isRes = reportType === 'resumido';
  
  const year = fromDate.substring(0, 4);

  // Formatear fechas como "Mmm-dd-yyyy" para que coincida con las plantillas de referencia
  const formatExcelDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(parts[1], 10) - 1;
    return `${months[idx] || parts[1]}-${parts[2]}-${parts[0]}`;
  };

  const formattedFrom = formatExcelDate(fromDate);
  const formattedTo = formatExcelDate(toDate);

  const formatExcelNum = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const rounded = Math.round(val * 100) / 100;
    return String(rounded).replace('.', ',');
  };

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8"/><style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; }
    td { padding: 4px; vertical-align: middle; }
    .header-company { font-size: 11pt; font-weight: bold; }
    .header-nit { font-size: 10pt; font-weight: bold; }
    .header-title { font-size: 12pt; font-weight: bold; color: #0D2137; text-align: left; }
    .header-subtitle { font-size: 10pt; font-weight: bold; color: #4B5563; }
    .th-col { background-color: #E6E6E6; font-weight: bold; border: 0.5pt solid #CCCCCC; padding: 5px; text-align: left; }
    .account-row td { font-weight: bold; background-color: #F3F4F6; border: 0.5pt solid #D1D5DB; }
    .data-row td { border: 0.5pt solid #E5E7EB; }
    .subtotal-row td { font-weight: bold; border-top: 0.5pt solid #000; border-bottom: 0.5pt double #000; }
    .total-row td { font-weight: bold; background-color: #EEF2FF; border-top: 1.5pt solid #4F46E5; border-bottom: 2pt double #4F46E5; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  </style></head><body>`;

  html += '<table>';
  
  // Fila 1: Nombre de la empresa
  html += `<tr><td class="header-company" colspan="9">${esc(companyName.toUpperCase())}</td></tr>`;
  // Fila 2: NIT
  html += `<tr><td class="header-nit" colspan="9">NIT. ${esc(companyNit)}</td></tr>`;
  // Fila 3: Espacio vacío
  html += `<tr><td colspan="9"></td></tr>`;
  // Fila 4: Título del reporte
  const reportTitleName = isRes ? 'INFORME CONSOLIDADO DE RETENCION EN LA FUENTE' : 'INFORME DETALLADO DE RETENCION EN LA FUENTE';
  html += `<tr><td class="header-title" colspan="9">${reportTitleName}</td></tr>`;
  // Fila 5: Año gravable
  html += `<tr><td class="header-subtitle" colspan="9">POR EL AÑO GRAVABLE DE ${year}</td></tr>`;
  // Fila 6: Rango de fechas
  html += `<tr><td class="header-subtitle" colspan="9">Desde ${formattedFrom} Hasta ${formattedTo}</td></tr>`;
  // Fila 6b: Espacio vacío
  html += `<tr><td colspan="9"></td></tr>`;

  // Fila 7: Cabeceras de columna
  const columns = isRes 
    ? ['Nombre/Razón Social', 'Ident./Nit', 'DigVer', 'P. Jurídica/P. Natural', 'Dirección', 'Ciudad', 'Base', '%', 'Valor']
    : ['Nombre/Razón Social', 'Ident./Nit', 'DigVer', 'P. Jurídica/P. Natural', 'Dirección', 'Documento', 'Fecha', 'NumExterno', 'Ciudad', 'Base', '%', 'Valor'];

  html += '<tr>';
  columns.forEach(col => {
    html += `<td class="th-col">${esc(col)}</td>`;
  });
  html += '</tr>';

  // Fila 8+: Datos agrupados por cuenta
  data.accountGroups.forEach((g: any) => {
    // Fila cabecera de la cuenta
    const firstRate = g.lines[0]?.rate > 0 ? g.lines[0].rate : 0;
    const rateText = firstRate > 0 ? `${firstRate.toFixed(2)} %`.replace('.', ',') : '';
    html += `<tr class="account-row">`;
    html += `<td>${esc(g.code)} - ${esc(g.name)}</td>`;
    html += `<td>${esc(rateText)}</td>`;
    for (let i = 2; i < columns.length; i++) {
      html += '<td></td>';
    }
    html += '</tr>';

    // Filas de datos
    if (isRes) {
      g.aggregatedRows.forEach((agg: any) => {
        const getPersonType = (third: any) => {
          if (third?.person_type) return third.person_type;
          const doc = (third?.doc_number || '').replace(/[^0-9]/g, '');
          if (doc.length >= 9 && (doc.startsWith('8') || doc.startsWith('9'))) return 'JURIDICA';
          return 'NATURAL';
        };
        html += `<tr class="data-row">`;
        html += `<td>${esc(agg.third?.name || 'Sin tercero')}</td>`;
        html += `<td style="mso-number-format:\\@">${esc(agg.third?.doc_number || 'SIN DOC')}</td>`;
        html += `<td class="text-center">${esc(agg.third?.dv || '—')}</td>`;
        html += `<td class="text-center">${getPersonType(agg.third) === 'JURIDICA' ? 'J' : 'N'}</td>`;
        html += `<td>${esc(agg.third?.address || '—')}</td>`;
        html += `<td>${esc(agg.third?.city || '—')}</td>`;
        html += `<td class="text-right">${formatExcelNum(agg.base)}</td>`;
        html += `<td class="text-right">${formatExcelNum(agg.rate)}%</td>`;
        html += `<td class="text-right">${formatExcelNum(agg.value)}</td>`;
        html += '</tr>';
      });
    } else {
      g.lines.forEach((item: any) => {
        const getPersonType = (third: any) => {
          if (third?.person_type) return third.person_type;
          const doc = (third?.doc_number || '').replace(/[^0-9]/g, '');
          if (doc.length >= 9 && (doc.startsWith('8') || doc.startsWith('9'))) return 'JURIDICA';
          return 'NATURAL';
        };
        html += `<tr class="data-row">`;
        html += `<td>${esc(item.third?.name || 'Sin tercero')}</td>`;
        html += `<td style="mso-number-format:\\@">${esc(item.third?.doc_number || 'SIN DOC')}</td>`;
        html += `<td class="text-center">${esc(item.third?.dv || '—')}</td>`;
        html += `<td class="text-center">${getPersonType(item.third) === 'JURIDICA' ? 'J' : 'N'}</td>`;
        html += `<td>${esc(item.third?.address || '—')}</td>`;
        html += `<td>${esc(item.tx.number)}</td>`;
        html += `<td class="text-center">${formatExcelDate(item.tx.date)}</td>`;
        html += `<td style="mso-number-format:\\@">${esc(item.crossDocRef || '—')}</td>`;
        html += `<td>${esc(item.third?.city || '—')}</td>`;
        html += `<td class="text-right">${formatExcelNum(item.base)}</td>`;
        html += `<td class="text-right">${formatExcelNum(item.rate)}%</td>`;
        html += `<td class="text-right">${formatExcelNum(Math.abs(item.net))}</td>`;
        html += '</tr>';
      });
    }

    // Fila subtotal de la cuenta
    html += `<tr class="subtotal-row">`;
    if (isRes) {
      html += `<td></td><td></td><td></td><td></td><td></td><td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalBase)}</td>`;
      html += `<td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalValor)}</td>`;
    } else {
      html += `<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalBase)}</td>`;
      html += `<td></td>`;
      html += `<td class="text-right">${formatExcelNum(g.totalValor)}</td>`;
    }
    html += '</tr>';
  });

  // Totales generales
  const totalBases = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalBase, 0);
  const totalValor = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalValor, 0);

  html += `<tr class="total-row">`;
  if (isRes) {
    html += `<td>TOTAL GENERAL</td><td></td><td></td><td></td><td></td><td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalBases)}</td>`;
    html += `<td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalValor)}</td>`;
  } else {
    html += `<td>TOTAL GENERAL</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalBases)}</td>`;
    html += `<td></td>`;
    html += `<td class="text-right">${formatExcelNum(totalValor)}</td>`;
  }
  html += '</tr>';

  html += '</table></body></html>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filePrefix = isRes ? 'reporte_retenciones_consolidado' : 'reporte_retenciones_detallado';
  a.download = `${filePrefix}_${fromDate}_a_${toDate}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportRetToPdf() {
  const data = (window as any)._retReportData;
  if (!data) return;

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;

    const reportType = data.reportType || 'detallado';
    const isRes = reportType === 'resumido';
    const orientation = isRes ? 'portrait' : 'landscape';

    const doc = new jsPdfCtor({ orientation, unit: 'pt', format: 'letter' });
    const headerCtx = await getPdfHeaderContext();

    const reportTitleName = isRes 
      ? 'Informe Consolidado de Retención en la Fuente' 
      : 'Informe Detallado de Retención en la Fuente';

    const header = drawPdfHeader(doc, headerCtx, {
      title: reportTitleName,
      subtitles: [
        `Periodo: ${data.fromDate} a ${data.toDate}`,
        `Retenciones Practicadas: ${fmtPdfNum(data.netPrac)} · Retenciones a Favor: ${fmtPdfNum(data.netFavor)}`,
        `Sugerencia de Liquidación: ${data.netSuggested >= 0 ? 'A Pagar' : 'Saldo a Favor'} ${fmtPdfNum(Math.abs(data.netSuggested))}`
      ],
    });

    const body: any[] = [];
    const getPersonType = (third: any) => {
      if (third?.person_type) return third.person_type;
      const docNum = (third?.doc_number || '').replace(/[^0-9]/g, '');
      if (docNum.length >= 9 && (docNum.startsWith('8') || docNum.startsWith('9'))) return 'JURIDICA';
      return 'NATURAL';
    };

    data.accountGroups.forEach((g: any) => {
      // 1. Fila de Cabecera de la Cuenta
      const colSpan = isRes ? 9 : 12;
      body.push([
        { 
          content: `${g.code} — ${g.name} (${g.type === 'Practicada' ? 'Pasivo / Practicada' : 'Activo / A Favor'})`, 
          colSpan, 
          styles: { fontStyle: 'bold', fillColor: [240, 244, 255], textColor: [15, 23, 42] } 
        }
      ]);

      // 2. Filas de datos
      if (isRes) {
        g.aggregatedRows.forEach((agg: any) => {
          const pType = getPersonType(agg.third) === 'JURIDICA' ? 'J' : 'N';
          body.push([
            agg.third?.name || 'Sin tercero',
            agg.third?.doc_number || 'SIN DOC',
            agg.third?.dv || '—',
            pType,
            agg.third?.address || '—',
            agg.third?.city || '—',
            fmtPdfNum(agg.base),
            agg.rate > 0 ? `${agg.rate}%` : '—',
            fmtPdfNum(agg.value)
          ]);
        });
      } else {
        g.lines.forEach((item: any) => {
          const pType = getPersonType(item.third) === 'JURIDICA' ? 'J' : 'N';
          body.push([
            item.third?.name || 'Sin tercero',
            item.third?.doc_number || 'SIN DOC',
            item.third?.dv || '—',
            pType,
            item.third?.address || '—',
            item.tx.number,
            item.tx.date,
            item.crossDocRef || '—',
            item.third?.city || '—',
            fmtPdfNum(item.base),
            item.rate > 0 ? `${item.rate}%` : '—',
            fmtPdfNum(Math.abs(item.net))
          ]);
        });
      }

      // 3. Fila de Subtotal
      if (isRes) {
        body.push([
          { content: `Total Cuenta ${g.code}:`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalBase), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250] } },
          { content: '', styles: { fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250], textColor: [17, 24, 39] } }
        ]);
      } else {
        body.push([
          { content: `Total Cuenta ${g.code}:`, colSpan: 9, styles: { halign: 'right', fontStyle: 'bold', fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalBase), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250] } },
          { content: '', styles: { fillColor: [250, 250, 250] } },
          { content: fmtPdfNum(g.totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [250, 250, 250], textColor: [17, 24, 39] } }
        ]);
      }
    });

    // 4. Fila de Total General
    const totalBases = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalBase, 0);
    const totalValor = data.accountGroups.reduce((sum: number, g: any) => sum + g.totalValor, 0);

    if (isRes) {
      body.push([
        { content: 'TOTAL GENERAL:', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [238, 242, 255] } },
        { content: fmtPdfNum(totalBases), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
        { content: '', styles: { fillColor: [238, 242, 255] } },
        { content: fmtPdfNum(totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255], textColor: [49, 46, 129] } }
      ]);
    } else {
      body.push([
        { content: 'TOTAL GENERAL:', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold', fillColor: [238, 242, 255] } },
        { content: fmtPdfNum(totalBases), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255] } },
        { content: '', styles: { fillColor: [238, 242, 255] } },
        { content: fmtPdfNum(totalValor), styles: { fontStyle: 'bold', halign: 'right', fillColor: [238, 242, 255], textColor: [49, 46, 129] } }
      ]);
    }

    // Cabeceras de autoTable
    const head = isRes 
      ? [['Nombre/Razón Social', 'Ident./Nit', 'DV', 'P.J./P.N.', 'Dirección', 'Ciudad', 'Base Gravable', '%', 'Valor']]
      : [['Nombre/Razón Social', 'Ident./Nit', 'DV', 'P.J./P.N.', 'Dirección', 'Documento', 'Fecha', 'NumExt', 'Ciudad', 'Base', '%', 'Valor']];

    // Ancho de columnas y alineación
    const columnStyles: any = {};
    if (isRes) {
      columnStyles[0] = { cellWidth: 150 }; // Nombre
      columnStyles[1] = { cellWidth: 70 };  // NIT
      columnStyles[2] = { cellWidth: 25, halign: 'center' };  // DV
      columnStyles[3] = { cellWidth: 35, halign: 'center' };  // PJ/PN
      columnStyles[4] = { cellWidth: 130 }; // Dirección
      columnStyles[5] = { cellWidth: 70 };  // Ciudad
      columnStyles[6] = { cellWidth: 65, halign: 'right' };  // Base
      columnStyles[7] = { cellWidth: 35, halign: 'right' };  // %
      columnStyles[8] = { cellWidth: 65, halign: 'right' };  // Valor
    } else {
      columnStyles[0] = { cellWidth: 110 }; // Nombre
      columnStyles[1] = { cellWidth: 55 };  // NIT
      columnStyles[2] = { cellWidth: 20, halign: 'center' };  // DV
      columnStyles[3] = { cellWidth: 25, halign: 'center' };  // PJ/PN
      columnStyles[4] = { cellWidth: 90 };  // Dirección
      columnStyles[5] = { cellWidth: 65 };  // Documento
      columnStyles[6] = { cellWidth: 50, halign: 'center' };  // Fecha
      columnStyles[7] = { cellWidth: 55 };  // NumExt
      columnStyles[8] = { cellWidth: 60 };  // Ciudad
      columnStyles[9] = { cellWidth: 55, halign: 'right' };  // Base
      columnStyles[10] = { cellWidth: 25, halign: 'right' }; // %
      columnStyles[11] = { cellWidth: 55, halign: 'right' }; // Valor
    }

    doc.autoTable({
      startY: header.startY,
      head,
      body,
      theme: 'plain',
      margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
      styles: { font: 'helvetica', fontSize: 6.2, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.4, lineWidth: { bottom: 0.25 } },
      columnStyles,
      didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
    });

    const filePrefix = isRes ? 'reporte_retenciones_consolidado' : 'reporte_retenciones_detallado';
    doc.save(`${filePrefix}_${data.fromDate}_a_${data.toDate}.pdf`);
  } catch (err: any) {
    showToast(`Error al generar PDF: ${err.message}`, 'error');
  }
}

async function renderSalesEmissionReport() {
  const host = getReportViewHost();
  if (!host) return;

  // Cargar Cajas
  const registers = await pb.listAll('pos_registers').catch(() => []);

  const today = todayStr();
  const firstDay = today.slice(0, 8) + '01';

  host.innerHTML = `
    <div class="space-y-4 text-xs">
      <!-- Filtros -->
      <div class="bg-gray-50 rounded-2xl border p-4 flex flex-wrap gap-4 items-end" style="border-color:#E2E8F0">
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Fecha Desde</label>
          <input type="date" id="rse-from" class="form-input text-xs" style="max-width:140px;background:#fff;color:#0D2137" value="${firstDay}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Fecha Hasta</label>
          <input type="date" id="rse-to" class="form-input text-xs" style="max-width:140px;background:#fff;color:#0D2137" value="${today}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Tipo de Emisión</label>
          <select id="rse-type" class="form-input text-xs" style="min-width:180px;background:#fff;color:#0D2137;height:34px">
            <option value="ALL">Todos los Tipos</option>
            <option value="POS">Tiquetes POS</option>
            <option value="STAND">Facturas Estándar / Electrónicas</option>
            <option value="PED">Pedidos de Venta (Órdenes)</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Caja POS</label>
          <select id="rse-register" class="form-input text-xs" style="min-width:180px;background:#fff;color:#0D2137;height:34px">
            <option value="ALL">Todas las Cajas</option>
            ${registers.map((r: any) => `<option value="${r.id}">${(window as any).esc(r.name)}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary text-xs" id="btn-rse-load" style="height:34px">
          <i class="fas fa-arrows-rotate mr-1"></i> Consultar
        </button>
        <button class="btn btn-outline text-xs text-green-700 font-bold" id="btn-rse-excel" style="height:34px;border-color:#166534;background:#fff" disabled>
          <i class="far fa-file-excel mr-1"></i> Excel
        </button>
        <button class="btn btn-outline text-xs text-red-700 font-bold" id="btn-rse-pdf" style="height:34px;border-color:#991B1B;background:#fff" disabled>
          <i class="far fa-file-pdf mr-1"></i> PDF
        </button>
      </div>

      <!-- Resumen / Kpis -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4" id="rse-kpis" style="display:none">
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Tiquetes POS</span>
          <span class="text-base font-extrabold text-gray-800" id="rse-kpi-pos">$ 0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Facturas Estándar</span>
          <span class="text-base font-extrabold text-gray-800" id="rse-kpi-stand">$ 0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Pedidos de Venta</span>
          <span class="text-base font-extrabold text-gray-800" id="rse-kpi-ped">$ 0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0; background:#F0F7FF">
          <span class="text-[10px] text-blue-700 uppercase font-bold block">Total General</span>
          <span class="text-base font-extrabold text-blue-900" id="rse-kpi-total">$ 0</span>
        </div>
      </div>

      <!-- Resultados -->
      <div class="border rounded-2xl overflow-hidden bg-white shadow-sm" style="border-color:#F0F0F0">
        <div id="rse-results-table" class="overflow-x-auto min-h-[150px]">
          <div class="py-10 text-center text-gray-400">Introduce los filtros y haz clic en Consultar.</div>
        </div>
      </div>
    </div>
  `;

  let currentReportData: any[] = [];

  const loadData = async () => {
    const fromVal = (document.getElementById('rse-from') as HTMLInputElement).value;
    const toVal = (document.getElementById('rse-to') as HTMLInputElement).value;
    const typeVal = (document.getElementById('rse-type') as HTMLSelectElement).value;
    const registerVal = (document.getElementById('rse-register') as HTMLSelectElement).value;

    if (!fromVal || !toVal) {
      showToast('Selecciona un rango de fechas válido.', 'warning');
      return;
    }

    const tableContainer = document.getElementById('rse-results-table') as HTMLElement;
    tableContainer.innerHTML = '<div class="py-12 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>';

    try {
      const [invoices, orders] = await Promise.all([
        pb.listAll('invoices', {
          filter: `date >= "${fromVal}" && date <= "${toVal} 23:59:59"`,
          expand: 'customer_id,warehouse_id,pos_shift_id,pos_shift_id.pos_register_id',
          sort: '-date'
        }),
        pb.listAll('sales_orders', {
          filter: `date >= "${fromVal}" && date <= "${toVal} 23:59:59"`,
          expand: 'customer_id,warehouse_id',
          sort: '-date'
        })
      ]);

      const unified: any[] = [];
      let totalPos = 0;
      let totalStand = 0;
      let totalPed = 0;

      invoices.forEach((inv: any) => {
        const total = inv.payable_total ?? inv.total ?? 0;
        const isPOS = !!inv.pos_shift_id;
        const registerId = inv.expand?.pos_shift_id?.pos_register_id || '';
        const registerName = inv.expand?.pos_shift_id?.expand?.pos_register_id?.name || '—';
        
        const mapPaymentMethod = (pm: string): string => {
          if (!pm) return '—';
          const val = String(pm).toUpperCase();
          if (val === 'EFECTIVO') return 'Efectivo';
          if (val === 'TRANSFERENCIA') return 'Transferencia';
          if (val === 'CREDITO') return 'Crédito';
          if (val === 'MIXTO') return 'Mixto';
          return pm;
        };

        if (isPOS) {
          totalPos += total;
        } else {
          totalStand += total;
        }

        unified.push({
          id: inv.id,
          date: inv.date.slice(0, 10),
          time: inv.created ? new Date(inv.created).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—',
          typeCode: isPOS ? 'POS' : 'STAND',
          typeName: isPOS ? 'Tiquete POS' : 'Factura Estándar',
          number: inv.number,
          paymentMethod: mapPaymentMethod(inv.payment_method || ''),
          customerName: inv.expand?.customer_id?.name || 'Consumidor Final',
          customerDoc: inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '—',
          warehouseName: inv.expand?.warehouse_id?.name || '—',
          registerId: registerId,
          registerName: registerName,
          subtotal: inv.subtotal || 0,
          iva: inv.iva_total || 0,
          total: total,
          status: inv.status === 'posted' ? 'Contabilizado' : (inv.status === 'draft' ? 'Borrador' : 'Anulado')
        });
      });

      orders.forEach((ord: any) => {
        const total = ord.total ?? 0;
        totalPed += total;

        unified.push({
          id: ord.id,
          date: ord.date.slice(0, 10),
          time: ord.created ? new Date(ord.created).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—',
          typeCode: 'PED',
          typeName: 'Pedido de Venta',
          number: ord.number,
          paymentMethod: '—',
          customerName: ord.expand?.customer_id?.name || 'Cliente',
          customerDoc: ord.expand?.customer_id?.doc_number || ord.expand?.customer_id?.nit || '—',
          warehouseName: ord.expand?.warehouse_id?.name || '—',
          registerId: '',
          registerName: '—',
          subtotal: ord.subtotal || total,
          iva: ord.iva_total || 0,
          total: total,
          status: ord.status === 'paid' ? 'Facturado' : (ord.status === 'pending' ? 'Pendiente' : (ord.status === 'cancelled' ? 'Cancelado' : ord.status))
        });
      });

      let filtered = unified;
      if (typeVal !== 'ALL') {
        filtered = unified.filter(u => u.typeCode === typeVal);
      }
      if (registerVal !== 'ALL') {
        filtered = filtered.filter(u => u.registerId === registerVal);
      }

      currentReportData = filtered;

      document.getElementById('rse-kpis')!.style.display = 'grid';
      document.getElementById('rse-kpi-pos')!.textContent = fmt(totalPos);
      document.getElementById('rse-kpi-stand')!.textContent = fmt(totalStand);
      document.getElementById('rse-kpi-ped')!.textContent = fmt(totalPed);
      document.getElementById('rse-kpi-total')!.textContent = fmt(totalPos + totalStand + totalPed);

      (document.getElementById('btn-rse-excel') as HTMLButtonElement).disabled = filtered.length === 0;
      (document.getElementById('btn-rse-pdf') as HTMLButtonElement).disabled = filtered.length === 0;

      if (filtered.length === 0) {
        tableContainer.innerHTML = '<div class="py-12 text-center text-gray-500 font-bold">No se encontraron ventas para este rango de fechas.</div>';
        return;
      }

      tableContainer.innerHTML = `
        <table class="data-table w-full text-xs">
          <thead>
            <tr style="background:#F4F8FF; font-weight:bold">
              <th class="text-left py-2 px-3">Fecha</th>
              <th class="text-left py-2 px-3">Hora</th>
              <th class="text-left py-2 px-3">Caja</th>
              <th class="text-left py-2 px-3">Tipo de Emisión</th>
              <th class="text-left py-2 px-3">Forma de Pago</th>
              <th class="text-left py-2 px-3">Número</th>
              <th class="text-left py-2 px-3">Cliente</th>
              <th class="text-left py-2 px-3">Bodega</th>
              <th class="text-right py-2 px-3">Subtotal</th>
              <th class="text-right py-2 px-3">IVA</th>
              <th class="text-right py-2 px-3">Total</th>
              <th class="text-center py-2 px-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(f => `
              <tr class="border-b hover:bg-gray-50" style="border-color:#F0F0F0">
                <td class="py-2.5 px-3 font-semibold text-gray-700">${f.date}</td>
                <td class="py-2.5 px-3 text-gray-500">${f.time}</td>
                <td class="py-2.5 px-3 text-gray-600 font-medium">${esc(f.registerName)}</td>
                <td class="py-2.5 px-3">
                  <span class="badge ${f.typeCode === 'POS' ? 'badge-blue' : (f.typeCode === 'STAND' ? 'badge-orange' : 'badge-green')}">
                    ${f.typeName}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-gray-600 font-medium">${esc(f.paymentMethod)}</td>
                <td class="py-2.5 px-3 font-bold">${esc(f.number)}</td>
                <td class="py-2.5 px-3">${esc(f.customerName)} <span class="text-[10px] text-gray-400">(${esc(f.customerDoc)})</span></td>
                <td class="py-2.5 px-3 text-gray-600">${esc(f.warehouseName)}</td>
                <td class="py-2.5 px-3 text-right font-semibold">${fmt(f.subtotal)}</td>
                <td class="py-2.5 px-3 text-right text-gray-500">${fmt(f.iva)}</td>
                <td class="py-2.5 px-3 text-right font-bold text-blue-800">${fmt(f.total)}</td>
                <td class="py-2.5 px-3 text-center">
                  <span class="badge py-0.5" style="font-size:9px; background:${f.status === 'Contabilizado' || f.status === 'Facturado' ? '#EEFBF7' : '#FFF5F5'}; color:${f.status === 'Contabilizado' || f.status === 'Facturado' ? '#065F46' : '#9B1C1C'}">
                    ${f.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err: any) {
      showToast('Error cargando reporte: ' + err.message, 'error');
      tableContainer.innerHTML = `<div class="py-12 text-center text-red-500 font-bold">Error: ${esc(err.message)}</div>`;
    }
  };

  document.getElementById('btn-rse-load')?.addEventListener('click', loadData);

  document.getElementById('btn-rse-excel')?.addEventListener('click', () => {
    if (!currentReportData.length) return;
    const headers = [
      { label: 'Fecha', key: 'date' },
      { label: 'Hora', key: 'time' },
      { label: 'Caja', key: 'registerName' },
      { label: 'Tipo de Emisión', key: 'typeName' },
      { label: 'Forma de Pago', key: 'paymentMethod' },
      { label: 'Número', key: 'number' },
      { label: 'Cliente', key: 'customerName' },
      { label: 'Documento Cliente', key: 'customerDoc' },
      { label: 'Bodega', key: 'warehouseName' },
      { label: 'Subtotal', key: 'subtotal' },
      { label: 'IVA', key: 'iva' },
      { label: 'Total', key: 'total' },
      { label: 'Estado', key: 'status' }
    ];
    exportToExcel(currentReportData, headers, 'Reporte_Ventas_Emisiones');
  });

  document.getElementById('btn-rse-pdf')?.addEventListener('click', async () => {
    if (!currentReportData.length) return;
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;

    try {
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const headerCtx = await getPdfHeaderContext();
      const fromVal = (document.getElementById('rse-from') as HTMLInputElement).value;
      const toVal = (document.getElementById('rse-to') as HTMLInputElement).value;

      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Reporte de Ventas por Tipo de Emisión',
        subtitles: [`Desde: ${fromVal} — Hasta: ${toVal}`]
      });

      const body = currentReportData.map(f => [
        f.date,
        f.time,
        f.registerName,
        f.typeName,
        f.paymentMethod,
        f.number,
        `${f.customerName} (${f.customerDoc})`,
        f.warehouseName,
        fmtPdfNum(f.subtotal),
        fmtPdfNum(f.iva),
        fmtPdfNum(f.total),
        f.status
      ]);

      doc.autoTable({
        startY: header.startY,
        head: [['Fecha', 'Hora', 'Caja', 'Tipo', 'Forma Pago', 'Número', 'Cliente', 'Bodega', 'Subtotal', 'IVA', 'Total', 'Estado']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 },
          4: { cellWidth: 45 },
          5: { cellWidth: 45 },
          6: { cellWidth: 90 },
          7: { cellWidth: 45 },
          8: { cellWidth: 45, halign: 'right' },
          9: { cellWidth: 35, halign: 'right' },
          10: { cellWidth: 50, halign: 'right' },
          11: { cellWidth: 40, halign: 'center' },
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`reporte_ventas_emisiones_${fromVal}_a_${toVal}.pdf`);
    } catch (err: any) {
      showToast('Error generando PDF: ' + err.message, 'error');
    }
  });
}

// NUEVO REPORTE: VENTAS ACUMULADAS POR PRODUCTO
async function renderSalesProductsReport() {
  const host = getReportViewHost();
  if (!host) return;

  // Cargar Cajas
  const registers = await pb.listAll('pos_registers').catch(() => []);

  const today = todayStr();
  const firstDay = today.slice(0, 8) + '01';

  host.innerHTML = `
    <div class="space-y-4 text-xs">
      <!-- Filtros -->
      <div class="bg-gray-50 rounded-2xl border p-4 flex flex-wrap gap-4 items-end" style="border-color:#E2E8F0">
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Fecha Desde</label>
          <input type="date" id="rsp-from" class="form-input text-xs" style="max-width:140px;background:#fff;color:#0D2137" value="${firstDay}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Fecha Hasta</label>
          <input type="date" id="rsp-to" class="form-input text-xs" style="max-width:140px;background:#fff;color:#0D2137" value="${today}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Tipo de Emisión</label>
          <select id="rsp-type" class="form-input text-xs" style="min-width:180px;background:#fff;color:#0D2137;height:34px">
            <option value="ALL">Todos los Tipos</option>
            <option value="POS">Tiquetes POS</option>
            <option value="STAND">Facturas Estándar / Electrónicas</option>
            <option value="PED">Pedidos de Venta (Órdenes)</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Caja POS</label>
          <select id="rsp-register" class="form-input text-xs" style="min-width:180px;background:#fff;color:#0D2137;height:34px">
            <option value="ALL">Todas las Cajas</option>
            ${registers.map((r: any) => `<option value="${r.id}">${(window as any).esc(r.name)}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary text-xs" id="btn-rsp-load" style="height:34px">
          <i class="fas fa-arrows-rotate mr-1"></i> Consultar
        </button>
        <button class="btn btn-outline text-xs text-green-700 font-bold" id="btn-rsp-excel" style="height:34px;border-color:#166534;background:#fff" disabled>
          <i class="far fa-file-excel mr-1"></i> Excel
        </button>
        <button class="btn btn-outline text-xs text-red-700 font-bold" id="btn-rsp-pdf" style="height:34px;border-color:#991B1B;background:#fff" disabled>
          <i class="far fa-file-pdf mr-1"></i> PDF
        </button>
      </div>

      <!-- Resumen / Kpis -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4" id="rsp-kpis" style="display:none">
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Unidades Vendidas</span>
          <span class="text-base font-extrabold text-gray-800" id="rsp-kpi-units">0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Subtotal</span>
          <span class="text-base font-extrabold text-gray-800" id="rsp-kpi-subtotal">$ 0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">IVA</span>
          <span class="text-base font-extrabold text-gray-800" id="rsp-kpi-iva">$ 0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0; background:#F0F7FF">
          <span class="text-[10px] text-blue-700 uppercase font-bold block">Total General</span>
          <span class="text-base font-extrabold text-blue-900" id="rsp-kpi-total">$ 0</span>
        </div>
      </div>

      <!-- Resultados -->
      <div class="border rounded-2xl overflow-hidden bg-white shadow-sm" style="border-color:#F0F0F0">
        <div id="rsp-results-table" class="overflow-x-auto min-h-[150px]">
          <div class="py-10 text-center text-gray-400">Introduce los filtros y haz clic en Consultar.</div>
        </div>
      </div>
    </div>
  `;

  let currentReportData: any[] = [];

  const loadData = async () => {
    const fromVal = (document.getElementById('rsp-from') as HTMLInputElement).value;
    const toVal = (document.getElementById('rsp-to') as HTMLInputElement).value;
    const typeVal = (document.getElementById('rsp-type') as HTMLSelectElement).value;
    const registerVal = (document.getElementById('rsp-register') as HTMLSelectElement).value;

    if (!fromVal || !toVal) {
      showToast('Selecciona un rango de fechas válido.', 'warning');
      return;
    }

    const tableContainer = document.getElementById('rsp-results-table') as HTMLElement;
    tableContainer.innerHTML = '<div class="py-12 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>';

    try {
      const fetchInvoices = (typeVal === 'ALL' || typeVal === 'POS' || typeVal === 'STAND');
      const fetchOrders = (typeVal === 'ALL' || typeVal === 'PED') && registerVal === 'ALL';

      const [invoices, orders] = await Promise.all([
        fetchInvoices ? pb.listAll('invoices', {
          filter: `date >= "${fromVal}" && date <= "${toVal} 23:59:59"`,
          expand: 'customer_id,warehouse_id,pos_shift_id,pos_shift_id.pos_register_id',
          sort: '-date'
        }) : Promise.resolve([]),
        fetchOrders ? pb.listAll('sales_orders', {
          filter: `date >= "${fromVal}" && date <= "${toVal} 23:59:59"`,
          expand: 'customer_id,warehouse_id',
          sort: '-date'
        }) : Promise.resolve([])
      ]);

      const unified: any[] = [];

      invoices.forEach((inv: any) => {
        const isPOS = !!inv.pos_shift_id;
        const registerId = inv.expand?.pos_shift_id?.pos_register_id || '';
        
        unified.push({
          id: inv.id,
          typeCode: isPOS ? 'POS' : 'STAND',
          registerId: registerId,
        });
      });

      orders.forEach((ord: any) => {
        unified.push({
          id: ord.id,
          typeCode: 'PED',
          registerId: '',
        });
      });

      let filtered = unified;
      if (typeVal !== 'ALL') {
        filtered = unified.filter(u => u.typeCode === typeVal);
      }
      if (registerVal !== 'ALL') {
        filtered = filtered.filter(u => u.registerId === registerVal);
      }

      const filteredInvoiceIds = filtered.filter(u => u.typeCode === 'POS' || u.typeCode === 'STAND').map(u => u.id);
      const filteredOrderIds = filtered.filter(u => u.typeCode === 'PED').map(u => u.id);

      if (filteredInvoiceIds.length === 0 && filteredOrderIds.length === 0) {
        document.getElementById('rsp-kpis')!.style.display = 'none';
        (document.getElementById('btn-rsp-excel') as HTMLButtonElement).disabled = true;
        (document.getElementById('btn-rsp-pdf') as HTMLButtonElement).disabled = true;
        tableContainer.innerHTML = '<div class="py-12 text-center text-gray-500 font-bold">No se encontraron ventas para este rango de fechas.</div>';
        currentReportData = [];
        return;
      }

      const invoiceLines: any[] = [];
      if (filteredInvoiceIds.length > 0) {
        for (let i = 0; i < filteredInvoiceIds.length; i += 30) {
          const chunk = filteredInvoiceIds.slice(i, i + 30);
          const filter = chunk.map(id => `invoice_id="${id}"`).join(' || ');
          const chunkLines = await pb.listAll('invoice_lines', {
            filter: `(${filter})`,
            expand: 'product_id'
          });
          invoiceLines.push(...chunkLines);
        }
      }

      const orderLines: any[] = [];
      if (filteredOrderIds.length > 0) {
        for (let i = 0; i < filteredOrderIds.length; i += 30) {
          const chunk = filteredOrderIds.slice(i, i + 30);
          const filter = chunk.map(id => `sales_order_id="${id}"`).join(' || ');
          const chunkLines = await pb.listAll('sales_order_lines', {
            filter: `(${filter})`,
            expand: 'product_id'
          });
          orderLines.push(...chunkLines);
        }
      }

      const productMap = new Map();
      let totalQty = 0;
      let totalSubtotal = 0;
      let totalIva = 0;
      let totalGeneral = 0;
      
      const addLine = (line: any) => {
        const prod = line.expand?.product_id;
        const prodId = line.product_id || 'SIN_PRODUCTO';
        const prodCode = prod?.code || '—';
        const prodName = prod?.name || line.description || 'Línea de Venta';
        const prodUnit = prod?.unit || 'UND';
        const prodCategory = prod?.categoria || 'General';

        const qty = Number(line.qty || 0);
        const subtotal = Number(line.subtotal || 0);
        const iva = Number(line.iva_amount || 0);
        const total = Number(line.total || 0);

        const groupKey = prodId !== 'SIN_PRODUCTO' ? prodId : `SP_${prodName}`;

        if (!productMap.has(groupKey)) {
          productMap.set(groupKey, {
            productId: prodId,
            productCode: prodCode,
            productName: prodName,
            productUnit: prodUnit,
            productCategory: prodCategory,
            qty: 0,
            subtotal: 0,
            iva: 0,
            total: 0
          });
        }

        const item = productMap.get(groupKey);
        item.qty += qty;
        item.subtotal += subtotal;
        item.iva += iva;
        item.total += total;

        totalQty += qty;
        totalSubtotal += subtotal;
        totalIva += iva;
        totalGeneral += total;
      };

      invoiceLines.forEach(addLine);
      orderLines.forEach(addLine);

      const productsList = Array.from(productMap.values());
      // Ordenar por total de ventas descendente
      productsList.sort((a, b) => b.total - a.total);

      currentReportData = productsList;

      document.getElementById('rsp-kpis')!.style.display = 'grid';
      document.getElementById('rsp-kpi-units')!.textContent = fmtN(totalQty);
      document.getElementById('rsp-kpi-subtotal')!.textContent = fmt(totalSubtotal);
      document.getElementById('rsp-kpi-iva')!.textContent = fmt(totalIva);
      document.getElementById('rsp-kpi-total')!.textContent = fmt(totalGeneral);

      (document.getElementById('btn-rsp-excel') as HTMLButtonElement).disabled = productsList.length === 0;
      (document.getElementById('btn-rsp-pdf') as HTMLButtonElement).disabled = productsList.length === 0;

      if (productsList.length === 0) {
        tableContainer.innerHTML = '<div class="py-12 text-center text-gray-500 font-bold">No se encontraron productos vendidos para este rango de fechas.</div>';
        return;
      }

      tableContainer.innerHTML = `
        <table class="data-table w-full text-xs">
          <thead>
            <tr style="background:#F4F8FF; font-weight:bold">
              <th class="text-left py-2 px-3">Código/SKU</th>
              <th class="text-left py-2 px-3">Producto</th>
              <th class="text-left py-2 px-3">Categoría</th>
              <th class="text-center py-2 px-3">Unidad</th>
              <th class="text-right py-2 px-3">Cant. Vendida</th>
              <th class="text-right py-2 px-3">Precio Prom.</th>
              <th class="text-right py-2 px-3">Subtotal</th>
              <th class="text-right py-2 px-3">IVA</th>
              <th class="text-right py-2 px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productsList.map(p => {
              const avgPrice = p.qty > 0 ? p.subtotal / p.qty : 0;
              return `
                <tr class="border-b hover:bg-gray-50" style="border-color:#F0F0F0">
                  <td class="py-2.5 px-3 font-mono text-gray-700">${esc(p.productCode)}</td>
                  <td class="py-2.5 px-3 font-semibold text-gray-800">${esc(p.productName)}</td>
                  <td class="py-2.5 px-3 text-gray-600">${esc(p.productCategory)}</td>
                  <td class="py-2.5 px-3 text-center text-gray-500">${esc(p.productUnit)}</td>
                  <td class="py-2.5 px-3 text-right font-semibold text-gray-900 font-mono">${fmtN(p.qty)}</td>
                  <td class="py-2.5 px-3 text-right text-gray-600 font-mono">${fmt(avgPrice)}</td>
                  <td class="py-2.5 px-3 text-right font-medium font-mono text-gray-700">${fmt(p.subtotal)}</td>
                  <td class="py-2.5 px-3 text-right text-gray-500 font-mono">${fmt(p.iva)}</td>
                  <td class="py-2.5 px-3 text-right font-bold text-blue-800 font-mono">${fmt(p.total)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background:#F9FAFB" class="font-bold">
              <td colspan="4" class="py-2.5 px-3 text-left">Total General</td>
              <td class="py-2.5 px-3 text-right font-mono">${fmtN(totalQty)}</td>
              <td class="py-2.5 px-3 text-right">—</td>
              <td class="py-2.5 px-3 text-right font-mono">${fmt(totalSubtotal)}</td>
              <td class="py-2.5 px-3 text-right font-mono">${fmt(totalIva)}</td>
              <td class="py-2.5 px-3 text-right font-mono text-blue-900">${fmt(totalGeneral)}</td>
            </tr>
          </tfoot>
        </table>
      `;
    } catch (err: any) {
      showToast('Error cargando reporte: ' + err.message, 'error');
      tableContainer.innerHTML = `<div class="py-12 text-center text-red-500 font-bold">Error: ${esc(err.message)}</div>`;
    }
  };

  document.getElementById('btn-rsp-load')?.addEventListener('click', loadData);

  document.getElementById('btn-rsp-excel')?.addEventListener('click', () => {
    if (!currentReportData.length) return;
    const headers = [
      { label: 'Código/SKU', key: 'productCode' },
      { label: 'Producto', key: 'productName' },
      { label: 'Unidad', key: 'productUnit' },
      { label: 'Categoría', key: 'productCategory' },
      { label: 'Cantidad Vendida', key: 'qty' },
      { label: 'Precio Promedio', key: 'avgPrice' },
      { label: 'Subtotal', key: 'subtotal' },
      { label: 'IVA', key: 'iva' },
      { label: 'Total', key: 'total' }
    ];
    
    const formattedData = currentReportData.map(p => ({
      ...p,
      avgPrice: p.qty > 0 ? p.subtotal / p.qty : 0
    }));

    exportToExcel(formattedData, headers, 'Reporte_Ventas_Productos_Acumulado');
  });

  document.getElementById('btn-rsp-pdf')?.addEventListener('click', async () => {
    if (!currentReportData.length) return;
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;

    try {
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const headerCtx = await getPdfHeaderContext();
      const fromVal = (document.getElementById('rsp-from') as HTMLInputElement).value;
      const toVal = (document.getElementById('rsp-to') as HTMLInputElement).value;

      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Reporte de Ventas por Producto (Acumulado)',
        subtitles: [`Desde: ${fromVal} — Hasta: ${toVal}`]
      });

      const body = currentReportData.map(p => {
        const avgPrice = p.qty > 0 ? p.subtotal / p.qty : 0;
        return [
          p.productCode,
          p.productName,
          p.productCategory,
          p.productUnit,
          fmtN(p.qty),
          fmtPdfNum(avgPrice),
          fmtPdfNum(p.subtotal),
          fmtPdfNum(p.iva),
          fmtPdfNum(p.total)
        ];
      });

      const totalQty = currentReportData.reduce((s, p) => s + p.qty, 0);
      const totalSubtotal = currentReportData.reduce((s, p) => s + p.subtotal, 0);
      const totalIva = currentReportData.reduce((s, p) => s + p.iva, 0);
      const totalGeneral = currentReportData.reduce((s, p) => s + p.total, 0);

      body.push([
        'TOTAL GENERAL',
        '',
        '',
        '',
        fmtN(totalQty),
        '',
        fmtPdfNum(totalSubtotal),
        fmtPdfNum(totalIva),
        fmtPdfNum(totalGeneral)
      ]);

      doc.autoTable({
        startY: header.startY,
        head: [['Código/SKU', 'Producto', 'Categoría', 'Unidad', 'Cant.', 'Precio Prom.', 'Subtotal', 'IVA', 'Total']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 155 },
          2: { cellWidth: 70 },
          3: { cellWidth: 35, halign: 'center' },
          4: { cellWidth: 40, halign: 'right' },
          5: { cellWidth: 50, halign: 'right' },
          6: { cellWidth: 55, halign: 'right' },
          7: { cellWidth: 45, halign: 'right' },
          8: { cellWidth: 60, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const isTotal = data.row.index === body.length - 1;
          if (isTotal) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.2 };
            data.cell.styles.lineColor = [13, 33, 55];
          }
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`reporte_ventas_productos_${fromVal}_a_${toVal}.pdf`);
    } catch (err: any) {
      showToast('Error generando PDF: ' + err.message, 'error');
    }
  });
}

// NUEVO REPORTE: HORARIOS DE CALOR DE VENTAS (HEATMAP)
async function renderSalesHeatmapReport() {
  const host = getReportViewHost();
  if (!host) return;

  // Cargar Cajas
  const registers = await pb.listAll('pos_registers').catch(() => []);

  const today = todayStr();
  const firstDay = today.slice(0, 8) + '01';

  host.innerHTML = `
    <div class="space-y-4 text-xs">
      <!-- Filtros -->
      <div class="bg-gray-50 rounded-2xl border p-4 flex flex-wrap gap-4 items-end" style="border-color:#E2E8F0">
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Fecha Desde</label>
          <input type="date" id="rsh-from" class="form-input text-xs" style="max-width:140px;background:#fff;color:#0D2137" value="${firstDay}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Fecha Hasta</label>
          <input type="date" id="rsh-to" class="form-input text-xs" style="max-width:140px;background:#fff;color:#0D2137" value="${today}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Tipo de Emisión</label>
          <select id="rsh-type" class="form-input text-xs" style="min-width:160px;background:#fff;color:#0D2137;height:34px">
            <option value="ALL">Todos los Tipos</option>
            <option value="POS">Tiquetes POS</option>
            <option value="STAND">Facturas Estándar / Electrónicas</option>
            <option value="PED">Pedidos de Venta (Órdenes)</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Caja POS</label>
          <select id="rsh-register" class="form-input text-xs" style="min-width:160px;background:#fff;color:#0D2137;height:34px">
            <option value="ALL">Todas las Cajas</option>
            ${registers.map((r: any) => `<option value="${r.id}">${(window as any).esc(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-xs">Métrica</label>
          <select id="rsh-metric" class="form-input text-xs" style="min-width:160px;background:#fff;color:#0D2137;height:34px">
            <option value="count">Cantidad de Ventas (Transacciones)</option>
            <option value="amount">Valor Total Facturado ($)</option>
          </select>
        </div>
        <button class="btn btn-primary text-xs" id="btn-rsh-load" style="height:34px">
          <i class="fas fa-arrows-rotate mr-1"></i> Consultar
        </button>
        <button class="btn btn-outline text-xs text-green-700 font-bold" id="btn-rsh-excel" style="height:34px;border-color:#166534;background:#fff" disabled>
          <i class="far fa-file-excel mr-1"></i> Excel
        </button>
        <button class="btn btn-outline text-xs text-red-700 font-bold" id="btn-rsh-pdf" style="height:34px;border-color:#991B1B;background:#fff" disabled>
          <i class="far fa-file-pdf mr-1"></i> PDF
        </button>
      </div>

      <!-- Resumen / Kpis -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4" id="rsh-kpis" style="display:none">
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Transacciones Totales</span>
          <span class="text-base font-extrabold text-gray-800" id="rsh-kpi-total-count">0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0">
          <span class="text-[10px] text-gray-500 uppercase font-bold block">Valor Total Facturado</span>
          <span class="text-base font-extrabold text-gray-800" id="rsh-kpi-total-amount">$ 0</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0; background:#FFFBEB">
          <span class="text-[10px] text-amber-700 uppercase font-bold block">Día Pico</span>
          <span class="text-base font-extrabold text-amber-900" id="rsh-kpi-peak-day">—</span>
        </div>
        <div class="bg-white rounded-xl border p-3 text-center" style="border-color:#E2E8F0; background:#F0F7FF">
          <span class="text-[10px] text-blue-700 uppercase font-bold block">Hora Pico</span>
          <span class="text-base font-extrabold text-blue-900" id="rsh-kpi-peak-hour">—</span>
        </div>
      </div>

      <!-- Resultados Heatmap -->
      <div class="border rounded-2xl overflow-hidden bg-white shadow-sm" style="border-color:#F0F0F0">
        <div id="rsh-results-table" class="overflow-x-auto min-h-[150px] p-4 bg-white">
          <div class="py-10 text-center text-gray-400">Introduce los filtros y haz clic en Consultar.</div>
        </div>
      </div>
    </div>
  `;

  let currentReportData: { matrix: any[][], maxVal: number, metricVal: string } | null = null;
  const daysOfWeekLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const loadData = async () => {
    const fromVal = (document.getElementById('rsh-from') as HTMLInputElement).value;
    const toVal = (document.getElementById('rsh-to') as HTMLInputElement).value;
    const typeVal = (document.getElementById('rsh-type') as HTMLSelectElement).value;
    const registerVal = (document.getElementById('rsh-register') as HTMLSelectElement).value;
    const metricVal = (document.getElementById('rsh-metric') as HTMLSelectElement).value;

    if (!fromVal || !toVal) {
      showToast('Selecciona un rango de fechas válido.', 'warning');
      return;
    }

    const tableContainer = document.getElementById('rsh-results-table') as HTMLElement;
    tableContainer.innerHTML = '<div class="py-12 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando horarios de calor...</div>';

    try {
      const fetchInvoices = (typeVal === 'ALL' || typeVal === 'POS' || typeVal === 'STAND');
      const fetchOrders = (typeVal === 'ALL' || typeVal === 'PED') && registerVal === 'ALL';

      const [invoices, orders] = await Promise.all([
        fetchInvoices ? pb.listAll('invoices', {
          filter: `date >= "${fromVal}" && date <= "${toVal} 23:59:59"`,
          expand: 'pos_shift_id'
        }) : Promise.resolve([]),
        fetchOrders ? pb.listAll('sales_orders', {
          filter: `date >= "${fromVal}" && date <= "${toVal} 23:59:59"`
        }) : Promise.resolve([])
      ]);

      const unified: any[] = [];
      invoices.forEach((inv: any) => {
        const isPOS = !!inv.pos_shift_id;
        const registerId = inv.expand?.pos_shift_id?.pos_register_id || '';
        unified.push({
          typeCode: isPOS ? 'POS' : 'STAND',
          registerId: registerId,
          created: inv.created,
          total: inv.payable_total ?? inv.total ?? 0
        });
      });

      orders.forEach((ord: any) => {
        unified.push({
          typeCode: 'PED',
          registerId: '',
          created: ord.created,
          total: ord.total ?? 0
        });
      });

      let filtered = unified;
      if (typeVal !== 'ALL') {
        filtered = unified.filter(u => u.typeCode === typeVal);
      }
      if (registerVal !== 'ALL') {
        filtered = filtered.filter(u => u.registerId === registerVal);
      }

      if (filtered.length === 0) {
        document.getElementById('rsh-kpis')!.style.display = 'none';
        (document.getElementById('btn-rsh-excel') as HTMLButtonElement).disabled = true;
        (document.getElementById('btn-rsh-pdf') as HTMLButtonElement).disabled = true;
        tableContainer.innerHTML = '<div class="py-12 text-center text-gray-500 font-bold">No se encontraron ventas para este rango de fechas.</div>';
        currentReportData = null;
        return;
      }

      // Inicializar matriz de 24 horas x 7 días
      const matrix = Array.from({ length: 24 }, () =>
        Array.from({ length: 7 }, () => ({ count: 0, amount: 0 }))
      );

      let totalCount = 0;
      let totalAmount = 0;

      filtered.forEach(item => {
        if (!item.created) return;
        const localDate = new Date(item.created);
        const dayOfWeek = (localDate.getDay() + 6) % 7; // Lunes = 0, ..., Domingo = 6
        const hour = localDate.getHours(); // 0 a 23

        matrix[hour][dayOfWeek].count += 1;
        matrix[hour][dayOfWeek].amount += item.total;
        
        totalCount += 1;
        totalAmount += item.total;
      });

      // Encontrar el valor máximo para calcular opacidades
      let maxVal = 0;
      for (let h = 0; h < 24; h++) {
        for (let d = 0; d < 7; d++) {
          const val = metricVal === 'count' ? matrix[h][d].count : matrix[h][d].amount;
          if (val > maxVal) maxVal = val;
        }
      }

      // Calcular Día Pico
      const dayTotals = Array(7).fill(0);
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          dayTotals[d] += metricVal === 'count' ? matrix[h][d].count : matrix[h][d].amount;
        }
      }
      let peakDayIdx = 0;
      let peakDayVal = -1;
      dayTotals.forEach((val, idx) => {
        if (val > peakDayVal) {
          peakDayVal = val;
          peakDayIdx = idx;
        }
      });

      // Calcular Hora Pico
      const hourTotals = Array(24).fill(0);
      for (let h = 0; h < 24; h++) {
        for (let d = 0; d < 7; d++) {
          hourTotals[h] += metricVal === 'count' ? matrix[h][d].count : matrix[h][d].amount;
        }
      }
      let peakHourIdx = 0;
      let peakHourVal = -1;
      hourTotals.forEach((val, idx) => {
        if (val > peakHourVal) {
          peakHourVal = val;
          peakHourIdx = idx;
        }
      });

      // Mostrar KPIs
      document.getElementById('rsh-kpis')!.style.display = 'grid';
      document.getElementById('rsh-kpi-total-count')!.textContent = fmtN(totalCount);
      document.getElementById('rsh-kpi-total-amount')!.textContent = fmt(totalAmount);
      document.getElementById('rsh-kpi-peak-day')!.textContent = daysOfWeekLabels[peakDayIdx];
      document.getElementById('rsh-kpi-peak-hour')!.textContent = `${String(peakHourIdx).padStart(2, '0')}:00`;

      currentReportData = { matrix, maxVal, metricVal };

      (document.getElementById('btn-rsh-excel') as HTMLButtonElement).disabled = false;
      (document.getElementById('btn-rsh-pdf') as HTMLButtonElement).disabled = false;

      // Dibujar la tabla Heatmap
      let tableHtml = `
        <table class="data-table border-collapse w-full text-center text-xs font-mono" style="table-layout:fixed">
          <thead>
            <tr style="background:#F8FAFC">
              <th class="py-2 px-1 border font-bold" style="width:70px;color:#0D2137">Hora</th>
              ${daysOfWeekLabels.map(day => `<th class="py-2 px-1 border font-bold text-gray-700">${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      for (let h = 0; h < 24; h++) {
        tableHtml += `
          <tr class="border-b" style="border-color:#F0F0F0">
            <td class="py-1.5 px-1 border font-bold bg-slate-50 text-slate-600 text-center" style="width:70px">${String(h).padStart(2, '0')}:00</td>
        `;

        for (let d = 0; d < 7; d++) {
          const count = matrix[h][d].count;
          const amount = matrix[h][d].amount;
          const val = metricVal === 'count' ? count : amount;

          let cellStyle = '';
          let cellText = '—';
          if (val > 0) {
            const ratio = maxVal > 0 ? val / maxVal : 0;
            const opacity = 0.05 + 0.95 * ratio;
            const bg = `hsla(215, 80%, 40%, ${opacity.toFixed(2)})`;
            const color = ratio > 0.45 ? '#ffffff' : '#0D2137';
            cellStyle = `style="background:${bg};color:${color};font-weight:${ratio > 0.45 ? 'bold' : 'normal'}"`;
            cellText = metricVal === 'count' ? fmtN(count) : fmt(amount);
          }

          tableHtml += `<td class="py-1.5 px-1 border text-center transition-colors duration-150" ${cellStyle}>${cellText}</td>`;
        }

        tableHtml += `</tr>`;
      }

      tableHtml += `
          </tbody>
        </table>
      `;

      tableContainer.innerHTML = tableHtml;
    } catch (err: any) {
      showToast('Error cargando heatmap: ' + err.message, 'error');
      tableContainer.innerHTML = `<div class="py-12 text-center text-red-500 font-bold">Error: ${esc(err.message)}</div>`;
    }
  };

  document.getElementById('btn-rsh-load')?.addEventListener('click', loadData);

  document.getElementById('btn-rsh-excel')?.addEventListener('click', () => {
    if (!currentReportData) return;
    const { matrix, metricVal } = currentReportData;

    const exportRows = [];
    for (let h = 0; h < 24; h++) {
      const row: any = { hora: `${String(h).padStart(2, '0')}:00` };
      for (let d = 0; d < 7; d++) {
        const val = metricVal === 'count' ? matrix[h][d].count : matrix[h][d].amount;
        row[daysOfWeekLabels[d].toLowerCase()] = val;
      }
      exportRows.push(row);
    }

    const headers = [
      { label: 'Hora', key: 'hora' },
      { label: 'Lunes', key: 'lunes' },
      { label: 'Martes', key: 'martes' },
      { label: 'Miércoles', key: 'miércoles' },
      { label: 'Jueves', key: 'jueves' },
      { label: 'Viernes', key: 'viernes' },
      { label: 'Sábado', key: 'sábado' },
      { label: 'Domingo', key: 'domingo' }
    ];

    exportToExcel(exportRows, headers, `Reporte_Horarios_Calor_Ventas_${metricVal}`);
  });

  document.getElementById('btn-rsh-pdf')?.addEventListener('click', async () => {
    if (!currentReportData) return;
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;

    try {
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const headerCtx = await getPdfHeaderContext();
      const fromVal = (document.getElementById('rsh-from') as HTMLInputElement).value;
      const toVal = (document.getElementById('rsh-to') as HTMLInputElement).value;
      const { matrix, maxVal, metricVal } = currentReportData;

      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Reporte de Horarios de Calor de Ventas',
        subtitles: [
          `Desde: ${fromVal} — Hasta: ${toVal}`,
          `Métrica: ${metricVal === 'count' ? 'Cantidad de Ventas' : 'Valor Total de Ventas'}`
        ]
      });

      const body = [];
      const matrixValues = [];

      for (let h = 0; h < 24; h++) {
        const row = [`${String(h).padStart(2, '0')}:00`];
        const valRow = [];
        for (let d = 0; d < 7; d++) {
          const val = metricVal === 'count' ? matrix[h][d].count : matrix[h][d].amount;
          valRow.push(val);
          row.push(val > 0 ? (metricVal === 'count' ? fmtN(val) : fmtPdfNum(val)) : '—');
        }
        body.push(row);
        matrixValues.push(valRow);
      }

      doc.autoTable({
        startY: header.startY,
        head: [['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']],
        body,
        theme: 'grid',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 6.8, textColor: [55, 55, 55], cellPadding: 2.2, lineWidth: 0.25, lineColor: [220, 220, 220], overflow: 'linebreak', halign: 'center' },
        headStyles: { fillColor: [240, 240, 240], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.0, lineWidth: 0.25, lineColor: [200, 200, 200] },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold', fillColor: [250, 250, 250] }
        },
        didParseCell: (data) => {
          if (data.section !== 'body' || data.column.index === 0) return;
          const val = matrixValues[data.row.index][data.column.index - 1];
          if (val > 0) {
            const ratio = maxVal > 0 ? val / maxVal : 0;
            const opacity = 0.05 + 0.95 * ratio;
            const r = Math.round(255 - (255 - 30) * opacity);
            const g = Math.round(255 - (255 - 58) * opacity);
            const b = Math.round(255 - (255 - 138) * opacity);
            data.cell.styles.fillColor = [r, g, b];
            if (ratio > 0.45) {
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [13, 33, 55];
            }
          }
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`reporte_calor_ventas_${fromVal}_a_${toVal}.pdf`);
    } catch (err: any) {
      showToast('Error generando PDF: ' + err.message, 'error');
    }
  });
}

async function renderCashFlowReport() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Reporte de Flujo de Caja...</div>';

  try {
    const today = todayStr();
    const firstDayOfMonth = today.substring(0, 8) + '01';
    const defaultSignaturesSetting = await getSettingFirst(['trial_show_signatures_default', 'show_signatures_default'], '0');
    const signaturesChecked = String(defaultSignaturesSetting).trim() === '1' || String(defaultSignaturesSetting).toLowerCase() === 'true';

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-money-bill-transfer mr-2 text-emerald-600"></i>Reporte de Flujo de Caja (Método Directo)</h4>
        <p class="text-xs text-gray-500">Analiza las entradas y salidas reales de dinero mediante las cuentas del Disponible (Grupo 11).</p>
        
        <!-- Filtros de lapso de fechas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Desde</label>
            <input type="date" id="cf-date-from" class="form-input mt-1 w-full text-xs" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Hasta</label>
            <input type="date" id="cf-date-to" class="form-input mt-1 w-full text-xs" value="${today}" />
          </div>
          <div class="flex items-end">
            <label class="inline-flex items-center gap-2 text-xs" style="color:#374151; padding-bottom: 8px;">
              <input id="cf-show-signatures" type="checkbox" ${signaturesChecked ? 'checked' : ''}>
              Mostrar firmas
            </label>
          </div>
          <div class="flex items-end gap-2">
            <button class="btn btn-primary flex-1 text-xs py-2" id="btn-gen-cf"><i class="fas fa-play mr-1"></i>Generar</button>
            <button class="btn btn-outline text-xs py-2" id="btn-exp-cf" disabled><i class="fas fa-file-excel mr-1"></i>Excel</button>
            <button class="btn btn-outline text-xs py-2" id="btn-pdf-cf" disabled><i class="fas fa-file-pdf mr-1"></i>PDF</button>
          </div>
        </div>
      </div>
      <div id="cf-results" class="p-5 text-sm text-center text-gray-400">Configura las fechas y haz clic en Generar.</div>`;

    $('#btn-gen-cf')?.addEventListener('click', generateCashFlowReportRows);
    $('#btn-exp-cf')?.addEventListener('click', exportCashFlowToExcel);
    $('#btn-pdf-cf')?.addEventListener('click', exportCashFlowToPdf);
  } catch (err: any) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function classifyCashFlow(accCode) {
  if (!accCode) return { category: 'Operación', subcategory: 'Otros Egresos' };
  const first = accCode.charAt(0);
  const group2 = accCode.substring(0, 2);
  const group4 = accCode.substring(0, 4);

  // Cash inflow classifications (Revenue, Receivables)
  if (first === '4') {
    return { category: 'Operación', subcategory: 'Ventas de Contado' };
  }
  if (group2 === '13') {
    return { category: 'Operación', subcategory: 'Recaudo de Clientes / Cartera' };
  }
  
  // Cash outflow classifications (Suppliers, Expenses, Payroll, Taxes)
  if (group2 === '22' || group2 === '23') {
    return { category: 'Operación', subcategory: 'Pago a Proveedores y Acreedores' };
  }
  if (group2 === '25' || group4 === '5105' || group4 === '5205') {
    return { category: 'Operación', subcategory: 'Nómina y Beneficios a Empleados' };
  }
  if (group2 === '24') {
    return { category: 'Operación', subcategory: 'Pago de Impuestos y Tasas' };
  }
  if (first === '5' || first === '6') {
    return { category: 'Operación', subcategory: 'Gastos y Costos Directos' };
  }

  // Investment (Assets class 15, 12, etc.)
  if (group2 === '15') {
    return { category: 'Inversión', subcategory: 'Adquisición de Activos Fijos' };
  }
  if (['12', '14', '16', '17', '18', '19'].includes(group2)) {
    return { category: 'Inversión', subcategory: 'Inversiones y Otros Activos' };
  }

  // Financing (Liabilities class 21, Equity class 3)
  if (group2 === '21') {
    return { category: 'Financiación', subcategory: 'Obligaciones Financieras (Créditos)' };
  }
  if (first === '3') {
    return { category: 'Financiación', subcategory: 'Aportes de Capital / Dividendos' };
  }

  return { category: 'Operación', subcategory: 'Otros Movimientos Operativos' };
}

async function generateCashFlowReportRows() {
  const fromDate = getInputVal('cf-date-from');
  const toDate = getInputVal('cf-date-to');
  if (!fromDate || !toDate) {
    return showToast('Por favor selecciona las fechas Desde y Hasta.', 'warning');
  }

  const results = $('#cf-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando Flujo de Caja...</div>';

  try {
    const res: any = await pb.send(`/api/gravy/report-cash-flow?fromDate=${fromDate}&toDate=${toDate}`, { method: 'GET' });
    const { initialBalance, flowItems } = res;

    // Compute totals
    const totalInflows = flowItems.filter(f => f.type === 'Ingreso').reduce((s, f) => s + f.amount, 0);
    const totalOutflows = flowItems.filter(f => f.type === 'Egreso').reduce((s, f) => s + f.amount, 0);
    const netFlow = totalInflows - totalOutflows;
    const finalBalance = initialBalance + netFlow;

    // Group flows by Category and Subcategory for display
    const groupedFlows = {
      Ingresos: new Map(), // category -> Map(subcategory -> sum)
      Egresos: new Map()   // category -> Map(subcategory -> sum)
    };

    flowItems.forEach(item => {
      const mapType = item.type === 'Ingreso' ? groupedFlows.Ingresos : groupedFlows.Egresos;
      if (!mapType.has(item.category)) {
        mapType.set(item.category, new Map());
      }
      const subMap = mapType.get(item.category);
      subMap.set(item.subcategory, (subMap.get(item.subcategory) || 0) + item.amount);
    });

    const renderGroupedSection = (groupedMap) => {
      let html = '';
      groupedMap.forEach((subMap, category) => {
        const catTotal = [...subMap.values()].reduce((s, v) => s + v, 0);
        html += `
          <tr class="bg-gray-50 font-bold" style="color:#0D2137">
            <td colspan="2"><i class="fas fa-folder-open text-blue-600 mr-2"></i>Actividades de ${esc(category)}</td>
            <td class="text-right font-extrabold">${fmt(catTotal)}</td>
          </tr>
        `;
        subMap.forEach((amount, subcategory) => {
          html += `
            <tr class="hover:bg-gray-50">
              <td class="pl-6 text-gray-500">—</td>
              <td>${esc(subcategory)}</td>
              <td class="text-right font-semibold text-gray-700">${fmt(amount)}</td>
            </tr>
          `;
        });
      });
      return html;
    };

    const inflowsHtml = renderGroupedSection(groupedFlows.Ingresos);
    const outflowsHtml = renderGroupedSection(groupedFlows.Egresos);

    results.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6 text-left">
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase">Saldo Inicial</p>
          <p class="text-xl font-bold mt-1 text-gray-800">${fmt(initialBalance)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Cuentas Disponible (11)</p>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase text-emerald-600">Total Ingresos</p>
          <p class="text-xl font-bold mt-1 text-emerald-700">+ ${fmt(totalInflows)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Entradas reales</p>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase text-rose-600">Total Egresos</p>
          <p class="text-xl font-bold mt-1 text-rose-700">- ${fmt(totalOutflows)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Salidas reales</p>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <p class="text-xs font-bold text-gray-400 uppercase">Flujo Neto</p>
          <p class="text-xl font-bold mt-1 ${netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${netFlow >= 0 ? '+' : ''}${fmt(netFlow)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Variación neta del período</p>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm bg-blue-50/50" style="border-color:#BFDBFE">
          <p class="text-xs font-bold text-gray-500 uppercase">Saldo Final</p>
          <p class="text-xl font-bold mt-1 text-blue-900">${fmt(finalBalance)}</p>
          <p class="text-[10px] text-gray-500 mt-1">Corte a la fecha fin</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <!-- Ingresos table -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-emerald-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#A7F3D0">
            <h5 class="font-bold text-emerald-800"><i class="fas fa-circle-arrow-down mr-2 text-emerald-600"></i>Ingresos / Entradas de Efectivo</h5>
            <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">${fmt(totalInflows)}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 5%"></th>
                  <th>Concepto / Subcategoría</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${inflowsHtml || '<tr><td colspan="3" class="text-center py-6 text-gray-400">No se registraron ingresos de efectivo.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Egresos table -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-rose-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#FECDD3">
            <h5 class="font-bold text-rose-800"><i class="fas fa-circle-arrow-up mr-2 text-rose-600"></i>Egresos / Salidas de Efectivo</h5>
            <span class="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">${fmt(totalOutflows)}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 5%"></th>
                  <th>Concepto / Subcategoría</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${outflowsHtml || '<tr><td colspan="3" class="text-center py-6 text-gray-400">No se registraron egresos de efectivo.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    let signaturesHtml = '';
    let signatureValues = null;
    const includeSignatures = getCheckVal('cf-show-signatures');

    if (includeSignatures) {
      const [repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense] = await Promise.all([
        getSettingFirst(['representante_legal_name', 'legal_representative_name', 'rep_legal_name']),
        getSettingFirst(['representante_legal_title', 'legal_representative_title', 'rep_legal_title'], 'Representante Legal'),
        getSettingFirst(['contador_name', 'accountant_name']),
        getSettingFirst(['contador_title', 'accountant_title'], 'Contador'),
        getSettingFirst(['contador_license', 'accountant_license']),
        getSettingFirst(['revisor_fiscal_name', 'fiscal_reviewer_name']),
        getSettingFirst(['revisor_fiscal_title', 'fiscal_reviewer_title'], 'Revisor Fiscal'),
        getSettingFirst(['revisor_fiscal_license', 'fiscal_reviewer_license']),
      ]);

      signaturesHtml = `
        <div class="p-4 pt-2 border-t mt-6" style="border-color:#E5E7EB">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            ${signatureBlock(repName, repTitle, '')}
            ${signatureBlock(contName, contTitle, contLicense)}
            ${signatureBlock(revName, revTitle, revLicense)}
          </div>
        </div>`;
      
      signatureValues = { repName, repTitle, contName, contTitle, contLicense, revName, revTitle, revLicense };
    }

    results.innerHTML += signaturesHtml;

    (window as any)._cfReportData = {
      fromDate,
      toDate,
      initialBalance,
      totalInflows,
      totalOutflows,
      netFlow,
      finalBalance,
      flowItems,
      includeSignatures,
      signatures: signatureValues
    };

    const expBtn = $('#btn-exp-cf') as HTMLButtonElement | null;
    const pdfBtn = $('#btn-pdf-cf') as HTMLButtonElement | null;
    if (expBtn) expBtn.disabled = false;
    if (pdfBtn) pdfBtn.disabled = false;

  } catch (err: any) {
    results.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function exportCashFlowToExcel() {
  const data = (window as any)._cfReportData;
  if (!data) return;

  const rows = [];
  rows.push({ seccion: 'VARIACIÓN DE EFECTIVO', categoria: '', subcategoria: '', concepto: '', monto: '' });
  rows.push({ seccion: 'Saldo Inicial', categoria: '', subcategoria: '', concepto: '', monto: data.initialBalance });
  rows.push({ seccion: 'Total Ingresos', categoria: '', subcategoria: '', concepto: '', monto: data.totalInflows });
  rows.push({ seccion: 'Total Egresos', categoria: '', subcategoria: '', concepto: '', monto: data.totalOutflows });
  rows.push({ seccion: 'Flujo Neto', categoria: '', subcategoria: '', concepto: '', monto: data.netFlow });
  rows.push({ seccion: 'Saldo Final', categoria: '', subcategoria: '', concepto: '', monto: data.finalBalance });
  rows.push({ seccion: '', categoria: '', subcategoria: '', concepto: '', monto: '' });

  rows.push({ seccion: 'DETALLE DE FLUJOS', categoria: 'Categoría', subcategoria: 'Subcategoría', concepto: 'Tercero / Cuenta Contable / Info', monto: 'Monto' });
  data.flowItems.forEach(f => {
    rows.push({
      seccion: f.type,
      categoria: f.category,
      subcategoria: f.subcategory,
      concepto: `${f.txDate} [${f.txNumber}] ${f.accountCode} ${f.accountName} - ${f.description}`,
      monto: f.amount
    });
  });

  if (data.includeSignatures && data.signatures) {
    const s = data.signatures;
    rows.push({ seccion: '', categoria: '', subcategoria: '', concepto: '', monto: '' });
    rows.push({ seccion: '', categoria: '', subcategoria: '', concepto: '', monto: '' });
    rows.push({
      seccion: s.repName || '________________________',
      categoria: s.contName || '________________________',
      subcategoria: s.revName || '________________________',
      concepto: '',
      monto: ''
    });
    rows.push({
      seccion: s.repTitle || 'Representante Legal',
      categoria: `${s.contTitle || 'Contador'}${s.contLicense ? ' (' + s.contLicense + ')' : ''}`,
      subcategoria: `${s.revTitle || 'Revisor Fiscal'}${s.revLicense ? ' (' + s.revLicense + ')' : ''}`,
      concepto: '',
      monto: ''
    });
  }

  exportToExcel(rows, [
    { key: 'seccion', label: 'Flujo / Sección' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'subcategoria', label: 'Subcategoría' },
    { key: 'concepto', label: 'Detalle de Comprobante Contable' },
    { key: 'monto', label: 'Monto' }
  ], `flujo_caja_${data.fromDate}_a_${data.toDate}`);
}

async function exportCashFlowToPdf() {
  const data = (window as any)._cfReportData;
  if (!data) return;

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;
    const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const headerCtx = await getPdfHeaderContext();
    const header = drawPdfHeader(doc, headerCtx, {
      title: 'Reporte de Flujo de Caja (Método Directo)',
      subtitles: [
        `Periodo: ${data.fromDate} a ${data.toDate}`,
        `Saldo Inicial: ${fmtPdfNum(data.initialBalance)}  |  Saldo Final: ${fmtPdfNum(data.finalBalance)}`,
        `Ingresos: +${fmtPdfNum(data.totalInflows)}  |  Egresos: -${fmtPdfNum(data.totalOutflows)}`,
        `Flujo Neto del Periodo: ${data.netFlow >= 0 ? '+' : ''}${fmtPdfNum(data.netFlow)}`
      ],
    });

    const body = [];
    body.push([{ content: 'RESUMEN DEL PERÍODO', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [230, 235, 245], textColor: [13, 33, 55] } }]);
    body.push(['(+) Ingresos de Efectivo', '', '', '', fmtPdfNum(data.totalInflows)]);
    body.push(['(-) Egresos de Efectivo', '', '', '', `-${fmtPdfNum(data.totalOutflows)}`]);
    body.push(['(=) Flujo Neto del Período', '', '', '', fmtPdfNum(data.netFlow)]);

    // Group flow items by type
    const inflows = data.flowItems.filter(f => f.type === 'Ingreso');
    const outflows = data.flowItems.filter(f => f.type === 'Egreso');

    body.push([{ content: 'INGRESOS DE EFECTIVO', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [13, 33, 55] } }]);
    if (inflows.length) {
      inflows.forEach(f => {
        body.push([
          f.txDate,
          f.txNumber,
          f.subcategory,
          `${f.accountCode} - ${f.accountName}`,
          fmtPdfNum(f.amount)
        ]);
      });
    } else {
      body.push([{ content: 'No se registraron ingresos.', colSpan: 5, styles: { textColor: [120, 120, 120] } }]);
    }

    body.push([{ content: 'EGRESOS DE EFECTIVO', colSpan: 5, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [13, 33, 55] } }]);
    if (outflows.length) {
      outflows.forEach(f => {
        body.push([
          f.txDate,
          f.txNumber,
          f.subcategory,
          `${f.accountCode} - ${f.accountName}`,
          fmtPdfNum(f.amount)
        ]);
      });
    } else {
      body.push([{ content: 'No se registraron egresos.', colSpan: 5, styles: { textColor: [120, 120, 120] } }]);
    }

    doc.autoTable({
      startY: header.startY,
      head: [['Fecha', 'Documento', 'Subcategoría', 'Contrapartida / Cuenta', 'Monto']],
      body,
      theme: 'plain',
      margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
      styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 130 },
        3: { cellWidth: 244 },
        4: { cellWidth: 80, halign: 'right' },
      },
    });

    if (data.includeSignatures) {
      await drawPdfSignatures(doc, doc.lastAutoTable.finalY);
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawPdfFooter(doc, p);
    }

    doc.save(`flujo_caja_directo_${data.fromDate}_a_${data.toDate}.pdf`);
  } catch (err: any) {
    showToast(`Error al generar PDF: ${err.message}`, 'error');
  }
}

async function renderFinancialAnalysisReport() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Análisis Financiero...</div>';

  try {
    const budgets = await API.getPhBudgets().catch(() => []);
    const currentYear = new Date().getFullYear();

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-chart-line mr-2 text-indigo-600"></i>Análisis Financiero Integrado</h4>
        <p class="text-xs text-gray-500 font-medium">Relaciona la Cartera por cobrar, el Flujo de Caja real y la Ejecución Presupuestal anual con representaciones estadísticas.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label class="form-label font-bold text-xs text-gray-500">Presupuesto Referencia (PH)</label>
            <select id="fa-budget-id" class="form-input text-xs mt-1 w-full" style="height:34px">
              ${budgets.map(b => `<option value="${b.id}" data-year="${b.year}">${b.year} - ${esc(b.name)}</option>`).join('')}
              ${budgets.length === 0 ? '<option value="">— No hay presupuestos configurados —</option>' : ''}
            </select>
          </div>
          <div>
            <label class="form-label font-bold text-xs text-gray-500">Año del Análisis</label>
            <input type="number" id="fa-year" class="form-input text-xs mt-1 w-full" style="height:34px" value="${currentYear}">
          </div>
          <button class="btn btn-primary text-xs w-full py-2" id="btn-gen-fa" style="height:34px"><i class="fas fa-arrows-rotate mr-1"></i>Calcular Análisis</button>
        </div>
      </div>
      <div id="fa-results" class="p-5 text-sm text-center text-gray-400">Selecciona los parámetros y haz clic en Calcular Análisis.</div>
    `;

    $('#btn-gen-fa')?.addEventListener('click', generateFinancialAnalysisData);
  } catch (err: any) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function generateFinancialAnalysisData() {
  const budgetId = getSelectVal('fa-budget-id');
  const year = getInputVal('fa-year');
  if (!budgetId || !year) {
    return showToast('Por favor selecciona un presupuesto y año válido.', 'warning');
  }

  const results = $('#fa-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Análisis Financiero...</div>';

  try {
    // 1. Fetch Budget Execution, Ledger Data, and Portfolio (CXC)
    const [budgetExec, { transactions, txLines }, cxcDocs] = await Promise.all([
      API.getBudgetExecution(budgetId, year).catch(() => []),
      ensureLedgerData(),
      buildOpenPortfolioDocs({ mode: 'cxc', asOfDate: `${year}-12-31` }).catch(() => [])
    ]);

    const { accounts } = await ensureAccountsSaldos();
    const accountMap = new Map(accounts.map(a => [a.id, a]));
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));

    // 2. Compute Annual Cash Flow & Monthly Breakdown
    let totalInflows = 0;
    let totalOutflows = 0;
    const monthlyCF = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, inflow: 0, outflow: 0 }));

    // Group lines by transaction to perform correct cash-netting
    const txIdSet = new Set(transactions.filter(t => t.date.startsWith(year) && t.status === 'active').map(t => t.id));
    const txLinesMap = new Map();
    for (const l of txLines) {
      if (txIdSet.has(l.tx_id)) {
        if (!txLinesMap.has(l.tx_id)) {
          txLinesMap.set(l.tx_id, []);
        }
        txLinesMap.get(l.tx_id).push(l);
      }
    }

    txLinesMap.forEach((lines, txId) => {
      const tx = txById[txId];
      const txMonth = Number(tx.date.substring(5, 7)) - 1; // 0 - 11

      const cashLines = [];
      for (const l of lines) {
        const acc = l.expand?.account_id || accountMap.get(l.account_id);
        if (acc?.code?.startsWith('11')) {
          cashLines.push(l);
        }
      }

      if (cashLines.length === 0) return;

      const totalCashDebit = cashLines.reduce((s, cl) => s + Number(cl.debit || 0), 0);
      const totalCashCredit = cashLines.reduce((s, cl) => s + Number(cl.credit || 0), 0);
      const netCashChange = totalCashDebit - totalCashCredit;

      if (Math.abs(netCashChange) < 0.01) return; // ignore transfers

      if (netCashChange > 0) {
        totalInflows += netCashChange;
        if (txMonth >= 0 && txMonth < 12) {
          monthlyCF[txMonth].inflow += netCashChange;
        }
      } else {
        const amt = Math.abs(netCashChange);
        totalOutflows += amt;
        if (txMonth >= 0 && txMonth < 12) {
          monthlyCF[txMonth].outflow += amt;
        }
      }
    });

    const netCashFlow = totalInflows - totalOutflows;

    // 3. Compute Portfolio Aging
    let totalCxc = 0;
    const ageBuckets = { por_vencer: 0, b0_30: 0, b31_60: 0, b61_90: 0, b90p: 0 };
    cxcDocs.forEach(d => {
      totalCxc += d.open;
      if (ageBuckets.hasOwnProperty(d.bucket)) {
        ageBuckets[d.bucket] += d.open;
      }
    });

    // 4. Compute Budget Execution Totals
    const totalBudget = budgetExec.reduce((s, l) => s + l.annual_amount, 0);
    const totalExecuted = budgetExec.reduce((s, l) => s + Math.abs(l.executed || 0), 0);
    const budgetPerc = totalBudget > 0 ? (totalExecuted / totalBudget * 100) : 0;

    // Sort budget execution to find top spent categories
    const budgetSpentSorted = [...budgetExec]
      .sort((a, b) => Math.abs(b.executed || 0) - Math.abs(a.executed || 0))
      .slice(0, 4);

    // 5. Generate SVG Graphic for Monthly Cash Flow
    // SVG Dimensions: width 100% (max 600), height 200. Padding: Left 50, Right 20, Top 20, Bottom 35
    const svgW = 600;
    const svgH = 220;
    const padL = 60;
    const padR = 20;
    const padT = 20;
    const padB = 40;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;

    const maxMonthlyVal = Math.max(...monthlyCF.map(m => Math.max(m.inflow, m.outflow)), 10000);
    
    // Draw gridlines
    let gridHtml = '';
    for (let i = 0; i <= 4; i++) {
      const yPos = padT + (chartH * i / 4);
      const val = maxMonthlyVal * (4 - i) / 4;
      gridHtml += `
        <line x1="${padL}" y1="${yPos}" x2="${svgW - padR}" y2="${yPos}" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padL - 8}" y="${yPos + 3}" fill="#9CA3AF" font-size="9" text-anchor="end">${fmt(val)}</text>
      `;
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const barSpacing = chartW / 12;
    const barW = barSpacing * 0.35;
    
    let barsHtml = '';
    monthlyCF.forEach((m, idx) => {
      const xCenter = padL + (idx * barSpacing) + (barSpacing / 2);
      
      const xIn = xCenter - barW - 1;
      const hIn = (m.inflow / maxMonthlyVal) * chartH;
      const yIn = padT + chartH - hIn;
      
      const xOut = xCenter + 1;
      const hOut = (m.outflow / maxMonthlyVal) * chartH;
      const yOut = padT + chartH - hOut;

      // Inflow bar (Green)
      barsHtml += `
        <rect x="${xIn}" y="${yIn}" width="${barW}" height="${Math.max(hIn, 2)}" fill="#10B981" rx="2" class="transition-all hover:opacity-85" title="Ingresos: ${fmt(m.inflow)}" />
      `;
      // Outflow bar (Red)
      barsHtml += `
        <rect x="${xOut}" y="${yOut}" width="${barW}" height="${Math.max(hOut, 2)}" fill="#EF4444" rx="2" class="transition-all hover:opacity-85" title="Egresos: ${fmt(m.outflow)}" />
      `;

      // Label
      barsHtml += `
        <text x="${xCenter}" y="${svgH - padB + 16}" fill="#4B5563" font-size="10" font-weight="600" text-anchor="middle">${monthNames[idx]}</text>
      `;
    });

    const flowChartSvg = `
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%">
        ${gridHtml}
        ${barsHtml}
        <!-- Base Line -->
        <line x1="${padL}" y1="${padT + chartH}" x2="${svgW - padR}" y2="${padT + chartH}" stroke="#9CA3AF" stroke-width="1" />
      </svg>
    `;

    // 6. Generate Portfolio Aging Stacked Bar
    const agePercs = {
      por_vencer: totalCxc > 0 ? (ageBuckets.por_vencer / totalCxc * 100) : 0,
      b0_30: totalCxc > 0 ? (ageBuckets.b0_30 / totalCxc * 100) : 0,
      b31_60: totalCxc > 0 ? (ageBuckets.b31_60 / totalCxc * 100) : 0,
      b61_90: totalCxc > 0 ? (ageBuckets.b61_90 / totalCxc * 100) : 0,
      b90p: totalCxc > 0 ? (ageBuckets.b90p / totalCxc * 100) : 0
    };

    // 7. Auditor Conclusions
    let auditorChecks = [];
    if (netCashFlow < 0) {
      auditorChecks.push({
        type: 'danger',
        title: 'Flujo de Caja Anual Negativo',
        desc: `Las salidas de dinero superan las entradas en **${fmt(Math.abs(netCashFlow))}**. Esto representa una descapitalización o dependencia de reservas acumuladas.`
      });
    } else {
      auditorChecks.push({
        type: 'success',
        title: 'Superávit de Caja del Período',
        desc: `El flujo neto del año es positivo en **${fmt(netCashFlow)}**, indicando una buena salud de caja.`
      });
    }

    const collectionRatio = totalInflows > 0 ? (totalCxc / totalInflows * 100) : 0;
    if (collectionRatio > 25) {
      auditorChecks.push({
        type: 'warning',
        title: 'Cartera Acumulada Alta',
        desc: `La cartera pendiente representa el **${collectionRatio.toFixed(1)}%** del total de ingresos del disponible del año. Se sugiere intensificar gestión de recaudo.`
      });
    }

    const olderThan90Ratio = totalCxc > 0 ? (ageBuckets.b90p / totalCxc * 100) : 0;
    if (olderThan90Ratio > 15) {
      auditorChecks.push({
        type: 'danger',
        title: 'Cartera Vencida Crítica (>90 Días)',
        desc: `El **${olderThan90Ratio.toFixed(1)}%** de la cartera pendiente (**${fmt(ageBuckets.b90p)}**) tiene más de 90 días de mora. Requiere provisión o cobro coactivo immediato.`
      });
    }

    if (totalExecuted > totalBudget) {
      auditorChecks.push({
        type: 'warning',
        title: 'Sobreejecución Presupuestal General',
        desc: `Los gastos reales acumulados superan el presupuesto anual configurado en un **${(totalExecuted / totalBudget * 100 - 100).toFixed(1)}%**.`
      });
    }

    // Check individual overspent accounts
    budgetExec.forEach(l => {
      const over = Math.abs(l.executed || 0) - l.annual_amount;
      if (over > 0 && l.annual_amount > 0) {
        auditorChecks.push({
          type: 'warning',
          title: `Rubro Sobreejecutado: ${l.expand?.account_id?.code}`,
          desc: `La cuenta **${l.expand?.account_id?.name}** presenta una desviación presupuestal de **+${fmt(over)}** (${(Math.abs(l.executed)/l.annual_amount*100).toFixed(0)}% de ejecución).`
        });
      }
    });

    results.innerHTML = `
      <!-- KPI Widgets Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-left">
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <span class="text-xs font-bold text-gray-400 uppercase">Flujo Neto Anual</span>
          <p class="text-2xl font-black mt-1 ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${netCashFlow >= 0 ? '+' : ''}${fmt(netCashFlow)}</p>
          <span class="text-[10px] text-gray-500">Ingresos: ${fmt(totalInflows)} · Egresos: ${fmt(totalOutflows)}</span>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <span class="text-xs font-bold text-gray-400 uppercase">Cartera Total</span>
          <p class="text-2xl font-black mt-1 text-blue-900">${fmt(totalCxc)}</p>
          <span class="text-[10px] text-gray-500">Saldo por cobrar copropietarios</span>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm" style="border-color:#E5E7EB">
          <span class="text-xs font-bold text-gray-400 uppercase">Ejecución Presupuestal</span>
          <p class="text-2xl font-black mt-1 text-gray-800">${budgetPerc.toFixed(1)}%</p>
          <span class="text-[10px] text-gray-500">Gastado: ${fmt(totalExecuted)} de ${fmt(totalBudget)}</span>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50" style="border-color:#C7D2FE">
          <span class="text-xs font-bold text-indigo-700 uppercase">Rendimiento Liquidez</span>
          <p class="text-2xl font-black mt-1 text-indigo-950">${netCashFlow > 0 && totalCxc > 0 ? (netCashFlow / totalCxc).toFixed(2) : '0.00'}</p>
          <span class="text-[10px] text-indigo-600">Índice Flujo vs Deuda por Cobrar</span>
        </div>
      </div>

      <!-- Main Visualizations Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 text-left">
        <!-- Monthly cash flow chart -->
        <div class="bg-white rounded-2xl border p-5 lg:col-span-2 shadow-sm" style="border-color:#E5E7EB">
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-bold text-gray-800"><i class="fas fa-chart-bar mr-2 text-emerald-600"></i>Ingresos (verde) vs Egresos (rojo) Mensuales</h5>
            <span class="text-[10px] text-gray-400 font-bold uppercase">Variación del Disponible</span>
          </div>
          <div class="w-full flex items-center justify-center p-2">
            ${flowChartSvg}
          </div>
        </div>

        <!-- Aging Cartera bar -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between" style="border-color:#E5E7EB">
          <div>
            <h5 class="font-bold text-gray-800 mb-2"><i class="fas fa-hourglass-half mr-2 text-blue-700"></i>Maduración de Cartera PH</h5>
            <p class="text-[10px] text-gray-400 font-bold uppercase mb-4">Estructura por Edades</p>
            
            <div class="flex rounded-full overflow-hidden h-6 w-full mb-5 bg-gray-100">
              ${agePercs.por_vencer > 0 ? `<div class="bg-emerald-500 h-full transition-all" style="width: ${agePercs.por_vencer}%" title="Por Vencer"></div>` : ''}
              ${agePercs.b0_30 > 0 ? `<div class="bg-amber-400 h-full transition-all" style="width: ${agePercs.b0_30}%" title="0-30 días"></div>` : ''}
              ${agePercs.b31_60 > 0 ? `<div class="bg-orange-500 h-full transition-all" style="width: ${agePercs.b31_60}%" title="31-60 días"></div>` : ''}
              ${agePercs.b61_90 > 0 ? `<div class="bg-red-500 h-full transition-all" style="width: ${agePercs.b61_90}%" title="61-90 días"></div>` : ''}
              ${agePercs.b90p > 0 ? `<div class="bg-rose-700 h-full transition-all" style="width: ${agePercs.b90p}%" title=">90 días"></div>` : ''}
            </div>
            
            <div class="space-y-2 text-xs">
              <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span>Por Vencer:</span></div><span class="font-bold">${fmt(ageBuckets.por_vencer)} (${agePercs.por_vencer.toFixed(1)}%)</span></div>
              <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div><span>0 - 30 días:</span></div><span class="font-bold">${fmt(ageBuckets.b0_30)} (${agePercs.b0_30.toFixed(1)}%)</span></div>
              <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div><span>31 - 60 días:</span></div><span class="font-bold">${fmt(ageBuckets.b31_60)} (${agePercs.b31_60.toFixed(1)}%)</span></div>
              <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-red-50"></div><span>61 - 90 días:</span></div><span class="font-bold">${fmt(ageBuckets.b61_90)} (${agePercs.b61_90.toFixed(1)}%)</span></div>
              <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full bg-rose-700"></div><span class="font-bold text-rose-800">Más de 90 días:</span></div><span class="font-bold text-rose-800">${fmt(ageBuckets.b90p)} (${agePercs.b90p.toFixed(1)}%)</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Execution progress and Auditor Panel -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <!-- Budget Execution indicators -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm" style="border-color:#E5E7EB">
          <h5 class="font-bold text-gray-800 mb-3"><i class="fas fa-sack-dollar mr-2 text-indigo-700"></i>Ejecución Presupuestal de Rubros Principales</h5>
          <div class="space-y-4 mt-2">
            ${budgetSpentSorted.map(item => {
              const spent = Math.abs(item.executed || 0);
              const limit = item.annual_amount;
              const ratio = limit > 0 ? (spent / limit * 100) : 0;
              const barColor = ratio > 100 ? 'bg-red-500' : (ratio > 90 ? 'bg-amber-500' : 'bg-emerald-500');
              return `
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-bold text-gray-700">${item.expand?.account_id?.code} - ${esc(item.expand?.account_id?.name)}</span>
                    <span class="font-bold text-gray-500">${fmt(spent)} de ${fmt(limit)} (${ratio.toFixed(0)}%)</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div class="${barColor} h-full" style="width: ${Math.min(ratio, 100)}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
            ${budgetSpentSorted.length === 0 ? '<p class="text-xs text-gray-400 py-4 text-center">No hay datos de presupuesto ejecutados.</p>' : ''}
          </div>
        </div>

        <!-- Auditor panel details -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm" style="border-color:#E5E7EB">
          <h5 class="font-bold text-gray-800 mb-3"><i class="fas fa-clipboard-check mr-2 text-indigo-700"></i>Panel de Conclusiones de Auditoría</h5>
          <div class="space-y-3 max-h-[260px] overflow-y-auto">
            ${auditorChecks.map(c => `
              <div class="p-3 rounded-xl border flex gap-3 text-xs ${c.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-800' : (c.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800')}">
                <div class="mt-0.5">
                  <i class="fas ${c.type === 'danger' ? 'fa-circle-xmark text-rose-600' : (c.type === 'warning' ? 'fa-circle-exclamation text-amber-600' : 'fa-circle-check text-emerald-600')} text-base"></i>
                </div>
                <div>
                  <h6 class="font-bold uppercase tracking-wide">${c.title}</h6>
                  <p class="mt-1 leading-relaxed">${c.desc}</p>
                </div>
              </div>
            `).join('')}
            ${auditorChecks.length === 0 ? '<p class="text-xs text-gray-400 py-6 text-center">No se encontraron alarmas contables en este análisis.</p>' : ''}
          </div>
        </div>
      </div>
    `;

  } catch (err: any) {
    results.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function renderDetailedBudgetExecutionReport(targetBudgetId = '', targetYear = '') {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Reporte de Ejecución...</div>';

  try {
    const budgets = await API.getPhBudgets().catch(() => []);
    const currentYear = new Date().getFullYear();

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-table-list mr-2 text-emerald-600"></i>Reporte Detallado de Ejecución Presupuestal</h4>
        <p class="text-xs text-gray-500">Realice un seguimiento mes a mes y consulte el desglose detallado de las transacciones de ejecución.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label class="text-xs font-semibold text-gray-500">Presupuesto</label>
            <select id="pbd-budget-id" class="form-input mt-1 w-full text-xs" style="height:34px">
              ${budgets.map(b => `<option value="${b.id}" data-year="${b.year}" ${b.id === targetBudgetId ? 'selected' : ''}>${b.year} - ${esc(b.name)}</option>`).join('')}
              ${budgets.length === 0 ? '<option value="">— No hay presupuestos —</option>' : ''}
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500">Año del Reporte</label>
            <input type="number" id="pbd-year" class="form-input mt-1 w-full text-xs" style="height:34px" value="${targetYear || currentYear}" />
          </div>
          <div class="md:col-span-2 flex items-end gap-2">
            <button class="btn btn-primary flex-1 text-xs py-2" id="btn-gen-pbd" style="height:34px"><i class="fas fa-play mr-1"></i>Generar</button>
            <button class="btn btn-outline text-xs py-2" id="btn-exp-pbd" style="height:34px" disabled><i class="fas fa-file-excel mr-1"></i>Excel</button>
            <button class="btn btn-outline text-xs py-2" id="btn-pdf-pbd" style="height:34px" disabled><i class="fas fa-file-pdf mr-1"></i>PDF</button>
          </div>
        </div>
      </div>
      <div id="pbd-results" class="p-5 text-sm text-center text-gray-400">Configura los parámetros y haz clic en Generar.</div>
      <div id="pbd-drilldown-container" class="p-5 border-t hidden" style="border-color:#F3F4F6">
        <h5 class="font-bold text-gray-800 mb-3" id="pbd-drilldown-title"><i class="fas fa-magnifying-glass-chart mr-2 text-indigo-600"></i>Detalle de Transacciones</h5>
        <div class="overflow-x-auto bg-white rounded-2xl border" style="border-color:#E5E7EB">
          <table class="data-table text-xs" id="pbd-drilldown-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comprobante</th>
                <th>Tercero</th>
                <th>Cuenta Auxiliar</th>
                <th>Descripción</th>
                <th class="text-right">Débito</th>
                <th class="text-right">Crédito</th>
                <th class="text-right">Neto</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="pbd-drilldown-body">
              <tr>
                <td colspan="9" class="text-center py-6 text-gray-400">Haz clic en alguna celda mensual o total en la tabla de arriba para ver las transacciones.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;

    // Listeners
    $('#btn-gen-pbd')?.addEventListener('click', () => generateDetailedBudgetExecutionData());
    $('#btn-exp-pbd')?.addEventListener('click', () => exportDetailedBudgetToExcel());
    $('#btn-pdf-pbd')?.addEventListener('click', () => exportDetailedBudgetToPdf());

    // Update year automatically when selecting budget
    $('#pbd-budget-id')?.addEventListener('change', (e) => {
      const select = e.target as HTMLSelectElement;
      const opt = select.options[select.selectedIndex];
      const year = opt.dataset.year;
      if (year) {
        const yearInput = $('#pbd-year') as HTMLInputElement | null;
        if (yearInput) yearInput.value = year;
      }
    });

    // Auto-generate if preloaded targets are set
    if (targetBudgetId && targetYear) {
      setTimeout(() => generateDetailedBudgetExecutionData(targetBudgetId, targetYear), 100);
    }
  } catch (err: any) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function generateDetailedBudgetExecutionData(forcedBudgetId = '', forcedYear = '') {
  const budgetId = forcedBudgetId || getSelectVal('pbd-budget-id');
  const year = forcedYear || getInputVal('pbd-year');
  if (!budgetId || !year) {
    return showToast('Por favor selecciona un presupuesto y año válido.', 'warning');
  }

  const results = $('#pbd-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando ejecución presupuestal...</div>';
  
  const drilldownContainer = $('#pbd-drilldown-container');
  if (drilldownContainer) drilldownContainer.classList.add('hidden');

  try {
    const select = $('#pbd-budget-id') as HTMLSelectElement | null;
    const budgetName = select?.options[select.selectedIndex]?.text || `Presupuesto ${year}`;

    const { budgetLines, txLines } = await API.getBudgetExecutionDetail(budgetId, year);

    // Save report data globally for exports
    (window as any)._detailedBudgetReportData = {
      budgetLines,
      txLines,
      budgetName,
      budgetYear: year
    };

    renderDetailedBudgetMatrix(budgetLines, txLines);

    // Enable export buttons
    const expBtn = $('#btn-exp-pbd') as HTMLButtonElement | null;
    const pdfBtn = $('#btn-pdf-pbd') as HTMLButtonElement | null;
    if (expBtn) expBtn.disabled = false;
    if (pdfBtn) pdfBtn.disabled = false;
  } catch (err: any) {
    results.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function renderDetailedBudgetMatrix(budgetLines, txLines) {
  const results = $('#pbd-results');
  if (!results) return;

  if (budgetLines.length === 0) {
    results.innerHTML = '<div class="p-8 text-center text-gray-500">Este presupuesto no tiene rubros configurados.</div>';
    return;
  }

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Table headers
  let tableHtml = `
    <div class="overflow-x-auto bg-white rounded-2xl border" style="border-color:#E5E7EB">
      <table class="data-table text-[11px]">
        <thead>
          <tr>
            <th class="sticky-left" style="background:#F9FAFB">Rubro / Cuenta</th>
            <th class="text-right">Presupuesto</th>
            ${months.map(m => `<th class="text-right">${m}</th>`).join('')}
            <th class="text-right">Total Ejec.</th>
            <th class="text-right">Diferencia</th>
            <th class="text-right">% Ejec.</th>
          </tr>
        </thead>
        <tbody>`;

  let totalBudget = 0;
  let totalExecuted = 0;
  const monthlyTotals = new Array(12).fill(0);

  budgetLines.forEach((l, lIdx) => {
    const diff = l.annual_amount - Math.abs(l.executed);
    const perc = l.annual_amount > 0 ? (Math.abs(l.executed) / l.annual_amount * 100) : 0;
    const color = perc > 100 ? 'text-red-600' : (perc > 90 ? 'text-amber-600' : 'text-green-600');
    
    totalBudget += l.annual_amount;
    totalExecuted += Math.abs(l.executed);

    const code = l.expand?.account_id?.code || '';
    const name = l.expand?.account_id?.name || '';

    tableHtml += `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="sticky-left font-semibold" style="background:#FFF">${code} - ${esc(name)}</td>
        <td class="text-right font-semibold text-gray-700">${fmt(l.annual_amount)}</td>
        ${l.monthly_executed.map((val, mIdx) => {
          monthlyTotals[mIdx] += Math.abs(val);
          const valAbs = Math.abs(val);
          const hasValue = valAbs > 0.01;
          return `
            <td class="text-right ${hasValue ? 'font-medium text-blue-600 cursor-pointer hover:underline' : 'text-gray-300'}" 
                onclick="${hasValue ? `window.showDetailedBudgetDrilldown('${l.id}', ${mIdx})` : ''}">
              ${hasValue ? fmt(valAbs) : '$0'}
            </td>`;
        }).join('')}
        <td class="text-right font-bold text-gray-800 cursor-pointer hover:underline" onclick="window.showDetailedBudgetDrilldown('${l.id}', -1)">
          ${fmt(Math.abs(l.executed))}
        </td>
        <td class="text-right font-semibold ${diff < 0 ? 'text-red-600' : 'text-gray-500'}">${fmt(diff)}</td>
        <td class="text-right font-bold ${color}">${perc.toFixed(0)}%</td>
      </tr>`;
  });

  const totalDiff = totalBudget - totalExecuted;
  const totalPerc = totalBudget > 0 ? (totalExecuted / totalBudget * 100) : 0;

  // Add summary row
  tableHtml += `
    <tr class="bg-gray-50 font-bold border-t text-[11px]" style="border-color:#D1D5DB">
      <td class="sticky-left" style="background:#F9FAFB">TOTALES</td>
      <td class="text-right">${fmt(totalBudget)}</td>
      ${monthlyTotals.map(sum => `<td class="text-right">${fmt(sum)}</td>`).join('')}
      <td class="text-right">${fmt(totalExecuted)}</td>
      <td class="text-right ${totalDiff < 0 ? 'text-red-600' : ''}">${fmt(totalDiff)}</td>
      <td class="text-right ${totalPerc > 100 ? 'text-red-600' : 'text-green-600'}">${totalPerc.toFixed(0)}%</td>
    </tr>`;

  tableHtml += `
        </tbody>
      </table>
    </div>`;

  results.innerHTML = tableHtml;
}

function showDetailedBudgetDrilldown(lineId, monthIdx) {
  const data = (window as any)._detailedBudgetReportData;
  if (!data) return;

  const drilldownContainer = $('#pbd-drilldown-container');
  const drilldownTitle = $('#pbd-drilldown-title');
  const drilldownBody = $('#pbd-drilldown-body');

  if (!drilldownContainer || !drilldownTitle || !drilldownBody) return;

  const budgetLine = data.budgetLines.find(l => l.id === lineId);
  if (!budgetLine) return;

  const code = budgetLine.expand?.account_id?.code || '';
  const name = budgetLine.expand?.account_id?.name || '';
  
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = monthIdx >= 0 ? months[monthIdx] : 'Todo el año';

  drilldownTitle.innerHTML = `<i class="fas fa-magnifying-glass-chart mr-2 text-indigo-600"></i>Detalle de Transacciones: <span class="text-blue-900 font-bold">${code}</span> (${monthName})`;

  const parentCode = budgetLine.expand?.account_id?.code;
  if (!parentCode) return;

  let filteredTxLines = data.txLines.filter(tl => {
    const accCode = tl.expand?.account_id?.code || '';
    return accCode.startsWith(parentCode);
  });

  if (monthIdx >= 0) {
    filteredTxLines = filteredTxLines.filter(tl => {
      const dStr = tl.expand?.tx_id?.date;
      if (!dStr) return false;
      const month = new Date(dStr + 'T00:00:00Z').getUTCMonth();
      return month === monthIdx;
    });
  }

  // Sort by date descending
  filteredTxLines.sort((a, b) => String(b.expand?.tx_id?.date || '').localeCompare(String(a.expand?.tx_id?.date || '')));

  if (filteredTxLines.length === 0) {
    drilldownBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-6 text-gray-400">No se encontraron transacciones para este rubro en ${monthName}.</td>
      </tr>`;
  } else {
    let tbodyHtml = '';
    filteredTxLines.forEach(tl => {
      const date = tl.expand?.tx_id?.date || '';
      const num = tl.expand?.tx_id?.number || '';
      const txId = tl.expand?.tx_id?.id || '';
      const third = tl.expand?.third_party_id?.name || 'Sin tercero';
      const acc = `${tl.expand?.account_id?.code || ''} - ${tl.expand?.account_id?.name || ''}`;
      const desc = tl.description || '';
      const debit = tl.debit || 0;
      const credit = tl.credit || 0;
      const net = debit - credit;

      tbodyHtml += `
        <tr class="hover:bg-gray-50 transition-colors">
          <td>${date}</td>
          <td class="font-semibold text-gray-700">${num}</td>
          <td>${esc(third)}</td>
          <td><span class="font-semibold">${tl.expand?.account_id?.code || ''}</span></td>
          <td>${esc(desc)}</td>
          <td class="text-right text-gray-600">${fmt(debit)}</td>
          <td class="text-right text-gray-600">${fmt(credit)}</td>
          <td class="text-right font-semibold ${net < 0 ? 'text-red-600' : 'text-gray-700'}">${fmt(net)}</td>
          <td>
            <button class="btn btn-outline btn-xs" onclick="window.seeTxDetail('${txId}')" title="Ver asiento contable">
              <i class="fas fa-eye text-indigo-600"></i>
            </button>
          </td>
        </tr>`;
    });
    drilldownBody.innerHTML = tbodyHtml;
  }

  drilldownContainer.classList.remove('hidden');
  
  // Scroll down to the drilldown table smoothly
  drilldownContainer.scrollIntoView({ behavior: 'smooth' });
}

function exportDetailedBudgetToExcel() {
  const data = (window as any)._detailedBudgetReportData;
  if (!data) return;

  const wsMatrixData = [
    ['Ejecución Presupuestal Detallada - ' + data.budgetName + ' (' + data.budgetYear + ')'],
    [],
    ['Cuenta', 'Presupuesto Anual', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Total Ejecutado', 'Diferencia', '% Ejecución']
  ];
  
  data.budgetLines.forEach(l => {
    const diff = l.annual_amount - Math.abs(l.executed);
    const perc = l.annual_amount > 0 ? (Math.abs(l.executed) / l.annual_amount * 100) : 0;
    const code = l.expand?.account_id?.code || '';
    const name = l.expand?.account_id?.name || '';
    const row = [
      `${code} - ${name}`,
      l.annual_amount,
      ...l.monthly_executed.map(m => Math.abs(m)),
      Math.abs(l.executed),
      diff,
      perc / 100
    ];
    wsMatrixData.push(row);
  });
  
  const wsMatrix = (window as any).XLSX.utils.aoa_to_sheet(wsMatrixData);
  
  // Sheet 2: Transactions
  const wsTxData = [
    ['Detalle de Transacciones de Ejecución Presupuestal - ' + data.budgetName],
    [],
    ['Fecha', 'Comprobante', 'Tercero', 'Cuenta Contable', 'Descripción', 'Débito', 'Crédito', 'Neto']
  ];
  
  data.txLines.forEach(tl => {
    const dStr = tl.expand?.tx_id?.date || '';
    const num = tl.expand?.tx_id?.number || '';
    const third = tl.expand?.third_party_id?.name || 'Sin tercero';
    const acc = `${tl.expand?.account_id?.code || ''} - ${tl.expand?.account_id?.name || ''}`;
    const desc = tl.description || '';
    const net = (tl.debit || 0) - (tl.credit || 0);
    wsTxData.push([dStr, num, third, acc, desc, tl.debit || 0, tl.credit || 0, net]);
  });
  
  const wsTx = (window as any).XLSX.utils.aoa_to_sheet(wsTxData);
  
  const wb = (window as any).XLSX.utils.book_new();
  (window as any).XLSX.utils.book_append_sheet(wb, wsMatrix, 'Resumen Mensual');
  (window as any).XLSX.utils.book_append_sheet(wb, wsTx, 'Detalle de Transacciones');
  
  (window as any).XLSX.writeFile(wb, `Ejecucion_Presupuestal_Detallada_${data.budgetYear}_${todayStr()}.xlsx`);
}

async function exportDetailedBudgetToPdf() {
  const data = (window as any)._detailedBudgetReportData;
  if (!data) return;

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;
    const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
    const headerCtx = await getPdfHeaderContext();
    const header = drawPdfHeader(doc, headerCtx, {
      title: 'Reporte de Ejecución Presupuestal Detallada',
      subtitles: [
        `Presupuesto: ${data.budgetName} (${data.budgetYear})`,
        `Ejecutado Total: ${fmtPdfNum(data.budgetLines.reduce((s, l) => s + Math.abs(l.executed || 0), 0))}`
      ]
    });

    const columns = [
      { header: 'Cuenta', dataKey: 'account' },
      { header: 'Pres. Anual', dataKey: 'budget' },
      { header: 'Ene', dataKey: 'm1' },
      { header: 'Feb', dataKey: 'm2' },
      { header: 'Mar', dataKey: 'm3' },
      { header: 'Abr', dataKey: 'm4' },
      { header: 'May', dataKey: 'm5' },
      { header: 'Jun', dataKey: 'm6' },
      { header: 'Jul', dataKey: 'm7' },
      { header: 'Ago', dataKey: 'm8' },
      { header: 'Sep', dataKey: 'm9' },
      { header: 'Oct', dataKey: 'm10' },
      { header: 'Nov', dataKey: 'm11' },
      { header: 'Dic', dataKey: 'm12' },
      { header: 'Total Ejec.', dataKey: 'total' },
      { header: 'Diferencia', dataKey: 'diff' },
      { header: '% Ejec.', dataKey: 'perc' }
    ];

    const bodyData = data.budgetLines.map(l => {
      const diff = l.annual_amount - Math.abs(l.executed);
      const perc = l.annual_amount > 0 ? (Math.abs(l.executed) / l.annual_amount * 100) : 0;
      const code = l.expand?.account_id?.code || '';
      const name = l.expand?.account_id?.name || '';
      
      return {
        account: `${code} - ${name}`,
        budget: fmtPdfNum(l.annual_amount),
        m1: fmtPdfNum(Math.abs(l.monthly_executed[0])),
        m2: fmtPdfNum(Math.abs(l.monthly_executed[1])),
        m3: fmtPdfNum(Math.abs(l.monthly_executed[2])),
        m4: fmtPdfNum(Math.abs(l.monthly_executed[3])),
        m5: fmtPdfNum(Math.abs(l.monthly_executed[4])),
        m6: fmtPdfNum(Math.abs(l.monthly_executed[5])),
        m7: fmtPdfNum(Math.abs(l.monthly_executed[6])),
        m8: fmtPdfNum(Math.abs(l.monthly_executed[7])),
        m9: fmtPdfNum(Math.abs(l.monthly_executed[8])),
        m10: fmtPdfNum(Math.abs(l.monthly_executed[9])),
        m11: fmtPdfNum(Math.abs(l.monthly_executed[10])),
        m12: fmtPdfNum(Math.abs(l.monthly_executed[11])),
        total: fmtPdfNum(Math.abs(l.executed)),
        diff: fmtPdfNum(diff),
        perc: `${perc.toFixed(0)}%`
      };
    });

    // Add total row
    const totalBudget = data.budgetLines.reduce((s, l) => s + l.annual_amount, 0);
    const totalExecuted = data.budgetLines.reduce((s, l) => s + Math.abs(l.executed), 0);
    const totalDiff = totalBudget - totalExecuted;
    const totalPerc = totalBudget > 0 ? (totalExecuted / totalBudget * 100) : 0;

    const monthlyTotals = new Array(12).fill(0);
    data.budgetLines.forEach(l => {
      for (let i = 0; i < 12; i++) {
        monthlyTotals[i] += Math.abs(l.monthly_executed[i]);
      }
    });

    bodyData.push({
      account: 'TOTALES',
      budget: fmtPdfNum(totalBudget),
      m1: fmtPdfNum(monthlyTotals[0]),
      m2: fmtPdfNum(monthlyTotals[1]),
      m3: fmtPdfNum(monthlyTotals[2]),
      m4: fmtPdfNum(monthlyTotals[3]),
      m5: fmtPdfNum(monthlyTotals[4]),
      m6: fmtPdfNum(monthlyTotals[5]),
      m7: fmtPdfNum(monthlyTotals[6]),
      m8: fmtPdfNum(monthlyTotals[7]),
      m9: fmtPdfNum(monthlyTotals[8]),
      m10: fmtPdfNum(monthlyTotals[9]),
      m11: fmtPdfNum(monthlyTotals[10]),
      m12: fmtPdfNum(monthlyTotals[11]),
      total: fmtPdfNum(totalExecuted),
      diff: fmtPdfNum(totalDiff),
      perc: `${totalPerc.toFixed(0)}%`
    });

    (doc as any).autoTable({
      startY: header.startY,
      margin: { left: header.marginLeft, right: doc.internal.pageSize.getWidth() - header.marginRight },
      columns: columns,
      body: bodyData,
      theme: 'grid',
      styles: { fontSize: 6.5, cellPadding: 2 },
      headStyles: { fillColor: [13, 33, 55], textColor: 255, fontStyle: 'bold' },
      didDrawPage: (dt) => {
        drawPdfFooter(doc, dt.pageNumber);
      }
    });

    doc.save(`Ejecucion_Presupuestal_Detallada_${data.budgetYear}_${todayStr()}.pdf`);
  } catch (err: any) {
    showToast('Error al exportar PDF: ' + err.message, 'error');
  }
}

(window as any).renderWithholdingCertificates = renderWithholdingCertificates;
(window as any).renderPazYSalvoCertificate = renderPazYSalvoCertificate;
(window as any).renderIvaReport = renderIvaReport;
(window as any).renderRetencionesReport = renderRetencionesReport;
(window as any).generateIvaReportRows = generateIvaReportRows;
(window as any).generateRetReportRows = generateRetReportRows;
(window as any).exportIvaToExcel = exportIvaToExcel;
(window as any).exportIvaToPdf = exportIvaToPdf;
(window as any).exportRetToExcel = exportRetToExcel;
(window as any).exportRetToPdf = exportRetToPdf;
(window as any).renderSalesEmissionReport = renderSalesEmissionReport;
(window as any).renderSalesProductsReport = renderSalesProductsReport;
(window as any).renderSalesHeatmapReport = renderSalesHeatmapReport;
(window as any).renderCashFlowReport = renderCashFlowReport;
(window as any).generateCashFlowReportRows = generateCashFlowReportRows;
(window as any).exportCashFlowToExcel = exportCashFlowToExcel;
(window as any).exportCashFlowToPdf = exportCashFlowToPdf;
(window as any).renderFinancialAnalysisReport = renderFinancialAnalysisReport;
(window as any).generateFinancialAnalysisData = generateFinancialAnalysisData;
(window as any).renderDetailedBudgetExecutionReport = renderDetailedBudgetExecutionReport;
(window as any).generateDetailedBudgetExecutionData = generateDetailedBudgetExecutionData;
(window as any).showDetailedBudgetDrilldown = showDetailedBudgetDrilldown;
(window as any).exportDetailedBudgetToExcel = exportDetailedBudgetToExcel;
(window as any).exportDetailedBudgetToPdf = exportDetailedBudgetToPdf;
(window as any).launchReportModal = launchReportModal;

async function openPayRetencionesModal() {
  try {
    const metodosPago = await pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });
    if (!metodosPago.length) {
      return showToast('No hay métodos de pago o cuentas bancarias activas registradas.', 'warning');
    }

    const data = (window as any)._retReportData;
    if (!data) return;

    const bodyHtml = `
      <div class="space-y-4 text-sm text-left">
        <div class="p-3 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-100">
          <strong>Período:</strong> ${data.fromDate} a ${data.toDate}<br>
          <strong>Total Retenciones Practicadas a Pagar:</strong> ${fmt(data.netSuggested)}
        </div>
        <div class="form-group">
          <label class="form-label">Método / Banco / Caja</label>
          <select id="modal-pay-ret-cuenta" class="form-input">
            <option value="">— Seleccionar —</option>
            ${metodosPago.map((c: any) => `<option value="${c.id}" data-account="${c.account_id}">${esc(c.name)} (${esc(c.bank)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Pago</label>
          <input type="date" id="modal-pay-ret-date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <input type="text" id="modal-pay-ret-obs" class="form-input" value="Pago Retenciones Practicadas período ${data.fromDate} a ${data.toDate}">
        </div>
      </div>
    `;

    openModal(
      'Registrar Pago de Retenciones',
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-confirm-pay-ret" onclick="window._savePayRetenciones()"><i class="fas fa-check mr-2"></i>Registrar Pago</button>`,
      false
    );
  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

async function savePayRetenciones() {
  const ctaSelect = $('#modal-pay-ret-cuenta') as HTMLSelectElement;
  const dateInput = $('#modal-pay-ret-date') as HTMLInputElement;
  const obsInput = $('#modal-pay-ret-obs') as HTMLInputElement;

  const bankAccountId = ctaSelect?.value || '';
  const accountId = ctaSelect?.options[ctaSelect.selectedIndex]?.dataset?.account || '';
  const date = dateInput?.value || todayStr();
  const obs = obsInput?.value?.trim() || '';

  if (!bankAccountId || !accountId) {
    return showToast('Selecciona un método de pago válido.', 'warning');
  }

  const data = (window as any)._retReportData;
  if (!data || !data.pracLines || !data.pracLines.length) {
    return showToast('No hay datos de retenciones para pagar.', 'warning');
  }

  const btn = $('#btn-confirm-pay-ret') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Registrando...';
  }

  try {
    const typeRes = await pb.listAll('transaction_types', { filter: 'code="CE"' });
    if (!typeRes.length) throw new Error('No se encontró el tipo de transacción CE.');
    const txTypeId = typeRes[0].id;

    const grouped = new Map<string, number>();
    for (const l of data.pracLines) {
      const thirdPartyId = l.line.third_party_id || l.tx.third_party_id;
      if (!thirdPartyId) continue;
      const acctId = l.line.account_id;
      if (!acctId) continue;
      const key = `${acctId}|${thirdPartyId}`;
      const amount = Number(l.net || 0);
      grouped.set(key, (grouped.get(key) || 0) + amount);
    }

    const txLines = [];
    let totalPaid = 0;
    let lineOrder = 1;

    for (const [key, amount] of grouped.entries()) {
      if (Math.abs(amount) <= 0.01) continue;
      const [acctId, thirdPartyId] = key.split('|');
      txLines.push({
        account_id: acctId,
        third_party_id: thirdPartyId,
        debit: amount > 0 ? amount : 0,
        credit: amount < 0 ? Math.abs(amount) : 0,
        description: `Cierre Retención en la Fuente período ${data.fromDate} a ${data.toDate}`,
        line_order: lineOrder++
      });
      totalPaid += amount;
    }

    if (txLines.length === 0) {
      throw new Error('El saldo neto a pagar para el período seleccionado es cero.');
    }

    txLines.push({
      account_id: accountId,
      debit: 0,
      credit: totalPaid,
      description: `Salida de Caja/Bancos por Pago de Retenciones`,
      line_order: lineOrder++
    });

    const txRecord = await (window as any).API.createTransaction({
      tx_type_id: txTypeId,
      date: date,
      description: obs || `Pago Retenciones Practicadas Periodo ${data.fromDate} a ${data.toDate}`,
      status: 'active'
    }, txLines);

    closeModal();
    showToast(`Comprobante de Egreso ${txRecord.number} creado exitosamente.`, 'success');
    generateRetReportRows();
  } catch (err: any) {
    showToast(`Error al registrar pago: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i>Registrar Pago';
    }
  }
}

async function openPayIvaModal() {
  try {
    const metodosPago = await pb.listAll('bank_accounts', { expand: 'account_id', filter: 'active=true', sort: 'name' });
    if (!metodosPago.length) {
      return showToast('No hay métodos de pago o cuentas bancarias activas registradas.', 'warning');
    }

    const data = (window as any)._ivaReportData;
    if (!data) return;

    const bodyHtml = `
      <div class="space-y-4 text-sm text-left">
        <div class="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
          <strong>Período:</strong> ${data.fromDate} a ${data.toDate}<br>
          <strong>Impuesto Neto a Pagar:</strong> ${fmt(data.netSuggested)}
        </div>
        <div class="form-group">
          <label class="form-label">Método / Banco / Caja</label>
          <select id="modal-pay-iva-cuenta" class="form-input">
            <option value="">— Seleccionar —</option>
            ${metodosPago.map((c: any) => `<option value="${c.id}" data-account="${c.account_id}">${esc(c.name)} (${esc(c.bank)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Pago</label>
          <input type="date" id="modal-pay-iva-date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Observaciones</label>
          <input type="text" id="modal-pay-iva-obs" class="form-input" value="Pago IVA período ${data.fromDate} a ${data.toDate}">
        </div>
      </div>
    `;

    openModal(
      'Registrar Pago de IVA',
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="btn-confirm-pay-iva" onclick="window._savePayIva()"><i class="fas fa-check mr-2"></i>Registrar Pago</button>`,
      false
    );
  } catch (err: any) {
    showToast(err.message, 'error');
  }
}

async function savePayIva() {
  const ctaSelect = $('#modal-pay-iva-cuenta') as HTMLSelectElement;
  const dateInput = $('#modal-pay-iva-date') as HTMLInputElement;
  const obsInput = $('#modal-pay-iva-obs') as HTMLInputElement;

  const bankAccountId = ctaSelect?.value || '';
  const accountId = ctaSelect?.options[ctaSelect.selectedIndex]?.dataset?.account || '';
  const date = dateInput?.value || todayStr();
  const obs = obsInput?.value?.trim() || '';

  if (!bankAccountId || !accountId) {
    return showToast('Selecciona un método de pago válido.', 'warning');
  }

  const data = (window as any)._ivaReportData;
  if (!data) return;

  const btn = $('#btn-confirm-pay-iva') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Registrando...';
  }

  try {
    const typeRes = await pb.listAll('transaction_types', { filter: 'code="CE"' });
    if (!typeRes.length) throw new Error('No se encontró el tipo de transacción CE.');
    const txTypeId = typeRes[0].id;

    const genGrouped = new Map<string, number>();
    for (const l of data.genLines) {
      const thirdPartyId = l.line.third_party_id || l.tx.third_party_id;
      if (!thirdPartyId) continue;
      const acctId = l.line.account_id;
      if (!acctId) continue;
      const key = `${acctId}|${thirdPartyId}`;
      const amount = Number(l.net || 0);
      genGrouped.set(key, (genGrouped.get(key) || 0) + amount);
    }

    const descGrouped = new Map<string, number>();
    for (const l of data.descLines) {
      const thirdPartyId = l.line.third_party_id || l.tx.third_party_id;
      if (!thirdPartyId) continue;
      const acctId = l.line.account_id;
      if (!acctId) continue;
      const key = `${acctId}|${thirdPartyId}`;
      const amount = Number(l.net || 0);
      descGrouped.set(key, (descGrouped.get(key) || 0) + amount);
    }

    const txLines = [];
    let lineOrder = 1;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const [key, amount] of genGrouped.entries()) {
      if (Math.abs(amount) <= 0.01) continue;
      const [acctId, thirdPartyId] = key.split('|');
      txLines.push({
        account_id: acctId,
        third_party_id: thirdPartyId,
        debit: amount > 0 ? amount : 0,
        credit: amount < 0 ? Math.abs(amount) : 0,
        description: `Cierre IVA Generado período ${data.fromDate} a ${data.toDate}`,
        line_order: lineOrder++
      });
      totalDebit += amount;
    }

    for (const [key, amount] of descGrouped.entries()) {
      if (Math.abs(amount) <= 0.01) continue;
      const [acctId, thirdPartyId] = key.split('|');
      txLines.push({
        account_id: acctId,
        third_party_id: thirdPartyId,
        debit: amount < 0 ? Math.abs(amount) : 0,
        credit: amount > 0 ? amount : 0,
        description: `Cierre IVA Descontable período ${data.fromDate} a ${data.toDate}`,
        line_order: lineOrder++
      });
      totalCredit += amount;
    }

    const netPayable = totalDebit - totalCredit;
    if (Math.abs(netPayable) <= 0.01 && txLines.length === 0) {
      throw new Error('El saldo neto de IVA a pagar en el período es cero.');
    }

    if (netPayable > 0.01) {
      txLines.push({
        account_id: accountId,
        debit: 0,
        credit: netPayable,
        description: `Salida de Caja/Bancos por Pago de IVA`,
        line_order: lineOrder++
      });
    } else if (netPayable < -0.01) {
      txLines.push({
        account_id: accountId,
        debit: Math.abs(netPayable),
        credit: 0,
        description: `Ingreso a Caja/Bancos por Excedente de IVA / Saldo a Favor`,
        line_order: lineOrder++
      });
    }

    const txRecord = await (window as any).API.createTransaction({
      tx_type_id: txTypeId,
      date: date,
      description: obs || `Pago IVA Periodo ${data.fromDate} a ${data.toDate}`,
      status: 'active'
    }, txLines);

    closeModal();
    showToast(`Comprobante de Egreso ${txRecord.number} creado exitosamente.`, 'success');
    generateIvaReportRows();
  } catch (err: any) {
    showToast(`Error al registrar pago: ${err.message}`, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check mr-2"></i>Registrar Pago';
    }
  }
}

(window as any)._openPayRetencionesModal = openPayRetencionesModal;
(window as any)._savePayRetenciones = savePayRetenciones;
(window as any)._openPayIvaModal = openPayIvaModal;
(window as any)._savePayIva = savePayIva;

// ─────────────────────────────────────────────────────────────────────────────
// MÓDULO: Notas a los Estados Financieros (Revelaciones)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Motor de sugerencias deterministas.
 * Genera un párrafo de revelación basándose en el código PUC raíz del rubro,
 * su saldo actual, el saldo comparativo y los movimientos del periodo.
 *
 * @param cuentaCodigo  Código raíz PUC del rubro (ej: '11', '13', '41')
 * @param titulo        Nombre del rubro
 * @param saldoActual   Saldo al cierre del periodo
 * @param saldoAnterior Saldo al cierre del periodo comparativo
 * @param periodo       YYYY-MM del periodo
 * @returns             Texto sugerido para la nota
 */
function buildNoteSuggestion(
  cuentaCodigo: string,
  titulo: string,
  saldoActual: number,
  saldoAnterior: number,
  periodo: string
): string {
  const cod = String(cuentaCodigo || '').trim();
  const now = Number(saldoActual || 0);
  const prev = Number(saldoAnterior || 0);
  const varPct = prev !== 0 ? Math.round(((now - prev) / Math.abs(prev)) * 100) : 0;
  const fmtV = (n: number) => Math.abs(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  const varTexto = varPct === 0
    ? 'sin variación significativa respecto al periodo anterior'
    : varPct > 0
      ? `con un incremento del ${varPct}% respecto al periodo anterior`
      : `con una disminución del ${Math.abs(varPct)}% respecto al periodo anterior`;
  const periodoTexto = periodo || 'el periodo actual';

  // ── Clase 1: Activo ──────────────────────────────────────────────────────
  if (cod.startsWith('11')) {
    return `Al cierre de ${periodoTexto}, el rubro "${titulo}" presenta un saldo de ${fmtV(now)}, ` +
      `${varTexto}. Corresponde a recursos disponibles en caja y cuentas bancarias de la empresa, ` +
      `valorados al costo histórico. Los recursos en moneda extranjera, de existir, han sido ` +
      `reexpresados a la tasa de cambio representativa del mercado vigente al cierre del periodo.`;
  }
  if (cod.startsWith('12')) {
    return `El rubro "${titulo}" asciende a ${fmtV(now)} al cierre de ${periodoTexto}, ` +
      `${varTexto}. Comprende inversiones en títulos valores y participaciones en otras entidades, ` +
      `registradas al costo de adquisición ajustado por el método de participación o al valor razonable ` +
      `según la política contable vigente.`;
  }
  if (cod.startsWith('13')) {
    const alertaMora = now > 0 && prev > 0 && varPct > 20
      ? ' Se recomienda revisar la política de provisiones de cartera dado el incremento observado.'
      : '';
    return `La cartera de "${titulo}" al cierre de ${periodoTexto} asciende a ${fmtV(now)}, ` +
      `${varTexto}. Comprende las obligaciones de clientes y deudores por operaciones comerciales ` +
      `normales. La empresa aplica una política de provisión individual y/o general conforme a las ` +
      `normas contables vigentes.${alertaMora}`;
  }
  if (cod.startsWith('14')) {
    return `Los inventarios de "${titulo}" presentan un saldo de ${fmtV(now)} al cierre de ` +
      `${periodoTexto}, ${varTexto}. El costo se determina por el método de ` +
      `promedio ponderado. El inventario se ha valorado al costo o al valor neto de realización, ` +
      `el que resulte menor, conforme a las políticas contables de la empresa.`;
  }
  if (cod.startsWith('15') || cod.startsWith('16') || cod.startsWith('17')) {
    return `El rubro "${titulo}" presenta un saldo de ${fmtV(now)} al cierre de ${periodoTexto}, ` +
      `${varTexto}. Los activos se contabilizan al costo histórico menos la depreciación acumulada ` +
      `y las pérdidas por deterioro. La depreciación se calcula por el método de línea recta ` +
      `sobre la vida útil estimada de cada activo.`;
  }
  if (cod.startsWith('19')) {
    return `El saldo de "${titulo}" al cierre de ${periodoTexto} asciende a ${fmtV(now)}, ` +
      `${varTexto}. Comprende activos diferidos, cargos diferidos u otros activos no clasificados ` +
      `en las partidas anteriores. Se amortizan con cargo a resultados durante su vida útil estimada.`;
  }
  if (cod.startsWith('1')) {
    return `El rubro de activos "${titulo}" presenta un saldo de ${fmtV(now)} ` +
      `al cierre de ${periodoTexto}, ${varTexto}.`;
  }

  // ── Clase 2: Pasivo ──────────────────────────────────────────────────────
  if (cod.startsWith('21')) {
    return `Las obligaciones financieras de "${titulo}" ascienden a ${fmtV(now)} al cierre de ` +
      `${periodoTexto}, ${varTexto}. Corresponden a créditos contratados con entidades financieras ` +
      `para capital de trabajo y/o adquisición de activos. Las tasas de interés y vencimientos ` +
      `están detallados en los documentos soporte de cada obligación.`;
  }
  if (cod.startsWith('22') || cod.startsWith('23')) {
    return `Las obligaciones con proveedores y cuentas por pagar de "${titulo}" ascienden a ` +
      `${fmtV(now)} al cierre de ${periodoTexto}, ${varTexto}. Corresponden a compromisos ` +
      `con proveedores de bienes y servicios por operaciones normales de la empresa, ` +
      `contabilizados al valor histórico de la obligación.`;
  }
  if (cod.startsWith('24') || cod.startsWith('25')) {
    return `El rubro "${titulo}" presenta un pasivo de ${fmtV(now)} al cierre de ${periodoTexto}, ` +
      `${varTexto}. Comprende impuestos, contribuciones y obligaciones laborales causadas ` +
      `y pendientes de pago conforme a la normativa vigente.`;
  }
  if (cod.startsWith('27')) {
    return `Las diferidas e ingresos anticipados de "${titulo}" ascienden a ${fmtV(now)} ` +
      `al cierre de ${periodoTexto}, ${varTexto}. Corresponden a ingresos recibidos por anticipado ` +
      `que se reconocerán en resultados en los periodos futuros conforme se presten los servicios ` +
      `o se entreguen los bienes contratados.`;
  }
  if (cod.startsWith('2')) {
    return `El pasivo "${titulo}" presenta un saldo de ${fmtV(now)} al cierre de ${periodoTexto}, ` +
      `${varTexto}.`;
  }

  // ── Clase 3: Patrimonio ───────────────────────────────────────────────────
  if (cod.startsWith('31')) {
    return `El capital social suscrito y pagado de la empresa asciende a ${fmtV(now)} ` +
      `al cierre de ${periodoTexto}, ${varTexto}. ` +
      `Representa los aportes efectuados por los socios conforme a los estatutos sociales vigentes.`;
  }
  if (cod.startsWith('33')) {
    return `Las reservas de "${titulo}" ascienden a ${fmtV(now)} al cierre de ${periodoTexto}, ` +
      `${varTexto}. Se constituyen conforme a disposiciones legales y estatutarias, ` +
      `y representan recursos apropiados de las utilidades para fines específicos.`;
  }
  if (cod.startsWith('36') || cod.startsWith('37')) {
    return `Los resultados acumulados de "${titulo}" presentan un saldo de ${fmtV(now)} ` +
      `al cierre de ${periodoTexto}, ${varTexto}. ` +
      `Corresponden a utilidades o pérdidas de ejercicios anteriores pendientes de distribución o aplicación.`;
  }
  if (cod.startsWith('3')) {
    return `El patrimonio "${titulo}" presenta un saldo de ${fmtV(now)} al cierre de ${periodoTexto}, ` +
      `${varTexto}.`;
  }

  // ── Clase 4: Ingresos ─────────────────────────────────────────────────────
  if (cod.startsWith('41')) {
    return `Los ingresos operacionales de "${titulo}" en ${periodoTexto} ascendieron a ${fmtV(Math.abs(now))}, ` +
      `${varTexto}. Provienen de la actividad principal del objeto social de la empresa ` +
      `y se reconocen cuando es probable que los beneficios económicos fluyan hacia la entidad ` +
      `y el importe puede medirse con fiabilidad.`;
  }
  if (cod.startsWith('42')) {
    return `Los ingresos no operacionales de "${titulo}" en ${periodoTexto} ascendieron a ${fmtV(Math.abs(now))}, ` +
      `${varTexto}. Corresponden a ingresos obtenidos fuera de la actividad principal, ` +
      `tales como rendimientos financieros, arrendamientos u otros conceptos.`;
  }
  if (cod.startsWith('4')) {
    return `El ingreso "${titulo}" en ${periodoTexto} ascendió a ${fmtV(Math.abs(now))}, ${varTexto}.`;
  }

  // ── Clase 5: Gastos ───────────────────────────────────────────────────────
  if (cod.startsWith('51')) {
    return `Los gastos de administración de "${titulo}" en ${periodoTexto} ascendieron a ${fmtV(now)}, ` +
      `${varTexto}. Comprenden todos los desembolsos necesarios para la administración y ` +
      `operación general de la empresa, incluyendo personal, arrendamientos y servicios.`;
  }
  if (cod.startsWith('52')) {
    return `Los gastos de ventas de "${titulo}" en ${periodoTexto} ascendieron a ${fmtV(now)}, ` +
      `${varTexto}. Corresponden a los costos directamente relacionados con la ` +
      `comercialización de los productos o servicios de la empresa.`;
  }
  if (cod.startsWith('5')) {
    return `El gasto "${titulo}" en ${periodoTexto} ascendió a ${fmtV(now)}, ${varTexto}.`;
  }

  // ── Clase 6: Costos ───────────────────────────────────────────────────────
  if (cod.startsWith('6')) {
    return `El costo de ventas de "${titulo}" en ${periodoTexto} ascendió a ${fmtV(now)}, ` +
      `${varTexto}. Comprende el valor de los inventarios vendidos y los costos directos ` +
      `de producción o prestación del servicio durante el periodo.`;
  }

  // ── Clase 7: Otros gastos ─────────────────────────────────────────────────
  if (cod.startsWith('7')) {
    return `Los otros gastos de "${titulo}" en ${periodoTexto} ascendieron a ${fmtV(now)}, ` +
      `${varTexto}. Corresponden a gastos no operacionales o de naturaleza especial ` +
      `no clasificados en las categorías anteriores.`;
  }

  // ── Genérico ──────────────────────────────────────────────────────────────
  return `El rubro "${titulo}" presenta un saldo de ${fmtV(now)} al cierre de ${periodoTexto}, ` +
    `${varTexto}. Ver detalle en los soportes contables del periodo.`;
}

/**
 * Dibuja las notas guardadas en un documento jsPDF ya generado (ESF o ER).
 * Se llama justo antes de hacer doc.save().
 *
 * @param doc      Instancia de jsPDF activa
 * @param notas    Array de registros de financial_notes
 * @param marginLeft   Margen izquierdo (puntos)
 * @param pageWidth    Ancho de página (puntos)
 */
function drawNotesInPdf(
  doc: any,
  notas: any[],
  marginLeft: number,
  pageWidth: number,
  accounts: any[],
  balNow: Record<string, number>,
  balCmp: Record<string, number>
): number {
  if (!notas || notas.length === 0) return 0;
  const right = pageWidth - 24;

  doc.addPage();
  let y = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(13, 33, 55);
  doc.text('NOTAS A LOS ESTADOS FINANCIEROS', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('(Cifras expresadas en pesos colombianos)', pageWidth / 2, y, { align: 'center' });
  y += 14;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(marginLeft, y, right, y);
  y += 12;

  const maxWidth = right - marginLeft;
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const nota of notas) {
    const texto = (nota.contenido || nota.sugerido || '').trim();
    if (!texto) continue;

    // Encabezado de la nota
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(13, 33, 55);
    const tituloLine = `Nota ${nota.nota_num}. ${nota.titulo || ''}`;

    // Control de salto de página
    if (y + 18 > pageHeight - 30) {
      doc.addPage();
      y = 40;
    }
    doc.text(tituloLine, marginLeft, y);
    y += 10;

    // Cuerpo de la nota
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 55, 55);
    const lines = doc.splitTextToSize(texto, maxWidth);
    for (const line of lines) {
      if (y + 9 > pageHeight - 30) {
        doc.addPage();
        y = 40;
      }
      doc.text(line, marginLeft, y);
      y += 9;
    }
    y += 8;

    // Dibujar tabla de soporte si aplica (si tiene cuenta_codigo)
    if (nota.cuenta_codigo && accounts && balNow && balCmp) {
      const prefixes = String(nota.cuenta_codigo).split(',');
      const supportingData = getNoteSupportingData(accounts, balNow, balCmp, prefixes);
      if (supportingData.length > 0) {
        if (y + 40 > pageHeight - 30) {
          doc.addPage();
          y = 40;
        }

        doc.autoTable({
          startY: y,
          head: [['Código', 'Concepto / Cuenta', 'Saldo Actual', 'Saldo Anterior', 'Variación']],
          body: supportingData.map(d => [
            d.code,
            d.name,
            fmtPdfSignedNum(d.now),
            fmtPdfSignedNum(d.cmp),
            fmtPdfSignedNum(d.variation)
          ]),
          theme: 'plain',
          margin: { left: marginLeft, right: 24 },
          styles: { font: 'helvetica', fontSize: 6.5, textColor: [70, 70, 70], cellPadding: 2 },
          headStyles: { fillColor: [245, 245, 245], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 260 },
            2: { cellWidth: 80, halign: 'right' },
            3: { cellWidth: 80, halign: 'right' },
            4: { cellWidth: 70, halign: 'right' },
          }
        });
        y = doc.lastAutoTable.finalY + 12;
      }
    }
  }
  return y;
}

/**
 * Obtiene las notas guardadas en DB para un periodo y tipo de informe.
 * Retorna array vacío si no hay ninguna o si falla la consulta.
 */
async function loadFinancialNotes(periodo: string, tipoInforme?: 'ESF' | 'ER'): Promise<any[]> {
  try {
    let filter = `periodo="${periodo}"`;
    if (tipoInforme) {
      filter += ` && tipo_informe="${tipoInforme}"`;
    }
    const items = await pb.listAll('financial_notes', {
      filter,
      sort: 'nota_num',
    });
    return items || [];
  } catch (_) {
    return [];
  }
}

/**
 * Pantalla principal del gestor de Notas a los Estados Financieros.
 * Permite sincronizar, redactar, obtener sugerencias automáticas e imprimir.
 */
async function renderFinancialNotesManager(): Promise<void> {
  const view = getReportViewHost();
  if (!view) return;

  const today = todayStr();
  const currentMonthDefault = today.slice(0, 7);
  const currentYear = today.slice(0, 4);
  const firstMonthDefault = `${currentYear}-01`;
  const defaultSignaturesSetting = await getSettingFirst(['trial_show_signatures_default', 'show_signatures_default'], '0');
  const signaturesChecked = String(defaultSignaturesSetting).trim() === '1' || String(defaultSignaturesSetting).toLowerCase() === 'true';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-1" style="color:#0D2137">
        <i class="fas fa-file-lines mr-2" style="color:#1A4B8C"></i>Notas a los Estados Financieros
      </h4>
      <p class="text-xs mb-3" style="color:#6B7280">
        Redacte las revelaciones de cada nota, sincronícelas desde el informe y obtenga sugerencias automáticas basadas en los movimientos contables.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div class="form-group">
          <label class="form-label">Mes Desde</label>
          <input id="fn-periodo-desde" type="month" class="form-input" value="${firstMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Mes Hasta</label>
          <input id="fn-periodo-hasta" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group flex items-end gap-2">
          <button class="btn btn-primary w-full" id="btn-fn-sync" title="Genera los registros de nota desde el informe del periodo seleccionado">
            <i class="fas fa-rotate mr-1"></i>Sincronizar desde informe
          </button>
        </div>
        <div class="form-group flex items-end gap-2">
          <button class="btn btn-outline w-full" id="btn-fn-pdf" disabled>
            <i class="fas fa-file-pdf mr-1"></i>Imprimir Notas PDF
          </button>
        </div>
      </div>

      <!-- Barra de acciones rápidas -->
      <div class="flex flex-wrap gap-4 mb-2 items-center">
        <button class="btn btn-sm" style="background:#F0FDF4;color:#166534;border:1px solid #BBF7D0" id="btn-fn-suggest-all" disabled>
          <i class="fas fa-wand-magic-sparkles mr-1"></i>Sugerir todas
        </button>
        <button class="btn btn-sm" style="background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE" id="btn-fn-save-all" disabled>
          <i class="fas fa-floppy-disk mr-1"></i>Guardar todas
        </button>
        <label class="inline-flex items-center gap-2 text-xs" style="color:#374151">
          <input id="fn-show-signatures" type="checkbox" ${signaturesChecked ? 'checked' : ''}>
          Incluir firmas en PDF
        </label>
        <span id="fn-status-msg" class="text-xs self-center" style="color:#6B7280"></span>
      </div>
    </div>

    <div id="fn-notes-area" class="p-4">
      <div class="p-8 text-center" style="color:#9CA3AF">
        <i class="fas fa-arrow-up-from-bracket mr-2"></i>
        Selecciona el tipo de informe y el periodo, luego pulsa <strong>Sincronizar desde informe</strong>.
      </div>
    </div>`;

  // Estado local de las notas en pantalla
  let notasLocales: any[] = []; // { nota_num, titulo, cuenta_codigo, contenido, sugerido, revisado, _id?, _dirty }
  let currentBalNow: Record<string, number> = {};
  let currentBalCmp: Record<string, number> = {};
  let currentAccounts: any[] = [];

  const getPeriodoVal = (): string => {
    const desde = (document.getElementById('fn-periodo-desde') as HTMLInputElement)?.value || '';
    const hasta = (document.getElementById('fn-periodo-hasta') as HTMLInputElement)?.value || '';
    return desde === hasta ? desde : `${desde}_a_${hasta}`;
  };

  const getStatusEl = () => $('#fn-status-msg') as HTMLElement | null;
  const setStatus = (msg: string, color = '#6B7280') => {
    const el = getStatusEl();
    if (el) { el.textContent = msg; el.style.color = color; }
  };

  /** Renderiza la lista de notas en el área de edición */
  const renderNotesList = (notas: any[]) => {
    const area = $('#fn-notes-area');
    if (!area) return;
    if (!notas.length) {
      area.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-file-circle-question mr-2"></i>No hay notas para este periodo. Pulsa <strong>Sincronizar desde informe</strong>.</div>';
      return;
    }

    area.innerHTML = notas.map((n, idx) => {
      const hasSugerido = (n.sugerido || '').trim().length > 0;
      const isRevisado = n.revisado;
      const badge = isRevisado
        ? '<span class="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style="background:#D1FAE5;color:#065F46">Revisada</span>'
        : '<span class="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style="background:#FEF3C7;color:#92400E">Pendiente</span>';

      let tableHtml = '';
      if (n.cuenta_codigo) {
        const prefixes = String(n.cuenta_codigo).split(',');
        const supportingData = getNoteSupportingData(currentAccounts, currentBalNow, currentBalCmp, prefixes);
        if (supportingData.length > 0) {
          const rows = supportingData.map(d => `
            <tr class="border-b" style="border-color:#F3F4F6">
              <td class="p-2 text-xs font-mono text-gray-500">${esc(d.code)}</td>
              <td class="p-2 text-xs text-gray-700">${esc(d.name)}</td>
              <td class="p-2 text-xs text-right font-medium" style="color:#0D2137">${esc(fmt(d.now))}</td>
              <td class="p-2 text-xs text-right text-gray-500">${esc(fmt(d.cmp))}</td>
              <td class="p-2 text-xs text-right font-semibold ${d.variation >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
                ${d.variation >= 0 ? '+' : ''}${esc(fmt(d.variation))}
              </td>
            </tr>
          `).join('');

          tableHtml = `
            <div class="mt-4 mb-3 border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
              <div class="px-3 py-1.5 text-xs font-semibold flex items-center justify-between" style="background:#F9FAFB;color:#374151;border-bottom:1px solid #E5E7EB">
                <span><i class="fas fa-table mr-1.5 text-gray-500"></i>Detalle de Soporte y Evidencia (Cifras Consolidadas)</span>
                <span class="text-xxs px-2 py-0.5 rounded-full font-medium" style="background:#EEF2F6;color:#475569">NIIF</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr style="background:#FBFBFB;color:#4B5563;border-bottom:1px solid #E5E7EB">
                      <th class="p-2 text-xs font-bold" style="width:12%">Código</th>
                      <th class="p-2 text-xs font-bold" style="width:48%">Cuenta / Concepto</th>
                      <th class="p-2 text-xs font-bold text-right" style="width:14%">Saldo Actual</th>
                      <th class="p-2 text-xs font-bold text-right" style="width:14%">Saldo Anterior</th>
                      <th class="p-2 text-xs font-bold text-right" style="width:12%">Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
            </div>`;
        }
      }

      return `<div class="border rounded-xl mb-3 overflow-hidden" style="border-color:#E5E7EB" id="fn-card-${idx}">
        <div class="flex items-center gap-3 px-4 py-2 cursor-pointer" style="background:#F9FAFB" onclick="document.getElementById('fn-body-${idx}').classList.toggle('hidden')">
          <span class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" style="background:#1A4B8C;color:#fff;min-width:2rem">${n.nota_num}</span>
          <span class="font-semibold text-sm flex-1" style="color:#0D2137">${esc(n.titulo || 'Sin título')}</span>
          ${badge}
          <i class="fas fa-chevron-down text-xs" style="color:#9CA3AF"></i>
        </div>
        <div id="fn-body-${idx}" class="p-4">
          ${hasSugerido ? `
          <div class="mb-3 p-3 rounded-lg text-xs" style="background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF">
            <div class="font-semibold mb-1"><i class="fas fa-wand-magic-sparkles mr-1"></i>Sugerencia automática</div>
            <p style="white-space:pre-line">${esc(n.sugerido)}</p>
            <button class="btn btn-xs mt-2" style="background:#DBEAFE;color:#1E40AF;border:none;padding:3px 10px;font-size:11px" onclick="_fnAcceptSuggestion(${idx})">
              <i class="fas fa-check mr-1"></i>Usar esta sugerencia
            </button>
          </div>` : ''}
          <label class="form-label mb-1">Texto de la revelación (editable)</label>
          <textarea
            id="fn-txt-${idx}"
            class="form-input w-full"
            rows="5"
            placeholder="Redacte aquí el texto completo de la nota ${n.nota_num}..."
            oninput="_fnMarkDirty(${idx})"
            style="font-size:13px;line-height:1.6;resize:vertical"
          >${esc(n.contenido || '')}</textarea>
          ${tableHtml}
          <div class="flex gap-2 mt-2 justify-end">
            ${!hasSugerido ? `<button class="btn btn-xs" style="background:#F0FDF4;color:#166534;border:1px solid #BBF7D0" onclick="_fnSuggestOne(${idx})">
              <i class="fas fa-wand-magic-sparkles mr-1"></i>Sugerir
            </button>` : ''}
            <button class="btn btn-xs" style="background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE" onclick="_fnSaveOne(${idx})">
              <i class="fas fa-floppy-disk mr-1"></i>Guardar nota
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

    // Habilitar botones de acciones globales
    const btnSuggestAll = $('#btn-fn-suggest-all') as HTMLButtonElement | null;
    const btnSaveAll = $('#btn-fn-save-all') as HTMLButtonElement | null;
    const btnPdf = $('#btn-fn-pdf') as HTMLButtonElement | null;
    if (btnSuggestAll) btnSuggestAll.disabled = false;
    if (btnSaveAll) btnSaveAll.disabled = false;
    if (btnPdf) btnPdf.disabled = false;
  };

  /** Sincronizar: ejecuta el informe y extrae los rubros con nota */
  const syncFromReport = async () => {
    const desde = (document.getElementById('fn-periodo-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('fn-periodo-hasta') as HTMLInputElement)?.value;
    if (!desde || !hasta) return showToast('Selecciona el lapso de tiempo.', 'warning');
    if (desde > hasta) return showToast('La fecha Desde no puede ser posterior a Hasta.', 'warning');

    const periodo = getPeriodoVal();

    setStatus('Generando informe y extrayendo notas…', '#D97706');
    const area = $('#fn-notes-area');
    if (area) area.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Procesando informe...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();
      const { transactions, txLines: allTxLines } = await ensureLedgerData();

      // Calcular saldos al cierre del periodo (mes de fin)
      const yearHasta = Number(hasta.slice(0, 4));
      const monthHasta = Number(hasta.slice(5, 7));
      const lastDayCurrent = new Date(yearHasta, monthHasta, 0);
      const reportDate = `${lastDayCurrent.getFullYear()}-${String(lastDayCurrent.getMonth() + 1).padStart(2, '0')}-${String(lastDayCurrent.getDate()).padStart(2, '0')}`;

      // Calcular saldos al mes anterior del inicio (desde)
      const yearDesde = Number(desde.slice(0, 4));
      const monthDesde = Number(desde.slice(5, 7));
      const prevMonth = monthDesde === 1 ? `${yearDesde - 1}-12` : `${yearDesde}-${String(monthDesde - 1).padStart(2, '0')}`;
      const lastDayPrev = new Date(Number(prevMonth.slice(0, 4)), Number(prevMonth.slice(5, 7)), 0);
      const compareDate = `${lastDayPrev.getFullYear()}-${String(lastDayPrev.getMonth() + 1).padStart(2, '0')}-${String(lastDayPrev.getDate()).padStart(2, '0')}`;

      // buildBalancesAt está definida dentro de renderFinancialPosition — re-implementamos aquí
      const computeBalances = (cutoff: string): Record<string, number> => {
        const txById: Record<string, any> = Object.fromEntries(transactions.map((t: any) => [t.id, t]));
        const byAcc: Record<string, number> = Object.fromEntries(accounts.map((a: any) => [a.id, 0]));
        for (const line of allTxLines) {
          const tx = txById[line.tx_id];
          if (!tx || tx.status !== 'active' || !tx.date) continue;
          if (String(tx.date) > cutoff) continue;
          byAcc[line.account_id] = Number(byAcc[line.account_id] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
        }
        return byAcc;
      };

      const balNow = computeBalances(reportDate);
      const balCmp = computeBalances(compareDate);

      currentAccounts = accounts;
      currentBalNow = balNow;
      currentBalCmp = balCmp;

      interface NoteMapping {
        notaNum: number;
        titulo: string;
        prefixes: string[];
      }

      const ALL_MAPPING: NoteMapping[] = [
        { notaNum: 3.1, titulo: 'Efectivo o Equivalente al Efectivo', prefixes: ['11'] },
        { notaNum: 3.2, titulo: 'Cuentas Comerciales y Otras Cuentas por Cobrar', prefixes: ['12', '13'] },
        { notaNum: 3.3, titulo: 'Inventarios', prefixes: ['14'] },
        { notaNum: 3.4, titulo: 'Propiedades, Planta y Equipo / Otros Activos', prefixes: ['15', '16', '17', '18', '19'] },
        { notaNum: 3.5, titulo: 'Cuentas por Pagar y Obligaciones Financieras', prefixes: ['21', '22', '23'] },
        { notaNum: 3.6, titulo: 'Otros Pasivos no Financieros', prefixes: ['24', '25', '26', '27', '28', '29'] },
        { notaNum: 3.7, titulo: 'Patrimonio', prefixes: ['3'] },
        { notaNum: 4, titulo: 'Ingresos por Actividades Ordinarias', prefixes: ['4'] },
        { notaNum: 5, titulo: 'Costos y Gastos Operacionales', prefixes: ['5', '6', '7'] }
      ];

      const EPS = 0.01;

      // Cargar notas ya guardadas en DB para este periodo (ambas ESF y ER)
      const existentes = await loadFinancialNotes(periodo);
      const existentesByNum = new Map(existentes.map((n: any) => [Number(n.nota_num), n]));

      const tempNotas = [];

      // 1. Agregar Nota 1 (Información General)
      const ext1 = existentesByNum.get(1);
      const content1 = ext1 ? ext1.contenido : await getPopulatedTemplate(TEMPLATE_NOTE_1, periodo);
      const sugg1 = ext1 ? ext1.sugerido : content1;
      tempNotas.push({
        nota_num: 1,
        titulo: 'Información General',
        cuenta_codigo: '',
        saldoNow: 0,
        saldoCmp: 0,
        contenido: content1,
        sugerido: sugg1,
        revisado: ext1 ? ext1.revisado : false,
        _id: ext1 ? ext1.id : null,
        _dirty: false
      });

      // 2. Agregar Nota 2 (Políticas Contables Significativas)
      const ext2 = existentesByNum.get(2);
      const content2 = ext2 ? ext2.contenido : await getPopulatedTemplate(TEMPLATE_NOTE_2, periodo);
      const sugg2 = ext2 ? ext2.sugerido : content2;
      tempNotas.push({
        nota_num: 2,
        titulo: 'Políticas Contables Significativas',
        cuenta_codigo: '',
        saldoNow: 0,
        saldoCmp: 0,
        contenido: content2,
        sugerido: sugg2,
        revisado: ext2 ? ext2.revisado : false,
        _id: ext2 ? ext2.id : null,
        _dirty: false
      });

      // 3. Agregar notas específicas basadas en la actividad de las cuentas
      for (const mapItem of ALL_MAPPING) {
        let sumNow = 0;
        let sumCmp = 0;
        
        // Sumar todos los descendientes que empiecen por los prefijos mapeados
        for (const child of accounts) {
          const childCode = String(child.code || '');
          if (mapItem.prefixes.some(p => childCode.startsWith(p))) {
            sumNow += Number(balNow[child.id] || 0);
            sumCmp += Number(balCmp[child.id] || 0);
          }
        }

        if (Math.abs(sumNow) < EPS && Math.abs(sumCmp) < EPS) continue;

        // Invertir signo si es pasivo (2), patrimonio (3) o ingresos (4)
        const cls = mapItem.prefixes[0].charAt(0);
        let adjustedNow = sumNow;
        let adjustedCmp = sumCmp;
        if (cls === '2' || cls === '3' || cls === '4') {
          adjustedNow = -sumNow;
          adjustedCmp = -sumCmp;
        }

        const ext = existentesByNum.get(mapItem.notaNum);
        const autoSugg = ext ? ext.sugerido : buildNoteSuggestion(mapItem.prefixes[0], mapItem.titulo, adjustedNow, adjustedCmp, periodo);
        
        tempNotas.push({
          nota_num: mapItem.notaNum,
          titulo: mapItem.titulo,
          cuenta_codigo: mapItem.prefixes.join(','),
          saldoNow: adjustedNow,
          saldoCmp: adjustedCmp,
          contenido: ext ? ext.contenido : '',
          sugerido: autoSugg,
          revisado: ext ? ext.revisado : false,
          _id: ext ? ext.id : null,
          _dirty: false
        });
      }

      // Ordenar notas por nota_num
      notasLocales = tempNotas.sort((a, b) => a.nota_num - b.nota_num);
      renderNotesList(notasLocales);
      setStatus(`${notasLocales.length} notas cargadas. Periodo: ${periodo}`, '#059669');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`, '#EF4444');
      if (area) area.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
    }
  };

  /** Guardar UNA nota en PocketBase */
  const saveOneNote = async (idx: number) => {
    const nota = notasLocales[idx];
    if (!nota) return;
    const tipo = Number(nota.nota_num) >= 4 ? 'ER' : 'ESF';
    const periodo = getPeriodoVal();
    const txtEl = $(`#fn-txt-${idx}`) as HTMLTextAreaElement | null;
    const contenidoActual = txtEl ? txtEl.value : nota.contenido;

    try {
      const payload: any = {
        periodo,
        nota_num: nota.nota_num,
        tipo_informe: tipo,
        titulo: nota.titulo,
        cuenta_codigo: nota.cuenta_codigo || '',
        contenido: contenidoActual,
        sugerido: nota.sugerido || '',
        revisado: true,
      };

      // Añadir usuario actual si está disponible
      const userId = sessionStorage.getItem('user_id') || '';
      if (userId) payload.updated_by = userId;

      let savedRecord: any;
      if (nota._id) {
        savedRecord = await pb.update('financial_notes', nota._id, payload);
      } else {
        savedRecord = await pb.create('financial_notes', payload);
        notasLocales[idx]._id = savedRecord.id;
      }

      notasLocales[idx].contenido = contenidoActual;
      notasLocales[idx].revisado = true;
      notasLocales[idx]._dirty = false;

      // Actualizar el badge en el card sin re-renderizar todo
      const card = $(`#fn-card-${idx}`);
      if (card) {
        const badge = card.querySelector('span.ml-2');
        if (badge) {
          badge.textContent = 'Revisada';
          (badge as HTMLElement).style.background = '#D1FAE5';
          (badge as HTMLElement).style.color = '#065F46';
        }
      }

      showToast(`Nota ${nota.nota_num} guardada correctamente.`, 'success');
      setStatus(`Nota ${nota.nota_num} guardada. ${new Date().toLocaleTimeString('es-CO')}`, '#059669');
    } catch (err: any) {
      showToast(`Error al guardar nota ${nota.nota_num}: ${err.message}`, 'error');
    }
  };

  /** Generar sugerencia para UNA nota */
  const suggestOne = (idx: number) => {
    const nota = notasLocales[idx];
    if (!nota) return;
    const periodo = getPeriodoVal();
    const sugerido = buildNoteSuggestion(
      nota.cuenta_codigo || '',
      nota.titulo,
      nota.saldoNow || 0,
      nota.saldoCmp || 0,
      periodo
    );
    notasLocales[idx].sugerido = sugerido;
    // Refrescar solo ese card
    renderNotesList(notasLocales);
  };

  /** Generar sugerencias para TODAS las notas */
  const suggestAll = () => {
    const periodo = getPeriodoVal();
    for (let i = 0; i < notasLocales.length; i++) {
      const n = notasLocales[i];
      notasLocales[i].sugerido = buildNoteSuggestion(
        n.cuenta_codigo || '',
        n.titulo,
        n.saldoNow || 0,
        n.saldoCmp || 0,
        periodo
      );
      // Si el contador aún no ha redactado nada, pre-rellenar el campo de texto
      if (!notasLocales[i].contenido) {
        notasLocales[i].contenido = notasLocales[i].sugerido;
      }
    }
    renderNotesList(notasLocales);
    setStatus('Sugerencias generadas. Revise y ajuste cada nota antes de guardar.', '#D97706');
  };

  /** Guardar TODAS las notas de una vez */
  const saveAllNotes = async () => {
    if (!notasLocales.length) return showToast('No hay notas para guardar.', 'warning');
    // Leer el estado actual de todos los textareas antes de guardar
    for (let i = 0; i < notasLocales.length; i++) {
      const txtEl = $(`#fn-txt-${i}`) as HTMLTextAreaElement | null;
      if (txtEl) notasLocales[i].contenido = txtEl.value;
    }
    setStatus('Guardando todas las notas…', '#D97706');
    let saved = 0;
    let errors = 0;
    for (let i = 0; i < notasLocales.length; i++) {
      try {
        await saveOneNote(i);
        saved++;
      } catch (_) {
        errors++;
      }
    }
    if (errors === 0) {
      setStatus(`${saved} notas guardadas correctamente.`, '#059669');
      showToast(`${saved} notas guardadas.`, 'success');
    } else {
      setStatus(`${saved} guardadas, ${errors} errores.`, '#EF4444');
      showToast(`${errors} errores al guardar.`, 'error');
    }
  };

  /** Imprimir PDF con todas las notas guardadas */
  const printNotesPdf = async () => {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;
    const desde = (document.getElementById('fn-periodo-desde') as HTMLInputElement)?.value;
    const hasta = (document.getElementById('fn-periodo-hasta') as HTMLInputElement)?.value;
    if (!desde || !hasta) return showToast('Selecciona el lapso de tiempo.', 'warning');
    const periodo = getPeriodoVal();

    const notas = await loadFinancialNotes(periodo);
    if (!notas.length) return showToast('No hay notas guardadas para este periodo.', 'warning');

    const headerCtx = await getPdfHeaderContext();
    const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 24;

    drawPdfHeader(doc, headerCtx, {
      title: `Notas a los Estados Financieros`,
      subtitles: [`Periodo: ${periodo}`],
    });

    // Cargar y calcular balances en caliente si no están en memoria
    if (!currentAccounts.length || !Object.keys(currentBalNow).length) {
      const { accounts } = await ensureAccountsSaldos();
      const { transactions, txLines: allTxLines } = await ensureLedgerData();
      
      const yearHasta = Number(hasta.slice(0, 4));
      const monthHasta = Number(hasta.slice(5, 7));
      const lastDayCurrent = new Date(yearHasta, monthHasta, 0);
      const reportDate = `${lastDayCurrent.getFullYear()}-${String(lastDayCurrent.getMonth() + 1).padStart(2, '0')}-${String(lastDayCurrent.getDate()).padStart(2, '0')}`;

      const yearDesde = Number(desde.slice(0, 4));
      const monthDesde = Number(desde.slice(5, 7));
      const prevMonth = monthDesde === 1 ? `${yearDesde - 1}-12` : `${yearDesde}-${String(monthDesde - 1).padStart(2, '0')}`;
      const lastDayPrev = new Date(Number(prevMonth.slice(0, 4)), Number(prevMonth.slice(5, 7)), 0);
      const compareDate = `${lastDayPrev.getFullYear()}-${String(lastDayPrev.getMonth() + 1).padStart(2, '0')}-${String(lastDayPrev.getDate()).padStart(2, '0')}`;

      const computeBalances = (cutoff: string): Record<string, number> => {
        const txById = Object.fromEntries(transactions.map((t: any) => [t.id, t]));
        const byAcc = Object.fromEntries(accounts.map((a: any) => [a.id, 0]));
        for (const line of allTxLines) {
          const tx = txById[line.tx_id];
          if (!tx || tx.status !== 'active' || !tx.date) continue;
          if (String(tx.date) > cutoff) continue;
          byAcc[line.account_id] = Number(byAcc[line.account_id] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
        }
        return byAcc;
      };

      currentAccounts = accounts;
      currentBalNow = computeBalances(reportDate);
      currentBalCmp = computeBalances(compareDate);
    }

    // Empezamos las notas desde la primera página ya con el encabezado
    let y = 72;
    const right = pageWidth - 24;
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = right - marginLeft;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(13, 33, 55);
    doc.text('(Cifras expresadas en pesos colombianos)', pageWidth / 2, y, { align: 'center' });
    y += 12;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(marginLeft, y, right, y);
    y += 14;

    for (const nota of notas) {
      const texto = (nota.contenido || nota.sugerido || '').trim();
      if (!texto) continue;

      if (y + 20 > pageHeight - 30) {
        doc.addPage();
        y = 40;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 33, 55);
      doc.text(`Nota ${nota.nota_num}. ${nota.titulo || ''}`, marginLeft, y);
      y += 11;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(55, 55, 55);
      const lines = doc.splitTextToSize(texto, maxWidth);
      for (const line of lines) {
        if (y + 9 > pageHeight - 30) {
          doc.addPage();
          y = 40;
        }
        doc.text(line, marginLeft, y);
        y += 9;
      }
      y += 8;

      // Dibujar tabla de soporte si aplica (si tiene cuenta_codigo)
      if (nota.cuenta_codigo && currentAccounts && currentBalNow && currentBalCmp) {
        const prefixes = String(nota.cuenta_codigo).split(',');
        const supportingData = getNoteSupportingData(currentAccounts, currentBalNow, currentBalCmp, prefixes);
        if (supportingData.length > 0) {
          if (y + 40 > pageHeight - 30) {
            doc.addPage();
            y = 40;
          }

          doc.autoTable({
            startY: y,
            head: [['Código', 'Concepto / Cuenta', 'Saldo Actual', 'Saldo Anterior', 'Variación']],
            body: supportingData.map(d => [
              d.code,
              d.name,
              fmtPdfSignedNum(d.now),
              fmtPdfSignedNum(d.cmp),
              fmtPdfSignedNum(d.variation)
            ]),
            theme: 'plain',
            margin: { left: marginLeft, right: 24 },
            styles: { font: 'helvetica', fontSize: 6.5, textColor: [70, 70, 70], cellPadding: 2 },
            headStyles: { fillColor: [245, 245, 245], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 260 },
              2: { cellWidth: 80, halign: 'right' },
              3: { cellWidth: 80, halign: 'right' },
              4: { cellWidth: 70, halign: 'right' },
            }
          });
          y = doc.lastAutoTable.finalY + 12;
        }
      }
    }

    const includeSignatures = getCheckVal('fn-show-signatures');
    if (includeSignatures) {
      y = await drawPdfSignatures(doc, y);
    }

    // Footer en cada página
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawPdfFooter(doc, p);
    }

    doc.save(`notas_estados_financieros_${periodo}.pdf`);
    showToast('PDF de notas generado correctamente.', 'success');
  };

  // ── Exponer callbacks globales para los botones inline del HTML generado ──
  (window as any)._fnMarkDirty = (idx: number) => {
    if (notasLocales[idx]) notasLocales[idx]._dirty = true;
  };
  (window as any)._fnAcceptSuggestion = (idx: number) => {
    const nota = notasLocales[idx];
    if (!nota) return;
    const txtEl = $(`#fn-txt-${idx}`) as HTMLTextAreaElement | null;
    if (txtEl) txtEl.value = nota.sugerido || '';
    notasLocales[idx].contenido = nota.sugerido || '';
    notasLocales[idx]._dirty = true;
    showToast('Sugerencia aceptada. Recuerda guardar.', 'info');
  };
  (window as any)._fnSuggestOne = (idx: number) => suggestOne(idx);
  (window as any)._fnSaveOne   = (idx: number) => saveOneNote(idx);

  // ── Event listeners principales ───────────────────────────────────────────
  $('#btn-fn-sync')?.addEventListener('click', syncFromReport);
  $('#btn-fn-suggest-all')?.addEventListener('click', suggestAll);
  $('#btn-fn-save-all')?.addEventListener('click', saveAllNotes);
  $('#btn-fn-pdf')?.addEventListener('click', printNotesPdf);
}

// Exponer drawNotesInPdf para uso desde renderFinancialPosition y renderIncomeStatement
(window as any)._drawNotesInPdf = drawNotesInPdf;
(window as any)._loadFinancialNotes = loadFinancialNotes;

// =============================================================================
// AUDITORÍA DE CONSECUTIVOS DE COMPROBANTES
// =============================================================================
async function renderConsecutiveAuditReport() {
  const view = getReportViewHost();
  if (!view) return;

  const today = todayStr();
  const firstOfMonth = today.slice(0, 7) + '-01';

  let _auditGroups: any[] = [];
  let _auditParams: any = null;
  let txTypes: any[] = [];
  let _activeTab: 'accounting' | 'commercial' = 'accounting';

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-1" style="color:#0D2137">
        <i class="fas fa-list-ol mr-2" style="color:#1A4B8C"></i>
        Auditoría de Consecutivos por Comprobante
      </h4>
      <p class="text-sm mb-3" style="color:#6B7280">
        Analiza los comprobantes contables en un período.
        Detecta faltantes en la numeración y transacciones con descuadre.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 items-end">
        <div class="md:col-span-2 form-group">
          <label class="form-label">Desde</label>
          <input id="ca-date-from" type="date" class="form-input w-full" value="${firstOfMonth}">
        </div>
        <div class="md:col-span-2 form-group">
          <label class="form-label">Hasta</label>
          <input id="ca-date-to" type="date" class="form-input w-full" value="${today}">
        </div>
        <div class="md:col-span-4 form-group relative">
          <label class="form-label flex justify-between">
            <span>Comprobantes</span>
            <span class="text-xs text-gray-400 font-normal" id="ca-selected-count">Cargando...</span>
          </label>
          <div id="ca-voucher-select-btn" class="form-input flex items-center justify-between cursor-pointer bg-white border rounded px-3 py-2 text-sm" style="min-height:38px; border-color:#D1D5DB;">
            <span class="text-gray-600 truncate" id="ca-voucher-select-label">Todos los comprobantes</span>
            <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
          </div>
          <!-- Dropdown container -->
          <div id="ca-voucher-dropdown" class="absolute left-0 z-50 mt-1 w-full bg-white border rounded-xl shadow-lg hidden p-3" style="max-height: 280px; overflow-y: auto; border-color: #E5E7EB;">
            <div class="flex gap-2 mb-2 pb-2 border-b" style="border-color:#F3F4F6">
              <button class="btn btn-xs btn-outline flex-1" id="ca-btn-select-all" style="font-size:10px; padding:2px 4px;">Todos</button>
              <button class="btn btn-xs btn-outline flex-1" id="ca-btn-deselect-all" style="font-size:10px; padding:2px 4px;">Ninguno</button>
            </div>
            <input type="text" id="ca-voucher-search" placeholder="Buscar comprobante..." class="form-input w-full mb-2 text-xs" style="padding:4px 8px; min-height:28px;">
            <div id="ca-voucher-list" class="space-y-1.5 max-h-40 overflow-y-auto">
              <div class="text-center py-2 text-xs text-gray-400"><i class="fas fa-spinner fa-spin mr-1"></i>Cargando...</div>
            </div>
          </div>
        </div>
        <div class="md:col-span-2 form-group flex items-center shadow-none border-none" style="height: 38px;">
          <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 select-none">
            <input type="checkbox" id="ca-show-all-tx" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" style="width:16px; height:16px;">
            <span>Listar todas las transacciones</span>
          </label>
        </div>
        <div class="md:col-span-2 form-group flex gap-2">
          <button class="btn btn-primary flex-1" id="btn-ca-generate" style="min-height:38px;">
            <i class="fas fa-search-plus"></i> Auditar
          </button>
          <button class="btn btn-outline" id="btn-ca-pdf" disabled style="min-height:38px; width:42px; padding:0; display:flex; align-items:center; justify-content:center;" title="Exportar PDF">
            <i class="fas fa-file-pdf"></i>
          </button>
          <button class="btn btn-outline" id="btn-ca-excel" disabled style="min-height:38px; width:42px; padding:0; display:flex; align-items:center; justify-content:center;" title="Exportar Excel">
            <i class="fas fa-file-excel"></i>
          </button>
        </div>
      </div>
    </div>
    <div id="ca-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-receipt" style="font-size:2rem"></i>
      <p class="mt-2">Selecciona comprobantes y un rango de fechas, luego pulsa <strong>Auditar</strong>.</p>
    </div>`;

  // Dropdown interactivity
  const btn = $('#ca-voucher-select-btn');
  const dropdown = $('#ca-voucher-dropdown');

  if (btn && dropdown) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target as Node) && !btn.contains(e.target as Node)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // Reactive checkbox change listener
  $('#ca-show-all-tx')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    if (_auditParams) {
      _auditParams.showAll = checked;
    }
    const results = $('#ca-results');
    if (_auditGroups.length && _auditParams && results) {
      renderAuditResults(results, _auditParams.dateFrom, _auditParams.dateTo);
    }
  });

  // Load and populate transaction types
  try {
    txTypes = await pb.listAll('transaction_types', { sort: 'prefix', ignoreBranch: true });
    populateVouchers(txTypes);
  } catch (err: any) {
    const countEl = $('#ca-selected-count');
    if (countEl) countEl.textContent = 'Error';
    showToast('Error cargando tipos de comprobante: ' + err.message, 'error');
  }

  function populateVouchers(types: any[]) {
    const listEl = $('#ca-voucher-list');
    if (!listEl) return;
    if (!types.length) {
      listEl.innerHTML = '<div class="text-center py-2 text-xs text-gray-400">No se encontraron comprobantes</div>';
      return;
    }
    listEl.innerHTML = types.map(t => `
      <label class="flex items-center gap-2 px-1 py-1 hover:bg-gray-50 rounded cursor-pointer text-xs select-none ca-voucher-item-label">
        <input type="checkbox" class="ca-voucher-item rounded border-gray-300 text-blue-600 focus:ring-blue-500" value="${esc(t.id)}" data-prefix="${esc(t.prefix)}" data-name="${esc(t.name)}" checked style="width:14px; height:14px;">
        <span class="font-mono font-semibold text-blue-800">${esc(t.prefix)}</span>
        <span class="text-gray-600 truncate">— ${esc(t.name)}</span>
      </label>
    `).join('');

    // Add event listeners to checkboxes to update label count
    listEl.querySelectorAll('.ca-voucher-item').forEach(el => {
      el.addEventListener('change', updateDropdownLabel);
    });

    updateDropdownLabel();
  }

  function updateDropdownLabel() {
    const items = document.querySelectorAll('.ca-voucher-item') as NodeListOf<HTMLInputElement>;
    const checkedItems = Array.from(items).filter(el => el.checked);
    const labelEl = $('#ca-voucher-select-label');
    const countEl = $('#ca-selected-count');
    if (!labelEl || !countEl) return;

    countEl.textContent = `${checkedItems.length}/${items.length}`;

    if (checkedItems.length === 0) {
      labelEl.textContent = 'Ninguno seleccionado';
      labelEl.style.color = '#EF4444';
    } else if (checkedItems.length === items.length) {
      labelEl.textContent = 'Todos los comprobantes';
      labelEl.style.color = '#374151';
    } else if (checkedItems.length <= 3) {
      const prefixes = checkedItems.map(el => el.getAttribute('data-prefix')).join(', ');
      labelEl.textContent = prefixes;
      labelEl.style.color = '#1A4B8C';
    } else {
      labelEl.textContent = `${checkedItems.length} seleccionados`;
      labelEl.style.color = '#1A4B8C';
    }
  }

  // Select all / deselect all event listeners
  $('#ca-btn-select-all')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.ca-voucher-item').forEach((el: any) => el.checked = true);
    updateDropdownLabel();
  });

  $('#ca-btn-deselect-all')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.ca-voucher-item').forEach((el: any) => el.checked = false);
    updateDropdownLabel();
  });

  // Search input filtering
  $('#ca-voucher-search')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value.toLowerCase();
    document.querySelectorAll('.ca-voucher-item-label').forEach((el: any) => {
      const txt = el.textContent.toLowerCase();
      if (txt.includes(val)) {
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
  });

  // ---------------------------------------------------------------------------
  //  AUDITAR
  // ---------------------------------------------------------------------------
  const runAudit = async () => {
    const dateFrom = ($('#ca-date-from') as HTMLInputElement)?.value || '';
    const dateTo   = ($('#ca-date-to')   as HTMLInputElement)?.value || '';
    const results  = $('#ca-results');
    if (!results) return;
    if (!dateFrom) return showToast('Selecciona la fecha de inicio.', 'warning');
    if (!dateTo)   return showToast('Selecciona la fecha de corte.', 'warning');
    if (dateFrom > dateTo) return showToast('La fecha inicio no puede ser mayor a la de corte.', 'warning');

    const selectedCheckboxes = document.querySelectorAll('.ca-voucher-item:checked') as NodeListOf<HTMLInputElement>;
    const selectedIds = Array.from(selectedCheckboxes).map(el => el.value);
    if (selectedIds.length === 0) {
      return showToast('Selecciona al menos un comprobante para auditar.', 'warning');
    }

    const showAll = ($('#ca-show-all-tx') as HTMLInputElement)?.checked || false;
    _auditParams = { dateFrom, dateTo, showAll };
    results.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comprobantes y detalles comerciales...</div>`;

    try {
      // Map of selected transaction types
      const txTypeMap = new Map<string, any>(txTypes.filter(t => selectedIds.includes(t.id)).map(t => [t.id, t]));

      // Query filter dynamically built for selected vouchers
      let filterStr = `date>="${dateFrom}" && date<="${dateTo}"`;
      if (selectedIds.length < txTypes.length) {
        const typeFilters = selectedIds.map(id => `tx_type_id="${pb.escapeFilterValue(id)}"`).join(' || ');
        filterStr += ` && (${typeFilters})`;
      }

      // Todas las transacciones del período (expandiendo tercero)
      const allTx: any[] = await pb.listAll('transactions', {
        filter: filterStr,
        sort: 'number',
        ignoreBranch: true,
        expand: 'third_party_id'
      });

      if (!allTx.length) {
        results.innerHTML = `<div class="p-10 text-center" style="color:#9CA3AF"><i class="fas fa-inbox" style="font-size:2rem"></i><p class="mt-2">No se encontraron comprobantes en el período seleccionado con los filtros aplicados.</p></div>`;
        ($('#btn-ca-pdf')   as HTMLButtonElement).disabled = true;
        ($('#btn-ca-excel') as HTMLButtonElement).disabled = true;
        return;
      }

      // Fetch reference master data in parallel
      const [warehouses, purchaseInvoices, salesInvoices] = await Promise.all([
        pb.listAll('warehouses', { ignoreBranch: true }),
        pb.listAll('purchase_invoices', { filter: `date>="${dateFrom}" && date<="${dateTo}"`, ignoreBranch: true }),
        pb.listAll('invoices', { filter: `date>="${dateFrom}" && date<="${dateTo}"`, ignoreBranch: true })
      ]);

      const warehouseMap = new Map<string, string>();
      for (const w of warehouses) {
        warehouseMap.set(w.id, w.name);
      }

      const purchaseMap = new Map<string, any>();
      const purchaseByNumMap = new Map<string, any>();
      for (const pinv of purchaseInvoices) {
        if (pinv.tx_id) purchaseMap.set(pinv.tx_id, pinv);
        if (pinv.number) {
          const key = `${pinv.tx_type_id || ''}_${pinv.number}`;
          purchaseByNumMap.set(key, pinv);
        }
      }

      const salesMap = new Map<string, any>();
      const salesByNumMap = new Map<string, any>();
      for (const sinv of salesInvoices) {
        if (sinv.tx_id) salesMap.set(sinv.tx_id, sinv);
        if (sinv.number) {
          const key = `${sinv.tx_type_id || ''}_${sinv.number}`;
          salesByNumMap.set(key, sinv);
        }
      }

      // Agrupar por tipo
      const byType = new Map<string, any[]>();
      for (const tx of allTx) {
        const tid = tx.tx_type_id || '__SIN_TIPO__';
        if (txTypeMap.has(tid) || tid === '__SIN_TIPO__') {
          if (!byType.has(tid)) byType.set(tid, []);
          byType.get(tid)!.push(tx);
        }
      }

      // Líneas contables en batches
      const allIds = allTx.map(t => t.id);
      const lineTotals = new Map<string, { debit: number; credit: number }>();
      const taxTotals = new Map<string, number>();
      const retefuenteTotals = new Map<string, number>();
      const reteicaTotals = new Map<string, number>();
      const reteivaTotals = new Map<string, number>();
      const crossDocRefs = new Map<string, string>();
      const BATCH = 50;
      for (let i = 0; i < allIds.length; i += BATCH) {
        const batch = allIds.slice(i, i + BATCH);
        const f = batch.map(id => `tx_id="${pb.escapeFilterValue(id)}"`).join(' || ');
        try {
          const lines: any[] = await pb.listAll('tx_lines', { filter: f, ignoreBranch: true, expand: 'account_id' });
          for (const l of lines) {
            if (!lineTotals.has(l.tx_id)) lineTotals.set(l.tx_id, { debit: 0, credit: 0 });
            const tot = lineTotals.get(l.tx_id)!;
            tot.debit  += Number(l.debit  || 0);
            tot.credit += Number(l.credit || 0);

            const code = l.expand?.account_id?.code || '';
            const val = Math.abs((l.debit || 0) - (l.credit || 0));

            if (code.startsWith('24')) {
              taxTotals.set(l.tx_id, (taxTotals.get(l.tx_id) || 0) + val);
            }

            // Retención en la Fuente: 2365 o 135515 (o cualquier 1355 que no sea ReteIVA/ReteICA)
            if (code.startsWith('2365') || code.startsWith('135515') || (code.startsWith('1355') && !code.startsWith('135517') && !code.startsWith('135518'))) {
              retefuenteTotals.set(l.tx_id, (retefuenteTotals.get(l.tx_id) || 0) + val);
            }
            // Retención de ICA: 2368 o 135518
            if (code.startsWith('2368') || code.startsWith('135518')) {
              reteicaTotals.set(l.tx_id, (reteicaTotals.get(l.tx_id) || 0) + val);
            }
            // Retención de IVA: 2367 o 135517
            if (code.startsWith('2367') || code.startsWith('135517')) {
              reteivaTotals.set(l.tx_id, (reteivaTotals.get(l.tx_id) || 0) + val);
            }

            const ref = (l.cross_doc_ref || '').trim();
            if (ref && !crossDocRefs.has(l.tx_id)) {
              crossDocRefs.set(l.tx_id, ref);
            }
          }
        } catch (_) {}
      }

      // Parsear consecutivo numérico
      const parseConsec = (s: string): number | null => {
        if (!s) return null;
        const parts = s.split('-');
        const n = parseInt(parts[parts.length - 1], 10);
        return Number.isNaN(n) ? null : n;
      };

      // Construir grupos
      _auditGroups = [];
      for (const [typeId, txList] of byType) {
        const txType = txTypeMap.get(typeId);
        const prefix = txType?.prefix || typeId;
        const name   = txType?.name   || '(Sin nombre)';

        const rows = txList.map(tx => {
          const consec   = parseConsec(tx.number || '');
          const tot      = lineTotals.get(tx.id) || { debit: 0, credit: 0 };
          const diff     = Math.abs(tot.debit - tot.credit);
          const hasLines = tot.debit > 0 || tot.credit > 0;

          // Tercero y datos maestros
          const tp = tx.expand?.third_party_id;
          const thirdPartyName = tp ? tp.name : '';
          const thirdPartyDoc = tp ? tp.doc_number : '';
          const thirdPartyCity = tp ? tp.city : '';
          const thirdPartyResp = tp ? (tp.resp ? (Array.isArray(tp.resp) ? tp.resp.join(',') : String(tp.resp)) : (tp.rf || '')) : '';

          // Datos de facturas vinculadas (búsqueda por ID o número)
          const pinv = purchaseMap.get(tx.id) || purchaseByNumMap.get(`${tx.tx_type_id || ''}_${tx.number}`);
          const sinv = salesMap.get(tx.id) || salesByNumMap.get(`${tx.tx_type_id || ''}_${tx.number}`);

          const lineIva = taxTotals.get(tx.id) || 0;
          const lineRetefuente = retefuenteTotals.get(tx.id) || 0;
          const lineReteica = reteicaTotals.get(tx.id) || 0;
          const lineReteiva = reteivaTotals.get(tx.id) || 0;
          const lineRet = lineRetefuente + lineReteica + lineReteiva;
          const lineAffects = crossDocRefs.get(tx.id) || '';

          let extRef = '';
          let subtotal = 0;
          let iva = 0;
          let retefuente = 0;
          let reteica = 0;
          let retenciones = 0;
          let total = 0;
          let neto = 0;
          let warehouseName = '';
          let dueDate = tx.date || '';
          let affects = '';
          let affectedBy = '';
          let paymentDays = 0;
          let vrIco = 0;
          let vrIbua = 0;
          let vrIcui = 0;
          let desctoFinanciero = 0;
          let desctoPct = 0;

          if (pinv) {
            extRef = pinv.supplier_ref || '';
            subtotal = pinv.subtotal || 0;
            iva = lineIva;
            retefuente = lineRetefuente;
            reteica = lineReteica;
            retenciones = lineRet;
            total = subtotal + iva;
            neto = total - retenciones;
            warehouseName = warehouseMap.get(pinv.warehouse_id) || '';
            dueDate = pinv.due_date || tx.date || '';
            affects = lineAffects;
            paymentDays = pinv.payment_days || 0;
            desctoFinanciero = pinv.discount_amount || 0;
          } else if (sinv) {
            subtotal = sinv.subtotal || 0;
            iva = lineIva;
            retefuente = lineRetefuente;
            reteica = lineReteica;
            retenciones = lineRet;
            total = subtotal + iva;
            neto = total - retenciones;
            warehouseName = warehouseMap.get(sinv.warehouse_id) || '';
            dueDate = sinv.due_date || tx.date || '';
            affects = lineAffects;
            paymentDays = sinv.payment_days || 0;
            desctoFinanciero = sinv.discount_amount || 0;
          } else {
            iva = lineIva;
            retefuente = lineRetefuente;
            reteica = lineReteica;
            retenciones = lineRet;
            total = tot.debit;
            subtotal = total - iva;
            neto = total - retenciones;
            affects = lineAffects;
          }

          if (desctoFinanciero > 0) {
            desctoPct = (subtotal + desctoFinanciero) > 0 ? Math.round((desctoFinanciero / (subtotal + desctoFinanciero)) * 100) : 0;
          }

          let dias = 0;
          if (tx.date && dueDate) {
            try {
              const d1 = new Date(tx.date.slice(0, 10));
              const d2 = new Date(dueDate.slice(0, 10));
              const diffTime = d2.getTime() - d1.getTime();
              dias = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            } catch (_) {}
          }

          return { 
            id: tx.id, 
            number: tx.number || '—', 
            consec,
            date: tx.date || '', 
            status: tx.status || '',
            description: tx.description || '',
            debit: tot.debit, 
            credit: tot.credit, 
            diff,
            balanced: diff < 0.01, 
            hasLines,
            thirdPartyName,
            thirdPartyDoc,
            thirdPartyCity,
            thirdPartyResp,
            extRef,
            subtotal,
            iva,
            retefuente,
            reteica,
            retenciones,
            total,
            neto,
            warehouseName,
            dueDate,
            affects,
            affectedBy,
            paymentDays,
            vrIco,
            vrIbua,
            vrIcui,
            desctoFinanciero,
            desctoPct,
            dias
          };
        }).sort((a, b) => {
          if (a.consec !== null && b.consec !== null) return a.consec - b.consec;
          return (a.number || '').localeCompare(b.number || '');
        });

        const consecNums = rows.map(r => r.consec).filter(c => c !== null) as number[];
        const gaps: number[] = [];
        if (consecNums.length >= 2) {
          const minC = consecNums[0];
          const maxC = consecNums[consecNums.length - 1];
          const existing = new Set(consecNums);
          for (let n = minC; n <= maxC; n++) { if (!existing.has(n)) gaps.push(n); }
        }

        const imbalanced = rows.filter(r => !r.balanced || !r.hasLines);
        const drafts = rows.filter(r => r.status === 'draft');
        _auditGroups.push({
          typeId, prefix, name, rows, gaps, imbalanced, drafts,
          totalDocs: rows.length,
          balanced: rows.filter(r => r.balanced && r.hasLines && r.status === 'active').length,
          minNum: consecNums.length ? consecNums[0] : null,
          maxNum: consecNums.length ? consecNums[consecNums.length - 1] : null,
        });
      }
      _auditGroups.sort((a, b) => a.prefix.localeCompare(b.prefix));

      renderAuditResults(results, dateFrom, dateTo);
      ($('#btn-ca-pdf')   as HTMLButtonElement).disabled = false;
      ($('#btn-ca-excel') as HTMLButtonElement).disabled = false;
    } catch (err: any) {
      results.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
      ($('#btn-ca-pdf')   as HTMLButtonElement).disabled = true;
      ($('#btn-ca-excel') as HTMLButtonElement).disabled = true;
    }
  };

  // ---------------------------------------------------------------------------
  //  APPROVE ACTION VÍA WINDOW FOR INLINE BUTTON
  // ---------------------------------------------------------------------------
  (window as any)._caApproveTx = async (txId, txNumber) => {
    if (!requireRole('superadmin', 'administrador', 'admin', 'contador')) {
      return showToast('No tienes permisos adecuados para aprobar transacciones (requiere Superadmin, Administrador o Contador).', 'error');
    }
    confirmDialog(
      'Aprobar transacción',
      `¿Confirmas aprobar la transacción <strong>${esc(txNumber)}</strong>? Quedará <strong>Activa</strong> y se reflejará en los reportes contables.`,
      async () => {
        try {
          await API.approveTx(txId);
          showToast(`Transacción ${txNumber} aprobada exitosamente.`, 'success');
          await runAudit();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    );
  };

  // ---------------------------------------------------------------------------
  //  RENDER RESULTS
  // ---------------------------------------------------------------------------
  function renderAuditResults(container: Element, dateFrom: string, dateTo: string) {
    const totalTypes = _auditGroups.length;
    const totalDocs  = _auditGroups.reduce((s, g) => s + g.totalDocs, 0);
    const totalGaps  = _auditGroups.reduce((s, g) => s + g.gaps.length, 0);
    const totalImbal = _auditGroups.reduce((s, g) => s + g.imbalanced.length, 0);
    const totalDrafts = _auditGroups.reduce((s, g) => s + g.drafts.length, 0);
    const anyNovedad = _auditGroups.some(g => g.gaps.length || g.imbalanced.length || g.drafts.length);
    const showAll    = _auditParams?.showAll ?? (($('#ca-show-all-tx') as HTMLInputElement)?.checked || false);
const tabsHtml = `
      <div class="flex mb-4 p-1 bg-gray-100 rounded-xl" style="max-width: 420px; border: 1px solid #E5E7EB;">
        <button id="ca-tab-accounting" class="flex-1 py-1.5 px-3 rounded-lg font-semibold text-xs transition-all focus:outline-none ${
          _activeTab === 'accounting' 
            ? 'bg-white text-blue-900 shadow-sm border border-gray-200' 
            : 'text-gray-500 hover:text-gray-900 border border-transparent'
        }">
          <i class="fas fa-calculator mr-1"></i>Auditoría Contable
        </button>
        <button id="ca-tab-commercial" class="flex-1 py-1.5 px-3 rounded-lg font-semibold text-xs transition-all focus:outline-none ${
          _activeTab === 'commercial' 
            ? 'bg-white text-blue-900 shadow-sm border border-gray-200' 
            : 'text-gray-500 hover:text-gray-900 border border-transparent'
        }">
          <i class="fas fa-shopping-cart mr-1"></i>Detalle Comercial
        </button>
      </div>
    `;

    const summaryBar = `
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 border-b" style="border-color:#F3F4F6">
        <div class="rounded-xl border p-3 text-center" style="border-color:#E5E7EB;background:#F8FAFC">
          <p class="text-xs" style="color:#6B7280">Tipos de comprobante</p>
          <p class="text-2xl font-bold mt-1" style="color:#0D2137">${totalTypes}</p>
        </div>
        <div class="rounded-xl border p-3 text-center" style="border-color:#E5E7EB;background:#F8FAFC">
          <p class="text-xs" style="color:#6B7280">Total documentos</p>
          <p class="text-2xl font-bold mt-1" style="color:#1A4B8C">${totalDocs}</p>
        </div>
        <div class="rounded-xl border p-3 text-center" style="border-color:${totalGaps ? '#FED7AA' : '#BBF7D0'};background:${totalGaps ? '#FFF7ED' : '#F0FDF4'}">
          <p class="text-xs" style="color:#6B7280">Faltantes en secuencia</p>
          <p class="text-2xl font-bold mt-1" style="color:${totalGaps ? '#D97706' : '#16A34A'}">${totalGaps}</p>
        </div>
        <div class="rounded-xl border p-3 text-center" style="border-color:${totalDrafts ? '#FEF3C7' : '#BBF7D0'};background:${totalDrafts ? '#FFFBEB' : '#F0FDF4'}">
          <p class="text-xs" style="color:#6B7280">Pendientes de aprobación</p>
          <p class="text-2xl font-bold mt-1" style="color:${totalDrafts ? '#D97706' : '#16A34A'}">${totalDrafts}</p>
        </div>
        <div class="rounded-xl border p-3 text-center" style="border-color:${totalImbal ? '#FECDD3' : '#BBF7D0'};background:${totalImbal ? '#FFF1F2' : '#F0FDF4'}">
          <p class="text-xs" style="color:#6B7280">Con descuadre</p>
          <p class="text-2xl font-bold mt-1" style="color:${totalImbal ? '#DC2626' : '#16A34A'}">${totalImbal}</p>
        </div>
      </div>`;

    const groupsHtml = _auditGroups.map(g => {
      const gHasNovedad  = g.gaps.length > 0 || g.imbalanced.length > 0 || g.drafts.length > 0;
      const statusColor = !gHasNovedad ? '#16A34A' : (g.imbalanced.length ? '#DC2626' : '#D97706');
      const statusIcon  = !gHasNovedad ? 'fa-check-circle' : (g.imbalanced.length ? 'fa-triangle-exclamation' : 'fa-circle-exclamation');

      const combinedItems = [];
      let txRowsToInclude = [];
      if (showAll) {
        txRowsToInclude = g.rows;
      } else {
        const unionSet = new Set();
        for (const r of g.imbalanced) {
          txRowsToInclude.push(r);
          unionSet.add(r.id);
        }
        for (const r of g.drafts) {
          if (!unionSet.has(r.id)) {
            txRowsToInclude.push(r);
            unionSet.add(r.id);
          }
        }
      }

      for (const r of txRowsToInclude) {
        combinedItems.push({ type: 'tx', data: r, consec: r.consec });
      }
      for (const gap of g.gaps) {
        combinedItems.push({ type: 'gap', data: gap, consec: gap });
      }

      combinedItems.sort((a, b) => {
        if (a.consec !== null && b.consec !== null) return a.consec - b.consec;
        const numA = a.type === 'tx' ? a.data.number : '';
        const numB = b.type === 'tx' ? b.data.number : '';
        return numA.localeCompare(numB);
      });

      const rowHtmls = [];

      if (_activeTab === 'accounting') {
        for (const item of combinedItems) {
          if (item.type === 'tx') {
            const r = item.data;
            const isImbal = !r.balanced || !r.hasLines;
            const isDraft = r.status === 'draft';
            
            let badgeClass = 'badge-green';
            let badgeText = 'Cuadrado';
            if (isImbal) {
              badgeClass = 'badge-red';
              badgeText = 'Descuadre';
            } else if (isDraft) {
              badgeClass = 'badge-orange';
              badgeText = 'Pendiente Aprob.';
            }

            const rowBgStyle = isImbal ? 'background-color:#FFF1F2' : (isDraft ? 'background-color:#FFFBEB' : '');
            const diffColor = isImbal ? '#DC2626' : '#16A34A';
            const diffWeight = isImbal ? 'font-bold' : 'normal';

            const canUserApprove = requireRole('superadmin', 'administrador', 'admin', 'contador');
            const actionButton = (isDraft && canUserApprove) 
              ? `<button class="btn btn-primary btn-xs ml-2 py-0.5 px-2 text-[10px]" style="height:auto; min-height:0; line-height:1; display:inline-flex; align-items:center; justify-content:center; background:#1E40AF; color:#fff; border-radius:4px;" onclick="window._caApproveTx('${r.id}', '${esc(r.number)}')"><i class="fas fa-check mr-1"></i>Aprobar</button>` 
              : '';

            rowHtmls.push(`<tr style="${rowBgStyle}">
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;">
                <div class="flex items-center">
                  <span class="badge ${badgeClass}" style="font-size:10px">${badgeText}</span>
                  ${actionButton}
                </div>
              </td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(r.number)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-sm whitespace-nowrap">${esc(r.date)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-sm" style="color:#6B7280;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(r.description)}">${esc(r.description || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-sm">${fmt(r.debit)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-sm">${fmt(r.credit)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-sm ${diffWeight}" style="color:${diffColor}">${fmt(r.diff)}</td>
            </tr>`);
          } else {
            const gap = item.data;
            rowHtmls.push(`<tr style="background-color:#FFFBEB">
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;"><span class="badge badge-orange" style="font-size:10px">Faltante</span></td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono font-semibold text-sm" style="color:#D97706">${esc(g.prefix)}-${String(gap).padStart(8, '0')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-sm" style="color:#9CA3AF">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-sm" style="color:#9CA3AF">Registro no encontrado en el sistema</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right" style="color:#9CA3AF">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right" style="color:#9CA3AF">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right" style="color:#9CA3AF">—</td>
            </tr>`);
          }
        }
      } else {
        // DETALLE COMERCIAL
        for (const item of combinedItems) {
          if (item.type === 'tx') {
            const r = item.data;
            const isImbal = !r.balanced || !r.hasLines;
            const isDraft = r.status === 'draft';
            let badgeClass = 'badge-green';
            let badgeText = 'Cuadrado';
            if (isImbal) {
              badgeClass = 'badge-red';
              badgeText = 'Descuadre';
            } else if (isDraft) {
              badgeClass = 'badge-orange';
              badgeText = 'Pendiente';
            }
            const rowBgStyle = isImbal ? 'background-color:#FFF1F2' : (isDraft ? 'background-color:#FFFBEB' : '');

            rowHtmls.push(`<tr style="${rowBgStyle}">
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;"><span class="badge ${badgeClass}" style="font-size:10px">${badgeText}</span></td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono font-bold text-xs" style="color:#1A4B8C">${esc(g.prefix)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono text-xs">${esc(r.number.replace(g.prefix + '-', ''))}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono text-xs text-blue-900 font-semibold" style="max-width:95px; overflow:hidden; text-overflow:ellipsis;" title="${esc(r.affects)}">${esc(r.affects || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs font-semibold text-gray-500 truncate" style="max-width:80px" title="${esc(r.extRef)}">${esc(r.extRef || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs whitespace-nowrap">${esc(r.date)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs font-semibold" style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${esc(r.thirdPartyName)}">${esc(r.thirdPartyName || '—')} <span class="text-gray-400 font-normal text-2xs">${esc(r.thirdPartyDoc)}</span></td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-500 truncate" style="max-width:140px" title="${esc(r.description)}">${esc(r.description || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs">${fmt(r.subtotal)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-gray-600">${fmt(r.iva)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-blue-900 font-semibold">${fmt(r.total)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-red-700">${fmt(r.retefuente)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-orange-700">${fmt(r.reteica)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-green-700 font-bold">${fmt(r.neto)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-red-600">${fmt(r.desctoFinanciero)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right font-mono text-xs text-gray-500">${r.desctoPct || 0}%</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs whitespace-nowrap text-gray-500">${esc(r.dueDate || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-600 truncate" style="max-width:100px" title="${esc(r.warehouseName)}">${esc(r.warehouseName || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-500 truncate" style="max-width:90px" title="${esc(r.thirdPartyCity)}">${esc(r.thirdPartyCity || '—')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-xs text-gray-500">${r.paymentDays || 0}</td>
            </tr>`);
          } else {
            const gap = item.data;
            rowHtmls.push(`<tr style="background-color:#FFFBEB">
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;"><span class="badge badge-orange" style="font-size:10px">Faltante</span></td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono font-bold text-xs" style="color:#D97706">${esc(g.prefix)}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="font-mono text-xs text-orange-800">${String(gap).padStart(8, '0')}</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">Registro no encontrado en el sistema</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-gray-400 font-mono text-xs">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-xs text-gray-400">—</td>
              <td style="padding:6px 8px; border-bottom:1px solid #E5E7EB;" class="text-right text-xs text-gray-500">${r.paymentDays || 0}</td>
            </tr>`);
          }
        }
      }

      const shouldShowTable = showAll ? (g.rows.length > 0 || g.gaps.length > 0) : gHasNovedad;

      const gridHeader = _activeTab === 'accounting'
        ? `<thead>
            <tr style="background:#F9FAFB">
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Estado</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Comprobante</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Fecha</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Descripción</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Débito</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Crédito</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB">Diferencia</th>
            </tr>
          </thead>`
        : `<thead>
            <tr style="background:#F9FAFB">
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Estado</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Tipo</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Número</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Afecta</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">No Ext.</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Fecha</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Proveedor / Tercero</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Detalle</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Subtotal</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Vr/iva</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Vr/total</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">ReteFuente</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">ReteICA</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Vr/neto</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Descto Financiero</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">%</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Vence</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Nom. Bodega</th>
              <th style="padding:5px 8px;text-align:left;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Ciudad</th>
              <th style="padding:5px 8px;text-align:right;color:#6B7280;font-weight:600;border-bottom:1px solid #E5E7EB;white-space:nowrap">Plazo</th>
            </tr>
          </thead>`;

      const tableSection = shouldShowTable
        ? `<div class="mt-2">
            <p class="text-xs font-semibold mb-1" style="color:#374151">
              <i class="fas fa-list-check mr-1" style="color:#1A4B8C"></i>${showAll ? 'Detalle de comprobantes contables' : 'Detalle de novedades'}
            </p>
            <div class="overflow-x-auto rounded-lg border" style="border-color:#E5E7EB">
              <table style="width:100%;border-collapse:collapse;font-size:11px">
                ${gridHeader}
                <tbody>${rowHtmls.join('')}</tbody>
              </table>
            </div>
           </div>`
        : `<p class="text-xs mt-1" style="color:#16A34A"><i class="fas fa-shield-check mr-1"></i>Sin novedades — secuencia completa y todos los comprobantes cuadrados.</p>`;

      return `
        <div class="rounded-xl border p-4 mb-3"
             style="border-color:${gHasNovedad ? (g.imbalanced.length ? '#FECDD3' : '#FED7AA') : '#D1FAE5'};background:#fff">
          <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono font-bold text-base" style="color:#1A4B8C">${esc(g.prefix)}</span>
              <span class="text-sm font-medium" style="color:#374151">— ${esc(g.name)}</span>
              <i class="fas ${statusIcon}" style="color:${statusColor}"></i>
            </div>
            <span class="text-xs text-gray-400">${esc(dateFrom)} al ${esc(dateTo)}</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-7 gap-2 mb-3 text-center">
            <div class="rounded-lg p-2" style="background:#F1F5F9">
              <p class="text-xs" style="color:#6B7280">N° Inicial</p>
              <p class="font-bold text-sm" style="color:#0D2137">${g.minNum !== null ? g.minNum : '—'}</p>
            </div>
            <div class="rounded-lg p-2" style="background:#F1F5F9">
              <p class="text-xs" style="color:#6B7280">N° Final</p>
              <p class="font-bold text-sm" style="color:#0D2137">${g.maxNum !== null ? g.maxNum : '—'}</p>
            </div>
            <div class="rounded-lg p-2" style="background:#F1F5F9">
              <p class="text-xs" style="color:#6B7280">Total Docs</p>
              <p class="font-bold text-sm" style="color:#1A4B8C">${g.totalDocs}</p>
            </div>
            <div class="rounded-lg p-2" style="background:#F0FDF4">
              <p class="text-xs" style="color:#6B7280">Cuadrados</p>
              <p class="font-bold text-sm" style="color:#16A34A">${g.balanced}</p>
            </div>
            <div class="rounded-lg p-2" style="${g.imbalanced.length ? 'background:#FFF1F2' : 'background:#F0FDF4'}">
              <p class="text-xs" style="color:#6B7280">Descuadrados</p>
              <p class="font-bold text-sm" style="color:${g.imbalanced.length ? '#DC2626' : '#16A34A'}">${g.imbalanced.length}</p>
            </div>
            <div class="rounded-lg p-2" style="${g.drafts.length ? 'background:#FFFBEB' : 'background:#F0FDF4'}">
              <p class="text-xs" style="color:#6B7280">Pendientes</p>
              <p class="font-bold text-sm" style="color:${g.drafts.length ? '#D97706' : '#16A34A'}">${g.drafts.length}</p>
            </div>
            <div class="rounded-lg p-2" style="${g.gaps.length ? 'background:#FFF7ED' : 'background:#F0FDF4'}">
              <p class="text-xs" style="color:#6B7280">Faltantes</p>
              <p class="font-bold text-sm" style="color:${g.gaps.length ? '#D97706' : '#16A34A'}">${g.gaps.length}</p>
            </div>
          </div>
          ${tableSection}
        </div>`;
    }).join('');

    container.innerHTML = tabsHtml + summaryBar + `
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-semibold" style="color:#374151">
            ${_auditGroups.length} tipo${_auditGroups.length !== 1 ? 's' : ''} de comprobante · ${esc(dateFrom)} — ${esc(dateTo)}
          </p>
          ${anyNovedad
            ? `<span class="badge badge-red"><i class="fas fa-triangle-exclamation mr-1"></i>Hay novedades</span>`
            : `<span class="badge badge-green"><i class="fas fa-check-circle mr-1"></i>Sin novedades</span>`}
        </div>
        ${groupsHtml}
      </div>`;

    // Tab selectors interactivity
    container.querySelector('#ca-tab-accounting')?.addEventListener('click', (e) => {
      e.preventDefault();
      _activeTab = 'accounting';
      renderAuditResults(container, dateFrom, dateTo);
    });

    container.querySelector('#ca-tab-commercial')?.addEventListener('click', (e) => {
      e.preventDefault();
      _activeTab = 'commercial';
      renderAuditResults(container, dateFrom, dateTo);
    });
  }

  // ---------------------------------------------------------------------------
  //  PDF
  // ---------------------------------------------------------------------------
  const exportPdf = async () => {
    if (!_auditGroups.length || !_auditParams) return;
    try {
      const jsPdfCtor = getPdfCtorOrWarn();
      if (!jsPdfCtor) return;
      const { dateFrom, dateTo, showAll } = _auditParams;
      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
      let isFirstPage = true;

      for (const g of _auditGroups) {
        if (!isFirstPage) doc.addPage();
        isFirstPage = false;
        const header = drawPdfHeader(doc, headerCtx, {
          title: 'Auditoría de Consecutivos de Comprobantes',
          subtitles: [
            `Tipo: ${g.prefix} — ${g.name}`, 
            `Período: ${dateFrom} al ${dateTo}`,
            `Vista: ${_activeTab === 'accounting' ? 'Contable' : 'Detalle Comercial'}`
          ],
        });
        let y = header.startY;
        const left = header.marginLeft;

        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(13, 33, 55);
        doc.text(`${g.prefix}  —  ${g.name}`, left, y); y += 13;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
        doc.text(`N° Inicial: ${g.minNum ?? '—'}   N° Final: ${g.maxNum ?? '—'}   Total: ${g.totalDocs}   Cuadrados: ${g.balanced}   Descuadrados: ${g.imbalanced.length}   Pendientes: ${g.drafts.length}   Faltantes: ${g.gaps.length}`, left, y);
        y += 10;

        const hasNovedad = g.gaps.length > 0 || g.imbalanced.length > 0;
        const shouldShowTable = showAll ? (g.rows.length > 0 || g.gaps.length > 0) : hasNovedad;

        if (shouldShowTable) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
          if (showAll) {
            doc.setTextColor(26, 75, 140);
            doc.text('Listado completo de transacciones y novedades:', left, y + 8);
          } else {
            doc.setTextColor(185, 28, 28);
            doc.text('Detalle de novedades:', left, y + 8);
          }
          y += 16;

          const body = [];
          const combinedItems = [];
          let txRowsToInclude = [];
          if (showAll) {
            txRowsToInclude = g.rows;
          } else {
            const unionSet = new Set();
            for (const r of g.imbalanced) {
              txRowsToInclude.push(r);
              unionSet.add(r.id);
            }
            for (const r of g.drafts) {
              if (!unionSet.has(r.id)) {
                txRowsToInclude.push(r);
                unionSet.add(r.id);
              }
            }
          }
          for (const r of txRowsToInclude) {
            combinedItems.push({ type: 'tx', data: r, consec: r.consec });
          }
          for (const gap of g.gaps) {
            combinedItems.push({ type: 'gap', data: gap, consec: gap });
          }
          combinedItems.sort((a, b) => {
            if (a.consec !== null && b.consec !== null) return a.consec - b.consec;
            const numA = a.type === 'tx' ? a.data.number : '';
            const numB = b.type === 'tx' ? b.data.number : '';
            return numA.localeCompare(numB);
          });

          if (_activeTab === 'accounting') {
            for (const item of combinedItems) {
              if (item.type === 'tx') {
                const r = item.data;
                const isImbal = !r.balanced || !r.hasLines;
                const isDraft = r.status === 'draft';
                body.push([
                  isImbal ? 'Descuadre' : (isDraft ? 'Pendiente' : 'Cuadrado'),
                  r.number,
                  r.date,
                  (r.description || '—').slice(0, 50),
                  fmtPdfNum(r.debit),
                  fmtPdfNum(r.credit),
                  fmtPdfNum(r.diff)
                ]);
              } else {
                const gap = item.data;
                body.push(['Faltante', `${g.prefix}-${String(gap).padStart(8, '0')}`, '—', 'Registro no encontrado', '—', '—', '—']);
              }
            }

            doc.autoTable({
              startY: y,
              head: [['Estado', 'Comprobante', 'Fecha', 'Descripción', 'Débito', 'Crédito', 'Diferencia']],
              body,
              theme: 'plain',
              margin: { left, right: 24, bottom: 26 },
              styles: { font: 'helvetica', fontSize: 7, textColor: [55, 55, 55], cellPadding: 2 },
              headStyles: { fillColor: [26, 75, 140], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
              columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 90, fontStyle: 'bold' }, 2: { cellWidth: 55 }, 3: { cellWidth: 230 }, 4: { cellWidth: 75, halign: 'right' }, 5: { cellWidth: 75, halign: 'right' }, 6: { cellWidth: 55, halign: 'right' } },
              didParseCell: (data) => {
                if (data.section !== 'body') return;
                const tipo = data.row.raw[0];
                if (tipo === 'Descuadre') { 
                  data.cell.styles.fillColor = [255, 241, 242]; 
                  data.cell.styles.textColor = [159, 18, 57]; 
                } else if (tipo === 'Faltante') { 
                  data.cell.styles.fillColor = [255, 251, 235]; 
                  data.cell.styles.textColor = [146, 64, 14]; 
                } else if (tipo === 'Pendiente') {
                  data.cell.styles.fillColor = [255, 251, 235]; 
                  data.cell.styles.textColor = [217, 119, 6]; 
                } else if (tipo === 'Cuadrado') {
                  data.cell.styles.fillColor = [240, 253, 244];
                  data.cell.styles.textColor = [22, 163, 74];
                }
              },
              didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
            });
          } else {
            // DETALLE COMERCIAL PDF (16 columnas adaptadas a Horizontal Letter)
            for (const item of combinedItems) {
              if (item.type === 'tx') {
                const r = item.data;
                const isImbal = !r.balanced || !r.hasLines;
                body.push([
                  isImbal ? 'Descuadre' : 'Cuadrado',
                  g.prefix,
                  r.number.replace(g.prefix + '-', ''),
                  r.affects || '—',
                  r.extRef || '—',
                  r.date,
                  (r.thirdPartyName || '—').slice(0, 25),
                  (r.description || '—').slice(0, 25),
                  fmtPdfNum(r.subtotal),
                  fmtPdfNum(r.iva),
                  fmtPdfNum(r.total),
                  fmtPdfNum(r.retefuente),
                  fmtPdfNum(r.reteica),
                  fmtPdfNum(r.neto),
                  r.dueDate || '—',
                  (r.warehouseName || '—').slice(0, 15)
                ]);
              } else {
                const gap = item.data;
                body.push([
                  'Faltante', g.prefix, String(gap).padStart(8, '0'), '—', '—', '—',
                  'Registro no encontrado', '—', '—', '—', '—', '—', '—', '—', '—', '—'
                ]);
              }
            }

            doc.autoTable({
              startY: y,
              head: [['Estado', 'Tipo', 'Número', 'Afecta', 'No Ext.', 'Fecha', 'Proveedor', 'Detalle', 'Subtotal', 'IVA', 'Total', 'ReteFuente', 'ReteICA', 'Neto', 'Vence', 'Bodega']],
              body,
              theme: 'plain',
              margin: { left, right: 24, bottom: 26 },
              styles: { font: 'helvetica', fontSize: 6, textColor: [55, 55, 55], cellPadding: 2 },
              headStyles: { fillColor: [26, 75, 140], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.2 },
              columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 20 },
                2: { cellWidth: 45 },
                3: { cellWidth: 45 },
                4: { cellWidth: 45 },
                5: { cellWidth: 45 },
                6: { cellWidth: 80 },
                7: { cellWidth: 80 },
                8: { cellWidth: 45 },
                9: { cellWidth: 35 },
                10: { cellWidth: 45 },
                11: { cellWidth: 35 }, // ReteFuente
                12: { cellWidth: 35 }, // ReteICA
                13: { cellWidth: 45 }, // Neto
                14: { cellWidth: 45 }, // Vence
                15: { cellWidth: 50 }  // Bodega
              },
              didParseCell: (data) => {
                if (data.section !== 'body') return;
                const tipo = data.row.raw[0];
                if (tipo === 'Descuadre') { 
                  data.cell.styles.fillColor = [255, 241, 242]; 
                  data.cell.styles.textColor = [159, 18, 57]; 
                } else if (tipo === 'Faltante') { 
                  data.cell.styles.fillColor = [255, 251, 235]; 
                  data.cell.styles.textColor = [146, 64, 14]; 
                } else if (tipo === 'Cuadrado') {
                  data.cell.styles.fillColor = [240, 253, 244];
                  data.cell.styles.textColor = [22, 163, 74];
                }
              },
              didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
            });
          }
        } else {
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(22, 163, 74);
          doc.text('Sin novedades — secuencia completa y todos cuadrados.', left, y + 8);
          drawPdfFooter(doc, 1);
        }
      }
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) { doc.setPage(p); drawPdfFooter(doc, p); }
      doc.save(`auditoria_consecutivos_${_auditParams.dateFrom}_${_auditParams.dateTo}.pdf`);
      showToast('PDF generado correctamente.', 'success');
    } catch (err: any) { showToast(`Error al generar PDF: ${err.message}`, 'error'); }
  };

  // ---------------------------------------------------------------------------
  //  EXCEL
  // ---------------------------------------------------------------------------
  const exportExcel = () => {
    if (!_auditGroups.length || !_auditParams) return;
    const { dateFrom, dateTo, showAll } = _auditParams;

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8"/><style>
      table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; margin-bottom: 20px; }
      th { background-color: #1A4B8C; color: #FFFFFF; font-weight: bold; border: 0.5pt solid #CCCCCC; padding: 6px; text-align: left; }
      td { border: 0.5pt solid #E5E7EB; padding: 5px; vertical-align: middle; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .bold { font-weight: bold; }
      .header-section { font-size: 12pt; font-weight: bold; background-color: #0D2137; color: #FFFFFF; text-align: center; border: 0.5pt solid #0D2137; }
    </style></head><body>`;

    if (_activeTab === 'accounting') {
      const filename = showAll ? `auditoria_detalle_${dateFrom}_${dateTo}` : `auditoria_novedades_${dateFrom}_${dateTo}`;
      // ── TABLE 1: RESUMEN ──
      html += `<table>`;
      html += `<tr><th colspan="9" class="header-section" style="background-color:#0D2137; color:#FFFFFF; font-size:11pt; font-weight:bold; padding:8px; text-align:center;">RESUMEN DE AUDITORÍA DE CONSECUTIVOS (${dateFrom} al ${dateTo})</th></tr>`;
      html += `<tr>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Prefijo</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Nombre</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">N° Inicial</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">N° Final</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Total Documentos</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Cuadrados</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Descuadrados</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Pendientes</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Faltantes</th>
      </tr>`;

      for (const g of _auditGroups) {
        html += `<tr>
          <td class="bold" style="color:#1A4B8C;">${esc(g.prefix)}</td>
          <td>${esc(g.name)}</td>
          <td class="text-right">${g.minNum ?? '—'}</td>
          <td class="text-right">${g.maxNum ?? '—'}</td>
          <td class="text-right bold">${g.totalDocs}</td>
          <td class="text-right" style="color:#16A34A;">${g.balanced}</td>
          <td class="text-right" style="color:${g.imbalanced.length ? '#DC2626' : '#16A34A'}; font-weight:${g.imbalanced.length ? 'bold' : 'normal'};">${g.imbalanced.length}</td>
          <td class="text-right" style="color:${g.drafts.length ? '#D97706' : '#16A34A'}; font-weight:${g.drafts.length ? 'bold' : 'normal'};">${g.drafts.length}</td>
          <td class="text-right" style="color:${g.gaps.length ? '#D97706' : '#16A34A'}; font-weight:${g.gaps.length ? 'bold' : 'normal'};">${g.gaps.length}</td>
        </tr>`;
      }
      html += `</table>`;
      html += `<div style="height:20px; line-height:20px;">&nbsp;</div>`;

      // ── TABLE 2: DETALLE ──
      html += `<table>`;
      const detailTitle = showAll ? 'DETALLE COMPLETO DE TRANSACCIONES Y NOVEDADES EN SECUENCIA' : 'DETALLE DE NOVEDADES DETECTADAS (DESCUADRES Y FALTANTES)';
      html += `<tr><th colspan="8" class="header-section" style="background-color:#0D2137; color:#FFFFFF; font-size:11pt; font-weight:bold; padding:8px; text-align:center;">${detailTitle}</th></tr>`;
      html += `<tr>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Prefijo</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Estado</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Comprobante</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Fecha</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF;">Descripción</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Débito</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Crédito</th>
        <th style="background-color:#1A4B8C; color:#FFFFFF; text-align:right;">Diferencia</th>
      </tr>`;

      let hasDetailRows = false;
      for (const g of _auditGroups) {
        const combinedItems = [];
        let txRowsToInclude = [];
        if (showAll) {
          txRowsToInclude = g.rows;
        } else {
          const unionSet = new Set();
          for (const r of g.imbalanced) {
            txRowsToInclude.push(r);
            unionSet.add(r.id);
          }
          for (const r of g.drafts) {
            if (!unionSet.has(r.id)) {
              txRowsToInclude.push(r);
              unionSet.add(r.id);
            }
          }
        }
        for (const r of txRowsToInclude) {
          combinedItems.push({ type: 'tx', data: r, consec: r.consec });
        }
        for (const gap of g.gaps) {
          combinedItems.push({ type: 'gap', data: gap, consec: gap });
        }
        combinedItems.sort((a, b) => {
          if (a.consec !== null && b.consec !== null) return a.consec - b.consec;
          const numA = a.type === 'tx' ? a.data.number : '';
          const numB = b.type === 'tx' ? b.data.number : '';
          return numA.localeCompare(numB);
        });

        for (const item of combinedItems) {
          hasDetailRows = true;
          if (item.type === 'tx') {
            const r = item.data;
            const isImbal = !r.balanced || !r.hasLines;
            const isDraft = r.status === 'draft';
            const estado = isImbal ? 'Descuadre' : (isDraft ? 'Pendiente' : 'Cuadrado');
            const diffColor = isImbal ? 'color:#DC2626; font-weight:bold;' : (isDraft ? 'color:#D97706;' : 'color:#16A34A;');
            const rowBg = isImbal ? 'background-color:#FFF1F2;' : (isDraft ? 'background-color:#FFFBEB;' : 'background-color:#F0FDF4;');
            
            html += `<tr style="${rowBg}">
              <td class="bold" style="color:#1A4B8C">${esc(g.prefix)}</td>
              <td style="font-weight:bold; color:${isImbal ? '#DC2626' : '#16A34A'}">${estado}</td>
              <td class="bold" style="color:#1A4B8C">${esc(r.number)}</td>
              <td>${esc(r.date)}</td>
              <td style="color:#555555">${esc(r.description || '—')}</td>
              <td class="text-right">${r.debit ? r.debit.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</td>
              <td class="text-right">${r.credit ? r.credit.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</td>
              <td class="text-right" style="${diffColor}">${r.diff ? r.diff.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</td>
            </tr>`;
          } else {
            const gap = item.data;
            html += `<tr style="background-color:#FFFBEB;">
              <td class="bold" style="color:#D97706">${esc(g.prefix)}</td>
              <td style="font-weight:bold; color:#D97706">Faltante</td>
              <td class="bold" style="color:#D97706">${esc(g.prefix)}-${String(gap).padStart(8, '0')}</td>
              <td style="color:#9CA3AF">—</td>
              <td style="color:#9CA3AF">Registro no encontrado en el sistema</td>
              <td class="text-right" style="color:#9CA3AF">—</td>
              <td class="text-right" style="color:#9CA3AF">—</td>
              <td class="text-right" style="color:#9CA3AF">—</td>
            </tr>`;
          }
        }
      }

      if (!hasDetailRows) {
        html += `<tr><td colspan="8" style="text-align:center; color:#6B7280; font-style:italic; padding:10px; background-color:#F9FAFB;">Sin novedades (secuencia completa y comprobantes cuadrados)</td></tr>`;
      }

      html += `</table>`;
      html += `</body></html>`;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Excel generado correctamente.', 'success');
    } else {
      // ── DETALLE COMERCIAL EXCEL (Exact match with reporteCompras / 31 columnas) ──
      const filename = `reporte_comercial_auditoria_${dateFrom}_${dateTo}`;
      html += `<table>`;
      html += `<tr><th colspan="32" class="header-section" style="background-color:#0D2137; color:#FFFFFF; font-size:12pt; font-weight:bold; padding:10px; text-align:center;">LISTADO COMERCIAL DE TRANSACCIONES Y DOCUMENTOS EN AUDITORÍA DE CONSECUTIVOS</th></tr>`;
      html += `<tr><th colspan="32" class="text-center" style="background-color:#1F2937; color:#FFFFFF; font-size:9pt; padding:4px;">Periodo Desde: ${dateFrom} Hasta ${dateTo}</th></tr>`;
      
      const excelHeaders = [
        '', 'Tipo', 'Numero', 'Afecta', 'Afectado Por', 'No Ext.', 'Fecha', 'Resp. Fiscal', 'Proveedor', 'Detalle', 
        'Subtotal', 'Vr/iva', 'Vr/ico', 'Vr/Ibua', 'Vr/Icui', 'Vr/total', 'ReteFuente', 'ReteICA', 'Vr/neto', 
        'Descto Financiero', '%', 'Plazo', 'Vence', 'Ultimo Abono/pago', 'Fecha Pago', 'Fecha Entrega', 
        'Dias', 'Anul', 'Nom. Bodega', 'Ciudad', 'Anexo 1', 'Anexo 2'
      ];

      html += `<tr>`;
      for (const h of excelHeaders) {
        html += `<th style="background-color:#1A4B8C; color:#FFFFFF; border:0.5pt solid #CCCCCC;">${esc(h)}</th>`;
      }
      html += `</tr>`;

      let hasDetailRows = false;
      for (const g of _auditGroups) {
        const combinedItems: any[] = [];
        const txRowsToInclude = showAll ? g.rows : g.imbalanced;
        for (const r of txRowsToInclude) { combinedItems.push({ type: 'tx', data: r, consec: r.consec }); }
        for (const gap of g.gaps) { combinedItems.push({ type: 'gap', data: gap, consec: gap }); }
        combinedItems.sort((a, b) => {
          if (a.consec !== null && b.consec !== null) return a.consec - b.consec;
          const numA = a.type === 'tx' ? a.data.number : '';
          const numB = b.type === 'tx' ? b.data.number : '';
          return numA.localeCompare(numB);
        });

        for (const item of combinedItems) {
          hasDetailRows = true;
          if (item.type === 'tx') {
            const r = item.data;
            const isImbal = !r.balanced || !r.hasLines;
            const isVoided = r.status === 'void' || r.status === 'voided' || r.status === 'cancelled';
            const stateChar = isVoided ? 'A' : 'N';
            
            const formatVal = (val: number) => val ? val.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
            const numWithoutPrefix = r.number.replace(g.prefix + '-', '');

            html += `<tr style="${isImbal ? 'background-color:#FFF1F2;' : ''}">
              <td class="text-center font-bold">${stateChar}</td>
              <td class="bold" style="color:#1A4B8C;">${esc(g.prefix)}</td>
              <td class="bold">${esc(numWithoutPrefix)}</td>
              <td>${esc(r.affects || '')}</td>
              <td>${esc(r.affectedBy || '')}</td>
              <td>${esc(r.extRef || '')}</td>
              <td class="text-center">${esc(r.date)}</td>
              <td>${esc(r.thirdPartyResp || '')}</td>
              <td>${esc(r.thirdPartyName || '')} ${r.thirdPartyDoc ? '(' + esc(r.thirdPartyDoc) + ')' : ''}</td>
              <td>${esc(r.description || '')}</td>
              <td class="text-right">${formatVal(r.subtotal)}</td>
              <td class="text-right">${formatVal(r.iva)}</td>
              <td class="text-right">${formatVal(r.vrIco)}</td>
              <td class="text-right">${formatVal(r.vrIbua)}</td>
              <td class="text-right">${formatVal(r.vrIcui)}</td>
              <td class="text-right bold" style="color:#1A4B8C;">${formatVal(r.total)}</td>
              <td class="text-right" style="color:#DC2626;">${formatVal(r.retefuente)}</td>
              <td class="text-right" style="color:#DC2626;">${formatVal(r.reteica)}</td>
              <td class="text-right bold" style="color:#16A34A;">${formatVal(r.neto)}</td>
              <td class="text-right">${formatVal(r.desctoFinanciero)}</td>
              <td class="text-right">${r.desctoPct || 0}</td>
              <td class="text-right">${r.paymentDays || 0}</td>
              <td class="text-center">${esc(r.dueDate || '')}</td>
              <td class="text-right">0,00</td>
              <td></td>
              <td></td>
              <td class="text-right">${r.dias || 0}</td>
              <td class="text-center">${isVoided ? 'A' : ''}</td>
              <td>${esc(r.warehouseName || '')}</td>
              <td>${esc(r.thirdPartyCity || '')}</td>
              <td></td>
              <td></td>
            </tr>`;
          } else {
            const gap = item.data;
            html += `<tr style="background-color:#FFFBEB;">
              <td class="text-center font-bold">A</td>
              <td class="bold" style="color:#D97706;">${esc(g.prefix)}</td>
              <td class="bold" style="color:#D97706;">${String(gap).padStart(8, '0')}</td>
              <td colspan="29" style="color:#9CA3AF; font-style:italic;">Registro faltante (secuencia de consecutivo no encontrada en base de datos)</td>
            </tr>`;
          }
        }
      }

      if (!hasDetailRows) {
        html += `<tr><td colspan="32" style="text-align:center; color:#6B7280; font-style:italic; padding:10px; background-color:#F9FAFB;">Sin comprobantes registrados para los criterios seleccionados.</td></tr>`;
      }

      html += `</table>`;
      html += `</body></html>`;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Excel comercial generado correctamente.', 'success');
    }
  };

  $('#btn-ca-generate')?.addEventListener('click', runAudit);
  $('#btn-ca-pdf')?.addEventListener('click', exportPdf);
  $('#btn-ca-excel')?.addEventListener('click', exportExcel);
}

/* ══════════════════════════════════════════════════════════
   REPORT: BALANCE POR CENTRO DE COSTO (ÁREAS DE ACTIVIDAD)
   ══════════════════════════════════════════════════════════ */
async function renderCostCentersReport() {
  const host = getReportViewHost();
  if (!host) return;

  const branches = await pb.listAll('branches', { filter: 'active=true', ignoreBranch: true });
  const activeBranchId = localStorage.getItem('active_branch_id') || 'TODAS';

  host.innerHTML = `
    <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input id="cc-rep-from" type="date" class="form-input" value="${todayStr().slice(0, 8)}01">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input id="cc-rep-to" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Sucursal</label>
          <select id="cc-rep-branch" class="form-input">
            <option value="TODAS">TODAS LAS SUCURSALES</option>
            ${branches.map(b => `<option value="${esc(b.id)}" ${b.id === activeBranchId ? 'selected' : ''}>${esc(b.code)} — ${esc(b.name)}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary w-full justify-center" id="btn-cc-rep-generate"><i class="fas fa-rotate mr-1.5"></i>Generar</button>
        </div>
      </div>
    </div>

    <div id="cc-rep-results" class="bg-white rounded-2xl border overflow-hidden p-6 text-center" style="border-color:#F0F0F0; color:#9CA3AF">
      Establece los filtros y haz clic en "Generar" para consultar los saldos por Centro de Costo.
    </div>
  `;

  const runReport = async () => {
    const fromDate = getInputVal('cc-rep-from');
    const toDate = getInputVal('cc-rep-to');
    const branchId = getSelectVal('cc-rep-branch');

    const results = document.getElementById('cc-rep-results');
    if (!results) return;

    results.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos...</div>`;

    try {
      // 1. Obtener centros de costo
      const costCenters = await pb.listAll('cost_centers', { sort: 'code' });
      
      // 2. Obtener movimientos asociados a centros de costo
      let filter = `tx_id.date >= "${fromDate}" && tx_id.date <= "${toDate}" && tx_id.status = "active"`;
      if (branchId && branchId !== 'TODAS') {
        filter += ` && branch_id = "${branchId}"`;
      }
      
      const lines = await pb.listAll('tx_lines', { filter });

      // 3. Consolidar totales por ID de Centro de Costo
      const ccTotals = new Map();
      for (const line of lines) {
        const ccId = line.cost_center_id || '';
        if (!ccTotals.has(ccId)) {
          ccTotals.set(ccId, { debit: 0, credit: 0 });
        }
        const totals = ccTotals.get(ccId);
        totals.debit += Number(line.debit || 0);
        totals.credit += Number(line.credit || 0);
      }

      // 4. Construir las filas con jerarquía
      const ccMap = new Map();
      costCenters.forEach(cc => ccMap.set(cc.id, cc));

      const getDepth = (cc) => {
        let depth = 0;
        let curr = cc;
        while (curr && curr.parent_id) {
          depth++;
          curr = ccMap.get(curr.parent_id);
        }
        return depth;
      };

      const ccRows = costCenters.map(cc => {
        const t = ccTotals.get(cc.id) || { debit: 0, credit: 0 };
        return {
          id: cc.id,
          code: cc.code,
          name: cc.name,
          parent_id: cc.parent_id,
          depth: getDepth(cc),
          ownDebit: t.debit,
          ownCredit: t.credit,
          debit: 0,
          credit: 0
        };
      });

      const rowMap = new Map(ccRows.map(r => [r.id, r]));

      // 5. Rollup recursivo a padres
      const addTotalToParents = (parent_id, debit, credit) => {
        let currId = parent_id;
        while (currId) {
          const parent = rowMap.get(currId);
          if (!parent) break;
          parent.debit += debit;
          parent.credit += credit;
          currId = parent.parent_id;
        }
      };

      for (const r of ccRows) {
        r.debit += r.ownDebit;
        r.credit += r.ownCredit;
        if (r.parent_id) {
          addTotalToParents(r.parent_id, r.ownDebit, r.ownCredit);
        }
      }

      // Filtrar filas para omitir las que no tengan saldo alguno
      const activeRows = ccRows.filter(r => r.debit !== 0 || r.credit !== 0);

      if (!activeRows.length) {
        results.innerHTML = `<div class="p-6 text-center" style="color:#6B7280"><i class="fas fa-folder-open mr-2 text-lg"></i>No se encontraron movimientos registrados en centros de costo para el período seleccionado.</div>`;
        return;
      }

      const totalD = activeRows.reduce((s, r) => s + (r.parent_id ? 0 : r.debit), 0);
      const totalC = activeRows.reduce((s, r) => s + (r.parent_id ? 0 : r.credit), 0);

      results.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold text-left" style="color:#0D2137">Resultados de Consolidación</h4>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" id="btn-cc-rep-excel"><i class="fas fa-file-excel mr-1"></i>Excel</button>
            <button class="btn btn-outline btn-sm" id="btn-cc-rep-pdf"><i class="fas fa-file-pdf mr-1"></i>PDF</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table text-left" id="cc-rep-table">
            <thead>
              <tr>
                <th>Código CC</th>
                <th>Centro de Costo / Área</th>
                <th class="text-right">Débitos</th>
                <th class="text-right">Créditos</th>
                <th class="text-right">Saldo Neto</th>
              </tr>
            </thead>
            <tbody>
              ${activeRows.map(r => {
                const padding = r.depth * 20;
                const net = r.debit - r.credit;
                const isRoot = !r.parent_id;
                
                return `
                <tr class="${isRoot ? 'font-bold bg-gray-50' : ''}">
                  <td>
                    <div style="padding-left: ${padding}px; display: flex; align-items: center; gap: 6px;">
                      ${r.depth > 0 ? '<i class="fas fa-turn-up fa-rotate-90 text-gray-400 text-xs"></i>' : '<i class="fas fa-folder text-indigo-500 text-xs"></i>'}
                      <span>${esc(r.code)}</span>
                    </div>
                  </td>
                  <td>${esc(r.name)}</td>
                  <td class="text-right">${fmt(r.debit)}</td>
                  <td class="text-right">${fmt(r.credit)}</td>
                  <td class="text-right ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${fmt(net)}</td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr class="font-bold text-indigo-900" style="background:#EEF2F6">
                <td colspan="2">TOTAL CONSOLIDADO (RAÍZ)</td>
                <td class="text-right">${fmt(totalD)}</td>
                <td class="text-right">${fmt(totalC)}</td>
                <td class="text-right ${(totalD - totalC) >= 0 ? 'text-emerald-700' : 'text-rose-700'}">${fmt(totalD - totalC)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

      $('#btn-cc-rep-excel')?.addEventListener('click', () => exportCostCentersExcel(activeRows, fromDate, toDate));
      $('#btn-cc-rep-pdf')?.addEventListener('click', () => exportCostCentersPDF(activeRows, fromDate, toDate));

    } catch (err) {
      results.innerHTML = `<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
    }
  };

  $('#btn-cc-rep-generate')?.addEventListener('click', runReport);
}

function exportCostCentersExcel(rows, fromDate, toDate) {
  try {
    const data = [
      ["REPORTE: BALANCE POR CENTRO DE COSTO"],
      [`Período: ${fromDate} a ${toDate}`],
      ["Fecha de Generación:", todayStr()],
      [],
      ["CÓDIGO CC", "CENTRO DE COSTO", "DEBITOS", "CREDITOS", "SALDO NETO"]
    ];

    for (const r of rows) {
      const net = r.debit - r.credit;
      data.push([
        r.code,
        r.name,
        r.debit,
        r.credit,
        net
      ]);
    }

    const ws = (window as any).XLSX.utils.aoa_to_sheet(data);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, 'Balance CC');
    (window as any).XLSX.writeFile(wb, `Balance_Centros_Costo_${fromDate}_${toDate}.xlsx`);
  } catch (err: any) {
    showToast(`Error al exportar Excel: ${err.message}`, 'error');
  }
}

function exportCostCentersPDF(rows, fromDate, toDate) {
  try {
    const doc = new (window as any).jspdf.jsPDF('p', 'pt', 'letter');
    const headerCtx = {
      title: 'BALANCE POR CENTRO DE COSTO',
      subtitle: `Período: ${fromDate} a ${toDate}`,
      company: localStorage.getItem('active_company_name') || 'GRAVY',
      branch: getSelectVal('cc-rep-branch') || 'TODAS',
      user: pb.currentUser?.name || 'Administrador',
      date: todayStr(),
    };

    const header = (window as any).drawPdfHeader(doc, headerCtx, {
      title: 'Balance por Centro de Costo',
      subtitle: `Período: ${fromDate} a ${toDate}`,
    });

    const body = [];
    for (const r of rows) {
      const net = r.debit - r.credit;
      body.push([
        { content: r.code, styles: { fontStyle: r.parent_id ? 'normal' : 'bold' } },
        { content: r.name, styles: { fontStyle: r.parent_id ? 'normal' : 'bold' } },
        { content: fmtPdfNum(r.debit), styles: { fontStyle: r.parent_id ? 'normal' : 'bold', halign: 'right' } },
        { content: fmtPdfNum(r.credit), styles: { fontStyle: r.parent_id ? 'normal' : 'bold', halign: 'right' } },
        { content: fmtPdfNum(net), styles: { fontStyle: 'bold', halign: 'right', textColor: net >= 0 ? [16, 124, 65] : [220, 38, 38] } }
      ]);
    }

    doc.autoTable({
      startY: header.startY,
      head: [['Código CC', 'Centro de Costo / Área', 'Débitos', 'Créditos', 'Saldo Neto']],
      body,
      theme: 'plain',
      margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
      styles: { font: 'helvetica', fontSize: 7.5, textColor: [55, 55, 55], cellPadding: 3.5, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 8.0, lineWidth: { bottom: 0.25 } },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 230 },
        2: { cellWidth: 80, halign: 'right' },
        3: { cellWidth: 80, halign: 'right' },
        4: { cellWidth: 80, halign: 'right' },
      },
      didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
    });

    doc.save(`balance_centros_costo_${fromDate}_a_${toDate}.pdf`);
  } catch (err: any) {
    showToast(`Error al generar PDF: ${err.message}`, 'error');
  }
}

// ── REPORTE ESTADO DE CUENTA POR TERCERO ──
async function renderAccountStatementReport() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Estado de Cuenta por Tercero...</div>';

  try {
    const [{ accounts }, thirdParties] = await Promise.all([
      ensureAccountsSaldos(),
      ensureThirdParties(),
    ]);

    const firstDayOfMonth = todayStr().slice(0, 8) + '01';
    const today = todayStr();

    view.innerHTML = `
      <div class="p-4 border-b" style="border-color:#F3F4F6">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold text-base flex items-center" style="color:#0D2137"><i class="fas fa-file-invoice mr-2" style="color:#1A4B8C"></i>Estado de Cuenta por Tercero</h4>
            <p class="text-xs" style="color:#6B7280">Consulta saldos iniciales, débitos, créditos y saldo final acumulado de un tercero en un lapso de tiempo.</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div class="relative md:col-span-2">
            <label class="text-xs font-semibold" style="color:#6B7280">Tercero <span class="text-red-500">*</span></label>
            <input type="text" id="stmt-third-search" class="form-input w-full mt-1" placeholder="Buscar por Nit, Cédula o Nombre..." autocomplete="off" />
            <input type="hidden" id="stmt-third" value="" />
            <div id="stmt-third-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:250px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:90"></div>
          </div>
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Filtrar por Cuentas</label>
            <select id="stmt-acct-type" class="form-input mt-1 w-full">
              <option value="all" selected>Todas las Cuentas</option>
              <option value="cxc">Cuentas por Cobrar (Clase 13 - Cartera)</option>
              <option value="cxp">Cuentas por Pagar (Clase 22 / 23 - Proveedores)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Fecha desde</label>
            <input type="date" id="stmt-date-from" class="form-input mt-1" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold" style="color:#6B7280">Fecha hasta</label>
            <input type="date" id="stmt-date-to" class="form-input mt-1" value="${today}" />
          </div>
          <div class="flex gap-1">
            <button type="button" class="btn btn-xs btn-outline" id="stmt-quick-month" style="font-size:11px">Mes actual</button>
            <button type="button" class="btn btn-xs btn-outline" id="stmt-quick-prev" style="font-size:11px">Mes anterior</button>
            <button type="button" class="btn btn-xs btn-outline" id="stmt-quick-year" style="font-size:11px">Año actual</button>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1" id="btn-gen-account-statement"><i class="fas fa-filter"></i> Generar</button>
            <button class="btn btn-outline" id="btn-pdf-account-statement" disabled><i class="fas fa-file-pdf"></i> PDF</button>
            ${can('canExport') ? '<button class="btn btn-outline" id="btn-exp-account-statement" disabled><i class="fas fa-file-excel"></i> Excel</button>' : ''}
          </div>
        </div>
      </div>
      <div id="account-statement-results" class="p-6 text-sm text-center" style="color:#6B7280">
        <i class="fas fa-user-tag text-2xl mb-2" style="color:#9CA3AF"></i><br>
        Selecciona un tercero y rango de fechas para generar el Estado de Cuenta.
      </div>`;

    initThirdSearch(
      document.getElementById('stmt-third-search') as HTMLInputElement,
      document.getElementById('stmt-third') as HTMLInputElement,
      document.getElementById('stmt-third-results') as HTMLElement,
      thirdParties
    );

    $('#stmt-quick-month')?.addEventListener('click', () => {
      const d = todayStr();
      (document.getElementById('stmt-date-from') as HTMLInputElement).value = d.slice(0, 8) + '01';
      (document.getElementById('stmt-date-to') as HTMLInputElement).value = d;
    });

    $('#stmt-quick-prev')?.addEventListener('click', () => {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      const y = prevMonth.getFullYear();
      const m = String(prevMonth.getMonth() + 1).padStart(2, '0');
      const ld = String(lastDayPrev.getDate()).padStart(2, '0');
      (document.getElementById('stmt-date-from') as HTMLInputElement).value = `${y}-${m}-01`;
      (document.getElementById('stmt-date-to') as HTMLInputElement).value = `${y}-${m}-${ld}`;
    });

    $('#stmt-quick-year')?.addEventListener('click', () => {
      const y = todayStr().slice(0, 4);
      (document.getElementById('stmt-date-from') as HTMLInputElement).value = `${y}-01-01`;
      (document.getElementById('stmt-date-to') as HTMLInputElement).value = todayStr();
    });

    $('#btn-gen-account-statement')?.addEventListener('click', generateAccountStatementRows);

  } catch (err: any) {
    view.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function generateAccountStatementRows() {
  const results = $('#account-statement-results');
  if (!results) return;

  let thirdId = getSelectVal('stmt-third');
  const acctType = getSelectVal('stmt-acct-type') || 'all';
  const dateFrom = ($('#stmt-date-from')?.value || '').trim();
  const dateTo = ($('#stmt-date-to')?.value || '').trim();

  if (!dateFrom || !dateTo) {
    showToast('Selecciona ambas fechas (desde y hasta).', 'warning');
    return;
  }

  const [{ accounts }, thirdParties] = await Promise.all([
    ensureAccountsSaldos(),
    ensureThirdParties(),
  ]);

  const thirdSearchVal = ($('#stmt-third-search') as HTMLInputElement)?.value.trim();
  if (thirdSearchVal && !thirdId) {
    const exactMatch = thirdParties.find(t =>
      String(t.doc_number || '').trim() === thirdSearchVal ||
      `${t.doc_number || ''} - ${t.name}` === thirdSearchVal ||
      String(t.name || '').trim().toLowerCase() === thirdSearchVal.toLowerCase()
    );
    if (exactMatch) {
      thirdId = exactMatch.id;
      const hiddenEl = document.getElementById('stmt-third') as HTMLInputElement;
      if (hiddenEl) hiddenEl.value = exactMatch.id;
    }
  }

  if (!thirdId) {
    results.innerHTML = '<div class="p-4 text-center text-orange-500 font-semibold"><i class="fas fa-exclamation-triangle mr-2"></i>Por favor selecciona un tercero válido de la lista sugerida.</div>';
    showToast('Selecciona un tercero de la lista.', 'warning');
    return;
  }

  const third = thirdParties.find(t => t.id === thirdId);
  if (!third) {
    showToast('Tercero no encontrado.', 'error');
    return;
  }

  results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos contables...</div>';

  try {
    let allowedAccIdsStr = '';
    if (acctType === 'cxc') {
      const cxcAccs = accounts.filter(a => String(a.code || '').startsWith('13')).map(a => a.id);
      allowedAccIdsStr = cxcAccs.join(',');
    } else if (acctType === 'cxp') {
      const cxpAccs = accounts.filter(a => String(a.code || '').startsWith('22') || String(a.code || '').startsWith('23')).map(a => a.id);
      allowedAccIdsStr = cxpAccs.join(',');
    }

    const res: any = await pb.send(`/api/gravy/report-auxiliary?fromDate=${dateFrom}&toDate=${dateTo}&thirdId=${thirdId}&accountIds=${allowedAccIdsStr}`, { method: 'GET' });
    const { openingBalances, periodLines } = res;

    let initialBalance = 0;
    if (openingBalances && openingBalances.length) {
      for (const ob of openingBalances) {
        initialBalance += Number(ob.balance || 0);
      }
    }

    const lines = (periodLines || []).map((l: any) => ({
      fecha: l.fecha || '',
      comprobante: l.comprobante || '',
      txId: l.txId || '',
      accountCode: l.accountCode || '',
      accountName: l.accountName || '',
      cuenta: `${l.accountCode} - ${l.accountName}`.trim(),
      doc_cruce: l.doc_cruce || '—',
      descripcion: l.descripcion || '',
      debito: Number(l.debito || 0),
      credito: Number(l.credito || 0),
    })).sort((a, b) => `${a.fecha}|${a.comprobante}`.localeCompare(`${b.fecha}|${b.comprobante}`));

    let runningBalance = initialBalance;
    const processedLines = lines.map(l => {
      runningBalance += (l.debito - l.credito);
      return {
        ...l,
        saldo: runningBalance
      };
    });

    const totalDebits = lines.reduce((sum, l) => sum + l.debito, 0);
    const totalCredits = lines.reduce((sum, l) => sum + l.credito, 0);
    const finalBalance = runningBalance;

    const btnPdf = $('#btn-pdf-account-statement') as HTMLButtonElement;
    const btnExp = $('#btn-exp-account-statement') as HTMLButtonElement;
    if (btnPdf) btnPdf.disabled = false;
    if (btnExp) btnExp.disabled = false;

    (window as any).lastAccountStatementData = {
      third,
      dateFrom,
      dateTo,
      acctType,
      initialBalance,
      processedLines,
      totalDebits,
      totalCredits,
      finalBalance,
    };

    const initialPolarity = fmtPolarityAmount(initialBalance);
    const finalPolarity = fmtPolarityAmount(finalBalance);

    results.innerHTML = `
      <div class="bg-white border rounded-2xl p-4 mb-4 text-left" style="border-color:#E5E7EB; background:#F8FAFC">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b" style="border-color:#E2E8F0">
          <div>
            <span class="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded" style="background:#E0E7FF;color:#3730A3">${esc(third.type || 'TERCERO')}</span>
            <h3 class="text-lg font-bold mt-1" style="color:#0D2137">${esc(third.name || 'Sin Nombre')}</h3>
            <p class="text-xs" style="color:#6B7280">NIT / Cédula: <strong style="color:#0D2137">${esc(third.doc_number || 'S.N.')}</strong></p>
          </div>
          <div class="text-right text-xs" style="color:#4B5563">
            <div><i class="fas fa-map-marker-alt mr-1"></i> ${esc(third.address || 'Sin dirección')} ${third.city ? ` - ${esc(third.city)}` : ''}</div>
            <div><i class="fas fa-phone mr-1"></i> ${esc(third.phone || 'Sin teléfono')}</div>
            <div><i class="fas fa-envelope mr-1"></i> ${esc(third.email || 'Sin correo')}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-center">
          <div class="p-2.5 rounded-xl border bg-white" style="border-color:#E5E7EB">
            <span class="text-xs font-semibold block" style="color:#6B7280">Saldo Anterior</span>
            <span class="text-sm font-bold block" style="color:${initialPolarity.color}">${initialPolarity.text}</span>
          </div>
          <div class="p-2.5 rounded-xl border bg-white" style="border-color:#E5E7EB">
            <span class="text-xs font-semibold block" style="color:#6B7280">Movimientos Débito</span>
            <span class="text-sm font-bold block text-emerald-700">$ ${fmt(totalDebits)}</span>
          </div>
          <div class="p-2.5 rounded-xl border bg-white" style="border-color:#E5E7EB">
            <span class="text-xs font-semibold block" style="color:#6B7280">Movimientos Crédito</span>
            <span class="text-sm font-bold block text-rose-700">$ ${fmt(totalCredits)}</span>
          </div>
          <div class="p-2.5 rounded-xl border bg-white" style="border-color:#1A4B8C; background:#EFF6FF">
            <span class="text-xs font-semibold block" style="color:#1A4B8C">Saldo Final (Corte)</span>
            <span class="text-sm font-bold block" style="color:${finalPolarity.color}">${finalPolarity.text}</span>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto" style="max-height:480px">
        <table class="data-table text-left w-full">
          <thead>
            <tr>
              <th style="width:90px">Fecha</th>
              <th style="width:120px">Comprobante</th>
              <th style="width:110px">Doc. Cruce</th>
              <th>Cuenta Contable</th>
              <th>Descripción</th>
              <th class="text-right" style="width:110px">Débito ($)</th>
              <th class="text-right" style="width:110px">Crédito ($)</th>
              <th class="text-right" style="width:120px">Saldo Acum. ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#F9FAFB; font-weight:600">
              <td colspan="5" class="text-right italic" style="color:#4B5563">SALDO ANTERIOR (A ${esc(dateFrom)})</td>
              <td class="text-right">—</td>
              <td class="text-right">—</td>
              <td class="text-right" style="color:${initialPolarity.color}">${initialPolarity.text}</td>
            </tr>

            ${processedLines.length ? processedLines.map(l => {
              const lineSaldoPolarity = fmtPolarityAmount(l.saldo);
              return `
              <tr>
                <td class="font-mono text-xs">${esc(l.fecha)}</td>
                <td>
                  <button type="button" class="hover:underline font-semibold" style="color:#1A4B8C;background:none;border:none;padding:0;cursor:pointer" onclick="openAuxTxDetailInReport('${esc(l.txId)}')">
                    ${esc(l.comprobante)}
                  </button>
                </td>
                <td class="font-mono text-xs">${esc(l.doc_cruce)}</td>
                <td class="text-xs">${esc(l.cuenta)}</td>
                <td class="text-xs">${esc(l.descripcion)}</td>
                <td class="text-right font-mono ${l.debito > 0 ? 'text-emerald-700 font-semibold' : 'text-gray-400'}">${l.debito > 0 ? fmt(l.debito) : '0.00'}</td>
                <td class="text-right font-mono ${l.credito > 0 ? 'text-rose-700 font-semibold' : 'text-gray-400'}">${l.credito > 0 ? fmt(l.credito) : '0.00'}</td>
                <td class="text-right font-mono font-bold" style="color:${lineSaldoPolarity.color}">${lineSaldoPolarity.text}</td>
              </tr>`;
            }).join('') : `
              <tr>
                <td colspan="8" class="text-center py-6 text-gray-400">No se registraron movimientos contables en este período.</td>
              </tr>
            `}
          </tbody>
          <tfoot>
            <tr class="font-bold" style="background:#F1F5F9; color:#0D2137; border-top:2px solid #CBD5E1">
              <td colspan="5" class="text-right">TOTALES DEL PERÍODO:</td>
              <td class="text-right text-emerald-700">${fmt(totalDebits)}</td>
              <td class="text-right text-rose-700">${fmt(totalCredits)}</td>
              <td class="text-right" style="color:${finalPolarity.color}">${finalPolarity.text}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;

    $('#btn-pdf-account-statement')?.addEventListener('click', exportAccountStatementPDF);
    $('#btn-exp-account-statement')?.addEventListener('click', exportAccountStatementExcel);

  } catch (err: any) {
    results.innerHTML = `<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Error al consultar estado de cuenta: ${esc(err.message)}</div>`;
  }
}

async function exportAccountStatementPDF() {
  const data = (window as any).lastAccountStatementData;
  if (!data) return showToast('Genera primero el estado de cuenta.', 'warning');

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;

    const doc = new jsPdfCtor('p', 'pt', 'letter');
    const headerCtx = await getPdfHeaderContext();
    const header = drawPdfHeader(doc, headerCtx, {
      title: 'ESTADO DE CUENTA POR TERCERO',
      subtitles: [
        `TERCERO: ${data.third.name || ''} (${data.third.doc_number || ''})`,
        `PERÍODO: DEL ${data.dateFrom} AL ${data.dateTo}`,
      ]
    });

    let currentY = header.startY;
    const left = header.marginLeft;
    const right = header.marginRight;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(left, currentY, right - left, 45, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(13, 33, 55);
    doc.text(`Tercero: ${data.third.name || 'S.N.'}`, left + 10, currentY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`NIT / Doc: ${data.third.doc_number || 'N/A'}  |  Teléfono: ${data.third.phone || 'N/A'}`, left + 10, currentY + 28);
    doc.text(`Dirección: ${data.third.address || 'N/A'} ${data.third.city ? `- ${data.third.city}` : ''}  |  Correo: ${data.third.email || 'N/A'}`, left + 10, currentY + 39);

    currentY += 55;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 33, 55);
    doc.text(`Saldo Anterior: ${fmtPdfSignedNum(data.initialBalance)} COP`, left, currentY);
    doc.text(`Total Débitos: $ ${fmtPdfNum(data.totalDebits)}`, left + 160, currentY);
    doc.text(`Total Créditos: $ ${fmtPdfNum(data.totalCredits)}`, left + 310, currentY);
    doc.text(`Saldo Final: ${fmtPdfSignedNum(data.finalBalance)} COP`, left + 440, currentY);

    currentY += 15;

    const body: any[] = [];
    body.push([
      data.dateFrom,
      '—',
      '—',
      '—',
      'SALDO ANTERIOR',
      '—',
      '—',
      fmtPdfSignedNum(data.initialBalance)
    ]);

    for (const l of data.processedLines) {
      body.push([
        l.fecha,
        l.comprobante,
        l.doc_cruce,
        l.cuenta,
        l.descripcion,
        l.debito > 0 ? fmtPdfNum(l.debito) : '0.00',
        l.credito > 0 ? fmtPdfNum(l.credito) : '0.00',
        fmtPdfSignedNum(l.saldo)
      ]);
    }

    body.push([
      { content: 'TOTALES PERÍODO', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: fmtPdfNum(data.totalDebits), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: fmtPdfNum(data.totalCredits), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
      { content: fmtPdfSignedNum(data.finalBalance), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } }
    ]);

    doc.autoTable({
      startY: currentY,
      head: [['Fecha', 'Comprobante', 'Doc. Cruce', 'Cuenta', 'Descripción', 'Débito', 'Crédito', 'Saldo Acum.']],
      body,
      theme: 'plain',
      margin: { top: currentY, left: header.marginLeft, right: 24, bottom: 35 },
      styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.5, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.0, lineWidth: { bottom: 0.25 } },
      columnStyles: {
        0: { cellWidth: 48 },
        1: { cellWidth: 65 },
        2: { cellWidth: 55 },
        3: { cellWidth: 100 },
        4: { cellWidth: 140 },
        5: { cellWidth: 52, halign: 'right' },
        6: { cellWidth: 52, halign: 'right' },
        7: { cellWidth: 52, halign: 'right' },
      },
      didDrawPage: (pageData: any) => drawPdfFooter(doc, pageData.pageNumber),
    });

    doc.save(`estado_cuenta_${data.third.doc_number || 'tercero'}_${data.dateFrom}_${data.dateTo}.pdf`);
  } catch (err: any) {
    showToast(`Error al generar PDF: ${err.message}`, 'error');
  }
}

function exportAccountStatementExcel() {
  const data = (window as any).lastAccountStatementData;
  if (!data) return showToast('Genera primero el estado de cuenta.', 'warning');

  try {
    const sheetRows = [
      ['REPORTE: ESTADO DE CUENTA POR TERCERO'],
      [`Tercero: ${data.third.name || ''} (NIT/Doc: ${data.third.doc_number || ''})`],
      [`Período: Del ${data.dateFrom} al ${data.dateTo}`],
      [`Fecha de Generación: ${todayStr()}`],
      [],
      ['FECHA', 'COMPROBANTE', 'DOC. CRUCE', 'CUENTA', 'DESCRIPCIÓN', 'DÉBITO ($)', 'CRÉDITO ($)', 'SALDO ACUMULADO ($)'],
      [data.dateFrom, '—', '—', '—', 'SALDO ANTERIOR', 0, 0, data.initialBalance]
    ];

    for (const l of data.processedLines) {
      sheetRows.push([
        l.fecha,
        l.comprobante,
        l.doc_cruce,
        l.cuenta,
        l.descripcion,
        l.debito,
        l.credito,
        l.saldo
      ]);
    }

    sheetRows.push([
      'TOTALES PERÍODO', '', '', '', '', data.totalDebits, data.totalCredits, data.finalBalance
    ]);

    const ws = (window as any).XLSX.utils.aoa_to_sheet(sheetRows);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, 'Estado de Cuenta');
    (window as any).XLSX.writeFile(wb, `Estado_Cuenta_${data.third.doc_number || 'tercero'}_${data.dateFrom}_${data.dateTo}.xlsx`);
  } catch (err: any) {
    showToast(`Error al exportar Excel: ${err.message}`, 'error');
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderCostCentersReport = renderCostCentersReport;
(window as any).renderAccountStatementReport = renderAccountStatementReport;

