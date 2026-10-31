const fs = require('fs');

const file = 'frontend/src/api.ts';
let code = fs.readFileSync(file, 'utf8');

const oldBlock = `        if (matchedInv) {
          abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
        } else if (ref.startsWith("ANTICIPO-")) {`;

const newBlock = `        if (matchedInv) {
          abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
        } else if (ref.startsWith("CF-")) {
          // Soporte cuotas anticipadas de períodos futuros (ej: CF-202611-000090-ADM)
          const parts = ref.split("-");
          let pidKey = "";
          if (parts.length >= 3) {
            const seq = parts[2];
            const matchPrior = invoices.find(inv => String(inv.number || "").includes(\`-\${seq}\`));
            if (matchPrior && matchPrior.property_id) {
              pidKey = String(matchPrior.property_id).toLowerCase();
            }
          }
          if (!pidKey && tl.description) {
            for (const p of properties) {
              if (tl.description.includes(\`Unidad \${p.code}\`) || (p.name && tl.description.includes(p.name)) || (p.code && tl.description.includes(\`- \${p.code}\`))) {
                pidKey = String(p.id).toLowerCase();
                break;
              }
            }
          }
          if (pidKey) {
            advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
          }
        } else if (ref.startsWith("ANTICIPO-")) {`;

const isCRLF = code.includes('\r\n');
const codeLF = code.replace(/\r\n/g, '\n');
const oldBlockLF = oldBlock.replace(/\r\n/g, '\n');
const newBlockLF = newBlock.replace(/\r\n/g, '\n');

if (codeLF.includes(oldBlockLF)) {
  const replaced = codeLF.replace(oldBlockLF, newBlockLF);
  fs.writeFileSync(file, isCRLF ? replaced.replace(/\n/g, '\r\n') : replaced, 'utf8');
  console.log(`Updated ${file}`);
} else {
  console.log(`Target not found in ${file}`);
}
