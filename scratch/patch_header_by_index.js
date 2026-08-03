const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

const startTag = `// --- 2. HEADER SECTION ---`;
const endTag = `// --- 3. DIVIDER ---`;

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag);

if (startIdx !== -1 && endIdx !== -1) {
  const newHeaderBlock = `// --- 2. HEADER SECTION ---
        // Left Column: Emitter details (Full width layout without top-left logo)
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(14);
        doc.text(supplierName || 'EMISOR', L, y, { width: 240 });
        
        const nameHeight = doc.heightOfString(supplierName || 'EMISOR', { width: 240 });
        let taxY = y + nameHeight + 6;

        // Draw configurable header block
        doc.font('Helvetica').fontSize(7.5).fillColor('#1F2937');
        const headerLines = configHeader.split('\\n');
        headerLines.forEach((line, idx) => {
          doc.text(line, L, taxY + (idx * 10), { width: 240 });
        });
        taxY += (headerLines.length * 10) + 4;

        // Right Column: Document metadata
        const rx = 280;
        const rw = W - (rx - L); // 302pt width
        let ry = 30;

        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11.5);
        doc.text(docTypeLabel.toUpperCase(), rx, ry, { width: rw - 85 });
        const docTypeHeight = doc.heightOfString(docTypeLabel.toUpperCase(), { width: rw - 85 });
        
        const docNumOnly = docId.replace(/^[A-Za-z\\-]+/g, '');
        doc.text(\`FE - \${docNumOnly}\`, rx + rw - 90, ry, { width: 90, align: 'right' });
        
        ry += docTypeHeight + 2;
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563');
        doc.text('Representación Gráfica', rx, ry);
        ry += 9;
        doc.text('Autorización Numeración de Facturación Electrónica', rx, ry);
        ry += 9;
        
        const resText = resolutionNumber 
          ? \`No. \${resolutionNumber} de \${resolutionDate} - \${resolutionExpiry} autoriza FE - \${resolutionRangeFrom} a \${resolutionPrefix ? resolutionPrefix + '-' : ''}\${resolutionRangeTo}\`
          : 'Autorización de facturación en proceso';
        doc.text(resText, rx, ry, { width: rw - 85 });
        
        const resHeight = doc.heightOfString(resText, { width: rw - 85 });
        ry += Math.max(resHeight + 6, 18);

        // Metadata grid (Using safe non-overlapping positions)
        const drawMetaLine = (label, val, yPos) => {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1F2937').text(label, 280, yPos, { width: 100 });
          doc.font('Helvetica').fontSize(7.5).fillColor('#1F2937').text(val, 385, yPos, { width: 110, align: 'right' });
        };
        
        const fmtDate = (d) => {
          if (!d) return '';
          return d.slice(0, 10) + ' ' + (d.split(' ')[1] || '00:00').slice(0, 5);
        };

        const genDateStr = fmtDate(issueDate) || new Date().toISOString().slice(0, 10);
        const paymentModeStr = paymentMethod === 'CREDITO' ? 'Crédito' : 'Contado';
        const paymentDetailStr = paymentMethod === 'CREDITO' ? 'Acuerdo mutuo' : (paymentMethod || 'Consignación bancaria');

        drawMetaLine('Tipo de Operación', 'Estandar', ry);
        drawMetaLine('Fecha de Generación', genDateStr, ry + 10);
        drawMetaLine('Fecha de Vencimiento', genDateStr, ry + 20);
        drawMetaLine('Fecha de Validación', genDateStr, ry + 30);
        drawMetaLine('Forma de Pago', paymentModeStr, ry + 40);
        drawMetaLine('Medio de Pago', paymentDetailStr, ry + 50);
        drawMetaLine('Moneda', 'COP', ry + 60);

        // Logo occupies top-right block (replaces old QR code position)
        if (companyLogo) {
          try {
            const base64Data = companyLogo.replace(/^data:image\\/\\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            doc.image(logoBuffer, 502, ry + 2, { width: 75, height: 75, fit: [75, 75] });
          } catch (logoErr) {
            console.warn("[ORCHESTRATOR] Error rendering company logo:", logoErr.message);
          }
        }

        // Fetch bottom QR Code buffer
        let qrBuffer = null;
        if (cufe && cufe !== 'No disponible') {
          const qrUrlText = \`https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=\${cufe}\`;
          qrBuffer = await fetchQrCode(qrUrlText).catch(() => null);
        }
        
        `;

  content = content.substring(0, startIdx) + newHeaderBlock + content.substring(endIdx);
  fs.writeFileSync(path, content, 'utf8');
  console.log("SUCCESS: Header replaced using indices!");
} else {
  console.error("ERROR: Header start/end comments not found!");
}
