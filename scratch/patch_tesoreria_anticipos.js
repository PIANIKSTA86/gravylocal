const fs = require('fs');

const files = [
  'pb_hooks/tesoreria.pb.js',
  'empresas/empresa_8094/pb_hooks/tesoreria.pb.js'
];

const oldTarget = `      while (remainingAnt > 0.01) {
        const quotaAmt = Math.round(Math.min(remainingAnt, targetQuota) * 100) / 100;
        const pCode = curPeriod.replace('-', '');
        const isPartial = quotaAmt < targetQuota && adminFee > 0;
        const partialLabel = isPartial ? \` (Abono parcial: $\${quotaAmt} de $\${targetQuota})\` : '';
        plannedLines.push({
          account_id: cxcAccId,
          third_party_id: third_party_id,
          cross_doc_ref: \`ANTICIPO-\${pCode}-\${propertyId}\`,
          debit: 0,
          credit: quotaAmt,
          description: \`Abono anticipado cuota \${curPeriod}\${partialLabel} - \${propCodeName}\`
        });
        remainingAnt = Math.round((remainingAnt - quotaAmt) * 100) / 100;
        curPeriod = getNextPeriodStr(curPeriod);
        if (quotaAmt >= remainingAnt && remainingAnt <= 0.01) break;
      }`;

const newTarget = `      while (remainingAnt > 0.01) {
        const quotaAmt = Math.round(Math.min(remainingAnt, targetQuota) * 100) / 100;
        const pCode = curPeriod.replace('-', '');
        const isPartial = quotaAmt < targetQuota && adminFee > 0;
        const partialLabel = isPartial ? \` (Abono parcial: $\${quotaAmt} de $\${targetQuota})\` : '';

        // Determinar la referencia limpia de cuota de administración CF-YYYYMM-XXXXXX-ADM
        let targetDocRef = "";
        try {
          const existingInv = $app.findFirstRecordByFilter("ph_invoices", "property_id = '" + propertyId + "' && period = '" + curPeriod + "' && status != 'voided'");
          if (existingInv && existingInv.get("number")) {
            targetDocRef = existingInv.get("number") + "-ADM";
          }
        } catch(_) {}

        if (!targetDocRef) {
          let propSeq = "";
          try {
            const priorInvs = $app.findRecordsByFilter("ph_invoices", "property_id = '" + propertyId + "' && number ~ 'CF-'", "-period", 1, 0);
            if (priorInvs && priorInvs.length > 0 && priorInvs[0].get("number")) {
              propSeq = priorInvs[0].get("number").split("-")[2];
            }
          } catch(_) {}

          if (propSeq) {
            targetDocRef = "CF-" + pCode + "-" + propSeq + "-ADM";
          } else {
            const pCodeStr = propRecord ? String(propRecord.get("code") || "") : "";
            targetDocRef = "CF-" + pCode + "-" + (pCodeStr || "ADM") + "-ADM";
          }
        }

        plannedLines.push({
          account_id: cxcAccId,
          third_party_id: third_party_id,
          cross_doc_ref: targetDocRef,
          debit: 0,
          credit: quotaAmt,
          description: "Abono a " + targetDocRef + partialLabel + " - " + propCodeName
        });
        remainingAnt = Math.round((remainingAnt - quotaAmt) * 100) / 100;
        curPeriod = getNextPeriodStr(curPeriod);
        if (quotaAmt >= remainingAnt && remainingAnt <= 0.01) break;
      }`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  // Normalize CRLF to LF for replacement
  const isCRLF = code.includes('\r\n');
  const codeLF = code.replace(/\r\n/g, '\n');
  const oldTargetLF = oldTarget.replace(/\r\n/g, '\n');
  const newTargetLF = newTarget.replace(/\r\n/g, '\n');

  if (codeLF.includes(oldTargetLF)) {
    const replaced = codeLF.replace(oldTargetLF, newTargetLF);
    fs.writeFileSync(file, isCRLF ? replaced.replace(/\n/g, '\r\n') : replaced, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Target not found in ${file}`);
  }
}

