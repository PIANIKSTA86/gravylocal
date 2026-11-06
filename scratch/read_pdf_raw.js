const fs = require('fs');

const buf = fs.readFileSync('archivos_pdf/2026/01/FV - Factura de Venta/FV-00003342.pdf');
console.log("PDF length:", buf.length);
// Let's search strings inside the PDF
const str = buf.toString('latin1');
const match = str.match(/(Esta factura[\s\S]{1,500}rotura o faltantes[\s\S]{0,100})/i);
if (match) {
  console.log("Matched text in PDF:", match[1]);
} else {
  console.log("Not matched directly in raw latin1");
}

