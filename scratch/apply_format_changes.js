const fs = require('fs');

// 1. Patch hub/orchestrator.js
let orchCode = fs.readFileSync('hub/orchestrator.js', 'utf8');

// Replace metodoPago definition with formatPaymentMethod helper + metodoPago
const oldMetodoLine = `      const metodoPago = pData.paymentMethod || '42 - Consignación Bancaria';`;
const newMetodoLine = `      function formatPaymentMethod(m) {
        const str = String(m || '').trim();
        const code = (str.match(/\\d+/) || [str])[0];
        const methods = {
          '10': '10 - Efectivo',
          '42': '42 - Consignación Bancaria',
          '30': '30 - Transferencia ACH',
          '47': '47 - Transferencia Débito Bancaria',
          '20': '20 - Cheque',
          '48': '48 - Tarjeta Crédito',
          '49': '49 - Tarjeta Débito',
          '1': '01 - Instrumento no definido'
        };
        if (methods[code]) return methods[code];
        if (str.length > 3) return str;
        return str ? \`\${str} - Transferencia Bancaria\` : '42 - Consignación Bancaria';
      }
      const metodoPago = formatPaymentMethod(pData.paymentMethod || getAttr(/<Pago\\s+([^>]+)\\/?>/i, 'Metodo') || '42');`;

orchCode = orchCode.replace(oldMetodoLine, newMetodoLine);

// Remove [ 'Cargo:', cargo, 'Centro de Costos:', centroCostos ],
const oldMetaRows = `      const metaRows = [
        [ 'Empleado:', empName, 'Identificación:', empDoc ],
        [ 'Dirección:', empAddress, 'Ciudad / Depto:', empCityDept ],
        [ 'Teléfono:', empPhone, 'Correo Electrónico:', empEmail ],
        [ 'Cargo:', cargo, 'Centro de Costos:', centroCostos ],
        [ 'Sueldo Base:', fmt(sueldoBase), 'Banco / Cuenta:', ctaLabel ],
        [ 'Fecha Ingreso:', fIngreso, 'Fecha Retiro:', fRetiro ],
        [ 'Método de Pago:', metodoPago, 'Fechas de Pago:', fechasPago ],
        [ 'Entidad Salud:', epsLabel, 'Entidad Pensión:', afpLabel ],
        [ 'Entidad ARL:', arlLabel, 'Entidad Caja:', cajaLabel ]
      ];`;

const newMetaRows = `      const metaRows = [
        [ 'Empleado:', empName, 'Identificación:', empDoc ],
        [ 'Dirección:', empAddress, 'Ciudad / Depto:', empCityDept ],
        [ 'Teléfono:', empPhone, 'Correo Electrónico:', empEmail ],
        [ 'Sueldo Base:', fmt(sueldoBase), 'Banco / Cuenta:', ctaLabel ],
        [ 'Fecha Ingreso:', fIngreso, 'Fecha Retiro:', fRetiro ],
        [ 'Método de Pago:', metodoPago, 'Fechas de Pago:', fechasPago ],
        [ 'Entidad Salud:', epsLabel, 'Entidad Pensión:', afpLabel ],
        [ 'Entidad ARL:', arlLabel, 'Entidad Caja:', cajaLabel ]
      ];`;

orchCode = orchCode.replace(oldMetaRows, newMetaRows);

// Change rowH from 12.5 to 13.5
orchCode = orchCode.replace('const rowH = 12.5;', 'const rowH = 13.5;');

fs.writeFileSync('hub/orchestrator.js', orchCode, 'utf8');
console.log('hub/orchestrator.js patched successfully!');

// 2. Patch pb_hooks/dian_mailer.js and dian.pb.js
function patchHookFile(filepath) {
  let hookCode = fs.readFileSync(filepath, 'utf8');
  const targetPaymentMethod = `paymentMethod: emp ? (emp.getString("payment_method") || "42 - Consignación Bancaria") : "42 - Consignación Bancaria",`;
  const paymentMethodHelper = `  const formatPaymentMethod = function(m) {
    const str = String(m || '').trim();
    const code = (str.match(/\\d+/) || [str])[0];
    const methods = {
      '10': '10 - Efectivo',
      '42': '42 - Consignación Bancaria',
      '30': '30 - Transferencia ACH',
      '47': '47 - Transferencia Débito Bancaria',
      '20': '20 - Cheque',
      '48': '48 - Tarjeta Crédito',
      '49': '49 - Tarjeta Débito',
      '1': '01 - Instrumento no definido'
    };
    if (methods[code]) return methods[code];
    if (str.length > 3) return str;
    return str ? (str + ' - Transferencia Bancaria') : '42 - Consignación Bancaria';
  };`;
  
  if (!hookCode.includes('formatPaymentMethod')) {
    hookCode = hookCode.replace('const resolveThirdName =', paymentMethodHelper + '\n\n  const resolveThirdName =');
  }
  hookCode = hookCode.replace(targetPaymentMethod, `paymentMethod: formatPaymentMethod(emp ? emp.getString("payment_method") : "42"),`);
  fs.writeFileSync(filepath, hookCode, 'utf8');
  console.log(`${filepath} patched successfully!`);
}

patchHookFile('pb_hooks/dian_mailer.js');
patchHookFile('pb_hooks/dian.pb.js');

// 3. Patch frontend/src/modules/nomina.ts
let frontCode = fs.readFileSync('frontend/src/modules/nomina.ts', 'utf8');

// In previewNominaModal, remove Cargo & Centro de Costos row
const oldCargoRow = `          <tr>
            <td class="font-bold bg-gray-50">Cargo:</td>
            <td>\${esc(cargo)}</td>
            <td class="font-bold bg-gray-50">Centro de Costos:</td>
            <td>\${esc(centroCostoLabel)}</td>
          </tr>`;

frontCode = frontCode.replace(oldCargoRow, '');

// Format payment method text
const oldFrontMetodo = `const metodoPagoLabel = metodoPagoXml === '10' ? '10 - Efectivo' : (metodoPagoXml === '30' ? '30 - Transferencia Débito Interbancaria (ACH)' : (metodoPagoXml === '47' ? '47 - Transferencia Débito Bancaria (Mismo Banco)' : (metodoPagoXml === '42' ? '42 - Consignación Bancaria' : (metodoPagoXml ? \`\${metodoPagoXml} - Transferencia Bancaria\` : '30 - Transferencia ACH'))));`;
const newFrontMetodo = `const pmRaw = metodoPagoXml || emp.payment_method || '42';
    const pmCode = (String(pmRaw).match(/\\d+/) || [pmRaw])[0];
    const pmMap: Record<string, string> = {
      '10': '10 - Efectivo',
      '42': '42 - Consignación Bancaria',
      '30': '30 - Transferencia ACH',
      '47': '47 - Transferencia Débito Bancaria',
      '20': '20 - Cheque',
      '48': '48 - Tarjeta Crédito',
      '49': '49 - Tarjeta Débito'
    };
    const metodoPagoLabel = pmMap[pmCode] || (String(pmRaw).length > 3 ? String(pmRaw) : \`\${pmRaw} - Transferencia Bancaria\`);`;

if (frontCode.includes(oldFrontMetodo)) {
  frontCode = frontCode.replace(oldFrontMetodo, newFrontMetodo);
} else {
  console.log('oldFrontMetodo not exact match, searching substring:');
  const idx = frontCode.indexOf('metodoPagoLabel');
  console.log(JSON.stringify(frontCode.slice(idx - 10, idx + 150)));
}

fs.writeFileSync('frontend/src/modules/nomina.ts', frontCode, 'utf8');
console.log('frontend/src/modules/nomina.ts patched successfully!');

