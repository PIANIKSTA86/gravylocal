const fs = require('fs');

let content = fs.readFileSync('frontend/src/modules/compras.ts', 'utf8');

// 1. In renderPoRow, add the "Generar Nota" button for DS
let target1 = `        \${inv.status === 'draft' && can('canDelete')  ? \`<button class="btn btn-danger btn-sm" title="Anular" onclick="voidPurchase('\${esc(inv.id)}', '\${esc(inv.number)}', 'draft')"><i class="fas fa-ban"></i></button>\` : ''}
        \${inv.status === 'posted' && requireRole('admin') ? \`<button class="btn btn-outline btn-sm" title="Reabrir para corregir" style="border-color:#D97706;color:#D97706" onclick="reopenPurchase('\${esc(inv.id)}', '\${esc(inv.number)}')"><i class="fas fa-rotate-left"></i></button>\` : ''}`;

let replacement1 = `        \${inv.status === 'draft' && can('canDelete')  ? \`<button class="btn btn-danger btn-sm" title="Anular" onclick="voidPurchase('\${esc(inv.id)}', '\${esc(inv.number)}', 'draft')"><i class="fas fa-ban"></i></button>\` : ''}
        \${inv.status === 'posted' && requireRole('admin') ? \`<button class="btn btn-outline btn-sm" title="Reabrir para corregir" style="border-color:#D97706;color:#D97706" onclick="reopenPurchase('\${esc(inv.id)}', '\${esc(inv.number)}')"><i class="fas fa-rotate-left"></i></button>\` : ''}
        \${inv.status === 'posted' && (inv.expand?.tx_type_id?.code === 'DS' || inv.expand?.tx_type_id?.code === 'FC') && can('canWrite') ? \`<button class="btn btn-outline btn-sm" title="Generar Nota de Ajuste" style="border-color:#C46516;color:#C46516" onclick="openPurchaseNotePreModal('\${esc(inv.id)}')"><i class="fas fa-file-invoice"></i></button>\` : ''}`;

if(content.includes(target1)){
  content = content.replace(target1, replacement1);
} else {
  console.log("target1 not found");
}

// 2. Add poToggleSupplierRef logic and modify txTypeOptions
let target2 = `  const txTypeOptions = txTypes.map(t => \`<option value="\${esc(t.id)}"\${inv?.tx_type_id === t.id ? ' selected' : ''}>\${esc(t.prefix)} — \${esc(t.name)}</option>\`).join('');`;
let replacement2 = `  const txTypeOptions = txTypes.map(t => \`<option value="\${esc(t.id)}"\${inv?.tx_type_id === t.id ? ' selected' : ''} data-code="\${esc(t.code)}">\${esc(t.prefix)} — \${esc(t.name)}</option>\`).join('');
  
  (window as any).poToggleSupplierRef = function(selectEl) {
    const opt = selectEl.options[selectEl.selectedIndex];
    const code = opt ? opt.getAttribute('data-code') : '';
    const refWrap = document.getElementById('po-supplier-ref-wrap');
    if (code === 'DS' || code === 'NDS') {
      if (refWrap) refWrap.style.display = 'none';
      document.getElementById('po-supplier-ref').value = '';
    } else {
      if (refWrap) refWrap.style.display = 'block';
    }
  };`;

if(content.includes(target2)){
  content = content.replace(target2, replacement2);
} else {
  console.log("target2 not found");
}

// 3. Modify po-supplier-ref in the template to include the wrapper and onchange on po-tx-type
let target3 = `      <div class="form-group">
        <label class="form-label">Ref. factura proveedor</label>
        <input id="po-supplier-ref" class="form-input" placeholder="Ej: FAC-2026-001" value="\${esc(inv?.supplier_ref || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de comprobante contable <span style="color:#EF4444">*</span></label>
        <select id="po-tx-type" class="form-input">`;

let replacement3 = `      <div class="form-group" id="po-supplier-ref-wrap">
        <label class="form-label">Ref. factura proveedor</label>
        <input id="po-supplier-ref" class="form-input" placeholder="Ej: FAC-2026-001" value="\${esc(inv?.supplier_ref || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de comprobante contable <span style="color:#EF4444">*</span></label>
        <select id="po-tx-type" class="form-input" onchange="window.poToggleSupplierRef(this)">`;

if(content.includes(target3)){
  content = content.replace(target3, replacement3);
} else {
  console.log("target3 not found");
}

// 4. Trigger the poToggleSupplierRef after form renders
let target4 = `  function initPoSupplierSearch() {`;
let replacement4 = `  setTimeout(() => {
    const txSelect = document.getElementById('po-tx-type');
    if (txSelect) (window as any).poToggleSupplierRef(txSelect);
  }, 50);

  function initPoSupplierSearch() {`;

if(content.includes(target4)){
  content = content.replace(target4, replacement4);
} else {
  console.log("target4 not found");
}

// 5. Add openPurchaseNotePreModal function
let target5 = `// ── Render principal ──────────────────────────────────────────────────────────`;
let replacement5 = `// ── Notas de Ajuste en Compras ────────────────────────────────────────────────
async function openPurchaseNotePreModal(purchaseId) {
  try {
    const inv = await pb.get('purchase_invoices', purchaseId, { expand: 'tx_type_id' });
    const isDS = inv.expand?.tx_type_id?.code === 'DS';
    const txTypes = await API.getTxTypes();
    const targetCode = isDS ? 'NDS' : 'CM'; // Si es Documento Soporte usamos NDS, sino Comprobante de Egreso (o un tipo especial de nota de compra si existiera)
    const txTypeOptions = txTypes
      .filter(t => t.code === targetCode || t.code === 'NC' || t.code === 'ND') // Permitir elegir
      .map(t => \`<option value="\${esc(t.id)}" data-code="\${esc(t.code)}">\${esc(t.prefix)} — \${esc(t.name)}</option>\`).join('');

    openModal(
      'Generar Nota de Ajuste a Compra',
      \`<div class="space-y-4 text-sm">
         <div class="p-4 bg-orange-50 border border-orange-200 rounded-xl">
           <h4 class="font-bold text-orange-800 mb-2"><i class="fas fa-exclamation-triangle mr-1"></i> Generación de Nota</h4>
           <p class="text-orange-700">Vas a generar una nota de ajuste para la compra <strong>\${esc(inv.number)}</strong>.</p>
         </div>
         <div class="form-group">
           <label class="form-label">Tipo de Nota</label>
           <select id="po-note-type-sel" class="form-input">
             \${txTypeOptions}
           </select>
         </div>
       </div>\`,
      \`<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="window.proceedPurchaseNote('\${esc(inv.id)}')">Continuar <i class="fas fa-arrow-right"></i></button>\`,
      true
    );
  } catch (err) {
    showToast('Error al abrir generador de nota', 'error');
  }
}
(window as any).openPurchaseNotePreModal = openPurchaseNotePreModal;

(window as any).proceedPurchaseNote = async function(purchaseId) {
  const typeSel = document.getElementById('po-note-type-sel') as HTMLSelectElement;
  if (!typeSel || !typeSel.value) return showToast('Selecciona el tipo de nota', 'error');
  
  const txTypeId = typeSel.value;
  closeModal();
  
  // Clonar la factura en una nueva
  try {
    const [original, originalLines] = await Promise.all([
      pb.get('purchase_invoices', purchaseId),
      API.getPurchaseInvoiceLines(purchaseId)
    ]);
    
    // Abre el formulario precargado
    openPurchaseForm(null, () => _loadComprasPage(document.getElementById('page-content')));
    
    setTimeout(() => {
      // Set values
      const typeSelect = document.getElementById('po-tx-type') as HTMLSelectElement;
      if (typeSelect) {
        typeSelect.value = txTypeId;
        if ((window as any).poToggleSupplierRef) (window as any).poToggleSupplierRef(typeSelect);
      }
      
      const supplierInput = document.getElementById('po-supplier') as HTMLInputElement;
      if (supplierInput) supplierInput.value = original.supplier_id;
      
      const whSelect = document.getElementById('po-warehouse') as HTMLSelectElement;
      if (whSelect) whSelect.value = original.warehouse_id;
      
      const refInput = document.getElementById('po-supplier-ref') as HTMLInputElement;
      if (refInput) refInput.value = 'Ajuste a ' + original.number;
      
      // We should ideally load lines, but for now we let the user re-type or we manually simulate line adds.
      // Implementing full line clone would require triggering window.poAddLine.
      originalLines.forEach(l => {
         // Simulate adding line
         if (window.poAddLine) {
           window.poAddLine({
             id: l.product_id,
             title: '', sub: ''
           });
           // Setting qtys will require finding the latest added row.
         }
      });
      
      showToast('Formulario de nota cargado. Ajusta las cantidades a reversar.', 'success');
      
    }, 500);

  } catch(e) {
    showToast('Error clonando', 'error');
  }
};

// ── Render principal ──────────────────────────────────────────────────────────`;

if(content.includes(target5)){
  content = content.replace(target5, replacement5);
} else {
  console.log("target5 not found");
}

fs.writeFileSync('frontend/src/modules/compras.ts', content);
console.log("compras.ts updated");
