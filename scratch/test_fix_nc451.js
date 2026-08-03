function extractCrossDocRef(tx, invoice) {
  const txDesc = tx ? (tx.description || "") : "";
  const invNotes = invoice ? (invoice.notes || "") : "";
  if (txDesc.includes("[SIN_REFERENCIA]") || invNotes.includes("[SIN_REFERENCIA]")) return "";
  
  // 1. Direct cross_doc_ref from invoice
  if (invoice && invoice.cross_doc_ref && invoice.cross_doc_ref.trim()) {
    return invoice.cross_doc_ref.trim();
  }

  // 2. Parse from invoice notes
  if (invNotes) {
    let m = invNotes.match(/Ajuste a documento\s+([A-Za-z0-9\-]+)/i);
    if (m) return m[1].trim();
    m = invNotes.match(/(?:referente a|referencia a|factura)\s+(?:la\s+)?(?:Factura\s+)?(?:Electrónica\s+)?N[º°]?\s*([A-Za-z0-9\-]+)/i);
    if (m) return m[1].trim();
    m = invNotes.match(/(FV-[0-9]+)/i);
    if (m) return m[1].trim();
  }

  // 3. Parse from tx description
  if (txDesc) {
    let m = txDesc.match(/Ajuste a documento\s+([A-Za-z0-9\-]+)/i);
    if (m) return m[1].trim();
    m = txDesc.match(/(?:referente a|referencia a|factura)\s+(?:la\s+)?(?:Factura\s+)?(?:Electrónica\s+)?N[º°]?\s*([A-Za-z0-9\-]+)/i);
    if (m) return m[1].trim();
    m = txDesc.match(/(FV-[0-9]+)/i);
    if (m) return m[1].trim();
  }

  return "";
}

// Test with NC-00000451 invoice:
const testInv = {
  number: 'NC-00000451',
  notes: '[Ajuste DIAN: 1] Nota Crédito referente a la Factura Electrónica Nº FV-00003773. CUFE: 0139a538ca9764bb4a8281a1c55d4608be0ae7285ca679f940d0adcc9a757371e2d0e4bc67725da1608e4da1d01f045a',
  cross_doc_ref: 'FV-00003773'
};

const refFound = extractCrossDocRef(null, testInv);
console.log("Extracted crossDocRef:", refFound);
