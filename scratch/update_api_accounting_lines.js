const fs = require('fs');

const path = 'frontend/src/api.ts';
let content = fs.readFileSync(path, 'utf8');

// Normalizar CRLF
let normContent = content.replace(/\r\n/g, '\n');

// 1. Linea de gastos
const target1 = `      txLines.push(await buildTxLine({
        accountId,
        thirdPartyId: inv.supplier_id,
        debit: effectiveDebit,
        credit: 0,
        description: line.description || inv.expand?.supplier_id?.name || '',
        crossDocRef: isCredit ? effectiveCrossDoc : '',
        crossDocDate: inv.date,
        dueDate: isCredit ? dueDate : inv.date,
        isIvaCost: isIvaAsCost && ivaAmt > 0,
      }));`;

const rep1 = `      txLines.push(await buildTxLine({
        accountId,
        thirdPartyId: inv.supplier_id,
        debit: effectiveDebit,
        credit: 0,
        description: line.description || inv.expand?.supplier_id?.name || '',
        crossDocRef: '',
        crossDocDate: null,
        dueDate: null,
        isIvaCost: isIvaAsCost && ivaAmt > 0,
        costCenterId: (line as any).cost_center_id || null,
      }));`;

// 2. Linea de IVA
const target2 = `      txLines.push(await buildTxLine({
        accountId: ivaAccountCache[accCode].id,
        thirdPartyId: inv.supplier_id,
        debit: amount,
        credit: 0,
        description: \`IVA \${rateKey}% compra \${inv.number}\`,
        crossDocRef: isCredit ? effectiveCrossDoc : '',
        crossDocDate: inv.date,
        dueDate: isCredit ? dueDate : inv.date,
      }));`;

const rep2 = `      txLines.push(await buildTxLine({
        accountId: ivaAccountCache[accCode].id,
        thirdPartyId: inv.supplier_id,
        debit: amount,
        credit: 0,
        description: \`IVA \${rateKey}% compra \${inv.number}\`,
        crossDocRef: '',
        crossDocDate: null,
        dueDate: null,
      }));`;

// 3. Linea de Retenciones
const target3 = `      txLines.push(await buildTxLine({
        accountId: ivaAccountCache[accCode].id,
        thirdPartyId: inv.supplier_id,
        debit: 0,
        credit: amount,
        description: \`Retenciones compra \${inv.number}\`,
        crossDocRef: isCredit ? effectiveCrossDoc : '',
        crossDocDate: inv.date,
        dueDate: isCredit ? dueDate : inv.date,
      }));`;

const rep3 = `      txLines.push(await buildTxLine({
        accountId: ivaAccountCache[accCode].id,
        thirdPartyId: inv.supplier_id,
        debit: 0,
        credit: amount,
        description: \`Retenciones compra \${inv.number}\`,
        crossDocRef: '',
        crossDocDate: null,
        dueDate: null,
      }));`;

if (!normContent.includes(target1) || !normContent.includes(target2) || !normContent.includes(target3)) {
  console.error('One or more targets not found!');
  process.exit(1);
}

normContent = normContent.replace(target1, rep1);
normContent = normContent.replace(target2, rep2);
normContent = normContent.replace(target3, rep3);

fs.writeFileSync(path, normContent.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated postPurchaseInvoice lines in api.ts');
