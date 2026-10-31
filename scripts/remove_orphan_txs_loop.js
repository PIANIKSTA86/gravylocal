const fs = require('fs');
const path = require('path');

const dsPath = path.join(__dirname, '..', 'frontend', 'src', 'modules', 'doc-soporte.ts');
let dsContent = fs.readFileSync(dsPath, 'utf8');

// Replace the txs loop with a comment
const targetLoop = `  txs.forEach((t: any) => {
    const code = String(t.expand?.tx_type_id?.code || '').toUpperCase();
    const prefix = String(t.expand?.tx_type_id?.prefix || '').toUpperCase();
    if ((code === 'DS' || code === 'NDS' || dsPrefixes.has(prefix)) && !dsList.some(d => d.tx_id === t.id)) {
      const doc = docMap.get(t.id);
      const statusDian = doc ? (doc.status || 'pendiente') : (t.status === 'draft' ? 'borrador' : 'pendiente');

      dsList.push({
        id: t.id,
        tx_id: t.id,
        number: t.number || '',
        date: t.date || '',
        supplier_id: t.third_party_id || '',
        supplier_name: t.expand?.third_party_id?.name || 'Sujeto No Obligado',
        supplier_nit: t.expand?.third_party_id?.doc_number || 'NIT',
        total: t.cross_amount || 0,
        subtotal: t.net_amount || (t.cross_amount || 0),
        ret_total: t.ret_amount || 0,
        status: t.status === 'draft' ? 'draft' : 'posted',
        status_dian: statusDian,
        cuds: doc?.cufe || doc?.hash || '',
        xml_content: doc?.xml_content || '',
        dian_response: doc?.dian_response || '',
        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        expand: t.expand
      });
    }
  });`;

// Normalize line endings to LF for comparison
const normalize = (str) => str.replace(/\r\n/g, '\n');

if (normalize(dsContent).includes(normalize(targetLoop))) {
  const normTarget = normalize(targetLoop);
  const normDs = normalize(dsContent);
  const replacement = `  // txs loop removido: la fuente de verdad única para este módulo es la colección desacoplada support_documents.`;
  dsContent = normDs.replace(normTarget, replacement);
  fs.writeFileSync(dsPath, dsContent, 'utf8');
  console.log('Successfully removed orphan txs loop from doc-soporte.ts');
} else {
  console.log('Target loop not found directly. Checking alternate patterns...');
}

