const fs = require('fs');

function patchPhBilling(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isCRLF = content.includes('\r\n');
  const eol = isCRLF ? '\r\n' : '\n';

  const oldBlock = [
    '        if (!txRec) {',
    '          // Crear Comprobante Contable CF solo si no existe previamente',
    '          txRec = new Record(txCollection);',
    '          txRec.set("tx_type_id", cfType.id);',
    '          txRec.set("number", invNumber);',
    '          txRec.set("date", invDate);',
    '          txRec.set("description", `Causación cuota de administración ${period} - Unidad ${propInfo.code || ""} (${propInfo.name || ""})`);',
    '          txRec.set("third_party_id", ownerId);',
    '          txRec.set("status", "active");',
    '          txRec.set("cross_enabled", true);',
    '          txRec.set("cross_type", "ph_invoices");',
    '          txRec.set("cross_number", invNumber);',
    '          txRec.set("cross_amount", invTotal);',
    '          txApp.save(txRec);'
  ].join(eol);

  const newBlock = [
    '        if (!txRec) {',
    '          // Crear Comprobante Contable CF solo si no existe previamente',
    '          txRec = new Record(txCollection);',
    '          txRec.set("tx_type_id", cfType.id);',
    '          txRec.set("number", invNumber);',
    '          txRec.set("date", invDate);',
    '          txRec.set("description", `Causación cuota de administración ${period} - Unidad ${propInfo.code || ""} (${propInfo.name || ""})`);',
    '          txRec.set("third_party_id", ownerId);',
    '          txRec.set("status", "active");',
    '          txRec.set("cross_enabled", true);',
    '          txRec.set("cross_type", "ph_invoices");',
    '          txRec.set("cross_number", invNumber);',
    '          txRec.set("cross_amount", invTotal);',
    '          txApp.save(txRec);',
    '        } else {',
    '          // Re-sincronizar comprobante si ya existía (ej. re-liquidación de período)',
    '          txRec.set("status", "active");',
    '          txRec.set("cross_enabled", true);',
    '          txRec.set("cross_type", "ph_invoices");',
    '          txRec.set("cross_number", invNumber);',
    '          txRec.set("cross_amount", invTotal);',
    '          txApp.save(txRec);',
    '          txApp.db().newQuery("DELETE FROM tx_lines WHERE tx_id = {:txId}").bind({ txId: txRec.id }).execute();',
    '        }'
  ].join(eol);

  if (!content.includes(oldBlock)) {
    console.error('Old block not found in', filePath);
    return false;
  }
  
  content = content.replace(oldBlock, newBlock);

  const oldClosing = [
    '            txApp.save(creditLine);',
    '          }',
    '        }',
    '',
    '        // Actualizar estado de la factura a \'posted\' y vincular tx_id'
  ].join(eol);

  const newClosing = [
    '            txApp.save(creditLine);',
    '          }',
    '',
    '        // Actualizar estado de la factura a \'posted\' y vincular tx_id'
  ].join(eol);

  if (!content.includes(oldClosing)) {
    console.error('Old closing not found in', filePath);
    return false;
  }

  content = content.replace(oldClosing, newClosing);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched', filePath);
  return true;
}

patchPhBilling('pb_hooks/ph_billing.pb.js');
patchPhBilling('empresas/empresa_8094/pb_hooks/ph_billing.pb.js');

