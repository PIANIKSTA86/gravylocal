const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/modules/reportes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The second occurrence of detailRowsHtml is after renderFinancialPosition()
// We want to replace it.
const searchStr = `      const detailRowsHtml = (section) => section.detail.map(r => \`
        <tr>
          <td style="padding-left:24px">\${esc(r.label)}</td>
          \${showNotes ? \`<td class="text-center">\${esc(r.note)}</td>\` : ''}
          \${amountCell(r.now)}
          \${amountCell(r.cmp)}
        </tr>\`).join('');`;

const replacementStr = `      const detailRowsHtml = (section) => section.detail.map(r => {
        const lvl = Number(r.level || 1);
        const padding = 12 + (lvl - 1) * 12;
        const isBoldClass = lvl <= 3 ? 'font-bold' : (lvl === 4 ? 'font-semibold' : '');
        return \`
        <tr class="\${isBoldClass}">
          <td style="padding-left:\${padding}px">\${esc(r.label)}</td>
          \${showNotes ? \`<td class="text-center">\${esc(r.note)}</td>\` : ''}
          \${amountCell(r.now, isBoldClass)}
          \${amountCell(r.cmp, isBoldClass)}
        </tr>\`;
      }).join('');`;

// We find the index of renderFinancialPosition and look for detailRowsHtml after it
const indexPos = content.indexOf('async function renderFinancialPosition()');
if (indexPos === -1) {
  console.error("renderFinancialPosition not found");
  process.exit(1);
}

const afterPos = content.substring(indexPos);
// We replace the first occurrence of searchStr after renderFinancialPosition
// Let's normalize line endings to do the replacement
const normalizedAfterPos = afterPos.replace(/\r\n/g, '\n');
const normalizedSearchStr = searchStr.replace(/\r\n/g, '\n');
const normalizedReplacementStr = replacementStr.replace(/\r\n/g, '\n');

if (!normalizedAfterPos.includes(normalizedSearchStr)) {
  console.error("searchStr not found after renderFinancialPosition");
  process.exit(1);
}

const updatedAfterPos = normalizedAfterPos.replace(normalizedSearchStr, normalizedReplacementStr);
content = content.substring(0, indexPos) + updatedAfterPos;

// Restore CRLF if that was the file format
if (fs.readFileSync(filePath, 'utf8').includes('\r\n')) {
  content = content.replace(/\r?\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Financial Position detailRowsHtml patched successfully!");
