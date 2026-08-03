const fs = require('fs');
const path = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';

let content = fs.readFileSync(path, 'utf8');

const target = `        // --- 8. FOOTER SECTION ---
        const pageH = doc.page.height;`;

const replacement = `        // --- 8. FOOTER SECTION ---
        doc.page.margins.bottom = 10; // Prevent automatic page breaks for bottom footer text
        const pageH = doc.page.height;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("SUCCESS: Footer margin patch applied!");
} else {
  console.error("ERROR: Footer target not found in orchestrator.js!");
}
