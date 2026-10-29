const fs = require('fs');

const path = 'pb_hooks/bulk_tx.pb.js';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const target = `      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || {};
        const accountId = String(line.account_id || "").trim();
        if (!accountId) {
          throw new Error(\`Línea \${i + 1}: account_id es obligatorio.\`);
        }

        const crossRef = String(line.cross_doc_ref || "").trim();
        const isSinRef = String(txData.description || "").includes("[SIN_REFERENCIA]");
        if (!crossRef && !isSinRef) {
          try {
            const accRec = txApp.findRecordById("accounts", accountId);
            if (accRec && (accRec.getBool("maneja_cruce") || accRec.get("maneja_cruce") === true || accRec.get("maneja_cruce") === 1)) {
              throw new Error(\`Línea \${i + 1}: La cuenta "\${accRec.getString("code")} - \${accRec.getString("name")}" está configurada para uso de documento de cruce. Es obligatorio registrar un documento de cruce.\`);
            }
          } catch (accErr) {
            if (accErr.message && accErr.message.includes("documento de cruce")) {
              throw accErr;
            }
          }
        }

        const lineRec = new Record(linesCol);
        lineRec.set("tx_id",          txId);
        lineRec.set("account_id",     accountId);
        lineRec.set("debit",          Number(line.debit  || 0));
        lineRec.set("credit",         Number(line.credit || 0));
        lineRec.set("description",    String(line.description || ""));
        lineRec.set("line_order",     Number(line.line_order != null ? line.line_order : i + 1));
        lineRec.set("cross_doc_ref",  crossRef);
        if (line.cross_doc_date) {
          lineRec.set("cross_doc_date", String(line.cross_doc_date || "").trim());
        }
        if (line.due_date) {
          lineRec.set("due_date", String(line.due_date || "").trim());
        }`;

const replacement = `      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || {};
        const accountId = String(line.account_id || "").trim();
        if (!accountId) {
          throw new Error(\`Línea \${i + 1}: account_id es obligatorio.\`);
        }

        let accRec = null;
        try {
          accRec = txApp.findRecordById("accounts", accountId);
        } catch (_) {}
        if (!accRec) {
          throw new Error(\`Línea \${i + 1}: Cuenta contable no encontrada (ID: \${accountId}).\`);
        }
        if (accRec.getBool("active") === false) {
          throw new Error(\`Línea \${i + 1}: La cuenta "\${accRec.getString("code")} - \${accRec.getString("name")}" se encuentra inactiva.\`);
        }

        // Sanitización y validación estricta de documento de cruce según maneja_cruce
        const isAccCruce = Boolean(accRec.getBool("maneja_cruce") || accRec.get("maneja_cruce") === true || accRec.get("maneja_cruce") === 1);
        let crossRef = "";
        let crossDocDate = "";
        let dueDate = "";

        if (isAccCruce) {
          crossRef = String(line.cross_doc_ref || "").trim();
          const isSinRef = String(txData.description || "").includes("[SIN_REFERENCIA]");
          if (!crossRef && !isSinRef) {
            throw new Error(\`Línea \${i + 1}: La cuenta "\${accRec.getString("code")} - \${accRec.getString("name")}" está configurada para uso de documento de cruce. Es obligatorio registrar un documento de cruce.\`);
          }
          crossDocDate = String(line.cross_doc_date || "").trim();
          dueDate = String(line.due_date || "").trim();
        } else {
          // Si la cuenta NO maneja cruce, neutralizar cualquier valor residual para evitar contaminación de cartera
          crossRef = "";
          crossDocDate = "";
          dueDate = "";
        }

        // Validación de tercero obligatorio
        const reqThird = Boolean(accRec.getBool("requires_third_party") || accRec.get("requires_third_party") === true || accRec.get("requires_third_party") === 1);
        const lineThird = String(line.third_party_id || "").trim();
        if (reqThird && !lineThird) {
          throw new Error(\`Línea \${i + 1}: La cuenta "\${accRec.getString("code")} - \${accRec.getString("name")}" requiere tercero obligatorio.\`);
        }

        const lineRec = new Record(linesCol);
        lineRec.set("tx_id",          txId);
        lineRec.set("account_id",     accountId);
        lineRec.set("debit",          Number(line.debit  || 0));
        lineRec.set("credit",         Number(line.credit || 0));
        lineRec.set("description",    String(line.description || ""));
        lineRec.set("line_order",     Number(line.line_order != null ? line.line_order : i + 1));
        lineRec.set("cross_doc_ref",  crossRef);
        if (crossDocDate) {
          lineRec.set("cross_doc_date", crossDocDate);
        }
        if (dueDate) {
          lineRec.set("due_date", dueDate);
        }`;

if (!content.includes(target)) {
  console.error('Target not found in bulk_tx.pb.js!');
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(path, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated bulk_tx.pb.js');

// Also update tenant hooks if they contain the target
const tenantPaths = [
  'empresas/empresa_8091/pb_hooks/bulk_tx.pb.js',
  'empresas/empresa_8092/pb_hooks/bulk_tx.pb.js',
  'empresas/empresa_8093/pb_hooks/bulk_tx.pb.js',
  'empresas/empresa_8094/pb_hooks/bulk_tx.pb.js',
  'empresas/pb_hooks/bulk_tx.pb.js'
];

tenantPaths.forEach(tp => {
  if (fs.existsSync(tp)) {
    let tContent = fs.readFileSync(tp, 'utf8').replace(/\r\n/g, '\n');
    if (tContent.includes(target)) {
      tContent = tContent.replace(target, replacement);
      fs.writeFileSync(tp, tContent.replace(/\n/g, '\r\n'), 'utf8');
      console.log('Successfully updated', tp);
    }
  }
});
