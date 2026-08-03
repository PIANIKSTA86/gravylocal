const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

const content = fs.readFileSync(path, 'utf8');

const newBlock = `      } else {
        // --- High-fidelity minimalist black & white layout matching FE4.pdf ---
        const W     = doc.page.width - 60; // 552pt usable width for Letter size (612x792)
        const L     = 30; // left margin
        let y       = 30; // top margin

        // DV calculation helper
        const calcularDV = (nit) => {
          const cleanNit = String(nit || '').replace(/[^0-9]/g, '');
          if (!cleanNit) return '';
          const pesos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
          let suma = 0;
          const len = cleanNit.length;
          for (let i = 0; i < len; i++) {
            const digito = parseInt(cleanNit.charAt(len - 1 - i), 10);
            suma += digito * pesos[i];
          }
          const residuo = suma % 11;
          return String(residuo > 1 ? 11 - residuo : residuo);
        };

        // Address parser helper to separate main address from city/department
        const parseAddress = (addr) => {
          const parts = String(addr || '').split(',');
          if (parts.length >= 3) {
            const mainAddr = parts.slice(0, parts.length - 2).join(',').trim();
            const city = parts[parts.length - 2].trim();
            const dept = parts[parts.length - 1].trim();
            return { mainAddr, cityDept: \`\${city}, \${dept}\` };
          }
          return { mainAddr: addr, cityDept: '' };
        };

        // --- 1. HEADER SECTION ---
        // Left Column: Emitter details
        let nameX = L;
        let emitterTextWidth = 230;
        if (companyLogo) {
          try {
            const base64Data = companyLogo.replace(/^data:image\\/\\w+;base64,/, "");
            const logoBuffer = Buffer.from(base64Data, 'base64');
            doc.image(logoBuffer, L, y, { width: 55 });
            nameX += 65;
            emitterTextWidth -= 65;
          } catch (logoErr) {
            console.warn("[ORCHESTRATOR] Error rendering company logo:", logoErr.message);
          }
        }

        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(15);
        doc.text(supplierName || 'EMISOR', nameX, y, { width: emitterTextWidth + 60 });
        
        const nameHeight = doc.heightOfString(supplierName || 'EMISOR', { width: emitterTextWidth + 60 });
        let taxY = y + nameHeight + 6;

        doc.font('Helvetica').fontSize(7.5).fillColor('#1F2937');
        doc.text('Actividad Económica Principal 6201', nameX, taxY);
        doc.text('No somos Gran Contribuyente', nameX, taxY + 10);
        doc.text('No somos Agente Retenedor del Impuesto sobre las Ventas - IVA', nameX, taxY + 20);
        doc.text('No somos Autorretenedor del Impuesto sobre la Renta y Complementarios', nameX, taxY + 30);

        // Right Column: Document metadata
        const rx = 280;
        const rw = W - (rx - L);
        let ry = 30;

        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(13.5);
        doc.text(docTypeLabel.toUpperCase(), rx, ry, { width: rw - 90 });
        
        // Render FE - Number next to it
        const docNumOnly = docId.replace(/^[A-Za-z\\-]+/g, '');
        doc.text(\`FE - \${docNumOnly}\`, rx + rw - 85, ry, { width: 85, align: 'right' });
        
        ry += 15;
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563');
        doc.text('Representación Gráfica', rx, ry);
        ry += 9;
        doc.text('Autorización Numeración de Facturación Electrónica', rx, ry);
        ry += 9;
        
        const resText = resolutionNumber 
          ? \`No. \${resolutionNumber} de \${resolutionDate} - \${resolutionExpiry} autoriza FE - \${resolutionRangeFrom} a \${resolutionPrefix ? resolutionPrefix + '-' : ''}\${resolutionRangeTo}\`
          : 'Autorización de facturación en proceso';
        doc.text(resText, rx, ry, { width: rw - 90 });
        
        const resHeight = doc.heightOfString(resText, { width: rw - 90 });
        ry += Math.max(resHeight + 6, 18);

        // Metadata grid
        const drawMetaLine = (label, val, yPos) => {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1F2937').text(label, rx, yPos);
          doc.font('Helvetica').text(val, rx + 100, yPos, { width: rw - 190, align: 'right' });
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

        // QR Code on far right of metadata block
        let qrBuffer = null;
        if (cufe && cufe !== 'No disponible') {
          const qrUrlText = \`https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=\${cufe}\`;
          qrBuffer = await fetchQrCode(qrUrlText).catch(() => null);
        }
        if (qrBuffer) {
          try {
            doc.image(qrBuffer, rx + rw - 75, ry + 2, { width: 75, height: 75 });
          } catch (e) {
            console.warn("[ORCHESTRATOR] Error adding QR image:", e.message);
          }
        }

        // --- 2. DIVIDER ---
        y = Math.max(taxY + 45, ry + 78);
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 8;

        // --- 3. EMITTER & CUSTOMER DETAILS SECTION ---
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000');
        doc.text('DATOS DEL EMISOR', L, y, { width: 260, align: 'center' });
        doc.text('DATOS DEL CLIENTE', L + 280, y, { width: 260, align: 'center' });
        
        y += 12;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        
        // Vertical Divider line between Emitter and Customer details
        const detailsBoxHeight = 88;
        doc.moveTo(L + 270, y - 12).lineTo(L + 270, y + detailsBoxHeight).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        
        y += 6;

        const drawInfoLine = (label, val, xOffset, yOffset) => {
          doc.font('Helvetica').fontSize(8).fillColor('#000000').text(label, xOffset, yOffset, { width: 85 });
          doc.font('Helvetica').fontSize(8).fillColor('#1F2937').text(val || '', xOffset + 90, yOffset, { width: 170 });
        };

        // Supplier clean NIT (strip existing DV)
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
        drawInfoLine('Ciudad, Depart.', custAddrInfo.cityDept || 'CALI, VALLE DEL CAUCA', L + 280, y + 66);

        y += detailsBoxHeight + 8;

        // --- 4. ITEMS TABLE HEADER ---
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 2.5;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 5;

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
        const cols = {
          no: L,
          ref: L + 20,
          desc: L + 70,
          qty: L + 280,
          um: L + 315,
          price: L + 350,
          imp: L + 425,
          subtotal: L + 455,
          total: L + 500
        };

        doc.text('No', cols.no)
           .text('REF', cols.ref)
           .text('DESCRIPCIÓN', cols.desc)
           .text('CANT', cols.qty, y, { width: 30, align: 'right' })
           .text('U/M', cols.um, y, { width: 25, align: 'right' })
           .text('PRECIO', cols.price, y, { width: 65, align: 'right' })
           .text('IMP', cols.imp, y, { width: 25, align: 'right' })
           .text('SUBTOTAL', cols.subtotal, y, { width: 45, align: 'right' })
           .text('TOTAL ITEM', cols.total, y, { width: 50, align: 'right' });
        
        y += 11;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 7;

        // --- 5. ITEMS ROWS ---
        doc.font('Helvetica').fontSize(8).fillColor('#1F2937');
        let lineExtension = 0;
        let taxAmount = 0;
        
        lines.forEach((line, idx) => {
          const lineSubtotal = (line.qty || 0) * (line.unitPrice || 0);
          lineExtension += lineSubtotal;
          taxAmount += (line.lineTotal || 0) - lineSubtotal;

          if (y > doc.page.height - 120) {
            doc.addPage();
            y = 40;
            
            // Repeat Header on new page
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
            y += 2.5;
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
            y += 5;
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
            doc.text('No', cols.no).text('REF', cols.ref).text('DESCRIPCIÓN', cols.desc)
               .text('CANT', cols.qty, y, { width: 30, align: 'right' }).text('U/M', cols.um, y, { width: 25, align: 'right' })
               .text('PRECIO', cols.price, y, { width: 65, align: 'right' }).text('IMP', cols.imp, y, { width: 25, align: 'right' })
               .text('SUBTOTAL', cols.subtotal, y, { width: 45, align: 'right' }).text('TOTAL ITEM', cols.total, y, { width: 50, align: 'right' });
            y += 11;
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
            y += 7;
            doc.font('Helvetica').fontSize(8).fillColor('#1F2937');
          }

          const descHeight = doc.heightOfString(line.desc, { width: 200 });
          
          doc.text(String(idx + 1), cols.no)
             .text(line.code || '—', cols.ref)
             .text(line.desc, cols.desc, y, { width: 200 })
             .text(String(line.qty), cols.qty, y, { width: 30, align: 'right' })
             .text('EA', cols.um, y, { width: 25, align: 'right' })
             .text(fmt(line.unitPrice), cols.price, y, { width: 65, align: 'right' })
             .text(line.ivaRate ? \`\%s\` : '', cols.imp, y, { width: 25, align: 'right' })
             .text(fmt(lineSubtotal), cols.subtotal, y, { width: 45, align: 'right' })
             .text(fmt(line.lineTotal), cols.total, y, { width: 50, align: 'right' });

          y += Math.max(descHeight + 5, 14);
        });

        // Table Bottom line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 8;

        // --- 6. TOTALS SECTION ---
        const totalW = 250;
        const totalX = L + W - totalW;
        
        doc.moveTo(totalX, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 6;

        doc.font('Helvetica').fontSize(8.5).fillColor('#000000');
        doc.text('Subtotal', totalX, y)
           .text(fmt(lineExtension), totalX + 100, y, { width: totalW - 100, align: 'right' });
        y += 13;
        
        doc.moveTo(totalX, y).lineTo(L + W, y).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        y += 6;

        doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000');
        doc.text('Total a Pagar', totalX, y)
           .text(fmt(payableAmount), totalX + 100, y, { width: totalW - 100, align: 'right' });
        
        // Measure units label on the left side of totals
        doc.font('Helvetica').fontSize(7.5).fillColor('#4B5563')
           .text('Unidades de medida: EA = cada', L, y - 8);
        
        y += 35;

        // --- 7. SIGNATURES SECTION ---
        if (y > doc.page.height - 90) {
          doc.addPage();
          y = 50;
        }
        
        const sigLineW = 160;
        const sigL = L + 30;
        const sigR = L + W - sigLineW - 30;

        doc.moveTo(sigL, y).lineTo(sigL + sigLineW, y).strokeColor('#000000').lineWidth(0.5).stroke();
        doc.moveTo(sigR, y).lineTo(sigR + sigLineW, y).stroke();
        
        y += 6;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
        doc.text('FIRMA EMISOR', sigL, y, { width: sigLineW, align: 'center' });
        doc.text('FIRMA CLIENTE', sigR, y, { width: sigLineW, align: 'center' });

        // --- 8. FOOTER SECTION ---
        const pageH = doc.page.height;
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000')
           .text('CUFE: ', L, pageH - 55, { continued: true })
           .font('Helvetica').fontSize(6.5).fillColor('#1F2937')
           .text(cufe, { width: W });
        
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563')
           .text(\`Software DATAICO fabricado por Proveedor Tecnológico DATAICO SAS 901223648\`, L, pageH - 35, { width: W, align: 'center' });

        doc.font('Helvetica').fontSize(7.5).fillColor('#000000')
           .text('PÁGINA 1 / 1', L + W - 60, pageH - 35, { width: 60, align: 'right' });

        doc.end();
      }`;

const regex = /\} else \{\s+const BLUE\s*=\s*'#1A4B8C';[\s\S]*?doc\.end\(\);\s*\}/;

if (!regex.test(content)) {
  console.error("COULD NOT FIND THE TARGET BLOCK IN THE FILE CONTENT!");
  process.exit(1);
}

// Replace format specifier typo: we need `${line.ivaRate}%` instead of `%s`
const fixedBlock = newBlock.replace(/\\`\\%s\\`/g, '\\`\${line.ivaRate}%\\`');

const updatedContent = content.replace(regex, fixedBlock);
fs.writeFileSync(path, updatedContent, 'utf8');
console.log("PATCH APPLIED SUCCESSFULLY!");
