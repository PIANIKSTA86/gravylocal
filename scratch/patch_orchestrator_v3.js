const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

const newElseBlock = `      } else {
        // --- High-fidelity minimalist black & white layout matching FE4.pdf ---
        // Generates the comprehensive legal Colombian invoice format
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

        // SQLite settings loader
        const getSettingFromDb = (key) => {
          return new Promise((res) => {
            try {
              const sqlite3 = require('sqlite3').verbose();
              const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db', sqlite3.OPEN_READONLY);
              db.get("SELECT value FROM settings WHERE key = ?", [key], (err, row) => {
                db.close();
                if (err || !row) res('');
                else res(row.value);
              });
            } catch (_) {
              res('');
            }
          });
        };

        // Fetch configurable texts from settings
        let configHeader = invoiceData && invoiceData.headerText;
        if (!configHeader) {
          configHeader = await getSettingFromDb('invoice_header_text');
        }
        if (!configHeader) {
          configHeader = 'Actividad Económica Principal 6201\\nNo somos Gran Contribuyente\\nNo somos Agente Retenedor del Impuesto sobre las Ventas - IVA\\nNo somos Autorretenedor del Impuesto sobre la Renta y Complementarios';
        }

        let configFooter = invoiceData && invoiceData.footerText;
        if (!configFooter) {
          configFooter = await getSettingFromDb('invoice_footer_text');
        }
        if (!configFooter) {
          configFooter = 'Este documento es la representación gráfica de una Factura Electrónica de Venta generada conforme al Decreto 358 de 2020 y la Resolución 000042 de 2020 de la DIAN. La validez fiscal recae exclusivamente sobre el archivo XML firmado digitalmente.';
        }

        // --- 1. PARSE Rich UBL XML CONTENT ---
        // Always parse UBL XML for legal details (lines, taxes, withholdings)
        docId       = getTag('ID') || (invoiceData && invoiceData.docId) || filename;
        issueDate   = getTag('IssueDate') || (invoiceData && invoiceData.issueDate) || '';
        issueTime   = getTag('IssueTime') || (invoiceData && invoiceData.issueTime) || '';
        cufe        = getTag('UUID') || (invoiceData && invoiceData.cufe) || 'No disponible';
        
        const docTypeRaw  = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceTypeCode(?:\\s[^>]*)?>(.*?)<\\/(?:[a-zA-Z0-9_-]+:)?InvoiceTypeCode>/i);
        const docTypeCode = docTypeRaw ? stripTags(docTypeRaw[1].trim()) : '';
        const isNC = filename.toUpperCase().includes('NC') || docTypeCode === '91';
        const isND = filename.toUpperCase().includes('ND') || docTypeCode === '92';
        docTypeLabel = isNC ? 'Nota Crédito' : isND ? 'Nota Débito' : 'Factura Electrónica de Venta';

        supplierName = extractField('AccountingSupplierParty', 'RegistrationName') || extractField('AccountingSupplierParty', 'Name') || (invoiceData && invoiceData.supplierName);
        supplierNit = extractField('AccountingSupplierParty', 'CompanyID') || (invoiceData && invoiceData.supplierNit);
        supplierEmail = extractField('AccountingSupplierParty', 'ElectronicMail') || (invoiceData && invoiceData.supplierEmail);
        supplierPhone = extractField('AccountingSupplierParty', 'Telephone') || (invoiceData && invoiceData.supplierPhone);
        supplierAddress = extractField('AccountingSupplierParty', 'Line') || extractField('AccountingSupplierParty', 'AddressLine') || (invoiceData && invoiceData.supplierAddress);

        customerName = extractField('AccountingCustomerParty', 'RegistrationName') || extractField('AccountingCustomerParty', 'Name') || (invoiceData && invoiceData.customerName);
        customerNit = extractField('AccountingCustomerParty', 'CompanyID') || (invoiceData && invoiceData.customerNit);
        customerEmail = extractField('AccountingCustomerParty', 'ElectronicMail') || (invoiceData && invoiceData.customerEmail);
        customerPhone = extractField('AccountingCustomerParty', 'Telephone') || (invoiceData && invoiceData.customerPhone);
        customerAddress = extractField('AccountingCustomerParty', 'Line') || extractField('AccountingCustomerParty', 'AddressLine') || (invoiceData && invoiceData.customerAddress);

        const xmlPayableAmount = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?PayableAmount(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?PayableAmount>/i);
        payableAmount = xmlPayableAmount ? parseFloat(stripTags(xmlPayableAmount[1])) : (invoiceData && invoiceData.payableAmount) || 0;
        
        const xmlTaxAmount = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?TaxTotal>[\\s\\S]*?<(?:[a-zA-Z0-9_-]+:)?TaxAmount(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?TaxAmount>/i);
        taxAmount = xmlTaxAmount ? parseFloat(stripTags(xmlTaxAmount[1])) : 0;
        
        const xmlLineExtension = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?LegalMonetaryTotal>[\\s\\S]*?<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i);
        lineExtension = xmlLineExtension ? parseFloat(stripTags(xmlLineExtension[1])) : 0;

        const authMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?InvoiceAuthorization[^>]*(?:Auto-habilitacion)?>([0-9]+)<\\/(?:[a-zA-Z0-9_-]+:)?InvoiceAuthorization>/i);
        resolutionNumber = authMatch ? authMatch[1] : (invoiceData && invoiceData.resolutionNumber) || '';
        const startMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?StartDate[^>]*>([^<]+)<\\/(?:[a-zA-Z0-9_-]+:)?StartDate>/i);
        resolutionDate = startMatch ? stripTags(startMatch[1]) : (invoiceData && invoiceData.resolutionDate) || '';
        const endMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?EndDate[^>]*>([^<]+)<\\/(?:[a-zA-Z0-9_-]+:)?EndDate>/i);
        resolutionExpiry = endMatch ? stripTags(endMatch[1]) : (invoiceData && invoiceData.resolutionExpiry) || '';
        const fromMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?From[^>]*>([0-9]+)<\\/(?:[a-zA-Z0-9_-]+:)?From>/i);
        resolutionRangeFrom = fromMatch ? fromMatch[1] : (invoiceData && invoiceData.resolutionRangeFrom) || '';
        const toMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?To[^>]*>([0-9]+)<\\/(?:[a-zA-Z0-9_-]+:)?To>/i);
        resolutionRangeTo = toMatch ? toMatch[1] : (invoiceData && invoiceData.resolutionRangeTo) || '';
        const prefixMatch = cleanXml.match(/<(?:[a-zA-Z0-9_-]+:)?Prefix[^>]*>([^<]*)<\\/(?:[a-zA-Z0-9_-]+:)?Prefix>/i);
        resolutionPrefix = prefixMatch ? stripTags(prefixMatch[1]) : (invoiceData && invoiceData.resolutionPrefix) || '';

        // Clean lines array and parse from UBL XML
        lines = [];
        const linePattern = /<(?:[a-zA-Z0-9_-]+:)?(?:Invoice|CreditNote|DebitNote)Line>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?(?:Invoice|CreditNote|DebitNote)Line>/gi;
        let lineMatch;
        while ((lineMatch = linePattern.exec(cleanXml)) !== null) {
          const lineXml = lineMatch[1];
          const desc = stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?Description>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?Description>/i) || [])[1] || '');
          const qty = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity>/i) || [])[1] || '0'));
          const unitPrice = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?PriceAmount(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?PriceAmount>/i) || [])[1] || '0'));
          const lineTotal = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i) || [])[1] || '0'));
          
          const qtyMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?(?:Invoiced|Credited|Debited)Quantity(?:\\s+[^>]*?unitCode="([^"]+)"[^>]*?)?>/i);
          const um = qtyMatch && qtyMatch[1] ? qtyMatch[1] : 'EA';

          const sellerIdMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?SellersItemIdentification>[\\s\\S]*?<(?:[a-zA-Z0-9_-]+:)?ID[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?ID>/i);
          const sellerId = sellerIdMatch ? stripTags(sellerIdMatch[1]) : '—';

          const standardIdMatch = lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?StandardItemIdentification>[\\s\\S]*?<(?:[a-zA-Z0-9_-]+:)?ID[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?ID>/i);
          const standardId = standardIdMatch ? stripTags(standardIdMatch[1]) : '—';

          const allowanceMatch = lineXml.match(/<cac:AllowanceCharge>[\\s\\S]*?<cbc:ChargeIndicator[^>]*>false<\\/cbc:ChargeIndicator>[\\s\\S]*?<cbc:Amount[^>]*>([\\s\\S]*?)<\\/cbc:Amount>/i);
          let discountRate = 0;
          let discountVal = allowanceMatch ? parseFloat(stripTags(allowanceMatch[1])) : 0;
          
          // Try to get discount multiplier factor
          const allowanceBlockMatch = lineXml.match(/<cac:AllowanceCharge>([\\s\\S]*?)<\\/cac:AllowanceCharge>/i);
          if (allowanceBlockMatch) {
            const inner = allowanceBlockMatch[1];
            const rateM = inner.match(/<cbc:MultiplierFactorNumeric[^>]*>([\\s\\S]*?)<\\/cbc:MultiplierFactorNumeric>/i);
            discountRate = rateM ? parseFloat(stripTags(rateM[1])) : 0;
            if (discountRate > 0 && discountRate < 1) discountRate *= 100;
          }

          const taxSubtotalMatch = lineXml.match(/<cac:TaxSubtotal>([\\s\\S]*?)<\\/cac:TaxSubtotal>/i);
          let taxName = 'IVA';
          let taxPercent = 0;
          let taxVal = 0;
          if (taxSubtotalMatch) {
            const taxSubxml = taxSubtotalMatch[1];
            taxPercent = parseFloat(stripTags((taxSubxml.match(/<cbc:Percent[^>]*>([\\s\\S]*?)<\\/cbc:Percent>/i) || [])[1] || '0'));
            taxVal = parseFloat(stripTags((taxSubxml.match(/<cbc:TaxAmount[^>]*>([\\s\\S]*?)<\\/cbc:TaxAmount>/i) || [])[1] || '0'));
            taxName = stripTags((taxSubxml.match(/<cac:TaxScheme>[\\s\\S]*?<cbc:Name[^>]*>([\\s\\S]*?)<\\/cbc:Name>/i) || [])[1] || 'IVA');
          }

          if (desc) {
            lines.push({
              desc,
              code: sellerId,
              standardId,
              qty,
              unitPrice,
              lineTotal,
              ivaRate: taxPercent,
              taxName,
              taxVal,
              discountRate,
              discountVal,
              um
            });
          }
        }

        // Parse Document-level Taxes
        const taxTotals = [];
        const taxTotalPattern = /<cac:TaxTotal>([\\s\\S]*?)<\\/cac:TaxTotal>/gi;
        let taxTotalMatch;
        while ((taxTotalMatch = taxTotalPattern.exec(cleanXml)) !== null) {
          const block = taxTotalMatch[1];
          const subPattern = /<cac:TaxSubtotal>([\\s\\S]*?)<\\/cac:TaxSubtotal>/gi;
          let subMatch;
          while ((subMatch = subPattern.exec(block)) !== null) {
            const subXml = subMatch[1];
            const base = parseFloat(stripTags((subXml.match(/<cbc:TaxableAmount[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || '0'));
            const amount = parseFloat(stripTags((subXml.match(/<cbc:TaxAmount[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || '0'));
            const rate = parseFloat(stripTags((subXml.match(/<cbc:Percent[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || '0'));
            const name = stripTags((subXml.match(/<cac:TaxScheme>[\\s\\S]*?<cbc:Name[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || 'IVA');
            if (amount > 0) {
              taxTotals.push({ name, rate, base, amount });
            }
          }
        }

        // Parse Document-level Withholdings
        const withholdingTotals = [];
        const wTotalPattern = /<cac:WithholdingTaxTotal>([\\s\\S]*?)<\\/cac:WithholdingTaxTotal>/gi;
        let wTotalMatch;
        while ((wTotalMatch = wTotalPattern.exec(cleanXml)) !== null) {
          const block = wTotalMatch[1];
          const subPattern = /<cac:TaxSubtotal>([\\s\\S]*?)<\\/cac:TaxSubtotal>/gi;
          let subMatch;
          while ((subMatch = subPattern.exec(block)) !== null) {
            const subXml = subMatch[1];
            const base = parseFloat(stripTags((subXml.match(/<cbc:TaxableAmount[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || '0'));
            const amount = parseFloat(stripTags((subXml.match(/<cbc:TaxAmount[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || '0'));
            const rate = parseFloat(stripTags((subXml.match(/<cbc:Percent[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || '0'));
            const name = stripTags((subXml.match(/<cac:TaxScheme>[\\s\\S]*?<cbc:Name[^>]*>([\\s\\S]*?)<\\//i) || [])[1] || 'Retención');
            if (amount > 0) {
              withholdingTotals.push({ name, rate, base, amount });
            }
          }
        }

        // --- 2. HEADER SECTION ---
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

        // QR Code on far right of metadata block
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
        }

        // --- 3. DIVIDER ---
        y = Math.max(taxY + 15, ry + 78);
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 8;

        // --- 4. EMITTER & CUSTOMER DETAILS SECTION ---
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

        // --- 5. ITEMS TABLE HEADER ---
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 2.5;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
        y += 5;

        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#000000');
        const cols = {
          no: L,
          ref: L + 18,
          ean: L + 63,
          desc: L + 118,
          um: L + 215,
          qty: L + 240,
          price: L + 265,
          dcto: L + 310,
          taxName: L + 340,
          taxPercent: L + 370,
          taxVal: L + 395,
          total: L + 440
        };

        doc.text('No', cols.no)
           .text('CÓDIGO', cols.ref)
           .text('REF / BARRAS', cols.ean)
           .text('DESCRIPCIÓN', cols.desc)
           .text('U/M', cols.um, y, { width: 22, align: 'right' })
           .text('CANT', cols.qty, y, { width: 22, align: 'right' })
           .text('PRECIO', cols.price, y, { width: 42, align: 'right' })
           .text('DCTO%', cols.dcto, y, { width: 27, align: 'right' })
           .text('IMP', cols.taxName, y, { width: 27, align: 'right' })
           .text('IMP%', cols.taxPercent, y, { width: 22, align: 'right' })
           .text('VAL IMP', cols.taxVal, y, { width: 42, align: 'right' })
           .text('TOTAL ITEM', cols.total, y, { width: 112, align: 'right' });
        
        y += 10;
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 6;

        // --- 6. ITEMS ROWS ---
        doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
        
        lines.forEach((line, idx) => {
          if (y > doc.page.height - 130) {
            doc.addPage();
            y = 40;
            
            // Repeat Header on new page
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
            y += 2.5;
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.75).stroke();
            y += 5;
            doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#000000');
            doc.text('No', cols.no).text('CÓDIGO', cols.ref).text('REF / BARRAS', cols.ean).text('DESCRIPCIÓN', cols.desc)
               .text('U/M', cols.um, y, { width: 22, align: 'right' }).text('CANT', cols.qty, y, { width: 22, align: 'right' })
               .text('PRECIO', cols.price, y, { width: 42, align: 'right' }).text('DCTO%', cols.dcto, y, { width: 27, align: 'right' })
               .text('IMP', cols.taxName, y, { width: 27, align: 'right' }).text('IMP%', cols.taxPercent, y, { width: 22, align: 'right' })
               .text('VAL IMP', cols.taxVal, y, { width: 42, align: 'right' }).text('TOTAL ITEM', cols.total, y, { width: 112, align: 'right' });
            y += 10;
            doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
            y += 6;
            doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          }

          const descHeight = doc.heightOfString(line.desc, { width: 95 });
          
          doc.text(String(idx + 1), cols.no)
             .text(line.code || '—', cols.ref, y, { width: 42 })
             .text(line.standardId || '—', cols.ean, y, { width: 52 })
             .text(line.desc, cols.desc, y, { width: 95 })
             .text(line.um || 'EA', cols.um, y, { width: 22, align: 'right' })
             .text(String(line.qty), cols.qty, y, { width: 22, align: 'right' })
             .text(fmt(line.unitPrice), cols.price, y, { width: 42, align: 'right' })
             .text(line.discountRate ? \`\${line.discountRate}%\` : '0%', cols.dcto, y, { width: 27, align: 'right' })
             .text(line.taxName || 'IVA', cols.taxName, y, { width: 27, align: 'right' })
             .text(line.ivaRate ? \`\${line.ivaRate}%\` : '0%', cols.taxPercent, y, { width: 22, align: 'right' })
             .text(fmt(line.taxVal), cols.taxVal, y, { width: 42, align: 'right' })
             .text(fmt(line.lineTotal), cols.total, y, { width: 112, align: 'right' });

          y += Math.max(descHeight + 4, 13);
        });

        // Table Bottom line
        doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(0.5).stroke();
        y += 8;

        // --- 7. TAXES, WITHHOLDINGS, AND TOTALS LAYOUT ---
        const rightColW = 220;
        const rightColX = L + W - rightColW; // 30 + 552 - 220 = 362
        const leftColW = rightColX - L - 15; // 362 - 30 - 15 = 317
        const leftColX = L;
        
        let leftY = y;
        let rightY = y;

        // Draw Taxes Breakdown (Left Column)
        if (taxTotals.length > 0) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000');
          doc.text('DISCRIMINACIÓN DE IMPUESTOS', leftColX, leftY);
          leftY += 10;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).strokeColor('#000000').lineWidth(0.5).stroke();
          leftY += 3;
          
          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('IMPUESTO', leftColX)
             .text('TARIFA', leftColX + 60, leftY, { width: 35, align: 'right' })
             .text('BASE', leftColX + 100, leftY, { width: 55, align: 'right' })
             .text('VALOR IMPUESTO', leftColX + 160, leftY, { width: 75, align: 'right' });
          leftY += 9;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).stroke();
          leftY += 4;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          taxTotals.forEach(t => {
            doc.text(t.name, leftColX)
               .text(\`\${t.rate}%\`, leftColX + 60, leftY, { width: 35, align: 'right' })
               .text(fmt(t.base), leftColX + 100, leftY, { width: 55, align: 'right' })
               .text(fmt(t.amount), leftColX + 160, leftY, { width: 75, align: 'right' });
            leftY += 10;
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
          doc.text('RETENCIÓN', leftColX)
             .text('TARIFA', leftColX + 60, leftY, { width: 35, align: 'right' })
             .text('BASE', leftColX + 100, leftY, { width: 55, align: 'right' })
             .text('VALOR RETENCIÓN', leftColX + 160, leftY, { width: 75, align: 'right' });
          leftY += 9;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).stroke();
          leftY += 4;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          withholdingTotals.forEach(w => {
            doc.text(w.name, leftColX)
               .text(\`\${w.rate}%\`, leftColX + 60, leftY, { width: 35, align: 'right' })
               .text(fmt(w.base), leftColX + 100, leftY, { width: 55, align: 'right' })
               .text(fmt(w.amount), leftColX + 160, leftY, { width: 75, align: 'right' });
            leftY += 10;
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
           .text('Unidades de medida: EA = cada, MTR = metro, ZZ = servicio', L, y - 8);

        // --- 8. SIGNATURES SECTION ---
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

        // --- 9. FOOTER SECTION ---
        const pageH = doc.page.height;
        doc.page.margins.bottom = 10; // Prevent automatic page breaks for bottom footer text
        
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000')
           .text('CUFE: ', L, pageH - 62, { continued: true })
           .font('Helvetica').fontSize(6.5).fillColor('#1F2937')
           .text(cufe, { width: W });
        
        // Draw configurable footer text
        doc.font('Helvetica').fontSize(7).fillColor('#4B5563')
           .text(configFooter, L, pageH - 45, { width: W, align: 'center' });

        doc.font('Helvetica').fontSize(7.5).fillColor('#000000')
           .text('PÁGINA 1 / 1', L + W - 60, pageH - 35, { width: 60, align: 'right' });

        doc.end();
      }`;

// Locate the block in content
const startIdx = content.indexOf('} else {');
// Let's locate the last doc.end(); inside that block before the error catch block
const targetRegex = /\} else \{\s+\/\/ --- High-fidelity minimalist black & white layout matching FE4\.pdf ---[\s\S]*?doc\.end\(\);\s*\}/;

if (!targetRegex.test(content)) {
  console.error("COULD NOT MATCH THE TARGET ORCHESTRATOR ELSE BLOCK!");
  process.exit(1);
}

const updatedContent = content.replace(targetRegex, newElseBlock);
fs.writeFileSync(path, updatedContent, 'utf8');
console.log("PATCH V3 APPLIED SUCCESSFULLY!");
