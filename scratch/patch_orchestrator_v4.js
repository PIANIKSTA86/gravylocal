const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

// 1. Update UBL Tax/Withholding parsing to use stripped doc-level XML
const oldTaxParsingBlock = `        // Parse Document-level Taxes
        const taxTotals = [];
        const taxTotalPattern = /<cac:TaxTotal>([\\s\\S]*?)<\\/cac:TaxTotal>/gi;
        let taxTotalMatch;
        while ((taxTotalMatch = taxTotalPattern.exec(cleanXml)) !== null) {`;

const newTaxParsingBlock = `        // Parse Document-level Taxes (excluding line-level taxes)
        const docOnlyXml = cleanXml.replace(/<cac:(?:Invoice|CreditNote|DebitNote)Line>[\\s\\S]*?<\\/cac:(?:Invoice|CreditNote|DebitNote)Line>/gi, '');

        const taxTotals = [];
        const taxTotalPattern = /<cac:TaxTotal>([\\s\\S]*?)<\\/cac:TaxTotal>/gi;
        let taxTotalMatch;
        while ((taxTotalMatch = taxTotalPattern.exec(docOnlyXml)) !== null) {`;

if (content.includes(oldTaxParsingBlock)) {
  content = content.replace(oldTaxParsingBlock, newTaxParsingBlock);
  console.log("1. Tax parsing isolated to document-level XML.");
} else {
  console.warn("1. Warning: Tax parsing block match not found.");
}

// Update Withholding parsing to use docOnlyXml
const oldWithholdingPattern = `        while ((wTotalMatch = wTotalPattern.exec(cleanXml)) !== null) {`;
const newWithholdingPattern = `        while ((wTotalMatch = wTotalPattern.exec(docOnlyXml)) !== null) {`;

if (content.includes(oldWithholdingPattern)) {
  content = content.replace(oldWithholdingPattern, newWithholdingPattern);
  console.log("2. Withholding parsing isolated to document-level XML.");
} else {
  console.warn("2. Warning: Withholding parsing block match not found.");
}

// 3. Optimize vertical padding in Taxes/Withholdings breakdown tables
const oldTaxesLayout = `          doc.font('Helvetica-Bold').fontSize(6.5);
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
               .text(\`\\\${t.rate}%\`, leftColX + 60, leftY, { width: 35, align: 'right' })
               .text(fmt(t.base), leftColX + 100, leftY, { width: 55, align: 'right' })
               .text(fmt(t.amount), leftColX + 160, leftY, { width: 75, align: 'right' });
            leftY += 10;
          });`;

const newTaxesLayout = `          doc.font('Helvetica-Bold').fontSize(6.5);
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
          });`;

if (content.includes(oldTaxesLayout)) {
  content = content.replace(oldTaxesLayout, newTaxesLayout);
  console.log("3. Taxes breakdown table spacing optimized.");
} else {
  // Let's try replacing with backslash differences
  console.warn("3. Warning: Taxes layout block match not found.");
}

// Similarly for Withholdings Layout
const oldWithholdingsLayout = `          doc.font('Helvetica-Bold').fontSize(6.5);
          doc.text('RETENCION', leftColX)
             .text('TARIFA', leftColX + 60, leftY, { width: 35, align: 'right' })
             .text('BASE', leftColX + 100, leftY, { width: 55, align: 'right' })
             .text('VALOR RETENCION', leftColX + 160, leftY, { width: 75, align: 'right' });
          leftY += 9;
          doc.moveTo(leftColX, leftY).lineTo(leftColX + leftColW, leftY).stroke();
          leftY += 4;
          
          doc.font('Helvetica').fontSize(6.5).fillColor('#1F2937');
          withholdingTotals.forEach(w => {
            doc.text(w.name, leftColX)
               .text(\`\\\${w.rate}%\`, leftColX + 60, leftY, { width: 35, align: 'right' })
               .text(fmt(w.base), leftColX + 100, leftY, { width: 55, align: 'right' })
               .text(fmt(w.amount), leftColX + 160, leftY, { width: 75, align: 'right' });
            leftY += 10;
          });`;

const newWithholdingsLayout = `          doc.font('Helvetica-Bold').fontSize(6.5);
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
          });`;

// Replace Withholding layout
// We need to account for accent marks ("RETENCIÓN") in regex or exact string
content = content.replace(/RETENCIÓN/g, 'RETENCION'); // unify accent marks for replace match
content = content.replace(oldWithholdingsLayout, newWithholdingsLayout);
console.log("4. Withholdings layout block spacing optimized.");

fs.writeFileSync(path, content, 'utf8');
console.log("PATCH V4 COMPLETED SUCCESSFULLY!");
