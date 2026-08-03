const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

// 1. Fix the LineExtensionAmount regex typo inside generateInvoicePdf
const oldRegexLine = `const lineTotal = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\\\\s[^>]?>)?([\\\\s\\\\S]*?)<\\\\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i) || [])[1] || '0'));`;
const newRegexLine = `const lineTotal = parseFloat(stripTags((lineXml.match(/<(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount(?:\\\\s[^>]*)?>([\\\\s\\\\S]*?)<\\\\/(?:[a-zA-Z0-9_-]+:)?LineExtensionAmount>/i) || [])[1] || '0'));`;

if (content.includes(oldRegexLine)) {
  content = content.replace(oldRegexLine, newRegexLine);
  console.log("1. LineExtensionAmount regex typo fixed.");
} else {
  // Let's do a regex-based replacement to be safe of escaping variations
  const oldRegexPattern = /LineExtensionAmount\(\?\\\\s\[\^>\]\?>\)\?/g;
  if (oldRegexPattern.test(content)) {
    content = content.replace(oldRegexPattern, 'LineExtensionAmount(?:\\\\s[^>]*)?>');
    console.log("1. LineExtensionAmount regex typo fixed (regex-based).");
  } else {
    // If it's single backslashes in the original JS file
    const oldRegexPatternSingle = /LineExtensionAmount\(\?\\s\[\^>\]\?>\)\?/g;
    if (oldRegexPatternSingle.test(content)) {
      content = content.replace(oldRegexPatternSingle, 'LineExtensionAmount(?:\\s[^>]*)?>');
      console.log("1. LineExtensionAmount regex typo fixed (regex-based single backslash).");
    } else {
      console.warn("1. Warning: LineExtensionAmount regex match not found.");
    }
  }
}

// 2. Fix the metadata overlap and title height calculation
const oldHeaderBlock = `        // Right Column: Document metadata
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
        };`;

const newHeaderBlock = `        // Right Column: Document metadata
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
        };`;

if (content.includes(oldHeaderBlock)) {
  content = content.replace(oldHeaderBlock, newHeaderBlock);
  console.log("2. Header layout & metadata alignment fixed.");
} else {
  console.warn("2. Warning: Header old block match not found.");
}

// 3. Fix the QR code position to align with non-overlapping bounds (X = 502)
const oldQrCodeImage = `            doc.image(qrBuffer, rx + rw - 75, ry + 2, { width: 75, height: 75 });`;
const newQrCodeImage = `            doc.image(qrBuffer, 502, ry + 2, { width: 75, height: 75 });`;

if (content.includes(oldQrCodeImage)) {
  content = content.replace(oldQrCodeImage, newQrCodeImage);
  console.log("3. QR Code position updated.");
} else {
  console.warn("3. Warning: QR Code position match not found.");
}

// 4. Fix the %s IVA percent format specifier typo inside table rows
const oldIvaPercent = `.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`;
// Wait, let's see how it was written after compilation
const oldIvaPercentRaw = `.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`;

// Let's do a search and replace for:
// .text(line.ivaRate ? `%s` : '', cols.imp, y, { width: 25, align: 'right' })
const literalPercentS = `.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`;
const targetLiteral = `.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`;

// Let's find it in the content by matching text around it
const searchString = `.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`;

// Let's print out what is around line 2063 to do exact replacement
// The line we saw in grep is:
// .text(line.ivaRate ? `%s` : '', cols.imp, y, { width: 25, align: 'right' })
content = content.replace(`.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`, `.text(line.ivaRate ? \`\${line.ivaRate}%\` : '', cols.imp, y, { width: 25, align: 'right' })`);
content = content.replace(`.text(line.ivaRate ? \`%\` : "", cols.imp, y, { width: 25, align: 'right' })`, `.text(line.ivaRate ? \`\${line.ivaRate}%\` : '', cols.imp, y, { width: 25, align: 'right' })`);
// Let's try replacing literal %s as well
content = content.replace(`.text(line.ivaRate ? \`%\` : '', cols.imp, y, { width: 25, align: 'right' })`, `.text(line.ivaRate ? \`\${line.ivaRate}%\` : '', cols.imp, y, { width: 25, align: 'right' })`);
content = content.replace(`.text(line.ivaRate ? \`%\` : "", cols.imp, y, { width: 25, align: 'right' })`, `.text(line.ivaRate ? \`\${line.ivaRate}%\` : '', cols.imp, y, { width: 25, align: 'right' })`);

// Let's do a regex replacement to ensure it catches it:
const percentRegex = /\.text\(line\.ivaRate \? `(?:%s|%)` : '', cols\.imp, y, \{ width: 25, align: 'right' \}\)/g;
content = content.replace(percentRegex, `.text(line.ivaRate ? \`\${line.ivaRate}%\` : '', cols.imp, y, { width: 25, align: 'right' })`);
console.log("4. Tax percent display format fixed.");

fs.writeFileSync(path, content, 'utf8');
console.log("PATCH V2 COMPLETED SUCCESSFULLY!");
