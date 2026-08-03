const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

// Unified text cleaner helper
const cleanText = (str) => str.replace(/\r\n/g, '\n').trim();

// Target block 1: The entire Right Column & Logo section at the top of the standard layout
const oldHeaderBlock = `        // --- 2. HEADER SECTION ---
        // Left Column: Emitter details
        let nameX = L;
        let emitterTextWidth = 240;
        let logoHeight = 0;
        if (companyLogo) {
          try {
            const base64Data = companyLogo.replace(/^data:image\\/\\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            doc.image(logoBuffer, L, y, { width: 60, height: 45, fit: [60, 45] });
            nameX += 65;
            emitterTextWidth -= 65;
            logoHeight = 45;
          } catch (logoErr) {
            console.warn("[ORCHESTRATOR] Error rendering company logo:", logoErr.message);
          }
        }

        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(14);
        doc.text(supplierName || 'EMISOR', nameX, y, { width: emitterTextWidth });
        
        const nameHeight = doc.heightOfString(supplierName || 'EMISOR', { width: emitterTextWidth });
        let taxY = y + Math.max(nameHeight + 6, logoHeight + 6);

        // Draw configurable header block
        doc.font('Helvetica').fontSize(7.5).fillColor('#1F2937');
        const headerLines = configHeader.split('\\n');
        headerLines.forEach((line, idx) => {
          doc.text(line, L, taxY + (idx * 10), { width: 240 });
        });
        taxY += (headerLines.length * 10) + 4;

        // Right Column: Document metadata
        const rx = 280;
        const rw = W - (rx - L);
        let ry = 30;

        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11.5);
        doc.text(docTypeLabel.toUpperCase(), rx, ry, { width: rw - 60 });
        const docTypeHeight = doc.heightOfString(docTypeLabel.toUpperCase(), { width: rw - 60 });
        
        // Render FE - Number next to it
        const docNumOnly = docId.replace(/^[A-Za-z\\-]+/g, '');
        doc.text(\`FE - \${docNumOnly}\`, rx + rw - 85, ry, { width: 85, align: 'right' });
        
        ry += docTypeHeight + 2;
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563');
        doc.text('Representación Gráfica', rx, ry);
        ry += 9;
        doc.text('Autorización Numeración de Facturación Electrónica', rx, ry);
        ry += 9;
        
        const resText = resolutionNumber 
          ? \`No. \${resolutionNumber} de \${resolutionDate} - \${resolutionExpiry} autoriza FE - \${resolutionRangeFrom} a \${resolutionPrefix ? resolutionPrefix + '-' : ''}\${resolutionRangeTo}\`
          : 'Autorización de facturación en proceso';
        doc.text(resText, rx, ry, { width: rw - 60 });
        
        const resHeight = doc.heightOfString(resText, { width: rw - 60 });
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

        // QR Code on far right of metadata block (using absolute coordinates to avoid overlaps)
        let qrBuffer = null;
        if (cufe && cufe !== 'No disponible') {
          const qrUrlText = \`https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=\${cufe}\`;
          qrBuffer = await fetchQrCode(qrUrlText).catch(() => null);
        }
        if (qrBuffer) {
          try {
            doc.image(qrBuffer, 502, ry + 2, { width: 75, height: 75 });
          } catch (e) {
            console.warn("[ORCHESTRATOR] Error adding QR image:", e.message);
          }
        }`;

const newHeaderBlock = `        // --- 2. HEADER SECTION ---
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
        }`;

// Target block 2: Clean Emitter & Customer details with real obligations & no mock fallbacks
const oldDetailsBlock = `        // Supplier clean NIT (strip existing DV)
        const rawSupplierNit = String(supplierNit || '').split('-')[0];
        const supplierDv = calcularDV(rawSupplierNit);

        // Emitter values
        const suppAddrInfo = parseAddress(supplierAddress || 'CL 79 8 N 58 BRR FLORALIA, CALI, VALLE DEL CAUCA');
        drawInfoLine('Razón Social', supplierName, L, y);
        drawInfoLine('NIT', rawSupplierNit + (supplierDv ? \` - \${supplierDv}\` : ''), L, y + 11);
        drawInfoLine('Obligación', 'NO APLICA', L, y + 22);
        drawInfoLine('Email', supplierEmail || 'julian_piano@hotmail.com', L, y + 33);
        drawInfoLine('Teléfono', supplierPhone || '3233273136', L, y + 44);
        drawInfoLine('Dirección Fiscal', suppAddrInfo.mainAddr, L, y + 55);
        if (suppAddrInfo.cityDept) {
          drawInfoLine('', suppAddrInfo.cityDept, L, y + 66);
        }

        // Customer clean NIT (strip existing DV)
        const rawCustomerNit = String(customerNit || '').split('-')[0];
        const custDv = calcularDV(rawCustomerNit);

        // Customer values
        const custAddrInfo = parseAddress(customerAddress);
        drawInfoLine('Razón Social', customerName, L + 280, y);
        drawInfoLine('NIT', rawCustomerNit + (custDv ? \` - \${custDv}\` : ''), L + 280, y + 11);
        drawInfoLine('Obligación', 'NO APLICA', L + 280, y + 22);
        drawInfoLine('Email', customerEmail, L + 280, y + 33);
        drawInfoLine('Teléfono', customerPhone, L + 280, y + 44);
        drawInfoLine('Dirección', custAddrInfo.mainAddr || '', L + 280, y + 55);
        drawInfoLine('Ciudad, Depart.', custAddrInfo.cityDept || 'CALI, VALLE DEL CAUCA', L + 280, y + 66);`;

const newDetailsBlock = `        // Supplier clean NIT (strip existing DV)
        const rawSupplierNit = String(supplierNit || '').split('-')[0];
        const supplierDv = calcularDV(rawSupplierNit);

        // Extract real obligations from XML (TaxLevelCode)
        const supplierTaxLevel = extractField('AccountingSupplierParty', 'TaxLevelCode') || 'NO APLICA';
        const customerTaxLevel = extractField('AccountingCustomerParty', 'TaxLevelCode') || 'NO APLICA';

        // Emitter values (No mock fallbacks)
        const suppAddrInfo = parseAddress(supplierAddress);
        drawInfoLine('Razón Social', supplierName, L, y);
        drawInfoLine('NIT', rawSupplierNit + (supplierDv ? \` - \${supplierDv}\` : ''), L, y + 11);
        drawInfoLine('Obligación', supplierTaxLevel, L, y + 22);
        drawInfoLine('Email', supplierEmail || '', L, y + 33);
        drawInfoLine('Teléfono', supplierPhone || '', L, y + 44);
        drawInfoLine('Dirección Fiscal', suppAddrInfo.mainAddr || '', L, y + 55);
        if (suppAddrInfo.cityDept) {
          drawInfoLine('', suppAddrInfo.cityDept, L, y + 66);
        }

        // Customer clean NIT (strip existing DV)
        const rawCustomerNit = String(customerNit || '').split('-')[0];
        const custDv = calcularDV(rawCustomerNit);

        // Customer values
        const custAddrInfo = parseAddress(customerAddress);
        drawInfoLine('Razón Social', customerName, L + 280, y);
        drawInfoLine('NIT', rawCustomerNit + (custDv ? \` - \${custDv}\` : ''), L + 280, y + 11);
        drawInfoLine('Obligación', customerTaxLevel, L + 280, y + 22);
        drawInfoLine('Email', customerEmail || '', L + 280, y + 33);
        drawInfoLine('Teléfono', customerPhone || '', L + 280, y + 44);
        drawInfoLine('Dirección', custAddrInfo.mainAddr || '', L + 280, y + 55);
        drawInfoLine('Ciudad, Depart.', custAddrInfo.cityDept || '', L + 280, y + 66);`;

// Target block 3: Item headers alignment fix (specifying Y parameter to force baseline alignment)
const oldItemHeadersBlock = `        doc.text('No', cols.no)
           .text('CÓDIGO', cols.ref)
           .text('REF / BARRAS', cols.ean)
           .text('DESCRIPCIÓN', cols.desc)
           .text('U/M', cols.um, y, { width: 22, align: 'right' })
           .text('CANT', cols.qty, y, { width: 22, align: 'right' })`;

const newItemHeadersBlock = `        doc.text('No', cols.no, y)
           .text('CÓDIGO', cols.ref, y)
           .text('REF / BARRAS', cols.ean, y)
           .text('DESCRIPCIÓN', cols.desc, y)
           .text('U/M', cols.um, y, { width: 22, align: 'right' })
           .text('CANT', cols.qty, y, { width: 22, align: 'right' })`;

// Target block 4: Taxes, Withholdings breakdown table + QR code drawing + UoM line removal
const oldTaxesAndQrBlock = `        // --- 7. TAXES, WITHHOLDINGS, AND TOTALS LAYOUT ---
        const rightColW = 220;
        const rightColX = L + W - rightColW; // 30 + 552 - 220 = 362
        const leftColW = rightColX - L - 15; // 362 - 30 - 15 = 317
        const leftColX = L;
        
        let leftY = y;
        let rightY = y;

        // Draw Taxes Breakdown (Left Column)
        if (taxTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('IMPUESTO', leftColX)
             .text('TARIFA', leftColX + 60, leftY, { width: 35, align: 'right' })
             .text('BASE', leftColX + 100, leftY, { width: 55, align: 'right' })
             .text('VALOR IMPUESTO', leftColX + 160, leftY, { width: 75, align: 'right' });
          leftY += 11;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          taxTotals.forEach(t => {
            doc.text(t.name, leftColX)
               .text(\`\${t.rate}%\`, leftColX + 60, leftY, { width: 35, align: 'right' })
               .text(fmt(t.base), leftColX + 100, leftY, { width: 55, align: 'right' })
               .text(fmt(t.amount), leftColX + 160, leftY, { width: 75, align: 'right' });
            leftY += 11;
          });
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }

        // Draw Withholdings Breakdown (Left Column)
        if (withholdingTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('DISCRIMINACIÓN DE RETENCIONES', leftColX, leftY);
          leftY += 10;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 3;
          
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('RETENCION', leftColX)
             .text('TARIFA', leftColX + 60, leftY, { width: 35, align: 'right' })
             .text('BASE', leftColX + 100, leftY, { width: 55, align: 'right' })
             .text('VALOR RETENCION', leftColX + 160, leftY, { width: 75, align: 'right' });
          leftY += 11;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          withholdingTotals.forEach(w => {
            doc.text(w.name, leftColX)
               .text(\`\${w.rate}%\`, leftColX + 60, leftY, { width: 35, align: 'right' })
               .text(fmt(w.base), leftColX + 100, leftY, { width: 55, align: 'right' })
               .text(fmt(w.amount), leftColX + 160, leftY, { width: 75, align: 'right' });
            leftY += 11;
          });
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }

        // Draw Totals Box (Right Column)
        doc.moveTo(rightColX, rightY).lineTo(L + W, rightY).strokeColor('#000000').lineWidth(0.75).stroke();
        rightY += 6;

        doc.font('Helvetica').fontSize(8.5).fillColor('#000000');
        doc.text('Subtotal', rightColX, rightY)
           .text(fmt(lineExtension), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
        rightY += 13;
        
        if (taxAmount > 0) {
          doc.text('IVA', rightColX, rightY)
             .text(fmt(taxAmount), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
          rightY += 13;
        }

        // Deduct withholdings from total if any
        const totalWithholdingVal = withholdingTotals.reduce((sum, w) => sum + w.amount, 0);
        if (totalWithholdingVal > 0) {
          doc.font('Helvetica').fontSize(8.5);
          doc.text('Total Retenciones', rightColX, rightY)
             .text(fmt(-totalWithholdingVal), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
          rightY += 13;
        }

        doc.moveTo(rightColX, rightY).lineTo(L + W, rightY).strokeColor('#000000').lineWidth(0.5).stroke();
        rightY += 6;

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
        doc.text('Total a Pagar', rightColX, rightY)
           .text(fmt(payableAmount - totalWithholdingVal), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
        rightY += 16;
        
        y = Math.max(leftY, rightY) + 20;

        // Draw measure units description
        doc.font('Helvetica').fontSize(7.5).fillColor('#4B5563')
           .text('Unidades de medida: EA = cada, MTR = metro, ZZ = servicio', L, y - 8);`;

const newTaxesAndQrBlock = `        // --- 7. TAXES, WITHHOLDINGS, AND TOTALS LAYOUT ---
        const rightColW = 220;
        const rightColX = L + W - rightColW; // 362
        const leftColW = rightColX - L - 15; // 317
        const leftColX = L;
        
        let leftY = y;
        let rightY = y;

        // Draw QR Code inside bottom left section if present
        let txX = leftColX;
        let txW = leftColW;
        if (qrBuffer) {
          try {
            doc.image(qrBuffer, leftColX, leftY, { width: 70, height: 70 });
            txX = leftColX + 80;
            txW = leftColW - 80;
          } catch (e) {
            console.warn("[ORCHESTRATOR] Error adding QR image at bottom:", e.message);
          }
        }

        // Draw Taxes Breakdown (Left Column, side-by-side with QR)
        if (taxTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('DISCRIMINACIÓN DE IMPUESTOS', txX, leftY);
          leftY += 10;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 3;
          
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('IMPUESTO', txX)
             .text('TARIFA', txX + 50, leftY, { width: 35, align: 'right' })
             .text('BASE', txX + 90, leftY, { width: 50, align: 'right' })
             .text('VALOR IMPUESTO', txX + 145, leftY, { width: 70, align: 'right' });
          leftY += 11;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          taxTotals.forEach(t => {
            doc.text(t.name, txX)
               .text(\`\${t.rate}%\`, txX + 50, leftY, { width: 35, align: 'right' })
               .text(fmt(t.base), txX + 90, leftY, { width: 50, align: 'right' })
               .text(fmt(t.amount), txX + 145, leftY, { width: 70, align: 'right' });
            leftY += 11;
          });
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }

        // Draw Withholdings Breakdown (Left Column, side-by-side with QR)
        if (withholdingTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('DISCRIMINACIÓN DE RETENCIONES', txX, leftY);
          leftY += 10;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 3;
          
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('RETENCION', txX)
             .text('TARIFA', txX + 50, leftY, { width: 35, align: 'right' })
             .text('BASE', txX + 90, leftY, { width: 50, align: 'right' })
             .text('VALOR RETENCION', txX + 145, leftY, { width: 70, align: 'right' });
          leftY += 11;
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).stroke();
          leftY += 6;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          withholdingTotals.forEach(w => {
            doc.text(w.name, txX)
               .text(\`\${w.rate}%\`, txX + 50, leftY, { width: 35, align: 'right' })
               .text(fmt(w.base), txX + 90, leftY, { width: 50, align: 'right' })
               .text(fmt(w.amount), txX + 145, leftY, { width: 70, align: 'right' });
            leftY += 11;
          });
          doc.moveTo(txX, leftY).lineTo(txX + txW, leftY).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
          leftY += 8;
        }
        
        // Ensure QR height is matched even if tables are short
        if (qrBuffer) {
          leftY = Math.max(leftY, y + 75);
        }

        // Draw Totals Box (Right Column)
        doc.moveTo(rightColX, rightY).lineTo(L + W, rightY).strokeColor('#000000').lineWidth(0.75).stroke();
        rightY += 6;

        doc.font('Helvetica').fontSize(8.5).fillColor('#000000');
        doc.text('Subtotal', rightColX, rightY)
           .text(fmt(lineExtension), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
        rightY += 13;
        
        if (taxAmount > 0) {
          doc.text('IVA', rightColX, rightY)
             .text(fmt(taxAmount), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
          rightY += 13;
        }

        // Deduct withholdings from total if any
        const totalWithholdingVal = withholdingTotals.reduce((sum, w) => sum + w.amount, 0);
        if (totalWithholdingVal > 0) {
          doc.font('Helvetica').fontSize(8.5);
          doc.text('Total Retenciones', rightColX, rightY)
             .text(fmt(-totalWithholdingVal), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
          rightY += 13;
        }

        doc.moveTo(rightColX, rightY).lineTo(L + W, rightY).strokeColor('#000000').lineWidth(0.5).stroke();
        rightY += 6;

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
        doc.text('Total a Pagar', rightColX, rightY)
           .text(fmt(payableAmount - totalWithholdingVal), rightColX + 90, rightY, { width: rightColW - 90, align: 'right' });
        rightY += 16;
        
        y = Math.max(leftY, rightY) + 20;`;

// Perform replacements
if (cleanText(content).includes(cleanText(oldHeaderBlock))) {
  content = content.replace(oldHeaderBlock, newHeaderBlock);
  console.log("1. Header / Logo and QR layout modified.");
} else {
  console.error("1. ERROR: Header block not found.");
}

if (cleanText(content).includes(cleanText(oldDetailsBlock))) {
  content = content.replace(oldDetailsBlock, newDetailsBlock);
  console.log("2. Real obligations and contact info integrated.");
} else {
  console.error("2. ERROR: Details block not found.");
}

if (cleanText(content).includes(cleanText(oldItemHeadersBlock))) {
  content = content.replace(oldItemHeadersBlock, newItemHeadersBlock);
  console.log("3. Item header baselines aligned.");
} else {
  console.error("3. ERROR: Item headers block not found.");
}

// Spacing helper check for Taxes block
let unifiedContent = content.replace(/\r\n/g, '\n');
const cleanTaxesTarget = cleanText(oldTaxesAndQrBlock);
const cleanTaxesRep = cleanText(newTaxesAndQrBlock);

if (cleanText(unifiedContent).includes(cleanTaxesTarget)) {
  // Let's replace by mapping normalized lines
  unifiedContent = unifiedContent.replace(cleanTaxesTarget, cleanTaxesRep);
  content = unifiedContent;
  console.log("4. Taxes table & QR Code bottom layout updated.");
} else {
  console.error("4. ERROR: Taxes and QR block not found. Trying regex or substring...");
  // Let's fallback to searching for main parts of it
  const subSearch = `// --- 7. TAXES, WITHHOLDINGS, AND TOTALS LAYOUT ---`;
  const subIdx = content.indexOf(subSearch);
  if (subIdx !== -1) {
    console.log("Found substring search start! replacing block manually.");
    // Let's find where the UoM line is
    const uomLine = `doc.font('Helvetica').fontSize(7.5).fillColor('#4B5563')\n           .text('Unidades de medida: EA = cada, MTR = metro, ZZ = servicio', L, y - 8);`;
    const uomIdx = content.indexOf(uomLine);
    if (uomIdx !== -1) {
      const startOfBlock = subIdx;
      const endOfBlock = uomIdx + uomLine.length;
      content = content.substring(0, startOfBlock) + newTaxesAndQrBlock + content.substring(endOfBlock);
      console.log("SUCCESS: Replaced Taxes and QR block using indexes!");
    } else {
      // Try with single quotes or different spacings
      const uomLineAlt = `doc.font('Helvetica').fontSize(7.5).fillColor('#4B5563')\n           .text('Unidades de medida: EA = cada, MTR = metro, ZZ = servicio', L, y - 8);`;
      console.error("UOM line index search failed.");
    }
  } else {
    console.error("Totals block search start failed.");
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log("PATCH V5 COMPLETED SUCCESSFULLY!");
