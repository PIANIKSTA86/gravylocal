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
};

async function renderReportes(c) {
  REPORT_STATE.accounts = null;
  REPORT_STATE.saldos = null;
  REPORT_STATE.transactions = null;
  REPORT_STATE.txLines = null;
  REPORT_STATE.thirdParties = null;

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Reportes Financieros</h3>
        <p class="text-sm" style="color:#6B7280">Selecciona el reporte a generar. Se carga solo bajo demanda.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" id="report-cards">
      ${reportCard('trial', 'Balance de Prueba', 'Saldos débitos y créditos por cuenta.')}
      ${reportCard('income', 'Estado de Resultados', 'Ingresos, gastos y utilidad neta.')}
      ${reportCard('position', 'Estado de Situación Financiera', 'Activos, pasivos y patrimonio (Balance General).')}
      ${reportCard('journal', 'Libro Diario', 'Detalle cronológico de movimientos contables.')}
      ${reportCard('aux', 'Libro Auxiliar', 'Movimientos por Cuenta y Tercero o Tercero y Cuenta.')}
      ${reportCard('ar-bal', 'Saldos Cuentas por Cobrar', 'Pendientes por tercero y cuenta de cartera.')}
      ${reportCard('ap-bal', 'Saldos Cuentas por Pagar', 'Pendientes por tercero y cuenta por pagar.')}
      ${reportCard('aging', 'Cartera por Edades', 'Tramos 0-30-60-90+ para clientes o proveedores.')}
      ${reportCard('ret-cert', 'Certificados de Retención', 'Generar certificados de retención (ReteFuente, ReteIVA, ReteICA) para proveedores.')}
      ${reportCard('paz-salvo', 'Certificado de Paz y Salvo', 'Generar certificado de paz y salvo de cartera para clientes.')}
      ${reportCard('iva', 'Reporte de IVA', 'Consulta IVA generado vs descontable con cuentas configurables.')}
      ${reportCard('retenciones', 'Reporte de Retenciones', 'Consulta retenciones practicadas y a favor por cuenta.')}
      ${reportCard('cash-flow', 'Flujo de Caja', 'Detalle de ingresos y egresos de efectivo (Método Directo).')}
      ${reportCard('financial-analysis', 'Análisis Financiero', 'Análisis integrado de cartera, flujo de caja y ejecución presupuestal con gráficos SVG.')}
      ${reportCard('ventas-emision', 'Reporte de Ventas por Emisión', 'Consulta ventas detalladas agrupadas por POS, Factura Estándar o Pedidos.')}
      ${reportCard('budget-execution', 'Ejecución Presupuestal Detallada', 'Seguimiento mensual detallado y transacciones de la ejecución presupuestal.')}
    </div>`;

  $('#btn-report-trial')?.addEventListener('click', () => launchReportModal('Balance de Prueba', () => renderTrialBalance()));
  $('#btn-report-income')?.addEventListener('click', () => launchReportModal('Estado de Resultados', () => renderIncomeStatement()));
  $('#btn-report-position')?.addEventListener('click', () => launchReportModal('Estado de Situación Financiera', () => renderFinancialPosition()));
  $('#btn-report-journal')?.addEventListener('click', () => launchReportModal('Libro Diario', () => renderJournalBook()));
  $('#btn-report-aux')?.addEventListener('click', () => launchReportModal('Libro Auxiliar', () => renderAuxiliaryBook()));
  $('#btn-report-ar-bal')?.addEventListener('click', () => launchReportModal('Saldos Cuentas por Cobrar', () => renderPortfolioBalances('cxc')));
  $('#btn-report-ap-bal')?.addEventListener('click', () => launchReportModal('Saldos Cuentas por Pagar', () => renderPortfolioBalances('cxp')));
  $('#btn-report-aging')?.addEventListener('click', () => launchReportModal('Cartera por Edades', () => renderAgingPortfolio()));
  $('#btn-report-ret-cert')?.addEventListener('click', () => launchReportModal('Certificados de Retención', () => renderWithholdingCertificates()));
  $('#btn-report-paz-salvo')?.addEventListener('click', () => launchReportModal('Certificado de Paz y Salvo de Cartera', () => renderPazYSalvoCertificate()));
  $('#btn-report-iva')?.addEventListener('click', () => launchReportModal('Reporte de IVA', () => renderIvaReport()));
  $('#btn-report-retenciones')?.addEventListener('click', () => launchReportModal('Reporte de Retenciones', () => renderRetencionesReport()));
  $('#btn-report-cash-flow')?.addEventListener('click', () => launchReportModal('Reporte de Flujo de Caja', () => renderCashFlowReport()));
  $('#btn-report-financial-analysis')?.addEventListener('click', () => launchReportModal('Análisis Financiero Integrado', () => renderFinancialAnalysisReport()));
  $('#btn-report-ventas-emision')?.addEventListener('click', () => launchReportModal('Reporte de Ventas por Tipo de Emisión', () => renderSalesEmissionReport()));
  $('#btn-report-budget-execution')?.addEventListener('click', () => launchReportModal('Ejecución Presupuestal Detallada', () => renderDetailedBudgetExecutionReport()));
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

async function ensureLedgerData() {
  if (!REPORT_STATE.transactions || !REPORT_STATE.txLines || !REPORT_STATE.thirdParties) {
    const [transactions, txLines, thirdParties] = await Promise.all([
      pb.listAll('transactions', { sort: '-id', expand: 'tx_type_id,third_party_id', filter: 'status="active"' }),
      pb.listAll('tx_lines', { sort: 'id', expand: 'account_id,tx_id' }),
      pb.listAll('third_parties', { sort: 'name' }),
    ]);
    REPORT_STATE.transactions = transactions;
    REPORT_STATE.txLines = txLines;
    REPORT_STATE.thirdParties = thirdParties;
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
  return d.toISOString().slice(0, 10);
}

function agingBucket(expiredDays) {
  if (expiredDays < 0) return 'por_vencer';
  if (expiredDays <= 30) return 'b0_30';
  if (expiredDays <= 60) return 'b31_60';
  if (expiredDays <= 90) return 'b61_90';
  return 'b90p';
}

async function buildOpenPortfolioDocs({ mode = 'cxc', asOfDate = todayStr(), thirdType = '' } = {}) {
  const [{ accounts }, { transactions, txLines, thirdParties }] = await Promise.all([
    ensureAccountsSaldos(),
    ensureLedgerData(),
  ]);

  const txById = new Map(transactions.map(t => [t.id, t]));
  const thirdById = new Map(thirdParties.map(t => [t.id, t]));
  const accountById = new Map(accounts.map(a => [a.id, a]));
  const docs = new Map();
  const safeThirdType = String(thirdType || '').trim().toUpperCase();

  for (const line of txLines) {
    const tx = txById.get(line.tx_id);
    if (!tx || tx.status !== 'active' || !tx.date || String(tx.date) > asOfDate) continue;

    const acc = line.expand?.account_id || accountById.get(line.account_id);
    if (!acc || !acc.maneja_cruce) continue;

    const nature = String(acc.nature || '').toLowerCase();
    if (mode === 'cxc' && nature !== 'debit') continue;
    if (mode === 'cxp' && nature !== 'credit') continue;

    const thirdId = line.third_party_id || tx.third_party_id || 'NO_TERCERO';
    const third = thirdById.get(thirdId);
    const tpType = String(third?.type || '').toUpperCase();
    if (safeThirdType && tpType !== safeThirdType) continue;

    const ref = (line.cross_doc_ref || '').trim() || 'SIN_DOC';
    const key = `${acc.id}|${thirdId}|${ref}`;
    if (!docs.has(key)) {
      docs.set(key, {
        account_id: acc.id,
        account_code: acc.code || '',
        account_name: acc.name || '',
        nature,
        third_id: thirdId,
        third_name: third?.name || tx.expand?.third_party_id?.name || 'Sin tercero',
        third_doc: third?.doc_number || '',
        third_type: tpType || 'OTRO',
        doc_ref: ref,
        doc_date: tx.date,
        payment_days: Number(tx.payment_days || 0),
        debit: 0,
        credit: 0,
      });
    }

    const doc = docs.get(key);
    if (String(tx.date) < String(doc.doc_date)) {
      doc.doc_date = tx.date;
      doc.payment_days = Number(tx.payment_days || 0);
    }
    doc.debit += Number(line.debit || 0);
    doc.credit += Number(line.credit || 0);
  }

  const EPS = 0.0001;
  const items = [];
  docs.forEach((d) => {
    const open = d.nature === 'debit'
      ? Number(d.debit || 0) - Number(d.credit || 0)
      : Number(d.credit || 0) - Number(d.debit || 0);
    if (open <= EPS) return;
    const days = diffDays(d.doc_date, asOfDate);
    const due_date = addDays(d.doc_date, d.payment_days || 0);
    const expired_days = diffDaysSigned(due_date, asOfDate);
    items.push({ ...d, open, days, due_date, expired_days, bucket: agingBucket(expired_days) });
  });

  items.sort((a, b) => {
    const aKey = `${a.third_name}|${a.account_code}|${a.doc_date}|${a.doc_ref}`;
    const bKey = `${b.third_name}|${b.account_code}|${b.doc_date}|${b.doc_ref}`;
    return aKey.localeCompare(bKey);
  });

  return items;
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
            <option value="ACREEDOR">Acreedor</option>
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

  const { accounts } = await ensureAccountsSaldos();
  const cruceAccounts = accounts.filter(a => a.maneja_cruce).sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  const accountOptions = cruceAccounts.map(a =>
    `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`
  ).join('');

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Cartera por Edades (Por Vencer / 0-30-60-90+)</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Corte</label>
          <input id="age-cutoff" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="form-label">Cartera</label>
          <select id="age-mode" class="form-input">
            <option value="cxc">Clientes (CxC)</option>
            <option value="cxp">Proveedores (CxP)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tipo tercero</label>
          <select id="age-third-type" class="form-input">
            <option value="">Todos</option>
            <option value="CLIENTE" selected>Cliente</option>
            <option value="PROVEEDOR">Proveedor</option>
            <option value="ACREEDOR">Acreedor</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cuenta</label>
          <select id="age-account" class="form-input">
            <option value="">Todas las cuentas</option>
            ${accountOptions}
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-aging"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-aging" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          ${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-aging" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="aging-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-hourglass-half mr-2"></i>Selecciona filtros y pulsa Generar.
    </div>`;

  const syncThirdTypeByMode = () => {
    const mode = getSelectVal('age-mode');
    const typeEl = $('#age-third-type');
    if (!typeEl) return;
    if (!typeEl.value || typeEl.value === 'CLIENTE' || typeEl.value === 'PROVEEDOR') {
      typeEl.value = mode === 'cxc' ? 'CLIENTE' : 'PROVEEDOR';
    }
  };

  $('#age-mode')?.addEventListener('change', syncThirdTypeByMode);

  let lastExportRows = [];
  let lastPdfRows = [];
  let lastPdfMeta = {};

  const generate = async () => {
    const results = $('#aging-results');
    if (!results) return;

    const asOfDate = getInputVal('age-cutoff');
    const mode = getSelectVal('age-mode') || 'cxc';
    const thirdType = getSelectVal('age-third-type');
    const accountId = getSelectVal('age-account');
    if (!asOfDate) return showToast('Selecciona la fecha de corte.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando cartera por edades...</div>';

    try {
      const allDocs = await buildOpenPortfolioDocs({ mode, asOfDate, thirdType });
      const docs = accountId ? allDocs.filter(d => d.account_id === accountId) : allDocs;

      if (!docs.length) {
        results.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</div>';
        lastExportRows = []; lastPdfRows = [];
        if ($('#btn-exp-aging')) $('#btn-exp-aging').disabled = true;
        if ($('#btn-pdf-aging')) $('#btn-pdf-aging').disabled = true;
        return;
      }

      const selectedAccount = accountId ? cruceAccounts.find(a => a.id === accountId) : null;
      const accountLabel = selectedAccount
        ? `${selectedAccount.code} - ${selectedAccount.name}`
        : 'Todas las cuentas';

      const rows = docs.map(d => ({
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
        por_vencer:  d.bucket === 'por_vencer' ? Number(d.open || 0) : 0,
        de_0_a_30:   d.bucket === 'b0_30'      ? Number(d.open || 0) : 0,
        de_31_a_60:  d.bucket === 'b31_60'     ? Number(d.open || 0) : 0,
        de_61_a_90:  d.bucket === 'b61_90'     ? Number(d.open || 0) : 0,
        mayor_a_90:  d.bucket === 'b90p'       ? Number(d.open || 0) : 0,
        total: Number(d.open || 0),
      })).sort((a, b) => {
        const aKey = `${a.cuenta_code}|${a.tercero}|${a.fecha_documento}|${a.documento_cruce}`;
        const bKey = `${b.cuenta_code}|${b.tercero}|${b.fecha_documento}|${b.documento_cruce}`;
        return aKey.localeCompare(bKey);
      });

      const totals = rows.reduce((acc, r) => {
        acc.por_vencer  += r.por_vencer;
        acc.de_0_a_30   += r.de_0_a_30;
        acc.de_31_a_60  += r.de_31_a_60;
        acc.de_61_a_90  += r.de_61_a_90;
        acc.mayor_a_90  += r.mayor_a_90;
        acc.total       += r.total;
        return acc;
      }, { por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 });

      const carteraLabel = mode === 'cxc' ? 'Clientes (CxC)' : 'Proveedores (CxP)';

      // Group by account for section headers in table
      const byAccount = new Map();
      for (const r of rows) {
        if (!byAccount.has(r.cuenta)) byAccount.set(r.cuenta, []);
        byAccount.get(r.cuenta).push(r);
      }

      const bodyRowsHtml = [];
      for (const [cuenta, cuentaRows] of byAccount) {
        if (!accountId) {
          bodyRowsHtml.push(`<tr style="background:#F0F4F8">
            <td colspan="11" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
              <i class="fas fa-bookmark mr-1" style="color:#E87D1E"></i>${esc(cuenta)}
            </td>
          </tr>`);
        }
        for (const r of cuentaRows) {
          const expColor = r.expired_days < 0 ? '#059669' : r.expired_days <= 30 ? '#D97706' : '#EF4444';
          bodyRowsHtml.push(`<tr>
            <td>${esc(r.documento_tercero ? `${r.documento_tercero} - ${r.tercero}` : r.tercero)}</td>
            <td><span class="font-mono">${esc(r.documento_cruce)}</span></td>
            <td>${esc(r.fecha_documento)}</td>
            <td style="text-align:right">${fmtN(r.plazo_dias)}</td>
            <td>${esc(r.vencimiento)}</td>
            <td style="color:${expColor};font-weight:${r.por_vencer > 0 ? '600' : '400'}">${fmt(r.por_vencer)}</td>
            <td>${fmt(r.de_0_a_30)}</td>
            <td>${fmt(r.de_31_a_60)}</td>
            <td>${fmt(r.de_61_a_90)}</td>
            <td>${fmt(r.mayor_a_90)}</td>
            <td class="font-semibold" style="color:#0D2137">${fmt(r.total)}</td>
          </tr>`);
        }
      }

      results.innerHTML = `
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Cartera: <strong>${esc(carteraLabel)}</strong> · Cuenta: <strong>${esc(accountLabel)}</strong> · Documentos: <strong>${fmtN(rows.length)}</strong> · Total: <strong>${fmt(totals.total)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:480px">
          <table class="data-table">
            <thead><tr>
              <th>Tercero</th><th>Doc. Cruce</th><th>Fecha Doc.</th>
              <th style="text-align:right">Plazo</th><th>Vencimiento</th>
              <th>Por Vencer</th><th>0-30 días</th><th>31-60 días</th><th>61-90 días</th><th>Más de 90</th><th>Total</th>
            </tr></thead>
            <tbody>${bodyRowsHtml.join('')}</tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">Total general</td>
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
      lastPdfMeta = { asOfDate, mode, thirdType, accountLabel, carteraLabel };

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

      const { asOfDate, thirdType, accountLabel, carteraLabel } = lastPdfMeta;

      const totals = lastPdfRows.reduce((acc, r) => {
        acc.por_vencer  += Number(r.por_vencer  || 0);
        acc.de_0_a_30   += Number(r.de_0_a_30   || 0);
        acc.de_31_a_60  += Number(r.de_31_a_60  || 0);
        acc.de_61_a_90  += Number(r.de_61_a_90  || 0);
        acc.mayor_a_90  += Number(r.mayor_a_90  || 0);
        acc.total       += Number(r.total        || 0);
        return acc;
      }, { por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 });

      const headerCtx = await getPdfHeaderContext();
      const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const header = drawPdfHeader(doc, headerCtx, {
        title: 'Cartera por Edades',
        subtitles: [
          `Corte: ${asOfDate}`,
          `Cartera: ${carteraLabel}`,
          `Cuenta: ${accountLabel}`,
          `Tipo de tercero: ${thirdType || 'Todos'}`,
        ],
      });

      // Build body — group by account with section header rows
      const body = [];
      const accountGroups = new Map();
      for (const r of lastPdfRows) {
        if (!accountGroups.has(r.cuenta)) accountGroups.set(r.cuenta, []);
        accountGroups.get(r.cuenta).push(r);
      }

      const accountSectionIndices = new Set();
      let rowIdx = 0;
      const hasMultipleAccounts = accountGroups.size > 1;

      for (const [cuenta, cuentaRows] of accountGroups) {
        if (hasMultipleAccounts) {
          body.push([{ content: cuenta, colSpan: 11, styles: { fontStyle: 'bold', fillColor: [235, 240, 248], textColor: [13, 33, 55] } }]);
          accountSectionIndices.add(rowIdx++);
        }
        for (const r of cuentaRows) {
          body.push([
            r.documento_tercero ? `${r.documento_tercero} - ${r.tercero}` : r.tercero,
            r.documento_cruce,
            r.fecha_documento,
            String(r.plazo_dias || 0),
            r.vencimiento,
            fmtPdfNum(r.por_vencer),
            fmtPdfNum(r.de_0_a_30),
            fmtPdfNum(r.de_31_a_60),
            fmtPdfNum(r.de_61_a_90),
            fmtPdfNum(r.mayor_a_90),
            fmtPdfNum(r.total),
          ]);
          rowIdx++;
        }
      }
      body.push(['TOTAL', '', '', '', '', fmtPdfNum(totals.por_vencer), fmtPdfNum(totals.de_0_a_30), fmtPdfNum(totals.de_31_a_60), fmtPdfNum(totals.de_61_a_90), fmtPdfNum(totals.mayor_a_90), fmtPdfNum(totals.total)]);
      const totalRowIdx = rowIdx;

      doc.autoTable({
        startY: header.startY,
        head: [['Tercero', 'Cruce', 'Fecha', 'Plazo', 'Vencimiento', 'Por Vencer', '0-30', '31-60', '61-90', '>90', 'Total']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0:  { cellWidth: 116 },
          1:  { cellWidth: 48 },
          2:  { cellWidth: 46 },
          3:  { cellWidth: 28, halign: 'right' },
          4:  { cellWidth: 50 },
          5:  { cellWidth: 48, halign: 'right' },
          6:  { cellWidth: 42, halign: 'right' },
          7:  { cellWidth: 42, halign: 'right' },
          8:  { cellWidth: 42, halign: 'right' },
          9:  { cellWidth: 42, halign: 'right' },
          10: { cellWidth: 50, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          if (data.row.index === totalRowIdx) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [236, 236, 236];
            data.cell.styles.textColor = [13, 33, 55];
            data.cell.styles.lineWidth = { top: 0.2 };
            data.cell.styles.lineColor = [13, 33, 55];
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
      <div class="grid grid-cols-1 md:grid-cols-8 gap-3">
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input id="trial-from" type="date" class="form-input" value="${fromDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input id="trial-to" type="date" class="form-input" value="${today}">
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

  let lastExportRows = [];
  let lastTrialPdf = null;

  const generate = async () => {
    const results = $('#trial-results');
    if (!results) return;
    const fromDate = getInputVal('trial-from');
    const toDate = getInputVal('trial-to');
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
      const { transactions, txLines } = await ensureLedgerData();
      const txById = Object.fromEntries(transactions.map(t => [t.id, t]));

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

      // Acumula movimientos propios por cuenta según el lapso seleccionado.
      for (const line of txLines) {
        const tx = txById[line.tx_id];
        if (!tx || tx.status !== 'active' || !tx.date) continue;
        const acc = accountById.get(line.account_id);
        if (!acc) continue;

        const date = String(tx.date);
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        if (date < fromDate) {
          acc.ownPrev += (debit - credit);
        } else if (date >= fromDate && date <= toDate) {
          acc.ownDebit += debit;
          acc.ownCredit += credit;
        }

        if (includeThird) {
          const thirdId = String(tx.third_party_id || 'NO_TERCERO');
          const tp = tx.expand?.third_party_id;
          const thirdName = tp 
            ? (tp.doc_number ? `${tp.name} (NIT: ${tp.doc_number})` : tp.name)
            : 'Sin tercero';
          if (!acc.third.has(thirdId)) {
            acc.third.set(thirdId, { id: thirdId, name: thirdName, prev: 0, debit: 0, credit: 0, current: 0 });
          }
          const t = acc.third.get(thirdId);
          if (date < fromDate) {
            t.prev += (debit - credit);
          } else if (date >= fromDate && date <= toDate) {
            t.debit += debit;
            t.credit += credit;
          }
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
          <p class="text-sm mt-1" style="color:#6B7280">DEL ${esc(fromDate)} AL ${esc(toDate)}</p>
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
                : `<tr><td colspan="${includeThird ? '7' : '6'}" class="text-center py-10" style="color:#9CA3AF">No hay datos para el lapso seleccionado.</td></tr>`}
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
    exportToExcel(lastExportRows, [
      { key: 'codigo', label: 'CUENTA' },
      { key: 'descripcion', label: 'DESCRIPCIÓN' },
      { key: 'nivel', label: 'NIVEL' },
      { key: 'tercero', label: 'TERCERO' },
      { key: 'saldo_anterior', label: 'BALANCE ANTERIOR' },
      { key: 'mov_debito', label: 'DÉBITOS' },
      { key: 'mov_credito', label: 'CRÉDITOS' },
      { key: 'saldo_actual', label: 'BALANCE ACTUAL' },
    ], `balance_prueba_n${getSelectVal('trial-level')}_${getInputVal('trial-from')}_${getInputVal('trial-to')}`);
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
        subtitles: [`Desde: ${lastTrialPdf.fromDate}`, `Hasta: ${lastTrialPdf.toDate}`, `Detalle por tercero: ${lastTrialPdf.includeThird ? 'Si' : 'No'}`],
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

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Resultados</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="inc-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="inc-compare-month" type="month" class="form-input" value="${compareMonthDefault}">
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
    const showNotes = getCheckVal('inc-show-notes');
    const selectedLevel = getSelectVal('inc-level');
    const maxLevel = selectedLevel === 'all' ? Number.POSITIVE_INFINITY : Number(selectedLevel || 3);

    if (!reportMonth || !compareMonth) {
      return showToast('Selecciona ambos meses para el reporte comparativo.', 'warning');
    }

    const reportDate = endOfMonth(reportMonth);
    const compareDate = endOfMonth(compareMonth);
    if (!reportDate || !compareDate) {
      return showToast('Mes inválido. Revisa los filtros.', 'warning');
    }

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Estado de Resultados...</div>';

    try {
      const { accounts } = await ensureAccountsSaldos();
      const { transactions, txLines } = await ensureLedgerData();

      const balNow = buildBalancesAt(accounts, transactions, txLines, reportDate);
      const balCmp = buildBalancesAt(accounts, transactions, txLines, compareDate);

      const roots4 = getPeriodBalances(accounts, balNow, balCmp, '4');
      const roots5 = getPeriodBalances(accounts, balNow, balCmp, '5');
      const roots6 = getPeriodBalances(accounts, balNow, balCmp, '6');
      const roots7 = getPeriodBalances(accounts, balNow, balCmp, '7');

      let noteCounter = 1;
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
              note: showNotes ? String(noteCounter++) : '',
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
      const costos = buildRows(roots5);
      const gastos = buildRows(roots6);
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
      const detailRowsHtml = (section) => section.detail.map(r => `
        <tr>
          <td style="padding-left:24px">${esc(r.label)}</td>
          ${showNotes ? `<td class="text-center">${esc(r.note)}</td>` : ''}
          ${amountCell(r.now)}
          ${amountCell(r.cmp)}
        </tr>`).join('');

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

              <tr><td class="font-bold" colspan="${colCount}">Costos de venta (Clase 5)</td></tr>
              ${detailRowsHtml(costos)}
              <tr>
                <td class="font-bold">Total costos</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(costos.totalNow, 'font-bold')}
                ${amountCell(costos.totalCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Gastos operacionales (Clase 6)</td></tr>
              ${detailRowsHtml(gastos)}
              <tr>
                <td class="font-bold">Total gastos operacionales</td>
                ${showNotes ? '<td></td>' : ''}
                ${amountCell(gastos.totalNow, 'font-bold')}
                ${amountCell(gastos.totalCmp, 'font-bold')}
              </tr>

              <tr><td class="font-bold" colspan="${colCount}">Otros gastos (Clase 7)</td></tr>
              ${detailRowsHtml(otrosGastos)}
              <tr>
                <td class="font-bold">Total otros gastos</td>
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
        </div>`;

      lastExportRows = [];
      const pushSection = (title, section, totalLabel) => {
        lastExportRows.push({ rubro: title, nota: '', actual: '', comparativo: '' });
        section.detail.forEach((r) => {
          lastExportRows.push({ rubro: `  ${r.label}`, nota: r.note || '', actual: r.now, comparativo: r.cmp });
        });
        lastExportRows.push({ rubro: totalLabel, nota: '', actual: section.totalNow, comparativo: section.totalCmp });
      };

      pushSection('Ingresos (Clase 4)', ingresos, 'Total ingresos');
      pushSection('Costos de venta (Clase 5)', costos, 'Total costos');
      pushSection('Gastos operacionales (Clase 6)', gastos, 'Total gastos operacionales');
      pushSection('Otros gastos (Clase 7)', otrosGastos, 'Total otros gastos');
      lastExportRows.push({ rubro: 'Total gastos y costos', nota: '', actual: totalGastosNow, comparativo: totalGastosCmp });
      lastExportRows.push({ rubro: 'Resultado neto del periodo', nota: '', actual: utilidadNow, comparativo: utilidadCmp });

      lastIncomePdf = {
        reportMonth,
        compareMonth,
        reportDate,
        compareDate,
        showNotes,
        sections: { ingresos, costos, gastos, otrosGastos },
        totals: { totalGastosNow, totalGastosCmp, utilidadNow, utilidadCmp },
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
      pushSection('Costos de venta (Clase 5)', sections.costos, 'Total costos');
      pushSection('Gastos operacionales (Clase 6)', sections.gastos, 'Total gastos operacionales');
      pushSection('Otros gastos (Clase 7)', sections.otrosGastos, 'Total otros gastos');
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
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

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

  view.innerHTML = `
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Estado de Situación Financiera (Balance General)</h4>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div class="form-group">
          <label class="form-label">Mes del reporte</label>
          <input id="pos-month" type="month" class="form-input" value="${currentMonthDefault}">
        </div>
        <div class="form-group">
          <label class="form-label">Comparar con</label>
          <input id="pos-compare-month" type="month" class="form-input" value="${compareMonthDefault}">
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

  const groupSection = (accounts, balancesNow, balancesCmp, filterFn, kind, showNotes, startNote, maxLevel) => {
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

    let noteCounter = startNote;
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
          note: showNotes ? String(noteCounter++) : '',
          label: node.name,
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

    return { detail, totalNow, totalCmp, nextNote: noteCounter };
  };

  const generate = async () => {
    const results = $('#position-results');
    if (!results) return;

    const reportMonth = getInputVal('pos-month');
    const compareMonth = getInputVal('pos-compare-month');
    const showNotes = getCheckVal('pos-show-notes');
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
      const { transactions, txLines } = await ensureLedgerData();

      const balNow = buildBalancesAt(accounts, transactions, txLines, reportDate);
      const balCmp = buildBalancesAt(accounts, transactions, txLines, compareDate);

      let noteCounter = 1;
      const actCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('11'), 'asset', showNotes, noteCounter, maxLevel); noteCounter = actCorr.nextNote;
      const actNoCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('1') && !String(a.code || '').startsWith('11'), 'asset', showNotes, noteCounter, maxLevel); noteCounter = actNoCorr.nextNote;
      const pasCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('21'), 'liability', showNotes, noteCounter, maxLevel); noteCounter = pasCorr.nextNote;
      const pasNoCorr = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('2') && !String(a.code || '').startsWith('21'), 'liability', showNotes, noteCounter, maxLevel); noteCounter = pasNoCorr.nextNote;
      const patrimonio = groupSection(accounts, balNow, balCmp, a => String(a.code || '').startsWith('3'), 'equity', showNotes, noteCounter, maxLevel);

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

      const detailRowsHtml = (section) => section.detail.map(r => `
        <tr>
          <td style="padding-left:24px">${esc(r.label)}</td>
          ${showNotes ? `<td class="text-center">${esc(r.note)}</td>` : ''}
          ${amountCell(r.now)}
          ${amountCell(r.cmp)}
        </tr>`).join('');

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
        </div>`;

      lastExportRows = [];
      const pushSection = (title, section, sectionTotalLabel) => {
        lastExportRows.push({ rubro: title, nota: '', actual: '', comparativo: '' });
        section.detail.forEach((r) => {
          lastExportRows.push({ rubro: `  ${r.label}`, nota: r.note || '', actual: r.now, comparativo: r.cmp });
        });
        lastExportRows.push({ rubro: sectionTotalLabel, nota: '', actual: section.totalNow, comparativo: section.totalCmp });
      };

      pushSection('Activos corrientes', actCorr, 'Total activos corrientes');
      pushSection('Activos no corrientes', actNoCorr, 'Total activos no corrientes');
      lastExportRows.push({ rubro: 'Total activos', nota: '', actual: totalActivosNow, comparativo: totalActivosCmp });
      pushSection('Pasivos corrientes', pasCorr, 'Total pasivos corrientes');
      pushSection('Pasivos no corrientes', pasNoCorr, 'Total pasivos no corrientes');
      lastExportRows.push({ rubro: 'Total pasivos', nota: '', actual: totalPasivosNow, comparativo: totalPasivosCmp });
      pushSection('Patrimonio', patrimonio, 'Total patrimonio');
      lastExportRows.push({ rubro: 'Total pasivos más patrimonio', nota: '', actual: totalPyPNow, comparativo: totalPyPCmp });

      lastPositionPdf = {
        reportMonth,
        compareMonth,
        reportDate,
        compareDate,
        showNotes,
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
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`estado_situacion_financiera_${reportMonth}_vs_${compareMonth}.pdf`);
    } catch (err) {
      showToast(`Error al generar PDF: ${err.message}`, 'error');
    }
  });
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
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
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
    const range = monthRangeToDates(fromMonth, toMonth);
    if (!range) return showToast('Rango mensual inválido. Verifica Desde/Hasta.', 'warning');

    results.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Libro Diario...</div>';

    try {
      const { transactions, txLines } = await ensureLedgerData();
      const txById = Object.fromEntries(transactions.map(t => [t.id, t]));

      const rows = txLines
        .map(l => {
          const tx = txById[l.tx_id];
          if (!tx || tx.status !== 'active' || !tx.date) return null;
          if (String(tx.date) < range.fromDate || String(tx.date) > range.toDate) return null;
          if (txTypeId && String(tx.tx_type_id || '') !== String(txTypeId)) return null;
          return {
            fecha: tx.date || '',
            comprobante: tx.number || '',
            descripcion: tx.description || '',
            tercero: tx.expand?.third_party_id?.name || '—',
            cuenta: `${l.expand?.account_id?.code || ''} - ${l.expand?.account_id?.name || ''}`.trim(),
            debito: Number(l.debit || 0),
            credito: Number(l.credit || 0),
          };
        })
        .filter(Boolean)
        .sort((a, b) => `${a.fecha}|${a.comprobante}|${a.cuenta}`.localeCompare(`${b.fecha}|${b.comprobante}|${b.cuenta}`));

      const totalDeb = rows.reduce((s, r) => s + Number(r.debito || 0), 0);
      const totalCre = rows.reduce((s, r) => s + Number(r.credito || 0), 0);

      results.innerHTML = `
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Período: <strong>${esc(fromMonth)}</strong> a <strong>${esc(toMonth)}</strong> · Registros: <strong>${fmtN(rows.length)}</strong> · Débito: <strong>${fmt(totalDeb)}</strong> · Crédito: <strong>${fmt(totalCre)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:420px">
          <table class="data-table">
            <thead><tr><th>Fecha</th><th>Comp.</th><th>Descripción</th><th>Tercero</th><th>Cuenta</th><th>Débito</th><th>Crédito</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(r => `<tr><td>${esc(r.fecha)}</td><td>${esc(r.comprobante)}</td><td>${esc(r.descripcion)}</td><td>${esc(r.tercero)}</td><td>${esc(r.cuenta)}</td><td>${fmt(r.debito)}</td><td>${fmt(r.credito)}</td></tr>`).join('') : '<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">Totales</td>
                <td class="font-bold">${fmt(totalDeb)}</td>
                <td class="font-bold">${fmt(totalCre)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`;

      lastRows = rows;
      lastMeta = { fromMonth, toMonth, txTypeId, totalDeb, totalCre };

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
    if (!lastRows.length) return;
    exportToExcel(lastRows, [
      { key: 'fecha', label: 'Fecha' },
      { key: 'comprobante', label: 'Comprobante' },
      { key: 'descripcion', label: 'Descripcion' },
      { key: 'tercero', label: 'Tercero' },
      { key: 'cuenta', label: 'Cuenta' },
      { key: 'debito', label: 'Debito' },
      { key: 'credito', label: 'Credito' },
    ], `libro_diario_${lastMeta?.fromMonth || currentMonth}_a_${lastMeta?.toMonth || currentMonth}`);
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
        ],
      });

      const body = lastRows.map(r => [
        r.fecha,
        r.comprobante,
        r.descripcion,
        r.tercero,
        r.cuenta,
        fmtPdfNum(r.debito),
        fmtPdfNum(r.credito),
      ]);
      body.push(['TOTAL', '', '', '', '', fmtPdfNum(lastMeta.totalDeb), fmtPdfNum(lastMeta.totalCre)]);

      doc.autoTable({
        startY: header.startY,
        head: [['Fecha', 'Comp.', 'Descripcion', 'Tercero', 'Cuenta', 'Debito', 'Credito']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0: { cellWidth: 48 },
          1: { cellWidth: 58 },
          2: { cellWidth: 126 },
          3: { cellWidth: 90 },
          4: { cellWidth: 124 },
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

      doc.save(`libro_diario_${lastMeta.fromMonth}_a_${lastMeta.toMonth}.pdf`);
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
    const [{ accounts }, { thirdParties }] = await Promise.all([
      ensureAccountsSaldos(),
      ensureLedgerData(),
    ]);

    view.innerHTML = `
      <div class="p-4 border-b" style="border-color:#F3F4F6">
        <h4 class="font-bold mb-3" style="color:#0D2137">Libro Auxiliar</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <select id="aux-mode" class="form-input">
            <option value="cuenta-tercero">Cuenta y luego Tercero</option>
            <option value="tercero-cuenta">Tercero y luego Cuenta</option>
          </select>
          <select id="aux-account" class="form-input">
            <option value="">Todas las cuentas</option>
            ${accounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
          </select>
          <select id="aux-third" class="form-input">
            <option value="">Todos los terceros</option>
            ${thirdParties.map(t => `<option value="${esc(t.id)}">${esc(t.doc_number || '')} - ${esc(t.name)}</option>`).join('')}
          </select>
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
  results.innerHTML = '<div class="p-4 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Generando...</div>';

  try {
    const [{ transactions, txLines, thirdParties }, { accounts }] = await Promise.all([
      ensureLedgerData(),
      ensureAccountsSaldos(),
    ]);
    const mode      = getSelectVal('aux-mode');
    const accountId = getSelectVal('aux-account');
    const thirdId   = getSelectVal('aux-third');
    const dateFrom  = ($('#aux-date-from')?.value || '').trim();
    const dateTo    = ($('#aux-date-to')?.value   || '').trim();

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

    const accountById = Object.fromEntries(accounts.map(a => [a.id, a]));
    const txById      = Object.fromEntries(transactions.map(t => [t.id, t]));
    const thirdById   = Object.fromEntries((thirdParties || []).map(t => [t.id, t]));

    // ── Saldos anteriores (movimientos ANTES de dateFrom) ──
    // Para cuentas con cruce, el saldo se controla por documento (cuenta+tercero+doc).
    // Para el resto, se mantiene por cuenta.
    const openingByKey = new Map();
    if (dateFrom) {
      for (const l of txLines) {
        const tx = txById[l.tx_id];
        if (!tx || tx.status !== 'active') continue;
        if (tx.date >= dateFrom) continue;
        if (allowedAccountIds && !allowedAccountIds.has(l.account_id)) continue;
        const acc = accountById[l.account_id];
        if (!acc) continue;
        const lineThirdId = l.third_party_id || tx.third_party_id || '';
        const lineDocCruce = (l.cross_doc_ref || '').trim() || 'SIN_DOC';
        const openingKey = acc.maneja_cruce
          ? `doc|${l.account_id}|${lineThirdId || 'NO_TERCERO'}|${lineDocCruce}`
          : `acc|${l.account_id}|${lineThirdId || 'NO_TERCERO'}`;
        const prev  = openingByKey.get(openingKey) || 0;
        const debit  = Number(l.debit  || 0);
        const credit = Number(l.credit || 0);
        const delta  = debit - credit;
        openingByKey.set(openingKey, prev + delta);
      }
    }

    // ── Filas del período ──
    const rows = txLines
      .map(l => {
        const tx = txById[l.tx_id];
        if (!tx || tx.status !== 'active') return null;
        const thirdPartyId = l.third_party_id || tx.third_party_id || '';
        if (allowedAccountIds && !allowedAccountIds.has(l.account_id)) return null;
        if (thirdId   && thirdPartyId !== thirdId) return null;
        if (dateFrom  && tx.date < dateFrom) return null;
        if (dateTo    && tx.date > dateTo)   return null;

        const acc         = accountById[l.account_id];
        const accountCode = acc?.code || l.expand?.account_id?.code || '';
        const accountName = acc?.name || l.expand?.account_id?.name || '';
        const thirdRec = thirdById[thirdPartyId] || tx.expand?.third_party_id || null;
        const thirdName = thirdRec?.name || 'Sin tercero';
        const thirdDoc = thirdRec?.doc_number || '';
        const thirdDisplay = thirdDoc ? `${thirdDoc} - ${thirdName}` : thirdName;

        return {
          fecha:         tx.date || '',
          comprobante:   tx.number || '',
          txId:          tx.id || '',
          cuenta:        `${accountCode} - ${accountName}`.trim(),
          accountCode:   accountCode,
          accountName:   accountName,
          tercero:       thirdDisplay,
          thirdName:     thirdName,
          thirdDoc:      thirdDoc,
          doc_cruce:     (l.cross_doc_ref || '').trim(),
          descripcion:   l.description || tx.description || '',
          debito:        Number(l.debit  || 0),
          credito:       Number(l.credit || 0),
          keyCuenta:     `${accountCode} - ${accountName}`.trim(),
          keyTercero:    thirdDisplay,
          accountId:     l.account_id,
          accountNature: acc?.nature || 'debit',
          accountManejaCruce: !!acc?.maneja_cruce,
          thirdId:        thirdPartyId || 'NO_TERCERO',
        };
      })
      .filter(Boolean);

    // ── Pre-calcular saldos por fila ─────────────────────────────────────────
    // saldo_anterior: saldo inicial del rango (constante por clave de saldo)
    // saldo_actual: saldo inicial + movimientos acumulados de la clave en el rango
    const sortedForBalance = [...rows].sort((a, b) =>
      `${a.accountId}|${a.thirdId}|${a.fecha}|${a.doc_cruce || 'SIN_DOC'}|${a.comprobante}`.localeCompare(
       `${b.accountId}|${b.thirdId}|${b.fecha}|${b.doc_cruce || 'SIN_DOC'}|${b.comprobante}`)
    );
    const periodDeltaByKey = new Map();
    for (const row of sortedForBalance) {
      const balanceKey = row.accountManejaCruce
        ? `doc|${row.accountId}|${row.thirdId}|${row.doc_cruce || 'SIN_DOC'}`
        : `acc|${row.accountId}|${row.thirdId}`;
      row.balanceKey = balanceKey;
      const opening = openingByKey.get(balanceKey) || 0;
      const moved = periodDeltaByKey.get(balanceKey) || 0;
      const delta = row.debito - row.credito;
      row.saldo_anterior = opening;
      row.saldo_actual = opening + moved + delta;
      periodDeltaByKey.set(balanceKey, moved + delta);
    }

    const primaryField   = mode === 'tercero-cuenta' ? 'keyTercero' : 'keyCuenta';
    const secondaryField = mode === 'tercero-cuenta' ? 'keyCuenta'  : 'keyTercero';
    const primaryLabel   = mode === 'tercero-cuenta' ? 'Tercero'    : 'Cuenta';
    const secondaryLabel = mode === 'tercero-cuenta' ? 'Cuenta'     : 'Tercero';

    rows.sort((a, b) => {
      const aKey = `${a[primaryField]}|${a[secondaryField]}|${a.fecha}|${a.doc_cruce || 'SIN_DOC'}|${a.comprobante}`;
      const bKey = `${b[primaryField]}|${b[secondaryField]}|${b.fecha}|${b.doc_cruce || 'SIN_DOC'}|${b.comprobante}`;
      return aKey.localeCompare(bKey);
    });

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

    // Agrupa jerárquicamente
    const grouped = new Map();
    for (const row of rows) {
      const pk = row[primaryField] || '—';
      const sk = row[secondaryField] || '—';
      if (!grouped.has(pk)) grouped.set(pk, new Map());
      const secondaryMap = grouped.get(pk);
      if (!secondaryMap.has(sk)) secondaryMap.set(sk, []);
      secondaryMap.get(sk).push(row);
    }

    const layoutRows = [];
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

    layoutRows.push({
      kind: 'grand-total',
      detalle: 'GRAN TOTAL LIBRO AUXILIAR',
      saldo_anterior: totalPrev,
      debito: totalDebit,
      credito: totalCredit,
      saldo_actual: totalCurr,
    });

    const firstKey = mode === 'tercero-cuenta' ? 'nit' : 'cuenta';
    const secondKey = mode === 'tercero-cuenta' ? 'cuenta' : 'nit';
    const firstLabel = mode === 'tercero-cuenta' ? 'NIT' : 'CUENTA';
    const secondLabel = mode === 'tercero-cuenta' ? 'CUENTA' : 'NIT';

    const groupedHtml = layoutRows.map((r) => {
      if (r.kind === 'primary') {
        return `<tr style="border-top:1px solid #E5E7EB"><td style="font-weight:700;color:#0D2137">${esc(r[firstKey] || '')}</td><td style="font-weight:700;color:#0D2137">${esc(r[secondKey] || '')}</td><td></td><td></td><td style="font-weight:700;color:#0D2137">${esc(r.detalle || '')}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
      }
      if (r.kind === 'secondary') {
        return `<tr><td style="font-weight:700">${esc(r[firstKey] || '')}</td><td style="font-weight:700">${esc(r[secondKey] || '')}</td><td></td><td></td><td style="font-weight:700;padding-left:10px">${esc(r.detalle || '')}</td><td></td><td></td><td></td><td></td><td></td></tr>`;
      }
      if (r.kind === 'subtotal-secondary') {
        return `<tr style="background:#F5F5F5;border-top:1px solid #D0D0D0"><td colspan="5" style="font-weight:700;color:#0D2137">${esc(r.detalle || '')}</td><td></td><td style="text-align:right;font-weight:700">${fmtSignedPlain(r.saldo_anterior || 0)}</td><td style="text-align:right;font-weight:700">${fmt(r.debito || 0)}</td><td style="text-align:right;font-weight:700">${fmt(r.credito || 0)}</td><td style="text-align:right;font-weight:700">${fmtSignedPlain(r.saldo_actual || 0)}</td></tr>`;
      }
      if (r.kind === 'subtotal-primary') {
        return `<tr style="background:#ECECEC;border-top:1px solid #B0B0B0;border-bottom:1px solid #B0B0B0"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(r.detalle || '')}</td><td></td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_anterior || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.debito || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.credito || 0)}</td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_actual || 0)}</td></tr>`;
      }
      if (r.kind === 'grand-total') {
        return `<tr style="background:#E2E2E2;border-top:2px solid #0D2137;border-bottom:2px solid #0D2137"><td colspan="5" style="font-weight:800;color:#0D2137">${esc(r.detalle || '')}</td><td></td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_anterior || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.debito || 0)}</td><td style="text-align:right;font-weight:800">${fmt(r.credito || 0)}</td><td style="text-align:right;font-weight:800">${fmtSignedPlain(r.saldo_actual || 0)}</td></tr>`;
      }
      return `<tr>
        <td></td>
        <td></td>
        <td>${esc(r.fecha || '')}</td>
        <td style="font-family:monospace">${esc(r.cruce || '')}</td>
        <td>${esc(r.detalle || '')}</td>
        <td>${r.txId ? `<a href="#" onclick="event.preventDefault(); openAuxTxDetailInReport('${esc(r.txId)}');" style="color:#333;font-weight:700;text-decoration:underline">${esc(r.comprobante || '')}</a>` : esc(r.comprobante || '')}</td>
        <td style="text-align:right">${fmtSignedPlain(r.saldo_anterior || 0)}</td>
        <td style="text-align:right">${fmt(r.debito || 0)}</td>
        <td style="text-align:right">${fmt(r.credito || 0)}</td>
        <td style="text-align:right">${fmtSignedPlain(r.saldo_actual || 0)}</td>
      </tr>`;
    }).join('');

    results.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm" style="color:#6B7280">Orden actual: <strong>${esc(primaryLabel)} → ${esc(secondaryLabel)} → Fecha → Doc. Cruce</strong> · Registros: <strong>${fmtN(rows.length)}</strong></p>
        <div class="flex items-center gap-2">
          <button class="btn btn-outline btn-sm" id="btn-pdf-aux" style="border-color:#6B7280;color:#374151"><i class="fas fa-file-pdf"></i> PDF</button>
          ${can('canExport') ? '<button class="btn btn-outline btn-sm" id="btn-exp-aux"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
      <div class="overflow-x-auto" style="max-height:420px">
        <table class="data-table">
          <thead><tr><th>${firstLabel}</th><th>${secondLabel}</th><th>FECHA</th><th>CRUCE</th><th>DETALLE DOCTO.</th><th>COMPROBANTE</th><th>SALDO ANTERIOR</th><th>DEBITO</th><th>CREDITO</th><th>NUEVO SALDO</th></tr></thead>
          <tbody>${groupedHtml}</tbody>
        </table>
      </div>`;

    $('#btn-exp-aux')?.addEventListener('click', () => {
      const exportRows = layoutRows.map((r) => ({
        nit: r.nit || '',
        cuenta: r.cuenta || '',
        fecha: r.fecha || '',
        cruce: r.cruce || '',
        detalle_docto: r.detalle || '',
        comprobante: r.comprobante || '',
        saldo_anterior: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.saldo_anterior || 0) : '',
        debito: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.debito || 0) : '',
        credito: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.credito || 0) : '',
        nuevo_saldo: (r.kind === 'detail' || r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') ? Number(r.saldo_actual || 0) : '',
      }));

      exportToExcel(exportRows, [
        { key: firstKey,          label: firstLabel },
        { key: secondKey,         label: secondLabel },
        { key: 'fecha',           label: 'FECHA' },
        { key: 'cruce',           label: 'CRUCE' },
        { key: 'detalle_docto',   label: 'DETALLE DOCTO.' },
        { key: 'comprobante',     label: 'COMPROBANTE' },
        { key: 'saldo_anterior',  label: 'SALDO ANTERIOR' },
        { key: 'debito',          label: 'DEBITO' },
        { key: 'credito',         label: 'CREDITO' },
        { key: 'nuevo_saldo',     label: 'NUEVO SALDO' },
      ], 'libro_auxiliar');
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
        const reportTypeLine = `${primaryLabel} -> ${secondaryLabel}`;
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
            row.push(r[firstKey] || '', r[secondKey] || '', '', '', r.detalle || '', '', '', '', '', '');
          } else if (r.kind === 'secondary') {
            row.push(r[firstKey] || '', r[secondKey] || '', '', '', r.detalle || '', '', '', '', '', '');
          } else if (r.kind === 'subtotal-secondary' || r.kind === 'subtotal-primary' || r.kind === 'grand-total') {
            row.push('', '', '', '', r.detalle || '', '', fmtPdfSignedNum(r.saldo_anterior || 0), fmtPdfNum(r.debito || 0), fmtPdfNum(r.credito || 0), fmtPdfSignedNum(r.saldo_actual || 0));
          } else {
            row.push('', '', r.fecha || '', r.cruce || '', r.detalle || '', r.comprobante || '', fmtPdfSignedNum(r.saldo_anterior || 0), fmtPdfNum(r.debito || 0), fmtPdfNum(r.credito || 0), fmtPdfSignedNum(r.saldo_actual || 0));
          }
          row._rowKind = r.kind; // Marcar tipo de fila para styling
          return row;
        });

        doc.autoTable({
          startY: 66,
          head: [[
            firstLabel, secondLabel, 'FECHA', 'CRUCE', 'DETALLE DOCTO.', 'COMPROBANTE',
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
            0: { cellWidth: 44 },
            1: { cellWidth: 52 },
            2: { cellWidth: 44 },
            3: { cellWidth: 34 },
            4: { cellWidth: 100 },
            5: { cellWidth: 58 },
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
          <select id="ret-third" class="form-input text-xs">
            <option value="">— Seleccione Tercero —</option>
            ${thirds.map(t => `<option value="${esc(t.id)}">${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}
          </select>
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
          <select id="paz-third" class="form-input text-xs">
            <option value="">— Seleccione Tercero —</option>
            ${thirds.map(t => `<option value="${esc(t.id)}">${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}
          </select>
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

function matchesPrefix(code: string, prefixes: string[]) {
  if (!code) return false;
  return prefixes.some(p => code.startsWith(p));
}

async function renderIvaReport() {
  const view = getReportViewHost();
  if (!view) return;
  view.innerHTML = '<div class="p-6 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando Reporte de IVA...</div>';

  try {
    const [genAccountsStr, descAccountsStr] = await Promise.all([
      API.getSetting('report_iva_generado').catch(() => '233501'),
      API.getSetting('report_iva_descontable').catch(() => '233502'),
    ]);

    const defaultGenStr = genAccountsStr || '233501';
    const defaultDescStr = descAccountsStr || '233502';
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = today.substring(0, 8) + '01';

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-file-invoice-dollar mr-2 text-green-600"></i>Reporte de IVA (Impuesto a las Ventas)</h4>
        
        <!-- Configuración de cuentas -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-700"><i class="fas fa-gears mr-1"></i>Configuración de Cuentas Contables</span>
            <span class="text-[10px] text-gray-400">Separa los códigos por comas (ej. 2408, 233501)</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="block font-bold text-gray-500 mb-1">Cuentas IVA Generado (Ventas/Pasivo)</label>
              <input id="iva-acc-gen" class="form-input text-xs w-full" value="${esc(defaultGenStr)}" placeholder="Ej: 240801, 233501">
            </div>
            <div class="form-group">
              <label class="block font-bold text-gray-500 mb-1">Cuentas IVA Descontable (Compras/Activo)</label>
              <input id="iva-acc-desc" class="form-input text-xs w-full" value="${esc(defaultDescStr)}" placeholder="Ej: 240802, 233502">
            </div>
          </div>
          <div class="flex justify-end">
            <button class="btn btn-secondary btn-xs py-1" id="btn-save-iva-config"><i class="fas fa-floppy-disk mr-1"></i>Guardar Cuentas</button>
          </div>
        </div>

        <!-- Filtros de lapso de fechas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Desde</label>
            <input type="date" id="iva-date-from" class="form-input mt-1 w-full text-xs" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Hasta</label>
            <input type="date" id="iva-date-to" class="form-input mt-1 w-full text-xs" value="${today}" />
          </div>
          <div class="flex items-end gap-2">
            <button class="btn btn-primary flex-1 text-xs py-2" id="btn-gen-iva"><i class="fas fa-play mr-1"></i>Generar</button>
            <button class="btn btn-outline text-xs py-2" id="btn-exp-iva" disabled><i class="fas fa-file-excel mr-1"></i>Excel</button>
            <button class="btn btn-outline text-xs py-2" id="btn-pdf-iva" disabled><i class="fas fa-file-pdf mr-1"></i>PDF</button>
          </div>
        </div>
      </div>
      <div id="iva-results" class="p-5 text-sm text-center text-gray-400">Configura las fechas y haz clic en Generar.</div>`;

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
  if (!fromDate || !toDate) {
    return showToast('Por favor selecciona las fechas Desde y Hasta.', 'warning');
  }

  const results = $('#iva-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Reporte de IVA...</div>';

  try {
    const genPrefixes = getInputVal('iva-acc-gen').split(',').map(s => s.trim()).filter(Boolean);
    const descPrefixes = getInputVal('iva-acc-desc').split(',').map(s => s.trim()).filter(Boolean);

    const { transactions, txLines } = await ensureLedgerData();
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));

    const genLines = [];
    const descLines = [];

    const resolveIvaRateAndBase = (line, rowNet) => {
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
      return { rate, base };
    };

    for (const l of txLines) {
      const tx = txById[l.tx_id];
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (tx.date < fromDate || tx.date > toDate) continue;

      const code = l.expand?.account_id?.code || '';
      if (matchesPrefix(code, genPrefixes)) {
        const rowNet = Number(l.credit || 0) - Number(l.debit || 0);
        const { rate, base } = resolveIvaRateAndBase(l, rowNet);
        genLines.push({ line: l, tx, rate, base, net: rowNet });
      } else if (matchesPrefix(code, descPrefixes)) {
        const rowNet = Number(l.debit || 0) - Number(l.credit || 0);
        const { rate, base } = resolveIvaRateAndBase(l, rowNet);
        descLines.push({ line: l, tx, rate, base, net: rowNet });
      }
    }

    const sumGenDebit = genLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumGenCredit = genLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumGenBase = genLines.reduce((acc, curr) => acc + curr.base, 0);
    const netGen = sumGenCredit - sumGenDebit;

    const sumDescDebit = descLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumDescCredit = descLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumDescBase = descLines.reduce((acc, curr) => acc + curr.base, 0);
    const netDesc = sumDescDebit - sumDescCredit;

    const netSuggested = netGen - netDesc;

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

      <div class="space-y-6 text-left">
        <!-- IVA Generado Details -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700"><i class="fas fa-arrow-up text-red-500 mr-1"></i>Detalle de IVA Generado (Pasivo)</h5>
            <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">${genLines.length} registros</span>
          </div>
          <div class="overflow-x-auto max-h-[300px]">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Tercero</th>
                  <th>Cuenta</th>
                  <th class="text-right">Base Gravable</th>
                  <th class="text-right">Tarifa</th>
                  <th class="text-right">Débito</th>
                  <th class="text-right">Crédito</th>
                  <th class="text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                ${genLines.length ? genLines.map(l => {
                  return `
                    <tr>
                      <td>${esc(l.tx.date)}</td>
                      <td><span class="font-mono text-xs text-blue-900">${esc(l.tx.number)}</span></td>
                      <td>${esc(l.tx.expand?.third_party_id?.name || 'Sin tercero')} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}</td>
                      <td><span class="font-mono text-xs text-gray-500">${esc(l.line.expand?.account_id?.code)}</span> - ${esc(l.line.expand?.account_id?.name)}</td>
                      <td class="text-right font-semibold text-gray-700">${fmt(l.base)}</td>
                      <td class="text-right">${l.rate > 0 ? `${l.rate}%` : '—'}</td>
                      <td class="text-right">${l.line.debit ? fmt(l.line.debit) : '—'}</td>
                      <td class="text-right">${l.line.credit ? fmt(l.line.credit) : '—'}</td>
                      <td class="text-right font-semibold">${fmt(l.net)}</td>
                    </tr>`;
                }).join('') : '<tr><td colspan="9" class="text-center py-6 text-gray-400">No hay movimientos de IVA Generado en este período.</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="font-bold bg-gray-50">
                  <td colspan="4">Total IVA Generado</td>
                  <td class="text-right">${fmt(sumGenBase)}</td>
                  <td></td>
                  <td class="text-right">${fmt(sumGenDebit)}</td>
                  <td class="text-right">${fmt(sumGenCredit)}</td>
                  <td class="text-right text-red-600">${fmt(netGen)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- IVA Descontable Details -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700"><i class="fas fa-arrow-down text-green-500 mr-1"></i>Detalle de IVA Descontable (Activo)</h5>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">${descLines.length} registros</span>
          </div>
          <div class="overflow-x-auto max-h-[300px]">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Tercero</th>
                  <th>Cuenta</th>
                  <th class="text-right">Base Gravable</th>
                  <th class="text-right">Tarifa</th>
                  <th class="text-right">Débito</th>
                  <th class="text-right">Crédito</th>
                  <th class="text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                ${descLines.length ? descLines.map(l => {
                  return `
                    <tr>
                      <td>${esc(l.tx.date)}</td>
                      <td><span class="font-mono text-xs text-blue-900">${esc(l.tx.number)}</span></td>
                      <td>${esc(l.tx.expand?.third_party_id?.name || 'Sin tercero')} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}</td>
                      <td><span class="font-mono text-xs text-gray-500">${esc(l.line.expand?.account_id?.code)}</span> - ${esc(l.line.expand?.account_id?.name)}</td>
                      <td class="text-right font-semibold text-gray-700">${fmt(l.base)}</td>
                      <td class="text-right">${l.rate > 0 ? `${l.rate}%` : '—'}</td>
                      <td class="text-right">${l.line.debit ? fmt(l.line.debit) : '—'}</td>
                      <td class="text-right">${l.line.credit ? fmt(l.line.credit) : '—'}</td>
                      <td class="text-right font-semibold">${fmt(l.net)}</td>
                    </tr>`;
                }).join('') : '<tr><td colspan="9" class="text-center py-6 text-gray-400">No hay movimientos de IVA Descontable en este período.</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="font-bold bg-gray-50">
                  <td colspan="4">Total IVA Descontable</td>
                  <td class="text-right">${fmt(sumDescBase)}</td>
                  <td></td>
                  <td class="text-right">${fmt(sumDescDebit)}</td>
                  <td class="text-right">${fmt(sumDescCredit)}</td>
                  <td class="text-right text-green-600">${fmt(netDesc)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;

    (window as any)._ivaReportData = {
      fromDate,
      toDate,
      genPrefixes,
      descPrefixes,
      genLines,
      descLines,
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

function exportIvaToExcel() {
  const data = (window as any)._ivaReportData;
  if (!data) return;

  const rows = [];
  data.genLines.forEach(l => {
    rows.push({
      tipo: 'Generado',
      fecha: l.tx.date,
      documento: l.tx.number,
      tercero: `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
      cuenta: `${l.line.expand?.account_id?.code} - ${l.line.expand?.account_id?.name}`,
      base_gravable: l.base,
      tarifa: l.rate > 0 ? `${l.rate}%` : '—',
      debito: Number(l.line.debit || 0),
      credito: Number(l.line.credit || 0),
      neto: l.net
    });
  });

  data.descLines.forEach(l => {
    rows.push({
      tipo: 'Descontable',
      fecha: l.tx.date,
      documento: l.tx.number,
      tercero: `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
      cuenta: `${l.line.expand?.account_id?.code} - ${l.line.expand?.account_id?.name}`,
      base_gravable: l.base,
      tarifa: l.rate > 0 ? `${l.rate}%` : '—',
      debito: Number(l.line.debit || 0),
      credito: Number(l.line.credit || 0),
      neto: l.net
    });
  });

  exportToExcel(rows, [
    { key: 'tipo', label: 'Tipo de IVA' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'documento', label: 'Documento' },
    { key: 'tercero', label: 'Tercero' },
    { key: 'cuenta', label: 'Cuenta Contable' },
    { key: 'base_gravable', label: 'Base Gravable' },
    { key: 'tarifa', label: 'Tarifa' },
    { key: 'debito', label: 'Debito' },
    { key: 'credito', label: 'Credito' },
    { key: 'neto', label: 'Neto Reportado' }
  ], `reporte_iva_${data.fromDate}_a_${data.toDate}`);
}

async function exportIvaToPdf() {
  const data = (window as any)._ivaReportData;
  if (!data) return;

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;
    const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const headerCtx = await getPdfHeaderContext();
    const header = drawPdfHeader(doc, headerCtx, {
      title: 'Reporte de IVA (Impuesto sobre las Ventas)',
      subtitles: [
        `Periodo: ${data.fromDate} a ${data.toDate}`,
        `IVA Generado (Credito Neto): ${fmtPdfNum(data.netGen)}`,
        `IVA Descontable (Debito Neto): ${fmtPdfNum(data.netDesc)}`,
        `Sugerencia de Liquidacion: ${data.netSuggested >= 0 ? 'A Pagar' : 'Saldo a Favor'} ${fmtPdfNum(Math.abs(data.netSuggested))}`
      ],
    });

    const body = [];
    body.push([{ content: 'IVA GENERADO (VENTAS)', colSpan: 8, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [13, 33, 55] } }]);
    if (data.genLines.length) {
      data.genLines.forEach(l => {
        body.push([
          l.tx.date,
          l.tx.number,
          `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
          `${l.line.expand?.account_id?.code} - ${l.line.expand?.account_id?.name}`,
          fmtPdfNum(l.base),
          l.rate > 0 ? `${l.rate}%` : '—',
          fmtPdfNum(l.line.debit),
          fmtPdfNum(l.line.credit)
        ]);
      });
    } else {
      body.push([{ content: 'No hay movimientos de IVA Generado.', colSpan: 8, styles: { textColor: [120, 120, 120] } }]);
    }
    body.push([
      { content: 'Subtotal Generado', styles: { fontStyle: 'bold' } }, '', '', '',
      { content: fmtPdfNum(data.sumGenBase), styles: { fontStyle: 'bold', halign: 'right' } },
      '',
      { content: fmtPdfNum(data.genLines.reduce((s, c) => s + Number(c.line.debit || 0), 0)), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: fmtPdfNum(data.genLines.reduce((s, c) => s + Number(c.line.credit || 0), 0)), styles: { fontStyle: 'bold', halign: 'right' } }
    ]);

    body.push([{ content: 'IVA DESCONTABLE (COMPRAS)', colSpan: 8, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [13, 33, 55] } }]);
    if (data.descLines.length) {
      data.descLines.forEach(l => {
        body.push([
          l.tx.date,
          l.tx.number,
          `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
          `${l.line.expand?.account_id?.code} - ${l.line.expand?.account_id?.name}`,
          fmtPdfNum(l.base),
          l.rate > 0 ? `${l.rate}%` : '—',
          fmtPdfNum(l.line.debit),
          fmtPdfNum(l.line.credit)
        ]);
      });
    } else {
      body.push([{ content: 'No hay movimientos de IVA Descontable.', colSpan: 8, styles: { textColor: [120, 120, 120] } }]);
    }
    body.push([
      { content: 'Subtotal Descontable', styles: { fontStyle: 'bold' } }, '', '', '',
      { content: fmtPdfNum(data.sumDescBase), styles: { fontStyle: 'bold', halign: 'right' } },
      '',
      { content: fmtPdfNum(data.descLines.reduce((s, c) => s + Number(c.line.debit || 0), 0)), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: fmtPdfNum(data.descLines.reduce((s, c) => s + Number(c.line.credit || 0), 0)), styles: { fontStyle: 'bold', halign: 'right' } }
    ]);

    doc.autoTable({
      startY: header.startY,
      head: [['Fecha', 'Documento', 'Tercero', 'Cuenta', 'Base Gravable', 'Tarifa', 'Debito', 'Credito']],
      body,
      theme: 'plain',
      margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
      styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
      columnStyles: {
        0: { cellWidth: 48 }, // Fecha
        1: { cellWidth: 52 }, // Documento
        2: { cellWidth: 120 }, // Tercero
        3: { cellWidth: 120 }, // Cuenta
        4: { cellWidth: 72, halign: 'right' }, // Base
        5: { cellWidth: 36, halign: 'center' }, // Tarifa
        6: { cellWidth: 58, halign: 'right' }, // Debito
        7: { cellWidth: 58, halign: 'right' }, // Credito
      },
      didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
    });

    doc.save(`reporte_iva_${data.fromDate}_a_${data.toDate}.pdf`);
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
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = today.substring(0, 8) + '01';

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-percent mr-2 text-indigo-600"></i>Reporte de Retenciones en la Fuente</h4>
        
        <!-- Configuración de cuentas -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-700"><i class="fas fa-gears mr-1"></i>Configuración de Cuentas Contables</span>
            <span class="text-[10px] text-gray-400">Separa los códigos por comas</span>
          </div>
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

        <!-- Filtros de lapso de fechas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Desde</label>
            <input type="date" id="ret-date-from" class="form-input mt-1 w-full text-xs" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Hasta</label>
            <input type="date" id="ret-date-to" class="form-input mt-1 w-full text-xs" value="${today}" />
          </div>
          <div class="flex items-end gap-2">
            <button class="btn btn-primary flex-1 text-xs py-2" id="btn-gen-ret"><i class="fas fa-play mr-1"></i>Generar</button>
            <button class="btn btn-outline text-xs py-2" id="btn-exp-ret" disabled><i class="fas fa-file-excel mr-1"></i>Excel</button>
            <button class="btn btn-outline text-xs py-2" id="btn-pdf-ret" disabled><i class="fas fa-file-pdf mr-1"></i>PDF</button>
          </div>
        </div>
      </div>
      <div id="ret-results" class="p-5 text-sm text-center text-gray-400">Configura las fechas y haz clic en Generar.</div>`;

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
  if (!fromDate || !toDate) {
    return showToast('Por favor selecciona las fechas Desde y Hasta.', 'warning');
  }

  const results = $('#ret-results');
  if (!results) return;
  results.innerHTML = '<div class="p-6 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Generando Reporte de Retenciones...</div>';

  try {
    const pracPrefixes = getInputVal('ret-acc-prac').split(',').map(s => s.trim()).filter(Boolean);
    const favorPrefixes = getInputVal('ret-acc-favor').split(',').map(s => s.trim()).filter(Boolean);

    const { transactions, txLines } = await ensureLedgerData();
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));

    const pracLines = [];
    const favorLines = [];

    const resolveRetRateAndBase = (line, rowNet) => {
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
      return { rate, base };
    };

    for (const l of txLines) {
      const tx = txById[l.tx_id];
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (tx.date < fromDate || tx.date > toDate) continue;

      const code = l.expand?.account_id?.code || '';
      if (matchesPrefix(code, pracPrefixes)) {
        const rowNet = Number(l.credit || 0) - Number(l.debit || 0);
        const { rate, base } = resolveRetRateAndBase(l, rowNet);
        pracLines.push({ line: l, tx, rate, base, net: rowNet });
      } else if (matchesPrefix(code, favorPrefixes)) {
        const rowNet = Number(l.debit || 0) - Number(l.credit || 0);
        const { rate, base } = resolveRetRateAndBase(l, rowNet);
        favorLines.push({ line: l, tx, rate, base, net: rowNet });
      }
    }

    const sumPracDebit = pracLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumPracCredit = pracLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumPracBase = pracLines.reduce((acc, curr) => acc + curr.base, 0);
    const netPrac = sumPracCredit - sumPracDebit;

    const sumFavorDebit = favorLines.reduce((acc, curr) => acc + Number(curr.line.debit || 0), 0);
    const sumFavorCredit = favorLines.reduce((acc, curr) => acc + Number(curr.line.credit || 0), 0);
    const sumFavorBase = favorLines.reduce((acc, curr) => acc + curr.base, 0);
    const netFavor = sumFavorDebit - sumFavorCredit;

    const netSuggested = netPrac - netFavor;

    // Desglose por cuenta
    const accountSummary = new Map();
    const addGrouped = (l, type, polarity) => {
      const accCode = l.line.expand?.account_id?.code || '';
      const accName = l.line.expand?.account_id?.name || '';
      const key = `${accCode} - ${accName}`;
      if (!accountSummary.has(key)) {
        accountSummary.set(key, { code: accCode, name: accName, debit: 0, credit: 0, base: 0, type, polarity });
      }
      const item = accountSummary.get(key);
      item.debit += Number(l.line.debit || 0);
      item.credit += Number(l.line.credit || 0);
      item.base += Number(l.base || 0);
    };

    pracLines.forEach(l => addGrouped(l, 'Practicada', 1));
    favorLines.forEach(l => addGrouped(l, 'A Favor', -1));

    const summaryRows = [...accountSummary.entries()].map(([key, item]) => {
      const net = item.polarity === 1 ? (item.credit - item.debit) : (item.debit - item.credit);
      return {
        key,
        code: item.code,
        name: item.name,
        type: item.type,
        debit: item.debit,
        credit: item.credit,
        base: item.base,
        net
      };
    }).sort((a, b) => a.code.localeCompare(b.code));

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

      <div class="space-y-6 text-left">
        <!-- Resumen por Cuenta -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700"><i class="fas fa-folder-tree text-blue-600 mr-1"></i>Desglose Resumido por Cuenta</h5>
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">${summaryRows.length} cuentas</span>
          </div>
          <div class="overflow-x-auto max-h-[300px]">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre Cuenta</th>
                  <th>Tipo</th>
                  <th class="text-right">Base Gravable</th>
                  <th class="text-right">Total Débito</th>
                  <th class="text-right">Total Crédito</th>
                  <th class="text-right">Neto Reportado</th>
                </tr>
              </thead>
              <tbody>
                ${summaryRows.length ? summaryRows.map(r => `
                  <tr>
                    <td><span class="font-mono text-xs font-semibold text-blue-900">${esc(r.code)}</span></td>
                    <td>${esc(r.name)}</td>
                    <td><span class="badge ${r.type === 'Practicada' ? 'badge-orange' : 'badge-green'}">${esc(r.type)}</span></td>
                    <td class="text-right font-semibold text-gray-700">${fmt(r.base)}</td>
                    <td class="text-right">${r.debit ? fmt(r.debit) : '—'}</td>
                    <td class="text-right">${r.credit ? fmt(r.credit) : '—'}</td>
                    <td class="text-right font-semibold">${fmt(r.net)}</td>
                  </tr>`).join('') : '<tr><td colspan="7" class="text-center py-6 text-gray-400">No hay movimientos de Retenciones en este período.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detalle de Transacciones Practicadas -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700"><i class="fas fa-arrow-up text-red-500 mr-1"></i>Detalle de Retenciones Practicadas (Pasivo)</h5>
            <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">${pracLines.length} registros</span>
          </div>
          <div class="overflow-x-auto max-h-[300px]">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Tercero</th>
                  <th>Cuenta</th>
                  <th class="text-right">Base Gravable</th>
                  <th class="text-right">Tarifa</th>
                  <th class="text-right">Débito</th>
                  <th class="text-right">Crédito</th>
                  <th class="text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                ${pracLines.length ? pracLines.map(l => {
                  return `
                    <tr>
                      <td>${esc(l.tx.date)}</td>
                      <td><span class="font-mono text-xs text-blue-900">${esc(l.tx.number)}</span></td>
                      <td>${esc(l.tx.expand?.third_party_id?.name || 'Sin tercero')} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}</td>
                      <td><span class="font-mono text-xs text-gray-500">${esc(l.line.expand?.account_id?.code)}</span> - ${esc(l.line.expand?.account_id?.name)}</td>
                      <td class="text-right font-semibold text-gray-700">${fmt(l.base)}</td>
                      <td class="text-right">${l.rate > 0 ? `${l.rate}%` : '—'}</td>
                      <td class="text-right">${l.line.debit ? fmt(l.line.debit) : '—'}</td>
                      <td class="text-right">${l.line.credit ? fmt(l.line.credit) : '—'}</td>
                      <td class="text-right font-semibold">${fmt(l.net)}</td>
                    </tr>`;
                }).join('') : '<tr><td colspan="9" class="text-center py-6 text-gray-400">No hay movimientos en este período.</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="font-bold bg-gray-50">
                  <td colspan="4">Total Practicadas</td>
                  <td class="text-right">${fmt(sumPracBase)}</td>
                  <td></td>
                  <td class="text-right">${fmt(sumPracDebit)}</td>
                  <td class="text-right">${fmt(sumPracCredit)}</td>
                  <td class="text-right text-red-600">${fmt(netPrac)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Detalle de Transacciones a Favor -->
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#E5E7EB">
          <div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between" style="border-color:#E5E7EB">
            <h5 class="font-bold text-gray-700"><i class="fas fa-arrow-down text-green-500 mr-1"></i>Detalle de Retenciones a Favor (Anticipos)</h5>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">${favorLines.length} registros</span>
          </div>
          <div class="overflow-x-auto max-h-[300px]">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Tercero</th>
                  <th>Cuenta</th>
                  <th class="text-right">Base Gravable</th>
                  <th class="text-right">Tarifa</th>
                  <th class="text-right">Débito</th>
                  <th class="text-right">Crédito</th>
                  <th class="text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                ${favorLines.length ? favorLines.map(l => {
                  return `
                    <tr>
                      <td>${esc(l.tx.date)}</td>
                      <td><span class="font-mono text-xs text-blue-900">${esc(l.tx.number)}</span></td>
                      <td>${esc(l.tx.expand?.third_party_id?.name || 'Sin tercero')} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}</td>
                      <td><span class="font-mono text-xs text-gray-500">${esc(l.line.expand?.account_id?.code)}</span> - ${esc(l.line.expand?.account_id?.name)}</td>
                      <td class="text-right font-semibold text-gray-700">${fmt(l.base)}</td>
                      <td class="text-right">${l.rate > 0 ? `${l.rate}%` : '—'}</td>
                      <td class="text-right">${l.line.debit ? fmt(l.line.debit) : '—'}</td>
                      <td class="text-right">${l.line.credit ? fmt(l.line.credit) : '—'}</td>
                      <td class="text-right font-semibold">${fmt(l.net)}</td>
                    </tr>`;
                }).join('') : '<tr><td colspan="9" class="text-center py-6 text-gray-400">No hay movimientos en este período.</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="font-bold bg-gray-50">
                  <td colspan="4">Total a Favor</td>
                  <td class="text-right">${fmt(sumFavorBase)}</td>
                  <td></td>
                  <td class="text-right">${fmt(sumFavorDebit)}</td>
                  <td class="text-right">${fmt(sumFavorCredit)}</td>
                  <td class="text-right text-green-600">${fmt(netFavor)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;

    (window as any)._retReportData = {
      fromDate,
      toDate,
      pracPrefixes,
      favorPrefixes,
      pracLines,
      favorLines,
      summaryRows,
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

function exportRetToExcel() {
  const data = (window as any)._retReportData;
  if (!data) return;

  const rows = [];
  
  rows.push({
    seccion: 'RESUMEN POR CUENTA',
    codigo: '',
    cuenta: '',
    tipo: '',
    tercero: '',
    base_gravable: 0,
    debito: 0,
    credito: 0,
    neto: 0
  });

  data.summaryRows.forEach(r => {
    rows.push({
      seccion: 'Resumen por Cuenta',
      codigo: r.code,
      cuenta: r.name,
      tipo: r.type,
      tercero: '',
      base_gravable: r.base,
      debito: r.debit,
      credito: r.credit,
      neto: r.net
    });
  });

  rows.push({ seccion: '', codigo: '', cuenta: '', tipo: '', tercero: '', base_gravable: 0, debito: 0, credito: 0, neto: 0 });

  rows.push({
    seccion: 'DETALLE RETENCIONES PRACTICADAS',
    codigo: '',
    cuenta: '',
    tipo: '',
    tercero: '',
    base_gravable: 0,
    tarifa: '',
    debito: 0,
    credito: 0,
    neto: 0
  });

  data.pracLines.forEach(l => {
    rows.push({
      seccion: 'Detalle Practicadas',
      codigo: l.line.expand?.account_id?.code,
      cuenta: l.line.expand?.account_id?.name,
      tipo: l.tx.date,
      tercero: `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
      base_gravable: l.base,
      tarifa: l.rate > 0 ? `${l.rate}%` : '—',
      debito: Number(l.line.debit || 0),
      credito: Number(l.line.credit || 0),
      neto: l.net
    });
  });

  rows.push({ seccion: '', codigo: '', cuenta: '', tipo: '', tercero: '', base_gravable: 0, debito: 0, credito: 0, neto: 0 });

  rows.push({
    seccion: 'DETALLE RETENCIONES A FAVOR',
    codigo: '',
    cuenta: '',
    tipo: '',
    tercero: '',
    base_gravable: 0,
    tarifa: '',
    debito: 0,
    credito: 0,
    neto: 0
  });

  data.favorLines.forEach(l => {
    rows.push({
      seccion: 'Detalle a Favor',
      codigo: l.line.expand?.account_id?.code,
      cuenta: l.line.expand?.account_id?.name,
      tipo: l.tx.date,
      tercero: `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
      base_gravable: l.base,
      tarifa: l.rate > 0 ? `${l.rate}%` : '—',
      debito: Number(l.line.debit || 0),
      credito: Number(l.line.credit || 0),
      neto: l.net
    });
  });

  exportToExcel(rows, [
    { key: 'seccion', label: 'Seccion / Detalle' },
    { key: 'codigo', label: 'Codigo Cuenta' },
    { key: 'cuenta', label: 'Nombre Cuenta' },
    { key: 'tipo', label: 'Tipo / Fecha' },
    { key: 'tercero', label: 'Tercero' },
    { key: 'base_gravable', label: 'Base Gravable' },
    { key: 'tarifa', label: 'Tarifa' },
    { key: 'debito', label: 'Debito' },
    { key: 'credito', label: 'Credito' },
    { key: 'neto', label: 'Neto Reportado' }
  ], `reporte_retenciones_${data.fromDate}_a_${data.toDate}`);
}

async function exportRetToPdf() {
  const data = (window as any)._retReportData;
  if (!data) return;

  try {
    const jsPdfCtor = getPdfCtorOrWarn();
    if (!jsPdfCtor) return;
    const doc = new jsPdfCtor({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    const headerCtx = await getPdfHeaderContext();
    const header = drawPdfHeader(doc, headerCtx, {
      title: 'Reporte de Retenciones en la Fuente',
      subtitles: [
        `Periodo: ${data.fromDate} a ${data.toDate}`,
        `Retenciones Practicadas (Credito Neto): ${fmtPdfNum(data.netPrac)}`,
        `Retenciones a Favor (Debito Neto): ${fmtPdfNum(data.netFavor)}`,
        `Sugerencia de Liquidacion: ${data.netSuggested >= 0 ? 'A Pagar' : 'Saldo a Favor'} ${fmtPdfNum(Math.abs(data.netSuggested))}`
      ],
    });

    const body = [];
    body.push([{ content: 'DESGLOSE RESUMIDO POR CUENTA', colSpan: 7, styles: { fontStyle: 'bold', fillColor: [230, 235, 245], textColor: [13, 33, 55] } }]);
    if (data.summaryRows.length) {
      data.summaryRows.forEach(r => {
        body.push([
          r.code,
          r.name,
          r.type,
          '',
          fmtPdfNum(r.base),
          fmtPdfNum(r.debit),
          fmtPdfNum(r.credit)
        ]);
      });
    } else {
      body.push([{ content: 'No hay movimientos de Retenciones en este período.', colSpan: 7 }]);
    }

    body.push([{ content: 'DETALLE RETENCIONES PRACTICADAS (PASIVO)', colSpan: 7, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [13, 33, 55] } }]);
    if (data.pracLines.length) {
      data.pracLines.forEach(l => {
        body.push([
          l.tx.date,
          l.tx.number,
          `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
          `${l.line.expand?.account_id?.code} - ${l.rate > 0 ? `${l.rate}%` : '—'}`,
          fmtPdfNum(l.base),
          fmtPdfNum(l.line.debit),
          fmtPdfNum(l.line.credit)
        ]);
      });
    } else {
      body.push([{ content: 'No hay detalles de Retenciones Practicadas.', colSpan: 7, styles: { textColor: [120, 120, 120] } }]);
    }

    body.push([{ content: 'DETALLE RETENCIONES A FAVOR (ANTICIPOS)', colSpan: 7, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], textColor: [13, 33, 55] } }]);
    if (data.favorLines.length) {
      data.favorLines.forEach(l => {
        body.push([
          l.tx.date,
          l.tx.number,
          `${l.tx.expand?.third_party_id?.name || 'Sin tercero'} ${l.tx.expand?.third_party_id?.doc_number ? `(${l.tx.expand.third_party_id.doc_number})` : ''}`,
          `${l.line.expand?.account_id?.code} - ${l.rate > 0 ? `${l.rate}%` : '—'}`,
          fmtPdfNum(l.base),
          fmtPdfNum(l.line.debit),
          fmtPdfNum(l.line.credit)
        ]);
      });
    } else {
      body.push([{ content: 'No hay detalles de Retenciones a Favor.', colSpan: 7, styles: { textColor: [120, 120, 120] } }]);
    }

    doc.autoTable({
      startY: header.startY,
      head: [['Fecha / Código', 'Documento / Nombre Cuenta', 'Tercero / Tipo', 'Cuenta / Info / Tarifa', 'Base Gravable', 'Débito', 'Crédito']],
      body,
      theme: 'plain',
      margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
      styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
      columnStyles: {
        0: { cellWidth: 50 }, // Fecha / Código
        1: { cellWidth: 120 }, // Documento / Nombre Cuenta
        2: { cellWidth: 120 }, // Tercero / Tipo
        3: { cellWidth: 104 }, // Cuenta / Info / Tarifa
        4: { cellWidth: 68, halign: 'right' }, // Base Gravable
        5: { cellWidth: 51, halign: 'right' }, // Débito
        6: { cellWidth: 51, halign: 'right' }, // Crédito
      },
      didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
    });

    doc.save(`reporte_retenciones_${data.fromDate}_a_${data.toDate}.pdf`);
  } catch (err: any) {
    showToast(`Error al generar PDF: ${err.message}`, 'error');
  }
}

async function renderSalesEmissionReport() {
  const host = getReportViewHost();
  if (!host) return;

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

    if (!fromVal || !toVal) {
      showToast('Selecciona un rango de fechas válido.', 'warning');
      return;
    }

    const tableContainer = document.getElementById('rse-results-table') as HTMLElement;
    tableContainer.innerHTML = '<div class="py-12 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>';

    try {
      const [invoices, orders] = await Promise.all([
        pb.listAll('invoices', {
          filter: `date >= "${fromVal} 00:00:00" && date <= "${toVal} 23:59:59"`,
          expand: 'customer_id,warehouse_id',
          sort: '-date'
        }),
        pb.listAll('sales_orders', {
          filter: `date >= "${fromVal}" && date <= "${toVal}"`,
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
        
        if (isPOS) {
          totalPos += total;
        } else {
          totalStand += total;
        }

        unified.push({
          id: inv.id,
          date: inv.date.slice(0, 10),
          typeCode: isPOS ? 'POS' : 'STAND',
          typeName: isPOS ? 'Tiquete POS' : 'Factura Estándar',
          number: inv.number,
          customerName: inv.expand?.customer_id?.name || 'Consumidor Final',
          customerDoc: inv.expand?.customer_id?.doc_number || inv.expand?.customer_id?.nit || '—',
          warehouseName: inv.expand?.warehouse_id?.name || '—',
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
          typeCode: 'PED',
          typeName: 'Pedido de Venta',
          number: ord.number,
          customerName: ord.expand?.customer_id?.name || 'Cliente',
          customerDoc: ord.expand?.customer_id?.doc_number || ord.expand?.customer_id?.nit || '—',
          warehouseName: ord.expand?.warehouse_id?.name || '—',
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
            <tr style="background:#F4F8FF font-weight:bold">
              <th class="text-left py-2 px-3">Fecha</th>
              <th class="text-left py-2 px-3">Tipo de Emisión</th>
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
                <td class="py-2.5 px-3">
                  <span class="badge ${f.typeCode === 'POS' ? 'badge-blue' : (f.typeCode === 'STAND' ? 'badge-orange' : 'badge-green')}">
                    ${f.typeName}
                  </span>
                </td>
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
      { label: 'Tipo de Emisión', key: 'typeName' },
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
        f.typeName,
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
        head: [['Fecha', 'Tipo', 'Número', 'Cliente', 'Bodega', 'Subtotal', 'IVA', 'Total', 'Estado']],
        body,
        theme: 'plain',
        margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 26 },
        styles: { font: 'helvetica', fontSize: 6.5, textColor: [55, 55, 55], cellPadding: 2.0, lineWidth: 0, overflow: 'linebreak' },
        headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 6.7, lineWidth: { bottom: 0.25 } },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 60 },
          2: { cellWidth: 45 },
          3: { cellWidth: 140 },
          4: { cellWidth: 60 },
          5: { cellWidth: 50, halign: 'right' },
          6: { cellWidth: 40, halign: 'right' },
          7: { cellWidth: 55, halign: 'right' },
          8: { cellWidth: 50, halign: 'center' },
        },
        didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
      });

      doc.save(`reporte_ventas_emisiones_${fromVal}_a_${toVal}.pdf`);
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
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = today.substring(0, 8) + '01';

    view.innerHTML = `
      <div class="p-5 border-b space-y-4" style="border-color:#F3F4F6">
        <h4 class="font-bold text-lg text-gray-800" style="color:#0D2137"><i class="fas fa-money-bill-transfer mr-2 text-emerald-600"></i>Reporte de Flujo de Caja (Método Directo)</h4>
        <p class="text-xs text-gray-500">Analiza las entradas y salidas reales de dinero mediante las cuentas del Disponible (Grupo 11).</p>
        
        <!-- Filtros de lapso de fechas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Desde</label>
            <input type="date" id="cf-date-from" class="form-input mt-1 w-full text-xs" value="${firstDayOfMonth}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500">Fecha Hasta</label>
            <input type="date" id="cf-date-to" class="form-input mt-1 w-full text-xs" value="${today}" />
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
    const { transactions, txLines } = await ensureLedgerData();
    const txById = Object.fromEntries(transactions.map(t => [t.id, t]));
    const { accounts } = await ensureAccountsSaldos();
    const accountMap = new Map(accounts.map(a => [a.id, a]));

    // 1. Calculate Initial Balance of group 11 accounts
    let initialBalance = 0;
    for (const l of txLines) {
      const tx = txById[l.tx_id];
      if (!tx || tx.status !== 'active' || !tx.date) continue;
      if (tx.date >= fromDate) continue; // Only before start date
      
      const acc = l.expand?.account_id || accountMap.get(l.account_id);
      const code = acc?.code || '';
      if (code.startsWith('11')) {
        initialBalance += (Number(l.debit || 0) - Number(l.credit || 0));
      }
    }

    // 2. Classify transactions during the period
    const transactionsInPeriod = transactions.filter(t => t.date >= fromDate && t.date <= toDate && t.status === 'active');
    const txIdSet = new Set(transactionsInPeriod.map(t => t.id));

    // Group lines by transaction
    const txLinesMap = new Map();
    for (const l of txLines) {
      if (txIdSet.has(l.tx_id)) {
        if (!txLinesMap.has(l.tx_id)) {
          txLinesMap.set(l.tx_id, []);
        }
        txLinesMap.get(l.tx_id).push(l);
      }
    }

    const flowItems = []; // list of flows: { type: 'Ingreso' | 'Egreso', amount, category, subcategory, accountCode, accountName, txDate, txNumber, description }
    
    txLinesMap.forEach((lines, txId) => {
      const tx = txById[txId];
      
      // Separate cash and non-cash lines
      const cashLines = [];
      const nonCashLines = [];
      
      for (const l of lines) {
        const acc = l.expand?.account_id || accountMap.get(l.account_id);
        const code = acc?.code || '';
        if (code.startsWith('11')) {
          cashLines.push({ line: l, code });
        } else {
          nonCashLines.push({ line: l, code, name: acc?.name || '' });
        }
      }

      if (cashLines.length === 0) return; // No cash flow

      // Net change in cash for this transaction
      const totalCashDebit = cashLines.reduce((s, cl) => s + Number(cl.line.debit || 0), 0);
      const totalCashCredit = cashLines.reduce((s, cl) => s + Number(cl.line.credit || 0), 0);
      const netCashChange = totalCashDebit - totalCashCredit;

      if (Math.abs(netCashChange) < 0.01) {
        // Internal transfer (net 0 cash impact)
        return; 
      }

      const isFlowIn = netCashChange > 0;
      const flowAmount = Math.abs(netCashChange);

      // Find main counterpart
      let mainCounterpart = null;
      if (nonCashLines.length > 0) {
        // Find non-cash line with highest absolute value
        nonCashLines.sort((a, b) => {
          const valA = Math.max(Number(a.line.debit || 0), Number(a.line.credit || 0));
          const valB = Math.max(Number(b.line.debit || 0), Number(b.line.credit || 0));
          return valB - valA;
        });
        mainCounterpart = nonCashLines[0];
      }

      const counterpartCode = mainCounterpart ? mainCounterpart.code : '';
      const counterpartName = mainCounterpart ? mainCounterpart.name : 'Transferencia / Ajuste';
      
      const classification = classifyCashFlow(counterpartCode);
      
      flowItems.push({
        type: isFlowIn ? 'Ingreso' : 'Egreso',
        amount: flowAmount,
        category: classification.category,
        subcategory: classification.subcategory,
        accountCode: counterpartCode || '11',
        accountName: counterpartName,
        txDate: tx.date,
        txNumber: tx.number,
        description: tx.description || 'Movimiento de disponible'
      });
    });

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

    (window as any)._cfReportData = {
      fromDate,
      toDate,
      initialBalance,
      totalInflows,
      totalOutflows,
      netFlow,
      finalBalance,
      flowItems
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
      didDrawPage: (data) => drawPdfFooter(doc, data.pageNumber),
    });

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
