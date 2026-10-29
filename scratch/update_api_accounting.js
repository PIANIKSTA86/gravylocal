const fs = require('fs');

const path = 'frontend/src/api.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    const buildTxLine = async ({
      accountId,
      thirdPartyId = null,
      debit = 0,
      credit = 0,
      description = '',
      crossDocRef = '',
      crossDocDate = null,
      dueDate = null,
      isIvaCost = false
    }: any) => {
      const acc = await getAccById(accountId);
      if (acc.active === false) {
        throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} se encuentra inactiva.\`);
      }

      // 1. Respetar requires_third_party
      let finalThirdPartyId = thirdPartyId;
      if (acc.requires_third_party && !finalThirdPartyId) {
        finalThirdPartyId = inv.supplier_id || null;
      }
      if (acc.requires_third_party && !finalThirdPartyId) {
        throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} requiere tercero obligatorio.\`);
      }

      const line: any = {
        account_id: acc.id,
        third_party_id: finalThirdPartyId,
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
        description: String(description || ''),
        is_iva_cost: !!isIvaCost,
        line_order: txLines.length + 1,
      };

      // 2. Respetar maneja_cruce
      const isAccCruce = Boolean(acc.maneja_cruce === true || acc.maneja_cruce === 1 || acc.maneja_cruce === 'true' || acc.maneja_cruce === '1');
      if (isAccCruce) {
        let ref = String(crossDocRef || effectiveCrossDoc || '').trim();
        if (!ref) {
          throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} requiere documento de cruce.\`);
        }
        line.cross_doc_ref = ref;
        line.cross_doc_date = crossDocDate || inv.date || new Date().toISOString().slice(0, 10);
        line.due_date = dueDate || inv.due_date || line.cross_doc_date;
      } else if (String(crossDocRef || '').trim()) {
        line.cross_doc_ref = String(crossDocRef).trim();
      }

      return line;
    };`;

const replacement = `    const buildTxLine = async ({
      accountId,
      thirdPartyId = null,
      debit = 0,
      credit = 0,
      description = '',
      crossDocRef = '',
      crossDocDate = null,
      dueDate = null,
      isIvaCost = false,
      costCenterId = null,
    }: any) => {
      const acc = await getAccById(accountId);
      if (acc.active === false) {
        throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} se encuentra inactiva.\`);
      }

      // Validar nivel de imputabilidad (no se puede contabilizar en cuentas de mayor clase/grupo de <= 4 dígitos)
      const codeDigits = String(acc.code || '').replace(/\\D/g, '');
      if (codeDigits.length <= 4) {
        throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} es una cuenta de mayor o grupo y no admite movimientos contables directos. Utiliza una subcuenta o auxiliar de último nivel.\`);
      }

      // 1. Respetar requires_third_party
      let finalThirdPartyId = thirdPartyId;
      if (acc.requires_third_party && !finalThirdPartyId) {
        finalThirdPartyId = inv.supplier_id || null;
      }
      if (acc.requires_third_party && !finalThirdPartyId) {
        throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} requiere tercero obligatorio.\`);
      }

      const line: any = {
        account_id: acc.id,
        third_party_id: finalThirdPartyId,
        debit: Math.round(debit * 100) / 100,
        credit: Math.round(credit * 100) / 100,
        description: String(description || ''),
        is_iva_cost: !!isIvaCost,
        line_order: txLines.length + 1,
      };

      if (costCenterId) {
        line.cost_center_id = costCenterId;
      }

      // 2. Respetar estrictamente maneja_cruce según propiedades de la cuenta
      const isAccCruce = Boolean(acc.maneja_cruce === true || acc.maneja_cruce === 1 || acc.maneja_cruce === 'true' || acc.maneja_cruce === '1');
      if (isAccCruce) {
        let ref = String(crossDocRef || effectiveCrossDoc || '').trim();
        if (!ref) {
          throw new Error(\`La cuenta contable \${acc.code} - \${acc.name} requiere documento de cruce.\`);
        }
        line.cross_doc_ref = ref;
        line.cross_doc_date = crossDocDate || inv.date || new Date().toISOString().slice(0, 10);
        line.due_date = dueDate || inv.due_date || line.cross_doc_date;
      } else {
        // Cuentas de gasto, costo, inventario, impuestos, etc., que NO manejan cruce
        line.cross_doc_ref = '';
        line.cross_doc_date = null;
        line.due_date = null;
      }

      return line;
    };`;

// Normalizar CRLF
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
  console.error('Target NOT found in api.ts!');
  process.exit(1);
}

const updated = normContent.replace(normTarget, normReplacement);
// Restaurar CRLF
fs.writeFileSync(path, updated.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated buildTxLine in api.ts');
