const fs = require('fs');
let code = fs.readFileSync('pb_hooks/ph_email.pb.js', 'utf8');
const target = "  const customSubject = String(body?.subject || '').trim();\r\n\r\n  if (!invoiceId) {";
const replacement = "  const customSubject = String(body?.subject || '').trim();\r\n  const customMessage = String(body?.message || '').trim();\r\n\r\n  if (!invoiceId) {";

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('pb_hooks/ph_email.pb.js', code, 'utf8');
  console.log('Added customMessage successfully');
} else {
  // Try with \n
  const targetLF = "  const customSubject = String(body?.subject || '').trim();\n\n  if (!invoiceId) {";
  const replacementLF = "  const customSubject = String(body?.subject || '').trim();\n  const customMessage = String(body?.message || '').trim();\n\n  if (!invoiceId) {";
  if (code.includes(targetLF)) {
    code = code.replace(targetLF, replacementLF);
    fs.writeFileSync('pb_hooks/ph_email.pb.js', code, 'utf8');
    console.log('Added customMessage successfully (LF)');
  } else {
    console.log('Target not found');
  }
}
