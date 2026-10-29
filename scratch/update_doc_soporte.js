const fs = require('fs');

const path = 'frontend/src/modules/doc-soporte.ts';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

// 1. Update default accounts to auxiliary 8 digits
const targetAccounts = `      accounts: {
        payable_code: '220505',
        expense_fallback_code: '5135',
        cash_account_code: '110505',
        bank_account_code: '111005',
        discount_code: '',
      },`;

const repAccounts = `      accounts: {
        payable_code: '22050501',
        expense_fallback_code: '51350501',
        cash_account_code: '11050501',
        bank_account_code: '11100501',
        discount_code: '',
      },`;

// 2. Update search rendering for accounts
const targetSearchAcct = `    if (matchedAccounts.length) {
      html += \`<div class="px-3 py-1 bg-amber-50 text-[10px] font-bold text-amber-800 uppercase">Cuentas Contables Directas (Gastos / Costos)</div>\`;
      html += matchedAccounts.map((a: any) => \`
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-b border-slate-100 hover:bg-amber-100/50 cursor-pointer block"
                onclick="window.selectDsProductItem('\${esc(a.id)}', 'account');">
          <div class="font-bold text-slate-800 font-mono">\${esc(a.code)} — \${esc(a.name)}</div>
          <div class="text-[10px] text-slate-500">Imputación contable directa a cuenta</div>
        </button>
      \`).join('');
    }`;

const repSearchAcct = `    if (matchedAccounts.length) {
      html += \`<div class="px-3 py-1 bg-amber-50 text-[10px] font-bold text-amber-800 uppercase">Cuentas Contables Directas (Gastos / Costos)</div>\`;
      html += matchedAccounts.map((a: any) => {
        const isAux = String(a.code || '').replace(/\\D/g, '').length >= 6;
        return \`
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-b border-slate-100 hover:bg-amber-100/50 cursor-pointer block"
                onclick="window.selectDsProductItem('\${esc(a.id)}', 'account');">
          <div class="font-bold text-slate-800 font-mono flex items-center justify-between">
            <span>\${esc(a.code)} — \${esc(a.name)}</span>
            <span class="flex gap-1">
              \${a.maneja_cruce ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Cruce</span>' : ''}
              \${a.requires_third_party ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">Tercero</span>' : ''}
              \${isAux ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Auxiliar</span>' : '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">Mayor</span>'}
            </span>
          </div>
          <div class="text-[10px] text-slate-500">Imputación contable directa a cuenta</div>
        </button>
      \`;
      }).join('');
    }`;

// 3. Update selectDsProductItem to validate auxiliary level
const targetSelectDs = `  (window as any).selectDsProductItem = (id: string, type: string) => {
    if (type === 'product') {
      const p = products.find((x: any) => x.id === id);
      if (p) addDsLine(p, null, withholdingRules);
    } else {
      const a = accounts.find((x: any) => x.id === id);
      if (a) addDsLine({ account_id: a.id, code: a.code, name: a.name, cost_price: 0 }, null, withholdingRules);
    }
    input.value = '';
    if (results) results.style.display = 'none';
  };`;

const repSelectDs = `  (window as any).selectDsProductItem = (id: string, type: string) => {
    if (type === 'product') {
      const p = products.find((x: any) => x.id === id);
      if (p) addDsLine(p, null, withholdingRules);
    } else {
      const a = accounts.find((x: any) => x.id === id);
      if (a) {
        const codeDigits = String(a.code || '').replace(/\\D/g, '');
        if (codeDigits.length <= 4) {
          showToast(\`La cuenta \${a.code} - \${a.name} es de nivel mayor. Selecciona una subcuenta auxiliar de al menos 6 u 8 dígitos.\`, 'warning');
          return;
        }
        addDsLine({ account_id: a.id, code: a.code, name: a.name, cost_price: 0, maneja_cruce: a.maneja_cruce, requires_third_party: a.requires_third_party }, null, withholdingRules);
      }
    }
    input.value = '';
    if (results) results.style.display = 'none';
  };`;

// 4. Update NDS generation with full symmetric accounting lines
const targetNds = `      const ndsTx = await pb.create('transactions', {
        date: (window as any).todayStr(),
        third_party_id: origTx?.third_party_id || null,
        tx_type_id: txTypeId,
        net_amount: origTx?.net_amount || 0,
        cross_amount: origTx?.cross_amount || 0,
        status: 'active',
        cross_number: origTx?.number || '',
        cross_doc_ref: origTx?.number || '',
        notes: \`NDS Ajuste a DS \${origTx?.number || ''}: \${(document.getElementById('nds-reason') as HTMLTextAreaElement).value || 'Ajuste documento soporte'}\`
      });`;

const repNds = `      // Reversión contable simétrica: consultar líneas del comprobante original
      const origLines = await pb.listAll('tx_lines', {
        filter: \`tx_id="\${pb.escapeFilterValue(targetTxId)}"\`,
        sort: 'line_order',
        expand: 'account_id'
      }).catch(() => []);

      const ndsReason = (document.getElementById('nds-reason') as HTMLTextAreaElement).value || 'Ajuste documento soporte';
      const todayStrVal = (window as any).todayStr ? (window as any).todayStr() : new Date().toISOString().slice(0, 10);

      const ndsLines = origLines.map((ol: any, idx: number) => {
        const isCruce = Boolean(ol.expand?.account_id?.maneja_cruce === true || ol.expand?.account_id?.maneja_cruce === 1);
        return {
          account_id: ol.account_id,
          debit: Number(ol.credit || 0), // Invertir crédito a débito
          credit: Number(ol.debit || 0), // Invertir débito a crédito
          description: \`Ajuste NDS a \${origTx?.number || ''}: \${ol.description || ''}\`.trim(),
          line_order: idx + 1,
          third_party_id: ol.third_party_id || origTx?.third_party_id || null,
          cross_doc_ref: isCruce ? (ol.cross_doc_ref || origTx?.number || '') : '',
          cross_doc_date: isCruce ? (ol.cross_doc_date || todayStrVal) : null,
          due_date: isCruce ? (ol.due_date || todayStrVal) : null,
          cost_center_id: ol.cost_center_id || null,
          branch_id: ol.branch_id || origTx?.branch_id || null,
        };
      });

      let ndsTx: any = null;
      if (typeof (window as any).API?.createTransaction === 'function' && ndsLines.length > 0) {
        ndsTx = await (window as any).API.createTransaction({
          tx_type_id: txTypeId,
          number: 'AUTO',
          date: todayStrVal,
          description: \`NDS Ajuste a DS \${origTx?.number || ''}: \${ndsReason}\`,
          third_party_id: origTx?.third_party_id || null,
          cross_enabled: true,
          cross_type: 'purchase_invoices',
          cross_number: origTx?.number || '',
          status: 'active',
          branch_id: origTx?.branch_id || null,
        }, ndsLines);
      } else {
        ndsTx = await pb.create('transactions', {
          date: todayStrVal,
          third_party_id: origTx?.third_party_id || null,
          tx_type_id: txTypeId,
          net_amount: origTx?.net_amount || 0,
          cross_amount: origTx?.cross_amount || 0,
          status: 'active',
          cross_number: origTx?.number || '',
          cross_doc_ref: origTx?.number || '',
          notes: \`NDS Ajuste a DS \${origTx?.number || ''}: \${ndsReason}\`
        });
      }`;

if (!content.includes(targetAccounts)) {
  console.error('Target targetAccounts not found!');
  process.exit(1);
}
if (!content.includes(targetSearchAcct)) {
  console.error('Target targetSearchAcct not found!');
  process.exit(1);
}
if (!content.includes(targetSelectDs)) {
  console.error('Target targetSelectDs not found!');
  process.exit(1);
}
if (!content.includes(targetNds)) {
  console.error('Target targetNds not found!');
  process.exit(1);
}

content = content.replace(targetAccounts, repAccounts);
content = content.replace(targetSearchAcct, repSearchAcct);
content = content.replace(targetSelectDs, repSelectDs);
content = content.replace(targetNds, repNds);

fs.writeFileSync(path, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated doc-soporte.ts');
