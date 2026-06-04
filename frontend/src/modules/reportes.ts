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
          const thirdName = tx.expand?.third_party_id?.name || 'Sin tercero';
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
      const lines = await pb.listAll('tx_lines', {
        filter: `third_party_id="${safeThirdId}" && tx_id.status="active"`,
        expand: 'account_id,tx_id',
      });

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

        const rate = Number(l.ret_rate || 0);
        const base = Number(l.ret_base || (rate > 0 ? (withheld / (rate / 100)) : withheld));

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
