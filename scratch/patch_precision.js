const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, '..', 'frontend', 'src', 'api.ts');
let content = fs.readFileSync(apiPath, 'utf8');

const t1 = `        const normDesc = String(line.description || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
        const isMora = cCode === "MORA" || normDesc.includes("interes") || normDesc.includes("mora");
        const conceptCode = (cCode || (isMora ? "MORA" : "GEN")).toUpperCase();`;

const r1 = `        const normDesc = String(line.description || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
        const isMora = cCode === "MORA" || normDesc.includes("interes") || normDesc.includes("mora");
        const conceptCode = (cCode || (isMora ? "MORA" : (normDesc.includes("admin") ? "ADM" : "GEN"))).toUpperCase();`;

const t2 = `        rows.push({
          invoice: inv,
          line,
          amount: currentBalance, // Saldo para el reporte
          originalAmount: originalAmount, // Valor original para integridad
          abono: abonoAplicado,
          saldoAnticipo: propAdvancePool,
          diasMora: Math.max(0, diasMoraRaw),
          diasMoraRaw,
          fechaDoc,
          dueDate: venc,
          estado,
          propertyId: String(inv.property_id || ""),
          propertyCode: String(prop?.code || ""),
          propertyName: String(prop?.name || ""),
          ownerId: String(prop?.owner_id || owner?.id || ""),
          ownerName: String(owner?.name || "").trim(),
          ownerDoc: String(owner?.doc_number || "").trim(),
          conceptoId: normalizedConceptId,
          concepto: normalizedConcepto,
        });
      }
    }`;

const r2 = `        rows.push({
          invoice: inv,
          line,
          amount: currentBalance, // Saldo para el reporte
          originalAmount: originalAmount, // Valor original para integridad
          abono: abonoAplicado,
          saldoAnticipo: propAdvancePool,
          diasMora: Math.max(0, diasMoraRaw),
          diasMoraRaw,
          fechaDoc,
          dueDate: venc,
          estado,
          propertyId: String(inv.property_id || ""),
          propertyCode: String(prop?.code || ""),
          propertyName: String(prop?.name || ""),
          ownerId: String(prop?.owner_id || owner?.id || ""),
          ownerName: String(owner?.name || "").trim(),
          ownerDoc: String(owner?.doc_number || "").trim(),
          conceptoId: normalizedConceptId,
          concepto: normalizedConcepto,
        });
      }

      if (generalAbono > 0) {
        propAdvancePool += generalAbono;
        advancesByPropMap.set(pIdKey, propAdvancePool);
      }
    }`;

let norm = content.replace(/\r\n/g, '\n');
const normT1 = t1.replace(/\r\n/g, '\n');
const normR1 = r1.replace(/\r\n/g, '\n');
const normT2 = t2.replace(/\r\n/g, '\n');
const normR2 = r2.replace(/\r\n/g, '\n');

if (norm.includes(normT1) && norm.includes(normT2)) {
  norm = norm.replace(normT1, normR1).replace(normT2, normR2);
  fs.writeFileSync(apiPath, norm, 'utf8');
  console.log('Successfully updated precision matching in frontend/src/api.ts');
} else {
  console.error('Target not found in frontend/src/api.ts');
}

