const fs = require('fs');

const f = 'C:\\Users\\JULIAN\\.gemini\\antigravity-ide\\brain\\787042fc-56cd-4cf4-bfdb-24d231a8c22a\\.system_generated\\steps\\319\\content.md';
if (fs.existsSync(f)) {
  const txt = fs.readFileSync(f, 'utf8');
  const sections = ['identity_document_id', 'type_document_identification_id', 'operation_type_id', 'payment_method_id', 'means_payment_id', 'taxes'];
  sections.forEach(s => {
    const idx = txt.indexOf(s);
    if (idx !== -1) {
      console.log(`\n=== SECTION: ${s} ===`);
      console.log(txt.slice(idx, idx + 1000).replace(/<[^>]+>/g, ' '));
    }
  });
}
