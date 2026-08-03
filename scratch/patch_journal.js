const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/modules/reportes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF for easier replacement
const originalEnding = content.includes('\r\n') ? '\r\n' : '\n';
content = content.replace(/\r\n/g, '\n');

// We find the entire implementation of renderJournalBook
const startMarker = 'async function renderJournalBook() {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("renderJournalBook not found");
  process.exit(1);
}

// We find the end of renderJournalBook. It ends before async function renderAuxiliaryBook()
const endMarker = 'async function renderAuxiliaryBook() {';
const endIndex = content.indexOf(endMarker);
if (endIndex === -1) {
  console.error("renderAuxiliaryBook not found");
  process.exit(1);
}

const journalContent = content.substring(startIndex, endIndex);

// We replace the internal implementation of renderJournalBook
// We want to group by comprobante, add header and subtotal rows in HTML, PDF and Excel.
const newJournalContent = `async function renderJournalBook() {
  const view = getReportViewHost();
  if (!view) return;
  const currentMonth = todayStr().slice(0, 7);

  let txTypes = [];
  try {
    txTypes = await API.getTxTypes();
  } catch (_) {
    txTypes = [];
  }

  view.innerHTML = \`
    <div class="p-4 border-b" style="border-color:#F3F4F6">
      <h4 class="font-bold mb-3" style="color:#0D2137">Libro Diario</h4>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div class="form-group">
          <label class="form-label">Mes desde</label>
          <input id="journal-month-from" type="month" class="form-input" value="\${currentMonth}">
        </div>
        <div class="form-group">
          <label class="form-label">Mes hasta</label>
          <input id="journal-month-to" type="month" class="form-input" value="\${currentMonth}">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de transacción</label>
          <select id="journal-tx-type" class="form-input">
            <option value="">Todos</option>
            \${txTypes.map(tt => \`<option value="\${esc(tt.id)}">\${esc(tt.code || '')} - \${esc(tt.name || '')}</option>\`).join('')}
          </select>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-primary w-full" id="btn-gen-journal"><i class="fas fa-filter"></i> Generar</button>
        </div>
        <div class="form-group flex items-end">
          <button class="btn btn-outline w-full" id="btn-pdf-journal" disabled><i class="fas fa-file-pdf"></i> PDF</button>
        </div>
        <div class="form-group flex items-end">
          \${can('canExport') ? '<button class="btn btn-outline w-full" id="btn-exp-journal" disabled><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
        </div>
      </div>
    </div>
    <div id="journal-results" class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-calendar-days mr-2"></i>Selecciona rango mensual y filtros para generar el Libro Diario.
    </div>\`;

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
            cuenta: \`\${l.expand?.account_id?.code || ''} - \${l.expand?.account_id?.name || ''}\`.trim(),
            debito: Number(l.debit || 0),
            credito: Number(l.credit || 0),
          };
        })
        .filter(Boolean)
        .sort((a, b) => \`\${a.fecha}|\${a.comprobante}|\${a.cuenta}\`.localeCompare(\`\${b.fecha}|\${b.comprobante}|\${b.cuenta}\`));

      const totalDeb = rows.reduce((s, r) => s + Number(r.debito || 0), 0);
      const totalCre = rows.reduce((s, r) => s + Number(r.credito || 0), 0);

      // Group rows by comprobante (documento) for visual hierarchy and subtotals
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

      const tbodyHtml = groups.length ? groups.map(g => \`
        <tr style="background-color: #F9FAFB; font-weight: bold; border-top: 1.5px solid #E5E7EB;">
          <td colspan="4" class="text-left" style="color: #0D2137; padding-top: 6px; padding-bottom: 6px;">
            \${esc(g.fecha)} &nbsp;|&nbsp; <strong>\${esc(g.comprobante)}</strong> &nbsp;|&nbsp; \${esc(g.tercero)}
          </td>
          <td colspan="3" class="text-left text-xs font-normal" style="color: #6B7280; padding-top: 6px; padding-bottom: 6px;">
            \${esc(g.descripcion)}
          </td>
        </tr>
        \${g.lines.map(line => \`
          <tr>
            <td></td>
            <td></td>
            <td colspan="2" class="text-xs text-gray-400">\${esc(line.descripcion !== g.descripcion ? line.descripcion : '')}</td>
            <td>\${esc(line.cuenta)}</td>
            <td class="text-right">\${fmt(line.debito)}</td>
            <td class="text-right">\${fmt(line.credito)}</td>
          </tr>
        \`).join('')}
        <tr class="font-semibold" style="background-color: #F3F4F6; border-bottom: 1.5px solid #D1D5DB;">
          <td colspan="5" class="text-right text-xs" style="color: #4B5563">Subtotal \${esc(g.comprobante)}</td>
          <td class="text-right" style="color: #111827">\${fmt(g.totalDeb)}</td>
          <td class="text-right" style="color: #111827">\${fmt(g.totalCre)}</td>
        </tr>
      \`).join('') : '<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay movimientos para reportar.</td></tr>';

      results.innerHTML = \`
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <p class="text-sm" style="color:#6B7280">Período: <strong>\${esc(fromMonth)}</strong> a <strong>\${esc(toMonth)}</strong> · Registros: <strong>\${fmtN(rows.length)}</strong> · Débito: <strong>\${fmt(totalDeb)}</strong> · Crédito: <strong>\${fmt(totalCre)}</strong></p>
        </div>
        <div class="overflow-x-auto" style="max-height:420px">
          <table class="data-table">
            <thead><tr><th>Fecha</th><th>Comp.</th><th>Descripción</th><th>Tercero</th><th>Cuenta</th><th>Débito</th><th>Crédito</th></tr></thead>
            <tbody>
              \${tbodyHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="font-bold">TOTAL GENERAL</td>
                <td class="font-bold">\${fmt(totalDeb)}</td>
                <td class="font-bold">\${fmt(totalCre)}</td>
              </tr>
            </tfoot>
          </table>
        </div>\`;

      lastRows = rows;
      lastMeta = { fromMonth, toMonth, txTypeId, totalDeb, totalCre };

      if ($('#btn-exp-journal')) $('#btn-exp-journal').disabled = !rows.length;
      if ($('#btn-pdf-journal')) $('#btn-pdf-journal').disabled = !rows.length;
    } catch (err) {
      results.innerHTML = \`<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>\${esc(err.message)}</div>\`;
      lastRows = [];
      lastMeta = null;
      if ($('#btn-exp-journal')) $('#btn-exp-journal').disabled = true;
      if ($('#btn-pdf-journal')) $('#btn-pdf-journal').disabled = true;
    }
  };

  $('#btn-gen-journal')?.addEventListener('click', generate);

  $('#btn-exp-journal')?.addEventListener('click', () => {
    if (!lastRows.length || !lastMeta) return;

    // Group rows for Excel
    const xlsGroups = [];
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
        xlsGroups.push(currentGroup);
      }
      currentGroup.lines.push(r);
      currentGroup.totalDeb += r.debito;
      currentGroup.totalCre += r.credito;
    }

    const exportRows = [];
    xlsGroups.forEach(g => {
      // Document header row
      exportRows.push({
        fecha: \`\${g.fecha} | \${g.comprobante} | \${g.tercero}\`,
        comprobante: '',
        descripcion: g.descripcion,
        tercero: '',
        cuenta: 'CABECERA DOCUMENTO',
        debito: '',
        credito: '',
        isBold: true
      });
      // Document lines
      g.lines.forEach(l => {
        exportRows.push({
          fecha: '',
          comprobante: '',
          descripcion: l.descripcion !== g.descripcion ? l.descripcion : '',
          tercero: '',
          cuenta: l.cuenta,
          debito: l.debito,
          credito: l.credito,
          isBold: false
        });
      });
      // Document subtotal row
      exportRows.push({
        fecha: '',
        comprobante: '',
        descripcion: \`Subtotal \${g.comprobante}\`,
        tercero: '',
        cuenta: '',
        debito: g.totalDeb,
        credito: g.totalCre,
        isBold: true
      });
    });

    // Grand total
    exportRows.push({
      fecha: 'TOTAL GENERAL',
      comprobante: '',
      descripcion: '',
      tercero: '',
      cuenta: '',
      debito: lastMeta.totalDeb,
      credito: lastMeta.totalCre,
      isBold: true
    });

    exportToExcel(exportRows, [
      { key: 'fecha', label: 'Fecha / Cabecera' },
      { key: 'comprobante', label: 'Comp.' },
      { key: 'descripcion', label: 'Descripcion' },
      { key: 'tercero', label: 'Tercero' },
      { key: 'cuenta', label: 'Cuenta' },
      { key: 'debito', label: 'Debito' },
      { key: 'credito', label: 'Credito' },
    ], \`libro_diario_\${lastMeta.fromMonth}_a_\${lastMeta.toMonth}\`);
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
          \`Periodo mensual: \${lastMeta.fromMonth} a \${lastMeta.toMonth}\`,
          \`Tipo de transaccion: \${selectedType ? \`\${selectedType.code || ''} - \${selectedType.name || ''}\` : 'Todos'}\`,
        ],
      });

      // Group rows for PDF
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

      const body = [];
      pdfGroups.forEach(g => {
        // Document Header Row
        body.push([
          { content: \`\${g.fecha} | \${g.comprobante} | \${g.tercero}\`, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
          { content: g.descripcion, colSpan: 3, styles: { fontStyle: 'normal', textColor: [100, 100, 100], fillColor: [249, 250, 251] } }
        ]);
        // Document Lines
        g.lines.forEach(l => {
          body.push([
            '',
            '',
            l.descripcion !== g.descripcion ? l.descripcion : '',
            '',
            l.cuenta,
            fmtPdfNum(l.debito),
            fmtPdfNum(l.credito)
          ]);
        });
        // Subtotal row
        body.push([
          { content: \`Subtotal \${g.comprobante}\`, colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [243, 244, 246] } },
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

      doc.save(\`libro_diario_\${lastMeta.fromMonth}_\${lastMeta.toMonth}.pdf\`);
    } catch (err) {
      showToast(\`Error al generar PDF: \${err.message}\`, 'error');
    }
  });
}
`;

content = content.substring(0, startIndex) + newJournalContent + content.substring(endIndex);

// Restore original line endings
if (originalEnding === '\r\n') {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Journal Book layout patched successfully!");
