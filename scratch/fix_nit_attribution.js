const fs = require('fs');
const path = require('path');

// 1. pb_hooks/ph_email.pb.js
const phEmailPath = path.resolve('pb_hooks', 'ph_email.pb.js');
let phEmail = fs.readFileSync(phEmailPath, 'utf8');
const oldPhFooter = /Documento emitido por GRAVY v2\.0 \/ NIT\. 901\.442\.115-3 — Sistema Integral de Control y Gestión de Propiedad Horizontal\./g;
const newPhFooter = 'Documento emitido por GRAVY v2.0 | Desarrollado por JULIAN ESPINOSA ARRUBLA, NIT. 1130636393-2 — Sistema Integral de Control y Gestión de Propiedad Horizontal.';

phEmail = phEmail.replace(oldPhFooter, newPhFooter);
fs.writeFileSync(phEmailPath, phEmail, 'utf8');
console.log('Updated pb_hooks/ph_email.pb.js');

// 2. hub/orchestrator.js
const orchPath = path.resolve('hub', 'orchestrator.js');
let orch = fs.readFileSync(orchPath, 'utf8');
orch = orch.replace(oldPhFooter, newPhFooter);
fs.writeFileSync(orchPath, orch, 'utf8');
console.log('Updated hub/orchestrator.js');

// 3. pb_hooks/dian.pb.js
const dianPath = path.resolve('pb_hooks', 'dian.pb.js');
let dian = fs.readFileSync(dianPath, 'utf8');
dian = dian.replace(/901\.442\.115-3/g, '1130636393-2');
fs.writeFileSync(dianPath, dian, 'utf8');
console.log('Updated pb_hooks/dian.pb.js');

// 4. Frontend files
const frontFiles = [
  'frontend/src/modules/pedidos.ts',
  'frontend/src/modules/pos.ts',
  'frontend/src/modules/ventas.ts',
  'frontend/src/modules/reservas-logistica.ts'
];

for (const rel of frontFiles) {
  const fPath = path.resolve(rel);
  if (fs.existsSync(fPath)) {
    let fContent = fs.readFileSync(fPath, 'utf8');
    fContent = fContent.replace(/901\.442\.115-3/g, '1130636393-2');
    fs.writeFileSync(fPath, fContent, 'utf8');
    console.log('Updated', rel);
  }
}
