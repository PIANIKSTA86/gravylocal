const fs = require('fs');
const path = require('path');

// 1. Refactor frontend/src/modules/doc-soporte.ts
const dsPath = path.join(__dirname, '..', 'frontend', 'src', 'modules', 'doc-soporte.ts');
let dsContent = fs.readFileSync(dsPath, 'utf8');

// A. Update loadDocSoportePage to query support_documents first
const oldLoadPromise = `  const [docs, txs, purInvoices] = await Promise.all([
    pb.listAll('einvoice_docs', { 
      fields: 'id,tx_id,status,cufe,hash,dian_response', 
      sort: '-id' 
    }).catch(() => []),
    pb.listAll('transactions', { 
      filter: txFilter, 
      sort: '-date,-id', 
      expand: 'tx_type_id,third_party_id' 
    }).catch(() => []),
    pb.listAll('purchase_invoices', { 
      filter: purFilter, 
      sort: '-date,-id', 
      expand: 'supplier_id,tx_type_id,cost_center_id' 
    }).catch(() => [])
  ]);`;

const newLoadPromise = `  const [docs, txs, suppDocs, purInvoices] = await Promise.all([
    pb.listAll('einvoice_docs', { 
      fields: 'id,tx_id,status,cufe,hash,dian_response', 
      sort: '-id' 
    }).catch(() => []),
    pb.listAll('transactions', { 
      filter: txFilter, 
      sort: '-date,-id', 
      expand: 'tx_type_id,third_party_id' 
    }).catch(() => []),
    pb.listAll('support_documents', {
      sort: '-date,-id',
      expand: 'supplier_id,tx_type_id,cost_center_id'
    }).catch(() => []),
    pb.listAll('purchase_invoices', { 
      filter: purFilter, 
      sort: '-date,-id', 
      expand: 'supplier_id,tx_type_id,cost_center_id' 
    }).catch(() => [])
  ]);`;

if (dsContent.includes(oldLoadPromise)) {
  dsContent = dsContent.replace(oldLoadPromise, newLoadPromise);
}

// B. Populate dsList prioritizing suppDocs
const oldPurLoop = `  purInvoices.forEach((p: any) => {
    const code = String(p.expand?.tx_type_id?.code || '').toUpperCase();
    const prefix = String(p.number || '').split('-')[0].toUpperCase();
    if (code === 'DS' || code === 'NDS' || dsPrefixes.has(prefix) || String(p.number || '').startsWith('DS')) {
      const doc = p.tx_id ? docMap.get(p.tx_id) : null;
      const statusDian = doc ? (doc.status || 'pendiente') : (p.status === 'draft' ? 'borrador' : 'pendiente');

      dsList.push({
        id: p.id,
        tx_id: p.tx_id || '',
        number: p.number || 'DS-BORRADOR',
        date: p.date || '',
        supplier_id: p.supplier_id || '',
        supplier_name: p.expand?.supplier_id?.name || 'Sujeto No Obligado',
        supplier_nit: p.expand?.supplier_id?.doc_number || 'NIT',
        total: p.total || p.payable_total || 0,
        subtotal: p.subtotal || 0,
        ret_total: p.ret_total || 0,
        status: p.status || 'draft',
        status_dian: statusDian,
        cuds: doc?.cufe || doc?.hash || '',
        xml_content: doc?.xml_content || '',
        dian_response: doc?.dian_response || '',
        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        cost_center_id: p.cost_center_id || '',
        cost_center_code: p.expand?.cost_center_id?.code || '',
        cost_center_name: p.expand?.cost_center_id?.name || '',
        expand: p.expand
      });
    }
  });`;

const newPurLoop = `  const processedIds = new Set<string>();

  // 1. Colección nativa desacoplada support_documents
  suppDocs.forEach((s: any) => {
    processedIds.add(s.id);
    if (s.tx_id) processedIds.add(s.tx_id);
    const doc = s.tx_id ? docMap.get(s.tx_id) : null;
    const statusDian = s.status_dian || (doc ? (doc.status || 'pendiente') : (s.status === 'draft' ? 'borrador' : 'pendiente'));

    dsList.push({
      id: s.id,
      tx_id: s.tx_id || '',
      number: s.number || 'DS-BORRADOR',
      date: s.date || '',
      supplier_id: s.supplier_id || '',
      supplier_name: s.expand?.supplier_id?.name || 'Sujeto No Obligado',
      supplier_nit: s.expand?.supplier_id?.doc_number || 'NIT',
      total: s.total || s.payable_total || 0,
      subtotal: s.subtotal || 0,
      ret_total: s.ret_total || 0,
      status: s.status || 'draft',
      status_dian: statusDian,
      cuds: s.cuds || doc?.cufe || doc?.hash || '',
      xml_content: s.xml_content || doc?.xml_content || '',
      dian_response: s.dian_response || doc?.dian_response || '',
      doc_type: s.doc_type || 'DS',
      cost_center_id: s.cost_center_id || '',
      cost_center_code: s.expand?.cost_center_id?.code || '',
      cost_center_name: s.expand?.cost_center_id?.name || '',
      expand: s.expand
    });
  });

  // 2. Compatibilidad retroactiva con compras legacy pendientes de migración
  purInvoices.forEach((p: any) => {
    if (processedIds.has(p.id) || (p.tx_id && processedIds.has(p.tx_id))) return;
    const code = String(p.expand?.tx_type_id?.code || '').toUpperCase();
    const prefix = String(p.number || '').split('-')[0].toUpperCase();
    if (code === 'DS' || code === 'NDS' || dsPrefixes.has(prefix) || String(p.number || '').startsWith('DS')) {
      const doc = p.tx_id ? docMap.get(p.tx_id) : null;
      const statusDian = doc ? (doc.status || 'pendiente') : (p.status === 'draft' ? 'borrador' : 'pendiente');

      dsList.push({
        id: p.id,
        tx_id: p.tx_id || '',
        number: p.number || 'DS-BORRADOR',
        date: p.date || '',
        supplier_id: p.supplier_id || '',
        supplier_name: p.expand?.supplier_id?.name || 'Sujeto No Obligado',
        supplier_nit: p.expand?.supplier_id?.doc_number || 'NIT',
        total: p.total || p.payable_total || 0,
        subtotal: p.subtotal || 0,
        ret_total: p.ret_total || 0,
        status: p.status || 'draft',
        status_dian: statusDian,
        cuds: doc?.cufe || doc?.hash || '',
        xml_content: doc?.xml_content || '',
        dian_response: doc?.dian_response || '',
        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        cost_center_id: p.cost_center_id || '',
        cost_center_code: p.expand?.cost_center_id?.code || '',
        cost_center_name: p.expand?.cost_center_id?.name || '',
        expand: p.expand
      });
    }
  });`;

if (dsContent.includes(oldPurLoop)) {
  dsContent = dsContent.replace(oldPurLoop, newPurLoop);
}

// C. openNuevoDsModal: Load support_documents first
const oldModalLoad = `  if (editId) {
    existingPur = await pb.get('purchase_invoices', editId, { expand: 'supplier_id,tx_type_id' }).catch(() => null);
    if (!existingPur) {
      try {
        existingPur = await pb.getFirstRecordByFilter('purchase_invoices', \`tx_id = "\${pb.escapeFilterValue(editId)}"\`, { expand: 'supplier_id,tx_type_id' });
      } catch (_) {}
    }
    if (existingPur) {
      existingLines = await pb.listAll('purchase_invoice_lines', { filter: \`invoice_id = "\${existingPur.id}"\`, expand: 'product_id,account_id' });
    }
  }`;

const newModalLoad = `  if (editId) {
    existingPur = await pb.get('support_documents', editId, { expand: 'supplier_id,tx_type_id' }).catch(() => null);
    if (!existingPur) {
      try {
        existingPur = await pb.getFirstRecordByFilter('support_documents', \`tx_id = "\${pb.escapeFilterValue(editId)}"\`, { expand: 'supplier_id,tx_type_id' });
      } catch (_) {}
    }
    if (existingPur) {
      existingLines = await pb.listAll('support_document_lines', { filter: \`document_id = "\${existingPur.id}"\`, expand: 'product_id,account_id' }).catch(() => []);
    } else {
      existingPur = await pb.get('purchase_invoices', editId, { expand: 'supplier_id,tx_type_id' }).catch(() => null);
      if (!existingPur) {
        try {
          existingPur = await pb.getFirstRecordByFilter('purchase_invoices', \`tx_id = "\${pb.escapeFilterValue(editId)}"\`, { expand: 'supplier_id,tx_type_id' });
        } catch (_) {}
      }
      if (existingPur) {
        existingLines = await pb.listAll('purchase_invoice_lines', { filter: \`invoice_id = "\${existingPur.id}"\`, expand: 'product_id,account_id' }).catch(() => []);
      }
    }
  }`;

if (dsContent.includes(oldModalLoad)) {
  dsContent = dsContent.replace(oldModalLoad, newModalLoad);
}

// D. submitDsForm: Create / update support_documents & call postSupportDocument
const oldSaveLogic = `      let purInv: any;
      if (existingPur && existingPur.id) {
        // ACTUALIZAR BORRADOR EXISTENTE (Sin crear registros duplicados ni alterar consecutivos)
        if (typeof (window as any).API?.updatePurchaseInvoice === 'function') {
          purInv = await (window as any).API.updatePurchaseInvoice(existingPur.id, headerPayload, linesData);
        } else {
          await pb.update('purchase_invoices', existingPur.id, headerPayload);
          const oldLines = await pb.listAll('purchase_invoice_lines', {
            filter: \`invoice_id="\${pb.escapeFilterValue(existingPur.id)}"\`
          });
          for (const ol of oldLines) {
            await pb.delete('purchase_invoice_lines', ol.id);
          }
          for (let i = 0; i < linesData.length; i++) {
            await pb.create('purchase_invoice_lines', {
              invoice_id: existingPur.id,
              line_order: i + 1,
              ...linesData[i]
            });
          }
          purInv = await pb.get('purchase_invoices', existingPur.id, { expand: 'supplier_id,tx_type_id' });
        }
      } else {
        // CREAR NUEVO DOCUMENTO SOPORTE
        if (typeof (window as any).API?.createPurchaseInvoice === 'function') {
          purInv = await (window as any).API.createPurchaseInvoice(headerPayload, linesData);
        } else {
          purInv = await pb.create('purchase_invoices', headerPayload);
          for (let i = 0; i < linesData.length; i++) {
            await pb.create('purchase_invoice_lines', {
              invoice_id: purInv.id,
              line_order: i + 1,
              ...linesData[i]
            });
          }
        }
      }

      closeModal();

      if (isEmitDirect) {
        showToast('Borrador generado. Firmando y contabilizando ante la DIAN...', 'info');
        const postedRes = await (window as any).API.postPurchaseInvoice(purInv.id);`;

const newSaveLogic = `      let purInv: any;
      if (existingPur && existingPur.id) {
        // ACTUALIZAR BORRADOR EXISTENTE
        if (typeof (window as any).API?.updateSupportDocument === 'function') {
          purInv = await (window as any).API.updateSupportDocument(existingPur.id, headerPayload, linesData);
        } else if (typeof (window as any).API?.updatePurchaseInvoice === 'function') {
          purInv = await (window as any).API.updatePurchaseInvoice(existingPur.id, headerPayload, linesData);
        } else {
          await pb.update('support_documents', existingPur.id, headerPayload).catch(() => pb.update('purchase_invoices', existingPur.id, headerPayload));
          purInv = await pb.get('support_documents', existingPur.id, { expand: 'supplier_id,tx_type_id' }).catch(() => pb.get('purchase_invoices', existingPur.id, { expand: 'supplier_id,tx_type_id' }));
        }
      } else {
        // CREAR NUEVO DOCUMENTO SOPORTE EN COLECCIÓN DEDICADA
        if (typeof (window as any).API?.createSupportDocument === 'function') {
          purInv = await (window as any).API.createSupportDocument(headerPayload, linesData);
        } else {
          purInv = await pb.create('support_documents', headerPayload);
          for (let i = 0; i < linesData.length; i++) {
            await pb.create('support_document_lines', {
              document_id: purInv.id,
              line_order: i + 1,
              ...linesData[i]
            });
          }
        }
      }

      closeModal();

      if (isEmitDirect) {
        showToast('Borrador generado. Firmando y contabilizando ante la DIAN...', 'info');
        const postFn = (window as any).API?.postSupportDocument || (window as any).API?.postPurchaseInvoice;
        const postedRes = await postFn(purInv.id);`;

if (dsContent.includes(oldSaveLogic)) {
  dsContent = dsContent.replace(oldSaveLogic, newSaveLogic);
}

// E. Update direct posting calls
dsContent = dsContent.replace(
  `const res = await (window as any).API.postPurchaseInvoice(id);`,
  `const postFn = (window as any).API?.postSupportDocument || (window as any).API?.postPurchaseInvoice;\n    const res = await postFn(id);`
);
dsContent = dsContent.replace(
  `const posted = await (window as any).API.postPurchaseInvoice(id);`,
  `const postFn = (window as any).API?.postSupportDocument || (window as any).API?.postPurchaseInvoice;\n          const posted = await postFn(id);`
);

// F. Update cross_type in NDS modal
dsContent = dsContent.replace(
  `cross_type: 'purchase_invoices',`,
  `cross_type: 'support_documents',`
);

// G. viewDsDetail fallback
dsContent = dsContent.replace(
  `d = await pb.get('purchase_invoices', id);`,
  `d = await pb.get('support_documents', id).catch(() => pb.get('purchase_invoices', id));`
);

fs.writeFileSync(dsPath, dsContent, 'utf8');
console.log('doc-soporte.ts successfully patched!');

// 2. Refactor frontend/src/modules/facturacion-dian.ts
const dianPath = path.join(__dirname, '..', 'frontend', 'src', 'modules', 'facturacion-dian.ts');
let dianContent = fs.readFileSync(dianPath, 'utf8');

// Filter out DS/NDS resolutions in facturacion-dian so it focuses strictly on sales (FEV, POS, NC, ND)
dianContent = dianContent.replace(
  `pb.listAll('dian_resolutions', { filter: 'active=true' })`,
  `pb.listAll('dian_resolutions', { filter: 'active=true && document_type != "DS" && document_type != "NDS"' })`
);

// Remove purchase_invoices from facturacion-dian
dianContent = dianContent.replace(
  `purchases.forEach((p: any) => { if (p.tx_id) { totalMap.set(p.tx_id, p.total); invoiceIdMap.set(p.tx_id, p.id); } });`,
  `// purchases excluida: los documentos soporte se gestionan en su propio módulo doc-soporte`
);

fs.writeFileSync(dianPath, dianContent, 'utf8');
console.log('facturacion-dian.ts successfully patched!');

