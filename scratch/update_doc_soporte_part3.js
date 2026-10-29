const fs = require('fs');

const path = 'frontend/src/modules/doc-soporte.ts';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

// 1. Map cost_center_id, cost_center_code, cost_center_name in loadDocSoportePage
const targetDsItem = `        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        expand: p.expand
      });`;

const repDsItem = `        doc_type: code === 'NDS' ? 'NDS' : 'DS',
        cost_center_id: p.cost_center_id || '',
        cost_center_code: p.expand?.cost_center_id?.code || '',
        cost_center_name: p.expand?.cost_center_id?.name || '',
        expand: p.expand
      });`;

// 2. Show cost_center badge in renderDsRows
const targetRowSupplier = `        <td class="p-3 text-slate-800 font-medium">
          <div>\${esc(d.supplier_name)}</div>
          <div class="text-xs text-slate-400">NIT: \${esc(d.supplier_nit)}</div>
        </td>`;

const repRowSupplier = `        <td class="p-3 text-slate-800 font-medium">
          <div>\${esc(d.supplier_name)}</div>
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span>NIT: \${esc(d.supplier_nit)}</span>
            \${d.cost_center_code ? \`<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title="\${esc(d.cost_center_name || '')}"><i class="fas fa-sitemap mr-0.5"></i>CC: \${esc(d.cost_center_code)}</span>\` : ''}
          </div>
        </td>`;

// 3. Filter matchedAccounts in initDsGlobalProductSearch strictly to Level 5 auxiliary accounts
const targetFilterAccts = `    let matchedAccounts: any[] = [];
    if (filter === 'ACCOUNT' || filter === 'ALL' || filter === 'SERVICIO') {
      matchedAccounts = accounts.filter((a: any) => {
        const code = String(a.code || '');
        const isCostOrExpense = code.startsWith('5') || code.startsWith('6') || code.startsWith('14') || code.startsWith('2') || code.startsWith('1');
        const matchQ = !q || \`\${a.code} \${a.name}\`.toLowerCase().includes(q);
        return isCostOrExpense && matchQ;
      }).slice(0, 15);
    }`;

const repFilterAccts = `    let matchedAccounts: any[] = [];
    if (filter === 'ACCOUNT' || filter === 'ALL' || filter === 'SERVICIO') {
      matchedAccounts = accounts.filter((a: any) => {
        const code = String(a.code || '');
        const digits = code.replace(/\\D/g, '');
        const isAuxiliary = (a.level >= 5 || digits.length >= 8);
        const isCostOrExpense = code.startsWith('5') || code.startsWith('6') || code.startsWith('14') || code.startsWith('2') || code.startsWith('1');
        const matchQ = !q || \`\${a.code} \${a.name}\`.toLowerCase().includes(q);
        return isAuxiliary && isCostOrExpense && matchQ;
      }).slice(0, 15);
    }`;

// 4. Also validate retention rules in save config
const targetSaveRules = `    cfg.accounting.withholding_rules = newRules;`;
const repSaveRules = `    for (const r of newRules) {
      if (r.account_code && !checkIsAuxiliary(r.account_code, \`cuenta de retención (\${r.concept})\`)) return;
    }
    cfg.accounting.withholding_rules = newRules;`;

if (!content.includes(targetDsItem)) { console.error('targetDsItem not found'); process.exit(1); }
if (!content.includes(targetRowSupplier)) { console.error('targetRowSupplier not found'); process.exit(1); }
if (!content.includes(targetFilterAccts)) { console.error('targetFilterAccts not found'); process.exit(1); }
if (!content.includes(targetSaveRules)) { console.error('targetSaveRules not found'); process.exit(1); }

content = content.replace(targetDsItem, repDsItem);
content = content.replace(targetRowSupplier, repRowSupplier);
content = content.replace(targetFilterAccts, repFilterAccts);
content = content.replace(targetSaveRules, repSaveRules);

fs.writeFileSync(path, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated doc-soporte.ts with complete Level 5 filtering and cost center table display.');

