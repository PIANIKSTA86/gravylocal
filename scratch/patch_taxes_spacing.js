const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

const target = `          doc.font('Helvetica-Bold').fontSize(6.5);
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
          });`;

const replacement = `          doc.font('Helvetica-Bold').fontSize(6.5);
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

// Ensure we match regardless of line ending characters (carriage return vs line feed)
const cleanText = (str) => str.replace(/\r\n/g, '\n').trim();

if (cleanText(content).includes(cleanText(target))) {
  // Let's do a replace based on unified line endings
  let unifiedContent = content.replace(/\r\n/g, '\n');
  unifiedContent = unifiedContent.replace(cleanText(target), cleanText(replacement));
  fs.writeFileSync(path, unifiedContent, 'utf8');
  console.log("SUCCESS: Taxes layout spacing matched and updated!");
} else {
  console.error("ERROR: Target block not found. Trying regex fallback...");
  // Regex pattern matching the block
  const pattern = /doc\.font\('Helvetica-Bold'\)\.fontSize\(6\.5\);\s*doc\.text\('IMPUESTO',\s*leftColX\)[\s\S]*?leftY\s*\+=\s*10;\s*\}\);/;
  if (pattern.test(content)) {
    console.log("Found pattern with regex!");
  } else {
    console.error("Regex pattern also failed to match.");
  }
}
