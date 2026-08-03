const fs = require('fs');
const path = require('path');

const pdfBuffer = fs.readFileSync(path.join(__dirname, 'test_output_dian.pdf'));
const pdfText = pdfBuffer.toString('utf8');

console.log("PDF buffer size:", pdfBuffer.length);
console.log("Contains 2026-08-25 (Vencimiento):", pdfText.includes('2026-08-25'));
console.log("Contains BOGOTA (Emisor City):", pdfText.includes('BOGOTA'));
console.log("Contains MEDELLIN (Customer City):", pdfText.includes('MEDELLIN'));
console.log("Contains CUNDINAMARCA (Emisor Dept):", pdfText.includes('CUNDINAMARCA'));
console.log("Contains ANTIOQUIA (Customer Dept):", pdfText.includes('ANTIOQUIA'));
